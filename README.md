# Mak's Draft Coach for Sleeper — Chrome Extension

Live overlay on any Sleeper draft page. Auto-syncs every pick via Sleeper's public API
(no scraping, no login). Shows Coach's top 3 picks, the round-by-round template,
your roster, and your next two pick numbers.

## Install (2 minutes, one time)
1. Unzip this folder anywhere (e.g. ~/draft-coach).
2. Chrome → chrome://extensions
3. Toggle "Developer mode" ON (top right).
4. Click "Load unpacked" → select the unzipped folder.
5. Open any sleeper.com/draft/nfl/... page. The coach panel appears top-right.

## Use
- Your slot is auto-detected (works when you created the draft). If wrong, change it
  in the panel dropdown — everything recalculates.
- Picks sync automatically every 3 seconds. Your picks fill MY ROSTER, everyone
  else's marks players gone.
- Click the header to collapse/expand.

## Notes
- Data baked in: First Down Studio Vegas ranks (6/10) + Sleeper PPR ADP. Re-ask
  Claude to regenerate before your real draft for fresh numbers.
- Rules encoded: monopoly window (McBride/Bowers/Allen R3-4), value window R5-8,
  RB depth check R9-10, one QB / one TE hard caps, Meyers rule (no floor vets late),
  age-cliff RB cap, QB stack bonus, NOW-OR-NEVER snake timing.

## v10.3
- Reads your league's scoring settings. Inverted kicker leagues (misses score) get a miss-based kicker list, not accuracy tiers.
- DEF draft pick ranked by week-1 Vegas line (falls back to last year's DEF ppg).
- QB: only the monopoly QB (30+ Vegas pts over QB2) is recommended early; everyone else waits until R12 of 16.
- Elite TE tiebreak by prior-year PPR ppg.
- Season Coach: new DEF / K line. Shows your DEF's opponent implied total, the best free DEF, and HOLD or SWAP (swap only when opp implied is 22+ and the free DEF is 2+ better).
- Fixes: IR players no longer flagged as role eroding; opponent name shows in THIS WEEK; sole K/DEF/QB never suggested as a drop.

## v10.4
- Churn guard "Need a spot?" now ranks drops by what they cost your starting lineup this week (lowest first), not by how recently you added them. Starters never show up as cheap drops.
