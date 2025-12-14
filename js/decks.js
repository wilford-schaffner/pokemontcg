/**
 * Deck Manager
 * Handles user's deck creation, modification, and persistence.
 */
export class DeckManager {
    constructor() {
        this.storageKey = 'pokemon-tcg-decks';
        this.decks = []; // Array of { id: string, name: string, cards: [] }
        this.load();
    }

    /**
     * Load decks from LocalStorage
     */
    load() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.decks = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse decks from storage', e);
                this.decks = [];
            }
        }
    }

    /**
     * Save decks to LocalStorage
     */
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.decks));
    }

    /**
     * Create a new deck
     * @param {string} name 
     * @returns {Object} The new deck
     */
    createDeck(name) {
        if (!name || !name.trim()) return null;

        const newDeck = {
            id: 'deck_' + Date.now().toString(36),
            name: name.trim(),
            cards: [], // Array of { card object }
            createdAt: new Date().toISOString()
        };

        this.decks.push(newDeck);
        this.save();
        return newDeck;
    }

    /**
     * Delete a deck by ID
     * @param {string} deckId 
     */
    deleteDeck(deckId) {
        this.decks = this.decks.filter(d => d.id !== deckId);
        this.save();
    }

    /**
     * Get a deck by ID
     * @param {string} deckId 
     * @returns {Object|undefined}
     */
    getDeck(deckId) {
        return this.decks.find(d => d.id === deckId);
    }

    /**
     * Get all decks
     * @returns {Array}
     */
    getAllDecks() {
        return this.decks;
    }

    /**
     * Add a card to a deck
     * @param {string} deckId 
     * @param {Object} card 
     * @returns {boolean} Success
     */
    addCardToDeck(deckId, card) {
        const deck = this.getDeck(deckId);
        if (!deck) return false;

        // Limit 60 cards per deck? Or just a list? 
        // Proposal says "Decks/Lists", so maybe looser limits.
        // Let's enforce standard 60 limit for fun, but maybe make it optional or soft.
        // For now, no hard limit, just a list.

        // Store copy of card to ensure deck stays valid even if collection changes?
        // Or store ref? Better to store minimal copy.
        const cardEntry = {
            id: card.id,
            name: card.name,
            image: card.image,
            rarity: card.rarity,
            types: card.types || [],
            supertype: card.supertype || 'Pokémon',
            set: card.set || 'Unknown'
        };

        deck.cards.push(cardEntry);
        this.save();
        return true;
    }

    /**
     * Remove a card from a deck (by index or ID? Decks can have duplicates)
     * We should remove one instance of the card.
     * @param {string} deckId 
     * @param {string} cardId 
     */
    removeCardFromDeck(deckId, cardId) {
        const deck = this.getDeck(deckId);
        if (!deck) return;

        // Find index of first match
        const index = deck.cards.findIndex(c => c.id === cardId);
        if (index !== -1) {
            deck.cards.splice(index, 1);
            this.save();
        }
    }
}
