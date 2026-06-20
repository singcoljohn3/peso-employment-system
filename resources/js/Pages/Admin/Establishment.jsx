import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useState } from 'react';
import { Plus, X, MapPin, Building2, Home, Users, Phone, Mail, MapPinned, ChevronLeft, ChevronRight, Briefcase, Eye, EyeOff } from 'lucide-react';

export default function Establishment() {
    const { establishments, barangays, region, municipality } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Get pagination data
    const estabs = establishments?.data || [];
    const pagination = establishments;

    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        contact_person: '',
        contact_number: '',
        email: '',
        password: '',
        barangay_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.establishments.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AdminLayouts>
            <Head title="Establishments" />
            {/* Page Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Establishments</p>
                            <p className="text-2xl font-bold text-slate-800">{establishments?.total || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <MapPinned className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Municipality</p>
                            <p className="text-2xl font-bold text-slate-800">{municipality}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Home className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Barangays</p>
                            <p className="text-2xl font-bold text-slate-800">{barangays?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Establishments List</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage establishments in {municipality}, {region}</p>
                    </div>

                </div>

                {/* Table */}
                {estabs && estabs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">ID</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Company Name</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            Contact Person
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            Contact
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Home className="h-3.5 w-3.5" />
                                            Barangay
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {estabs.map((estab, index) => (
                                    <tr key={estab.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                #{estab.id}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {estab.company_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{estab.company_name}</p>
                                                    <p className="text-xs text-slate-500">Establishment</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{estab.contact_person}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{estab.contact_number || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                <MapPin className="h-3 w-3" />
                                                {estab.barangay?.barangay_name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-slate-600">{estab.email || 'N/A'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Building2 className="h-12 w-12 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No establishments found</p>
                        <p className="text-slate-400 text-sm mt-1">Click "Add Establishment" to get started</p>
                    </div>
                )}

                {/* Pagination Footer */}
                {pagination?.data?.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-4">
                            {/* Info */}
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{pagination.from}</span> to <span className="font-semibold text-slate-700">{pagination.to}</span> of <span className="font-semibold text-slate-700">{pagination.total}</span> establishments
                            </p>

                            {/* Pagination Controls */}
                            {pagination.links && pagination.links.length > 3 && (
                                <div className="flex items-center justify-center gap-1">
                                    {/* Previous Button */}
                                    {pagination.prev_page_url ? (
                                        <Link
                                            href={pagination.prev_page_url}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </button>
                                    )}

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {pagination.links.slice(1, -1).map((link, index) => (
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white border border-blue-600'
                                                            : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    {pagination.next_page_url ? (
                                        <Link
                                            href={pagination.next_page_url}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Establishment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Add New Establishment</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Location Info Card */}
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Location Information</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Province</p>
                                        <p className="text-sm font-semibold text-slate-800">{region}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Municipality</p>
                                        <p className="text-sm font-semibold text-slate-800">{municipality}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                    <div className="bg-orange-100 p-2 rounded-lg">
                                        <Home className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500">Barangay</p>
                                        <select
                                            value={data.barangay_id}
                                            onChange={(e) => setData('barangay_id', e.target.value)}
                                            className="text-sm font-semibold text-slate-800 bg-transparent border-none focus:outline-none p-0 w-full"
                                        >
                                            <option value="">Select Barangay</option>
                                            {barangays?.map((brgy) => (
                                                <option key={brgy.id} value={brgy.id}>
                                                    {brgy.barangay_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.barangay_id && (
                                            <p className="text-red-500 text-xs mt-1">{errors.barangay_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Enter company name"
                                    />
                                    {errors.company_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                                        <input
                                            type="text"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Enter contact person"
                                        />
                                        {errors.contact_person && (
                                            <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                        <input
                                            type="text"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="09XX-XXX-XXXX"
                                        />
                                        {errors.contact_number && (
                                            <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Enter a password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>
                                <input type="hidden" value={data.barangay_id} />
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Establishment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
