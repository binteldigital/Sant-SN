import React, { useState } from 'react';
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
    LogOut
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(user || {});

    // Si l'utilisateur n'est pas connecté, afficher un écran d'inscription
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
                    <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Bienvenue sur Sunu Santé</h2>
                    <p className="text-sm text-gray-400 mb-8 max-w-[280px]">
                        Créez votre compte pour accéder à votre profil santé, prendre des rendez-vous et gérer votre dossier médical.
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

                {/* Bottom Tabs */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto z-50">
                    <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <HomeIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Accueil</span>
                    </Link>
                    <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                        <CalendarIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Mes RDV</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-1 text-dakar-emerald">
                        <UserIcon className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Profil</span>
                    </Link>
                </nav>
            </div>
        );
    }

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleLogout = () => {
        if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
            logout();
            navigate('/');
        }
    };

    const InfoItem = ({ icon: Icon, label, value, name, color = "bg-emerald-50 text-dakar-emerald" }) => (
        <div className="flex items-center gap-4 p-4 bg-soft-gray rounded-[24px] transition-all hover:bg-gray-100">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                {isEditing ? (
                    <input
                        name={name}
                        value={formData[name]}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        className="w-full bg-white border-b border-dakar-emerald/30 focus:border-dakar-emerald outline-none text-sm font-bold text-deep-charcoal py-0.5"
                    />
                ) : (
                    <p className="text-sm font-bold text-deep-charcoal">{value || "Non renseigné"}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-white pb-32">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-center">
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
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all ${isEditing ? 'bg-dakar-emerald text-white' : 'bg-soft-gray text-deep-charcoal'}`}
                >
                    {isEditing ? <Check className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </button>
            </header>

            {/* Profile Hero */}
            <div className="px-6 py-6 flex flex-col items-center">
                <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-[40px] bg-dakar-emerald flex items-center justify-center text-white font-bold text-4xl border-4 border-emerald-50 shadow-xl shadow-emerald-100">
                        {(user.full_name || user.firstName || 'U')[0]}
                    </div>
                </div>
                {isEditing ? (
                    <div className="flex gap-2 text-center">
                        <input
                            name="firstName"
                            value={formData.firstName || ''}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-24 bg-white border-b border-dakar-emerald text-xl font-bold text-center outline-none"
                        />
                        <input
                            name="lastName"
                            value={formData.lastName || ''}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-24 bg-white border-b border-dakar-emerald text-xl font-bold text-center outline-none"
                        />
                    </div>
                ) : (
                    <h2 className="text-2xl font-bold text-deep-charcoal">{user.full_name || `${user.firstName || ''} ${user.lastName || ''}`}</h2>
                )}
                <p className="text-sm text-gray-400 font-medium">ID Santé: #SN-8829-X</p>
            </div>

            {/* Info Sections */}
            <div className="px-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={User} label="Sexe" value={user.sex} name="sex" color="bg-blue-50 text-blue-500" />
                    <InfoItem icon={Calendar} label="Âge" value={user.age} name="age" color="bg-orange-50 text-orange-500" />
                </div>

                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Coordonnées</h3>
                    <div className="space-y-3">
                        <InfoItem icon={Calendar} label="Date Naissance" value={user.birthDate} name="birthDate" />
                        <InfoItem icon={MapPin} label="Lieu Naissance" value={user.birthPlace} name="birthPlace" />
                        <InfoItem icon={Phone} label="Téléphone" value={user.phone} name="phone" />
                        <InfoItem icon={MapPin} label="Résidence" value={user.residence} name="residence" />
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Informations Médicales</h3>
                    <div className="space-y-3">
                        <InfoItem icon={Droplets} label="Groupe Sanguin" value={user.bloodGroup} name="bloodGroup" color="bg-red-50 text-red-500" />
                        <InfoItem icon={Activity} label="Maladies Chroniques" value={user.chronicDiseases} name="chronicDiseases" color="bg-purple-50 text-purple-500" />
                    </div>
                </section>

                <div className="pt-6">
                    <button
                        onClick={handleLogout}
                        className="w-full h-14 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </div>
            </div>

            {/* Bottom Tabs */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-6 safe-area-inset-bottom max-w-[440px] mx-auto z-50">
                <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Accueil</span>
                </Link>
                <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-dakar-emerald transition-colors">
                    <CalendarIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Mes RDV</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-dakar-emerald">
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default Profile;
