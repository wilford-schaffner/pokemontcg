# PokéManager - Pokémon Card Collection & Deck Builder

A gamified web application for Pokémon TCG enthusiasts to browse cards, manage their collection, build decks, and earn rewards through a progression system.

## 🚀 Features

- **Card Browser**: Explore thousands of Pokémon cards with filters for Set, Rarity, and Name.
- **My Collection**: Track your personal collection with quantity management.
- **Deck Builder**: Create and manage custom decks using cards from your collection.
- **Progression System**: Earn points by collecting cards to unlock higher tiers and features.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing.
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Local Persistence**: Your data is saved automatically in your browser's LocalStorage.

## 🛠️ Architecture

The project is built with Vanilla JavaScript, HTML5, and CSS3.

- **`js/app.js`**: Main entry point, state management, and event listeners.
- **`js/ui.js`**: Handles all DOM manipulation and rendering logic.
- **`js/api.js`**: Interacts with the [tcgdex.dev](https://tcgdex.dev/) API.
- **`js/collection.js`**: Manages user collection data and persistence.
- **`js/decks.js`**: Manages deck creation and modification.
- **`js/points.js`**: logic for scoring and progression (embedded within Collection integration).

## 📡 API Reference

This project uses the **[TCGdex API](https://tcgdex.dev/)** to fetch card data.
- **Base URL**: `https://api.tcgdex.net/v2/en`
- **Endpoints used**:
  - `/sets`: Fetch list of all sets.
  - `/cards`: Fetch card summaries (filtered).
  - `/cards/{id}`: Fetch detailed card information.

## 🏆 Scoring & Progression

Earn points by adding cards to your collection. Higher rarity cards award more points.

### Point Values
- **Common**: 1 pt
- **Uncommon**: 2 pts
- **Rare**: 5 pts
- **Ultra Rare**: 10 pts
- **Secret Rare / Special**: 15+ pts

### Unlock Tiers
As you earn points, you unlock new Tiers.
- **Bronze**: Starter tier (0 pts)
- **Silver**: 250 pts
- **Gold**: 800 pts
- **Master**: 1800 pts (Unlocks special views)

## 📦 Setup & Development

No build step required! This is a vanilla JS project.

1. Clone the repository.
2. Open `index.html` in your browser (or use a local server like Live Server).
3. Start collecting!

## ⚠️ Notes

- Data is stored in `LocalStorage`. Clearing your browser cache will reset your progress.
- Use the "Settings" menu to "Reset Data" if you want to start fresh.

---
*Created for Web Frontend Development II*
