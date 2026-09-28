import AdminLayouts from '@/Layouts/AdminLayouts';
import {
    ChartCard,
    MetricBars,
    MetricCard,
    RankedBars,
    StatusDonut,
    TimeFilter,
    TrendChart,
    formatNumber,
} from '@/Components/Dashboard';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, Building2, ExternalLink, FileText, TrendingUp, Users } from 'lucide-react';

const EMPTY_ANALYTICS = {
    period: 'month',
    period_label: 'This Month',
    range: { start: null, end: null, granularity: 'day' },
    employment_overview: [],
    vacancy_hiring: { bars: [], total: 0, active_hiring: 0, inactive: 0, active_rate: 0 },
    application_status: { slices: [], total: 0 },
    applications_trend: { points: [] },
    seeker_establishment: { points: [] },
    employment_status: { items: [] },
    applications_per_job: { items: [] },
    recent_applications: [],
    totals: {},
    deltas: {},
};

const OVERVIEW_ICONS = {
    job_seekers: Users,
    establishments: Building2,
    job_vacancies: Briefcase,
    applications: FileText,
};

const OVERVIEW_TONES = {
    job_seekers: 'blue',
    establishments: 'teal',
    job_vacancies: 'violet',
    applications: 'amber',
};

const TONE_FROM_COLOR = {
    '#1d4ed8': 'blue',
    '#0f766e': 'teal',
    '#d97706': 'amber',
    '#7c3aed': 'violet',
    '#dc2626': 'red',
    '#94a3b8': 'slate',
};

const EMPTY_MESSAGE = 'No data for this period.';

export default function AdminDashboard({ statistics, analytics }) {
    const data = { ...EMPTY_ANALYTICS, ...(analytics || {}) };
    const period = data.period || 'month';
    const totals = data.totals || {};
    const deltas = data.deltas || {};
    const vacancy = data.vacancy_hiring || {};
    const trend = data.applications_trend || {};

    const stats = statistics || {};

    const metrics = (data.employment_overview?.length ? data.employment_overview : [
        { key: 'job_seekers', label: 'Job Seekers', value: stats.total_job_seekers, color: '#1d4ed8' },
        { key: 'establishments', label: 'Establishments', value: stats.total_establishments, color: '#0f766e' },
        { key: 'job_vacancies', label: 'Job Vacancies', value: stats.total_job_vacancies, color: '#7c3aed' },
        { key: 'applications', label: 'Applications', value: stats.total_applications, color: '#d97706' },
    ]).map((item) => ({
        label: item.label,
        value: item.value,
        icon: OVERVIEW_ICONS[item.key],
        tone: OVERVIEW_TONES[item.key] || TONE_FROM_COLOR[item.color] || 'blue',
        hint:
            item.key === 'job_vacancies' && vacancy.active_hiring != null
                ? `${formatNumber(vacancy.active_hiring)} actively hiring`
                : null,
    }));

    const comparisonSeries = [
        { key: 'job_seekers', label: 'Job Seekers', color: '#1d4ed8' },
        { key: 'establishments', label: 'Establishments', color: '#0d9488' },
        { key: 'job_vacancies', label: 'Job Vacancies', color: '#7c3aed' },
    ];

    const employmentItems = (data.employment_status?.items || []).map((item) => ({
        key: item.label,
        label: item.label,
        value: item.value,
        color: item.color,
    }));

    return (
        <AdminLayouts
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>
                    <TimeFilter period={period} />
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* ── Employment overview ── */}
                <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-slate-900">Employment Overview</h3>
                        {data.range?.start ? (
                            <span className="text-xs text-slate-500">
                                {data.range.start} – {data.range.end}
                            </span>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {metrics.map((metric) => (
                            <MetricCard key={metric.label} {...metric} />
                        ))}
                    </div>
                </div>

                {/* ── Vacancy / hiring + application status ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <ChartCard
                        title="Job Vacancy & Hiring Status"
                        subtitle={`Active vs. total vacancies · ${data.period_label}`}
                        legend={vacancy.bars?.map((bar) => ({
                            key: bar.key,
                            label: bar.label,
                            color: bar.color,
                        }))}
                        footer={
                            <span className="flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {formatNumber(totals.hiring_establishments || 0)} establishment(s) currently hiring ·{' '}
                                {formatNumber(totals.vacant_positions || 0)} position(s) advertised
                            </span>
                        }
                    >
                        <MetricBars bars={vacancy.bars} emptyMessage={EMPTY_MESSAGE} />
                    </ChartCard>

                    <ChartCard
                        title="Application Status"
                        subtitle={`Pending, interviewed, hired and rejected · ${data.period_label}`}
                        footer={
                            <span>
                                Applications in {data.period_label.toLowerCase()}:{' '}
                                <span className="font-semibold text-slate-700">
                                    {formatNumber(data.application_status?.total || 0)}
                                </span>
                            </span>
                        }
                    >
                        <div className="flex h-full flex-col gap-3">
                            <div className="min-h-0 flex-1">
                                <StatusDonut
                                    slices={data.application_status?.slices}
                                    total={data.application_status?.total}
                                    centerLabel={data.period_label}
                                    emptyMessage={EMPTY_MESSAGE}
                                />
                            </div>
                            <ul className="grid grid-cols-2 gap-2">
                                {(data.application_status?.slices || []).map((slice) => (
                                    <li
                                        key={slice.key}
                                        className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs"
                                    >
                                        <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{ backgroundColor: slice.color }}
                                            />
                                            <span className="truncate">{slice.label}</span>
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {formatNumber(slice.value)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ChartCard>

                    <ChartCard
                        title="Applicant Employment Status"
                        subtitle="Registered job seekers by current employment"
                        bodyClassName="h-72"
                    >
                        <MetricBars
                            bars={employmentItems}
                            valueKey="value"
                            labelKey="label"
                            layout="horizontal"
                            emptyMessage="No job seeker records."
                        />
                    </ChartCard>
                </div>

                {/* ── Monthly applications trend ── */}
                <ChartCard
                    title="Monthly Applications Trend"
                    subtitle={
                        data.range?.start
                            ? `${data.range.start} – ${data.range.end} · peak ${formatNumber(
                                  trend.peak?.applications || 0,
                              )}`
                            : `Applications received · ${data.period_label}`
                    }
                    legend={[{ key: 'applications', label: 'Applications', color: '#1d4ed8' }]}
                    action={
                        <span className="text-xs text-slate-500">
                            {deltas.applications != null
                                ? `${deltas.applications >= 0 ? '+' : ''}${deltas.applications}% vs. previous period`
                                : null}
                        </span>
                    }
                    bodyClassName="h-72"
                >
                    <TrendChart
                        points={trend.points}
                        series={[{ key: 'applications', label: 'Applications', color: '#1d4ed8' }]}
                        emptyMessage={EMPTY_MESSAGE}
                    />
                </ChartCard>

                {/* ── Job seeker vs. establishment comparison ── */}
                <ChartCard
                    title="Job Seeker vs. Establishment Comparison"
                    subtitle={`New registrations over time · ${data.period_label}`}
                    legend={comparisonSeries}
                    bodyClassName="h-80"
                >
                    <TrendChart
                        points={data.seeker_establishment?.points}
                        series={comparisonSeries}
                        variant="line"
                        emptyMessage="No registrations in this period."
                    />
                </ChartCard>

                {/* ── Applications per vacancy + recent activity ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ChartCard
                        title="Applications per Job Vacancy"
                        subtitle="Top vacancies by applicant count"
                        bodyClassName="h-80"
                    >
                        <RankedBars
                            items={data.applications_per_job?.items}
                            emptyMessage={EMPTY_MESSAGE}
                        />
                    </ChartCard>

                    <ChartCard
                        title="Recent Applications"
                        subtitle="Latest submissions across all establishments"
                        bodyClassName="h-auto"
                        action={
                            <Link
                                href={route('admin.applications')}
                                className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
                            >
                                View All <ArrowRight className="h-3 w-3" />
                            </Link>
                        }
                    >
                        <ul className="divide-y divide-slate-100">
                            {data.recent_applications?.length ? (
                                data.recent_applications.map((application) => (
                                    <li
                                        key={application.id}
                                        className="flex items-center gap-3 py-2.5 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                                            {application.applicant.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-800">
                                                {application.applicant}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                                {application.job_title}
                                                {application.company ? ` · ${application.company}` : ''}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span
                                                className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                style={{
                                                    backgroundColor: `${application.status_color}1f`,
                                                    color: application.status_color,
                                                }}
                                            >
                                                {application.status}
                                            </span>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                {application.applied_at}
                                            </p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="py-10 text-center text-sm text-slate-400">
                                    No applications yet.
                                </li>
                            )}
                        </ul>
                    </ChartCard>
                </div>

                {/* ── Shortcuts ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Job Seekers', href: 'admin.jobseekers', icon: Users },
                        { label: 'Establishments', href: 'admin.establishments', icon: Building2 },
                        { label: 'Job Vacancies', href: 'admin.jobvacancies', icon: Briefcase },
                        { label: 'Applications', href: 'admin.applications', icon: FileText },
                    ].map((action) => (
                        <Link
                            key={action.href}
                            href={route(action.href)}
                            className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <action.icon className="h-4 w-4 text-blue-700" />
                                {action.label}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-blue-600" />
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayouts>
    );
}
