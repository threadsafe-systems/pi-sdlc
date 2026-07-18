# Build: resolve-panel cross-provider model identity + roster fallback fix

- Plan: `docs/plans/2026-07-18-resolve-panel-cross-provider-identity.md`
- Track: reversible (fast path) — no Specification; this build plan projects
  directly from the approved Plan.
- Tracker: below `shape.publishToTracker: 2` — task count is 1, so this stays
  a plain committed build-plan doc; no epic/sub-issue/board publish.
- `review.tasks: subagent` — this task carries a committed PV1 manifest
  (`docs/validation/resolve-panel-cross-provider-identity/rpi-t1.json`) and
  ends with a validator subagent running `scripts/validate-task.sh`.

## Task rpi-t1: cross-provider model identity collapsing + Bedrock roster fallback

**Objective**: implement the Plan's "In" scope as one coherent change — the
three pieces are tightly coupled (the roster addition only makes sense once
identity-collapsing exists to protect it) and don't benefit from splitting.

**Files**:

- `skills/sdlc/scripts/resolve-panel.mjs` — extend `modelIdentity()`
- `.pi/sdlc/sdlc.config.json` — add the Bedrock fallback to `pr_review.prefer`
- `test/resolve-panel-v3.test.js` — new cases

**Test-first**: write the three new test cases against the *current*
`modelIdentity()` first, watch them fail (Bedrock-aliased Claude currently
resolves to a distinct identity from direct-API Claude, so author-exclusion
does not collapse it), then implement.

1. `amazon-bedrock/global.anthropic.claude-opus-4-8` collapses to the same
   identity as `anthropic/claude-opus-4-8` for author-exclusion (author
   passed as one, roster carries the other — the excluded one must not
   appear in the resolved panel).
2. `amazon-bedrock/global.anthropic.claude-opus-4-8-v1:0` and
   `amazon-bedrock/us.anthropic.claude-opus-4-8-v1:1` stay **distinct**
   identities from each other (different Bedrock version qualifiers are not
   collapsed — guards the ambiguity the 2026-07-14 opt-in-lifecycle-config
   spec reviews flagged).
3. `amazon-bedrock/amazon.nova-pro-v1:0` (Bedrock-native, no direct-provider
   equivalent) is unaffected — identity stays its own dotted form, not
   collapsed or mangled.

**Implementation notes** (Build pins what Plan left open):

- Recognized cross-provider vendor dotted-names for Bedrock aliasing:
  `anthropic`, `deepseek` (per Plan's named minimum).
- Recognized Bedrock region/inference-profile prefixes to strip before
  vendor matching: `us.`, `eu.`, `au.`, `jp.`, `global.` — verified live
  against this session's `pi --list-models` output (`amazon-bedrock` rows).
  Implement as a prefix-strip loop/regex, not a hardcoded single case, so an
  unrecognized future prefix fails safe (stays un-collapsed, i.e. treated as
  its own identity — never silently merges two different models).
- The collapse only changes the **identity key** used for
  dedup/author-exclusion comparison; `printPanel`/the emitted panel array
  still carries the original, real, invocable model id string — never the
  canonical/collapsed form.
- Panel roster edit: add `"amazon-bedrock/global.anthropic.claude-opus-4-8"`
  as the 5th entry in `panels.phases.pr_review.prefer` in
  `.pi/sdlc/sdlc.config.json` (after the existing 4). Update the schema
  `$comment` only if it currently states a fixed candidate count (check
  before editing — do not restate roster contents in two places).

**Check commands**:

```
node --test test/resolve-panel-v3.test.js
node --check skills/sdlc/scripts/resolve-panel.mjs
npm run lint
node skills/sdlc/scripts/sdlc-status.mjs --repo-root . --format json
```

(the `sdlc-status` run confirms the edited `.pi/sdlc/sdlc.config.json` is
still schema-valid and `state: ready`, exit 0 — a hard gate: a broken roster
edit must not silently pass because the resolver-level tests are green.)

**Scenario ids**: none owned — reversible track, no Specification exists.
Acceptance is the Plan's Definition of Done directly.

**PV1 manifest categories**:

- `tests`: required — the three new `resolve-panel-v3.test.js` cases plus
  the existing suite (no regressions).
- `static`: required — `node --check` on the edited script, `npm run lint`.
- `scenarios`: n/a — "No Specification exists on the reversible track (Plan
  skips Spec); acceptance is the Plan's Definition of Done directly."
- `standards`: required — `sdlc-status` config-validity check (roster edit
  must not break the committed config's schema validity).
- `bannedPatterns`: n/a — "No project-specific banned-pattern grep applies
  to this change; `git diff --check` coverage is redundant with `npm run
  lint`'s whitespace rules for this repo's biome config."

## Definition of done (mirrors the Plan)

- [ ] `modelIdentity()` collapses the documented Bedrock cross-provider
      aliases; version-qualified and Bedrock-native ids remain distinct.
- [ ] `pr_review`'s `prefer` list carries the correctly-idd Bedrock fallback
      candidate.
- [ ] All four check commands above pass; full `npm test` suite green.
- [ ] PV1 manifest + PV2 runner PASS, receipt committed under
      `docs/reviews/task-validate-resolve-panel-cross-provider-identity-rpi-t1-<date>/`.
- [ ] Issue #80 closes on this effort's PR merge (`Closes #80`), PR body
      records the T3/H3-already-resolved audit from the Plan.
- [ ] PR panel runs to the stop condition (reversible track: no pre-PR
      panel; the PR panel still runs).
