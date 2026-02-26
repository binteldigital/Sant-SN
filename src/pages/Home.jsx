import React, { useState, useMemo } from 'react';
import { Search, Bell, MapPin, Heart, ChevronRight, Home as HomeIcon, Calendar, User, Navigation, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hospitals } from '../data/hospitals';
import { useGeolocation } from '../hooks/useGeolocation';

const typeImages = {
    'Hôpital Public': 'https://images.unsplash.com/photo-1586773860418-d319a39ec55e?auto=format&fit=crop&w=400&q=80',
    'Hôpital Militaire': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
    'Clinique Privée': 'https://images.unsplash.com/photo-1538108197022-38d6df025a17?auto=format&fit=crop&w=400&q=80',
    'Dispensaire': 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&w=400&q=80',
};

const typeIcons = {
    'Hôpital Public': '🟢',
    'Hôpital Militaire': '🔷',
    'Clinique Privée': '🔴',
    'Dispensaire': '🟠',
};

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { location, calculateDistance } = useGeolocation();

    // Filtered hospitals based on search
    const filteredHospitals = useMemo(() => {
        if (!searchQuery) return [];
        return hospitals.filter(h =>
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // Nearby hospitals (sorted by distance if location is available)
    const nearbyHospitals = useMemo(() => {
        if (!location) return hospitals.slice(0, 3); // Fallback to first 3 if no location

        return [...hospitals]
            .map(h => ({
                ...h,
                distance: calculateDistance(location.lat, location.lng, h.coords.lat, h.coords.lng)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3);
    }, [location, calculateDistance]);

    return (
        <div className="flex flex-col min-h-screen bg-white pb-20">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-10 transition-all">
                <div>
                    <h1 className="text-xl font-bold text-dakar-emerald">Sunu Santé</h1>
                    <p className="text-[10px] text-gray-400 font-medium">Santé à votre portée</p>
                </div>
                <button className="p-2.5 rounded-2xl bg-soft-gray hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5 text-deep-charcoal" />
                </button>
            </header>

            {/* Search Section */}
            <div className="px-6 py-2">
                <div className="relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un établissement..."
                        className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl text-deep-charcoal outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                </div>
            </div>

            {/* Search Results / Content */}
            {searchQuery ? (
                <div className="px-6 py-4">
                    <h2 className="font-bold text-deep-charcoal mb-4">Résultats pour "{searchQuery}"</h2>
                    {filteredHospitals.length > 0 ? (
                        <div className="space-y-4">
                            {filteredHospitals.map(hospital => (
                                <HospitalCard key={hospital.id} hospital={hospital} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400">Aucun résultat trouvé.</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Emergency Quick-Action */}
                    <div className="px-6 py-4">
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-xl text-2xl">🚨</div>
                                <div>
                                    <h3 className="font-bold text-red-900 text-sm">Urgences 24/7</h3>
                                    <p className="text-xs text-red-700">Appel d'urgence immédiat</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.location.href = 'tel:1515'}
                                className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-200 active:scale-95 transition-transform"
                            >
                                Appeler
                            </button>
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-deep-charcoal">Services</h2>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <Link to="/hospitals" className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-emerald-100 active:scale-90 transition-transform">🏥</div>
                                <span className="text-[10px] font-bold text-gray-600">Hôpitaux</span>
                            </Link>
                            <Link to="/pharmacies" className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-red-100 active:scale-90 transition-transform">💊</div>
                                <span className="text-[10px] font-bold text-gray-600">Pharmacies</span>
                            </Link>
                            <div className="flex flex-col items-center gap-2 opacity-50 grayscale">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">🧪</div>
                                <span className="text-[10px] font-bold text-gray-600">Labo</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 opacity-50 grayscale">
                                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-purple-100">🚑</div>
                                <span className="text-[10px] font-bold text-gray-600">Ambulance</span>
                            </div>
                        </div>
                    </div>

                    {/* Nearby Hospitals */}
                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-deep-charcoal">À proximité</h2>
                            {location && (
                                <div className="flex items-center gap-1 text-[10px] text-dakar-emerald font-medium bg-emerald-50 px-2 py-1 rounded-full">
                                    <Navigation className="w-3 h-3 fill-current" />
                                    Activée
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            {nearbyHospitals.map((hospital) => (
                                <HospitalCard key={hospital.id} hospital={hospital} showDistance={!!location} />
                            ))}
                        </div>
                        <Link to="/hospitals" className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-dakar-emerald py-3">
                            Voir les {hospitals.length} établissements
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </>
            )}

            {/* Bottom Tabs */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto z-20">
                <Link to="/" className="flex flex-col items-center gap-1 text-dakar-emerald">
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Accueil</span>
                </Link>
                <Link to="/flashdashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Mes RDV</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

const HospitalCard = ({ hospital, showDistance }) => (
    <Link to={`/hospital/${hospital.id}`} className="block group">
        <div className="bg-white border border-gray-100 p-3 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] overflow-hidden relative flex gap-4">
            {/* Image Thumbnail */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                <img
                    src={typeImages[hospital.type] || typeImages['Hôpital Public']}
                    alt={hospital.type}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-50 text-dakar-emerald text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border border-emerald-100">
                            {hospital.type}
                        </span>
                    </div>
                    {showDistance && hospital.distance && (
                        <span className="text-[10px] font-bold text-dakar-emerald">à {hospital.distance.toFixed(1)} km</span>
                    )}
                </div>
                <h3 className="font-bold text-deep-charcoal group-hover:text-dakar-emerald transition-colors leading-tight text-sm line-clamp-1">{hospital.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] truncate">{hospital.location} — {hospital.district}</span>
                </div>
                <div className="mt-auto pt-2 flex justify-between items-center">
                    <span className="text-[9px] bg-soft-gray px-2 py-0.5 rounded-full text-gray-500 font-medium whitespace-nowrap">{hospital.category}</span>
                    <button className="text-[10px] font-bold text-white bg-dakar-emerald px-3 py-1.5 rounded-xl shadow-sm shadow-emerald-100 active:scale-95 transition-transform">Réserver</button>
                </div>
            </div>
        </div>
    </Link>
);

export default Home;
