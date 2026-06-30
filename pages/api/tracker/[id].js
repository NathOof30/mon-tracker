import { openDb } from '../../../lib/db.js';
import path from 'path';
import fs from 'fs';

function anonymizeIp(ip) {
  if (!ip) return 'unknown';
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 3).join(':') + ':0000:0000:0000:0000:0000';
  }
  // IPv4
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  return ip;
}

export default async function handler(req, res) {
  const { id } = req.query;

  // Enregistre l'ouverture dans les logs
  const db = await openDb();
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = anonymizeIp(ip); // RGPD : Anonymisation de l'IP
  
  // Limite la taille du User-Agent au cas où
  let userAgent = req.headers['user-agent'] || 'unknown';
  if (userAgent.length > 500) userAgent = userAgent.substring(0, 500);

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
