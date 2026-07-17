## Review: PR #72 — switch semantic-release to conventionalcommits preset

### Findings

#### track:none claim is honest

- severity: low
- confidence: high
- file: (meta — PR declaration)
- problem: The PR declares `track: none` with reason "release-tooling config fix". The actual diff touches only `.releaserc.json` (12 lines of preset config), `package.json` (1 devDependency), and `package-lock.json` (lockfile). Zero product code, zero consumer-facing contract or artifact shape change, zero schema/skill/script changes. Per ADR 0011 prose-law: this is genuinely exempt.
- repro_or_impact: N/A — confirmed honest.

#### Root cause confirmed: angular preset regex does not parse `type(scope)!:` shorthand

- severity: high
- confidence: high
- file: .releaserc.json
- line: 2-20
- problem: The angular preset's `headerPattern` (`/^(\w*)(?:\((.*)\))?: (.*)$/`) does not account for `!` before `:`. Commit `feat(config)!: ...` (39748ab) produced no match → no release. Reproduced locally: `angularHeader.test('feat(config)!: ...') === false`. The conventionalcommits preset's `headerPattern` (`/^(\w*)(?:\((.*)\))?!?: (.*)$/`) matches it, and its `breakingHeaderPattern` (`/^(\w*)(?:\((.*)\))?!: (.*)$/`) correctly detects the `!` as a breaking-change signal.
- repro_or_impact: Confirmed via node regex test against both presets' patterns. The 39748ab squash merge produced "no release" (confirmed by need for the 80d9c53 workaround commit with explicit `BREAKING CHANGE:` footer). This PR correctly fixes the root cause.

#### Untested writer-template compatibility risk: v10 preset functions vs v8 Handlebars writer

- severity: medium
- confidence: medium
- file: .releaserc.json
- line: 12-17
- problem: The `conventional-changelog-conventionalcommits` v10.2.1 preset's writer returns JavaScript function partials (`headerPartial`, `commitPartial`, `footerPartial`) designed for the `@conventional-changelog/template` rendering engine. However, `@semantic-release/release-notes-generator` v14.1.1 depends on `conventional-changelog-writer` v8.4.0, which uses **Handlebars** to compile and render templates. When the preset's function partials override the default Handlebars string partials (via `getFinalOptions`'s `{...templates, ...options}` merge), they are registered as `Handlebars.registerPartial(name, function)` — Handlebars supports function partials, but the calling convention (context as first arg, options hash as second) may not match what the v10 functions expect. Neither `@semantic-release/commit-analyzer` v13.0.1 (tests with v8.0.0 of this preset) nor `@semantic-release/release-notes-generator` v14.1.1 (tests with v9.3.1) have been tested with the v10 API shape. A release-time CHANGELOG generation failure is the plausible worst case.
- repro_or_impact: Cannot be reproduced without running the full semantic-release pipeline (requires main-branch push). The v10 preset's `headerPartial` accesses `this.formatCompareUrl(context)` where `this` is bound to the preset config — this relies on the Handlebars partial invocation preserving the `bind`-set `this`, which Handlebars' `partial.call(this, context, options)` does respect. However, `{{> commit root=@root}}` in the default `mainTemplate` passes `{hash: {root: rootContext}}` as the second argument, while v10's `commitPartial` expects `(context, commit)` — the second argument being an options hash rather than a commit object would cause `commit.scope` and `commit.subject` to be `undefined`, silently omitting commit details from CHANGELOG. Mitigation: if this does fail, the release pipeline crashes (hard fail) or produces degraded CHANGELOG (soft fail) — in either case the tag and GitHub Release would still be created by the other plugins. The author's offline `analyzeCommits` fixture testing does not cover the writer/CHANGELOG path.
- smell: Speculative Generality

#### Dependency necessity confirmed but version gap is substantial

- severity: low
- confidence: high
- file: package.json
- line: 37
- problem: The added `conventional-changelog-conventionalcommits` v10.2.1 is required because neither `@semantic-release/commit-analyzer` v13.0.1 nor `@semantic-release/release-notes-generator` v14.1.1 bundle this preset as a production dependency — it's only a devDependency (v8.0.0 and v9.3.1 respectively). Without it, the `importFrom(cwd, 'conventional-changelog-conventionalcommits')` fallback in both plugins' `load-parser-config.js` / `load-changelog-config.js` would fail, and the release pipeline would crash. This is correctly added as a **devDependency** (pi-sdlc is not a published npm package; these are CI-only devDeps).
- repro_or_impact: The installed v10.2.1 is 2+ major versions ahead of what `commit-analyzer` tests with (v8.0.0) and 1 major ahead of what `release-notes-generator` tests with (v9.3.1). The transitive dependency `@conventional-changelog/template` v1.2.1 requires `node >= 22` — CI (node 22 for test, 24 for release) satisfies this.

#### No regressions in test/lint state

- severity: low
- confidence: high
- file: (CI verification)
- problem: Author claims test/lint pass. Verified: `node --test` passes 206/206, `biome check .` passes on 82 files with no issues, `git status` shows clean working tree.
- repro_or_impact: No regressions. The change has zero impact on product code.

### Summary

No high-severity defects. The root cause is correctly diagnosed and fixed: the angular preset's regex cannot parse `type(scope)!:` commits. The conventionalcommits preset resolves this. Test/lint state is clean. The `track: none` claim is honest.

One medium-severity finding: the conventionalcommits v10 preset's writer uses a function-based template system that may not fully interoperate with the Handlebars-based `conventional-changelog-writer` v8.4.0 used by the release-notes-generator. The `commitPartial` calling-convention mismatch is the most concerning — it could silently omit details from CHANGELOG entries. This risk only manifests at release time (merge to main) and is not covered by the author's offline `analyzeCommits` testing.

---

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "The diff is constrained to .releaserc.json, package.json, and package-lock.json — exactly the release-tooling scope. No product code, schema, skill, or consumer-facing contract changes. No scope widening."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "Evidence provided: regex reproduction confirming root cause (angularHeader rejects 'feat(config)!:' while ccHeader accepts it); full test suite passing (206/206); lint passing (82 files clean); clean git status; code tracing through both preset parsers, both plugin loader chains, and conventional-changelog-writer template compilation path."
    }
  ],
  "changedFiles": [
    ".releaserc.json",
    "package.json",
    "package-lock.json"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "node --test",
      "result": "passed",
      "summary": "206 pass, 0 fail, 0 skip, 0 todo"
    },
    {
      "command": "npm run lint (biome check .)",
      "result": "passed",
      "summary": "Checked 82 files in 155ms. No fixes applied."
    },
    {
      "command": "git status --short",
      "result": "passed",
      "summary": "Clean working tree (no output)"
    },
    {
      "command": "node -e (regex reproduction)",
      "result": "passed",
      "summary": "Angular: feat(config)!: NO MATCH, feat(config): MATCHES. Conventionalcommits: feat(config)!: MATCHES, feat(config): MATCHES, breakingHeaderPattern: MATCHES"
    }
  ],
  "validationOutput": [
    "Angular preset headerPattern /^(\\w*)(?:\\((.*)\\))?: (.*)$/ — 'feat(config)!:' produces NO MATCH (root cause confirmed)",
    "Conventionalcommits preset headerPattern /^(\\w*)(?:\\((.*)\\))?!?: (.*)$/ — 'feat(config)!:' produces MATCH",
    "Conventionalcommits breakingHeaderPattern /^(\\w*)(?:\\((.*)\\))?!: (.*)$/ — 'feat(config)!:' produces MATCH",
    "Both presets parse standard 'feat(config): desc' identically — no classification regression",
    "Default release rules (commit-analyzer/lib/default-release-rules.js) are preset-independent — bump logic unchanged",
    "DevDependency required because commit-analyzer v13.0.1 and release-notes-generator v14.1.1 only dev-depend on conventional-changelog-conventionalcommits, not bundle it"
  ],
  "residualRisks": [
    "Writer template compatibility: conventional-changelog-conventionalcommits v10.2.1 returns function-based template partials for @conventional-changelog/template, but conventional-changelog-writer v8.4.0 uses Handlebars. If calling-convention mismatch causes silent CHANGELOG degradation or crash at release time, the tag and GitHub Release would still be created (commit-analyzer and github plugins are independent), but CHANGELOG generation could silently omit commit details or crash the release-notes-generator step."
  ],
  "noStagedFiles": true,
  "diffSummary": "Swaps semantic-release commit-analyzer and release-notes-generator from default angular preset to conventionalcommits preset, enabling parse of 'type(scope)!:' breaking-change shorthand. Adds conventional-changelog-conventionalcommits v10.2.1 as devDependency. 3 files changed, +37/-2 lines.",
  "reviewFindings": [
    "medium: .releaserc.json:12-17 — v10 preset writer function partials may be incompatible with conventional-changelog-writer v8.4.0 Handlebars compiler; commitPartial calling-convention mismatch could silently omit CHANGELOG details",
    "low: package.json:37 — conventional-changelog-conventionalcommits v10.2.1 is 2 majors ahead of what commit-analyzer tests against (v8.0.0); API surface is stable but gap is notable"
  ],
  "manualNotes": "The author could mitigate the writer-template risk by setting the release-notes-generator preset back to angular (only commit-analyzer needs conventionalcommits for the ! fix) and testing the release-notes-generator path separately, or by pinning conventional-changelog-conventionalcommits to v9.x (which the release-notes-generator already tests against). Either way the ! parsing fix is delivered by the commit-analyzer change alone."
}
```
