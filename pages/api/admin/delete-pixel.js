import { withAdminApi } from '../../../lib/withAdminAuth.js';
import { PixelService } from '../../../lib/pixelService.js';

async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID manquant' });

  try {
    await PixelService.deletePixel(id, req.session.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    if (error.message === 'PIXEL_NOT_FOUND') {
      return res.status(404).json({ error: 'Pixel introuvable ou non autorisé' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur interne' });
  }
}
export default withAdminApi(handler);
