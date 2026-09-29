import { Head, usePage, useForm, Link, router } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Plus, X, Users, Shield, Mail, User, ChevronLeft, ChevronRight,
    Building2, Eye, EyeOff, Search, Loader2, UserMinus, Briefcase
} from 'lucide-react';

export default function UserManagement() {
    const { users, barangays } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [barangaySearch, setBarangaySearch] = useState('');
    const [barangayDropdownOpen, setBarangayDropdownOpen] = useState(false);
    const barangayRef = useRef(null);

    const userList = users?.data || [];
    const pagination = users;
    const barangayList = barangays || [];

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'admin',
        password: '',
        password_confirmation: '',
        company_name: '',
        contact_person: '',
        contact_number: '',
        barangay_id: '',
        latitude: '',
        longitude: '',
        agency_name: '',
        license_number: '',
        address: '',
    });

    const filteredBarangays = barangayList.filter((b) =>
        b.barangay_name.toLowerCase().includes(barangaySearch.toLowerCase())
    );

    const selectedBarangay = barangayList.find((b) => b.id === Number(data.barangay_id));

    useEffect(() => {
        if (selectedBarangay?.latitude && selectedBarangay?.longitude) {
            setData('latitude', String(selectedBarangay.latitude));
            setData('longitude', String(selectedBarangay.longitude));
        } else {
            setData('latitude', '');
            setData('longitude', '');
        }
    }, [data.barangay_id]);

    const handleSetPosition = useCallback((lat, lng) => {
        setData('latitude', lat);
        setData('longitude', lng);
    }, []);

    function LocationPicker({ lat, lng, onSetPosition }) {
        const markerRef = useRef(null);
        const mapRef = useRef(null);

        const MapClickHandler = () => {
            useMapEvents({
                click(e) {
                    onSetPosition(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
                },
            });
            return null;
        };

        useEffect(() => {
            if (mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 100);
        }, []);

        return (
            <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height: '200px' }}>
                <MapContainer
                    center={[lat, lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapClickHandler />
                    {lat && lng && <Marker position={[lat, lng]} />}
                </MapContainer>
            </div>
        );
    }

    const totals = useMemo(() => {
        const estab = userList.filter((u) => u.role === 'Establishment').length;
        return { estab };
    }, [userList]);

    const isEstablishment = data.role === 'Establishment';
    const isAgency = data.role === 'agency';

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.user-management.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setBarangaySearch('');
            },
        });
    };

    const openModal = () => {
        reset();
        setBarangaySearch('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setBarangaySearch('');
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (barangayRef.current && !barangayRef.current.contains(e.target)) {
                setBarangayDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roleBadge = (role) => {
        if (role === 'admin') return 'bg-blue-100 text-blue-700';
        if (role === 'staff') return 'bg-purple-100 text-purple-700';
        if (role === 'job_seeker') return 'bg-amber-100 text-amber-700';
        if (role === 'Establishment') return 'bg-green-100 text-green-700';
        if (role === 'agency') return 'bg-blue-100 text-blue-700';
        return 'bg-slate-100 text-slate-700';
    };

    const roleLabel = (role) => {
        if (role === 'admin') return 'Administrator';
        if (role === 'staff') return 'Staff';
        if (role === 'job_seeker') return 'Job Seeker';
        if (role === 'Establishment') return 'Establishment';
        if (role === 'agency') return 'Agency';
        return role;
    };

    const handleDeactivate = (id, name) => {
        if (confirm(`Are you sure you want to deactivate user "${name}"? They will no longer be able to log in.`)) {
            router.put(route('admin.user-management.deactivate', id), {
                preserveScroll: true,
                onSuccess: () => {},
            });
        }
    };

    return (
        <AdminLayouts>
            <Head title="User Management" />

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

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">User Accounts</h2>
                        <p className="text-sm text-slate-500 mt-1">Create accounts for Barangay and Establishment</p>
                    </div>
                    <button
                        onClick={openModal}
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
                                    <th className="px-5 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
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
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => handleDeactivate(u.id, u.name)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Deactivate user"
                                            >
                                                <UserMinus className="h-3.5 w-3.5" />
                                                Deactivate
                                            </button>
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

                {pagination?.data?.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{pagination.from}</span> to <span className="font-semibold text-slate-700">{pagination.to}</span> of <span className="font-semibold text-slate-700">{pagination.total}</span> users
                            </p>
                            {pagination.prev_page_url || pagination.next_page_url ? (
                                <div className="flex items-center justify-center gap-2">
                                    {pagination.prev_page_url ? (
                                        <Link href={pagination.prev_page_url} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                            <ChevronLeft className="h-4 w-4" /> Prev
                                        </Link>
                                    ) : (
                                        <button disabled className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed">
                                            <ChevronLeft className="h-4 w-4" /> Prev
                                        </button>
                                    )}
                                    {pagination.next_page_url ? (
                                        <Link href={pagination.next_page_url} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                            Next <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <button disabled className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed">
                                            Next <ChevronRight className="h-4 w-4" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-white">Create New Account</h3>
                            <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'admin', label: 'Administrator', icon: Shield },
                                        { value: 'agency', label: 'Agency', icon: Briefcase },
                                        { value: 'Establishment', label: 'Establishment', icon: Building2 },
                                    ].map((opt) => {
                                        const Icon = opt.icon;
                                        const active = data.role === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setData('role', opt.value)}
                                                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5 transition-all ${
                                                    active
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                                                <span className="text-xs font-semibold">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                            </div>

                            <div className={`grid grid-cols-1 ${isEstablishment || isAgency ? 'md:grid-cols-2' : ''} gap-4`}>
                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <User className="h-4 w-4 text-blue-600" /> Account Information
                                    </h4>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {isEstablishment ? 'Account Name' : isAgency ? 'Account/User Name' : 'Full Name'} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                            placeholder={isEstablishment ? 'e.g. Juan Dela Cruz' : isAgency ? 'e.g. Agency Admin' : 'Full name'}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                            placeholder="email@example.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className={`w-full px-4 py-2.5 pr-10 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                    placeholder={isEstablishment || isAgency ? 'Auto-generated if blank' : 'Leave blank for default'}
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                            <p className="text-[10px] text-slate-400 mt-0.5">Leave empty to auto-generate</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="Confirm password"
                                                disabled={!data.password}
                                            />
                                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Agency-specific fields */}
                                {isAgency && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                            <Briefcase className="h-4 w-4 text-blue-600" /> Agency Information
                                        </h4>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Agency Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.agency_name}
                                                onChange={(e) => setData('agency_name', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.agency_name ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="Official agency name"
                                            />
                                            {errors.agency_name && <p className="text-red-500 text-xs mt-1">{errors.agency_name}</p>}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Registration / Permit Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.license_number}
                                                onChange={(e) => setData('license_number', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.license_number ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="Permit/License number"
                                            />
                                            {errors.license_number && <p className="text-red-500 text-xs mt-1">{errors.license_number}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Contact Person Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_person}
                                                onChange={(e) => setData('contact_person', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.contact_person ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="Contact person"
                                            />
                                            {errors.contact_person && <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Contact Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.contact_number ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="09XX XXX XXXX"
                                            />
                                            {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Complete Business Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.address ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="Complete address"
                                                rows="3"
                                            ></textarea>
                                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Establishment-specific fields */}
                                {isEstablishment && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                            <Building2 className="h-4 w-4 text-emerald-600" /> Company Information
                                        </h4>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Company Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.company_name ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="Official company name"
                                            />
                                            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Contact Person <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_person}
                                                onChange={(e) => setData('contact_person', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.contact_person ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="HR Manager / Owner"
                                            />
                                            {errors.contact_person && <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Contact Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.contact_number ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                                placeholder="09XX XXX XXXX"
                                            />
                                            {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                                            <p className="text-[10px] text-slate-400 mt-0.5">Philippine mobile number (e.g. 09171234567)</p>
                                        </div>

                                        <div ref={barangayRef} className="relative">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Barangay <span className="text-red-500">*</span>
                                            </label>
                                            <div
                                                className={`flex items-center justify-between w-full px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${errors.barangay_id ? 'border-red-400 bg-red-50' : 'border-slate-300'} ${barangayDropdownOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                                                onClick={() => setBarangayDropdownOpen(!barangayDropdownOpen)}
                                            >
                                                <span className={`text-sm ${selectedBarangay ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {selectedBarangay ? selectedBarangay.barangay_name : 'Select barangay'}
                                                </span>
                                                <Search className="h-4 w-4 text-slate-400" />
                                            </div>
                                            {errors.barangay_id && <p className="text-red-500 text-xs mt-1">{errors.barangay_id}</p>}

                                            {barangayDropdownOpen && (
                                                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-hidden">
                                                    <div className="p-2 border-b border-slate-100">
                                                        <input
                                                            type="text"
                                                            value={barangaySearch}
                                                            onChange={(e) => setBarangaySearch(e.target.value)}
                                                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            placeholder="Search barangay..."
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="overflow-y-auto max-h-40">
                                                        {filteredBarangays.length > 0 ? (
                                                            filteredBarangays.map((b) => (
                                                                <button
                                                                    key={b.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData('barangay_id', b.id);
                                                                        setBarangaySearch('');
                                                                        setBarangayDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${
                                                                        Number(data.barangay_id) === b.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                                                                    }`}
                                                                >
                                                                    {b.barangay_name}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <p className="px-4 py-3 text-sm text-slate-400 text-center">No barangays found</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Exact Location <span className="text-[10px] text-slate-400 font-normal">(click map to set pin)</span>
                                            </label>
                                            {selectedBarangay?.latitude && selectedBarangay?.longitude ? (
                                                <LocationPicker
                                                    lat={parseFloat(data.latitude || selectedBarangay.latitude)}
                                                    lng={parseFloat(data.longitude || selectedBarangay.longitude)}
                                                    onSetPosition={handleSetPosition}
                                                />
                                            ) : (
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center" style={{ height: '200px' }}>
                                                    <p className="text-sm text-slate-400">Select a barangay first to enable map</p>
                                                </div>
                                            )}
                                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                                            {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-slate-400 font-medium">Latitude</label>
                                                    <input type="text" value={data.latitude} readOnly
                                                        className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded bg-slate-50 text-slate-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-slate-400 font-medium">Longitude</label>
                                                    <input type="text" value={data.longitude} readOnly
                                                        className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded bg-slate-50 text-slate-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
