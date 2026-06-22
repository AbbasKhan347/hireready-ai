// resume-analyze.js — ATS Resume Analyzer API
// Endpoint: /api/resume-analyze
// Method: POST
// Payload: { resume: string, jobDescription: string }
// Response: { score: number, summary: string, improvements: array, keywords: array }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resume, jobDescription } = req.body;

  if (!resume || resume.trim().length < 50) {
    return res.status(400).json({ error: 'Please provide a resume with at least 50 characters.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const prompt = `You are an expert ATS resume analyst and career coach. Analyse the resume below and provide a detailed ATS assessment.

RESUME:
${resume}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : ''}

Respond ONLY with a valid JSON object in this exact format (no markdown, no backticks, no explanation):
{
  "score": <number between 0 and 100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "improvements": [
    {
      "priority": "high",
      "issue": "<specific issue found>",
      "fix": "<exact actionable fix>"
    },
    {
      "priority": "high",
      "issue": "<specific issue found>",
      "fix": "<exact actionable fix>"
    },
    {
      "priority": "medium",
      "issue": "<specific issue found>",
      "fix": "<exact actionable fix>"
    },
    {
      "priority": "medium",
      "issue": "<specific issue found>",
      "fix": "<exact actionable fix>"
    },
    {
      "priority": "low",
      "issue": "<specific issue found>",
      "fix": "<exact actionable fix>"
    }
  ],
  "keywords": {
    "found": ["<keyword1>", "<keyword2>", "<keyword3>"],
    "missing": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>"]
  },
  "sections": {
    "contact": <true/false>,
    "summary": <true/false>,
    "experience": <true/false>,
    "education": <true/false>,
    "skills": <true/false>,
    "achievements": <true/false>
  }
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'AI service error.' });
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: 'Empty response from AI.' });

    // Clean and parse JSON
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ result: parsed });

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Analysis took too long. Please try again.' });
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' });
    }
    return res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
  }
}
