/**
 * ExpertHub — forms.js
 *
 * Optional helpers loaded on pages with richer forms.
 *
 * Features:
 *   1. Password confirmation check.
 *   2. Live minimum-length hint.
 *   3. Email format check on blur.
 *   4. Prevent double-submit.
 *   5. Character counter for [maxlength] fields.
 *   6. Auto-format phone inputs.
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
    catch (err) { console.warn("[ExpertHub forms] failed:", err); }
  };

  // ------------------------------------------------------------------
  // 1. Password confirmation
  // ------------------------------------------------------------------
  function passwordConfirmation() {
    document.querySelectorAll("form").forEach((form) => {
      const pw = form.querySelector("[data-password]");
      const confirm = form.querySelector("[data-password-confirm]");
      if (!pw || !confirm) return;

      const check = () => {
        if (!confirm.value) {
          confirm.setCustomValidity("");
          return;
        }
        confirm.setCustomValidity(
          confirm.value === pw.value ? "" : "Passwords do not match."
        );
      };

      pw.addEventListener("input", check);
      confirm.addEventListener("input", check);
      check();
    });
  }

  // ------------------------------------------------------------------
  // 2. Password length hint
  // ------------------------------------------------------------------
  function passwordHint() {
    document.querySelectorAll("form").forEach((form) => {
      const pw = form.querySelector("[data-password]");
      const hint = form.querySelector("[data-password-hint]");
      if (!pw || !hint) return;

      const min = Number(pw.getAttribute("minlength") || 8);

      const update = () => {
        const n = pw.value.length;
        hint.textContent =
          n === 0
            ? `At least ${min} characters`
            : n < min
            ? `${n}/${min} characters`
            : "Strong enough";
        hint.style.color =
          n === 0 ? "var(--muted)"
          : n < min ? "var(--warn)"
          : "var(--ok)";
      };

      pw.addEventListener("input", update);
      update();
    });
  }

  // ------------------------------------------------------------------
  // 3. Email format check
  // ------------------------------------------------------------------
  function emailCheck() {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    document.querySelectorAll('input[type="email"]').forEach((el) => {
      el.addEventListener("blur", () => {
        if (!el.value) { el.setCustomValidity(""); return; }
        el.setCustomValidity(
          re.test(el.value) ? "" : "Please enter a valid email address."
        );
      });
    });
  }

  // ------------------------------------------------------------------
  // 4. Prevent double-submit
  // ------------------------------------------------------------------
  function doubleSubmitGuard() {
    document.querySelectorAll("form").forEach((form) => {
      if (form.dataset.submitGuard) return;
      form.dataset.submitGuard = "1";

      form.addEventListener("submit", (e) => {
        if (form.dataset.submitting === "1") {
          e.preventDefault();
          return;
        }
        form.dataset.submitting = "1";

        // Safety release in case navigation is cancelled.
        setTimeout(() => {
          form.dataset.submitting = "0";
        }, 30000);
      });
    });
  }

  // ------------------------------------------------------------------
  // 5. Character counter
  // ------------------------------------------------------------------
  function charCounter() {
    document.querySelectorAll("textarea[maxlength], input[maxlength]").forEach((el) => {
      const max = Number(el.getAttribute("maxlength"));
      if (!max) return;

      const counter = document.createElement("small");
      counter.className = "char-counter muted";
      counter.style.display = "block";
      counter.style.fontSize = ".8rem";
      counter.style.textAlign = "right";

      el.parentNode.insertBefore(counter, el.nextSibling);

      const update = () => {
        const n = el.value.length;
        counter.textContent = `${n}/${max}`;
        counter.style.color = n >= max ? "var(--warn)" : "var(--muted)";
      };

      el.addEventListener("input", update);
      update();
    });
  }

  // ------------------------------------------------------------------
  // 6. Phone auto-format (Kenya-friendly; general-purpose)
  // ------------------------------------------------------------------
  function phoneFormat() {
    document.querySelectorAll('input[type="tel"][data-format="phone"]').forEach((el) => {
      el.addEventListener("input", () => {
        const digits = el.value.replace(/\D/g, "").slice(0, 15);
        // Light touch: only normalize whitespace, keep plus sign.
        const clean = digits.replace(/(\d{3})(\d{3})(\d{3,})/, "$1 $2 $3");
        if (clean !== el.value) el.value = clean;
      });
    });
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  ready(() => {
    safe(passwordConfirmation);
    safe(passwordHint);
    safe(emailCheck);
    safe(doubleSubmitGuard);
    safe(charCounter);
    safe(phoneFormat);
  });
})();
