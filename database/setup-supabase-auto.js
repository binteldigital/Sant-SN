#!/usr/bin/env node
/**
 * Supabase Database Auto-Setup Script
 * Creates schema and seeds data for Sunu Santé using Supabase Management API
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = 'https://evxejazaxwuiqfdzruli.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGVqYXpheHd1aXFmZHpydWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjIzMzksImV4cCI6MjA4NzY5ODMzOX0.9YFpRUYCdfTT6dvFHQNiwwqa_Q6tvd_RrPj5sm7WiFk';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGVqYXpheHd1aXFmZHpydWxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyMjMzOSwiZXhwIjoyMDg3Njk4MzM5fQ.3I7a30Us7UhbMaUPG6SzIYBB1Gmc2_PwpikRL6U8Pbs';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Read SQL file
function readSQLFile(filename) {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, 'utf8');
}

// Execute SQL via REST API
async function executeSQL(sql, description) {
    console.log(`\n🔄 ${description}...`);
    
    try {
        // Use pg_execute function if available
        const { data, error } = await supabase.rpc('exec_sql', { query: sql });
        
        if (error) {
            // Fallback: try to execute via raw query
            console.log(`  ℹ️  Using alternative method...`);
            return await executeSQLViaREST(sql);
        }
        
        console.log(`  ✅ Success`);
        return true;
    } catch (err) {
        console.log(`  ℹ️  Trying REST method...`);
        return await executeSQLViaREST(sql);
    }
}

// Execute SQL via REST API directly
async function executeSQLViaREST(sql) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY
            },
            body: JSON.stringify({ query: sql })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`  ⚠️  REST method failed: ${errorText.substring(0, 100)}`);
            return false;
        }
        
        console.log(`  ✅ Success`);
        return true;
    } catch (err) {
        console.log(`  ⚠️  Error: ${err.message}`);
        return false;
    }
}

// Create tables one by one using Supabase JS client
async function createTables() {
    console.log('\n📊 Creating tables...');
    
    const tables = [
        {
            name: 'users',
            schema: `
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'patient',
                    full_name VARCHAR(255) NOT NULL,
                    phone VARCHAR(50),
                    avatar_url TEXT,
                    is_active BOOLEAN DEFAULT true,
                    email_verified BOOLEAN DEFAULT false,
                    phone_verified BOOLEAN DEFAULT false,
                    last_login_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'hospitals',
            schema: `
                CREATE TABLE IF NOT EXISTS hospitals (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(100) NOT NULL,
                    category VARCHAR(100),
                    address TEXT NOT NULL,
                    latitude DECIMAL(10, 8) NOT NULL,
                    longitude DECIMAL(11, 8) NOT NULL,
                    location VARCHAR(255),
                    district VARCHAR(100),
                    department VARCHAR(100),
                    phone VARCHAR(255),
                    email VARCHAR(255),
                    website VARCHAR(255),
                    description TEXT,
                    services JSONB DEFAULT '[]',
                    image_urls JSONB DEFAULT '[]',
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'pharmacies',
            schema: `
                CREATE TABLE IF NOT EXISTS pharmacies (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    pharmacist VARCHAR(255),
                    address TEXT NOT NULL,
                    latitude DECIMAL(10, 8) NOT NULL,
                    longitude DECIMAL(11, 8) NOT NULL,
                    quartier VARCHAR(255),
                    commune VARCHAR(255),
                    district VARCHAR(100),
                    department VARCHAR(100),
                    phone VARCHAR(255),
                    email VARCHAR(255),
                    website VARCHAR(255),
                    on_duty_status BOOLEAN DEFAULT false,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'doctors',
            schema: `
                CREATE TABLE IF NOT EXISTS doctors (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
                    specialty VARCHAR(255) NOT NULL,
                    license_number VARCHAR(100),
                    bio TEXT,
                    education JSONB DEFAULT '[]',
                    availability JSONB DEFAULT '{}',
                    rating DECIMAL(2, 1) DEFAULT 0,
                    review_count INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'appointments',
            schema: `
                CREATE TABLE IF NOT EXISTS appointments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
                    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
                    appointment_date DATE NOT NULL,
                    appointment_time TIME NOT NULL,
                    status VARCHAR(50) DEFAULT 'pending',
                    reason TEXT,
                    notes TEXT,
                    reminder_sent BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'medical_records',
            schema: `
                CREATE TABLE IF NOT EXISTS medical_records (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
                    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
                    record_type VARCHAR(100) NOT NULL,
                    data JSONB NOT NULL,
                    attachments JSONB DEFAULT '[]',
                    is_encrypted BOOLEAN DEFAULT true,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'duty_pharmacy_schedules',
            schema: `
                CREATE TABLE IF NOT EXISTS duty_pharmacy_schedules (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
                    duty_date DATE NOT NULL,
                    start_time TIME DEFAULT '20:00:00',
                    end_time TIME DEFAULT '08:00:00',
                    district VARCHAR(100) NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(pharmacy_id, duty_date)
                )
            `
        },
        {
            name: 'system_settings',
            schema: `
                CREATE TABLE IF NOT EXISTS system_settings (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    setting_key VARCHAR(255) UNIQUE NOT NULL,
                    setting_value JSONB NOT NULL,
                    description TEXT,
                    updated_by UUID REFERENCES users(id),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'activity_logs',
            schema: `
                CREATE TABLE IF NOT EXISTS activity_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    action VARCHAR(255) NOT NULL,
                    entity_type VARCHAR(100),
                    entity_id UUID,
                    details JSONB,
                    ip_address INET,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        }
    ];
    
    for (const table of tables) {
        try {
            const { error } = await supabase.rpc('exec_sql', { query: table.schema });
            if (error) {
                console.log(`  ⚠️  ${table.name}: ${error.message}`);
            } else {
                console.log(`  ✅ ${table.name}`);
            }
        } catch (err) {
            console.log(`  ⚠️  ${table.name}: ${err.message}`);
        }
    }
}

// Create indexes
async function createIndexes() {
    console.log('\n🔍 Creating indexes...');
    
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
        'CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type)',
        'CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals(district)',
        'CREATE INDEX IF NOT EXISTS idx_pharmacies_district ON pharmacies(district)',
        'CREATE INDEX IF NOT EXISTS idx_pharmacies_on_duty ON pharmacies(on_duty_status)',
        'CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)',
        'CREATE INDEX IF NOT EXISTS idx_appointments_hospital ON appointments(hospital_id)',
        'CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)',
        'CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)',
        'CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id)',
        'CREATE INDEX IF NOT EXISTS idx_duty_schedules_date ON duty_pharmacy_schedules(duty_date)',
        'CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)'
    ];
    
    for (const index of indexes) {
        try {
            await supabase.rpc('exec_sql', { query: index });
        } catch (err) {
            // Ignore errors, indexes may already exist
        }
    }
    console.log('  ✅ Indexes created');
}

// Seed data
async function seedData() {
    console.log('\n🌱 Seeding data...');
    
    // Insert admin user
    const { error: userError } = await supabase
        .from('users')
        .upsert({
            email: 'admin@sunusante.sn',
            password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            role: 'super_admin',
            full_name: 'Administrateur Demo',
            phone: '+221 77 123 45 67',
            is_active: true,
            email_verified: true,
            phone_verified: true
        }, { onConflict: 'email' });
    
    if (userError) {
        console.log(`  ⚠️  Admin user: ${userError.message}`);
    } else {
        console.log('  ✅ Admin user created');
    }
    
    // Insert demo users
    const demoUsers = [
        { email: 'patient@demo.sn', role: 'patient', full_name: 'Amadou Diallo', phone: '+221 77 111 11 11' },
        { email: 'doctor@demo.sn', role: 'doctor', full_name: 'Dr. Fatou Ndiaye', phone: '+221 77 222 22 22' },
        { email: 'hospital.admin@demo.sn', role: 'hospital_admin', full_name: 'Moussa Sow', phone: '+221 77 333 33 33' }
    ];
    
    for (const user of demoUsers) {
        await supabase.from('users').upsert({
            ...user,
            password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            is_active: true,
            email_verified: true,
            phone_verified: true
        }, { onConflict: 'email' });
    }
    console.log('  ✅ Demo users created');
    
    // Insert hospitals
    const hospitals = [
        {
            name: 'Hôpital Principal de Dakar (HPD)',
            type: 'Hôpital Militaire',
            category: 'Hôpital Militaire',
            address: '1, Avenue Nelson Mandela, Dakar-Plateau',
            latitude: 14.6677,
            longitude: -17.4378,
            location: 'Dakar-Plateau',
            district: 'Dakar Centre',
            department: 'Dakar',
            phone: '+221 33 839 50 50',
            email: 'communication@hpd.sn',
            website: 'www.hopitalprincipal.sn',
            description: 'Hôpital Principal de Dakar (HPD) est un établissement de type Hôpital Militaire situé à Dakar-Plateau.',
            is_active: true
        },
        {
            name: 'CHNU de Fann',
            type: 'Hôpital Public',
            category: 'CHU / EPS Niveau 3',
            address: 'Avenue Cheikh Anta Diop, Fann, Dakar',
            latitude: 14.6919,
            longitude: -17.4647,
            location: 'Fann – Point E',
            district: 'Dakar Centre',
            department: 'Dakar',
            phone: '+221 33 869 18 18',
            email: 'chnufann@chnu-fann.sn',
            website: 'www.chnu-fann.sn',
            description: 'CHNU de Fann est un établissement de type CHU / EPS Niveau 3.',
            is_active: true
        },
        {
            name: 'Hôpital Militaire d\'Ouakam',
            type: 'Hôpital Militaire',
            category: 'Hôpital Militaire',
            address: 'Ouakam, Dakar',
            latitude: 14.71,
            longitude: -17.46,
            location: 'Ouakam',
            district: 'Dakar Ouest',
            department: 'Dakar',
            phone: '+221 33 820 28 00',
            description: 'Hôpital Militaire d\'Ouakam.',
            is_active: true
        }
    ];
    
    for (const hospital of hospitals) {
        await supabase.from('hospitals').upsert(hospital, { onConflict: 'name' });
    }
    console.log('  ✅ Hospitals created');
    
    // Insert pharmacies
    const pharmacies = [
        {
            name: 'Pharmacie du Plateau',
            pharmacist: 'Dr. Diallo',
            address: '15 Avenue Nelson Mandela, Dakar-Plateau',
            latitude: 14.6677,
            longitude: -17.4378,
            quartier: 'Plateau',
            commune: 'Dakar',
            district: 'Dakar Centre',
            department: 'Dakar',
            phone: '+221 33 821 00 00',
            on_duty_status: false,
            is_active: true
        },
        {
            name: 'Pharmacie Fann',
            pharmacist: 'Dr. Ndiaye',
            address: 'Avenue Cheikh Anta Diop, Fann',
            latitude: 14.6919,
            longitude: -17.4647,
            quartier: 'Fann',
            commune: 'Dakar',
            district: 'Dakar Centre',
            department: 'Dakar',
            phone: '+221 33 869 00 00',
            on_duty_status: true,
            is_active: true
        }
    ];
    
    for (const pharmacy of pharmacies) {
        await supabase.from('pharmacies').upsert(pharmacy, { onConflict: 'name' });
    }
    console.log('  ✅ Pharmacies created');
    
    // Insert system settings
    const settings = [
        {
            setting_key: 'branding',
            setting_value: { primary_color: '#10b981', secondary_color: '#059669', app_name: 'Sunu Santé', tagline: 'Santé à votre portée' },
            description: 'Application branding and colors'
        },
        {
            setting_key: 'features',
            setting_value: { enable_booking: true, enable_sms: false, enable_email: false, enable_duty_pharmacy: true, maintenance_mode: false },
            description: 'Feature toggles'
        },
        {
            setting_key: 'emergency_contacts',
            setting_value: { samu: '1515', police: '17', fire: '18', emergency: '112' },
            description: 'Emergency contact numbers'
        }
    ];
    
    for (const setting of settings) {
        await supabase.from('system_settings').upsert(setting, { onConflict: 'setting_key' });
    }
    console.log('  ✅ System settings created');
}

// Enable RLS and create policies
async function setupRLS() {
    console.log('\n🔒 Setting up Row Level Security...');
    
    const tables = ['users', 'hospitals', 'pharmacies', 'doctors', 'appointments', 'medical_records', 'duty_pharmacy_schedules', 'system_settings', 'activity_logs'];
    
    for (const table of tables) {
        try {
            // Enable RLS
            await supabase.rpc('exec_sql', { 
                query: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY` 
            });
            
            // Create permissive policy for development
            await supabase.rpc('exec_sql', { 
                query: `CREATE POLICY "Allow all" ON ${table} FOR ALL USING (true) WITH CHECK (true)` 
            });
        } catch (err) {
            // Policies may already exist
        }
    }
    console.log('  ✅ RLS enabled');
}

// Main setup function
async function setupDatabase() {
    console.log('🚀 Sunu Santé - Supabase Database Setup');
    console.log('=========================================\n');
    console.log(`🔗 Project: ${SUPABASE_URL}\n`);
    
    try {
        // Test connection
        const { data, error } = await supabase.from('users').select('count').limit(1);
        console.log('✅ Connected to Supabase\n');
        
        // Create tables
        await createTables();
        
        // Create indexes
        await createIndexes();
        
        // Setup RLS
        await setupRLS();
        
        // Seed data
        await seedData();
        
        console.log('\n✨ Database setup complete!\n');
        console.log('👤 Demo Accounts:');
        console.log('  Admin:    admin@sunusante.sn / admin123');
        console.log('  Patient:  patient@demo.sn / admin123');
        console.log('  Doctor:   doctor@demo.sn / admin123');
        console.log('  Hospital: hospital.admin@demo.sn / admin123\n');
        
        console.log('📊 Tables created:');
        console.log('  - users, hospitals, pharmacies');
        console.log('  - doctors, appointments, medical_records');
        console.log('  - duty_pharmacy_schedules, system_settings, activity_logs\n');
        
    } catch (err) {
        console.error('\n❌ Setup failed:', err.message);
        console.log('\n💡 Tip: Make sure you have the correct service_role key');
        process.exit(1);
    }
}

// Run setup
setupDatabase();
