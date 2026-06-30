import { openDb } from '../../../lib/db.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const db = await openDb();
  const logs = await db.all(
    'SELECT * FROM logs WHERE pixelId = ? ORDER BY timestamp DESC',
    [id]
  );
  res.json(logs);
}
