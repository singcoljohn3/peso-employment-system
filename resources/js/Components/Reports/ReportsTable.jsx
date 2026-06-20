import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Eye, Download, Calendar } from 'lucide-react';

export default function ReportsTable({ data, getStatusIcon, getStatusColor }) {
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);

    const itemsPerPage = 10;

    // Filter data based on search term
    const filteredData = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.job_seeker?.first_name?.toLowerCase().includes(searchLower) ||
            item.job_seeker?.last_name?.toLowerCase().includes(searchLower) ||
            item.job_seeker?.email?.toLowerCase().includes(searchLower) ||
            item.job?.job_title?.toLowerCase().includes(searchLower) ||
            item.job?.establishment?.company_name?.toLowerCase().includes(searchLower) ||
            item.status?.toLowerCase().includes(searchLower)
        );
    });

    // Sort data
    const sortedData = React.useMemo(() => {
        let sortableData = [...filteredData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'job_seeker_name':
                        aValue = `${a.job_seeker?.first_name || ''} ${a.job_seeker?.last_name || ''}`;
                        bValue = `${b.job_seeker?.first_name || ''} ${b.job_seeker?.last_name || ''}`;
                        break;
                    case 'company_name':
                        aValue = a.job?.establishment?.company_name || '';
                        bValue = b.job?.establishment?.company_name || '';
                        break;
                    case 'job_title':
                        aValue = a.job?.job_title || '';
                        bValue = b.job?.job_title || '';
                        break;
                    case 'created_at':
                        aValue = new Date(a.created_at);
                        bValue = new Date(b.created_at);
                        break;
                    default:
                        aValue = a[sortConfig.key] || '';
                        bValue = b[sortConfig.key] || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleViewDetails = (item) => {
        setSelectedRow(selectedRow === item.id ? null : item.id);
    };

    const handleExportRow = (item) => {
        const exportData = {
            'Application ID': item.id,
            'Job Seeker': `${item.job_seeker?.first_name || ''} ${item.job_seeker?.last_name || ''}`,
            'Email': item.job_seeker?.email || '',
            'Contact': item.job_seeker?.contact_number || '',
            'Barangay': item.job_seeker?.barangay?.name || 'N/A',
            'Job Title': item.job?.job_title || '',
            'Company': item.job?.establishment?.company_name || '',
            'Status': item.status || '',
            'Application Date': new Date(item.created_at).toLocaleDateString()
        };

        const csvContent = Object.entries(exportData)
            .map(([key, value]) => `"${key}","${value}"`)
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `application_${item.id}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Reports Data</h3>
                <p className="text-slate-600">No application records found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="border-b border-slate-200 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-lg font-semibold text-slate-900">Application Reports</h4>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('job_seeker_name')}
                                    className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                                >
                                    Job Seeker
                                    {getSortIcon('job_seeker_name')}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('job_title')}
                                    className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                                >
                                    Job Title
                                    {getSortIcon('job_title')}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('company_name')}
                                    className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                                >
                                    Company
                                    {getSortIcon('company_name')}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('status')}
                                    className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                                >
                                    Status
                                    {getSortIcon('status')}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => handleSort('created_at')}
                                    className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                                >
                                    Date Applied
                                    {getSortIcon('created_at')}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paginatedData.map((item) => (
                            <React.Fragment key={item.id}>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {item.job_seeker?.first_name} {item.job_seeker?.last_name}
                                            </p>
                                            <p className="text-xs text-slate-500">{item.job_seeker?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-900">{item.job?.job_title}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-900">{item.job?.establishment?.company_name}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(item.status)}
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(item)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleExportRow(item)}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="Export Row"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Expandable Row Details */}
                                {selectedRow === item.id && (
                                    <tr className="bg-slate-50">
                                        <td colSpan="6" className="px-4 py-3">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                                                <div>
                                                    <p className="font-medium text-slate-700">Contact Information</p>
                                                    <p className="text-slate-600">{item.job_seeker?.contact_number}</p>
                                                    <p className="text-slate-600">{item.job_seeker?.barangay?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">Job Details</p>
                                                    <p className="text-slate-600">Type: {item.job?.employment_type || 'N/A'}</p>
                                                    <p className="text-slate-600">Salary: {item.job?.salary_range || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">Application Timeline</p>
                                                    <p className="text-slate-600">Applied: {new Date(item.created_at).toLocaleDateString()}</p>
                                                    <p className="text-slate-600">Updated: {new Date(item.updated_at).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">Application ID</p>
                                                    <p className="text-slate-600">#{item.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="border-t border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-slate-900">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
