import { PointsService, RARITY_POINTS } from './js/points.js';

const service = new PointsService();

console.log('--- Testing PointsService ---');

// Test 1: Card Score Calculation
console.log('\nTest 1: Card Score Calculation');
const commonCard = { rarity: 'Common', quantity: 1 };
const rareCard = { rarity: 'Rare', quantity: 1 };
const duplicateCommon = { rarity: 'Common', quantity: 3 };

console.log(`Common (1): ${service.calculateCardScore(commonCard)} (Expected: 1)`);
console.log(`Rare (1): ${service.calculateCardScore(rareCard)} (Expected: 5)`);
console.log(`Common (3): ${service.calculateCardScore(duplicateCommon)} (Expected: 1 + 0.5 + 0.5 = 2)`);

// Test 2: Total Score
console.log('\nTest 2: Total Score');
const collection = {
    'c1': { rarity: 'Common', quantity: 1 },
    'c2': { rarity: 'Rare', quantity: 1 },
    'c3': { rarity: 'Common', quantity: 3 }
};
// Total: 1 + 5 + 2 = 8
console.log(`Total Score: ${service.calculateTotalScore(collection)} (Expected: 8)`);

// Test 3: Tiers
console.log('\nTest 3: Tiers');
console.log(`Tier for 0 pts: ${service.getTier(0).name} (Expected: Bronze)`);
console.log(`Tier for 250 pts: ${service.getTier(250).name} (Expected: Silver)`);
console.log(`Tier for 799 pts: ${service.getTier(799).name} (Expected: Silver)`);
console.log(`Tier for 800 pts: ${service.getTier(800).name} (Expected: Gold)`);

// Test 4: Next Tier
console.log('\nTest 4: Next Tier');
const nextForBronze = service.getNextTier(0);
console.log(`Next for Bronze: ${nextForBronze.name} at ${nextForBronze.threshold} (Expected: Silver at 250)`);

const nextForMaster = service.getNextTier(2000);
console.log(`Next for Master: ${nextForMaster ? nextForMaster.name : 'None'} (Expected: None)`);
