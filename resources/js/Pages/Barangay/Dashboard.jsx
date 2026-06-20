import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Briefcase,
    FileCheck,
    TrendingUp,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Building2,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

export default function BarangayDashboard({ barangay, statistics, recentJobSeekers, recentApplications }) {
    const statCards = [
        {
            title: 'Total Registered Job Seekers',
            value: statistics.totalJobSeekers,
            icon: Users,
            color: 'bg-blue-500',
            change: '+12',
            changeType: 'positive'
        },
        {
            title: 'Total Referred Applicants',
            value: statistics.totalApplications,
            icon: Briefcase,
            color: 'bg-green-500',
            change: '+8',
            changeType: 'positive'
        },
        {
            title: 'Active Job Vacancies',
            value: statistics.activeJobs,
            icon: FileCheck,
            color: 'bg-amber-500',
            change: '+3',
            changeType: 'positive'
        },
        {
            title: 'Employment Rate',
            value: '24%',
            icon: TrendingUp,
            color: 'bg-purple-500',
            change: '+5%',
            changeType: 'positive'
        }
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'hired':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'rejected':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'interview':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'hired':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'interview':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Barangay Dashboard
                </h2>
            }
        >
            <Head title="Barangay Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white shadow-lg sm:px-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">Welcome to {barangay?.barangay_name || 'Your Barangay'} Portal</h3>
                                <p className="mt-2 text-blue-100">
                                    Manage barangay employment records and monitor local job seekers efficiently.
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{barangay?.municipality || 'Municipality'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{barangay?.contact_email || 'contact@barangay.gov'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <span>{barangay?.contact_number || '+63 XXX XXX XXXX'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500">{stat.title}</p>
                                            <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                                            <div className={`flex items-center gap-1 text-xs ${
                                                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                <span>{stat.change}</span>
                                                <span>vs last month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="mb-8">
                        <h4 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Link
                                href={route('barangay.job-seekers')}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-green-600" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">View Job Seekers</h5>
                                    <p className="mt-1 text-sm text-slate-500">Manage registered job seekers</p>
                                </div>
                            </Link>

                            <Link
                                href={route('barangay.residents')}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">Manage Residents</h5>
                                    <p className="mt-1 text-sm text-slate-500">View and edit resident records</p>
                                </div>
                            </Link>

                            <Link
                                href={route('barangay.job-referrals')}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                                        <Briefcase className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-purple-600" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">Job Referrals</h5>
                                    <p className="mt-1 text-sm text-slate-500">Track referral status</p>
                                </div>
                            </Link>

                            <Link
                                href={route('barangay.local-jobs')}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                        <FileCheck className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">Local Job Vacancies</h5>
                                    <p className="mt-1 text-sm text-slate-500">View available jobs</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Job Seekers Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-900">Recent Job Seekers</h4>
                            <Link
                                href={route('barangay.job-seekers')}
                                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="divide-y divide-slate-200">
                                {recentJobSeekers.length > 0 ? (
                                    recentJobSeekers.map((seeker) => (
                                        <div key={seeker.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {seeker.first_name} {seeker.last_name}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {seeker.educational_attainment || 'Education not specified'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(seeker.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                        <p>No job seekers registered yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Applications Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-900">Recent Applications</h4>
                            <Link
                                href={route('barangay.job-referrals')}
                                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="divide-y divide-slate-200">
                                {recentApplications.length > 0 ? (
                                    recentApplications.map((application) => (
                                        <div key={application.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {application.jobSeeker?.first_name} {application.jobSeeker?.last_name}
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            {getStatusIcon(application.status)}
                                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(application.status)}`}>
                                                                {application.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Applied for: {application.job?.job_title || 'Unknown Position'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(application.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <Briefcase className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                        <p>No applications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Registered Residents</p>
                                    <p className="text-xs text-slate-500">{statistics.totalJobSeekers} residents in database</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <Briefcase className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Job Referrals Made</p>
                                    <p className="text-xs text-slate-500">{statistics.totalApplications} total referrals</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Employment Success</p>
                                    <p className="text-xs text-slate-500">Track hiring progress</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}
