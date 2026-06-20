import { Head, Link, router } from '@inertiajs/react';
import AdminLayouts from '@/Layouts/AdminLayouts';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Building2, MapPin, Briefcase, Search, Navigation, Plus, X, Trash2,
    Edit3, Save, Loader2, AlertCircle, Crosshair, ChevronLeft, ChevronRight,
    Layers, Filter, Map as MapIcon, Users, FileText, Eye, Clock, RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const OPOL_CENTER = [8.5212, 124.5747];
const DEFAULT_ZOOM = 13;

const MARKER_COLORS = {
    establishment: '#2563eb',
    selected: '#dc2626',
    newMarker: '#10b981',
    user: '#10b981',
    job: '#d97706',
    application: '#7c3aed',
    applicationPending: '#d97706',
    applicationHired: '#059669',
    applicationRejected: '#dc2626',
};

function createDivIcon(color, size, inner, pulse = false) {
    return new L.DivIcon({
        className: '',
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)${pulse ? ';animation:pulse 1.5s infinite' : ''}">${inner}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

const svgIcon = (path, stroke = 'white', width = 14) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const establishmentIcon = createDivIcon(MARKER_COLORS.establishment, 28,
    svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'));
const hiringIcon = createDivIcon('#10b981', 32,
    svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', 'white', 14));
const selectedIcon = createDivIcon(MARKER_COLORS.selected, 34,
    svgIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', 'white', 16));
const newMarkerIcon = createDivIcon(MARKER_COLORS.newMarker, 32,
    svgIcon('<path d="M12 5v14M5 12h14"/>', 'white', 14), true);
const userLocationIcon = new L.DivIcon({
    className: '',
    html: `<div style="background:#10b981;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});
const jobIcon = createDivIcon(MARKER_COLORS.job, 26,
    svgIcon('<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'));
const applicationIcon = createDivIcon(MARKER_COLORS.application, 26,
    svgIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'));

function getApplicationStatusIcon(status) {
    const color = status === 'hired' ? MARKER_COLORS.applicationHired
        : status === 'rejected' ? MARKER_COLORS.applicationRejected
        : MARKER_COLORS.applicationPending;
    return createDivIcon(color, 24,
        svgIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'));
}

const LAYERS = [
    { key: 'establishments', label: 'Establishments', icon: Building2, color: MARKER_COLORS.establishment },
    { key: 'jobs', label: 'Job Vacancies', icon: Briefcase, color: MARKER_COLORS.job },
    { key: 'applications', label: 'Applications', icon: FileText, color: MARKER_COLORS.application },
];

function MapController({ selected, items, layerKey }) {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100);
    }, [map]);

    useEffect(() => {
        if (selected?.latitude && selected?.longitude && layerKey === 'establishments') {
            map.setView([parseFloat(selected.latitude), parseFloat(selected.longitude)], 16, { animate: true });
        }
    }, [selected, map, layerKey]);

    useEffect(() => {
        const coords = items
            .filter((e) => e.latitude && e.longitude)
            .map((e) => [parseFloat(e.latitude), parseFloat(e.longitude)]);
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [items, map]);

    return null;
}

function ClickHandler({ onMapClick, placing }) {
    useMapEvents({
        click(e) {
            if (placing) onMapClick(e.latlng);
        },
    });
    return null;
}

function BarangayStatsPanel({ barangayStats, gisStats }) {
    const [expanded, setExpanded] = useState(false);
    const sorted = useMemo(() => [...(barangayStats || [])].sort((a, b) => b.job_seekers - a.job_seekers), [barangayStats]);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200"
            >
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Per-Barangay Statistics</h3>
                </div>
                <span className="text-xs text-slate-400">{expanded ? 'Hide' : 'Show'}</span>
            </button>
            {expanded && (
                <div className="p-4 max-h-80 overflow-y-auto">
                    <div className="space-y-3">
                        {sorted.map((b) => (
                            <div key={b.name} className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                                    {b.latitude && b.longitude && (
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="h-3 w-3 text-blue-500" />
                                        <span className="text-slate-600">{b.establishments} estab.</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3 text-green-500" />
                                        <span className="text-slate-600">{b.job_seekers} seekers</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Legend({ activeLayers }) {
    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-slate-600" />
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Legend</p>
            </div>
            <div className="space-y-1.5">
                {LAYERS.filter(l => activeLayers[l.key]).map((layer) => (
                    <div key={layer.key} className="flex items-center gap-2">
                        <div style={{ background: layer.color, width: 12, height: 12, borderRadius: '50%', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        <span className="text-xs text-slate-600 capitalize">{layer.label}</span>
                    </div>
                ))}
                {activeLayers.establishments && (
                    <div className="flex items-center gap-2">
                        <div style={{ background: '#10b981', width: 12, height: 12, borderRadius: '50%', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        <span className="text-xs text-slate-600">Hiring / Has Jobs</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Map() {
    const { establishments: initialData, barangays, industryCategories: cats, municipality, region, gisStats, barangayStats: initialBarangayStats } = usePage().props;

    const [establishments, setEstablishments] = useState(initialData?.data || []);
    const [pagination, setPagination] = useState(initialData);
    const [barangayList] = useState(barangays || []);
    const [industryCategories] = useState(cats || []);
    const [barangayStats] = useState(initialBarangayStats || []);

    const [activeLayers, setActiveLayers] = useState({ establishments: true, jobs: false, applications: false });
    const [gisData, setGisData] = useState({ establishments: [], jobs: [], applications: [], barangay_stats: [] });
    const [gisLoading, setGisLoading] = useState(false);

    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [hasJobsFilter, setHasJobsFilter] = useState(false);
    const [appStatusFilter, setAppStatusFilter] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingEstablishment, setEditingEstablishment] = useState(null);
    const [placingMarker, setPlacingMarker] = useState(false);
    const [newMarkerPos, setNewMarkerPos] = useState(null);
    const [formData, setFormData] = useState({
        company_name: '', address: '', contact_person: '', contact_number: '',
        email: '', latitude: '', longitude: '', barangay_id: '', industry_category: '',
    });
    const [formErrors, setFormErrors] = useState({});

    const [origin, setOrigin] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [nearbyRadius, setNearbyRadius] = useState(5);
    const [nearbyEstablishments, setNearbyEstablishments] = useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const selectedEstablishment = useMemo(() => {
        return establishments.find((e) => e.id === selectedId) || null;
    }, [establishments, selectedId]);

    const filteredEstablishments = useMemo(() => {
        let result = establishments;
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            result = result.filter((e) => {
                const name = (e.company_name || '').toLowerCase();
                const addr = (e.address || '').toLowerCase();
                const brgy = (e.barangay?.barangay_name || '').toLowerCase();
                return name.includes(q) || addr.includes(q) || brgy.includes(q);
            });
        }
        if (industryFilter) result = result.filter((e) => e.industry_category === industryFilter);
        if (hasJobsFilter) result = result.filter((e) => (e.available_jobs_count || 0) > 0);
        return result;
    }, [establishments, searchQuery, industryFilter, hasJobsFilter]);

    const fetchEstablishments = useCallback(async (url) => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (industryFilter) params.industry = industryFilter;
            if (hasJobsFilter) params.has_jobs = true;
            const res = await axios.get(url || '/api/establishments/locations', { params });
            setEstablishments(res.data.data);
            setPagination(res.data.meta ? { ...res.data.meta, data: res.data.data } : null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load establishments.');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, industryFilter, hasJobsFilter]);

    const fetchGisData = useCallback(async () => {
        setGisLoading(true);
        try {
            const params = {};
            if (appStatusFilter) params.application_status = appStatusFilter;
            const res = await axios.get('/api/gis/data', { params });
            setGisData(res.data.data);
        } catch (err) {
            console.error('Failed to load GIS data:', err);
        } finally {
            setGisLoading(false);
        }
    }, [appStatusFilter]);

    useEffect(() => {
        fetchEstablishments();
    }, [industryFilter, hasJobsFilter]);

    useEffect(() => {
        if (activeLayers.jobs || activeLayers.applications) fetchGisData();
    }, [activeLayers, appStatusFilter]);

    const pollingRef = useRef(null);
    useEffect(() => {
        pollingRef.current = setInterval(() => {
            fetchEstablishments();
            if (activeLayers.jobs || activeLayers.applications) fetchGisData();
        }, 30000);
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchEstablishments();
                if (activeLayers.jobs || activeLayers.applications) fetchGisData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [activeLayers]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEstablishments();
    };

    const toggleLayer = (key) => {
        setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const openAddForm = () => {
        setEditingEstablishment(null);
        setFormData({
            company_name: '', address: '', contact_person: '', contact_number: '',
            email: '', latitude: '', longitude: '', barangay_id: '', industry_category: '',
        });
        setFormErrors({});
        setNewMarkerPos(null);
        setPlacingMarker(true);
        setShowForm(true);
    };

    const openEditForm = (est) => {
        setEditingEstablishment(est);
        setFormData({
            company_name: est.company_name || '', address: est.address || '',
            contact_person: est.contact_person || '', contact_number: est.contact_number || '',
            email: est.email || '', latitude: est.latitude || '', longitude: est.longitude || '',
            barangay_id: est.barangay_id || '', industry_category: est.industry_category || '',
        });
        setFormErrors({});
        setNewMarkerPos(null);
        setPlacingMarker(false);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEstablishment(null);
        setPlacingMarker(false);
        setNewMarkerPos(null);
        setFormErrors({});
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: null }));
    };

    const handleMapClick = (latlng) => {
        setNewMarkerPos(latlng);
        setFormData((prev) => ({
            ...prev, latitude: latlng.lat.toFixed(7), longitude: latlng.lng.toFixed(7),
        }));
        setPlacingMarker(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setFormErrors({});
        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                barangay_id: formData.barangay_id ? parseInt(formData.barangay_id) : null,
            };
            if (editingEstablishment) {
                const res = await axios.put(`/api/establishments/locations/${editingEstablishment.id}`, payload);
                setEstablishments((prev) => prev.map((e) => (e.id === editingEstablishment.id ? res.data.data : e)));
            } else {
                const res = await axios.post('/api/establishments/locations', payload);
                setEstablishments((prev) => [...prev, res.data.data]);
            }
            closeForm();
        } catch (err) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                const errs = {};
                Object.entries(err.response.data.errors).forEach(([key, msgs]) => { errs[key] = msgs[0]; });
                setFormErrors(errs);
            } else {
                setError(err.response?.data?.message || 'Failed to save establishment.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setSaving(true);
        try {
            await axios.delete(`/api/establishments/locations/${id}`);
            setEstablishments((prev) => prev.filter((e) => e.id !== id));
            if (selectedId === id) setSelectedId(null);
            setShowDeleteConfirm(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete establishment.');
        } finally {
            setSaving(false);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setOrigin(loc);
                setGettingLocation(false);
                findNearby(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                setGettingLocation(false);
                setError('Could not get your location. Please enable location services.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const findNearby = async (lat, lng) => {
        setLoading(true);
        try {
            const res = await axios.post('/api/establishments/locations/nearby', {
                latitude: lat, longitude: lng, radius: nearbyRadius,
            });
            setNearbyEstablishments(res.data.data);
        } catch (err) {
            setError('Failed to find nearby establishments.');
        } finally {
            setLoading(false);
        }
    };

    const getDistance = (est) => {
        if (!origin || !est.distance) return null;
        return est.distance < 1
            ? `${(est.distance * 1000).toFixed(0)} m`
            : `${parseFloat(est.distance).toFixed(2)} km`;
    };

    const resetNearby = () => {
        setOrigin(null);
        setNearbyEstablishments(null);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchEstablishments();
        if (activeLayers.jobs || activeLayers.applications) await fetchGisData();
        setRefreshing(false);
    };

    const mapItems = useMemo(() => {
        if (activeLayers.establishments) return establishments.filter(e => e.latitude && e.longitude);
        return [];
    }, [activeLayers.establishments, establishments]);

    return (
        <AdminLayouts>
            <Head title="GIS Map" />

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .leaflet-popup-content-wrapper { border-radius: 12px !important; }
                .leaflet-popup-content { margin: 12px 16px !important; }
            `}</style>

            {/* GIS Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg"><Building2 className="h-6 w-6 text-blue-600" /></div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Establishments</p>
                            <p className="text-2xl font-bold text-slate-800">{gisStats?.total_establishments ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-3 rounded-lg"><Briefcase className="h-6 w-6 text-amber-600" /></div>
                        <div>
                            <p className="text-slate-500 text-sm">Active Job Vacancies</p>
                            <p className="text-2xl font-bold text-slate-800">{gisStats?.total_active_jobs ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg"><FileText className="h-6 w-6 text-purple-600" /></div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Applications</p>
                            <p className="text-2xl font-bold text-slate-800">{gisStats?.total_applications ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg"><Navigation className="h-6 w-6 text-green-600" /></div>
                        <div>
                            <p className="text-slate-500 text-sm">Barangays</p>
                            <p className="text-2xl font-bold text-slate-800">{gisStats?.total_barangays ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Layer Toggle */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Layers className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-bold text-slate-800">Map Layers</p>
                        </div>
                        <div className="space-y-2">
                            {LAYERS.map((layer) => {
                                const Icon = layer.icon;
                                const isActive = activeLayers[layer.key];
                                return (
                                    <button
                                        key={layer.key}
                                        onClick={() => toggleLayer(layer.key)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div style={{ background: layer.color, width: 10, height: 10, borderRadius: '50%' }} />
                                        <Icon className="h-4 w-4" />
                                        <span className="flex-1 text-left">{layer.label}</span>
                                        {isActive && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Establishments Panel */}
                    {activeLayers.establishments && (
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Establishments</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {filteredEstablishments.length} location{filteredEstablishments.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button
                                        onClick={openAddForm}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" /> Add
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 border-b border-slate-200 space-y-3">
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, address..."
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    />
                                </form>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Filter className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <select
                                            value={industryFilter}
                                            onChange={(e) => setIndustryFilter(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm appearance-none bg-white"
                                        >
                                            <option value="">All Industries</option>
                                            {industryCategories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={hasJobsFilter}
                                            onChange={(e) => setHasJobsFilter(e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        /> Has Jobs
                                    </label>
                                </div>

                                {origin && nearbyEstablishments && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-green-700">
                                                <Navigation className="h-3 w-3 inline mr-1" />
                                                Nearby ({nearbyEstablishments.length})
                                            </p>
                                            <button onClick={resetNearby} className="text-xs text-green-600 hover:text-green-800">Clear</button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUseMyLocation}
                                        disabled={gettingLocation}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                                        {origin ? 'Nearby' : 'Find Nearby'}
                                    </button>
                                    <select
                                        value={nearbyRadius}
                                        onChange={(e) => setNearbyRadius(e.target.value)}
                                        className="px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                    >
                                        <option value={1}>1 km</option>
                                        <option value={3}>3 km</option>
                                        <option value={5}>5 km</option>
                                        <option value={10}>10 km</option>
                                        <option value={25}>25 km</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[360px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                                        <p className="text-sm text-slate-500">Loading establishments...</p>
                                    </div>
                                ) : filteredEstablishments.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {filteredEstablishments.map((est) => {
                                            const isSelected = est.id === selectedId;
                                            return (
                                                <div key={est.id} className={`group relative ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-white hover:bg-blue-50/50'} transition-colors`}>
                                                    <button onClick={() => setSelectedId(est.id)} className="w-full text-left px-5 py-4 pr-12">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${(est.available_jobs_count || 0) > 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-slate-400'}`}>
                                                                {(est.company_name?.[0] || 'E').toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-800 truncate">{est.company_name}</p>
                                                                <div className="mt-1 space-y-0.5">
                                                                    {est.address && <p className="text-xs text-slate-500 truncate">{est.address}</p>}
                                                                    <p className="text-xs text-slate-400 truncate">
                                                                        {est.barangay?.barangay_name || 'N/A'}
                                                                        {est.industry_category && ` · ${est.industry_category}`}
                                                                    </p>
                                                                    <p className="text-xs font-medium text-blue-600">
                                                                        {est.available_jobs_count || 0} job{(est.available_jobs_count || 0) !== 1 ? 's' : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {origin && est.distance && (
                                                            <div className="mt-2 text-xs text-green-600 font-medium">
                                                                <Navigation className="h-3 w-3 inline mr-1" />
                                                                {getDistance(est)}
                                                            </div>
                                                        )}
                                                    </button>
                                                    <div className="absolute right-2 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => { e.stopPropagation(); openEditForm(est); }} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(est); }} className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50" title="Remove location"><Trash2 className="h-3.5 w-3.5" /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 px-4">
                                        <MapPin className="h-10 w-10 text-slate-300 mb-3" />
                                        <p className="text-slate-600 font-medium">No establishments found</p>
                                        <p className="text-slate-400 text-sm mt-1 text-center">
                                            {searchQuery || industryFilter ? 'Try adjusting your search or filters' : 'Click "Add" to place an establishment on the map'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {pagination?.last_page > 1 && (
                                <div className="bg-slate-50 border-t border-slate-200 px-5 py-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500">Page {pagination.current_page} of {pagination.last_page}</p>
                                        <div className="flex gap-1">
                                            {pagination.current_page > 1 && (
                                                <button onClick={() => fetchEstablishments(`/api/establishments/locations?page=${pagination.current_page - 1}`)} className="p-1.5 rounded text-slate-600 hover:bg-slate-200"><ChevronLeft className="h-4 w-4" /></button>
                                            )}
                                            {pagination.current_page < pagination.last_page && (
                                                <button onClick={() => fetchEstablishments(`/api/establishments/locations?page=${pagination.current_page + 1}`)} className="p-1.5 rounded text-slate-600 hover:bg-slate-200"><ChevronRight className="h-4 w-4" /></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Jobs Panel */}
                    {activeLayers.jobs && (
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="bg-amber-50 border-b border-slate-200 px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Job Vacancies</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {gisData.jobs.length} active job{(gisData.jobs.length || 0) !== 1 ? 's' : ''} on map
                                        </p>
                                    </div>
                                    {gisLoading && <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />}
                                </div>
                            </div>
                            <div className="p-3 border-b border-slate-200">
                                <div className="relative">
                                    <Briefcase className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        placeholder="Search job titles..."
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                                {gisData.jobs.length > 0 ? (
                                    gisData.jobs.map((job) => (
                                        <div key={job.id} className="px-5 py-3 hover:bg-amber-50/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                                                    <Briefcase className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800">{job.title}</p>
                                                    <p className="text-xs text-slate-500">{job.company_name}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{job.barangay_name || 'N/A'}</span>
                                                        <span>·</span>
                                                        <span>{job.employment_type || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            job.hiring_status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {job.hiring_status}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {job.applications_count || 0} applicant{(job.applications_count || 0) !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Briefcase className="h-8 w-8 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">No job vacancies on map</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Applications Panel */}
                    {activeLayers.applications && (
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="bg-purple-50 border-b border-slate-200 px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Applications</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {gisData.applications.length} application{(gisData.applications.length || 0) !== 1 ? 's' : ''} on map
                                        </p>
                                    </div>
                                    {gisLoading && <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />}
                                </div>
                            </div>
                            <div className="p-3 border-b border-slate-200">
                                <div className="relative">
                                    <Filter className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select
                                        value={appStatusFilter}
                                        onChange={(e) => setAppStatusFilter(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="hired">Hired</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="interview">For Interview</option>
                                    </select>
                                </div>
                            </div>
                            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                                {gisData.applications.length > 0 ? (
                                    gisData.applications.map((app) => (
                                        <div key={app.id} className="px-5 py-3 hover:bg-purple-50/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800">{app.job_seeker_name}</p>
                                                    <p className="text-xs text-slate-500">{app.job_title} at {app.company_name}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{app.barangay_name}</span>
                                                        {app.applied_at && (
                                                            <>
                                                                <span>·</span>
                                                                <Clock className="h-3 w-3" />
                                                                <span>{app.applied_at}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${
                                                        app.status === 'hired' ? 'bg-green-100 text-green-700'
                                                        : app.status === 'rejected' ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <FileText className="h-8 w-8 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">No applications on map</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Barangay Stats */}
                    <BarangayStatsPanel barangayStats={barangayStats} gisStats={gisStats} />
                </div>

                {/* Map */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">GIS Map — {municipality}</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {placingMarker ? 'Click on the map to place the marker'
                                            : selectedEstablishment ? selectedEstablishment.company_name
                                            : `${municipality}, ${region}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button onClick={handleRefresh} disabled={refreshing}
                                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                    {placingMarker && (
                                        <button onClick={() => setPlacingMarker(false)}
                                            className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100">
                                            Cancel Placement
                                        </button>
                                    )}
                                    {!placingMarker && activeLayers.establishments && (
                                        <button onClick={() => { setPlacingMarker(true); openAddForm(); }}
                                            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                                            <Plus className="h-4 w-4 inline mr-1" /> Place on Map
                                        </button>
                                    )}
                                    <button onClick={handleUseMyLocation} disabled={gettingLocation}
                                        className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                                        {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" /> : <Crosshair className="h-4 w-4 inline mr-1" />}
                                        {origin ? 'Located' : 'My Location'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-3">
                            <div className="relative rounded-xl overflow-hidden border border-slate-200" style={{ height: 560 }}>
                                <MapContainer
                                    center={OPOL_CENTER}
                                    zoom={DEFAULT_ZOOM}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <MapController selected={selectedEstablishment} items={mapItems} layerKey="establishments" />
                                    <ClickHandler onMapClick={handleMapClick} placing={placingMarker} />

                                    {origin && (
                                        <Marker position={[origin.lat, origin.lng]} icon={userLocationIcon}>
                                            <Popup>
                                                <div className="text-sm"><p className="font-medium text-slate-800">Your Location</p></div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {placingMarker && newMarkerPos && (
                                        <Marker position={[newMarkerPos.lat, newMarkerPos.lng]} icon={newMarkerIcon}>
                                            <Popup>
                                                <div className="text-sm">
                                                    <p className="font-medium text-green-700">New Location</p>
                                                    <p className="text-xs text-slate-500 mt-1">{newMarkerPos.lat.toFixed(6)}, {newMarkerPos.lng.toFixed(6)}</p>
                                                    <p className="text-xs text-slate-400 mt-1">Fill in the form to save</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* Establishment Markers */}
                                    {activeLayers.establishments && establishments.map((est) => {
                                        if (!est.latitude || !est.longitude) return null;
                                        const lat = parseFloat(est.latitude);
                                        const lng = parseFloat(est.longitude);
                                        const isSelected = est.id === selectedId;
                                        const isHiring = est.is_hiring || (est.available_jobs_count || 0) > 0;
                                        const icon = isSelected ? selectedIcon : (isHiring ? hiringIcon : establishmentIcon);
                                        return (
                                            <Marker key={`est-${est.id}`} position={[lat, lng]}
                                                icon={icon}
                                                eventHandlers={{ click: () => setSelectedId(est.id) }}>
                                                <Popup>
                                                    <div className="text-sm" style={{ minWidth: 200 }}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Building2 className="h-4 w-4 text-blue-600" />
                                                            <p className="font-bold text-slate-800 text-base">{est.company_name}</p>
                                                        </div>
                                                        {est.address && <p className="text-slate-500 text-xs">{est.address}</p>}
                                                        <p className="text-slate-500 text-xs">{est.barangay?.barangay_name || ''}, {municipality}</p>
                                                        {est.industry_category && (
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 mt-1">
                                                                {est.industry_category}
                                                            </span>
                                                        )}
                                                        <div className="h-px bg-slate-200 my-2" />
                                                        {est.contact_person && <p className="text-xs text-slate-600"><span className="font-medium">Contact:</span> {est.contact_person}</p>}
                                                        {est.contact_number && <p className="text-xs text-slate-600">{est.contact_number}</p>}
                                                        {est.email && <p className="text-xs text-slate-600">{est.email}</p>}
                                                        <div className="mt-2 flex items-center gap-1.5">
                                                            <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                                                            <span className="text-xs font-medium text-blue-600">
                                                                {est.available_jobs_count || 0} Available Job{(est.available_jobs_count || 0) !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        {origin && est.distance && (
                                                            <div className="mt-1 text-xs text-green-600 font-medium">
                                                                <Navigation className="h-3 w-3 inline mr-1" />
                                                                {getDistance(est)} away
                                                            </div>
                                                        )}
                                                        <div className="mt-3 flex gap-2">
                                                            <Link href={route('admin.establishments')}
                                                                className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                                View Details
                                                            </Link>
                                                            <button onClick={() => openEditForm(est)}
                                                                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    })}

                                    {/* Job Markers */}
                                    {activeLayers.jobs && gisData.jobs.map((job) => {
                                        if (!job.latitude || !job.longitude) return null;
                                        return (
                                            <Marker key={`job-${job.id}`} position={[parseFloat(job.latitude), parseFloat(job.longitude)]}
                                                icon={jobIcon}>
                                                <Popup>
                                                    <div className="text-sm" style={{ minWidth: 200 }}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Briefcase className="h-4 w-4 text-amber-600" />
                                                            <p className="font-bold text-slate-800">{job.title}</p>
                                                        </div>
                                                        <p className="text-xs text-slate-600">{job.company_name}</p>
                                                        <p className="text-xs text-slate-500">{job.barangay_name || ''}, {municipality}</p>
                                                        <div className="h-px bg-slate-200 my-2" />
                                                        <div className="space-y-1 text-xs">
                                                            {job.employment_type && (
                                                                <p className="text-slate-600"><span className="font-medium">Type:</span> {job.employment_type}</p>
                                                            )}
                                                            {job.salary_range && (
                                                                <p className="text-slate-600"><span className="font-medium">Salary:</span> ₱{job.salary_range}</p>
                                                            )}
                                                            <p className="text-slate-600">
                                                                <span className="font-medium">Status:</span>{' '}
                                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                    job.hiring_status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                                }`}>{job.hiring_status}</span>
                                                            </p>
                                                            <p className="text-slate-600">
                                                                <span className="font-medium">Applicants:</span> {job.applications_count || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    })}

                                    {/* Application Markers */}
                                    {activeLayers.applications && gisData.applications.map((app) => {
                                        if (!app.latitude || !app.longitude) return null;
                                        const icon = getApplicationStatusIcon(app.status);
                                        return (
                                            <Marker key={`app-${app.id}`} position={[parseFloat(app.latitude), parseFloat(app.longitude)]}
                                                icon={icon}>
                                                <Popup>
                                                    <div className="text-sm" style={{ minWidth: 200 }}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FileText className="h-4 w-4 text-purple-600" />
                                                            <p className="font-bold text-slate-800">{app.job_seeker_name}</p>
                                                        </div>
                                                        <p className="text-xs text-slate-600">{app.job_title}</p>
                                                        <p className="text-xs text-slate-500">{app.company_name}</p>
                                                        <div className="h-px bg-slate-200 my-2" />
                                                        <div className="space-y-1 text-xs">
                                                            <p className="text-slate-600">
                                                                <span className="font-medium">Barangay:</span> {app.barangay_name}
                                                            </p>
                                                            <p className="text-slate-600">
                                                                <span className="font-medium">Status:</span>{' '}
                                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                    app.status === 'hired' ? 'bg-green-100 text-green-700'
                                                                    : app.status === 'rejected' ? 'bg-red-100 text-red-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}>{app.status}</span>
                                                            </p>
                                                            {app.applied_at && (
                                                                <p className="text-slate-600">
                                                                    <span className="font-medium">Applied:</span> {app.applied_at}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    })}
                                </MapContainer>

                                {/* Legend Overlay */}
                                <div className="absolute bottom-4 right-4 z-[1000]">
                                    <Legend activeLayers={activeLayers} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Establishment Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingEstablishment ? 'Edit Establishment' : 'Add Establishment Location'}
                            </h3>
                            <button onClick={closeForm} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                                    <input value={formData.company_name} onChange={(e) => handleFormChange('company_name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.company_name ? 'border-red-300' : 'border-slate-300'}`}
                                        placeholder="e.g. ABC Corporation" />
                                    {formErrors.company_name && <p className="text-xs text-red-500 mt-1">{formErrors.company_name}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <input value={formData.address} onChange={(e) => handleFormChange('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Purok 3, Brgy. Luyong" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                                    <input value={formData.contact_person} onChange={(e) => handleFormChange('contact_person', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                    <input value={formData.contact_number} onChange={(e) => handleFormChange('contact_number', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 09171234567" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="email@company.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude *</label>
                                    <input value={formData.latitude} onChange={(e) => handleFormChange('latitude', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.latitude ? 'border-red-300' : 'border-slate-300'}`}
                                        placeholder="e.g. 8.5212" />
                                    {formErrors.latitude && <p className="text-xs text-red-500 mt-1">{formErrors.latitude}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude *</label>
                                    <input value={formData.longitude} onChange={(e) => handleFormChange('longitude', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.longitude ? 'border-red-300' : 'border-slate-300'}`}
                                        placeholder="e.g. 124.5747" />
                                    {formErrors.longitude && <p className="text-xs text-red-500 mt-1">{formErrors.longitude}</p>}
                                </div>
                                <p className="col-span-2 text-xs text-slate-400">
                                    <MapIcon className="h-3 w-3 inline mr-1" />
                                    Click the "Place on Map" button or enter coordinates manually
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Barangay</label>
                                    <select value={formData.barangay_id} onChange={(e) => handleFormChange('barangay_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="">Select barangay</option>
                                        {barangayList.map((b) => (
                                            <option key={b.id} value={b.id}>{b.barangay_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Industry Category</label>
                                    <input value={formData.industry_category} onChange={(e) => handleFormChange('industry_category', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Retail, Manufacturing" list="industry-list" />
                                    <datalist id="industry-list">
                                        {industryCategories.map((cat) => (<option key={cat} value={cat} />))}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                            <button onClick={closeForm}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {editingEstablishment ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                        <div className="px-6 py-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Remove Location</h3>
                            <p className="text-sm text-slate-500">
                                Remove the map location for <strong>{showDeleteConfirm.company_name}</strong>?
                                The establishment record will not be deleted.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                            <button onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(showDeleteConfirm.id)} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayouts>
    );
}
