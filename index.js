// Wardrobe extension - entry point
// Per-character input UI, prompt injection, and hidden-tag outfit changes.

import { eventSource, event_types } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { extensionName, defaultSettings } from './config.js';
import { getSettings } from './state.js';
import { setupUI, syncUI } from './ui.js';
import { updatePromptInjection } from './prompts.js';
import { hasWardrobeTag, applyWardrobeTag, stripWardrobeTag } from './tags.js';

// Load the stylesheet ourselves (some ST builds don't auto-apply manifest css for third-party).
const cssId = 'wardrobe-css';
if (!document.getElementById(cssId)) {
    try {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = new URL('./style.css', import.meta.url).href;
        document.head.appendChild(link);
    } catch (e) {
        console.error('[Wardrobe] css load error:', e);
    }
}

function loadSettings() {
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = structuredClone(defaultSettings);
    }
    getSettings();
}

jQuery(async () => {
    try {
        console.log('[Wardrobe] init start');
        loadSettings();
        setupUI();
        updatePromptInjection();

        // Keep the injection installed before each generation (ST clears it on chat change).
        if (eventSource && event_types && event_types.MESSAGE_SENT) {
            eventSource.on(event_types.MESSAGE_SENT, () => {
                try { updatePromptInjection(); } catch (e) { console.error('[Wardrobe] inject refresh error:', e); }
            });
        }

        // Re-sync the panel to the new character whenever the chat/character changes.
        if (eventSource && event_types && event_types.CHAT_CHANGED) {
            eventSource.on(event_types.CHAT_CHANGED, () => {
                try { syncUI(); updatePromptInjection(); } catch (e) { console.error('[Wardrobe] sync error:', e); }
            });
        }

        // Read the model's hidden wardrobe tag after each AI reply, then strip it.
        if (eventSource && event_types && event_types.CHARACTER_MESSAGE_RENDERED) {
            eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (id) => {
                try {
                    const ctx = (typeof SillyTavern?.getContext === 'function') ? SillyTavern.getContext() : null;
                    const chat = ctx && ctx.chat;
                    if (!Array.isArray(chat) || !chat.length) return;
                    const idx = (typeof id === 'number' && chat[id]) ? id : chat.length - 1;
                    const msg = chat[idx];
                    if (!msg || typeof msg.mes !== 'string' || !hasWardrobeTag(msg.mes)) return;

                    applyWardrobeTag(msg.mes, syncUI);

                    const raw = msg.mes;
                    const clean = stripWardrobeTag(raw);
                    if (clean !== raw) {
                        msg.mes = clean;
                        if (Array.isArray(msg.swipes) && typeof msg.swipe_id === 'number' && msg.swipes[msg.swipe_id] === raw) {
                            msg.swipes[msg.swipe_id] = clean;
                        }
                        try { ctx.saveChat && ctx.saveChat(); } catch (e) {}
                        const el = document.querySelector(`.mes[mesid="${idx}"] .mes_text`);
                        if (el) el.innerHTML = el.innerHTML.replace(/<wardrobe\b[^>]*?\/?>/gi, '');
                    }
                } catch (e) { console.error('[Wardrobe] tag read error:', e); }
            });
        }

        console.log('[Wardrobe] init done');
    } catch (e) {
        console.error('[Wardrobe] init error:', e);
    }
});
