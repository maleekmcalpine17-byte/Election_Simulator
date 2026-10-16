# Election Game 2024

## Run the web UI (VS Code Live Server)
1. Open this folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` -> "Open with Live Server".

## Run the Streamlit version
    pip install -r requirements.txt
    streamlit run election_game.py

## How margins work
Margins are in percentage points (R minus D), shown like `R+6.2` / `D+3.1`:

    margin = national environment + national swing from approval
           + 2 x state PVI
           + 0.5 x (how much better Candidate 1 fits the state than Candidate 2,
                    compared with a typical Republican vs. a typical Democrat)

- **PVI**: each state starts at its 2025 Cook PVI (2020 + 2024 elections), source: The Cook Political Report.
  PVI is a lean in two-party vote share, so the lean in margin is double it (Texas R+6 -> about R+12 before
  candidates and approval).
- **Typical profiles**: the candidate sliders now start on a typical Republican / typical Democrat. With both
  at those profiles and equal approval, every state's margin is exactly 2 x its PVI. Moving a slider away from
  typical moves margins; stances far from the center cost votes.
- **Approval**: every point of approval gap (Candidate 1 minus Candidate 2) moves every state by 0.25 points.
- **National environment**: a slider from D+20 to R+20 (half-point steps, default EVEN) that shifts every
  state by the same amount, before candidate and approval effects. For reference, 2024 was about R+1.5 and
  2020 about D+4.5. With the typical candidates, R+1.5 gives 312-226 for the Republican.
- **Ties**: a margin of exactly 0.0 (EVEN) is decided at random, as before.

## State Settings
Open "State Settings (PVI & stances)", pick a state, and change its PVI or any of its five stances with the
sliders (e.g. Texas immigration 8 -> 4, or Texas PVI R+6 -> R+3). Edits are kept for all states until you press
"Reset this state", "Reset all states", or "Restart Game". Edits are measured against the original state data,
so lowering Texas's immigration stance helps whichever candidate is closer to the new stance.

## Tuning
All constants are at the top of the model section (`election_game.py`) and in `script.js`:
`TYPICAL_R`, `TYPICAL_D`, `POINTS_TO_MARGIN`, `PVI_TO_MARGIN`, `APPROVAL_TO_MARGIN`.
These are rough calibrations, not a fitted forecast model. Keep both files in sync if you change them.
