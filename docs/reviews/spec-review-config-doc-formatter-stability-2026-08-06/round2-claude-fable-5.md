# Spec panel round 2 — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `c3fd2a1..9db4ea9`.

Turn budget wrap-up was requested after 8 assistant turns (soft limit 8, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### SPEC-R1-01 — confirmed fixed

Original Specification rev-3 amendment now lands in this gate: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md:3` (rev 3 header), `:384` (§12 envelope `"version": "v2"`), `:401-408` (§13 `v2` current, `{"v1","v2"}` supported, lifecycle preserved), `:464-470` (§14 adaptive-span row); Spec §2 drops "during implementation" and CDFS12 gates the amendment. One-line confirmation, not re-litigated.

### SPEC-R1-02 — confirmed fixed

Plan A1 replaces the invalid literal-mutation clause with observable requirements (Plan DoD 3: space preservation + inequality with recorded malformed output); CDFS4 now defines the witness (one-backtick outer delimiters + deleted `with ` space) with observable pass/fail on the real `panels` line; CDFS9's unobservable "working-tree flap" fail clause is dropped ("Missing, stale, or error"). §7's full-mapping claim is now true: DoD 1–10 each map onto CDFS1–CDFS12.

### SPEC-R1-03 — confirmed fixed

CDFS7 pins `test/fixtures/config-doc/v1-valid-config.md`, "captured byte-for-byte from baseline `c3fd2a1`'s v1 renderer for `VALID_CONFIG`", and the falsification obligation bans hand-assembled sentinels. Provenance is deterministic: `VALID_CONFIG` exists (`test/config-doc.test.js:19`) and `git diff 9ad48ba..c3fd2a1` touches only the new spec doc, so `c3fd2a1`'s renderer is byte-identical to the grounded baseline's.

### §4's changed-surface inventory omits the new committed fixture CDFS7 pins

- severity: low
- confidence: high
- origin: NEW
- location: Spec §4 "Changed" list vs §6 CDFS7 + falsification obligation 3
- defect: Rev 2's CDFS7 (delta text) introduces a new committed artifact, `test/fixtures/config-doc/v1-valid-config.md`, but §4's Changed list still enumerates only `config-doc.mjs`, `.pi/sdlc/CONFIG.md`, the original spec, and `test/config-doc.test.js`. The surface inventory is internally inconsistent with the spec's own scenario table.
- evidence: Spec §4 lists exactly four changed surfaces; CDFS7 row: "Given `test/fixtures/config-doc/v1-valid-config.md`, captured byte-for-byte from baseline `c3fd2a1`…"; `ls test/fixtures` shows only `consumer`, `golden`, `home` — the `config-doc/` directory does not yet exist, so it is a new surface this change must create and commit.
- impact: The build must create a file the spec's surface contract does not declare; a reviewer checking the diff against §4 would flag the fixture as out-of-contract, or a builder could "satisfy" §4 by inlining the fixture into the test file, silently violating CDFS7's pinned-path provenance.
- fix: Add `test/fixtures/config-doc/v1-valid-config.md` (new pinned baseline fixture) to §4's Changed list.

### §4 names a frozen surface that does not exist: `CURRENT_CONFIG_SCHEMA_VERSION`

- severity: low
- confidence: high
- origin: NEW
- location: Spec §4 "Unchanged" list, bullet 3
- defect: The unchanged-surface list pins "`CURRENT_CONFIG_SCHEMA_VERSION`", but no such identifier exists anywhere in the codebase or the governing spec; the real constant is `CONFIG_SCHEMA_VERSION`.
- evidence: `skills/sdlc/scripts/lib.mjs:26` — `export const CONFIG_SCHEMA_VERSION = 3;`; `skills/sdlc/scripts/check-schema-break.mjs:12` regex-matches the literal `export const CONFIG_SCHEMA_VERSION`; repo-wide grep for `CURRENT_CONFIG_SCHEMA_VERSION` across `skills/`, `test/`, and `docs/specs/2026-07-18-sdlc-agent-self-documentation.md` returns zero hits. (Caveat honestly noted: this wording is unchanged from rev 1 and was not flagged in round 1; it is raised now as a one-word hygiene fix, not as a delta regression.)
- impact: A frozen-surface declaration that names a nonexistent identifier cannot be mechanically checked; the schema-break tooling guards `CONFIG_SCHEMA_VERSION`, so the spec's pin as written gates nothing.
- fix: Rename the bullet to `CONFIG_SCHEMA_VERSION` (`lib.mjs:26`).

CLEAR: A — v2/{v1,v2} matches the amended §13 lifecycle (append-only supported set, removal only at a package major); sentinel grammar already admits v2 (`config-doc.mjs:57` `v[0-9]+`); the pinned fixture path is backfill-safe; nothing in the delta freezes a shape that cannot be extended.

CLEAR: B — every Plan DoD item now maps to a gating scenario (DoD 3 → CDFS4's defined witness with byte-observable pass/fail; DoD 6 → CDFS7's pinned real-provenance fixture; DoD 7 → CDFS9's now fully observable fail set); mutation falsifiers in CDFS2/CDFS3 are non-vacuous.

CLEAR: D — no plan/spec contradiction remains: Plan A1's DoD 3 wording and CDFS4 agree; the rev-3 amendment text, Spec §2, and CDFS12 agree on revision authority ("participates in this panel, approved with this gate"); the header-vs-CDFS7 baseline labels (`9ad48ba` vs `c3fd2a1`) are byte-equivalent for the renderer (`git diff 9ad48ba..c3fd2a1` is docs-only), so no divergent action is possible.

CLEAR: E — delta claims re-verified against the code: v1-recognized → stale/1 → regenerated/0 (`config-doc.mjs:253-258` stale, `:295` regenerated), unsupported v3 → error/2 (`:251-252`) and refused/3 (`:286-288`); the amended original spec retains no stale v1-current statement — remaining `v1` hits are the amendment itself (lines 16, 407) and the unrelated `FS11-v1` label (line 558), so CDFS12's §§12–14+header window is complete; CDFS10's "one literal v1 assertion" remains exactly `test/config-doc.test.js:74` (line 182 is a comment; no fixture embeds a sentinel).

CLEAR: F — all twelve scenarios carry priced budgets; the 30s external kill for CDFS10 remains realistic against the measured ~3.4s suite; no network/model cost is introduced by the delta.

CLEAR: G — "rev 2 incorporates every round-1 finding" is true against the consolidated table; the "recorded historical malformed witness" is now recorded in the spec's own CDFS4 text with sufficient bytes to construct it (the deleted-space form never existed in committed history — `git log --all -S` finds nothing — so the inline record is what makes CDFS4 honest); the bounded no-universal-formatter claim is preserved.

CLEAR: H — no inbound `CARRY-TO-SPEC` exists, none is minted, and the A1 ledgers in Plan and Spec §7 are mutually consistent with the consolidated dispositions (3 incorporated, 0 dismissed/barred/carried).
