<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Barangay;
use App\Models\Establishment;
use App\Models\HiringStatus;
use App\Models\Job;
use App\Models\Skill;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

            return redirect()->intended(route('establishment.dashboard', absolute: false));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Display the establishment dashboard.
     */
    public function dashboard(): Response
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();

        if ($establishment) {
            $applicationsQuery = Application::whereHas('job', function ($query) use ($establishment) {
                $query->where('establishment_id', $establishment->id);
            });

            $statistics = [
                'total_jobs' => Job::where('establishment_id', $establishment->id)->count(),
                'total_applicants' => (clone $applicationsQuery)->count(),
                'pending' => (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                    $q->whereHas('hiringStatus', function ($hq) {
                        $hq->where('status_name', 'pending');
                    });
                })->count(),
                'hired' => (clone $applicationsQuery)->whereHas('applicationStatus', function ($q) {
                    $q->whereHas('hiringStatus', function ($hq) {
                        $hq->where('status_name', 'hired');
                    });
                })->count(),
            ];

            $recentApplicants = (clone $applicationsQuery)
                ->with(['jobSeeker', 'job'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($application) {
                    return [
                        'id' => $application->id,
                        'name' => ($application->jobSeeker->first_name ?? '') . ' ' . ($application->jobSeeker->last_name ?? ''),
                        'jobTitle' => $application->job->job_title ?? 'Unknown Position',
                        'status' => $application->applicationStatus?->hiringStatus?->status_name ?? 'pending',
                        'appliedDate' => $application->created_at->format('Y-m-d'),
                    ];
            });
        } else {
            $statistics = [
                'total_jobs' => 0,
                'total_applicants' => 0,
                'pending' => 0,
                'hired' => 0,
            ];
            $recentApplicants = [];
        }

        return Inertia::render('Establishment/Dashboard', [
            'statistics' => $statistics,
            'recentApplicants' => $recentApplicants,
            'establishment' => $establishment,
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
            'description' => ['required', 'string'],
            'salary_range' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'barangay_id' => ['required', 'exists:barangays,id'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['exists:skills,id'],
        ]);

        $job = Job::create([
            'establishment_id' => $establishment->id,
            'barangay_id' => $validated['barangay_id'],
            'job_title' => $validated['job_title'],
            'description' => $validated['description'],
            'salary_range' => $validated['salary_range'] ?? null,
            'employment_type' => $validated['employment_type'],
        ]);

        // Sync skills if provided
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
            'description' => ['required', 'string'],
            'salary_range' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'barangay_id' => ['required', 'exists:barangays,id'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['exists:skills,id'],
        ]);

        $job->update([
            'job_title' => $validated['job_title'],
            'description' => $validated['description'],
            'salary_range' => $validated['salary_range'] ?? null,
            'employment_type' => $validated['employment_type'],
            'barangay_id' => $validated['barangay_id'],
        ]);

        // Sync skills
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
    public function updateJobStatus(Request $request, Job $job): RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment || $job->establishment_id !== $establishment->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:Open,Hiring,Closed,Filled'],
        ]);

        $job->update([
            'hiring_status' => $validated['status'],
        ]);

        return back()->with('success', 'Job status updated successfully.');
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

        $applications = Application::with(['jobSeeker', 'job', 'job.establishment', 'applicationStatus.hiringStatus'])
            ->whereHas('job', function ($query) use ($establishment) {
                $query->where('establishment_id', $establishment->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12);

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
     * Display the hiring status page.
     */
    public function hiringStatus(): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        // Get all jobs with their hiring status and applicant count
        $jobs = Job::where('establishment_id', $establishment->id)
            ->with(['establishment', 'barangay'])
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get job statistics
        $baseQuery = Job::where('establishment_id', $establishment->id);

        $positionsFilled = Application::whereHas('job', function ($query) use ($establishment) {
            $query->where('establishment_id', $establishment->id);
        })->whereHas('applicationStatus', function ($q) {
            $q->whereHas('hiringStatus', function ($hq) {
                $hq->where('status_name', 'hired');
            });
        })->count();

        $statistics = [
            'total_jobs' => (clone $baseQuery)->count(),
            'open' => (clone $baseQuery)->where('hiring_status', 'Open')->count(),
            'hiring' => (clone $baseQuery)->where('hiring_status', 'Hiring')->count(),
            'closed' => (clone $baseQuery)->where('hiring_status', 'Closed')->count(),
            'filled' => (clone $baseQuery)->where('hiring_status', 'Filled')->count(),
            'positions_filled' => $positionsFilled,
        ];

        return Inertia::render('Establishment/HiringStatus', [
            'jobs' => $jobs,
            'establishment' => $establishment,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Display the reports page.
     */
    public function reports(): Response|RedirectResponse
    {
        $establishment = $this->resolveEstablishmentForCurrentUser();
        
        if (!$establishment) {
            return redirect()->route('establishment.profile')->with('error', 'Please complete your company profile first.');
        }

        // Get statistics for reports
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

        // Get monthly applications data
        $monthlyApplications = Application::whereHas('job', function ($query) use ($establishment) {
            $query->where('establishment_id', $establishment->id);
        })
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get()
            ->reverse();

        // Get jobs with application counts
        $jobs = Job::where('establishment_id', $establishment->id)
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Establishment/Reports', [
            'establishment' => $establishment,
            'statistics' => $statistics,
            'monthlyApplications' => $monthlyApplications,
            'jobs' => $jobs,
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

        // Get recent applications as notifications
        $notifications = Application::with(['jobSeeker', 'job'])
            ->whereHas('job', function ($query) use ($establishment) {
                $query->where('establishment_id', $establishment->id);
            })
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($application) {
                return [
                    'id' => $application->id,
                    'type' => 'new_application',
                    'title' => 'New Application Received',
                    'message' => "{$application->jobSeeker->first_name} {$application->jobSeeker->last_name} applied for {$application->job->job_title}",
                    'created_at' => $application->created_at,
                    'read' => false,
                ];
            });

        return Inertia::render('Establishment/Notification', [
            'establishment' => $establishment,
            'notifications' => $notifications,
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

        return Inertia::render('Establishment/Settings', [
            'establishment' => $establishment,
            'user' => $user,
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

        // Update remarks on application if needed
        if (isset($validated['remarks'])) {
            $application->update(['remarks' => $validated['remarks']]);
        }

        return back()->with('success', 'Application status updated successfully.');
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
            ]);
        }

        $user->update([
            'name' => $validated['company_name'],
            'email' => $validated['email'],
        ]);

        return back()->with('success', 'Profile saved successfully.');
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
