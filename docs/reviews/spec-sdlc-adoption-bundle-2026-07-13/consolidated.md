# Consolidated spec panel — sdlc-adoption-bundle, 2026-07-13

- Artifact: `docs/specs/2026-07-13-sdlc-adoption-bundle.md` (working tree @ 65d2a55)
- Panel: openai-codex/gpt-5.6-luna:high, zai/glm-5.2:high,
  deepseek/deepseek-v4-pro:high (resolved by `resolve-panel.sh spec_review
  --author anthropic`; author vendor anthropic excluded)
- Orchestrating model: anthropic/claude (session author; consolidation and
  adjudication drafted by the author, human-adjudicated at the spec gate)
- Note: the deepseek task was mis-flagged "failed" by the subagent
  acceptance checker (review tasks make no edits); its full review was
  returned and is recorded alongside.
- Round: 1

## Deduped findings and adjudication (all INCORPORATED into spec rev 2)

### SP1 — Setup bundle mode and CLI unspecified (HIGH; luna + glm)

Bundle-run trigger, new flags, `--format` pre-scan, interview/declined
semantics were never frozen; AB8 invoked flags with no defined behaviour;
`setup-sdlc.mjs:69-90` rejects unknown flags today. **Incorporated:** §3.1
now pins the complete CLI, the bundle-run trigger (any flags-mode run or
completed interview; no legacy mode; ADR-0018-recorded), JSON-mode
non-interactivity, and declined-interview behaviour.

### SP2 — PR-template structural acceptance weaker than the plan's adjudicated F12 boundary (HIGH; all three)

"A line beginning `track:`" would retain templates the checker rejects
(e.g. `track: banana`, missing companions). **Incorporated:** §3.2 now
requires `^track: (irreversible|reversible|none)$` plus the conditional
`slug:`/`reason:` companion key; companion values may be placeholders.

### SP3 — FS9 prerequisite matrix and parse/value boundary unfrozen (HIGH luna; MED glm + deepseek)

No PREREQ graph (FS8 precedent `sdlc-status.mjs`), and the
`declaration.parse` vs `.track`/`.slug`/`.reason` validation split was
undefined, so conforming implementations could emit different check
arrays. **Incorporated:** §2.3 now pins structure-only parse, value checks
owning value defects in all modes, a full multi-prerequisite matrix,
stable prerequisite-skip and applicability-skip messages.

### SP4 — Config-mutating-without-`--force` exit contradiction (HIGH; glm)

§3.1's "hard-fail remains" (exit 2 today, pinned by
`test/setup-sdlc.test.js`) contradicted AB9's `refused` + exit 1.
**Incorporated:** §3.1 resolves to `refused`/exit 1 with provisioning
continuing; the exit-2 hard-fail is retired as an ADR-0018-recorded
compatibility change; the no-overwrite guarantee is unchanged.

### SP5 — CI-absence probe matched its own target file, making `retained` unreachable and contradicting AB8 (MED; glm + deepseek)

**Incorporated:** §3.3 excludes `sdlc-lifecycle.yml` itself from the
probe; re-runs evaluate the target via §3.2.

### SP6 — Missing artifact directory unclassified (MED luna; LOW deepseek)

`ls-tree` on a missing tree path could read as exit 2. **Incorporated:**
§1.4 — zero matches = `artifact.*:fail`; never an operational error.

### SP7 — Exemption reason absent from the envelope (MED luna) + `track: null` semantics (LOW deepseek)

**Incorporated:** §2.4 adds `reason: string|null`, pins null semantics for
`track`/`slug`/`reason`, and adds `reason:` to the text headers.

### SP8 — Referenced-asset verification had no report identity (MED; luna)

**Incorporated:** §3.4 adds the `references` section (`reference.*` ids,
`ok`/`broken`, exit-2 preflight); AB12 aligned.

### SP9 — Event-payload null/missing semantics (MED; luna)

**Incorporated:** §2.1 pins: invalid JSON / no `.pull_request` = error;
null/absent body = valid empty body; missing/non-string login = not
exempt-eligible, never an error.

### SP10 — Windows `..\` path escape via FS1's `/`-split validation (MED; luna)

**Incorporated:** §1.4 + §6.1 — checker enforces normalised containment at
point of use on every platform; FS1 unchanged.

### SP11 — AB14 could not prove byte-identical FS8 behaviour (MED; luna)

**Incorporated:** AB14 narrowed to mechanically checkable claims: FS8 test
files unmodified in the diff and passing; `sdlc-status.mjs` FS8 paths
unmodified.

### SP12 — RUN_HOOK_WARNING vs JSON "nothing on stderr"; `fail()` paths had no JSON envelope (MED; glm)

**Incorporated:** §3.4 — JSON mode emits one envelope for every
post-pre-scan result including exit 2 (`error` field), warning folded into
the `config` asset message; text mode unchanged.

### SP13 — ci-workflow recognition criteria vague (MED; glm)

**Incorporated:** §3.2 pins the three line-match criteria (repository,
ref, node invocation).

### SP14 — FS10 text format lacked header lines (MED; glm)

**Incorporated:** §3.4 pins `root:`, `exit-code:`, then `reference:` and
`asset:` line order.

### SP15 — AB7 "identical check arrays" unachievable with a `mode` field (MED; glm)

**Incorporated:** AB7 now requires identical state/exitCode/check
id+status sequences; messages and `mode` may differ.

### SP16 — Monorepo subdirectory consumers would get a non-functional workflow (LOW; glm)

**Incorporated:** §3.3 — non-empty prefix ⇒ `ci-workflow` refused with the
repo-root remediation.

### SP17 — Frozen-surfaces header claim inaccurate (LOW; glm)

**Incorporated:** header now discloses setup's additive flags + the
ADR-0018 compatibility change.

### SP18 — Prompt contract required invention (LOW; luna)

**Incorporated:** §5.2 pins `<TRACK>`/`<GOVERNING_DOCS>` placeholders and
the exact reversible-grounding sentence; mutation tests bind to both.

## Cross-model CLEARs

Framework composition sound (glm E, deepseek E: prefix/`ls-tree`
precedent, event-payload shape, FS3/FS1 seams, ADR 0014 exits); honesty
boundary correctly narrowed (luna G, deepseek G); no locked-decision
contradictions (deepseek D); scenarios falsifiable (deepseek B); NFRs tied
to scenarios (glm F, deepseek F).

## Round 2 (delta review of rev 2)

Dispatched to the same panel. openai-codex/gpt-5.6-luna failed to launch
("Model not found gpt-5.6-luna" — roster/provider drift; round 1 had
worked); zai/glm-5.2 and deepseek/deepseek-v4-pro completed — two vendors,
meeting the panel floor. Both verified SP1–SP18 incorporation (glm: 15/18
fully clean, 3 with residues below; deepseek: all 18 present, 2 residues).
Deduped round-2 findings, all incorporated into **rev 3**:

- **R2-1 (HIGH deepseek / MED glm)** — bundle-run trigger "any config flag
  or `--yes`" excluded asset flags (`--with-models` does not set
  `sawConfigFlag` in `setup-sdlc.mjs`), leaving `--copy-prompts`-style
  invocations and `--format json` + asset-flag states undefined.
  → §3.1 now pins a full flag taxonomy (root/config/asset/output flags);
  interview only for root-flags-only argv; any other flag or `--yes`
  selects flags mode; every flags-mode run is a bundle run; `--format`
  itself selects flags mode, making JSON non-interactive by construction.
- **R2-2 (MED glm / LOW deepseek)** — ci-workflow recognition grafted a
  YAML-structural constraint ("within the same checkout step's `with:`
  block") onto line matching, unimplementable without a YAML parser (no
  new dependencies allowed). → §3.2 simplified to a pure three-line match
  with the false-positive trade-off documented (recognition is
  provisioning assistance, not a security boundary).
- **R2-3 (MED glm)** — `slug`/`reason` null semantics undefined when their
  own check fails. → §2.4 uniform rule: each field null until its own
  check passes; raw invalid input never echoed.
- **R2-4 (MED deepseek)** — exempt-fallback handoff to `declaration.track`
  unspecified. → §2.3: parse synthesises track `none` + generated reason;
  downstream checks evaluate the synthetic values through normal rules.
- **R2-5 (MED deepseek)** — "`declaration.slug` passes vacuously" for
  `none` overlooked the forbidden-slug failure case. → §2.3 qualified:
  vacuous pass only when no slug present; a supplied slug on `none` fails.

Round-2 CLEARs (both models): §3.3 probe exclusion coherent with AB8;
§3.4 references + JSON error channelling follow FS8 conventions; §1.4
containment/zero-match pinned; no scope creep; no FS8/locked-decision
violation; ADR-0018 exit change disclosed and plan-supported.

## Stop-condition status

Round 1: 4 highs (deduped), 11 mediums, 4 lows — all incorporated into rev
2; nothing dismissed. Round 2 (one vendor lost to model-roster drift, two
completed): 1 high, 3 mediums, 1 low — all incorporated into rev 3;
nothing dismissed. **Surviving high/medium findings after adjudication:
0.** The round-2 luna dropout is disclosed to the human owner at the spec
gate.
