import AdminLayouts from '@/Layouts/AdminLayouts';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ScaleControl, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    MapPin, Briefcase, Crosshair,
    RefreshCw, Maximize2, Minimize2, Phone,
    Target, Loader2, AlertCircle, Search, X,
    Filter, ExternalLink, Globe, Building2,
    Users, Eye, Clock, Calendar,
    Map as MapIcon, Satellite, Activity, UserCheck,
    FileText, TrendingUp
} from 'lucide-react';
import 'leaflet.heat';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const OPOL_CENTER = [8.48, 124.57];
const DEFAULT_ZOOM = 12;

const COLORS = {
    hiring: '#10b981',
    closed: '#ef4444',
    hiringSoon: '#eab308',
    registered: '#3b82f6',
    userLocation: '#8b5cf6',
    barangay: '#7c3aed',
};

const TILE_SETS = {
    street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attr: '&copy; Esri, Maxar, Earthstar, and the GIS User Community'
    },
};

function createIcon(bg, size, pulse = false) {
    return new L.DivIcon({
        className: '',
        html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)${pulse ? ';animation:pulse-marker 2s infinite' : ''}">${size >= 36 ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

const markerIcons = {
    hiring: createIcon(COLORS.hiring, 40),
    closed: createIcon(COLORS.closed, 40),
    hiringSoon: createIcon(COLORS.hiringSoon, 40),
    registered: createIcon(COLORS.registered, 38),
    barangay: createIcon(COLORS.barangay, 28),
    userLocation: new L.DivIcon({
        className: '',
        html: `<div style="background:${COLORS.userLocation};width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(139,92,246,0.3),0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    }),
    pesoOffice: new L.DivIcon({
        className: '',
        html: `<div style="background:${COLORS.userLocation};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 0 0 4px rgba(139,92,246,0.3),0 2px 8px rgba(0,0,0,0.3);animation:pulse-marker 2s infinite"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
};

function getMarkerIcon(est) {
    if (est.hiring_status_label === 'hiring_soon' || (est.is_hiring && est.is_hiring_soon)) return markerIcons.hiringSoon;
    if (est.is_hiring) return markerIcons.hiring;
    if (est.is_closed) return markerIcons.closed;
    return markerIcons.registered;
}

function MapController({ items, selectedId, fitKey, initialFitDone }) {
    const map = useMap();
    useEffect(() => { setTimeout(() => map.invalidateSize(), 250); }, []);
    useEffect(() => {
        if (!initialFitDone && items.length > 0) {
            const valid = items.filter(i => i.lat && i.lng);
            if (valid.length > 0) {
                const bounds = L.latLngBounds(valid.map(i => [i.lat, i.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
            return;
        }
        if (selectedId === 'reset' || fitKey) {
            const valid = items.filter(i => i.lat && i.lng);
            if (valid.length > 0) {
                const bounds = L.latLngBounds(valid.map(i => [i.lat, i.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
            return;
        }
        if (selectedId) {
            const item = items.find(i => i.id === selectedId);
            if (item?.lat && item?.lng) map.flyTo([item.lat, item.lng], 16, { duration: 0.8 });
        }
    }, [selectedId, fitKey]);
    return null;
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Seasonal', 'Internship', 'Job Order', 'Casual'];
const HIRING_STATUS_OPTIONS = ['Hiring', 'Hiring Soon', 'Closed', 'Registered'];
const DATE_POSTED_OPTIONS = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];

function StatCard({ icon: Icon, label, value, color, bgColor, textColor, format }) {
    const [displayVal, setDisplayVal] = useState(0);
    const target = value ?? 0;
    useEffect(() => {
        if (target === 0) { setDisplayVal(0); return; }
        const duration = 1000;
        const steps = 30;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setDisplayVal(target);
                clearInterval(timer);
            } else {
                setDisplayVal(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [target]);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${textColor}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-[18px] font-bold text-slate-900 leading-tight">
                        {format === 'percent' ? `${displayVal}%` : displayVal.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{label}</p>
                </div>
            </div>
        </div>
    );
}

function HiringPopup({ e, municipality, pesoOffice }) {
    const statusColors = {
        hiring: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        hiring_soon: 'bg-amber-50 text-amber-700 border-amber-200',
        closed: 'bg-red-50 text-red-700 border-red-200',
        registered: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    const statusLabels = {
        hiring: 'Hiring',
        hiring_soon: 'Hiring Soon',
        closed: 'Closed',
        registered: 'Registered',
    };
    const status = e.hiring_status_label || (e.is_hiring ? 'hiring' : 'registered');
    const statusDotColors = {
        hiring: 'bg-emerald-500',
        hiring_soon: 'bg-amber-500',
        closed: 'bg-red-500',
        registered: 'bg-blue-500',
    };

    return (
        <div className="min-w-[300px] max-w-[340px] font-sans">
            <div className="flex items-start gap-3 mb-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 shrink-0 overflow-hidden border border-slate-200 shadow-sm">
                    {e.logo ? <img src={e.logo} alt="" className="h-full w-full object-cover" /> : (e.name || 'E')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{e.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${statusColors[status] || statusColors.registered}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDotColors[status] || 'bg-blue-500'} ${status === 'hiring' ? 'animate-pulse' : ''}`} />
                            {statusLabels[status] || 'Registered'}
                        </span>
                        {e.industry_category && (
                            <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">{e.industry_category}</span>
                        )}
                    </div>
                </div>
            </div>

            {e.coords_fallback && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 mb-2.5">
                    <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="text-[9px] text-amber-600">Approximate location</span>
                </div>
            )}

            <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                <p className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{e.address || e.barangay_name}, {municipality}</span>
                </p>
                {e.barangay_name && (
                    <p className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>Barangay {e.barangay_name}</span>
                    </p>
                )}
                {e.contact_person && (
                    <p className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{e.contact_person}</span>
                    </p>
                )}
                {e.contact_number && (
                    <p className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                        {e.contact_number}
                    </p>
                )}
                {e.email && (
                    <p className="flex items-center gap-1.5">
                        <MailIcon className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{e.email}</span>
                    </p>
                )}
            </div>

            {e.job_positions && e.job_positions.length > 0 && (
                <div className="mt-2.5 border-t border-slate-100 pt-2">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Available Positions</p>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                        {e.job_positions.slice(0, 4).map((jp, i) => (
                            <div key={jp.id || i} className="flex items-center justify-between text-[10px] bg-slate-50 rounded px-2 py-1">
                                <span className="font-medium text-slate-700 truncate">{jp.job_title}</span>
                                <span className="text-slate-400 shrink-0 ml-2">{jp.vacant_positions} slot{jp.vacant_positions !== 1 ? 's' : ''}</span>
                            </div>
                        ))}
                        {e.job_positions.length > 4 && (
                            <p className="text-[9px] text-slate-400 text-center">+{e.job_positions.length - 4} more</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 mt-2.5 border-t border-slate-100 pt-2.5">
                <div className="bg-emerald-50 rounded-lg p-2 text-center">
                    <p className="text-[18px] font-bold text-emerald-600 leading-none">{e.available_jobs_count || 0}</p>
                    <p className="text-[9px] text-emerald-500 mt-0.5 font-medium">Vacancies</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-[18px] font-bold text-blue-600 leading-none">{e.total_applications || 0}</p>
                    <p className="text-[9px] text-blue-500 mt-0.5 font-medium">Applicants</p>
                </div>
                <div className="bg-violet-50 rounded-lg p-2 text-center">
                    <p className="text-[18px] font-bold text-violet-600 leading-none">{e.interview_applications || 0}</p>
                    <p className="text-[9px] text-violet-500 mt-0.5 font-medium">Interviewed</p>
                </div>
                <div className="bg-emerald-50/50 rounded-lg p-2 text-center col-span-1">
                    <p className="text-[18px] font-bold text-emerald-600 leading-none">{e.hired_applications || 0}</p>
                    <p className="text-[9px] text-emerald-500 mt-0.5 font-medium">Hired</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center col-span-2 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-[9px] text-slate-500">{e.last_updated ? new Date(e.last_updated).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                <a href={`/admin/establishments/${e.id}`} target="_blank" rel="noopener"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                    <Eye className="h-3 w-3" /> View
                </a>
                <a href={`/admin/job-vacancies?establishment=${e.id}`} target="_blank" rel="noopener"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200">
                    <Briefcase className="h-3 w-3" /> Vacancies
                </a>
                <a href={`/admin/applications?establishment=${e.id}`} target="_blank" rel="noopener"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors border border-violet-200">
                    <Users className="h-3 w-3" /> Applicants
                </a>
            </div>
        </div>
    );
}

function MailIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function BarangayPopup({ b }) {
    return (
        <div className="min-w-[220px] font-sans">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-sm">{b.name}</p>
                    <p className="text-[10px] text-slate-400">Barangay</p>
                </div>
            </div>
            {b.stats && (
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-[8px] text-slate-400 font-medium uppercase">Establishments</p>
                        <p className="text-sm font-bold text-slate-800">{b.stats.total_establishments || 0}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                        <p className="text-[8px] text-emerald-500 font-medium uppercase">Hiring</p>
                        <p className="text-sm font-bold text-emerald-700">{b.stats.hiring_establishments || 0}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-[8px] text-blue-500 font-medium uppercase">Vacancies</p>
                        <p className="text-sm font-bold text-blue-700">{b.stats.active_jobs || 0}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2">
                        <p className="text-[8px] text-amber-500 font-medium uppercase">Seekers</p>
                        <p className="text-sm font-bold text-amber-700">{b.stats.job_seekers || 0}</p>
                    </div>
                    <div className="bg-violet-50 rounded-lg p-2">
                        <p className="text-[8px] text-violet-500 font-medium uppercase">Applicants</p>
                        <p className="text-sm font-bold text-violet-700">{b.stats.applications || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-[8px] text-slate-400 font-medium uppercase">Employ. Rate</p>
                        <p className="text-sm font-bold text-slate-700">{b.stats.employment_rate || 0}%</p>
                    </div>
                    {b.stats.top_industry && b.stats.top_industry !== 'N/A' && (
                        <div className="col-span-2 bg-slate-50 rounded-lg p-2">
                            <p className="text-[8px] text-slate-400 font-medium uppercase">Top Industry</p>
                            <p className="text-sm font-bold text-slate-700">{b.stats.top_industry}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ActivityItem({ icon: Icon, color, title, subtitle, time }) {
    return (
        <div className="flex items-start gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors">
            <div className={`h-7 w-7 rounded-lg ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-800 truncate">{title}</p>
                {subtitle && <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>}
                {time && <p className="text-[9px] text-slate-400 mt-0.5">{time}</p>}
            </div>
        </div>
    );
}

export default function GisMap({ barangays, establishments, region, municipality, barangayStats, gisStats, pesoOffice }) {
    const [userLocation, setUserLocation] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [loading, setLoading] = useState(!establishments?.length);
    const [refreshing, setRefreshing] = useState(false);
    const [liveData, setLiveData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [initialFitDone, setInitialFitDone] = useState(false);

    const [search, setSearch] = useState('');
    const [filterBrgy, setFilterBrgy] = useState('');
    const [filterIndustry, setFilterIndustry] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterSalary, setFilterSalary] = useState('');
    const [filterHiringStatus, setFilterHiringStatus] = useState('');
    const [filterDatePosted, setFilterDatePosted] = useState('');

    const [showFilters, setShowFilters] = useState(true);
    const [showActivity, setShowActivity] = useState(true);
    const [showLegend, setShowLegend] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [tileMode, setTileMode] = useState('street');
    const [fitKey, setFitKey] = useState(0);
    const [geocoding, setGeocoding] = useState(false);
    const [heatmapData, setHeatmapData] = useState(null);
    const mapContainerRef = useRef(null);
    const heatmapLayerRef = useRef(null);

    useEffect(() => { document.documentElement.classList.remove('dark'); }, []);

    const barData = useMemo(() =>
        (barangays || []).filter(b => b.latitude && b.longitude).map(b => ({
            id: `brgy-${b.id}`, lat: parseFloat(b.latitude), lng: parseFloat(b.longitude),
            name: b.barangay_name,
            stats: (liveData?.barangay_stats || barangayStats || [])?.find(s => s.name === b.barangay_name),
        })), [barangays, liveData, barangayStats]);

    const establishmentMarkers = useMemo(() => {
        const data = liveData?.establishments?.length > 0 ? liveData.establishments : (establishments || []);
        let items = data.filter(e => e.latitude && e.longitude).map(e => ({
            id: `est-${e.id}`, lat: parseFloat(e.latitude), lng: parseFloat(e.longitude),
            name: e.company_name || e.name, ...e,
        }));

        if (search) {
            const q = search.toLowerCase();
            items = items.filter(e =>
                (e.name || '').toLowerCase().includes(q) ||
                (e.address || '').toLowerCase().includes(q) ||
                (e.barangay_name || '').toLowerCase().includes(q) ||
                (e.industry_category || '').toLowerCase().includes(q) ||
                (e.contact_person || '').toLowerCase().includes(q)
            );
        }
        if (filterBrgy) items = items.filter(e => e.barangay_name === filterBrgy);
        if (filterIndustry) items = items.filter(e => e.industry_category === filterIndustry);
        if (filterCategory) items = items.filter(e =>
            e.job_positions?.some(jp => jp.educational_background === filterCategory) ||
            e.educational_background === filterCategory
        );
        if (filterType) items = items.filter(e =>
            e.job_positions?.some(jp => jp.employment_type === filterType) ||
            e.employment_type === filterType
        );
        if (filterSalary) items = items.filter(e =>
            e.job_positions?.some(jp => jp.salary_range === filterSalary) ||
            e.salary_range === filterSalary
        );
        if (filterHiringStatus) {
            items = items.filter(e => {
                const label = e.hiring_status_label || (e.is_hiring ? (e.is_hiring_soon ? 'hiring_soon' : 'hiring') : e.is_closed ? 'closed' : 'registered');
                if (filterHiringStatus === 'Hiring') return label === 'hiring';
                if (filterHiringStatus === 'Hiring Soon') return label === 'hiring_soon';
                if (filterHiringStatus === 'Closed') return label === 'closed';
                if (filterHiringStatus === 'Registered') return label === 'registered';
                return true;
            });
        }
        if (filterDatePosted) {
            const now = new Date();
            items = items.filter(e => {
                if (!e.last_updated) return true;
                const d = new Date(e.last_updated);
                const diffDays = (now - d) / (1000 * 60 * 60 * 24);
                if (filterDatePosted === 'Today') return diffDays <= 1;
                if (filterDatePosted === 'This Week') return diffDays <= 7;
                if (filterDatePosted === 'This Month') return diffDays <= 30;
                if (filterDatePosted === 'This Quarter') return diffDays <= 90;
                if (filterDatePosted === 'This Year') return diffDays <= 365;
                return true;
            });
        }
        return items;
    }, [liveData, establishments, search, filterBrgy, filterIndustry, filterCategory, filterType, filterSalary, filterHiringStatus, filterDatePosted]);

    const allItems = useMemo(() => [...barData, ...establishmentMarkers], [barData, establishmentMarkers]);

    const industries = useMemo(() => {
        const s = new Set();
        (establishments || []).forEach(e => { if (e.industry_category) s.add(e.industry_category); });
        return [...s].sort();
    }, [establishments]);

    const brgyOptions = useMemo(() => {
        const s = new Set();
        (establishments || []).forEach(e => { if (e.barangay_name) s.add(e.barangay_name); });
        return [...s].sort();
    }, [establishments]);

    const salaryOptions = useMemo(() => {
        const opts = liveData?.filter_options?.salary_ranges || [];
        return Array.isArray(opts) ? opts : [];
    }, [liveData]);

    const educationOptions = useMemo(() => {
        const opts = liveData?.filter_options?.educational_backgrounds || [];
        return Array.isArray(opts) ? opts : [];
    }, [liveData]);

    const typeOptions = useMemo(() => {
        const opts = liveData?.filter_options?.employment_types || [];
        return Array.isArray(opts) ? opts : EMPLOYMENT_TYPES;
    }, [liveData]);

    const clearFilters = () => {
        setSearch('');
        setFilterBrgy('');
        setFilterIndustry('');
        setFilterCategory('');
        setFilterType('');
        setFilterSalary('');
        setFilterHiringStatus('');
        setFilterDatePosted('');
    };
    const hasFilters = search || filterBrgy || filterIndustry || filterCategory || filterType || filterSalary || filterHiringStatus || filterDatePosted;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { mapContainerRef.current?.requestFullscreen?.(); setFullscreen(true); }
        else { document.exitFullscreen?.(); setFullscreen(false); }
    };
    useEffect(() => {
        const f = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', f);
        return () => document.removeEventListener('fullscreenchange', f);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLiveData();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const fetchLiveData = useCallback(async () => {
        try {
            const r = await fetch('/api/gis/data');
            const j = await r.json();
            if (j.success) {
                setLiveData(j.data);
                setLastUpdated(j.last_updated);
                setLoading(false);
            }
        } catch (e) { }
    }, []);

    const fetchHeatmapData = useCallback(async () => {
        try {
            const r = await fetch('/api/gis/heatmap');
            const j = await r.json();
            if (j.success) {
                const points = [];
                (j.data.vacancy_heat || []).forEach(p => {
                    if (p.lat && p.lng) points.push([parseFloat(p.lat), parseFloat(p.lng), parseInt(p.weight) || 1]);
                });
                (j.data.seeker_heat || []).forEach(p => {
                    if (p.lat && p.lng) points.push([parseFloat(p.lat), parseFloat(p.lng), (parseInt(p.weight) || 1) * 0.5]);
                });
                setHeatmapData(points);
            }
        } catch (e) { }
    }, []);

    useEffect(() => {
        fetchLiveData();
        fetchHeatmapData();
        const pi = setInterval(fetchLiveData, 15000);
        const hi = setInterval(fetchHeatmapData, 60000);
        return () => { clearInterval(pi); clearInterval(hi); };
    }, [fetchLiveData, fetchHeatmapData]);

    useEffect(() => {
        if (!initialFitDone && establishmentMarkers.length > 0) {
            setInitialFitDone(true);
            setFitKey(k => k + 1);
        }
    }, [establishmentMarkers.length, initialFitDone]);

    useEffect(() => {
        if (establishmentMarkers.length > 0 && initialFitDone) setFitKey(k => k + 1);
    }, [search, filterBrgy, filterIndustry, filterCategory, filterType, filterSalary, filterHiringStatus, filterDatePosted]);

    const resetView = () => setSelectedId('reset');

    const getUserLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => { },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const toggleTileMode = () => {
        setTileMode(prev => prev === 'street' ? 'satellite' : 'street');
    };

    const toggleHeatmap = async () => {
        if (!showHeatmap && !heatmapData) {
            await fetchHeatmapData();
        }
        setShowHeatmap(!showHeatmap);
    };

    const stats = liveData?.stats || gisStats || {};
    const activities = liveData?.recent_activities || {};

    return (
        <AdminLayouts>
            <Head title="Employment GIS Dashboard" />
            <div className="bg-slate-50 min-h-screen">
                <style>{`
                    .leaflet-popup-content { margin: 16px 18px !important; font-size: 13px !important; }
                    .leaflet-popup-content-wrapper { border-radius: 14px !important; overflow: hidden !important; box-shadow: 0 12px 48px rgba(0,0,0,0.15) !important; }
                    .leaflet-container { background: #f8fafc !important; outline: none !important; font-family: inherit !important; }
                    .leaflet-popup-tip { box-shadow: none !important; }
                    @keyframes pulse-marker { 0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4); } 70% { box-shadow: 0 0 0 12px rgba(139,92,246,0); } 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); } }
                    .leaflet-control-zoom a { background: white !important; color: #475569 !important; border-color: #e2e8f0 !important; }
                    .leaflet-control-zoom a:hover { background: #f8fafc !important; }
                `}</style>

                <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Employment GIS Dashboard</h1>
                            <p className="text-xs text-slate-500">{municipality}, {region} · Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '...'} · <span className="text-emerald-600 font-medium">{establishmentMarkers.filter(e => e.is_hiring).length} hiring</span></p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setShowActivity(!showActivity)}
                                className={`flex items-center justify-center h-8 px-3 rounded-lg border shadow-sm transition-colors text-xs font-medium ${showActivity ? 'bg-violet-500 text-white border-violet-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                title="Activity Panel"><Activity className="h-4 w-4 mr-1" />Activity</button>
                            <button onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center justify-center h-8 w-8 rounded-lg border shadow-sm transition-colors ${showFilters ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                title="Toggle Filters"><Filter className="h-4 w-4" /></button>
                            <button onClick={handleRefresh} disabled={refreshing}
                                className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
                                title="Refresh"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
                        <StatCard icon={Building2} label="Total Establishments" value={stats.total_establishments} color="blue" bgColor="bg-blue-50" textColor="text-blue-600" />
                        <StatCard icon={TrendingUp} label="Currently Hiring" value={stats.hiring_establishments} color="emerald" bgColor="bg-emerald-50" textColor="text-emerald-600" />
                        <StatCard icon={X} label="Closed Hiring" value={stats.closed_establishments} color="red" bgColor="bg-red-50" textColor="text-red-500" />
                        <StatCard icon={Briefcase} label="Active Vacancies" value={stats.active_vacancies} color="blue" bgColor="bg-blue-50" textColor="text-blue-600" />
                        <StatCard icon={Users} label="Registered Job Seekers" value={stats.registered_job_seekers} color="amber" bgColor="bg-amber-50" textColor="text-amber-600" />
                        <StatCard icon={FileText} label="Total Applications" value={stats.total_applications} color="violet" bgColor="bg-violet-50" textColor="text-violet-600" />
                        <StatCard icon={Calendar} label="Interviews Today" value={stats.interview_today} color="orange" bgColor="bg-orange-50" textColor="text-orange-600" />
                        <StatCard icon={UserCheck} label="Hired Applicants" value={stats.hired_applicants} color="emerald" bgColor="bg-emerald-50" textColor="text-emerald-600" />
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 pb-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200 bg-white" ref={mapContainerRef} style={{ height: 'calc(100vh - 340px)', minHeight: '450px' }}>
                        {loading && !liveData && (
                            <div className="absolute inset-0 z-[1001] bg-white/80 flex items-center justify-center rounded-2xl">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500 font-medium">Loading map data...</p>
                                </div>
                            </div>
                        )}

                        <MapContainer center={OPOL_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                            <TileLayer url={TILE_SETS[tileMode].url} attribution={TILE_SETS[tileMode].attr} />
                            <ScaleControl position="bottomleft" imperial={false} />
                            <MapController items={allItems} selectedId={selectedId} fitKey={fitKey} initialFitDone={initialFitDone} />

                            {showHeatmap && heatmapData && heatmapData.length > 0 && (
                                <HeatmapOverlay points={heatmapData} show={showHeatmap} />
                            )}

                            <MarkerClusterGroup chunkedLoading maxClusterRadius={55} spiderfyOnMaxZoom={true} showCoverageOnHover={false} disableClusteringAtZoom={15}>
                                {barData.map(b => (
                                    <Marker key={b.id} position={[b.lat, b.lng]} icon={markerIcons.barangay}>
                                        <Popup><BarangayPopup b={b} /></Popup>
                                    </Marker>
                                ))}
                            </MarkerClusterGroup>

                            <MarkerClusterGroup chunkedLoading maxClusterRadius={60} spiderfyOnMaxZoom={true} showCoverageOnHover={false} disableClusteringAtZoom={16}>
                                {establishmentMarkers.map(e => (
                                    <Marker key={e.id} position={[e.lat, e.lng]} icon={getMarkerIcon(e)}>
                                        <Popup>
                                            <div className="max-h-[480px] overflow-y-auto">
                                                <HiringPopup e={e} municipality={municipality} pesoOffice={pesoOffice} />
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MarkerClusterGroup>

                            {userLocation && (
                                <Marker position={[userLocation.lat, userLocation.lng]} icon={markerIcons.userLocation}>
                                    <Popup>
                                        <div className="text-sm"><p className="font-semibold text-violet-700">Your Location</p></div>
                                    </Popup>
                                </Marker>
                            )}

                            {pesoOffice && pesoOffice.latitude && pesoOffice.longitude && (
                                <Marker position={[pesoOffice.latitude, pesoOffice.longitude]} icon={markerIcons.pesoOffice}>
                                    <Popup>
                                        <div className="min-w-[200px]">
                                            <p className="font-bold text-sm text-violet-800">{pesoOffice.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{pesoOffice.address}</p>
                                            {pesoOffice.contact_number && <p className="text-[10px] text-slate-500">{pesoOffice.contact_number}</p>}
                                            {pesoOffice.email && <p className="text-[10px] text-slate-500">{pesoOffice.email}</p>}
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>

                        {showFilters && (
                            <div className="absolute top-3 left-3 z-[1000] w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden max-h-[calc(100%-24px)] flex flex-col">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3.5 py-2.5 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 text-white" />
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">Filters</span>
                                    </div>
                                    <button onClick={() => setShowFilters(false)} className="text-white/80 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                                </div>

                                <div className="p-3 space-y-2 overflow-y-auto flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search establishment..."
                                            className="w-full pl-8 pr-3 py-2 text-[11px] border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                                        {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-3 w-3" /></button>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-1.5">
                                        <select value={filterBrgy} onChange={e => setFilterBrgy(e.target.value)}
                                            className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                                            <option value="">Barangay</option>
                                            {brgyOptions.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                        <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
                                            className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                                            <option value="">Industry</option>
                                            {industries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                                            className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                                            <option value="">Education</option>
                                            {educationOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <select value={filterType} onChange={e => setFilterType(e.target.value)}
                                            className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                                            <option value="">Employment Type</option>
                                            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <select value={filterSalary} onChange={e => setFilterSalary(e.target.value)}
                                            className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                                            <option value="">Salary Range</option>
                                            {salaryOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <select value={filterHiringStatus} onChange={e => setFilterHiringStatus(e.target.value)}
                                            className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                                            <option value="">Hiring Status</option>
                                            {HIRING_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <select value={filterDatePosted} onChange={e => setFilterDatePosted(e.target.value)}
                                        className="w-full text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                                        <option value="">Date Posted</option>
                                        {DATE_POSTED_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>

                                    {hasFilters && (
                                        <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                            <X className="h-3 w-3" /> Clear All Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {showLegend && (
                            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-3 min-w-[160px]">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Legend</p>
                                    <button onClick={() => setShowLegend(false)} className="text-slate-300 hover:text-slate-500"><X className="h-3 w-3" /></button>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ background: COLORS.hiring, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        <span className="text-[10px] text-slate-600">Hiring</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ background: COLORS.hiringSoon, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        <span className="text-[10px] text-slate-600">Hiring Soon</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ background: COLORS.closed, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        <span className="text-[10px] text-slate-600">Closed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ background: COLORS.registered, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        <span className="text-[10px] text-slate-600">Registered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ background: COLORS.userLocation, border: '2px solid white', boxShadow: '0 0 0 3px rgba(139,92,246,0.2)' }} />
                                        <span className="text-[10px] text-slate-600">PESO Office / You</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ background: COLORS.barangay, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        <span className="text-[10px] text-slate-600">Barangay</span>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-sm shrink-0" style={{ background: 'linear-gradient(135deg, #ef4444, #eab308, #10b981)' }} />
                                        <span className="text-[10px] text-slate-600">Heatmap (hiring)</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!showLegend && (
                            <button onClick={() => setShowLegend(true)}
                                className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-md border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-white">
                                Show Legend
                            </button>
                        )}

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-slate-200">
                            <span className="text-[10px] font-medium text-emerald-600">{establishmentMarkers.filter(e => e.is_hiring).length}</span>
                            <span className="text-[9px] text-slate-400">hiring</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-[10px] font-medium text-amber-600">{establishmentMarkers.filter(e => e.hiring_status_label === 'hiring_soon' || (e.is_hiring && e.is_hiring_soon)).length}</span>
                            <span className="text-[9px] text-slate-400">soon</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-[10px] font-medium text-red-600">{establishmentMarkers.filter(e => e.is_closed).length}</span>
                            <span className="text-[9px] text-slate-400">closed</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-[10px] font-medium text-blue-600">{establishmentMarkers.filter(e => !e.is_hiring && !e.is_closed).length}</span>
                            <span className="text-[9px] text-slate-400">reg.</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-[10px] font-medium text-slate-600">{establishmentMarkers.length}</span>
                            <span className="text-[9px] text-slate-400">total</span>
                        </div>

                        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
                            <button onClick={resetView}
                                className="flex items-center justify-center h-9 w-9 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition-colors bg-white text-slate-600"
                                title="Reset View"><Target className="h-4 w-4" /></button>
                            <button onClick={getUserLocation}
                                className="flex items-center justify-center h-9 w-9 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition-colors bg-white text-slate-600"
                                title="My Location"><Crosshair className="h-4 w-4" /></button>
                            <button onClick={async () => { setGeocoding(true); try { await fetch('/api/gis/data?geocode=1'); await fetchLiveData(); } catch (e) { } setGeocoding(false); }}
                                className="flex items-center justify-center h-9 w-9 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition-colors bg-white text-slate-600"
                                title="Geocode Missing"><Globe className={`h-4 w-4 ${geocoding ? 'animate-spin' : ''}`} /></button>
                            <button onClick={toggleTileMode}
                                className={`flex items-center justify-center h-9 w-9 rounded-xl shadow-md border hover:bg-slate-50 transition-colors ${tileMode === 'satellite' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-600 border-slate-200'}`}
                                title={tileMode === 'street' ? 'Satellite View' : 'Street Map'}>{tileMode === 'street' ? <Satellite className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}</button>
                            <button onClick={toggleHeatmap}
                                className={`flex items-center justify-center h-9 w-9 rounded-xl shadow-md border hover:bg-slate-50 transition-colors ${showHeatmap ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200'}`}
                                title="Toggle Heatmap"><TrendingUp className="h-4 w-4" /></button>
                            <button onClick={toggleFullscreen}
                                className="flex items-center justify-center h-9 w-9 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition-colors bg-white text-slate-600"
                                title="Fullscreen">{fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
                            <div className="text-center mt-1"><span className="text-[8px] leading-none text-slate-400 bg-white/80 px-2 py-1 rounded-md shadow-sm border border-slate-200">15s</span></div>
                        </div>

                        {showActivity && (
                            <div className="absolute top-3 right-16 z-[1000] w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden max-h-[calc(100%-24px)] flex flex-col">
                                <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-3.5 py-2.5 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-3.5 w-3.5 text-white" />
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">Live Activity</span>
                                    </div>
                                    <button onClick={() => setShowActivity(false)} className="text-white/80 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                                </div>
                                <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                                    {activities.new_jobs?.length > 0 && (
                                        <div className="py-1">
                                            <p className="px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">New Jobs</p>
                                            {activities.new_jobs.slice(0, 3).map((item, i) => (
                                                <ActivityItem key={`job-${i}`} icon={Briefcase} color="bg-blue-500" title={item.title} subtitle={item.company} time={item.created_at} />
                                            ))}
                                        </div>
                                    )}
                                    {activities.new_establishments?.length > 0 && (
                                        <div className="py-1">
                                            <p className="px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">New Establishments</p>
                                            {activities.new_establishments.slice(0, 3).map((item, i) => (
                                                <ActivityItem key={`est-${i}`} icon={Building2} color="bg-emerald-500" title={item.title} time={item.created_at} />
                                            ))}
                                        </div>
                                    )}
                                    {activities.interviews?.length > 0 && (
                                        <div className="py-1">
                                            <p className="px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled Interviews</p>
                                            {activities.interviews.slice(0, 3).map((item, i) => (
                                                <ActivityItem key={`int-${i}`} icon={Calendar} color="bg-amber-500" title={item.title} subtitle={`${item.job_title || ''} @ ${item.company || ''}`} time={item.scheduled_date} />
                                            ))}
                                        </div>
                                    )}
                                    {activities.recent_hires?.length > 0 && (
                                        <div className="py-1">
                                            <p className="px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Recent Hires</p>
                                            {activities.recent_hires.slice(0, 3).map((item, i) => (
                                                <ActivityItem key={`hire-${i}`} icon={UserCheck} color="bg-emerald-600" title={item.title} subtitle={`${item.job_title || ''} @ ${item.company || ''}`} time={item.created_at} />
                                            ))}
                                        </div>
                                    )}
                                    {(!activities.new_jobs?.length && !activities.new_establishments?.length && !activities.interviews?.length && !activities.recent_hires?.length) && (
                                        <div className="px-4 py-8 text-center text-sm text-slate-400">
                                            <Activity className="mx-auto h-6 w-6 text-slate-300 mb-1" />
                                            <p className="text-[11px]">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayouts>
    );
}

function HeatmapOverlay({ points, show }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (!show || !points || points.length === 0) {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
            return;
        }
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }
        if (typeof L.heatLayer === 'function') {
            layerRef.current = L.heatLayer(points, {
                radius: 30,
                blur: 20,
                maxZoom: 16,
                max: 5,
                gradient: { 0.2: '#10b981', 0.4: '#eab308', 0.6: '#f97316', 0.8: '#ef4444', 1.0: '#7c3aed' },
            }).addTo(map);
        }
        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [map, points, show]);

    return null;
}