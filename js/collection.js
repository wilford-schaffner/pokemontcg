/**
 * Collection Manager
 * Handles user's card collection, persistence, and quantity tracking.
 */
export class CollectionManager {
    constructor() {
        this.storageKey = 'pokemon-tcg-collection';
        this.collection = {}; // { cardId: { quantity: number, ...cardData } }
        this.load();
    }

    /**
     * Load collection from LocalStorage
     */
    load() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.collection = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse collection from storage', e);
                this.collection = {};
            }
        }
    }

    /**
     * Save collection to LocalStorage
     */
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.collection));
    }

    /**
     * Add a card to the collection
     * @param {Object} card - Card object
     */
    add(card) {
        if (!this.collection[card.id]) {
            this.collection[card.id] = {
                quantity: 0,
                // Store minimal data needed for display if offline/cache
                name: card.name,
                image: card.image,
                rarity: card.rarity,
                id: card.id
            };
        }
        this.collection[card.id].quantity++;
        this.save();
    }

    /**
     * Remove a card from the collection
     * @param {string} cardId 
     */
    remove(cardId) {
        if (this.collection[cardId]) {
            this.collection[cardId].quantity--;
            if (this.collection[cardId].quantity <= 0) {
                delete this.collection[cardId];
            }
            this.save();
        }
    }

    /**
     * Get quantity of a specific card
     * @param {string} cardId 
     * @returns {number}
     */
    getQuantity(cardId) {
        return this.collection[cardId] ? this.collection[cardId].quantity : 0;
    }

    /**
     * Get all collected cards
     * @returns {Array}
     */
    getAll() {
        return Object.values(this.collection);
    }
}
