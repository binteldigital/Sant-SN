import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function createTables() {
    console.log('🚀 Création des tables du Carnet de Santé...\n');
    
    try {
        // 1. Créer la table health_records
        console.log('📋 Création de health_records...');
        const { error: hrError } = await supabase
            .from('health_records')
            .select('id')
            .limit(1);
        
        if (hrError && hrError.code === '42P01') {
            // Table n'existe pas, on la crée via une requête
            const createHealthRecordsSQL = `
                CREATE TABLE health_records (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    qr_code_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    birth_date DATE,
                    birth_place VARCHAR(200),
                    sex VARCHAR(20),
                    parent_guardian VARCHAR(200),
                    address TEXT,
                    phone VARCHAR(20),
                    health_id_number VARCHAR(50),
                    personal_history TEXT,
                    family_history TEXT,
                    allergies TEXT,
                    blood_group VARCHAR(10),
                    chronic_diseases TEXT,
                    reference_health_center VARCHAR(200),
                    health_region VARCHAR(100),
                    status VARCHAR(20) DEFAULT 'actif',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    CONSTRAINT unique_health_record_per_user UNIQUE (user_id)
                );
            `;
            
            const { error } = await supabase.rpc('create_table_if_not_exists', {
                table_name: 'health_records',
                sql: createHealthRecordsSQL
            });
            
            if (error) {
                console.log('⚠️  health_records:', error.message);
            } else {
                console.log('✅ health_records créée');
            }
        } else {
            console.log('✅ health_records existe déjà');
        }
        
        // 2. Créer la table vaccinations
        console.log('📋 Création de vaccinations...');
        const { error: vacError } = await supabase
            .from('vaccinations')
            .select('id')
            .limit(1);
        
        if (vacError && vacError.code === '42P01') {
            console.log('⚠️  vaccinations: Table à créer manuellement');
        } else {
            console.log('✅ vaccinations existe déjà');
        }
        
        // 3. Créer la table health_record_notes
        console.log('📋 Création de health_record_notes...');
        const { error: notesError } = await supabase
            .from('health_record_notes')
            .select('id')
            .limit(1);
        
        if (notesError && notesError.code === '42P01') {
            console.log('⚠️  health_record_notes: Table à créer manuellement');
        } else {
            console.log('✅ health_record_notes existe déjà');
        }
        
        // 4. Créer la table qr_scan_history
        console.log('📋 Création de qr_scan_history...');
        const { error: scanError } = await supabase
            .from('qr_scan_history')
            .select('id')
            .limit(1);
        
        if (scanError && scanError.code === '42P01') {
            console.log('⚠️  qr_scan_history: Table à créer manuellement');
        } else {
            console.log('✅ qr_scan_history existe déjà');
        }
        
        console.log('\n🎉 Vérification terminée !');
        console.log('\n⚠️  IMPORTANT: Si des tables manquent, exécutez le script SQL manuellement:');
        console.log('   1. Allez dans l\'interface Supabase (https://supabase.com)');
        console.log('   2. SQL Editor → New query');
        console.log('   3. Copiez le contenu de: database/create-health-records-table.sql');
        console.log('   4. Exécutez le script');
        
    } catch (err) {
        console.error('❌ Erreur:', err.message);
    }
}

createTables();
