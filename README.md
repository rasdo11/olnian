# olnian
Pure Supplements for Her

## Email editor AI setup

The multi-draft email editor uses a serverless proxy at `api/copy-suggest.js` for OpenAI copy suggestions.

Set these environment variables in your deploy target:

- `OPENAI_API_KEY` — required, kept server-side only.
- `OPENAI_MODEL` — optional, defaults to `gpt-5.4-mini`.

The browser stores drafts, brand memory, saved suggestions, chat history, and A/B variants in `localStorage`. Do not put an OpenAI API key in frontend code.
