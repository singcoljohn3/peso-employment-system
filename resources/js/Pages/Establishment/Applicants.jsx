import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    Briefcase, 
    Calendar, 
    Mail, 
    Phone, 
    MapPin,
    CheckCircle,
    Clock,
    AlertCircle,
    Eye,
    Download,
    Search,
    Filter,
    User,
    Award,
    Building2,
    FileText,
    ChevronRight,
    ChevronLeft,
    X,
    CalendarCheck
} from 'lucide-react';

export default function Applicants() {
    const { applications, establishment, statistics, jobs } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        status: '',
        remarks: '',
    });

    const updateApplicationStatus = (application) => {
        setData({
            status: application.status,
            remarks: application.remarks || '',
        });
        setSelectedApplication(application);
    };

    const submitStatusUpdate = (e) => {
        e.preventDefault();
        put(route('establishment.applicants.update', selectedApplication.id), {
            onSuccess: () => {
                setSelectedApplication(null);
                reset();
            },
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'hired':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'interview':
                return <CalendarCheck className="h-4 w-4 text-blue-600" />;
            case 'reviewed':
                return <Eye className="h-4 w-4 text-purple-600" />;
            case 'rejected':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'hired':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'interview':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'reviewed':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'hired':
                return 'Hired';
            case 'pending':
                return 'Pending';
            case 'interview':
                return 'Interview';
            case 'reviewed':
                return 'Reviewed';
            case 'rejected':
                return 'Rejected';
            default:
                return status;
        }
    };

    const getApplicationStatus = (application) => {
        // Try to get status from applicationStatus relationship
        if (application.applicationStatus?.hiringStatus?.status_name) {
            return application.applicationStatus.hiringStatus.status_name;
        }
        // Fallback to status field if it exists
        if (application.status) {
            return application.status;
        }
        // Default to pending if no status found
        return 'pending';
    };

    const filteredApplications = applications?.data?.filter(app => {
        const matchesSearch = !searchTerm || 
            app.jobSeeker?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobSeeker?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job?.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobSeeker?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const appStatus = getApplicationStatus(app);
        const matchesStatus = !statusFilter || appStatus === statusFilter;
        const matchesJob = !jobFilter || app.job_id === parseInt(jobFilter);
        
        return matchesSearch && matchesStatus && matchesJob;
    }) || [];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'interview', label: 'Interview' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' },
    ];

    const downloadResume = (application) => {
        if (application.resume) {
            window.open(route('admin.applications.download-resume', application.id), '_blank');
        } else {
            alert('No resume available for this applicant');
        }
    };

    const handleQuickAction = (application, action) => {
        setData({
            status: action,
            remarks: '',
        });
        setSelectedApplication(application);
    };

    const handleViewApplicant = (application) => {
        setSelectedApplication(application);
        setIsViewModalOpen(true);
    };

    const handleStatusUpdate = (application) => {
        const appStatus = getApplicationStatus(application);
        setData({
            status: appStatus,
            remarks: application.remarks || '',
        });
        setSelectedApplication(application);
    };

    return (
        <EstablishmentLayouts>
            <Head title="Job Applicants" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Job Applicants</h1>
                    <p className="text-slate-500 mt-1">Review and manage applications for your job postings</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Total Applicants</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Pending</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.pending || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <CalendarCheck className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Interviewed</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.interview_scheduled || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Hired</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.hired || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, email, or job title..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={jobFilter}
                                onChange={(e) => setJobFilter(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Jobs</option>
                                {jobs?.map(job => (
                                    <option key={job.id} value={job.id}>{job.job_title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applicants Grid */}
                {filteredApplications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredApplications.map((application) => {
                            const seeker = application.jobSeeker;
                            const job = application.job;
                            const appStatus = getApplicationStatus(application);
                            const statusBadge = getStatusColor(appStatus);
                            const statusIcon = getStatusIcon(appStatus);
                            const statusLabel = getStatusLabel(appStatus);
                            const firstInitial = seeker?.first_name?.[0] ?? '';
                            const lastInitial = seeker?.last_name?.[0] ?? '';

                            return (
                                <div key={application.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                    {firstInitial}{lastInitial}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">
                                                        {seeker?.first_name} {seeker?.last_name}
                                                    </h3>
                                                    <p className="text-white/80 text-sm">{job?.job_title}</p>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge}`}>
                                                {statusIcon}
                                                <span className="text-white">{statusLabel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4">
                                        {/* Skills */}
                                        {seeker?.skills && (
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Award className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Skills</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(seeker.skills) ? seeker.skills.slice(0, 3).map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                                                            {skill}
                                                        </span>
                                                    )) : typeof seeker.skills === 'string' ? seeker.skills.split(',').slice(0, 3).map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                                                            {skill.trim()}
                                                        </span>
                                                    )) : null}
                                                    {(Array.isArray(seeker.skills) ? seeker.skills.length : seeker.skills?.split(',').length) > 3 && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                            +{(Array.isArray(seeker.skills) ? seeker.skills.length : seeker.skills?.split(',').length) - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Information */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                <span className="truncate">{seeker?.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                <span>{seeker?.contact_number || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <span>{seeker?.barangay_name || seeker?.barangay?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span>Applied {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : new Date(application.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleViewApplicant(application)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => downloadResume(application)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                                            >
                                                <Download className="h-4 w-4" />
                                                Resume
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(application)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Review
                                            </button>
                                            <button
                                                onClick={() => handleQuickAction(application, 'interview')}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <CalendarCheck className="h-4 w-4" />
                                                Interview
                                            </button>
                                            <button
                                                onClick={() => handleQuickAction(application, 'hired')}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleQuickAction(application, 'rejected')}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                            >
                                                <AlertCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
                        <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Applicants Found</h3>
                        <p className="text-slate-500">
                            {applications?.data?.length > 0 
                                ? 'No applicants match your current filters.' 
                                : 'No applications received yet.'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {applications?.links && applications?.data?.length > 0 && (
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-600">
                            Showing <span className="font-semibold text-slate-800">{applications.from || 0}</span> to <span className="font-semibold text-slate-800">{applications.to || 0}</span> of <span className="font-semibold text-slate-800">{applications.total}</span> applicants
                        </div>
                        <div className="flex items-center gap-2">
                            {applications.prev_page_url ? (
                                <Link
                                    href={applications.prev_page_url}
                                    className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-sm font-medium cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                            )}
                            {applications.links?.slice(1, -1).map((link, index) => (
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-blue-600 text-white border border-blue-600'
                                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                            {applications.next_page_url ? (
                                <Link
                                    href={applications.next_page_url}
                                    className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-sm font-medium cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* View Applicant Modal */}
            {isViewModalOpen && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Applicant Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {(() => {
                                const seeker = selectedApplication.jobSeeker;
                                const job = selectedApplication.job;
                                const appStatus = getApplicationStatus(selectedApplication);
                                const statusBadge = getStatusColor(appStatus);
                                const statusIcon = getStatusIcon(appStatus);
                                const statusLabel = getStatusLabel(appStatus);
                                const firstInitial = seeker?.first_name?.[0] ?? '';
                                const lastInitial = seeker?.last_name?.[0] ?? '';

                                return (
                                    <div className="space-y-6">
                                        {/* Profile Header */}
                                        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                {firstInitial}{lastInitial}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-2xl font-bold text-slate-800">
                                                    {seeker?.first_name} {seeker?.middle_name ? seeker.middle_name + ' ' : ''}{seeker?.last_name}
                                                </h4>
                                                <p className="text-slate-500">{job?.job_title}</p>
                                                <div className={`flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-semibold border w-fit ${statusBadge}`}>
                                                    {statusIcon}
                                                    <span>{statusLabel}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Contact Information</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{seeker?.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{seeker?.contact_number || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{seeker?.address || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{seeker?.barangay_name || seeker?.barangay?.name || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {seeker?.skills && (
                                            <div className="bg-slate-50 rounded-lg p-4">
                                                <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Skills</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(seeker.skills) ? seeker.skills.map((skill, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                                            {skill}
                                                        </span>
                                                    )) : typeof seeker.skills === 'string' ? seeker.skills.split(',').map((skill, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                                            {skill.trim()}
                                                        </span>
                                                    )) : null}
                                                </div>
                                            </div>
                                        )}

                                        {/* Educational Background */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Educational Background</h5>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{seeker?.educational_attainment || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Work Experience */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Work Experience</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-slate-500">Current Occupation</p>
                                                    <p className="text-sm text-slate-700">{seeker?.occupation || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Employer</p>
                                                    <p className="text-sm text-slate-700">{seeker?.employer_company || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Years of Experience</p>
                                                    <p className="text-sm text-slate-700">{seeker?.work_experience_years || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Employment Status</p>
                                                    <p className="text-sm text-slate-700">{seeker?.employment_status || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Application Details */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Application Details</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-slate-500">Applied Job</p>
                                                    <p className="text-sm text-slate-700">{job?.job_title || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Date Applied</p>
                                                    <p className="text-sm text-slate-700">{selectedApplication.applied_at ? new Date(selectedApplication.applied_at).toLocaleDateString() : new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {selectedApplication.application_details && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-500">Application Details</p>
                                                    <p className="text-sm text-slate-700 mt-1">{selectedApplication.application_details}</p>
                                                </div>
                                            )}
                                            {selectedApplication.remarks && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-500">Remarks</p>
                                                    <p className="text-sm text-slate-700 mt-1">{selectedApplication.remarks}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    updateApplicationStatus(selectedApplication);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {selectedApplication && !isViewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Update Application Status</h3>
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={submitStatusUpdate} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Applicant</label>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="font-medium text-slate-800">
                                        {selectedApplication.jobSeeker?.first_name} {selectedApplication.jobSeeker?.last_name}
                                    </p>
                                    <p className="text-sm text-slate-600">{selectedApplication.jobSeeker?.email}</p>
                                    <p className="text-sm text-slate-600">Applied for: {selectedApplication.job?.job_title}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                        errors.status ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                >
                                    <option value="">Select Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="interview">Interview Scheduled</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                                <textarea
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    rows={3}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                        errors.remarks ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                    placeholder="Add notes about this application..."
                                />
                                {errors.remarks && (
                                    <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedApplication(null)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </EstablishmentLayouts>
    );
}
