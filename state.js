// Wardrobe extension - settings state, scoped per character

import { extension_settings } from '../../../extensions.js';
import { extensionName, defaultSettings, defaultOutfitData } from './config.js';

function ctx() {
    return (typeof SillyTavern?.getContext === 'function') ? SillyTavern.getContext() : null;
}

// A stable per-character key: the character card's avatar filename (unique in ST,
// survives renames and new chats). Falls back sensibly for groups / no character.
export function getCurrentCharKey() {
    const c = ctx();
    if (!c) return '__nochar__';
    try {
        const id = c.characterId;
        if (id !== undefined && id !== null && c.characters && c.characters[id]) {
            const ch = c.characters[id];
            return 'char:' + (ch.avatar || ch.name || String(id));
        }
        if (c.groupId) return 'group:' + c.groupId;
        if (c.name2) return 'name:' + c.name2;
    } catch (e) {
        console.error('[Wardrobe] char key error:', e);
    }
    return '__nochar__';
}

// The extension-level settings (global on/off + the per-character store).
export function getSettings() {
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = structuredClone(defaultSettings);
    }
    const s = extension_settings[extensionName];
    if (typeof s.isEnabled !== 'boolean') s.isEnabled = true;
    if (!s.charOutfitData || typeof s.charOutfitData !== 'object') s.charOutfitData = {};
    return s;
}

// The current character's wardrobe (created fresh the first time that character is seen).
export function getOutfitData() {
    const s = getSettings();
    const key = getCurrentCharKey();
    if (!s.charOutfitData[key]) {
        s.charOutfitData[key] = structuredClone(defaultOutfitData);
    }
    const d = s.charOutfitData[key];
    if (!d.outfits || typeof d.outfits !== 'object') d.outfits = structuredClone(defaultOutfitData.outfits);
    for (const k of Object.keys(defaultOutfitData.outfits)) {
        if (typeof d.outfits[k] !== 'string') d.outfits[k] = '';
    }
    if (typeof d.activeOutfit !== 'string') d.activeOutfit = defaultOutfitData.activeOutfit;
    if (typeof d.underwearOn !== 'boolean') d.underwearOn = defaultOutfitData.underwearOn;
    return d;
}
