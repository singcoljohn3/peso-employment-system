import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import CompanyProfileForm from '@/Components/Establishment/CompanyProfileForm';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Building2, 
    Edit,
    Mail, 
    MapPin
} from 'lucide-react';

export default function Profile() {
    const { establishment, barangays } = usePage().props;
    const [isEditing, setIsEditing] = useState(false);

    return (
        <EstablishmentLayouts
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Company Profile</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage your establishment’s details</p>
                    </div>

                    {!isEditing && establishment && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Company Profile" />

            <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-slate-50 to-white py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{establishment?.company_name || 'Company Profile'}</h3>
                                <p className="text-sm text-slate-600">Keep your information accurate for applicants.</p>
                            </div>
                        </div>
                    </div>

                    <CompanyProfileForm
                        establishment={establishment}
                        barangays={barangays}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                    />


                    {/* Additional Information Cards */}
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <h4 className="text-sm font-semibold text-slate-900">Account Type</h4>
                            </div>
                            <p className="text-lg font-bold text-slate-900">Establishment</p>
                            <p className="text-sm text-slate-600">Verified Company Account</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Mail className="h-5 w-5 text-green-600" />
                                <h4 className="text-sm font-semibold text-slate-900">Contact Email</h4>
                            </div>
                            <p className="text-sm text-slate-900 break-all">{establishment?.email}</p>
                            <p className="text-xs text-slate-600">Primary contact email</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="h-5 w-5 text-purple-600" />
                                <h4 className="text-sm font-semibold text-slate-900">Barangay</h4>
                            </div>
                            <p className="text-sm text-slate-900">{establishment?.barangay?.barangay_name || 'Not selected'}</p>
                            <p className="text-xs text-slate-600">Company location</p>
                        </div>
                    </div>
                </div>
            </div>
        </EstablishmentLayouts>
    );
}
