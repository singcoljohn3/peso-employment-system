import { useState } from 'react';
import {
    Briefcase, User, ClipboardList, Send, CheckCircle2, X,
    MapPin, Banknote, Calendar, Clock, GraduationCap, Award, FileText, Info,
    Search, ChevronDown, UserCheck
} from 'lucide-react';

const STEPS = [
    { key: 'details', label: 'Job Details', icon: Briefcase },
    { key: 'applicant', label: 'Applicant Info', icon: User },
    { key: 'review', label: 'Review', icon: ClipboardList },
    { key: 'submit', label: 'Submit', icon: Send },
    { key: 'done', label: 'Done', icon: CheckCircle2 },
];

function DetailRow({ label, value }) {
    const isEmpty = value === null || value === undefined || value === '';
    return (
        <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-slate-800 mt-0.5 break-words whitespace-pre-line">{isEmpty ? '—' : value}</p>
            </div>
        </div>
    );
}

export default function JobApplicationWizard({ job, applicantProfile, members = [], onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [memberId, setMemberId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [listOpen, setListOpen] = useState(false);

    const useMemberSelection = Array.isArray(members);
    const selectedMember = members.find((m) => String(m.id) === String(memberId)) ?? null;
    const profile = useMemberSelection ? selectedMember : applicantProfile;
    const hasProfile = Boolean(profile?.id);

    const filteredMembers = members.filter((m) => {
        const q = (searchTerm || '').trim().toLowerCase();
        if (!q) return true;
        return [m.full_name, m.email, m.contact_number]
            .some((v) => (v || '').toLowerCase().includes(q));
    });

    const salaryDisplay =
        job?.salary_range ||
        (job?.min_salary && job?.max_salary ? `₱${job.min_salary} - ₱${job.max_salary}` : null) ||
        (job?.min_salary ? `₱${job.min_salary}` : null) ||
        (job?.max_salary ? `₱${job.max_salary}` : null) ||
        (job?.salary_negotiable ? 'Negotiable' : null) ||
        'Negotiable';

    const computeAge = (birthdate) => {
        if (!birthdate) return null;
        const dob = new Date(birthdate);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
        return Number.isFinite(age) && age >= 0 ? age : null;
    };

    const renderField = (field) => (
        <div key={field.label}>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{field.label}</p>
            <p className="text-sm text-slate-800 mt-0.5">{field.value || '—'}</p>
        </div>
    );

    const getProfileFields = () => [
        { label: 'Full Name', value: profile?.full_name },
        { label: 'Email', value: profile?.email },
        { label: 'Contact Number', value: profile?.contact_number },
        { label: 'Gender', value: profile?.sex },
        { label: 'Age', value: profile?.birthdate ? computeAge(profile.birthdate) : null },
        { label: 'Barangay', value: profile?.barangay?.barangay_name },
        { label: 'Address', value: profile?.address },
        { label: 'Educational Attainment', value: profile?.educational_background || profile?.educational_attainment },
        { label: 'Employment Status', value: profile?.employment_status },
        { label: 'Occupation', value: profile?.occupation },
        { label: 'Date of Birth', value: profile?.birthdate },
    ];

    const submitApplication = async () => {
        if (!hasProfile) {
            setError(useMemberSelection
                ? 'Please select a member before submitting the application.'
                : 'Please complete your job seeker/member profile before applying.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(route('agency.jobs.apply', job.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                credentials: 'same-origin',
                body: useMemberSelection ? JSON.stringify({ member_id: memberId }) : '{}',
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Failed to submit application. Please try again.');
                setSubmitting(false);
                return;
            }
            setStep(5);
            if (onSuccess) onSuccess(job.id);
        } catch (err) {
            setError('Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const goToPage = (page) => {
        setError('');
        setStep(page);
    };

    const subPanelClass = "bg-slate-50 border border-slate-200 rounded-xl";
    const chipClass = "px-2.5 py-1 bg-white text-slate-600 text-xs rounded-lg border border-slate-200";
    const inputClass = "w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Apply — {job?.job_title}</h2>
                            <p className="text-xs text-slate-500">Job Application Process</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const stepNumber = i + 1;
                            const isDone = step > stepNumber;
                            const isActive = step === stepNumber;
                            return (
                                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
                                            isDone
                                                ? 'bg-blue-100 border-blue-200 text-blue-600'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-blue-600 to-blue-400 border-transparent text-white shadow-lg shadow-blue-500/30'
                                                    : 'bg-slate-100 border-slate-200 text-slate-400'
                                        }`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : isDone ? 'text-blue-500' : 'text-slate-400'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${step > stepNumber ? 'bg-blue-400' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {/* Step 1 — Review Job Details */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{job?.job_title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{job?.employment_type}{job?.work_arrangement ? ` · ${job.work_arrangement}` : ''}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
                                    <Banknote className="h-4 w-4 text-blue-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Salary</p>
                                        <p className="text-sm text-slate-900">{salaryDisplay}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
                                    <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Location</p>
                                        <p className="text-sm text-slate-900">{job?.job_location || job?.barangay?.barangay_name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
                                    <Award className="h-4 w-4 text-blue-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Vacancies</p>
                                        <p className="text-sm text-slate-900">{job?.vacant_positions ?? '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
                                    <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Application Deadline</p>
                                        <p className="text-sm text-slate-900">{job?.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                                <DetailRow label="Job Description" value={job?.description} />
                                {job?.responsibilities && <DetailRow label="Responsibilities" value={job.responsibilities} />}
                                {job?.qualifications && <DetailRow label="Qualifications" value={job.qualifications} />}
                                {job?.required_education && <DetailRow label="Required Education" value={job.required_education} />}
                                {job?.educational_background && !job.required_education && <DetailRow label="Educational Background" value={job.educational_background} />}
                                {job?.required_experience && <DetailRow label="Required Experience" value={job.required_experience} />}
                                {job?.certifications && <DetailRow label="Certifications" value={job.certifications} />}
                                {job?.preferred_age && <DetailRow label="Preferred Age" value={job.preferred_age} />}
                                {job?.gender_requirement && <DetailRow label="Gender Requirement" value={job.gender_requirement} />}
                                {job?.working_hours && <DetailRow label="Working Hours" value={job.working_hours} />}
                                {job?.benefits && <DetailRow label="Benefits" value={job.benefits} />}
                                {job?.required_documents && <DetailRow label="Required Documents" value={job.required_documents} />}
                                {job?.application_instructions && <DetailRow label="Application Instructions" value={job.application_instructions} />}
                                {job?.skills?.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <GraduationCap className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Required Skills</p>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                {job.skills.map((s, i) => (
                                                    <span key={i} className={chipClass}>
                                                        {s.skill_name ?? s.name ?? s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Applicant Information */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Applicant Information</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {useMemberSelection
                                        ? 'Select a member from your agency list. Their profile details will be filled in automatically.'
                                        : 'Your existing profile details are filled in automatically.'}
                                </p>
                            </div>

                            {useMemberSelection ? (
                                <>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
                                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Select Member</p>
                                        </div>

                                        {members.length === 0 ? (
                                            <div className="bg-amber-100 border border-amber-200 rounded-xl p-5">
                                                <p className="text-sm text-amber-700 font-medium">No members registered.</p>
                                                <p className="text-sm text-amber-600/80 mt-1">Add members to your agency first before applying to a vacancy.</p>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setListOpen(true);
                                                    }}
                                                    onFocus={() => setListOpen(true)}
                                                    placeholder="Search by name, email, or contact..."
                                                    className={inputClass}
                                                />
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

                                                {listOpen && (
                                                    <div className="absolute z-20 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl">
                                                        {filteredMembers.length === 0 ? (
                                                            <p className="px-4 py-3 text-sm text-slate-500">No members match your search.</p>
                                                        ) : (
                                                            filteredMembers.map((m) => {
                                                                const isSelected = String(m.id) === String(memberId);
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={m.id}
                                                                        onClick={() => {
                                                                            setMemberId(m.id);
                                                                            setSearchTerm('');
                                                                            setListOpen(false);
                                                                            setError('');
                                                                        }}
                                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                                                                            isSelected ? 'bg-blue-50/60' : ''
                                                                        }`}
                                                                    >
                                                                        <div className="h-9 w-9 rounded-full shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                                            {m.photo_url ? (
                                                                                <img src={m.photo_url} alt={m.full_name} className="h-full w-full object-cover" />
                                                                            ) : (
                                                                                (m.full_name || '?').charAt(0)
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-medium text-slate-900 truncate">{m.full_name}</p>
                                                                            <p className="text-xs text-slate-500 truncate">
                                                                                {m.email && <span>{m.email}</span>}
                                                                                {m.email && m.contact_number && <span> · </span>}
                                                                                {m.contact_number && <span>{m.contact_number}</span>}
                                                                            </p>
                                                                        </div>
                                                                        {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                                                                    </button>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {selectedMember ? (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                                                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base overflow-hidden">
                                                    {profile?.photo_url ? (
                                                        <img src={profile.photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        (profile?.full_name || '?').charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold text-slate-900">{profile.full_name}</p>
                                                    <p className="text-xs text-slate-500">{profile.email}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {getProfileFields().map(renderField)}
                                            </div>
                                            {profile?.skills?.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.skills.map((s, i) => (
                                                            <span key={i} className={chipClass}>
                                                                {s.skill_name ?? s.name ?? s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-amber-100 border border-amber-200 rounded-xl p-5">
                                            <p className="text-sm text-amber-700 font-medium">No member selected.</p>
                                            <p className="text-sm text-amber-600/80 mt-1">Select a member from the list above to continue.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                !hasProfile ? (
                                    <div className="bg-amber-100 border border-amber-200 rounded-xl p-5">
                                        <p className="text-sm text-amber-700 font-medium">No applicant profile found.</p>
                                        <p className="text-sm text-amber-600/80 mt-1">Please complete your job seeker/member profile before applying to this vacancy.</p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base">
                                                {(profile?.full_name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-slate-900">{profile.full_name}</p>
                                                <p className="text-xs text-slate-500">{profile.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {getProfileFields().map(renderField)}
                                        </div>
                                        {profile?.skills?.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.map((s, i) => (
                                                        <span key={i} className={chipClass}>
                                                            {s.skill_name ?? s.name ?? s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Step 3 — Review Application */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Review Application</h3>
                                <p className="text-sm text-slate-500 mt-1">Review the selected job vacancy and applicant information before submitting.</p>
                            </div>

                            <div className={subPanelClass + " p-5"}>
                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-3">Job Vacancy</p>
                                <div className="space-y-2">
                                    <p className="text-base font-semibold text-slate-900">{job?.job_title}</p>
                                    <p className="text-sm text-slate-600">{job?.employment_type}{job?.work_arrangement ? ` · ${job.work_arrangement}` : ''}</p>
                                    <p className="text-sm text-slate-600">Salary: {salaryDisplay}</p>
                                    <p className="text-sm text-slate-600">Location: {job?.job_location || job?.barangay?.barangay_name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className={subPanelClass + " p-5"}>
                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-3">Applicant</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {getProfileFields().map(renderField)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4 — Submit Application */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Submit Application</h3>
                                <p className="text-sm text-slate-500 mt-1">Confirm the details below and submit your application.</p>
                            </div>

                            <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4">
                                <p className="text-sm text-emerald-700">
                                    {useMemberSelection ? (
                                        <>You are applying for <span className="font-semibold">{job?.job_title}</span> on behalf of <span className="font-semibold">{hasProfile ? profile.full_name : '—'}</span>.
                                            Once submitted, the application will be sent for review.</>
                                    ) : (
                                        <>You are applying for <span className="font-semibold">{job?.job_title}</span> as <span className="font-semibold">{hasProfile ? profile.full_name : '—'}</span>.
                                            Once submitted, the application will be sent to the agency for review.</>
                                    )}
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={submitApplication}
                                disabled={submitting || !hasProfile}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <Send className="h-4 w-4" />
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    )}

                    {/* Step 5 — Application Confirmation */}
                    {step === 5 && (
                        <div className="py-6 text-center">
                            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h3 className="mt-5 text-2xl font-bold text-slate-900">Application submitted successfully.</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Your application for <span className="text-slate-900 font-medium">{job?.job_title}</span> has been submitted.
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-700">Application Status</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-700 text-xs font-semibold">Pending</span>
                            </div>
                            <div className="mt-8">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                {step < 5 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => goToPage(step === 1 ? 1 : step - 1)}
                            disabled={step === 1}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                step === 1
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Back
                        </button>
                        {step < 4 && (
                            <button
                                type="button"
                                onClick={() => goToPage(step + 1)}
                                disabled={step === 2 && !hasProfile}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}