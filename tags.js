// Wardrobe extension - hidden-tag reading
// The model can change the current outfit by emitting a tag like
//   <wardrobe outfit="bedtime" underwear="off"/>
// at the end of a reply. We read it, update state, and strip it from the message.

import { saveSettingsDebounced } from '../../../../script.js';
import { CATEGORIES } from './config.js';
import { getOutfitData } from './state.js';
import { updatePromptInjection } from './prompts.js';

const TAG_RE = /<wardrobe\b([^>]*?)\/?>/i;
const STRIP_RE = /\s*<wardrobe\b[^>]*?\/?>\s*/gi;
const VALID_OUTFIT = new Set([...CATEGORIES.map(c => c.key), 'none']);

export function hasWardrobeTag(text) {
    return typeof text === 'string' && TAG_RE.test(text);
}

export function stripWardrobeTag(text) {
    if (typeof text !== 'string') return text;
    return text.replace(STRIP_RE, ' ').replace(/[ \t]+\n/g, '\n').trim();
}

// Apply the tag's values to the current character's wardrobe.
// Returns true if a tag was present (whether or not it changed anything).
export function applyWardrobeTag(text, syncUI) {
    const m = typeof text === 'string' ? text.match(TAG_RE) : null;
    if (!m) return false;
    const attrs = m[1] || '';
    const outfitM = attrs.match(/outfit\s*=\s*["']?([a-zA-Z]+)["']?/i);
    const uwM = attrs.match(/underwear\s*=\s*["']?(on|off|true|false|yes|no)["']?/i);

    const d = getOutfitData();
    let changed = false;

    if (outfitM) {
        const v = outfitM[1].toLowerCase();
        if (VALID_OUTFIT.has(v) && d.activeOutfit !== v) { d.activeOutfit = v; changed = true; }
    }
    if (uwM) {
        const on = /^(on|true|yes)$/i.test(uwM[1]);
        if (d.underwearOn !== on) { d.underwearOn = on; changed = true; }
    }

    if (changed) {
        saveSettingsDebounced();
        updatePromptInjection();
        if (typeof syncUI === 'function') { try { syncUI(); } catch (e) {} }
    }
    return true;
}
