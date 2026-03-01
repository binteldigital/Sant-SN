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
                <h1 className="text-2xl font-bold text-deep-charcoal mb-2">Rendez-vous Confirmé !</h1>
                <p className="text-gray-500 mb-8 max-w-xs">
                    Votre consultation en {selectedService?.name} a été enregistrée pour le {selectedDate?.full} à {selectedTime}.
                </p>
                <div className="w-full bg-soft-gray p-4 rounded-2xl mb-8 border border-gray-100 italic">
                    <p className="text-xs text-gray-500 mb-1">Un SMS de confirmation a été envoyé au :</p>
                    <p className="text-sm font-bold text-deep-charcoal">+221 77 ••• •• 45</p>
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
                        <h2 className="text-lg font-bold text-deep-charcoal mb-6">Date et Heure</h2>

                        {/* Calendar */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-8">
                            {dates.map((d, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedDate(d)}
                                    className={`flex flex-col items-center gap-2 min-w-[64px] py-4 rounded-3xl border-2 transition-all cursor-pointer ${selectedDate?.day === d.day ? 'border-dakar-emerald bg-dakar-emerald text-white shadow-lg shadow-emerald-100' : 'border-gray-50 bg-white text-gray-500'}`}
                                >
                                    <span className={`text-[10px] font-bold uppercase ${selectedDate?.day === d.day ? 'text-white/80' : 'text-gray-400'}`}>{d.label}</span>
                                    <span className="text-lg font-bold">{d.day}</span>
                                </div>
                            ))}
                        </div>

                        {/* Time Grid */}
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Créneaux disponibles</h3>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {times.map((t, i) => (
                                <button
                                    key={i}
                                    disabled={i > 5} // Mock some unavailable slots
                                    onClick={() => setSelectedTime(t)}
                                    className={`py-3 rounded-2xl text-sm font-bold transition-all ${i > 5 ? 'bg-gray-50 text-gray-300 border border-gray-100 line-through' : selectedTime === t ? 'bg-deep-charcoal text-white shadow-lg' : 'bg-soft-gray text-deep-charcoal border border-transparent active:scale-95'}`}
                                >
                                    {t}
                                </button>
                            ))}
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
                        Choisir Heure
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-soft-gray flex items-center justify-center text-[10px] font-bold">
                                    {selectedService?.icon}
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-deep-charcoal">{selectedService?.name}</p>
                                    <p className="text-gray-400">{selectedDate?.full || 'Non choisi'} à {selectedTime || '--:--'}</p>
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} className="text-[10px] font-bold text-dakar-emerald underline uppercase">Modifier</button>
                        </div>
                        <button
                            disabled={!selectedDate || !selectedTime || isSubmitting}
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
                                            appointment_date: selectedDate.isoDate,
                                            appointment_time: selectedTime,
                                            status: 'pending', // Reset status to pending for modified appointments
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
                                                            date: selectedDate.full,
                                                            time: selectedTime,
                                                            status: 'pending'
                                                        };
                                                        localStorage.setItem('sunu_sante_appointments', JSON.stringify(appointments));
                                                    }
                                                }
                                            } catch (e) {
                                                console.error('Error updating local appointments:', e);
                                            }
                                        }

                                        alert('Rendez-vous modifié avec succès!');
                                    } else {
                                        // Create new appointment
                                        const newAppointment = {
                                            user_id: user.id,
                                            hospital_id: hospitalId,
                                            hospital_name: hospital?.name || 'Hôpital',
                                            user_name: user?.full_name || user?.email || 'Patient',
                                            doctor_name: `Service ${selectedService.name}`,
                                            specialty: selectedService.name,
                                            appointment_date: selectedDate.isoDate,
                                            appointment_time: selectedTime,
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
                                            date: selectedDate.full,
                                            time: selectedTime,
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
                                    console.error('Error processing appointment:', err);
                                    alert('Erreur lors de la modification du rendez-vous. Veuillez réessayer.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${selectedDate && selectedTime && !isSubmitting ? 'bg-dakar-emerald text-white shadow-lg shadow-emerald-100 active:scale-95' : 'bg-gray-100 text-gray-400'}`}
                        >
                            {isSubmitting ? 'Création...' : 'Confirmer rendez-vous'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;
