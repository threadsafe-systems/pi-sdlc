I have enough grounding. Writing the review.

### Child scope exceeds one coherent Specification

- severity: high
- confidence: high
- location: header "Owns programme outcomes: O1, O2, O8"; entire "Required outcomes" A1–A7 and "Scope › In"
- defect: This single child absorbs three programme outcomes and stands up or rewrites roughly six independent shipped surfaces at once: a redefined readiness state machine (A1), a greatly expanded setup that provisions PR template + CI workflow + lifecycle checks with collision/idempotency/consumer-equivalent/migration handling (A2), a new local lifecycle checker and a shipped GitHub Actions integration (A2/DoD), a both-track phase+PR+hook-timing contract rewrite in `SKILL.md` (A3), a package-relative invocation mechanism (A5), path-override plumbing through five subsystems (A6), and a new documentation-to-assets consistency checker (A4/A7). The programme itself decomposed to keep children spec-sized, yet child 1 is a mini-programme.
- evidence: Plan A1–A7 and "Scope › In" (nine bullets); governing programme `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md:32` "No child may absorb another child's frozen surface merely for convenience" and the five-way decomposition rationale (H1 in `docs/reviews/plan-sdlc-lifecycle-hardening-2026-07-12/consolidated.md:15` — "Programme scope exceeded one Specification").
- impact: A Specification cannot pin falsifiable scenarios for a readiness state machine, two new checker CLIs, a CI workflow installer, an invocation mechanism, and a track-contract rewrite in one coherent pass; several of these each freeze a distinct surface, so one spec/build will either sprawl or silently drop coverage.
- fix: Split child 1 into sequenced sub-changes (at minimum: readiness/opt-in semantics; setup+CI/PR provisioning; lifecycle+reference checkers; path/invocation plumbing) or have the Specification declare explicit internal phase gates per surface.

### Re-opens ADR 0010 opt-in exit-code semantics but cites the wrong frozen surface

- severity: high
- confidence: high
- location: A1 (three readiness states); "Risks and dependencies › Compatibility"; DoD item 1
- defect: A1 promotes exit 0 from "opted in" to "ready" and inserts a new "adopted but not ready" state, which changes the `sdlc-status` exit-code contract and the `SKILL.md` opt-in gate. The plan classifies this "against FS5," but FS5 (ADR 0005) governs only `resolve-panel` and `ensure-panel-agent`; the `sdlc-status` exit-code contract and the "run as law only on exit 0" rule are frozen by ADR 0010, which the plan never names or proposes to amend.
- evidence: `docs/adr/0005-script-clis-fs5.md` freezes flags/exit codes for `resolve-panel.sh`/`ensure-panel-agent.sh` only; `docs/adr/0010-opt-in-semantics.md` defines `sdlc-status` "exit 0 opted-in / 1 no manifest / 2 invalid" and "announces and runs as law only on exit 0"; `skills/sdlc/SKILL.md:22-30` branches behaviour on exit 0/1/2; plan risk text: "Exit-code and CLI compatibility must be classified against FS5 and migrated explicitly."
- impact: The spec author will classify against a surface that does not govern the changed script, and the plan silently contradicts a settled decision (ADR 0010) plus the shipped opt-in gate; a former exit-0 "opted-in" repo becoming "not ready" changes announce/law behaviour with no ADR amendment path named.
- fix: Add ADR 0010 (and the `SKILL.md` opt-in gate) to the locked decisions this child must amend/supersede, and classify `sdlc-status`/`setup-sdlc` exit codes there rather than under FS5.

### Ownership of O2 overclaimed; brainstorm-recap contract falls in a gap

- severity: medium
- confidence: high
- location: header "Owns programme outcomes: O1, O2, O8"; A3; "Scope › Out"
- defect: The child claims full ownership of O2, but the programme splits O2: the track-contract half is child 1's, while the "plain-Brainstorm recap" half is explicitly assigned to child 2. Child 1's outcomes (A3 lists phases and per-phase inputs) and DoD never mention the brainstorm decision-recap contract, and "Scope › Out" only excludes "authoring templates," not the recap contract — so the recap sub-outcome is owned by neither child concretely.
- evidence: Programme decomposition `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md:35-40` — child 1 "O1, O2, and O8" but child 2 "O3 plus the plain-Brainstorm recap"; programme O2 body (line ~ "Plain brainstorm ends with a concise, human-approved decision recap...").
- impact: A required programme outcome (the mandated brainstorm-recap content) can disappear between children — child 1 assumes child 2 has it, child 2's declared outcome is O3 — with no DoD in either plan able to catch the omission.
- fix: State that child 1 owns only O2's track/PR-contract portion and that the brainstorm-recap contract is child 2's, or explicitly pull the recap contract into child 1's outcomes and DoD.

### A4 documentation-honesty DoD is an unfalsifiable universal negative

- severity: medium
- confidence: high
- location: A4; DoD item "No shipped prose claims mandatory CI, templates, panel inputs, tracker facilities, files, or commands that are neither shipped nor readiness-verified."
- defect: Detecting a broken *reference* (a named file/path/command that does not resolve) is mechanically falsifiable, but proving the absence of *all* "mandatory claims" in prose requires semantic classification of which sentences assert a mandatory facility — which no check can exhaustively verify. The DoD is phrased as an absolute while A4's own text narrows to "high-value mandatory claims," and the risk section concedes "simple grep cannot understand every conditional."
- evidence: Plan A4 ("high-value mandatory claims that have no corresponding shipped/readiness-verified facility"), DoD item quoted above, and "Risks › Reference checking" ("simple grep cannot understand every conditional").
- impact: The DoD cannot be turned into a check that fails precisely when it is violated; a reviewer cannot falsify "no shipped prose claims mandatory X," so this gate is unobservable and the plan overpromises versus the enumerable-reference check that is actually buildable.
- fix: Rewrite the DoD to the falsifiable form — every enumerated normative reference resolves or is marked optional/consumer-owned, and a pinned inventory of mandatory-facility claims each maps to a shipped or readiness-verified target.

### A5 mandatory invocation-portability outcome rests on an unconfirmed pi mechanism

- severity: medium
- confidence: medium
- location: A5; A2 bullet "package-relative command access that works while cwd is the consumer repo"; DoD item "Supported package commands execute from an installed-consumer fixture cwd..."
- defect: A5 states as a required outcome that every documented command works from consumer cwd without the caller knowing the package checkout path, yet the plan's own risk admits "pi package discovery may not expose a conventional binary path... verify the supported pi mechanism rather than inventing one." If pi exposes no such mechanism, the outcome and its DoD are unsatisfiable within this child.
- evidence: Plan A5 and DoD invocation item; "Risks › Invocation portability"; today's docs hard-code package-relative paths that do not resolve from consumer cwd (`README.md:56-57` `skills/sdlc/scripts/...`, `templates/setup-sdlc.md:10`, `skills/sdlc/SKILL.md:22`), and ADR 0009 documents distribution only as pi *skill* discovery (`docs/adr/0009-distribution-model.md`), not a CLI path.
- impact: A mandatory outcome with a DoD gate depends on an external capability that is unverified at plan time; if it is absent, the child cannot reach DoD and the objective ("Commands are executable from consumer cwd") is not falsifiably achievable.
- fix: Downgrade A5 to require verifying the pi invocation mechanism first and make the command-portability guarantee conditional on that mechanism existing, with a named fallback if it does not.

### A6 attributes a "retain, never remove" paths decision the programme left open

- severity: low
- confidence: medium
- location: A6 "The programme decision is to retain and honour all existing `paths` overrides, not remove them."
- defect: The child states retention as a settled programme decision, but the governing programme leaves the fork open — paths overrides are "either honoured throughout... or removed through an explicitly versioned contract change." No governing constraint or human gate in the programme records a locked "retain, do not remove."
- evidence: Plan A6 quoted; programme O8 `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md` ("either honoured... or removed through an explicitly versioned contract change") and its "Constraints and locked decisions" list, which does not lock retention.
- impact: The child closes a real design fork and attributes it to a decision the programme did not make, so a downstream spec/PR panel cannot trace the choice to an approved locked decision.
- fix: Either cite the specific human-gate approval that locked retention, or reframe A6 as this child's own proposed decision (to be ratified at its plan gate) rather than "the programme decision."

CLEAR: F — the child honestly self-classifies as **irreversible** and commits to classifying FS1/FS5 and new shipped surfaces before implementation; nothing it freezes is mislabelled reversible (the only defect is the *which-surface* mis-citation, captured above under D).
