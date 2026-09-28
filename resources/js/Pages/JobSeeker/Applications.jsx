import { Head, Link } from '@inertiajs/react';
import { Briefcase, Building2, Calendar, ChevronRight } from 'lucide-react';

export default function Applications({ applications, seekerData }) {
    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        reviewed: 'bg-blue-100 text-blue-800',
        shortlisted: 'bg-purple-100 text-purple-800',
        interview_scheduled: 'bg-indigo-100 text-indigo-800',
        hired: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    return (
        <>
            <Head title="My Applications" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">My Applications</h2>
                        <p className="mt-1 text-sm text-slate-500">Track your job applications</p>
                    </div>

                    <div className="space-y-4">
                        {applications?.data?.length > 0 ? (
                            applications.data.map((app) => (
                                <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-5 w-5 text-blue-600" />
                                                <h3 className="font-semibold text-slate-900">{app.job?.job_title || 'Unknown Position'}</h3>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-4 w-4" />
                                                    {app.job?.establishment?.company_name || app.establishment?.company_name || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {app.applied_at || app.created_at || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[app.status] || 'bg-slate-100 text-slate-800'}`}>
                                                {app.status ? app.status.replace(/_/g, ' ') : 'Pending'}
                                            </span>
                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                                <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
                                <h3 className="mt-4 text-lg font-medium text-slate-900">No Applications Yet</h3>
                                <p className="mt-2 text-sm text-slate-500">You haven't applied to any jobs yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
