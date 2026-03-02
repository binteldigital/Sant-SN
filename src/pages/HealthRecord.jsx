import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    User,
    Calendar,
    MapPin,
    Phone,
    Droplets,
    Activity,
    Syringe,
    FileText,
    QrCode,
    Edit3,
    Check,
    Loader2,
    Plus,
    Trash2,
    Home as HomeIcon,
    Calendar as CalendarIcon,
    User as UserIcon,
    Heart,
    HeartPulse
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

const HealthRecord = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [healthRecord, setHealthRecord] = useState(null);
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [formData, setFormData] = useState({});
    const [newVaccine, setNewVaccine] = useState({
        vaccine_name: '',
        dose: '',
        administration_date: '',
        lot_number: '',
        health_center: '',
        health_agent: ''
    });

    useEffect(() => {
        if (user) {
            fetchHealthRecord();
        }
    }, [user]);

    const fetchHealthRecord = async () => {
        try {
            setLoading(true);
            
            // Récupérer ou créer le carnet de santé
            let { data: record, error } = await supabase
                .from('health_records')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (error && error.code === 'PGRST116') {
                // Créer un nouveau carnet si inexistant
                const { data: newRecord, error: createError } = await supabase
                    .from('health_records')
                    .insert({
                        user_id: user.id,
                        first_name: user.full_name?.split(' ')[0] || '',
                        last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
                        phone: user.phone || '',
                        birth_date: user.birth_date || null,
                        birth_place: user.birth_place || '',
                        sex: user.sex || '',
                        address: user.residence || '',
                        blood_group: user.blood_group || ''
                    })
                    .select()
                    .single();
                
                if (createError) throw createError;
                record = newRecord;
            } else if (error) {
                throw error;
            }
            
            setHealthRecord(record);
            setFormData(record || {});
            
            // Récupérer les vaccinations
            if (record) {
                const { data: vaccs } = await supabase
                    .from('vaccinations')
                    .select('*')
                    .eq('health_record_id', record.id)
                    .order('administration_date', { ascending: false });
                
                setVaccinations(vaccs || []);
            }
        } catch (err) {
            console.error('Error fetching health record:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Préparer les données à sauvegarder
            const dataToSave = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                birth_date: formData.birth_date,
                birth_place: formData.birth_place,
                sex: formData.sex,
                parent_guardian: formData.parent_guardian,
                address: formData.address,
                phone: formData.phone,
                health_id_number: formData.health_id_number,
                personal_history: formData.personal_history,
                family_history: formData.family_history,
                allergies: formData.allergies,
                blood_group: formData.blood_group,
                chronic_diseases: formData.chronic_diseases,
                reference_health_center: formData.reference_health_center,
                health_region: formData.health_region,
                status: formData.status || 'actif'
            };
            
            console.log('💾 Sauvegarde des données:', dataToSave);
            console.log('📝 Health Record:', healthRecord);
            
            let recordId = healthRecord?.id;
            
            // Si pas de healthRecord, on le crée d'abord
            if (!recordId) {
                console.log('🆕 Création d\'un nouveau carnet de santé...');
                // Générer un short_id unique de 6 caractères
                const generateShortId = () => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let result = '';
                    for (let i = 0; i < 6; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return result;
                };
                
                const shortId = generateShortId();
                console.log('🆕 Short ID généré:', shortId);
                
                const { data: newRecord, error: createError } = await supabase
                    .from('health_records')
                    .insert({
                        user_id: user.id,
                        short_id: shortId,
                        ...dataToSave
                    })
                    .select()
                    .single();
                
                if (createError) {
                    console.error('❌ Erreur création carnet:', createError);
                    throw createError;
                }
                
                recordId = newRecord.id;
                setHealthRecord(newRecord);
                console.log('✅ Carnet créé avec ID:', recordId);
            } else {
                // Mettre à jour le carnet existant
                const { error } = await supabase
                    .from('health_records')
                    .update(dataToSave)
                    .eq('id', recordId);
                
                if (error) {
                    console.error('❌ Erreur Supabase:', error);
                    throw error;
                }
            }
            
            // Mettre à jour aussi le profil utilisateur
            const { error: userError } = await supabase
                .from('users')
                .update({
                    full_name: `${dataToSave.first_name || ''} ${dataToSave.last_name || ''}`.trim(),
                    phone: dataToSave.phone,
                    birth_date: dataToSave.birth_date,
                    birth_place: dataToSave.birth_place,
                    sex: dataToSave.sex,
                    residence: dataToSave.address,
                    blood_group: dataToSave.blood_group
                })
                .eq('id', user.id);
            
            if (userError) {
                console.error('❌ Erreur mise à jour user:', userError);
            }
            
            setIsEditing(false);
            await fetchHealthRecord();
            alert('Sauvegarde réussie !');
        } catch (error) {
            console.error('❌ Save failed:', error);
            alert('Erreur lors de la sauvegarde: ' + (error.message || 'Échec de la mise à jour'));
        } finally {
            setIsSaving(false);
        }
    };

    const addVaccination = async () => {
        if (!newVaccine.vaccine_name) return;
        
        try {
            const { error } = await supabase
                .from('vaccinations')
                .insert({
                    health_record_id: healthRecord.id,
                    ...newVaccine
                });
            
            if (error) throw error;
            
            setNewVaccine({
                vaccine_name: '',
                dose: '',
                administration_date: '',
                lot_number: '',
                health_center: '',
                health_agent: ''
            });
            
            fetchHealthRecord();
        } catch (err) {
            console.error('Error adding vaccination:', err);
        }
    };

    const deleteVaccination = async (id) => {
        if (!confirm('Supprimer cette vaccination ?')) return;
        
        try {
            await supabase.from('vaccinations').delete().eq('id', id);
            fetchHealthRecord();
        } catch (err) {
            console.error('Error deleting vaccination:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-white items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-dakar-emerald" />
            </div>
        );
    }

    const InfoItem = ({ icon: Icon, label, value, name, type = "text", color = "bg-emerald-50 text-dakar-emerald" }) => (
        <div className="flex items-center gap-4 p-4 bg-soft-gray rounded-[24px]">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                {isEditing ? (
                    <input
                        type={type}
                        name={name}
                        value={formData[name] || ''}
                        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-dakar-emerald/20 focus:border-dakar-emerald outline-none text-sm font-bold text-deep-charcoal py-1"
                    />
                ) : (
                    <p className="text-sm font-bold text-deep-charcoal">{value || "Non renseigné"}</p>
                )}
            </div>
        </div>
    );

    const SectionTitle = ({ icon: Icon, title, color = "bg-dakar-emerald" }) => (
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">{title}</h3>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-white pb-32">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-soft-gray flex items-center justify-center active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-6 h-6 text-deep-charcoal" />
                    </button>
                    <h1 className="text-xl font-bold text-deep-charcoal">Mon Carnet de Santé</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center active:scale-95 transition-all"
                    >
                        <QrCode className="w-5 h-5" />
                    </button>
                    <button
                        disabled={isSaving}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-md ${isEditing ? 'bg-dakar-emerald text-white' : 'bg-white text-deep-charcoal border border-gray-100'}`}
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? <Check className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />)}
                    </button>
                </div>
            </header>

            {/* QR Code Modal */}
            {showQR && healthRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-deep-charcoal">Mon QR Code Santé</h2>
                            <button onClick={() => setShowQR(false)} className="text-gray-400">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-dakar-emerald/20">
                                <QRCodeSVG 
                                    value={healthRecord.qr_code_token} 
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            
                            {/* Identifiant court */}
                            <div className="mt-4 bg-dakar-emerald/10 rounded-xl p-4 w-full">
                                <p className="text-xs text-gray-500 text-center mb-2">
                                    Code d'accès rapide (6 caractères)
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-black text-dakar-emerald tracking-widest font-mono">
                                        {healthRecord.short_id || '------'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center mt-2">
                                    Donnez ce code à votre professionnel de santé
                                </p>
                            </div>
                            
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Ou présentez le QR code pour accès automatique
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="px-6 space-y-8">
                {/* ID Card */}
                <div className="bg-gradient-to-br from-dakar-emerald to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Heart className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Carnet de Santé Numérique</h2>
                            <p className="text-emerald-100 text-sm">République du Sénégal</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-2xl font-black">{healthRecord?.last_name} {healthRecord?.first_name}</p>
                        <p className="text-emerald-100 text-sm">
                            Né(e) le {healthRecord?.birth_date ? new Date(healthRecord.birth_date).toLocaleDateString('fr-FR') : '---'}
                        </p>
                        <p className="text-emerald-100 text-sm">à {healthRecord?.birth_place || '---'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                        <span className="text-xs text-emerald-100">ID Santé</span>
                        <span className="font-mono text-sm">#{healthRecord?.qr_code_token?.substring(0, 8).toUpperCase()}</span>
                    </div>
                </div>

                {/* Identity Section */}
                <section>
                    <SectionTitle icon={User} title="Identité" />
                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem icon={User} label="Nom" value={healthRecord?.last_name} name="last_name" />
                        <InfoItem icon={User} label="Prénom" value={healthRecord?.first_name} name="first_name" />
                        <InfoItem icon={Calendar} label="Date de naissance" value={healthRecord?.birth_date} name="birth_date" type="date" />
                        <InfoItem icon={MapPin} label="Lieu de naissance" value={healthRecord?.birth_place} name="birth_place" />
                        <InfoItem icon={User} label="Sexe" value={healthRecord?.sex} name="sex" />
                        <InfoItem icon={Phone} label="Téléphone" value={healthRecord?.phone} name="phone" />
                    </div>
                    <div className="mt-3">
                        <InfoItem icon={MapPin} label="Adresse" value={healthRecord?.address} name="address" />
                    </div>
                </section>

                {/* Medical History */}
                <section>
                    <SectionTitle icon={Activity} title="Antécédents Médicaux" color="bg-red-500" />
                    <div className="space-y-3">
                        <InfoItem icon={FileText} label="Antécédents personnels" value={healthRecord?.personal_history} name="personal_history" color="bg-red-50 text-red-500" />
                        <InfoItem icon={FileText} label="Antécédents familiaux" value={healthRecord?.family_history} name="family_history" color="bg-red-50 text-red-500" />
                        <InfoItem icon={Activity} label="Allergies" value={healthRecord?.allergies} name="allergies" color="bg-orange-50 text-orange-500" />
                        <div className="grid grid-cols-2 gap-3">
                            <InfoItem icon={Droplets} label="Groupe sanguin" value={healthRecord?.blood_group} name="blood_group" color="bg-red-50 text-red-500" />
                            <InfoItem icon={Activity} label="Maladies chroniques" value={healthRecord?.chronic_diseases} name="chronic_diseases" color="bg-purple-50 text-purple-500" />
                        </div>
                    </div>
                </section>

                {/* Vaccinations */}
                <section>
                    <SectionTitle icon={Syringe} title="Vaccinations" color="bg-blue-500" />
                    
                    {isEditing && (
                        <div className="bg-blue-50 rounded-2xl p-4 mb-4 space-y-3">
                            <p className="text-sm font-bold text-blue-700">Ajouter une vaccination</p>
                            <input
                                placeholder="Nom du vaccin"
                                value={newVaccine.vaccine_name}
                                onChange={(e) => setNewVaccine({...newVaccine, vaccine_name: e.target.value})}
                                className="w-full p-2 rounded-lg border border-blue-200 text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="Dose"
                                    value={newVaccine.dose}
                                    onChange={(e) => setNewVaccine({...newVaccine, dose: e.target.value})}
                                    className="p-2 rounded-lg border border-blue-200 text-sm"
                                />
                                <input
                                    type="date"
                                    placeholder="Date"
                                    value={newVaccine.administration_date}
                                    onChange={(e) => setNewVaccine({...newVaccine, administration_date: e.target.value})}
                                    className="p-2 rounded-lg border border-blue-200 text-sm"
                                />
                            </div>
                            <input
                                placeholder="Centre de santé"
                                value={newVaccine.health_center}
                                onChange={(e) => setNewVaccine({...newVaccine, health_center: e.target.value})}
                                className="w-full p-2 rounded-lg border border-blue-200 text-sm"
                            />
                            <button
                                onClick={addVaccination}
                                className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Ajouter
                            </button>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        {vaccinations.length === 0 ? (
                            <p className="text-gray-400 text-center py-4 text-sm">Aucune vaccination enregistrée</p>
                        ) : (
                            vaccinations.map((vacc) => (
                                <div key={vacc.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-deep-charcoal">{vacc.vaccine_name}</p>
                                            <p className="text-sm text-gray-500">{vacc.dose} • {vacc.administration_date ? new Date(vacc.administration_date).toLocaleDateString('fr-FR') : '---'}</p>
                                            <p className="text-xs text-gray-400 mt-1">{vacc.health_center}</p>
                                        </div>
                                        {isEditing && (
                                            <button
                                                onClick={() => deleteVaccination(vacc.id)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Admin Info */}
                <section>
                    <SectionTitle icon={MapPin} title="Informations Administratives" color="bg-gray-500" />
                    <div className="space-y-3">
                        <InfoItem icon={MapPin} label="Centre de santé de référence" value={healthRecord?.reference_health_center} name="reference_health_center" color="bg-gray-50 text-gray-600" />
                        <InfoItem icon={MapPin} label="Région sanitaire" value={healthRecord?.health_region} name="health_region" color="bg-gray-50 text-gray-600" />
                    </div>
                </section>
            </div>

            {/* Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto z-50">
                <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium uppercase tracking-tighter">Accueil</span>
                </Link>
                <Link to="/flashdashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <CalendarIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium uppercase tracking-tighter">Mes RDV</span>
                </Link>
                <Link to="/health-record" className="flex flex-col items-center gap-1 text-dakar-emerald">
                    <Heart className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Carnet</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium uppercase tracking-tighter">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default HealthRecord;
