import React, { useState } from 'react';
import { X, Calendar, Clock, User, Building2, Stethoscope, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AppointmentDetailModal = ({ appointment, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState(appointment?.notes || '');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [action, setAction] = useState(null); // 'confirm' or 'cancel'
    
    // New state for hospital to set date/time
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(appointment?.doctor_name || '');

    if (!appointment) return null;
    
    // Generate next 14 days for selection
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
            });
        }
        return dates;
    };
    
    const availableDates = generateDates();
    const availableTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

    const handleStatusChange = async (newStatus) => {
        setLoading(true);
        try {
            const updateData = { 
                status: newStatus,
                notes: notes,
                updated_at: new Date().toISOString()
            };
            
            // If confirming, include date, time and doctor
            if (newStatus === 'confirmed') {
                if (!selectedDate || !selectedTime) {
                    alert('Veuillez sélectionner une date et une heure pour le rendez-vous');
                    setLoading(false);
                    return;
                }
                updateData.appointment_date = selectedDate;
                updateData.appointment_time = selectedTime;
                if (selectedDoctor) {
                    updateData.doctor_name = selectedDoctor;
                }
            }
            
            const { data, error } = await supabase
                .from('appointments')
                .update(updateData)
                .eq('id', appointment.id)
                .select()
                .single();

            if (error) throw error;

            // Create notification for patient
            if (newStatus === 'confirmed' || newStatus === 'cancelled') {
                await createPatientNotification(
                    appointment.user_id, 
                    appointment.id, 
                    selectedDate, 
                    selectedTime, 
                    newStatus,
                    notes
                );
            }

            onUpdate(data);
            setShowConfirmModal(false);
        } catch (err) {
            console.error('Failed to update appointment:', err);
            alert('Erreur lors de la mise à jour du rendez-vous');
        } finally {
            setLoading(false);
        }
    };
    
    // Create notification for patient
    const createPatientNotification = async (userId, appointmentId, date, time, status, notes) => {
        try {
            let title, message, type;
            
            if (status === 'confirmed') {
                type = 'appointment_confirmed';
                title = 'Rendez-vous confirmé';
                message = `Votre rendez-vous a été confirmé pour le ${new Date(date).toLocaleDateString('fr-FR')} à ${time}`;
            } else if (status === 'cancelled') {
                type = 'appointment_cancelled';
                title = 'Rendez-vous refusé';
                message = notes 
                    ? `Votre demande de rendez-vous a été refusée. Motif: ${notes}`
                    : 'Votre demande de rendez-vous a été refusée par l\'hôpital';
            } else {
                return; // Pas de notification pour les autres statuts
            }
            
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: userId,
                    type: type,
                    title: title,
                    message: message,
                    appointment_id: appointmentId,
                    read: false,
                    created_at: new Date().toISOString()
                }]);
                
            if (error) {
                console.error('Supabase error creating notification:', error);
            } else {
                console.log('✅ Notification créée:', title);
            }
        } catch (err) {
            console.error('Failed to create notification:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-blue-100 text-dakar-emerald';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Détails du rendez-vous</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Statut</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                        </span>
                    </div>

                    {/* Patient Info */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <User className="w-5 h-5 text-dakar-emerald" />
                            <h3 className="font-semibold text-gray-900">Patient</h3>
                        </div>
                        <p className="text-gray-900 font-medium">{appointment.patient_name || 'Utilisateur inconnu'}</p>
                        {appointment.user_email && (
                            <p className="text-gray-500 text-sm">{appointment.user_email}</p>
                        )}
                        {appointment.user_phone && (
                            <p className="text-gray-500 text-sm">{appointment.user_phone}</p>
                        )}
                    </div>

                    {/* Hospital Info */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Building2 className="w-5 h-5 text-dakar-emerald" />
                            <h3 className="font-semibold text-gray-900">Hôpital</h3>
                        </div>
                        <p className="text-gray-900 font-medium">{appointment.hospital_name || 'Hôpital inconnu'}</p>
                    </div>

                    {/* Appointment Details - Show date/time if set, otherwise show assignment form for pending */}
                    {appointment.status === 'pending' ? (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-5 h-5 text-amber-600" />
                                <h3 className="font-semibold text-amber-900">Assigner le rendez-vous</h3>
                            </div>
                            <p className="text-sm text-amber-700 mb-4">
                                Cette demande n'a pas encore de date/heure assignée. Veuillez les définir avant de confirmer.
                            </p>
                            
                            {/* Date Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                <select
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="">Choisir une date...</option>
                                    {availableDates.map((date) => (
                                        <option key={date.value} value={date.value}>
                                            {date.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Time Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableTimes.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-2 text-sm rounded-lg border transition-all ${
                                                selectedTime === time
                                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Doctor Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Médecin / Praticien</label>
                                <input
                                    type="text"
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    placeholder="Nom du médecin (optionnel)"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-dakar-emerald" />
                                    <h3 className="font-semibold text-gray-900">Date</h3>
                                </div>
                                <p className="text-gray-900">
                                    {appointment.appointment_date 
                                        ? new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'Non définie'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-dakar-emerald" />
                                    <h3 className="font-semibold text-gray-900">Heure</h3>
                                </div>
                                <p className="text-gray-900">{appointment.appointment_time || 'Non définie'}</p>
                            </div>
                        </div>
                    )}

                    {/* Specialty */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Stethoscope className="w-5 h-5 text-dakar-emerald" />
                            <h3 className="font-semibold text-gray-900">Spécialité / Service</h3>
                        </div>
                        <p className="text-gray-900">{appointment.specialty || 'Non spécifié'}</p>
                        {appointment.doctor_name && (
                            <p className="text-gray-500 text-sm mt-1">{appointment.doctor_name}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <MessageSquare className="w-5 h-5 text-dakar-emerald" />
                            <h3 className="font-semibold text-gray-900">Notes / Message au patient</h3>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ajouter des notes ou un message pour le patient..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Actions */}
                {appointment.status === 'pending' && (
                    <div className="p-6 border-t border-gray-100 flex gap-3">
                        <button
                            onClick={() => {
                                setAction('cancel');
                                setShowConfirmModal(true);
                            }}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-5 h-5" />
                            Refuser
                        </button>
                        <button
                            onClick={() => {
                                setAction('confirm');
                                setShowConfirmModal(true);
                            }}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dakar-emerald text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Confirmer
                        </button>
                    </div>
                )}

                {appointment.status !== 'pending' && (
                    <div className="p-6 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {action === 'confirm' ? 'Confirmer le rendez-vous ?' : 'Refuser le rendez-vous ?'}
                        </h3>
                        
                        {action === 'confirm' && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                                <p className="text-sm text-emerald-800 font-medium mb-2">Détails du rendez-vous :</p>
                                <div className="space-y-1 text-sm text-emerald-700">
                                    <p><strong>Date :</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Non sélectionnée'}</p>
                                    <p><strong>Heure :</strong> {selectedTime || 'Non sélectionnée'}</p>
                                    {selectedDoctor && <p><strong>Médecin :</strong> {selectedDoctor}</p>}
                                </div>
                            </div>
                        )}
                        
                        <p className="text-gray-600 mb-6">
                            {action === 'confirm' 
                                ? 'Le patient recevra une notification avec la date et l\'heure confirmées.' 
                                : 'Le patient recevra une notification de refus.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleStatusChange(action === 'confirm' ? 'confirmed' : 'cancelled')}
                                disabled={loading}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                                    action === 'confirm'
                                        ? 'bg-dakar-emerald text-white hover:bg-blue-600'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                            >
                                {loading ? 'Chargement...' : (action === 'confirm' ? 'Confirmer' : 'Refuser')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentDetailModal;
