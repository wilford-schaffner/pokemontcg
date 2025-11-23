export function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'pokemon-card';
    
    const imageSrc = card.imageUrl || 'assets/placeholder_card.png'; 
    
    // Basic badge logic
    const typesHtml = card.types 
        ? card.types.map(type => `<span class="badge">${type}</span>`).join('') 
        : '';
        
    const rarityHtml = card.rarity 
        ? `<span class="badge" style="background-color: var(--color-bg-surface);">${card.rarity}</span>` 
        : '';

    cardEl.innerHTML = `
        <div class="card-image">
            <img src="${imageSrc}" alt="${card.name}" loading="lazy">
        </div>
        <div class="card-content">
            <h3 class="card-title">${card.name}</h3>
            <div class="card-meta">
                <span>${card.set}</span>
                <span>#${card.number}</span>
            </div>
            <div class="card-badges">
                ${typesHtml}
                ${rarityHtml}
            </div>
        </div>
    `;
    
    return cardEl;
}

export function renderCards(cards, container) {
    cards.forEach(card => {
        container.appendChild(createCardElement(card));
    });
}

export function clearCards(container) {
    container.innerHTML = '';
}

export function renderSetOptions(sets, selectElement) {
    // Sort sets by release date descending
    sets.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    
    sets.forEach(set => {
        const option = document.createElement('option');
        option.value = `set.id:${set.id}`; // Search query syntax for Pokemon TCG API
        option.textContent = set.name;
        selectElement.appendChild(option);
    });
}

export function renderTypeOptions(types, selectElement) {
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = `types:${type}`; 
        option.textContent = type;
        selectElement.appendChild(option);
    });
}

export function toggleLoading(isLoading) {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        if (isLoading) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }
}

export function toggleLoadMore(isVisible) {
    const btn = document.getElementById('load-more-btn');
    if (btn) {
        if (isVisible) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }
}

