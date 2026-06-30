import { openDb } from '../lib/db.js';

(async () => {
  try {
    const db = await openDb();

    // Ajout des index de performance sur la table logs existante
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_logs_pixelId ON logs(pixelId);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);`);
    
    // S'assurer que la colonne target existe
    try {
      await db.exec(`ALTER TABLE logs ADD COLUMN target VARCHAR(255);`);
      console.log('✅ Colonne target ajoutée.');
    } catch (e) {
      if (e.message && e.message.includes('already exists')) {
        console.log('ℹ️  Colonne target déjà existante.');
      } else {
        throw e;
      }
    }

    console.log('✅ Migration terminée (index + colonne target).');
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  }
})();
