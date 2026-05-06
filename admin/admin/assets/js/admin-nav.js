/**
 * Requires npm run start (http://localhost), not file://.
 */
(function curatorGuardAdminPortal() {
    try {
        if (typeof window === 'undefined' || window.location.protocol === 'file:') return;
        const path = String(window.location.pathname || '').replace(/\\/g, '/');
        if (!path.includes('/admin/admin/')) return;
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
        if (role === 'instructor') {
            window.location.replace('/instructor/instructor/Dashboard/main%20page/instructor_dashboard.html');
            return;
        }
        if (role !== 'admin') {
            window.location.replace('/landing/landing/login.html');
            return;
        }
    } catch (_) {
        /* benign */
    }
}());

/**
 * Admin Navigation Module
 * Standardizes the Top Navbar and Sidebar Drawer across all admin pages.
 */

const adminNav = {
    init() {
        this.render();
        this.bindEvents();
        this.applyShellSpacing();
        this.setActiveLink();
        this.hydrateSessionUi();
    },

    /**
     * Shell row: first flex+min-h-screen sibling after #nav-mount (Dashboard pages), or body for course editor.
     */
    findLayoutRoot() {
        const mount = document.getElementById('nav-mount');
        if (!mount) return null;
        let n = mount.nextElementSibling;
        while (n && n.tagName === 'SCRIPT') {
            n = n.nextElementSibling;
        }
        if (n && n.classList?.contains('flex') && n.classList.contains('min-h-screen')) {
            return n;
        }
        if (document.documentElement.hasAttribute('data-admin-course-editor')) {
            return document.body;
        }
        return null;
    },

    /** Match Tailwind lg (1024px) / xl rhythm with h-16 lg:h-20 top bar. */
    applyShellSpacing() {
        const layoutRoot = this.findLayoutRoot();
        const mainContent = document.querySelector('main');
        const sidebar = document.getElementById('admin-sidebar');

        const topPad =
            window.innerWidth >= 1280 ? '112px' : window.innerWidth >= 1024 ? '104px' : '80px';

        if (layoutRoot) {
            layoutRoot.style.paddingTop = topPad;
        }

        if (sidebar && mainContent) {
            if (window.innerWidth >= 1024) {
                mainContent.style.marginLeft = sidebar.classList.contains('sidebar-expanded')
                    ? '288px'
                    : '80px';
            } else {
                mainContent.style.marginLeft = '0';
            }
        }
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
                    || 'Admin';
                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameBit)}&background=6a1cf6&color=fff`;
                document.querySelectorAll('nav a[href*="admin_profile.html"] img, #admin-avatar').forEach((img) => {
                    img.src = avatarUrl;
                });
            })
            .catch(() => {});
    },

    render() {
        const mountPoint = document.getElementById('nav-mount');
        if (!mountPoint) return;

        // Determine base path for links (handles nested directories)
        const isDashboard = window.location.pathname.includes('/Dashboard/');
        const isSubdir = window.location.pathname.includes('/bookstore/') ||
                         window.location.pathname.includes('/community/') ||
                         window.location.pathname.includes('/vibe_academy/');

        // Compute correct "root to Web-Tech/" even when opened via file://
        // Path is typically .../Web-Tech/admin/admin/<section>/<page>.html
        const segments = window.location.pathname.split('/').filter(Boolean);
        const adminIndex = segments.lastIndexOf('admin'); // the inner ".../admin/admin/..."
        const depth = adminIndex === -1 ? 0 : Math.max(segments.length - adminIndex - 2, 0); // folders after inner admin
        const root = '../'.repeat(depth + 2); // from inner admin -> Web-Tech (../..), plus depth

        const base = isSubdir ? '../Dashboard/' : '';
        const up = (isDashboard || isSubdir) ? '../' : '';
        const communityForumHref = isDashboard || isSubdir
            ? '../community/community_forum.html'
            : 'community/community_forum.html';

        const html = `
            <!-- Sidebar Drawer Overlay -->
            <div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] hidden opacity-0 transition-opacity duration-300"></div>

            <!-- Top Navigation Bar -->
            <nav class="w-full h-16 lg:h-20 flex items-center justify-between pr-4 lg:pr-5 fixed top-0 left-0 z-[80] bg-white border-b border-slate-100 transition-all duration-400">
                <div class="flex items-center">
                    <button id="mobile-menu-btn" class="lg:hidden ml-2 sm:ml-4 p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Toggle Menu">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <a href="${root}landing/landing/index.html" class="flex items-center gap-2 lg:gap-3.5 hover:opacity-90 transition-opacity" aria-label="Go to landing home">
                        <div class="flex items-center justify-center flex-shrink-0 w-12 lg:w-16 ml-1 lg:ml-2">
                            <div class="app-logo-icon !w-8 !h-8 lg:!w-10 lg:!h-10"></div>
                        </div>
                        <div>
                            <h1 class="app-logo-text text-xl lg:text-2xl !text-violet-600">CuratorEdu</h1>
                            <p class="hidden sm:block text-[10px] text-slate-600 font-bold uppercase tracking-[0.15em] leading-none">Admin Portal</p>
                        </div>
                    </a>
                </div>

                <div class="flex items-center gap-4">
                    <button id="admin-notification-btn" aria-label="Open notifications" class="p-2 text-slate-500 hover:bg-violet-50 hover:text-primary rounded-full transition-all duration-200 relative">
                        <span class="material-symbols-outlined">notifications</span>
                        <span id="admin-notification-dot" class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div id="admin-notification-panel" class="hidden fixed z-[90] right-3 top-16 w-[min(20rem,calc(100vw-1.5rem))] max-h-[min(24rem,calc(100dvh-5rem))] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 lg:right-6 lg:top-20 lg:w-80">
                        <div class="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                            <h3 class="text-sm font-extrabold text-slate-800">Notifications</h3>
                            <button id="admin-mark-read" class="text-[11px] font-bold text-violet-600 hover:text-violet-700">Mark all as read</button>
                        </div>
                        <ul id="admin-notification-list" class="py-2 space-y-1 max-h-72 overflow-y-auto"></ul>
                    </div>
                    <a href="${base}admin_profile.html" class="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border-2 border-violet-100 hover:border-violet-500 transition-colors">
                        <img class="h-full w-full object-cover" src="https://ui-avatars.com/api/?name=Admin&background=6a1cf6&color=fff" alt="Admin Profile" />
                    </a>
                </div>
            </nav>

            <!-- Sidebar Drawer -->
            <aside id="admin-sidebar" class="fixed top-16 lg:top-20 left-0 bottom-0 w-72 bg-white z-[70] shadow-2xl transition-all duration-300 border-r border-slate-100 flex flex-col sidebar-mini">
                <nav class="flex-1 overflow-y-auto custom-scrollbar space-y-1 pt-4 px-0">
                    <a href="${base}admin_dashboard.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">analytics</span>
                        </div>
                        <span class="nav-label">Global Insights</span>
                    </a>
                    <a href="${base}admin_user_registry.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">group</span>
                        </div>
                        <span class="nav-label">User Registry</span>
                    </a>
                    <a href="${base}admin_course_catalog.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">inventory_2</span>
                        </div>
                        <span class="nav-label">Course Hub</span>
                    </a>
                    <a href="${base}admin_reports.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">monitoring</span>
                        </div>
                        <span class="nav-label">Reports & Analytics</span>
                    </a>
                    <a href="${base}admin_library_inventory.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">library_books</span>
                        </div>
                        <span class="nav-label">Library</span>
                    </a>
                    <a href="${base}admin_forum_moderation.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">gavel</span>
                        </div>
                        <span class="nav-label">Moderation</span>
                    </a>
                    <a href="${base}admin_profile.html" class="nav-item group">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined">settings</span>
                        </div>
                        <span class="nav-label">Settings</span>
                    </a>
                </nav>

                <div class="p-4 pt-0 border-t border-slate-100 sidebar-footer-text">
                    <a href="/api/auth/logout" class="nav-item text-red-500 hover:bg-red-50 font-bold">
                        <div class="nav-icon-wrapper">
                            <span class="material-symbols-outlined" style="color: inherit;">logout</span>
                        </div>
                        <span class="nav-label">Sign Out</span>
                    </a>
                </div>
            </aside>
        `;

        mountPoint.innerHTML = html;
    },

    bindEvents() {
        const overlay = document.getElementById('sidebar-overlay');
        const sidebar = document.getElementById('admin-sidebar');
        const mainContent = document.querySelector('main');
        const notificationBtn = document.getElementById('admin-notification-btn');
        const notificationPanel = document.getElementById('admin-notification-panel');
        const markReadBtn = document.getElementById('admin-mark-read');
        const notificationList = document.getElementById('admin-notification-list');
        const notificationDot = document.getElementById('admin-notification-dot');
        const desktopSidebarMiniWidth = '80px';
        const desktopSidebarExpandedWidth = '288px';

        const notifications = [
            '3 new reports need moderation review.',
            'A new user requested elevated permissions.',
            'Community performance summary is ready.'
        ];

        let unreadCount = notifications.length;

        const renderNotifications = () => {
            if (!notificationList) return;

            notificationList.innerHTML = notifications.map((item, index) => {
                const unread = index < unreadCount;
                return `<li class="px-2 py-2 rounded-xl ${unread ? 'bg-violet-50' : 'bg-white'}">
                            <p class="text-xs ${unread ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}">${item}</p>
                        </li>`;
            }).join('');

            if (notificationDot) {
                notificationDot.classList.toggle('hidden', unreadCount === 0);
            }
        };

        const closeNotifications = () => {
            notificationPanel?.classList.add('hidden');
        };

        const syncDesktopMainOffset = (useExpandedWidth = false) => {
            if (!mainContent || window.innerWidth < 1024) return;
            mainContent.style.marginLeft = useExpandedWidth
                ? desktopSidebarExpandedWidth
                : desktopSidebarMiniWidth;
        };

        renderNotifications();

        const toggleSidebar = (forceClose = false) => {
            if (!sidebar || !overlay) return;
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
                    syncDesktopMainOffset(true);
                } else {
                    sidebar.classList.add('sidebar-mini');
                    sidebar.classList.remove('sidebar-expanded');
                    syncDesktopMainOffset(false);
                }
            }
            adminNav.applyShellSpacing();
        };

        sidebar?.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 1024) {
                syncDesktopMainOffset(true);
            }
        });

        sidebar?.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 1024 && !sidebar.classList.contains('sidebar-expanded')) {
                syncDesktopMainOffset(false);
            }
        });

        overlay?.addEventListener('click', () => toggleSidebar(true));

        notificationBtn?.addEventListener('click', (event) => {
            event.stopPropagation();
            notificationPanel?.classList.toggle('hidden');
        });

        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        mobileMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });

        markReadBtn?.addEventListener('click', () => {
            unreadCount = 0;
            renderNotifications();
        });

        document.addEventListener('click', (event) => {
            if (!notificationPanel || notificationPanel.classList.contains('hidden')) return;
            const target = event.target;
            if (!(target instanceof Element)) return;

            if (!notificationPanel.contains(target) && !notificationBtn?.contains(target)) {
                closeNotifications();
            }
        });

        // Initial layout
        if (window.innerWidth >= 1024) {
            sidebar?.classList.add('sidebar-mini');
            sidebar?.classList.remove('-translate-x-full');
            syncDesktopMainOffset(false);
        } else {
            sidebar?.classList.add('-translate-x-full');
            if (mainContent) mainContent.style.marginLeft = '0';
            closeNotifications();
        }

        window.addEventListener('resize', () => {
            adminNav.applyShellSpacing();
            if (!sidebar) return;
            if (window.innerWidth >= 1024) {
                syncDesktopMainOffset(sidebar.classList.contains('sidebar-expanded'));
            } else if (mainContent) {
                mainContent.style.marginLeft = '0';
            }
        });
    },

    setActiveLink() {
        let currentPath = window.location.pathname || '';
        if (currentPath.includes('?')) currentPath = currentPath.split('?')[0];
        if (currentPath.includes('#')) currentPath = currentPath.split('#')[0];
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href.replace('../', '')) && href !== '#' && href !== '') {
                item.classList.add('nav-item-active');
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

document.addEventListener('DOMContentLoaded', () => adminNav.init());
