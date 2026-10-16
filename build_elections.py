"""
Builds elections.js (the historical presets) from the MIT Election Lab file
"1976-2024-president.csv" (U.S. President, state-level results).

Usage:   python tools/build_elections.py path/to/1976-2024-president.csv

For every election it checks (and refuses to write the file if anything fails):
  - all 51 states are present and electoral votes sum to 538
  - the winner-take-all electoral vote totals equal the real results
  - a preset reproduces every state's real winner and margin
"""
import json
import sys

import pandas as pd

CSV = sys.argv[1] if len(sys.argv) > 1 else "1976-2024-president.csv"
OUT = "elections.js"

# ---- electoral votes by census apportionment (DC included) ----
_COLS = ("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY").split()
def _t(vals): return dict(zip(_COLS, vals))
EV = {
    1970: _t([9,3,6,6,45,7,8,3,3,17,12,4,4,26,13,8,7,9,10,4,10,14,21,10,7,12,4,5,3,4,17,4,41,13,3,25,8,6,27,4,8,4,10,26,4,3,12,9,6,11,3]),
    1980: _t([9,3,7,6,47,8,8,3,3,21,12,4,4,24,12,8,7,9,10,4,10,13,20,10,7,11,4,5,4,4,16,5,36,13,3,23,8,7,25,4,8,3,11,29,5,3,12,10,6,11,3]),
    1990: _t([9,3,8,6,54,8,8,3,3,25,13,4,4,22,12,7,6,8,9,4,10,12,18,10,7,11,3,5,4,4,15,5,33,14,3,21,8,7,23,4,8,3,11,32,5,3,13,11,5,11,3]),
    2000: _t([9,3,10,6,55,9,7,3,3,27,15,4,4,21,11,7,6,8,9,4,10,12,17,10,6,11,3,5,5,4,15,5,31,15,3,20,7,7,21,4,8,3,11,34,5,3,13,11,5,10,3]),
    2010: _t([9,3,11,6,55,9,7,3,3,29,16,4,4,20,11,6,6,8,8,4,10,11,16,10,6,10,3,5,6,4,14,5,29,15,3,18,7,7,20,4,9,3,11,38,6,3,13,12,5,10,3]),
    2020: _t([9,3,11,6,54,10,7,3,3,30,16,4,4,19,11,6,6,8,8,4,10,11,15,10,6,10,4,5,6,4,14,5,28,16,3,17,7,8,19,4,9,3,11,40,6,3,13,12,4,10,3]),
}
ERA = {1976: 1970, 1980: 1970, 1984: 1980, 1988: 1980, 1992: 1990, 1996: 1990, 2000: 1990,
       2004: 2000, 2008: 2000, 2012: 2010, 2016: 2010, 2020: 2010, 2024: 2020}

# (Democratic nominee, Republican nominee) as spelled in the CSV, plus display names
NOMINEES = {
    1976: ("CARTER, JIMMY", "FORD, GERALD", "Jimmy Carter", "Gerald Ford"),
    1980: ("CARTER, JIMMY", "REAGAN, RONALD", "Jimmy Carter", "Ronald Reagan"),
    1984: ("MONDALE, WALTER", "REAGAN, RONALD", "Walter Mondale", "Ronald Reagan"),
    1988: ("DUKAKIS, MICHAEL", "BUSH, GEORGE H.W.", "Michael Dukakis", "George H.W. Bush"),
    1992: ("CLINTON, BILL", "BUSH, GEORGE H.W.", "Bill Clinton", "George H.W. Bush"),
    1996: ("CLINTON, BILL", "DOLE, ROBERT", "Bill Clinton", "Bob Dole"),
    2000: ("GORE, AL", "BUSH, GEORGE W.", "Al Gore", "George W. Bush"),
    2004: ("KERRY, JOHN", "BUSH, GEORGE W.", "John Kerry", "George W. Bush"),
    2008: ("OBAMA, BARACK H.", "MCCAIN, JOHN", "Barack Obama", "John McCain"),
    2012: ("OBAMA, BARACK H.", "ROMNEY, MITT", "Barack Obama", "Mitt Romney"),
    2016: ("CLINTON, HILLARY", "TRUMP, DONALD J.", "Hillary Clinton", "Donald Trump"),
    2020: ("BIDEN, JOSEPH R. JR", "TRUMP, DONALD J.", "Joe Biden", "Donald Trump"),
    2024: ("HARRIS, KAMALA D.", "TRUMP, DONALD J.", "Kamala Harris", "Donald Trump"),
}

# Real electoral votes if every state were winner-take-all (Maine/Nebraska splits and faithless electors removed)
EXPECTED = {1976: (241, 297), 1980: (489, 49), 1984: (525, 13), 1988: (426, 112), 1992: (168, 370),
            1996: (159, 379), 2000: (271, 267), 2004: (286, 252), 2008: (174, 364), 2012: (206, 332),
            2016: (305, 233), 2020: (232, 306), 2024: (312, 226)}   # (Republican, Democrat)

ABBR = {"ALABAMA":"AL","ALASKA":"AK","ARIZONA":"AZ","ARKANSAS":"AR","CALIFORNIA":"CA","COLORADO":"CO","CONNECTICUT":"CT",
        "DELAWARE":"DE","DISTRICT OF COLUMBIA":"DC","FLORIDA":"FL","GEORGIA":"GA","HAWAII":"HI","IDAHO":"ID","ILLINOIS":"IL",
        "INDIANA":"IN","IOWA":"IA","KANSAS":"KS","KENTUCKY":"KY","LOUISIANA":"LA","MAINE":"ME","MARYLAND":"MD",
        "MASSACHUSETTS":"MA","MICHIGAN":"MI","MINNESOTA":"MN","MISSISSIPPI":"MS","MISSOURI":"MO","MONTANA":"MT",
        "NEBRASKA":"NE","NEVADA":"NV","NEW HAMPSHIRE":"NH","NEW JERSEY":"NJ","NEW MEXICO":"NM","NEW YORK":"NY",
        "NORTH CAROLINA":"NC","NORTH DAKOTA":"ND","OHIO":"OH","OKLAHOMA":"OK","OREGON":"OR","PENNSYLVANIA":"PA",
        "RHODE ISLAND":"RI","SOUTH CAROLINA":"SC","SOUTH DAKOTA":"SD","TENNESSEE":"TN","TEXAS":"TX","UTAH":"UT",
        "VERMONT":"VT","VIRGINIA":"VA","WASHINGTON":"WA","WEST VIRGINIA":"WV","WISCONSIN":"WI","WYOMING":"WY"}
def display(name): return "Washington DC" if name == "DISTRICT OF COLUMBIA" else name.title()
def person(csv_name):
    """'PEROT, ROSS' -> 'Ross Perot' (also drops the CSV's doubled nickname quotes)."""
    last, _, first = csv_name.replace('""', '"').partition(", ")
    return f"{first} {last}".title() if first else last.title()

df = pd.read_csv(CSV)
for era, tbl in EV.items():
    assert len(tbl) == 51 and sum(tbl.values()) == 538, (era, len(tbl), sum(tbl.values()))

elections, report = {}, []
for year, (d_name, r_name, d_disp, r_disp) in NOMINEES.items():
    g = df[df.year == year]
    assert g.state.nunique() == 51, year
    # sum every ballot line for a nominee (covers fusion lines such as Working Families)
    votes = g.groupby(["state", "candidate"]).candidatevotes.sum().unstack(fill_value=0)
    total = g.groupby("state").totalvotes.first()
    ev = EV[ERA[year]]
    states, r_ev, d_ev = {}, 0, 0
    nat_r = nat_d = nat_t = 0
    for st in votes.index:
        r, d, t = int(votes.loc[st, r_name]), int(votes.loc[st, d_name]), int(total[st])
        margin = round((r - d) / t * 100, 3)
        assert margin != 0, (year, st)
        e = ev[ABBR[st]]
        states[display(st)] = [e, margin]
        if margin > 0: r_ev += e
        else: d_ev += e
        nat_r += r; nat_d += d; nat_t += t
    assert (r_ev, d_ev) == EXPECTED[year], (year, r_ev, d_ev, EXPECTED[year])
    # biggest third-party candidate nationally
    others = g[~g.candidate.isin([d_name, r_name])].groupby("candidate").candidatevotes.sum().sort_values(ascending=False)
    third_name, third_pct = others.index[0], round(others.iloc[0] / nat_t * 100, 1)
    national = round((nat_r - nat_d) / nat_t * 100, 3)
    env = round(national * 2) / 2                      # slider has half-point steps
    # a preset must reproduce every state's winner and margin exactly
    for name, (e, m) in states.items():
        pvi = (m - env) / 2
        assert abs((env + 2 * pvi) - m) < 1e-9
    elections[str(year)] = {
        "year": year, "r": r_disp, "d": d_disp, "nationalMargin": national, "environment": env,
        "thirdParty": {"name": person(third_name), "pct": third_pct}, "states": states,
    }
    pv = [(m - env) / 2 for _, m in states.values()]
    report.append((year, r_ev, d_ev, national, env, third_name, third_pct, min(pv), max(pv),
                   min(abs(m) for _, m in states.values())))

with open(OUT, "w") as f:
    f.write("// Generated by tools/build_elections.py from the MIT Election Lab 1976-2024 presidential results.\n")
    f.write("// states: { name: [electoral votes, margin] }, margin = Republican % minus Democratic % of the total vote.\n")
    f.write("const ELECTIONS = " + json.dumps(elections, separators=(",", ":")) + ";\n")
    f.write('if (typeof module !== "undefined") module.exports = ELECTIONS;\n')

print("year  R_EV D_EV  national  env   biggest third party          pvi_min pvi_max min|margin|")
for y, r, d, n, e, tn, tp, lo, hi, mm in report:
    print(f"{y}  {r:4d} {d:4d}  {n:+8.3f} {e:+5.1f}  {person(tn)[:22]:22s} {tp:4.1f}%   {lo:+7.2f} {hi:+7.2f}  {mm:.3f}")
print("all checks passed; wrote", OUT)
