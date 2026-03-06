import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Phone, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PharmacyForm from '../../components/admin/PharmacyForm';

const AdminPharmacies = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [districts, setDistricts] = useState(['Dakar Centre', 'Dakar Ouest', 'Dakar Sud', 'Dakar Nord', 'Pikine', 'Guédiawaye', 'Keur Massar', 'Rufisque']);
    const [showForm, setShowForm] = useState(false);
    const [editingPharmacy, setEditingPharmacy] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchPharmacies();
    }, []);

    const fetchPharmacies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pharmacies')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) throw error;
            
            setPharmacies(data || []);
            
            // Extract unique districts from data
            if (data && data.length > 0) {
                const uniqueDistricts = [...new Set(data.map(p => p.district).filter(Boolean))];
                if (uniqueDistricts.length > 0) {
                    setDistricts(uniqueDistricts);
                }
            }
        } catch (err) {
            console.error('Failed to fetch pharmacies:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleDutyStatus = async (id) => {
        const pharmacy = pharmacies.find(p => p.id === id);
        if (!pharmacy) return;
        
        try {
            const { error } = await supabase
                .from('pharmacies')
                .update({ on_duty_status: !pharmacy.on_duty_status })
                .eq('id', id);
            
            if (error) throw error;
            
            setPharmacies(pharmacies.map(p => 
                p.id === id ? { ...p, on_duty_status: !p.on_duty_status } : p
            ));
        } catch (err) {
            console.error('Error updating duty status:', err);
            alert('Erreur lors de la mise à jour du statut de garde');
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('pharmacies')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            setPharmacies(pharmacies.filter(p => p.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Failed to delete pharmacy:', err);
            alert('Erreur lors de la suppression de la pharmacie');
        }
    };

    const handleEdit = (pharmacy) => {
        setEditingPharmacy(pharmacy);
        setShowForm(true);
    };

    const handleFormSuccess = (newPharmacy) => {
        if (editingPharmacy) {
            setPharmacies(pharmacies.map(p => p.id === newPharmacy.id ? newPharmacy : p));
        } else {
            setPharmacies([...pharmacies, newPharmacy]);
        }
        setShowForm(false);
        setEditingPharmacy(null);
    };

    const filteredPharmacies = pharmacies.filter(p => {
        const matchesSearch = !search || 
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.address.toLowerCase().includes(search.toLowerCase());
        const matchesDistrict = !filterDistrict || p.district === filterDistrict;
        return matchesSearch && matchesDistrict;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Pharmacies</h1>
                    <p className="text-gray-500 mt-1">{pharmacies.length} pharmacies enregistrées</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingPharmacy(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-dakar-emerald text-white rounded-xl hover:bg-blue-600"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter une pharmacie
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une pharmacie..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dakar-emerald"
                        />
                    </div>
                    <select
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dakar-emerald"
                    >
                        <option value="">Tous les districts</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dakar-emerald" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Pharmacie</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">District</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold">Garde</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPharmacies.map((pharmacy) => (
                                <tr key={pharmacy.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{pharmacy.name}</p>
                                            <p className="text-sm text-gray-500">{pharmacy.pharmacist}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            {pharmacy.district}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pharmacy.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                {pharmacy.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleDutyStatus(pharmacy.id)}
                                            className={`
                                                px-3 py-1 rounded-full text-xs font-medium transition-colors
                                                ${pharmacy.on_duty_status 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                                }
                                            `}
                                        >
                                            <Shield className="w-3 h-3 inline mr-1" />
                                            {pharmacy.on_duty_status ? 'En garde' : 'Normal'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(pharmacy)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirm(pharmacy)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pharmacy Form Modal */}
            {showForm && (
                <PharmacyForm
                    pharmacy={editingPharmacy}
                    onClose={() => {
                        setShowForm(false);
                        setEditingPharmacy(null);
                    }}
                    onSuccess={handleFormSuccess}
                />
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer <strong>{deleteConfirm.name}</strong> ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPharmacies;
