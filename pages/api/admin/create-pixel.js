import { withAdminApi } from '../../../lib/withAdminAuth.js';
import { PixelService } from '../../../lib/pixelService.js';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ error: 'Nom invalide' });
  }

  const userId = req.session.user.id;
  const pixelLimit = req.session.user.pixelLimit || 10;

  // Vérifier la limite de pixels
  const currentCount = await PixelService.countPixels(userId);
  if (currentCount >= pixelLimit) {
    return res.status(403).json({ error: `Limite atteinte (${pixelLimit} pixels max). Contactez l'administrateur.` });
  }

  const id = await PixelService.createPixel(name, userId);
  res.status(201).json({ id });
}
export default withAdminApi(handler);
