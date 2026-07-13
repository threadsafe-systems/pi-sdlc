### Hook transition-ordering DoD item is non-falsifiable and silently contradicts ADR 0011

- severity: high
- confidence: high
- location: Plan §A3 ("Both tracks have complete, non-contradictory contracts") and Definition of done item 8
- defect: DoD #8 demands "Tests prove the standard transition order, including before-hooks, review/gate, human approval, after-hooks, and next-phase entry," but ADR 0011 explicitly freezes that there is "NO mechanical runner and NO CI check that hooks fired; the audit trail is the announce-on-fire transcript." Hooks are agent-executed prose law, so no spec can write a check that *fails* when an agent reorders a hook — the DoD is unfalsifiable as written. The only way to make it mechanically true is to introduce a hook runner, which contradicts ADR 0011; yet this child does NOT flag itself as re-opening that ADR (the programme reserves that for child 3 — `docs/reviews/plan-sdlc-lifecycle-hardening-2026-07-12/consolidated.md` M1).
- evidence: Plan A3 line ~67 "before-hook, work, review/gate, approval, after-hook, and transition ordering"; DoD line ~207 "Tests prove the standard transition order, including before-hooks ..."; contradicted by `docs/adr/0011-hooks-surface.md` "NO mechanical runner and NO CI check that hooks fired." The plan's own Risks section never names ADR 0011.
- impact: The spec inherits a DoD it cannot satisfy without breaking a locked decision, or it silently weakens the honesty guarantee ADR 0011 was written to protect. This blocks a clean Build gate.
- fix: Reword DoD #8 / A3 to assert only what is mechanically testable (e.g. the lifecycle artifact-checker verifies the *documented* phase→gate→artifact ordering and the contract's internal coherence), and explicitly declare that hook *execution* ordering remains transcript-only per ADR 0011 unless child 3 re-opens it.

### "Adopted but not ready" state is unresolved against the ADR 0010 / FS5 exit-code contract

- severity: medium
- confidence: high
- location: Plan §A1 and Risks ("Compatibility"); interacts with `docs/adr/0010-opt-in-semantics.md` and `docs/adr/0005-script-clis-fs5.md`
- defect: A1 introduces a new "adopted but not ready" state (manifest present, mandatory assets absent) distinct from "ready," but never states whether that state is a new exit code or merely a status field. ADR 0010 pins the gate to exits 0/1/2 and the SKILL opt-in gate branches on exactly those (`skills/sdlc/SKILL.md` §Opt-in). If a not-ready repo still exits 0, the skill proceeds "under full law" — directly negating A1's goal; if it exits a new code (3), that is a frozen-surface FS5 exit-code change (ADR 0005: "changing an exit code is a breaking change") the plan neither scopes nor flags as a re-open.
- evidence: `skills/sdlc/scripts/sdlc-status.mjs` exits 0 on bare manifest existence; `docs/adr/0010-opt-in-semantics.md` fixes "exit 0 opted-in / 1 no manifest / 2 invalid"; `docs/adr/0005-script-clis-fs5.md` "changing an exit code is a breaking change." Plan A1 only says readiness "must not make a paid model call" and Risks says compatibility "must be classified against FS5" — without naming this specific contradiction.
- impact: The single most consequential design choice of the child (how readiness is signalled to the gate) is left to the spec with an unresolved locked-decision collision, risking either a silent breaking change or a non-functional readiness signal.
- fix: Pin in the plan whether not-ready is exit 0-with-status or a new exit code, and if the latter, explicitly mark it as an FS5/ADR-0005 breaking change requiring a major migration (consistent with the plan's own ADR-classification DoD).

### Irreversible-track statement omits FS7; A4's "mandatory claims" honesty ignores prompt overrides

- severity: medium
- confidence: high
- location: Plan Track statement (header) and §A4 / A7
- defect: The track line scopes only "FS1/FS5 changes and any new shipped surfaces," but A7/A4 require editing the frozen prompts `skills/sdlc/prompts/adversary-review.prompt.md:15` ("AGENTS.md/CONTRIBUTORS.md") and `skills/sdlc/prompts/validator-task.prompt.md:8,15,25` ("<CONTRIBUTORS_PATH>"). Prompts are FS7 (`docs/adr/0007-prompt-skeletons-fs7.md`), and a consumer who has overridden a prompt keeps the broken reference, so A4's "mandatory claims coupled to shipped/verified reality" is silently unmet for the override case.
- evidence: `skills/sdlc/prompts/adversary-review.prompt.md:15` and `validator-task.prompt.md:25` carry the wrong file name; `docs/adr/0007-prompt-skeletons-fs7.md` "Overrides are whole-file ... the consumer owns keeping them in step"; plan Track line enumerates only FS1/FS5 and "new shipped surfaces."
- impact: The frozen-surface inventory shipped to the spec is incomplete, and A4's docs-to-assets honesty goal has a documented hole (consumer overrides) the plan never acknowledges.
- fix: Add FS7 to the track classification and add an A4 clause stating how mandatory-claim honesty is expressed for consumer-overridden prompts (or accept it is package-owned-references only and say so).

### Scope: A3 "transition ordering" overlaps child 2's owned "transition sequence," and the child still bundles several engineering products

- severity: medium
- confidence: high
- location: Plan §A3, Scope §In ("Standard phase-transition and hook timing semantics"), versus programme O2/O3
- defect: The programme assigns "transition point" to child 1 (O2, `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md:93`) AND "transition sequence" to child 2 (O3, lines 40 and 276). Child 1's A3 and In-scope re-state "transition ordering" without sharpening the boundary against child 2, so the two specs will collide on the same contract surface — the exact drift the programme's own coordination risk warns about. Independently, A1–A7 still bundles at least three separable products (readiness+setup rewrite; a new local lifecycle checker + GitHub Actions integration; a docs-to-assets reference checker) behind one spec.
- evidence: Plan A3 line ~67 and In line ~133 ("Standard phase-transition and hook timing semantics at the contract level"); programme O2 line 93 vs O3 lines 40/276; new "local lifecycle checker and shipped GitHub Actions integration" appears as a single DoD item (#6) with no decomposition.
- impact: Either a duplicated/contradictory transition contract across children, or a spec too large to gate cleanly in one Plan→Spec→Build cycle (the same class of defect the programme was decomposed to fix).
- fix: Either move "transition ordering" to child 2 and limit child 1 to phase *input/PR* contracts, or state an explicit, testable boundary; consider splitting the new lifecycle-checker + CI into its own child or declared sub-spec.

### A5 / DoD #10 hard gate depends on an unverified pi invocation mechanism with no fallback

- severity: low
- confidence: medium
- location: Plan §A5 and DoD item 10; Risks ("Invocation portability")
- defect: A5 and DoD #10 require "Supported package commands execute from an installed-consumer fixture cwd for ... panel stamping/resolution, and lifecycle checking," but the plan's own Risks admits "pi package discovery may not expose a conventional binary path. The Specification must verify the supported pi mechanism rather than inventing one." A required outcome that is contingent on an externally-verifiable mechanism the plan has not verified, with no fallback, is at risk of being unverifiable.
- evidence: Plan Risks "Invocation portability" vs. A5 outcome and DoD #10; `resolve-panel.mjs` only invokes `pi` for `--pong` (excluded from tests), so the precise installed-consumer surface to exercise is unspecified.
- impact: If the pi mechanism cannot be verified, the spec inherits a DoD it cannot pass, or silently invents an unsupported invocation path.
- fix: Make A5/DoD #10 conditional on the Specification first verifying the pi package invocation surface, and name the exact commands (excluding any live-`pi` path) the fixture exercises.

CLEAR: E — the Risks section is thorough: it names git-commit-detection nondeterminism, consumer-equivalence strictness, CI workflow collision, invocation portability, reference-checking limits, and exit-code/compatibility classification; the principal residual (the ADR 0011 hook-ordering tension) is captured under the first finding rather than as a missing risk.
