import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    BriefcaseBusiness,
    Check,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Mail,
    MapPin,
    Phone,
    Search,
    User,
    X,
    XCircle,
} from 'lucide-react';

const STATUS_META = {
    pending: {
        label: 'Pending',
        pill: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-500',
        card: 'border-amber-200 bg-amber-50',
        value: 'text-amber-700',
    },
    approved: {
        label: 'Approved',
        pill: 'bg-green-100 text-green-700',
        dot: 'bg-green-500',
        card: 'border-green-200 bg-green-50',
        value: 'text-green-700',
    },
    rejected: {
        label: 'Rejected',
        pill: 'bg-red-100 text-red-700',
        dot: 'bg-red-500',
        card: 'border-red-200 bg-red-50',
        value: 'text-red-700',
    },
};

const FILTERS = [
    { key: 'all', label: 'All Agencies' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
];

const statusMeta = (status) => STATUS_META[status] || STATUS_META.pending;

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
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

const initials = (name) =>
    (name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

function StatusBadge({ status }) {
    const meta = statusMeta(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${meta.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
}

function CountCard({ label, value, meta, active, onClick }) {
    const tone = meta || {};
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-left rounded-xl border p-4 shadow-sm transition-all ${
                active ? `${tone.card} ring-2 ring-offset-1 ring-slate-300` : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
        >
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${tone.value || 'text-slate-800'}`}>{value}</p>
        </button>
    );
}

export default function Agencies() {
    const { agencies, counts, filters, flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [confirm, setConfirm] = useState(null); // { type, agency }
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const agencyList = agencies?.data || [];
    const pagination = agencies;
    const activeStatus = filters?.status || 'all';

    useEffect(() => {
        setSearch(filters?.search || '');
    }, [filters?.search]);

    const applyFilters = (overrides = {}) => {
        router.get(
            route('admin.agencies'),
            { status: activeStatus, search: search.trim(), ...overrides },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const openConfirm = (type, agency) => {
        setReason(agency.rejection_reason || '');
        setConfirm({ type, agency });
    };

    const closeConfirm = () => {
        setConfirm(null);
        setReason('');
    };

    const submitConfirm = () => {
        if (!confirm) return;

        setProcessing(true);

        const url =
            confirm.type === 'approve'
                ? route('admin.agencies.approve', confirm.agency.id)
                : route('admin.agencies.reject', confirm.agency.id);

        router.post(
            url,
            confirm.type === 'reject' ? { rejection_reason: reason.trim() || null } : {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeConfirm();
                    setProcessing(false);
                    router.reload({ only: ['agencies', 'counts', 'pendingAgencyCount'] });
                },
                onError: () => setProcessing(false),
                onFinish: () => setProcessing(false),
            }
        );
    };

    const links = pagination?.links || [];
    const pageLinks = links.length > 3 ? links.slice(1, -1) : [];

    return (
        <AdminLayouts>
            <Head title="Agency Accounts" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0" /> {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
                            <XCircle className="h-4 w-4 shrink-0" /> {flash.error}
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Agency Accounts</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Review and approve agency registrations. New agencies stay locked out of the
                                agency portal until approved.
                            </p>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                applyFilters();
                            }}
                            className="flex items-center gap-2"
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search name, email, permit no."
                                    className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Counts */}
                    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <CountCard
                            label="Total Agencies"
                            value={counts?.total ?? 0}
                            active={activeStatus === 'all'}
                            onClick={() => applyFilters({ status: 'all' })}
                        />
                        <CountCard
                            label="Pending Approval"
                            value={counts?.pending ?? 0}
                            meta={STATUS_META.pending}
                            active={activeStatus === 'pending'}
                            onClick={() => applyFilters({ status: 'pending' })}
                        />
                        <CountCard
                            label="Approved"
                            value={counts?.approved ?? 0}
                            meta={STATUS_META.approved}
                            active={activeStatus === 'approved'}
                            onClick={() => applyFilters({ status: 'approved' })}
                        />
                        <CountCard
                            label="Rejected"
                            value={counts?.rejected ?? 0}
                            meta={STATUS_META.rejected}
                            active={activeStatus === 'rejected'}
                            onClick={() => applyFilters({ status: 'rejected' })}
                        />
                    </div>

                    {/* Filter tabs */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() => applyFilters({ status: filter.key })}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                                    activeStatus === filter.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {[
                                            'ID',
                                            'Agency Name',
                                            'Registration / Permit No.',
                                            'Contact Person',
                                            'Email Address',
                                            'Contact Number',
                                            'Address',
                                            'Registration Date',
                                            'Account Status',
                                            'Actions',
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {agencyList.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-4 py-16 text-center">
                                                <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" />
                                                <p className="mt-3 text-sm font-semibold text-slate-600">No agency accounts found</p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {activeStatus === 'all' && !search
                                                        ? 'Agency registrations will appear here as they are submitted.'
                                                        : 'Try a different status filter or search term.'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}

                                    {agencyList.map((agency, index) => {
                                        const isPending = agency.status === 'pending';
                                        const isApproved = agency.status === 'approved';

                                        return (
                                            <tr
                                                key={agency.id}
                                                className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                        #{agency.id}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                            {initials(agency.agency_name)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                                {agency.agency_name}
                                                            </p>
                                                            {agency.user?.is_active === false && (
                                                                <p className="text-xs text-red-500">Login deactivated</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {agency.license_number || '—'}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-600">{agency.contact_person}</td>

                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                        {agency.email}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        {agency.contact_number || '—'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-600 max-w-[16rem]">
                                                    <span className="inline-flex items-start gap-1.5">
                                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                        <span className="truncate" title={agency.address || ''}>
                                                            {agency.address || '—'}
                                                        </span>
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                                    {formatDate(agency.created_at)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <StatusBadge status={agency.status} />
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                        <Link
                                                            href={route('admin.agencies.show', agency.id)}
                                                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                                        >
                                                            View
                                                        </Link>

                                                        {!isApproved && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openConfirm('approve', agency)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                                Approve
                                                            </button>
                                                        )}

                                                        {!isPending && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openConfirm('reject', agency)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pageLinks.length > 0 && (
                            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs text-slate-500">
                                    Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total ?? 0}
                                </p>
                                <div className="flex items-center gap-1">
                                    {pagination.links.map((link, index) =>
                                        index === 0 || index === links.length - 1 ? (
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-300"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ) : (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                                    link.active
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Approve / Reject confirmation dialog */}
            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 text-center">
                            <div
                                className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                                    confirm.type === 'approve' ? 'bg-green-100' : 'bg-red-100'
                                }`}
                            >
                                {confirm.type === 'approve' ? (
                                    <CheckCircle className="h-7 w-7 text-green-600" />
                                ) : (
                                    <AlertTriangle className="h-7 w-7 text-red-600" />
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                {confirm.type === 'approve' ? 'Approve Agency Account' : 'Reject Agency Account'}
                            </h3>

                            <p className="text-sm text-slate-500 mb-1">
                                {confirm.type === 'approve'
                                    ? 'The agency will be able to sign in and use the agency portal immediately.'
                                    : 'The agency will be blocked from signing in. The reason below is stored with the account.'}
                            </p>

                            <p className="text-sm font-semibold text-slate-700">"{confirm.agency.agency_name}"</p>
                            <p className="text-xs text-slate-400 mt-1">{confirm.agency.email}</p>

                            {confirm.type === 'reject' && (
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
                                        placeholder="e.g. Permit number could not be verified."
                                        className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                disabled={processing}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitConfirm}
                                disabled={processing}
                                className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                                    confirm.type === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {processing
                                    ? 'Saving...'
                                    : confirm.type === 'approve'
                                      ? 'Yes, Approve'
                                      : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
