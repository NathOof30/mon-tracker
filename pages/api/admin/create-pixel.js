import { withAdminApi } from '../../../lib/withAdminAuth.js';
import { PixelService } from '../../../lib/pixelService.js';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ error: 'Nom invalide' });
  }

  const id = await PixelService.createPixel(name);
  res.status(201).json({ id });
}
export default withAdminApi(handler);
