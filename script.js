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

// Index of the largest value (first one wins a tie).
const argmax = (a) => a.reduce((best, x, i) => (x > a[best] ? i : best), 0);

// Candidates of the "current day" mode: no real third party, one hypothetical slot is offered in the UI.
const currentCands = () => ({
  r: { name: "", party: "Republican", abbr: "R" }, d: { name: "", party: "Democrat", abbr: "D" }, t1: null, t2: null,
});

// Returns the states, environment, candidates and note for a preset.
// Each state keeps the real vote shares of up to four candidates (R, D and two third parties). The two-party margin
// M2 = 100 x (R - D) / (R + D) is what the model moves; a state's PVI is (its M2 - the national M2) / 2, so with typical
// candidates and the real third-party shares every state lands exactly on its real result.
function presetData(key) {
  if (key === "current" || !ELECTION_DATA[key]) {
    return { states: deepCopy(STATES), env: 0, cands: currentCands(), nat: [0, 0],
      note: "Current day: every state starts at its 2025 Cook PVI and 2024 electoral votes. You can add a hypothetical third-party candidate below." };
  }
  const e = ELECTION_DATA[key];
  const states = {};                              // only states that took part; issue stances are the same in every preset
  const fixedNames = [], splitNames = [];
  for (const name of Object.keys(STATES)) {
    const rec = e.states[name];
    if (!rec) continue;                           // didn't exist yet, or didn't take part (e.g. the Confederacy in 1864)
    const s = deepCopy(STATES[name]);
    s.electoral_college = rec[0];
    if (rec[1] === null) {                        // electors chosen by the state legislature: no popular vote
      s.fixed = true;
      s.fixed_slot = rec[2];                      // 0 R, 1 D, 2 T1, 3 T2, 4 others
      s.pvi = 0;
      fixedNames.push(name);
    } else {
      const [, r, d, t1 = 0, t2 = 0, evs] = rec;
      s.sh = { r, d, t1, t2 };
      s.o = Math.max(0, 100 - r - d - t1 - t2);
      s.pvi = (100 * (r - d) / (r + d) - e.environment) / 2;
      if (evs) {                                  // real electors were split between candidates
        s.evs = evs;
        s.base_winner = argmax([r, d, t1, t2]);
        splitNames.push(name);
      }
    }
    states[name] = s;
  }
  const c = e.cand;
  const names = [`${c.r.name} (${c.r.abbr})`, `${c.d.name} (${c.d.abbr})`];
  if (c.t1) names.push(c.t1.name);
  if (c.t2) names.push(c.t2.name);
  let note = `${e.year}: ${names.join(" vs. ")}. Every state starts at its real ${e.year} result and electoral votes, ` +
    (e.year >= 1976 ? `counted winner-take-all by state (Maine and Nebraska aren't split). ` : `counted by state. `) +
    `Candidates start at a typical profile with equal approval, so running it as-is reproduces the real result. Move the sliders to ask "what if".`;
  if (c.t1) {
    note += ` Third parties are modeled by vote share: ${[c.t1, c.t2].filter(Boolean).map((t, i) => `${t.name} (${t.party}) took ${e.nat[i].toFixed(1)}% nationally`).join(", ")}. ` +
      `Change a third-party candidate's national vote share below (0 drops them out and their votes go to the major candidates in proportion). A state goes to whoever has the most votes, so a third party can carry states.`;
  } else {
    note += ` You can add a hypothetical third-party candidate below.`;
  }
  if (e.absent && e.absent.length) {
    note += ` ${e.absent.length} jurisdictions that weren't states yet, or didn't take part, are left out.`;
  }
  if (fixedNames.length) note += ` ${fixedNames.join(" and ")} had no popular vote (electors chosen by the state legislature), so ${fixedNames.length > 1 ? "their" : "its"} electoral votes are fixed.`;
  if (splitNames.length) note += ` Real electors were split in ${splitNames.join(", ")}; the split is kept until you flip that state.`;
  if (e.note) note += ` ${e.note}`;
  return { states, env: e.environment, cands: c, nat: e.nat, note };
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
const PVI_MIN = -80, PVI_MAX = 60;   // wide enough for the 1920s Deep South and 1964 Mississippi

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

// The presidential tab's party labels follow the loaded preset (Whig, National Republican, ...).
let PRES = { r: { abbr: "R" }, d: { abbr: "D" } };
const roundShown = (m) => {
  const digits = Math.abs(m) < 0.1 ? 2 : 1;
  return { digits, shown: Math.floor(Math.abs(m) * 10 ** digits + 0.5) / 10 ** digits };   // round half up (same as the Streamlit version)
};
const fmtPviP = (n) => (n === 0 ? "EVEN" : (n > 0 ? PRES.r.abbr : PRES.d.abbr) + "+" + fmtNum(Math.abs(n)));
const fmtMarginP = (m) => { if (m === 0) return "EVEN"; const { digits, shown } = roundShown(m); return (m > 0 ? PRES.r.abbr : PRES.d.abbr) + "+" + shown.toFixed(digits); };
const fmtLead = (abbr, lead) => { if (lead === 0) return "EVEN"; const { digits, shown } = roundShown(lead); return abbr + "+" + shown.toFixed(digits); };

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

// rng, stateData, environment and thirds are injectable for testing; they default to Math.random, the edited states,
// an EVEN national environment and the real third-party shares.
// thirds: [{ share, actual, toR }, ...] = the national vote share asked for, the real one, and (optional) the fraction of
// that candidate's voters who would pick the Republican over the Democrat (0..1; omitted = in proportion to each state's
// major-party vote). With real data the state shares are scaled by share / actual; with no real data (actual 0) the share
// is spread evenly over every state. Votes a third party loses go to R and D by toR, and votes it gains come from them the same way.
// stateMargin() gives the two-party margin M2 (R - D, points of the two-party vote); the major candidates split whatever
// the third parties and others leave, and the state goes to whoever has the most votes.
function simulate(c1, c2, rng = Math.random, stateData = currentStates, environment = 0, thirds = null) {
  const approval = approvalSwing(c1.approval, c2.approval);
  const swing = environment + approval;
  const votes = [0, 0, 0, 0, 0];                  // electors per slot: R, D, T1, T2, others
  const results = [];
  for (const [state, attrs] of Object.entries(stateData)) {
    const ev = attrs.electoral_college;
    if (attrs.fixed) {                            // electors chosen by the state legislature: nothing to simulate
      votes[attrs.fixed_slot] += ev;
      results.push({ state, ev, signed: null, margin: null, lead: null, winner: attrs.fixed_slot, tie: false, fixed: true, split: null, shares: null });
      continue;
    }
    const m2 = stateMargin(attrs, state, c1, c2, swing);
    const base = attrs.sh ? [attrs.sh.t1, attrs.sh.t2] : [0, 0];
    const t = [0, 1].map((i) => {
      const th = thirds && thirds[i];
      if (!th) return base[i];
      return th.actual > 0 ? base[i] * (th.share / th.actual) : th.share;
    });
    const o = attrs.o || 0;
    // Scaling a third party up can't squeeze the major candidates below 1% (or below what they really had, e.g. Lincoln
    // wasn't on the ballot in Texas in 1860), so the real shares are always reproduced exactly.
    const basePool = 100 - o - base[0] - base[1];
    const maxT = Math.max(0, 100 - o - Math.min(1, basePool));
    const tsum = t[0] + t[1];
    if (tsum > maxT) { t[0] *= maxT / tsum; t[1] *= maxT / tsum; }
    // The major candidates' shares at the real third-party vote, then adjusted for any change in the third-party shares.
    const r0 = basePool * (50 + m2 / 2) / 100;
    let rS = r0, dS = basePool - r0;
    for (let i = 0; i < 2; i++) {
      const freed = base[i] - t[i];                // positive: the third party lost votes; negative: it gained them
      if (freed === 0) continue;
      const th = thirds && thirds[i];
      const toR = th && th.toR !== undefined && th.toR !== null ? th.toR : (basePool > 0 ? r0 / basePool : 0.5);
      rS += freed * toR;
      dS += freed * (1 - toR);
    }
    if (rS < 0) { dS += rS; rS = 0; }              // a third party can't take more votes from a candidate than they have
    if (dS < 0) { rS += dS; dS = 0; }
    const shares = [rS, dS, t[0], t[1]];
    const order = [0, 1, 2, 3].sort((a, b) => shares[b] - shares[a] || a - b);
    const lead = roundM(shares[order[0]] - shares[order[1]]);
    let winner = order[0], tie = false;
    if (lead === 0) { tie = true; winner = rng() < 0.5 ? order[0] : order[1]; }
    // Real split electors are kept while the state's winner is unchanged; a flipped state is winner-take-all.
    const keepSplit = attrs.evs && winner === attrs.base_winner;
    if (keepSplit) attrs.evs.forEach((n, i) => { votes[i] += n; });
    else votes[winner] += ev;
    results.push({ state, ev, signed: m2, margin: lead, lead, winner, tie, fixed: false, split: keepSplit ? attrs.evs : null, shares });
  }
  // stable sort by lead, take 3 closest (legislature-chosen states have no margin)
  const closest = results.filter((r) => !r.fixed).sort((a, b) => a.lead - b.lead).slice(0, 3);
  return { results, closest, votes, votes1: votes[0], votes2: votes[1], total: votes.reduce((a, b) => a + b, 0), swing, environment, approval };
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
    <select id="${prefix}-home"><option value="">None</option>${Object.keys(DEFAULT_STATES).filter((s) => !DEFAULT_STATES[s].fixed).map((s) => `<option>${s}</option>`).join("")}</select>`;
  el.appendChild(hf);
}

// Third-party cards: a name and a national vote share. The share only counts as changed once the person moves the
// slider, so an untouched card uses the exact real share (the slider can't hold values like 18.878).
function buildThirdCards(p) {
  const box = $("third-cards");
  box.innerHTML = "";
  [["t1", p.cands.t1, p.nat[0]], ["t2", p.cands.t2, p.nat[1]]].forEach(([k, real, actual]) => {
    if (!real && k === "t2") return;
    const cand = real || { name: "", party: "Independent", abbr: "Ind" };
    const card = el("article", `card ${k}`);
    card.innerHTML = `<h3>${real ? "Third-party candidate" : "Third-party candidate (hypothetical)"}: ${esc(cand.party)}</h3>
      <div class="field"><label for="${k}-name">${real ? "Name" : "Name (optional)"}</label>
        <input type="text" id="${k}-name" autocomplete="off" /></div>
      <div class="field"><label for="${k}-share"><span>National vote share (%)${real ? ` (actual: ${actual.toFixed(1)}%)` : " (0 = not running)"}</span>
        <span class="val wide" id="${k}-share-val"></span></label>
        <input type="range" id="${k}-share" min="0" max="45" step="0.1" /></div>
      <div class="field"><label for="${k}-flow"><span>If their voters had to pick a major party: % who pick the Republican</span>
        <span class="val wide" id="${k}-flow-val">Proportional</span></label>
        <input type="range" id="${k}-flow" min="0" max="100" step="1" value="50" /></div>
      <p class="note">${real
        ? "Move the slider to scale this candidate's vote in every state. At 0 they drop out and their votes go to the Republican and Democrat in proportion."
        : "Gives a third-party candidate this share of the vote in every state, taken from the Republican and Democrat in proportion."}</p>`;
    box.appendChild(card);
    card.querySelector(`#${k}-name`).value = real ? real.name : "";
    const slider = card.querySelector(`#${k}-share`), val = card.querySelector(`#${k}-share-val`);
    slider.value = actual; val.textContent = actual.toFixed(1);
    slider.dataset.actual = actual; slider.dataset.touched = "0"; slider.dataset.abbr = cand.abbr;
    slider.addEventListener("input", () => { slider.dataset.touched = "1"; val.textContent = parseFloat(slider.value).toFixed(1); });
    const flow = card.querySelector(`#${k}-flow`), flowVal = card.querySelector(`#${k}-flow-val`);
    flow.dataset.touched = "0";
    flow.addEventListener("input", () => { flow.dataset.touched = "1"; flowVal.textContent = `${flow.value}% R / ${100 - flow.value}% D`; });
  });
}

function readThird(k, p) {
  const slider = $(`${k}-share`);
  if (!slider) return { share: 0, actual: 0, name: "", abbr: "", present: false };
  const actual = parseFloat(slider.dataset.actual);
  const share = slider.dataset.touched === "1" ? parseFloat(slider.value) : actual;
  const flow = $(`${k}-flow`);
  const toR = flow && flow.dataset.touched === "1" ? parseFloat(flow.value) / 100 : null;   // null = in proportion
  const real = p.cands[k];
  return { share, actual, toR, name: $(`${k}-name`).value.trim() || (real ? real.name : "Third-party candidate"), abbr: real ? real.abbr : "Ind", present: true };
}

function readCandidate(prefix, defs, fallbackName) {
  const c = { name: $(`${prefix}-name`).value.trim() || fallbackName };
  for (const d of defs) c[d.key] = parseInt($(`${prefix}-${d.key}`).value, 10);
  c.home = $(`${prefix}-home`).value;   // "" = none
  return c;
}

// ----- National environment (slider value is in half points: -70..70 -> D+35..R+35) -----
const envValue = () => parseInt($("env").value, 10) / 2;
const updateEnvLabel = () => { $("env-val").textContent = fmtMarginP(envValue()); };

// ----- State settings panel -----
const editableNames = () => Object.keys(DEFAULT_STATES).filter((n) => !DEFAULT_STATES[n].fixed);
const isEdited = (name) => ["pvi", ...STATE_FIELDS.map((f) => f.key)].some((k) => currentStates[name][k] !== DEFAULT_STATES[name][k]);

function refreshStateSelect() {
  const sel = $("state-select");
  const keep = sel.value;
  sel.innerHTML = "";
  for (const name of editableNames()) {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = isEdited(name) ? `${name} (edited)` : name;
    sel.appendChild(o);
  }
  if (keep && DEFAULT_STATES[keep] && !DEFAULT_STATES[keep].fixed) sel.value = keep;
  const edited = editableNames().filter(isEdited);
  $("edited-note").textContent = edited.length ? "Edited states: " + edited.join(", ") : "";
}

function renderStateSliders() {
  const name = $("state-select").value;
  const cur = currentStates[name], base = DEFAULT_STATES[name];
  const box = $("state-sliders");
  box.innerHTML = "";

  const rows = [{ key: "pvi", label: "PVI (partisan lean vs. the nation)", min: PVI_MIN, max: PVI_MAX, step: 0.1, fmt: fmtPviP }]
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

const SLOT_ICON = ["✅", "🔵", "🟣", "🟠", "⬜"];
const SLOT_CLASS = ["r", "b", "t1", "t2", "o"];

// info: { names: [R, D, T1, T2], abbrs: [R, D, T1, T2] }
function render(info, sim) {
  const nm = (i) => (i === 4 ? "Others" : esc(info.names[i]));
  const ab = (i) => (i === 4 ? "Oth" : info.abbrs[i]);

  $("approval-note").textContent =
    `National environment: ${fmtMarginP(sim.environment)} | Swing from approval: ${fmtMarginP(roundM(sim.approval))} | Total national swing: ${fmtMarginP(roundM(sim.swing))}`;

  // Per-state results with margins (margin = the winner's lead over the runner-up)
  const list = $("state-list"); list.innerHTML = "";
  for (const r of sim.results) {
    if (r.fixed) {
      list.appendChild(el("li", SLOT_CLASS[r.winner],
        `<span class="txt">📜 <b>${r.state}</b>: ${nm(r.winner)} (${r.ev} votes), electors chosen by the state legislature</span><span class="margin">No popular vote</span>`));
      continue;
    }
    const icon = r.tie ? "🤝" : SLOT_ICON[r.winner];
    const splitText = r.split ? `, real electors split ${r.split.map((n, i) => (n ? `${ab(i)} ${n}` : "")).filter(Boolean).join(" / ")}` : "";
    const text = r.tie
      ? `${icon} <b>${r.state}</b>: Tie, random winner is ${nm(r.winner)} (${r.ev} votes${splitText})`
      : `${icon} <b>${r.state}</b>: ${nm(r.winner)} wins (${r.ev} votes${splitText})`;
    const shareText = r.shares.map((s, i) => (s >= 0.05 ? `${ab(i)} ${s.toFixed(1)}` : "")).filter(Boolean).join(" · ");
    list.appendChild(el("li", r.tie ? "" : SLOT_CLASS[r.winner],
      `<span class="txt">${text}<small class="shares">${shareText}</small></span><span class="margin">Margin: ${fmtLead(ab(r.winner), r.lead)}</span>`));
  }

  // 3 closest
  const cl = $("closest-list"); cl.innerHTML = "";
  for (const r of sim.closest) {
    cl.appendChild(el("li", SLOT_CLASS[r.winner],
      `<span class="txt">State: <b>${r.state}</b> | Margin: ${fmtLead(ab(r.winner), r.lead)} | Winner: ${nm(r.winner)}</span>`));
  }

  // Bar chart
  const chart = $("chart"); chart.innerHTML = "";
  if (sim.closest.length) {
    const max = Math.max(1, ...sim.closest.map((r) => r.lead));
    chart.appendChild(el("h3", "", "Top 3 Closest States by Margin (points)"));
    const bars = el("div", "bars"), labels = el("div", "bar-labels"), legend = el("div", "legend");
    sim.closest.forEach((r, i) => {
      const col = el("div", "bar-col", `<div class="bar-val">${fmtLead(ab(r.winner), r.lead)}</div>`);
      const bar = el("div", "bar"); bar.style.background = CHART_COLORS[i];
      bar.style.height = `${(r.lead / max) * 85}%`;
      col.appendChild(bar); bars.appendChild(col);
      labels.appendChild(el("span", "", r.state));
      legend.appendChild(el("span", "", `<i style="background:${CHART_COLORS[i]}"></i>${r.state}`));
    });
    chart.append(bars, labels, legend);
  } else {
    chart.textContent = "No close states to display.";
  }

  // Final results: one line per candidate that is running (or got electors)
  const present = [true, true, info.present[0], info.present[1], sim.votes[4] > 0];
  ["🟥", "🟦", "🟪", "🟧", "⬜"].forEach((icon, i) => {
    const d = $(`final-${i + 1}`);
    d.style.display = present[i] || sim.votes[i] > 0 ? "" : "none";
    d.innerHTML = `${icon} ${nm(i)}: ${sim.votes[i]} Electoral Votes`;
  });
  const need = Math.floor(sim.total / 2) + 1;
  const order = [0, 1, 2, 3, 4].sort((a, b) => sim.votes[b] - sim.votes[a]);
  const v = $("verdict");
  if (sim.votes[order[0]] >= need && sim.votes[order[0]] > sim.votes[order[1]]) { v.className = "verdict win"; v.innerHTML = `🎉 ${nm(order[0])} wins the election!`; }
  else if (sim.votes[order[0]] === sim.votes[order[1]] && sim.votes[order[0]] >= need) { v.className = "verdict tie"; v.textContent = "It's a tie! No clear winner."; }
  else { v.className = "verdict tie"; v.innerHTML = `No candidate wins a majority: ${need} of ${sim.total} electoral votes are needed. In real life the House of Representatives would choose between the top candidates. ${nm(order[0])} leads with ${sim.votes[order[0]]}.`; }

  $("results").hidden = false;
}

// Load a preset: states, environment, candidates and third parties; candidates go back to the typical profile.
let currentPresetData = null;
function applyPreset(key) {
  currentPreset = key;
  const p = presetData(key);
  currentPresetData = p;
  PRES = { r: p.cands.r, d: p.cands.d };
  DEFAULT_STATES = deepCopy(p.states);
  currentStates = deepCopy(p.states);
  const rp = p.cands.r.party, dp = p.cands.d.party;
  buildCard($("cand1-card"), `Candidate 1 (${rp})`, `Enter the name of Candidate 1 (${rp}):`, CAND1_SLIDERS, "c1", p.cands.r.name);
  buildCard($("cand2-card"), `Candidate 2 (${dp})`, `Enter the name of Candidate 2 (${dp}):`, CAND2_SLIDERS, "c2", p.cands.d.name);
  buildThirdCards(p);
  $("env").value = p.env * 2;      // slider is in half points
  updateEnvLabel();
  $("preset-note").textContent = p.note;
  refreshStateSelect();
  renderStateSliders();
  $("results").hidden = true;
}

const presetLabel = (y) => {
  const c = ELECTION_DATA[y].cand;
  return `${y}: ${[`${c.r.name} (${c.r.abbr})`, `${c.d.name} (${c.d.abbr})`, c.t1 && c.t1.name, c.t2 && c.t2.name].filter(Boolean).join(" vs. ")}`;
};

function init() {
  const sel = $("preset-select");
  sel.innerHTML = `<option value="current">Current day (2025 Cook PVI)</option>` +
    ELECTION_KEYS.map((y) => `<option value="${y}">${presetLabel(y)}</option>`).join("");
  sel.addEventListener("change", () => { applyPreset(sel.value); window.scrollTo({ top: 0 }); });
  const reset = () => { applyPreset(currentPreset); window.scrollTo({ top: 0 }); };
  applyPreset("current");
  $("env").addEventListener("input", updateEnvLabel);
  $("state-select").addEventListener("change", renderStateSliders);
  $("state-reset").addEventListener("click", () => resetStates(false));
  $("state-reset-all").addEventListener("click", () => resetStates(true));
  $("restart").addEventListener("click", reset);
  $("run").addEventListener("click", () => {
    const p = currentPresetData;
    const c1 = readCandidate("c1", CAND1_SLIDERS, "Candidate 1");
    const c2 = readCandidate("c2", CAND2_SLIDERS, "Candidate 2");
    const thirds = [readThird("t1", p), readThird("t2", p)];
    const info = {
      names: [c1.name, c2.name, thirds[0].name, thirds[1].name],
      abbrs: [p.cands.r.abbr, p.cands.d.abbr, thirds[0].abbr, thirds[1].abbr],
      present: [thirds[0].present && (thirds[0].share > 0 || thirds[0].actual > 0), thirds[1].present && (thirds[1].share > 0 || thirds[1].actual > 0)],
    };
    render(info, simulate(c1, c2, Math.random, currentStates, envValue(), thirds));
    $("results").scrollIntoView({ behavior: "smooth" });
  });
}

if (typeof document !== "undefined") init();
if (typeof module !== "undefined") module.exports = { STATES, DEFAULT_STATES, simulate, stateMargin, approvalSwing, presetData, ELECTION_KEYS, TYPICAL_R, TYPICAL_D, argmax };
