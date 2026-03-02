import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('🚀 Migration: Ajout des colonnes soft delete...\n');

    try {
        // Vérifier si la colonne existe déjà
        const { data: columns, error: checkError } = await supabase
            .from('appointments')
            .select('deleted_by_patient')
            .limit(1);

        if (checkError && checkError.message.includes('deleted_by_patient')) {
            console.log('ℹ️ La colonne deleted_by_patient n\'existe pas encore');
        } else {
            console.log('✅ La colonne deleted_by_patient existe déjà');
            return;
        }
    } catch (e) {
        console.log('ℹ️ Vérification des colonnes...');
    }

    // Utiliser RPC pour exécuter du SQL
    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE appointments 
                ADD COLUMN IF NOT EXISTS deleted_by_patient BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
                
                CREATE INDEX IF NOT EXISTS idx_appointments_deleted_by_patient 
                ON appointments(deleted_by_patient);
            `
        });

        if (error) {
            console.error('❌ Erreur RPC:', error);
            console.log('\n⚠️ Veuillez exécuter manuellement le script SQL dans Supabase:');
            console.log('File: database/add-soft-delete-column.sql');
            return;
        }

        console.log('✅ Migration réussie !');
        console.log('\n📋 Colonnes ajoutées:');
        console.log('  - deleted_by_patient (BOOLEAN)');
        console.log('  - deleted_at (TIMESTAMP)');
        console.log('  - Index idx_appointments_deleted_by_patient créé');

    } catch (error) {
        console.error('❌ Erreur:', error);
        console.log('\n⚠️ Veuillez exécuter manuellement le script SQL dans Supabase:');
        console.log('File: database/add-soft-delete-column.sql');
    }
}

migrate();
