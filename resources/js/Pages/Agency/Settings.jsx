import { Head, useForm } from '@inertiajs/react';
import AgencyLayouts from '@/Layouts/AgencyLayouts';
import AgencyProfileForm from '@/Components/Agency/AgencyProfileForm';
import { useState } from 'react';
import { Save, Eye, EyeOff, Shield, Building2, UserCog } from 'lucide-react';

export default function Settings({ agency, user, barangays }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('agency.settings.password'), {
            onSuccess: () => reset(),
        });
    };

    const inputClass = "w-full px-4 py-3 pr-12 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

    return (
        <AgencyLayouts header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Settings</h2>}>
            <Head title="Settings" />

            <div className="space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your agency profile and account settings</p>
                </div>

                {/* Settings Navigation */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                            activeTab === 'profile'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <Building2 className="h-4 w-4" />
                        Agency Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                            activeTab === 'account'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <UserCog className="h-4 w-4" />
                        Account Settings
                    </button>
                </div>

                {activeTab === 'profile' ? (
                    <AgencyProfileForm agency={agency} barangays={barangays} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Account Info */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Agency Name</p>
                                    <p className="text-sm text-slate-800">{agency?.agency_name ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-sm text-slate-800">{user?.email ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contact Person</p>
                                    <p className="text-sm text-slate-800">{agency?.contact_person ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contact Number</p>
                                    <p className="text-sm text-slate-800">{agency?.contact_number ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Type</p>
                                    <p className="text-sm text-slate-800 capitalize">{user?.role ?? 'Agency'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                                    <p className="text-xs text-slate-500">Update your account password</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-4 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                                    <div className="relative">
                                        <input type={showCurrent ? 'text' : 'password'} value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} className={inputClass} required />
                                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.current_password && <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <input type={showNew ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)} className={inputClass} required />
                                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <input type={showConfirm ? 'text' : 'password'} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className={inputClass} required />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={processing} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AgencyLayouts>
    );
}