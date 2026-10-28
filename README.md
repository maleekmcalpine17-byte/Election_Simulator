# Election Game 2024

## Run the web UI (VS Code Live Server)
1. Open this folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` -> "Open with Live Server".

## Run the Streamlit version
    pip install -r requirements.txt
    streamlit run election_game.py

## Election presets and third parties (web UI)
The "Election" dropdown at the top loads any presidential election from 1828 to 2024 (50 elections), or "Current day".
A preset sets each state's real vote shares and electoral votes, the national environment, and the candidates' names.
Candidates start at a typical profile with equal approval and no home state, and third parties start at their real
vote, so running a preset as-is reproduces that election's real winner, margin and vote shares in every state, and
every candidate's real electoral vote total. Then move any slider to ask "what if".

**Third parties.** Each election has up to four candidates: Republican (or Whig / National Republican before 1856),
Democrat, and the two biggest third-party candidates (1860, 1836 and 1912 have two; 1832, 1848, 1852, 1856, 1892, 1924,
1948, 1960, 1968, 1980, 1992, 1996, 2000, 2016 and 2020 have one). In "Current day" and in elections without a real
third party you can add a hypothetical one.
- A third-party card has a name, a **national vote share** and **where their voters go**. The share starts at the real
  one. Moving it scales the candidate's vote in every state; at 0 they drop out. With no real data (a hypothetical
  candidate) the share is spread evenly over every state.
- Votes a third party loses go to the Republican and Democrat, and votes it gains come from them. By default this is in
  proportion to each state's major-party vote (which never changes who wins). Move the "% who pick the Republican" slider
  to model a spoiler: with Nader out and 75% of his voters going to Gore, Florida and New Hampshire flip and Gore wins
  296-242; with Perot out and all his voters going to Bush in 1992, Bush wins 486-52.
- A state goes to whoever has the most votes, so a third party can carry states (Wallace in 1968, Roosevelt in 1912).
  The model moves the two-party margin and gives the leftover to the third parties, so third parties are modeled by vote
  share, not by issue positions.
- If nobody reaches a majority of electoral votes, the result says so; in real life the House of Representatives decides.
- Margins are the winner's lead over the runner-up in points of the total vote, as usually reported.

**Not included: 1789-1824.** Almost no state held a popular vote (legislatures chose the electors), so there are no
margins to simulate, and 1824 was decided by the House.

How the special cases work:
- States that didn't exist yet, DC before 1964, and the Confederacy in 1864 and 1868 are left out of that election.
- States whose legislature chose the electors (e.g. South Carolina until 1860, Florida 1868, Colorado 1876) have fixed
  electoral votes and can't be edited.
- Where real electors were split (e.g. California 1912, Maryland 1904) the real split is kept until you flip the state.
- Faithless or unpledged electors are counted for the candidate they were pledged to (1948 Tennessee, 1956 Alabama,
  1960 Oklahoma, 1968 North Carolina, 1972 Virginia). In 1960 the unpledged electors in Mississippi and Alabama are counted
  for Harry Byrd. In 1832 and 1836 South Carolina's legislature voted for Floyd and Mangum, shown as "Others".
- 1872: Greeley died before the electors met; his 66 pledged electors are counted for him, and Arkansas and Louisiana
  (14 electors Congress didn't count) are counted for Grant, who won both. 1896: the source's Democratic total is 2.1%
  below the official one, so some state margins may be understated.
- From 1976 on, Maine and Nebraska aren't split (winner-take-all by state).
- State issue stances are the same current estimates in every preset (there is no historical data for them), and the
  real candidates' stances are already baked into each state's real result. Presets are a faithful starting point for
  what-ifs, not predictions.

**Data and accuracy**
- 1976-2024 Republican and Democratic votes: MIT Election Data and Science Lab. Its South Carolina 1992 row lists Clinton at
  525,514 votes; the real figure is 479,514, so that one state uses the other file's numbers (R+8.1, not R+4.2).
- 1828-1972 and the third parties from 1980 to 2016: elec.csv from github.com/zonination/election-history (American
  Presidency Project and National Archives data). MIT's third-party rows are incomplete in some states.
- Checked: every candidate's electoral votes equal the historical record in every election, all vote shares add up, and
  national totals are within about 0.5% of the official figures. Where the two files overlap (1976-2016), state margins
  differ by 0.03 points on average and up to about 1 point in a few small states, because MIT counts write-ins in the total.
  Treat pre-1976 margins as accurate to roughly a point.
- To rebuild `elections.js`:
  `python tools/build_elections.py path/to/1976-2024-president.csv path/to/elec.csv`
  It refuses to write the file if any check fails.
- The Streamlit version does not have presets, third parties or the Senate and governor tabs yet; it only has the
  "current day" two-candidate president mode.

## Senate and governor tabs (web UI)
Four extra tabs next to "President": **Senate: single race**, **Senate: all races**, **Governor: single race** and
**Governor: all races**. They cover the real 2026 races (35 Senate seats including the Florida and Ohio specials, and
36 governorships) with the current nominees, as of October 16, 2026.

- **Single race:** pick a race, edit both candidates (name, incumbency, five issue stances, approval), the state's PVI
  and the race adjustment, and see the winner, margin, rating and a full breakdown of where the margin comes from.
- **All races:** every race in one table with editable candidate names. Press Edit on a row for the full candidate
  editor. Results, the Senate control / governorship tally and the list of flips update as you type. Edits are shared
  with the single-race tab and kept while you switch tabs.
- **Model:** margin (R minus D) = national environment shift + 2 x state PVI + 3 per incumbent + race adjustment
  + 0.5 x issue fit vs. a typical Republican and Democrat + 0.25 x approval gap. Same issue scoring as the president tab.
- **Defaults are calibrated to the Cook Political Report rating** of each race, not to polls: a race whose PVI-based
  margin falls outside its rating's band (Solid 12+, Likely 7-12, Lean 3-7) gets a "race adjustment" that moves it to
  the nearest edge of the band, and a Tossup starts half a point toward the party holding the seat. Races already inside
  their band get 0. You can change the adjustment, or press "Reset this race". The environment slider starts at 0, which
  means "where the forecasters have it today"; move it to ask "what if the national mood shifts".
- **Tally:** the Senate has 34 Democratic-caucus and 31 Republican seats not up. Democrats need 51 for control; at 50-50
  the Republican Vice President breaks the tie. The governor tally adds 6 Democratic and 8 Republican governors not up.
- **Independents:** in Idaho, Montana, Nebraska and South Dakota the main challenger is an independent (the Democratic
  nominee withdrew, or in Montana the independent is the main challenger), so the independent fills the Democratic-side
  slot and is counted with the Democrats. That assumes they would caucus with them, which isn't certain.
- **Placeholders:** Alaska governor (three Republicans advanced under ranked-choice voting) and Rhode Island governor
  (Republican primary result not in the source) show a placeholder name. Maine's independent governor candidate isn't modeled.
- **Ties** (exactly 0.000) go to the party holding the seat.
- **Updating:** all race data is in `races.js` (nominees, incumbents, ratings, seat holders). Edit it if a nominee is
  replaced or ratings change; the calibration recomputes automatically.

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
