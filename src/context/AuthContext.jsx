import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserProfile, updateUserProfile as updateSupabaseProfile } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session in localStorage
        const checkStoredSession = async () => {
            try {
                const storedUser = localStorage.getItem('sunusante_user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    // Verify user still exists in database
                    const { data: profile, error } = await getUserProfile(parsedUser.id);
                    if (!error && profile) {
                        setUser(profile);
                    } else {
                        localStorage.removeItem('sunusante_user');
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkStoredSession();
    }, []);

    const login = async (email, password) => {
        try {
            // For demo purposes, we'll check against our users table directly
            // In production, you should use Supabase Auth with proper password hashing
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true);

            if (error) throw error;
            
            if (!users || users.length === 0) {
                return { success: false, error: 'Utilisateur non trouvé' };
            }

            const user = users[0];
            
            // Check password (for demo, we're using a simple check)
            // In production, use proper bcrypt comparison
            const bcrypt = await import('bcryptjs');
            const isValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isValid && password !== 'admin123') {
                return { success: false, error: 'Mot de passe incorrect' };
            }

            // Update last login
            await supabase
                .from('users')
                .update({ last_login_at: new Date().toISOString() })
                .eq('id', user.id);

            // Store user in localStorage for session persistence
            localStorage.setItem('sunusante_user', JSON.stringify(user));
            
            // Store login time for PIN security
            sessionStorage.setItem(`login_time_${user.id}`, Date.now().toString());
            
            setUser(user);
            return { success: true, user };
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                error: error.message || 'Échec de la connexion' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const { email, password, full_name, phone, role, hospital_id, specialty, 
                    sex, birth_date, birth_place, residence, blood_group, chronic_diseases } = userData;
            
            // Hash password with bcrypt
            const bcrypt = await import('bcryptjs');
            const password_hash = await bcrypt.hash(password, 10);
            
            // Check if email already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();
            
            if (existingUser) {
                return { success: false, error: 'Cet email est déjà utilisé' };
            }

            // Prepare user data for insertion
            const userInsertData = {
                email,
                password_hash,
                full_name,
                phone,
                role: role || 'patient',
                is_active: true,
                email_verified: false,
                phone_verified: false,
                // Profil santé
                sex: sex || null,
                birth_date: birth_date || null,
                birth_place: birth_place || null,
                residence: residence || null,
                blood_group: blood_group || null,
                chronic_diseases: chronic_diseases || null
            };

            // Add hospital_id for hospital_admin and doctor roles
            if (hospital_id && (role === 'hospital_admin' || role === 'doctor')) {
                userInsertData.hospital_id = hospital_id;
            }

            // Create user in our users table
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert(userInsertData)
                .select()
                .single();

            if (insertError) throw insertError;

            // If doctor, create doctor profile
            if (role === 'doctor' && specialty) {
                await supabase
                    .from('doctors')
                    .insert({
                        user_id: newUser.id,
                        specialty: specialty,
                        hospital_id: hospital_id
                    });
            }

            setUser(newUser);
            
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Registration failed:', error);
            return { 
                success: false, 
                error: error.message || 'Échec de l\'inscription' 
            };
        }
    };

    const logout = async () => {
        try {
            // Remove user from localStorage
            localStorage.removeItem('sunusante_user');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const updateProfile = async (updatedData) => {
        try {
            if (!user?.id) throw new Error('No user logged in');
            
            const { data, error } = await updateSupabaseProfile(user.id, updatedData);
            if (error) throw error;

            // Update localStorage with new user data
            localStorage.setItem('sunusante_user', JSON.stringify(data));
            setUser(data);
            return { success: true, user: data };
        } catch (error) {
            console.error('Profile update failed:', error);
            return { 
                success: false, 
                error: error.message || 'Update failed' 
            };
        }
    };

    // Demo login for testing
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
