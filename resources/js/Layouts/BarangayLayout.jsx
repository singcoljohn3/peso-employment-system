import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    FileText,
    Bell,
    Megaphone,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Search,
    Calendar,
    Shield
} from 'lucide-react';

export default function BarangayLayout({ header, children }) {
    const user = usePage().props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const navItems = [
        {
            label: 'Dashboard',
            href: route('barangay.dashboard'),
            active: route().current('barangay.dashboard'),
            icon: LayoutDashboard,
        },
        {
            label: 'Job Seekers',
            href: route('barangay.job-seekers'),
            active: route().current('barangay.job-seekers'),
            icon: Users,
        },
        {
            label: 'Residents',
            href: route('barangay.residents'),
            active: route().current('barangay.residents'),
            icon: User,
        },
        {
            label: 'Job Referrals',
            href: route('barangay.job-referrals'),
            active: route().current('barangay.job-referrals'),
            icon: Briefcase,
        },
        {
            label: 'Local Job Vacancies',
            href: route('barangay.local-jobs'),
            active: route().current('barangay.local-jobs'),
            icon: Building2,
        },
        {
            label: 'Barangay Reports',
            href: route('barangay.reports'),
            active: route().current('barangay.reports'),
            icon: FileText,
        },
        {
            label: 'Notifications',
            href: route('barangay.notifications'),
            active: route().current('barangay.notifications'),
            icon: Bell,
        },
        {
            label: 'Announcements',
            href: route('barangay.announcements'),
            active: route().current('barangay.announcements'),
            icon: Megaphone,
        },
        {
            label: 'Profile',
            href: route('barangay.profile'),
            active: route().current('barangay.profile'),
            icon: User,
        },
        {
            label: 'Settings',
            href: route('barangay.settings'),
            active: route().current('barangay.settings'),
            icon: Settings,
        },
        {
            label: 'Logout',
            href: route('barangay.logout'),
            active: false,
            icon: LogOut,
            method: 'post',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative flex min-h-screen">
                {/* Desktop Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white/80 backdrop-blur-xl text-slate-700 shadow-2xl border-r border-white/20 transition-all duration-300 ease-in-out hidden sm:flex`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3 border-b border-slate-200/50 px-6 py-6">
                            <div className="relative">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-navy-900 shadow-lg shadow-green-700/30 ring-2 ring-yellow-500/20">
                                    <Building2 className="h-7 w-7 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 tracking-tight">Barangay Portal</p>
                                <p className="text-xs text-slate-500">Employment Services</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            method={item.method || 'get'}
                                            as={item.method ? 'button' : 'a'}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                                item.active
                                                    ? 'bg-gradient-to-r from-green-700 to-navy-900 text-white shadow-lg shadow-green-700/30'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="flex-1">{item.label}</span>
                                            {item.active && (
                                                <ChevronRight className="h-4 w-4 text-white/80" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="border-t border-slate-200/50 px-6 py-4">
                            <div className="rounded-xl bg-gradient-to-br from-green-50 to-yellow-50 p-4 border border-green-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="h-5 w-5 text-green-700" />
                                    <p className="text-xs font-semibold text-green-900">Secure Portal</p>
                                </div>
                                <p className="text-xs text-green-600/80">
                                    Your data is protected with end-to-end encryption
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white/95 backdrop-blur-xl text-slate-700 shadow-2xl transition-all duration-300 ease-in-out sm:hidden`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo Area */}
                        <div className="flex items-center justify-between border-b border-slate-200/50 px-6 py-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-navy-900 shadow-lg ring-2 ring-yellow-500/20">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">Barangay Portal</p>
                                    <p className="text-xs text-slate-500">Employment Services</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            method={item.method || 'get'}
                                            as={item.method ? 'button' : 'a'}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                                item.active
                                                    ? 'bg-gradient-to-r from-green-700 to-navy-900 text-white shadow-lg'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm sm:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'sm:ml-72' : ''}`}>
                    {/* Top Navbar */}
                    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
                        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                    title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                                >
                                    {sidebarOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Barangay Dashboard</h1>
                                    <p className="text-xs text-slate-500">Employment Management System</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="hidden md:flex items-center relative">
                                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-700/10 transition-all"
                                    />
                                </div>

                                {/* Date */}
                                <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>

                                {/* Notification */}
                                <div className="relative">
                                    <button
                                        onClick={() => setNotificationOpen(!notificationOpen)}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
                                    </button>
                                    {notificationOpen && (
                                        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50">
                                            <p className="text-sm font-semibold text-slate-900 mb-3">Notifications</p>
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                        <Briefcase className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-900">New job application</p>
                                                        <p className="text-xs text-slate-500">2 hours ago</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                        <User className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-900">New job seeker registered</p>
                                                        <p className="text-xs text-slate-500">5 hours ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Profile */}
                                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'Barangay Officer'}</p>
                                        <p className="text-xs text-slate-500">Barangay Admin</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-navy-900 shadow-lg shadow-green-700/30 ring-2 ring-yellow-500/20">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <Link
                                        href={route('barangay.logout')}
                                        method="post"
                                        as="button"
                                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
