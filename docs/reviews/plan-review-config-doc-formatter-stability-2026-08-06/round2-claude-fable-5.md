# Plan panel wave 1 (replacement round 2) — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Plan: `3188c1f`.

Turn budget wrap-up was requested after 8 assistant turns (soft limit 8, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### DoD 8 ("existing tests remain green") is falsified by the plan's own version bump

- severity: medium
- confidence: high
- origin: NEW
- location: Definition of done item 8 / Scope "In" item 2
- defect: The plan requires existing render/write/check tests to "remain green" while also setting `CURRENT_SENTINEL_VERSION` to `v2`, but an existing test hardcodes the `v1` sentinel and must fail under v2. The plan neither scopes the required test amendment nor acknowledges that DoD 8 cannot hold for the file as-is.
- evidence: `test/config-doc.test.js:74` — `assert.match(body, /^<!-- pi-sdlc:config-doc v1 fingerprint=[0-9a-f]{64} -->$/m); // 1 sentinel`. Every other assertion in that file uses `CURRENT_SENTINEL_VERSION`/`fingerprint()` dynamically; this one is a literal `v1`. Plan Scope "In" lists only "focused tests" as test work; DoD 8 says "Existing render/write/check state, collision, symlink, and setup integration tests remain green."
- impact: The spec author inherits a self-contradictory acceptance contract: either the v2 bump is not done or DoD 8 is red. Silently editing an existing ASD6 assertion during implement without a plan mandate invites a reviewer flag or a wrong resolution (weakening the sentinel assertion instead of updating it).
- fix: Add to Scope "In": "update the one hardcoded-`v1` sentinel assertion in `test/config-doc.test.js` to the current version constant," and reword DoD 8 to "remain green after that single version-literal update."

### Headline outcome "formatter-stable" has no falsifiable verification path in the DoD

- severity: medium
- confidence: high
- origin: NEW
- location: Objective; Assumption 3; DoD items 1–4
- defect: The objective promises "formatter-stable Markdown" and the issue's stated fix bar is "produce markdown that survives a markdown-formatter round-trip," but Assumption 3 explicitly excludes any formatter from verification and the repo carries no markdown formatter to test against, so every DoD item verifies proxies (delimiter validity, exact containment, absence of one known historical mutation, render determinism) — none of which can fail for a *new* class of formatter mutation. The general outcome as stated cannot be falsified by any planned check.
- evidence: Plan Assumption 3: "Formatter stability is proven mechanically by delimiter validity, exact serialized-value containment, the known historical mutation's absence, and byte-identical repeated render/write/check behavior—not by introducing one formatter as a runtime authority." `package.json` has no markdownlint/prettier/remark dependency (grep returned nothing); Scope "Out" bans a "runtime Markdown parser/formatter dependency". Issue #177 "Fix": "The generator should produce markdown that survives a markdown-formatter round-trip." DoD 3's "survives the known whitespace-mangling regression check" is undefined — no mechanism for checking "survival" without a mangler is named.
- impact: The spec will either inherit an unverifiable outcome (a scenario nobody can write) or the implementer will quietly substitute the proxy for the claim; a future formatter rule that mutates a different part of the render (long lines, list spacing, trailing newline) reintroduces the exact flapping-dirty failure with all DoD items green. The plan also silently narrows the issue's acceptance criterion without flagging the deviation.
- fix: Either restate the objective/DoD as the proxy actually verified (valid CommonMark code spans with Prettier-canonical maxRun+1 delimiters, plus absence of the known mutation) and record the round-trip exclusion as an accepted risk, or permit a dev-only (non-runtime) formatter round-trip test and give it a budget.

### Amendment of an approved, revision-gated Spec has no revision/approval mechanics

- severity: low
- confidence: high
- origin: NEW
- location: Scope "In" item 3; Context for the next agent ("Normative amendment target")
- defect: The plan amends §§13–14 of a Specification whose header records a formal revision history and a named human approval at rev 2, but says nothing about how the amendment is versioned, recorded, or authorized, nor how the amended old spec relates to this issue's own forthcoming Specification (two normative documents will describe the v2 contract).
- evidence: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md` lines 3–20: "Date: 2026-07-18 (rev 2) … Spec gate: **approved** by Neil Chambers on 2026-07-18". Plan: "Amend the original self-documentation Specification's §§13–14 for the v2 rendering contract" with no revision note. Note also §13's normative text hardcodes `CURRENT_SENTINEL_VERSION = "v1"` and `{"v1"} now`, and §12's envelope example shows `"version": "v1"` — the amendment boundary at "§§13–14" leaves §12's example inconsistent.
- fix: Name the amendment mechanics (rev 3 note in the old spec's revision history citing #177's spec/gate as authority) and widen the amendment to cover the §12 `v1` envelope example.

### Track classification exists only as an "assumption," off the repo's plan convention

- severity: low
- confidence: high
- origin: NEW
- location: Assumptions item 4
- defect: The irreversible-track claim ("The change is irreversible because the sentinel/render-format identity is a consumer-bound generated-file contract") is correct but is filed as an assumption instead of a declared classification, unlike prior plans which stamp the track explicitly; an assumption reads as revisable, a track decision is not.
- evidence: Plan Assumption 4 (quoted above); `docs/plans/2026-07-26-iteration-disposition-vocabulary.md:7` — "Track: **irreversible**." as an explicit declaration.
- impact: Downstream automation or reviewers scanning for the track declaration may not find one; a later reader could "falsify the assumption" and wrongly reroute to the reversible fast path while still freezing the v2 wire identity.
- fix: Promote the sentence to an explicit "Track: irreversible" declaration and keep the rationale as its justification.

### Full-suite CI budget in DoD 9 is unbounded as written

- severity: low
- confidence: medium
- origin: NEW
- location: Definition of done item 9
- defect: "the full repository suite remains within its existing normal CI budget" names no number and no measurement, so the clause can never fail; only the focused-test half ("under one second") is falsifiable.
- evidence: Plan DoD 9 quoted; no baseline suite wall-time is cited anywhere in the plan.
- impact: The one proportionality clause covering the whole suite is decorative; a spec cannot turn it into a scenario.
- fix: Replace with a concrete bound (e.g., "the change adds no test exceeding N seconds; suite wall time within X% of the pre-change baseline") or drop the clause and keep only the focused-test budget.

CLEAR: C — in/out boundaries are coherent (v2 bump vs. frozen schema/CLI/readiness do not conflict), and one helper + version bump + tests + spec amendment + regeneration is one spec's worth; verified `keyReference` (`config-doc.mjs:151`) is the only arbitrary-string render surface (header `publishToTracker` interpolation is schema-constrained to integer|"never", `lib.mjs:373`), so the in-scope helper placement is sufficient.

CLEAR: D — the plan complies with the locked sentinel-version lifecycle (Spec §13: retain every shipped version, drop only at a package major) by keeping `v1` in `SUPPORTED_SENTINEL_VERSIONS`, and touches nothing on the Spec's "explicitly unchanged (frozen)" list; claims verified against the repo: `config-doc check` reports `current` (bug 1 resolved as stated), IDV24 exists at `test/iteration-disposition.test.js:504`, v1-companion→stale→regenerate matches the shipped `check`/`write` logic, and Assumptions 1–2 hold (JSON.stringify boundary chars are never backticks; CommonMark accepts a maxRun+1 delimiter, which is also Prettier's canonical form).
