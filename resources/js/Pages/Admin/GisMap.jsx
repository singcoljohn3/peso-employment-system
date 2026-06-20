import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ScaleControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, MapPin, Users, Briefcase, Crosshair, Navigation, Search, X, ChevronRight, Layers, Filter, RefreshCw, Maximize2, Minimize2, Globe } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const OPOL_CENTER = [8.48, 124.57];
const DEFAULT_ZOOM = 12;

const TILE_LAYERS = [
    { name: 'Street', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
    { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '&copy; Esri' },
    { name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>' },
];

function createIcon(bg, size, svg) {
    return new L.DivIcon({
        className: '',
        html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${svg}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

const S = (p) => `<svg xmlns="http://www.w3.org/2000/svg" width="${p.w || 12}" height="${p.w || 12}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${p.d}</svg>`;

const baranggayIcon = createIcon('#7c3aed', 28, S({ d: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', w: 14 }));
const establishmentIcon = createIcon('#2563eb', 24, S({ d: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', w: 12 }));
const hiringIcon = createIcon('#10b981', 28, S({ d: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', w: 14 }));
const userLocationIcon = new L.DivIcon({
    className: '',
    html: '<div style="background:#10b981;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(16,185,129,0.3)"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

function MapController({ items, selectedId }) {
    const map = useMap();
    useEffect(() => { setTimeout(() => map.invalidateSize(), 250); }, [map]);
    useEffect(() => {
        const coords = items.filter(i => i.lat && i.lng).map(i => [i.lat, i.lng]);
        if (coords.length > 0) {
            map.fitBounds(L.latLngBounds(coords), { padding: [45, 45], maxZoom: 14 });
        }
    }, [items.length]);
    useEffect(() => {
        if (selectedId) {
            const item = items.find(i => i.id === selectedId);
            if (item?.lat && item?.lng) {
                map.flyTo([item.lat, item.lng], 15, { duration: 0.8 });
            }
        }
    }, [selectedId]);
    return null;
}

const layerDefs = [
    { key: 'barangays', label: 'Barangays', icon: MapPin, color: '#7c3aed' },
    { key: 'establishments', label: 'Establishments', icon: Building2, color: '#2563eb' },
];

const categoryLabels = {
    'Food & Beverage': 'Food & Beverage',
    'Retail': 'Retail',
    'Services': 'Services',
    'Manufacturing': 'Manufacturing',
    'Technology': 'Technology',
    'Healthcare': 'Healthcare',
    'Education': 'Education',
    'Construction': 'Construction',
    'Agriculture': 'Agriculture',
    'Other': 'Other',
};

export default function GisMap({ barangays, establishments, region, municipality, gisStats, barangayStats }) {
    const [userLocation, setUserLocation] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [activeLayers, setActiveLayers] = useState({ barangays: true, establishments: true });
    const [filterCategory, setFilterCategory] = useState('');
    const [tileIndex, setTileIndex] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const mapContainerRef = useRef(null);

    const barItems = useMemo(() =>
        (barangays || []).filter(b => b.latitude && b.longitude).map(b => ({
            id: `brgy-${b.id}`,
            lat: parseFloat(b.latitude),
            lng: parseFloat(b.longitude),
            type: 'barangay',
            name: b.barangay_name,
            stats: barangayStats?.find(s => s.name === b.barangay_name),
        })), [barangays, barangayStats]);

    const estItems = useMemo(() =>
        (establishments || []).filter(e => e.latitude && e.longitude).map(e => ({
            id: `est-${e.id}`,
            lat: parseFloat(e.latitude),
            lng: parseFloat(e.longitude),
            type: 'establishment',
            name: e.company_name,
            ...e,
        })), [establishments]);

    const filteredBarItems = useMemo(() => {
        if (!search) return barItems;
        const q = search.toLowerCase();
        return barItems.filter(b => b.name.toLowerCase().includes(q));
    }, [barItems, search]);

    const filteredEstItems = useMemo(() => {
        let items = estItems;
        const q = search.toLowerCase();
        if (q) items = items.filter(e => e.name.toLowerCase().includes(q) || (e.address || '').toLowerCase().includes(q) || (e.barangay?.barangay_name || '').toLowerCase().includes(q));
        if (filterCategory) items = items.filter(e => e.industry_category === filterCategory);
        return items;
    }, [estItems, search, filterCategory]);

    const visibleItems = useMemo(() => {
        const items = [];
        if (activeLayers.barangays) items.push(...filteredBarItems);
        if (activeLayers.establishments) items.push(...filteredEstItems);
        return items;
    }, [activeLayers, filteredBarItems, filteredEstItems]);

    const categories = useMemo(() => {
        const set = new Set();
        estItems.forEach(e => { if (e.industry_category) set.add(e.industry_category); });
        return [...set].sort();
    }, [estItems]);

    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {}
        );
    }, []);

    const clearFilters = () => { setSearch(''); setFilterCategory(''); };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            mapContainerRef.current?.requestFullscreen?.();
            setFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setFullscreen(false);
        }
    };
    useEffect(() => {
        const onFsChange = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({ preserveState: true, preserveScroll: true, only: ['establishments', 'barangays', 'gisStats', 'barangayStats'], onFinish: () => setRefreshing(false) });
    };

    const pollingRef = useRef(null);
    useEffect(() => {
        pollingRef.current = setInterval(() => {
            router.reload({ preserveState: true, preserveScroll: true, only: ['establishments', 'barangays', 'gisStats', 'barangayStats'] });
        }, 30000);
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                router.reload({ preserveState: true, preserveScroll: true, only: ['establishments', 'barangays', 'gisStats', 'barangayStats'] });
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    return (
        <AdminLayouts>
            <Head title="GIS Map" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">GIS Map</h1>
                            <p className="text-sm text-slate-500">{municipality}, {region}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTileIndex((tileIndex + 1) % TILE_LAYERS.length)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                                title={`Map style: ${TILE_LAYERS[tileIndex].name}`}
                            ><Globe className="h-4 w-4" /> {TILE_LAYERS[tileIndex].name}</button>
                            <button
                                onClick={toggleFullscreen}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                                title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            >{fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                title="Refresh map data"
                            ><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
                            <button
                                onClick={getUserLocation}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                                title="Show my location"
                            ><Crosshair className="h-4 w-4" /> My Location</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2.5 rounded-lg"><MapPin className="h-5 w-5 text-purple-600" /></div>
                                <div><p className="text-xs text-slate-500">Barangays</p><p className="text-xl font-bold text-slate-800">{gisStats?.total_barangays ?? 0}</p></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2.5 rounded-lg"><Building2 className="h-5 w-5 text-blue-600" /></div>
                                <div><p className="text-xs text-slate-500">Establishments</p><p className="text-xl font-bold text-slate-800">{gisStats?.total_establishments ?? 0}</p></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 p-2.5 rounded-lg"><Briefcase className="h-5 w-5 text-amber-600" /></div>
                                <div><p className="text-xs text-slate-500">Active Jobs</p><p className="text-xl font-bold text-slate-800">{gisStats?.total_active_jobs ?? 0}</p></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2.5 rounded-lg"><Users className="h-5 w-5 text-green-600" /></div>
                                <div><p className="text-xs text-slate-500">Job Seekers</p><p className="text-xl font-bold text-slate-800">{barangayStats?.reduce((a, b) => a + (b.job_seekers || 0), 0) ?? 0}</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            {/* Search & Filters */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                                <div className="p-3 border-b border-slate-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="Search locations..."
                                            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                        {search && (
                                            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Layer toggles */}
                                <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                                    <Layers className="h-3.5 w-3.5 text-slate-500" />
                                    <span className="text-xs font-medium text-slate-600">Layers</span>
                                    {layerDefs.map(l => (
                                        <button
                                            key={l.key}
                                            onClick={() => setActiveLayers(prev => ({ ...prev, [l.key]: !prev[l.key] }))}
                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${activeLayers[l.key] ? 'text-white' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
                                            style={activeLayers[l.key] ? { backgroundColor: l.color } : {}}
                                        >
                                            <l.icon className="h-3 w-3" /> {l.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Category filter */}
                                {categories.length > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                                        <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                        <select
                                            value={filterCategory}
                                            onChange={e => setFilterCategory(e.target.value)}
                                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
                                        >
                                            <option value="">All categories</option>
                                            {categories.map(c => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
                                        </select>
                                    </div>
                                )}

                                {(search || filterCategory) && (
                                    <div className="px-3 py-1.5 border-b border-slate-100">
                                        <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                            <X className="h-3 w-3" /> Clear filters
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Location list */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                                    <h2 className="font-bold text-slate-800">Locations</h2>
                                    <p className="text-xs text-slate-500">{visibleItems.length} shown</p>
                                </div>
                                <div className="max-h-[420px] overflow-y-auto">
                                    {visibleItems.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10">
                                            <MapPin className="h-8 w-8 text-slate-300 mb-2" />
                                            <p className="text-sm text-slate-500">No results found</p>
                                            {(search || filterCategory) && (
                                                <button onClick={clearFilters} className="text-xs text-blue-600 mt-1">Clear filters</button>
                                            )}
                                        </div>
                                    )}
                                    {visibleItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                                            className={`w-full text-left px-4 py-3 transition-colors border-b border-slate-100 last:border-b-0 ${selectedId === item.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${item.type === 'barangay' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                    {item.type === 'barangay' ? <MapPin className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                                                        {selectedId === item.id && <ChevronRight className="h-4 w-4 text-blue-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-xs text-slate-400">{item.type === 'barangay' ? 'Barangay' : 'Establishment'}{item.coords_fallback ? ' (approx.)' : ''}</p>
                                                    {item.type === 'barangay' && item.stats && (
                                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                                                            <span><Users className="h-3 w-3 inline mr-0.5" />{item.stats.job_seekers ?? 0}</span>
                                                            <span><Building2 className="h-3 w-3 inline mr-0.5" />{item.stats.establishments ?? 0}</span>
                                                        </div>
                                                    )}
                                                    {item.type === 'establishment' && (
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-slate-500">
                                                            {item.address && <span className="truncate max-w-[160px]">{item.address}</span>}
                                                            {item.industry_category && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">{item.industry_category}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="relative p-1.5">
                                    <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: 580 }}>
                                        <MapContainer center={OPOL_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }} zoomControl={true} ref={mapContainerRef}>
                                            <TileLayer
                                                attribution={TILE_LAYERS[tileIndex].attr}
                                                url={TILE_LAYERS[tileIndex].url}
                                                key={tileIndex}
                                            />
                                            <ScaleControl position="bottomleft" imperial={false} />
                                            <MapController items={visibleItems} selectedId={selectedId} />

                                            <MarkerClusterGroup chunkedLoading>
                                                {activeLayers.barangays && filteredBarItems.map(b => (
                                                    <Marker key={b.id} position={[b.lat, b.lng]} icon={baranggayIcon}>
                                                        <Popup>
                                                            <div className="text-sm min-w-[180px]">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <MapPin className="h-4 w-4 text-purple-600" />
                                                                    <p className="font-bold text-slate-800">{b.name}</p>
                                                                </div>
                                                                {b.stats && (
                                                                    <div className="space-y-1.5 text-xs">
                                                                        <div className="flex items-center gap-2">
                                                                            <Users className="h-3.5 w-3.5 text-green-500" />
                                                                            <span className="text-slate-600">{b.stats.job_seekers ?? 0} Job Seeker{(b.stats.job_seekers ?? 0) !== 1 ? 's' : ''}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                                                            <span className="text-slate-600">{b.stats.establishments ?? 0} Establishment{(b.stats.establishments ?? 0) !== 1 ? 's' : ''}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="mt-2 pt-2 border-t border-slate-100">
                                                                    <p className="text-xs text-slate-400">{b.lat?.toFixed(4)}, {b.lng?.toFixed(4)}</p>
                                                                </div>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                ))}
                                            </MarkerClusterGroup>

                                            <MarkerClusterGroup chunkedLoading>
                                                {activeLayers.establishments && filteredEstItems.map(e => {
                                                    const isHiring = e.is_hiring || (e.available_jobs_count || 0) > 0;
                                                    return (
                                                    <Marker key={e.id} position={[e.lat, e.lng]} icon={isHiring ? hiringIcon : establishmentIcon}>
                                                        <Popup>
                                                            <div className="text-sm min-w-[210px]">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                                        {(e.name || 'E')[0].toUpperCase()}
                                                                    </div>
                                                                    <p className="font-bold text-slate-800">{e.name}</p>
                                                                </div>
                                                                {e.coords_fallback && <p className="text-xs text-amber-600 italic mb-1.5">* Approximate location (barangay area)</p>}

                                                                <div className="space-y-1 text-xs text-slate-600 mt-2">
                                                                    {e.barangay?.barangay_name && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                                                            <span>{e.barangay.barangay_name}, {municipality}</span>
                                                                        </div>
                                                                    )}
                                                                    {e.address && (
                                                                        <div className="flex items-start gap-1.5">
                                                                            <Navigation className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                                                                            <span>{e.address}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                                    {e.industry_category && (
                                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                                            {e.industry_category}
                                                                        </span>
                                                                    )}
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                                        <Briefcase className="h-3 w-3" /> {e.available_jobs_count || 0} job{(e.available_jobs_count || 0) !== 1 ? 's' : ''}
                                                                    </span>
                                                                </div>

                                                                <div className="h-px bg-slate-200 my-2" />

                                                                <div className="space-y-1 text-xs text-slate-600">
                                                                    {e.contact_person && <p><span className="font-medium text-slate-700">Contact:</span> {e.contact_person}</p>}
                                                                    {e.contact_number && <p className="flex items-center gap-1"><span className="font-medium text-slate-700">Tel:</span> {e.contact_number}</p>}
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
                                                        <div className="text-sm">
                                                            <p className="font-semibold text-green-700 flex items-center gap-1.5">
                                                                <Navigation className="h-3.5 w-3.5" /> Your Location
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            )}
                                        </MapContainer>
                                    </div>

                                    {/* Legend overlay */}
                                    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md border border-slate-200 px-3 py-2.5">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Layers className="h-3.5 w-3.5 text-slate-500" />
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Legend</span>
                                        </div>
                                        <div className="space-y-1">
                                            {layerDefs.filter(l => activeLayers[l.key]).map(l => (
                                                <div key={l.key} className="flex items-center gap-2">
                                                    <div style={{ background: l.color, width: 10, height: 10, borderRadius: '50%', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                                    <span className="text-xs text-slate-600">{l.label}</span>
                                                </div>
                                            ))}
                                            {activeLayers.establishments && (
                                                <div className="flex items-center gap-2">
                                                    <div style={{ background: '#10b981', width: 10, height: 10, borderRadius: '50%', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                                    <span className="text-xs text-slate-600">Hiring / Has Jobs</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <div style={{ background: '#64748b', width: 10, height: 10, borderRadius: '3px', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                                <span className="text-xs text-slate-600">Clustered markers</span>
                                            </div>
                                            {userLocation && (
                                                <div className="flex items-center gap-2">
                                                    <div style={{ background: '#10b981', width: 10, height: 10, borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 3px rgba(16,185,129,0.25)' }} />
                                                    <span className="text-xs text-slate-600">You</span>
                                                </div>
                                            )}
                                            <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5">
                                                    <Globe className="h-3 w-3 text-slate-400" />
                                                    <span className="text-xs text-slate-500">{TILE_LAYERS[tileIndex].name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayouts>
    );
}