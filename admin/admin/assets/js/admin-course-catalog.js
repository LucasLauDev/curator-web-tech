(function () {
  'use strict';

  const DETAIL_PAGE = '/student/student/course/unified_course_details.html';

  function showToast (message, kind) {
    let toast = document.getElementById('catalog-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'catalog-toast';
      toast.className =
        'fixed top-24 right-6 z-[140] bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm opacity-0 translate-y-2 transition-all duration-200';
      document.body.appendChild(toast);
    }
    if (kind === 'error') {
      toast.classList.remove('bg-slate-900');
      toast.classList.add('bg-red-700');
    } else {
      toast.classList.add('bg-slate-900');
      toast.classList.remove('bg-red-700');
    }
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
      toast.classList.add('opacity-0', 'translate-y-2');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 1800);
  }

  function statusChipHtml (st) {
    const s = String(st || 'draft').toLowerCase();
    if (s === 'published') {
      return (
        '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-bold label-text">' +
        '<span class="w-2 h-2 rounded-full bg-secondary"></span>Published</span>'
      );
    }
    if (s === 'archived') {
      return (
        '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest/50 text-slate-500 text-xs font-bold label-text">' +
        '<span class="w-2 h-2 rounded-full bg-slate-400"></span>Archived</span>'
      );
    }
    return (
      '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest/50 text-slate-500 text-xs font-bold label-text">' +
      '<span class="w-2 h-2 rounded-full bg-slate-400"></span>Draft</span>'
    );
  }

  function buildRowHtml (course) {
    const thumb = course.thumbnail_url
      ? String(course.thumbnail_url).replace(/"/g, '&quot;')
      : 'https://picsum.photos/seed/' + encodeURIComponent(course.id || 'x') + '/112/112';
    const title = escHtml(course.title || 'Untitled');
    const lecturer = escHtml(course.instructor_display || '—');
    const enr =
      typeof course.enrollment_count === 'number'
        ? course.enrollment_count.toLocaleString()
        : '0';
    const idShort = escHtml(String(course.id || '').slice(0, 8));
    const st = String(course.status || 'draft');

    return (
      '<tr class="hover:bg-surface-container-low/50 transition-colors group" data-course-id="' +
      escAttr(course.id) +
      '" data-status="' +
      escAttr(st) +
      '" data-course-title="' +
      escAttr(course.title || '') +
      '">' +
      '<td class="px-8 py-6">' +
      '<div class="flex items-center gap-4">' +
      '<div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">' +
      '<img alt="" class="w-full h-full object-cover" src="' +
      thumb +
      '"/>' +
      '</div>' +
      '<div>' +
      '<div class="font-bold text-on-surface group-hover:text-primary transition-colors">' +
      title +
      '</div>' +
      '<div class="text-xs text-slate-400 mt-1">ID: ' +
      idShort +
      '…</div>' +
      '</div></div></td>' +
      '<td class="px-6 py-6">' +
      '<span class="text-sm font-medium text-on-surface">' +
      lecturer +
      '</span></td>' +
      '<td class="px-6 py-6 font-bold text-on-surface">' +
      enr +
      '</td>' +
      '<td class="px-6 py-6">' +
      statusChipHtml(st) +
      '</td>' +
      '<td class="px-8 py-6 text-right">' +
      '<button type="button" class="row-action-btn p-2 hover:bg-surface-container-high rounded-full transition-all" aria-haspopup="menu" aria-expanded="false">' +
      '<span class="material-symbols-outlined text-slate-400">more_vert</span></button>' +
      '</td></tr>'
    );
  }

  function escHtml (s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr (s) {
    return escHtml(s).replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const pageSize = 8;
    let currentPage = 1;
    let activeStatusFilter = 'all';
    let total = 0;
    let totalPages = 1;

    const pageRangeEl = document.getElementById('page-range');
    const totalEl = document.getElementById('catalog-total');
    const pageIndicator = document.getElementById('catalog-page-indicator');
    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');
    const tbody = document.getElementById('admin-catalog-tbody');
    const statTotal = document.getElementById('admin-stat-total-courses');

    if (!tbody) return;

    let selectedCourseId = '';
    let selectedCourseName = '';
    let activeRowActionBtn = null;

    const menu = document.createElement('div');
    menu.id = 'row-action-menu';
    menu.className = 'hidden fixed z-[150] w-44 rounded-xl border border-surface-container bg-white shadow-xl p-2';
    menu.innerHTML =
      '<button type="button" data-action="edit" class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-container-low">Edit course</button>' +
      '<button type="button" data-action="view" class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-container-low">View (student)</button>' +
      '<button type="button" data-action="archive" class="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">Archive</button>';
    document.body.appendChild(menu);

    function closeRowMenu () {
      menu.classList.add('hidden');
      if (activeRowActionBtn) activeRowActionBtn.setAttribute('aria-expanded', 'false');
      activeRowActionBtn = null;
    }

    function openRowMenu (btn, row) {
      selectedCourseId = row.getAttribute('data-course-id') || '';
      selectedCourseName =
        row.getAttribute('data-course-title') || row.querySelector('td .font-bold')?.textContent || 'Course';
      const rect = btn.getBoundingClientRect();
      const menuWidth = 176;
      const menuHeight = 140;
      const margin = 8;
      let left = rect.right - menuWidth;
      let top = rect.bottom + 6;
      left = Math.min(Math.max(margin, left), window.innerWidth - menuWidth - margin);
      top = Math.min(Math.max(margin, top), window.innerHeight - menuHeight - margin);
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      menu.classList.remove('hidden');
      if (activeRowActionBtn && activeRowActionBtn !== btn) {
        activeRowActionBtn.setAttribute('aria-expanded', 'false');
      }
      activeRowActionBtn = btn;
      btn.setAttribute('aria-expanded', 'true');
    }

    function bindRowActionButton (btn) {
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        const row = btn.closest('tr');
        if (!row) return;
        if (!menu.classList.contains('hidden') && activeRowActionBtn === btn) {
          closeRowMenu();
          return;
        }
        openRowMenu(btn, row);
      });
    }

    function updateRowActionBindings () {
      tbody.querySelectorAll('.row-action-btn').forEach(bindRowActionButton);
    }

    async function fetchCourses () {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (activeStatusFilter !== 'all') params.set('status', activeStatusFilter);

      const r = await fetch('/api/admin/courses?' + params.toString(), { credentials: 'include' });
      const d = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));

      total = typeof d.total === 'number' ? d.total : 0;
      totalPages = Math.max(1, d.total_pages != null ? d.total_pages : Math.ceil(total / pageSize));

      const courses = Array.isArray(d.courses) ? d.courses : [];
      tbody.innerHTML = '';

      if (!courses.length) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML =
          '<td colspan="5" class="px-8 py-10 text-center text-slate-400 font-medium">No courses match this filter.</td>';
        tbody.appendChild(emptyRow);
      } else {
        tbody.innerHTML = courses.map(buildRowHtml).join('');
        updateRowActionBindings();
      }

      const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
      const end = Math.min(currentPage * pageSize, total);
      if (pageRangeEl) pageRangeEl.textContent = start ? start + '-' + end : '0';
      if (totalEl) totalEl.textContent = String(total);
      if (pageIndicator) pageIndicator.textContent = 'Page ' + currentPage + ' / ' + totalPages;
      if (statTotal) statTotal.textContent = String(total);

      if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.classList.toggle('opacity-50', currentPage <= 1);
      }
      if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.classList.toggle('opacity-50', currentPage >= totalPages);
      }
    }

    menu.querySelectorAll('button[data-action]').forEach(function (item) {
      item.addEventListener('click', async function () {
        const action = item.getAttribute('data-action') || '';
        closeRowMenu();
        if (action === 'edit') {
          if (!selectedCourseId) return;
          window.location.href =
            'admin_course_editor.html?id=' + encodeURIComponent(selectedCourseId);
          return;
        }
        if (action === 'view') {
          if (!selectedCourseId) return;
          const url =
            window.location.origin + DETAIL_PAGE + '?id=' + encodeURIComponent(selectedCourseId);
          window.open(url, '_blank', 'noopener,noreferrer');
          return;
        }
        if (action === 'archive') {
          if (!selectedCourseId) return;
          try {
            const r = await fetch(
              '/api/admin/courses/' + encodeURIComponent(selectedCourseId) + '/status',
              {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived' })
              }
            );
            const d = await r.json().catch(function () {
              return {};
            });
            if (!r.ok) throw new Error(d.error || 'Archive failed');
            showToast('Archived: ' + selectedCourseName);
            fetchCourses().catch(function (e) {
              showToast(String(e.message || e), 'error');
            });
          } catch (e) {
            showToast(String(e.message || e), 'error');
          }
        }
      });
    });

    prevBtn?.addEventListener('click', function () {
      if (currentPage <= 1) return;
      currentPage -= 1;
      fetchCourses().catch(function (e) {
        showToast(String(e.message || e), 'error');
      });
    });
    nextBtn?.addEventListener('click', function () {
      if (currentPage >= totalPages) return;
      currentPage += 1;
      fetchCourses().catch(function (e) {
        showToast(String(e.message || e), 'error');
      });
    });

    document.addEventListener(
      'click',
      function (event) {
        const t = event.target;
        if (!(t instanceof Element)) return;
        if (!menu.contains(t) && !t.closest('.row-action-btn')) closeRowMenu();
      },
      true
    );
    window.addEventListener('resize', closeRowMenu);
    window.addEventListener('scroll', closeRowMenu, true);

    const advancedFilterBtn = document.getElementById('advanced-filter-btn');
    const filterPanel = document.createElement('div');
    filterPanel.id = 'advanced-filter-panel';
    filterPanel.className =
      'hidden fixed top-0 left-0 w-full h-full z-[160] bg-slate-900/30 backdrop-blur-sm items-center justify-center p-4';
    filterPanel.innerHTML =
      '<div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5">' +
      '<div class="flex items-center justify-between">' +
      '<h3 class="text-xl font-black font-headline text-on-surface">Advanced Filter</h3>' +
      '<button id="filter-close" class="p-2 rounded-full hover:bg-surface-container-low"><span class="material-symbols-outlined">close</span></button>' +
      '</div>' +
      '<div>' +
      '<p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Course Status</p>' +
      '<div class="grid grid-cols-2 gap-2">' +
      '<button data-status="all" class="status-filter-btn px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold">All</button>' +
      '<button data-status="published" class="status-filter-btn px-3 py-2 rounded-xl bg-surface-container-low text-on-surface text-sm font-bold">Published</button>' +
      '<button data-status="draft" class="status-filter-btn px-3 py-2 rounded-xl bg-surface-container-low text-on-surface text-sm font-bold">Draft</button>' +
      '<button data-status="archived" class="status-filter-btn px-3 py-2 rounded-xl bg-surface-container-low text-on-surface text-sm font-bold">Archived</button>' +
      '</div></div>' +
      '<div class="flex items-center gap-3 pt-2">' +
      '<button id="filter-reset" class="flex-1 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-bold">Reset</button>' +
      '<button id="filter-apply" class="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold">Apply</button>' +
      '</div></div>';
    document.body.appendChild(filterPanel);

    let pendingStatusFilter = 'all';
    function setFilterSelection (value) {
      pendingStatusFilter = value;
      filterPanel.querySelectorAll('.status-filter-btn').forEach(function (btn) {
        const active = (btn.dataset.status || '') === value;
        btn.classList.toggle('bg-primary', active);
        btn.classList.toggle('text-white', active);
        btn.classList.toggle('bg-surface-container-low', !active);
        btn.classList.toggle('text-on-surface', !active);
      });
    }

    advancedFilterBtn?.addEventListener('click', function () {
      pendingStatusFilter = activeStatusFilter;
      setFilterSelection(pendingStatusFilter);
      filterPanel.classList.remove('hidden');
      filterPanel.classList.add('flex');
    });
    filterPanel.addEventListener('click', function (event) {
      if (event.target === filterPanel) {
        filterPanel.classList.add('hidden');
        filterPanel.classList.remove('flex');
      }
    });
    filterPanel.querySelectorAll('.status-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setFilterSelection(btn.dataset.status || 'all');
      });
    });
    filterPanel.querySelector('#filter-close').addEventListener('click', function () {
      filterPanel.classList.add('hidden');
      filterPanel.classList.remove('flex');
    });
    filterPanel.querySelector('#filter-reset').addEventListener('click', function () {
      setFilterSelection('all');
    });
    filterPanel.querySelector('#filter-apply').addEventListener('click', function () {
      activeStatusFilter = pendingStatusFilter;
      currentPage = 1;
      filterPanel.classList.add('hidden');
      filterPanel.classList.remove('flex');
      showToast('Filter: ' + activeStatusFilter);
      fetchCourses().catch(function (e) {
        showToast(String(e.message || e), 'error');
      });
    });

    const directCreateBtn = document.getElementById('direct-create-btn');
    directCreateBtn?.addEventListener('click', function () {
      window.location.href = 'admin_course_editor.html?new=1';
    });

    fetchCourses().catch(function (e) {
      showToast(String(e.message || e), 'error');
    });
  });
})();
