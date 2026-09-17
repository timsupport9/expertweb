/**
 * ExpertHub — auth.js
 *
 * Loaded on /login, /register, /forgot-password, /reset-password.
 *
 * Features:
 *   1. Toggle password visibility.
 *   2. Show/hide "role" select on register.
 *   3. Live validation summary before submit.
 *   4. Auto-focus first field with [data-autofocus].
 *   5. Redirect preserved ?next= into the login form.
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
    catch (err) { console.warn("[ExpertHub auth] failed:", err); }
  };

  // ------------------------------------------------------------------
  // 1. Password visibility toggle
  // ------------------------------------------------------------------
  function passwordToggle() {
    document.querySelectorAll("[data-password-toggle]").forEach((btn) => {
      const target = document.querySelector(btn.dataset.passwordToggle);
      if (!target) return;

      btn.addEventListener("click", () => {
        const showing = target.type === "text";
        target.type = showing ? "password" : "text";
        btn.textContent = showing ? "Show" : "Hide";
        btn.setAttribute(
          "aria-label",
          showing ? "Show password" : "Hide password"
        );
      });
    });
  }

  // ------------------------------------------------------------------
  // 2. Auto-focus
  // ------------------------------------------------------------------
  function autoFocus() {
    const el = document.querySelector("[data-autofocus]");
    if (el) setTimeout(() => el.focus(), 100);
  }

  // ------------------------------------------------------------------
  // 3. Prefill `next` into login form
  // ------------------------------------------------------------------
  function preserveNext() {
    const params = new URLSearchParams(location.search);
    const next = params.get("next");
    if (!next) return;

    document.querySelectorAll("form").forEach((form) => {
      if (form.querySelector('input[name="next"]')) return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "next";
      input.value = next;
      form.appendChild(input);
    });
  }

  // ------------------------------------------------------------------
  // 4. Basic client-side summary on register
  // ------------------------------------------------------------------
  function registerSummary() {
    const form = document.querySelector('form[data-form="register"]');
    if (!form) return;

    const summary = form.querySelector("[data-validation-summary]");

    form.addEventListener("input", () => {
      if (!summary) return;
      const pw = form.querySelector('input[name="password"]');
      const pw2 = form.querySelector('input[name="password_confirmation"]');
      const email = form.querySelector('input[name="email"]');
      const name = form.querySelector('input[name="name"]');

      const problems = [];

      if (name && name.value.trim().length < 2) {
        problems.push("Name is too short.");
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        problems.push("Email is not valid.");
      }
      if (pw && pw.value.length < 8) {
        problems.push("Password must be at least 8 characters.");
      }
      if (pw && pw2 && pw.value !== pw2.value) {
        problems.push("Passwords do not match.");
      }

      if (problems.length === 0) {
        summary.textContent = "";
        summary.style.display = "none";
      } else {
        summary.textContent = problems.join(" ");
        summary.style.display = "block";
      }
    });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(passwordToggle);
    safe(autoFocus);
    safe(preserveNext);
    safe(registerSummary);
  });
})();
