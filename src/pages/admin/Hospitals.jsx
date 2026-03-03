import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    MapPin, 
    Phone,
    Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HospitalForm from '../../components/admin/HospitalForm';

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [types, setTypes] = useState(['Hôpital Public', 'Hôpital Militaire', 'Clinique Privée', 'Dispensaire']);
    const [showForm, setShowForm] = useState(false);
    const [editingHospital, setEditingHospital] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('hospitals')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) throw error;
            
            setHospitals(data || []);
            
            // Extract unique types from data
            if (data && data.length > 0) {
                const uniqueTypes = [...new Set(data.map(h => h.type).filter(Boolean))];
                if (uniqueTypes.length > 0) {
                    setTypes(uniqueTypes);
                }
            }
        } catch (err) {
            console.error('Failed to fetch hospitals:', err);
            setError('Failed to load hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('hospitals')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            setHospitals(hospitals.filter(h => h.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Failed to delete hospital:', err);
            alert('Failed to delete hospital');
        }
    };

    const handleEdit = (hospital) => {
        setEditingHospital(hospital);
        setShowForm(true);
    };

    const handleFormSuccess = async (newHospital) => {
        try {
            if (editingHospital) {
                const { data, error } = await supabase
                    .from('hospitals')
                    .update(newHospital)
                    .eq('id', editingHospital.id)
                    .select()
                    .single();
                
                if (error) throw error;
                setHospitals(hospitals.map(h => h.id === editingHospital.id ? data : h));
            } else {
                const { data, error } = await supabase
                    .from('hospitals')
                    .insert([newHospital])
                    .select()
                    .single();
                
                if (error) throw error;
                setHospitals([...hospitals, data]);
            }
            setShowForm(false);
            setEditingHospital(null);
        } catch (err) {
            console.error('Failed to save hospital:', err);
            alert('Failed to save hospital');
        }
    };

    const filteredHospitals = hospitals.filter(h => {
        const matchesSearch = !search || 
            h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.address.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || h.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Hôpitaux</h1>
                    <p className="text-gray-500 mt-1">
                        {hospitals.length} établissements enregistrés
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingHospital(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter un hôpital
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un hôpital..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tous les types</option>
                        {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => {}}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Hospitals Table - Full width for PC */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Établissement</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Localisation</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHospitals.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            Aucun hôpital trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHospitals.map((hospital) => (
                                        <tr key={hospital.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{hospital.name}</p>
                                                    <p className="text-sm text-gray-500">{hospital.category}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {hospital.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{hospital.district || hospital.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {hospital.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{hospital.phone}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(hospital)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(hospital)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <HospitalForm
                    hospital={editingHospital}
                    onClose={() => {
                        setShowForm(false);
                        setEditingHospital(null);
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

export default Hospitals;
