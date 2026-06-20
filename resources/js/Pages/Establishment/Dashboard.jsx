import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    Briefcase,
    Users,
    FileCheck,
    TrendingUp,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Building2,
    Mail,
    Phone
} from 'lucide-react';

export default function EstablishmentDashboard({ statistics, recentApplicants: recentApplicantsProp, establishment }) {
    const statCards = [
        {
            title: 'Total Job Vacancies',
            value: statistics?.total_jobs?.toString() ?? '0',
            icon: Briefcase,
            color: 'bg-blue-500',
            change: '+0',
            changeType: 'positive'
        },
        {
            title: 'Total Applicants',
            value: statistics?.total_applicants?.toString() ?? '0',
            icon: Users,
            color: 'bg-green-500',
            change: '+0',
            changeType: 'positive'
        },
        {
            title: 'Pending Applications',
            value: statistics?.pending?.toString() ?? '0',
            icon: Clock,
            color: 'bg-amber-500',
            change: '+0',
            changeType: 'positive'
        },
        {
            title: 'Hired Applicants',
            value: statistics?.hired?.toString() ?? '0',
            icon: CheckCircle,
            color: 'bg-purple-500',
            change: '+0',
            changeType: 'positive'
        }
    ];

    const recentApplicants = recentApplicantsProp ?? [];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'hired':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'rejected':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
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
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <EstablishmentLayouts
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Establishment Dashboard
                </h2>
            }
        >
            <Head title="Establishment Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white shadow-lg sm:px-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">Welcome, {establishment?.company_name ?? 'Your Company'}</h3>
                                <p className="mt-2 text-blue-100">
                                    Manage your job postings and track applicants efficiently.
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{establishment?.email ?? 'N/A'}</span>
                                    </div>
                                    {establishment?.contact_number && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span>{establishment.contact_number}</span>
                                        </div>
                                    )}
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
                                href={route('establishment.jobs')}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                                        <Briefcase className="h-6 w-6 text-green-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-green-600" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">Post New Job</h5>
                                    <p className="mt-1 text-sm text-slate-500">Create a new job vacancy</p>
                                </div>
                            </Link>

                            <Link
                                href={route('establishment.applicants')}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">View Applicants</h5>
                                    <p className="mt-1 text-sm text-slate-500">Review job applications</p>
                                </div>
                            </Link>

                            <Link
                                href={route('establishment.profile')}
                                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                                        <Building2 className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-purple-600" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">Company Profile</h5>
                                    <p className="mt-1 text-sm text-slate-500">Update company information</p>
                                </div>
                            </Link>

                            <div className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                        <TrendingUp className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-900">Analytics</h5>
                                    <p className="mt-1 text-sm text-slate-500">View hiring statistics</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Applicants Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-900">Recent Applicants</h4>
                            <Link
                                href={route('establishment.applicants')}
                                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="divide-y divide-slate-200">
                                {recentApplicants.map((applicant) => (
                                    <div key={applicant.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {applicant.name}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(applicant.status)}
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(applicant.status)}`}>
                                                            {applicant.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Applied for: {applicant.jobTitle}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(applicant.appliedDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Active Job Posts</p>
                                    <p className="text-xs text-slate-500">8 jobs currently open</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">New Applicants</p>
                                    <p className="text-xs text-slate-500">12 applicants this week</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Hiring Rate</p>
                                    <p className="text-xs text-slate-500">16.7% conversion rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
