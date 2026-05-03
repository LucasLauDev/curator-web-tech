(function () {
  'use strict';

  function toast (msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind === 'error' ? 'error' : 'info');
    else alert(msg);
  }

  function esc (s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('instructor-courses-tbody');
    if (!tbody) return;

    tbody.innerHTML =
      '<tr><td colspan="4" class="px-8 py-10 text-center text-on-surface-variant">Loading…</td></tr>';

    try {
      const res = await fetch('/api/instructor/courses', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to load');

      document.querySelectorAll('[data-inst-stat="total"]').forEach((el) => {
        el.textContent = String(data.summary?.total_courses ?? 0);
      });
      document.querySelectorAll('[data-inst-stat="enrolled"]').forEach((el) => {
        el.textContent = String(data.summary?.total_enrolled ?? 0);
      });
      document.querySelectorAll('[data-inst-stat="avg"]').forEach((el) => {
        el.textContent = data.summary?.avg_completion_display || '0%';
      });

      const rows = data.courses || [];
      tbody.innerHTML = '';
      if (!rows.length) {
        tbody.innerHTML =
          '<tr><td colspan="4" class="px-8 py-10 text-center text-on-surface-variant">Create your first course.</td></tr>';
        return;
      }

      rows.forEach((c) => {
        const st = String(c.status || 'draft').toLowerCase();
        const stLabel = st.charAt(0).toUpperCase() + st.slice(1);
        const stCls =
          st === 'published'
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-amber-100 text-amber-800 border-amber-200';
        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-container-low/30 transition-colors';
        tr.innerHTML =
          `<td class="px-8 py-6"><div class="flex items-center gap-4"><div class="w-14 h-14 rounded-xl bg-secondary-container/30 flex items-center justify-center"><span class="material-symbols-outlined text-on-secondary-container">school</span></div>` +
          `<div><h4 class="font-headline font-bold text-on-surface">${esc(c.title)}</h4>` +
          `<p class="text-xs text-on-surface-variant font-medium">${esc(c.faculty || '')}</p></div></div></td>` +
          `<td class="px-6 py-6 text-center"><div class="flex flex-col items-center gap-1"><span class="text-sm font-bold">${c.enrollment_count || 0} Students</span>` +
          `<span class="text-[10px] font-black text-outline uppercase tracking-wider">${c.module_count || 0} Modules</span></div></td>` +
          `<td class="px-6 py-6 text-center"><span class="px-3 py-1 ${stCls} text-[10px] font-black rounded-full uppercase tracking-widest border">${stLabel}</span></td>` +
          `<td class="px-8 py-6 text-right"><div class="flex justify-end gap-3 flex-wrap">` +
          `<a href="instructor_course_editor.html?id=${encodeURIComponent(c.id)}" class="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface font-bold text-xs rounded-lg hover:bg-primary hover:text-on-primary shadow-sm"><span class="material-symbols-outlined text-sm">edit</span>Edit</a>` +
          `<a href="instructor_course_roster.html?courseId=${encodeURIComponent(c.id)}" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant font-bold text-xs rounded-lg hover:bg-surface-container"><span class="material-symbols-outlined text-sm">groups</span>Roster</a>` +
          `<button type="button" data-delete-course="${esc(c.id)}" class="flex items-center gap-2 px-4 py-2 bg-error/10 text-error font-bold text-xs rounded-lg border border-error/30 hover:bg-error/15"><span class="material-symbols-outlined text-sm">delete_forever</span>Delete</button>` +
          `<button type="button" data-archive-course="${esc(c.id)}" class="flex items-center gap-2 px-4 py-2 bg-error/10 text-error font-bold text-xs rounded-lg border border-error/20"><span class="material-symbols-outlined text-sm">block</span>Archive</button>` +
          `</div></td>`;
        tbody.appendChild(tr);
      });

      tbody.addEventListener('click', async (ev) => {
        const delBtn = ev.target.closest('[data-delete-course]');
        if (delBtn) {
          const cid = delBtn.getAttribute('data-delete-course');
          if (
            !cid ||
            !window.confirm(
              'Permanently delete this course? All modules, quizzes, and enrollments will be removed. This cannot be undone.'
            )
          ) {
            return;
          }
          try {
            const r = await fetch('/api/instructor/courses/' + encodeURIComponent(cid), {
              method: 'DELETE',
              credentials: 'include'
            });
            const out = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(out.error || 'Failed');
            toast('Course deleted.', 'info');
            location.reload();
          } catch (e) {
            toast(String(e.message || e), 'error');
          }
          return;
        }

        const btn = ev.target.closest('[data-archive-course]');
        if (!btn) return;
        const cid = btn.getAttribute('data-archive-course');
        if (!cid || !window.confirm('Archive this course for students (sets status archived)?')) return;
        try {
          const r = await fetch('/api/instructor/courses/' + encodeURIComponent(cid) + '/status', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' })
          });
          const out = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(out.error || 'Failed');
          toast('Course archived.', 'info');
          location.reload();
        } catch (e) {
          toast(String(e.message || e), 'error');
        }
      });
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="4" class="px-8 py-10 text-center text-error">${esc(e.message || String(e))}</td></tr>`;
    }
  });
})();
