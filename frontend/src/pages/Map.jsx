import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import axios from 'axios';

// Icon generators using divIcon for better styling and error handling
const createUserIcon = () => divIcon({
    html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border-2 border-blue-500 overflow-hidden transform transition-all">
            <img src="/user.png" class="w-full h-full object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3177/3177440.png'" />
            <div class="absolute -bottom-1 w-2 h-2 bg-blue-500 rotate-45"></div>
        </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const createMedicalIcon = () => divIcon({
    html: `
        <div class="relative flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-lg border-2 border-emerald-500 overflow-hidden">
            <img src="/medical.jpg" class="w-full h-full object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3063/3063171.png'" />
            <div class="absolute -bottom-1 w-2 h-2 bg-emerald-500 rotate-45"></div>
        </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const createHospitalIcon = (isHighlighted = false) => divIcon({
    html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border-2 ${isHighlighted ? 'border-amber-500 ring-4 ring-amber-300/50' : 'border-red-500'} overflow-hidden">
            <img src="/hospital.webp" class="w-full h-full object-contain" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2966/2966327.png'" />
            <div class="absolute -bottom-1 w-2 h-2 ${isHighlighted ? 'bg-amber-500' : 'bg-red-500'} rotate-45"></div>
        </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Featured hospitals from Excel data with Ayushman and Maa card info
const featuredHospitals = [
    {
        id: 'f1',
        name: "Elite Orthopaedic & Womens Hospital",
        lat: 23.0175,
        lon: 72.4822,
        type: "Hospital",
        speciality: "Orthopaedic & Womens",
        certs: "NABH Certified",
        contact: "9824623823",
        cashless: "No",
        benefit: "Advanced Orthopaedic & Gynaecology Care",
        ayushmanCard: true,
        maaCard: true
    },
    {
        id: 'f2',
        name: "Sannidhya Gynaec Hospital",
        lat: 22.9962,
        lon: 72.5996,
        type: "Hospital",
        speciality: "Gynaecology",
        certs: "Multispeciality",
        contact: "7575890555",
        cashless: "Yes",
        benefit: "Comprehensive Women's Healthcare",
        ayushmanCard: true,
        maaCard: true
    },
    {
        id: 'f3',
        name: "Khusboo Orthopaedic Hospital",
        lat: 23.0200,
        lon: 72.5081,
        type: "Hospital",
        speciality: "Orthopaedic",
        certs: "Specialist Care",
        contact: "7575890555",
        cashless: "Yes",
        benefit: "Expert Orthopaedic Surgery",
        ayushmanCard: true,
        maaCard: false
    },
    {
        id: 'f4',
        name: "Star Hospital",
        lat: 23.0374,
        lon: 72.6300,
        type: "Hospital",
        speciality: "Multispeciality",
        certs: "Government Approved",
        contact: "9898394943",
        cashless: "Yes (12 companies)",
        benefit: "24/7 Emergency & Critical Care",
        ayushmanCard: true,
        maaCard: true
    },
    {
        id: 'f5',
        name: "Anand Orthopaedic Hospital",
        lat: 23.0550,
        lon: 72.6310,
        type: "Hospital",
        speciality: "Orthopaedic",
        certs: "High Quality Care",
        contact: "7922201717",
        cashless: "Yes",
        benefit: "Bone and Joint Specialists",
        ayushmanCard: true,
        maaCard: false
    },
    {
        id: 'f6',
        name: "Avira Hospital",
        lat: 23.0225,
        lon: 72.5714,
        type: "Hospital",
        speciality: "Medicine & Skin Care",
        certs: "Dermatology Focus",
        contact: "2692267321",
        cashless: "Yes",
        benefit: "General Medicine & Skin Experts",
        ayushmanCard: false,
        maaCard: false
    },
    {
        id: 'f7',
        name: "Thesia General Hospital",
        lat: 23.0475,
        lon: 72.5133,
        type: "Hospital",
        speciality: "Physician & Gynaecology",
        certs: "Obstetrics Care",
        contact: "7359354201",
        cashless: "Yes",
        benefit: "General Medicine & Maternity",
        ayushmanCard: true,
        maaCard: true
    },
    // Anand City Hospitals
    {
        id: 'a1',
        name: "Shree Krishna Hospital",
        lat: 22.5645,
        lon: 72.9289,
        type: "Hospital",
        speciality: "Multispeciality",
        certs: "NABH Certified",
        contact: "02692-268000",
        cashless: "Yes",
        benefit: "Attached to Pramukh Swami Medical College",
        ayushmanCard: true,
        maaCard: true,
        city: "Anand"
    },
    {
        id: 'a2',
        name: "Anand Surgical Hospital",
        lat: 22.5580,
        lon: 72.9550,
        type: "Hospital",
        speciality: "Surgery & Critical Care",
        certs: "Advanced Surgical Care",
        contact: "02692-243535",
        cashless: "Yes",
        benefit: "Emergency & Trauma Center",
        ayushmanCard: true,
        maaCard: true,
        city: "Anand"
    },
    {
        id: 'a3',
        name: "Santram Hospital",
        lat: 22.5500,
        lon: 72.9400,
        type: "Hospital",
        speciality: "Multispeciality",
        certs: "Charitable Trust",
        contact: "02692-250480",
        cashless: "Yes",
        benefit: "Affordable Healthcare for All",
        ayushmanCard: true,
        maaCard: true,
        city: "Anand"
    },
    {
        id: 'a4',
        name: "Dr. Jivraj Mehta Hospital",
        lat: 22.5620,
        lon: 72.9320,
        type: "Hospital",
        speciality: "Orthopaedic & General Surgery",
        certs: "Specialist Care",
        contact: "02692-251234",
        cashless: "Yes",
        benefit: "Expert Orthopaedic Treatment",
        ayushmanCard: true,
        maaCard: false,
        city: "Anand"
    },
    {
        id: 'a5',
        name: "Nidhi Women's Hospital",
        lat: 22.5660,
        lon: 72.9450,
        type: "Hospital",
        speciality: "Gynaecology & Obstetrics",
        certs: "Women's Care Specialist",
        contact: "02692-268500",
        cashless: "Yes",
        benefit: "Complete Maternity & Women's Health",
        ayushmanCard: true,
        maaCard: true,
        city: "Anand"
    },
    {
        id: 'a6',
        name: "Radha Medical Store",
        lat: 22.5590,
        lon: 72.9380,
        type: "Pharmacy",
        speciality: "24/7 Pharmacy",
        contact: "02692-245000",
        cashless: "No",
        benefit: "All medicines available round the clock",
        ayushmanCard: false,
        maaCard: false,
        city: "Anand"
    },
    {
        id: 'a7',
        name: "Apollo Pharmacy Anand",
        lat: 22.5530,
        lon: 72.9520,
        type: "Pharmacy",
        speciality: "Retail Pharmacy",
        contact: "02692-242000",
        cashless: "No",
        benefit: "Trusted brand with genuine medicines",
        ayushmanCard: false,
        maaCard: false,
        city: "Anand"
    },
    {
        id: 'a8',
        name: "Pushpanjali Eye Hospital",
        lat: 22.5700,
        lon: 72.9350,
        type: "Hospital",
        speciality: "Ophthalmology",
        certs: "Eye Care Specialist",
        contact: "02692-267890",
        cashless: "Yes",
        benefit: "Advanced Eye Surgery & Treatment",
        ayushmanCard: true,
        maaCard: false,
        city: "Anand"
    }
];

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
        { value: 'all', label: 'All' },
        { value: 'orthopaedic', label: 'Orthopaedic' },
        { value: 'gynaecology', label: 'Gynaecology' },
        { value: 'multispeciality', label: 'Multispeciality' },
        { value: 'medicine', label: 'General Medicine' },
        { value: 'skin', label: 'Dermatology' }
    ];

    useEffect(() => {
        if (specialtyFilter) {
            setActiveFilter(specialtyFilter.toLowerCase());
        }
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
                    console.error("GPS Error:", err);
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
            console.error("Error fetching data:", error);
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
            (filterLower === 'medicine' && specialty.includes('medicine')) ||
            (filterLower === 'skin' && (specialty.includes('skin') || specialty.includes('derma')));
    };

    const filteredLocations = locations.filter(matchesFilter);

    if (loading) return <div className="h-full flex items-center justify-center text-white">Getting your location...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] p-2 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-3 px-2">
                <h2 className="text-2xl font-extrabold text-white drop-shadow-lg flex items-center">
                    <span className="bg-white/20 p-1.5 rounded-lg mr-2">🏥</span>
                    Medical Resources
                    {fetchingData && <span className="text-[10px] font-normal ml-3 px-2 py-0.5 bg-white/10 rounded-full animate-pulse">Updating...</span>}
                </h2>

                {/* Specialty Filter */}
                <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    {specialtyOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/20 relative z-0">
                {position && (
                    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapEvents setClickedPosition={setClickedPosition} />
                        <Marker position={position} icon={createUserIcon()}>
                            <Popup><b>You are here</b></Popup>
                        </Marker>
                        {clickedPosition && (
                            <Popup position={clickedPosition} onClose={() => setClickedPosition(null)}>
                                <div className="p-2 min-w-[150px]">
                                    <p className="font-bold text-indigo-900 mb-1 flex items-center gap-1">
                                        <span>📍</span> Selected Location
                                    </p>
                                    <div className="text-[10px] text-gray-500 font-mono mb-3 bg-gray-50 p-1.5 rounded border border-gray-100">
                                        LAT: {clickedPosition.lat.toFixed(6)}<br />
                                        LON: {clickedPosition.lng.toFixed(6)}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetchNearbyMedicalResources(clickedPosition.lat, clickedPosition.lng);
                                            setClickedPosition(null);
                                        }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 px-3 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 uppercase tracking-wider"
                                    >
                                        🔍 Search Nearby
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
                                        <div className="w-72 p-1 font-sans">
                                            <h3 className="font-bold text-lg text-indigo-900 leading-tight mb-1">{loc.name}</h3>
                                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${String(loc.id).startsWith('f') ? 'bg-amber-100 text-amber-700 border border-amber-200' : loc.type === 'Hospital' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {String(loc.id).startsWith('f') ? '⭐ Featured ' : ''}{loc.type}
                                                </span>
                                                {loc.certs && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold uppercase">{loc.certs}</span>}
                                            </div>

                                            {/* Government Health Cards Section */}
                                            {(loc.ayushmanCard || loc.maaCard) && (
                                                <div className="flex flex-wrap gap-1.5 mb-2 p-1.5 bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border border-green-100">
                                                    {loc.ayushmanCard && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold border border-green-200">
                                                            <span className="text-sm">🏥</span> Ayushman Bharat
                                                        </span>
                                                    )}
                                                    {loc.maaCard && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold border border-purple-200">
                                                            <span className="text-sm">💜</span> Maa Amrutam
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-1 text-xs text-gray-700">
                                                {loc.speciality && <p><strong>Speciality:</strong> {loc.speciality}</p>}
                                                <p><strong>Benefit:</strong> {loc.benefit}</p>
                                                {loc.cashless && <p><strong>Cashless:</strong> {loc.cashless}</p>}
                                                {loc.contact && <div className="mt-2 p-1.5 bg-gray-50 rounded border border-gray-100 font-mono text-center text-sm">{loc.contact}</div>}
                                            </div>
                                            {selectedShop && (selectedShop.id === loc.id || selectedShop.name === loc.name) && (
                                                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
                                                    <span>📍 {selectedShop.distance} km</span>
                                                    <span>🚗 ~{selectedShop.time} mins</span>
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                        {selectedShop && position && (
                            <Polyline positions={[position, [selectedShop.lat, selectedShop.lon]]} pathOptions={{ color: '#4f46e5', dashArray: '10, 10', weight: 3, opacity: 0.6 }} />
                        )}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default MapPage;
