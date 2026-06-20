<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Barangay;
use App\Models\Establishment;
use App\Models\HiringStatus;
use App\Models\Job;
use App\Models\JobSeeker;
use App\Models\User;
use App\Services\ResumeService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
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

            $role = Auth::user()->role;

            if ($role === 'admin') {
                return redirect()->intended(route('admin.dashboard', absolute: false));
            }

            if ($role === 'staff') {
                return redirect()->intended(route('staff.dashboard', absolute: false));
            }

            if ($role === 'Establishment') {
                return redirect()->intended(route('establishment.dashboard', absolute: false));
            }

            if ($role === 'job_seeker') {
                return redirect()->intended(route('jobseeker.dashboard', absolute: false));
            }

            if ($role === 'baranggay') {
                return redirect()->intended(route('baranggay.dashboard', absolute: false));
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
    public function dashboard(): Response
    {
        $statistics = [
            'total_job_seekers' => JobSeeker::count(),
            'active_employers' => Establishment::count(),
            'job_vacancies' => Job::count(),
            'new_applications' => Application::whereMonth('created_at', now()->month)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $statistics,
        ]);
    }

    /**
     * Display the jobseekers page.
     */
    public function jobseekers(): Response
    {
        $jobSeekers = JobSeeker::with(['user', 'barangay'])->paginate(10);
        $barangays = Barangay::where('municipality', 'Opol')->get();

        return Inertia::render('Admin/Jobseeker', [
            'jobSeekers' => $jobSeekers,
            'barangays' => $barangays,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol',
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

        $establishments = Establishment::with(['barangay'])
            ->whereNotNull('user_id')
            ->whereHas('jobs', function ($q) use ($hiringStatuses) {
                $q->whereIn('hiring_status', $hiringStatuses);
            })
            ->withCount(['jobs as available_jobs_count' => function ($q) use ($hiringStatuses) {
                $q->whereIn('hiring_status', $hiringStatuses);
            }])
            ->orderBy('company_name')
            ->get()
            ->map(function ($e) {
                $data = $e->toArray();
                $data['available_jobs_count'] = $e->available_jobs_count;
                $data['is_hiring'] = $e->available_jobs_count > 0;
                if ((!$e->latitude || !$e->longitude) && $e->barangay && $e->barangay->latitude && $e->barangay->longitude) {
                    $data['latitude'] = $e->barangay->latitude;
                    $data['longitude'] = $e->barangay->longitude;
                    $data['coords_fallback'] = true;
                }
                return $data;
            });

        $barangays = Barangay::select('id', 'barangay_name', 'latitude', 'longitude')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $totalActiveJobs = Job::whereIn('hiring_status', $hiringStatuses)
            ->whereHas('establishment', function ($q) {
                $q->whereNotNull('user_id');
            })
            ->count();

        $barangayStats = Barangay::withCount(['jobSeekers as total_job_seekers'])
            ->get()
            ->map(function ($b) {
                return [
                    'name' => $b->barangay_name,
                    'latitude' => $b->latitude,
                    'longitude' => $b->longitude,
                    'job_seekers' => $b->total_job_seekers,
                    'establishments' => Establishment::where('barangay_id', $b->id)
                        ->whereNotNull('user_id')
                        ->whereHas('jobs', function ($q) {
                            $q->whereIn('hiring_status', ['Open', 'Hiring']);
                        })
                        ->count(),
                ];
            });

        return Inertia::render('Admin/GisMap', [
            'establishments' => $establishments,
            'barangays' => $barangays,
            'region' => 'Misamis Oriental',
            'municipality' => 'Opol – Cagayan de Oro',
            'gisStats' => [
                'total_establishments' => count($establishments),
                'total_active_jobs' => $totalActiveJobs,
                'total_barangays' => $barangays->count(),
            ],
            'barangayStats' => $barangayStats,
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

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
        ]);
    }

    /**
     * Store a new user account (Staff or Establishment).
     */
    public function storeUserAccount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'in:staff,Establishment,baranggay'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $password = $validated['password'] ?? 'password';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'role' => $validated['role'],
        ]);

        if (($validated['role'] ?? null) === 'Establishment') {
            Establishment::whereRaw('LOWER(email) = ?', [strtolower((string) $validated['email'])])
                ->whereNull('user_id')
                ->update(['user_id' => $user->id]);
        }

        return redirect()->route('admin.user-management')->with('success', 'User account created successfully.');
    }
}
