/**
 * Populate student course discovery (/course/my_courses.html).
 */
(function () {
  'use strict';

  function esc (s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function categoryLabel (cat) {
    const m = { design: 'Design', technology: 'Technology', business: 'Business', general: 'General' };
    return m[String(cat)] || cat || 'Course';
  }

  function cardHtml (c) {
    const inst = esc(c.instructor_display || 'Instructor');
    const thumb =
      (c.thumbnail_url && String(c.thumbnail_url).trim()) ||
      `https://picsum.photos/seed/${encodeURIComponent(String(c.id).slice(0, 8))}/640/360`;
    const modCount = Number(c.module_count || 0);
    const enrol = Number(c.enrollment_count || 0);
    const hrefDetail = `unified_course_details.html?id=${encodeURIComponent(c.id)}`;
    return `<a href="${hrefDetail}" class="course-card group bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container hover:border-primary/25 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col"` +
      ` data-category="${esc(c.category)}" data-ce-id="${esc(c.id)}">` +
      `<div class="relative aspect-video overflow-hidden">` +
      `<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" src="${esc(thumb)}"/>` +
      `<span class="absolute top-3 right-3 px-3 py-1 bg-black/40 text-white font-label text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">${esc(categoryLabel(c.category))}</span>` +
      `</div>` +
      `<div class="p-5 flex flex-col flex-1">` +
      `<h3 class="font-headline font-bold text-lg text-on-surface mb-2 leading-snug">${esc(c.title)}</h3>` +
      `<p class="font-body text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">${esc((c.description || '').slice(0, 240))}${(c.description || '').length > 240 ? '…' : ''}</p>` +
      `<div class="flex items-center gap-2 mb-4">` +
      `<span class="font-label text-xs text-on-surface-variant">${inst}</span>` +
      `<div class="ml-auto text-on-surface-variant text-xs">${modCount} mod · ${enrol} enrolled</div>` +
      `</div>` +
      `<div class="mt-auto flex items-center justify-between gap-3">` +
      `<span class="font-headline font-black text-lg text-primary">Free</span>` +
      `<button type="button" class="course-enroll-btn px-4 py-2 bg-primary text-white rounded-full font-label text-xs font-bold hover:bg-primary-dim shadow shadow-primary/20">Join</button>` +
      `</div></div></a>`;
  }

  function enrolledCard (c) {
    const pct = Math.max(0, Math.min(100, Number(c.progress_percent || 0)));
    const href = `course_detail.html?courseId=${encodeURIComponent(c.id)}`;
    const thumb =
      (c.thumbnail_url && String(c.thumbnail_url).trim()) ||
      `https://picsum.photos/seed/e-${encodeURIComponent(String(c.id).slice(0, 8))}/640/360`;
    const label = pct >= 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Starting';
    const lblCls =
      pct >= 100 ? 'bg-green-500 text-white' : pct > 0 ? 'bg-primary text-white' : 'bg-secondary text-white';
    const barClr = pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-primary' : 'bg-secondary';
    return `<div class="bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container shadow-sm flex flex-col">` +
      `<div class="relative aspect-video overflow-hidden">` +
      `<img class="w-full h-full object-cover" alt="" src="${esc(thumb)}"/>` +
      `<span class="absolute top-3 left-3 px-3 py-1 ${lblCls} font-label text-[10px] font-bold uppercase tracking-wider rounded-full">${label}</span>` +
      `</div>` +
      `<div class="p-5 flex flex-col flex-1">` +
      `<span class="text-xs font-label font-bold text-primary uppercase mb-1">${esc(categoryLabel(c.category))}</span>` +
      `<h3 class="font-headline font-bold text-lg text-on-surface mb-3 leading-snug">${esc(c.title)}</h3>` +
      `<div class="w-full h-2 bg-surface-container rounded-full overflow-hidden mb-2"><div class="h-full ${barClr} rounded-full" style="width:${pct}%"></div></div>` +
      `<p class="font-label text-xs font-bold mb-4 ${pct >= 100 ? 'text-green-600' : 'text-primary'}">${pct}% complete</p>` +
      `<a href="${href}" class="mt-auto px-4 py-3 bg-primary text-white rounded-xl font-label text-sm font-bold text-center hover:bg-primary-dim">${pct >= 100 ? 'Review Course' : 'Continue Learning'}</a>` +
      `</div></div>`;
  }

  async function enroll (courseId, btn) {
    try {
      const r = await fetch('/api/student/courses/' + encodeURIComponent(courseId) + '/enroll', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Enroll failed');
      const msg = data.already_member ? 'Already enrolled' : 'Enrolled';
      if (btn) btn.textContent = msg;
      if (typeof window.showToast === 'function') window.showToast(msg, 'info');
      else alert(msg);
    } catch (e) {
      if (typeof window.showToast === 'function') window.showToast(String(e.message || e), 'error');
      else alert(String(e.message || e));
    }
  }

  function attachPillFilters () {
    const pills = [...document.querySelectorAll('.category-pill')];
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) =>
          p.classList.remove('bg-primary', 'text-white', 'shadow', 'shadow-primary/20', 'font-bold')
        );
        pills.forEach((p) => p.classList.add('bg-surface-container', 'text-on-surface-variant', 'font-medium'));
        pill.classList.remove('bg-surface-container', 'text-on-surface-variant', 'font-medium');
        pill.classList.add('bg-primary', 'text-white', 'shadow', 'shadow-primary/20', 'font-bold');
        const cat = pill.getAttribute('data-category') || 'all';
        [...document.querySelectorAll('#course-grid .course-card')].forEach((card) => {
          const dc = card.getAttribute('data-category') || '';
          let show =
            cat === 'all' || (cat !== 'all' && cat !== 'trending' && cat !== 'new' && dc === cat);
          if (cat === 'trending') show = dc === 'technology';
          if (cat === 'new') show = dc === 'technology' || dc === 'design';
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('course-grid');
    const eg = document.getElementById('enrolled-courses-grid');

    if (eg) {
      try {
        const r = await fetch('/api/student/courses/enrolled', { credentials: 'include' });
        if (r.ok) {
          const d = await r.json();
          const list = d.courses || [];
          eg.innerHTML = '';
          if (!list.length) {
            eg.innerHTML =
              '<p class="col-span-full text-center py-8 text-on-surface-variant">No enrolled courses yet. Browse the catalog and tap Join.</p>';
          } else {
            list.forEach((c) => {
              const wrap = document.createElement('div');
              wrap.innerHTML = enrolledCard(c).trim();
              const n = wrap.firstElementChild;
              if (n) eg.appendChild(n);
            });
          }
        }
      } catch (_) {
        /* ignore */
      }
    }

    if (!grid) return;
    grid.innerHTML = '<p class="col-span-full text-center py-16 text-on-surface-variant">Loading courses…</p>';
    try {
      const res = await fetch(`/api/courses/catalog?${new URLSearchParams({ limit: '48' })}`, {
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load catalog');
      const courses = data.courses || [];

      grid.innerHTML = '';
      if (!courses.length) {
        grid.innerHTML =
          '<p class="col-span-full text-center py-12 text-on-surface-variant">No published courses yet.</p>';
        return;
      }

      courses.forEach((c) => {
        const wrap = document.createElement('div');
        wrap.innerHTML = cardHtml(c).trim();
        const node = wrap.firstElementChild;
        if (node) grid.appendChild(node);
      });

      const heroTitle = document.getElementById('discovery-hero-title');
      const heroCta = document.getElementById('discovery-hero-cta');
      const countLabel = document.getElementById('discovery-count-label');
      const fc = courses[0];
      if (fc && heroTitle) heroTitle.textContent = fc.title;
      if (fc && heroCta) heroCta.href = `unified_course_details.html?id=${encodeURIComponent(fc.id)}`;
      if (countLabel) countLabel.textContent = `Discover · ${courses.length} courses`;

      attachPillFilters();

      grid.addEventListener('click', async (ev) => {
        const b = ev.target.closest('.course-enroll-btn');
        if (!b) return;
        ev.preventDefault();
        ev.stopPropagation();
        const card = b.closest('[data-ce-id]');
        const courseId = card && card.getAttribute('data-ce-id');
        if (courseId) await enroll(courseId, b);
      });

      const searchInput = document.getElementById('course-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.toLowerCase().trim();
          [...grid.querySelectorAll('.course-card')].forEach((card) => {
            const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
            card.classList.toggle('hidden', q.length > 0 && !title.includes(q));
          });
        });
      }
    } catch (e) {
      grid.innerHTML = `<p class="col-span-full text-center py-12 text-error">${esc(e.message || String(e))}</p>`;
    }
  });
})();
