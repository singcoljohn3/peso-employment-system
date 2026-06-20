import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ScaleControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Building2, MapPin, Users, Briefcase, Crosshair, Navigation,
    Search, X, ChevronRight, Filter, RefreshCw, Clock,
    Share2, Heart, Layers, Map as MapIcon, List, Target, AlertCircle,
    DollarSign, Phone, Mail, Loader2, BarChart3
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const OPOL_CENTER = [8.48, 124.57];
const DEFAULT_ZOOM = 12;

function createDivIcon(bg, size, svg, pulse = false) {
    const pulseAnim = pulse ? 'animation:pulse 2s infinite;' : '';
    return new L.DivIcon({
        className: '',
        html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);${pulseAnim}">${svg}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

const S = (p) => `<svg xmlns="http://www.w3.org/2000/svg" width="${p.w || 12}" height="${p.w || 12}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${p.d}</svg>`;

const hiringIcon = createDivIcon('#10b981', 32, S({ d: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', w: 16 }));
const notHiringIcon = createDivIcon('#ef4444', 28, S({ d: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', w: 14 }));
const pendingIcon = createDivIcon('#f59e0b', 28, S({ d: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', w: 14 }));
const recommendedIcon = createDivIcon('#10b981', 36, S({ d: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', w: 18 }), true);
const highMatchIcon = createDivIcon('#f59e0b', 40, S({ d: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"', w: 20 }), true);
const savedIcon = createDivIcon('#8b5cf6', 30, S({ d: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>', w: 14 }));
const userLocationIcon = new L.DivIcon({
    className: '',
    html: '<div style="background:#10b981;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(16,185,129,0.3)"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

function MapController({ establishments, selectedId, userLocation }) {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 250);
    }, []);

    useEffect(() => {
        const coords = [];
        establishments.forEach(e => {
            if (e.latitude && e.longitude) coords.push([e.latitude, e.longitude]);
        });
        if (userLocation) coords.push([userLocation.lat, userLocation.lng]);
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [establishments.length]);

    useEffect(() => {
        if (selectedId) {
            const est = establishments.find(e => e.id === selectedId);
            if (est?.latitude && est?.longitude) {
                map.flyTo([est.latitude, est.longitude], 16, { duration: 0.8 });
            }
        }
    }, [selectedId]);

    return null;
}

function getIconForEstablishment(est, isSaved) {
    if (isSaved) return savedIcon;
    if ((est.match_score || 0) >= 70) return highMatchIcon;
    if (est.hiring_status === 'hiring') return est.recommended ? recommendedIcon : hiringIcon;
    if (est.hiring_status === 'pending') return pendingIcon;
    return notHiringIcon;
}

function getStatusBadge(status) {
    if (status === 'hiring') return { label: 'Hiring', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
    if (status === 'pending') return { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
    return { label: 'Not Hiring', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
}

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
    if (km == null) return '';
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)}km away`;
}

function formatTravelTime(minutes) {
    if (minutes == null) return '';
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function matchScoreColor(score) {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-slate-400';
}

function matchScoreBg(score) {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-slate-300';
}

export default function JobMap({ seekerData }) {
    const user = usePage().props.auth?.user;
    const [establishments, setEstablishments] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [categories, setCategories] = useState([]);
    const [meta, setMeta] = useState({ total: 0, hiring: 0, not_hiring: 0, pending: 0, recommended: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [filterBarangay, setFilterBarangay] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterHiring, setFilterHiring] = useState('');
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [showRecommended, setShowRecommended] = useState(false);
    const [viewMode, setViewMode] = useState('map');
    const [refreshing, setRefreshing] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [showSidebar, setShowSidebar] = useState(true);
    const [filterRadius, setFilterRadius] = useState('');
    const [filterDaysAgo, setFilterDaysAgo] = useState('');
    const [analytics, setAnalytics] = useState({ top_hiring_barangays: {}, jobs_by_category: {} });
    const [barangayStatsData, setBarangayStatsData] = useState([]);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const api = useCallback(async (url, opts = {}) => {
        const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
        const res = await fetch(url, { ...opts, headers, credentials: 'same-origin' });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    }, []);

    const fetchMapData = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (filters.search) params.set('search', filters.search);
            if (filters.barangay_id) params.set('barangay_id', filters.barangay_id);
            if (filters.category) params.set('category', filters.category);
            if (filters.hiring_status) params.set('hiring_status', filters.hiring_status);
            if (filters.radius) params.set('radius', filters.radius);
            if (filters.days_ago) params.set('days_ago', filters.days_ago);
            if (userLocation) {
                params.set('lat', userLocation.lat);
                params.set('lng', userLocation.lng);
            }

            const data = await api(`/api/job-seeker/map-data?${params}`);
            if (data.success) {
                setEstablishments(data.data || []);
                setBarangays(data.barangays || []);
                setCategories(data.categories || []);
                setMeta(data.meta || {});
                if (data.analytics) setAnalytics(data.analytics);
                const saved = new Set(data.data.filter(e => e.is_saved).map(e => e.id));
                setSavedIds(saved);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [api, userLocation]);

    const fetchSaved = useCallback(async () => {
        try {
            const data = await api('/api/job-seeker/saved-list');
            if (data.success) {
                const ids = new Set(data.data.map(e => e.id));
                setSavedIds(ids);
            }
        } catch {}
    }, [api]);

    const fetchRecentlyViewed = useCallback(async () => {
        try {
            const data = await api('/api/job-seeker/recently-viewed');
            if (data.success) setRecentlyViewed(data.data || []);
        } catch {}
    }, [api]);

    const fetchRecommendations = useCallback(async () => {
        try {
            const data = await api('/api/job-seeker/recommendations');
            if (data.success) setRecommendations(data.data || []);
        } catch {}
    }, [api]);

    const fetchBarangayStats = useCallback(async () => {
        try {
            const data = await api('/api/job-seeker/barangay-stats');
            if (data.success) setBarangayStatsData(data.data || []);
        } catch {}
    }, [api]);

    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        );
    }, []);

    useEffect(() => { fetchMapData({}); fetchSaved(); fetchRecentlyViewed(); fetchRecommendations(); fetchBarangayStats(); }, []);
    useEffect(() => { getUserLocation(); }, []);

    const searchTimeout = useRef(null);
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchMapData({
                search,
                barangay_id: filterBarangay,
                category: filterCategory,
                hiring_status: filterHiring,
                radius: filterRadius,
                days_ago: filterDaysAgo,
            });
        }, 400);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [search, filterBarangay, filterCategory, filterHiring, filterRadius, filterDaysAgo, userLocation]);

    const pollingRef = useRef(null);
    useEffect(() => {
        pollingRef.current = setInterval(() => {
            fetchMapData({ search, barangay_id: filterBarangay, category: filterCategory, hiring_status: filterHiring, radius: filterRadius, days_ago: filterDaysAgo });
            fetchRecentlyViewed();
        }, 30000);
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchMapData({ search, barangay_id: filterBarangay, category: filterCategory, hiring_status: filterHiring, radius: filterRadius, days_ago: filterDaysAgo });
                fetchSaved();
                fetchRecentlyViewed();
                fetchRecommendations();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [search, filterBarangay, filterCategory, filterHiring, filterRadius, filterDaysAgo]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMapData({ search, barangay_id: filterBarangay, category: filterCategory, hiring_status: filterHiring, radius: filterRadius, days_ago: filterDaysAgo })
            .finally(() => setTimeout(() => setRefreshing(false), 600));
        fetchSaved();
        fetchRecentlyViewed();
        fetchRecommendations();
        fetchBarangayStats();
    };

    const toggleSave = async (id) => {
        try {
            const data = await api(`/api/job-seeker/establishments/${id}/toggle-save`, { method: 'POST' });
            if (data.success) {
                setSavedIds(prev => {
                    const next = new Set(prev);
                    if (data.is_saved) next.add(id);
                    else next.delete(id);
                    return next;
                });
                setEstablishments(prev => prev.map(e => e.id === id ? { ...e, is_saved: data.is_saved } : e));
            }
        } catch {}
    };

    const handleEstClick = (id) => {
        setSelectedId(prev => prev === id ? null : id);
        if (id) {
            api(`/api/job-seeker/establishments/${id}`).catch(() => {});
        }
    };

    const getDirections = (lat, lng) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const shareEstablishment = (est) => {
        if (navigator.share) {
            navigator.share({
                title: est.company_name,
                text: `Check out ${est.company_name} - ${est.hiring_status === 'hiring' ? 'Currently Hiring!' : 'Job opportunities available'}`,
                url: `${window.location.origin}/jobseeker/map?est=${est.id}`,
            });
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/jobseeker/map?est=${est.id}`);
        }
    };

    const filteredEstablishments = useMemo(() => {
        let items = establishments;
        if (showSavedOnly) items = items.filter(e => savedIds.has(e.id));
        if (showRecommended) items = items.filter(e => e.recommended);
        return items;
    }, [establishments, showSavedOnly, showRecommended, savedIds]);

    const estList = useMemo(() => {
        if (showSavedOnly) return establishments.filter(e => savedIds.has(e.id));
        if (showRecommended) return filteredEstablishments;
        return filteredEstablishments;
    }, [establishments, filteredEstablishments, showSavedOnly, showRecommended, savedIds]);

    const statusCounts = [
        { label: 'Total', count: meta.total, color: 'bg-slate-600', textColor: 'text-slate-700', icon: Building2 },
        { label: 'Hiring', count: meta.hiring, color: 'bg-green-500', textColor: 'text-green-700', icon: Briefcase },
        { label: 'Pending', count: meta.pending, color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: Clock },
        { label: 'Not Hiring', count: meta.not_hiring, color: 'bg-red-500', textColor: 'text-red-700', icon: X },
        ...(meta.recommended ? [{ label: 'For You', count: meta.recommended, color: 'bg-emerald-500', textColor: 'text-emerald-700', icon: Target }] : []),
        ...(meta.high_match ? [{ label: 'Top Match', count: meta.high_match, color: 'bg-amber-500', textColor: 'text-amber-700', icon: Target }] : []),
    ];

    const clearFilters = () => { setSearch(''); setFilterBarangay(''); setFilterCategory(''); setFilterHiring(''); setFilterRadius(''); setFilterDaysAgo(''); setShowSavedOnly(false); setShowRecommended(false); };

    const hasActiveFilters = search || filterBarangay || filterCategory || filterHiring || filterRadius || filterDaysAgo || showSavedOnly || showRecommended;

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Job Map" />
            <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href={route('jobseeker.dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                                <MapIcon className="h-6 w-6 text-blue-600" />
                                <span className="font-bold text-lg text-slate-800 hidden sm:inline">Job Map</span>
                            </Link>
                            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 bg-slate-100 rounded-full px-3 py-1">
                                <MapPin className="h-3 w-3" /> Misamis Oriental, Opol
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowSidebar(!showSidebar)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors lg:hidden">
                                <List className="h-4 w-4" /> {showSidebar ? 'Hide' : 'List'}
                            </button>
                            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" title="Refresh">
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={getUserLocation} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors" title="My location">
                                <Crosshair className="h-4 w-4" />
                            </button>
                            <Link href={route('jobseeker.dashboard')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                    {statusCounts.map(s => (
                        <div key={s.label} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex items-center gap-2.5">
                            <div className={`${s.color} bg-opacity-10 p-2 rounded-lg`}>
                                <s.icon className={`h-4 w-4 ${s.textColor}`} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">{s.count}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendation banner */}
                {recommendations.length > 0 && !showRecommended && (
                    <button onClick={() => setShowRecommended(true)} className="w-full mb-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg p-3 shadow-sm flex items-center justify-between text-white hover:from-emerald-600 hover:to-green-700 transition-all">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            <div>
                                <span className="font-semibold text-sm">{recommendations.length} recommendation{recommendations.length > 1 ? 's' : ''} for you</span>
                                <p className="text-[10px] text-emerald-100">{recommendations.filter(r => r.match_score >= 70).length} top matches available</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}

                <div className="flex gap-4">
                    {/* Sidebar */}
                    <div className={`${showSidebar ? 'block' : 'hidden'} lg:block w-full lg:w-[380px] shrink-0`}>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-20 max-h-[calc(100vh-8rem)] flex flex-col">
                            {/* Search bar */}
                            <div className="p-3 border-b border-slate-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search establishments..." className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                                    {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <select value={filterBarangay} onChange={e => setFilterBarangay(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 w-full bg-white">
                                        <option value="">All Barangays</option>
                                        {barangays.map(b => <option key={b.id} value={b.id}>{b.barangay_name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 w-full bg-white">
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <select value={filterHiring} onChange={e => setFilterHiring(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 w-full bg-white">
                                        <option value="">All Status</option>
                                        <option value="hiring">Hiring</option>
                                        <option value="pending">Pending</option>
                                        <option value="not_hiring">Not Hiring</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Navigation className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <select value={filterRadius} onChange={e => setFilterRadius(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 w-full bg-white">
                                        <option value="">Any Distance</option>
                                        <option value="1">Within 1 km</option>
                                        <option value="5">Within 5 km</option>
                                        <option value="10">Within 10 km</option>
                                        <option value="25">Within 25 km</option>
                                        <option value="50">Within 50 km</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <select value={filterDaysAgo} onChange={e => setFilterDaysAgo(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 w-full bg-white">
                                        <option value="">Any Date</option>
                                        <option value="7">Past 7 days</option>
                                        <option value="14">Past 2 weeks</option>
                                        <option value="30">Past 30 days</option>
                                        <option value="60">Past 2 months</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => { setShowSavedOnly(!showSavedOnly); setShowRecommended(false); }} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${showSavedOnly ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>
                                        <Heart className={`h-3 w-3 ${showSavedOnly ? 'fill-purple-500 text-purple-500' : ''}`} /> Saved
                                    </button>
                                    <button onClick={() => { setShowRecommended(!showRecommended); setShowSavedOnly(false); }} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${showRecommended ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>
                                        <Target className="h-3 w-3" /> Recommended
                                    </button>
                                    <button onClick={() => setShowAnalytics(!showAnalytics)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${showAnalytics ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>
                                        <BarChart3 className="h-3 w-3" /> Stats
                                    </button>
                                </div>

                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                        <X className="h-3 w-3" /> Clear all filters
                                    </button>
                                )}
                            </div>

                            {/* Est list */}
                            <div className="flex-1 overflow-y-auto">
                                {loading && establishments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                                        <p className="text-sm text-slate-500">Loading establishments...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-4">
                                        <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
                                        <p className="text-sm text-red-600 text-center">{error}</p>
                                        <button onClick={handleRefresh} className="mt-3 text-xs text-blue-600 font-medium">Try again</button>
                                    </div>
                                ) : estList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-4">
                                        <Building2 className="h-8 w-8 text-slate-300 mb-3" />
                                        <p className="text-sm text-slate-500 text-center">
                                            {showSavedOnly ? 'No saved establishments yet' : showRecommended ? 'No matching recommendations' : 'No establishments found'}
                                        </p>
                                        {hasActiveFilters && <button onClick={clearFilters} className="mt-2 text-xs text-blue-600 font-medium">Clear filters</button>}
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                                            <p className="text-xs font-medium text-slate-500">{estList.length} establishment{estList.length !== 1 ? 's' : ''}</p>
                                            <div className="flex gap-1">
                                                <button onClick={() => setViewMode('map')} className={`p-1 rounded ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><MapIcon className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List className="h-3.5 w-3.5" /></button>
                                            </div>
                                        </div>
                                        {viewMode === 'list' ? (
                                            <div className="divide-y divide-slate-100">
                                                {estList.map(est => {
                                                    const sb = getStatusBadge(est.hiring_status);
                                                    return (
                                                        <div key={est.id} className="p-3 hover:bg-slate-50 transition-colors">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${est.hiring_status === 'hiring' ? 'bg-green-500' : est.hiring_status === 'pending' ? 'bg-yellow-500' : 'bg-red-400'}`}>
                                                                    {(est.company_name || 'E')[0].toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                                            <p className="text-sm font-semibold text-slate-800 truncate">{est.company_name}</p>
                                                                            {est.match_score > 0 && (
                                                                                <span className={`text-[10px] font-bold shrink-0 ${matchScoreColor(est.match_score)}`}>{est.match_score}%</span>
                                                                            )}
                                                                        </div>
                                                                        <button onClick={() => toggleSave(est.id)} className="text-slate-400 hover:text-purple-500 transition-colors shrink-0">
                                                                            {savedIds.has(est.id) ? <Heart className="h-3.5 w-3.5 fill-purple-500 text-purple-500" /> : <Heart className="h-3.5 w-3.5" />}
                                                                        </button>
                                                                    </div>
                                                                    {est.match_score > 0 && (
                                                                        <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                                                                            <div className={`${matchScoreBg(est.match_score)} h-full rounded-full transition-all`} style={{ width: `${est.match_score}%` }} />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sb.bg} ${sb.text}`}>
                                                                            <span className={`h-1.5 w-1.5 rounded-full ${sb.dot}`} /> {sb.label}
                                                                        </span>
                                                                        {est.industry_category && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{est.industry_category}</span>}
                                                                        {est.available_jobs_count > 0 && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{est.available_jobs_count} job{est.available_jobs_count !== 1 ? 's' : ''}</span>}
                                                                        {est.recommended && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Recommended</span>}
                                                                        {est.match_score >= 70 && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Top Match</span>}
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 mt-1 truncate">{est.address}</p>
                                                                    {est.distance_km != null && <p className="text-[10px] text-blue-500 mt-0.5">{formatDistance(est.distance_km)}</p>}
                                                                    {est.travel_time && (
                                                                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                                                                            <span title="Walking">🚶 {formatTravelTime(est.travel_time.walking)}</span>
                                                                            <span title="Motorcycle">🛵 {formatTravelTime(est.travel_time.motorcycle)}</span>
                                                                            <span title="Car">🚗 {formatTravelTime(est.travel_time.car)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex gap-1.5">
                                                                <Link href={`/jobseeker/map?est=${est.id}`} className="flex-1 text-center text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors">View on Map</Link>
                                                                <button onClick={() => getDirections(est.latitude, est.longitude)} className="flex-1 text-center text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors">Directions</button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="max-h-[460px] overflow-y-auto">
                                                {estList.map(est => {
                                                    const sb = getStatusBadge(est.hiring_status);
                                                    return (
                                                        <button key={est.id} onClick={() => handleEstClick(est.id)} className={`w-full text-left px-4 py-3 transition-colors border-b border-slate-100 last:border-b-0 ${selectedId === est.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                                            <div className="flex items-start gap-3">
                                                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${est.hiring_status === 'hiring' ? 'bg-green-500' : est.hiring_status === 'pending' ? 'bg-yellow-500' : 'bg-red-400'}`}>
                                                                    {(est.company_name || 'E')[0].toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                                            <p className="text-sm font-semibold text-slate-800 truncate">{est.company_name}</p>
                                                                            {est.match_score > 0 && (
                                                                                <span className={`text-[10px] font-bold shrink-0 ${matchScoreColor(est.match_score)}`}>{est.match_score}%</span>
                                                                            )}
                                                                        </div>
                                                                        {savedIds.has(est.id) && <Heart className="h-3 w-3 fill-purple-500 text-purple-500 shrink-0" />}
                                                                    </div>
                                                                    {est.match_score > 0 && (
                                                                        <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                                                                            <div className={`${matchScoreBg(est.match_score)} h-full rounded-full transition-all`} style={{ width: `${est.match_score}%` }} />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sb.bg} ${sb.text}`}>
                                                                            <span className={`h-1.5 w-1.5 rounded-full ${sb.dot}`} /> {sb.label}
                                                                        </span>
                                                                        {est.industry_category && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{est.industry_category}</span>}
                                                                        {est.recommended && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Match</span>}
                                                                        {est.match_score >= 70 && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Top Match</span>}
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 mt-1 truncate">{est.address}</p>
                                                                    {est.distance_km != null && <p className="text-[10px] text-blue-500 mt-0.5">{formatDistance(est.distance_km)}</p>}
                                                                    {est.matching_skills?.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {est.matching_skills.slice(0, 3).map(skill => (
                                                                                <span key={skill} className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{skill}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Analytics Panel */}
                            {showAnalytics && (
                                <div className="border-t border-slate-100">
                                    <div className="px-4 py-2 bg-blue-50 flex items-center gap-1.5">
                                        <BarChart3 className="h-3 w-3 text-blue-600" />
                                        <span className="text-[10px] font-medium text-blue-700 uppercase tracking-wider">Analytics</span>
                                        <button onClick={() => setShowAnalytics(false)} className="ml-auto text-blue-400 hover:text-blue-600"><X className="h-3 w-3" /></button>
                                    </div>
                                    <div className="px-3 py-2 space-y-3 max-h-[200px] overflow-y-auto">
                                        {Object.keys(analytics.top_hiring_barangays || {}).length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-600 mb-1">Top Hiring Barangays</p>
                                                {Object.entries(analytics.top_hiring_barangays).map(([name, count]) => (
                                                    <div key={name} className="flex items-center justify-between py-1">
                                                        <span className="text-xs text-slate-600">{name}</span>
                                                        <span className="text-xs font-medium text-green-600">{count} hiring</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {Object.keys(analytics.jobs_by_category || {}).length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-600 mb-1">Jobs by Category</p>
                                                {Object.entries(analytics.jobs_by_category).map(([cat, count]) => (
                                                    <div key={cat} className="flex items-center justify-between py-1">
                                                        <span className="text-xs text-slate-600 truncate max-w-[200px]">{cat}</span>
                                                        <span className="text-xs font-medium text-blue-600">{count} jobs</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {barangayStatsData.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-600 mb-1">Barangay Overview</p>
                                                {barangayStatsData.slice(0, 5).map(b => (
                                                    <div key={b.barangay_name} className="flex items-center justify-between py-1">
                                                        <span className="text-xs text-slate-600">{b.barangay_name}</span>
                                                        <span className="text-xs text-slate-400">{b.active_jobs} jobs</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Recently viewed */}
                            {recentlyViewed.length > 0 && !hasActiveFilters && (
                                <div className="border-t border-slate-100">
                                    <div className="px-4 py-2 bg-slate-50 flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Recently Viewed</span>
                                    </div>
                                    <div className="overflow-x-auto flex gap-2 px-3 py-2">
                                        {recentlyViewed.map(rv => (
                                            <button key={rv.id} onClick={() => handleEstClick(rv.id)} className="shrink-0 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 transition-colors min-w-[130px]">
                                                <p className="text-xs font-semibold text-slate-700 truncate">{rv.company_name}</p>
                                                <p className="text-[10px] text-slate-400">{rv.barangay_name} &middot; {rv.viewed_at}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                            <div className="relative">
                                <div className="rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
                                    <MapContainer center={OPOL_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <ScaleControl position="bottomleft" imperial={false} />
                                        <MapController establishments={estList} selectedId={selectedId} userLocation={userLocation} />

                                        <MarkerClusterGroup chunkedLoading>
                                        {estList.map(est => {
                                            if (!est.latitude || !est.longitude) return null;
                                            const isSaved = savedIds.has(est.id);
                                            const icon = getIconForEstablishment(est, isSaved, est.recommended);
                                            return (
                                                <Marker key={est.id} position={[est.latitude, est.longitude]} icon={icon}>
                                                    <Popup>
                                                        <div className="text-sm min-w-[260px] max-w-[320px]">
                                                            {/* Header with logo and name */}
                                                            <div className="flex items-start gap-3 mb-2">
                                                                {est.logo ? (
                                                                    <img src={est.logo} alt={est.company_name} className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                                                ) : (
                                                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${est.hiring_status === 'hiring' ? 'bg-green-500' : est.hiring_status === 'pending' ? 'bg-yellow-500' : 'bg-red-400'}`}>
                                                                        {(est.company_name || 'E')[0].toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-start justify-between gap-1">
                                                                        <div>
                                                                            <p className="font-bold text-slate-800 leading-tight">{est.company_name}</p>
                                                                            {est.barangay_name && <p className="text-[10px] text-slate-400">{est.barangay_name}, Opol</p>}
                                                                        </div>
                                                                        <button onClick={() => toggleSave(est.id)} className="text-slate-400 hover:text-purple-500 transition-colors shrink-0 mt-0.5" title={isSaved ? 'Unsave' : 'Save'}>
                                                                            {isSaved ? <Heart className="h-4 w-4 fill-purple-500 text-purple-500" /> : <Heart className="h-4 w-4" />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Match score */}
                                                            {est.match_score > 0 && (
                                                                <div className="mb-2">
                                                                    <div className="flex items-center justify-between mb-0.5">
                                                                        <span className="text-[10px] font-semibold text-slate-500">Match Score</span>
                                                                        <span className={`text-xs font-bold ${matchScoreColor(est.match_score)}`}>{est.match_score}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                        <div className={`${matchScoreBg(est.match_score)} h-full rounded-full transition-all`} style={{ width: `${est.match_score}%` }} />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Status badges */}
                                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadge(est.hiring_status).bg} ${getStatusBadge(est.hiring_status).text}`}>
                                                                    <span className={`h-1.5 w-1.5 rounded-full ${getStatusBadge(est.hiring_status).dot}`} /> {getStatusBadge(est.hiring_status).label}
                                                                </span>
                                                                {est.industry_category && (
                                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{est.industry_category}</span>
                                                                )}
                                                                {est.recommended && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                                                        <Target className="h-3 w-3" /> Match
                                                                    </span>
                                                                )}
                                                                {est.match_score >= 70 && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                                                        Top Match
                                                                    </span>
                                                                )}
                                                                {est.best_job_title && est.match_score >= 40 && (
                                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium w-full mt-0.5">
                                                                        Best match: {est.best_job_title}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="space-y-1 text-xs text-slate-600 mb-2">
                                                                {est.address && <p className="flex items-start gap-1.5"><MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />{est.address}</p>}
                                                                {est.contact_person && <p className="flex items-center gap-1.5"><Users className="h-3 w-3 text-slate-400 shrink-0" />{est.contact_person}</p>}
                                                                {est.contact_number && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400 shrink-0" />{est.contact_number}</p>}
                                                                {est.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400 shrink-0" />{est.email}</p>}
                                                                {est.distance_km != null && <p className="flex items-center gap-1.5 text-blue-600 font-medium"><Navigation className="h-3 w-3" />{formatDistance(est.distance_km)}</p>}
                                                            </div>

                                                            {/* Travel time */}
                                                            {est.travel_time && (
                                                                <div className="flex items-center gap-3 mb-2 bg-slate-50 rounded-lg p-2">
                                                                    <div className="text-center flex-1">
                                                                        <p className="text-[9px] text-slate-400">Walking</p>
                                                                        <p className="text-xs font-semibold text-slate-700">{formatTravelTime(est.travel_time.walking)}</p>
                                                                    </div>
                                                                    <div className="text-center flex-1">
                                                                        <p className="text-[9px] text-slate-400">Motorcycle</p>
                                                                        <p className="text-xs font-semibold text-slate-700">{formatTravelTime(est.travel_time.motorcycle)}</p>
                                                                    </div>
                                                                    <div className="text-center flex-1">
                                                                        <p className="text-[9px] text-slate-400">Car</p>
                                                                        <p className="text-xs font-semibold text-slate-700">{formatTravelTime(est.travel_time.car)}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Matching skills */}
                                                            {est.matching_skills?.length > 0 && (
                                                                <div className="mb-2">
                                                                    <p className="text-[10px] font-medium text-emerald-700 mb-1 flex items-center gap-1"><Target className="h-3 w-3" /> Skills match:</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {est.matching_skills.map(skill => (
                                                                            <span key={skill} className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{skill}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Jobs listing */}
                                                            {est.jobs?.length > 0 && (
                                                                <div className="mb-2 max-h-[140px] overflow-y-auto">
                                                                    <p className="text-[10px] font-medium text-slate-600 mb-1 flex items-center gap-1"><Briefcase className="h-3 w-3" /> Job Openings ({est.jobs.length}):</p>
                                                                    {est.jobs.slice(0, 4).map(job => (
                                                                        <div key={job.id} className="bg-slate-50 rounded p-1.5 mb-1 last:mb-0">
                                                                            <div className="flex items-start justify-between gap-1">
                                                                                <p className="text-xs font-medium text-slate-700">{job.job_title}</p>
                                                                                {est.best_job_id === job.id && est.match_score >= 40 && (
                                                                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-medium shrink-0">{est.match_score}%</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                                                {job.salary_range && <span className="flex items-center gap-0.5"><DollarSign className="h-2.5 w-2.5" />{job.salary_range}</span>}
                                                                                {job.employment_type && <span>{job.employment_type}</span>}
                                                                                {job.days_ago != null && <span className="ml-auto">{job.days_ago === 0 ? 'Today' : `${job.days_ago}d ago`}</span>}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {est.jobs.length > 4 && <p className="text-[10px] text-blue-500 mt-1">+{est.jobs.length - 4} more jobs</p>}
                                                                </div>
                                                            )}

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                                                                {est.jobs?.length > 0 && (
                                                                    <Link href={route('jobseeker.map')} className="flex-1 text-center text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-700 px-2 py-1.5 rounded transition-colors">
                                                                        Apply Now
                                                                    </Link>
                                                                )}
                                                                <button onClick={() => getDirections(est.latitude, est.longitude)} className="flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded transition-colors">
                                                                    <Navigation className="h-3 w-3" /> Go
                                                                </button>
                                                                <button onClick={() => shareEstablishment(est)} className="flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded transition-colors" title="Share">
                                                                    <Share2 className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                        </MarkerClusterGroup>

                                        {userLocation && (
                                            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                                                <Popup>
                                                    <div className="text-sm"><p className="font-semibold text-green-700 flex items-center gap-1.5"><Navigation className="h-3.5 w-3.5" /> Your Location</p><p className="text-xs text-slate-500 mt-1">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p></div>
                                                </Popup>
                                            </Marker>
                                        )}
                                    </MapContainer>
                                </div>

                                {/* Legend */}
                                <div className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md border border-slate-200 px-3 py-2.5 text-xs">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Layers className="h-3 w-3 text-slate-500" />
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Legend</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-green-500 border border-white shadow-sm" /><span className="text-[10px] text-slate-600">Hiring</span></div>
                                        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-yellow-500 border border-white shadow-sm" /><span className="text-[10px] text-slate-600">Pending</span></div>
                                        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-500 border border-white shadow-sm" /><span className="text-[10px] text-slate-600">Not Hiring</span></div>
                                        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-purple-500 border border-white shadow-sm" /><span className="text-[10px] text-slate-600">Saved</span></div>
                                        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white shadow-sm" /><span className="text-[10px] text-slate-600">Recommended</span></div>
                                        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-amber-400 border-2 border-white shadow-sm shadow-amber-400/50" /><span className="text-[10px] text-slate-600">Top Match (70%+)</span></div>
                                        {userLocation && <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm outline outline-2 outline-green-500/30" /><span className="text-[10px] text-slate-600">You</span></div>}
                                        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-slate-400 border border-white shadow-sm" /><span className="text-[10px] text-slate-600">Clustered</span></div>
                                    </div>
                                </div>

                                {/* Loading overlay */}
                                {loading && establishments.length > 0 && (
                                    <div className="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                        <span className="text-xs text-slate-500">Updating...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
