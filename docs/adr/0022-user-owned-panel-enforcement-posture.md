# ADR 0022: panel enforcement posture is user-owned

- Status: accepted
- Date: 2026-07-16
- Revised: 2026-07-17 (ADR 0026) — the posture toggle is renamed and relocated
  to `review.onShortfall` in schemaVersion 3: `strict` → `fail`, `preference`
  → `proceed`. The semantics below are unchanged; only the key's name and
  position (now inside `review`, beside the floor it governs) changed. The
  vendor-axis `minVendor` referenced below is retired in v3 — `panelSize`
  (model-identity) is the single floor.

## Context

Available credentials and model rosters drift. A package-maintainer-owned
panel-diversity floor would turn that drift into an involuntary lifecycle block,
while making every floor advisory would discard adopters' deliberate controls.

## Decision

The consumer owns the `review.onShortfall` toggle (`fail | proceed`; renamed
from the original `strict | preference` in v3, ADR 0026) and its panel floors.
`fail` keeps shortfall and reachable author-exclusion failures blocking.
`proceed` forms the best available panel, may readmit the author model only to
address a shortfall, reports the shortfall on stderr, and exits 0 when a panel
can form. The advisory is carried into the phase writeup and, for a PR review,
into the PR; no standalone decision log is committed.

The toggle is subordinate to the gate modes: a gate that is off or human does
not become a panel gate. Where a panel forms, `review.panelSize` (with an
optional per-phase `panels.phases.<phase>.panelSize` override) is the single
distinct-model floor on the model-identity axis; there is no vendor axis in v3.
Maintainers recommend defaults but do not wield the floor.

## Consequences

- Adopters can retain hard gates or choose best-effort governance explicitly.
- Machine stdout remains reserved for panel/list and `--emit-tasks` output;
  advisories use stderr.
- The durable waiver is the committed `proceed` posture, not a generated log.
