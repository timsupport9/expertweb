/**
 * ExpertHub — home.js
 * Loaded automatically by app.js because <body data-page="home">.
 * Pings /health every 30 seconds and updates the status panel.
 */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var dot     = document.getElementById("status-dot");
    var text    = document.getElementById("status-text");
    var meta    = document.getElementById("status-meta");
    var refresh = document.getElementById("refresh-status");
    var endpoint = "/health";

    if (!dot || !text || !meta) return;

    function setState(kind, label, detail) {
      dot.className = "status-dot" + (kind ? " " + kind : "");
      text.textContent = label;
      meta.textContent = detail || "—";
    }

    async function check() {
      setState("", "Checking…", "Contacting " + endpoint);
      var started = performance.now();

      try {
        var res = await fetch(endpoint + "?t=" + Date.now(), {
          headers: { Accept: "application/json" },
          cache: "no-store"
        });

        var latency = Math.round(performance.now() - started);
        var data = null;
        try { data = await res.json(); } catch (_) {}

        if (res.ok && data && data.success) {
          setState(
            "ok",
            "Operational",
            (data.service || "ExpertHub") +
              " · " + latency + "ms · " +
              new Date().toLocaleTimeString()
          );
        } else {
          setState("warn", "Degraded", "HTTP " + res.status + " · " + latency + "ms");
        }
      } catch (err) {
        setState("err", "Unreachable", (err && err.message) || "Network error");
      }
    }

    if (refresh) refresh.addEventListener("click", check);
    check();

    var timer = setInterval(function () {
      if (!document.hidden) check();
    }, 30000);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) check();
    });

    window.addEventListener("pagehide", function () {
      clearInterval(timer);
    });
  });
})();
