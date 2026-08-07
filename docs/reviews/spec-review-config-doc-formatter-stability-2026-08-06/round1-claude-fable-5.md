# Spec panel round 1 — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Spec: `c3fd2a1`.

Turn budget wrap-up was requested after 8 assistant turns (soft limit 8, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### Plan DoD 3's mutation falsifier is dropped — the formatter-facing outcome has no gating scenario, and §7's full-mapping claim is false

- severity: medium
- confidence: high
- origin: NEW
- location: Spec §6 (CDFS4, CDFS9) and §7; vs `docs/plans/2026-08-06-config-doc-formatter-stability.md` DoD 3
- defect: Plan DoD 3 has two clauses: (a) no one-backtick outer delimiter around the embedded `` `pi --list-models` `` run, and (b) "applying the known space-deletion mutation cannot reproduce the former malformed generated line." CDFS4 gates only clause (a) plus shape-absence; no CDFS scenario applies any mutation, and the mutation itself is never defined. Meanwhile CDFS9's fail condition "working-tree flap" is unobservable by its own machinery: no formatter exists in the repo (plan Scope-Out and Assumption 4 forbid adding one), and CDFS9's budget is one "focused command <1s" (`config-doc check`), which can never exhibit or detect a flap. Yet §7 asserts "Every Plan DoD item maps to CDFS1–CDFS12."
- evidence: Spec CDFS4 pass column: "Outer delimiter is longer than the embedded `` `pi --list-models` `` run; the former malformed single-delimiter shape is absent" — no mutation step. CDFS9 fail column: "Missing/stale/error or working-tree flap"; falsification obligation limits CDFS9 to "run `config-doc check` against the committed-path companion." Plan DoD 3: "applying the known space-deletion mutation cannot reproduce the former malformed generated line." The malformed regression witness is real: `.pi/sdlc/CONFIG.md:67` currently renders `panels` in a one-backtick span containing interior one-backtick runs.
- impact: The only two clauses that tie the "formatter-stable" headline to actual formatter behaviour (DoD 3b's mutation test, CDFS9's flap detection) are respectively missing and vacuous. §7's coverage claim is dishonest as written, and a build that never defines or applies the space-deletion mutation still passes every scenario while claiming DoD 3 satisfied.
- fix: Define the known space-deletion mutation precisely (the whitespace transformation the harness formatter applied in #177), extend CDFS4 to apply it to the v2 render and assert the former malformed line cannot be produced, and either delete CDFS9's "working-tree flap" fail clause or replace it with an observable proxy (e.g., re-running `check` after the defined mutation).

### CDFS7's "real v1 sentinel/body" is unconstructible after the version bump without guessing provenance

- severity: low
- confidence: high
- origin: NEW
- location: Spec §6, CDFS7 + "Falsification obligations" bullet 3
- defect: Once `CURRENT_SENTINEL_VERSION` becomes `v2`, no code path in the package can produce a v1 render — `fingerprint()` and `sentinelLine()` are hardwired to the current version (`skills/sdlc/scripts/config-doc.mjs:49-53,60-62`). The obligation "must use a real v1 sentinel/body, not a mocked boolean" never says what "real" means or where it comes from: a fixture captured from the `9ad48ba` v1 renderer, or a sentinel reconstructed as `sha256hex("v1" + NUL + canonicalJson(config))` over a hand-assembled body. An implementer must guess, and a hand-assembled "v1" body with an arbitrary 64-hex fingerprint satisfies the letter of the obligation while being exactly the mock the obligation forbids.
- evidence: Spec §6: "CDFS7 must use a real v1 sentinel/body, not a mocked boolean." `config-doc.mjs:22-27` (current/supported constants), `:49-53` (fingerprint uses `CURRENT_SENTINEL_VERSION` only) — no v1 renderer survives the bump. No fixture location is named anywhere in §§4-6; `test/fixtures/` contains no sentinel-bearing file (verified by grep).
- impact: The compatibility scenario the whole v1→v2 migration rests on is the one whose test input is under-specified; two implementers produce non-comparable evidence, and a weak reconstruction silently degrades CDFS7 to the mocked shape the spec explicitly bans.
- fix: Pin CDFS7's input: a fixture captured from the `9ad48ba` v1 renderer for the test config (name its path), or explicitly sanction reconstruction via `sha256hex("v1" + NUL + canonicalJson(config))` over a stated body.

CLEAR: A — nothing freezes wrong: the sentinel grammar already admits v2 (`SENTINEL_RE` `v[0-9]+`, config-doc.mjs:57), `SUPPORTED_SENTINEL_VERSIONS` is append-only per the §13 lifecycle, the fingerprint is version-parameterized (config-doc.mjs:49-53), and config-doc.mjs is not in the ASD19 FROZEN list (test/frozen-surfaces.test.js:26-44), so the changed-surface list is buildable without tripping the frozen-surface gate.

CLEAR: C — the §3 adaptive-span algorithm is exact and implementable (maximal-run scan, maxRun+1 delimiter, no normalization); stale/write/collision semantics as stated match the code paths verbatim (v1 recognized→stale→regenerated via check/write branches config-doc.mjs:224-233, 262-273; unsupported v3→collision error/2 and refused/3 via `recognized:false`); the one-backtick key-span justification is grounded — top-level keys are a fixed backtick-free allowlist (lib.mjs:202-205), and the only other JSON-interpolated render site, `shape.publishToTracker`, is schema-constrained to an integer or `"never"` (lib.mjs:372-374).

CLEAR: E — framework claims verified correct: CommonMark (0.31.2 §6.1) strips one boundary space only when content both begins and ends with a space, and JSON tokens never begin/end with a space or backtick, so the §3 no-normalization claim holds; a closing backtick string must equal the opener's length and all interior runs are strictly shorter by construction, so the delimiter cannot collide; mixed one-backtick key spans and N-backtick value spans on one line parse left-to-right without interference; the real regression witness exists (`.pi/sdlc/sdlc.config.json:46` — max interior run is 1, so `panels` gets a 2-backtick delimiter as CDFS4 assumes).

CLEAR: F — every scenario carries a priced budget; proportionality verified: the full suite at c3fd2a1 ran in 3.4s on this machine (`# duration_ms 3423` — 7 file failures were my sandbox's missing `ajv` dev-dep, not repo defects), so the 30s external kill for CDFS10 and <1s focused budgets are realistic, and no scenario invokes models or network. CDFS10's "the one literal v1 assertion" claim is accurate: `test/config-doc.test.js:74` is the only literal-v1 assertion in `test/` and no fixture embeds a sentinel.

CLEAR: H — §7 correctly declares no inbound `CARRY-TO-SPEC` (none exists in the plan, verified by repo-wide grep) and mints none; no orphan carry. The rev-3 amendment scope is complete: every v1-current statement in the original spec sits inside §§12–13 (lines 378, 395, 400-401; line 549's "FS11-v1" is unrelated), so CDFS12's §§12–14+header inspection window leaves no stale v1 statement outside it.

(B, D, and G are not clear; their defects are consolidated in finding 1 — the missing DoD 3 falsifier is simultaneously the scenario gap, the plan contradiction, and the §7 overclaim.)
