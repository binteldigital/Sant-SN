import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Phone, Globe, Navigation, Share2, Info, Mail, Building2, Map, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGeolocation } from '../hooks/useGeolocation';

const typeImages = {
    'Hôpital Public': 'https://images.unsplash.com/photo-1586773860418-d319a39ec55e?auto=format&fit=crop&w=800&q=80',
    'Hôpital Militaire': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    'Clinique Privée': 'https://images.unsplash.com/photo-1538108197022-38d6df025a17?auto=format&fit=crop&w=800&q=80',
    'Dispensaire': 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&w=800&q=80',
    'CHU': 'https://images.unsplash.com/photo-1586773860418-d319a39ec55e?auto=format&fit=crop&w=800&q=80',
    'EPS': 'https://images.unsplash.com/photo-1586773860418-d319a39ec55e?auto=format&fit=crop&w=800&q=80',
};

const typeColors = {
    'Hôpital Public': { bg: 'from-emerald-600 to-teal-700', icon: '🟢', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'Hôpital Militaire': { bg: 'from-blue-600 to-indigo-700', icon: '🔷', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    'Clinique Privée': { bg: 'from-rose-500 to-red-600', icon: '🔴', badge: 'bg-red-50 text-red-700 border-red-200' },
    'Dispensaire': { bg: 'from-amber-500 to-orange-600', icon: '🟠', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    'CHU': { bg: 'from-emerald-600 to-teal-700', icon: '🟢', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'EPS': { bg: 'from-emerald-600 to-teal-700', icon: '🟢', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const HospitalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { location, calculateDistance } = useGeolocation();

    useEffect(() => {
        fetchHospital();
    }, [id]);

    const fetchHospital = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('hospitals')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            if (data) {
                // Transform data to match component expectations
                setHospital({
                    ...data,
                    coords: {
                        lat: data.latitude,
                        lng: data.longitude
                    },
                    category: data.category || data.type,
                    specialties: data.services ? JSON.parse(data.services) : [],
                    description: `${data.name} est un établissement de santé de type ${data.type} situé à ${data.location || data.district}. ${data.address ? 'Adresse: ' + data.address : ''}`
                });
            }
        } catch (err) {
            console.error('Error fetching hospital:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const distance = location && hospital
        ? calculateDistance(location.lat, location.lng, hospital.coords.lat, hospital.coords.lng)
        : null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dakar-emerald mb-4"></div>
                <p className="text-gray-500">Chargement...</p>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <p className="text-gray-500 mb-4">Établissement non trouvé</p>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-dakar-emerald text-white rounded-xl font-bold">Retour</button>
            </div>
        );
    }

    const colors = typeColors[hospital.type] || typeColors['Hôpital Public'];

    const handleCall = () => {
        if (hospital.phone) {
            const firstPhone = hospital.phone.split('/')[0].trim().replace(/\s/g, '');
            window.location.href = `tel:${firstPhone}`;
        }
    };

    const handleItinerary = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.coords.lat},${hospital.coords.lng}`;
        window.open(url, '_blank');
    };

    const handleWebsite = () => {
        if (hospital.website) {
            const url = hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`;
            window.open(url, '_blank');
        }
    };

    const handleEmail = () => {
        if (hospital.email) {
            const firstEmail = hospital.email.split('/')[0].trim();
            window.location.href = `mailto:${firstEmail}`;
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: hospital.name,
                text: `Découvrez ${hospital.name} sur Sunu Santé`,
                url: window.location.href
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24 max-w-[440px] mx-auto">
            {/* Hero Header With Category Image */}
            <div className={`relative h-64 bg-gradient-to-br ${colors.bg} overflow-hidden`}>
                <img
                    src={typeImages[hospital.type] || typeImages['Hôpital Public']}
                    alt={hospital.type}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay scale-110"
                />

                {/* Decorative pattern/overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white z-10">
                    <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={handleShare} className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-lg active:scale-90 transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{hospital.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-white font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 uppercase tracking-wider">
                            {hospital.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Badges Info */}
            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <span className={`text-[11px] font-bold px-3 py-2 rounded-2xl border flex items-center gap-1.5 whitespace-nowrap shadow-sm ${colors.badge}`}>
                    <Building2 className="w-3.5 h-3.5" /> {hospital.type}
                </span>
                <span className="bg-blue-50 text-safe-blue text-[11px] font-bold px-3 py-2 rounded-2xl border border-blue-100 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                    <MapPin className="w-3.5 h-3.5" /> {hospital.location}
                </span>
                <span className="bg-gray-50 text-gray-500 text-[11px] font-bold px-3 py-2 rounded-2xl border border-gray-100 whitespace-nowrap shadow-sm">
                    {hospital.district}
                </span>
                {distance !== null && (
                    <span className="bg-emerald-50 text-dakar-emerald text-[11px] font-bold px-3 py-2 rounded-2xl border border-emerald-100 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                        <Navigation className="w-3.5 h-3.5" /> {distance.toFixed(1)} km
                    </span>
                )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 grid grid-cols-4 gap-3">
                <button
                    onClick={handleCall}
                    className={`flex flex-col items-center gap-2 group ${!hospital.phone && 'opacity-30 grayscale cursor-not-allowed'}`}
                    disabled={!hospital.phone}
                >
                    <div className="w-14 h-14 rounded-2xl bg-soft-gray flex items-center justify-center text-deep-charcoal group-active:scale-95 transition-all shadow-sm border border-gray-100 group-hover:bg-dakar-emerald/5">
                        <Phone className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Appeler</span>
                </button>
                <button
                    onClick={handleItinerary}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-soft-gray flex items-center justify-center text-deep-charcoal group-active:scale-95 transition-all shadow-sm border border-gray-100 group-hover:bg-dakar-emerald/5">
                        <Navigation className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Y aller</span>
                </button>
                <button
                    onClick={handleWebsite}
                    className={`flex flex-col items-center gap-2 group ${!hospital.website && 'opacity-30 grayscale cursor-not-allowed'}`}
                    disabled={!hospital.website}
                >
                    <div className="w-14 h-14 rounded-2xl bg-soft-gray flex items-center justify-center text-deep-charcoal group-active:scale-95 transition-all shadow-sm border border-gray-100 group-hover:bg-dakar-emerald/5">
                        <Globe className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Site Web</span>
                </button>
                <button
                    onClick={handleEmail}
                    className={`flex flex-col items-center gap-2 group ${!hospital.email && 'opacity-30 grayscale cursor-not-allowed'}`}
                    disabled={!hospital.email}
                >
                    <div className="w-14 h-14 rounded-2xl bg-soft-gray flex items-center justify-center text-deep-charcoal group-active:scale-95 transition-all shadow-sm border border-gray-100 group-hover:bg-dakar-emerald/5">
                        <Mail className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Email</span>
                </button>
            </div>

            {/* Specialities Section */}
            {hospital.specialties && hospital.specialties.length > 0 && (
                <div className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-rose-100 rounded-lg">
                            <Heart className="w-4 h-4 text-rose-500" />
                        </div>
                        <h2 className="font-bold text-deep-charcoal text-lg">Spécialités</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map((spec, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 shadow-sm transition-transform active:scale-95"
                            >
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Description Section */}
            <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Info className="w-4 h-4 text-dakar-emerald" />
                    </div>
                    <h2 className="font-bold text-deep-charcoal text-lg">À propos</h2>
                </div>
                <p className="text-[14px] text-gray-600 leading-relaxed font-medium bg-soft-gray/30 p-4 rounded-3xl border border-gray-50">
                    {hospital.description}
                </p>
            </div>

            {/* Address & Contact Details */}
            <div className="px-6 py-4">
                <h2 className="font-bold text-deep-charcoal text-lg mb-4">Informations</h2>
                <div className="space-y-3">
                    {hospital.address && (
                        <div className="flex items-start gap-3 p-3 bg-soft-gray/40 rounded-2xl">
                            <Map className="w-5 h-5 text-dakar-emerald flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Adresse</p>
                                <p className="text-sm text-deep-charcoal font-medium">{hospital.address}</p>
                            </div>
                        </div>
                    )}
                    {hospital.phone && (
                        <div className="flex items-start gap-3 p-3 bg-soft-gray/40 rounded-2xl">
                            <Phone className="w-5 h-5 text-dakar-emerald flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Téléphone</p>
                                <p className="text-sm text-deep-charcoal font-medium">{hospital.phone}</p>
                            </div>
                        </div>
                    )}
                    {hospital.email && (
                        <div className="flex items-start gap-3 p-3 bg-soft-gray/40 rounded-2xl">
                            <Mail className="w-5 h-5 text-dakar-emerald flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                                <p className="text-sm text-deep-charcoal font-medium">{hospital.email}</p>
                            </div>
                        </div>
                    )}
                    {hospital.website && (
                        <div className="flex items-start gap-3 p-3 bg-soft-gray/40 rounded-2xl">
                            <Globe className="w-5 h-5 text-dakar-emerald flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Site Web</p>
                                <p className="text-sm text-dakar-emerald font-medium">{hospital.website}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-3 p-3 bg-soft-gray/40 rounded-2xl">
                        <Building2 className="w-5 h-5 text-dakar-emerald flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">District / Département</p>
                            <p className="text-sm text-deep-charcoal font-medium">{hospital.district} — {hospital.department}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-gray-100 max-w-[440px] mx-auto z-20">
                <Link
                    to={`/booking/${id}`}
                    className="w-full h-15 bg-dakar-emerald text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-emerald-200 active:scale-95 transition-transform"
                >
                    Prendre rendez-vous
                </Link>
            </div>
        </div>
    );
};

export default HospitalDetail;
