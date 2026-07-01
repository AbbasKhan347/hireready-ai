// deepseek new code

// ============================================================
//  generate.js  –  AI Cover Letter API (Groq / OpenAI compatible)
//  Endpoint: /api/generate
//  Method: POST
//  Payload: { prompt: string }
//  Response: { result: string }
// ============================================================

export default async function handler(req, res) {
  // ─── 1. CORS Headers ──────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── 2. Validate Input ──────────────────────────────────────
  const { prompt, max_tokens } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
  }

  // Let the frontend request more tokens for longer content (like full
  // resumes), but always clamp it server-side so nobody can abuse it.
  const requestedTokens = parseInt(max_tokens);
  const safeRequestedTokens = Number.isFinite(requestedTokens)
    ? Math.min(Math.max(requestedTokens, 256), 3000)
    : null;

  // ─── 3. Environment & Configuration ─────────────────────────
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
  }

  // You can switch models by setting an environment variable, e.g.:
  // GROQ_MODEL = "llama-3.3-70b-versatile" (default)
  // or "mixtral-8x7b-32768", "gemma2-9b-it", etc.
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const temperature = parseFloat(process.env.GROQ_TEMPERATURE) || 0.8;
  const envMaxTokens = parseInt(process.env.GROQ_MAX_TOKENS) || 1000;
  const maxTokens = safeRequestedTokens || envMaxTokens;
  const timeoutMs = parseInt(process.env.GROQ_TIMEOUT) || 10000; // 10 seconds

  // ─── 4. Build Request Options ──────────────────────────────
  const payload = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // ─── 5. Call Groq API ──────────────────────────────────────
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // ─── 6. Parse and Handle API Errors ──────────────────────
    const data = await response.json();

    if (!response.ok) {
      // Log the full error for debugging
      console.error('❌ Groq API error:', data.error || data);
      const errorMsg = data.error?.message || 'AI service returned an error.';
      return res.status(response.status).json({ error: errorMsg });
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      console.warn('⚠️ Groq returned empty content:', data);
      return res.status(500).json({ error: 'AI returned empty response. Please try again.' });
    }

    // ─── 7. Success ────────────────────────────────────────────
    return res.status(200).json({ result: text });

  } catch (err) {
    clearTimeout(timeout);

    // Handle abort (timeout)
    if (err.name === 'AbortError') {
      console.error('⏱️ Request timed out after', timeoutMs, 'ms');
      return res.status(504).json({ error: 'AI service took too long. Please try again later.' });
    }

    // Network / other errors
    console.error('❌ Unexpected error in generate.js:', err);
    return res.status(500).json({ error: 'Failed to generate cover letter. Please try again.' });
  }
}

// export default async function handler(req, res) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const { prompt } = req.body;

//   if (!prompt) {
//     return res.status(400).json({ error: 'Prompt is required' });
//   }

//   try {
//     const apiKey = process.env.GROQ_API_KEY;

//     if (!apiKey) {
//       return res.status(500).json({ error: 'API key not configured. Please contact support.' });
//     }

//     const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`
//       },
//       body: JSON.stringify({
//         model: 'llama-3.3-70b-versatile',
//         messages: [{ role: 'user', content: prompt }],
//         temperature: 0.8,
//         max_tokens: 1000
//       })
//     });

//     const data = await response.json();

//     if (data.error) {
//       return res.status(500).json({ error: data.error.message });
//     }

//     const text = data.choices[0].message.content.trim();
//     return res.status(200).json({ result: text });

//   } catch (err) {
//     return res.status(500).json({ error: 'Failed to generate. Please try again.' });
//   }
// }


// export default async function handler(req, res) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const { prompt, type } = req.body;

//   if (!prompt) {
//     return res.status(400).json({ error: 'Prompt is required' });
//   }

//   // Validate type
//   const allowedTypes = ['cover_letter', 'resume_summary', 'resume_analyse'];
//   const requestType = type || 'cover_letter';
//   if (!allowedTypes.includes(requestType)) {
//     return res.status(400).json({ error: 'Invalid request type' });
//   }

//   try {
//     const apiKey = process.env.GROQ_API_KEY;

//     if (!apiKey) {
//       return res.status(500).json({ error: 'API key not configured. Please contact support.' });
//     }

//     // Set max_tokens based on type
//     const maxTokens = requestType === 'resume_analyse' ? 1500 : 1000;

//     const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`
//       },
//       body: JSON.stringify({
//         model: 'llama-3.3-70b-versatile',
//         messages: [
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         temperature: requestType === 'cover_letter' ? 0.8 : 0.6,
//         max_tokens: maxTokens
//       })
//     });

//     if (!response.ok) {
//       const errData = await response.json().catch(() => ({}));
//       const msg = errData?.error?.message || `API error: ${response.status}`;
//       return res.status(502).json({ error: msg });
//     }

//     const data = await response.json();

//     if (data.error) {
//       return res.status(500).json({ error: data.error.message });
//     }

//     const text = data.choices?.[0]?.message?.content?.trim();

//     if (!text) {
//       return res.status(500).json({ error: 'Empty response from AI. Please try again.' });
//     }

//     return res.status(200).json({ result: text });

//   } catch (err) {
//     console.error('Generate error:', err);
//     return res.status(500).json({ error: 'Failed to generate. Please try again.' });
//   }
// }
