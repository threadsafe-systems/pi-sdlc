# Plan: formatter-stable generated CONFIG.md values

Track: **irreversible** — the sentinel/render-format identity is a consumer-bound generated-file contract.

## Objective

Close #177's remaining generator defect: render every persisted configuration value into a valid CommonMark code span whose delimiter cannot collide with embedded backticks, without altering the value, then regenerate this repository's `.pi/sdlc/CONFIG.md` under a new recognized render-format version. The claim is deliberately bounded to the nested-backtick code-span defect; it does not promise canonical output under every possible Markdown formatter.

## Rationale

`keyReference()` currently wraps raw `JSON.stringify` output in a one-backtick code span. The `panels.$comment` value itself contains backticks, so the generated Markdown has ambiguous delimiters and a formatter removes adjacent whitespace. That makes the generated companion flap dirty and makes `config-doc check` report stale after formatting.

The agreed design keeps the compact JSON-order list and exact values. A code-span renderer chooses a delimiter one backtick longer than the longest contiguous backtick run in the serialized value. Valid schema values serialize to JSON whose first and last characters are not backticks, so no CommonMark boundary padding is required. The render-format identity moves from `v1` to `v2`; `v1` remains recognized so existing generated companions are safely stale/regenerated rather than treated as consumer collisions.

No contradiction remains after rejecting two issue-listed alternatives: stripping/sanitizing backticks would change the complete-current-value contract, while backslash escaping inside a code span does not reliably escape its delimiter.

## Scope

### In

- Add one deterministic adaptive code-span helper in `config-doc.mjs` and use it for every JSON-order key value.
- Set `CURRENT_SENTINEL_VERSION` to `v2` and retain both `v1` and `v2` in `SUPPORTED_SENTINEL_VERSIONS`.
- Amend the original self-documentation Specification's §§12–14 for the v2 rendering contract, recording a rev-3 amendment that cites #177 and this slice's approved Specification as authority.
- Add focused tests for nested backticks, contiguous backtick runs, exact value preservation, deterministic rendering, v1 recognition/staleness, v2 identity, and the known formatter-mangling regression.
- Update the existing hardcoded-v1 sentinel assertion in `test/config-doc.test.js` to assert the current version without weakening sentinel coverage.
- Regenerate and commit this repository's `.pi/sdlc/CONFIG.md` with the v2 sentinel/fingerprint.

### Out

- Changing `sdlc.config.json`, config schema version, readiness states, startup behavior, collision behavior, or command interfaces.
- Adding a runtime Markdown parser/formatter dependency.
- Stripping, escaping, or otherwise changing persisted values.
- Adding a new CI gate for stale companions. The existing IDV24 standing scenario already requires this repository's companion to be current; #177 bug 1 is currently resolved.
- Reformatting unrelated Markdown.

## Assumptions

1. `JSON.stringify` of every schema-valid persisted top-level value returns a JSON token whose boundary characters are not backticks.
2. CommonMark code spans accept a delimiter longer than every contiguous backtick run in their content.
3. The accepted evidence boundary is valid CommonMark delimiter construction, exact serialized-value containment, rejection of the known historical malformed shape, and byte-identical repeated render/write/check behavior. General round-tripping through arbitrary Markdown formatters is residual risk and is not claimed.
4. A dev-only formatter dependency would make one formatter's canonicalization authoritative without proving compatibility with the harness formatter that exposed #177, so this slice does not add one.

## Definition of done

1. Every key-reference value is enclosed by a backtick delimiter longer than any run inside that value.
2. Rendered content contains the byte-exact `JSON.stringify` value; no content sanitization occurs.
3. The current `panels.$comment` renders without a one-backtick outer delimiter around its embedded `` `pi --list-models` `` content, preserves the original space before that embedded span text, and cannot equal the recorded historical malformed single-delimiter output.
4. Values containing one-, two-, and three-backtick runs produce valid deterministic delimiters and render byte-identically on repetition.
5. New renders carry `v2`, and fingerprints include `v2`.
6. A well-formed `v1` sentinel remains recognized; an on-disk v1 companion classifies stale and `write` regenerates it to v2 without `--force`.
7. `.pi/sdlc/CONFIG.md` is regenerated to v2 and `config-doc check` reports `current`.
8. Existing render/write/check state, collision, symlink, and setup integration tests remain green after the single hardcoded-v1 assertion is updated to the current version.
9. Focused config-doc tests complete in under one second, and the full `npm test` process completes under a 30-second external timeout; no model/network cost is introduced.
10. No runtime dependency or public CLI/config/readiness shape changes.

## Context for the next agent

- Primary implementation: `skills/sdlc/scripts/config-doc.mjs`, especially `keyReference`, `CURRENT_SENTINEL_VERSION`, and `SUPPORTED_SENTINEL_VERSIONS`.
- Primary tests: `test/config-doc.test.js`; standing current-companion check: IDV24 in `test/iteration-disposition.test.js`.
- Normative amendment target: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md` §§12–14 plus its revision header. Record rev 3; do not leave the §12 v1 envelope example stale.
- Issue #177 describes two bugs; only formatter stability remains. Do not reintroduce a separate bug-1 CI slice.
- No carry is minted. The Specification must price all verification scenarios and preserve the exact-value/no-dependency boundaries.

## Amendments

### A1 — formatter regression witness wording

- Trigger: `SPEC-R1-02` found that literal application of a space-deletion transform could always mutate bytes even inside a valid code span, so Plan DoD 3's original mutation phrasing was not a valid falsifier.
- Class: **(c), normal fix wave**.
- Disposition: **incorporated**. DoD 3 now requires exact space preservation and inequality with the recorded historical malformed output; the Specification owns the executable witness.
- Author: orchestrator, during Spec panel adjudication on 2026-08-06.
