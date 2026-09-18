/**
 * ============================================================
 * EXPERTHUB — APP.JS
 * ============================================================
 *
 * File:
 *     public/assets/js/app.js
 *
 * Purpose:
 *     Global client-side bootstrap, loaded on every page.
 *
 * Responsibilities:
 *     1.  Add .js-ready to <html> so CSS can enable JS-only styles.
 *     2.  Stamp the current year into every [data-year] element.
 *     3.  Auto-dismiss .flash messages after 6 seconds.
 *     4.  Show a busy state on submit buttons to prevent double-submit.
 *     5.  Inject the CSRF token into same-origin fetch() calls.
 *     6.  Reveal [data-reveal] elements by adding .is-revealed.
 *     7.  Smooth-scroll in-page anchors.
 *     8.  Harden external links (rel=noopener noreferrer, target=_blank).
 *     9.  Auto-load /assets/js/<body data-page>.js if it exists.
 *     10. Expose window.ExpertHub helpers for other scripts.
 *
 * Design notes:
 *     - Every feature is wrapped in try/catch so a broken widget
 *       never blocks the rest of the page.
 *     - Nothing is required. The site works with JavaScript off.
 *     - No dependencies. Runs in any browser that supports ES2017.
 *
 * ============================================================
 */

(function () {
  "use strict";

  /* ==========================================================
     INTERNAL HELPERS
     ========================================================== */

  /**
   * Run a callback once the DOM is parsed and safe to query.
   */
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  /**
   * Wrap a feature so a single failure never breaks the others.
   * Logs a warning in development; silent in production.
   */
  function safe(name, fn) {
    try {
      fn();
    } catch (err) {
      var isProd =
        document.documentElement &&
        document.documentElement.dataset &&
        document.documentElement.dataset.env === "production";

      if (!isProd && window.console && console.warn) {
        console.warn('[ExpertHub] "' + name + '" failed:', err);
      }
    }
  }

  /**
   * Query all elements matching a selector as an array.
   */
  function $$(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector)
    );
  }

  /* ==========================================================
     0. JS-READY FLAG
     ========================================================== */

  function markJsReady() {
    document.documentElement.classList.add("js-ready");
  }

  /* ==========================================================
     1. YEAR STAMP
     ==========================================================
     Replaces the text content of every [data-year] and #year
     element with the current 4-digit year.
     ========================================================== */

  function stampYear() {
    var year = String(new Date().getFullYear());
    var targets = $$("[data-year], #year");
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ==========================================================
     2. FLASH AUTO-DISMISS
     ==========================================================
     Each .flash element fades out after 6 seconds.
     Also supports a manual close button via [data-dismiss].
     ========================================================== */

  function hideFlash(el) {
    if (!el || el.dataset.hidden === "1") return;
    el.dataset.hidden = "1";

    el.style.transition = "opacity .35s ease, transform .35s ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(-4px)";

    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 400);
  }

  function flashDismiss() {
    $$(".flash").forEach(function (el) {
      if (el.dataset.dismissing === "1") return;
      el.dataset.dismissing = "1";

      var close = el.querySelector("[data-dismiss]");
      if (close) {
        close.addEventListener("click", function (e) {
          e.preventDefault();
          hideFlash(el);
        });
      }

      setTimeout(function () {
        hideFlash(el);
      }, 6000);
    });
  }

  /* ==========================================================
     3. FORM BUSY STATE
     ==========================================================
     On submit, disable the primary submit button and swap its
     text so the user can't double-submit and sees feedback.
     Opt out with [data-no-busy] on the form.
     ========================================================== */

  function formBusyState() {
    $$("form").forEach(function (form) {
      if (form.dataset.busyBound === "1") return;
      form.dataset.busyBound = "1";

      form.addEventListener("submit", function () {
        if (form.hasAttribute("data-no-busy")) return;

        var btn =
          form.querySelector('button[type="submit"]') ||
          form.querySelector("button:not([type])");

        if (!btn || btn.dataset.busy === "1") return;
        if (btn.hasAttribute("data-no-busy")) return;

        btn.dataset.busy = "1";
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = btn.dataset.loadingText || "Please wait…";
      });
    });
  }

  /* ==========================================================
     4. CSRF FETCH WRAPPER
     ==========================================================
     Wraps window.fetch() so that POST/PUT/PATCH/DELETE requests
     to the same origin automatically include the CSRF token
     from <meta name="csrf-token">.
     ========================================================== */

  function csrfFetch() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    if (!meta) return;

    var token = meta.getAttribute("content");
    if (!token) return;

    var originalFetch = window.fetch;
    if (typeof originalFetch !== "function") return;

    window.fetch = function (input, init) {
      init = init || {};

      var url = "";
      var method = "GET";

      if (typeof input === "string") {
        url = input;
        method = (init.method || "GET").toUpperCase();
      } else if (input && typeof input === "object") {
        url = input.url || "";
        method = (init.method || input.method || "GET").toUpperCase();
      }

      var sameOrigin =
        !url ||
        url.charAt(0) === "/" ||
        (typeof location !== "undefined" &&
          url.indexOf(location.origin) === 0);

      if (
        sameOrigin &&
        method !== "GET" &&
        method !== "HEAD" &&
        method !== "OPTIONS"
      ) {
        init.headers = Object.assign({}, init.headers || {}, {
          "X-CSRF-Token": token,
        });
      }

      return originalFetch.call(window, input, init);
    };
  }

  /* ==========================================================
     5. REVEAL ANIMATION
     ==========================================================
     Elements with [data-reveal] get .is-revealed added after
     two animation frames, so the CSS transition runs cleanly.
     ========================================================== */

  function revealElements() {
    var els = $$("[data-reveal]");
    if (!els.length) return;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (el) {
          el.classList.add("is-revealed");
        });
      });
    });
  }

  /* ==========================================================
     6. SMOOTH ANCHORS
     ==========================================================
     In-page anchors scroll smoothly and update the URL without
     adding a new entry to history.
     ========================================================== */

  function smoothAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href === "#" || href.length < 2) return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        if (history.replaceState) {
          history.replaceState(null, "", href);
        }
      });
    });
  }

  /* ==========================================================
     7. EXTERNAL LINK HARDENING
     ==========================================================
     Any link with a different host gets rel="noopener noreferrer"
     and target="_blank" if it doesn't already have a target.
     ========================================================== */

  function hardenExternalLinks() {
    if (typeof location === "undefined") return;

    var here = location.host;

    $$('a[href^="http"]').forEach(function (a) {
      try {
        var url = new URL(a.href);
        if (url.host !== here) {
          a.setAttribute("rel", "noopener noreferrer");
          if (!a.hasAttribute("target")) {
            a.setAttribute("target", "_blank");
          }
        }
      } catch (_) {
        /* ignore malformed URLs */
      }
    });
  }

  /* ==========================================================
     8. PER-PAGE MODULE LOADER
     ==========================================================
     Reads <body data-page="..."> and loads
     /assets/js/<page>.js if it exists. A 404 is swallowed, so
     the attribute is optional — pages that don't have a
     dedicated script simply skip this.
     ========================================================== */

  function loadPageModule() {
    var page =
      document.body && document.body.dataset
        ? document.body.dataset.page
        : null;

    if (!page) return;

    if (!/^[a-z0-9-]+$/i.test(page)) return;

    var src = "/assets/js/" + page + ".js";

    if (document.querySelector('script[src="' + src + '"]')) return;

    var s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.async = false;
    s.onerror = function () {
      /* Optional module — silently ignore missing files. */
    };

    document.head.appendChild(s);
  }

  /* ==========================================================
     9. PUBLIC API
     ==========================================================
     window.ExpertHub.<helper> is available to other scripts
     loaded after this file.
     ========================================================== */

  function exposeHelpers() {
    window.ExpertHub = window.ExpertHub || {};

    window.ExpertHub.hideFlash = hideFlash;
    window.ExpertHub.ready = ready;
    window.ExpertHub.safe = safe;
    window.ExpertHub.$$ = $$;

    var listeners = {};

    window.ExpertHub.on = function (name, handler) {
      if (!listeners[name]) listeners[name] = [];
      listeners[name].push(handler);
    };

    window.ExpertHub.off = function (name, handler) {
      if (!listeners[name]) return;
      listeners[name] = listeners[name].filter(function (h) {
        return h !== handler;
      });
    };

    window.ExpertHub.emit = function (name, payload) {
      (listeners[name] || []).forEach(function (h) {
        try {
          h(payload);
        } catch (err) {
          if (window.console && console.warn) {
            console.warn('[ExpertHub] listener "' + name + '" threw:', err);
          }
        }
      });
    };
  }

  /* ==========================================================
     10. BOOT
     ========================================================== */

  ready(function () {
    safe("markJsReady", markJsReady);

    safe("stampYear", stampYear);
    safe("flashDismiss", flashDismiss);
    safe("formBusyState", formBusyState);
    safe("csrfFetch", csrfFetch);
    safe("revealElements", revealElements);
    safe("smoothAnchors", smoothAnchors);
    safe("hardenExternalLinks", hardenExternalLinks);
    safe("loadPageModule", loadPageModule);
    safe("exposeHelpers", exposeHelpers);

    if (window.ExpertHub && window.ExpertHub.emit) {
      window.ExpertHub.emit("app:ready", {
        page: (document.body && document.body.dataset.page) || null,
        url: location.pathname,
      });
    }

    if (window.console && console.info) {
      console.info(
        "%cExpertHub",
        "font-weight:700;color:#4c8dff",
        "front-end ready"
      );
    }
  });
})();
