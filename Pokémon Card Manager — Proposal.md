# Pokémon Card Manager — Proposal

## Purpose

Build a web app to **collect**, **organize**, and **progress** through Pokémon card collections. Users create sets, track ownership, earn points as they collect, and unlock access to rarer/better cards via a progression system.

## Audience

- Pokémon TCG enthusiasts tracking personal collections.
- New collectors learning set structure and rarity.
- Casual players who want a lightweight, gamified tracker.

## Core Flow

1. Browse cards by set/rarity and add to “My Collection.”
2. Earn points for collecting and completing milestones (e.g., set %, rarity tiers).
3. Spend points to “unlock” visibility/access to higher-tier cards or special views.
4. Build and share themed lists (e.g., “Fire Starters,” “Eeveelutions”).

## Data Sources

- **External API: [https://tcgdex.dev/](https://tcgdex.dev/)**
- **LocalStorage:** Persist user collections, points, unlocks, preferences.
- **Etc:** Caching layer (indexed mappings) for faster card lookups.

## Initial Module List

- **Auth/Session:** Anonymous by default; optional nickname.
- **Card Browser:** Filter/sort by set, type, rarity; pagination; detail drawer.
- **Collection Manager:** Add/remove, quantities, condition notes, tags.
- **Sets & Milestones:** Completion % per set; milestone badges; duplicate tracking.
- **Points & Progression:** Point ledger, earn rules, unlock tiers, spend actions.
- **Decks/Lists:** Create named lists; export/import JSON.
- **Search & Filters:** Name, type, set, rarity, text; quick and advanced modes.
- **Sync & Backup:** Export/import local JSON; reset; versioning.
- **Settings:** Theme, currency (points visibility), image density, accessibility toggles.
- **Offline Cache:** Basic offline read of last-viewed data; graceful API failures.

## Scoring & Progression (Initial Rules)

- Base points per card: by rarity (e.g., Common: 1, Uncommon: 2, Rare: 5, Ultra: 10, Secret: 15).
- Set completion bonuses: 10% set completion → +20 points, 25% → +60, 50% → +150, 75% → +300, 100% → +600.
- Duplicate handling: 50% value for duplicates beyond first (trading incentive).
- Unlock tiers: Bronze (default), Silver (250 pts), Gold (800 pts), Master (1800 pts) → access to advanced filters and special curated views.

## Technical Approach

- **Stack:** Vanilla JS or lightweight framework (e.g., **Vite + Lit/Preact**), Fetch API, LocalStorage.
- **State:** Modular services (CardService, CollectionService, PointsService).
- **Routing:** Client-side routes for /browse, /collection, /sets, /progress.
- **Performance:** Debounced search, image lazy-load, API response caching.
- **Testing:** Unit tests for scoring logic and persistence; mock API data.

## Colors/Typography/Styling

- **Colors:** Electric Yellow (#FFD600), Light Gray (#F3F4F6)
- **Typography:** Headings: “Montserrat, sans-serif”; Body: “Inter, system-ui”.
- **Elements:**
    - Buttons: Rounded 8px; primary in Poké Red; hover darken 8%.
    - Cards: Shadow-sm, border-radius 12px, image-first layout.
    - Badges: Pill style with rarity color coding.
    - Progress rings/bars: Animated, accessible labels.

## Accessibility

- High-contrast theme toggle; ALT text on images; keyboard navigation; ARIA roles for lists, tabs, dialogs; reduced motion option.

## Risks & Mitigations

- API rate limits → response caching + backoff; offline modes.
- Image heavy UI → lazy-load, responsive sources.
- Evolving rules → external JSON-config for point tables/unlocks.

## Schedule (≈30 hours, Weeks 10–14)

- **Week 10 (6–7h):** Scope finalization, data models, API integration, card list rendering, basic filters.
- **Week 11 (6–7h):** Collection Manager (add/remove, quantities), LocalStorage persistence, search, detail view.
- **Week 12 (6h):** Scoring engine, milestones, progress UI, unlock tiers, badges.
- **Week 13 (6h):** Decks/Lists feature, settings, accessibility pass, performance tuning.
- **Week 14 (5h):** Polish styles, QA, unit tests for scoring/persistence, documentation, demo prep.

## Deliverables

- Functional web app with card browsing, collections, points/unlocks, milestones.
- Configurable scoring in JSON; persistent user state in LocalStorage.
- Documentation: setup, modules, API usage, scoring rules, accessibility overview.