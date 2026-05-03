/**
 * Student community forum — inline comments per thread (localStorage).
 * Uses capture on document so it runs before the page's legacy bubble handlers (e.g. alert stubs).
 */
(function () {
  'use strict';

  var STORE = 'ce_student_forum_thread_comments_v1';

  function toast(msg) {
    var el = document.getElementById('ce-student-forum-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ce-student-forum-toast';
      el.className =
        'fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 max-w-[90vw] rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-xl opacity-0 transition-opacity duration-200 pointer-events-none';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove('opacity-0');
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.add('opacity-0');
    }, 2200);
  }

  function storageGet(key, def) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch (_e) {
      return def;
    }
  }

  function storageSet(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_e) {}
  }

  function resolveForumPostCardFromClick(btn) {
    if (!btn || btn.nodeType !== 1) return null;
    var feed = document.getElementById('forum-feed');
    if (feed && feed.contains(btn)) {
      var n = btn;
      for (var depth = 0; depth < 20 && n && n !== feed; depth++) {
        if (n.parentElement === feed) return n;
        n = n.parentElement;
      }
    }
    return btn.closest('.forum-post, [data-community-post], article, .bg-surface-container-lowest.rounded-xl') || btn.parentElement;
  }

  function openThreadComments(threadKey, postEl) {
    function load() {
      var all = storageGet(STORE, {});
      return Array.isArray(all[threadKey]) ? all[threadKey] : [];
    }
    function save(items) {
      var all = storageGet(STORE, {});
      all[threadKey] = items;
      storageSet(STORE, all);
    }
    function listHtml(arr) {
      if (!arr.length) {
        return '<p class="text-sm text-on-surface-variant py-2">No comments yet. Start the conversation.</p>';
      }
      return arr
        .map(function (c) {
          var body = String(c.body ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          var when = new Date(c.ts).toLocaleString();
          return (
            '<div class="flex gap-2.5">' +
            '<div class="w-8 h-8 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-black ring-2 ring-white">St</div>' +
            '<div class="min-w-0 flex-1">' +
            '<div class="inline-block max-w-full rounded-2xl bg-surface-container-low px-3.5 py-2 border border-surface-container">' +
            '<span class="text-xs font-bold text-on-background">Student</span>' +
            '<p class="text-sm text-on-surface mt-0.5 whitespace-pre-wrap break-words">' +
            body +
            '</p></div>' +
            '<p class="text-[11px] text-on-surface-variant mt-1 pl-1">' +
            when +
            '</p></div></div>'
          );
        })
        .join('');
    }

    function commitFromPanel(panel, input) {
      var v = (input && input.value ? input.value : '').trim();
      if (!v) {
        toast('Write something first');
        return;
      }
      var items = load();
      items.push({ ts: Date.now(), body: v });
      save(items);
      var listEl = panel.querySelector('[data-fc-list]');
      if (listEl) listEl.innerHTML = listHtml(items);
      if (input) input.value = '';
      toast('Reply posted');
    }

    if (!postEl || typeof postEl.querySelector !== 'function') return;

    var existing = postEl.querySelector('[data-thread-comments-panel]');
    if (existing) {
      existing.classList.toggle('hidden');
      if (!existing.classList.contains('hidden')) {
        var inp = existing.querySelector('[data-fc-input]');
        if (inp) inp.focus();
      }
      return;
    }

    var panel = document.createElement('div');
    panel.setAttribute('data-thread-comments-panel', '1');
    panel.className = 'forum-inline-comments mt-4 pt-4 border-t border-surface-container';
    panel.innerHTML =
      '<p class="text-xs text-on-surface-variant mb-3">Comments are saved in this browser for this thread.</p>' +
      '<div data-fc-list class="space-y-3 max-h-72 overflow-y-auto overscroll-contain pr-1">' +
      listHtml(load()) +
      '</div>' +
      '<div class="flex items-end gap-2.5 mt-3">' +
      '<div class="w-9 h-9 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-black ring-2 ring-white" title="You">St</div>' +
      '<div class="flex-1 min-w-0 rounded-2xl bg-surface-container-low border border-outline-variant shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-shadow">' +
      '<textarea data-fc-input rows="1" class="w-full bg-transparent border-0 rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-0 resize-none max-h-36 leading-snug" placeholder="Write a comment…"></textarea></div>' +
      '<button type="button" data-fc-post class="shrink-0 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:opacity-95 active:scale-[0.98] transition-transform">Post</button></div>';

    postEl.appendChild(panel);
    var input = panel.querySelector('[data-fc-input]');
    var postBtn = panel.querySelector('[data-fc-post]');
    if (postBtn) {
      postBtn.addEventListener('click', function () {
        commitFromPanel(panel, input);
      });
    }
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          commitFromPanel(panel, input);
        }
      });
      input.focus();
    }
  }

  function threadKeyFromPost(post, btn) {
    var raw = (post && post.querySelector && post.querySelector('h2') ? post.querySelector('h2').textContent : '') || 'thread';
    raw = String(raw)
      .trim()
      .slice(0, 160)
      .replace(/\s+/g, ' ')
      .toLowerCase();
    var course = '';
    try {
      course = new URLSearchParams(window.location.search).get('course') || '';
      if (course) course = decodeURIComponent(course.replace(/\+/g, ' ')).trim().toLowerCase();
    } catch (_e) {}
    return 'student:' + (course ? course + ':' : '') + raw;
  }

  document.addEventListener(
    'click',
    function (e) {
      var feed = document.getElementById('forum-feed');
      if (!feed || !feed.contains(e.target)) return;
      var btn = e.target.closest('button');
      if (!btn || !feed.contains(btn)) return;
      var iconEl = btn.querySelector('.material-symbols-outlined');
      var icon = (iconEl && iconEl.textContent ? iconEl.textContent : '').trim();
      if (icon !== 'chat_bubble' && icon !== 'forum') return;
      e.preventDefault();
      e.stopPropagation();
      var post = resolveForumPostCardFromClick(btn);
      openThreadComments(threadKeyFromPost(post, btn), post);
    },
    true
  );
})();
