/**
 * Filters forum feed by ?course=... (case-insensitive).
 * Post order matches instructor_forum_moderation.html & student community_forum.html (16 cards).
 * Slot "all" = visible in every course forum.
 */
(function () {
  'use strict';

  if (!document.getElementById('ce-forum-course-hidden-style')) {
    var st = document.createElement('style');
    st.id = 'ce-forum-course-hidden-style';
    st.textContent = '[data-ce-course-hidden="1"]{display:none!important}';
    document.head.appendChild(st);
  }

  /** Demo buckets; align names with course picker links (?course=...). */
  var COURSE_SLOT = [
    'Web Technology',
    'Web Technology',
    'Human Computer Interaction',
    'all',
    'Algorithm and Design Complexity',
    'Web Technology',
    'Algorithm and Design Complexity',
    'Algorithm and Design Complexity',
    'Web Technology',
    'Human Computer Interaction',
    'Web Technology',
    'Algorithm and Design Complexity',
    'Web Technology',
    'all',
    'all',
    'Web Technology',
  ];

  function norm(s) {
    return String(s || '')
      .trim()
      .replace(/\+/g, ' ')
      .toLowerCase();
  }

  function getFeedPosts(feed) {
    var byForumPost = feed.querySelectorAll(':scope > .forum-post');
    if (byForumPost.length) return byForumPost;
    return feed.querySelectorAll(':scope > div.bg-surface-container-lowest');
  }

  function run() {
    var raw = new URLSearchParams(window.location.search).get('course');
    var emptyEl = document.getElementById('forum-course-empty');
    var feed = document.getElementById('forum-feed');
    if (!feed) return;

    var posts = getFeedPosts(feed);
    if (!raw) {
      posts.forEach(function (el) {
        el.removeAttribute('data-ce-course-hidden');
      });
      if (emptyEl) emptyEl.classList.add('hidden');
      return;
    }

    var want = norm(decodeURIComponent(raw));
    var shown = 0;
    posts.forEach(function (el, i) {
      var slot = norm(COURSE_SLOT[i] || 'all');
      var ok = !slot || slot === 'all' || slot === want;
      if (!ok) el.setAttribute('data-ce-course-hidden', '1');
      else el.removeAttribute('data-ce-course-hidden');
      if (ok) shown += 1;
    });

    if (emptyEl) emptyEl.classList.toggle('hidden', shown !== 0);
  }

  window.ceForumCourseFilterApply = run;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
