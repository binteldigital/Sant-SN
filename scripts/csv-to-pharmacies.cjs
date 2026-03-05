#!/usr/bin/env node

/**
 * Script pour convertir le CSV des pharmacies en fichier JS
 * Usage: node csv-to-pharmacies.cjs
 */

const fs = require('fs');
const path = require('path');

// Lire le fichier CSV
const csvPath = path.join(__dirname, '..', 'Pharmacies_Dakar nouveau - Pharmacies Dakar.csv');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'pharmacies.js');

const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parser le CSV (simple, gère les virgules dans les champs entre guillemets)
function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        results.push(obj);
    }
    
    return results;
}

// Mapper les quartiers aux districts
function getDistrict(quartier) {
    const districtMap = {
        'Plateau': 'Dakar Centre',
        'Fann Point-E': 'Dakar Ouest',
        'Fann': 'Dakar Ouest',
        'Mermoz': 'Dakar Ouest',
        'Grand Yoff': 'Dakar Nord',
        'Grand Dakar': 'Dakar Sud',
        'Biscuiterie/Bopp': 'Dakar Centre',
        'HLM': 'Dakar Sud',
        'Hann, Bel-Air': 'Dakar Sud',
        'Hann': 'Dakar Sud',
        'Bel-Air': 'Dakar Sud',
        'Ouakam': 'Dakar Ouest',
        'Parcelles Assainies': 'Dakar Nord',
        'Yoff': 'Dakar Nord',
        'Thiaroye': 'Pikine',
        'Patte D\'orie': 'Dakar Nord',
        'Pikine': 'Pikine',
        'Mbao': 'Pikine',
        'Grand Mbao': 'Pikine',
        'Keur Massar': 'Keur Massar',
        'Guédiawaye': 'Guédiawaye',
        'Rufisque': 'Rufisque'
    };
    
    return districtMap[quartier] || 'Dakar';
}

// Convertir les données
const data = parseCSV(csvContent);

const pharmacies = data.map((row, index) => ({
    id: index + 1,
    name: row['NOM DE LA PHARMACIE'] || '',
    quartier: row['QUARTIER / ZONE'] || '',
    district: getDistrict(row['QUARTIER / ZONE']),
    address: row['ADRESSE / LOCALISATION'] || '',
    coords: { lat: 0, lng: 0 }, // Coordonnées temporaires
    phone: row['NUMÉRO DE TÉLÉPHONE'] || '',
    email: '',
    website: ''
}));

// Générer le fichier JS
const jsContent = `export const pharmacies = ${JSON.stringify(pharmacies, null, 4)};`;

// Sauvegarder l'ancien fichier
const backupPath = outputPath + '.backup-' + Date.now();
if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backup créé: ${backupPath}`);
}

// Écrire le nouveau fichier
fs.writeFileSync(outputPath, jsContent);
console.log(`Fichier créé: ${outputPath}`);
console.log(`\n${pharmacies.length} pharmacies importées avec succès!`);
console.log('\n⚠️  Les coordonnées GPS sont temporairement à (0, 0)');
console.log('   Mettez à jour les coordonnées lat/lng pour chaque pharmacie.');
