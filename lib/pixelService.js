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

// Corriger le décalage horaire (Postgres TIMESTAMP without time zone = UTC, mais le driver pg l'interprète comme local)
function fixPgDate(dateObj) {
  if (!dateObj) return null;
  if (typeof dateObj === 'string') return new Date(dateObj).toISOString(); // Fallback si c'est déjà une string
  return new Date(Date.UTC(
    dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(),
    dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds()
  )).toISOString();
}

export const PixelService = {
  async deletePixel(id) {
    const db = await openDb();
    await db.run('DELETE FROM logs WHERE pixelId = ?', [id]);
    await db.run('DELETE FROM pixels WHERE id = ?', [id]);
  },

  async createPixel(name) {
    const db = await openDb();
    const id = uuidv4();
    await db.run('INSERT INTO pixels (id, name) VALUES (?, ?)', [id, name.slice(0, 100)]);
    return id;
  },

  async trackPixel(id, ip, userAgent, target = null) {
    const db = await openDb();
    
    await db.run(
      'INSERT INTO logs (pixelId, ip, userAgent, target) VALUES ($1, $2, $3, $4)',
      [id, ip, userAgent, target]
    );
  },

  async getAllPixels() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT p.id, p.name, p.createdAt as "createdAt", COUNT(l.id) as opens
      FROM pixels p
      LEFT JOIN logs l ON p.id = l.pixelId
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `);
    
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      createdAt: fixPgDate(r.createdAt),
      opens: Number(r.opens || 0)
    }));
  },

  async getPixelById(pixelId) {
    const db = await openDb();
    const pixel = await db.get('SELECT id, name, createdAt as "createdAt" FROM pixels WHERE id = ?', [pixelId]);
    if (!pixel) return null;
    
    const logs = await db.all(
      'SELECT id, timestamp, ip, userAgent as "userAgent", target FROM logs WHERE pixelId = ? ORDER BY timestamp DESC',
      [pixelId]
    );
    
    return { 
      id: pixel.id,
      name: pixel.name,
      createdAt: fixPgDate(pixel.createdAt),
      logs: logs.map(l => ({
        id: l.id,
        timestamp: fixPgDate(l.timestamp),
        ip: l.ip || null,
        userAgent: l.userAgent || l.useragent || null,
        target: l.target || null
      }))
    };
  },

  async getStats() {
    const db = await openDb();
    const totalPixels = await db.get('SELECT COUNT(*) as count FROM pixels');
    const totalOpens = await db.get('SELECT COUNT(*) as count FROM logs');
    
    return {
      totalPixels: Number(totalPixels?.count || 0),
      totalOpens: Number(totalOpens?.count || 0),
    };
  }
};
