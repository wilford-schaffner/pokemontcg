import { fetchCards, fetchSets } from './api.js';
import { renderCardList, renderSetOptions, showLoading } from './ui.js';

// State
const state = {
    cards: [],
    sets: [],
    filters: {
        name: '',
        set: '',
        rarity: ''
    }
};

// DOM Elements
const cardGrid = document.getElementById('card-grid');
const searchInput = document.getElementById('search-input');
const setFilter = document.getElementById('set-filter');
const rarityFilter = document.getElementById('rarity-filter');

// Initialization
async function init() {
    showLoading(cardGrid);

    // Load Sets
    state.sets = await fetchSets();
    renderSetOptions(state.sets, setFilter);

    // Load Initial Cards
    await loadCards();

    // Event Listeners
    setupEventListeners();
}

async function loadCards() {
    showLoading(cardGrid);
    state.cards = await fetchCards(state.filters);
    renderCardList(state.cards, cardGrid);
}

function setupEventListeners() {
    // Search Debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            state.filters.name = e.target.value;
            loadCards();
        }, 500);
    });

    // Set Filter
    setFilter.addEventListener('change', (e) => {
        state.filters.set = e.target.value;
        loadCards();
    });

    // Rarity Filter - Note: API filtering for rarity might need client side if not supported by endpoint
    rarityFilter.addEventListener('change', (e) => {
        state.filters.rarity = e.target.value;
        // If we are filtering client side for now:
        // loadCards(); 
        // But better to re-fetch if possible or filter current state
        filterCurrentCards();
    });
}

function filterCurrentCards() {
    let filtered = state.cards;

    if (state.filters.rarity) {
        filtered = filtered.filter(card => card.rarity === state.filters.rarity);
    }

    // Re-apply name filter if needed (though API handles it usually)
    if (state.filters.name) {
        filtered = filtered.filter(card => card.name.toLowerCase().includes(state.filters.name.toLowerCase()));
    }

    renderCardList(filtered, cardGrid);
}

// Start App
document.addEventListener('DOMContentLoaded', init);
