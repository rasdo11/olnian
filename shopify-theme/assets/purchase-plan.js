/* purchase-plan.js — plan selector on product page */

(function () {
  'use strict';

  const plans = document.querySelectorAll('.purchase-plan');
  const variantInput   = document.getElementById('variant-id');
  const sellingPlanInput = document.getElementById('selling-plan-id');
  const qtyInput       = document.getElementById('add-qty');
  const ctaPrice       = document.getElementById('cta-price');
  const ctaBtn         = document.getElementById('add-to-cart-btn');

  if (!plans.length) return;

  /* Read Shopify selling plan IDs injected by the product template.
     The theme owner sets these in Shopify admin after creating selling plans.
     Fallback to empty string (one-time) if not configured. */
  const MONTHLY_SELLING_PLAN   = document.getElementById('monthly-selling-plan-id')?.value   || '';
  const QUARTERLY_SELLING_PLAN = document.getElementById('quarterly-selling-plan-id')?.value || '';

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function selectPlan(planEl) {
    plans.forEach(p => p.classList.remove('purchase-plan--selected'));
    planEl.classList.add('purchase-plan--selected');

    const value = planEl.querySelector('input[name="purchase-plan"]').value;
    const priceEl = planEl.querySelector('.purchase-plan__price');
    const priceCents = priceEl ? parseInt(priceEl.dataset.price, 10) : 0;

    /* Update CTA price display */
    if (ctaPrice && priceCents) ctaPrice.textContent = formatMoney(priceCents);

    /* Update selling plan & qty */
    if (value === 'onetime') {
      if (sellingPlanInput) sellingPlanInput.value = '';
      if (qtyInput) qtyInput.value = '1';
    } else if (value === 'monthly') {
      if (sellingPlanInput) sellingPlanInput.value = MONTHLY_SELLING_PLAN;
      if (qtyInput) qtyInput.value = '1';
    } else if (value === 'quarterly') {
      if (sellingPlanInput) sellingPlanInput.value = QUARTERLY_SELLING_PLAN;
      if (qtyInput) qtyInput.value = '3';
    }

    /* Update CTA text */
    if (ctaBtn) {
      if (value === 'onetime') {
        ctaBtn.textContent = 'Reserve my place in Batch 01';
      } else {
        ctaBtn.textContent = 'Subscribe & reserve →';
      }
    }
  }

  plans.forEach(planEl => {
    planEl.addEventListener('click', () => selectPlan(planEl));
    const radio = planEl.querySelector('input[type="radio"]');
    if (radio && radio.checked) selectPlan(planEl);
  });
})();
