import React, { useState, useEffect } from 'react';
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Droplets,
    Activity,
    ChevronLeft,
    Home as HomeIcon,
    Calendar as CalendarIcon,
    User as UserIcon,
    Edit3,
    Check,
    LogOut,
    Loader2,
    HeartPulse
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({});

    // Initialize form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
                sex: user.sex || '',
                age: user.age || '',
                birth_date: user.birth_date || '',
                birth_place: user.birth_place || '',
                residence: user.residence || '',
                blood_group: user.blood_group || '',
                chronic_diseases: user.chronic_diseases || ''
            });
        }
    }, [user]);

    // Si l'utilisateur n'est pas connecté
    if (!user) {
        return (
            <div className="flex flex-col min-h-screen bg-white pb-24">
                <header className="px-6 pt-8 pb-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-soft-gray flex items-center justify-center active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-6 h-6 text-deep-charcoal" />
                    </button>
                    <h1 className="text-xl font-bold text-deep-charcoal">Mon Profil</h1>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                    <div className="w-24 h-24 rounded-[36px] bg-emerald-50 flex items-center justify-center mb-6 border-2 border-emerald-100">
                        <User className="w-12 h-12 text-dakar-emerald" />
                    </div>
                    <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Bienvenue sur FAJU</h2>
                    <p className="text-sm text-gray-400 mb-8 max-w-[280px]">
                        Créez votre compte pour accéder à votre profil santé et gérer votre dossier médical.
                    </p>
                    <Link
                        to="/register"
                        className="w-full max-w-[300px] h-14 bg-dakar-emerald text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-emerald-200 active:scale-95 transition-transform mb-4"
                    >
                        Créer un compte
                    </Link>
                    <Link
                        to="/login"
                        className="w-full max-w-[300px] h-14 bg-soft-gray text-deep-charcoal rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
                    >
                        J'ai déjà un compte
                    </Link>
                </div>

                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto z-50">
                    <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <HomeIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Accueil</span>
                    </Link>
                    <Link to="/flashdashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <CalendarIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Mes RDV</span>
                    </Link>
                    <Link to="/health-record" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <HeartPulse className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Carnet</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-1 text-dakar-emerald">
                        <UserIcon className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Profil</span>
                    </Link>
                </nav>
            </div>
        );
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Convert age to number if it's a string
            const dataToSave = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : null
            };

            const result = await updateProfile(dataToSave);
            if (result.success) {
                setIsEditing(false);
            } else {
                alert('Erreur: ' + (result.error || 'Échec de la mise à jour'));
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
            logout();
            navigate('/');
        }
    };

    const InfoItem = ({ icon: Icon, label, value, name, type = "text", color = "bg-emerald-50 text-dakar-emerald" }) => (
        <div className="flex items-center gap-4 p-4 bg-soft-gray rounded-[24px] transition-all hover:bg-gray-100 group">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
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
                        placeholder="Renseigner..."
                    />
                ) : (
                    <p className="text-sm font-bold text-deep-charcoal">{value || "Non renseigné"}</p>
                )}
            </div>
        </div>
    );

    const initial = (user.full_name || 'U').charAt(0).toUpperCase();

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
                    <h1 className="text-xl font-bold text-deep-charcoal">Mon Profil Santé</h1>
                </div>
                <button
                    disabled={isSaving}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-md ${isEditing ? 'bg-dakar-emerald text-white' : 'bg-white text-deep-charcoal border border-gray-100'}`}
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? <Check className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />)}
                </button>
            </header>

            {/* Profile Hero */}
            <div className="px-6 py-6 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-[40px] bg-dakar-emerald flex items-center justify-center text-white font-black text-4xl border-4 border-emerald-50 shadow-2xl shadow-emerald-200">
                        {initial}
                    </div>
                </div>

                {isEditing ? (
                    <input
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="bg-transparent border-b-2 border-dakar-emerald text-2xl font-black text-center outline-none px-4 py-1 text-deep-charcoal"
                        placeholder="Votre nom complet"
                    />
                ) : (
                    <h2 className="text-2xl font-black text-deep-charcoal tracking-tight uppercase">{user.full_name}</h2>
                )}
                <p className="text-xs text-gray-400 font-black tracking-widest mt-1 opacity-60">ID SANTÉ: #SN-8829-X</p>
            </div>

            {/* Info Sections */}
            <div className="px-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={User} label="Sexe" value={user.sex} name="sex" color="bg-blue-50 text-blue-500" />
                    <InfoItem icon={Calendar} label="Âge" value={user.age} name="age" type="number" color="bg-orange-50 text-orange-500" />
                </div>

                <section>
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <div className="w-1 h-4 bg-dakar-emerald rounded-full"></div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Coordonnées personnelles</h3>
                    </div>
                    <div className="space-y-3">
                        <InfoItem icon={Calendar} label="Date Naissance" value={user.birth_date} name="birth_date" type="date" />
                        <InfoItem icon={MapPin} label="Lieu Naissance" value={user.birth_place} name="birth_place" />
                        <InfoItem icon={Phone} label="Téléphone" value={user.phone} name="phone" />
                        <InfoItem icon={MapPin} label="Résidence" value={user.residence} name="residence" />
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Informations Médicales</h3>
                    </div>
                    <div className="space-y-3">
                        <InfoItem icon={Droplets} label="Groupe Sanguin" value={user.blood_group} name="blood_group" color="bg-red-50 text-red-500" />
                        <InfoItem icon={Activity} label="Maladies Chroniques" value={user.chronic_diseases} name="chronic_diseases" color="bg-purple-50 text-purple-500" />
                    </div>
                </section>

                <div className="pt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full h-16 bg-red-50 text-red-600 rounded-[28px] font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        Déconnexion sécurisée
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-6 font-medium opacity-50">Version 1.0.0 • FAJU Sénégal</p>
                </div>
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
                <Link to="/health-record" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <HeartPulse className="w-6 h-6" />
                    <span className="text-[10px] font-medium uppercase tracking-tighter">Carnet</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-dakar-emerald">
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default Profile;
