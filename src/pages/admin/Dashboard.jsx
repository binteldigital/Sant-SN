import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    Pill, 
    Users, 
    Calendar,
    Activity
} from 'lucide-react';
import { hospitals } from '../../data/hospitals';
import { pharmacies } from '../../data/pharmacies';

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

const RecentAppointments = ({ appointments }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Rendez-vous récents</h3>
        </div>
        <div className="divide-y divide-gray-100">
            {appointments.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">Aucun rendez-vous récent</p>
            ) : (
                appointments.map((apt) => (
                    <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600 font-medium">
                                    {apt.patient_name?.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{apt.patient_name}</p>
                                <p className="text-sm text-gray-500">{apt.hospital_name}</p>
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

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 500);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
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
                    value={hospitals.length}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Pill}
                    label="Pharmacies"
                    value={pharmacies.length}
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={Users}
                    label="Utilisateurs"
                    value={190}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={Calendar}
                    label="Rendez-vous"
                    value={42}
                    color="bg-orange-500"
                />
            </div>

            {/* Content Grid - Full width on large screens */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <RecentAppointments appointments={MOCK_APPOINTMENTS} />
                </div>
                <div className="xl:col-span-1">
                    <UserDistribution distribution={MOCK_USER_DISTRIBUTION} />
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
        </div>
    );
};

export default AdminDashboard;
