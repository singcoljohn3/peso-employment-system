import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BarChart3, 
    Download, 
    FileText, 
    Filter, 
    RefreshCw, 
    Calendar,
    MapPin,
    Building2,
    Users,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Loader2
} from 'lucide-react';
import ReportsDashboard from '@/Components/Reports/ReportsDashboard';
import ReportsCharts from '@/Components/Reports/ReportsCharts';
import ReportsTable from '@/Components/Reports/ReportsTable';
import ReportFilters from '@/Components/Reports/ReportFilters';
import ExportButtons from '@/Components/Reports/ExportButtons';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [monthlyApplications, setMonthlyApplications] = useState([]);
    const [hiringDistribution, setHiringDistribution] = useState([]);
    const [employmentGrowth, setEmploymentGrowth] = useState([]);
    const [reportsData, setReportsData] = useState([]);
    const [filters, setFilters] = useState({
        date_range: 'all',
        barangay_id: '',
        establishment_id: '',
        status: '',
        job_category: '',
        start_date: '',
        end_date: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchReportsData();
    }, [filters]);

    const fetchReportsData = async () => {
        setLoading(true);
        try {
            const [
                statsResponse,
                monthlyResponse,
                distributionResponse,
                growthResponse,
                reportsResponse
            ] = await Promise.all([
                axios.get('/api/reports/statistics', { params: filters }),
                axios.get('/api/reports/monthly-applications', { params: filters }),
                axios.get('/api/reports/hiring-distribution'),
                axios.get('/api/reports/employment-growth', { params: filters }),
                axios.get('/api/reports/filter', { params: { ...filters, per_page: 50 } })
            ]);

            setStatistics(statsResponse.data);
            setMonthlyApplications(monthlyResponse.data);
            setHiringDistribution(distributionResponse.data);
            setEmploymentGrowth(growthResponse.data);
            setReportsData(reportsResponse.data.data || []);
        } catch (error) {
            console.error('Error fetching reports data:', error);
            showNotification('Error loading reports data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleRefresh = () => {
        fetchReportsData();
        showNotification('Data refreshed successfully', 'success');
    };

    const handleExport = async (format) => {
        try {
            let response;
            switch (format) {
                case 'pdf':
                    response = await axios.get('/api/reports/export/pdf', { 
                        params: filters,
                        responseType: 'blob'
                    });
                    break;
                case 'excel':
                    response = await axios.get('/api/reports/export/excel', { 
                        params: filters,
                        responseType: 'blob'
                    });
                    break;
                case 'csv':
                    response = await axios.get('/api/reports/export/csv', { 
                        params: filters,
                        responseType: 'blob'
                    });
                    break;
                default:
                    throw new Error('Unsupported export format');
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `peso_reports_${format}_${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showNotification(`Report exported as ${format.toUpperCase()} successfully`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Error exporting report', 'error');
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'hired':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
        <AdminLayouts
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Employment Reports
                </h2>
            }
        >
            <Head title="Employment Reports" />

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
                    notification.type === 'success' ? 'bg-green-500 text-white' :
                    notification.type === 'error' ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                }`}>
                    {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
                    {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
                    {notification.type === 'info' && <AlertCircle className="h-5 w-5" />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Actions */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">PESO Employment Reports</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Comprehensive analytics and insights for employment services
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                Refresh
                            </button>
                            <ExportButtons onExport={handleExport} loading={loading} />
                        </div>
                    </div>

                    {/* Filters Section */}
                    {showFilters && (
                        <div className="mb-8">
                            <ReportFilters 
                                filters={filters} 
                                onFilterChange={handleFilterChange} 
                            />
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading reports data...</span>
                        </div>
                    )}

                    {!loading && statistics && (
                        <>
                            {/* Dashboard Cards */}
                            <div className="mb-8">
                                <ReportsDashboard statistics={statistics} />
                            </div>

                            {/* Charts Section */}
                            <div className="mb-8">
                                <ReportsCharts
                                    monthlyApplications={monthlyApplications}
                                    hiringDistribution={hiringDistribution}
                                    employmentGrowth={employmentGrowth}
                                    barangayStats={statistics.barangay_stats}
                                    employerStats={statistics.employer_stats}
                                />
                            </div>

                            {/* Reports Table */}
                            <div className="mb-8">
                                <ReportsTable 
                                    data={reportsData}
                                    getStatusIcon={getStatusIcon}
                                    getStatusColor={getStatusColor}
                                />
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!loading && !statistics && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Data Available</h3>
                            <p className="text-gray-600 text-center max-w-md">
                                There is currently no data available for reports. Please check back later or contact your system administrator.
                            </p>
                            <button
                                onClick={handleRefresh}
                                className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh Data
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayouts>
    );
}