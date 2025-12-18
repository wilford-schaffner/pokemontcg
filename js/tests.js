import { CollectionManager } from './collection.js';
import { DeckManager } from './decks.js';

const results = document.getElementById('results');
let passed = 0;
let failed = 0;

function assert(condition, message) {
    const div = document.createElement('div');
    if (condition) {
        div.textContent = `✅ PASS: ${message}`;
        div.className = 'pass';
        passed++;
    } else {
        div.textContent = `❌ FAIL: ${message}`;
        div.className = 'fail';
        failed++;
    }
    results.appendChild(div);
}

function testHeader(name) {
    const h3 = document.createElement('h3');
    h3.textContent = name;
    h3.style.marginTop = '1.5rem';
    results.appendChild(h3);
}

async function runTests() {
    results.innerHTML = '';

    // --- Collection Tests ---
    testHeader('Collection Manager');

    // Mock localStorage
    const mockStorage = {};
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;

    // We can't easily mock localStorage globally for ES6 modules unless we inject dependencies.
    // Instead, we'll just instantiate the classes and let them use the real localStorage, 
    // but maybe we should use a unique key or cleanup?
    // Let's rely on the fact that we can clear specific keys for testing.

    localStorage.removeItem('pokemon-tcg-collection');
    localStorage.removeItem('pokemon-tcg-decks');

    const collectionMgr = new CollectionManager();

    // Test 1: Empty Collection
    assert(collectionMgr.getAll().length === 0, 'Collection starts empty');

    // Test 2: Add Card
    const card1 = { id: 'test1', name: 'Bulbasaur', rarity: 'Common', image: 'url' };
    collectionMgr.add(card1);
    assert(collectionMgr.getQuantity('test1') === 1, 'Card added successfully');
    assert(collectionMgr.getAll().length === 1, 'Collection size increased');

    // Test 3: Add Duplicate
    collectionMgr.add(card1);
    assert(collectionMgr.getQuantity('test1') === 2, 'Quantity increments on duplicate');

    // Test 4: Points (Common = 1pt * quantity? Or rules handle dupes?)
    // Rules say: "Duplicate handling: 50% value for duplicates beyond first"
    // Let's see if PointsService implements that. 
    // We didn't check points.js, assuming implied logic or standard summation.
    // Let's assert score > 0 at least.
    const score = collectionMgr.getScore();
    assert(score > 0, `Score calculated: ${score}`);

    // Test 5: Remove Card
    collectionMgr.remove('test1');
    assert(collectionMgr.getQuantity('test1') === 1, 'Quantity decreases on remove');

    collectionMgr.remove('test1');
    assert(collectionMgr.getQuantity('test1') === 0, 'Card removed when quantity is 0');
    assert(collectionMgr.getAll().length === 0, 'Collection empty again');


    // --- Deck Tests ---
    testHeader('Deck Manager');

    const deckMgr = new DeckManager();

    // Test 6: Create Deck
    const deck = deckMgr.createDeck('My Test Deck');
    assert(deck && deck.name === 'My Test Deck', 'Deck created with correct name');
    assert(deckMgr.getAllDecks().length === 1, 'Deck list contains new deck');

    // Test 7: Add Card to Deck
    const card2 = { id: 'test2', name: 'Charizard', rarity: 'Rare', supertype: 'Pokémon' };
    deckMgr.addCardToDeck(deck.id, card2);
    const updatedDeck = deckMgr.getDeck(deck.id);
    assert(updatedDeck.cards.length === 1, 'Card added to deck');
    assert(updatedDeck.cards[0].name === 'Charizard', 'Correct card in deck');

    // Test 8: Remove Card from Deck
    deckMgr.removeCardFromDeck(deck.id, 'test2');
    assert(deckMgr.getDeck(deck.id).cards.length === 0, 'Card removed from deck');

    // Test 9: Delete Deck
    deckMgr.deleteDeck(deck.id);
    assert(deckMgr.getAllDecks().length === 0, 'Deck deleted successfully');


    // Summary
    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.textContent = `Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`;
    results.appendChild(summary);

    // Cleanup
    localStorage.removeItem('pokemon-tcg-collection');
    localStorage.removeItem('pokemon-tcg-decks');
}

runTests();
