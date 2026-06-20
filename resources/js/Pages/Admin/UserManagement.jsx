import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useMemo, useState } from 'react';
import { Plus, X, Users, Shield, Mail, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserManagement() {
    const { users } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const userList = users?.data || [];
    const pagination = users;

    const totals = useMemo(() => {
        const brgy = userList.filter((u) => u.role === 'baranggay').length;
        const estab = userList.filter((u) => u.role === 'Establishment').length;
        return {
            brgy,
            estab,
        };
    }, [userList]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'staff',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.user-management.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const roleBadge = (role) => {
        if (role === 'admin') {
            return 'bg-blue-100 text-blue-700';
        }
        if (role === 'staff') {
            return 'bg-purple-100 text-purple-700';
        }
        if (role === 'job_seeker') {
            return 'bg-amber-100 text-amber-700';
        }
        if (role === 'baranggay') {
            return 'bg-orange-100 text-orange-700';
        }
        if (role === 'Establishment') {
            return 'bg-green-100 text-green-700';
        }
        return 'bg-slate-100 text-slate-700';
    };

    const roleLabel = (role) => {
        if (role === 'admin') return 'Administrator';
        if (role === 'staff') return 'Staff';
        if (role === 'job_seeker') return 'Job Seeker';
        if (role === 'baranggay') return 'Barangay';
        if (role === 'Establishment') return 'Establishment';
        return role;
    };

    return (
        <AdminLayouts>
            <Head title="User Management" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Users (Page)</p>
                            <p className="text-2xl font-bold text-slate-800">{userList.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Establishment (Page)</p>
                            <p className="text-2xl font-bold text-slate-800">{totals.estab}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">User Accounts</h2>
                        <p className="text-sm text-slate-500 mt-1">Create accounts for Barangay and Establishment</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        Create Account
                    </button>
                </div>

                {userList.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">ID</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {userList.map((u, index) => (
                                    <tr key={u.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">#{u.id}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {(u.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${roleBadge(u.role)}`}>
                                                <User className="h-3 w-3" />
                                                {roleLabel(u.role)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Users className="h-12 w-12 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No users found</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination?.data?.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{pagination.from}</span> to <span className="font-semibold text-slate-700">{pagination.to}</span> of <span className="font-semibold text-slate-700">{pagination.total}</span> users
                            </p>

                            {pagination.prev_page_url || pagination.next_page_url ? (
                                <div className="flex items-center justify-center gap-2">
                                    {pagination.prev_page_url ? (
                                        <Link
                                            href={pagination.prev_page_url}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Prev
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Prev
                                        </button>
                                    )}

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
                            ) : null}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Account Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Create New Account</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="Full name / Company name"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="email@example.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="baranggay">Barangay</option>
                                            <option value="Establishment">Establishment</option>
                                        </select>
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Password (optional)</label>
                                        <input
                                            type="text"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="leave empty = default 'password'"
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                </div>
                            </div>

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
                                    {processing ? 'Saving...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
