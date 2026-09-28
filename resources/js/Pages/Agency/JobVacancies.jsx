import { Head, useForm, router } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import { useState } from 'react';
import { Plus, Search, Briefcase, X, Send, CheckCircle2 } from 'lucide-react';
import JobApplicationWizard from '@/Components/Agency/JobApplicationWizard';
import Pagination from '@/Components/Agency/Pagination';

export default function JobVacancies({ jobs, skills, barangays, members = [], appliedJobIds }) {
    const [showCreate, setShowCreate] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedIds, setAppliedIds] = useState(appliedJobIds ?? []);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        job_title: '', description: '', salary_range: '', employment_type: '',
        barangay_id: '', skills: [], educational_background: '', work_arrangement: '',
        vacant_positions: '', hiring_status: 'Open', salary_type: '', min_salary: '',
        max_salary: '', application_deadline: '',
    });

    const filteredJobs = jobs?.data?.filter((job) => {
        const matchesSearch = !search || job.job_title?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || job.hiring_status === statusFilter;
        return matchesSearch && matchesStatus;
    }) ?? [];

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('agency.jobs.store'), {
            onSuccess: () => { setShowCreate(false); reset(); },
        });
    };

    const openApply = (job) => {
        setSelectedJob(job);
        setShowWizard(true);
    };

    const handleApplied = (jobId) => {
        setAppliedIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
    };

    const isJobActive = (job) => {
        if (!['Open', 'Hiring'].includes(job.hiring_status)) return false;
        if (job.application_deadline) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(job.application_deadline) < today) return false;
        }
        return true;
    };

    const statusBadge = (status) => {
        const colors = {
            Open: 'bg-green-100 text-green-700 border-green-200',
            Hiring: 'bg-blue-100 text-blue-700 border-blue-200',
            Closed: 'bg-slate-100 text-slate-600 border-slate-200',
            Filled: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return colors[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

    return (
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Job Vacancies</h2>}>
            <Head title="Job Vacancies" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Job Vacancies</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your job postings</p>
                    </div>
                    <button onClick={() => { setShowCreate(true); reset(); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm">
                        <Plus className="h-4 w-4" /> Post Job Vacancy
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className={`${inputClass} pl-10`} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
                        <option value="">All Status</option>
                        <option value="Open">Open</option>
                        <option value="Hiring">Hiring</option>
                        <option value="Closed">Closed</option>
                        <option value="Filled">Filled</option>
                    </select>
                </div>

                {/* Jobs Table */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Position</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Vacancies</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Salary</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Applicants</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Posted</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredJobs.length === 0 ? (
                                    <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-500">No job vacancies found</td></tr>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                                                        <Briefcase className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{job.job_title}</p>
                                                        <p className="text-xs text-slate-500">{job.educational_background || 'Any education'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{job.employment_type}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{job.vacant_positions ?? '—'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{job.salary_range || 'Negotiable'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(job.hiring_status)}`}>
                                                    {job.hiring_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{job.applications_count ?? 0}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{job.created_at}</td>
                                            <td className="px-6 py-4 text-right">
                                                {appliedIds.includes(job.id) ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Applied
                                                    </span>
                                                ) : isJobActive(job) ? (
                                                    <button onClick={() => openApply(job)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm">
                                                        <Send className="h-3.5 w-3.5" /> Apply
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                        Application Not Available
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        links={jobs?.links ?? []}
                        prevLink={jobs?.links?.[0]}
                        nextLink={jobs?.links?.[jobs?.links?.length - 1]}
                        lastPage={jobs?.last_page}
                        from={jobs?.from}
                        to={jobs?.to}
                        total={jobs?.total}
                        label="jobs"
                        onPageChange={(link) => { if (link?.url) router.get(link.url); }}
                    />
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Post Job Vacancy</h2>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={submitCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                                    <input type="text" value={data.job_title} onChange={(e) => setData('job_title', e.target.value)} className={inputClass} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type *</label>
                                    <select value={data.employment_type} onChange={(e) => setData('employment_type', e.target.value)} className={inputClass} required>
                                        <option value="">Select type</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Temporary">Temporary</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vacant Positions</label>
                                    <input type="number" value={data.vacant_positions} onChange={(e) => setData('vacant_positions', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
                                    <input type="text" value={data.salary_range} onChange={(e) => setData('salary_range', e.target.value)} className={inputClass} placeholder="e.g. 15000-20000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hiring Status</label>
                                    <select value={data.hiring_status} onChange={(e) => setData('hiring_status', e.target.value)} className={inputClass}>
                                        <option value="Open">Open</option>
                                        <option value="Hiring">Hiring</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Barangay</label>
                                    <select value={data.barangay_id} onChange={(e) => setData('barangay_id', e.target.value)} className={inputClass}>
                                        <option value="">Select barangay</option>
                                        {barangays?.map((b) => <option key={b.id} value={b.id}>{b.barangay_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
                                    <input type="date" value={data.application_deadline} onChange={(e) => setData('application_deadline', e.target.value)} className={inputClass} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                <button type="submit" disabled={processing} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
                                    {processing ? 'Saving...' : 'Post Job'}
                                </button>
                                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-300 transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Job Application Wizard */}
            {showWizard && selectedJob && (
                <JobApplicationWizard
                    job={selectedJob}
                    members={members}
                    onClose={() => setShowWizard(false)}
                    onSuccess={handleApplied}
                />
            )}
        </AgencyLayouts>
    );
}