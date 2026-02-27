import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

// Auth
export const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: userData
        }
    });
    return { data, error };
};

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
};

// Users
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
};

export const updateUserProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
};

// Hospitals
export const getHospitals = async (filters = {}) => {
    let query = supabase
        .from('hospitals')
        .select('*')
        .eq('is_active', true);
    
    if (filters.type) {
        query = query.eq('type', filters.type);
    }
    if (filters.district) {
        query = query.eq('district', filters.district);
    }
    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }
    
    const { data, error } = await query.order('name');
    return { data, error };
};

export const getHospitalById = async (id) => {
    const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', id)
        .single();
    return { data, error };
};

// Pharmacies
export const getPharmacies = async (filters = {}) => {
    let query = supabase
        .from('pharmacies')
        .select('*')
        .eq('is_active', true);
    
    if (filters.onDuty) {
        query = query.eq('on_duty_status', true);
    }
    if (filters.district) {
        query = query.eq('district', filters.district);
    }
    
    const { data, error } = await query.order('name');
    return { data, error };
};

export const getPharmacyById = async (id) => {
    const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', id)
        .single();
    return { data, error };
};

// Appointments
export const getAppointments = async (userId, role) => {
    let query = supabase
        .from('appointments')
        .select(`
            *,
            hospitals:hospital_id (name, address),
            doctors:doctor_id (specialty, users:user_id (full_name))
        `);
    
    if (role === 'patient') {
        query = query.eq('patient_id', userId);
    } else if (role === 'doctor') {
        query = query.eq('doctor_id', userId);
    }
    
    const { data, error } = await query.order('appointment_date', { ascending: false });
    return { data, error };
};

export const createAppointment = async (appointmentData) => {
    const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
    return { data, error };
};

export const updateAppointment = async (id, updates) => {
    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
};

// Admin functions
export const getDashboardStats = async () => {
    const { data: hospitals } = await supabase
        .from('hospitals')
        .select('count')
        .eq('is_active', true);
    
    const { data: pharmacies } = await supabase
        .from('pharmacies')
        .select('count')
        .eq('is_active', true);
    
    const { data: users } = await supabase
        .from('users')
        .select('count')
        .eq('is_active', true);
    
    const { data: appointments } = await supabase
        .from('appointments')
        .select('count')
        .in('status', ['pending', 'confirmed']);
    
    return {
        hospitals: hospitals?.length || 0,
        pharmacies: pharmacies?.length || 0,
        users: users?.length || 0,
        appointments: appointments?.length || 0
    };
};

// Real-time subscriptions
export const subscribeToAppointments = (callback) => {
    return supabase
        .channel('appointments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, callback)
        .subscribe();
};

export const subscribeToHospitals = (callback) => {
    return supabase
        .channel('hospitals')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hospitals' }, callback)
        .subscribe();
};
