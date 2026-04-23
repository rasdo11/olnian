# Release notes

## 0.1.0 — Initial theme

- Editorial storefront ported from HTML/React prototype to Shopify Liquid.
- Home page sections: hero (editorial), stat strip, SKU row, how it works, batch story, proof, testing strip.
- Product page with variants (Starter/Refill), subscription toggle, gift banner.
- AJAX cart drawer with quantity steppers and selling-plan display.
- Collection, search, 404, password, gift card, blog, article templates.
- Customer account templates (login, register, account, order, addresses, reset/activate).
- Theme settings: colors (tangerine/flamingo/gold/mint/blush/espresso), brand name + tagline, ship-time badge.
- Fonts: GFS Didot (headings), Nunito Sans (body).
- En-US locale.

## Known limitations

- **Product variant picker — single-option only.** The PDP variant button picker
  in `sections/main-product.liquid` only renders the first product option
  (launch case: Starter / Refill). Multi-option products (e.g., Size + Color)
  will need the picker reworked. `window.__productVariants` already contains
  the full variant map, so JS-side selection logic is straightforward to add
  when needed.
- **Quiz not ported.** The original prototype had an interactive quiz modal;
  rebuild as a theme section with blocks when desired.
- **Gift-with-purchase is fulfillment-side** for v1 (physical drop-in). Swap to
  a Shopify automatic discount or gift app when ready.
