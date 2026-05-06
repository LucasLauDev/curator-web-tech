/**
 * Bookstore admin — loads /api/admin/bookstore/* (requires admin session + npm start).
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || window.location.protocol === 'file:') return;

  function esc (s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function formatRm (n) {
    const v = Number(n);
    return Number.isFinite(v) ? `RM ${v.toFixed(2)}` : 'RM 0.00';
  }

  function formatInt (n) {
    const v = Number(n);
    return Number.isFinite(v) ? String(Math.round(v)) : '0';
  }

  let activeFilter = 'all';
  let editingId = null;
  let inventoryData = [];

  const els = {
    tbody: () => document.getElementById('inventory-table-body'),
    count: () => document.getElementById('inventory-count'),
    statTotal: () => document.getElementById('stat-total-books'),
    statDraft: () => document.getElementById('stat-draft-books'),
    statMtd: () => document.getElementById('stat-mtd-revenue'),
    queueList: () => document.getElementById('approval-queue-list'),
    search: () => document.getElementById('inventory-search')
  };

  async function loadStats () {
    try {
      const r = await fetch('/api/admin/bookstore/stats', { credentials: 'same-origin' });
      if (r.status === 401) {
        window.location.replace('/landing/landing/login.html');
        return;
      }
      if (!r.ok) return;
      const j = await r.json().catch(() => ({}));
      if (els.statTotal()) els.statTotal().textContent = formatInt(j.total_books);
      if (els.statDraft()) els.statDraft().textContent = formatInt(j.draft_books);
      if (els.statMtd()) els.statMtd().textContent = formatRm(j.mtd_revenue_rm);

      const b = document.getElementById('approval-queue-badge');
      if (b) b.textContent = 'Workflow N/A';
    } catch (_) {
      /* keep stat placeholders */
    }
  }

  function setQueuePlaceholder (html) {
    const el = els.queueList();
    if (el) el.innerHTML = html;
  }

  async function loadInventory () {
    try {
      const r = await fetch('/api/admin/bookstore/books', { credentials: 'same-origin' });
      if (r.status === 401) {
        window.location.replace('/landing/landing/login.html');
        return;
      }
      if (r.status === 403) {
        alert('Admin access required.');
        setQueuePlaceholder('<p class="text-sm text-error font-medium px-1">Admin access required.</p>');
        inventoryData = [];
        renderTable();
        updatePaginationLabel();
        return;
      }
      if (!r.ok) {
        inventoryData = [];
        renderTable();
        updatePaginationLabel();
        setQueuePlaceholder(
          '<p class="text-sm text-error font-medium px-1">Could not load catalogue. Check the server log and try again.</p>'
        );
        return;
      }
      const j = await r.json();
      inventoryData = Array.isArray(j.books) ? j.books : [];
      renderTable();
      updatePaginationLabel();
      setQueuePlaceholder(
        '<p class="text-sm text-on-surface-variant font-medium px-1">No lecturer recommendations pending. Approvals would appear here when that workflow exists.</p>'
      );
    } catch (_) {
      inventoryData = [];
      renderTable();
      updatePaginationLabel();
      setQueuePlaceholder(
        '<p class="text-sm text-error font-medium px-1">Network error loading catalogue.</p>'
      );
    }
  }

  function bookStatus (b) {
    return b.is_published ? 'published' : 'unpublished';
  }

  function searchQuery () {
    return (els.search()?.value || '').toLowerCase().trim();
  }

  function filteredRows () {
    const q = searchQuery();
    return inventoryData.filter((item) => {
      const status = bookStatus(item);
      if (!(activeFilter === 'all' || status === activeFilter)) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.author || ''} ${item.sku || ''} ${item.id}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderTable () {
    const tbody = els.tbody();
    if (!tbody) return;
    tbody.innerHTML = '';
    filteredRows().forEach((item) => {
      const status = bookStatus(item);
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-low/50 transition-colors group';
      const skuDisp = item.sku || item.id.slice(0, 8);
      tr.innerHTML = `
            <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                    <div class="h-12 w-9 rounded overflow-hidden shadow-sm">
                        <img src="${String(item.image_url || '').replace(/"/g, '')}" alt="" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <div class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">${esc(item.title)}</div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">SKU: ${esc(skuDisp)} · ${esc(item.author || '')}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-5">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} text-[10px] font-black uppercase tracking-tight">
                    <span class="w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                    ${status}
                </span>
            </td>
            <td class="px-6 py-5 text-sm font-bold text-on-surface">${formatRm(item.price_rm)}</td>
            <td class="px-6 py-5">
                <div class="text-sm font-bold text-on-surface">${formatInt(item.sale_count)}</div>
                <div class="text-[10px] text-primary font-bold">${formatRm(item.revenue_rm)} revenue</div>
            </td>
            <td class="px-8 py-5 text-right">
                <button type="button" class="p-2 hover:bg-surface-container rounded-full transition-colors text-slate-400 row-action-btn" data-book-id="${esc(item.id)}">
                    <span class="material-symbols-outlined text-lg">more_vert</span>
                </button>
            </td>`;
      tbody.appendChild(tr);
    });
  }

  function updatePaginationLabel () {
    const el = els.count();
    if (!el) return;
    const n = filteredRows().length;
    el.innerHTML = `Showing <span class="font-bold text-on-surface">${n}</span> title(s)`;
  }

  function showViewDetailsModal (item) {
    const modal = document.getElementById('view-details-modal');
    document.getElementById('view-detail-title').textContent = item.title;
    document.getElementById('view-detail-sku').textContent = `SKU: ${item.sku || item.id.slice(0, 8)}`;
    document.getElementById('view-detail-status').textContent =
      bookStatus(item).charAt(0).toUpperCase() + bookStatus(item).slice(1);
    document.getElementById('view-detail-price').textContent = formatRm(item.price_rm);
    document.getElementById('view-detail-sales').textContent = `${formatInt(item.sale_count)} units`;
    document.getElementById('view-detail-cover').querySelector('img').src = item.image_url;
    modal.classList.replace('hidden', 'flex');
  }

  function closeRowMenu () {
    const existing = document.getElementById('row-action-menu');
    if (existing) existing.remove();
  }

  function openRowMenu (event, anchorEl, bookId) {
    event.stopPropagation();
    closeRowMenu();
    const item = inventoryData.find((it) => it.id === bookId);
    if (!item || !anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'row-action-menu';
    menu.className = 'bg-white rounded-xl shadow-2xl border border-surface-container p-2 text-sm z-[9999]';
    menu.style.position = 'fixed';
    menu.style.minWidth = '160px';
    document.body.appendChild(menu);
    const menuRect = menu.getBoundingClientRect();
    let left = rect.right + 8;
    if (left + menuRect.width > window.innerWidth) {
      left = rect.left - menuRect.width - 8;
    }
    menu.style.left = `${left}px`;
    menu.style.top = `${rect.top}px`;

    menu.innerHTML =
      '<button type="button" class="w-full text-left px-3 py-2 hover:bg-surface-container rounded-md action-view">View Details</button>' +
      '<button type="button" class="w-full text-left px-3 py-2 hover:bg-surface-container rounded-md action-edit">Edit</button>';

    menu.querySelector('.action-view').onclick = () => {
      showViewDetailsModal(item);
      closeRowMenu();
    };

    menu.querySelector('.action-edit').onclick = () => {
      editingId = item.id;
      document.getElementById('edit-title').value = item.title;
      document.getElementById('edit-author').value = item.author || '';
      document.getElementById('edit-sku').value = item.sku || '';
      document.getElementById('edit-desc').value = item.description || '';
      document.getElementById('edit-price').value = String(item.price_rm);
      document.getElementById('edit-image-url').value = item.image_url || '';
      document.getElementById('edit-category').value = item.category || 'design';
      document.getElementById('edit-badge').value = item.badge || '';
      document.getElementById('edit-sort').value = String(item.sort_order ?? 0);
      const unpublishBtn = document.getElementById('unpublish-btn');
      unpublishBtn.textContent = item.is_published ? 'Unpublish eBook' : 'Publish eBook';
      document.getElementById('edit-ebook-panel').classList.replace('hidden', 'flex');
      closeRowMenu();
    };
  }

  function exportCsv () {
    const rows = filteredRows();
    const cols = ['id', 'sku', 'title', 'author', 'category', 'price_rm', 'is_published', 'sale_count', 'revenue_rm'];
    const lines = [cols.join(',')].concat(
      rows.map((b) =>
        cols
          .map((c) => {
            let v = b[c];
            if (v === null || v === undefined) v = '';
            const s = String(v).replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(',')
      )
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookstore-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('close-view-details').onclick = () => {
      document.getElementById('view-details-modal').classList.replace('flex', 'hidden');
    };
    document.getElementById('close-view-details-btn').onclick = () => {
      document.getElementById('view-details-modal').classList.replace('flex', 'hidden');
    };

    const tbody = els.tbody();
    tbody?.addEventListener('click', (e) => {
      const btn = e.target.closest('.row-action-btn');
      if (!btn) return;
      openRowMenu(e, btn, btn.getAttribute('data-book-id'));
    });

    document.addEventListener('click', (e) => {
      const menu = document.getElementById('row-action-menu');
      if (!menu) return;
      const target = e.target;
      if (menu.contains(target)) return;
      if (target.closest && target.closest('.row-action-btn')) return;
      closeRowMenu();
    });

    document.querySelectorAll('.filter-tab').forEach((btn) => {
      btn.onclick = () => {
        activeFilter = btn.dataset.filter || 'all';
        document.querySelectorAll('.filter-tab').forEach((b) => {
          b.className =
            'filter-tab flex-none px-5 py-2 bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 rounded-full font-bold text-xs label-text hover:bg-surface-container transition-colors';
        });
        btn.className =
          'filter-tab flex-none px-5 py-2 bg-primary text-on-primary rounded-full font-bold text-xs label-text shadow-md shadow-primary/20';
        renderTable();
        updatePaginationLabel();
      };
    });

    els.search()?.addEventListener('input', () => {
      renderTable();
      updatePaginationLabel();
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', exportCsv);

    const addModal = document.getElementById('add-ebook-panel');
    document.getElementById('add-title-btn').onclick = () => {
      editingId = null;
      document.getElementById('new-title').value = '';
      document.getElementById('new-author').value = '';
      document.getElementById('new-sku').value = '';
      document.getElementById('new-desc').value = '';
      document.getElementById('new-price').value = '';
      document.getElementById('new-image-url').value = '';
      document.getElementById('new-category').value = 'design';
      document.getElementById('new-badge').value = '';
      document.getElementById('new-sort').value = '0';
      addModal.classList.replace('hidden', 'flex');
    };
    document.getElementById('close-add-ebook').onclick = () => addModal.classList.replace('flex', 'hidden');
    document.getElementById('cancel-add-ebook').onclick = () => addModal.classList.replace('flex', 'hidden');

    document.getElementById('create-add-ebook').onclick = async () => {
      const title = document.getElementById('new-title').value.trim();
      const author = document.getElementById('new-author').value.trim();
      const sku = document.getElementById('new-sku').value.trim();
      const description = document.getElementById('new-desc').value.trim();
      const price_rm = Number(document.getElementById('new-price').value);
      const image_url = document.getElementById('new-image-url').value.trim();
      const category = document.getElementById('new-category').value;
      const badge = document.getElementById('new-badge').value.trim();
      const sort_order = Number(document.getElementById('new-sort').value) || 0;
      if (!title || !image_url || !Number.isFinite(price_rm)) {
        alert('Title, cover image URL, and a numeric price are required.');
        return;
      }
      const body = {
        title,
        author,
        sku: sku || null,
        description,
        price_rm,
        image_url,
        category,
        badge: badge || null,
        sort_order,
        is_published: true
      };
      const r = await fetch('/api/admin/bookstore/books', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        alert(j.error || 'Could not create book');
        return;
      }
      addModal.classList.replace('flex', 'hidden');
      await loadInventory();
      await loadStats();
    };

    const editModal = document.getElementById('edit-ebook-panel');
    document.getElementById('close-edit-ebook').onclick = () => editModal.classList.replace('flex', 'hidden');
    document.getElementById('cancel-edit-ebook').onclick = () => editModal.classList.replace('flex', 'hidden');

    document.getElementById('save-edit-ebook').onclick = async () => {
      if (!editingId) return;
      const title = document.getElementById('edit-title').value.trim();
      const author = document.getElementById('edit-author').value.trim();
      const sku = document.getElementById('edit-sku').value.trim();
      const description = document.getElementById('edit-desc').value.trim();
      const price_rm = Number(document.getElementById('edit-price').value);
      const image_url = document.getElementById('edit-image-url').value.trim();
      const category = document.getElementById('edit-category').value;
      const badge = document.getElementById('edit-badge').value.trim();
      const sort_order = Number(document.getElementById('edit-sort').value) || 0;
      if (!title || !image_url || !Number.isFinite(price_rm)) {
        alert('Title, cover image URL, and a numeric price are required.');
        return;
      }
      const r = await fetch(`/api/admin/bookstore/books/${encodeURIComponent(editingId)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
          sku: sku || null,
          description,
          price_rm,
          image_url,
          category,
          badge: badge || null,
          sort_order
        })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        alert(j.error || 'Could not save');
        return;
      }
      editModal.classList.replace('flex', 'hidden');
      await loadInventory();
      await loadStats();
    };

    document.getElementById('unpublish-btn').onclick = async () => {
      if (!editingId) return;
      const item = inventoryData.find((b) => b.id === editingId);
      const next = !(item && item.is_published);
      const r = await fetch(`/api/admin/bookstore/books/${encodeURIComponent(editingId)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: next })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        alert(j.error || 'Could not update status');
        return;
      }
      editModal.classList.replace('flex', 'hidden');
      await loadInventory();
      await loadStats();
    };

    void loadStats();
    void loadInventory();
  });
})();
