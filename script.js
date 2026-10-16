// Election Game 2024 — browser port of election_game.py (same model as the Streamlit version).

// Define states and their attributes.
// pvi: 2025 Cook PVI (2020 + 2024 elections), The Cook Political Report. Positive = Republican, negative = Democratic.
const STATES = {
  "Texas": { trade: 2, immigration: 8, partisanship: 3, abortion: 4, foreign_policy: 8, electoral_college: 40, pvi: 6 },
  "California": { trade: 4, immigration: 3, partisanship: 9, abortion: 8, foreign_policy: 2, electoral_college: 54, pvi: -12 },
  "New York": { trade: 5, immigration: 3, partisanship: 9, abortion: 8, foreign_policy: 3, electoral_college: 28, pvi: -8 },
  "New Jersey": { trade: 6, immigration: 4, partisanship: 7, abortion: 7, foreign_policy: 3, electoral_college: 14, pvi: -4 },
  "Illinois": { trade: 7, immigration: 4, partisanship: 8, abortion: 8, foreign_policy: 2, electoral_college: 19, pvi: -6 },
  "Pennsylvania": { trade: 8, immigration: 6, partisanship: 6, abortion: 6, foreign_policy: 4, electoral_college: 19, pvi: 1 },
  "Ohio": { trade: 8, immigration: 8, partisanship: 5, abortion: 4, foreign_policy: 5, electoral_college: 17, pvi: 5 },
  "Wisconsin": { trade: 8, immigration: 6, partisanship: 7, abortion: 7, foreign_policy: 4, electoral_college: 10, pvi: 0 },
  "Michigan": { trade: 8, immigration: 6, partisanship: 7, abortion: 7, foreign_policy: 3, electoral_college: 15, pvi: 0 },
  "Minnesota": { trade: 8, immigration: 4, partisanship: 8, abortion: 7, foreign_policy: 2, electoral_college: 10, pvi: -3 },
  "Missouri": { trade: 7, immigration: 8, partisanship: 3, abortion: 4, foreign_policy: 8, electoral_college: 10, pvi: 9 },
  "Kentucky": { trade: 7, immigration: 9, partisanship: 2, abortion: 3, foreign_policy: 7, electoral_college: 8, pvi: 15 },
  "West Virginia": { trade: 9, immigration: 9, partisanship: 3, abortion: 2, foreign_policy: 6, electoral_college: 4, pvi: 21 },
  "Oklahoma": { trade: 3, immigration: 9, partisanship: 2, abortion: 2, foreign_policy: 8, electoral_college: 7, pvi: 17 },
  "Tennessee": { trade: 3, immigration: 9, partisanship: 3, abortion: 2, foreign_policy: 8, electoral_college: 11, pvi: 14 },
  "Indiana": { trade: 5, immigration: 8, partisanship: 3, abortion: 4, foreign_policy: 7, electoral_college: 11, pvi: 9 },
  "Arkansas": { trade: 3, immigration: 8, partisanship: 3, abortion: 2, foreign_policy: 7, electoral_college: 6, pvi: 15 },
  "Mississippi": { trade: 3, immigration: 9, partisanship: 2, abortion: 2, foreign_policy: 7, electoral_college: 6, pvi: 11 },
  "Alabama": { trade: 4, immigration: 9, partisanship: 2, abortion: 2, foreign_policy: 7, electoral_college: 9, pvi: 15 },
  "Louisiana": { trade: 3, immigration: 8, partisanship: 3, abortion: 2, foreign_policy: 7, electoral_college: 8, pvi: 11 },
  "South Carolina": { trade: 3, immigration: 8, partisanship: 3, abortion: 3, foreign_policy: 7, electoral_college: 9, pvi: 8 },
  "Georgia": { trade: 3, immigration: 6, partisanship: 4, abortion: 4, foreign_policy: 6, electoral_college: 16, pvi: 1 },
  "Florida": { trade: 4, immigration: 6, partisanship: 5, abortion: 4, foreign_policy: 6, electoral_college: 30, pvi: 5 },
  "North Carolina": { trade: 3, immigration: 7, partisanship: 4, abortion: 4, foreign_policy: 7, electoral_college: 16, pvi: 1 },
  "Virginia": { trade: 3, immigration: 4, partisanship: 6, abortion: 7, foreign_policy: 6, electoral_college: 13, pvi: -3 },
  "South Dakota": { trade: 2, immigration: 7, partisanship: 2, abortion: 5, foreign_policy: 6, electoral_college: 3, pvi: 15 },
  "North Dakota": { trade: 2, immigration: 7, partisanship: 2, abortion: 5, foreign_policy: 6, electoral_college: 3, pvi: 18 },
  "Kansas": { trade: 2, immigration: 6, partisanship: 2, abortion: 5, foreign_policy: 6, electoral_college: 6, pvi: 8 },
  "Nebraska": { trade: 2, immigration: 6, partisanship: 2, abortion: 5, foreign_policy: 6, electoral_college: 5, pvi: 10 },
  "Wyoming": { trade: 3, immigration: 7, partisanship: 1, abortion: 2, foreign_policy: 7, electoral_college: 3, pvi: 23 },
  "Idaho": { trade: 3, immigration: 7, partisanship: 1, abortion: 2, foreign_policy: 7, electoral_college: 4, pvi: 18 },
  "Montana": { trade: 4, immigration: 6, partisanship: 2, abortion: 3, foreign_policy: 6, electoral_college: 4, pvi: 10 },
  "Utah": { trade: 2, immigration: 5, partisanship: 1, abortion: 3, foreign_policy: 8, electoral_college: 6, pvi: 11 },
  "Arizona": { trade: 2, immigration: 6, partisanship: 3, abortion: 5, foreign_policy: 6, electoral_college: 11, pvi: 2 },
  "Colorado": { trade: 2, immigration: 3, partisanship: 7, abortion: 8, foreign_policy: 3, electoral_college: 10, pvi: -6 },
  "New Mexico": { trade: 3, immigration: 3, partisanship: 7, abortion: 7, foreign_policy: 3, electoral_college: 5, pvi: -4 },
  "Nevada": { trade: 4, immigration: 6, partisanship: 6, abortion: 8, foreign_policy: 4, electoral_college: 6, pvi: 1 },
  "Washington": { trade: 3, immigration: 3, partisanship: 8, abortion: 9, foreign_policy: 2, electoral_college: 12, pvi: -10 },
  "Alaska": { trade: 4, immigration: 6, partisanship: 2, abortion: 4, foreign_policy: 5, electoral_college: 3, pvi: 6 },
  "Hawaii": { trade: 3, immigration: 2, partisanship: 8, abortion: 8, foreign_policy: 2, electoral_college: 4, pvi: -13 },
  "Oregon": { trade: 3, immigration: 3, partisanship: 7, abortion: 9, foreign_policy: 2, electoral_college: 8, pvi: -8 },
  "Washington DC": { trade: 2, immigration: 1, partisanship: 10, abortion: 10, foreign_policy: 1, electoral_college: 3, pvi: -44 },
  "Massachusetts": { trade: 3, immigration: 1, partisanship: 10, abortion: 9, foreign_policy: 1, electoral_college: 11, pvi: -14 },
  "Rhode Island": { trade: 2, immigration: 2, partisanship: 9, abortion: 9, foreign_policy: 2, electoral_college: 4, pvi: -8 },
  "Connecticut": { trade: 2, immigration: 2, partisanship: 9, abortion: 9, foreign_policy: 2, electoral_college: 7, pvi: -8 },
  "Maryland": { trade: 3, immigration: 2, partisanship: 8, abortion: 9, foreign_policy: 2, electoral_college: 10, pvi: -15 },
  "Delaware": { trade: 3, immigration: 2, partisanship: 9, abortion: 9, foreign_policy: 2, electoral_college: 3, pvi: -8 },
  "Vermont": { trade: 4, immigration: 2, partisanship: 8, abortion: 10, foreign_policy: 1, electoral_college: 3, pvi: -17 },
  "New Hampshire": { trade: 2, immigration: 4, partisanship: 5, abortion: 7, foreign_policy: 3, electoral_college: 4, pvi: -2 },
  "Maine": { trade: 2, immigration: 3, partisanship: 7, abortion: 8, foreign_policy: 3, electoral_college: 4, pvi: -4 },
  "Iowa": { trade: 8, immigration: 6, partisanship: 4, abortion: 6, foreign_policy: 4, electoral_college: 6, pvi: 6 },
};

const deepCopy = (o) => JSON.parse(JSON.stringify(o));
// Baseline for the selected preset: the margin model measures state-setting edits against this.
// (Replaced whenever a preset is applied; STATES itself is the "current day" data and never changes.)
let DEFAULT_STATES = deepCopy(STATES);
// Working copy that the State Settings panel edits.
let currentStates = deepCopy(STATES);

// ---------- Election presets ----------
// ELECTIONS comes from elections.js: real state margins and electoral votes for 1976-2024.
const ELECTION_DATA = typeof ELECTIONS !== "undefined" ? ELECTIONS : (typeof require !== "undefined" ? require("./elections.js") : {});
const ELECTION_KEYS = Object.keys(ELECTION_DATA).sort((a, b) => b - a);   // newest first
let currentPreset = "current";

// Returns the states, environment and candidate names for a preset.
// For a real election each state's PVI is (state margin - national environment) / 2, so with typical
// candidates and equal approval every state lands exactly on its real margin (see the margin model below).
function presetData(key) {
  if (key === "current" || !ELECTION_DATA[key]) {
    return { states: deepCopy(STATES), env: 0, r: "", d: "", note: "Current day: every state starts at its 2025 Cook PVI and 2024 electoral votes." };
  }
  const e = ELECTION_DATA[key];
  const states = deepCopy(STATES);               // issue stances are the same in every preset
  for (const name of Object.keys(states)) {
    const [ev, margin] = e.states[name];
    states[name].electoral_college = ev;
    states[name].pvi = (margin - e.environment) / 2;
  }
  let note = `${e.year}: ${e.r} (R) vs. ${e.d} (D). Every state starts at its real ${e.year} result and electoral votes, ` +
    `counted winner-take-all by state (Maine and Nebraska aren't split). Candidates start at a typical profile with equal approval, ` +
    `so running it as-is reproduces the real result. Move the sliders to ask "what if".`;
  if (e.thirdParty.pct >= 5) {
    note += ` A third-party candidate (${e.thirdParty.name}, ${e.thirdParty.pct}%) also ran; margins are Republican % minus Democratic % of the total vote.`;
  }
  return { states, env: e.environment, r: e.r, d: e.d, note };
}

// ---------- Margin model ----------
// margin (R minus D, in percentage points)
//   = national environment + national swing from approval
//   + 2 x state PVI
//   + POINTS_TO_MARGIN x (how much better Candidate 1 fits the state than Candidate 2,
//                         compared with a typical Republican vs. a typical Democrat,
//                         including a HOME_STATE_BONUS in each candidate's home state)
// With both candidates at the "typical" profile and equal approval, every state lands on its PVI.
const TYPICAL_R = { trade: 6, immigration: 8, partisanship: 3, abortion: 3, foreign_policy: 7 };
const TYPICAL_D = { trade: 4, immigration: 4, partisanship: 8, abortion: 9, foreign_policy: 4 };
const HOME_STATE_BONUS = 4;       // issue-score points a candidate gains in their home state (same as the original console game)
const POINTS_TO_MARGIN = 0.5;     // margin points per issue-score point
const PVI_TO_MARGIN = 2;          // margin points per PVI point (PVI is a vote-share lean, margin lean is double)
const APPROVAL_TO_MARGIN = 0.25;  // national margin points per point of approval gap (Candidate 1 minus Candidate 2)

const STATE_FIELDS = [
  { key: "trade", label: "Trade (1: free market, 10: protectionist)" },
  { key: "immigration", label: "Immigration (1: open borders, 10: strict control)" },
  { key: "partisanship", label: "Partisanship (1: very Republican, 10: very Democratic)" },
  { key: "abortion", label: "Abortion (1: pro-life, 10: pro-choice)" },
  { key: "foreign_policy", label: "Foreign policy (1: dovish, 10: hawkish)" },
];
const PVI_MIN = -50, PVI_MAX = 30;

// Round half up to 3 decimals, so razor-thin margins (Florida 2000 was 0.009 points) keep their winner.
const roundM = (x) => Math.floor(x * 1000 + 0.5) / 1000;
const fmtNum = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const fmtPvi = (n) => (n === 0 ? "EVEN" : (n > 0 ? "R+" : "D+") + fmtNum(Math.abs(n)));
const fmtMargin = (m) => {
  if (m === 0) return "EVEN";
  const digits = Math.abs(m) < 0.1 ? 2 : 1;
  const shown = Math.floor(Math.abs(m) * 10 ** digits + 0.5) / 10 ** digits;   // round half up (same as the Streamlit version)
  return (m > 0 ? "R+" : "D+") + shown.toFixed(digits);
};

function issueScore(attrs, c) {
  let s = 0;
  s += 10 - Math.abs(attrs.trade - c.trade);
  s += 10 - Math.abs(attrs.immigration - c.immigration);
  s += 5 - Math.abs(attrs.partisanship - c.partisanship);
  s += 10 - Math.abs(attrs.abortion - c.abortion);
  s += 10 - Math.abs(attrs.foreign_policy - c.foreign_policy);
  return s;
}

const approvalSwing = (a1, a2) => APPROVAL_TO_MARGIN * (a1 - a2);

// Signed margin in points: positive = Candidate 1 (Republican), negative = Candidate 2 (Democrat).
function stateMargin(attrs, stateName, c1, c2, nationalSwing) {
  const base = DEFAULT_STATES[stateName];
  const reference = issueScore(base, TYPICAL_R) - issueScore(base, TYPICAL_D);
  let fit = issueScore(attrs, c1) - issueScore(attrs, c2);
  if (c1.home && c1.home === stateName) fit += HOME_STATE_BONUS;
  if (c2.home && c2.home === stateName) fit -= HOME_STATE_BONUS;
  const m = nationalSwing + PVI_TO_MARGIN * attrs.pvi + POINTS_TO_MARGIN * (fit - reference);
  return roundM(Math.max(-100, Math.min(100, m)));
}

// rng, stateData and environment are injectable for testing; they default to Math.random,
// the edited states and an EVEN national environment.
function simulate(c1, c2, rng = Math.random, stateData = currentStates, environment = 0) {
  const approval = approvalSwing(c1.approval, c2.approval);
  const swing = environment + approval;
  let votes1 = 0, votes2 = 0;
  const results = [];
  for (const [state, attrs] of Object.entries(stateData)) {
    const signed = stateMargin(attrs, state, c1, c2, swing);
    const ev = attrs.electoral_college;
    let winner, tie = false;
    if (signed > 0) winner = 1;
    else if (signed < 0) winner = 2;
    else { tie = true; winner = rng() < 0.5 ? 1 : 2; }
    if (winner === 1) votes1 += ev; else votes2 += ev;
    results.push({ state, ev, signed, margin: Math.abs(signed), winner, tie });
  }
  // stable sort by margin, take 3 closest
  const closest = results.slice().sort((a, b) => a.margin - b.margin).slice(0, 3);
  return { results, closest, votes1, votes2, swing, environment, approval };
}

// ---------- UI ----------
// Candidate sliders: same prompts / ranges as the Streamlit version. Defaults are the "typical" profiles.
function sliderDefs(partMin, partMax, partPrompt, typical) {
  return [
    { key: "trade", prompt: "Stance on trade? (1: free market, 10: protectionist)", min: 1, max: 10, def: typical.trade },
    { key: "immigration", prompt: "Stance on immigration? (1: open borders, 10: strict control)", min: 1, max: 10, def: typical.immigration },
    { key: "partisanship", prompt: partPrompt, min: partMin, max: partMax, def: typical.partisanship },
    { key: "abortion", prompt: "Stance on abortion? (1: pro-life, 10: pro-choice)", min: 1, max: 10, def: typical.abortion },
    { key: "foreign_policy", prompt: "Foreign policy? (1: dovish, 10: hawkish)", min: 1, max: 10, def: typical.foreign_policy },
    { key: "approval", prompt: "Approval rating? (0-100%, 50 is neutral)", min: 0, max: 100, def: 50 },
  ];
}
const CAND1_SLIDERS = sliderDefs(1, 5, "Partisanship? (1: extreme Republican, 5: moderate)", TYPICAL_R);
const CAND2_SLIDERS = sliderDefs(6, 10, "Partisanship? (10: extreme Democrat, 6: moderate)", TYPICAL_D);

const CHART_COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];
const $ = (id) => document.getElementById(id);

function buildCard(el, title, nameLabel, defs, prefix, defaultName = "") {
  el.innerHTML = `<h3>${title}</h3>
    <div class="field"><label for="${prefix}-name">${nameLabel}</label>
      <input type="text" id="${prefix}-name" autocomplete="off" /></div>`;
  el.querySelector(`#${prefix}-name`).value = defaultName;
  for (const d of defs) {
    const id = `${prefix}-${d.key}`;
    const f = document.createElement("div");
    f.className = "field";
    f.innerHTML = `<label for="${id}"><span>${d.prompt}</span><span class="val" id="${id}-val">${d.def}</span></label>
      <input type="range" id="${id}" min="${d.min}" max="${d.max}" step="1" value="${d.def}" />`;
    el.appendChild(f);
    f.querySelector("input").addEventListener("input", (e) => { $(id + "-val").textContent = e.target.value; });
  }
  // Home state (None = no home state): gives the candidate a bonus in that state
  const hf = document.createElement("div");
  hf.className = "field";
  hf.innerHTML = `<label for="${prefix}-home">Home state</label>
    <select id="${prefix}-home"><option value="">None</option>${Object.keys(STATES).map((s) => `<option>${s}</option>`).join("")}</select>`;
  el.appendChild(hf);
}

function readCandidate(prefix, defs, fallbackName) {
  const c = { name: $(`${prefix}-name`).value.trim() || fallbackName };
  for (const d of defs) c[d.key] = parseInt($(`${prefix}-${d.key}`).value, 10);
  c.home = $(`${prefix}-home`).value;   // "" = none
  return c;
}

// ----- National environment (slider value is in half points: -40..40 -> D+20..R+20) -----
const envValue = () => parseInt($("env").value, 10) / 2;
const updateEnvLabel = () => { $("env-val").textContent = fmtMargin(envValue()); };

// ----- State settings panel -----
const isEdited = (name) => ["pvi", ...STATE_FIELDS.map((f) => f.key)].some((k) => currentStates[name][k] !== DEFAULT_STATES[name][k]);

function refreshStateSelect() {
  const sel = $("state-select");
  const keep = sel.value;
  sel.innerHTML = "";
  for (const name of Object.keys(DEFAULT_STATES)) {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = isEdited(name) ? `${name} (edited)` : name;
    sel.appendChild(o);
  }
  if (keep) sel.value = keep;
  const edited = Object.keys(DEFAULT_STATES).filter(isEdited);
  $("edited-note").textContent = edited.length ? "Edited states: " + edited.join(", ") : "";
}

function renderStateSliders() {
  const name = $("state-select").value;
  const cur = currentStates[name], base = DEFAULT_STATES[name];
  const box = $("state-sliders");
  box.innerHTML = "";

  const rows = [{ key: "pvi", label: "PVI (partisan lean vs. the nation)", min: PVI_MIN, max: PVI_MAX, step: 0.1, fmt: fmtPvi }]
    .concat(STATE_FIELDS.map((f) => ({ key: f.key, label: f.label, min: 1, max: 10, step: 1, fmt: String })));

  for (const r of rows) {
    const id = `state-${r.key}`;
    const f = document.createElement("div");
    f.className = "field";
    f.innerHTML = `<label for="${id}"><span>${r.label} <small>(default ${r.fmt(base[r.key])})</small></span>
        <span class="val wide" id="${id}-val">${r.fmt(cur[r.key])}</span></label>
      <input type="range" id="${id}" min="${r.min}" max="${r.max}" step="${r.step}" value="${cur[r.key]}" />`;
    box.appendChild(f);
    f.querySelector("input").addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      currentStates[name][r.key] = v;
      $(id + "-val").textContent = r.fmt(v);
      refreshStateSelect();
    });
  }
}

function resetStates(all) {
  if (all) currentStates = deepCopy(DEFAULT_STATES);
  else { const n = $("state-select").value; currentStates[n] = deepCopy(DEFAULT_STATES[n]); }
  refreshStateSelect();
  renderStateSliders();
}

// ----- Results -----
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
const esc = (s) => s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

function render(c1, c2, sim) {
  const n1 = esc(c1.name), n2 = esc(c2.name);
  const nameOf = (w) => (w === 1 ? n1 : n2);

  $("approval-note").textContent =
    `National environment: ${fmtMargin(sim.environment)} | Swing from approval: ${fmtMargin(roundM(sim.approval))} | Total national swing: ${fmtMargin(roundM(sim.swing))}`;

  // Per-state results with margins
  const list = $("state-list"); list.innerHTML = "";
  for (const r of sim.results) {
    const cls = r.tie ? "" : r.winner === 1 ? "r" : "b";
    const icon = r.tie ? "🤝" : r.winner === 1 ? "✅" : "🔵";
    const text = r.tie
      ? `${icon} <b>${r.state}</b>: Tie, random winner is ${nameOf(r.winner)} (${r.ev} votes)`
      : `${icon} <b>${r.state}</b>: ${nameOf(r.winner)} wins (${r.ev} votes)`;
    list.appendChild(el("li", cls, `<span class="txt">${text}</span><span class="margin">Margin: ${fmtMargin(r.signed)}</span>`));
  }

  // 3 closest
  const cl = $("closest-list"); cl.innerHTML = "";
  for (const r of sim.closest) {
    cl.appendChild(el("li", r.winner === 1 ? "r" : "b",
      `<span class="txt">State: <b>${r.state}</b> | Margin: ${fmtMargin(r.signed)} | Winner: ${nameOf(r.winner)}</span>`));
  }

  // Bar chart
  const chart = $("chart"); chart.innerHTML = "";
  if (sim.closest.length) {
    const max = Math.max(1, ...sim.closest.map((r) => r.margin));
    chart.appendChild(el("h3", "", "Top 3 Closest States by Margin (points)"));
    const bars = el("div", "bars"), labels = el("div", "bar-labels"), legend = el("div", "legend");
    sim.closest.forEach((r, i) => {
      const col = el("div", "bar-col", `<div class="bar-val">${fmtMargin(r.signed)}</div>`);
      const bar = el("div", "bar"); bar.style.background = CHART_COLORS[i];
      bar.style.height = `${(r.margin / max) * 85}%`;
      col.appendChild(bar); bars.appendChild(col);
      labels.appendChild(el("span", "", r.state));
      legend.appendChild(el("span", "", `<i style="background:${CHART_COLORS[i]}"></i>${r.state}`));
    });
    chart.append(bars, labels, legend);
  } else {
    chart.textContent = "No close states to display.";
  }

  // Final results
  $("final-1").innerHTML = `🟥 ${n1}: ${sim.votes1} Electoral Votes`;
  $("final-2").innerHTML = `🟦 ${n2}: ${sim.votes2} Electoral Votes`;
  const v = $("verdict");
  if (sim.votes1 > sim.votes2) { v.className = "verdict win"; v.innerHTML = `🎉 ${n1} wins the election!`; }
  else if (sim.votes2 > sim.votes1) { v.className = "verdict win"; v.innerHTML = `🎉 ${n2} wins the election!`; }
  else { v.className = "verdict tie"; v.textContent = "It's a tie! No clear winner."; }

  $("results").hidden = false;
}

// Load a preset: states, environment and candidate names; candidates go back to the typical profile.
function applyPreset(key) {
  currentPreset = key;
  const p = presetData(key);
  DEFAULT_STATES = deepCopy(p.states);
  currentStates = deepCopy(p.states);
  buildCard($("cand1-card"), "Candidate 1 (Republican)", "Enter the name of Candidate 1 (Republican):", CAND1_SLIDERS, "c1", p.r);
  buildCard($("cand2-card"), "Candidate 2 (Democrat)", "Enter the name of Candidate 2 (Democrat):", CAND2_SLIDERS, "c2", p.d);
  $("env").value = p.env * 2;      // slider is in half points
  updateEnvLabel();
  $("preset-note").textContent = p.note;
  refreshStateSelect();
  renderStateSliders();
  $("results").hidden = true;
}

function init() {
  const sel = $("preset-select");
  sel.innerHTML = `<option value="current">Current day (2025 Cook PVI)</option>` +
    ELECTION_KEYS.map((y) => `<option value="${y}">${y}: ${ELECTION_DATA[y].r} (R) vs. ${ELECTION_DATA[y].d} (D)</option>`).join("");
  sel.addEventListener("change", () => { applyPreset(sel.value); window.scrollTo({ top: 0 }); });
  const reset = () => { applyPreset(currentPreset); window.scrollTo({ top: 0 }); };
  applyPreset("current");
  $("env").addEventListener("input", updateEnvLabel);
  $("state-select").addEventListener("change", renderStateSliders);
  $("state-reset").addEventListener("click", () => resetStates(false));
  $("state-reset-all").addEventListener("click", () => resetStates(true));
  $("restart").addEventListener("click", reset);
  $("run").addEventListener("click", () => {
    const c1 = readCandidate("c1", CAND1_SLIDERS, "Candidate 1");
    const c2 = readCandidate("c2", CAND2_SLIDERS, "Candidate 2");
    render(c1, c2, simulate(c1, c2, Math.random, currentStates, envValue()));
    $("results").scrollIntoView({ behavior: "smooth" });
  });
}

if (typeof document !== "undefined") init();
if (typeof module !== "undefined") module.exports = { STATES, DEFAULT_STATES, simulate, stateMargin, approvalSwing, presetData, ELECTION_KEYS, TYPICAL_R, TYPICAL_D };
