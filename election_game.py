import streamlit as st
from streamlit import session_state
import random
import copy
import math
import plotly.express as px  # Added for Plotly chart

# Define states and their attributes
states = {
    "Texas": {"immigration": 8, "trade": 2, "partisanship": 3, "abortion": 4, "electoral_college": 40, "foreign_policy": 8},
    "California": {"immigration": 3, "trade": 4, "partisanship": 9, "abortion": 8, "electoral_college": 54, "foreign_policy": 2},
    "New York": {"immigration": 3, "trade": 5, "partisanship": 9, "abortion": 8, "electoral_college": 28, "foreign_policy": 3},
    "New Jersey": {"immigration": 4, "trade": 6, "partisanship": 7, "abortion": 7, "electoral_college": 14, "foreign_policy": 3},
    "Illinois": {"immigration": 4, "trade": 7, "partisanship": 8, "abortion": 8, "electoral_college": 19, "foreign_policy": 2},
    "Pennsylvania": {"immigration": 6, "trade": 8, "partisanship": 6, "abortion": 6, "electoral_college": 19, "foreign_policy": 4},
    "Ohio": {"immigration": 8, "trade": 8, "partisanship": 5, "abortion": 4, "electoral_college": 17, "foreign_policy": 5},
    "Wisconsin": {"immigration": 6, "trade": 8, "partisanship": 7, "abortion": 7, "electoral_college": 10, "foreign_policy": 4},
    "Michigan": {"immigration": 6, "trade": 8, "partisanship": 7, "abortion": 7, "electoral_college": 15, "foreign_policy": 3},
    "Minnesota": {"immigration": 4, "trade": 8, "partisanship": 8, "abortion": 7, "electoral_college": 10, "foreign_policy": 2},
    "Missouri": {"immigration": 8, "trade": 7, "partisanship": 3, "abortion": 4, "electoral_college": 10, "foreign_policy": 8},
    "Kentucky": {"immigration": 9, "trade": 7, "partisanship": 2, "abortion": 3, "electoral_college": 8, "foreign_policy": 7},
    "West Virginia": {"immigration": 9, "trade": 9, "partisanship": 3, "abortion": 2, "electoral_college": 4, "foreign_policy": 6},
    "Oklahoma": {"immigration": 9, "trade": 3, "partisanship": 2, "abortion": 2, "electoral_college": 7, "foreign_policy": 8},
    "Tennessee": {"immigration": 9, "trade": 3, "partisanship": 3, "abortion": 2, "electoral_college": 11, "foreign_policy": 8},
    "Indiana": {"immigration": 8, "trade": 5, "partisanship": 3, "abortion": 4, "electoral_college": 11, "foreign_policy": 7},
    "Arkansas": {"immigration": 8, "trade": 3, "partisanship": 3, "abortion": 2, "electoral_college": 6, "foreign_policy": 7},
    "Mississippi": {"immigration": 9, "trade": 3, "partisanship": 2, "abortion": 2, "electoral_college": 6, "foreign_policy": 7},
    "Alabama": {"immigration": 9, "trade": 4, "partisanship": 2, "abortion": 2, "electoral_college": 9, "foreign_policy": 7},
    "Louisiana": {"immigration": 8, "trade": 3, "partisanship": 3, "abortion": 2, "electoral_college": 8, "foreign_policy": 7},
    "South Carolina": {"immigration": 8, "trade": 3, "partisanship": 3, "abortion": 3, "electoral_college": 9, "foreign_policy": 7},
    "Georgia": {"immigration": 6, "trade": 3, "partisanship": 4, "abortion": 4, "electoral_college": 16, "foreign_policy": 6},
    "Florida": {"immigration": 6, "trade": 4, "partisanship": 5, "abortion": 4, "electoral_college": 30, "foreign_policy": 6},
    "North Carolina": {"immigration": 7, "trade": 3, "partisanship": 4, "abortion": 4, "electoral_college": 16, "foreign_policy": 7},
    "Virginia": {"immigration": 4, "trade": 3, "partisanship": 6, "abortion": 7, "electoral_college": 13, "foreign_policy": 6},
    "South Dakota": {"immigration": 7, "trade": 2, "partisanship": 2, "abortion": 5, "electoral_college": 3, "foreign_policy": 6},
    "North Dakota": {"immigration": 7, "trade": 2, "partisanship": 2, "abortion": 5, "electoral_college": 3, "foreign_policy": 6},
    "Kansas": {"immigration": 6, "trade": 2, "partisanship": 2, "abortion": 5, "electoral_college": 6, "foreign_policy": 6},
    "Nebraska": {"immigration": 6, "trade": 2, "partisanship": 2, "abortion": 5, "electoral_college": 5, "foreign_policy": 6},
    "Wyoming": {"immigration": 7, "trade": 3, "partisanship": 1, "abortion": 2, "electoral_college": 3, "foreign_policy": 7},
    "Idaho": {"immigration": 7, "trade": 3, "partisanship": 1, "abortion": 2, "electoral_college": 4, "foreign_policy": 7},
    "Montana": {"immigration": 6, "trade": 4, "partisanship": 2, "abortion": 3, "electoral_college": 4, "foreign_policy": 6},
    "Utah": {"immigration": 5, "trade": 2, "partisanship": 1, "abortion": 3, "electoral_college": 6, "foreign_policy": 8},
    "Arizona": {"immigration": 6, "trade": 2, "partisanship": 3, "abortion": 5, "electoral_college": 11, "foreign_policy": 6},
    "Colorado": {"immigration": 3, "trade": 2, "partisanship": 7, "abortion": 8, "electoral_college": 10, "foreign_policy": 3},
    "New Mexico": {"immigration": 3, "trade": 3, "partisanship": 7, "abortion": 7, "electoral_college": 5, "foreign_policy": 3},
    "Nevada": {"immigration": 6, "trade": 4, "partisanship": 6, "abortion": 8, "electoral_college": 6, "foreign_policy": 4},
    "Washington": {"immigration": 3, "trade": 3, "partisanship": 8, "abortion": 9, "electoral_college": 12, "foreign_policy": 2},
    "Alaska": {"immigration": 6, "trade": 4, "partisanship": 2, "abortion": 4, "electoral_college": 3, "foreign_policy": 5},
    "Hawaii": {"immigration": 2, "trade": 3, "partisanship": 8, "abortion": 8, "electoral_college": 4, "foreign_policy": 2},
    "Oregon": {"immigration": 3, "trade": 3, "partisanship": 7, "abortion": 9, "electoral_college": 8, "foreign_policy": 2},
    "Washington DC": {"immigration": 1, "trade": 2, "partisanship": 10, "abortion": 10, "electoral_college": 3, "foreign_policy": 1},
    "Massachusetts": {"trade": 3, "immigration": 1, "partisanship": 10, "electoral_college": 11, "abortion": 9, "foreign_policy": 1},
    "Rhode Island": {"trade": 2, "immigration": 2, "partisanship": 9, "electoral_college": 4, "abortion": 9, "foreign_policy": 2},
    "Connecticut": {"trade": 2, "immigration": 2, "partisanship": 9, "electoral_college": 7, "abortion": 9, "foreign_policy": 2},
    "Maryland": {"trade": 3, "immigration": 2, "partisanship": 8, "electoral_college": 10, "abortion": 9, "foreign_policy": 2},
    "Delaware": {"trade": 3, "immigration": 2, "partisanship": 9, "electoral_college": 3, "abortion": 9, "foreign_policy": 2},
    "Vermont": {"trade": 4, "immigration": 2, "partisanship": 8, "electoral_college": 3, 'abortion': 10, "foreign_policy": 1},
    "New Hampshire": {"trade": 2, "immigration": 4, "partisanship": 5, "electoral_college": 4, "abortion": 7, "foreign_policy": 3},
    "Maine": {"trade": 2, "immigration": 3, "partisanship": 7, "electoral_college": 4, 'abortion': 8, "foreign_policy": 3},
    "Iowa": {"trade": 8, "immigration": 6, "partisanship": 4, "abortion": 6, "electoral_college": 6, "foreign_policy": 4},
}

# State partisan lean: 2025 Cook PVI (2020 + 2024 presidential elections), from The Cook Political Report.
# Positive = Republican (R+6 -> 6), negative = Democratic (D+12 -> -12), 0 = EVEN.
# PVI is a lean in two-party VOTE SHARE vs. the nation, so the lean in MARGIN is twice the PVI.
PVI = {
    "Alabama": 15,
    "Alaska": 6,
    "Arizona": 2,
    "Arkansas": 15,
    "California": -12,
    "Colorado": -6,
    "Connecticut": -8,
    "Delaware": -8,
    "Florida": 5,
    "Georgia": 1,
    "Hawaii": -13,
    "Idaho": 18,
    "Illinois": -6,
    "Indiana": 9,
    "Iowa": 6,
    "Kansas": 8,
    "Kentucky": 15,
    "Louisiana": 11,
    "Maine": -4,
    "Maryland": -15,
    "Massachusetts": -14,
    "Michigan": 0,
    "Minnesota": -3,
    "Mississippi": 11,
    "Missouri": 9,
    "Montana": 10,
    "Nebraska": 10,
    "Nevada": 1,
    "New Hampshire": -2,
    "New Jersey": -4,
    "New Mexico": -4,
    "New York": -8,
    "North Carolina": 1,
    "North Dakota": 18,
    "Ohio": 5,
    "Oklahoma": 17,
    "Oregon": -8,
    "Pennsylvania": 1,
    "Rhode Island": -8,
    "South Carolina": 8,
    "South Dakota": 15,
    "Tennessee": 14,
    "Texas": 6,
    "Utah": 11,
    "Vermont": -17,
    "Virginia": -3,
    "Washington": -10,
    "Washington DC": -44,
    "West Virginia": 21,
    "Wisconsin": 0,
    "Wyoming": 23,
}
for _state_name, _pvi in PVI.items():
    states[_state_name]["pvi"] = _pvi

# Untouched copy of the data: the margin model measures state-setting edits against this.
DEFAULT_STATES = copy.deepcopy(states)

# ---------------- Margin model ----------------
# margin (R minus D, in percentage points)
#   = national environment + national swing from approval
#   + 2 x state PVI
#   + POINTS_TO_MARGIN x (how much better Candidate 1 fits the state than Candidate 2,
#                         compared with a typical Republican vs. a typical Democrat)
# With both candidates at the "typical" profile and equal approval, every state lands on its PVI.
TYPICAL_R = {"trade": 6, "immigration": 8, "partisanship": 3, "abortion": 3, "foreign_policy": 7}
TYPICAL_D = {"trade": 4, "immigration": 4, "partisanship": 8, "abortion": 9, "foreign_policy": 4}
POINTS_TO_MARGIN = 0.5      # margin points per issue-score point
PVI_TO_MARGIN = 2           # margin points per PVI point
APPROVAL_TO_MARGIN = 0.25   # national margin points per point of approval gap (Candidate 1 minus Candidate 2)

STATE_FIELDS = [
    ("trade", "Trade (1: free market, 10: protectionist)"),
    ("immigration", "Immigration (1: open borders, 10: strict control)"),
    ("partisanship", "Partisanship (1: very Republican, 10: very Democratic)"),
    ("abortion", "Abortion (1: pro-life, 10: pro-choice)"),
    ("foreign_policy", "Foreign policy (1: dovish, 10: hawkish)"),
]


def round1(x):
    # Round half up to 1 decimal (same rule as the web version, so both give identical results)
    return math.floor(x * 10 + 0.5) / 10


def issue_score(attrs, c):
    score = 0
    score += 10 - abs(attrs["trade"] - c["trade"])
    score += 10 - abs(attrs["immigration"] - c["immigration"])
    score += 5 - abs(attrs["partisanship"] - c["partisanship"])
    score += 10 - abs(attrs["abortion"] - c["abortion"])
    score += 10 - abs(attrs["foreign_policy"] - c["foreign_policy"])
    return score


def approval_swing(approval1, approval2):
    return APPROVAL_TO_MARGIN * (approval1 - approval2)


def state_margin(attrs, state_name, c1, c2, national_swing):
    """Signed margin in points: positive = Candidate 1 (Republican), negative = Candidate 2 (Democrat)."""
    base = DEFAULT_STATES[state_name]
    reference = issue_score(base, TYPICAL_R) - issue_score(base, TYPICAL_D)
    fit = issue_score(attrs, c1) - issue_score(attrs, c2)
    margin = national_swing + PVI_TO_MARGIN * attrs["pvi"] + POINTS_TO_MARGIN * (fit - reference)
    return round1(max(-100, min(100, margin)))


def format_pvi(n):
    return "EVEN" if n == 0 else (f"R+{n}" if n > 0 else f"D+{abs(n)}")


def format_margin(m):
    return "EVEN" if m == 0 else (f"R+{abs(m):.1f}" if m > 0 else f"D+{abs(m):.1f}")


PVI_OPTIONS = [format_pvi(n) for n in range(-50, 31)]   # D+50 ... EVEN ... R+30
PVI_BY_LABEL = {format_pvi(n): n for n in range(-50, 31)}

# National environment slider: D+20.0 ... EVEN ... R+20.0 in half-point steps
ENV_OPTIONS = [format_margin(n / 2) for n in range(-40, 41)]
ENV_BY_LABEL = {format_margin(n / 2): n / 2 for n in range(-40, 41)}


# Function for validated user input
def get_valid_input(prompt, min_value, max_value, key, default=None):
    return st.slider(prompt, min_value, max_value, value=default, key=key)

# Main game function
def run_game():
    if st.button("Restart Game"):
        for key in list(session_state.keys()):
            del session_state[key]
        st.rerun()    
   
    st.title("Election Game 2024")
    st.markdown("Simulate an election based on your political stances!")

    st.header("Candidate 1 (Republican)")
    candidate1_name = st.text_input("Enter the name of Candidate 1 (Republican):", key="cand1_name")

    candidate1_trade = get_valid_input("Stance on trade? (1: free market, 10: protectionist)", 1, 10, "cand1_trade", TYPICAL_R["trade"])
    candidate1_immigration = get_valid_input("Stance on immigration? (1: open borders, 10: strict control)", 1, 10, "cand1_immigration", TYPICAL_R["immigration"])
    candidate1_partisanship = get_valid_input("Partisanship? (1: extreme Republican, 5: moderate)", 1, 5, "cand1_partisanship", TYPICAL_R["partisanship"])
    candidate1_abortion = get_valid_input("Stance on abortion? (1: pro-life, 10: pro-choice)", 1, 10, "cand1_abortion", TYPICAL_R["abortion"])
    candidate1_foreign_policy = get_valid_input("Foreign policy? (1: dovish, 10: hawkish)", 1, 10, "cand1_foreign", TYPICAL_R["foreign_policy"])
    candidate1_approval = get_valid_input("Approval rating? (0-100%, 50 is neutral)", 0, 100, "cand1_approval", 50)

    st.header("Candidate 2 (Democrat)")
    candidate2_name = st.text_input("Enter the name of Candidate 2 (Democrat):", key="cand2_name")

    candidate2_trade = get_valid_input("Stance on trade? (1: free market, 10: protectionist)", 1, 10, "cand2_trade", TYPICAL_D["trade"])
    candidate2_immigration = get_valid_input("Stance on immigration? (1: open borders, 10: strict control)", 1, 10, "cand2_immigration", TYPICAL_D["immigration"])
    candidate2_partisanship = get_valid_input("Partisanship? (10: extreme Democrat, 6: moderate)", 6, 10, "cand2_partisanship", TYPICAL_D["partisanship"])
    candidate2_abortion = get_valid_input("Stance on abortion? (1: pro-life, 10: pro-choice)", 1, 10, "cand2_abortion", TYPICAL_D["abortion"])
    candidate2_foreign_policy = get_valid_input("Foreign policy? (1: dovish, 10: hawkish)", 1, 10, "cand2_foreign", TYPICAL_D["foreign_policy"])
    candidate2_approval = get_valid_input("Approval rating? (0-100%, 50 is neutral)", 0, 100, "cand2_approval", 50)

    # ---- National environment: baseline national margin applied to every state ----
    st.header("National Environment")
    env_label = st.select_slider(
        "National environment (baseline national margin, before candidate and approval effects)",
        options=ENV_OPTIONS,
        value="EVEN",
        key="national_environment",
    )
    st.caption("D+ favors the Democrat, R+ the Republican. For reference: 2024 was about R+1.5 and 2020 about D+4.5.")
    national_environment = ENV_BY_LABEL[env_label]

    # ---- State settings: change any state's PVI and stances ----
    # Edits are stored in session_state["state_overrides"] so they survive switching between states.
    if "state_overrides" not in session_state:
        session_state["state_overrides"] = {}
    overrides = session_state["state_overrides"]

    st.header("State Settings")
    with st.expander("Change a state's PVI and stances"):
        st.caption("PVI is a state's partisan lean vs. the nation (Texas = R+6). Edits are kept for every state until you reset them.")
        selected_state = st.selectbox(
            "State",
            list(DEFAULT_STATES.keys()),
            format_func=lambda s: f"{s} (edited)" if s in overrides else s,
            key="state_select",
        )

        reset_col1, reset_col2 = st.columns(2)
        if reset_col1.button("Reset this state"):
            overrides.pop(selected_state, None)
            for key in [k for k in session_state.keys() if k.startswith("st_") and k.endswith("_" + selected_state)]:
                del session_state[key]
            st.rerun()
        if reset_col2.button("Reset all states"):
            overrides.clear()
            for key in [k for k in session_state.keys() if k.startswith("st_")]:
                del session_state[key]
            st.rerun()

        base = DEFAULT_STATES[selected_state]
        current = {**base, **overrides.get(selected_state, {})}

        pvi_label = st.select_slider(
            f"PVI (default {format_pvi(base['pvi'])})",
            options=PVI_OPTIONS,
            value=format_pvi(current["pvi"]),
            key=f"st_pvi_{selected_state}",
        )
        new_values = {"pvi": PVI_BY_LABEL[pvi_label]}
        for field, label in STATE_FIELDS:
            new_values[field] = st.slider(
                f"{label} (default {base[field]})",
                1, 10,
                value=int(current[field]),
                key=f"st_{field}_{selected_state}",
            )

        if all(new_values[k] == base[k] for k in new_values):
            overrides.pop(selected_state, None)
        else:
            overrides[selected_state] = new_values

        if overrides:
            st.caption("Edited states: " + ", ".join(overrides.keys()))

    if st.button("Run Simulation"):
        candidate1_votes = 0
        candidate2_votes = 0
        state_margins = []

        c1 = {"trade": candidate1_trade, "immigration": candidate1_immigration, "partisanship": candidate1_partisanship,
              "abortion": candidate1_abortion, "foreign_policy": candidate1_foreign_policy}
        c2 = {"trade": candidate2_trade, "immigration": candidate2_immigration, "partisanship": candidate2_partisanship,
              "abortion": candidate2_abortion, "foreign_policy": candidate2_foreign_policy}

        # Apply the state edits on top of the default state data
        effective_states = {name: {**DEFAULT_STATES[name], **overrides.get(name, {})} for name in DEFAULT_STATES}

        # Approval: each point of approval gap moves every state's margin by APPROVAL_TO_MARGIN points.
        # The national environment is added on top; both shift every state equally.
        approval_effect = approval_swing(candidate1_approval, candidate2_approval)
        national_swing = national_environment + approval_effect

        st.subheader("Election Results by State")
        st.write(f"National environment: {format_margin(national_environment)} | Swing from approval: {format_margin(round1(approval_effect))} | Total national swing: {format_margin(round1(national_swing))}")
        for state, attributes in effective_states.items():
            signed_margin = state_margin(attributes, state, c1, c2, national_swing)
            margin = abs(signed_margin)
            margin_text = format_margin(signed_margin)

            if signed_margin > 0:
                candidate1_votes += attributes["electoral_college"]
                st.write(f"✅ {state}: {candidate1_name} wins ({attributes['electoral_college']} votes) | Margin: {margin_text}")
                state_margins.append({"state": state, "margin": margin, "margin_text": margin_text, "winner": candidate1_name})
            elif signed_margin < 0:
                candidate2_votes += attributes["electoral_college"]
                st.write(f"🔵 {state}: {candidate2_name} wins ({attributes['electoral_college']} votes) | Margin: {margin_text}")
                state_margins.append({"state": state, "margin": margin, "margin_text": margin_text, "winner": candidate2_name})
            else:
                winner = random.choice([1, 2])
                if winner == 1:
                    candidate1_votes += attributes["electoral_college"]
                    st.write(f"🤝 {state}: Tie, random winner is {candidate1_name} ({attributes['electoral_college']} votes) | Margin: {margin_text}")
                    state_margins.append({"state": state, "margin": margin, "margin_text": margin_text, "winner": candidate1_name})
                else:
                    candidate2_votes += attributes["electoral_college"]
                    st.write(f"🤝 {state}: Tie, random winner is {candidate2_name} ({attributes['electoral_college']} votes) | Margin: {margin_text}")
                    state_margins.append({"state": state, "margin": margin, "margin_text": margin_text, "winner": candidate2_name})

        # Sort the state_margins by margin
        state_margins.sort(key=lambda x: x["margin"])

        # Get the 3 closest states
        closest_states = state_margins[:3]

        st.subheader("The 3 Closest States")
        for state in closest_states:
            st.write(f"State: {state['state']} | Margin: {state['margin_text']} | Winner: {state['winner']}")

        # Add bar chart for the three closest states using Plotly
        st.subheader("Closest States Margin Visualization")
        if closest_states:  # Ensure there are states to display
            fig = px.bar(
                x=[state["state"] for state in closest_states],
                y=[state["margin"] for state in closest_states],
                color=[state["state"] for state in closest_states],  # Color by state
                labels={"x": "State", "y": "Margin of Victory (points)"},
                title="Top 3 Closest States by Margin",
                color_discrete_sequence=["#FF6384", "#36A2EB", "#FFCE56"],  # Same colors as before
            )
            fig.update_layout(showlegend=True)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.write("No close states to display.")

        st.header("Final Results")
        st.write(f"🟥 {candidate1_name}: {candidate1_votes} Electoral Votes")
        st.write(f"🟦 {candidate2_name}: {candidate2_votes} Electoral Votes")

        if candidate1_votes > candidate2_votes:
            st.success(f"🎉 {candidate1_name} wins the election!")
        elif candidate2_votes > candidate1_votes:
            st.success(f"🎉 {candidate2_name} wins the election!")
        else:
            st.warning("It's a tie! No clear winner.")

# Run the game
run_game()
