export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured. Please contact support.' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.choices[0].message.content.trim();
    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate. Please try again.' });
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
