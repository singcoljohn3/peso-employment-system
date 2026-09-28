import { Head, useForm, router, usePage } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, UserX, Mail, Phone, MapPin, Briefcase, Clock, X, FileText, Plus, Save, Download, ChevronDown, Pencil, Eye } from 'lucide-react';

const EDUCATION_OPTIONS = [
    'Elementary Graduate',
    'High School Graduate',
    'Senior High School Graduate',
    'College Level',
    'College Graduate',
    'Vocational / TESDA',
    "Master's Degree",
    'Doctorate Degree',
    'Other',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say', 'Other'];

const EMPLOYMENT_OPTIONS = ['Employed', 'Unemployed', 'Self-Employed', 'Underemployed'];

function FormSelect({ label, value, onChange, children, placeholder = 'Select an option', required = false, error }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required ? ' *' : ''}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:bg-slate-50 outline-none"
                >
                    <option value="" className="bg-white text-slate-500">{placeholder}</option>
                    {children}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function Members({ activeMembers, inactiveMembers, statistics, agency, jobs, barangays }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('active');
    const [search, setSearch] = useState('');
    const [viewMember, setViewMember] = useState(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [editingMember, setEditingMember] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setNotice({ type: flash.success ? 'success' : 'error', text: flash.success ?? flash.error });
            const timer = setTimeout(() => setNotice(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        email: '',
        contact_number: '',
        age: '',
        sex: '',
        birthdate: '',
        employment_status: '',
        occupation: '',
        address: '',
        barangay_id: '',
        educational_attainment: '',
        work_experience: '',
        job_id: '',
    });

    const { data: editData, setData: setEditData, patch, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        full_name: '',
        email: '',
        contact_number: '',
        age: '',
        sex: '',
        birthdate: '',
        employment_status: '',
        occupation: '',
        address: '',
        barangay_id: '',
        educational_attainment: '',
        work_experience: '',
        job_id: '',
    });

    const members = activeTab === 'active' ? activeMembers : inactiveMembers;

    const filteredMembers = members?.filter((m) => {
        const matchesSearch = !search ||
            m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.email?.toLowerCase().includes(search.toLowerCase()) ||
            m.latest_application?.job_title?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    }) ?? [];

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700 border border-amber-200',
        'for review': 'bg-blue-100 text-blue-700 border border-blue-200',
        'for interview': 'bg-purple-100 text-purple-700 border border-purple-200',
        interview: 'bg-purple-100 text-purple-700 border border-purple-200',
        interviewed: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
        hired: 'bg-green-100 text-green-700 border border-green-200',
        rejected: 'bg-red-100 text-red-700 border border-red-200',
    };

    const openResumeBuilder = (member) => {
        setViewMember(null);
        router.get(route('agency.members.resume-builder', member.id));
    };

    const submitAddMember = (e) => {
        e.preventDefault();
        post(route('agency.members.store'), {
            onSuccess: () => {
                setShowAddMember(false);
                reset();
            },
        });
    };

    const openEdit = (member) => {
        setEditData({
            full_name: member.full_name ?? '',
            email: member.email ?? '',
            contact_number: member.contact_number ?? '',
            age: member.age ?? '',
            sex: member.sex ?? '',
            birthdate: member.birthdate ?? '',
            employment_status: member.employment_status ?? '',
            occupation: member.occupation ?? '',
            address: member.address ?? '',
            barangay_id: member.barangay_id ? String(member.barangay_id) : '',
            educational_attainment: member.education ?? '',
            work_experience: member.work_experience ?? '',
            job_id: member.assigned_job_id ? String(member.assigned_job_id) : '',
        });
        setViewMember(member);
        setEditingMember(true);
    };

    const openDetails = (member) => {
        setEditingMember(false);
        setViewMember(member);
    };

    const submitEditMember = (e) => {
        e.preventDefault();
        patch(route('agency.members.update', viewMember.id), {
            preserveScroll: true,
            onSuccess: () => {
                const b = barangays?.find((x) => String(x.id) === String(editData.barangay_id));
                const chosenJob = jobs?.find((j) => String(j.id) === String(editData.job_id));
                setViewMember((m) => ({
                    ...m,
                    full_name: editData.full_name,
                    email: editData.email,
                    contact_number: editData.contact_number,
                    age: editData.age,
                    sex: editData.sex,
                    birthdate: editData.birthdate,
                    employment_status: editData.employment_status,
                    occupation: editData.occupation,
                    address: editData.address,
                    barangay: b ? b.barangay_name : editData.address,
                    barangay_id: editData.barangay_id,
                    education: editData.educational_attainment,
                    work_experience: editData.work_experience,
                    assigned_job_id: editData.job_id,
                    latest_application: m.latest_application
                        ? {
                            ...m.latest_application,
                            job_title: chosenJob ? chosenJob.job_title : m.latest_application.job_title,
                        }
                        : m.latest_application,
                }));
                setEditingMember(false);
            },
        });
    };

    const toggleMemberStatus = (member) => {
        const nextActive = !member.is_active;
        router.patch(route('agency.members.status', member.id), { is_active: nextActive }, {
            preserveScroll: true,
            onSuccess: () => {
                if (nextActive === false) {
                    setViewMember(null);
                } else {
                    setViewMember((m) => (m ? { ...m, is_active: nextActive } : m));
                }
                router.reload({ only: ['activeMembers', 'inactiveMembers', 'statistics'] });
            },
            onError: () => {
                setNotice({ type: 'error', text: 'Failed to update member account status. Please try again.' });
            },
        });
    };

    const downloadResume = (member) => {
        window.location.href = route('agency.members.resume', member.id);
    };

    const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

    return (
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Members</h2>}>
            <Head title="Members" />

            {notice && (
                <div className={`mb-5 flex items-start justify-between gap-3 px-4 py-3 rounded-xl text-sm border ${
                    notice.type === 'success'
                        ? 'bg-green-100 border-green-200 text-green-700'
                        : 'bg-red-100 border-red-200 text-red-700'
                }`}>
                    <span>{notice.text}</span>
                    <button onClick={() => setNotice(null)} className="text-current/70 hover:text-current">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
                        <p className="text-slate-500 text-sm mt-1">View active and inactive agency members</p>
                    </div>
                    <button
                        onClick={() => { setShowAddMember(true); reset(); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Member
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{statistics.total ?? 0}</p>
                        <p className="text-xs text-slate-500">Total Members</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{statistics.active ?? 0}</p>
                        <p className="text-xs text-slate-500">Active</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-4 text-center">
                        <p className="text-2xl font-bold text-slate-500">{statistics.inactive ?? 0}</p>
                        <p className="text-xs text-slate-500">Inactive</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                            activeTab === 'active'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <UserCheck className="h-4 w-4" />
                        Active ({statistics.active ?? 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('inactive')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                            activeTab === 'inactive'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <UserX className="h-4 w-4" />
                        Inactive ({statistics.inactive ?? 0})
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or position..."
                        className={`${inputClass} pl-10`}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.length === 0 ? (
                        <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No {activeTab} members found</p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                                onClick={() => openDetails(member)}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                                        {member.full_name?.charAt(0) ?? '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-slate-800 truncate">{member.full_name}</h3>
                                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1.5 border ${member.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            {member.is_active ? 'Account Active' : 'Account Disabled'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{member.latest_application?.job_title ?? '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        <span>{member.contact_number ?? '—'}</span>
                                    </div>
                                    {member.barangay && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{member.barangay}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[member.latest_application?.status] ?? 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                        <Clock className="h-3 w-3 mr-1" />
                                        {member.latest_application?.status ?? 'pending'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {member.total_applications} application{member.total_applications !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); openDetails(member); }}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); openEdit(member); }}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {viewMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className={`relative bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${editingMember ? 'max-w-2xl' : 'max-w-lg'}`}>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingMember ? 'Edit Member' : 'Member Details'}</h2>
                            <button onClick={() => setViewMember(null)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {editingMember ? (
                            <form onSubmit={submitEditMember} className="p-6 space-y-5">
                                {Object.values(editErrors).length > 0 && (
                                    <div className="bg-red-100 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                        <p className="font-medium mb-1">Please fix the following:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {Object.values(editErrors).map((msg, i) => <li key={i}>{msg}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                                        <input
                                            type="text"
                                            value={editData.full_name}
                                            onChange={(e) => setEditData('full_name', e.target.value)}
                                            className={inputClass}
                                            placeholder="Enter full name"
                                            required
                                        />
                                        {editErrors.full_name && <p className="mt-1 text-xs text-red-600">{editErrors.full_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData('email', e.target.value)}
                                            className={inputClass}
                                            placeholder="email@example.com"
                                            required
                                        />
                                        {editErrors.email && <p className="mt-1 text-xs text-red-600">{editErrors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Number</label>
                                        <input
                                            type="text"
                                            value={editData.contact_number}
                                            onChange={(e) => setEditData('contact_number', e.target.value)}
                                            className={inputClass}
                                            placeholder="09XX XXX XXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Age</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="120"
                                            value={editData.age}
                                            onChange={(e) => setEditData('age', e.target.value)}
                                            className={inputClass}
                                            placeholder="Enter age"
                                        />
                                        {editErrors.age && <p className="mt-1 text-xs text-red-600">{editErrors.age}</p>}
                                    </div>
                                    <div>
                                        <FormSelect
                                            label="Gender"
                                            value={editData.sex}
                                            onChange={(e) => setEditData('sex', e.target.value)}
                                            placeholder="Select gender"
                                            error={editErrors.sex}
                                        >
                                            {GENDER_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </FormSelect>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editData.birthdate}
                                            onChange={(e) => setEditData('birthdate', e.target.value)}
                                            className={inputClass}
                                        />
                                        {editErrors.birthdate && <p className="mt-1 text-xs text-red-600">{editErrors.birthdate}</p>}
                                    </div>
                                    <div>
                                        <FormSelect
                                            label="Employment Status"
                                            value={editData.employment_status}
                                            onChange={(e) => setEditData('employment_status', e.target.value)}
                                            placeholder="Select employment status"
                                            error={editErrors.employment_status}
                                        >
                                            {EMPLOYMENT_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </FormSelect>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Occupation</label>
                                        <input
                                            type="text"
                                            value={editData.occupation}
                                            onChange={(e) => setEditData('occupation', e.target.value)}
                                            className={inputClass}
                                            placeholder="Current occupation, e.g. Construction Worker, Housekeeper"
                                        />
                                        {editErrors.occupation && <p className="mt-1 text-xs text-red-600">{editErrors.occupation}</p>}
                                    </div>
                                    <div>
                                        <FormSelect
                                            label="Assigned Job"
                                            value={editData.job_id}
                                            onChange={(e) => setEditData('job_id', e.target.value)}
                                            placeholder="Select a job"
                                        >
                                            {jobs?.map((job) => (
                                                <option key={job.id} value={job.id}>{job.job_title}</option>
                                            ))}
                                        </FormSelect>
                                    </div>
                                    <div>
                                        <FormSelect
                                            label="Education"
                                            value={editData.educational_attainment}
                                            onChange={(e) => setEditData('educational_attainment', e.target.value)}
                                            placeholder="Select education level"
                                        >
                                            {EDUCATION_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </FormSelect>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormSelect
                                            label="Address / Barangay"
                                            value={editData.barangay_id}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setEditData('barangay_id', id);
                                                const b = barangays?.find((x) => String(x.id) === String(id));
                                                setEditData('address', b ? b.barangay_name : '');
                                            }}
                                            placeholder="Select barangay/address"
                                        >
                                            {barangays?.map((b) => (
                                                <option key={b.id} value={b.id}>{b.barangay_name}</option>
                                            ))}
                                        </FormSelect>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Experience</label>
                                        <textarea
                                            value={editData.work_experience}
                                            onChange={(e) => setEditData('work_experience', e.target.value)}
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                            placeholder="Brief work experience summary"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        <Save className="h-4 w-4" />
                                        {editProcessing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingMember(false)}
                                        className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                                    {viewMember.full_name?.charAt(0) ?? '?'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{viewMember.full_name}</h3>
                                    <p className="text-sm text-slate-500">{viewMember.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[viewMember.latest_application?.status] ?? 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                            {viewMember.latest_application?.status ?? 'pending'}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${viewMember.is_active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {viewMember.is_active ? 'Account Active' : 'Account Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Contact</p>
                                    <p className="text-sm text-slate-800">{viewMember.contact_number ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Barangay</p>
                                    <p className="text-sm text-slate-800">{viewMember.barangay ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Age</p>
                                    <p className="text-sm text-slate-800">{viewMember.age ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Gender</p>
                                    <p className="text-sm text-slate-800">{viewMember.sex ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                                    <p className="text-sm text-slate-800">{viewMember.birthdate ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Employment Status</p>
                                    <p className="text-sm text-slate-800">{viewMember.employment_status ?? '—'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500 mb-1">Occupation</p>
                                    <p className="text-sm text-slate-800">{viewMember.occupation ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Education</p>
                                    <p className="text-sm text-slate-800">{viewMember.education ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Experience</p>
                                    <p className="text-sm text-slate-800">{viewMember.experience || viewMember.work_experience || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Applied Position</p>
                                    <p className="text-sm text-slate-800">{viewMember.latest_application?.job_title ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Applied Date</p>
                                    <p className="text-sm text-slate-800">{viewMember.latest_application?.applied_date ?? '—'}</p>
                                </div>
                            </div>

                            {viewMember.skills?.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewMember.skills.map((skill, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg border border-slate-200">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
                                <button
                                    onClick={() => openResumeBuilder(viewMember)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Resume
                                </button>
                                <button
                                    onClick={() => downloadResume(viewMember)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => toggleMemberStatus(viewMember)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                        viewMember.is_active
                                            ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                                            : 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                                    }`}
                                >
                                    {viewMember.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                    {viewMember.is_active ? 'Disable Account' : 'Enable Account'}
                                </button>
                                <button
                                    onClick={() => setViewMember(null)}
                                    className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            )}

            {showAddMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Add New Member</h2>
                            <button onClick={() => setShowAddMember(false)} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={submitAddMember} className="p-6 space-y-5">
                            {Object.values(errors).length > 0 && (
                                <div className="bg-red-100 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                    <p className="font-medium mb-1">Please fix the following:</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        {Object.values(errors).map((msg, i) => <li key={i}>{msg}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                                    <input
                                        type="text"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        className={inputClass}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={inputClass}
                                        placeholder="email@example.com"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Number</label>
                                    <input
                                        type="text"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        className={inputClass}
                                        placeholder="09XX XXX XXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Age</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.age}
                                        onChange={(e) => setData('age', e.target.value)}
                                        className={inputClass}
                                        placeholder="Enter age"
                                    />
                                    {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
                                </div>
                                <div>
                                    <FormSelect
                                        label="Gender"
                                        value={data.sex}
                                        onChange={(e) => setData('sex', e.target.value)}
                                        placeholder="Select gender"
                                        error={errors.sex}
                                    >
                                        {GENDER_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={data.birthdate}
                                        onChange={(e) => setData('birthdate', e.target.value)}
                                        className={inputClass}
                                    />
                                    {errors.birthdate && <p className="mt-1 text-xs text-red-600">{errors.birthdate}</p>}
                                </div>
                                <div>
                                    <FormSelect
                                        label="Employment Status"
                                        value={data.employment_status}
                                        onChange={(e) => setData('employment_status', e.target.value)}
                                        placeholder="Select employment status"
                                        error={errors.employment_status}
                                    >
                                        {EMPLOYMENT_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Occupation</label>
                                    <input
                                        type="text"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                        className={inputClass}
                                        placeholder="Current occupation, e.g. Construction Worker, Housekeeper"
                                    />
                                    {errors.occupation && <p className="mt-1 text-xs text-red-600">{errors.occupation}</p>}
                                </div>
                                <div>
                                    <FormSelect
                                        label="Assign to Job"
                                        value={data.job_id}
                                        onChange={(e) => setData('job_id', e.target.value)}
                                        placeholder="Select a job"
                                    >
                                        {jobs?.map((job) => (
                                            <option key={job.id} value={job.id}>{job.job_title}</option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <div>
                                    <FormSelect
                                        label="Education"
                                        value={data.educational_attainment}
                                        onChange={(e) => setData('educational_attainment', e.target.value)}
                                        placeholder="Select education level"
                                    >
                                        {EDUCATION_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <div className="md:col-span-2">
                                    <FormSelect
                                        label="Address / Barangay"
                                        value={data.barangay_id}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setData('barangay_id', id);
                                            const b = barangays?.find((x) => String(x.id) === String(id));
                                            setData('address', b ? b.barangay_name : '');
                                        }}
                                        placeholder="Select barangay/address"
                                    >
                                        {barangays?.map((b) => (
                                            <option key={b.id} value={b.id}>{b.barangay_name}</option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Experience</label>
                                    <textarea
                                        value={data.work_experience}
                                        onChange={(e) => setData('work_experience', e.target.value)}
                                        rows={3}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Brief work experience summary"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Member'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddMember(false)}
                                    className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AgencyLayouts>
    );
}