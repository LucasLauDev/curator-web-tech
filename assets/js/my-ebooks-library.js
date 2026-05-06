/**
 * My eBooks: loads purchases from /api/bookstore/my-library and wires the reader modal.
 */
(function curatorMyEbooks(global) {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function fetchMyLibrary() {
    const r = await fetch('/api/bookstore/my-library', { credentials: 'same-origin' });
    if (r.status === 401) {
      global.location.replace('/landing/landing/login.html');
      return [];
    }
    if (!r.ok) return [];
    const d = await r.json().catch(() => ({}));
    return Array.isArray(d.books) ? d.books : [];
  }

  function defaultChapters() {
    return [
      { label: 'Chap 1', title: 'Opening Notes', content: ['Chapter text will appear here when configured for this title.'] },
      { label: 'Chap 2', title: 'Next Steps', content: ['Use the tabs above to move between chapters.'] }
    ];
  }

  function readerPayload(book) {
    const r = book.reader_json && typeof book.reader_json === 'object' ? book.reader_json : {};
    return {
      author: r.author || book.author || 'CuratorEdu',
      tag: r.tag || 'Digital Book',
      readTime: r.readTime || '10 min read',
      summary: r.summary || book.description || 'A focused reading view for this purchase.',
      chapters: Array.isArray(r.chapters) && r.chapters.length ? r.chapters : defaultChapters()
    };
  }

  function renderContinueStrip(el, books) {
    if (!el) return;
    el.innerHTML = '';
    const inProgress = books.filter((b) => {
      const p = Number((b.reader_json || {}).progressPercent);
      return Number.isFinite(p) && p > 0 && p < 100;
    });
    const picks = (inProgress.length ? inProgress : books).slice(0, 2);
    if (!picks.length) {
      el.innerHTML =
        '<p class="text-on-surface-variant text-sm">Purchased titles show here after checkout.</p>';
      return;
    }
    for (const b of picks) {
      const rj = b.reader_json || {};
      const pct = Math.min(100, Math.max(0, Number(rj.progressPercent || 40)));
      const label = escapeHtml(rj.progressLabel || `In progress • ${pct}%`);
      const title = escapeHtml(b.title);
      const auth = escapeHtml(b.author || '');
      const img = escapeHtml(b.image_url);
      const barClass = pct >= 85 ? 'bg-tertiary' : 'bg-primary';
      const chipClass =
        pct >= 85
          ? 'bg-tertiary-container text-on-tertiary-container'
          : 'bg-secondary-container text-on-secondary-container';
      el.insertAdjacentHTML(
        'beforeend',
        `
        <div data-library-continue="1" data-book-id="${escapeHtml(b.id)}"
            class="flex-shrink-0 w-[450px] bg-surface-container-lowest p-6 rounded-xl flex gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group">
          <div class="w-32 h-44 rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform">
            <img alt="" class="w-full h-full object-cover" src="${img}" />
          </div>
          <div class="flex-1 flex flex-col justify-between py-2">
            <div>
              <span class="${chipClass} text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-full label-text">${label}</span>
              <h3 class="text-xl font-bold mt-3 headline">${title}</h3>
              <p class="text-on-surface-variant text-sm font-medium">${auth ? `By ${auth}` : ''}</p>
            </div>
            <div class="w-full bg-surface-container rounded-full h-2 mt-4">
              <div class="${barClass} h-full rounded-full" style="width:${pct}%"></div>
            </div>
            <button type="button" data-action="resume-reading" data-book-id="${escapeHtml(b.id)}"
              class="mt-4 bg-primary text-on-primary py-3 rounded-xl font-bold transition-all hover:brightness-110 active:scale-95">Resume Reading</button>
          </div>
        </div>`
      );
    }
  }

  function renderLibraryGrid(grid, books) {
    if (!grid) return;
    if (!books.length) {
      grid.innerHTML =
        '<p class="col-span-full text-on-surface-variant">No purchases yet. Visit the bookstore and complete checkout.</p>';
      return;
    }
    grid.innerHTML = books
      .map((b) => {
        const rj = b.reader_json || {};
        const state = rj.libraryState || 'progress';
        const typ = rj.libraryType || 'digital';
        const title = escapeHtml(b.title);
        const auth = escapeHtml(b.author || '');
        const img = escapeHtml(b.image_url);
        const fname = escapeHtml(String(b.title || 'book').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '.pdf');
        return `
        <div data-library-card="1" data-book-id="${escapeHtml(b.id)}" data-state="${escapeHtml(state)}" data-type="${escapeHtml(typ)}"
            class="bg-surface-container-lowest rounded-xl p-5 flex flex-col group hover:shadow-2xl hover:shadow-primary/10 transition-all">
          <div class="relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-6 shadow-lg">
            <img alt="" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${img}" />
          </div>
          <h4 class="text-lg font-bold headline leading-snug">${title}</h4>
          <p class="text-on-surface-variant text-sm font-medium mb-6">${auth}</p>
          <div class="mt-auto flex flex-col gap-2">
            <button type="button" data-action="read-now" data-book-id="${escapeHtml(b.id)}"
                class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all">
              <span>Read Now</span>
            </button>
            <button type="button" data-action="download-pdf" data-filename="${fname}"
                class="w-full py-3 bg-surface-container-low text-on-surface-variant rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all">
              <span class="material-symbols-outlined text-xl">cloud_download</span>
              <span>Download PDF</span>
            </button>
          </div>
        </div>`;
      })
      .join('');
  }

  function bookById(map, id) {
    return map.get(String(id || '')) || null;
  }

  global.addEventListener('DOMContentLoaded', async () => {
    const cfg = global.curatorMyEbooksSelectors || {};
    const stripId = cfg.continueStripId || 'ebooks-continue-strip';
    const gridId = cfg.libraryGridId || 'ebooks-library-grid';
    const historyHref =
      typeof cfg.historyHref === 'string' && cfg.historyHref.length
        ? cfg.historyHref
        : 'order_history_download.html';
    const gridSelector = '#' + String(gridId).replace(/^#/, '');

    const strip = document.getElementById(stripId);
    const grid = document.getElementById(gridId);
    const viewAllHistoryBtn = document.getElementById('view-all-history-btn');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const filterButtons = document.querySelectorAll('.library-filter-btn');
    const readerModal = document.getElementById('reader-modal');
    const readerBackdrop = document.getElementById('reader-backdrop');
    const readerCloseBtn = document.getElementById('reader-close-btn');
    const readerMinimizeBtn = document.getElementById('reader-minimize-btn');
    const readerTitle = document.getElementById('reader-title');
    const readerAuthor = document.getElementById('reader-author');
    const readerTag = document.getElementById('reader-tag');
    const readerReadtime = document.getElementById('reader-readtime');
    const readerChapterTabs = document.getElementById('reader-chapter-tabs');
    const readerCurrentChapter = document.getElementById('reader-current-chapter');
    const readerSummary = document.getElementById('reader-summary');
    const readerContent = document.getElementById('reader-content');

    const books = await fetchMyLibrary();
    const byId = new Map(books.map((b) => [String(b.id), b]));

    renderContinueStrip(strip, books);
    renderLibraryGrid(grid, books);

    const setActiveChapter = (chapter, chapterIndex, chapterCount) => {
      if (readerCurrentChapter) {
        readerCurrentChapter.textContent = `${chapter.label} / ${chapterCount}`;
      }
      if (readerContent) {
        const paras = (chapter.content || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
        readerContent.innerHTML = `
                        <h4 class="font-headline text-2xl md:text-3xl font-black text-on-surface">${escapeHtml(chapter.title)}</h4>
                        ${paras}`;
      }
      if (readerChapterTabs) {
        readerChapterTabs.querySelectorAll('button[data-chapter-index]').forEach((tab) => {
          const isActive = Number(tab.getAttribute('data-chapter-index')) === chapterIndex;
          tab.classList.toggle('bg-primary', isActive);
          tab.classList.toggle('text-on-primary', isActive);
          tab.classList.toggle('bg-surface-container-low', !isActive);
          tab.classList.toggle('text-on-surface-variant', !isActive);
        });
      }
    };

    function openReaderForBook(book, opts = {}) {
      if (!book) return;
      const title = book.title || 'Reading';
      const data = readerPayload(book);
      const chapters = data.chapters || [];
      if (readerTitle) readerTitle.textContent = title;
      if (readerAuthor) readerAuthor.textContent = data.author;
      if (readerTag) readerTag.textContent = data.tag;
      if (readerReadtime) readerReadtime.textContent = data.readTime;
      if (readerSummary) readerSummary.textContent = data.summary;
      if (readerChapterTabs) {
        readerChapterTabs.innerHTML = chapters
          .map(
            (chapter, index) => `
                        <button type="button"
                            data-chapter-index="${index}"
                            class="px-4 py-2 rounded-full text-sm font-bold transition-colors ${index === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}">
                            ${escapeHtml(chapter.label)}
                        </button>
                    `
          )
          .join('');
        readerChapterTabs.querySelectorAll('button[data-chapter-index]').forEach((tab) => {
          tab.addEventListener('click', () => {
            const chapterIndex = Number(tab.getAttribute('data-chapter-index')) || 0;
            const chapter = chapters[chapterIndex];
            if (!chapter) return;
            setActiveChapter(chapter, chapterIndex, chapters.length);
          });
        });
      }
      let startIndex = 0;
      if (opts.start === 'last') startIndex = Math.max(0, chapters.length - 1);
      else if (typeof opts.start === 'number') {
        startIndex = Math.max(0, Math.min(opts.start, Math.max(0, chapters.length - 1)));
      }
      if (chapters.length > 0) {
        setActiveChapter(chapters[startIndex], startIndex, chapters.length);
      } else if (readerContent) {
        readerContent.innerHTML = '<p>This title has no chapters yet.</p>';
      }
      readerModal?.classList.remove('hidden');
    }

    const closeReader = () => readerModal?.classList.add('hidden');

    viewAllHistoryBtn?.addEventListener('click', () => {
      global.location.href = historyHref;
    });

    const librarySearch = document.getElementById('library-search');
    const librarySort = document.getElementById('library-sort');

    const applyLibraryFilters = () => {
      const query = librarySearch ? librarySearch.value.toLowerCase().trim() : '';
      const sort = librarySort ? librarySort.value : 'all';
      const cards = document.querySelectorAll(`${gridSelector} [data-library-card]`);
      cards.forEach((card) => {
        const title = (card.querySelector('h4')?.textContent || '').toLowerCase();
        const type = card.getAttribute('data-type') || '';
        const searchOk = !query || title.includes(query);
        const sortOk =
          sort === 'all' || sort === 'recent' ? true : sort === 'digital' ? type === 'digital' : true;
        card.classList.toggle('hidden', !(searchOk && sortOk));
      });
    };

    librarySearch?.addEventListener('input', applyLibraryFilters);
    librarySort?.addEventListener('change', applyLibraryFilters);

    mobileSearchBtn?.addEventListener('click', () => {
      alert('Use the search field above on desktop.');
    });

    document.body.addEventListener('click', (e) => {
      const resume = e.target.closest?.('button[data-action="resume-reading"]');
      if (resume) {
        openReaderForBook(bookById(byId, resume.getAttribute('data-book-id')), { start: 0 });
        return;
      }
      const finalCh = e.target.closest?.('button[data-action="final-chapter"]');
      if (finalCh) {
        openReaderForBook(bookById(byId, finalCh.getAttribute('data-book-id')), { start: 'last' });
        return;
      }
      const readNow = e.target.closest?.('button[data-action="read-now"]');
      if (readNow) {
        openReaderForBook(bookById(byId, readNow.getAttribute('data-book-id')), {});
      }
      const dl = e.target.closest?.('button[data-action="download-pdf"]');
      if (dl) {
        const filename = dl.getAttribute('data-filename') || 'library-book.pdf';
        const content = ['CuratorEdu Download', `Title reference: ${filename}`, 'Digital preview export.'].join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.replace('.pdf', '.txt');
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    });

    readerCloseBtn?.addEventListener('click', closeReader);
    readerMinimizeBtn?.addEventListener('click', closeReader);
    readerBackdrop?.addEventListener('click', closeReader);
    global.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeReader();
    });

    const matchesFilter = (card, filter) => {
      if (filter === 'all') return true;
      if (filter === 'progress') return card.getAttribute('data-state') === 'progress';
      if (filter === 'finished') return card.getAttribute('data-state') === 'finished';
      if (filter === 'digital') return card.getAttribute('data-type') === 'digital';
      return true;
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const selectedFilter = button.getAttribute('data-filter') || 'all';
        filterButtons.forEach((btn) => {
          btn.classList.remove('bg-primary', 'text-on-primary');
          btn.classList.add('bg-surface-container-high', 'text-on-surface-variant');
        });
        button.classList.remove('bg-surface-container-high', 'text-on-surface-variant');
        button.classList.add('bg-primary', 'text-on-primary');
        document.querySelectorAll(`${gridSelector} [data-library-card]`).forEach((card) => {
          card.classList.toggle('hidden', !matchesFilter(card, selectedFilter));
        });
      });
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
