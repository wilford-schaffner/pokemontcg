/**
 * Points Service
 * Handles scoring logic, tier calculation, and set completion bonuses.
 */

export const RARITY_POINTS = {
    'Common': 1,
    'Uncommon': 2,
    'Rare': 5,
    'Ultra Rare': 10,
    'Secret Rare': 15,
    // Fallbacks/Variations
    'Promo': 2,
    'Amazing Rare': 8,
    'Rare Holo': 6,
    'Rare Ultra': 10,
    'Rare Secret': 15
};

export const TIERS = [
    { name: 'Bronze', threshold: 0, color: '#cd7f32' },
    { name: 'Silver', threshold: 250, color: '#c0c0c0' },
    { name: 'Gold', threshold: 800, color: '#ffd700' },
    { name: 'Master', threshold: 1800, color: '#9400d3' }
];

export const UNLOCK_THRESHOLDS = {
    'Common': 0,      // Bronze
    'Uncommon': 0,    // Bronze
    'Rare': 250,      // Silver
    'Ultra Rare': 800, // Gold
    'Secret Rare': 1800 // Master
};

export class PointsService {
    constructor() {
        // No state needed here, purely functional logic mostly
    }

    /**
     * Calculate score for a single card entry (including duplicates)
     * @param {Object} card - Card object from collection (must have quantity and rarity)
     * @returns {number} Score
     */
    calculateCardScore(card) {
        let points = 0;
        const rarity = card.rarity || 'Common';

        // Find matching rarity point value (partial match or default)
        let basePoints = 1;
        for (const [key, val] of Object.entries(RARITY_POINTS)) {
            if (rarity.toLowerCase().includes(key.toLowerCase())) {
                basePoints = val;
                // Keep looking for more specific matches? 
                // Actually "Rare" matches "Rare Ultra", so we should sort keys by length desc or be specific.
                // Let's just take the first match if we order keys carefully or just use what we found.
                // Better approach: exact match first, then partial.
            }
        }

        // Refined rarity lookup
        const normalizedRarity = rarity.toLowerCase();
        if (normalizedRarity.includes('secret')) basePoints = RARITY_POINTS['Secret Rare'];
        else if (normalizedRarity.includes('ultra')) basePoints = RARITY_POINTS['Ultra Rare'];
        else if (normalizedRarity.includes('amazing')) basePoints = RARITY_POINTS['Amazing Rare'];
        else if (normalizedRarity.includes('holo')) basePoints = RARITY_POINTS['Rare Holo'];
        else if (normalizedRarity.includes('rare')) basePoints = RARITY_POINTS['Rare'];
        else if (normalizedRarity.includes('uncommon')) basePoints = RARITY_POINTS['Uncommon'];
        else basePoints = RARITY_POINTS['Common'];

        // First card gets full points
        if (card.quantity >= 1) {
            points += basePoints;
        }

        // Duplicates get 50% value
        if (card.quantity > 1) {
            points += (card.quantity - 1) * (basePoints * 0.5);
        }

        return points;
    }

    /**
     * Calculate total score for the entire collection
     * @param {Object} collection - Collection object from CollectionManager
     * @returns {number} Total score
     */
    calculateTotalScore(collection) {
        let total = 0;
        Object.values(collection).forEach(card => {
            total += this.calculateCardScore(card);
        });
        return Math.floor(total); // Return integer score
    }

    /**
     * Get current tier based on score
     * @param {number} score 
     * @returns {Object} Tier object { name, threshold, color }
     */
    getTier(score) {
        // Find the highest tier where threshold <= score
        let currentTier = TIERS[0];
        for (const tier of TIERS) {
            if (score >= tier.threshold) {
                currentTier = tier;
            } else {
                break;
            }
        }
        return currentTier;
    }

    /**
     * Get next tier details
     * @param {number} score 
     * @returns {Object|null} Next tier object or null if maxed
     */
    getNextTier(score) {
        for (const tier of TIERS) {
            if (score < tier.threshold) {
                return tier;
            }
        }
        return null; // Max tier reached
    }

    /**
     * Get base points for a card rarity
     * @param {string} rarity 
     * @returns {number}
     */
    getCardPoints(rarity) {
        const normalizedRarity = rarity.toLowerCase();
        if (normalizedRarity.includes('secret')) return RARITY_POINTS['Secret Rare'];
        if (normalizedRarity.includes('ultra')) return RARITY_POINTS['Ultra Rare'];
        if (normalizedRarity.includes('amazing')) return RARITY_POINTS['Amazing Rare'];
        if (normalizedRarity.includes('holo')) return RARITY_POINTS['Rare Holo'];
        if (normalizedRarity.includes('rare')) return RARITY_POINTS['Rare'];
        if (normalizedRarity.includes('uncommon')) return RARITY_POINTS['Uncommon'];
        return RARITY_POINTS['Common'];
    }

    /**
     * Get unlock threshold for a card rarity
     * @param {string} rarity 
     * @returns {number} Minimum score required
     */
    getUnlockThreshold(rarity) {
        const normalizedRarity = rarity.toLowerCase();
        if (normalizedRarity.includes('secret')) return UNLOCK_THRESHOLDS['Secret Rare'];
        if (normalizedRarity.includes('ultra')) return UNLOCK_THRESHOLDS['Ultra Rare'];
        if (normalizedRarity.includes('rare')) return UNLOCK_THRESHOLDS['Rare'];
        return 0; // Common/Uncommon unlocked by default
    }
}
