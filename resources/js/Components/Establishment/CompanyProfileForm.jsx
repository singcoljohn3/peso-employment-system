import { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Save,
    Upload,
    Camera,
    X,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const fieldClasses = (disabled, hasError) =>
    `block w-full rounded-xl border px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        disabled ? 'bg-slate-50' : 'bg-white'
    } ${hasError ? 'border-red-500' : 'border-slate-300'}`;

export default function CompanyProfileForm({
    establishment,
    barangays,
    isEditing = false,
    setIsEditing = () => {},
    showEditButton = false,
}) {
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoNotif, setLogoNotif] = useState(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        company_name: establishment?.company_name || '',
        contact_person: establishment?.contact_person || '',
        contact_number: establishment?.contact_number || '',
        email: establishment?.email || '',
        barangay_id: establishment?.barangay_id || '',
        description: establishment?.description || '',
    });

    useEffect(() => {
        if (!establishment) return;

        setData({
            company_name: establishment?.company_name || '',
            contact_person: establishment?.contact_person || '',
            contact_number: establishment?.contact_number || '',
            email: establishment?.email || '',
            barangay_id: establishment?.barangay_id || '',
            description: establishment?.description || '',
        });
    }, [establishment]);

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

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);

        setLogoUploading(true);
        setLogoNotif(null);
        const formData = new FormData();
        formData.append('logo', file);
        try {
            await axios.post('/establishment/profile/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setLogoNotif({ type: 'success', message: 'Logo uploaded successfully.' });
            setLogoPreview(null);
            router.reload({ only: ['establishment'], preserveState: true, preserveScroll: true });
        } catch (err) {
            const msg = err.response?.data?.errors?.logo?.[0] || 'Failed to upload logo.';
            setLogoNotif({ type: 'error', message: msg });
            setLogoPreview(null);
        } finally {
            setLogoUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveLogo = async () => {
        setLogoUploading(true);
        setLogoNotif(null);
        try {
            await axios.delete('/establishment/profile/logo');
            setLogoPreview(null);
            router.reload({ only: ['establishment'], preserveState: true, preserveScroll: true });
            setLogoNotif({ type: 'success', message: 'Logo removed successfully.' });
        } catch (err) {
            setLogoNotif({ type: 'error', message: 'Failed to remove logo.' });
        } finally {
            setLogoUploading(false);
        }
    };

    if (!establishment) {
        return (
            <div className="p-8 text-center bg-slate-50 rounded-lg">
                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No company profile found</p>
                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Create Company Profile
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Company Logo */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900">Company Logo</h4>
                            {(logoPreview || establishment?.logo) && (
                                <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    disabled={logoUploading}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="mt-5 flex flex-col items-center">
                            <label className="relative mb-4 cursor-pointer">
                                {logoUploading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    </div>
                                )}
                                {logoPreview || establishment?.logo ? (
                                    <img
                                        src={logoPreview || `/storage/${establishment?.logo}`}
                                        alt="Company Logo"
                                        className="h-28 w-28 rounded-2xl border border-slate-200 object-cover shadow-sm hover:opacity-80 transition-opacity"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <Camera className="h-10 w-10 text-slate-400" />
                                    </div>
                                )}
                                <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    disabled={logoUploading}
                                    className="hidden"
                                />
                            </label>
                            <div className="w-full">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <Upload className="mt-0.5 h-4 w-4 text-slate-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Click the logo to upload</p>
                                            <p className="text-xs text-slate-600">JPG, PNG or WebP. Max 2MB. Square recommended.</p>
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
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Company Information</h4>
                                    <p className="mt-1 text-xs text-slate-600">These details are shown on your job posts.</p>
                                </div>

                                {showEditButton && !isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                                    >
                                        Edit Profile
                                    </button>
                                )}

                                {isEditing && (
                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
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
                                )}
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
                                            className={fieldClasses(!isEditing, errors.company_name)}
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
                                            className={fieldClasses(!isEditing, errors.contact_person)}
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
                                            className={fieldClasses(!isEditing, errors.email)}
                                            placeholder="company@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                                            className={fieldClasses(!isEditing, errors.contact_number)}
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
                                            className={fieldClasses(!isEditing, errors.barangay_id)}
                                        >
                                            <option value="">Select Barangay</option>
                                            {barangays?.map((barangay) => (
                                                <option key={barangay.id} value={barangay.id}>
                                                    {barangay.barangay_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.barangay_id && <p className="mt-1 text-sm text-red-600">{errors.barangay_id}</p>}
                                </div>

                                {/* Agency Description */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
                                        Company Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        disabled={!isEditing}
                                        rows={4}
                                        className={`block w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                            !isEditing ? 'bg-slate-50' : 'bg-white'
                                        } ${errors.description ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="Brief description of your company..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Logo Upload Notification */}
            {logoNotif && (
                <div
                    className={`mt-6 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-sm ${
                        logoNotif.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                >
                    {logoNotif.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0" />
                    )}
                    <p className="text-sm font-medium">{logoNotif.message}</p>
                    <button
                        type="button"
                        onClick={() => setLogoNotif(null)}
                        className="ml-auto shrink-0 opacity-60 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </>
    );
}
