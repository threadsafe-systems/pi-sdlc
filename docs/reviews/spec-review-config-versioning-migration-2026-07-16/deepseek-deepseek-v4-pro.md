# spec_review — deepseek/deepseek-v4-pro:high

### `readConfig` exit-code change for absent-roster vs v1 `readModels` exit 2 is implicit

- severity: medium
- confidence: high
- location: spec §5.1 (resolve-panel input surface)
- defect: In v1, `readModels(root)` at `lib.mjs:413-420` exits **2** when the models file is missing. The spec changes this to exit **1** when `panels` is absent from a valid v2 config (`resolve-panel: no panels roster for <phase>`). The spec's ADR ledger (§10, item 4) covers the FS5 revision but §5.1 itself does not note the exit-code change, which an implementer reading only the resolver section could miss — they might code it as exit 2 to match v1 parity.
- evidence: `lib.mjs:39` — `fail()` exits 2 by default. `lib.mjs:414-416` — `readModels` calls `fail()` when the file is missing, exit 2. Spec §5.1 states exit 1 for absent `panels` (not exit 2). ADR 0005 defines exit codes `0 ok / 1 under-panel / 2 bad input`. The change from 2→1 is defensible (absent roster is "under-panel," not "bad input"), but it's a deliberate shift that needs an explicit note.
- impact: An implementer might write exit 2 for panels-absent, matching the v1 models-file-absent behavior they know. The CI guard (ADR 0005 frozen exits) wouldn't catch it since ADR 0005 is being amended.
- fix: Add one sentence in §5.1: "Note: this changes the exit code for a missing roster from 2 (v1) to 1 — absent panels in a valid manifest is `under-panel`, not `bad input`; the ADR 0005 revision records the change."

### `check-lifecycle.mjs` code-path change not reflected in the surface-area table

- severity: medium
- confidence: high
- location: spec §1 surface-area table (checker row) vs §7
- defect: The §1 table describes `check-lifecycle.mjs` as "`config.valid` accepts v2; v1 → error with the canonical remedy (never a bare reject); FS9 semantics otherwise untouched." But the current code at `check-lifecycle.mjs:220` calls `inspectConfig(raw)` directly. The spec §7 routing table requires the checker to call `classifyConfigVersion` *before* `inspectConfig` and only call `inspectConfig` on `current`. This is a structural code-path change — adding a new function call and branching — not just a semantic widening. The implementer could incorrectly just widen `inspectConfig` to accept both v1 and v2, missing the `classifyConfigVersion` routing.
- evidence: `check-lifecycle.mjs:10` imports `inspectConfig` only — not a hypothetical `classifyConfigVersion`. `check-lifecycle.mjs:220` calls `inspectConfig(raw)` unconditionally after JSON parse. Spec §7 says `older: config.valid = error, message …`, which requires the checker to *not* call `inspectConfig` for v1 configs and instead emit the remedy string directly. The spec §1 surface table omits the `classifyConfigVersion` import/addition.
- impact: If an implementer widens `inspectConfig` to accept v1, then `check-lifecycle` on a v1 config would pass `config.valid` (wrongly — it should error with the remedy). The FS9 checker's CI would then pass on v1 configs silently.
- fix: Update the checker row in the §1 surface table to: "`config.valid` routes through `classifyConfigVersion` before `inspectConfig`; v2 → validate; v1 → error with the canonical remedy (never a bare reject); FS9 semantics otherwise untouched."

### Fold mapping table doesn't define behavior for absent required field `min_panel`

- severity: low
- confidence: medium
- location: spec §3.3 mapping table
- defect: The fold mapping table says `models phases.<p>.min_panel → panels.phases.<p>.minVendor` verbatim. But if `min_panel` is absent from a phase (the v1 FS2 schema requires it, but `planMigration` takes raw parsed input that might be missing required fields), the table doesn't say whether the fold omits `minVendor` (relying on the default 1) or reports it as unmappable. The "total" claim only covers unknown keys ("any key outside it is unmappable"), not missing required keys.
- evidence: Spec §3.3: "Both documents' vocabularies are closed, so this table is total; any key outside it is unmappable." Only unknown keys are addressed. `minVendor` is defined as "optional, integer ≥ 1, default 1" in §2. Omission → default 1 is the likely behavior, but it's not stated.
- impact: An implementer might report missing `min_panel` as unmappable, causing the fold to fail for a v1 config where a modeler omitted a value, instead of folding successfully with the default. This affects CV9's scope (tests only unknown-key unmappability, not missing-required-field).
- fix: Add to §3.3: "When `min_panel` is absent from a phase, `minVendor` is omitted (default 1 applies per §2)."

### CV4 falsifier underspecified: doesn't control `minPanel`

- severity: low
- confidence: medium
- location: spec §12 scenario CV4
- defect: CV4 says the falsifier is "set `minVendor: 99` — resolution still succeeds at `minPanel`." The scenario doesn't specify what `minPanel` should be set to. If the implementer sets `minPanel` to a high/unreachable value (e.g., 99), resolution would fail, but for the *minPanel* reason — creating a test that passes for the wrong reason (resolution fails, but not because of `minVendor`). The falsifier needs to guarantee `minPanel` is set low enough to be reachable.
- evidence: CV4: "a v2 config with both `lifecycle` and `minVendor` values is schema-valid; `resolve-panel` on the model axis prints the supersede notice naming both values and never reads `minVendor` as a floor (falsifier: set `minVendor: 99` — resolution still succeeds at `minPanel`)." No constraint on `minPanel` value.
- impact: A test that accidentally sets `minPanel: 99` and fails wouldn't falsify the claim — it would be a false positive (test passes, but because minPanel was too high, not because minVendor is correctly ignored).
- fix: Change falsifier to: "set `minVendor: 99` and `minPanel: 1` — resolution still succeeds."

### CV8's comparison scope ambiguously covers the recorded goldens

- severity: low
- confidence: medium
- location: spec §12 scenario CV8
- defect: CV8 says "resolve-panel's stdout panel (members, order, suffixes) and exit code are identical before the fold (v1 skill semantics, from the recorded v1 goldens) and after." It correctly scopes to "stdout panel" and "exit code." However, the parenthetical "from the recorded v1 goldens" without qualification could lead an implementer to capture full stdout+stderr goldens and then compare them byte-for-byte — which would fail because stderr messages change (file paths, key names). CV26 correctly adds "modulo only the renamed notice/file strings enumerated in the test," but CV8 omits this qualification.
- evidence: CV8 says "identical" applied to stdout+exit code. CV26 says "modulo only the renamed notice/file strings." The two scenarios are mostly redundant for pair-A and their comparison rules differ slightly in wording.
- impact: Minor — CV26 covers pair-A with the correct qualification. An implementer reading CV8 in isolation could try to compare stderr too.
- fix: Add to CV8: "Stderr may differ in file-path and key-name references; the comparison is scoped to stdout panel content and exit code only."

---

CLEAR: A — Frozen shapes faithfully carry the plan's decisions: `schemaVersion: 2`, merged file name `.pi/sdlc/sdlc.config.json`, `panels` captures all FS2 fields with renamed keys, `enforcement` is top-level, `lifecycle` vocabulary is untouched. The optional-`panels` decision preserves v1 readiness parity correctly.

CLEAR: B — All 32 CV scenarios are falsifiable in principle; most have explicit falsifiers stated. The ones flagged above have minor specification issues, not unfalsifiability.

CLEAR: C — Interfaces are buildable: `classifyConfigVersion` has a precise return-type vocabulary; `planMigration` has clear ok/error shapes; the `enforcement` toggle's two-mode behavior is exhaustively specified with exact advisory string shapes. `readConfigRawForMigration` has a containment rule.

CLEAR: D — No contradictions with the plan detected. All [spec decision] items stay within plan bounds: optional panels (not schema-`required`) preserves readiness parity; `enforcement` top-level satisfies DoD 5; minVendor coexistence uses runtime-supersede (the plan's composition principle); models.* removal is within the plan's "disposition is bound"; residue-removal prompt satisfies the "detects and removes" plan requirement while keeping mutation behind confirmation; empty-panel exit 1 in both modes correctly implements "the toggle governs the diversity floor, not panel existence."

CLEAR: E — Framework behavior verified: `fail()` exits 2 (`lib.mjs:39-41`); `readModels` exits 2 for missing file (`lib.mjs:413-420`); `inspectConfig` currently rejects `schemaVersion !== 1` (`lib.mjs:139`); `check-lifecycle` calls `inspectConfig` directly (`check-lifecycle.mjs:220`); `ensure-panel-agent` calls `readConfig` without `requireManifest` (`ensure-panel-agent.mjs:55`). The spec's version-seam design composes correctly with all these.

CLEAR: F — Non-functional requirements NF-1 through NF-6 are each tied to at least one scenario: NF-1 (offline determinism) → CV6/CV7 deep-equal fixtures; NF-2 (stdout sacred) → CV21/CV22 byte-parseable stdout; NF-3 (mutation containment) → CV5/CV14; NF-4 (no version coupling) → structural (no code-path claim, verified by design); NF-5 (strict-mode conservation) → CV22/CV26; NF-6 (closed vocabulary) → CV1/CV2.

CLEAR: G — Honesty sweep: the spec's "zero effective-panel change" claim is correctly scoped to stdout+exit code (not stderr). The fold's `enforcement: "strict"` synthesis honestly preserves today's blocking on the adopter's existing axis. The "forwards-only, no downgrade" claim is honest. The "recovery contract" correctly acknowledges that ordinary filesystem operations cannot be atomic and defines cleanup-safe residue.

---

**VERDICT: APPROVE** (with the five low/medium findings above as non-blocking spec improvements)
