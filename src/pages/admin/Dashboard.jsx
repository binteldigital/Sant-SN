import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    Pill, 
    Users, 
    Calendar,
    Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AppointmentDetailModal from '../../components/admin/AppointmentDetailModal';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

// Mock data for demo
const MOCK_APPOINTMENTS = [
    { id: 1, patient_name: 'Amadou Diallo', hospital_name: 'Hôpital Principal de Dakar', status: 'confirmed', appointment_date: '2025-02-26' },
    { id: 2, patient_name: 'Fatou Ndiaye', hospital_name: 'CHNU de Fann', status: 'pending', appointment_date: '2025-02-27' },
    { id: 3, patient_name: 'Moussa Sow', hospital_name: 'Clinique du Cap', status: 'confirmed', appointment_date: '2025-02-28' },
];

const MOCK_USER_DISTRIBUTION = [
    { role: 'patient', count: 156 },
    { role: 'doctor', count: 24 },
    { role: 'hospital_admin', count: 8 },
    { role: 'super_admin', count: 2 },
];

const RecentAppointments = ({ appointments, onAppointmentClick }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Rendez-vous récents</h3>
        </div>
        <div className="divide-y divide-gray-100">
            {appointments.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">Aucun rendez-vous récent</p>
            ) : (
                appointments.map((apt) => (
                    <div 
                        key={apt.id} 
                        onClick={() => onAppointmentClick(apt)}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600 font-medium">
                                    {(apt.patient_name || 'U').charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{apt.patient_name || 'Utilisateur inconnu'}</p>
                                <p className="text-sm text-gray-500">{apt.hospital_name || 'Hôpital inconnu'}</p>
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
);

const UserDistribution = ({ distribution }) => {
    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Distribution des utilisateurs</h3>
            <div className="space-y-4">
                {distribution.map((item) => {
                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                    return (
                        <div key={item.role}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 capitalize">{item.role.replace('_', ' ')}</span>
                                <span className="font-medium">{item.count}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        hospitals: 0,
        pharmacies: 0,
        users: 0,
        appointments: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [userDistribution, setUserDistribution] = useState([]);
    const [error, setError] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch counts from Supabase
            const { data: hospitals } = await supabase
                .from('hospitals')
                .select('id')
                .eq('is_active', true);
            
            const { data: pharmacies } = await supabase
                .from('pharmacies')
                .select('id')
                .eq('is_active', true);
            
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('is_active', true);
            
            const { data: appointments } = await supabase
                .from('appointments')
                .select('id')
                .in('status', ['pending', 'confirmed']);
            
            // Fetch user distribution by role
            const { data: userRoles } = await supabase
                .from('users')
                .select('role')
                .eq('is_active', true);
            
            const roleCounts = userRoles?.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {}) || {};
            
            const userDistribution = Object.entries(roleCounts).map(([role, count]) => ({
                role,
                count
            }));
            
            // Fetch recent appointments
            console.log('Dashboard: Fetching appointments...');
            const { data: recentApts, error: aptError } = await supabase
                .from('appointments')
                .select('*')
                .order('appointment_date', { ascending: false })
                .limit(5);
            
            if (aptError) {
                console.error('Error fetching appointments:', aptError);
            }
            
            console.log('Dashboard: Loaded appointments:', recentApts?.length || 0, recentApts);
            
            const formattedAppointments = (recentApts || []).map(apt => ({
                id: apt.id,
                patient_name: apt.user_name || 'Utilisateur inconnu',
                user_email: apt.user_email,
                user_phone: apt.user_phone,
                hospital_name: apt.hospital_name || 'Hôpital inconnu',
                hospital_id: apt.hospital_id,
                status: apt.status,
                appointment_date: apt.appointment_date,
                appointment_time: apt.appointment_time,
                specialty: apt.specialty,
                doctor_name: apt.doctor_name,
                notes: apt.notes
            }));
            
            setStats({
                hospitals: hospitals?.length || 0,
                pharmacies: pharmacies?.length || 0,
                users: users?.length || 0,
                appointments: appointments?.length || 0
            });
            
            setRecentAppointments(formattedAppointments);
            setUserDistribution(userDistribution);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Impossible de charger les données du tableau de bord');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchDashboardData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500 mt-1">Vue d'ensemble de votre système de santé</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    icon={Building2}
                    label="Hôpitaux"
                    value={stats.hospitals}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Pill}
                    label="Pharmacies"
                    value={stats.pharmacies}
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={Users}
                    label="Utilisateurs"
                    value={stats.users}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={Calendar}
                    label="Rendez-vous"
                    value={stats.appointments}
                    color="bg-orange-500"
                />
            </div>

            {/* Content Grid - Full width on large screens */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <RecentAppointments 
                        appointments={recentAppointments} 
                        onAppointmentClick={setSelectedAppointment}
                    />
                </div>
                <div className="xl:col-span-1">
                    <UserDistribution distribution={userDistribution} />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Actions rapides</h3>
                <div className="flex flex-wrap gap-4">
                    <a 
                        href="/admin/hospitals"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                        <Building2 className="w-4 h-4" />
                        Gérer les hôpitaux
                    </a>
                    <a 
                        href="/admin/pharmacies"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Pill className="w-4 h-4" />
                        Gérer les pharmacies
                    </a>
                    <a 
                        href="/admin/users"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        Gérer les utilisateurs
                    </a>
                </div>
            </div>

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <AppointmentDetailModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onUpdate={(updatedAppointment) => {
                        setRecentAppointments(recentAppointments.map(apt => 
                            apt.id === updatedAppointment.id ? updatedAppointment : apt
                        ));
                        setSelectedAppointment(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
