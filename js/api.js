const BASE_URL = 'https://api.tcgdex.net/v2/en';

/**
 * Fetch all sets
 * @returns {Promise<Array>} List of sets
 */
export async function fetchSets() {
    try {
        const response = await fetch(`${BASE_URL}/sets`);
        if (!response.ok) throw new Error('Failed to fetch sets');
        return await response.json();
    } catch (error) {
        console.error('Error fetching sets:', error);
        return [];
    }
}

/**
 * Fetch card summaries (lightweight data) with optional filters
 * @param {Object} filters - { set, rarity, name }
 * @returns {Promise<Array>} List of card summaries (id, localId, name, image)
 */
export async function fetchCardSummaries(filters = {}) {
    try {
        let cards = [];

        if (filters.rarity) {
            const url = `${BASE_URL}/rarities/${filters.rarity}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch rarity cards');
            const data = await response.json();
            cards = data.cards || [];

            // If Set is also selected, filter by Set ID prefix
            if (filters.set) {
                cards = cards.filter(card => card.id.startsWith(filters.set));
            }
        } else if (filters.set) {
            const url = `${BASE_URL}/sets/${filters.set}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch set cards');
            const data = await response.json();
            cards = data.cards || [];
        } else {
            const url = `${BASE_URL}/cards`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch cards');
            cards = await response.json();
        }

        // Filter out cards without images or with weird IDs
        cards = cards.filter(card => card.image && !card.localId.includes('!') && !card.localId.includes('?'));

        if (filters.name) {
            const term = filters.name.toLowerCase();
            cards = cards.filter(card => card.name.toLowerCase().includes(term));
        }

        return cards;
    } catch (error) {
        console.error('Error fetching cards:', error);
        return [];
    }
}

/**
 * Fetch full details for a batch of cards
 * @param {Array} cardSummaries 
 * @returns {Promise<Array>} List of detailed cards
 */
export async function fetchBatchDetails(cardSummaries) {
    const detailedCards = await Promise.all(cardSummaries.map(async (card) => {
        try {
            return await fetchCardDetails(card.id);
        } catch (e) {
            console.error(`Failed to fetch details for ${card.id}`, e);
            return null;
        }
    }));

    // If detail fetch fails, we might want to fall back to summary or just filter out.
    // Let's filter out nulls.
    return detailedCards.filter(c => c !== null);
}

/**
 * Fetch single card details
 * @param {string} id 
 */
export async function fetchCardDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}/cards/${id}`);
        if (!response.ok) throw new Error('Failed to fetch card details');
        return await response.json();
    } catch (error) {
        console.error('Error fetching card details:', error);
        return null;
    }
}
