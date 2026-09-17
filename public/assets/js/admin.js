/**
 * ExpertHub — admin.js
 *
 * Loaded on /admin/* pages.
 *
 * Features:
 *   1. Confirmation dialog for destructive actions.
 *   2. Table search filter (client-side, [data-table-filter]).
 *   3. Sort columns on click ([data-sort]).
 *   4. Select-all / bulk actions.
 *   5. Sidebar toggle for mobile.
 *   6. Role change confirm.
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
    catch (err) { console.warn("[ExpertHub admin] failed:", err); }
  };

  // ------------------------------------------------------------------
  // 1. Confirmation for destructive actions
  // ------------------------------------------------------------------
  function confirmDestructive() {
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-confirm]");
      if (!el) return;

      const message =
        el.dataset.confirm || "Are you sure? This action cannot be undone.";
      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  // ------------------------------------------------------------------
  // 2. Client-side table filter
  // ------------------------------------------------------------------
  function tableFilter() {
    document.querySelectorAll("[data-table-filter]").forEach((input) => {
      const tableSelector = input.dataset.tableFilter;
      const table = document.querySelector(tableSelector);
      if (!table) return;

      const rows = () => Array.from(table.querySelectorAll("tbody tr"));

      input.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();
        rows().forEach((tr) => {
          const text = tr.textContent.toLowerCase();
          tr.style.display = !q || text.includes(q) ? "" : "none";
        });
      });
    });
  }

  // ------------------------------------------------------------------
  // 3. Sort table by clicking header
  // ------------------------------------------------------------------
  function tableSort() {
    document.querySelectorAll("table[data-sortable] th[data-sort]").forEach((th) => {
      th.style.cursor = "pointer";
      th.setAttribute("role", "button");
      th.setAttribute("tabindex", "0");

      const sortTable = () => {
        const table = th.closest("table");
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const index = Array.from(th.parentNode.children).indexOf(th);
        const type = th.dataset.sort; // "text" | "number" | "date"
        const direction = th.dataset.direction === "asc" ? "desc" : "asc";

        rows.sort((a, b) => {
          const av = a.children[index]?.textContent.trim() ?? "";
          const bv = b.children[index]?.textContent.trim() ?? "";

          let cmp = 0;
          if (type === "number") {
            cmp = Number(av) - Number(bv);
          } else if (type === "date") {
            cmp = new Date(av) - new Date(bv);
          } else {
            cmp = av.localeCompare(bv, undefined, { sensitivity: "base" });
          }
          return direction === "asc" ? cmp : -cmp;
        });

        th.dataset.direction = direction;
        rows.forEach((r) => tbody.appendChild(r));
      };

      th.addEventListener("click", sortTable);
      th.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          sortTable();
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // 4. Select-all checkbox
  // ------------------------------------------------------------------
  function selectAll() {
    document.querySelectorAll("[data-select-all]").forEach((master) => {
      const scope = master.closest("form") || document;
      const targets = () =>
        scope.querySelectorAll('input[type="checkbox"][data-selectable]');

      master.addEventListener("change", () => {
        targets().forEach((cb) => (cb.checked = master.checked));
      });

      scope.addEventListener("change", (e) => {
        if (!e.target.matches('input[type="checkbox"][data-selectable]')) return;
        const all = Array.from(targets());
        const checked = all.filter((c) => c.checked).length;
        master.indeterminate = checked > 0 && checked < all.length;
        master.checked = checked === all.length && all.length > 0;
      });
    });
  }

  // ------------------------------------------------------------------
  // 5. Mobile sidebar toggle
  // ------------------------------------------------------------------
  function sidebarToggle() {
    const toggle = document.querySelector("[data-sidebar-toggle]");
    const sidebar = document.querySelector("[data-sidebar]");
    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // ------------------------------------------------------------------
  // 6. Role change confirm
  // ------------------------------------------------------------------
  function roleChangeConfirm() {
    document.querySelectorAll('select[name="role"][data-confirm-role]').forEach((sel) => {
      const original = sel.value;

      sel.addEventListener("change", (e) => {
        if (!window.confirm(
          `Change this user's role from "${original}" to "${sel.value}"?`
        )) {
          sel.value = original;
          e.preventDefault();
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(confirmDestructive);
    safe(tableFilter);
    safe(tableSort);
    safe(selectAll);
    safe(sidebarToggle);
    safe(roleChangeConfirm);
  });
})();
