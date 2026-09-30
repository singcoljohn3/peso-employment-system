import { Head } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Users, Briefcase, CheckCircle, XCircle, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Pagination from '@/Components/Agency/Pagination';

const StatusTooltip = ({ active, payload, total }) => {
    if (active && payload?.length) {
        const p = payload[0];
        const pct = total > 0 ? ` (${Math.round((p.value / total) * 100)}%)` : '';
        return (
            <div className="rounded-xl border border-gray-100 bg-white/95 px-3 py-2 shadow-lg">
                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                <p className="text-sm font-medium" style={{ color: p.payload?.color || p.color }}>{p.value}{pct}</p>
            </div>
        );
    }
    return null;
};

const PER_PAGE = 10;

export default function Reports({ agency, statistics, monthlyApplications, applicationsByStatus, applicationsPerJob, jobs, hiringMetrics }) {
    const allJobs = Array.isArray(jobs) ? jobs : [];

    const [page, setPage] = useState(1);

    const {
        pageJobs,
        links,
        prevLink,
        nextLink,
        totalPages,
        from,
        to,
        total,
    } = useMemo(() => {
        const totalPages = Math.max(1, Math.ceil(allJobs.length / PER_PAGE));
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * PER_PAGE;
        const pageJobs = allJobs.slice(start, start + PER_PAGE);
        const links = Array.from({ length: totalPages }, (_, i) => ({
            url: '#',
            label: `${i + 1}`,
            active: i + 1 === safePage,
            page: i + 1,
        }));
        const prevLink = safePage > 1
            ? { url: '#', label: 'Previous', active: false, page: safePage - 1 }
            : { url: null, label: 'Previous', active: false, page: 1 };
        const nextLink = safePage < totalPages
            ? { url: '#', label: 'Next', active: false, page: safePage + 1 }
            : { url: null, label: 'Next', active: false, page: totalPages };
        return {
            pageJobs,
            links,
            prevLink,
            nextLink,
            totalPages,
            from: allJobs.length === 0 ? 0 : start + 1,
            to: Math.min(start + PER_PAGE, allJobs.length),
            total: allJobs.length,
        };
    }, [allJobs, page]);

    const handlePageChange = (link) => {
        if (link?.url && typeof link.page === 'number') setPage(link.page);
    };

    const allStatuses = applicationsByStatus ?? [];
    const statusTotal = statistics?.total_applications ?? allStatuses.reduce((sum, s) => sum + (s?.value ?? 0), 0);
    const statusChartData = allStatuses.filter((s) => (s?.value ?? 0) > 0);

    return (
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Reports</h2>}>
            <Head title="Reports" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                        <p className="text-slate-500 text-sm mt-1">Agency performance and analytics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = route('agency.reports.pdf')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all text-sm">
                            <Download className="h-4 w-4" /> Download PDF
                        </button>
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm text-sm">
                            <BarChart3 className="h-4 w-4" /> Print Report
                        </button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Jobs', value: statistics.active_jobs ?? 0, icon: Briefcase, color: 'from-blue-600 to-blue-400' },
                        { label: 'Total Applications', value: statistics.total_applications ?? 0, icon: Users, color: 'from-indigo-600 to-indigo-400' },
                        { label: 'Hired', value: statistics.hired ?? 0, icon: CheckCircle, color: 'from-emerald-600 to-emerald-400' },
                        { label: 'Rejected', value: statistics.rejected ?? 0, icon: XCircle, color: 'from-red-500 to-red-400' },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{stat.value}</p>
                                <p className="mt-1 text-xs font-medium text-gray-500">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Applications by Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50">
                        <h2 className="text-base font-bold text-gray-900 mb-4">Applications by Status</h2>
                        <div className="relative h-56">
                            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusChartData.length > 0 ? statusChartData : [{ name: 'No Data', value: 1 }]}
                                        cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={3} dataKey="value"
                                        label={({ name, percent }) => (statusChartData.length > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : '')}
                                        labelLine={false}
                                    >
                                        {statusChartData.length > 0 ? (
                                            statusChartData.map((item, i) => (
                                                <Cell key={i} fill={item.color || '#e2e8f0'} />
                                            ))
                                        ) : (
                                            <Cell fill="#e2e8f0" />
                                        )}
                                    </Pie>
                                    <Tooltip content={(props) => <StatusTooltip {...props} total={statusTotal} />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                <p className="text-2xl font-bold tracking-tight text-gray-900">{statusTotal}</p>
                                <p className="text-xs font-medium text-slate-500">Total Applications</p>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {allStatuses.map((item) => {
                                const pct = statusTotal > 0 ? Math.round((item.value / statusTotal) * 100) : 0;
                                return (
                                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs font-medium text-slate-600">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-900">{item.value} ({pct}%)</span>
                                    </div>
                                );
                            })}
                            {allStatuses.length === 0 && (
                                <div className="sm:col-span-2 text-center text-sm text-slate-500 py-4">No application data available</div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50">
                        <h2 className="text-base font-bold text-gray-900 mb-4">Hiring Metrics</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-600">Success Rate</span>
                                <span className="text-lg font-bold text-green-600">{hiringMetrics?.success_rate ?? 0}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-600">Total Hired</span>
                                <span className="text-lg font-bold text-blue-600">{hiringMetrics?.total_hired ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-600">Fill Rate</span>
                                <span className="text-lg font-bold text-indigo-600">{statistics.fill_rate ?? 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Performance Table */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-bold text-gray-900">Job Vacancy Performance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">Job Title</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">Applicants</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">Interviewed</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">Hired</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">Rejected</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pageJobs.length === 0 ? (
                                    <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">No job data available</td></tr>
                                ) : (
                                    pageJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-blue-50/50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-800">{job.title}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{job.employment_type}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{job.applicants}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{job.interviewed}</td>
                                            <td className="px-6 py-4 text-sm text-green-600 font-medium">{job.hired}</td>
                                            <td className="px-6 py-4 text-sm text-red-600 font-medium">{job.rejected}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    job.status === 'Open' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    job.status === 'Hiring' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>{job.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        links={links}
                        prevLink={prevLink}
                        nextLink={nextLink}
                        lastPage={totalPages}
                        from={from}
                        to={to}
                        total={total}
                        label="jobs"
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Monthly Applications */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Monthly Applications ({new Date().getFullYear()})</h2>
                    <div className="grid grid-cols-12 gap-2 items-end h-48">
                        {monthlyApplications?.map((item) => {
                            const maxCount = Math.max(...monthlyApplications.map(m => m.count), 1);
                            const height = (item.count / maxCount) * 100;
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return (
                                <div key={item.month} className="flex flex-col items-center gap-1">
                                    <span className="text-xs text-slate-500">{item.count}</span>
                                    <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all" style={{ height: `${Math.max(height, 4)}%` }} />
                                    <span className="text-[10px] text-slate-400">{monthNames[item.month - 1]}</span>
                                </div>
                            );
                        })}
                        {(!monthlyApplications || monthlyApplications.length === 0) && (
                            <div className="col-span-12 text-center text-slate-500 py-8">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </AgencyLayouts>
    );
}