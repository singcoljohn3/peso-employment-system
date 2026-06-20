import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin, FileText, Briefcase, Heart, Map as MapIcon } from 'lucide-react';

export default function JobSeekerDashboard() {
    const user = usePage().props.auth?.user;

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Job Seeker Dashboard" />
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h1>
                        <p className="text-gray-600">You are logged in as a <strong>Job Seeker</strong>.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <Link href={route('jobseeker.map')} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group">
                        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                            <MapIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Job Map</h3>
                        <p className="text-sm text-slate-500 mt-1">Browse establishments near you</p>
                    </Link>

                    <Link href={route('jobseeker.resume')} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-purple-300 transition-all group">
                        <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">My Resume</h3>
                        <p className="text-sm text-slate-500 mt-1">Manage and download your resume</p>
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all cursor-default">
                        <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                            <Briefcase className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Applications</h3>
                        <p className="text-sm text-slate-500 mt-1">Track your job applications</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all cursor-default">
                        <div className="bg-rose-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                            <Heart className="h-6 w-6 text-rose-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Saved</h3>
                        <p className="text-sm text-slate-500 mt-1">View your saved establishments</p>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-blue-800 text-sm">Explore the Job Map</p>
                            <p className="text-xs text-blue-600 mt-1">Find hiring establishments near you, get directions, save your favorites, and discover job matches based on your skills.</p>
                            <Link href={route('jobseeker.map')} className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg mt-2 transition-colors">
                                <MapIcon className="h-3.5 w-3.5" /> Open Job Map
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
