export default async function handler(req, res) {
  const apiKey = process.env.BREVO_API_KEY;
  return res.status(200).json({
    hasKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyStart: apiKey ? apiKey.substring(0, 12) : 'NOT FOUND'
  });
}
