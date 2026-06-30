import { sql } from '@vercel/postgres';

// Petite fonction utilitaire pour convertir la syntaxe SQLite (?) vers Postgres ($1, $2)
// Cela permet de ne pas avoir à réécrire toutes les requêtes du PixelService !
function convertQuery(query) {
  let i = 1;
  return query.replace(/\?/g, () => `$${i++}`);
}

export async function openDb() {
  return {
    async run(query, params = []) {
      await sql.query(convertQuery(query), params);
    },
    async get(query, params = []) {
      const result = await sql.query(convertQuery(query), params);
      return result.rows[0] || null;
    },
    async all(query, params = []) {
      const result = await sql.query(convertQuery(query), params);
      return result.rows;
    },
    async exec(query) {
      await sql.query(query);
    }
  };
}
