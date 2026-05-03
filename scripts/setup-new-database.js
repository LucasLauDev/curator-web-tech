/**
 * Interactive DB setup for new machines:
 * merges DATABASE_URL (and optional secrets) into .env,
 * optionally runs migrations / demo seeds (you choose, or use CLI flags).
 *
 * CLI (granular — skips prompts for that step only):
 *   --migrate / --no-migrate
 *   --seed / --no-seed
 *   --first-setup — from first-setup.bat: auto PORTAL_SESSION_SECRET, always migrate+seed,
 *     optional SEED_USER_PASSWORD from env; DATABASE_URL from .env or prompt only if missing.
 *
 * Usage: node scripts/setup-new-database.js
 * Windows: first-setup.bat
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(ROOT, '.env'), quiet: true });

/**
 * Spawn `node script.js` (same interpreter as setup). Avoids spawning npm/cmd on Windows
 * (`spawnSync('npm.cmd', …, shell: false)` → EINVAL — .cmd files need cmd.exe).
 * @param {string} relativeJs Path under project root e.g. `scripts/migrate-db.js`.
 * @param {Record<string, string>} env Extra env vars merged into process.env for the child.
 */
function runNodeScript (relativeJs, env = {}) {
  const scriptAbs = path.join(ROOT, ...relativeJs.split(/[/\\]/));
  const r = spawnSync(process.execPath, [scriptAbs], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: false
  });
  if (r.error) {
    console.error(
      'Failed to start node:',
      r.error.code || '',
      r.error.message || String(r.error)
    );
    process.exit(1);
  }
  if (r.signal) {
    console.error(`Node stopped with signal: ${r.signal}`);
    process.exit(1);
  }
  const code = r.status;
  if (code !== 0) {
    process.exit(code == null ? 1 : code);
  }
}

function parseSetupFlags (argv) {
  const out = { migrate: undefined, seed: undefined };
  for (const a of argv) {
    if (a === '--migrate') out.migrate = true;
    else if (a === '--no-migrate') out.migrate = false;
    else if (a === '--seed') out.seed = true;
    else if (a === '--no-seed') out.seed = false;
  }
  return out;
}

function question (rl, q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

/** @param {{ defaultYes?: boolean }} [opts] */
async function promptYesNo (rl, label, opts = {}) {
  const def = opts.defaultYes !== false ? 'Y/n' : 'y/N';
  const defVal = opts.defaultYes !== false;
  for (;;) {
    const raw = (await question(rl, `${label} (${def}): `)).trim().toLowerCase();
    if (raw === '') return defVal;
    if (/^(y|yes|1)$/.test(raw)) return true;
    if (/^(n|no|0)$/.test(raw)) return false;
    console.log('Reply with Y (yes) or N (no), or Enter for the suggested default.');
  }
}

function serializeEnvValue (v) {
  const s = String(v ?? '');
  if (/[\r\n]/.test(s)) {
    throw new Error('ENV value must not contain line breaks.');
  }
  const needsQuotes = !s.length || /[#\s&]/.test(s);
  if (needsQuotes) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

/**
 * Upsert listed keys into .env while preserving unrelated lines/order where possible.
 * @param {Record<string,string>} kv
 */
function mergeEnv (kv) {
  const keys = Object.keys(kv);
  const envPath = path.join(ROOT, '.env');
  let body = '';

  try {
    body = fs.readFileSync(envPath, 'utf8');
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    const examplePath = path.join(ROOT, '.env.example');
    try {
      body = fs.readFileSync(examplePath, 'utf8');
    } catch (_) {
      body =
        '# CuratorEdu — see https://www.postgresql.org/docs/current/libpq-connect.html\n' +
        '# DATABASE_URL=\nPORT=3000\n# PORTAL_SESSION_SECRET=\n';
    }
  }

  const remainder = { ...kv };
  const lines = body.split(/\r?\n/);
  const next = [];

  for (const line of lines) {
    const trimmed = line.trimStart();
    const isCommentOrBlank = trimmed === '' || trimmed.startsWith('#');
    let replaced = false;
    if (!isCommentOrBlank) {
      const eq = line.indexOf('=');
      if (eq > 0) {
        const k = line.slice(0, eq).trim();
        if (Object.prototype.hasOwnProperty.call(remainder, k)) {
          const val = remainder[k];
          delete remainder[k];
          next.push(`${k}=${serializeEnvValue(val ?? '')}`);
          replaced = true;
        }
      }
    }
    if (!replaced) next.push(line);
  }

  for (const k of Object.keys(remainder)) {
    next.push(`${k}=${serializeEnvValue(remainder[k] ?? '')}`);
  }

  fs.writeFileSync(envPath, next.join('\n').replace(/\n*$/, '\n'), 'utf8');
  console.log('Updated .env (%s)', path.relative(ROOT, envPath));
}

async function main () {
  const argv = process.argv.slice(2);
  const firstSetup = argv.includes('--first-setup');
  const flags = parseSetupFlags(argv);
  const unknown = argv.filter(
    (a) => a !== '--first-setup' && !/^--(?:no-)?(?:migrate|seed)$/.test(a)
  );
  if (unknown.length) {
    console.error('Unknown arguments:', unknown.join(', '));
    console.error(
      'Allowed: --migrate | --no-migrate | --seed | --no-seed | --first-setup'
    );
    process.exit(2);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let databaseUrl = '';
  let sessionSecret = '';
  let runMigrate;
  let runSeed;
  let pwdInput = '';

  if (firstSetup) {
    console.log(`
CuratorEdu — first-time setup
- Writes .env (DATABASE_URL, PORTAL_SESSION_SECRET, optional SEED_USER_PASSWORD)
- PORTAL_SESSION_SECRET is generated automatically (64 hex chars)
- Runs SQL migrations, then seeds: users → bookstore → courses
DATABASE_URL may already be in .env; otherwise paste Supabase Direct Connection (postgresql://...).
`);
    databaseUrl = String(process.env.DATABASE_URL || '').trim();
    while (!databaseUrl) {
      databaseUrl = (await question(rl, 'DATABASE_URL: ')).trim();
      if (!databaseUrl) console.log('DATABASE_URL is required.');
    }
    sessionSecret = crypto.randomBytes(32).toString('hex');
    console.log('Generated PORTAL_SESSION_SECRET (stored in .env).');
    runMigrate = true;
    runSeed = true;
    pwdInput = String(process.env.SEED_USER_PASSWORD || '').trim();
    if (pwdInput) {
      console.log('Using SEED_USER_PASSWORD from environment for demo accounts.');
    } else {
      console.log('Demo account password: 123456 (default; set SEED_USER_PASSWORD before running to override).');
    }
  } else {
    console.log(`
CuratorEdu — database setup
Use Supabase Dashboard → Connect → Direct Connection String → URI mode (postgresql://...) → Copy and paste the connection string here
`);

    databaseUrl = '';
    while (!String(databaseUrl).trim()) {
      databaseUrl = (await question(rl, 'DATABASE_URL: ')).trim();
      if (!databaseUrl) console.log('DATABASE_URL is required.');
    }

    console.log(`
PORTAL_SESSION_SECRET signs the portal cookie (minimum 16 characters).`);

    sessionSecret = (await question(rl, 'PORTAL_SESSION_SECRET (Enter to generate): ')).trim();

    if (sessionSecret.length < 16) {
      sessionSecret = crypto.randomBytes(32).toString('hex');
      console.log('Generated PORTAL_SESSION_SECRET (stored in .env).');
    }

    const missMigrate = flags.migrate === undefined;
    const missSeed = flags.seed === undefined;

    /** If user did not pass any migrate/seed flags, one "yes" runs migrate then seed automatically. */
    if (missMigrate && missSeed) {
      const runBoth = await promptYesNo(
        rl,
        'Run migrations, then demo seed (schema + demo users, courses, bookstore)',
        { defaultYes: true }
      );
      runMigrate = runBoth;
      runSeed = runBoth;
    } else {
      runMigrate =
        flags.migrate !== undefined
          ? flags.migrate
          : await promptYesNo(rl, 'Run SQL migrations now (npm run migrate)?', {
              defaultYes: true
            });
      runSeed =
        flags.seed !== undefined
          ? flags.seed
          : await promptYesNo(rl, 'Seed demo users + bookstore (npm run seed)?', {
              defaultYes: true
            });
    }

    if (runSeed && !runMigrate) {
      console.log(
        '\nNote: Seeds expect tables created by migrations. Running seed without migrate usually fails.'
      );
      const contradictoryFlags = flags.migrate === false && flags.seed === true;
      if (contradictoryFlags) {
        console.log(
          'Both --no-migrate and --seed were passed; seed will run without a second prompt.\n'
        );
      } else {
        runSeed = await promptYesNo(rl, 'Still run seed now?', { defaultYes: false });
      }
    }

    if (runSeed) {
      pwdInput = (
        await question(
          rl,
          'Demo account password (SEED_USER_PASSWORD) — Enter for default 123456: '
        )
      ).trim();
    }
  }

  const envPatch = {
    DATABASE_URL: databaseUrl,
    PORTAL_SESSION_SECRET: sessionSecret
  };

  if (pwdInput !== '') envPatch.SEED_USER_PASSWORD = pwdInput;

  mergeEnv(envPatch);

  rl.close();

  const seedEnv =
    pwdInput !== '' ? { SEED_USER_PASSWORD: pwdInput } : {};

  if (runMigrate) {
    console.log('\nApplying database schema (node scripts/migrate-db.js)...\n');
    runNodeScript('scripts/migrate-db.js', { DATABASE_URL: databaseUrl });
    console.log('\nOK — Migrations finished successfully.');
  } else {
    console.log('\nSkipped migrations. Run later: npm run migrate');
  }

  if (runSeed) {
    if (runMigrate) {
      console.log('\nRunning demo seed (seed-demo-users.js, seed-bookstore-data.js, seed-courses-data.js)...\n');
    } else {
      console.log('\nLoading demo data...\n');
    }
    runNodeScript('scripts/seed-demo-users.js', {
      DATABASE_URL: databaseUrl,
      ...seedEnv
    });
    runNodeScript('scripts/seed-bookstore-data.js', {
      DATABASE_URL: databaseUrl,
      ...seedEnv
    });
    runNodeScript('scripts/seed-courses-data.js', {
      DATABASE_URL: databaseUrl,
      ...seedEnv
    });
    console.log('\nOK — Demo seed finished successfully.');
  } else {
    console.log('\nSkipped seed. Run later: npm run seed');
  }

  if (runMigrate && runSeed) {
    console.log('\nAll set: migrations and seed completed. Start the app: npm start');
  } else {
    console.log('\nFinished. Start the app: npm start');
  }
}

main().catch((err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
