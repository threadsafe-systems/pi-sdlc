# Spec review — deepseek/deepseek-v4-pro:high

- Artifact: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md` rev 1
- Commit: d528b97 (main)
- Verdict: 1 high, 3 medium, 2 low; CLEAR on A/B/C/D/E/F/G.

## Findings

### Startup error fallback is undefined for the config-invalid sub-case

- severity: high; confidence: high
- location: §12 (check states) + §15 (startup fallback)
- `error` conflates "config invalid/unreadable" and "unrecognized collision".
  §15's "fall back to validated JSON where safe" works for collision (config is
  valid) but is undefined for the invalid-config sub-case.
- evidence: §12 error row; §15 error branch; `sdlc-status.mjs:297-309` gates
  config validity at exit 0, so config-invalid at startup is a race.
- fix: split `error` into `error-config`/`error-collision` with per-case §15
  behaviour, or note that sdlc-status exit 0 guarantees validity, making
  config-invalid a dead branch and `error` at startup always a collision.

### Sentinel version lifecycle is unspecified

- severity: medium; confidence: high
- location: §13 `SUPPORTED_SENTINEL_VERSIONS`
- No contract for retiring old versions; a future format bump that drops v1 would
  silently turn every existing `CONFIG.md` into a collision, forcing `--force`.
- fix: require the set to include every shipped version until a major boundary
  explicitly retires it (documented breaking); `write` is the in-support upgrade
  path, `--force` the cross-retirement path.

### `canonicalJson` sort order is underspecified

- severity: medium; confidence: high
- location: §13 fingerprint
- `JSON.stringify` preserves insertion order, does not sort; two implementations
  (or a future consumer-side checker) could disagree on order → divergent
  fingerprints → `check` disagreement.
- fix: pin recursive key sort (default `Array.prototype.sort()` UTF-16
  ascending), new object with sorted keys, `JSON.stringify` no `space`, arrays
  unchanged.

### 220-line SKILL.md ceiling lacks feasibility evidence

- severity: medium; confidence: medium
- location: §4 size ceiling
- Concrete but unproven achievable against the seven kernel responsibilities; if
  impossible, the spec gate is wasted.
- fix: add a line budget/draft, or delegate ceiling negotiation to Build with a
  recorded justification / falsifiable revised ceiling.

### `version == current` is redundant with the fingerprint

- severity: low; confidence: high
- location: §12 `current` predicate
- The fingerprint incorporates `CURRENT_SENTINEL_VERSION`, so `version !=
  current` guarantees a fingerprint mismatch; the extra conjunct adds no
  rejection path.
- fix: remove the conjunct (note the implication) or add a clarifying sentence.

### Structural discovery glob patterns may require a library, conflicting with §19

- severity: low; confidence: medium
- location: §16 + §19
- Node `fs` has no glob; "glob patterns" is unconstrained while §19 forbids new
  deps.
- fix: constrain to single-segment `*` in filename position; implement with
  `readdirSync` + `RegExp`.

## CLEAR

- A (frozen surfaces guarded by ASD19; sdlc-status exits, check-lifecycle ids,
  schemaVersion 3, resolve-panel scoped out), B (every DoD row 1–14 maps to an
  ASD scenario; non-vacuity explicit), C (config-doc interface pinned; `lib.mjs`
  `inspectConfig` at :195 is real and validates v3), D (no contradiction with
  plan/plan-review/IC-B/OL-C), E (framework reality verified: `inspectConfig`
  exists/validates v3; sdlc-status exits; check-lifecycle ids; the
  normative-references schema currently lacks `class` — additive as claimed),
  F (determinism, installed-consumer resolution, no-new-deps, safe degradation),
  G (no overclaiming; JSON-authoritative trust model honest).
