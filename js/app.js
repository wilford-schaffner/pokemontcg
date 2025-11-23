import { fetchCards, fetchSets, fetchTypes } from './api.js';
import { 
    renderCards, 
    clearCards, 
    renderSetOptions, 
    renderTypeOptions, 
    toggleLoading, 
    toggleLoadMore 
} from './ui.js';
import { DEFAULT_PAGE_SIZE } from './config.js';

// State
let state = {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    query: '', 
    filters: {
        search: '',
        set: '',
        type: ''
    },
    isLoading: false,
    hasMore: true
};

// DOM Elements
const elements = {
    cardsGrid: document.getElementById('cards-grid'),
    searchInput: document.getElementById('search-input'),
    setSelect: document.getElementById('set-select'),
    typeSelect: document.getElementById('type-select'),
    loadMoreBtn: document.getElementById('load-more-btn'),
};

// Helper to build the API query string from filters
function buildQuery() {
    const parts = [];
    if (state.filters.search) {
        parts.push(`name:"*${state.filters.search}*"`); // Wildcard search
    }
    if (state.filters.set) {
        parts.push(state.filters.set);
    }
    if (state.filters.type) {
        parts.push(state.filters.type);
    }
    return parts.join(' ');
}

async function loadCards(reset = false) {
    if (state.isLoading) return;
    
    state.isLoading = true;
    toggleLoading(true);
    
    if (reset) {
        state.page = 1;
        state.hasMore = true;
        clearCards(elements.cardsGrid);
        toggleLoadMore(false); // Hide while loading first batch
    }

    const query = buildQuery();

    try {
        const result = await fetchCards({
            page: state.page,
            pageSize: state.pageSize,
            query: query
        });

        renderCards(result.data, elements.cardsGrid);
        
        // Check if we have more pages
        // API returns totalCount. 
        const loadedCount = (state.page - 1) * state.pageSize + result.data.length;
        state.hasMore = loadedCount < result.totalCount;
        
        toggleLoadMore(state.hasMore);
        state.page++;

    } catch (error) {
        console.error('Failed to load cards', error);
        // Optionally show error to user
        // If reset failed, grid is empty, maybe show error message in grid
    } finally {
        state.isLoading = false;
        toggleLoading(false);
    }
}

async function init() {
    // Initial Load - Start this immediately
    const cardsPromise = loadCards(true);

    // Load Options - Run in parallel
    const filtersPromise = (async () => {
        try {
            const [sets, types] = await Promise.all([fetchSets(), fetchTypes()]);
            renderSetOptions(sets, elements.setSelect);
            renderTypeOptions(types, elements.typeSelect);
        } catch (error) {
            console.error('Failed to load filters', error);
        }
    })();

    // Event Listeners
    
    // Search (Debounced)
    let debounceTimer;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            state.filters.search = e.target.value.trim();
            loadCards(true);
        }, 500);
    });

    // Filters
    elements.setSelect.addEventListener('change', (e) => {
        state.filters.set = e.target.value;
        loadCards(true);
    });

    elements.typeSelect.addEventListener('change', (e) => {
        state.filters.type = e.target.value;
        loadCards(true);
    });

    // Load More
    elements.loadMoreBtn.addEventListener('click', () => {
        loadCards(false);
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);

