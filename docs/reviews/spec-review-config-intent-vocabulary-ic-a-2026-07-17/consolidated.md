# Consolidated spec review — IC-A intent vocabulary (2026-07-17)

- Artifact: `docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md` (rev 1)
- Panel: `openai-codex/gpt-5.6-luna:high` (→ `gpt-5.6-luna.md`),
  `zai/glm-5.2:high` (→ `glm-5.2.md`) — capped at 2 by owner instruction;
  floor ≥2 met; author vendor (anthropic) excluded.
- Orchestrating model: anthropic/claude (session agent); final adjudicator:
  project owner (gate approval).
- Outcome: **9 consolidated findings (3 high, 5 medium, 1 low), all
  incorporated into spec rev 2; plan amended to rev 4 in the same wave.
  None dismissed.**

## Consolidated findings and adjudication

### S1 (high) — composition-identical migration of block-absent configs is impossible

luna #1 + glm #1 + glm #2 (merged; strongest agreement, with glm's exact
panel recomputation). The v2 vendor path never breaks at the floor
(`resolve-panel.mjs:172-192`), excludes by *vendor* (`:174`), and never
consults gate modes (`:163-204`); v3 keeps the OL-A loop (floor break,
model-identity exclusion, operative modes). ICA12's "identical panels" was
unfalsifiable-as-true; the repo's own `pr_review` provably changes
(claude-fable-5 re-enters; sizes cap at floors).
**Adjudication: incorporated via plan rev 4.** C1's "prove
outcome-equivalence per roster or refuse" is replaced by a **disclosed
semantic move**: floors and roster preserved verbatim; block-absent repos
move to the ratified OL-A contract; migration emits a per-phase disclosure
of the four delta classes; ICA12 rewritten as two pinned tiers
(block-present identical; block-absent asserts the exact expected panel
vectors). R2 (axis-equivalence refusal) deleted — deltas are disclosed, not
refused. The former reversible-design synthesis stands (it encodes the
governing SKILL law, which — not the script — carried v2 block-absent gate
semantics), with the script-level delta named in the disclosure.

### S2 (medium) — `task_validate` fold contradicted the plan's binding row

luna #2. The plan mandates `panels.phases.task_validate.panelSize: 1`; rev 1
omitted it as equal-to-default.
**Adjudication: incorporated** — the row is written always (block-absent);
ICA6 updated.

### S3 (high) — no-roster v2 configs had no destination for divergent floors

luna #3. `lib.mjs:268-273` accepts a block-present config without `panels`;
rev 1 required a roster to carry a floor override.
**Adjudication: incorporated** — §2.5 relaxes: `phases` may hold any subset
of phase keys; each phase object needs ≥1 of `prefer`/`panelSize`
(floor-only entries valid); roster completeness stays a readiness/runtime
concern. New ICA25.

### S4 (medium) — preset round-trip broke on floors attached to human/off gates

luna #4. v2 standard carries `plan_review.minPanel: 1` on a `human` gate —
unreadable in v2 (`resolve-panel` refuses human modes), so materialising it
would both break the round-trip and preserve dead state.
**Adjudication: incorporated** — floor overrides are written only for gates
whose folded mode has a reviewer on some track; ICA7 defines round-trip as
shape equality over `review`/`shape`/`overrides`.

### S5 (medium) — preset `evidence` values vs migration-derived `evidence`

glm #3. All v2 presets write a lifecycle block ⇒ migration yields
`evidence: true`, but v3 solo/standard bundles say `false`.
**Adjudication: incorporated** — the two are different questions (existing
commitment vs fresh-write recommendation); §6 states it, ICA7 excludes
`evidence` from the round-trip.

### S6 (medium) — R3 over-refused; frozen `vendor()` unspecified

glm #5 + luna #5 (merged). The opt-out is live only when some floor ≥ 2
(`resolve-panel.mjs:165`); and the disclosure/refusal computation needs the
exact v2 vendor heuristic after §4 deletes it.
**Adjudication: incorporated** — R3 gains the liveness condition (plan rev 4
row updated); `vendor()` is frozen verbatim as migration-only code with test
vectors, unreachable from the runtime resolver (ICA9, ICA10).

### S7 (medium) — preset patch silently deleted consumer `overrides`

glm #4. "Replaces overrides" wholesale drops consumer-authored per-track
dials without disclosure.
**Adjudication: incorporated** — patch refuses without `--force` when it
would delete/alter an `overrides` block the preset doesn't carry; report
lists before→after; ICA19 updated.

### S8 (medium) — `--override`/`--preset custom` contract gaps

glm #6. Exit codes, per-dial value validation, and the `custom` disposition
were unstated.
**Adjudication: incorporated** — §6 specifies validation (track/dial/value,
exit 2, existing malformed-flag pattern) and retires `--preset custom` with
a named successor; new ICA23.

### S9 (low) — refusal precedence; purge-grep vs retired-flag diagnostics

glm #7 + luna #7 (merged: determinism of diagnostics). Unordered refusal
bullets; ICA20's literal grep contradicted the required retired-flag error
text.
**Adjudication: incorporated** — §4.3 fixes the order (separateSpec first
for `spec_review`); ICA20 becomes a syntax-aware runtime-read-path purge
with an enumerated allowlist (setup parse/error path, `migrate.mjs`,
fixtures); new ICA24.

## Reviewer CLEAR notes (recorded, no action)

glm: v3 key shape covers every plan-required key; kernel probes match C6;
NFRs verifiable. luna: no additional durability/security defect beyond the
inherited (and tested) migration atomicity; no honesty defect beyond S1
(now resolved by disclosure).
