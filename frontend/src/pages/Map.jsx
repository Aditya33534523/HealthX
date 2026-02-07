import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import axios from 'axios';
import { Search, PlusSquare, Bot, AlertCircle, User, MapPin, Clock, RefreshCw } from 'lucide-react';

// Icon generators using divIcon for professional glassmorphic look
const createUserIcon = () => divIcon({
    html: `
        <div class="relative flex items-center justify-center w-12 h-12 glass-panel border-blue-500/50 shadow-blue-500/20 overflow-hidden group">
            <div class="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-all"></div>
            <img src="/user.png" class="w-8 h-8 object-contain relative z-10" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3177/3177440.png'" />
            <div class="absolute -bottom-1 w-2 h-2 bg-blue-500 rotate-45"></div>
        </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

const createMedicalIcon = () => divIcon({
    html: `
        <div class="relative flex items-center justify-center w-10 h-10 glass-panel border-emerald-500/50 shadow-emerald-500/20 overflow-hidden group">
            <div class="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all"></div>
            <img src="/medical.jpg" class="w-7 h-7 object-contain relative z-10" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3063/3063171.png'" />
            <div class="absolute -bottom-1 w-2 h-2 bg-emerald-500 rotate-45"></div>
        </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const createHospitalIcon = (isHighlighted = false) => divIcon({
    html: `
        <div class="relative flex items-center justify-center w-12 h-12 glass-panel ${isHighlighted ? 'border-amber-500 shadow-amber-500/40 ring-4 ring-amber-500/20' : 'border-red-500/50 shadow-red-500/20'} overflow-hidden group">
            <div class="absolute inset-0 ${isHighlighted ? 'bg-amber-500/20' : 'bg-red-500/10'} group-hover:opacity-100 transition-all"></div>
            <img src="/hospital.webp" class="w-8 h-8 object-contain relative z-10" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2966/2966327.png'" />
            <div class="absolute -bottom-1 w-2 h-2 ${isHighlighted ? 'bg-amber-500' : 'bg-red-500'} rotate-45"></div>
        </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

// Featured hospitals from Excel data
const featuredHospitals = [
    { id: 'f1', name: "Elite Orthopaedic & Womens Hospital", lat: 23.0175, lon: 72.4822, type: "Hospital", speciality: "Orthopaedic & Womens", certs: "NABH Certified", contact: "9824623823", cashless: "No", benefit: "Advanced Orthopaedic & Gynaecology Care", ayushmanCard: true, maaCard: true },
    { id: 'f2', name: "Sannidhya Gynaec Hospital", lat: 22.9962, lon: 72.5996, type: "Hospital", speciality: "Gynaecology", certs: "Multispeciality", contact: "7575890555", cashless: "Yes", benefit: "Comprehensive Women's Healthcare", ayushmanCard: true, maaCard: true },
    { id: 'f3', name: "Khusboo Orthopaedic Hospital", lat: 23.0200, lon: 72.5081, type: "Hospital", speciality: "Orthopaedic", certs: "Specialist Care", contact: "7575890555", cashless: "Yes", benefit: "Expert Orthopaedic Surgery", ayushmanCard: true, maaCard: false },
    { id: 'f4', name: "Star Hospital", lat: 23.0374, lon: 72.6300, type: "Hospital", speciality: "Multispeciality", certs: "Government Approved", contact: "9898394943", cashless: "Yes (12 companies)", benefit: "24/7 Emergency & Critical Care", ayushmanCard: true, maaCard: true }
];

// Custom styles for Popups to match glassmorphism
const popupContentStyle = `
    .leaflet-popup-content-wrapper {
        background: rgba(15, 23, 42, 0.9) !important;
        backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 1.5rem !important;
        color: white !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.6) !important;
    }
    .leaflet-popup-tip {
        background: rgba(15, 23, 42, 0.9) !important;
    }
`;

const MapEvents = ({ setClickedPosition }) => {
    useMapEvents({
        click: (e) => {
            setClickedPosition(e.latlng);
        },
    });
    return null;
};

const MapPage = () => {
    const [searchParams] = useSearchParams();
    const specialtyFilter = searchParams.get('specialty');

    const [position, setPosition] = useState(null);
    const [clickedPosition, setClickedPosition] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState(null);
    const [fetchingData, setFetchingData] = useState(false);
    const [activeFilter, setActiveFilter] = useState(specialtyFilter || 'all');

    const specialtyOptions = [
        { value: 'all', label: 'All Resources' },
        { value: 'orthopaedic', label: 'Orthopaedic' },
        { value: 'gynaecology', label: 'Gynaecology' },
        { value: 'multispeciality', label: 'Multispeciality' },
        { value: 'medicine', label: 'Medicine' }
    ];

    useEffect(() => {
        if (specialtyFilter) setActiveFilter(specialtyFilter.toLowerCase());
    }, [specialtyFilter]);

    useEffect(() => {
        let watchId;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    setPosition(prev => {
                        if (!prev) fetchNearbyMedicalResources(lat, lon);
                        return [lat, lon];
                    });
                    setLoading(false);
                },
                (err) => {
                    const defaultLat = 22.55;
                    const defaultLon = 72.95;
                    setPosition([defaultLat, defaultLon]);
                    fetchNearbyMedicalResources(defaultLat, defaultLon);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        } else {
            setLoading(false);
        }
        return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
    }, []);

    const fetchNearbyMedicalResources = async (lat, lon) => {
        setFetchingData(true);
        try {
            const query = `[out:json];(node["amenity"="hospital"](around:5000, ${lat}, ${lon});node["amenity"="pharmacy"](around:5000, ${lat}, ${lon});way["amenity"="hospital"](around:5000, ${lat}, ${lon});way["amenity"="pharmacy"](around:5000, ${lat}, ${lon}););out center;`;
            const response = await axios.get('https://overpass-api.de/api/interpreter', { params: { data: query } });
            const elements = response.data.elements;
            const realLocations = elements.map(el => {
                const isHospital = el.tags.amenity === 'hospital';
                return {
                    name: el.tags.name || (isHospital ? "Unnamed Hospital" : "Unnamed Pharmacy"),
                    lat: el.lat || el.center.lat,
                    lon: el.lon || el.center.lon,
                    type: isHospital ? "Hospital" : "Pharmacy",
                    benefit: isHospital ? "Medical Services" : "Medicines available",
                    id: el.id,
                    ayushmanCard: false,
                    maaCard: false
                };
            }).filter(loc => loc.name && loc.lat && loc.lon);
            setLocations([...featuredHospitals, ...realLocations]);
        } catch (error) {
            setLocations(featuredHospitals);
        } finally {
            setFetchingData(false);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
    };

    const handleShopClick = (loc) => {
        if (!position) return;
        const dist = calculateDistance(position[0], position[1], loc.lat, loc.lon);
        const time = Math.round(dist * 5) + 2;
        setSelectedShop({ ...loc, distance: dist, time });
    };

    const matchesFilter = (loc) => {
        if (activeFilter === 'all') return true;
        const specialty = (loc.speciality || '').toLowerCase();
        const filterLower = activeFilter.toLowerCase();
        return specialty.includes(filterLower) ||
            (filterLower === 'orthopaedic' && specialty.includes('orthop')) ||
            (filterLower === 'gynaecology' && (specialty.includes('gynae') || specialty.includes('women'))) ||
            (filterLower === 'medicine' && specialty.includes('medicine'));
    };

    const filteredLocations = locations.filter(matchesFilter);

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center font-['Outfit']">
            <div className="w-16 h-16 glass-panel flex items-center justify-center mb-6 animate-spin">
                <Bot size={32} className="text-blue-500" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">Syncing Satellites...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 font-['Outfit']">
            <style>{popupContentStyle}</style>

            <div className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-center justify-between border-white/5">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Health Grid</h2>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[4px]">Verified Infrastructure</p>
                </div>

                <div className="flex flex-1 max-w-xl gap-4 w-full">
                    <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="flex-1 glass-input bg-white/5 appearance-none cursor-pointer font-bold uppercase text-xs tracking-widest"
                    >
                        {specialtyOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 border-none">{opt.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => fetchNearbyMedicalResources(position[0], position[1])}
                        className="px-6 glass-btn whitespace-nowrap !py-0 !h-12"
                    >
                        <RefreshCw size={18} className={fetchingData ? 'animate-spin' : ''} />
                        <span className="uppercase text-[10px] font-black tracking-widest ml-2 hidden sm:inline">Refresh Search</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className="w-80 glass-panel flex flex-col p-6 border-white/5 hidden xl:flex">
                    <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-6 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-400" /> Nearby Nodes
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {filteredLocations.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <Search size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No signals detected</p>
                            </div>
                        ) : (
                            filteredLocations.map((loc, idx) => (
                                <div
                                    key={`${loc.id}-${idx}`}
                                    className={`glass-card p-4 cursor-pointer group transition-all duration-500 ${selectedShop?.id === loc.id ? 'border-blue-500/50 bg-blue-500/10' : 'hover:bg-white/5'}`}
                                    onClick={() => handleShopClick(loc)}
                                >
                                    <h4 className="text-white font-bold text-[13px] mb-1 group-hover:text-blue-400 transition-colors truncate">{loc.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{loc.type}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 glass-panel overflow-hidden border-white/5 relative">
                    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%", background: '#020617' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEvents setClickedPosition={setClickedPosition} />

                        <Marker position={position} icon={createUserIcon()}>
                            <Popup>
                                <div className="p-2">
                                    <p className="font-black uppercase tracking-widest text-[10px] text-blue-400 mb-1">Your Sector</p>
                                    <p className="font-bold">Operational Base</p>
                                </div>
                            </Popup>
                        </Marker>

                        {clickedPosition && (
                            <Popup position={clickedPosition} onClose={() => setClickedPosition(null)}>
                                <div className="p-2 min-w-[150px]">
                                    <p className="font-bold text-white mb-2 flex items-center gap-2">
                                        <MapPin size={14} className="text-blue-400" /> Target Point
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetchNearbyMedicalResources(clickedPosition.lat, clickedPosition.lng);
                                            setClickedPosition(null);
                                        }}
                                        className="w-full glass-btn !py-2 !text-[10px] uppercase tracking-widest !bg-blue-600/50"
                                    >
                                        Scan This Sector
                                    </button>
                                </div>
                            </Popup>
                        )}

                        {filteredLocations.map((loc, idx) => {
                            const isHighlighted = activeFilter !== 'all' && matchesFilter(loc) && String(loc.id).startsWith('f');
                            return (
                                <Marker
                                    key={`${loc.id}-${idx}`}
                                    position={[loc.lat, loc.lon]}
                                    icon={loc.type === 'Hospital' ? createHospitalIcon(isHighlighted) : createMedicalIcon()}
                                    eventHandlers={{ click: () => handleShopClick(loc) }}
                                >
                                    <Popup>
                                        <div className="w-72 p-2 font-['Outfit']">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-black text-lg text-white leading-tight">{loc.name}</h3>
                                                {String(loc.id).startsWith('f') && <span className="p-1 px-2 bg-amber-500/20 text-amber-500 text-[10px] font-black rounded-lg uppercase">⭐ Featured</span>}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${loc.type === 'Hospital' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                                    {loc.type}
                                                </span>
                                                {loc.certs && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-black uppercase tracking-widest">{loc.certs}</span>}
                                            </div>

                                            {(loc.ayushmanCard || loc.maaCard) && (
                                                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                                    {loc.ayushmanCard && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ayushman Card</span>}
                                                    {loc.maaCard && <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Maa Amrutam</span>}
                                                </div>
                                            )}

                                            <div className="space-y-2 mb-4">
                                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Clinical Insight</p>
                                                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{loc.benefit}</p>
                                                </div>
                                            </div>

                                            {selectedShop?.id === loc.id && (
                                                <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 mb-4">
                                                    <div className="flex items-center gap-2 text-blue-400">
                                                        <MapPin size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedShop.distance} KM</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-400">
                                                        <Clock size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">~{selectedShop.time} MIN</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button className="w-full glass-btn !py-3 !text-[10px] uppercase tracking-widest">Generate Route</button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {selectedShop && position && (
                            <Polyline positions={[position, [selectedShop.lat, selectedShop.lon]]} pathOptions={{ color: '#3b82f6', dashArray: '8, 8', weight: 4, opacity: 0.6 }} />
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default MapPage;

