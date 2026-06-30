import { openDb } from '../lib/db.js';
import bcrypt from 'bcryptjs';

(async () => {
  try {
    const db = await openDb();

    // 1. Créer la table users
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        pixelLimit INTEGER DEFAULT 10,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table users créée.');

    // 2. Créer le compte super-admin avec le ADMIN_PASSWORD actuel
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.SUPERADMIN_EMAIL || 'admin@mon-tracker.app';
    const hash = await bcrypt.hash(adminPassword.startsWith('$2') ? 'admin1234' : adminPassword, 12);
    
    const existing = await db.get('SELECT id FROM users WHERE role = $1', ['superadmin']);
    let superadminId;
    
    if (!existing) {
      const result = await db.get(
        `INSERT INTO users (email, password, role, pixellimit) VALUES ($1, $2, $3, $4) RETURNING id`,
        [adminEmail, hash, 'superadmin', 999]
      );
      superadminId = result.id;
      console.log(`✅ Compte super-admin créé : ${adminEmail}`);
    } else {
      superadminId = existing.id;
      console.log('ℹ️  Compte super-admin déjà existant.');
    }

    // 3. Ajouter la colonne userId à pixels (si elle n'existe pas)
    try {
      await db.exec(`ALTER TABLE pixels ADD COLUMN "userId" UUID;`);
      console.log('✅ Colonne userId ajoutée à pixels.');
    } catch (e) {
      if (e.message && e.message.includes('already exists')) {
        console.log('ℹ️  Colonne userId déjà existante.');
      } else {
        throw e;
      }
    }

    // 4. Attribuer tous les pixels orphelins au super-admin
    await db.run(`UPDATE pixels SET "userId" = $1 WHERE "userId" IS NULL`, [superadminId]);
    console.log('✅ Pixels existants attribués au super-admin.');

    // 5. Index de performance
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_pixels_userId ON pixels("userId");`);
    console.log('✅ Index idx_pixels_userId créé.');

    console.log('\n🎉 Migration multi-comptes terminée avec succès !');
    console.log(`   Super-admin email : ${adminEmail}`);
    console.log(`   Super-admin ID    : ${superadminId}`);
    
  } catch (err) {
    console.error('❌ Erreur de migration :', err);
  }
})();
