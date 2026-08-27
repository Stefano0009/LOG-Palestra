(() => {
  "use strict";

  /* ================= Dati esercizi ================= */
  const EXERCISE_GROUPS = {
    "Gambe": ["Stacco", "Squat con bilanciere", "Squat su box", "Affondi", "Affondi con manubri", "Step up con manubri", "Leg extension", "Pressa", "Pressa orizzontale"],
    "Dorso": ["Trazioni", "Pulley", "Lat machine (presa stretta)", "Lat machine con triangolo", "Lat machine avanti", "Rowing machine"],
    "Petto": ["Panca", "Piegamenti declinati", "Piegamenti a terra", "Piegamenti facilitati", "Croci manubri", "Distensioni con manubri su panca inclinata"],
    "Spalle": ["Military press", "Alzate laterali", "Distensioni da seduti con manubri"],
    "Braccia": ["Lat machine tricipiti", "Push down", "Hammer curl", "Curl ez"],
    "Addome": ["Addome"]
  };

  const DAY_TEMPLATES = [
    {
      key: "giorno1",
      name: "Giorno 1",
      desc: "Gambe, trazioni, petto",
      exercises: ["Stacco", "Pressa", "Trazioni", "Piegamenti declinati", "Panca", "Affondi", "Alzate laterali", "Addome"]
    },
    {
      key: "giorno2",
      name: "Giorno 2",
      desc: "Petto, dorso, braccia",
      exercises: ["Panca", "Trazioni", "Piegamenti a terra", "Pulley", "Lat machine tricipiti", "Push down", "Hammer curl"]
    },
    {
      key: "giorno3",
      name: "Giorno 3",
      desc: "Gambe, dorso, spalle",
      exercises: ["Squat con bilanciere", "Trazioni", "Military press", "Lat machine (presa stretta)", "Rowing machine", "Leg extension", "Croci manubri", "Curl ez", "Addome"]
    },
    { key: "libero", name: "Allenamento libero", desc: "Parti da zero e scegli tu", exercises: [] }
  ];

  const STORAGE_KEY = "logpalestra_days_v1";
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  const ICON_PLUS_SM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const ICON_ZAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';

  /* ================= Stato / persistenza ================= */
  let days = loadDays();
  let currentDayId = null;
  let circuitSelectMode = false;
  let selectedForCircuit = [];

  function loadDays() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveDays() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ================= Utils ================= */
  function todayISO() {
    const d = new Date();
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
  }
  function formatDateHuman(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  }
  function formatDateShort(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  }
  function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(showToast._tm);
    showToast._tm = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ================= Elementi DOM ================= */
  const viewHome = document.getElementById("view-home");
  const viewDay = document.getElementById("view-day");
  const homeContent = document.getElementById("home-content");
  const homeEyebrow = document.getElementById("home-date-eyebrow");
  const fabNew = document.getElementById("fab-new");
  const modalNewDay = document.getElementById("modal-newday");
  const templateList = document.getElementById("template-list");
  const exerciseList = document.getElementById("exercise-list");
  const exerciseSelect = document.getElementById("exercise-select");
  const dayTitleInput = document.getElementById("day-title-input");
  const dayDateInput = document.getElementById("day-date-input");
  const dayNotesInput = document.getElementById("day-notes");

  /* ================= Router semplice ================= */
  function showHome(pushHistory) {
    viewDay.classList.remove("active");
    viewHome.classList.add("active");
    fabNew.classList.remove("hidden");
    currentDayId = null;
    renderHome();
    if (pushHistory !== false) history.pushState({ view: "home" }, "", "#");
  }
  function showDay(dayId, pushHistory) {
    currentDayId = dayId;
    viewHome.classList.remove("active");
    viewDay.classList.add("active");
    fabNew.classList.add("hidden");
    renderDayEditor();
    if (pushHistory !== false) history.pushState({ view: "day", id: dayId }, "", "#giorno-" + dayId);
  }
  window.addEventListener("popstate", (e) => {
    const st = e.state;
    if (st && st.view === "day") showDay(st.id, false);
    else showHome(false);
  });

  /* ================= Render: Home ================= */
  function renderHome() {
    homeEyebrow.textContent = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

    if (days.length === 0) {
      homeContent.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5 17.5 17.5"/><path d="M17.5 6.5 6.5 17.5" opacity="0"/><rect x="2" y="9" width="3" height="6" rx="1"/><rect x="19" y="9" width="3" height="6" rx="1"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <strong>Nessuna giornata registrata</strong>
          <p>Premi "Nuova giornata" qui sotto per iniziare<br>a segnare il tuo allenamento di oggi.</p>
        </div>`;
      return;
    }

    const sorted = [...days].sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt - a.createdAt);
    homeContent.innerHTML = sorted.map(day => {
      const n = day.exercises.length;
      return `
        <div class="day-card" data-id="${day.id}">
          <div class="info">
            <div class="label-row">
              <span class="day-tag">${escapeHtml(day.title || "Giornata")}</span>
            </div>
            <div class="date">${formatDateHuman(day.date)}</div>
          </div>
          <div class="exercises-count">${n}<span class="unit">${n === 1 ? "esercizio" : "esercizi"}</span></div>
        </div>`;
    }).join("");

    homeContent.querySelectorAll(".day-card").forEach(card => {
      card.addEventListener("click", () => showDay(card.dataset.id));
    });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : str;
    return d.innerHTML;
  }

  /* ================= Nuova giornata: modal ================= */
  function openNewDayModal() {
    templateList.innerHTML = DAY_TEMPLATES.map(t => `
      <div class="template-option" data-key="${t.key}">
        <div>
          <div class="t-name">${t.name}</div>
          <div class="t-desc">${t.desc}</div>
        </div>
        ${ICON_CHEV}
      </div>
    `).join("");
    templateList.querySelectorAll(".template-option").forEach(el => {
      el.addEventListener("click", () => {
        const tpl = DAY_TEMPLATES.find(t => t.key === el.dataset.key);
        createDayFromTemplate(tpl);
        closeModal();
      });
    });
    modalNewDay.classList.add("open");
  }
  function closeModal() { modalNewDay.classList.remove("open"); }
  modalNewDay.addEventListener("click", (e) => { if (e.target === modalNewDay) closeModal(); });

  function createDayFromTemplate(tpl) {
    const day = {
      id: uid(),
      title: tpl.name,
      date: todayISO(),
      notes: "",
      createdAt: Date.now(),
      exercises: tpl.exercises.map(name => ({
        id: uid(),
        name,
        note: "",
        sets: [{ reps: "", weight: "" }]
      }))
    };
    days.push(day);
    saveDays();
    showDay(day.id);
  }

  fabNew.addEventListener("click", openNewDayModal);

  /* ================= Render: editor giornata ================= */
  function populateExerciseSelect() {
    exerciseSelect.innerHTML = `<option value="" disabled selected>Aggiungi esercizio...</option>` +
      Object.entries(EXERCISE_GROUPS).map(([group, list]) => `
        <optgroup label="${group}">
          ${list.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")}
        </optgroup>
      `).join("");
  }
  populateExerciseSelect();

  function getCurrentDay() {
    return days.find(d => d.id === currentDayId);
  }

  function renderDayEditor() {
    const day = getCurrentDay();
    if (!day) { showHome(); return; }

    dayTitleInput.value = day.title || "";
    dayDateInput.value = day.date || todayISO();
    dayNotesInput.value = day.notes || "";
    exerciseSelect.selectedIndex = 0;
    circuitSelectMode = false;
    selectedForCircuit = [];

    renderExercises(day);
  }

  function exitSelectionMode() {
    circuitSelectMode = false;
    selectedForCircuit = [];
    document.getElementById("selection-bar").style.display = "none";
    const day = getCurrentDay();
    if (day) renderExercises(day);
  }

  function updateSelectionBar() {
    const bar = document.getElementById("selection-bar");
    const text = document.getElementById("selection-bar-text");
    const confirmBtn = document.getElementById("btn-confirm-circuit");
    if (!circuitSelectMode) { bar.style.display = "none"; return; }
    bar.style.display = "flex";
    text.textContent = selectedForCircuit.length === 2
      ? "2 esercizi selezionati"
      : `Seleziona 2 esercizi (${selectedForCircuit.length}/2)`;
    confirmBtn.disabled = selectedForCircuit.length !== 2;
  }

  function renderExercises(day) {
    const toggleBtn = document.getElementById("btn-toggle-circuit-mode");
    const standaloneCount = day.exercises.filter(e => !e.circuitId).length;
    toggleBtn.classList.toggle("hidden", standaloneCount < 2);
    toggleBtn.classList.toggle("active", circuitSelectMode);

    if (day.exercises.length === 0) {
      exerciseList.innerHTML = `
        <div class="empty-state" style="padding:34px 10px;">
          <p>Nessun esercizio ancora.<br>Scegline uno dal menu qui sotto.</p>
        </div>`;
      updateSelectionBar();
      return;
    }

    const rendered = new Set();
    let html = "";
    day.exercises.forEach(ex => {
      if (rendered.has(ex.id)) return;
      if (ex.circuitId) {
        const members = day.exercises.filter(e => e.circuitId === ex.circuitId);
        members.forEach(m => rendered.add(m.id));
        html += renderCircuitGroup(members);
      } else {
        rendered.add(ex.id);
        html += renderExerciseCard(ex);
      }
    });

    exerciseList.innerHTML = html;
    bindExerciseCardEvents(day);
    updateSelectionBar();
  }

  function renderCircuitGroup(members) {
    const inner = members.map((m, i) =>
      renderExerciseCard(m) + (i < members.length - 1
        ? `<div class="circuit-connector">${ICON_ZAP} poi</div>`
        : "")
    ).join("");
    return `
      <div class="circuit-group">
        <div class="circuit-label">
          <span class="circuit-tag">Circuito</span>
          <button class="circuit-ungroup" data-circuit-id="${members[0].circuitId}">${ICON_X} Dividi</button>
        </div>
        ${inner}
      </div>`;
  }

  function renderExerciseCard(ex) {
    const isSelected = selectedForCircuit.includes(ex.id);
    const canSelect = circuitSelectMode && !ex.circuitId;
    const cardClasses = ["exercise-card"];
    if (canSelect) cardClasses.push("selectable");
    if (isSelected) cardClasses.push("selected");
    const doneCount = ex.sets.filter(s => s.reps !== "" || s.weight !== "").length;
    const totalTallies = Math.max(ex.sets.length, doneCount);
    const tallies = Array.from({ length: totalTallies }).map((_, i) =>
      `<div class="mark ${i < doneCount ? "filled" : ""}"></div>`
    ).join("");

    const rows = ex.sets.map((s, i) => `
      <tr data-set-index="${i}">
        <td class="set-num">${i + 1}</td>
        <td><input type="number" inputmode="numeric" min="0" class="set-reps" placeholder="reps" value="${s.reps}"></td>
        <td><input type="number" inputmode="decimal" min="0" step="0.5" class="set-weight" placeholder="kg" value="${s.weight}"></td>
        <td>
          <button class="remove-set" title="Rimuovi serie">${ICON_X}</button>
        </td>
      </tr>
    `).join("");

    const checkboxHtml = `<div class="select-checkbox ${isSelected ? "checked" : ""}">${isSelected ? ICON_CHECK : ""}</div>`;

    return `
      <div class="${cardClasses.join(" ")}" data-ex-id="${ex.id}">
        <div class="exercise-head">
          ${canSelect ? checkboxHtml : ""}
          <h3 style="flex:1;">${escapeHtml(ex.name)}</h3>
          ${!circuitSelectMode ? `<button class="remove-ex" title="Rimuovi esercizio">${ICON_TRASH}</button>` : ""}
        </div>
        <div class="tally">${tallies}</div>
        <table class="sets-table">
          <thead>
            <tr>
              <th class="num-col">Serie</th>
              <th>Reps</th>
              <th>Kg</th>
              <th class="action-col"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <button class="add-set-btn">${ICON_PLUS_SM} Aggiungi serie</button>
        <div class="note-wrap">
          <textarea placeholder="Note su questo esercizio (sensazioni, cedimento, tecnica...)">${escapeHtml(ex.note)}</textarea>
        </div>
      </div>
    `;
  }

  function bindExerciseCardEvents(day) {
    exerciseList.querySelectorAll(".circuit-ungroup").forEach(btn => {
      btn.addEventListener("click", () => {
        const cid = btn.dataset.circuitId;
        day.exercises.forEach(e => { if (e.circuitId === cid) e.circuitId = null; });
        saveDays();
        renderExercises(day);
      });
    });

    exerciseList.querySelectorAll(".exercise-card").forEach(card => {
      const exId = card.dataset.exId;
      const ex = day.exercises.find(e => e.id === exId);
      if (!ex) return;

      if (circuitSelectMode && !ex.circuitId) {
        card.querySelector(".exercise-head").addEventListener("click", () => {
          const idx = selectedForCircuit.indexOf(exId);
          if (idx >= 0) selectedForCircuit.splice(idx, 1);
          else if (selectedForCircuit.length < 2) selectedForCircuit.push(exId);
          renderExercises(day);
        });
        return;
      }

      const removeBtn = card.querySelector(".remove-ex");
      if (removeBtn) removeBtn.addEventListener("click", () => {
        day.exercises = day.exercises.filter(e => e.id !== exId);
        saveDays();
        renderExercises(day);
      });

      card.querySelector(".add-set-btn").addEventListener("click", () => {
        const last = ex.sets[ex.sets.length - 1];
        ex.sets.push({ reps: "", weight: last ? last.weight : "" });
        saveDays();
        renderExercises(day);
      });

      card.querySelectorAll("tbody tr").forEach(row => {
        const idx = Number(row.dataset.setIndex);

        row.querySelector(".set-reps").addEventListener("input", (e) => {
          ex.sets[idx].reps = e.target.value;
          saveDays();
          updateTally(card, ex);
        });
        row.querySelector(".set-weight").addEventListener("input", (e) => {
          ex.sets[idx].weight = e.target.value;
          saveDays();
          updateTally(card, ex);
        });
        row.querySelector(".remove-set").addEventListener("click", () => {
          if (ex.sets.length <= 1) { ex.sets[0] = { reps: "", weight: "" }; }
          else ex.sets.splice(idx, 1);
          saveDays();
          renderExercises(day);
        });
      });

      card.querySelector(".note-wrap textarea").addEventListener("input", (e) => {
        ex.note = e.target.value;
        saveDays();
      });
    });
  }

  function updateTally(card, ex) {
    const doneCount = ex.sets.filter(s => s.reps !== "" || s.weight !== "").length;
    const marks = card.querySelectorAll(".tally .mark");
    marks.forEach((m, i) => m.classList.toggle("filled", i < doneCount));
  }

  /* ================= Eventi editor: titolo, data, note, aggiunta esercizio ================= */
  dayTitleInput.addEventListener("input", () => {
    const day = getCurrentDay(); if (!day) return;
    day.title = dayTitleInput.value;
    saveDays();
  });
  dayDateInput.addEventListener("input", () => {
    const day = getCurrentDay(); if (!day) return;
    day.date = dayDateInput.value;
    saveDays();
  });
  dayNotesInput.addEventListener("input", () => {
    const day = getCurrentDay(); if (!day) return;
    day.notes = dayNotesInput.value;
    saveDays();
  });

  document.getElementById("btn-toggle-circuit-mode").addEventListener("click", () => {
    const day = getCurrentDay(); if (!day) return;
    circuitSelectMode = !circuitSelectMode;
    selectedForCircuit = [];
    renderExercises(day);
  });

  document.getElementById("btn-cancel-selection").addEventListener("click", exitSelectionMode);

  document.getElementById("btn-confirm-circuit").addEventListener("click", () => {
    const day = getCurrentDay(); if (!day) return;
    if (selectedForCircuit.length !== 2) return;
    const circuitId = uid();
    day.exercises.forEach(e => {
      if (selectedForCircuit.includes(e.id)) e.circuitId = circuitId;
    });
    saveDays();
    exitSelectionMode();
    showToast("Circuito creato");
  });

  document.getElementById("btn-add-exercise").addEventListener("click", () => {
    const day = getCurrentDay(); if (!day) return;
    const name = exerciseSelect.value;
    if (!name) return;
    day.exercises.push({ id: uid(), name, note: "", sets: [{ reps: "", weight: "" }] });
    saveDays();
    renderExercises(day);
    exerciseSelect.selectedIndex = 0;
  });

  document.getElementById("btn-back").addEventListener("click", () => history.back());

  document.getElementById("btn-delete-day").addEventListener("click", () => {
    const day = getCurrentDay(); if (!day) return;
    if (!confirm(`Eliminare "${day.title || "questa giornata"}"? L'azione non è reversibile.`)) return;
    days = days.filter(d => d.id !== day.id);
    saveDays();
    history.back();
  });

  /* ================= Esportazione PDF ================= */
  document.getElementById("btn-export-pdf").addEventListener("click", () => {
    const day = getCurrentDay();
    if (!day) return;
    try {
      exportDayToPdf(day);
      showToast("PDF scaricato");
    } catch (err) {
      console.error(err);
      showToast("Errore nell'esportazione PDF");
    }
  });

  function exportDayToPdf(day) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 48;
    let y = 56;

    const INK = "#14120F";
    const ACCENT = "#C1502E";
    const GREY = "#6b6459";

    doc.setTextColor(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text((day.title || "Giornata").toUpperCase(), marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(GREY);
    y += 20;
    doc.text(formatDateHuman(day.date), marginX, y);

    y += 8;
    doc.setDrawColor(224, 218, 206);
    doc.line(marginX, y, pageW - marginX, y);
    y += 26;

    const colX = { num: marginX, reps: marginX + 40, weight: marginX + 150, note: marginX + 260 };

    day.exercises.forEach((ex, exIdx) => {
      if (y > 740) { doc.addPage(); y = 56; }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(INK);
      doc.text(`${exIdx + 1}. ${ex.name}`, marginX, y);
      y += 18;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(ACCENT);
      doc.text("SERIE", colX.num, y);
      doc.text("REPS", colX.reps, y);
      doc.text("KG", colX.weight, y);
      y += 6;
      doc.setDrawColor(235, 230, 220);
      doc.line(marginX, y, pageW - marginX, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(INK);

      const setsWithData = ex.sets.filter(s => s.reps !== "" || s.weight !== "");
      const setsToPrint = setsWithData.length ? setsWithData : ex.sets;

      setsToPrint.forEach((s, i) => {
        if (y > 770) { doc.addPage(); y = 56; }
        doc.text(String(i + 1), colX.num, y);
        doc.text(s.reps !== "" ? String(s.reps) : "-", colX.reps, y);
        doc.text(s.weight !== "" ? String(s.weight) + " kg" : "-", colX.weight, y);
        y += 16;
      });

      if (ex.note && ex.note.trim()) {
        y += 2;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(GREY);
        const noteLines = doc.splitTextToSize("Note: " + ex.note.trim(), pageW - marginX * 2);
        noteLines.forEach(line => {
          if (y > 770) { doc.addPage(); y = 56; }
          doc.text(line, marginX, y);
          y += 13;
        });
      }

      y += 16;
    });

    if (day.notes && day.notes.trim()) {
      if (y > 700) { doc.addPage(); y = 56; }
      y += 6;
      doc.setDrawColor(224, 218, 206);
      doc.line(marginX, y, pageW - marginX, y);
      y += 22;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(INK);
      doc.text("NOTE GENERALI", marginX, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(GREY);
      const lines = doc.splitTextToSize(day.notes.trim(), pageW - marginX * 2);
      lines.forEach(line => {
        if (y > 780) { doc.addPage(); y = 56; }
        doc.text(line, marginX, y);
        y += 15;
      });
    }

    const filenameSafe = (day.title || "giornata").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    doc.save(`${filenameSafe || "giornata"}_${day.date || todayISO()}.pdf`);
  }

  /* ================= Service worker ================= */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ================= Avvio ================= */
  history.replaceState({ view: "home" }, "", "#");
  showHome(false);
})();
