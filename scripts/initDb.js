import { openDb } from '../lib/db.js';

(async () => {
  try {
    const db = await openDb();
    
    // Création de la table Pixels (TIMESTAMP au lieu de DATETIME)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pixels (
        id TEXT PRIMARY KEY,
        name TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Création de la table Logs (SERIAL au lieu de AUTOINCREMENT)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        pixelId TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip TEXT,
        userAgent TEXT
      );
    `);
    
    console.log('✅ Base de données Postgres initialisée avec succès !');
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  }
})();
