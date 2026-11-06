// Race simulator: pick any state, any statewide office and any preset year, set the national environment, the
// candidates' stances and approval, and choose who (if anyone) is the incumbent.
// Uses globals from script.js (STATES, presetData, issueScore, ...) and the UI helpers exported by downballot.js.
(function () {
  "use strict";
  const root = typeof globalThis !== "undefined" ? globalThis : window;

  const OFFICES = [
    ["senate", "U.S. Senate"], ["governor", "Governor"], ["ltgov", "Lieutenant Governor"],
    ["ag", "Attorney General"], ["sos", "Secretary of State"], ["other", "Other statewide office"],
  ];
  const DEFAULT_BONUS = 3;
  const ENV_MIN = -35, ENV_MAX = 35, ADJ_MIN = -60, ADJ_MAX = 60;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const THIRD_MAX = 45;

  const candidate = (typical, name) => Object.assign({ name, approval: 50 }, typical);
  const newThird = () => ({ name: "", share: 0, toR: null });

  // ---------- Baseline: the state's presidential lean in the chosen year ----------
  // The lean is the same one the president tab uses for that year, and the national environment starts at that
  // year's real national margin, so with typical candidates the race lands on the state's presidential result.
  function baseline(year, state) {
    const p = presetData(year);
    const s = p.states[state];
    if (!s || s.fixed) return null;
    return { pvi: s.pvi, env: p.env, cands: p.cands, m2: 2 * s.pvi + p.env };
  }
  function availableStates(year) {
    const p = presetData(year);
    return Object.keys(p.states).filter((n) => !p.states[n].fixed && n !== "Washington DC");
  }

  const S = {};
  function reset() {
    Object.assign(S, {
      office: "senate", officeLabel: "", state: "Texas", year: "current", note: "",
      env: 0, pvi: 0, adj: 0, incumbent: "none", bonus: DEFAULT_BONUS,
      r: candidate(TYPICAL_R, "Republican nominee"), d: candidate(TYPICAL_D, "Democratic nominee"), t: newThird(),
    });
    applyBaseline();
  }
  // Take the lean and environment from the chosen year and state (and clear the race adjustment).
  function applyBaseline() {
    if (!baseline(S.year, S.state)) {
      const old = S.state;
      S.state = availableStates(S.year)[0];
      S.note = `${old} didn't take part in the ${S.year} election, so the race moved to ${S.state}.`;
    } else {
      S.note = "";
    }
    const b = baseline(S.year, S.state);
    S.pvi = b.pvi;
    S.env = b.env;
    S.adj = 0;
  }

  // ---------- Model ----------
  // Same pieces as the Senate and governor tabs: environment + 2 x PVI + incumbency + adjustment + issue fit + approval gap
  // move the two-party margin M2 (R minus D). An optional third candidate then takes a share of the vote from the
  // Republican and Democrat (in proportion, or by `toR`); the winner is whoever has the most votes.
  // incumbent: "none" | "r" | "d" | "t". A third-party incumbent adds the incumbency bonus to their vote share.
  function simulateRace(cfg) {
    const base = STATES[cfg.state];
    const fit = issueScore(base, cfg.r) - issueScore(base, cfg.d);
    const ref = issueScore(base, TYPICAL_R) - issueScore(base, TYPICAL_D);
    const parts = {
      environment: cfg.env,
      lean: PVI_TO_MARGIN * cfg.pvi,
      incumbency: cfg.incumbent === "r" ? cfg.bonus : cfg.incumbent === "d" ? -cfg.bonus : 0,
      adjustment: cfg.adj,
      issues: POINTS_TO_MARGIN * (fit - ref),
      approval: approvalSwing(cfg.r.approval, cfg.d.approval),
    };
    const m2 = roundM(clamp(Object.values(parts).reduce((a, b) => a + b, 0), -100, 100));
    const t = clamp(cfg.t.share + (cfg.incumbent === "t" ? cfg.bonus : 0), 0, THIRD_MAX);
    const r0 = 50 + m2 / 2, d0 = 100 - r0;
    const toR = cfg.t.toR !== null && cfg.t.toR !== undefined ? cfg.t.toR : r0 / 100;
    let rS = r0 - t * toR, dS = d0 - t * (1 - toR);
    if (rS < 0) { dS += rS; rS = 0; }              // a third party can't take more votes from a candidate than they have
    if (dS < 0) { rS += dS; dS = 0; }
    const shares = [rS, dS, t];
    const order = [0, 1, 2].sort((a, b) => shares[b] - shares[a] || a - b);
    const lead = roundM(shares[order[0]] - shares[order[1]]);
    let winner = order[0];
    const tie = lead === 0;
    if (tie) {                                    // dead heat: the incumbent keeps the seat, otherwise the Republican (listed first)
      const incSlot = { r: 0, d: 1, t: 2 }[cfg.incumbent];
      winner = incSlot !== undefined && order.slice(0, 2).includes(incSlot) ? incSlot : order[0];
    }
    return { m2, parts, shares, winner, lead, tie };
  }

  // ---------- 2026 candidates ----------
  const raceDef = (office, state) =>
    typeof RACES !== "undefined" && RACES[office] ? RACES[office].races.find((a) => a[0] === state) : null;
  // The real 2026 nominees for this state, and who holds the seat now, if there is a 2026 race for this office.
  function real2026(office, state) {
    const a = raceDef(office, state);
    if (!a) return null;
    return { r: a[3], d: a[5], rInc: !!a[4], dInc: !!a[6], dParty: a[7] };
  }
  function load2026() {
    const x = real2026(S.office, S.state);
    if (!x) return false;
    S.r.name = x.r; S.d.name = x.d;
    S.incumbent = x.rInc ? "r" : x.dInc ? "d" : "none";
    return true;
  }

  // ---------- UI ----------
  function render() {
    const U = root.DownBallot.ui, mk = U.mk, h = U.h;
    const panel = document.getElementById("tab-race");
    panel.innerHTML = "";
    const b = baseline(S.year, S.state);
    const ab = { r: b.cands.r.abbr, d: b.cands.d.abbr };
    const fmtM = (m) => (m === 0 ? "EVEN" : fmtLead(m > 0 ? ab.r : ab.d, Math.abs(m)));
    const fmtP = (n) => (n === 0 ? "EVEN" : (n > 0 ? ab.r : ab.d) + "+" + fmtNum(Math.abs(n)));
    const officeName = S.office === "other" ? (S.officeLabel || "Statewide office") : OFFICES.find((o) => o[0] === S.office)[1];

    // --- race selectors ---
    const top = mk("section", "panel");
    top.innerHTML = `<h3>Race simulator</h3>
      <p class="note">Pick any state, office and preset year. The state's lean comes from that year's presidential result and the national environment starts at that year's real national margin; change anything below to ask "what if".</p>
      <div class="grid3">
        <div class="field"><label>Office</label><select id="rs-office"></select></div>
        <div class="field"><label>State</label><select id="rs-state"></select></div>
        <div class="field"><label>Preset year</label><select id="rs-year"></select></div>
      </div>
      <div class="field" id="rs-label-field" ${S.office === "other" ? "" : "hidden"}><label>Office name</label><input type="text" id="rs-label" autocomplete="off" /></div>
      <p class="note info" id="rs-base"></p><p class="note info warn" id="rs-note"></p>
      <div class="all-controls"><div class="btn-row"></div></div>`;
    panel.appendChild(top);
    const selOffice = top.querySelector("#rs-office"), selState = top.querySelector("#rs-state"), selYear = top.querySelector("#rs-year");
    OFFICES.forEach(([k, name]) => { const o = mk("option", "", h(name)); o.value = k; selOffice.appendChild(o); });
    availableStates(S.year).forEach((n) => { const o = mk("option", "", h(n)); o.value = n; selState.appendChild(o); });
    const yo = mk("option", "", "Current day (2025 Cook PVI)"); yo.value = "current"; selYear.appendChild(yo);
    ELECTION_KEYS.forEach((y) => { const o = mk("option", "", h(`${y}: ${ELECTION_DATA[y].cand.r.name} vs. ${ELECTION_DATA[y].cand.d.name}`)); o.value = y; selYear.appendChild(o); });
    selOffice.value = S.office; selState.value = S.state; selYear.value = S.year;
    top.querySelector("#rs-label").value = S.officeLabel;
    top.querySelector("#rs-base").textContent =
      `Baseline: ${S.state}'s ${S.year === "current" ? "2025 Cook PVI" : S.year + " PVI"} is ${fmtP(b.pvi)}` +
      `${S.year === "current" ? "" : ` (a two-party presidential margin of ${fmtM(roundM(b.m2))} against a national ${fmtM(b.env)})`}. ` +
      `With a typical ${b.cands.r.party} and a typical ${b.cands.d.party}, equal approval and that national environment, the race would land at ${fmtM(roundM(b.m2))}.`;
    top.querySelector("#rs-note").textContent = S.note;
    selOffice.addEventListener("change", () => { S.office = selOffice.value; render(); });
    selState.addEventListener("change", () => { S.state = selState.value; applyBaseline(); render(); });
    selYear.addEventListener("change", () => { S.year = selYear.value; applyBaseline(); render(); });
    top.querySelector("#rs-label").addEventListener("input", (e) => { S.officeLabel = e.target.value; update(); });

    const btns = top.querySelector(".btn-row");
    const x = real2026(S.office, S.state);
    if (x) {
      const b26 = mk("button", "btn ghost", `Load the real 2026 ${S.office === "senate" ? "Senate" : "governor"} candidates`);
      b26.type = "button";
      b26.addEventListener("click", () => { load2026(); render(); });
      btns.appendChild(b26);
    }
    const br = mk("button", "btn ghost", "Reset this race");
    br.type = "button";
    br.addEventListener("click", () => { const keep = { office: S.office, label: S.officeLabel }; reset(); S.office = keep.office; S.officeLabel = keep.label; render(); });
    btns.appendChild(br);

    // --- candidates ---
    const cards = mk("section", "cards");
    panel.appendChild(cards);
    U.buildCandidateEditor(cards, null, S, "r", () => update(), { noIncumbent: true });
    cards.lastElementChild.querySelector("h3").textContent = `${b.cands.r.party} candidate`;
    S.d.party = "D";
    U.buildCandidateEditor(cards, null, S, "d", () => update(), { noIncumbent: true });
    cards.lastElementChild.querySelector("h3").textContent = `${b.cands.d.party} candidate`;
    // optional third candidate
    const third = mk("article", "card t1");
    third.innerHTML = `<h3>Third candidate (optional)</h3>
      <div class="field"><label>Name</label><input type="text" autocomplete="off" /></div>`;
    third.querySelector("input").value = S.t.name;
    third.querySelector("input").addEventListener("input", (e) => { S.t.name = e.target.value; update(); });
    U.addSlider(third, { label: "Vote share in this race (%) (0 = not running)", min: 0, max: THIRD_MAX, step: 0.5, value: S.t.share, onInput: (v) => { S.t.share = v; update(); } });
    const flowField = U.addSlider(third, {
      label: "If their voters had to pick a major party: % who pick the " + b.cands.r.party, min: 0, max: 100, step: 1, value: S.t.toR === null ? 50 : Math.round(S.t.toR * 100),
      fmt: (v) => `${v}% / ${100 - v}%`, onInput: (v) => { S.t.toR = v / 100; flowField.querySelector(".val").textContent = `${v}% / ${100 - v}%`; update(); },
    });
    if (S.t.toR === null) flowField.querySelector(".val").textContent = "Proportional";
    cards.appendChild(third);

    // --- settings: incumbent, lean, adjustment, environment ---
    const settings = mk("section", "panel");
    settings.innerHTML = `<h3>Race settings</h3>
      <div class="field"><label>Incumbent (who holds the office now and is running)</label>
        <div class="radios" id="rs-inc"></div></div>`;
    panel.appendChild(settings);
    const radios = settings.querySelector("#rs-inc");
    const incLabels = {};
    [["none", "No incumbent (open race)"], ["r", "Republican candidate"], ["d", "Democratic candidate"], ["t", "Third candidate"]].forEach(([v, text]) => {
      const lab = mk("label", "radio", `<input type="radio" name="rs-inc" value="${v}" /> <span></span>`);
      incLabels[v] = lab.querySelector("span");
      lab.querySelector("input").checked = S.incumbent === v;
      lab.querySelector("input").addEventListener("change", () => { S.incumbent = v; update(); });
      radios.appendChild(lab);
      incLabels[v].dataset.text = text;
    });
    U.addSlider(settings, { label: "Incumbency advantage (points of margin)", min: 0, max: 10, step: 0.5, value: S.bonus, fmt: (v) => v.toFixed(1), onInput: (v) => { S.bonus = v; update(); } });
    U.addSlider(settings, { label: "State PVI (presidential lean)", min: PVI_MIN, max: PVI_MAX, step: 0.1, value: S.pvi, fmt: fmtP, onInput: (v) => { S.pvi = v; update(); } });
    U.addSlider(settings, { label: "Race adjustment (candidate or office crossover appeal)", min: ADJ_MIN, max: ADJ_MAX, step: 0.5, value: S.adj, fmt: (v) => U.signed(v) + " pts", onInput: (v) => { S.adj = v; update(); } });
    U.addSlider(settings, {
      label: `National environment (${ab.r}+ helps the ${b.cands.r.party}, ${ab.d}+ helps the ${b.cands.d.party})`, min: ENV_MIN, max: ENV_MAX, step: 0.5, value: S.env, fmt: fmtM,
      onInput: (v) => { S.env = v; update(); },
    });

    const result = mk("section", "panel result");
    panel.appendChild(result);

    function update() {
      const nm = (c, fallback) => (c.name && c.name.trim()) || fallback;
      const names = [nm(S.r, "Republican nominee"), nm(S.d, "Democratic nominee"), nm(S.t, "Third candidate")];
      for (const [v, el] of Object.entries(incLabels)) {
        el.textContent = v === "none" ? el.dataset.text : `${el.dataset.text}: ${names[{ r: 0, d: 1, t: 2 }[v]]}`;
      }
      const sim = simulateRace(S);
      const win = sim.winner, abbrs = [b.cands.r.abbr, b.cands.d.abbr, "Ind"];
      const margin = sim.lead === 0 ? "dead even" : `margin ${fmtLead(abbrs[win], sim.lead)}`;
      const incName = S.incumbent === "none" ? null : names[{ r: 0, d: 1, t: 2 }[S.incumbent]];
      const flip = incName && win !== { r: 0, d: 1, t: 2 }[S.incumbent];
      const shareText = sim.shares.map((s, i) => (i < 2 || S.t.share > 0 || S.incumbent === "t") ? `${h(names[i])} ${s.toFixed(1)}%` : "").filter(Boolean).join(" · ");
      const row = (label, v) => `<tr><td>${label}</td><td class="num">${U.signed(v)}</td></tr>`;
      const inc = sim.parts.incumbency;
      result.innerHTML = `<h3>${h(S.state)} ${h(officeName)}, ${S.year === "current" ? "current-day baseline" : S.year + " baseline"}</h3>
        <div class="verdict ${sim.tie ? "tie" : "win"}">${sim.tie ? "Dead even; goes to " : "🎉 "}${h(names[win])} wins, ${margin}${flip ? ` (defeating incumbent ${h(incName)})` : ""}</div>
        <p class="note">${shareText}${incName ? ` · Incumbent: ${h(incName)}` : " · No incumbent"}</p>
        <table class="breakdown"><tbody>
          ${row("National environment", sim.parts.environment)}
          ${row("Presidential lean (2 × state PVI " + fmtP(S.pvi) + ")", sim.parts.lean)}
          ${row("Incumbency" + (S.incumbent === "t" ? " (added to the third candidate's share)" : ""), inc)}
          ${row("Race adjustment", sim.parts.adjustment)}
          ${row("Issue fit vs. typical candidates", sim.parts.issues)}
          ${row("Approval gap", sim.parts.approval)}
          <tr class="total"><td>Two-party margin (${b.cands.r.party} minus ${b.cands.d.party})</td><td class="num">${fmtM(sim.m2)}</td></tr>
        </tbody></table>`;
    }
    update();
  }

  reset();
  root.RaceSim = { OFFICES, S, reset, applyBaseline, baseline, availableStates, simulateRace, real2026, load2026, render };
})();
