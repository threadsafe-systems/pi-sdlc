### JSON envelope undefined for post-JSON-mode argument-parsing failures

- severity: high
- confidence: high
- location: §1.3
- defect: Once `--format json` is recognised, the spec mandates a valid JSON envelope on every result, but provides no shape for when argument parsing itself fails (unknown flag, missing value, extra positional, or mutually exclusive flags) after JSON mode has been established. There is no check ID for CLI argument errors, and the canonical `checks` array cannot be populated because no inspection step has run.
- evidence: "once `--format json` has been recognised, the valid envelope is mandatory"; "Unknown flags, missing values, or extra positional arguments are exit 2."
- impact: An implementer cannot know whether to emit an empty `checks` array, synthesise a `root.resolve` error, or violate the envelope mandate. This error path is unbuildable as written.
- fix: Add a `cli.arguments` check (error → exit 2) or explicitly state that pure argument-parsing failures after JSON mode recognition emit the envelope with `checks: []` and a deterministic `message`.

### `adoption.manifest-clean` permits a `git diff HEAD` shortcut that misses reverted staged changes

- severity: high
- confidence: high
- location: §2.4
- defect: The spec requires any staged edit/deletion of the manifest to fail, but does not mandate that the index be compared independently against `HEAD`. An implementation that uses only `git diff HEAD -- <path>` will incorrectly pass when the index differs from `HEAD` but the working tree has been reverted to match `HEAD`, because `git diff HEAD` collapses index and working-tree against `HEAD` and the differences cancel out. Scenario AR3 does not include this case.
- evidence: "Any staged edit/deletion, unstaged edit/deletion, type change, or replacement fails and exits 3."; AR3 covers staged edit, unstaged edit, staged deletion, unstaged deletion, but not index-dirty/working-tree-clean.
- impact: A repository with a staged (but uncommitted) manifest change could be reported as `ready`, violating the committed-adoption guarantee that is the core objective of this change.
- fix: Explicitly require separate index-vs-HEAD and working-tree-vs-HEAD comparisons, and add an AR3 variant for the reverted-staged-change case.

### `StatusCheckId` type is referenced but never defined

- severity: medium
- confidence: high
- location: §1.3 TypeScript contract
- defect: The `StatusCheck` type references `StatusCheckId`, but the spec never declares the `StatusCheckId` type as a closed union. The canonical IDs are listed in §2.2, but the machine-readable contract is incomplete.
- evidence: `type StatusCheck = { id: StatusCheckId; status: CheckStatus; message: string; remediation?: string; };`
- impact: Machine consumers and type checkers cannot validate check IDs against the closed set; implementers have no authoritative type definition for the frozen surface.
- fix: Add `type StatusCheckId = "root.resolve" | "git.repository" | "adoption.manifest-head" | "adoption.manifest-clean" | "config.valid" | "models.present" | "models.valid" | "workflow.readable";`

### Text output format for `skip` checks is unspecified

- severity: medium
- confidence: high
- location: §1.4
- defect: The text output rules specify the format for `pass`/`fail` checks and for remediation lines, but never show or define the template for a `skip` status check. Since `skip` is emitted for `not-adopted` and `error` states, the human-readable contract is incomplete.
- evidence: `CheckStatus = "pass" | "fail" | "error" | "skip"`; text rules show `check: git.repository pass — resolved root is a git worktree` and `remediation: <check-id> — ...` but no `skip` example.
- impact: Golden text fixtures (AR8) and human consumers have no stable expectation for skipped check lines; different implementers may format them inconsistently.
- fix: Add a text-format rule: `check: <id> skip — <single-line message>`.

### Unreadable models file lacks scenario coverage

- severity: medium
- confidence: high
- location: §2.6 and scenario AR6
- defect: The spec classifies an unreadable models file as `models.present:fail` (exit 3), but AR6 only tests missing, malformed, and FS2-invalid models. No scenario exercises an existing but unreadable file.
- evidence: "Missing or unreadable: `models.present:fail`, `models.valid:skip`, exit 3."; AR6 lists "missing models, malformed models, FS2-invalid models, and injected workflow read failure".
- impact: An implementation that classifies an unreadable models file as `models.present:error` (exit 2) instead of `fail` (exit 3) would pass all specified scenarios while violating the spec.
- fix: Add an AR6 variant for an existing but unreadable models file, using the same deterministic filesystem seam used for workflow read failure.

### `inspectConfig`/`inspectModels` behaviour on non-object inputs is unspecified

- severity: medium
- confidence: high
- location: §2.5
- defect: The spec introduces `inspectConfig(raw: unknown): ValidationIssue[]` and `inspectModels(raw: unknown): ValidationIssue[]` but does not state whether they return an issue array for non-object inputs (e.g. `null`, string, number) or throw. The existing `validateConfig` exits on non-object (`lib.mjs:117`); to retain exact acceptance rules, the collector must handle this case deterministically.
- evidence: `inspectConfig(raw: unknown): ValidationIssue[]`; existing `lib.mjs:117` has `if (!isPlainObject(raw)) fail(...)` which exits the process.
- impact: An implementer might throw on non-object inputs, making `inspectConfig` unusable in the non-exiting readiness path and breaking the contract that `validateConfig` delegates to it safely.
- fix: State explicitly that non-object inputs return `[{ path: "", message: "must be a JSON object" }]` (or similar deterministic issue) and never throw.

CLEAR: A — No missing field that cannot be backfilled later and no over-committed field; `schemaVersion` and the explicit check-ID list provide evolution paths.
CLEAR: D — No contradictions with the governing plan, stream plan, programme plan, or locked ADR decisions.
CLEAR: E — Git worktree/HEAD/index semantics, Node fs behaviour, and shell-wrapper pass-through are all described accurately.
CLEAR: F — Security, compatibility, performance, and portability requirements are stated and each tied to a falsifiable scenario (AR4, AR8, AR9, AR12).
CLEAR: G — The spec is honest about mechanical versus prose-law boundaries, does not claim to test live agent conduct, and does not anticipate out-of-scope bundle assets.
