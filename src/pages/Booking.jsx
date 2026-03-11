import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
    const { hospitalId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editAppointmentId = searchParams.get('edit');
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [hospital, setHospital] = useState(null);
    const [loadingHospital, setLoadingHospital] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const services = [
        { id: 1, name: 'Cardiologie', icon: '❤️', description: 'Consultation spécialisée du cœur' },
        { id: 2, name: 'Pédiatrie', icon: '👶', description: 'Soins pour enfants et nourrissons' },
        { id: 3, name: 'Gynécologie', icon: '👩‍⚕️', description: 'Santé de la femme et maternité' },
        { id: 4, name: 'Urgences', icon: '🚨', description: 'Prise en charge immédiate 24/7' },
    ];

    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate dynamic dates (next 5 days)
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                label: days[date.getDay()],
                day: date.getDate().toString(),
                full: `${date.getDate()} ${months[date.getMonth()]}`,
                isoDate: date.toISOString().split('T')[0],
                active: i === 0
            });
        }
        return dates;
    };

    const dates = generateDates();
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];

    // Fetch hospital data and appointment if in edit mode
    useEffect(() => {
        const fetchData = async () => {
            setLoadingHospital(true);
            
            try {
                // Fetch hospital data
                if (hospitalId) {
                    const { data: hospitalData, error: hospitalError } = await supabase
                        .from('hospitals')
                        .select('*')
                        .eq('id', hospitalId)
                        .single();
                    
                    if (hospitalError) throw hospitalError;
                    setHospital(hospitalData);
                }
                
                // If in edit mode, fetch the appointment data
                if (editAppointmentId) {
                    const { data: appointmentData, error: appointmentError } = await supabase
                        .from('appointments')
                        .select('*')
                        .eq('id', editAppointmentId)
                        .single();
                    
                    if (appointmentError) throw appointmentError;
                    
                    setEditingAppointment(appointmentData);
                    setStep(1); // Start from the beginning
                    
                    // Pre-fill the form with appointment data
                    if (appointmentData) {
                        setSelectedService({ id: appointmentData.service_id, name: appointmentData.specialty });
                        setSelectedDate(dates.find(d => d.isoDate === new Date(appointmentData.appointment_date).toISOString().split('T')[0]));
                        setSelectedTime(appointmentData.appointment_time);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoadingHospital(false);
            }
        };

        fetchData();
    }, [hospitalId, editAppointmentId]);

    if (step === 3) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-dakar-emerald" />
                </div>
                <h1 className="text-2xl font-bold text-deep-charcoal mb-2">Demande Envoyée !</h1>
                <p className="text-gray-500 mb-8 max-w-xs">
                    Votre demande de consultation en <strong>{selectedService?.name}</strong> a été envoyée à {hospital?.name}. 
                    Vous recevrez une notification dès que l'hôpital aura fixé votre rendez-vous.
                </p>
                <div className="w-full bg-soft-gray p-4 rounded-2xl mb-8 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Statut de votre demande :</p>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        En attente de confirmation
                    </span>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full h-14 bg-dakar-emerald text-white rounded-2xl font-bold shadow-lg shadow-emerald-200"
                >
                    Voir mes rendez-vous
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white pb-32">
            {/* Header */}
            <header className="px-6 py-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-gray-50">
                <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 rounded-full hover:bg-soft-gray transition-colors">
                    <ChevronLeft className="w-6 h-6 text-deep-charcoal" />
                </button>
                <div>
                    <h1 className="font-bold text-deep-charcoal">Prendre rendez-vous</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Étape {step} sur 2</p>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="flex px-6 h-1 gap-2 mt-4">
                <div className={`flex-1 rounded-full ${step >= 1 ? 'bg-dakar-emerald' : 'bg-gray-100'}`}></div>
                <div className={`flex-1 rounded-full ${step >= 2 ? 'bg-dakar-emerald' : 'bg-gray-100'}`}></div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-6 py-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-deep-charcoal">Choisir un service</h2>
                        </div>

                        <div className="space-y-4">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${selectedService?.id === service.id ? 'border-dakar-emerald bg-emerald-50/30' : 'border-gray-50 bg-white hover:border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-gray-50">
                                            {service.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-deep-charcoal">{service.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{service.description}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedService?.id === service.id ? 'border-dakar-emerald bg-dakar-emerald' : 'border-gray-200'}`}>
                                            {selectedService?.id === service.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-6 py-4"
                    >
                        <h2 className="text-lg font-bold text-deep-charcoal mb-6">Confirmer votre demande</h2>

                        {/* Récapitulatif */}
                        <div className="bg-soft-gray rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-gray-50">
                                    {selectedService?.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Service demandé</p>
                                    <h3 className="font-bold text-deep-charcoal text-lg">{selectedService?.name}</h3>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs text-gray-400 font-medium uppercase mb-2">Hôpital</p>
                                <p className="font-medium text-deep-charcoal">{hospital?.name || 'Hôpital'}</p>
                                <p className="text-sm text-gray-500">{hospital?.address}</p>
                            </div>
                        </div>

                        {/* Info message */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-blue-900 text-sm">Comment ça marche ?</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        L'hôpital recevra votre demande et vous proposera une date et un créneau horaire. 
                                        Vous recevrez une notification dès que votre rendez-vous sera confirmé.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-gray-100 max-w-[440px] mx-auto z-20">
                {step === 1 ? (
                    <button
                        disabled={!selectedService}
                        onClick={() => setStep(2)}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${selectedService ? 'bg-dakar-emerald text-white shadow-lg shadow-emerald-100 active:scale-95' : 'bg-gray-100 text-gray-400'}`}
                    >
                        Continuer
                    </button>
                ) : (
                    <div className="space-y-3">
                        <button
                            disabled={isSubmitting}
                            onClick={async () => {
                                if (!user) {
                                    alert('Veuillez vous connecter pour prendre un rendez-vous');
                                    navigate('/login');
                                    return;
                                }

                                setIsSubmitting(true);

                                try {
                                    if (editAppointmentId) {
                                        // Update existing appointment
                                        const updatedAppointment = {
                                            hospital_id: hospitalId,
                                            hospital_name: hospital?.name || 'Hôpital',
                                            user_name: user?.full_name || user?.email || 'Patient',
                                            doctor_name: `Service ${selectedService.name}`,
                                            specialty: selectedService.name,
                                            status: 'pending',
                                            updated_at: new Date().toISOString()
                                        };

                                        const { data, error } = await supabase
                                            .from('appointments')
                                            .update(updatedAppointment)
                                            .eq('id', editAppointmentId)
                                            .select()
                                            .single();

                                        if (error) throw error;

                                        // Also update localStorage for backward compatibility
                                        const savedData = localStorage.getItem('sunu_sante_appointments');
                                        if (savedData) {
                                            try {
                                                let appointments = JSON.parse(savedData);
                                                if (Array.isArray(appointments)) {
                                                    const appointmentIndex = appointments.findIndex(apt => apt.id === editAppointmentId);
                                                    if (appointmentIndex !== -1) {
                                                        appointments[appointmentIndex] = {
                                                            ...appointments[appointmentIndex],
                                                            hospital: hospital?.name || 'Hôpital',
                                                            doctor: updatedAppointment.doctor_name,
                                                            specialty: updatedAppointment.specialty,
                                                            status: 'pending'
                                                        };
                                                        localStorage.setItem('sunu_sante_appointments', JSON.stringify(appointments));
                                                    }
                                                }
                                            } catch (e) {
                                                console.error('Error updating local appointments:', e);
                                            }
                                        }

                                        alert('Demande modifiée avec succès!');
                                    } else {
                                        // Create new appointment request (without date/time - hospital will assign)
                                        const newAppointment = {
                                            user_id: user.id,
                                            hospital_id: hospitalId,
                                            hospital_name: hospital?.name || 'Hôpital',
                                            user_name: user?.full_name || user?.email || 'Patient',
                                            doctor_name: `Service ${selectedService.name}`,
                                            specialty: selectedService.name,
                                            status: 'pending',
                                            notes: ''
                                        };

                                        const { data, error } = await supabase
                                            .from('appointments')
                                            .insert([newAppointment])
                                            .select()
                                            .single();

                                        if (error) throw error;

                                        // Also save to localStorage for backward compatibility
                                        const localAppointment = {
                                            id: data.id,
                                            hospital: hospital?.name || 'Hôpital',
                                            doctor: newAppointment.doctor_name,
                                            specialty: newAppointment.specialty,
                                            status: 'pending'
                                        };
                                        
                                        const savedData = localStorage.getItem('sunu_sante_appointments');
                                        let appointments = [];
                                        if (savedData) {
                                            try {
                                                appointments = JSON.parse(savedData);
                                                if (!Array.isArray(appointments)) appointments = [];
                                            } catch (e) {
                                                appointments = [];
                                            }
                                        }
                                        appointments.unshift(localAppointment);
                                        localStorage.setItem('sunu_sante_appointments', JSON.stringify(appointments));
                                    }

                                    setStep(3);
                                } catch (err) {
                                    console.error('Error saving appointment:', err);
                                    alert('Erreur lors de l\'enregistrement de la demande. Veuillez réessayer.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${!isSubmitting ? 'bg-dakar-emerald text-white shadow-lg shadow-emerald-100 active:scale-95' : 'bg-gray-100 text-gray-400'}`}
                        >
                            {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                        </button>
                        <button
                            onClick={() => setStep(1)}
                            className="w-full h-12 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Modifier le service
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;
