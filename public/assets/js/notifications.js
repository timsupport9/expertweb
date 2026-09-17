/**
 * ExpertHub — notifications.js
 *
 * Loaded on authenticated pages. Reads the current user's
 * notification feed from /api/notifications.
 *
 * Features:
 *   1. Fetch unread count on load and every 60 seconds.
 *   2. Update the bell badge.
 *   3. Mark as read on click.
 *   4. Graceful degradation if the endpoint is unavailable.
 *
 * The /api/notifications endpoint does not exist yet — the module
 * fails silently until it is added.
 */

(function () {
  "use strict";

  const READY_CHECK_MS = 60000;
  const ENDPOINT = "/api/notifications";

  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  const safe = (fn) => {
    try { fn(); }
    catch (err) { console.warn("[ExpertHub notifications] failed:", err); }
  };

  // ------------------------------------------------------------------
  // Bell badge
  // ------------------------------------------------------------------
  function updateBadge(count) {
    const badge = document.querySelector("[data-notification-badge]");
    if (!badge) return;

    if (!count || count <= 0) {
      badge.hidden = true;
      badge.textContent = "";
      return;
    }

    badge.hidden = false;
    badge.textContent = count > 99 ? "99+" : String(count);
  }

  // ------------------------------------------------------------------
  // Fetch unread count
  // ------------------------------------------------------------------
  async function fetchUnread() {
    try {
      const res = await fetch(`${ENDPOINT}/unread-count`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data && typeof data.count === "number") {
        updateBadge(data.count);
      }
    } catch {
      // Endpoint not implemented yet — silently ignore.
    }
  }

  // ------------------------------------------------------------------
  // Mark as read on click
  // ------------------------------------------------------------------
  function markReadOnClick() {
    document.addEventListener("click", async (e) => {
      const item = e.target.closest("[data-notification-id]");
      if (!item) return;

      const id = item.dataset.notificationId;
      if (!id) return;

      try {
        await fetch(`${ENDPOINT}/${id}/read`, {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        item.classList.add("is-read");
      } catch {
        // Ignore.
      }
    });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(fetchUnread);
    safe(markReadOnClick);

    setInterval(() => {
      if (!document.hidden) safe(fetchUnread);
    }, READY_CHECK_MS);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) safe(fetchUnread);
    });
  });
})();
