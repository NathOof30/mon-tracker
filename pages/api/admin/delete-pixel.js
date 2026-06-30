import { withAdminApi } from '../../../lib/withAdminAuth.js';
import { PixelService } from '../../../lib/pixelService.js';

async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID manquant' });

  await PixelService.deletePixel(id);
  res.status(200).json({ success: true });
}
export default withAdminApi(handler);
