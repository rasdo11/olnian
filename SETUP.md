# Olnian — Launch Setup Checklist

Complete these steps in order before going live. Steps 1–7 are one-time. Step 8 repeats each batch.

---

## Part 1: Shopify Setup

### Step 1 — Create your Shopify account
1. Go to shopify.com → Start free trial
2. Choose the **Basic** plan ($39/mo) — all features you need are on this tier
3. Store name: `olnian` (or your preferred handle — this affects your `.myshopify.com` URL)

### Step 2 — Connect your domain
1. Shopify admin → **Settings → Domains**
2. Click **Connect existing domain**
3. Enter your domain (e.g. `olnian.com`)
4. Follow DNS instructions (add CNAME + A records at your registrar)
5. SSL activates automatically within a few hours

### Step 3 — Enable manual payment capture (batch billing)
1. Shopify admin → **Settings → Payments**
2. Scroll to **Payment capture**
3. Select **"Manually capture payment for orders"**
4. Save

This is how the deferred billing model works: customer's card is authorized at checkout, and you capture payment manually from the admin when you fulfill each batch.

### Step 4 — Create your products

Create 3 products with these exact details:

| Product | SKU | Price | Description |
|---------|-----|-------|-------------|
| Creatine | `OLN-CRE-30` | $42.00 | Pure creatine monohydrate. 30 servings. For women 37 and up. |
| Magnesium | `OLN-MAG-90` | $38.00 | Magnesium glycinate. 90 capsules. For sleep, calm, and recovery. |
| The Bundle | `OLN-BUN-01` | $72.00 | Creatine + Magnesium. Both formulas. |

For each product:
- Add images from `shopify-theme/assets/` (`creatine-hero.png`, `olnian-products.jpg`)
- Set the product handle to match: `creatine`, `magnesium`, `bundle`
- Under **Metafields**, add:
  - `custom.subtitle` (text): e.g. "Pure Creatine Monohydrate"
  - `custom.accent_color` (text): `var(--tangerine)` / `var(--mint)` / `var(--gold)`
  - `custom.count` (text): e.g. "30 servings"

### Step 5 — Create a collection
1. Shopify admin → **Products → Collections → Create collection**
2. Title: "All Products"
3. Handle: `all` (Shopify usually sets this automatically)
4. Add all 3 products

### Step 6 — Upload the theme

Install Shopify CLI first:
```bash
npm install -g @shopify/cli @shopify/theme
```

Then push the theme:
```bash
cd shopify-theme/
shopify theme push --store=YOUR-STORE.myshopify.com
```

After uploading:
1. Shopify admin → **Online Store → Themes**
2. Find "Olnian" in theme list → click **Publish**

---

## Part 2: MailerLite Setup

### Step 7 — Connect MailerLite

**Create your MailerLite account:**
1. Go to mailerlite.com → Create account (free up to 1,000 subscribers)
2. Complete account verification

**Connect to Shopify:**
1. Shopify admin → **Apps → App Store**
2. Search "MailerLite" → Install the official MailerLite app
3. Follow the connection wizard — this syncs customers automatically

**Get your account ID:**
1. MailerLite dashboard → **Account → Integrations → JavaScript tracking**
2. Copy your account ID (looks like: `123456`)

**Add it to your theme:**
1. Open `shopify-theme/layout/theme.liquid`
2. Find: `ml('account', 'YOUR_MAILERLITE_ACCOUNT_ID');`
3. Replace `YOUR_MAILERLITE_ACCOUNT_ID` with your actual ID
4. Re-push the theme: `shopify theme push --store=YOUR-STORE.myshopify.com`

### Step 8 — Schedule the 7 launch emails

For each email in the `emails/` folder:
1. MailerLite → **Campaigns → Create campaign → Regular**
2. Subject line: (see table below)
3. Content → **Custom HTML** → paste the contents of the file
4. Before sending: replace `[DATE]` placeholders with your actual batch close date
5. Schedule for the correct day

| File | Day | Subject line |
|------|-----|-------------|
| `day-1-launch.html` | Launch day | Batch 01 is live. |
| `day-2-education.html` | Day 2 | Why women over 37 are running low on this. |
| `day-3-formula.html` | Day 3 | 3–5g. Tested. Made in the USA. |
| `day-4-model.html` | Day 4 | You're assigned a batch. Not a subscription. |
| `day-5-quiz.html` | Day 5 | 30 seconds. Honest answer. |
| `day-6-proof.html` | Day 6 | Three women. One batch. |
| `day-7-close.html` | Day 7 | Batch 01 closes [DATE]. |

---

## Part 3: Subscriptions (optional for launch)

To enable the monthly/quarterly subscribe options, you need Shopify Selling Plans:

1. Shopify admin → **Products → Subscriptions** (requires a subscription app)
2. Install **Seal Subscriptions** or **Recharge** from the App Store (both have free tiers)
3. Create two selling plans:
   - Monthly: 10% discount, every 1 month
   - Quarterly: 15% discount, every 3 months
4. Attach both plans to your 3 products
5. In `shopify-theme/templates/product.liquid`, add hidden inputs for the selling plan IDs:
   ```html
   <input type="hidden" id="monthly-selling-plan-id" value="YOUR_MONTHLY_PLAN_ID">
   <input type="hidden" id="quarterly-selling-plan-id" value="YOUR_QUARTERLY_PLAN_ID">
   ```
6. Find the selling plan IDs in your subscription app's settings

---

## Part 4: Fulfillment — How to ship a batch

1. Shopify admin → **Orders**
2. Filter by "Payment authorized" (these are your pending batch orders)
3. When ready to ship:
   - Pack the batch
   - For each order: click order → **Fulfill items** → enter tracking → **Capture payment**
   - Payment is captured at the moment you fulfill

---

## Verification checklist

Before going live, test each of these:

- [ ] Homepage loads with all sections (hero, stats, products, proof, how it works)
- [ ] Product page loads with plan selector
- [ ] Add to cart → cart drawer opens with correct product and price
- [ ] "Reserve my batch" button → redirects to Shopify checkout
- [ ] Place a **test order** (use Shopify's Bogus Gateway in Settings → Payments → Test mode)
- [ ] Test order appears in admin as "Payment authorized" (not captured)
- [ ] Manually capture payment from admin → order shows as "Paid"
- [ ] Quiz opens → 4 questions → result screen shows correct verdict
- [ ] Subscribe banner appears when you scroll past the hero
- [ ] All 7 email templates render correctly in browser
- [ ] MailerLite: import Day 1 email → send test → confirm in Gmail and Apple Mail
- [ ] MailerLite Shopify app: place test order → confirm subscriber appears in MailerLite

---

## Domain & DNS quick reference

If your domain is at Namecheap/GoDaddy/Squarespace, add these DNS records:

| Type | Host | Value |
|------|------|-------|
| A | @ | 23.227.38.65 |
| CNAME | www | shops.myshopify.com |

Allow 24–48 hours for DNS propagation. Shopify SSL activates automatically after propagation.
