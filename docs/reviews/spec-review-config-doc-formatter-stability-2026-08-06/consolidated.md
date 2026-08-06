# Spec-panel adjudication — config-doc formatter stability

Specification: `docs/specs/2026-08-06-config-doc-formatter-stability.md`  
Track: irreversible  
Orchestrator: `anthropic/claude-opus-5`

## Artifact inventory

| wave | round | reviewer | artifact | result |
| --- | ---: | --- | --- | --- |
| 1 | 1 | `claude-fable-5` | `round1-claude-fable-5.md` | 1 medium, 1 low |
| 1 | 1 | `gemini-3.1-pro-preview` | `round1-gemini-3.1-pro-preview.md` | 1 high |
| 2 | 2 | `claude-fable-5` | `round2-claude-fable-5.md` | 2 low |
| 2 | 2 | `gemini-3.1-pro-preview` | `round2-gemini-3.1-pro-preview.md` | clear |

Telemetry: each `panel.dispatched{round:n,wave:n}` has its matching harvest and `panel.consolidated` record.

## Round 1 findings

| id | severity | origin | defect | disposition |
| --- | --- | --- | --- | --- |
| `SPEC-R1-01` | high | NEW | Original normative Spec amendment was deferred to implementation, leaving contradictory v1/v2 contracts at the Spec gate | **incorporated** — original rev-3 §§12–14 amendment is now part of this Spec revision and gate |
| `SPEC-R1-02` | medium | NEW | Plan mutation clause and CDFS4/CDFS9 did not define an observable formatter-facing witness | **incorporated** — Plan A1 replaces the invalid literal-mutation claim; CDFS4 compares exact space/single-delimiter history, CDFS9 drops unobservable flap wording |
| `SPEC-R1-03` | low | NEW | CDFS7 did not define provenance for a real v1 body after the renderer moves to v2 | **incorporated** — pins `test/fixtures/config-doc/v1-valid-config.md` captured from baseline `c3fd2a1`'s v1 renderer for `VALID_CONFIG` |

**Counts:** 1 high, 1 medium, 1 low. Incorporated 3; dismissed 0; barred 0; carries 0.

Both reviewers' CLEAR claims were checked against the source. No inbound carry exists. A full delta round was required because the first wave contained high/medium findings.

## Round 2 findings

Every round-1 disposition was confirmed incorporated.

| id | severity | origin | defect | disposition |
| --- | --- | --- | --- | --- |
| `SPEC-R2-01` | low | NEW | Changed-surface inventory omitted the newly pinned v1 fixture | **incorporated** — fixture path added to §4 |
| `SPEC-R2-02` | low | NEW | Unchanged-surface list named nonexistent `CURRENT_CONFIG_SCHEMA_VERSION` | **incorporated** — corrected to the real `CONFIG_SCHEMA_VERSION` |

**Round-2 counts:** 0 high, 0 medium, 2 low. Incorporated 2; dismissed 0; barred 0; carries 0.

## Stop condition

No high or medium finding survives adjudication. Low findings are incorporated and do not require another round. No carry exists. The Specification is ready for human approval.
