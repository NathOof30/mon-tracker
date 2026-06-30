import { openDb } from './lib/db.js';

(async () => {
  const db = await openDb();
  try {
    await db.run(
      'INSERT INTO logs (pixelId, ip, userAgent, target) VALUES ($1, $2, $3, $4)',
      ['ebf0565b-9f18-4b11-9e1c-e9f70983b248', '127.0.0.1', 'test', null]
    );
    console.log('Insert OK');
  } catch(e) {
    console.error(e);
  }
})();
