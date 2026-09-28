import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    UserPlus,
    Building2,
    Clock,
    Calendar,
} from 'lucide-react';

export default function AgencyLayouts({ header, children }) {
    const { auth, agency: agencyData } = usePage().props;
    const user = auth?.user;
    const agency = agencyData ?? null;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => { clearInterval(interval); clearInterval(clockInterval); };
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                credentials: 'same-origin',
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const navItems = [
        { label: 'Dashboard', href: route('agency.dashboard'), active: route().current('agency.dashboard'), icon: LayoutDashboard },
        { label: 'Job Vacancies', href: route('agency.jobs'), active: route().current('agency.jobs'), icon: Briefcase },
        { label: 'Members', href: route('agency.members'), active: route().current('agency.members'), icon: UserPlus },
        { label: 'Reports', href: route('agency.reports'), active: route().current('agency.reports'), icon: BarChart3 },
        { label: 'Settings', href: route('agency.settings'), active: route().current('agency.settings'), icon: Settings },
    ];

    const renderNavLinks = (onNavigate) => navItems.map((item) => {
        const Icon = item.icon;
        return (
            <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    item.active
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
            >
                <Icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-blue-600' : 'text-blue-500'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-red-500 text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                    </span>
                )}
                {item.active && !item.badge && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />
                )}
            </Link>
        );
    });

    const renderLogout = () => (
        <Link
            href={route('agency.logout')}
            method="post"
            as="button"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <aside className={`${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white text-slate-700 shadow-xl transition-all duration-300 hidden md:flex`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-100 ring-2 ring-blue-200">
                                {agency?.logo ? (
                                    <img src={`/storage/${agency.logo}`} alt="Agency Logo" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-blue-600">{(agency?.agency_name || user?.name || 'A').charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">Agency Portal</p>
                                <p className="text-xs text-slate-500">AGENCY PORTAL</p>
                            </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="space-y-1">
                                {renderNavLinks()}
                            </div>
                        </nav>

                        <div className="border-t border-slate-200 px-4 py-4 space-y-3">
                            {renderLogout()}
                            <div className="px-2">
                                <p className="text-xs text-slate-400">© {new Date().getFullYear()} Agency Portal</p>
                                <p className="text-xs text-slate-500">All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <aside className={`${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'} fixed left-0 top-0 bottom-0 z-30 flex-col bg-white text-slate-700 shadow-xl transition-transform duration-300 md:hidden flex`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-100 ring-2 ring-blue-200">
                                {agency?.logo ? (
                                    <img src={`/storage/${agency.logo}`} alt="Agency Logo" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-blue-600">{(agency?.agency_name || user?.name || 'A').charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">Agency Portal</p>
                                <p className="text-xs text-slate-500">AGENCY PORTAL</p>
                            </div>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="space-y-1">
                                {renderNavLinks(() => setSidebarOpen(false))}
                            </div>
                        </nav>
                        <div className="border-t border-slate-200 px-4 py-4">
                            {renderLogout()}
                        </div>
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : ''}`}>
                    {/* Header */}
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <div className="hidden md:block">
                                <p className="text-lg font-bold tracking-wide text-slate-800">AGENCY PORTAL</p>
                                <p className="text-xs text-slate-500 truncate max-w-xs">{agency?.agency_name ?? user?.name ?? 'Agency'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 lg:flex">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <Clock className="ml-1 h-4 w-4 text-slate-400" />
                                <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setNotificationOpen(!notificationOpen)}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notificationOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                                <button onClick={() => setNotificationOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-500 text-sm">
                                                        <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                                        No notifications
                                                    </div>
                                                ) : (
                                                    notifications.slice(0, 10).map((notif) => (
                                                        <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.read_at ? 'bg-blue-50/50' : ''}`}>
                                                            <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" style={{ opacity: notif.read_at ? 0 : 1 }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-slate-900 font-medium truncate">{notif.title || notif.type}</p>
                                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                                <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(notif.created_at)}</p>
                                                            </div>
                                                            {!notif.read_at && (
                                                                <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <Link href={route('agency.notifications')} className="block px-4 py-3 text-center text-sm text-blue-600 hover:bg-slate-50 border-t border-slate-100 font-medium">
                                                View all notifications
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                                    {(user?.name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs font-semibold text-slate-900">{user?.name ?? 'Agency User'}</p>
                                    <p className="text-[10px] text-slate-500">Agency Account</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-4 sm:p-6 lg:p-8">
                        {header && <div className="mb-6">{header}</div>}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}