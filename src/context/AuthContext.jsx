import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

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

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('sunu_sante_user', JSON.stringify(userData));
    };

    const register = (userData) => {
        setUser(userData);
        // sunu_sante_user  = session active (effacée au logout)
        localStorage.setItem('sunu_sante_user', JSON.stringify(userData));
        // sunu_sante_account = credentials persistants (jamais effacés)
        localStorage.setItem('sunu_sante_account', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        // On efface uniquement la session, pas le compte
        localStorage.removeItem('sunu_sante_user');
    };

    const updateProfile = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('sunu_sante_user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
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
