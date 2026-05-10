const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';

const SYSTEM_PROMPT = `
You are the Olnian email copy coach. Help designers iterate sales email copy.
Write for women 35+ with an elegant, premium, science-literate voice.
Avoid medical promises, disease-treatment claims, fear-based claims, and overhype.
Return only valid JSON matching this shape:
{
  "reply": "short coaching response",
  "suggestions": [
    {
      "target": "subject|preheader|hero|body|cta|promo|closing|selected copy",
      "subject": "optional subject line",
      "preheader": "optional preheader",
      "copy": "suggested copy",
      "rationale": "why this may perform"
    }
  ],
  "variants": [
    {
      "label": "Variant A",
      "angle": "sales angle",
      "subject": "subject line",
      "preheader": "preheader text",
      "heroHeadline": "hero headline",
      "bodyCopy": "short body copy or direction",
      "cta": "CTA copy",
      "rationale": "why this A/B angle is useful"
    }
  ],
  "brandMemoryUpdates": []
}
`;

module.exports = async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const payload = buildPrompt(body);

        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                input: [
                    { role: 'system', content: SYSTEM_PROMPT.trim() },
                    { role: 'user', content: payload }
                ],
                text: {
                    format: {
                        type: 'json_schema',
                        name: 'copy_coach_response',
                        strict: true,
                        schema: responseSchema()
                    }
                }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error && data.error.message ? data.error.message : 'OpenAI request failed.'
            });
        }

        const parsed = parseResponseText(data);
        return res.status(200).json(parsed);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Copy suggestion failed.' });
    }
};

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function buildPrompt(body) {
    return JSON.stringify({
        task: body.action || 'chat',
        designerMessage: body.message || '',
        brandMemory: body.brandMemory || '',
        activeDraft: body.draft || {},
        priorSuggestions: Array.isArray(body.priorSuggestions) ? body.priorSuggestions.slice(-8) : [],
        recentChat: Array.isArray(body.chat) ? body.chat.slice(-8) : [],
        instructions: [
            'Be concise and practical.',
            'Give copy the designer can paste directly.',
            'If the task is subject testing, include subject and preheader pairs.',
            'If the task is A/B testing, create distinct angles, not tiny wording changes.',
            'When rewriting selected copy, preserve factual claims and Olnian brand restraint.'
        ]
    }, null, 2);
}

function responseSchema() {
    return {
        type: 'object',
        additionalProperties: false,
        properties: {
            reply: { type: 'string' },
            suggestions: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        target: { type: 'string' },
                        subject: { type: 'string' },
                        preheader: { type: 'string' },
                        copy: { type: 'string' },
                        rationale: { type: 'string' }
                    },
                    required: ['target', 'subject', 'preheader', 'copy', 'rationale']
                }
            },
            variants: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        label: { type: 'string' },
                        angle: { type: 'string' },
                        subject: { type: 'string' },
                        preheader: { type: 'string' },
                        heroHeadline: { type: 'string' },
                        bodyCopy: { type: 'string' },
                        cta: { type: 'string' },
                        rationale: { type: 'string' }
                    },
                    required: ['label', 'angle', 'subject', 'preheader', 'heroHeadline', 'bodyCopy', 'cta', 'rationale']
                }
            },
            brandMemoryUpdates: {
                type: 'array',
                items: { type: 'string' }
            }
        },
        required: ['reply', 'suggestions', 'variants', 'brandMemoryUpdates']
    };
}

function parseResponseText(data) {
    const text = data.output_text || collectOutputText(data);
    if (!text) throw new Error('OpenAI response did not include text.');
    const parsed = JSON.parse(text);
    return {
        reply: parsed.reply || '',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        variants: Array.isArray(parsed.variants) ? parsed.variants : [],
        brandMemoryUpdates: Array.isArray(parsed.brandMemoryUpdates) ? parsed.brandMemoryUpdates : []
    };
}

function collectOutputText(data) {
    const chunks = [];
    if (!Array.isArray(data.output)) return '';
    data.output.forEach(item => {
        if (!Array.isArray(item.content)) return;
        item.content.forEach(part => {
            if (typeof part.text === 'string') chunks.push(part.text);
        });
    });
    return chunks.join('');
}
