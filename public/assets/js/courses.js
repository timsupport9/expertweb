/**
 * ExpertHub — courses.js
 *
 * Loaded on /courses and /courses/:slug.
 *
 * Features:
 *   1. Filter by category / price / search.
 *   2. Sort dropdown.
 *   3. "Load more" pagination (progressive enhancement).
 *   4. Sticky "enroll" button on detail page.
 *   5. Client-side slug preview when typing a title.
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
    catch (err) { console.warn("[ExpertHub courses] failed:", err); }
  };

  // ------------------------------------------------------------------
  // 1. Filter and search
  // ------------------------------------------------------------------
  function filterCourses() {
    const search = document.querySelector("[data-course-search]");
    const category = document.querySelector("[data-course-category]");
    const price = document.querySelector("[data-course-price]");

    const container = document.querySelector("[data-course-list]");
    if (!container) return;

    const cards = () =>
      Array.from(container.querySelectorAll("[data-course-card]"));

    const apply = () => {
      const q = (search?.value || "").toLowerCase().trim();
      const cat = category?.value || "";
      const max = price ? Number(price.value) : Infinity;

      let visible = 0;

      cards().forEach((card) => {
        const text = card.textContent.toLowerCase();
        const cardCat = card.dataset.category || "";
        const cardPrice = Number(card.dataset.price || 0);

        const okQ = !q || text.includes(q);
        const okCat = !cat || cardCat === cat;
        const okPrice = !price || cardPrice <= max;

        const show = okQ && okCat && okPrice;
        card.style.display = show ? "" : "none";
        if (show) visible += 1;
      });

      const empty = document.querySelector("[data-course-empty]");
      if (empty) empty.style.display = visible === 0 ? "" : "none";
    };

    [search, category, price].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });

    apply();
  }

  // ------------------------------------------------------------------
  // 2. Sort
  // ------------------------------------------------------------------
  function sortCourses() {
    const sort = document.querySelector("[data-course-sort]");
    const container = document.querySelector("[data-course-list]");
    if (!sort || !container) return;

    sort.addEventListener("change", () => {
      const value = sort.value;
      const cards = Array.from(container.querySelectorAll("[data-course-card]"));

      cards.sort((a, b) => {
        const at = a.dataset.title || "";
        const bt = b.dataset.title || "";
        const ap = Number(a.dataset.price || 0);
        const bp = Number(b.dataset.price || 0);
        const ad = a.dataset.date || "";
        const bd = b.dataset.date || "";

        switch (value) {
          case "title-asc":   return at.localeCompare(bt);
          case "title-desc":  return bt.localeCompare(at);
          case "price-asc":   return ap - bp;
          case "price-desc":  return bp - ap;
          case "date-desc":   return bd.localeCompare(ad);
          case "date-asc":    return ad.localeCompare(bd);
          default:            return 0;
        }
      });

      cards.forEach((c) => container.appendChild(c));
    });
  }

  // ------------------------------------------------------------------
  // 3. Load more
  // ------------------------------------------------------------------
  function loadMore() {
    const btn = document.querySelector("[data-load-more]");
    if (!btn) return;

    const container = document.querySelector("[data-course-list]");
    if (!container) return;

    btn.addEventListener("click", () => {
      const hidden = container.querySelectorAll(
        '[data-course-card][hidden="true"]'
      );

      let revealed = 0;
      hidden.forEach((card) => {
        if (revealed >= 9) return;
        card.hidden = false;
        revealed += 1;
      });

      if (container.querySelectorAll('[data-course-card][hidden="true"]').length === 0) {
        btn.disabled = true;
        btn.textContent = "All courses loaded";
      }
    });
  }

  // ------------------------------------------------------------------
  // 4. Sticky enroll (course detail)
  // ------------------------------------------------------------------
  function stickyEnroll() {
    const box = document.querySelector("[data-sticky-enroll]");
    if (!box) return;

    const onScroll = () => {
      const rect = box.getBoundingClientRect();
      const sticky = rect.top <= 80;
      box.classList.toggle("is-sticky", sticky);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ------------------------------------------------------------------
  // 5. Slug preview
  // ------------------------------------------------------------------
  function slugPreview() {
    const titleInput = document.querySelector('input[name="title"][data-slug-source]');
    const slugTarget = document.querySelector("[data-slug-preview]");
    if (!titleInput || !slugTarget) return;

    const toSlug = (s) =>
      s.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    titleInput.addEventListener("input", () => {
      slugTarget.textContent = toSlug(titleInput.value) || "your-course-title";
    });

    slugTarget.textContent = toSlug(titleInput.value) || "your-course-title";
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(filterCourses);
    safe(sortCourses);
    safe(loadMore);
    safe(stickyEnroll);
    safe(slugPreview);
  });
})();
