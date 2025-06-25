const QRCode = require('qrcode');

/**
 * Generate a QR Code as a Data URL
 * @param {string} text - The text or URL to encode into the QR code
 * @param {object} options - Optional QR styling options
 * @returns {Promise<{ success: boolean, data?: string, error?: string }>}
 */
exports.generateQR = async (text, options = {}) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length < 1) {
      return {
        success: false,
        error: 'Invalid input: text is required for QR code generation.'
      };
    }

    const dataUrl = await QRCode.toDataURL(text.trim(), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      ...options // merge custom options if any
    });

    return {
      success: true,
      data: dataUrl
    };

  } catch (error) {
    console.error('[❌ QR Code Generation Error]', error);
    return {
      success: false,
      error: 'Failed to generate QR code.'
    };
  }
};
