import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useState } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User,
    X,
} from 'lucide-react';

const STATUS_META = {
    pending: { label: 'Pending Approval', pill: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', pill: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', pill: 'bg-red-100 text-red-700' },
};

const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-0.5 break-words text-sm text-slate-700">{value || '—'}</p>
            </div>
        </div>
    );
}

export default function AgencyDetails() {
    const { agency } = usePage().props;
    const [confirm, setConfirm] = useState(null); // 'approve' | 'reject'
    const [reason, setReason] = useState(agency.rejection_reason || '');
    const [processing, setProcessing] = useState(false);

    const meta = STATUS_META[agency.status] || STATUS_META.pending;
    const isPending = agency.status === 'pending';
    const isApproved = agency.status === 'approved';

    const submit = () => {
        if (!confirm) return;

        setProcessing(true);

        const url =
            confirm === 'approve'
                ? route('admin.agencies.approve', agency.id)
                : route('admin.agencies.reject', agency.id);

        router.post(
            url,
            confirm === 'reject' ? { rejection_reason: reason.trim() || null } : {},
            {
                onSuccess: () => {
                    setConfirm(null);
                    setProcessing(false);
                },
                onError: () => setProcessing(false),
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <AdminLayouts>
            <Head title={agency.agency_name} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('admin.agencies')}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Agency Accounts
                    </Link>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                                        Agency Account #{agency.id}
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold">{agency.agency_name}</h1>
                                    <p className="mt-1 text-sm text-blue-100">{agency.email}</p>
                                </div>
                                <span className="self-start rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold">
                                    {meta.label}
                                </span>
                            </div>
                        </div>

                        {/* Review actions */}
                        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
                            {!isApproved && (
                                <button
                                    type="button"
                                    onClick={() => setConfirm('approve')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                                >
                                    <Check className="h-4 w-4" />
                                    Approve Account
                                </button>
                            )}

                            {!isPending && (
                                <button
                                    type="button"
                                    onClick={() => setConfirm('reject')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                                >
                                    <X className="h-4 w-4" />
                                    Reject Account
                                </button>
                            )}

                            {isPending && (
                                <p className="inline-flex items-center gap-2 text-sm text-amber-700">
                                    <Clock className="h-4 w-4" />
                                    This agency cannot sign in until you approve it.
                                </p>
                            )}
                        </div>

                        {/* Rejection reason */}
                        {agency.status === 'rejected' && agency.rejection_reason && (
                            <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    Rejection reason
                                </p>
                                <p className="mt-1 text-sm text-red-600">{agency.rejection_reason}</p>
                            </div>
                        )}

                        {/* Details */}
                        <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">
                            <div>
                                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                    <Building2 className="h-4 w-4" />
                                    Registration Information
                                </h2>
                                <DetailRow icon={Building2} label="Agency Name" value={agency.agency_name} />
                                <DetailRow
                                    icon={ShieldCheck}
                                    label="Registration / Permit Number"
                                    value={agency.license_number}
                                />
                                <DetailRow icon={User} label="Contact Person" value={agency.contact_person} />
                                <DetailRow icon={Mail} label="Email Address" value={agency.email} />
                                <DetailRow icon={Phone} label="Contact Number" value={agency.contact_number} />
                            </div>

                            <div>
                                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                    <MapPin className="h-4 w-4" />
                                    Address &amp; Account
                                </h2>
                                <DetailRow icon={MapPin} label="Address" value={agency.address} />
                                <DetailRow
                                    icon={MapPin}
                                    label="Barangay / City / Province"
                                    value={[agency.barangay, agency.city, agency.province].filter(Boolean).join(', ')}
                                />
                                <DetailRow icon={Clock} label="Registration Date" value={formatDateTime(agency.registered_at)} />
                                <DetailRow
                                    icon={CalendarDays}
                                    label="Account Status"
                                    value={
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${meta.pill}`}>
                                            {meta.label}
                                        </span>
                                    }
                                />
                                <DetailRow
                                    icon={CheckCircle}
                                    label="Approved On"
                                    value={formatDateTime(agency.approved_at)}
                                />
                                <DetailRow
                                    icon={AlertTriangle}
                                    label="Rejected On"
                                    value={formatDateTime(agency.rejected_at)}
                                />
                                <DetailRow icon={User} label="Reviewed By" value={agency.reviewer} />
                                <DetailRow
                                    icon={ShieldCheck}
                                    label="Login Enabled"
                                    value={agency.account_active ? 'Yes' : 'No (deactivated)'}
                                />
                            </div>
                        </div>

                        {agency.agency_type && (
                            <div className="px-6 pb-6">
                                <DetailRow icon={Building2} label="Agency Type" value={agency.agency_type} />
                            </div>
                        )}

                        {agency.description && (
                            <div className="px-6 pb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
                                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{agency.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation dialog */}
            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 text-center">
                            <div
                                className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                                    confirm === 'approve' ? 'bg-green-100' : 'bg-red-100'
                                }`}
                            >
                                {confirm === 'approve' ? (
                                    <CheckCircle className="h-7 w-7 text-green-600" />
                                ) : (
                                    <AlertTriangle className="h-7 w-7 text-red-600" />
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                {confirm === 'approve' ? 'Approve Agency Account' : 'Reject Agency Account'}
                            </h3>
                            <p className="text-sm text-slate-500 mb-1">
                                {confirm === 'approve'
                                    ? 'The agency will be able to sign in and use the agency portal immediately.'
                                    : 'The agency will be blocked from signing in. The reason below is stored with the account.'}
                            </p>
                            <p className="text-sm font-semibold text-slate-700">"{agency.agency_name}"</p>

                            {confirm === 'reject' && (
                                <div className="mt-4 text-left">
                                    <label
                                        htmlFor="rejection_reason"
                                        className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1"
                                    >
                                        Reason for rejection (optional)
                                    </label>
                                    <textarea
                                        id="rejection_reason"
                                        rows={3}
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        maxLength={1000}
                                        className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirm(null)}
                                disabled={processing}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                                    confirm === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {processing ? 'Saving...' : confirm === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
