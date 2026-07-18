# Consolidated plan panel — sdlc-lifecycle-telemetry (round 1)

- Date: 2026-07-17
- Artifact: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` @ 027a0a5 (rev 1)
- Panel: openai-codex/gpt-5.6-sol:high, zai/glm-5.2:high,
  deepseek/deepseek-v4-pro:high (author vendor anthropic excluded)
- Orchestrating/adjudicating model: anthropic (Claude, session model) —
  human owner ratification pending at the plan gate
- Per-model files: `gpt-5.6-sol.md`, `glm-5.2.md`, `deepseek-v4-pro.md`

## Findings (deduped) and adjudication

**F1 — Auto-emitted events have no unambiguous run identity** (gpt-5.6-sol,
HIGH). The frozen FS5 CLIs carry no slug; "every event requires `slug`" is
unimplementable without a defined identity source. **INCORPORATED** (rev 2):
plan now pins the active-run identity contract — explicit `--slug` flag /
`SDLC_RUN_SLUG` env, falling back to feature-branch-name mapping; unresolvable
identity ⇒ emission skipped with a stderr warning and an honest coverage gap.
FS5 change declared explicitly as additive optional flags, ADR-recorded.

**F2 — Regenerate-from-raw omits non-regenerable inputs** (gpt-5.6-sol,
HIGH). Parent session transcripts, mutable GitHub data, and LLM outputs are
collector inputs but not part of the promised raw archive. **INCORPORATED**
(rev 2): `collect` now snapshots every external input it reads (correlated
session-transcript extracts, GitHub API responses, raw LLM outputs) into the
run store's `raw/` area before distilling; regeneration is defined from the
snapshot, and the retention rule is stated.

**F3 — Lifecycle-check auto-emission contradicts frozen FS9 read-only
contract** (gpt-5.6-sol, HIGH). **INCORPORATED** (rev 2): `check-lifecycle`
stays read-only; its telemetry moves to caller-side emission (skill-prose /
dispatch step), removed from the auto-emitted list; scope and DoD updated to
match.

**F4 — FS1 `paths` contradiction: Out forbids what Context leaves open**
(deepseek HIGH, glm MEDIUM, gpt-5.6-sol MEDIUM — strongest cross-model
agreement). Also: "FS1-additive" is factually wrong against
`additionalProperties: false` + the closed key set in `lib.mjs`.
**INCORPORATED** (rev 2): decided at plan level — v1 hardcodes
`.pi/sdlc/runs/` and `docs/retros/`; extending FS1 `paths` is explicitly out
of scope this round; the open question is removed from the
spec-author context.

**F5 — FS11 normative-reference inventory not extended** (gpt-5.6-sol MEDIUM,
glm MEDIUM). New skill + new SKILL.md commands would ship uninventoried,
making the claimed FS11 discipline inert. **INCORPORATED** (rev 2): Scope In
and DoD gain an additive inventory extension covering every package-owned
normative reference in `skills/sdlc-retro/*` and the new sdlc SKILL.md hook
commands; `check-references` must pass with them inventoried.

**F6 — Collector DoD covers a fraction of R3** (gpt-5.6-sol, MEDIUM).
**INCORPORATED** (rev 2): DoD expanded — offline fixtures and exact
assertions per source adapter (manifest, panel harvest, transcripts, reviews,
git/GitHub via injected fake seam) and per derived-measure family (phase
timing, rollups, precision, interventions, rework), plus the LLM seam
injected as a fixture.

**F7 — Panel precision depends on unstructured prose adjudications**
(deepseek MEDIUM, glm LOW). **INCORPORATED** (rev 2): per-model precision and
cost-per-incorporated-finding reclassified as LLM-classified, model-attributed
soft data with coverage markers when unparseable; no new frozen adjudication
format is introduced this round (recorded as a candidate evolution).

**F8 — FS5 stdout contract at risk from emission side effects** (deepseek,
MEDIUM). **INCORPORATED** (rev 2): emission channel pinned — events append
only to the run-store file; diagnostics go to stderr with a stable prefix;
primary stdout of the touched CLIs stays byte-identical; risk entry and DoD
assertion added.

**F9 — "Byte-identical" render DoD vs "golden-ish" tests contradiction**
(deepseek, MEDIUM). **INCORPORATED** (rev 2, narrowed): renderer embeds no
generation-time values; determinism asserted as render-twice ⇒ byte-identical
within one renderer/Node version, plus structural per-section assertions;
cross-version byte stability is not claimed.

**F10 — Doc-presence "pin" underspecified** (deepseek, LOW). **INCORPORATED**
(rev 2): replaced with a token-based structural assertion (each mandated hook
step contains `record-run-event` and the event type token; prose wording not
pinned).

**F11 — Scope magnitude / decomposition signal** (glm LOW, deepseek LOW).
**INCORPORATED** (rev 2) as a sizing statement: single-spec intent affirmed,
structured capture → distil → render; the R1+R2 / R3+R4 seam is named as the
sanctioned split point if the spec panel judges the spec oversized.

## Outcome

11/11 findings incorporated; 0 dismissed. No surviving high or medium
findings against rev 2. CLEAR notes: all three reviewers independently
confirmed the irreversible-track classification (CLEAR F) and scenario-level
verifiability (CLEAR B). Round 2 not required unless the human gate reopens
a decision.
