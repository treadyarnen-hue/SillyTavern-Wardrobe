// Wardrobe extension - prompt injection
// Feeds {{user}}'s current outfit + underwear into the model's context each reply,
// using SillyTavern's extension-prompt system (same mechanism the pregnancy one uses).

import { setExtensionPrompt, extension_prompts, extension_prompt_types, extension_prompt_roles } from '../../../../script.js';
import { extensionName, CATEGORIES } from './config.js';
import { getSettings, getOutfitData } from './state.js';

// Build the text the model sees. Returns '' when there is nothing to say
// (disabled, or no outfit filled in), which clears the injection.
function buildOutfitPrompt() {
    const s = getSettings();
    if (!s.isEnabled) return '';

    const d = getOutfitData();
    const parts = [];
    let hasOutfit = false;

    if (d.activeOutfit === 'none') {
        parts.push('{{user}} is currently undressed, wearing no outer clothing.');
        hasOutfit = true;
    } else {
        const desc = (d.outfits[d.activeOutfit] || '').trim();
        if (desc) {
            const label = (CATEGORIES.find(c => c.key === d.activeOutfit) || {}).label || '';
            const tag = label ? ` (${label.toLowerCase()})` : '';
            parts.push(`{{user}} is currently wearing${tag}: ${desc}`);
            hasOutfit = true;
        }
    }

    const uw = (d.outfits.underwear || '').trim();
    if (d.underwearOn) {
        if (uw) parts.push(`Underneath, {{user}} is wearing: ${uw}`);
    } else if (hasOutfit) {
        parts.push('{{user}} is not wearing any underwear.');
    }

    let out = '';
    if (parts.length) out += "[{{user}}'s current clothing]\n" + parts.join('\n') + "\n";
    // Let the model change the outfit when the scene calls for it.
    out += "[Wardrobe] If {{user}}'s clothing changes this turn (new outfit, undresses, or underwear goes on/off), "
        + "end your reply with a hidden tag on its own line: "
        + "<wardrobe outfit=\"work|everyday|formal|loungewear|sports|bedtime|none\" underwear=\"on|off\"/>. "
        + "Include only the attribute(s) that changed, emit it only when the clothing actually changes, "
        + "and never mention or describe the tag in your prose.";
    return out;
}

// Install (or clear/update) the injection. Cheap to call often thanks to the cache check.
export function updatePromptInjection() {
    try {
        const core = buildOutfitPrompt();
        const installed = extension_prompts[extensionName];
        if (installed
            && installed.value === core
            && installed.position === extension_prompt_types.IN_CHAT
            && installed.depth === 0
            && installed.role === extension_prompt_roles.SYSTEM) {
            return; // already current
        }
        setExtensionPrompt(extensionName, core, extension_prompt_types.IN_CHAT, 0, false, extension_prompt_roles.SYSTEM);
    } catch (e) {
        console.error('[Wardrobe] injection error:', e);
    }
}
