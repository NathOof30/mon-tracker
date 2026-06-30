import { openDb } from '../../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Le nom du pixel est requis' });
  }

  const db = await openDb();
  const id = uuidv4();
  await db.run('INSERT INTO pixels (id, name) VALUES (?, ?)', [id, name]);

  res.status(201).json({
    id,
    url: `/api/tracker/${id}`,
    fullUrl: `https://votre-domaine.vercel.app/api/tracker/${id}`
  });
}
