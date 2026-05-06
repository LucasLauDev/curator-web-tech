/**
 * Instructor Interactions (Frontend-only)
 * Adds real-feeling interactivity to static HTML screens without backend.
 *
 * Notes:
 * - Persists state in localStorage (cart, notifications, forum posts, uploads).
 * - Avoids generic "Mock action" fallbacks. Every interaction should have a UI outcome.
 */

(function () {
  "use strict";

  // Global Toast System
  window.showToast = function (message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white font-bold font-headline transition-all duration-500 opacity-0 translate-y-4 flex items-center gap-3`;

    const colors = {
      info: "bg-slate-900",
      success: "bg-emerald-600",
      error: "bg-error",
    };
    toast.classList.add(colors[type] || colors.info);

    const icon =
      type === "success" ? "check_circle" : type === "error" ? "error" : "info";
    toast.innerHTML = `<span class="material-symbols-outlined text-xl">${icon}</span><span>${message}</span>`;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0", "translate-y-4");
    });

    // Animate out
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  /** Created courses demo store (see wireCourseEditorCreateFlow). */
  const CREATED_COURSES_KEY = "instructor_created_courses_v1";

  /** Resolve href to Dashboard/main page assets from current path. */
  function instructorMainPageHref(file) {
    const p = (window.location.pathname || "").replace(/\\/g, "/");
    if (/\/main page\//i.test(p) || /\/main%20page\//i.test(p)) return file;
    if (/\/Dashboard\//i.test(p)) return `main page/${file}`;
    return `../Dashboard/main page/${file}`;
  }

  function navigateToCourseEditor() {
    window.location.href = instructorMainPageHref(
      "instructor_course_editor.html",
    );
  }

  function navigateToMyCourses(queryString) {
    const q =
      queryString && String(queryString).startsWith("?")
        ? queryString
        : queryString
          ? `?${queryString}`
          : "";
    window.location.href = `${instructorMainPageHref("instructor_my_courses.html")}${q}`;
  }

  function getPageKey() {
    const p = (window.location.pathname || "").toLowerCase();
    if (p.includes("/dashboard/student_roster.html"))
      return "dashboard_student_roster";
    if (p.includes("instructor_student_progress.html"))
      return "dashboard_student_roster";
    // if (p.includes("/student_roster/student_details.html"))
    //   return "student_details";
    if (p.includes("/dashboard/instructor_dashboard.html"))
      return "dashboard_home";
    if (p.includes("instructor_course_editor.html")) return "course_editor";
    if (p.includes("/course_management/course_module_editor.html"))
      return "course_module_editor";
    if (p.includes("/course_management/lesson_editor.html"))
      return "lesson_editor";
    if (p.includes("/dashboard/course_management_dashboard.html"))
      return "dashboard_courses";
    if (p.includes("/resources/resource_library.html"))
      return "resource_library";
    if (p.includes("/community/community_forum.html")) return "community_forum";
    if (p.includes("instructor_forum_moderation.html"))
      return "instructor_forum_moderation";
    if (p.includes("/community/community_group.html")) return "community_group";
    if (p.includes("/dashboard/minimal_bookstore.html")) return "bookstore";
    if (p.includes("/dashboard/bookstore.html")) return "bookstore";
    if (p.includes("bookstore.html") && (p.includes("main%20page") || p.includes("main page")))
      return "bookstore";
    if (p.includes("/bookstore/cart_checkout_flow.html"))
      return "cart_checkout_flow";
    if (p.includes("/bookstore/cart_list.html")) return "cart_list";
    if (p.includes("/bookstore/cart_secure_checkout.html"))
      return "cart_checkout";
    if (p.includes("/bookstore/book_detail.html")) return "book_detail";
    if (p.includes("/bookstore/order_history_download.html"))
      return "order_history";
    if (p.includes("/dashboard/instructor_course_analytics_dashboard.html"))
      return "analytics_dashboard";
    if (p.includes("/analytics/download_reports.html"))
      return "download_reports";
    if (p.includes("dashboard/help.html")) return "help";
    if (p.includes("help/contact_support.html")) return "contact_support";
    if (p.includes("help/faq.html")) return "faq";
    if (p.includes("dashboard/tasks.html")) return "tasks";
    if (p.includes("dashboard/settings.html")) return "settings";
    if (p.includes("dashboard/inbox.html")) return "inbox";
    if (p.includes("dashboard/instructor_profile.html"))
      return "instructor_profile";
    if (p.includes("instructor_my_courses.html"))
      return "instructor_my_courses";
    if (p.includes("course_management/course_preview.html"))
      return "course_preview";
    if (p.includes("course_management/draft_submit_publish.html"))
      return "publishing_center";
    if (p.includes("course_management/quiz_builder.html"))
      return "quiz_builder";
    if (p.includes("resources/resource_view.html")) return "resource_view";
    if (p.includes("instructor-login.html")) return "instructor_login";
    if (p.includes("student-quiz.html")) return "student_quiz";
    return "generic";
  }

  /** Main page title (nav injects its own brand <h1>, so never use document.querySelector('h1') alone). */
  function mainH1() {
    return (
      document.querySelector("main h1") ||
      document.querySelector('[role="main"] h1')
    );
  }

  function findH1ByExactTitle(lowerExact) {
    const want = (lowerExact || "").trim().toLowerCase();
    const mh = mainH1();
    if (mh && (mh.textContent || "").trim().toLowerCase() === want) return mh;
    return (
      Array.from(document.querySelectorAll("h1")).find(
        (h) => (h.textContent || "").trim().toLowerCase() === want,
      ) || null
    );
  }

  function findH1Including(substr) {
    const s = (substr || "").toLowerCase();
    const mh = mainH1();
    if (mh && (mh.textContent || "").toLowerCase().includes(s)) return mh;
    return (
      Array.from(document.querySelectorAll("h1")).find((h) =>
        (h.textContent || "").toLowerCase().includes(s),
      ) || null
    );
  }

  function ensureToast() {
    let el = document.getElementById("instructor-toast");
    if (el) return el;
    el = document.createElement("div");
    el.id = "instructor-toast";
    el.className =
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] hidden " +
      "px-4 py-3 rounded-xl border border-slate-200 bg-white/90 backdrop-blur " +
      "shadow-2xl text-sm font-semibold text-slate-800 max-w-[90vw]";
    document.body.appendChild(el);
    return el;
  }

  function toast(message) {
    const el = ensureToast();
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.add("hidden"), 2600);
  }

  function modal({
    title,
    bodyHtml,
    primaryText = "OK",
    secondaryText = "Cancel",
    onPrimary,
    onSecondary,
  }) {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 z-[210] bg-slate-900/40 backdrop-blur-sm p-4 flex items-center justify-center";

    const card = document.createElement("div");
    card.className =
      "w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden";
    card.innerHTML = `
      <div class="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] font-extrabold text-violet-600">CuratorEdu</p>
          <h3 class="text-xl font-black text-slate-900 mt-1">${title}</h3>
        </div>
        <button type="button" data-modal-close class="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="p-6">${bodyHtml}</div>
      <div class="p-6 pt-0 flex flex-col sm:flex-row gap-3 justify-end">
        <button type="button" data-modal-secondary class="px-5 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors">${secondaryText}</button>
        <button type="button" data-modal-primary class="px-5 py-3 rounded-xl bg-violet-600 text-white font-black hover:bg-violet-700 transition-colors">${primaryText}</button>
      </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    window.addEventListener("keydown", onKey, { once: true });
    card.querySelector("[data-modal-close]")?.addEventListener("click", close);
    card
      .querySelector("[data-modal-secondary]")
      ?.addEventListener("click", async () => {
        try {
          await onSecondary?.(overlay);
        } finally {
          close();
        }
      });
    card
      .querySelector("[data-modal-primary]")
      ?.addEventListener("click", async () => {
        try {
          const result = await onPrimary?.(overlay);
          if (result !== false) close();
        } catch {
          close();
        }
      });
  }

  function csvEscape(v) {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  }

  function downloadText(filename, content, mime = "text/plain") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function wireDashboardHome() {
    const search = document.querySelector(
      'input[placeholder="Search curriculum..."]',
    );
    if (!search) return;

    const cards = Array.from(
      document.querySelectorAll("h3.editorial-header"),
    ).map((h) => ({
      titleEl: h,
      card:
        h.closest(
          "div.bg-surface-container-lowest, div.bg-surface-container-low",
        ) || h.parentElement,
      title: (h.textContent || "").toLowerCase(),
    }));

    search.addEventListener("input", () => {
      const q = (search.value || "").trim().toLowerCase();
      cards.forEach(({ card, title }) => {
        if (!card) return;
        const show = !q || title.includes(q);
        card.style.display = show ? "" : "none";
      });
    });

    // Course title → preview (when card has data-course-id)
    cards.forEach(({ titleEl, card }) => {
      const cid = (card?.getAttribute("data-course-id") || "").trim();
      if (!titleEl || !cid) return;
      titleEl.classList.add(
        "cursor-pointer",
        "hover:text-primary",
        "transition-colors",
      );
      titleEl.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `../course_management/course_preview.html?id=${encodeURIComponent(cid)}`;
      });
    });

    // EDIT CONTENT (course cards)
    document.querySelectorAll("span.pill-label span").forEach((el) => {
      const t = (el.textContent || "").trim().toLowerCase();
      if (t === "edit content") {
        const btn = el.closest("span.pill-label");
        if (!btn) return;
        btn.setAttribute("role", "button");
        btn.addEventListener("click", () => {
          window.location.href =
            "../course_management/course_module_editor.html";
        });
      }
    });

    // Resume Drafting (featured card)
    const resumeBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("resume drafting"),
    );
    resumeBtn?.addEventListener("click", () => {
      window.location.href = "../course_management/lesson_editor.html";
    });

    // Drafting queue items -> open editor
    document.querySelectorAll("h4 + ul li").forEach((li) => {
      li.classList.add("cursor-pointer");
      li.addEventListener("click", () => {
        const title = (li.textContent || "").toLowerCase();
        if (title.includes("module"))
          window.location.href =
            "../course_management/course_module_editor.html";
        else window.location.href = "../course_management/lesson_editor.html";
      });
    });
  }

  function wireInstructorAnalyticsDashboard() {
    const h2 = Array.from(document.querySelectorAll("h2")).find((x) =>
      (x.textContent || "").toLowerCase().includes("instructor dashboard"),
    );
    if (!h2) return;

    const rangeBtn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        (b.textContent || "").toLowerCase().includes("last 30 days") &&
        b.querySelector(".material-symbols-outlined"),
    );
    rangeBtn?.addEventListener("click", () => {
      modal({
        title: "Date range",
        primaryText: "Apply",
        bodyHtml: `
          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-600">Range</label>
            <select id="ad-range" class="w-full rounded-xl border-slate-200">
              <option>Last 7 Days</option>
              <option selected>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
        `,
        onPrimary: () => toast("Range applied"),
      });
    });

    const dlBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("download student report"),
    );
    dlBtn?.addEventListener("click", () => {
      downloadText(
        "student_report.csv",
        "name,progress\nJordan,85\nMia,42\n",
        "text/csv",
      );
      toast("CSV exported");
    });

    // Student Performance row menu (compact context menu, not full modal)
    document.addEventListener(
      "click",
      (e) => {
        const icon = e.target.closest(".material-symbols-outlined");
        if (!icon || (icon.textContent || "").trim() !== "more_horiz") return;
        const btn = icon.closest("button");
        if (!btn || !btn.classList.contains("ica-student-actions")) return;

        const row = btn.closest("tbody tr");
        const card = row?.closest(".col-span-12");
        const h3 = card?.querySelector("h3");
        if (
          !row ||
          !h3 ||
          !(h3.textContent || "").includes("Student Performance")
        )
          return;

        e.preventDefault();
        e.stopPropagation();

        const name =
          row.querySelector("span.font-semibold")?.textContent?.trim() ||
          "Student";
        const existing = document.getElementById("ica-student-row-menu");
        if (existing?.dataset.student === name) {
          existing.remove();
          document
            .querySelectorAll(".ica-student-actions")
            .forEach((b) => b.setAttribute("aria-expanded", "false"));
          return;
        }
        existing?.remove();

        const menu = document.createElement("div");
        menu.id = "ica-student-row-menu";
        menu.dataset.student = name;
        menu.setAttribute("role", "menu");
        menu.className =
          "fixed z-[250] min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-2xl shadow-slate-900/15 text-sm overflow-hidden";
        menu.innerHTML = `
          <button type="button" role="menuitem" data-act="kick" class="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 font-medium">Kick User</button>
        `;
        document.body.appendChild(menu);

        const rect = btn.getBoundingClientRect();
        const mw = menu.offsetWidth || 176;
        const mh = menu.offsetHeight || 88;
        let top = rect.bottom + 6;
        if (top + mh > window.innerHeight - 8)
          top = Math.max(8, rect.top - mh - 6);
        let left = rect.right - mw;
        if (left < 8) left = 8;
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;

        document
          .querySelectorAll(".ica-student-actions")
          .forEach((b) => b.setAttribute("aria-expanded", "false"));
        btn.setAttribute("aria-expanded", "true");

        function closeMenu() {
          menu.remove();
          document
            .querySelectorAll(".ica-student-actions")
            .forEach((b) => b.setAttribute("aria-expanded", "false"));
          document.removeEventListener("click", onDoc, true);
          document.removeEventListener("keydown", onKey, true);
        }

        function onDoc(ev) {
          if (menu.contains(ev.target) || btn.contains(ev.target)) return;
          closeMenu();
        }

        function onKey(ev) {
          if (ev.key === "Escape") closeMenu();
        }

        menu
          .querySelector('[data-act="view"]')
          ?.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            closeMenu();
            if (typeof window.showToast === "function") {
              window.showToast("Student profile page is not used in this build.", "info");
            } else {
              window.alert("Student profile page is not used in this build.");
            }
          });

        menu
          .querySelector('[data-act="delete"]')
          ?.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            closeMenu();
            const msg = `Remove ${name} from this course? The row will reappear after you refresh the page.`;
            if (!window.confirm(msg)) return;
            row.remove();
            toast("Student removed from this course");
          });

        requestAnimationFrame(() => {
          document.addEventListener("click", onDoc, true);
          document.addEventListener("keydown", onKey, true);
        });
      },
      true,
    );
  }

  function wireInstructorProfile() {
    const viewAllBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("view all"),
    );
    const profileH = Array.from(document.querySelectorAll("h3")).find((h) =>
      (h.textContent || "").toLowerCase().includes("dr."),
    );
    if (!profileH && !viewAllBtn) return;

    viewAllBtn?.addEventListener(
      "click",
      () => (window.location.href = "course_management_dashboard.html"),
    );

    // edit button: first icon-only edit on profile page
    const editBtn = Array.from(
      document.querySelectorAll("button span.material-symbols-outlined"),
    )
      .find((s) => (s.textContent || "").trim() === "edit")
      ?.closest("button");
    editBtn?.addEventListener("click", () => {
      modal({
        title: "Edit Profile",
        primaryText: "Save",
        secondaryText: "Cancel",
        bodyHtml: `
          <div class="space-y-4">
            <label class="block text-xs font-bold text-slate-600">Display name</label>
            <input id="ip-name" class="w-full rounded-xl border-slate-200" value="Dr. Julian Vibe" />
            <label class="block text-xs font-bold text-slate-600">Headline</label>
            <input id="ip-role" class="w-full rounded-xl border-slate-200" value="Senior Design Architect" />
          </div>
        `,
        onPrimary: () => toast("Profile saved"),
      });
    });

    // Share Profile Logic
    const shareBtn = document.getElementById("share-profile-btn");
    shareBtn?.addEventListener("click", () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        toast("Profile link copied to clipboard");
        shareBtn.classList.add("bg-primary/10");
        setTimeout(() => shareBtn.classList.remove("bg-primary/10"), 1500);
      });
    });

    // Publication Links
    document.querySelectorAll(".publication-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const title = link.querySelector("h5")?.textContent || "Publication";
        toast(`Opening: ${title}`);
      });
    });
  }

  function wireMinimalBookstoreFilters() {
    const header = Array.from(document.querySelectorAll("h2")).find((h) =>
      (h.textContent || "").toLowerCase().includes("curated library"),
    );
    if (!header) return;
    const pills = Array.from(
      document.querySelectorAll("div.overflow-x-auto button"),
    );
    const cards = Array.from(
      document.querySelectorAll("div.group.relative.flex.flex-col"),
    );
    const search = document.querySelector(
      'input[placeholder*="Search for books"]',
    );
    let activeCategory = "all topics";

    function setActive(btn) {
      pills.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("bg-primary", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("bg-surface-container-high", !active);
      });
    }

    function apply(category) {
      activeCategory = (
        category ||
        activeCategory ||
        "all topics"
      ).toLowerCase();
      const c = (category || "").toLowerCase();
      const q = (search?.value || "").trim().toLowerCase();
      cards.forEach((card) => {
        const t = (card.textContent || "").toLowerCase();
        const okCat = c === "all topics" || !c || t.includes(c.split("-")[0]);
        const okQ = !q || t.includes(q);
        const show = okCat && okQ;
        card.classList.toggle("hidden", !show);
      });
    }

    pills.forEach((b) => {
      b.addEventListener("click", () => {
        const t = (b.textContent || "").replace(/\s+/g, " ").trim();
        setActive(b);
        apply(t);
      });
    });

    search?.addEventListener("input", () => apply(activeCategory));

    // Bundle CTA — resolve real UUID from API
    void (async () => {
      try {
        const r = await fetch("/api/bookstore/books");
        if (!r.ok) return;
        const j = await r.json();
        const bundle = (j.books || []).find(
          (x) => x.title === "Summer Reading Bundle",
        );
        const bundleBtn = Array.from(document.querySelectorAll("button")).find(
          (b) => (b.textContent || "").toLowerCase().includes("claim bundle"),
        );
        if (bundle && bundleBtn) {
          bundleBtn.addEventListener("click", () => {
            cartStore.add(
              {
                id: bundle.id,
                title: bundle.title,
                price: Number(bundle.price_rm),
                img: bundle.image_url || "",
              },
              1,
            );
            updateCartBadges();
            window.location.href = "../bookstore/cart_list.html";
          });
        }
      } catch (_) {
        /* ignore */
      }
    })();
  }

  function wireRosterExtras() {
    const viewTrends = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("view trends"),
    );
    viewTrends?.addEventListener(
      "click",
      () =>
        (window.location.href = "instructor_course_analytics_dashboard.html"),
    );

    const fab = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("new announcement"),
    );
    fab?.addEventListener("click", () => {
      modal({
        title: "New Announcement",
        primaryText: "Post",
        secondaryText: "Cancel",
        bodyHtml: `
          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-600">Title</label>
            <input id="ann-title" class="w-full rounded-xl border-slate-200" placeholder="Announcement title" />
            <label class="block text-xs font-bold text-slate-600">Message</label>
            <textarea id="ann-body" class="w-full rounded-xl border-slate-200 min-h-24" placeholder="Write a message..."></textarea>
          </div>
        `,
        onPrimary: () => {
          const t = (document.getElementById("ann-title")?.value || "").trim();
          const b = (document.getElementById("ann-body")?.value || "").trim();
          if (!t || !b) return toast("Title and message required");
          toast("Announcement posted");
        },
      });
    });
  }

  function wireContactSupport() {
    const form = document.querySelector("form");
    const sendBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("send message"),
    );
    if (!form && !sendBtn) return;

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      modal({
        title: "Message sent",
        primaryText: "Back to Help",
        bodyHtml: `<div class="text-sm text-slate-600">Support will respond soon. Message recorded in this browser only.</div>`,
        onPrimary: () => (window.location.href = "../dashboard/help.html"),
      });
      Array.from(form.querySelectorAll("input, textarea")).forEach(
        (i) => (i.value = ""),
      );
    });

    const register = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim().toLowerCase() === "register now",
    );
    register?.addEventListener(
      "click",
      () =>
        (window.location.href =
          "../placeholders/student-course-discovery.html"),
    );

    // bottom nav
    const navBtns = Array.from(document.querySelectorAll("nav button"));
    navBtns.forEach((b) => {
      const icon = (
        b.querySelector(".material-symbols-outlined")?.textContent || ""
      ).trim();
      if (icon === "dashboard")
        b.addEventListener(
          "click",
          () =>
            (window.location.href = "../dashboard/instructor_dashboard.html"),
        );
      if (icon === "school")
        b.addEventListener(
          "click",
          () =>
            (window.location.href =
              "../dashboard/course_management_dashboard.html"),
        );
      if (icon === "add")
        b.addEventListener("click", () => navigateToCourseEditor());
      if (icon === "contact_support") b.addEventListener("click", () => {});
      if (icon === "account_circle")
        b.addEventListener(
          "click",
          () => (window.location.href = "../dashboard/instructor_profile.html"),
        );
    });
  }

  function wireFaq() {
    const faqList = document.getElementById("faq-list");
    if (!faqList) return;

    const filters = Array.from(document.querySelectorAll("button.faq-filter"));
    const items = Array.from(faqList.querySelectorAll(".faq-item"));
    const toggles = Array.from(faqList.querySelectorAll("button.faq-toggle"));

    filters.forEach((b) => b.setAttribute("data-global-skip", "1"));
    toggles.forEach((b) => b.setAttribute("data-global-skip", "1"));

    function setActive(btn) {
      filters.forEach((b) => {
        const act = b === btn;
        if (act) {
          b.classList.remove(
            "bg-surface-container-low",
            "text-on-surface-variant",
            "text-white",
            "border",
            "border-slate-200",
          );
          b.classList.add(
            "bg-primary-container",
            "text-slate-900",
            "ring-2",
            "ring-primary/35",
            "shadow-md",
          );
        } else {
          b.classList.remove(
            "bg-primary",
            "bg-primary-container",
            "text-white",
            "ring-2",
            "ring-primary/35",
            "shadow-md",
          );
          b.classList.add(
            "bg-surface-container-low",
            "text-slate-900",
            "border",
            "border-slate-200",
          );
        }
      });
    }

    function apply(cat) {
      const c = (cat || "all").toLowerCase();
      items.forEach((it) => {
        const k = (it.getAttribute("data-cat") || "all").toLowerCase();
        const show = c === "all" || k === c;
        it.classList.toggle("hidden", !show);
      });
    }

    filters.forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        const cat = (b.getAttribute("data-cat") || b.textContent || "").trim();
        setActive(b);
        apply(cat);
      });
    });

    toggles.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const item = btn.closest(".faq-item");
        const ans = item?.querySelector(".faq-answer");
        ans?.classList.toggle("hidden");
        const chevron = btn.querySelector(".material-symbols-outlined");
        chevron?.classList.toggle("rotate-180");
      });
    });

    // Search Logic
    const searchInput = document.querySelector(
      'input[placeholder*="Search for questions"]',
    );
    const searchBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("search"),
    );

    function runSearch() {
      const q = (searchInput?.value || "").toLowerCase().trim();
      items.forEach((it) => {
        const text = it.textContent.toLowerCase();
        it.classList.toggle("hidden", q && !text.includes(q));
      });
      if (q)
        filters.forEach((b) =>
          b.classList.remove("ring-2", "ring-primary/35", "shadow-md"),
        ); // clear active filter style if searching
    }

    searchInput?.addEventListener("input", runSearch);
    searchBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      runSearch();
    });

    // initial
    const first =
      filters.find(
        (b) => (b.getAttribute("data-cat") || "").toLowerCase() == "all",
      ) || filters[0];
    if (first) {
      setActive(first);
      apply(first.getAttribute("data-cat") || "all");
    }
  }

  function wireHelpCenterChatbot() {
    const h1 = Array.from(document.querySelectorAll("h1")).find((h) => {
      const t = (h.textContent || "").toLowerCase();
      return t.includes("help center") || t.includes("help & support");
    });
    const panel = document.getElementById("chatbot-panel");
    const fab = document.getElementById("chatbot-fab");
    const closeBtn = document.getElementById("chatbot-close");
    const sendBtn = document.getElementById("chatbot-send");
    const input = document.getElementById("chatbot-input");
    const msgHost = document.getElementById("chatbot-messages");
    if (!h1 || !panel || !fab || !input || !msgHost) return;

    const botReplies = {
      "upload issue":
        "For upload issues, ensure your file is MP4/MOV under 4GB. Try a different browser if problems persist. Shall I open the upload guide?",
      "payout help":
        "Payouts are processed on the 15th each month. Verify your bank details in Settings → Payments. Is your account verified?",
      "course settings":
        "You can manage course visibility, pricing, and co-instructors under Course Builder → Settings. What would you like to change?",
      default:
        "Thanks for reaching out! Let me connect you with a support curator for this. Expected wait time is under 2 minutes.",
    };

    function appendMessage(text, isUser) {
      const wrapper = document.createElement("div");
      wrapper.className = isUser ? "flex justify-end" : "flex items-end gap-2";
      if (isUser) {
        wrapper.innerHTML = `<div class="bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%] shadow-sm"><p class="text-sm"></p></div>`;
        wrapper.querySelector("p").textContent = text;
      } else {
        wrapper.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">support_agent</span>
          </div>
          <div class="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] shadow-sm">
            <p class="text-sm text-on-surface"></p>
          </div>`;
        wrapper.querySelector("p").textContent = text;
      }
      msgHost.appendChild(wrapper);
      msgHost.scrollTop = msgHost.scrollHeight;
    }

    function openChat() {
      panel.style.display = "flex";
      const badge = document.getElementById("chatbot-badge");
      badge?.remove();
    }

    function closeChat() {
      panel.style.display = "none";
    }

    function toggleChat() {
      const isHidden =
        panel.style.display === "none" || panel.style.display === "";
      if (isHidden) openChat();
      else closeChat();
    }

    function sendText(text) {
      const t = (text || "").trim();
      if (!t) return;
      appendMessage(t, true);
      const key =
        Object.keys(botReplies).find(
          (k) => k !== "default" && t.toLowerCase().includes(k),
        ) || "default";
      window.setTimeout(() => appendMessage(botReplies[key], false), 700);
    }

    fab.setAttribute("data-global-skip", "1");
    closeBtn?.setAttribute("data-global-skip", "1");
    sendBtn?.setAttribute("data-global-skip", "1");
    Array.from(document.querySelectorAll("button.quick-reply")).forEach((b) =>
      b.setAttribute("data-global-skip", "1"),
    );

    // default hidden (the HTML has both "hidden" class and inline display styles; enforce)
    panel.style.display = "none";

    fab.addEventListener("click", (e) => {
      e.preventDefault();
      toggleChat();
    });

    // Wire up the "Live Chat Now" button in the contact card
    const liveChatBtn = Array.from(document.querySelectorAll("a, button")).find(
      (b) => (b.textContent || "").includes("Live Chat Now"),
    );
    liveChatBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      openChat();
    });
    closeBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      closeChat();
    });
    sendBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      sendText(input.value);
      input.value = "";
      input.focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendText(input.value);
        input.value = "";
      }
    });

    document.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button.quick-reply");
      if (!btn) return;
      e.preventDefault();
      const text = (btn.textContent || "").trim();
      btn.parentElement?.remove();
      sendText(text);
    });
  }

  function wireStudentQuizPlaceholder() {
    const h1 = findH1Including("interactive quiz");
    if (!h1) return;
    const opts = Array.from(document.querySelectorAll("button")).filter((b) =>
      /^[abc]\./i.test((b.textContent || "").trim()),
    );
    let selected = null;
    opts.forEach((b) =>
      b.addEventListener("click", () => {
        selected = b;
        opts.forEach((x) => x.classList.toggle("bg-violet-600", x === b));
        opts.forEach((x) => x.classList.toggle("text-white", x === b));
      }),
    );
    // Provide feedback on selection
    opts.forEach((b) =>
      b.addEventListener("click", () => {
        setTimeout(() => toast("Answer selected"), 0);
      }),
    );
  }

  function wireStudentQuiz() {
    const h1 = findH1Including("interactive quiz");
    if (!h1) return;
    const host = document.getElementById("student-quiz-host");
    if (!host) return;

    const quiz = storage.get("instructor_quiz_v1", null);
    if (!quiz || !quiz.published) {
      host.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-2xl p-6">
          <div class="flex items-center gap-2 text-slate-700 font-black">
            <span class="material-symbols-outlined">lock</span> Quiz unavailable
          </div>
          <p class="text-sm text-slate-600 mt-2">The instructor hasn’t published this quiz yet.</p>
        </div>
      `;
      return;
    }

    const q = quiz.questions?.[0];
    if (!q) {
      host.innerHTML = `<div class="bg-white border border-slate-200 rounded-2xl p-6">No questions.</div>`;
      return;
    }

    const attemptKey = `instructor_quiz_attempt_v1_${quiz.id}`;
    const attempt = storage.get(attemptKey, { submitted: false, answers: {} });

    function render() {
      const selected = attempt.answers[q.id] ?? null;
      host.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-2xl p-6">
          <p class="font-black">${q.title}</p>
          <p class="text-sm text-slate-600 mt-2">${q.prompt}</p>
          <div class="mt-4 grid gap-2">
            ${q.options
              .map((opt, idx) => {
                const key = String(idx);
                const is = selected === key;
                const cls = is
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200";
                const dis = attempt.submitted ? "disabled" : "";
                return `<button data-opt="${key}" class="px-4 py-3 rounded-xl ${cls} font-bold text-left" ${dis}>${opt}</button>`;
              })
              .join("")}
          </div>
          <div class="mt-5 flex gap-3">
            <button id="quiz-submit" class="px-5 py-3 rounded-xl bg-violet-600 text-white font-black hover:bg-violet-700 ${attempt.submitted ? "opacity-50" : ""}" ${attempt.submitted ? "disabled" : ""}>Submit</button>
            <button id="quiz-reset" class="px-5 py-3 rounded-xl bg-slate-100 text-slate-900 font-black hover:bg-slate-200">Reset</button>
          </div>
          <div id="quiz-result" class="mt-4 text-sm font-black"></div>
        </div>
      `;

      host.querySelectorAll("button[data-opt]").forEach((b) =>
        b.addEventListener("click", () => {
          if (attempt.submitted) return;
          attempt.answers[q.id] = b.getAttribute("data-opt");
          storage.set(attemptKey, attempt);
          render();
        }),
      );

      host.querySelector("#quiz-reset")?.addEventListener("click", () => {
        storage.set(attemptKey, { submitted: false, answers: {} });
        window.location.reload();
      });

      host.querySelector("#quiz-submit")?.addEventListener("click", () => {
        const a = attempt.answers[q.id];
        if (a == null) return toast("Select an option");
        attempt.submitted = true;
        storage.set(attemptKey, attempt);
        const correct = String(q.correct) === String(a);
        const r = host.querySelector("#quiz-result");
        if (r) {
          r.className = `mt-4 text-sm font-black ${correct ? "text-emerald-600" : "text-rose-600"}`;
          r.textContent = correct ? "Correct" : "Incorrect";
        }
        render();
      });
    }

    render();
  }

  function wireResourceLibraryActions() {
    const grid = document.getElementById("resource-grid");
    if (!grid) return;

    grid.addEventListener("click", (e) => {
      const dl = e.target.closest(".resource-dl-btn");
      if (!dl) return;
      e.preventDefault();
      const card = dl.closest(".resource-card");
      const title =
        card?.querySelector("h3")?.textContent?.trim() || "resource";
      const type = (card?.getAttribute("data-type") || "all").toLowerCase();
      const base = (title || "resource")
        .replace(/[^a-z0-9_-]+/gi, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
      downloadText(
        `${base || "resource"}.txt`,
        `Resource: ${title}\nType: ${type}\n(export summary — local preview)\n`,
        "text/plain",
      );
      toast("Download started");
    });

    const connect = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("connect app"),
    );
    connect?.addEventListener("click", () => toast("Sync connected"));

    const loadMore = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("load more"),
    );
    loadMore?.addEventListener("click", () => {
      const card = document.createElement("div");
      card.className =
        "resource-card bg-surface-container-lowest rounded-xl p-6 shadow-sm";
      card.setAttribute("data-type", "document");
      card.innerHTML = `
        <h3 class="font-black">New Asset</h3>
        <p class="text-sm text-slate-600 mt-2">Loaded just now.</p>
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <a href="resource_view.html?title=${encodeURIComponent("New Asset")}" class="inline-flex items-center justify-center p-2.5 rounded-lg bg-violet-600 text-white text-sm font-bold" data-global-skip="1" title="View" aria-label="View"><span class="material-symbols-outlined text-lg">visibility</span></a>
          <button type="button" class="resource-dl-btn inline-flex items-center justify-center p-2.5 rounded-lg bg-slate-100 text-slate-800" data-global-skip="1" title="Download" aria-label="Download"><span class="material-symbols-outlined text-lg">download</span></button>
        </div>`;
      grid.appendChild(card);
      toast("Loaded more");
    });

    // Upload modal action buttons (target #upload-modal explicitly — DOM-safe)
    const uploadModal = () => document.getElementById("upload-modal");
    document
      .getElementById("modal-close")
      ?.addEventListener("click", () => uploadModal()?.classList.add("hidden"));
    document
      .getElementById("modal-cancel")
      ?.addEventListener("click", () => uploadModal()?.classList.add("hidden"));
    document.getElementById("upload-confirm")?.addEventListener("click", () => {
      toast("Upload complete");
      uploadModal()?.classList.add("hidden");
    });
  }

  function wireStudentDetailsActions() {
    const title = Array.from(document.querySelectorAll("h1, h2")).find((h) =>
      (h.textContent || "").toLowerCase().includes("profile"),
    );
    const certBtn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        (
          b.querySelector(".material-symbols-outlined")?.textContent || ""
        ).trim() === "workspace_premium",
    );
    if (!certBtn) return;
    certBtn.addEventListener("click", () => {
      downloadText(
        "certificate.txt",
        "Certificate issued (preview document)\n",
        "text/plain",
      );
      toast("Certificate generated");
    });
    const addNote = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("add note"),
    );
    addNote?.addEventListener("click", () => {
      modal({
        title: "Add Note",
        primaryText: "Add",
        secondaryText: "Cancel",
        bodyHtml: `<textarea id="sd-note" class="w-full rounded-xl border-slate-200 min-h-24" placeholder="Write a note..."></textarea>`,
        onPrimary: () => {
          const v = (document.getElementById("sd-note")?.value || "").trim();
          if (!v) return toast("Note required");
          toast("Note added");
        },
      });
    });
    const viewAll = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("view all activity"),
    );
    viewAll?.addEventListener("click", () => {
      const sec = viewAll.closest("section") || document.body;
      sec.classList.toggle("max-h-none");
      toast("Expanded");
    });
  }

  function wireQuizBuilder() {
    const titleEl = document.getElementById("qb-title");
    if (!titleEl) return;

    const visEl = document.getElementById("qb-vis");
    const promptEl = document.getElementById("qb-prompt");
    const aEl = document.getElementById("qb-a");
    const bEl = document.getElementById("qb-b");
    const cEl = document.getElementById("qb-c");
    const correctEl = document.getElementById("qb-correct");
    const statusEl = document.getElementById("qb-status");
    document.getElementById("qb-save")?.setAttribute("data-global-skip", "1");
    document
      .getElementById("qb-publish")
      ?.setAttribute("data-global-skip", "1");
    document
      .getElementById("qb-unpublish")
      ?.setAttribute("data-global-skip", "1");

    function buildQuiz(published) {
      const id = "qz_" + String(Date.now()).slice(-8);
      return {
        id,
        title: (titleEl?.value || "").trim() || "Final Assessment",
        visibility: visEl?.value || "course",
        published: !!published,
        questions: [
          {
            id: "q1",
            title: "Question 1",
            prompt: (promptEl?.value || "").trim(),
            options: [
              `A. ${(aEl?.value || "").trim()}`,
              `B. ${(bEl?.value || "").trim()}`,
              `C. ${(cEl?.value || "").trim()}`,
            ],
            correct: Number(correctEl?.value || 0),
          },
        ],
        updatedAt: Date.now(),
      };
    }

    function load() {
      return storage.get("instructor_quiz_v1", buildQuiz(false));
    }

    function save(next) {
      storage.set("instructor_quiz_v1", next);
      if (statusEl)
        statusEl.textContent = next.published ? "Published" : "Unpublished";
    }

    const cur = load();
    if (titleEl) titleEl.value = cur.title || "Final Assessment";
    if (visEl) visEl.value = cur.visibility || "course";
    const q = cur.questions?.[0];
    if (q) {
      if (promptEl) promptEl.value = q.prompt || "";
      if (aEl) aEl.value = (q.options?.[0] || "").replace(/^A\.\s*/, "");
      if (bEl) bEl.value = (q.options?.[1] || "").replace(/^B\.\s*/, "");
      if (cEl) cEl.value = (q.options?.[2] || "").replace(/^C\.\s*/, "");
      if (correctEl) correctEl.value = String(q.correct ?? 0);
    }
    if (statusEl)
      statusEl.textContent = cur.published ? "Published" : "Unpublished";

    document.getElementById("qb-save")?.addEventListener("click", () => {
      const next = buildQuiz(cur.published);
      next.id = cur.id || next.id;
      save(next);
      toast("Saved");
    });

    document.getElementById("qb-publish")?.addEventListener("click", () => {
      const next = buildQuiz(true);
      next.id = cur.id || next.id;
      save(next);
      toast("Published");
    });

    document.getElementById("qb-unpublish")?.addEventListener("click", () => {
      const next = buildQuiz(false);
      next.id = cur.id || next.id;
      save(next);
      toast("Unpublished");
    });
  }

  function inboxStore() {
    const key = "instructor_inbox_v1";
    const seed = {
      items: [
        {
          id: "msg_1",
          ts: Date.now() - 55 * 60_000,
          type: "comment",
          title: "New comment on “Micro-interactions”",
          body: "A student replied with a question about haptics timing.",
          read: false,
          href: "../community/community_forum.html",
        },
        {
          id: "msg_2",
          ts: Date.now() - 3 * 60_000,
          type: "system",
          title: "Quiz ready to publish",
          body: "Your quiz has 1 question and 3 options. Publish when ready.",
          read: false,
          href: "../course_management/course_module_editor.html#quiz",
        },
        {
          id: "msg_3",
          ts: Date.now() - 2 * 3600_000,
          type: "order",
          title: "Order completed",
          body: "A checkout was completed. You can view the invoice in order history.",
          read: true,
          href: "../bookstore/order_history_download.html",
        },
      ],
    };
    const api = {
      get() {
        const cur = storage.get(key, null);
        if (cur && Array.isArray(cur.items)) return cur;
        storage.set(key, seed);
        return storage.get(key, seed);
      },
      set(next) {
        storage.set(key, next);
      },
      add(msg) {
        const cur = api.get();
        cur.items = cur.items || [];
        cur.items.unshift(msg);
        api.set(cur);
      },
      markAllRead() {
        const cur = api.get();
        cur.items.forEach((m) => (m.read = true));
        api.set(cur);
      },
    };
    return api;
  }

  function tasksStore() {
    const key = "instructor_tasks_v1";
    const seed = {
      items: [
        {
          id: "t1",
          ts: Date.now() - 2 * 3600_000,
          title: "Review lesson draft",
          status: "open",
          href: "../course_management/lesson_editor.html",
        },
        {
          id: "t2",
          ts: Date.now() - 40 * 60_000,
          title: "Publish quiz for Module 1",
          status: "open",
          href: "../course_management/course_module_editor.html#quiz",
        },
        {
          id: "t3",
          ts: Date.now() - 6 * 3600_000,
          title: "Export student progress report",
          status: "done",
          href: "../analytics/download_reports.html",
        },
      ],
    };
    const api = {
      get() {
        const cur = storage.get(key, null);
        if (cur && Array.isArray(cur.items)) return cur;
        storage.set(key, seed);
        return storage.get(key, seed);
      },
      set(next) {
        storage.set(key, next);
      },
      add(title, href) {
        const cur = api.get();
        cur.items = cur.items || [];
        cur.items.unshift({
          id: "t_" + String(Date.now()).slice(-8),
          ts: Date.now(),
          title,
          status: "open",
          href: href || "",
        });
        api.set(cur);
      },
      toggle(id) {
        const cur = api.get();
        const t = cur.items.find((x) => x.id === id);
        if (!t) return;
        t.status = t.status === "done" ? "open" : "done";
        api.set(cur);
      },
    };
    return api;
  }

  function settingsStore() {
    const key = "instructor_settings_v1";
    const seed = {
      notificationsEnabled: true,
      defaultCourseFilter: "All Status",
      downloadFormat: "Auto",
    };
    const api = {
      get() {
        const cur = storage.get(key, null);
        if (cur && typeof cur === "object") return { ...seed, ...cur };
        storage.set(key, seed);
        return storage.get(key, seed);
      },
      set(next) {
        storage.set(key, next);
      },
      reset() {
        storage.set(key, seed);
      },
    };
    return api;
  }

  function wireInbox() {
    const h1 = findH1ByExactTitle("inbox");
    if (!h1) return;
    const list = document.getElementById("inbox-list");
    const search = document.getElementById("inbox-search");
    const compose = document.getElementById("inbox-compose");
    const markAll = document.getElementById("inbox-mark-all");
    if (!list) return;

    const store = inboxStore();
    function render() {
      const q = (search?.value || "").trim().toLowerCase();
      const cur = store.get();
      const items = (cur.items || []).filter((m) => {
        if (!q) return true;
        const t = `${m.title} ${m.body}`.toLowerCase();
        return t.includes(q);
      });
      list.innerHTML = items
        .map((m) => {
          const unread = !m.read;
          return `
          <div class="border border-slate-200 rounded-2xl p-4 bg-white flex gap-4 items-start ${unread ? "ring-1 ring-violet-200" : ""}" data-id="${m.id}">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <span class="material-symbols-outlined">${m.type === "order" ? "receipt_long" : m.type === "comment" ? "chat_bubble" : "info"}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-3">
                <div class="font-black truncate">${m.title}</div>
                ${unread ? '<span class="text-[10px] font-black uppercase tracking-widest text-violet-600">unread</span>' : ""}
              </div>
              <div class="text-sm text-slate-600 mt-1">${m.body}</div>
              <div class="mt-3 flex gap-2 flex-wrap">
                <button class="px-4 py-2 rounded-xl bg-slate-100 font-black hover:bg-slate-200" data-act="open">Open</button>
                <button class="px-4 py-2 rounded-xl bg-white border border-slate-200 font-black hover:bg-slate-50" data-act="toggle">${unread ? "Mark read" : "Mark unread"}</button>
                <button class="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-black hover:bg-rose-50" data-act="delete">Delete</button>
              </div>
            </div>
          </div>
        `;
        })
        .join("");
    }

    search?.addEventListener("input", render);
    markAll?.addEventListener("click", () => {
      store.markAllRead();
      render();
      toast("All read");
    });
    compose?.addEventListener("click", () => {
      modal({
        title: "Compose",
        primaryText: "Send",
        secondaryText: "Cancel",
        bodyHtml: `
          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-600">Title</label>
            <input id="in-title" class="w-full rounded-xl border-slate-200" />
            <label class="block text-xs font-bold text-slate-600">Message</label>
            <textarea id="in-body" class="w-full rounded-xl border-slate-200 min-h-24"></textarea>
          </div>
        `,
        onPrimary: () => {
          const t = (document.getElementById("in-title")?.value || "").trim();
          const b = (document.getElementById("in-body")?.value || "").trim();
          if (!t || !b) return toast("Title and message required");
          store.add({
            id: "msg_" + String(Date.now()).slice(-8),
            ts: Date.now(),
            type: "system",
            title: t,
            body: b,
            read: false,
            href: "",
          });
          render();
          toast("Sent");
        },
      });
    });

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const card = btn.closest("[data-id]");
      const id = card?.getAttribute("data-id");
      if (!id) return;
      const cur = store.get();
      const msg = cur.items.find((x) => x.id === id);
      if (!msg) return;
      const act = btn.getAttribute("data-act");
      if (act === "open") {
        msg.read = true;
        store.set(cur);
        if (msg.href) window.location.href = msg.href;
        else toast("Opened");
      }
      if (act === "toggle") {
        msg.read = !msg.read;
        store.set(cur);
        render();
      }
      if (act === "delete") {
        cur.items = cur.items.filter((x) => x.id !== id);
        store.set(cur);
        render();
        toast("Deleted");
      }
    });

    render();
  }

  function wireTasks() {
    const h1 = findH1ByExactTitle("tasks");
    if (!h1) return;
    const list = document.getElementById("tasks-list");
    const newBtn = document.getElementById("tasks-new");
    if (!list) return;

    const store = tasksStore();
    let active = "all";

    function setActive(btn) {
      const group = btn.closest("div");
      const bs = Array.from(group?.querySelectorAll("button") || []);
      bs.forEach((b) => {
        const is = b === btn;
        b.classList.toggle("text-slate-500", !is);
      });
    }

    function render() {
      const cur = store.get();
      const items = (cur.items || []).filter(
        (t) => active === "all" || t.status === active,
      );
      list.innerHTML = items
        .map((t) => {
          const done = t.status === "done";
          return `
          <div class="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4" data-id="${t.id}">
            <button class="mt-1 w-7 h-7 rounded-lg border ${done ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}" data-act="toggle"></button>
            <div class="flex-1">
              <div class="font-black ${done ? "line-through text-slate-400" : ""}">${t.title}</div>
              <div class="mt-3 flex gap-2 flex-wrap">
                <button class="px-4 py-2 rounded-xl bg-slate-100 font-black hover:bg-slate-200" data-act="open">Open</button>
                <button class="px-4 py-2 rounded-xl bg-white border border-slate-200 font-black hover:bg-slate-50" data-act="edit">Edit</button>
                <button class="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-black hover:bg-rose-50" data-act="delete">Delete</button>
              </div>
            </div>
          </div>
        `;
        })
        .join("");
    }

    newBtn?.addEventListener("click", () => {
      modal({
        title: "New task",
        primaryText: "Create",
        secondaryText: "Cancel",
        bodyHtml: `<input id="tk-title" class="w-full rounded-xl border-slate-200" placeholder="Task title" />`,
        onPrimary: () => {
          const t = (document.getElementById("tk-title")?.value || "").trim();
          if (!t) return toast("Title required");
          store.add(t, "");
          render();
          toast("Created");
        },
      });
    });

    document.querySelectorAll("button[data-filter]").forEach((b) =>
      b.addEventListener("click", () => {
        active = b.getAttribute("data-filter") || "all";
        setActive(b);
        render();
      }),
    );

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const card = btn.closest("[data-id]");
      const id = card?.getAttribute("data-id");
      if (!id) return;
      const act = btn.getAttribute("data-act");
      const cur = store.get();
      const t = cur.items.find((x) => x.id === id);
      if (!t) return;

      if (act === "toggle") {
        store.toggle(id);
        render();
        return;
      }
      if (act === "open") {
        if (t.href) window.location.href = t.href;
        else toast("Opened");
        return;
      }
      if (act === "edit") {
        modal({
          title: "Edit task",
          primaryText: "Save",
          secondaryText: "Cancel",
          bodyHtml: `<input id="tk-edit" class="w-full rounded-xl border-slate-200" value="${t.title.replace(/"/g, "&quot;")}" />`,
          onPrimary: () => {
            t.title = (document.getElementById("tk-edit")?.value || "").trim();
            store.set(cur);
            render();
            toast("Saved");
          },
        });
        return;
      }
      if (act === "delete") {
        cur.items = cur.items.filter((x) => x.id !== id);
        store.set(cur);
        render();
        toast("Deleted");
      }
    });

    render();
  }

  function wireSettings() {
    const h1 = findH1ByExactTitle("settings");
    if (!h1) return;
    const store = settingsStore();
    const cur = store.get();

    const notifs = document.getElementById("set-notifs");
    const courseFilter = document.getElementById("set-course-filter");
    const dl = document.getElementById("set-download-format");
    const save = document.getElementById("set-save");
    const reset = document.getElementById("set-reset");

    function renderNotifs() {
      if (!notifs) return;
      notifs.classList.toggle("bg-violet-600", !!cur.notificationsEnabled);
      notifs.classList.toggle("bg-slate-300", !cur.notificationsEnabled);
      const knob = notifs.querySelector("div");
      if (knob)
        knob.classList.toggle("translate-x-6", !!cur.notificationsEnabled);
    }
    if (courseFilter)
      courseFilter.value = cur.defaultCourseFilter || "All Status";
    if (dl) dl.value = cur.downloadFormat || "Auto";
    renderNotifs();

    notifs?.addEventListener("click", () => {
      cur.notificationsEnabled = !cur.notificationsEnabled;
      renderNotifs();
    });
    save?.addEventListener("click", () => {
      cur.defaultCourseFilter = courseFilter?.value || "All Status";
      cur.downloadFormat = dl?.value || "Auto";
      store.set(cur);
      toast("Saved");
    });
    reset?.addEventListener("click", () => {
      store.reset();
      window.location.reload();
    });
  }

  function wireRosterFilters() {
    const filterBar = document.querySelector(
      "div.bg-surface-container-low.p-2",
    );
    const tableBody = document.getElementById("studentTableBody");
    if (!filterBar || !tableBody) return;

    const tabButtons = Array.from(filterBar.querySelectorAll("button")).slice(
      0,
      4,
    );
    const moreFiltersBtn =
      filterBar
        .querySelector("button span.material-symbols-outlined")
        ?.closest("button") || null;

    // Prevent the global capture-phase "Filters" modal (triggered by filter_list/tune icons)
    // from hijacking the roster's own filter controls.
    tabButtons.forEach((b) => b.setAttribute("data-global-skip", "1"));
    moreFiltersBtn?.setAttribute("data-global-skip", "1");

    const filterState = {
      status: "all", // all | active | completed | onbreak
      course: "",
      minProgress: 0,
      keyword: "",
    };

    // If user opened this page from "View Progress" on a specific course,
    // only show learners who are in that course.
    const params = new URLSearchParams(window.location.search);
    const lockedCourse = (
      params.get("course") ||
      params.get("coursePath") ||
      ""
    )
      .replace(/\s+/g, " ")
      .trim();
    const hasLockedCourse = !!lockedCourse;
    if (hasLockedCourse) filterState.course = lockedCourse;

    const paginationControls = document.getElementById("paginationControls");
    const pageButtons = Array.from(
      paginationControls?.querySelectorAll("button.pageNum") || [],
    );

    // Use the existing markup pagination groups (roster-page-1/2/3) as the paging skeleton.
    // This makes page switches meaningful even when a status filter results are small.
    const rowsAll = Array.from(tableBody.querySelectorAll("tr"));
    const pageCount = Math.max(
      1,
      rowsAll.reduce((mx, row) => {
        const m = Array.from(row.classList)
          .join(" ")
          .match(/roster-page-(\d+)/);
        const n = m ? Number(m[1]) : 1;
        return Number.isFinite(n) ? Math.max(mx, n) : mx;
      }, 1),
    );

    const baseHidden = new WeakMap(); // row -> whether it belongs to the current roster-page-x

    let currentPage = 1;
    const initialActive =
      pageButtons.find((b) => b.classList.contains("bg-primary")) ||
      pageButtons[0];
    if (initialActive) {
      const n = Number(
        initialActive.getAttribute("data-page") ||
          initialActive.textContent ||
          1,
      );
      currentPage = Number.isFinite(n) ? n : 1;
    }
    currentPage = Math.min(Math.max(1, currentPage), pageCount);

    function syncBaseHiddenForPage() {
      rowsAll.forEach((row) => {
        const m = Array.from(row.classList)
          .join(" ")
          .match(/roster-page-(\d+)/);
        const n = m ? Number(m[1]) : 1;
        baseHidden.set(row, n === currentPage);
      });
    }

    function setActivePageButton() {
      pageButtons.forEach((b) => {
        const n = Number(b.getAttribute("data-page") || b.textContent || 0);
        const shouldHide = Number.isFinite(n) && n > pageCount;
        const active = Number.isFinite(n) && n === currentPage;
        b.classList.toggle("hidden", shouldHide);
        b.classList.toggle("bg-primary", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("hover:bg-white", !active);
        b.classList.toggle("text-slate-600", !active);
      });
    }

    function setPage(nextPage) {
      const p = Math.min(Math.max(1, Number(nextPage) || 1), pageCount);
      currentPage = p;
      syncBaseHiddenForPage();
      setActivePageButton();
      applyFilters();
    }

    // Wire pagination controls (prev/next + numeric).
    if (paginationControls) {
      paginationControls
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("data-global-skip", "1"));
      paginationControls.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const dp = (btn.getAttribute("data-page") || "").trim();
        if (!dp) return;
        if (dp === "prev") return setPage(currentPage - 1);
        if (dp === "next") return setPage(currentPage + 1);
        const n = Number(dp);
        if (Number.isFinite(n)) return setPage(n);
      });
    }

    // Initial page sync (roster-page skeleton)
    syncBaseHiddenForPage();
    setActivePageButton();

    function getRowStatus(row) {
      // Status pill is in the 6th cell (index 5). Do not grab the first "rounded-full"
      // because the Course Path pill also uses rounded-full.
      const statusCell = row.querySelectorAll("td")[5];
      const badge = statusCell?.querySelector("span.rounded-full") || null;
      const t = (badge?.textContent || statusCell?.textContent || "")
        .trim()
        .toLowerCase();
      if (t.includes("completed")) return "completed";
      if (t.includes("on break")) return "onbreak";
      if (t.includes("active")) return "active";
      return "all";
    }

    function getRowCourse(row) {
      // "Course Path" pill is in the 4th cell (index 3)
      const courseCell = row.querySelectorAll("td")[3];
      return (courseCell?.textContent || "").replace(/\s+/g, " ").trim();
    }

    function getRowProgress(row) {
      // Extract first percentage like "84%" from the progress cell
      const progressCell = row.querySelectorAll("td")[4];
      const txt = (progressCell?.textContent || "").replace(/\s+/g, " ");
      const m = txt.match(/(\d{1,3})\s*%/);
      const n = m ? Number(m[1]) : 0;
      return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
    }

    function setActiveTab(activeIdx) {
      tabButtons.forEach((b, i) => {
        if (i === activeIdx) {
          b.classList.add("bg-white", "text-primary", "shadow-sm");
          b.classList.remove("text-slate-600");
        } else {
          b.classList.remove("bg-white", "text-primary", "shadow-sm");
          b.classList.add("text-slate-600");
        }
      });
    }

    function applyFilters() {
      const rows = rowsAll;
      const norm = (v) => (v || "").replace(/\s+/g, " ").trim().toLowerCase();
      let shown = 0;
      let totalMatches = 0;

      rows.forEach((row) => {
        const status = getRowStatus(row);
        const course = getRowCourse(row);
        const progress = getRowProgress(row);
        const text = (row.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        const statusOk =
          filterState.status === "all" || status === filterState.status;
        const courseOk =
          !filterState.course || norm(course) === norm(filterState.course);
        const progressOk = progress >= (filterState.minProgress || 0);
        const keywordOk =
          !filterState.keyword || text.includes(filterState.keyword);
        const filtersOk = statusOk && courseOk && progressOk && keywordOk;

        if (filtersOk) totalMatches += 1;

        const baseOk = baseHidden.get(row) === true;
        const show = filtersOk && baseOk;
        row.classList.toggle("hidden", !show);
        if (show) shown += 1;
      });

      const tally = document.getElementById("paginationTally");
      if (tally) {
        tally.innerHTML = `Showing <span class="font-bold text-slate-900">${shown}</span> of <span class="font-bold text-slate-900">${totalMatches}</span> students`;
      }

      paginationControls?.classList.remove("hidden");
    }

    const tabKinds = ["all", "active", "completed", "onbreak"];
    tabButtons.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        setActiveTab(idx);
        filterState.status = tabKinds[idx];
        currentPage = 1;
        syncBaseHiddenForPage();
        setActivePageButton();
        applyFilters();
      });
    });

    moreFiltersBtn?.addEventListener("click", () => {
      modal({
        title: "More Filters",
        primaryText: "Apply",
        secondaryText: "Reset",
        bodyHtml: `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600">Keyword</label>
              <input id="mf-keyword" class="w-full rounded-xl border-slate-200" placeholder="Type to filter..." value="${(filterState.keyword || "").replace(/"/g, "&quot;")}" />
            </div>
            <label class="block text-xs font-bold text-slate-600">Course Path</label>
            <select id="mf-course" class="w-full rounded-xl border-slate-200" ${hasLockedCourse ? "disabled" : ""}>
              <option value="">All</option>
              <option>Web Technology</option>
              <option>Algorithm and Design Complexity</option>
              <option>Human Computer Interaction</option>
            </select>
            <label class="block text-xs font-bold text-slate-600">Min Progress</label>
            <input id="mf-progress" type="range" min="0" max="100" value="0" class="w-full" />
            <div class="flex items-center justify-between">
              <p class="text-xs text-slate-500">Applies client-side to the roster table.</p>
              <p class="text-xs font-bold text-slate-700"><span id="mf-progress-val">0</span>%</p>
            </div>
          </div>
        `,
        onPrimary: () => {
          const kw = (document.getElementById("mf-keyword")?.value || "")
            .trim()
            .toLowerCase();
          const selectedCourse = (
            document.getElementById("mf-course")?.value || ""
          ).trim();
          const minProgress =
            Number(document.getElementById("mf-progress")?.value || 0) || 0;
          filterState.keyword = kw;
          filterState.course = hasLockedCourse ? lockedCourse : selectedCourse;
          filterState.minProgress = Math.max(0, Math.min(100, minProgress));
          currentPage = 1;
          syncBaseHiddenForPage();
          setActivePageButton();
          applyFilters();
        },
        onSecondary: () => {
          filterState.course = hasLockedCourse ? lockedCourse : "";
          filterState.minProgress = 0;
          filterState.keyword = "";
          currentPage = 1;
          syncBaseHiddenForPage();
          setActivePageButton();
          applyFilters();
        },
      });

      // Post-modal wiring
      setTimeout(() => {
        const courseEl = document.getElementById("mf-course");
        const progEl = document.getElementById("mf-progress");
        const progVal = document.getElementById("mf-progress-val");
        if (courseEl) courseEl.value = filterState.course || "";
        if (progEl) progEl.value = String(filterState.minProgress || 0);
        if (progVal) progVal.textContent = String(filterState.minProgress || 0);
        progEl?.addEventListener("input", () => {
          const v = Number(progEl.value || 0) || 0;
          if (progVal) progVal.textContent = String(v);
        });
      }, 0);
    });

    // Initial render: ensure filters are consistent with default tab UI.
    applyFilters();
  }

  function wireRosterExportEnroll() {
    const header = document.querySelector("header");
    if (!header) return;

    const exportBtn = Array.from(header.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("export csv"),
    );
    const enrollBtn = Array.from(header.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("enroll student"),
    );

    exportBtn?.addEventListener("click", () => {
      const rows = Array.from(
        document.querySelectorAll("#studentTableBody tr"),
      ).filter((r) => !r.classList.contains("hidden"));
      const data = rows.map((r) => {
        const cells = Array.from(r.querySelectorAll("td")).map((td) =>
          (td.textContent || "").replace(/\s+/g, " ").trim(),
        );
        return {
          student: cells[0] || "",
          contact: cells[1] || "",
          enrollment: cells[2] || "",
          course: cells[3] || "",
          progress: (cells[4] || "").replace(/\s+/g, " ").trim(),
          status: cells[5] || "",
        };
      });

      const headerRow = [
        "Student",
        "Contact",
        "Enrollment",
        "Course Path",
        "Progress",
        "Status",
      ];
      const csv = [headerRow.join(",")]
        .concat(
          data.map((d) =>
            [d.student, d.contact, d.enrollment, d.course, d.progress, d.status]
              .map(csvEscape)
              .join(","),
          ),
        )
        .join("\n");
      downloadText("student_roster.csv", csv, "text/csv");
      toast("CSV exported");
    });

    enrollBtn?.addEventListener("click", () => {
      modal({
        title: "Enroll Student",
        primaryText: "Enroll",
        bodyHtml: `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Student name</label>
              <input id="enroll-name" class="w-full rounded-xl border-slate-200" placeholder="e.g. Taylor Nguyen" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Email</label>
              <input id="enroll-email" type="email" class="w-full rounded-xl border-slate-200" placeholder="e.g. taylor@student.uts.edu.my" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Course path</label>
              <select id="enroll-course" class="w-full rounded-xl border-slate-200">
                <option>UX Design Master</option>
                <option>Fullstack JS</option>
                <option>UI Engineering</option>
              </select>
            </div>
            <p class="text-xs text-slate-500">This updates the roster in this browser only.</p>
          </div>
        `,
        onPrimary: () => {
          const nameInput = document.getElementById("enroll-name");
          const emailInput = document.getElementById("enroll-email");
          const name = nameInput?.value?.trim();
          const email = emailInput?.value?.trim();
          const course =
            document.getElementById("enroll-course")?.value ||
            "UX Design Master";

          if (!name || !email) {
            toast("Please fill in all required fields");
            if (!name && nameInput) nameInput.classList.add("border-error");
            if (!email && emailInput) emailInput.classList.add("border-error");
            return false;
          }

          const tbody = document.getElementById("studentTableBody");
          if (!tbody) return;

          const row = document.createElement("tr");
          row.className =
            "hover:bg-slate-50/80 transition-colors group roster-page-1";
          row.innerHTML = `
            <td class="px-8 py-5">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600">${name
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0] || "N")
                  .join("")
                  .toUpperCase()}</div>
                <div>
                  <p class="font-headline font-bold text-slate-900">${name}</p>
                  <p class="text-[11px] font-label text-slate-400">ID: UTS${Math.floor(10000000 + Math.random() * 90000000)}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-5 text-sm font-body text-slate-600">${email}</td>
            <td class="px-6 py-5 text-sm font-body text-slate-600">${new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}</td>
            <td class="px-6 py-5"><span class="text-xs font-bold font-label bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full">${course}</span></td>
            <td class="px-6 py-5">
              <div class="w-full max-w-[100px]">
                <div class="flex items-center justify-between mb-1.5"><span class="text-[10px] font-bold text-primary font-label">0%</span></div>
                <div class="h-1.5 w-full bg-surface-container rounded-full overflow-hidden"><div class="h-full bg-primary w-[0%] rounded-full"></div></div>
              </div>
            </td>
            <td class="px-6 py-5"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Active</span></td>
            <td class="px-8 py-5 text-right"><button type="button" data-global-skip="1" class="sr-student-actions inline-flex p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-colors" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><span class="material-symbols-outlined">more_vert</span></button></td>
          `;
          tbody.prepend(row);
          toast(`Enrolled: ${name}`);
        },
      });
    });
  }

  function wireStudentRowNavigation() {
    const tbody = document.getElementById("studentTableBody");
    if (!tbody) return;

    function rosterRowNameId(row) {
      const name = (
        row.querySelector("td p.font-headline")?.textContent ||
        row.querySelector("td span.font-bold")?.textContent ||
        "Student"
      ).trim();
      const idText = (
        row.querySelector("td p.text-slate-400")?.textContent || ""
      ).trim();
      const id = (idText.match(/#ST-\d+/) || [])[0] || "";
      return { name, id };
    }

    tbody.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      const icon = e.target.closest(".material-symbols-outlined");
      if (icon && (icon.textContent || "").trim() === "more_vert") {
        const btn = icon.closest("button.sr-student-actions");
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const { name, id } = rosterRowNameId(row);
        const key = `${name}|${id}`;
        const existing = document.getElementById("sr-student-row-menu");
        if (existing?.dataset.key === key) {
          existing.remove();
          document
            .querySelectorAll(".sr-student-actions")
            .forEach((b) => b.setAttribute("aria-expanded", "false"));
          return;
        }
        existing?.remove();

        const menu = document.createElement("div");
        menu.id = "sr-student-row-menu";
        menu.dataset.key = key;
        menu.setAttribute("role", "menu");
        menu.className =
          "fixed z-[250] min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-2xl shadow-slate-900/15 text-sm overflow-hidden";
        menu.innerHTML = `
          <button type="button" role="menuitem" data-act="kick" class="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 font-medium">Kick User</button>
        `;
        document.body.appendChild(menu);

        const rect = btn.getBoundingClientRect();
        const mw = menu.offsetWidth || 176;
        const mh = menu.offsetHeight || 88;
        let top = rect.bottom + 6;
        if (top + mh > window.innerHeight - 8)
          top = Math.max(8, rect.top - mh - 6);
        let left = rect.right - mw;
        if (left < 8) left = 8;
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;

        document
          .querySelectorAll(".sr-student-actions")
          .forEach((b) => b.setAttribute("aria-expanded", "false"));
        btn.setAttribute("aria-expanded", "true");

        function closeMenu() {
          menu.remove();
          document
            .querySelectorAll(".sr-student-actions")
            .forEach((b) => b.setAttribute("aria-expanded", "false"));
          document.removeEventListener("click", onDoc, true);
          document.removeEventListener("keydown", onKey, true);
        }

        function onDoc(ev) {
          if (menu.contains(ev.target) || btn.contains(ev.target)) return;
          closeMenu();
        }

        function onKey(ev) {
          if (ev.key === "Escape") closeMenu();
        }

        menu
          .querySelector('[data-act="kick"]')
          ?.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            closeMenu();
            if (
              !window.confirm(
                `Kick ${name} from this course? (Removed in this browser only.)`,
              )
            )
              return;
            row.remove();
            toast("User kicked from course");
          });

        requestAnimationFrame(() => {
          document.addEventListener("click", onDoc, true);
          document.addEventListener("keydown", onKey, true);
        });
        return;
      }

      if (typeof window.showToast === "function") {
        window.showToast("Open student progress from the dashboard; profile details page is disabled.", "info");
      } else {
        window.alert("Profile details page is disabled in this build.");
      }
    });
  }

  function wireStudentDetailsDynamicHeader() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const id = params.get("id");
    if (!name && !id) return;

    // Update document title
    if (name) document.title = `${name} | Student Details`;

    // Breadcrumb last label
    const crumb = Array.from(
      document.querySelectorAll("div.text-on-surface-variant span"),
    ).find((s) => (s.textContent || "").toLowerCase().includes("profile"));
    if (crumb && name) crumb.textContent = `${name} Profile`;

    // Header name (first large name-like heading in header card)
    const header = document.querySelector("header");
    const candidate = header?.querySelector("h1, h2, h3");
    if (candidate && name) candidate.textContent = name;

    // ID chip (first element containing "ID:" text)
    const idEl = Array.from(document.querySelectorAll("p, span")).find((el) =>
      (el.textContent || "").includes("ID:"),
    );
    if (idEl && id) idEl.textContent = `ID: ${id}`;
  }

  function wireCourseBuilderToggles() {
    // Make toggle pills actually toggle on/off visuals and show toast
    const toggleButtons = Array.from(
      document.querySelectorAll("button.w-12.h-6.rounded-full"),
    );
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const isOn = btn.classList.contains("bg-primary");
        btn.classList.toggle("bg-primary", !isOn);
        btn.classList.toggle("bg-surface-container-highest", isOn);
        const knob = btn.querySelector("div");
        if (knob) {
          knob.classList.toggle("translate-x-6", !isOn);
        }
        toast(`Setting updated: ${!isOn ? "On" : "Off"}`);
      });
    });

    // Category "New" tag button
    const newTagBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim().toLowerCase() === "new",
    );

    // Tag removal logic
    const handleTagClick = (tagEl) => {
      const tagName = tagEl.textContent.trim();
      modal({
        title: "Remove Tag?",
        primaryText: "Remove",
        secondaryText: "Cancel",
        bodyHtml: `<p class="text-sm text-slate-600">Are you sure you want to remove the <b>${tagName}</b> tag?</p>`,
        onPrimary: () => {
          tagEl.remove();
          toast(`Tag removed: ${tagName}`);
        },
      });
    };

    // Attach to existing tags
    const container = newTagBtn?.closest("div.flex.flex-wrap.gap-2");
    container?.querySelectorAll("button:not(:last-child)").forEach((btn) => {
      if (!btn.querySelector(".material-symbols-outlined")) {
        btn.addEventListener("click", () => handleTagClick(btn));
      }
    });

    newTagBtn?.addEventListener("click", () => {
      modal({
        title: "Add Category Tag",
        primaryText: "Add",
        bodyHtml: `
          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-600">Tag name</label>
            <input id="new-tag-name" class="w-full rounded-xl border-slate-200" placeholder="e.g. Accessibility" />
          </div>
        `,
        onPrimary: () => {
          const name = document.getElementById("new-tag-name")?.value?.trim();
          if (!name) return toast("Tag name required");
          const pill = document.createElement("button");
          pill.type = "button";
          pill.className =
            "px-3 py-1 bg-white text-primary text-xs font-bold rounded-full font-label shadow-sm border border-primary/5 hover:bg-primary/5 active:scale-95 transition-all";
          pill.textContent = name;
          pill.addEventListener("click", () => handleTagClick(pill));
          container?.insertBefore(pill, newTagBtn);
          toast(`Tag added: ${name}`);
        },
      });
    });

    // Module edit/delete buttons (Module 1 card in builder)
    const moduleCard = Array.from(document.querySelectorAll("h3"))
      .find((h) => (h.textContent || "").toLowerCase().includes("module 1"))
      ?.closest("div.bg-surface-container-lowest");
    if (moduleCard) {
      const iconButtons = Array.from(moduleCard.querySelectorAll("button"));
      const editBtn = iconButtons.find(
        (b) =>
          (
            b.querySelector(".material-symbols-outlined")?.textContent || ""
          ).trim() === "edit",
      );
      const delBtn = iconButtons.find(
        (b) =>
          (
            b.querySelector(".material-symbols-outlined")?.textContent || ""
          ).trim() === "delete",
      );

      editBtn?.addEventListener("click", () => {
        modal({
          title: "Edit Module",
          primaryText: "Save",
          bodyHtml: `
            <div class="space-y-4">
              <label class="block text-xs font-bold text-slate-600">Module title</label>
              <input id="cb-mod-title" class="w-full rounded-xl border-slate-200" value="Module 1: Foundations of UI Design" />
            </div>
          `,
          onPrimary: () => {
            const v = (
              document.getElementById("cb-mod-title")?.value || ""
            ).trim();
            const h = moduleCard.querySelector("h3");
            if (h && v) h.textContent = v;
            toast("Module updated");
          },
        });
      });

      delBtn?.addEventListener("click", () => {
        modal({
          title: "Delete Module",
          primaryText: "Delete",
          secondaryText: "Cancel",
          bodyHtml: `<div class="text-sm text-slate-600">This removes the module from the current view in this browser.</div>`,
          onPrimary: () => {
            moduleCard.remove();
            toast("Module deleted");
          },
        });
      });
    }
  }

  /**
   * Course editor: Save as Draft / Publish Course.
   * Demo: persist to localStorage + success modal → My Courses (B).
   * Optional API: set window.CE_INSTRUCTOR_COURSE_API_BASE = 'https://your.api'; POST /courses JSON { title, status }
   * → JSON { redirectUrl?: string } navigates there when present.
   */
  function wireCourseEditorCreateFlow() {
    if (getPageKey() !== "course_editor") return;

    const titleInput = document.getElementById("ce-instructor-course-title");
    const mainRoot = document.getElementById("ce-course-editor-main");
    const actionRow = mainRoot?.querySelector(".pt-10.flex.gap-4");
    const buttons = actionRow
      ? Array.from(actionRow.querySelectorAll("button"))
      : [];
    const draftBtn = buttons.find((b) =>
      (b.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .includes("save as draft"),
    );
    const publishBtn = buttons.find((b) =>
      (b.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .includes("publish course"),
    );
    if (!draftBtn && !publishBtn) return;

    function courseTitle() {
      const t = (titleInput?.value || "").trim();
      if (t) return t;
      const fallback =
        document.getElementById("ce-module-title-input")?.value?.trim() ||
        mainRoot?.querySelector("input.font-bold.text-lg")?.value?.trim();
      return fallback || "Untitled course";
    }

    function pushLocalCourse(status) {
      const id = `course_${Date.now()}`;
      const title = courseTitle();
      const cur = storage.get(CREATED_COURSES_KEY, { courses: [] });
      cur.courses = Array.isArray(cur.courses) ? cur.courses : [];
      cur.courses.unshift({ id, title, status, createdAt: Date.now() });
      storage.set(CREATED_COURSES_KEY, cur);
      return { id, title, status };
    }

    async function tryApiCreate(payload) {
      const base =
        typeof window !== "undefined" && window.CE_INSTRUCTOR_COURSE_API_BASE
          ? String(window.CE_INSTRUCTOR_COURSE_API_BASE).trim()
          : "";
      if (!base) return null;
      const url = `${base.replace(/\/$/, "")}/courses`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return { ok: true };
      return res.json();
    }

    function finishSuccess(statusLabel, usedApiRedirect) {
      if (usedApiRedirect) return;
      modal({
        title: statusLabel === "Published" ? "Course published" : "Draft saved",
        primaryText: "Go to My Courses",
        secondaryText: "Stay in editor",
        bodyHtml: `<p class="text-sm text-slate-600">You can view and manage it under My Courses.</p>`,
        onPrimary: () => navigateToMyCourses("created=1"),
      });
    }

    async function handleSubmit(status) {
      const title = courseTitle();
      if (!title || title.length < 2) {
        toast("Please enter a course title (at least 2 characters).");
        titleInput?.focus();
        return;
      }
      const payload = {
        title,
        status: status === "published" ? "Published" : "Draft",
      };
      try {
        const apiResult = await tryApiCreate(payload);
        if (apiResult && apiResult.redirectUrl) {
          window.location.href = String(apiResult.redirectUrl);
          return;
        }
      } catch {
        // fall through to local demo
      }
      pushLocalCourse(payload.status);
      finishSuccess(payload.status, false);
    }

    draftBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      void handleSubmit("draft");
    });
    publishBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      void handleSubmit("published");
    });
  }

  function wireCourseModuleEditorNotes() {
    if (getPageKey() !== "course_module_editor") return;
    const editorSurface = document.querySelector(
      "div.bg-surface-container-lowest.rounded-xl.min-h-\\[600px\\]",
    );
    if (!editorSurface) return;

    const typeBar = editorSurface.querySelector("div.grid.grid-cols-3");
    const buttons = typeBar
      ? Array.from(typeBar.querySelectorAll("button"))
      : [];
    if (buttons.length < 3) return;

    const videoBtn = buttons[0];
    const notesBtn = buttons[1];
    const quizBtn = buttons[2];

    // mark as handled
    [videoBtn, notesBtn, quizBtn].forEach((b) =>
      b?.setAttribute("data-global-skip", "1"),
    );

    let view = "video";
    const key = "instructor_notes_v1";

    function ensureNotesUI() {
      let host = editorSurface.querySelector("#notes-editor-host");
      if (host) return host;
      host = document.createElement("div");
      host.id = "notes-editor-host";
      host.className = "hidden p-8 space-y-6";
      host.innerHTML = `
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes Editor</p>
            <h3 class="text-2xl font-black mt-1">Lesson Notes</h3>
            <p class="text-sm text-slate-600 mt-2">Write structured notes for students. Saved locally.</p>
          </div>
          <div class="flex gap-2">
            <button id="notes-save" class="px-4 py-2 rounded-xl bg-slate-900 text-white font-black hover:bg-black">Save</button>
            <button id="notes-export" class="px-4 py-2 rounded-xl bg-white border border-slate-200 font-black hover:bg-slate-50">Export</button>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white border border-slate-200 rounded-2xl p-4">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Markdown</label>
            <textarea id="notes-md" class="mt-3 w-full rounded-xl border-slate-200 min-h-64" placeholder="# Key points\\n- ..."></textarea>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl p-4">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Preview</label>
            <div id="notes-preview" class="mt-3 prose prose-slate max-w-none text-sm"></div>
          </div>
        </div>
      `;
      // insert before footer quick settings area
      const canvas =
        editorSurface.querySelector("div.p-8.space-y-8") || editorSurface;
      canvas.parentElement?.insertBefore(host, canvas.nextSibling);
      return host;
    }

    function mdToHtml(md) {
      const esc = (s) =>
        s
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
      const lines = (md || "").split("\\n");
      const out = [];
      for (const line of lines) {
        const l = line.trimEnd();
        if (l.startsWith("### ")) out.push(`<h4>${esc(l.slice(4))}</h4>`);
        else if (l.startsWith("## ")) out.push(`<h3>${esc(l.slice(3))}</h3>`);
        else if (l.startsWith("# ")) out.push(`<h2>${esc(l.slice(2))}</h2>`);
        else if (l.startsWith("- ")) out.push(`<li>${esc(l.slice(2))}</li>`);
        else if (!l.trim()) out.push(`<div class="h-2"></div>`);
        else out.push(`<p>${esc(l)}</p>`);
      }
      // wrap loose li's (safe, non-regex)
      const html = out.join("\n");
      if (!html.includes("<li>")) return html;
      return html
        .replaceAll("</li>\n<li>", "</li><li>")
        .replaceAll("<li>", "<ul><li>")
        .replaceAll("</li>", "</li></ul>");
    }

    function setActive(btn) {
      buttons.forEach((b) => {
        const act = b === btn;
        b.classList.toggle("border-b-4", act);
        b.classList.toggle("border-primary", act);
        b.classList.toggle("bg-primary/5", act);
        b.classList.toggle("text-primary", act);
        b.classList.toggle("text-slate-400", !act);
      });
    }

    function show(viewName) {
      view = viewName;
      const videoCanvas = editorSurface.querySelector("div.p-8.space-y-8");
      const notesHost = ensureNotesUI();
      const quizHost = editorSurface.querySelector("#quiz-builder-host");
      if (videoCanvas) videoCanvas.classList.toggle("hidden", view !== "video");
      notesHost.classList.toggle("hidden", view !== "notes");
      if (quizHost) quizHost.classList.toggle("hidden", view !== "quiz");
      if (view === "notes") {
        const mdEl = notesHost.querySelector("#notes-md");
        const preview = notesHost.querySelector("#notes-preview");
        const saved = storage.get(key, {
          md: "# Lesson notes\\n- Add key points here\\n",
        });
        if (mdEl && !mdEl.value) mdEl.value = saved.md || "";
        if (preview) preview.innerHTML = mdToHtml(mdEl?.value || "");
        mdEl?.addEventListener("input", () => {
          if (preview) preview.innerHTML = mdToHtml(mdEl.value || "");
        });
        notesHost
          .querySelector("#notes-save")
          ?.addEventListener("click", () => {
            storage.set(key, { md: mdEl?.value || "" });
            toast("Notes saved");
          });
        notesHost
          .querySelector("#notes-export")
          ?.addEventListener("click", () => {
            downloadText("lesson_notes.md", mdEl?.value || "", "text/markdown");
            toast("Exported");
          });
      }
    }

    videoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setActive(videoBtn);
      show("video");
    });
    notesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setActive(notesBtn);
      show("notes");
    });
    quizBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setActive(quizBtn);
      show("quiz");
    });

    // default
    if (window.location.hash === "#quiz") {
      setActive(quizBtn);
      show("quiz");
    } else {
      setActive(videoBtn);
      show("video");
    }
  }

  function wireCourseModuleEditorMainTabs() {
    if (getPageKey() !== "course_module_editor") return;
    const tabContent = document.getElementById("cme-tab-content");
    const tabSettings = document.getElementById("cme-tab-settings");
    const editorWrap = document.getElementById("cme-editor-wrap");
    const settingsWrap = document.getElementById("cme-settings-wrap");
    if (!tabContent || !tabSettings || !editorWrap || !settingsWrap) return;

    function paint(which) {
      const contentOn = which === "content";
      tabContent.classList.toggle("bg-surface-container-lowest", contentOn);
      tabContent.classList.toggle("text-primary", contentOn);
      tabContent.classList.toggle("shadow-sm", contentOn);
      tabContent.classList.toggle("text-slate-500", !contentOn);
      tabContent.classList.toggle("hover:text-on-surface", !contentOn);
      tabSettings.classList.toggle("bg-surface-container-lowest", !contentOn);
      tabSettings.classList.toggle("text-primary", !contentOn);
      tabSettings.classList.toggle("shadow-sm", !contentOn);
      tabSettings.classList.toggle("text-slate-500", contentOn);
      tabSettings.classList.toggle("hover:text-on-surface", contentOn);
      editorWrap.classList.toggle("hidden", !contentOn);
      settingsWrap.classList.toggle("hidden", contentOn);
    }

    tabContent.addEventListener("click", (e) => {
      e.preventDefault();
      paint("content");
    });
    tabSettings.addEventListener("click", (e) => {
      e.preventDefault();
      paint("settings");
    });
    paint("content");
  }

  function safeJsonParse(s, fallback) {
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  }

  const storage = {
    get(key, fallback) {
      return safeJsonParse(localStorage.getItem(key) || "", fallback);
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
  };

  const cartStore = {
    key: "instructor_cart_v1",
    get() {
      return storage.get(this.key, { items: [] });
    },
    set(next) {
      storage.set(this.key, next);
    },
    add(item, qty = 1) {
      const cur = this.get();
      const idx = cur.items.findIndex((x) => x.id === item.id);
      if (idx >= 0) cur.items[idx].qty += qty;
      else cur.items.unshift({ ...item, qty });
      this.set(cur);
      return cur;
    },
    updateQty(id, qty) {
      const cur = this.get();
      const idx = cur.items.findIndex((x) => x.id === id);
      if (idx >= 0) cur.items[idx].qty = Math.max(1, qty);
      this.set(cur);
      return cur;
    },
    remove(id) {
      const cur = this.get();
      cur.items = cur.items.filter((x) => x.id !== id);
      this.set(cur);
      return cur;
    },
    clear() {
      this.set({ items: [] });
    },
    totals() {
      const cur = this.get();
      const subtotal = cur.items.reduce(
        (sum, x) => sum + (Number(x.price) || 0) * (Number(x.qty) || 0),
        0,
      );
      const tax = subtotal * 0.07;
      const count = cur.items.reduce((s, x) => s + (Number(x.qty) || 0), 0);
      return { subtotal, tax, total: subtotal + tax, count };
    },
  };

  /** Stable id for bookstore items (must match cart line items). */
  function bookIdFromTitle(title) {
    const t = String(title || "").trim();
    return `book_${t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 40)}`;
  }

  async function instructorBookById(id) {
    const rid = String(id || "").trim();
    if (!rid) return null;
    try {
      const r = await fetch(`/api/bookstore/books/${encodeURIComponent(rid)}`);
      if (!r.ok) return null;
      const j = await r.json();
      const b = j.book;
      if (!b) return null;
      return {
        id: b.id,
        title: b.title,
        price: Number(b.price_rm),
        tag: b.badge || "",
        img: b.image_url,
        blurb: b.description || "",
      };
    } catch (_) {
      return null;
    }
  }

  const INSTRUCTOR_COURSE_CATALOG = [
    {
      id: "course_ui_ux_gen_z",
      title: "The Ultimate UI/UX Masterclass for Gen Z Creators",
      status: "Live",
      students: 12402,
      rating: "4.9",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfMpn3NnMO2f50TFIZEkukzuOYd0q-x2D2lddf5ZS42XOtDduVjkUrU91vCSvSKkuH7ryAMwzDFB_yDr72zRQcQ3ukVHIPqdwQRPBBJB2-SAhGsItFoxGRRYGxxaf5dmeiHK770GFdVExSkGU9iqm-9BlnXOJIyL-e8N1FLkZ-2p1-CbBN0441LrYlY8Y5VGzeduBcuWDvFxMAfKJFNcq2-MsKyUQEBlv9xvW_XtPOjGs_MrHveY-4Dt28-Mq5g1NRK4L5Fun4Cbg",
      description:
        "A production-ready curriculum for motion, layout systems, and inclusive patterns aimed at short-form creators.",
      modules: 6,
      lessons: 42,
      duration: "18h",
      price: "RM 89",
      curriculum: [
        {
          icon: "palette",
          title: "Module 1: Visual hierarchy",
          meta: "8 lessons",
        },
        {
          icon: "animation",
          title: "Module 2: Motion & delight",
          meta: "10 lessons",
        },
        {
          icon: "accessibility_new",
          title: "Module 3: Accessible UI",
          meta: "9 lessons",
        },
        {
          icon: "rocket_launch",
          title: "Module 4: Ship-ready handoff",
          meta: "7 lessons",
        },
        { icon: "groups", title: "Module 5: Critique labs", meta: "5 lessons" },
        {
          icon: "workspace_premium",
          title: "Module 6: Capstone",
          meta: "3 lessons",
        },
      ],
    },
    {
      id: "course_tailwind_beyond",
      title: "Advanced Tailwind CSS: Beyond the Utility Classes",
      status: "Draft",
      students: 0,
      rating: null,
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkSPYTx0WMqWzHSJwFd73dBr_7Kmc70vzdJnJxOc5V6kJMU2P38hUSO3IftX-7UDPY1KcJrO0PF-gaYxuafolAhKqCKNgBiax87YC6g0dWXSG7mLyL7t1Ik0cA3PjOFZF6v-URrnWMfv3XodkJopsd4MCit6ZPa60Q9U1uil9HwKB-wtDIgZB2hyKe8enKk7mCljfZYb9GR_p5qAcvJSGBf5Ka8lTA5kmZx43mgTJVZnfp-gyYHb2M69l4p3LoKEf_bvxMernaXlE",
      description:
        "Plugins, design tokens, and component extraction for teams that want Tailwind at scale without chaos.",
      modules: 5,
      lessons: 22,
      duration: "9h",
      price: "RM 59",
      curriculum: [
        {
          icon: "tune",
          title: "Module 1: Config deep dive",
          meta: "5 lessons",
        },
        {
          icon: "extension",
          title: "Module 2: Plugins & safelist",
          meta: "4 lessons",
        },
        {
          icon: "widgets",
          title: "Module 3: Component patterns",
          meta: "6 lessons",
        },
        { icon: "speed", title: "Module 4: Performance", meta: "4 lessons" },
        {
          icon: "verified",
          title: "Module 5: Hardening for prod",
          meta: "3 lessons",
        },
      ],
    },
    {
      id: "course_creator_brand",
      title: "The Creator Economy: Building a Personal Brand",
      status: "Review",
      students: 2150,
      rating: "4.7",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS0JC5TGfJCtGLrZsNbmlwgjnWUSz7sPdjTyZ_YIHKKtLGIC1lo3Mqorxs03rmxbjG-0enK6GT3xAvLomPZWWYRpjC8tHXE2m51Vyf5b9C4lV1IPYpLlGBUqioLMvSE5Mp69IfcLHFc4SCGy9K2X_nFmv_9VvkcMle5ICXvo__kAw09txZCcirZzO0kw-YRuBz07bG78948D5m1iG4L5xrJ-Ml3_oWHMWq5rv9Fsa7lux3GtPfCs0JxbjoSr6A1KLX4UVDWZmsM1U",
      description:
        "Positioning, storytelling, and monetization tracks for instructors teaching modern media careers.",
      modules: 4,
      lessons: 26,
      duration: "12h",
      price: "RM 72",
      curriculum: [
        { icon: "person", title: "Module 1: Positioning", meta: "7 lessons" },
        {
          icon: "campaign",
          title: "Module 2: Distribution",
          meta: "6 lessons",
        },
        {
          icon: "payments",
          title: "Module 3: Offers & pricing",
          meta: "7 lessons",
        },
        {
          icon: "emoji_events",
          title: "Module 4: Launch sprint",
          meta: "6 lessons",
        },
      ],
    },
    {
      id: "course_modern_web_arch",
      title: "Modern Web Architecture & Scaling",
      status: "Live",
      students: 8420,
      rating: "4.8",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFZM_ZRDhIUAqF6y5cRrK32ctU1jBFPTfQeUiLG2yXlnd_EZhaq5MOia7I3QAACbG6lcGcoknbFkztPXwaOYGV0taGCa8XpXgYGy8Fg9qfW4CnN2Rv41PY-PZIrUgKQxW12cA7LIWS91aZpoccc73UpQxsZy8EvbSobJlCfyJZGM19XfDbQ5robQ52R8fmNFyecrEfuzCrDL8huqhoZUJj285j3xWlEryUrB2JEX7Kl07flvm33qSgawi5gpwyqs92dn1SKtMhIhU",
      description:
        "Resilient systems with Next.js, caching layers, and observability patterns your cohort can reproduce in labs.",
      modules: 5,
      lessons: 34,
      duration: "22h",
      price: "RM 94",
      curriculum: [
        { icon: "dns", title: "Module 1: Foundations", meta: "6 lessons" },
        { icon: "cloud", title: "Module 2: Deploy & edge", meta: "8 lessons" },
        {
          icon: "database",
          title: "Module 3: Data at scale",
          meta: "7 lessons",
        },
        {
          icon: "monitoring",
          title: "Module 4: Observability",
          meta: "6 lessons",
        },
        { icon: "security", title: "Module 5: Reliability", meta: "7 lessons" },
      ],
    },
    {
      id: "course_visual_storytelling",
      title: "Visual Storytelling for Content Creators",
      status: "Draft",
      students: 0,
      rating: null,
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJ4FrGL7CCMtKszyPGMdUHbVycc5ezvotN-eWI9wO1d3U0y9XWFSN96EKn87-v6njnKFrsZK87ZbUgRAsAef8NPj8ShvnBphFBXt4rrvoZjWtzPVKoX-e9Wf2ZBqw4zfA6T5bEfyRK8vbMv1DdSfgFMIeLNNJM2V2WmFAB3IBjKqxixRFPgmmIl82HZQWBjXCmF2cNb8VsTHZY_95XRiZNNmCP5y1oGk8CX7EMUnGraRXLHqSgdyzs0Ks9_fP7t41u4Brz8p-otA",
      description:
        "Cinematic lighting, color theory, and narrative pacing for short-form video assignments and critiques.",
      modules: 4,
      lessons: 20,
      duration: "10h",
      price: "RM 54",
      curriculum: [
        { icon: "movie", title: "Module 1: Shot language", meta: "5 lessons" },
        {
          icon: "light_mode",
          title: "Module 2: Light & color",
          meta: "5 lessons",
        },
        {
          icon: "timeline",
          title: "Module 3: Pacing & structure",
          meta: "5 lessons",
        },
        {
          icon: "brush",
          title: "Module 4: Portfolio polish",
          meta: "5 lessons",
        },
      ],
    },
  ];

  function instructorCourseById(id) {
    return (
      INSTRUCTOR_COURSE_CATALOG.find((c) => c.id === (id || "").trim()) || null
    );
  }

  function hydrateCoursePreviewFromCatalog() {
    const params = new URLSearchParams(window.location.search);
    const cid = (params.get("id") || "").trim();
    if (!cid) return "";

    const c = instructorCourseById(cid);
    const heroImg = document.getElementById("cp-hero-img");
    const statusChip = document.getElementById("cp-status-chip");
    const titleEl = document.getElementById("cp-course-title");
    const descEl = document.getElementById("cp-course-desc");
    const mEl = document.getElementById("cp-stat-modules");
    const lEl = document.getElementById("cp-stat-lessons");
    const dEl = document.getElementById("cp-stat-duration");
    const pEl = document.getElementById("cp-stat-price");
    const ul = document.getElementById("cp-curriculum");

    if (!c) {
      if (titleEl) titleEl.textContent = "Course not found";
      if (descEl)
        descEl.textContent =
          "This id is not in the demo catalog. Return to My Courses and open a linked preview again.";
      document.title = "Course Preview | Instructor Portal";
      return cid;
    }

    document.title = `${c.title} | Preview`;
    if (heroImg && c.img) {
      heroImg.src = c.img;
      heroImg.alt = c.title;
      heroImg.classList.remove("hidden", "opacity-0", "pointer-events-none");
    }
    if (statusChip) {
      statusChip.textContent = c.status.toUpperCase();
      statusChip.classList.remove(
        "bg-emerald-50",
        "text-emerald-700",
        "border-emerald-100",
        "bg-orange-50",
        "text-orange-700",
        "border-orange-100",
        "bg-violet-50",
        "text-violet-700",
        "border-violet-100",
      );
      const s = c.status.toLowerCase();
      if (s === "live")
        statusChip.classList.add(
          "bg-emerald-50",
          "text-emerald-700",
          "border-emerald-100",
        );
      else if (s === "draft")
        statusChip.classList.add(
          "bg-orange-50",
          "text-orange-700",
          "border-orange-100",
        );
      else
        statusChip.classList.add(
          "bg-violet-50",
          "text-violet-700",
          "border-violet-100",
        );
    }
    if (titleEl) titleEl.textContent = c.title;
    if (descEl) descEl.textContent = c.description;
    if (mEl) mEl.textContent = String(c.modules);
    if (lEl) lEl.textContent = String(c.lessons);
    if (dEl) dEl.textContent = c.duration;
    if (pEl) pEl.textContent = c.price;

    if (ul && Array.isArray(c.curriculum)) {
      ul.innerHTML = c.curriculum
        .map((row) => {
          const ic = String(row.icon || "menu_book").replace(
            /[^a-z0-9_]/gi,
            "",
          );
          const ti = escHtmlNav(row.title);
          const me = escHtmlNav(row.meta);
          return `
        <li class="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-violet-600">${ic}</span>
            <span class="font-bold">${ti}</span>
          </div>
          <span class="label text-[11px] font-bold text-slate-500">${me}</span>
        </li>`;
        })
        .join("");
    }

    return cid;
  }

  function wireBookDetail() {
    const titleEl = document.getElementById("bd-title");
    if (!titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const id = (params.get("id") || "").trim();
    const miss = document.getElementById("bd-missing");
    const mainCol = document.getElementById("bd-main-col");
    const missTitle = document.getElementById("bd-miss-title");

    void (async () => {
      const b = await instructorBookById(id);
      if (!b) {
        if (miss) miss.classList.remove("hidden");
        if (mainCol) mainCol.classList.add("hidden");
        if (missTitle) missTitle.textContent = "Book not found";
        document.title = "Book | Instructor Bookstore";
        return;
      }

      if (miss) miss.classList.add("hidden");
      if (mainCol) mainCol.classList.remove("hidden");

      document.title = `${b.title} | Bookstore`;
      titleEl.textContent = b.title;
      const cover = document.getElementById("bd-cover");
      if (cover) {
        cover.src = b.img;
        cover.alt = b.title;
      }
      const priceEl = document.getElementById("bd-price");
      if (priceEl) priceEl.textContent = `RM ${Number(b.price).toFixed(2)}`;
      const tagEl = document.getElementById("bd-tag");
      if (tagEl) {
        if (b.tag) {
          tagEl.textContent = b.tag;
          tagEl.classList.remove("hidden");
        } else {
          tagEl.classList.add("hidden");
        }
      }
      const blurb = document.getElementById("bd-blurb");
      if (blurb) blurb.textContent = b.blurb;

      const addBtn = document.getElementById("bd-add-btn");
      addBtn?.addEventListener("click", () => {
        cartStore.add({ id: b.id, title: b.title, price: b.price, img: b.img });
        toast("Added to cart");
        updateCartBadges();
      });
      updateCartBadges();
    })();
  }

  const notifStore = {
    key: "instructor_notifications_v1",
    seed() {
      const cur = storage.get(this.key, null);
      if (cur) return;
      storage.set(this.key, {
        items: [
          {
            id: "n1",
            title: "New student enrollment",
            body: "Jordan Henderson enrolled in “Modern Web Architecture”.",
            ts: Date.now() - 1000 * 60 * 18,
            read: false,
          },
          {
            id: "n2",
            title: "Draft needs attention",
            body: "Lesson “State Persistence” is missing a video upload.",
            ts: Date.now() - 1000 * 60 * 90,
            read: false,
          },
          {
            id: "n3",
            title: "Weekly summary ready",
            body: "Your analytics summary is ready to review.",
            ts: Date.now() - 1000 * 60 * 60 * 24,
            read: true,
          },
        ],
      });
    },
    get() {
      this.seed();
      return storage.get(this.key, { items: [] });
    },
    set(next) {
      storage.set(this.key, next);
    },
    markAllRead() {
      const cur = this.get();
      cur.items = cur.items.map((x) => ({ ...x, read: true }));
      this.set(cur);
    },
    clear() {
      this.set({ items: [] });
    },
    unreadCount() {
      const cur = this.get();
      return cur.items.filter((x) => !x.read).length;
    },
  };

  function formatTime(ts) {
    const d = new Date(ts);
    return (
      d.toLocaleString(undefined, { month: "short", day: "2-digit" }) +
      " · " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
  }

  function ensureNotifPanel() {
    let panel = document.getElementById("instructor-notifications-panel");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "instructor-notifications-panel";
    panel.className = "fixed top-24 right-6 z-[220] w-[min(420px,92vw)] hidden";
    panel.innerHTML = `
      <div class="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] font-extrabold text-violet-600">Notifications</p>
            <p class="text-sm font-black text-slate-900">Inbox</p>
          </div>
          <div class="flex gap-2">
            <button type="button" data-n-mark class="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200">Mark all read</button>
            <button type="button" data-n-close class="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><span class="material-symbols-outlined">close</span></button>
          </div>
        </div>
        <div class="max-h-[60vh] overflow-auto">
          <div data-n-list class="divide-y divide-slate-100"></div>
        </div>
        <div class="p-3 border-t border-slate-100 flex justify-between items-center">
          <button type="button" data-n-clear class="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl">Clear</button>
          <span class="text-[11px] text-slate-500">Stored locally</span>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    panel
      .querySelector("[data-n-close]")
      ?.addEventListener("click", () => panel.classList.add("hidden"));
    panel.querySelector("[data-n-mark]")?.addEventListener("click", () => {
      notifStore.markAllRead();
      renderNotifPanel(panel);
      updateNotifBadge();
    });
    panel.querySelector("[data-n-clear]")?.addEventListener("click", () => {
      notifStore.clear();
      renderNotifPanel(panel);
      updateNotifBadge();
    });
    return panel;
  }

  function renderNotifPanel(panel) {
    const list = panel.querySelector("[data-n-list]");
    if (!list) return;
    const cur = notifStore.get();
    if (!cur.items.length) {
      list.innerHTML = `<div class="p-6 text-sm text-slate-600">No notifications.</div>`;
      return;
    }
    list.innerHTML = cur.items
      .slice()
      .sort((a, b) => b.ts - a.ts)
      .map(
        (n) => `
        <div class="p-4 hover:bg-slate-50 transition-colors ${n.read ? "" : "bg-violet-50/40"}">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${n.title}</p>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">${n.body}</p>
              <p class="text-[11px] text-slate-400 mt-2">${formatTime(n.ts)}</p>
            </div>
            ${n.read ? "" : '<span class="mt-1 w-2 h-2 rounded-full bg-violet-600 flex-shrink-0"></span>'}
          </div>
        </div>
      `,
      )
      .join("");
  }

  function updateNotifBadge() {
    const unread = notifStore.unreadCount();
    const triggers = Array.from(
      document.querySelectorAll(
        '#instructor-notifications-btn, [data-notif-trigger="1"]',
      ),
    );
    if (!triggers.length) return;
    const dotBadgeClass =
      "absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white pointer-events-none";
    triggers.forEach((btn) => {
      let badge = btn.querySelector("[data-notif-badge]");
      if (!badge) {
        badge = document.createElement("span");
        badge.setAttribute("data-notif-badge", "1");
        btn.appendChild(badge);
      }
      badge.className = dotBadgeClass;
      badge.textContent = "";
      badge.setAttribute("aria-hidden", "true");
      if (unread <= 0) badge.classList.add("hidden");
      else badge.classList.remove("hidden");
    });
  }

  function wireNotifications() {
    const triggers = Array.from(
      document.querySelectorAll(
        '#instructor-notifications-btn, [data-notif-trigger="1"]',
      ),
    );
    const iconTriggers = Array.from(document.querySelectorAll("button")).filter(
      (b) =>
        (
          b.querySelector(".material-symbols-outlined")?.textContent || ""
        ).trim() === "notifications",
    );
    iconTriggers.forEach((btn) => {
      if (!triggers.includes(btn)) triggers.push(btn);
    });
    if (!triggers.length) return;

    triggers.forEach((btn) => btn.setAttribute("data-notif-trigger", "1"));
    updateNotifBadge();
    const panel = ensureNotifPanel();
    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const settings = settingsStore().get();
        if (settings.notificationsEnabled === false) {
          toast("Notifications are disabled in Settings");
          return;
        }
        panel.classList.toggle("hidden");
        renderNotifPanel(panel);
        notifStore.markAllRead();
        updateNotifBadge();
      });
    });
    document.addEventListener("click", (e) => {
      if (panel.classList.contains("hidden")) return;
      if (e.target.closest("#instructor-notifications-panel")) return;
      if (e.target.closest('[data-notif-trigger="1"]')) return;
      panel.classList.add("hidden");
    });
  }

  function escHtmlNav(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function checkoutSummaryMoney(n) {
    return "RM " + Number(n).toFixed(2);
  }

  /** cart_secure_checkout.html — order summary from cartStore (no backend). */
  function syncSecureCheckoutOrderSummary() {
    const linesEl = document.getElementById("checkout-summary-lines");
    if (!linesEl) return;

    const main = linesEl.closest("main") || document;
    const completeBtn = Array.from(main.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("complete purchase"),
    );
    const subEl = document.getElementById("checkout-subtotal");
    const taxEl = document.getElementById("checkout-tax");
    const totalEl = document.getElementById("checkout-total");

    const cur = cartStore.get();
    const items = cur.items || [];
    const totals = cartStore.totals();

    if (!items.length) {
      linesEl.innerHTML = `
        <p class="text-sm text-on-surface-variant">
          Your cart is empty.
          <a href="../dashboard/minimal_bookstore.html" class="text-primary font-black hover:underline">Continue shopping</a>
        </p>`;
      if (subEl) subEl.textContent = checkoutSummaryMoney(0);
      if (taxEl) taxEl.textContent = checkoutSummaryMoney(0);
      if (totalEl) totalEl.textContent = checkoutSummaryMoney(0);
      completeBtn?.setAttribute("disabled", "true");
      completeBtn?.classList.add("opacity-50", "cursor-not-allowed");
      return;
    }

    completeBtn?.removeAttribute("disabled");
    completeBtn?.classList.remove("opacity-50", "cursor-not-allowed");

    linesEl.innerHTML = items
      .map((it) => {
        const title = escHtmlNav(String(it.title || ""));
        const qty = Math.max(1, Number(it.qty) || 1);
        const unit = Number(it.price) || 0;
        const thumb =
          typeof it.img === "string" && it.img.trim() ? it.img.trim() : "";
        const srcSafe = thumb.replace(/"/g, "&quot;");
        const imgBlock = thumb
          ? `<img alt="${title}" class="w-full h-full object-cover" src="${srcSafe}"/>`
          : `<div class="w-full h-full flex items-center justify-center text-on-surface-variant text-xs font-bold bg-surface-container">Book</div>`;
        return `
          <div class="flex gap-4 pb-4 border-b border-surface-container-low last:border-0 last:pb-0">
            <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">${imgBlock}</div>
            <div class="flex flex-col justify-center min-w-0 flex-1">
              <h3 class="font-headline font-bold text-on-surface truncate">${title}</h3>
              <p class="text-sm text-on-surface-variant">Qty ${qty} × ${checkoutSummaryMoney(unit)}</p>
            </div>
            <div class="font-headline font-bold text-on-surface self-center whitespace-nowrap">${checkoutSummaryMoney(unit * qty)}</div>
          </div>`;
      })
      .join("");

    if (subEl) subEl.textContent = checkoutSummaryMoney(totals.subtotal);
    if (taxEl) taxEl.textContent = checkoutSummaryMoney(totals.tax);
    if (totalEl) totalEl.textContent = checkoutSummaryMoney(totals.total);
  }

  /** cart_checkout_flow.html — sticky order summary from cartStore. */
  function syncCheckoutFlowOrderSummary() {
    const linesEl = document.getElementById("checkout-flow-summary-lines");
    if (!linesEl) return;

    const subEl = document.getElementById("checkout-flow-subtotal");
    const totalEl = document.getElementById("checkout-flow-total");

    const cur = cartStore.get();
    const items = cur.items || [];
    const totals = cartStore.totals();

    if (!items.length) {
      linesEl.innerHTML = `
        <p class="text-sm text-on-surface-variant">
          Your cart is empty.
          <a href="../dashboard/minimal_bookstore.html" class="text-primary font-black hover:underline">Browse bookstore</a>
        </p>`;
      if (subEl) subEl.textContent = checkoutSummaryMoney(0);
      if (totalEl) totalEl.textContent = checkoutSummaryMoney(0);
      return;
    }

    linesEl.innerHTML = items
      .map((it) => {
        const title = escHtmlNav(String(it.title || ""));
        const qty = Math.max(1, Number(it.qty) || 1);
        const unit = Number(it.price) || 0;
        const thumb =
          typeof it.img === "string" && it.img.trim() ? it.img.trim() : "";
        const srcSafe = thumb.replace(/"/g, "&quot;");
        const imgBlock = thumb
          ? `<img alt="${title}" class="w-full h-full object-cover" src="${srcSafe}"/>`
          : `<div class="w-full h-full flex items-center justify-center text-on-surface-variant text-[10px] font-bold bg-surface-container-highest">Book</div>`;
        return `
          <div class="flex gap-4">
            <div class="w-16 h-20 bg-surface-container-highest rounded-lg flex-shrink-0 overflow-hidden">${imgBlock}</div>
            <div class="flex-grow min-w-0">
              <h4 class="font-bold text-sm leading-tight mb-1 truncate">${title}</h4>
              <p class="text-xs text-on-surface-variant mb-2">Qty ${qty}</p>
              <span class="text-primary font-bold">${checkoutSummaryMoney(unit * qty)}</span>
            </div>
          </div>`;
      })
      .join("");

    if (subEl) subEl.textContent = checkoutSummaryMoney(totals.subtotal);
    if (totalEl) totalEl.textContent = checkoutSummaryMoney(totals.total);
  }

  /** Keep #nav-mount cart drawer in sync with cartStore (nav shell is in instructor-nav.js). */
  function syncNavCartDrawerFromStore() {
    const cartContainer = document.getElementById("cart-items-container");
    const cartEmptyState = document.getElementById("cart-empty-state");
    const cartTotalEl = document.getElementById("cart-estimated-total");
    if (!cartContainer) return;

    cartContainer
      .querySelectorAll('[data-cart-item="true"]')
      .forEach((el) => el.remove());

    const cur = cartStore.get();
    const items = cur.items || [];
    const formatCurrency = (value) => `RM ${Number(value).toFixed(2)}`;

    items.forEach((it) => {
      const safeTitle = String(it.title || "").trim();
      const encTitle = encodeURIComponent(safeTitle);
      const unit = Number(it.price) || 0;
      const qty = Math.max(1, Number(it.qty) || 1);
      const thumb =
        typeof it.img === "string" && it.img.trim() ? it.img.trim() : "";
      const srcSafe = thumb.replace(/"/g, "&quot;");
      const imgBlock = thumb
        ? `<img alt="${escHtmlNav(safeTitle)}" class="w-full h-full object-cover" src="${srcSafe}"/>`
        : `<div class="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">Book</div>`;

      const row = `
        <div class="group relative flex gap-6 p-4 rounded-2xl bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all border border-slate-100" data-cart-item="true" data-book-id="${escHtmlNav(it.id)}" data-title="${encTitle}" data-unit-price="${unit}" data-qty="${qty}">
          <div class="w-24 h-32 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner">${imgBlock}</div>
          <div class="flex flex-col justify-between py-1 flex-grow">
            <div>
              <div class="flex justify-between items-start gap-2">
                <h3 class="font-bold text-lg leading-tight text-slate-900 font-headline">${escHtmlNav(safeTitle)}</h3>
                <button type="button" data-cart-action="remove" class="material-symbols-outlined text-slate-400 hover:text-red-500 hover:scale-110 transition-all">delete</button>
              </div>
              <p class="text-xs text-slate-500 font-medium mt-1">Digital access</p>
            </div>
            <div class="flex justify-between items-center mt-4">
              <div class="flex items-center bg-slate-100 rounded-full px-3 py-1 gap-3">
                <button type="button" data-cart-action="decrease" class="text-[#6a1cf6] font-black hover:scale-125 transition-transform">−</button>
                <span data-role="qty" class="font-bold text-sm">${String(qty).padStart(2, "0")}</span>
                <button type="button" data-cart-action="increase" class="text-[#6a1cf6] font-black hover:scale-125 transition-transform">+</button>
              </div>
              <span data-role="line-total" class="text-xl font-black font-headline text-slate-900">${formatCurrency(unit * qty)}</span>
            </div>
          </div>
        </div>`;
      cartContainer.insertAdjacentHTML("afterbegin", row);
    });

    if (cartEmptyState) {
      cartEmptyState.classList.toggle("hidden", items.length > 0);
    }
    if (cartTotalEl) {
      const t = cartStore.totals();
      cartTotalEl.textContent = formatCurrency(t.total);
    }
  }

  let navCartDrawerWired = false;
  function wireNavCartDrawer() {
    if (navCartDrawerWired) return;
    const cartContainer = document.getElementById("cart-items-container");
    if (!cartContainer) return;
    navCartDrawerWired = true;
    cartContainer.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-cart-action]");
      if (!actionBtn) return;
      const cartItem = actionBtn.closest('[data-cart-item="true"]');
      if (!cartItem) return;
      const id =
        cartItem.getAttribute("data-book-id") ||
        cartItem.getAttribute("data-store-id");
      if (!id) return;
      const action = actionBtn.getAttribute("data-cart-action");
      const currentQty =
        Number.parseInt(cartItem.getAttribute("data-qty") || "1", 10) || 1;

      if (action === "increase") {
        cartStore.updateQty(id, currentQty + 1);
      } else if (action === "decrease") {
        if (currentQty <= 1) cartStore.remove(id);
        else cartStore.updateQty(id, currentQty - 1);
      } else if (action === "remove") {
        cartStore.remove(id);
      }
      updateCartBadges();
    });
  }

  function updateCartBadges() {
    const { count } = cartStore.totals();
    const navBadge = document.querySelector("#nav-mount .cart-badge");
    if (navBadge) navBadge.textContent = String(count);
    const legacy = document.getElementById("floating-cart-badge");
    if (legacy) legacy.textContent = String(count);
    syncNavCartDrawerFromStore();
    syncSecureCheckoutOrderSummary();
    syncCheckoutFlowOrderSummary();
    if (typeof window.__instructorRenderCheckoutFlowPanel === "function") {
      window.__instructorRenderCheckoutFlowPanel();
    }
  }

  function wireBookstore() {
    const addLinks = Array.from(
      document.querySelectorAll('a[aria-label^=\"Add \"]'),
    );
    addLinks.forEach((a, idx) => {
      const card = a.closest(".group");
      const title =
        card?.querySelector("h3")?.textContent?.trim() || `Book ${idx + 1}`;
      const priceText =
        card?.querySelector("p.text-lg.font-black")?.textContent?.trim() ||
        "$0";
      const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;
      const id = bookIdFromTitle(title);
      const img = card?.querySelector("img")?.getAttribute("src") || "";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        cartStore.add({ id, title, price, img });
        toast("Added to cart");
        updateCartBadges();
      });
    });

    updateCartBadges();
  }

  function wireCartList() {
    const itemsEl = document.getElementById("cart-items");
    if (!itemsEl) return;

    function money(n) {
      return "RM " + Number(n).toFixed(2);
    }

    function render() {
      const cur = cartStore.get();
      if (!cur.items.length) {
        itemsEl.innerHTML = `
          <div class="p-10 text-center">
            <p class="text-lg font-black">Your cart is empty</p>
            <p class="text-sm text-slate-600 mt-2">Browse the bookstore and add items to continue.</p>
            <a href="../dashboard/minimal_bookstore.html" class="inline-flex mt-6 px-5 py-3 rounded-xl bg-violet-600 text-white font-black hover:bg-violet-700 transition-colors">Go to Bookstore</a>
          </div>
        `;
      } else {
        itemsEl.innerHTML = cur.items
          .map(
            (it) => `
          <div class="p-6 flex items-center justify-between gap-4 cart-item" data-id="${it.id}" data-price="${it.price}">
            <div class="min-w-0">
              <p class="font-black truncate">${it.title}</p>
              <p class="text-xs text-slate-500 mt-1">Digital access</p>
            </div>
            <div class="flex items-center gap-3">
              <button class="qty-btn w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black" data-delta="-1">-</button>
              <span class="w-6 text-center font-black cart-qty">${it.qty}</span>
              <button class="qty-btn w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black" data-delta="1">+</button>
            </div>
            <div class="w-24 text-right font-black">${money(it.price * it.qty)}</div>
            <button class="remove-btn p-2 rounded-xl hover:bg-slate-100 text-slate-500" title="Remove">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        `,
          )
          .join("");
      }

      const subtotalEl = document.getElementById("subtotal");
      const taxEl = document.getElementById("tax");
      const totalEl = document.getElementById("total");
      const totals = cartStore.totals();
      if (subtotalEl) subtotalEl.textContent = money(totals.subtotal);
      if (taxEl) taxEl.textContent = money(totals.tax);
      if (totalEl) totalEl.textContent = money(totals.total);
    }

    itemsEl.addEventListener("click", (e) => {
      const remove = e.target.closest(".remove-btn");
      if (remove) {
        const row = remove.closest(".cart-item");
        const id = row?.getAttribute("data-id");
        if (id) cartStore.remove(id);
        render();
        updateCartBadges();
        return;
      }
      const qtyBtn = e.target.closest(".qty-btn");
      if (qtyBtn) {
        const row = qtyBtn.closest(".cart-item");
        const id = row?.getAttribute("data-id");
        const delta = Number(qtyBtn.getAttribute("data-delta") || "0");
        const qtyEl = row?.querySelector(".cart-qty");
        const curQty = Number(qtyEl?.textContent || "1");
        const next = Math.max(1, curQty + delta);
        if (id) cartStore.updateQty(id, next);
        render();
        updateCartBadges();
      }
    });

    document.getElementById("clear-cart")?.addEventListener("click", () => {
      cartStore.clear();
      render();
      updateCartBadges();
    });

    render();
    updateCartBadges();
  }

  function wireResourceLibrary() {
    const grid = document.getElementById("resource-grid");
    if (!grid) return;

    const search = document.querySelector(
      'input[placeholder^=\"Search resources\"]',
    );
    const filterBtns = Array.from(
      document.querySelectorAll("button.filter-btn"),
    );
    filterBtns.forEach((b) => b.setAttribute("data-global-skip", "1"));
    let activeType = "all";

    function cards() {
      return Array.from(grid.querySelectorAll(".resource-card"));
    }

    function apply() {
      const q = (search?.value || "").trim().toLowerCase();
      cards().forEach((card) => {
        const type = (card.getAttribute("data-type") || "all").toLowerCase();
        const text = (card.textContent || "")
          .replace(/\\s+/g, " ")
          .toLowerCase();
        const showType = activeType === "all" || type === activeType;
        const showQ = !q || text.includes(q);
        card.classList.toggle("hidden", !(showType && showQ));
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeType = (btn.getAttribute("data-filter") || "all").toLowerCase();
        filterBtns.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle("bg-primary", isActive);
          b.classList.toggle("text-on-primary", isActive);
          b.classList.toggle("shadow-md", isActive);
          b.classList.toggle("text-on-surface-variant", !isActive);
        });
        apply();
      });
    });

    search?.addEventListener("input", apply);
    apply();

    document.getElementById("upload-btn")?.addEventListener("click", () => {
      modal({
        title: "Upload Resource",
        primaryText: "Upload",
        bodyHtml: `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Title</label>
              <input id="rl-title" class="w-full rounded-xl border-slate-200" placeholder="e.g. Week 3 worksheet" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Type</label>
                <select id="rl-type" class="w-full rounded-xl border-slate-200">
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Tag</label>
                <input id="rl-tag" class="w-full rounded-xl border-slate-200" placeholder="e.g. Typography" />
              </div>
            </div>
            <p class="text-xs text-slate-500">Creates a new resource card locally.</p>
          </div>
        `,
        onPrimary: () => {
          const title = document.getElementById("rl-title")?.value?.trim();
          const type = document.getElementById("rl-type")?.value || "document";
          const tag = document.getElementById("rl-tag")?.value?.trim() || "New";
          if (!title) return toast("Title required");

          const card = document.createElement("div");
          card.className =
            "resource-card bg-surface-container-lowest rounded-xl p-6 group hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden";
          card.setAttribute("data-type", type);
          card.innerHTML = `
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${type}</p>
                <h3 class="mt-2 text-xl font-black">${title}</h3>
                <p class="mt-2 text-sm text-slate-600">Tag: ${tag} • Added just now</p>
              </div>
              <span class="material-symbols-outlined text-violet-600">folder_open</span>
            </div>
            <div class="mt-5 flex gap-2">
              <button class="px-4 py-2 rounded-xl bg-violet-600 text-white font-black text-sm">Open</button>
              <button class="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm">Share</button>
            </div>
          `;
          grid.prepend(card);
          toast("Resource uploaded");
          apply();
        },
      });
    });
  }

  function wireCoursePreview() {
    const enroll = document.getElementById("simulate-enroll");
    const review = document.getElementById("simulate-review");
    if (!enroll && !review) return;

    const previewCourseId = hydrateCoursePreviewFromCatalog() || "";

    enroll?.addEventListener("click", () => {
      const k = previewCourseId
        ? `instructor_course_preview_enroll_v1_${previewCourseId}`
        : "instructor_course_preview_enroll_v1";
      const cur = storage.get(k, { enrolled: 0 });
      cur.enrolled += 1;
      storage.set(k, cur);
      modal({
        title: "Practice enrollment",
        primaryText: "Close",
        bodyHtml: `<div class="text-sm text-slate-600">Enrollment count saved in this browser: <b>${cur.enrolled}</b></div>`,
        onPrimary: () => {},
      });
    });

    review?.addEventListener("click", () => {
      modal({
        title: "Leave a review",
        primaryText: "Submit",
        secondaryText: "Cancel",
        bodyHtml: `
          <div class="space-y-3">
            <label class="block text-xs font-bold text-slate-600">Rating</label>
            <select id="cp-rating" class="w-full rounded-xl border-slate-200">
              <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
            </select>
            <label class="block text-xs font-bold text-slate-600">Comment</label>
            <textarea id="cp-comment" class="w-full rounded-xl border-slate-200 min-h-24" placeholder="Write a short review..."></textarea>
          </div>
        `,
        onPrimary: () => {
          const rating = document.getElementById("cp-rating")?.value || "5";
          const comment = (
            document.getElementById("cp-comment")?.value || ""
          ).trim();
          const k = previewCourseId
            ? `instructor_course_preview_reviews_v1_${previewCourseId}`
            : "instructor_course_preview_reviews_v1";
          const cur = storage.get(k, { items: [] });
          cur.items.unshift({ ts: Date.now(), rating, comment });
          storage.set(k, cur);
          toast("Review submitted");
        },
      });
    });
  }

  /** Resolve post card for inline comments (#forum-feed or common card selectors). */
  function resolveForumPostCardFromClick(btn) {
    if (!btn || btn.nodeType !== 1) return null;
    const feed = document.getElementById("forum-feed");
    if (feed && feed.contains(btn)) {
      const byClass = btn.closest(".forum-post");
      if (byClass && feed.contains(byClass)) return byClass;
      let n = btn;
      for (let depth = 0; depth < 20 && n && n !== feed; depth++) {
        if (n.parentElement === feed) return n;
        n = n.parentElement;
      }
    }
    return (
      btn.closest(
        ".forum-post, [data-community-post], article, tr, .resource-card, .bg-surface-container-lowest.rounded-xl, .group",
      ) || btn.parentElement
    );
  }

  /** Thread-scoped replies persisted in localStorage. Inline panel when `postEl` is provided. */
  function openThreadComments(threadKey, postEl) {
    const storeKey = "instructor_thread_comments_v1";
    function load() {
      const all = storage.get(storeKey, {});
      return Array.isArray(all[threadKey]) ? all[threadKey] : [];
    }
    function save(items) {
      const all = storage.get(storeKey, {});
      all[threadKey] = items;
      storage.set(storeKey, all);
    }
    function listHtml(arr) {
      if (!arr.length) {
        return '<p class="text-sm text-on-surface-variant py-2">No comments yet. Start the conversation.</p>';
      }
      return arr
        .map((c) => {
          const body = String(c.body ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          const when = new Date(c.ts).toLocaleString();
          return `<div class="flex gap-2.5">
            <div class="w-8 h-8 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-black ring-2 ring-white">In</div>
            <div class="min-w-0 flex-1">
              <div class="inline-block max-w-full rounded-2xl bg-surface-container-low px-3.5 py-2 border border-surface-container">
                <span class="text-xs font-bold text-on-background">Instructor</span>
                <p class="text-sm text-on-surface mt-0.5 whitespace-pre-wrap break-words">${body}</p>
              </div>
              <p class="text-[11px] text-on-surface-variant mt-1 pl-1">${when}</p>
            </div>
          </div>`;
        })
        .join("");
    }

    function commitFromPanel(panel, input) {
      const v = (input?.value || "").trim();
      if (!v) {
        toast("Write something first");
        return;
      }
      const items = load();
      items.push({ ts: Date.now(), body: v });
      save(items);
      const listEl = panel.querySelector("[data-fc-list]");
      if (listEl) listEl.innerHTML = listHtml(items);
      if (input) input.value = "";
      toast("Reply posted");
    }

    if (postEl && typeof postEl.querySelector === "function") {
      const existing = postEl.querySelector("[data-thread-comments-panel]");
      if (existing) {
        existing.classList.toggle("hidden");
        if (!existing.classList.contains("hidden")) {
          existing.querySelector("[data-fc-input]")?.focus();
        }
        return;
      }

      const panel = document.createElement("div");
      panel.setAttribute("data-thread-comments-panel", "1");
      panel.className =
        "forum-inline-comments mt-4 pt-4 border-t border-surface-container";
      panel.innerHTML = `
        <p class="text-xs text-on-surface-variant mb-3">Comments are saved in this browser for this thread.</p>
        <div data-fc-list class="space-y-3 max-h-72 overflow-y-auto overscroll-contain pr-1">${listHtml(load())}</div>
        <div class="flex items-end gap-2.5 mt-3">
          <div class="w-9 h-9 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-black ring-2 ring-white" title="You">In</div>
          <div class="flex-1 min-w-0 rounded-2xl bg-surface-container-low border border-outline-variant shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-shadow">
            <textarea data-fc-input rows="1" class="w-full bg-transparent border-0 rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-0 resize-none max-h-36 leading-snug" placeholder="Write a comment…"></textarea>
          </div>
          <button type="button" data-fc-post class="shrink-0 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-bold hover:opacity-95 active:scale-[0.98] transition-transform">Post</button>
        </div>`;
      postEl.appendChild(panel);
      const input = panel.querySelector("[data-fc-input]");
      panel
        .querySelector("[data-fc-post]")
        ?.addEventListener("click", () => commitFromPanel(panel, input));
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          commitFromPanel(panel, input);
        }
      });
      input?.focus();
      return;
    }

    let items = load();
    modal({
      title: "Comments",
      primaryText: "Post reply",
      secondaryText: "Close",
      bodyHtml: `
        <p class="text-xs text-slate-500 mb-3">Replies are saved in this browser for this thread.</p>
        <div id="fc-list" class="max-h-52 overflow-y-auto space-y-2 mb-4">${listHtml(items)}</div>
        <label class="block text-xs font-bold text-slate-600">Your reply</label>
        <textarea id="fc-input" class="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[88px]" placeholder="Write a reply…"></textarea>`,
      onPrimary: (overlay) => {
        const input = overlay.querySelector("#fc-input");
        const v = (input?.value || "").trim();
        if (!v) {
          toast("Write something first");
          return false;
        }
        items = load();
        items.push({ ts: Date.now(), body: v });
        save(items);
        const listEl = overlay.querySelector("#fc-list");
        if (listEl) listEl.innerHTML = listHtml(items);
        if (input) input.value = "";
        toast("Reply posted");
        return false;
      },
    });
  }

  function wireCommunityForum() {
    const root = document.querySelector("main");
    if (!root) return;

    const tabsBar = root.querySelector("div.bg-surface-container-low");
    if (!tabsBar) return;

    // Page-level filters (keyword + source). Avoid global capture-phase "Filters" modal.
    const pageFilterBtn =
      Array.from(tabsBar.querySelectorAll("button")).find(
        (b) =>
          (
            b.querySelector(".material-symbols-outlined")?.textContent || ""
          ).trim() === "tune",
      ) || null;
    pageFilterBtn?.setAttribute("data-global-skip", "1");

    if (!document.getElementById("community-search")) {
      const wrap = document.createElement("div");
      const isInstructorForum = getPageKey() === "instructor_forum_moderation";
      // Instructor forum: search only (FAB opens composer). Other forum pages: search + New Post.
      wrap.className = "w-full mt-2 mb-4 flex flex-col sm:flex-row gap-3";
      wrap.innerHTML = isInstructorForum
        ? `
        <div class="flex-1 relative flex items-center group">
          <input id="community-search" class="w-full bg-white/80 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none" placeholder="Search posts, tags, people..." />
          <div class="absolute left-0 inset-y-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
            <span class="material-symbols-outlined">search</span>
          </div>
        </div>
      `
        : `
        <div class="flex-1 relative flex items-center group">
          <input id="community-search" class="w-full bg-white/80 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none" placeholder="Search posts, tags, people..." />
          <div class="absolute left-0 inset-y-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
            <span class="material-symbols-outlined">search</span>
          </div>
        </div>
        <button id="community-new-post" class="h-12 px-6 rounded-xl bg-violet-600 text-white font-black shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
          <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' 1;">edit_note</span>
          <span class="text-[10px] uppercase tracking-[0.1em]">New Post</span>
        </button>
      `;
      tabsBar.parentElement?.insertBefore(wrap, tabsBar.nextSibling);
    }

    const postScope =
      document.getElementById("forum-feed") ||
      root.querySelector("div.space-y-6") ||
      root;
    const feed = postScope;
    const search = document.getElementById("community-search");

    function feedPostElements() {
      const byForumPost = postScope.querySelectorAll(":scope > .forum-post");
      if (byForumPost.length) return Array.from(byForumPost);
      return Array.from(
        postScope.querySelectorAll(
          ":scope > div.bg-surface-container-lowest.rounded-xl",
        ),
      );
    }
    feedPostElements().forEach((el) => {
      if (!el.hasAttribute("data-community-post"))
        el.setAttribute("data-community-post", "1");
    });

    const filterKey = "instructor_community_forum_filters_v1";
    const forumFilters = storage.get(filterKey, {
      q: "",
      source: "all",
      tag: "",
    }); // all | reddit | github | instructor

    function sourceOfPost(post) {
      const txt = (post.textContent || "").replace(/\s+/g, " ").toLowerCase();
      if (txt.includes("via reddit") || txt.includes("r/")) return "reddit";
      if (txt.includes("via github")) return "github";
      // "Instructor" posts created via modal
      const author = (
        post.querySelector("h3")?.textContent || ""
      ).toLowerCase();
      if (author.includes("instructor")) return "instructor";
      return "all";
    }

    function normalizeTagValue(value) {
      return String(value || "")
        .trim()
        .replace(/^#/, "")
        .toLowerCase();
    }

    function postMatchesTag(post, tagQuery) {
      const q = normalizeTagValue(tagQuery);
      if (!q) return true;

      const txt = (post.textContent || "").replace(/\s+/g, " ").toLowerCase();

      // Prefer hashtag-style tokens, but fall back to substring match in text.
      const hashtags = (txt.match(/#[a-z0-9_]+/gi) || []).map((t) =>
        t.slice(1).toLowerCase(),
      );
      if (hashtags.some((t) => t.includes(q))) return true; // supports x -> xy

      return txt.includes(q);
    }

    function postMatchesFilters(post) {
      if (post.getAttribute("data-ce-course-hidden") === "1") return false;
      const q = (forumFilters.q || "").trim().toLowerCase();
      const src = (forumFilters.source || "all").toLowerCase();
      const t = (post.textContent || "").replace(/\s+/g, " ").toLowerCase();
      if (q && !t.includes(q)) return false;
      if (src !== "all" && sourceOfPost(post) !== src) return false;
      if (forumFilters.tag && !postMatchesTag(post, forumFilters.tag))
        return false;
      return true;
    }

    function syncSearchBoxToState() {
      if (search && search.value !== (forumFilters.q || ""))
        search.value = forumFilters.q || "";
    }

    // Tabs should cause real list changes (sort + paginate visible posts).
    const tabBtns = Array.from(tabsBar.querySelectorAll("button")).filter(
      (b) => {
        const t = (b.textContent || "").trim().toLowerCase();
        return t === "trending" || t === "latest" || t === "top";
      },
    );
    const PAGE_SIZE = 4;
    let activeTab = "trending";
    let page = 1;

    /** Like / upvote count from the post action row (not comment counts). */
    const LIKE_ICON_NAMES = new Set(["thumb_up", "arrow_upward", "favorite"]);

    function parseCompactCount(raw) {
      const t = String(raw || "")
        .trim()
        .toLowerCase();
      if (!t || /comment/.test(t)) return 0;
      const km = t.match(/^([\d.]+)\s*k$/);
      if (km) return Math.round(parseFloat(km[1], 10) * 1000);
      const nm = t.match(/^(\d+)/);
      return nm ? parseInt(nm[1], 10) : 0;
    }

    function getLikeCount(post) {
      for (const btn of post.querySelectorAll("button")) {
        const icon = btn.querySelector(".material-symbols-outlined");
        if (!icon) continue;
        const name = (icon.textContent || "").trim();
        if (!LIKE_ICON_NAMES.has(name)) continue;
        for (const sp of btn.querySelectorAll("span")) {
          if (sp === icon) continue;
          const raw = (sp.textContent || "").trim();
          const n = parseCompactCount(raw);
          if (raw && (n > 0 || raw === "0")) return n;
        }
      }
      return 0;
    }

    /** Comment count from chat_bubble / forum action row (e.g. "342 comments"). */
    function getCommentCount(post) {
      for (const btn of post.querySelectorAll("button")) {
        const icon = btn.querySelector(".material-symbols-outlined");
        if (!icon) continue;
        const name = (icon.textContent || "").trim();
        if (name !== "chat_bubble" && name !== "forum") continue;
        const txt = (btn.textContent || "").replace(/\s+/g, " ").trim();
        const m = txt.match(/([\d,]+)\s*comments?/i);
        if (m) return parseInt(m[1].replace(/,/g, ""), 10) || 0;
      }
      return 0;
    }

    /** Minutes since post; smaller = more recent (closer to now). */
    function getPostAgeMinutes(post) {
      const head = (post.querySelector("h3")?.textContent || "").toLowerCase();
      const fallback = (post.textContent || "").toLowerCase();
      const txt = head || fallback;
      if (/just\s*now/.test(txt)) return 0;
      const m = txt.match(/(\d+)\s*(m|h|d|w)\s*ago/);
      if (!m) return Number.MAX_SAFE_INTEGER;
      const v = parseInt(m[1], 10) || 0;
      const u = m[2];
      if (u === "m") return v;
      if (u === "h") return v * 60;
      if (u === "d") return v * 1440;
      if (u === "w") return v * 10080;
      return Number.MAX_SAFE_INTEGER;
    }

    function sortPosts(posts) {
      if (activeTab === "trending")
        return [...posts].sort(
          (a, b) => getCommentCount(b) - getCommentCount(a),
        );
      if (activeTab === "latest")
        return [...posts].sort(
          (a, b) => getPostAgeMinutes(a) - getPostAgeMinutes(b),
        );
      return [...posts].sort((a, b) => getLikeCount(b) - getLikeCount(a));
    }

    function ensurePager() {
      let pager = document.getElementById("community-pager");
      if (pager) return pager;
      pager = document.createElement("div");
      pager.id = "community-pager";
      pager.className = "flex items-center justify-between gap-3 pt-6";
      pager.innerHTML = `
        <button id="community-prev" class="px-4 py-2 rounded-xl bg-white border border-slate-200 font-black text-sm hover:bg-slate-50">Prev</button>
        <div id="community-page" class="text-xs font-bold text-slate-500"></div>
        <button id="community-next" class="px-4 py-2 rounded-xl bg-white border border-slate-200 font-black text-sm hover:bg-slate-50">Next</button>
      `;
      feed?.parentElement?.appendChild(pager);
      pager.querySelector("#community-prev")?.addEventListener("click", () => {
        page = Math.max(1, page - 1);
        render();
      });
      pager.querySelector("#community-next")?.addEventListener("click", () => {
        page += 1;
        render();
      });
      return pager;
    }

    function render() {
      if (typeof window.ceForumCourseFilterApply === "function")
        window.ceForumCourseFilterApply();
      const allFiltered = Array.from(
        postScope.querySelectorAll("[data-community-post]"),
      ).filter(postMatchesFilters);
      const all = sortPosts(allFiltered);
      // Reflect sort order in the feed (visibility alone keeps old DOM order).
      all.forEach((el) => postScope.appendChild(el));
      const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
      if (page > totalPages) page = totalPages;

      const start = (page - 1) * PAGE_SIZE;
      const visible = new Set(all.slice(start, start + PAGE_SIZE));
      // Hide all posts first, then reveal the visible slice
      Array.from(postScope.querySelectorAll("[data-community-post]")).forEach(
        (p) => p.classList.add("hidden"),
      );
      all.forEach((p) => p.classList.toggle("hidden", !visible.has(p)));

      tabBtns.forEach((b) => {
        const is = (b.textContent || "").trim().toLowerCase() === activeTab;
        b.classList.toggle("bg-primary", is);
        b.classList.toggle("text-white", is);
        b.classList.toggle("text-on-surface-variant", !is);
      });

      const pager = ensurePager();
      pager.querySelector("#community-page").textContent =
        `Page ${page} / ${totalPages}`;
      const prev = pager.querySelector("#community-prev");
      const next = pager.querySelector("#community-next");
      prev.disabled = page <= 1;
      next.disabled = page >= totalPages;
      prev.classList.toggle("opacity-40", page <= 1);
      next.classList.toggle("opacity-40", page >= totalPages);
    }

    // Search box drives page-level keyword filter
    syncSearchBoxToState();
    search?.addEventListener("input", () => {
      forumFilters.q = (search.value || "").trim();
      storage.set(filterKey, forumFilters);
      page = 1;
      render();
    });

    // Trending tags: click to toggle tag filter (supports partial match)
    function wireTrendingTags() {
      const tagsHeader = Array.from(root.querySelectorAll("h3")).find(
        (h) => (h.textContent || "").trim().toLowerCase() === "trending tags",
      );
      const tagsWrap =
        tagsHeader?.parentElement?.querySelector("div.flex.flex-wrap") || null;
      if (!tagsWrap) return;

      const chips = Array.from(tagsWrap.querySelectorAll("span"));
      const applyChipStyles = () => {
        const active = normalizeTagValue(forumFilters.tag);
        chips.forEach((chip) => {
          const chipValue = normalizeTagValue(chip.textContent || "");
          const is = !!active && chipValue === active;
          chip.classList.toggle("bg-primary", is);
          chip.classList.toggle("text-white", is);
          chip.classList.toggle("shadow-md", is);
          chip.classList.toggle("bg-white", !is);
          chip.classList.toggle("text-primary", is); // overwritten by text-white when active
          chip.classList.toggle("text-slate-600", !is);
          chip.classList.toggle("cursor-pointer", true);
          chip.classList.toggle("select-none", true);
        });
      };

      chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          const next = normalizeTagValue(chip.textContent || "");
          const cur = normalizeTagValue(forumFilters.tag);
          forumFilters.tag = cur === next ? "" : next;
          storage.set(filterKey, forumFilters);
          page = 1;
          applyChipStyles();
          render();
        });
      });

      applyChipStyles();
    }

    // Top contributors: follow/unfollow toggle with persistence
    function wireTopContributorsFollow() {
      const followKey = "instructor_community_following_v1";
      const state = storage.get(followKey, { ids: [] });
      const following = new Set((state.ids || []).map((x) => String(x)));

      const header = Array.from(root.querySelectorAll("h3")).find(
        (h) =>
          (h.textContent || "").trim().toLowerCase() === "top contributors",
      );
      const card = header?.closest("div.bg-surface-container-low") || null;
      if (!card) return;

      const rows = Array.from(
        card.querySelectorAll("div.flex.items-center.gap-3"),
      );
      rows.forEach((row) => {
        const name = (
          row.querySelector("p.text-xs.font-bold")?.textContent || ""
        ).trim();
        const btn = row.querySelector("button");
        if (!name || !btn) return;
        const id = encodeURIComponent(name.toLowerCase());
        btn.setAttribute("data-follow-btn", "1");
        btn.setAttribute("data-follow-id", id);
      });

      function applyButton(btn) {
        const id = btn.getAttribute("data-follow-id") || "";
        const isFollowing = following.has(id);
        btn.textContent = isFollowing ? "Following" : "Follow";
        btn.classList.toggle("text-primary", !isFollowing);
        btn.classList.toggle("text-slate-400", isFollowing);
      }

      card
        .querySelectorAll('button[data-follow-btn="1"]')
        .forEach((btn) => applyButton(btn));

      card.addEventListener("click", (e) => {
        const btn = e.target.closest('button[data-follow-btn="1"]');
        if (!btn) return;
        e.preventDefault();
        const id = btn.getAttribute("data-follow-id") || "";
        if (!id) return;
        if (following.has(id)) following.delete(id);
        else following.add(id);
        storage.set(followKey, { ids: Array.from(following) });
        applyButton(btn);
        toast(following.has(id) ? "Following" : "Unfollowed");
      });
    }

    tabBtns.forEach((b) =>
      b.addEventListener("click", () => {
        activeTab = (b.textContent || "").trim().toLowerCase();
        page = 1;
        render();
      }),
    );
    render();
    wireTrendingTags();
    wireTopContributorsFollow();

    // Page filter button opens a real filter modal (source + keyword)
    pageFilterBtn?.addEventListener("click", () => {
      modal({
        title: "Filters",
        primaryText: "Apply",
        secondaryText: "Reset",
        bodyHtml: `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600">Keyword</label>
              <input id="cf-keyword" class="w-full rounded-xl border-slate-200" placeholder="Type to filter..." value="${String(forumFilters.q || "").replace(/"/g, "&quot;")}" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600">Source</label>
              <select id="cf-source" class="w-full rounded-xl border-slate-200">
                <option value="all">All</option>
                <option value="reddit">Reddit</option>
                <option value="github">GitHub</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            <p class="text-xs text-slate-500">Applies client-side to the visible forum feed.</p>
          </div>
        `,
        onPrimary: () => {
          forumFilters.q = (
            document.getElementById("cf-keyword")?.value || ""
          ).trim();
          forumFilters.source = (
            document.getElementById("cf-source")?.value || "all"
          ).trim();
          storage.set(filterKey, forumFilters);
          syncSearchBoxToState();
          page = 1;
          render();
        },
        onSecondary: () => {
          forumFilters.q = "";
          forumFilters.source = "all";
          forumFilters.tag = "";
          storage.set(filterKey, forumFilters);
          syncSearchBoxToState();
          page = 1;
          render();
        },
      });
      setTimeout(() => {
        const sel = document.getElementById("cf-source");
        if (sel) sel.value = forumFilters.source || "all";
      }, 0);
    });

    document
      .getElementById("community-new-post")
      ?.addEventListener("click", () => {
        modal({
          title: "Create Post",
          primaryText: "Post",
          bodyHtml: `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Title</label>
              <input id="cp-title" class="w-full rounded-xl border-slate-200" placeholder="What are you working on?" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Content</label>
              <textarea id="cp-body" class="w-full rounded-xl border-slate-200 min-h-28" placeholder="Share context, constraints, and what you tried..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Tag</label>
                <input id="cp-tag" class="w-full rounded-xl border-slate-200" placeholder="e.g. UI/UX" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Visibility</label>
                <select id="cp-vis" class="w-full rounded-xl border-slate-200">
                  <option value="public">Public</option>
                  <option value="course">Course only</option>
                </select>
              </div>
            </div>
          </div>
        `,
          onPrimary: () => {
            const title = document.getElementById("cp-title")?.value?.trim();
            const body = document.getElementById("cp-body")?.value?.trim();
            const tag =
              document.getElementById("cp-tag")?.value?.trim() || "General";
            if (!title || !body) return toast("Title and content required");

            const post = document.createElement("div");
            post.className =
              "bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden border border-surface-container hover:shadow-md transition-all duration-200";
            post.setAttribute("data-community-post", "1");
            post.innerHTML = `
            <div class="flex gap-4">
              <div class="relative z-10 flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-black text-sm ring-2 ring-white">in</div>
                <div class="threads-line"></div>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="font-bold text-on-background">Instructor <span class="text-xs font-normal text-on-surface-variant ml-2">just now</span></h3>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1 rounded-full">${tag}</span>
                </div>
                <h2 class="text-xl font-headline font-black leading-tight mt-2">${title}</h2>
                <p class="text-on-surface-variant mt-3 leading-relaxed">${body.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>
                <div class="mt-5 flex gap-2 flex-wrap">
                  <button class="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-bold hover:bg-surface-container transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">thumb_up</span> Like
                  </button>
                  <button class="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-bold hover:bg-surface-container transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">chat_bubble</span> Reply
                  </button>
                  <button class="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-bold hover:bg-surface-container transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">bookmark</span> Save
                  </button>
                </div>
              </div>
            </div>
          `;
            feed?.prepend(post);
            toast("Posted");
            render();
          },
        });
      });

    // Existing feed interactions (vote/like/save/share/comments/follow + composer draft/post)
    root.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const icon = (
          btn.querySelector(".material-symbols-outlined")?.textContent || ""
        ).trim();
        const txt = (btn.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        // Follow buttons are handled by wireTopContributorsFollow(); ignore here.

        if (txt.includes("save draft")) {
          const form = btn.closest("form");
          const title =
            form?.querySelector("input, textarea")?.value?.trim() || "";
          const k = "instructor_forum_drafts_v1";
          const cur = storage.get(k, { items: [] });
          cur.items.unshift({
            ts: Date.now(),
            title: title.slice(0, 80) || "Untitled draft",
          });
          storage.set(k, cur);
          toast("Draft saved");
          return;
        }

        // Reactions / actions on posts
        const reactionIcons = new Set([
          "arrow_upward",
          "thumb_up",
          "favorite",
          "bookmark",
          "star",
        ]);
        if (reactionIcons.has(icon)) {
          btn.classList.toggle("text-primary");
          const countEl = btn.querySelector(
            "span.text-xs, span.text-[10px], span.font-label",
          );
          if (countEl && /^\d/.test((countEl.textContent || "").trim())) {
            const n =
              parseInt(
                (countEl.textContent || "0").replace(/[^\d]/g, ""),
                10,
              ) || 0;
            countEl.textContent = String(
              btn.classList.contains("text-primary")
                ? n + 1
                : Math.max(0, n - 1),
            );
          }
          toast("Updated");
          return;
        }

        if (icon === "chat_bubble" || icon === "forum") {
          const post =
            resolveForumPostCardFromClick(btn) ||
            btn.closest("[data-community-post]") ||
            btn.closest("div.bg-surface-container-lowest.rounded-xl") ||
            btn.closest("article");
          const raw = (
            post?.querySelector("h2")?.textContent ||
            post?.querySelector("h3")?.textContent ||
            "thread"
          )
            .trim()
            .slice(0, 160);
          const threadKey = `forum:${raw.replace(/\s+/g, " ").toLowerCase()}`;
          openThreadComments(threadKey, post);
          return;
        }

        if (icon === "ios_share") {
          const url = window.location.href.split("#")[0] + "#post";
          if (navigator.clipboard?.writeText)
            navigator.clipboard.writeText(url).catch(() => {});
          modal({
            title: "Share",
            primaryText: "Copy link",
            secondaryText: "Close",
            bodyHtml: `<div class="text-sm text-slate-600">Share this thread link.</div><div class="mt-2 text-xs font-mono bg-slate-50 rounded-xl p-3 border border-slate-100">${url}</div>`,
            onPrimary: () => {
              navigator.clipboard?.writeText?.(url).catch(() => {});
              toast("Copied");
            },
          });
        }
      },
      true,
    );

    const composer = root.querySelector("form");
    composer?.addEventListener("submit", (e) => {
      e.preventDefault();
      toast("Thread posted");
      modal({
        title: "Posted",
        primaryText: "View in feed",
        bodyHtml: `<div class="text-sm text-slate-600">Your thread is now visible in this feed. It is stored in this browser.</div>`,
        onPrimary: () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      });
      Array.from(composer.querySelectorAll("input, textarea")).forEach(
        (el) => (el.value = ""),
      );
    });

    window.ceForumFeedInvalidate = () => {
      page = 1;
      render();
    };
  }

  function wireCommunityGroup() {
    const h1 = findH1Including("design");
    if (!h1) return;

    // Top bar actions
    const topHelp = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim().toLowerCase() === "help",
    );
    topHelp?.addEventListener(
      "click",
      () => (window.location.href = "../dashboard/help.html"),
    );

    const createCourse = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim().toLowerCase() === "create course",
    );
    createCourse?.addEventListener("click", () => navigateToCourseEditor());

    const notifIcon = Array.from(
      document.querySelectorAll('[data-icon="notifications"]'),
    )
      .map((s) => s.closest("button"))
      .filter(Boolean)[0];
    notifIcon?.addEventListener("click", () => {
      const panel = ensureNotifPanel();
      panel.classList.toggle("hidden");
      renderNotifPanel(panel);
      notifStore.markAllRead();
      updateNotifBadge();
    });

    const premium = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim().toLowerCase() === "go premium",
    );
    premium?.addEventListener("click", () => {
      modal({
        title: "Go Premium",
        primaryText: "Upgrade",
        secondaryText: "Maybe later",
        bodyHtml: `<div class="text-sm text-slate-600">Premium unlocks workshops, assets, and priority events in the full product.</div>`,
        onPrimary: () => toast("Preference saved"),
      });
    });

    const joined = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim().toLowerCase() === "joined",
    );
    joined?.addEventListener("click", () => {
      const isJoined = joined.getAttribute("data-joined") !== "0";
      joined.setAttribute("data-joined", isJoined ? "0" : "1");
      joined.textContent = isJoined ? "Join" : "Joined";
      toast(isJoined ? "Left group" : "Joined group");
    });

    // Post composer: local image attach + link (poll control removed from HTML)
    const cgTextarea = document.getElementById("cg-composer-textarea");
    const cgFileInput = document.getElementById("cg-composer-img");
    const cgPickImg = document.getElementById("cg-composer-pick-img");
    const cgAddLink = document.getElementById("cg-composer-add-link");
    cgPickImg?.addEventListener("click", (e) => {
      e.preventDefault();
      cgFileInput?.click();
    });
    cgFileInput?.addEventListener("change", () => {
      const f = cgFileInput.files?.[0];
      if (!f) return;
      if (!String(f.type || "").startsWith("image/")) {
        toast("Please choose an image file");
        cgFileInput.value = "";
        return;
      }
      if (cgTextarea) {
        const prefix =
          cgTextarea.value && !cgTextarea.value.endsWith("\n") ? "\n" : "";
        cgTextarea.value = `${cgTextarea.value}${prefix}[Image: ${f.name}]\n`;
      }
      toast(`Image attached: ${f.name}`);
      cgFileInput.value = "";
    });
    cgAddLink?.addEventListener("click", (e) => {
      e.preventDefault();
      const url = window.prompt("Paste link URL (https://…)", "https://");
      if (!url) return;
      const u = url.trim();
      if (!cgTextarea) return;
      const prefix =
        cgTextarea.value && !cgTextarea.value.endsWith("\n") ? "\n" : "";
      cgTextarea.value = `${cgTextarea.value}${prefix}${u}\n`;
      toast("Link added to post");
    });

    const cgFeed = document.getElementById("cg-feed");
    const cgPost = document.getElementById("cg-composer-post");
    const escCg = (s) =>
      String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    cgPost?.addEventListener("click", (e) => {
      e.preventDefault();
      const raw = (cgTextarea?.value || "").trim();
      if (!raw) {
        toast("Write something first");
        return;
      }
      if (!cgFeed) return;
      const art = document.createElement("article");
      art.className =
        "bg-surface-container-lowest rounded-xl p-6 shadow-sm border-l-4 border-primary";
      art.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">You</div>
            <div>
              <h3 class="font-headline font-bold text-sm">Your post</h3>
              <p class="text-xs text-slate-500">Just now</p>
            </div>
          </div>
        </div>
        <p class="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">${escCg(raw)}</p>
        <div class="flex items-center gap-6 pt-4 mt-4 border-t border-slate-50 text-xs font-bold text-slate-400">New thread</div>`;
      cgFeed.insertBefore(art, cgFeed.firstChild);
      cgTextarea.value = "";
      toast("Posted to feed");
    });

    const cgMain = document.querySelector("main");
    cgMain?.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const icon = (
          btn.querySelector(".material-symbols-outlined")?.textContent || ""
        ).trim();
        if (icon !== "chat_bubble" && icon !== "forum") return;
        const post =
          resolveForumPostCardFromClick(btn) ||
          btn.closest("article") ||
          btn.closest(".bg-surface-container-lowest.rounded-xl");
        const raw = (
          post?.querySelector("h2")?.textContent ||
          post?.querySelector("h3")?.textContent ||
          "thread"
        )
          .trim()
          .slice(0, 160);
        const threadKey = `group:${raw.replace(/\s+/g, " ").toLowerCase()}`;
        openThreadComments(threadKey, post);
      },
      true,
    );

    // Search in top bar: filters visible blocks
    const search = document.querySelector(
      'input[placeholder^="Search resources"]',
    );
    const filterTargets = Array.from(
      document.querySelectorAll(
        "section, li, article, .bg-surface-container-lowest.rounded-xl",
      ),
    ).filter((x) => x.textContent);
    search?.addEventListener("input", () => {
      const q = (search.value || "").trim().toLowerCase();
      filterTargets.forEach((t) => {
        const txt = (t.textContent || "").replace(/\s+/g, " ").toLowerCase();
        if (!q) t.classList.remove("hidden");
        else t.classList.toggle("hidden", !txt.includes(q));
      });
    });

    // Upcoming events actions
    Array.from(document.querySelectorAll("button")).forEach((b) => {
      const t = (b.textContent || "").trim().toLowerCase();
      if (t === "set reminder") {
        b.addEventListener("click", () => {
          const card = b.closest("div.bg-surface-container-lowest");
          const title =
            card?.querySelector("h4")?.textContent?.trim() || "Event";
          modal({
            title: "Set Reminder",
            primaryText: "Save",
            bodyHtml: `
              <div class="space-y-4">
                <p class="text-sm text-slate-600">Reminder for <b>${title}</b>.</p>
                <label class="block text-xs font-bold text-slate-600">Notify me</label>
                <select id="cg-remind" class="w-full rounded-xl border-slate-200">
                  <option>10 minutes before</option>
                  <option>1 hour before</option>
                  <option>1 day before</option>
                </select>
              </div>
            `,
            onPrimary: () => toast("Reminder saved"),
          });
        });
      }
      if (t === "join waiting list") {
        b.addEventListener("click", () => {
          b.textContent = "On Waiting List";
          b.classList.remove("hover:underline");
          toast("Added to waiting list");
        });
      }
      if (t === "view all events") {
        b.addEventListener("click", () => {
          const widget = Array.from(document.querySelectorAll("h3")).find((x) =>
            (x.textContent || "").toLowerCase().includes("upcoming events"),
          );
          widget?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    });

    // Shared resources actions
    document.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const icon = (
          btn.querySelector(".material-symbols-outlined")?.textContent || ""
        ).trim();
        if (icon === "download") {
          downloadText(
            "shared_resource.pdf",
            "%PDF-1.3\n% Shared resource — sample export\n",
            "application/pdf",
          );
          toast("Download started");
        }
        if (icon === "open_in_new") {
          modal({
            title: "External Link",
            primaryText: "Open",
            secondaryText: "Close",
            bodyHtml: `<div class="text-sm text-slate-600">This would open a community link in a new tab.</div>`,
            onPrimary: () =>
              window.open("https://www.figma.com/community", "_blank"),
          });
        }
        if (icon === "arrow_forward") {
          window.location.href = "../resources/resource_library.html";
        }
      },
      true,
    );

    // Upload resource (adds a lightweight resource entry to the list)
    const uploadBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("upload resource"),
    );
    uploadBtn?.addEventListener("click", () => {
      modal({
        title: "Upload Resource",
        primaryText: "Upload",
        bodyHtml: `
          <div class="space-y-4">
            <label class="block text-xs font-bold text-slate-600">Title</label>
            <input id="cg-res-title" class="w-full rounded-xl border-slate-200" placeholder="e.g. Wireframe template" />
            <label class="block text-xs font-bold text-slate-600">Type</label>
            <select id="cg-res-type" class="w-full rounded-xl border-slate-200">
              <option>PDF</option>
              <option>Link</option>
              <option>Document</option>
            </select>
          </div>
        `,
        onPrimary: () => {
          const t = (
            document.getElementById("cg-res-title")?.value || ""
          ).trim();
          if (!t) return toast("Title required");
          const ul = Array.from(document.querySelectorAll("h3"))
            .find((x) =>
              (x.textContent || "").toLowerCase().includes("shared resources"),
            )
            ?.closest("div")
            ?.querySelector("ul");
          const li = document.createElement("li");
          li.className =
            "flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors";
          li.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                <span class="material-symbols-outlined" data-icon="article">article</span>
              </div>
              <div>
                <p class="font-bold text-xs">${t}</p>
                <p class="text-[10px] text-slate-400">Uploaded just now</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-primary transition-colors">
              <span class="material-symbols-outlined text-sm" data-icon="download">download</span>
            </button>
          `;
          ul?.prepend(li);
          toast("Resource uploaded");
        },
      });
    });

    // New thread FAB (adds a new post card to the feed)
    const newThreadBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("new thread"),
    );
    newThreadBtn?.addEventListener("click", () => {
      modal({
        title: "New Thread",
        primaryText: "Post",
        bodyHtml: `
          <div class="space-y-4">
            <label class="block text-xs font-bold text-slate-600">Title</label>
            <input id="cg-thread-title" class="w-full rounded-xl border-slate-200" placeholder="Start a discussion..." />
            <label class="block text-xs font-bold text-slate-600">Content</label>
            <textarea id="cg-thread-body" class="w-full rounded-xl border-slate-200 min-h-24" placeholder="Share context and ask a question..."></textarea>
          </div>
        `,
        onPrimary: () => {
          const title = (
            document.getElementById("cg-thread-title")?.value || ""
          ).trim();
          const body = (
            document.getElementById("cg-thread-body")?.value || ""
          ).trim();
          if (!title || !body) return toast("Title and content required");
          const feed = document.querySelector("div.lg\\:col-span-8");
          const card = document.createElement("div");
          card.className =
            "bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container";
          card.innerHTML = `
            <p class="text-[10px] uppercase tracking-widest font-black text-primary">New</p>
            <h3 class="font-headline font-black text-xl mt-2">${title}</h3>
            <p class="text-sm text-on-surface-variant mt-3">${body.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>
          `;
          feed?.prepend(card);
          toast("Thread posted");
        },
      });
    });
  }

  function wireGlobalActionCenter() {
    // Provide real UI outcomes for icon-only buttons across pages (no "mock action" messaging).
    // This intentionally runs in capture phase to catch unhandled buttons, but respects preventDefault.
    document.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        if (e.defaultPrevented) return;
        // Instructor/student "Create thread" overlay: let composer handle its own buttons (Save Draft / Post Thread).
        if (btn.closest("#create-post")) return;
        if (btn.closest(".ce-module-editor-card")) return;
        if (btn.getAttribute("data-global-skip") === "1") return;
        if (btn.classList.contains("faq-filter")) return;
        if (btn.classList.contains("pageNum") || btn.getAttribute("data-page"))
          return;

        const icon = (
          btn.querySelector(".material-symbols-outlined")?.textContent || ""
        ).trim();
        const text = (btn.textContent || "").replace(/\s+/g, " ").trim();
        const label = (text || icon).toLowerCase();

        // Social reactions (forum / cards)
        const reactionIcons = new Set([
          "thumb_up",
          "favorite",
          "bookmark",
          "star",
          "arrow_upward",
        ]);
        if (reactionIcons.has(icon)) {
          btn.classList.toggle("text-primary");
          // Try to increment/decrement any number in the button text
          const m = text.match(/([\d.]+)\s*(k)?/i);
          if (m) {
            const base = parseFloat(m[1]);
            const isK = !!m[2];
            const delta = btn.classList.contains("text-primary") ? 1 : -1;
            const next = Math.max(0, base + delta);
            const nextText = isK
              ? `${next.toFixed(1)}k`
              : String(Math.round(next));
            btn.innerHTML = btn.innerHTML.replace(m[0], nextText);
          }
          return;
        }
        if (icon === "chat_bubble" || icon === "forum") {
          const page = getPageKey();
          if (
            page === "community_forum" ||
            page === "instructor_forum_moderation" ||
            page === "community_group"
          )
            return;
          const post = resolveForumPostCardFromClick(btn);
          const raw = (
            post?.querySelector("h2, h3")?.textContent ||
            post?.textContent ||
            "thread"
          )
            .trim()
            .slice(0, 80);
          const threadKey = `global:${page}:${raw.replace(/\s+/g, " ").toLowerCase().slice(0, 60)}`;
          openThreadComments(threadKey, post);
          return;
        }

        // Common quick actions
        if (icon === "notifications" || label === "notifications") {
          // Top nav uses id + wireNotifications (bubble). Avoid double-toggle from capture-phase handler.
          if (btn.id === "instructor-notifications-btn") return;
          const panel = ensureNotifPanel();
          panel.classList.toggle("hidden");
          renderNotifPanel(panel);
          notifStore.markAllRead();
          updateNotifBadge();
          return;
        }
        if (icon === "shopping_cart" || label === "shopping_cart") {
          // Instructor nav cart uses capture-phase document listener + bubble onclick;
          // calling toggleCart here would double-fire (open then close). Let inline onclick handle it.
          if (btn.getAttribute("aria-label") === "Open cart") return;
          if (typeof window.toggleCart === "function") {
            window.toggleCart();
          } else {
            window.location.href = "../bookstore/cart_list.html";
          }
          return;
        }
        if (
          icon === "help" ||
          icon === "help_outline" ||
          label.includes("help")
        ) {
          modal({
            title: "Help",
            primaryText: "Open Help Center",
            secondaryText: "Close",
            bodyHtml: `<div class="text-sm text-slate-600">Browse FAQs or contact support.</div>`,
            onPrimary: () => (window.location.href = "../dashboard/help.html"),
          });
          return;
        }
        if (icon === "filter_list" || icon === "tune") {
          modal({
            title: "Filters",
            primaryText: "Apply",
            secondaryText: "Reset",
            bodyHtml: `
              <div class="space-y-4">
                <p class="text-sm text-slate-600">This panel provides page-level filtering controls.</p>
                <label class="block text-xs font-bold text-slate-600">Keyword</label>
                <input id="ac-keyword" class="w-full rounded-xl border-slate-200" placeholder="Type to filter..." />
              </div>
            `,
            onPrimary: () => {
              const q = (document.getElementById("ac-keyword")?.value || "")
                .trim()
                .toLowerCase();
              if (!q) return;
              // Basic, safe filter: hide cards/articles/rows that don't include keyword
              const targets = Array.from(
                document.querySelectorAll(
                  "article, .resource-card, tr, .group",
                ),
              );
              targets.forEach((t) => {
                const tt = (t.textContent || "")
                  .replace(/\s+/g, " ")
                  .toLowerCase();
                if (tt) t.classList.toggle("hidden", !tt.includes(q));
              });
            },
          });
          return;
        }
        if (icon === "ios_share" || icon === "share") {
          const shareText = document.title + " — " + window.location.href;
          if (navigator.clipboard?.writeText) {
            navigator.clipboard
              .writeText(shareText)
              .then(() => toast("Link copied"));
          } else {
            modal({
              title: "Share",
              primaryText: "Close",
              bodyHtml: `<div class="text-sm text-slate-600 break-all">${shareText}</div>`,
              onPrimary: () => {},
            });
          }
          return;
        }
        if (icon === "more_vert" || icon === "more_horiz") {
          const container =
            btn.closest("tr, article, .resource-card, .group") || btn;
          modal({
            title: "Actions",
            primaryText: "Close",
            secondaryText: "Delete",
            bodyHtml: `
              <div class="space-y-3">
                <button id="ac-open" class="w-full px-4 py-3 rounded-xl bg-violet-600 text-white font-black">Open</button>
                <button id="ac-edit" class="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-900 font-bold">Edit</button>
              </div>
            `,
            onPrimary: () => {},
          });
          // Post-modal wiring (next tick)
          setTimeout(() => {
            document
              .getElementById("ac-open")
              ?.addEventListener("click", () => {
                // Best-effort open: navigate to course editor if on courses pages
                const p = getPageKey();
                if (p === "dashboard_home" || p === "dashboard_courses")
                  window.location.href =
                    "../course_management/course_module_editor.html";
                else toast("Opened");
              });
            document
              .getElementById("ac-edit")
              ?.addEventListener("click", () => {
                window.location.href =
                  "../course_management/course_module_editor.html";
              });
          }, 0);
          // Delete handled via modal secondary button (close + remove)
          // Our modal currently doesn't expose secondary hook; fallback: remove on close not desired.
          // So we keep delete as a separate click handler on actual delete icon buttons instead.
          return;
        }

        // If the button is clearly a "delete" icon, confirm then remove the nearest container.
        if (icon === "delete" || label === "delete") {
          const target =
            btn.closest("tr, article, .resource-card, .group") || null;
          modal({
            title: "Delete",
            primaryText: "Delete",
            secondaryText: "Cancel",
            bodyHtml: `<div class="text-sm text-slate-600">This will remove the item from the current view in this browser.</div>`,
            onPrimary: () => {
              target?.remove();
              toast("Deleted");
            },
          });
          return;
        }

        // Generic pagination (numeric buttons) -> actually switch visible items
        if (/^\d+$/.test(text)) {
          const pageNum = Number(text);
          const scope =
            btn.closest(
              "section, main, article, div.bg-surface-container-lowest, div.bg-surface-container-low, div.rounded-xl, div.rounded-2xl",
            ) ||
            document.querySelector("main") ||
            document.body;
          const candidates = Array.from(
            scope.querySelectorAll(
              "article, tbody tr, .resource-card, .bg-surface-container-lowest.rounded-xl, .group",
            ),
          );
          const items = candidates.filter(
            (el) =>
              el !== btn &&
              !el.contains(btn) &&
              (el.textContent || "").trim().length > 20,
          );
          if (items.length >= 3) {
            const pageSize = 6;
            const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
            const p = Math.min(Math.max(1, pageNum), pageCount);
            items.forEach((el, idx) =>
              el.classList.toggle(
                "hidden",
                !(idx >= (p - 1) * pageSize && idx < p * pageSize),
              ),
            );

            const siblings = Array.from(
              (btn.parentElement || scope).querySelectorAll("button"),
            ).filter((b) => /^\d+$/.test((b.textContent || "").trim()));
            siblings.forEach((b) =>
              b.classList.toggle(
                "bg-primary",
                (b.textContent || "").trim() === String(p),
              ),
            );
            siblings.forEach((b) =>
              b.classList.toggle(
                "text-white",
                (b.textContent || "").trim() === String(p),
              ),
            );
            return;
          }
        }

        // Generic tabs (small button group like Trending/Latest/Top/...) — skip Help Center FAQ pills (handled by wireHelpCenterFaq)
        const parent = btn.parentElement;
        if (parent) {
          const sibs = Array.from(parent.querySelectorAll("button"));
          const isTabGroup =
            sibs.length >= 2 &&
            sibs.length <= 8 &&
            sibs.every((b) => ((b.textContent || "").trim().length || 0) <= 24);
          if (
            isTabGroup &&
            sibs.some((b) => b.classList.contains("faq-filter"))
          )
            return;
          if (isTabGroup) {
            sibs.forEach((b) => {
              const act = b === btn;
              b.classList.toggle("bg-primary", act);
              b.classList.toggle("text-white", act);
              b.classList.toggle("shadow-md", act);
            });

            // best-effort: filter items under the nearest section by tab keyword
            const keyword = (btn.textContent || "").trim().toLowerCase();
            const scope =
              btn.closest(
                "section, main, article, div.rounded-xl, div.rounded-2xl",
              ) ||
              document.querySelector("main") ||
              document.body;
            const items = Array.from(
              scope.querySelectorAll("article, tbody tr, .resource-card"),
            ).filter((el) => el !== btn && !el.contains(btn));
            if (items.length) {
              items.forEach((el) => {
                const t = (el.textContent || "")
                  .replace(/\s+/g, " ")
                  .toLowerCase();
                const show =
                  keyword === "all" ||
                  keyword === "trending" ||
                  t.includes(keyword);
                el.classList.toggle("hidden", !show);
              });
            }
            return;
          }
        }

        // Final fallback: unknown buttons create a task (real system effect), no meaningless modal.
        try {
          const title = (text || icon || "Action").replace(/\s+/g, " ").trim();
          tasksStore().add(`Follow up: ${title}`, window.location.href);
          toast("Added to Tasks");
          btn.classList.add("ring-2", "ring-violet-200");
        } catch {
          toast("Saved");
        }
      },
      true,
    );
  }

  function wireCheckout() {
    const completeBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("complete purchase"),
    );
    if (!completeBtn) return;

    // Help / support
    const helpBtn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        (b.textContent || "").trim() === "help_outline" ||
        b.querySelector('[data-icon=\"help_outline\"]'),
    );
    helpBtn?.addEventListener("click", () => {
      modal({
        title: "Need help?",
        primaryText: "Contact support",
        secondaryText: "Close",
        bodyHtml: `
          <div class="space-y-3 text-sm text-slate-600">
            <p>Checkout questions are handled through the Instructor help center.</p>
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p class="font-black text-slate-900">Common fixes</p>
              <ul class="mt-2 list-disc pl-5 space-y-1">
                <li>Check required fields are filled.</li>
                <li>Return to cart to adjust quantities.</li>
                <li>Refresh the page if the UI gets out of sync.</li>
              </ul>
            </div>
          </div>
        `,
        onPrimary: () => {
          window.location.href = "../help/contact_support.html";
        },
      });
    });

    const requiredInputs = Array.from(
      document.querySelectorAll(
        'input[type=\"text\"], input[type=\"tel\"], input[type=\"email\"], input[type=\"password\"]',
      ),
    );
    const missing = () => requiredInputs.filter((i) => !(i.value || "").trim());

    completeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const miss = missing();
      if (miss.length) {
        miss[0].focus();
        toast("Please complete the form");
        return;
      }

      // Create a local order entry
      const totals = cartStore.totals();
      const ordersKey = "instructor_orders_v1";
      const orders = storage.get(ordersKey, { items: [] });

      const orderId = "EDU-" + String(Date.now()).slice(-6);
      const cart = cartStore.get();
      const summary = cart.items.map((x) => ({
        id: x.id,
        title: x.title,
        price: x.price,
        qty: x.qty,
      }));

      orders.items = orders.items || [];
      orders.items.unshift({
        id: orderId,
        ts: Date.now(),
        status: "Paid",
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        items: summary,
      });
      storage.set(ordersKey, orders);

      // Clear cart and navigate to order history page
      cartStore.clear();
      updateCartBadges();
      const page = getPageKey();
      if (page === "cart_checkout_flow") {
        // Show the built-in success overlay on this screen
        const overlay = document.querySelector("div.fixed.inset-0.z-\\[70\\]");
        const idEl = overlay?.querySelector("p.text-xl.font-bold");
        if (idEl) idEl.textContent = `#${orderId}`;
        overlay?.classList.remove("hidden");
        // Scroll into view for better UX
        overlay?.scrollIntoView({ block: "center" });
      } else {
        window.location.href = "order_history_download.html";
      }
    });
  }

  function wireOrderHistory() {
    const h1 = findH1Including("order history");
    if (!h1) return;

    const searchInput = document.querySelector(
      'input[placeholder*="Search orders"]',
    );
    const orders = Array.from(document.querySelectorAll("article"));

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase().trim();
        orders.forEach((card) => {
          const text = card.textContent.toLowerCase();
          card.style.display = q === "" || text.includes(q) ? "block" : "none";
        });
      });
    }

    // Filters
    const filterButtons = Array.from(
      document.querySelectorAll("button"),
    ).filter((b) =>
      ["last 30 days", "this year", "physical", "digital"].includes(
        b.textContent.toLowerCase().trim(),
      ),
    );
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.textContent.toLowerCase().trim();
        filterButtons.forEach((b) =>
          b.classList.toggle("bg-primary", b === btn),
        );
        filterButtons.forEach((b) =>
          b.classList.toggle("text-on-primary", b === btn),
        );

        if (cat === "last 30 days" || cat === "this year") {
          // just show all for mock
          orders.forEach((o) => (o.style.display = "block"));
        } else {
          orders.forEach((o) => {
            const text = o.textContent.toLowerCase();
            o.style.display = text.includes(cat) ? "block" : "none";
          });
        }
        window.showToast(`Filtered by: ${btn.textContent}`);
      });
    });

    // Top-right icons
    const topButtons = Array.from(document.querySelectorAll("header button"));
    const cartBtn = topButtons.find((b) =>
      (b.textContent || "").includes("shopping_cart"),
    );
    const notifBtn = topButtons.find((b) =>
      (b.textContent || "").includes("notifications"),
    );
    cartBtn?.addEventListener(
      "click",
      () => (window.location.href = "cart_list.html"),
    );
    notifBtn?.addEventListener("click", () => {
      const panel = ensureNotifPanel();
      panel.classList.toggle("hidden");
      renderNotifPanel(panel);
      notifStore.markAllRead();
      updateNotifBadge();
    });

    // Membership CTA
    const membershipBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("view membership"),
    );
    membershipBtn?.addEventListener("click", () => {
      modal({
        title: "Membership",
        primaryText: "Upgrade",
        secondaryText: "Close",
        bodyHtml: `
          <div class="space-y-4">
            <p class="text-sm text-slate-600">Membership options will appear here when connected to billing.</p>
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p class="font-black text-slate-900">Benefits</p>
              <ul class="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>Free shipping on physical items</li>
                <li>Instant access to digital downloads</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        `,
        onPrimary: () => toast("Preference saved"),
      });
    });

    // Search + filters (Last 30 Days / This Year / Physical / Digital)
    const search = document.querySelector(
      'input[placeholder^=\"Search orders\"]',
    );
    const filterBtns = Array.from(
      document.querySelectorAll("section.bg-surface-container-low button"),
    );
    let activeFilter = (
      filterBtns.find((b) => b.classList.contains("bg-primary"))?.textContent ||
      "Last 30 Days"
    ).trim();

    const articles = Array.from(document.querySelectorAll("article"));
    function apply() {
      const q = (search?.value || "").trim().toLowerCase();
      const f = (activeFilter || "").trim().toLowerCase();

      articles.forEach((a) => {
        const t = (a.textContent || "").replace(/\s+/g, " ").toLowerCase();
        let ok = !q || t.includes(q);
        if (ok && (f === "physical" || f === "digital")) {
          ok = t.includes(f === "physical" ? "hardcover" : "digital edition");
        }
        a.classList.toggle("hidden", !ok);
      });
    }

    search?.addEventListener("input", apply);
    filterBtns.forEach((b) => {
      b.addEventListener("click", () => {
        activeFilter = (b.textContent || "").trim();
        filterBtns.forEach((x) => {
          const act = x === b;
          x.classList.toggle("bg-primary", act);
          x.classList.toggle("text-on-primary", act);
          x.classList.toggle("shadow-md", act);
        });
        apply();
      });
    });

    // Card actions: invoice (description), download, product details, track, return
    function downloadInvoice(orderId) {
      downloadText(
        `invoice_${orderId}.txt`,
        `Invoice ${orderId}\n\n(Sample invoice text — saved from this browser)\n`,
        "text/plain",
      );
      toast("Invoice downloaded");
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const icon = (
        btn.querySelector(".material-symbols-outlined")?.textContent ||
        btn.textContent ||
        ""
      ).trim();
      const text = (btn.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      const card = btn.closest("article");
      const orderId =
        (
          card?.querySelector("p.font-headline.font-bold.text-primary")
            ?.textContent || ""
        )
          .replace("#", "")
          .trim() || "EDU-00000";

      if (text.includes("browse bookstore")) {
        window.location.href = "../dashboard/minimal_bookstore.html";
        return;
      }

      if (icon === "description") {
        downloadInvoice(orderId);
        return;
      }

      if (text.includes("download now")) {
        downloadText(
          `${orderId}_download.pdf`,
          `%PDF-1.3\n% ${orderId} — sample export\n`,
          "application/pdf",
        );
        toast("Download started");
        return;
      }
      if (text.includes("product details")) {
        modal({
          title: "Product Details",
          primaryText: "Close",
          secondaryText: "Add to wishlist",
          bodyHtml: `<div class="text-sm text-slate-600">Order <b>${orderId}</b> — details shown from data stored in this browser.</div>`,
          onPrimary: () => {},
        });
        return;
      }
      if (text.includes("track package")) {
        modal({
          title: "Tracking",
          primaryText: "Close",
          bodyHtml: `
            <div class="space-y-3 text-sm text-slate-600">
              <p>Order <b>${orderId}</b> is in transit.</p>
              <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p class="font-black text-slate-900">Latest update</p>
                <p class="mt-2">Departed local facility · ETA 2–4 days</p>
              </div>
            </div>
          `,
          onPrimary: () => {},
        });
        return;
      }
      if (text.includes("return item")) {
        modal({
          title: "Return Item",
          primaryText: "Submit return",
          secondaryText: "Cancel",
          bodyHtml: `
            <div class="space-y-4">
              <p class="text-sm text-slate-600">Create a return request for <b>${orderId}</b>.</p>
              <label class="block text-xs font-bold text-slate-600">Reason</label>
              <select id="ret-reason" class="w-full rounded-xl border-slate-200">
                <option>Damaged</option>
                <option>Arrived late</option>
                <option>Changed my mind</option>
              </select>
            </div>
          `,
          onPrimary: () => toast("Return submitted"),
        });
        return;
      }
    });

    // Footer pagination buttons (1/2/3 + chevrons): simple client-side page switching
    const pageButtons = Array.from(
      document.querySelectorAll("footer button"),
    ).filter((b) => /^\d+$/.test((b.textContent || "").trim()));
    const chevronButtons = Array.from(
      document.querySelectorAll("footer button span.material-symbols-outlined"),
    )
      .map((s) => s.closest("button"))
      .filter(Boolean);
    let page = 1;
    function renderPage() {
      // This page only has 2 cards; emulate pages by toggling visibility
      articles.forEach((a, i) =>
        a.classList.toggle("hidden", page !== 1 && i === 0),
      );
      pageButtons.forEach((b) => {
        const n = Number((b.textContent || "").trim());
        const active = n === page;
        b.classList.toggle("bg-primary", active);
        b.classList.toggle("text-white", active);
      });
    }
    pageButtons.forEach((b) =>
      b.addEventListener("click", () => {
        page = Number((b.textContent || "").trim());
        renderPage();
      }),
    );
    chevronButtons.forEach((b) => {
      const dir = (b.querySelector("span")?.textContent || "").trim();
      b.addEventListener("click", () => {
        page += dir === "chevron_left" ? -1 : 1;
        page = Math.min(Math.max(1, page), 3);
        renderPage();
      });
    });

    // Mobile bottom nav
    const mobile = Array.from(
      document.querySelectorAll("nav.md\\:hidden button"),
    );
    if (mobile.length >= 4) {
      mobile[0].addEventListener(
        "click",
        () => (window.location.href = "../dashboard/instructor_dashboard.html"),
      );
      mobile[1].addEventListener(
        "click",
        () =>
          (window.location.href =
            "../dashboard/course_management_dashboard.html"),
      );
      mobile[2].addEventListener("click", () => {});
      mobile[3].addEventListener(
        "click",
        () => (window.location.href = "../dashboard/instructor_profile.html"),
      );
    }

    apply();
    renderPage();
  }

  function wireCartCheckoutFlow() {
    // Top right icons (notifications / shopping cart)
    const notifBtn = Array.from(
      document.querySelectorAll("header button"),
    ).find((b) => (b.textContent || "").trim() === "notifications");
    const cartBtn = Array.from(document.querySelectorAll("header button")).find(
      (b) => (b.textContent || "").trim() === "shopping_cart",
    );

    notifBtn?.addEventListener("click", () => {
      // Reuse global notifications panel
      const panel = ensureNotifPanel();
      panel.classList.toggle("hidden");
      renderNotifPanel(panel);
      notifStore.markAllRead();
      updateNotifBadge();
    });
    cartBtn?.addEventListener("click", () => {
      const shell = document.querySelector("div.fixed.inset-0.z-\\[60\\]");
      shell?.classList.toggle("hidden");
    });

    const shell = document.querySelector("div.fixed.inset-0.z-\\[60\\]");
    const cartItem = shell?.querySelector("div.group.relative.flex");
    const qtyMinus =
      cartItem?.querySelector('button:not([class*=\"delete\"])') || null;
    const delBtn =
      cartItem?.querySelector("button.material-symbols-outlined") || null;
    const qtyBtns = cartItem
      ? Array.from(cartItem.querySelectorAll("button")).filter(
          (b) =>
            (b.textContent || "").trim() === "−" ||
            (b.textContent || "").trim() === "+",
        )
      : [];
    const qtyLabel = cartItem?.querySelector("span.font-bold.text-sm") || null;
    const estTotal =
      shell?.querySelector("div.flex.justify-between.mb-6 span.text-2xl") ||
      null;
    const proceedBtn = Array.from(shell?.querySelectorAll("button") || []).find(
      (b) =>
        (b.textContent || "").toLowerCase().includes("proceed to checkout"),
    );

    function money(n) {
      return "$" + Number(n).toFixed(2);
    }

    function renderCartPanel() {
      const cur = cartStore.get();
      const totals = cartStore.totals();
      if (estTotal) estTotal.textContent = money(totals.total);

      // If empty, show empty state and disable proceed
      if (!cur.items.length) {
        if (cartItem) {
          cartItem.innerHTML = `
            <div class="w-full text-center py-10">
              <p class="text-lg font-black font-headline">Your cart is empty</p>
              <p class="text-sm text-on-surface-variant mt-2">Return to the bookstore to add resources.</p>
            </div>
          `;
        }
        proceedBtn?.setAttribute("disabled", "true");
        proceedBtn?.classList.add("opacity-50", "cursor-not-allowed");
        return;
      }

      proceedBtn?.removeAttribute("disabled");
      proceedBtn?.classList.remove("opacity-50", "cursor-not-allowed");

      // Bind the panel to the first cart item for this layout
      const it = cur.items[0];
      if (qtyLabel) qtyLabel.textContent = String(it.qty).padStart(2, "0");
      const priceEl = cartItem?.querySelector("span.text-xl.font-black");
      if (priceEl) priceEl.textContent = money(it.price * it.qty);
      const titleEl = cartItem?.querySelector("h3");
      if (titleEl) titleEl.textContent = it.title;
    }

    qtyBtns.forEach((b) => {
      b.addEventListener("click", () => {
        const cur = cartStore.get();
        if (!cur.items.length) return;
        const it = cur.items[0];
        const t = (b.textContent || "").trim();
        const next = Math.max(1, it.qty + (t === "−" ? -1 : 1));
        cartStore.updateQty(it.id, next);
        renderCartPanel();
        updateCartBadges();
      });
    });

    delBtn?.addEventListener("click", () => {
      const cur = cartStore.get();
      if (!cur.items.length) return;
      cartStore.remove(cur.items[0].id);
      renderCartPanel();
      updateCartBadges();
    });

    proceedBtn?.addEventListener("click", () => {
      window.location.href = "cart_secure_checkout.html";
    });

    // Success overlay "Go to My Learning"
    const successOverlay = document.querySelector(
      "div.fixed.inset-0.z-\\[70\\]",
    );
    const goLearningBtn = Array.from(
      successOverlay?.querySelectorAll("button") || [],
    ).find((b) =>
      (b.textContent || "").toLowerCase().includes("go to my learning"),
    );
    goLearningBtn?.addEventListener("click", () => {
      window.location.href = "../placeholders/student-course-discovery.html";
    });

    // Default: keep cart panel visible on this screen
    shell?.classList.remove("hidden");
    window.__instructorRenderCheckoutFlowPanel = renderCartPanel;
    renderCartPanel();
    updateCartBadges();
  }

  function wireReports() {
    const hasReportsHeader = Array.from(document.querySelectorAll("h1")).some(
      (h) => (h.textContent || "").toLowerCase().includes("reports"),
    );
    if (!hasReportsHeader) return;

    const search = document.querySelector(
      'input[placeholder=\"Search by report name...\"]',
    );
    const selects = Array.from(document.querySelectorAll("select"));
    const typeSelect = selects.find((s) =>
      (s.textContent || "").toLowerCase().includes("report type"),
    );
    const rangeSelect = selects.find((s) =>
      (s.textContent || "").toLowerCase().includes("date range"),
    );
    const applyBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toLowerCase().includes("apply"),
    );
    const historyBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").toLowerCase().includes("view full history"),
    );
    const automationBtn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        (b.textContent || "").toLowerCase().includes("configure automation"),
    );
    const tableBody = document.querySelector("tbody");
    const rowsAll = tableBody
      ? Array.from(tableBody.querySelectorAll("tr"))
      : [];
    const pagination = Array.from(document.querySelectorAll("button")).filter(
      (b) => ["1", "2"].includes((b.textContent || "").trim()),
    );
    const mobileNavButtons = Array.from(
      document.querySelectorAll("nav.md\\:hidden button"),
    );

    // Prevent global capture-phase filter modal from hijacking the page's "Apply" button (filter_list icon).
    applyBtn?.setAttribute("data-global-skip", "1");

    let currentPage = 1;
    const pageSize = 4;
    const stateKey = "instructor_reports_filters_v1";
    const filters = storage.get(stateKey, {
      q: "",
      type: "Report Type",
      range: "Date Range",
    });

    function reportNameFromRow(tr) {
      const name =
        tr.querySelector("td span.font-bold")?.textContent ||
        tr.querySelector("td")?.textContent ||
        "";
      return name.trim();
    }
    function reportTypeFromRow(tr) {
      const badge = tr.querySelector("td span.rounded-full");
      return (badge?.textContent || "").trim().toLowerCase();
    }
    function reportDateFromRow(tr) {
      const tds = tr.querySelectorAll("td");
      return (tds[1]?.textContent || "").trim();
    }

    function matchRange(dateStr, rangeLabel) {
      // Static sample data dates are 2023; keep simple mapping
      const r = (rangeLabel || "").toLowerCase();
      if (!r || r === "date range") return true;
      // Keep permissive: sample data across Oct 2023
      return true;
    }

    function isVisible(tr) {
      const q = (filters.q || "").toLowerCase();
      const name = reportNameFromRow(tr).toLowerCase();
      const type = reportTypeFromRow(tr);
      if (q && !name.includes(q)) return false;
      const selType = (filters.type || "").toLowerCase();
      if (selType && selType !== "report type" && !type.includes(selType))
        return false;
      const date = reportDateFromRow(tr);
      if (!matchRange(date, filters.range)) return false;
      return true;
    }

    function filteredRows() {
      return rowsAll.filter(isVisible);
    }

    function renderPage() {
      const rows = filteredRows();
      const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
      currentPage = Math.min(Math.max(1, currentPage), pageCount);

      rowsAll.forEach((r) => r.classList.add("hidden"));
      rows
        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
        .forEach((r) => r.classList.remove("hidden"));

      // Pagination button styles
      pagination.forEach((b) => {
        const n = (b.textContent || "").trim();
        const active = Number(n) === currentPage;
        b.classList.toggle("bg-primary", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("shadow-md", active);
      });

      const tally = document.querySelector(
        "div.bg-surface-container-low\\/20 p",
      );
      if (tally)
        tally.textContent = `Showing ${Math.min(pageSize, rows.length)} of ${rows.length} reports`;
    }

    // Restore UI state
    if (search) search.value = filters.q || "";
    if (typeSelect && filters.type) typeSelect.value = filters.type;
    if (rangeSelect && filters.range) rangeSelect.value = filters.range;

    search?.addEventListener("input", () => {
      filters.q = search.value || "";
      storage.set(stateKey, filters);
      currentPage = 1;
      renderPage();
    });
    typeSelect?.addEventListener("change", () => {
      filters.type = typeSelect.value || "Report Type";
      storage.set(stateKey, filters);
    });
    rangeSelect?.addEventListener("change", () => {
      filters.range = rangeSelect.value || "Date Range";
      storage.set(stateKey, filters);
    });

    applyBtn?.addEventListener("click", () => {
      storage.set(stateKey, filters);
      currentPage = 1;
      renderPage();
      toast("Filters applied");
    });

    historyBtn?.addEventListener("click", () => {
      modal({
        title: "Download History",
        primaryText: "Close",
        secondaryText: "Export history",
        bodyHtml: `
          <div class="space-y-4">
            <p class="text-sm text-slate-600">Recent downloads are listed from data stored in this browser.</p>
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm">
              <div class="flex justify-between"><span class="font-bold">Q3_Student_Progress.pdf</span><span class="text-slate-500">2h ago</span></div>
              <div class="flex justify-between mt-2"><span class="font-bold">Enrollment_Data_May.csv</span><span class="text-slate-500">Yesterday</span></div>
            </div>
          </div>
        `,
        onPrimary: () => {},
      });
    });

    automationBtn?.addEventListener("click", () => {
      modal({
        title: "Automation",
        primaryText: "Save",
        bodyHtml: `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Frequency</label>
                <select id="rep-freq" class="w-full rounded-xl border-slate-200">
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Delivery</label>
                <select id="rep-delivery" class="w-full rounded-xl border-slate-200">
                  <option>Email</option>
                  <option>Cloud Drive</option>
                </select>
              </div>
            </div>
            <label class="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input id="rep-enabled" type="checkbox" class="rounded border-slate-300" checked />
              Enable scheduling
            </label>
            <p class="text-xs text-slate-500">Settings apply in this browser only.</p>
          </div>
        `,
        onPrimary: () => toast("Automation saved"),
      });
    });

    // Download actions (table)
    rowsAll.forEach((tr) => {
      const btn = tr.querySelector("button");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const name = reportNameFromRow(tr) || "report";
        const type = reportTypeFromRow(tr);
        const isPdf = tr
          .querySelector(".material-symbols-outlined")
          ?.textContent?.toLowerCase()
          .includes("picture_as_pdf");
        const filename = (
          name.replace(/[^a-z0-9_-]+/gi, "_") + (isPdf ? ".pdf" : ".csv")
        ).toLowerCase();
        const content = isPdf
          ? `%PDF-1.3\\n% Sample PDF: ${name}\\n`
          : `name,type,date\\n${name},${type},${reportDateFromRow(tr)}\\n`;
        downloadText(filename, content, isPdf ? "application/pdf" : "text/csv");
        toast("Download started");
      });
    });

    // Recent downloads list (top card)
    Array.from(
      document.querySelectorAll("div.space-y-4 .material-symbols-outlined"),
    ).forEach((icon) => {
      if ((icon.textContent || "").trim() !== "download") return;
      icon.closest(".group")?.addEventListener("click", () => {
        downloadText(
          "recent_download.txt",
          "Recent download — sample file.",
          "text/plain",
        );
        toast("Download started");
      });
    });

    // Pagination
    pagination.forEach((b) => {
      b.addEventListener("click", () => {
        currentPage = Number((b.textContent || "").trim()) || 1;
        renderPage();
      });
    });
    const chevrons = Array.from(
      document.querySelectorAll("button span.material-symbols-outlined"),
    )
      .filter((s) =>
        ["chevron_left", "chevron_right"].includes(
          (s.textContent || "").trim(),
        ),
      )
      .map((s) => s.closest("button"))
      .filter(Boolean);
    chevrons.forEach((b) => {
      const dir = (b.querySelector("span")?.textContent || "").trim();
      b.addEventListener("click", () => {
        currentPage += dir === "chevron_left" ? -1 : 1;
        renderPage();
      });
    });

    // Mobile bottom nav
    if (mobileNavButtons.length >= 4) {
      mobileNavButtons[0].addEventListener(
        "click",
        () => (window.location.href = "../dashboard/instructor_dashboard.html"),
      );
      mobileNavButtons[1].addEventListener(
        "click",
        () =>
          (window.location.href =
            "../dashboard/course_management_dashboard.html"),
      );
      mobileNavButtons[2].addEventListener("click", () => {});
      mobileNavButtons[3].addEventListener(
        "click",
        () => (window.location.href = "../dashboard/instructor_profile.html"),
      );
    }

    renderPage();
  }

  function wireCoursesDashboard() {
    const h1 = findH1Including("my courses");
    if (!h1) return;

    const allCoursesH2 = Array.from(document.querySelectorAll("h2")).find(
      (x) => (x.textContent || "").trim().toLowerCase() === "all courses",
    );
    const allCoursesSection = allCoursesH2?.closest("section");
    const grid = allCoursesSection?.querySelector("div.grid");
    const courseCards = Array.from(grid?.children || []).filter((el) =>
      el.querySelector?.("h3"),
    );

    // Grid/List toggle (All Courses list only)
    const gridBtn = allCoursesSection
      ? Array.from(allCoursesSection.querySelectorAll("button")).find(
          (b) => (b.textContent || "").trim().toLowerCase() === "grid",
        )
      : null;
    const listBtn = allCoursesSection
      ? Array.from(allCoursesSection.querySelectorAll("button")).find(
          (b) => (b.textContent || "").trim().toLowerCase() === "list",
        )
      : null;
    if (gridBtn) gridBtn.setAttribute("data-global-skip", "1");
    if (listBtn) listBtn.setAttribute("data-global-skip", "1");

    function setView(mode) {
      if (!grid) return;
      grid.classList.toggle("grid-cols-1", mode === "list");
      grid.classList.toggle("md:grid-cols-2", mode === "grid");
      grid.classList.toggle("lg:grid-cols-3", mode === "grid");
      // button styles: never invert to white-on-white
      if (gridBtn && listBtn) {
        const on = mode === "grid" ? gridBtn : listBtn;
        const off = mode === "grid" ? listBtn : gridBtn;
        on.classList.add("bg-white", "shadow-sm", "text-primary", "font-bold");
        on.classList.remove("bg-primary", "text-white");
        off.classList.remove(
          "bg-white",
          "shadow-sm",
          "text-primary",
          "font-bold",
          "bg-primary",
          "text-white",
        );
        off.classList.add("text-on-surface-variant");
      }
      toast(mode === "list" ? "List view" : "Grid view");
    }
    gridBtn?.addEventListener("click", () => setView("grid"));
    listBtn?.addEventListener("click", () => setView("list"));

    // Status filters
    const statusBar = allCoursesSection?.querySelector(
      "div.flex.flex-wrap.gap-3",
    );
    statusBar
      ?.querySelectorAll("button")
      .forEach((b) => b.setAttribute("data-global-skip", "1"));
    const statusBtns = ["all status", "live", "drafts", "in review"]
      .map((t) =>
        Array.from(statusBar?.querySelectorAll("button") || []).find(
          (b) => (b.textContent || "").trim().toLowerCase() === t,
        ),
      )
      .filter(Boolean);

    const filterBtn = Array.from(
      statusBar?.querySelectorAll("button") || [],
    ).find((b) => {
      const t = (b.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      return t === "filter" || t.endsWith(" filter");
    });
    let keywordFilter = "";

    function statusOfCard(card) {
      const badge = card.querySelector("div.absolute.top-4.right-4");
      const s = (badge?.textContent || "").trim().toLowerCase();
      if (s.includes("live")) return "live";
      if (s.includes("draft")) return "drafts";
      if (s.includes("review")) return "in review";
      return "all status";
    }

    function setActiveStatus(btn) {
      statusBtns.forEach((b) => {
        const is = b === btn;
        b.classList.toggle("bg-primary-container/20", is);
        b.classList.toggle("text-on-primary-container", is);
        b.classList.toggle("font-bold", is);
        b.classList.toggle("border", is);
        b.classList.toggle("border-primary-container/30", is);
        b.classList.toggle("bg-white", !is);
        b.classList.toggle("text-on-surface-variant", !is);
        b.classList.toggle("font-medium", !is);
      });
    }

    function applyStatus(filter, opts) {
      const silent = !!(opts && opts.silent);
      const f = (filter || "").trim().toLowerCase();
      let shown = 0;
      courseCards.forEach((c) => {
        const s = statusOfCard(c);
        const okStatus = f === "all status" || s === f;
        const title = (c.querySelector("h3")?.textContent || "").toLowerCase();
        const okKw = !keywordFilter || title.includes(keywordFilter);
        const show = okStatus && okKw;
        c.classList.toggle("hidden", !show);
        if (show) shown += 1;
      });
      if (!silent) toast(`${shown} course(s)`);
    }

    filterBtn?.addEventListener("click", () => {
      modal({
        title: "Filter courses",
        primaryText: "Apply",
        secondaryText: "Close",
        bodyHtml: `
          <div class="space-y-3">
            <p class="text-sm text-slate-600">Search by course title (works with status chips). Leave empty and click Apply to clear the keyword filter.</p>
            <label class="block text-xs font-bold text-slate-600">Keyword</label>
            <input id="course-dash-filter-q" class="w-full rounded-xl border-slate-200" placeholder="e.g. Tailwind" value="${keywordFilter.replace(/"/g, "&quot;")}" />
          </div>
        `,
        onPrimary: () => {
          keywordFilter = (
            document.getElementById("course-dash-filter-q")?.value || ""
          )
            .trim()
            .toLowerCase();
          const active =
            statusBtns.find((b) => b.classList.contains("font-bold")) ||
            statusBtns[0];
          applyStatus((active?.textContent || "").trim());
        },
      });
    });

    statusBtns.forEach((b) =>
      b.addEventListener("click", () => {
        setActiveStatus(b);
        applyStatus((b.textContent || "").trim());
      }),
    );

    if (statusBtns.length) {
      setActiveStatus(statusBtns[0]);
      applyStatus((statusBtns[0].textContent || "").trim(), { silent: true });
    }

    // Row actions
    document.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const txt = (btn.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
        if (txt.includes("view page") || txt.includes("preview")) {
          const card = btn.closest("[data-course-id]");
          const cid = (card?.getAttribute("data-course-id") || "").trim();
          window.location.href = cid
            ? `../course_management/course_preview.html?id=${encodeURIComponent(cid)}`
            : "../course_management/course_preview.html";
        }
        if (txt.includes("edit content")) {
          window.location.href =
            "../course_management/course_module_editor.html";
        }
        if (txt.includes("feedback")) {
          window.location.href = "../help/contact_support.html";
        }
        if (txt.includes("explore localized marketing")) {
          window.location.href = "../placeholders/shared-community-group.html";
        }
      },
      true,
    );

    const addBtn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        (
          b.querySelector(".material-symbols-outlined")?.textContent || ""
        ).trim() === "add",
    );
    addBtn?.addEventListener("click", () => navigateToCourseEditor());
  }

  function wireInstructorMyCourses() {
    const h1 = findH1Including("my courses");
    if (!h1) return;

    const storeKey = "instructor_closed_courses_v1";
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
    const state = storage.get(storeKey, { closedCourses: [] });
    const closedSet = new Set((state.closedCourses || []).map(norm));

    function escHtml(s) {
      return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
    }

    function renderCreatedCoursesRows() {
      const tbody = document.getElementById("instructor-courses-tbody");
      if (!tbody) return;
      const data = storage.get(CREATED_COURSES_KEY, { courses: [] });
      const list = Array.isArray(data.courses) ? data.courses : [];
      const existing = new Set(
        Array.from(tbody.querySelectorAll("tr[data-created-course-id]")).map(
          (tr) => tr.getAttribute("data-created-course-id"),
        ),
      );
      list.forEach((c) => {
        if (!c || !c.id || existing.has(c.id)) return;
        existing.add(c.id);
        const title = c.title || "Untitled course";
        const status =
          (c.status || "Draft").toLowerCase() === "published"
            ? "Published"
            : "Draft";
        const badgeClass =
          status === "Published"
            ? "px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-200"
            : "px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-200";
        const tr = document.createElement("tr");
        tr.className =
          "group hover:bg-surface-container-low/30 transition-colors";
        tr.setAttribute("data-created-course-id", c.id);
        tr.innerHTML = `
          <td class="px-8 py-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <span class="material-symbols-outlined text-primary text-2xl">auto_stories</span>
              </div>
              <div>
                <h4 class="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">${escHtml(title)}</h4>
                <p class="text-xs text-on-surface-variant font-medium">New • Instructor created</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-6">
            <div class="flex flex-col items-center gap-1">
              <span class="text-sm font-bold text-on-surface">—</span>
              <span class="text-[10px] font-black text-outline uppercase tracking-wider">Demo</span>
            </div>
          </td>
          <td class="px-6 py-6 text-center">
            <span class="${badgeClass}">${status}</span>
          </td>
          <td class="px-8 py-6 text-right">
            <div class="flex justify-end gap-3">
              <a href="instructor_course_editor.html?id=${encodeURIComponent(c.id)}" class="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface font-bold text-xs rounded-lg hover:bg-primary hover:text-on-primary transition-all shadow-sm">
                <span class="material-symbols-outlined text-sm">edit</span>
                Edit Course
              </a>
              <a href="instructor_course_roster.html?courseId=${encodeURIComponent(c.id)}" class="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant text-on-surface font-bold text-xs rounded-lg hover:bg-surface-container transition-all shadow-sm">
                <span class="material-symbols-outlined text-sm">analytics</span>
                View Progress
              </a>
              <button type="button" data-close-course="1" class="flex items-center gap-2 px-4 py-2 bg-error/10 text-error font-bold text-xs rounded-lg border border-error/20 hover:bg-error/20 transition-all shadow-sm">
                <span class="material-symbols-outlined text-sm">block</span>
                Close Course
              </button>
            </div>
          </td>
        `;
        tr.querySelector('button[data-close-course="1"]')?.setAttribute(
          "data-course-name",
          title,
        );
        tbody.insertBefore(tr, tbody.firstChild);
      });
    }

    try {
      const u = new URLSearchParams(window.location.search);
      if (u.get("created") === "1") {
        toast("Your new course is now in the list.");
        u.delete("created");
        const qs = u.toString();
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash || ""}`,
        );
      }
    } catch {
      /* ignore */
    }

    renderCreatedCoursesRows();

    const closeButtons = Array.from(
      document.querySelectorAll('button[data-close-course="1"]'),
    );

    function applyClosed(row, btn) {
      const statusCell = row?.querySelector("td:nth-child(3)");
      const badgeSpan =
        statusCell?.querySelector("span.rounded-full") ||
        statusCell?.querySelector("span");
      if (badgeSpan) {
        badgeSpan.className =
          "px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-rose-200";
        badgeSpan.textContent = "Closed";
      }

      const viewLink = row?.querySelector(
        'a[href^="instructor_student_progress.html"]',
      );
      if (viewLink) {
        viewLink.classList.add("opacity-50", "pointer-events-none");
        viewLink.setAttribute("aria-disabled", "true");
      }

      const iconName = (
        btn.querySelector("span.material-symbols-outlined")?.textContent ||
        "block"
      ).trim();
      btn.disabled = true;
      btn.classList.add("opacity-60", "cursor-not-allowed");
      btn.classList.remove(
        "bg-error/10",
        "text-error",
        "hover:bg-error/20",
        "border-error/20",
      );
      btn.classList.add(
        "bg-surface-container-lowest",
        "text-slate-400",
        "border-slate-200",
        "hover:bg-slate-100",
      );
      btn.innerHTML = `<span class="material-symbols-outlined text-sm">${iconName}</span> Closed`;
    }

    if (closeButtons.length) {
      // Apply persisted state first.
      closeButtons.forEach((btn) => {
        const row = btn.closest("tr");
        const courseName = btn.getAttribute("data-course-name") || "";
        if (!row) return;
        if (closedSet.has(norm(courseName))) applyClosed(row, btn);
      });

      closeButtons.forEach((btn) => {
        const row = btn.closest("tr");
        const courseName = btn.getAttribute("data-course-name") || "";
        if (!row) return;

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (btn.disabled) return;

          modal({
            title: "Close Course",
            primaryText: "Close",
            secondaryText: "Cancel",
            bodyHtml: `<p class="text-sm text-slate-600">Are you sure you want to close <b>${courseName}</b>? Students will no longer be able to view progress from this course.</p>`,
            onPrimary: () => {
              closedSet.add(norm(courseName));
              storage.set(storeKey, { closedCourses: Array.from(closedSet) });
              applyClosed(row, btn);
              toast("Course closed");
            },
          });
        });
      });
    }
  }

  function wirePublishingCenter() {
    const h1 = findH1Including("advanced ui design");
    if (!h1) return;
    const hasPublishing = Array.from(document.querySelectorAll("p")).some((p) =>
      (p.textContent || "").toLowerCase().includes("publishing center"),
    );
    if (!hasPublishing) return;

    const notif = Array.from(
      document.querySelectorAll("button span.material-symbols-outlined"),
    )
      .find((s) => (s.textContent || "").trim() === "notifications")
      ?.closest("button");
    notif?.addEventListener("click", () => {
      const panel = ensureNotifPanel();
      panel.classList.toggle("hidden");
      renderNotifPanel(panel);
      notifStore.markAllRead();
      updateNotifBadge();
    });

    const bar = document.querySelector("div.fixed.bottom-0");
    const buttons = Array.from(bar?.querySelectorAll("button") || []);
    const saveDraft = buttons.find((b) =>
      (b.textContent || "").toLowerCase().includes("save as draft"),
    );
    const submitReview = buttons.find((b) =>
      (b.textContent || "").toLowerCase().includes("submit review"),
    );
    const publish = buttons.find((b) =>
      (b.textContent || "").toLowerCase().includes("publish course"),
    );

    const key = "instructor_publish_flow_v1";
    const state = storage.get(key, { status: "Draft", lastSaved: Date.now() });
    storage.set(key, state);

    function setStatus(next) {
      const cur = storage.get(key, state);
      cur.status = next;
      cur.lastSaved = Date.now();
      storage.set(key, cur);
      toast(`${next} saved`);
    }

    saveDraft?.addEventListener("click", () => setStatus("Draft"));
    submitReview?.addEventListener("click", () => {
      modal({
        title: "Submit for review",
        primaryText: "Submit",
        secondaryText: "Cancel",
        bodyHtml: `<div class="text-sm text-slate-600">This will move the course into “In Review”.</div>`,
        onPrimary: () => setStatus("In Review"),
      });
    });
    publish?.addEventListener("click", () => {
      modal({
        title: "Publish course",
        primaryText: "Publish",
        secondaryText: "Cancel",
        bodyHtml: `<div class="text-sm text-slate-600">Publishing marks the course as visible to students in this preview flow.</div>`,
        onPrimary: () => {
          setStatus("Published");
          window.location.href =
            "../dashboard/course_management_dashboard.html";
        },
      });
    });
  }

  function wireLessonEditor() {
    const editor = document.getElementById("lesson-editor-body");
    if (!editor) return;

    document
      .querySelector("#nav-contextual-footer button")
      ?.setAttribute("data-global-skip", "1");

    const key = "instructor_lesson_editor_v1";
    const defaults = {
      savedAt: null,
      version: 0,
      title: "",
      bodyHtml: "",
      public: true,
      prereq: "",
      estimatedTime: "45 minutes",
      completion: 85,
    };

    const raw = storage.get(key, {});
    let state = { ...defaults, ...raw };
    if (typeof state.public !== "boolean") state.public = defaults.public;
    if (typeof state.completion !== "number" || Number.isNaN(state.completion))
      state.completion = defaults.completion;

    const titleInput = document.getElementById("lesson-editor-title");
    const subtitle = document.getElementById("le-header-subtitle");
    const saveBtn = document.getElementById("le-save-btn");
    const historyBtn = document.getElementById("le-history-btn");
    const fileInput = document.getElementById("le-image-file");
    const toolbar = document.getElementById("lesson-editor-toolbar");
    const togglePublic = document.getElementById("le-toggle-public");
    const toggleKnob = document.getElementById("le-toggle-knob");
    const publicHint = document.getElementById("le-public-hint");
    const prereqBtn = document.getElementById("le-prereq-btn");
    const prereqText = document.getElementById("le-prereq-text");
    const timeInput = document.getElementById("le-estimated-time");
    const range = document.getElementById("le-completion-range");
    const completionLabel = document.getElementById("le-completion-label");
    const completionBar = document.getElementById("le-completion-bar");
    const genTasks = document.getElementById("le-gen-tasks");
    const contextualNewLesson = document.querySelector(
      "#nav-contextual-footer button",
    );

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function ensureFocusEditor() {
      editor.focus();
    }

    function highlightSnippet(code, lang) {
      if (!window.hljs) return escapeHtml(code);
      try {
        if (!lang || lang === "auto") {
          return hljs.highlightAuto(code).value;
        }
        if (hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      } catch {
        return escapeHtml(code);
      }
    }

    function captureToState() {
      state.title = (titleInput?.value || "").trim();
      state.bodyHtml = editor.innerHTML;
      state.estimatedTime = (timeInput?.value || "").trim();
      state.completion = Math.min(100, Math.max(0, Number(range?.value) || 0));
    }

    function persistDraft() {
      captureToState();
      storage.set(key, state);
    }

    function syncSubtitle() {
      if (subtitle && titleInput) {
        const t = (titleInput.value || "").trim();
        subtitle.textContent = t || "Untitled lesson";
      }
    }

    function renderPublic() {
      const on = !!state.public;
      togglePublic?.setAttribute("aria-checked", on ? "true" : "false");
      togglePublic?.classList.toggle("bg-primary", on);
      togglePublic?.classList.toggle("bg-slate-300", !on);
      toggleKnob?.classList.toggle("translate-x-5", on);
      toggleKnob?.classList.toggle("translate-x-0", !on);
      if (publicHint) {
        publicHint.textContent = on
          ? "Students can discover this lesson"
          : "Hidden from browse; link-only for enrolled students";
      }
    }

    function renderPrereq() {
      if (!prereqText) return;
      const p = (state.prereq || "").trim();
      if (p) {
        prereqText.textContent = p.length > 80 ? `${p.slice(0, 77)}…` : p;
        prereqText.classList.remove("text-slate-500");
        prereqText.classList.add("text-on-surface", "font-medium");
      } else {
        prereqText.textContent = "Add course logic…";
        prereqText.classList.add("text-slate-500");
        prereqText.classList.remove("text-on-surface", "font-medium");
      }
    }

    function renderCompletion() {
      const v = state.completion;
      if (completionLabel) completionLabel.textContent = `${v}%`;
      if (completionBar) completionBar.style.width = `${v}%`;
      if (range) range.value = String(v);
    }

    if (state.title && titleInput) titleInput.value = state.title;
    if (state.bodyHtml) editor.innerHTML = state.bodyHtml;
    if (state.estimatedTime && timeInput) timeInput.value = state.estimatedTime;
    renderCompletion();
    renderPublic();
    renderPrereq();
    syncSubtitle();

    let draftTimer = null;
    function scheduleDraftPersist() {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(persistDraft, 500);
    }

    titleInput?.addEventListener("input", () => {
      syncSubtitle();
      scheduleDraftPersist();
    });

    editor.addEventListener("input", scheduleDraftPersist);

    timeInput?.addEventListener("input", scheduleDraftPersist);

    range?.addEventListener("input", () => {
      state.completion = Math.min(100, Math.max(0, Number(range.value) || 0));
      renderCompletion();
      scheduleDraftPersist();
    });

    togglePublic?.addEventListener("click", () => {
      state.public = !state.public;
      renderPublic();
      persistDraft();
      toast(state.public ? "Lesson is now public" : "Lesson is now private");
    });

    prereqBtn?.addEventListener("click", () => {
      modal({
        title: "Prerequisites",
        primaryText: "Save",
        secondaryText: "Cancel",
        bodyHtml: `<p class="text-sm text-slate-600">Describe required modules or knowledge before this lesson.</p>
          <textarea id="le-prereq-input" class="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[140px] font-body" placeholder="e.g. Complete Lesson 1: Color Theory"></textarea>`,
        onPrimary: () => {
          const ta = document.getElementById("le-prereq-input");
          state.prereq = (ta?.value || "").trim();
          renderPrereq();
          persistDraft();
          toast("Prerequisites updated");
        },
      });
      const ta = document.getElementById("le-prereq-input");
      if (ta) ta.value = state.prereq || "";
    });

    toolbar?.querySelectorAll("button").forEach((b) => {
      b.addEventListener("mousedown", (e) => e.preventDefault());
    });

    function openCodeBox() {
      ensureFocusEditor();
      const overlay = document.createElement("div");
      overlay.className =
        "fixed inset-0 z-[220] bg-slate-900/45 backdrop-blur-sm p-4 flex items-center justify-center";
      const card = document.createElement("div");
      card.className =
        "w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl";
      card.innerHTML = `
        <div class="p-5 border-b border-slate-100 flex justify-between items-start gap-3">
          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] font-extrabold text-violet-600">Code block</p>
            <h3 class="text-xl font-black text-slate-900 mt-1">Write or paste code</h3>
          </div>
          <button type="button" data-le-close class="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-5 space-y-4">
          <div class="flex flex-wrap gap-4">
            <label class="text-xs font-bold text-slate-600 flex flex-col gap-1">Language
              <select id="le-code-lang" class="rounded-lg border border-slate-200 text-sm px-2 py-1.5 min-w-[10rem]">
                <option value="auto">Auto</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="plaintext">Plain text</option>
              </select>
            </label>
            <label class="text-xs font-bold text-slate-600 flex flex-col gap-1">Preview theme
              <select id="le-code-theme" class="rounded-lg border border-slate-200 text-sm px-2 py-1.5">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
          <textarea id="le-code-ta" class="w-full min-h-[160px] rounded-xl border border-slate-200 p-3 font-mono text-sm" spellcheck="false" placeholder="// Paste or write code here"></textarea>
          <div>
            <p class="text-xs font-bold text-slate-500 mb-2">Highlighted preview</p>
            <pre id="le-code-preview" class="hljs rounded-xl p-4 text-sm overflow-auto max-h-56 border border-slate-200 bg-slate-50"><code id="le-code-preview-inner"></code></pre>
          </div>
          <div class="flex flex-wrap gap-2 justify-end pt-2">
            <button type="button" data-le-copy class="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-800">Copy source</button>
            <button type="button" data-le-cancel class="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-800">Cancel</button>
            <button type="button" data-le-insert class="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-black">Insert into lesson</button>
          </div>
        </div>
      `;
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      const ta = card.querySelector("#le-code-ta");
      const langSel = card.querySelector("#le-code-lang");
      const themeSel = card.querySelector("#le-code-theme");
      const pre = card.querySelector("#le-code-preview");
      const codeInner = card.querySelector("#le-code-preview-inner");

      function refreshPreview() {
        const code = ta?.value || "";
        const theme = themeSel?.value || "light";
        const lang = langSel?.value || "auto";
        if (pre) {
          pre.classList.toggle("bg-slate-50", theme === "light");
          pre.classList.toggle("border-slate-200", theme === "light");
          pre.classList.toggle("bg-[#22272e]", theme === "dark");
          pre.classList.toggle("border-slate-600", theme === "dark");
        }
        if (codeInner) {
          codeInner.className = "hljs";
          codeInner.innerHTML = highlightSnippet(code, lang);
        }
      }

      let prevTimer = null;
      const debounced = () => {
        clearTimeout(prevTimer);
        prevTimer = setTimeout(refreshPreview, 120);
      };

      ta?.addEventListener("input", debounced);
      langSel?.addEventListener("change", refreshPreview);
      themeSel?.addEventListener("change", refreshPreview);
      refreshPreview();

      function close() {
        window.removeEventListener("keydown", onKey);
        overlay.remove();
      }
      function onKey(ev) {
        if (ev.key === "Escape") close();
      }
      window.addEventListener("keydown", onKey);

      overlay.addEventListener("click", (ev) => {
        if (ev.target === overlay) close();
      });
      card.querySelector("[data-le-close]")?.addEventListener("click", close);
      card.querySelector("[data-le-cancel]")?.addEventListener("click", close);

      card
        .querySelector("[data-le-copy]")
        ?.addEventListener("click", async () => {
          const text = ta?.value || "";
          try {
            await navigator.clipboard.writeText(text);
            toast("Copied to clipboard");
          } catch {
            toast("Copy failed — select and copy manually");
          }
        });

      card.querySelector("[data-le-insert]")?.addEventListener("click", () => {
        const code = ta?.value || "";
        const lang = langSel?.value || "auto";
        const theme = themeSel?.value || "light";
        const hl = highlightSnippet(code, lang);
        const cls =
          theme === "dark"
            ? "hljs le-code-block rounded-xl p-4 my-4 overflow-x-auto border border-slate-600 bg-[#22272e]"
            : "hljs le-code-block rounded-xl p-4 my-4 overflow-x-auto border border-slate-200 bg-slate-50";
        const langClass = lang === "auto" ? "plaintext" : lang;
        ensureFocusEditor();
        document.execCommand(
          "insertHTML",
          false,
          `<pre class="${cls}"><code class="language-${langClass}">${hl}</code></pre>`,
        );
        close();
        scheduleDraftPersist();
        toast("Code block inserted");
      });
    }

    toolbar?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-le-cmd]");
      if (!btn) return;
      const cmd = btn.getAttribute("data-le-cmd");
      if (cmd === "code") {
        openCodeBox();
        return;
      }
      if (cmd === "image") {
        fileInput?.click();
        return;
      }
      ensureFocusEditor();
      try {
        if (cmd === "bold") document.execCommand("bold");
        else if (cmd === "italic") document.execCommand("italic");
        else if (cmd === "link") {
          const url = window.prompt("Link URL (https://…)", "https://");
          if (url) document.execCommand("createLink", false, url);
        } else if (cmd === "ul") document.execCommand("insertUnorderedList");
        else if (cmd === "ol") document.execCommand("insertOrderedList");
      } catch {
        toast("Formatting not supported in this browser");
      }
      scheduleDraftPersist();
    });

    fileInput?.addEventListener("change", () => {
      const f = fileInput.files?.[0];
      if (!f || !String(f.type || "").startsWith("image/")) {
        fileInput.value = "";
        return;
      }
      ensureFocusEditor();
      const url = URL.createObjectURL(f);
      document.execCommand(
        "insertHTML",
        false,
        `<p><img src="${url.replace(/"/g, "")}" alt="" style="max-width:100%;height:auto;border-radius:0.5rem"/></p>`,
      );
      fileInput.value = "";
      scheduleDraftPersist();
      toast("Image inserted");
    });

    function markSaved() {
      captureToState();
      state.savedAt = Date.now();
      state.version = (Number(state.version) || 0) + 1;
      storage.set(key, state);
      toast("Saved");
    }

    saveBtn?.addEventListener("click", markSaved);

    historyBtn?.addEventListener("click", () => {
      captureToState();
      const pub = state.public ? "Public" : "Private";
      const pre = (state.prereq || "").trim();
      const preHtml = pre
        ? escapeHtml(pre.length > 200 ? `${pre.slice(0, 200)}…` : pre)
        : "<i>None</i>";
      modal({
        title: "Version history",
        primaryText: "Close",
        secondaryText: "Cancel",
        bodyHtml: `<div class="text-sm text-slate-600 space-y-2">
          <div>Saved versions: <b>${state.version || 0}</b></div>
          <div>Last saved: <b>${state.savedAt ? formatTime(state.savedAt) : "Never"}</b></div>
          <div>Visibility: <b>${pub}</b></div>
          <div>Estimated time: <b>${escapeHtml(state.estimatedTime || "—")}</b></div>
          <div>Completion target: <b>${state.completion}%</b></div>
          <div>Prerequisites: ${preHtml}</div>
        </div>`,
        onPrimary: () => {},
      });
    });

    document.querySelectorAll(".resource-card").forEach((card) => {
      const del = card.querySelector("button");
      del?.addEventListener("click", (ev) => {
        ev.preventDefault();
        modal({
          title: "Remove resource?",
          primaryText: "Remove",
          secondaryText: "Cancel",
          bodyHtml: `<div class="text-sm text-slate-600">Remove this resource card from the current lesson view.</div>`,
          onPrimary: () => {
            card.remove();
            toast("Resource removed");
          },
        });
      });
    });

    genTasks?.addEventListener("click", () => {
      modal({
        title: "Generate tasks",
        primaryText: "Insert checklist",
        secondaryText: "Cancel",
        bodyHtml: `<div class="text-sm text-slate-600">Insert a sample task list at the cursor in the lesson body.</div>`,
        onPrimary: () => {
          ensureFocusEditor();
          document.execCommand(
            "insertHTML",
            false,
            `<h4 class="font-bold mt-4 mb-2">Suggested tasks</h4><ol><li>Sketch three micro-interactions for your app.</li><li>Prototype one in Figma.</li><li>Share a Loom walkthrough in the forum.</li></ol>`,
          );
          scheduleDraftPersist();
          toast("Tasks inserted");
        },
      });
    });

    contextualNewLesson?.addEventListener("click", () => {
      window.location.href = "lesson_editor.html";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = getPageKey();
    wireNotifications();
    wireGlobalActionCenter();
    wireNavCartDrawer();
    updateCartBadges();

    window.addToCart = function (event, p1, p2, p3, p4) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      let bookId;
      let title;
      let price;
      let img;
      if (uuidRe.test(String(p1 || "").trim())) {
        bookId = String(p1 || "").trim();
        title = String(p2 || "").trim();
        price = p3;
        img = p4;
      } else {
        bookId = "";
        title = String(p1 || "").trim();
        price = p2;
        img = p3;
      }
      const t = title;
      if (!t) return;
      const unit = Number(String(price || "0").replace(/[^0-9.]/g, "")) || 0;
      const id = bookId || bookIdFromTitle(t);
      cartStore.add({
        id,
        title: t,
        price: unit,
        img: String(img || "").trim(),
      });
      updateCartBadges();
    };

    window.addEventListener("storage", (e) => {
      if (e.key !== "instructor_cart_v1") return;
      updateCartBadges();
    });

    if (page === "dashboard_home") wireDashboardHome();
    if (page === "instructor_my_courses") wireInstructorMyCourses();
    if (page === "dashboard_student_roster") {
      wireRosterFilters();
      wireRosterExportEnroll();
      wireStudentRowNavigation();
      wireRosterExtras();
    }
    // if (page === "student_details") {
    //   wireStudentDetailsDynamicHeader();
    //   wireStudentDetailsActions();
    // }
    if (page === "course_editor") wireCourseEditorCreateFlow();
    if (page === "course_module_editor") {
      wireCourseModuleEditorNotes();
      wireCourseModuleEditorMainTabs();
    }
    if (page === "resource_library") {
      wireResourceLibrary();
      wireResourceLibraryActions();
    }
    if (page === "course_preview") wireCoursePreview();
    if (page === "book_detail") wireBookDetail();
    if (page === "community_forum" || page === "instructor_forum_moderation")
      wireCommunityForum();
    if (page === "community_group") wireCommunityGroup();
    if (page === "bookstore") {
      wireBookstore();
      wireMinimalBookstoreFilters();
    }
    if (page === "cart_list") wireCartList();
    if (page === "cart_checkout") wireCheckout();
    if (page === "cart_checkout_flow") {
      wireCartCheckoutFlow();
      wireCheckout();
    }
    if (page === "order_history") wireOrderHistory();
    if (page === "publishing_center") wirePublishingCenter();
    if (page === "lesson_editor") wireLessonEditor();
    if (page === "dashboard_courses") wireCoursesDashboard();
    if (page === "order_history") wireOrderHistory();
    if (page === "analytics_dashboard") wireInstructorAnalyticsDashboard();
    if (page === "instructor_profile") wireInstructorProfile();
    if (page === "contact_support") wireContactSupport();
    if (page === "faq") {
      wireFaq();
      wireHelpCenterChatbot();
    }
    if (page === "help") {
      wireFaq();
      wireHelpCenterChatbot();
    }
    if (page === "student_quiz") wireStudentQuiz();
    if (page === "quiz_builder" || page === "course_module_editor")
      wireQuizBuilder();
    if (page === "inbox") wireInbox();
    if (page === "tasks") wireTasks();
    if (page === "settings") wireSettings();
    if (page === "download_reports") wireReports();
  });
})();
