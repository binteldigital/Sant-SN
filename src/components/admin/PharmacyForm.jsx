import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PharmacyForm = ({ pharmacy, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        district: '',
        phone: '',
        on_duty_status: false,
        latitude: '',
        longitude: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const districts = ['Dakar Centre', 'Dakar Ouest', 'Dakar Sud', 'Dakar Nord', 'Pikine', 'Guédiawaye', 'Keur Massar', 'Rufisque'];

    useEffect(() => {
        if (pharmacy) {
            setFormData({
                name: pharmacy.name || '',
                address: pharmacy.address || '',
                district: pharmacy.district || '',
                phone: pharmacy.phone || '',
                on_duty_status: pharmacy.on_duty_status || false,
                latitude: pharmacy.latitude || '',
                longitude: pharmacy.longitude || ''
            });
        }
    }, [pharmacy]);

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
            if (pharmacy) {
                // Update existing pharmacy
                const { data, error } = await supabase
                    .from('pharmacies')
                    .update(formData)
                    .eq('id', pharmacy.id)
                    .select()
                    .single();
                
                if (error) throw error;
                onSuccess(data);
            } else {
                // Create new pharmacy
                const { data, error } = await supabase
                    .from('pharmacies')
                    .insert([formData])
                    .select()
                    .single();
                
                if (error) throw error;
                onSuccess(data);
            }
        } catch (err) {
            console.error('Error saving pharmacy:', err);
            setError('Erreur lors de l\'enregistrement de la pharmacie');
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
                        {pharmacy ? 'Modifier la pharmacie' : 'Nouvelle pharmacie'}
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

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom de la pharmacie *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="ex: Pharmacie du Centre"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Adresse complète *
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="ex: 123 Avenue Blaise Diagne, Dakar"
                        />
                    </div>

                    {/* District */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            District *
                        </label>
                        <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="">Sélectionner un district</option>
                            {districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
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
                            placeholder="ex: +221 33 123 45 67"
                        />
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="ex: 14.7167"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="ex: -17.4677"
                            />
                        </div>
                    </div>

                    {/* On Duty Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="on_duty_status"
                            id="on_duty_status"
                            checked={formData.on_duty_status}
                            onChange={handleChange}
                            className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="on_duty_status" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Clock className="w-4 h-4" />
                            Pharmacie de garde
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
                            {loading ? 'Enregistrement...' : (pharmacy ? 'Modifier' : 'Ajouter')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PharmacyForm;
