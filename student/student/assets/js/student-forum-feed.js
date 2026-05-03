/**
 * Student community forum: Trending (by comment count) / Latest / Top + pager.
 * Mirrors instructor wireCommunityForum sort rules; works with forum-course-filter.js.
 */
(function () {
  'use strict';

  var PAGE_SIZE = 4;
  var LIKE_ICON_NAMES = { thumb_up: 1, arrow_upward: 1, favorite: 1 };

  function feedPostElements(postScope) {
    var byForumPost = postScope.querySelectorAll(':scope > .forum-post');
    if (byForumPost.length) return Array.from(byForumPost);
    return Array.from(postScope.querySelectorAll(':scope > div.bg-surface-container-lowest.rounded-xl'));
  }

  function getCommentCount(post) {
    var btns = post.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var icon = btn.querySelector('.material-symbols-outlined');
      if (!icon) continue;
      var name = (icon.textContent || '').trim();
      if (name !== 'chat_bubble' && name !== 'forum') continue;
      var txt = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      var m = txt.match(/([\d,]+)\s*comments?/i);
      if (m) return parseInt(m[1].replace(/,/g, ''), 10) || 0;
    }
    return 0;
  }

  function parseCompactCount(raw) {
    var t = String(raw || '')
      .trim()
      .toLowerCase();
    if (!t || /comment/.test(t)) return 0;
    var km = t.match(/^([\d.]+)\s*k$/);
    if (km) return Math.round(parseFloat(km[1], 10) * 1000);
    var nm = t.match(/^(\d+)/);
    return nm ? parseInt(nm[1], 10) : 0;
  }

  function getLikeCount(post) {
    var btns = post.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var icon = btn.querySelector('.material-symbols-outlined');
      if (!icon) continue;
      var name = (icon.textContent || '').trim();
      if (!LIKE_ICON_NAMES[name]) continue;
      var spans = btn.querySelectorAll('span');
      for (var j = 0; j < spans.length; j++) {
        var sp = spans[j];
        if (sp === icon) continue;
        var raw = (sp.textContent || '').trim();
        var n = parseCompactCount(raw);
        if (raw && (n > 0 || raw === '0')) return n;
      }
    }
    return 0;
  }

  function getPostAgeMinutes(post) {
    var head = ((post.querySelector('h3') && post.querySelector('h3').textContent) || '').toLowerCase();
    var fallback = (post.textContent || '').toLowerCase();
    var txt = head || fallback;
    if (/just\s*now/.test(txt)) return 0;
    var m = txt.match(/(\d+)\s*(m|h|d|w)\s*ago/);
    if (!m) return Number.MAX_SAFE_INTEGER;
    var v = parseInt(m[1], 10) || 0;
    var u = m[2];
    if (u === 'm') return v;
    if (u === 'h') return v * 60;
    if (u === 'd') return v * 1440;
    if (u === 'w') return v * 10080;
    return Number.MAX_SAFE_INTEGER;
  }

  function postVisibleForCourse(post) {
    return post.getAttribute('data-ce-course-hidden') !== '1';
  }

  function wire() {
    var postScope = document.getElementById('forum-feed');
    if (!postScope) return;

    var tabsBar = document.querySelector('div.flex.gap-3.mb-8.bg-surface-container-low');
    if (!tabsBar) return;

    var tabBtns = Array.from(tabsBar.querySelectorAll('button')).filter(function (b) {
      var t = (b.textContent || '').trim().toLowerCase();
      return t === 'trending' || t === 'latest' || t === 'top';
    });
    if (!tabBtns.length) return;

    feedPostElements(postScope).forEach(function (el) {
      if (!el.hasAttribute('data-community-post')) el.setAttribute('data-community-post', '1');
    });

    var activeTab = 'trending';
    var page = 1;

    function sortPosts(posts) {
      if (activeTab === 'trending') return posts.slice().sort(function (a, b) { return getCommentCount(b) - getCommentCount(a); });
      if (activeTab === 'latest') return posts.slice().sort(function (a, b) { return getPostAgeMinutes(a) - getPostAgeMinutes(b); });
      return posts.slice().sort(function (a, b) { return getLikeCount(b) - getLikeCount(a); });
    }

    function ensurePager() {
      var pager = document.getElementById('community-pager');
      if (pager) return pager;
      pager = document.createElement('div');
      pager.id = 'community-pager';
      pager.className = 'flex items-center justify-between gap-3 pt-6';
      pager.innerHTML =
        '<button type="button" id="community-prev" class="px-4 py-2 rounded-xl bg-white border border-slate-200 font-black text-sm hover:bg-slate-50">Prev</button>' +
        '<div id="community-page" class="text-xs font-bold text-slate-500"></div>' +
        '<button type="button" id="community-next" class="px-4 py-2 rounded-xl bg-white border border-slate-200 font-black text-sm hover:bg-slate-50">Next</button>';
      postScope.parentElement && postScope.parentElement.appendChild(pager);
      pager.querySelector('#community-prev').addEventListener('click', function () {
        page = Math.max(1, page - 1);
        render();
      });
      pager.querySelector('#community-next').addEventListener('click', function () {
        page += 1;
        render();
      });
      return pager;
    }

    function render() {
      if (typeof window.ceForumCourseFilterApply === 'function') window.ceForumCourseFilterApply();
      var allFiltered = Array.from(postScope.querySelectorAll('[data-community-post]')).filter(postVisibleForCourse);
      var all = sortPosts(allFiltered);
      all.forEach(function (el) {
        postScope.appendChild(el);
      });
      var totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
      if (page > totalPages) page = totalPages;
      var start = (page - 1) * PAGE_SIZE;
      var visible = new Set(all.slice(start, start + PAGE_SIZE));
      Array.from(postScope.querySelectorAll('[data-community-post]')).forEach(function (p) {
        p.classList.add('hidden');
      });
      all.forEach(function (p) {
        p.classList.toggle('hidden', !visible.has(p));
      });
      tabBtns.forEach(function (b) {
        var is = (b.textContent || '').trim().toLowerCase() === activeTab;
        b.classList.toggle('bg-primary', is);
        b.classList.toggle('text-white', is);
        b.classList.toggle('shadow-md', is);
        b.classList.toggle('shadow-primary/20', is);
        b.classList.toggle('font-bold', is);
        b.classList.toggle('text-on-surface-variant', !is);
        b.classList.toggle('hover:bg-surface-container', !is);
        b.classList.toggle('font-medium', !is);
      });
      var pager = ensurePager();
      var pageEl = pager.querySelector('#community-page');
      if (pageEl) pageEl.textContent = 'Page ' + page + ' / ' + totalPages;
      var prev = pager.querySelector('#community-prev');
      var next = pager.querySelector('#community-next');
      if (prev) {
        prev.disabled = page <= 1;
        prev.classList.toggle('opacity-40', page <= 1);
      }
      if (next) {
        next.disabled = page >= totalPages;
        next.classList.toggle('opacity-40', page >= totalPages);
      }
    }

    tabBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        activeTab = (b.textContent || '').trim().toLowerCase();
        page = 1;
        render();
      });
    });

    window.ceStudentForumFeedInvalidate = function () {
      page = 1;
      render();
    };

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
