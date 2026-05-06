/**
 * Requires npm run start (http://localhost), not file://.
 */
(function curatorGuardInstructorPortal() {
    try {
        if (typeof window === 'undefined' || window.location.protocol === 'file:') return;
        const path = String(window.location.pathname || '').replace(/\\/g, '/');
        if (!path.includes('/instructor/instructor/')) return;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/auth/session', false);
        xhr.withCredentials = true;
        xhr.send(null);
        if (xhr.status !== 200) {
            window.location.replace('/landing/landing/login.html');
            return;
        }
        let parsed = {};
        try {
            parsed = JSON.parse(xhr.responseText || '{}');
        } catch (_) {
            window.location.replace('/landing/landing/login.html');
            return;
        }
        const role = parsed.profile && parsed.profile.role;
        if (role === 'student') {
            window.location.replace('/student/student/dashboard/student_dashboard_new.html');
            return;
        }
        if (role === 'admin') {
            window.location.replace('/admin/admin/Dashboard/admin_dashboard.html');
            return;
        }
    } catch (_) {
        /* benign */
    }
}());

/**
 * Instructor Navigation Module
 * Top bar + collapsible sidebar + main shell spacing aligned with Student / Admin portals.
 */
const instructorNav = {
    init() {
        this.render();
        this.bindEvents();
        this.applyShellSpacing();
        this.setActiveLink();
        this.hydrateSessionUi();
    },

    hydrateSessionUi() {
        if (typeof window === 'undefined' || window.location.protocol === 'file:') return;
        fetch('/api/auth/session', { credentials: 'same-origin' })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data || !data.profile) return;
                const p = data.profile;
                const nameBit = `${p.first_name || ''} ${p.last_name || ''}`.trim()
                    || (data.user && data.user.email)
                    || 'Instructor';
                const navBar = document.getElementById('curator-instructor-chip');
                if (navBar) {
                    const ps = navBar.querySelectorAll('p');
                    if (ps[0]) ps[0].textContent = nameBit;
                    const subtext = p.instructor_title || p.faculty || '';
                    if (ps[1] && subtext) ps[1].textContent = subtext;
                }
                const imgEl = document.querySelector('nav a[href*="instructor_profile.html"] img');
                if (imgEl) {
                    imgEl.src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(nameBit)}&background=6a1cf6&color=fff`;
                }
            })
            .catch(() => {});
    },

    getPathInfo() {
        const pathSegments = window.location.pathname.split('/');
        const instructorIndex = pathSegments.lastIndexOf('instructor');
        if (instructorIndex === -1) {
            return { base: '', root: '../' };
        }
        const depth = Math.max(pathSegments.length - instructorIndex - 2, 0);
        return {
            base: '../'.repeat(depth),
            root: '../'.repeat(depth + 1)
        };
    },

    render() {
        const mountPoint = document.getElementById('nav-mount');
        if (!mountPoint) return;

        const { base } = this.getPathInfo();
        const hideSidebar = mountPoint.getAttribute('data-hide-sidebar') === 'true';

        let html = `
            <div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] hidden opacity-0 transition-opacity duration-300"></div>

            <nav class="w-full h-16 lg:h-20 flex items-center justify-between pr-4 lg:pr-5 fixed top-0 left-0 z-[80] bg-white border-b border-slate-100 transition-all duration-400">
                <div class="flex items-center gap-2.5 pl-4">
                    <!-- Mobile Menu Toggle -->
                    <button id="sidebar-toggle-btn" class="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-violet-50 hover:text-primary rounded-xl transition-all" aria-label="Toggle navigation menu">
                        <span class="material-symbols-outlined">menu</span>
                    </button>

                    <a href="${base}../../landing/landing/index.html" class="flex items-center gap-2.5 hover:opacity-90 transition-opacity" aria-label="Go to landing home">
                        <div class="flex items-center justify-center flex-shrink-0 w-8 md:w-10">
                            <div class="app-logo-icon !w-8 !h-8 md:!w-10 md:!h-10"></div>
                        </div>
                        <div class="hidden sm:block">
                            <h1 class="app-logo-text text-xl md:text-2xl !text-violet-600">CuratorEdu</h1>
                            <p class="text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] leading-none">Instructor Portal</p>
                        </div>
                    </a>
                </div>

                <div class="flex items-center gap-2 md:gap-4">
                    <button class="p-2 text-slate-500 hover:bg-violet-50 hover:text-primary rounded-full transition-all duration-200 relative" onclick="if(window.toggleCart) window.toggleCart();" aria-label="Open cart" type="button">
                        <span class="material-symbols-outlined">shopping_cart</span>
                        <span class="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white transition-transform duration-300 cart-badge">0</span>
                    </button>
                    <div id="curator-instructor-chip" class="hidden md:flex items-center gap-2 text-right">
                        <div>
                            <p class="text-sm font-bold text-slate-800 leading-none">Mr. UTS</p>
                            <p class="text-[10px] text-slate-400 mt-0.5">Faculty of Computing</p>
                        </div>
                    </div>
                    <button id="instructor-notifications-btn" class="p-2 text-slate-500 hover:bg-violet-50 hover:text-primary rounded-full transition-all duration-200 relative" aria-label="Open notifications" type="button">
                        <span class="material-symbols-outlined">notifications</span>
                        <span data-notif-badge="1" class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <a href="${base}Dashboard/main page/instructor_profile.html" class="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-100 overflow-hidden border-2 border-violet-100 hover:border-violet-500 transition-colors">
                        <img class="h-full w-full object-cover" src="https://ui-avatars.com/api/?name=Mr+UTS&background=6a1cf6&color=fff" alt="Mr. UTS Profile" />
                    </a>
                </div>
            </nav>
        `;

        if (!hideSidebar) {
            html += `
            <aside id="instructor-sidebar" class="fixed top-16 lg:top-20 left-0 bottom-0 w-72 bg-white z-[70] shadow-2xl transition-all duration-300 border-r border-slate-100 flex flex-col sidebar-mini">
                <nav class="flex-1 overflow-y-auto custom-scrollbar space-y-1 pt-4">
                    <a href="${base}Dashboard/main page/instructor_dashboard.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">dashboard</span>
                        </div>
                        <span class="nav-label">Dashboard</span>
                    </a>
                    <a href="${base}Dashboard/main page/instructor_my_courses.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">auto_stories</span>
                        </div>
                        <span class="nav-label">My Courses</span>
                    </a>
                    <a href="${base}community/instructor_forum_moderation_courses.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">forum</span>
                        </div>
                        <span class="nav-label">Forum Moderation</span>
                    </a>
                    <a href="${base}Dashboard/main page/bookstore.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">menu_book</span>
                        </div>
                        <span class="nav-label">Bookstore</span>
                    </a>
                    <a href="${base}Dashboard/main page/instructor_myebook.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">book_2</span>
                        </div>
                        <span class="nav-label">My eBooks</span>
                    </a>
                    <a href="${base}Dashboard/main page/help.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">help</span>
                        </div>
                        <span class="nav-label">Help & Support</span>
                    </a>
                </nav>
                <div id="instructor-sidebar-footer" class="px-0 pb-4 pt-2 border-t border-slate-100 sidebar-footer-text">
                    <a href="/api/auth/logout" class="nav-item text-red-500 hover:bg-red-50 font-bold">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined" style="color: inherit;">logout</span>
                        </div>
                        <span class="nav-label">Sign Out</span>
                    </a>
                </div>
            </aside>
            `;
        }

        html += `
            <!-- Slide-in Cart Panel -->
            <div id="cart-slider" class="fixed inset-0 z-[100] pointer-events-none overflow-hidden font-body">
                <div id="cart-overlay" class="absolute inset-0 bg-on-surface/40 backdrop-blur-sm opacity-0 transition-opacity duration-500" onclick="if(window.toggleCart) window.toggleCart(true)"></div>
                <aside id="cart-aside" class="absolute top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-3xl shadow-2xl transform translate-x-full transition-transform duration-500 flex flex-col border-l border-slate-100 pointer-events-auto">
                    <div class="p-8 flex justify-between items-center border-b border-slate-100">
                        <h2 class="text-3xl font-black font-headline tracking-tight text-slate-900">Your Cart</h2>
                        <button class="material-symbols-outlined text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full p-2 transition-colors" onclick="if(window.toggleCart) window.toggleCart(true)" aria-label="Close cart">close</button>
                    </div>
                    
                    <div id="cart-items-container" class="flex-grow overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
                        <!-- Cart Items will be injected here -->
                        <div id="cart-empty-state" class="h-full flex flex-col items-center justify-center text-center opacity-50 py-20">
                            <span class="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                            <p class="font-bold">Your cart is empty</p>
                        </div>
                    </div>
                    
                    <div class="p-8 bg-slate-50 border-t border-slate-100 mt-auto">
                        <div class="flex justify-between items-end mb-6">
                            <span class="text-slate-500 font-bold uppercase tracking-wider text-xs">Estimated Total</span>
                            <span id="cart-estimated-total" class="text-3xl font-black font-headline text-slate-900 leading-none">RM 0.00</span>
                        </div>
                        <a href="${base}bookstore/cart_secure_checkout.html" id="instructor-cart-checkout-link" class="w-full bg-[#6a1cf6] text-white py-4 rounded-xl font-headline font-black text-lg shadow-lg shadow-[#6a1cf6]/25 hover:bg-[#5d00e3] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3">
                            Secure Checkout
                            <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">lock</span>
                        </a>
                        <div class="flex items-center justify-center gap-2 mt-4 text-slate-400">
                            <span class="material-symbols-outlined text-sm">verified</span>
                            <p class="text-[10px] font-bold uppercase tracking-widest">Powered by CuratorPay</p>
                        </div>
                    </div>
                </aside>
            </div>
        `;

        mountPoint.innerHTML = html;

        const contextualSource = document.getElementById('nav-contextual-content');
        const contextualDest = document.getElementById('contextual-nav-container');
        if (contextualSource && contextualDest) {
            contextualDest.innerHTML = contextualSource.innerHTML;
        }

        const contextualFooterSource = document.getElementById('nav-contextual-footer');
        const contextualFooterDest = document.getElementById('contextual-footer-container');
        if (contextualFooterSource && contextualFooterDest) {
            contextualFooterDest.innerHTML = contextualFooterSource.innerHTML;
        }
    },

    bindEvents() {
        window.toggleCart = (forceClose = false) => {
            const cartSlider = document.getElementById('cart-slider');
            const cartAside = document.getElementById('cart-aside');
            const cartOverlay = document.getElementById('cart-overlay');
            if (!cartSlider || !cartAside || !cartOverlay) return;

            const isHidden = cartSlider.classList.contains('pointer-events-none');

            if (isHidden && !forceClose) {
                cartSlider.classList.remove('pointer-events-none');
                cartAside.classList.remove('translate-x-full');
                cartAside.classList.add('translate-x-0');
                cartOverlay.classList.remove('opacity-0');
                cartOverlay.classList.add('opacity-100');
                cartOverlay.classList.add('pointer-events-auto');
            } else {
                cartAside.classList.remove('translate-x-0');
                cartAside.classList.add('translate-x-full');
                cartOverlay.classList.remove('opacity-100');
                cartOverlay.classList.add('opacity-0');
                cartOverlay.classList.remove('pointer-events-auto');
                setTimeout(() => {
                    cartSlider.classList.add('pointer-events-none');
                }, 500);
            }
        };

        const cartContainer = document.getElementById('cart-items-container');
        const cartTotalEl = document.getElementById('cart-estimated-total');
        const cartEmptyState = document.getElementById('cart-empty-state');
        const cartBadge = document.querySelector('.cart-badge');

        const parsePrice = (value) => {
            const numeric = Number.parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return Number.isFinite(numeric) ? numeric : 0;
        };

        const formatCurrency = (value) => `RM ${value.toFixed(2)}`;

        const refreshCartTotals = () => {
            if (!cartContainer) return;

            const cartItems = cartContainer.querySelectorAll('[data-cart-item="true"]');
            let totalAmount = 0;
            let totalCount = 0;

            cartItems.forEach((item) => {
                const unitPrice = parsePrice(item.dataset.unitPrice || '0');
                const qty = Number.parseInt(item.dataset.qty || '1', 10) || 1;
                totalAmount += unitPrice * qty;
                totalCount += qty;
            });

            if (cartTotalEl) {
                cartTotalEl.textContent = formatCurrency(totalAmount);
            }
            if (cartBadge) {
                cartBadge.textContent = String(totalCount);
            }
            if (cartEmptyState) {
                cartEmptyState.classList.toggle('hidden', cartItems.length > 0);
            }
        };

        const updateItemUI = (item) => {
            const qty = Number.parseInt(item.dataset.qty || '1', 10) || 1;
            const unitPrice = parsePrice(item.dataset.unitPrice || '0');
            const qtyEl = item.querySelector('[data-role="qty"]');
            const totalEl = item.querySelector('[data-role="line-total"]');
            if (qtyEl) qtyEl.textContent = String(qty).padStart(2, '0');
            if (totalEl) totalEl.textContent = formatCurrency(unitPrice * qty);
        };

        window.curatorCollectCartPayload = () => {
            const cartContainer = document.getElementById('cart-items-container');
            if (!cartContainer) return [];
            const out = [];
            cartContainer.querySelectorAll('[data-cart-item="true"]').forEach((el) => {
                const bookId = el.getAttribute('data-book-id') || '';
                if (!bookId) return;
                const qty = Number.parseInt(el.dataset.qty || '1', 10) || 1;
                out.push({ bookId, qty });
            });
            return out;
        };

        window.curatorSaveCartForCheckout = (event) => {
            const payload = window.curatorCollectCartPayload?.() || [];
            if (!payload.length) {
                if (event) event.preventDefault();
                return false;
            }
            sessionStorage.setItem('curator_checkout_cart', JSON.stringify(payload));
            return true;
        };

        window.addToCart = (event, bookId, title, price, img) => {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            if (cartContainer && title) {
                const safeTitle = String(title).trim();
                const bid = String(bookId || '').trim();
                const existingItem = bid
                    ? cartContainer.querySelector(`[data-book-id="${bid}"]`)
                    : cartContainer.querySelector(`[data-title="${encodeURIComponent(safeTitle)}"]`);
                if (existingItem) {
                    const currentQty = Number.parseInt(existingItem.dataset.qty || '1', 10) || 1;
                    existingItem.dataset.qty = String(currentQty + 1);
                    updateItemUI(existingItem);
                    refreshCartTotals();
                } else {
                    const unitPrice = parsePrice(price);
                    const itemHtml = `
                    <div class="group relative flex gap-6 p-4 rounded-2xl bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all border border-slate-100" data-cart-item="true" data-book-id="${bid}" data-title="${encodeURIComponent(safeTitle)}" data-unit-price="${unitPrice}" data-qty="1">
                        <div class="w-24 h-32 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
                            <img alt="${safeTitle}" class="w-full h-full object-cover" src="${img}"/>
                        </div>
                        <div class="flex flex-col justify-between py-1 flex-grow">
                            <div>
                                <div class="flex justify-between items-start gap-2">
                                    <h3 class="font-bold text-lg leading-tight text-slate-900 font-headline">${safeTitle}</h3>
                                    <button type="button" data-cart-action="remove" class="material-symbols-outlined text-slate-400 hover:text-red-500 hover:scale-110 transition-all">delete</button>
                                </div>
                                <p class="text-xs text-slate-500 font-medium mt-1">Digital + Physical Bundle</p>
                            </div>
                            <div class="flex justify-between items-center mt-4">
                                <div class="flex items-center bg-slate-100 rounded-full px-3 py-1 gap-3">
                                    <button type="button" data-cart-action="decrease" class="text-[#6a1cf6] font-black hover:scale-125 transition-transform">−</button>
                                    <span data-role="qty" class="font-bold text-sm">01</span>
                                    <button type="button" data-cart-action="increase" class="text-[#6a1cf6] font-black hover:scale-125 transition-transform">+</button>
                                </div>
                                <span data-role="line-total" class="text-xl font-black font-headline text-slate-900">${formatCurrency(unitPrice)}</span>
                            </div>
                        </div>
                    </div>
                `;
                    cartContainer.insertAdjacentHTML('afterbegin', itemHtml);
                    refreshCartTotals();
                }
            }

            if (cartBadge) {
                cartBadge.classList.add('scale-150');
                setTimeout(() => cartBadge.classList.remove('scale-150'), 300);
            }

            if (event) {
                const btn = event.currentTarget;
                const rect = btn.getBoundingClientRect();
                const flyingObj = document.createElement('div');

                if (img) {
                    flyingObj.className = 'fixed z-[200] w-12 h-16 rounded shadow-2xl bg-cover bg-center';
                    flyingObj.style.backgroundImage = `url(${img})`;
                } else {
                    flyingObj.className = 'fixed z-[200] w-6 h-6 bg-[#6a1cf6] rounded-full shadow-lg';
                }

                flyingObj.style.left = `${rect.left}px`;
                flyingObj.style.top = `${rect.top}px`;
                flyingObj.style.transition = 'all 0.6s cubic-bezier(0.2, 1, 0.3, 1)';
                flyingObj.style.pointerEvents = 'none';
                document.body.appendChild(flyingObj);

                setTimeout(() => {
                    flyingObj.style.left = 'calc(100vw - 80px)';
                    flyingObj.style.top = '24px';
                    flyingObj.style.transform = 'scale(0.1) rotate(15deg)';
                    flyingObj.style.opacity = '0';
                }, 50);

                setTimeout(() => {
                    flyingObj.remove();
                }, 600);
            }
        };

        document.getElementById('instructor-cart-checkout-link')?.addEventListener('click', (ev) => {
            window.curatorSaveCartForCheckout?.(ev);
        });

        // Cart line-item +/- / remove: handled in instructor-interactions.js (syncs cartStore + drawer).

        refreshCartTotals();

        const overlay = document.getElementById('sidebar-overlay');
        const sidebar = document.getElementById('instructor-sidebar');
        const mountPoint = document.getElementById('nav-mount');
        const hideSidebar = mountPoint?.getAttribute('data-hide-sidebar') === 'true';
        const mainContent = document.querySelector('main');

        if (hideSidebar && mainContent) {
            mainContent.style.marginLeft = 'auto';
            mainContent.style.marginRight = 'auto';
            document.body.style.paddingLeft = '0';
            this.applyShellSpacing();
            return;
        }

        if (!sidebar) {
            document.body.style.paddingLeft = '0';
            this.applyShellSpacing();
            return;
        }

        const toggleSidebar = (forceClose = false) => {
            if (window.innerWidth < 1024) {
                const isOpened = sidebar.classList.contains('translate-x-0');
                if (isOpened || forceClose) {
                    sidebar.classList.remove('translate-x-0');
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                    overlay.classList.remove('opacity-100');
                } else {
                    sidebar.classList.remove('-translate-x-full');
                    sidebar.classList.add('translate-x-0');
                    overlay.classList.remove('hidden');
                    setTimeout(() => overlay.classList.add('opacity-100'), 10);
                }
            } else {
                const isMini = sidebar.classList.contains('sidebar-mini');
                if (isMini && !forceClose) {
                    sidebar.classList.remove('sidebar-mini');
                    sidebar.classList.add('sidebar-expanded');
                    document.body.style.paddingLeft = '288px';
                    if (mainContent) mainContent.style.marginLeft = 'auto';
                } else {
                    sidebar.classList.add('sidebar-mini');
                    sidebar.classList.remove('sidebar-expanded');
                    document.body.style.paddingLeft = '80px';
                    if (mainContent) mainContent.style.marginLeft = 'auto';
                }
            }
            this.applyShellSpacing();
        };

        overlay?.addEventListener('click', () => toggleSidebar(true));

        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        toggleBtn?.addEventListener('click', () => toggleSidebar());

        if (window.innerWidth >= 1024) {
            sidebar.classList.add('sidebar-mini');
            sidebar.classList.remove('-translate-x-full');
            document.body.style.paddingLeft = '80px';
            if (mainContent) mainContent.style.marginLeft = 'auto';
        } else {
            sidebar.classList.add('-translate-x-full');
            document.body.style.paddingLeft = '0';
            if (mainContent) mainContent.style.marginLeft = 'auto';
        }

        // IMPORTANT: CSS expands sidebar on hover (`#instructor-sidebar:hover { width: 288px }`)
        // but JS keeps main content offset at 80px unless sidebar is explicitly toggled.
        // Sync body padding with hover to prevent the main content from covering nav rows.
        if (window.innerWidth >= 1024) {
            sidebar.addEventListener('mouseenter', () => {
                // Only auto-expand when it's currently in mini mode (not already sidebar-expanded).
                if (sidebar.classList.contains('sidebar-mini')) {
                    document.body.style.paddingLeft = '288px';
                    if (mainContent) mainContent.style.marginLeft = 'auto';
                }
            });
            sidebar.addEventListener('mouseleave', () => {
                if (sidebar.classList.contains('sidebar-mini')) {
                    document.body.style.paddingLeft = '80px';
                    if (mainContent) mainContent.style.marginLeft = 'auto';
                }
            });
        }

        window.addEventListener('resize', () => {
            this.applyShellSpacing();
        });
    },

    applyShellSpacing() {
        const mainContent = document.querySelector('main');
        if (!mainContent) return;

        if (window.innerWidth >= 1280) {
            mainContent.style.paddingTop = '112px';
            mainContent.style.paddingRight = '40px';
            mainContent.style.paddingBottom = '32px';
            mainContent.style.paddingLeft = '40px';
        } else if (window.innerWidth >= 1024) {
            mainContent.style.paddingTop = '104px';
            mainContent.style.paddingRight = '32px';
            mainContent.style.paddingBottom = '24px';
            mainContent.style.paddingLeft = '32px';
        } else {
            // Mobile compact view
            mainContent.style.paddingTop = '80px';
            mainContent.style.paddingRight = '16px';
            mainContent.style.paddingBottom = '20px';
            mainContent.style.paddingLeft = '16px';
        }
    },

    setActiveLink() {
        // Some browsers can include query/hash in "pathname" for file:// URLs.
        // Normalize it so "?course=..." never affects active-link matching.
        let currentPath = window.location.pathname || '';
        if (currentPath.includes('?')) currentPath = currentPath.split('?')[0];
        if (currentPath.includes('#')) currentPath = currentPath.split('#')[0];
        const navItems = document.querySelectorAll('.nav-item');

        // Clear any previous active styles first (prevents double-matching).
        navItems.forEach((item) => {
            item.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/20');
            item.classList.add('text-slate-600');
        });

        navItems.forEach((item) => {
            const href = item.getAttribute('href');
            const cleanHref = href ? href.replace(/\.\.\//g, '') : '';
            if (href && currentPath.includes(cleanHref) && href !== '#' && href !== '') {
                item.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/20');
                item.classList.remove('text-slate-600', 'hover:bg-violet-50', 'hover:text-primary');

                const icon = item.querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 1, 'wght' 700";
            }
        });
    }
};

/** Sign out links use href="/api/auth/logout"; ensure cookie clear + navigation to landing (302 alone can fail on some setups). */
(function wireCuratorPortalLogoutNavigationOnce() {
    if (typeof window === 'undefined' || window.__curatorPortalLogoutNavWired) return;
    window.__curatorPortalLogoutNavWired = true;
    /** Resolved while this script runs; `document.currentScript` is null during later clicks. */
    let fileLandingHref = '';
    if (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) {
        try {
            const scriptDir = new URL('.', new URL(document.currentScript.src));
            fileLandingHref = new URL('../../../../landing/landing/index.html', scriptDir).href;
        } catch (_) {}
    }
    function curatorPortalLandingAfterLogoutHref() {
        if (window.location.protocol !== 'file:') {
            return new URL('/landing/landing/index.html', window.location.origin).href;
        }
        if (fileLandingHref) return fileLandingHref;
        try {
            return new URL('../../../../landing/landing/index.html', window.location.href).href;
        } catch (_) {
            return '';
        }
    }
    document.addEventListener(
        'click',
        (event) => {
            const t = event.target;
            if (!(t instanceof Element)) return;
            const link = t.closest('a[href="/api/auth/logout"]');
            if (!link) return;
            event.preventDefault();
            event.stopPropagation();
            const nextUrl = curatorPortalLandingAfterLogoutHref();
            const doNavigate = () => window.location.assign(nextUrl);
            if (window.location.protocol === 'file:') {
                doNavigate();
                return;
            }
            fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
                .catch(() => {})
                .finally(doNavigate);
        },
        true
    );
})();

document.addEventListener('DOMContentLoaded', () => instructorNav.init());
