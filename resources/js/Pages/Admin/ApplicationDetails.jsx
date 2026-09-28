
import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Briefcase, User, Calendar, Clock, FileText, Mail, Phone, MapPin } from 'lucide-react';

export default function ApplicationDetails({ application }) {
    const statusColors = {
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
        shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
        interview_scheduled: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        hired: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    const getStatusColor = (status) => statusColors[status] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
        <AdminLayouts
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Application Details
                </h2>
            }
        >
            <Head title="Application Details" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('admin.applications')} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Applications
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">Application Information</h3>
                                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Status</dt>
                                        <dd className="mt-1">
                                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(application.status)}`}>
                                                {application.status ? application.status.replace(/_/g, ' ') : 'Pending'}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Applied Date</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{application.applied_at || application.application_date || 'N/A'}</dd>
                                    </div>
                                    {application.remarks && (
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-slate-500">Remarks</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{application.remarks}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">Job Details</h3>
                                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-slate-500">Job Title</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900">{application.job?.job_title || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Employment Type</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{application.job?.employment_type || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Salary Range</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{application.job?.salary_range || 'N/A'}</dd>
                                    </div>
                                    {application.job?.description && (
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-slate-500">Description</dt>
                                            <dd className="mt-1 text-sm text-slate-700">{application.job.description}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">Applicant</h3>
                                {application.jobSeeker ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                                                {application.jobSeeker.first_name?.charAt(0)}{application.jobSeeker.last_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{application.jobSeeker.first_name} {application.jobSeeker.last_name}</p>
                                                <p className="text-xs text-slate-500">Job Seeker</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Mail className="h-4 w-4" />
                                                {application.jobSeeker.email || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone className="h-4 w-4" />
                                                {application.jobSeeker.contact_number || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="h-4 w-4" />
                                                {application.jobSeeker.address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No applicant data available.</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-slate-900">Establishment</h3>
                                {application.job?.establishment ? (
                                    <div className="space-y-2 text-sm">
                                        <p className="font-semibold text-slate-900">{application.job.establishment.company_name}</p>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="h-4 w-4" />
                                            {application.job.establishment.email || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="h-4 w-4" />
                                            {application.job.establishment.contact_number || 'N/A'}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No establishment data available.</p>
                                )}
                            </div>

                            {application.resume && (
                                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <a href={route('admin.applications.download-resume', application.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                        <FileText className="h-4 w-4" />
                                        Download Resume
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayouts>
    );
}
