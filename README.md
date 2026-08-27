# SentinelCare — frontend 2 (welfare officer / commander dashboard)

Scaffolded from the project spec since the real `AlertsPage.jsx` and shared
component files weren't available to paste in. Structure and naming follow
the spec closely so it should be straightforward to merge with your actual
codebase — treat this as a strong starting point to diff against, not a
drop-in replacement.

## Structure

```
src/
  design/
    tokens.js       — colors, type, radii, MIN_COHORT_SIZE
    global.css       — fonts, resets, the "breathing ring" animation
  components/
    Badge.jsx         — Badge, SignalBadge, SignalBadgeRow
    Card.jsx
    Button.jsx
    Slider.jsx
    RiskCapsule.jsx   — signature risk-band element (alert cards + trend legend)
    PrivacyBanner.jsx — shared reassurance banner pattern
  api/
    client.js         — shared API client (login, alerts, unit trend)
  pages/
    LoginScreen.jsx
    AlertsPage.jsx     — extended with per-alert signal_type badges
    TrendView.jsx       — new anonymized unit-level risk trend chart
  App.jsx              — tab shell wiring it together
```

## What's implemented

1. **Signal badges** — `SignalBadgeRow` reads an alert's `factors` array and
   renders one small badge per distinct `signal_type` present
   (organizational / survey / behavioral / chat), in a fixed order so rows
   don't reflow. Colors are centralized in `tokens.js` under `signalMeta`.

2. **Unit trend view** — `TrendView.jsx` expects
   `GET /units/:id/risk-trend` to return:
   ```json
   {
     "unit_id": "...",
     "weeks": [
       { "week_start": "2026-08-03", "cohort_size": 14,
         "bands": { "low": 9, "moderate": 4, "high": 1 } }
     ]
   }
   ```
   Only counts per band are used — no personnel identifiers ever reach this
   component.

3. **Visual tone** — calm sage/slate palette, muted (non-siren) risk colors,
   Fraunces for headers to keep it feeling human rather than clinical.

## Anonymization safeguard (please review with your privacy/legal team)

`MIN_COHORT_SIZE` in `tokens.js` (default `5`) is a client-side floor: any
week where `cohort_size` is below that threshold is rendered as
**suppressed** rather than plotted, because a band breakdown for a very
small group (e.g. "1 of 3 people is high risk") can effectively identify an
individual even without a name attached.

This is a UI-level safeguard only — it doesn't stop the API from returning
small-cohort data, and the true minimum cohort size (and whether it should
vary by context) is a policy decision, not a coding one. I'd suggest
enforcing the same threshold server-side too, so a differently-built client
can't bypass it.

## Also worth deciding with your team, not just engineering

- What exactly "chat" signal means to the personnel it's collected from,
  and whether they know it's a factor — the badge tooltip currently says
  "reflects check-in patterns, never message content," but that's only
  true if that's actually how the signal is computed.
- Who can see the unsuppressed, per-alert factor breakdown vs. only the
  aggregated trend — right now both views are gated by the same login,
  with no role distinction between welfare staff and command.
