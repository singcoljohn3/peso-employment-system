import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    BriefcaseBusiness,
    FileText,
    Map,
    FileDown,
    BarChart3,
    Settings,
    Shield,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Bell,
    TrendingUp,
    Check,
    X as XIcon,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Mail,
    ChevronDown,
    Search,
    Calendar
} from 'lucide-react';

export default function AdminLayouts({ header, children }) {
    const user = usePage().props.auth?.user;
    const pendingAgencyCount = Number(usePage().props.pendingAgencyCount || 0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => { clearInterval(interval); clearInterval(clockInterval); };
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (e) {}
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            fetchNotifications();
        } catch (e) {}
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            fetchNotifications();
        } catch (e) {}
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'application_status': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'account_approved': return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case 'account_rejected': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'account_suspended': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'new_application': return <Briefcase className="h-4 w-4 text-purple-500" />;
            default: return <Bell className="h-4 w-4 text-slate-500" />;
        }
    };

    const navItems = [
        { label: 'Dashboard', href: route('admin.dashboard'), active: route().current('admin.dashboard'), icon: LayoutDashboard },
        { label: 'Job Seekers', href: route('admin.jobseekers'), active: route().current('admin.jobseekers'), icon: Users },
        { label: 'Establishments', href: route('admin.establishments'), active: route().current('admin.establishments'), icon: Building2 },
        { label: 'Agency Accounts', href: route('admin.agencies'), active: route().current('admin.agencies', 'admin.agencies.*'), icon: BriefcaseBusiness, badge: pendingAgencyCount },
        { label: 'Hiring Estab.', href: route('admin.hiring-establishments'), active: route().current('admin.hiring-establishments'), icon: TrendingUp },
        { label: 'Job Vacancies', href: route('admin.jobvacancies'), active: route().current('admin.jobvacancies'), icon: Briefcase },
        { label: 'Applications', href: route('admin.applications'), active: route().current('admin.applications'), icon: FileText },
        { label: 'Resumes', href: route('admin.resumes'), active: route().current('admin.resumes'), icon: FileDown },
        { label: 'MAP', href: route('admin.gismap'), active: route().current('admin.gismap'), icon: Map },
        { label: 'Reports', href: route('admin.reports'), active: route().current('admin.reports'), icon: BarChart3 },
        { label: 'User Management', href: route('admin.user-management'), active: route().current('admin.user-management'), icon: Shield },
        { label: 'Settings', href: '#', active: false, icon: Settings },
    ];

    const renderBadge = (badge) =>
        badge > 0 ? (
            <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm">
                {badge > 99 ? '99+' : badge}
            </span>
        ) : null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex min-h-screen">
                <aside
                    className={`${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white text-slate-700 shadow-xl transition-all duration-300 ease-in-out hidden sm:flex`}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200">
                                <img src="/logo-peso.png" alt="PESO Logo" className="h-10 w-10 rounded-full bg-white object-contain p-1" />
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
                                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                                item.active
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 shrink-0 text-blue-500" />
                                            <span>{item.label}</span>
                                            {item.badge > 0 ? renderBadge(item.badge) : null}
                                            {item.active && <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        <div className="border-t border-slate-200 px-6 py-4">
                            <p className="text-xs text-slate-400">© 2024 PESO</p>
                            <p className="text-xs text-slate-500">All rights reserved</p>
                        </div>
                    </div>
                </aside>

                <aside
                    className={`${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white text-slate-700 shadow-xl transition-all duration-300 ease-in-out sm:hidden`}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200">
                                <img src="/logo-peso.png" alt="PESO Logo" className="h-10 w-10 rounded-full bg-white object-contain p-1" />
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
                                            {item.badge > 0 ? renderBadge(item.badge) : null}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 z-20 bg-black/50 sm:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'sm:ml-72' : ''}`}>
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <div className="hidden md:block">
                                <p className="text-lg font-bold tracking-wide text-slate-800">ADMIN PORTAL</p>
                            </div>
                        </div>

                        <div className="hidden sm:flex flex-1 max-w-md mx-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search job seekers, establishments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 lg:flex">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <Clock className="ml-1 h-4 w-4 text-slate-400" />
                                <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50">
                                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                                    <Check className="h-3 w-3" /> Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.slice(0, 10).map((n) => (
                                                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 ${!n.read_at ? 'bg-blue-50/50' : ''}`}>
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                                                            {getNotifIcon(n.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-slate-900 truncate">{n.title}</p>
                                                            <p className="text-[11px] text-slate-500 truncate">{n.message}</p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</p>
                                                        </div>
                                                        {!n.read_at && (
                                                            <button onClick={() => markAsRead(n.id)} className="shrink-0 text-blue-500 hover:text-blue-700">
                                                                <Check className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-sm text-slate-500">
                                                    <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                                    <p>No notifications</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'Admin'}</p>
                                        <p className="text-xs text-slate-500">Administrator</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                                        {(user?.name ?? 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl z-50">
                                        <div className="py-1">
                                            <Link href={route('profile.edit')} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                                <User className="h-4 w-4" /> Profile
                                            </Link>
                                            <Link href={route('profile.edit')} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                                <Mail className="h-4 w-4" /> {user?.email}
                                            </Link>
                                            <hr className="my-1 border-slate-100" />
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="h-4 w-4" /> Logout
                                            </Link>
                                        </div>
                                    </div>
                                )}
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
