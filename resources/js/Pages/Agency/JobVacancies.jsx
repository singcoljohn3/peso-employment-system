import { Head, useForm, router, Link } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import { useState, useRef, useEffect } from 'react';
import {
    Plus, Search, Briefcase, X, Send, CheckCircle2,
    MapPin, DollarSign, Tag, GraduationCap, Users, Edit, Trash2,
    AlertCircle, CheckCircle, Save, Loader2, ArrowLeft, ChevronDown
} from 'lucide-react';
import JobApplicationWizard from '@/Components/Agency/JobApplicationWizard';
import Pagination from '@/Components/Agency/Pagination';

export default function JobVacancies({ jobs, agency, skills, barangays = [], members = [], appliedJobIds, flash }) {
    const [showCreate, setShowCreate] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedIds, setAppliedIds] = useState(appliedJobIds ?? []);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Modal states
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);

    const educationalBackgrounds = [
        'Any Educational Background',
        'High School Graduate',
        'Senior High School Graduate',
        'Vocational Graduate',
        'TESDA NC Holder',
        'College Level',
        "Bachelor's Degree in Accountancy",
        "Bachelor's Degree in Business Administration",
        "Bachelor's Degree in Information Technology",
        "Bachelor's Degree in Computer Science",
        "Bachelor's Degree in Education",
        "Bachelor's Degree in Engineering",
        "Bachelor's Degree in Nursing",
        "Bachelor's Degree in Hospitality Management",
        "Bachelor's Degree in Tourism Management",
        "Bachelor's Degree in Agriculture",
        "Bachelor's Degree in Criminology",
        "Bachelor's Degree in Marketing Management",
        "Bachelor's Degree in Human Resource Management",
        'Other',
    ];

    const [eduSearchOpen, setEduSearchOpen] = useState(false);
    const [eduSearchTerm, setEduSearchTerm] = useState('');
    const eduDropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (eduDropdownRef.current && !eduDropdownRef.current.contains(event.target)) {
                setEduSearchOpen(false);
                setEduSearchTerm('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredEducationalBackgrounds = educationalBackgrounds.filter(eb =>
        eb.toLowerCase().includes(eduSearchTerm.toLowerCase())
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        job_title: '',
        educational_background: '',
        employment_type: '',
        work_arrangement: '',
        vacant_positions: '',
        application_deadline: '',
        hiring_status: 'Open',
        salary_type: '',
        min_salary: '',
        max_salary: '',
        salary_negotiable: false,
        benefits: '',
        barangay_id: '',
        description: '',
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    useEffect(() => {
        if (selectedJob && isEditing) {
            setData({
                job_title: selectedJob.job_title || '',
                educational_background: selectedJob.educational_background || '',
                employment_type: selectedJob.employment_type || '',
                work_arrangement: selectedJob.work_arrangement || '',
                vacant_positions: selectedJob.vacant_positions ?? '',
                application_deadline: selectedJob.application_deadline ?? '',
                hiring_status: selectedJob.hiring_status || 'Open',
                salary_type: selectedJob.salary_type || '',
                min_salary: selectedJob.min_salary ?? '',
                max_salary: selectedJob.max_salary ?? '',
                salary_negotiable: selectedJob.salary_negotiable ?? false,
                benefits: selectedJob.benefits || '',
                barangay_id: selectedJob.barangay_id || '',
                description: selectedJob.description || '',
            });
            setShowCreate(true);
        }
    }, [selectedJob, isEditing]);

    const filteredJobs = jobs?.data?.filter((job) => {
        const matchesSearch = !searchTerm || job.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || job.hiring_status === statusFilter;
        return matchesSearch && matchesStatus;
    }) ?? [];

    const handleAddClick = () => {
        reset();
        setIsEditing(false);
        setShowCreate(true);
    };

    const handleEditClick = (job) => {
        setSelectedJob(job);
        setIsEditing(true);
    };

    const handleCancelForm = () => {
        setShowCreate(false);
        setIsEditing(false);
        setSelectedJob(null);
        reset();
    };

    const handleDeleteClick = (job) => {
        setSelectedJob(job);
        setShowDeleteModal(true);
    };

    const handleViewApplicants = (job) => {
        setSelectedJob(job);
        setShowApplicantsModal(true);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('agency.jobs.store'), {
            onSuccess: () => { setShowCreate(false); reset(); },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('agency.jobs.update', selectedJob.id), {
            onSuccess: () => {
                setShowCreate(false);
                setIsEditing(false);
                setSelectedJob(null);
                reset();
            },
        });
    };

    const submitDelete = () => {
        destroy(route('agency.jobs.delete', selectedJob.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedJob(null);
            },
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

    const employmentTypes = [
        { value: 'Full-time', label: 'Full-Time' },
        { value: 'Part-time', label: 'Part-Time' },
        { value: 'Contract', label: 'Contract' },
        { value: 'Temporary', label: 'Temporary' },
        { value: 'Internship', label: 'Internship' },
        { value: 'Freelance', label: 'Freelance' },
    ];

    const workArrangements = ['On-site', 'Hybrid', 'Remote'];
    const salaryTypes = ['Monthly', 'Weekly', 'Daily', 'Hourly'];

    const formFields = () => {
        return (
            <div className="space-y-6">
                {/* Basic Job Information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3 border-b border-blue-100 pb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-800">Basic Job Information</h4>
                            <p className="text-xs text-slate-500">Core details about the job position</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Job Title <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={data.job_title} onChange={e => setData('job_title', e.target.value)}
                                className={`block w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.job_title ? 'border-red-400' : 'border-slate-300'}`}
                                placeholder="e.g., Cashier" />
                            {errors.job_title && <p className="mt-1 text-xs text-red-600">{errors.job_title}</p>}
                        </div>
                        <div className="relative" ref={eduDropdownRef}>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Educational Background Required <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={eduSearchOpen ? eduSearchTerm : (data.educational_background || '')}
                                    onChange={e => {
                                        setEduSearchTerm(e.target.value);
                                        setEduSearchOpen(true);
                                        if (!e.target.value) setData('educational_background', '');
                                    }}
                                    onFocus={() => setEduSearchOpen(true)}
                                    placeholder="Search educational background..."
                                    className={`block w-full rounded-xl border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.educational_background ? 'border-red-400' : 'border-slate-300'}`}
                                />
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                            {eduSearchOpen && (
                                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                    {filteredEducationalBackgrounds.length > 0 ? (
                                        filteredEducationalBackgrounds.map(eb => (
                                            <button
                                                key={eb}
                                                type="button"
                                                onClick={() => {
                                                    setData('educational_background', eb);
                                                    setEduSearchOpen(false);
                                                    setEduSearchTerm('');
                                                }}
                                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${data.educational_background === eb ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-700'}`}
                                            >
                                                {eb}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-slate-500">No matching options</div>
                                    )}
                                </div>
                            )}
                            {errors.educational_background && <p className="mt-1 text-xs text-red-600">{errors.educational_background}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Employment Type <span className="text-red-500">*</span>
                            </label>
                            <select value={data.employment_type} onChange={e => setData('employment_type', e.target.value)}
                                className={`block w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.employment_type ? 'border-red-400' : 'border-slate-300'}`}>
                                <option value="">Select Type</option>
                                {employmentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            {errors.employment_type && <p className="mt-1 text-xs text-red-600">{errors.employment_type}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Barangay</label>
                            <select value={data.barangay_id} onChange={(e) => setData('barangay_id', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select barangay</option>
                                {barangays?.map((b) => <option key={b.id} value={b.id}>{b.barangay_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Work Arrangement</label>
                            <div className="flex gap-2">
                                {workArrangements.map(wa => (
                                    <button key={wa} type="button" onClick={() => setData('work_arrangement', wa)}
                                        className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                                            data.work_arrangement === wa
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}>
                                        {wa}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Number of Vacancies
                            </label>
                            <input type="number" min="1" value={data.vacant_positions} onChange={e => setData('vacant_positions', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 3" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Hiring Deadline</label>
                            <input type="date" value={data.application_deadline} onChange={e => setData('application_deadline', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Job Status</label>
                            <select value={data.hiring_status} onChange={e => setData('hiring_status', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Open">Open</option>
                                <option value="Hiring">Hiring</option>
                                <option value="Closed">Closed</option>
                                <option value="Filled">Filled</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                rows={3}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Job description..." />
                        </div>
                    </div>
                </div>

                {/* Salary Information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3 border-b border-emerald-100 pb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-800">Salary Information</h4>
                            <p className="text-xs text-slate-500">Compensation details for the position</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Salary Type</label>
                            <select value={data.salary_type} onChange={e => setData('salary_type', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Type</option>
                                {salaryTypes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end pb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.salary_negotiable}
                                    onChange={e => setData('salary_negotiable', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium text-slate-700">Salary Negotiable</span>
                            </label>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Minimum Salary (₱)</label>
                            <input type="number" min="0" step="0.01" value={data.min_salary} onChange={e => setData('min_salary', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 10000" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Maximum Salary (₱)</label>
                            <input type="number" min="0" step="0.01" value={data.max_salary} onChange={e => setData('max_salary', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 20000" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Benefits (Optional)</label>
                            <textarea value={data.benefits} onChange={e => setData('benefits', e.target.value)}
                                rows={3}
                                className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="e.g., Health insurance, 13th month pay, Paid leave, Retirement plan..." />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const formFooter = (editing = false) => (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl">
            <p className="text-xs text-slate-400"><span className="text-red-500">*</span> Required fields</p>
            <div className="flex gap-3">
                <button type="button" onClick={handleCancelForm}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={processing}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {processing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                        <><Save className="h-4 w-4" /> {editing ? 'Update Job Vacancy' : 'Post Job Vacancy'}</>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Job Vacancies</h2>}>
            <Head title="Job Vacancies" />

            <div className="space-y-6">
                {showCreate ? (
                    <>
                        <div className="mb-6 flex items-center gap-3">
                            <button type="button" onClick={handleCancelForm}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {isEditing ? 'Edit Job Vacancy' : 'Add New Job Vacancy'}
                                </h3>
                                <p className="text-sm text-slate-500">Fill in all required fields to {isEditing ? 'update' : 'create'} a job posting</p>
                            </div>
                        </div>

                        <form onSubmit={isEditing ? submitEdit : submitAdd} className="space-y-6">
                            {formFields()}
                            {formFooter(isEditing)}
                        </form>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Job Vacancies</h1>
                                <p className="text-slate-500 text-sm mt-1">Manage your job postings</p>
                            </div>
                            <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm">
                                <Plus className="h-4 w-4" /> Post Job Vacancy
                            </button>
                        </div>

                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
                                <CheckCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-medium">{flash.success}</p>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-medium">{flash.error}</p>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search jobs..." className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
                                <option value="">All Status</option>
                                <option value="Open">Open</option>
                                <option value="Hiring">Hiring</option>
                                <option value="Closed">Closed</option>
                                <option value="Filled">Filled</option>
                            </select>
                        </div>

                        {/* Jobs List */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            {filteredJobs.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Jobs Found</h3>
                                    <p className="text-slate-500 max-w-md mx-auto">
                                        {jobs?.data?.length > 0
                                            ? 'No jobs match your current filters.'
                                            : 'Start by adding your first job posting.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {filteredJobs.map((job) => (
                                        <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                                                            <Briefcase className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="text-lg font-semibold text-slate-900">{job.job_title}</h4>
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                    job.hiring_status === 'Open' || job.hiring_status === 'Hiring'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}>{job.hiring_status || 'Open'}</span>
                                                            </div>
                                                            <p className="mt-0.5 font-medium text-sm text-blue-700">
                                                                {job.establishment?.company_name || job.agency?.agency_name || 'PESO'}
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-600 line-clamp-2">{job.description}</p>
                                                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Tag className="h-4 w-4" />
                                                                    {job.employment_type?.replace('_', ' ')}
                                                                </span>
                                                                {job.educational_background && (
                                                                    <span className="flex items-center gap-1">
                                                                        <GraduationCap className="h-4 w-4" />
                                                                        {job.educational_background}
                                                                    </span>
                                                                )}
                                                                {(job.min_salary || job.max_salary || job.salary_range) && (
                                                                    <span className="flex items-center gap-1">
                                                                        <DollarSign className="h-4 w-4" />
                                                                        {job.salary_range ? `₱${job.salary_range}` : `₱${Number(job.min_salary || 0).toLocaleString()} - ₱${Number(job.max_salary || 0).toLocaleString()}`}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-4 w-4" />
                                                                    {job.barangay?.barangay_name || 'N/A'}
                                                                </span>
                                                                {job.vacant_positions && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Users className="h-4 w-4" />
                                                                        {job.vacant_positions} slot{job.vacant_positions > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button onClick={() => handleViewApplicants(job)} className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors">
                                                            <Users className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Applicants</span>
                                                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
                                                                {job.applications_count || 0}
                                                            </span>
                                                        </button>
                                                        
                                                        {appliedIds.includes(job.id) ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Applied
                                                            </span>
                                                        ) : isJobActive(job) ? (
                                                            <button onClick={() => openApply(job)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm">
                                                                <Send className="h-4 w-4" /> Apply
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                                Not Available
                                                            </span>
                                                        )}

                                                        {job.agency_id === agency.id && (
                                                            <>
                                                                <button onClick={() => handleEditClick(job)} className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-100 transition-colors">
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">Edit</span>
                                                                </button>
                                                                <button onClick={() => handleDeleteClick(job)} className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">Delete</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Delete Job Posting</h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-6">
                                Are you sure you want to delete <strong>{selectedJob.job_title}</strong>? This action cannot be undone and all associated applications will also be removed.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowDeleteModal(false)}
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={submitDelete} disabled={deleteProcessing}
                                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                                    {deleteProcessing ? 'Deleting...' : 'Delete Job'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Applicants Modal */}
            {showApplicantsModal && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowApplicantsModal(false)} />
                    <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Job Applicants</h3>
                                <p className="text-sm text-slate-500">{selectedJob.job_title}</p>
                            </div>
                            <button onClick={() => setShowApplicantsModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {selectedJob.applications?.length > 0 ? (
                                <div className="divide-y divide-slate-200">
                                    {selectedJob.applications.map((application) => (
                                        <div key={application.id} className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">
                                                        {application.job_seeker?.first_name} {application.job_seeker?.last_name}
                                                    </h4>
                                                    <p className="text-sm text-slate-600">{application.job_seeker?.email}</p>
                                                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                                                        <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            application.status === 'hired' ? 'bg-green-100 text-green-800' :
                                                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            application.status === 'interview' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {application.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href={route('agency.applicants')}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-slate-900 mb-2">No Applicants Yet</h4>
                                    <p className="text-sm text-slate-500">No one has applied for this job position yet.</p>
                                </div>
                            )}
                        </div>
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