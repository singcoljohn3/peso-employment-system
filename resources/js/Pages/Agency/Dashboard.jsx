import { Head } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
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
import { Briefcase, CheckCircle, Clock, MapPin, TrendingUp, UserCheck, Users } from 'lucide-react';

const EMPTY_ANALYTICS = {
    period: 'month',
    period_label: 'This Month',
    range: { start: null, end: null, granularity: 'day' },
    vacancy_hiring: { bars: [], total: 0, active_hiring: 0, inactive: 0, active_rate: 0 },
    application_status: { slices: [], total: 0 },
    applications_trend: { points: [] },
    applications_per_job: { items: [] },
    recent_applications: [],
    totals: {},
    deltas: {},
};

const STATUS_BADGES = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    'for review': 'bg-blue-100 text-blue-700 border-blue-200',
    'for interview': 'bg-blue-100 text-blue-700 border-blue-200',
    interview: 'bg-blue-100 text-blue-700 border-blue-200',
    interviewed: 'bg-blue-100 text-blue-700 border-blue-200',
    hired: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
};

const badgeFor = (status) =>
    STATUS_BADGES[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200';

export default function Dashboard({ agency, recentApplicants, analytics }) {
    const data = { ...EMPTY_ANALYTICS, ...(analytics || {}) };
    const period = data.period || 'month';
    const totals = data.totals || {};
    const deltas = data.deltas || {};
    const vacancy = data.vacancy_hiring || {};
    const trend = data.applications_trend || {};

    const applicants = recentApplicants || [];

    const metrics = [
        {
            label: 'Total Job Vacancies',
            value: vacancy.total,
            hint: `${formatNumber(vacancy.inactive || 0)} closed or filled`,
            icon: Briefcase,
            tone: 'blue',
        },
        {
            label: 'Active Hiring',
            value: vacancy.active_hiring,
            hint: `${vacancy.active_rate || 0}% of all vacancies`,
            icon: CheckCircle,
            tone: 'teal',
        },
        {
            label: 'Total Applicants',
            value: totals.applications,
            delta: deltas.applications,
            hint: deltas.applications != null ? 'vs. previous period' : null,
            icon: Users,
            tone: 'violet',
        },
        {
            label: 'Hired',
            value: trend.hired,
            delta: deltas.hired,
            hint: deltas.hired != null ? 'vs. previous period' : null,
            icon: UserCheck,
            tone: 'amber',
        },
    ];

    return (
        <AgencyLayouts
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>
                    <TimeFilter period={period} />
                </div>
            }
        >
            <Head title="Agency Dashboard" />

            <div className="space-y-6">
                {/* Agency banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 shadow-2xl shadow-blue-600/30 sm:p-8">
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                        <div className="flex h-full items-center justify-end pr-6">
                            <Clock className="h-24 w-24 text-white" />
                        </div>
                    </div>
                    <div className="relative">
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            {agency?.agency_name || 'Agency Dashboard'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-blue-100">
                            Track your vacancies, applicants and hiring progress in one place.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-blue-100">
                            {agency?.agency_name ? (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {agency?.address || agency?.barangay?.barangay_name || 'N/A'}
                                </span>
                            ) : null}
                            {agency?.contact_person ? (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {agency.contact_person}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Headline metrics */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric) => (
                        <MetricCard key={metric.label} {...metric} />
                    ))}
                </div>

                {/* Job Vacancy & Hiring Status + Applicant Status */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <ChartCard
                        title="Job Vacancy & Hiring Status"
                        subtitle={`Total vs. active hiring · ${data.period_label}`}
                        legend={vacancy.bars?.map((bar) => ({
                            key: bar.key,
                            label: bar.label,
                            color: bar.color,
                        }))}
                    >
                        <MetricBars bars={vacancy.bars} emptyMessage="No vacancies posted yet." />
                    </ChartCard>

                    <ChartCard
                        title="Applicant Status"
                        subtitle={`Pending, interview, hired and rejected · ${data.period_label}`}
                    >
                        <div className="flex h-full flex-col gap-3">
                            <div className="min-h-0 flex-1">
                                <StatusDonut
                                    slices={data.application_status?.slices}
                                    total={data.application_status?.total}
                                    centerLabel={data.period_label}
                                    emptyMessage="No applicants in this period."
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
                        title="Applications per Job Vacancy"
                        subtitle="Top vacancies by applicant count"
                        bodyClassName="h-80"
                    >
                        <RankedBars
                            items={data.applications_per_job?.items}
                            emptyMessage="No applicants received yet."
                        />
                    </ChartCard>
                </div>

                {/* Monthly trend */}
                <ChartCard
                    title="Monthly Applications Trend"
                    subtitle={
                        data.range?.start
                            ? `${data.range.start} – ${data.range.end} · peak ${formatNumber(
                                  trend.peak?.applications || 0,
                              )}`
                            : `Applicants received · ${data.period_label}`
                    }
                    legend={[{ key: 'applications', label: 'Applications', color: '#1d4ed8' }]}
                    bodyClassName="h-72"
                >
                    <TrendChart
                        points={trend.points}
                        series={[{ key: 'applications', label: 'Applications', color: '#1d4ed8' }]}
                        emptyMessage="No applications recorded in this period."
                    />
                </ChartCard>

                {/* Recent applications table */}
                <ChartCard
                    title="Recent Applications"
                    subtitle="Latest applicants to your vacancies"
                    bodyClassName="h-auto"
                    footer={
                        <span className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {formatNumber(applicants.length)} most recent application(s)
                        </span>
                    }
                >
                    <div className="-mx-4 overflow-x-auto sm:-mx-5">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    {['Applicant', 'Position', 'Status', 'Applied'].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applicants.length ? (
                                    applicants.map((applicant) => (
                                        <tr key={applicant.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-800 sm:px-5">
                                                {applicant.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 sm:px-5">
                                                {applicant.jobTitle}
                                            </td>
                                            <td className="px-4 py-3 sm:px-5">
                                                <span
                                                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${badgeFor(
                                                        applicant.status,
                                                    )}`}
                                                >
                                                    {applicant.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500 sm:px-5">
                                                {applicant.appliedDate}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">
                                            No applications received yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            </div>
        </AgencyLayouts>
    );
}
