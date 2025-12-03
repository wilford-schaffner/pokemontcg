import { fetchSets } from './js/api.js';

async function checkSets() {
    const sets = await fetchSets();
    console.log('Sets found:', sets.length);
    if (sets.length > 0) {
        console.log('First set sample:', JSON.stringify(sets[0], null, 2));
    }
}

checkSets();
