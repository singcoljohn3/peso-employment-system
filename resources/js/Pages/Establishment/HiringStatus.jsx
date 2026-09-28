import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Users, Briefcase, Clock, CheckCircle, AlertCircle, Search, UserCheck,
    ChevronDown, X, Mail, Phone, Calendar, Eye, ArrowRight, Loader2
} from 'lucide-react';

const STATUS_FLOW = [
    { key: 'pending', label: 'Pending', color: 'amber', icon: Clock },
    { key: 'for interview', label: 'For Interview', color: 'blue', icon: Calendar },
    { key: 'interviewed', label: 'Interviewed', color: 'purple', icon: UserCheck },
    { key: 'hired', label: 'Hired', color: 'emerald', icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', color: 'red', icon: AlertCircle },
];

const STATUS_COLORS = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', ring: 'ring-amber-200' },
    'for interview': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 border-blue-200', ring: 'ring-blue-200' },
    interviewed: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 border-purple-200', ring: 'ring-purple-200' },
    hired: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', ring: 'ring-emerald-200' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200', ring: 'ring-red-200' },
};

function StatusBadge({ status }) {
    const s = (status || '').toLowerCase();
    const colors = STATUS_COLORS[s] || STATUS_COLORS.pending;
    const flow = STATUS_FLOW.find(f => f.key === s);
    const Icon = flow?.icon || Clock;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
            <Icon className="h-3 w-3" />
            {flow?.label || status}
        </span>
    );
}

export default function HiringStatus() {
    const { applications: initialApplications, establishment, statistics, jobs } = usePage().props;
    const [applications, setApplications] = useState(initialApplications || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const { data, setData, put, processing, errors, reset } = useForm({
        status: '',
        remarks: '',
    });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        setApplications(initialApplications || []);
    }, [initialApplications]);

    const handleStatusChange = async (applicationId, newStatus) => {
        const oldApp = applications.find(a => a.id === applicationId);
        const oldStatus = oldApp?.status;

        setApplications(prev =>
            prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a)
        );

        try {
            const response = await fetch(`/establishment/applicants/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ status: newStatus, remarks: '' }),
            });

            if (!response.ok) {
                setApplications(prev =>
                    prev.map(a => a.id === applicationId ? { ...a, status: oldStatus } : a)
                );
                const data = await response.json();
                setToast({ show: true, message: data.message || 'Failed to update status.', type: 'error' });
            } else {
                setToast({ show: true, message: `Status updated to "${STATUS_FLOW.find(f => f.key === newStatus)?.label || newStatus}".`, type: 'success' });
            }
        } catch (error) {
            setApplications(prev =>
                prev.map(a => a.id === applicationId ? { ...a, status: oldStatus } : a)
            );
            setToast({ show: true, message: 'Failed to update status. Please try again.', type: 'error' });
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = !searchTerm ||
            app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || app.status === statusFilter;
        const matchesJob = !jobFilter || app.job_id === parseInt(jobFilter);
        return matchesSearch && matchesStatus && matchesJob;
    });

    const getNextStatuses = (currentStatus) => {
        const s = (currentStatus || '').toLowerCase();
        switch (s) {
            case 'pending':
                return [{ key: 'for interview', label: 'Move to For Interview' }];
            case 'for interview':
            case 'interview':
            case 'interview_scheduled':
                return [
                    { key: 'interviewed', label: 'Mark as Interviewed' },
                    { key: 'hired', label: 'Hire Applicant' },
                    { key: 'rejected', label: 'Reject Applicant' },
                ];
            case 'interviewed':
                return [
                    { key: 'hired', label: 'Hire Applicant' },
                    { key: 'rejected', label: 'Reject Applicant' },
                ];
            case 'hired':
            case 'rejected':
                return [];
            default:
                return [{ key: 'for interview', label: 'Move to For Interview' }];
        }
    };

    return (
        <EstablishmentLayouts>
            <Head title="Hiring Status" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Hiring Status</h1>
                    <p className="text-slate-500 mt-1">Track and manage applicants through the hiring pipeline</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-3 rounded-lg">
                                <Users className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Total</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-3 rounded-lg">
                                <Clock className="h-6 w-6 text-amber-600" />
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
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">For Interview</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.for_interview || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <UserCheck className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Interviewed</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.interviewed || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Hired</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.hired || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-3 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Rejected</p>
                                <p className="text-2xl font-bold text-slate-800">{statistics?.rejected || 0}</p>
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
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm"
                            >
                                <option value="">All Statuses</option>
                                {STATUS_FLOW.map(s => (
                                    <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                            </select>
                            <select
                                value={jobFilter}
                                onChange={(e) => setJobFilter(e.target.value)}
                                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none text-sm"
                            >
                                <option value="">All Jobs</option>
                                {jobs?.map(job => (
                                    <option key={job.id} value={job.id}>{job.job_title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applicants Table */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    {filteredApplications.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Applicant</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date Applied</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredApplications.map((app) => {
                                        const nextStatuses = getNextStatuses(app.status);
                                        const colors = STATUS_COLORS[app.status] || STATUS_COLORS.pending;

                                        return (
                                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 font-bold text-sm">
                                                            {(app.applicant_name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 truncate">{app.applicant_name}</p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                {app.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{app.email}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-700">{app.job_title}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-500">{app.applied_date}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={app.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                                                            className="flex items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View
                                                        </button>
                                                        {nextStatuses.length > 0 && (
                                                            <div className="relative group">
                                                                <button
                                                                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                                                                >
                                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                                    Update
                                                                    <ChevronDown className="h-3 w-3" />
                                                                </button>
                                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 hidden group-hover:block">
                                                                    <div className="py-1">
                                                                        {nextStatuses.map((ns) => {
                                                                            const nsFlow = STATUS_FLOW.find(f => f.key === ns.key);
                                                                            const NsIcon = nsFlow?.icon || ArrowRight;
                                                                            return (
                                                                                <button
                                                                                    key={ns.key}
                                                                                    onClick={() => handleStatusChange(app.id, ns.key)}
                                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                                                >
                                                                                    <NsIcon className="h-4 w-4 text-slate-400" />
                                                                                    {ns.label}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Applicants Found</h3>
                            <p className="text-slate-500">
                                {applications.length > 0
                                    ? 'No applicants match your current filters.'
                                    : 'No applications received yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-navy-800 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Applicant Details</h3>
                            <button
                                onClick={() => { setShowDetailModal(false); setSelectedApp(null); }}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {(selectedApp.applicant_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{selectedApp.applicant_name}</h4>
                                    <p className="text-sm text-slate-500">{selectedApp.job_title}</p>
                                    <div className="mt-1">
                                        <StatusBadge status={selectedApp.status} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedApp.email || 'Not provided'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedApp.contact_number || 'Not provided'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Position</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedApp.job_title}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date Applied</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedApp.applied_date}</p>
                                    </div>
                                </div>

                                {/* Status Workflow */}
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Hiring Pipeline</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {STATUS_FLOW.map((step, i) => {
                                            const currentIdx = STATUS_FLOW.findIndex(f => f.key === (selectedApp.status || '').toLowerCase());
                                            const stepIdx = i;
                                            const isCurrent = step.key === (selectedApp.status || '').toLowerCase();
                                            const isPast = stepIdx < currentIdx && step.key !== 'rejected';
                                            const isRejected = step.key === 'rejected' && (selectedApp.status || '').toLowerCase() === 'rejected';
                                            const colors = STATUS_COLORS[step.key];

                                            return (
                                                <div key={step.key} className="flex items-center gap-2">
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                        isCurrent || isRejected
                                                            ? `${colors.bg} ${colors.text} ${colors.border}`
                                                            : isPast
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                            : 'bg-slate-100 text-slate-400 border-slate-200'
                                                    }`}>
                                                        {isPast || isCurrent ? (
                                                            <CheckCircle className="h-3 w-3" />
                                                        ) : null}
                                                        {step.label}
                                                    </div>
                                                    {i < STATUS_FLOW.length - 1 && step.key !== 'rejected' && (
                                                        <ArrowRight className="h-3 w-3 text-slate-300" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                {getNextStatuses(selectedApp.status).length > 0 && (
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <p className="text-xs text-blue-600 uppercase tracking-wider mb-3 font-semibold">Quick Actions</p>
                                        <div className="flex flex-wrap gap-2">
                                            {getNextStatuses(selectedApp.status).map((ns) => {
                                                const nsFlow = STATUS_FLOW.find(f => f.key === ns.key);
                                                const NsIcon = nsFlow?.icon || ArrowRight;
                                                const nsColors = STATUS_COLORS[ns.key];
                                                return (
                                                    <button
                                                        key={ns.key}
                                                        onClick={() => {
                                                            handleStatusChange(selectedApp.id, ns.key);
                                                            setShowDetailModal(false);
                                                            setSelectedApp(null);
                                                        }}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                                            ns.key === 'rejected'
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                                                : `${nsColors.bg} ${nsColors.text} hover:opacity-80 border ${nsColors.border}`
                                                        }`}
                                                    >
                                                        <NsIcon className="h-4 w-4" />
                                                        {ns.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-lg max-w-sm ${
                        toast.type === 'success'
                            ? 'bg-emerald-600 text-white shadow-emerald-200/50'
                            : 'bg-red-600 text-white shadow-red-200/50'
                    }`}>
                        {toast.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        )}
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
        </EstablishmentLayouts>
    );
}
