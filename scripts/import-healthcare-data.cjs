const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://evxejazaxwuiqfdzruli.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('Error: VITE_SUPABASE_ANON_KEY environment variable is required');
    console.error('Please run: export $(grep -v "^#" .env.local | xargs) && node scripts/import-healthcare-data.cjs');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read Excel file with specific header row
function readExcelFile(filePath, headerRowIndex) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the full range
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Set the start row to the header row
    range.s.r = headerRowIndex;
    
    // Convert to JSON with the specified range
    const data = XLSX.utils.sheet_to_json(worksheet, { 
        range: range,
        defval: null
    });
    
    return data;
}

// Import hospitals
async function importHospitals() {
    console.log('\n🏥 Importing hospitals...');
    const filePath = path.join(__dirname, '..', 'hopitaux.xlsx');
    
    if (!fs.existsSync(filePath)) {
        console.error('❌ Hospital file not found:', filePath);
        return 0;
    }
    
    // Read with header at row 3 (0-indexed, so 4th row in Excel)
    const data = readExcelFile(filePath, 3);
    console.log(`📊 Found ${data.length} rows in Excel`);
    
    // Filter valid hospitals - must have a name
    const validData = data.filter(row => {
        const name = row["Nom de l'Établissement"];
        return name && typeof name === 'string' && name.trim() !== '' && 
               !name.includes('RÉPERTOIRE') && 
               !name.includes('Hôpitaux Publics');
    });
    
    console.log(`✅ Found ${validData.length} valid hospitals`);
    
    if (validData.length === 0) {
        console.log('⚠️  No valid hospitals to import');
        return 0;
    }
    
    // Transform data to match database schema
    const hospitals = validData.map(row => ({
        name: row["Nom de l'Établissement"].trim(),
        type: mapHospitalType(row['Type']),
        category: row['Catégorie'] || null,
        address: row['Adresse'] || '',
        phone: row['Téléphone'] || null,
        email: row['Email'] || null,
        website: row['Site Web / Réseaux Sociaux'] || null,
        latitude: parseFloat(row['Latitude (GPS)']) || 14.7167,
        longitude: parseFloat(row['Longitude (GPS)']) || -17.4676,
        location: row['Quartier / Commune'] || null,
        district: row['District Sanitaire'] || 'Dakar',
        department: row['Département'] || 'Dakar',
        services: JSON.stringify(['Consultations', 'Urgences', 'Hospitalisation']),
        image_urls: JSON.stringify([]),
        is_active: true
    }));
    
    // Insert in batches of 50
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < hospitals.length; i += batchSize) {
        const batch = hospitals.slice(i, i + batchSize);
        const { data: inserted, error } = await supabase
            .from('hospitals')
            .insert(batch);
        
        if (error) {
            console.error(`❌ Error inserting hospitals batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        } else {
            insertedCount += batch.length;
            console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} hospitals)`);
        }
    }
    
    console.log(`🏥 Hospitals import completed! Total: ${insertedCount} hospitals`);
    return insertedCount;
}

// Import pharmacies
async function importPharmacies() {
    console.log('\n💊 Importing pharmacies...');
    const filePath = path.join(__dirname, '..', 'Pharmacies_Dakar.xlsx');
    
    if (!fs.existsSync(filePath)) {
        console.error('❌ Pharmacy file not found:', filePath);
        return 0;
    }
    
    // Read with header at row 3 (0-indexed, so 4th row in Excel)
    const data = readExcelFile(filePath, 3);
    console.log(`📊 Found ${data.length} rows in Excel`);
    
    // Filter valid pharmacies - must have a name and not be a section header
    const validData = data.filter(row => {
        const name = row['Nom de la Pharmacie'];
        return name && typeof name === 'string' && name.trim() !== '' && 
               !name.includes('RÉPERTOIRE') && 
               !name.includes('DAKAR') && 
               !name.includes('PIKINE') && 
               !name.includes('GUÉDIAWAYE') &&
               !name.includes('RUFISQUE') &&
               !name.includes('Keur Massar');
    });
    
    console.log(`✅ Found ${validData.length} valid pharmacies`);
    
    if (validData.length === 0) {
        console.log('⚠️  No valid pharmacies to import');
        return 0;
    }
    
    // Transform data to match database schema
    const pharmacies = validData.map(row => ({
        name: row['Nom de la Pharmacie'].trim(),
        pharmacist: row['Pharmacien(ne)'] || null,
        address: row['Adresse Complète'] || '',
        phone: row['Téléphone'] || null,
        email: row['Email'] || null,
        website: row['Site Web / Réseaux Sociaux'] || null,
        latitude: parseFloat(row['Latitude']) || 14.7167,
        longitude: parseFloat(row['Longitude']) || -17.4676,
        quartier: row['Quartier'] || null,
        commune: row['Commune / Arrondissement'] || 'Dakar',
        district: row['District Sanitaire'] || 'Dakar',
        department: row['Département'] || 'Dakar',
        on_duty_status: false,
        is_active: true
    }));
    
    // Insert in batches of 50
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < pharmacies.length; i += batchSize) {
        const batch = pharmacies.slice(i, i + batchSize);
        const { data: inserted, error } = await supabase
            .from('pharmacies')
            .insert(batch);
        
        if (error) {
            console.error(`❌ Error inserting pharmacies batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        } else {
            insertedCount += batch.length;
            console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} pharmacies)`);
        }
    }
    
    console.log(`💊 Pharmacies import completed! Total: ${insertedCount} pharmacies`);
    return insertedCount;
}

// Map hospital types to match database constraints
function mapHospitalType(type) {
    if (!type || typeof type !== 'string') return 'Hôpital Public';
    
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes('militaire')) return 'Hôpital Militaire';
    if (typeLower.includes('clinique')) return 'Clinique Privée';
    if (typeLower.includes('chu')) return 'CHU';
    if (typeLower.includes('eps')) return 'EPS';
    if (typeLower.includes('dispensaire') || typeLower.includes('centre de santé')) return 'Dispensaire';
    if (typeLower.includes('hôpital') || typeLower.includes('hopital')) return 'Hôpital Public';
    
    return 'Hôpital Public';
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting healthcare data import...');
        console.log('🔗 Supabase URL:', supabaseUrl);
        
        const hospitalCount = await importHospitals();
        const pharmacyCount = await importPharmacies();
        
        console.log('\n📊 Import Summary:');
        console.log(`   🏥 Hospitals: ${hospitalCount}`);
        console.log(`   💊 Pharmacies: ${pharmacyCount}`);
        console.log('\n✅ Import completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    }
}

main();
