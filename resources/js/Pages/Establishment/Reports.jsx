import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart3, FileText, Download, Users, Briefcase, CheckCircle, TrendingUp,
    PieChart as PieChartIcon, Building2, Clock, XCircle, UserCheck, Calendar, Search,
    Award, Target, Activity, Printer
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

function StatCard({ title, value, icon: Icon, color, change, subtitle }) {
    const gradients = {
        blue: 'from-blue-500 to-blue-600', green: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600', purple: 'from-purple-500 to-purple-600',
        rose: 'from-rose-500 to-rose-600', cyan: 'from-cyan-500 to-cyan-600',
        indigo: 'from-indigo-500 to-indigo-600', teal: 'from-teal-500 to-teal-600',
        orange: 'from-orange-500 to-orange-600', pink: 'from-pink-500 to-pink-600',
    };
    const lightColors = {
        blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600',
        rose: 'bg-rose-50 text-rose-600', cyan: 'bg-cyan-50 text-cyan-600',
        indigo: 'bg-indigo-50 text-indigo-600', teal: 'bg-teal-50 text-teal-600',
        orange: 'bg-orange-50 text-orange-600', pink: 'bg-pink-50 text-pink-600',
    };
    const isPos = change >= 0;
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${gradients[color] || gradients.blue}`} />
            <div className="relative flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${lightColors[color] || lightColors.blue} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                </div>
                {change !== undefined && change !== null && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <TrendingUp className={`h-3 w-3 ${!isPos ? 'rotate-180' : ''}`} />
                        {isPos ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <div className="relative mt-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value || 0}</p>
                {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3">
                {Icon && <Icon className="h-8 w-8 text-slate-400" />}
            </div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
    );
}

const statusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const styles = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        'for review': 'bg-blue-100 text-blue-700 border-blue-200',
        'for interview': 'bg-purple-100 text-purple-700 border-purple-200',
        interview: 'bg-purple-100 text-purple-700 border-purple-200',
        interview_scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
        hired: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        Open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Hiring: 'bg-blue-100 text-blue-700 border-blue-200',
        Closed: 'bg-slate-100 text-slate-600 border-slate-200',
        Filled: 'bg-purple-100 text-purple-700 border-purple-200',
        scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return styles[s] || 'bg-slate-100 text-slate-600 border-slate-200';
};

export default function Reports() {
    const {
        establishment, statistics, monthlyApplications, applicationsByStatus,
        applicationsPerJob, hiringPerformance, jobs, applicationsReport,
        hiringMetrics, topJobs, upcomingInterviews, recentActivities,
        period, periodRange
    } = usePage().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [customFrom, setCustomFrom] = useState(periodRange?.from || '');
    const [customTo, setCustomTo] = useState(periodRange?.to || '');

    const activePeriod = period || 'year';

    const stats = statistics || {};
    const changes = stats.changes || {};
    const monthApps = monthlyApplications || [];
    const statusData = applicationsByStatus || [];
    const perJob = applicationsPerJob || [];
    const hirePerf = hiringPerformance || [];
    const jobPerf = jobs || [];
    const appReport = applicationsReport || { data: [] };
    const metrics = hiringMetrics || {};
    const topJobList = topJobs || [];
    const interviews = upcomingInterviews || [];
    const activities = recentActivities || [];

    const filterOptions = [
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'year', label: 'This Year' },
        { key: 'custom', label: 'Custom' },
    ];

    // The period is resolved on the server so every figure and chart below
    // reflects the same window.
    const applyPeriod = (key, from = customFrom, to = customTo) => {
        router.get(route('establishment.reports'), {
            period: key,
            date_from: key === 'custom' ? (from || undefined) : undefined,
            date_to: key === 'custom' ? (to || undefined) : undefined,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const lineChartData = monthApps.map(m => ({
        name: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m.month] || '',
        applications: m.count,
    }));

    // The series is zero filled across the whole period, so length is never
    // zero. Decide the empty state by whether anything was actually counted.
    const hasApplications = monthApps.some(m => m.count > 0);
    const hasHires = hirePerf.some(m => m.hired > 0);

    const hiringLineData = hirePerf.map(m => ({
        name: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m.month] || '',
        hired: m.hired,
    }));

    const barData = perJob.map(j => ({
        name: (j.title || '').length > 18 ? j.title.substring(0, 18) + '...' : j.title,
        applicants: j.applications,
    }));

    const filteredApps = appReport.data?.filter(a =>
        !searchTerm || a.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.position?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <EstablishmentLayouts>
            <Head title="Reports & Analytics" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* ── Header ── */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
                            <p className="text-slate-500 mt-1 text-sm">Company-specific reports for {establishment?.company_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white text-sm rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                <Printer className="h-4 w-4" /> Print Report
                            </button>
                            <a href={route('establishment.reports.export.pdf')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                                <Download className="h-4 w-4" /> PDF
                            </a>
                            <a href={route('establishment.reports.export.excel')}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                                <FileText className="h-4 w-4" /> CSV
                            </a>
                        </div>
                    </div>

                    {/* ── Filter Bar ── */}
                    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                            {filterOptions.map((opt) => (
                                <button key={opt.key} onClick={() => applyPeriod(opt.key)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activePeriod === opt.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {activePeriod === 'custom' && (
                            <div className="flex items-center gap-2">
                                <input type="date" value={customFrom} max={customTo || undefined}
                                    onChange={e => setCustomFrom(e.target.value)}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                <span className="text-xs text-slate-400">to</span>
                                <input type="date" value={customTo} min={customFrom || undefined}
                                    onChange={e => setCustomTo(e.target.value)}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                <button onClick={() => applyPeriod('custom')}
                                    className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
                                    Apply
                                </button>
                            </div>
                        )}

                        <div className="flex-1" />
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-48 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Search applicants..." />
                        </div>
                    </div>

                    {/* ── Summary Cards ── */}
                    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard title="Active Jobs" value={stats.active_jobs} icon={Briefcase} color="blue" />
                        <StatCard title="Closed Jobs" value={stats.closed_jobs} icon={XCircle} color="orange" />
                        <StatCard title="Total Applications" value={stats.total_applications} icon={Users} color="green" change={changes.total_applications} />
                        <StatCard title="New Today" value={stats.new_applicants_today} icon={Clock} color="amber" />
                        <StatCard title="Pending" value={stats.pending} icon={Clock} color="amber" change={changes.pending} />
                        <StatCard title="Interview" value={stats.for_interview} icon={UserCheck} color="purple" />
                        <StatCard title="Hired" value={stats.hired} icon={Award} color="teal" change={changes.hired} />
                        <StatCard title="No Status Yet" value={stats.no_status} icon={Search} color="indigo" />
                        <StatCard title="Fill Rate" value={`${stats.fill_rate}%`} icon={Target} color="pink" />
                    </div>

                    {/* ── Analytics Charts ── */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Line Chart - Monthly Applications */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" /> Monthly Applications Trend
                            </h4>
                            {hasApplications ? (
                                <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height={250}>
                                    <LineChart data={lineChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                        <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : <EmptyState icon={BarChart3} title="No data yet" />}
                        </div>

                        {/* Doughnut - Applications by Status */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                                <PieChartIcon className="h-4 w-4 text-purple-600" /> Applications by Status
                            </h4>
                            {statusData.some(d => d.value > 0) ? (
                                <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}>
                                            {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState icon={PieChartIcon} title="No applications yet" />}
                        </div>

                        {/* Bar - Applications Per Job */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-emerald-600" /> Applications Per Job
                            </h4>
                            {barData.some(d => d.applicants > 0) ? (
                                <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height={250}>
                                    <BarChart data={barData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" width={120} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                        <Bar dataKey="applicants" fill="#10b981" radius={[0, 4, 4, 0]} name="Applicants" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyState icon={BarChart3} title="No jobs posted yet" />}
                        </div>
                    </div>

                    {/* ── More Charts Row ── */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Monthly Hiring Performance */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-600" /> Monthly Hiring Performance
                            </h4>
                            {hasHires ? (
                                <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height={220}>
                                    <AreaChart data={hiringLineData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                        <Area type="monotone" dataKey="hired" stroke="#10b981" fill="rgba(16,185,129,0.15)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <EmptyState icon={TrendingUp} title="No hires yet" />}
                        </div>

                        {/* Hiring Success Rate */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Target className="h-4 w-4 text-indigo-600" /> Hiring Success Rate
                            </h4>
                            {stats.total_applications > 0 ? (
                                <div className="flex items-center justify-center h-[220px]">
                                    <div className="relative w-44 h-44">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                            <circle cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="8"
                                                strokeDasharray={`${(metrics.success_rate || 0) * 3.39} 339`} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-slate-900">{metrics.success_rate || 0}%</span>
                                            <span className="text-xs text-slate-500">Success</span>
                                        </div>
                                    </div>
                                    <div className="ml-6 space-y-2 text-sm">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-slate-600">Hired: {stats.hired}</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-slate-600">Interview: {stats.for_interview}</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-slate-600">Pending: {stats.pending}</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500" /><span className="text-slate-600">No status yet: {stats.no_status}</span></div>
                                    </div>
                                </div>
                            ) : <EmptyState icon={Target} title="No data yet" />}
                        </div>
                    </div>

                    {/* ── Job Vacancy Performance Table ── */}
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-600" /> Job Vacancy Performance
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Job Title</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Applicants</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Interviewed</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Hired</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Rejected</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Vacancies</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {jobPerf.length > 0 ? jobPerf.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">{job.title}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{job.employment_type || 'N/A'}</td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{job.applicants}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center text-sm text-slate-600">{job.interviewed}</td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="text-sm font-semibold text-emerald-600">{job.hired}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center text-sm text-red-500">{job.rejected}</td>
                                            <td className="px-5 py-4 text-center text-sm text-slate-600">{job.vacancies || 0}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(job.status)}`}>{job.status}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="px-5 py-12"><EmptyState icon={Briefcase} title="No jobs posted" /></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Applications Report Table ── */}
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-600" /> Applications Report
                            </h4>
                            <span className="text-xs text-slate-400">{appReport.total || filteredApps.length} total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Applicant</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Position</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Interview</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredApps.length > 0 ? filteredApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 font-bold text-xs">
                                                        {(app.applicant_name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900">{app.applicant_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">{app.position}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{app.applied_date}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(app.status)}`}>{app.status}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{app.interview_date || '-'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(app.result)}`}>{app.result}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="px-5 py-12"><EmptyState icon={Users} title="No applications found" /></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {appReport.last_page > 1 && (
                            <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between text-sm text-slate-500">
                                <span>Page {appReport.current_page} of {appReport.last_page}</span>
                                <div className="flex gap-2">
                                    {appReport.prev_page_url && <Link href={appReport.prev_page_url} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs">Previous</Link>}
                                    {appReport.next_page_url && <Link href={appReport.next_page_url} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs">Next</Link>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Bottom Row: Hiring Performance + Top Jobs + Interviews + Activities ── */}
                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
                        {/* Hiring Performance */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Activity className="h-4 w-4 text-cyan-600" /> Hiring Performance
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm text-slate-600">Avg. Hiring Time</span>
                                    <span className="text-sm font-bold text-slate-900">{metrics.avg_hiring_days || 0} days</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm text-slate-600">Total Hired</span>
                                    <span className="text-sm font-bold text-emerald-600">{metrics.total_hired || 0}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm text-slate-600">Success Rate</span>
                                    <span className="text-sm font-bold text-slate-900">{metrics.success_rate || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm text-slate-600">Interview Rate</span>
                                    <span className="text-sm font-bold text-purple-600">{metrics.interview_rate || 0}%</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-sm text-slate-600">Pending Rate</span>
                                    <span className="text-sm font-bold text-amber-600">{metrics.pending_rate || 0}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Performing Jobs */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Award className="h-4 w-4 text-amber-600" /> Top Performing Jobs
                            </h4>
                            {topJobList.length > 0 ? (
                                <div className="space-y-3">
                                    {topJobList.map((job, i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                                #{i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                    <span>{job.applicants} applicants</span>
                                                    <span className="text-emerald-600 font-medium">{job.hired} hired</span>
                                                    <span>{job.percentage}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState icon={Award} title="No job data yet" />}
                        </div>

                        {/* Upcoming Interviews */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Calendar className="h-4 w-4 text-purple-600" /> Upcoming Interviews
                            </h4>
                            {interviews.length > 0 ? (
                                <div className="space-y-3">
                                    {interviews.slice(0, 5).map((iv) => (
                                        <div key={iv.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-xs">
                                                {(iv.applicant_name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{iv.applicant_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{iv.position}</p>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                                    <span>{iv.interview_date}</span>
                                                    {iv.interview_time && <><span>•</span><span>{iv.interview_time}</span></>}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadge(iv.status)}`}>
                                                {iv.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState icon={Calendar} title="No upcoming interviews" />}
                        </div>

                        {/* Recent Activities */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Activity className="h-4 w-4 text-rose-600" /> Recent Activities
                            </h4>
                            {activities.length > 0 ? (
                                <div className="space-y-2">
                                    {activities.map((act, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
                                            <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                                act.type === 'job_posted' ? 'bg-blue-100 text-blue-600' :
                                                act.type === 'new_application' ? 'bg-green-100 text-green-600' :
                                                act.type === 'hired' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {act.type === 'job_posted' ? <Briefcase className="h-3 w-3" /> :
                                                 act.type === 'new_application' ? <Users className="h-3 w-3" /> :
                                                 act.type === 'hired' ? <CheckCircle className="h-3 w-3" /> :
                                                 <Calendar className="h-3 w-3" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] text-slate-700">{act.text}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{act.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState icon={Activity} title="No recent activity" />}
                        </div>
                    </div>

                </div>
            </div>
        </EstablishmentLayouts>
    );
}
