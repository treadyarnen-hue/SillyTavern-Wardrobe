// Wardrobe extension - config and default settings

export const extensionName = 'wardrobe';

// The six outer-outfit categories. Underwear is a separate layer (own field).
export const CATEGORIES = [
    { key: 'work', label: 'Work' },
    { key: 'everyday', label: 'Everyday' },
    { key: 'formal', label: 'Formal' },
    { key: 'loungewear', label: 'Loungewear' },
    { key: 'sports', label: 'Sports' },
    { key: 'bedtime', label: 'Bedtime' },
];

// A fresh wardrobe for one character.
export const defaultOutfitData = {
    outfits: {
        work: '',
        everyday: '',
        formal: '',
        loungewear: '',
        sports: '',
        bedtime: '',
        underwear: '',
    },
    activeOutfit: 'everyday',   // a CATEGORIES key, or 'none' for undressed
    underwearOn: true,          // whether underwear is currently worn
};

export const defaultSettings = {
    isEnabled: true,
    // Wardrobes stored per character, keyed by the character's avatar filename.
    charOutfitData: {},
};
