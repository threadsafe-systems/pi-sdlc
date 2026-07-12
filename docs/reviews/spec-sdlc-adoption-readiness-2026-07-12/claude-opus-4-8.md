### root resolution is fatal, so the mandatory JSON envelope cannot be emitted on a root-resolution failure

- severity: high
- confidence: high
- location: spec §1.3, §2.2 (`root.resolve`), §2.3.1
- defect: §1.3 says "once `--format json` has been recognised, the valid envelope is mandatory," and §2.2 makes `root.resolve` an emittable check that can be `error`→exit 2. But §2.3.1 instructs resolving with "existing FS3 precedence," and the only FS3 resolver, `resolveRoot`, terminates the process with a bare stderr line (no envelope) when it cannot locate a root.
- evidence: `skills/sdlc/scripts/lib.mjs:75` `fail("sdlc: cannot locate a consumer repo…")` → `fail` calls `process.exit(2)` (`lib.mjs:38-41`) after `console.error`. Root resolution runs after argument parsing, so the §1.3 "before argument parsing" catastrophic-exception does not cover it.
- impact: In `--format json` mode with a non-git cwd and no manifest/explicit root, the tool prints plain stderr and exits 2 with no JSON object, violating the frozen output contract; the `root.resolve:error` path in §2.2 is unreachable as an envelope and has no falsifying scenario.
- fix: Specify a non-fatal root-resolution seam (analogous to the §2.5 collectors) that yields `root.resolve:error` inside the envelope instead of reusing the exiting `resolveRoot`.

### `--show-toplevel` equality check will spuriously error on symlinked roots (incl. macOS `/tmp` fixtures)

- severity: high
- confidence: high
- location: spec §2.3.2–§2.3.3
- defect: §2.3.2 forbids changing FS3's selected directory ("Canonicalise… without changing FS3's selected directory"), so the root keeps its unresolved symlink form, while §2.3.3 requires `git rev-parse --show-toplevel` (which resolves symlinks) to equal it. On any symlinked path the two differ and produce `git.repository:error`/exit 2 for a legitimate clean worktree.
- evidence: `lib.mjs:56` returns explicit roots via `isAbsolute(explicit) ? explicit : resolve(explicit)` — `resolve` does not call `realpath`. `test/sdlc-status.test.js:26,33` build fixtures under `mkdtempSync(join(tmpdir(), …))` and invoke with `--repo-root <dir>`; on macOS `tmpdir()` is a symlink (`/var/folders…` vs `/private/var…`) that git canonicalises, so AR1/AR3/AR9 fixtures would report exit 2.
- impact: The `ready` path fails on a common platform and test harness; "Canonicalise" is undefined enough that an implementer cannot tell whether to `realpath` (breaking §2.3.2) or not (breaking §2.3.3).
- fix: Define canonicalisation as `realpath` on both sides before comparison (or compare git top-level against `realpath(root)`), and state the fixtures must tolerate symlinked temp dirs.

### models readiness checks working-tree presence, not `HEAD`, so a repo is "ready" with an uncommitted roster

- severity: medium
- confidence: high
- location: spec §2.2 (`models.present`), §2.6; contrast §2.4
- defect: The manifest must be committed AND clean (`adoption.manifest-head`/`-clean`), but `models.present` only asks whether `.pi/sdlc/sdlc.models.json` "exists" on the filesystem and `models.valid` parses the working-tree file. An untracked, ignored, or dirty models file therefore yields exit 0/`ready`.
- evidence: §2.6 "Missing or unreadable: `models.present:fail`… Present but invalid… `models.valid:fail`" — presence is filesystem existence; nothing binds models to `HEAD`, unlike §2.4's `HEAD:.pi/sdlc/sdlc.config.json` blob rule. AR2 tests untracked/ignored/staged only for the manifest; no scenario tests an untracked models roster.
- impact: `ready` over-claims: a load-bearing panel roster that will not travel with the clone (untracked/ignored) still certifies full readiness, contradicting the change's own committed-adoption rationale (plan R1). No scenario can falsify this gap.
- fix: Either apply the §2.4 committed+clean rule to the models path or explicitly state in §2.6/§6 that models readiness is filesystem-only and add a scenario pinning untracked-models behaviour.

### subdirectory (monorepo) manifest resolved by FS3 now errors exit 2 — undocumented migration break

- severity: medium
- confidence: medium
- location: spec §2.3.3, §6
- defect: FS3's ancestor-walk (`lib.mjs:58-66`) legitimately selects a subdirectory that holds `.pi/sdlc/sdlc.config.json` even when it is not the git top level. §2.3.3 then requires the resolved root to equal `git rev-parse --show-toplevel`, so such a repo flips from today's exit 0 to `git.repository:error`/exit 2. Migration §6 lists only non-git→exit 2 and manifest-present→exit 3.
- evidence: current `sdlc-status.mjs:35-37` does `existsSync(join(root, …))` on the ancestor-walk result with no top-level requirement, so a subdir-adopted repo exits 0 today; `lib.mjs:58-66` walks up to the first manifest, not the git root.
- impact: A monorepo/subproject consumer silently becomes "operational error, SDLC stops" with no migration note, and the compatibility claim in §4.2/§6 is incomplete.
- fix: Add a §6 migration bullet (and a scenario) covering non-top-level manifest adoption, or relax §2.3.3 to accept an ancestor-walk root that is a tracked subdirectory of the worktree.

### JSON envelope for CLI-argument errors is undefined and order-dependent

- severity: medium
- confidence: high
- location: spec §1.1, §1.3, §2.2; AR4/AR8
- defect: Bad flags/conflicting roots/extra positionals are exit 2 (§1.1), and AR4/AR8 require exit 2 with "stable IDs" and valid JSON, but §2.2 defines no check `id` for an argument error and §1.3 does not say what `checks` contains for one. Worse, whether an envelope is emitted at all depends on flag order: `--format json --bogus` recognises JSON first (envelope mandatory) while `--bogus --format json` does not (stderr allowed).
- evidence: §1.3 "A catastrophic failure before argument parsing… may write one line to stderr"; §2.2 canonical IDs are `root.resolve`…`workflow.readable` with none for argument validation; AR8 "JSON contains only FS8 fields… stable check order" gives no shape for an empty/argument-error `checks` array.
- fix: Pin the envelope for argument errors (a defined `cli.args` check id and/or empty `checks` with `state:error`) and make JSON-mode detection order-independent (scan all args before failing).

### `StatusCheckId` is used but never defined; fixed check count forces a schema-major bump for the next sub-change

- severity: medium
- confidence: medium
- location: spec §1.3 (contract), §4.3, §6
- defect: The `StatusCheck.id` type is `StatusCheckId`, which is never given a definition; an implementer must infer the union from the §2.2 table (which also silently includes `root.resolve`, absent from the §1.3 example). Separately, §4.3 "The check count is fixed in FS8 v1" plus §1.3 "No additional… fields… in schema version 1" means the next sub-change's additive prerequisite (§6) cannot add a check without a `schemaVersion` bump, breaking every consumer that pins `schemaVersion === 1`.
- evidence: §1.3 `type StatusCheck = { id: StatusCheckId; … }` with no accompanying `type StatusCheckId = …`; §4.3 "check count is fixed in FS8 v1"; §6 "next stream sub-change will add adoption-bundle prerequisites through an explicit FS8 evolution."
- impact: The frozen shape is ambiguous (which ids are legal) and over-committed (an additive prerequisite is a breaking version bump), the opposite of the additive-within-major discipline the project uses for FS1/FS2.
- fix: Define `StatusCheckId` as the explicit union of the §2.2 ids, and state whether new checks are an additive `schemaVersion 1` change or require `schemaVersion 2`.

### refactoring `validateConfig`/`validateModels` onto collectors risks diagnostic-message drift the "exact acceptance" claim does not cover

- severity: low
- confidence: medium
- location: spec §2.5
- defect: `inspectConfig(raw)` takes no path and must collect *all* issues, whereas today `validateConfig(raw, p)` fails at the first violation with the file path embedded (`sdlc config ${p}: …`). Delegating `validateConfig` to the collector preserves exit codes but can change emitted message text, which the spec's "exact acceptance rules" claim reads as covering.
- evidence: `lib.mjs:113` `const where = \`sdlc config ${p}\`` and each `fail(\`${where}: …\`)`; collector signature`inspectConfig(raw: unknown): ValidationIssue[]` has no `p`. Existing tests assert only exit codes (`test/hooks.test.js:74`) or the`readModels`message (`test/extraction.test.js:186`), so drift in`validateConfig` message text is untested and unguarded.
- impact: A consumer or log-scraper keying on current diagnostic text could break while all listed scenarios (AR5/AR12) still pass, hiding a real behaviour change behind a green suite.
- fix: State that the collectors' messages must reproduce the existing `${where}: …` text, or explicitly disclaim message stability as out of the FS1/FS2 acceptance contract.

CLEAR: G — the spec is careful to state tests verify command behaviour/contract text only and that agent adherence stays transcript-audited under ADR 0011; no sentence over-claims mechanism.
