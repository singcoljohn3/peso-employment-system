import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Bell,
    User,
    Briefcase,
    CheckCircle,
    Clock,
    X,
    Check,
    Filter,
    CalendarCheck,
    CalendarX,
    CalendarClock,
    AlertCircle,
    UserCheck
} from 'lucide-react';

export default function Notification() {
    const { establishment, notifications: initialNotifications, unreadCount: initialUnreadCount } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState(initialNotifications || []);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount || 0);

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    });

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
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, read: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_application':
                return <User className="h-5 w-5 text-blue-600" />;
            case 'interview_scheduled':
                return <CalendarCheck className="h-5 w-5 text-green-600" />;
            case 'interview_cancelled':
                return <CalendarX className="h-5 w-5 text-red-600" />;
            case 'interview_rescheduled':
                return <CalendarClock className="h-5 w-5 text-orange-600" />;
            case 'application_status':
                return <UserCheck className="h-5 w-5 text-purple-600" />;
            case 'account_approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'account_rejected':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Bell className="h-5 w-5 text-slate-600" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'new_application':
                return 'bg-blue-100';
            case 'interview_scheduled':
                return 'bg-green-100';
            case 'interview_cancelled':
                return 'bg-red-100';
            case 'interview_rescheduled':
                return 'bg-orange-100';
            case 'application_status':
                return 'bg-purple-100';
            case 'account_approved':
                return 'bg-green-100';
            case 'account_rejected':
                return 'bg-red-100';
            default:
                return 'bg-slate-100';
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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <EstablishmentLayouts>
            <Head title="Notifications" />

            <div className="p-6">
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
                        <p className="text-slate-500 mt-1">
                            Stay updated with your hiring activities
                            {unreadCount > 0 && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {unreadCount} unread
                                </span>
                            )}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Check className="h-4 w-4" />
                            Mark All as Read
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                            { key: 'read', label: 'Read' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === tab.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    {filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-slate-200">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer ${
                                        !notification.read ? 'bg-blue-50/50' : ''
                                    }`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full shrink-0 ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-slate-800">
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read && (
                                                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    {notification.data && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {notification.data.company_name && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                                                    {notification.data.company_name}
                                                                </span>
                                                            )}
                                                            {notification.data.interview_date && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                                    {notification.data.interview_date}
                                                                </span>
                                                            )}
                                                            {notification.data.interview_time && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                                    {notification.data.interview_time}
                                                                </span>
                                                            )}
                                                            {notification.data.interview_type && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                                                    {notification.data.interview_type}
                                                                </span>
                                                            )}
                                                            {notification.data.status && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                                                    Status: {notification.data.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-slate-400 text-sm mt-2 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTimeAgo(notification.created_at)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                        className="flex-shrink-0 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4 text-slate-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Notifications</h3>
                            <p className="text-slate-500">
                                {filter === 'unread'
                                    ? 'No unread notifications'
                                    : filter === 'read'
                                    ? 'No read notifications'
                                    : 'No notifications yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
