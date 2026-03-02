import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function createHealthRecordsTable() {
    console.log('🚀 Création des tables du Carnet de Santé dans Supabase...\n');
    
    try {
        // Vérifier si la table existe déjà
        const { data: existingTable, error: checkError } = await supabase
            .from('health_records')
            .select('id')
            .limit(1);
        
        if (!checkError || checkError.code !== '42P01') {
            console.log('✅ La table health_records existe déjà');
            return;
        }
        
        console.log('📋 Création de la table health_records...');
        
        // Créer la table via une requête SQL brute
        const createTableSQL = `
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
            
            CREATE INDEX idx_health_records_user_id ON health_records(user_id);
            CREATE INDEX idx_health_records_qr_token ON health_records(qr_code_token);
        `;
        
        // Essayer d'exécuter via RPC
        const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (rpcError) {
            console.log('⚠️  Impossible de créer via RPC:', rpcError.message);
            console.log('\n🔧 Vous devez créer la table manuellement:');
            console.log('1. Allez sur https://supabase.com/dashboard');
            console.log('2. Sélectionnez votre projet');
            console.log('3. Allez dans "SQL Editor"');
            console.log('4. Créez une nouvelle requête');
            console.log('5. Copiez et exécutez le contenu de database/create-health-records-table.sql');
            return;
        }
        
        console.log('✅ Table health_records créée avec succès !');
        
        // Créer les autres tables
        const createVaccinationsSQL = `
            CREATE TABLE vaccinations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
                vaccine_name VARCHAR(200) NOT NULL,
                dose VARCHAR(50),
                administration_date DATE,
                lot_number VARCHAR(100),
                health_center VARCHAR(200),
                health_agent VARCHAR(200),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX idx_vaccinations_health_record ON vaccinations(health_record_id);
        `;
        
        await supabase.rpc('exec_sql', { sql: createVaccinationsSQL });
        console.log('✅ Table vaccinations créée !');
        
        const createNotesSQL = `
            CREATE TABLE health_record_notes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
                admin_id UUID NOT NULL REFERENCES users(id),
                note_title VARCHAR(200),
                note_content TEXT NOT NULL,
                note_type VARCHAR(50) DEFAULT 'general',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX idx_health_notes_record ON health_record_notes(health_record_id);
        `;
        
        await supabase.rpc('exec_sql', { sql: createNotesSQL });
        console.log('✅ Table health_record_notes créée !');
        
        const createScanHistorySQL = `
            CREATE TABLE qr_scan_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
                scanned_by UUID NOT NULL REFERENCES users(id),
                scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                scan_context VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX idx_qr_scans_record ON qr_scan_history(health_record_id);
        `;
        
        await supabase.rpc('exec_sql', { sql: createScanHistorySQL });
        console.log('✅ Table qr_scan_history créée !');
        
        console.log('\n🎉 Toutes les tables ont été créées avec succès !');
        
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        console.log('\n🔧 Vous devez créer les tables manuellement dans Supabase');
    }
}

createHealthRecordsTable();
