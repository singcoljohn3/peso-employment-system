import BarangayLayout from '@/Layouts/BarangayLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Trash2,
    Download,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Residents({ residents, barangay }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResidents = residents.data.filter(resident => {
        const matchesSearch = 
            resident.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    return (
        <BarangayLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Residents Management
                </h2>
            }
        >
            <Head title="Residents" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Barangay Residents</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Manage residents of {barangay?.barangay_name || 'your barangay'}
                            </p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search residents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Residents</p>
                                    <p className="text-lg font-bold text-slate-900">{residents.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <User className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Job Seekers</p>
                                    <p className="text-lg font-bold text-slate-900">{residents.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                    <MapPin className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Location</p>
                                    <p className="text-sm font-bold text-slate-900">{barangay?.barangay_name || 'Barangay'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Address
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Employment Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Registered
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredResidents.length > 0 ? (
                                        filteredResidents.map((resident) => (
                                            <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                                                            {resident.first_name?.charAt(0)}{resident.last_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {resident.first_name} {resident.last_name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{resident.sex}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Mail className="h-3 w-3" />
                                                            {resident.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Phone className="h-3 w-3" />
                                                            {resident.contact_number}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <MapPin className="h-3 w-3" />
                                                        {resident.address || 'Not specified'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        {resident.employment_status || 'Unemployed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(resident.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">
                                                            <Edit className="h-3 w-3" />
                                                            Edit
                                                        </button>
                                                        <button className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                <User className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                                <p>No residents found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {residents.total > residents.per_page && (
                            <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Showing {residents.from} to {residents.to} of {residents.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </button>
                                    <button className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </BarangayLayout>
    );
}
