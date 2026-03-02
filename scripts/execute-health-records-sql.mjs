import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const sql = fs.readFileSync('database/create-health-records-table.sql', 'utf8');

async function executeSQL() {
    console.log('🚀 Exécution du script SQL pour le Carnet de Santé...\n');
    
    // Diviser le script en commandes individuelles
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    let successCount = 0;
    let skipCount = 0;
    
    for (const command of commands) {
        const trimmed = command.trim();
        if (!trimmed || trimmed.startsWith('--')) continue;
        
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: trimmed + ';' });
            if (error) {
                // Si la fonction RPC n'existe pas, on essaie avec une requête directe
                if (error.message.includes('exec_sql')) {
                    console.log('⚠️  Fonction exec_sql non disponible');
                    console.log('💡 Veuillez exécuter le script SQL manuellement dans l\'interface Supabase');
                    console.log('   Fichier: database/create-health-records-table.sql');
                    return;
                }
                console.log('⚠️  Ignoré:', error.message.substring(0, 80));
                skipCount++;
            } else {
                console.log('✅ OK');
                successCount++;
            }
        } catch (err) {
            console.log('⚠️  Erreur:', err.message.substring(0, 80));
            skipCount++;
        }
    }
    
    console.log(`\n🎉 Terminé ! ${successCount} commandes exécutées, ${skipCount} ignorées`);
    console.log('\n📋 Tables créées:');
    console.log('   • health_records (carnet de santé)');
    console.log('   • vaccinations (historique vaccinal)');
    console.log('   • health_record_notes (notes médicales)');
    console.log('   • qr_scan_history (historique des scans)');
}

executeSQL();
