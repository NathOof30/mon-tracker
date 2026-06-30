import { PixelService } from '../../../lib/pixelService.js';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send('ID manquant');

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];

    // Enregistrement via le service (anonymisation automatique)
    await PixelService.trackPixel(id, ip, userAgent);

    // Renvoi de l'image 1x1
    const imagePath = path.resolve('./public/images/pixel.png');
    const imageBuffer = fs.readFileSync(imagePath);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
}
