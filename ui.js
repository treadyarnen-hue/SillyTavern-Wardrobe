// Wardrobe extension - settings panel UI

import { saveSettingsDebounced } from '../../../../script.js';
import { CATEGORIES } from './config.js';
import { getSettings, getOutfitData } from './state.js';
import { updatePromptInjection } from './prompts.js';

const PANEL_ID = 'wardrobe-settings';

// Build the drawer HTML and append it to the Extensions panel.
export function setupUI(attempt = 0) {
    if (document.getElementById(PANEL_ID)) return; // already built

    const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
    if (!host) {
        if (attempt < 20) { setTimeout(() => setupUI(attempt + 1), 300); return; }
        console.error('[Wardrobe] settings container not found; panel not added');
        return;
    }

    const fieldRows = CATEGORIES.map(c => `
        <div class="wardrobe-field">
            <label for="wardrobe-in-${c.key}">${c.label}</label>
            <textarea id="wardrobe-in-${c.key}" data-outfit="${c.key}" rows="2"
                placeholder="Describe the ${c.label.toLowerCase()} outfit..."></textarea>
        </div>`).join('');

    const outfitOptions = CATEGORIES.map(c => `<option value="${c.key}">${c.label}</option>`).join('')
        + `<option value="none">None (undressed)</option>`;

    const html = `
    <div id="${PANEL_ID}" class="wardrobe-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Wardrobe</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">

                <label class="checkbox_label" for="wardrobe-enabled">
                    <input type="checkbox" id="wardrobe-enabled" />
                    <span>Enable</span>
                </label>


                <div class="wardrobe-section-title">Currently worn</div>
                <div class="wardrobe-selectors">
                    <div class="wardrobe-sel">
                        <label for="wardrobe-active-outfit">Outfit</label>
                        <select id="wardrobe-active-outfit">${outfitOptions}</select>
                    </div>
                    <label class="checkbox_label wardrobe-uw" for="wardrobe-underwear-on">
                        <input type="checkbox" id="wardrobe-underwear-on" />
                        <span>Wearing underwear</span>
                    </label>
                </div>

                <div class="wardrobe-section-title">Outfits</div>
                ${fieldRows}

                <div class="wardrobe-field">
                    <label for="wardrobe-in-underwear">Underwear</label>
                    <textarea id="wardrobe-in-underwear" data-outfit="underwear" rows="2"
                        placeholder="Describe the underwear..."></textarea>
                </div>

            </div>
        </div>
    </div>`;

    host.insertAdjacentHTML('beforeend', html);
    bindHandlers();
    syncUI();
    console.log('[Wardrobe] panel added');
}

// Wire input events. Handlers fetch the CURRENT character's data each time,
// so edits always land on whoever is loaded now.
function bindHandlers() {
    document.querySelectorAll(`#${PANEL_ID} textarea[data-outfit]`).forEach(el => {
        el.addEventListener('input', () => {
            getOutfitData().outfits[el.dataset.outfit] = el.value;
            saveSettingsDebounced();
            updatePromptInjection();
        });
    });

    const enabled = document.getElementById('wardrobe-enabled');
    if (enabled) enabled.addEventListener('change', () => { getSettings().isEnabled = enabled.checked; saveSettingsDebounced(); updatePromptInjection(); });

    const active = document.getElementById('wardrobe-active-outfit');
    if (active) active.addEventListener('change', () => { getOutfitData().activeOutfit = active.value; saveSettingsDebounced(); updatePromptInjection(); });

    const uw = document.getElementById('wardrobe-underwear-on');
    if (uw) uw.addEventListener('change', () => { getOutfitData().underwearOn = uw.checked; saveSettingsDebounced(); updatePromptInjection(); });
}

// Push the current character's saved values into the fields.
// Called on load and whenever the character/chat changes.
export function syncUI() {
    if (!document.getElementById(PANEL_ID)) return;
    const s = getSettings();
    const d = getOutfitData();

    document.querySelectorAll(`#${PANEL_ID} textarea[data-outfit]`).forEach(el => {
        el.value = d.outfits[el.dataset.outfit] || '';
    });

    const enabled = document.getElementById('wardrobe-enabled');
    if (enabled) enabled.checked = !!s.isEnabled;

    const active = document.getElementById('wardrobe-active-outfit');
    if (active) active.value = d.activeOutfit || 'everyday';

    const uw = document.getElementById('wardrobe-underwear-on');
    if (uw) uw.checked = !!d.underwearOn;

}
