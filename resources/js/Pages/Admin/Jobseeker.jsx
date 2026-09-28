import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useState, useEffect } from 'react';
import { Plus, X, MapPin, Building2, Home, Users, Calendar, Phone, Mail, MapPinned, ChevronLeft, ChevronRight, Eye, User, Briefcase, GraduationCap, Award, FileText, Globe, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

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

export default function Jobseeker() {
    const { jobSeekers, barangays, region, municipality, currentStatus } = usePage().props;
    const [selectedSeeker, setSelectedSeeker] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const { post, processing } = useForm();

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const statusTabs = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
    ];

    const handleStatusFilter = (status) => {
        router.get(route('admin.jobseekers'), status === 'all' ? {} : { status }, { preserveState: true });
    };

    const handleApprove = (seeker) => {
        router.post(route('admin.jobseekers.approve', seeker.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setToast({ show: true, message: 'Job Seeker approved successfully.', type: 'success' });
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"><CheckCircle className="h-3 w-3" /> Approved</span>;
            case 'rejected':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full"><XCircle className="h-3 w-3" /> Rejected</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full"><AlertTriangle className="h-3 w-3" /> Pending</span>;
        }
    };

    // Get pagination data
    const seekers = jobSeekers?.data || [];
    const pagination = jobSeekers;

    return (
        <AdminLayouts>
            <Head title="Job Seekers" />
            {/* Page Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Job Seekers</p>
                            <p className="text-2xl font-bold text-slate-800">{jobSeekers?.total || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <MapPinned className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Municipality</p>
                            <p className="text-2xl font-bold text-slate-800">{municipality}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Home className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Barangays</p>
                            <p className="text-2xl font-bold text-slate-800">{barangays?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
                <div className="px-6 py-3 flex items-center gap-2 flex-wrap">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleStatusFilter(tab.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentStatus === tab.value
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Job Seekers List</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage job seekers in {municipality}, {region}</p>
                    </div>
                </div>

                {/* Table */}
                {seekers && seekers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">ID</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Birthdate
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            Contact
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Home className="h-3.5 w-3.5" />
                                            Barangay
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {seekers.map((seeker, index) => (
                                    <tr key={seeker.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                #{seeker.id}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {seeker.first_name?.[0]}{seeker.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{seeker.first_name} {seeker.last_name}</p>
                                                    <p className="text-xs text-slate-500">Job Seeker</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{formatDate(seeker.birthdate)}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{seeker.contact_number || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                <MapPin className="h-3 w-3" />
                                                {seeker.barangay?.barangay_name || seeker.barangay_name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-slate-600">{seeker.user?.email || 'N/A'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {getStatusBadge(seeker.verification_status)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSeeker(seeker);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </button>
                                                {seeker.verification_status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleApprove(seeker)}
                                                        disabled={processing}
                                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-200/50 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-300/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Approve
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Users className="h-12 w-12 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No job seekers found</p>
                        <p className="text-slate-400 text-sm mt-1">No job seekers are currently registered in the system</p>
                    </div>
                )}

                {/* Pagination Footer */}
                {pagination?.data?.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-4">
                            {/* Info */}
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{pagination.from}</span> to <span className="font-semibold text-slate-700">{pagination.to}</span> of <span className="font-semibold text-slate-700">{pagination.total}</span> job seekers
                            </p>

                            {/* Pagination Controls */}
                            {pagination.links && pagination.links.length > 3 && (
                                <div className="flex items-center justify-center gap-1">
                                    {/* Previous Button */}
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

                                    {/* Page Numbers */}
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

                                    {/* Next Button */}
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

            
            {/* Job Seeker Detail Modal */}
            {isDetailModalOpen && selectedSeeker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Job Seeker Details</h3>
                                    <p className="text-blue-100 text-sm">{selectedSeeker.first_name} {selectedSeeker.last_name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    setSelectedSeeker(null);
                                }}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Personal Information Section */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Full Name</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {selectedSeeker.first_name} {selectedSeeker.middle_name} {selectedSeeker.last_name}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p>
                                        <p className="text-sm font-semibold text-slate-800">{formatDate(selectedSeeker.birthdate)}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Age</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.age || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sex</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.sex || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Civil Status</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.civil_status || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contact Number</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.contact_number || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.email || selectedSeeker.user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Barangay</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.barangay?.barangay_name || selectedSeeker.barangay_name || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg md:col-span-2">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Address</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Education Section */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-green-600" />
                                    Education
                                </h4>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Educational Attainment</p>
                                    <p className="text-sm font-semibold text-slate-800">{selectedSeeker.educational_attainment || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Employment Section */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-purple-600" />
                                    Employment Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Employment Status</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.employment_status || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current/Previous Occupation</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.occupation || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Employer/Company</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.employer_company || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Work Experience (Years)</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.work_experience_years || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg md:col-span-2">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Preferred Job/Occupation</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedSeeker.preferred_job || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-orange-600" />
                                    Skills & Certifications
                                </h4>
                                <div className="space-y-4">
                                    {selectedSeeker.skills && selectedSeeker.skills.length > 0 && (
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSeeker.skills.map((skill, index) => (
                                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                        <CheckCircle className="h-3 w-3" />
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedSeeker.tesda_nc_certificates && (
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">TESDA/NC Certificates</p>
                                            <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{selectedSeeker.tesda_nc_certificates}</p>
                                        </div>
                                    )}
                                    {selectedSeeker.other_trainings && (
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Other Trainings Attended</p>
                                            <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{selectedSeeker.other_trainings}</p>
                                        </div>
                                    )}
                                    {selectedSeeker.professional_licenses && (
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Professional Licenses</p>
                                            <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{selectedSeeker.professional_licenses}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preferences Section */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-indigo-600" />
                                    Work Preferences
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Willing to Work Outside Municipality</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {selectedSeeker.willing_outside_municipality ? (
                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-red-600">No</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Willing to Work Abroad</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {selectedSeeker.willing_abroad ? (
                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-red-600">No</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Remarks Section */}
                            {selectedSeeker.remarks && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-slate-600" />
                                        Additional Information
                                    </h4>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Remarks / Notes</p>
                                        <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{selectedSeeker.remarks}</p>
                                    </div>
                                </div>
                            )}

                            {/* Registration Status */}
                            <div className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                        <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Registration Status</p>
                                        <p className="text-sm font-semibold text-blue-800">
                                            {selectedSeeker.is_fully_registered ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Fully Registered
                                                </span>
                                            ) : (
                                                <span className="text-orange-600">Partial Registration</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Verification</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {getStatusBadge(selectedSeeker.verification_status)}
                                        </p>
                                        {selectedSeeker.verified_by && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                Verified by: {selectedSeeker.verified_by?.name ?? 'Admin'}
                                            </p>
                                        )}
                                        {selectedSeeker.verified_at && (
                                            <p className="text-xs text-slate-400">
                                                {new Date(selectedSeeker.verified_at).toLocaleDateString()}
                                            </p>
                                        )}
                                        {selectedSeeker.verification_notes && (
                                            <p className="text-xs text-slate-500 mt-2 italic">
                                                Note: {selectedSeeker.verification_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-200/50 max-w-sm">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => setToast({ show: false, message: '', type: 'success' })}
                            className="ml-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
