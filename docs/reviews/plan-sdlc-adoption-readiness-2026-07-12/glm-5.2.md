### DoD item 7 overclaims mechanical testability of agent behaviour and re-opens the ADR 0011 boundary the parent stream closed

- severity: medium
- confidence: high
- location: `docs/plans/2026-07-12-sdlc-adoption-readiness.md` DoD item 7 (lines 188–190); also R5 (lines 91–99)
- defect: The DoD requires "mutation tests fail if exit 3 announces, enters a phase, stamps an agent, mutates a tracker, or claims a gate." Announcing, phase-entry, panel-agent stamping, tracker mutation, and gate-claiming are agent-executed prose actions with no mechanical runner, so no test can fail when an agent does them on exit 3. The only achievable test is a doc-presence assertion on `SKILL.md`'s exit-3 branch plus mechanical `sdlc-status` exit-code checks.
- evidence: ADR 0011 (`docs/adr/0011-hooks-surface.md`) freezes "NO mechanical runner and NO CI check that hooks fired"; `skills/sdlc/SKILL.md:346-347` repeats "there is no mechanical runner." The parent stream's consolidated review adjudicated this exact class as H2 — "This stream now tests only internal track-contract coherence. Live hook execution stays transcript-only under ADR 0011" (`docs/reviews/plan-sdlc-adoption-contract-honesty-2026-07-12/consolidated.md`, H2). The only shipped startup caller is the agent reading `SKILL.md`; no mechanical caller branches on the exit code (`.github/workflows/ci.yml` runs `npm test`/`lint`, never `sdlc-status`).
- impact: A DoD item that cannot be falsified as written. Build will either implement an impossible test or silently reinterpret it as a doc-grep, leaving the agent-behaviour claim untested and re-opening the transcript-only boundary the parent stream explicitly closed.
- fix: Re-scope the item to (a) doc-presence mutation tests that mutate `SKILL.md`'s exit-3 branch and expect a `docs.test`-style assertion to fail, and (b) mechanical `sdlc-status` exit-code tests; state explicitly that agent adherence to "no announce/stamp/mutate/gate on exit 3" remains prose law under ADR 0011, not a mutation-tested behaviour.

### "Tracked adoption" gives the Specification two incompatible tests (git index vs committed-on-branch)

- severity: medium
- confidence: high
- location: R1 (lines 32–34) vs Risks (line 160)
- defect: R1 says "A valid manifest committed on the current worktree's branch counts as tracked adoption," but Risks says "The contract should rely on git's index rather than branch history where possible." `git ls-files` (index) reports a `git add`-ed but uncommitted manifest as tracked, which contradicts "committed on the current worktree's branch." The spec author is handed two different pass/fail criteria for the staged-uncommitted case.
- evidence: Plan lines 33–34 ("committed on the current worktree's branch counts as tracked adoption") vs line 160 ("rely on git's index rather than branch history"). These are mechanically distinct git queries.
- impact: The headline outcome R1 ("committed adoption is enforced") is not pinable; implementers will pick index (admitting uncommitted manifests as adopted) or commit-on-branch, and the test fixtures will enshrine one silently. This is exactly the kind of irreversible shape the plan exists to freeze.
- fix: Pick one test in the plan — e.g. "tracked = present in `git ls-files` for the resolved worktree (index), AND the index entry reflects a committed blob on the current branch" — and make R1 and Risks agree, with a named fixture for staged-but-uncommitted.

### Models/workflow 2-vs-3 classification is under-pinned and the existing validators are FS5-coupled (exit-2), a dependency the plan never names

- severity: medium
- confidence: high
- location: R2 (lines 40–49), R3 (lines 56–66), DoD item 4 (line 182); dependency at `skills/sdlc/scripts/lib.mjs:188,203` and `skills/sdlc/scripts/resolve-panel.mjs:50`
- defect: R2 defines exit 3 as a readiness prerequisite that is "missing or invalid" and R3 lists "present, schema-valid `sdlc.models.json`" as a readiness prerequisite, so by the plan's own rule an invalid models file is exit 3. Yet DoD item 4 only says "malformed models … have pinned, tested classifications" (deferred), and the existing `readModels`/`validateModels` exit 2 via `fail()` and are consumed by `resolve-panel` under ADR 0005/FS5. To emit exit 3 for models the implementation cannot reuse those functions; it needs a new non-fatal validation seam the plan does not mention.
- evidence: `lib.mjs:188` `readModels` calls `fail(...)` (exit 2) on a missing file and `lib.mjs:203` `validateModels` calls `fail(...)` on every invalidity; `fail` defaults to code 2 (`lib.mjs:71-74`). `resolve-panel.mjs:50` consumes `readModels`, and ADR 0005 (`docs/adr/0005-script-clis-fs5.md`) freezes resolve-panel's "exit codes (0 ok / 1 under-panel / 2 bad input)." Plan R2 line 47 ("one or more independently checkable readiness prerequisites are missing or invalid" → exit 3) vs DoD line 182 (malformed models classification left to spec).
- impact: Either the spec reuses the fatal validators and silently forces malformed models to exit 2 (contradicting R2/R3), or it adds a parallel non-fatal validator and risks disturbing the FS5-coupled path. The plan's constraint "FS2 schemas remain unchanged" reads as "reuse validation unchanged," which would produce the wrong exit code.
- fix: Add a risk/dependency line: "Models and workflow readiness checks require a non-fatal validation path; the existing `readModels`/`validateModels` are FS5-coupled (exit 2) and must not be reused for exit-3 classification," and pre-commit malformed-models and unreadable-workflow to exit 3 in R2/R3 rather than deferring.

### Non-git exit-1→exit-2 behaviour change is absent from the R6 migration guidance

- severity: low
- confidence: medium
- location: DoD item 3 (line 179), R6 (lines 107–117); current behaviour at `skills/sdlc/scripts/sdlc-status.mjs:28` and `skills/sdlc/scripts/lib.mjs:71-72`
- defect: The plan makes a non-git root return exit 2 (DoD item 3; R1 lines 28–30). Today, a non-git directory reached via `--repo-root` resolves without a git check (`lib.mjs:71-72`) and, lacking a manifest, exits 1 with the advisory/setup prompt (`sdlc-status.mjs:28-35`). R6's migration guidance only covers "callers that previously treated any manifest-backed exit 0 as readiness" and never mentions the non-git exit-1→exit-2 change.
- evidence: `sdlc-status.mjs:28` `if (!existsSync(manifest))` → exit 1 path reached for non-git `--repo-root` dirs; plan R6 (lines 110-117) lists only the exit-0-as-readiness migration and the "next sub-change" notice.
- impact: A consumer or CI that today legitimately gets exit 1 (and an advisory offer) in a non-git working dir will get exit 2 ("error") with no documented migration, and may branch it as a hard failure rather than "not adopted."
- fix: Add a one-line migration note in R6: "non-git roots previously surfaced as exit 1 (not adopted) when reached via `--repo-root`; they now surface as exit 2 (error) — callers must not treat 2 as advisory."

### New machine-consumable output is a CLI surface consumers bind to, but the plan blanket-disclaims FS5 without classifying it

- severity: low
- confidence: medium
- location: R4 (lines 79–87), track line (lines 7–10)
- defect: R4 introduces a machine-consumable aggregate output (root, state, stable check IDs, per-check result, remediation). The plan's track statement asserts the change is "not misclassifying … under ADR 0005/FS5," but a new machine-readable output shape on a script CLI is precisely the kind of frozen surface ADR 0005 governs for the sibling scripts; whether this new shape is frozen-at-ship or provisional is left entirely to the spec.
- evidence: Plan lines 7–10 disclaim FS5; R4 line 87 says "The Specification pins the output/flag shape and compatibility classification." ADR 0005 freezes "the `--emit-tasks` JSON shape, and exit codes" for the sibling CLIs.
- impact: Consumers/CI that parse the new machine output will bind to whatever shape ships; if the spec does not freeze it (or freezes it without an ADR), a later tweak is an untracked breaking change.
- fix: State in the plan whether the new machine output is frozen-at-ship under a new ADR (an FS5-analogue for `sdlc-status`) or explicitly provisional/unfrozen for this child, rather than disclaiming FS5 categorically.

### "Absent manifest → exit 1" DoD item omits the git context, leaving it ambiguous against the non-git→exit-2 rule

- severity: low
- confidence: medium
- location: DoD item 2 (lines 175–177)
- defect: DoD item 2 requires "Absent … manifests … return exit 1" but does not say "in a git fixture," while DoD item 3 makes a non-git root exit 2. The existing test harness builds non-git temp dirs for exactly this case (`test/sdlc-status.test.js:60-70`, `mkRepo` with no `git init`), so a falsifiable test could be written two ways and yield opposite exit codes for "absent manifest."
- evidence: `test/sdlc-status.test.js` `mkRepo` (lines 18-25) creates a plain `mkdtempSync` with no `.git`; the "manifest-less repo exits 1" test (lines 60-70) currently passes only because today non-git+no-manifest is exit 1 — which the plan changes to exit 2.
- impact: The Specification/Build could inherit the existing non-git fixture and "absent → exit 1" would then conflict with "non-git → exit 2," forcing a late fixture rework and an ambiguous sign-off.
- fix: Qualify DoD item 2 as "absent manifest in a git-initialized fixture returns exit 1," and note that the existing non-git temp-dir fixture must be converted to a `git init` fixture.

CLEAR: C — Scope is one coherent Specification: the plan owns only readiness semantics (sdlc-status policy/exit contract, git-tracked detection, current config/models/workflow prereqs, SKILL.md branching, migration, ADR 0010 supersession, fixtures); provisioning, PR templates, lifecycle checker, reference checking, path plumbing, author-model prefs, and live PONGs are all explicitly Out and assigned to named sub-changes. The parent stream's H1 (too broad for one spec) was already resolved by the four-way decomposition.

CLEAR: D — Locked-decision handling is correct where it matters: ADR 0010 is explicitly superseded with migration (lines 7–10, 107–117), not misclassified under ADR 0005/FS5 as the prior H3 found; FS3 root resolution and FS1/FS2 schemas are declared unchanged; ADR 0011 is left untouched. (The residual FS5-classification gap for the new output is captured as a low finding above.)

CLEAR: F — Track classification is correct: the change freezes `sdlc-status` exit-code semantics, the startup gate, and a superseding ADR, so "irreversible" is right; nothing here is internal-only or safely reversible.
