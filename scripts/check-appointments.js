import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAppointments() {
    console.log('🔍 Vérification des rendez-vous...\n');
    
    // Récupérer tous les rendez-vous
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('❌ Erreur:', error);
        return;
    }
    
    console.log(`📊 Total RDV: ${appointments?.length || 0}\n`);
    
    if (appointments && appointments.length > 0) {
        appointments.forEach((apt, i) => {
            console.log(`RDV #${i + 1}:`);
            console.log(`  - ID: ${apt.id}`);
            console.log(`  - user_id: ${apt.user_id}`);
            console.log(`  - user_name: ${apt.user_name}`);
            console.log(`  - deleted_by_patient: ${apt.deleted_by_patient}`);
            console.log(`  - status: ${apt.status}`);
            console.log(`  - date: ${apt.appointment_date}`);
            console.log('');
        });
    } else {
        console.log('⚠️ Aucun rendez-vous trouvé dans la base');
    }
    
    // Vérifier les utilisateurs
    console.log('\n👥 Utilisateurs:');
    const { data: users } = await supabase.from('users').select('id, email, full_name');
    users?.forEach(u => {
        console.log(`  - ${u.id}: ${u.full_name} (${u.email})`);
    });
}

checkAppointments();
