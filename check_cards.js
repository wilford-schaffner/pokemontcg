import { fetchCards } from './js/api.js';

async function checkCards() {
    console.log('Fetching cards...');
    const cards = await fetchCards();
    console.log('Cards found:', cards.length);
    if (cards.length > 0) {
        console.log('First card sample:', JSON.stringify(cards[0], null, 2));
    } else {
        console.log('No cards returned.');
    }
}

checkCards();
