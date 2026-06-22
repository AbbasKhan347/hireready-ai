//  resume-analyze.js  –  AI Resume Analyzer API
//  Endpoint: /api/resume-analyze
//  Method: POST

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { resume, jd } = req.body;
  if (!resume || typeof resume !== 'string') {
    return res.status(400).json({ error: 'Resume text is required.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error.' });

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // We are asking the AI to return HTML formatting directly so it looks beautiful on the frontend
  const prompt = `Act as an expert ATS (Applicant Tracking System) software and expert tech recruiter.
Analyze the following resume against the job description (if provided). 

Resume: ${resume}
Job Description: ${jd || 'None provided. Do a general best-practices analysis.'}

Format your response exactly like this using HTML tags:
<h3>ATS Match Score: [Generate a score out of 100]%</h3>
<p><strong>Overall Verdict:</strong> [1-2 sentences on how strong this resume is].</p>
<hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">
<h4 style="color: #059669;">✅ What looks good:</h4>
<ul>
  <li>[Point 1]</li>
  <li>[Point 2]</li>
</ul>
<h4 style="color: #ef4444; margin-top:15px;">⚠️ 3 Critical Improvements Needed:</h4>
<ol>
  <li><strong>[Issue]:</strong> [How to fix it]</li>
  <li><strong>[Issue]:</strong> [How to fix it]</li>
  <li><strong>[Issue]:</strong> [How to fix it]</li>
</ol>
<div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
  <strong>💡 Tip:</strong> You are missing key action verbs. Upgrade to Pro to let our AI rewrite your bullet points automatically.
</div>

Return ONLY the HTML code. No markdown formatting blocks like \`\`\`html.`;

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
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });

    let text = data.choices?.[0]?.message?.content?.trim();
    
    // Safety cleanup in case the AI wraps it in markdown blocks anyway
    if (text.startsWith('```html')) text = text.replace(/```html/g, '').replace(/```/g, '').trim();

    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
  }
}
