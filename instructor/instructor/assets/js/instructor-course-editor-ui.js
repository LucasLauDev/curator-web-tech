/**
 * Instructor course editor: outline scroll links, uploads, YouTube list, quiz add/edit.
 * English UI only. Loads after instructor-interactions.js (uses window.showToast when available).
 */
(function () {
  'use strict';

  function toastSafe(msg, kind) {
    var k = kind || 'info';
    if (typeof window.showToast === 'function') window.showToast(msg, k === 'error' ? 'error' : 'info');
  }

  function youtubeVideoId(raw) {
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

  function initScrollOutline() {
    document.querySelectorAll('[data-ce-scrollto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-ce-scrollto');
        var el = id ? document.getElementById(id) : null;
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelectorAll('[data-ce-scrollto]').forEach(function (b) {
          b.classList.remove('ce-outline-active');
          b.classList.add('text-on-surface-variant', 'font-bold');
        });
        btn.classList.add('ce-outline-active');
        btn.classList.remove('text-on-surface-variant');
      });
    });
  }

  function initLectureUpload() {
    var btn = document.getElementById('ce-add-sample-file');
    var list = document.getElementById('ce-lecture-file-list');
    if (!btn || !list) return;

    btn.addEventListener('click', function () {
      var row = document.createElement('div');
      row.className =
        'flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 mt-3';
      row.innerHTML =
        '<div class="flex items-center gap-3 min-w-0"><span class="material-symbols-outlined text-secondary">description</span>' +
        '<div class="min-w-0"><p class="text-sm font-bold truncate">Sample notes.pdf</p>' +
        '<p class="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">Sample · demo row</p></div></div>' +
        '<button type="button" class="ce-lecture-remove text-on-surface-variant hover:text-red-500"><span class="material-symbols-outlined">delete</span></button>';
      row.querySelector('.ce-lecture-remove')?.addEventListener('click', function () {
        row.remove();
      });
      list.appendChild(row);
      toastSafe('Added a sample file row (visual only).', 'info');
    });
  }

  function initVideoTabs() {
    var tabs = document.querySelectorAll('[data-ce-video-tab]');
    var urlPanel = document.getElementById('ce-video-panel-url');
    var upPanel = document.getElementById('ce-video-panel-upload');
    if (!tabs.length) return;

    function setTab(name) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-ce-video-tab') === name;
        t.classList.toggle('ce-video-tab-active', on);
        t.classList.toggle('bg-white', on);
        t.classList.toggle('shadow-sm', on);
        t.classList.toggle('font-bold', on);
        t.classList.toggle('font-medium', !on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (urlPanel) urlPanel.classList.toggle('hidden', name !== 'url');
      if (upPanel) upPanel.classList.toggle('hidden', name !== 'upload');
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        setTab(t.getAttribute('data-ce-video-tab') || 'url');
      });
    });
    setTab('url');

    var list = document.getElementById('ce-youtube-embed-list');
    var input = document.getElementById('ce-youtube-url-input');
    var submit = document.getElementById('ce-youtube-submit');
    var err = document.getElementById('ce-youtube-url-error');

    function addYoutubeEmbed(url) {
      var id = youtubeVideoId(url);
      if (!id) {
        if (err) {
          err.textContent = 'Enter a valid YouTube watch, youtu.be, shorts, or embed URL.';
          err.classList.remove('hidden');
        }
        return;
      }
      if (err) {
        err.textContent = '';
        err.classList.add('hidden');
      }
      if (!list) return;
      var wrap = document.createElement('div');
      wrap.className = 'space-y-2 rounded-2xl border border-outline-variant/15 overflow-hidden bg-black/5';
      wrap.innerHTML =
        '<div class="flex items-center justify-between gap-2 px-3 py-2 bg-surface-container-low text-xs font-bold">' +
        '<span class="truncate text-on-surface">' +
        String(url).replace(/</g, '&lt;') +
        '</span>' +
        '<button type="button" class="text-on-surface-variant hover:text-red-500 ce-yt-remove" aria-label="Remove video">' +
        '<span class="material-symbols-outlined text-sm">close</span></button></div>' +
        '<div class="aspect-video bg-black">' +
        '<iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/' +
        id +
        '" title="YouTube preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
      wrap.querySelector('.ce-yt-remove')?.addEventListener('click', function () {
        wrap.remove();
      });
      list.appendChild(wrap);
      if (input) input.value = '';
    }

    submit?.addEventListener('click', function () {
      var url = (input && input.value ? input.value : '').trim();
      if (!url) {
        if (err) {
          err.textContent = 'Paste a YouTube link first.';
          err.classList.remove('hidden');
        }
        return;
      }
      addYoutubeEmbed(url);
    });

  }

  function initQuizBuilder() {
    var host = document.getElementById('ce-quiz-questions');
    var addBtn = document.getElementById('ce-add-question-btn');
    if (!host || !addBtn) return;

    var qIndex = 0;
    host.querySelectorAll('[data-ce-question-id]').forEach(function (el) {
      var n = parseInt(String(el.getAttribute('data-ce-question-id') || '0'), 10);
      if (!isNaN(n) && n > qIndex) qIndex = n;
    });
    if (!qIndex) qIndex = 1;

    function bindQuestion(root) {
      var qid = root.getAttribute('data-ce-question-id');
      if (!qid) return;

      root.querySelectorAll('.ce-quiz-option').forEach(function (row) {
        row.addEventListener('click', function (e) {
          if (e.target && String(e.target.tagName || '').toUpperCase() === 'INPUT') return;
          var radio = row.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            root.querySelectorAll('.ce-quiz-option').forEach(function (r) {
              r.classList.remove('border-primary/40', 'ring-2', 'ring-primary/20', 'shadow-sm');
              r.classList.add('border-outline-variant/10');
            });
            row.classList.add('border-primary/40', 'ring-2', 'ring-primary/20', 'shadow-sm');
            row.classList.remove('border-outline-variant/10');
          }
        });
      });

      root.querySelectorAll('input[type="radio"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          var row = radio.closest('.ce-quiz-option');
          root.querySelectorAll('.ce-quiz-option').forEach(function (r) {
            r.classList.remove('border-primary/40', 'ring-2', 'ring-primary/20', 'shadow-sm');
            r.classList.add('border-outline-variant/10');
          });
          if (row) {
            row.classList.add('border-primary/40', 'ring-2', 'ring-primary/20', 'shadow-sm');
            row.classList.remove('border-outline-variant/10');
          }
        });
      });

      root.querySelector('.ce-quiz-delete')?.addEventListener('click', function () {
        root.remove();
      });
    }

    host.querySelectorAll('[data-ce-question-id]').forEach(bindQuestion);

    function addQuestion() {
      qIndex += 1;
      var name = 'q_' + qIndex + '_' + Date.now();
      var div = document.createElement('div');
      div.setAttribute('data-ce-question-id', String(qIndex));
      div.className =
        'p-6 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 space-y-6 ce-quiz-question-block';
      div.innerHTML =
        '<div class="flex justify-between items-start">' +
        '<span class="px-3 py-1 bg-white text-on-surface-variant text-[10px] font-black rounded-lg border border-outline-variant/10">QUESTION ' +
        qIndex +
        '</span>' +
        '<button type="button" class="text-outline hover:text-red-500 transition-colors ce-quiz-delete" aria-label="Delete question">' +
        '<span class="material-symbols-outlined text-sm">delete</span></button></div>' +
        '<input type="text" placeholder="Type your question here..." class="ce-quiz-question-input w-full bg-transparent border-b-2 border-outline-variant/20 py-2 text-lg font-bold focus:border-primary focus:ring-0 transition-all" />' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 ce-quiz-options">' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/10 cursor-pointer">' +
        '<input type="radio" name="' +
        name +
        '" class="text-primary focus:ring-primary/20 shrink-0" />' +
        '<input type="text" class="ce-quiz-option-input flex-1 min-w-0 bg-transparent border-none text-sm font-medium focus:ring-0" value="Option A" /></div>' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/10 cursor-pointer">' +
        '<input type="radio" name="' +
        name +
        '" class="text-primary focus:ring-primary/20 shrink-0" />' +
        '<input type="text" class="ce-quiz-option-input flex-1 min-w-0 bg-transparent border-none text-sm font-medium focus:ring-0" value="Option B" /></div>' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/10 cursor-pointer">' +
        '<input type="radio" name="' +
        name +
        '" class="text-primary focus:ring-primary/20 shrink-0" />' +
        '<input type="text" class="ce-quiz-option-input flex-1 min-w-0 bg-transparent border-none text-sm font-medium focus:ring-0" value="Option C" /></div>' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/10 cursor-pointer">' +
        '<input type="radio" name="' +
        name +
        '" checked class="text-primary focus:ring-primary/20 shrink-0" />' +
        '<input type="text" class="ce-quiz-option-input flex-1 min-w-0 bg-transparent border-none text-sm font-medium focus:ring-0" value="Option D" /></div>' +
        '</div>';
      var first = div.querySelector('.ce-quiz-option');
      if (first) {
        first.classList.add('border-primary/40', 'ring-2', 'ring-primary/20');
        first.classList.remove('border-outline-variant/10');
      }
      host.appendChild(div);
      bindQuestion(div);
    }

    addBtn.addEventListener('click', addQuestion);

    host.querySelectorAll('[data-ce-question-id]').forEach(function (block) {
      var firstChecked = block.querySelector('input[type="radio"]:checked');
      if (firstChecked) {
        var row = firstChecked.closest('.ce-quiz-option');
        if (row) {
          row.classList.add('border-primary/40', 'ring-2', 'ring-primary/20');
          row.classList.remove('border-outline-variant/10');
        }
      }
    });
  }

  function init() {
    if (!document.getElementById('ce-course-editor-main')) return;
    initScrollOutline();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
