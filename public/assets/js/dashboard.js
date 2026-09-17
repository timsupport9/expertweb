/**
 * ExpertHub — dashboard.js
 *
 * Loaded on /dashboard for all roles.
 *
 * Features:
 *   1. Greeting based on time of day.
 *   2. Toggle between card view and list view.
 *   3. Copy API key / referral code.
 *   4. Sticky section navigation.
 *   5. Inline "create course" form toggle for experts.
 */

(function () {
  "use strict";

  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  const safe = (fn) => {
    try { fn(); }
    catch (err) { console.warn("[ExpertHub dashboard] failed:", err); }
  };

  // ------------------------------------------------------------------
  // 1. Time-of-day greeting
  // ------------------------------------------------------------------
  function greeting() {
    const el = document.querySelector("[data-greeting]");
    if (!el) return;

    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? "Good morning" :
      hour < 17 ? "Good afternoon" :
      hour < 21 ? "Good evening" :
      "Welcome back";

    el.textContent = `${greeting},`;
  }

  // ------------------------------------------------------------------
  // 2. View toggle
  // ------------------------------------------------------------------
  function viewToggle() {
    const buttons = document.querySelectorAll("[data-view]");
    const container = document.querySelector("[data-view-container]");
    if (!buttons.length || !container) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        container.dataset.viewMode = view;
        container.classList.toggle("is-grid", view === "grid");
        container.classList.toggle("is-list", view === "list");

        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));

        try {
          localStorage.setItem("experthub.dashboard.view", view);
        } catch { /* ignore quota errors */ }
      });
    });

    // Restore last choice.
    try {
      const saved = localStorage.getItem("experthub.dashboard.view");
      if (saved === "grid" || saved === "list") {
        const btn = document.querySelector(`[data-view="${saved}"]`);
        if (btn) btn.click();
      }
    } catch { /* ignore */ }
  }

  // ------------------------------------------------------------------
  // 3. Copy-to-clipboard
  // ------------------------------------------------------------------
  function copyButton() {
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.dataset.copy;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            // Fallback for older browsers.
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
          }

          const original = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = original), 1500);
        } catch (err) {
          console.warn("Copy failed:", err);
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // 4. Sticky section navigation highlighting
  // ------------------------------------------------------------------
  function sectionNavHighlight() {
    const links = Array.from(document.querySelectorAll("[data-section-link]"));
    if (!links.length) return;

    const sections = links
      .map((link) => {
        const id = link.getAttribute("href");
        if (!id || !id.startsWith("#")) return null;
        const el = document.querySelector(id);
        return el ? { id, el, link } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const onScroll = () => {
      const top = window.scrollY + 120;
      let current = sections[0];

      sections.forEach((s) => {
        if (s.el.offsetTop <= top) current = s;
      });

      sections.forEach((s) => {
        s.link.classList.toggle("is-active", s === current);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ------------------------------------------------------------------
  // 5. Inline form toggle
  // ------------------------------------------------------------------
  function inlineFormToggle() {
    document.querySelectorAll("[data-toggle-target]").forEach((btn) => {
      const target = document.querySelector(btn.dataset.toggleTarget);
      if (!target) return;

      target.hidden = true;

      btn.addEventListener("click", () => {
        target.hidden = !target.hidden;
        btn.setAttribute("aria-expanded", String(!target.hidden));
        if (!target.hidden) {
          const first = target.querySelector("input, textarea, select");
          if (first) first.focus();
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(greeting);
    safe(viewToggle);
    safe(copyButton);
    safe(sectionNavHighlight);
    safe(inlineFormToggle);
  });
})();
