import { openDb } from './lib/db.js';

(async () => {
  const db = await openDb();
  const rows = await db.all("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'logs'");
  console.log(rows);
})();
