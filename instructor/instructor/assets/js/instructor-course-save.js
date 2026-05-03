(function () {
  'use strict';

  var loadedThumbUrl = '';

  function qp (k) {
    return new URLSearchParams(window.location.search).get(k);
  }

  function isAdminEditor () {
    return document.documentElement.hasAttribute('data-admin-course-editor');
  }

  function toastSafe (msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind === 'error' ? 'error' : 'info');
    else alert(msg);
  }

  function apiCoursesPrefix () {
    return isAdminEditor() ? '/api/admin/courses/' : '/api/instructor/courses/';
  }

  function catalogUrlAfterPublish () {
    return isAdminEditor() ? '../admin_course_catalog.html' : 'instructor_my_courses.html';
  }

  function editorPageName () {
    return isAdminEditor() ? '../admin_course_editor.html' : 'instructor_course_editor.html';
  }

  function modulesFromGather () {
    if (typeof window.ceGatherModulesPayload === 'function') {
      var m = window.ceGatherModulesPayload();
      return Array.isArray(m) && m.length ? m : [{}];
    }
    return [{}];
  }

  function payloadFromUi (status) {
    return {
      title: (document.getElementById('ce-instructor-course-title')?.value || '').trim() || 'Untitled',
      faculty: 'Computing',
      category: 'technology',
      thumbnail_url: loadedThumbUrl || 'https://picsum.photos/seed/editor-thumb/960/540',
      description: (document.getElementById('ce-course-description')?.value || '').trim() || '',
      status: status,
      modules: modulesFromGather()
    };
  }

  async function populateAdminInstructors () {
    var sel = document.getElementById('ce-admin-instructor');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Choose instructor —</option>';
    var r = await fetch('/api/admin/instructors', { credentials: 'include' });
    var d = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) throw new Error(d.error || 'Cannot load instructors');
    var rows = Array.isArray(d.instructors) ? d.instructors : [];
    rows.forEach(function (row) {
      var opt = document.createElement('option');
      opt.value = String(row.id || '');
      opt.textContent = String(row.display_name || '').trim() || row.email || row.id || 'Instructor';
      sel.appendChild(opt);
    });
    if (
      rows.length === 0 &&
      typeof window.showToast === 'function'
    ) {
      window.showToast('No instructor accounts found. Register an instructor first.', 'error');
    }
  }

  async function adminCreateWorkflow () {
    var block = document.getElementById('ce-admin-create-block');
    var shell = document.getElementById('ce-course-editor-shell');
    if (block) block.classList.remove('hidden');
    if (shell) {
      shell.classList.add('pointer-events-none', 'opacity-50');
    }

    try {
      await populateAdminInstructors();
    } catch (e) {
      toastSafe(String(e.message || e), 'error');
      return;
    }

    function unlockShell () {
      if (shell) shell.classList.remove('pointer-events-none', 'opacity-50');
      if (block) block.classList.add('hidden');
    }

    var btn = document.getElementById('ce-admin-create-blank-course');
    if (!btn) {
      toastSafe('Editor misconfigured.', 'error');
      return;
    }
    btn.addEventListener(
      'click',
      async function () {
        var sel = document.getElementById('ce-admin-instructor');
        var iid = sel && sel.value ? String(sel.value).trim() : '';
        if (!iid) {
          toastSafe('Select an instructor first.', 'error');
          return;
        }
        btn.disabled = true;
        try {
          var r = await fetch('/api/admin/courses', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instructor_id: iid,
              title: 'New course',
              description: ''
            })
          });
          var d = await r.json().catch(function () {
            return {};
          });
          if (!r.ok) throw new Error(d.error || 'Create failed');
          unlockShell();
          window.location.replace(editorPageName() + '?id=' + encodeURIComponent(d.id));
        } catch (e) {
          toastSafe(String(e.message || e), 'error');
          btn.disabled = false;
        }
      },
      false
    );
  }

  async function createNewCourseAndRedirect () {
    try {
      var r = await fetch('/api/instructor/courses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New course' })
      });
      var d = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) throw new Error(d.error || 'Create failed');
      window.location.replace('instructor_course_editor.html?id=' + encodeURIComponent(d.id));
    } catch (e) {
      toastSafe(String(e.message || e), 'error');
    }
  }

  async function loadCourse (courseId) {
    try {
      var r = await fetch(apiCoursesPrefix() + encodeURIComponent(courseId) + '/edit', {
        credentials: 'include'
      });
      var d = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) throw new Error(d.error || 'Cannot load editor data');

      var c = d.course || {};
      var mods = d.modules || [];

      loadedThumbUrl = String(c.thumbnail_url || '').trim();

      var titleEl = document.getElementById('ce-instructor-course-title');
      if (titleEl) titleEl.value = c.title || '';

      var descEl = document.getElementById('ce-course-description');
      if (descEl) descEl.value = c.description || '';

      if (typeof window.ceClearAndLoadModules === 'function') {
        window.ceClearAndLoadModules(mods, c);
      }
    } catch (e) {
      toastSafe(String(e.message || e), 'error');
    }
  }

  async function save (status) {
    var cid = qp('id');
    if (!cid) {
      toastSafe('Missing course id', 'error');
      return;
    }
    try {
      var r = await fetch(apiCoursesPrefix() + encodeURIComponent(cid), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadFromUi(status))
      });
      var d = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) throw new Error(d.error || 'Save failed');
      toastSafe(status === 'published' ? 'Published.' : 'Draft saved.', 'info');
      if (status === 'published') {
        window.location.href = catalogUrlAfterPublish();
      }
    } catch (e) {
      toastSafe(String(e.message || e), 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', async function () {
    if (qp('new')) {
      if (isAdminEditor()) {
        await adminCreateWorkflow();
        return;
      }
      await createNewCourseAndRedirect();
      return;
    }
    var courseIdFinal = qp('id');
    if (!courseIdFinal) {
      toastSafe('Open the editor from My Courses, or use Create New Course.', 'info');
      return;
    }

    await loadCourse(courseIdFinal);

    document.getElementById('ce-btn-save-draft')?.addEventListener('click', function () {
      save('draft');
    });
    document.getElementById('ce-btn-publish')?.addEventListener('click', function () {
      save('published');
    });
  });
})();
