import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    Calendar, 
    Users, 
    LogOut,
    CheckCircle,
    XCircle,
    Clock,
    QrCode,
    LayoutDashboard,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import AppointmentDetailModal from '../../components/admin/AppointmentDetailModal';
import QRScanner from '../../components/admin/QRScanner';

const HospitalDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [hospital, setHospital] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'agenda', 'patients'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user || (user.role !== 'hospital_admin' && user.role !== 'doctor')) {
            navigate('/login');
            return;
        }
        fetchHospitalData();
    }, [user]);

    const fetchHospitalData = async () => {
        try {
            setLoading(true);
            
            // Get hospital info
            const { data: hospitalData, error: hospitalError } = await supabase
                .from('hospitals')
                .select('*')
                .eq('id', user.hospital_id)
                .single();
            
            if (hospitalError) throw hospitalError;
            setHospital(hospitalData);

            // Get appointments for this hospital
            const { data: appointmentsData, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .eq('hospital_id', user.hospital_id)
                .order('created_at', { ascending: false });
            
            if (aptError) throw aptError;
            setAppointments(appointmentsData || []);

            // Get unique patients from appointments
            const uniquePatients = [...new Set(appointmentsData?.map(apt => apt.user_name) || [])];
            setPatients(uniquePatients);

            // Calculate stats
            const total = appointmentsData?.length || 0;
            const pending = appointmentsData?.filter(a => a.status === 'pending').length || 0;
            const confirmed = appointmentsData?.filter(a => a.status === 'confirmed').length || 0;
            const cancelled = appointmentsData?.filter(a => a.status === 'cancelled').length || 0;
            const completed = appointmentsData?.filter(a => a.status === 'completed' || 
                (new Date(a.appointment_date) < new Date() && a.status === 'confirmed')).length || 0;
            
            setStats({ total, pending, confirmed, cancelled, completed });
        } catch (err) {
            console.error('Error fetching hospital data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdateAppointment = (updatedAppointment) => {
        setAppointments(appointments.map(apt => 
            apt.id === updatedAppointment.id ? updatedAppointment : apt
        ));
        fetchHospitalData();
    };

    // Filter appointments for agenda (upcoming only)
    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= new Date() && apt.status !== 'cancelled';
    }).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

    // Filter patients by search
    const filteredPatients = patients.filter(patient => 
        patient?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{hospital?.name}</h1>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {user.role === 'hospital_admin' ? 'Admin' : 'Docteur'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowQRScanner(true)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-dakar-emerald text-white hover:bg-emerald-600 rounded-xl transition-colors text-sm whitespace-nowrap"
                                title="Scanner QR Patient"
                            >
                                <QrCode className="w-4 h-4" />
                                <span>Scanner QR</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* QR Scanner Modal */}
            {showQRScanner && (
                <QRScanner 
                    onClose={() => setShowQRScanner(false)} 
                    onScanSuccess={(data) => {
                        console.log('Patient scanned:', data);
                    }}
                />
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="bg-blue-500 text-white p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <Calendar className="w-5 h-5 opacity-80" />
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Total</span>
                                </div>
                                <p className="text-3xl font-bold">{stats.total}</p>
                                <p className="text-xs opacity-80">Rendez-vous</p>
                            </div>
                            <div className="bg-gray-800 text-white p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="w-5 h-5 opacity-80" />
                                    {stats.pending > 0 && <span className="w-2 h-2 bg-amber-400 rounded-full"></span>}
                                </div>
                                <p className="text-3xl font-bold">{stats.pending}</p>
                                <p className="text-xs opacity-80">En attente</p>
                            </div>
                            <div className="bg-gray-800 text-white p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <CheckCircle className="w-5 h-5 opacity-80" />
                                    {stats.confirmed > 0 && <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>}
                                </div>
                                <p className="text-3xl font-bold">{stats.confirmed}</p>
                                <p className="text-xs opacity-80">Confirmés</p>
                            </div>
                            <div className="bg-gray-800 text-white p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <XCircle className="w-5 h-5 opacity-80" />
                                </div>
                                <p className="text-3xl font-bold">{stats.cancelled}</p>
                                <p className="text-xs opacity-80">Annulés</p>
                            </div>
                        </div>

                        {/* Appointments List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Tous les rendez-vous</h2>
                                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                                    Voir tout →
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {appointments.length === 0 ? (
                                    <p className="p-6 text-gray-500 text-center">Aucun rendez-vous</p>
                                ) : (
                                    appointments.slice(0, 5).map((apt) => (
                                        <div 
                                            key={apt.id} 
                                            onClick={() => setSelectedAppointment(apt)}
                                            className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <span className="text-emerald-600 font-medium text-sm">
                                                        {(apt.user_name || 'U')[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{apt.user_name || 'Utilisateur inconnu'}</p>
                                                    <p className="text-xs text-gray-500">{apt.specialty}</p>
                                                    {apt.deleted_by_patient && (
                                                        <span className="text-xs text-red-500 font-medium">Supprimé par le patient</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-medium
                                                    ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : ''}
                                                    ${apt.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                                                    ${apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                                                `}>
                                                    {apt.status === 'confirmed' && new Date(apt.appointment_date) < new Date() ? 'Passé' : 
                                                     apt.status === 'confirmed' ? 'Confirmé' :
                                                     apt.status === 'pending' ? 'En attente' : 'Annulé'}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* AGENDA TAB */}
                {activeTab === 'agenda' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Rendez-vous à venir</h2>
                            <p className="text-sm text-gray-500">{upcomingAppointments.length} rendez-vous programmés</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingAppointments.length === 0 ? (
                                <p className="p-6 text-gray-500 text-center">Aucun rendez-vous à venir</p>
                            ) : (
                                upcomingAppointments.map((apt) => (
                                    <div 
                                        key={apt.id} 
                                        onClick={() => setSelectedAppointment(apt)}
                                        className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <span className="text-emerald-600 font-medium text-sm">
                                                    {(apt.user_name || 'U')[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{apt.user_name || 'Utilisateur inconnu'}</p>
                                                <p className="text-xs text-gray-500">{apt.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                Confirmé
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Patients</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un patient..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {filteredPatients.length === 0 ? (
                                <p className="p-6 text-gray-500 text-center">
                                    {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
                                </p>
                            ) : (
                                filteredPatients.map((patient, index) => (
                                    <div 
                                        key={index} 
                                        className="p-4 flex items-center gap-3 hover:bg-gray-50"
                                    >
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <span className="text-emerald-600 font-medium text-sm">
                                                {patient[0]}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{patient}</p>
                                            <p className="text-xs text-gray-500">
                                                {appointments.filter(apt => apt.user_name === patient).length} rendez-vous
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-around h-16">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                                activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-400'
                            }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-xs">Tableau</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('agenda')}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                                activeTab === 'agenda' ? 'text-blue-500' : 'text-gray-400'
                            }`}
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="text-xs">Agenda</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('patients')}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                                activeTab === 'patients' ? 'text-blue-500' : 'text-gray-400'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="text-xs">Patients</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-red-500 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-xs">Quitter</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <AppointmentDetailModal
                    appointment={{
                        ...selectedAppointment,
                        patient_name: selectedAppointment.user_name,
                        hospital_name: hospital?.name
                    }}
                    onClose={() => setSelectedAppointment(null)}
                    onUpdate={handleUpdateAppointment}
                />
            )}
        </div>
    );
};

export default HospitalDashboard;
