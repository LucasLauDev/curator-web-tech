/**
 * One-off helper: dumps public.bookstore to stdout as JSON array.
 * Usage: node scripts/export-bookstore-catalog-json.js > supabase/seed-data/bookstore-catalog.json
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });

const { createPoolFromEnv } = require('../server/db');

(async () => {
  const pool = createPoolFromEnv();
  if (!pool) {
    console.error('DATABASE_URL missing');
    process.exit(1);
  }
  try {
    const { rows } = await pool.query(`
      SELECT id::text AS id, title, author, price_rm::numeric AS price_rm, category,
             image_url AS image_url, badge, description,
             reader_json AS reader_json, sort_order
      FROM public.bookstore ORDER BY sort_order ASC, title ASC
    `);
    process.stdout.write(JSON.stringify(rows, null, 2));
  } finally {
    await pool.end();
  }
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
