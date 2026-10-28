// Down-ballot tabs: Senate and Governor races, each as a "single race" tab and an "all races" tab.
// Uses the globals from script.js (STATES, issueScore, TYPICAL_R/D, ...) and RACES from races.js.
(function () {
  "use strict";
  const root = typeof globalThis !== "undefined" ? globalThis : window;

  // ---------- Model ----------
  // margin (R minus D, points) =
  //     national environment shift                       (slider, 0 = where the forecasters have it now)
  //   + 2 x state PVI                                    (presidential lean, editable per race)
  //   + 3 per incumbent (+ for Republican, - for Democrat)
  //   + race adjustment                                  (default calibrated to the Cook rating, see calibrate())
  //   + 0.5 x issue fit vs. a typical R / typical D      (same issue scoring as the presidential game)
  //   + 0.25 x approval gap                              (Republican minus Democrat)
  const INCUMBENT_BONUS = 3;
  const TOSSUP_EDGE = 0.5;                                  // a Tossup starts half a point toward the party holding the seat
  const BANDS = { Solid: [12, Infinity], Likely: [7, 12], Lean: [3, 7] };   // |margin| range of each Cook rating
  const ENV_MIN = -15, ENV_MAX = 15, ADJ_MIN = -60, ADJ_MAX = 60;

  const OFFICES = {
    senate: { key: "senate", name: "Senate", noun: "seat", data: RACES.senate },
    governor: { key: "governor", name: "Governor", noun: "governorship", data: RACES.governor },
  };
  for (const off of Object.values(OFFICES)) {
    off.defs = off.data.races.map((a) => ({
      state: a[0], heldBy: a[1], rating: a[2], special: !!a[8],
      r: { name: a[3], incumbent: !!a[4] },
      d: { name: a[5], incumbent: !!a[6], party: a[7] },
    }));
  }

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const h = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  function parseRating(text) {
    if (/tossup/i.test(text)) return { label: "Tossup", side: 0 };
    const [label, party] = text.split(" ");
    return { label, side: party === "R" ? 1 : -1 };
  }

  // Margin with typical candidates, equal approval, no adjustment and a 0 environment shift.
  const baseMargin = (def, pvi) =>
    PVI_TO_MARGIN * pvi + INCUMBENT_BONUS * ((def.r.incumbent ? 1 : 0) - (def.d.incumbent ? 1 : 0));

  // The default "race adjustment" moves the default margin into the band of the race's Cook rating, and nothing
  // more: a race already inside its band gets 0. Tossups start half a point toward the party holding the seat.
  function calibrate(def, pvi) {
    const m0 = baseMargin(def, pvi);
    const rt = parseRating(def.rating);
    let target;
    if (rt.side === 0) {
      target = TOSSUP_EDGE * (def.heldBy === "R" ? 1 : -1);
    } else {
      const [lo, hi] = BANDS[rt.label];
      target = clamp(m0 * rt.side, lo, hi) * rt.side;
    }
    return roundM(target - m0);
  }

  const typicalCandidate = (typical, extra) => Object.assign({}, typical, { approval: 50 }, extra);

  function newRace(def) {
    const pvi = STATES[def.state].pvi;
    return {
      pvi,
      adj: calibrate(def, pvi),
      r: typicalCandidate(TYPICAL_R, { name: def.r.name, incumbent: def.r.incumbent }),
      d: typicalCandidate(TYPICAL_D, { name: def.d.name, incumbent: def.d.incumbent, party: def.d.party }),
    };
  }

  const S = {};   // per-office state: { env, selected, races: { stateName: raceState } }
  function resetOffice(key) {
    const off = OFFICES[key];
    S[key] = { env: 0, selected: off.defs[0].state, races: {} };
    for (const def of off.defs) S[key].races[def.state] = newRace(def);
  }
  Object.keys(OFFICES).forEach(resetOffice);

  function raceMargin(def, rs, env) {
    const base = STATES[def.state];
    const fit = issueScore(base, rs.r) - issueScore(base, rs.d);
    const ref = issueScore(base, TYPICAL_R) - issueScore(base, TYPICAL_D);
    const parts = {
      environment: env,
      lean: PVI_TO_MARGIN * rs.pvi,
      incumbency: INCUMBENT_BONUS * ((rs.r.incumbent ? 1 : 0) - (rs.d.incumbent ? 1 : 0)),
      adjustment: rs.adj,
      issues: POINTS_TO_MARGIN * (fit - ref),
      approval: approvalSwing(rs.r.approval, rs.d.approval),
    };
    const total = Object.values(parts).reduce((a, b) => a + b, 0);
    return { margin: roundM(clamp(total, -100, 100)), parts };
  }

  // Ties (exactly 0.000) go to the party holding the seat, so live updates don't flicker; tests can pass an rng.
  function simulateOffice(key, rng) {
    const off = OFFICES[key], st = S[key];
    const rows = [], flips = [];
    let winsD = 0, winsR = 0, indep = 0;
    for (const def of off.defs) {
      const rs = st.races[def.state];
      const { margin, parts } = raceMargin(def, rs, st.env);
      let winner = margin > 0 ? "R" : margin < 0 ? "D" : null;
      const tie = winner === null;
      if (tie) winner = rng ? (rng() < 0.5 ? "R" : "D") : def.heldBy;
      const cand = winner === "R" ? rs.r : rs.d;
      const flipped = winner !== def.heldBy;
      if (winner === "R") winsR++; else { winsD++; if (rs.d.party === "I") indep++; }
      if (flipped) flips.push({ state: def.state, from: def.heldBy, to: winner });
      rows.push({ def, rs, margin, parts, winner, tie, flipped, winnerName: cand.name });
    }
    const seatsD = off.data.notUp.D + winsD, seatsR = off.data.notUp.R + winsR;
    let control;
    if (key === "senate") control = seatsD >= 51 ? "D" : "R";            // 50-50 goes to the Vice President's party (Republican)
    else control = seatsD > seatsR ? "D" : seatsR > seatsD ? "R" : "tie";
    return { rows, flips, winsD, winsR, indep, seatsD, seatsR, control };
  }

  // ---------- UI helpers ----------
  const ratingOf = (m) => {
    const a = Math.abs(m);
    const label = a >= 12 ? "Solid" : a >= 7 ? "Likely" : a >= 3 ? "Lean" : "Toss-up";
    return label === "Toss-up" ? "Toss-up" : `${label} ${m > 0 ? "R" : "D"}`;
  };
  const partyLabel = (p) => (p === "R" ? "Republican" : p === "D" ? "Democratic" : "Independent");
  const signed = (x) => (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(1);

  function mk(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // A labelled range slider. Returns the wrapper; onInput receives the numeric value.
  function addSlider(parent, o) {
    const f = mk("div", "field");
    f.innerHTML = `<label><span>${o.label}</span><span class="val wide">${o.fmt ? o.fmt(o.value) : o.value}</span></label>
      <input type="range" min="${o.min}" max="${o.max}" step="${o.step || 1}" value="${o.value}" />`;
    const input = f.querySelector("input"), val = f.querySelector(".val");
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      val.textContent = o.fmt ? o.fmt(v) : v;
      o.onInput(v);
    });
    parent.appendChild(f);
    return f;
  }

  // Name, incumbent checkbox, five stance sliders and approval for one candidate.
  function buildCandidateEditor(parent, def, rs, side, onChange) {
    const c = rs[side];
    const defs = side === "r" ? CAND1_SLIDERS : CAND2_SLIDERS;
    const indep = side === "d" && c.party === "I";
    const card = mk("article", "card " + (side === "r" ? "red" : "blue"));
    card.appendChild(mk("h3", "", side === "r" ? "Republican" : indep ? "Independent (Democratic-side slot)" : "Democrat"));
    const nameField = mk("div", "field", `<label>Name</label><input type="text" autocomplete="off" />`);
    const nameInput = nameField.querySelector("input");
    nameInput.value = c.name;
    nameInput.addEventListener("input", () => { c.name = nameInput.value; onChange("name"); });
    card.appendChild(nameField);
    const incField = mk("div", "field check", `<label><input type="checkbox" /> Incumbent (+${INCUMBENT_BONUS} points)</label>`);
    const inc = incField.querySelector("input");
    inc.checked = c.incumbent;
    inc.addEventListener("change", () => { c.incumbent = inc.checked; onChange("incumbent"); });
    card.appendChild(incField);
    for (const d of defs) {
      addSlider(card, { label: d.prompt, min: d.min, max: d.max, value: c[d.key], onInput: (v) => { c[d.key] = v; onChange(d.key); } });
    }
    parent.appendChild(card);
  }

  // PVI + race adjustment sliders for one race.
  function buildRaceSettings(parent, def, rs, onChange, onReset) {
    addSlider(parent, {
      label: "State PVI (presidential lean)", min: PVI_MIN, max: PVI_MAX, step: 0.1, value: rs.pvi, fmt: fmtPvi,
      onInput: (v) => { rs.pvi = v; onChange("pvi"); },
    });
    addSlider(parent, {
      label: "Race adjustment (default calibrated to the Cook rating)", min: ADJ_MIN, max: ADJ_MAX, step: 0.5, value: rs.adj,
      fmt: (v) => signed(v) + " pts",
      onInput: (v) => { rs.adj = v; onChange("adj"); },
    });
    const b = mk("button", "btn ghost", "Reset this race");
    b.type = "button";
    b.addEventListener("click", onReset);
    parent.appendChild(b);
  }

  function addEnvSlider(parent, key, onChange) {
    addSlider(parent, {
      label: "National environment shift (0 = where forecasters have it now; D+ helps Democrats, R+ helps Republicans)",
      min: ENV_MIN, max: ENV_MAX, step: 0.5, value: S[key].env, fmt: (v) => fmtMargin(v),
      onInput: (v) => { S[key].env = v; onChange(); },
    });
  }

  // ---------- Single race tab ----------
  function renderSingle(key) {
    const off = OFFICES[key], panel = document.getElementById(`tab-${key}-single`);
    panel.innerHTML = "";
    const st = S[key];
    const top = mk("section", "panel");
    top.innerHTML = `<h3>${off.name}: single race</h3>
      <div class="field"><label>Race</label><select></select></div><p class="note info"></p>`;
    const sel = top.querySelector("select"), info = top.querySelector(".info");
    for (const d of off.defs) {
      const o = mk("option", "", h(d.state + (d.special ? " (special)" : "")) + ` — ${d.heldBy === "R" ? "R" : "D"}-held`);
      o.value = d.state;
      sel.appendChild(o);
    }
    sel.value = st.selected;
    panel.appendChild(top);
    const candBox = mk("section", "cards");
    const settings = mk("section", "panel");
    const result = mk("section", "panel result");
    panel.append(candBox, settings, result);

    const draw = () => {
      const def = off.defs.find((d) => d.state === st.selected), rs = st.races[def.state];
      info.textContent = `${def.heldBy === "R" ? "Republican" : "Democratic"}-held ${off.noun}${def.special ? " (special election)" : ""} · Cook rating (Sep 2026): ${def.rating}`;
      candBox.innerHTML = ""; settings.innerHTML = "";
      const update = () => showResult(result, def, rs, st.env);
      buildCandidateEditor(candBox, def, rs, "r", update);
      buildCandidateEditor(candBox, def, rs, "d", update);
      settings.appendChild(mk("h3", "", "Race settings"));
      buildRaceSettings(settings, def, rs, update, () => { st.races[def.state] = newRace(def); draw(); });
      addEnvSlider(settings, key, update);
      update();
    };
    sel.addEventListener("change", () => { st.selected = sel.value; draw(); });
    draw();
  }

  function showResult(box, def, rs, env) {
    const { margin, parts } = raceMargin(def, rs, env);
    const winner = margin > 0 ? "R" : margin < 0 ? "D" : def.heldBy;
    const cand = winner === "R" ? rs.r : rs.d;
    const flip = winner !== def.heldBy;
    const shareR = 50 + margin / 2;
    const row = (label, v) => `<tr><td>${label}</td><td class="num">${signed(v)}</td></tr>`;
    box.innerHTML = `<h3>Result</h3>
      <div class="verdict ${margin === 0 ? "tie" : "win"}">${margin === 0 ? "Dead even; goes to the party holding the seat: " : "🎉 "}${h(cand.name)}${cand.party === "I" ? " (I)" : ""} wins${flip ? " (flip from " + (def.heldBy === "R" ? "Republican" : "Democratic") + ")" : ""}, margin ${fmtMargin(margin)} (${ratingOf(margin)})</div>
      <p class="note">Two-party share roughly R ${shareR.toFixed(1)}% to D ${(100 - shareR).toFixed(1)}%.</p>
      <table class="breakdown"><tbody>
        ${row("National environment shift", parts.environment)}
        ${row("Presidential lean (2 × state PVI " + fmtPvi(rs.pvi) + ")", parts.lean)}
        ${row("Incumbency", parts.incumbency)}
        ${row("Race adjustment", parts.adjustment)}
        ${row("Issue fit vs. typical candidates", parts.issues)}
        ${row("Approval gap", parts.approval)}
        <tr class="total"><td>Total margin (+ = Republican, − = Democrat)</td><td class="num">${fmtMargin(margin)}</td></tr>
      </tbody></table>`;
  }

  // ---------- All races tab ----------
  function renderAll(key) {
    const off = OFFICES[key], panel = document.getElementById(`tab-${key}-all`);
    panel.innerHTML = "";
    const st = S[key];
    const top = mk("section", "panel");
    top.innerHTML = `<h3>${off.name}: all races</h3>
      <p class="note">${key === "senate"
        ? "All 35 seats up in 2026 (33 regular, plus the Florida and Ohio specials). Seats not up: 34 Democratic caucus, 31 Republican."
        : "All 36 governorships up in 2026. Governorships not up: 6 Democratic, 8 Republican."}
        Edit any candidate's name in the table, or press Edit for stances, approval, incumbency and the race's PVI and adjustment. Results update as you type.</p>`;
    const controls = mk("div", "all-controls");
    addEnvSlider(controls, key, () => refresh());
    const reset = mk("button", "btn ghost", `Reset all ${off.name.toLowerCase()} races`);
    reset.type = "button";
    reset.addEventListener("click", () => { resetOffice(key); renderAll(key); });
    controls.appendChild(reset);
    top.appendChild(controls);
    const summary = mk("section", "panel summary");
    const wrap = mk("div", "table-wrap");
    const table = mk("table", "race-table");
    table.innerHTML = `<thead><tr><th>State</th><th>Held by</th><th>Cook</th><th>Republican</th><th>Democratic side</th><th></th><th>Result</th></tr></thead>`;
    const tbody = mk("tbody");
    table.appendChild(tbody);
    wrap.appendChild(table);
    panel.append(top, summary, wrap);

    const cells = {};
    for (const def of off.defs) {
      const rs = st.races[def.state];
      const tr = mk("tr");
      tr.innerHTML = `<td><b>${h(def.state)}</b>${def.special ? " <small>(special)</small>" : ""}</td>
        <td><span class="badge ${def.heldBy === "R" ? "r" : "b"}">${def.heldBy}</span></td>
        <td>${h(def.rating)}</td><td class="name r"></td><td class="name d"></td>
        <td><button type="button" class="btn ghost small">Edit</button></td><td class="res"></td>`;
      for (const side of ["r", "d"]) {
        const input = mk("input");
        input.type = "text"; input.value = rs[side].name; input.setAttribute("aria-label", `${def.state} ${side === "r" ? "Republican" : "Democratic-side"} candidate`);
        input.addEventListener("input", () => { rs[side].name = input.value; refresh(); });
        tr.querySelector(`.name.${side}`).appendChild(input);
        if (side === "d" && rs.d.party === "I") tr.querySelector(".name.d").appendChild(mk("small", "ind", " (I)"));
      }
      cells[def.state] = tr.querySelector(".res");
      tbody.appendChild(tr);
      const detail = mk("tr", "detail");
      detail.hidden = true;
      const td = mk("td"); td.colSpan = 7; detail.appendChild(td);
      tbody.appendChild(detail);
      let built = false;
      tr.querySelector("button").addEventListener("click", () => {
        detail.hidden = !detail.hidden;
        if (!detail.hidden && !built) {
          built = true;
          const grid = mk("div", "cards"); td.appendChild(grid);
          buildCandidateEditor(grid, def, rs, "r", () => refresh());
          buildCandidateEditor(grid, def, rs, "d", () => refresh());
          const set = mk("div", "panel"); td.appendChild(set);
          buildRaceSettings(set, def, rs, () => refresh(), () => { st.races[def.state] = newRace(def); renderAll(key); });
        }
      });
    }

    function refresh() {
      const sim = simulateOffice(key);
      for (const r of sim.rows) {
        const c = cells[r.def.state];
        c.className = "res " + (r.winner === "R" ? "r" : "b");
        c.innerHTML = `${r.flipped ? '<span class="flip">FLIP</span> ' : ""}<b>${h(r.winnerName)}</b> <small>${fmtMargin(r.margin)}</small>`;
      }
      const dTotal = sim.seatsD, rTotal = sim.seatsR;
      let verdict;
      if (key === "senate") {
        verdict = sim.control === "D" ? "Democrats win control of the Senate"
          : rTotal === 50 ? "Republicans keep control (50-50, the Vice President breaks ties)" : "Republicans keep control of the Senate";
      } else {
        verdict = sim.control === "D" ? "Democrats hold more governorships" : sim.control === "R" ? "Republicans hold more governorships" : "Governorships split evenly";
      }
      const flipText = sim.flips.length
        ? sim.flips.map((f) => `${h(f.state)} (${f.from}→${f.to})`).join(", ")
        : "none";
      const dLabel = key === "senate" ? "Democratic caucus" : "Democrats";
      const indepNote = key === "senate" && sim.indep
        ? `<p class="note">${sim.indep} independent winner${sim.indep > 1 ? "s are" : " is"} counted with the Democrats (assumed to caucus with them).</p>` : "";
      summary.innerHTML = `<h3>${h(verdict)}</h3>
        <div class="tally"><div class="t b"><span>${dLabel}</span><b>${dTotal}</b></div><div class="t r"><span>Republicans</span><b>${rTotal}</b></div></div>
        <p class="note">Races won in 2026: Democratic side ${sim.winsD}, Republican ${sim.winsR}. Held over (not up): D ${off.data.notUp.D}, R ${off.data.notUp.R}.</p>
        <p class="note"><b>Flips (${sim.flips.length}):</b> ${flipText}</p>${indepNote}`;
    }
    refresh();
  }

  // ---------- Tabs ----------
  function renderTab(name) {
    const m = /^(senate|governor)-(single|all)$/.exec(name);
    if (!m) return;
    (m[2] === "single" ? renderSingle : renderAll)(m[1]);
  }

  function initTabs() {
    const buttons = document.querySelectorAll("#tabs .tab");
    const show = (name) => {
      buttons.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
      document.querySelectorAll(".tabpanel").forEach((p) => { p.hidden = p.id !== "tab-" + name; });
      renderTab(name);
      window.scrollTo({ top: 0 });
    };
    buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
  }

  root.DownBallot = { OFFICES, S, parseRating, calibrate, baseMargin, newRace, resetOffice, raceMargin, simulateOffice, ratingOf, BANDS, INCUMBENT_BONUS };
  if (typeof document !== "undefined" && document.getElementById("tabs")) initTabs();
})();
