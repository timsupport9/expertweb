/**
 * ExpertHub — chat.js
 *
 * Loaded on /chat and wherever a chat widget is embedded.
 *
 * Features:
 *   1. Auto-scroll message pane to bottom.
 *   2. Enter to send, Shift+Enter for newline.
 *   3. Optimistic message rendering.
 *   4. Connection status indicator.
 *   5. Placeholder WebSocket wiring (uncomment when ready).
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
    catch (err) { console.warn("[ExpertHub chat] failed:", err); }
  };

  // ------------------------------------------------------------------
  // 1. Auto-scroll message pane
  // ------------------------------------------------------------------
  function autoScroll() {
    const pane = document.querySelector("[data-chat-pane]");
    if (!pane) return;
    pane.scrollTop = pane.scrollHeight;
  }

  // ------------------------------------------------------------------
  // 2. Composer behaviors
  // ------------------------------------------------------------------
  function composer() {
    const form = document.querySelector("[data-chat-form]");
    const input = document.querySelector("[data-chat-input]");
    const pane = document.querySelector("[data-chat-pane]");
    if (!form || !input || !pane) return;

    // Enter to send, Shift+Enter newline.
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    // Optimistic append on submit.
    form.addEventListener("submit", (e) => {
      const text = input.value.trim();
      if (!text) { e.preventDefault(); return; }

      const bubble = document.createElement("div");
      bubble.className = "chat-bubble chat-bubble-self";
      bubble.textContent = text;
      bubble.dataset.pending = "1";
      pane.appendChild(bubble);

      input.value = "";
      pane.scrollTop = pane.scrollHeight;
    });
  }

  // ------------------------------------------------------------------
  // 3. Connection status
  // ------------------------------------------------------------------
  function statusIndicator() {
    const el = document.querySelector("[data-chat-status]");
    if (!el) return;

    const set = (state, label) => {
      el.dataset.state = state;
      el.textContent = label;
    };

    // Placeholder until WebSocket is wired.
    set("offline", "Offline");
  }

  // ------------------------------------------------------------------
  // 4. WebSocket placeholder
  // ------------------------------------------------------------------
  function connect() {
    // Uncomment and configure once chat backend is ready.
    //
    // const proto = location.protocol === "https:" ? "wss:" : "ws:";
    // const socket = new WebSocket(`${proto}//${location.host}/ws/chat`);
    //
    // socket.addEventListener("open", () => { /* update status */ });
    // socket.addEventListener("message", (e) => {
    //   const data = JSON.parse(e.data);
    //   /* append to pane */
    // });
    // socket.addEventListener("close", () => {
    //   /* reconnect with backoff */
    // });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(autoScroll);
    safe(composer);
    safe(statusIndicator);
    safe(connect);
  });
})();
