### Readiness prerequisites paths/hooks can never produce exit 3 (contradicts the four-state contract)

- severity: high
- confidence: high
- location: R3 "Initial readiness prerequisites are bounded"; R2 exit table (plan §"Required outcomes")
- defect: R3 lists "every configured `paths` value remains valid under existing FS1 validation" and "configured hooks are schema-valid under existing FS1 validation" as readiness prerequisites, but FS1 `validateConfig` already validates `paths` and `hooks` as part of manifest validity. A manifest with invalid paths/hooks fails validation and is exit 2 ("malformed manifest"), so these can never be the "independently checkable readiness prerequisites … missing or invalid" that R2 defines as exit 3.
- evidence: `skills/sdlc/scripts/lib.mjs:110-141` (`validateConfig` rejects bad `paths`) and `:144-176` (`validateHooks`); R2 exit 3 requires "Manifest is tracked and **valid**"; R2 exit 2 covers "malformed manifest."
- impact: The spec author gets contradictory guidance — invalid hooks/paths route to exit 2 by FS1 but are listed as exit-3 not-ready blockers — freezing an incoherent classification into the public exit contract.
- fix: Drop paths/hooks from R3's readiness list (they are subsumed by manifest validity → exit 2), keeping only genuinely separate prerequisites (models file, readable workflow).

### DoD asserts mechanical tests over agent-executed prose; the core "fail before announcing" outcome has no verification path

- severity: high
- confidence: high
- location: DoD items "no case emits the configured announce string" and "mutation tests fail if exit 3 announces, enters a phase, stamps an agent…"; Objective; R5
- defect: The only "startup caller" that announces/enters phases is `SKILL.md`, which is agent-interpreted prose (the same transcript-only model ADR 0011 acknowledges), not code. `sdlc-status` never emits the `announce` string — the agent does — so a test that "no case emits the configured announce string" is vacuous against the script and unwritable against the agent.
- evidence: `skills/sdlc/scripts/sdlc-status.mjs:47-72` prints `opted-in: yes`, `root`, `prefix`… but never the `announce` string; the announce is emitted by the agent per `skills/sdlc/SKILL.md:11-19`. No code branches on the exit code — the gate is run by the agent (`SKILL.md:20-31`).
- impact: The plan's central objective ("startup fail before announcing… when foundations are incomplete") is not falsifiable by any mechanical check, yet the DoD claims "mutation tests" enforce it; the DoD is unfalsifiable for its primary caller.
- fix: Restate these DoD items as checks on `sdlc-status` output/exit codes only, and classify the `SKILL.md` branch honestly as transcript-audited prose rather than a mutation-tested caller.

### Non-git handling contradicts itself: exit 2 both "stops the SDLC" and "may only use advisory mode"

- severity: high
- confidence: high
- location: R1 (non-git paragraph); R5 (exit 2 branch); R2 (exit 1 definition)
- defect: R1 says a non-git directory "produces an explicit operational-error result [exit 2] and may only use the existing user-consented advisory mode," but R5's exit-2 branch is "surface the error and **stop** the SDLC," with advisory mode reachable only on exit 1. There is no mechanical path by which a non-git dir (exit 2) reaches advisory mode. R2's exit-1 definition ("no tracked manifest exists") also textually matches a non-git dir, overlapping with R1's exit-2 ruling.
- evidence: R5 exit 2: "surface the error and stop the SDLC"; R1: non-git "may only use the existing user-consented advisory mode"; current advisory offered only on exit 1 (`skills/sdlc/SKILL.md:22-31`); `resolveRoot` already exits 2 for non-git-with-no-manifest (`lib.mjs:60-71`).
- impact: The spec cannot implement both rules; a non-git consumer either stops with no advisory escape hatch (contradicting R1) or is offered advisory on an error (contradicting R5), and exit 1 vs 2 for non-git is ambiguous.
- fix: Pick one — route non-git to exit 2 with an explicit advisory-consent path in R5, or drop the "may use advisory mode" clause from R1 — and disambiguate R2 exit-1 to exclude non-git.

### "Committed" adoption vs git-index "tracked" left contradictory and untested

- severity: medium
- confidence: high
- location: R1 (Objective/title "Committed adoption"; body "tracked by git"); Risks "Git states"
- defect: The objective and R1 title say adoption is "committed," R1's body says "tracked by git," and the risk section says the contract "should rely on git's index rather than branch history." A manifest that is `git add`ed but never committed is in the index (tracked) but not committed — these definitions disagree, and no DoD item pins the staged-but-uncommitted case.
- evidence: R1: "adopted only when `.pi/sdlc/sdlc.config.json` is tracked by git"; title "Committed adoption is enforced"; Risks: "rely on git's index rather than branch history where possible"; DoD tests only absent/untracked/ignored/valid-tracked, not staged-only.
- impact: An irreversible exit contract would freeze an undecided semantic; index-based detection would classify a never-committed staged manifest as adopted, contradicting the "committed" objective consumers migrate against.
- fix: State explicitly whether "tracked" means index presence or a committed blob, and add a DoD fixture for the staged-but-uncommitted manifest.

### Unreadable-workflow / malformed-models exit classification is internally inconsistent

- severity: medium
- confidence: high
- location: R4 (aggregation example); DoD items 4–5; Constraints ("errors … distinct from known readiness blockers")
- defect: R4 and DoD item 5 firmly classify an unreadable workflow as an exit-3 readiness blocker ("missing models file and unreadable workflow reports both readiness blockers and exits 3"), while DoD item 4 calls "unreadable optional workflow" a "pinned, tested classification" (i.e. still open), and the Constraints say operational errors that prevent a trustworthy answer are distinct from readiness blockers — an unreadable file being an I/O error, arguably exit 2.
- evidence: R4: "unreadable workflow reports both readiness blockers and exits 3"; DoD: "malformed models and unreadable optional workflow have pinned, tested classifications"; Constraints: "Errors that prevent a trustworthy answer are distinct from known readiness blockers."
- impact: The spec receives conflicting signals on whether an unreadable file / malformed models yield exit 2 or exit 3, risking an inconsistent frozen exit contract.
- fix: Decide and state one classification for unreadable-workflow and malformed-models (exit 2 vs 3) in R3/R4, and remove the "open classification" framing from the DoD.

CLEAR: C — Scope is one coherent contract (the 0/1/2/3 policy, diagnostics, SKILL branching, ADR/migration for `sdlc-status`); parent stream already decomposed the rest into sub-changes 2–4, and this child's In/Out lists are mutually consistent.

CLEAR: D — The plan explicitly supersedes ADR 0010 and correctly declines to misclassify under ADR 0005/FS5, keeping FS1/FS2/FS3 frozen; this resolves the prior panel's ADR-0010 findings (`docs/reviews/plan-sdlc-adoption-contract-honesty-2026-07-12/claude-opus-4-8.md:18-21`).

CLEAR: F — Track is correctly declared irreversible; it freezes the public `sdlc-status` exit meanings and the `SKILL.md` gate, which is exactly the shape-freezing that forces the irreversible track.
