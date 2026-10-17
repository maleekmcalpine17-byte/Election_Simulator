# Election Game 2024

## Run the web UI (VS Code Live Server)
1. Open this folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` -> "Open with Live Server".

## Run the Streamlit version
    pip install -r requirements.txt
    streamlit run election_game.py

## Election presets (web UI)
The "Election" dropdown at the top loads a real presidential election (or "Current day"). A preset sets each
state's real electoral votes and lean, the national environment, and the nominees' names. Candidates start at a
typical profile with equal approval and no home state, so running a preset as-is reproduces that election's real
winner and margin in every state, and the real electoral vote total. Then move any slider to ask "what if".

**Elections included (33):** 1864, 1868, 1876, 1880, 1884, 1888, 1900, 1904, 1908, 1916, 1920, 1928, 1932,
1936, 1940, 1944, 1952, 1956, 1964, 1972, and every election from 1976 to 2024.

**Left out on purpose:** 1856, 1860, 1892, 1912, 1924, 1948 and 1968 (third-party candidates won states, which a
two-candidate game can't represent), 1872 (Greeley died and his electors scattered), 1896 (the data's Democratic
national total is 2.1% below the official one), and 1960 (unpledged electors). Elections before 1856 have no
Republican Party, so they aren't included either.

How the special cases work:
- States that didn't exist yet, DC before 1964, and the Confederacy in 1864 and 1868 are simply left out.
- Florida in 1868 and Colorado in 1876 had no popular vote (the legislature chose the electors), so their
  electoral votes are fixed to the real winner and they can't be edited.
- Where real electors were split (Maryland 1904 and 1908, West Virginia 1916, California 1880), the real split is
  kept until you flip that state, after which it is winner-take-all.
- 1956 Alabama and 1972 Virginia each had one faithless elector, counted for the candidate they were pledged to.
- From 1976 on, Maine and Nebraska aren't split (winner-take-all by state).
- Margins are Republican % minus Democratic % of the votes counted. Elections with strong third-party showings
  (1980, 1992, 1996, 1904, 1908, 1920) say so in the preset note.
- State issue stances are the same current estimates in every preset (there is no historical data for them), and the
  real candidates' stances are already baked into each state's real result. Presets are a faithful starting point for
  what-ifs, not predictions.

**Data and accuracy**
- 1976-2024: MIT Election Data and Science Lab, U.S. President 1976-2024. Its South Carolina 1992 row lists Clinton at
  525,514 votes; the real figure is 479,514, so that one state uses the other file's numbers (R+8.1, not R+4.2).
- Before 1976: elec.csv from github.com/zonination/election-history (American Presidency Project and National
  Archives data). Checked two ways: electoral votes match the historical record exactly in every included election,
  and national popular vote totals are within about 0.5% of the official figures. For 1976-2016, where both files
  overlap, the state margins differ by 0.03 points on average and up to about 1 point in a few small states, because
  MIT counts write-ins in the total and elec.csv mostly doesn't. Treat pre-1976 margins as accurate to roughly a point.
- To rebuild `elections.js`:
  `python tools/build_elections.py path/to/1976-2024-president.csv path/to/elec.csv`
  It refuses to write the file if any check fails.
- The Streamlit version does not have presets yet; it only has the "current day" mode.

## How margins work
Margins are in percentage points (R minus D), shown like `R+6.2` / `D+3.1`:

    margin = national environment + national swing from approval
           + 2 x state PVI
           + 0.5 x (how much better Candidate 1 fits the state than Candidate 2,
                    compared with a typical Republican vs. a typical Democrat)

- **PVI**: in "Current day" each state starts at its 2025 Cook PVI (2020 + 2024 elections), source: The Cook Political Report.
  PVI is a lean in two-party vote share, so the lean in margin is double it (Texas R+6 -> about R+12 before
  candidates and approval).
- **Typical profiles**: the candidate sliders now start on a typical Republican / typical Democrat. With both
  at those profiles and equal approval, every state's margin is exactly 2 x its PVI. Moving a slider away from
  typical moves margins; stances far from the center cost votes.
- **Approval**: every point of approval gap (Candidate 1 minus Candidate 2) moves every state by 0.25 points.
- **National environment**: a slider from D+30 to R+30 (half-point steps, default EVEN) that shifts every
  state by the same amount, before candidate and approval effects. For reference, 2024 was about R+1.5 and
  2020 about D+4.5. With the typical candidates, R+1.5 gives 312-226 for the Republican.
- **Home states**: each candidate has an optional "Home state" dropdown (default None). In their home state
  they gain 4 issue-score points, the same bonus as the original console game, which is 2.0 points of margin.
- **Ties**: a margin of exactly 0.0 (EVEN) is decided at random, as before.

## State Settings
Open "State Settings (PVI & stances)", pick a state, and change its PVI or any of its five stances with the
sliders (e.g. Texas immigration 8 -> 4, or Texas PVI R+6 -> R+3). Edits are kept for all states until you press
"Reset this state", "Reset all states", or "Restart Game". Edits are measured against the original state data,
so lowering Texas's immigration stance helps whichever candidate is closer to the new stance.

## Tuning
All constants are at the top of the model section (`election_game.py`) and in `script.js`:
`TYPICAL_R`, `TYPICAL_D`, `HOME_STATE_BONUS`, `POINTS_TO_MARGIN`, `PVI_TO_MARGIN`, `APPROVAL_TO_MARGIN`.
These are rough calibrations, not a fitted forecast model. Keep both files in sync if you change them.
