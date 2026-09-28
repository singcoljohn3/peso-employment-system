<?php

namespace App\Services;

use App\Models\Job;
use App\Models\JobSeeker;

class JobMatchingService
{
    public function matchJobSeekerToJobs(JobSeeker $jobSeeker, int $limit = 10)
    {
        $skills = $jobSeeker->skills()->pluck('skills.id')->toArray();

        return Job::with(['establishment', 'barangay', 'skills'])
            ->whereIn('hiring_status', ['Open', 'Hiring'])
            ->where(function ($query) use ($jobSeeker, $skills) {
                if (!empty($skills)) {
                    $query->whereHas('skills', function ($q) use ($skills) {
                        $q->whereIn('skills.id', $skills);
                    });
                }

                if ($jobSeeker->barangay_id) {
                    $query->orWhere('barangay_id', $jobSeeker->barangay_id);
                }

                if ($jobSeeker->preferred_job) {
                    $query->orWhere('job_title', 'like', '%' . $jobSeeker->preferred_job . '%');
                }
            })
            ->withCount(['applications as applicant_count'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($job) use ($jobSeeker) {
                $jobSkills = $job->skills->pluck('id')->toArray();
                $seekerSkills = $jobSeeker->skills()->pluck('skills.id')->toArray();
                $matchingSkills = array_intersect($seekerSkills, $jobSkills);

                $job->match_score = !empty($jobSkills)
                    ? round((count($matchingSkills) / count($jobSkills)) * 100)
                    : 0;
                $job->matching_skills_count = count($matchingSkills);

                return $job;
            })
            ->sortByDesc('match_score')
            ->values();
    }

    public function matchJobToJobSeekers(Job $job, int $limit = 10)
    {
        $jobSkills = $job->skills()->pluck('skills.id')->toArray();

        return JobSeeker::with(['user', 'barangay', 'skills'])
            ->where('is_fully_registered', true)
            ->where(function ($query) use ($job, $jobSkills) {
                if (!empty($jobSkills)) {
                    $query->whereHas('skills', function ($q) use ($jobSkills) {
                        $q->whereIn('skills.id', $jobSkills);
                    });
                }

                if ($job->barangay_id) {
                    $query->orWhere('barangay_id', $job->barangay_id);
                }
            })
            ->limit($limit)
            ->get()
            ->map(function ($seeker) use ($jobSkills) {
                $seekerSkills = $seeker->skills()->pluck('skills.id')->toArray();
                $matchingSkills = array_intersect($seekerSkills, $jobSkills);

                $seeker->match_score = !empty($jobSkills)
                    ? round((count($matchingSkills) / count($jobSkills)) * 100)
                    : 0;
                $seeker->matching_skills_count = count($matchingSkills);

                return $seeker;
            })
            ->sortByDesc('match_score')
            ->values();
    }
}
