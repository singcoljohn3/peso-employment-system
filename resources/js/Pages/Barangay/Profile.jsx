import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    User,
    MapPin,
    Mail,
    Phone,
    Building2,
    Camera,
    Save,
    Upload
} from 'lucide-react';

export default function BarangayProfile({ barangay }) {
    const [showLogoUpload, setShowLogoUpload] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        barangay_name: barangay?.barangay_name || '',
        municipality: barangay?.municipality || '',
        contact_person: barangay?.contact_person || '',
        contact_number: barangay?.contact_number || '',
        contact_email: barangay?.contact_email || '',
        logo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('barangay.profile.update'));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
        }
    };

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Barangay Profile
                </h2>
            }
        >
            <Head title="Barangay Profile" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">Barangay Profile</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Manage your barangay information and contact details
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100">
                                            {barangay?.logo ? (
                                                <img
                                                    src={`/storage/${barangay.logo}`}
                                                    alt="Barangay Logo"
                                                    className="h-32 w-32 rounded-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="h-16 w-16 text-blue-600" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowLogoUpload(!showLogoUpload)}
                                            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            <Camera className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">{barangay?.barangay_name || 'Barangay Name'}</h4>
                                    <p className="mt-1 text-sm text-slate-600">{barangay?.municipality || 'Municipality'}</p>
                                    
                                    {showLogoUpload && (
                                        <div className="mt-4 w-full">
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Upload Logo</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="hidden"
                                                    id="logo-upload"
                                                />
                                                <label
                                                    htmlFor="logo-upload"
                                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-blue-500 hover:bg-blue-50"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Choose file
                                                </label>
                                            </div>
                                            {data.logo && (
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Selected: {data.logo.name}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span>{barangay?.municipality || 'Location not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span>{barangay?.contact_email || 'Email not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{barangay?.contact_number || 'Phone not specified'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="lg:col-span-2">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">Barangay Name</label>
                                            <input
                                                type="text"
                                                value={data.barangay_name}
                                                onChange={(e) => setData('barangay_name', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Enter barangay name"
                                            />
                                            {errors.barangay_name && (
                                                <p className="mt-1 text-xs text-red-600">{errors.barangay_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">Municipality</label>
                                            <input
                                                type="text"
                                                value={data.municipality}
                                                onChange={(e) => setData('municipality', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Enter municipality"
                                            />
                                            {errors.municipality && (
                                                <p className="mt-1 text-xs text-red-600">{errors.municipality}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Contact Person</label>
                                        <input
                                            type="text"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Enter contact person name"
                                        />
                                        {errors.contact_person && (
                                            <p className="mt-1 text-xs text-red-600">{errors.contact_person}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">Contact Number</label>
                                            <input
                                                type="text"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Enter contact number"
                                            />
                                            {errors.contact_number && (
                                                <p className="mt-1 text-xs text-red-600">{errors.contact_number}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">Contact Email</label>
                                            <input
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Enter contact email"
                                            />
                                            {errors.contact_email && (
                                                <p className="mt-1 text-xs text-red-600">{errors.contact_email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}
