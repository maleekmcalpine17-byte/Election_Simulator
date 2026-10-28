"""
Builds elections.js (the historical presets for every presidential election from 1828 to 2024).

Usage:   python tools/build_elections.py path/to/1976-2024-president.csv path/to/elec.csv

Sources:
  1976-2024  Republican and Democratic votes: MIT Election Data and Science Lab, U.S. President 1976-2024.
  1828-1972  every candidate: elec.csv from github.com/zonination/election-history.
  Third parties 1980-2016 come from elec.csv (MIT's rows for them are incomplete in some states); 2020 from MIT.
  Elections before 1828 had no popular vote in most states, so they can't be simulated and are not included.

Each election has up to four vote-share slots: R (Republican, or the Whig / National Republican side before 1856),
D (Democrat), T1 and T2 (the two biggest third-party candidates). Anything else is "others". A state record is
[electoral votes, R%, D%, T1%, T2%] plus, only where real electors were split, [electors per slot R, D, T1, T2, other];
electors chosen by a state legislature are [electoral votes, null, slot].

The script checks everything and refuses to write the file if a check fails: all shares add up, every candidate's
electoral votes equal the historical record, and the winner of every state follows from the shares.
"""
import csv
import json
import sys

import pandas as pd

CSV = sys.argv[1] if len(sys.argv) > 1 else "1976-2024-president.csv"
HIST_CSV = sys.argv[2] if len(sys.argv) > 2 else "elec.csv"
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



SLOTS = ["R", "D", "T1", "T2", "O"]            # slot index 0..4; O = others (faithless or scattered electors)
IDX = {s: i for i, s in enumerate(SLOTS)}

# ---------------------------------------------------------------------------------------------
# Candidates. cols = which slot each of elec.csv's four candidate columns is (columns follow the national finish).
# ---------------------------------------------------------------------------------------------
def C(name, party, abbr): return {"name": name, "party": party, "abbr": abbr}
R_, D_, W_, NR_ = ("Republican", "R"), ("Democratic", "D"), ("Whig", "W"), ("National Republican", "NR")

HIST = {  # year: (cols, R cand, D cand, T1 cand, T2 cand)
    1828: (["D", "R"], C("John Quincy Adams", *NR_), C("Andrew Jackson", *D_), None, None),
    1832: (["D", "R", "T1"], C("Henry Clay", *NR_), C("Andrew Jackson", *D_), C("William Wirt", "Anti-Masonic", "Wirt"), None),
    1836: (["D", "R", "T1", "T2"], C("William Henry Harrison", *W_), C("Martin Van Buren", *D_),
           C("Hugh White", "Whig", "White"), C("Daniel Webster", "Whig", "Webster")),
    1840: (["R", "D"], C("William Henry Harrison", *W_), C("Martin Van Buren", *D_), None, None),
    1844: (["D", "R"], C("Henry Clay", *W_), C("James K. Polk", *D_), None, None),
    1848: (["R", "D", "T1"], C("Zachary Taylor", *W_), C("Lewis Cass", *D_), C("Martin Van Buren", "Free Soil", "Van Buren"), None),
    1852: (["D", "R", "T1"], C("Winfield Scott", *W_), C("Franklin Pierce", *D_), C("John Hale", "Free Soil", "Hale"), None),
    1856: (["D", "R", "T1"], C("John C. Frémont", *R_), C("James Buchanan", *D_), C("Millard Fillmore", "American (Know-Nothing)", "Fillmore"), None),
    1860: (["R", "D", "T1", "T2"], C("Abraham Lincoln", *R_), C("Stephen Douglas", "Northern Democratic", "D"),
           C("John Breckinridge", "Southern Democratic", "Breckinridge"), C("John Bell", "Constitutional Union", "Bell")),
    1864: (["R", "D"], C("Abraham Lincoln", *R_), C("George McClellan", *D_), None, None),
    1868: (["R", "D"], C("Ulysses Grant", *R_), C("Horatio Seymour", *D_), None, None),
    1872: (["R", "D"], C("Ulysses Grant", *R_), C("Horace Greeley", *D_), None, None),
    1876: (["R", "D"], C("Rutherford Hayes", *R_), C("Samuel Tilden", *D_), None, None),
    1880: (["R", "D"], C("James Garfield", *R_), C("Winfield Hancock", *D_), None, None),
    1884: (["D", "R"], C("James Blaine", *R_), C("Grover Cleveland", *D_), None, None),
    1888: (["R", "D"], C("Benjamin Harrison", *R_), C("Grover Cleveland", *D_), None, None),
    1892: (["D", "R", "T1"], C("Benjamin Harrison", *R_), C("Grover Cleveland", *D_), C("James Weaver", "Populist", "Weaver"), None),
    1896: (["R", "D"], C("William McKinley", *R_), C("William Jennings Bryan", *D_), None, None),
    1900: (["R", "D"], C("William McKinley", *R_), C("William Jennings Bryan", *D_), None, None),
    1904: (["R", "D"], C("Theodore Roosevelt", *R_), C("Alton Parker", *D_), None, None),
    1908: (["R", "D"], C("William Taft", *R_), C("William Jennings Bryan", *D_), None, None),
    1912: (["D", "T1", "R", "T2"], C("William Taft", *R_), C("Woodrow Wilson", *D_),
           C("Theodore Roosevelt", "Progressive (Bull Moose)", "Roosevelt"), C("Eugene Debs", "Socialist", "Debs")),
    1916: (["D", "R"], C("Charles Hughes", *R_), C("Woodrow Wilson", *D_), None, None),
    1920: (["R", "D"], C("Warren Harding", *R_), C("James Cox", *D_), None, None),
    1924: (["R", "D", "T1"], C("Calvin Coolidge", *R_), C("John Davis", *D_), C("Robert La Follette", "Progressive", "La Follette"), None),
    1928: (["R", "D"], C("Herbert Hoover", *R_), C("Al Smith", *D_), None, None),
    1932: (["D", "R"], C("Herbert Hoover", *R_), C("Franklin Roosevelt", *D_), None, None),
    1936: (["D", "R"], C("Alf Landon", *R_), C("Franklin Roosevelt", *D_), None, None),
    1940: (["D", "R"], C("Wendell Willkie", *R_), C("Franklin Roosevelt", *D_), None, None),
    1944: (["D", "R"], C("Thomas Dewey", *R_), C("Franklin Roosevelt", *D_), None, None),
    1948: (["D", "R", "T1"], C("Thomas Dewey", *R_), C("Harry Truman", *D_), C("Strom Thurmond", "States' Rights Democratic (Dixiecrat)", "Thurmond"), None),
    1952: (["R", "D"], C("Dwight Eisenhower", *R_), C("Adlai Stevenson", *D_), None, None),
    1956: (["R", "D"], C("Dwight Eisenhower", *R_), C("Adlai Stevenson", *D_), None, None),
    1960: (["D", "R"], C("Richard Nixon", *R_), C("John F. Kennedy", *D_), C("Harry Byrd (unpledged electors)", "Unpledged Democrats", "Byrd"), None),
    1964: (["D", "R"], C("Barry Goldwater", *R_), C("Lyndon Johnson", *D_), None, None),
    1968: (["R", "D", "T1"], C("Richard Nixon", *R_), C("Hubert Humphrey", *D_), C("George Wallace", "American Independent", "Wallace"), None),
    1972: (["R", "D"], C("Richard Nixon", *R_), C("George McGovern", *D_), None, None),
}
# 1976-2024: (MIT Democratic name, MIT Republican name, R cand, D cand, T1 cand, elec.csv column of T1 or "MIT:<name>")
MIT = {
    1976: ("CARTER, JIMMY", "FORD, GERALD", C("Gerald Ford", *R_), C("Jimmy Carter", *D_), None, None),
    1980: ("CARTER, JIMMY", "REAGAN, RONALD", C("Ronald Reagan", *R_), C("Jimmy Carter", *D_), C("John Anderson", "Independent", "Anderson"), 2),
    1984: ("MONDALE, WALTER", "REAGAN, RONALD", C("Ronald Reagan", *R_), C("Walter Mondale", *D_), None, None),
    1988: ("DUKAKIS, MICHAEL", "BUSH, GEORGE H.W.", C("George H.W. Bush", *R_), C("Michael Dukakis", *D_), None, None),
    1992: ("CLINTON, BILL", "BUSH, GEORGE H.W.", C("George H.W. Bush", *R_), C("Bill Clinton", *D_), C("Ross Perot", "Independent", "Perot"), 2),
    1996: ("CLINTON, BILL", "DOLE, ROBERT", C("Bob Dole", *R_), C("Bill Clinton", *D_), C("Ross Perot", "Reform", "Perot"), 2),
    2000: ("GORE, AL", "BUSH, GEORGE W.", C("George W. Bush", *R_), C("Al Gore", *D_), C("Ralph Nader", "Green", "Nader"), 2),
    2004: ("KERRY, JOHN", "BUSH, GEORGE W.", C("George W. Bush", *R_), C("John Kerry", *D_), None, None),
    2008: ("OBAMA, BARACK H.", "MCCAIN, JOHN", C("John McCain", *R_), C("Barack Obama", *D_), None, None),
    2012: ("OBAMA, BARACK H.", "ROMNEY, MITT", C("Mitt Romney", *R_), C("Barack Obama", *D_), None, None),
    2016: ("CLINTON, HILLARY", "TRUMP, DONALD J.", C("Donald Trump", *R_), C("Hillary Clinton", *D_), C("Gary Johnson", "Libertarian", "Johnson"), 2),
    2020: ("BIDEN, JOSEPH R. JR", "TRUMP, DONALD J.", C("Donald Trump", *R_), C("Joe Biden", *D_), C("Jo Jorgensen", "Libertarian", "Jorgensen"), "JORGENSEN, JO"),
    2024: ("HARRIS, KAMALA D.", "TRUMP, DONALD J.", C("Donald Trump", *R_), C("Kamala Harris", *D_), None, None),
}

# Real electoral votes per slot [R, D, T1, T2, O], counted as pledged (a faithless elector counts for the candidate
# they were pledged to; see FIXES). 1976+ is counted winner-take-all by state (Maine and Nebraska aren't split).
EXPECTED = {
    1828: [83, 178, 0, 0, 0], 1832: [49, 219, 7, 0, 11], 1836: [73, 170, 26, 14, 11], 1840: [234, 60, 0, 0, 0],
    1844: [105, 170, 0, 0, 0], 1848: [163, 127, 0, 0, 0], 1852: [42, 254, 0, 0, 0], 1856: [114, 174, 8, 0, 0],
    1860: [180, 12, 72, 39, 0], 1864: [212, 21, 0, 0, 0], 1868: [214, 80, 0, 0, 0], 1872: [300, 66, 0, 0, 0],
    1876: [185, 184, 0, 0, 0], 1880: [214, 155, 0, 0, 0], 1884: [182, 219, 0, 0, 0], 1888: [233, 168, 0, 0, 0],
    1892: [145, 277, 22, 0, 0], 1896: [271, 176, 0, 0, 0], 1900: [292, 155, 0, 0, 0], 1904: [336, 140, 0, 0, 0],
    1908: [321, 162, 0, 0, 0], 1912: [8, 435, 88, 0, 0], 1916: [254, 277, 0, 0, 0], 1920: [404, 127, 0, 0, 0],
    1924: [382, 136, 13, 0, 0], 1928: [444, 87, 0, 0, 0], 1932: [59, 472, 0, 0, 0], 1936: [8, 523, 0, 0, 0],
    1940: [82, 449, 0, 0, 0], 1944: [99, 432, 0, 0, 0], 1948: [189, 304, 38, 0, 0], 1952: [442, 89, 0, 0, 0],
    1956: [457, 74, 0, 0, 0], 1960: [220, 303, 14, 0, 0], 1964: [52, 486, 0, 0, 0], 1968: [302, 191, 45, 0, 0],
    1972: [521, 17, 0, 0, 0],
    1976: [241, 297, 0, 0, 0], 1980: [489, 49, 0, 0, 0], 1984: [525, 13, 0, 0, 0], 1988: [426, 112, 0, 0, 0],
    1992: [168, 370, 0, 0, 0], 1996: [159, 379, 0, 0, 0], 2000: [271, 267, 0, 0, 0], 2004: [286, 252, 0, 0, 0],
    2008: [174, 364, 0, 0, 0], 2012: [206, 332, 0, 0, 0], 2016: [305, 233, 0, 0, 0], 2020: [232, 306, 0, 0, 0],
    2024: [312, 226, 0, 0, 0],
}
# The file lists only electors who voted for a candidate. Add them back, or move electors, as pledged:
#   1948 Tennessee: 1 Truman elector voted Thurmond.  1956 Alabama: 1 Stevenson elector voted Walter Jones.
#   1960: Mississippi (8) and Alabama (6) had unpledged electors, counted for Harry Byrd; 1 Nixon elector in
#         Oklahoma voted Byrd.  1968 North Carolina: 1 Nixon elector voted Wallace.  1972 Virginia: 1 Nixon elector voted Hospers.
#   1872: Greeley died before the electors met; his 66 pledged electors (GA, KY, MD, MO, TN, TX) are counted for him,
#         and Arkansas and Louisiana (14), which Congress didn't count, are counted for the popular winner, Grant.
FIXES = {
    (1948, "Tennessee"): {"D": +1, "T1": -1}, (1956, "Alabama"): {"D": +1}, (1960, "Mississippi"): {"T1": +8},
    (1960, "Alabama"): {"T1": +6}, (1960, "Oklahoma"): {"R": +1}, (1968, "North Carolina"): {"R": +1, "T1": -1},
    (1972, "Virginia"): {"R": +1},
    (1872, "Georgia"): {"D": +11}, (1872, "Kentucky"): {"D": +12}, (1872, "Maryland"): {"D": +8}, (1872, "Missouri"): {"D": +15},
    (1872, "Tennessee"): {"D": +12}, (1872, "Texas"): {"D": +8}, (1872, "Arkansas"): {"R": +6}, (1872, "Louisiana"): {"R": +8},
}
# Legislature-chosen South Carolina in 1832 and 1836 went to Floyd and Mangum, who are not in the four columns
FIXED_SLOT = {(1832, "South Carolina"): "O", (1836, "South Carolina"): "O"}
# Mississippi 1960: the unpledged electors won; the file lists only Kennedy and Nixon, so their share is what's left
REMAINDER_T1 = {(1960, "Mississippi")}
NOTES = {
    1872: "Greeley died before the electors met and his electors scattered; his 66 pledged electors are counted for him here. Congress didn't count Arkansas and Louisiana (14 electors); they are counted here for Grant, who won both.",
    1896: "The source's Democratic national total is 2.1% below the official one, so some state margins may be understated.",
    1960: "Unpledged electors in Mississippi (8) and Alabama (6) are counted for Harry Byrd; a faithless Oklahoma elector is counted for Nixon.",
    1948: "A faithless Tennessee elector is counted for Truman, the candidate he was pledged to.",
    1968: "A faithless North Carolina elector is counted for Nixon, the candidate he was pledged to.",
    1956: "A faithless Alabama elector is counted for Stevenson, the candidate he was pledged to.",
    1972: "A faithless Virginia elector is counted for Nixon, the candidate he was pledged to.",
    1832: "South Carolina's electors, chosen by its legislature, voted for John Floyd (11 electors, shown as 'others'). Two Maryland electors didn't vote.",
    1836: "South Carolina's electors, chosen by its legislature, voted for Willie Mangum (11 electors, shown as 'others'). The Whigs ran three regional candidates.",
    1860: "Douglas is the Democratic slot; Breckinridge (Southern Democrats) and Bell are the third-party slots.",
}
# MIT's South Carolina 1992 row lists Clinton at 525,514; the real figure is 479,514 (39.9%), as in elec.csv
MIT_OVERRIDE = {(1992, "South Carolina")}


NAME_FIX = {"Dist. of Col.": "Washington DC", "Washington D.C.": "Washington DC", "District of Columbia": "Washington DC"}
STATE_NAMES = {display(n) for n in ABBR}


def num(x):
    x = x.replace("\xa0", "").replace("%", "").replace("*", "").strip()
    return float(x) if x else None


def load_hist(path):
    rows = list(csv.reader(open(path, encoding="utf-8", newline="")))[1:]
    out = {}
    for r in rows:
        assert len(r) == 17, r[:2]
        year = int(r[0][:4])
        cols = [{"v": num(r[3 + 3 * i]), "ev": num(r[5 + 3 * i])} for i in range(4)]
        out.setdefault(year, []).append({"state": NAME_FIX.get(r[1].strip(), r[1].strip()), "total": num(r[2]),
                                         "cols": cols, "party": r[15].strip(), "notes": r[16].strip()})
    for y, rs in out.items():
        for r in rs:
            assert r["state"] in STATE_NAMES, (y, r["state"])
    return out


def r3(x): return round(x, 3)


def finish(year, states, cand, nat_votes, env_votes, ev_expected, absent_from):
    """Common checks and packaging. states: name -> record. nat_votes: [R, D, T1, T2, total] summed over popular-vote states."""
    totals = [0] * 5
    for name, rec in states.items():
        if rec[1] is None:                                    # legislature-chosen
            totals[rec[2]] += rec[0]
            continue
        ev, shares = rec[0], rec[1:5]
        assert min(shares) >= 0 and sum(shares) <= 100.02, (year, name, shares)
        order = sorted(range(4), key=lambda i: -shares[i])
        assert shares[order[0]] - shares[order[1]] > 0, (year, name, "dead heat")
        win = order[0]
        evs = rec[5] if len(rec) > 5 else None
        assert evs is None or sum(evs) == ev, (year, name, evs, ev)
        for i in range(5):
            totals[i] += evs[i] if evs else (ev if i == win else 0)
    assert totals == ev_expected, (year, totals, ev_expected)
    nat_m2 = (nat_votes[0] - nat_votes[1]) / (nat_votes[0] + nat_votes[1]) * 100
    env = round(nat_m2 * 2) / 2
    nat_t = [nat_votes[2] / nat_votes[4] * 100, nat_votes[3] / nat_votes[4] * 100]
    absent = sorted(STATE_NAMES - set(states))
    e = {"year": year, "cand": {k: v for k, v in zip(["r", "d", "t1", "t2"], cand) if v}, "nationalMargin": r3(nat_m2),
         "environment": env, "nat": [r3(nat_t[0]), r3(nat_t[1])], "absent": absent, "states": states}
    if year in NOTES: e["note"] = NOTES[year]
    return e


def build_hist(year, rows):
    cols, rc, dc, t1c, t2c = HIST[year]
    colslot = cols + [None] * (4 - len(cols))
    # cross-check R and D columns against the party labels of the states each column won
    import collections
    tally = [collections.Counter() for _ in range(4)]
    for r in rows:
        if r["notes"] or r["total"] is None: continue
        vs = [c["v"] if c["v"] is not None else -1 for c in r["cols"]]
        tally[max(range(4), key=lambda i: vs[i])][r["party"]] += 1
    if year not in (1860,):
        rl = max(range(4), key=lambda i: tally[i]["Republican"]); dl = max(range(4), key=lambda i: tally[i]["Democratic"])
        if year >= 1856:
            assert colslot[rl] == "R" and colslot[dl] == "D", (year, "R/D columns disagree with party labels", colslot, rl, dl)
    states, nat = {}, [0, 0, 0, 0, 0]
    for r in rows:
        name = r["state"]
        if r["notes"]:
            assert "legislature" in r["notes"].lower(), (year, name, r["notes"])
            vs = [c["v"] or 0 for c in r["cols"]]
            w = max(range(4), key=lambda i: vs[i])
            slot = FIXED_SLOT.get((year, name)) or colslot[w]
            assert slot, (year, name)
            states[name] = [int(vs[w]), None, IDX[slot]]
            continue
        v = [0.0] * 4
        evs = [0] * 5
        for i, c in enumerate(r["cols"]):
            s = colslot[i]
            if s is None:
                assert not (c["v"] or 0) and not (c["ev"] or 0), (year, name, "data in an unused column")
                continue
            v[IDX[s]] = c["v"] or 0
            evs[IDX[s]] += int(c["ev"] or 0)
        for s, d in FIXES.get((year, name), {}).items():
            evs[IDX[s]] += d
        total = r["total"]
        if (year, name) in REMAINDER_T1:
            v[2] = total - v[0] - v[1]
        assert total and sum(v) <= total * 1.0002, (year, name, sum(v), total)
        ev = sum(evs)
        assert ev > 0, (year, name, "no electoral votes")
        sh = [r3(x / total * 100) for x in v]
        win = max(range(4), key=lambda i: sh[i])
        rec = [ev] + sh
        if evs[win] != ev:
            rec.append(evs)
        states[name] = rec
        for i in range(4): nat[i] += v[i]
        nat[4] += total
    return finish(year, states, [rc, dc, t1c, t2c], nat, None, EXPECTED[year], None)


def build_mit(df, hist, year):
    d_name, r_name, rc, dc, t1c, t1src = MIT[year]
    g = df[df.year == year]
    assert g.state.nunique() == 51, year
    votes = g.groupby(["state", "candidate"]).candidatevotes.sum().unstack(fill_value=0)
    total = g.groupby("state").totalvotes.first()
    ev = EV[ERA[year]]
    # third-party votes
    t1 = {}
    if t1c:
        if isinstance(t1src, int):
            hr = hist[year]
            for r in hr:
                t1[r["state"]] = r["cols"][t1src]["v"] or 0
        else:
            for st in votes.index:
                t1[display(st)] = int(votes.loc[st, t1src])
    states, nat = {}, [0, 0, 0, 0, 0]
    hsc = {r["state"]: r for r in hist.get(year, [])}
    for st in votes.index:
        name = display(st)
        r, d, t = int(votes.loc[st, r_name]), int(votes.loc[st, d_name]), int(total[st])
        if (year, name) in MIT_OVERRIDE:                       # use elec.csv for this state's R, D and total
            row = hsc[name]
            cl = {"R": None, "D": None}
            cols = HIST_COLS_FOR_MIT[year]
            r, d, t = int(row["cols"][cols["R"]]["v"]), int(row["cols"][cols["D"]]["v"]), int(row["total"])
        tv = t1.get(name, 0)
        sh = [r3(r / t * 100), r3(d / t * 100), r3(tv / t * 100), 0.0]
        win = max(range(4), key=lambda i: sh[i])
        states[name] = [ev[ABBR[st]]] + sh
        nat[0] += r; nat[1] += d; nat[2] += tv; nat[4] += t
    return finish(year, states, [rc, dc, t1c, None], nat, None, EXPECTED[year], None)


# which elec.csv column is R / D in the years MIT overrides one state from (1992: Clinton col0, Bush col1)
HIST_COLS_FOR_MIT = {1992: {"D": 0, "R": 1}}

df = pd.read_csv(CSV)
hist = load_hist(HIST_CSV)
for _y, (_c, *_x) in HIST.items():
    assert _y in hist, _y
for era, tbl in EV.items():
    assert len(tbl) == 51 and sum(tbl.values()) == 538, (era, len(tbl), sum(tbl.values()))
# the 1992 override must be what the file says
_sc = next(r for r in hist[1992] if r["state"] == "South Carolina")
assert (int(_sc["cols"][1]["v"]), int(_sc["cols"][0]["v"]), int(_sc["total"])) == (577507, 479514, 1202527)

elections = {}
for year in sorted(HIST):
    elections[str(year)] = build_hist(year, hist[year])
for year in sorted(MIT):
    elections[str(year)] = build_mit(df, hist, year)
assert len(elections) == 50

with open(OUT, "w") as f:
    f.write("// Generated by tools/build_elections.py (MIT Election Lab 1976-2024; elec.csv from zonination/election-history for 1828-1972).\n")
    f.write("// state: [electors, R%, D%, T1%, T2%] (+ per-slot electors where split); [electors, null, slot] if chosen by a legislature.\n")
    f.write("// slots: 0 R (or Whig/National Republican), 1 D, 2 T1, 3 T2, 4 others.\n")
    f.write("const ELECTIONS = " + json.dumps(elections, separators=(",", ":"), ensure_ascii=False) + ";\n")
    f.write('if (typeof module !== "undefined") module.exports = ELECTIONS;\n')

print("year  R/D/T1/T2/other electors      national M2  env   third-party nat%   absent")
for y in sorted(elections, key=int):
    e = elections[y]
    tot = [0] * 5
    for rec in e["states"].values():
        if rec[1] is None: tot[rec[2]] += rec[0]
        else:
            sh = rec[1:5]; w = max(range(4), key=lambda i: sh[i])
            for i in range(5): tot[i] += rec[5][i] if len(rec) > 5 else (rec[0] if i == w else 0)
    print(f"{y}  {str(tot):28s} {e['nationalMargin']:+8.2f} {e['environment']:+5.1f}   {e['nat']}   {len(e['absent'])}")
print("all checks passed; wrote", OUT)
