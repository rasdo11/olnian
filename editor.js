// Olnian multi-draft email editor with OpenAI copy coaching.
// Static frontend, localStorage memory, and a serverless API proxy.

(function () {
'use strict';

const STORAGE_KEY = 'olnian.drafts.v2';
const LEGACY_STORAGE_KEY = 'olnian.drafts.v1';
const AUTOSAVE_MS = 30 * 1000;
const FLASH_MS = 1600;
const API_ENDPOINT = '/api/copy-suggest';

const EDITABLE_SELECTOR = [
    '.ef-wordmark', '.ef-tagline',
    '.ef-hero-kicker', '.ef-hero-headline',
    '.ef-promo-left', '.ef-promo-code-label', '.ef-promo-code',
    '.ef-eyebrow', '.ef-h2', '.ef-p',
    '.ef-product-name', '.ef-product-desc', '.ef-product-price', '.ef-product-sale',
    '.ef-btn', '.ef-btn-outline',
    '.ef-stat-num', '.ef-stat-label',
    '.ef-step-num', '.ef-step-title', '.ef-step-body',
    '.ef-closing-h', '.ef-closing-sub',
    '.ef-referral-text',
    '.ef-footer-wordmark', '.ef-footer-tagline', '.ef-disclaimer', '.ef-footer-links'
].join(',');

const TEXT_TRANSFER_CLASSES = [
    'ef-wordmark', 'ef-tagline',
    'ef-hero-kicker', 'ef-hero-headline',
    'ef-promo-left', 'ef-promo-code-label', 'ef-promo-code',
    'ef-eyebrow', 'ef-h2', 'ef-p',
    'ef-product-name', 'ef-product-desc', 'ef-product-price', 'ef-product-sale',
    'ef-btn', 'ef-btn-outline',
    'ef-stat-num', 'ef-stat-label',
    'ef-step-num', 'ef-step-title', 'ef-step-body',
    'ef-closing-h', 'ef-closing-sub',
    'ef-referral-text',
    'ef-footer-wordmark', 'ef-footer-tagline', 'ef-disclaimer', 'ef-footer-links'
];

const ACTION_PROMPTS = {
    chat: '',
    subject_variants: 'Suggest 6 high-performing subject lines and 3 preheaders for this email.',
    rewrite_section: 'Rewrite the selected section to be clearer, more specific, and more conversion-oriented.',
    punchier: 'Make the selected copy punchier without sounding hypey.',
    luxury: 'Make the selected copy feel more premium, quiet, and luxury wellness.',
    urgent: 'Add tasteful urgency around the offer without sounding pushy.',
    objections: 'Handle likely buyer objections around supplements, trust, safety, freshness, and price.',
    ab_test: 'Create three A/B test variants with distinct sales angles.'
};

const DEFAULT_BRAND_MEMORY = [
    'Olnian sells pure supplements for women, especially women 35+.',
    'Voice: elegant, calm, specific, science-literate, premium, never bro-y.',
    'Avoid medical promises, disease-treatment claims, exaggerated certainty, and fear-based urgency.',
    'Approved proof points: 5g serving, micronized creatine monohydrate, made to order, batch tested, Certificate of Analysis.',
    'Core audience tension: women who feel brain fog, slower recovery, and lower daily energy but dislike gym-supplement language.',
    'CTA style: direct, restrained, benefit-led. Prefer clarity over cleverness.'
].join('\n');

let elPreview, elDraftList;
let elDraftName, elDraftSubject, elDraftPreheader, elHeroUrl, elProductUrl, elAccentColor;
let elCtaLabel, elCtaUrl, elTemplatePicker, elNewDraftWrap;
let elSaveIndicator, elNewBtn, elSaveBtn, elCopyBtn, elCopySubjectBtn, elCopyPreheaderBtn, elViewportToggle;
let elInboxSubject, elInboxPreheader, elBrandMemory, elSuggestionList, elSavedSuggestionList;
let elChatLog, elChatInput, elChatSendBtn, elActionButtons, elVariantList, elSelectedSection, elCoachStatus;

let store = freshStore();
let isDirty = false;
let flashTimer = null;
let selectedEditable = null;

function freshStore() {
    return {
        version: 2,
        drafts: [],
        activeId: null,
        brandMemory: DEFAULT_BRAND_MEMORY,
        suggestions: [],
        chat: []
    };
}

// ---------- Storage ----------

function loadStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.drafts)) return normalizeStore(parsed);
        }
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
            const parsed = JSON.parse(legacy);
            if (parsed && Array.isArray(parsed.drafts)) return normalizeStore(parsed);
        }
    } catch (e) {
        console.error('loadStore failed', e);
    }
    return null;
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.error('persist failed', e);
    }
}

function normalizeStore(raw) {
    const next = freshStore();
    next.version = 2;
    next.activeId = raw.activeId || null;
    next.brandMemory = raw.brandMemory || DEFAULT_BRAND_MEMORY;
    next.suggestions = Array.isArray(raw.suggestions) ? raw.suggestions : [];
    next.chat = Array.isArray(raw.chat) ? raw.chat : [];
    next.drafts = raw.drafts.map(normalizeDraft);
    if (!next.drafts.length) {
        const d = newDraft('Untitled draft');
        next.drafts.push(d);
        next.activeId = d.id;
    }
    if (!next.drafts.some(d => d.id === next.activeId)) next.activeId = next.drafts[0].id;
    return next;
}

function normalizeDraft(d) {
    const templateId = d.templateId || inferTemplateId(d.html);
    const templateDefaults = window.getTemplate(templateId).defaults;
    return {
        id: d.id || newId(),
        name: d.name || 'Untitled draft',
        templateId,
        subject: d.subject || '',
        preheader: d.preheader || '',
        primaryCTA: d.primaryCTA || derivePrimaryCTA(d.html) || { ...templateDefaults.primaryCTA },
        html: d.html || window.getBlankDraftHTML(templateId),
        accentColor: d.accentColor || window.DEFAULT_ACCENT,
        createdAt: d.createdAt || Date.now(),
        updatedAt: d.updatedAt || Date.now(),
        variants: Array.isArray(d.variants) ? d.variants.map(v => normalizeVariant(v, templateId)) : [],
        activeVariantId: d.activeVariantId || null
    };
}

function normalizeVariant(v, parentTemplateId) {
    const templateId = v.templateId || parentTemplateId || inferTemplateId(v.html);
    const templateDefaults = window.getTemplate(templateId).defaults;
    return {
        id: v.id || newId(),
        label: v.label || 'Variant',
        templateId,
        subject: v.subject || '',
        preheader: v.preheader || '',
        primaryCTA: v.primaryCTA || derivePrimaryCTA(v.html) || { ...templateDefaults.primaryCTA },
        html: v.html || window.getBlankDraftHTML(templateId),
        accentColor: v.accentColor || window.DEFAULT_ACCENT,
        notes: v.notes || '',
        createdAt: v.createdAt || Date.now(),
        updatedAt: v.updatedAt || Date.now()
    };
}

function inferTemplateId(html) {
    if (!html) return window.DEFAULT_TEMPLATE_ID;
    const match = html.match(/data-template="([^"]+)"/);
    if (match && window.getTemplate(match[1])) return match[1];
    return window.DEFAULT_TEMPLATE_ID;
}

function derivePrimaryCTA(html) {
    if (!html) return null;
    return window.readPrimaryCTAFromHTML(html);
}

// ---------- Draft helpers ----------

function newId() {
    return 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function nextUntitledName() {
    const re = /^Untitled draft(?: (\d+))?$/;
    let max = 0;
    let foundBase = false;
    for (const d of store.drafts) {
        const m = re.exec(d.name);
        if (!m) continue;
        if (m[1] === undefined) foundBase = true;
        else max = Math.max(max, parseInt(m[1], 10));
    }
    if (!foundBase) return 'Untitled draft';
    return 'Untitled draft ' + (max + 1);
}

function newDraft(name, templateId, strategyId) {
    const now = Date.now();
    const t = window.getTemplate(templateId || window.DEFAULT_TEMPLATE_ID);
    const s = strategyId ? window.getStrategy(strategyId) : null;
    let html = t.html;
    let subject = '';
    let preheader = t.defaults.previewText || '';
    let cta = { ...t.defaults.primaryCTA };
    if (s) {
        cta = { label: s.copy.ctaLabel || cta.label, url: s.copy.ctaUrl || cta.url };
        html = window.buildStrategyHTML(t.id, s.id);
        subject = s.copy.subject || subject;
        preheader = s.copy.preheader || preheader;
    }
    return {
        id: newId(),
        name: name || nextUntitledName(),
        templateId: t.id,
        strategyId: s ? s.id : null,
        subject,
        preheader,
        primaryCTA: cta,
        html,
        accentColor: window.DEFAULT_ACCENT,
        createdAt: now,
        updatedAt: now,
        variants: [],
        activeVariantId: null
    };
}

function activeDraft() {
    return store.drafts.find(d => d.id === store.activeId) || null;
}

function activeVariant(d) {
    if (!d || !d.activeVariantId) return null;
    return d.variants.find(v => v.id === d.activeVariantId) || null;
}

function activeMounted() {
    const d = activeDraft();
    if (!d) return null;
    return activeVariant(d) || d;
}

function currentDraftState() {
    const d = activeDraft();
    if (!d) return null;
    return {
        draftName: d.name,
        subject: elDraftSubject.value,
        preheader: elDraftPreheader.value,
        selectedSection: selectedSectionLabel(),
        selectedCopy: selectedEditable ? textFromNode(selectedEditable) : '',
        emailSummary: extractSnippet(elPreview.innerHTML),
        fullEmailText: extractText(elPreview.innerHTML)
    };
}

// ---------- Bootstrap ----------

function bootstrap() {
    const loaded = loadStore();
    if (loaded && loaded.drafts.length) store = loaded;
    else {
        const d = newDraft('Untitled draft');
        store = freshStore();
        store.drafts = [d];
        store.activeId = d.id;
    }
    persist();
}

// ---------- Mount draft into preview ----------

function mountActive() {
    const d = activeDraft();
    if (!d) return;
    const v = activeVariant(d);
    const mounted = v || d;
    if (!mounted.accentColor) mounted.accentColor = window.DEFAULT_ACCENT;
    if (!mounted.primaryCTA) {
        const t = window.getTemplate(mounted.templateId || d.templateId);
        mounted.primaryCTA = { ...t.defaults.primaryCTA };
    }
    const migrated = migrateLegacyHTML(mounted.html, mounted.templateId || d.templateId);
    if (migrated !== mounted.html) {
        mounted.html = migrated;
        mounted.updatedAt = Date.now();
        persist();
    }
    elPreview.innerHTML = mounted.html;
    applyContentEditable();
    const root = elPreview.querySelector('#email-root');
    normalizeWordmark(root);
    window.applyAccentToDOM(root, mounted.accentColor);
    window.syncPrimaryCTAToDOM(root, mounted.primaryCTA);
    syncImageInputsFromDOM();
    bindImageDropTargets();
    elDraftName.value = d.name;
    elDraftSubject.value = mounted.subject || '';
    elDraftPreheader.value = mounted.preheader || '';
    elAccentColor.value = mounted.accentColor;
    elCtaLabel.value = mounted.primaryCTA.label || '';
    elCtaUrl.value = mounted.primaryCTA.url || '';
    selectedEditable = null;
    isDirty = false;
    renderMetadata();
    renderVariants();
    renderChat();
    renderSuggestions();
}

// Force every wordmark "N" back to inherit the parent color, regardless of
// whatever accent hex was baked into existing drafts before Round 4.
function normalizeWordmark(root) {
    if (!root) return;
    root.querySelectorAll('.ef-wordmark-accent').forEach(el => {
        el.style.color = 'inherit';
    });
}

function migrateLegacyHTML(html, templateId) {
    if (!html) return html;
    if (html.indexOf('data-v="5"') !== -1) return html;

    const targetTemplate = window.getTemplate(templateId || inferTemplateId(html));
    const oldWrap = document.createElement('div');
    oldWrap.innerHTML = html;
    const newWrap = document.createElement('div');
    newWrap.innerHTML = targetTemplate.html;

    TEXT_TRANSFER_CLASSES.forEach(cls => {
        const olds = oldWrap.querySelectorAll('.' + cls);
        const news = newWrap.querySelectorAll('.' + cls);
        const limit = Math.min(olds.length, news.length);
        for (let i = 0; i < limit; i++) news[i].innerHTML = olds[i].innerHTML;
    });

    [['#hero-img', 'src'], ['#product-img', 'src']].forEach(([sel, attr]) => {
        const o = oldWrap.querySelector(sel);
        const n = newWrap.querySelector(sel);
        if (o && n && o.getAttribute(attr)) n.setAttribute(attr, o.getAttribute(attr));
    });

    // Carry forward any optional toggleable blocks (e.g. referral note) that
    // exist in the old draft but aren't in the fresh template.
    oldWrap.querySelectorAll('[data-block]').forEach(block => {
        const newRoot = newWrap.querySelector('#email-root');
        const newFooter = newWrap.querySelector('.ef-footer');
        if (!newRoot || !newFooter) return;
        if (newRoot.querySelector('[data-block="' + block.getAttribute('data-block') + '"]')) return;
        newFooter.parentNode.insertBefore(block.cloneNode(true), newFooter);
    });

    return newWrap.innerHTML;
}

function applyContentEditable() {
    const root = elPreview.querySelector('#email-root');
    if (!root) return;
    root.querySelectorAll(EDITABLE_SELECTOR).forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-copy-section', sectionNameForElement(el));
    });
}

function syncImageInputsFromDOM() {
    const hero = elPreview.querySelector('#hero-img');
    const product = elPreview.querySelector('#product-img');
    elHeroUrl.value = hero ? hero.getAttribute('src') || '' : '';
    elProductUrl.value = product ? product.getAttribute('src') || '' : '';
}

// ---------- Sidebar ----------

function renderSidebar() {
    elDraftList.innerHTML = '';
    const sorted = store.drafts.slice().sort((a, b) => b.updatedAt - a.updatedAt);

    for (const d of sorted) {
        const li = document.createElement('li');
        li.className = 'draft-row' + (d.id === store.activeId ? ' is-active' : '');
        li.dataset.id = d.id;

        const name = document.createElement('div');
        name.className = 'draft-row-name';
        name.textContent = d.name;
        li.appendChild(name);

        if (d.subject) {
            const subj = document.createElement('div');
            subj.className = 'draft-row-subject';
            subj.textContent = d.subject;
            li.appendChild(subj);
        }

        const snippet = document.createElement('div');
        snippet.className = 'draft-row-snippet';
        snippet.textContent = extractSnippet(d.html);
        li.appendChild(snippet);

        const meta = document.createElement('div');
        meta.className = 'draft-row-meta';

        const left = document.createElement('div');
        left.className = 'draft-row-meta-left';

        const t = window.getTemplate(d.templateId);
        const badge = document.createElement('span');
        badge.className = 'draft-row-badge';
        badge.textContent = t.shortLabel;
        badge.title = t.label;
        left.appendChild(badge);

        const time = document.createElement('span');
        time.className = 'draft-row-time';
        time.textContent = formatRelative(d.updatedAt);
        left.appendChild(time);

        meta.appendChild(left);

        const actions = document.createElement('div');
        actions.className = 'draft-row-actions';
        actions.appendChild(rowAction('Dup', 'Duplicate draft', () => duplicateDraft(d.id)));
        actions.appendChild(rowAction('Del', 'Delete draft', () => deleteDraft(d.id), 'danger'));
        meta.appendChild(actions);
        li.appendChild(meta);

        li.addEventListener('click', () => {
            if (name.getAttribute('contenteditable') === 'true') return;
            selectDraft(d.id);
        });
        name.addEventListener('dblclick', e => {
            e.stopPropagation();
            startInlineRename(name, d.id);
        });

        elDraftList.appendChild(li);
    }
}

function rowAction(text, title, onClick, danger) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'draft-action' + (danger ? ' danger' : '');
    btn.textContent = text;
    btn.title = title;
    btn.addEventListener('click', e => {
        e.stopPropagation();
        onClick();
    });
    return btn;
}

function extractSnippet(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const heading = tmp.querySelector('.ef-h2, .ef-hero-headline, .ef-closing-h');
    const raw = heading ? textFromNode(heading) : tmp.textContent || '';
    const text = raw.trim().replace(/\s+/g, ' ');
    return text.length > 80 ? text.slice(0, 80) + '...' : text;
}

function extractText(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 4000);
}

function textFromNode(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    return (clone.textContent || '').trim().replace(/\s+/g, ' ');
}

function formatRelative(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd ago';
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ---------- Inline rename ----------

function startInlineRename(nameEl, id) {
    nameEl.setAttribute('contenteditable', 'true');
    nameEl.focus();
    const r = document.createRange();
    r.selectNodeContents(nameEl);
    r.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);

    function commit(save) {
        nameEl.removeAttribute('contenteditable');
        nameEl.removeEventListener('blur', onBlur);
        nameEl.removeEventListener('keydown', onKey);
        const next = (nameEl.textContent || '').trim();
        const d = store.drafts.find(x => x.id === id);
        if (!d) return;
        if (save && next && next !== d.name) {
            d.name = next;
            d.updatedAt = Date.now();
            persist();
            if (id === store.activeId) elDraftName.value = d.name;
        } else nameEl.textContent = d.name;
        renderSidebar();
    }
    function onBlur() { commit(true); }
    function onKey(e) {
        if (e.key === 'Enter') { e.preventDefault(); commit(true); }
        else if (e.key === 'Escape') { e.preventDefault(); commit(false); }
    }
    nameEl.addEventListener('blur', onBlur);
    nameEl.addEventListener('keydown', onKey);
}

// ---------- Draft CRUD ----------

function selectDraft(id) {
    if (store.activeId === id) return;
    captureActiveIntoStore();
    store.activeId = id;
    persist();
    mountActive();
    renderSidebar();
}

function createDraft(templateId, strategyId) {
    captureActiveIntoStore();
    const d = newDraft(undefined, templateId, strategyId);
    store.drafts.push(d);
    store.activeId = d.id;
    persist();
    mountActive();
    renderSidebar();
}

function createDraftWithStrategy(strategyId) {
    const s = window.getStrategy(strategyId);
    if (!s) return;
    createDraft('education', s.id);
}

// Spawn a draft with two variants pre-filled from an A/B starter pairing.
function createABStarter(starterId) {
    const starter = window.getABStarter(starterId);
    if (!starter) return;
    captureActiveIntoStore();
    const d = newDraft('A/B: ' + starter.name, starter.templateId);
    store.drafts.push(d);
    store.activeId = d.id;
    [starter.variantA, starter.variantB].forEach((stratId, idx) => {
        const s = window.getStrategy(stratId);
        if (!s) return;
        const letter = idx === 0 ? 'A' : 'B';
        d.variants.push(normalizeVariant({
            id: newId(),
            label: letter + ' · ' + s.name,
            templateId: starter.templateId,
            subject: s.copy.subject || '',
            preheader: s.copy.preheader || '',
            primaryCTA: { label: s.copy.ctaLabel || '', url: window.getTemplate(starter.templateId).defaults.primaryCTA.url },
            html: window.buildStrategyHTML(starter.templateId, s.id),
            accentColor: window.DEFAULT_ACCENT,
            notes: s.description,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }, starter.templateId));
    });
    d.activeVariantId = d.variants[0].id;
    persist();
    mountActive();
    renderSidebar();
    flash('A/B test created');
}

function duplicateDraft(id) {
    captureActiveIntoStore();
    const src = store.drafts.find(d => d.id === id);
    if (!src) return;
    const copy = normalizeDraft(JSON.parse(JSON.stringify(src)));
    copy.id = newId();
    copy.name = src.name + ' (copy)';
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    copy.variants = copy.variants.map(v => ({ ...v, id: newId() }));
    store.drafts.push(copy);
    store.activeId = copy.id;
    persist();
    mountActive();
    renderSidebar();
}

function deleteDraft(id) {
    const d = store.drafts.find(x => x.id === id);
    if (!d) return;
    if (!confirm('Delete "' + d.name + '"? This cannot be undone.')) return;
    store.drafts = store.drafts.filter(x => x.id !== id);
    if (store.activeId === id) {
        if (store.drafts.length) store.activeId = store.drafts[0].id;
        else {
            const fresh = newDraft('Untitled draft');
            store.drafts.push(fresh);
            store.activeId = fresh.id;
        }
    }
    persist();
    mountActive();
    renderSidebar();
}

// ---------- Capture / save ----------

function captureActiveIntoStore() {
    const d = activeDraft();
    if (!d) return false;
    const root = elPreview.querySelector('#email-root');
    if (!root) return false;
    const target = activeVariant(d) || d;
    const cleaned = stripContentEditable(root.outerHTML);
    const subject = elDraftSubject.value.trim();
    const preheader = elDraftPreheader.value.trim();
    const ctaLabel = elCtaLabel.value.trim();
    const ctaUrl = elCtaUrl.value.trim();
    const currentCTA = target.primaryCTA || { label: '', url: '' };
    const changed = cleaned !== target.html ||
        subject !== target.subject ||
        preheader !== target.preheader ||
        elAccentColor.value !== target.accentColor ||
        ctaLabel !== currentCTA.label ||
        ctaUrl !== currentCTA.url;
    if (!changed) return false;
    target.html = cleaned;
    target.subject = subject;
    target.preheader = preheader;
    target.accentColor = elAccentColor.value;
    target.primaryCTA = { label: ctaLabel, url: ctaUrl };
    target.updatedAt = Date.now();
    d.updatedAt = Date.now();
    if (!activeVariant(d)) {
        d.subject = subject;
        d.preheader = preheader;
        d.html = cleaned;
        d.accentColor = elAccentColor.value;
        d.primaryCTA = { label: ctaLabel, url: ctaUrl };
    }
    return true;
}

function stripContentEditable(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('data-copy-section');
    });
    return tmp.innerHTML;
}

function saveActive(reason) {
    const changed = captureActiveIntoStore();
    if (changed) persist();
    isDirty = false;
    renderSidebar();
    renderMetadata();
    renderVariants();
    flash(reason === 'auto' ? 'Auto-saved' : 'Saved');
}

function startAutosave() {
    setInterval(() => {
        if (!isDirty) return;
        saveActive('auto');
    }, AUTOSAVE_MS);
    window.addEventListener('beforeunload', () => {
        captureActiveIntoStore();
        persist();
    });
}

function markDirty() {
    isDirty = true;
    renderMetadata();
}

function flash(message) {
    elSaveIndicator.textContent = message;
    elSaveIndicator.classList.add('is-flash');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
        elSaveIndicator.classList.remove('is-flash');
        elSaveIndicator.textContent = '';
    }, FLASH_MS);
}

// ---------- Metadata / preview ----------

function renderMetadata() {
    if (!elInboxSubject) return;
    elInboxSubject.textContent = elDraftSubject.value.trim() || 'Subject line';
    elInboxPreheader.textContent = elDraftPreheader.value.trim() || 'Preheader preview text';
}

function bindImageInputs() {
    elHeroUrl.addEventListener('input', () => {
        const img = elPreview.querySelector('#hero-img');
        if (img) img.setAttribute('src', elHeroUrl.value);
        markDirty();
    });
    elProductUrl.addEventListener('input', () => {
        const img = elPreview.querySelector('#product-img');
        if (img) img.setAttribute('src', elProductUrl.value);
        markDirty();
    });
}

// ---------- Photo drawer (local, no API) ----------
//
// Photos come from two places, merged: the static seed in photos.js
// (window.PHOTO_LIBRARY) and a localStorage store the user fills via the
// drawer's "Add image" field. Shopify CDN URLs are public, so no auth needed.

const PHOTOS_KEY = 'olnian.photos.v1';

function loadStoredPhotos() {
    try {
        const raw = localStorage.getItem(PHOTOS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.filter(p => p && p.url) : [];
    } catch (_) {
        return [];
    }
}

function saveStoredPhotos(list) {
    try {
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(list));
    } catch (_) {}
}

// Accepts a raw string (newline/comma separated URLs) or an array; dedupes by
// url against what's already stored. Returns the number actually added.
function addStoredPhotos(input, alt) {
    const urls = (Array.isArray(input) ? input : String(input || '').split(/[\s,]+/))
        .map(u => u.trim())
        .filter(Boolean);
    if (!urls.length) return 0;
    const stored = loadStoredPhotos();
    const seen = new Set(stored.map(p => p.url));
    let added = 0;
    urls.forEach(url => {
        if (seen.has(url)) return;
        seen.add(url);
        stored.push({ id: 'ph_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7), url: url, alt: (alt || '').trim() });
        added++;
    });
    if (added) saveStoredPhotos(stored);
    return added;
}

function removeStoredPhoto(id) {
    const stored = loadStoredPhotos().filter(p => p.id !== id);
    saveStoredPhotos(stored);
}

// Merge seed (read-only) + stored (removable), dedupe by url. Seed entries get
// no id (so no remove control); stored entries carry their id.
function getAllPhotos() {
    const seed = Array.isArray(window.PHOTO_LIBRARY) ? window.PHOTO_LIBRARY : [];
    const out = [];
    const seen = new Set();
    seed.forEach(p => {
        if (!p || !p.url || seen.has(p.url)) return;
        seen.add(p.url);
        out.push({ url: p.url, alt: p.alt || '', filename: p.url.split('/').pop().split('?')[0], removable: false });
    });
    loadStoredPhotos().forEach(p => {
        if (!p.url || seen.has(p.url)) return;
        seen.add(p.url);
        out.push({ id: p.id, url: p.url, alt: p.alt || '', filename: p.url.split('/').pop().split('?')[0], removable: true });
    });
    return out;
}

function bindPhotoDrawer() {
    const openBtn = document.getElementById('photos-toggle-btn');
    const closeBtn = document.getElementById('photo-drawer-close');
    const search = document.getElementById('photo-search');
    if (openBtn) openBtn.addEventListener('click', openPhotoDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closePhotoDrawer);
    if (search) search.addEventListener('input', () => renderPhotoGrid(getAllPhotos(), search.value));

    const addForm = document.getElementById('photo-add-form');
    const addUrl = document.getElementById('photo-add-url');
    const addAlt = document.getElementById('photo-add-alt');
    if (addForm) {
        addForm.addEventListener('submit', e => {
            e.preventDefault();
            const added = addStoredPhotos(addUrl ? addUrl.value : '', addAlt ? addAlt.value : '');
            if (!added) {
                flash('Enter an image URL');
                return;
            }
            if (addUrl) addUrl.value = '';
            if (addAlt) addAlt.value = '';
            renderPhotoGrid(getAllPhotos(), search ? search.value : '');
            flash('Added ' + added + ' image' + (added === 1 ? '' : 's'));
            if (addUrl) addUrl.focus();
        });
    }
}

function openPhotoDrawer() {
    const drawer = document.getElementById('photo-drawer');
    if (!drawer) return;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    const search = document.getElementById('photo-search');
    renderPhotoGrid(getAllPhotos(), search ? search.value : '');
}

function closePhotoDrawer() {
    const drawer = document.getElementById('photo-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    hidePhotoPreview();
    setTimeout(() => { drawer.hidden = true; }, 220);
}

function renderPhotoGrid(files, filter) {
    const grid = document.getElementById('photo-grid');
    if (!grid) return;
    hidePhotoPreview();
    const q = (filter || '').trim().toLowerCase();
    const rows = files.filter(f => !q || (f.alt || '').toLowerCase().includes(q) || (f.filename || '').toLowerCase().includes(q));
    grid.innerHTML = '';
    if (!rows.length) {
        grid.innerHTML = '<div class="photo-empty">' + (files.length ? 'No matches.' : 'No photos yet — paste an image URL above to start your library.') + '</div>';
        return;
    }
    rows.forEach(f => {
        const fig = document.createElement('figure');
        fig.className = 'photo-thumb';
        fig.draggable = true;
        const img = document.createElement('img');
        img.src = f.url;
        img.alt = f.alt || f.filename || '';
        img.loading = 'lazy';
        const cap = document.createElement('figcaption');
        cap.textContent = f.alt || f.filename || '';
        fig.appendChild(img);
        fig.appendChild(cap);
        if (f.removable && f.id) {
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'photo-thumb-remove';
            del.title = 'Remove from library';
            del.textContent = '×';
            del.addEventListener('click', ev => {
                ev.stopPropagation();
                removeStoredPhoto(f.id);
                const search = document.getElementById('photo-search');
                renderPhotoGrid(getAllPhotos(), search ? search.value : '');
                flash('Removed');
            });
            fig.appendChild(del);
        }
        fig.addEventListener('mouseenter', () => showPhotoPreview(fig, f));
        fig.addEventListener('mouseleave', hidePhotoPreview);
        fig.addEventListener('dragstart', e => {
            hidePhotoPreview();
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/uri-list', f.url);
            e.dataTransfer.setData('text/plain', f.url);
            try {
                e.dataTransfer.setData('application/x-olnian-image', JSON.stringify({ url: f.url, alt: img.alt }));
            } catch (_) {}
        });
        fig.addEventListener('click', () => {
            navigator.clipboard && navigator.clipboard.writeText(f.url).then(() => flash('Copied URL'));
        });
        grid.appendChild(fig);
    });
}

// ---------- Blocks panel (toggleable insertable sections) ----------

function bindBlocksPanel() {
    const btn = document.getElementById('blocks-toggle-btn');
    const panel = document.getElementById('blocks-panel');
    const toggle = document.getElementById('block-referral-toggle');
    if (!btn || !panel || !toggle) return;

    btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = panel.hasAttribute('hidden');
        if (open) {
            syncBlocksPanelState();
            panel.removeAttribute('hidden');
            btn.classList.add('is-open');
        } else {
            panel.setAttribute('hidden', '');
            btn.classList.remove('is-open');
        }
    });
    document.addEventListener('click', e => {
        if (panel.hasAttribute('hidden')) return;
        if (e.target === btn || panel.contains(e.target)) return;
        panel.setAttribute('hidden', '');
        btn.classList.remove('is-open');
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !panel.hasAttribute('hidden')) {
            panel.setAttribute('hidden', '');
            btn.classList.remove('is-open');
        }
    });

    toggle.addEventListener('change', () => {
        setReferralBlock(toggle.checked);
    });
}

function syncBlocksPanelState() {
    const toggle = document.getElementById('block-referral-toggle');
    if (!toggle) return;
    toggle.checked = isReferralPresent();
}

function isReferralPresent() {
    const root = elPreview && elPreview.querySelector('#email-root');
    return !!(root && root.querySelector('[data-block="referral"]'));
}

function setReferralBlock(on) {
    const root = elPreview && elPreview.querySelector('#email-root');
    if (!root) return;
    const existing = root.querySelector('[data-block="referral"]');
    if (on && existing) return;
    if (!on && !existing) return;
    if (on) {
        const footer = root.querySelector('.ef-footer');
        if (!footer) return;
        const tmp = document.createElement('div');
        tmp.innerHTML = (window.REFERRAL_BLOCK_HTML || '').trim();
        const block = tmp.firstElementChild;
        if (!block) return;
        footer.parentNode.insertBefore(block, footer);
        applyContentEditable();
        flash('Referral note added');
    } else {
        existing.remove();
        flash('Referral note removed');
    }
    markDirty();
    captureActiveIntoStore();
}

// ---------- iPhone Gmail preview modal ----------

const PHONE_CLICKABLES_CSS = [
    'a[href], [data-cta-primary] { ',
    '  outline: 2px dashed #F2663A !important;',
    '  outline-offset: 2px !important;',
    '  position: relative !important;',
    '}',
    'a[href]::after {',
    '  content: attr(href);',
    '  position: absolute;',
    '  top: -18px;',
    '  left: 0;',
    '  font: 10px/1 -apple-system, BlinkMacSystemFont, sans-serif !important;',
    '  background: #F2663A;',
    '  color: #ffffff !important;',
    '  padding: 2px 5px;',
    '  border-radius: 2px;',
    '  max-width: 240px;',
    '  white-space: nowrap;',
    '  overflow: hidden;',
    '  text-overflow: ellipsis;',
    '  z-index: 10;',
    '  letter-spacing: 0 !important;',
    '  text-transform: none !important;',
    '}'
].join('\n');

function bindIphonePreview() {
    const openBtn = document.getElementById('iphone-preview-btn');
    const closeBtn = document.getElementById('iphone-preview-close');
    const refreshBtn = document.getElementById('iphone-preview-refresh');
    const showClickables = document.getElementById('iphone-show-clickables');
    const modal = document.getElementById('iphone-preview-modal');
    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', openIphonePreview);
    if (closeBtn) closeBtn.addEventListener('click', closeIphonePreview);
    if (refreshBtn) refreshBtn.addEventListener('click', renderIphonePreview);
    if (showClickables) showClickables.addEventListener('change', renderIphonePreview);

    modal.addEventListener('click', e => {
        if (e.target === modal) closeIphonePreview();
    });

    document.querySelectorAll('.iphone-device-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            const w = btn.getAttribute('data-width');
            const frame = document.getElementById('iphone-frame');
            if (frame) frame.style.width = w + 'px';
            document.querySelectorAll('.iphone-device-toggle button').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeIphonePreview();
    });
}

function openIphonePreview() {
    const modal = document.getElementById('iphone-preview-modal');
    if (!modal) return;
    renderIphonePreview();
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
}

function closeIphonePreview() {
    const modal = document.getElementById('iphone-preview-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => { modal.hidden = true; }, 180);
}

function renderIphonePreview() {
    captureActiveIntoStore();
    const d = activeDraft();
    if (!d) return;
    const v = activeVariant(d) || d;
    const subject = v.subject || d.subject || '(no subject)';
    const preheader = v.preheader || d.preheader || '';

    const subjectEl = document.getElementById('iphone-preview-subject');
    const preheaderEl = document.getElementById('iphone-preview-preheader');
    if (subjectEl) subjectEl.textContent = subject;
    if (preheaderEl) preheaderEl.textContent = preheader;

    let doc = buildExportDocument(v);
    const showClickables = document.getElementById('iphone-show-clickables');
    if (showClickables && showClickables.checked) {
        doc = doc.replace('</head>', '<style>' + PHONE_CLICKABLES_CSS + '</style></head>');
    }

    const iframe = document.getElementById('iphone-preview-frame');
    if (iframe) iframe.srcdoc = doc;

    const counter = document.getElementById('iphone-preview-counter');
    if (counter) {
        const tmp = document.createElement('div');
        tmp.innerHTML = v.html || '';
        const links = tmp.querySelectorAll('a[href]').length;
        const primary = tmp.querySelectorAll('[data-cta-primary]').length;
        counter.textContent = links + ' link' + (links === 1 ? '' : 's') + ' · ' + primary + ' primary CTA' + (primary === 1 ? '' : 's');
    }
}

// ---------- Photo hover preview (escapes drawer overflow) ----------

function showPhotoPreview(thumbEl, file) {
    hidePhotoPreview();
    const pop = document.createElement('div');
    pop.id = 'photo-hover-preview';
    pop.className = 'photo-hover-preview';
    const img = document.createElement('img');
    img.src = file.url;
    img.alt = file.alt || file.filename || '';
    pop.appendChild(img);
    const cap = document.createElement('div');
    cap.className = 'photo-hover-preview-cap';
    cap.textContent = file.alt || file.filename || '';
    pop.appendChild(cap);
    document.body.appendChild(pop);

    const rect = thumbEl.getBoundingClientRect();
    const popW = 320;
    const popH = 360;
    let left = rect.left + rect.width / 2 - popW / 2;
    let top = rect.top - popH - 12;
    if (top < 8) top = rect.bottom + 12;
    left = Math.max(8, Math.min(window.innerWidth - popW - 8, left));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
}

function hidePhotoPreview() {
    const existing = document.getElementById('photo-hover-preview');
    if (existing) existing.remove();
}

// ---------- Image drop targets in the preview ----------

function bindImageDropTargets() {
    const root = elPreview.querySelector('#email-root');
    if (!root) return;
    ['#hero-img', '#product-img'].forEach(sel => {
        const img = root.querySelector(sel);
        if (!img) return;
        img.addEventListener('dragover', e => {
            e.preventDefault();
            img.classList.add('is-drop-target');
            e.dataTransfer.dropEffect = 'copy';
        });
        img.addEventListener('dragleave', () => img.classList.remove('is-drop-target'));
        img.addEventListener('drop', e => {
            e.preventDefault();
            img.classList.remove('is-drop-target');
            const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
            if (!url) return;
            img.setAttribute('src', url);
            if (sel === '#hero-img' && elHeroUrl) elHeroUrl.value = url;
            if (sel === '#product-img' && elProductUrl) elProductUrl.value = url;
            markDirty();
            flash('Image updated');
        });
    });
}

function addPickerSection(label, hint) {
    const li = document.createElement('li');
    li.className = 'template-picker-section';
    const title = document.createElement('strong');
    title.textContent = label;
    li.appendChild(title);
    if (hint) {
        const span = document.createElement('span');
        span.textContent = hint;
        li.appendChild(span);
    }
    elTemplatePicker.appendChild(li);
}

function addPickerItem(label, description, onClick) {
    const li = document.createElement('li');
    li.className = 'template-picker-item';
    const title = document.createElement('strong');
    title.textContent = label;
    li.appendChild(title);
    if (description) {
        const desc = document.createElement('span');
        desc.textContent = description;
        li.appendChild(desc);
    }
    li.addEventListener('click', onClick);
    elTemplatePicker.appendChild(li);
}

function bindTemplatePicker() {
    if (!elTemplatePicker || !elNewBtn) return;
    elTemplatePicker.innerHTML = '';

    addPickerSection('Templates', null);
    window.TEMPLATES.forEach(t => addPickerItem(t.label, t.description, () => { closeTemplatePicker(); createDraft(t.id); }));

    addPickerSection('Strategies', 'Applied to Product Education template.');
    window.STRATEGIES.forEach(s => addPickerItem(s.name, s.description, () => { closeTemplatePicker(); createDraftWithStrategy(s.id); }));

    addPickerSection('A/B Test Starters', 'One draft, two variants pre-filled.');
    window.AB_STARTERS.forEach(a => addPickerItem(a.name, a.description, () => { closeTemplatePicker(); createABStarter(a.id); }));

    elNewBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleTemplatePicker();
    });
    document.addEventListener('click', e => {
        if (!elNewDraftWrap || elNewDraftWrap.contains(e.target)) return;
        closeTemplatePicker();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeTemplatePicker();
    });
}

function toggleTemplatePicker() {
    if (!elTemplatePicker) return;
    const open = !elTemplatePicker.hasAttribute('hidden');
    if (open) closeTemplatePicker(); else openTemplatePicker();
}

function openTemplatePicker() {
    if (!elTemplatePicker) return;
    elTemplatePicker.removeAttribute('hidden');
    elNewBtn.classList.add('is-open');
}

function closeTemplatePicker() {
    if (!elTemplatePicker) return;
    elTemplatePicker.setAttribute('hidden', '');
    elNewBtn.classList.remove('is-open');
}

function bindViewport() {
    const buttons = elViewportToggle.querySelectorAll('button');
    function set(width) {
        buttons.forEach(b => b.classList.toggle('is-active', b.dataset.width === String(width)));
        elPreview.classList.toggle('viewport-mobile', String(width) === '480');
    }
    buttons.forEach(b => b.addEventListener('click', () => set(b.dataset.width)));
    set(480);
}

function bindSelectionTracking() {
    elPreview.addEventListener('focusin', e => {
        const editable = e.target.closest(EDITABLE_SELECTOR);
        if (!editable) return;
        if (selectedEditable) selectedEditable.classList.remove('is-selected-copy');
        selectedEditable = editable;
        selectedEditable.classList.add('is-selected-copy');
        elSelectedSection.textContent = selectedSectionLabel();
    });
    elPreview.addEventListener('click', e => {
        const editable = e.target.closest(EDITABLE_SELECTOR);
        if (!editable) return;
        selectedEditable = editable;
        elSelectedSection.textContent = selectedSectionLabel();
    });
}

function selectedSectionLabel() {
    if (!selectedEditable) return 'No section selected';
    return selectedEditable.getAttribute('data-copy-section') || sectionNameForElement(selectedEditable);
}

function sectionNameForElement(el) {
    if (el.closest('.ef-hero-text')) return 'Hero';
    if (el.closest('.ef-promo')) return 'Promo';
    if (el.closest('.ef-body')) return 'Body';
    if (el.closest('.ef-product')) return 'Product';
    if (el.closest('.ef-stats')) return 'Stats';
    if (el.closest('.ef-steps')) return 'How it works';
    if (el.closest('.ef-closing')) return 'Closing';
    if (el.closest('.ef-footer')) return 'Footer';
    if (el.closest('.ef-header')) return 'Header';
    return 'Email copy';
}

// ---------- A/B variants ----------

function renderVariants() {
    const d = activeDraft();
    if (!d || !elVariantList) return;
    elVariantList.innerHTML = '';

    const base = document.createElement('button');
    base.type = 'button';
    base.className = 'variant-chip' + (!d.activeVariantId ? ' is-active' : '');
    base.textContent = 'Base';
    base.addEventListener('click', () => switchVariant(null));
    elVariantList.appendChild(base);

    d.variants.forEach((v, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'variant-chip' + (d.activeVariantId === v.id ? ' is-active' : '');
        btn.textContent = v.label || ('Variant ' + String.fromCharCode(65 + index));
        btn.title = v.notes || '';
        btn.addEventListener('click', () => switchVariant(v.id));
        elVariantList.appendChild(btn);
    });
}

function switchVariant(id) {
    const d = activeDraft();
    if (!d) return;
    captureActiveIntoStore();
    d.activeVariantId = id;
    persist();
    mountActive();
    renderSidebar();
}

function createVariantFromCurrent(label, notes, overrides) {
    const d = activeDraft();
    if (!d) return;
    captureActiveIntoStore();
    const letter = String.fromCharCode(65 + d.variants.length);
    const snapshot = activeVariant(d) || d;
    const next = normalizeVariant({
        id: newId(),
        label: label || 'Variant ' + letter,
        subject: overrides && overrides.subject ? overrides.subject : snapshot.subject,
        preheader: overrides && overrides.preheader ? overrides.preheader : snapshot.preheader,
        html: snapshot.html,
        accentColor: snapshot.accentColor,
        notes: notes || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    d.variants.push(next);
    d.activeVariantId = next.id;
    d.updatedAt = Date.now();
    persist();
    mountActive();
    renderSidebar();
    flash('Variant created');
}

// ---------- Copy coach ----------

function renderChat() {
    if (!elChatLog) return;
    elChatLog.innerHTML = '';
    const messages = store.chat.slice(-16);
    messages.forEach(m => {
        const div = document.createElement('div');
        div.className = 'chat-message ' + (m.role === 'user' ? 'user' : 'assistant');
        div.textContent = m.content;
        elChatLog.appendChild(div);
    });
    elChatLog.scrollTop = elChatLog.scrollHeight;
}

function renderSuggestions() {
    renderSuggestionList(elSuggestionList, store.suggestions.filter(s => !s.saved).slice(-8).reverse());
    renderSuggestionList(elSavedSuggestionList, store.suggestions.filter(s => s.saved).slice(-8).reverse());
}

function renderSuggestionList(container, suggestions) {
    if (!container) return;
    container.innerHTML = '';
    if (!suggestions.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No suggestions yet.';
        container.appendChild(empty);
        return;
    }
    suggestions.forEach(s => container.appendChild(suggestionCard(s)));
}

function suggestionCard(s) {
    const card = document.createElement('article');
    card.className = 'suggestion-card';

    const meta = document.createElement('div');
    meta.className = 'suggestion-meta';
    meta.textContent = (s.target || 'copy') + ' · ' + formatRelative(s.createdAt);
    card.appendChild(meta);

    if (s.subject) {
        const subj = document.createElement('p');
        subj.className = 'suggestion-subject';
        subj.textContent = s.subject;
        card.appendChild(subj);
    }

    const copy = document.createElement('p');
    copy.className = 'suggestion-copy';
    copy.textContent = s.copy || s.preheader || s.reply || '';
    card.appendChild(copy);

    if (s.rationale) {
        const why = document.createElement('p');
        why.className = 'suggestion-rationale';
        why.textContent = s.rationale;
        card.appendChild(why);
    }

    const actions = document.createElement('div');
    actions.className = 'suggestion-actions';
    actions.appendChild(smallButton('Apply', () => applySuggestion(s)));
    actions.appendChild(smallButton(s.saved ? 'Saved' : 'Save', () => saveSuggestion(s.id), s.saved));
    actions.appendChild(smallButton('Make Variant', () => createVariantFromSuggestion(s)));
    actions.appendChild(smallButton('Try Again', () => requestCopy(s.action || 'chat', s.prompt || 'Try another version of this suggestion.')));
    card.appendChild(actions);

    return card;
}

function smallButton(label, onClick, disabled) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mini-btn';
    btn.textContent = label;
    btn.disabled = !!disabled;
    btn.addEventListener('click', onClick);
    return btn;
}

function saveSuggestion(id) {
    const s = store.suggestions.find(x => x.id === id);
    if (!s) return;
    s.saved = true;
    persist();
    renderSuggestions();
}

function createVariantFromSuggestion(s) {
    createVariantFromCurrent('Variant ' + String.fromCharCode(65 + activeDraft().variants.length), s.rationale || s.copy || '', {
        subject: s.subject || '',
        preheader: s.preheader || ''
    });
}

function applySuggestion(s) {
    if (s.subject) elDraftSubject.value = s.subject;
    if (s.preheader) elDraftPreheader.value = s.preheader;
    if (s.copy && selectedEditable && !s.subjectOnly) selectedEditable.textContent = s.copy;
    s.applied = true;
    markDirty();
    saveActive('manual');
    persist();
    renderSuggestions();
    flash('Applied');
}

function bindCoach() {
    elBrandMemory.addEventListener('change', () => {
        store.brandMemory = elBrandMemory.value.trim() || DEFAULT_BRAND_MEMORY;
        persist();
    });

    elChatSendBtn.addEventListener('click', () => sendChat());
    elChatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendChat();
    });

    elActionButtons.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => requestCopy(btn.dataset.action, ACTION_PROMPTS[btn.dataset.action]));
    });

    const dismiss = document.getElementById('coach-setup-dismiss');
    if (dismiss) dismiss.addEventListener('click', () => hideCoachSetupNotice());
}

function sendChat() {
    const message = elChatInput.value.trim();
    if (!message) return;
    elChatInput.value = '';
    requestCopy('chat', message);
}

async function requestCopy(action, message) {
    captureActiveIntoStore();
    persist();
    const prompt = message || ACTION_PROMPTS[action] || '';
    const userMessage = prompt || action;
    store.chat.push({ role: 'user', content: userMessage, createdAt: Date.now() });
    renderChat();
    setCoachBusy(true);

    try {
        const res = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                message: prompt,
                brandMemory: store.brandMemory,
                draft: currentDraftState(),
                priorSuggestions: store.suggestions.slice(-12),
                chat: store.chat.slice(-12)
            })
        });
        const data = await res.json();
        if (!res.ok) {
            if (data && data.code === 'NO_KEY') {
                showCoachSetupNotice(data.help || 'Add OPENAI_API_KEY to your Vercel env vars and redeploy.');
                store.chat.push({
                    role: 'assistant',
                    content: 'Copy Coach needs an OpenAI API key. ' + (data.help || ''),
                    createdAt: Date.now()
                });
                renderChat();
                return;
            }
            throw new Error(data.error || 'Copy coach request failed.');
        }

        hideCoachSetupNotice();
        const reply = data.reply || 'I made a few options for you.';
        store.chat.push({ role: 'assistant', content: reply, createdAt: Date.now() });
        addSuggestionsFromResponse(data, action, prompt);
        if (Array.isArray(data.brandMemoryUpdates) && data.brandMemoryUpdates.length) {
            store.brandMemory = [store.brandMemory, '', 'Learned preferences:', data.brandMemoryUpdates.join('\n')].join('\n');
            elBrandMemory.value = store.brandMemory;
        }
        persist();
        renderChat();
        renderSuggestions();
    } catch (e) {
        const msg = e.message || 'Copy coach is unavailable.';
        store.chat.push({ role: 'assistant', content: msg, createdAt: Date.now() });
        renderChat();
    } finally {
        setCoachBusy(false);
    }
}

function showCoachSetupNotice(help) {
    const notice = document.getElementById('coach-setup-notice');
    if (notice) {
        const body = notice.querySelector('.coach-setup-body');
        if (body) body.textContent = help;
        notice.hidden = false;
    }
    if (elActionButtons) elActionButtons.querySelectorAll('button').forEach(b => { b.disabled = true; });
    if (elChatSendBtn) elChatSendBtn.disabled = true;
}

function hideCoachSetupNotice() {
    const notice = document.getElementById('coach-setup-notice');
    if (notice) notice.hidden = true;
    if (elActionButtons) elActionButtons.querySelectorAll('button').forEach(b => { b.disabled = false; });
    if (elChatSendBtn) elChatSendBtn.disabled = false;
}

function addSuggestionsFromResponse(data, action, prompt) {
    const now = Date.now();
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    const variants = Array.isArray(data.variants) ? data.variants : [];

    suggestions.forEach(s => {
        store.suggestions.push({
            id: newId(),
            createdAt: now,
            action,
            prompt,
            target: s.target || action,
            subject: s.subject || '',
            preheader: s.preheader || '',
            copy: s.copy || s.text || '',
            rationale: s.rationale || '',
            saved: false,
            applied: false
        });
    });

    variants.forEach((v, index) => {
        store.suggestions.push({
            id: newId(),
            createdAt: now,
            action: 'ab_test',
            prompt,
            target: v.label || ('Variant ' + String.fromCharCode(65 + index)),
            subject: v.subject || '',
            preheader: v.preheader || '',
            copy: v.heroHeadline || v.bodyCopy || v.cta || '',
            rationale: v.rationale || v.angle || '',
            saved: false,
            applied: false
        });
    });
}

function setCoachBusy(busy) {
    elCoachStatus.textContent = busy ? 'Thinking...' : '';
    elChatSendBtn.disabled = busy;
    elActionButtons.querySelectorAll('button').forEach(btn => { btn.disabled = busy; });
}

// ---------- Copy export ----------

function copyEmailHTML() {
    captureActiveIntoStore();
    persist();
    const d = activeDraft();
    if (!d) return;
    copyText(buildExportDocument(activeVariant(d) || d), 'Copied HTML');
}

function copySubject() {
    copyText(elDraftSubject.value.trim(), 'Copied subject');
}

function copyPreheader() {
    copyText(elDraftPreheader.value.trim(), 'Copied preheader');
}

function copyText(value, message) {
    const text = value || '';
    const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { console.error(e); }
        document.body.removeChild(ta);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
            () => flash(message),
            () => { fallback(); flash(message); }
        );
    } else {
        fallback();
        flash(message);
    }
}

function buildExportDocument(d) {
    const accent = d.accentColor || window.DEFAULT_ACCENT;
    const cleanRoot = d.html;
    const css = window.applyAccent(window.EMAIL_EXPORT_CSS, accent);
    const subject = d.subject || 'Olnian email';
    const preheader = d.preheader || '';
    return [
        '<!doctype html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
        '<title>' + escapeHTML(subject) + '</title>',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link href="https://fonts.googleapis.com/css2?family=Belleza&family=Nunito+Sans:wght@300;400&display=swap" rel="stylesheet">',
        '<style>',
        css,
        '</style>',
        '</head>',
        '<body>',
        '<!-- Subject: ' + escapeComment(subject) + ' -->',
        '<!-- Preheader: ' + escapeComment(preheader) + ' -->',
        hiddenPreheader(preheader),
        cleanRoot,
        '</body>',
        '</html>'
    ].join('\n');
}

function hiddenPreheader(text) {
    if (!text) return '';
    return '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">' +
        escapeHTML(text) +
        '&#847;&zwnj;&nbsp;&#8199;&#65279;&#847;&zwnj;&nbsp;&#8199;&#65279;&#847;&zwnj;&nbsp;&#8199;&#65279;' +
        '</div>';
}

function escapeHTML(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeComment(s) {
    return String(s || '').replace(/--/g, '- -').replace(/[<>]/g, '');
}

// ---------- Init ----------

function injectEmailStyles() {
    const s = document.createElement('style');
    s.id = 'email-styles';
    s.textContent = window.EMAIL_EXPORT_CSS;
    document.head.appendChild(s);
}

function init() {
    elPreview = document.getElementById('preview-frame');
    elDraftList = document.getElementById('draft-list');
    elDraftName = document.getElementById('draft-name-input');
    elDraftSubject = document.getElementById('draft-subject-input');
    elDraftPreheader = document.getElementById('draft-preheader-input');
    elHeroUrl = document.getElementById('hero-url-input');
    elProductUrl = document.getElementById('product-url-input');
    elAccentColor = document.getElementById('accent-color-input');
    elCtaLabel = document.getElementById('cta-label-input');
    elCtaUrl = document.getElementById('cta-url-input');
    elNewDraftWrap = document.getElementById('new-draft-wrap');
    elTemplatePicker = document.getElementById('template-picker');
    elSaveIndicator = document.getElementById('save-indicator');
    elNewBtn = document.getElementById('new-draft-btn');
    elSaveBtn = document.getElementById('save-btn');
    elCopyBtn = document.getElementById('copy-btn');
    elCopySubjectBtn = document.getElementById('copy-subject-btn');
    elCopyPreheaderBtn = document.getElementById('copy-preheader-btn');
    elViewportToggle = document.getElementById('viewport-toggle');
    elInboxSubject = document.getElementById('inbox-subject');
    elInboxPreheader = document.getElementById('inbox-preheader');
    elBrandMemory = document.getElementById('brand-memory-input');
    elSuggestionList = document.getElementById('suggestion-list');
    elSavedSuggestionList = document.getElementById('saved-suggestion-list');
    elChatLog = document.getElementById('chat-log');
    elChatInput = document.getElementById('chat-input');
    elChatSendBtn = document.getElementById('chat-send-btn');
    elActionButtons = document.getElementById('coach-actions');
    elVariantList = document.getElementById('variant-list');
    elSelectedSection = document.getElementById('selected-section');
    elCoachStatus = document.getElementById('coach-status');

    injectEmailStyles();
    bootstrap();
    elBrandMemory.value = store.brandMemory;
    mountActive();
    renderSidebar();

    bindImageInputs();
    bindViewport();
    bindSelectionTracking();
    bindCoach();
    bindPhotoDrawer();
    bindBlocksPanel();
    bindIphonePreview();

    elPreview.addEventListener('input', markDirty);
    elDraftSubject.addEventListener('input', markDirty);
    elDraftPreheader.addEventListener('input', markDirty);
    elDraftSubject.addEventListener('input', renderMetadata);
    elDraftPreheader.addEventListener('input', renderMetadata);

    elDraftName.addEventListener('change', () => {
        const d = activeDraft();
        if (!d) return;
        const next = elDraftName.value.trim();
        if (!next) { elDraftName.value = d.name; return; }
        if (next !== d.name) {
            d.name = next;
            d.updatedAt = Date.now();
            persist();
            renderSidebar();
        }
    });

    bindTemplatePicker();
    elSaveBtn.addEventListener('click', () => saveActive('manual'));
    elCopyBtn.addEventListener('click', copyEmailHTML);
    elCopySubjectBtn.addEventListener('click', copySubject);
    elCopyPreheaderBtn.addEventListener('click', copyPreheader);

    elAccentColor.addEventListener('input', () => {
        const root = elPreview.querySelector('#email-root');
        window.applyAccentToDOM(root, elAccentColor.value);
        markDirty();
    });

    function syncCtaFromInputs() {
        const m = activeMounted();
        if (!m) return;
        m.primaryCTA = { label: elCtaLabel.value, url: elCtaUrl.value };
        const root = elPreview.querySelector('#email-root');
        window.syncPrimaryCTAToDOM(root, m.primaryCTA);
        markDirty();
    }
    elCtaLabel.addEventListener('input', syncCtaFromInputs);
    elCtaUrl.addEventListener('input', syncCtaFromInputs);

    startAutosave();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
