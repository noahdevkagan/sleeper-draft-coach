# Sleeper Draft Coach

A free, open-source Chrome extension that gives you **live draft recommendations** on [Sleeper](https://sleeper.com). It overlays your draft board, reads picks through Sleeper's public API, and every second or so tells you the three best picks **for your roster right now** — not just the best player available.

It's a hobby project. The interesting idea: draft off **Vegas prop-implied projections** instead of consensus ADP, and let the tool do the value-over-replacement math live while you're on the clock.

---

## What it does

- **Auto-detects your draft slot** from the board.
- **Live top 3** recommendations, refreshed continuously, each with a points-over-replacement number.
- **Value over replacement at your *next* pick** — it knows who will likely still be there if you wait, so it won't tell you to burn a pick on someone who'll come back to you.
- **Positional balance** — gently steers you away from ending up six WRs deep with no RB2.
- **Lineup legality** — one QB, one TE (it won't recommend a second of either into a slot you can't start).
- **Auto DEF then K** in the final rounds, filtered for what's already gone.
- **"Take now" alert** when the #1 recommendation genuinely won't survive to your next pick *and* the value gap is large.
- **Export button** that dumps your full draft (your roster + the recommendation at every pick) as JSON, so you can grade it afterward.

## Install (load unpacked)

It's not in the Chrome Web Store, so you load it manually. Takes about a minute.

1. Download this repo (green **Code** button → **Download ZIP**) and unzip it. Or `git clone`.
2. Go to `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Open any Sleeper draft (`sleeper.com/draft/...`). The panel appears on the board.

To update later: replace the files in that same folder and hit the reload arrow on the extension card. The version number shows in the panel header.

> **macOS note:** double-clicking the ZIP unpacks into a nested folder. Make sure the folder you point Chrome at has `manifest.json` sitting directly inside it, not one level deeper.

## How the recommendation is scored

Each available player gets a score, roughly:

```
score = marginal_value * 3.5      // points above the best replacement at your NEXT pick
      + projected_points * 0.2    // small raw-points tilt
      + adp_edge * 0.1            // small nudge for market mispricing
      - position_risk             // shave bustier positions slightly
      + roster_balance_need       // nudge toward positions you're thin at
```

Then a few hard rules apply on top: one QB / one TE caps, an avoid list (players whose draft cost typically exceeds their projection), a small penalty for rostering more than one age-cliff RB, and position gating in the late rounds (DEF then K).

The weights (`3.5`, `0.2`, `0.1`, the balance and risk terms) were chosen by running a Monte-Carlo sweep: thousands of simulated 8-team drafts against mixed "human-style" opponents (ADP followers, reachers, run-chasers, zero-RB, etc.), keeping the combination that won the most leagues, then validating it on held-out random seeds so it wasn't just overfit to one run.

## The data, and its limits

`content.js` starts with a `RAW` array of players. Each entry is `[name, position, position_rank, projected_points, adp, adp_edge]`.

- **Projections** are derived from Vegas prop-implied season totals.
- **ADP** is from public Sleeper PPR draft data.
- This is a **June 2026 snapshot.** It *will* be stale by the season. Don't draft your real league off these exact numbers without refreshing them. Updating is just editing the `RAW` array.

The `AVOID`, `VALUE_BOARD`, `VETRISK`, `CUFFS`, and `STACKS` lists are a **judgment layer** on top of the data — one person's opinions, not model output. Edit them freely; that's the point.

## Configuring for your league

Defaults assume an **8-team, 1QB/2RB/2WR/1TE/2FLEX/DEF/K PPR** league. If yours differs, edit near the top of `content.js`:

- `ROSTER_NEED` — target roster shape that drives the balance term.
- `state.teams` / `state.rounds` — league size and rounds.
- `DEFK` — defense and kicker tiers (the kicker list especially is rough; verify it).

## Privacy

The extension only talks to Sleeper's public API (`api.sleeper.app`) to read the picks in your draft. It doesn't collect, store, or send your data anywhere. All logic runs locally in your browser. Read `content.js` — it's one file.

## Contributing

It's a hobby build shared for fun. Issues and PRs welcome, especially better data sources, weekly-variance ("spike week") projections, and league-format flexibility. Tear it apart.

## License

MIT. Do whatever you want with it.

## Disclaimer

Not affiliated with Sleeper. For entertainment. It does not guarantee you win your league — though I like the odds.
