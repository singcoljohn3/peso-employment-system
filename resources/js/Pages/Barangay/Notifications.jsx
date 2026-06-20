import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Bell,
    User,
    Briefcase,
    CheckCircle,
    Clock,
    X,
    Calendar,
    Filter,
    Check
} from 'lucide-react';

export default function Notifications({ barangay }) {
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'applicant',
            title: 'New job seeker registered',
            message: 'Juan Dela Cruz has registered as a job seeker',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            type: 'referral',
            title: 'Job referral update',
            message: 'Maria Santos has been scheduled for interview at ABC Company',
            time: '5 hours ago',
            read: false
        },
        {
            id: 3,
            type: 'hiring',
            title: 'Applicant hired',
            message: 'Pedro Reyes has been hired by XYZ Corporation',
            time: '1 day ago',
            read: true
        },
        {
            id: 4,
            type: 'job',
            title: 'New job vacancy posted',
            message: 'Tech Solutions Inc. posted a new Software Developer position',
            time: '2 days ago',
            read: true
        },
        {
            id: 5,
            type: 'announcement',
            title: 'PESO training schedule',
            message: 'Skills training program scheduled for next week',
            time: '3 days ago',
            read: true
        }
    ]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'applicant':
                return <User className="h-5 w-5 text-blue-500" />;
            case 'referral':
                return <Briefcase className="h-5 w-5 text-amber-500" />;
            case 'hiring':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'job':
                return <Briefcase className="h-5 w-5 text-purple-500" />;
            case 'announcement':
                return <Bell className="h-5 w-5 text-red-500" />;
            default:
                return <Bell className="h-5 w-5 text-slate-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'applicant':
                return 'bg-blue-50 border-blue-200';
            case 'referral':
                return 'bg-amber-50 border-amber-200';
            case 'hiring':
                return 'bg-green-50 border-green-200';
            case 'job':
                return 'bg-purple-50 border-purple-200';
            case 'announcement':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-slate-50 border-slate-200';
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Notifications
                </h2>
            }
        >
            <Head title="Notifications" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Notifications</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Stay updated with barangay employment activities
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Check className="h-4 w-4" />
                                Mark All as Read
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Notifications</p>
                                    <p className="text-lg font-bold text-slate-900">{notifications.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Unread</p>
                                    <p className="text-lg font-bold text-slate-900">{unreadCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Read</p>
                                    <p className="text-lg font-bold text-slate-900">{notifications.length - unreadCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="mb-6 flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                filter === 'unread'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                filter === 'read'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Read
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`rounded-xl border p-4 shadow-sm transition-all ${
                                        notification.read
                                            ? 'bg-white border-slate-200'
                                            : 'bg-white border-blue-300 shadow-md'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className={`font-semibold ${notification.read ? 'text-slate-900' : 'text-blue-900'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Mark Read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar className="h-3 w-3" />
                                                {notification.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                <Bell className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-slate-500">No notifications found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}
