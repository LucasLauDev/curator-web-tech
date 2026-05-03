(function () {
  'use strict';

  function qp(k) {
    return new URLSearchParams(window.location.search).get(k);
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind === 'error' ? 'error' : 'info');
    else alert(msg);
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  var courseId = qp('courseId');
  var allMembers = [];
  var rosterFilter = 'all';

  function showErr(msg) {
    var el = document.getElementById('roster-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
  }

  function applyFilter(members) {
    return members.filter(function (m) {
      var pct = Number(m.progress_percent || 0);
      if (rosterFilter === 'active') return pct > 0 && pct < 100;
      if (rosterFilter === 'done') return pct >= 100;
      return true;
    });
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (_) {
      return '—';
    }
  }

  function renderRows(members) {
    var tb = document.getElementById('roster-tbody');
    var countLine = document.getElementById('roster-count-line');
    if (!tb) return;
    tb.innerHTML = '';
    if (countLine) countLine.textContent = members.length + ' shown';

    if (!members.length) {
      tb.innerHTML =
        '<tr><td colspan="7" class="px-8 py-10 text-center text-slate-500">No one matches this filter.</td></tr>';
      return;
    }

    members.forEach(function (m) {
      var name = `${m.first_name || ''} ${m.last_name || ''}`.trim() || '—';
      var tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/80 transition-colors';
      var modLine = `${m.modules_completed}/${m.modules_total}`;
      var pct = Math.min(100, Math.max(0, Number(m.progress_percent || 0)));
      var statusLabel = pct >= 100 ? 'Done' : pct > 0 ? 'Active' : 'Starting';
      var badgeCls =
        pct >= 100
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : pct > 0
            ? 'bg-violet-50 text-violet-700 border-violet-200'
            : 'bg-slate-50 text-slate-600 border-slate-200';

      tr.innerHTML =
        '<td class="px-6 py-4">' +
        '<div class="font-headline font-bold text-on-surface">' +
        esc(name) +
        '</div>' +
        (m.student_id
          ? '<div class="text-[11px] text-slate-400 font-medium mt-0.5">' + esc(m.student_id) + '</div>'
          : '') +
        '</td>' +
        '<td class="px-4 py-4 text-sm text-slate-600">' +
        esc(m.email || '') +
        '</td>' +
        '<td class="px-4 py-4"><span class="text-xs font-bold capitalize px-2 py-1 rounded-lg bg-slate-100 text-slate-700">' +
        esc(m.role || '') +
        '</span></td>' +
        '<td class="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">' +
        fmtDate(m.enrolled_at) +
        '</td>' +
        '<td class="px-4 py-4 text-sm font-bold text-primary">' +
        esc(modLine) +
        '</td>' +
        '<td class="px-4 py-4 min-w-[120px]">' +
        '<div class="flex items-center justify-between gap-2 mb-1">' +
        '<span class="text-[10px] font-bold text-primary">' +
        pct +
        '%</span>' +
        '<span class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ' +
        badgeCls +
        '">' +
        statusLabel +
        '</span></div>' +
        '<div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">' +
        '<div class="h-full bg-primary rounded-full transition-all" style="width:' +
        pct +
        '%"></div></div>' +
        '</td>' +
        '<td class="px-6 py-4 text-right">' +
        '<button type="button" class="roster-kick px-4 py-2 rounded-lg bg-error/10 text-error text-xs font-black border border-error/20 hover:bg-error/15" data-user-id="' +
        esc(String(m.user_id)) +
        '">Remove access</button>' +
        '</td>';
      tb.appendChild(tr);
    });

    tb.querySelectorAll('.roster-kick').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var uid = btn.getAttribute('data-user-id');
        if (!uid || !courseId) return;
        if (
          !window.confirm(
            'Remove this person from the course? Progress for this course will be cleared for them.'
          )
        )
          return;
        btn.disabled = true;
        try {
          var r = await fetch(
            '/api/instructor/courses/' +
              encodeURIComponent(courseId) +
              '/members/' +
              encodeURIComponent(uid),
            { method: 'DELETE', credentials: 'include' }
          );
          var d = await r.json().catch(function () {
            return {};
          });
          if (!r.ok) throw new Error(d.error || 'Remove failed');
          toast('Removed from course.', 'info');
          await loadRoster();
        } catch (e) {
          toast(String(e.message || e), 'error');
          btn.disabled = false;
        }
      });
    });
  }

  async function loadRoster() {
    showErr('');
    if (!courseId) {
      showErr('Missing courseId in URL. Open roster from My Courses.');
      renderRows([]);
      return;
    }
    var tb = document.getElementById('roster-tbody');
    if (tb)
      tb.innerHTML =
        '<tr><td colspan="7" class="px-8 py-10 text-center text-slate-500">Loading…</td></tr>';
    try {
      var r = await fetch('/api/instructor/courses/' + encodeURIComponent(courseId) + '/roster', {
        credentials: 'include'
      });
      var data = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) throw new Error(data.error || 'Unable to load roster');
      document.getElementById('roster-course-title').textContent = data.course_title || 'Course';
      document.title = (data.course_title || 'Course') + ' · Roster';
      allMembers = Array.isArray(data.members) ? data.members : [];
      renderRows(applyFilter(allMembers));
    } catch (e) {
      showErr(String(e.message || e));
      renderRows([]);
    }
  }

  function wireFilters() {
    document.querySelectorAll('.roster-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        rosterFilter = btn.getAttribute('data-roster-filter') || 'all';
        document.querySelectorAll('.roster-filter-btn').forEach(function (b) {
          var on = b.getAttribute('data-roster-filter') === rosterFilter;
          b.className =
            'roster-filter-btn px-6 py-2.5 rounded-lg font-label font-bold text-sm ' +
            (on ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:bg-white/70');
        });
        renderRows(applyFilter(allMembers));
      });
    });
  }

  function csvEscape(s) {
    var v = String(s ?? '');
    if (/[,"\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  function exportCsv() {
    var rows = applyFilter(allMembers);
    var lines = [['Name', 'Email', 'Student ID', 'Role', 'Joined', 'Modules done', 'Progress %'].map(csvEscape).join(',')];
    rows.forEach(function (m) {
      var name = `${m.first_name || ''} ${m.last_name || ''}`.trim();
      lines.push(
        [
          name,
          m.email || '',
          m.student_id || '',
          m.role || '',
          fmtDate(m.enrolled_at),
          `${m.modules_completed}/${m.modules_total}`,
          String(m.progress_percent ?? '')
        ]
          .map(csvEscape)
          .join(',')
      );
    });
    var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'course_roster_' + (courseId || 'export').slice(0, 8) + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireFilters();
    document.getElementById('roster-export-csv')?.addEventListener('click', exportCsv);
    loadRoster();

    var modal = document.getElementById('add-person-modal');
    var emailInput = document.getElementById('add-person-email');
    function openModal() {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      if (emailInput) {
        emailInput.value = '';
        emailInput.focus();
      }
    }
    function closeModal() {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    document.getElementById('roster-add-person')?.addEventListener('click', openModal);
    document.getElementById('add-person-backdrop')?.addEventListener('click', closeModal);
    document.getElementById('add-person-cancel')?.addEventListener('click', closeModal);
    document.getElementById('add-person-submit')?.addEventListener('click', async function () {
      var raw = emailInput?.value.trim() || '';
      if (!courseId || !raw) return;
      try {
        var r = await fetch('/api/instructor/courses/' + encodeURIComponent(courseId) + '/members', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: raw })
        });
        var d = await r.json().catch(function () {
          return {};
        });
        if (!r.ok) throw new Error(d.error || 'Could not add');
        if (d.already_member) toast('Already in this course.', 'info');
        else toast(d.added ? 'Added to course.' : 'OK', 'info');
        closeModal();
        await loadRoster();
      } catch (e) {
        toast(String(e.message || e), 'error');
      }
    });
  });
})();
