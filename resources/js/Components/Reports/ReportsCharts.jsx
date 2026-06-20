import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function ReportsCharts({
    monthlyApplications,
    hiringDistribution,
    employmentGrowth,
    barangayStats,
    employerStats
}) {
    // Prepare data for monthly applications bar chart
    const monthlyData = monthlyApplications.map(item => ({
        month: item.month_name?.substring(0, 3) || `Month ${item.month}`,
        applications: item.count
    }));

    // Prepare data for hiring status pie chart
    const pieData = hiringDistribution.map(item => ({
        name: item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown',
        value: item.count
    }));

    // Prepare data for employment growth line chart
    const growthData = employmentGrowth.map(item => ({
        period: item.period,
        applications: item.count,
        hired: item.hired
    }));

    // Prepare data for barangay chart
    const barangayData = barangayStats?.slice(0, 10).map(item => ({
        name: item.barangay_name?.substring(0, 15) + (item.barangay_name?.length > 15 ? '...' : ''),
        seekers: item.total_seekers,
        hired: item.hired_count
    })) || [];

    // Prepare data for employer chart
    const employerData = employerStats?.slice(0, 10).map(item => ({
        name: item.company_name?.substring(0, 15) + (item.company_name?.length > 15 ? '...' : ''),
        jobs: item.total_jobs,
        applications: item.total_applications,
        hired: item.hired_count
    })) || [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Chart Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Monthly Applications Bar Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="mb-4 text-lg font-semibold text-slate-900">Monthly Applications</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="month" 
                                tick={{ fontSize: 12 }}
                                stroke="#64748B"
                            />
                            <YAxis 
                                tick={{ fontSize: 12 }}
                                stroke="#64748B"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="applications" 
                                fill="#3B82F6" 
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Hiring Status Distribution Pie Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="mb-4 text-lg font-semibold text-slate-900">Hiring Status Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Employment Growth Line Chart */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h4 className="mb-4 text-lg font-semibold text-slate-900">Employment Growth Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="period" 
                                tick={{ fontSize: 12 }}
                                stroke="#64748B"
                            />
                            <YAxis 
                                tick={{ fontSize: 12 }}
                                stroke="#64748B"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="applications" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Total Applications"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="hired" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                dot={{ fill: '#10B981', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Hired"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Barangay Performance Chart */}
                {barangayData.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="mb-4 text-lg font-semibold text-slate-900">Barangay Performance</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barangayData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 11 }}
                                    stroke="#64748B"
                                />
                                <YAxis 
                                    tick={{ fontSize: 12 }}
                                    stroke="#64748B"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar 
                                    dataKey="seekers" 
                                    fill="#3B82F6" 
                                    radius={[4, 4, 0, 0]}
                                    name="Total Seekers"
                                />
                                <Bar 
                                    dataKey="hired" 
                                    fill="#10B981" 
                                    radius={[4, 4, 0, 0]}
                                    name="Hired"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Employer Performance Chart */}
                {employerData.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="mb-4 text-lg font-semibold text-slate-900">Employer Performance</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={employerData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 11 }}
                                    stroke="#64748B"
                                />
                                <YAxis 
                                    tick={{ fontSize: 12 }}
                                    stroke="#64748B"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar 
                                    dataKey="jobs" 
                                    fill="#F59E0B" 
                                    radius={[4, 4, 0, 0]}
                                    name="Job Vacancies"
                                />
                                <Bar 
                                    dataKey="applications" 
                                    fill="#3B82F6" 
                                    radius={[4, 4, 0, 0]}
                                    name="Applications"
                                />
                                <Bar 
                                    dataKey="hired" 
                                    fill="#10B981" 
                                    radius={[4, 4, 0, 0]}
                                    name="Hired"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Chart Summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="mb-4 text-lg font-semibold text-slate-900">Key Insights</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                            {monthlyApplications.reduce((sum, item) => sum + item.count, 0)}
                        </p>
                        <p className="text-sm text-slate-600">Total Applications</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {hiringDistribution.find(item => item.status === 'hired')?.count || 0}
                        </p>
                        <p className="text-sm text-slate-600">Successfully Hired</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">
                            {hiringDistribution.find(item => item.status === 'pending')?.count || 0}
                        </p>
                        <p className="text-sm text-slate-600">Pending Applications</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                            {barangayStats?.length || 0}
                        </p>
                        <p className="text-sm text-slate-600">Active Barangays</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
