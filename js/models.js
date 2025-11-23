export function transformCard(apiCard) {
    return {
        id: apiCard.id,
        name: apiCard.name,
        imageUrl: apiCard.images?.small,
        largeImageUrl: apiCard.images?.large,
        supertype: apiCard.supertype,
        subtypes: apiCard.subtypes,
        types: apiCard.types,
        set: apiCard.set.name,
        setId: apiCard.set.id,
        rarity: apiCard.rarity,
        number: apiCard.number,
        artist: apiCard.artist,
        tcgplayer: apiCard.tcgplayer,
        cardmarket: apiCard.cardmarket
    };
}

