/**
 * Instructor forum: create thread (FAB + #create-post), aligned with student community_forum.html.
 * Draft in sessionStorage, prepend to #forum-feed, then refresh pager via window.ceForumFeedInvalidate.
 */
(function () {
  'use strict';

  var DRAFT_KEY = 'ce_forum_demo_instructor_composer_draft';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bodyToHtml(text) {
    return esc(text).replace(/\r\n/g, '\n').split('\n').join('<br>');
  }

  function collectTags(tagWrap) {
    if (!tagWrap) return [];
    return Array.from(tagWrap.querySelectorAll('span'))
      .map(function (el) {
        return (el.textContent || '').trim();
      })
      .filter(function (t) {
        return t && t !== '+ Add Tag' && !t.startsWith('+');
      });
  }

  function badgeFromTags(tags) {
    var t = tags[0] || 'University Hub';
    if (t.startsWith('#')) t = t.slice(1);
    return t.slice(0, 40) || 'University Hub';
  }

  function buildPostCard(title, bodyText, tags) {
    var badge = esc(badgeFromTags(tags));
    var tagLine = tags.length
      ? '<p class="text-xs text-primary/80 font-label mt-2">' +
        tags.map(function (t) {
          return '<span class="mr-2">' + esc(t) + '</span>';
        }).join('') +
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
      '<h3 class="font-bold text-on-background">Instructor <span class="text-xs font-normal text-on-surface-variant ml-2">just now</span></h3>' +
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

  function closeCreatePostModal() {
    var shell = document.getElementById('create-post');
    var base = window.location.pathname + window.location.search;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', base);
    } else {
      window.location.hash = '';
    }
    // :target alone is unreliable after replaceState in some browsers; force-hide overlay.
    if (shell) {
      shell.style.setProperty('opacity', '0');
      shell.style.setProperty('pointer-events', 'none');
    }
  }

  function syncCreatePostShellFromHash() {
    var shell = document.getElementById('create-post');
    if (!shell) return;
    if (window.location.hash === '#create-post') {
      shell.style.removeProperty('opacity');
      shell.style.removeProperty('pointer-events');
    }
  }

  function init() {
    var shell = document.getElementById('create-post');
    var feed = document.getElementById('forum-feed');
    if (!shell || !feed) return;

    var form = document.getElementById('instructor-forum-create-form');
    if (!form || !shell.contains(form)) return;

    var topicInput = document.getElementById('instructor-forum-topic');
    var contentInput = document.getElementById('instructor-forum-content');
    var saveDraftBtn = document.getElementById('instructor-forum-save-draft');
    var addTagBtn = document.getElementById('instructor-forum-add-tag');
    var tagWrap = form.querySelector('[data-instructor-forum-tags]');
    var closeBtn = document.getElementById('instructor-forum-create-close');

    closeBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeCreatePostModal();
    });

    window.addEventListener('hashchange', syncCreatePostShellFromHash);
    syncCreatePostShellFromHash();

    shell.addEventListener('click', function (e) {
      if (e.target === shell) closeCreatePostModal();
    });

    var saved = sessionStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        var draft = JSON.parse(saved);
        if (topicInput && !topicInput.value) topicInput.value = draft.title || '';
        if (contentInput && !contentInput.value) contentInput.value = draft.content || '';
      } catch (_e) {}
    }

    addTagBtn?.addEventListener('click', function () {
      var raw = window.prompt('Enter a tag (example: #WebDev)');
      if (!raw) return;
      var tagText = raw.trim().startsWith('#') ? raw.trim() : '#' + raw.trim();
      var tagEl = document.createElement('span');
      tagEl.className =
        'px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20';
      tagEl.textContent = tagText;
      addTagBtn.parentElement?.insertBefore(tagEl, addTagBtn);
    });

    saveDraftBtn?.addEventListener('click', function () {
      var draft = {
        title: (topicInput && topicInput.value ? topicInput.value : '').trim(),
        content: (contentInput && contentInput.value ? contentInput.value : '').trim(),
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (typeof window.instructorToast === 'function') {
        window.instructorToast('Draft saved');
      } else {
        window.alert('Draft saved');
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var title = (topicInput && topicInput.value ? topicInput.value : '').trim();
      var content = (contentInput && contentInput.value ? contentInput.value : '').trim();
      if (!title || !content) {
        if (typeof window.instructorToast === 'function') {
          window.instructorToast('Please add a title and content');
        } else {
          window.alert('Please fill in both title and content before posting.');
        }
        return;
      }
      sessionStorage.removeItem(DRAFT_KEY);
      var tags = collectTags(tagWrap);
      var wrap = document.createElement('div');
      wrap.innerHTML = buildPostCard(title, content, tags).trim();
      var card = wrap.firstElementChild;
      if (!card) return;
      feed.insertBefore(card, feed.firstChild);
      form.reset();
      closeCreatePostModal();
      if (typeof window.ceForumFeedInvalidate === 'function') window.ceForumFeedInvalidate();
      if (typeof window.instructorToast === 'function') {
        window.instructorToast('Thread posted successfully');
      } else {
        window.alert('Thread posted successfully.');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
