import React from 'react';
import { Users, Building2, Briefcase, TrendingUp, MapPin, FileCheck } from 'lucide-react';

export default function ReportsDashboard({ statistics }) {
    const statCards = [
        {
            title: 'Total Job Seekers',
            value: statistics?.total_job_seekers?.toLocaleString() || '0',
            icon: Users,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive'
        },
        {
            title: 'Active Employers',
            value: statistics?.total_employers?.toLocaleString() || '0',
            icon: Building2,
            color: 'bg-green-500',
            change: '+8%',
            changeType: 'positive'
        },
        {
            title: 'Total Applications',
            value: statistics?.total_applications?.toLocaleString() || '0',
            icon: Briefcase,
            color: 'bg-amber-500',
            change: '+23%',
            changeType: 'positive'
        },
        {
            title: 'Hired Applicants',
            value: statistics?.hired_count?.toLocaleString() || '0',
            icon: FileCheck,
            color: 'bg-purple-500',
            change: '+15%',
            changeType: 'positive'
        },
        {
            title: 'Unemployed Job Seekers',
            value: statistics?.unemployed_count?.toLocaleString() || '0',
            icon: Users,
            color: 'bg-red-500',
            change: '-5%',
            changeType: 'negative'
        },
        {
            title: 'Hiring Rate',
            value: `${statistics?.hiring_rate || 0}%`,
            icon: TrendingUp,
            color: 'bg-indigo-500',
            change: '+3%',
            changeType: 'positive'
        }
    ];

    const topBarangays = statistics?.barangay_stats?.slice(0, 5) || [];
    const topEmployers = statistics?.employer_stats?.slice(0, 5) || [];

    return (
        <div className="space-y-8">
            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Barangays */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-slate-900">Top Barangays by Hires</h4>
                    </div>
                    <div className="space-y-3">
                        {topBarangays.length > 0 ? (
                            topBarangays.map((barangay, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{barangay.barangay_name}</p>
                                            <p className="text-xs text-slate-500">{barangay.total_seekers} seekers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-green-600">{barangay.hired_count}</p>
                                        <p className="text-xs text-slate-500">hired</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No barangay data available</p>
                        )}
                    </div>
                </div>

                {/* Top Employers */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-green-600" />
                        <h4 className="text-lg font-semibold text-slate-900">Top Employers by Hires</h4>
                    </div>
                    <div className="space-y-3">
                        {topEmployers.length > 0 ? (
                            topEmployers.map((employer, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{employer.company_name}</p>
                                            <p className="text-xs text-slate-500">{employer.total_jobs} vacancies</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-green-600">{employer.hired_count}</p>
                                        <p className="text-xs text-slate-500">hired</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No employer data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Summary Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Avg. Applications per Job</p>
                            <p className="text-xl font-bold text-slate-900">
                                {statistics?.total_applications && statistics?.total_employers > 0 
                                    ? Math.round(statistics.total_applications / statistics.total_employers)
                                    : '0'
                                }
                            </p>
                        </div>
                        <Briefcase className="h-8 w-8 text-amber-500" />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Active Barangays</p>
                            <p className="text-xl font-bold text-slate-900">
                                {statistics?.barangay_stats?.length || '0'}
                            </p>
                        </div>
                        <MapPin className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Total Job Vacancies</p>
                            <p className="text-xl font-bold text-slate-900">
                                {statistics?.employer_stats?.reduce((sum, emp) => sum + emp.total_jobs, 0) || '0'}
                            </p>
                        </div>
                        <FileCheck className="h-8 w-8 text-purple-500" />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Success Rate</p>
                            <p className="text-xl font-bold text-slate-900">
                                {statistics?.hiring_rate ? `${statistics.hiring_rate}%` : '0%'}
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
