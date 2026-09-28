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
    Search,
    Filter,
    User,
    Award,
    Building2,
    FileText,
    GraduationCap,
    ChevronRight,
    ChevronLeft,
    X,
    XCircle,
    CalendarCheck,
    Download,
    Video,
    MapPinned,
    Globe,
    ExternalLink,
    Loader2
} from 'lucide-react';

export default function Applicants() {
    const { applications, establishment, statistics, jobs } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [resumeApplication, setResumeApplication] = useState(null);
    const [interviewApplication, setInterviewApplication] = useState(null);
    const [resumeHtml, setResumeHtml] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(false);
    const [resumeError, setResumeError] = useState(null);
    const [resumeTemplateName, setResumeTemplateName] = useState(null);

    const { data, setData, put, post, processing, errors, reset } = useForm({
        status: '',
        remarks: '',
    });

    const interviewForm = useForm({
        scheduled_date: '',
        scheduled_time: '',
        interview_type: 'on-site',
        location: '',
        meeting_link: '',
        notes: '',
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

    const submitInterviewSchedule = (e) => {
        e.preventDefault();
        interviewForm.post(route('establishment.applicants.schedule-interview', interviewApplication.id), {
            onSuccess: () => {
                setIsInterviewModalOpen(false);
                setInterviewApplication(null);
                interviewForm.reset();
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
            case 'interview_scheduled':
                return <CalendarCheck className="h-4 w-4 text-blue-600" />;
            case 'reviewed':
                return <Eye className="h-4 w-4 text-purple-600" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-emerald-600" />;
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
            case 'interview_scheduled':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'reviewed':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'approved':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
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
            case 'interview_scheduled':
                return 'Interview Scheduled';
            case 'reviewed':
                return 'Reviewed';
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            default:
                return status;
        }
    };

    const getApplicationStatus = (application) => {
        if (application.applicationStatus?.hiringStatus?.status_name) {
            return application.applicationStatus.hiringStatus.status_name;
        }
        if (application.status) {
            return application.status;
        }
        return 'pending';
    };

    const formatTime = (time) => {
        if (!time) return '';
        try {
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch {
            return time;
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return date;
        }
    };

    const displayValue = (value) => {
        if (value === null || value === undefined || value === '' || value === '—') {
            return 'Not Provided';
        }
        return value;
    };

    const handleOpenResume = async (application) => {
        setResumeApplication(application);
        setIsResumeModalOpen(true);
        setResumeLoading(true);
        setResumeHtml(null);
        setResumeError(null);
        setResumeTemplateName(null);
        try {
            const response = await fetch(route('establishment.applicants.resume-preview', application.id));
            const data = await response.json();
            if (data.html) {
                setResumeHtml(data.html);
                setResumeTemplateName(data.template || null);
            } else {
                setResumeError(data.error || 'Failed to load resume preview');
            }
        } catch (err) {
            setResumeError('Failed to load resume preview');
        } finally {
            setResumeLoading(false);
        }
    };

    const handleOpenInterview = (application) => {
        setInterviewApplication(application);
        interviewForm.setData({
            scheduled_date: '',
            scheduled_time: '',
            interview_type: 'on-site',
            location: '',
            meeting_link: '',
            notes: '',
        });
        setIsInterviewModalOpen(true);
    };

    const filteredApplications = applications?.data?.filter(app => {
        const matchesSearch = !searchTerm ||
            app.jobSeeker?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobSeeker?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job?.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobSeeker?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobSeeker?.contact_number?.toLowerCase().includes(searchTerm.toLowerCase());

        const appStatus = getApplicationStatus(app);
        const matchesStatus = !statusFilter || appStatus === statusFilter;
        const matchesJob = !jobFilter || app.job_id === parseInt(jobFilter);

        return matchesSearch && matchesStatus && matchesJob;
    }) || [];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'interview_scheduled', label: 'Interview Scheduled' },
        { value: 'approved', label: 'Approved' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' },
    ];

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

    const today = new Date().toISOString().split('T')[0];

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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
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
                                    placeholder="Search by name, email, contact, or job title..."
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
                            const seeker = application.seeker_profile || application.jobSeeker;
                            const job = application.job;
                            const appStatus = getApplicationStatus(application);
                            const statusBadge = getStatusColor(appStatus);
                            const statusIcon = getStatusIcon(appStatus);
                            const statusLabel = getStatusLabel(appStatus);
                            const firstInitial = seeker?.first_name?.[0] ?? '';
                            const lastInitial = seeker?.last_name?.[0] ?? '';
                            const interview = application.interview;
                            const barangayName = seeker?.barangay?.barangay_name || seeker?.barangay_name || '';
                            const seekerAddress = seeker?.address || barangayName;

                            return (
                                <div key={application.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                    {firstInitial}{lastInitial}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-white font-bold text-lg truncate">
                                                        {seeker?.first_name} {seeker?.last_name}
                                                    </h3>
                                                    <p className="text-white/80 text-sm truncate">{job?.job_title || 'No position'}</p>
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
                                        {/* Contact Information */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span className="truncate">{seeker?.email || seeker?.user?.email || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>{seeker?.contact_number || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span className="truncate">{seekerAddress || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>Applied {formatDate(application.applied_at || application.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Interview Info */}
                                        {interview && interview.status === 'scheduled' && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-1">
                                                    <CalendarCheck className="h-4 w-4" />
                                                    Interview Scheduled
                                                </div>
                                                <p className="text-xs text-blue-600">
                                                    {formatDate(interview.scheduled_date)} at {formatTime(interview.scheduled_time)}
                                                </p>
                                                {interview.location && (
                                                    <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                                                        <MapPinned className="h-3 w-3" /> {interview.location}
                                                    </p>
                                                )}
                                                {interview.meeting_link && (
                                                    <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs text-blue-500 flex items-center gap-1 mt-1 hover:text-blue-700">
                                                        <Video className="h-3 w-3" /> Online Meeting
                                                    </a>
                                                )}
                                            </div>
                                        )}

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
                                                onClick={() => handleOpenResume(application)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                                            >
                                                <FileText className="h-4 w-4" />
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
                                                onClick={() => handleOpenInterview(application)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <CalendarCheck className="h-4 w-4" />
                                                Set Interview
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
                                onClick={() => { setIsViewModalOpen(false); setSelectedApplication(null); }}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {(() => {
                                const seeker = selectedApplication.seeker_profile || selectedApplication.jobSeeker;
                                const job = selectedApplication.job;
                                const appStatus = getApplicationStatus(selectedApplication);
                                const statusBadge = getStatusColor(appStatus);
                                const statusIcon = getStatusIcon(appStatus);
                                const statusLabel = getStatusLabel(appStatus);
                                const firstInitial = seeker?.first_name?.[0] ?? '';
                                const lastInitial = seeker?.last_name?.[0] ?? '';
                                const barangayName = seeker?.barangay?.barangay_name || seeker?.barangay_name || '';
                                const interview = selectedApplication.interview;

                                return (
                                    <div className="space-y-6">
                                        {/* Profile Header */}
                                        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                                            <div className="relative h-20 w-20 shrink-0">
                                                {seeker?.photo_url ? (
                                                    <img
                                                        src={seeker.photo_url}
                                                        alt={`${seeker.first_name} ${seeker.last_name}`}
                                                        className="h-20 w-20 rounded-full object-cover shadow-lg border-2 border-blue-200"
                                                    />
                                                ) : (
                                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                        {firstInitial}{lastInitial}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-2xl font-bold text-slate-800 truncate">
                                                    {seeker?.first_name} {seeker?.middle_name ? seeker.middle_name + ' ' : ''}{seeker?.last_name}
                                                </h4>
                                                <p className="text-slate-500 truncate">{job?.job_title}</p>
                                                <div className={`flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-semibold border w-fit ${statusBadge}`}>
                                                    {statusIcon}
                                                    <span>{statusLabel}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Personal Information */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Personal Information</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.email || seeker?.user?.email)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contact Number</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.contact_number)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p>
                                                    <p className="text-sm font-medium text-slate-800">{seeker?.birthdate ? formatDate(seeker.birthdate) : 'Not Provided'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Age</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.age)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sex</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.sex)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Civil Status</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.civil_status)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Barangay</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(barangayName)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">City/Municipality</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.barangay?.municipality)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Province</p>
                                                    <p className="text-sm font-medium text-slate-800">Not Provided</p>
                                                </div>
                                                <div className="md:col-span-2 lg:col-span-3">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Complete Address</p>
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {seeker?.address && barangayName
                                                            ? `${seeker.address}, ${barangayName}${seeker?.barangay?.municipality ? `, ${seeker.barangay.municipality}` : ''}`
                                                            : (seeker?.address || barangayName ? (seeker?.address || '') + (barangayName ? `, ${barangayName}` : '') : 'Not Provided')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Skills</h5>
                                            {seeker?.skills && (Array.isArray(seeker.skills) ? seeker.skills.length > 0 : (typeof seeker.skills === 'string' && seeker.skills.trim())) ? (
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
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">Not Provided</p>
                                            )}
                                        </div>

                                        {/* Educational Background */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Educational Background</h5>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span className="text-sm text-slate-700">{displayValue(seeker?.educational_attainment)}</span>
                                            </div>
                                        </div>

                                        {/* Work Experience */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Work Experience</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-slate-500">Current Occupation</p>
                                                    <p className="text-sm text-slate-700 font-medium">{displayValue(seeker?.occupation)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Employer</p>
                                                    <p className="text-sm text-slate-700 font-medium">{displayValue(seeker?.employer_company)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Years of Experience</p>
                                                    <p className="text-sm text-slate-700 font-medium">{displayValue(seeker?.work_experience_years)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Employment Status</p>
                                                    <p className="text-sm text-slate-700 font-medium">{displayValue(seeker?.employment_status)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Certifications & Training</h5>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">TESDA NC Certificates</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.tesda_nc_certificates)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Other Trainings</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.other_trainings)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Professional Licenses</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.professional_licenses)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Preferences */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Job Preferences</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Preferred Job / Occupation</p>
                                                    <p className="text-sm font-medium text-slate-800">{displayValue(seeker?.preferred_job)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Willing to Work Outside Municipality</p>
                                                    <p className="text-sm font-medium text-slate-800">{seeker?.willing_outside_municipality ? 'Yes' : 'No'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Willing to Work Abroad</p>
                                                    <p className="text-sm font-medium text-slate-800">{seeker?.willing_abroad ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Application Details */}
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h5 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Application Details</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-slate-500">Applied Job</p>
                                                    <p className="text-sm text-slate-700 font-medium">{displayValue(job?.job_title)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Date Applied</p>
                                                    <p className="text-sm text-slate-700 font-medium">{formatDate(selectedApplication.applied_at || selectedApplication.created_at)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Expected Salary</p>
                                                    <p className="text-sm text-slate-700 font-medium">{displayValue(selectedApplication.expected_salary)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Preferred Start Date</p>
                                                    <p className="text-sm text-slate-700 font-medium">{selectedApplication.start_date ? formatDate(selectedApplication.start_date) : 'Not Provided'}</p>
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

                                        {/* Interview Details */}
                                        {interview && interview.status === 'scheduled' && (
                                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                <h5 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <CalendarCheck className="h-4 w-4" />
                                                    Interview Schedule
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-xs text-blue-500">Date</p>
                                                        <p className="text-sm text-blue-800 font-medium">{formatDate(interview.scheduled_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-blue-500">Time</p>
                                                        <p className="text-sm text-blue-800 font-medium">{formatTime(interview.scheduled_time)}</p>
                                                    </div>
                                                    {interview.location && (
                                                        <div>
                                                            <p className="text-xs text-blue-500">Location</p>
                                                            <p className="text-sm text-blue-800 font-medium flex items-center gap-1">
                                                                <MapPinned className="h-3.5 w-3.5" /> {interview.location}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {interview.meeting_link && (
                                                        <div>
                                                            <p className="text-xs text-blue-500">Meeting Link</p>
                                                            <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
                                                                <Video className="h-3.5 w-3.5" /> Join Meeting <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                    {interview.notes && (
                                                        <div className="md:col-span-2">
                                                            <p className="text-xs text-blue-500">Notes</p>
                                                            <p className="text-sm text-blue-800">{interview.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsViewModalOpen(false); setSelectedApplication(null); }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resume Viewer Modal */}
            {isResumeModalOpen && resumeApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setIsResumeModalOpen(false); setResumeApplication(null); setResumeHtml(null); setResumeError(null); }}>
                    <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-slate-500" />
                                <h3 className="font-semibold text-slate-900">Resume Preview</h3>
                                <span className="text-sm text-slate-500">
                                    — {(resumeApplication.seeker_profile || resumeApplication.jobSeeker)?.first_name} {(resumeApplication.seeker_profile || resumeApplication.jobSeeker)?.last_name}
                                </span>
                            </div>
                            <button onClick={() => { setIsResumeModalOpen(false); setResumeApplication(null); setResumeHtml(null); setResumeError(null); }} className="p-1 rounded-lg hover:bg-slate-100">
                                <XCircle className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                            {resumeLoading && (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            )}
                            {resumeError && (
                                <div className="flex items-center justify-center py-20 text-red-600">
                                    <AlertCircle className="h-5 w-5 mr-2" /> {resumeError}
                                </div>
                            )}
                            {resumeHtml && (
                                <div className="bg-white shadow-sm mx-auto" style={{ maxWidth: '210mm' }}>
                                    <iframe
                                        srcDoc={resumeHtml}
                                        className="w-full border-0"
                                        style={{ minHeight: '297mm', height: 'auto' }}
                                        title="Resume Preview"
                                    />
                                </div>
                            )}
                            {!resumeLoading && !resumeError && !resumeHtml && !resumeApplication.resume_url && (
                                <div className="flex flex-col items-center justify-center h-[300px] rounded-lg border border-dashed border-slate-300 bg-white">
                                    <FileText className="h-16 w-16 text-slate-300 mb-4" />
                                    <p className="text-sm text-slate-500 font-medium">No resume available for preview.</p>
                                    <p className="text-xs text-slate-400 mt-1">This applicant has not uploaded a resume.</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
                            {resumeTemplateName ? (
                                <span className="text-sm text-slate-500 capitalize">
                                    Template: {resumeTemplateName.replace(/-/g, ' ')}
                                </span>
                            ) : (
                                <span />
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setIsResumeModalOpen(false); setResumeApplication(null); setResumeHtml(null); setResumeError(null); }}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Close
                                </button>
                                {resumeApplication.resume_url && (
                                    <a
                                        href={resumeApplication.resume_url}
                                        download
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Scheduling Modal */}
            {isInterviewModalOpen && interviewApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5" />
                                Schedule Interview
                            </h3>
                            <button
                                onClick={() => { setIsInterviewModalOpen(false); setInterviewApplication(null); interviewForm.reset(); }}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={submitInterviewSchedule} className="p-6 space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="font-medium text-slate-800">
                                    {(interviewApplication.seeker_profile || interviewApplication.jobSeeker)?.first_name} {(interviewApplication.seeker_profile || interviewApplication.jobSeeker)?.last_name}
                                </p>
                                <p className="text-sm text-slate-600">{interviewApplication.job?.job_title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        value={interviewForm.data.scheduled_date}
                                        onChange={e => interviewForm.setData('scheduled_date', e.target.value)}
                                        min={today}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                    {interviewForm.errors.scheduled_date && (
                                        <p className="mt-1 text-sm text-red-600">{interviewForm.errors.scheduled_date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                                    <input
                                        type="time"
                                        value={interviewForm.data.scheduled_time}
                                        onChange={e => interviewForm.setData('scheduled_time', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                    {interviewForm.errors.scheduled_time && (
                                        <p className="mt-1 text-sm text-red-600">{interviewForm.errors.scheduled_time}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type *</label>
                                <div className="flex gap-3">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        interviewForm.data.interview_type === 'on-site'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="interview_type"
                                            value="on-site"
                                            checked={interviewForm.data.interview_type === 'on-site'}
                                            onChange={e => interviewForm.setData('interview_type', e.target.value)}
                                            className="sr-only"
                                        />
                                        <Building2 className="h-5 w-5" />
                                        <span className="font-medium text-sm">On-site</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        interviewForm.data.interview_type === 'online'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="interview_type"
                                            value="online"
                                            checked={interviewForm.data.interview_type === 'online'}
                                            onChange={e => interviewForm.setData('interview_type', e.target.value)}
                                            className="sr-only"
                                        />
                                        <Video className="h-5 w-5" />
                                        <span className="font-medium text-sm">Online</span>
                                    </label>
                                </div>
                                {interviewForm.errors.interview_type && (
                                    <p className="mt-1 text-sm text-red-600">{interviewForm.errors.interview_type}</p>
                                )}
                            </div>

                            {interviewForm.data.interview_type === 'on-site' ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                                    <div className="relative">
                                        <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={interviewForm.data.location}
                                            onChange={e => interviewForm.setData('location', e.target.value)}
                                            placeholder="e.g., PESO Office, 2nd Floor Municipal Hall"
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    {interviewForm.errors.location && (
                                        <p className="mt-1 text-sm text-red-600">{interviewForm.errors.location}</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link *</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="url"
                                            value={interviewForm.data.meeting_link}
                                            onChange={e => interviewForm.setData('meeting_link', e.target.value)}
                                            placeholder="e.g., https://meet.google.com/xxx-xxxx-xxx"
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    {interviewForm.errors.meeting_link && (
                                        <p className="mt-1 text-sm text-red-600">{interviewForm.errors.meeting_link}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={interviewForm.data.notes}
                                    onChange={e => interviewForm.setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Additional instructions or notes for the applicant..."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                {interviewForm.errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{interviewForm.errors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsInterviewModalOpen(false); setInterviewApplication(null); interviewForm.reset(); }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={interviewForm.processing}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <CalendarCheck className="h-4 w-4" />
                                    {interviewForm.processing ? 'Scheduling...' : 'Schedule Interview'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {selectedApplication && !isViewModalOpen && !isResumeModalOpen && !isInterviewModalOpen && (
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
                                        {(selectedApplication.seeker_profile || selectedApplication.jobSeeker)?.first_name} {(selectedApplication.seeker_profile || selectedApplication.jobSeeker)?.last_name}
                                    </p>
                                    <p className="text-sm text-slate-600">{(selectedApplication.seeker_profile || selectedApplication.jobSeeker)?.email || (selectedApplication.seeker_profile || selectedApplication.jobSeeker)?.user?.email}</p>
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
                                    <option value="interview_scheduled">Interview Scheduled</option>
                                    <option value="approved">Approved</option>
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