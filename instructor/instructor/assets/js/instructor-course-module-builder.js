/**
 * Multi-module course editor: each module toggles lecture notes + sample rows, optional YouTube URL, optional quiz.
 */
(function () {
  'use strict';

  function toastSafe (msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind === 'error' ? 'error' : 'info');
  }

  function youtubeVideoId (raw) {
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

  var modSeq = 0;

  function nextModId () {
    modSeq += 1;
    return 'cm_' + modSeq + '_' + Date.now();
  }

  function bindYoutubeSection (scope) {
    var list = scope.querySelector('.ce-mod-youtube-list');
    var input = scope.querySelector('.ce-mod-youtube-input');
    var submit = scope.querySelector('.ce-mod-youtube-submit');
    var err = scope.querySelector('.ce-mod-youtube-error');
    if (!list || !input || !submit) return;

    function addYoutubeEmbed (url) {
      var vid = youtubeVideoId(url);
      if (!vid) {
        if (err) {
          err.textContent = 'Enter a valid YouTube URL.';
          err.classList.remove('hidden');
        }
        return;
      }
      if (err) {
        err.textContent = '';
        err.classList.add('hidden');
      }
      list.innerHTML = '';
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
        vid +
        '" title="YouTube preview" allowfullscreen loading="lazy"></iframe></div>';
      wrap.querySelector('.ce-yt-remove')?.addEventListener('click', function () {
        wrap.remove();
      });
      list.appendChild(wrap);
      input.value = '';
    }

    submit.addEventListener('click', function () {
      var url = input.value.trim();
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

  function bindQuizSection (scope) {
    var host = scope.querySelector('.ce-mod-quiz-host');
    var addBtn = scope.querySelector('.ce-mod-add-question');
    if (!host || !addBtn) return;

    var qIndex = 0;
    function bindQuestion (root) {
      root.querySelectorAll('.ce-quiz-option').forEach(function (row) {
        row.addEventListener('click', function (e) {
          if (e.target && String(e.target.tagName || '').toUpperCase() === 'INPUT') return;
          var radio = row.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            root.querySelectorAll('.ce-quiz-option').forEach(function (r) {
              r.classList.remove('border-primary/40', 'ring-2', 'ring-primary/20');
              r.classList.add('border-outline-variant/10');
            });
            row.classList.add('border-primary/40', 'ring-2', 'ring-primary/20');
            row.classList.remove('border-outline-variant/10');
          }
        });
      });
      root.querySelector('.ce-quiz-delete')?.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        root.remove();
      });
    }

    function addQuestion () {
      qIndex += 1;
      var name = scope.getAttribute('data-mod-id') + '_q_' + qIndex;
      var div = document.createElement('div');
      div.className =
        'p-6 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 space-y-6 ce-quiz-question-block';
      div.innerHTML =
        '<div class="flex justify-between items-start">' +
        '<span class="px-3 py-1 bg-white text-on-surface-variant text-[10px] font-black rounded-lg border border-outline-variant/10">QUESTION</span>' +
        '<button type="button" class="text-outline hover:text-red-500 ce-quiz-delete" data-global-skip="1" aria-label="Delete question">' +
        '<span class="material-symbols-outlined text-sm">delete</span></button></div>' +
        '<input type="text" placeholder="Question prompt…" class="ce-quiz-question-input w-full bg-transparent border-b-2 border-outline-variant/20 py-2 text-lg font-bold focus:border-primary" />' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 ce-quiz-options">' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-primary/40 ring-2 ring-primary/20">' +
        '<input type="radio" name="' +
        name +
        '" checked /><input type="text" class="ce-quiz-option-input flex-1 bg-transparent border-none text-sm font-medium" value="Option A" /></div>' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/10">' +
        '<input type="radio" name="' +
        name +
        '" /><input type="text" class="ce-quiz-option-input flex-1 bg-transparent border-none text-sm font-medium" value="Option B" /></div>' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/10">' +
        '<input type="radio" name="' +
        name +
        '" /><input type="text" class="ce-quiz-option-input flex-1 bg-transparent border-none text-sm font-medium" value="Option C" /></div>' +
        '<div class="ce-quiz-option flex items-center gap-3 p-4 bg-white rounded-xl border border-outline-variant/10">' +
        '<input type="radio" name="' +
        name +
        '" /><input type="text" class="ce-quiz-option-input flex-1 bg-transparent border-none text-sm font-medium" value="Option D" /></div>' +
        '</div>';
      host.appendChild(div);
      bindQuestion(div);
    }

    addBtn.addEventListener('click', addQuestion);

    scope._ceAddQuizQuestion = addQuestion;
  }

  var sampleFilesCatalogLatest = null;
  var sampleFilesCatalogPromise = null;
  var sampleCatalogRefreshTimer = null;

  function refillAllSampleSelects (filesArr) {
    var files = Array.isArray(filesArr) ? filesArr : [];
    document.querySelectorAll('.ce-mod-sample-select').forEach(function (sel) {
      var prevFn = '';
      try {
        var ix = sel.selectedIndex;
        if (ix >= 0 && sel.options[ix]) prevFn = String(sel.options[ix].getAttribute('data-filename') || '').trim();
      } catch (_e) {
        prevFn = '';
      }
      sel.innerHTML = '';
      var ph = document.createElement('option');
      ph.value = '';
      ph.textContent = files.length
        ? 'Choose a sample file…'
        : 'No files found (add PDFs under assets/sample-files in the repo)';
      ph.disabled = !files.length;
      sel.appendChild(ph);
      files.forEach(function (f) {
        var nm = typeof f.name === 'string' ? f.name : '';
        var u = typeof f.url === 'string' ? f.url.trim() : '';
        if (!nm || !u) return;
        var o = document.createElement('option');
        o.value = u;
        o.textContent = nm;
        o.setAttribute('data-filename', nm);
        var sl = typeof f.size_label === 'string' && f.size_label.trim() ? f.size_label.trim() : '';
        if (sl) o.setAttribute('data-size-label', sl);
        sel.appendChild(o);
      });
      if (prevFn) {
        for (let j = 0; j < sel.options.length; j++) {
          var opt = sel.options[j];
          if (opt && String(opt.getAttribute('data-filename') || '').trim() === prevFn) {
            sel.selectedIndex = j;
            break;
          }
        }
      }
    });
  }

  function fetchSampleFilesCatalogAsync () {
    if (sampleFilesCatalogPromise) return sampleFilesCatalogPromise;
    sampleFilesCatalogPromise = fetch('/api/instructor/sample-files', {
      credentials: 'include'
    })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) {
          return { files: [] };
        }
        if (!r.ok) throw new Error('bad_response');
        return r.json();
      })
      .then(function (body) {
        sampleFilesCatalogLatest = Array.isArray(body.files) ? body.files : [];
        refillAllSampleSelects(sampleFilesCatalogLatest);
        return sampleFilesCatalogLatest;
      })
      .catch(function () {
        toastSafe('Could not load sample file list.', 'error');
        sampleFilesCatalogLatest = [];
        refillAllSampleSelects([]);
      })
      .finally(function () {
        sampleFilesCatalogPromise = null;
      });
    return sampleFilesCatalogPromise;
  }

  /** Re-read disk shortly after dropdown interaction for up-to-date file list */
  function scheduleSampleCatalogRealtimeRefresh () {
    if (sampleCatalogRefreshTimer) clearTimeout(sampleCatalogRefreshTimer);
    sampleCatalogRefreshTimer = setTimeout(function () {
      sampleCatalogRefreshTimer = null;
      fetchSampleFilesCatalogAsync();
    }, 150);
  }

  function ensureSampleCatalogForUi () {
    if (sampleFilesCatalogLatest !== null) {
      refillAllSampleSelects(sampleFilesCatalogLatest);
      return;
    }
    fetchSampleFilesCatalogAsync();
  }

  function appendSampleFileRow (scope, meta) {
    var list = scope.querySelector('.ce-mod-sample-list');
    if (!list) return null;
    meta = meta && typeof meta === 'object' ? meta : {};
    var name = typeof meta.name === 'string' ? meta.name.trim() : '';
    var sizeLbl =
      typeof meta.size_label === 'string' && meta.size_label.trim()
        ? meta.size_label.trim()
        : 'Sample material';
    if (!name) name = 'file';
    var row = document.createElement('div');
    row.className =
      'flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 mt-3';
    row.innerHTML =
      '<div class="flex items-center gap-3 min-w-0"><span class="material-symbols-outlined text-secondary">description</span>' +
      '<div class="min-w-0"><p class="text-sm font-bold truncate"></p>' +
      '<p class="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest"></p></div></div>' +
      '<button type="button" class="ce-sample-remove text-on-surface-variant hover:text-red-500" data-global-skip="1" aria-label="Remove sample attachment"><span class="material-symbols-outlined pointer-events-none">delete</span></button>';
    row.querySelector('p.text-sm.font-bold').textContent = name;
    row.querySelector('p.text-on-surface-variant').textContent = sizeLbl;
    var fileUrl = typeof meta.url === 'string' ? meta.url.trim() : '';
    if (fileUrl) row.setAttribute('data-ce-file-url', fileUrl);
    var dn = typeof meta.download_name === 'string' ? meta.download_name.trim() : '';
    if (dn) row.setAttribute('data-ce-download-name', dn);
    var rm = row.querySelector('.ce-sample-remove');
    rm?.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      row.remove();
    });
    list.appendChild(row);
    return row;
  }

  function bindSampleRows (scope) {
    var btn = scope.querySelector('.ce-mod-sample-add');
    var sel = scope.querySelector('.ce-mod-sample-select');
    var list = scope.querySelector('.ce-mod-sample-list');
    if (!btn || !sel || !list) return;
    sel.addEventListener('focus', scheduleSampleCatalogRealtimeRefresh);
    sel.addEventListener('pointerdown', scheduleSampleCatalogRealtimeRefresh);

    btn.addEventListener('click', function () {
      ensureSampleCatalogForUi();
      var opt = sel.options[sel.selectedIndex];
      var url = (sel.value || '').trim();
      if (!url || !opt || opt.value === '') {
        toastSafe('Choose a sample file from the dropdown first.', 'info');
        return;
      }
      var fn = String(opt.getAttribute('data-filename') || opt.textContent || '').trim();
      var slRaw = opt.getAttribute('data-size-label');
      var sl = slRaw ? String(slRaw).trim() : '';
      appendSampleFileRow(scope, { name: fn || 'attachment', url: url, size_label: sl });
      sel.selectedIndex = 0;
    });

    ensureSampleCatalogForUi();
  }

  function wireToggles (card) {
    var n = card.querySelector('.ce-mod-notes');
    var v = card.querySelector('.ce-mod-video');
    var q = card.querySelector('.ce-mod-quiz');
    var nw = card.querySelector('.ce-mod-notes-fields');
    var vw = card.querySelector('.ce-mod-video-fields');
    var qw = card.querySelector('.ce-mod-quiz-fields');
    function sync () {
      if (nw) nw.classList.toggle('hidden', !(n && n.checked));
      if (vw) vw.classList.toggle('hidden', !(v && v.checked));
      if (qw) qw.classList.toggle('hidden', !(q && q.checked));
    }
    ;
    [n, v, q].forEach(function (el) {
      el?.addEventListener('change', sync);
    });
    sync();
  }

  function appendModuleCard (prefill) {
    var host = document.getElementById('ce-modules-host');
    if (!host) return null;
    var mid = nextModId();
    var wrap = document.createElement('article');
    wrap.className =
      'ce-module-editor-card rounded-2xl border border-outline-variant/15 bg-white/90 shadow-sm shadow-slate-900/5 p-6 sm:p-8 space-y-6';
    wrap.setAttribute('data-mod-id', mid);
    wrap.innerHTML =
      '<div class="flex flex-wrap items-start justify-between gap-3">' +
      '<span class="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-label">Module</span>' +
      '<button type="button" class="ce-mod-remove px-4 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-black hover:bg-red-100">Remove module</button></div>' +
      '<div class="space-y-2">' +
      '<label class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label">Module title</label>' +
      '<input type="text" class="ce-mod-title-input w-full px-5 py-3.5 bg-surface-container-low rounded-xl font-bold" placeholder="e.g. Introduction" />' +
      '</div>' +
      '<div class="space-y-2">' +
      '<label class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label">About this module</label>' +
      '<textarea class="ce-mod-about-text w-full px-5 py-4 bg-surface-container-low rounded-xl min-h-[80px]" placeholder="What this module covers, goals, and context for learners…"></textarea>' +
      '</div>' +
      '<fieldset class="space-y-4 border-none p-0 m-0">' +
      '<legend class="sr-only">Module contents</legend>' +
      '<label class="flex items-center gap-3 cursor-pointer">' +
      '<input type="checkbox" class="ce-mod-notes accent-primary shrink-0" />' +
      '<span class="font-bold text-sm">Include lecture highlights &amp; downloadable materials</span></label>' +
      '<label class="flex items-center gap-3 cursor-pointer">' +
      '<input type="checkbox" class="ce-mod-video accent-primary shrink-0" />' +
      '<span class="font-bold text-sm">Include video (YouTube URL)</span></label>' +
      '<label class="flex items-center gap-3 cursor-pointer">' +
      '<input type="checkbox" class="ce-mod-quiz accent-primary shrink-0" />' +
      '<span class="font-bold text-sm">Include quiz</span></label></fieldset>' +
      '<div class="ce-mod-notes-fields space-y-4 hidden">' +
      '<div class="space-y-2">' +
      '<label class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label">Lecture highlights (notes &amp; materials)</label>' +
      '<textarea class="ce-mod-notes-text w-full px-5 py-4 bg-surface-container-low rounded-xl min-h-[90px]" placeholder="Key ideas from lecture notes, slides, and readings you attached…"></textarea>' +
      '</div>' +
      '<div class="space-y-2">' +
      '<label class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label">Sample materials (assets/sample-files)</label>' +
      '<div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">' +
      '<select class="ce-mod-sample-select flex-1 min-w-0 px-4 py-3 bg-surface-container-low rounded-xl text-sm font-medium border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10">' +
      '<option value="">Loading sample files…</option></select>' +
      '<button type="button" class="ce-mod-sample-add shrink-0 px-4 py-3 bg-surface-container text-xs font-black rounded-xl border border-outline-variant/20 whitespace-nowrap">' +
      'Add selected</button></div>' +
      '<div class="ce-mod-sample-list space-y-0"></div></div></div>' +
      '<div class="ce-mod-video-fields hidden space-y-3">' +
      '<label class="text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label block">Video URL</label>' +
      '<div class="flex flex-col sm:flex-row gap-2">' +
      '<input type="url" class="ce-mod-youtube-input flex-1 px-4 py-3 rounded-xl bg-surface-container-low border-none font-medium" placeholder="https://www.youtube.com/watch?v=..." />' +
      '<button type="button" class="ce-mod-youtube-submit shrink-0 px-6 py-3 bg-primary text-on-primary rounded-xl font-black text-xs">Add video</button></div>' +
      '<p class="ce-mod-youtube-error text-xs font-medium text-red-600 hidden" aria-live="polite"></p>' +
      '<div class="ce-mod-youtube-list space-y-3"></div></div>' +
      '<div class="ce-mod-quiz-fields hidden space-y-4">' +
      '<div class="ce-mod-quiz-host space-y-4"></div>' +
      '<button type="button" class="ce-mod-add-question w-full sm:w-auto px-5 py-3 bg-primary/10 text-primary font-black text-xs rounded-xl border border-primary/15">' +
      '+ Add question</button></div>';

    wrap.querySelector('.ce-mod-remove')?.addEventListener('click', function () {
      if (document.querySelectorAll('.ce-module-editor-card').length <= 1) {
        toastSafe('Course needs at least one module.', 'error');
        return;
      }
      wrap.remove();
    });

    host.appendChild(wrap);

    bindYoutubeSection(wrap);
    bindQuizSection(wrap);
    bindSampleRows(wrap);
    wireToggles(wrap);

    if (prefill && typeof prefill === 'object') {
      wrap.querySelector('.ce-mod-title-input').value = prefill.title || '';
      wrap.querySelector('.ce-mod-about-text').value =
        typeof prefill.description === 'string' ? prefill.description : '';
      wrap.querySelector('.ce-mod-notes-text').value =
        typeof prefill.lecture_notes_summary === 'string' ? prefill.lecture_notes_summary : '';
      wrap.querySelector('.ce-mod-notes').checked = !!(
        prefill.include_notes ??
        (String(prefill.lecture_notes_summary || '').trim().length > 0 ||
          (Array.isArray(prefill.sample_files) && prefill.sample_files.length > 0))
      );
      wrap.querySelector('.ce-mod-video').checked = !!(prefill.include_video ?? (prefill.video_url || '').trim());
      wrap.querySelector('.ce-mod-quiz').checked = !!(prefill.include_quiz ?? (Array.isArray(prefill.quiz) && prefill.quiz.length));
      wireToggles(wrap);
      var y = String(prefill.video_url || '').trim();
      if (y) {
        wrap.querySelector('.ce-mod-video').checked = true;
        wireToggles(wrap);
        var inp = wrap.querySelector('.ce-mod-youtube-input');
        inp.value = y;
        wrap.querySelector('.ce-mod-youtube-submit').click();
        inp.value = '';
      }
      var sfs = Array.isArray(prefill.sample_files) ? prefill.sample_files : [];
      sfs.forEach(function (sf) {
        appendSampleFileRow(wrap, {
          name: sf.name || 'notes.pdf',
          size_label: sf.size_label || 'Sample',
          url: sf.url ? String(sf.url).trim() : '',
          download_name: sf.download_name ? String(sf.download_name).trim() : ''
        });
      });
      var quiz = Array.isArray(prefill.quiz) ? prefill.quiz : [];
      if (quiz.length) {
        wrap.querySelector('.ce-mod-quiz').checked = true;
        wireToggles(wrap);
        quiz.forEach(function (qRow) {
          var addQ = wrap._ceAddQuizQuestion;
          if (typeof addQ === 'function') addQ();
          var blocks = wrap.querySelectorAll('.ce-mod-quiz-host .ce-quiz-question-block');
          var b = blocks[blocks.length - 1];
          if (!b) return;
          var pi = b.querySelector('.ce-quiz-question-input');
          if (pi) pi.value = qRow.prompt || '';
          var opi = [...b.querySelectorAll('.ce-quiz-option-input')];
          (qRow.choices || []).forEach(function (ch, j) {
            if (opi[j]) opi[j].value = ch;
          });
          [...b.querySelectorAll('input[type="radio"]')].forEach(function (r, j) {
            r.checked = j === (qRow.correct_index || 0);
          });
        });
      }
    }

    wireToggles(wrap);
    return wrap;
  }

  function collectYoutubeFirst (scope) {
    var span = scope.querySelector('.ce-mod-youtube-list .truncate.text-on-surface');
    return span ? span.textContent.trim() : '';
  }

  function collectSamples (scope) {
    var list = [];
    scope.querySelectorAll('.ce-mod-sample-list > div').forEach(function (row) {
      var o = {
        name: row.querySelector('p.text-sm.font-bold')
          ? row.querySelector('p.text-sm.font-bold').textContent.trim()
          : 'file',
        size_label:
          (row.querySelector('p.text-on-surface-variant') &&
            row.querySelector('p.text-on-surface-variant').textContent.trim()) ||
          'sample'
      };
      var fileUrl = row.getAttribute('data-ce-file-url');
      if (fileUrl) o.url = fileUrl.trim();
      var dn = row.getAttribute('data-ce-download-name');
      if (dn) o.download_name = dn.trim();
      list.push(o);
    });
    return list;
  }

  function collectQuizFromCard (scope) {
    var blocks = [...scope.querySelectorAll('.ce-mod-quiz-fields .ce-quiz-question-block')];
    return blocks
      .map(function (blk) {
        var prompt = (blk.querySelector('.ce-quiz-question-input')?.value || '').trim();
        var opts = [...blk.querySelectorAll('.ce-quiz-option-input')].map(function (inp) {
          return (inp.value || '').trim();
        });
        opts = opts.filter(Boolean);
        var radios = [...blk.querySelectorAll('input[type="radio"]')];
        var correct = 0;
        radios.forEach(function (r, i) {
          if (r.checked) correct = i;
        });
        return { prompt: prompt, choices: opts, correct_index: correct };
      })
      .filter(function (x) {
        return x.prompt && x.choices.length >= 2;
      });
  }

  function gatherModulesPayload () {
    var cards = [...document.querySelectorAll('.ce-module-editor-card')];
    return cards.map(function (card) {
      var notesOn = !!(card.querySelector('.ce-mod-notes') && card.querySelector('.ce-mod-notes').checked);
      var videoOn = !!(card.querySelector('.ce-mod-video') && card.querySelector('.ce-mod-video').checked);
      var quizOn = !!(card.querySelector('.ce-mod-quiz') && card.querySelector('.ce-mod-quiz').checked);
      var title = (card.querySelector('.ce-mod-title-input')?.value || '').trim() || 'Module';
      var aboutTxt = (card.querySelector('.ce-mod-about-text')?.value || '').trim();
      var notesTxt = (card.querySelector('.ce-mod-notes-text')?.value || '').trim();
      return {
        title: title,
        description: aboutTxt,
        lecture_notes_summary: notesOn ? notesTxt : '',
        sample_files: notesOn ? collectSamples(card) : [],
        video_url: videoOn ? collectYoutubeFirst(card) : '',
        quiz: quizOn ? collectQuizFromCard(card) : []
      };
    });
  }

  function clearAndLoadModulesFromApi (mods, _courseIgnored) {
    var host = document.getElementById('ce-modules-host');
    if (!host) return;
    host.innerHTML = '';
    var arr = Array.isArray(mods) && mods.length ? mods : [{}];
    arr.forEach(function (m) {
      appendModuleCard({
        title: m.title,
        description: typeof m.description === 'string' ? m.description : '',
        lecture_notes_summary: typeof m.lecture_notes_summary === 'string' ? m.lecture_notes_summary : '',
        video_url: m.video_url || '',
        sample_files: m.sample_files,
        quiz: m.quiz || [],
        include_notes: !!(
          (m.lecture_notes_summary && String(m.lecture_notes_summary).trim()) ||
          (m.sample_files && m.sample_files.length)
        ),
        include_video: !!(m.video_url || '').trim(),
        include_quiz: Array.isArray(m.quiz) && m.quiz.length > 0
      });
    });
  }

  function ensureDefaultModuleRow () {
    var host = document.getElementById('ce-modules-host');
    if (host && !host.querySelector('.ce-module-editor-card')) appendModuleCard(null);
  }

  window.ceGatherModulesPayload = gatherModulesPayload;
  window.ceClearAndLoadModules = clearAndLoadModulesFromApi;

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('ce-modules-host')) return;
    var addBtn = document.getElementById('ce-add-module-btn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        appendModuleCard(null);
      });
    }
    ensureDefaultModuleRow();
  });
})();
