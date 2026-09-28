<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Establishment;
use App\Models\Job;

class EstablishmentDashboardService
{
    public function getDashboardData(int $establishmentId): array
    {
        $applicationsQuery = Application::whereHas('job', function ($query) use ($establishmentId) {
            $query->where('establishment_id', $establishmentId);
        });

        $totalJobs = Job::where('establishment_id', $establishmentId)->count();
        $activeJobs = Job::where('establishment_id', $establishmentId)
            ->whereIn('hiring_status', ['Open', 'Hiring'])
            ->count();

        $totalApplicants = (clone $applicationsQuery)->count();
        $pending = (clone $applicationsQuery)->where('status', 'pending')->count();
        $reviewed = (clone $applicationsQuery)->where('status', 'reviewed')->count();
        $shortlisted = (clone $applicationsQuery)->where('status', 'shortlisted')->count();
        $hired = (clone $applicationsQuery)->where('status', 'hired')->count();
        $rejected = (clone $applicationsQuery)->where('status', 'rejected')->count();

        $recentApplications = (clone $applicationsQuery)
            ->with(['jobSeeker', 'job'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($application) {
                return [
                    'id' => $application->id,
                    'applicant_name' => $application->jobSeeker?->full_name ?? 'Unknown',
                    'job_title' => $application->job?->job_title ?? 'Unknown',
                    'status' => $application->status ?? 'pending',
                    'applied_at' => $application->created_at?->format('Y-m-d'),
                ];
            });

        return [
            'total_jobs' => $totalJobs,
            'active_jobs' => $activeJobs,
            'total_applicants' => $totalApplicants,
            'pending' => $pending,
            'reviewed' => $reviewed,
            'shortlisted' => $shortlisted,
            'hired' => $hired,
            'rejected' => $rejected,
            'recent_applications' => $recentApplications,
        ];
    }
}
