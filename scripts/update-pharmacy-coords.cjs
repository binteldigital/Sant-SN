#!/usr/bin/env node

/**
 * Script pour mettre à jour les coordonnées GPS des pharmacies
 * Usage: node update-pharmacy-coords.cjs
 */

const fs = require('fs');
const path = require('path');

// Coordonnées extraites des liens Google Maps
const coordsUpdates = {
    // Plateau (déjà fait)
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
    'Pharmacie Fatima': { lat: 14.6744812, lng: -17.4402488 },
    // Nouvelles pharmacies
    'Pharmacie Gallieni': { lat: 14.6616984, lng: -17.4379881 },
    'Pharmacie Gambetta': { lat: 14.6715446, lng: -17.4374755 },
    'Pharmacie Gorom': { lat: 14.6681657, lng: -17.4392088 },
    'Pharmacie Guet': { lat: 14.6689944, lng: -17.4300215 },
    'Pharmacie Kermel': { lat: 14.66956, lng: -17.4299504 },
    'Pharmacie Lat Dior': { lat: 14.6789493, lng: -17.4421976 },
    'Pharmacie Nation': { lat: 14.7194758, lng: -17.4383883 },
    'Pharmacie Nelson Mandela': { lat: 14.6626178, lng: -17.4351599 },
    'Pharmacie Ngorba': { lat: 14.6734296, lng: -17.4344583 },
    'Pharmacie Ponty': { lat: 14.66998, lng: -17.4338243 },
    'Pharmacie République': { lat: 14.6651124, lng: -17.4352582 },
    'Pharmacie Rolland': { lat: 14.6717092, lng: -17.4356966 },
    'Pharmacie Rond Point': { lat: 14.7547387, lng: -17.4756519 },
    'Pharmacie Sainte Anne': { lat: 14.6737574, lng: -17.4453997 },
    'Pharmacie Sandaga': { lat: 14.6699265, lng: -17.4396151 },
    'Pharmacie Téranga': { lat: 14.6671033, lng: -17.4334834 },
    'Pharmacie Vital': { lat: 14.6673342, lng: -17.4314301 },
    'Pharmacie Aimé Césaire': { lat: 14.6954975, lng: -17.4667661 },
    'Pharmacie Point-E': { lat: 14.6950057, lng: -17.4580234 },
    'Pharmacie Résidence Serigne Malick Diéye': { lat: 14.698938, lng: -17.4642816 },
    'Pharmacie Birago Diop': { lat: 14.6989718, lng: -17.4620041 },
    'Pharmacie Fann-Hock': { lat: 14.6798667, lng: -17.4617765 },
    'Pharmacie Signara': { lat: 14.6946923, lng: -17.463708 },
    'Pharmacie Keur Jaraff': { lat: 14.7002645, lng: -17.4597926 },
    'Pharmacie Besse': { lat: 14.7020434, lng: -17.4625977 },
    'Pharmacie Selma': { lat: 14.7037294, lng: -17.4678474 },
    'Pharmacie Ndoss': { lat: 14.6923819, lng: -17.4608271 },
    'Pharmacie le Parcours': { lat: 14.7042519, lng: -17.4603706 },
    'Pharmacie Demba Koita': { lat: 14.7107821, lng: -17.4700906 },
    'Pharmacie Sonatel 1': { lat: 14.7392959, lng: -17.4654599 },
    'Pharmacie Mignel': { lat: 14.7377401, lng: -17.4487408 },
    'Pharmacie Incha Allah': { lat: 14.7089633, lng: -17.4576992 },
    'Pharmacie des Allees': { lat: 14.6975147, lng: -17.4563674 },
    'Pharmacie Borom Daradji': { lat: 14.7064285, lng: -17.4573236 },
    // Grand Dakar / Biscuiterie / HLM
    'Pharmacie Sedami': { lat: 14.7053673, lng: -17.4698235 },
    'Pharmacie Mame Fatou BA': { lat: 14.7002616, lng: -17.4538222 },
    'Pharmacie Dabakh Malick GD': { lat: 14.6941966, lng: -17.4442293 },
    'Pharmacie CAP-SANTE': { lat: 14.7023286, lng: -17.4524629 },
    'Pharmacie Darabis': { lat: 14.7071875, lng: -17.4597567 },
    "Pharmacie de L'EMMANUEL": { lat: 14.7074257, lng: -17.4556795 },
    'Pharmacie Masaalikul Jinaan': { lat: 14.7020424, lng: -17.4495397 },
    'Pharmacie Diadji Abdou Diodio': { lat: 14.7088551, lng: -17.4517361 },
    'Pharmacie Tidjany Mouhamed El Habib': { lat: 14.7095473, lng: -17.4531777 },
    'Pharmacie Macha-allah': { lat: 14.7046663, lng: -17.4473319 },
    'Pharmacie Biscuiterie': { lat: 14.7122385, lng: -17.4516224 },
    'Pharmacie du Grand-Dakar': { lat: 14.7053288, lng: -17.4517589 },
    'Pharmacie Ouagou-Niayes': { lat: 14.7074499, lng: -17.4470088 },
    'Pharmacie Kader DIOP': { lat: 14.7107322, lng: -17.4467883 },
    'Pharmacie El Hadji Mamadou Seydou BA': { lat: 14.7049116, lng: -17.4496492 },
    'Pharmacie ben Tally': { lat: 14.71374, lng: -17.4496097 },
    'Pharmacie Mariama Mbacke': { lat: 14.7144538, lng: -17.4531022 },
    'Pharmacie Coopé': { lat: 14.7094473, lng: -17.4495369 },
    'Pharmacie Hamet Bathily': { lat: 14.7118383, lng: -17.4432777 },
    'Pharmacie Espérance HLM Sokhna Rokh': { lat: 14.7157003, lng: -17.4442196 },
    'Pharmacie Léopold Sédar Senghor': { lat: 14.7064528, lng: -17.4450651 },
    'Pharmacie Corniche des HLM V': { lat: 14.7142783, lng: -17.4415334 },
    'Pharmacie Giga Santé': { lat: 14.7181788, lng: -17.4428204 },
    'Pharmacie Mamadou Racine SY': { lat: 14.7463822, lng: -17.4255543 },
    'Pharmacie Serigne Souhaibou Mbacké': { lat: 14.7019289, lng: -17.4468828 },
    // Hann, Bel-Air
    'Pharmacie LA CLEMENCE': { lat: 14.7135194, lng: -17.4459801 },
    'Pharmacie Mouhamed': { lat: 14.7012139, lng: -17.4437233 },
    'Pharmacie Cite Douane': { lat: 14.6995407, lng: -17.4440558 },
    'Pharmacie Radja': { lat: 14.7340823, lng: -17.4269149 },
    "Pharmacie de l'étrier": { lat: 14.7034038, lng: -17.4263737 },
    'Pharmacie HLM Maristes': { lat: 14.7403112, lng: -17.425198 },
    'Pharmacie Couro': { lat: 14.7389651, lng: -17.4314887 },
    'Pharmacie Mouhamadoul Amine': { lat: 14.7401726, lng: -17.4045944 },
    'Pharmacie Touba': { lat: 14.7369835, lng: -17.4340606 },
    'Pharmacie de la Rocade': { lat: 14.6978377, lng: -17.4380842 },
    'Pharmacie Hann-Mariste': { lat: 14.7246137, lng: -17.4390694 },
    'Pharmacie Alliance Maristes': { lat: 14.7347261, lng: -17.42445 },
    'Pharmacie Capa': { lat: 14.7193282, lng: -17.4324471 },
    'Pharmacie Hann-Pecheurs': { lat: 14.7290504, lng: -17.4263719 },
    'Pharmacie Zahra': { lat: 14.7412161, lng: -17.4253591 },
    // Autres quartiers
    'Pharmacie Rond Point': { lat: 14.6695878, lng: -17.4314284 },
    'Pharmacie du Potou': { lat: 14.7074879, lng: -17.4350637 },
    'Pharmacie Abdourahmane': { lat: 14.7378041, lng: -17.4244143 },
    'Pharmacie BEL AIR PHARMACY': { lat: 14.6925127, lng: -17.4323518 },
    'Pharmacie De La Renaissance': { lat: 14.7205529, lng: -17.4909534 },
    'Pharmacie Des Mamelles': { lat: 14.7256192, lng: -17.5004287 },
    'Pharmacie City Assembler': { lat: 14.7237121, lng: -17.4942333 },
    'Pharmacie Al Amine': { lat: 14.7519216, lng: -17.4530542 },
    'Pharmacie Populaire': { lat: 14.7571643, lng: -17.4361394 },
    'Pharmacie Yacine': { lat: 14.75712, lng: -17.4392774 },
    'Pharmacie Mame Fama Sy': { lat: 14.7541099, lng: -17.4621664 },
    'Pharmacie du Royaume Sibuk': { lat: 14.7599445, lng: -17.4433775 },
    'Pharmacie Baraka': { lat: 14.7591826, lng: -17.4294315 },
    'Pharmacie Bousso Dramé': { lat: 14.7561322, lng: -17.4441021 },
    'Pharmacie Cheikh Ibra Fall Yare': { lat: 14.7811073, lng: -17.3808419 },
    'Pharmacie El. H. Abdourahmane Mbengue': { lat: 14.7623474, lng: -17.4802676 },
    'Pharmacie Victoire': { lat: 14.7488251, lng: -17.4712441 },
    'Pharmacie Xandar': { lat: 14.7512211, lng: -17.472527 },
    'Pharmacie Abdoulaye Mbengue': { lat: 14.7416913, lng: -17.3769597 },
    'Pharmacie S.M. Fadilou Mbacké': { lat: 14.7441822, lng: -17.444323 },
    'Pharmacie Pikinoise': { lat: 14.760637, lng: -17.3838778 },
    'Pharmacie El Amin Pikine': { lat: 14.7401726, lng: -17.4045944 },
    'Pharmacie du Rail / Pikine': { lat: 14.7526927, lng: -17.4034474 },
    'Pharmacie Aly Maram Wade': { lat: 14.7436044, lng: -17.3892744 },
    'Pharmacie Arrazak': { lat: 14.748922, lng: -17.2982722 },
    'Pharmacie Grand Mbao': { lat: 14.7327392, lng: -17.3242828 },
    'Pharmacie Wassour': { lat: 14.7351923, lng: -17.3172016 },
    'Pharmacie Marie Esseteine Manga': { lat: 14.7696499, lng: -17.2790029 },
    'Pharmacie Thierno M.Seydou BA': { lat: 14.7732061, lng: -17.3838817 },
    'Pharmacie Thiele': { lat: 14.7764362, lng: -17.3727905 },
    'Pharmacie Sant Yalla': { lat: 14.7766066, lng: -17.3975626 },
    'Pharmacie Cheikh Wade Kadia': { lat: 14.7749432, lng: -17.4038755 },
    'Pharmacie Birane Ly': { lat: 14.7695327, lng: -17.3138602 },
    'Pharmacie Tamba': { lat: 14.7893345, lng: -17.3197245 }
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
