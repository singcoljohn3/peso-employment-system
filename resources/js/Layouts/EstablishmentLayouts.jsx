import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Building2,
    FileText,
    UserCheck,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Bell,
    User,
    Search,
    Calendar,
    Shield,
    Clock,
    CalendarCheck,
    CalendarX,
    CalendarClock,
    AlertCircle,
    CheckCircle,
    Check
} from 'lucide-react';

export default function EstablishmentLayouts({ header, children }) {
    const { auth, establishment: estData } = usePage().props;
    const user = auth?.user;
    const establishment = estData ?? null;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
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
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                credentials: 'same-origin',
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'new_application': return <User className="h-4 w-4 text-blue-600" />;
            case 'interview_scheduled': return <CalendarCheck className="h-4 w-4 text-green-600" />;
            case 'interview_cancelled': return <CalendarX className="h-4 w-4 text-red-600" />;
            case 'interview_rescheduled': return <CalendarClock className="h-4 w-4 text-orange-600" />;
            case 'application_status': return <UserCheck className="h-4 w-4 text-purple-600" />;
            default: return <Bell className="h-4 w-4 text-slate-600" />;
        }
    };

    const getNotifBg = (type) => {
        switch (type) {
            case 'new_application': return 'bg-blue-100';
            case 'interview_scheduled': return 'bg-green-100';
            case 'interview_cancelled': return 'bg-red-100';
            case 'interview_rescheduled': return 'bg-orange-100';
            case 'application_status': return 'bg-purple-100';
            default: return 'bg-slate-100';
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
        {
            label: 'Dashboard',
            href: route('establishment.dashboard'),
            active: route().current('establishment.dashboard'),
            icon: LayoutDashboard,
        },
        {
            label: 'Company Profile',
            href: route('establishment.profile'),
            active: route().current('establishment.profile'),
            icon: Building2,
        },
        {
            label: 'Job Vacancies',
            href: route('establishment.jobs'),
            active: route().current('establishment.jobs'),
            icon: Briefcase,
        },
        {
            label: 'Applicants',
            href: route('establishment.applicants'),
            active: route().current('establishment.applicants'),
            icon: Users,
        },
        {
            label: 'Hiring Status',
            href: route('establishment.hiring-status'),
            active: route().current('establishment.hiring-status'),
            icon: UserCheck,
        },
        {
            label: 'Reports',
            href: route('establishment.reports'),
            active: route().current('establishment.reports'),
            icon: BarChart3,
        },
        {
            label: 'Notifications',
            href: route('establishment.notifications'),
            active: route().current('establishment.notifications'),
            icon: Bell,
            badge: unreadCount,
        },
        {
            label: 'Settings',
            href: route('establishment.settings'),
            active: route().current('establishment.settings'),
            icon: Settings,
        },
        {
            label: 'Logout',
            href: route('establishment.logout'),
            active: false,
            icon: LogOut,
            method: 'post',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-navy-800 shadow-lg">
                                    <Building2 className="h-7 w-7 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 tracking-tight">ESTABLISHMENT</p>
                                <p className="text-xs text-slate-500">Establishment Portal</p>
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
                                                    ? 'bg-gradient-to-r from-blue-700 to-navy-800 text-white shadow-lg shadow-blue-700/30'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="flex-1">{item.label}</span>
                                            {item.badge > 0 && (
                                                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                                                    item.active
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-red-500 text-white'
                                                }`}>
                                                    {item.badge > 99 ? '99+' : item.badge}
                                                </span>
                                            )}
                                            {item.active && !item.badge && (
                                                <ChevronRight className="h-4 w-4 text-white/80" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="border-t border-slate-200/50 px-6 py-4">
                            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="h-5 w-5 text-blue-700" />
                                    <p className="text-xs font-semibold text-blue-900">Secure Portal</p>
                                </div>
                                <p className="text-xs text-blue-600/80">
                                    Your company data is protected with enterprise-grade security
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
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-navy-800 shadow-lg">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">ESTABLISHMENT</p>
                                    <p className="text-xs text-slate-500">Establishment Portal</p>
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
                                                    ? 'bg-gradient-to-r from-blue-700 to-navy-800 text-white shadow-lg'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="flex-1">{item.label}</span>
                                            {item.badge > 0 && (
                                                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                                                    item.active
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-red-500 text-white'
                                                }`}>
                                                    {item.badge > 99 ? '99+' : item.badge}
                                                </span>
                                            )}
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
                                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Establishment Portal</h1>
                                    <p className="text-xs text-slate-500">ESTABLISHMENT</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="hidden md:flex items-center relative">
                                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
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
                                        onClick={() => {
                                            setNotificationOpen(!notificationOpen);
                                            if (!notificationOpen) fetchNotifications();
                                        }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative"
                                    >
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {notificationOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setNotificationOpen(false)}
                                            />
                                            <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">Notifications</p>
                                                        {unreadCount > 0 && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={route('establishment.notifications')}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        View all
                                                    </Link>
                                                </div>
                                                <div className="max-h-80 overflow-y-auto">
                                                    {notifications.length > 0 ? (
                                                        notifications.slice(0, 8).map((notif) => {
                                                            const isUnread = !notif.read_at;
                                                            return (
                                                                <div
                                                                    key={notif.id}
                                                                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0 ${
                                                                        isUnread ? 'bg-blue-50/50' : ''
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (isUnread) markAsRead(notif.id);
                                                                    }}
                                                                >
                                                                    <div className={`p-2 rounded-full shrink-0 ${getNotifBg(notif.type)}`}>
                                                                        {getNotifIcon(notif.type)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-xs font-medium ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                                                            {notif.title}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                                                            {notif.message}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                                            <Clock className="h-2.5 w-2.5" />
                                                                            {formatTimeAgo(notif.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    {isUnread && (
                                                                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1"></span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="px-4 py-8 text-center">
                                                            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                            <p className="text-xs text-slate-500">No notifications yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* User Profile */}
                                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold text-slate-900">{establishment?.company_name ?? user?.name ?? 'Company'}</p>
                                        <p className="text-xs text-slate-500">{establishment?.contact_person ?? 'Establishment'}</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg">
                                        {establishment?.logo ? (
                                            <img
                                                src={`/storage/${establishment.logo}`}
                                                alt={establishment.company_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-700 to-navy-800">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={route('establishment.logout')}
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
