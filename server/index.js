require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const cors = require('cors');

const {
  createPoolFromEnv,
  selectUserByEmailOrStudentIdCredentials,
  selectUserPublicById,
  insertRegisteredStudent,
  insertRegisteredInstructor,
  updateUserPatch,
  changePassword,
  existsConflictRegister,
  existsConflictEmail,
  selectBookstoreBooks,
  selectBookstoreBookById,
  checkoutBookstoreLines,
  selectBookstoreMyLibrary,
  selectBookstorePurchaseHistory,
  selectAdminBookstoreInventory,
  selectAdminBookstoreStats,
  insertBookstoreBook,
  updateBookstoreBook
} = require('./db');

const {
  selectCoursesCatalog,
  selectCourseOverviewForPublic,
  selectCourseWithAccess,
  isCourseEnrolled,
  insertEnrollment,
  selectStudentEnrolledCourses,
  selectModuleTitles,
  selectModulesForLearning,
  selectQuizForStudent,
  gradeQuizAnswers,
  selectInstructorCourses,
  createCourse,
  replaceCourseContent,
  replaceCourseContentAdmin,
  selectCourseForEdit,
  selectCourseForEditAdmin,
  adminListCourses,
  adminPatchCourseStatus,
  moduleBelongsToCourse,
  assertInstructorOwnsCourse,
  deleteCourseByOwner,
  instructorExists,
  listInstructorsBrief,
  selectCompletedModuleIdsForCourse,
  setStudentModuleCompletion,
  findUserByEmailForRoster,
  insertCourseMemberByOwner,
  removeCourseMemberByOwner,
  selectInstructorCourseRoster,
  selectTeachingTeamForCourse
} = require('./coursesRepo');

const {
  signPayload,
  verifyToken,
  parseCookieValue,
  setSessionCookie,
  clearSessionCookie,
  portalSecret
} = require('./session');
const DATABASE_URL = process.env.DATABASE_URL || '';
const pool = createPoolFromEnv();
const PORT = Number(process.env.PORT || 3000);

const STUDENT_DASHBOARD = '/student/student/dashboard/student_dashboard_new.html';
const INSTRUCTOR_DASHBOARD = '/instructor/instructor/Dashboard/main%20page/instructor_dashboard.html';
const ADMIN_DASHBOARD = '/admin/admin/Dashboard/admin_dashboard.html';
const LOGIN_HTML = '/landing/landing/login.html';
const LANDING_INDEX_HTML = '/landing/landing/index.html';

function dashboardForRole (role) {
  if (role === 'instructor') return INSTRUCTOR_DASHBOARD;
  if (role === 'admin') return ADMIN_DASHBOARD;
  return STUDENT_DASHBOARD;
}

function isAllowedLoginEmail (email) {
  const e = String(email || '').toLowerCase();
  return e.endsWith('@student.uts.edu.my') || e.endsWith('@uts.edu.my');
}

/** Staff signup: plain @uts.edu.my, excluding student subdomain. */
function isStaffRegistrationEmail (email) {
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  return e.endsWith('@uts.edu.my') && !e.endsWith('@student.uts.edu.my');
}

function dbReady () {
  return !!(pool && DATABASE_URL);
}

async function readSessionUser (req) {
  if (!dbReady()) return null;
  const raw = parseCookieValue(req.headers.cookie || '');
  if (!raw) return null;
  const sess = verifyToken(raw);
  if (!sess?.uid) return null;
  return selectUserPublicById(pool, sess.uid);
}

async function requireRoles (req, res, allowed) {
  const me = await readSessionUser(req);
  if (!me) {
    res.status(401).json({ error: 'Not signed in' });
    return null;
  }
  if (!allowed.includes(me.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return me;
}

async function canAccessCourseMaterial (pool, user, courseId) {
  const full = await selectCourseWithAccess(pool, courseId, user.id, user.role);
  if (!full) return null;
  if (user.role === 'admin') return full;
  if (full.instructor_id === user.id) return full;
  const enr = await isCourseEnrolled(pool, user.id, courseId);
  if (!enr) return null;
  return full;
}

async function requireAdminSession (req, res) {
  const me = await readSessionUser(req);
  if (!me) {
    res.status(401).json({ error: 'Not signed in' });
    return null;
  }
  if (me.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return null;
  }
  return me;
}
function bookstoreRowAdmin (row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    author: row.author || '',
    price_rm: Number(row.price_rm),
    category: row.category,
    image_url: row.image_url,
    badge: row.badge || null,
    description: row.description || '',
    reader_json: row.reader_json || null,
    sort_order: row.sort_order,
    sku: row.sku || null,
    is_published: row.is_published !== false,
    sale_count: Number(row.sale_count || 0),
    revenue_rm: Number(row.revenue_rm || 0)
  };
}

const app = express();
app.disable('etag');
const ROOT = path.join(__dirname, '..');

/**
 * Served as static files. Primary pool matches seed/courses and student URLs: /assets/sample-files/*
 * Secondary: instructor-local folder from the earlier dropdown iteration.
 */
const SAMPLE_FILE_SOURCES = [
  { diskDir: path.join(ROOT, 'assets', 'sample-files'), urlBase: '/assets/sample-files/' },
  {
    diskDir: path.join(ROOT, 'instructor', 'instructor', 'assets', 'sample_files'),
    urlBase: '/instructor/instructor/assets/sample_files/'
  }
];

async function listSampleFilesForInstructorDropdown () {
  const byBasename = new Map();
  for (const src of SAMPLE_FILE_SOURCES) {
    let dirents = [];
    try {
      dirents = await fs.readdir(src.diskDir, { withFileTypes: true });
    } catch (err) {
      if (err && err.code === 'ENOENT') continue;
      throw err;
    }
    for (let i = 0; i < dirents.length; i++) {
      const d = dirents[i];
      if (!d || !d.isFile()) continue;
      const bn = String(d.name || '');
      if (!bn || bn === '.gitkeep' || bn.startsWith('.') || bn.endsWith('.tmp')) continue;
      const full = path.join(src.diskDir, bn);
      if (byBasename.has(bn)) continue;
      const stat = await fs.stat(full);
      byBasename.set(bn, {
        name: bn,
        url: src.urlBase + encodeURIComponent(bn),
        size_bytes: stat.size || 0,
        size_label: bytesToLabel(stat.size || 0)
      });
    }
  }
  const filesOut = [...byBasename.values()];
  filesOut.sort(function (a, b) {
    return String(a.name).localeCompare(String(b.name));
  });
  return filesOut;
}

function bytesToLabel (n) {
  const b = typeof n === 'number' ? n : 0;
  if (b <= 0) return '—';
  const u = ['B', 'KB', 'MB', 'GB'];
  let v = b;
  let i = 0;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  const d = i === 0 ? String(Math.round(v)) : v.toFixed(v >= 10 || i === 1 ? 0 : 1);
  return d + ' ' + u[i];
}

app.use(
  cors({
    origin (origin, cb) {
      cb(null, true);
    },
    credentials: true
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.redirect(302, '/landing/landing/index.html');
});

app.get('/api/health', (_req, res) => {
  const secret = portalSecret();
  res.json({
    ok: true,
    postgresOnlyAuth: true,
    databaseConnected: dbReady(),
    sessionSecretStrong: !!(secret && secret.length >= 16)
  });
});

app.get('/api/auth/session', async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(500).json({ error: 'Server missing DATABASE_URL' });
    }
    const raw = parseCookieValue(req.headers.cookie || '');
    const sess = raw ? verifyToken(raw) : null;
    if (!sess?.uid) {
      return res.status(401).json({ error: 'Not signed in' });
    }
    const profile = await selectUserPublicById(pool, sess.uid);
    if (!profile) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Session invalid' });
    }
    return res.json({
      user: {
        id: profile.id,
        email: profile.email,
        updated_at: profile.updated_at
      },
      profile
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const { emailOrId, password } = req.body || {};
  if (!emailOrId || !password) {
    return res.status(400).json({ error: 'Email (or Student ID) and password are required' });
  }

  const raw = String(emailOrId).trim();

  try {
    const isEmailLike = raw.includes('@');
    if (isEmailLike && !isAllowedLoginEmail(raw.toLowerCase())) {
      return res.status(400).json({ error: 'Access restricted to UTS university emails' });
    }

    if (!isEmailLike) {
      const v = raw.toLowerCase();
      if (!/^[a-z]{3}\d{8}$/.test(v)) {
        return res.status(400).json({ error: 'Invalid student ID format' });
      }
    }

    const cred = await selectUserByEmailOrStudentIdCredentials(pool, raw, String(password));
    const row = cred.rows[0];
    if (!row || !isAllowedLoginEmail(String(row.email))) {
      return res.status(401).json({ error: 'Invalid email / student ID or password' });
    }

    const token = signPayload(row.id);
    setSessionCookie(res, token);
    const role = row.role || 'student';
    return res.json({ redirect: dashboardForRole(role) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/auth/register', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const body = req.body || {};
  const role = String(body.role || 'student').toLowerCase() === 'instructor' ? 'instructor' : 'student';
  const {
    email,
    password,
    firstName,
    lastName,
    studentId,
    yearOfStudy,
    faculty,
    instructorTitle,
    bio
  } = body;

  const e = String(email || '').trim().toLowerCase();
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const fn = String(firstName || '').trim();
  const ln = String(lastName || '').trim();
  if (fn.length < 1 || ln.length < 1) {
    return res.status(400).json({ error: 'First and last name are required' });
  }

  if (role === 'instructor') {
    if (!isStaffRegistrationEmail(e)) {
      return res.status(400).json({
        error: 'Instructor registration requires a valid UTS staff email (e.g. name@uts.edu.my, not @student.uts.edu.my)'
      });
    }
    if (!faculty || typeof faculty !== 'string') {
      return res.status(400).json({ error: 'School / department is required' });
    }
    const title = String(instructorTitle || '').trim();
    if (title.length < 1) {
      return res.status(400).json({ error: 'Academic title is required' });
    }
    const bioTrim = String(bio || '').trim();
    if (bioTrim.length > 2000) {
      return res.status(400).json({ error: 'Bio is too long' });
    }

    try {
      if (await existsConflictEmail(pool, e)) {
        return res.status(409).json({ error: 'This email is already registered' });
      }

      const created = await insertRegisteredInstructor(pool, {
        email: e,
        password: String(password),
        firstName: fn,
        lastName: ln,
        faculty: String(faculty).trim(),
        instructorTitle: title,
        bio: bioTrim
      });
      if (!created) {
        return res.status(500).json({ error: 'Could not create account' });
      }

      const token = signPayload(created.id);
      setSessionCookie(res, token);

      return res.json({
        ok: true,
        session: true,
        redirect: dashboardForRole(created.role || 'instructor')
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'This email is already registered' });
      }
      console.error(err);
      return res.status(500).json({ error: String(err.message || err) });
    }
  }

  if (
    !e ||
    !e.endsWith('@student.uts.edu.my') ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  ) {
    return res.status(400).json({ error: 'Registration requires a valid @student.uts.edu.my email' });
  }
  const sid = String(studentId || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{3}\d{8}$/.test(sid)) {
    return res.status(400).json({ error: 'Invalid student ID format' });
  }
  const year = Number(yearOfStudy);
  if (!Number.isInteger(year) || year < 1 || year > 4) {
    return res.status(400).json({ error: 'Invalid year of study' });
  }
  if (!faculty || typeof faculty !== 'string') {
    return res.status(400).json({ error: 'Faculty is required' });
  }

  try {
    if (await existsConflictRegister(pool, e, sid)) {
      return res.status(409).json({ error: 'This student ID or email is already registered' });
    }

    const created = await insertRegisteredStudent(pool, {
      email: e,
      password: String(password),
      studentIdUpper: sid,
      firstName: fn,
      lastName: ln,
      year,
      faculty: String(faculty).trim()
    });
    if (!created) {
      return res.status(500).json({ error: 'Could not create account' });
    }

    const token = signPayload(created.id);
    setSessionCookie(res, token);

    return res.json({
      ok: true,
      session: true,
      redirect: dashboardForRole(created.role || 'student')
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This student ID or email is already registered' });
    }
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

app.get('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.redirect(302, LANDING_INDEX_HTML);
});

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.patch('/api/profile', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const me = await readSessionUser(req);
  if (!me) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  try {
    const data = await updateUserPatch(pool, me.id, req.body || {});
    if (!data) return res.status(400).json({ error: 'Nothing to update' });
    return res.json({ profile: data });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Student ID already in use' });
    }
    console.error(err);
    return res.status(400).json({ error: String(err.message || err) });
  }
});

function bookstoreRowPublic (row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    author: row.author || '',
    price_rm: Number(row.price_rm),
    category: row.category,
    image_url: row.image_url,
    badge: row.badge || null,
    description: row.description || '',
    reader_json: row.reader_json || null,
    sort_order: row.sort_order,
    ...(row.purchased_at != null
      ? {
          purchased_at: row.purchased_at,
          amount_rm: row.amount_rm != null ? Number(row.amount_rm) : null
        }
      : {})
  };
}

/** Public catalog listing */
app.get('/api/bookstore/books', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  try {
    const limit = req.query.limit;
    const books = await selectBookstoreBooks(pool, {
      limit: limit != null && limit !== '' ? Number(limit) : undefined
    });
    return res.json({ books: books.map(bookstoreRowPublic) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

/** Single book (detail pages) */
app.get('/api/bookstore/books/:id', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  try {
    const row = await selectBookstoreBookById(pool, req.params.id);
    if (!row) return res.status(404).json({ error: 'Book not found' });
    return res.json({ book: bookstoreRowPublic(row) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/bookstore/my-library', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Not signed in' });
  try {
    const rows = await selectBookstoreMyLibrary(pool, me.id);
    return res.json({ books: rows.map(bookstoreRowPublic) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/bookstore/purchase-history', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Not signed in' });
  try {
    const rows = await selectBookstorePurchaseHistory(pool, me.id);
    return res.json({
      purchases: rows.map((r) => ({
        id: r.purchase_id,
        purchased_at: r.purchased_at,
        amount_rm: Number(r.amount_rm),
        title: r.book_title
      }))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

/** Admin: bookstore catalogue (session + role=admin) */
app.get('/api/admin/bookstore/stats', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const s = await selectAdminBookstoreStats(pool);
    const total = Number(s.total_books || 0);
    const pub = Number(s.published_books || 0);
    return res.json({
      total_books: total,
      published_books: pub,
      draft_books: Math.max(0, total - pub),
      mtd_revenue_rm: Number(s.mtd_revenue_rm || 0)
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/admin/bookstore/books', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const rows = await selectAdminBookstoreInventory(pool);
    return res.json({ books: rows.map(bookstoreRowAdmin) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/admin/bookstore/books', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const row = await insertBookstoreBook(pool, req.body || {});
    return res.status(201).json({
      book: bookstoreRowAdmin({ ...row, sale_count: 0, revenue_rm: 0 })
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.patch('/api/admin/bookstore/books/:id', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const row = await updateBookstoreBook(pool, req.params.id, req.body || {});
    if (!row) return res.status(404).json({ error: 'Book not found' });
    return res.json({ ok: true, book: row });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.post('/api/bookstore/checkout', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Not signed in' });
  const { lines } = req.body || {};
  if (!Array.isArray(lines) || !lines.length) {
    return res.status(400).json({ error: 'lines array with bookId and qty required' });
  }
  try {
    const merged = new Map();
    for (const ln of lines) {
      const bookId = String(ln.bookId || '').trim();
      if (!bookId) continue;
      const qty = Math.max(1, Math.floor(Number(ln.qty) || 1));
      merged.set(bookId, (merged.get(bookId) || 0) + qty);
    }
    const normalized = [...merged.entries()].map(([bookId, qty]) => ({ bookId, qty }));
    if (!normalized.length) {
      return res.status(400).json({ error: 'No valid book ids in lines' });
    }
    const result = await checkoutBookstoreLines(pool, me.id, normalized);
    const orderRef = `${Date.now()}-${me.id.slice(0, 8)}`;
    const tax = +(result.total_rm * 0.07).toFixed(2);
    const grand = +(result.total_rm + tax).toFixed(2);
    return res.json({
      ok: true,
      order_ref: orderRef,
      subtotal_rm: result.total_rm,
      tax_rm: tax,
      total_rm: grand,
      lines_applied: result.inserted
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/auth/password', async (req, res) => {
  if (!dbReady()) {
    return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  }
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Not signed in' });

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  try {
    const ok = await changePassword(pool, me.id, String(currentPassword), String(newPassword));
    if (!ok) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

/* --- Courses (catalog, student, instructor, admin) --- */
app.get('/api/courses/catalog', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  try {
    const { rows, total, totalPages, page, limit } = await selectCoursesCatalog(pool, {
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      q: req.query.q
    });
    return res.json({
      courses: rows.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        faculty: c.faculty,
        category: c.category,
        thumbnail_url: c.thumbnail_url,
        updated_at: c.updated_at,
        instructor_display: `${c.instructor_first_name || ''} ${c.instructor_last_name || ''}`.trim(),
        enrollment_count: c.enrollment_count,
        module_count: c.module_count
      })),
      total,
      total_pages: totalPages,
      page,
      limit
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/courses/:courseId/overview', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  try {
    const ov = await selectCourseOverviewForPublic(pool, req.params.courseId);
    if (!ov) return res.status(404).json({ error: 'Course not found' });
    const modules = await selectModuleTitles(pool, req.params.courseId);
    const me = await readSessionUser(req);
    let enrolled = false;
    if (me && me.role === 'student') {
      enrolled = await isCourseEnrolled(pool, me.id, req.params.courseId);
    }
    const teaching_team = await selectTeachingTeamForCourse(pool, req.params.courseId);
    return res.json({
      course: {
        id: ov.id,
        title: ov.title,
        description: ov.description,
        faculty: ov.faculty,
        category: ov.category,
        thumbnail_url: ov.thumbnail_url,
        enrollment_count: ov.enrollment_count,
        instructor_display: `${ov.instructor_first_name || ''} ${ov.instructor_last_name || ''}`.trim(),
        instructor_title: ov.instructor_title
      },
      teaching_team,
      modules: modules.map((m) => ({
        id: m.id,
        title: m.title,
        sort_order: m.sort_order,
        excerpt: String(m.description || '').slice(0, 280)
      })),
      enrolled
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/courses/:courseId/learn', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Sign in required' });
  try {
    const cid = req.params.courseId;
    const access = await canAccessCourseMaterial(pool, me, cid);
    if (!access) return res.status(403).json({ error: 'No access' });
    const mods = await selectModulesForLearning(pool, cid);

    const enr = await isCourseEnrolled(pool, me.id, cid);
    const role = String(me.role || '').toLowerCase();
    /** Prefer role + enrollment: students who can reach this screen are learners; instructors only if roster-enrolled. */
    const canTrackModuleProgress = role === 'student' || !!enr;

    let progressPercent = 0;
    let completedModuleIds = [];
    if (enr) {
      completedModuleIds = await selectCompletedModuleIdsForCourse(pool, me.id, cid);
      const { rows: pr } = await pool.query(
        `SELECT COALESCE(progress_percent, 0)::int AS p FROM public.course_enrollments
         WHERE user_id = $1::uuid AND course_id = $2::uuid`,
        [me.id, cid]
      );
      progressPercent = Number(pr[0]?.p || 0);
    }

    let enrolledCourses = [];
    if (canTrackModuleProgress) {
      enrolledCourses = await selectStudentEnrolledCourses(pool, me.id);
    }

    const completedSet = new Set(completedModuleIds);
    const teaching_team = await selectTeachingTeamForCourse(pool, cid);

    return res.json({
      course_id: cid,
      course_title: access.title,
      course_description: String(access.description || ''),
      thumbnail_url: access.thumbnail_url,
      status: access.status,
      progress_percent: progressPercent,
      can_track_module_progress: canTrackModuleProgress,
      enrolled_courses: enrolledCourses.map((r) => ({
        id: r.id,
        title: r.title,
        thumbnail_url: r.thumbnail_url,
        progress_percent: r.progress_percent
      })),
      teaching_team,
      modules: mods.map((m) => ({
        id: m.id,
        sort_order: m.sort_order,
        title: m.title,
        description: m.description,
        lecture_notes_summary: m.lecture_notes_summary,
        sample_files: m.sample_files,
        video_url: m.video_url,
        quiz_question_count: m.quiz_question_count,
        completed: completedSet.has(String(m.id))
      }))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/courses/:courseId/modules/:moduleId/quiz', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Sign in required' });
  try {
    const okMod = await moduleBelongsToCourse(pool, req.params.moduleId, req.params.courseId);
    if (!okMod) return res.status(404).json({ error: 'Module not found' });
    const access = await canAccessCourseMaterial(pool, me, req.params.courseId);
    if (!access) return res.status(403).json({ error: 'No access' });
    const questions = await selectQuizForStudent(pool, req.params.moduleId);
    const { rows } = await pool.query(
      `SELECT title FROM public.course_modules WHERE id = $1::uuid`,
      [req.params.moduleId]
    );
    return res.json({ module_title: rows[0]?.title || 'Quiz', questions });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/courses/:courseId/modules/:moduleId/quiz/submit', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Sign in required' });
  try {
    const okMod = await moduleBelongsToCourse(pool, req.params.moduleId, req.params.courseId);
    if (!okMod) return res.status(404).json({ error: 'Module not found' });
    const access = await canAccessCourseMaterial(pool, me, req.params.courseId);
    if (!access) return res.status(403).json({ error: 'No access' });
    const body = req.body || {};
    const answers = typeof body.answers === 'object' && body.answers ? body.answers : {};
    const result = await gradeQuizAnswers(pool, req.params.moduleId, answers);
    return res.json({
      ok: true,
      total: result.total,
      correct: result.correct,
      percent: result.percent,
      pass: result.percent >= 60
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/courses/:courseId/modules/:moduleId/complete', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Sign in required' });
  try {
    const cid = req.params.courseId;
    const mid = req.params.moduleId;
    const access = await canAccessCourseMaterial(pool, me, cid);
    if (!access) return res.status(403).json({ error: 'No access' });
    if (!(await isCourseEnrolled(pool, me.id, cid))) {
      return res.status(403).json({ error: 'Enroll in this course to track progress' });
    }
    const body = req.body || {};
    const done = !!(body.done === true || body.completed === true);
    const snap = await setStudentModuleCompletion(pool, me.id, cid, mid, done);
    if (!snap) return res.status(404).json({ error: 'Module not found in this course' });
    return res.json({ ok: true, progress_percent: snap.progress_percent, modules_completed: snap.modules_completed });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/student/courses/enrolled', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await readSessionUser(req);
  if (!me) return res.status(401).json({ error: 'Not signed in' });
  if (me.role !== 'student') return res.json({ courses: [] });
  try {
    const rows = await selectStudentEnrolledCourses(pool, me.id);
    return res.json({ courses: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/student/courses/:courseId/enroll', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['student']);
  if (!me) return;
  try {
    const ins = await insertEnrollment(pool, me.id, req.params.courseId);
    if (!ins) {
      const already =
        me && (await isCourseEnrolled(pool, me.id, req.params.courseId));
      if (!already) {
        return res.status(400).json({ error: 'Course is not available for enrollment' });
      }
      return res.json({ ok: true, enrolled: true, already_member: true });
    }
    return res.json({ ok: true, enrolled: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/instructor/courses', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const rows = await selectInstructorCourses(pool, me.id);
    let totalEnrolled = 0;
    rows.forEach((r) => {
      totalEnrolled += Number(r.enrollment_count || 0);
    });
    const { rows: avgRow } = await pool.query(
      `SELECT COALESCE(ROUND(AVG(e.progress_percent)), 0)::int AS a
       FROM public.course_enrollments e
       INNER JOIN public.courses c ON c.id = e.course_id AND c.instructor_id = $1::uuid`,
      [me.id]
    );
    const avgCompletion = Number(avgRow[0]?.a || 0);

    return res.json({
      summary: {
        total_courses: rows.length,
        total_enrolled: totalEnrolled,
        avg_completion_display: rows.length ? `${avgCompletion}%` : '0%'
      },
      courses: rows
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/instructor/courses', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const id = await createCourse(pool, me.id, req.body || {});
    if (!id) return res.status(500).json({ error: 'Create failed' });
    return res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.get('/api/instructor/courses/:courseId/edit', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const data = await selectCourseForEdit(pool, me.id, req.params.courseId);
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.put('/api/instructor/courses/:courseId', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const id = await replaceCourseContent(pool, me.id, req.params.courseId, req.body || {});
    if (!id) return res.status(404).json({ error: 'Not found or not yours' });
    return res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.patch('/api/instructor/courses/:courseId/status', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const owns = await assertInstructorOwnsCourse(pool, me.id, req.params.courseId);
    if (!owns) return res.status(404).json({ error: 'Not found' });
    const status = req.body?.status || req.body?.course_status;
    const st = typeof status === 'string' ? status.toLowerCase() : '';
    if (!['archived', 'draft', 'published'].includes(st)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { rows } = await pool.query(
      `UPDATE public.courses SET status = $2::text, updated_at = NOW() WHERE id = $1::uuid RETURNING id, status`,
      [req.params.courseId, st]
    );
    return res.json(rows[0] || {});
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.delete('/api/instructor/courses/:courseId', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const removed = await deleteCourseByOwner(pool, me.id, req.params.courseId);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/instructor/courses/:courseId/roster', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const cid = req.params.courseId;
    const data = await selectInstructorCourseRoster(pool, cid, me.id);
    if (!data) return res.status(404).json({ error: 'Not found or not your course' });
    const { rows: tr } = await pool.query(`SELECT title FROM public.courses WHERE id = $1::uuid LIMIT 1`, [cid]);
    return res.json({ course_id: cid, course_title: tr[0]?.title || '', ...data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/instructor/courses/:courseId/members', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const email = String(req.body?.email || '').trim();
    if (!email) return res.status(400).json({ error: 'email is required' });
    const userRow = await findUserByEmailForRoster(pool, email);
    if (!userRow) return res.status(404).json({ error: 'No user with this email' });
    const cid = req.params.courseId;
    const out = await insertCourseMemberByOwner(pool, me.id, cid, userRow.id);
    if (!out.ok) {
      if (out.error === 'forbidden') return res.status(404).json({ error: 'Not found or not your course' });
      if (out.error === 'archived') return res.status(400).json({ error: 'Cannot add members to an archived course' });
      return res.status(400).json({ error: out.error || 'Add failed' });
    }
    return res.json({
      ok: true,
      added: !!out.inserted,
      already_member: !!out.already_member,
      user: { id: userRow.id, email: userRow.email, role: userRow.role }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.delete('/api/instructor/courses/:courseId/members/:userId', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const cid = req.params.courseId;
    const uid = req.params.userId;
    const gone = await removeCourseMemberByOwner(pool, me.id, cid, uid);
    if (!gone) return res.status(404).json({ error: 'Member not removed (not found, or protected)' });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/instructor/sample-files', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const me = await requireRoles(req, res, ['instructor']);
  if (!me) return;
  try {
    const filesOut = await listSampleFilesForInstructorDropdown();
    return res.json({ files: filesOut });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/admin/courses', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const { rows, total, page, limit } = await adminListCourses(pool, {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status
    });
    return res.json({
      courses: rows,
      total,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      page,
      limit
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.patch('/api/admin/courses/:courseId/status', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const updated = await adminPatchCourseStatus(pool, req.params.courseId, req.body?.status);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.get('/api/admin/instructors', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const rows = await listInstructorsBrief(pool);
    return res.json({ instructors: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/admin/courses', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const instructorId = String(req.body?.instructor_id || '').trim();
    if (!instructorId) return res.status(400).json({ error: 'instructor_id is required' });
    const okIns = await instructorExists(pool, instructorId);
    if (!okIns) return res.status(400).json({ error: 'Invalid instructor user id' });
    const id = await createCourse(pool, instructorId, {
      title: String(req.body?.title || '').trim() || 'New course',
      description: String(req.body?.description || '').trim()
    });
    if (!id) return res.status(500).json({ error: 'Create failed' });
    return res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.get('/api/admin/courses/:courseId/edit', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const data = await selectCourseForEditAdmin(pool, req.params.courseId);
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.message || e) });
  }
});

app.put('/api/admin/courses/:courseId', async (req, res) => {
  if (!dbReady()) return res.status(500).json({ error: 'Server missing DATABASE_URL' });
  const admin = await requireAdminSession(req, res);
  if (!admin) return;
  try {
    const id = await replaceCourseContentAdmin(pool, req.params.courseId, req.body || {});
    if (!id) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

app.use(express.static(ROOT, { extensions: ['html'], index: false }));

const server = app.listen(PORT, () => {
  console.log(`CuratorEdu server at http://localhost:${PORT} (landing home / → /landing/landing/index.html)`);
  console.log(`Open login: http://localhost:${PORT}${LOGIN_HTML}`);
  if (!DATABASE_URL || !pool) console.warn('Set DATABASE_URL in .env.');
  const s = portalSecret();
  console.log(
    s && s.length >= 16
      ? 'PORTAL_SESSION_SECRET is configured.'
      : 'Warning: set PORTAL_SESSION_SECRET (≥16 chars) for production.'
  );
  console.log('Press Ctrl+C to stop.');
});

let shuttingDown = false;

function shutdown () {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\nStopping server…');

  server.close(async () => {
    try {
      if (pool) await pool.end();
    } catch (e) {
      console.warn(e.message);
    }
    process.exit(0);
  });

  if (typeof server.closeAllConnections === 'function') {
    server.closeAllConnections();
  } else if (typeof server.closeIdleConnections === 'function') {
    server.closeIdleConnections();
  }
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
