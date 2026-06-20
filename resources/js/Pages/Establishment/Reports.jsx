import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage } from '@inertiajs/react';
import {
    BarChart3,
    FileText,
    Download,
    Printer,
    Users,
    Briefcase,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    PieChart as PieChartIcon,
    Building2,
    ExternalLink
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
    const { establishment, statistics, monthlyApplications, jobs } = usePage().props;

    const chartData = monthlyApplications?.length > 0
        ? [...monthlyApplications].reverse().map(item => ({
            month: item.month,
            applications: item.count
        }))
        : [];

    const hiringDistribution = [
        { name: 'Open', value: jobs?.filter(j => j.hiring_status === 'Open').length || 0, color: '#10b981' },
        { name: 'Hiring', value: jobs?.filter(j => j.hiring_status === 'Hiring').length || 0, color: '#3b82f6' },
        { name: 'Closed', value: jobs?.filter(j => j.hiring_status === 'Closed').length || 0, color: '#ef4444' },
        { name: 'Filled', value: jobs?.filter(j => j.hiring_status === 'Filled').length || 0, color: '#8b5cf6' },
    ].filter(d => d.value > 0);

    const activeHiring = jobs?.filter(j => j.hiring_status === 'Hiring' || j.hiring_status === 'Open').length || 0;

    return (
        <EstablishmentLayouts>
            <Head title="Reports" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
                        <p className="text-slate-500 mt-1">View hiring analytics and job performance reports</p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={route('establishment.reports.export.pdf')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
                        </a>
                        <a
                            href={route('establishment.reports.export.excel')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            <FileText className="h-4 w-4" />
                            Export CSV
                        </a>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Total Applications</p>
                                <p className="text-3xl font-bold text-slate-800">{statistics?.total_applications || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Briefcase className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Active Jobs</p>
                                <p className="text-3xl font-bold text-slate-800">{statistics?.total_jobs || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Hired</p>
                                <p className="text-3xl font-bold text-slate-800">{statistics?.hired || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-3 rounded-lg">
                                <Building2 className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Active Hiring</p>
                                <p className="text-3xl font-bold text-slate-800">{activeHiring}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Applications Chart */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Monthly Applications
                        </h2>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-400">
                                <p>No application data available</p>
                            </div>
                        )}
                    </div>

                    {/* Hiring Status Distribution */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-purple-600" />
                            Hiring Status Distribution
                        </h2>
                        {hiringDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={hiringDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {hiringDistribution.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-400">
                                <p>No jobs posted yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Performance Table */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <h2 className="text-lg font-bold text-slate-800 p-6 pb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        Job Performance
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Applicants</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Posted Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {jobs?.length > 0 ? (
                                    jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium text-slate-800">{job.job_title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {job.employment_type?.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                    {job.applications_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    job.hiring_status === 'Open' ? 'bg-green-100 text-green-700' :
                                                    job.hiring_status === 'Hiring' ? 'bg-blue-100 text-blue-700' :
                                                    job.hiring_status === 'Closed' ? 'bg-red-100 text-red-700' :
                                                    job.hiring_status === 'Filled' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {job.hiring_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No jobs posted yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
