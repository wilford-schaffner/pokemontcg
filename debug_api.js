import { fetchSets } from './js/api.js';

const BASE_URL = 'https://api.tcgdex.net/v2/en';

async function checkApi() {
    console.log('--- Checking Sets ---');
    const sets = await fetchSets();
    console.log(`Fetched ${sets.length} sets.`);
    if (sets.length > 0) {
        console.log('Sample Set:', sets[0]);
    }

    console.log('\n--- Checking Rarity Filter ---');
    // Try to fetch cards with rarity query param?
    // Documentation says /cards?rarity=... might not exist, but let's check if the summary has it.
    const response = await fetch(`${BASE_URL}/cards`);
    const cards = await response.json();
    console.log(`Fetched ${cards.length} total cards (summary).`);
    console.log('Sample Card Summary:', cards[0]);

    // Check if we can filter by rarity via URL
    // Try fetching /cards?rarity=Common (guessing)
    // Actually TCGDex usually has /rarities endpoint and /cards?rarity=... or /rarities/{rarity}

    console.log('\n--- Checking Specific Rarity Endpoint ---');
    try {
        const rarityResp = await fetch(`${BASE_URL}/rarities`);
        const rarities = await rarityResp.json();
        console.log('Available Rarities:', rarities);
    } catch (e) {
        console.log('No /rarities endpoint');
    }
}

checkApi();
