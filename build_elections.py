"""
Builds elections.js (the historical presets) from the MIT Election Lab file
"1976-2024-president.csv" (U.S. President, state-level results).

Usage:   python tools/build_elections.py path/to/1976-2024-president.csv [path/to/elec.csv]

The second (optional) file is zonination/election-history's elec.csv and adds the elections before 1976 that
pass the checks below. The MIT file is used for 1976-2024 and wins wherever both files cover a year.

For every election it checks (and refuses to write the file if anything fails):
  - all 51 states are present and electoral votes sum to 538
  - the winner-take-all electoral vote totals equal the real results
  - a preset reproduces every state's real winner and margin
Pre-1976 elections are only included when no third-party candidate won a state and the electoral votes
(including split electors) add up to the historical record.
"""
import json
import sys

import pandas as pd

CSV = sys.argv[1] if len(sys.argv) > 1 else "1976-2024-president.csv"
HIST_CSV = sys.argv[2] if len(sys.argv) > 2 else None
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


# ======================================================================================
# Pre-1976 elections from elec.csv
# ======================================================================================
# Real nominees: year -> (Republican, Democrat). Only elections that pass every check are built.
HIST_NOMINEES = {
    1864: ("Abraham Lincoln", "George McClellan"), 1868: ("Ulysses Grant", "Horatio Seymour"),
    1876: ("Rutherford Hayes", "Samuel Tilden"), 1880: ("James Garfield", "Winfield Hancock"),
    1884: ("James Blaine", "Grover Cleveland"), 1888: ("Benjamin Harrison", "Grover Cleveland"),
    1900: ("William McKinley", "William Jennings Bryan"), 1904: ("Theodore Roosevelt", "Alton Parker"),
    1908: ("William Taft", "William Jennings Bryan"), 1916: ("Charles Hughes", "Woodrow Wilson"),
    1920: ("Warren Harding", "James Cox"), 1928: ("Herbert Hoover", "Al Smith"),
    1932: ("Herbert Hoover", "Franklin Roosevelt"), 1936: ("Alf Landon", "Franklin Roosevelt"),
    1940: ("Wendell Willkie", "Franklin Roosevelt"), 1944: ("Thomas Dewey", "Franklin Roosevelt"),
    1952: ("Dwight Eisenhower", "Adlai Stevenson"), 1956: ("Dwight Eisenhower", "Adlai Stevenson"),
    1964: ("Barry Goldwater", "Lyndon Johnson"), 1972: ("Richard Nixon", "George McGovern"),
}
# Historical electoral votes as pledged (Republican, Democrat), and the total number of electors counted
HIST_EXPECTED = {1864: (212, 21), 1868: (214, 80), 1876: (185, 184), 1880: (214, 155), 1884: (182, 219),
                 1888: (233, 168), 1900: (292, 155), 1904: (336, 140), 1908: (321, 162), 1916: (254, 277),
                 1920: (404, 127), 1928: (444, 87), 1932: (59, 472), 1936: (8, 523), 1940: (82, 449),
                 1944: (99, 432), 1952: (442, 89), 1956: (457, 74), 1964: (52, 486), 1972: (521, 17)}
HIST_TOTAL_EV = {1864: 233, 1868: 294, 1876: 369, 1880: 369, 1884: 401, 1888: 401, 1900: 447, 1904: 476, 1908: 483,
                 1916: 531, 1920: 531, 1928: 531, 1932: 531, 1936: 531, 1940: 531, 1944: 531, 1952: 531, 1956: 531,
                 1964: 538, 1972: 538}
# The file only lists electors who voted for a candidate. These two faithless electors are added back to the
# candidate they were pledged to (the state's popular-vote winner), as in the usual pledged count:
#   1956 Alabama: 1 elector voted for Walter Jones instead of Stevenson; 1972 Virginia: 1 voted Hospers, not Nixon.
HIST_EV_FIXES = {(1956, "Alabama"): 1, (1972, "Virginia"): 1}
# Excluded on purpose (reason shown in the report):
HIST_EXCLUDED = {1856: "Fillmore won Maryland", 1860: "four-way race, several states won by third candidates",
                 1872: "Greeley died before the electors met and his electors scattered; Arkansas and Louisiana uncounted",
                 1892: "Weaver won five states", 1896: "file's Democratic national total is 2.1% below the official one",
                 1912: "Roosevelt (Progressive) won six states", 1924: "La Follette won Wisconsin",
                 1948: "Thurmond won four states", 1960: "unpledged electors (Mississippi, Alabama) and Byrd electors",
                 1968: "Wallace won five states"}
HIST_NAME_FIX = {"Dist. of Col.": "Washington DC", "Washington D.C.": "Washington DC", "District of Columbia": "Washington DC"}


def _num(x):
    x = x.replace("\xa0", "").replace("%", "").replace("*", "").strip()
    return float(x) if x else None


def load_hist(path):
    import csv
    rows = list(csv.reader(open(path, encoding="utf-8", newline="")))[1:]
    out = {}
    for r in rows:
        assert len(r) == 17, r[:2]
        year = int(r[0][:4])
        cols = [{"v": _num(r[3 + 3 * i]), "ev": _num(r[5 + 3 * i])} for i in range(4)]
        out.setdefault(year, []).append({"state": HIST_NAME_FIX.get(r[1].strip(), r[1].strip()), "total": _num(r[2]),
                                         "cols": cols, "party": r[15].strip(), "notes": r[16].strip()})
    return out


def rd_columns(rows):
    """Columns are ordered by national finish, not party, so find which column is R and which is D from the
    party label of the states each column won."""
    import collections
    tally = [collections.Counter() for _ in range(4)]
    for r in rows:
        if r["notes"] or r["total"] is None:
            continue
        vs = [c["v"] if c["v"] is not None else -1 for c in r["cols"]]
        tally[max(range(4), key=lambda i: vs[i])][r["party"]] += 1
    R = max(range(4), key=lambda i: tally[i]["Republican"])
    D = max(range(4), key=lambda i: tally[i]["Democratic"])
    assert R != D
    return R, D


HIST = load_hist(HIST_CSV) if HIST_CSV else {}
STATE_NAMES = {display(n) for n in ABBR}
for _y, _rows in HIST.items():
    for _r in _rows:
        assert _r["state"] in STATE_NAMES, (_y, _r["state"])

# MIT's South Carolina 1992 row lists Clinton at 525,514; the real figure is 479,514 (39.9%), which elec.csv has
# (Bush 577,507; total 1,202,527). Use elec.csv for that one state.
MIT_OVERRIDES = {}
if 1992 in HIST:
    _R, _D = rd_columns(HIST[1992])
    _sc = next(r for r in HIST[1992] if r["state"] == "South Carolina")
    MIT_OVERRIDES[(1992, "South Carolina")] = (int(_sc["cols"][_R]["v"]), int(_sc["cols"][_D]["v"]), int(_sc["total"]))
    assert MIT_OVERRIDES[(1992, "South Carolina")] == (577507, 479514, 1202527)

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
        if (year, display(st)) in MIT_OVERRIDES:
            r, d, t = MIT_OVERRIDES[(year, display(st))]
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


# ---- pre-1976 elections ----
hist_report, hist_skipped = [], []
for year in sorted(HIST):
    if year < 1856 or year >= 1976:
        continue
    if year in HIST_EXCLUDED:
        hist_skipped.append((year, HIST_EXCLUDED[year]))
        continue
    if year not in HIST_NOMINEES:
        hist_skipped.append((year, "not built (no nominees listed)"))
        continue
    rows = HIST[year]
    R, D = rd_columns(rows)
    states, ev_r, ev_d, splits, fixed_states = {}, 0, 0, [], []
    nat_r = nat_d = nat_t = 0
    for r in rows:
        name = r["state"]
        if r["notes"]:
            assert "legislature" in r["notes"].lower(), (year, name, r["notes"])
            vs = [c["v"] or 0 for c in r["cols"]]            # for these rows the file stores the electors in the vote cells
            w = max(range(4), key=lambda i: vs[i])
            assert w in (R, D), (year, name)
            e = int(vs[w])
            states[name] = [e, None, 1 if w == R else 2]
            fixed_states.append(name)
            if w == R: ev_r += e
            else: ev_d += e
            continue
        vR, vD, t = r["cols"][R]["v"], r["cols"][D]["v"], r["total"]
        assert vR is not None and vD is not None and t, (year, name)
        # no third-party winner: R or D must lead the popular vote
        assert max(c["v"] or 0 for c in r["cols"]) in (vR, vD), (year, name, "third-party winner")
        margin = round((vR - vD) / t * 100, 3)
        assert margin != 0, (year, name)
        eR, eD = int(r["cols"][R]["ev"] or 0), int(r["cols"][D]["ev"] or 0)
        assert all((c["ev"] or 0) == 0 for i, c in enumerate(r["cols"]) if i not in (R, D)), (year, name)
        fix = HIST_EV_FIXES.get((year, name), 0)
        if fix:
            if margin > 0: eR += fix
            else: eD += fix
        e = eR + eD
        assert e > 0, (year, name, "no electoral votes recorded")
        ev_r += eR; ev_d += eD
        win_all = (eR == e) if margin > 0 else (eD == e)
        states[name] = [e, margin] if win_all else [e, margin, eR, eD]
        if not win_all:
            splits.append(name)
        nat_r += vR; nat_d += vD; nat_t += t
    assert (ev_r, ev_d) == HIST_EXPECTED[year], (year, ev_r, ev_d, HIST_EXPECTED[year])
    assert ev_r + ev_d == HIST_TOTAL_EV[year], (year, ev_r + ev_d)
    national = round((nat_r - nat_d) / nat_t * 100, 3)
    env = round(national * 2) / 2
    third = round(max(0.0, 100 - (nat_r + nat_d) / nat_t * 100), 1)
    for name, v in states.items():
        if v[1] is not None:
            assert abs((env + 2 * ((v[1] - env) / 2)) - v[1]) < 1e-9
    absent = sorted(STATE_NAMES - set(states))
    rname, dname = HIST_NOMINEES[year]
    elections[str(year)] = {
        "year": year, "r": rname, "d": dname, "nationalMargin": national, "environment": env,
        "thirdParty": {"name": "other candidates", "pct": third}, "absent": absent, "states": states,
    }
    pv = [(v[1] - env) / 2 for v in states.values() if v[1] is not None]
    hist_report.append((year, ev_r, ev_d, national, env, third, len(absent), len(fixed_states), len(splits),
                        min(pv), max(pv), min(abs(v[1]) for v in states.values() if v[1] is not None)))

with open(OUT, "w") as f:
    f.write("// Generated by tools/build_elections.py from the MIT Election Lab 1976-2024 presidential results.\n")
    f.write("// states: { name: [electoral votes, margin] }, margin = Republican % minus Democratic % of the total vote.\n")
    f.write("const ELECTIONS = " + json.dumps(elections, separators=(",", ":")) + ";\n")
    f.write('if (typeof module !== "undefined") module.exports = ELECTIONS;\n')

print("year  R_EV D_EV  national  env   biggest third party          pvi_min pvi_max min|margin|")
for y, r, d, n, e, tn, tp, lo, hi, mm in report:
    print(f"{y}  {r:4d} {d:4d}  {n:+8.3f} {e:+5.1f}  {person(tn)[:22]:22s} {tp:4.1f}%   {lo:+7.2f} {hi:+7.2f}  {mm:.3f}")
if hist_report:
    print("\nPre-1976 (elec.csv)")
    print("year  R_EV D_EV  national  env  other%  absent fixed splits  pvi_min pvi_max min|margin|")
    for y, r, d, n, e, th, na, nf, ns, lo, hi, mm in hist_report:
        print(f"{y}  {r:4d} {d:4d}  {n:+8.3f} {e:+5.1f}  {th:5.1f}  {na:5d} {nf:5d} {ns:6d}  {lo:+7.2f} {hi:+7.2f}  {mm:.3f}")
    print("excluded:", "; ".join(f"{y} ({why})" for y, why in hist_skipped))
all_pvi = [(v[1] - e["environment"]) / 2 for e in elections.values() for v in e["states"].values() if v[1] is not None]
print(f"overall PVI range across presets: {min(all_pvi):+.2f} to {max(all_pvi):+.2f};",
      f"environment range: {min(e['environment'] for e in elections.values()):+.1f} to {max(e['environment'] for e in elections.values()):+.1f}")
print("all checks passed; wrote", OUT)
