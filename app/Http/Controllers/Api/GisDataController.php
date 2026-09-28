<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Models\Job;
use App\Models\Application;
use App\Models\Barangay;
use App\Models\JobSeeker;
use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class GisDataController extends Controller
{
    protected function geocodeAddress($address)
    {
        if (empty($address)) return null;
        try {
            $response = Http::timeout(5)->retry(2, 100)->withHeaders([
                'User-Agent' => 'PESO-Employment-System/1.0 (peso.opol@gmail.com)',
            ])->get('https://nominatim.openstreetmap.org/search', [
                'q' => $address . ', Opol, Misamis Oriental, Philippines',
                'format' => 'json',
                'limit' => 1,
            ]);
            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data[0]['lat']) && !empty($data[0]['lon'])) {
                    return ['lat' => (float) $data[0]['lat'], 'lng' => (float) $data[0]['lon']];
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Geocoding failed: ' . $e->getMessage());
        }
        return null;
    }

    public function index(Request $request)
    {
        $forceGeocode = $request->boolean('geocode');
        $hiringStatuses = ['Open', 'Hiring'];
        $closedStatuses = ['Closed', 'Filled'];
        $now = now();

        $establishments = Establishment::with(['barangay', 'user', 'jobs' => function ($q) {
                $q->select('id', 'establishment_id', 'job_title', 'hiring_status', 'vacant_positions', 'application_deadline', 'created_at', 'updated_at')
                    ->whereIn('hiring_status', ['Open', 'Hiring'])
                    ->orderBy('created_at', 'desc');
            }])
            ->withCount(['jobs as available_jobs_count' => function ($q) use ($hiringStatuses) {
                $q->whereIn('hiring_status', $hiringStatuses);
            }])
            ->withCount(['applications as total_applications'])
            ->orderBy('company_name')
            ->get()
            ->map(function ($est) use ($hiringStatuses, $closedStatuses, $forceGeocode, $now) {
                $hasActiveJobs = $est->jobs()
                    ->whereIn('hiring_status', $hiringStatuses)
                    ->exists();
                $totalJobs = $est->jobs()->count();
                $isClosed = !$hasActiveJobs && $totalJobs > 0;
                $noJobs = $totalJobs === 0;

                $hasHiringSoon = false;
                $hiringSoonJobs = [];
                if ($hasActiveJobs) {
                    $activeJobs = $est->jobs()->whereIn('hiring_status', $hiringStatuses)->get();
                    foreach ($activeJobs as $j) {
                        if ($j->application_deadline && $now->diffInDays($j->application_deadline, false) <= 30 && $now->diffInDays($j->application_deadline, false) >= 0) {
                            $hasHiringSoon = true;
                            $hiringSoonJobs[] = $j->job_title;
                        }
                    }
                }

                $applicationCounts = Application::where('establishment_id', $est->id)
                    ->selectRaw("
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending,
                        SUM(CASE WHEN status = 'interview_scheduled' THEN 1 ELSE 0 END) as interview,
                        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired,
                        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                    ")->first();

                $coordsFallback = false;
                $lat = $est->latitude;
                $lng = $est->longitude;
                if (!$lat || !$lng || $forceGeocode) {
                    if (!$lat || !$lng) {
                        if ($est->barangay && $est->barangay->latitude && $est->barangay->longitude) {
                            $lat = $est->barangay->latitude;
                            $lng = $est->barangay->longitude;
                            $coordsFallback = true;
                        }
                    }
                    if ($forceGeocode || !$lat || !$lng) {
                        $addressParts = array_filter([$est->address, $est->barangay?->barangay_name]);
                        $fullAddress = implode(', ', $addressParts);
                        if ($fullAddress) {
                            $geo = $this->geocodeAddress($fullAddress);
                            if ($geo) {
                                $lat = $geo['lat'];
                                $lng = $geo['lng'];
                                $coordsFallback = false;
                                $est->update(['latitude' => $lat, 'longitude' => $lng]);
                            }
                        }
                    }
                }

                $activeJobList = $est->jobs->map(function ($j) {
                    return [
                        'id' => $j->id,
                        'job_title' => $j->job_title,
                        'vacant_positions' => (int) $j->vacant_positions,
                        'hiring_status' => $j->hiring_status,
                        'application_deadline' => $j->application_deadline?->format('Y-m-d'),
                    ];
                });

                $lastUpdated = $est->updated_at ? $est->updated_at->format('Y-m-d H:i:s') : null;
                $lastJobUpdate = $est->jobs()->max('updated_at');
                if ($lastJobUpdate) {
                    $lastUpdated = max($lastUpdated, $lastJobUpdate instanceof \Carbon\Carbon ? $lastJobUpdate->format('Y-m-d H:i:s') : $lastJobUpdate);
                }

                // Determine hiring status for color coding
                $hiringStatusLabel = 'registered';
                if ($hasActiveJobs && $hasHiringSoon) {
                    $hiringStatusLabel = 'hiring_soon';
                } elseif ($hasActiveJobs) {
                    $hiringStatusLabel = 'hiring';
                } elseif ($isClosed) {
                    $hiringStatusLabel = 'closed';
                }

                return [
                    'id' => $est->id,
                    'type' => 'establishment',
                    'name' => $est->company_name,
                    'latitude' => $lat ? (float) $lat : null,
                    'longitude' => $lng ? (float) $lng : null,
                    'address' => $est->address,
                    'barangay_name' => $est->barangay?->barangay_name,
                    'barangay_id' => $est->barangay_id,
                    'contact_person' => $est->contact_person,
                    'contact_number' => $est->contact_number,
                    'email' => $est->email,
                    'industry_category' => $est->industry_category,
                    'logo' => $est->logo,
                    'available_jobs_count' => (int) $est->available_jobs_count,
                    'is_hiring' => $hasActiveJobs,
                    'is_hiring_soon' => $hasHiringSoon,
                    'is_closed' => $isClosed,
                    'no_jobs' => $noJobs,
                    'hiring_status_label' => $hiringStatusLabel,
                    'total_applications' => (int) ($applicationCounts->total ?? 0),
                    'pending_applications' => (int) ($applicationCounts->pending ?? 0),
                    'interview_applications' => (int) ($applicationCounts->interview ?? 0),
                    'hired_applications' => (int) ($applicationCounts->hired ?? 0),
                    'rejected_applications' => (int) ($applicationCounts->rejected ?? 0),
                    'job_positions' => $activeJobList,
                    'last_updated' => $lastUpdated,
                    'coords_fallback' => $coordsFallback,
                ];
            });

        $activeJobs = Job::with(['establishment.barangay', 'barangay', 'skills'])
            ->whereIn('hiring_status', $hiringStatuses)
            ->whereHas('establishment', function ($q) {
                $q->whereNotNull('latitude')->whereNotNull('longitude');
            })
            ->get()
            ->map(function ($job) {
                $appCounts = Application::where('job_id', $job->id)
                    ->selectRaw("
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending,
                        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired
                    ")->first();

                return [
                    'id' => $job->id,
                    'job_title' => $job->job_title,
                    'establishment_id' => $job->establishment_id,
                    'company_name' => $job->establishment->company_name,
                    'latitude' => (float) $job->establishment->latitude,
                    'longitude' => (float) $job->establishment->longitude,
                    'barangay_name' => $job->barangay?->barangay_name ?? $job->establishment->barangay?->barangay_name,
                    'salary_range' => $job->salary_range,
                    'min_salary' => $job->min_salary,
                    'max_salary' => $job->max_salary,
                    'salary_type' => $job->salary_type,
                    'employment_type' => $job->employment_type,
                    'educational_background' => $job->educational_background,
                    'required_education' => $job->required_education,
                    'skills' => $job->skills->pluck('name'),
                    'vacant_positions' => (int) $job->vacant_positions,
                    'hiring_status' => $job->hiring_status,
                    'application_deadline' => $job->application_deadline?->format('Y-m-d'),
                    'created_at' => $job->created_at?->format('Y-m-d'),
                    'total_applicants' => (int) ($appCounts->total ?? 0),
                    'pending_applicants' => (int) ($appCounts->pending ?? 0),
                    'hired_applicants' => (int) ($appCounts->hired ?? 0),
                ];
            });

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
                    ->select('industry_category', DB::raw('COUNT(*) as count'))
                    ->groupBy('industry_category')
                    ->orderByDesc('count')
                    ->first();

                return [
                    'id' => $b->id,
                    'name' => $b->barangay_name,
                    'latitude' => $b->latitude ? (float) $b->latitude : null,
                    'longitude' => $b->longitude ? (float) $b->longitude : null,
                    'total_establishments' => count($estIds),
                    'hiring_establishments' => count($hiringEstIds),
                    'active_jobs' => $activeJobs,
                    'job_seekers' => $allJobSeekers,
                    'applications' => $applications,
                    'hired' => $hired,
                    'employment_rate' => $allJobSeekers > 0 ? round(($hired / $allJobSeekers) * 100, 1) : 0,
                    'top_industry' => $topIndustry?->industry_category ?? 'N/A',
                ];
            });

        $interviewsToday = Interview::whereDate('scheduled_date', $now->toDateString())->count();

        $totalEstablishments = Establishment::count();
        $hiringEstablishments = Establishment::whereHas('jobs', function ($q) {
            $q->whereIn('hiring_status', ['Open', 'Hiring']);
        })->count();
        $totalActiveJobs = Job::whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $totalJobSeekers = JobSeeker::count();
        $totalApplications = Application::count();
        $pendingApplications = Application::where(function ($q) {
            $q->where('status', 'pending')->orWhereNull('status');
        })->count();
        $hiredApplications = Application::where('status', 'hired')->count();
        $rejectedApplications = Application::where('status', 'rejected')->count();
        $employmentRate = $totalJobSeekers > 0 ? round(($hiredApplications / $totalJobSeekers) * 100, 1) : 0;

        $lastUpdated = now()->toIso8601String();

        // Recent activities for live activity panel
        $recentJobs = Job::with('establishment:id,company_name')
            ->latest()->take(5)->get(['id', 'job_title', 'establishment_id', 'created_at'])
            ->map(fn($j) => [
                'id' => $j->id,
                'type' => 'new_job',
                'title' => $j->job_title,
                'company' => $j->establishment?->company_name,
                'created_at' => $j->created_at?->diffForHumans(),
            ]);

        $recentEstablishments = Establishment::latest()->take(5)->get(['id', 'company_name', 'created_at'])
            ->map(fn($e) => [
                'id' => $e->id,
                'type' => 'new_establishment',
                'title' => $e->company_name,
                'created_at' => $e->created_at?->diffForHumans(),
            ]);

        $recentInterviews = Interview::with([
                'application.jobSeeker:id,first_name,last_name',
                'application.job:id,job_title,establishment_id',
                'application.job.establishment:id,company_name'
            ])
            ->whereDate('scheduled_date', '>=', $now->copy()->subDays(7))
            ->latest()->take(5)->get()
            ->map(fn($i) => [
                'id' => $i->id,
                'type' => 'interview',
                'title' => 'Interview: ' . ($i->application?->jobSeeker?->first_name ?? '') . ' ' . ($i->application?->jobSeeker?->last_name ?? ''),
                'company' => $i->application?->job?->establishment?->company_name,
                'job_title' => $i->application?->job?->job_title,
                'scheduled_date' => $i->scheduled_date?->format('M d, Y'),
                'created_at' => $i->created_at?->diffForHumans(),
            ]);

        $recentHires = Application::with([
                'jobSeeker:id,first_name,last_name',
                'job:id,job_title,establishment_id',
                'job.establishment:id,company_name'
            ])
            ->where('status', 'hired')
            ->where('updated_at', '>=', $now->copy()->subDays(14))
            ->latest('updated_at')->take(5)->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'type' => 'hired',
                'title' => ($a->jobSeeker?->first_name ?? '') . ' ' . ($a->jobSeeker?->last_name ?? ''),
                'company' => $a->job?->establishment?->company_name,
                'job_title' => $a->job?->job_title,
                'created_at' => $a->updated_at?->diffForHumans(),
            ]);

        $closedEstablishments = Establishment::whereHas('jobs', function ($q) use ($closedStatuses) {
                $q->whereIn('hiring_status', $closedStatuses);
            })->count();

        $registeredOnly = $totalEstablishments - $hiringEstablishments - $closedEstablishments;
        if ($registeredOnly < 0) $registeredOnly = 0;

        return response()->json([
            'success' => true,
            'data' => [
                'establishments' => $establishments->filter(fn($e) => $e['latitude'] && $e['longitude'])->values(),
                'active_jobs' => $activeJobs,
                'barangay_stats' => $barangayStats,
            ],
            'stats' => [
                'total_establishments' => $totalEstablishments,
                'hiring_establishments' => $hiringEstablishments,
                'closed_establishments' => $closedEstablishments,
                'registered_establishments' => $registeredOnly,
                'active_vacancies' => $totalActiveJobs,
                'registered_job_seekers' => $totalJobSeekers,
                'total_applications' => $totalApplications,
                'pending_applications' => $pendingApplications,
                'interview_today' => $interviewsToday,
                'hired_applicants' => $hiredApplications,
                'rejected_applicants' => $rejectedApplications,
                'employment_rate' => $employmentRate,
            ],
            'recent_activities' => [
                'new_jobs' => $recentJobs,
                'new_establishments' => $recentEstablishments,
                'interviews' => $recentInterviews,
                'recent_hires' => $recentHires,
            ],
            'filter_options' => [
                'employment_types' => Job::distinct()->whereNotNull('employment_type')->pluck('employment_type')->filter()->values(),
                'educational_backgrounds' => Job::distinct()->whereNotNull('educational_background')->pluck('educational_background')->filter()->values(),
                'salary_ranges' => Job::distinct()->whereNotNull('salary_range')->pluck('salary_range')->filter()->values(),
            ],
            'last_updated' => $lastUpdated,
        ]);
    }

    public function establishmentDetail($id)
    {
        $hiringStatuses = ['Open', 'Hiring'];
        $est = Establishment::with(['barangay', 'user'])->findOrFail($id);

        $activeJobs = $est->jobs()->whereIn('hiring_status', $hiringStatuses)
            ->with('skills')->get()->map(function ($job) {
                return [
                    'id' => $job->id,
                    'job_title' => $job->job_title,
                    'salary_range' => $job->salary_range,
                    'min_salary' => $job->min_salary,
                    'max_salary' => $job->max_salary,
                    'salary_type' => $job->salary_type,
                    'employment_type' => $job->employment_type,
                    'required_education' => $job->required_education,
                    'skills' => $job->skills->pluck('name'),
                    'vacant_positions' => (int) $job->vacant_positions,
                    'hiring_status' => $job->hiring_status,
                    'application_deadline' => $job->application_deadline?->format('Y-m-d'),
                    'created_at' => $job->created_at?->format('Y-m-d'),
                    'applications_count' => $job->applications()->count(),
                ];
            });

        $appQuery = Application::where('establishment_id', $est->id);
        $totalApps = $appQuery->count();
        $pendingApps = (clone $appQuery)->where(function ($q) {
            $q->where('status', 'pending')->orWhereNull('status');
        })->count();
        $interviewApps = (clone $appQuery)->where('status', 'interview_scheduled')->count();
        $hiredApps = (clone $appQuery)->where('status', 'hired')->count();
        $rejectedApps = (clone $appQuery)->where('status', 'rejected')->count();

        $hasActiveJobs = $est->jobs()->whereIn('hiring_status', $hiringStatuses)->exists();
        $hasAnyJobs = $est->jobs()->count() > 0;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $est->id,
                'company_name' => $est->company_name,
                'contact_person' => $est->contact_person,
                'contact_number' => $est->contact_number,
                'email' => $est->email,
                'address' => $est->address,
                'barangay_name' => $est->barangay?->barangay_name,
                'barangay_id' => $est->barangay_id,
                'industry_category' => $est->industry_category,
                'logo' => $est->logo,
                'latitude' => $est->latitude ? (float) $est->latitude : null,
                'longitude' => $est->longitude ? (float) $est->longitude : null,
                'is_hiring' => $hasActiveJobs,
                'hiring_status' => $hasActiveJobs ? 'Hiring' : ($hasAnyJobs ? 'Closed' : 'No Jobs'),
                'active_jobs' => $activeJobs,
                'total_applications' => $totalApps,
                'pending_applications' => $pendingApps,
                'interview_applications' => $interviewApps,
                'hired_applications' => $hiredApps,
                'rejected_applications' => $rejectedApps,
            ],
        ]);
    }

    public function heatmapData()
    {
        $vacancyHeat = Job::whereIn('hiring_status', ['Open', 'Hiring'])
            ->whereHas('establishment', function ($q) {
                $q->whereNotNull('latitude')->whereNotNull('longitude');
            })
            ->select(DB::raw("
                ROUND(establishment.latitude, 3) as lat,
                ROUND(establishment.longitude, 3) as lng,
                COUNT(*) as weight
            "))
            ->join('establishments as establishment', 'job.establishment_id', '=', 'establishment.id')
            ->groupBy('lat', 'lng')
            ->get();

        $seekerHeat = JobSeeker::whereHas('barangay', function ($q) {
                $q->whereNotNull('latitude')->whereNotNull('longitude');
            })
            ->select(DB::raw("
                ROUND(barangays.latitude, 3) as lat,
                ROUND(barangays.longitude, 3) as lng,
                COUNT(*) as weight
            "))
            ->join('barangays', 'job_seekers.barangay_id', '=', 'barangays.id')
            ->groupBy('lat', 'lng')
            ->get();

        $hiredHeat = Application::where('status', 'hired')
            ->whereHas('jobSeeker.barangay', function ($q) {
                $q->whereNotNull('latitude')->whereNotNull('longitude');
            })
            ->select(DB::raw("
                ROUND(barangays.latitude, 3) as lat,
                ROUND(barangays.longitude, 3) as lng,
                COUNT(*) as weight
            "))
            ->join('job_seekers', 'applications.job_seeker_id', '=', 'job_seekers.id')
            ->join('barangays', 'job_seekers.barangay_id', '=', 'barangays.id')
            ->groupBy('lat', 'lng')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'vacancy_heat' => $vacancyHeat,
                'seeker_heat' => $seekerHeat,
                'hired_heat' => $hiredHeat,
            ],
        ]);
    }
}