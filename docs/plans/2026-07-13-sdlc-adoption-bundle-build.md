# Build plan: adoption bundle and lifecycle checking

- Date: 2026-07-13
- Plan: `docs/plans/2026-07-13-sdlc-adoption-bundle.md` (approved)
- Specification: `docs/specs/2026-07-13-sdlc-adoption-bundle.md` (approved)
- Track: irreversible
- Canonical source: this committed Build-plan document; GitHub issues are its
  projection.
- Human gate: Build decomposition, tracker projection, checks, and DoD
  approved by Neil Chambers on 2026-07-13.
- Validator policy: PV1 manifests
  `docs/validation/sdlc-adoption-bundle/ab-t{1..5}.json` (one per task,
  projected from this document), run by
  `skills/sdlc/scripts/validate-task.sh` (PV2), receipts under
  `docs/reviews/task-validate-sdlc-adoption-bundle-<task>-<date>/`.

## Tracker projection — created and verified

- Epic: [#18 — Adoption bundle and lifecycle checking (FS9/FS10)](https://github.com/threadsafe-systems/pi-sdlc/issues/18)
- T1: [#19](https://github.com/threadsafe-systems/pi-sdlc/issues/19)
- T2: [#20](https://github.com/threadsafe-systems/pi-sdlc/issues/20), blocked by #19
- T3: [#21](https://github.com/threadsafe-systems/pi-sdlc/issues/21), blocked by #19
- T4: [#22](https://github.com/threadsafe-systems/pi-sdlc/issues/22), blocked by #20 and #21
- T5: [#23](https://github.com/threadsafe-systems/pi-sdlc/issues/23), blocked by #22

GraphQL read-back verifies all five native sub-issue relationships and every
`blockedBy` edge; all six items are on board #5 at `Todo`.

## Definition of done

The Build is complete when:

1. FS9 (`check-lifecycle`) implements the exact declaration grammar,
   exemption rule, prerequisite matrix, exits, and text/JSON envelopes,
   satisfying AB1–AB7.
2. FS10 (`setup-sdlc` bundle mode) provisions/recognises/refuses the full
   asset set with the pinned report envelope and preflight, satisfying
   AB8–AB13.
3. The dogfood repo carries the shipped PR template and `ci.yml` lifecycle
   job; the shipping PR passes its own check (AB15).
4. SKILL.md/README/prompt edits and ADRs 0017/0018 land with mutation-tested
   assertions (AB16); FS8 and every existing surface remain untouched (AB14).
5. Every scenario AB1–AB17 maps to a passing automated check with no
   network, credential, or model call (AB17).
6. `npm test` and `npm run lint` exit 0.
7. Every task passes its PV1/PV2 validation with a verifiable receipt.

## Scenario coverage matrix

| Scenario | Owning task(s) | Primary proof |
|---|---|---|
| AB1 | T1 | grammar accept/reject fixtures, distinct diagnostics |
| AB2 | T1 | exemption/precedence fixtures incl. bot-with-declaration |
| AB3 | T2 | irreversible missing-artifact fixtures per check id |
| AB4 | T2 | reversible pass-without-spec + `artifact.spec:skip` golden |
| AB5 | T2 | `none` zero-lookup fixtures |
| AB6 | T2 | configured-paths, committed-vs-working-tree, multi-match |
| AB7 | T1 (modes/injection), T2 (goldens) | envelope goldens, mode parity, injection inertness |
| AB8 | T3 | fresh-repo provision + idempotent re-run + refusal independence |
| AB9 | T3 | config retained/refused/upgraded + preflight abort |
| AB10 | T3 | recognise/refuse byte-identity fixtures |
| AB11 | T3 | probe positive/negative incl. target-file exclusion |
| AB12 | T3 | `reference.*` ok/broken report fixtures |
| AB13 | T3 | prompt-copy + `ensure-panel-agent` resolution |
| AB14 | T5 | FS8 tests unmodified+green; diff-level assertion |
| AB15 | T4 | dogfood template/job + self-check replay fixture |
| AB16 | T4 | doc/prompt mutation tests |
| AB17 | T5 | full suite, lint, no-live-call sentinel |

Every scenario is owned; no row is deferred beyond this Build.

## Task dependency graph

```text
T1 ──→ T2 ──┐
  └──→ T3 ──┼──→ T4 ──→ T5
        (T4 blocked by T2 AND T3)
```

- T1 builds the FS9 declaration engine and CLI skeleton with no git
  dependency.
- T2 completes the checker with `HEAD` artifact resolution and full goldens.
- T3 builds FS10 setup bundle provisioning; it needs only the checker
  *file* to exist (its `reference.checker` preflight), so it blocks on T1,
  not T2.
- T4 dogfoods (template + `ci.yml` job), edits docs/prompt, writes ADRs —
  needs the finished checker (T2) and the shipped asset sources (T3).
- T5 is integrated acceptance over the whole child.

## T1 — FS9 declaration engine, CLI skeleton, exemption, envelopes

### Outcome

`check-lifecycle.mjs` + `.sh` exist with the frozen CLI (`--config`/
`--repo-root`, `--format` + FS8-style full-argv JSON pre-scan, `--help`,
three mutually exclusive declaration source groups), the §1.1 grammar
parser (structure-only `declaration.parse`; value checks in
`declaration.track`/`.slug`/`.reason` in all modes), the §1.3 exemption
with synthetic-value handoff and declaration-dominates precedence, §2.1
event-payload semantics (null body, missing login, invalid payload), the
§2.3 prerequisite matrix with pinned skip messages, and the §2.4 envelopes
(`reason` field, null-until-own-check-passes, text headers with `-` for
null). Artifact checks are wired into the matrix but stubbed to emit their
applicability skips only for `none`/exempt in this task; git-backed
existence lands in T2.

### Scope

- New `skills/sdlc/scripts/check-lifecycle.mjs` and thin `.sh` wrapper.
- Grammar parser (fence detection, key grammar, ambiguity, `\r\n`).
- Exemption rule (`[bot]` suffix), precedence, synthetic none+reason.
- Flags/body/event source groups; event JSON read as data; injection-inert
  diagnostics (single-line, ≤ 120 chars, control chars replaced).
- Check/prereq engine, aggregate precedence, text/JSON rendering.
- Offline tests; no git fixture usage yet beyond a plain repo root.

### Scenarios

AB1, AB2, AB7 (mode parity + injection portions).

### Checks

```bash
node --check test/check-lifecycle.test.js
node --test test/check-lifecycle.test.js
node --check skills/sdlc/scripts/check-lifecycle.mjs
npm run lint
```

### Task DoD

- [ ] Every AB1 grammar case passes/fails with its distinct diagnostic.
- [ ] AB2 precedence: bot-no-declaration exempt; bot-with-valid-declaration
      checked normally; human-no-declaration fails; bot-invalid-block
      exempt.
- [ ] `state`/`exitCode`/check id+status sequences identical across the
      three modes on the same fixture; `mode` field correct.
- [ ] Injection bodies are inert; diagnostics capped and sanitised; no
      secret sentinel in output.
- [ ] JSON pre-scan yields one valid envelope for every post-scan result
      including argument errors; text headers in pinned order with `-` for
      null.
- [ ] Named checks exit 0.

### Out of scope

`HEAD` artifact listing, configured-path containment against real git
trees (T2); setup, docs, ADRs.

## T2 — Artifact resolution, containment, and checker goldens

### Outcome

The checker verifies committed artifacts per §1.4 against real git
fixtures: `HEAD:<prefix><dir>` `ls-tree` listing with FS8-style prefix
rules, exact `<date>-<slug>` filename matching, multi-match listing,
zero-match/absent-directory = fail (never exit 2), platform-aware
containment enforcement (`config.valid:error` on escape), and full golden
text/JSON coverage of exits 0/1/2.

### Scope

- Git-backed `artifact.plan`/`artifact.spec`/`artifact.build` for all
  tracks, including `artifact.spec:skip` on reversible.
- Configured `paths` consumption; non-default-paths and monorepo-prefix
  fixtures; linked-worktree correctness (own `HEAD`).
- Containment normalisation incl. `\`-separated segments.
- Golden output fixtures completing AB7.
- Extends T1 tests with git fixtures (`test/check-lifecycle-git.test.js`).

### Scenarios

AB3, AB4, AB5, AB6, AB7 (golden completion).

### Checks

```bash
node --check test/check-lifecycle-git.test.js
node --test test/check-lifecycle.test.js test/check-lifecycle-git.test.js
node --check skills/sdlc/scripts/check-lifecycle.mjs
npm run lint
```

### Task DoD

- [ ] Irreversible: each missing artifact fails with the id naming exactly
      the missing doc; complete set passes.
- [ ] Reversible: passes with no spec anywhere; `artifact.spec:skip` with
      the pinned message; missing plan/build fails.
- [ ] `none`: all `artifact.*` skip; zero git artifact lookups beyond
      config.
- [ ] Committed-only semantics: working-tree/staged docs never count;
      dirty tree with committed docs passes; configured paths honoured;
      default paths ignored when overridden; multi-match passes and lists
      all.
- [ ] Absent directory = fail, not error; path escape (incl. `..\`) =
      `config.valid:error`, exit 2.
- [ ] Golden text/JSON pins exits 0/1/2 end to end.
- [ ] Named checks exit 0.

### Out of scope

Setup provisioning, docs, ADRs, dogfood wiring.

## T3 — FS10 setup bundle provisioning, probe, references, report

### Outcome

`setup-sdlc` implements the §3.1 flag taxonomy and bundle-run trigger, the
five-asset set with per-asset recognise/refuse/instruct (§3.2 boundaries,
including the pure-line-match ci-workflow rule), the §3.3 CI-absence probe
(target-file exclusion; non-empty-prefix refusal), the §3.4 report
envelope (text header order, `reference.*` preflight entries, JSON
`error` channelling, RUN_HOOK_WARNING folding), and the retirement of the
existing-config hard-fail (`refused`/exit 1, provisioning continues;
`--force` = `upgraded`). Ships the package sources for the PR template
(§4.1) and offered workflow (§4.2, pinned-checkout + placeholder) under
`skills/sdlc/assets/`.

### Scope

- Flag parsing (`--with-ci-workflow`, `--copy-prompts`, `--format`),
  interview additions, JSON pre-scan.
- Asset engine with preflight (resolve-before-first-write; broken
  reference = exit 2, nothing written).
- Structural acceptance per §3.2; byte-identity guarantees.
- Probe list with target-file exclusion and prefix refusal.
- Package asset sources: `skills/sdlc/assets/pull_request_template.md`,
  `skills/sdlc/assets/sdlc-lifecycle.yml`.
- Update `test/setup-sdlc.test.js` expectations (OH4-era exit change,
  ADR-0018-recorded) plus new `test/setup-bundle.test.js`.

### Scenarios

AB8, AB9, AB10, AB11, AB12, AB13.

### Checks

```bash
node --check test/setup-bundle.test.js
node --test test/setup-sdlc.test.js test/setup-bundle.test.js
node --check skills/sdlc/scripts/setup-sdlc.mjs
npm run lint
```

### Task DoD

- [ ] Fresh-repo run creates config/models/pr-template/ci-workflow with
      pinned report lines and exit 0; second run all `retained`,
      byte-identical targets.
- [ ] Refusal independence: one unsatisfying asset → `refused` + exit 1,
      others still processed; consumer files byte-identical.
- [ ] Config: retained (no mutating flags) / refused (mutating, no
      `--force`) / upgraded (`--force`); declined interview unchanged
      (exit 1, nothing written, no report).
- [ ] Probe: each frozen marker suppresses creation with snippet
      remediation; target-file exclusion keeps re-run `retained`
      reachable; non-empty prefix refuses.
- [ ] `reference.*` entries reported ok/broken; broken = exit 2, nothing
      written.
- [ ] `--copy-prompts` seeds the override slot; `ensure-panel-agent`
      resolves the copy; pre-existing override untouched.
- [ ] JSON mode: one envelope for every post-scan result incl. exit 2
      (`error` field), empty stderr, warning folded into config message.
- [ ] Named checks exit 0.

### Out of scope

Checker internals (T1/T2), docs/ADRs (T4), dogfood `ci.yml` (T4).

## T4 — Dogfood integration, documentation, prompt, ADRs

### Outcome

This repo carries the shipped PR template and a `ci.yml` `lifecycle` job
invoking the in-repo checker via `$GITHUB_EVENT_PATH` (unchanged
permissions). SKILL.md replaces the unconditional CI claim and PR-phase
text per §5.1 with all mutation-tested assertions present; README covers
§5.3; `adversary-review.prompt.md` gains `<TRACK>`/`<GOVERNING_DOCS>` and
the exact reversible-grounding sentence; ADR 0017 (FS9) and ADR 0018
(FS10, incl. the config-exit compatibility change) are written.

### Scope

- `.github/pull_request_template.md` (from the shipped source) and the
  `ci.yml` job.
- SKILL.md / README / prompt edits; ADRs 0017–0018.
- Extend `test/docs.test.js` with the §5.1 mutation assertions, the
  prompt-placeholder assertions, and an AB15 self-check replay fixture.

### Scenarios

AB15, AB16.

### Checks

```bash
node --test test/docs.test.js
node --check skills/sdlc/scripts/check-lifecycle.mjs
npm run lint
```

### Task DoD

- [ ] Dogfood template contains the canonical declaration block; `ci.yml`
      job invokes the in-repo checker with `contents: read` only.
- [ ] AB15 replay: this PR's declaration (`irreversible` /
      `sdlc-adoption-bundle`) passes against a fixture mirroring the
      committed docs.
- [ ] Every §5.1 enumerated assertion has a failing mutation test; the
      unconditional "CI checks" claim is gone and its absence is tested.
- [ ] Prompt placeholders + exact sentence present and mutation-tested.
- [ ] ADR 0017/0018 record the frozen surfaces and the compatibility
      change.
- [ ] Named checks exit 0.

### Out of scope

New checker/setup behaviour (T1–T3); release mechanics.

## T5 — Integrated acceptance and compatibility sweep

### Outcome

The whole child holds together: full suite green, FS8 untouched (test
files unmodified in the diff and passing; `sdlc-status.mjs` FS8 paths
unmodified), existing consumer upgrade fixture passes, and the
no-live-call sentinel proves offline behaviour.

### Scope

- AB14 diff-level assertions (FS8 test files unmodified; `sdlc-status`
  behaviour byte-identical on its existing fixtures).
- Existing config+models consumer upgrade fixture (AB14 setup side).
- No-live-call sentinel across new suites; credential-free run.
- Full-suite/lint run; PV2 receipts for all tasks verified.

### Scenarios

AB14, AB17 (plus regression confirmation of AB1–AB16 ownership).

### Checks

```bash
git diff --quiet origin/main -- test/sdlc-status.test.js test/readiness-output.test.js test/readiness-git.test.js
npm test
npm run lint
```

### Task DoD

- [ ] The named FS8 test files show no diff against `origin/main` and pass.
- [ ] Existing-consumer upgrade fixture: no destructive rewrite;
      `sdlc-status` results identical pre/post.
- [ ] All new tests run with credentials removed; sentinel proves no
      network/model call.
- [ ] `npm test` and `npm run lint` exit 0.
- [ ] Every task's PV2 receipt verifies with
      `verify-task-receipt.mjs --dir`.

### Out of scope

Anything not already owned by T1–T4; PR-panel remediation (post-Build).
