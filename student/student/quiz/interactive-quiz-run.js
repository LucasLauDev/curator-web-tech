(function () {
  'use strict';

  var FALLBACK = [
    {
      topic: 'Demo',
      question: 'Pass courseId & moduleId in the URL for a real module quiz.',
      options: ['OK', 'Maybe', 'Later'],
      answer: 0,
      hint: 'Example: interactive_quiz_ui.html?courseId=…&moduleId=…'
    }
  ];

  var questions = [];
  var moduleTitleGlobal = '';

  var currentIndex = 0;
  var selectedOption = null;
  var answered = false;
  var scoreLocal = 0;
  var quizT0 = 0;
  var questionDeadlineTs = 0;
  var PER_Q_SEC = 600;
  var timerInterval = null;
  var questionResults = [];

  function pad (n) {
    return String(n).padStart(2, '0');
  }

  function startTimer () {
    clearInterval(timerInterval);
    questionDeadlineTs = Date.now() + PER_Q_SEC * 1000;
    timerInterval = setInterval(function () {
      var left = Math.max(0, Math.ceil((questionDeadlineTs - Date.now()) / 1000));
      var m = Math.floor(left / 60);
      var s = left % 60;
      var el = document.getElementById('timer-display');
      if (el) el.textContent = pad(m) + ':' + pad(s);
      if (left <= 0) {
        clearInterval(timerInterval);
        if (!answered) markSkipped(currentIndex);
        if (currentIndex < questions.length - 1) {
          currentIndex += 1;
          renderQuestion();
        } else {
          submitQuizAndShowResults();
        }
      }
    }, 250);
  }

  /** @param {HTMLElement | null} el */
  function setPrevDisabled (el) {
    if (!el) return;
    var dis = answered || currentIndex <= 0;
    el.disabled = dis;
    el.classList.toggle('opacity-40', dis);
    el.classList.toggle('cursor-not-allowed', dis);
  }

  function markSkipped (idx) {
    var q = questions[idx];
    if (!q) return;
    questionResults[idx] = {
      question: q.question,
      options: q.options,
      selected: null,
      correct: q.answer,
      isCorrect: false,
      skipped: true
    };
  }

  function renderQuestion () {
    var q = questions[currentIndex];
    answered = false;
    selectedOption = null;

    var counterEl = document.getElementById('question-counter');
    if (counterEl) {
      counterEl.textContent =
        'Question ' + pad(currentIndex + 1) + ' of ' + questions.length;
    }

    var topicEl = document.getElementById('quiz-topic');
    if (topicEl) topicEl.textContent = q.topic || moduleTitleGlobal || 'Quiz';

    var qtxt = document.getElementById('question-text');
    if (qtxt) qtxt.textContent = q.question;

    var bar = document.getElementById('progress-bar');
    if (bar) {
      bar.style.width = ((currentIndex + 1) / questions.length) * 100 + '%';
    }

    var feedback = document.getElementById('feedback-banner');
    feedback.className = 'hidden rounded-lg px-6 py-4 font-label font-bold text-base';
    feedback.textContent = '';

    var chk = document.getElementById('check-btn');
    if (chk) chk.textContent = 'Check Answer';

    setPrevDisabled(document.getElementById('prev-btn'));

    var grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    var labels = 'ABCDEFGHIJ'.split('');
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'group flex items-center gap-4 p-6 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 text-left';
      btn.innerHTML =
        '<div class="option-badge flex-shrink-0 w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center font-headline font-bold text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">' +
        labels[i] +
        '</div>' +
        '<span class="font-body font-medium text-lg text-on-surface-variant group-hover:text-on-surface">' +
        opt +
        '</span>';
      btn.addEventListener('click', function () {
        selectOption(i);
      });
      grid.appendChild(btn);
    });

    startTimer();
  }

  function selectOption (index) {
    if (answered) return;
    selectedOption = index;
    var buttons = document.getElementById('options-grid').querySelectorAll('button');
    buttons.forEach(function (btn, i) {
      var badge = btn.querySelector('.option-badge');
      var label = btn.querySelector('span');
      if (i === index) {
        btn.className =
          'group flex items-center gap-4 p-6 rounded-lg bg-primary/5 border-2 border-primary ring-4 ring-primary/10 transition-all duration-300 text-left';
        badge.className =
          'option-badge flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-headline font-bold text-white';
        label.className = 'font-body font-bold text-lg text-on-surface';
      } else {
        btn.className =
          'group flex items-center gap-4 p-6 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 text-left';
        badge.className =
          'option-badge flex-shrink-0 w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center font-headline font-bold text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors';
        label.className = 'font-body font-medium text-lg text-on-surface-variant group-hover:text-on-surface';
      }
    });
  }

  function recalcScoreFromResults () {
    var n = 0;
    for (var i = 0; i < questions.length; i++) {
      if (questionResults[i] && questionResults[i].isCorrect) n++;
    }
    scoreLocal = n;
  }

  function checkAnswer () {
    if (answered) {
      if (currentIndex < questions.length - 1) {
        currentIndex += 1;
        renderQuestion();
      } else {
        submitQuizAndShowResults();
      }
      return;
    }
    if (selectedOption === null) {
      var feedback = document.getElementById('feedback-banner');
      feedback.className =
        'rounded-lg px-6 py-4 font-label font-bold text-base bg-amber-50 text-amber-700 border border-amber-200';
      feedback.textContent = 'Please select an answer before checking.';
      return;
    }
    answered = true;

    var q = questions[currentIndex];
    var correct = selectedOption === q.answer;
    questionResults[currentIndex] = {
      question: q.question,
      options: q.options,
      selected: selectedOption,
      correct: q.answer,
      isCorrect: correct,
      skipped: false
    };
    recalcScoreFromResults();

    var buttons = document.getElementById('options-grid').querySelectorAll('button');
    buttons.forEach(function (btn, i) {
      btn.disabled = true;
      var badge = btn.querySelector('.option-badge');
      var label = btn.querySelector('span');
      if (i === q.answer) {
        btn.className =
          'flex items-center gap-4 p-6 rounded-lg bg-green-50 border-2 border-green-500 transition-all text-left';
        badge.className =
          'option-badge flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-headline font-bold text-white';
        label.className = 'font-body font-bold text-lg text-green-700';
      } else if (i === selectedOption) {
        btn.className =
          'flex items-center gap-4 p-6 rounded-lg bg-red-50 border-2 border-red-400 transition-all text-left';
        badge.className =
          'option-badge flex-shrink-0 w-10 h-10 rounded-full bg-red-400 flex items-center justify-center font-headline font-bold text-white';
        label.className = 'font-body font-bold text-lg text-red-600';
      }
    });

    var feedback2 = document.getElementById('feedback-banner');
    if (correct) {
      feedback2.className =
        'rounded-lg px-6 py-4 font-label font-bold text-base bg-green-50 text-green-700 border border-green-200';
      feedback2.textContent = '✓ Correct! Well done.';
    } else {
      feedback2.className =
        'rounded-lg px-6 py-4 font-label font-bold text-base bg-red-50 text-red-600 border border-red-200';
      feedback2.textContent =
        '✗ Incorrect. The correct answer is: ' + q.options[q.answer];
    }

    clearInterval(timerInterval);
    document.getElementById('check-btn').textContent =
      currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results';
    setPrevDisabled(document.getElementById('prev-btn'));
  }

  function previousQuestion () {
    if (answered) return;
    if (currentIndex <= 0) return;
    currentIndex -= 1;
    renderQuestion();
  }

  function submitQuizAndShowResults () {
    clearInterval(timerInterval);
    var totalSec = quizT0 > 0 ? Math.floor((Date.now() - quizT0) / 1000) : 0;

    function done (serverSnap) {
      showResults(serverSnap || null, totalSec);
    }

    var qs = new URLSearchParams(window.location.search);
    var courseId = qs.get('courseId');
    var moduleId = qs.get('moduleId');
    var answersPayload = {};

    questions.forEach(function (qObj, idx) {
      if (!qObj.questionId) return;
      var r = questionResults[idx];
      if (!r || r.skipped) answersPayload[qObj.questionId] = null;
      else {
        answersPayload[qObj.questionId] =
          typeof r.selected === 'number' && r.selected >= 0 ? r.selected : null;
      }
    });

    var hasIds = Object.keys(answersPayload).length > 0;

    if (courseId && moduleId && hasIds) {
      fetch(
        '/api/courses/' +
          encodeURIComponent(courseId) +
          '/modules/' +
          encodeURIComponent(moduleId) +
          '/quiz/submit',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: answersPayload })
        }
      )
        .then(function (r) {
          return r.json().catch(function () {
            return null;
          });
        })
        .then(function (data) {
          done(data || null);
        })
        .catch(function () {
          done(null);
        });
    } else {
      done(null);
    }
  }

  function showResults (serverSnap, elapsedSec) {
    var flowEl = document.getElementById('quiz-active-flow');
    if (flowEl) flowEl.classList.add('hidden');
    clearInterval(timerInterval);

    var timeTaken = typeof elapsedSec === 'number' && elapsedSec >= 0 ? elapsedSec : 0;

    var results = document.getElementById('results-card');
    results.classList.remove('hidden');

    var pct;
    var displayScore;

    if (serverSnap && typeof serverSnap.correct === 'number' && typeof serverSnap.total === 'number') {
      displayScore = serverSnap.correct;
      pct =
        typeof serverSnap.percent === 'number'
          ? serverSnap.percent
          : Math.round((serverSnap.correct / Math.max(1, serverSnap.total)) * 100);
    } else {
      displayScore = scoreLocal;
      pct = Math.round((scoreLocal / Math.max(1, questions.length)) * 100);
    }

    var passed =
      serverSnap && typeof serverSnap.pass === 'boolean' ? serverSnap.pass : pct >= 60;

    var denom = questions.length;
    if (serverSnap && typeof serverSnap.total === 'number') denom = serverSnap.total;

    document.getElementById('score-text').textContent =
      displayScore + ' / ' + denom + ' (' + pct + '%)';
    var tm = Math.floor(timeTaken / 60);
    var ts = timeTaken % 60;
    document.getElementById('time-taken-text').textContent = pad(tm) + ':' + pad(ts);

    var badge = document.getElementById('pass-fail-badge');
    var badgeText = document.getElementById('pass-fail-text');
    var icon = document.getElementById('result-icon');
    if (passed) {
      badge.className = 'rounded-2xl px-6 py-4 min-w-[120px] bg-green-50';
      badgeText.className = 'font-headline text-2xl font-black text-green-600';
      badgeText.textContent = 'PASS';
      icon.className = 'material-symbols-outlined text-6xl text-green-500';
      icon.style.fontVariationSettings = "'FILL' 1";
      icon.textContent = 'emoji_events';
    } else {
      badge.className = 'rounded-2xl px-6 py-4 min-w-[120px] bg-red-50';
      badgeText.className = 'font-headline text-2xl font-black text-red-600';
      badgeText.textContent = 'FAIL';
      icon.className = 'material-symbols-outlined text-6xl text-error';
      icon.style.fontVariationSettings = "'FILL' 1";
      icon.textContent = 'sentiment_dissatisfied';
    }

    var reviewContainer = document.getElementById('question-review');
    reviewContainer.innerHTML = '';
    var labels = 'ABCDEFGHIJ'.split('');
    questions.forEach(function (q, idx) {
      var r = questionResults[idx];
      var div = document.createElement('div');
      if (!r || r.skipped) {
        div.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200';
        div.innerHTML =
          '<div class="flex items-start gap-3"><span class="material-symbols-outlined text-sm mt-0.5 text-slate-400" style="font-variation-settings:\'FILL\' 1;">remove_circle</span><div class="flex-1"><p class="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Q' +
          (idx + 1) +
          ' — Skipped / No answer</p><p class="font-body text-sm font-medium text-on-surface mb-1">' +
          q.question +
          '</p><p class="text-xs font-label font-bold text-green-700">Correct answer: ' +
          labels[q.answer] +
          '. ' +
          q.options[q.answer] +
          '</p></div></div>';
      } else if (r.isCorrect) {
        div.className = 'p-4 rounded-xl bg-green-50 border border-green-200';
        div.innerHTML =
          '<div class="flex items-start gap-3"><span class="material-symbols-outlined text-sm mt-0.5 text-green-600" style="font-variation-settings:\'FILL\' 1;">check_circle</span><div class="flex-1"><p class="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Q' +
          (idx + 1) +
          ' — Correct</p><p class="font-body text-sm font-medium text-on-surface mb-1">' +
          q.question +
          '</p><p class="text-xs font-label font-bold text-green-700">Your answer: ' +
          labels[r.selected] +
          '. ' +
          q.options[r.selected] +
          '</p></div></div>';
      } else {
        div.className = 'p-4 rounded-xl bg-red-50 border border-red-200';
        div.innerHTML =
          '<div class="flex items-start gap-3"><span class="material-symbols-outlined text-sm mt-0.5 text-red-500" style="font-variation-settings:\'FILL\' 1;">cancel</span><div class="flex-1"><p class="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Q' +
          (idx + 1) +
          ' — Incorrect</p><p class="font-body text-sm font-medium text-on-surface mb-1">' +
          q.question +
          '</p><p class="text-xs font-label font-bold text-red-600 mb-1">Your answer: ' +
          labels[r.selected] +
          '. ' +
          q.options[r.selected] +
          '</p><p class="text-xs font-label font-bold text-green-700">Correct: ' +
          labels[q.answer] +
          '. ' +
          q.options[q.answer] +
          '</p></div></div>';
      }
      reviewContainer.appendChild(div);
    });

    var qsp = new URLSearchParams(window.location.search);
    var cidBack = qsp.get('courseId');
    var bk = document.getElementById('quiz-back-course');
    if (bk && cidBack)
      bk.href = '../course/course_detail.html?courseId=' + encodeURIComponent(cidBack);
  }

  function restartQuiz () {
    currentIndex = 0;
    scoreLocal = 0;
    questionResults = [];
    quizT0 = Date.now();
    document.getElementById('results-card').classList.add('hidden');
    var flow = document.getElementById('quiz-active-flow');
    if (flow) flow.classList.remove('hidden');
    renderQuestion();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var qsParams = new URLSearchParams(window.location.search);
    var courseId = qsParams.get('courseId');
    var moduleId = qsParams.get('moduleId');

    async function boot () {
      questions = FALLBACK.slice();
      if (courseId && moduleId) {
        try {
          var r = await fetch(
            '/api/courses/' +
              encodeURIComponent(courseId) +
              '/modules/' +
              encodeURIComponent(moduleId) +
              '/quiz',
            { credentials: 'include' }
          );
          var data = await r.json().catch(function () {
            return {};
          });
          if (r.ok && data.questions && data.questions.length) {
            moduleTitleGlobal = data.module_title || 'Quiz';
            questions = data.questions.map(function (q) {
              return {
                questionId: q.id,
                topic: moduleTitleGlobal,
                question: q.prompt,
                options: q.choices.slice(0, 6),
                answer: typeof q.correct_index === 'number' ? q.correct_index : 0,
                hint: ''
              };
            });
          }
        } catch (_e) {}
      }

      if (!questions.length) questions = FALLBACK.slice();

      quizT0 = Date.now();

      document.getElementById('check-btn').addEventListener('click', checkAnswer);

      document.getElementById('prev-btn').addEventListener('click', previousQuestion);

      renderQuestion();

      window.restartQuiz = restartQuiz;
      window.submitQuizAndShowResults = submitQuizAndShowResults;
    }

    boot();
  });
})();
