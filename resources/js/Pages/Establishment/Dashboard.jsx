import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
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
import { useEffect, useState } from 'react';
import {
    Award,
    Bell,
    Briefcase,
    Building2,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Mail,
    MapPin,
    Phone,
    TrendingUp,
    User,
    UserCheck,
    Users,
} from 'lucide-react';

const EMPTY_ANALYTICS = {
    period: 'month',
    period_label: 'This Month',
    range: { start: null, end: null, granularity: 'day' },
    vacancy_hiring: { bars: [], total: 0, active_hiring: 0, inactive: 0, active_rate: 0 },
    application_status: { slices: [], total: 0 },
    applications_trend: { points: [] },
    hires_trend: { points: [] },
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
    hired: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    hiring: 'bg-blue-100 text-blue-700 border-blue-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    filled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const badgeFor = (status) => STATUS_BADGES[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200';

const QUICK_ACTIONS = [
    { label: 'Post Job', icon: Briefcase, href: 'establishment.jobs', color: 'from-blue-500 to-blue-600', link: true },
    { label: 'Applicants', icon: Users, href: 'establishment.applicants', color: 'from-emerald-500 to-emerald-600', link: true },
    { label: 'Company Profile', icon: Building2, href: 'establishment.profile', color: 'from-cyan-500 to-cyan-600', link: true },
    { label: 'Interviews', icon: Calendar, color: 'from-blue-500 to-blue-600', link: false },
    { label: 'Hiring Status', icon: UserCheck, color: 'from-amber-500 to-amber-600', link: false },
    { label: 'Reports', icon: FileText, color: 'from-indigo-500 to-indigo-600', link: false },
    { label: 'Notifications', icon: Bell, color: 'from-rose-500 to-rose-600', link: false },
];

export default function EstablishmentDashboard({
    establishment,
    recentApplicants,
    upcomingInterviews,
    activeJobs,
    notifications,
    performance,
    analytics,
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const monthly = performance?.monthly_progress || {};

    const data = { ...EMPTY_ANALYTICS, ...(analytics || {}) };
    const period = data.period || 'month';
    const totals = data.totals || {};
    const deltas = data.deltas || {};
    const vacancy = data.vacancy_hiring || {};
    const trend = data.applications_trend || {};
    const hiresTrend = data.hires_trend || {};

    const applicants = recentApplicants || [];
    const interviews = upcomingInterviews || [];
    const jobs = activeJobs || [];
    const notifs = notifications || [];

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
            icon: TrendingUp,
            tone: 'teal',
        },
        {
            label: 'Total Applications',
            value: totals.applications,
            delta: deltas.applications,
            hint: deltas.applications != null ? 'vs. previous period' : null,
            icon: Users,
            tone: 'violet',
        },
        {
            label: 'Hired',
            value: hiresTrend.hired,
            delta: deltas.hired,
            hint: deltas.hired != null ? 'vs. previous period' : null,
            icon: Award,
            tone: 'amber',
        },
    ];

    return (
        <EstablishmentLayouts
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Establishment Portal Dashboard
                    </h2>
                    <TimeFilter period={period} />
                </div>
            }
        >
            <Head title="Establishment Portal Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* ── Hero: company header (preserved) ── */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6 shadow-lg sm:p-8">
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-5">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                                    {establishment?.logo ? (
                                        <img
                                            src={`/storage/${establishment.logo}`}
                                            alt=""
                                            className="h-16 w-16 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <Building2 className="h-10 w-10 text-white/70" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                        {establishment?.company_name || 'Your Company'}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-blue-200">
                                        {establishment?.industry_category ? (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {establishment.industry_category}
                                            </span>
                                        ) : null}
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {establishment?.address ||
                                                establishment?.barangay?.barangay_name ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-blue-300">
                                        {establishment?.contact_person ? (
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {establishment.contact_person}
                                            </span>
                                        ) : null}
                                        {establishment?.email ? (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {establishment.email}
                                            </span>
                                        ) : null}
                                        {establishment?.contact_number ? (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {establishment.contact_number}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-3 sm:items-end">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 backdrop-blur-sm ${
                                        establishment?.user_id
                                            ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-300 ring-amber-500/30'
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            establishment?.user_id ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'
                                        }`}
                                    />
                                    {establishment?.user_id ? 'Verified' : 'Pending'}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-blue-300">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {currentTime.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                    <span className="mx-1">|</span>
                                    <Clock className="h-3.5 w-3.5" />
                                    {currentTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Headline metrics ── */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {metrics.map((metric) => (
                            <MetricCard key={metric.label} {...metric} />
                        ))}
                    </div>

                    {/* ── Job Vacancy & Hiring Status + Application Status ── */}
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
                            title="Application Status"
                            subtitle={`Pending, interview, hired and rejected · ${data.period_label}`}
                            bodyClassName="h-64"
                        >
                            <div className="flex h-full flex-col gap-3">
                                <div className="min-h-0 flex-1">
                                    <StatusDonut
                                        slices={data.application_status?.slices}
                                        total={data.application_status?.total}
                                        centerLabel={data.period_label}
                                        emptyMessage="No applications in this period."
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
                                emptyMessage="No applications received yet."
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
                        legend={[
                            { key: 'applications', label: 'Applications', color: '#1d4ed8' },
                            { key: 'interviewed', label: 'For Interview', color: '#3b82f6' },
                            { key: 'hired', label: 'Hired', color: '#0d9488' },
                        ]}
                    >
                        <TrendChart
                            points={hiresTrend.points?.length ? hiresTrend.points : trend.points}
                            series={[
                                { key: 'applications', label: 'Applications', color: '#1d4ed8' },
                                { key: 'interviewed', label: 'For Interview', color: '#3b82f6' },
                                { key: 'hired', label: 'Hired', color: '#0d9488' },
                            ]}
                            emptyMessage="No applications recorded in this period."
                        />
                    </ChartCard>

                    {/* ── Quick actions ── */}
                    <div>
                        <h3 className="mb-3 text-lg font-bold text-slate-900">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                            {QUICK_ACTIONS.map((item) => {
                                const inner = (
                                    <>
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}
                                        >
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-center text-[11px] font-medium text-slate-600">
                                            {item.label}
                                        </span>
                                    </>
                                );
                                const base =
                                    'group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg';

                                return item.link ? (
                                    <Link key={item.label} href={route(item.href)} className={base}>
                                        {inner}
                                    </Link>
                                ) : (
                                    <button key={item.label} type="button" className={base}>
                                        {inner}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Hiring performance (preserved) ── */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <ChartCard
                            title="Hiring Performance"
                            subtitle="Conversion and speed across all your vacancies"
                            bodyClassName="h-auto"
                        >
                            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { label: 'Most Applied', value: performance?.most_applied_position || performance?.top_job_title || 'N/A' },
                                    { label: 'Applicants for Top Job', value: formatNumber(performance?.top_job_applications || 0) },
                                    { label: 'Success Rate', value: `${performance?.success_rate ?? 0}%` },
                                    { label: 'Avg. Hiring Days', value: performance?.avg_hiring_days ?? '—' },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
                                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                            {item.label}
                                        </dt>
                                        <dd className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={String(item.value)}>
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </ChartCard>

                        <ChartCard
                            title="Monthly Progress"
                            subtitle="Applicants and hires this month against target"
                            bodyClassName="h-auto"
                        >
                            <dl className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Applicants', value: formatNumber(monthly?.applicants_this_month || 0), tone: 'text-blue-700' },
                                    { label: 'Hired', value: formatNumber(monthly?.hired_this_month || 0), tone: 'text-teal-700' },
                                    { label: 'Target', value: formatNumber(monthly?.target || 0), tone: 'text-amber-700' },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2.5 text-center">
                                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                            {item.label}
                                        </dt>
                                        <dd className={`mt-0.5 text-xl font-bold ${item.tone}`}>{item.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </ChartCard>
                    </div>

                    {/* ── Recent applications / interviews / active jobs ── */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <ChartCard
                            title="Recent Applications"
                            subtitle="Latest applicants to your vacancies"
                            action={
                                <Link
                                    href={route('establishment.applicants')}
                                    className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
                                >
                                    View All <ChevronRight className="h-3 w-3" />
                                </Link>
                            }
                            bodyClassName="h-auto"
                        >
                            <ul className="divide-y divide-slate-100">
                                {applicants.length ? (
                                    applicants.slice(0, 6).map((app) => (
                                        <li
                                            key={app.id}
                                            className="flex items-center gap-3 py-2.5 transition-colors hover:bg-slate-50"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                                                {(app.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {app.name}
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {app.jobTitle}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${badgeFor(
                                                    app.status,
                                                )}`}
                                            >
                                                {app.status}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="py-8 text-center text-sm text-slate-400">
                                        No applications yet.
                                    </li>
                                )}
                            </ul>
                        </ChartCard>

                        <ChartCard title="Upcoming Interviews" subtitle="Scheduled applicant interviews" bodyClassName="h-auto">
                            <ul className="divide-y divide-slate-100">
                                {interviews.length ? (
                                    interviews.slice(0, 6).map((interview) => (
                                        <li
                                            key={interview.id}
                                            className="flex items-center gap-3 py-2.5 transition-colors hover:bg-slate-50"
                                        >
                                            <CalendarCheck className="h-4 w-4 shrink-0 text-blue-600" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {interview.applicant_name ||
                                                        interview.jobSeeker?.full_name ||
                                                        'Applicant'}
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {interview.job_title || interview.job?.job_title || 'Position'}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-[11px] font-medium capitalize text-slate-500">
                                                {interview.status}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="py-8 text-center text-sm text-slate-400">
                                        No interviews scheduled.
                                    </li>
                                )}
                            </ul>
                        </ChartCard>

                        <ChartCard title="Active Job Vacancies" subtitle="Currently open for hiring" bodyClassName="h-auto">
                            <ul className="divide-y divide-slate-100">
                                {jobs.length ? (
                                    jobs.slice(0, 6).map((job) => (
                                        <li key={job.id} className="flex items-center gap-3 py-2.5 transition-colors hover:bg-slate-50">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {job.job_title}
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {job.employment_type} · {job.vacant_positions} slot(s)
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${badgeFor(
                                                    job.hiring_status,
                                                )}`}
                                            >
                                                {job.hiring_status}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="py-8 text-center text-sm text-slate-400">
                                        No active vacancies.
                                    </li>
                                )}
                            </ul>
                        </ChartCard>
                    </div>

                    {/* ── Notifications ── */}
                    <ChartCard title="Recent Activity" subtitle="Latest notifications and updates" bodyClassName="h-auto">
                        <ul className="divide-y divide-slate-100">
                            {notifs.length ? (
                                notifs.slice(0, 8).map((log) => (
                                    <li key={log.id} className="flex items-start gap-3 py-2.5">
                                        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-700">
                                                {log.description || log.action}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {log.module} · {log.created_at}
                                            </p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="py-8 text-center text-sm text-slate-400">No recent activity.</li>
                            )}
                        </ul>
                    </ChartCard>
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
