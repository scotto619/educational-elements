// utils/shopRotation.js - Daily rotating shop inventory system
// This utility provides deterministic daily rotation for shop items

/**
 * Creates a seeded random number generator based on date
 * Same date always produces same sequence
 */
const createDailySeed = (date = new Date()) => {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
};

/**
 * Seeded random function for consistent daily results
 */
const seededRandom = (seed, index = 0) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
};

/**
 * Fisher-Yates shuffle with seed for deterministic results
 */
const shuffleWithSeed = (items, seed) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(seededRandom(seed, i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Filters out seasonal/themed items that shouldn't be in daily rotation
 */
const filterRotatableItems = (items = []) => {
    return items.filter(item => {
        // Exclude Christmas and Halloween themed items
        const theme = item.theme?.toLowerCase();
        if (theme === 'christmas' || theme === 'halloween') {
            return false;
        }
        return true;
    });
};

/**
 * Get today's available avatars for the shop
 * @param {Array} allAvatars - All available avatars (basic + premium combined)
 * @param {number} count - How many avatars to show (default: 7)
 * @param {Date} date - Date to calculate rotation for (default: today)
 * @returns {Array} Array of avatars available today
 */
export const getDailyAvailableAvatars = (allAvatars = [], count = 7, date = new Date()) => {
    const rotatable = filterRotatableItems(allAvatars);

    if (rotatable.length === 0) {
        return [];
    }

    if (rotatable.length <= count) {
        return rotatable;
    }

    const seed = createDailySeed(date);
    const shuffled = shuffleWithSeed(rotatable, seed);

    return shuffled.slice(0, count);
};

/**
 * Get today's available pets for the shop
 * @param {Array} allPets - All available pets (basic + premium combined)
 * @param {number} count - How many pets to show (default: 3)
 * @param {Date} date - Date to calculate rotation for (default: today)
 * @returns {Array} Array of pets available today
 */
export const getDailyAvailablePets = (allPets = [], count = 3, date = new Date()) => {
    const rotatable = filterRotatableItems(allPets);

    if (rotatable.length === 0) {
        return [];
    }

    if (rotatable.length <= count) {
        return rotatable;
    }

    // Use a different seed offset for pets so they don't correlate with avatars
    const seed = createDailySeed(date) + 1000;
    const shuffled = shuffleWithSeed(rotatable, seed);

    return shuffled.slice(0, count);
};

/**
 * Get time until next shop rotation (midnight)
 * @returns {Object} { hours, minutes, seconds, totalMs }
 */
export const getTimeUntilRotation = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    const totalMs = midnight.getTime() - now.getTime();
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, totalMs };
};

/**
 * Format the countdown timer string
 * @returns {string} Formatted countdown like "5h 23m"
 */
export const formatRotationCountdown = () => {
    const { hours, minutes } = getTimeUntilRotation();

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

export default {
    getDailyAvailableAvatars,
    getDailyAvailablePets,
    getTimeUntilRotation,
    formatRotationCountdown,
    createDailySeed,
    filterRotatableItems
};
