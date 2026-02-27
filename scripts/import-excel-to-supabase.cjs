const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://evxejazaxwuiqfdzruli.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

const supabase = createClient(supabaseUrl, supabaseKey);

// Read Excel file with specific header row
function readExcelFile(filePath, headerRow = 3) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Use range to skip header rows and specify header row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    range.s.r = headerRow; // Start from header row (0-indexed)
    return XLSX.utils.sheet_to_json(worksheet, { range: range });
}

// Import hospitals
async function importHospitals() {
    console.log('Importing hospitals...');
    const filePath = path.join(__dirname, '..', 'Structures_Sante_Dakar.xlsx');
    
    if (!fs.existsSync(filePath)) {
        console.error('Hospital file not found:', filePath);
        return;
    }
    
    const data = readExcelFile(filePath, 3); // Header row is at index 3 (4th row, 0-indexed)
    console.log(`Found ${data.length} hospitals in Excel`);
    
    // Filter valid hospitals
    const validData = data.filter(row => row['Nom de l\'Établissement'] && row['Nom de l\'Établissement'].trim() !== '');
    console.log(`Found ${validData.length} valid hospitals`);
    
    // Transform data to match database schema
    const hospitals = validData.map(row => ({
        name: row['Nom de l\'Établissement'] || 'Unknown',
        type: mapHospitalType(row['Type'] || row['Catégorie']),
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
        services: JSON.stringify(['Consultations', 'Urgences']),
        image_urls: JSON.stringify([]),
        is_active: true
    }));
    
    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < hospitals.length; i += batchSize) {
        const batch = hospitals.slice(i, i + batchSize);
        const { data: inserted, error } = await supabase
            .from('hospitals')
            .insert(batch);
        
        if (error) {
            console.error(`Error inserting hospitals batch ${i / batchSize + 1}:`, error);
        } else {
            console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} hospitals)`);
        }
    }
    
    console.log('Hospitals import completed!');
}

// Import pharmacies
async function importPharmacies() {
    console.log('Importing pharmacies...');
    const filePath = path.join(__dirname, '..', 'Pharmacies_Dakar.xlsx');
    
    if (!fs.existsSync(filePath)) {
        console.error('Pharmacy file not found:', filePath);
        return;
    }
    
    const data = readExcelFile(filePath, 3); // Header row is at index 3 (4th row, 0-indexed)
    console.log(`Found ${data.length} pharmacies in Excel`);
    
    // Filter out section headers like "DAKAR CENTRE"
    const validData = data.filter(row => {
        const name = row['Nom de la Pharmacie'];
        return name && name.trim() !== '' && !name.includes('DAKAR') && !name.includes('PIKINE') && !name.includes('GUÉDIAWAYE') && !name.includes('RUFISQUE');
    });
    console.log(`Found ${validData.length} valid pharmacies`);
    
    // Transform data to match database schema
    const pharmacies = validData.map(row => ({
        name: row['Nom de la Pharmacie'] || 'Unknown',
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
    for (let i = 0; i < pharmacies.length; i += batchSize) {
        const batch = pharmacies.slice(i, i + batchSize);
        const { data: inserted, error } = await supabase
            .from('pharmacies')
            .insert(batch);
        
        if (error) {
            console.error(`Error inserting pharmacies batch ${i / batchSize + 1}:`, error);
        } else {
            console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} pharmacies)`);
        }
    }
    
    console.log('Pharmacies import completed!');
}

// Map hospital types
function mapHospitalType(type) {
    if (!type) return 'Hôpital Public';
    
    const typeMap = {
        'CHU': 'CHU',
        'Hôpital': 'Hôpital Public',
        'Clinique': 'Clinique Privée',
        'Centre de Santé': 'Dispensaire',
        'Dispensaire': 'Dispensaire',
        'EPS': 'EPS'
    };
    
    for (const [key, value] of Object.entries(typeMap)) {
        if (type.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    
    return 'Hôpital Public';
}

// Main function
async function main() {
    try {
        console.log('Starting import process...');
        console.log('Supabase URL:', supabaseUrl);
        
        await importHospitals();
        await importPharmacies();
        
        console.log('\n✅ Import completed successfully!');
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
}

main();
