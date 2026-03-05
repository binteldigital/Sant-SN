#!/usr/bin/env node

/**
 * Script pour géocoder les pharmacies avec OpenStreetMap Nominatim (gratuit)
 * Usage: node geocode-pharmacies.js
 */

const fs = require('fs');
const path = require('path');

// Fonction pour géocoder une adresse avec Nominatim
async function geocodeAddress(address) {
    try {
        // Ajouter "Dakar, Sénégal" pour améliorer la précision
        const fullAddress = `${address}, Dakar, Sénégal`;
        const encodedAddress = encodeURIComponent(fullAddress);
        
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SunuSante/1.0 (contact@sunusante.sn)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                display_name: data[0].display_name
            };
        }
        
        return null;
    } catch (error) {
        console.error(`Erreur de géocodage pour "${address}":`, error.message);
        return null;
    }
}

// Attendre entre les requêtes pour respecter les limites de Nominatim
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    // Lire le fichier pharmacies.js
    const pharmaciesPath = path.join(__dirname, '..', 'src', 'data', 'pharmacies.js');
    const fileContent = fs.readFileSync(pharmaciesPath, 'utf8');
    
    // Méthode plus robuste: extraire avec une regex améliorée
    // Chercher tout le contenu entre "export const pharmacies = [" et le dernier "];"
    const startMarker = 'export const pharmacies = [';
    const startIndex = fileContent.indexOf(startMarker);
    
    if (startIndex === -1) {
        console.error('Impossible de trouver le début du tableau pharmacies');
        process.exit(1);
    }
    
    // Trouver la fin du tableau (dernier ];)
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let endIndex = -1;
    
    for (let i = startIndex + startMarker.length - 1; i < fileContent.length; i++) {
        const char = fileContent[i];
        
        // Gérer les chaînes
        if (!inString && (char === '"' || char === "'" || char === '`')) {
            inString = true;
            stringChar = char;
        } else if (inString && char === stringChar && fileContent[i-1] !== '\\') {
            inString = false;
        }
        
        // Compter les accolades uniquement hors chaîne
        if (!inString) {
            if (char === '[' || char === '{') braceCount++;
            if (char === ']' || char === '}') braceCount--;
            
            // Quand on revient à 0 et qu'on trouve ]; c'est la fin
            if (braceCount === 0 && char === ']' && fileContent.substring(i, i+2) === '];') {
                endIndex = i + 2;
                break;
            }
        }
    }
    
    if (endIndex === -1) {
        console.error('Impossible de trouver la fin du tableau pharmacies');
        process.exit(1);
    }
    
    // Extraire le tableau
    const arrayContent = fileContent.substring(startIndex + startMarker.length - 1, endIndex - 1);
    
    // Évaluer le tableau
    let pharmacies;
    try {
        pharmacies = eval(arrayContent);
    } catch (e) {
        console.error('Erreur lors du parsing:', e);
        process.exit(1);
    }
    
    console.log(`Géocodage de ${pharmacies.length} pharmacies...`);
    console.log('(Cela peut prendre plusieurs minutes à cause des limitations de Nominatim)\n');
    
    const updatedPharmacies = [];
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < pharmacies.length; i++) {
        const pharmacy = pharmacies[i];
        console.log(`[${i + 1}/${pharmacies.length}] ${pharmacy.name}`);
        
        const result = await geocodeAddress(pharmacy.address);
        
        if (result) {
            console.log(`  ✓ Coordonnées trouvées: ${result.lat}, ${result.lng}`);
            updatedPharmacies.push({
                ...pharmacy,
                coords: { lat: result.lat, lng: result.lng }
            });
            successCount++;
        } else {
            console.log(`  ✗ Impossible de géocoder, coordonnées conservées`);
            updatedPharmacies.push(pharmacy);
            failCount++;
        }
        
        // Attendre 1 seconde entre chaque requête (limite Nominatim: 1 requête/seconde)
        if (i < pharmacies.length - 1) {
            await sleep(1000);
        }
    }
    
    // Générer le nouveau fichier
    const newContent = `export const pharmacies = ${JSON.stringify(updatedPharmacies, null, 4)};`;
    
    // Sauvegarder l'ancien fichier
    const backupPath = pharmaciesPath + '.backup-' + Date.now();
    fs.writeFileSync(backupPath, fileContent);
    console.log(`\nBackup créé: ${backupPath}`);
    
    // Écrire le nouveau fichier
    fs.writeFileSync(pharmaciesPath, newContent);
    console.log(`Fichier mis à jour: ${pharmaciesPath}`);
    
    console.log(`\n=== RÉSULTAT ===`);
    console.log(`✓ Succès: ${successCount}/${pharmacies.length}`);
    console.log(`✗ Échecs: ${failCount}/${pharmacies.length}`);
    console.log(`\nLes pharmacies qui n'ont pas pu être géocodées conservent leurs coordonnées actuelles.`);
}

main().catch(console.error);
