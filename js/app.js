import { fetchCardSummaries, fetchBatchDetails, fetchSets } from './api.js';
import { renderCardList, renderSetOptions, showLoading, renderCardModal, renderProgress, renderPaginationControls, renderDeckList, renderDeckDetail } from './ui.js';
import { CollectionManager } from './collection.js';
import { DeckManager } from './decks.js';

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
    deckManager: new DeckManager(),
    view: 'browse', // 'browse', 'collection', 'decks', 'deck-detail'
    currentDeckId: null // For deck-detail view
};

// DOM Elements
const contentArea = document.getElementById('content-area');
let cardGrid = document.getElementById('card-grid');
let paginationControls = document.getElementById('pagination-controls');
const searchInput = document.getElementById('search-input');
const setFilter = document.getElementById('set-filter');
const rarityFilter = document.getElementById('rarity-filter');
const modal = document.getElementById('card-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const navBrowse = document.getElementById('nav-browse');
const navCollection = document.getElementById('nav-collection');
const navDecks = document.getElementById('nav-decks');
const navSets = document.getElementById('nav-sets'); // We didn't impl Sets view yet but it's in nav

// Settings Elements
const btnSettings = document.getElementById('btn-settings');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const toggleDarkMode = document.getElementById('toggle-dark-mode');
const btnResetData = document.getElementById('btn-reset-data');

// Initialization
// Initialization
async function init() {
    showLoading(cardGrid);

    // Load Settings
    if (localStorage.getItem('pokemon-tcg-dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        if (toggleDarkMode) toggleDarkMode.checked = true;
    }

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
    if (state.view === 'decks') {
        renderDecksView();
        return;
    }
    if (state.view === 'deck-detail') {
        renderDeckDetailView();
        return;
    }

    // Browse View
    // Ensure grid is visible (might have been replaced by deck view content)
    ensureGridVisible();
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

    // Fetch details for the batch
    const detailedBatch = await fetchBatchDetails(batchSummaries);

    state.cards = [...state.cards, ...detailedBatch];

    // Render (append if not first batch)
    const isAppend = start > 0;
    renderCardList(detailedBatch, cardGrid, state.collectionManager, isAppend);

    // Render Pagination Controls
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

function ensureGridVisible() {
    // If we replaced content-area content, restore grid structure
    if (!document.getElementById('card-grid')) {
        contentArea.innerHTML = `
            <section id="card-grid" class="card-grid">
                <div class="loading-spinner">Loading cards...</div>
            </section>
            <div id="pagination-controls" class="pagination-controls"></div>
        `;
        // Re-assign references using the new DOM elements
        cardGrid = document.getElementById('card-grid');
        paginationControls = document.getElementById('pagination-controls');
    }
}

function renderDecksView() {
    state.currentDeckId = null;
    contentArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'decks-view';
    contentArea.appendChild(container);

    renderDeckList(state.deckManager.getAllDecks(), container, {
        onCreate: (name) => {
            state.deckManager.createDeck(name);
            renderDecksView(); // Refresh
        },
        onSelect: (deckId) => {
            state.currentDeckId = deckId;
            switchView('deck-detail');
        }
    });
}

function renderDeckDetailView() {
    const deck = state.deckManager.getDeck(state.currentDeckId);
    if (!deck) {
        switchView('decks');
        return;
    }

    contentArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'deck-detail-view';
    contentArea.appendChild(container);

    renderDeckDetail(deck, container, {
        onRemoveCard: (cardId) => {
            state.deckManager.removeCardFromDeck(deck.id, cardId);
            renderDeckDetailView(); // Refresh
        },
        onDeleteDeck: () => {
            if (confirm('Are you sure you want to delete this deck?')) {
                state.deckManager.deleteDeck(deck.id);
                switchView('decks');
            }
        },
        onBack: () => {
            switchView('decks');
        }
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

    navDecks.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('decks');
    });

    // Settings
    btnSettings.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    closeSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Dark Mode
    toggleDarkMode.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('pokemon-tcg-dark-mode', e.target.checked);
    });

    // Reset Data
    btnResetData.addEventListener('click', () => {
        if (confirm('Are you sure? This will execute "Order 66" on your data. (Delete everything)')) {
            localStorage.removeItem('pokemon-tcg-collection');
            localStorage.removeItem('pokemon-tcg-decks');
            window.location.reload();
        }
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
            } else if (state.view === 'collection') {
                filterCurrentCards();
            }
        }, 500);
    });

    // Set Filter
    setFilter.addEventListener('change', (e) => {
        state.filters.set = e.target.value;
        if (state.view === 'browse') {
            loadCards();
        } else if (state.view === 'collection') {
            filterCurrentCards();
        }
    });

    // Rarity Filter
    rarityFilter.addEventListener('change', (e) => {
        state.filters.rarity = e.target.value;
        if (state.view === 'browse') {
            loadCards();
        } else if (state.view === 'collection') {
            filterCurrentCards();
        }
    });

    // Card Click (Event Delegation) update for multiple views
    // Decks view might have cards too? Deck Detail view?
    // We should allow clicking cards in Deck Detail view to see details? Yes.
    // The event listener is on `cardGrid`. We need to attach it to `contentArea`?
    // Or just generic document listener for `.card-item`?
    // Let's move it to `contentArea` or document.
    contentArea.addEventListener('click', (e) => {
        const cardItem = e.target.closest('.card-item');
        if (cardItem) {
            // Check if inside a restricted area?
            if (cardItem.dataset.locked === 'true') {
                return;
            }

            const cardId = cardItem.dataset.id;
            let card = null;

            // Try to find card in currently loaded lists based on view
            if (state.view === 'browse') {
                card = state.cards.find(c => c.id === cardId);
            } else if (state.view === 'collection') {
                // Fallback to collection data
                const collected = state.collectionManager.collection[cardId];
                if (collected) card = collected;
            } else if (state.view === 'deck-detail') {
                // From current deck
                const deck = state.deckManager.getDeck(state.currentDeckId);
                if (deck) {
                    card = deck.cards.find(c => c.id === cardId);
                }
            }

            // Fallback: If not found in current context, maybe check global collection
            if (!card && state.collectionManager.collection[cardId]) {
                card = state.collectionManager.collection[cardId];
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
}

function switchView(viewName) {
    state.view = viewName;
    console.log('Switching to view:', viewName);

    // Update Nav UI
    navBrowse.classList.remove('active');
    navCollection.classList.remove('active');
    navDecks.classList.remove('active');
    // navSets.classList.remove('active');

    if (viewName === 'browse') {
        navBrowse.classList.add('active');
        ensureGridVisible();
        state.filters = { name: '', set: '', rarity: '' }; // Optional: Reset filters? Maybe Keep.
        // If we reset filters we need to update UI inputs. Let's keep filters for now.
        loadCards();
    } else if (viewName === 'collection') {
        navCollection.classList.add('active');
        ensureGridVisible();
        filterCurrentCards();
    } else if (viewName === 'decks') {
        navDecks.classList.add('active');
        renderDecksView();
    } else if (viewName === 'deck-detail') {
        navDecks.classList.add('active');
        renderDeckDetailView();
    }
}

function openModal(card) {
    renderCardModal(card, modalBody, state.collectionManager, state.deckManager, () => { // Pass deckManager
        // On update callback
        if (state.view === 'collection') {
            filterCurrentCards();
        } else if (state.view === 'browse') {
            // Re-render current list to update badges
            renderCardList(state.cards, cardGrid, state.collectionManager, false);
            // Restore pagination state if needed?
            const hasMore = state.cards.length < state.allCardSummaries.length;
            renderPaginationControls(paginationControls, hasMore, async () => {
                await loadMoreCards();
            });
        }
        updateProgressUI();
    });
    modal.classList.remove('hidden');
}

function filterCurrentCards() {
    ensureGridVisible();
    let filtered = [];

    if (state.view === 'collection') {
        // Get all owned cards
        const ownedCards = state.collectionManager.getAll();
        // Filter owned cards by current filters
        filtered = ownedCards.filter(card => {
            const matchName = !state.filters.name || card.name.toLowerCase().includes(state.filters.name.toLowerCase());
            const matchRarity = !state.filters.rarity || card.rarity === state.filters.rarity;
            const matchSet = !state.filters.set || (card.set && (typeof card.set === 'string' ? card.set === state.filters.set : card.set.id === state.filters.set));
            return matchName && matchRarity && matchSet;
        });

        // Pagination for collection? 
        // For now just render all (performance might be issue if > 1000 cards)
        renderCardList(filtered, document.getElementById('card-grid'), state.collectionManager);
        document.getElementById('pagination-controls').innerHTML = ''; // No pagination in collection for now
    }
}

// Start App
document.addEventListener('DOMContentLoaded', init);
