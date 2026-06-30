import { openDb } from '../../../lib/db.js';

export default async function handler(req, res) {
  // Vérification de la clé d'API (Sécurité)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { id } = req.query;
  const db = await openDb();
  const logs = await db.all(
    'SELECT * FROM logs WHERE pixelId = ? ORDER BY timestamp DESC',
    [id]
  );
  res.json(logs);
}
