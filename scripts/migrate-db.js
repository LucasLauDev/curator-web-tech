/**
 * Apply SQL migrations under supabase/migrations/ to Postgres (DATABASE_URL).
 * Tracks applied files in public.web_tech_migration_history so each runs once.
 * Current repo ships a single consolidated schema migration for new environments.
 *
 * Usage:
 *   npm run migrate
 *   node scripts/migrate-db.js --dry-run   # list pending only
 *   node scripts/migrate-db.js --baseline  # record all files as applied (no SQL run)
 *
 * Requires: npm dependencies (pg, dotenv); .env with DATABASE_URL matching Supabase/Postgres.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { createPoolFromEnv } = require('../server/db');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const HISTORY_TABLE = 'web_tech_migration_history';

function parseFlags (argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    baseline: argv.includes('--baseline')
  };
}

function listMigrationFiles () {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations folder not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

async function ensureHistoryTable (pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.${HISTORY_TABLE} (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    COMMENT ON TABLE public.${HISTORY_TABLE} IS
      'Applied SQL migrations from Web-Tech supabase/migrations (npm run migrate).';
  `);
}

async function appliedSet (pool) {
  const { rows } = await pool.query(`SELECT filename FROM public.${HISTORY_TABLE}`);
  return new Set(rows.map((r) => r.filename));
}

async function applyOne (pool, filename) {
  const fullPath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(fullPath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      `INSERT INTO public.${HISTORY_TABLE} (filename) VALUES ($1)`,
      [filename]
    );
    await client.query('COMMIT');
    console.log(`OK — ${filename}`);
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      /* ignore */
    }
    console.error(`FAIL — ${filename}`);
    throw err;
  } finally {
    client.release();
  }
}

async function baselineAll (pool, files) {
  for (const name of files) {
    await pool.query(
      `INSERT INTO public.${HISTORY_TABLE} (filename) VALUES ($1)
       ON CONFLICT (filename) DO NOTHING`,
      [name]
    );
    console.log(`Recorded (baseline): ${name}`);
  }
}

async function main () {
  const { dryRun, baseline } = parseFlags(process.argv.slice(2));
  const files = listMigrationFiles();
  const pool = createPoolFromEnv();
  if (!pool) {
    console.error('DATABASE_URL missing or invalid in .env — cannot migrate.');
    process.exit(1);
  }

  try {
    await ensureHistoryTable(pool);
    const done = await appliedSet(pool);

    if (baseline) {
      console.log('[baseline] Marking migrations as applied (SQL is NOT executed). Use only when the DB already matches these files.');
      await baselineAll(pool, files);
      return;
    }

    const pending = files.filter((f) => !done.has(f));
    if (!pending.length) {
      console.log('No pending migrations.');
      return;
    }

    console.log(`${pending.length} pending migration(s):`);
    pending.forEach((f) => console.log(`  - ${f}`));
    if (dryRun) return;

    for (const name of pending) {
      await applyOne(pool, name);
    }
    console.log('Migrations finished.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
