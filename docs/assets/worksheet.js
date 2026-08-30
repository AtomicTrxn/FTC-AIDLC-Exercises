/* ============================================================
   worksheet.js — answers that persist in the reader's browser.

   Storage model, per document:
     aidlc:<docId>:current  { rev, schema, started, updated, values }
     aidlc:<docId>:history  [ {rev, schema, started, archived, values}, … ]

   "Reset" archives the current sheet and starts a new revision. The
   history keeps WS_CONFIG.keepRevisions entries; the oldest is dropped.

   Everything is local to this browser. Nothing is uploaded.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.WS_CONFIG || {};
  var KEEP = CFG.keepRevisions || 2;
  var K_CUR = "aidlc:" + CFG.docId + ":current";
  var K_HIST = "aidlc:" + CFG.docId + ":history";

  /* ---------- storage, defensively ---------- */
  var store = {
    ok: true,
    get: function (k, fallback) {
      try {
        var v = window.localStorage.getItem(k);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { this.ok = false; return fallback; }
    },
    set: function (k, v) {
      try { window.localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (e) { this.ok = false; return false; }
    },
  };

  function blank() {
    return { rev: 1, schema: CFG.schema, started: new Date().toISOString(), updated: null, values: {} };
  }

  var current = store.get(K_CUR, null);
  var history = store.get(K_HIST, []) || [];
  var schemaChanged = false;

  if (!current) {
    current = blank();
  } else if (current.schema !== CFG.schema) {
    // The worksheet itself changed shape. Restoring by field id would drop
    // answers into the wrong boxes, so archive the old sheet and start clean.
    if (hasAnswers(current)) {
      history.unshift(archive(current));
      history = history.slice(0, KEEP);
      store.set(K_HIST, history);
    }
    var nextRev = (current.rev || 1) + 1;
    current = blank();
    current.rev = nextRev;
    schemaChanged = true;
  }

  function hasAnswers(sheet) {
    var v = sheet && sheet.values;
    if (!v) return false;
    for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) {
      var x = v[k];
      if (x === true) return true;
      if (typeof x === "string" && x.trim() !== "") return true;
    }
    return false;
  }

  function archive(sheet) {
    return {
      rev: sheet.rev, schema: sheet.schema, started: sheet.started,
      archived: new Date().toISOString(), values: sheet.values,
    };
  }

  /* ---------- DOM wiring ---------- */
  var fields = [].slice.call(document.querySelectorAll("[data-field]"));
  var statusEl = document.getElementById("ws-status");
  var revEl = document.getElementById("ws-rev");
  var progText = document.getElementById("ws-progress-text");
  var meterFill = document.getElementById("ws-meter-fill");
  var noteEl = document.getElementById("ws-note");

  function isCheck(el) { return el.type === "checkbox"; }

  function paint() {
    fields.forEach(function (el) {
      var v = current.values[el.dataset.field];
      if (isCheck(el)) el.checked = v === true;
      else if (typeof v === "string") el.value = v;
      if (!isCheck(el)) autosize(el);
    });
    revEl.textContent = current.rev;
    updateProgress();
  }

  function autosize(el) {
    el.style.height = "auto";
    el.style.height = Math.max(el.scrollHeight, 44) + "px";
  }

  function updateProgress() {
    var steps = [].slice.call(document.querySelectorAll(".ws-step"));
    var done = steps.filter(function (s) { return s.checked; }).length;
    var pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
    progText.textContent = done + " of " + steps.length + " steps";
    meterFill.style.width = pct + "%";
    steps.forEach(function (s) {
      var head = s.closest(".step-head");
      if (head) head.classList.toggle("is-done", s.checked);
    });
  }

  var saveTimer = null, savedTimer = null;
  function flag(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "ws-status" + (kind ? " " + kind : "");
  }

  function save() {
    current.updated = new Date().toISOString();
    var ok = store.set(K_CUR, current);
    if (!ok) { flag("Could not save — storage unavailable", "warn"); return; }
    var t = new Date();
    var hh = String(t.getHours()).padStart(2, "0"), mm = String(t.getMinutes()).padStart(2, "0");
    flag("Saved " + hh + ":" + mm, "ok");
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { flag("All changes saved"); }, 4000);
  }

  function onEdit(el) {
    var k = el.dataset.field;
    if (isCheck(el)) { current.values[k] = el.checked; updateProgress(); }
    else { current.values[k] = el.value; autosize(el); }
    flag("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 350);
  }

  fields.forEach(function (el) {
    el.addEventListener(isCheck(el) ? "change" : "input", function () { onEdit(el); });
  });

  /* ---------- reset → new revision ---------- */
  document.getElementById("ws-reset-btn").addEventListener("click", function () {
    var msg = hasAnswers(current)
      ? "Start revision " + (current.rev + 1) + "?\n\nYour current answers are kept as revision " +
        current.rev + ". The " + KEEP + " most recent revisions are stored; anything older is discarded."
      : "This sheet is empty — reset anyway?";
    if (!window.confirm(msg)) return;

    if (hasAnswers(current)) {
      history.unshift(archive(current));
      history = history.slice(0, KEEP);
      store.set(K_HIST, history);
    }
    var next = current.rev + 1;
    current = blank();
    current.rev = next;
    store.set(K_CUR, current);
    fields.forEach(function (el) { if (isCheck(el)) el.checked = false; else el.value = ""; });
    paint();
    renderHistory();
    flag("Revision " + next + " started", "ok");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- revisions panel ---------- */
  var panel = document.getElementById("ws-history");

  function fmt(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function countAnswers(values) {
    var n = 0;
    for (var k in values) if (Object.prototype.hasOwnProperty.call(values, k)) {
      var v = values[k];
      if (v === true || (typeof v === "string" && v.trim() !== "")) n++;
    }
    return n;
  }

  function renderHistory() {
    if (!history.length) {
      panel.innerHTML = '<p class="ws-empty">No previous revisions yet. Reset this sheet to archive your ' +
        'current answers as revision ' + current.rev + '.</p>';
      return;
    }
    var html = '<p class="ws-empty">Keeping the ' + KEEP + ' most recent. Restoring archives your current sheet first, so nothing is lost.</p><ul class="ws-revs">';
    history.forEach(function (r, i) {
      html += '<li><span class="r-n">Revision ' + r.rev + '</span>' +
        '<span class="r-m">' + countAnswers(r.values) + ' answers · started ' + fmt(r.started) +
        ' · archived ' + fmt(r.archived) + '</span>' +
        '<button type="button" class="ws-btn small" data-restore="' + i + '">Restore</button></li>';
    });
    panel.innerHTML = html + "</ul>";
  }

  panel.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-restore]");
    if (!btn) return;
    var idx = parseInt(btn.dataset.restore, 10);
    var rev = history[idx];
    if (!rev) return;
    if (!window.confirm("Restore revision " + rev.rev + "?\n\nYour current answers are archived first.")) return;

    if (hasAnswers(current)) history.unshift(archive(current));
    history.splice(history.indexOf(rev), 1);
    history = history.slice(0, KEEP);
    store.set(K_HIST, history);

    var next = current.rev + 1;
    current = { rev: next, schema: CFG.schema, started: rev.started, updated: new Date().toISOString(), values: JSON.parse(JSON.stringify(rev.values)) };
    store.set(K_CUR, current);
    paint();
    renderHistory();
    flag("Restored revision " + rev.rev + " as revision " + next, "ok");
  });

  document.getElementById("ws-history-btn").addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    this.classList.toggle("is-open", !panel.hidden);
  });

  document.getElementById("ws-print-btn").addEventListener("click", function () { window.print(); });

  /* ---------- boot ---------- */
  paint();
  renderHistory();
  store.set(K_CUR, current);

  if (!store.ok) {
    noteEl.hidden = false;
    noteEl.className = "ws-note warn";
    noteEl.textContent = "This browser is blocking local storage, so answers cannot be saved. " +
      "Private windows and blocked site data both cause this — your typing still works, but it will be lost when you close the tab.";
    flag("Not saving", "warn");
  } else if (schemaChanged) {
    noteEl.hidden = false;
    noteEl.textContent = "This worksheet has been revised since you last opened it, so the questions no longer line up with your saved answers. " +
      "Those answers are safe under Revisions — this is a fresh sheet.";
    flag("New version of this worksheet");
  } else if (hasAnswers(current)) {
    flag("Answers restored");
    setTimeout(function () { flag("All changes saved"); }, 4000);
  } else {
    flag("Ready — answers save as you type");
  }

  window.addEventListener("beforeunload", function () {
    if (saveTimer) { clearTimeout(saveTimer); save(); }
  });
})();
