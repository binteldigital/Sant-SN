import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token and validate it
        const token = localStorage.getItem('token');
        if (token) {
            validateToken();
        } else {
            setLoading(false);
        }
    }, []);

    const validateToken = async () => {
        try {
            const response = await authApi.me();
            setUser(response.data.user);
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authApi.login({ email, password });
            const { user: userData, token } = response.data;
            
            setUser(userData);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authApi.register(userData);
            const { user: newUser, token } = response.data;
            
            setUser(newUser);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Registration failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Registration failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const updateProfile = async (updatedData) => {
        try {
            const response = await authApi.updateProfile(updatedData);
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Profile update failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Update failed' 
            };
        }
    };

    // Demo login for testing - uses real API with demo credentials
    const loginAsAdmin = async () => {
        return login('admin@sunusante.sn', 'admin123');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout, 
            updateProfile,
            loginAsAdmin
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
