import EstablishmentLayouts from '@/Layouts/EstablishmentLayouts';
import { Head, usePage, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    Building2, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Edit, 
    Save, 
    Upload,
    Camera,
    X
} from 'lucide-react';

export default function Profile() {
    const { establishment, barangays } = usePage().props;
    const [isEditing, setIsEditing] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        company_name: establishment?.company_name || '',
        contact_person: establishment?.contact_person || '',
        contact_number: establishment?.contact_number || '',
        email: establishment?.email || '',
        barangay_id: establishment?.barangay_id || '',
        logo: null,
    });

    useEffect(() => {
        if (!establishment) return;

        setData({
            company_name: establishment?.company_name || '',
            contact_person: establishment?.contact_person || '',
            contact_number: establishment?.contact_number || '',
            email: establishment?.email || '',
            barangay_id: establishment?.barangay_id || '',
            logo: null,
        });
    }, [establishment]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset();
        setLogoPreview(null);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('establishment.profile.update'), {
            forceFormData: true,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <EstablishmentLayouts
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Company Profile</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage your establishment’s details</p>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={handleEdit}
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
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{establishment?.company_name || 'Company Profile'}</h3>
                                    <p className="text-sm text-slate-600">Keep your information accurate for applicants.</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('establishment-profile-submit')?.click()}
                                        disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Logo
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Company Logo */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-900">Company Logo</h4>
                                    {isEditing && logoPreview && (
                                        <button
                                            type="button"
                                            onClick={() => setLogoPreview(null)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="mt-5 flex flex-col items-center">
                                    <div className="relative mb-4">
                                        {logoPreview || establishment?.logo ? (
                                            <img
                                                src={logoPreview || `/storage/${establishment?.logo}`}
                                                alt="Company Logo"
                                                className="h-28 w-28 rounded-2xl border border-slate-200 object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                                                <Building2 className="h-10 w-10 text-slate-400" />
                                            </div>
                                        )}
                                        {isEditing && (
                                            <label className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm cursor-pointer hover:bg-blue-700">
                                                <Camera className="h-5 w-5" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <Upload className="mt-0.5 h-4 w-4 text-slate-600" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">Upload your company logo</p>
                                                    <p className="text-xs text-slate-600">Recommended: square image, clear background.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <form onSubmit={submit}>
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Company Information</h4>
                                            <p className="mt-1 text-xs text-slate-600">These details are shown on your job posts.</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isEditing ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {isEditing ? 'Editing' : 'View only'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        {/* Company Name */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="company_name" className="mb-2 block text-sm font-semibold text-slate-700">
                                                Company Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="company_name"
                                                    type="text"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`block w-full rounded-xl border px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        !isEditing ? 'bg-slate-50' : 'bg-white'
                                                    } ${
                                                        errors.company_name ? 'border-red-500' : 'border-slate-300'
                                                    }`}
                                                    placeholder="Your Company Name"
                                                />
                                            </div>
                                            {errors.company_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                                            )}
                                        </div>

                                        {/* Contact Person */}
                                        <div>
                                            <label htmlFor="contact_person" className="mb-2 block text-sm font-semibold text-slate-700">
                                                Contact Person <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="contact_person"
                                                    type="text"
                                                    value={data.contact_person}
                                                    onChange={(e) => setData('contact_person', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`block w-full rounded-xl border px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        !isEditing ? 'bg-slate-50' : 'bg-white'
                                                    } ${
                                                        errors.contact_person ? 'border-red-500' : 'border-slate-300'
                                                    }`}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            {errors.contact_person && (
                                                <p className="mt-1 text-sm text-red-600">{errors.contact_person}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`block w-full rounded-xl border px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        !isEditing ? 'bg-slate-50' : 'bg-white'
                                                    } ${
                                                        errors.email ? 'border-red-500' : 'border-slate-300'
                                                    }`}
                                                    placeholder="company@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        {/* Contact Number */}
                                        <div>
                                            <label htmlFor="contact_number" className="mb-2 block text-sm font-semibold text-slate-700">
                                                Contact Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="contact_number"
                                                    type="tel"
                                                    value={data.contact_number}
                                                    onChange={(e) => setData('contact_number', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`block w-full rounded-xl border px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        !isEditing ? 'bg-slate-50' : 'bg-white'
                                                    } ${
                                                        errors.contact_number ? 'border-red-500' : 'border-slate-300'
                                                    }`}
                                                    placeholder="+63 912 3456789"
                                                />
                                            </div>
                                            {errors.contact_number && (
                                                <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                                            )}
                                        </div>

                                        {/* Barangay */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="barangay_id" className="mb-2 block text-sm font-semibold text-slate-700">
                                                Barangay <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <select
                                                    id="barangay_id"
                                                    value={data.barangay_id}
                                                    onChange={(e) => setData('barangay_id', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`block w-full appearance-none rounded-xl border bg-white px-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        !isEditing ? 'bg-slate-50' : 'bg-white'
                                                    } ${
                                                        errors.barangay_id ? 'border-red-500' : 'border-slate-300'
                                                    }`}
                                                >
                                                    <option value="">Select Barangay</option>
                                                    {barangays?.map((barangay) => (
                                                        <option key={barangay.id} value={barangay.id}>
                                                            {barangay.barangay_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.barangay_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.barangay_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    {isEditing && (
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                id="establishment-profile-submit"
                                                disabled={processing}
                                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>

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
