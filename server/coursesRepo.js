/**
 * Courses / modules / enrollments / quizzes — used by Express with pg pool (bypasses RLS as DB owner).
 */
'use strict';

function normalizeCategory (cat) {
  const c = String(cat || '').toLowerCase().trim();
  if (['design', 'technology', 'business', 'general'].includes(c)) return c;
  return null;
}

function normalizeStatus (st) {
  const s = String(st || '').toLowerCase().trim();
  if (['draft', 'published', 'archived'].includes(s)) return s;
  return null;
}

async function selectCoursesCatalog (pool, opts) {
  const page = Math.max(1, Number.parseInt(String(opts.page || '1'), 10) || 1);
  const limit = Math.min(48, Math.max(1, Number.parseInt(String(opts.limit || '12'), 10) || 12));
  const offset = (page - 1) * limit;
  const conds = [`c.status = 'published'`];
  const vals = [];

  const catRaw = opts.category ? String(opts.category).toLowerCase().trim() : '';
  if (catRaw && catRaw !== 'all') {
    const cat = normalizeCategory(catRaw);
    if (cat) {
      vals.push(cat);
      conds.push(`c.category = $${vals.length}`);
    }
  }

  const q = opts.q ? String(opts.q).trim() : '';
  if (q) {
    const like = `%${q}%`;
    vals.push(like, like, like);
    conds.push(
      `(c.title ILIKE $${vals.length - 2} OR c.description ILIKE $${vals.length - 1} OR ` +
        `trim(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) ILIKE $${vals.length})`
    );
  }

  const whereClause = conds.join(' AND ');
  const countVals = [...vals];

  const { rows: cr } = await pool.query(
    `SELECT COUNT(*)::bigint AS n FROM public.courses c
     INNER JOIN public.users u ON u.id = c.instructor_id
     WHERE ${whereClause}`,
    countVals
  );
  const total = Number(cr[0]?.n || 0);

  vals.push(limit, offset);
  const limPl = vals.length - 1;
  const offPl = vals.length;

  const { rows } = await pool.query(
    `
    SELECT c.id, c.title, c.description, c.faculty, c.category, c.thumbnail_url, c.updated_at,
           u.first_name AS instructor_first_name,
           u.last_name AS instructor_last_name,
           (SELECT COUNT(*)::int FROM public.course_enrollments ce WHERE ce.course_id = c.id) AS enrollment_count,
           (SELECT COUNT(*)::int FROM public.course_modules cm WHERE cm.course_id = c.id) AS module_count
    FROM public.courses c
    INNER JOIN public.users u ON u.id = c.instructor_id
    WHERE ${whereClause}
    ORDER BY c.updated_at DESC
    LIMIT $${limPl}::int OFFSET $${offPl}::int`,
    vals
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return { rows, total, totalPages, page, limit };
}

async function selectCourseOverviewForPublic (pool, courseId) {
  const id = String(courseId || '').trim();
  const { rows } = await pool.query(
    `
    SELECT c.id, c.title, c.description, c.faculty, c.category, c.thumbnail_url, c.status, c.updated_at,
           u.first_name AS instructor_first_name, u.last_name AS instructor_last_name,
           u.instructor_title,
           (SELECT COUNT(*)::int FROM public.course_enrollments ce WHERE ce.course_id = c.id) AS enrollment_count
    FROM public.courses c
    INNER JOIN public.users u ON u.id = c.instructor_id
    WHERE c.id = $1::uuid AND c.status = 'published'
    LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function selectCourseWithAccess (pool, courseId, userId, role) {
  const id = String(courseId || '').trim();
  const { rows } = await pool.query(
    `
    SELECT c.*,
           u.first_name AS instructor_first_name, u.last_name AS instructor_last_name
    FROM public.courses c
    INNER JOIN public.users u ON u.id = c.instructor_id
    WHERE c.id = $1::uuid
    LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  const isOwner = row.instructor_id === userId;
  const isAdmin = role === 'admin';
  const isPublished = row.status === 'published';
  if (!isAdmin && !isOwner && !isPublished) return null;
  return row;
}

async function isCourseEnrolled (pool, userId, courseId) {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM public.course_enrollments WHERE user_id = $1::uuid AND course_id = $2::uuid`,
    [userId, courseId]
  );
  return rowCount > 0;
}

async function insertEnrollment (pool, userId, courseId) {
  const { rowCount } = await pool.query(
    `
    INSERT INTO public.course_enrollments (user_id, course_id)
    SELECT $1::uuid, $2::uuid FROM public.courses WHERE id = $2::uuid AND status = 'published'
    ON CONFLICT (user_id, course_id) DO NOTHING`,
    [userId, courseId]
  );
  return rowCount > 0;
}

async function selectStudentEnrolledCourses (pool, userId) {
  const { rows } = await pool.query(
    `
    SELECT c.id, c.title, c.description, c.faculty, c.category, c.thumbnail_url,
           e.progress_percent, e.enrolled_at,
           (SELECT COUNT(*)::int FROM public.course_modules cm WHERE cm.course_id = c.id) AS module_count,
           trim(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS instructor_name
    FROM public.course_enrollments e
    INNER JOIN public.courses c ON c.id = e.course_id
    INNER JOIN public.users u ON u.id = c.instructor_id
    WHERE e.user_id = $1::uuid AND c.status <> 'archived'
    ORDER BY e.enrolled_at DESC`,
    [userId]
  );
  return rows;
}

async function selectModuleTitles (pool, courseId) {
  const { rows } = await pool.query(
    `
    SELECT id, title, description, sort_order
    FROM public.course_modules WHERE course_id = $1::uuid ORDER BY sort_order ASC, title ASC`,
    [courseId]
  );
  return rows;
}

async function selectModulesForLearning (pool, courseId) {
  const { rows } = await pool.query(
    `
    SELECT m.id, m.sort_order, m.title, m.description, m.lecture_notes_summary, m.sample_files, m.video_url,
           (SELECT COUNT(*)::int FROM public.quiz_questions q WHERE q.module_id = m.id) AS quiz_question_count
    FROM public.course_modules m
    WHERE m.course_id = $1::uuid
    ORDER BY m.sort_order ASC, m.title ASC`,
    [courseId]
  );
  return rows;
}

async function selectQuizForStudent (pool, moduleId) {
  const { rows } = await pool.query(
    `
    SELECT id, prompt, choices, correct_index, sort_order
    FROM public.quiz_questions WHERE module_id = $1::uuid ORDER BY sort_order ASC, prompt ASC`,
    [moduleId]
  );
  return rows.map((r) => ({
    id: r.id,
    prompt: r.prompt,
    choices: Array.isArray(r.choices) ? r.choices : JSON.parse(JSON.stringify(r.choices || [])),
    correct_index: Number(r.correct_index)
  }));
}

async function gradeQuizAnswers (pool, moduleId, answersObj) {
  const { rows } = await pool.query(
    `
    SELECT id, correct_index, choices FROM public.quiz_questions WHERE module_id = $1::uuid ORDER BY sort_order ASC`,
    [moduleId]
  );
  if (!rows.length) return { total: 0, correct: 0, detail: [] };

  let correct = 0;
  const detail = [];
  for (const q of rows) {
    const pickRaw = Object.prototype.hasOwnProperty.call(answersObj, q.id)
      ? answersObj[q.id]
      : undefined;
    const pi = Number(pickRaw);
    const ok =
      pickRaw !== undefined &&
      pickRaw !== null &&
      Number.isInteger(pi) &&
      pi === Number(q.correct_index) &&
      pi >= 0 &&
      pi < (Array.isArray(q.choices) ? q.choices.length : 0);
    if (ok) correct += 1;
    detail.push({
      question_id: q.id,
      selected:
        Number.isInteger(pi) &&
        pi >= 0 &&
        pi < (Array.isArray(q.choices) ? q.choices.length : 0)
          ? pi
          : null,
      ok
    });
  }

  return { total: rows.length, correct, percent: rows.length ? Math.round((correct / rows.length) * 100) : 0 };
}

async function selectInstructorCourses (pool, instructorId) {
  const { rows } = await pool.query(
    `
    SELECT c.id, c.title, c.faculty, c.category, c.status, c.thumbnail_url, c.updated_at,
           (SELECT COUNT(*)::int FROM public.course_enrollments ce WHERE ce.course_id = c.id) AS enrollment_count,
           (SELECT COUNT(*)::int FROM public.course_modules cm WHERE cm.course_id = c.id) AS module_count
    FROM public.courses c
    WHERE c.instructor_id = $1::uuid
    ORDER BY c.updated_at DESC`,
    [instructorId]
  );
  return rows;
}

async function createCourse (pool, instructorId, body) {
  const title = String(body.title || 'Untitled course').trim() || 'Untitled course';
  const faculty = String(body.faculty || 'Computing').trim();
  const category = normalizeCategory(body.category) || 'technology';
  const { rows } = await pool.query(
    `
    INSERT INTO public.courses (instructor_id, title, description, faculty, category, thumbnail_url, status)
    VALUES ($1::uuid, $2::text, $3::text, $4::text, $5::text, COALESCE(trim($6::text),''), $7::text)
    RETURNING id`,
    [
      instructorId,
      title,
      String(body.description || '').trim(),
      faculty,
      category,
      String(body.thumbnail_url || '').trim(),
      normalizeStatus(body.status) || 'draft'
    ]
  );
  return rows[0]?.id || null;
}

async function assertInstructorOwnsCourse (pool, instructorId, courseId) {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM public.courses WHERE id = $1::uuid AND instructor_id = $2::uuid`,
    [courseId, instructorId]
  );
  return rowCount > 0;
}

/** Permanently removes a course; FK CASCADE drops modules, quizzes, enrollments, completion rows. */
async function deleteCourseByOwner (pool, instructorId, courseId) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.courses WHERE id = $1::uuid AND instructor_id = $2::uuid`,
    [courseId, instructorId]
  );
  return rowCount > 0;
}

async function replaceCourseContent (pool, instructorId, courseId, body) {
  const owns = await assertInstructorOwnsCourse(pool, instructorId, courseId);
  if (!owns) return null;

  const title = String(body.title || '').trim();
  if (!title) throw new Error('Title is required');

  const faculty = String(body.faculty || '').trim();
  const category = normalizeCategory(body.category) || 'technology';
  const status = normalizeStatus(body.status);
  const st = status || 'draft';

  const modulesInput = Array.isArray(body.modules) ? body.modules : [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `
      UPDATE public.courses SET
        title = $2::text,
        description = $3::text,
        faculty = $4::text,
        category = $5::text,
        thumbnail_url = COALESCE(trim($6::text),''),
        status = $7::text,
        updated_at = NOW()
      WHERE id = $1::uuid`,
      [
        courseId,
        title,
        String(body.description || ''),
        faculty,
        category,
        String(body.thumbnail_url || ''),
        st
      ]
    );

    await client.query(`DELETE FROM public.course_modules WHERE course_id = $1::uuid`, [courseId]);

    let order = 0;
    for (const m of modulesInput) {
      const modTitle = String(m.title || 'Module').trim() || 'Module';
      const { rows: mrows } = await client.query(
        `
        INSERT INTO public.course_modules (
          course_id, sort_order, title, description, lecture_notes_summary, sample_files, video_url
        )
        VALUES ($1::uuid, $2::int, $3::text, $4::text, $5::text, $6::jsonb, trim(COALESCE($7::text,'')))
        RETURNING id`,
        [
          courseId,
          order,
          modTitle,
          String(m.description || ''),
          String(m.lecture_notes_summary || ''),
          JSON.stringify(Array.isArray(m.sample_files) ? m.sample_files : []),
          String(m.video_url || '')
        ]
      );
      const mid = mrows[0].id;
      const quizArr = Array.isArray(m.quiz) ? m.quiz : [];
      let qOrd = 0;
      for (const q of quizArr) {
        const prompt = String(q.prompt || '').trim();
        let choices = Array.isArray(q.choices) ? q.choices.map((x) => String(x ?? '')) : [];
        choices = choices.filter((c) => c.length > 0);
        if (choices.length < 2) continue;
        const ci = Number.parseInt(String(q.correct_index), 10);
        if (!Number.isInteger(ci) || ci < 0 || ci >= choices.length) continue;
        await client.query(
          `
          INSERT INTO public.quiz_questions (module_id, sort_order, prompt, choices, correct_index)
          VALUES ($1::uuid, $2::int, $3::text, $4::jsonb, $5::smallint)`,
          [mid, qOrd, prompt, JSON.stringify(choices), ci]
        );
        qOrd += 1;
      }
      order += 1;
    }

    await client.query('COMMIT');
    return courseId;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function selectCourseForEdit (pool, instructorId, courseId) {
  const { rows } = await pool.query(
    `SELECT * FROM public.courses WHERE id = $1::uuid AND instructor_id = $2::uuid LIMIT 1`,
    [courseId, instructorId]
  );
  const c = rows[0];
  if (!c) return null;
  const mods = await selectModulesForLearning(pool, courseId);
  const out = { course: c, modules: [] };
  for (const m of mods) {
    const { rows: qs } = await pool.query(
      `SELECT id, sort_order, prompt, choices, correct_index FROM public.quiz_questions
       WHERE module_id = $1::uuid ORDER BY sort_order ASC`,
      [m.id]
    );
    out.modules.push({
      id: m.id,
      sort_order: m.sort_order,
      title: m.title,
      description: m.description,
      lecture_notes_summary: m.lecture_notes_summary,
      sample_files: m.sample_files,
      video_url: m.video_url,
      quiz: qs.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: Array.isArray(q.choices) ? q.choices : [],
        correct_index: Number(q.correct_index)
      }))
    });
  }
  return out;
}

async function adminListCourses (pool, opts) {
  const page = Math.max(1, Number.parseInt(String(opts.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(opts.limit || '8'), 10) || 8));
  const offset = (page - 1) * limit;
  const conds = ['TRUE'];
  const vals = [];

  const st = opts.status ? normalizeStatus(opts.status) : null;
  if (st) {
    vals.push(st);
    conds.push(`c.status = $${vals.length}`);
  }

  const whereClause = conds.join(' AND ');
  const countVals = [...vals];

  const { rows: cr } = await pool.query(
    `SELECT COUNT(*)::bigint AS n FROM public.courses c WHERE ${whereClause}`,
    countVals
  );
  const total = Number(cr[0]?.n || 0);

  vals.push(limit, offset);
  const limPl = vals.length - 1;
  const offPl = vals.length;

  const { rows } = await pool.query(
    `
    SELECT c.id, c.title, c.category, c.status, c.thumbnail_url, c.faculty,
           trim(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS instructor_display,
           (SELECT COUNT(*)::int FROM public.course_enrollments ce WHERE ce.course_id = c.id) AS enrollment_count
    FROM public.courses c
    INNER JOIN public.users u ON u.id = c.instructor_id
    WHERE ${whereClause}
    ORDER BY c.updated_at DESC
    LIMIT $${limPl}::int OFFSET $${offPl}::int`,
    vals
  );

  return { rows, total, page, limit };
}

async function adminPatchCourseStatus (pool, courseId, status) {
  const st = normalizeStatus(status);
  if (!st) throw new Error('Invalid status');
  const { rows } = await pool.query(
    `UPDATE public.courses SET status = $2::text, updated_at = NOW() WHERE id = $1::uuid RETURNING id, status`,
    [courseId, st]
  );
  return rows[0] || null;
}

async function moduleBelongsToCourse (pool, moduleId, courseId) {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM public.course_modules WHERE id = $1::uuid AND course_id = $2::uuid`,
    [moduleId, courseId]
  );
  return rowCount > 0;
}

async function countModulesInCourse (pool, courseId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM public.course_modules WHERE course_id = $1::uuid`,
    [courseId]
  );
  return Number(rows[0]?.n || 0);
}

async function recalculateEnrollmentProgress (pool, userId, courseId) {
  const total = await countModulesInCourse(pool, courseId);
  let done = 0;
  if (total > 0) {
    const { rows } = await pool.query(
      `
      SELECT COUNT(*)::int AS n
      FROM public.course_module_completion x
      INNER JOIN public.course_modules m ON m.id = x.module_id AND m.course_id = $2::uuid
      WHERE x.user_id = $1::uuid`,
      [userId, courseId]
    );
    done = Number(rows[0]?.n || 0);
  }
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  await pool.query(
    `
    UPDATE public.course_enrollments
    SET progress_percent = $3::smallint
    WHERE user_id = $1::uuid AND course_id = $2::uuid`,
    [userId, courseId, pct]
  );
  return { progress_percent: pct, modules_completed: done, modules_total: total };
}

async function selectCompletedModuleIdsForCourse (pool, userId, courseId) {
  const { rows } = await pool.query(
    `
    SELECT m.id
    FROM public.course_module_completion x
    INNER JOIN public.course_modules m ON m.id = x.module_id AND m.course_id = $2::uuid
    WHERE x.user_id = $1::uuid`,
    [userId, courseId]
  );
  return rows.map((r) => String(r.id));
}

async function setStudentModuleCompletion (pool, userId, courseId, moduleId, completed) {
  const okMod = await moduleBelongsToCourse(pool, moduleId, courseId);
  if (!okMod) return null;
  if (completed) {
    await pool.query(
      `
      INSERT INTO public.course_module_completion (user_id, module_id)
      VALUES ($1::uuid, $2::uuid)
      ON CONFLICT (user_id, module_id) DO NOTHING`,
      [userId, moduleId]
    );
  } else {
    await pool.query(`DELETE FROM public.course_module_completion WHERE user_id = $1::uuid AND module_id = $2::uuid`, [
      userId,
      moduleId
    ]);
  }
  const snap = await recalculateEnrollmentProgress(pool, userId, courseId);
  return snap;
}

async function findUserByEmailForRoster (pool, email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return null;
  const { rows } = await pool.query(
    `SELECT id, email, role FROM public.users WHERE lower(trim(email)) = $1 LIMIT 1`,
    [e]
  );
  return rows[0] || null;
}

async function insertCourseMemberByOwner (pool, ownerInstructorId, courseId, targetUserId) {
  const owns = await assertInstructorOwnsCourse(pool, ownerInstructorId, courseId);
  if (!owns) return { ok: false, error: 'forbidden' };
  const tid = String(targetUserId || '').trim();
  if (!tid) return { ok: false, error: 'bad_user' };
  const { rows: crs } = await pool.query(`SELECT status FROM public.courses WHERE id = $1::uuid LIMIT 1`, [
    courseId
  ]);
  if (!crs.length) return { ok: false, error: 'no_course' };
  if (crs[0].status === 'archived') return { ok: false, error: 'archived' };
  const { rowCount } = await pool.query(
    `
    INSERT INTO public.course_enrollments (user_id, course_id)
    VALUES ($1::uuid, $2::uuid)
    ON CONFLICT (user_id, course_id) DO NOTHING`,
    [tid, courseId]
  );
  const enr = await isCourseEnrolled(pool, tid, courseId);
  if (enr) await recalculateEnrollmentProgress(pool, tid, courseId);
  return { ok: true, inserted: rowCount > 0, already_member: rowCount === 0 && enr };
}

async function removeCourseMemberByOwner (pool, ownerInstructorId, courseId, targetUserId) {
  const owns = await assertInstructorOwnsCourse(pool, ownerInstructorId, courseId);
  if (!owns) return false;
  const uid = String(targetUserId || '').trim();
  if (!uid || uid === ownerInstructorId) return false;
  await pool.query(
    `
    DELETE FROM public.course_module_completion
    WHERE user_id = $1::uuid AND module_id IN (
      SELECT id FROM public.course_modules WHERE course_id = $2::uuid
    )`,
    [uid, courseId]
  );
  const del = await pool.query(
    `DELETE FROM public.course_enrollments WHERE course_id = $1::uuid AND user_id = $2::uuid`,
    [courseId, uid]
  );
  return del.rowCount > 0;
}

async function selectInstructorCourseRoster (pool, courseId, ownerInstructorId) {
  if (!(await assertInstructorOwnsCourse(pool, ownerInstructorId, courseId))) return null;
  const totalMods = await countModulesInCourse(pool, courseId);
  const { rows } = await pool.query(
    `
    SELECT e.user_id, e.enrolled_at, e.progress_percent,
           u.email, u.first_name, u.last_name, u.role, u.student_id::text AS student_id,
           (
             SELECT COUNT(*)::int
             FROM public.course_module_completion x
             INNER JOIN public.course_modules m ON m.id = x.module_id AND m.course_id = e.course_id
             WHERE x.user_id = e.user_id
           ) AS modules_completed
    FROM public.course_enrollments e
    INNER JOIN public.users u ON u.id = e.user_id
    WHERE e.course_id = $1::uuid
    ORDER BY e.enrolled_at ASC`,
    [courseId]
  );
  return {
    module_count: totalMods,
    members: rows.map((r) => ({
      user_id: r.user_id,
      email: r.email,
      first_name: r.first_name,
      last_name: r.last_name,
      role: r.role,
      student_id: r.student_id,
      enrolled_at: r.enrolled_at,
      progress_percent: Number(r.progress_percent || 0),
      modules_completed: Number(r.modules_completed || 0),
      modules_total: totalMods
    }))
  };
}

async function selectTeachingTeamForCourse (pool, courseId) {
  const cid = String(courseId || '').trim();
  const { rows: leadRows } = await pool.query(
    `
    SELECT c.instructor_id AS id,
           uf.first_name, uf.last_name, uf.email, uf.instructor_title
    FROM public.courses c
    INNER JOIN public.users uf ON uf.id = c.instructor_id
    WHERE c.id = $1::uuid
    LIMIT 1`,
    [cid]
  );
  const lead = leadRows[0];
  const { rows: extra } = await pool.query(
    `
    SELECT u.id, u.first_name, u.last_name, u.email, u.instructor_title
    FROM public.course_enrollments e
    INNER JOIN public.users u ON u.id = e.user_id
    INNER JOIN public.courses c ON c.id = e.course_id
    WHERE e.course_id = $1::uuid
      AND u.role = 'instructor'::text
      AND u.id <> c.instructor_id
    ORDER BY lower(u.email) ASC`,
    [cid]
  );
  const teaching_team = [];
  if (lead) {
    teaching_team.push({
      id: lead.id,
      role_label: 'Lead instructor',
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.email,
      email: lead.email,
      title: lead.instructor_title || ''
    });
  }
  for (const u of extra) {
    teaching_team.push({
      id: u.id,
      role_label: 'Course staff',
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
      email: u.email,
      title: u.instructor_title || ''
    });
  }
  return teaching_team;
}

async function instructorExists (pool, userId) {
  const uid = String(userId || '').trim();
  if (!uid) return false;
  const { rowCount } = await pool.query(
    `SELECT 1 FROM public.users WHERE id = $1::uuid AND role = 'instructor'::text`,
    [uid]
  );
  return rowCount > 0;
}

async function listInstructorsBrief (pool) {
  const { rows } = await pool.query(
    `SELECT id,
            email,
            first_name,
            last_name,
            trim(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) AS display_name
     FROM public.users
     WHERE role = 'instructor'::text
     ORDER BY lower(email) ASC`
  );
  return rows;
}

async function selectCourseForEditAdmin (pool, courseId) {
  const cid = String(courseId || '').trim();
  const { rows } = await pool.query(`SELECT * FROM public.courses WHERE id = $1::uuid LIMIT 1`, [cid]);
  const c = rows[0];
  if (!c) return null;
  const mods = await selectModulesForLearning(pool, cid);
  const out = { course: c, modules: [] };
  for (const m of mods) {
    const { rows: qs } = await pool.query(
      `
      SELECT id, sort_order, prompt, choices, correct_index FROM public.quiz_questions
      WHERE module_id = $1::uuid ORDER BY sort_order ASC`,
      [m.id]
    );
    out.modules.push({
      id: m.id,
      sort_order: m.sort_order,
      title: m.title,
      description: m.description,
      lecture_notes_summary: m.lecture_notes_summary,
      sample_files: m.sample_files,
      video_url: m.video_url,
      quiz: qs.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: Array.isArray(q.choices) ? q.choices : [],
        correct_index: Number(q.correct_index)
      }))
    });
  }
  return out;
}

async function replaceCourseContentAdmin (pool, courseId, body) {
  const cid = String(courseId || '').trim();
  const { rows } = await pool.query(`SELECT id FROM public.courses WHERE id = $1::uuid LIMIT 1`, [cid]);
  if (!rows.length) return null;

  let newInstr = body.instructor_id ? String(body.instructor_id).trim() : '';
  let instrUuid = null;
  if (newInstr) {
    const ok = await instructorExists(pool, newInstr);
    if (!ok) throw new Error('Invalid instructor');
    instrUuid = newInstr;
  }

  const title = String(body.title || '').trim();
  if (!title) throw new Error('Title is required');

  const faculty = String(body.faculty || '').trim();
  const category = normalizeCategory(body.category) || 'technology';
  const status = normalizeStatus(body.status);
  const st = status || 'draft';

  const modulesInput = Array.isArray(body.modules) ? body.modules : [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `
      UPDATE public.courses SET
        title = $2::text,
        description = $3::text,
        faculty = $4::text,
        category = $5::text,
        thumbnail_url = COALESCE(trim($6::text), ''),
        status = $7::text,
        instructor_id = COALESCE($8::uuid, instructor_id),
        updated_at = NOW()
      WHERE id = $1::uuid`,
      [
        cid,
        title,
        String(body.description || ''),
        faculty || 'Computing',
        category,
        String(body.thumbnail_url || ''),
        st,
        instrUuid
      ]
    );

    await client.query(`DELETE FROM public.course_modules WHERE course_id = $1::uuid`, [cid]);

    let order = 0;
    for (const m of modulesInput) {
      const modTitle = String(m.title || 'Module').trim() || 'Module';
      const { rows: mrows } = await client.query(
        `
        INSERT INTO public.course_modules (
          course_id, sort_order, title, description, lecture_notes_summary, sample_files, video_url
        )
        VALUES ($1::uuid, $2::int, $3::text, $4::text, $5::text, $6::jsonb, trim(COALESCE($7::text, '')))
        RETURNING id`,
        [
          cid,
          order,
          modTitle,
          String(m.description || ''),
          String(m.lecture_notes_summary || ''),
          JSON.stringify(Array.isArray(m.sample_files) ? m.sample_files : []),
          String(m.video_url || '')
        ]
      );
      const mid = mrows[0].id;
      const quizArr = Array.isArray(m.quiz) ? m.quiz : [];
      let qOrd = 0;
      for (const q of quizArr) {
        const prompt = String(q.prompt || '').trim();
        let choices = Array.isArray(q.choices) ? q.choices.map((x) => String(x ?? '')) : [];
        choices = choices.filter((c) => c.length > 0);
        if (choices.length < 2) continue;
        const ci = Number.parseInt(String(q.correct_index), 10);
        if (!Number.isInteger(ci) || ci < 0 || ci >= choices.length) continue;
        await client.query(
          `
          INSERT INTO public.quiz_questions (module_id, sort_order, prompt, choices, correct_index)
          VALUES ($1::uuid, $2::int, $3::text, $4::jsonb, $5::smallint)`,
          [mid, qOrd, prompt, JSON.stringify(choices), ci]
        );
        qOrd += 1;
      }
      order += 1;
    }

    await client.query('COMMIT');
    return cid;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  normalizeCategory,
  normalizeStatus,
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
  assertInstructorOwnsCourse,
  deleteCourseByOwner,
  adminListCourses,
  adminPatchCourseStatus,
  moduleBelongsToCourse,
  countModulesInCourse,
  recalculateEnrollmentProgress,
  selectCompletedModuleIdsForCourse,
  setStudentModuleCompletion,
  findUserByEmailForRoster,
  insertCourseMemberByOwner,
  removeCourseMemberByOwner,
  selectInstructorCourseRoster,
  selectTeachingTeamForCourse,
  instructorExists,
  listInstructorsBrief
};
