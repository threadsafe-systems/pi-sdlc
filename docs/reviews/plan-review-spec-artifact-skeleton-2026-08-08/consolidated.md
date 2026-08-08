# Plan panel — consolidated adjudication (round 1)

- Run: `spec-artifact-skeleton` (map #192, slice S1)
- Track: irreversible
- Artifact: `docs/plans/2026-08-08-spec-artifact-skeleton.md` @ `756f929`
- Panel: `google/gemini-3.1-pro-preview:xhigh`, `openai-codex/gpt-5.6-luna:xhigh` (floor 2 met)
- Orchestrator: `maas-qwen/qwen3.8-max` (this session's actual model; see identity note)

## Identity note

`resolve-panel` was invoked with `--author anthropic/claude-fable-5` (the configured `authorDefault`) before the orchestrator verified its live identity. The session is actually running `maas-qwen/qwen3.8-max`, which does not appear in the plan_review roster at all, so no self-review occurred and panel composition is valid under either author identity; the only effect of the wrong author flag was excluding `claude-fable-5` from round 1's candidate pool. Round 2 and all later record-keeping use the verified identity.

## Findings

| id | sev | origin | raised by | title | disposition |
|---|---|---|---|---|---|
| PLAN-R1-01 | high | NEW | gemini + luna | Binding rules unenforced: plan relies on the spec panel while forbidding the `adversary-spec.prompt.md` change that would teach it the rules | incorporated |
| PLAN-R1-02 | high | NEW | luna | New public reference lacks the FS11 `normative-references.json` inventory row; DoD 7 (inventory passes) is unreachable as scoped | incorporated |
| PLAN-R1-03 | high | NEW | gemini | DoD 3 asks tests to assert the skeleton "requires" the three scenario parts — unfalsifiable on static markdown without the banned mechanical checker | incorporated |
| PLAN-R1-04 | medium | NEW | luna | Objective's "prevention" outcome has no falsifiable verification path; tests only prove guidance presence | incorporated |
| PLAN-R1-05 | medium | NEW | luna | Two-file-change boundary contradicts the required contract tests (and inventory metadata) | incorporated |
| PLAN-R1-06 | medium | NEW | luna | "Contracts per changed interface" (skeleton) vs "every interface named in the body" (binding rule) — coverage split undefined (also unresolved in the R3 brief) | incorporated |
| PLAN-R1-07 | medium | NEW | gemini + luna | Contract tests / CI gate unbudgeted (proportionality); "touched-surface lint" names no existing command | incorporated |

Cross-model agreement on PLAN-R1-01 and PLAN-R1-07 is treated as strong signal. Gemini additionally returned CLEAR lines for B/C/D/F; luna for A/E/F.

## Adjudication

- **PLAN-R1-01 — incorporated.** Enforcement is intrinsic to S1's ratified purpose ("closes the author/reviewer asymmetry at its most expensive gate"); a skeleton the gate cannot check closes nothing. Plan rev 2 moves `adversary-spec.prompt.md` into scope: add attack surfaces that name the skeleton's five components and point at `references/spec-artifact-skeleton.md` (reference, never restate — single source of truth), and unfreeze the file under the FS19 deliberate-change precedent set by S5. This extends the R5 line-58 file list (`phase-spec.md` §4 + template); recorded here for owner ratification at the gate, since the extension is required by the ratified purpose rather than by new scope.
- **PLAN-R1-02 — incorporated.** Add the inventory row and metadata change to scope.
- **PLAN-R1-03 — incorporated.** DoD 3 rewritten to "the skeleton contains the three-part form as literal fill-in blocks, and the binding rules appear verbatim in `phase-spec.md` §4 and the prompt's attack surfaces."
- **PLAN-R1-04 — incorporated.** Objective recast: the skeleton makes omissions explicit, structured, and reviewable at authoring time; enforcement is the panel's (now prompt-supported) job. No mechanical-prevention claim survives.
- **PLAN-R1-05 — incorporated.** The two-surface boundary now governs production authoring prose only; contract tests, inventory metadata, and the deliberate prompt/frozen-list changes are named permitted change classes.
- **PLAN-R1-06 — incorporated.** Binding rule defined as: every interface this change introduces or modifies gets a Contracts block; interfaces mentioned only as unchanged context do not, and must not be silently re-described. The spec phase owns the final wording.
- **PLAN-R1-07 — incorporated.** Budgets stated: contract tests are pure offline string assertions over two markdown files, < 1 s; full gate runs `npm test` under a 30-second external timeout with no network (matching the #177 precedent); lint names the real command (`biome check` over changed files).

## Dismissal posture

Round 1: 7 incorporated, 0 dismissed. All seven findings are evidence-backed contradictions between the plan's own text and repo machinery (`check-references.mjs`, `frozen-surfaces.test.js`, `adversary-spec.prompt.md`, `package.json`), so no dismissal was warranted; per the dismissal posture this 100% incorporation wave is flagged for the owner's awareness rather than recorded as diligence.

## Round map

- round 1 ↔ this `consolidated.md` ↔ `panel.dispatched`/`panel.consolidated` (wave 1) ↔ harvest `plan_review-round1-2026-08-08`.
