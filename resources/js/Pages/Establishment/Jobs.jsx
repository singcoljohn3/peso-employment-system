import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Plus, 
    X, 
    Briefcase, 
    Users, 
    Calendar, 
    MapPin, 
    Edit, 
    Trash2, 
    Eye,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function Jobs() {
    const { jobs, establishment } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        job_title: '',
        description: '',
        salary_range: '',
        employment_type: 'Full-time',
        job_category: '',
        location: '',
        requirements: '',
        status: 'active',
    });

    const openModal = (job = null) => {
        if (job) {
            setData({
                job_title: job.job_title,
                description: job.description,
                salary_range: job.salary_range || '',
                employment_type: job.employment_type,
                job_category: job.job_category || '',
                location: job.location || '',
                requirements: job.requirements || '',
                status: job.status,
            });
            setEditingJob(job);
        } else {
            reset();
            setEditingJob(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingJob(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (editingJob) {
            put(route('establishment.jobs.update', editingJob.id), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            post(route('establishment.jobs.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const deleteJob = (job) => {
        if (confirm(`Are you sure you want to delete "${job.job_title}"?`)) {
            const form = useForm();
            form.delete(route('establishment.jobs.delete', job.id));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'inactive':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <EstablishmentLayouts
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Job Management
                </h2>
            }
        >
            <Head title="Job Management" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Actions */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Job Postings</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage your company's job vacancies and track applications
                            </p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Post New Job
                        </button>
                    </div>

                    {/* Jobs Grid */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        {jobs?.data?.length > 0 ? (
                            <div className="divide-y divide-slate-200">
                                {jobs.data.map((job) => (
                                    <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-900">{job.job_title}</h4>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(job.status)}
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}>
                                                            {job.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3 space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span>{job.employment_type}</span>
                                                    </div>
                                                    {job.salary_range && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <span className="text-green-600 font-medium">₱</span>
                                                            <span>{job.salary_range}</span>
                                                        </div>
                                                    )}
                                                    {job.location && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{job.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    {job.description}
                                                </p>

                                                <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        <span>{job.applications_count || 0} applicants</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => openModal(job)}
                                                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100 transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteJob(job)}
                                                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Postings</h3>
                                <p className="text-gray-600 mb-6">
                                    You haven't posted any job vacancies yet. Create your first job posting to start receiving applications.
                                </p>
                                <button
                                    onClick={() => openModal()}
                                    className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Your First Job
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {jobs?.links && (
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

            {/* Job Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
                    <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="job_title"
                                        type="text"
                                        value={data.job_title}
                                        onChange={(e) => setData('job_title', e.target.value)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.job_title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g. Software Developer"
                                    />
                                    {errors.job_title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>
                                    )}
                                </div>

                                <div className="lg:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Describe role, responsibilities, and requirements..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Employment Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="employment_type"
                                        value={data.employment_type}
                                        onChange={(e) => setData('employment_type', e.target.value)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.employment_type ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                    {errors.employment_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.employment_type}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-2">
                                        Salary Range
                                    </label>
                                    <input
                                        id="salary_range"
                                        type="text"
                                        value={data.salary_range}
                                        onChange={(e) => setData('salary_range', e.target.value)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.salary_range ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g. ₱25,000 - ₱35,000"
                                    />
                                    {errors.salary_range && (
                                        <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="job_category" className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Category
                                    </label>
                                    <select
                                        id="job_category"
                                        value={data.job_category}
                                        onChange={(e) => setData('job_category', e.target.value)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.job_category ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Education">Education</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Hospitality">Hospitality</option>
                                        <option value="Construction">Construction</option>
                                        <option value="Transportation">Transportation</option>
                                        <option value="Agriculture">Agriculture</option>
                                        <option value="Government">Government</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.job_category && (
                                        <p className="mt-1 text-sm text-red-600">{errors.job_category}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        id="location"
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.location ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g. Cagayan de Oro City"
                                    />
                                    {errors.location && (
                                        <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                    )}
                                </div>

                                <div className="lg:col-span-2">
                                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                                        Requirements & Qualifications
                                    </label>
                                    <textarea
                                        id="requirements"
                                        value={data.requirements}
                                        onChange={(e) => setData('requirements', e.target.value)}
                                        rows={3}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.requirements ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="List required skills, experience, education..."
                                    />
                                    {errors.requirements && (
                                        <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.status ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : (editingJob ? 'Update Job' : 'Create Job')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </EstablishmentLayouts>
    );
}
