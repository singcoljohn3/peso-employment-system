import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head } from '@inertiajs/react';
import {
    Users,
    Building2,
    MapPin,
    Briefcase,
    FileCheck,
    TrendingUp,
    Bell,
    ArrowRight
} from 'lucide-react';

export default function AdminDashboard({ statistics }) {
    const quickStats = [
        { label: 'Total Job Seekers', value: statistics?.total_job_seekers?.toLocaleString() ?? '0', icon: Users, color: 'bg-blue-500' },
        { label: 'Active Employers', value: statistics?.active_employers?.toLocaleString() ?? '0', icon: Building2, color: 'bg-green-500' },
        { label: 'Job Vacancies', value: statistics?.job_vacancies?.toLocaleString() ?? '0', icon: Briefcase, color: 'bg-amber-500' },
        { label: 'New Applications', value: statistics?.new_applications?.toLocaleString() ?? '0', icon: FileCheck, color: 'bg-purple-500' },
    ];

    const quickActions = [
        {
            title: 'Job Seekers',
            description: 'Manage job seeker accounts and track applications',
            icon: Users,
            href: '#',
            color: 'text-blue-600 bg-blue-50',
        },
        {
            title: 'Establishments',
            description: 'Manage employer accounts and job postings',
            icon: Building2,
            href: '#',
            color: 'text-green-600 bg-green-50',
        },
        {
            title: 'Barangay',
            description: 'Manage barangay-level accounts and coordinators',
            icon: MapPin,
            href: '#',
            color: 'text-amber-600 bg-amber-50',
        },
        {
            title: 'Hiring Status',
            description: 'Track hiring progress and placements',
            icon: TrendingUp,
            href: '#',
            color: 'text-purple-600 bg-purple-50',
        },
        {
            title: 'Reports',
            description: 'Generate and view statistical reports',
            icon: FileCheck,
            href: '#',
            color: 'text-rose-600 bg-rose-50',
        },
        {
            title: 'Settings',
            description: 'Configure system preferences and settings',
            icon: TrendingUp,
            href: '#',
            color: 'text-slate-600 bg-slate-50',
        },
    ];
    return (
        <AdminLayouts
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    PESO Admin Dashboard
                </h2>
            }
        >
            <Head title="PESO Admin Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white shadow-lg sm:px-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">Welcome to PESO Admin Panel</h3>
                                <p className="mt-2 text-blue-100">
                                    You are logged in as a PESO Administrator. Manage employment services efficiently.
                                </p>
                            </div>
                            <div className="hidden rounded-full bg-white/20 p-3 sm:block">
                                <Bell className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {quickStats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">{stat.label}</p>
                                            <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                        <h4 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <a
                                        key={action.title}
                                        href={action.href}
                                        className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-slate-900">{action.title}</h5>
                                            <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayouts>
    );
}
