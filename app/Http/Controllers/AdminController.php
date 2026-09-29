<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Barangay;
use App\Models\Establishment;
use App\Models\HiringStatus;
use App\Models\Interview;
use App\Models\Job;
use App\Models\JobSeeker;
use App\Models\User;
use App\Notifications\NotificationService;
use App\Services\DashboardAnalyticsService;
use App\Services\ResumeService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the PESO admin login view.
     */
    public function loginCreate(): Response
    {
        return Inertia::render('PESO/PESOLogin', [
            'status' => session('status'),
        ]);
    }

    /**
     * Display the PESO register view.
     */
    public function registerCreate(): Response
    {
        return Inertia::render('PESO/PESORegister', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle PESO admin authentication request.
     */
    public function loginStore(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            if (isset(Auth::user()->is_active) && Auth::user()->is_active === false) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return back()->withErrors([
                    'email' => 'Your account has been deactivated. Please contact the administrator.',
                ]);
            }

            $role = strtolower((string) Auth::user()->role);

            if ($role === 'establishment') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect()->route('establishment.login')->with('status', 'Please log in through the Establishment portal.');
            }

            if ($role === 'agency') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect()->route('agency.login')->with('status', 'Please log in through the Agency portal.');
            }

            if ($role === 'admin') {
                return redirect()->intended(route('admin.dashboard', absolute: false));
            }

            if ($role === 'staff') {
                return redirect()->intended(route('staff.dashboard', absolute: false));
            }

            if ($role === 'job_seeker') {
                return redirect()->intended(route('jobseeker.dashboard', absolute: false));
            }

            return redirect()->intended(route('dashboard', absolute: false));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Display the admin dashboard.
     */
    public function dashboard(Request $request): Response
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $yearStart = $now->copy()->startOfYear();
        $prevMonthStart = $now->copy()->subMonth()->startOfMonth();
        $prevMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // Current month counts
        $currentMonthApps = Application::where('created_at', '>=', $monthStart)->count();
        $prevMonthApps = Application::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();

        $currentHired = Application::where('status', 'hired')->where('created_at', '>=', $monthStart)->count();
        $prevHired = Application::where('status', 'hired')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();

        $totalJobSeekers = JobSeeker::count();
        $totalEstablishments = Establishment::count();
        $totalJobs = Job::count();
        $totalApplications = Application::count();

        $hiredCount = Application::where('status', 'hired')->count();
        $pendingCount = Application::whereIn('status', ['Pending', 'pending'])->count();
        $approvedCount = Application::whereIn('status', ['Approved', 'approved', 'Hired', 'hired'])->count();
        $interviewedCount = Application::whereIn('status', ['Interview', 'interview'])->count();
        $rejectedCount = Application::whereIn('status', ['Rejected', 'rejected'])->count();

        $statistics = [
            'total_job_seekers' => $totalJobSeekers,
            'active_employers' => $totalEstablishments,
            'total_establishments' => $totalEstablishments,
            'job_vacancies' => $totalJobs,
            'total_job_vacancies' => $totalJobs,
            'new_applications' => $currentMonthApps,
            'pending_applications' => $pendingCount,
            'approved_applications' => $approvedCount,
            'interviewed_applicants' => $interviewedCount,
            'total_applications' => $totalApplications,
            'hired_count' => $hiredCount,
            'rejected_applicants' => $rejectedCount,
            'barangays_count' => Barangay::count(),
            'active_hiring_jobs' => Job::whereIn('hiring_status', ['Open', 'Hiring'])->count(),

            // Monthly percentages
            'app_change' => $prevMonthApps > 0 ? round((($currentMonthApps - $prevMonthApps) / $prevMonthApps) * 100, 1) : 0,
            'hired_change' => $prevHired > 0 ? round((($currentHired - $prevHired) / $prevHired) * 100, 1) : 0,

            'recent_jobs' => Job::with('establishment.user')->latest()->take(5)->get(),
            'recent_applications' => Application::with(['jobSeeker', 'job.establishment'])->latest()->take(5)->get(),
            'monthly_applications' => Application::selectRaw('MONTH(created_at) as month, COUNT(*) as total')
                ->where('created_at', '>=', $yearStart)
                ->groupByRaw('MONTH(created_at)')
                ->orderByRaw('MONTH(created_at)')
                ->pluck('total', 'month')
                ->toArray(),
            'total_approved' => $approvedCount,
            'total_rejected' => $rejectedCount,

            // Additional data for enhanced dashboard
            'hiring_establishments' => Establishment::whereHas('jobs', function ($q) {
                    $q->whereIn('hiring_status', ['Open', 'Hiring']);
                })
                ->withCount(['jobs', 'applications as total_applications'])
                ->withCount(['applications as hired_applications' => fn($q) => $q->where('status', 'hired')])
                ->take(5)->get(),

            'top_jobs' => Job::with('establishment')
                ->withCount('applications')
                ->orderByDesc('applications_count')
                ->take(5)->get(),

            'system_info' => [
                'total_users' => User::count(),
                'database_status' => 'Connected',
                'server_status' => 'Online',
                'api_status' => 'Operational',
                'mobile_app' => 'Connected',
                'estab_portal' => 'Connected',
                'last_backup' => 'N/A',
                'storage_usage' => 45,
            ],

            'monthly_hiring' => Application::selectRaw('MONTH(created_at) as month,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = "hired" THEN 1 ELSE 0 END) as hired')
                ->where('created_at', '>=', $yearStart)
                ->groupByRaw('MONTH(created_at)')
                ->orderByRaw('MONTH(created_at)')
                ->get(),

            'status_distribution' => Application::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),

            'barangay_chart_data' => Barangay::withCount('jobSeekers')
                ->orderBy('barangay_name')
                ->get()
                ->map(fn($b) => [
                    'barangay' => $b->barangay_name,
                    'applicants' => (int) $b->job_seekers_count,
                ]),
        ];

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $statistics,
            'barangays' => Barangay::where('municipality', 'Opol')->get(),
            'analytics' => app(DashboardAnalyticsService::class)->adminAnalytics(
                $request->query('period'),
            ),
        ]);
    }

    /**
     * Display the jobseekers page.
     */
    public function jobseekers(Request $request): Response
    {
        $query = JobSeeker::with(['user', 'barangay', 'verifiedBy']);

        if ($request->filled('status') && in_array($request->status, ['pending', 'approved', 'rejected'])) {
            $query->where('verification_status', $request->status);
        }

        $jobSeekers = $query->paginate(10);
        $barangays = Barangay::where('municipality', 'Opol')->get();

        return Inertia::render('Admin/Jobseeker', [
            'jobSeekers' => $jobSeekers,
            'barangays' => $barangays,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol',
            'currentStatus' => $request->status ?? 'all',
        ]);
    }

    /**
     * Store a new job seeker.
     */
    public function storeJobSeeker(Request $request): RedirectResponse
    {
       $validated = $request->validate([
    'first_name' => ['required', 'string', 'max:255'],
    'last_name' => ['required', 'string', 'max:255'],
    'birthdate' => ['required', 'date'],
    'contact_number' => ['required', 'string', 'max:20'],
    'email' => ['required', 'email', 'unique:users,email'],
    'barangay_id' => ['required', 'exists:barangays,id'],
    'preferred_template' => ['nullable', 'string', 'in:' . implode(',', array_keys(ResumeService::TEMPLATES))],
]);
        // Create user first
        $user = User::create([
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'password' => bcrypt('password'), // default password
            'role' => 'job_seeker',
        ]);

        // Create job seeker
        $jobSeeker = JobSeeker::create([
    'user_id' => $user->id,
    'first_name' => $validated['first_name'],
    'last_name' => $validated['last_name'],
    'birthdate' => $validated['birthdate'],
    'contact_number' => $validated['contact_number'],
    'email' => $validated['email'],
    'barangay_id' => $validated['barangay_id'],
    'preferred_template' => $validated['preferred_template'] ?? 'modern-professional',
    'is_fully_registered' => true,
]);

        // Auto-generate resume
        try {
            $resumeService = app(ResumeService::class);
            $resumeService->autoGenerateResume($jobSeeker);
        } catch (\Exception $e) {
            // Resume auto-generation is non-critical for creation
        }

        return redirect()->route('admin.jobseekers')->with('success', 'Job seeker added successfully.');
    }

    /**
     * Display the establishments page.
     */
    public function establishments(): Response
    {
        $establishments = Establishment::with(['user', 'barangay'])->paginate(10);
        $barangays = Barangay::where('municipality', 'Opol')->get();

        return Inertia::render('Admin/Establishment', [
            'establishments' => $establishments,
            'barangays' => $barangays,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol',
        ]);
    }

    /**
     * Store a new establishment.
     */
    public function storeEstablishment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'unique:users,email', 'unique:establishments,email'],
            'barangay_id' => ['required', 'exists:barangays,id'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['company_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'Establishment',
        ]);

        Establishment::create([
            'user_id' => $user->id,
            'company_name' => $validated['company_name'],
            'contact_person' => $validated['contact_person'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'],
            'barangay_id' => $validated['barangay_id'],
        ]);

        return redirect()->route('admin.establishments')->with('success', 'Establishment account created successfully.');
    }

    /**
     * Display the job vacancies page.
     */
    public function jobVacancies(): Response
    {
        $jobs = Job::with(['establishment', 'barangay'])->paginate(10);
        $barangays = Barangay::where('municipality', 'Opol')->get();
        $establishments = Establishment::all();

        return Inertia::render('Admin/JobVacancies', [
            'jobs' => $jobs,
            'barangays' => $barangays,
            'establishments' => $establishments,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol',
        ]);
    }

    /**
     * Store a new job vacancy.
     */
    public function storeJobVacancy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'salary_range' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'establishment_id' => ['required', 'exists:establishments,id'],
        ]);

        Job::create($validated);

        return redirect()->route('admin.jobvacancies')->with('success', 'Job vacancy added successfully.');
    }

    /**
     * Delete a job vacancy.
     */
    public function destroyJobVacancy(Job $job): RedirectResponse
    {
        $job->applications()->delete();
        $job->delete();

        return redirect()->route('admin.jobvacancies')->with('success', 'Job vacancy deleted successfully.');
    }

    /**
     * Display the applications page.
     */
    public function applications(): Response
    {
        $applications = Application::with(['jobSeeker', 'job'])->paginate(10);
        $jobSeekers = JobSeeker::all();
        $jobs = Job::all();

        return Inertia::render('Admin/Applications', [
            'applications' => $applications,
            'jobSeekers' => $jobSeekers,
            'jobs' => $jobs,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol',
        ]);
    }

    /**
     * Store a new application.
     */
    public function storeApplication(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'job_seeker_id' => ['required', 'exists:job_seekers,id'],
            'job_id' => ['required', 'exists:job,id'],
            'application_date' => ['required', 'date'],
        ]);

        Application::create($validated);

        return redirect()->route('admin.applications')->with('success', 'Application added successfully.');
    }

    /**
     * Display the hiring statuses page.
     */
    public function hiringStatuses(): Response
    {
        // Get all jobs with their hiring status and applicant count
        $jobs = Job::with(['establishment', 'barangay'])
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get job statistics
        $baseQuery = Job::query();

        $statistics = [
            'total_jobs' => (clone $baseQuery)->count(),
            'open' => (clone $baseQuery)->where('hiring_status', 'Open')->count(),
            'hiring' => (clone $baseQuery)->where('hiring_status', 'Hiring')->count(),
            'closed' => (clone $baseQuery)->where('hiring_status', 'Closed')->count(),
            'filled' => (clone $baseQuery)->where('hiring_status', 'Filled')->count(),
        ];

        return Inertia::render('Admin/HiringStatus', [
            'jobs' => $jobs,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Store a new hiring status.
     */
    public function storeHiringStatus(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'status_name' => ['required', 'string', 'max:255'],
        ]);

        HiringStatus::create($validated);

        return redirect()->route('admin.hiring-statuses')->with('success', 'Hiring status added successfully.');
    }

    /**
     * Display the map page.
     */
    public function map(): Response
    {
        $establishments = Establishment::with(['barangay'])
            ->withCount(['jobs as available_jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }])
            ->orderBy('company_name')
            ->paginate(50)
            ->through(function ($est) {
                $est->is_hiring = $est->jobs()
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                    ->exists();
                return $est;
            });

        $barangays = Barangay::select('id', 'barangay_name', 'latitude', 'longitude')->get();

        $industryCategories = Establishment::withLocation()
            ->whereNotNull('industry_category')
            ->distinct()
            ->orderBy('industry_category')
            ->pluck('industry_category')
            ->filter()
            ->values();

        $totalActiveJobs = Job::whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $totalApplications = Application::count();
        $pendingApplications = Application::whereHas('applicationStatus.hiringStatus', function ($q) {
            $q->where('status_name', 'pending');
        })->count();

        $barangayStats = Barangay::withCount(['jobSeekers as total_job_seekers'])
            ->get()
            ->map(function ($b) {
                return [
                    'name' => $b->barangay_name,
                    'latitude' => $b->latitude,
                    'longitude' => $b->longitude,
                    'job_seekers' => $b->total_job_seekers,
                    'establishments' => Establishment::where('barangay_id', $b->id)->count(),
                ];
            });

        return Inertia::render('Admin/Map', [
            'establishments' => $establishments,
            'barangays' => $barangays,
            'industryCategories' => $industryCategories,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol',
            'gisStats' => [
                'total_active_jobs' => $totalActiveJobs,
                'total_applications' => $totalApplications,
                'pending_applications' => $pendingApplications,
                'total_establishments' => $establishments->total(),
                'total_barangays' => $barangays->count(),
            ],
            'barangayStats' => $barangayStats,
        ]);
    }

    /**
     * Display the simplified GIS map (permanent).
     */
    public function gisMap(): Response
    {
        $hiringStatuses = ['Open', 'Hiring'];
        $closedStatuses = ['Closed', 'Filled'];
        $now = now();

        $establishments = Establishment::with(['barangay', 'jobs' => function ($q) {
                $q->select('id', 'establishment_id', 'job_title', 'hiring_status', 'vacant_positions', 'application_deadline', 'created_at', 'updated_at')
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                    ->orderBy('created_at', 'desc');
            }])
            ->withCount(['jobs as available_jobs_count' => function ($q) use ($hiringStatuses) {
                $q->whereIn('hiring_status', $hiringStatuses);
            }])
            ->withCount(['applications as total_applications_count'])
            ->orderBy('company_name')
            ->get()
            ->map(function ($e) use ($hiringStatuses, $now) {
                $hasActiveJobs = $e->available_jobs_count > 0;
                $jobsCount = $e->jobs()->count();
                $isClosed = !$hasActiveJobs && $jobsCount > 0;
                $noJobs = $jobsCount === 0;

                $hasHiringSoon = false;
                $hiringSoonJobs = [];
                $activeJobList = [];
                if ($hasActiveJobs) {
                    $activeJobs = $e->jobs()->whereIn('hiring_status', $hiringStatuses)->get();
                    foreach ($activeJobs as $j) {
                        $activeJobList[] = [
                            'id' => $j->id,
                            'job_title' => $j->job_title,
                            'vacant_positions' => (int) $j->vacant_positions,
                            'hiring_status' => $j->hiring_status,
                            'application_deadline' => $j->application_deadline?->format('Y-m-d'),
                        ];
                        if ($j->application_deadline && $now->diffInDays($j->application_deadline, false) <= 30 && $now->diffInDays($j->application_deadline, false) >= 0) {
                            $hasHiringSoon = true;
                            $hiringSoonJobs[] = $j->job_title;
                        }
                    }
                }

                $coordsFallback = false;
                $lat = $e->latitude;
                $lng = $e->longitude;
                if ((!$lat || !$lng) && $e->barangay && $e->barangay->latitude && $e->barangay->longitude) {
                    $lat = $e->barangay->latitude;
                    $lng = $e->barangay->longitude;
                    $coordsFallback = true;
                }

                $appCounts = Application::where('establishment_id', $e->id)
                    ->selectRaw("
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending,
                        SUM(CASE WHEN status = 'interview_scheduled' THEN 1 ELSE 0 END) as interview,
                        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired,
                        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                    ")->first();

                $hiringStatusLabel = 'registered';
                if ($hasActiveJobs && $hasHiringSoon) {
                    $hiringStatusLabel = 'hiring_soon';
                } elseif ($hasActiveJobs) {
                    $hiringStatusLabel = 'hiring';
                } elseif ($isClosed) {
                    $hiringStatusLabel = 'closed';
                }

                $lastUpdated = $e->updated_at ? $e->updated_at->format('Y-m-d H:i:s') : null;
                $lastJobUpdate = $e->jobs()->max('updated_at');
                if ($lastJobUpdate) {
                    $lastUpdated = max($lastUpdated, $lastJobUpdate instanceof \Carbon\Carbon ? $lastJobUpdate->format('Y-m-d H:i:s') : $lastJobUpdate);
                }

                return [
                    'id' => $e->id,
                    'company_name' => $e->company_name,
                    'contact_person' => $e->contact_person,
                    'contact_number' => $e->contact_number,
                    'email' => $e->email,
                    'address' => $e->address,
                    'barangay_name' => $e->barangay?->barangay_name,
                    'barangay_id' => $e->barangay_id,
                    'industry_category' => $e->industry_category,
                    'latitude' => $lat ? (float) $lat : null,
                    'longitude' => $lng ? (float) $lng : null,
                    'logo' => $e->logo,
                    'available_jobs_count' => (int) $e->available_jobs_count,
                    'is_hiring' => $hasActiveJobs,
                    'is_hiring_soon' => $hasHiringSoon,
                    'is_closed' => $isClosed,
                    'no_jobs' => $noJobs,
                    'hiring_status_label' => $hiringStatusLabel,
                    'total_applications' => (int) ($appCounts->total ?? 0),
                    'pending_applications' => (int) ($appCounts->pending ?? 0),
                    'interview_applications' => (int) ($appCounts->interview ?? 0),
                    'hired_applications' => (int) ($appCounts->hired ?? 0),
                    'rejected_applications' => (int) ($appCounts->rejected ?? 0),
                    'job_positions' => $activeJobList,
                    'last_updated' => $lastUpdated,
                    'coords_fallback' => $coordsFallback,
                ];
            });

        $barangays = Barangay::select('id', 'barangay_name', 'latitude', 'longitude')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $totalActiveJobs = Job::whereIn('hiring_status', $hiringStatuses)->count();
        $totalEstablishments = Establishment::count();
        $hiringEstablishments = Establishment::whereHas('jobs', function ($q) use ($hiringStatuses) {
            $q->whereIn('hiring_status', $hiringStatuses);
        })->count();
        $totalJobSeekers = JobSeeker::count();
        $totalApplications = Application::count();
        $pendingApplications = Application::where(function ($q) {
            $q->where('status', 'pending')->orWhereNull('status');
        })->count();
        $interviewsToday = Interview::whereDate('scheduled_date', now()->toDateString())->count();
        $hiredApplications = Application::where('status', 'hired')->count();
        $rejectedApplications = Application::where('status', 'rejected')->count();
        $employmentRate = $totalJobSeekers > 0 ? round(($hiredApplications / $totalJobSeekers) * 100, 1) : 0;

        $barangayStats = Barangay::withCount(['jobSeekers as total_job_seekers'])
            ->withCount(['jobSeekers as employed_count' => function ($q) {
                $q->where('employment_status', 'Employed');
            }])
            ->get()
            ->map(function ($b) {
                $estIds = Establishment::where('barangay_id', $b->id)->pluck('id');
                $hiringEstIds = Establishment::where('barangay_id', $b->id)
                    ->whereHas('jobs', function ($q) {
                        $q->whereIn('hiring_status', ['Open', 'Hiring']);
                    })->pluck('id');
                $activeJobs = Job::whereIn('establishment_id', $estIds)
                    ->whereIn('hiring_status', ['Open', 'Hiring'])->count();
                $applications = Application::whereHas('jobSeeker', function ($q) use ($b) {
                    $q->where('barangay_id', $b->id);
                })->count();
                $hired = Application::whereHas('jobSeeker', function ($q) use ($b) {
                    $q->where('barangay_id', $b->id);
                })->where('status', 'hired')->count();
                $allJobSeekers = JobSeeker::where('barangay_id', $b->id)->count();
                $topIndustry = Establishment::where('barangay_id', $b->id)
                    ->whereNotNull('industry_category')
                    ->select('industry_category', \Illuminate\Support\Facades\DB::raw('COUNT(*) as count'))
                    ->groupBy('industry_category')
                    ->orderByDesc('count')
                    ->first();

                return [
                    'name' => $b->barangay_name,
                    'latitude' => $b->latitude,
                    'longitude' => $b->longitude,
                    'job_seekers' => $allJobSeekers,
                    'total_establishments' => count($estIds),
                    'hiring_establishments' => count($hiringEstIds),
                    'active_jobs' => $activeJobs,
                    'applications' => $applications,
                    'hired' => $hired,
                    'employment_rate' => $allJobSeekers > 0 ? round(($hired / $allJobSeekers) * 100, 1) : 0,
                    'top_industry' => $topIndustry?->industry_category ?? 'N/A',
                ];
            });

        return Inertia::render('Admin/GisMap', [
            'establishments' => $establishments,
            'barangays' => $barangays,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol – Cagayan de Oro',
            'pesoOffice' => [
                'name' => 'PESO Opol Municipal Office',
                'latitude' => 8.5212,
                'longitude' => 124.5747,
                'address' => 'Municipal Hall, Opol, Misamis Oriental',
                'contact_number' => '(088) 567-1234',
                'email' => 'peso.opol@gmail.com',
            ],
            'gisStats' => [
                'total_establishments' => $totalEstablishments,
                'hiring_establishments' => $hiringEstablishments,
                'closed_establishments' => Establishment::whereHas('jobs', function ($q) {
                    $q->whereIn('hiring_status', ['Closed', 'Filled']);
                })->count(),
                'registered_establishments' => $totalEstablishments - $hiringEstablishments - Establishment::whereHas('jobs', function ($q) {
                    $q->whereIn('hiring_status', ['Closed', 'Filled']);
                })->count(),
                'active_vacancies' => $totalActiveJobs,
                'registered_job_seekers' => $totalJobSeekers,
                'total_applications' => $totalApplications,
                'pending_applications' => $pendingApplications,
                'interview_today' => $interviewsToday,
                'hired_applicants' => $hiredApplications,
                'rejected_applicants' => $rejectedApplications,
                'employment_rate' => $employmentRate,
            ],
            'barangayStats' => $barangayStats,
        ]);
    }

    /**
     * Display hiring establishments with their active job listings.
     */
    public function hiringEstablishments(): Response
    {
        $establishments = Establishment::with(['barangay', 'user', 'jobs' => function ($q) {
                $q->select('id', 'establishment_id', 'job_title', 'educational_background', 'employment_type', 'work_arrangement', 'vacant_positions', 'hiring_status', 'created_at')
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                        ->with(['applications' => function ($q) {
                        $q->with([
                            'jobSeeker.user',
                            'jobSeeker.barangay',
                            'jobSeeker.resume',
                            'applicationStatus.hiringStatus',
                            'interview'
                        ])
                        ->orderBy('created_at', 'desc');
                    }]);
            }])
            ->whereHas('jobs', function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            })
            ->withCount(['jobs as jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }])
            ->withCount(['applications as applicants_count'])
            ->orderBy('company_name')
            ->paginate(10);

        $statistics = [
            'total' => Establishment::whereHas('jobs', function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            })->count(),
            'active_jobs' => Job::whereIn('hiring_status', ['Open', 'Hiring'])->count(),
            'total_applicants' => Application::whereHas('job', function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            })->count(),
            'hiring_rate' => Job::count() > 0
                ? round((Job::whereIn('hiring_status', ['Open', 'Hiring'])->count() / Job::count()) * 100)
                : 0,
        ];

        $barangays = Barangay::where('municipality', 'Opol')->get();

        return Inertia::render('Admin/HiringEstablishments', [
            'establishments' => $establishments,
            'statistics' => $statistics,
            'barangays' => $barangays,
        ]);
    }

    /**
     * Display the user management page.
     */
    public function userManagement(): Response
    {
        $users = User::whereNot('role', 'job_seeker')
            ->orderBy('id', 'desc')
            ->paginate(10);

        $barangays = Barangay::orderBy('barangay_name')->get(['id', 'barangay_name', 'latitude', 'longitude']);

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'barangays' => $barangays,
        ]);
    }

    /**
     * Store a new user account (Admin, Staff, Establishment, or Barangay).
     */
    public function storeUserAccount(Request $request): RedirectResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'in:staff,Establishment,baranggay,admin'],
            'password' => ['nullable', 'string', 'min:6'],
            'password_confirmation' => ['nullable', 'string', 'min:6', 'same:password'],
        ];

        if ($request->role === 'Establishment') {
            $rules = array_merge($rules, [
                'company_name' => ['required', 'string', 'max:255', 'unique:establishments,company_name'],
                'contact_person' => ['required', 'string', 'max:255'],
                'contact_number' => ['required', 'string', 'regex:/^(0|\+63)\d{9,12}$/'],
                'barangay_id' => ['required', 'exists:barangays,id'],
                'latitude' => ['nullable', 'numeric', 'between:-90,90'],
                'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            ]);
        }

        $validated = $request->validate($rules);

        $password = $validated['password'] ?? \Illuminate\Support\Str::random(12);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'role' => $validated['role'],
        ]);

        if ($validated['role'] === 'Establishment') {
            Establishment::updateOrCreate(
                ['email' => $validated['email']],
                [
                    'user_id' => $user->id,
                    'company_name' => $validated['company_name'],
                    'contact_person' => $validated['contact_person'],
                    'contact_number' => $validated['contact_number'],
                    'barangay_id' => $validated['barangay_id'],
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                ]
            );
        }

        return redirect()->route('admin.user-management')->with('success', 'User account created successfully.');
    }

    /**
     * Approve a job seeker account.
     */
    public function approveJobSeeker(JobSeeker $jobSeeker): RedirectResponse
    {
        $jobSeeker->update([
            'verification_status' => 'approved',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        $user = $jobSeeker->user;
        if ($user) {
            try {
                NotificationService::sendAccountApproved($user);
            } catch (\Exception $e) {
                // Non-critical
            }
        }

        return back()->with('success', 'Job seeker account approved successfully.');
    }

    /**
     * Reject a job seeker account.
     */
    public function rejectJobSeeker(Request $request, JobSeeker $jobSeeker): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $jobSeeker->update([
            'verification_status' => 'rejected',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
            'verification_notes' => $validated['reason'] ?? null,
        ]);

        $user = $jobSeeker->user;
        if ($user) {
            try {
                NotificationService::sendAccountRejected($user, $validated['reason'] ?? 'Account verification not approved.');
            } catch (\Exception $e) {
                // Non-critical
            }
        }

        return back()->with('success', 'Job seeker account rejected.');
    }

    /**
     * Suspend a job seeker account.
     */
    public function suspendJobSeeker(Request $request, JobSeeker $jobSeeker): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $user = $jobSeeker->user;
        if ($user) {
            $user->update(['is_active' => false]);

            try {
                NotificationService::sendAccountSuspended($user, $validated['reason'], 'job_seeker');
            } catch (\Exception $e) {
                // Non-critical
            }
        }

        return back()->with('success', 'Job seeker account suspended successfully.');
    }

    /**
     * Suspend an establishment account.
     */
    public function suspendEstablishment(Request $request, Establishment $establishment): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $user = $establishment->user;
        if ($user) {
            $user->update(['is_active' => false]);

            try {
                NotificationService::sendAccountSuspended($user, $validated['reason'], 'establishment');
            } catch (\Exception $e) {
                // Non-critical
            }
        }

        return back()->with('success', 'Establishment account suspended successfully.');
    }

    /**
     * Delete an establishment.
     */
    public function destroyEstablishment(Establishment $establishment): RedirectResponse
    {
        $establishment->applications()->delete();
        $establishment->jobs()->delete();
        $user = $establishment->user;
        $establishment->delete();
        if ($user) {
            $user->delete();
        }

        return redirect()->route('admin.establishments')->with('success', 'Establishment deleted successfully.');
    }

    /**
     * Deactivate a user account.
     */
    public function deactivateUser(User $user): RedirectResponse
    {
        $user->update(['is_active' => false]);

        return redirect()->route('admin.user-management')->with('success', 'User deactivated successfully.');
    }
}
