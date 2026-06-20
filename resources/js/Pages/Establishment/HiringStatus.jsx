import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';

import { Head, usePage } from '@inertiajs/react';

import { useState } from 'react';

import { 

    Users, 

    Briefcase, 

    Calendar, 

    CheckCircle, 

    Clock, 

    AlertCircle, 

    Eye, 

    Search,

    Filter,

    UserCheck,

    BarChart3,

    FileText,

    CalendarCheck

} from 'lucide-react';



export default function HiringStatus() {

    const { jobs, establishment, statistics } = usePage().props;

    const [searchTerm, setSearchTerm] = useState('');

    const [statusFilter, setStatusFilter] = useState('');




    const getStatusIcon = (status) => {

        switch (status) {

            case 'Open':

                return <CheckCircle className="h-4 w-4 text-green-600" />;

            case 'Hiring':

                return <Clock className="h-4 w-4 text-blue-600" />;

            case 'Closed':

                return <AlertCircle className="h-4 w-4 text-red-600" />;

            case 'Filled':

                return <UserCheck className="h-4 w-4 text-purple-600" />;

            default:

                return <Clock className="h-4 w-4 text-gray-600" />;

        }

    };



    const getStatusColor = (status) => {

        switch (status) {

            case 'Open':

                return 'bg-green-100 text-green-700 border-green-200';

            case 'Hiring':

                return 'bg-blue-100 text-blue-700 border-blue-200';

            case 'Closed':

                return 'bg-red-100 text-red-700 border-red-200';

            case 'Filled':

                return 'bg-purple-100 text-purple-700 border-purple-200';

            default:

                return 'bg-gray-100 text-gray-700 border-gray-200';

        }

    };



    const getStatusLabel = (status) => {

        switch (status) {

            case 'Open':

                return 'Open';

            case 'Hiring':

                return 'Hiring';

            case 'Closed':

                return 'Closed';

            case 'Filled':

                return 'Filled';

            default:

                return status;

        }

    };



    const getApplicationStatus = (application) => {

        if (application.applicationStatus?.hiringStatus?.status_name) {

            return application.applicationStatus.hiringStatus.status_name;

        }

        if (application.status) {

            return application.status;

        }

        return 'pending';

    };

    const handleStatusChange = async (jobId, newStatus) => {
        try {
            const response = await fetch(`/establishment/jobs/${jobId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };



    const filteredJobs = jobs?.filter(job => {

        const matchesSearch = !searchTerm || 

            job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||

            job.establishment?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||

            job.barangay?.barangay_name?.toLowerCase().includes(searchTerm.toLowerCase());
        

        const matchesStatus = !statusFilter || job.hiring_status === statusFilter;

        

        return matchesSearch && matchesStatus;

    }) || [];



    const statusOptions = [

        { value: '', label: 'All Statuses' },

        { value: 'Open', label: 'Open' },

        { value: 'Hiring', label: 'Hiring' },

        { value: 'Closed', label: 'Closed' },

        { value: 'Filled', label: 'Filled' },

    ];






    return (

        <EstablishmentLayouts>

            <Head title="Hiring Status" />



            <div className="p-6">

                {/* Header */}

                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-slate-800">Hiring Status</h1>

                    <p className="text-slate-500 mt-1">Track and manage the hiring status of all job vacancies</p>

                </div>



                {/* Statistics Cards */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">

                        <div className="flex items-center gap-3">

                            <div className="bg-blue-100 p-3 rounded-lg">

                                <Briefcase className="h-6 w-6 text-blue-600" />

                            </div>

                            <div>

                                <p className="text-slate-500 text-xs">Total Jobs</p>

                                <p className="text-2xl font-bold text-slate-800">{statistics?.total_jobs || 0}</p>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">

                        <div className="flex items-center gap-3">

                            <div className="bg-green-100 p-3 rounded-lg">

                                <CheckCircle className="h-6 w-6 text-green-600" />

                            </div>

                            <div>

                                <p className="text-slate-500 text-xs">Open</p>

                                <p className="text-2xl font-bold text-slate-800">{statistics?.open || 0}</p>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">

                        <div className="flex items-center gap-3">

                            <div className="bg-blue-100 p-3 rounded-lg">

                                <Clock className="h-6 w-6 text-blue-600" />

                            </div>

                            <div>

                                <p className="text-slate-500 text-xs">Hiring</p>

                                <p className="text-2xl font-bold text-slate-800">{statistics?.hiring || 0}</p>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">

                        <div className="flex items-center gap-3">

                            <div className="bg-red-100 p-3 rounded-lg">

                                <AlertCircle className="h-6 w-6 text-red-600" />

                            </div>

                            <div>

                                <p className="text-slate-500 text-xs">Closed</p>

                                <p className="text-2xl font-bold text-slate-800">{statistics?.closed || 0}</p>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">

                        <div className="flex items-center gap-3">

                            <div className="bg-purple-100 p-3 rounded-lg">

                                <UserCheck className="h-6 w-6 text-purple-600" />

                            </div>

                            <div>

                                <p className="text-slate-500 text-xs">Filled</p>

                                <p className="text-2xl font-bold text-slate-800">{statistics?.filled || 0}</p>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">

                        <div className="flex items-center gap-3">

                            <div className="bg-emerald-100 p-3 rounded-lg">

                                <BarChart3 className="h-6 w-6 text-emerald-600" />

                            </div>

                            <div>

                                <p className="text-slate-500 text-xs">Positions Filled</p>

                                <p className="text-2xl font-bold text-slate-800">{statistics?.positions_filled || 0}</p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Search and Filters */}



                {/* Search and Filters */}

                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">

                    <div className="flex flex-col md:flex-row gap-4">

                        <div className="flex-1">

                            <div className="relative">

                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                                <input

                                    type="text"

                                    value={searchTerm}

                                    onChange={(e) => setSearchTerm(e.target.value)}

                                    placeholder="Search by job title, company, or location..."

                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"

                                />

                            </div>

                        </div>

                        <div className="flex gap-2">

                            <select

                                value={statusFilter}

                                onChange={(e) => setStatusFilter(e.target.value)}

                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"

                            >

                                {statusOptions.map(option => (

                                    <option key={option.value} value={option.value}>

                                        {option.label}

                                    </option>

                                ))}

                            </select>


                        </div>

                    </div>

                </div>



                {/* Jobs Table */}

                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

                    {filteredJobs.length > 0 ? (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-slate-50 border-b border-slate-200">

                                    <tr>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Job Title</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Job Type</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Salary</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Applicants</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date Posted</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-200">

                                    {filteredJobs.map((job) => {

                                        const statusBadge = getStatusColor(job.hiring_status);

                                        const statusIcon = getStatusIcon(job.hiring_status);

                                        const statusLabel = getStatusLabel(job.hiring_status);




                                        return (

                                            <tr key={job.id} className="hover:bg-slate-50 transition-colors">

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <Briefcase className="h-4 w-4 text-slate-400" />

                                                        <span className="font-medium text-slate-800">{job.job_title}</span>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="text-slate-700">{job.establishment?.company_name || 'N/A'}</span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="text-slate-700">{job.employment_type}</span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="text-slate-700">{job.salary_range || 'Not specified'}</span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="text-slate-700">{job.barangay?.barangay_name || 'N/A'}</span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <Users className="h-4 w-4 text-slate-400" />

                                                        <span className="text-slate-700 font-medium">{job.applications_count || 0}</span>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <Calendar className="h-4 w-4 text-slate-400" />

                                                        <span className="text-slate-700">

                                                            {new Date(job.created_at).toLocaleDateString()}

                                                        </span>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border w-fit ${statusBadge}`}>

                                                        {statusIcon}

                                                        <span>{statusLabel}</span>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <select
                                                        value={job.hiring_status}
                                                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                                        className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                    >

                                                        <option value="Open">Open</option>

                                                        <option value="Hiring">Hiring</option>

                                                        <option value="Closed">Closed</option>

                                                        <option value="Filled">Filled</option>

                                                    </select>

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="p-12 text-center">

                            <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />

                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Jobs Found</h3>

                            <p className="text-slate-500">

                                {jobs?.length > 0 

                                    ? 'No jobs match your current filters.' 

                                    : 'No job postings yet. Create your first job vacancy to get started.'}

                            </p>

                        </div>

                    )}

                </div>

            </div>

        </EstablishmentLayouts>

    );

}

