import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';

// Mock users data
const MOCK_USERS = [
    { id: 1, full_name: 'Amadou Diallo', email: 'amadou@email.sn', role: 'patient', phone: '+221 77 111 11 11', is_active: true },
    { id: 2, full_name: 'Fatou Ndiaye', email: 'fatou@email.sn', role: 'doctor', phone: '+221 77 222 22 22', is_active: true },
    { id: 3, full_name: 'Moussa Sow', email: 'moussa@email.sn', role: 'hospital_admin', phone: '+221 77 333 33 33', is_active: true },
    { id: 4, full_name: 'Aïcha Kane', email: 'aicha@email.sn', role: 'support', phone: '+221 77 444 44 44', is_active: true },
    { id: 5, full_name: 'Admin Demo', email: 'admin@sunusante.sn', role: 'super_admin', phone: '+221 77 123 45 67', is_active: true },
    { id: 6, full_name: 'Ibrahima Fall', email: 'ibra@email.sn', role: 'patient', phone: '+221 77 555 55 55', is_active: false },
];

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');

    useEffect(() => {
        // Use mock data
        setUsers(MOCK_USERS);
        setLoading(false);
    }, []);

    const toggleUserStatus = (id) => {
        setUsers(users.map(u => 
            u.id === id ? { ...u, is_active: !u.is_active } : u
        ));
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            super_admin: 'bg-purple-100 text-purple-700',
            hospital_admin: 'bg-blue-100 text-blue-700',
            support: 'bg-orange-100 text-orange-700',
            doctor: 'bg-emerald-100 text-emerald-700',
            patient: 'bg-gray-100 text-gray-700',
        };
        return colors[role] || colors.patient;
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = !search || 
            u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = !filterRole || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                    <p className="text-gray-500 mt-1">{users.length} utilisateurs enregistrés</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">
                    <Plus className="w-5 h-5" />
                    Créer un utilisateur
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">Tous les rôles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="hospital_admin">Hospital Admin</option>
                        <option value="support">Support</option>
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Utilisateur</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Rôle</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Téléphone</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold">Statut</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-gray-600 font-medium">
                                                    {user.full_name?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.full_name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {user.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleUserStatus(user.id)}
                                            className={`
                                                px-3 py-1 rounded-full text-xs font-medium transition-colors
                                                ${user.is_active 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-red-100 text-red-700'
                                                }
                                            `}
                                        >
                                            {user.is_active ? (
                                                <><UserCheck className="w-3 h-3 inline mr-1" /> Actif</>
                                            ) : (
                                                <><UserX className="w-3 h-3 inline mr-1" /> Inactif</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
        </div>
    );
};

export default AdminUsers;
