import { fetchCardSummaries, fetchBatchDetails, fetchSets } from './api.js';
import { renderCardList, renderSetOptions, showLoading, renderCardModal, renderProgress, renderPaginationControls } from './ui.js';
import { CollectionManager } from './collection.js';

// State
const state = {
    allCardSummaries: [], // Full list of simplified cards matching filters
    cards: [], // Currently loaded detailed cards
    sets: [],
    filters: {
        name: '',
        set: '', // Default to All Sets
        rarity: ''
    },
    collectionManager: new CollectionManager(),
    view: 'browse' // 'browse' or 'collection'
};

// DOM Elements
const cardGrid = document.getElementById('card-grid');
const paginationControls = document.getElementById('pagination-controls');
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
    setFilter.value = state.filters.set; // Sync UI with state

    // Load Initial Cards
    await loadCards();

    // Initial Progress Render
    updateProgressUI();

    // Event Listeners
    setupEventListeners();
}

function updateProgressUI() {
    const score = state.collectionManager.getScore();
    const tier = state.collectionManager.getTier();
    const nextTier = state.collectionManager.getNextTier();
    renderProgress(score, tier, nextTier);
}

// Main function to load cards based on current filters
async function loadCards() {
    if (state.view === 'collection') {
        filterCurrentCards();
        return;
    }

    showLoading(cardGrid);
    paginationControls.innerHTML = ''; // Clear pagination

    // Fetch all summaries matching the filters
    state.allCardSummaries = await fetchCardSummaries(state.filters);
    state.cards = []; // Reset detailed cards

    // Initial load of first batch
    await loadMoreCards();
}

// Load next batch of cards
async function loadMoreCards() {
    const start = state.cards.length;
    const end = start + 20;
    const batchSummaries = state.allCardSummaries.slice(start, end);

    if (batchSummaries.length === 0) {
        if (state.cards.length === 0) {
            renderCardList([], cardGrid); // Render "No results"
        }
        renderPaginationControls(paginationControls, false, null);
        return;
    }

    // Show small loading indicator if appending? 
    // Or just fetch. User interaction handles "Load More" click.
    // If it's the first batch, cardGrid might be showing "Loading...".
    // If appending, we might want a spinner at bottom. 
    // For simplicity, just fetch.

    // Fetch details for the batch
    const detailedBatch = await fetchBatchDetails(batchSummaries);

    state.cards = [...state.cards, ...detailedBatch];

    // Render (append if not first batch)
    const isAppend = start > 0;
    renderCardList(detailedBatch, cardGrid, state.collectionManager, isAppend);

    // Render Pagination Controls
    const hasMore = state.cards.length < state.allCardSummaries.length;
    renderPaginationControls(paginationControls, hasMore, async () => {
        // Show loading state on button?
        const btn = paginationControls.querySelector('button');
        if (btn) {
            btn.textContent = 'Loading...';
            btn.disabled = true;
        }
        await loadMoreCards();
    });
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
        if (state.view === 'browse') {
            loadCards();
        } else {
            filterCurrentCards();
        }
    });

    // Card Click (Event Delegation)
    cardGrid.addEventListener('click', (e) => {
        const cardItem = e.target.closest('.card-item');
        if (cardItem) {
            if (cardItem.dataset.locked === 'true') {
                return;
            }
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
        paginationControls.style.display = 'block'; // Show pagination in browse
        loadCards();
    } else {
        navCollection.classList.add('active');
        navBrowse.classList.remove('active');
        paginationControls.style.display = 'none'; // Hide pagination in collection (for now)
        // In collection view, we want to show owned cards. 
        filterCurrentCards();
    }
}

function openModal(card) {
    renderCardModal(card, modalBody, state.collectionManager, () => {
        // If in collection view, refresh list. If browse, maybe not needed unless we show owned status?
        // Updating owned status in browse list would require re-rendering the specific card or all.
        // For simplicity, let's re-render the visible list if in browse, or filter if in collection.
        if (state.view === 'collection') {
            filterCurrentCards();
        } else {
            // In browse, just update the owned badge on the specific card in the grid if possible
            // Or re-render everything (might be heavy).
            // Let's just update progress UI for now. Re-rendering `state.cards` from memory is cheap enough?
            // Actually re-rendering 20-40 cards is fine.
            renderCardList(state.cards, cardGrid, state.collectionManager, false);
            // Re-render pagination controls? They stick around.
            const hasMore = state.cards.length < state.allCardSummaries.length;
            renderPaginationControls(paginationControls, hasMore, async () => {
                const btn = paginationControls.querySelector('button');
                if (btn) {
                    btn.textContent = 'Loading...';
                    btn.disabled = true;
                }
                await loadMoreCards();
            });
        }
        updateProgressUI();
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
            return matchName && matchRarity;
        });

        renderCardList(filtered, cardGrid, state.collectionManager);
    }
    // Browse view handled by loadCards
}

// Start App
document.addEventListener('DOMContentLoaded', init);
