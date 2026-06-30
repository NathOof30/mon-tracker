import { openDb } from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

function sanitize(str, maxLen = 255) {
  if (!str || typeof str !== 'string') return null;
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

const SALT_ROUNDS = 12;

export const UserService = {
  async register(email, password) {
    const db = await openDb();
    const safeEmail = sanitize(email, 255)?.toLowerCase();
    if (!safeEmail) throw new Error('Email invalide');

    // Vérifier unicité
    const existing = await db.get('SELECT id FROM users WHERE email = $1', [safeEmail]);
    if (existing) throw new Error('EMAIL_EXISTS');

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.get(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [safeEmail, hash]
    );
    return result.id;
  },

  async authenticate(email, password) {
    const db = await openDb();
    const safeEmail = email?.toLowerCase()?.trim();
    const user = await db.get(
      'SELECT id, email, password, role, pixellimit as "pixelLimit" FROM users WHERE email = $1',
      [safeEmail]
    );
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // Ne jamais renvoyer le hash du mot de passe
    return { id: user.id, email: user.email, role: user.role, pixelLimit: user.pixelLimit };
  },

  async getById(id) {
    const db = await openDb();
    const user = await db.get(
      'SELECT id, email, role, pixellimit as "pixelLimit", createdat as "createdAt" FROM users WHERE id = $1',
      [id]
    );
    if (!user) return null;
    if (user.createdAt instanceof Date) user.createdAt = user.createdAt.toISOString();
    return user;
  },

  async getAllUsers() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT u.id, u.email, u.role, u.pixellimit as "pixelLimit", u.createdat as "createdAt",
             COUNT(p.id) as "pixelCount"
      FROM users u
      LEFT JOIN pixels p ON u.id = p."userId"
      GROUP BY u.id
      ORDER BY u.createdat DESC
    `);
    return rows.map(r => ({
      ...r,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      pixelCount: Number(r.pixelCount || 0)
    }));
  },

  async resetPassword(userId, newPassword) {
    const db = await openDb();
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.run('UPDATE users SET password = $1 WHERE id = $2', [hash, userId]);
  },

  async updateUser(userId, { email, pixelLimit, role }) {
    const db = await openDb();
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email.toLowerCase().trim());
    }
    if (pixelLimit !== undefined) {
      updates.push(`pixellimit = $${paramIndex++}`);
      params.push(Number(pixelLimit));
    }
    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    if (updates.length === 0) return;
    params.push(userId);
    await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);
  },

  async deleteUser(userId) {
    const db = await openDb();
    // Supprimer logs → pixels → user (cascade manuelle pour rétrocompatibilité)
    await db.run(`DELETE FROM logs WHERE pixelid IN (SELECT id FROM pixels WHERE "userId" = $1)`, [userId]);
    await db.run('DELETE FROM pixels WHERE "userId" = $1', [userId]);
    await db.run('DELETE FROM users WHERE id = $1', [userId]);
  }
};
