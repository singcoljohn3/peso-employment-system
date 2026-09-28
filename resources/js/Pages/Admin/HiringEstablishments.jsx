import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head } from '@inertiajs/react';
import {
    Building2, Briefcase, ChevronDown, MapPin, Users, GraduationCap,
    Eye, FileText, CalendarCheck, Clock, AlertCircle, XCircle, Loader2,
    Download, Calendar, Search, UserCheck, MoreHorizontal,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const EMPLOYMENT_BADGE = {
    'Full-time': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Part-time': 'bg-purple-100 text-purple-700 border border-purple-200',
    'Contract': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Temporary': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Seasonal': 'bg-teal-100 text-teal-700 border border-teal-200',
    'Probationary': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

const HIRING_BADGE = {
    Open: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Hiring: 'bg-blue-100 text-blue-700 border border-blue-200',
    Closed: 'bg-orange-100 text-orange-700 border border-orange-200',
    Filled: 'bg-violet-100 text-violet-700 border border-violet-200',
};

const HIRING_DOT = {
    Open: 'bg-emerald-500',
    Hiring: 'bg-blue-500',
    Closed: 'bg-orange-500',
    Filled: 'bg-violet-500',
};

const STATUS_BADGE = {
    pending: 'bg-amber-100 text-amber-700',
    reviewed: 'bg-purple-100 text-purple-700',
    interview: 'bg-blue-100 text-blue-700',
    interview_scheduled: 'bg-blue-100 text-blue-700',
    approved: 'bg-emerald-100 text-emerald-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABEL = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    interview: 'Interview',
    interview_scheduled: 'Interview Scheduled',
    approved: 'Approved',
    hired: 'Hired',
    rejected: 'Rejected',
};

function fmtDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
}

function fmtTime(t) {
    if (!t) return '';
    try {
        const [h, m] = t.split(':');
        const hr = parseInt(h, 10);
        return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
    } catch { return t; }
}

function getAppStatus(app) {
    return app.applicationStatus?.hiringStatus?.status_name || app.status || 'pending';
}

function ApplicantRow({ app, onView, onResume, onInterview }) {
    const s = app.job_seeker || {};
    const status = getAppStatus(app);
    const ini = (s.first_name?.[0] ?? '') + (s.last_name?.[0] ?? '');
    return (
        <div className="px-4 py-3 flex items-center gap-3 hover:bg-white/60 transition-colors">
            <div className="shrink-0">
                {s.photo_url ? (
                    <img src={s.photo_url} alt="" className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">{ini}</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">{s.first_name} {s.last_name}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{fmtDate(app.applied_at || app.created_at)}</span>
                    {s.barangay?.barangay_name && (
                        <><span className="text-slate-300">|</span><span>{s.barangay.barangay_name}</span></>
                    )}
                </div>
            </div>
            <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-semibold ${STATUS_BADGE[status] || 'bg-slate-100 text-slate-700'}`}>
                {STATUS_LABEL[status] || status || 'Pending'}
            </span>
            <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); onView(app); }} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="View Applicant">
                    <Eye className="h-4 w-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onResume(app); }} className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors" title="View Resume">
                    <FileText className="h-4 w-4" />
                </button>
                {app.interview && (
                    <button onClick={(e) => { e.stopPropagation(); onInterview(app); }} className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors" title="View Interview">
                        <CalendarCheck className="h-4 w-4" />
                    </button>
                )}
                <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="More Options">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function JobCard({ job, onViewApplicant, onResume, onInterview }) {
    const apps = job.applications || [];
    return (
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-slate-900 mb-1">{job.job_title}</h5>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold ${EMPLOYMENT_BADGE[job.employment_type] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                {job.employment_type}
                            </span>
                            {job.work_arrangement && (
                                <span className="inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                    {job.work_arrangement}
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${HIRING_BADGE[job.hiring_status] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${HIRING_DOT[job.hiring_status] || 'bg-slate-400'}`} />
                                {job.hiring_status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Education</p>
                        <p className="text-slate-700 font-medium">{job.educational_background || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Slots</p>
                        <p className="text-slate-700 font-medium">{job.vacant_positions || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Applicants</p>
                        <p className="text-slate-700 font-medium">{apps.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Posted</p>
                        <p className="text-slate-700 font-medium">{fmtDate(job.created_at)}</p>
                    </div>
                </div>
            </div>

            {apps.length > 0 ? (
                <div className="border-t border-slate-200">
                    <div className="px-4 py-2.5 bg-white text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        Applicants ({apps.length})
                    </div>
                    <div className="divide-y divide-slate-100">
                        {apps.map((app) => (
                            <ApplicantRow key={app.id} app={app} onView={onViewApplicant} onResume={onResume} onInterview={onInterview} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="px-4 py-5 text-center border-t border-slate-200">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No applicants yet</p>
                </div>
            )}
        </div>
    );
}

function EstablishmentCard({ est, isExpanded, onToggle, onViewApplicant, onResume, onInterview }) {
    const openJobs = est.jobs?.filter((j) => j.hiring_status === 'Open' || j.hiring_status === 'Hiring').length || 0;
    const totalApps = est.jobs?.reduce((sum, j) => sum + (j.applications?.length || 0), 0) || 0;

    return (
        <div className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-blue-200 shadow-lg shadow-blue-500/5' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="flex items-center gap-4 p-5 cursor-pointer select-none" onClick={onToggle}>
                <div className="shrink-0">
                    {est.logo ? (
                        <img src={`/storage/${est.logo}`} alt={est.company_name} className="h-14 w-14 rounded-xl object-cover border border-slate-200" />
                    ) : (
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-slate-900 truncate">{est.company_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${est.user_id ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${est.user_id ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {est.user_id ? 'Active' : 'Pending'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" />{est.contact_person || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{est.barangay?.barangay_name || 'N/A'}</span>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                    <div className="text-center">
                        <div className="flex items-center gap-1.5 text-blue-600 mb-0.5"><Briefcase className="h-4 w-4" /><span className="text-lg font-bold">{openJobs}</span></div>
                        <p className="text-[11px] text-slate-500 font-medium">Open Jobs</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5"><Users className="h-4 w-4" /><span className="text-lg font-bold">{totalApps}</span></div>
                        <p className="text-[11px] text-slate-500 font-medium">Applicants</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>

            <div className="sm:hidden px-5 pb-4 flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-sm text-blue-600"><Briefcase className="h-4 w-4" /><span className="font-bold">{openJobs}</span><span className="text-slate-500">Open Jobs</span></div>
                <div className="flex items-center gap-1.5 text-sm text-emerald-600"><Users className="h-4 w-4" /><span className="font-bold">{totalApps}</span><span className="text-slate-500">Applicants</span></div>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <h4 className="text-sm font-semibold text-slate-700">Job Vacancies</h4>
                        <span className="text-xs text-slate-400">({est.jobs?.length || 0})</span>
                    </div>
                    {est.jobs?.length > 0 ? (
                        <div className="space-y-3">
                            {est.jobs.map((job) => (
                                <JobCard key={job.id} job={job} onViewApplicant={onViewApplicant} onResume={onResume} onInterview={onInterview} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No job vacancies found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ApplicantModal({ app, onClose }) {
    if (!app) return null;
    const s = app.job_seeker || {};
    const ini = (s.first_name?.[0] ?? '') + (s.last_name?.[0] ?? '');
    const status = getAppStatus(app);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-slate-500" /><h3 className="font-semibold text-slate-900">Applicant Details</h3></div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><XCircle className="h-5 w-5 text-slate-400" /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="shrink-0">
                                {s.photo_url ? (
                                    <img src={s.photo_url} alt="" className="h-16 w-16 rounded-2xl object-cover border-2 border-blue-200" />
                                ) : (
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">{ini}</div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{s.first_name} {s.last_name}</h4>
                                <p className="text-sm text-slate-500">{app.job?.job_title}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><p className="text-[11px] text-slate-500 uppercase tracking-wider">Email</p><p className="font-medium text-slate-800">{s.email || s.user?.email || 'Not Provided'}</p></div>
                            <div><p className="text-[11px] text-slate-500 uppercase tracking-wider">Contact</p><p className="font-medium text-slate-800">{s.contact_number || 'Not Provided'}</p></div>
                            <div><p className="text-[11px] text-slate-500 uppercase tracking-wider">Barangay</p><p className="font-medium text-slate-800">{s.barangay?.barangay_name || 'Not Provided'}</p></div>
                            <div><p className="text-[11px] text-slate-500 uppercase tracking-wider">Date Applied</p><p className="font-medium text-slate-800">{fmtDate(app.applied_at || app.created_at)}</p></div>
                            <div><p className="text-[11px] text-slate-500 uppercase tracking-wider">Status</p><span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[status] || 'bg-slate-100 text-slate-700'}`}>{STATUS_LABEL[status] || status || 'Pending'}</span></div>
                            <div><p className="text-[11px] text-slate-500 uppercase tracking-wider">Expected Salary</p><p className="font-medium text-slate-800">{app.expected_salary || 'Not Provided'}</p></div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
                    <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
}

function ResumeModal({ app, onClose }) {
    const [html, setHtml] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tmpl, setTmpl] = useState(null);

    useEffect(() => {
        (async () => {
            const sid = app.job_seeker_id || app.job_seeker?.id;
            const t = app.job_seeker?.resume?.template || app.job_seeker?.preferred_template || 'modern-professional';
            if (!sid) { setError('No job seeker data available'); setLoading(false); return; }
            try {
                const r = await fetch(`/admin/resumes/preview?job_seeker_id=${sid}&template=${t}`);
                const d = await r.json();
                if (d.html) { setHtml(d.html); setTmpl(d.template || null); }
                else setError(d.error || 'Failed to load resume preview');
            } catch { setError('Failed to load resume preview'); }
            finally { setLoading(false); }
        })();
    }, [app]);

    const resumeUrl = app.resume_url || (app.job_seeker?.resume?.file_path ? '/storage/' + app.job_seeker.resume.file_path : null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <h3 className="font-semibold text-slate-900">Resume Preview</h3>
                        <span className="text-sm text-slate-500">— {app.job_seeker?.first_name} {app.job_seeker?.last_name}</span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><XCircle className="h-5 w-5 text-slate-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                    {loading && <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}
                    {error && <div className="flex items-center justify-center py-20 text-red-600"><AlertCircle className="h-5 w-5 mr-2" /> {error}</div>}
                    {html && (
                        <div className="bg-white shadow-sm mx-auto rounded-lg overflow-hidden" style={{ maxWidth: '210mm' }}>
                            <iframe srcDoc={html} className="w-full border-0" style={{ minHeight: '297mm', height: 'auto' }} title="Resume Preview" />
                        </div>
                    )}
                    {!loading && !error && !html && !resumeUrl && (
                        <div className="flex flex-col items-center justify-center h-[300px] rounded-xl border border-dashed border-slate-300 bg-white">
                            <FileText className="h-16 w-16 text-slate-300 mb-4" />
                            <p className="text-sm text-slate-500 font-medium">No resume available for preview.</p>
                            <p className="text-xs text-slate-400 mt-1">This applicant has not uploaded a resume.</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                    {tmpl ? <span className="text-sm text-slate-500 capitalize">Template: {tmpl.replace(/-/g, ' ')}</span> : <span />}
                    <div className="flex gap-2">
                        <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Close</button>
                        {resumeUrl && (
                            <a href={resumeUrl} download className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                                <Download className="h-4 w-4" /> Download PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InterviewModal({ app, onClose }) {
    if (!app?.interview) return null;
    const iv = app.interview;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-indigo-500" /><h3 className="font-semibold text-slate-900">Interview Schedule</h3></div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><XCircle className="h-5 w-5 text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {app.job_seeker?.first_name?.[0]}{app.job_seeker?.last_name?.[0]}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">{app.job_seeker?.first_name} {app.job_seeker?.last_name}</p>
                            <p className="text-sm text-slate-500">{app.job?.job_title}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center"><Calendar className="h-5 w-5 text-blue-600" /></div>
                            <div><p className="text-[11px] text-slate-500 uppercase">Date</p><p className="font-semibold text-slate-800">{fmtDate(iv.scheduled_date)}</p></div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Clock className="h-5 w-5 text-emerald-600" /></div>
                            <div><p className="text-[11px] text-slate-500 uppercase">Time</p><p className="font-semibold text-slate-800">{fmtTime(iv.scheduled_time)}</p></div>
                        </div>
                    </div>
                    {iv.location && (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center"><MapPin className="h-5 w-5 text-orange-600" /></div>
                            <div><p className="text-[11px] text-slate-500 uppercase">Location</p><p className="font-semibold text-slate-800">{iv.location}</p></div>
                        </div>
                    )}
                    {iv.meeting_link && (
                        <div className="text-sm">
                            <p className="text-[11px] text-slate-500 uppercase mb-1">Meeting Link</p>
                            <a href={iv.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:text-blue-800 break-all">{iv.meeting_link}</a>
                        </div>
                    )}
                    {iv.notes && (
                        <div className="text-sm">
                            <p className="text-[11px] text-slate-500 uppercase mb-1">Notes</p>
                            <p className="text-slate-700 bg-slate-50 rounded-xl p-3">{iv.notes}</p>
                        </div>
                    )}
                </div>
                <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
                    <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
}

export default function HiringEstablishments({ establishments, statistics, barangays }) {
    const estabList = establishments?.data || [];
    const pagination = establishments;
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [resumeApp, setResumeApp] = useState(null);
    const [interviewApp, setInterviewApp] = useState(null);

    const filtered = estabList.filter((est) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            est.company_name?.toLowerCase().includes(q) ||
            est.contact_person?.toLowerCase().includes(q) ||
            est.barangay?.barangay_name?.toLowerCase().includes(q) ||
            est.jobs?.some((j) => j.job_title?.toLowerCase().includes(q))
        );
    });

    return (
        <AdminLayouts>
            <Head title="Hiring Establishments" />
            <div className="p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hiring Establishments</h1>
                        <p className="text-slate-500 mt-1">Browse establishments currently hiring and manage job vacancies</p>
                    </div>

                    <div className="mb-6">
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search establishments, company names, or job vacancies..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="space-y-4">
                            {filtered.map((est) => (
                                <EstablishmentCard
                                    key={est.id}
                                    est={est}
                                    isExpanded={expandedId === est.id}
                                    onToggle={() => setExpandedId(expandedId === est.id ? null : est.id)}
                                    onViewApplicant={setSelectedApp}
                                    onResume={setResumeApp}
                                    onInterview={setInterviewApp}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="bg-slate-100 p-5 rounded-2xl mb-4"><Building2 className="h-12 w-12 text-slate-400" /></div>
                            <p className="text-slate-700 font-semibold mb-1">No hiring establishments found</p>
                            <p className="text-sm text-slate-500">{searchTerm ? 'Try adjusting your search terms' : 'No establishments are currently hiring'}</p>
                        </div>
                    )}

                    {pagination?.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                <a
                                    key={page}
                                    href={pagination.path + '?page=' + page}
                                    className={`h-9 min-w-[36px] flex items-center justify-center rounded-xl text-sm font-medium transition-all ${page === pagination.current_page ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {page}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedApp && <ApplicantModal app={selectedApp} onClose={() => setSelectedApp(null)} />}
            {resumeApp && <ResumeModal app={resumeApp} onClose={() => setResumeApp(null)} />}
            {interviewApp && <InterviewModal app={interviewApp} onClose={() => setInterviewApp(null)} />}
        </AdminLayouts>
    );
}
