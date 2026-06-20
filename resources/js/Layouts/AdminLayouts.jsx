import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    FileText,
    UserCheck,
    Map,
    FileDown,
    BarChart3,
    Settings,
    Shield,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Bell
} from 'lucide-react';

export default function AdminLayouts({ header, children }) {
    const user = usePage().props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        {
            label: 'Dashboard',
            href: route('admin.dashboard'),
            active: route().current('admin.dashboard'),
            icon: LayoutDashboard,
        },
        { label: 'Job Seekers', href: route('admin.jobseekers'), active: route().current('admin.jobseekers'), icon: Users },
        { label: 'Establishments', href: route('admin.establishments'), active: route().current('admin.establishments'), icon: Building2 },
        { label: 'Job Vacancies', href: route('admin.jobvacancies'), active: route().current('admin.jobvacancies'), icon: Briefcase },
        { label: 'Applications', href: route('admin.applications'), active: route().current('admin.applications'), icon: FileText },
        { label: 'Hiring Status', href: route('admin.hiring-statuses'), active: route().current('admin.hiring-statuses'), icon: UserCheck },
        { label: 'Resumes', href: route('admin.resumes'), active: route().current('admin.resumes'), icon: FileDown },
        { label: 'GIS Map', href: route('admin.gismap'), active: route().current('admin.gismap'), icon: Map },
        { label: 'Reports', href: route('admin.reports'), active: route().current('admin.reports'), icon: BarChart3 },
        { label: 'User Management', href: route('admin.user-management'), active: route().current('admin.user-management'), icon: Shield },
        { label: 'Settings', href: '#', active: false, icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex min-h-screen">
                {/* Sidebar - extends full height */}
                <aside
                    className={`${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white text-slate-700 shadow-xl transition-all duration-300 ease-in-out hidden sm:flex`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200">
                                <img
                                    src="/logo-peso.png"
                                    alt="PESO Logo"
                                    className="h-10 w-10 rounded-full bg-white object-contain p-1"
                                />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">PESO</p>
                                <p className="text-xs text-slate-500">Admin Portal</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                                item.active
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 shrink-0 text-blue-500" />
                                            <span>{item.label}</span>
                                            {item.active && (
                                                <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="border-t border-slate-200 px-6 py-4">
                            <p className="text-xs text-slate-400">© 2024 PESO</p>
                            <p className="text-xs text-slate-500">All rights reserved</p>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white text-slate-700 shadow-xl transition-all duration-300 ease-in-out sm:hidden`}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200">
                                <img
                                    src="/logo-peso.png"
                                    alt="PESO Logo"
                                    className="h-10 w-10 rounded-full bg-white object-contain p-1"
                                />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">PESO</p>
                                <p className="text-xs text-slate-500">Admin Portal</p>
                            </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                                item.active
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 shrink-0 text-blue-500" />
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
                        className="fixed inset-0 z-20 bg-black/50 sm:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'sm:ml-72' : ''}`}>
                    {/* Inner Header - like reference image */}
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white px-4 shadow-sm sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                                title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                            >
                                {sidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                            <h1 className="text-lg font-bold tracking-wide text-slate-800">
                                ADMIN PANEL
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                <Bell className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'Admin'}</p>
                                    <p className="text-xs text-slate-500">Administrator</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                                    {(user?.name ?? 'A').charAt(0).toUpperCase()}
                                </div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
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
