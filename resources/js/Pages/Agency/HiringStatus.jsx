import { Head, router } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import { useState } from 'react';
import { Search, UserCheck, X } from 'lucide-react';

export default function HiringStatus({ applications, agency, statistics, jobs }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');

    const filteredApps = applications?.filter((app) => {
        const matchesSearch = !search || app.applicant_name?.toLowerCase().includes(search.toLowerCase()) || app.job_title?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || app.status === statusFilter;
        const matchesJob = !jobFilter || app.job_id == jobFilter;
        return matchesSearch && matchesStatus && matchesJob;
    }) ?? [];

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        'for interview': 'bg-purple-100 text-purple-700 border-purple-200',
        interviewed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        hired: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
    };

    const updateStatus = async (appId, newStatus) => {
        if (!confirm(`Change status to "${newStatus}"?`)) return;
        router.patch(route('agency.applicants.update', appId), { status: newStatus }, { preserveScroll: true });
    };

    const stats = [
        { label: 'Total', value: statistics.total ?? 0, color: 'text-slate-900' },
        { label: 'Pending', value: statistics.pending ?? 0, color: 'text-amber-600' },
        { label: 'For Interview', value: statistics.for_interview ?? 0, color: 'text-purple-600' },
        { label: 'Interviewed', value: statistics.interviewed ?? 0, color: 'text-indigo-600' },
        { label: 'Hired', value: statistics.hired ?? 0, color: 'text-green-600' },
        { label: 'Rejected', value: statistics.rejected ?? 0, color: 'text-red-600' },
    ];

    const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
    const selectClass = "px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

    return (
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Hiring Status</h2>}>
            <Head title="Hiring Status" />

            <div className="space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Hiring Status</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and update applicant hiring progress</p>
                </div>

                {/* Pipeline Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicant or position..." className={inputClass} />
                    </div>
                    <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className={selectClass}>
                        <option value="">All Positions</option>
                        {jobs?.map((j) => <option key={j.id} value={j.id}>{j.job_title}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="for interview">For Interview</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Applicant</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Position</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Applied</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredApps.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No applications found</td></tr>
                                ) : (
                                    filteredApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {app.applicant_name?.charAt(0) ?? '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{app.applicant_name}</p>
                                                        <p className="text-xs text-slate-500">{app.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{app.job_title}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{app.applied_date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[app.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => updateStatus(app.id, e.target.value)}
                                                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 capitalize outline-none"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="for interview">For Interview</option>
                                                    <option value="interviewed">Interviewed</option>
                                                    <option value="hired">Hired</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AgencyLayouts>
    );
}