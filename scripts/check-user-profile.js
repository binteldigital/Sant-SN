import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUserProfile() {
    console.log('🔍 Vérification du profil utilisateur...\n');
    
    // Récupérer l'utilisateur KHADIM GUEYE
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'gueye129822@gmail.com')
        .single();
    
    if (error) {
        console.error('❌ Erreur:', error);
        return;
    }
    
    console.log('👤 Utilisateur trouvé:');
    console.log(JSON.stringify(user, null, 2));
}

checkUserProfile();
