const BASE_URL = 'https://api.tcgdex.net/v2/en';

async function checkRarityEndpoint() {
    console.log('--- Checking /rarities/Rare ---');
    try {
        const response = await fetch(`${BASE_URL}/rarities/Rare`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        console.log('Response keys:', Object.keys(data));
        if (data.cards) {
            console.log(`Found ${data.cards.length} cards for 'Rare'.`);
            console.log('Sample:', data.cards[0]);
        }
    } catch (e) {
        console.error('Error fetching rarity:', e.message);
    }
}

checkRarityEndpoint();
