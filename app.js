(() => {
  "use strict";

  /* ================= Dati esercizi ================= */
  const EXERCISE_GROUPS = {
    "Gambe": ["Stacco", "Squat con bilanciere", "Squat su box", "Affondi", "Affondi con manubri", "Step up con manubri", "Leg extension", "Pressa orizzontale"],
    "Dorso": ["Trazioni", "Pulley", "Lat machine con triangolo", "Lat machine avanti", "Rowing machine"],
    "Petto": ["Panca", "Piegamenti declinati", "Piegamenti a terra", "Piegamenti facilitati", "Croci ai cavi"],
    "Spalle": ["Military press", "Alzate laterali"],
    "Braccia": ["Push down", "Hammer curl", "Curl ez"],
    "Addome": ["Crunch", "Reverse Crunch", "Russian Twist"]
  };

  const EXERCISE_TO_GROUP = { "Addome": "Addome" };
  Object.entries(EXERCISE_GROUPS).forEach(([group, list]) => {
    list.forEach(name => { EXERCISE_TO_GROUP[name] = group; });
  });

  const GROUP_ICONS = {
    "Gambe": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4h2l1 7-1 9H8l-1-8"/><path d="M15 4h2l1 8-1 8h-3l-1-9"/></svg>',
    "Dorso": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5v3M20 5v3"/><path d="M4 8h16"/><path d="M9 8v11M15 8v11"/><path d="M9 19h6"/></svg>',
    "Petto": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="3" height="5" rx="1"/><rect x="19" y="10" width="3" height="5" rx="1"/><rect x="5" y="8" width="3" height="9" rx="1"/><rect x="16" y="8" width="3" height="9" rx="1"/><line x1="8" y1="12.5" x2="16" y2="12.5"/></svg>',
    "Spalle": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6"/><circle cx="6" cy="14" r="2.6"/><circle cx="18" cy="14" r="2.6"/><path d="M6 11.4V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3.4"/></svg>',
    "Braccia": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18c-2-1-3-3-2-6 1-2 1-4 3-5"/><path d="M7 7c2-1 4-1 5 1 1 1.5 1 3 3 4"/><circle cx="17" cy="14" r="3"/></svg>',
    "Addome": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="15" x2="17" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/></svg>'
  };
  function groupIconFor(exName) {
    return GROUP_ICONS[EXERCISE_TO_GROUP[exName]] || GROUP_ICONS["Addome"];
  }

  const ANGLE_OPTIONS = ["0", "20", "30", "60", "90"];
  const ANGLE_EXERCISES = new Set(["Panca"]);
  function isAngleExercise(name) {
    return ANGLE_EXERCISES.has(name);
  }

  const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
  function slugifyExerciseName(name) {
    return (name || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const BUILTIN_TEMPLATES = [
    { key: "libero", name: "Allenamento libero", desc: "Parti da zero e scegli tu", exercises: [] }
  ];

  const STORAGE_KEY = "logpalestra_days_v1";
  const TEMPLATES_KEY = "logpalestra_templates_v1";
  const BODYWEIGHT_KEY = "logpalestra_bodyweight_v1";
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  const ICON_PLUS_SM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const ICON_ZAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
  const ICON_GRIP = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
  const ICON_SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.6" x2="15.4" y2="6.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"/></svg>';
  const ICON_BOOKMARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';

  /* ================= Stato / persistenza ================= */
  let days = loadDays();
  let customTemplates = loadTemplates();
  let bodyweightEntries = loadBodyweight();
  let currentDayId = null;
  let circuitSelectMode = false;
  let selectedForCircuit = [];
  let dnd = null;
  let progressDetailExercise = null;

  function loadDays() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveDays() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  }
  function loadTemplates() {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveTemplates() {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
  }
  function loadBodyweight() {
    try {
      const raw = localStorage.getItem(BODYWEIGHT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveBodyweight() {
    localStorage.setItem(BODYWEIGHT_KEY, JSON.stringify(bodyweightEntries));
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
  const viewStats = document.getElementById("view-stats");
  const viewProgress = document.getElementById("view-progress");
  const viewBodyweight = document.getElementById("view-bodyweight");
  const homeContent = document.getElementById("home-content");
  const homeEyebrow = document.getElementById("home-date-eyebrow");
  const fabNew = document.getElementById("fab-new");
  const modalNewDay = document.getElementById("modal-newday");
  const templateList = document.getElementById("template-list");
  const exerciseList = document.getElementById("exercise-list");
  const dayTitleInput = document.getElementById("day-title-input");
  const dayDateInput = document.getElementById("day-date-input");
  const dayNotesInput = document.getElementById("day-notes");

  /* ================= Router semplice ================= */
  const ALL_VIEWS = [viewHome, viewDay, viewStats, viewProgress, viewBodyweight];
  function hideAllViews() {
    ALL_VIEWS.forEach(v => v.classList.remove("active"));
  }
  function showHome(pushHistory) {
    hideAllViews();
    viewHome.classList.add("active");
    fabNew.classList.remove("hidden");
    currentDayId = null;
    renderHome();
    if (pushHistory !== false) history.pushState({ view: "home" }, "", "#");
  }
  function showDay(dayId, pushHistory) {
    currentDayId = dayId;
    hideAllViews();
    viewDay.classList.add("active");
    fabNew.classList.add("hidden");
    renderDayEditor();
    if (pushHistory !== false) history.pushState({ view: "day", id: dayId }, "", "#giorno-" + dayId);
  }
  function showStats(pushHistory) {
    hideAllViews();
    viewStats.classList.add("active");
    fabNew.classList.add("hidden");
    renderStats();
    if (pushHistory !== false) history.pushState({ view: "stats" }, "", "#statistiche");
  }
  function showProgress(exerciseName, pushHistory) {
    hideAllViews();
    viewProgress.classList.add("active");
    fabNew.classList.add("hidden");
    progressDetailExercise = exerciseName || null;
    renderProgress();
    if (pushHistory !== false) {
      const hash = exerciseName ? "#progressi-" + encodeURIComponent(exerciseName) : "#progressi";
      history.pushState({ view: "progress", exercise: exerciseName || null }, "", hash);
    }
  }
  function showBodyweight(pushHistory) {
    hideAllViews();
    viewBodyweight.classList.add("active");
    fabNew.classList.add("hidden");
    renderBodyweight();
    if (pushHistory !== false) history.pushState({ view: "bodyweight" }, "", "#peso");
  }
  window.addEventListener("popstate", (e) => {
    const st = e.state;
    if (st && st.view === "day") showDay(st.id, false);
    else if (st && st.view === "stats") showStats(false);
    else if (st && st.view === "progress") showProgress(st.exercise, false);
    else if (st && st.view === "bodyweight") showBodyweight(false);
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
  function getAllTemplateOptions() {
    return [
      ...BUILTIN_TEMPLATES,
      ...customTemplates.map(t => ({
        key: t.id,
        id: t.id,
        name: t.name,
        desc: `${t.exercises.length} ${t.exercises.length === 1 ? "esercizio" : "esercizi"}`,
        exercises: t.exercises,
        isCustom: true
      }))
    ];
  }

  function openNewDayModal() {
    const options = getAllTemplateOptions();
    const hint = customTemplates.length === 0
      ? `<p class="modal-hint">Crea un allenamento libero, aggiungi gli esercizi e salvalo come modello per ritrovarlo qui con il nome che vuoi.</p>`
      : "";

    templateList.innerHTML = options.map(t => `
      <div class="template-option" data-key="${t.key}">
        <div>
          <div class="t-name">${escapeHtml(t.name)}</div>
          <div class="t-desc">${escapeHtml(t.desc)}</div>
        </div>
        ${t.isCustom ? `<button class="template-delete" data-id="${t.id}" title="Elimina modello">${ICON_TRASH}</button>` : ICON_CHEV}
      </div>
    `).join("") + hint;

    templateList.querySelectorAll(".template-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const tpl = customTemplates.find(t => t.id === id);
        if (!tpl) return;
        if (!confirm(`Eliminare il modello "${tpl.name}"?`)) return;
        customTemplates = customTemplates.filter(t => t.id !== id);
        saveTemplates();
        openNewDayModal();
      });
    });

    templateList.querySelectorAll(".template-option").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target.closest(".template-delete")) return;
        const tpl = options.find(t => t.key === el.dataset.key);
        if (!tpl) return;
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
      exercises: tpl.exercises.map(name => {
        const ex = { id: uid(), name, note: "", sets: [{ reps: "", weight: "" }] };
        if (isAngleExercise(name)) ex.angle = "0";
        return ex;
      })
    };
    days.push(day);
    saveDays();
    showDay(day.id);
  }

  fabNew.addEventListener("click", openNewDayModal);

  /* ================= Salva giornata come modello ================= */
  document.getElementById("btn-save-template").addEventListener("click", () => {
    const day = getCurrentDay();
    if (!day) return;
    if (day.exercises.length === 0) {
      showToast("Aggiungi almeno un esercizio prima di salvare il modello");
      return;
    }
    const suggested = day.title && day.title !== "Allenamento libero" ? day.title : "";
    const name = prompt("Nome del modello:", suggested);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) { showToast("Nome non valido"); return; }

    const exerciseNames = day.exercises.map(e => e.name);
    const existing = customTemplates.find(t => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!confirm(`Esiste già un modello chiamato "${trimmed}". Sovrascriverlo?`)) return;
      existing.exercises = exerciseNames;
    } else {
      customTemplates.push({ id: uid(), name: trimmed, exercises: exerciseNames });
    }
    saveTemplates();
    showToast("Modello salvato");
  });

  /* ================= Render: editor giornata ================= */
  /* ================= Aggiungi esercizio: ricerca ================= */
  const modalAddExercise = document.getElementById("modal-add-exercise");
  const exerciseSearchInput = document.getElementById("exercise-search-input");
  const exerciseSearchResults = document.getElementById("exercise-search-results");

  function renderExerciseSearchResults(query) {
    const q = (query || "").trim().toLowerCase();
    let html = "";
    Object.entries(EXERCISE_GROUPS).forEach(([group, list]) => {
      const filtered = list.filter(name => name.toLowerCase().includes(q));
      if (filtered.length === 0) return;
      html += `<div class="search-group-label">${escapeHtml(group)}</div>`;
      html += filtered.map(name => `<div class="search-result-item" data-name="${escapeHtml(name)}">${escapeHtml(name)}</div>`).join("");
    });
    exerciseSearchResults.innerHTML = html || `<p class="modal-hint">Nessun esercizio trovato.</p>`;
    exerciseSearchResults.querySelectorAll(".search-result-item").forEach(el => {
      el.addEventListener("click", () => {
        addExerciseToCurrentDay(el.dataset.name);
        modalAddExercise.classList.remove("open");
      });
    });
  }

  function addExerciseToCurrentDay(name) {
    const day = getCurrentDay();
    if (!day) return;
    const newEx = { id: uid(), name, note: "", sets: [{ reps: "", weight: "" }] };
    if (isAngleExercise(name)) newEx.angle = "0";
    day.exercises.push(newEx);
    saveDays();
    renderExercises(day);
  }

  document.getElementById("btn-open-add-exercise").addEventListener("click", () => {
    exerciseSearchInput.value = "";
    renderExerciseSearchResults("");
    modalAddExercise.classList.add("open");
    setTimeout(() => exerciseSearchInput.focus(), 60);
  });
  exerciseSearchInput.addEventListener("input", (e) => renderExerciseSearchResults(e.target.value));
  modalAddExercise.addEventListener("click", (e) => { if (e.target === modalAddExercise) modalAddExercise.classList.remove("open"); });

  function getCurrentDay() {
    return days.find(d => d.id === currentDayId);
  }

  function renderDayEditor() {
    const day = getCurrentDay();
    if (!day) { showHome(); return; }

    dayTitleInput.value = day.title || "";
    dayDateInput.value = day.date || todayISO();
    dayNotesInput.value = day.notes || "";
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

  function computeBlocks(day) {
    const blocks = [];
    const seen = new Set();
    day.exercises.forEach(ex => {
      if (seen.has(ex.id)) return;
      if (ex.circuitId) {
        const members = day.exercises.filter(e => e.circuitId === ex.circuitId);
        members.forEach(m => seen.add(m.id));
        blocks.push({ type: "circuit", ids: members.map(m => m.id), circuitId: ex.circuitId });
      } else {
        seen.add(ex.id);
        blocks.push({ type: "single", ids: [ex.id] });
      }
    });
    return blocks;
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

    const blocks = computeBlocks(day);
    const html = blocks.map(b => {
      if (b.type === "circuit") {
        const members = b.ids.map(id => day.exercises.find(e => e.id === id));
        return renderCircuitGroup(members);
      }
      const ex = day.exercises.find(e => e.id === b.ids[0]);
      return renderExerciseCard(ex);
    }).join("");

    exerciseList.innerHTML = html;
    bindExerciseCardEvents(day);
    updateSelectionBar();
  }

  function dragHandleHtml(anchorId) {
    if (circuitSelectMode) return "";
    return `<button type="button" class="drag-handle" data-anchor-id="${anchorId}" title="Trascina per riordinare">${ICON_GRIP}</button>`;
  }

  function renderCircuitGroup(members) {
    const inner = members.map((m, i) =>
      renderExerciseCard(m, { showHandle: false }) + (i < members.length - 1
        ? `<div class="circuit-connector">${ICON_ZAP} poi</div>`
        : "")
    ).join("");
    return `
      <div class="circuit-group" data-circuit-id="${members[0].circuitId}">
        <div class="circuit-label">
          <div style="display:flex;align-items:center;gap:6px;">
            ${dragHandleHtml(members[0].id)}
            <span class="circuit-tag">Circuito</span>
          </div>
          <button class="circuit-ungroup" data-circuit-id="${members[0].circuitId}">${ICON_X} Dividi</button>
        </div>
        ${inner}
      </div>`;
  }

  function renderExerciseCard(ex, opts = {}) {
    const showHandle = opts.showHandle !== false;
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
    const handleHtml = showHandle ? dragHandleHtml(ex.id) : "";
    const angleHtml = (isAngleExercise(ex.name) && !circuitSelectMode) ? `
      <select class="angle-select" data-ex-id="${ex.id}" title="Angolo panca">
        ${ANGLE_OPTIONS.map(a => `<option value="${a}" ${(ex.angle || "0") === a ? "selected" : ""}>${a}°</option>`).join("")}
      </select>` : "";
    const slug = slugifyExerciseName(ex.name);
    const iconHtml = `
      <div class="ex-photo-wrap" data-slug="${slug}">
        <img
          class="ex-photo"
          src="images/${slug}.${IMAGE_EXTS[0]}"
          data-tryindex="0"
          alt="${escapeHtml(ex.name)}"
          onerror="window.__tryNextExImg(this)"
          onclick="window.__openExPhoto(this.src, '${escapeHtml(ex.name).replace(/'/g, "\\'")}')"
        >
        <div class="ex-icon-fallback">${groupIconFor(ex.name)}</div>
      </div>`;

    return `
      <div class="${cardClasses.join(" ")}" data-ex-id="${ex.id}">
        <div class="exercise-head">
          ${handleHtml}
          ${canSelect ? checkboxHtml : ""}
          <h3 style="flex:1;">${escapeHtml(ex.name)}</h3>
          ${angleHtml}
          ${iconHtml}
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

    exerciseList.querySelectorAll(".drag-handle").forEach(handle => {
      bindDragHandle(handle, day);
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

      const angleSelect = card.querySelector(".angle-select");
      if (angleSelect) {
        angleSelect.addEventListener("change", (e) => {
          ex.angle = e.target.value;
          saveDays();
        });
      }
    });
  }

  function updateTally(card, ex) {
    const doneCount = ex.sets.filter(s => s.reps !== "" || s.weight !== "").length;
    const marks = card.querySelectorAll(".tally .mark");
    marks.forEach((m, i) => m.classList.toggle("filled", i < doneCount));
  }

  /* ================= Drag & drop riordino ================= */
  function bindDragHandle(handleEl, day) {
    handleEl.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const anchorId = handleEl.dataset.anchorId;
      const blocks = computeBlocks(day);
      const dragPos = blocks.findIndex(b => b.ids.includes(anchorId));
      if (dragPos < 0) return;
      dnd = { day, blocks, dragPos };
      document.body.classList.add("dnd-active");
      try { handleEl.setPointerCapture(e.pointerId); } catch (err) {}
      highlightDragEl();
      document.addEventListener("pointermove", onDndMove);
      document.addEventListener("pointerup", onDndEnd);
      document.addEventListener("pointercancel", onDndEnd);
    });
  }

  function highlightDragEl() {
    if (!dnd) return;
    Array.from(exerciseList.children).forEach((el, i) => {
      el.classList.toggle("dragging-active", i === dnd.dragPos);
    });
  }

  function reorderBlocks(day, blocks, dragPos, insertPos) {
    const blockAtDrag = blocks[dragPos];
    const draggedIds = new Set(blockAtDrag.ids);
    const draggedObjs = day.exercises.filter(e => draggedIds.has(e.id));
    const rest = day.exercises.filter(e => !draggedIds.has(e.id));
    const remainingBlocks = blocks.filter((_, i) => i !== dragPos);
    const clamped = Math.max(0, Math.min(insertPos, remainingBlocks.length));
    if (clamped >= remainingBlocks.length) {
      day.exercises = [...rest, ...draggedObjs];
    } else {
      const anchorId = remainingBlocks[clamped].ids[0];
      const anchorIdx = rest.findIndex(e => e.id === anchorId);
      day.exercises = [...rest.slice(0, anchorIdx), ...draggedObjs, ...rest.slice(anchorIdx)];
    }
  }

  function onDndMove(e) {
    if (!dnd) return;
    e.preventDefault();
    const children = Array.from(exerciseList.children);
    const others = children.filter((_, i) => i !== dnd.dragPos);
    const pointerY = e.clientY;
    let insertPos = others.length;
    for (let k = 0; k < others.length; k++) {
      const r = others[k].getBoundingClientRect();
      const mid = r.top + r.height / 2;
      if (pointerY < mid) { insertPos = k; break; }
    }
    if (insertPos !== dnd.dragPos) {
      reorderBlocks(dnd.day, dnd.blocks, dnd.dragPos, insertPos);
      dnd.dragPos = insertPos;
      dnd.blocks = computeBlocks(dnd.day);
      renderExercises(dnd.day);
      highlightDragEl();
    }
  }

  function onDndEnd() {
    if (!dnd) return;
    document.removeEventListener("pointermove", onDndMove);
    document.removeEventListener("pointerup", onDndEnd);
    document.removeEventListener("pointercancel", onDndEnd);
    document.body.classList.remove("dnd-active");
    saveDays();
    renderExercises(dnd.day);
    dnd = null;
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

  document.getElementById("btn-back").addEventListener("click", () => history.back());
  document.getElementById("btn-back-stats").addEventListener("click", () => history.back());
  document.getElementById("btn-back-progress").addEventListener("click", () => history.back());
  document.getElementById("btn-back-bw").addEventListener("click", () => history.back());

  /* ================= Menu ================= */
  const modalMenu = document.getElementById("modal-menu");
  const menuList = document.getElementById("menu-list");
  const MENU_ITEMS = [
    { action: "stats", name: "Statistiche", desc: "Riepilogo generale dei tuoi allenamenti" },
    { action: "progress", name: "Progressi esercizi", desc: "Andamento dei pesi nel tempo" },
    { action: "bodyweight", name: "Peso corporeo", desc: "Tieni traccia del tuo peso" }
  ];
  menuList.innerHTML = MENU_ITEMS.map(m => `
    <div class="template-option" data-action="${m.action}">
      <div>
        <div class="t-name">${m.name}</div>
        <div class="t-desc">${m.desc}</div>
      </div>
      ${ICON_CHEV}
    </div>
  `).join("");
  menuList.querySelectorAll(".template-option").forEach(el => {
    el.addEventListener("click", () => {
      modalMenu.classList.remove("open");
      const action = el.dataset.action;
      if (action === "stats") showStats(true);
      else if (action === "progress") showProgress(null, true);
      else if (action === "bodyweight") showBodyweight(true);
    });
  });
  document.getElementById("btn-open-menu").addEventListener("click", () => modalMenu.classList.add("open"));
  modalMenu.addEventListener("click", (e) => { if (e.target === modalMenu) modalMenu.classList.remove("open"); });


  document.getElementById("btn-delete-day").addEventListener("click", () => {
    const day = getCurrentDay(); if (!day) return;
    if (!confirm(`Eliminare "${day.title || "questa giornata"}"? L'azione non è reversibile.`)) return;
    days = days.filter(d => d.id !== day.id);
    saveDays();
    history.back();
  });

  /* ================= Grafico SVG condiviso ================= */
  function buildTrendSVG(points, opts) {
    opts = opts || {};
    const width = opts.width || 320;
    const height = opts.height || 150;
    if (!points || points.length === 0) {
      return `<div class="chart-empty">Ancora nessun dato da mostrare</div>`;
    }
    if (points.length === 1) {
      return `<div class="chart-empty">Serve almeno un secondo dato per vedere l'andamento<br><span class="mono" style="color:var(--text);font-size:15px;">${points[0].value}${opts.unit || ""}</span></div>`;
    }
    const values = points.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = (max - min) || 1;
    const padX = 14, padY = 16;
    const stepX = (width - 2 * padX) / (points.length - 1);
    const coords = points.map((p, i) => ({
      x: padX + i * stepX,
      y: height - padY - ((p.value - min) / range) * (height - 2 * padY)
    }));
    const pathD = coords.map((c, i) => (i === 0 ? "M" : "L") + c.x.toFixed(1) + "," + c.y.toFixed(1)).join(" ");
    const areaD = pathD + ` L${coords[coords.length - 1].x.toFixed(1)},${height - padY} L${coords[0].x.toFixed(1)},${height - padY} Z`;
    const dots = coords.map(c => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3.5" fill="var(--accent)"/>`).join("");
    return `<svg viewBox="0 0 ${width} ${height}" class="trend-svg" preserveAspectRatio="none">
      <path d="${areaD}" fill="var(--accent)" opacity="0.14"/>
      <path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  }

  /* ================= Statistiche ================= */
  function computeStats() {
    const totalWorkouts = days.length;
    const currentMonthPrefix = todayISO().slice(0, 7);
    const thisMonthCount = days.filter(d => (d.date || "").startsWith(currentMonthPrefix)).length;
    const exerciseCounts = {};
    let totalVolume = 0;
    let totalSets = 0;
    days.forEach(day => {
      day.exercises.forEach(ex => {
        exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
        ex.sets.forEach(s => {
          const w = parseFloat(s.weight);
          const r = parseInt(s.reps, 10);
          if (s.reps !== "" || s.weight !== "") totalSets++;
          if (!isNaN(w) && !isNaN(r)) totalVolume += w * r;
        });
      });
    });
    let topExercise = null, topCount = 0;
    Object.entries(exerciseCounts).forEach(([name, count]) => {
      if (count > topCount) { topCount = count; topExercise = name; }
    });
    return { totalWorkouts, thisMonthCount, totalVolume, totalSets, topExercise, topCount };
  }

  function renderStats() {
    const s = computeStats();
    const grid = document.getElementById("stats-grid");
    if (s.totalWorkouts === 0) {
      grid.innerHTML = `<div class="stat-card wide"><div class="chart-empty" style="padding:10px 0;">Registra la tua prima giornata per vedere le statistiche.</div></div>`;
      return;
    }
    grid.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${s.totalWorkouts}</div>
        <div class="stat-label">Allenamenti totali</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${s.thisMonthCount}</div>
        <div class="stat-label">Questo mese</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${s.totalSets}</div>
        <div class="stat-label">Serie totali</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(s.totalVolume).toLocaleString("it-IT")}</div>
        <div class="stat-label">Kg totali sollevati</div>
      </div>
      <div class="stat-card wide">
        <div class="stat-value" style="font-size:19px;">${s.topExercise ? escapeHtml(s.topExercise) : "\u2013"}</div>
        <div class="stat-label">Esercizio pi\u00f9 eseguito${s.topExercise ? ` (${s.topCount} volte)` : ""}</div>
      </div>
    `;
  }

  /* ================= Progressi esercizi ================= */
  // Un esercizio è "a ripetizioni" (corpo libero) se in tutto lo storico non è mai
  // stato registrato un peso maggiore di zero: in quel caso il peso resterebbe
  // sempre 0 e non avrebbe senso mostrarlo come indicatore di progresso.
  function getExerciseMetricType(name) {
    let hasWeight = false;
    let hasReps = false;
    days.forEach(day => day.exercises.forEach(ex => {
      if (ex.name !== name) return;
      ex.sets.forEach(s => {
        const w = parseFloat(s.weight);
        const r = parseInt(s.reps, 10);
        if (!isNaN(w) && w > 0) hasWeight = true;
        if (!isNaN(r)) hasReps = true;
      });
    }));
    if (hasWeight) return "weight";
    if (hasReps) return "reps";
    return null;
  }

  function getLoggedExerciseNames() {
    const set = new Set();
    days.forEach(day => day.exercises.forEach(ex => {
      const logged = ex.sets.some(s => s.weight !== "" || s.reps !== "");
      if (logged) set.add(ex.name);
    }));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "it"));
  }

  function getExerciseProgressData(name) {
    const metric = getExerciseMetricType(name);
    const points = [];
    const sorted = [...days].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    sorted.forEach(day => {
      let best = null;
      day.exercises.forEach(ex => {
        if (ex.name !== name) return;
        ex.sets.forEach(s => {
          if (metric === "reps") {
            const r = parseInt(s.reps, 10);
            if (!isNaN(r) && (best === null || r > best)) best = r;
          } else {
            const w = parseFloat(s.weight);
            if (!isNaN(w) && (best === null || w > best)) best = w;
          }
        });
      });
      if (best !== null) points.push({ label: formatDateShort(day.date), value: best, date: day.date });
    });
    return { points, metric: metric || "weight" };
  }

  function renderProgress() {
    const content = document.getElementById("progress-content");
    if (!progressDetailExercise) {
      const names = getLoggedExerciseNames();
      let html = `<h1 style="font-size:24px;margin-bottom:14px;">Progressi esercizi</h1>`;
      if (names.length === 0) {
        html += `<div class="chart-empty" style="padding:30px 0;">Registra qualche peso in un allenamento per vedere qui i tuoi progressi.</div>`;
      } else {
        html += `<input type="text" id="progress-search-input" class="search-input" placeholder="Cerca esercizio..." style="margin-bottom:14px;">`;
        html += `<div id="progress-list"></div>`;
      }
      content.innerHTML = html;
      if (names.length > 0) {
        const listEl = document.getElementById("progress-list");
        const searchEl = document.getElementById("progress-search-input");
        function renderList(query) {
          const q = (query || "").trim().toLowerCase();
          const filtered = names.filter(n => n.toLowerCase().includes(q));
          listEl.innerHTML = filtered.map(name => {
            const { points: pts, metric } = getExerciseProgressData(name);
            const last = pts[pts.length - 1];
            const unit = metric === "reps" ? " rip." : " kg";
            return `
              <div class="progress-list-item" data-name="${escapeHtml(name)}">
                <span class="p-name">${escapeHtml(name)}</span>
                <span class="p-value">${last ? last.value + unit : ""}</span>
              </div>`;
          }).join("") || `<p class="modal-hint">Nessun esercizio trovato.</p>`;
          listEl.querySelectorAll(".progress-list-item").forEach(el => {
            el.addEventListener("click", () => showProgress(el.dataset.name, true));
          });
        }
        renderList("");
        searchEl.addEventListener("input", (e) => renderList(e.target.value));
      }
      return;
    }

    const name = progressDetailExercise;
    const { points, metric } = getExerciseProgressData(name);
    const isReps = metric === "reps";
    const unit = isReps ? " rip." : " kg";
    const maxLabel = isReps ? "Massimale (rip.)" : "Massimale (kg)";
    const lastLabel = isReps ? "Ultima volta (rip.)" : "Ultima volta (kg)";
    const maxPoint = points.reduce((best, p) => (!best || p.value > best.value) ? p : best, null);
    const lastPoint = points[points.length - 1];

    content.innerHTML = `
      <div class="progress-detail-header" id="progress-back-to-list">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Tutti gli esercizi
      </div>
      <h1 style="font-size:22px;margin-bottom:4px;">${escapeHtml(name)}</h1>
      <div class="progress-summary">
        <div class="stat-card">
          <div class="stat-value">${maxPoint ? maxPoint.value : "\u2013"}</div>
          <div class="stat-label">${maxLabel}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${lastPoint ? lastPoint.value : "\u2013"}</div>
          <div class="stat-label">${lastLabel}</div>
        </div>
      </div>
      <div class="trend-chart-wrap">${buildTrendSVG(points, { unit })}</div>
      <div id="progress-sessions"></div>
    `;
    const sessionsEl = document.getElementById("progress-sessions");
    sessionsEl.innerHTML = [...points].reverse().map(p => `
      <div class="session-row">
        <span class="s-date">${escapeHtml(p.label)}</span>
        <span class="s-value">${p.value}${unit}</span>
      </div>
    `).join("");
    document.getElementById("progress-back-to-list").addEventListener("click", () => history.back());
  }

  /* ================= Peso corporeo ================= */
  function renderBodyweight() {
    const chartWrap = document.getElementById("bw-chart-wrap");
    const sorted = [...bodyweightEntries].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const points = sorted.map(e => ({ label: formatDateShort(e.date), value: e.weight }));
    chartWrap.innerHTML = `<div class="trend-chart-wrap">${buildTrendSVG(points, { unit: " kg" })}</div>`;

    document.getElementById("bw-date-input").value = todayISO();

    const listEl = document.getElementById("bw-list");
    const displayOrder = [...bodyweightEntries].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    listEl.innerHTML = displayOrder.map(e => `
      <div class="bw-entry" data-id="${e.id}">
        <span class="bw-date">${formatDateHuman(e.date)}</span>
        <span class="bw-value">${e.weight} kg</span>
        <button class="bw-delete" data-id="${e.id}" title="Elimina">${ICON_X}</button>
      </div>
    `).join("") || `<p class="modal-hint">Nessun peso registrato ancora.</p>`;

    listEl.querySelectorAll(".bw-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        bodyweightEntries = bodyweightEntries.filter(e => e.id !== btn.dataset.id);
        saveBodyweight();
        renderBodyweight();
      });
    });
  }

  document.getElementById("btn-bw-add").addEventListener("click", () => {
    const dateVal = document.getElementById("bw-date-input").value || todayISO();
    const weightVal = parseFloat(document.getElementById("bw-weight-input").value);
    if (isNaN(weightVal) || weightVal <= 0) {
      showToast("Inserisci un peso valido");
      return;
    }
    const existing = bodyweightEntries.find(e => e.date === dateVal);
    if (existing) existing.weight = weightVal;
    else bodyweightEntries.push({ id: uid(), date: dateVal, weight: weightVal });
    saveBodyweight();
    document.getElementById("bw-weight-input").value = "";
    renderBodyweight();
    showToast("Peso registrato");
  });

  /* ================= Esportazione PDF ================= */
  document.getElementById("btn-export-pdf").addEventListener("click", async () => {
    const day = getCurrentDay();
    if (!day) return;
    try {
      const { doc, filename } = buildPdfDoc(day);

      // Su browser che supportano la scelta/creazione cartella (es. Chrome/Edge desktop),
      // propone il selettore di sistema; il browser tende a ricordare l'ultima cartella usata.
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(doc.output("blob"));
          await writable.close();
          showToast("PDF salvato");
          return;
        } catch (pickerErr) {
          if (pickerErr && pickerErr.name === "AbortError") return;
          // in caso di errore imprevisto, prosegue con il download normale sotto
        }
      }

      doc.save(filename);
      showToast("PDF scaricato");
    } catch (err) {
      console.error(err);
      showToast("Errore nell'esportazione PDF");
    }
  });

  document.getElementById("btn-share-pdf").addEventListener("click", async () => {
    const day = getCurrentDay();
    if (!day) return;
    try {
      const { doc, filename } = buildPdfDoc(day);
      const blob = doc.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: day.title || "Allenamento",
          text: `Allenamento ${formatDateHuman(day.date)}`
        }).catch(() => {});
      } else {
        doc.save(filename);
        showToast("Condivisione diretta non supportata: PDF scaricato, condividilo manualmente");
      }
    } catch (err) {
      console.error(err);
      showToast("Errore nella condivisione");
    }
  });

  function buildPdfDoc(day) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 48;
    const bottomLimit = pageH - 60;
    let y = 0;

    const INK = [20, 18, 15];
    const CREAM = [237, 232, 223];
    const ACCENT = [193, 80, 46];
    const ACCENT_TINT = [244, 224, 214];
    const GREY = [107, 100, 89];
    const ROW_ALT = [246, 242, 235];
    const HEADER_H = 92;

    function drawHeaderBand() {
      doc.setFillColor(...INK);
      doc.rect(0, 0, pageW, HEADER_H, "F");

      // piccolo bilanciere decorativo in alto a destra
      const bx = pageW - marginX - 58, by = 34;
      doc.setFillColor(...CREAM);
      doc.roundedRect(bx, by, 58, 5, 2.5, 2.5, "F");
      doc.setFillColor(...ACCENT);
      doc.roundedRect(bx - 6, by - 8, 9, 21, 2, 2, "F");
      doc.roundedRect(bx + 55, by - 8, 9, 21, 2, 2, "F");
      doc.setFillColor(...CREAM);
      doc.roundedRect(bx - 12, by - 5, 6, 15, 1.5, 1.5, "F");
      doc.roundedRect(bx + 64, by - 5, 6, 15, 1.5, 1.5, "F");

      doc.setTextColor(...CREAM);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(21);
      doc.text((day.title || "Giornata").toUpperCase(), marginX, 45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(214, 155, 133);
      doc.text(formatDateHuman(day.date), marginX, 65);
    }

    function ensureSpace(needed) {
      if (y + needed > bottomLimit) {
        doc.addPage();
        y = 40;
      }
    }

    drawHeaderBand();
    y = HEADER_H + 32;

    const colX = { badge: marginX, name: marginX + 26, num: marginX + 6, reps: marginX + 90, weight: marginX + 190 };
    const tableRight = pageW - marginX;

    const seen = new Set();
    let exNumber = 0;

    day.exercises.forEach((ex) => {
      if (seen.has(ex.id)) return;

      let group = [ex];
      if (ex.circuitId) {
        group = day.exercises.filter(e => e.circuitId === ex.circuitId);
      }
      group.forEach(g => seen.add(g.id));

      group.forEach((member, memberIdx) => {
        exNumber++;
        ensureSpace(60);

        // badge numerato
        doc.setFillColor(...ACCENT);
        doc.circle(colX.badge + 8, y - 5, 10, "F");
        doc.setTextColor(...CREAM);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(String(exNumber), colX.badge + 8, y - 1.5, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...INK);
        const displayName = member.angle && member.angle !== "0" ? `${member.name} (${member.angle}°)` : member.name;
        doc.text(displayName, colX.name, y);

        if (group.length > 1) {
          const tagW = doc.getTextWidth("CIRCUITO") + 14;
          const tagX = tableRight - tagW;
          doc.setFillColor(...ACCENT_TINT);
          doc.roundedRect(tagX, y - 12, tagW, 16, 8, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(...ACCENT);
          doc.text("CIRCUITO", tagX + 7, y - 1.5);
        }

        y += 16;

        // intestazione tabella
        doc.setFillColor(...ROW_ALT);
        doc.rect(marginX, y - 9, tableRight - marginX, 15, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...GREY);
        doc.text("SERIE", colX.num, y + 1);
        doc.text("REPS", colX.reps, y + 1);
        doc.text("KG", colX.weight, y + 1);
        y += 15;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);

        const setsWithData = member.sets.filter(s => s.reps !== "" || s.weight !== "");
        const setsToPrint = setsWithData.length ? setsWithData : member.sets;

        setsToPrint.forEach((s, i) => {
          ensureSpace(20);
          if (i % 2 === 1) {
            doc.setFillColor(250, 248, 244);
            doc.rect(marginX, y - 9, tableRight - marginX, 15, "F");
          }
          doc.setTextColor(...INK);
          doc.text(String(i + 1), colX.num, y + 1);
          doc.text(s.reps !== "" ? String(s.reps) : "\u2013", colX.reps, y + 1);
          doc.text(s.weight !== "" ? String(s.weight) + " kg" : "\u2013", colX.weight, y + 1);
          y += 15;
        });

        if (member.note && member.note.trim()) {
          y += 4;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(...GREY);
          const noteLines = doc.splitTextToSize("Nota: " + member.note.trim(), tableRight - marginX);
          noteLines.forEach(line => {
            ensureSpace(13);
            doc.text(line, marginX, y);
            y += 12;
          });
        }

        y += group.length > 1 && memberIdx < group.length - 1 ? 10 : 20;
      });
    });

    if (day.notes && day.notes.trim()) {
      ensureSpace(50);
      y += 4;
      doc.setDrawColor(...ACCENT);
      doc.setLineWidth(1.4);
      doc.line(marginX, y, marginX, y + 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text("NOTE GENERALI", marginX, y + 12);
      y += 26;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...GREY);
      const lines = doc.splitTextToSize(day.notes.trim(), tableRight - marginX);
      lines.forEach(line => {
        ensureSpace(16);
        doc.text(line, marginX, y);
        y += 15;
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text("Log Palestra", marginX, pageH - 24);
      doc.text(`${p} / ${pageCount}`, pageW - marginX, pageH - 24, { align: "right" });
    }

    const filenameSafe = (day.title || "giornata").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const filename = `${filenameSafe || "giornata"}_${day.date || todayISO()}.pdf`;
    return { doc, filename };
  }

  /* ================= Foto esercizio: fallback e lightbox ================= */
  window.__tryNextExImg = function (imgEl) {
    const wrap = imgEl.closest(".ex-photo-wrap");
    const slug = wrap ? wrap.dataset.slug : "";
    const nextIdx = parseInt(imgEl.dataset.tryindex || "0", 10) + 1;
    if (nextIdx < IMAGE_EXTS.length) {
      imgEl.dataset.tryindex = String(nextIdx);
      imgEl.src = `images/${slug}.${IMAGE_EXTS[nextIdx]}`;
    } else {
      imgEl.style.display = "none";
      if (wrap) {
        const fb = wrap.querySelector(".ex-icon-fallback");
        if (fb) fb.style.display = "flex";
      }
    }
  };

  window.__openExPhoto = function (src, name) {
    const lb = document.getElementById("photo-lightbox");
    const img = document.getElementById("photo-lightbox-img");
    const caption = document.getElementById("photo-lightbox-caption");
    if (!lb || !img) return;
    img.src = src;
    if (caption) caption.textContent = name || "";
    lb.classList.add("open");
  };

  (function initLightbox() {
    const lb = document.getElementById("photo-lightbox");
    const closeBtn = document.getElementById("photo-lightbox-close");
    if (!lb) return;
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("open"); });
    if (closeBtn) closeBtn.addEventListener("click", () => lb.classList.remove("open"));
  })();

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
