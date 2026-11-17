// Vercel serverless function: AI completions for the study buddy, writing feedback,
// French conversations and past-paper marking.
// Set ONE of these in Vercel → Project → Settings → Environment Variables:
//   OPENAI_API_KEY     (uses OPENAI_MODEL, default "gpt-4o-mini")
//   ANTHROPIC_API_KEY  (uses ANTHROPIC_MODEL, default "claude-3-5-haiku-latest")
const SYSTEM = 'You are a friendly, encouraging tutor for Cambridge Lower Secondary Stage 8 students aged 12-13. Keep language simple, safe and age-appropriate. Never include personal data, links or unsafe content. When asked for JSON, return only valid JSON.';
const hits = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (h.length >= 20) return res.status(429).json({ error: 'Too many requests, please wait a minute.' });
  h.push(now); hits.set(ip, h);

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const messages = (body && Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && typeof m.content === 'string')
    .slice(-12)
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 6000) }));
  if (!messages.length) return res.status(400).json({ error: 'No messages' });

  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest', max_tokens: 1024, system: SYSTEM, messages }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ? j.error.message : 'Anthropic error');
      return res.status(200).json({ text: (j.content || []).map(c => c.text || '').join('') });
    }
    if (process.env.OPENAI_API_KEY) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.OPENAI_API_KEY },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', max_tokens: 1024, messages: [{ role: 'system', content: SYSTEM }, ...messages] }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ? j.error.message : 'OpenAI error');
      return res.status(200).json({ text: j.choices[0].message.content || '' });
    }
    return res.status(503).json({ error: 'No AI key configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY in Vercel settings.' });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
