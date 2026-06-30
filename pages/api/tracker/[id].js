import { PixelService } from '../../../lib/pixelService.js';

// Image PNG transparente 1x1 pixel en base64
// Image GIF transparente 1x1 pixel (le format le plus léger et 100% transparent pour les emails)
const PIXEL_BASE64 = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const PIXEL_BUFFER = Buffer.from(PIXEL_BASE64, 'base64');

export default async function handler(req, res) {
  let { id } = req.query;
  if (id && id.endsWith('.gif')) id = id.replace('.gif', '');
  
  // Fonction utilitaire pour toujours renvoyer l'image de manière stricte (exigences Gmail)
  const sendPixel = () => {
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', PIXEL_BUFFER.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).send(PIXEL_BUFFER);
  };

  if (!id) {
    return sendPixel(); // ID manquant, mais on renvoie quand même l'image pour ne pas casser l'email
  }

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];

    // Enregistrement de l'ouverture
    await PixelService.trackPixel(id, ip, userAgent);
  } catch (error) {
    console.error('Erreur lors du tracking :', error);
    // On capture l'erreur silencieusement pour être SÛR que l'image soit toujours renvoyée
  }

  // Renvoi garanti de l'image avec les bons headers
  sendPixel();
}
