import { openDb } from './db.js';
import { v4 as uuidv4 } from 'uuid';

function anonymizeIP(ip) {
  if (!ip) return null;
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }
  const parts = ip.split(':');
  return parts.slice(0, 2).join(':') + '::/16';
}

export const PixelService = {
  async createPixel(name) {
    const db = await openDb();
    const id = uuidv4();
    await db.run('INSERT INTO pixels (id, name) VALUES (?, ?)', [id, name.slice(0, 100)]);
    return id;
  },

  async trackPixel(id, ip, userAgent) {
    const db = await openDb();
    const anonymizedIp = anonymizeIP(ip);
    await db.run(
      'INSERT INTO logs (pixelId, ip, userAgent) VALUES (?, ?, ?)',
      [id, anonymizedIp, userAgent || null]
    );
  },

  async getAllPixels() {
    const db = await openDb();
    return await db.all(`
      SELECT p.id, p.name, p.createdAt, COUNT(l.id) as opens
      FROM pixels p
      LEFT JOIN logs l ON p.id = l.pixelId
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `);
  },

  async getPixelById(pixelId) {
    const db = await openDb();
    const pixel = await db.get('SELECT * FROM pixels WHERE id = ?', [pixelId]);
    if (!pixel) return null;
    const logs = await db.all(
      'SELECT id, timestamp, ip, userAgent FROM logs WHERE pixelId = ? ORDER BY timestamp DESC',
      [pixelId]
    );
    return { ...pixel, logs };
  },

  async getStats() {
    const db = await openDb();
    const totalPixels = await db.get('SELECT COUNT(*) as count FROM pixels');
    const totalOpens = await db.get('SELECT COUNT(*) as count FROM logs');
    return {
      totalPixels: totalPixels.count,
      totalOpens: totalOpens.count,
    };
  }
};
