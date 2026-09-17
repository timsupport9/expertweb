/**
 * ExpertHub — app.js
 *
 * Global client-side enhancements, loaded on every page.
 *
 * Features:
 *   1. Auto-dismiss flash messages after 6 seconds.
 *   2. Stamp the current year into any <span id="year">.
 *   3. Busy state on form submit buttons.
 *   4. Auto-inject CSRF token into same-origin fetch() calls.
 *   5. Reveal elements marked [data-reveal] on first paint.
 *   6. Deep-link smooth scrolling for in-page anchors.
 *   7. Fail-safe: every feature is wrapped so a broken widget
 *      never blocks the rest of the page.
 */

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------------
  const on = (event, handler) =>
    document.addEventListener(event, handler, { passive: true });

  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  const safe = (fn) => {
    try { fn(); }
    catch (err) { console.warn("[ExpertHub] feature failed:", err); }
  };

  // ------------------------------------------------------------------
  // 1. Flash auto-dismiss
  // ------------------------------------------------------------------
  function flashDismiss() {
    document.querySelectorAll(".flash").forEach((el) => {
      if (el.dataset.dismissing) return;
      el.dataset.dismissing = "1";

      // Allow manual dismiss via a close button if present.
      const close = el.querySelector("[data-dismiss]");
      if (close) {
        close.addEventListener("click", () => hide(el));
      }

      // Auto-dismiss after 6 seconds.
      setTimeout(() => hide(el), 6000);
    });
  }

  function hide(el) {
    if (!el || el.dataset.hidden) return;
    el.dataset.hidden = "1";
    el.style.transition = "opacity .35s ease, transform .35s ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(-4px)";
    setTimeout(() => el.remove(), 400);
  }

  // ------------------------------------------------------------------
  // 2. Year stamp
  // ------------------------------------------------------------------
  function stampYear() {
    const year = new Date().getFullYear();
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

      const url =
        typeof input === "string" ? input :
        (input && input.url) ? input.url : "";

      // Only inject for same-origin requests.
      const sameOrigin =
        !url ||
        url.startsWith("/") ||
        (location && url.startsWith(location.origin));

      const method =
        (init.method ||
          (typeof input !== "string" && input.method) ||
          "GET").toUpperCase();

      if (sameOrigin && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        init.headers = Object.assign({}, init.headers || {}, {
          "X-CSRF-Token": token,
        });
      }

      return originalFetch(input, init);
    };
  }

  // ------------------------------------------------------------------
  // 5. Reveal on load
  // ------------------------------------------------------------------
  function revealElements() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    requestAnimationFrame(() => {
      els.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
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
    const here = location.hostname;
    document.querySelectorAll('a[href^="http"]').forEach((a) => {
      try {
        const url = new URL(a.href);
        if (url.hostname !== here) {
          a.setAttribute("rel", "noopener noreferrer");
          if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
        }
      } catch { /* ignore malformed URLs */ }
    });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(flashDismiss);
    safe(stampYear);
    safe(formBusyState);
    safe(csrfFetch);
    safe(revealElements);
    safe(smoothAnchors);
    safe(hardenExternalLinks);

    document.documentElement.classList.add("js-ready");

    if (window.console && console.info) {
      console.info(
        "%cExpertHub",
        "font-weight:700;color:#4c8dff",
        "front-end ready"
      );
    }
  });

  // Expose a couple of helpers for other modules.
  window.ExpertHub = window.ExpertHub || {};
  window.ExpertHub.hideFlash = hide;
})();
