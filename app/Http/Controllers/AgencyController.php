<?php

namespace App\Http\Controllers;

use App\Http\Requests\AgencyRegistrationRequest;
use App\Models\ActivityLog;
use App\Models\Agency;
use App\Models\Application;
use App\Models\Barangay;
use App\Models\HiringStatus;
use App\Models\Interview;
use App\Models\Job;
use App\Models\JobSeeker;
use App\Models\Skill;
use App\Models\User;
use App\Notifications\NotificationService;
use App\Services\AgencyApprovalService;
use App\Services\DashboardAnalyticsService;
use App\Services\ResumeService;
use App\Services\ResumeBuilderService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AgencyController extends Controller
{
    private function resolveAgencyForCurrentUser(): ?Agency
    {
        $userId = Auth::id();
        $userEmail = Auth::user()?->email;

        $agency = Agency::with('barangay')
            ->where('user_id', $userId)
            ->first();

        if ($agency) {
            return $agency;
        }

        if (!$userEmail) {
            return null;
        }

        $agencyByEmail = Agency::with('barangay')
            ->whereRaw('LOWER(email) = ?', [strtolower((string) $userEmail)])
            ->first();

        if ($agencyByEmail && $userId) {
            $agencyByEmail->update(['user_id' => $userId]);
            $agencyByEmail->refresh();
        }

        return $agencyByEmail;
    }

    public function registerCreate(): Response
    {
        return Inertia::render('Agency/AgencyRegister');
    }

    public function registerStore(AgencyRegistrationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            $user = User::create([
                'name' => $validated['agency_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'Agency',
            ]);

            Agency::create([
                'user_id' => $user->id,
                'agency_name' => $validated['agency_name'],
                'license_number' => $validated['license_number'] ?? null,
                'contact_person' => $validated['contact_person'],
                'email' => $validated['email'],
                'contact_number' => $validated['contact_number'],
                'address' => $validated['address'],
                'status' => AgencyApprovalService::STATUS_PENDING,
            ]);
        });

        return redirect()
            ->route('agency.login')
            ->with('status', 'Your registration has been received and is pending PESO approval. You will be able to sign in once your account is approved.');
    }

    public function loginCreate(): Response
    {
        return Inertia::render('Agency/AgencyLogin', [
            'status' => session('status'),
        ]);
    }

    public function loginStore(Request $request): RedirectResponse
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $remember = $request->boolean('remember');

        $loginCredentials = [
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'role' => 'Agency',
        ];

        // The password is checked first, without signing anyone in, so that an
        // account PESO has not approved never gets an authenticated session at
        // all. Doing it in this order also keeps the approval status from being
        // revealed to somebody who does not know the password.
        if (! Auth::validate($loginCredentials)) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $user = User::where('email', $credentials['email'])
            ->where('role', 'Agency')
            ->first();

        if ($user === null) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        if ($user->is_active === false) {
            return back()->withErrors([
                'email' => 'Your account has been deactivated. Please contact the administrator.',
            ])->onlyInput('email');
        }

        $blockReason = app(AgencyApprovalService::class)->blockReason(
            Agency::where('user_id', $user->id)->value('status')
        );

        if ($blockReason !== null) {
            return back()->withErrors([
                'email' => $blockReason,
            ])->onlyInput('email');
        }

        // Every gate above passed, so the account may now be signed in.
        if (Auth::attempt($loginCredentials, $remember)) {
            $request->session()->regenerate();

            $intended = $request->session()->pull('url.intended');
            $intendedPath = is_string($intended) ? (string) parse_url($intended, PHP_URL_PATH) : '';

            return redirect()->to(
                Str::startsWith($intendedPath, '/agency')
                    ? $intended
                    : route('agency.dashboard')
            );
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function dashboard(Request $request): Response
    {
        $agency = $this->resolveAgencyForCurrentUser();

        $statistics = [];
        $recentApplicants = [];
        $notifications = [];

        if ($agency) {
            $now = now();
            $applicationsQuery = Application::whereHas('job', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            });

            $totalJobs = Job::where('agency_id', $agency->id)->count();
            $activeJobsCount = Job::where('agency_id', $agency->id)
                ->whereIn('hiring_status', ['Open', 'Hiring'])->count();
            $totalApplicants = (clone $applicationsQuery)->count();

            $pending = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'pending');
                });
            })->count();

            $forInterview = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->whereIn('status_name', ['for interview', 'interview']);
                });
            })->count();

            $hired = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'hired');
                });
            })->count();

            $rejected = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'rejected');
                });
            })->count();

            $statistics = [
                'total_jobs' => $totalJobs,
                'active_jobs' => $activeJobsCount,
                'total_applicants' => $totalApplicants,
                'pending' => $pending,
                'for_interview' => $forInterview,
                'hired' => $hired,
                'rejected' => $rejected,
            ];

            $recentApplicants = (clone $applicationsQuery)
                ->with(['jobSeeker', 'job'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($application) {
                    $jobSeeker = $application->jobSeeker;
                    return [
                        'id' => $application->id,
                        'name' => $jobSeeker?->full_name ?? 'Unknown',
                        'jobTitle' => $application->job->job_title ?? 'Unknown Position',
                        'status' => $application->applicationStatus?->hiringStatus?->status_name ?? 'pending',
                        'appliedDate' => $application->created_at->format('Y-m-d'),
                    ];
                });

            $notifications = ActivityLog::where('user_id', Auth::id())
                ->orWhere(function ($q) use ($agency) {
                    $q->where('module', 'application')
                        ->where('metadata->agency_id', $agency->id);
                })
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(fn($log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'module' => $log->module,
                    'description' => $log->description,
                    'created_at' => $log->created_at->diffForHumans(),
                ]);
        }

        return Inertia::render('Agency/Dashboard', [
            'statistics' => $statistics,
            'recentApplicants' => $recentApplicants,
            'agency' => $agency,
            'notifications' => $notifications,
            'analytics' => app(DashboardAnalyticsService::class)->agencyAnalytics(
                $agency?->id,
                $request->query('period'),
            ),
        ]);
    }

    public function profile(): Response
    {
        $agency = $this->resolveAgencyForCurrentUser();
        $barangays = Barangay::all();

        return Inertia::render('Agency/Profile', [
            'agency' => $agency,
            'barangays' => $barangays,
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'agency_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'industry_category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'agency_type' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
        ]);

        $agency = $this->resolveAgencyForCurrentUser();

        if ($agency) {
            $agency->update($validated);
        } else {
            $agency = Agency::create([
                'user_id' => $user->id,
                'agency_name' => $validated['agency_name'],
                'contact_person' => $validated['contact_person'],
                'contact_number' => $validated['contact_number'] ?? null,
                'email' => $validated['email'],
                'address' => $validated['address'] ?? null,
                'barangay_id' => $validated['barangay_id'] ?? null,
                'city' => $validated['city'] ?? null,
                'province' => $validated['province'] ?? null,
                'industry_category' => $validated['industry_category'] ?? null,
                'description' => $validated['description'] ?? null,
                'agency_type' => $validated['agency_type'] ?? null,
                'license_number' => $validated['license_number'] ?? null,
                'status' => 'pending',
            ]);
        }

        $user->update([
            'name' => $validated['agency_name'],
            'email' => $validated['email'],
        ]);

        return back()->with('success', 'Profile saved successfully.');
    }

    public function jobs(): Response|RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $jobs = Job::where('agency_id', $agency->id)
            ->with(['skills', 'applications.jobSeeker', 'barangay'])
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $skills = Skill::orderBy('skill_name')->get();
        $barangays = Barangay::orderBy('barangay_name')->get();

        $members = JobSeeker::with(['barangay', 'skills'])
            ->where('agency_id', $agency->id)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($seeker) {
                return [
                    'id' => $seeker->id,
                    'full_name' => $seeker->full_name,
                    'email' => $seeker->email,
                    'contact_number' => $seeker->contact_number,
                    'photo_url' => $seeker->photo_url,
                    'sex' => $seeker->sex,
                    'birthdate' => $seeker->birthdate?->toDateString(),
                    'barangay' => $seeker->barangay ? ['barangay_name' => $seeker->barangay->barangay_name] : null,
                    'address' => $seeker->address,
                    'educational_background' => $seeker->educational_attainment,
                    'educational_attainment' => $seeker->educational_attainment,
                    'employment_status' => $seeker->employment_status,
                    'occupation' => $seeker->occupation,
                    'skills' => $seeker->skills ? $seeker->skills->pluck('skill_name')->all() : [],
                ];
            })
            ->values()
            ->all();

        $memberIds = collect($members)->pluck('id');

        $appliedJobIds = Application::whereIn('job_seeker_id', $memberIds)
            ->pluck('job_id')
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        return Inertia::render('Agency/JobVacancies', [
            'jobs' => $jobs,
            'agency' => $agency,
            'skills' => $skills,
            'barangays' => $barangays,
            'members' => $members,
            'appliedJobIds' => $appliedJobIds,
        ]);
    }

    public function storeJob(Request $request): RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return back()->with('error', 'Please complete your agency profile first.');
        }

        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'salary_range' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['exists:skills,id'],
            'educational_background' => ['nullable', 'string', 'max:255'],
            'work_arrangement' => ['nullable', 'string', 'max:255'],
            'vacant_positions' => ['nullable', 'integer', 'min:0'],
            'hiring_status' => ['nullable', 'string', 'max:255'],
            'salary_type' => ['nullable', 'string', 'max:255'],
            'min_salary' => ['nullable', 'numeric', 'min:0'],
            'max_salary' => ['nullable', 'numeric', 'min:0'],
            'salary_negotiable' => ['nullable', 'boolean'],
            'job_location' => ['nullable', 'string', 'max:255'],
            'required_education' => ['nullable', 'string', 'max:255'],
            'required_experience' => ['nullable', 'string', 'max:255'],
            'preferred_age' => ['nullable', 'string', 'max:255'],
            'gender_requirement' => ['nullable', 'string', 'max:255'],
            'certifications' => ['nullable', 'string'],
            'languages' => ['nullable', 'string'],
            'responsibilities' => ['nullable', 'string'],
            'qualifications' => ['nullable', 'string'],
            'benefits' => ['nullable', 'string'],
            'application_deadline' => ['nullable', 'date'],
            'course' => ['nullable', 'string', 'max:255'],
            'working_hours' => ['nullable', 'string', 'max:255'],
            'required_documents' => ['nullable', 'string'],
            'application_instructions' => ['nullable', 'string'],
        ]);

        $job = Job::create([
            'agency_id' => $agency->id,
            'barangay_id' => $validated['barangay_id'] ?? $agency->barangay_id,
            'job_title' => $validated['job_title'],
            'description' => $validated['description'] ?? $validated['job_title'],
            'salary_range' => $validated['salary_range'] ?? null,
            'employment_type' => $validated['employment_type'],
            'educational_background' => $validated['educational_background'],
            'work_arrangement' => $validated['work_arrangement'] ?? null,
            'vacant_positions' => $validated['vacant_positions'] ?? null,
            'hiring_status' => $validated['hiring_status'] ?? 'Open',
            'salary_type' => $validated['salary_type'] ?? null,
            'min_salary' => $validated['min_salary'] ?? null,
            'max_salary' => $validated['max_salary'] ?? null,
            'salary_negotiable' => $validated['salary_negotiable'] ?? false,
            'job_location' => $validated['job_location'] ?? null,
            'required_education' => $validated['required_education'] ?? null,
            'required_experience' => $validated['required_experience'] ?? null,
            'preferred_age' => $validated['preferred_age'] ?? null,
            'gender_requirement' => $validated['gender_requirement'] ?? null,
            'certifications' => $validated['certifications'] ?? null,
            'languages' => $validated['languages'] ?? null,
            'responsibilities' => $validated['responsibilities'] ?? null,
            'qualifications' => $validated['qualifications'] ?? null,
            'benefits' => $validated['benefits'] ?? null,
            'application_deadline' => $validated['application_deadline'] ?? null,
            'course' => $validated['course'] ?? null,
            'working_hours' => $validated['working_hours'] ?? null,
            'required_documents' => $validated['required_documents'] ?? null,
            'application_instructions' => $validated['application_instructions'] ?? null,
        ]);

        if (!empty($validated['skills'])) {
            $job->skills()->sync($validated['skills']);
        }

        return redirect()->route('agency.jobs')->with('success', 'Job posting created successfully.');
    }

    public function updateJob(Request $request, Job $job): RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || $job->agency_id !== $agency->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'salary_range' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['exists:skills,id'],
            'educational_background' => ['nullable', 'string', 'max:255'],
            'work_arrangement' => ['nullable', 'string', 'max:255'],
            'vacant_positions' => ['nullable', 'integer', 'min:0'],
            'hiring_status' => ['nullable', 'string', 'max:255'],
            'salary_type' => ['nullable', 'string', 'max:255'],
            'min_salary' => ['nullable', 'numeric', 'min:0'],
            'max_salary' => ['nullable', 'numeric', 'min:0'],
            'salary_negotiable' => ['nullable', 'boolean'],
            'job_location' => ['nullable', 'string', 'max:255'],
            'required_education' => ['nullable', 'string', 'max:255'],
            'required_experience' => ['nullable', 'string', 'max:255'],
            'preferred_age' => ['nullable', 'string', 'max:255'],
            'gender_requirement' => ['nullable', 'string', 'max:255'],
            'certifications' => ['nullable', 'string'],
            'languages' => ['nullable', 'string'],
            'responsibilities' => ['nullable', 'string'],
            'qualifications' => ['nullable', 'string'],
            'benefits' => ['nullable', 'string'],
            'application_deadline' => ['nullable', 'date'],
            'course' => ['nullable', 'string', 'max:255'],
            'working_hours' => ['nullable', 'string', 'max:255'],
            'required_documents' => ['nullable', 'string'],
            'application_instructions' => ['nullable', 'string'],
        ]);

        $job->update([
            'job_title' => $validated['job_title'],
            'description' => $validated['description'] ?? $job->description,
            'salary_range' => $validated['salary_range'] ?? null,
            'employment_type' => $validated['employment_type'],
            'barangay_id' => $validated['barangay_id'] ?? $job->barangay_id,
            'educational_background' => $validated['educational_background'] ?? $job->educational_background,
            'work_arrangement' => $validated['work_arrangement'] ?? null,
            'vacant_positions' => $validated['vacant_positions'] ?? null,
            'hiring_status' => $validated['hiring_status'] ?? $job->hiring_status,
            'salary_type' => $validated['salary_type'] ?? null,
            'min_salary' => $validated['min_salary'] ?? null,
            'max_salary' => $validated['max_salary'] ?? null,
            'salary_negotiable' => $validated['salary_negotiable'] ?? false,
            'job_location' => $validated['job_location'] ?? null,
            'required_education' => $validated['required_education'] ?? null,
            'required_experience' => $validated['required_experience'] ?? null,
            'preferred_age' => $validated['preferred_age'] ?? null,
            'gender_requirement' => $validated['gender_requirement'] ?? null,
            'certifications' => $validated['certifications'] ?? null,
            'languages' => $validated['languages'] ?? null,
            'responsibilities' => $validated['responsibilities'] ?? null,
            'qualifications' => $validated['qualifications'] ?? null,
            'benefits' => $validated['benefits'] ?? null,
            'application_deadline' => $validated['application_deadline'] ?? null,
            'course' => $validated['course'] ?? null,
            'working_hours' => $validated['working_hours'] ?? null,
            'required_documents' => $validated['required_documents'] ?? null,
            'application_instructions' => $validated['application_instructions'] ?? null,
        ]);

        if (isset($validated['skills'])) {
            $job->skills()->sync($validated['skills'] ?? []);
        }

        return back()->with('success', 'Job posting updated successfully.');
    }

    public function deleteJob(Job $job): RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || $job->agency_id !== $agency->id) {
            abort(403, 'Unauthorized action.');
        }

        $job->delete();

        return back()->with('success', 'Job posting deleted successfully.');
    }

    public function applyJob(Request $request, Job $job)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Please complete your agency profile first.'], 400)
                : back()->with('error', 'Please complete your agency profile first.');
        }

        if ($job->agency_id !== $agency->id) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Unauthorized action.'], 403)
                : abort(403, 'Unauthorized action.');
        }

        $isActiveVacancy = in_array($job->hiring_status, ['Open', 'Hiring']);
        if ($job->application_deadline && now()->startOfDay()->gt(\Carbon\Carbon::parse($job->application_deadline)->startOfDay())) {
            $isActiveVacancy = false;
        }

        if (!$isActiveVacancy) {
            return $request->expectsJson()
                ? response()->json(['message' => 'This vacancy is not accepting applications.'], 409)
                : back()->with('error', 'This vacancy is not accepting applications.');
        }

        $memberId = $request->input('member_id');

        if ($memberId) {
            $jobSeeker = JobSeeker::where('id', $memberId)
                ->where('agency_id', $agency->id)
                ->first();

            if (!$jobSeeker) {
                return $request->expectsJson()
                    ? response()->json(['message' => 'Selected member is not registered under your agency.'], 422)
                    : back()->with('error', 'Selected member is not registered under your agency.');
            }
        } else {
            $jobSeeker = JobSeeker::where('user_id', Auth::id())->first();

            if (!$jobSeeker) {
                return $request->expectsJson()
                    ? response()->json(['message' => 'Please complete your job seeker/member profile first.'], 400)
                    : back()->with('error', 'Please complete your job seeker/member profile first.');
            }
        }

        $existingApplication = Application::where('job_seeker_id', $jobSeeker->id)
            ->where('job_id', $job->id)
            ->first();

        if ($existingApplication) {
            return $request->expectsJson()
                ? response()->json(['message' => 'This member has already applied for this position.', 'already_applied' => true], 409)
                : back()->with('error', 'This member has already applied for this position.');
        }

        $application = Application::create([
            'job_seeker_id' => $jobSeeker->id,
            'agency_id' => $agency->id,
            'submitted_by' => Auth::id(),
            'job_id' => $job->id,
            'establishment_id' => $job->establishment_id,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        $hiringStatus = HiringStatus::where('status_name', 'pending')->first();
        if (!$hiringStatus) {
            $hiringStatus = HiringStatus::create(['status_name' => 'pending']);
        }

        \App\Models\ApplicationStatus::create([
            'application_id' => $application->id,
            'status_id' => $hiringStatus->id,
        ]);

        try {
            NotificationService::sendNewApplication($application);
        } catch (\Exception $e) {
            // Non-critical
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Application submitted successfully.',
                'application' => $application->load('job'),
            ], 201);
        }

        return back()->with('success', 'Application submitted successfully.');
    }

    public function updateJobStatus(Request $request, Job $job)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || $job->agency_id !== $agency->id) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized action.'], 403);
            }
            abort(403, 'Unauthorized action.');
        }

        try {
            $validated = $request->validate([
                'status' => ['required', 'in:Open,Hiring,Closed,Filled'],
            ]);

            $job->update(['hiring_status' => $validated['status']]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Hiring status updated successfully.',
                    'hiring_status' => $job->fresh()->hiring_status,
                ]);
            }

            return back()->with('success', 'Job status updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Invalid status value.'], 422);
            }
            throw $e;
        } catch (\Exception $e) {
            Log::error('Failed to update job hiring status: ' . $e->getMessage());

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Failed to update hiring status.'], 500);
            }

            return back()->with('error', 'Failed to update hiring status.');
        }
    }

    public function applicants(): Response|RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $applications = Application::with(['jobSeeker.user', 'jobSeeker.barangay', 'jobSeeker.resume', 'job', 'job.agency', 'applicationStatus.hiringStatus', 'interview'])
            ->whereHas('job', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->through(function ($app) {
                $resumeUrl = null;
                if ($app->resume && Storage::disk('public')->exists($app->resume)) {
                    $resumeUrl = Storage::disk('public')->url($app->resume);
                } elseif ($app->jobSeeker && $app->jobSeeker->resume && $app->jobSeeker->resume->file_path) {
                    if (Storage::disk('public')->exists($app->jobSeeker->resume->file_path)) {
                        $resumeUrl = Storage::disk('public')->url($app->jobSeeker->resume->file_path);
                    }
                }
                $app->resume_url = $resumeUrl;
                return $app;
            });

        $applications->getCollection()->transform(function ($app) {
            if ($app->jobSeeker) {
                $app->setAttribute('seeker_profile', $app->jobSeeker->toArray());
            }
            return $app;
        });

        $baseQuery = Application::whereHas('job', function ($query) use ($agency) {
            $query->where('agency_id', $agency->id);
        });

        $statistics = [
            'total' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'pending');
                });
            })->count(),
            'reviewed' => (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'reviewed');
                });
            })->count(),
            'interview_scheduled' => (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'interview');
                });
            })->count(),
            'hired' => (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'hired');
                });
            })->count(),
            'rejected' => (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'rejected');
                });
            })->count(),
        ];

        $jobs = Job::where('agency_id', $agency->id)
            ->orderBy('job_title')
            ->get();

        return Inertia::render('Agency/Applicants', [
            'applications' => $applications,
            'agency' => $agency,
            'statistics' => $statistics,
            'jobs' => $jobs,
        ]);
    }

    public function members(): Response|RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $applications = Application::with(['jobSeeker.user', 'jobSeeker.barangay', 'jobSeeker.resume', 'job', 'applicationStatus.hiringStatus'])
            ->whereHas('job', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $activeStatuses = ['pending', 'for review', 'for interview', 'interview', 'interviewed'];

        $appSeekerIds = $applications->pluck('job_seeker_id');
        $directIds = JobSeeker::where('agency_id', $agency->id)->pluck('id');
        $seekerIds = $appSeekerIds->merge($directIds)->unique()->values();

        $seekers = JobSeeker::with(['user', 'barangay', 'resume'])
            ->whereIn('id', $seekerIds)
            ->get();

        $members = [];

        foreach ($seekers as $seeker) {
            $app = $applications->firstWhere('job_seeker_id', $seeker->id);
            $status = $app
                ? ($app->applicationStatus?->hiringStatus?->status_name ?? $app->status ?? 'pending')
                : 'pending';
            $isActive = $seeker->user?->is_active ?? true;

            $members[] = [
                'id' => $seeker->id,
                'full_name' => $seeker->full_name ?: 'Unknown',
                'email' => $seeker->email ?? $seeker->user?->email ?? '',
                'contact_number' => $seeker->contact_number ?? '',
                'age' => $seeker->age ?? null,
                'sex' => $seeker->sex ?? null,
                'birthdate' => $seeker->birthdate?->toDateString() ?? null,
                'employment_status' => $seeker->employment_status ?? null,
                'occupation' => $seeker->occupation ?? null,
                'address' => $seeker->address ?? '',
                'barangay' => $seeker->barangay?->barangay_name ?? '',
                'barangay_id' => $seeker->barangay_id ?? null,
                'education' => $seeker->educational_attainment ?? '',
                'experience' => $seeker->work_experience_years ? $seeker->work_experience_years . ' year(s)' : '',
                'work_experience' => $seeker->remarks ?? '',
                'skills' => $seeker->skills?->pluck('skill_name') ?? [],
                'photo_url' => $seeker->photo_url ?? null,
                'resume_url' => null,
                'latest_application' => $app ? [
                    'id' => $app->id,
                    'job_title' => $app->job?->job_title ?? 'Unknown',
                    'status' => $status,
                    'applied_date' => $app->created_at->format('Y-m-d'),
                ] : null,
                'assigned_job_id' => $app ? $app->job_id : null,
                'total_applications' => $applications->where('job_seeker_id', $seeker->id)->count(),
                'is_active' => $isActive,
                '_sort_key' => $app ? $app->created_at->timestamp : $seeker->created_at?->timestamp ?? 0,
            ];
        }

        usort($members, fn($a, $b) => $b['_sort_key'] <=> $a['_sort_key']);
        $members = array_map(function ($m) {
            unset($m['_sort_key']);
            return $m;
        }, $members);

        $activeMembers = collect($members)->where('is_active', true)->values();
        $inactiveMembers = collect($members)->where('is_active', false)->values();

        $statistics = [
            'total' => count($members),
            'active' => $activeMembers->count(),
            'inactive' => $inactiveMembers->count(),
        ];

        $jobs = Job::where('agency_id', $agency->id)
            ->orderBy('job_title')
            ->get()
            ->map(fn($job) => ['id' => $job->id, 'job_title' => $job->job_title]);

        $barangays = Barangay::orderBy('barangay_name')->get();

        return Inertia::render('Agency/Members', [
            'activeMembers' => $activeMembers,
            'inactiveMembers' => $inactiveMembers,
            'statistics' => $statistics,
            'agency' => $agency,
            'jobs' => $jobs,
            'barangays' => $barangays,
        ]);
    }

    public function storeMember(Request $request): RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return back()->with('error', 'Please complete your agency profile first.');
        }

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'sex' => ['nullable', 'string', 'in:Male,Female,Prefer not to say,Other'],
            'birthdate' => ['nullable', 'date'],
            'employment_status' => ['nullable', 'string', 'in:Employed,Unemployed,Self-Employed,Underemployed'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'educational_attainment' => ['nullable', 'string', 'max:255'],
            'work_experience' => ['nullable', 'string'],
            'job_id' => ['nullable', 'exists:job,id'],
        ]);

        $user = \App\Models\User::where('email', $validated['email'])->first();

        if (!$user) {
            $user = \App\Models\User::create([
                'name' => $validated['full_name'],
                'email' => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'job_seeker',
            ]);
        }

        $jobSeeker = \App\Models\JobSeeker::where('user_id', $user->id)->first();

        $nameParts = preg_split('/\s+/', trim($validated['full_name']));
        $lastName = (string) array_pop($nameParts);
        $firstName = implode(' ', $nameParts);
        if ($firstName === '') {
            $firstName = $lastName;
            $lastName = '';
        }

        $barangay = !empty($validated['barangay_id'])
            ? Barangay::find($validated['barangay_id'])
            : null;

        $addressValue = $validated['address'] ?? null;
        if (!$addressValue && $barangay) {
            $addressValue = $barangay->barangay_name;
        }

        $seekerData = [
            'user_id' => $user->id,
            'agency_id' => $agency->id,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'] ?? null,
            'age' => $validated['age'] ?? null,
            'sex' => $validated['sex'] ?? null,
            'birthdate' => $validated['birthdate'] ?? null,
            'employment_status' => $validated['employment_status'] ?? null,
            'occupation' => $validated['occupation'] ?? null,
            'address' => $addressValue,
            'barangay_id' => $validated['barangay_id'] ?? null,
            'educational_attainment' => $validated['educational_attainment'] ?? null,
            'remarks' => $validated['work_experience'] ?? null,
        ];

        if (!$jobSeeker) {
            $jobSeeker = \App\Models\JobSeeker::create($seekerData);
        } else {
            $jobSeeker->update($seekerData);
        }

        if (!empty($validated['job_id'])) {
            $existingApplication = Application::where('job_id', $validated['job_id'])
                ->where('job_seeker_id', $jobSeeker->id)
                ->first();

            if (!$existingApplication) {
                $hiringStatus = HiringStatus::where('status_name', 'pending')->first();
                if (!$hiringStatus) {
                    $hiringStatus = HiringStatus::create(['status_name' => 'pending']);
                }

                $application = Application::create([
                    'job_id' => $validated['job_id'],
                    'job_seeker_id' => $jobSeeker->id,
                    'agency_id' => $agency->id,
                    'status' => 'pending',
                ]);

                \App\Models\ApplicationStatus::create([
                    'application_id' => $application->id,
                    'status_id' => $hiringStatus->id,
                ]);
            }
        }

        return back()->with('success', 'Member added successfully.');
    }

    public function updateMember(Request $request, JobSeeker $jobSeeker): RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return back()->with('error', 'Please complete your agency profile first.');
        }

        if (!$this->isAgencyMember($agency, $jobSeeker)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'sex' => ['nullable', 'string', 'in:Male,Female,Prefer not to say,Other'],
            'birthdate' => ['nullable', 'date'],
            'employment_status' => ['nullable', 'string', 'in:Employed,Unemployed,Self-Employed,Underemployed'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'educational_attainment' => ['nullable', 'string', 'max:255'],
            'work_experience' => ['nullable', 'string'],
            'job_id' => ['nullable', 'exists:job,id'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $jobSeeker->user;

        if ($user) {
            $user->update([
                'name' => $validated['full_name'],
                'email' => $validated['email'],
            ]);
        }

        $nameParts = preg_split('/\s+/', trim($validated['full_name']));
        $lastName = (string) array_pop($nameParts);
        $firstName = implode(' ', $nameParts);
        if ($firstName === '') {
            $firstName = $lastName;
            $lastName = '';
        }

        $barangay = !empty($validated['barangay_id'])
            ? Barangay::find($validated['barangay_id'])
            : null;

        $addressValue = $validated['address'] ?? null;
        if (!$addressValue && $barangay) {
            $addressValue = $barangay->barangay_name;
        }

        $updateData = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'] ?? null,
            'age' => $validated['age'] ?? null,
            'sex' => $validated['sex'] ?? null,
            'birthdate' => $validated['birthdate'] ?? null,
            'employment_status' => $validated['employment_status'] ?? null,
            'occupation' => $validated['occupation'] ?? null,
            'address' => $addressValue,
            'barangay_id' => $validated['barangay_id'] ?? null,
            'educational_attainment' => $validated['educational_attainment'] ?? null,
            'remarks' => $validated['work_experience'] ?? null,
        ];

        if ($request->hasFile('photo')) {
            if ($jobSeeker->photo_url) {
                Storage::disk('public')->delete($jobSeeker->photo_url);
            }
            $updateData['photo_url'] = $request->file('photo')->store('job-seekers/photos', 'public');
        }

        $jobSeeker->update($updateData);

        // Auto-sync existing MemberResume content if present
        $memberResume = \App\Models\MemberResume::where('job_seeker_id', $jobSeeker->id)->first();
        if ($memberResume && is_array($memberResume->content)) {
            $c = $memberResume->content;
            $c['full_name'] = $validated['full_name'];
            $c['email'] = $validated['email'];
            if (!empty($validated['contact_number'])) $c['contact_number'] = $validated['contact_number'];
            if (!empty($addressValue)) $c['address'] = $addressValue;
            if ($barangay) $c['barangay'] = $barangay->barangay_name;
            if (!empty($validated['birthdate'])) $c['birthdate'] = $validated['birthdate'];
            if (!empty($validated['sex'])) $c['sex'] = $validated['sex'];
            if (!empty($validated['civil_status'])) $c['civil_status'] = $validated['civil_status'];
            if (!empty($validated['occupation'])) $c['professional_title'] = $validated['occupation'];
            if (!empty($validated['educational_attainment'])) {
                $eduList = $c['educational_background'] ?? [];
                if (empty($eduList)) {
                    $eduList[] = ['level' => $validated['educational_attainment'], 'school' => '', 'year' => ''];
                } else {
                    $eduList[0]['level'] = $validated['educational_attainment'];
                }
                $c['educational_background'] = $eduList;
            }
            if (!empty($validated['work_experience'])) {
                $expList = $c['work_experience'] ?? [];
                if (empty($expList)) {
                    $expList[] = ['position' => $validated['occupation'] ?? 'Experience', 'company' => '', 'years' => $validated['work_experience']];
                }
                $c['work_experience'] = $expList;
            }
            $memberResume->update(['content' => $c]);
        }

        if (!empty($validated['job_id'])) {
            $existingApplication = Application::where('job_id', $validated['job_id'])
                ->where('job_seeker_id', $jobSeeker->id)
                ->first();

            if (!$existingApplication) {
                $hiringStatus = HiringStatus::where('status_name', 'pending')->first();
                if (!$hiringStatus) {
                    $hiringStatus = HiringStatus::create(['status_name' => 'pending']);
                }

                $application = Application::create([
                    'job_id' => $validated['job_id'],
                    'job_seeker_id' => $jobSeeker->id,
                    'agency_id' => $agency->id,
                    'status' => 'pending',
                ]);

                \App\Models\ApplicationStatus::create([
                    'application_id' => $application->id,
                    'status_id' => $hiringStatus->id,
                ]);
            }
        }

        return back()->with('success', 'Member and resume updated successfully.');
    }

    private function isAgencyMember(Agency $agency, JobSeeker $jobSeeker): bool
    {
        if ($jobSeeker->agency_id === $agency->id) {
            return true;
        }

        return Application::where('job_seeker_id', $jobSeeker->id)
            ->whereHas('job', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
            ->exists();
    }

    public function updateMemberStatus(Request $request, JobSeeker $jobSeeker)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return back()->with('error', 'Please complete your agency profile first.');
        }

        if (!$this->isAgencyMember($agency, $jobSeeker)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user = $jobSeeker->user;

        if (!$user) {
            return back()->with('error', 'Member account not found.');
        }

        $user->update(['is_active' => $validated['is_active']]);

        return back()->with('success', $validated['is_active']
            ? 'Member account enabled successfully.'
            : 'Member account disabled successfully.');
    }

    public function memberResumeDownload(JobSeeker $jobSeeker)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return response()->json(['error' => 'Please complete your agency profile first.'], 400);
        }

        if (!$this->isAgencyMember($agency, $jobSeeker)) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $jobSeeker->load(['user', 'barangay']);

        try {
            $builder = app(ResumeBuilderService::class);
            $pdf = $builder->renderPdf($jobSeeker);

            $fileName = preg_replace('/[^A-Za-z0-9 _-]/', '', $jobSeeker->full_name ?? 'Member');
            $fileName = ((string) trim($fileName) !== '' ? $fileName : 'Member') . '_Resume.pdf';

            return $pdf->download($fileName);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Resume generation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Resume builder for a single agency member.
     */
    public function memberResumeBuilder(JobSeeker $jobSeeker)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return back()->with('error', 'Please complete your agency profile first.');
        }

        if (!$this->isAgencyMember($agency, $jobSeeker)) {
            abort(403, 'Unauthorized action.');
        }

        $jobSeeker->load(['user', 'barangay']);

        $builder = app(ResumeBuilderService::class);
        $record = $builder->findRecord($jobSeeker);
        $template = $builder->resolveTemplate($jobSeeker);
        $content = $builder->buildContent($jobSeeker);
        $design = $builder->normaliseDesignOptions($record?->design_options);

        $templates = [];
        foreach (ResumeService::TEMPLATES as $key => $label) {
            $templates[] = ['key' => $key, 'label' => $label];
        }

        return Inertia::render('Agency/MemberResumeBuilder', [
            'agency' => $agency,
            'member' => [
                'id' => $jobSeeker->id,
                'full_name' => $jobSeeker->full_name,
                'email' => $jobSeeker->email,
                'photo_url' => $jobSeeker->photo_url,
            ],
            'templates' => $templates,
            'selectedTemplate' => $template,
            'content' => $content,
            'design' => $design,
            'designOptions' => [
                'accentColors' => ResumeBuilderService::ACCENT_COLORS,
                'fonts' => ResumeBuilderService::FONT_OPTIONS,
                'fontSizes' => ResumeBuilderService::FONT_SIZES,
                'lineSpacings' => ResumeBuilderService::LINE_SPACINGS,
                'sections' => ResumeBuilderService::SECTION_LABELS,
            ],
            'hasSavedResume' => (bool) $record,
            'savedAt' => $record?->updated_at?->format('M d, Y g:i A'),
        ]);
    }

    /**
     * Render a live preview without persisting anything.
     */
    public function memberResumeLivePreview(Request $request, JobSeeker $jobSeeker)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || !$this->isAgencyMember($agency, $jobSeeker)) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $jobSeeker->load(['user', 'barangay']);

        $validated = $request->validate([
            'template' => ['nullable', 'string'],
            'content' => ['nullable', 'array'],
            'design' => ['nullable', 'array'],
        ]);

        try {
            $builder = app(ResumeBuilderService::class);

            $html = $builder->renderHtml(
                $jobSeeker,
                $validated['template'] ?? null,
                $validated['content'] ?? null,
                $validated['design'] ?? null,
            );

            return response()->json(['html' => $html]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Preview generation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Persist the member's template, content and design customisations.
     */
    public function saveMemberResume(Request $request, JobSeeker $jobSeeker)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return back()->with('error', 'Please complete your agency profile first.');
        }

        if (!$this->isAgencyMember($agency, $jobSeeker)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'template' => ['required', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
            'content' => ['required', 'array'],
            'design' => ['required', 'array'],
        ]);

        $jobSeeker->load(['user', 'barangay']);

        try {
            $builder = app(ResumeBuilderService::class);

            $record = $builder->persist(
                $jobSeeker,
                $agency->id,
                $request->user()?->id,
                $validated['template'],
                $validated['content'],
                $validated['design'],
            );

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Resume saved successfully.',
                    'saved_at' => $record->updated_at->format('M d, Y g:i A'),
                ]);
            }

            return back()->with('success', 'Resume saved successfully.');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Unable to save resume: ' . $e->getMessage(),
                ], 500);
            }

            return back()->with('error', 'Unable to save resume: ' . $e->getMessage());
        }
    }

    /**
     * Upload or clear the member's resume profile photo.
     */
    public function updateMemberResumePhoto(Request $request, JobSeeker $jobSeeker)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || !$this->isAgencyMember($agency, $jobSeeker)) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($jobSeeker->photo_url) {
            Storage::disk('public')->delete($jobSeeker->photo_url);
        }

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('job-seekers/photos', 'public');
            $jobSeeker->forceFill(['photo_url' => $path])->save();

            return response()->json(['photo_url' => $path]);
        }

        $jobSeeker->forceFill(['photo_url' => null])->save();

        return response()->json(['photo_url' => null]);
    }

    public function hiringStatus(): Response|RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $applications = Application::with(['jobSeeker.user', 'job', 'applicationStatus.hiringStatus', 'interview'])
            ->whereHas('job', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($app) {
                $seeker = $app->jobSeeker;
                return [
                    'id' => $app->id,
                    'applicant_name' => $seeker?->full_name ?? 'Unknown',
                    'email' => $seeker?->email ?? $seeker?->user?->email ?? '',
                    'contact_number' => $seeker?->contact_number ?? '',
                    'photo_url' => $seeker?->photo_url ?? null,
                    'job_title' => $app->job?->job_title ?? 'Unknown',
                    'job_id' => $app->job_id,
                    'applied_date' => $app->applied_at?->format('Y-m-d') ?? $app->created_at->format('Y-m-d'),
                    'status' => $app->applicationStatus?->hiringStatus?->status_name ?? $app->status ?? 'pending',
                    'remarks' => $app->remarks ?? '',
                ];
            });

        $statusCounts = $applications->groupBy('status')->map(fn($group) => $group->count())->toArray();

        $statistics = [
            'total' => $applications->count(),
            'pending' => $statusCounts['pending'] ?? 0,
            'for_interview' => ($statusCounts['for interview'] ?? 0) + ($statusCounts['interview'] ?? 0) + ($statusCounts['interview_scheduled'] ?? 0),
            'interviewed' => $statusCounts['interviewed'] ?? 0,
            'hired' => $statusCounts['hired'] ?? 0,
            'rejected' => $statusCounts['rejected'] ?? 0,
        ];

        $jobs = Job::where('agency_id', $agency->id)
            ->orderBy('job_title')
            ->get()
            ->map(fn($job) => ['id' => $job->id, 'job_title' => $job->job_title]);

        return Inertia::render('Agency/HiringStatus', [
            'applications' => $applications,
            'agency' => $agency,
            'statistics' => $statistics,
            'jobs' => $jobs,
        ]);
    }

    public function reports(Request $request): Response|RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $now = now();
        $todayStart = $now->copy()->startOfDay();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $baseQuery = Application::whereHas('job', function ($query) use ($agency) {
            $query->where('agency_id', $agency->id);
        });

        $lastMonthQuery = Application::whereHas('job', function ($query) use ($agency) {
            $query->where('agency_id', $agency->id);
        })->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd]);

        $totalJobs = Job::where('agency_id', $agency->id)->count();
        $activeJobs = Job::where('agency_id', $agency->id)
            ->whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $closedJobs = $totalJobs - $activeJobs;

        $totalApplications = (clone $baseQuery)->count();
        $newToday = (clone $baseQuery)->whereDate('created_at', $todayStart)->count();

        $sc = fn($s) => (clone $baseQuery)->whereHas('applicationStatus', function ($q) use ($s) {
            $q->whereHas('hiringStatus', function ($hq) use ($s) {
                $hq->where('status_name', $s);
            });
        })->count();

        $pending = $sc('pending');
        $forReview = $sc('for review');
        $forInterview = (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) {
                $hq->whereIn('status_name', ['for interview', 'interview']);
            });
        })->count();
        $hired = $sc('hired');
        $rejected = $sc('rejected');

        $totalVacancies = Job::where('agency_id', $agency->id)->sum('vacant_positions') ?: 0;
        $activePositions = Job::where('agency_id', $agency->id)
            ->whereIn('hiring_status', ['Open', 'Hiring'])->sum('vacant_positions') ?: 0;
        $fillRate = $totalVacancies > 0 ? round((($totalVacancies - $activePositions) / $totalVacancies) * 100) : 0;

        $pct = fn($c, $p) => $p > 0 ? round((($c - $p) / $p) * 100) : ($c > 0 ? 100 : 0);

        $lastMonthTotal = (clone $lastMonthQuery)->count();
        $pendingLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) { $hq->where('status_name', 'pending'); });
        })->count();
        $hiredLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) { $hq->where('status_name', 'hired'); });
        })->count();
        $rejectedLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) { $hq->where('status_name', 'rejected'); });
        })->count();

        $statistics = [
            'active_jobs' => $activeJobs,
            'closed_jobs' => $closedJobs,
            'total_applications' => $totalApplications,
            'new_applicants_today' => $newToday,
            'pending' => $pending,
            'for_review' => $forReview,
            'for_interview' => $forInterview,
            'hired' => $hired,
            'rejected' => $rejected,
            'fill_rate' => $fillRate,
            'changes' => [
                'total_applications' => $pct($totalApplications, $lastMonthTotal),
                'pending' => $pct($pending, $pendingLastMonth),
                'hired' => $pct($hired, $hiredLastMonth),
                'rejected' => $pct($rejected, $rejectedLastMonth),
            ],
        ];

        $monthlyApplications = (clone $baseQuery)
            ->selectRaw('MONTH(created_at) as m, YEAR(created_at) as y, COUNT(*) as count')
            ->whereYear('created_at', $now->year)
            ->groupBy('y', 'm')
            ->orderBy('y')
            ->orderBy('m')
            ->get()
            ->map(fn($item) => ['month' => (int)$item->m, 'count' => (int)$item->count]);

        $applicationsByStatus = [
            ['name' => 'Pending', 'value' => $pending, 'color' => '#f59e0b'],
            ['name' => 'Under Review', 'value' => $forReview, 'color' => '#3b82f6'],
            ['name' => 'Interview', 'value' => $forInterview, 'color' => '#8b5cf6'],
            ['name' => 'Hired', 'value' => $hired, 'color' => '#10b981'],
            ['name' => 'Rejected', 'value' => $rejected, 'color' => '#ef4444'],
        ];

        $jobModels = Job::where('agency_id', $agency->id)
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        $applicationsPerJob = $jobModels->map(fn($job) => [
            'title' => $job->job_title,
            'applications' => $job->applications_count,
        ]);

        $jobPerformance = $jobModels->map(function ($job) {
            $aq = Application::where('job_id', $job->id);
            $interviewed = (clone $aq)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->whereIn('status_name', ['for interview', 'interview']);
                });
            })->count();
            $hiredCount = (clone $aq)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) { $hq->where('status_name', 'hired'); });
            })->count();
            $rejectedCount = (clone $aq)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) { $hq->where('status_name', 'rejected'); });
            })->count();
            return [
                'id' => $job->id,
                'title' => $job->job_title,
                'employment_type' => $job->employment_type,
                'applicants' => $job->applications_count,
                'interviewed' => $interviewed,
                'hired' => $hiredCount,
                'rejected' => $rejectedCount,
                'vacancies' => $job->vacant_positions,
                'status' => $job->hiring_status,
            ];
        });

        $successRate = $totalApplications > 0 ? round(($hired / $totalApplications) * 100) : 0;

        return Inertia::render('Agency/Reports', [
            'agency' => $agency,
            'statistics' => $statistics,
            'monthlyApplications' => $monthlyApplications,
            'applicationsByStatus' => $applicationsByStatus,
            'applicationsPerJob' => $applicationsPerJob,
            'jobs' => $jobPerformance,
            'hiringMetrics' => [
                'avg_hiring_days' => 0,
                'total_hired' => $hired,
                'success_rate' => $successRate,
            ],
            'filters' => $request->only(['search', 'status', 'type', 'date_from', 'date_to']),
        ]);
    }

    public function exportReport(Request $request)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $now = now();

        $baseQuery = Application::whereHas('job', function ($query) use ($agency) {
            $query->where('agency_id', $agency->id);
        });

        $totalJobs = Job::where('agency_id', $agency->id)->count();
        $activeJobs = Job::where('agency_id', $agency->id)
            ->whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $closedJobs = $totalJobs - $activeJobs;

        $totalApplications = (clone $baseQuery)->count();

        $sc = fn($s) => (clone $baseQuery)->whereHas('applicationStatus', function ($q) use ($s) {
            $q->whereHas('hiringStatus', function ($hq) use ($s) {
                $hq->where('status_name', $s);
            });
        })->count();

        $pending = $sc('pending');
        $forReview = $sc('for review');
        $forInterview = (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) {
                $hq->whereIn('status_name', ['for interview', 'interview']);
            });
        })->count();
        $hired = $sc('hired');
        $rejected = $sc('rejected');

        $totalVacancies = Job::where('agency_id', $agency->id)->sum('vacant_positions') ?: 0;
        $activePositions = Job::where('agency_id', $agency->id)
            ->whereIn('hiring_status', ['Open', 'Hiring'])->sum('vacant_positions') ?: 0;
        $fillRate = $totalVacancies > 0 ? round((($totalVacancies - $activePositions) / $totalVacancies) * 100) : 0;
        $successRate = $totalApplications > 0 ? round(($hired / $totalApplications) * 100) : 0;

        $members = Application::with(['jobSeeker.barangay', 'job', 'applicationStatus.hiringStatus'])
            ->whereHas('job', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($app) {
                return [
                    'name' => $app->jobSeeker?->full_name ?? 'Unknown',
                    'email' => $app->jobSeeker?->email ?? $app->jobSeeker?->user?->email ?? '',
                    'contact_number' => $app->jobSeeker?->contact_number ?? '',
                    'barangay' => $app->jobSeeker?->barangay?->barangay_name ?? '',
                    'job_title' => $app->job?->job_title ?? 'Unknown',
                    'status' => ucfirst($app->applicationStatus?->hiringStatus?->status_name ?? $app->status ?? 'pending'),
                    'applied_date' => $app->created_at->format('Y-m-d'),
                ];
            });

        $jobPerformance = Job::where('agency_id', $agency->id)
            ->withCount('applications')
            ->orderBy('job_title')
            ->get()
            ->map(function ($job) {
                $aq = Application::where('job_id', $job->id);
                $hiredCount = (clone $aq)->whereHas('applicationStatus', function ($q) {
                    $q->whereHas('hiringStatus', function ($hq) {
                        $hq->where('status_name', 'hired');
                    });
                })->count();
                return [
                    'title' => $job->job_title,
                    'applicants' => $job->applications_count,
                    'hired' => $hiredCount,
                    'vacancies' => $job->vacant_positions,
                    'status' => $job->hiring_status,
                ];
            });

        $data = [
            'agency' => $agency,
            'statistics' => [
                'total_jobs' => $totalJobs,
                'active_jobs' => $activeJobs,
                'closed_jobs' => $closedJobs,
                'total_applications' => $totalApplications,
                'pending' => $pending,
                'for_review' => $forReview,
                'for_interview' => $forInterview,
                'hired' => $hired,
                'rejected' => $rejected,
                'fill_rate' => $fillRate,
                'success_rate' => $successRate,
            ],
            'members' => $members,
            'job_performance' => $jobPerformance,
            'generated_at' => $now->format('F d, Y h:i A'),
            'prepared_by' => Auth::user()?->name ?? 'Agency',
        ];

        $pdf = Pdf::loadView('pdfs.agency-report', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('agency-report-' . $now->format('Y-m-d') . '.pdf');
    }

    public function notifications(): Response|RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $user = Auth::user();

        $notifications = \Illuminate\Support\Facades\DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notif) {
                $data = $notif->data ? json_decode($notif->data, true) : [];
                return [
                    'id' => $notif->id,
                    'type' => $notif->type,
                    'title' => $data['title'] ?? $notif->type,
                    'message' => $data['message'] ?? '',
                    'data' => $data,
                    'created_at' => $notif->created_at,
                    'read' => $notif->read_at !== null,
                ];
            });

        $unreadCount = \Illuminate\Support\Facades\DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Agency/Notifications', [
            'agency' => $agency,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function settings(): Response|RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency) {
            return redirect()->route('agency.profile')->with('error', 'Please complete your agency profile first.');
        }

        $user = Auth::user();
        $barangays = Barangay::orderBy('barangay_name')->get();

        return Inertia::render('Agency/Settings', [
            'agency' => $agency,
            'user' => $user,
            'barangays' => $barangays,
        ]);
    }

    public function updateApplication(Request $request, Application $application): RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || $application->job->agency_id !== $agency->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string'],
            'remarks' => ['nullable', 'string'],
        ]);

        $hiringStatus = HiringStatus::where('status_name', $validated['status'])->first();

        if (!$hiringStatus) {
            $hiringStatus = HiringStatus::create(['status_name' => $validated['status']]);
        }

        $applicationStatus = $application->applicationStatus ?? new \App\Models\ApplicationStatus();
        $applicationStatus->application_id = $application->id;
        $applicationStatus->status_id = $hiringStatus->id;
        $applicationStatus->save();

        $application->update([
            'status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? $application->remarks,
        ]);

        try {
            NotificationService::sendApplicationStatusUpdated($application);
        } catch (\Exception $e) {
            // Non-critical
        }

        return back()->with('success', 'Application status updated successfully.');
    }

    public function scheduleInterview(Request $request, Application $application): RedirectResponse
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || $application->job->agency_id !== $agency->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'scheduled_time' => ['required', 'string'],
            'interview_type' => ['required', 'in:on-site,online'],
            'location' => ['required_if:interview_type,on-site', 'nullable', 'string', 'max:255'],
            'meeting_link' => ['required_if:interview_type,online', 'nullable', 'string', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $interview = $application->interview ?? new Interview();
        $interview->application_id = $application->id;
        $interview->scheduled_date = $validated['scheduled_date'];
        $interview->scheduled_time = $validated['scheduled_time'];
        $interview->location = $validated['interview_type'] === 'on-site' ? $validated['location'] : null;
        $interview->meeting_link = $validated['interview_type'] === 'online' ? $validated['meeting_link'] : null;
        $interview->notes = $validated['notes'] ?? null;
        $interview->status = 'scheduled';
        $interview->save();

        $hiringStatus = HiringStatus::where('status_name', 'interview_scheduled')->first();
        if (!$hiringStatus) {
            $hiringStatus = HiringStatus::create(['status_name' => 'interview_scheduled']);
        }

        $applicationStatus = $application->applicationStatus ?? new \App\Models\ApplicationStatus();
        $applicationStatus->application_id = $application->id;
        $applicationStatus->status_id = $hiringStatus->id;
        $applicationStatus->save();

        $application->update([
            'status' => 'interview_scheduled',
            'remarks' => $validated['notes'] ?? $application->remarks,
        ]);

        try {
            NotificationService::sendInterviewScheduled($application, $interview);
        } catch (\Exception $e) {
            // Non-critical
        }

        return back()->with('success', 'Interview scheduled successfully.');
    }

    public function resumePreview(Application $application)
    {
        $agency = $this->resolveAgencyForCurrentUser();

        if (!$agency || $application->job->agency_id !== $agency->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $jobSeeker = $application->jobSeeker;

        if (!$jobSeeker) {
            return response()->json(['error' => 'No job seeker found for this application.'], 404);
        }

        $jobSeeker->load(['user', 'barangay']);

        try {
            $resumeService = app(ResumeService::class);
            $data = $resumeService->buildResumeData($jobSeeker);

            $template = $jobSeeker->resume?->template ?? $jobSeeker->preferred_template ?? ResumeService::DEFAULT_TEMPLATE;

            $html = view($resumeService->viewFor($template), ['data' => $data])->render();

            return response()->json([
                'html' => $html,
                'template' => $template,
                'seeker_name' => $jobSeeker->full_name,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Preview generation failed: ' . $e->getMessage()], 500);
        }
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $agency = $this->resolveAgencyForCurrentUser();
        if (!$agency) {
            return response()->json(['message' => 'Agency not found.'], 404);
        }

        if ($agency->logo) {
            Storage::disk('public')->delete($agency->logo);
        }

        $path = $request->file('logo')->store('agencies/logos', 'public');
        $agency->update(['logo' => $path]);

        return response()->json([
            'message' => 'Logo uploaded successfully.',
            'logo' => $path,
        ]);
    }

    public function removeLogo()
    {
        $agency = $this->resolveAgencyForCurrentUser();
        if (!$agency) {
            return response()->json(['message' => 'Agency not found.'], 404);
        }

        if ($agency->logo) {
            Storage::disk('public')->delete($agency->logo);
            $agency->update(['logo' => null]);
        }

        return response()->json(['message' => 'Logo removed successfully.']);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = Auth::user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'The current password is incorrect.',
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('agency.login');
    }
}
