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

        cardEl.innerHTML = `
            ${ownedBadge}
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

    modalBody.innerHTML = `
        <div class="modal-detail-view">
            <div class="modal-image-container">
                <img src="${imageUrl}" alt="${card.name}">
            </div>
            <div class="modal-info">
                <h2>${card.name}</h2>
                <div class="modal-meta">
                    <span class="modal-stat">Set: ${card.set.name || card.set}</span>
                    <span class="modal-stat">Rarity: ${card.rarity}</span>
                    <span class="modal-stat">Type: ${card.types ? card.types.join(', ') : 'N/A'}</span>
                    <span class="modal-stat">HP: ${card.hp || 'N/A'}</span>
                </div>
                
                <div class="collection-actions">
                    <h3>My Collection</h3>
                    <div class="collection-controls">
                        <button class="btn-control" id="btn-remove" aria-label="Remove card">-</button>
                        <span class="quantity-display" id="qty-display">${quantity}</span>
                        <button class="btn-control" id="btn-add" aria-label="Add card">+</button>
                    </div>
                </div>

                <div style="margin-top: 2rem; color: #666; font-size: 0.9rem;">
                    <p>Illustrator: ${card.illustrator || 'Unknown'}</p>
                    <p>${card.effect || ''}</p>
                </div>
            </div>
        </div>
    `;

    // Attach event listeners for add/remove
    const btnAdd = modalBody.querySelector('#btn-add');
    const btnRemove = modalBody.querySelector('#btn-remove');
    const qtyDisplay = modalBody.querySelector('#qty-display');

    btnAdd.onclick = () => {
        collectionManager.add(card);
        const newQty = collectionManager.getQuantity(card.id);
        qtyDisplay.textContent = newQty;
        if (onUpdate) onUpdate();
    };

    btnRemove.onclick = () => {
        collectionManager.remove(card.id);
        const newQty = collectionManager.getQuantity(card.id);
        qtyDisplay.textContent = newQty;
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
