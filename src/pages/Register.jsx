import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Droplets,
    Activity,
    ChevronRight
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        birthPlace: '',
        age: '',
        sex: 'Masculin',
        bloodGroup: 'O+',
        residence: '',
        phone: '',
        chronicDiseases: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        register(formData);
        navigate('/');
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
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Naissance</h2>
                    <div className="grid grid-cols-2 gap-4">
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
                            name="age"
                            placeholder="Âge (ex: 35)"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                        />
                    </div>
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
                    <input
                        required
                        name="phone"
                        placeholder="Numéro de téléphone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-soft-gray rounded-2xl outline-none focus:ring-2 focus:ring-dakar-emerald/20 transition-all font-medium"
                    />
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
