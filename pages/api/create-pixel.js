import { openDb } from '../../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Vérification de la clé d'API (Sécurité)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { name } = req.body;
  
  // Validation stricte des entrées
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Le nom du pixel est requis et doit être du texte' });
  }
  if (name.length > 100) {
    return res.status(400).json({ error: 'Le nom du pixel est trop long (100 caractères max)' });
  }

  const db = await openDb();
  const id = uuidv4();
  await db.run('INSERT INTO pixels (id, name) VALUES (?, ?)', [id, name]);

  res.status(201).json({
    id,
    url: `/api/tracker/${id}`,
    fullUrl: `http://${req.headers.host}/api/tracker/${id}`
  });
}
