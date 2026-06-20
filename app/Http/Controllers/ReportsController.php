<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Barangay;
use App\Models\Establishment;
use App\Models\HiringStatus;
use App\Models\Job;
use App\Models\JobSeeker;
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
     * Get employment statistics.
     */
    public function getStatistics(Request $request)
    {
        $dateRange = $request->input('date_range', 'all');
        $barangayId = $request->input('barangay_id');
        $establishmentId = $request->input('establishment_id');

        $query = Application::with(['jobSeeker', 'job.establishment']);

        // Apply filters
        if ($dateRange !== 'all') {
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

        if ($barangayId) {
            $query->whereHas('jobSeeker', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }

        if ($establishmentId) {
            $query->whereHas('job.establishment', function ($q) use ($establishmentId) {
                $q->where('id', $establishmentId);
            });
        }

        $applications = $query->get();

        // Calculate statistics
        $totalJobSeekers = JobSeeker::count();
        $totalEmployers = Establishment::count();
        $totalApplications = $applications->count();
        $hiredCount = $applications->where('status', 'hired')->count();
        $unemployedCount = $totalJobSeekers - $hiredCount;

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
                'b.name as barangay_name',
                DB::raw('COUNT(js.id) as total_seekers'),
                DB::raw('COUNT(CASE WHEN a.status = "hired" THEN 1 END) as hired_count')
            )
            ->groupBy('b.id', 'b.name')
            ->orderBy('hired_count', 'desc')
            ->get();

        // Employer hiring analytics
        $employerStats = DB::table('establishments as e')
            ->leftJoin('jobs as j', 'e.id', '=', 'j.establishment_id')
            ->leftJoin('applications as a', 'j.id', '=', 'a.job_id')
            ->select(
                'e.company_name',
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
            'total_employers' => $totalEmployers,
            'total_applications' => $totalApplications,
            'hired_count' => $hiredCount,
            'unemployed_count' => $unemployedCount,
            'monthly_stats' => $monthlyStats,
            'barangay_stats' => $barangayStats,
            'employer_stats' => $employerStats,
            'job_trends' => $jobTrends,
            'hiring_rate' => $totalJobSeekers > 0 ? round(($hiredCount / $totalJobSeekers) * 100, 2) : 0,
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
        $period = $request->input('period', 'monthly'); // monthly, weekly, daily
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

        if ($request->input('job_category')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('job_category', $request->input('job_category'));
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

    /**
     * Export reports to PDF.
     */
    public function exportPdf(Request $request)
    {
        // This would require a PDF library like DomPDF
        // For now, return a placeholder response
        return response()->json([
            'message' => 'PDF export functionality requires PDF library installation',
            'data' => $this->getFilteredReports($request)->getData()
        ]);
    }

    /**
     * Export reports to Excel.
     */
    public function exportExcel(Request $request)
    {
        // This would require an Excel library like Laravel Excel
        // For now, return a placeholder response
        return response()->json([
            'message' => 'Excel export functionality requires Laravel Excel package',
            'data' => $this->getFilteredReports($request)->getData()
        ]);
    }

    /**
     * Export reports to CSV.
     */
    public function exportCsv(Request $request)
    {
        $data = $this->getFilteredReports($request)->getData();
        
        $csvData = [];
        $csvData[] = ['ID', 'Job Seeker', 'Email', 'Contact', 'Barangay', 'Job Title', 'Company', 'Status', 'Application Date'];

        foreach ($data->data as $report) {
            $csvData[] = [
                $report->id,
                $report->job_seeker->first_name . ' ' . $report->job_seeker->last_name,
                $report->job_seeker->email,
                $report->job_seeker->contact_number,
                $report->job_seeker->barangay->name ?? 'N/A',
                $report->job->job_title,
                $report->job->establishment->company_name,
                $report->status,
                $report->created_at->format('Y-m-d')
            ];
        }

        $filename = 'peso_reports_' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
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
                'b.name as barangay_name',
                DB::raw('COUNT(js.id) as total_seekers'),
                DB::raw('COUNT(a.id) as total_applications'),
                DB::raw('COUNT(CASE WHEN a.status = "hired" THEN 1 END) as hired_count'),
                DB::raw('COUNT(CASE WHEN a.status = "pending" THEN 1 END) as pending_count')
            )
            ->groupBy('b.id', 'b.name');

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
