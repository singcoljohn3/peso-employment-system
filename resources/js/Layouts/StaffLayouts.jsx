import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    BarChart3,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Bell,
    Search,
    Briefcase
} from 'lucide-react';

export default function StaffLayouts({ header, children }) {
    const user = usePage().props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        {
            label: 'Dashboard',
            href: route('staff.dashboard'),
            active: route().current('staff.dashboard'),
            icon: LayoutDashboard,
        },
        {
            label: 'Establishment',
            href: '#',
            active: false,
            icon: Building2,
        },
        {
            label: 'Jobseeker',
            href: '#',
            active: false,
            icon: Users,
        },
        {
            label: 'Reports',
            href: '#',
            active: false,
            icon: BarChart3,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex min-h-screen">
                {/* Sidebar - extends full height */}
                <aside
                    className={`${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-[#0F172A] text-slate-300 shadow-2xl transition-all duration-300 ease-in-out hidden sm:flex`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3 border-b border-slate-800/50 px-6 py-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                                <Briefcase className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white tracking-tight">PESO Staff</p>
                                <p className="text-xs text-slate-500">Staff Portal</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="space-y-1">
                                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                    Main Menu
                                </p>
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                                item.active
                                                    ? 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-400 border-l-2 border-teal-500'
                                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-teal-400' : 'text-slate-500'}`} />
                                            <span>{item.label}</span>
                                            {item.active && (
                                                <ChevronRight className="ml-auto h-4 w-4 text-teal-400" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="border-t border-slate-800/50 px-6 py-4">
                            <p className="text-xs text-slate-600">© 2024 PESO</p>
                            <p className="text-xs text-slate-500">Staff Access Only</p>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-[#0F172A] text-slate-300 shadow-2xl transition-all duration-300 ease-in-out sm:hidden`}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 border-b border-slate-800/50 px-6 py-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
                                <Briefcase className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white">PESO Staff</p>
                                <p className="text-xs text-slate-500">Staff Portal</p>
                            </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                                item.active
                                                    ? 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-400 border-l-2 border-teal-500'
                                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-teal-400' : 'text-slate-500'}`} />
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
                        className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm sm:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'sm:ml-72' : ''}`}>
                    {/* Top Header */}
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:px-6 lg:px-8 border-b border-slate-200/50">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200"
                                title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                            >
                                {sidebarOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>

                            {/* Search Bar */}
                            <div className="hidden md:flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-2.5 w-80">
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'Staff'}</p>
                                    <p className="text-xs text-slate-500">Staff Member</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white font-semibold shadow-lg">
                                    {(user?.name ?? 'S').charAt(0).toUpperCase()}
                                </div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all duration-200"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Link>
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
