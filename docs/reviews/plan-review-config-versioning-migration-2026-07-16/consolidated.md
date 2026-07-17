# Consolidated plan review — config-versioning-migration

- Orchestrating model: anthropic/claude (session author; vendor excluded from
  the panel per roster rules)
- Panel: openai-codex/gpt-5.6-sol:high · zai/glm-5.2:high ·
  deepseek/deepseek-v4-pro:high
- Cycle 1 target: plan rev 1 (uncommitted draft @ 538735d)
- Every factual claim below was spot-verified in the tree before adjudication
  (grep/read), per the ~80%-right rule.

## Cycle 1 — findings and adjudication

| # | Finding | Severity | Models | Adjudication |
|---|---|---|---|---|
| C1 | FS5/ADR 0005 reopened silently: preference-mode exit 0 breaks the frozen `0/1/2` exit contract; advisory on stdout would corrupt `--emit-tasks` JSON; `--models-file` left undisposed | high | all 3 | **Incorporated** (rev 2): FS5 named as a reopened surface; 4th ADR-ledger entry amending ADR 0005; shortfall advisory pinned to **stderr** (adjudicated correction of #54's informal "stdout" — the substantive #54 decision was *print at resolve time*, and FS5 reserves stdout for machine output); `--models-file` retired with an explicit deprecation error riding the same major. deepseek's alternative (keep exit 1, proceed) **dismissed**: #51/#52 decided `preference` never hard-fails; a non-zero exit keeps CI red and defeats the decision. |
| C2 | Interactive migration prompt has no reachable entrypoint: SKILL.md forbids entering any phase on FS8 exit 3, and DoD only tested the non-TTY halt | high | sol | **Incorporated** (rev 2): `setup-sdlc` designated the interactive migration entrypoint; SKILL.md exit-3 flow amended to permit exactly the migration remedy from `not-ready`; DoD gains accept/decline/non-TTY scenarios. |
| C3 | The merge necessarily reopens FS10 (setup's `--with-models`/models asset), which scope assigned to OL-B | high | sol | **Incorporated** (rev 2): this change absorbs an explicit FS10 bump scoped to the merged-file surface (ADR 0018 revision; `--with-models` retired, models asset folded); OL-B's separate FS10 report-nudge bump noted as composing, not colliding. |
| C4 | Fold atomicity unspecified: write-nothing only covered unmappable input, not filesystem failure mid-fold | high | sol | **Incorporated** (rev 2): staged atomic replacement (merged file durably written before the models file is removed; any failure leaves originals intact) + fault-injection tests in DoD. |
| C5 | OL-A reconciliation deferred / `minVendor` contradicts shipped vendor-drop; no composition rule for the toggle vs `lifecycle.gates.*.mode` | high | glm, deepseek (sol variant) | **Incorporated** (rev 2) as a binding composition principle: the toggle is subordinate to per-gate `mode` and governs only whether diversity-floor shortfall is fatal or advisory where a panel forms; the two axes are exclusive — `lifecycle` present ⇒ `minPanel` is the sole floor and `minVendor` is not applicable; `minVendor` exists only as the folded legacy axis for non-lifecycle adopters. OL-A's vendor-drop stands inside the lifecycle vocabulary. |
| C6 | DoD-1 consumer list wrong: `validate-task`/`check-references` consume neither old file; `ensure-panel-agent` (readConfig) omitted | medium | all 3 | **Incorporated** (rev 2): rationale and DoD list corrected to the verified set. |
| C7 | `check-lifecycle`'s own `config.valid` (via `inspectConfig`) hard-rejects v2 — a migrated repo's CI fails | medium | deepseek | **Incorporated** (rev 2): scope/DoD specify `check-lifecycle` accepts `schemaVersion: 2` (it does not own drift detection). |
| C8 | Single fixture can't verify both fold branches (lifecycle-present vs -absent) | medium | sol | **Incorporated** (rev 2): DoD-2 fixture matrix over both branches, author-exclusion, credential shortfalls. |
| C9 | Merged filename reopened despite #52 fixing `sdlc.config.json` | medium | sol | **Incorporated** (rev 2): filename binding, removed from open Spec items. |
| C10 | Majors-block has no enforcement: a plain `feat:` ships a minor and silently hits unpinned consumers | medium | glm | **Incorporated** (rev 2): CI guard added to scope/DoD — fail when the schema shape/`schemaVersion` constant changes without a breaking-change signal. |
| C11 | "Fold cures the dogfood drift" is false (the fold preserves the vendor axis by design) and re-scopes an item map #49 excluded | medium | glm | **Incorporated** (rev 2): claim struck; drift noted as separate hygiene. |
| C12 | DoD-7 "every … updated and green" unenumerable | low | glm | **Incorporated** (rev 2): bindings enumerated. |
| C13 | `normative-references.json` carries models-file targets that go stale after the fold | low | deepseek | **Incorporated** (rev 2): inventory update added to scope/DoD. |

Cycle 1 outcome: 5 high, 6 medium, 2 low; all incorporated (one sub-option
dismissed with reason at C1). Plan revised to **rev 2**; cycle 2 dispatched
against rev 2.

## Cycle 2 — findings and adjudication (target: plan rev 2)

Panel: same three models. glm-5.2 returned **no findings** (response contained
only a review-hygiene note; recorded verbatim in its cycle-2 file). All factual
claims below spot-verified in the tree before adjudication.

| # | Finding | Severity | Models | Adjudication |
|---|---|---|---|---|
| C14 | Fold atomicity impossible as stated: "original pair intact after any failure" cannot hold across two files with ordinary file ops (interruption between rename and unlink leaves v2 + stale models file) | high | sol | **Incorporated** (rev 3): replaced with a journal/backup **recovery contract** — the observable post-recovery state is either the complete original v1 pair or the complete v2 state; a leftover models file beside a valid v2 config is defined as cleanup-safe residue, detected and removed by the next migration-entrypoint run. |
| C15 | Release guard checks "the PR's commits", but semantic-release under this repo's squash workflow reads the squash/PR title — an inner `feat!` greens the guard while the release ships a minor | high | sol | **Incorporated** (rev 3): guard binds to the **release-visible subject** (merge-mode-aware: the squash/PR title on squash merges), not any branch commit. |
| C16 | FS8 `models.head/clean/valid` checks hardcode the separate models file; after the fold, a migrated repo (incl. dogfood) fails readiness on a file that correctly no longer exists — DoD-10 unreachable | high | deepseek | **Incorporated** (rev 3): FS8 v2 scope now disposes the three models checks for `schemaVersion >= 2` configs — models data validity folds into `config.valid`; the head/clean concerns are already covered by `adoption.manifest-*` on the merged file; whether the ids report as pass-with-note or leave the v2 check set is a Spec/ADR-0016-revision detail, but the disposition itself is plan-bound. |
| C17 | Interactive migration ownership contradictory: loader prompts everywhere vs setup-sdlc as sole surface vs handoff reopening loader ownership | medium | sol | **Incorporated** (rev 3): bound — shared loader is **detection-only** (never prompts, never writes); confirmation/writes live **exclusively in `setup-sdlc`**; every other consumer halts with the remedy even on a TTY; the open Spec item narrowed to plumbing only. |
| C18 | Fresh adopters' `enforcement` posture undefined; #52 ratified preference-as-default with strict opt-in | medium | sol | **Incorporated** (rev 3): fresh setup writes `preference` by default, human may select `strict`; falsifiable DoD scenario added. |
| C19 | FS10 reopen lacks a versioned acceptance contract (report envelope still v1; no `--with-models` retirement test) | medium | sol | **Incorporated** (rev 3): bound to FS10 **schemaVersion 2** with text/JSON golden tests and a `--with-models` deprecation-error test. |
| C20 | setup-sdlc reads the old config through the same shared loader whose guard halts on old versions — circular dependency at the migration entrypoint | medium | deepseek | **Incorporated** (rev 3): the migration entrypoint uses a **raw-read path** that bypasses the version guard (scoped to setup-sdlc only). |

Cycle 2 outcome: 3 high, 4 medium; **all incorporated** into rev 3; none
survive adjudication. Two-cycle maximum reached (owner-directed); rev 3 passes
to the human owner for the plan gate. No high or medium finding survives.

## Stop condition

Met after cycle 2: zero surviving high/medium findings. Low findings: none
outstanding (C12/C13 were incorporated rather than parked). Orchestrating
model disclosed above.
