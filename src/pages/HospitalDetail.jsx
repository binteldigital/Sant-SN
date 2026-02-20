import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Phone, Globe, Navigation, Share2, Info } from 'lucide-react';

const HospitalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data - in a real app this would be fetched based on ID
    const hospital = {
        name: 'Hôpital Principal de Dakar',
        location: 'Dakar Plateau',
        type: 'Hôpital Militaire / Public',
        status: 'Ouvert 24h/24',
        rating: 4.8,
        reviews: 128,
        description: "L'Hôpital Principal de Dakar est un centre hospitalier d'instruction des armées, reconnu pour son excellence médicale et son plateau technique de pointe. Il accueille tous les militaires et civils du Sénégal.",
        services: [
            { name: 'Cardiologie', icon: '❤️', doctors: 8 },
            { name: 'Pédiatrie', icon: '👶', doctors: 12 },
            { name: 'Urgences', icon: '🚨', doctors: 6 },
            { name: 'Gynécologie', icon: '👩‍⚕️', doctors: 10 },
        ]
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24">
            {/* Hero Header */}
            <div className="relative h-64 bg-deep-charcoal overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1586773860418-d3b97976c661?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt={hospital.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pt-12">
                    <h1 className="text-2xl font-bold text-white leading-tight">{hospital.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center text-yellow-400">
                            {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-xs">★</span>)}
                        </div>
                        <span className="text-xs text-white/80 font-medium">({hospital.reviews} Avis)</span>
                    </div>
                </div>
            </div>

            {/* Badges Info */}
            <div className="px-6 py-4 flex gap-2 flex-wrap">
                <span className="bg-emerald-50 text-dakar-emerald text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {hospital.status}
                </span>
                <span className="bg-blue-50 text-safe-blue text-[10px] font-bold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {hospital.location}
                </span>
                <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-100">
                    {hospital.type}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-2xl bg-soft-gray flex items-center justify-center text-deep-charcoal group-active:scale-95 transition-all">
                        <Phone className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Appeler</span>
                </button>
                <button className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-2xl bg-soft-gray flex items-center justify-center text-deep-charcoal group-active:scale-95 transition-all">
                        <Navigation className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Itinéraire</span>
                </button>
                <button className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-2xl bg-soft-gray flex items-center justify-center text-deep-charcoal group-active:scale-95 transition-all">
                        <Globe className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Site Web</span>
                </button>
            </div>

            {/* Description */}
            <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-dakar-emerald" />
                    <h2 className="font-bold text-deep-charcoal italic underline decoration-dakar-emerald/30">À propos</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {hospital.description}
                </p>
            </div>

            {/* Services List */}
            <div className="px-6 py-4">
                <h2 className="font-bold text-deep-charcoal mb-4">Nos Services Disponibles</h2>
                <div className="grid grid-cols-2 gap-4">
                    {hospital.services.map((service, i) => (
                        <div key={i} className="bg-white border border-gray-100 p-4 rounded-3xl flex flex-col gap-3 shadow-sm">
                            <div className="w-10 h-10 bg-soft-gray rounded-xl flex items-center justify-center text-xl">
                                {service.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-deep-charcoal">{service.name}</h3>
                                <p className="text-[10px] text-gray-400 font-medium">{service.doctors} Médecins dispos</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-gray-100 max-w-[440px] mx-auto z-20">
                <Link
                    to={`/booking/${id}`}
                    className="w-full h-14 bg-dakar-emerald text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
                >
                    Prendre rendez-vous
                </Link>
            </div>
        </div>
    );
};

export default HospitalDetail;
