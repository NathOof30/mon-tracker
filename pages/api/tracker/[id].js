import { openDb } from '../../../lib/db.js';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  const { id } = req.query;

  // Enregistre l'ouverture dans les logs
  const db = await openDb();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  await db.run(
    'INSERT INTO logs (pixelId, ip, userAgent) VALUES (?, ?, ?)',
    [id, ip, userAgent]
  );

  // Renvoie l'image 1x1
  const imagePath = path.resolve('./public/images/pixel.png');
  const imageBuffer = fs.readFileSync(imagePath);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(imageBuffer);
}
