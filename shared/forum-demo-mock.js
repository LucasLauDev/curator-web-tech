/**
 * Client-side forum feed: toasts and light actions on #forum-feed.
 * Session keys use prefix ce_forum_demo_.
 */
(function () {
  'use strict';

  var PREFIX = 'ce_forum_demo_';

  function clearSessionDemoOnReload() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') {
        var keys = [];
        for (var i = 0; i < sessionStorage.length; i++) {
          var k = sessionStorage.key(i);
          if (k && k.indexOf(PREFIX) === 0) keys.push(k);
        }
        keys.forEach(function (k) {
          sessionStorage.removeItem(k);
        });
      }
    } catch (_e) {}
  }

  clearSessionDemoOnReload();

  function ceForumDemoToast(msg, variant) {
    variant = variant || 'info';
    var el = document.getElementById('ce-forum-demo-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ce-forum-demo-toast';
      el.className =
        'fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 max-w-[min(100%,24rem)] rounded-2xl px-4 py-2.5 text-sm font-bold shadow-xl opacity-0 transition-opacity duration-200 pointer-events-none';
      document.body.appendChild(el);
    }
    var palette = {
      info: 'bg-slate-900 text-white',
      success: 'bg-emerald-700 text-white',
      error: 'bg-red-700 text-white',
    };
    el.className =
      'fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 max-w-[min(100%,24rem)] rounded-2xl px-4 py-2.5 text-sm font-bold shadow-xl transition-opacity duration-200 pointer-events-none ' +
      (palette[variant] || palette.info);
    el.textContent = msg;
    el.classList.remove('opacity-0');
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.add('opacity-0');
    }, 2400);
  }

  window.ceForumDemoToast = ceForumDemoToast;

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bodyToHtml(text) {
    return esc(text).replace(/\r\n/g, '\n').split(/\n/g, '<br>');
  }

  function collectTagLabels(form) {
    var labels = [];
    if (!form || !form.querySelectorAll) return labels;
    form.querySelectorAll('span').forEach(function (el) {
      var t = (el.textContent || '').trim();
      if (!t || t === '+ Add Tag' || /^\+/.test(t)) return;
      labels.push(t);
    });
    return labels;
  }

  function badgeFromTags(tags) {
    var t = tags[0] || 'General';
    if (t.startsWith('#')) t = t.slice(1);
    return t.slice(0, 40) || 'General';
  }

  function authorName() {
    var raw = document.body && document.body.getAttribute('data-forum-post-author');
    return (raw && String(raw).trim()) || 'You';
  }

  function buildPostCardHtml(title, bodyText, tags) {
    var badge = esc(badgeFromTags(tags));
    var auth = esc(authorName());
    var tagLine = tags.length
      ? '<p class="text-xs text-primary/80 font-label mt-2">' +
        tags
          .map(function (t) {
            return '<span class="mr-2">' + esc(t) + '</span>';
          })
          .join('') +
        '</p>'
      : '';
    return (
      '<div class="forum-post bg-surface-container-lowest rounded-xl p-6 border border-surface-container hover:border-primary/20 hover:shadow-md transition-all duration-200" data-community-post="1" data-ce-new-post="1">' +
      '<div class="flex gap-4">' +
      '<div class="flex flex-col items-center gap-2">' +
      '<div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-black text-xs ring-2 ring-white">CE</div>' +
      '<div class="w-0.5 flex-1 bg-surface-container"></div>' +
      '</div>' +
      '<div class="flex-1">' +
      '<div class="flex justify-between items-start mb-1">' +
      '<h3 class="font-bold text-on-background">' +
      auth +
      ' <span class="text-xs font-normal text-on-surface-variant ml-2">just now</span></h3>' +
      '<span class="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">' +
      badge +
      '</span>' +
      '</div>' +
      '<h2 class="text-lg font-headline font-extrabold mb-2 leading-tight">' +
      esc(title) +
      '</h2>' +
      '<p class="text-on-surface-variant text-sm leading-relaxed mb-2">' +
      bodyToHtml(bodyText) +
      '</p>' +
      tagLine +
      '<div class="flex gap-4 text-on-surface-variant mb-0">' +
      '<button type="button" class="flex items-center gap-1.5 hover:text-primary transition-colors">' +
      '<span class="material-symbols-outlined text-xl">favorite</span>' +
      '<span class="text-xs font-label">0</span>' +
      '</button>' +
      '<button type="button" class="flex items-center gap-1.5 hover:text-primary transition-colors">' +
      '<span class="material-symbols-outlined text-xl">chat_bubble</span>' +
      '<span class="text-xs font-label">0 comments</span>' +
      '</button>' +
      '<button type="button" class="ml-auto hover:text-primary transition-colors">' +
      '<span class="material-symbols-outlined text-xl">bookmark</span>' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function closeCreatePostShellIfAny() {
    var shell = document.getElementById('create-post');
    var base = window.location.pathname + window.location.search;
    try {
      if (window.history && window.location.hash === '#create-post') {
        window.history.replaceState(null, '', base);
      } else if (window.location.hash === '#create-post') {
        window.location.hash = '';
      }
    } catch (_e) {
      try {
        window.location.hash = '';
      } catch (_e2) {}
    }
    if (shell) {
      shell.style.setProperty('opacity', '0');
      shell.style.setProperty('pointer-events', 'none');
    }
  }

  function switchToLatestForumTab() {
    var feed = document.getElementById('forum-feed');
    if (!feed) return;
    var section = feed.closest('section') || feed.parentElement;
    var tabsWrap = section && section.querySelector('div.flex.gap-3.mb-8');
    if (!tabsWrap) return;
    var btns = tabsWrap.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].textContent || '').trim().toLowerCase() === 'latest') {
        btns[i].click();
        return;
      }
    }
  }

  window.ceSwitchToLatestForumTab = switchToLatestForumTab;

  function invalidateStudentForumPager() {
    if (typeof window.ceStudentForumFeedInvalidate === 'function') window.ceStudentForumFeedInvalidate();
    if (typeof window.ceForumCourseFilterApply === 'function') window.ceForumCourseFilterApply();
  }

  function wireForumFeed() {
    var feed = document.getElementById('forum-feed');
    if (!feed || feed.getAttribute('data-forum-demo-mock') === '1') return;
    feed.setAttribute('data-forum-demo-mock', '1');

    feed.addEventListener(
      'click',
      function (e) {
        var btn = e.target.closest('button');
        if (!btn || !feed.contains(btn)) return;

        var iconEl = btn.querySelector('.material-symbols-outlined');
        if (!iconEl) return;
        var icon = (iconEl.textContent || '').trim();

        if (icon === 'chat_bubble' || icon === 'forum') {
          return;
        }

        if (icon === 'arrow_upward' || icon === 'thumb_up' || icon === 'favorite') {
          e.preventDefault();
          var on = btn.classList.toggle('text-primary');
          if (icon === 'arrow_upward') {
            btn.classList.toggle('text-[#ff4500]', on);
          }
          var label = btn.querySelector('span.text-xs.font-label');
          if (label) {
            var t = (label.textContent || '').trim();
            var commentM = t.match(/^([\d,]+)\s*comments?$/i);
            if (commentM) {
              var cur = parseInt(commentM[1].replace(/,/g, ''), 10) || 0;
              var next = Math.max(0, cur + (on ? 1 : -1));
              label.textContent = next + (next === 1 ? ' comment' : ' comments');
            } else if (!/comment/i.test(t)) {
              var km = t.match(/^([\d.]+)k$/i);
              var base = km ? Math.round(parseFloat(km[1], 10) * 1000) : parseInt(t.replace(/[^\d]/g, ''), 10) || 0;
              var n2 = Math.max(0, base + (on ? 1 : -1));
              if (km) {
                label.textContent = (n2 / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
              } else {
                label.textContent = String(n2);
              }
            }
          }
          ceForumDemoToast(on ? 'Upvoted' : 'Removed your vote', 'success');
          return;
        }

        if (icon === 'ios_share' || icon === 'share') {
          e.preventDefault();
          var url = window.location.href.split('#')[0];
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(
              function () {
                ceForumDemoToast('Link copied to clipboard', 'success');
              },
              function () {
                ceForumDemoToast('Link copied to clipboard', 'success');
              }
            );
          } else {
            ceForumDemoToast('Link copied to clipboard', 'success');
          }
          return;
        }

        if (icon === 'star' || icon === 'bookmark' || icon === 'bookmark_border') {
          e.preventDefault();
          var saved = btn.classList.toggle('text-primary');
          if (icon === 'star') {
            iconEl.textContent = saved ? 'star' : 'star_outline';
            iconEl.style.fontVariationSettings = saved
              ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
              : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
          }
          ceForumDemoToast(saved ? 'Saved' : 'Removed from saved', 'success');
          return;
        }

        if (
          icon === 'flag' ||
          icon === 'outlined_flag' ||
          icon === 'flag_circle' ||
          icon === 'report' ||
          icon === 'report_problem'
        ) {
          e.preventDefault();
          ceForumDemoToast('Report submitted — we’ll review it.', 'success');
          return;
        }
      },
      false
    );
  }

  function wireCreatePostModal() {
    var root = document.getElementById('create-post');
    if (!root || root.getAttribute('data-forum-demo-composer') === '1') return;
    var form = root.querySelector('form');
    if (!form) return;
    if (form.id === 'instructor-forum-create-form') return;

    root.setAttribute('data-forum-demo-composer', '1');

    var topicInput = form.querySelector('input[type="text"], input:not([type])');
    var contentInput = form.querySelector('textarea');
    var draftKey = PREFIX + 'composer_draft';

    function loadDraft() {
      try {
        var s = sessionStorage.getItem(draftKey);
        return s ? JSON.parse(s) : null;
      } catch (_e) {
        return null;
      }
    }

    function saveDraftObj(d) {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify(d));
      } catch (_e) {}
    }

    var draft = loadDraft();
    if (draft && topicInput && !topicInput.value) topicInput.value = draft.title || '';
    if (draft && contentInput && !contentInput.value) contentInput.value = draft.content || '';

    form.querySelectorAll('button[type="button"]').forEach(function (b) {
      var txt = (b.textContent || '').trim().toLowerCase();
      if (txt.includes('save draft')) {
        b.addEventListener('click', function () {
          saveDraftObj({
            title: (topicInput && topicInput.value ? topicInput.value : '').trim(),
            content: (contentInput && contentInput.value ? contentInput.value : '').trim(),
          });
          ceForumDemoToast('Draft saved', 'success');
        });
      }
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var title = (topicInput && topicInput.value ? topicInput.value : '').trim();
      var content = (contentInput && contentInput.value ? contentInput.value : '').trim();
      if (!title || !content) {
        ceForumDemoToast('Please add a title and content', 'error');
        return;
      }
      try {
        sessionStorage.removeItem(draftKey);
      } catch (_e) {}

      var tags = collectTagLabels(form);
      var wrap = document.createElement('div');
      wrap.innerHTML = buildPostCardHtml(title, content, tags).trim();
      var card = wrap.firstElementChild;
      var feed = document.getElementById('forum-feed');

      if (card && typeof window.ceForumAppendManagedPost === 'function') {
        window.ceForumAppendManagedPost(card);
      } else if (card && feed) {
        feed.insertBefore(card, feed.firstChild);
      }

      invalidateStudentForumPager();

      ceForumDemoToast('Thread posted successfully', 'success');
      form.reset();
      closeCreatePostShellIfAny();

      if (card) {
        try {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (_e) {}
      }
    });
  }

  function init() {
    wireForumFeed();
    wireCreatePostModal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
