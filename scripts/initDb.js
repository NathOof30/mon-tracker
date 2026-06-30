import { openDb } from '../lib/db.js';

(async () => {
  try {
    const db = await openDb();
    
    // Création de la table Pixels
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pixels (
        id TEXT PRIMARY KEY,
        name VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Création de la table Logs (avec FK, target, et contraintes)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        pixelId TEXT NOT NULL REFERENCES pixels(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip TEXT,
        userAgent TEXT,
        target VARCHAR(255)
      );
    `);

    // Index de performance (IF NOT EXISTS pour l'idempotence)
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_logs_pixelId ON logs(pixelId);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);`);
    
    console.log('✅ Base de données Postgres initialisée avec succès !');
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  }
})();
