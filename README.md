# Olnian — Shopify theme

Pure supplements for her. Editorial theme, ships-in-batches positioning.

## Install (zip upload)

1. In this repo root, run `zip -r olnian-theme.zip . -x "*.git*" -x "index.html" -x "*.DS_Store"` to package the theme.
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip**.
3. Select `olnian-theme.zip`.
4. Once uploaded, click **Customize** to preview. Don't publish yet.

## Dev loop (optional, faster than zip uploads)

Install Shopify CLI: `npm install -g @shopify/cli @shopify/theme`

```
shopify theme dev --store=your-store.myshopify.com
```

Pushes changes in real time to a development theme on your store.

## Shopify admin setup checklist

Do these in admin before or during launch. The theme expects them.

### Products

Create three products, each with variants:

| Product | Variant 1 (Starter) | Variant 2 (Refill) |
|---|---|---|
| Creatine | SKU `OLN-CRE-30`, $42 | SKU `OLN-CRE-30-R`, (your refill price) |
| Magnesium | SKU `OLN-MAG-90`, $38 | SKU `OLN-MAG-90-R`, (your refill price) |
| Bundle | SKU `OLN-BUN-01`, $72 | (no refill variant) |

Add a product image to each. Add a product description. Add all three products to a collection named **"Shop"** (handle: `shop`) — the home page SKU row reads from this collection by default.

### Optional product metafields

For richer PDP content, create these metafields (admin → Settings → Custom data → Products):

- `custom.subtitle` (single-line text) — e.g., "Pure Creatine Monohydrate"
- `custom.eyebrow` (single-line text) — e.g., "30 servings · 30-day supply"
- `custom.ingredients` (list of JSON) — `[{ "name": "Creatine Monohydrate", "amount": "3–5 g" }]`

The theme reads these but works fine without them.

### Subscriptions

1. Install the **Shopify Subscriptions** app (free, first-party).
2. Create a selling plan group:
   - Discount: **15% off**
   - Delivery frequency: monthly
   - Minimum cycles: **1** (customer can cancel anytime)
   - Attach to Creatine + Magnesium refill variants (or whichever variants should be subscribable)
3. The product page will auto-detect selling plans and show the "Subscribe and save" option.

### Payments (charge-at-checkout)

Settings → Payments → Shopify Payments → **Automatic payment capture** (default).

We charge immediately at checkout and refund if a batch can't ship. Copy for the refund policy is in `REFUND_POLICY.md`.

### Shipping

Settings → Shipping and delivery → US only to start.

### Taxes

Settings → Taxes and duties → US regions.

### Notifications

Settings → Notifications → review and tweak the Order Confirmation and Shipping Confirmation templates. Add a line about the 2–4 week batch lead time to the Order Confirmation.

### Policies

Settings → Policies → paste in the contents of `REFUND_POLICY.md`. Also generate Privacy, Terms, and Shipping policies (Shopify has generators at the bottom of that page).

### Free gift (gold measuring spoon)

For launch, this is a fulfillment-side drop-in: your warehouse adds a spoon to every first subscription order. No theme or app changes needed.

When you're ready to surface it in the UI:
- Settings → Discounts → create a **Buy X Get Y** automatic discount. Condition: "first order" + "subscription". Gets: the spoon SKU free.
- Or install a gift-with-purchase app (BOGOS, Gift Box).

The PDP already shows a gift banner when the "Subscribe and save" option is selected — text is editable in the theme editor under Product → Main.

## Theme settings

In the theme editor:

- **Colors** — tangerine, flamingo, gold, mint, blush, espresso
- **Brand** — name, tagline, favicon
- **Shipping badge** — toggle and edit the "Ships in 2–4 weeks" text

## Typography

Headings: GFS Didot (Google Fonts, free)
Body: Nunito Sans (Google Fonts, free)

To swap to a licensed Didot LP face: host the woff2 files in `assets/`, add `@font-face` to `assets/theme.css`, and update `--display-font` in `assets/theme.css` and `layout/theme.liquid`.

## Structure

```
layout/theme.liquid
templates/
  index.json               ← home page composition
  product.json             ← product page composition
  collection.json          ← collection page
  cart.liquid, 404.liquid, page.liquid, search.liquid, password.liquid, gift_card.liquid
  blog.liquid, article.liquid
  list-collections.liquid
  customers/*.liquid       ← login, register, account, order, addresses, reset/activate
sections/
  header.liquid, footer.liquid
  header-group.json, footer-group.json
  hero-editorial.liquid, stat-strip.liquid, sku-row.liquid,
  how-it-works.liquid, proof.liquid, batch-story.liquid, testing-strip.liquid
  main-product.liquid, main-collection.liquid
snippets/
  cart-drawer.liquid, product-card.liquid
config/
  settings_schema.json, settings_data.json
locales/
  en.default.json
assets/
  theme.css, theme.js, creatine-hero.png, olnian-products.jpg
```

## Known limitations / to-do after launch

- Gift-with-purchase is fulfillment-side for v1. Upgrade to an app or automatic discount when you have time.
- Quiz from the original prototype is not ported yet. Can be rebuilt as a theme section with blocks for each question.
- Only English locale. Add others under `locales/` when needed.
