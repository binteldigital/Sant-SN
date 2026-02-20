import React from 'react';
import { Bell, MapPin, Calendar, Clock, ChevronRight, Map, ClipboardList, Settings, Heart, Home as HomeIcon, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const upcomingRDV = {
        doctor: 'Dr. Amadou Fall',
        specialty: 'Cardiologie',
        hospital: 'Hôpital Principal',
        date: 'Demain, 22 Février',
        time: '10:00',
    };

    const history = [
        { title: 'Consultation Dermatologie', hospital: 'Clinique du Cap', date: '10 Jan 2026', status: 'Terminé' },
        { title: 'Analyse de Sang', hospital: 'CHNU Fann', date: 'Authorisé', status: 'Passé' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-deep-charcoal">Bonjour, Moustapha</h1>
                    <p className="text-sm text-gray-400 font-medium">Vous avez 1 rendez-vous aujourd'hui</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-dakar-emerald flex items-center justify-center text-white font-bold text-lg border-4 border-emerald-50 shadow-sm">
                    M
                </div>
            </header>

            {/* Main Stats/Shortcuts */}
            <div className="px-6 py-4 grid grid-cols-4 gap-4">
                {[
                    { label: 'RDV', icon: <Calendar className="w-5 h-5" />, color: 'bg-emerald-50 text-dakar-emerald', count: '01' },
                    { label: 'Hôpitaux', icon: <MapPin className="w-5 h-5" />, color: 'bg-emerald-50 text-dakar-emerald', count: '' },
                    { label: 'Docs', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-emerald-50 text-dakar-emerald', count: '' },
                    { label: 'Favoris', icon: <Heart className="w-5 h-5" />, color: 'bg-pink-50 text-pink-500', count: '' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center relative shadow-sm`}>
                            {item.icon}
                            {item.count && <span className="absolute -top-1 -right-1 bg-deep-charcoal text-white text-[8px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{item.count}</span>}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Upcoming Card */}
            <div className="px-6 py-4">
                <h2 className="font-bold text-deep-charcoal mb-4">Prochain rendez-vous</h2>
                <div className="bg-dakar-emerald p-6 rounded-[32px] text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
                            <div>
                                <h3 className="font-bold">{upcomingRDV.doctor}</h3>
                                <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">{upcomingRDV.specialty}</p>
                            </div>
                        </div>
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <Bell className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Calendar className="w-4 h-4 text-white/60" />
                            {upcomingRDV.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Clock className="w-4 h-4 text-white/60" />
                            {upcomingRDV.time}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white text-dakar-emerald py-3 rounded-2xl text-xs font-bold active:scale-95 transition-transform">
                            Voir Itinéraire
                        </button>
                        <button className="px-4 bg-emerald-700/50 backdrop-blur-sm text-white py-3 rounded-2xl text-xs font-bold active:scale-95 transition-transform">
                            Modifier
                        </button>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-deep-charcoal">Historique</h2>
                    <button className="text-xs text-gray-400 font-bold">TOUT VOIR</button>
                </div>
                <div className="space-y-3">
                    {history.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-soft-gray rounded-2xl group active:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                    <ClipboardList className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-deep-charcoal">{item.title}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.hospital} • {item.date}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-dakar-emerald transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Tabs */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto">
                <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Accueil</span>
                </Link>
                <Link to="/dashboard" className="flex flex-col items-center gap-1 text-dakar-emerald">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Mes RDV</span>
                </Link>
                <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default Dashboard;
