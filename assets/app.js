/* ==========================================================================
   Apex Precision Automotive — shared client behaviour
   Vanilla JS, no build step. Each block no-ops on pages it doesn't apply to.
   ========================================================================== */
(function () {
  "use strict";

  var THEME_KEY = "apex-theme";

  /* ------------------------------- Theme --------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      var icon = btn.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = theme === "light" ? "dark_mode" : "light_mode";
      btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(saved || (prefersLight ? "light" : "dark"));

    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }
  }

  /* --------------------------- Active bottom tab -------------------------- */
  function initActiveTab() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    document.querySelectorAll(".tab").forEach(function (tab) {
      if (tab.getAttribute("data-path") === page) tab.classList.add("is-active");
    });
  }

  /* -------------------------------- Toast -------------------------------- */
  var toastTimer;
  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    var text = toast.querySelector("[data-toast-message]");
    if (text) text.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2400);
  }
  window.showToast = showToast;

  /* ----------------------------- Like buttons ----------------------------- */
  function initLikeButtons() {
    document.querySelectorAll("[data-like]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var icon = btn.querySelector(".material-symbols-outlined");
        var liked = btn.classList.toggle("is-liked");
        if (icon) icon.classList.toggle("filled", liked);
        showToast(liked ? "Saved to your garage" : "Removed from saved garage");
      });
    });
  }

  /* ------------------------- Inventory: search/filter -------------------- */
  function initInventory() {
    var search = document.getElementById("vehicle-search");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".vehicle-card"));
    if (!cards.length) return;

    var activeFilter = "all";
    var query = "";

    function applyFilters() {
      cards.forEach(function (card) {
        var price = parseInt(card.getAttribute("data-price") || "0", 10);
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var category = card.getAttribute("data-category") || "";

        var matchesPrice = true;
        if (activeFilter === "under-15k") matchesPrice = price < 15000;
        else if (activeFilter === "15k-30k") matchesPrice = price >= 15000 && price <= 30000;
        else if (activeFilter === "30k-plus") matchesPrice = price > 30000;
        else if (activeFilter === "low-monthly") matchesPrice = price <= 18000;

        var matchesQuery = !query || title.indexOf(query) !== -1 || category.indexOf(query) !== -1;
        card.style.display = matchesPrice && matchesQuery ? "flex" : "none";
      });
    }

    document.querySelectorAll(".filter-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        document.querySelectorAll(".filter-pill").forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        activeFilter = pill.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });

    document.querySelectorAll(".cat-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var cat = chip.getAttribute("data-category") || "";
        if (search) search.value = cat === "all" ? "" : cat;
        query = cat === "all" ? "" : cat.toLowerCase();
        applyFilters();
      });
    });

    if (search) {
      search.addEventListener("input", function () {
        query = search.value.toLowerCase().trim();
        applyFilters();
      });
    }
  }

  /* ---------------------- Vehicle details: gallery ----------------------- */
  function initGallery() {
    var stage = document.getElementById("gallery-image");
    var counter = document.getElementById("gallery-counter");
    var thumbs = Array.prototype.slice.call(document.querySelectorAll(".thumb"));
    if (!stage || !thumbs.length) return;

    function select(index) {
      var thumb = thumbs[index];
      var img = thumb ? thumb.querySelector("img") : null;
      if (img) stage.src = img.src;
      thumbs.forEach(function (t, i) { t.classList.toggle("is-active", i === index); });
      if (counter) counter.textContent = (index + 1) + " / " + thumbs.length;
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener("click", function () { select(index); });
    });
  }

  /* ------------------- Vehicle details: financing calc ------------------- */
  function initFinancing() {
    var monthlyEl = document.getElementById("monthly-value");
    if (!monthlyEl) return;

    var state = {
      price: parseFloat(monthlyEl.getAttribute("data-price") || "29800"),
      down: 3000,
      term: 60,
      apr: 4.9
    };

    var principalEl = document.getElementById("principal-value");
    var interestEl = document.getElementById("interest-value");
    var downAmountEl = document.getElementById("down-amount");
    var downPercentEl = document.getElementById("down-percent");
    var termLabelEl = document.getElementById("term-label");
    var downSlider = document.getElementById("down-slider");

    function currency(n) { return "$" + Math.round(n).toLocaleString(); }

    function recalc() {
      var principal = Math.max(0, state.price - state.down);
      var r = state.apr / 100 / 12;
      var monthly;
      if (r === 0) {
        monthly = principal / state.term;
      } else {
        monthly = (principal * r * Math.pow(1 + r, state.term)) / (Math.pow(1 + r, state.term) - 1);
      }
      var totalInterest = Math.max(0, monthly * state.term - principal);

      monthlyEl.textContent = "$" + Math.round(monthly);
      if (principalEl) principalEl.textContent = currency(principal);
      if (interestEl) interestEl.textContent = currency(totalInterest);
    }

    function updateDown(value) {
      state.down = value;
      if (downAmountEl) downAmountEl.textContent = currency(value);
      if (downPercentEl) downPercentEl.textContent = Math.round((value / state.price) * 100) + "%";
      recalc();
    }

    if (downSlider) {
      downSlider.addEventListener("input", function () { updateDown(parseInt(downSlider.value, 10)); });
      // keep the min/max sensible relative to the vehicle price
      downSlider.max = String(Math.round(state.price * 0.6 / 250) * 250);
      downSlider.step = "250";
    }

    document.querySelectorAll("[data-tier]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-tier]").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        state.apr = parseFloat(btn.getAttribute("data-apr"));
        recalc();
      });
    });

    document.querySelectorAll("[data-term]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-term]").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        state.term = parseInt(btn.getAttribute("data-term"), 10);
        if (termLabelEl) termLabelEl.textContent = state.term + " Months";
        recalc();
      });
    });

    updateDown(state.down);
  }

  /* ------------------------ Services: VIN appraisal ---------------------- */
  function initAppraisal() {
    var btn = document.getElementById("appraise-btn");
    var input = document.getElementById("vin-input");
    var notice = document.getElementById("valuation-notice");
    if (!btn || !input) return;

    btn.addEventListener("click", function () {
      if (!input.value.trim()) {
        input.focus();
        input.placeholder = "Please enter a VIN or license plate";
        return;
      }
      btn.disabled = true;
      var original = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined">refresh</span> Appraising...';
      setTimeout(function () {
        if (notice) notice.classList.remove("hide");
        btn.innerHTML = '<span class="material-symbols-outlined">check</span> Done';
        showToast("Appraisal ready — +$500 over verified dealer offers");
        setTimeout(function () { btn.disabled = false; btn.innerHTML = original; }, 2600);
      }, 900);
    });
  }

  /* ----------------------------- Contact form ---------------------------- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var btn = document.getElementById("contact-submit");
    var success = document.getElementById("form-success");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">progress_activity</span> Dispatching...';
      }
      setTimeout(function () {
        if (success) success.classList.add("is-visible");
        if (btn) {
          btn.innerHTML = '<span class="material-symbols-outlined">done_all</span> Message Sent';
        }
        showToast("Inquiry sent — an advisor will reply within 15 minutes");
        setTimeout(function () {
          form.reset();
          if (success) success.classList.remove("is-visible");
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Send Message to Advisor <span class="material-symbols-outlined">send</span>';
          }
        }, 4500);
      }, 800);
    });
  }

  /* ------------------------------ Boot ----------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initActiveTab();
    initLikeButtons();
    initInventory();
    initGallery();
    initFinancing();
    initAppraisal();
    initContactForm();
  });
})();
