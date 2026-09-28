import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import CompanyProfileForm from '@/Components/Establishment/CompanyProfileForm';
import { Head, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Settings as SettingsIcon, 
    User, 
    Lock, 
    Bell, 
    Shield,
    Building2,
    Save,
    Key,
    CheckCircle,
    AlertCircle,
    Edit,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';

export default function Settings() {
    const { establishment, user, barangays } = usePage().props;
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [isCompanyEditing, setIsCompanyEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'company', label: 'Company Settings', icon: Building2 },
    ];

    const handleEditProfile = () => {
        setShowProfileForm(true);
    };

    const handlePasswordChange = () => {
        setShowPasswordForm(true);
    };

    const submitPasswordChange = (e) => {
        e.preventDefault();
        putPassword(route('establishment.settings.password'), {
            onSuccess: () => {
                setShowPasswordForm(false);
                resetPassword();
            },
        });
    };

    return (
        <EstablishmentLayouts>
            <Head title="Settings" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your account and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" />
                                        Profile Settings
                                    </h2>
                                    
                                    {!showProfileForm ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                    {user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{user?.name}</p>
                                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                                    <p className="text-xs text-slate-400 mt-1">Account: {user?.role}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-50 rounded-lg">
                                                    <p className="text-sm font-medium text-slate-600 mb-1">Full Name</p>
                                                    <p className="text-slate-800">{user?.name || 'Not set'}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-lg">
                                                    <p className="text-sm font-medium text-slate-600 mb-1">Email Address</p>
                                                    <p className="text-slate-800">{user?.email || 'Not set'}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleEditProfile}
                                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <Save className="h-4 w-4" />
                                                Edit Profile
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-blue-800">Profile Editing</p>
                                                    <p className="text-sm text-blue-600">To edit your profile, please visit the Company Profile page.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowProfileForm(false)}
                                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-blue-600" />
                                        Security Settings
                                    </h2>
                                    
                                    {!showPasswordForm ? (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-sm font-medium text-slate-600 mb-1">Password</p>
                                                <p className="text-slate-800">••••••••</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-sm font-medium text-slate-600 mb-1">Last Password Change</p>
                                                <p className="text-slate-800">Not recorded</p>
                                            </div>

                                            <button
                                                onClick={handlePasswordChange}
                                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <Key className="h-4 w-4" />
                                                Change Password
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={submitPasswordChange} className="space-y-5">
                                            {passwordErrors.current_password && (
                                                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                                    <p className="text-sm text-red-600">{passwordErrors.current_password}</p>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                    Current Password <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={passwordData.current_password}
                                                        onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                        className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter current password"
                                                        required
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
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                    New Password <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordData.password}
                                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                                        className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter new password (min 8 characters)"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {passwordErrors.password && (
                                                    <p className="mt-1 text-xs text-red-600">{passwordErrors.password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                    Confirm New Password <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={passwordData.password_confirmation}
                                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                        className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Confirm new password"
                                                        required
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

                                            <div className="flex items-center gap-3 pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={passwordProcessing}
                                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {passwordProcessing ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4" />
                                                            Update Password
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowPasswordForm(false); resetPassword(); }}
                                                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-blue-600" />
                                        Notification Preferences
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">New Application Alerts</p>
                                                <p className="text-sm text-slate-500">Receive notifications when new applications are submitted</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">Hiring Status Updates</p>
                                                <p className="text-sm text-slate-500">Get notified when applicant status changes</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">Job Expiry Reminders</p>
                                                <p className="text-sm text-slate-500">Remind before job postings expire</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">Email Notifications</p>
                                                <p className="text-sm text-slate-500">Receive notifications via email</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'company' && (
                                <div>
                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                            Company Settings
                                        </h2>
                                        {!isCompanyEditing && (
                                            <button
                                                type="button"
                                                onClick={() => setIsCompanyEditing(true)}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit Company Profile
                                            </button>
                                        )}
                                    </div>

                                    <CompanyProfileForm
                                        establishment={establishment}
                                        barangays={barangays}
                                        isEditing={isCompanyEditing}
                                        setIsEditing={setIsCompanyEditing}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
