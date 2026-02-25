import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Phone, Navigation, Clock, ChevronLeft, Building2, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pharmacies } from '../data/pharmacies';
import { useGeolocation } from '../hooks/useGeolocation';
import { getDutyPharmacyIds, getDutyInfo } from '../utils/dutyPharmacy';

const districtColors = {
    'Dakar Centre': '🔵',
    'Dakar Ouest': '🟢',
    'Dakar Sud': '🟡',
    'Dakar Nord': '🟠',
    'Pikine': '🟣',
    'Guédiawaye': '🔷',
    'Keur Massar': '🔴',
    'Rufisque': '🟤',
};

const PharmacyCard = ({ pharmacy, distance, isDuty }) => {
    const handleCall = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (pharmacy.phone) {
            const firstPhone = pharmacy.phone.split('/')[0].trim().replace(/\s/g, '');
            window.location.href = `tel:${firstPhone}`;
        }
    };

    const handleItinerary = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.coords.lat},${pharmacy.coords.lng}`;
        window.open(url, '_blank');
    };

    return (
        <div className={`bg-white border rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-3 ${isDuty ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{districtColors[pharmacy.district] || '💊'}</span>
                    <span className="text-[9px] font-bold text-dakar-emerald bg-emerald-50 px-2 py-1 rounded-md uppercase border border-emerald-100">
                        {pharmacy.district}
                    </span>
                    {isDuty && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md uppercase border border-red-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            DE GARDE
                        </span>
                    )}
                </div>
                {distance !== null && distance !== undefined && (
                    <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0">
                        <Navigation className="w-3 h-3" />
                        {distance.toFixed(1)} km
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="font-bold text-deep-charcoal leading-tight">{pharmacy.name}</h3>
                {pharmacy.pharmacist && (
                    <p className="text-[11px] text-gray-400 font-medium">{pharmacy.pharmacist}</p>
                )}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-dakar-emerald flex-shrink-0" />
                    <span className="line-clamp-1">{pharmacy.address}</span>
                </div>
                {pharmacy.phone && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Phone className="w-3.5 h-3.5 text-dakar-emerald flex-shrink-0" />
                        <span>{pharmacy.phone}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                    onClick={handleCall}
                    disabled={!pharmacy.phone}
                    className={`flex items-center justify-center gap-2 py-2.5 bg-soft-gray text-deep-charcoal rounded-xl text-[11px] font-bold active:scale-95 transition-all ${!pharmacy.phone && 'opacity-30 cursor-not-allowed'}`}
                >
                    <Phone className="w-3.5 h-3.5" />
                    Appeler
                </button>
                <button
                    onClick={handleItinerary}
                    className="flex items-center justify-center gap-2 py-2.5 bg-dakar-emerald text-white rounded-xl text-[11px] font-bold active:scale-95 transition-all shadow-md shadow-emerald-100"
                >
                    <Navigation className="w-3.5 h-3.5" />
                    Y aller
                </button>
            </div>
        </div>
    );
};

const Pharmacies = () => {
    const navigate = useNavigate();
    const { location, calculateDistance } = useGeolocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('Tous');
    const [activeTab, setActiveTab] = useState('nearby');
    const [dutyInfo, setDutyInfo] = useState(() => getDutyInfo());
    const [dutyIds, setDutyIds] = useState(() => getDutyPharmacyIds(pharmacies));

    const districts = ['Tous', ...Object.keys(districtColors)];

    // Mise à jour en temps réel chaque minute
    useEffect(() => {
        const interval = setInterval(() => {
            setDutyInfo(getDutyInfo());
            setDutyIds(getDutyPharmacyIds(pharmacies));
        }, 60000); // toutes les minutes

        return () => clearInterval(interval);
    }, []);

    const pharmaciesWithDistance = useMemo(() => {
        let list = pharmacies.map(p => ({
            ...p,
            distance: location ? calculateDistance(location.lat, location.lng, p.coords.lat, p.coords.lng) : null,
            isDuty: dutyIds.includes(p.id)
        }));

        // Filtre par onglet
        if (activeTab === 'duty') {
            list = list.filter(p => p.isDuty);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.address.toLowerCase().includes(query) ||
                p.quartier.toLowerCase().includes(query) ||
                p.pharmacist.toLowerCase().includes(query) ||
                p.district.toLowerCase().includes(query)
            );
        }

        if (filterDistrict !== 'Tous') {
            list = list.filter(p => p.district === filterDistrict);
        }

        // Sort by distance if location is available
        if (location) {
            list.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }

        return list;
    }, [location, calculateDistance, searchQuery, filterDistrict, activeTab, dutyIds]);

    return (
        <div className="flex flex-col min-h-screen bg-soft-gray/30 pb-10 max-w-[440px] mx-auto">
            {/* Header */}
            <div className="bg-white px-6 pt-8 pb-6 rounded-b-[40px] shadow-sm sticky top-0 z-20">
                <div className="flex items-center justify-between mb-5">
                    <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-soft-gray text-deep-charcoal active:scale-90 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-deep-charcoal">Pharmacies</h1>
                    <div className="w-11" />
                </div>

                {/* Tabs: Proches / De Garde */}
                <div className="flex p-1.5 bg-soft-gray rounded-2xl mb-5">
                    <button
                        onClick={() => setActiveTab('nearby')}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'nearby' ? 'bg-white text-dakar-emerald shadow-sm' : 'text-gray-500'}`}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        Proches de moi
                    </button>
                    <button
                        onClick={() => setActiveTab('duty')}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'duty' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        De Garde
                        <span className={`w-2 h-2 rounded-full ${dutyInfo.isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
                    </button>
                </div>

                {/* Duty info banner (when on duty tab) */}
                {activeTab === 'duty' && (
                    <div className={`p-3 rounded-2xl mb-4 flex items-center gap-3 ${dutyInfo.isActive ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                        <div className={`p-2 rounded-xl ${dutyInfo.isActive ? 'bg-red-100' : 'bg-amber-100'}`}>
                            {dutyInfo.isActive ? (
                                <Shield className="w-5 h-5 text-red-600" />
                            ) : (
                                <Clock className="w-5 h-5 text-amber-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-xs font-bold ${dutyInfo.isActive ? 'text-red-700' : 'text-amber-700'}`}>
                                {dutyInfo.isActive ? 'Garde en cours' : 'Hors période de garde'}
                            </p>
                            <p className={`text-[10px] ${dutyInfo.isActive ? 'text-red-500' : 'text-amber-500'}`}>
                                {dutyInfo.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative group mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, quartier, pharmacien..."
                        className="w-full h-14 pl-12 pr-4 bg-soft-gray rounded-2xl text-[14px] font-medium border-2 border-transparent focus:border-dakar-emerald/20 focus:bg-white transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* District Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {districts.map(district => (
                        <button
                            key={district}
                            onClick={() => setFilterDistrict(district)}
                            className={`px-3 py-2 rounded-full text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${filterDistrict === district
                                ? 'bg-dakar-emerald text-white shadow-md shadow-emerald-100'
                                : 'bg-soft-gray text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {district !== 'Tous' && <span>{districtColors[district]}</span>}
                            {district}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-deep-charcoal text-sm">
                        {activeTab === 'duty' ? 'Pharmacies de garde' : (filterDistrict === 'Tous' ? 'Toutes les pharmacies' : filterDistrict)}
                        <span className="ml-2 text-xs font-medium text-gray-400">({pharmaciesWithDistance.length})</span>
                    </h2>
                    {location && (
                        <span className="text-[10px] text-dakar-emerald font-bold flex items-center gap-1">
                            <Navigation className="w-3 h-3 fill-current" />
                            Par proximité
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {pharmaciesWithDistance.length > 0 ? (
                        pharmaciesWithDistance.map(pharmacy => (
                            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} distance={pharmacy.distance} isDuty={pharmacy.isDuty} />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-soft-gray rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💊</div>
                            <p className="text-gray-400 font-medium">
                                {activeTab === 'duty' ? 'Aucune pharmacie de garde dans cette zone' : 'Aucune pharmacie trouvée'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pharmacies;
