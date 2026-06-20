import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    Search,
    Edit,
    Trash2,
    Users,
    X,
    MapPin,
    DollarSign,
    Tag,
    AlertCircle
} from 'lucide-react';

export default function JobVacancy() {
    const { jobs, establishment, skills = [], barangays = [], flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        job_title: '',
        description: '',
        salary_range: '',
        employment_type: '',
        barangay_id: establishment?.barangay_id || '',
        skills: [],
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    useEffect(() => {
        if (selectedJob && showEditModal) {
            setData({
                job_title: selectedJob.job_title || '',
                description: selectedJob.description || '',
                salary_range: selectedJob.salary_range || '',
                employment_type: selectedJob.employment_type || '',
                barangay_id: selectedJob.barangay_id || '',
                skills: selectedJob.skills?.map(s => s.id) || [],
            });
            setSelectedSkills(selectedJob.skills?.map(s => s.id) || []);
        }
    }, [selectedJob, showEditModal]);

    const handleAddClick = () => {
        reset();
        setSelectedSkills([]);
        setShowAddModal(true);
    };

    const handleEditClick = (job) => {
        setSelectedJob(job);
        setShowEditModal(true);
    };

    const handleDeleteClick = (job) => {
        setSelectedJob(job);
        setShowDeleteModal(true);
    };

    const handleViewApplicants = (job) => {
        setSelectedJob(job);
        setShowApplicantsModal(true);
    };

    const handleSkillToggle = (skillId) => {
        setSelectedSkills(prev => {
            const newSkills = prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId];
            setData('skills', newSkills);
            return newSkills;
        });
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('establishment.jobs.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                setSelectedSkills([]);
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('establishment.jobs.update', selectedJob.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedJob(null);
                reset();
                setSelectedSkills([]);
            },
        });
    };

    const submitDelete = () => {
        destroy(route('establishment.jobs.delete', selectedJob.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedJob(null);
            },
        });
    };

    const filteredJobs = jobs?.data?.filter(job => {
        const matchesSearch = !searchTerm ||
            job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.employment_type?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    }) || [];

    const employmentTypes = [
        { value: 'full_time', label: 'Full Time' },
        { value: 'part_time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'freelance', label: 'Freelance' },
        { value: 'internship', label: 'Internship' },
    ];

    return (
        <EstablishmentLayouts
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Job Vacancies</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage your job postings</p>
                    </div>
                </div>
            }
        >
            <Head title="Job Vacancies" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Company Info Header */}
                    {establishment && (
                        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                {establishment.logo ? (
                                    <img
                                        src={`/storage/${establishment.logo}`}
                                        alt={establishment.company_name}
                                        className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                                        <Briefcase className="h-7 w-7 text-blue-600" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900">{establishment.company_name}</h3>
                                    <p className="text-sm text-slate-600">
                                        {establishment.contact_person} | {establishment.email} | {establishment.contact_number || 'No contact number'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {establishment.barangay?.barangay_name || 'No location set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header Actions */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Job Listings</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Create and manage job postings for your establishment
                            </p>
                        </div>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add Job
                        </button>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
                            {flash.error}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Search jobs by title, description..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        {filteredJobs.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {filteredJobs.map((job) => (
                                    <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                                                        <Briefcase className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-lg font-semibold text-gray-900">{job.job_title}</h4>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{job.description}</p>

                                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Tag className="h-4 w-4" />
                                                                {job.employment_type?.replace('_', ' ')}
                                                            </span>
                                                            {job.salary_range && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="text-sm font-medium">₱</span>
                                                                    {job.salary_range}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {job.barangay?.barangay_name || establishment?.barangay?.barangay_name || 'N/A'}
                                                            </span>
                                                        </div>

                                                        {job.skills?.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {job.skills.map((skill) => (
                                                                    <span
                                                                        key={skill.id}
                                                                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                                                                    >
                                                                        {skill.skill_name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewApplicants(job)}
                                                        className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                                    >
                                                        <Users className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Applicants</span>
                                                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
                                                            {job.applications_count || 0}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(job)}
                                                        className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-100"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(job)}
                                                        className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    {jobs?.data?.length > 0
                                        ? 'No jobs match your current filters.'
                                        : 'Start by adding your first job posting.'}
                                </p>
                                {jobs?.data?.length === 0 && (
                                    <button
                                        onClick={handleAddClick}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Job
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {jobs?.links && jobs.data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {jobs.from || 0} to {jobs.to || 0} of {jobs.total} results
                            </div>
                            <div className="flex gap-2">
                                {jobs.links?.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-lg px-3 py-2 text-sm ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Job Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
                    <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Job</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitAdd} className="p-6">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="job_title" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Job Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="job_title"
                                        type="text"
                                        value={data.job_title}
                                        onChange={(e) => setData('job_title', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.job_title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., Software Developer"
                                    />
                                    {errors.job_title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="employment_type" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Employment Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="employment_type"
                                        value={data.employment_type}
                                        onChange={(e) => setData('employment_type', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.employment_type ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Type</option>
                                        {employmentTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.employment_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.employment_type}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="barangay_id" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Barangay <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="barangay_id"
                                        value={data.barangay_id}
                                        onChange={(e) => setData('barangay_id', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.barangay_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Barangay</option>
                                        {barangays.map(barangay => (
                                            <option key={barangay.id} value={barangay.id}>
                                                {barangay.barangay_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.barangay_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.barangay_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="salary_range" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Salary Range (₱)
                                    </label>
                                    <input
                                        id="salary_range"
                                        type="text"
                                        value={data.salary_range}
                                        onChange={(e) => setData('salary_range', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.salary_range ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., 25,000 - 35,000"
                                    />
                                    {errors.salary_range && (
                                        <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Job Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Describe the job responsibilities, requirements, and benefits..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Skills Required
                                    </label>
                                    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg">
                                        {skills.length > 0 ? (
                                            skills.map((skill) => (
                                                <button
                                                    key={skill.id}
                                                    type="button"
                                                    onClick={() => handleSkillToggle(skill.id)}
                                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                                        selectedSkills.includes(skill.id)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {skill.skill_name}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">No skills available. Add skills in the admin panel.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Job'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Job Modal */}
            {showEditModal && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
                    <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Job</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="p-6">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="edit_job_title" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Job Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="edit_job_title"
                                        type="text"
                                        value={data.job_title}
                                        onChange={(e) => setData('job_title', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.job_title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., Software Developer"
                                    />
                                    {errors.job_title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="edit_employment_type" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Employment Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="edit_employment_type"
                                        value={data.employment_type}
                                        onChange={(e) => setData('employment_type', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.employment_type ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Type</option>
                                        {employmentTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.employment_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.employment_type}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="edit_barangay_id" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Barangay <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="edit_barangay_id"
                                        value={data.barangay_id}
                                        onChange={(e) => setData('barangay_id', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.barangay_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Barangay</option>
                                        {barangays.map(barangay => (
                                            <option key={barangay.id} value={barangay.id}>
                                                {barangay.barangay_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.barangay_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.barangay_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="edit_salary_range" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Salary Range (₱)
                                    </label>
                                    <input
                                        id="edit_salary_range"
                                        type="text"
                                        value={data.salary_range}
                                        onChange={(e) => setData('salary_range', e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.salary_range ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., 25,000 - 35,000"
                                    />
                                    {errors.salary_range && (
                                        <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="edit_description" className="mb-2 block text-sm font-semibold text-gray-700">
                                        Job Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="edit_description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Describe the job responsibilities, requirements, and benefits..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Skills Required
                                    </label>
                                    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg">
                                        {skills.length > 0 ? (
                                            skills.map((skill) => (
                                                <button
                                                    key={skill.id}
                                                    type="button"
                                                    onClick={() => handleSkillToggle(skill.id)}
                                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                                        selectedSkills.includes(skill.id)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {skill.skill_name}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">No skills available. Add skills in the admin panel.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Updating...
                                        </span>
                                    ) : (
                                        'Update Job'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative w-full max-w-md mx-4 rounded-xl bg-white shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Job Posting</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{selectedJob.job_title}</strong>? This action cannot be undone and all associated applications will also be removed.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitDelete}
                                    disabled={deleteProcessing}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
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
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowApplicantsModal(false)} />
                    <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Job Applicants</h3>
                                <p className="text-sm text-gray-600">{selectedJob.job_title}</p>
                            </div>
                            <button
                                onClick={() => setShowApplicantsModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {selectedJob.applications?.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {selectedJob.applications.map((application) => (
                                        <div key={application.id} className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {application.job_seeker?.first_name} {application.job_seeker?.last_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">{application.job_seeker?.email}</p>
                                                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
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
                                                <Link
                                                    href={route('establishment.applicants')}
                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Applicants Yet</h4>
                                    <p className="text-sm text-gray-600">No one has applied for this job position yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </EstablishmentLayouts>
    );
}
