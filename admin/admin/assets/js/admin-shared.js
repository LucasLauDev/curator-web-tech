(function () {
    var shellInjected = false;

    function setBodyScrollLock(locked) {
        document.body.classList.toggle("admin-ui-lock-scroll", locked);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initDrawer(config) {
        var options = config || {};
        var openBtnId = options.openBtnId || "openDrawerBtn";
        var closeBtnId = options.closeBtnId || "closeDrawerBtn";
        var drawerId = options.drawerId || "leftDrawer";
        var backdropId = options.backdropId || "drawerBackdrop";

        var openDrawerBtn = document.getElementById(openBtnId);
        var closeDrawerBtn = document.getElementById(closeBtnId);
        var leftDrawer = document.getElementById(drawerId);
        var drawerBackdrop = document.getElementById(backdropId);

        if (!leftDrawer || !drawerBackdrop) {
            return { open: function () {}, close: function () {} };
        }

        function openDrawer() {
            leftDrawer.classList.add("open");
            drawerBackdrop.classList.add("open");
            setBodyScrollLock(true);
        }

        function closeDrawer() {
            leftDrawer.classList.remove("open");
            drawerBackdrop.classList.remove("open");
            setBodyScrollLock(false);
        }

        if (openDrawerBtn) {
            openDrawerBtn.addEventListener("click", openDrawer);
        }

        if (closeDrawerBtn) {
            closeDrawerBtn.addEventListener("click", closeDrawer);
        }

        drawerBackdrop.addEventListener("click", closeDrawer);

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && leftDrawer.classList.contains("open")) {
                closeDrawer();
            }
        });

        return { open: openDrawer, close: closeDrawer };
    }

    function initShell(config) {
        var options = config || {};
        var active = options.active || "dashboard";
        var sectionLabel = options.sectionLabel || "ADMIN";
        var shellSelector = options.shellSelector || "[data-admin-shell]";

        var shellHost = document.querySelector(shellSelector);
        if (!shellHost || shellInjected) {
            return;
        }

        shellInjected = true;

        var navItems = [
            { id: "dashboard", label: "Overview", href: "admin_dashboard.html", icon: "dashboard" },
            { id: "users", label: "Users", href: "admin_user_registry.html", icon: "group" },
            { id: "courses", label: "Courses", href: "admin_course_catalog.html", icon: "auto_stories" },
            { id: "library", label: "Library", href: "admin_library_inventory.html", icon: "menu_book" },
            { id: "forum", label: "Forum", href: "admin_forum_moderation.html", icon: "forum" }
        ];

        var navMarkup = navItems.map(function (item) {
            var activeClass = item.id === active
                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200"
                : "text-on-surface-variant hover:bg-surface-container-low";
            var iconStyle = item.id === active ? " style=\"font-variation-settings: 'FILL' 1;\"" : "";
            var labelClass = item.id === active ? "font-medium" : "font-medium text-on-surface";
            return (
                '<a class="flex items-center gap-3 px-4 py-3 ' + activeClass + ' rounded-2xl transition-all duration-200" href="' + item.href + '">' +
                    '<span class="material-symbols-outlined"' + iconStyle + '>' + escapeHtml(item.icon) + '</span>' +
                    '<span class="' + labelClass + '">' + escapeHtml(item.label) + '</span>' +
                '</a>'
            );
        }).join("");

        shellHost.innerHTML = [
            '<nav class="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl no-line tonal-layering bg-slate-100/50 dark:bg-slate-800/50 flat no shadows">',
            '<div class="flex items-center gap-8">',
            '<span class="text-2xl font-black tracking-tight text-violet-600 dark:text-violet-400">CuratorEdu</span>',
            '<div class="hidden lg:flex items-center gap-6 font-plus-jakarta text-sm font-medium">',
            '<a class="text-slate-500 dark:text-slate-400 hover:text-violet-500 transition-colors" href="#">Courses</a>',
            '<a class="text-slate-500 dark:text-slate-400 hover:text-violet-500 transition-colors" href="#">Forum</a>',
            '<a class="text-slate-500 dark:text-slate-400 hover:text-violet-500 transition-colors" href="#">Bookstore</a>',
            '</div>',
            '</div>',
            '<div class="flex items-center gap-4">',
            '<button class="p-2 text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-low/30 rounded-full transition-all">',
            '<span class="material-symbols-outlined" data-icon="notifications">notifications</span>',
            '</button>',
            '<button class="p-2 text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-low/30 rounded-full transition-all">',
            '<span class="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>',
            '</button>',
            '<img alt="Student Profile" class="w-10 h-10 rounded-full border-2 border-violet-100 object-cover" data-alt="Close-up portrait of a professional male administrator in a clean office setting, soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZDTNemVLTQJhT5FYCTocWYAdHfguzOVwu6nwLkmSsAgt-ykE9HxlDi4utErzs8yTREyXqA_ib7WZBd-aeitduTZEIaBSzvtTSx_oFWeQk5fjubbH1pdXvFSzpWLuPGbLBHYZNtXeGGZ-Zde59Yz8fk2itNEy_TDkjmX7uxYkYsQF8vRjxwOksu3rlxe_wSnS8Sy6UG90CJT-ftXSQv3FXrYLnKY9bPWMlx60Z45v22WFjIQCVvRIFQZSCvihRRbsxzbeSpulUCjg"/>',
            '</div>',
            '</nav>',
            '<aside class="left-drawer open fixed top-0 left-0 h-screen w-[312px] max-w-[88vw] z-[80] bg-surface-container-lowest border-r border-surface-container shadow-[20px_0_48px_-18px_rgba(0,0,0,0.22)] p-5" id="leftDrawer">',
            '<div class="flex items-center justify-between pb-6 border-b border-surface-container">',
            '<div>',
            '<h2 class="font-headline font-black text-violet-600 text-xl">The Curator</h2>',
            '<p class="text-xs text-on-surface-variant uppercase tracking-[0.16em] font-label mt-1">' + escapeHtml(sectionLabel) + '</p>',
            '</div>',
            '<button aria-label="Close admin navigation" class="p-2 rounded-full text-on-surface-variant hover:text-violet-600 hover:bg-surface-container-low transition-colors" id="closeDrawerBtn" type="button">',
            '<span class="material-symbols-outlined">close</span>',
            '</button>',
            '</div>',
            '<nav class="mt-6 space-y-2">',
            navMarkup,
            '</nav>',
            '</aside>'
        ].join("");

        shellHost.removeAttribute("data-admin-shell");
    }

    function initModal(config) {
        var options = config || {};
        var modalId = options.modalId;
        var closeIds = options.closeIds || [];
        var openIds = options.openIds || [];
        var closeOnBackdrop = options.closeOnBackdrop !== false;

        var modal = document.getElementById(modalId);
        if (!modal) {
            return { open: function () {}, close: function () {} };
        }

        var backdrop = options.backdropId ? document.getElementById(options.backdropId) : null;

        function openModal() {
            modal.classList.remove("hidden");
            modal.classList.add("flex");
            setBodyScrollLock(true);
        }

        function closeModal() {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
            setBodyScrollLock(false);
        }

        openIds.forEach(function (id) {
            var trigger = document.getElementById(id);
            if (trigger) {
                trigger.addEventListener("click", openModal);
            }
        });

        closeIds.forEach(function (id) {
            var trigger = document.getElementById(id);
            if (trigger) {
                trigger.addEventListener("click", closeModal);
            }
        });

        if (closeOnBackdrop && backdrop) {
            backdrop.addEventListener("click", closeModal);
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !modal.classList.contains("hidden")) {
                closeModal();
            }
        });

        return { open: openModal, close: closeModal };
    }

    window.AdminUI = {
        initDrawer: initDrawer,
        initModal: initModal,
        initShell: initShell
    };
})();
