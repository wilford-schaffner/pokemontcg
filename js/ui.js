/**
 * Render a list of cards to the grid
 * @param {Array} cards 
 * @param {HTMLElement} container 
 */
export function renderCardList(cards, container) {
    container.innerHTML = '';

    if (cards.length === 0) {
        container.innerHTML = '<div class="no-results">No cards found.</div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        // TCGDex image extension is usually needed. 
        // The summary object has 'image' usually as a full URL or we construct it.
        // Let's check the data shape in runtime or assume standard.
        // v2 usually provides an image url ending in /high.png or /low.png

        const imageUrl = card.image ? `${card.image}/low.png` : 'placeholder.svg';

        // Map rarity to symbol
        let raritySymbol = '';
        const rarityName = card.rarity || 'Unknown';
        if (rarityName.toLowerCase().includes('common')) raritySymbol = '●';
        else if (rarityName.toLowerCase().includes('uncommon')) raritySymbol = '◆';
        else if (rarityName.toLowerCase().includes('rare')) raritySymbol = '★';
        else raritySymbol = '★';

        const types = card.types ? card.types.join(', ') : 'Unknown';

        cardEl.innerHTML = `
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
