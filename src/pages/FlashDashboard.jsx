import React from 'react';
import { Bell, MapPin, Calendar, Clock, ChevronRight, Map, ClipboardList, Settings, Heart, Home as HomeIcon, User, Trash2, XCircle, RefreshCw, MessageSquare, HeartPulse } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const FlashDashboard = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [user, setUser] = React.useState(authUser);
    const [appointments, setAppointments] = React.useState([]);
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    // Fetch fresh user profile, appointments and notifications from Supabase
    React.useEffect(() => {
        if (authUser?.id) {
            fetchUserProfile();
            fetchAppointments();
            fetchNotifications();
        }
    }, [authUser?.id]);
    
    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.read).length || 0);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };
    
    const markNotificationAsRead = async (notificationId) => {
        try {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);
            
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };
    
    const markAllAsRead = async () => {
        try {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', authUser.id)
                .eq('read', false);
            
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (!error && data) {
                setUser(data);
                // Update localStorage with fresh data
                localStorage.setItem('sunusante_user', JSON.stringify(data));
            } else {
                setUser(authUser);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setUser(authUser);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching appointments for user:', authUser?.id, authUser?.email);
            
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', authUser.id)
                .eq('deleted_by_patient', false)  // Exclure les RDV supprimés par le patient
                .order('appointment_date', { ascending: true });
            
            console.log('📊 Appointments found:', data?.length || 0, data);

            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            // Fallback to localStorage if Supabase fails
            const savedData = localStorage.getItem('sunu_sante_appointments');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (Array.isArray(parsed)) {
                        setAppointments(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse local appointments", e);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
            try {
                // Update in Supabase
                const { error } = await supabase
                    .from('appointments')
                    .update({ 
                        status: 'cancelled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (error) throw error;

                // Update local state
                const updatedAppointments = appointments.map(apt => 
                    apt.id === id ? { ...apt, status: 'cancelled' } : apt
                );
                setAppointments(updatedAppointments);
                
                // Also update localStorage as fallback
                localStorage.setItem('sunu_sante_appointments', JSON.stringify(updatedAppointments));
                
            } catch (err) {
                console.error('Failed to cancel appointment:', err);
                alert('Erreur lors de l\'annulation du rendez-vous');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous retirer ce rendez-vous de votre liste ? (L'hôpital conservera l'historique)")) {
            try {
                // Soft delete - marquer comme supprimé par le patient
                const { error } = await supabase
                    .from('appointments')
                    .update({ 
                        deleted_by_patient: true,
                        deleted_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (error) throw error;

                // Update local state - retirer de la vue patient
                const updatedAppointments = appointments.filter(apt => apt.id !== id);
                setAppointments(updatedAppointments);

                // Update localStorage
                localStorage.setItem('sunu_sante_appointments', JSON.stringify(updatedAppointments));

            } catch (err) {
                console.error('Failed to delete appointment:', err);
                alert('Erreur lors de la suppression du rendez-vous');
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: 'bg-emerald-100 text-emerald-700',
            pending: 'bg-amber-100 text-amber-700',
            cancelled: 'bg-red-100 text-red-700',
            completed: 'bg-gray-100 text-gray-700'
        };
        const labels = {
            confirmed: 'Confirmé',
            pending: 'En attente',
            cancelled: 'Annulé',
            completed: 'Terminé'
        };
        return {
            className: styles[status] || 'bg-gray-100 text-gray-700',
            label: labels[status] || status
        };
    };

    const handleItinerary = (hospital) => {
        const query = encodeURIComponent(hospital || "Hôpital Principal de Dakar");
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    // Écran non connecté
    if (!authUser) {
        return (
            <div className="flex flex-col min-h-screen bg-white pb-24">
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                    <div className="w-24 h-24 rounded-[36px] bg-emerald-50 flex items-center justify-center mb-6 border-2 border-emerald-100">
                        <Calendar className="w-12 h-12 text-dakar-emerald" />
                    </div>
                    <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Mes rendez-vous</h2>
                    <p className="text-sm text-gray-400 mb-8 max-w-[280px]">
                        Connectez-vous pour accéder à vos rendez-vous médicaux et gérer votre agenda santé.
                    </p>
                    <Link
                        to="/register"
                        className="w-full max-w-[300px] h-14 bg-dakar-emerald text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-emerald-200 active:scale-95 transition-transform mb-4"
                    >
                        Créer un compte
                    </Link>
                    <Link
                        to="/login"
                        className="w-full max-w-[300px] h-14 bg-soft-gray text-deep-charcoal rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
                    >
                        J'ai déjà un compte
                    </Link>
                </div>

                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto z-50">
                    <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <HomeIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Accueil</span>
                    </Link>
                    <Link to="/flashdashboard" className="flex flex-col items-center gap-1 text-dakar-emerald">
                        <Calendar className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Mes RDV</span>
                    </Link>
                    <Link to="/health-record" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <HeartPulse className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Carnet</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Profil</span>
                    </Link>
                </nav>
            </div>
        );
    }

    // Historique des rendez-vous (passés et annulés)
    const [showAllHistory, setShowAllHistory] = React.useState(false);
    
    const history = [
        { title: 'Consultation Dermatologie', hospital: 'Clinique du Cap', date: '10 Jan 2026', status: 'Terminé' },
        { title: 'Analyse de Sang', hospital: 'CHNU Fann', date: 'Authorisé', status: 'Passé' },
    ];
    
    // Combiner les rendez-vous actuels avec l'historique pour "Tout voir"
    const allAppointments = showAllHistory 
        ? [...appointments, ...history.map(h => ({ ...h, isHistory: true }))]
        : appointments;

    const displayName = user.full_name || user.name || 'Utilisateur';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-deep-charcoal tracking-tight">Bonjour, {displayName}</h1>
                    <p className="text-sm text-gray-400 font-medium">
                        Vous avez {appointments.length} rendez-vous {appointments.length > 1 ? 'prévus' : 'prévu'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-gray-600" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-dakar-emerald flex items-center justify-center text-white font-bold text-lg border-4 border-emerald-50 shadow-sm">
                        {initial}
                    </div>
                </div>
            </header>
            
            {/* Notifications Panel */}
            {showNotifications && (
                <div className="mx-6 mb-4 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-dakar-emerald font-medium hover:underline"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-sm text-gray-400">Aucune notification</p>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        !notification.read ? 'bg-emerald-50/30' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                            !notification.read ? 'bg-dakar-emerald' : 'bg-gray-300'
                                        }`} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-2">
                                                {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Shortcuts */}
            <div className="px-6 py-4 grid grid-cols-4 gap-4">
                {[
                    { label: 'RDV', icon: <Calendar className="w-5 h-5" />, color: 'bg-emerald-50 text-dakar-emerald', count: appointments.length > 0 ? `0${appointments.length}`.slice(-2) : null },
                    { label: 'Hôpitaux', icon: <MapPin className="w-5 h-5" />, color: 'bg-emerald-50 text-dakar-emerald', count: '' },
                    { label: 'Docs', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-emerald-50 text-dakar-emerald', count: '' },
                    { label: 'Favoris', icon: <Heart className="w-5 h-5" />, color: 'bg-pink-50 text-pink-500', count: '' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center relative shadow-sm`}>
                            {item.icon}
                            {item.count && <span className="absolute -top-1 -right-1 bg-deep-charcoal text-white text-[8px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{item.count}</span>}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Appointments List */}
            <section className="px-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-deep-charcoal text-lg">Mes rendez-vous à venir</h2>
                    <span className="text-[10px] bg-emerald-50 text-dakar-emerald px-2 py-1 rounded-full font-bold">
                        {appointments.length} Total
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-soft-gray rounded-[32px] p-8 text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Calendar className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">Aucun rendez-vous prévu</p>
                        <button
                            onClick={() => navigate('/hospitals')}
                            className="mt-4 text-xs font-bold text-dakar-emerald uppercase tracking-wider"
                        >
                            Prendre rendez-vous
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(showAllHistory ? [...appointments, ...history.map(h => ({ 
                            ...h, 
                            id: `history-${h.title}`,
                            service: h.title,
                            hospital_name: h.hospital,
                            appointment_date: h.date,
                            status: h.status === 'Terminé' ? 'completed' : 'cancelled',
                            isHistory: true 
                        }))] : appointments).map((rdv) => {
                            const statusBadge = getStatusBadge(rdv.status);
                            const isCancelled = rdv.status === 'cancelled' || rdv.status === 'cancelled_by_patient';
                            const isHistoryItem = rdv.isHistory || false;
                            
                            return (
                                <div key={rdv.id} className={`relative overflow-hidden p-6 rounded-[32px] shadow-xl group transition-all duration-300 ${
                                    isCancelled ? 'bg-gray-400/90' : 'bg-dakar-emerald'
                                } text-white`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                                    {/* Status Badge & Delete Button */}
                                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge.className}`}>
                                            {statusBadge.label}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(rdv.id)}
                                            className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-red-500 transition-colors group/btn"
                                            title="Supprimer ce rendez-vous"
                                        >
                                            <Trash2 className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-start relative z-10 mb-4 pr-24">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl backdrop-blur-md flex items-center justify-center text-xl shadow-inner ${
                                                isCancelled ? 'bg-white/10' : 'bg-white/20'
                                            }`}>
                                                {isCancelled ? <XCircle className="w-6 h-6" /> : '👨‍⚕️'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg leading-tight">{rdv.doctor_name || rdv.doctor || 'Médecin'}</h3>
                                                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">{rdv.specialty}</p>
                                                <p className="text-[11px] text-white/50 font-bold">{rdv.hospital_name || rdv.hospital}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`backdrop-blur-md rounded-2xl p-4 flex justify-between items-center relative z-10 border border-white/10 ${
                                        isCancelled ? 'bg-white/5' : 'bg-white/15'
                                    }`}>
                                        {rdv.status === 'pending' && !rdv.appointment_date ? (
                                            // Demande en attente - pas encore de date assignée
                                            <div className="flex items-center gap-2 flex-1">
                                                <Clock className="w-4 h-4 text-amber-200" />
                                                <span className="text-sm font-bold text-amber-100">
                                                    En attente de confirmation
                                                </span>
                                            </div>
                                        ) : (
                                            // Rendez-vous confirmé avec date
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-emerald-100" />
                                                    <span className="text-sm font-bold">
                                                        {rdv.appointment_date 
                                                            ? new Date(rdv.appointment_date).toLocaleDateString('fr-FR', { 
                                                                weekday: 'long', 
                                                                day: 'numeric', 
                                                                month: 'long' 
                                                            })
                                                            : 'Date non définie'
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-emerald-100" />
                                                    <span className="text-sm font-bold">{rdv.appointment_time || rdv.time || '--:--'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Admin Message */}
                                    {rdv.notes && (
                                        <div className="mt-3 p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 relative z-10">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="w-4 h-4 text-emerald-100 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-1">Message de l'hôpital</p>
                                                    <p className="text-sm text-white font-medium leading-relaxed">{rdv.notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {isHistoryItem ? (
                                        // Rendez-vous de l'historique (pas d'actions)
                                        <div className="mt-4 p-3 bg-white/10 rounded-2xl flex items-center justify-center gap-2 relative z-10">
                                            <p className="text-xs font-bold text-white/80">
                                                {rdv.status === 'completed' ? '✓ RENDEZ-VOUS TERMINÉ' : '✗ RENDEZ-VOUS ANNULÉ'}
                                            </p>
                                        </div>
                                    ) : !isCancelled && rdv.status !== 'completed' ? (
                                        <div className="mt-4 flex gap-3 relative z-10">
                                            <button
                                                onClick={() => handleCancel(rdv.id)}
                                                className="flex-1 h-12 bg-red-500/80 hover:bg-red-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                ANNULER
                                            </button>
                                            <button
                                                onClick={() => handleItinerary(rdv.hospital_name || rdv.hospital)}
                                                className="flex-1 h-12 bg-white text-dakar-emerald rounded-2xl text-[11px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all"
                                            >
                                                ITINÉRAIRE
                                            </button>
                                            <button
                                                onClick={() => navigate(`/booking/${rdv.hospital_id || rdv.hospital?.toLowerCase().replace(/ /g, '-') || 'hopital-principal'}?edit=${rdv.id}`)}
                                                className="h-12 px-6 bg-emerald-600 border border-white/20 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all"
                                            >
                                                MODIFIER
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-4 p-4 bg-black/10 rounded-2xl flex flex-col items-center gap-3 relative z-10">
                                            <p className="text-xs font-bold text-white/90">
                                                {rdv.status === 'completed' ? 'CE RENDEZ-VOUS EST TERMINÉ' : 'CE RENDEZ-VOUS A ÉTÉ ANNULÉ'}
                                            </p>
                                            <button
                                                onClick={() => handleDelete(rdv.id)}
                                                className="h-10 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                SUPPRIMER DÉFINITIVEMENT
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* History */}
            <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-deep-charcoal">Historique</h2>
                    <button 
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="text-xs text-gray-400 font-bold hover:text-dakar-emerald transition-colors"
                    >
                        {showAllHistory ? 'RÉDUIRE' : 'TOUT VOIR'}
                    </button>
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

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto z-50">
                <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Accueil</span>
                </Link>
                <Link to="/flashdashboard" className="flex flex-col items-center gap-1 text-dakar-emerald">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Mes RDV</span>
                </Link>
                <Link to="/health-record" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <HeartPulse className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Carnet</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default FlashDashboard;
