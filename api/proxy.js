
export default async function handler(req, res) {

  // CORS izinleri
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

    // Sadece metin al
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Gönderilen metin boş!'
      });
    }

    // API anahtarını güvenli ortam değişkeninden al
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API anahtarı sunucuda tanımlanmamış.'
      });
    }

    // OpenAI API isteği
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',

        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          model: 'gpt-4o-mini',

          messages: [
            {
              role: 'system',
              content:
                'Sen Türkçe konuşan bir nesne bilgi asistanısın. ' +
                'Kullanıcının yazdığı nesneyi açıkla. ' +
                'Yanıtını yalnızca objectName ve description ' +
                'alanlarını içeren geçerli JSON olarak ver.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],

          response_format: {
            type: 'json_object'
          },

          max_tokens: 300
        })
      }
    );

    const data = await openaiResponse.json();

    // OpenAI hata kontrolü
    if (!openaiResponse.ok) {
      console.error('OpenAI hatası:', data);

      return res.status(openaiResponse.status).json({
        error: data.error?.message || 'OpenAI API hatası'
      });
    }

    // Yanıtı Unity'ye gönder
    return res.status(200).json(data);

  } catch (err) {

    console.error('Sunucu hatası:', err);

    return res.status(500).json({
      error: err.message || 'Sunucu hatası'
    });
  }
}
