import React, { useState, useMemo } from 'react';
import { Search, MapPin, ArrowLeft, Filter, Navigation, Building2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

const Hospitals = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('Tous');
    const { location, calculateDistance } = useGeolocation();

    const types = ['Tous', 'Hôpital Public', 'Hôpital Militaire', 'Clinique Privée', 'Dispensaire'];

    const filteredHospitals = useMemo(() => {
        let results = hospitals.filter(h =>
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterType !== 'Tous') {
            results = results.filter(h => h.type === filterType);
        }

        if (location) {
            results = results.map(h => ({
                ...h,
                distance: calculateDistance(location.lat, location.lng, h.coords.lat, h.coords.lng)
            })).sort((a, b) => a.distance - b.distance);
        }

        return results;
    }, [searchQuery, filterType, location, calculateDistance]);

    return (
        <div className="flex flex-col min-h-screen bg-white pb-10">
            {/* Header */}
            <header className="px-6 py-4 bg-white sticky top-0 z-10 border-b border-gray-50 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-soft-gray hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-deep-charcoal" />
                </button>
                <h1 className="text-xl font-bold text-deep-charcoal">Structures de Santé</h1>
            </header>

            {/* Search & Filters */}
            <div className="px-6 py-4 space-y-4">
                <div className="relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher par nom, quartier, district..."
                        className="w-full pl-12 pr-4 py-3.5 bg-soft-gray rounded-2xl text-deep-charcoal outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {types.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${filterType === type
                                ? 'bg-dakar-emerald text-white shadow-md shadow-emerald-100'
                                : 'bg-soft-gray text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {type !== 'Tous' && <span>{typeIcons[type]}</span>}
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hospital List */}
            <div className="px-6 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {filteredHospitals.length} établissements trouvés
                    </span>
                    {location && (
                        <span className="text-[10px] text-dakar-emerald font-bold flex items-center gap-1">
                            <Navigation className="w-3 h-3 fill-current" />
                            Triés par proximité
                        </span>
                    )}
                </div>

                {filteredHospitals.map(hospital => (
                    <Link to={`/hospital/${hospital.id}`} key={hospital.id} className="block group">
                        <div className="bg-white border border-gray-100 p-3 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex gap-4 overflow-hidden relative">
                            {/* Image Thumbnail */}
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50 flex items-center justify-center">
                                <img
                                    src={typeImages[hospital.type] || typeImages['Hôpital Public']}
                                    alt={hospital.type}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className="text-[9px] font-bold text-dakar-emerald uppercase">{hospital.type}</span>
                                    {hospital.distance && (
                                        <span className="text-[9px] font-bold text-gray-400">{hospital.distance.toFixed(1)} km</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-deep-charcoal group-hover:text-dakar-emerald transition-colors leading-tight text-sm truncate">
                                    {hospital.name}
                                </h3>
                                <div className="flex items-center gap-1 mt-1 text-gray-400">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="text-[11px] truncate">{hospital.location} — {hospital.district}</span>
                                </div>
                                <div className="mt-1.5">
                                    <span className="text-[8px] bg-soft-gray px-1.5 py-0.5 rounded text-gray-500">{hospital.category}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredHospitals.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="text-4xl mb-4">🏥</div>
                        <p className="text-gray-400">Aucun établissement ne correspond à votre recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hospitals;
