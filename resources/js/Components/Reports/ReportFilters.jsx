import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Building2, Filter, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

export default function ReportFilters({ filters, onFilterChange }) {
    const [barangays, setBarangays] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        setLoading(true);
        try {
            const [barangaysResponse, establishmentsResponse] = await Promise.all([
                axios.get('/api/barangays'),
                axios.get('/api/establishments')
            ]);

            setBarangays(barangaysResponse.data);
            setEstablishments(establishmentsResponse.data);
        } catch (error) {
            console.error('Error fetching filter options:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        onFilterChange({ [field]: value });
    };

    const handleClearFilters = () => {
        onFilterChange({
            date_range: 'all',
            barangay_id: '',
            establishment_id: '',
            status: '',
            job_category: '',
            start_date: '',
            end_date: ''
        });
    };

    const dateRangeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' }
    ];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'interview', label: 'Interview' },
        { value: 'review', label: 'Under Review' }
    ];

    const jobCategoryOptions = [
        { value: '', label: 'All Categories' },
        { value: 'IT', label: 'Information Technology' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Education', label: 'Education' },
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Retail', label: 'Retail' },
        { value: 'Hospitality', label: 'Hospitality' },
        { value: 'Construction', label: 'Construction' },
        { value: 'Transportation', label: 'Transportation' },
        { value: 'Agriculture', label: 'Agriculture' },
        { value: 'Government', label: 'Government' },
        { value: 'Other', label: 'Other' }
    ];

    const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-slate-600" />
                    <h4 className="text-lg font-semibold text-slate-900">Report Filters</h4>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                        <X className="h-4 w-4" />
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Date Range Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date Range
                    </label>
                    <select
                        value={filters.date_range}
                        onChange={(e) => handleInputChange('date_range', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {dateRangeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Barangay Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Barangay
                    </label>
                    <select
                        value={filters.barangay_id}
                        onChange={(e) => handleInputChange('barangay_id', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                    >
                        <option value="">All Barangays</option>
                        {barangays.map(barangay => (
                            <option key={barangay.id} value={barangay.id}>
                                {barangay.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Establishment Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Building2 className="inline h-4 w-4 mr-1" />
                        Employer
                    </label>
                    <select
                        value={filters.establishment_id}
                        onChange={(e) => handleInputChange('establishment_id', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                    >
                        <option value="">All Employers</option>
                        {establishments.map(establishment => (
                            <option key={establishment.id} value={establishment.id}>
                                {establishment.company_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hiring Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Job Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Job Category
                    </label>
                    <select
                        value={filters.job_category}
                        onChange={(e) => handleInputChange('job_category', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {jobCategoryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Custom Date Range */}
                {filters.date_range === 'custom' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) => handleInputChange('start_date', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.end_date}
                                onChange={(e) => handleInputChange('end_date', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                        {filters.date_range !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Date: {dateRangeOptions.find(o => o.value === filters.date_range)?.label}
                            </span>
                        )}
                        {filters.barangay_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Barangay: {barangays.find(b => b.id == filters.barangay_id)?.name || 'Selected'}
                            </span>
                        )}
                        {filters.establishment_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Employer: {establishments.find(e => e.id == filters.establishment_id)?.company_name || 'Selected'}
                            </span>
                        )}
                        {filters.status && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Status: {statusOptions.find(o => o.value === filters.status)?.label}
                            </span>
                        )}
                        {filters.job_category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                Category: {jobCategoryOptions.find(o => o.value === filters.job_category)?.label}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
