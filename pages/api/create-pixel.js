import { PixelService } from '../../lib/pixelService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Vérification de la clé API (pour les appels externes)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ error: 'Nom invalide (max 100 caractères)' });
  }

  try {
    const id = await PixelService.createPixel(name);
    res.status(201).json({
      id,
      fullUrl: `${req.headers.host.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/image/${id}.gif`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne' });
  }
}
