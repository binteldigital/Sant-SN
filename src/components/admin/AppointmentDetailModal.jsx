import React, { useState } from 'react';
import { X, Calendar, Clock, User, Building2, Stethoscope, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AppointmentDetailModal = ({ appointment, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState(appointment?.notes || '');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [action, setAction] = useState(null); // 'confirm' or 'cancel'

    if (!appointment) return null;

    const handleStatusChange = async (newStatus) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({ 
                    status: newStatus,
                    notes: notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', appointment.id)
                .select()
                .single();

            if (error) throw error;

            // TODO: Send notification to patient
            // For now, just log it
            console.log(`Appointment ${newStatus} - Patient should be notified`);

            onUpdate(data);
            setShowConfirmModal(false);
        } catch (err) {
            console.error('Failed to update appointment:', err);
            alert('Erreur lors de la mise à jour du rendez-vous');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700';
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
                            <User className="w-5 h-5 text-emerald-600" />
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
                            <Building2 className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-semibold text-gray-900">Hôpital</h3>
                        </div>
                        <p className="text-gray-900 font-medium">{appointment.hospital_name || 'Hôpital inconnu'}</p>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-semibold text-gray-900">Date</h3>
                            </div>
                            <p className="text-gray-900">
                                {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-semibold text-gray-900">Heure</h3>
                            </div>
                            <p className="text-gray-900">{appointment.appointment_time}</p>
                        </div>
                    </div>

                    {/* Specialty */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Stethoscope className="w-5 h-5 text-emerald-600" />
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
                            <MessageSquare className="w-5 h-5 text-emerald-600" />
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
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
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
                        <p className="text-gray-600 mb-6">
                            {action === 'confirm' 
                                ? 'Le patient recevra une notification de confirmation.' 
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
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
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
