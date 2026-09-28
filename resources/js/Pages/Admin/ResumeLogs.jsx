import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head } from '@inertiajs/react';
import { Clock, User, FileText, Download, RefreshCw, Trash2 } from 'lucide-react';

export default function ResumeLogs({ logs }) {
    const getActionIcon = (action) => {
        switch (action) {
            case 'generated': return <FileText className="h-4 w-4 text-green-600" />;
            case 'regenerated': return <RefreshCw className="h-4 w-4 text-blue-600" />;
            case 'downloaded': return <Download className="h-4 w-4 text-purple-600" />;
            case 'deleted': return <Trash2 className="h-4 w-4 text-red-600" />;
            default: return <Clock className="h-4 w-4 text-slate-600" />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'generated': return 'bg-green-50 border-green-200';
            case 'regenerated': return 'bg-blue-50 border-blue-200';
            case 'downloaded': return 'bg-purple-50 border-purple-200';
            case 'deleted': return 'bg-red-50 border-red-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    return (
        <AdminLayouts
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Resume Activity Logs
                </h2>
            }
        >
            <Head title="Resume Logs" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Activity History</h3>
                            <p className="text-sm text-slate-500">Track all resume generation and download activities.</p>
                        </div>

                        {logs.data?.length > 0 ? (
                            <div className="space-y-4">
                                {logs.data.map((log) => (
                                    <div key={log.id} className={`rounded-lg border p-4 ${getActionColor(log.action)}`}>
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                                                {getActionIcon(log.action)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">{log.description}</p>
                                                <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {log.user?.name || 'System'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {log.created_at}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="rounded bg-white px-2 py-1 text-xs font-medium capitalize text-slate-600">
                                                {log.action}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                                <Clock className="mx-auto h-12 w-12 text-slate-300" />
                                <p className="mt-4 text-sm font-medium text-slate-500">No activity logs found</p>
                                <p className="text-xs text-slate-400">Resume activities will appear here.</p>
                            </div>
                        )}

                        {logs.links && (
                            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                                <div className="text-sm text-slate-500">
                                    Showing {logs.from || 0} to {logs.to || 0} of {logs.total || 0} entries
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayouts>
    );
}
