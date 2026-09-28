import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Users, Building2, Briefcase, FileText, TrendingUp, Clock, XCircle, CheckCircle,
    Loader2, RefreshCw, Download, Printer, Eye, Filter, Calendar, Search, AlertCircle,
    BarChart3, Award, ArrowUp, ArrowDown
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

const STAT_CARDS = [
    { key: 'total_job_seekers', label: 'Registered Job Seekers', icon: Users, color: 'blue' },
    { key: 'active_establishments', label: 'Active Establishments', icon: Building2, color: 'violet' },
    { key: 'total_job_vacancies', label: 'Total Job Vacancies', icon: Briefcase, color: 'amber' },
    { key: 'total_applications', label: 'Total Applications', icon: FileText, color: 'blue' },
    { key: 'hired', label: 'Hired Applicants', icon: CheckCircle, color: 'emerald' },
    { key: 'pending', label: 'Pending Applications', icon: Clock, color: 'amber' },
    { key: 'rejected', label: 'Rejected Applications', icon: XCircle, color: 'red' },
    { key: 'generated_resumes', label: 'Generated Resumes', icon: FileText, color: 'purple' },
    { key: 'hiring_rate', label: 'Hiring Rate (%)', icon: TrendingUp, color: 'emerald', suffix: '%' },
];

const CARD_COLORS = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700', ring: 'ring-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-700', ring: 'ring-amber-100' },
    red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-700', ring: 'ring-red-100' },
    violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700', ring: 'ring-violet-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-700', ring: 'ring-purple-100' },
};

const STATUS_COLORS = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Approved: 'bg-violet-100 text-violet-800 border-violet-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Hired: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [printMode, setPrintMode] = useState(false);
    const printRef = useRef(null);

    const fetchData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        else setRefreshing(true);
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await axios.get('/api/reports/data', { params });
            setData(res.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [startDate, endDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleExport = async (format) => {
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await axios.get(`/api/reports/export/${format}`, {
                params, responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            const ext = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xls' : 'csv';
            a.download = `peso-employment-report.${ext}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    const handlePrint = () => {
        setPrintMode(true);
        setTimeout(() => {
            window.print();
            setPrintMode(false);
        }, 300);
    };

    const s = data?.statistics || {};
    const topEstablishments = data?.top_establishments || [];
    const hiringDistribution = data?.hiring_distribution || [];
    const monthlyHired = data?.monthly_hired || [];
    const inDemandJobs = data?.in_demand_jobs || [];
    const barangayChartData = data?.barangay_chart_data || [];
    const detailedApplicants = data?.detailed_applicants || [];

    const PreviewContent = () => (
        <div ref={printRef} className="bg-white">
            <div className="border-b-4 border-blue-700 pb-4 mb-6 text-center">
                <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-wide">PESO Employment Report</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} |
                    {(startDate || endDate) ? ` Period: ${startDate || '...'} to ${endDate || '...'}` : ' All Time'}
                </p>
            </div>

            <div className="mb-6">
                <div style={{ fontSize: '11pt', fontWeight: 700, color: '#ffffff', background: '#1e40af', padding: '6px 12px', borderRadius: '4px', margin: '15px 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Summary Statistics
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0' }}>
                    <tbody>
                        {[
                            [
                                { key: 'total_job_seekers', label: 'Registered Job Seekers', color: '#2563eb' },
                                { key: 'active_establishments', label: 'Active Establishments', color: '#7c3aed' },
                                { key: 'total_job_vacancies', label: 'Total Job Vacancies', color: '#d97706' },
                            ],
                            [
                                { key: 'total_applications', label: 'Total Applications', color: '#2563eb' },
                                { key: 'hired', label: 'Hired Applicants', color: '#059669' },
                                { key: 'pending', label: 'Pending Applications', color: '#d97706' },
                            ],
                            [
                                { key: 'rejected', label: 'Rejected Applications', color: '#dc2626' },
                                { key: 'generated_resumes', label: 'Generated Resumes', color: '#7c3aed' },
                                { key: 'hiring_rate', label: 'Hiring Rate', color: '#059669', suffix: '%' },
                            ],
                        ].map((row, ri) => (
                            <tr key={ri}>
                                {row.map((item, ci) => (
                                    <td key={ci} style={{ width: '33.33%', padding: '8px 10px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                                        <span style={{ fontSize: '16pt', fontWeight: 800, color: item.color, display: 'block', lineHeight: 1.2 }}>
                                            {s[item.key] ?? 0}{item.suffix || ''}
                                        </span>
                                        <span style={{ fontSize: '6.5pt', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginTop: '2px' }}>
                                            {item.label}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {topEstablishments.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Top Hiring Establishments</h2>
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-700 text-white text-left">
                            <th className="p-2">#</th><th className="p-2">Company Name</th><th className="p-2">Industry</th><th className="p-2 text-center">Vacancies</th><th className="p-2 text-center">Hired</th>
                        </tr></thead>
                        <tbody>
                            {topEstablishments.map((e, i) => (
                                <tr key={i} className="border-b border-slate-200">
                                    <td className="p-2">{i + 1}</td>
                                    <td className="p-2 font-medium">{e.company_name}</td>
                                    <td className="p-2">{e.industry}</td>
                                    <td className="p-2 text-center">{e.total_job_vacancies}</td>
                                    <td className="p-2 text-center">{e.total_hired}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Hiring Status Distribution</h2>
                <div className="grid grid-cols-4 gap-3 text-center">
                    {hiringDistribution.map(d => (
                        <div key={d.status} className="border border-slate-200 rounded-lg p-3">
                            <div className="text-2xl font-bold text-slate-800">{d.count}</div>
                            <div className="text-xs text-slate-500 uppercase mt-1">{d.status}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Applicants by Barangay</h2>
                <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-blue-700 text-white text-left">
                        <th className="p-2">Barangay</th><th className="p-2 text-center">Total Applicants</th>
                    </tr></thead>
                    <tbody>
                        {barangayChartData.map((b, i) => (
                            <tr key={i} className="border-b border-slate-200">
                                <td className="p-2 font-medium">{b.barangay}</td>
                                <td className="p-2 text-center">{b.applicants}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {detailedApplicants.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Detailed Applicant Information</h2>
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-700 text-white text-left">
                            <th className="p-2">#</th>
                            <th className="p-2">Applicant Name</th>
                            <th className="p-2">Age</th>
                            <th className="p-2">Gender</th>
                            <th className="p-2">Barangay</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Date Applied</th>
                        </tr></thead>
                        <tbody>
                            {detailedApplicants.map((app, i) => (
                                <tr key={app.id || i} className="border-b border-slate-200">
                                    <td className="p-2">{i + 1}</td>
                                    <td className="p-2 font-medium">{app.applicant_name}</td>
                                    <td className="p-2">{app.age ?? 'N/A'}</td>
                                    <td className="p-2">{app.gender}</td>
                                    <td className="p-2">{app.barangay}</td>
                                    <td className="p-2">{app.application_status}</td>
                                    <td className="p-2">{app.date_applied}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Monthly Hired Applicants</h2>
                <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-blue-700 text-white text-left">
                        <th className="p-2">Month</th><th className="p-2 text-center">Hired</th>
                    </tr></thead>
                    <tbody>
                        {monthlyHired.map((m, i) => (
                            <tr key={i} className="border-b border-slate-200">
                                <td className="p-2 font-medium">{m.month}</td>
                                <td className="p-2 text-center">{m.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {inDemandJobs.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-3">Most In-Demand Jobs</h2>
                    <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-blue-700 text-white text-left">
                            <th className="p-2">#</th><th className="p-2">Job Title</th><th className="p-2">Establishment</th><th className="p-2 text-center">Applicants</th><th className="p-2 text-center">Hired</th>
                        </tr></thead>
                        <tbody>
                            {inDemandJobs.map((j, i) => (
                                <tr key={i} className="border-b border-slate-200">
                                    <td className="p-2">{i + 1}</td>
                                    <td className="p-2 font-medium">{j.job_title}</td>
                                    <td className="p-2">{j.establishment}</td>
                                    <td className="p-2 text-center">{j.applicants_count}</td>
                                    <td className="p-2 text-center">{j.hired_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    if (printMode) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <PreviewContent />
            </div>
        );
    }

    return (
        <AdminLayouts>
            <Head title="Reports" />

            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
                    <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl z-10">
                            <h3 className="text-lg font-semibold text-slate-900">Report Preview</h3>
                            <button onClick={() => setShowPreview(false)}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                        </div>
                        <div className="p-6">
                            <PreviewContent />
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 shadow-2xl shadow-blue-600/30">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Employment Reports</h2>
                                <p className="mt-1 text-sm text-blue-200">Comprehensive employment data and analytics</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${showFilters ? 'bg-white text-blue-700' : 'bg-blue-500/30 text-white hover:bg-blue-500/50'}`}>
                                    <Filter className="h-4 w-4" /> Filters
                                </button>
                                <button onClick={() => fetchData(false)} disabled={refreshing}
                                    className="flex items-center gap-1.5 rounded-xl bg-blue-500/30 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500/50 transition-colors disabled:opacity-50">
                                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                                </button>
                                <div className="relative group">
                                    <button className="flex items-center gap-1.5 rounded-xl bg-emerald-500/30 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500/50 transition-colors">
                                        <Download className="h-4 w-4" /> Export
                                    </button>
                                    <div className="absolute right-0 top-full z-20 mt-1 hidden w-40 rounded-xl border border-slate-200 bg-white shadow-lg group-hover:block">
                                        {['pdf', 'excel', 'csv'].map(f => (
                                            <button key={f} onClick={() => handleExport(f)}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 first:rounded-t-xl last:rounded-b-xl transition-colors">
                                                <Download className="h-4 w-4 text-slate-400" /> {f.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handlePrint}
                                    className="flex items-center gap-1.5 rounded-xl bg-blue-500/30 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500/50 transition-colors">
                                    <Printer className="h-4 w-4" /> Print
                                </button>
                                <button onClick={() => setShowPreview(true)}
                                    className="flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors">
                                    <Eye className="h-4 w-4" /> Preview
                                </button>
                            </div>
                        </div>

                        {/* Date Filters */}
                        {showFilters && (
                            <div className="mt-4 flex flex-wrap items-end gap-4 rounded-xl bg-white/10 p-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-blue-200">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                        className="rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white placeholder-blue-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 [color-scheme:light]" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-blue-200">End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                        className="rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white placeholder-blue-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 [color-scheme:light]" />
                                </div>
                                <button onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors">
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/50">
                                    <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
                                    <div className="h-8 w-16 rounded bg-slate-200" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Statistics */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                {STAT_CARDS.map(card => {
                                    const colors = CARD_COLORS[card.color] || CARD_COLORS.blue;
                                    const Icon = card.icon;
                                    const val = s[card.key];
                                    const displayVal = val !== null && val !== undefined ? val : 0;
                                    return (
                                        <div key={card.key}
                                            className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                                        {typeof displayVal === 'number' && card.suffix === '%'
                                                            ? displayVal.toFixed(1)
                                                            : typeof displayVal === 'number'
                                                                ? displayVal.toLocaleString()
                                                                : displayVal}
                                                        {card.suffix === '%' ? <span className="text-lg font-medium text-slate-400">%</span> : ''}
                                                    </p>
                                                </div>
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.icon} shrink-0`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Two-column layout for tables */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Top Hiring Establishments */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-gray-200/50">
                                    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                            <Award className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Top Hiring Establishments</h3>
                                    </div>
                                    {topEstablishments.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                                                        <th className="pb-3 pr-4">Company Name</th>
                                                        <th className="pb-3 pr-4">Industry</th>
                                                        <th className="pb-3 pr-4 text-center">Vacancies</th>
                                                        <th className="pb-3 text-center">Hired</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topEstablishments.map((e, i) => (
                                                        <tr key={i} className="border-b border-slate-100 last:border-0">
                                                            <td className="py-3 pr-4 font-medium text-slate-900">{e.company_name}</td>
                                                            <td className="py-3 pr-4 text-slate-600">{e.industry}</td>
                                                            <td className="py-3 pr-4 text-center text-slate-600">{e.total_job_vacancies}</td>
                                                            <td className="py-3 text-center">
                                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                                                    {e.total_hired}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-sm text-slate-400">No hiring data available</div>
                                    )}
                                </div>

                                {/* Hiring Status Distribution */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-gray-200/50">
                                    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                                            <BarChart3 className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Hiring Status Distribution</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {hiringDistribution.map(d => (
                                            <div key={d.status}
                                                className="rounded-xl border border-slate-200 p-4 text-center transition-all hover:shadow-md">
                                                <p className="text-3xl font-bold text-slate-900">{d.count}</p>
                                                <span className={`mt-1 inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_COLORS[d.status] || 'bg-slate-100 text-slate-700'}`}>
                                                    {d.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Applicants by Barangay (table + chart) */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-gray-200/50">
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Applicants by Barangay</h3>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                        Total: {barangayChartData.reduce((sum, b) => sum + b.applicants, 0)}
                                    </span>
                                </div>

                                {/* Table */}
                                <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                                                <th className="px-4 py-3">Barangay</th>
                                                <th className="px-4 py-3 text-center">Total Applicants</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {barangayChartData.map((b, i) => (
                                                <tr key={i} className="border-t border-slate-100 transition-colors hover:bg-blue-50/50">
                                                    <td className="px-4 py-2.5 font-medium text-slate-800">{b.barangay}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-sm font-semibold min-w-[2.5rem] ${
                                                            b.applicants > 0
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-slate-100 text-slate-400'
                                                        }`}>
                                                            {b.applicants}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Detailed Applicants Table */}
                                {detailedApplicants.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                            Detailed Applicant Information
                                        </h4>
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0">
                                                    <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                                                        <th className="px-4 py-3">#</th>
                                                        <th className="px-4 py-3">Applicant Name</th>
                                                        <th className="px-4 py-3">Age</th>
                                                        <th className="px-4 py-3">Gender</th>
                                                        <th className="px-4 py-3">Barangay</th>
                                                        <th className="px-4 py-3">Status</th>
                                                        <th className="px-4 py-3">Date Applied</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detailedApplicants.map((app, i) => (
                                                        <tr key={app.id || i} className="border-t border-slate-100 transition-colors hover:bg-blue-50/50">
                                                            <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                                                            <td className="px-4 py-2.5 font-medium text-slate-800">{app.applicant_name}</td>
                                                            <td className="px-4 py-2.5 text-slate-600">{app.age ?? 'N/A'}</td>
                                                            <td className="px-4 py-2.5 text-slate-600">{app.gender}</td>
                                                            <td className="px-4 py-2.5 text-slate-600">{app.barangay}</td>
                                                            <td className="px-4 py-2.5">
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                                                    app.application_status === 'Hired' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                                    app.application_status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                                    app.application_status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                    app.application_status === 'Approved' ? 'bg-violet-100 text-violet-800 border-violet-200' :
                                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                                }`}>
                                                                    {app.application_status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2.5 text-slate-500">{app.date_applied}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Bar Chart */}
                                <ResponsiveContainer width="100%" height={380}>
                                    <BarChart data={barangayChartData} margin={{ top: 10, right: 30, left: 0, bottom: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis
                                            dataKey="barangay"
                                            tick={{ fontSize: 10, fill: '#64748b' }}
                                            interval={0}
                                            angle={-35}
                                            textAnchor="end"
                                            height={80}
                                            tickMargin={8}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                            tickLine={false}
                                            label={{ value: 'Barangay', position: 'insideBottomRight', offset: -60, style: { fontSize: 12, fill: '#64748b', fontWeight: 600 } }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                            label={{ value: 'Applicants', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 12, fill: '#64748b', fontWeight: 600 } }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload?.length) {
                                                    return (
                                                        <div className="rounded-xl border border-gray-100 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
                                                            <p className="text-sm font-semibold text-gray-900">{label}</p>
                                                            <p className="text-sm font-medium text-blue-600">
                                                                Applicants: {payload[0].value}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {payload[0].value === 1 ? '1 registered job seeker' : `${payload[0].value} registered job seekers`}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            cursor={{ fill: '#3b82f6', opacity: 0.05 }}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                            formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
                                        />
                                        <Bar
                                            dataKey="applicants"
                                            name="Job Seekers"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={60}
                                            animationBegin={0}
                                            animationDuration={1200}
                                            animationEasing="ease-out"
                                        >
                                            {barangayChartData.map((_, i) => (
                                                <Cell key={i} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][i % 6]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Second row */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Monthly Hired Applicants */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-gray-200/50">
                                    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Monthly Hired Applicants</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                                                    <th className="pb-3 pr-4">Month</th>
                                                    <th className="pb-3 text-center">Hired</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlyHired.map((m, i) => (
                                                    <tr key={i} className="border-b border-slate-100 last:border-0">
                                                        <td className="py-2.5 pr-4 font-medium text-slate-900">{m.month}</td>
                                                        <td className="py-2.5 text-center">
                                                            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-700 min-w-[3rem]">
                                                                {m.count}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Most In-Demand Jobs */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-gray-200/50">
                                    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                            <Search className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800">Most In-Demand Jobs</h3>
                                    </div>
                                    {inDemandJobs.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                                                        <th className="pb-3 pr-3">Job Title</th>
                                                        <th className="pb-3 pr-3">Establishment</th>
                                                        <th className="pb-3 pr-3 text-center">Applicants</th>
                                                        <th className="pb-3 text-center">Hired</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inDemandJobs.map((j, i) => (
                                                        <tr key={i} className="border-b border-slate-100 last:border-0">
                                                            <td className="py-3 pr-3 font-medium text-slate-900">{j.job_title}</td>
                                                            <td className="py-3 pr-3 text-slate-600">{j.establishment}</td>
                                                            <td className="py-3 pr-3 text-center text-slate-600">{j.applicants_count}</td>
                                                            <td className="py-3 text-center">
                                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                                                    {j.hired_count}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-sm text-slate-400">No job data available</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayouts>
    );
}
