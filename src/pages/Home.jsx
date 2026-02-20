import React from 'react';
import { Search, Bell, MapPin, Heart, ChevronRight, Home as HomeIcon, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const hospitals = [
        { id: 1, name: 'Hôpital Principal de Dakar', location: 'Dakar Plateau', type: 'Public', status: 'Ouvert 24/7' },
        { id: 2, name: 'Clinique du Cap', location: 'Corniche Est', type: 'Privé', status: 'Ouvert 24/7' },
        { id: 3, name: 'CHNU de Fann', location: 'Avenue Cheikh Anta Diop', type: 'Public', status: 'Ouvert 24/7' },
    ];

    const specialties = [
        { name: 'Cardiologie', icon: '❤️' },
        { name: 'Pédiatrie', icon: '👶' },
        { name: 'Gynécologie', icon: '👩‍⚕️' },
        { name: 'Urgences', icon: '🚨' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white pb-20">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-10">
                <h1 className="text-xl font-bold text-dakar-emerald">Sunu Santé</h1>
                <button className="p-2 rounded-full bg-soft-gray">
                    <Bell className="w-5 h-5 text-deep-charcoal" />
                </button>
            </header>

            {/* Search Section */}
            <div className="px-6 py-2">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Rechercher un hôpital ou spécialité..."
                        className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl text-deep-charcoal outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                </div>
            </div>

            {/* Emergency Quick-Action */}
            <div className="px-6 py-4">
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <span className="text-2xl">🚨</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 text-sm">Urgences 24/7</h3>
                            <p className="text-xs text-red-700">Appel d'urgence immédiat</p>
                        </div>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-200 active:scale-95 transition-transform">
                        Appeler
                    </button>
                </div>
            </div>

            {/* Specialities */}
            <div className="py-4">
                <div className="px-6 flex justify-between items-center mb-4">
                    <h2 className="font-bold text-deep-charcoal">Spécialités</h2>
                    <button className="text-sm text-dakar-emerald font-semibold">Toutes Voir</button>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
                    {specialties.map((spec, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                            <div className="w-16 h-16 bg-soft-gray rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-50 active:scale-90 transition-transform cursor-pointer">
                                {spec.icon}
                            </div>
                            <span className="text-[11px] font-medium text-gray-600">{spec.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nearby Hospitals */}
            <div className="px-6 py-4">
                <h2 className="font-bold text-deep-charcoal mb-4">Hôpitaux à proximité</h2>
                <div className="space-y-4">
                    {hospitals.map((hospital) => (
                        <Link to={`/hospital/${hospital.id}`} key={hospital.id} className="block group">
                            <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-emerald-50 text-dakar-emerald text-[10px] font-bold px-2 py-1 rounded-md uppercase border border-emerald-100">
                                        {hospital.type}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{hospital.status}</span>
                                </div>
                                <h3 className="font-bold text-deep-charcoal group-hover:text-dakar-emerald transition-colors">{hospital.name}</h3>
                                <div className="flex items-center gap-1 mt-1 text-gray-400">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-xs">{hospital.location}</span>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                                        ))}
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-soft-gray flex items-center justify-center text-[8px] font-bold text-gray-500">+12</div>
                                    </div>
                                    <button className="text-xs font-bold text-white bg-dakar-emerald px-4 py-2 rounded-xl">Réserver</button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Tabs */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto">
                <Link to="/" className="flex flex-col items-center gap-1 text-dakar-emerald">
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Accueil</span>
                </Link>
                <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Mes RDV</span>
                </Link>
                <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default Home;
