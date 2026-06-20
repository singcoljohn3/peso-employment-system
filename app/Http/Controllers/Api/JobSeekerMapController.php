<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Models\Job;
use App\Models\JobSeeker;
use App\Models\RecentlyViewedEstablishment;
use App\Models\SavedEstablishment;
use App\Models\Barangay;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobSeekerMapController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        $query = Establishment::with(['barangay', 'jobs.skills', 'jobs.barangay'])
            ->withLocation()
            ->withCount(['jobs as available_jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }])
            ->withCount(['jobs as pending_jobs_count' => function ($q) {
                $q->where('hiring_status', 'Closed');
            }])
            ->withCount('applications')
            ->orderBy('company_name');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($barangayId = $request->query('barangay_id')) {
            $query->where('barangay_id', $barangayId);
        }

        if ($category = $request->query('category')) {
            $query->where('industry_category', $category);
        }

        $hiringFilter = $request->query('hiring_status');
        if ($hiringFilter === 'hiring') {
            $query->whereHas('jobs', function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            });
        } elseif ($hiringFilter === 'not_hiring') {
            $query->whereDoesntHave('jobs', function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            });
        } elseif ($hiringFilter === 'pending') {
            $query->whereDoesntHave('jobs', function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            })->where(function ($q) {
                $q->whereHas('jobs', function ($qq) {
                    $qq->where('hiring_status', 'Closed');
                })->orWhereDoesntHave('jobs');
            });
        }

        // Date posted filter
        $daysAgo = $request->query('days_ago');
        if ($daysAgo) {
            $query->whereHas('jobs', function ($q) use ($daysAgo) {
                $q->where('created_at', '>=', now()->subDays((int) $daysAgo));
            });
        }

        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $radius = $request->query('radius');

        if ($lat && $lng) {
            $haversine = "(6371 * acos(cos(radians($lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(latitude))))";
            $query->selectRaw("*, {$haversine} AS distance");
            if ($radius) {
                $query->having('distance', '<=', (float) $radius);
            }
            $query->orderBy('distance');
        }

        $establishments = $query->get();

        $savedIds = [];
        if ($jobSeeker) {
            $savedIds = SavedEstablishment::where('job_seeker_id', $jobSeeker->id)
                ->pluck('establishment_id')
                ->toArray();
        }

        // Prepare seeker profile for matching
        $seekerSkills = [];
        $seekerEducation = strtolower($jobSeeker?->educational_attainment ?? '');
        $seekerExperience = (int) ($jobSeeker?->work_experience_years ?? 0);
        $preferredJob = strtolower($jobSeeker?->preferred_job ?? '');

        if ($jobSeeker && $jobSeeker->skills) {
            $seekerSkills = is_array($jobSeeker->skills)
                ? array_map('strtolower', $jobSeeker->skills)
                : array_map('strtolower', explode(',', $jobSeeker->skills));
        }

        $educationLevels = [
            'doctoral' => 6, 'phd' => 6, 'doctorate' => 6,
            'masteral' => 5, "master's" => 5, 'masters' => 5, 'ma' => 5, 'ms' => 5,
            'college graduate' => 4, "bachelor's" => 4, 'bachelors' => 4, 'bs' => 4, 'ba' => 4, 'degree' => 4,
            'college level' => 3, 'some college' => 3,
            'vocational' => 3, 'tesda' => 3, 'nc ii' => 3, 'nc iii' => 3,
            'high school graduate' => 2, 'high school' => 2, 'shs' => 2,
            'high school level' => 1,
            'elementary' => 0,
        ];
        $seekerEduLevel = 0;
        foreach ($educationLevels as $key => $level) {
            if (str_contains($seekerEducation, $key)) {
                $seekerEduLevel = max($seekerEduLevel, $level);
            }
        }

        $totalJobsByCategory = [];
        $hiringByBarangay = [];

        $result = $establishments->map(function ($est) use (
            $savedIds, $seekerSkills, $seekerEduLevel, $seekerExperience, $preferredJob,
            $lat, $lng, $educationLevels, &$totalJobsByCategory, &$hiringByBarangay
        ) {
            $hasActiveJobs = $est->jobs()->whereIn('hiring_status', ['Open', 'Hiring'])->exists();
            $hasPendingJobs = $est->jobs()->where('hiring_status', 'Closed')->exists() || $est->jobs()->count() === 0;

            $hiringStatus = 'not_hiring';
            if ($hasActiveJobs) {
                $hiringStatus = 'hiring';
            } elseif ($hasPendingJobs) {
                $hiringStatus = 'pending';
            }

            // Match score calculation
            $matchScore = 0;
            $matchingSkills = [];
            $matchDetails = ['skills' => 0, 'education' => 0, 'experience' => 0, 'job_title' => 0];
            $bestJobTitle = '';
            $bestJobId = null;

            if ($est->jobs->isNotEmpty()) {
                $jobMatchScores = [];
                foreach ($est->jobs as $job) {
                    $score = 0;
                    $details = ['skills' => 0, 'education' => 0, 'experience' => 0, 'job_title' => 0];

                    // Skills match (35%)
                    $jobSkillNames = $job->skills->pluck('skill_name')->map('strtolower')->toArray();
                    if (!empty($seekerSkills) && !empty($jobSkillNames)) {
                        $matched = array_intersect($seekerSkills, $jobSkillNames);
                        $ratio = count($matched) / max(count($seekerSkills), 1);
                        $details['skills'] = round(min($ratio, 1) * 35);
                    }
                    $skillIntersect = array_values(array_intersect($seekerSkills, $jobSkillNames ?? []));
                    if (!empty($skillIntersect)) {
                        $matchingSkills = array_unique(array_merge($matchingSkills, $skillIntersect));
                    }

                    // Education match (20%)
                    $reqEdu = strtolower($job->description ?? '');
                    $reqEduLevel = 0;
                    foreach ($educationLevels as $key => $level) {
                        if (str_contains($reqEdu, $key)) {
                            $reqEduLevel = max($reqEduLevel, $level);
                        }
                    }
                    if ($seekerEduLevel >= $reqEduLevel) {
                        $details['education'] = 20;
                    } elseif ($seekerEduLevel > 0 && $reqEduLevel > 0) {
                        $details['education'] = round(($seekerEduLevel / max($reqEduLevel, 1)) * 20);
                    }

                    // Experience match (20%)
                    $reqExp = 0;
                    preg_match('/(\d+)\s*years?\s*(?:of)?\s*experience/i', $job->description ?? '', $expMatch);
                    if (!empty($expMatch[1])) $reqExp = (int) $expMatch[1];
                    if ($seekerExperience >= $reqExp) {
                        $details['experience'] = 20;
                    } elseif ($reqExp > 0) {
                        $details['experience'] = round(min($seekerExperience / $reqExp, 1) * 20);
                    } else {
                        $details['experience'] = 10;
                    }

                    // Preferred job title match (25%)
                    $title = strtolower($job->job_title ?? '');
                    if ($preferredJob && str_contains($title, $preferredJob)) {
                        $details['job_title'] = 25;
                    } elseif ($preferredJob && str_contains($preferredJob, $title)) {
                        $details['job_title'] = 20;
                    } elseif ($preferredJob) {
                        $words = explode(' ', $preferredJob);
                        $matchCount = 0;
                        foreach ($words as $w) {
                            if (strlen($w) > 2 && str_contains($title, $w)) $matchCount++;
                        }
                        $details['job_title'] = round(($matchCount / max(count($words), 1)) * 25);
                    }

                    $total = array_sum($details);
                    $jobMatchScores[] = [
                        'job_id' => $job->id,
                        'job_title' => $job->job_title,
                        'score' => $total,
                        'details' => $details,
                    ];

                    if ($total > $matchScore) {
                        $matchScore = $total;
                        $matchDetails = $details;
                        $bestJobTitle = $job->job_title;
                        $bestJobId = $job->id;
                    }
                }
                $jobMatchScores = collect($jobMatchScores)->sortByDesc('score')->values();
            }

            $distance = null;
            if ($lat && $lng && $est->latitude && $est->longitude) {
                $distance = $this->calculateDistance(
                    (float) $lat,
                    (float) $lng,
                    (float) $est->latitude,
                    (float) $est->longitude
                );
            }

            // Travel time estimates
            $travelTime = null;
            if ($distance !== null) {
                $travelTime = [
                    'walking' => round($distance / 5 * 60),
                    'motorcycle' => round($distance / 40 * 60),
                    'car' => round($distance / 30 * 60),
                ];
            }

            // Category stats
            if ($est->industry_category) {
                $cat = $est->industry_category;
                if (!isset($totalJobsByCategory[$cat])) {
                    $totalJobsByCategory[$cat] = 0;
                }
                $totalJobsByCategory[$cat] += $est->jobs->count();
            }

            // Barangay hiring stats
            if ($est->barangay_name && ($hasActiveJobs || $est->available_jobs_count > 0)) {
                $bn = $est->barangay_name;
                if (!isset($hiringByBarangay[$bn])) {
                    $hiringByBarangay[$bn] = 0;
                }
                $hiringByBarangay[$bn]++;
            }

            $recommended = $matchScore >= 40;

            return [
                'id' => $est->id,
                'company_name' => $est->company_name,
                'address' => $est->address,
                'latitude' => $est->latitude,
                'longitude' => $est->longitude,
                'contact_person' => $est->contact_person,
                'contact_number' => $est->contact_number,
                'email' => $est->email,
                'industry_category' => $est->industry_category,
                'logo' => $est->logo
                    ? (str_starts_with($est->logo, 'http') ? $est->logo : asset('storage/' . $est->logo))
                    : null,
                'barangay_id' => $est->barangay_id,
                'barangay_name' => $est->barangay?->barangay_name,
                'available_jobs_count' => $est->available_jobs_count ?? 0,
                'hiring_status' => $hiringStatus,
                'is_saved' => in_array($est->id, $savedIds),
                'recommended' => $recommended,
                'match_score' => $matchScore,
                'match_details' => $matchDetails,
                'best_job_title' => $bestJobTitle,
                'best_job_id' => $bestJobId,
                'matching_skills' => array_values(array_unique($matchingSkills)),
                'distance_km' => $distance !== null ? round($distance, 2) : null,
                'travel_time' => $travelTime,
                'applications_count' => $est->applications_count ?? 0,
                'jobs' => $est->jobs->map(function ($j) {
                    return [
                        'id' => $j->id,
                        'job_title' => $j->job_title,
                        'description' => $j->description,
                        'salary_range' => $j->salary_range,
                        'employment_type' => $j->employment_type,
                        'hiring_status' => $j->hiring_status,
                        'barangay_name' => $j->barangay?->barangay_name,
                        'created_at' => $j->created_at?->toIso8601String(),
                        'days_ago' => $j->created_at?->diffInDays(now()),
                        'applications_count' => $j->applications()->count(),
                        'skills' => $j->skills->pluck('skill_name'),
                    ];
                }),
            ];
        });

        $barangays = Barangay::orderBy('barangay_name')->get(['id', 'barangay_name']);

        $categories = Establishment::withLocation()
            ->whereNotNull('industry_category')
            ->distinct()
            ->orderBy('industry_category')
            ->pluck('industry_category')
            ->filter()
            ->values();

        // Sort barangay hiring stats
        arsort($hiringByBarangay);
        $topHiringBarangays = array_slice($hiringByBarangay, 0, 5);

        arsort($totalJobsByCategory);
        $topJobCategories = array_slice($totalJobsByCategory, 0, 5);

        return response()->json([
            'success' => true,
            'data' => $result,
            'barangays' => $barangays,
            'categories' => $categories,
            'meta' => [
                'total' => $result->count(),
                'hiring' => $result->where('hiring_status', 'hiring')->count(),
                'not_hiring' => $result->where('hiring_status', 'not_hiring')->count(),
                'pending' => $result->where('hiring_status', 'pending')->count(),
                'recommended' => $result->where('recommended', true)->count(),
                'high_match' => $result->where('match_score', '>=', 70)->count(),
            ],
            'analytics' => [
                'top_hiring_barangays' => $topHiringBarangays,
                'jobs_by_category' => $topJobCategories,
                'total_applications' => $establishments->sum('applications_count'),
            ],
            'last_updated' => now()->toIso8601String(),
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        $est = Establishment::with(['barangay', 'jobs.skills', 'jobs.barangay'])
            ->withCount(['jobs as available_jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }])
            ->findOrFail($id);

        if ($jobSeeker) {
            RecentlyViewedEstablishment::updateOrCreate(
                ['job_seeker_id' => $jobSeeker->id, 'establishment_id' => $est->id],
                ['viewed_at' => now()]
            );
            RecentlyViewedEstablishment::where('job_seeker_id', $jobSeeker->id)
                ->where('viewed_at', '<', now()->subDays(30))
                ->delete();
        }

        $hasActiveJobs = $est->jobs()->whereIn('hiring_status', ['Open', 'Hiring'])->exists();
        $hiringStatus = $hasActiveJobs ? 'hiring' : 'not_hiring';

        $isSaved = $jobSeeker ? SavedEstablishment::where('job_seeker_id', $jobSeeker->id)
            ->where('establishment_id', $est->id)->exists() : false;

        $distance = null;
        $travelTime = null;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $est->id,
                'company_name' => $est->company_name,
                'address' => $est->address,
                'latitude' => $est->latitude,
                'longitude' => $est->longitude,
                'contact_person' => $est->contact_person,
                'contact_number' => $est->contact_number,
                'email' => $est->email,
                'industry_category' => $est->industry_category,
                'logo' => $est->logo
                    ? (str_starts_with($est->logo, 'http') ? $est->logo : asset('storage/' . $est->logo))
                    : null,
                'barangay_id' => $est->barangay_id,
                'barangay_name' => $est->barangay?->barangay_name,
                'available_jobs_count' => $est->available_jobs_count ?? 0,
                'hiring_status' => $hiringStatus,
                'is_saved' => $isSaved,
                'distance_km' => $distance !== null ? round($distance, 2) : null,
                'travel_time' => $travelTime,
                'jobs' => $est->jobs->map(function ($j) {
                    return [
                        'id' => $j->id,
                        'job_title' => $j->job_title,
                        'description' => $j->description,
                        'salary_range' => $j->salary_range,
                        'employment_type' => $j->employment_type,
                        'hiring_status' => $j->hiring_status,
                        'barangay_name' => $j->barangay?->barangay_name,
                        'created_at' => $j->created_at?->toIso8601String(),
                        'days_ago' => $j->created_at?->diffInDays(now()),
                        'skills' => $j->skills->pluck('skill_name'),
                        'applications_count' => $j->applications()->count(),
                    ];
                }),
            ],
        ]);
    }

    public function toggleSave(Request $request, $id)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->firstOrFail();

        $existing = SavedEstablishment::where('job_seeker_id', $jobSeeker->id)
            ->where('establishment_id', $id)
            ->first();

        if ($existing) {
            $existing->delete();
            $saved = false;
        } else {
            SavedEstablishment::create([
                'job_seeker_id' => $jobSeeker->id,
                'establishment_id' => $id,
            ]);
            $saved = true;
        }

        return response()->json(['success' => true, 'is_saved' => $saved]);
    }

    public function savedList(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->firstOrFail();

        $saved = Establishment::whereHas('savedBy', function ($q) use ($jobSeeker) {
            $q->where('job_seeker_id', $jobSeeker->id);
        })
            ->with(['barangay'])
            ->withCount(['jobs as available_jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }])
            ->get()
            ->map(function ($est) {
                return [
                    'id' => $est->id,
                    'company_name' => $est->company_name,
                    'address' => $est->address,
                    'latitude' => $est->latitude,
                    'longitude' => $est->longitude,
                    'barangay_name' => $est->barangay?->barangay_name,
                    'industry_category' => $est->industry_category,
                    'available_jobs_count' => $est->available_jobs_count ?? 0,
                ];
            });

        return response()->json(['success' => true, 'data' => $saved]);
    }

    public function recentlyViewed(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->firstOrFail();

        $recent = RecentlyViewedEstablishment::where('job_seeker_id', $jobSeeker->id)
            ->with(['establishment.barangay'])
            ->orderBy('viewed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($rv) {
                $est = $rv->establishment;
                return [
                    'id' => $est->id,
                    'company_name' => $est->company_name,
                    'address' => $est->address,
                    'latitude' => $est->latitude,
                    'longitude' => $est->longitude,
                    'barangay_name' => $est->barangay?->barangay_name,
                    'industry_category' => $est->industry_category,
                    'viewed_at' => $rv->viewed_at->diffForHumans(),
                ];
            });

        return response()->json(['success' => true, 'data' => $recent]);
    }

    public function recommendations(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::with(['skills'])->where('user_id', $user->id)->first();

        if (!$jobSeeker) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $seekerSkills = [];
        if ($jobSeeker->skills) {
            $seekerSkills = is_array($jobSeeker->skills)
                ? array_map('strtolower', $jobSeeker->skills)
                : array_map('strtolower', explode(',', $jobSeeker->skills));
        }

        $preferredJob = strtolower($jobSeeker->preferred_job ?? '');
        $seekerEducation = strtolower($jobSeeker->educational_attainment ?? '');
        $seekerExperience = (int) ($jobSeeker->work_experience_years ?? 0);

        $educationLevels = $this->getEducationLevels();

        $seekerEduLevel = 0;
        foreach ($educationLevels as $key => $level) {
            if (str_contains($seekerEducation, $key)) {
                $seekerEduLevel = max($seekerEduLevel, $level);
            }
        }

        $all = Establishment::with(['barangay', 'jobs.skills'])
            ->withLocation()
            ->withCount(['jobs as available_jobs_count' => function ($q) {
                $q->whereIn('hiring_status', ['Open', 'Hiring']);
            }])
            ->get()
            ->map(function ($est) use (
                $seekerSkills, $preferredJob, $seekerEduLevel, $seekerExperience, $educationLevels
            ) {
                $bestScore = 0;
                $bestJob = null;
                $matchingSkills = [];

                foreach ($est->jobs as $job) {
                    $score = 0;
                    $jobSkills = $job->skills->pluck('skill_name')->map('strtolower')->toArray();

                    if (!empty($seekerSkills) && !empty($jobSkills)) {
                        $matched = array_intersect($seekerSkills, $jobSkills);
                        $score += round(min(count($matched) / max(count($seekerSkills), 1), 1) * 35);
                        $matchingSkills = array_merge($matchingSkills, $matched);
                    }

                    $reqEdu = strtolower($job->description ?? '');
                    $reqEduLevel = 0;
                    foreach ($educationLevels as $key => $level) {
                        if (str_contains($reqEdu, $key)) $reqEduLevel = max($reqEduLevel, $level);
                    }
                    if ($seekerEduLevel >= $reqEduLevel) $score += 20;
                    elseif ($seekerEduLevel > 0 && $reqEduLevel > 0) {
                        $score += round(($seekerEduLevel / max($reqEduLevel, 1)) * 20);
                    }

                    $reqExp = 0;
                    preg_match('/(\d+)\s*years?\s*(?:of)?\s*experience/i', $job->description ?? '', $m);
                    if (!empty($m[1])) $reqExp = (int) $m[1];
                    if ($seekerExperience >= $reqExp) $score += 20;
                    elseif ($reqExp > 0) $score += round(min($seekerExperience / $reqExp, 1) * 20);
                    else $score += 10;

                    $title = strtolower($job->job_title ?? '');
                    if ($preferredJob && str_contains($title, $preferredJob)) $score += 25;
                    elseif ($preferredJob) {
                        $words = explode(' ', $preferredJob);
                        $mc = 0;
                        foreach ($words as $w) {
                            if (strlen($w) > 2 && str_contains($title, $w)) $mc++;
                        }
                        $score += round(($mc / max(count($words), 1)) * 25);
                    }

                    if ($score > $bestScore) {
                        $bestScore = $score;
                        $bestJob = $job;
                    }
                }

                if ($bestScore < 30) return null;

                return [
                    'id' => $est->id,
                    'company_name' => $est->company_name,
                    'address' => $est->address,
                    'latitude' => $est->latitude,
                    'longitude' => $est->longitude,
                    'barangay_name' => $est->barangay?->barangay_name,
                    'industry_category' => $est->industry_category,
                    'available_jobs_count' => $est->available_jobs_count ?? 0,
                    'match_score' => $bestScore,
                    'best_job_title' => $bestJob?->job_title,
                    'best_job_id' => $bestJob?->id,
                    'matching_skills' => array_values(array_unique($matchingSkills)),
                ];
            })
            ->filter()
            ->sortByDesc('match_score')
            ->values();

        return response()->json(['success' => true, 'data' => $all]);
    }

    public function barangayStats(Request $request)
    {
        $user = $request->user();
        $jobSeeker = JobSeeker::where('user_id', $user->id)->first();

        $stats = Barangay::withCount(['jobSeekers'])
            ->get()
            ->map(function ($b) {
                $estCount = Establishment::where('barangay_id', $b->id)->withLocation()->count();
                $hiringCount = Establishment::where('barangay_id', $b->id)
                    ->whereHas('jobs', fn($q) => $q->whereIn('hiring_status', ['Open', 'Hiring']))
                    ->count();
                $jobCount = Job::where('barangay_id', $b->id)
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                    ->count();

                return [
                    'barangay_name' => $b->barangay_name,
                    'establishments' => $estCount,
                    'hiring_establishments' => $hiringCount,
                    'active_jobs' => $jobCount,
                    'job_seekers' => $b->job_seekers_count,
                ];
            })
            ->filter(fn($s) => $s['establishments'] > 0)
            ->sortByDesc('active_jobs')
            ->values();

        return response()->json(['success' => true, 'data' => $stats]);
    }

    private function getEducationLevels(): array
    {
        return [
            'doctoral' => 6, 'phd' => 6, 'doctorate' => 6,
            'masteral' => 5, "master's" => 5, 'masters' => 5, 'ma' => 5, 'ms' => 5,
            'college graduate' => 4, "bachelor's" => 4, 'bachelors' => 4, 'bs' => 4, 'ba' => 4, 'degree' => 4,
            'college level' => 3, 'some college' => 3,
            'vocational' => 3, 'tesda' => 3, 'nc ii' => 3, 'nc iii' => 3,
            'high school graduate' => 2, 'high school' => 2, 'shs' => 2,
            'high school level' => 1,
            'elementary' => 0,
        ];
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
