import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

const UserForm = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: 'patient',
        password: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const roles = [
        { value: 'patient', label: 'Patient' },
        { value: 'doctor', label: 'Docteur' },
        { value: 'hospital_admin', label: 'Admin Hôpital' },
        { value: 'support', label: 'Support' }
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'patient',
                password: '', // Don't show password
                is_active: user.is_active !== false
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (user) {
                // Update existing user
                const updateData = {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    is_active: formData.is_active
                };

                // Only update password if provided
                if (formData.password) {
                    updateData.password_hash = await bcrypt.hash(formData.password, 10);
                }

                const { data, error } = await supabase
                    .from('users')
                    .update(updateData)
                    .eq('id', user.id)
                    .select()
                    .single();
                
                if (error) throw error;
                onSuccess(data);
            } else {
                // Create new user
                if (!formData.password) {
                    throw new Error('Le mot de passe est requis pour un nouvel utilisateur');
                }

                const passwordHash = await bcrypt.hash(formData.password, 10);

                const { data, error } = await supabase
                    .from('users')
                    .insert([{
                        full_name: formData.full_name,
                        email: formData.email,
                        phone: formData.phone,
                        role: formData.role,
                        is_active: formData.is_active,
                        password_hash: passwordHash
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                onSuccess(data);
            }
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.message || 'Erreur lors de l\'enregistrement de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-1" />
                            Nom complet *
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="ex: Amadou Diallo"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="ex: amadou.diallo@email.com"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="ex: +221 77 123 45 67"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Shield className="w-4 h-4 inline mr-1" />
                            Rôle *
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            {roles.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe {user ? '(laisser vide pour ne pas changer)' : '*'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!user}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={user ? '••••••••' : 'Entrez un mot de passe'}
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                            Compte actif
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Enregistrement...' : (user ? 'Modifier' : 'Créer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
