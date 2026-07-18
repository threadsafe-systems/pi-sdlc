# Build handover: pi-sdlc agent self-documentation

- Spec gate: **approved**, 2026-07-18 (Neil Chambers).
- Track: **irreversible**.
- Canonical Spec: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md`
  rev 2 (authoritative — this brief is navigation only).
- Approved Plan: `docs/plans/2026-07-18-sdlc-agent-self-documentation.md` rev 2.
- Spec panel: `docs/reviews/spec-review-sdlc-agent-self-documentation-2026-07-18/`.

## What Build produces

A task-breakdown doc at
`docs/plans/2026-07-18-sdlc-agent-self-documentation-build.md`: each task names
its check commands and the `ASD<n>` scenario ids it satisfies, pulled from Spec
§20 — never re-derived. Build has no gate of its own (derived from the vetted
Spec). `shape.publishToTracker` is **2**, so the breakdown must also publish as
an epic + native sub-issues + board 5 (tracker is a projection of the doc, not
the source of truth).

## Task seams (from Spec §21; Build owns final decomposition)

1. **A1 — package docs + skill routing + disposition.** `references/system-reference.md`
   - six `references/phase-*.md`; slim `SKILL.md` to the kernel/router; the
   statement-level disposition ledger
   (`docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`);
   ADR 0028 + IC-B/OL-C/programme absorption notes. Satisfies ASD2–ASD5,
   ASD16, ASD17.
2. **A2 — standalone entrypoints.** Six `templates/sdlc-<slug>.md` routers with
   the §9 table, pinned `sdlc:spec` stamp, `adoption.manifest-head`
   adopted-config-dominates (error→stop), pr-review grounding. Satisfies
   ASD12, ASD13.
3. **B1 — `config-doc` module.** `scripts/config-doc.mjs` + `.sh`:
   render/write/check, sentinel grammar `v1`, pinned `canonicalJson` +
   sha256 fingerprint, four `check` states, five-row write/collision matrix,
   `CONFIG.md` content order. Satisfies ASD6–ASD9.
4. **B2 — setup integration + interview.** Agent-led `templates/setup-sdlc.md`;
   `setup-sdlc.mjs` TTY fallback ≤3 prompts; setup's `config-doc write` call
   site; this repo's committed `.pi/sdlc/CONFIG.md`. Satisfies ASD11, ASD20.
5. **C1 — startup + FS11 + installed-consumer e2e.** Startup `config-doc check`
   wiring in `SKILL.md`; FS11 `class` field + structural discovery (single-`*`
   globs via `readdirSync`+`RegExp`); installed-consumer fixtures; telemetry
   merge assertion. Satisfies ASD1, ASD10, ASD14, ASD15, ASD18, ASD19.

Dependency: B2 depends on B1; A2 and C1 depend on the phase references from A1;
otherwise parallelisable.

## Load-bearing constraints Build must not re-decide

- **SKILL ceiling** ≤ 220 lines / ≤ 16 KiB with all seven kernel
  responsibilities. Current `SKILL.md` is ~551 lines / ~32 KiB — a >60%
  reduction. If it proves infeasible, **halt A1 and return to Plan** with
  evidence; never ship over-cap (Spec §4/§21).
- **Frozen (do not edit):** `sdlc-status` (FS8), `check-lifecycle` (FS9),
  `lib.mjs`/`sdlc.config.schema.json` config schemaVersion **3**,
  `resolve-panel`, PV1/PV2 validator, the four reviewer prompts. Guarded by
  ASD19.
- **FS11 discovery satisfiability:** the four pre-existing-but-uninventoried
  public files (`check-lifecycle.sh`, `setup-sdlc.sh`, `sdlc.config.schema.json`,
  `sdlc.config.example.json`) get classified inventory rows so the baseline
  reference check stays green (Spec §16).
- **Telemetry merge:** `feat/sdlc-lifecycle-telemetry` (lt-t2) also edits
  `setup-sdlc.mjs`. Whichever stream lands second re-seeds and verifies **both**
  the `config-doc` write call site and the telemetry `record-run-event` call
  sites (Spec §18, ASD20).
- **Deferred, independent — do not touch:** #91 (phase agent definitions), #101
  (phases as separate skills), #102 (YAML/comments/dual format).

## Implement-phase mechanics

- Config: `review.tasks: subagent` (each task ends with the deterministic
  validator + PV1 manifest + receipt), `review.code: panel` floor 3 at PR.
- The `implement:before` hook creates **and enters** a worktree — move the
  session's working root into it before writing (create-then-enter).
- This is **one PR** at the end (track irreversible), closing the epic + all
  sub-issues, `BREAKING CHANGE:` footer only if a genuinely breaking installed
  interface change is discovered (never the `!` shorthand).

## Grounding order for Build

1. The approved Spec (rev 2) and its consolidated spec review.
2. The approved Plan (rev 2).
3. Current `skills/sdlc/SKILL.md`, `assets/normative-references.json`,
   `scripts/check-references.mjs`, `scripts/lib.mjs`, `scripts/setup-sdlc.mjs`.
4. IC-B plan, OL-C plan + issue #38 (entrypoint contract).
