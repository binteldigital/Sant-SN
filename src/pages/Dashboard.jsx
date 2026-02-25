import React from 'react';
import { Bell, MapPin, Calendar, Clock, ChevronRight, Map, ClipboardList, Settings, Heart, Home as HomeIcon, User, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = React.useState([]);

    React.useEffect(() => {
        const savedData = localStorage.getItem('sunu_sante_appointments');
        console.log("Dashboard: Loading appointments...", savedData);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (Array.isArray(parsed)) {
                    console.log("Dashboard: Loaded count:", parsed.length);
                    setAppointments(parsed);
                }
            } catch (e) {
                console.error("Failed to parse appointments", e);
            }
        } else {
            // Fallback for old single data format or initial state
            const oldData = localStorage.getItem('sunu_sante_appointment');
            if (oldData) {
                const parsed = JSON.parse(oldData);
                setAppointments([{ ...parsed, id: 'legacy' }]);
            } else {
                // Initial placeholder if nothing exists
                setAppointments([{
                    id: 'placeholder',
                    doctor: 'Service Cardiologie',
                    specialty: 'Cardiologie',
                    hospital: 'Hôpital Principal',
                    date: 'Demain, 22 Février',
                    time: '10:00',
                }]);
            }
        }
    }, []);

    const handleCancel = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
            const updatedAppointments = appointments.filter(rdv => rdv.id !== id);
            setAppointments(updatedAppointments);
            localStorage.setItem('sunu_sante_appointments', JSON.stringify(updatedAppointments));
        }
    };

    const handleItinerary = (hospital) => {
        const query = encodeURIComponent(hospital || "Hôpital Principal de Dakar");
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const handleEdit = (id) => {
        const rdv = appointments.find(a => a.id === id);
        const hospitalId = rdv?.hospital?.toLowerCase().replace(/ /g, '-') || 'hopital-principal';
        navigate(`/booking/${hospitalId}`);
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
                    <p className="text-sm text-gray-400 font-medium">
                        Vous avez {appointments.length} rendez-vous {appointments.length > 1 ? 'prévus' : 'prévu'}
                    </p>
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

            {/* Prochain rendez-vous Section */}
            <section className="px-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-deep-charcoal">Mes rendez-vous à venir</h2>
                    <span className="text-[10px] bg-emerald-50 text-dakar-emerald px-2 py-1 rounded-full font-bold">
                        {appointments.length} Total
                    </span>
                </div>

                <div className="space-y-4">
                    {appointments.map((rdv) => (
                        <div key={rdv.id} className="relative overflow-hidden p-6 rounded-[32px] bg-dakar-emerald text-white shadow-xl shadow-emerald-100 group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                            <div className="flex justify-between items-start relative z-10 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                                        👨‍⚕️
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{rdv.doctor}</h3>
                                        <p className="text-xs text-white/70 font-medium uppercase tracking-wider">{rdv.specialty}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCancel(rdv.id)}
                                        className="p-3 bg-white/10 hover:bg-red-500/20 backdrop-blur-md rounded-full active:scale-90 transition-all text-white/80 hover:text-white"
                                        title="Annuler le rendez-vous"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-full active:scale-90 transition-all">
                                        <Bell className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center relative z-10 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-100" />
                                    <span className="text-sm font-bold">{rdv.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-100" />
                                    <span className="text-sm font-bold">{rdv.time}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3 relative z-10">
                                <button
                                    onClick={() => handleItinerary(rdv.hospital)}
                                    className="flex-1 h-12 bg-white text-dakar-emerald rounded-2xl text-[11px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all"
                                >
                                    Voir Itinéraire
                                </button>
                                <button
                                    onClick={() => navigate(`/booking/${rdv.hospital?.toLowerCase().replace(/ /g, '-') || 'hopital-principal'}`)}
                                    className="h-12 px-6 bg-dakar-emerald border border-white/20 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all"
                                >
                                    Modifier
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

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
                <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default Dashboard;
