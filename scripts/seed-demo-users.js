/**
 * Seeds demo portal accounts into public.users (Postgres only, no Auth API).
 * Requires DATABASE_URL (.env).
 */
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
  quiet: true
});

const fs = require('fs');
const path = require('path');

const {
  createPoolFromEnv,
  upsertSeedUser
} = require('../server/db');

const databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const pool = createPoolFromEnv();
if (!pool) {
  console.error('Could not create database pool');
  process.exit(1);
}

const password = process.env.SEED_USER_PASSWORD || '123456';

const extraSeedPath = path.join(__dirname, '..', 'supabase', 'seed-data', 'demo-portal-users.json');
let portalExtras = [];
try {
  if (fs.existsSync(extraSeedPath)) {
    portalExtras = JSON.parse(fs.readFileSync(extraSeedPath, 'utf8'));
    if (!Array.isArray(portalExtras)) portalExtras = [];
  }
} catch (e) {
  console.warn('Could not load demo-portal-users.json:', e.message || e);
}

const seeds = [
  {
    email: 'ali@student.uts.edu.my',
    studentId: 'UTS20230001',
    role: 'student',
    firstName: 'Ali',
    lastName: 'Mahmud',
    yearStudy: 2,
    faculty: 'computing',
    instructorTitle: null
  },
  {
    email: 'instructor@uts.edu.my',
    studentId: null,
    role: 'instructor',
    firstName: 'Instructor',
    lastName: 'UTS',
    yearStudy: null,
    faculty: 'computing',
    instructorTitle: 'Lecturer, Faculty of Computing'
  },
  {
    email: 'admin@uts.edu.my',
    studentId: null,
    role: 'admin',
    firstName: 'Admin',
    lastName: 'UTS',
    yearStudy: null,
    faculty: null,
    instructorTitle: null
  }
];

(async () => {
  const combined = [...seeds, ...portalExtras];
  console.log('--- Seed: public.users (demo accounts) ---');
  console.log('Rows to upsert:', combined.length, '| SEED_USER_PASSWORD: from env or default 123456\n');
  try {
    let n = 0;
    for (const s of combined) {
      n += 1;
      const row = await upsertSeedUser(pool, {
        email: s.email,
        studentId: s.studentId,
        passwordPlain: password,
        role: s.role,
        firstName: s.firstName,
        lastName: s.lastName,
        yearStudy: s.yearStudy,
        faculty: s.faculty,
        instructorTitle: s.instructorTitle
      });
      const sid = row?.student_id != null ? row.student_id : '—';
      console.log(
        `  [${n}/${combined.length}] id=${row?.id} | email=${row?.email} | role=${row?.role} | student_id=${sid}`
      );
    }
    console.log('\nOK — users seed complete. Login password for seeded accounts:', password);
  } finally {
    await pool.end();
  }
})();
