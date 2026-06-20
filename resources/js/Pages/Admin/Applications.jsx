import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useState } from 'react';
import { Plus, X, Users, Briefcase, Calendar, FileText, ChevronLeft, ChevronRight, MapPin, Search, Download, Eye, Trash2, Filter, Building2, Phone, Mail, GraduationCap, Award, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Status badge colors
const getStatusBadge = (status) => {
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
        shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
        interview_scheduled: 'bg-orange-100 text-orange-700 border-orange-200',
        hired: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const statusLabels = {
        pending: 'Pending',
        reviewed: 'Reviewed',
        shortlisted: 'Shortlisted',
        interview_scheduled: 'Interview Scheduled',
        hired: 'Hired',
        rejected: 'Rejected',
    };
    return {
        style: statusStyles[status] || statusStyles.pending,
        label: statusLabels[status] || status,
    };
};

export default function Applications() {
    const { applications, statistics, establishments, jobs, filters } = usePage().props;
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Get pagination data
    const apps = applications?.data || [];
    const pagination = applications;

    // Filter form
    const { data: filterData, setData: setFilterData } = useForm({
        status: filters?.status || '',
        establishment_id: filters?.establishment_id || '',
        job_id: filters?.job_id || '',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
        search: filters?.search || '',
    });

    // Status update form
    const { data: statusData, setData: setStatusData, put, processing: statusProcessing } = useForm({
        status: '',
        remarks: '',
    });

    const applyFilters = () => {
        router.get(route('admin.applications-management'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setFilterData({
            status: '',
            establishment_id: '',
            job_id: '',
            date_from: '',
            date_to: '',
            search: '',
        });
        router.get(route('admin.applications-management'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setIsDetailsModalOpen(true);
    };

    const handleUpdateStatus = (application) => {
        setSelectedApplication(application);
        setStatusData({
            status: application.status,
            remarks: application.remarks || '',
        });
        setIsStatusModalOpen(true);
    };

    const submitStatusUpdate = (e) => {
        e.preventDefault();
        put(route('admin.applications.update-status', selectedApplication.id), {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                setSelectedApplication(null);
            },
        });
    };

    const handleDownloadResume = (application) => {
        window.open(route('admin.applications.download-resume', application.id), '_blank');
    };

    const handleDelete = (application) => {
        if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            router.delete(route('admin.applications.destroy', application.id), {
                onSuccess: () => {
                    // Refresh the page
                    router.get(route('admin.applications-management'));
                },
            });
        }
    };

    return (
        <AdminLayouts>
            <Head title="Applications Management" />

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2.5 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Total</p>
                            <p className="text-xl font-bold text-slate-800">{statistics?.total || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2.5 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Pending</p>
                            <p className="text-xl font-bold text-slate-800">{statistics?.pending || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2.5 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Reviewed</p>
                            <p className="text-xl font-bold text-slate-800">{statistics?.reviewed || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2.5 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Hired</p>
                            <p className="text-xl font-bold text-slate-800">{statistics?.hired || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2.5 rounded-lg">
                            <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Shortlisted</p>
                            <p className="text-xl font-bold text-slate-800">{statistics?.shortlisted || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2.5 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs">Rejected</p>
                            <p className="text-xl font-bold text-slate-800">{statistics?.rejected || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Job Applications</h2>
                            <p className="text-sm text-slate-500 mt-1">Manage and track all job applications</p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Search Applicant</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={filterData.search}
                                            onChange={(e) => setFilterData('search', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={filterData.status}
                                        onChange={(e) => setFilterData('status', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="interview_scheduled">Interview Scheduled</option>
                                        <option value="hired">Hired</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Establishment</label>
                                    <select
                                        value={filterData.establishment_id}
                                        onChange={(e) => setFilterData('establishment_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">All Establishments</option>
                                        {establishments?.map((est) => (
                                            <option key={est.id} value={est.id}>{est.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                                    <select
                                        value={filterData.job_id}
                                        onChange={(e) => setFilterData('job_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">All Jobs</option>
                                        {jobs?.map((job) => (
                                            <option key={job.id} value={job.id}>{job.job_title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date From</label>
                                    <input
                                        type="date"
                                        value={filterData.date_from}
                                        onChange={(e) => setFilterData('date_from', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date To</label>
                                    <input
                                        type="date"
                                        value={filterData.date_to}
                                        onChange={(e) => setFilterData('date_to', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                {apps && apps.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Applicant</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Job</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Company</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {apps.map((app, index) => {
                                    const seeker = app.jobSeeker;
                                    const job = app.job;
                                    const establishment = app.establishment || job?.establishment;
                                    const statusBadge = getStatusBadge(app.status);
                                    const firstInitial = seeker?.first_name?.[0] ?? '';
                                    const lastInitial = seeker?.last_name?.[0] ?? '';
                                    const fullName = seeker ? `${seeker.first_name} ${seeker.last_name}` : 'Unknown';

                                    return (
                                        <tr key={app.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                                    #{app.id}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                        {firstInitial}{lastInitial}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{fullName}</p>
                                                        {seeker?.contact_number && (
                                                            <p className="text-xs text-slate-500">{seeker.contact_number}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-medium text-slate-700">{job?.job_title || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{establishment?.company_name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{formatDate(app.applied_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.style}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(app)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(app)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Update Status"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    {app.resume && (
                                                        <button
                                                            onClick={() => handleDownloadResume(app)}
                                                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Download Resume"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(app)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Application"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <FileText className="h-12 w-12 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No applications found</p>
                        <p className="text-slate-400 text-sm mt-1">Adjust your filters or wait for new applications</p>
                    </div>
                )}

                {/* Pagination Footer */}
                {pagination?.data?.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{pagination.from}</span> to <span className="font-semibold text-slate-700">{pagination.to}</span> of <span className="font-semibold text-slate-700">{pagination.total}</span> applications
                            </p>
                            {pagination.links && pagination.links.length > 3 && (
                                <div className="flex items-center justify-center gap-1">
                                    {pagination.prev_page_url ? (
                                        <Link
                                            href={pagination.prev_page_url}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </button>
                                    )}
                                    <div className="flex items-center gap-1">
                                        {pagination.links.slice(1, -1).map((link, index) => (
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white border border-blue-600'
                                                            : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                    {pagination.next_page_url ? (
                                        <Link
                                            href={pagination.next_page_url}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {isDetailsModalOpen && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Application Details</h3>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {(() => {
                                const seeker = selectedApplication.jobSeeker;
                                const job = selectedApplication.job;
                                const establishment = selectedApplication.establishment || job?.establishment;
                                const statusBadge = getStatusBadge(selectedApplication.status);

                                return (
                                    <div className="space-y-6">
                                        {/* Applicant Information */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Applicant Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500">Full Name</p>
                                                    <p className="text-sm font-semibold text-slate-800">{seeker ? `${seeker.first_name} ${seeker.middle_name || ''} ${seeker.last_name}` : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Email</p>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                        <p className="text-sm text-slate-800">{seeker?.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Contact Number</p>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-slate-400" />
                                                        <p className="text-sm text-slate-800">{seeker?.contact_number || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Address</p>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-slate-400" />
                                                        <p className="text-sm text-slate-800">{seeker?.address || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Age</p>
                                                    <p className="text-sm text-slate-800">{seeker?.age || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Sex</p>
                                                    <p className="text-sm text-slate-800">{seeker?.sex || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Educational Background */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Educational Background</h4>
                                            <div>
                                                <p className="text-xs text-slate-500">Educational Attainment</p>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-slate-400" />
                                                    <p className="text-sm text-slate-800">{seeker?.educational_attainment || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills and Certifications */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Skills & Certifications</h4>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-slate-500">Skills</p>
                                                    <p className="text-sm text-slate-800">{seeker?.skills && Array.isArray(seeker.skills) ? seeker.skills.join(', ') : seeker?.skills || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">TESDA NC Certificates</p>
                                                    <p className="text-sm text-slate-800">{seeker?.tesda_nc_certificates || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Professional Licenses</p>
                                                    <p className="text-sm text-slate-800">{seeker?.professional_licenses || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Work Experience */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Work Experience</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500">Current Occupation</p>
                                                    <p className="text-sm text-slate-800">{seeker?.occupation || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Employer Company</p>
                                                    <p className="text-sm text-slate-800">{seeker?.employer_company || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Years of Experience</p>
                                                    <p className="text-sm text-slate-800">{seeker?.work_experience_years || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Employment Status</p>
                                                    <p className="text-sm text-slate-800">{seeker?.employment_status || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Application Details */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Job Application Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500">Applied Job</p>
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                                        <p className="text-sm text-slate-800">{job?.job_title || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Company</p>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-slate-400" />
                                                        <p className="text-sm text-slate-800">{establishment?.company_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Date Applied</p>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        <p className="text-sm text-slate-800">{formatDate(selectedApplication.applied_at)}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Current Status</p>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.style}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedApplication.application_details && (
                                                <div className="mt-4">
                                                    <p className="text-xs text-slate-500">Application Details</p>
                                                    <p className="text-sm text-slate-800 mt-1">{selectedApplication.application_details}</p>
                                                </div>
                                            )}
                                            {selectedApplication.remarks && (
                                                <div className="mt-4">
                                                    <p className="text-xs text-slate-500">Remarks</p>
                                                    <p className="text-sm text-slate-800 mt-1">{selectedApplication.remarks}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Preferred Job */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Preferred Job</h4>
                                            <p className="text-sm text-slate-800">{seeker?.preferred_job || 'N/A'}</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {isStatusModalOpen && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Update Application Status</h3>
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={submitStatusUpdate}>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={statusData.status}
                                        onChange={(e) => setStatusData('status', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="interview_scheduled">Interview Scheduled</option>
                                        <option value="hired">Hired</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                                    <textarea
                                        value={statusData.remarks}
                                        onChange={(e) => setStatusData('remarks', e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Add any notes or feedback..."
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusProcessing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {statusProcessing ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
