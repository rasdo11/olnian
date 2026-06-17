// Shopify Files API proxy. Lists files from the brand's Shopify admin so the
// editor's photo drawer can show drag-droppable thumbnails. Requires an Admin
// API access token with `read_files` scope.

const SHOPIFY_API_VERSION = '2024-01';

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (!domain || !token) {
        return res.status(500).json({
            error: 'Shopify credentials are not configured.',
            code: 'NO_SHOPIFY',
            help: 'Add SHOPIFY_STORE_DOMAIN (e.g. olnian.myshopify.com) and SHOPIFY_ADMIN_API_TOKEN to your Vercel env vars and redeploy. Generate the token in Shopify Admin under Settings → Apps and sales channels → Develop apps → create a custom app with the read_files scope.'
        });
    }

    const url = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/files.json?limit=100`;
    try {
        const response = await fetch(url, {
            headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({ error: 'Shopify request failed: ' + response.status, detail: text.slice(0, 400) });
        }
        const data = await response.json();
        const raw = Array.isArray(data.files) ? data.files : [];
        const files = raw
            .filter(f => f && (f.url || (f.preview && f.preview.image && f.preview.image.url)))
            .map(f => {
                const previewUrl = f.preview && f.preview.image && f.preview.image.url;
                const url = f.url || previewUrl;
                const width = (f.preview && f.preview.image && f.preview.image.width) || f.width || null;
                const height = (f.preview && f.preview.image && f.preview.image.height) || f.height || null;
                const filename = url ? url.split('/').pop().split('?')[0] : '';
                return {
                    id: String(f.id || ''),
                    url,
                    alt: f.alt || '',
                    filename,
                    width,
                    height,
                    createdAt: f.created_at || null
                };
            })
            .filter(f => f.url);

        return res.status(200).json({ files });
    } catch (e) {
        return res.status(500).json({ error: e.message || 'Failed to reach Shopify.' });
    }
};
