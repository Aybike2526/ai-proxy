
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Sadece POST istekleri kabul edilir.'
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: 'Gönderilen metin boş!'
      });
    }

    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
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
              content: prompt
            }
          ],
          max_tokens: 500
        })
      }
    );

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(500).json({
        error: data.error?.message || 'OpenAI API hatası'
      });
    }

    return res.status(200).json({
      answer: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
