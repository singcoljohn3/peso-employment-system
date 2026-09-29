<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\Barangay;
use App\Models\Establishment;
use App\Models\HiringStatus;
use App\Models\Interview;
use App\Models\Job;
use App\Models\Skill;
use App\Notifications\NotificationService;
use App\Services\DashboardAnalyticsService;
use App\Services\ResumeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EstablishmentController extends Controller
{
    private function resolveEstablishmentForCurrentUser(): ?Establishment
    {
        $userId = Auth::id();
        $userEmail = Auth::user()?->email;

        $establishment = Establishment::with('barangay')
            ->where('user_id', $userId)
            ->first();

        if ($establishment) {
            return $establishment;
        }

        if (!$userEmail) {
            return null;
        }

        $establishmentByEmail = Establishment::with('barangay')
            ->whereRaw('LOWER(email) = ?', [strtolower((string) $userEmail)])
            ->first();

        if ($establishmentByEmail && $userId) {
            $establishmentByEmail->update(['user_id' => $userId]);
            $establishmentByEmail->refresh();
        }

        return $establishmentByEmail;
    }

    /**
     * Display the establishment login view.
     */
    public function loginCreate(): Response
    {
        return Inertia::render('Establishment/EstablishmentLogin', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle establishment authentication request.
     */
    public function loginStore(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Only authenticate against establishment accounts
        if (Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'role' => 'Establishment',
        ], $request->boolean('remember'))) {
            $request->session()->regenerate();

            if (isset(Auth::user()->is_active) && Auth::user()->is_active === false) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return back()->withErrors([
                    'email' => 'Your account has been deactivated. Please contact the administrator.',
                ])->onlyInput('email');
            }

            $intended = $request->session()->pull('url.intended');
            $intendedPath = is_string($intended) ? (string) parse_url($intended, PHP_URL_PATH) : '';

            return redirect()->to(
                str_starts_with($intendedPath, '/establishment')
                    ? $intended
                    : route('establishment.dashboard')
            );
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Display the establishment dashboard.
     */
    public function dashboard(Request $request): Response
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        $statistics = [];
        $recentApplicants = [];
        $monthlyApplications = [];
        $jobsChart = [];
        $upcomingInterviews = [];
        $activeJobs = [];
        $notifications = [];
        $performance = [];
        $hiringTrend = [];

        if ($establishment) {
            $now = now();
            $startOfMonth = $now->copy()->startOfMonth();
            $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
            $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

            $applicationsQuery = Application::whereHas('job', function ($query) use ($establishment) {
                $query->where('establishment_id', $establishment->id);
            });

            $lastMonthQuery = Application::whereHas('job', function ($query) use ($establishment) {
                $query->where('establishment_id', $establishment->id);
            })->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth]);

            // --- Statistics ---
            $totalJobs = Job::where('establishment_id', $establishment->id)->count();
            $activeJobsCount = Job::where('establishment_id', $establishment->id)
                ->whereIn('hiring_status', ['Open', 'Hiring'])->count();
            $closedJobsCount = Job::where('establishment_id', $establishment->id)
                ->whereNotIn('hiring_status', ['Open', 'Hiring'])->count();

            $totalApplicants = (clone $applicationsQuery)->count();
            $lastMonthTotal = (clone $lastMonthQuery)->count();

            $newToday = (clone $applicationsQuery)->whereDate('created_at', $now->today())->count();
            $newTodayLastMonth = (clone $lastMonthQuery)->whereDate('created_at', $startOfLastMonth)->count();

            $pending = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'pending');
                });
            })->count();
            $pendingLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'pending');
                });
            })->count();

            $underReview = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'for review');
                });
            })->count();
            $underReviewLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'for review');
                });
            })->count();

            $interviewScheduled = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->whereIn('status_name', ['for interview', 'interview']);
                });
            })->count();
            $interviewScheduledLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->whereIn('status_name', ['for interview', 'interview']);
                });
            })->count();

            $hired = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'hired');
                });
            })->count();
            $hiredLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'hired');
                });
            })->count();

            $rejected = (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'rejected');
                });
            })->count();
            $rejectedLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'rejected');
                });
            })->count();

            $activePositions = Job::where('establishment_id', $establishment->id)
                ->whereIn('hiring_status', ['Open', 'Hiring'])
                ->sum('vacant_positions') ?: 0;

            $totalVacancies = Job::where('establishment_id', $establishment->id)
                ->sum('vacant_positions') ?: 0;
            $vacancyFillRate = $totalVacancies > 0
                ? round((($totalVacancies - $activePositions) / $totalVacancies) * 100)
                : 0;

            $pct = fn($current, $previous) => $previous > 0 ? round((($current - $previous) / $previous) * 100) : ($current > 0 ? 100 : 0);

            $statistics = [
                'total_jobs' => $totalJobs,
                'total_applicants' => $totalApplicants,
                'active_jobs' => $activeJobsCount,
                'closed_jobs' => $closedJobsCount,
                'new_applicants_today' => $newToday,
                'pending' => $pending,
                'under_review' => $underReview,
                'interview_scheduled' => $interviewScheduled,
                'hired' => $hired,
                'rejected' => $rejected,
                'active_positions' => $activePositions,
                'vacancy_fill_rate' => $vacancyFillRate,
                'changes' => [
                    'total_applicants' => $pct($totalApplicants, $lastMonthTotal),
                    'new_today' => $pct($newToday, $newTodayLastMonth),
                    'pending' => $pct($pending, $pendingLastMonth),
                    'under_review' => $pct($underReview, $underReviewLastMonth),
                    'interview_scheduled' => $pct($interviewScheduled, $interviewScheduledLastMonth),
                    'hired' => $pct($hired, $hiredLastMonth),
                    'rejected' => $pct($rejected, $rejectedLastMonth),
                ],
            ];

            // --- Monthly Applications (line chart) ---
            $monthlyApplications = (clone $applicationsQuery)
                ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as total')
                ->whereYear('created_at', $now->year)
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
                ->map(fn($item) => [
                    'month' => (int)$item->month,
                    'total' => (int)$item->total,
                ]);

            // --- Applications Per Job (bar chart) ---
            $jobsChart = Job::where('establishment_id', $establishment->id)
                ->withCount('applications')
                ->orderBy('applications_count', 'desc')
                ->limit(10)
                ->get()
                ->map(fn($job) => [
                    'title' => $job->job_title,
                    'applications' => $job->applications_count,
                ]);

            // --- Upcoming Interviews ---
            $upcomingInterviews = Interview::whereHas('application.job', function ($q) use ($establishment) {
                $q->where('establishment_id', $establishment->id);
            })
                ->with(['application.jobSeeker', 'application.job'])
                ->whereDate('scheduled_date', '>=', $now->today())
                ->orderBy('scheduled_date')
                ->orderBy('scheduled_time')
                ->limit(10)
                ->get()
                ->map(fn($interview) => [
                    'id' => $interview->id,
                    'application_id' => $interview->application_id,
                    'applicant_name' => $interview->application->jobSeeker?->full_name ?? 'Unknown',
                    'position' => $interview->application->job->job_title ?? 'Unknown',
                    'interview_date' => $interview->scheduled_date ? \Carbon\Carbon::parse($interview->scheduled_date)->format('Y-m-d') : null,
                    'interview_time' => $interview->scheduled_time,
                    'location' => $interview->location,
                    'status' => $interview->status,
                ]);

            // --- Active Job Vacancies (detailed) ---
            $activeJobs = Job::where('establishment_id', $establishment->id)
                ->whereIn('hiring_status', ['Open', 'Hiring'])
                ->withCount('applications')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(fn($job) => [
                    'id' => $job->id,
                    'title' => $job->job_title,
                    'employment_type' => $job->employment_type,
                    'salary_range' => $job->salary_range,
                    'min_salary' => $job->min_salary,
                    'max_salary' => $job->max_salary,
                    'salary_type' => $job->salary_type,
                    'applicants_count' => $job->applications_count,
                    'vacant_positions' => $job->vacant_positions,
                    'status' => $job->hiring_status,
                    'deadline' => $job->application_deadline?->format('Y-m-d'),
                    'created_at' => $job->created_at->format('Y-m-d'),
                ]);

            // --- Recent Applicants (extended with photo) ---
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

            // --- Notifications from ActivityLog ---
            $notifications = ActivityLog::where('user_id', Auth::id())
                ->orWhere(function ($q) use ($establishment) {
                    $q->where('module', 'application')
                        ->where('metadata->establishment_id', $establishment->id);
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

            // --- Performance Metrics ---
            $topJob = Job::where('establishment_id', $establishment->id)
                ->withCount('applications')
                ->orderBy('applications_count', 'desc')
                ->first();

            $avgHiringTime = (clone $applicationsQuery)
                ->whereHas('applicationStatus', function ($q) {
                    $q->whereHas('hiringStatus', function ($hq) {
                        $hq->where('status_name', 'hired');
                    });
                })
                ->whereNotNull('applied_at')
                ->get()
                ->map(function ($app) {
                    $statusUpdate = $app->applicationStatus?->updated_at;
                    if ($statusUpdate && $app->applied_at) {
                        return $app->applied_at->diffInDays($statusUpdate);
                    }
                    return null;
                })
                ->filter()
                ->values();

            $avgDays = $avgHiringTime->count() > 0
                ? round($avgHiringTime->sum() / $avgHiringTime->count())
                : 0;

            $successRate = $totalApplicants > 0
                ? round(($hired / $totalApplicants) * 100)
                : 0;

            $hiredThisMonth = (clone $applicationsQuery)
                ->whereHas('applicationStatus', function ($q) {
                    $q->whereHas('hiringStatus', function ($hq) {
                        $hq->where('status_name', 'hired');
                    });
                })
                ->whereMonth('created_at', $now->month)
                ->whereYear('created_at', $now->year)
                ->count();

            $performance = [
                'top_job_title' => $topJob?->job_title ?? 'N/A',
                'top_job_applications' => $topJob?->applications_count ?? 0,
                'most_applied_position' => $topJob?->job_title ?? 'N/A',
                'avg_hiring_days' => $avgDays,
                'success_rate' => $successRate,
                'monthly_progress' => [
                    'hired_this_month' => $hiredThisMonth,
                    'applicants_this_month' => (clone $applicationsQuery)
                        ->whereMonth('created_at', $now->month)
                        ->whereYear('created_at', $now->year)
                        ->count(),
                    'target' => max($activeJobsCount * 2, 1),
                ],
            ];

            // --- Monthly Hiring Trend ---
            $hiringTrend = (clone $applicationsQuery)
                ->whereHas('applicationStatus', function ($q) {
                    $q->whereHas('hiringStatus', function ($hq) {
                        $hq->where('status_name', 'hired');
                    });
                })
                ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as total')
                ->whereYear('created_at', $now->year)
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
                ->map(fn($item) => [
                    'month' => (int)$item->month,
                    'total' => (int)$item->total,
                ]);
        } else {
            $statistics = [
                'total_jobs' => 0,
                'total_applicants' => 0,
                'active_jobs' => 0,
                'closed_jobs' => 0,
                'new_applicants_today' => 0,
                'pending' => 0,
                'under_review' => 0,
                'interview_scheduled' => 0,
                'hired' => 0,
                'rejected' => 0,
                'active_positions' => 0,
                'vacancy_fill_rate' => 0,
                'changes' => [
                    'total_applicants' => 0,
                    'new_today' => 0,
                    'pending' => 0,
                    'under_review' => 0,
                    'interview_scheduled' => 0,
                    'hired' => 0,
                    'rejected' => 0,
                ],
            ];
        }

        return Inertia::render('Establishment/Dashboard', [
            'statistics' => $statistics,
            'recentApplicants' => $recentApplicants,
            'establishment' => $establishment,
            'monthlyApplications' => $monthlyApplications,
            'jobsChart' => $jobsChart,
            'upcomingInterviews' => $upcomingInterviews,
            'activeJobs' => $activeJobs,
            'notifications' => $notifications,
            'performance' => $performance,
            'hiringTrend' => $hiringTrend,
            'analytics' => app(DashboardAnalyticsService::class)->establishmentAnalytics(
                $establishment?->id,
                $request->query('period'),
            ),
        ]);
    }

    /**
     * Display the jobs management page.
     */
    public function jobs(): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        $jobs = Job::where('establishment_id', $establishment->id)
            ->with(['skills', 'applications.jobSeeker', 'barangay'])
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $skills = Skill::orderBy('skill_name')->get();
        $barangays = Barangay::orderBy('barangay_name')->get();

        return Inertia::render('Establishment/Jobvacancy', [
            'jobs' => $jobs,
            'establishment' => $establishment,
            'skills' => $skills,
            'barangays' => $barangays,
        ]);
    }

    /**
     * Store a new job posting.
     */
    public function storeJob(Request $request): RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment) {
            return back()->with('error', 'Please complete your company profile first.');
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
            'establishment_id' => $establishment->id,
            'barangay_id' => $validated['barangay_id'] ?? $establishment->barangay_id,
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

        return redirect()->route('establishment.jobs')->with('success', 'Job posting created successfully.');
    }

    /**
     * Update a job posting.
     */
    public function updateJob(Request $request, Job $job): RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment || $job->establishment_id !== $establishment->id) {
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

    /**
     * Delete a job posting.
     */
    public function deleteJob(Job $job): RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment || $job->establishment_id !== $establishment->id) {
            abort(403, 'Unauthorized action.');
        }

        $job->delete();

        return back()->with('success', 'Job posting deleted successfully.');
    }

    /**
     * Update job hiring status.
     */
    public function updateJobStatus(Request $request, Job $job)
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment || $job->establishment_id !== $establishment->id) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized action.'], 403);
            }
            abort(403, 'Unauthorized action.');
        }

        try {
            $validated = $request->validate([
                'status' => ['required', 'in:Open,Hiring,Closed,Filled'],
            ]);

            $job->update([
                'hiring_status' => $validated['status'],
            ]);

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
            Log::error('Failed to update job hiring status: ' . $e->getMessage(), [
                'job_id' => $job->id,
                'establishment_id' => $establishment->id,
            ]);

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Failed to update hiring status. Please try again.'], 500);
            }

            return back()->with('error', 'Failed to update hiring status.');
        }
    }

    /**
     * Display the applicants management page.
     */
    public function applicants(): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        $applications = Application::with(['jobSeeker.user', 'jobSeeker.barangay', 'jobSeeker.resume', 'job', 'job.establishment', 'applicationStatus.hiringStatus', 'interview'])
            ->whereHas('job', function ($query) use ($establishment) {
                $query->where('establishment_id', $establishment->id);
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

        // Transform applications to include explicit seeker profile data
        // This ensures profile data is always available in the serialized response
        $applications->getCollection()->transform(function ($app) {
            if ($app->jobSeeker) {
                $app->setAttribute('seeker_profile', $app->jobSeeker->toArray());
            }
            return $app;
        });

        // Get statistics using application_statuses relationship
        $baseQuery = Application::whereHas('job', function ($query) use ($establishment) {
            $query->where('establishment_id', $establishment->id);
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
            'approved' => (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'approved');
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

        // Get jobs for filter
        $jobs = Job::where('establishment_id', $establishment->id)
            ->orderBy('job_title')
            ->get();

        return Inertia::render('Establishment/Applicants', [
            'applications' => $applications,
            'establishment' => $establishment,
            'statistics' => $statistics,
            'jobs' => $jobs,
        ]);
    }

    /**
     * Display the hiring status page (applicant-level workflow).
     */
    public function hiringStatus(): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        // Get all applications for this establishment with related data
        $applications = Application::with(['jobSeeker.user', 'job', 'applicationStatus.hiringStatus', 'interview'])
            ->whereHas('job', function ($query) use ($establishment) {
                $query->where('establishment_id', $establishment->id);
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

        // Get statistics
        $statusCounts = $applications->groupBy('status')->map(fn($group) => $group->count())->toArray();

        $statistics = [
            'total' => $applications->count(),
            'pending' => $statusCounts['pending'] ?? 0,
            'for_interview' => ($statusCounts['for interview'] ?? 0) + ($statusCounts['interview'] ?? 0) + ($statusCounts['interview_scheduled'] ?? 0),
            'interviewed' => $statusCounts['interviewed'] ?? 0,
            'hired' => $statusCounts['hired'] ?? 0,
            'rejected' => $statusCounts['rejected'] ?? 0,
        ];

        // Get jobs for filter
        $jobs = Job::where('establishment_id', $establishment->id)
            ->orderBy('job_title')
            ->get()
            ->map(fn($job) => ['id' => $job->id, 'job_title' => $job->job_title]);

        return Inertia::render('Establishment/HiringStatus', [
            'applications' => $applications,
            'establishment' => $establishment,
            'statistics' => $statistics,
            'jobs' => $jobs,
        ]);
    }

    /**
     * Display the reports page.
     */
    public function reports(Request $request): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        $now = now();
        $todayStart = $now->copy()->startOfDay();
        $weekStart = $now->copy()->startOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $yearStart = $now->copy()->startOfYear();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // ── Reporting period ──
        // The filter bar used to be inert, so every figure below silently meant
        // "this year". Resolve the window up front and scope the queries to it.
        $periodOptions = ['today', 'week', 'month', 'year', 'custom'];
        $period = in_array($request->input('period'), $periodOptions, true)
            ? $request->input('period')
            : 'year';

        [$periodStart, $periodEnd] = match ($period) {
            'today' => [$todayStart, $now->copy()->endOfDay()],
            'week' => [$weekStart, $now->copy()->endOfDay()],
            'month' => [$monthStart, $now->copy()->endOfDay()],
            'custom' => [
                $request->filled('date_from')
                    ? \Carbon\Carbon::parse($request->input('date_from'))->startOfDay()
                    : $yearStart,
                $request->filled('date_to')
                    ? \Carbon\Carbon::parse($request->input('date_to'))->endOfDay()
                    : $now->copy()->endOfDay(),
            ],
            default => [$yearStart, $now->copy()->endOfDay()],
        };

        if ($periodStart->gt($periodEnd)) {
            [$periodStart, $periodEnd] = [$periodEnd, $periodStart];
        }

        $baseQuery = Application::whereHas('job', function ($query) use ($establishment) {
            $query->where('establishment_id', $establishment->id);
        })->whereBetween('created_at', [$periodStart, $periodEnd]);

        $lastMonthQuery = Application::whereHas('job', function ($query) use ($establishment) {
            $query->where('establishment_id', $establishment->id);
        })->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd]);

        // ── Statistics ──
        $totalJobs = Job::where('establishment_id', $establishment->id)->count();
        $activeJobs = Job::where('establishment_id', $establishment->id)
            ->whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $closedJobs = $totalJobs - $activeJobs;

        $totalApplications = (clone $baseQuery)->count();
        $newToday = (clone $baseQuery)->whereDate('created_at', $todayStart)->count();
        $lastMonthTotal = (clone $lastMonthQuery)->count();

        // ── Pipeline counts ──
        // hiring_statuses only ever holds these names. The old code asked for
        // 'for review', 'for interview' and 'rejected', none of which exist, so
        // those buckets were permanently zero while the real
        // 'interview_scheduled' stage went uncounted.
        $sc = fn($names) => (clone $baseQuery)->whereHas('applicationStatus', function ($q) use ($names) {
            $q->whereHas('hiringStatus', function ($hq) use ($names) {
                $hq->whereIn('status_name', (array) $names);
            });
        })->count();

        $pending = $sc(['pending']);
        $forInterview = $sc(['interview', 'interview_scheduled']);
        $hired = $sc(['hired']);

        // Applications that were never given a status row still belong in the
        // report, otherwise they silently vanish from every total.
        $noStatus = (clone $baseQuery)->whereDoesntHave('applicationStatus')->count();

        $pendingLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) {
                $hq->where('status_name', 'pending');
            });
        })->count();
        $hiredLastMonth = (clone $lastMonthQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) {
                $hq->where('status_name', 'hired');
            });
        })->count();

        $totalVacancies = Job::where('establishment_id', $establishment->id)->sum('vacant_positions') ?: 0;
        $activePositions = Job::where('establishment_id', $establishment->id)
            ->whereIn('hiring_status', ['Open', 'Hiring'])->sum('vacant_positions') ?: 0;
        $fillRate = $totalVacancies > 0 ? round((($totalVacancies - $activePositions) / $totalVacancies) * 100) : 0;

        $pct = fn($c, $p) => $p > 0 ? round((($c - $p) / $p) * 100) : ($c > 0 ? 100 : 0);

        $statistics = [
            'active_jobs' => $activeJobs,
            'closed_jobs' => $closedJobs,
            'total_applications' => $totalApplications,
            'new_applicants_today' => $newToday,
            'pending' => $pending,
            'for_interview' => $forInterview,
            'hired' => $hired,
            'no_status' => $noStatus,
            'fill_rate' => $fillRate,
            'changes' => [
                'total_applications' => $pct($totalApplications, $lastMonthTotal),
                'pending' => $pct($pending, $pendingLastMonth),
                'hired' => $pct($hired, $hiredLastMonth),
            ],
        ];

        // ── Monthly Applications (line chart) ──
        // Months without applications are kept as zero so the chart shows a
        // continuous axis instead of a lone dot.
        $monthlyCounts = (clone $baseQuery)
            ->selectRaw('MONTH(created_at) as m, COUNT(*) as count')
            ->groupBy('m')
            ->pluck('count', 'm')
            ->map(fn($c) => (int) $c);

        $spanToMonth = $period === 'year' ? 12 : (int) $periodEnd->month;
        $spanToYear = $period === 'year' ? (int) $periodStart->year : (int) $periodEnd->year;

        $monthlyApplications = [];
        for ($cursor = $periodStart->copy()->startOfMonth(), $guard = 0;
             $guard < 240 && ($cursor->year < $spanToYear || ($cursor->year === $spanToYear && $cursor->month <= $spanToMonth));
             $cursor->addMonth(), $guard++) {
            $monthlyApplications[] = [
                'month' => (int) $cursor->month,
                'count' => $monthlyCounts[$cursor->month] ?? 0,
            ];
        }

        // ── Applications by Status (doughnut) ──
        $applicationsByStatus = [
            ['name' => 'Pending', 'value' => $pending, 'color' => '#f59e0b'],
            ['name' => 'Interview', 'value' => $forInterview, 'color' => '#8b5cf6'],
            ['name' => 'Hired', 'value' => $hired, 'color' => '#10b981'],
            ['name' => 'No Status Yet', 'value' => $noStatus, 'color' => '#64748b'],
        ];

        // ── Applications Per Job (bar chart) ──
        $jobModels = Job::where('establishment_id', $establishment->id)
            ->withCount(['applications' => function ($query) use ($periodStart, $periodEnd) {
                $query->whereBetween('created_at', [$periodStart, $periodEnd]);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $applicationsPerJob = $jobModels->map(fn($job) => [
            'title' => $job->job_title,
            'applications' => $job->applications_count,
        ]);

        // ── Monthly Hiring Performance ──
        $hiredCounts = (clone $baseQuery)
            ->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'hired');
                });
            })
            ->selectRaw('MONTH(created_at) as m, COUNT(*) as count')
            ->groupBy('m')
            ->pluck('count', 'm')
            ->map(fn($c) => (int) $c);

        $hiringPerformance = [];
        for ($cursor = $periodStart->copy()->startOfMonth(), $guard = 0;
             $guard < 240 && ($cursor->year < $spanToYear || ($cursor->year === $spanToYear && $cursor->month <= $spanToMonth));
             $cursor->addMonth(), $guard++) {
            $hiringPerformance[] = [
                'month' => (int) $cursor->month,
                'hired' => $hiredCounts[$cursor->month] ?? 0,
            ];
        }

        // ── Job Vacancy Performance ──
        $jobPerformance = $jobModels->map(function ($job) use ($periodStart, $periodEnd) {
            $aq = Application::where('job_id', $job->id)
                ->whereBetween('created_at', [$periodStart, $periodEnd]);
            $interviewed = (clone $aq)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->whereIn('status_name', ['interview', 'interview_scheduled']);
                });
            })->count();
            $hiredCount = (clone $aq)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'hired');
                });
            })->count();
            $rejectedCount = (clone $aq)->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'rejected');
                });
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

        // ── Applications Report (paginated) ──
        $applicationsReport = (clone $baseQuery)
            ->with(['jobSeeker', 'job', 'applicationStatus.hiringStatus', 'interview'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn($app) => [
                'id' => $app->id,
                'applicant_name' => $app->jobSeeker?->full_name ?? 'Unknown',
                'position' => $app->job?->job_title ?? 'Unknown',
                'applied_date' => $app->created_at->format('Y-m-d'),
                'status' => $app->applicationStatus?->hiringStatus?->status_name ?? 'pending',
                'interview_date' => $app->interview?->scheduled_date ? \Carbon\Carbon::parse($app->interview->scheduled_date)->format('Y-m-d') : null,
                'interview_time' => $app->interview?->scheduled_time,
                'result' => $app->applicationStatus?->hiringStatus?->status_name ?? 'pending',
            ]);

        // ── Hiring Performance Metrics ──
        $hiredApps = (clone $baseQuery)->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) {
                $hq->where('status_name', 'hired');
            });
        })->whereNotNull('created_at');

        $avgHiringTime = $hiredApps->get()->map(function ($app) {
            $statusUpdate = $app->applicationStatus?->updated_at;
            if ($statusUpdate && $app->created_at) {
                return $app->created_at->diffInDays($statusUpdate);
            }
            return null;
        })->filter()->values();
        $avgDays = $avgHiringTime->count() > 0 ? round($avgHiringTime->sum() / $avgHiringTime->count()) : 0;

        // There is no "rejected" status in this schema, so the old
        // acceptance/rejection rates were always 0 or a misleading 100%.
        // Report the stages that actually exist instead.
        $rate = fn($part) => $totalApplications > 0 ? round(($part / $totalApplications) * 100) : 0;
        $successRate = $rate($hired);
        $interviewRate = $rate($forInterview);
        $pendingRate = $rate($pending);

        // ── Top Performing Jobs ──
        $topJobs = $jobModels->sortByDesc('applications_count')->take(5)->map(function ($job) use ($periodStart, $periodEnd) {
            $hiredCount = Application::where('job_id', $job->id)
                ->whereBetween('created_at', [$periodStart, $periodEnd])
                ->whereHas('applicationStatus', function ($q) {
                    $q->whereHas('hiringStatus', function ($hq) {
                        $hq->where('status_name', 'hired');
                    });
                })->count();
            return [
                'title' => $job->job_title,
                'applicants' => $job->applications_count,
                'hired' => $hiredCount,
                'percentage' => $job->applications_count > 0 ? round(($hiredCount / $job->applications_count) * 100) : 0,
            ];
        })->values();

        // ── Upcoming Interviews ──
        $upcomingInterviews = Interview::whereHas('application.job', function ($q) use ($establishment) {
            $q->where('establishment_id', $establishment->id);
        })
            ->with(['application.jobSeeker', 'application.job'])
            ->whereDate('scheduled_date', '>=', $now->today())
            ->orderBy('scheduled_date')
            ->orderBy('scheduled_time')
            ->limit(10)
            ->get()
            ->map(fn($iv) => [
                'id' => $iv->id,
                'applicant_name' => $iv->application->jobSeeker?->full_name ?? 'Unknown',
                'position' => $iv->application->job->job_title ?? 'Unknown',
                'interview_date' => $iv->scheduled_date ? \Carbon\Carbon::parse($iv->scheduled_date)->format('Y-m-d') : null,
                'interview_time' => $iv->scheduled_time,
                'status' => $iv->status,
            ]);

        // ── Recent Activities ──
        $recentJobs = Job::where('establishment_id', $establishment->id)
            ->orderBy('created_at', 'desc')->limit(3)->get()
            ->map(fn($j) => ['type' => 'job_posted', 'text' => "Posted \"{$j->job_title}\"", 'date' => $j->created_at->diffForHumans()]);

        $recentApps = (clone $baseQuery)
            ->with('job')
            ->orderBy('created_at', 'desc')->limit(3)->get()
            ->map(fn($a) => ['type' => 'new_application', 'text' => "New application for \"{$a->job->job_title}\"", 'date' => $a->created_at->diffForHumans()]);

        $recentHires = (clone $baseQuery)
            ->whereHas('applicationStatus', function ($q) {
                $q->whereHas('hiringStatus', function ($hq) {
                    $hq->where('status_name', 'hired');
                });
            })
            ->orderBy('updated_at', 'desc')->limit(3)->get()
            ->map(fn($a) => ['type' => 'hired', 'text' => "Applicant hired for \"{$a->job->job_title}\"", 'date' => $a->updated_at->diffForHumans()]);

        $recentInterviews = Interview::whereHas('application.job', function ($q) use ($establishment) {
            $q->where('establishment_id', $establishment->id);
        })
            ->with('application.job')
            ->orderBy('created_at', 'desc')->limit(3)->get()
            ->map(fn($iv) => ['type' => 'interview_scheduled', 'text' => "Interview scheduled for \"{$iv->application->job->job_title}\"", 'date' => $iv->created_at->diffForHumans()]);

        $recentActivities = $recentJobs->concat($recentApps)->concat($recentHires)->concat($recentInterviews)
            ->sortByDesc('date')->take(12)->values();

        return Inertia::render('Establishment/Reports', [
            'establishment' => $establishment,
            'statistics' => $statistics,
            'monthlyApplications' => $monthlyApplications,
            'applicationsByStatus' => $applicationsByStatus,
            'applicationsPerJob' => $applicationsPerJob,
            'hiringPerformance' => $hiringPerformance,
            'jobs' => $jobPerformance,
            'applicationsReport' => $applicationsReport,
            'hiringMetrics' => [
                'avg_hiring_days' => $avgDays,
                'total_hired' => $hired,
                'success_rate' => $successRate,
                'interview_rate' => $interviewRate,
                'pending_rate' => $pendingRate,
            ],
            'topJobs' => $topJobs,
            'upcomingInterviews' => $upcomingInterviews,
            'recentActivities' => $recentActivities,
            'period' => $period,
            'periodRange' => [
                'from' => $periodStart->toDateString(),
                'to' => $periodEnd->toDateString(),
            ],
            'filters' => $request->only(['search', 'status', 'type', 'barangay', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Export establishment report as PDF.
     */
    public function exportPdf()
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        $baseQuery = Application::whereHas('job', function ($query) use ($establishment) {
            $query->where('establishment_id', $establishment->id);
        });

        $statistics = [
            'total_applications' => (clone $baseQuery)->count(),
            'total_jobs' => Job::where('establishment_id', $establishment->id)->count(),
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

        $monthlyApplications = Application::whereHas('job', function ($query) use ($establishment) {
            $query->where('establishment_id', $establishment->id);
        })
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        $jobs = Job::where('establishment_id', $establishment->id)
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('pdfs.establishment-report', [
            'establishment' => $establishment,
            'statistics' => $statistics,
            'monthlyApplications' => $monthlyApplications,
            'jobs' => $jobs,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ]);

        return $pdf->download("report-{$establishment->company_name}-" . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export establishment report as CSV.
     */
    public function exportExcel()
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        $jobs = Job::where('establishment_id', $establishment->id)
            ->withCount('applications')
            ->orderBy('job_title')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="report-' . $establishment->company_name . '-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($jobs, $establishment) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['Company Report - ' . $establishment->company_name]);
            fputcsv($file, ['Generated: ' . now()->format('Y-m-d H:i:s')]);
            fputcsv($file, []);

            fputcsv($file, ['Job Title', 'Employment Type', 'Salary Range', 'Hiring Status', 'Applicants', 'Posted Date']);

            foreach ($jobs as $job) {
                fputcsv($file, [
                    $job->job_title,
                    $job->employment_type,
                    $job->salary_range ?? 'N/A',
                    $job->hiring_status,
                    $job->applications_count,
                    $job->created_at->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display the notifications page.
     */
    public function notifications(): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
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

        return Inertia::render('Establishment/Notification', [
            'establishment' => $establishment,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Display the settings page.
     */
    public function settings(): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        $user = Auth::user();
        $barangays = Barangay::all();

        return Inertia::render('Establishment/Settings', [
            'establishment' => $establishment,
            'user' => $user,
            'barangays' => $barangays,
        ]);
    }

    /**
     * Update application status.
     */
    public function updateApplication(Request $request, Application $application): RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment || $application->job->establishment_id !== $establishment->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string'],
            'remarks' => ['nullable', 'string'],
        ]);

        // Find or create the hiring status
        $hiringStatus = HiringStatus::where('status_name', $validated['status'])->first();
        
        if (!$hiringStatus) {
            // Create the hiring status if it doesn't exist
            $hiringStatus = HiringStatus::create([
                'status_name' => $validated['status'],
            ]);
        }

        // Update or create the application status
        $applicationStatus = $application->applicationStatus ?? new \App\Models\ApplicationStatus();
        $applicationStatus->application_id = $application->id;
        $applicationStatus->status_id = $hiringStatus->id;
        $applicationStatus->save();

        // Update the status field on the application directly
        $application->update([
            'status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? $application->remarks,
        ]);

        // Send notification to job seeker
        try {
            NotificationService::sendApplicationStatusUpdated($application);
        } catch (\Exception $e) {
            // Non-critical
        }

        return back()->with('success', 'Application status updated successfully.');
    }

    /**
     * Schedule an interview for an application.
     */
    public function scheduleInterview(Request $request, Application $application): RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment || $application->job->establishment_id !== $establishment->id) {
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

        // Create or update interview record
        $interview = $application->interview ?? new Interview();
        $interview->application_id = $application->id;
        $interview->scheduled_date = $validated['scheduled_date'];
        $interview->scheduled_time = $validated['scheduled_time'];
        $interview->location = $validated['interview_type'] === 'on-site' ? $validated['location'] : null;
        $interview->meeting_link = $validated['interview_type'] === 'online' ? $validated['meeting_link'] : null;
        $interview->notes = $validated['notes'] ?? null;
        $interview->status = 'scheduled';
        $interview->save();

        // Update application status to interview_scheduled
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

        // Send notification to job seeker
        try {
            NotificationService::sendInterviewScheduled($application, $interview);
        } catch (\Exception $e) {
            // Non-critical
        }

        return back()->with('success', 'Interview scheduled successfully.');
    }

    public function resumePreview(Application $application)
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if (!$establishment || $application->job->establishment_id !== $establishment->id) {
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

    /**
     * Display the establishment profile page.
     */
    public function profile(): Response
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        $barangays = Barangay::all();

        return Inertia::render('Establishment/Profile', [
            'establishment' => $establishment,
            'barangays' => $barangays,
        ]);
    }

    /**
     * Update or create establishment profile.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'barangay_id' => ['nullable', 'exists:barangays,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('establishments/logos', 'public');
            $validated['logo'] = $path;
        }

        $establishment = $this->resolveEstablishmentForCurrentUser();

        if ($establishment) {
            $establishment->update($validated);
        } else {
            $establishment = Establishment::create([
                'user_id' => $user->id,
                'company_name' => $validated['company_name'],
                'contact_person' => $validated['contact_person'],
                'contact_number' => $validated['contact_number'] ?? null,
                'email' => $validated['email'],
                'barangay_id' => $validated['barangay_id'] ?? null,
                'description' => $validated['description'] ?? null,
            ]);
        }

        $user->update([
            'name' => $validated['company_name'],
            'email' => $validated['email'],
        ]);

        return back()->with('success', 'Profile saved successfully.');
    }

    /**
     * Upload company logo independently.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $establishment = $this->resolveEstablishmentForCurrentUser();
        if (!$establishment) {
            return response()->json(['message' => 'Establishment not found.'], 404);
        }

        if ($establishment->logo) {
            Storage::disk('public')->delete($establishment->logo);
        }

        $path = $request->file('logo')->store('establishments/logos', 'public');
        $establishment->update(['logo' => $path]);

        return response()->json([
            'message' => 'Logo uploaded successfully.',
            'logo' => $path,
        ]);
    }

    /**
     * Remove company logo.
     */
    public function removeLogo()
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        if (!$establishment) {
            return response()->json(['message' => 'Establishment not found.'], 404);
        }

        if ($establishment->logo) {
            Storage::disk('public')->delete($establishment->logo);
            $establishment->update(['logo' => null]);
        }

        return response()->json(['message' => 'Logo removed successfully.']);
    }

    /**
     * Update the establishment user's password.
     */
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

    /**
     * Handle establishment logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('establishment.login');
    }
}
