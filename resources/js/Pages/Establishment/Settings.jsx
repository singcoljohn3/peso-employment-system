import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Settings as SettingsIcon, 
    User, 
    Lock, 
    Bell, 
    Shield,
    Building2,
    Mail,
    Phone,
    MapPin,
    Save,
    Key,
    CheckCircle
} from 'lucide-react';

export default function Settings() {
    const { establishment, user } = usePage().props;
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);

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
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-blue-800">Password Change</p>
                                                    <p className="text-sm text-blue-600">Password change functionality will be implemented soon.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowPasswordForm(false)}
                                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Close
                                            </button>
                                        </div>
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
                                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        Company Settings
                                    </h2>
                                    <div className="space-y-6">
                                        {establishment ? (
                                            <>
                                                <div className="p-4 bg-slate-50 rounded-lg">
                                                    <p className="font-medium text-slate-800 mb-2">{establishment.company_name}</p>
                                                    <div className="space-y-2 text-sm text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-slate-400" />
                                                            <span>{establishment.email || 'Not set'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-slate-400" />
                                                            <span>{establishment.contact_number || 'Not set'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-slate-400" />
                                                            <span>{establishment.address || 'Not set'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                        <div>
                                                            <p className="font-medium text-green-800">Account Verified</p>
                                                            <p className="text-sm text-green-600">Your establishment account is verified and active</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-8 text-center bg-slate-50 rounded-lg">
                                                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                                <p className="text-slate-600 mb-4">No company profile found</p>
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                    Create Company Profile
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
