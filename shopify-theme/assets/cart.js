/* cart.js — Shopify AJAX Cart API, drawer open/close, line rendering */

(function () {
  'use strict';

  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* ── DOM refs ── */
  const overlay   = document.getElementById('cart-overlay');
  const drawer    = document.getElementById('cart-drawer');
  const closeBtn  = document.getElementById('cart-close');
  const cartLines = document.getElementById('cart-lines');
  const cartEmpty = document.getElementById('cart-empty');
  const cartFooter= document.getElementById('cart-footer');
  const subtotalEl= document.getElementById('cart-subtotal');
  const shipDateEl= document.getElementById('cart-ship-date');
  const freeShipEl= document.getElementById('cart-free-ship');
  const countEl   = document.getElementById('cart-count');

  /* ── Open / close ── */
  function openCart() {
    drawer.removeAttribute('aria-hidden');
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-visible');
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('cart-toggle').setAttribute('aria-expanded', 'true');
    refreshCart();
  }

  function closeCart() {
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    const toggle = document.getElementById('cart-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (overlay) overlay.addEventListener('click', closeCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeCart();
  });

  /* ── Fetch cart ── */
  async function getCart() {
    const res = await fetch('/cart.js');
    return res.json();
  }

  /* ── Render cart ── */
  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function renderLines(items) {
    if (!cartLines) return;
    cartLines.innerHTML = items.map(item => `
      <div class="cart-line" data-key="${item.key}">
        <div class="cart-line__img">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" width="60" height="60" loading="lazy">` : ''}
        </div>
        <div class="cart-line__info">
          <p class="cart-line__name">${item.product_title}</p>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<p class="cart-line__sub">${item.variant_title}</p>` : ''}
          ${item.selling_plan_allocation ? `<p class="cart-line__sub cart-line__sub--sub">Subscribe · save 10%</p>` : ''}
        </div>
        <div class="cart-line__qty">
          <button class="qty-btn" data-action="decrease" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Increase quantity">+</button>
        </div>
        <p class="cart-line__price">${formatMoney(item.final_line_price)}</p>
      </div>
    `).join('');

    /* Qty buttons */
    cartLines.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.key;
        const current = parseInt(btn.dataset.qty, 10);
        const delta = btn.dataset.action === 'increase' ? 1 : -1;
        await changeItem(key, current + delta);
      });
    });
  }

  async function refreshCart() {
    const cart = await getCart();
    updateCount(cart.item_count);

    if (cart.item_count === 0) {
      cartEmpty && (cartEmpty.style.display = '');
      cartLines && (cartLines.style.display = 'none');
      cartFooter && (cartFooter.style.display = 'none');
    } else {
      cartEmpty && (cartEmpty.style.display = 'none');
      cartLines && (cartLines.style.display = '');
      cartFooter && (cartFooter.style.display = '');

      renderLines(cart.items);

      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

      /* Ship date */
      if (shipDateEl && window.OLNIAN && window.OLNIAN.shipDate) {
        const sd = window.OLNIAN.shipDate;
        shipDateEl.textContent = `${MONTHS_SHORT[sd.getMonth()]} ${sd.getDate()}`;
      }

      /* Free shipping indicator — show if any subscription items */
      const hasSub = cart.items.some(i => i.selling_plan_allocation);
      if (freeShipEl) freeShipEl.style.display = hasSub ? '' : 'none';
    }
  }

  function updateCount(n) {
    if (countEl) {
      countEl.textContent = n;
      countEl.classList.toggle('has-items', n > 0);
    }
  }

  /* ── Add to cart ── */
  async function addToCart(variantId, qty, sellingPlanId, properties) {
    const body = {
      id: variantId,
      quantity: qty || 1,
    };
    if (sellingPlanId) body.selling_plan = sellingPlanId;
    if (properties) body.properties = properties;

    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.description || 'Could not add to cart.');
      return null;
    }

    const item = await res.json();
    await refreshCart();
    openCart();
    return item;
  }

  /* ── Change quantity ── */
  async function changeItem(key, qty) {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id: key, quantity: qty }),
    });
    await refreshCart();
  }

  /* ── Product form intercept ── */
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const variantId = document.getElementById('variant-id')?.value;
      const sellingPlan = document.getElementById('selling-plan-id')?.value || null;
      const qty = parseInt(document.getElementById('add-qty')?.value || '1', 10);
      const quizVerdict = document.getElementById('quiz-verdict-input')?.value || null;

      const btn = document.getElementById('add-to-cart-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }

      const props = {};
      if (quizVerdict) props['Quiz result'] = quizVerdict;

      await addToCart(variantId, qty, sellingPlan || undefined, Object.keys(props).length ? props : undefined);

      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Reserve my place in Batch 01';
      }
    });
  }

  /* ── Initial count on page load ── */
  getCart().then(cart => updateCount(cart.item_count));

  /* ── Expose API ── */
  window.OLNIAN = window.OLNIAN || {};
  window.OLNIAN.openCart = openCart;
  window.OLNIAN.closeCart = closeCart;
  window.OLNIAN.addToCart = addToCart;
  window.OLNIAN.refreshCart = refreshCart;
})();
