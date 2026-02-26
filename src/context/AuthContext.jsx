import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Demo admin account - no database needed
const DEMO_ADMIN = {
    id: 'admin-demo-001',
    email: 'admin@sunusante.sn',
    full_name: 'Administrateur Demo',
    role: 'super_admin',
    phone: '+221 77 123 45 67',
    is_active: true
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session if still active
        const session = localStorage.getItem('sunu_sante_user');
        if (session) {
            try {
                setUser(JSON.parse(session));
            } catch (e) {
                console.error("Failed to parse user session", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Simple demo login - any email/password works for demo
        // In real app, this would validate against backend
        const isAdmin = email.includes('admin');
        const userData = isAdmin ? DEMO_ADMIN : {
            id: 'user-' + Date.now(),
            email: email,
            full_name: email.split('@')[0],
            role: 'patient',
            is_active: true
        };
        
        setUser(userData);
        localStorage.setItem('sunu_sante_user', JSON.stringify(userData));
        return { success: true, user: userData };
    };

    const register = (userData) => {
        const newUser = {
            id: 'user-' + Date.now(),
            ...userData,
            role: userData.role || 'patient',
            is_active: true
        };
        setUser(newUser);
        localStorage.setItem('sunu_sante_user', JSON.stringify(newUser));
        localStorage.setItem('sunu_sante_account', JSON.stringify(newUser));
        return { success: true, user: newUser };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sunu_sante_user');
    };

    const updateProfile = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('sunu_sante_user', JSON.stringify(newUser));
    };

    // Auto-login as admin for testing
    const loginAsAdmin = () => {
        setUser(DEMO_ADMIN);
        localStorage.setItem('sunu_sante_user', JSON.stringify(DEMO_ADMIN));
        return { success: true, user: DEMO_ADMIN };
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout, 
            updateProfile,
            loginAsAdmin,
            DEMO_ADMIN 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
