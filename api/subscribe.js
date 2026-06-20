export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('BREVO_API_KEY is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        email: email,
        listIds: [2],
        updateEnabled: true,
        attributes: {
          SOURCE: 'HireReady AI Website'
        }
      })
    });

    const responseText = await response.text();
    console.log('Brevo status:', response.status);
    console.log('Brevo response:', responseText);

    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    let data = {};
    try { data = JSON.parse(responseText); } catch(e) {}

    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true, message: 'already subscribed' });
    }

    return res.status(500).json({ 
      error: 'Brevo error: ' + (data.message || responseText) 
    });

  } catch (err) {
    console.error('Subscribe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
