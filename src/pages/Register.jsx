import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Lock,
    Droplets,
    Activity,
    ChevronRight,
    Mail,
    Briefcase
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        birthPlace: '',
        sex: 'Masculin',
        bloodGroup: 'O+',
        residence: '',
        phone: '',
        role: 'patient',
        password: '',
        confirmPassword: '',
        chronicDiseases: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 4) {
            alert('Le mot de passe doit contenir au moins 4 caractères.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }
        
        const { confirmPassword, ...dataToSave } = formData;
        
        // Format data for API
        const userData = {
            full_name: `${dataToSave.firstName} ${dataToSave.lastName}`,
            email: dataToSave.email,
            password: dataToSave.password,
            phone: dataToSave.phone,
            role: dataToSave.role
        };
        
        try {
            const result = await register(userData);
            if (result.success) {
                navigate('/');
            } else {
                alert(result.error || 'Échec de l\'inscription');
            }
        } catch (err) {
            alert('Erreur de connexion au serveur');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white px-6 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-deep-charcoal mb-2">Bienvenue !</h1>
                <p className="text-gray-500">Créez votre profil santé pour commencer.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 pb-12">
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Identité</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            required
                            name="firstName"
                            placeholder="Prénom"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                        />
                        <input
                            required
                            name="lastName"
                            placeholder="Nom"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                        />
                    </div>
                    <div className="relative group">
                        <input
                            required
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Naissance</h2>
                    <input
                        required
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
                    <input
                        required
                        name="birthPlace"
                        placeholder="Lieu de naissance"
                        value={formData.birthPlace}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Sexe</label>
                        <select
                            name="sex"
                            value={formData.sex}
                            onChange={handleChange}
                            className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none appearance-none font-medium"
                        >
                            <option value="Masculin">Masculin</option>
                            <option value="Féminin">Féminin</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Groupe Sanguin</label>
                        <select
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none appearance-none font-medium"
                        >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Coordonnées</h2>
                    <div className="relative group">
                        <input
                            required
                            type="tel"
                            name="phone"
                            placeholder="Numéro de téléphone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                    </div>
                    <input
                        required
                        name="residence"
                        placeholder="Lieu de résidence"
                        value={formData.residence}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Type de compte</h2>
                    <div className="relative group">
                        <select
                            required
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none appearance-none font-medium"
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Docteur</option>
                            <option value="hospital_admin">Administrateur d'hôpital</option>
                            <option value="support">Support</option>
                        </select>
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                    </div>
                    <p className="text-xs text-gray-400 ml-2">
                        * Seul l'administrateur système peut créer des comptes super_admin
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sécurité</h2>
                    <div className="relative group">
                        <input
                            required
                            type="password"
                            name="password"
                            placeholder="Créer un mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                    </div>
                    <div className="relative group">
                        <input
                            required
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmer le mot de passe"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-dakar-emerald transition-colors" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Santé</h2>
                    <textarea
                        name="chronicDiseases"
                        placeholder="Maladies chroniques (laissez vide si aucune)"
                        value={formData.chronicDiseases}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium min-h-[100px] resize-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full h-16 bg-dakar-emerald text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                >
                    Terminer l'inscription
                    <ChevronRight className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default Register;
