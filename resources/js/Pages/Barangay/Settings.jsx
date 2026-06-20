import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Settings,
    Lock,
    Bell,
    Shield,
    User,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';

export default function BarangaySettings({ barangay }) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Settings
                </h2>
            }
        >
            <Head title="Settings" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">Account Settings</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Settings Navigation */}
                        <div className="lg:col-span-1">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <nav className="space-y-1">
                                    <button className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                                        <Lock className="h-5 w-5" />
                                        Change Password
                                    </button>
                                    <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        <Bell className="h-5 w-5" />
                                        Notifications
                                    </button>
                                    <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        <Shield className="h-5 w-5" />
                                        Security
                                    </button>
                                    <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        <User className="h-5 w-5" />
                                        Account Info
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Settings Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Change Password */}
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-slate-900">Change Password</h4>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Update your password to keep your account secure
                                    </p>
                                </div>
                                <form className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            <Save className="h-4 w-4" />
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Notification Preferences */}
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-slate-900">Notification Preferences</h4>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Choose how you want to receive notifications
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                                            <p className="text-xs text-slate-500">Receive notifications via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">New Applicant Alerts</p>
                                            <p className="text-xs text-slate-500">Get notified when new applicants register</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Job Referral Updates</p>
                                            <p className="text-xs text-slate-500">Get notified about referral status changes</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">PESO Announcements</p>
                                            <p className="text-xs text-slate-500">Receive PESO announcements and updates</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-slate-900">Security Settings</h4>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Manage your account security options
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-500">Add an extra layer of security</p>
                                        </div>
                                        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                            Enable
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Active Sessions</p>
                                            <p className="text-xs text-slate-500">Manage your active login sessions</p>
                                        </div>
                                        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}
