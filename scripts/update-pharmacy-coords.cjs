#!/usr/bin/env node

/**
 * Script pour mettre à jour les coordonnées GPS des pharmacies
 * Usage: node update-pharmacy-coords.cjs
 */

const fs = require('fs');
const path = require('path');

// Coordonnées extraites des liens Google Maps
const coordsUpdates = {
    'Pharmacie Pasteur': { lat: 14.658911, lng: -17.4358933 },
    'Pharmacie Anna Kadet': { lat: 14.6572777, lng: -17.4347729 },
    'Pharmacie Cheikh Ahmadou Bamba': { lat: 14.6753389, lng: -17.4437703 },
    'Pharmacie Du Plateau': { lat: 14.6677073, lng: -17.4371651 },
    'Pharmacie Lamine Guèye': { lat: 14.6815998, lng: -17.4377999 },
    'Pharmacie Wagane Diouf': { lat: 14.6719178, lng: -17.434136 },
    'Pharmacie Guigon': { lat: 14.6690715, lng: -17.4371633 },
    'Pharmacie Abdoul Birane Wane': { lat: 14.6760303, lng: -17.4373767 },
    'Pharmacie Africaine': { lat: 14.6747621, lng: -17.4373651 },
    'Pharmacie Allées Canard': { lat: 14.6707691, lng: -17.4328711 },
    'Pharmacie Avicennes': { lat: 14.674841, lng: -17.4356669 },
    'Pharmacie Boisson': { lat: 14.6705265, lng: -17.4282032 },
    'Pharmacie Dardanelles': { lat: 14.6720872, lng: -17.4414363 },
    "Pharmacie de l'Islam": { lat: 14.6720215, lng: -17.4407617 },
    'Pharmacie de la Mosquée': { lat: 14.6678653, lng: -17.4343349 },
    'Pharmacie Drugstore': { lat: 14.6693242, lng: -17.435741 },
    'Pharmacie du Cap Vert': { lat: 14.6662606, lng: -17.4369847 },
    'Pharmacie du Port': { lat: 14.6756149, lng: -17.4328901 },
    'Pharmacie du Théâtre': { lat: 14.666642, lng: -17.4398365 },
    'Pharmacie Fahd': { lat: 14.6713578, lng: -17.4280958 },
    'Pharmacie Faidherbe': { lat: 14.6756187, lng: -17.4384339 },
    'Pharmacie Fatima': { lat: 14.6744812, lng: -17.4402488 }
};

// Lire le fichier pharmacies.js
const pharmaciesPath = path.join(__dirname, '..', 'src', 'data', 'pharmacies.js');
let content = fs.readFileSync(pharmaciesPath, 'utf8');

// Compter les mises à jour
let updateCount = 0;

// Mettre à jour chaque pharmacie
for (const [name, coords] of Object.entries(coordsUpdates)) {
    // Regex pour trouver et remplacer les coordonnées de cette pharmacie
    const regex = new RegExp(
        `("name": "${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?"coords": \\{[\\s\\S]*?"lat": )[^,]+(,[\\s\\S]*?"lng": )[^}]+(\\})`,
        'g'
    );
    
    const replacement = `$1${coords.lat}$2${coords.lng}$3`;
    
    if (content.match(regex)) {
        content = content.replace(regex, replacement);
        console.log(`✅ ${name}: ${coords.lat}, ${coords.lng}`);
        updateCount++;
    } else {
        console.log(`❌ ${name}: Non trouvée`);
    }
}

// Sauvegarder le fichier
fs.writeFileSync(pharmaciesPath, content);

console.log(`\n📈 ${updateCount} pharmacies mises à jour avec succès !`);
