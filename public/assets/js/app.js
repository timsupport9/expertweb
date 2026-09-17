/**
 * ExpertHub — app.js
 *
 * Global client-side enhancements, loaded on every page.
 *
 * Features:
 *   1. Auto-dismiss flash messages after 6 seconds.
 *   2. Stamp the current year into [data-year] or #year.
 *   3. Busy state on form submit buttons.
 *   4. Auto-inject CSRF token into same-origin fetch() calls.
 *   5. Reveal elements marked [data-reveal] by adding .is-revealed.
 *   6. Smooth scroll for in-page anchors.
 *   7. Harden external links (rel=noopener noreferrer, target=_blank).
 *   8. Optional per-page module loader via <body data-page="...">.
 *   9. Fail-safe: every feature is wrapped so a broken widget never
 *      blocks the rest of the page.
 */

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  const safe = (name, fn) => {
    try {
      fn();
    } catch (err) {
      // Errors in one feature must not prevent the others from running.
      // In production we silently swallow; in development we log.
      if (
        window.console &&
        console.warn &&
        document.documentElement.dataset.env !== "production"
      ) {
        console.warn(`[ExpertHub] "${name}" failed:`, err);
      }
    }
  };

  // ------------------------------------------------------------------
  // 1. Flash auto-dismiss
  // ------------------------------------------------------------------

  function hideFlash(el) {
    if (!el || el.dataset.hidden) return;
    el.dataset.hidden = "1";
    el.style.transition = "opacity .35s ease, transform .35s ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(-4px)";
    setTimeout(() => el.remove(), 400);
  }

  function flashDismiss() {
    document.querySelectorAll(".flash").forEach((el) => {
      if (el.dataset.dismissing) return;
      el.dataset.dismissing = "1";

      const close = el.querySelector("[data-dismiss]");
      if (close) close.addEventListener("click", () => hideFlash(el));

      setTimeout(() => hideFlash(el), 6000);
    });
  }

  // ------------------------------------------------------------------
  // 2. Year stamp
  // ------------------------------------------------------------------

  function stampYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year], #year").forEach((el) => {
      el.textContent = year;
    });
  }

  // ------------------------------------------------------------------
  // 3. Busy state on form submit
  // ------------------------------------------------------------------

  function formBusyState() {
    document.querySelectorAll("form").forEach((form) => {
      if (form.dataset.busyBound) return;
      form.dataset.busyBound = "1";

      form.addEventListener("submit", () => {
        // Do not disable if the form has [data-no-busy]
        if (form.hasAttribute("data-no-busy")) return;

        const btn = form.querySelector('button[type="submit"]');
        if (!btn || btn.dataset.busy) return;

        btn.dataset.busy = "1";
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = btn.dataset.loadingText || "Please wait…";
      });
    });
  }

  // ------------------------------------------------------------------
  // 4. CSRF token for fetch()
  // ------------------------------------------------------------------

  function csrfFetch() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (!meta) return;

    const token = meta.getAttribute("content");
    if (!token) return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = function (input, init) {
      init = init || {};

      let url = "";
      let method = "GET";

      if (typeof input === "string") {
        url = input;
        method = (init.method || "GET").toUpperCase();
      } else if (input && typeof input === "object") {
        url = input.url || "";
        method = (init.method || input.method || "GET").toUpperCase();
      }

      const sameOrigin =
        !url ||
        url.startsWith("/") ||
        (typeof location !== "undefined" &&
          url.startsWith(location.origin));

      if (sameOrigin && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        init.headers = Object.assign({}, init.headers || {}, {
          "X-CSRF-Token": token,
        });
      }

      return originalFetch(input, init);
    };
  }

  // ------------------------------------------------------------------
  // 5. Reveal on load — uses .is-revealed so CSS owns the animation
  // ------------------------------------------------------------------

  function revealElements() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    // Let the browser paint the initial (hidden) state first.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.forEach((el) => el.classList.add("is-revealed"));
      });
    });
  }

  // ------------------------------------------------------------------
  // 6. Smooth scroll for #anchors
  // ------------------------------------------------------------------

  function smoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#" || href.length < 2) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        if (history.replaceState) {
          history.replaceState(null, "", href);
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // 7. External link safety
  // ------------------------------------------------------------------

  function hardenExternalLinks() {
    if (typeof location === "undefined") return;

    // location.host includes the port, which is what we want for a
    // strict same-origin comparison.
    const here = location.host;

    document.querySelectorAll('a[href^="http"]').forEach((a) => {
      try {
        const url = new URL(a.href);
        if (url.host !== here) {
          a.setAttribute("rel", "noopener noreferrer");
          if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
        }
      } catch {
        /* ignore malformed URLs */
      }
    });
  }

  // ------------------------------------------------------------------
  // 8. Per-page module loader
  // ------------------------------------------------------------------
  //   <body data-page="home">      → loads /assets/js/home.js
  //   <body data-page="courses">   → loads /assets/js/courses.js
  //
  //   Silently no-ops if the file doesn't exist (404 swallowed).
  //   Use this to keep per-page scripts out of the global bundle.

  function loadPageModule() {
    const page = document.body && document.body.dataset.page;
    if (!page) return;

    const src = `/assets/js/${page}.js`;
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return;

    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.onerror = () => { /* page module is optional */ };
    document.head.appendChild(s);
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------

  ready(() => {
    safe("flashDismiss",        flashDismiss);
    safe("stampYear",           stampYear);
    safe("formBusyState",       formBusyState);
    safe("csrfFetch",           csrfFetch);
    safe("revealElements",      revealElements);
    safe("smoothAnchors",       smoothAnchors);
    safe("hardenExternalLinks", hardenExternalLinks);
    safe("loadPageModule",      loadPageModule);

    document.documentElement.classList.add("js-ready");

    if (window.console && console.info) {
      console.info(
        "%cExpertHub",
        "font-weight:700;color:#4c8dff",
        "front-end ready"
      );
    }
  });

  // Public API for other scripts.
  window.ExpertHub = window.ExpertHub || {};
  window.ExpertHub.hideFlash = hideFlash;
})();
