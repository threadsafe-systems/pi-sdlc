### No high-severity defects found

The OL-A implementation across T1 (schema + `inspectConfig` + `decomposeGateMode`), T2 (`resolve-panel` model-identity resolution), and T3 (`setup-sdlc` fresh-adoption profiles) correctly implements the rev4 spec's behavioral contracts. All 27 new tests pass (10 config + 10 resolution + 7 setup), and the full 185-test corpus passes unmodified (NF-1 holds). The four findings below are judgement-call baseline smells or low-severity spec-edge divergences; none is a correctness, security, or data-corruption defect.

---

### `readLifecycle` blanket catch masks filesystem/permission errors

- severity: low
- confidence: medium
- file: skills/sdlc/scripts/resolve-panel.mjs
- line: approx 98-105 (`readLifecycle` function)
- problem: The `readLifecycle` function catches all `readFileSync` and `JSON.parse` errors — including `EACCES`, `EIO`, and other filesystem errors — and silently returns `null` (v1 fallback path). The spec section 4.2 says the v1 fallback is for configs that are "missing, unparseable, or parses without a `lifecycle` key." A permission-denied file is arguably none of these: the file exists, might be parseable, and the caller gets no error.
- repro_or_impact: `chmod 000 .pi/sdlc/sdlc.config.json && resolve-panel pr_review` silently falls to v1 vendor-based resolution instead of reporting the access failure. The risk is that a misconfigured deployment (wrong permissions) produces panels from a stale path without any diagnostic.
- smell: Speculative Generality (the catch-all `try {} catch { return null }` is broader than needed — the spec didn't ask for silent permission-error masking)

### `--profile` flag enables non-interactive mode without `--yes`

- severity: low
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 146-148 (`parseArgs`, `--profile` case sets `opts.runFlag = true`)
- problem: The spec section 4.3 says "Non-interactive `--profile <p> --yes` writes preset `<p>`." But `--profile` alone sets `opts.runFlag = true`, which causes the non-interactive branch to execute and write the config — `--yes` is not required. Running `setup-sdlc --profile full` (no `--yes`) writes a config file without any confirmation prompt, contradicting the spec's implication that `--yes` gates non-interactive writes.
- repro_or_impact: `setup-sdlc --profile full` on a fresh repo writes `.pi/sdlc/sdlc.config.json` immediately. This is almost certainly the user's intent (they chose a profile), so the practical impact is negligible — the spec-language drift is the main issue.
- smell: Mysterious Name (the `runFlag` boolean conflates "non-interactive mode" with "any substantive flag was passed" — this is the v1 design, not new, but the new `--profile` flag inherits the conflation)

### Interactive `interviewLifecycle` custom path lacks per-field validation

- severity: low
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: approx 488-530 (`interviewLifecycle` function)
- problem: When the interactive interview enters the custom path (user selects "custom"), it collects 10+ dial values without validating any of them interactively. Invalid values (e.g., "banana" for a gate mode, -3 for minPanel) are only caught later by `inspectConfig` in `writeBundle`, which produces a single error message after all questions are answered. The user must re-answer everything.
- repro_or_impact: Interactive, select "custom", enter "banana" for "irreversible plan review mode", answer all subsequent questions, then `exitCode: 2, error: 'assembled configuration is invalid: lifecycle.gates.plan_review.mode.irreversible must be one of panel, advisory, human, off'`. The spec doesn't require per-field interactive validation, so this is a UX smell, not a spec violation.
- smell: Shotgun Surgery (the custom-path interview builds a raw object and defers all validation to a downstream pass; a field-level loop-back would keep the repair local)

### `resolve-panel` lifecycle path has no test for `--pong` interaction

- severity: low
- confidence: medium
- file: test/resolve-panel-lifecycle.test.js
- line: n/a (omission)
- problem: The `resolve-panel` lifecycle path includes `pong` filtering (`if (pong && !pongOk(pm))`), but no scenario in the test suite exercises `--pong` on the lifecycle path. The v1 path has existing pong coverage, but the lifecycle path's `pongOk` call receives the raw `pm` (including any `:thinking` suffix) while the `--thinking off` flag is hardcoded in `pongOk`, creating a potential fidelity gap: a model that only works with `:high` might pass `pongOk` (run at `--thinking off`) but fail at execution time (run with `:high`).
- repro_or_impact: A model in `prefer` with `:high` thinking passes the pong gate (because `pongOk` strips to `--thinking off`) but the actual panel execution uses `:high` — the pong check doesn't validate the actual execution configuration. This is pre-existing in v1 but is worth a test on the lifecycle path to document the contract.
- smell: Duplicated Code (the `pongOk` body is shared between v1 and lifecycle paths but the lifecycle path has different identity semantics for thinking suffixes; the shared implementation doesn't account for this divergence)

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "The diff touches only the surfaces declared in spec section 1: schema/sdlc.config.schema.json (lifecycle property + automation reservation), scripts/lib.mjs (inspectConfig + decomposeGateMode), scripts/resolve-panel.mjs (model-identity resolution + --track), scripts/setup-sdlc.mjs (profile interview + --profile + --lifecycle-json), schema/sdlc.models.example.json (min_panel alignment), and three new test files. No check-lifecycle.mjs, sdlc-status.mjs, FS10 envelope, SKILL.md, or prompts changed - OL-B/OL-C surfaces are untouched."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "Full 185-test corpus passes green (27 new lifecycle tests + 158 existing). NF-1 verified: existing test assertions unmodified, no existing test files edited. Byte-identical v1-path: resolve-panel with missing/malformed/no-lifecycle config produces same stdout/stderr/exit as shipped v1 (OLA9 OLA20). Dogfood config (no lifecycle key) produces zero inspectConfig issues (OLA1). Spec section 6 scenarios OLA1-OLA21 all have test coverage; OLA18 verified by grep - no raw gate-mode comparison outside decomposeGateMode + validation table. Schema/collector consistency manually verified for all cross-field rules, per-track structural constraints, and closed vocabulary."
    }
  ],
  "changedFiles": [
    "docs/plans/2026-07-14-opt-in-lifecycle-config-build.md",
    "docs/plans/2026-07-14-opt-in-lifecycle-config.md",
    "docs/plans/2026-07-14-opt-in-lifecycle.md",
    "docs/specs/2026-07-14-opt-in-lifecycle-config.md",
    "skills/sdlc/schema/sdlc.config.schema.json",
    "skills/sdlc/schema/sdlc.models.example.json",
    "skills/sdlc/scripts/lib.mjs",
    "skills/sdlc/scripts/resolve-panel.mjs",
    "skills/sdlc/scripts/setup-sdlc.mjs",
    "test/lifecycle-config.test.js",
    "test/resolve-panel-lifecycle.test.js",
    "test/setup-lifecycle.test.js"
  ],
  "testsAddedOrUpdated": [
    "test/lifecycle-config.test.js (10 tests, OLA1-OLA8, OLA18, OLA19, nested-vocabulary)",
    "test/resolve-panel-lifecycle.test.js (10 tests, OLA9-OLA13, OLA20, OLA21)",
    "test/setup-lifecycle.test.js (7 tests, OLA14-OLA17)"
  ],
  "commandsRun": [
    {
      "command": "node --test test/lifecycle-config.test.js",
      "result": "passed",
      "summary": "10/10 pass, 81ms"
    },
    {
      "command": "node --test test/resolve-panel-lifecycle.test.js",
      "result": "passed",
      "summary": "10/10 pass, 2.4s"
    },
    {
      "command": "node --test test/setup-lifecycle.test.js",
      "result": "passed",
      "summary": "7/7 pass, 1.8s"
    },
    {
      "command": "node --test",
      "result": "passed",
      "summary": "185/185 pass (full corpus), 6.5s"
    }
  ],
  "validationOutput": [
    "NF-1(a) inspectConfig: dogfood config (no lifecycle) yields [] issues - byte-identical",
    "NF-1(b) resolve-panel v1: malformed/no-lifecycle/invalid-v1 configs all produce same stdout/stderr/exit as absent config (OLA9/OLA20)",
    "NF-1(c) setup-sdlc: --yes without --profile produces byte-identical stdout/stderr/written-config to shipped v1 (OLA16)",
    "NF-2 closed vocabulary: lifecycle.automation, lifecycle.gates.merge, minVendors all rejected as unknown keys (OLA3/OLA5/OLA19)",
    "NF-3 determinism: two --profile full runs produce identical lifecycle blocks (OLA14/NF-3 test)",
    "Schema/collector parity: hand-rolled validateLifecycleGateMode matches JSON Schema allOf/perTrackMode/additionalProperties for all gate shapes",
    "decomposeGateMode total over 4-value enum; no raw gate-mode comparison outside decomposition + validation table (OLA18, grep-verified)",
    "Author exclusion on lifecycle path: governed solely by minPanel (OLA11 confirms rules.exclude_author_vendor ignored)",
    "Existing-config --profile refusal: OL-B pointer message + remediation doc link, manifest byte-identical after refusal (OLA16)",
    "Custom --lifecycle-json: profile injection, payload validation, stdin/file support, usage-error gating (OLA17)"
  ],
  "residualRisks": [
    "readLifecycle blanket catch: filesystem/permission errors on sdlc.config.json silently fall to v1 path instead of reporting (low risk)",
    "--pong on lifecycle path: pongOk runs models at --thinking off regardless of :thinking suffix, so pong doesn't validate the actual execution configuration (pre-existing in v1, not worsened)",
    "Interactive custom interview: per-field validation deferred to final inspectConfig pass; user must re-answer all questions on error (UX, not correctness)",
    "readFileSync(0) for --lifecycle-json -: blocks on TTY stdin (standard Unix - convention, documented behavior)"
  ],
  "noStagedFiles": true,
  "diffSummary": "4375 insertions, 60 deletions across 43 files (12 code+test, 31 docs/reviews/validation). Core surface: +119/-2 lines in lib.mjs (lifecycle validation + decomposeGateMode), +167/-60 in resolve-panel.mjs (model-identity resolution + --track + v1 fallback), +144 lines in setup-sdlc.mjs (profiles + --lifecycle-json + interview), +117 lines in JSON schema (lifecycle block + gate definitions). Three new test files (554 lines).",
  "reviewFindings": [
    "no blockers found",
    "low: readLifecycle blanket catch masks permission errors (resolve-panel.mjs:98)",
    "low: --profile enables non-interactive mode without --yes (setup-sdlc.mjs:146)",
    "low: interactive custom interview defers validation to final pass (setup-sdlc.mjs:488)",
    "low: --pong on lifecycle path untested (test/resolve-panel-lifecycle.test.js)"
  ],
  "manualNotes": "Implementation quality is high. All OLA1-OLA21 spec scenarios pass. The schema/collector duality was manually verified for every cross-field rule, per-track structural constraint, and closed-vocabulary check - no divergence found. The modelIdentity function correctly implements the exact thinking-suffix recogniser (THINKING_LEVELS set matches the spec exactly), provider-as-identity, version-as-identity, and positional (not effort-ranked) deduplication. The only nontrivial judgment call is the readLifecycle catch-all - it's defensible (don't crash on filesystem errors) but broader than the spec's narrow 'missing, unparseable, or lacks lifecycle key' language."
}
```
