// ØLNIAN multi-draft email editor — app logic.
// No framework, no build step, single IIFE. Persists to localStorage.

(function () {
'use strict';

const STORAGE_KEY = 'olnian.drafts.v1';
const AUTOSAVE_MS = 30 * 1000;
const FLASH_MS = 1500;

// Text-bearing leaves inside the email template that we make contenteditable
// at runtime. The export step strips contenteditable so the output is clean.
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
    '.ef-footer-wordmark', '.ef-footer-tagline', '.ef-disclaimer', '.ef-footer-links'
].join(',');

let elPreview, elPreviewScroll, elDraftList;
let elDraftName, elDraftSubject, elHeroUrl, elProductUrl;
let elSaveIndicator, elNewBtn, elSaveBtn, elCopyBtn, elViewportToggle;

let store = { drafts: [], activeId: null };
let isDirty = false;
let flashTimer = null;

// ---------- Storage ----------

function loadStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.drafts)) return null;
        return parsed;
    } catch (e) {
        console.error('loadStore failed', e);
        return null;
    }
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.error('persist failed', e);
    }
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

function newDraft(name) {
    const now = Date.now();
    return {
        id: newId(),
        name: name || nextUntitledName(),
        subject: '',
        html: window.EMAIL_TEMPLATE_HTML,
        createdAt: now,
        updatedAt: now
    };
}

function activeDraft() {
    return store.drafts.find(d => d.id === store.activeId) || null;
}

// ---------- Bootstrap ----------

function bootstrap() {
    const loaded = loadStore();
    if (loaded && loaded.drafts.length) {
        store = loaded;
        if (!activeDraft()) store.activeId = store.drafts[0].id;
    } else {
        const d = newDraft('Untitled draft');
        store = { drafts: [d], activeId: d.id };
        persist();
    }
}

// ---------- Mount draft into preview ----------

function mountActive() {
    const d = activeDraft();
    if (!d) return;
    elPreview.innerHTML = d.html;
    applyContentEditable();
    syncImageInputsFromDOM();
    elDraftName.value = d.name;
    elDraftSubject.value = d.subject || '';
    isDirty = false;
}

function applyContentEditable() {
    const root = elPreview.querySelector('#email-root');
    if (!root) return;
    root.querySelectorAll(EDITABLE_SELECTOR).forEach(el => {
        el.setAttribute('contenteditable', 'true');
    });
}

function syncImageInputsFromDOM() {
    const hero = elPreview.querySelector('#hero-img');
    const product = elPreview.querySelector('#product-img');
    elHeroUrl.value = hero ? hero.getAttribute('src') || '' : '';
    elProductUrl.value = product ? product.getAttribute('src') || '' : '';
}

// ---------- Sidebar render ----------

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

        const time = document.createElement('span');
        time.className = 'draft-row-time';
        time.textContent = formatRelative(d.updatedAt);
        meta.appendChild(time);

        const actions = document.createElement('div');
        actions.className = 'draft-row-actions';

        const dup = document.createElement('button');
        dup.type = 'button';
        dup.className = 'draft-action';
        dup.textContent = 'Dup';
        dup.title = 'Duplicate draft';
        dup.addEventListener('click', e => { e.stopPropagation(); duplicateDraft(d.id); });
        actions.appendChild(dup);

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'draft-action danger';
        del.textContent = 'Del';
        del.title = 'Delete draft';
        del.addEventListener('click', e => { e.stopPropagation(); deleteDraft(d.id); });
        actions.appendChild(del);

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

function extractSnippet(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const heading = tmp.querySelector('.ef-h2, .ef-hero-headline, .ef-closing-h');
    const text = (heading ? heading.textContent : tmp.textContent || '')
        .trim().replace(/\s+/g, ' ');
    return text.length > 80 ? text.slice(0, 80) + '…' : text;
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
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
        } else {
            nameEl.textContent = d.name;
        }
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
    persist();
    store.activeId = id;
    persist();
    mountActive();
    renderSidebar();
}

function createDraft() {
    captureActiveIntoStore();
    const d = newDraft();
    store.drafts.push(d);
    store.activeId = d.id;
    persist();
    mountActive();
    renderSidebar();
}

function duplicateDraft(id) {
    captureActiveIntoStore();
    persist();
    const src = store.drafts.find(d => d.id === id);
    if (!src) return;
    const copy = {
        id: newId(),
        name: src.name + ' (copy)',
        subject: src.subject,
        html: src.html,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    store.drafts.push(copy);
    store.activeId = copy.id;
    persist();
    mountActive();
    renderSidebar();
}

function deleteDraft(id) {
    const d = store.drafts.find(x => x.id === id);
    if (!d) return;
    if (!confirm('Delete "' + d.name + '"? This can\'t be undone.')) return;
    store.drafts = store.drafts.filter(x => x.id !== id);
    if (store.activeId === id) {
        if (store.drafts.length) {
            store.activeId = store.drafts[0].id;
        } else {
            const fresh = newDraft('Untitled draft');
            store.drafts.push(fresh);
            store.activeId = fresh.id;
        }
    }
    persist();
    mountActive();
    renderSidebar();
}

// ---------- Capture editor state into the active draft ----------

function captureActiveIntoStore() {
    const d = activeDraft();
    if (!d) return false;
    const root = elPreview.querySelector('#email-root');
    if (!root) return false;
    const cleaned = stripContentEditable(root.outerHTML);
    const subject = elDraftSubject.value;
    if (cleaned === d.html && subject === d.subject) return false;
    d.html = cleaned;
    d.subject = subject;
    d.updatedAt = Date.now();
    return true;
}

function stripContentEditable(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    return tmp.innerHTML;
}

// ---------- Save / autosave ----------

function saveActive(reason) {
    const changed = captureActiveIntoStore();
    if (changed) persist();
    isDirty = false;
    flash(reason === 'auto' ? 'Auto-saved' : 'Saved ✓');
    renderSidebar();
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

// ---------- Image URL inputs ----------

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

// ---------- Viewport toggle ----------

function bindViewport() {
    const buttons = elViewportToggle.querySelectorAll('button');
    function set(width) {
        buttons.forEach(b => b.classList.toggle('is-active', b.dataset.width === String(width)));
        elPreview.classList.toggle('viewport-mobile', String(width) === '480');
    }
    buttons.forEach(b => b.addEventListener('click', () => set(b.dataset.width)));
    set(480);
}

// ---------- Dirty tracking ----------

function markDirty() { isDirty = true; }

// ---------- Copy export ----------

function copyEmailHTML() {
    captureActiveIntoStore();
    persist();
    const d = activeDraft();
    if (!d) return;

    const exportHTML = buildExportDocument(d);

    const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = exportHTML;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { console.error(e); }
        document.body.removeChild(ta);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(exportHTML).then(
            () => flash('Copied ✓'),
            () => { fallback(); flash('Copied ✓'); }
        );
    } else {
        fallback();
        flash('Copied ✓');
    }
}

function buildExportDocument(d) {
    const cleanRoot = d.html;
    const title = (d.subject || d.name || 'ØLNIAN email')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return [
        '<!doctype html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
        '<title>' + title + '</title>',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link href="https://fonts.googleapis.com/css2?family=Belleza&family=Nunito+Sans:wght@300;400&display=swap" rel="stylesheet">',
        '<style>',
        window.EMAIL_EXPORT_CSS,
        '</style>',
        '</head>',
        '<body>',
        cleanRoot,
        '</body>',
        '</html>'
    ].join('\n');
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
    elPreviewScroll = document.getElementById('preview-scroll');
    elDraftList = document.getElementById('draft-list');
    elDraftName = document.getElementById('draft-name-input');
    elDraftSubject = document.getElementById('draft-subject-input');
    elHeroUrl = document.getElementById('hero-url-input');
    elProductUrl = document.getElementById('product-url-input');
    elSaveIndicator = document.getElementById('save-indicator');
    elNewBtn = document.getElementById('new-draft-btn');
    elSaveBtn = document.getElementById('save-btn');
    elCopyBtn = document.getElementById('copy-btn');
    elViewportToggle = document.getElementById('viewport-toggle');

    injectEmailStyles();
    bootstrap();
    mountActive();
    renderSidebar();

    bindImageInputs();
    bindViewport();

    elPreview.addEventListener('input', markDirty);
    elDraftSubject.addEventListener('input', markDirty);

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

    elNewBtn.addEventListener('click', createDraft);
    elSaveBtn.addEventListener('click', () => saveActive('manual'));
    elCopyBtn.addEventListener('click', copyEmailHTML);

    startAutosave();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
