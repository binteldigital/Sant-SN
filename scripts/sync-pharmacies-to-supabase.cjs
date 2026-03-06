#!/usr/bin/env node

/**
 * Script pour synchroniser les pharmacies du fichier vers Supabase
 * Usage: node sync-pharmacies-to-supabase.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Erreur: Veuillez définir VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Lire le fichier pharmacies.js
const pharmaciesPath = path.join(__dirname, '..', 'src', 'data', 'pharmacies.js');
const pharmaciesContent = fs.readFileSync(pharmaciesPath, 'utf8');

// Extraire les données JSON
const match = pharmaciesContent.match(/export const pharmacies = (\[.*?\]);/s);
if (!match) {
    console.error('❌ Erreur: Impossible de parser le fichier pharmacies.js');
    process.exit(1);
}

const pharmacies = eval(match[1]);

async function syncPharmacies() {
    console.log('🚀 Synchronisation des pharmacies vers Supabase...\n');
    console.log(`📊 ${pharmacies.length} pharmacies trouvées dans le fichier\n`);

    // 1. Supprimer toutes les pharmacies existantes
    console.log('1️⃣  Suppression des anciennes pharmacies...');
    const { error: deleteError } = await supabase
        .from('pharmacies')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprime tout
    
    if (deleteError) {
        console.error('⚠️  Erreur lors de la suppression:', deleteError.message);
    } else {
        console.log('✅ Anciennes pharmacies supprimées\n');
    }

    // 2. Insérer les nouvelles pharmacies par lots
    console.log('2️⃣  Insertion des nouvelles pharmacies...');
    let successCount = 0;
    let errorCount = 0;

    // Préparer les données pour insertion par lots
    const pharmaciesData = pharmacies.map(pharmacy => ({
        name: pharmacy.name,
        pharmacist: pharmacy.pharmacist || '',
        address: pharmacy.address,
        quartier: pharmacy.quartier || '',
        district: pharmacy.district || 'Dakar',
        phone: pharmacy.phone || '',
        latitude: pharmacy.coords?.lat || 0,
        longitude: pharmacy.coords?.lng || 0,
        on_duty_status: false,
        is_active: true
    }));

    // Insérer par lots de 50
    const batchSize = 50;
    for (let i = 0; i < pharmaciesData.length; i += batchSize) {
        const batch = pharmaciesData.slice(i, i + batchSize);
        const { error } = await supabase
            .from('pharmacies')
            .insert(batch);

        if (error) {
            console.error(`❌ Erreur lot ${i / batchSize + 1}: ${error.message}`);
            errorCount += batch.length;
        } else {
            console.log(`✅ Lot ${i / batchSize + 1}: ${batch.length} pharmacies`);
            successCount += batch.length;
        }
    }

    console.log('\n📈 Résumé:');
    console.log(`   ✅ ${successCount} pharmacies synchronisées`);
    console.log(`   ❌ ${errorCount} erreurs`);
    console.log('\n✨ Synchronisation terminée !');
}

syncPharmacies().catch(err => {
    console.error('❌ Erreur fatale:', err.message);
    process.exit(1);
});
