import { Head, router } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import { useState } from 'react';
import { Search, Users, Eye, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Applicants({ applications, agency, statistics, jobs }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [viewApplicant, setViewApplicant] = useState(null);
    const [resumeHtml, setResumeHtml] = useState(null);

    const filteredApps = applications?.data?.filter((app) => {
        const name = app.seeker_profile?.full_name ?? '';
        const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || app.job?.job_title?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || (app.applicationStatus?.hiringStatus?.status_name ?? app.status) === statusFilter;
        const matchesJob = !jobFilter || app.job_id == jobFilter;
        return matchesSearch && matchesStatus && matchesJob;
    }) ?? [];

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        'for review': 'bg-blue-100 text-blue-700 border-blue-200',
        'for interview': 'bg-purple-100 text-purple-700 border-purple-200',
        interview: 'bg-purple-100 text-purple-700 border-purple-200',
        interviewed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        hired: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
    };

    const viewResume = async (applicationId) => {
        try {
            const response = await fetch(route('agency.applicants.resume-preview', applicationId));
            const data = await response.json();
            if (data.html) setResumeHtml(data.html);
        } catch (err) {
            console.error('Failed to load resume:', err);
        }
    };

    const updateStatus = async (applicationId, status) => {
        if (!confirm(`Change status to "${status}"?`)) return;
        router.patch(route('agency.applicants.update', applicationId), { status }, { preserveScroll: true });
    };

    const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
    const selectClass = "px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

    return (
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Applicants</h2>}>
            <Head title="Applicants" />

            <div className="space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage job applications</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Total', value: statistics.total ?? 0, color: 'text-slate-900' },
                        { label: 'Pending', value: statistics.pending ?? 0, color: 'text-amber-600' },
                        { label: 'Reviewed', value: statistics.reviewed ?? 0, color: 'text-blue-600' },
                        { label: 'Interview', value: statistics.interview_scheduled ?? 0, color: 'text-purple-600' },
                        { label: 'Hired', value: statistics.hired ?? 0, color: 'text-green-600' },
                        { label: 'Rejected', value: statistics.rejected ?? 0, color: 'text-red-600' },
                    ].map((s) => (
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
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or position..." className={inputClass} />
                    </div>
                    <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className={selectClass}>
                        <option value="">All Jobs</option>
                        {jobs?.map((j) => <option key={j.id} value={j.id}>{j.job_title}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="for review">For Review</option>
                        <option value="interview">Interview</option>
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
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredApps.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No applicants found</td></tr>
                                ) : (
                                    filteredApps.map((app) => {
                                        const status = app.applicationStatus?.hiringStatus?.status_name ?? app.status ?? 'pending';
                                        return (
                                            <tr key={app.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                            {app.seeker_profile?.full_name?.charAt(0) ?? '?'}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-800">{app.seeker_profile?.full_name ?? 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{app.job?.job_title ?? '—'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{app.seeker_profile?.contact_number ?? '—'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{app.created_at}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => setViewApplicant(app)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Details"><Eye className="h-4 w-4" /></button>
                                                        <button onClick={() => viewResume(app.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Resume"><FileText className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {applications?.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-sm text-slate-500">Page {applications.current_page} of {applications.last_page}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => router.get(applications.prev_page_url)} disabled={!applications.prev_page_url} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                                <button onClick={() => router.get(applications.next_page_url)} disabled={!applications.next_page_url} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Applicant Detail Modal */}
            {viewApplicant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Applicant Details</h2>
                            <button onClick={() => setViewApplicant(null)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                {viewApplicant.seeker_profile?.photo_url ? (
                                    <img src={`/storage/${viewApplicant.seeker_profile.photo_url}`} alt="Profile" className="h-16 w-16 rounded-full object-cover shadow-sm border-2 border-white" />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-sm border-2 border-white">
                                        {viewApplicant.seeker_profile?.full_name?.charAt(0) ?? '?'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{viewApplicant.seeker_profile?.full_name ?? 'Unknown'}</h3>
                                    <p className="text-sm text-slate-500">{viewApplicant.job?.job_title ?? '—'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-slate-500">Email</p><p className="text-sm text-slate-800">{viewApplicant.seeker_profile?.email ?? '—'}</p></div>
                                <div><p className="text-xs text-slate-500">Contact</p><p className="text-sm text-slate-800">{viewApplicant.seeker_profile?.contact_number ?? '—'}</p></div>
                                <div><p className="text-xs text-slate-500">Applied Date</p><p className="text-sm text-slate-800">{viewApplicant.applied_at ?? viewApplicant.created_at}</p></div>
                                <div><p className="text-xs text-slate-500">Status</p><p className="text-sm text-slate-800 capitalize">{viewApplicant.applicationStatus?.hiringStatus?.status_name ?? viewApplicant.status ?? 'pending'}</p></div>
                            </div>
                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500 mb-2">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {['pending', 'for review', 'for interview', 'interviewed', 'hired', 'rejected'].map((s) => (
                                        <button key={s} onClick={() => { updateStatus(viewApplicant.id, s); setViewApplicant(null); }}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all capitalize">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resume Preview Modal */}
            {resumeHtml && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-semibold text-slate-900">Resume Preview</h2>
                            <button onClick={() => setResumeHtml(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6" dangerouslySetInnerHTML={{ __html: resumeHtml }} />
                    </div>
                </div>
            )}
        </AgencyLayouts>
    );
}