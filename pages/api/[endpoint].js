const API_BASE_URL = 'https://api.prospeo.io';
const API_KEY = process.env.NEXT_PUBLIC_PROSPEO_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, data } = req.body;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KEY': API_KEY,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(responseData);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('API call error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}