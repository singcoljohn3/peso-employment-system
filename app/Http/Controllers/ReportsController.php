<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Barangay;
use App\Models\Establishment;
use App\Models\HiringStatus;
use App\Models\Interview;
use App\Models\Job;
use App\Models\JobSeeker;
use App\Models\Resume;
use App\Models\Skill;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /**
     * Display the reports page.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Reports');
    }

    /**
     * Get all dashboard statistics for summary cards.
     */
    public function getStatistics(Request $request)
    {
        $dateRange = $request->input('date_range', 'all');
        $barangayId = $request->input('barangay_id');
        $establishmentId = $request->input('establishment_id');

        // Base application query with filters
        $appQuery = Application::query();
        $this->applyDateRangeFilter($appQuery, $dateRange);
        if ($barangayId) {
            $appQuery->whereHas('jobSeeker', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }
        if ($establishmentId) {
            $appQuery->whereHas('job.establishment', function ($q) use ($establishmentId) {
                $q->where('id', $establishmentId);
            });
        }

        // Previous period query for comparison
        $prevQuery = Application::query();
        $this->applyPreviousPeriodFilter($prevQuery, $dateRange);
        if ($barangayId) {
            $prevQuery->whereHas('jobSeeker', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }
        if ($establishmentId) {
            $prevQuery->whereHas('job.establishment', function ($q) use ($establishmentId) {
                $q->where('id', $establishmentId);
            });
        }

        $totalJobSeekers = JobSeeker::count();
        $totalEstablishments = Establishment::count();
        $totalJobVacancies = Job::count();
        $totalApplications = $appQuery->count();
        $pendingApplications = (clone $appQuery)->where('status', 'pending')->count();
        $approvedApplications = (clone $appQuery)->where('status', 'approved')->count();
        $interviewedApplicants = (clone $appQuery)->where('status', 'interview')->count();
        $hiredApplicants = (clone $appQuery)->where('status', 'hired')->count();
        $rejectedApplicants = (clone $appQuery)->where('status', 'rejected')->count();
        $activeHiringEstablishments = Establishment::whereHas('jobs', function ($q) {
            $q->whereIn('hiring_status', ['Open', 'Hiring']);
        })->count();
        $closedJobVacancies = Job::where('status', 'Closed')->orWhere('hiring_status', 'Closed')->count();
        $monthlyEmploymentRate = $totalApplications > 0 ? round(($hiredApplicants / $totalApplications) * 100, 2) : 0;

        // Previous period counts for percentage change
        $prevTotalApplications = (clone $prevQuery)->count();
        $prevHiredApplicants = (clone $prevQuery)->where('status', 'hired')->count();
        $prevPending = (clone $prevQuery)->where('status', 'pending')->count();
        $prevApproved = (clone $prevQuery)->where('status', 'approved')->count();
        $prevInterviewed = (clone $prevQuery)->where('status', 'interview')->count();
        $prevRejected = (clone $prevQuery)->where('status', 'rejected')->count();

        // Monthly statistics
        $monthlyStats = Application::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('month', 'year')
        ->orderBy('year', 'desc')
        ->orderBy('month', 'desc')
        ->limit(12)
        ->get();

        // Barangay employment summaries
        $barangayStats = DB::table('job_seekers as js')
            ->leftJoin('applications as a', 'js.id', '=', 'a.job_seeker_id')
            ->leftJoin('barangays as b', 'js.barangay_id', '=', 'b.id')
            ->select(
                'b.barangay_name as barangay_name',
                DB::raw('COUNT(js.id) as total_seekers'),
                DB::raw('COUNT(CASE WHEN a.status = "hired" THEN 1 END) as hired_count')
            )
            ->groupBy('b.id', 'b.barangay_name')
            ->orderBy('hired_count', 'desc')
            ->get();

        // Employer hiring analytics
        $employerStats = DB::table('establishments as e')
            ->leftJoin('jobs as j', 'e.id', '=', 'j.establishment_id')
            ->leftJoin('applications as a', 'j.id', '=', 'a.job_id')
            ->select(
                'e.company_name',
                'e.id as establishment_id',
                DB::raw('COUNT(DISTINCT j.id) as total_jobs'),
                DB::raw('COUNT(a.id) as total_applications'),
                DB::raw('COUNT(CASE WHEN a.status = "hired" THEN 1 END) as hired_count')
            )
            ->groupBy('e.id', 'e.company_name')
            ->orderBy('hired_count', 'desc')
            ->limit(10)
            ->get();

        // Job vacancy trends
        $jobTrends = Job::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('month', 'year')
        ->orderBy('year', 'desc')
        ->orderBy('month', 'desc')
        ->limit(12)
        ->get();

        return response()->json([
            'total_job_seekers' => $totalJobSeekers,
            'total_employers' => $totalEstablishments,
            'total_establishments' => $totalEstablishments,
            'total_job_vacancies' => $totalJobVacancies,
            'total_applications' => $totalApplications,
            'pending_applications' => $pendingApplications,
            'approved_applications' => $approvedApplications,
            'interviewed_applicants' => $interviewedApplicants,
            'hired_count' => $hiredApplicants,
            'rejected_applicants' => $rejectedApplicants,
            'active_hiring_establishments' => $activeHiringEstablishments,
            'closed_job_vacancies' => $closedJobVacancies,
            'monthly_employment_rate' => $monthlyEmploymentRate,
            'unemployed_count' => $totalJobSeekers - $hiredApplicants,
            'monthly_stats' => $monthlyStats,
            'barangay_stats' => $barangayStats,
            'employer_stats' => $employerStats,
            'job_trends' => $jobTrends,
            'hiring_rate' => $totalJobSeekers > 0 ? round(($hiredApplicants / $totalJobSeekers) * 100, 2) : 0,
            'percentages' => [
                'total_applications' => $prevTotalApplications > 0 ? round((($totalApplications - $prevTotalApplications) / $prevTotalApplications) * 100, 1) : 0,
                'hired' => $prevHiredApplicants > 0 ? round((($hiredApplicants - $prevHiredApplicants) / $prevHiredApplicants) * 100, 1) : 0,
                'pending' => $prevPending > 0 ? round((($pendingApplications - $prevPending) / $prevPending) * 100, 1) : 0,
                'approved' => $prevApproved > 0 ? round((($approvedApplications - $prevApproved) / $prevApproved) * 100, 1) : 0,
                'interviewed' => $prevInterviewed > 0 ? round((($interviewedApplicants - $prevInterviewed) / $prevInterviewed) * 100, 1) : 0,
                'rejected' => $prevRejected > 0 ? round((($rejectedApplicants - $prevRejected) / $prevRejected) * 100, 1) : 0,
            ],
        ]);
    }

    /**
     * Get monthly application data for charts.
     */
    public function getMonthlyApplications(Request $request)
    {
        $year = $request->input('year', now()->year);
        
        $data = Application::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->whereYear('created_at', $year)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Fill in missing months with 0
        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $data->firstWhere('month', $i);
            $monthlyData[] = [
                'month' => $i,
                'count' => $monthData ? $monthData->count : 0,
                'month_name' => date('F', mktime(0, 0, 0, $i, 1))
            ];
        }

        return response()->json($monthlyData);
    }

    /**
     * Get hiring status distribution for pie chart.
     */
    public function getHiringStatusDistribution()
    {
        $distribution = Application::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json($distribution);
    }

    /**
     * Get employment growth data for line chart.
     */
    public function getEmploymentGrowth(Request $request)
    {
        $period = $request->input('period', 'monthly');
        $limit = $request->input('limit', 12);

        $query = Application::select(
            DB::raw('COUNT(*) as count'),
            DB::raw('COUNT(CASE WHEN status = "hired" THEN 1 END) as hired')
        );

        switch ($period) {
            case 'daily':
                $query->selectRaw('DATE(created_at) as period')
                      ->groupBy('period')
                      ->orderBy('period', 'desc')
                      ->limit($limit);
                break;
            case 'weekly':
                $query->selectRaw('YEARWEEK(created_at) as period')
                      ->groupBy('period')
                      ->orderBy('period', 'desc')
                      ->limit($limit);
                break;
            case 'monthly':
            default:
                $query->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as period')
                      ->groupBy('period')
                      ->orderBy('period', 'desc')
                      ->limit($limit);
                break;
        }

        $data = $query->get()->reverse();

        return response()->json($data);
    }

    /**
     * Get filtered reports data.
     */
    public function getFilteredReports(Request $request)
    {
        $query = Application::with(['jobSeeker', 'job.establishment', 'jobSeeker.barangay']);

        // Apply filters
        if ($request->input('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->input('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        if ($request->input('barangay_id')) {
            $query->whereHas('jobSeeker', function ($q) use ($request) {
                $q->where('barangay_id', $request->input('barangay_id'));
            });
        }

        if ($request->input('establishment_id')) {
            $query->whereHas('job.establishment', function ($q) use ($request) {
                $q->where('id', $request->input('establishment_id'));
            });
        }

        if ($request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->input('educational_background')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('educational_background', $request->input('educational_background'));
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 10);
        $reports = $query->paginate($perPage);

        return response()->json($reports);
    }

    // ---- NEW ANALYTICS ENDPOINTS ----

    /**
     * Get monthly registered job seekers.
     */
    public function getMonthlyJobSeekers(Request $request)
    {
        $year = $request->input('year', now()->year);
        $data = JobSeeker::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->whereYear('created_at', $year)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $data->firstWhere('month', $i);
            $monthlyData[] = [
                'month' => $i,
                'count' => $monthData ? $monthData->count : 0,
                'month_name' => date('F', mktime(0, 0, 0, $i, 1))
            ];
        }
        return response()->json($monthlyData);
    }

    /**
     * Get monthly registered establishments.
     */
    public function getMonthlyEstablishments(Request $request)
    {
        $year = $request->input('year', now()->year);
        $data = Establishment::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->whereYear('created_at', $year)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $data->firstWhere('month', $i);
            $monthlyData[] = [
                'month' => $i,
                'count' => $monthData ? $monthData->count : 0,
                'month_name' => date('F', mktime(0, 0, 0, $i, 1))
            ];
        }
        return response()->json($monthlyData);
    }

    /**
     * Get top hiring establishments.
     */
    public function getTopHiringEstablishments(Request $request)
    {
        $limit = $request->input('limit', 10);
        $data = Establishment::withCount(['applications as hired_count' => function ($q) {
                $q->where('status', 'hired');
            }])
            ->withCount(['applications as total_applications'])
            ->withCount(['jobs as total_jobs'])
            ->orderBy('hired_count', 'desc')
            ->limit($limit)
            ->get(['id', 'company_name', 'industry_category', 'barangay_id'])
            ->load('barangay');

        return response()->json($data);
    }

    /**
     * Get top applied job vacancies.
     */
    public function getTopAppliedJobs(Request $request)
    {
        $limit = $request->input('limit', 10);
        $data = Job::withCount('applications')
            ->withCount(['applications as hired_count' => function ($q) {
                $q->where('status', 'hired');
            }])
            ->with('establishment:id,company_name')
            ->orderByDesc('applications_count')
            ->limit($limit)
            ->get(['id', 'job_title', 'educational_background', 'establishment_id', 'vacant_positions', 'hiring_status']);

        return response()->json($data);
    }

    /**
     * Get barangay employment distribution.
     */
    public function getBarangayEmploymentDistribution(Request $request)
    {
        $data = Barangay::withCount(['jobSeekers as total_seekers'])
            ->withCount(['jobSeekers as hired_count' => function ($q) {
                $q->whereHas('applications', function ($qq) {
                    $qq->where('status', 'hired');
                });
            }])
            ->withCount(['jobSeekers as applications_count' => function ($q) {
                $q->whereHas('applications');
            }])
            ->orderByDesc('total_seekers')
            ->get(['id', 'barangay_name', 'municipality']);

        return response()->json($data);
    }

    /**
     * Get most requested skills.
     */
    public function getMostRequestedSkills(Request $request)
    {
        $limit = $request->input('limit', 10);
        $data = Skill::withCount('jobSeekers')
            ->withCount('jobs')
            ->orderByDesc('job_seekers_count')
            ->limit($limit)
            ->get(['id', 'skill_name']);

        return response()->json($data);
    }

    /**
     * Get most in-demand educational backgrounds.
     */
    public function getMostInDemandCategories(Request $request)
    {
        $data = Job::select('educational_background', DB::raw('COUNT(*) as total_jobs'),
                DB::raw('(SELECT COUNT(*) FROM applications WHERE job_id = job.id) as total_applications'),
                DB::raw('(SELECT COUNT(*) FROM applications WHERE job_id = job.id AND status = "hired") as hired_count'))
            ->whereNotNull('educational_background')
            ->groupBy('educational_background')
            ->orderByDesc('total_applications')
            ->get();

        return response()->json($data);
    }

    /**
     * Get average hiring time.
     */
    public function getAverageHiringTime()
    {
        $avgTime = Application::where('status', 'hired')
            ->selectRaw('AVG(DATEDIFF(COALESCE(updated_at, created_at), created_at)) as avg_days')
            ->first();

        $totalJobs = Job::count();
        $totalApplications = Application::count();
        $avgPerJob = $totalJobs > 0 ? round($totalApplications / $totalJobs, 1) : 0;

        $hired = Application::where('status', 'hired')->count();
        $successRate = $totalApplications > 0 ? round(($hired / $totalApplications) * 100, 2) : 0;

        return response()->json([
            'average_hiring_time_days' => round($avgTime->avg_days ?? 0),
            'average_applications_per_job' => $avgPerJob,
            'hiring_success_rate' => $successRate,
        ]);
    }

    /**
     * Get recent activities.
     */
    public function getRecentActivities(Request $request)
    {
        $limit = $request->input('limit', 10);

        $recentSeekers = JobSeeker::latest()->take(5)->get(['id', 'first_name', 'last_name', 'created_at']);
        $recentEstablishments = Establishment::latest()->take(5)->get(['id', 'company_name', 'created_at']);
        $recentJobs = Job::with('establishment:id,company_name')->latest()->take(5)->get(['id', 'job_title', 'establishment_id', 'created_at']);
        $recentApplications = Application::with(['jobSeeker:id,first_name,last_name', 'job:id,job_title'])
            ->latest()->take(5)->get(['id', 'job_seeker_id', 'job_id', 'status', 'created_at']);
        $recentInterviews = Interview::with(['application.jobSeeker:id,first_name,last_name', 'application.job:id,job_title'])
            ->latest()->take(5)->get(['id', 'application_id', 'interview_date', 'status', 'created_at']);

        return response()->json([
            'recent_job_seekers' => $recentSeekers,
            'recent_establishments' => $recentEstablishments,
            'recent_job_vacancies' => $recentJobs,
            'recent_applications' => $recentApplications,
            'recent_interviews' => $recentInterviews,
        ]);
    }

    /**
     * Get system monitoring status.
     */
    public function getSystemMonitoring()
    {
        $dbConnected = false;
        try {
            DB::connection()->getPdo();
            $dbConnected = true;
        } catch (\Exception $e) {
            $dbConnected = false;
        }

        $storagePath = storage_path();
        $totalSpace = disk_total_space($storagePath);
        $freeSpace = disk_free_space($storagePath);
        $usedSpace = $totalSpace - $freeSpace;
        $usagePercent = $totalSpace > 0 ? round(($usedSpace / $totalSpace) * 100, 1) : 0;

        $lastBackup = null;
        $backupPath = storage_path('app/backups');
        if (is_dir($backupPath)) {
            $files = glob($backupPath . '/*');
            if (!empty($files)) {
                $lastBackup = new \DateTime();
                $lastBackup->setTimestamp(max(array_map('filemtime', $files)));
                $lastBackup = $lastBackup->format('Y-m-d H:i:s');
            }
        }

        return response()->json([
            'database_connection' => $dbConnected ? 'Connected' : 'Disconnected',
            'database_status' => $dbConnected ? 'operational' : 'error',
            'api_status' => 'operational',
            'mobile_app_connection' => 'operational',
            'admin_portal_connection' => 'operational',
            'establishment_portal_connection' => 'operational',
            'last_backup_date' => $lastBackup ?? 'No backup found',
            'storage_usage' => $usagePercent,
            'storage_used' => $this->formatBytes($usedSpace),
            'storage_total' => $this->formatBytes($totalSpace),
            'storage_free' => $this->formatBytes($freeSpace),
            'system_uptime' => $this->getSystemUptime(),
            'total_job_seekers' => JobSeeker::count(),
            'total_establishments' => Establishment::count(),
            'total_jobs' => Job::count(),
            'total_applications' => Application::count(),
        ]);
    }

    /**
     * Get job seekers report table.
     */
    public function getJobSeekersReport(Request $request)
    {
        $query = JobSeeker::with(['barangay:id,barangay_name', 'user:id,email'])
            ->withCount(['applications as total_applications'])
            ->withCount(['applications as hired_applications' => function ($q) {
                $q->where('status', 'hired');
            }]);

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }

        if ($request->input('barangay_id')) {
            $query->where('barangay_id', $request->input('barangay_id'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Get establishments report table.
     */
    public function getEstablishmentsReport(Request $request)
    {
        $query = Establishment::with(['barangay:id,barangay_name'])
            ->withCount(['jobs as total_jobs'])
            ->withCount(['applications as total_applications'])
            ->withCount(['applications as hired_applications' => function ($q) {
                $q->where('status', 'hired');
            }]);

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->input('barangay_id')) {
            $query->where('barangay_id', $request->input('barangay_id'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Get job vacancies report table.
     */
    public function getJobVacanciesReport(Request $request)
    {
        $query = Job::with(['establishment:id,company_name', 'barangay:id,barangay_name'])
            ->withCount(['applications as total_applications'])
            ->withCount(['applications as hired_applications' => function ($q) {
                $q->where('status', 'hired');
            }]);

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('job_title', 'like', "%{$search}%")
                  ->orWhere('educational_background', 'like', "%{$search}%")
                  ->orWhere('employment_type', 'like', "%{$search}%");
            });
        }

        if ($request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->input('educational_background')) {
            $query->where('educational_background', $request->input('educational_background'));
        }

        if ($request->input('establishment_id')) {
            $query->where('establishment_id', $request->input('establishment_id'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Get applications report table.
     */
    public function getApplicationsReport(Request $request)
    {
        $query = Application::with([
            'jobSeeker:id,first_name,last_name,email,contact_number,barangay_id',
            'jobSeeker.barangay:id,barangay_name',
            'job:id,job_title,educational_background,establishment_id',
            'job.establishment:id,company_name',
            'interview:id,application_id,interview_date,status',
        ]);

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('jobSeeker', function ($qq) use ($search) {
                    $qq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%");
                })->orWhereHas('job', function ($qq) use ($search) {
                    $qq->where('job_title', 'like', "%{$search}%");
                })->orWhere('status', 'like', "%{$search}%");
            });
        }

        if ($request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->input('establishment_id')) {
            $query->where('establishment_id', $request->input('establishment_id'));
        }

        if ($request->input('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->input('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Get hiring status report.
     */
    public function getHiringStatusReport(Request $request)
    {
        $query = Application::select(
                'status',
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(DISTINCT job_seeker_id) as unique_applicants'),
                DB::raw('COUNT(DISTINCT job_id) as unique_jobs'),
                DB::raw('COUNT(DISTINCT establishment_id) as unique_establishments')
            )
            ->groupBy('status');

        if ($request->input('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->input('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $data = $query->get();
        $total = $data->sum('total');

        return response()->json([
            'data' => $data,
            'total' => $total,
        ]);
    }

    /**
     * Get employment statistics report.
     */
    public function getEmploymentStatisticsReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Application::query();
        if ($startDate) $query->whereDate('created_at', '>=', $startDate);
        if ($endDate) $query->whereDate('created_at', '<=', $endDate);

        $totalApplicants = JobSeeker::count();
        $totalEmployed = (clone $query)->where('status', 'hired')->count();
        $totalUnemployed = $totalApplicants - $totalEmployed;

        $employmentRate = $totalApplicants > 0 ? round(($totalEmployed / $totalApplicants) * 100, 2) : 0;

        $bySex = JobSeeker::select('sex', DB::raw('COUNT(*) as count'))
            ->groupBy('sex')
            ->get();

        $byEducation = JobSeeker::select('educational_attainment', DB::raw('COUNT(*) as count'))
            ->whereNotNull('educational_attainment')
            ->groupBy('educational_attainment')
            ->get();

        return response()->json([
            'total_applicants' => $totalApplicants,
            'total_employed' => $totalEmployed,
            'total_unemployed' => max(0, $totalUnemployed),
            'employment_rate' => $employmentRate,
            'by_sex' => $bySex,
            'by_education' => $byEducation,
        ]);
    }

    /**
     * Get barangay employment report.
     */
    public function getBarangayEmploymentReport(Request $request)
    {
        $query = DB::table('barangays as b')
            ->leftJoin('job_seekers as js', 'b.id', '=', 'js.barangay_id')
            ->leftJoin('applications as a', 'js.id', '=', 'a.job_seeker_id')
            ->select(
                'b.id',
                'b.barangay_name',
                'b.municipality',
                DB::raw('COUNT(DISTINCT js.id) as total_seekers'),
                DB::raw('COUNT(DISTINCT a.id) as total_applications'),
                DB::raw('COUNT(DISTINCT CASE WHEN a.status = "hired" THEN a.id END) as hired_count'),
                DB::raw('COUNT(DISTINCT CASE WHEN a.status = "pending" THEN a.id END) as pending_count')
            )
            ->groupBy('b.id', 'b.barangay_name', 'b.municipality')
            ->orderByDesc('total_seekers');

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->where('b.barangay_name', 'like', "%{$search}%");
        }

        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'total_seekers');
        $sortOrder = $request->input('sort_order', 'desc');

        $query->orderBy($sortBy, $sortOrder);
        $data = $query->paginate($perPage);

        return response()->json($data);
    }

    /**
     * Get resume generation report.
     */
    public function getResumeGenerationReport(Request $request)
    {
        $query = Resume::with(['jobSeeker:id,first_name,last_name', 'generatedBy:id,name'])
            ->select(['id', 'job_seeker_id', 'template', 'status', 'generated_by', 'generated_at', 'downloaded_at', 'download_count', 'created_at']);

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->whereHas('jobSeeker', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        if ($request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Get application trend by month.
     */
    public function getApplicationTrend(Request $request)
    {
        $year = $request->input('year', now()->year);

        $data = Application::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as total'),
            DB::raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending'),
            DB::raw('COUNT(CASE WHEN status = "hired" THEN 1 END) as hired'),
            DB::raw('COUNT(CASE WHEN status = "rejected" THEN 1 END) as rejected'),
            DB::raw('COUNT(CASE WHEN status = "interview" THEN 1 END) as interviewed')
        )
        ->whereYear('created_at', $year)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $data->firstWhere('month', $i);
            $monthlyData[] = [
                'month' => $i,
                'month_name' => date('F', mktime(0, 0, 0, $i, 1)),
                'total' => $monthData ? (int)$monthData->total : 0,
                'pending' => $monthData ? (int)$monthData->pending : 0,
                'hired' => $monthData ? (int)$monthData->hired : 0,
                'rejected' => $monthData ? (int)$monthData->rejected : 0,
                'interviewed' => $monthData ? (int)$monthData->interviewed : 0,
            ];
        }

        return response()->json($monthlyData);
    }

    /**
     * Get employment success rate data.
     */
    public function getEmploymentSuccessRate(Request $request)
    {
        $year = $request->input('year', now()->year);

        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $total = Application::whereYear('created_at', $year)
                ->whereMonth('created_at', $i)
                ->count();
            $hired = Application::whereYear('created_at', $year)
                ->whereMonth('created_at', $i)
                ->where('status', 'hired')
                ->count();
            $rate = $total > 0 ? round(($hired / $total) * 100, 1) : 0;

            $monthlyData[] = [
                'month' => $i,
                'month_name' => date('F', mktime(0, 0, 0, $i, 1)),
                'total' => $total,
                'hired' => $hired,
                'rate' => $rate,
            ];
        }

        return response()->json($monthlyData);
    }

    /**
     * Export reports to PDF.
     */
    /**
     * Get all reports data in a single consolidated response.
     */
    public function getReportsData(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $year = $request->input('year', now()->year);

        $appQuery = Application::query();
        if ($startDate) $appQuery->whereDate('created_at', '>=', $startDate);
        if ($endDate) $appQuery->whereDate('created_at', '<=', $endDate);

        $totalJobSeekers = JobSeeker::count();
        $activeEstablishments = Establishment::whereHas('jobs', fn($q) => $q->whereIn('hiring_status', ['Open', 'Hiring']))->count();
        $totalJobVacancies = Job::count();
        $totalApplications = (clone $appQuery)->count();
        $hired = (clone $appQuery)->where('status', 'hired')->count();
        $pending = (clone $appQuery)->where('status', 'pending')->count();
        $rejected = (clone $appQuery)->where('status', 'rejected')->count();
        $generatedResumes = Resume::count();
        $hiringRate = $totalApplications > 0 ? round(($hired / $totalApplications) * 100, 2) : 0;

        $topEstablishments = Establishment::select('id', 'company_name', 'industry_category')
            ->withCount(['jobs as total_job_vacancies'])
            ->withCount(['applications as total_hired' => fn($q) => $q->where('status', 'hired')])
            ->orderByDesc('total_hired')
            ->limit(10)
            ->get()
            ->map(fn($e) => [
                'company_name' => $e->company_name,
                'industry' => $e->industry_category ?? 'N/A',
                'total_job_vacancies' => $e->total_job_vacancies,
                'total_hired' => $e->total_hired,
            ]);

        $hiringDistribution = [
            ['status' => 'Pending', 'count' => (clone $appQuery)->where('status', 'pending')->count(), 'color' => 'amber'],
            ['status' => 'Approved', 'count' => (clone $appQuery)->where('status', 'approved')->count(), 'color' => 'violet'],
            ['status' => 'Rejected', 'count' => (clone $appQuery)->where('status', 'rejected')->count(), 'color' => 'red'],
            ['status' => 'Hired', 'count' => $hired, 'color' => 'emerald'],
        ];

        $monthlyHired = Application::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->whereYear('created_at', $year)
        ->where('status', 'hired')
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        $monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        $monthlyHiredData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $monthlyHired->firstWhere('month', $i);
            $monthlyHiredData[] = [
                'month' => $monthNames[$i - 1],
                'month_num' => $i,
                'count' => $monthData ? (int) $monthData->count : 0,
            ];
        }

        $mostInDemandJobs = Job::select('id', 'job_title', 'establishment_id')
            ->with('establishment:id,company_name')
            ->withCount(['applications as applicants_count'])
            ->withCount(['applications as hired_count' => fn($q) => $q->where('status', 'hired')])
            ->orderByDesc('applicants_count')
            ->limit(10)
            ->get()
            ->map(fn($j) => [
                'job_title' => $j->job_title,
                'establishment' => $j->establishment->company_name ?? 'N/A',
                'applicants_count' => $j->applicants_count,
                'hired_count' => $j->hired_count,
            ]);

        $barangayChartData = Barangay::withCount('jobSeekers')
            ->orderBy('barangay_name')
            ->get()
            ->map(fn($b) => [
                'barangay' => $b->barangay_name,
                'applicants' => (int) $b->job_seekers_count,
            ]);

        $detailedApplicants = Application::with(['jobSeeker.barangay', 'job', 'applicationStatus.hiringStatus'])
            ->whereHas('jobSeeker')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'applicant_name' => $app->jobSeeker->full_name ?? 'Unknown',
                'age' => $app->jobSeeker->birthdate ? $app->jobSeeker->birthdate->age : 'N/A',
                'gender' => $app->jobSeeker->sex ?? 'N/A',
                'barangay' => $app->jobSeeker->barangay->barangay_name ?? 'N/A',
                'application_status' => ucfirst($app->applicationStatus->hiringStatus->status_name ?? $app->status ?? 'pending'),
                'date_applied' => $app->created_at->format('Y-m-d'),
            ]);

        return response()->json([
            'statistics' => [
                'total_job_seekers' => $totalJobSeekers,
                'active_establishments' => $activeEstablishments,
                'total_job_vacancies' => $totalJobVacancies,
                'total_applications' => $totalApplications,
                'hired' => $hired,
                'pending' => $pending,
                'rejected' => $rejected,
                'generated_resumes' => $generatedResumes,
                'hiring_rate' => $hiringRate,
            ],
            'top_establishments' => $topEstablishments,
            'hiring_distribution' => $hiringDistribution,
            'monthly_hired' => $monthlyHiredData,
            'in_demand_jobs' => $mostInDemandJobs,
            'barangay_chart_data' => $barangayChartData,
            'detailed_applicants' => $detailedApplicants,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $year = $request->input('year', now()->year);
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $appQuery = Application::query();
        if ($startDate) $appQuery->whereDate('created_at', '>=', $startDate);
        if ($endDate) $appQuery->whereDate('created_at', '<=', $endDate);

        $totalJobSeekers = JobSeeker::count();
        $activeEstablishments = Establishment::whereHas('jobs', fn($q) => $q->whereIn('hiring_status', ['Open', 'Hiring']))->count();
        $totalJobVacancies = Job::count();
        $totalApplications = (clone $appQuery)->count();
        $hired = (clone $appQuery)->where('status', 'hired')->count();
        $pending = (clone $appQuery)->where('status', 'pending')->count();
        $rejected = (clone $appQuery)->where('status', 'rejected')->count();
        $generatedResumes = Resume::count();
        $hiringRate = $totalApplications > 0 ? round(($hired / $totalApplications) * 100, 2) : 0;

        $statistics = [
            'total_job_seekers' => $totalJobSeekers,
            'total_establishments' => $totalEstablishments = Establishment::count(),
            'active_hiring_establishments' => $activeEstablishments,
            'total_job_vacancies' => $totalJobVacancies,
            'total_applications' => $totalApplications,
            'pending_applications' => $pending,
            'hired_count' => $hired,
            'rejected_applicants' => $rejected,
            'interviewed_applicants' => (clone $appQuery)->where('status', 'interview')->count(),
            'total_employers' => $totalEstablishments,
            'hiring_rate' => $hiringRate,
            'monthly_employment_rate' => $hiringRate,
        ];

        $totalResumes = $generatedResumes;

        $monthlyHired = Application::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->whereYear('created_at', $year)
        ->where('status', 'hired')
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        $monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        $monthlyHiredData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $monthlyHired->firstWhere('month', $i);
            $monthlyHiredData[] = [
                'month' => $i,
                'count' => $monthData ? $monthData->count : 0,
                'month_name' => $monthNames[$i - 1],
            ];
        }

        $hiringDistribution = Application::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->get();

        $topEstablishments = Establishment::with(['barangay:id,barangay_name'])
            ->withCount(['applications as hired_count' => function ($q) { $q->where('status', 'hired'); }])
            ->withCount(['jobs as total_jobs'])
            ->withCount(['applications as total_applications'])
            ->orderBy('hired_count', 'desc')
            ->limit(10)->get();

        $topJobs = Job::select('id', 'job_title', 'establishment_id', 'vacant_positions')
            ->with('establishment:id,company_name')
            ->withCount(['applications as applications_count'])
            ->withCount(['applications as hired_count' => fn($q) => $q->where('status', 'hired')])
            ->orderByDesc('applications_count')
            ->limit(10)->get();

        $monthlyApplications = Application::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('COUNT(*) as count')
        )
        ->whereYear('created_at', $year)
        ->groupBy('month', 'year')
        ->orderBy('month')
        ->get();

        $monthlyApplicationsData = [];
        for ($m = 1; $m <= 12; $m++) {
            $found = $monthlyApplications->firstWhere('month', $m);
            $monthlyApplicationsData[] = [
                'month' => $m,
                'count' => $found ? $found->count : 0,
                'month_name' => date('F', mktime(0, 0, 0, $m, 1)),
            ];
        }

        $barangayChartData = Barangay::withCount('jobSeekers')
            ->orderBy('barangay_name')
            ->get()
            ->map(fn($b) => [
                'barangay' => $b->barangay_name,
                'applicants' => (int) $b->job_seekers_count,
            ]);

        $detailedApplicants = Application::with(['jobSeeker.barangay', 'job', 'applicationStatus.hiringStatus'])
            ->whereHas('jobSeeker')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'applicant_name' => $app->jobSeeker->full_name ?? 'Unknown',
                'age' => $app->jobSeeker->birthdate ? $app->jobSeeker->birthdate->age : 'N/A',
                'gender' => $app->jobSeeker->sex ?? 'N/A',
                'barangay' => $app->jobSeeker->barangay->barangay_name ?? 'N/A',
                'application_status' => ucfirst($app->applicationStatus->hiringStatus->status_name ?? $app->status ?? 'pending'),
                'date_applied' => $app->created_at->format('Y-m-d'),
            ]);

        $municipalityName = config('app.municipality', 'Opol');
        $provinceName = config('app.province', 'Misamis Oriental');

        $data = [
            'statistics' => $statistics,
            'additional' => ['total_resumes' => $totalResumes],
            'monthly_applications' => $monthlyApplicationsData,
            'monthly_hired' => $monthlyHiredData,
            'hiring_distribution' => $hiringDistribution,
            'top_establishments' => $topEstablishments,
            'top_jobs' => $topJobs,
            'barangay_chart_data' => $barangayChartData,
            'detailed_applicants' => $detailedApplicants,
            'year' => $year,
            'municipalityData' => [
                'municipality' => $municipalityName,
                'province' => $provinceName,
            ],
            'generated_at' => now()->format('F d, Y h:i A'),
            'prepared_by' => auth()->user()?->name ?? 'System Administrator',
            'date_range' => ($startDate && $endDate) ? "$startDate to $endDate" : 'All Time',
        ];

        $pdf = Pdf::loadView('pdfs.peso-report', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("peso-employment-report-{$year}-" . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export reports to Excel.
     */
    public function exportExcel(Request $request)
    {
        $year = $request->input('year', now()->year);
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = $this->getReportsData($request)->getData(true);

        $html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
        $html .= '<head><meta charset="UTF-8"><title>PESO Employment Report</title>';
        $html .= '<style>td,th{padding:6px 10px;border:1px solid #ccc;font-size:11px;font-family:Arial}th{background:#1e40af;color:#fff;font-weight:bold}table{border-collapse:collapse;width:100%}.title{font-size:16px;font-weight:bold;text-align:center}.subtitle{font-size:12px;text-align:center;color:#666}.section{font-size:13px;font-weight:bold;margin-top:20px}</style>';
        $html .= '</head><body>';

        $html .= '<div class="title">PESO Employment Management System Report</div>';
        $html .= '<div class="subtitle">Generated: ' . now()->format('F d, Y h:i A') . ' | ' . (auth()->user()?->name ?? 'System Administrator') . '</div>';
        $html .= '<div class="subtitle">Period: ' . (($startDate && $endDate) ? "$startDate to $endDate" : 'All Time') . '</div>';

        $s = $data['statistics'];
        $html .= '<table><tr><th colspan="9" style="text-align:center">Summary Statistics</th></tr><tr>';
        $labels = ['Total Job Seekers','Active Establishments','Total Job Vacancies','Total Applications','Hired','Pending','Rejected','Generated Resumes','Hiring Rate'];
        $values = [$s['total_job_seekers'],$s['active_establishments'],$s['total_job_vacancies'],$s['total_applications'],$s['hired'],$s['pending'],$s['rejected'],$s['generated_resumes'],$s['hiring_rate'].'%'];
        foreach ($labels as $i => $l) {
            $html .= '<th>' . $l . '</th>';
        }
        $html .= '</tr><tr>';
        foreach ($values as $v) {
            $html .= '<td style="text-align:center;font-weight:bold">' . $v . '</td>';
        }
        $html .= '</tr></table><br>';

        $html .= '<div class="section">Top Hiring Establishments</div>';
        $html .= '<table><tr><th>#</th><th>Company Name</th><th>Industry</th><th>Total Job Vacancies</th><th>Total Hired</th></tr>';
        foreach ($data['top_establishments'] as $i => $e) {
            $html .= '<tr><td>' . ($i+1) . '</td><td>' . $e['company_name'] . '</td><td>' . $e['industry'] . '</td><td style="text-align:center">' . $e['total_job_vacancies'] . '</td><td style="text-align:center">' . $e['total_hired'] . '</td></tr>';
        }
        $html .= '</table><br>';

        $html .= '<div class="section">Hiring Status Distribution</div>';
        $html .= '<table><tr><th>Status</th><th>Count</th></tr>';
        foreach ($data['hiring_distribution'] as $d) {
            $html .= '<tr><td>' . $d['status'] . '</td><td style="text-align:center">' . $d['count'] . '</td></tr>';
        }
        $html .= '</table><br>';

        $html .= '<div class="section">Monthly Hired Applicants (' . $year . ')</div>';
        $html .= '<table><tr><th>Month</th><th>Hired</th></tr>';
        foreach ($data['monthly_hired'] as $m) {
            $html .= '<tr><td>' . $m['month'] . '</td><td style="text-align:center">' . $m['count'] . '</td></tr>';
        }
        $html .= '</table><br>';

        $html .= '<div class="section">Most In-Demand Jobs</div>';
        $html .= '<table><tr><th>#</th><th>Job Title</th><th>Establishment</th><th>Applicants</th><th>Hired</th></tr>';
        foreach ($data['in_demand_jobs'] as $i => $j) {
            $html .= '<tr><td>' . ($i+1) . '</td><td>' . $j['job_title'] . '</td><td>' . $j['establishment'] . '</td><td style="text-align:center">' . $j['applicants_count'] . '</td><td style="text-align:center">' . $j['hired_count'] . '</td></tr>';
        }
        $html .= '</table><br>';

        $html .= '<div class="section">Applicants by Barangay</div>';
        $html .= '<table><tr><th>Barangay</th><th>Registered Job Seekers</th></tr>';
        foreach ($data['barangay_chart_data'] as $b) {
            $html .= '<tr><td>' . $b['barangay'] . '</td><td style="text-align:center">' . $b['applicants'] . '</td></tr>';
        }
        $html .= '</table>';

        $html .= '</body></html>';

        return response($html)
            ->header('Content-Type', 'application/vnd.ms-excel')
            ->header('Content-Disposition', 'attachment; filename="peso-employment-report-' . now()->format('Y-m-d') . '.xls"');
    }

    /**
     * Export reports to CSV.
     */
    public function exportCsv(Request $request)
    {
        $type = $request->input('type', 'applications');
        $filename = 'peso_' . $type . '_report_' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($request, $type) {
            $file = fopen('php://output', 'w');

            // Add header with PESO info
            fputcsv($file, ['PESO Employment Management System']);
            fputcsv($file, ['Municipality Report']);
            fputcsv($file, ['Generated: ' . now()->format('Y-m-d H:i:s')]);
            fputcsv($file, ['Report Type: ' . ucfirst($type)]);
            fputcsv($file, []);

            switch ($type) {
                case 'job_seekers':
                    fputcsv($file, ['ID', 'First Name', 'Last Name', 'Email', 'Contact', 'Barangay', 'Age', 'Sex', 'Education', 'Employment Status', 'Registered Date']);
                    JobSeeker::with('barangay')->chunk(100, function ($seekers) use ($file) {
                        foreach ($seekers as $s) {
                            fputcsv($file, [
                                $s->id, $s->first_name, $s->last_name, $s->email, $s->contact_number,
                                $s->barangay->barangay_name ?? 'N/A', $s->age, $s->sex,
                                $s->educational_attainment, $s->employment_status, $s->created_at->format('Y-m-d')
                            ]);
                        }
                    });
                    break;

                case 'establishments':
                    fputcsv($file, ['ID', 'Company Name', 'Contact Person', 'Email', 'Contact', 'Address', 'Industry', 'Total Jobs', 'Registered Date']);
                    Establishment::withCount('jobs')->chunk(100, function ($establishments) use ($file) {
                        foreach ($establishments as $e) {
                            fputcsv($file, [
                                $e->id, $e->company_name, $e->contact_person, $e->email,
                                $e->contact_number, $e->address, $e->industry_category,
                                $e->jobs_count, $e->created_at->format('Y-m-d')
                            ]);
                        }
                    });
                    break;

                case 'job_vacancies':
                    fputcsv($file, ['ID', 'Job Title', 'Company', 'Category', 'Type', 'Vacancies', 'Status', 'Applications', 'Created Date']);
                    Job::with('establishment')->withCount('applications')->chunk(100, function ($jobs) use ($file) {
                        foreach ($jobs as $j) {
                            fputcsv($file, [
                                $j->id, $j->job_title, $j->establishment->company_name ?? 'N/A',
                                 $j->educational_background, $j->employment_type, $j->vacant_positions,
                                $j->hiring_status, $j->applications_count, $j->created_at->format('Y-m-d')
                            ]);
                        }
                    });
                    break;

                case 'applications':
                default:
                    fputcsv($file, ['ID', 'Job Seeker', 'Email', 'Contact', 'Barangay', 'Job Title', 'Company', 'Status', 'Application Date']);
                    Application::with(['jobSeeker', 'job.establishment', 'jobSeeker.barangay'])->chunk(100, function ($reports) use ($file) {
                        foreach ($reports as $report) {
                            fputcsv($file, [
                                $report->id,
                                $report->job_seeker->first_name . ' ' . $report->job_seeker->last_name,
                                $report->job_seeker->email,
                                $report->job_seeker->contact_number,
                                $report->job_seeker->barangay->name ?? 'N/A',
                                $report->job->job_title,
                                $report->job->establishment->company_name,
                                $report->status,
                                $report->created_at->format('Y-m-d')
                            ]);
                        }
                    });
                    break;
            }

            // Append Barangay Applicants Summary
            fputcsv($file, []);
            fputcsv($file, ['Applicants by Barangay']);
            fputcsv($file, ['Barangay', 'Registered Job Seekers']);
            $barangayData = Barangay::withCount('jobSeekers')
                ->orderBy('barangay_name')
                ->get();
            foreach ($barangayData as $b) {
                fputcsv($file, [$b->barangay_name, $b->job_seekers_count]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate comprehensive report.
     */
    public function generateReport(Request $request)
    {
        $reportType = $request->input('type', 'comprehensive');
        $filters = $request->input('filters', []);

        switch ($reportType) {
            case 'employment':
                return $this->generateEmploymentReport($filters);
            case 'hiring':
                return $this->generateHiringReport($filters);
            case 'barangay':
                return $this->generateBarangayReport($filters);
            case 'comprehensive':
            default:
                return $this->generateComprehensiveReport($filters);
        }
    }

    private function generateEmploymentReport($filters)
    {
        $query = Application::with(['jobSeeker', 'job.establishment']);
        
        // Apply filters
        $this->applyFilters($query, $filters);

        $data = $query->get()->groupBy(function($item) {
            return $item->created_at->format('Y-m');
        });

        return response()->json([
            'type' => 'employment',
            'data' => $data,
            'summary' => [
                'total_applications' => $query->count(),
                'hired_count' => $query->where('status', 'hired')->count(),
                'pending_count' => $query->where('status', 'pending')->count(),
                'rejected_count' => $query->where('status', 'rejected')->count(),
            ]
        ]);
    }

    private function generateHiringReport($filters)
    {
        $query = Application::with(['jobSeeker', 'job.establishment'])
            ->where('status', 'hired');
        
        $this->applyFilters($query, $filters);

        $data = $query->get()->groupBy(function($item) {
            return $item->job->establishment->company_name;
        });

        return response()->json([
            'type' => 'hiring',
            'data' => $data,
            'summary' => [
                'total_hired' => $query->count(),
                'companies_count' => $data->count(),
                'avg_hiring_per_company' => $data->count() > 0 ? round($query->count() / $data->count(), 2) : 0,
            ]
        ]);
    }

    private function generateBarangayReport($filters)
    {
        $query = DB::table('job_seekers as js')
            ->leftJoin('applications as a', 'js.id', '=', 'a.job_seeker_id')
            ->leftJoin('barangays as b', 'js.barangay_id', '=', 'b.id')
            ->select(
                'b.barangay_name as barangay_name',
                DB::raw('COUNT(js.id) as total_seekers'),
                DB::raw('COUNT(a.id) as total_applications'),
                DB::raw('COUNT(CASE WHEN a.status = "hired" THEN 1 END) as hired_count'),
                DB::raw('COUNT(CASE WHEN a.status = "pending" THEN 1 END) as pending_count')
            )
            ->groupBy('b.id', 'b.barangay_name');

        $this->applyBarangayFilters($query, $filters);

        $data = $query->orderBy('hired_count', 'desc')->get();

        return response()->json([
            'type' => 'barangay',
            'data' => $data,
            'summary' => [
                'total_barangays' => $data->count(),
                'total_seekers' => $data->sum('total_seekers'),
                'total_hired' => $data->sum('hired_count'),
                'top_barangay' => $data->first()->barangay_name ?? 'N/A',
            ]
        ]);
    }

    private function generateComprehensiveReport($filters)
    {
        $statistics = $this->getStatistics(new Request($filters))->getData();
        $monthlyApplications = $this->getMonthlyApplications(new Request($filters))->getData();
        $hiringDistribution = $this->getHiringStatusDistribution()->getData();
        $employmentGrowth = $this->getEmploymentGrowth(new Request($filters))->getData();

        return response()->json([
            'type' => 'comprehensive',
            'statistics' => $statistics,
            'monthly_applications' => $monthlyApplications,
            'hiring_distribution' => $hiringDistribution,
            'employment_growth' => $employmentGrowth,
            'generated_at' => now()->toISOString(),
        ]);
    }

    // ---- PRIVATE HELPERS ----

    private function applyDateRangeFilter($query, $dateRange)
    {
        if ($dateRange === 'all') return;
        switch ($dateRange) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
                break;
            case 'year':
                $query->whereYear('created_at', now()->year);
                break;
        }
    }

    private function applyPreviousPeriodFilter($query, $dateRange)
    {
        if ($dateRange === 'all') return;
        switch ($dateRange) {
            case 'today':
                $query->whereDate('created_at', today()->subDay());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->subMonth()->month)
                      ->whereYear('created_at', now()->subMonth()->year);
                break;
            case 'year':
                $query->whereYear('created_at', now()->subYear()->year);
                break;
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        return round($bytes / pow(1024, $pow), $precision) . ' ' . $units[$pow];
    }

    private function getSystemUptime()
    {
        if (PHP_OS_FAMILY === 'Windows') {
            try {
                $output = shell_exec('wmic os get lastbootuptime');
                if ($output) {
                    return 'Running';
                }
            } catch (\Exception $e) {
                return 'Unknown';
            }
            return 'Unknown';
        } else {
            $uptime = @file_get_contents('/proc/uptime');
            if ($uptime) {
                $seconds = (int)explode(' ', $uptime)[0];
                $days = floor($seconds / 86400);
                $hours = floor(($seconds % 86400) / 3600);
                $minutes = floor(($seconds % 3600) / 60);
                return "{$days}d {$hours}h {$minutes}m";
            }
            return 'Unknown';
        }
    }

    private function applyFilters($query, $filters)
    {
        if (isset($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (isset($filters['barangay_id'])) {
            $query->whereHas('jobSeeker', function ($q) use ($filters) {
                $q->where('barangay_id', $filters['barangay_id']);
            });
        }

        if (isset($filters['establishment_id'])) {
            $query->whereHas('job.establishment', function ($q) use ($filters) {
                $q->where('id', $filters['establishment_id']);
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
    }

    private function applyBarangayFilters($query, $filters)
    {
        if (isset($filters['start_date'])) {
            $query->whereDate('a.created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->whereDate('a.created_at', '<=', $filters['end_date']);
        }
    }
}
