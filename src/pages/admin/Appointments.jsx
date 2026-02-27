import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    Building2,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AppointmentDetailModal from '../../components/admin/AppointmentDetailModal';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [hospitalFilter, setHospitalFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;
    
    // Hospitals list for filter
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        fetchAppointments();
        fetchHospitals();
    }, [currentPage, statusFilter, hospitalFilter, dateFilter]);

    const fetchHospitals = async () => {
        try {
            const { data, error } = await supabase
                .from('hospitals')
                .select('id, name')
                .eq('is_active', true)
                .order('name');
            
            if (error) throw error;
            setHospitals(data || []);
        } catch (err) {
            console.error('Error fetching hospitals:', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let query = supabase
                .from('appointments')
                .select('*', { count: 'exact' });
            
            // Apply filters
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }
            
            if (hospitalFilter !== 'all') {
                query = query.eq('hospital_id', hospitalFilter);
            }
            
            if (dateFilter) {
                query = query.eq('appointment_date', dateFilter);
            }
            
            // Apply search
            if (searchTerm) {
                query = query.or(`user_name.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%,user_phone.ilike.%${searchTerm}%`);
            }
            
            // Pagination
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);
            
            if (error) throw error;
            
            setAppointments(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Impossible de charger les rendez-vous');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchAppointments();
    };

    const handleUpdateAppointment = (updatedAppointment) => {
        setAppointments(appointments.map(apt => 
            apt.id === updatedAppointment.id ? updatedAppointment : apt
        ));
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: 'bg-emerald-100 text-emerald-700',
            pending: 'bg-amber-100 text-amber-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        const labels = {
            confirmed: 'Confirmé',
            pending: 'En attente',
            cancelled: 'Annulé'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const exportToCSV = () => {
        const headers = ['Patient', 'Email', 'Téléphone', 'Hôpital', 'Date', 'Heure', 'Spécialité', 'Statut'];
        const rows = appointments.map(apt => [
            apt.user_name,
            apt.user_email,
            apt.user_phone,
            apt.hospital_name,
            apt.appointment_date,
            apt.appointment_time,
            apt.specialty,
            apt.status
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rendez-vous-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
                    <p className="text-gray-500 mt-1">Gérez tous les rendez-vous du système</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exporter
                    </button>
                    <button
                        onClick={() => fetchAppointments()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, email ou téléphone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </form>
                    
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>
                    
                    {/* Hospital Filter */}
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <select
                            value={hospitalFilter}
                            onChange={(e) => {
                                setHospitalFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="all">Tous les hôpitaux</option>
                            {hospitals.map(hospital => (
                                <option key={hospital.id} value={hospital.id}>
                                    {hospital.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={fetchAppointments}
                        className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Calendar className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Aucun rendez-vous trouvé</p>
                        <p className="text-sm">Essayez de modifier vos filtres</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Patient</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Hôpital</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date & Heure</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Spécialité</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Statut</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((apt) => (
                                        <tr 
                                            key={apt.id} 
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                        <span className="text-emerald-600 font-medium">
                                                            {(apt.user_name || 'U')[0]}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{apt.user_name || 'Utilisateur inconnu'}</p>
                                                        <p className="text-sm text-gray-500">{apt.user_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">{apt.hospital_name || 'Hôpital inconnu'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-gray-700">
                                                            {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{apt.appointment_time}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-700">{apt.specialty || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(apt.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedAppointment(apt)}
                                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                                                >
                                                    Voir détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} rendez-vous
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {currentPage} sur {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Appointment Detail Modal */}
            {selectedAppointment && (
                <AppointmentDetailModal
                    appointment={{
                        ...selectedAppointment,
                        patient_name: selectedAppointment.user_name
                    }}
                    onClose={() => setSelectedAppointment(null)}
                    onUpdate={handleUpdateAppointment}
                />
            )}
        </div>
    );
};

export default Appointments;
