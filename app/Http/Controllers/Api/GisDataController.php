<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Models\Job;
use App\Models\Application;
use App\Models\Barangay;
use App\Models\JobSeeker;
use Illuminate\Http\Request;

class GisDataController extends Controller
{
    public function index(Request $request)
    {
        $activeJobsFilter = $request->query('hiring_status', 'Open,Hiring');
        $statusFilter = $request->query('application_status', '');

        $establishments = Establishment::with(['barangay'])
            ->withLocation()
            ->withCount(['jobs as available_jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }])
            ->orderBy('company_name')
            ->get()
            ->map(function ($est) {
                $hasActiveJobs = $est->jobs()
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                    ->exists();
                return [
                    'id' => $est->id,
                    'type' => 'establishment',
                    'name' => $est->company_name,
                    'latitude' => $est->latitude,
                    'longitude' => $est->longitude,
                    'address' => $est->address,
                    'barangay_name' => $est->barangay?->barangay_name,
                    'barangay_id' => $est->barangay_id,
                    'contact_person' => $est->contact_person,
                    'contact_number' => $est->contact_number,
                    'email' => $est->email,
                    'industry_category' => $est->industry_category,
                    'available_jobs_count' => $est->available_jobs_count ?? 0,
                    'is_hiring' => $hasActiveJobs,
                ];
            });

        $jobs = Job::with(['establishment', 'barangay', 'establishment.barangay'])
            ->whereIn('hiring_status', explode(',', $activeJobsFilter))
            ->get()
            ->filter(function ($job) {
                return $job->establishment &&
                    $job->establishment->latitude &&
                    $job->establishment->longitude;
            })
            ->values()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'type' => 'job',
                    'title' => $job->job_title,
                    'latitude' => $job->establishment->latitude,
                    'longitude' => $job->establishment->longitude,
                    'company_name' => $job->establishment->company_name,
                    'barangay_name' => $job->barangay?->barangay_name ?? $job->establishment->barangay?->barangay_name,
                    'employment_type' => $job->employment_type,
                    'salary_range' => $job->salary_range,
                    'hiring_status' => $job->hiring_status,
                    'applications_count' => $job->applications_count ?? $job->applications()->count(),
                ];
            });

        $applicationsQuery = Application::with([
            'jobSeeker.barangay',
            'job.establishment',
            'applicationStatus.hiringStatus'
        ]);

        if ($statusFilter) {
            $statuses = explode(',', $statusFilter);
            $applicationsQuery->whereHas('applicationStatus.hiringStatus', function ($q) use ($statuses) {
                $q->whereIn('status_name', $statuses);
            });
        }

        $applications = $applicationsQuery->get()
            ->filter(function ($app) {
                return $app->jobSeeker && $app->jobSeeker->barangay;
            })
            ->values()
            ->map(function ($app) {
                $barangay = $app->jobSeeker->barangay;
                return [
                    'id' => $app->id,
                    'type' => 'application',
                    'job_seeker_name' => ($app->jobSeeker->first_name ?? '') . ' ' . ($app->jobSeeker->last_name ?? ''),
                    'latitude' => $barangay->latitude,
                    'longitude' => $barangay->longitude,
                    'barangay_name' => $barangay->barangay_name,
                    'barangay_id' => $barangay->id,
                    'job_title' => $app->job?->job_title ?? 'N/A',
                    'company_name' => $app->job?->establishment?->company_name ?? $app->establishment?->company_name ?? 'N/A',
                    'status' => $app->applicationStatus?->hiringStatus?->status_name ?? $app->status ?? 'pending',
                    'applied_at' => $app->created_at?->format('Y-m-d'),
                ];
            });

        $barangayStats = Barangay::withCount([
            'jobSeekers as total_job_seekers',
        ])
            ->withCount(['jobSeekers as employed_count' => function ($q) {
                $q->where('employment_status', 'Employed');
            }])
            ->get()
            ->map(function ($b) {
                $estIds = Establishment::where('barangay_id', $b->id)->pluck('id');
                $jobCount = Job::whereIn('establishment_id', $estIds)
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                    ->count();
                $applicationCount = Application::whereHas('jobSeeker', function ($q) use ($b) {
                    $q->where('barangay_id', $b->id);
                })->count();

                return [
                    'id' => $b->id,
                    'name' => $b->barangay_name,
                    'latitude' => $b->latitude,
                    'longitude' => $b->longitude,
                    'establishments_count' => Establishment::where('barangay_id', $b->id)->count(),
                    'establishments_with_location' => Establishment::where('barangay_id', $b->id)
                        ->whereNotNull('latitude')->whereNotNull('longitude')->count(),
                    'job_seekers_count' => $b->total_job_seekers,
                    'employed_count' => $b->employed_count,
                    'available_jobs' => $jobCount,
                    'applications_count' => $applicationCount,
                ];
            });

        $lastUpdated = now()->toIso8601String();

        return response()->json([
            'success' => true,
            'data' => [
                'establishments' => $establishments,
                'jobs' => $jobs,
                'applications' => $applications,
                'barangay_stats' => $barangayStats,
            ],
            'meta' => [
                'total_establishments' => $establishments->count(),
                'total_jobs' => $jobs->count(),
                'total_applications' => $applications->count(),
                'total_barangays' => $barangayStats->count(),
            ],
            'last_updated' => $lastUpdated,
        ]);
    }

    public function barangayStats()
    {
        $stats = Barangay::withCount(['jobSeekers as total_job_seekers'])
            ->get()
            ->map(function ($b) {
                $estIds = Establishment::where('barangay_id', $b->id)->pluck('id');
                $activeJobs = Job::whereIn('establishment_id', $estIds)
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                    ->count();
                $applications = Application::whereHas('jobSeeker', function ($q) use ($b) {
                    $q->where('barangay_id', $b->id);
                })->count();
                $hired = Application::whereHas('jobSeeker', function ($q) use ($b) {
                    $q->where('barangay_id', $b->id);
                })->whereHas('applicationStatus.hiringStatus', function ($q) {
                    $q->where('status_name', 'hired');
                })->count();

                return [
                    'name' => $b->barangay_name,
                    'latitude' => $b->latitude,
                    'longitude' => $b->longitude,
                    'job_seekers' => $b->total_job_seekers,
                    'establishments' => Establishment::where('barangay_id', $b->id)->count(),
                    'active_jobs' => $activeJobs,
                    'applications' => $applications,
                    'hired' => $hired,
                    'employment_rate' => $b->total_job_seekers > 0
                        ? round(($hired / $b->total_job_seekers) * 100, 1)
                        : 0,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
