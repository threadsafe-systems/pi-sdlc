# PR review consolidation — OL-A opt-in lifecycle config

- PR: #48
- Date: 2026-07-15
- Author model: anthropic/claude (excluded by frozen v1 author-vendor rule)
- Panel: openai-codex/gpt-5.6-sol:medium, zai/glm-5.2:medium, deepseek/deepseek-v4-pro:medium
- Scope: implementation diff against approved OL-A spec rev 4; per-model reports beside this file.

## Findings and adjudication

| # | Finding (deduplicated) | Severity | Adjudication |
|---|---|---|---|
| P1 | Custom interactive `mergePlanSpec` silently coerces every answer except exact `true` to false | medium | **Fixed.** Exact `{true,false}` choice validation; invalid answers refuse immediately with text and exit 1. Real PTY regression covers `yes`. |
| P2 | Other free-form custom-interview dials are validated only after all questions; the text report omits `report.error`, producing an unexplained failure | medium (one panel; low in another) | **Fixed on the new surface.** Every enum, positive integer, and tracker threshold is now validated at its prompt and refuses immediately with a textual diagnostic. Real PTY regression covers an invalid plan mode. We deliberately did **not** change global `renderReport`: that pre-existing asymmetry would alter no-profile v1 error output and violate NF-1(c). |
| P3 | `readLifecycle` catch-all treats permission/I/O failures as an absent/unparseable config and silently takes v1 | low | **Fixed.** Only ENOENT and JSON parse failure take v1; other read failures exit 1 naming the config path. Regression uses an unreadable config. |
| P4 | `--profile` writes without `--yes` | low | **Dismissed.** All existing substantive setup flags select the non-interactive path and write without requiring `--yes`; §4.3's `--profile … --yes` is the OLA14 invocation, not a new confirmation invariant. Requiring `--yes` only for this substantive flag would be inconsistent and was not specified. |
| P5 | Custom interview lacks per-field validation | low | **Folded into P1/P2 and fixed.** |
| P6 | Lifecycle `--pong` has no dedicated test and probes at `--thinking off` | low | **Dismissed as pre-existing and explicitly ratified.** FS2 schema text already records that `--pong` always uses `--thinking off`, confirmed harmless; OL-A does not alter `pongOk`. Existing v1 coverage exercises it. |

## Verification

After fixes: focused setup+resolver suites PASS (19/19), full corpus PASS (187/187), lint PASS, LSP clean. T2/T3 PV1 reports are refreshed below their existing receipts before the verification panel.

## Stop condition

Initial panel's high findings: 0. Medium findings P1/P2 are fixed. Awaiting same-panel verification; no medium may remain.

## Verification panel

The same three-model panel verified fix commit `c30006a`:

- P1 exact Boolean handling: **RESOLVED**.
- P2 immediate textual per-field validation, with global renderer unchanged for NF-1(c): **RESOLVED**.
- P3 non-ENOENT filesystem errors refuse while ENOENT/JSON parse retain v1 fallback: **RESOLVED**.
- New high/medium findings: **none**.
- Evidence: 19/19 focused, 187/187 full corpus, lint PASS; per-model verification files beside this consolidation.

**Final stop condition: met.** No high or medium finding survives adjudication and verification.
