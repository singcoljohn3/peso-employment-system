import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Calendar,
    Users,
    Download,
    ChevronLeft,
    ChevronRight,
    Share2
} from 'lucide-react';

export default function LocalJobs({ jobs, barangay }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const filteredJobs = jobs.data.filter(job => {
        const matchesSearch = 
            job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.establishment?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Local Job Vacancies
                </h2>
            }
        >
            <Head title="Local Job Vacancies" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">Available Job Vacancies</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            View and recommend jobs from establishments in {barangay?.barangay_name || 'your barangay'}
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="all">All Categories</option>
                                <option value="full-time">Full Time</option>
                                <option value="part-time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                            <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Jobs</p>
                                    <p className="text-lg font-bold text-slate-900">{jobs.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <Building2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Companies</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {new Set(jobs.data.map(j => j.establishment_id)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                    <Users className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Applicants</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {jobs.data.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="mb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                                <Briefcase className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                {job.employment_type}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-slate-900">{job.job_title}</h4>
                                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{job.description}</p>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                            {job.establishment?.company_name || 'Unknown Company'}
                                        </div>
                                        {job.salary_range && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <DollarSign className="h-4 w-4 text-slate-400" />
                                                {job.salary_range}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            {job.barangay?.barangay_name || 'Location not specified'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            {job.applications_count || 0} applicants
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar className="h-3 w-3" />
                                            Posted {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                            <Share2 className="h-4 w-4" />
                                            Recommend
                                        </button>
                                        <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                <Briefcase className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-slate-500">No job vacancies found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {jobs.total > jobs.per_page && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm">
                            <p className="text-sm text-slate-600">
                                Showing {jobs.from} to {jobs.to} of {jobs.total} results
                            </p>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                <button className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BarangayLayout>
    );
}
