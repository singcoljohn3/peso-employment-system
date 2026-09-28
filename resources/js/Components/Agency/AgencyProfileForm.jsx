import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Save, X, Upload, Building2, User, Phone, Mail, MapPin,
    FileText, Briefcase, Hash, Building, Landmark, Globe, Edit2
} from 'lucide-react';

export default function AgencyProfileForm({ agency, barangays }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        agency_name: agency?.agency_name ?? '',
        contact_person: agency?.contact_person ?? '',
        contact_number: agency?.contact_number ?? '',
        email: agency?.email ?? '',
        address: agency?.address ?? '',
        barangay_id: agency?.barangay_id ?? '',
        city: agency?.city ?? '',
        province: agency?.province ?? '',
        industry_category: agency?.industry_category ?? '',
        description: agency?.description ?? '',
        agency_type: agency?.agency_type ?? '',
        license_number: agency?.license_number ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('agency.profile.update'), {
            onSuccess: () => setEditing(false),
        });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('logo', file);
        try {
            await fetch(route('agency.profile.logo'), {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '') },
                credentials: 'same-origin',
            });
            router.reload();
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleRemoveLogo = async () => {
        try {
            await fetch(route('agency.profile.logo.remove'), {
                method: 'DELETE',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '') },
                credentials: 'same-origin',
            });
            router.reload();
        } catch (err) {
            console.error('Remove failed:', err);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm";
    const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
    const errorClass = "mt-1 text-xs text-red-600";
    const panelClass = "bg-white rounded-xl border border-slate-200 shadow-sm p-6";
    const panelHeaderClass = "flex items-center gap-3 mb-5 pb-4 border-b border-slate-200";
    const sectionTitleClass = "text-lg font-semibold text-slate-900";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Agency Profile</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your agency information</p>
                </div>
                {!editing && (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm text-sm">
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                    </button>
                )}
            </div>

            {editing ? (
                <form onSubmit={submit} className="space-y-6">
                    {/* Logo Upload */}
                    <div className={panelClass}>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="h-28 w-28 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                    {agency?.logo ? (
                                        <img src={`/storage/${agency.logo}`} alt="Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 className="h-12 w-12 text-slate-400" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Upload className="h-6 w-6 text-white mb-1" />
                                    <span className="text-xs text-white font-medium">Upload Logo</span>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Agency Logo</h3>
                                <p className="text-sm text-slate-500 mt-1">Upload your agency/company logo</p>
                                <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP. Max 2MB.</p>
                                {agency?.logo && (
                                    <button type="button" onClick={handleRemoveLogo} className="mt-2 text-xs text-red-600 hover:text-red-700 transition-colors">
                                        Remove logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className={panelClass}>
                        <div className={panelHeaderClass}>
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <h2 className={sectionTitleClass}>Basic Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Agency/Company Name *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.agency_name} onChange={(e) => setData('agency_name', e.target.value)} className={`${inputClass} pl-10`} placeholder="Enter agency name" required />
                                </div>
                                {errors.agency_name && <p className={errorClass}>{errors.agency_name}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Agency Type</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <select value={data.agency_type} onChange={(e) => setData('agency_type', e.target.value)} className={`${inputClass} pl-10`}>
                                        <option value="">Select type</option>
                                        <option value="Recruitment Agency">Recruitment Agency</option>
                                        <option value="Staffing Agency">Staffing Agency</option>
                                        <option value="Manpower Agency">Manpower Agency</option>
                                        <option value="Outsourcing Company">Outsourcing Company</option>
                                        <option value="Direct Hire">Direct Hire</option>
                                        <option value="Government Agency">Government Agency</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Industry Category</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.industry_category} onChange={(e) => setData('industry_category', e.target.value)} className={`${inputClass} pl-10`} placeholder="e.g. IT, Healthcare, Construction" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>License/Registration Number</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.license_number} onChange={(e) => setData('license_number', e.target.value)} className={`${inputClass} pl-10`} placeholder="Enter license number" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className={panelClass}>
                        <div className={panelHeaderClass}>
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg">
                                <Phone className="h-5 w-5 text-white" />
                            </div>
                            <h2 className={sectionTitleClass}>Contact Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Contact Person / HR Representative *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} className={`${inputClass} pl-10`} placeholder="Full name" required />
                                </div>
                                {errors.contact_person && <p className={errorClass}>{errors.contact_person}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} className={`${inputClass} pl-10`} placeholder="09XX XXX XXXX" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Official Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={`${inputClass} pl-10`} placeholder="agency@example.com" required />
                                </div>
                                {errors.email && <p className={errorClass}>{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className={panelClass}>
                        <div className={panelHeaderClass}>
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg">
                                <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <h2 className={sectionTitleClass}>Address Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Complete Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)} className={`${inputClass} pl-10`} placeholder="Street address, building, etc." />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Barangay</label>
                                <div className="relative">
                                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <select value={data.barangay_id} onChange={(e) => setData('barangay_id', e.target.value)} className={`${inputClass} pl-10`}>
                                        <option value="">Select barangay</option>
                                        {barangays?.map((b) => (
                                            <option key={b.id} value={b.id}>{b.barangay_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>City/Municipality</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.city} onChange={(e) => setData('city', e.target.value)} className={`${inputClass} pl-10`} placeholder="City or municipality" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Province</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={data.province} onChange={(e) => setData('province', e.target.value)} className={`${inputClass} pl-10`} placeholder="Province" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className={panelClass}>
                        <div className={panelHeaderClass}>
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 to-purple-400 flex items-center justify-center shadow-lg">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <h2 className={sectionTitleClass}>Agency Description</h2>
                        </div>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={5}
                            className={`${inputClass} resize-none`}
                            placeholder="Tell us about your agency, services, mission, and expertise..."
                        />
                        <p className="text-xs text-slate-400 mt-2">{data.description?.length ?? 0}/2000 characters</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pb-4">
                        <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all">
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="relative group">
                                <div className="h-28 w-28 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                                    {agency?.logo ? (
                                        <img src={`/storage/${agency.logo}`} alt="Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 className="h-12 w-12 text-slate-400" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Upload className="h-5 w-5 text-white mb-1" />
                                    <span className="text-[10px] text-white font-medium">Change</span>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900">{agency?.agency_name ?? 'Not Set'}</h2>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    {agency?.agency_type && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                            <Briefcase className="h-3 w-3" />
                                            {agency.agency_type}
                                        </span>
                                    )}
                                    {agency?.industry_category && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                            <Globe className="h-3 w-3" />
                                            {agency.industry_category}
                                        </span>
                                    )}
                                    {agency?.license_number && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200">
                                            <Hash className="h-3 w-3" />
                                            {agency.license_number}
                                        </span>
                                    )}
                                </div>
                                {agency?.logo && (
                                    <button onClick={handleRemoveLogo} className="mt-2 text-xs text-red-600 hover:text-red-700 transition-colors">
                                        Remove logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <div className={panelHeaderClass}>
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg">
                                    <Phone className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">Contact Information</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { icon: User, label: 'Contact Person', value: agency?.contact_person },
                                    { icon: Phone, label: 'Contact Number', value: agency?.contact_number },
                                    { icon: Mail, label: 'Official Email', value: agency?.email },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-3">
                                        <item.icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                                            <p className="text-sm text-slate-800 mt-0.5">{item.value || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <div className={panelHeaderClass}>
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">Address Information</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Complete Address', value: agency?.address },
                                    { label: 'Barangay', value: agency?.barangay?.barangay_name },
                                    { label: 'City/Municipality', value: agency?.city },
                                    { label: 'Province', value: agency?.province },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                                            <p className="text-sm text-slate-800 mt-0.5">{item.value || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {agency?.description && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <div className={panelHeaderClass}>
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 to-purple-400 flex items-center justify-center shadow-lg">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">Agency Description</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{agency.description}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}