(function () {

  'use strict';



  function qp (k) {

    return new URLSearchParams(window.location.search).get(k);

  }



  function escHtml (s) {

    return String(s ?? '')

      .replace(/&/g, '&amp;')

      .replace(/</g, '&lt;')

      .replace(/\"/g, '&quot;')

      .replace(/'/g, '&#039;');

  }



  function youtubeId (raw) {

    var s = String(raw || '').trim();

    if (!s) return null;

    try {

      if (/^[\w-]{11}$/.test(s)) return s;

      var u = new URL(s);

      var h = (u.hostname || '').toLowerCase();

      if (h === 'youtu.be') {

        var p = u.pathname.replace(/^\//, '').split('/')[0];

        return p && p.length === 11 ? p : null;

      }

      if (!h.includes('youtube.com') && !h.includes('youtube-nocookie.com')) return null;

      var v = u.searchParams.get('v');

      if (v && v.length === 11) return v;

      var m = u.pathname.match(/\/shorts\/([\w-]{11})/);

      if (m) return m[1];

      m = u.pathname.match(/\/embed\/([\w-]{11})/);

      if (m) return m[1];

    } catch (_e) {

      return null;

    }

    return null;

  }



  function quizCountFor (mod) {

    return Math.max(0, Number(mod && mod.quiz_question_count) || 0);

  }



  function isLearnCanTrackProgress (data) {

    var raw = data.can_track_module_progress;

    if (raw === true || raw === 1) return true;

    if (raw === false || raw === 0) return false;

    if (typeof raw === 'string') {

      var s = raw.toLowerCase();

      if (s === 'true') return true;

      if (s === 'false') return false;

    }

    var pct = Number(data.progress_percent);

    if (pct > 0) return true;

    var mods = data.modules;

    if (Array.isArray(mods)) {

      for (var i = 0; i < mods.length; i++) {

        if (mods[i].completed) return true;

      }

    }

    return !!raw;

  }



  var state = {

    courseId: null,

    modules: [],

    activeIndex: 0,

    canTrackModuleProgress: false,

    courseProgressPct: 0

  };



  function setProgressRing (pct) {

    var ring = document.getElementById('current-course-ring');

    var lbl = document.getElementById('current-course-percent');

    var v = Math.max(0, Math.min(100, Number(pct) || 0));

    state.courseProgressPct = v;

    var c = 351.85;

    if (ring) ring.setAttribute('stroke-dashoffset', String(c * (1 - v / 100)));

    if (lbl) lbl.textContent = v + '%';

    toggleCongrats();

    return v;

  }



  function toggleCongrats () {

    var el = document.getElementById('cd-congrats');

    if (!el) return;

    var v = Math.max(0, Math.min(100, Number(state.courseProgressPct) || 0));

    var allDone =

      state.modules.length > 0 && state.modules.every(function (m) { return !!m.completed; });

    if (v >= 100 || allDone) {

      el.classList.remove('hidden');

    } else {

      el.classList.add('hidden');

    }

  }



  function scrollToLessonPanel () {

    window.requestAnimationFrame(function () {

      var el = document.getElementById('cd-lesson-panel');

      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    });

  }



  function indexFirstIncomplete () {

    for (var i = 0; i < state.modules.length; i++) {

      if (!state.modules[i].completed) return i;

    }

    return state.modules.length ? 0 : 0;

  }



  function updateModuleNavButtons () {

    var prev = document.getElementById('cd-module-prev');

    var next = document.getElementById('cd-module-next');

    var n = state.modules.length;

    if (prev) {

      prev.disabled = state.activeIndex <= 0 || n <= 1;

    }

    if (next) {

      next.disabled = state.activeIndex >= n - 1 || n <= 1;

    }

  }



  function updateQuizFeatureCard (mod) {

    var qa = document.getElementById('cd-quiz-link');

    if (!qa) return;

    var qc = quizCountFor(mod);

    qa.classList.toggle('opacity-45', qc === 0);

    qa.classList.toggle('pointer-events-none', qc === 0);

    if (qc > 0) {

      qa.setAttribute('href', '#cd-quiz-nav');

    } else {

      qa.setAttribute('href', '#cd-lesson-panel');

    }

  }



  function updateQuizNavigateSection (mod) {

    updateQuizFeatureCard(mod);



    var hasEl = document.getElementById('cd-quiz-nav-has');

    var noneEl = document.getElementById('cd-quiz-nav-none');

    var link = document.getElementById('cd-quiz-page-link');

    var titleEl = document.getElementById('cd-quiz-nav-title');

    var lead = document.getElementById('cd-quiz-nav-lead');



    if (!hasEl || !noneEl) return;



    var qc = quizCountFor(mod);



    if (qc > 0 && state.courseId && mod && mod.id) {

      var q =

        '../quiz/interactive_quiz_ui.html?courseId=' +

        encodeURIComponent(state.courseId) +

        '&moduleId=' +

        encodeURIComponent(mod.id);



      hasEl.classList.remove('hidden');

      noneEl.classList.add('hidden');

      if (link) link.href = q;

      if (titleEl) titleEl.textContent = mod.title ? 'Quiz · ' + mod.title : 'Module quiz';

      if (lead) {

        lead.textContent =

          'Continue on the dedicated quiz screen. Your answers are tracked for this course and module.';

      }

    } else {

      hasEl.classList.add('hidden');

      noneEl.classList.remove('hidden');

    }

  }



  function renderTeachingTeam (team) {

    var host = document.getElementById('cd-teaching-team');

    var ul = document.getElementById('cd-teaching-team-list');

    if (!host || !ul) return;

    ul.innerHTML = '';

    if (!Array.isArray(team) || !team.length) {

      host.classList.add('hidden');

      return;

    }

    host.classList.remove('hidden');

    team.forEach(function (p) {

      var li = document.createElement('li');

      li.innerHTML =

        '<span class="font-bold">' +

        escHtml(p.name) +

        '</span>' +

        (p.title ? ' · <span class="text-slate-600">' + escHtml(p.title) + '</span>' : '') +

        ' <span class="text-slate-400 text-xs">' +

        escHtml(p.role_label || '') +

        '</span>';

      ul.appendChild(li);

    });

  }



  function wireModuleDoneCheckbox () {

    var wrap = document.getElementById('cd-module-complete-wrap');

    var cb = document.getElementById('cd-module-done-cb');

    if (!wrap || !cb) return;

    if (!state.canTrackModuleProgress) {

      wrap.classList.add('hidden');

      return;

    }

    wrap.classList.remove('hidden');

    var mod = state.modules[state.activeIndex];

    if (!mod || !mod.id) {

      wrap.classList.add('hidden');

      return;

    }

    cb.checked = !!mod.completed;

    cb.onchange = function () {

      var want = !!cb.checked;

      var mid = mod.id;

      fetch(

        '/api/courses/' +

          encodeURIComponent(state.courseId || '') +

          '/modules/' +

          encodeURIComponent(mid) +

          '/complete',

        {

          method: 'POST',

          credentials: 'include',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ done: want })

        }

      )

        .then(function (r) {

          return r.json().then(function (d) {

            return { r: r, d: d };

          });

        })

        .then(function (out) {

          if (!out.r.ok) throw new Error(out.d.error || 'Could not save');

          mod.completed = want;

          if (typeof out.d.progress_percent === 'number') {

            setProgressRing(out.d.progress_percent);

          }

          var sel2 = document.getElementById('cd-module-select');

          if (sel2 && sel2.options.length) {

            state.modules.forEach(function (mx, ix) {

              if (sel2.options[ix]) sel2.options[ix].textContent = (mx.completed ? '\u2713 ' : '') + (mx.title || 'Module');

            });

          }

        })

        .catch(function (e) {

          cb.checked = !want;

          alert(String(e.message || e));

        });

    };

  }



  function renderModule () {

    var mod = state.modules[state.activeIndex];

    if (!mod) return;

    updateQuizNavigateSection(mod);



    var title = document.getElementById('cd-module-title');

    if (title) title.textContent = mod.title || 'Module';



    var videoWrap = document.getElementById('cd-video-wrap');

    var vf = document.getElementById('cd-video-frame');

    if (vf) vf.innerHTML = '';

    var yid = youtubeId(mod.video_url);

    if (videoWrap && vf) {

      if (yid) {

        videoWrap.classList.remove('hidden');

        var iframe = document.createElement('iframe');

        iframe.className = 'w-full h-full';

        iframe.setAttribute(

          'src',

          'https://www.youtube-nocookie.com/embed/' + yid + '?rel=0'

        );

        iframe.title = 'Video';

        iframe.setAttribute(

          'allow',

          'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture'

        );

        iframe.setAttribute('allowfullscreen', '');

        vf.appendChild(iframe);

      } else {

        videoWrap.classList.add('hidden');

        vf.innerHTML = '';

      }

    }



    var sumWrap = document.getElementById('cd-notes-summary-wrap');

    var sumEl = document.getElementById('cd-notes-summary');

    var sumText =

      typeof mod.lecture_notes_summary === 'string'

        ? mod.lecture_notes_summary.trim()

        : '';

    if (sumWrap && sumEl) {

      if (sumText) {

        sumWrap.classList.remove('hidden');

        sumEl.textContent = sumText;

      } else {

        sumWrap.classList.add('hidden');

        sumEl.textContent = '';

      }

    }



    var aboutWrap = document.getElementById('cd-about-module-wrap');

    var notes = document.getElementById('cd-lesson-notes');

    var desc = typeof mod.description === 'string' ? mod.description.trim() : '';

    if (aboutWrap && notes) {

      if (desc) {

        aboutWrap.classList.remove('hidden');

        notes.textContent = desc;

      } else {

        aboutWrap.classList.add('hidden');

        notes.textContent = '';

      }

    }



    var ul = document.getElementById('cd-sample-files');

    var emptyBox = document.getElementById('cd-sample-files-empty');

    if (ul) {

      ul.innerHTML = '';

      var sf = Array.isArray(mod.sample_files) ? mod.sample_files : [];

      if (!sf.length) {

        ul.classList.add('hidden');

        if (emptyBox) emptyBox.classList.remove('hidden');

      } else {

        ul.classList.remove('hidden');

        if (emptyBox) emptyBox.classList.add('hidden');

        sf.forEach(function (f) {

          var li = document.createElement('li');

          li.className = 'px-5 py-4 flex flex-wrap items-center gap-4 hover:bg-slate-50/80 transition-colors';

          var rawUrl = typeof f.url === 'string' ? f.url.trim() : '';

          var displayMain =

            typeof f.display_name === 'string' && f.display_name.trim()

              ? f.display_name.trim()

              : f.name || 'Material';



          var left = document.createElement('div');

          left.className = 'flex items-center gap-3 min-w-0 flex-1';

          var meta = '';

          if (f.size_label) {

            meta = '<p class="text-xs text-slate-500">' + escHtml(String(f.size_label)) + '</p>';

          }

          left.innerHTML =

            '<span class="material-symbols-outlined text-slate-400 shrink-0">description</span>' +

            '<div class="min-w-0"><p class="text-sm font-bold text-on-surface truncate">' +

            escHtml(displayMain) +

            '</p>' +

            meta +

            '</div>';



          var right = document.createElement('div');

          right.className = 'shrink-0';

          if (rawUrl) {

            var a = document.createElement('a');

            a.href = rawUrl;

            a.textContent = 'Open';

            a.className =

              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/15 transition-colors';

            a.target = '_blank';

            a.rel = 'noopener noreferrer';

            if (typeof f.download_name === 'string' && f.download_name.trim()) {

              a.setAttribute('download', f.download_name.trim());

            }

            right.appendChild(a);

          } else {

            var s = document.createElement('span');

            s.className = 'text-xs text-slate-400 italic';

            s.textContent = 'No download link';

            right.appendChild(s);

          }



          li.appendChild(left);

          li.appendChild(right);

          ul.appendChild(li);

        });

      }

    }



    var tb = document.getElementById('lesson-tbody');

    if (tb) {

      var qn = quizCountFor(mod);

      tb.innerHTML =

        '<tr><td colspan="4" class="py-4 text-sm text-slate-600">' +

        "<span class=\"font-semibold\">" +

        escHtml(mod.title || 'This module') +

        '</span> — ' +

        (yid

          ? 'Use the video and materials above. '

          : 'This module uses text and downloadable materials above. ') +

        (qn > 0

          ? 'After the materials above, scroll to <strong class=\"font-semibold text-on-surface\">Module quiz</strong> and tap <strong class=\"font-semibold text-on-surface\">Open quiz page</strong> (same module on the quiz screen).'

          : 'No quiz is published for this module.') +

        '</td></tr>';

    }



    var selSync = document.getElementById('cd-module-select');

    if (selSync && selSync.options.length === state.modules.length) {

      state.modules.forEach(function (m, ix) {

        if (selSync.options[ix])

          selSync.options[ix].textContent =

            (m.completed ? '\u2713 ' : '') + (m.title || 'Module');

      });

      selSync.value = String(state.activeIndex);

    }



    updateModuleNavButtons();

    wireModuleDoneCheckbox();

    toggleCongrats();

  }



  function goModuleRelative (delta) {

    var n = state.modules.length;

    var next = state.activeIndex + delta;

    if (next < 0 || next >= n || n === 0) return;

    state.activeIndex = next;

    var sel = document.getElementById('cd-module-select');

    if (sel && sel.options.length) sel.value = String(next);

    renderModule();

    scrollToLessonPanel();

  }



  /** Fills switcher immediately with current title; pass full `enrolled` when enrolled API resolves. */

  function populateOtherCourseSelector (pageCourseId, courseTitle, enrolledCourses) {

    var ocs = document.getElementById('other-course-selector');

    if (!ocs) return;

    var courses = Array.isArray(enrolledCourses) ? enrolledCourses : [];



    ocs.innerHTML = '';



    if (!courses.length) {

      var one = document.createElement('option');

      one.value = pageCourseId;

      one.selected = true;

      one.textContent = courseTitle || pageCourseId || 'This course';

      ocs.appendChild(one);

    } else {

      courses.forEach(function (c) {

        var o = document.createElement('option');

        o.value = c.id;

        o.textContent = c.title || c.id;

        if (String(c.id) === String(pageCourseId)) o.selected = true;

        ocs.appendChild(o);

      });

    }



    if (!ocs.dataset.cdSwitchBound) {

      ocs.dataset.cdSwitchBound = '1';

      ocs.addEventListener('change', function () {

        if (ocs.value && ocs.value !== pageCourseId) {

          window.location.href =

            'course_detail.html?courseId=' + encodeURIComponent(ocs.value);

        }

      });

    }

  }



  document.addEventListener('DOMContentLoaded', async function () {

    var cid = qp('courseId');

    state.courseId = cid;

    if (!cid) {

      var d0 = document.getElementById('current-course-desc');

      if (d0) d0.textContent = 'Open this page from a course (add ?courseId=\u2026) to load lessons.';

      return;

    }



    try {

      var learnP = fetch('/api/courses/' + encodeURIComponent(cid) + '/learn', {

        credentials: 'include'

      }).then(function (r) {

        return r.json().then(function (d) {

          return { r: r, d: d };

        });

      });








      var learnOut = await learnP;

      if (!learnOut.r.ok) throw new Error(learnOut.d.error || 'Sign in and enroll to view lessons.');

      var data = learnOut.d;



      var enrollFromLearn = Array.isArray(data.enrolled_courses) ? data.enrolled_courses : null;



      var titleEl = document.getElementById('current-course-title');

      var thumbEl = document.getElementById('current-course-thumb');

      var descEl = document.getElementById('current-course-desc');



      if (titleEl) titleEl.textContent = data.course_title || 'Course';

      if (descEl) descEl.textContent = (data.course_description || '').trim() || '\u2014';



      populateOtherCourseSelector(cid, data.course_title || 'Course', enrollFromLearn || []);



      state.canTrackModuleProgress = isLearnCanTrackProgress(data);

      renderTeachingTeam(data.teaching_team);



      setProgressRing(data.progress_percent);



      if (thumbEl && data.thumbnail_url) thumbEl.src = data.thumbnail_url;



      state.modules = data.modules || [];

      state.activeIndex = indexFirstIncomplete();



      var sel = document.getElementById('cd-module-select');

      if (sel) {

        sel.innerHTML = '';

        state.modules.forEach(function (m, i) {

          var o = document.createElement('option');

          o.value = String(i);

          o.textContent = (m.completed ? '\u2713 ' : '') + (m.title || 'Module');

          sel.appendChild(o);

        });

        sel.value = String(state.activeIndex);

        sel.onchange = function () {

          state.activeIndex = Number(sel.value) || 0;

          renderModule();

          scrollToLessonPanel();

        };

      }



      var prevBtn = document.getElementById('cd-module-prev');

      var nextBtn = document.getElementById('cd-module-next');

      if (prevBtn) prevBtn.addEventListener('click', function () {

        goModuleRelative(-1);

      });

      if (nextBtn) nextBtn.addEventListener('click', function () {

        goModuleRelative(1);

      });



      renderModule();



      setTimeout(scrollToLessonPanel, 280);



      if (!enrollFromLearn) {

        var enrOut = await fetch('/api/student/courses/enrolled', { credentials: 'include' }).then(function (r) {

          return r.json().then(function (d) {

            return { r: r, d: d };

          });

        });

        populateOtherCourseSelector(

          cid,

          data.course_title || 'Course',

          enrOut.r.ok ? enrOut.d.courses || [] : []

        );

      }

    } catch (e) {

      var d1 = document.getElementById('current-course-desc');

      if (d1) d1.textContent = String(e.message || e);

    }

  });

})();