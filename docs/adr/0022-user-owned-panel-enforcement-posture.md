# ADR 0022: panel enforcement posture is user-owned

- Status: accepted
- Date: 2026-07-16

## Context

Available credentials and model rosters drift. A package-maintainer-owned
panel-diversity floor would turn that drift into an involuntary lifecycle block,
while making every floor advisory would discard adopters' deliberate controls.

## Decision

The consumer owns the `strict | preference` enforcement toggle and its panel
floors. `strict` keeps shortfall and reachable author-exclusion failures
blocking. `preference` forms the best available panel, may readmit the author
model only to address a shortfall, reports the shortfall on stderr, and exits 0
when a panel can form. The advisory is carried into the phase writeup and, for a
PR review, into the PR; no standalone decision log is committed.

The toggle is subordinate to OL-A gate modes: a gate that is off or human does
not become a panel gate. Where a panel forms, lifecycle `minPanel` is the model
axis and excludes `minVendor`; without lifecycle configuration, `minVendor` is
the vendor axis. Maintainers recommend defaults but do not wield the floor.

## Consequences

- Adopters can retain hard gates or choose best-effort governance explicitly.
- Machine stdout remains reserved for panel/list and `--emit-tasks` output;
  advisories use stderr.
- The durable waiver is the committed `preference` posture, not a generated log.
