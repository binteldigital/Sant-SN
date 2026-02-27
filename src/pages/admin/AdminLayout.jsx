import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Building2, 
    Pill, 
    Users, 
    Settings, 
    LogOut,
    Menu,
    X,
    ChevronRight,
    Activity,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/appointments', icon: Calendar, label: 'Rendez-vous' },
        { path: '/admin/hospitals', icon: Building2, label: 'Hôpitaux' },
        { path: '/admin/pharmacies', icon: Pill, label: 'Pharmacies' },
        { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Fixed width for desktop */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Sunu Santé</h1>
                            <p className="text-xs text-gray-500">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                    ${active 
                                        ? 'bg-emerald-50 text-emerald-600 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                                {user?.full_name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                                {user?.full_name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {user?.role || 'super_admin'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </span>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                            {user?.role === 'super_admin' ? 'Super Admin' : user?.role}
                        </span>
                    </div>
                </header>

                {/* Page Content - Full width without max-width constraint */}
                <main className="flex-1 p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
