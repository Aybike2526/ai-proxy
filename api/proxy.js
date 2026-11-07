export default async function handler(req, res) {
  // CORS izinleri
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
  }

  try {
    const { prompt, image } = req.body;

    if (!prompt || !image) {
      return res.status(400).json({ error: 'Prompt veya görsel eksik!' });
    }

    // OpenAI API İsteki (Vercel Environment Variables'dan anahtarı çeker)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${image}` }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenAI API hatası' });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}