import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    FileText, Download,
    Search, CheckCircle, XCircle, AlertCircle,
    Eye, Clock,
    Loader2, Palette, FileDown, History, Printer
} from 'lucide-react';

const statusBadge = (status, statusLabels, statusColors) => {
    const label = statusLabels?.[status] ?? status;
    const color = statusColors?.[status] ?? 'slate';
    const colors = {
        slate: 'bg-slate-50 text-slate-700 border-slate-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        teal: 'bg-teal-50 text-teal-700 border-teal-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[color] ?? colors.slate}`}>
            {status === 'draft' || status === 'pending' ? <Clock className="h-3 w-3" /> :
             status === 'downloaded' ? <FileDown className="h-3 w-3" /> :
             status === 'updated' ? <RefreshCw className="h-3 w-3" /> :
             status === 'generated' || status === 'ready_for_download' ? <CheckCircle className="h-3 w-3" /> :
             <FileText className="h-3 w-3" />}
            {label}
        </span>
    );
};

export default function AdminResumes({
    resumes, templates, logs, stats,
    statusLabels, statusColors, allStatuses
}) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const filteredResumes = resumes?.data?.filter(r => {
        const matchesSearch = !searchTerm ||
            r.resume_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.job_seeker?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.job_seeker?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) ?? [];

    const openPreview = async (seekerId, template, resume) => {
        setShowPreviewModal(true);
        setSelectedResume(resume);
        setPreviewLoading(true);
        setPreviewData(null);
        try {
            const response = await fetch(route('admin.resumes.preview') + `?job_seeker_id=${seekerId}&template=${template}`);
            const data = await response.json();
            if (data.html) {
                setPreviewData(data);
            } else {
                setPreviewData({ error: data.error || 'Failed to load preview' });
            }
        } catch (err) {
            setPreviewData({ error: 'Failed to load preview' });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handlePrintResume = () => {
        const iframe = document.querySelector('iframe[title="Resume Preview"]');
        if (!iframe) return;
        const printWindow = iframe.contentWindow;
        if (!printWindow) return;
        printWindow.focus();
        printWindow.print();
    };

    return (
        <AdminLayouts
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Resume Management</h2>}
        >
            <Head title="Resume Management" />
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

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 flex items-center gap-1"><FileText className="h-3 w-3" /> Total</p>
                            <p className="text-2xl font-bold text-slate-900">{stats?.total ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Generated</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.generated ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 flex items-center gap-1"><FileDown className="h-3 w-3 text-teal-500" /> Downloaded</p>
                            <p className="text-2xl font-bold text-teal-600">{stats?.downloaded ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> Draft</p>
                            <p className="text-2xl font-bold text-amber-600">{stats?.draft ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Palette className="h-3 w-3 text-blue-500" /> Templates</p>
                            <p className="text-2xl font-bold text-blue-600">{Object.keys(templates ?? {}).length}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative w-full sm:w-60">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search resumes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                {allStatuses?.map(s => (
                                    <option key={s} value={s}>{statusLabels?.[s] ?? s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Resumes Table */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Resume ID</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Job Seeker</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Template</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Generated By</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Downloads</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResumes.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                                <p>No resumes found</p>
                                            </td>
                                        </tr>
                                    )}
                                    {filteredResumes.map((resume) => (
                                        <tr key={resume.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    {resume.resume_id}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                                                        {(resume.job_seeker?.first_name?.[0] ?? '?')}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {resume.job_seeker?.first_name} {resume.job_seeker?.last_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{resume.job_seeker?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-slate-700 text-xs">{templates[resume.template] ?? resume.template}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {statusBadge(resume.status, statusLabels, statusColors)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">
                                                {resume.generated_by?.name ?? 'System'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-xs font-medium text-slate-600">{resume.download_count ?? 0}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                                {resume.generated_at ? new Date(resume.generated_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openPreview(resume.job_seeker_id, resume.template, resume)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        title="Preview"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {resumes?.links && (
                            <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    Showing {resumes.from ?? 0}-{resumes.to ?? 0} of {resumes.total ?? 0}
                                </p>
                                <div className="flex gap-1">
                                    {resumes.links?.filter(l => l.url).map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity Logs */}
                    {logs?.length > 0 && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-3 flex items-center gap-2">
                                <History className="h-4 w-4 text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-700">Recent Activity</h3>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                {logs.slice(0, 10).map((log, i) => (
                                    <div key={log.id ?? i} className="px-5 py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-xs font-medium text-slate-400">
                                                {log.action === 'generated' ? '📄' :
                                                 log.action === 'regenerated' ? '🔄' :
                                                 log.action === 'downloaded' ? '⬇️' :
                                                 log.action === 'deleted' ? '🗑️' : '📝'}
                                            </span>
                                            <span className="text-slate-700">{log.description}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>{log.user?.name ?? 'System'}</span>
                                            <span>{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>



            {/* Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPreviewModal(false)}>
                    <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-slate-500" />
                                <h3 className="font-semibold text-slate-900">Resume Preview</h3>
                                {previewData?.seeker_name && (
                                    <span className="text-sm text-slate-500">— {previewData.seeker_name}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {previewData?.html && (
                                    <>
                                        <button
                                            onClick={handlePrintResume}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            <Printer className="h-4 w-4" />
                                            Print
                                        </button>
                                        {selectedResume?.id && (
                                            <a
                                                href={route('admin.resumes.download', selectedResume.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download PDF
                                            </a>
                                        )}
                                    </>
                                )}
                                <button onClick={() => setShowPreviewModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                                    <XCircle className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                            {previewLoading && (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            )}
                            {previewData?.error && (
                                <div className="flex items-center justify-center py-20 text-red-600">
                                    <AlertCircle className="h-5 w-5 mr-2" /> {previewData.error}
                                </div>
                            )}
                            {previewData?.html && (
                                <div className="bg-white shadow-sm mx-auto" style={{ maxWidth: '210mm' }}>
                                    <iframe
                                        srcDoc={previewData.html}
                                        className="w-full border-0"
                                        style={{ minHeight: '297mm', height: 'auto' }}
                                        title="Resume Preview"
                                    />
                                </div>
                            )}
                            {previewData?.data && !previewData?.html && !previewLoading && (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <pre className="text-xs text-slate-600 whitespace-pre-wrap">{JSON.stringify(previewData.data, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                        {previewData?.template && (
                            <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between text-sm text-slate-500">
                                <span>Template: {templates[previewData.template] ?? previewData.template}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
