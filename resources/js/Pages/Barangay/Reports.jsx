import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    FileText,
    Download,
    Printer,
    Calendar,
    TrendingUp,
    Users,
    Briefcase,
    CheckCircle,
    BarChart3,
    PieChart
} from 'lucide-react';

export default function BarangayReports({ barangay, statistics }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const handleExportPDF = () => {
        alert('PDF Export functionality - to be implemented');
    };

    const handleExportExcel = () => {
        alert('Excel Export functionality - to be implemented');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Barangay Reports
                </h2>
            }
        >
            <Head title="Barangay Reports" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Employment Reports</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Generate and view employment statistics for {barangay?.barangay_name || 'your barangay'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <FileText className="h-4 w-4" />
                                Export PDF
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Download className="h-4 w-4" />
                                Export Excel
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </button>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Select Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {months.map((month, index) => (
                                        <option key={month} value={index}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-slate-700">Select Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Job Seekers</p>
                                    <p className="text-2xl font-bold text-slate-900">{statistics.totalJobSeekers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                    <Briefcase className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Applications</p>
                                    <p className="text-2xl font-bold text-slate-900">{statistics.totalApplications}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                                    <CheckCircle className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Hired Applicants</p>
                                    <p className="text-2xl font-bold text-slate-900">{statistics.hiredCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Employment Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {statistics.totalApplications > 0 
                                            ? Math.round((statistics.hiredCount / statistics.totalApplications) * 100) 
                                            : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Sections */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Monthly Applications Chart */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-slate-900">Monthly Applications</h4>
                                <BarChart3 className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                                <div className="text-center text-slate-500">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">Chart visualization to be implemented</p>
                                </div>
                            </div>
                        </div>

                        {/* Employment Status Distribution */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-slate-900">Employment Status</h4>
                                <PieChart className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                                <div className="text-center text-slate-500">
                                    <PieChart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">Chart visualization to be implemented</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities Table */}
                        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-slate-900">Recent Activities</h4>
                                <Calendar className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                Activity
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-900">New job seeker registered</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">Jan 15, 2024</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-900">Job referral sent to ABC Company</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">Jan 14, 2024</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                    Pending
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-900">Applicant hired by XYZ Corp</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">Jan 13, 2024</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                    Success
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}
