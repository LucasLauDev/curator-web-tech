/**
 * Idempotent bookstore seed: loads supabase/seed-data/bookstore-catalog.json and optional
 * bookstore-purchases.demo.json (demo library rows — run after seed-users).
 * Requires DATABASE_URL (.env).
 */
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
  quiet: true
});

const fs = require('fs');
const path = require('path');
const { createPoolFromEnv } = require('../server/db');

const ROOT = path.join(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'supabase', 'seed-data', 'bookstore-catalog.json');
const PURCHASES_PATH = path.join(ROOT, 'supabase', 'seed-data', 'bookstore-purchases.demo.json');

async function upsertCatalog (pool) {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('Missing:', CATALOG_PATH);
    process.exit(1);
  }
  const books = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  if (!Array.isArray(books) || !books.length) {
    console.error('bookstore-catalog.json must be a non-empty JSON array.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sql = `
      INSERT INTO public.bookstore (
        id, title, author, price_rm, category, image_url, badge, description,
        reader_json, sort_order, is_published, updated_at
      )
      VALUES (
        $1::uuid, $2, $3, $4::numeric, $5, $6, $7, $8, $9::jsonb,
        COALESCE($10::integer, 0), true, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        author = EXCLUDED.author,
        price_rm = EXCLUDED.price_rm,
        category = EXCLUDED.category,
        image_url = EXCLUDED.image_url,
        badge = EXCLUDED.badge,
        description = EXCLUDED.description,
        reader_json = EXCLUDED.reader_json,
        sort_order = EXCLUDED.sort_order,
        is_published = true,
        updated_at = NOW()`;

    console.log('--- Seed: public.bookstore (catalog) ---');
    let i = 0;
    for (const b of books) {
      i += 1;
      const readerPayload =
        b.reader_json !== undefined && b.reader_json !== null
          ? typeof b.reader_json === 'object'
            ? JSON.stringify(b.reader_json)
            : String(b.reader_json)
          : null;

      await client.query(sql, [
        b.id,
        b.title,
        b.author != null ? b.author : '',
        b.price_rm,
        b.category,
        b.image_url,
        b.badge != null ? b.badge : null,
        b.description != null ? b.description : null,
        readerPayload,
        b.sort_order
      ]);
      console.log(
        `  [${i}/${books.length}] id=${b.id} | ${String(b.title).slice(0, 72)}${String(b.title).length > 72 ? '…' : ''} | RM ${b.price_rm} | ${b.category}`
      );
    }
    await client.query('COMMIT');
    console.log('OK — bookstore catalog: upserted', books.length, 'row(s)');
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
  }
}

async function upsertDemoPurchases (pool) {
  if (!fs.existsSync(PURCHASES_PATH)) {
    console.log('\n--- Seed: public.bookstore_purchase — skip (no file) ---');
    console.log('  ', path.basename(PURCHASES_PATH));
    return;
  }
  const groups = JSON.parse(fs.readFileSync(PURCHASES_PATH, 'utf8'));
  if (!Array.isArray(groups) || !groups.length) return;

  console.log('\n--- Seed: public.bookstore_purchase (demo library) ---');

  for (const g of groups) {
    if (!g.student_email || !Array.isArray(g.book_ids)) continue;
    const { rows } = await pool.query(
      `SELECT id FROM public.users WHERE lower(trim(email)) = lower(trim($1::text)) LIMIT 1`,
      [g.student_email]
    );
    const uid = rows[0]?.id;
    if (!uid) {
      console.warn(
        `Skipping purchases for "${g.student_email}" — user not found (run npm run seed-users first).`
      );
      continue;
    }
    let n = 0;
    for (const bid of g.book_ids) {
      const bookRes = await pool.query(
        `SELECT price_rm FROM public.bookstore WHERE id = $1::uuid LIMIT 1`,
        [bid]
      );
      const book = bookRes.rows[0];
      if (!book) {
        console.warn('Skipping unknown bookstore id:', bid);
        continue;
      }
      await pool.query(
        `INSERT INTO public.bookstore_purchase (user_id, bookstore_id, amount_rm)
         VALUES ($1::uuid, $2::uuid, $3::numeric)
         ON CONFLICT (user_id, bookstore_id) DO UPDATE SET
           amount_rm = EXCLUDED.amount_rm`,
        [uid, bid, book.price_rm]
      );
      n++;
    }
    console.log(`  user=${g.student_email} | upserted ${n} purchase row(s)`);
  }
}

(async () => {
  const pool = createPoolFromEnv();
  if (!pool) {
    console.error('DATABASE_URL missing or invalid in .env — cannot seed bookstore.');
    process.exit(1);
  }
  try {
    await upsertCatalog(pool);
    await upsertDemoPurchases(pool);
    console.log('\nOK — bookstore seed complete.');
  } finally {
    await pool.end();
  }
})().catch((err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
