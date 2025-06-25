const googleTTS = require('google-tts-api');
const axios = require('axios'); /**
 * GET /api/tts?text=Your%20message
 * Returns a Google-hosted TTS audio URL
 */
exports.getTTS = async (req, res) => {
  try {
    const { text, lang = 'en' } = req.query;

    if (!text || text.length > 200) {
      return res.status(400).json({ error: 'Invalid or too long text' });
    }

    const audioUrl = googleTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    const response = await axios.get(audioUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (err) {
    console.error('[TTS Proxy Error]', err);
    res.status(500).send('Failed to fetch audio');
  }
};
