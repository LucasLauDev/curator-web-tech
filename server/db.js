const { Pool } = require('pg');

function createPoolFromEnv () {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  const needsSsl =
    /supabase\.co|pooler\.supabase\.com/i.test(connectionString) ||
    process.env.DATABASE_SSL === 'true';
  return new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
    max: 10
  });
}

/** Public-safe row (omit password_hash) */
function stripSecret (row) {
  if (!row) return null;
  const o = { ...row };
  delete o.password_hash;
  return o;
}

const USER_PUBLIC_SELECT =
  `id, email, student_id::text AS student_id, role, first_name, last_name, year_of_study,
   faculty, bio, instructor_title, created_at, updated_at`;

/**
 * @returns {Promise<import('pg').QueryResult>}
 */
async function selectUserByEmailOrStudentIdCredentials (pool, emailOrStudentIdTrimmed, password) {
  const raw = emailOrStudentIdTrimmed.trim();
  if (raw.includes('@')) {
    return pool.query(
      `SELECT * FROM public.users WHERE lower(trim(email)) = lower(trim($1::text)) AND crypt($2::text, password_hash) = password_hash LIMIT 1`,
      [raw, password]
    );
  }
  return pool.query(
    `SELECT * FROM public.users WHERE UPPER(regexp_replace(trim(student_id), '\\s+', '', 'g')) = upper(regexp_replace(trim($1::text), '\\s+', '', 'g')) AND crypt($2::text, password_hash) = password_hash LIMIT 1`,
    [raw, password]
  );
}

async function selectUserPublicById (pool, userId) {
  const { rows } = await pool.query(
    `SELECT ${USER_PUBLIC_SELECT} FROM public.users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  return stripSecret(rows[0]) || null;
}

async function existsConflictRegister (pool, emailLower, studentIdUpper) {
  const { rows } = await pool.query(
    `SELECT id FROM public.users WHERE lower(trim(email)) = lower(trim($1::text))
      OR upper(regexp_replace(trim(student_id), '\\s+', '', 'g')) = upper(regexp_replace(trim($2::text), '\\s+', '', 'g'))
     LIMIT 1`,
    [emailLower, studentIdUpper]
  );
  return !!rows?.length;
}

/** Email-only conflict check (e.g. instructor signup with no student_id). */
async function existsConflictEmail (pool, emailLower) {
  const { rows } = await pool.query(
    `SELECT id FROM public.users WHERE lower(trim(email)) = lower(trim($1::text)) LIMIT 1`,
    [emailLower]
  );
  return !!rows?.length;
}

async function insertRegisteredStudent (
  pool,
  { email, password, studentIdUpper, firstName, lastName, year, faculty }
) {
  const sql = `
    INSERT INTO public.users (
      email, student_id, password_hash, role,
      first_name, last_name, year_of_study, faculty, bio, instructor_title
    )
    VALUES (
      lower(trim($1::text)),
      upper(regexp_replace(trim($2::text), '\\s+', '', 'g')),
      crypt($3::text, gen_salt('bf')),
      'student',
      $4, $5, $6::smallint, trim($7::text),
      NULL, NULL
    )
    RETURNING ${USER_PUBLIC_SELECT}`;

  const { rows } = await pool.query(sql, [
    email,
    studentIdUpper,
    password,
    firstName,
    lastName,
    year,
    faculty
  ]);
  return stripSecret(rows[0]) || null;
}

async function insertRegisteredInstructor (
  pool,
  { email, password, firstName, lastName, faculty, instructorTitle, bio }
) {
  const sql = `
    INSERT INTO public.users (
      email, student_id, password_hash, role,
      first_name, last_name, year_of_study, faculty, bio, instructor_title
    )
    VALUES (
      lower(trim($1::text)),
      NULL,
      crypt($2::text, gen_salt('bf')),
      'instructor',
      $3, $4,
      NULL,
      trim($5::text),
      NULLIF(trim($6::text), ''),
      NULLIF(trim($7::text), '')
    )
    RETURNING ${USER_PUBLIC_SELECT}`;

  const { rows } = await pool.query(sql, [
    email,
    password,
    firstName,
    lastName,
    faculty,
    bio || '',
    instructorTitle
  ]);
  return stripSecret(rows[0]) || null;
}

const PATCHABLE = new Set([
  'first_name',
  'last_name',
  'student_id',
  'year_of_study',
  'faculty',
  'bio',
  'instructor_title'
]);

async function updateUserPatch (pool, userId, body) {
  const payload = {};
  for (const k of PATCHABLE) {
    if (Object.prototype.hasOwnProperty.call(body, k)) payload[k] = body[k];
  }
  if (!Object.keys(payload).length) return null;

  if (payload.student_id) {
    payload.student_id = String(payload.student_id).replace(/\s+/g, '').toUpperCase();
  }
  if (payload.year_of_study !== undefined && payload.year_of_study !== null) {
    payload.year_of_study = Number(payload.year_of_study);
  }
  payload.updated_at = new Date().toISOString();

  const keys = Object.keys(payload);
  const values = keys.map((k) => payload[k]);
  const setParts = keys.map((k, i) => `"${k}" = $${i + 2}`);

  const sql = `
    UPDATE public.users SET ${setParts.join(', ')}
    WHERE id = $1
    RETURNING ${USER_PUBLIC_SELECT}`;

  const { rows } = await pool.query(sql, [userId, ...values]);
  return stripSecret(rows[0]) || null;
}

async function changePassword (pool, userId, currentPassword, newPassword) {
  const { rows, rowCount } = await pool.query(
    `
    UPDATE public.users SET
      password_hash = crypt($1::text, gen_salt('bf')),
      updated_at = NOW()
    WHERE id = $2 AND crypt($3::text, password_hash) = password_hash
    RETURNING id`,
    [newPassword, userId, currentPassword]
  );
  return rowCount > 0 ? rows[0] : null;
}

/** Seed CLI upsert — postgres only; returns public id/email/role/student_id (no hash). */
async function upsertSeedUser (
  pool,
  {
    email,
    studentId,
    passwordPlain,
    role,
    firstName,
    lastName,
    yearStudy,
    faculty,
    instructorTitle
  }
) {
  const { rows } = await pool.query(
    `
    INSERT INTO public.users (
      email, student_id, password_hash, role, first_name, last_name, year_of_study,
      faculty, instructor_title
    )
    VALUES (
      lower(trim($1::text)),
      $2::text,
      crypt($3::text, gen_salt('bf')),
      $4::text,
      $5::text,
      $6::text,
      $7::smallint,
      $8::text,
      $9::text
    )
    ON CONFLICT (email) DO UPDATE SET
      student_id = EXCLUDED.student_id,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      year_of_study = EXCLUDED.year_of_study,
      faculty = EXCLUDED.faculty,
      instructor_title = EXCLUDED.instructor_title,
      updated_at = NOW()
    RETURNING id, email, role, student_id::text AS student_id`,
    [
      email,
      studentId,
      passwordPlain,
      role,
      firstName,
      lastName,
      yearStudy,
      faculty,
      instructorTitle
    ]
  );
  return rows[0] || null;
}

/**
 * Bookstore catalog (REST-backed UI).
 */
async function selectBookstoreBooks (pool, { limit } = {}) {
  const lim = Number(limit);
  const cap = Number.isFinite(lim) && lim > 0 ? Math.min(lim, 500) : 500;
  const { rows } = await pool.query(
    `SELECT id, title, author, price_rm, category, image_url, badge, description,
            reader_json, sort_order
     FROM public.bookstore
     WHERE is_published = true
     ORDER BY sort_order ASC, title ASC
     LIMIT $1::integer`,
    [cap]
  );
  return rows;
}

async function selectBookstoreBookById (pool, bookId) {
  const { rows } = await pool.query(
    `SELECT id, title, author, price_rm, category, image_url, badge, description, reader_json, sort_order
     FROM public.bookstore WHERE id = $1 AND is_published = true LIMIT 1`,
    [bookId]
  );
  return rows[0] || null;
}

const BOOKSTORE_ALLOWED_CATEGORY = new Set([
  'business',
  'design',
  'tech',
  'self-help',
  'philosophy'
]);

function normalizeBookstoreCategory (cat) {
  const c = String(cat || '').toLowerCase().trim();
  if (BOOKSTORE_ALLOWED_CATEGORY.has(c)) return c;
  return null;
}

async function selectAdminBookstoreInventory (pool) {
  const { rows } = await pool.query(
    `
    SELECT b.id, b.title, b.author, b.price_rm, b.category, b.image_url, b.badge,
           b.description, b.reader_json, b.sort_order, b.is_published, b.sku,
           COALESCE(p.sale_count, 0)::integer AS sale_count,
           COALESCE(p.revenue_rm, 0)::numeric AS revenue_rm
    FROM public.bookstore b
    LEFT JOIN (
      SELECT bookstore_id,
             COUNT(*)::integer AS sale_count,
             SUM(amount_rm)::numeric AS revenue_rm
      FROM public.bookstore_purchase
      GROUP BY bookstore_id
    ) p ON p.bookstore_id = b.id
    ORDER BY b.sort_order ASC, b.title ASC`
  );
  return rows;
}

async function selectAdminBookstoreStats (pool) {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::bigint FROM public.bookstore) AS total_books,
      (SELECT COUNT(*)::bigint FROM public.bookstore WHERE is_published = true) AS published_books,
      (SELECT COALESCE(SUM(amount_rm), 0)::numeric FROM public.bookstore_purchase
       WHERE purchased_at >= date_trunc('month', timezone('utc', now())::timestamptz)
      ) AS mtd_revenue_rm
  `);
  return rows[0] || { total_books: 0, published_books: 0, mtd_revenue_rm: 0 };
}

async function insertBookstoreBook (pool, body) {
  const title = String(body.title || '').trim();
  const author = String(body.author || '').trim();
  const priceRm = Number(body.price_rm);
  const category = normalizeBookstoreCategory(body.category);
  const imageUrl = String(body.image_url || '').trim();
  if (!title || !category || !imageUrl || !Number.isFinite(priceRm) || priceRm < 0) {
    throw new Error('Invalid book fields: title, category, price_rm, image_url required');
  }
  const skuRaw = body.sku != null ? String(body.sku).trim() : '';
  const sku = skuRaw === '' ? null : skuRaw;
  const badge = body.badge != null && String(body.badge).trim() !== '' ? String(body.badge).trim() : null;
  const description =
    body.description != null ? String(body.description) : '';
  const sortOrder = Math.floor(Number(body.sort_order)) || 0;
  let readerJson = null;
  if (body.reader_json != null && body.reader_json !== '') {
    readerJson =
      typeof body.reader_json === 'object' ? JSON.stringify(body.reader_json) : String(body.reader_json);
  }
  const isPublished = body.is_published === false ? false : true;

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO public.bookstore (
        title, author, price_rm, category, image_url, badge, description,
        reader_json, sort_order, sku, is_published, updated_at
      )
      VALUES (
        $1, $2, $3::numeric, $4::text, $5, $6, $7,
        $8::jsonb, $9::integer, $10, $11::boolean, NOW()
      )
      RETURNING id, title, author, price_rm, category, image_url, badge, description, reader_json, sort_order,
                sku, is_published`,
      [
        title,
        author || '',
        priceRm,
        category,
        imageUrl,
        badge,
        description,
        readerJson,
        sortOrder,
        sku,
        isPublished
      ]
    );
    return rows[0] || null;
  } catch (e) {
    if (e.code === '23505') {
      throw new Error('SKU already in use');
    }
    throw e;
  }
}

async function updateBookstoreBook (pool, bookId, body) {
  const id = String(bookId || '').trim();
  if (!id) throw new Error('Missing book id');

  const patches = [];
  const vals = [];
  let i = 1;

  if (body.title !== undefined) {
    const t = String(body.title || '').trim();
    if (!t) throw new Error('Title cannot be empty');
    patches.push(`title = $${i++}`);
    vals.push(t);
  }
  if (body.author !== undefined) {
    patches.push(`author = $${i++}`);
    vals.push(String(body.author || ''));
  }
  if (body.price_rm !== undefined) {
    const p = Number(body.price_rm);
    if (!Number.isFinite(p) || p < 0) throw new Error('Invalid price');
    patches.push(`price_rm = $${i++}::numeric`);
    vals.push(p);
  }
  if (body.category !== undefined) {
    const c = normalizeBookstoreCategory(body.category);
    if (!c) throw new Error('Invalid category');
    patches.push(`category = $${i++}`);
    vals.push(c);
  }
  if (body.image_url !== undefined) {
    const u = String(body.image_url || '').trim();
    if (!u) throw new Error('Image URL cannot be empty');
    patches.push(`image_url = $${i++}`);
    vals.push(u);
  }
  if (body.badge !== undefined) {
    const b = body.badge == null || String(body.badge).trim() === '' ? null : String(body.badge).trim();
    patches.push(`badge = $${i++}`);
    vals.push(b);
  }
  if (body.description !== undefined) {
    patches.push(`description = $${i++}`);
    vals.push(body.description == null ? '' : String(body.description));
  }
  if (body.sort_order !== undefined) {
    patches.push(`sort_order = $${i++}::integer`);
    vals.push(Math.floor(Number(body.sort_order)) || 0);
  }
  if (body.sku !== undefined) {
    const s = body.sku == null ? null : String(body.sku).trim();
    patches.push(`sku = $${i++}`);
    vals.push(s === '' ? null : s);
  }
  if (body.is_published !== undefined) {
    patches.push(`is_published = $${i++}::boolean`);
    vals.push(!!body.is_published);
  }
  if (body.reader_json !== undefined) {
    let rj = null;
    if (body.reader_json != null && body.reader_json !== '') {
      rj =
        typeof body.reader_json === 'object'
          ? JSON.stringify(body.reader_json)
          : String(body.reader_json);
    }
    patches.push(`reader_json = $${i++}::jsonb`);
    vals.push(rj);
  }

  if (!patches.length) return null;

  patches.push('updated_at = NOW()');
  vals.push(id);

  const sql = `
    UPDATE public.bookstore SET ${patches.join(', ')}
    WHERE id = $${i}::uuid
    RETURNING id, title, author, price_rm, category, image_url, badge, description, reader_json, sort_order,
              sku, is_published`;

  try {
    const { rows, rowCount } = await pool.query(sql, vals);
    if (!rowCount) return null;
    return rows[0];
  } catch (e) {
    if (e.code === '23505') {
      throw new Error('SKU already in use');
    }
    throw e;
  }
}

async function checkoutBookstoreLines (pool, userId, lines) {
  if (!lines?.length) return { inserted: 0, total_rm: 0 };
  await pool.query('BEGIN');
  try {
    let n = 0;
    let totalRm = 0;
    for (const line of lines) {
      const bookId = line.bookId;
      const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
      if (!bookId) continue;
      const book = await selectBookstoreBookById(pool, bookId);
      if (!book) continue;
      const unit = Number(book.price_rm) || 0;
      const amount = +(unit * qty).toFixed(2);
      await pool.query(
        `INSERT INTO public.bookstore_purchase (user_id, bookstore_id, amount_rm)
         VALUES ($1::uuid, $2::uuid, $3::numeric)
         ON CONFLICT (user_id, bookstore_id) DO UPDATE SET
           amount_rm = public.bookstore_purchase.amount_rm + EXCLUDED.amount_rm,
           purchased_at = now()`,
        [userId, bookId, amount]
      );
      totalRm += amount;
      n += 1;
    }
    await pool.query('COMMIT');
    return { inserted: n, total_rm: +totalRm.toFixed(2) };
  } catch (e) {
    await pool.query('ROLLBACK');
    throw e;
  }
}

async function selectBookstoreMyLibrary (pool, userId) {
  const { rows } = await pool.query(
    `SELECT b.id, b.title, b.author, b.price_rm, b.category, b.image_url, b.badge, b.description,
            b.reader_json, bp.purchased_at, bp.amount_rm
     FROM public.bookstore_purchase bp
     INNER JOIN public.bookstore b ON b.id = bp.bookstore_id
     WHERE bp.user_id = $1::uuid
     ORDER BY bp.purchased_at DESC`,
    [userId]
  );
  return rows;
}

async function selectBookstorePurchaseHistory (pool, userId) {
  const { rows } = await pool.query(
    `SELECT bp.id AS purchase_id, bp.purchased_at, bp.amount_rm,
            b.title AS book_title
     FROM public.bookstore_purchase bp
     INNER JOIN public.bookstore b ON b.id = bp.bookstore_id
     WHERE bp.user_id = $1::uuid
     ORDER BY bp.purchased_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  createPoolFromEnv,
  stripSecret,
  selectUserByEmailOrStudentIdCredentials,
  selectUserPublicById,
  existsConflictRegister,
  existsConflictEmail,
  insertRegisteredStudent,
  insertRegisteredInstructor,
  updateUserPatch,
  changePassword,
  upsertSeedUser,
  selectBookstoreBooks,
  selectBookstoreBookById,
  checkoutBookstoreLines,
  selectBookstoreMyLibrary,
  selectBookstorePurchaseHistory,
  normalizeBookstoreCategory,
  selectAdminBookstoreInventory,
  selectAdminBookstoreStats,
  insertBookstoreBook,
  updateBookstoreBook
};
