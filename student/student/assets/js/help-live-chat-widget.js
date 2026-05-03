/**
 * Help Center — fixed bottom-right live chat launcher (teaser bubble + avatar)
 * and chat panel. Self-contained; expects Tailwind on the host page.
 */
(function () {
  'use strict';

  var STORAGE_TEASER = 'ce_help_chat_teaser_dismissed_v1';

  function isHelpPage() {
    var p = (window.location.pathname || '').toLowerCase();
    return p.includes('help.html');
  }

  function roleFromPath() {
    var p = (window.location.pathname || '').toLowerCase();
    if (p.includes('/student/')) return 'student';
    if (p.includes('/instructor/')) return 'instructor';
    return 'help';
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function mount() {
    if (!isHelpPage()) return;
    var host = document.getElementById('ce-help-live-chat');
    if (!host || host.getAttribute('data-ce-chat-mounted') === '1') return;
    host.setAttribute('data-ce-chat-mounted', '1');

    var role = roleFromPath();
    var teaserText =
      role === 'student'
        ? 'Need help with courses or billing? Tap the assistant to chat with support. We typically reply within a few minutes on weekdays.'
        : 'Questions about payouts, uploads, or students? Tap the assistant to chat with a support curator. Weekdays 9:00–17:30 (local time), except public holidays.';

    host.innerHTML =
      '<div id="ce-help-chat-backdrop" class="fixed inset-0 z-[90] bg-slate-900/25 backdrop-blur-[2px] hidden cursor-pointer" aria-hidden="true"></div>' +
      '<div class="ce-help-launcher fixed bottom-24 right-5 z-[100] flex flex-row items-end gap-3 max-w-[100vw] pr-2 sm:bottom-6 sm:right-6 sm:pr-0">' +
      '<div id="ce-help-chat-teaser" class="ce-help-teaser flex flex-col relative max-w-[min(280px,calc(100vw-5.5rem))] rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_12px_40px_-8px_rgba(106,28,246,0.25)] text-on-surface">' +
      '<button type="button" id="ce-help-chat-teaser-close" class="absolute top-2 right-2 p-1 rounded-lg text-on-surface-variant hover:bg-slate-100 hover:text-on-surface transition-colors" aria-label="Close">' +
      '<span class="material-symbols-outlined text-lg leading-none">close</span></button>' +
      '<p class="text-xs sm:text-sm leading-relaxed pl-3 pr-9 py-3.5 font-body text-slate-700">' +
      esc(teaserText) +
      '</p></div>' +
      '<button type="button" id="ce-help-chat-trigger" class="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-[0_10px_30px_-4px_rgba(106,28,246,0.55)] border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-4 focus:ring-primary/30" aria-label="Open live chat">' +
      '<span class="material-symbols-outlined text-[28px]" style="font-variation-settings: \'FILL\' 1;">support_agent</span></button>' +
      '</div>' +
      '<div id="ce-help-chat-panel" class="fixed z-[110] w-[min(100vw-1.5rem,22rem)] max-h-[min(32rem,calc(100vh-8rem))] rounded-2xl border border-slate-200/80 bg-white shadow-2xl flex flex-col overflow-hidden hidden bottom-[7.25rem] right-5 sm:bottom-24 sm:right-6">' +
      '<div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-primary-container text-white flex-shrink-0">' +
      '<div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">' +
      '<span class="material-symbols-outlined text-lg" style="font-variation-settings: \'FILL\' 1;">support_agent</span></div>' +
      '<div class="flex-1 min-w-0">' +
      '<p class="font-headline font-bold text-sm truncate">CuratorEdu Support</p>' +
      '<p class="text-white/75 text-[10px] flex items-center gap-1"><span class="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>Online — type below to reach our team</p></div>' +
      '<button type="button" id="ce-help-chat-close" class="p-1.5 hover:bg-white/15 rounded-lg transition-colors flex-shrink-0" aria-label="Close chat" title="Close">' +
      '<span class="material-symbols-outlined text-xl">close</span></button></div>' +
      '<div id="ce-help-chat-messages" class="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50 min-h-[200px]"></div>' +
      '<div class="flex flex-col gap-2 px-3 py-3 border-t border-slate-100 bg-white flex-shrink-0">' +
      '<textarea id="ce-help-chat-input" rows="2" maxlength="4000" placeholder="Type a message (letters, numbers, symbols)…" class="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 font-body"></textarea>' +
      '<div class="flex items-center justify-between gap-2">' +
      '<span class="text-[10px] text-slate-400 font-label">Enter to send · Shift+Enter for new line</span>' +
      '<button type="button" id="ce-help-chat-send" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:opacity-95 active:scale-[0.98] transition-transform font-headline">' +
      '<span>Send</span><span class="material-symbols-outlined text-base" style="font-variation-settings: \'FILL\' 1;">send</span></button></div></div></div>';

    var backdrop = document.getElementById('ce-help-chat-backdrop');
    var teaser = document.getElementById('ce-help-chat-teaser');
    var teaserClose = document.getElementById('ce-help-chat-teaser-close');
    var trigger = document.getElementById('ce-help-chat-trigger');
    trigger?.setAttribute('data-global-skip', '1');
    teaserClose?.setAttribute('data-global-skip', '1');
    var panel = document.getElementById('ce-help-chat-panel');
    var closeBtn = document.getElementById('ce-help-chat-close');
    var sendBtn = document.getElementById('ce-help-chat-send');
    closeBtn?.setAttribute('data-global-skip', '1');
    sendBtn?.setAttribute('data-global-skip', '1');
    var input = document.getElementById('ce-help-chat-input');
    var msgHost = document.getElementById('ce-help-chat-messages');

    var botReplies = {
      'upload issue':
        'For upload issues, use MP4/MOV under 4 GB and a current browser. I can summarize the upload checklist—what file type are you using?',
      'payout':
        'Payouts are usually processed on the 15th of each month. Please confirm your payout method under Settings → Payments.',
      'course':
        'Course visibility and modules are managed in Course Builder. Tell me whether you need access, pricing, or content help.',
      default:
        'Thanks for your message. A support curator will review it and follow up. You can keep typing here for more context (reference numbers welcome).',
    };

    function appendMessage(text, isUser) {
      var wrap = document.createElement('div');
      wrap.className = isUser ? 'flex justify-end' : 'flex items-end gap-2';
      if (isUser) {
        wrap.innerHTML =
          '<div class="bg-primary text-white rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[88%] shadow-sm"><p class="text-sm whitespace-pre-wrap break-words font-body"></p></div>';
        wrap.querySelector('p').textContent = text;
      } else {
        wrap.innerHTML =
          '<div class="w-7 h-7 rounded-full bg-primary/12 flex items-center justify-center flex-shrink-0">' +
          '<span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: \'FILL\' 1;">support_agent</span></div>' +
          '<div class="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[88%] shadow-sm border border-slate-100"><p class="text-sm text-slate-800 whitespace-pre-wrap break-words font-body"></p></div>';
        wrap.querySelector('p').textContent = text;
      }
      msgHost.appendChild(wrap);
      msgHost.scrollTop = msgHost.scrollHeight;
    }

    function teaserDismissed() {
      try {
        return localStorage.getItem(STORAGE_TEASER) === '1';
      } catch (e) {
        return false;
      }
    }

    function openChat() {
      panel.classList.remove('hidden');
      panel.style.display = 'flex';
      if (backdrop) {
        backdrop.classList.remove('hidden');
        backdrop.style.display = 'block';
      }
      if (teaser) teaser.classList.add('hidden');
    }

    function closeChat() {
      panel.classList.add('hidden');
      panel.style.display = 'none';
      if (backdrop) {
        backdrop.classList.add('hidden');
        backdrop.style.display = 'none';
      }
      if (teaser && !teaserDismissed()) teaser.classList.remove('hidden');
    }

    function toggleChat() {
      if (panel.classList.contains('hidden')) openChat();
      else closeChat();
    }

    function sendText(raw) {
      var t = String(raw || '').trim();
      if (!t) return;
      appendMessage(t, true);
      var lower = t.toLowerCase();
      var key = 'default';
      if (lower.includes('upload')) key = 'upload issue';
      else if (lower.includes('payout') || lower.includes('pay') || lower.includes('收款') || lower.includes('付款'))
        key = 'payout';
      else if (lower.includes('course') || lower.includes('课程')) key = 'course';
      window.setTimeout(function () {
        appendMessage(botReplies[key] || botReplies.default, false);
      }, 550);
    }

    appendMessage(
      role === 'student'
        ? "Hi! I'm here to help with the student portal — courses, access, or billing. What do you need?"
        : "Hi! I'm your CuratorEdu support assistant for instructors. Ask about uploads, analytics, payouts, or moderation.",
      false
    );

    try {
      if (localStorage.getItem(STORAGE_TEASER) === '1') {
        if (teaser) teaser.classList.add('hidden');
      } else if (teaser) {
        teaser.classList.remove('hidden');
      }
    } catch (e) {
      if (teaser) teaser.classList.remove('hidden');
    }

    teaserClose?.addEventListener('click', function (e) {
      e.stopPropagation();
      if (teaser) teaser.classList.add('hidden');
      try {
        localStorage.setItem(STORAGE_TEASER, '1');
      } catch (err) {}
    });

    trigger?.addEventListener('click', function (e) {
      e.preventDefault();
      toggleChat();
      if (!panel.classList.contains('hidden')) input?.focus();
    });

    panel.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';

    backdrop?.addEventListener('click', function () {
      closeChat();
    });

    closeBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeChat();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!panel || panel.classList.contains('hidden')) return;
      closeChat();
    });

    sendBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      sendText(input?.value);
      if (input) input.value = '';
      input?.focus();
    });

    input?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendText(input.value);
        input.value = '';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
