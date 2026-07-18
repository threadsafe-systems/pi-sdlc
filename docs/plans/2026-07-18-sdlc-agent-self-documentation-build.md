# Build plan: agent self-documentation for pi-sdlc

- Date: 2026-07-18
- Track: **irreversible**; slug `sdlc-agent-self-documentation`
- Sources: plan `docs/plans/2026-07-18-sdlc-agent-self-documentation.md` (rev 2,
  gate approved); spec `docs/specs/2026-07-18-sdlc-agent-self-documentation.md`
  (rev 2, gate approved; scenarios ASD1–ASD20); build handover
  `docs/briefs/2026-07-18-sdlc-agent-self-documentation-build-handover.md`.
- Spec review: `docs/reviews/spec-review-sdlc-agent-self-documentation-2026-07-18/`.
- Definition of done: Spec §20 scenarios **ASD1–ASD20** green; the committed
  `SKILL.md` ≤ 220 physical lines and ≤ 16384 bytes with all seven §4 kernel
  responsibilities; FS11 reference check green; config schema check green;
  installed-consumer e2e fixtures pass; full `node --test` corpus and
  `biome check` clean; frozen surfaces (§1) byte-identical to baseline
  (ASD19). Expected additive **feature** release unless a genuinely breaking
  installed interface change is discovered (then a `BREAKING CHANGE:` footer,
  never the `!` shorthand).

Check commands are portable argv (PV1). This repo's checks: `node --test` (the
file(s) named per task), `node --check` on edited scripts, `npx biome check` on
edited files, `node skills/sdlc/scripts/check-references.mjs` (FS11), and
`node skills/sdlc/scripts/sdlc-status.mjs` (readiness on the branch). Scenario
ids map to Spec §20 verbatim — never re-derived here. This is **one PR** at the
end (track irreversible), closing the epic + all sub-issues.

Implement-phase mechanics (from config + handover): `review.tasks: subagent` —
each task ends with the deterministic validator + a PV1 manifest under
`docs/validation/sdlc-agent-self-documentation/` + a receipt under
`docs/reviews/task-validate-*`; `review.code: panel` floor 3 at PR. The
`implement:before` hook creates **and enters** a worktree — move the session's
working root into it before writing (create-then-enter).

## Frozen — do not edit (guarded by ASD19)

`sdlc-status.mjs`/`.sh` (FS8 check ids/exits); `check-lifecycle.mjs`/`.sh` (FS9
check ids/exits/declaration grammar); `lib.mjs` config schema and
`sdlc.config.schema.json` (schemaVersion **3**); `resolve-panel.mjs` behaviour,
floors, refusal order; `validate-task.mjs`/`verify-task-receipt.mjs` (PV1/PV2);
the four `prompts/*.prompt.md` reviewer templates; panel sizing and
track/ceremony law. Deferred and untouched: #91, #101, #102.

## Task seams

Dependency graph (Spec §21): **B2 depends on B1**; **A2 and C1 depend on the
phase references from A1**; otherwise parallelisable. A1 is the critical-path
root.

---

## A1 — package docs + skill routing + disposition

- **Files:** new `skills/sdlc/references/system-reference.md`; new
  `skills/sdlc/references/phase-{brainstorm,plan,spec,tasks,implement,pr-review}.md`;
  `skills/sdlc/SKILL.md` (slim to kernel/router); new
  `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`; new
  `docs/adr/0028-*.md`; absorption notes appended to
  `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`,
  `docs/plans/2026-07-17-config-intent-vocabulary.md` (IC-B) and
  `docs/plans/2026-07-14-opt-in-lifecycle.md` (OL-C); new tests
  `test/system-reference.test.js`, `test/phase-references.test.js`,
  `test/skill-kernel.test.js`, `test/disposition-ledger.test.js`,
  `test/adr-absorption.test.js`, `test/source-free-comprehension.test.js`.
- **Work:** author the §5 system reference (11 checklist sections); author the
  six §6 phase references (nine required headings each, ≥1 explicit
  `under your configuration` callout routing to `CONFIG.md`/JSON, link-not-repeat
  discipline per §3); restructure `SKILL.md` to the seven §4 kernel
  responsibilities under the ≤ 220-line / ≤ 16384-byte ceiling with no
  duplicated phase-mechanics section (all paths skill-relative; keep
  `name: sdlc` + discovery-sufficient `description`); produce the
  statement-level disposition ledger (§7/§8: every pre-change normative rule +
  red flag → retained / moved-to-one-named-reference / intentionally-replaced,
  none dropped or owned twice); write ADR 0028 (authority hierarchy §3 +
  generated-explanation trust model); append the IC-B/OL-C/programme absorption
  notes and the #91/#101/#102-remain-independent assertion.
- **Ceiling escape:** if all seven kernel responsibilities cannot fit ≤ 220
  lines / ≤ 16 KiB, **halt A1 and return to Plan** with evidence (Spec §4/§21) —
  never ship over-cap.
- **Scenarios:** ASD2, ASD3, ASD4, ASD5, ASD16, ASD17.
- **Checks:** `node --test test/system-reference.test.js test/phase-references.test.js test/skill-kernel.test.js test/disposition-ledger.test.js test/adr-absorption.test.js test/source-free-comprehension.test.js`;
  `npx biome check skills/sdlc/SKILL.md skills/sdlc/references/ docs/adr/0028-*.md docs/validation/sdlc-agent-self-documentation/`.

## A2 — standalone entrypoints (depends on A1 phase references)

- **Files:** new
  `templates/sdlc-{brainstorm,plan,spec,tasks,implement,pr-review}.md`; new
  `test/standalone-entrypoints.test.js`.
- **Work:** six thin `templates/sdlc-<slug>.md` routers that (1) resolve the
  `sdlc` skill dir and run `sdlc-status`; (2) load the matching
  `references/phase-*.md`; (3) enforce the §9 per-entrypoint degradation table;
  (4) never duplicate phase mechanics. Wire adopted-config-dominates on the FS8
  `adoption.manifest-head` predicate (state ∈ {ready, not-ready}; `error`/exit 2
  **stops** and surfaces the diagnostic — never treated as adopted); pin the
  `sdlc:spec` stamp as the single `>`-prefixed plain-prose line with the
  disclosure phrases "no committed plan"/"Not adopted"/"checker-verified" (no
  YAML/JSON); wire the `sdlc:pr-review` grounding disclosure; `sdlc:tasks` and
  `sdlc:implement` always refuse-with-redirect on absent upstream in both
  adoption states, fabricating no scenario ids/check tables.
- **Scenarios:** ASD12, ASD13.
- **Checks:** `node --test test/standalone-entrypoints.test.js`;
  `npx biome check templates/sdlc-*.md`.

## B1 — `config-doc` module

- **Files:** new `skills/sdlc/scripts/config-doc.mjs` + `config-doc.sh`; new
  `test/config-doc.test.js`.
- **Work:** one deep module (Node builtins only, no new runtime deps) with a
  thin `.sh` wrapper exposing `render`/`write`/`check` (§11); one deterministic
  renderer backing all three so `write` output and the `check` expected render
  are byte-identical by construction. Implement the §13 sentinel grammar `v1`
  (`CURRENT_SENTINEL_VERSION`/`SUPPORTED_SENTINEL_VERSIONS`), pinned
  `canonicalJson` (ascending UTF-16 key order, arrays preserved,
  `JSON.stringify` no space) and `fingerprint =
  sha256hex(version + "\u0000" + canonicalJson(config))`; the §12 four `check`
  states (`current`/`missing`/`stale`/`error`) with exits 0/1/1/2, `reason`
  disambiguation (`collision` vs `invalid-config`), and the JSON envelope
  (`schemaVersion: 1`); the §13 five-row `write`/collision matrix
  (`created`/`retained`/`regenerated`/`refused` exit 3/`forced`); the §14
  `CONFIG.md` seven-part content order. `render` reuses the frozen `lib.mjs`
  `inspectConfig` validator and never mutates; `check` never writes in any
  state.
- **Scenarios:** ASD6, ASD7, ASD8, ASD9.
- **Checks:** `node --check skills/sdlc/scripts/config-doc.mjs`;
  `node --test test/config-doc.test.js`;
  `npx biome check skills/sdlc/scripts/config-doc.mjs`.

## B2 — setup integration + interview (depends on B1)

- **Files:** `templates/setup-sdlc.md` (agent-led rewrite);
  `skills/sdlc/scripts/setup-sdlc.mjs` (reduced TTY fallback + `config-doc write`
  call site, preserving telemetry call sites on rebase); new committed
  `.pi/sdlc/CONFIG.md` (this repo); `test/setup-sdlc.test.js`,
  `test/setup-v3.test.js` (assert ≤ 3 prompts + template concept coverage).
- **Work:** rewrite `templates/setup-sdlc.md` to explain-before-eliciting the
  §10 concepts (kernel vs scaffolding; tracks; `panel`/`advisory`/`human`/`off`;
  consequences of `separateSpec`/`publishToTracker`/`review.tasks`/`onShortfall`;
  the two owner decisions `review.design`/`review.code`); reduce the
  `setup-sdlc.mjs` interactive readline fallback to ≤ 3 prompts (two core
  decisions + confirmation) while keeping every dial reachable by existing flag;
  add the setup `config-doc write` call site so fresh adoption emits
  `.pi/sdlc/CONFIG.md`; generate + commit this repo's own `.pi/sdlc/CONFIG.md`.
- **Merge duty (§18):** whichever of this stream and
  `feat/sdlc-lifecycle-telemetry` (lt-t2) lands second re-seeds and verifies
  **both** the `config-doc` write call site and the telemetry
  `record-run-event` call sites in the merged `setup-sdlc.mjs`.
- **Scenarios:** ASD11, ASD20.
- **Checks:** `node --check skills/sdlc/scripts/setup-sdlc.mjs`;
  `node --test test/setup-sdlc.test.js test/setup-v3.test.js`;
  `node skills/sdlc/scripts/config-doc.mjs check --repo-root .` (this repo's
  committed companion is `current`);
  `npx biome check skills/sdlc/scripts/setup-sdlc.mjs templates/setup-sdlc.md .pi/sdlc/CONFIG.md`.

## C1 — startup + FS11 + installed-consumer e2e (depends on A1)

- **Files:** `skills/sdlc/SKILL.md` (startup `config-doc check` wiring block —
  coordinated with A1's slim so the ceiling still holds);
  `skills/sdlc/assets/normative-references.json` (classified rows + new public
  surfaces + `discovery` block);
  `skills/sdlc/assets/normative-references.schema.json` (`class` field +
  `discovery` block); `skills/sdlc/scripts/check-references.mjs` (FS11
  classification + structural discovery / inverse completeness); new
  `test/startup-freshness.test.js`, `test/installed-consumer.test.js`; extend
  `test/check-references.test.js`; the merge assertion in `test/setup-sdlc.test.js`
  (ASD20 landing-order conditional).
- **Work:** wire the §15 non-blocking startup `config-doc.sh check` step into
  `SKILL.md` (after `sdlc-status` ready + announcement/hook inventory, outside
  FS8/FS9): `current` → read `CONFIG.md`; `missing`/`stale` → fixed warning +
  read authoritative JSON + name `config-doc.sh write`; `error`+`reason:
  collision` → same fixed warning path; `error`+`reason: invalid-config` →
  dead branch, surface + stop; never trust prose over JSON. Extend FS11: add the
  required `class` field (six-value enum) to the schema + every inventory row;
  add rows for the new public surfaces (system reference, six phase refs, six
  entrypoints, `config-doc.mjs`/`.sh`, consumer `CONFIG.md`) **and** the four
  pre-existing-but-uninventoried public files (`check-lifecycle.sh`,
  `setup-sdlc.sh`, `sdlc.config.schema.json`, `sdlc.config.example.json`) so the
  baseline check is green; add the §16 `discovery` block (single-`*` glob roots
  via `readdirSync` + anchored `RegExp`, closed internal-helper exclusion list)
  and the inverse-completeness assertion in `check-references.mjs`; build the §17
  installed-consumer fixtures (node_modules-style package path + separate
  consumer cwd) proving skill-relative/consumer-relative resolution of all
  references, links, `sdlc:<slug>` invocations, and `.pi/sdlc/CONFIG.md`; add the
  ASD20 merge assertion.
- **Scenarios:** ASD1, ASD10, ASD14, ASD15, ASD18, ASD19.
- **Checks:** `node skills/sdlc/scripts/check-references.mjs`;
  `node --test test/startup-freshness.test.js test/installed-consumer.test.js test/check-references.test.js`;
  `node --test` (full corpus — ASD18);
  `node skills/sdlc/scripts/sdlc-status.mjs` (frozen FS8 ids/exits — ASD19);
  `npx biome check skills/sdlc/scripts/check-references.mjs skills/sdlc/assets/`.

## Cross-cutting close-out

- Full corpus: `node --test test/*.test.js` green; `node test/e2e/run.mjs` green
  (installed-consumer + existing e2e).
- `npx biome check .` clean repo-wide on the diff.
- FS11: `node skills/sdlc/scripts/check-references.mjs` green (classification +
  structural discovery).
- Readiness: `node skills/sdlc/scripts/sdlc-status.mjs` exit 0 on the branch;
  committed `.pi/sdlc/CONFIG.md` is `current`.
- Frozen-surface byte-identity vs baseline confirmed (ASD19).
- Per-task PV1 manifests under `docs/validation/sdlc-agent-self-documentation/`
  and validator receipts under `docs/reviews/task-validate-*`.
- One PR (track irreversible) closing the epic + all sub-issues; passes
  `check-lifecycle` and the floor-3 PR panel to its stop condition;
  `BREAKING CHANGE:` footer only if a genuinely breaking installed interface
  change is discovered.
