import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    Calendar, 
    Users, 
    LogOut,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import AppointmentDetailModal from '../../components/admin/AppointmentDetailModal';

const HospitalDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [hospital, setHospital] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

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

            // Calculate stats
            const total = appointmentsData?.length || 0;
            const pending = appointmentsData?.filter(a => a.status === 'pending').length || 0;
            const confirmed = appointmentsData?.filter(a => a.status === 'confirmed').length || 0;
            const cancelled = appointmentsData?.filter(a => a.status === 'cancelled').length || 0;
            
            setStats({ total, pending, confirmed, cancelled });
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
        fetchHospitalData(); // Refresh stats
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">{hospital?.name}</h1>
                                <p className="text-sm text-gray-500">
                                    {user.role === 'hospital_admin' ? 'Admin Hôpital' : 'Docteur'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total RDV</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">En attente</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Confirmés</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Refusés</p>
                                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Rendez-vous récents</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {appointments.length === 0 ? (
                            <p className="p-6 text-gray-500 text-center">Aucun rendez-vous</p>
                        ) : (
                            appointments.map((apt) => (
                                <div 
                                    key={apt.id} 
                                    onClick={() => setSelectedAppointment(apt)}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <span className="text-emerald-600 font-medium">
                                                {(apt.user_name || 'U')[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{apt.user_name || 'Utilisateur inconnu'}</p>
                                            <p className="text-sm text-gray-500">{apt.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`
                                            px-3 py-1 rounded-full text-xs font-medium
                                            ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : ''}
                                            ${apt.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                                            ${apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                                        `}>
                                            {apt.status}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

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
