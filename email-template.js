// Email template registry for the ØLNIAN multi-draft email editor.
// v4: multi-template (promo + education), mobile-first CSS,
//     data-cta-primary markers for synced repeated CTAs.

window.DEFAULT_ACCENT = '#F2663A';

// Replace literal accent color in a CSS or HTML string with a chosen hex.
window.applyAccent = function (s, hex) {
    if (!hex) return s;
    return s.split(window.DEFAULT_ACCENT).join(hex);
};

// Walk the email root, updating every element that uses the brand accent.
window.applyAccentToDOM = function (root, hex) {
    if (!root || !hex) return;
    const colorTargets = root.querySelectorAll(
        '.ef-hero-kicker, .ef-eyebrow, .ef-stat-num, .ef-step-num, .ef-benefit-dot'
    );
    colorTargets.forEach(el => {
        if (el.classList.contains('ef-benefit-dot')) {
            el.style.backgroundColor = hex;
        } else {
            el.style.color = hex;
        }
    });
    root.querySelectorAll('.ef-promo').forEach(el => {
        el.setAttribute('bgcolor', hex);
        el.style.backgroundColor = hex;
    });
    root.querySelectorAll('.ef-btn').forEach(a => {
        const td = a.closest('td');
        if (td) {
            td.setAttribute('bgcolor', hex);
            td.style.backgroundColor = hex;
        }
    });
};

// Push every primary CTA in the DOM to a single label + URL pair.
window.syncPrimaryCTAToDOM = function (root, cta) {
    if (!root || !cta) return;
    root.querySelectorAll('[data-cta-primary="true"]').forEach(a => {
        if (cta.label) a.textContent = cta.label;
        if (cta.url) a.setAttribute('href', cta.url);
    });
};

// Read the first primary CTA label + url out of an HTML string (used to
// backfill draft.primaryCTA when loading legacy drafts).
window.readPrimaryCTAFromHTML = function (html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const a = tmp.querySelector('[data-cta-primary="true"]');
    if (!a) return null;
    return { label: a.textContent.trim(), url: a.getAttribute('href') || '' };
};

window.EMAIL_EXPORT_CSS = `
body, table, td, a {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    margin: 0;
    padding: 0;
}

table { border-collapse: collapse; }
img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; }

#email-root {
    max-width: 600px;
    margin: 0 auto;
    background: #FFFFFF;
    font-family: 'Nunito Sans', 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
}

.ef-wordmark { font-family: 'Belleza', Georgia, serif; font-size: 20px; letter-spacing: 0.14em; color: #2F2F2F; text-transform: uppercase; line-height: 1; }
.ef-wordmark-accent { color: inherit; }
.ef-tagline { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #6B6B6B; }

.ef-hero-wrap { background: #EAD2B7; }
.ef-hero-img { width: 100%; height: auto; display: block; }
.ef-hero-text { background: #FFFFFF; padding: 28px 22px 22px; }
.ef-hero-kicker { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #F2663A; margin: 0 0 12px; }
.ef-hero-headline { font-family: 'Belleza', Georgia, serif; font-size: 28px; font-weight: 400; line-height: 1.18; color: #2F2F2F; margin: 0; letter-spacing: 0.01em; }
.ef-hero-sub { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 16px; line-height: 1.6; color: #3A3A3A; margin: 14px 0 0; }

.ef-cta-wrap { padding: 0 22px 28px; background: #FFFFFF; border-bottom: 1px solid #BDBDBD; }

.ef-promo { background: #F2663A; }
.ef-promo-left { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 13px; color: #FFFFFF; margin: 0; line-height: 1.5; letter-spacing: 0.02em; }
.ef-promo-code-label { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: #FFFFFF; opacity: 0.8; margin: 0 0 4px; display: block; }
.ef-promo-code { font-family: 'Belleza', Georgia, serif; font-size: 22px; letter-spacing: 0.16em; color: #FFFFFF; text-transform: uppercase; border-bottom: 1px solid #FFFFFF; padding-bottom: 1px; display: inline-block; }

.ef-body { padding: 28px 22px; background: #FFFFFF; border-bottom: 1px solid #BDBDBD; }
.ef-eyebrow { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase; color: #F2663A; margin: 0 0 14px; }
.ef-h2 { font-family: 'Belleza', Georgia, serif; font-size: 24px; font-weight: 400; line-height: 1.22; color: #2F2F2F; margin: 0 0 16px; letter-spacing: 0.01em; }
.ef-p { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 16px; line-height: 1.65; color: #3A3A3A; margin: 0 0 14px; }
.ef-p:last-child { margin-bottom: 0; }

.ef-product { border-top: 1px solid #BDBDBD; border-bottom: 1px solid #BDBDBD; background: #FFFFFF; }
.ef-product-img { width: 100%; height: auto; display: block; }
.ef-product-info { padding: 22px 22px 26px; }
.ef-product-name { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 11px; letter-spacing: 0.38em; text-transform: uppercase; color: #2F2F2F; margin: 0 0 6px; }
.ef-product-desc { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #6B6B6B; margin: 0 0 16px; }
.ef-product-price { font-family: 'Belleza', Georgia, serif; font-size: 30px; color: #2F2F2F; margin: 0 0 5px; letter-spacing: 0.02em; }
.ef-product-sale { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 13px; color: #277A46; margin: 0 0 22px; letter-spacing: 0.02em; }

.ef-btn { font-family: 'Nunito Sans', sans-serif; font-weight: 400; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #FFFFFF; text-decoration: none; display: block; padding: 18px 0; }
.ef-btn-outline { font-family: 'Nunito Sans', sans-serif; font-weight: 400; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #2F2F2F; text-decoration: none; display: block; padding: 17px 0; }

.ef-stats { background: #EAD2B7; border-bottom: 1px solid #BDBDBD; }
.ef-stat-num { font-family: 'Belleza', Georgia, serif; font-size: 28px; color: #F2663A; margin: 0 0 4px; }
.ef-stat-label { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #6B6B6B; margin: 0; }

.ef-steps { background: #FFFFFF; padding: 26px 22px; border-bottom: 1px solid #BDBDBD; }
.ef-step-num { font-family: 'Nunito Sans', sans-serif; font-weight: 400; font-size: 10px; letter-spacing: 0.12em; color: #F2663A; }
.ef-step-title { font-family: 'Nunito Sans', sans-serif; font-weight: 400; font-size: 14px; letter-spacing: 0.05em; color: #2F2F2F; margin: 0 0 5px; }
.ef-step-body { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 14px; color: #3A3A3A; margin: 0; line-height: 1.6; }

.ef-benefits { background: #FFFFFF; padding: 8px 22px 26px; border-bottom: 1px solid #BDBDBD; }
.ef-benefit { padding: 16px 0; border-bottom: 1px solid #D6D6D6; }
.ef-benefit:last-child { border-bottom: none; }
.ef-benefit-dot { display: inline-block; width: 8px; height: 8px; background: #F2663A; border-radius: 50%; }
.ef-benefit-title { font-family: 'Nunito Sans', sans-serif; font-weight: 400; font-size: 14px; color: #2F2F2F; margin: 0 0 4px; letter-spacing: 0.04em; }
.ef-benefit-body { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 14px; color: #3A3A3A; margin: 0; line-height: 1.6; }

.ef-closing { padding: 32px 22px; text-align: center; background: #FFFFFF; border-bottom: 1px solid #BDBDBD; }
.ef-closing-h { font-family: 'Belleza', Georgia, serif; font-size: 24px; font-weight: 400; margin: 0 0 10px; line-height: 1.25; color: #2F2F2F; letter-spacing: 0.01em; }
.ef-closing-sub { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 13px; color: #6B6B6B; margin: 0 0 22px; letter-spacing: 0.04em; }

.ef-footer { background: #2F2F2F; padding: 28px 22px; text-align: center; }
.ef-footer-wordmark { font-family: 'Belleza', Georgia, serif; font-size: 18px; letter-spacing: 0.14em; color: #FFFFFF; margin: 0 0 5px; text-transform: uppercase; }
.ef-footer-wordmark .ef-wordmark-accent { color: inherit; }
.ef-footer-tagline { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.32); margin: 0 0 18px; }
.ef-disclaimer { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 11px; color: rgba(255,255,255,0.26); line-height: 1.6; margin: 0 0 14px; }
.ef-footer-links { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 11px; color: rgba(255,255,255,0.32); letter-spacing: 0.04em; margin: 0; line-height: 1.7; }
.ef-footer-links a { color: rgba(255,255,255,0.42); text-decoration: underline; }

@media only screen and (max-width: 480px) {
    .ef-promo-stack td { display: block !important; width: 100% !important; text-align: left !important; padding: 6px 22px !important; }
    .ef-promo-stack td:first-child { padding-top: 14px !important; }
    .ef-promo-stack td:last-child { padding-bottom: 14px !important; }
    .ef-hero-headline { font-size: 26px !important; }
    .ef-h2 { font-size: 22px !important; }
    .ef-closing-h { font-size: 22px !important; }
    .ef-product-price { font-size: 28px !important; }
}
`;

// ---------- Reusable building blocks ----------

const HEADER_HTML = `  <table class="ef-header" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <tr>
      <td align="left" valign="middle" style="padding:16px 22px;">
        <span class="ef-wordmark" style="font-family:'Belleza',Georgia,serif;font-size:20px;letter-spacing:0.14em;color:#2F2F2F;text-transform:uppercase;line-height:1;">ØL<span class="ef-wordmark-accent" style="color:inherit;">N</span>IAN</span>
      </td>
      <td align="right" valign="middle" style="padding:16px 22px;">
        <span class="ef-tagline" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#6B6B6B;">Clarity is Luxury</span>
      </td>
    </tr>
  </table>`;

const FOOTER_HTML = `  <div class="ef-footer" style="background:#2F2F2F;padding:28px 22px;text-align:center;">
    <p class="ef-footer-wordmark" style="font-family:'Belleza',Georgia,serif;font-size:18px;letter-spacing:0.14em;color:#FFFFFF;margin:0 0 5px;text-transform:uppercase;">ØL<span class="ef-wordmark-accent" style="color:inherit;">N</span>IAN</p>
    <p class="ef-footer-tagline" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.32);margin:0 0 18px;">Made in small batches. Tested in every one.</p>
    <p class="ef-disclaimer" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:11px;color:rgba(255,255,255,0.26);line-height:1.6;margin:0 0 14px;">These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
    <p class="ef-footer-links" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:11px;color:rgba(255,255,255,0.32);letter-spacing:0.04em;margin:0;line-height:1.7;">
      <a href="https://olnian.com" style="color:rgba(255,255,255,0.42);text-decoration:underline;">olnian.com</a> &nbsp;·&nbsp;
      <a href="#" style="color:rgba(255,255,255,0.42);text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp;
      <a href="#" style="color:rgba(255,255,255,0.42);text-decoration:underline;">Manage preferences</a>
    </p>
  </div>`;

function primaryCtaBlock(label, url) {
    return `  <div class="ef-cta-wrap" style="padding:0 22px 28px;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
      <tr>
        <td bgcolor="#F2663A" align="center" style="background-color:#F2663A;border-radius:1px;">
          <a class="ef-btn" data-cta-primary="true" href="${url}" style="display:block;padding:18px 0;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${label}</a>
        </td>
      </tr>
    </table>
  </div>`;
}

// ---------- Promo / Discount template ----------

const PROMO_CTA = { label: 'Shop now — use code MOM15', url: 'https://olnian.com/products/creatine' };

const PROMO_HTML = `<div id="email-root" data-v="4" data-template="promo" style="max-width:600px;margin:0 auto;background:#FFFFFF;font-family:'Nunito Sans','Helvetica Neue',Arial,sans-serif;">

${HEADER_HTML}

  <!-- HERO IMAGE -->
  <div class="ef-hero-wrap" id="hero-wrap" style="background:#EAD2B7;">
    <img class="ef-hero-img" id="hero-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/olnian-home3.png?v=1777952403" alt="ØLNIAN lifestyle" style="display:block;width:100%;height:auto;border:0;">
  </div>

  <!-- HERO TEXT -->
  <div class="ef-hero-text" style="background:#FFFFFF;padding:28px 22px 22px;">
    <p class="ef-hero-kicker" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#F2663A;margin:0 0 12px;">Limited offer</p>
    <h1 class="ef-hero-headline" style="font-family:'Belleza',Georgia,serif;font-size:28px;font-weight:400;line-height:1.18;color:#2F2F2F;margin:0;letter-spacing:0.01em;">The supplement doctors<br>wish they'd told you<br>about at 35.</h1>
    <p class="ef-hero-sub" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.6;color:#3A3A3A;margin:14px 0 0;">15% off this weekend with code MOM15.</p>
  </div>

  <!-- ABOVE-FOLD PRIMARY CTA -->
${primaryCtaBlock(PROMO_CTA.label, PROMO_CTA.url)}

  <!-- PROMO BAND -->
  <table class="ef-promo ef-promo-stack" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="#F2663A" style="background-color:#F2663A;">
    <tr>
      <td align="left" valign="middle" style="padding:14px 22px;">
        <p class="ef-promo-left" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:13px;color:#FFFFFF;margin:0;line-height:1.5;letter-spacing:0.02em;">Mother's Day weekend only.<br>Expires Sunday May 10 at midnight PT.</p>
      </td>
      <td align="right" valign="middle" style="padding:14px 22px;">
        <span class="ef-promo-code-label" style="display:block;font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;opacity:0.8;margin:0 0 4px;">Your code</span>
        <span class="ef-promo-code" style="display:inline-block;font-family:'Belleza',Georgia,serif;font-size:22px;letter-spacing:0.16em;color:#FFFFFF;text-transform:uppercase;border-bottom:1px solid #FFFFFF;padding-bottom:1px;">MOM15</span>
      </td>
    </tr>
  </table>

  <!-- BODY COPY -->
  <div class="ef-body" style="padding:28px 22px;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <p class="ef-eyebrow" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#F2663A;margin:0 0 14px;">The science</p>
    <h2 class="ef-h2" style="font-family:'Belleza',Georgia,serif;font-size:24px;font-weight:400;line-height:1.22;color:#2F2F2F;margin:0 0 16px;letter-spacing:0.01em;">After 35, your body makes less creatine. Most women don't know that.</h2>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0 0 14px;">Women naturally have lower creatine stores than men — and those levels shift further during perimenopause. The result shows up as the 3pm fog, slower recovery, the mental friction that wasn't there at 30.</p>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0;">ØLNIAN isn't a gym supplement repackaged for women. It was formulated specifically for cognitive support, muscle maintenance, and daily energy — for women 35 and older.</p>
  </div>

  <!-- PRODUCT -->
  <div class="ef-product" style="border-top:1px solid #BDBDBD;border-bottom:1px solid #BDBDBD;background:#FFFFFF;">
    <img class="ef-product-img" id="product-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/pdp-1-hero-white31.png?v=1777954914" alt="ØLNIAN Pure Creatine" style="display:block;width:100%;height:auto;border:0;">
    <div class="ef-product-info" style="padding:22px 22px 26px;">
      <p class="ef-product-name" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:11px;letter-spacing:0.38em;text-transform:uppercase;color:#2F2F2F;margin:0 0 6px;">Pure Creatine Monohydrate</p>
      <p class="ef-product-desc" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6B6B6B;margin:0 0 16px;">Brain · Body · Balance</p>
      <p class="ef-product-price" style="font-family:'Belleza',Georgia,serif;font-size:30px;color:#2F2F2F;margin:0 0 5px;letter-spacing:0.02em;">$54.99</p>
      <p class="ef-product-sale" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:13px;color:#277A46;margin:0 0 22px;letter-spacing:0.02em;">$46.74 with MOM15 — you save $8.25</p>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="margin:0 0 10px;">
        <tr>
          <td bgcolor="#F2663A" align="center" style="background-color:#F2663A;border-radius:1px;">
            <a class="ef-btn" data-cta-primary="true" href="${PROMO_CTA.url}" style="display:block;padding:18px 0;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${PROMO_CTA.label}</a>
          </td>
        </tr>
      </table>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td align="center" style="border:1px solid #BDBDBD;border-radius:1px;">
            <a class="ef-btn-outline" href="https://olnian.com/products/creatine" style="display:block;padding:17px 0;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#2F2F2F;text-decoration:none;">Learn more →</a>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- STATS -->
  <table class="ef-stats" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="#EAD2B7" style="background-color:#EAD2B7;border-bottom:1px solid #BDBDBD;">
    <tr>
      <td align="center" valign="top" width="33%" style="padding:20px 8px;border-right:1px solid rgba(189,189,189,0.35);">
        <p class="ef-stat-num" style="font-family:'Belleza',Georgia,serif;font-size:28px;color:#F2663A;margin:0 0 4px;">5g</p>
        <p class="ef-stat-label" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6B6B;margin:0;">Per serving</p>
      </td>
      <td align="center" valign="top" width="33%" style="padding:20px 8px;border-right:1px solid rgba(189,189,189,0.35);">
        <p class="ef-stat-num" style="font-family:'Belleza',Georgia,serif;font-size:28px;color:#F2663A;margin:0 0 4px;">100%</p>
        <p class="ef-stat-label" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6B6B;margin:0;">Batch tested</p>
      </td>
      <td align="center" valign="top" width="34%" style="padding:20px 8px;">
        <p class="ef-stat-num" style="font-family:'Belleza',Georgia,serif;font-size:28px;color:#F2663A;margin:0 0 4px;">0</p>
        <p class="ef-stat-label" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6B6B;margin:0;">Warehouse months</p>
      </td>
    </tr>
  </table>

  <!-- CLOSING -->
  <div class="ef-closing" style="padding:32px 22px;text-align:center;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <h2 class="ef-closing-h" style="font-family:'Belleza',Georgia,serif;font-size:24px;font-weight:400;margin:0 0 10px;line-height:1.25;color:#2F2F2F;letter-spacing:0.01em;">This Mother's Day,<br>clarity is the gift.</h2>
    <p class="ef-closing-sub" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:13px;color:#6B6B6B;margin:0 0 22px;letter-spacing:0.04em;">15% off with code MOM15 · Expires Sunday, May 10</p>
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto;">
      <tr>
        <td bgcolor="#F2663A" align="center" style="background-color:#F2663A;border-radius:1px;">
          <a class="ef-btn" data-cta-primary="true" href="${PROMO_CTA.url}" style="display:inline-block;padding:18px 32px;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${PROMO_CTA.label}</a>
        </td>
      </tr>
    </table>
  </div>

${FOOTER_HTML}

</div>`;

// ---------- Product Education template ----------

const EDU_CTA = { label: 'Read the science', url: 'https://olnian.com/products/creatine' };

const EDUCATION_HTML = `<div id="email-root" data-v="4" data-template="education" style="max-width:600px;margin:0 auto;background:#FFFFFF;font-family:'Nunito Sans','Helvetica Neue',Arial,sans-serif;">

${HEADER_HTML}

  <!-- HERO IMAGE -->
  <div class="ef-hero-wrap" id="hero-wrap" style="background:#EAD2B7;">
    <img class="ef-hero-img" id="hero-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/olnian-home3.png?v=1777952403" alt="ØLNIAN lifestyle" style="display:block;width:100%;height:auto;border:0;">
  </div>

  <!-- HERO TEXT -->
  <div class="ef-hero-text" style="background:#FFFFFF;padding:28px 22px 22px;">
    <p class="ef-hero-kicker" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#F2663A;margin:0 0 12px;">The science</p>
    <h1 class="ef-hero-headline" style="font-family:'Belleza',Georgia,serif;font-size:28px;font-weight:400;line-height:1.18;color:#2F2F2F;margin:0;letter-spacing:0.01em;">Creatine isn't a gym supplement.<br>It's brain fuel.</h1>
    <p class="ef-hero-sub" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.6;color:#3A3A3A;margin:14px 0 0;">Especially for women over 35, when natural creatine stores start to drop.</p>
  </div>

  <!-- ABOVE-FOLD PRIMARY CTA -->
${primaryCtaBlock(EDU_CTA.label, EDU_CTA.url)}

  <!-- BODY COPY -->
  <div class="ef-body" style="padding:28px 22px;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <p class="ef-eyebrow" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#F2663A;margin:0 0 14px;">Why it matters</p>
    <h2 class="ef-h2" style="font-family:'Belleza',Georgia,serif;font-size:24px;font-weight:400;line-height:1.22;color:#2F2F2F;margin:0 0 16px;letter-spacing:0.01em;">Your body makes less of it after 35.</h2>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0 0 14px;">Creatine isn't just stored in muscle — it powers cognition, recovery, and daily energy. After 35, especially through perimenopause, your body produces less of it.</p>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0;">ØLNIAN was formulated specifically for this. A clean, single-ingredient creatine monohydrate, dosed for cognitive support, muscle maintenance, and the mental clarity that disappears around 3pm.</p>
  </div>

  <!-- BENEFITS -->
  <div class="ef-benefits" style="background:#FFFFFF;padding:8px 22px 26px;border-bottom:1px solid #BDBDBD;">
    <p class="ef-eyebrow" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#F2663A;margin:18px 0 6px;">What you'll feel</p>
    <table class="ef-benefit" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="border-bottom:1px solid #D6D6D6;">
      <tr>
        <td valign="top" width="22" style="padding:16px 14px 16px 0;">
          <span class="ef-benefit-dot" style="display:inline-block;width:8px;height:8px;background:#F2663A;border-radius:50%;">&nbsp;</span>
        </td>
        <td valign="top" style="padding:16px 0;">
          <p class="ef-benefit-title" style="font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:14px;color:#2F2F2F;margin:0 0 4px;letter-spacing:0.04em;">Cognitive support</p>
          <p class="ef-benefit-body" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:14px;color:#3A3A3A;margin:0;line-height:1.6;">Studies show creatine improves working memory and reaction time — particularly under sleep deprivation.</p>
        </td>
      </tr>
    </table>
    <table class="ef-benefit" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="border-bottom:1px solid #D6D6D6;">
      <tr>
        <td valign="top" width="22" style="padding:16px 14px 16px 0;">
          <span class="ef-benefit-dot" style="display:inline-block;width:8px;height:8px;background:#F2663A;border-radius:50%;">&nbsp;</span>
        </td>
        <td valign="top" style="padding:16px 0;">
          <p class="ef-benefit-title" style="font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:14px;color:#2F2F2F;margin:0 0 4px;letter-spacing:0.04em;">Muscle maintenance</p>
          <p class="ef-benefit-body" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:14px;color:#3A3A3A;margin:0;line-height:1.6;">Helps preserve lean muscle through perimenopause and the years that follow.</p>
        </td>
      </tr>
    </table>
    <table class="ef-benefit" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
      <tr>
        <td valign="top" width="22" style="padding:16px 14px 16px 0;">
          <span class="ef-benefit-dot" style="display:inline-block;width:8px;height:8px;background:#F2663A;border-radius:50%;">&nbsp;</span>
        </td>
        <td valign="top" style="padding:16px 0;">
          <p class="ef-benefit-title" style="font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:14px;color:#2F2F2F;margin:0 0 4px;letter-spacing:0.04em;">Daily energy</p>
          <p class="ef-benefit-body" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:14px;color:#3A3A3A;margin:0;line-height:1.6;">Reduces mental fatigue. No stimulants. No crash.</p>
        </td>
      </tr>
    </table>
  </div>

  <!-- PRODUCT -->
  <div class="ef-product" style="border-top:1px solid #BDBDBD;border-bottom:1px solid #BDBDBD;background:#FFFFFF;">
    <img class="ef-product-img" id="product-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/pdp-1-hero-white31.png?v=1777954914" alt="ØLNIAN Pure Creatine" style="display:block;width:100%;height:auto;border:0;">
    <div class="ef-product-info" style="padding:22px 22px 26px;">
      <p class="ef-product-name" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:11px;letter-spacing:0.38em;text-transform:uppercase;color:#2F2F2F;margin:0 0 6px;">Pure Creatine Monohydrate</p>
      <p class="ef-product-desc" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6B6B6B;margin:0 0 16px;">Brain · Body · Balance</p>
      <p class="ef-product-price" style="font-family:'Belleza',Georgia,serif;font-size:30px;color:#2F2F2F;margin:0 0 22px;letter-spacing:0.02em;">$54.99</p>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td bgcolor="#F2663A" align="center" style="background-color:#F2663A;border-radius:1px;">
            <a class="ef-btn" data-cta-primary="true" href="${EDU_CTA.url}" style="display:block;padding:18px 0;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${EDU_CTA.label}</a>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- CLOSING -->
  <div class="ef-closing" style="padding:32px 22px;text-align:center;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <h2 class="ef-closing-h" style="font-family:'Belleza',Georgia,serif;font-size:24px;font-weight:400;margin:0 0 10px;line-height:1.25;color:#2F2F2F;letter-spacing:0.01em;">One ingredient.<br>Tested every batch.</h2>
    <p class="ef-closing-sub" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:13px;color:#6B6B6B;margin:0 0 22px;letter-spacing:0.04em;">Subscribe and save 15% — refills auto-shipped on your schedule.</p>
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto;">
      <tr>
        <td bgcolor="#F2663A" align="center" style="background-color:#F2663A;border-radius:1px;">
          <a class="ef-btn" data-cta-primary="true" href="${EDU_CTA.url}" style="display:inline-block;padding:18px 32px;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${EDU_CTA.label}</a>
        </td>
      </tr>
    </table>
  </div>

${FOOTER_HTML}

</div>`;

// ---------- Registry ----------

window.TEMPLATES = [
    {
        id: 'promo',
        label: 'Promo / Discount',
        shortLabel: 'PROMO',
        description: 'Time-limited offer with code, hero, product card and repeated CTA.',
        defaults: {
            previewText: '15% off this weekend — code MOM15 inside.',
            primaryCTA: { label: PROMO_CTA.label, url: PROMO_CTA.url }
        },
        html: PROMO_HTML
    },
    {
        id: 'education',
        label: 'Product Education',
        shortLabel: 'EDU',
        description: 'Science-led deep dive with benefit bullets and a single repeated CTA.',
        defaults: {
            previewText: 'Most people think creatine is for athletes. The science says otherwise.',
            primaryCTA: { label: EDU_CTA.label, url: EDU_CTA.url }
        },
        html: EDUCATION_HTML
    }
];

window.DEFAULT_TEMPLATE_ID = 'promo';

window.getTemplate = function (id) {
    return window.TEMPLATES.find(t => t.id === id) || window.TEMPLATES[0];
};

window.getBlankDraftHTML = function (id) {
    return window.getTemplate(id).html;
};
