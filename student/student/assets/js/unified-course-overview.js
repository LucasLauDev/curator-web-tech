(function () {
  'use strict';

  function qp (key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const id = qp('id');
    const titleEl = document.getElementById('uc-title');
    const coverEl = document.getElementById('uc-cover');
    const descEl = document.getElementById('uc-desc');
    const listEl = document.getElementById('uc-module-list');
    const enrolledN = document.getElementById('uc-enrollment-count');
    const cta = document.getElementById('uc-start-learn');

    if (!id) {
      if (descEl) descEl.textContent = 'Pick a course from Discover and open its syllabus.';
      return;
    }

    try {
      const r = await fetch('/api/courses/' + encodeURIComponent(id) + '/overview', { credentials: 'include' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Failed to load course');

      const c = data.course;
      document.title = (c.title || 'Course') + ' | CuratorEdu';

      if (titleEl) titleEl.textContent = c.title || 'Course';
      if (coverEl && c.thumbnail_url) coverEl.src = c.thumbnail_url;
      if (descEl) descEl.textContent = c.description || '—';

      const staffList = document.getElementById('uc-staff-list');
      if (staffList) {
        staffList.innerHTML = '';
        const team = Array.isArray(data.teaching_team) ? data.teaching_team : [];
        if (!team.length) {
          staffList.innerHTML =
            '<li class="text-on-surface-variant text-sm">No teaching staff listed.</li>';
        } else {
          team.forEach(function (p) {
            const li = document.createElement('li');
            li.className = 'flex flex-col gap-1 border-b border-outline-variant/10 pb-3 last:border-0 last:pb-0';
            li.innerHTML =
              '<span class="font-headline font-bold text-on-surface">' +
              String(p.name || '').replace(/</g, '&lt;') +
              '</span>' +
              '<span class="text-xs font-label uppercase tracking-wider text-primary">' +
              String(p.role_label || '').replace(/</g, '&lt;') +
              '</span>' +
              (p.title
                ? '<span class="text-sm text-on-surface-variant">' + String(p.title).replace(/</g, '&lt;') + '</span>'
                : '') +
              (p.email
                ? '<span class="text-xs text-on-surface-variant">' + String(p.email).replace(/</g, '&lt;') + '</span>'
                : '');
            staffList.appendChild(li);
          });
        }
      }

      const en = Number(c.enrollment_count || 0);
      if (enrolledN) enrolledN.textContent = String(en);

      if (listEl) {
        listEl.innerHTML = '';
        (data.modules || []).forEach(function (m, idx) {
          const li = document.createElement('li');
          li.className = 'flex gap-4 p-5 rounded-2xl bg-white border border-surface-container shadow-sm';
          li.innerHTML =
            '<span class="text-primary font-black text-lg w-10 shrink-0">' +
            String(idx + 1) +
            '</span><div><h4 class="font-headline font-bold text-on-surface text-lg">' +
            (m.title || 'Module').replace(/</g, '&lt;') +
            '</h4><p class="text-sm text-on-surface-variant mt-1">' +
            (m.excerpt || '').replace(/</g, '&lt;') +
            '</p></div>';
          listEl.appendChild(li);
        });
      }

      if (cta) {
        var q = '?courseId=' + encodeURIComponent(id);
        cta.href = 'course_detail.html' + q;
      }

      if (data.enrolled && cta) {
        cta.textContent = 'Continue to lessons';
      }
    } catch (e) {
      if (descEl) descEl.textContent = String(e.message || e);
    }
  });
})();
