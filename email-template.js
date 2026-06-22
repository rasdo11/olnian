// Email template registry for the ØLNIAN multi-draft email editor.
// v4: multi-template (promo + education), mobile-first CSS,
//     data-cta-primary markers for synced repeated CTAs.

window.DEFAULT_ACCENT = '#F2663A';
window.DEFAULT_IMAGE_LINK = 'https://olnian.com/products/creatine';

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

.ef-referral { padding: 22px 22px; text-align: center; background: #F6F1EA; border-bottom: 1px solid #BDBDBD; }
.ef-referral-text { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 12px; line-height: 1.7; color: #4A4A4A; margin: 0 auto; letter-spacing: 0.02em; max-width: 520px; }

.ef-footer { background: #2F2F2F; padding: 28px 22px; text-align: center; }
.ef-footer-wordmark { font-family: 'Belleza', Georgia, serif; font-size: 18px; letter-spacing: 0.14em; color: #FFFFFF; margin: 0 0 5px; text-transform: uppercase; }
.ef-footer-wordmark .ef-wordmark-accent { color: inherit; }
.ef-footer-tagline { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.32); margin: 0 0 18px; }
.ef-disclaimer { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 11px; color: rgba(255,255,255,0.26); line-height: 1.6; margin: 0 0 14px; }
.ef-footer-links { font-family: 'Nunito Sans', sans-serif; font-weight: 300; font-size: 11px; color: rgba(255,255,255,0.32); letter-spacing: 0.04em; margin: 0; line-height: 1.7; }
.ef-footer-links a { color: rgba(255,255,255,0.42); text-decoration: underline; }

.ef-img-link { display: block; text-decoration: none; }

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

window.REFERRAL_BLOCK_HTML = `  <div class="ef-referral" data-block="referral" style="padding:22px 22px;text-align:center;background:#F6F1EA;border-bottom:1px solid #BDBDBD;">
    <p class="ef-referral-text" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:12px;line-height:1.7;color:#4A4A4A;margin:0 auto;letter-spacing:0.02em;max-width:520px;">No need to unsubscribe. You will not receive another email from us. This was sent as a referral from an existing customer. ØLNIAN grows through its community. No social media. No Amazon. Just women sharing what they trust.</p>
  </div>
`;

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

const PROMO_HTML = `<div id="email-root" data-v="6" data-template="promo" style="max-width:600px;margin:0 auto;background:#FFFFFF;font-family:'Nunito Sans','Helvetica Neue',Arial,sans-serif;">

${HEADER_HTML}

  <!-- HERO IMAGE -->
  <div class="ef-hero-wrap" id="hero-wrap" style="background:#EAD2B7;">
    <a class="ef-img-link" data-img-link="true" href="${window.DEFAULT_IMAGE_LINK}" style="display:block;text-decoration:none;"><img class="ef-hero-img" id="hero-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/olnian-home3.png?v=1777952403" alt="ØLNIAN lifestyle" style="display:block;width:100%;height:auto;border:0;"></a>
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
  <table class="ef-promo ef-promo-stack" data-block="promo-band" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="#F2663A" style="background-color:#F2663A;">
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
    <a class="ef-img-link" data-img-link="true" href="${window.DEFAULT_IMAGE_LINK}" style="display:block;text-decoration:none;"><img class="ef-product-img" id="product-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/pdp-1-hero-white31.png?v=1777954914" alt="ØLNIAN Pure Creatine" style="display:block;width:100%;height:auto;border:0;"></a>
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
  <table class="ef-stats" data-block="stats" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="#EAD2B7" style="background-color:#EAD2B7;border-bottom:1px solid #BDBDBD;">
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

const EDU_CTA = { label: 'Start the daily ritual', url: 'https://olnian.com/products/creatine' };

const EDUCATION_HTML = `<div id="email-root" data-v="6" data-template="education" style="max-width:600px;margin:0 auto;background:#FFFFFF;font-family:'Nunito Sans','Helvetica Neue',Arial,sans-serif;">

${HEADER_HTML}

  <!-- HERO IMAGE -->
  <div class="ef-hero-wrap" id="hero-wrap" style="background:#EAD2B7;">
    <a class="ef-img-link" data-img-link="true" href="${window.DEFAULT_IMAGE_LINK}" style="display:block;text-decoration:none;"><img class="ef-hero-img" id="hero-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/olnian-home3.png?v=1777952403" alt="ØLNIAN lifestyle" style="display:block;width:100%;height:auto;border:0;"></a>
  </div>

  <!-- HERO TEXT -->
  <div class="ef-hero-text" style="background:#FFFFFF;padding:28px 22px 22px;">
    <p class="ef-hero-kicker" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#F2663A;margin:0 0 12px;">The inside-out shift</p>
    <h1 class="ef-hero-headline" style="font-family:'Belleza',Georgia,serif;font-size:28px;font-weight:400;line-height:1.18;color:#2F2F2F;margin:0;letter-spacing:0.01em;">Beauty is starting<br>to feel different.</h1>
    <p class="ef-hero-sub" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.6;color:#3A3A3A;margin:14px 0 0;">More women are refining what wellness means to them — and what it does for them.</p>
  </div>

  <!-- ABOVE-FOLD PRIMARY CTA -->
${primaryCtaBlock(EDU_CTA.label, EDU_CTA.url)}

  <!-- BODY COPY -->
  <div class="ef-body" style="padding:28px 22px;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <p class="ef-eyebrow" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#F2663A;margin:0 0 14px;">Why it matters</p>
    <h2 class="ef-h2" style="font-family:'Belleza',Georgia,serif;font-size:24px;font-weight:400;line-height:1.22;color:#2F2F2F;margin:0 0 16px;letter-spacing:0.01em;">Strength is part of beauty.</h2>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0 0 14px;">Beauty has always been about more than what is on the surface. As women refine their routines, they are paying more attention to what supports energy, strength, and clarity in everyday life.</p>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0;">That is where ØLNIAN Creatine fits. One clean ingredient. 5g a day. Built for women refining how they want to feel.</p>
  </div>

  <!-- BENEFITS -->
  <div class="ef-benefits" data-block="benefits" style="background:#FFFFFF;padding:8px 22px 26px;border-bottom:1px solid #BDBDBD;">
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
    <a class="ef-img-link" data-img-link="true" href="${window.DEFAULT_IMAGE_LINK}" style="display:block;text-decoration:none;"><img class="ef-product-img" id="product-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/pdp-1-hero-white31.png?v=1777954914" alt="ØLNIAN Pure Creatine" style="display:block;width:100%;height:auto;border:0;"></a>
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

// ---------- Skin Routine template ----------

const SKIN_CTA = { label: 'Shop Creatine', url: 'https://olnian.com/products/creatine' };

const SKIN_ROUTINE_HTML = `<div id="email-root" data-v="6" data-template="skin-routine" style="max-width:600px;margin:0 auto;background:#FFFFFF;font-family:'Nunito Sans','Helvetica Neue',Arial,sans-serif;">

${HEADER_HTML}

  <!-- HERO IMAGE -->
  <div class="ef-hero-wrap" id="hero-wrap" style="background:#EAD2B7;">
    <a class="ef-img-link" data-img-link="true" href="${window.DEFAULT_IMAGE_LINK}" style="display:block;text-decoration:none;"><img class="ef-hero-img" id="hero-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/creatine_graphic4.png?v=1781798838" alt="ØLNIAN Creatine for women" style="display:block;width:100%;height:auto;border:0;"></a>
  </div>

  <!-- HERO TEXT -->
  <div class="ef-hero-text" style="background:#FFFFFF;padding:28px 22px 22px;">
    <p class="ef-hero-kicker" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#F2663A;margin:0 0 12px;">What's missing</p>
    <h1 class="ef-hero-headline" style="font-family:'Belleza',Georgia,serif;font-size:28px;font-weight:400;line-height:1.18;color:#2F2F2F;margin:0;letter-spacing:0.01em;">Your skin routine<br>is missing one thing.</h1>
    <p class="ef-hero-sub" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.6;color:#3A3A3A;margin:14px 0 0;">Not another serum. Not a collagen powder. Something your body already makes — and starts running low on in your 30s.</p>
  </div>

  <!-- ABOVE-FOLD PRIMARY CTA -->
${primaryCtaBlock(SKIN_CTA.label, SKIN_CTA.url)}

  <!-- BODY COPY -->
  <div class="ef-body" style="padding:28px 22px;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <p class="ef-eyebrow" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#F2663A;margin:0 0 14px;">The one thing</p>
    <h2 class="ef-h2" style="font-family:'Belleza',Georgia,serif;font-size:24px;font-weight:400;line-height:1.22;color:#2F2F2F;margin:0 0 16px;letter-spacing:0.01em;">Creatine. 5g a day in water. That's it.</h2>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0 0 14px;">Women who take it notice clearer thinking, better sleep, more energy for movement, and skin that looks like it's getting enough rest. Because it is.</p>
    <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0;">Research shows women ages 35–70 see results in as little as 3 weeks. No loading phase. No complicated routine. Just one clean ingredient that belongs next to your moisturizer.</p>
  </div>

  <!-- PRODUCT -->
  <div class="ef-product" style="border-top:1px solid #BDBDBD;border-bottom:1px solid #BDBDBD;background:#FFFFFF;">
    <a class="ef-img-link" data-img-link="true" href="${window.DEFAULT_IMAGE_LINK}" style="display:block;text-decoration:none;"><img class="ef-product-img" id="product-img" src="https://cdn.shopify.com/s/files/1/0678/6239/6994/files/CNN_Creatine.jpg?v=1781977664" alt="Premium Creatine Monohydrate" style="display:block;width:100%;height:auto;border:0;"></a>
    <div class="ef-product-info" style="padding:22px 22px 26px;">
      <p class="ef-product-name" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:11px;letter-spacing:0.38em;text-transform:uppercase;color:#2F2F2F;margin:0 0 6px;">What is creatine?</p>
      <p class="ef-p" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:16px;line-height:1.65;color:#3A3A3A;margin:0 0 22px;">A natural compound your body produces — and uses for energy, brain function, and muscle recovery. After 35, production drops. A daily 5g dose brings it back.</p>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td bgcolor="#F2663A" align="center" style="background-color:#F2663A;border-radius:1px;">
            <a class="ef-btn" data-cta-primary="true" href="${SKIN_CTA.url}" style="display:block;padding:18px 0;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${SKIN_CTA.label}</a>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- TRUST BAND -->
  <table class="ef-promo ef-promo-stack" data-block="trust-band" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" bgcolor="#F2663A" style="background-color:#F2663A;">
    <tr>
      <td align="left" valign="middle" style="padding:18px 22px;">
        <p class="ef-promo-left" style="font-family:'Belleza',Georgia,serif;font-size:22px;color:#FFFFFF;margin:0;line-height:1.2;letter-spacing:0.01em;">Why you haven't<br>heard of us.</p>
      </td>
      <td align="right" valign="middle" style="padding:18px 22px;">
        <span class="ef-promo-code-label" style="display:block;font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;opacity:0.8;margin:0 0 6px;">★★★★★</span>
        <span class="ef-promo-left" style="display:block;font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:13px;color:#FFFFFF;line-height:1.5;letter-spacing:0.02em;">No Amazon. No influencers. Every bag is milled, tested, and weighed the week it ships.</span>
      </td>
    </tr>
  </table>

  <!-- CLOSING -->
  <div class="ef-closing" style="padding:32px 22px;text-align:center;background:#FFFFFF;border-bottom:1px solid #BDBDBD;">
    <h2 class="ef-closing-h" style="font-family:'Belleza',Georgia,serif;font-size:24px;font-weight:400;margin:0 0 10px;line-height:1.25;color:#2F2F2F;letter-spacing:0.01em;">One clean ingredient.<br>Belongs next to your moisturizer.</h2>
    <p class="ef-closing-sub" style="font-family:'Nunito Sans',sans-serif;font-weight:300;font-size:13px;color:#6B6B6B;margin:0 0 22px;letter-spacing:0.04em;">5g a day. Third-party tested. No fillers, no flavoring, no warehouse shelf time.</p>
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto;">
      <tr>
        <td bgcolor="#F2663A" align="center" style="background-color:#F2663A;border-radius:1px;">
          <a class="ef-btn" data-cta-primary="true" href="${SKIN_CTA.url}" style="display:inline-block;padding:18px 32px;font-family:'Nunito Sans',sans-serif;font-weight:400;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${SKIN_CTA.label}</a>
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
    },
    {
        id: 'skin-routine',
        label: 'Skin Routine',
        shortLabel: 'SKIN',
        description: 'Skincare-adjacent angle. Positions creatine as the missing step in a daily beauty routine.',
        defaults: {
            previewText: "It's not collagen. It's not retinol. And it works faster than both.",
            primaryCTA: { label: SKIN_CTA.label, url: SKIN_CTA.url }
        },
        html: SKIN_ROUTINE_HTML
    }
];

window.DEFAULT_TEMPLATE_ID = 'promo';

window.getTemplate = function (id) {
    return window.TEMPLATES.find(t => t.id === id) || window.TEMPLATES[0];
};

window.getBlankDraftHTML = function (id) {
    return window.getTemplate(id).html;
};

// ---------- Strategy presets ----------
// Each strategy is a copy overlay — same template structure, different voice.
// Source: positioning brief, beauty-first / inside-out-ritual angles.

window.STRATEGIES = [
    {
        id: 'beauty_ritual',
        name: 'Beauty Ritual',
        description: 'Inside-out beauty positioning. Recommended A in the first A/B test.',
        copy: {
            subject: 'Your beauty routine may be missing 5g',
            preheader: 'Creatine is simpler than it sounds, and it is not just for the gym.',
            heroKicker: 'Inside-out beauty',
            heroHeadline: 'Your beauty routine<br>may be missing 5g.',
            heroSub: 'Strength, energy, and feeling good belong in the ritual too.',
            bodyEyebrow: 'The 5g habit',
            bodyH2: 'Most beauty routines stop at your skin.',
            bodyP1: 'Most beauty routines focus on what you put on your skin. But how you feel in your body matters too. Strength. Energy. Movement. Confidence. The feeling that you are supporting yourself from the inside out.',
            bodyP2: 'That is why more women are starting to look at creatine differently. ØLNIAN Creatine keeps it simple — one active ingredient, mixed into water once a day. No caffeine. No flavor. No complicated routine. Just 5g a day.',
            ctaLabel: 'Start the 5g ritual'
        }
    },
    {
        id: 'beginner_education',
        name: 'Beginner Education',
        description: 'Softer "explain this to me" entry point. Recommended B in the first A/B test.',
        copy: {
            subject: 'Not sure what creatine is? Start here.',
            preheader: 'A simple explanation for women who care about beauty, strength, and feeling good.',
            heroKicker: 'Start here',
            heroHeadline: 'A simple explainer,<br>no gym talk.',
            heroSub: 'For women who care about beauty, strength, and feeling good.',
            bodyEyebrow: 'What it is',
            bodyH2: 'Not sure what creatine is? Here is the short version.',
            bodyP1: 'Creatine is a compound your body naturally uses to help support quick energy, especially in your muscles and brain. You also get small amounts from food. After 35, your body makes a little less of it.',
            bodyP2: 'ØLNIAN Creatine is one ingredient — pure creatine monohydrate — mixed into water once a day. No caffeine. No flavor. No complicated routine.',
            ctaLabel: 'Read the simple explainer'
        }
    },
    {
        id: 'inside_out',
        name: 'Inside-out Beauty',
        description: 'Aspirational ritual framing for women refining their wellness routine.',
        copy: {
            subject: 'The inside-out beauty ritual women are adding',
            preheader: 'One simple scoop, once a day, with no complicated routine.',
            heroKicker: 'The quiet ritual',
            heroHeadline: 'Beauty is starting<br>to feel different.',
            heroSub: 'Less surface. More substance.',
            bodyEyebrow: 'The shift',
            bodyH2: 'Wellness is getting quieter, and smarter.',
            bodyP1: 'It is not only about what you put on your skin. It is about how supported, energized, and clear you feel underneath. A quieter kind of beauty.',
            bodyP2: 'ØLNIAN Creatine is the quiet daily ritual women are adding to their wellness routine. 5g in water. Once a day. No flavor, no caffeine, no fuss.',
            ctaLabel: 'Add it to your ritual'
        }
    },
    {
        id: 'myth_busting',
        name: 'Myth-busting',
        description: 'Anti-gym framing. Removes the "creatine is for bodybuilders" objection.',
        copy: {
            subject: 'Creatine is not just for the gym',
            preheader: 'Women are starting to understand it differently.',
            heroKicker: 'Let us clear it up',
            heroHeadline: 'Creatine is not what<br>you have been told.',
            heroSub: 'It has been badly marketed to women for years.',
            bodyEyebrow: 'The real story',
            bodyH2: 'Not a stimulant. Not a diet pill. Not complicated.',
            bodyP1: 'For years, creatine has been packaged for bodybuilders. That packaging has confused women out of one of the most well-studied wellness ingredients available.',
            bodyP2: 'It is one ingredient. It supports energy, recovery, and clarity. ØLNIAN Creatine is the clean version of an ingredient women have always deserved access to — without the gym-bag styling.',
            ctaLabel: 'See the cleaner version'
        }
    },
    {
        id: 'skincare_bridge',
        name: 'Skincare Bridge',
        description: 'Positions creatine next to skincare on the shelf — clean ritual, not supplement aisle.',
        copy: {
            subject: 'The supplement that belongs next to your skincare',
            preheader: 'A simple daily ritual for beauty, strength, and balance.',
            heroKicker: 'On the shelf',
            heroHeadline: 'Belongs on the shelf<br>with your serums.',
            heroSub: 'Not buried in a gym bag.',
            bodyEyebrow: 'A cleaner shelf',
            bodyH2: 'Your inside-out routine deserves the same care as your skincare.',
            bodyP1: 'Your skincare cabinet has gotten thoughtful. Curated. Considered. Your inside-out routine can too.',
            bodyP2: 'ØLNIAN Creatine is one clean ingredient in water, once a day. Designed to live next to your skincare, not in the supplement aisle.',
            ctaLabel: 'Shop the clean ritual'
        }
    },
    {
        id: 'age_smart',
        name: 'Age-smart',
        description: 'Strength + beauty positioning without using the word "older". For women 35+.',
        copy: {
            subject: 'Strength is part of beauty',
            preheader: 'Looking good is one thing. Feeling strong is another.',
            heroKicker: 'The quiet shift',
            heroHeadline: 'Strength is part<br>of beauty.',
            heroSub: 'The quiet shift in women’s wellness.',
            bodyEyebrow: 'Refining the routine',
            bodyH2: 'Beauty, energy, and strength belong together.',
            bodyP1: 'Beauty has always been about more than what is on the surface. As women refine their routines, they are paying more attention to what supports energy, strength, and clarity in everyday life.',
            bodyP2: 'That is where ØLNIAN Creatine fits. One clean ingredient. 5g a day. Built for women refining how they want to feel.',
            ctaLabel: 'Refine the routine'
        }
    }
];

window.getStrategy = function (id) {
    return window.STRATEGIES.find(s => s.id === id) || null;
};

// Apply a strategy's copy values to a live #email-root subtree. Idempotent.
window.applyStrategyToDOM = function (root, strategy) {
    if (!root || !strategy) return;
    const c = strategy.copy || {};
    const set = (sel, val, useHTML) => {
        const el = root.querySelector(sel);
        if (!el || val == null) return;
        if (useHTML) el.innerHTML = val;
        else el.textContent = val;
    };
    set('.ef-hero-kicker', c.heroKicker);
    set('.ef-hero-headline', c.heroHeadline, true);
    set('.ef-hero-sub', c.heroSub);

    const body = root.querySelector('.ef-body');
    if (body) {
        const eyebrow = body.querySelector('.ef-eyebrow');
        if (eyebrow && c.bodyEyebrow != null) eyebrow.textContent = c.bodyEyebrow;
        const h2 = body.querySelector('.ef-h2');
        if (h2 && c.bodyH2 != null) h2.textContent = c.bodyH2;
        const ps = body.querySelectorAll('.ef-p');
        if (ps[0] && c.bodyP1 != null) ps[0].textContent = c.bodyP1;
        if (ps[1] && c.bodyP2 != null) ps[1].textContent = c.bodyP2;
    }

    if (c.ctaLabel != null) {
        const cta = { label: c.ctaLabel, url: c.ctaUrl };
        window.syncPrimaryCTAToDOM(root, cta);
    }
};

// Returns mutated HTML for a draft seeded from a template + strategy.
window.buildStrategyHTML = function (templateId, strategyId) {
    const t = window.getTemplate(templateId);
    const s = window.getStrategy(strategyId);
    if (!s) return t.html;
    const wrap = document.createElement('div');
    wrap.innerHTML = t.html;
    const root = wrap.querySelector('#email-root');
    if (root) window.applyStrategyToDOM(root, s);
    return wrap.innerHTML;
};

// ---------- A/B test starters ----------

window.AB_STARTERS = [
    {
        id: 'test1',
        name: 'Beauty Ritual vs Beginner Education',
        description: 'Recommended first test. Aspiration vs softer entry point.',
        templateId: 'education',
        variantA: 'beauty_ritual',
        variantB: 'beginner_education'
    },
    {
        id: 'test2',
        name: 'Inside-out Beauty vs Anti-gym',
        description: 'Aspiration vs objection removal.',
        templateId: 'education',
        variantA: 'inside_out',
        variantB: 'myth_busting'
    },
    {
        id: 'test3',
        name: 'Skincare Bridge vs Misconception',
        description: 'More aggressive frame. Run after the first test resolves.',
        templateId: 'education',
        variantA: 'skincare_bridge',
        variantB: 'myth_busting'
    }
];

window.getABStarter = function (id) {
    return window.AB_STARTERS.find(t => t.id === id) || null;
};
