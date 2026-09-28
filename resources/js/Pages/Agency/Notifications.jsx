import { Head } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import { Bell, CheckCheck } from 'lucide-react';

export default function Notifications({ agency, notifications, unreadCount }) {
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
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Notifications</h2>}>
            <Head title="Notifications" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-slate-500 text-sm mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notif) => (
                                <div key={notif.id} className={`flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                                    <div className="mt-1.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" style={{ opacity: notif.read ? 0 : 1 }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                                        <p className="text-sm text-slate-500 mt-1">{notif.message}</p>
                                        <p className="text-xs text-slate-400 mt-2">{formatTimeAgo(notif.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AgencyLayouts>
    );
}