import { fetchCards, fetchSets } from './api.js';
import { renderCardList, renderSetOptions, showLoading, renderCardModal } from './ui.js';
import { CollectionManager } from './collection.js';

// State
const state = {
    cards: [],
    sets: [],
    filters: {
        name: '',
        set: '',
        rarity: ''
    },
    collectionManager: new CollectionManager(),
    view: 'browse' // 'browse' or 'collection'
};

// DOM Elements
const cardGrid = document.getElementById('card-grid');
const searchInput = document.getElementById('search-input');
const setFilter = document.getElementById('set-filter');
const rarityFilter = document.getElementById('rarity-filter');
const modal = document.getElementById('card-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const navBrowse = document.getElementById('nav-browse');
const navCollection = document.getElementById('nav-collection');

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
    // In a real app, we might fetch differently for collection, 
    // but here we filter client-side from the main list or fetch all if needed.
    // For now, we assume state.cards holds the current fetched batch.
    // If "My Collection" needs to show cards NOT in the current batch, we'd need to fetch them by ID.
    // However, the current API usage fetches a limited batch or by set.
    // To properly show "My Collection", we should probably fetch the specific cards owned if they aren't loaded.
    // For simplicity in this iteration, we will just filter the CURRENTLY LOADED cards or 
    // if in collection view, we might need to fetch details for all owned cards.

    if (state.view === 'collection') {
        // If we are in collection view, we need to ensure we have the card data for owned cards.
        // The collection manager has minimal data.
        // Let's rely on filterCurrentCards to handle the display logic, 
        // assuming for now we are operating on the loaded set or search results.
        // Ideally, we would fetch all owned cards here.
        // Let's try to fetch details for owned cards if we are in collection view.
        const ownedIds = Object.keys(state.collectionManager.collection);
        if (ownedIds.length > 0) {
            // This might be heavy if many cards, but for now it's okay.
            // Actually, let's just use the data we have in collection manager if possible, 
            // or fetch if missing.
            // For this step, let's stick to filtering the current view to avoid complex fetching logic changes.
        }
    } else {
        state.cards = await fetchCards(state.filters);
    }

    filterCurrentCards();
}

function setupEventListeners() {
    // Navigation
    navBrowse.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('browse');
    });

    navCollection.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('collection');
    });

    // Search Debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            state.filters.name = e.target.value;
            // If in browse mode, we re-fetch. In collection mode, we filter client side.
            if (state.view === 'browse') {
                loadCards();
            } else {
                filterCurrentCards();
            }
        }, 500);
    });

    // Set Filter
    setFilter.addEventListener('change', (e) => {
        state.filters.set = e.target.value;
        if (state.view === 'browse') {
            loadCards();
        } else {
            filterCurrentCards();
        }
    });

    // Rarity Filter
    rarityFilter.addEventListener('change', (e) => {
        state.filters.rarity = e.target.value;
        filterCurrentCards();
    });

    // Card Click (Event Delegation)
    cardGrid.addEventListener('click', (e) => {
        const cardItem = e.target.closest('.card-item');
        if (cardItem) {
            const cardId = cardItem.dataset.id;
            // Look in state.cards first, then try collection manager
            let card = state.cards.find(c => c.id === cardId);
            if (!card && state.view === 'collection') {
                // Fallback to collection data if not in current main list
                const collected = state.collectionManager.collection[cardId];
                if (collected) {
                    // Reconstruct enough card data for the modal
                    card = {
                        id: collected.id,
                        name: collected.name,
                        image: collected.image,
                        rarity: collected.rarity,
                        // Missing types/hp/set name in minimal storage, 
                        // but we can live with it or fetch it.
                        types: [],
                        set: 'Unknown'
                    };
                }
            }

            if (card) {
                openModal(card);
            }
        }
    });

    // Modal Close
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

function switchView(viewName) {
    state.view = viewName;

    // Update Nav UI
    if (viewName === 'browse') {
        navBrowse.classList.add('active');
        navCollection.classList.remove('active');
        // Reset filters or keep them? Let's keep them but re-fetch
        loadCards();
    } else {
        navCollection.classList.add('active');
        navBrowse.classList.remove('active');
        // In collection view, we want to show owned cards. 
        // We might need to clear the grid and render from collection.
        filterCurrentCards();
    }
}

function openModal(card) {
    renderCardModal(card, modalBody, state.collectionManager, () => {
        filterCurrentCards();
    });
    modal.classList.remove('hidden');
}

function filterCurrentCards() {
    let filtered = [];

    if (state.view === 'collection') {
        // Get all owned cards
        const ownedCards = state.collectionManager.getAll();
        // Filter owned cards by current filters
        filtered = ownedCards.filter(card => {
            const matchName = !state.filters.name || card.name.toLowerCase().includes(state.filters.name.toLowerCase());
            const matchRarity = !state.filters.rarity || card.rarity === state.filters.rarity;
            // Set filter might be hard if we don't store set ID in collection. 
            // We didn't store set ID in collection.js add() method.
            // For now, ignore set filter in collection view or update collection.js to store it.
            return matchName && matchRarity;
        });
    } else {
        filtered = state.cards;
        if (state.filters.rarity) {
            filtered = filtered.filter(card => card.rarity === state.filters.rarity);
        }
        if (state.filters.name) {
            filtered = filtered.filter(card => card.name.toLowerCase().includes(state.filters.name.toLowerCase()));
        }
    }

    renderCardList(filtered, cardGrid, state.collectionManager);
}

// Start App
document.addEventListener('DOMContentLoaded', init);
