import { API_BASE_URL, DEFAULT_PAGE_SIZE } from './config.js';
import { transformCard } from './models.js';

// NOTE: Add your API Key here if you have one to increase rate limits
const API_KEY = null; 

const headers = {
    'Content-Type': 'application/json',
};

if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
}

export async function fetchCards({ page = 1, pageSize = DEFAULT_PAGE_SIZE, query = '' } = {}) {
    const params = new URLSearchParams({
        page,
        pageSize,
        q: query,
        orderBy: '-set.releaseDate', // Show newest cards first by default
        select: 'id,name,images,set,types,rarity,number,supertype,subtypes,artist,tcgplayer,cardmarket'
    });

    try {
        const response = await fetch(`${API_BASE_URL}/cards?${params}`, { headers });
        
        if (response.status === 429) {
             throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
            data: data.data.map(transformCard),
            page: data.page,
            pageSize: data.pageSize,
            count: data.count,
            totalCount: data.totalCount
        };
    } catch (error) {
        console.error('Error fetching cards:', error);
        throw error;
    }
}

export async function fetchSets() {
     try {
        const response = await fetch(`${API_BASE_URL}/sets`, { headers });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        return data.data; 
    } catch (error) {
        console.error('Error fetching sets:', error);
        throw error;
    }
}

export async function fetchTypes() {
     try {
        const response = await fetch(`${API_BASE_URL}/types`, { headers });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching types:', error);
        throw error;
    }
}

