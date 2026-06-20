import { Head, usePage } from '@inertiajs/react';

export default function BaranggayDashboard() {
    const user = usePage().props.auth?.user;

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Baranggay Dashboard" />
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h1>
                        <p className="text-gray-600">You are logged in as a <strong>Baranggay</strong> user.</p>
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">This is your dashboard. More features coming soon.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
