/**
 * Render a list of cards to the grid
 * @param {Array} cards 
 * @param {HTMLElement} container 
 * @param {Object} collectionManager - Optional collection manager instance
 */
export function renderCardList(cards, container, collectionManager = null) {
    container.innerHTML = '';

    if (cards.length === 0) {
        container.innerHTML = '<div class="no-results">No cards found.</div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    const currentScore = collectionManager ? collectionManager.getScore() : 0;
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
        }

        fragment.appendChild(cardEl);
    });

    container.appendChild(fragment);
}

/**
 * Render the card detail modal
 * @param {Object} card 
 * @param {HTMLElement} modalBody 
 * @param {Object} collectionManager 
 * @param {Function} onUpdate - Callback when collection updates
 */
export function renderCardModal(card, modalBody, collectionManager, onUpdate) {
    const imageUrl = card.image ? `${card.image}/high.png` : 'placeholder.svg';
    const quantity = collectionManager ? collectionManager.getQuantity(card.id) : 0;

    // Get points
    let points = 0;
    if (collectionManager && collectionManager.pointsService) {
        points = collectionManager.pointsService.getCardPoints(card.rarity || '');
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

    sets.forEach(set => {
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
