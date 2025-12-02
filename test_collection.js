// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

// Import CollectionManager (using dynamic import or simple require if commonjs, but it's ES module)
// We will read the file content and eval it or just copy the class here for testing since we can't easily import ES modules in this environment without setup.
// Actually, I can just copy the class code here to test the logic, as I want to verify the *logic* I wrote.

class CollectionManager {
    constructor() {
        this.storageKey = 'pokemon-tcg-collection';
        this.collection = {};
        this.load();
    }

    load() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.collection = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse collection', e);
                this.collection = {};
            }
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.collection));
    }

    add(card) {
        if (!this.collection[card.id]) {
            this.collection[card.id] = {
                quantity: 0,
                name: card.name,
                image: card.image,
                rarity: card.rarity,
                id: card.id
            };
        }
        this.collection[card.id].quantity++;
        this.save();
    }

    remove(cardId) {
        if (this.collection[cardId]) {
            this.collection[cardId].quantity--;
            if (this.collection[cardId].quantity <= 0) {
                delete this.collection[cardId];
            }
            this.save();
        }
    }

    getQuantity(cardId) {
        return this.collection[cardId] ? this.collection[cardId].quantity : 0;
    }
}

// Test Suite
function runTests() {
    console.log('Starting CollectionManager Tests...');

    const cm = new CollectionManager();
    const card1 = { id: 'c1', name: 'Charizard', image: 'img1', rarity: 'Rare' };

    // Test 1: Add Card
    cm.add(card1);
    if (cm.getQuantity('c1') !== 1) throw new Error('Test 1 Failed: Quantity should be 1');
    console.log('Test 1 Passed: Add Card');

    // Test 2: Persistence (Save is automatic)
    const stored = JSON.parse(localStorage.getItem('pokemon-tcg-collection'));
    if (stored['c1'].quantity !== 1) throw new Error('Test 2 Failed: Persistence check');
    console.log('Test 2 Passed: Persistence');

    // Test 3: Add Duplicate
    cm.add(card1);
    if (cm.getQuantity('c1') !== 2) throw new Error('Test 3 Failed: Quantity should be 2');
    console.log('Test 3 Passed: Add Duplicate');

    // Test 4: Remove Card
    cm.remove('c1');
    if (cm.getQuantity('c1') !== 1) throw new Error('Test 4 Failed: Quantity should be 1 after remove');
    console.log('Test 4 Passed: Remove Card');

    // Test 5: Remove until empty
    cm.remove('c1');
    if (cm.getQuantity('c1') !== 0) throw new Error('Test 5 Failed: Quantity should be 0');
    if (cm.collection['c1']) throw new Error('Test 5 Failed: Card should be removed from collection object');
    console.log('Test 5 Passed: Remove until empty');

    console.log('All tests passed!');
}

runTests();
