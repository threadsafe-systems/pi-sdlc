All evidence confirmed. I have what I need to write the review.

---

### Mandatory JSON envelope for post-parse exit-2 cases is unbuildable as written (fatal FS3 seam)

- severity: medium
- confidence: high
- location: spec §1.3 ("once `--format json` has been recognised, the valid envelope is mandatory"; §2.2 `root.resolve`/§2.3 rule 1; §4.2 "FS3 … unchanged"); code `skills/sdlc/scripts/lib.mjs:38-41` (`fail` → `process.exit`), `lib.mjs:55-75` (`resolveRoot` ends in `fail(...)`).
- defect: The spec makes `root.resolve` the first check and mandates a JSON envelope for every result once `--format json` is recognised, but it resolves the root by "existing FS3 precedence" whose only implementation, `resolveRoot`, terminates the process via `fail()` (`process.exit(2)`, uncatchable in Node) on the unresolvable case. There is no non-fatal resolution seam specified, and §4.2 claims FS3 is unchanged.
- evidence: `lib.mjs:38` `export function fail(msg, code = 2) { console.error(msg); process.exit(code); }`; `lib.mjs:75` `fail("sdlc: cannot locate a consumer repo…")` is the terminal statement of `resolveRoot`. Spec §1.3: "once `--format json` has been recognised, the valid envelope is mandatory" and the only allowed bare-stderr exit is "before argument parsing can establish JSON mode" — root resolution runs *after* parsing. Reaching the unresolvable case (no `--config`/`--repo-root`/`$SDLC_ROOT`, no ancestor manifest, non-git cwd) in `--format json` mode therefore exits 2 with no envelope, directly violating the mandatory-envelope contract. (`process.exit` cannot be caught, verified under node v25.6.1.)
- impact: The headline frozen surface (FS8 JSON envelope) is unsatisfiable for the `root.resolve:error` path without an unspecified refactor of `resolveRoot` into a returning/non-fatal form; §4.2's "FS3 unchanged" actively misleads an implementer toward reusing the fatal function. The same class of ambiguity affects unknown-flag/conflicting-flag exit-2 detection that occurs after `--format json` is consumed (§1.1 "Unknown flags … are exit 2" is silent on whether an envelope is emitted).
- fix: Specify a non-fatal root-resolution result used by `root.resolve` (e.g. a `tryResolveRoot()` returning `{ok, root}` or an error), state explicitly that `resolveRoot`'s `fail()` path is replaced by the `root.resolve:error` check, and pin that every exit-2 condition reachable after `--format json` is recognised emits the envelope.

### Check skip/dependency graph is under-specified, breaking AR8 golden determinism

- severity: medium
- confidence: high
- location: spec §2.2 (check table), §2.4 ("parsed only after both adoption checks pass"), §2.8 ("Checks dependent on an errored/skipped prerequisite are `skip`. Independent checks continue."), AR2, AR3, AR8.
- defect: The spec pins only two dependency edges explicitly (`config.valid` ← `manifest-head`+`manifest-clean`; `models.valid` ← `models.present`) and relies on examples for the rest. Whether `models.present`/`models.valid`/`workflow.readable` skip when `adoption.manifest-clean` fails (dirty manifest) — vs only when `adoption.manifest-head` fails — is unstated; AR2 says "config/models checks that require adoption skip" without naming `workflow.readable` and without distinguishing `manifest-head` from `manifest-clean`; AR3 (dirty manifest) pins `manifest-clean:fail` but never pins the status of `models.*`/`workflow.readable`.
- evidence: §2.8 gives one concrete example (malformed config + missing models → both reported, exit 2). No scenario constrains the check array for: (a) not-adopted repos (does `workflow.readable` run or skip? AR2 omits it), or (b) a dirty manifest (do `models.*`/`workflow.readable` run or skip?). AR8 requires exact golden JSON with "stable check order," but two conformant implementations could emit different `checks[]` arrays for these inputs.
- impact: The frozen FS8 check-array shape is non-deterministic across implementations for exit-1 and dirty-manifest exit-3 cases; AR8's golden-fixture gate cannot pin what it claims to pin.
- fix: Add an explicit dependency matrix (check → prerequisite checks) and state for each of `config.valid`/`models.present`/`models.valid`/`workflow.readable` whether it skips on `manifest-head:fail`, on `manifest-clean:fail`, or only on `root.resolve`/`git.repository` error; then add an AR scenario asserting the full check array for a not-adopted repo and a dirty-manifest repo.

### Symlinked consumer root produces a false `git.repository:error` (§2.3 rule 3 + existing resolution)

- severity: medium
- confidence: medium
- location: spec §2.3 rule 3 ("require `git rev-parse --show-toplevel` to resolve to the same canonical path"); §2.3 rule 2 ("Canonicalise … without changing FS3's selected directory"); code `lib.mjs:55-56`.
- defect: §2.3 rule 3 requires the canonicalised root to equal `git rev-parse --show-toplevel`, but the resolution it reuses canonicalises lexically (`resolveRoot` returns `explicit` verbatim when absolute, or `path.resolve(...)` otherwise — no symlink resolution), while `git … --show-toplevel` returns the realpath. A consumer root reached through a symlink therefore mismatches and is classified `git.repository:error`/exit 2 even though it is a valid worktree.
- evidence: Verified under git 2.43.0, node v25.6.1: a symlink `/tmp/sl-test` → `/tmp/real-repo` gives `git -C /tmp/sl-test rev-parse --show-toplevel` = `/tmp/real-repo`, but `path.resolve('/tmp/sl-test')` = `/tmp/sl-test` and `fs.realpathSync` = `/tmp/real-repo`. `lib.mjs:55-56`: `const explicit = config ?? repoRoot ?? …; if (explicit) return isAbsolute(explicit) ? explicit : resolve(explicit);` — no realpath. The spec does not state which canonicalisation wins.
- impact: Readiness returns exit 2 for a legitimate symlinked consumer repo; the §4.1 claim "Symlink/path behaviour follows existing root/path validation" hides a new mismatch this rule introduces.
- fix: Specify that canonicalisation resolves symlinks (`realpathSync`) on both sides before the equality check (or explicitly state symlinked roots are unsupported and add a fixture).

### `StatusCheckId` is referenced in the frozen FS8 type but never defined

- severity: low
- confidence: high
- location: spec §1.3 TS block (`type StatusCheck = { id: StatusCheckId; …}`).
- defect: The frozen `StatusReportV1`/`StatusCheck` shape uses `StatusCheckId` without defining it; the only enumeration of the ids is the §2.2 prose table, not the type system.
- evidence: §1.3 `type StatusCheck = { id: StatusCheckId; …}`; no `type StatusCheckId = …` anywhere in the spec.
- impact: The pinned type contract is incomplete; an implementer must hand-transcribe the §2.2 ids into the union, risking drift (e.g. the `.`-segmented ids like `adoption.manifest-head`).
- fix: Define `type StatusCheckId = "root.resolve" | "git.repository" | "adoption.manifest-head" | "adoption.manifest-clean" | "config.valid" | "models.present" | "models.valid" | "workflow.readable";`.

### §1.2 exit-3 "valid manifest" is unverified when the manifest is dirty

- severity: low
- confidence: high
- location: spec §1.2 (exit 3 meaning), §2.4 ("parsed only after both adoption checks pass"), §2.5.
- defect: Exit 3 is defined as "Current `HEAD` has a valid manifest, but active content is uncommitted…", but when the manifest is dirty `config.valid` is `skip` (§2.4 gates parsing on both adoption checks passing), so manifest validity is never established. A committed-malformed manifest that is also dirty exits 3 (manifest-clean fail) rather than 2 — consistent with §2.5's "clean" qualifier and plan R1's intent, but contradicting the §1.2 wording.
- evidence: §1.2 exit-3 row; §2.4 "The active filesystem manifest is parsed only after both adoption checks pass"; §2.5 scopes exit-2 to "A clean committed manifest that cannot be read, parsed, or validated". No scenario covers the malformed-and-dirty combination.
- impact: The exit-meaning table over-claims "valid" for a state where validity is skipped; an implementer reading §1.2 may wrongly validate the HEAD blob on the dirty path.
- fix: Reword exit 3 to "Current `HEAD` contains a manifest, but its active copy is uncommitted or a supporting prerequisite failed" and add a sentence noting validity is only assessed when the manifest is clean.

### Sparse-checkout and submodule states are plan-listed risks with no scenario and no scope-out

- severity: low
- confidence: medium
- location: plan "Risks and dependencies" ("sparse checkout, submodules … representative fixtures for each relevant state"); spec §5 (AR1–AR12), §7 (Out of scope).
- defect: The governing plan names sparse checkout and submodules among the git states requiring representative fixtures; the spec has no scenario for either and does not list them in §7 Out of scope, leaving their committed-adoption/clean behaviour undefined. (Sparse-excluding `.pi/sdlc/` would make a committed manifest appear deleted in the working tree → perpetual exit 3; a consumer root that is a submodule boundary is undefined.)
- evidence: Plan risks list "sparse checkout, submodules"; spec AR9 covers linked worktree + detached HEAD only; §7 omits sparse/submodule.
- impact: Two git edge cases the plan flagged as needing fixtures are unaddressed; behaviour is implementation-dependent.
- fix: Either add scenarios pinning sparse-checkout and submodule behaviour, or move both into §7 Out of scope with a one-line justification.

### §6 migration omits the non-git-with-manifest case (former exit 0 → new exit 2)

- severity: low
- confidence: medium
- location: spec §6 ("Non-git explicit roots move from historical exit 1 to exit 2"; "No automatic file rewrite is needed for consumers already carrying clean valid config and models; they become ready after upgrading"); code `sdlc-status.mjs:36-46`.
- defect: Today a non-git explicit root that *has* a manifest on disk exits 0 (`existsSync(manifest)` → `readConfig` → exit 0); under FS8 it becomes exit 2 (`git.repository:error`). §6 only documents the non-git *exit-1*→exit-2 migration, and the blanket claim "they become ready after upgrading" is false for any non-git consumer that previously passed.
- evidence: `sdlc-status.mjs:36` `if (!existsSync(manifest))` then `readConfig` at line 46 → exit 0 for a present manifest in a non-git dir; §6 bullet only mentions "former non-git exit 1 becomes exit 2".
- impact: A migration case (non-git + manifest: 0 → 2) is undocumented; the "become ready after upgrading" sentence is over-broad.
- fix: Add to §6: "A non-git directory with a manifest that previously exited 0 now exits 2; git adoption is required for readiness," and qualify the "become ready" sentence to git consumers only.

### Plan DoD asks for a separate ADR freezing the machine-output shape; the spec collapses exit-policy + FS8 into one ADR

- severity: low
- confidence: medium
- location: plan Definition of Done ("a superseding ADR records the breaking policy/exit change, and a separate ADR freezes the new machine-output shape"); spec §0, §4.2, §6 ("a new ADR freezes FS8"; "the superseding ADR …").
- defect: The plan's DoD calls for two artifacts — a superseding ADR for the exit-policy change and a *separate* ADR freezing the FS8 machine-output shape. The spec treats FS8 as a single surface ("introduces FS8, the `sdlc-status` v1 output/exit surface") and §4.2/§6 speak of one "new ADR" that both supersedes 0010 and freezes FS8.
- evidence: Plan DoD bullet quoted above; spec §0 Frozen surfaces bullet; §4.2 "ADR 0010 is superseded; a new ADR freezes FS8"; §6 "The superseding ADR and README must state…".
- impact: The versioning boundary for the frozen machine-output surface is muddied (future FS8 evolution vs the one-time exit migration); an implementer may produce one ADR where the plan asked for two.
- fix: State explicitly whether FS8's output shape is frozen by its own ADR distinct from the ADR-0010 supersession, reconciling with the plan's "separate ADR" wording.

CLEAR: none — every attack surface A–G produced at least one finding above.
