// Shopify Files API proxy. Optional: if SHOPIFY_STORE_DOMAIN and
// SHOPIFY_ADMIN_API_TOKEN are set in the env, the photo drawer pulls the
// brand's Files library and merges it with the local library. If either var
// is missing, returns a structured "not configured" response so the
// frontend can silently skip without surfacing an error.

const SHOPIFY_API_VERSION = '2024-01';

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (!domain || !token) {
        return res.status(200).json({ files: [], code: 'NOT_CONFIGURED' });
    }

    const url = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/files.json?limit=100`;
    try {
        const response = await fetch(url, {
            headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({
                error: 'Shopify request failed: ' + response.status,
                detail: text.slice(0, 400),
                code: response.status === 401 ? 'AUTH' : 'UPSTREAM'
            });
        }
        const data = await response.json();
        const raw = Array.isArray(data.files) ? data.files : [];
        const files = raw
            .filter(f => f && (f.url || (f.preview && f.preview.image && f.preview.image.url)))
            .map(f => {
                const previewUrl = f.preview && f.preview.image && f.preview.image.url;
                const fileUrl = f.url || previewUrl;
                const filename = fileUrl ? fileUrl.split('/').pop().split('?')[0] : '';
                return {
                    id: 'shop_' + String(f.id || filename),
                    url: fileUrl,
                    alt: f.alt || '',
                    filename: filename,
                    createdAt: f.created_at || null
                };
            })
            .filter(f => f.url);

        return res.status(200).json({ files });
    } catch (e) {
        return res.status(500).json({ error: e.message || 'Failed to reach Shopify.', code: 'NETWORK' });
    }
};
