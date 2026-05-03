/**
 * Fetches bookstore rows from Express API and renders catalog cards.
 */
(function bookstoreCatalog(global) {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatRm(n) {
    const v = Number(n);
    const x = Number.isFinite(v) ? v : 0;
    return `RM ${x.toFixed(2)}`;
  }

  function renderCard(book) {
    const title = escapeHtml(book.title);
    const author = escapeHtml(book.author || '');
    const img = escapeHtml(book.image_url);
    const badge = book.badge ? escapeHtml(book.badge) : '';
    const badgeSpan = badge
      ? `<span class="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">${badge}</span>`
      : '';
    const price = formatRm(book.price_rm);
    const cat = escapeHtml(book.category || 'tech');
    const id = escapeHtml(book.id);

    return `
                <div class="group relative flex flex-col book-card" data-category="${cat}" data-book-id="${id}" data-title="${title}" data-author="${author}" data-price="${Number(book.price_rm)}">
                                        <div
                                                class="aspect-[3/4] rounded-lg overflow-hidden relative shadow-[0_16px_32px_-12px_rgba(0,0,0,0.15)] bg-surface-container transition-transform duration-500 group-hover:-translate-y-2">
                                                <img alt="" class="w-full h-full object-cover" src="${img}" />
                                                <div
                                                        class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                </div>
                                                <a class="absolute bottom-4 right-4 w-12 h-12 bg-surface-bright/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-xl hover:scale-110 active:scale-95 transition-all"
                                                        href="#" data-add-cart="1"
                                                        aria-label="Add ${title} to cart">
                                                        <span class="material-symbols-outlined"
                                                                style="font-variation-settings: 'FILL' 1;">add</span>
                                                </a>
                                        </div>
                                        <div class="mt-4 px-1">
                                                <h3
                                                        class="font-headline font-bold text-on-background leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                        ${title}</h3>
                                                <p class="text-xs text-on-surface-variant mt-1 line-clamp-1">${author || '\u00a0'}</p>
                                                <div class="flex items-center justify-between mt-2">
                                                        <p class="text-lg font-black text-on-background font-headline">
                                                                ${price}</p>
                                                        ${badgeSpan}
                                                </div>
                                        </div>
                                </div>`;
  }

  async function fetchBooks(limit) {
    const q = limit != null ? `?limit=${encodeURIComponent(String(limit))}` : '';
    const r = await fetch(`/api/bookstore/books${q}`, { credentials: 'same-origin' });
    if (!r.ok) throw new Error('Could not load bookstore');
    const data = await r.json();
    return Array.isArray(data.books) ? data.books : [];
  }

  /**
   * @param {object} opts
   * @param {string} opts.gridSelector
   * @param {string} [opts.bundleBannerSelector] - container with .claim-bundle-btn
   * @param {string} [opts.excludeTitle] - e.g. bundle title to omit from grid
   * @param {number} [opts.limit]
   */
  async function mountCuratorBookstoreGrid(opts) {
    const grid = document.querySelector(opts.gridSelector);
    if (!grid) return { books: [] };

    grid.innerHTML = '<p class="col-span-full text-on-surface-variant text-sm p-4">Loading catalog…</p>';

    let books;
    try {
      books = await fetchBooks(opts.limit);
    } catch (e) {
      grid.innerHTML = `<p class="col-span-full text-error text-sm p-4">${escapeHtml(e.message || 'Load failed')}</p>`;
      return { books: [] };
    }

    const exclude = (opts.excludeTitle || 'Summer Reading Bundle').trim();
    const gridBooks = books.filter((b) => b.title !== exclude);

    grid.innerHTML = gridBooks.map(renderCard).join('');

    const bundle = books.find((b) => b.title === exclude);
    const banner = opts.bundleBannerSelector
      ? document.querySelector(opts.bundleBannerSelector)
      : null;
    if (bundle && banner) {
      const btn = banner.querySelector('.claim-bundle-btn');
      if (btn) {
        btn.dataset.bookId = bundle.id;
        btn.textContent = `Claim Bundle — ${formatRm(bundle.price_rm)}`;
      }
    }

    grid.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-add-cart]');
      if (!a) return;
      e.preventDefault();
      const card = a.closest('[data-book-id]');
      if (!card || !global.addToCart) return;
      const bid = card.getAttribute('data-book-id');
      const t = card.querySelector('h3')?.textContent?.trim() || '';
      const priceEl = card.querySelector('p.text-lg');
      const img = card.querySelector('img')?.getAttribute('src') || '';
      global.addToCart(e, bid, t, priceEl?.textContent?.trim() || formatRm(card.dataset.price), img);
    });

    if (bundle && banner) {
      const btn = banner.querySelector('.claim-bundle-btn');
      btn?.addEventListener('click', (e) => {
        if (!global.addToCart) return;
        global.addToCart(
          e,
          bundle.id,
          bundle.title,
          formatRm(bundle.price_rm),
          bundle.image_url
        );
      });
    }

    return { books };
  }

  async function mountCuratorLandingBooks(gridSelector, limit) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    grid.innerHTML = '<p class="col-span-full text-slate-500 text-sm">Loading…</p>';
    let list;
    try {
      const cap = limit || 4;
      const r = await fetch(`/api/bookstore/books?limit=${encodeURIComponent(String(cap))}`);
      if (!r.ok) throw new Error('unavailable');
      const j = await r.json();
      list = (j.books || []).filter((b) => b.title !== 'Summer Reading Bundle').slice(0, cap);
    } catch (_) {
      grid.innerHTML = '<p class="col-span-full text-slate-500">Catalog temporarily unavailable.</p>';
      return;
    }
    grid.innerHTML = list
      .map(
        (b) => `
        <div class="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
          <div class="aspect-[3/4] overflow-hidden bg-slate-100">
            <img src="${escapeHtml(b.image_url)}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div class="p-6">
            ${b.badge ? `<span class="label text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded bg-violet-50 text-violet-700 mb-2 inline-block">${escapeHtml(b.badge)}</span>` : ''}
            <h3 class="headline font-bold text-lg mb-1 line-clamp-2">${escapeHtml(b.title)}</h3>
            <p class="text-slate-500 text-sm mb-4 line-clamp-2">${escapeHtml((b.author ? 'By ' + b.author + '. ' : '') + (b.description || ''))}</p>
            <div class="flex items-center justify-between">
              <span class="font-black text-xl text-slate-900">${formatRm(b.price_rm)}</span>
              <a href="login.html" class="text-violet-600 font-bold text-sm hover:underline">Explore More</a>
            </div>
          </div>
        </div>`
      )
      .join('');
  }

  global.mountCuratorBookstoreGrid = mountCuratorBookstoreGrid;
  global.mountCuratorLandingBooks = mountCuratorLandingBooks;
})(typeof window !== 'undefined' ? window : globalThis);
