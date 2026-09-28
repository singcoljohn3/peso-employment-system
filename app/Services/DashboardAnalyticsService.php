<?php

namespace App\Services;

use App\Models\Establishment;
use App\Models\JobSeeker;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Builds the chart-ready datasets used by the three portal dashboards
 * (Establishment, Agency and PESO Admin).
 *
 * Every figure is aggregated from the live database, so the dashboards update
 * automatically whenever job vacancies, applicants, applications, interviews
 * or hiring statuses change. Nothing in here writes to the database, which
 * makes it safe to call from any controller without side effects.
 */
class DashboardAnalyticsService
{
    /** Time filters offered on every dashboard. */
    public const PERIODS = ['today', 'week', 'month', 'year'];

    /**
     * Canonical application status buckets. The keys are the values written to
     * `hiring_statuses.status_name` (or the legacy `applications.status`
     * column) somewhere in the portals.
     */
    private const STATUS_BUCKETS = [
        'pending' => ['pending', 'new', 'submitted', 'for review', 'under review', 'under_review', 'reviewed', 'shortlisted'],
        'interview' => ['for interview', 'for_interview', 'interview', 'interviewed', 'interview_scheduled', 'scheduled'],
        'hired' => ['hired', 'approved', 'offered', 'accepted'],
        'rejected' => ['rejected', 'declined', 'cancelled', 'canceled', 'closed'],
    ];

    /** Presentation metadata for the status buckets. */
    private const STATUS_META = [
        'pending' => ['label' => 'Pending', 'color' => '#f59e0b'],
        'interview' => ['label' => 'For Interview', 'color' => '#3b82f6'],
        'hired' => ['label' => 'Hired', 'color' => '#0d9488'],
        'rejected' => ['label' => 'Rejected', 'color' => '#dc2626'],
        'other' => ['label' => 'Other', 'color' => '#94a3b8'],
    ];

    /** The `job` table name (singular), used in raw SQL fragments. */
    private const JOB = 'job';

    /* ---------------------------------------------------------------------
     | Public API
     | ------------------------------------------------------------------ */

    /**
     * Resolve and validate a requested time filter.
     */
    public function resolvePeriod(?string $period): string
    {
        $period = is_string($period) ? strtolower(trim($period)) : '';

        return in_array($period, self::PERIODS, true) ? $period : 'month';
    }

    /**
     * PESO-wide employment analytics.
     */
    public function adminAnalytics(?string $period = null): array
    {
        $window = $this->window($this->resolvePeriod($period));
        $applications = $this->applicationQuery();

        $vacancies = (int) $this->jobQuery()->count();
        $activeHiring = (int) (clone $this->jobQuery())->whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $positions = (int) $this->jobQuery()->sum('vacant_positions');
        $seekers = (int) JobSeeker::query()->count();
        $establishments = (int) Establishment::query()->count();
        $hiringEstablishments = (int) $this->jobQuery()
            ->whereIn('hiring_status', ['Open', 'Hiring'])
            ->whereNotNull('establishment_id')
            ->distinct()
            ->count('establishment_id');
        $applicationTotal = (int) $applications->count();

        return [
            'period' => $window['key'],
            'period_label' => $window['label'],
            'range' => $this->rangePayload($window),
            'employment_overview' => [
                ['key' => 'job_seekers', 'label' => 'Job Seekers', 'value' => $seekers, 'color' => '#1d4ed8'],
                ['key' => 'establishments', 'label' => 'Establishments', 'value' => $establishments, 'color' => '#0f766e'],
                ['key' => 'job_vacancies', 'label' => 'Job Vacancies', 'value' => $vacancies, 'color' => '#7c3aed'],
                ['key' => 'applications', 'label' => 'Applications', 'value' => $applicationTotal, 'color' => '#d97706'],
            ],
            'vacancy_hiring' => $this->vacancyHiringPayload($vacancies, $activeHiring, $window),
            'application_status' => $this->statusPayload($applications, $window),
            'applications_trend' => $this->trendPayload($this->applicationsInWindow($applications, $window), $window, 'applications'),
            'seeker_establishment' => $this->seekerEstablishmentPayload($window),
            'employment_status' => $this->employmentStatusPayload(),
            'applications_per_job' => $this->applicationsPerJobPayload(8),
            'top_vacancies' => $this->topVacanciesPayload(8),
            'recent_applications' => $this->recentApplicationsPayload(10),
            'totals' => [
                'job_seekers' => $seekers,
                'establishments' => $establishments,
                'hiring_establishments' => $hiringEstablishments,
                'job_vacancies' => $vacancies,
                'active_hiring' => $activeHiring,
                'vacant_positions' => $positions,
                'applications' => $applicationTotal,
            ],
            'deltas' => $this->deltas($window, $applications),
        ];
    }

    /**
     * Analytics scoped to a single establishment.
     */
    public function establishmentAnalytics(?int $establishmentId, ?string $period = null): array
    {
        $window = $this->window($this->resolvePeriod($period));
        $establishmentId = (int) $establishmentId;

        $applications = $this->applicationQuery()->where('job.establishment_id', $establishmentId);
        $jobs = $this->jobQuery()->where('job.establishment_id', $establishmentId);

        $vacancies = (int) $jobs->count();
        $activeHiring = (int) (clone $jobs)->whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $positions = (int) (clone $jobs)->sum('vacant_positions');

        return [
            'period' => $window['key'],
            'period_label' => $window['label'],
            'range' => $this->rangePayload($window),
            'vacancy_hiring' => $this->vacancyHiringPayload($vacancies, $activeHiring, $window, $jobs),
            'application_status' => $this->statusPayload($applications, $window),
            'applications_trend' => $this->trendPayload($this->applicationsInWindow($applications, $window), $window, 'applications'),
            'hires_trend' => $this->hiresTrendPayload($this->applicationsInWindow($applications, $window), $window),
            'applications_per_job' => $this->applicationsPerJobPayload(8, $jobs),
            'top_vacancies' => $this->topVacanciesPayload(8, $jobs),
            'recent_applications' => $this->recentApplicationsPayload(8, $applications),
            'totals' => [
                'job_vacancies' => $vacancies,
                'active_hiring' => $activeHiring,
                'vacant_positions' => $positions,
                'applications' => (int) $applications->count(),
            ],
            'deltas' => $this->deltas($window, $applications),
        ];
    }

    /**
     * Analytics scoped to a single agency.
     */
    public function agencyAnalytics(?int $agencyId, ?string $period = null): array
    {
        $window = $this->window($this->resolvePeriod($period));
        $agencyId = (int) $agencyId;

        $applications = $this->applicationQuery()->where('job.agency_id', $agencyId);
        $jobs = $this->jobQuery()->where('job.agency_id', $agencyId);

        $vacancies = (int) $jobs->count();
        $activeHiring = (int) (clone $jobs)->whereIn('hiring_status', ['Open', 'Hiring'])->count();
        $positions = (int) (clone $jobs)->sum('vacant_positions');

        return [
            'period' => $window['key'],
            'period_label' => $window['label'],
            'range' => $this->rangePayload($window),
            'vacancy_hiring' => $this->vacancyHiringPayload($vacancies, $activeHiring, $window, $jobs),
            'application_status' => $this->statusPayload($applications, $window),
            'applications_trend' => $this->trendPayload($this->applicationsInWindow($applications, $window), $window, 'applications'),
            'applications_per_job' => $this->applicationsPerJobPayload(8, $jobs),
            'top_vacancies' => $this->topVacanciesPayload(8, $jobs),
            'recent_applications' => $this->recentApplicationsPayload(8, $applications),
            'totals' => [
                'job_vacancies' => $vacancies,
                'active_hiring' => $activeHiring,
                'vacant_positions' => $positions,
                'applications' => (int) $applications->count(),
                'members' => (int) JobSeeker::query()->where('agency_id', $agencyId)->count(),
            ],
            'deltas' => $this->deltas($window, $applications),
        ];
    }

    /* ---------------------------------------------------------------------
     | Query builders
     | ------------------------------------------------------------------ */

    /**
     * Base application query joined to its resolved hiring status.
     *
     * An application can carry a status in two places: the legacy
     * `applications.status` column and the newer
     * `application_statuses -> hiring_statuses.status_name` relation, which
     * is what the portals actually write to. The relation therefore wins and
     * the legacy column acts as a fallback. The relation is aggregated to a
     * single row per application so the join can never inflate any count.
     */
    private function applicationQuery(): QueryBuilder
    {
        return DB::table('applications')
            ->leftJoinSub(
                DB::table('application_statuses')
                    ->join('hiring_statuses', 'hiring_statuses.id', '=', 'application_statuses.status_id')
                    ->select('application_statuses.application_id')
                    ->selectRaw('MAX(hiring_statuses.status_name) as status_name')
                    ->groupBy('application_statuses.application_id'),
                'latest_status',
                'latest_status.application_id',
                '=',
                'applications.id'
            )
            ->leftJoin('job', 'job.id', '=', 'applications.job_id');
    }

    /**
     * Base job query.
     */
    private function jobQuery(): QueryBuilder
    {
        return DB::table('job');
    }

    /**
     * SQL expression yielding the lower-cased resolved status of an application.
     */
    private function statusSql(): string
    {
        return 'LOWER(COALESCE(latest_status.status_name, applications.status))';
    }

    /**
     * SQL expression mapping a resolved status onto a canonical bucket.
     */
    private function bucketSql(): string
    {
        $status = $this->statusSql();
        $clauses = [];

        foreach (self::STATUS_BUCKETS as $bucket => $aliases) {
            $list = implode(', ', array_map(fn ($alias) => "'" . $alias . "'", $aliases));
            $clauses[] = "WHEN {$status} IN ({$list}) THEN '{$bucket}'";
        }

        return 'CASE ' . implode(' ', $clauses) . " ELSE 'other' END";
    }

    /* ---------------------------------------------------------------------
     | Period windows
     | ------------------------------------------------------------------ */

    /**
     * Date window + bucket granularity for a time filter.
     *
     * @return array{key:string,label:string,start:Carbon,end:Carbon,granularity:string,previous_start:Carbon,previous_end:Carbon}
     */
    private function window(string $period): array
    {
        $now = now();

        switch ($period) {
            case 'today':
                return [
                    'key' => 'today',
                    'label' => 'Today',
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                    'granularity' => 'hour',
                    'previous_start' => $now->copy()->subDay()->startOfDay(),
                    'previous_end' => $now->copy()->subDay()->endOfDay(),
                ];

            case 'week':
                return [
                    'key' => 'week',
                    'label' => 'This Week',
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                    'granularity' => 'day',
                    'previous_start' => $now->copy()->subWeek()->startOfWeek(),
                    'previous_end' => $now->copy()->subWeek()->endOfWeek(),
                ];

            case 'year':
                return [
                    'key' => 'year',
                    'label' => 'This Year',
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear(),
                    'granularity' => 'month',
                    'previous_start' => $now->copy()->subYear()->startOfYear(),
                    'previous_end' => $now->copy()->subYear()->endOfYear(),
                ];

            default:
                return [
                    'key' => 'month',
                    'label' => 'This Month',
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                    'granularity' => 'day',
                    'previous_start' => $now->copy()->subMonthNoOverflow()->startOfMonth(),
                    'previous_end' => $now->copy()->subMonthNoOverflow()->endOfMonth(),
                ];
        }
    }

    /**
     * Restrict a query to the active window.
     */
    private function withinWindow(QueryBuilder $query, array $window, string $column = 'applications.created_at'): QueryBuilder
    {
        return $query->whereBetween($column, [$window['start'], $window['end']]);
    }

    /**
     * Restrict a query to the equivalent preceding window.
     */
    private function inPreviousWindow(QueryBuilder $query, array $window, string $column = 'applications.created_at'): QueryBuilder
    {
        return $query->whereBetween($column, [$window['previous_start'], $window['previous_end']]);
    }

    /**
     * Human readable date range for the active window.
     */
    private function rangePayload(array $window): array
    {
        $format = $window['key'] === 'year' ? 'M Y' : 'M j, Y';

        return [
            'start' => $window['start']->format($format),
            'end' => $window['end']->format($format),
            'granularity' => $window['granularity'],
        ];
    }

    /* ---------------------------------------------------------------------
     | Chart payloads
     | ------------------------------------------------------------------ */

    /**
     * Job Vacancy vs. Active Hiring comparison.
     *
     * `$jobScope` keeps the "posted in period" figures inside the caller's
     * portal (a single establishment or agency) instead of falling back to the
     * whole `job` table.
     */
    private function vacancyHiringPayload(int $vacancies, int $activeHiring, array $window, ?QueryBuilder $jobScope = null): array
    {
        $inactive = max($vacancies - $activeHiring, 0);
        $posted = $this->jobsPostedInWindow($window, 'current', $jobScope);
        $postedPrevious = $this->jobsPostedInWindow($window, 'previous', $jobScope);

        return [
            'total' => $vacancies,
            'active_hiring' => $activeHiring,
            'inactive' => $inactive,
            'active_rate' => $vacancies > 0 ? round(($activeHiring / $vacancies) * 100, 1) : 0.0,
            'posted_in_period' => $posted,
            'posted_previous_period' => $postedPrevious,
            'posted_change' => $this->percentChange($posted, $postedPrevious),
            'bars' => [
                ['key' => 'total', 'label' => 'Total Job Vacancies', 'value' => $vacancies, 'color' => '#1d4ed8'],
                ['key' => 'active', 'label' => 'Active Hiring', 'value' => $activeHiring, 'color' => '#0d9488'],
                ['key' => 'inactive', 'label' => 'Closed / Filled', 'value' => $inactive, 'color' => '#cbd5e1'],
            ],
        ];
    }

    /**
     * Count job vacancies posted inside the current or preceding window.
     */
    private function jobsPostedInWindow(array $window, string $which = 'current', ?QueryBuilder $jobScope = null): int
    {
        $column = self::JOB . '.created_at';
        $query = $jobScope ? clone $jobScope : $this->jobQuery();

        $query = $which === 'previous'
            ? $this->inPreviousWindow($query, $window, $column)
            : $this->withinWindow($query, $window, $column);

        return (int) $query->count();
    }

    /**
     * Application status distribution for a donut/pie chart.
     */
    private function statusPayload(QueryBuilder $scope, array $window): array
    {
        $bucket = $this->bucketSql();

        $current = $this->withinWindow(clone $scope, $window)
            ->selectRaw("{$bucket} as bucket_key, COUNT(*) as total")
            ->groupByRaw($bucket)
            ->get()
            ->mapWithKeys(fn ($row) => [(string) $row->bucket_key => (int) $row->total]);

        $previous = $this->inPreviousWindow(clone $scope, $window)
            ->selectRaw("{$bucket} as bucket_key, COUNT(*) as total")
            ->groupByRaw($bucket)
            ->get()
            ->mapWithKeys(fn ($row) => [(string) $row->bucket_key => (int) $row->total]);

        $slices = [];
        $total = 0;

        foreach (self::STATUS_META as $key => $meta) {
            $value = (int) ($current[$key] ?? 0);
            $total += $value;

            $slices[] = [
                'key' => $key,
                'label' => $meta['label'],
                'value' => $value,
                'color' => $meta['color'],
                'previous' => (int) ($previous[$key] ?? 0),
                'percent' => 0.0,
            ];
        }

        foreach ($slices as $index => $slice) {
            $slices[$index]['percent'] = $total > 0 ? round(($slice['value'] / $total) * 100, 1) : 0.0;
        }

        return [
            'slices' => $slices,
            'total' => $total,
            'period_label' => $window['label'],
        ];
    }

    /**
     * Restrict an application query to the active window.
     *
     * The clone keeps callers free to reuse the same base query for several
     * charts without one chart's WHERE clause leaking into the next.
     */
    private function applicationsInWindow(QueryBuilder $query, array $window): QueryBuilder
    {
        return $this->withinWindow(clone $query, $window);
    }

    /**
     * Applications over time, returned as a dense gap-free series.
     */
    private function trendPayload(QueryBuilder $query, array $window, string $valueKey): array
    {
        $query = clone $query;
        $groupBy = $this->groupByFor('applications.created_at', $window);
        $rows = $query
            ->selectRaw("{$groupBy} as bucket_key, COUNT(*) as total")
            ->groupByRaw($groupBy)
            ->orderByRaw($groupBy)
            ->get()
            ->mapWithKeys(fn ($row) => [(string) $row->bucket_key => (int) $row->total]);

        $points = [];
        foreach ($this->slots($window) as $slot) {
            $points[] = [
                'key' => $slot['key'],
                'label' => $slot['label'],
                'full_label' => $slot['full_label'],
                $valueKey => $rows[$slot['key']] ?? 0,
            ];
        }

        $values = array_column($points, $valueKey);
        $max = $values === [] ? 0 : max($values);
        $peakIndex = $max > 0 ? array_search($max, $values, true) : false;

        return [
            'points' => $points,
            'total' => array_sum($values),
            'max' => (int) $max,
            'peak' => $peakIndex === false ? null : $points[$peakIndex],
            'granularity' => $window['granularity'],
            'value_key' => $valueKey,
        ];
    }

    /**
     * Applications, interview-stage and hires over time.
     */
    private function hiresTrendPayload(QueryBuilder $query, array $window): array
    {
        $query = clone $query;
        $groupBy = $this->groupByFor('applications.created_at', $window);
        $bucket = $this->bucketSql();

        $rows = $query
            ->selectRaw("{$groupBy} as bucket_key, COUNT(*) as total")
            ->selectRaw("SUM(CASE WHEN {$bucket} = 'interview' THEN 1 ELSE 0 END) as interviewed")
            ->selectRaw("SUM(CASE WHEN {$bucket} = 'hired' THEN 1 ELSE 0 END) as hired")
            ->groupByRaw($groupBy)
            ->orderByRaw($groupBy)
            ->get()
            ->mapWithKeys(fn ($row) => [(string) $row->bucket_key => $row]);

        $points = [];
        foreach ($this->slots($window) as $slot) {
            $row = $rows[$slot['key']] ?? null;

            $points[] = [
                'key' => $slot['key'],
                'label' => $slot['label'],
                'full_label' => $slot['full_label'],
                'applications' => $row ? (int) $row->total : 0,
                'interviewed' => $row ? (int) $row->interviewed : 0,
                'hired' => $row ? (int) $row->hired : 0,
            ];
        }

        return [
            'points' => $points,
            'total' => array_sum(array_column($points, 'applications')),
            'hired' => array_sum(array_column($points, 'hired')),
            'interviewed' => array_sum(array_column($points, 'interviewed')),
            'granularity' => $window['granularity'],
        ];
    }

    /**
     * Job seekers vs. establishments vs. vacancies registered over time.
     */
    private function seekerEstablishmentPayload(array $window): array
    {
        $seekers = $this->countOverTime(DB::table('job_seekers'), $window, 'job_seekers.created_at');
        $establishments = $this->countOverTime(DB::table('establishments'), $window, 'establishments.created_at');
        $vacancies = $this->countOverTime($this->jobQuery(), $window, self::JOB . '.created_at');

        $points = [];
        foreach ($this->slots($window) as $slot) {
            $points[] = [
                'key' => $slot['key'],
                'label' => $slot['label'],
                'full_label' => $slot['full_label'],
                'job_seekers' => $seekers[$slot['key']] ?? 0,
                'establishments' => $establishments[$slot['key']] ?? 0,
                'job_vacancies' => $vacancies[$slot['key']] ?? 0,
            ];
        }

        return [
            'points' => $points,
            'granularity' => $window['granularity'],
            'period_label' => $window['label'],
        ];
    }

    /**
     * Registered job seekers grouped by employment status.
     */
    private function employmentStatusPayload(): array
    {
        $palette = ['#1d4ed8', '#0d9488', '#d97706', '#7c3aed', '#64748b'];

        $rows = DB::table('job_seekers')
            ->select('employment_status', DB::raw('COUNT(*) as total'))
            ->groupBy('employment_status')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->get();

        $items = [];
        $index = 0;

        foreach ($rows as $row) {
            $items[] = [
                'label' => $row->employment_status ?: 'Not specified',
                'value' => (int) $row->total,
                'color' => $palette[$index % count($palette)],
            ];
            $index++;
        }

        if ($items === []) {
            $items[] = ['label' => 'No data', 'value' => 0, 'color' => '#cbd5e1'];
        }

        $total = array_sum(array_column($items, 'value'));

        return [
            'items' => array_map(fn ($item) => $item + [
                'percent' => $total > 0 ? round(($item['value'] / $total) * 100, 1) : 0.0,
            ], $items),
            'total' => $total,
        ];
    }

    /**
     * Job vacancies receiving the most applications.
     */
    private function applicationsPerJobPayload(int $limit, ?QueryBuilder $jobScope = null): array
    {
        $rows = ($jobScope ? clone $jobScope : $this->jobQuery())
            ->leftJoin('applications', 'applications.job_id', '=', 'job.id')
            ->select('job.id', 'job.job_title', 'job.hiring_status', 'job.vacant_positions')
            ->selectRaw('COUNT(applications.id) as applications')
            ->groupBy('job.id', 'job.job_title', 'job.hiring_status', 'job.vacant_positions')
            ->orderByDesc(DB::raw('COUNT(applications.id)'))
            ->limit($limit)
            ->get();

        $items = $rows->map(function ($row) {
            $title = trim((string) $row->job_title);
            $positions = (int) $row->vacant_positions;
            $applications = (int) $row->applications;

            return [
                'id' => (int) $row->id,
                'title' => $title !== '' ? $title : 'Untitled position',
                'label' => $this->truncate($title !== '' ? $title : 'Untitled position', 24),
                'applications' => $applications,
                'vacant_positions' => $positions,
                'hiring_status' => $row->hiring_status,
                'fill_rate' => $positions > 0 ? round(($applications / $positions) * 100) : 0,
            ];
        })->values()->all();

        return [
            'items' => $items,
            'total' => array_sum(array_column($items, 'applications')),
        ];
    }

    /**
     * Job vacancies ranked by applicant count.
     */
    private function topVacanciesPayload(int $limit, ?QueryBuilder $jobScope = null): array
    {
        $rows = ($jobScope ? clone $jobScope : $this->jobQuery())
            ->leftJoin('applications', 'applications.job_id', '=', 'job.id')
            ->select('job.id', 'job.job_title', 'job.hiring_status', 'job.vacant_positions', 'job.employment_type', 'job.created_at')
            ->selectRaw('COUNT(applications.id) as applications')
            ->groupBy('job.id', 'job.job_title', 'job.hiring_status', 'job.vacant_positions', 'job.employment_type', 'job.created_at')
            ->orderByDesc(DB::raw('COUNT(applications.id)'))
            ->orderByDesc('job.created_at')
            ->limit($limit)
            ->get();

        return $rows->map(function ($row) {
            $title = trim((string) $row->job_title);

            return [
                'id' => (int) $row->id,
                'title' => $title !== '' ? $title : 'Untitled position',
                'hiring_status' => $row->hiring_status,
                'vacant_positions' => (int) $row->vacant_positions,
                'employment_type' => $row->employment_type,
                'applications' => (int) $row->applications,
                'posted_at' => $row->created_at ? Carbon::parse($row->created_at)->toDateString() : null,
            ];
        })->values()->all();
    }

    /**
     * Most recent applications for the activity table.
     */
    private function recentApplicationsPayload(int $limit, ?QueryBuilder $scope = null): array
    {
        $bucket = $this->bucketSql();

        $rows = ($scope ? clone $scope : $this->applicationQuery())
            ->leftJoin('job_seekers', 'job_seekers.id', '=', 'applications.job_seeker_id')
            ->leftJoin('establishments', 'establishments.id', '=', 'job.establishment_id')
            ->select([
                'applications.id',
                'applications.created_at',
                'job.job_title',
                'job_seekers.first_name',
                'job_seekers.last_name',
                'establishments.company_name',
            ])
            ->selectRaw("{$bucket} as bucket_key")
            ->orderByDesc('applications.created_at')
            ->limit($limit)
            ->get();

        return $rows->map(function ($row) {
            $key = (string) $row->bucket_key;
            $meta = self::STATUS_META[$key] ?? self::STATUS_META['other'];
            $name = trim(($row->first_name ?? '') . ' ' . ($row->last_name ?? ''));

            return [
                'id' => (int) $row->id,
                'applicant' => $name !== '' ? $name : 'Unknown applicant',
                'job_title' => trim((string) $row->job_title) ?: 'Unknown position',
                'company' => $row->company_name,
                'status' => $meta['label'],
                'status_key' => $key,
                'status_color' => $meta['color'],
                'applied_at' => $row->created_at ? Carbon::parse($row->created_at)->toDateString() : null,
            ];
        })->values()->all();
    }

    /**
     * Period-over-period movement for the headline counters.
     */
    private function deltas(array $window, ?QueryBuilder $scope = null): array
    {
        $scope = $scope ? clone $scope : $this->applicationQuery();
        $bucket = $this->bucketSql();

        $current = (int) $this->withinWindow(clone $scope, $window)->count();
        $previous = (int) $this->inPreviousWindow(clone $scope, $window)->count();

        $currentHired = (int) $this->withinWindow(clone $scope, $window)->whereRaw("{$bucket} = 'hired'")->count();
        $previousHired = (int) $this->inPreviousWindow(clone $scope, $window)->whereRaw("{$bucket} = 'hired'")->count();

        return [
            'applications' => $this->percentChange($current, $previous),
            'hired' => $this->percentChange($currentHired, $previousHired),
            'current_applications' => $current,
            'previous_applications' => $previous,
            'current_hired' => $currentHired,
            'previous_hired' => $previousHired,
        ];
    }

    /* ---------------------------------------------------------------------
     | Series helpers
     | ------------------------------------------------------------------ */

    /**
     * SQL grouping expression matching the window granularity.
     */
    private function groupByFor(string $column, array $window): string
    {
        switch ($window['granularity']) {
            case 'hour':
                return "HOUR({$column})";
            case 'month':
                return "DATE_FORMAT({$column}, '%Y-%m')";
            default:
                return "DATE({$column})";
        }
    }

    /**
     * Enumerate every bucket in the window so charts never render gaps.
     *
     * @return array<int,array{key:string,label:string,full_label:string}>
     */
    private function slots(array $window): array
    {
        $start = $window['start']->copy();
        $end = $window['end']->copy();
        $slots = [];

        switch ($window['granularity']) {
            case 'hour':
                for ($hour = 0; $hour <= 23; $hour++) {
                    $cursor = $start->copy()->setTime($hour, 0);
                    $slots[] = [
                        'key' => (string) $hour,
                        'label' => $cursor->format('gA'),
                        'full_label' => $cursor->format('g:i A'),
                    ];
                }
                break;

            case 'month':
                for ($month = 1; $month <= 12; $month++) {
                    $cursor = $start->copy()->startOfYear()->addMonths($month - 1);
                    $slots[] = [
                        'key' => $cursor->format('Y-m'),
                        'label' => $cursor->format('M'),
                        'full_label' => $cursor->format('F Y'),
                    ];
                }
                break;

            default:
                $spansMonths = $start->month !== $end->month;
                $cursor = $start->copy()->startOfDay();

                while ($cursor->lessThanOrEqualTo($end)) {
                    $slots[] = [
                        'key' => $cursor->toDateString(),
                        'label' => $cursor->format($spansMonths ? 'M j' : 'j'),
                        'full_label' => $cursor->format('D, M j Y'),
                    ];
                    $cursor = $cursor->copy()->addDay();
                }
                break;
        }

        return $slots;
    }

    /**
     * Count rows per bucket for an arbitrary table / date column.
     *
     * @return array<string,int>
     */
    private function countOverTime(QueryBuilder $query, array $window, string $column): array
    {
        $groupBy = $this->groupByFor($column, $window);

        return $query
            ->whereBetween($column, [$window['start'], $window['end']])
            ->selectRaw("{$groupBy} as bucket_key, COUNT(*) as total")
            ->groupByRaw($groupBy)
            ->get()
            ->mapWithKeys(fn ($row) => [(string) $row->bucket_key => (int) $row->total])
            ->all();
    }

    /**
     * Percentage change between two counters.
     */
    private function percentChange(int $current, int $previous): float
    {
        if ($previous > 0) {
            return round((($current - $previous) / $previous) * 100, 1);
        }

        return $current > 0 ? 100.0 : 0.0;
    }

    /**
     * Shorten a label for use on a chart axis.
     */
    private function truncate(string $value, int $length): string
    {
        return mb_strlen($value) > $length
            ? mb_substr($value, 0, $length - 1) . '…'
            : $value;
    }
}
