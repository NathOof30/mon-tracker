import { openDb } from './db.js';
import { v4 as uuidv4 } from 'uuid';

// Sanitise une chaîne en supprimant les balises HTML et en limitant la longueur
function sanitize(str, maxLen = 255) {
  if (!str || typeof str !== 'string') return null;
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

// Corriger le décalage horaire (Postgres TIMESTAMP without time zone = UTC, mais le driver pg l'interprète comme local)
function fixPgDate(dateObj) {
  if (!dateObj) return null;
  if (typeof dateObj === 'string') return new Date(dateObj).toISOString();
  return new Date(Date.UTC(
    dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(),
    dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds()
  )).toISOString();
}

export const PixelService = {
  async deletePixel(id, userId) {
    const db = await openDb();
    // Vérifier que le pixel appartient bien à cet utilisateur
    const pixel = await db.get('SELECT id FROM pixels WHERE id = $1 AND "userId" = $2', [id, userId]);
    if (!pixel) throw new Error('PIXEL_NOT_FOUND');
    await db.run('DELETE FROM logs WHERE pixelId = $1', [id]);
    await db.run('DELETE FROM pixels WHERE id = $1', [id]);
  },

  async createPixel(name, userId) {
    const db = await openDb();
    const id = uuidv4();
    const safeName = sanitize(name, 100);
    await db.run('INSERT INTO pixels (id, name, "userId") VALUES ($1, $2, $3)', [id, safeName, userId]);
    return id;
  },

  async countPixels(userId) {
    const db = await openDb();
    const result = await db.get('SELECT COUNT(*) as count FROM pixels WHERE "userId" = $1', [userId]);
    return Number(result?.count || 0);
  },

  async trackPixel(id, ip, userAgent, target = null) {
    const db = await openDb();
    const safeTarget = sanitize(target, 255);
    await db.run(
      'INSERT INTO logs (pixelId, ip, userAgent, target) VALUES ($1, $2, $3, $4)',
      [id, ip, userAgent, safeTarget]
    );
  },

  async getAllPixels(userId) {
    const db = await openDb();
    const rows = await db.all(`
      SELECT p.id, p.name, p.createdAt as "createdAt", COUNT(l.id) as opens
      FROM pixels p
      LEFT JOIN logs l ON p.id = l.pixelId
      WHERE p."userId" = $1
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `, [userId]);
    
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      createdAt: fixPgDate(r.createdAt),
      opens: Number(r.opens || 0)
    }));
  },

  async getPixelById(pixelId, userId) {
    const db = await openDb();
    const pixel = await db.get(
      'SELECT id, name, createdAt as "createdAt" FROM pixels WHERE id = $1 AND "userId" = $2',
      [pixelId, userId]
    );
    if (!pixel) return null;
    
    const logs = await db.all(
      'SELECT id, timestamp, ip, userAgent as "userAgent", target FROM logs WHERE pixelId = $1 ORDER BY timestamp DESC',
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

  async getStats(userId) {
    const db = await openDb();
    const totalPixels = await db.get('SELECT COUNT(*) as count FROM pixels WHERE "userId" = $1', [userId]);
    const totalOpens = await db.get(
      `SELECT COUNT(*) as count FROM logs WHERE pixelid IN (SELECT id FROM pixels WHERE "userId" = $1)`,
      [userId]
    );
    
    return {
      totalPixels: Number(totalPixels?.count || 0),
      totalOpens: Number(totalOpens?.count || 0),
    };
  }
};
