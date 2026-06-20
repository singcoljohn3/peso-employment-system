import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Bell, 
    User, 
    Briefcase, 
    CheckCircle, 
    Clock,
    X,
    Check,
    Filter
} from 'lucide-react';

export default function Notification() {
    const { establishment, notifications } = usePage().props;
    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications?.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    }) || [];

    const markAsRead = (id) => {
        // Placeholder for marking notification as read
        console.log('Mark as read:', id);
    };

    const markAllAsRead = () => {
        // Placeholder for marking all notifications as read
        console.log('Mark all as read');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_application':
                return <User className="h-5 w-5 text-blue-600" />;
            case 'job_update':
                return <Briefcase className="h-5 w-5 text-purple-600" />;
            case 'hiring_update':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            default:
                return <Bell className="h-5 w-5 text-slate-600" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'new_application':
                return 'bg-blue-100';
            case 'job_update':
                return 'bg-purple-100';
            case 'hiring_update':
                return 'bg-green-100';
            default:
                return 'bg-slate-100';
        }
    };

    return (
        <EstablishmentLayouts>
            <Head title="Notifications" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
                        <p className="text-slate-500 mt-1">Stay updated with your hiring activities</p>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Check className="h-4 w-4" />
                        Mark All as Read
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'all' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'unread' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'read' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Read
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    {filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-slate-200">
                            {filteredNotifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`p-6 hover:bg-slate-50 transition-colors ${
                                        !notification.read ? 'bg-blue-50/50' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-slate-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-slate-400 text-sm mt-2 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
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
                                    : 'No notifications yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
