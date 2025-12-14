/**
 * Render a list of cards to the grid
 * @param {Array} cards 
 * @param {HTMLElement} container 
 * @param {Object} collectionManager - Optional collection manager instance
 */
/**
 * Render a list of cards to the grid
 * @param {Array} cards 
 * @param {HTMLElement} container 
 * @param {Object} collectionManager - Optional collection manager instance
 * @param {boolean} append - If true, append to existing content instead of replacing
 */
export function renderCardList(cards, container, collectionManager = null, append = false) {
    if (!append) {
        container.innerHTML = '';
    }

    if (cards.length === 0 && !append) {
        container.innerHTML = '<div class="no-results">No cards found.</div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    // We need points service to check lock status. 
    // Since collectionManager has pointsService, we can access it or duplicate logic.
    // Ideally collectionManager exposes a helper, but let's assume we can access it via collectionManager.pointsService
    // or we just import PointsService here? Importing is cleaner if we don't want to leak internals.
    // But collectionManager is passed in. Let's assume collectionManager has a helper `isCardLocked(rarity)`?
    // No, we didn't add that. Let's use the PointsService instance if available or import it.
    // Let's import PointsService to be safe and consistent.

    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        cardEl.dataset.id = card.id; // Store ID for click handling

        const imageUrl = card.image ? `${card.image}/low.png` : 'placeholder.svg';

        // Map rarity to symbol
        let raritySymbol = '';
        const rarityName = card.rarity || 'Unknown';
        if (rarityName.toLowerCase().includes('common')) raritySymbol = '●';
        else if (rarityName.toLowerCase().includes('uncommon')) raritySymbol = '◆';
        else if (rarityName.toLowerCase().includes('rare')) raritySymbol = '★';
        else raritySymbol = '★';

        const types = card.types ? card.types.join(', ') : 'Unknown';

        // Check collection status
        let ownedBadge = '';
        if (collectionManager) {
            const quantity = collectionManager.getQuantity(card.id);
            if (quantity > 0) {
                ownedBadge = `<div class="card-owned-badge">Owned: ${quantity}</div>`;
            }
        }

        // Points and Locking
        let pointsBadge = '';
        let lockOverlay = '';
        let isLocked = false;

        if (collectionManager && collectionManager.pointsService) {
            const points = collectionManager.pointsService.getCardPoints(rarityName);
            pointsBadge = `<div class="card-points-badge">${points} pts</div>`;

            const unlockThreshold = collectionManager.pointsService.getUnlockThreshold(rarityName);
            const currentScore = collectionManager.getScore(); // Get score safely

            if (currentScore < unlockThreshold) {
                isLocked = true;
                cardEl.classList.add('card-locked');
                const needed = unlockThreshold - currentScore;
                lockOverlay = `
                    <div class="lock-overlay">
                        <div class="lock-icon">🔒</div>
                        <div class="lock-text">Need ${unlockThreshold} pts</div>
                        <div class="lock-subtext">(${needed} more)</div>
                    </div>
                `;
            }
        }

        cardEl.innerHTML = `
            ${ownedBadge}
            ${!isLocked ? pointsBadge : ''}
            ${lockOverlay}
            <div class="card-image-container">
                <img src="${imageUrl}" alt="${card.name}" class="card-image" loading="lazy">
            </div>
            <div class="card-info">
                <h3 class="card-name">${card.name}</h3>
                <div class="card-meta">
                    <span class="card-type">${types}</span>
                </div>
                <div class="card-meta">
                    <span class="rarity-badge" title="${rarityName}">${raritySymbol} ${rarityName}</span>
                </div>
            </div>
        `;

        if (isLocked) {
            // Prevent click or handle it differently? 
            // The event listener in app.js checks for .card-item. 
            // We can add a data attribute or class to prevent opening.
            cardEl.dataset.locked = 'true';
            cardEl.setAttribute('aria-disabled', 'true');
        } else {
            cardEl.tabIndex = 0;
            cardEl.role = 'button';
            cardEl.setAttribute('aria-label', `View details for ${card.name}`);
            cardEl.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cardEl.click();
                }
            };
        }

        fragment.appendChild(cardEl);
    });

    container.appendChild(fragment);
}

/**
 * Render pagination controls
 * @param {HTMLElement} container 
 * @param {boolean} hasMore 
 * @param {Function} onLoadMore 
 */
export function renderPaginationControls(container, hasMore, onLoadMore) {
    container.innerHTML = '';
    if (hasMore) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'btn-secondary load-more-btn';
        loadMoreBtn.textContent = 'Load More Cards';
        loadMoreBtn.onclick = onLoadMore;
        container.appendChild(loadMoreBtn);
    }
}



/**
 * Populate the set filter dropdown
 * @param {Array} sets 
 * @param {HTMLSelectElement} selectElement 
 */
export function renderSetOptions(sets, selectElement) {
    // Sort sets by release date (newest first) if available, or name
    // sets.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

    const fragment = document.createDocumentFragment();

    // Filter out known broken sets that return empty data from the API
    // Filter out known broken sets that return empty data or have no images
    const BROKEN_SETS = ["wp", "jumbo", "bog", "ex5.5", "tk-ex-latio", "tk-ex-latia", "exu", "tk-ex-p", "tk-ex-m", "tk-dp-l", "tk-dp-m", "tk-hs-g", "tk-hs-r", "2011bw", "tk-bw-z", "tk-bw-e", "2012bw", "xya", "tk-xy-sy", "tk-xy-n", "2014xy", "tk-xy-b", "tk-xy-w", "tk-xy-latia", "tk-xy-latio", "2015xy", "tk-xy-p", "tk-xy-su", "2016xy", "tk-sm-l", "tk-sm-r", "2017sm", "sm3.5", "sm7.5", "2018sm", "2019sm", "2021swsh", "mep"];

    sets.filter(set => !BROKEN_SETS.includes(set.id)).forEach(set => {
        const option = document.createElement('option');
        option.value = set.id;
        option.textContent = set.name;
        fragment.appendChild(option);
    });

    selectElement.appendChild(fragment);
}

export function showLoading(container) {
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
}

/**
 * Render user progress in the header
 * @param {number} score 
 * @param {Object} tier 
 * @param {Object|null} nextTier 
 */
export function renderProgress(score, tier, nextTier) {
    const container = document.getElementById('user-progress');
    if (!container) return;

    let progressPercent = 100;
    let nextLabel = 'Max Level';

    if (nextTier) {
        const prevThreshold = tier.threshold;
        const nextThreshold = nextTier.threshold;
        const range = nextThreshold - prevThreshold;
        const current = score - prevThreshold;
        progressPercent = Math.min(100, Math.max(0, (current / range) * 100));
        nextLabel = `${Math.floor(nextThreshold - score)} pts to ${nextTier.name}`;
    }

    container.innerHTML = `
        <div class="tier-badge" style="background-color: ${tier.color}">${tier.name}</div>
        <div class="progress-info">
            <span>${score} Points</span>
            <div class="progress-bar-container" title="${nextLabel}">
                <div class="progress-bar-fill" style="width: ${progressPercent}%; background-color: ${tier.color}"></div>
            </div>
        </div>
    `;
}

/**
 * Render the list of decks
 * @param {Array} decks 
 * @param {HTMLElement} container 
 * @param {Object} callbacks - { onCreate, onSelect }
 */
export function renderDeckList(decks, container, callbacks) {
    container.innerHTML = `
        <div class="decks-header" style="margin-bottom: 2rem;">
            <h2>My Decks</h2>
        </div>
        <div class="decks-grid">
            <div class="deck-card deck-card-new" id="create-deck-card">
                <span style="font-size: 2rem;">+</span>
                <span>Create New Deck</span>
            </div>
            <!-- Decks will be injected here -->
        </div>
    `;

    const grid = container.querySelector('.decks-grid');

    decks.forEach(deck => {
        const card = document.createElement('div');
        card.className = 'deck-card';
        card.tabIndex = 0;
        card.role = 'button';
        card.setAttribute('aria-label', `Open deck ${deck.name}`);
        card.innerHTML = `
            <div class="deck-name">${deck.name}</div>
            <div class="deck-count">${deck.cards.length} cards</div>
        `;
        card.onclick = () => callbacks.onSelect(deck.id);
        card.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callbacks.onSelect(deck.id);
            }
        };
        grid.appendChild(card);
    });

    // Create Handler
    const createBtn = container.querySelector('#create-deck-card');
    createBtn.tabIndex = 0;
    createBtn.role = 'button';
    createBtn.setAttribute('aria-label', 'Create new deck');

    const handleCreate = () => {
        const name = prompt("Enter deck name:");
        if (name) {
            callbacks.onCreate(name);
        }
    };

    createBtn.onclick = handleCreate;
    createBtn.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCreate();
        }
    };
}

/**
 * Render deck detail view
 * @param {Object} deck 
 * @param {HTMLElement} container 
 * @param {Object} callbacks - { onRemoveCard, onDeleteDeck, onBack }
 */
export function renderDeckDetail(deck, container, callbacks) {
    container.innerHTML = `
        <div class="deck-detail-header">
            <div>
                <button class="btn-text-danger" style="color: #666; text-decoration: none; margin-bottom: 0.5rem;" id="btn-back">← Back to Decks</button>
                <h1>${deck.name}</h1>
                <span style="color: #666;">${deck.cards.length} cards</span>
            </div>
            <div class="deck-actions">
                <button class="btn-danger" id="btn-delete-deck">Delete Deck</button>
                <!-- Export/Import could go here -->
            </div>
        </div>
        <div class="card-grid" id="deck-card-grid">
            <!-- Cards -->
        </div>
    `;

    // Render cards using existing renderCardList but we might want custom actions
    // Actually renderCardList is specific to grid with click-to-open.
    // That's fine, clicking opens modal where they can remove it or see details.
    // However, `renderCardList` attaches "Owned" badge.
    // The deck might contain cards not in collection? (Proxy?) 
    // Assuming for now user only adds owned cards, but technically DeckManager allows copies.

    // We can use renderCardList.
    // But we need to handle "Remove" from here maybe? Or via modal.
    // Let's use renderCardList for consistency.

    const grid = container.querySelector('#deck-card-grid');

    // Pass null for collectionManager to not show "Owned" badges? Or pass it if available.
    // We don't have collectionManager passed here. 
    // Ideally we pass it to show owned counts still.
    // But for now let's just render visuals.

    // We need to re-import renderCardList or use the one in this file. 
    // It's in this file.

    // Warning: recursive dependency if we imported things awkwardly, but we are in ui.js

    renderCardList(deck.cards, grid, null); // No collection manager passed, so no owned badges for now.

    // Wire up buttons
    container.querySelector('#btn-back').onclick = callbacks.onBack;
    container.querySelector('#btn-delete-deck').onclick = callbacks.onDeleteDeck;
}

/**
 * Render the card detail modal
 * @param {Object} card 
 * @param {HTMLElement} modalBody 
 * @param {Object} collectionManager 
 * @param {Object} deckManager - Optional
 * @param {Function} onUpdate - Callback when collection updates
 */
export function renderCardModal(card, modalBody, collectionManager, deckManager, onUpdate) {
    const imageUrl = card.image ? `${card.image}/high.png` : 'placeholder.svg';
    const quantity = collectionManager ? collectionManager.getQuantity(card.id) : 0;

    // Get points
    let points = 0;
    if (collectionManager && collectionManager.pointsService) {
        points = collectionManager.pointsService.getCardPoints(card.rarity || '');
    }

    // Deck Selector Options
    let deckOptionsHtml = '<option value="">Select a deck...</option>';
    if (deckManager) {
        const decks = deckManager.getAllDecks();
        decks.forEach(d => {
            deckOptionsHtml += `<option value="${d.id}">${d.name}</option>`;
        });
    }

    modalBody.innerHTML = `
        <div class="modal-detail-view">
            <div class="modal-image-container">
                <img src="${imageUrl}" alt="${card.name}">
            </div>
            <div class="modal-info">
                <div class="modal-header-row">
                    <h2>${card.name}</h2>
                    <span class="modal-points-badge">${points} pts</span>
                </div>
                <div class="modal-meta">
                    <span class="modal-stat">Set: ${card.set.name || card.set}</span>
                    <span class="modal-stat">Rarity: ${card.rarity}</span>
                    <span class="modal-stat">Type: ${card.types ? card.types.join(', ') : 'N/A'}</span>
                    <span class="modal-stat">HP: ${card.hp || 'N/A'}</span>
                </div>
                
                <div class="collection-actions">
                    <h3>My Collection (Owned: <span id="owned-qty">${quantity}</span>)</h3>
                    <div class="collection-controls-manual">
                        <div class="qty-selector">
                            <button class="btn-control" id="btn-minus">-</button>
                            <input type="number" id="input-qty" value="1" min="1" max="99">
                            <button class="btn-control" id="btn-plus">+</button>
                        </div>
                        <button class="btn-primary" id="btn-add-collection">Add to Collection</button>
                    </div>
                    <div class="remove-action">
                        <button class="btn-text-danger" id="btn-remove-one">Remove 1 Copy</button>
                    </div>
                </div>

                ${deckManager ? `
                <div class="collection-actions">
                    <h3>Decks</h3>
                    <div class="collection-controls-manual">
                        <select id="deck-select" style="padding: 0.5rem; border-radius: 8px; border: 1px solid #ddd; margin-right: 0.5rem;">
                            ${deckOptionsHtml}
                        </select>
                        <button class="btn-primary" id="btn-add-deck" style="background-color: #2563eb;">Add to Deck</button>
                    </div>
                </div>
                ` : ''}

                <div style="margin-top: 2rem; color: #666; font-size: 0.9rem;">
                    <p>Illustrator: ${card.illustrator || 'Unknown'}</p>
                    <p>${card.effect || ''}</p>
                </div>
            </div>
        </div>
    `;

    // Attach event listeners
    const btnMinus = modalBody.querySelector('#btn-minus');
    const btnPlus = modalBody.querySelector('#btn-plus');
    const inputQty = modalBody.querySelector('#input-qty');
    const btnAdd = modalBody.querySelector('#btn-add-collection');
    const btnRemove = modalBody.querySelector('#btn-remove-one');
    const ownedDisplay = modalBody.querySelector('#owned-qty');

    btnMinus.onclick = () => {
        let val = parseInt(inputQty.value) || 1;
        if (val > 1) inputQty.value = val - 1;
    };

    btnPlus.onclick = () => {
        let val = parseInt(inputQty.value) || 1;
        inputQty.value = val + 1;
    };

    btnAdd.onclick = () => {
        const addAmount = parseInt(inputQty.value) || 1;
        for (let i = 0; i < addAmount; i++) {
            collectionManager.add(card);
        }
        // Update display
        ownedDisplay.textContent = collectionManager.getQuantity(card.id);
        // Reset input? Maybe keep it.
        if (onUpdate) onUpdate();

        // Visual feedback
        btnAdd.textContent = "Added!";
        setTimeout(() => btnAdd.textContent = "Add to Collection", 1000);
    };

    btnRemove.onclick = () => {
        collectionManager.remove(card.id);
        ownedDisplay.textContent = collectionManager.getQuantity(card.id);
        if (onUpdate) onUpdate();
    };

    // Deck listeners
    if (deckManager) {
        const btnAddDeck = modalBody.querySelector('#btn-add-deck');
        const deckSelect = modalBody.querySelector('#deck-select');

        btnAddDeck.onclick = () => {
            const deckId = deckSelect.value;
            if (!deckId) {
                alert('Please select a deck.');
                return;
            }
            if (deckManager.addCardToDeck(deckId, card)) {
                btnAddDeck.textContent = "Added!";
                setTimeout(() => btnAddDeck.textContent = "Add to Deck", 1000);
            }
        };
    }
}
