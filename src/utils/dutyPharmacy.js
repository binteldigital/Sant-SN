/**
 * Système de rotation des pharmacies de garde.
 * 
 * Au Sénégal, les pharmacies de garde fonctionnent par rotation.
 * Ce module simule cette rotation en assignant chaque jour un groupe
 * différent de pharmacies comme étant "de garde".
 * 
 * La garde dure de 20h00 à 08h00 du matin + dimanche & jours fériés toute la journée.
 */

// Nombre de pharmacies de garde par jour dans la région de Dakar
const DUTY_COUNT_PER_DAY = 8;

/**
 * Détermine si l'on est actuellement dans une période de garde.
 * Garde: nuit (20h-8h), dimanches, jours fériés
 */
export const isDutyPeriod = (date = new Date()) => {
    const hour = date.getHours();
    const day = date.getDay(); // 0 = dimanche

    // Dimanche = garde toute la journée
    if (day === 0) return true;

    // Nuit: 20h à 8h
    if (hour >= 20 || hour < 8) return true;

    // Jours fériés sénégalais (mois 0-indexed)
    const holidays = [
        { month: 0, day: 1 },   // Nouvel An
        { month: 3, day: 4 },   // Fête de l'Indépendance
        { month: 4, day: 1 },   // Fête du Travail
        { month: 7, day: 15 },  // Assomption
        { month: 10, day: 1 },  // Toussaint
        { month: 11, day: 25 }, // Noël
    ];

    const isHoliday = holidays.some(h => h.month === date.getMonth() && h.day === date.getDate());
    return isHoliday;
};

/**
 * Retourne les IDs des pharmacies de garde pour une date donnée.
 * Utilise un algorithme de rotation basé sur le jour de l'année.
 */
export const getDutyPharmacyIds = (pharmacies, date = new Date()) => {
    const totalPharmacies = pharmacies.length;
    if (totalPharmacies === 0) return [];

    // Calculer le jour de l'année (1-366)
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Créer des groupes de rotation
    const totalGroups = Math.ceil(totalPharmacies / DUTY_COUNT_PER_DAY);
    const currentGroup = dayOfYear % totalGroups;

    // Sélectionner les pharmacies du groupe actuel
    const startIndex = currentGroup * DUTY_COUNT_PER_DAY;
    const dutyIds = [];

    for (let i = 0; i < DUTY_COUNT_PER_DAY; i++) {
        const index = (startIndex + i) % totalPharmacies;
        dutyIds.push(pharmacies[index].id);
    }

    return dutyIds;
};

/**
 * Retourne les infos complètes sur la garde actuelle.
 */
export const getDutyInfo = (date = new Date()) => {
    const isNowDuty = isDutyPeriod(date);
    const hour = date.getHours();
    const day = date.getDay();

    let nextChange;
    if (isNowDuty) {
        // Prochaine fin de garde
        if (day === 0) {
            // Dimanche → lundi 8h
            nextChange = new Date(date);
            nextChange.setDate(nextChange.getDate() + 1);
            nextChange.setHours(8, 0, 0, 0);
        } else if (hour >= 20) {
            // Soir → lendemain 8h
            nextChange = new Date(date);
            nextChange.setDate(nextChange.getDate() + 1);
            nextChange.setHours(8, 0, 0, 0);
        } else {
            // Matin (avant 8h) → 8h
            nextChange = new Date(date);
            nextChange.setHours(8, 0, 0, 0);
        }
    } else {
        // Prochaine garde → 20h ce soir
        nextChange = new Date(date);
        nextChange.setHours(20, 0, 0, 0);
    }

    const msUntilChange = nextChange - date;
    const hoursUntilChange = Math.floor(msUntilChange / (1000 * 60 * 60));
    const minutesUntilChange = Math.floor((msUntilChange % (1000 * 60 * 60)) / (1000 * 60));

    return {
        isActive: isNowDuty,
        nextChange,
        timeUntilChange: `${hoursUntilChange}h ${minutesUntilChange}min`,
        message: isNowDuty
            ? `Garde en cours • Fin dans ${hoursUntilChange}h ${minutesUntilChange}min`
            : `Prochaine garde à 20h00 • Dans ${hoursUntilChange}h ${minutesUntilChange}min`
    };
};
