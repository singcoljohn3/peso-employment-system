import { Head, usePage } from '@inertiajs/react';
import StaffLayouts from '@/Layouts/StaffLayouts';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    FileCheck,
    DollarSign,
    ArrowUpRight,
    Calendar,
    MoreHorizontal,
    Briefcase,
    Target,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Sample data for charts
const earningsData = [
    { month: 'Jan', earnings: 4200 },
    { month: 'Feb', earnings: 5100 },
    { month: 'Mar', earnings: 4800 },
    { month: 'Apr', earnings: 6200 },
    { month: 'May', earnings: 7500 },
    { month: 'Jun', earnings: 8200 },
    { month: 'Jul', earnings: 7800 },
    { month: 'Aug', earnings: 9100 },
    { month: 'Sep', earnings: 8800 },
    { month: 'Oct', earnings: 9600 },
    { month: 'Nov', earnings: 10200 },
    { month: 'Dec', earnings: 11500 },
];

const revenueData = [
    { name: 'Job Placements', value: 45, color: '#0F172A' },
    { name: 'Training Programs', value: 30, color: '#3B82F6' },
    { name: 'Consultations', value: 25, color: '#10B981' },
];

const recentActivity = [
    { id: 1, action: 'New job seeker registered', time: '2 minutes ago', type: 'success' },
    { id: 2, action: 'Establishment approval pending', time: '15 minutes ago', type: 'warning' },
    { id: 3, action: 'Monthly report generated', time: '1 hour ago', type: 'info' },
    { id: 4, action: 'Job placement completed', time: '3 hours ago', type: 'success' },
    { id: 5, action: 'System backup completed', time: '5 hours ago', type: 'info' },
];

export default function StaffDashboard() {
    const user = usePage().props.auth?.user;

    const kpiCards = [
        {
            title: 'Total Earnings',
            value: '$84,230',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            description: 'vs last month',
            color: 'from-slate-800 to-slate-900',
            iconBg: 'bg-slate-800/10',
            iconColor: 'text-slate-700'
        },
        {
            title: 'Active Jobseekers',
            value: '2,451',
            change: '+8.2%',
            trend: 'up',
            icon: Users,
            description: 'vs last month',
            color: 'from-blue-600 to-blue-700',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Establishments',
            value: '186',
            change: '+3.1%',
            trend: 'up',
            icon: Building2,
            description: 'vs last month',
            color: 'from-emerald-500 to-emerald-600',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            title: 'Pending Tasks',
            value: '23',
            change: '-2.4%',
            trend: 'down',
            icon: FileCheck,
            description: 'vs last week',
            color: 'from-amber-500 to-amber-600',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600'
        },
    ];

    return (
        <StaffLayouts>
            <Head title="Staff Dashboard" />

            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                                Welcome back, {user?.name?.split(' ')[0] || 'Staff'} 👋
                            </h1>
                            <p className="mt-1 text-slate-500 text-sm">
                                Here's what's happening with your dashboard today.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {kpiCards.map((card, index) => {
                        const Icon = card.icon;
                        const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
                        return (
                            <div
                                key={card.title}
                                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-slate-300/60 transition-all duration-300 overflow-hidden"
                            >
                                {/* Gradient accent on hover */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
                                </div>

                                <div className="flex items-center gap-2 mt-4">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                        card.trend === 'up'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-red-50 text-red-700'
                                    }`}>
                                        <TrendIcon className="h-3 w-3" />
                                        {card.change}
                                    </span>
                                    <span className="text-xs text-slate-400">{card.description}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Earnings Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Earnings Overview</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Monthly revenue performance</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select className="text-sm border-none bg-slate-100 rounded-lg px-3 py-2 text-slate-600 focus:ring-2 focus:ring-slate-200 outline-none cursor-pointer">
                                    <option>This Year</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="h-72">
                            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
                                <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value/1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0F172A',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                                        }}
                                        labelStyle={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}
                                        itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#3B82F6"
                                        strokeWidth={2.5}
                                        fill="url(#colorEarnings)"
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, stroke: '#fff', r: 4 }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#0F172A' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Sources Donut Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Revenue Sources</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Distribution by category</p>
                            </div>
                        </div>

                        <div className="h-48 relative">
                            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0F172A',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px',
                                        }}
                                        itemStyle={{ color: '#fff', fontSize: '13px' }}
                                        formatter={(value) => [`${value}%`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-slate-900">100%</span>
                                <span className="text-xs text-slate-400">Total</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3 mt-4">
                            {revenueData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-slate-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Recent Activity & Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Latest system events and updates</p>
                            </div>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                        activity.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                        activity.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                        {activity.type === 'success' && <Target className="h-5 w-5" />}
                                        {activity.type === 'warning' && <Clock className="h-5 w-5" />}
                                        {activity.type === 'info' && <Briefcase className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900 group-hover:text-slate-800">{activity.action}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Performance</h3>
                                <p className="text-xs text-slate-400">This month's metrics</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-300">Job Placements</span>
                                    <span className="text-sm font-semibold text-emerald-400">92%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[92%] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-300">Profile Completion</span>
                                    <span className="text-sm font-semibold text-blue-400">78%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-300">Response Rate</span>
                                    <span className="text-sm font-semibold text-amber-400">85%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-xs text-slate-400 text-center">
                                You're performing better than 78% of staff this month
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayouts>
    );
}

