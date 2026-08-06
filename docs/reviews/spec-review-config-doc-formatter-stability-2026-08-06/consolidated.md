# Spec-panel adjudication — config-doc formatter stability

Specification: `docs/specs/2026-08-06-config-doc-formatter-stability.md`  
Track: irreversible  
Orchestrator: `anthropic/claude-opus-5`

## Artifact inventory

| wave | round | reviewer | artifact | result |
| --- | ---: | --- | --- | --- |
| 1 | 1 | `claude-fable-5` | `round1-claude-fable-5.md` | 1 medium, 1 low |
| 1 | 1 | `gemini-3.1-pro-preview` | `round1-gemini-3.1-pro-preview.md` | 1 high |

Telemetry: `panel.dispatched{round:1,wave:1}` → harvest round 1 → this `panel.consolidated` record.

## Round 1 findings

| id | severity | origin | defect | disposition |
| --- | --- | --- | --- | --- |
| `SPEC-R1-01` | high | NEW | Original normative Spec amendment was deferred to implementation, leaving contradictory v1/v2 contracts at the Spec gate | **incorporated** — original rev-3 §§12–14 amendment is now part of this Spec revision and gate |
| `SPEC-R1-02` | medium | NEW | Plan mutation clause and CDFS4/CDFS9 did not define an observable formatter-facing witness | **incorporated** — Plan A1 replaces the invalid literal-mutation claim; CDFS4 compares exact space/single-delimiter history, CDFS9 drops unobservable flap wording |
| `SPEC-R1-03` | low | NEW | CDFS7 did not define provenance for a real v1 body after the renderer moves to v2 | **incorporated** — pins `test/fixtures/config-doc/v1-valid-config.md` captured from baseline `c3fd2a1`'s v1 renderer for `VALID_CONFIG` |

**Counts:** 1 high, 1 medium, 1 low. Incorporated 3; dismissed 0; barred 0; carries 0.

Both reviewers' CLEAR claims were checked against the source. No inbound carry exists. A full delta round is required because the first wave contained high/medium findings.
