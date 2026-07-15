# Spec review — OL-A (opt-in lifecycle: config vocabulary and resolution)

- Spec: `docs/specs/2026-07-14-opt-in-lifecycle-config.md` @ 4d34840 (branch `feat/opt-in-lifecycle`)
- Plan: `docs/plans/2026-07-14-opt-in-lifecycle.md` rev 2
- Reviewer: glm-5.2 (adversarial spec panel)
- Method: every framework claim grounded in the worktree at the pinned commit; code cites are file:line.

Findings ranked most-severe first. Each is concrete enough to act on without follow-up.

---

### `full` preset silently weakens pr_review below the repo's own shipped default and dogfood value

- severity: medium
- confidence: high
- location: spec §3 (preset table, `full` column); contradicts plan scope item 3 / #37 ("`full` reproduces today's shape") and DoD-1 non-regression.
- defect: The `full` preset hardcodes `gates.pr_review.minPanel/minVendors = 2/2`, but the shipped default models file (`skills/sdlc/schema/sdlc.models.example.json`, the file `--with-models` writes for a fresh adoption) and the dogfood repo (`.pi/sdlc/sdlc.models.json`) both carry `phases.pr_review.min_panel: 3`. Applying `--profile full` to either repo adds a `lifecycle` block whose `pr_review` floor (2) overrides the models-file floor (3, ignored-with-notice per §4.2), silently dropping the effective pr_review floor from 3 to 2 — a weakening of the review gate closest to merge, exactly the dial the plan promises `full` leaves unchanged.
- evidence: `skills/sdlc/schema/sdlc.models.example.json` `pr_review.min_panel: 3`; `.pi/sdlc/sdlc.models.json` `pr_review.min_panel: 3`; spec §3 `full` row `gates.pr_review.minPanel/minVendors | … | … | 2 / 2`; plan scope item 3 "`full` = today, unchanged"; #37 resolution "`full` reproduces today's shape byte-for-byte". §1 surface table does NOT list `sdlc.models.example.json` as a changed file, so the example is left at 3 while the preset ships 2.
- impact: "full = today" is locally false against the repo's own shipped example and dogfood config; an adopter (including this repo dogfooding itself) who selects `full` to "stay at full strength" gets a weaker pr_review gate than they have today, with no notice. The non-regression guarantee (NF-1/DoD-1) only covers no-block repos, so this opt-in weakening is currently ungated and undisclosed.
- fix: Either (a) add `sdlc.models.example.json` to §1's changed-surface list and set its review-gate `min_panel` values to the `full` preset floors so a fresh adoption and `--profile full` agree, or (b) add a normative note in §3 that `full`'s floors are the schema defaults (2/2) and that repos currently configured above them (dogfood, the shipped example: 3) will see pr_review lowered on profile application and must use `custom` to preserve their floors. Pick one; the current spec encodes the weakening silently.

---

### §4.3 "byte-preserving" claim is self-contradictory with its own re-serialisation mechanism, and OLA16 does not gate the claim

- severity: medium
- confidence: high
- location: spec §4.3 (non-destructive application) and §6 OLA16.
- defect: §4.3 states the application is "byte-preserving every other key (including formatting produced by re-serialisation being limited to the lifecycle key's addition — the implementation re-serialises the parsed object with 2-space indent…)." Re-serialising the whole parsed object rewrites every byte (key order, indentation, spacing, trailing newline) for every key, not just `lifecycle`; it is byte-preserving only when the input file already happens to be 2-space-indented JSON in JSON.stringify key order (i.e. a file setup itself wrote). The claim "byte-preserving every other key" is therefore false for any valid consumer-authored manifest with different formatting, and OLA16 only asserts "every other top-level key deep-equals its prior value" — a value-equality check that passes even when the entire file's formatting has been rewritten.
- evidence: spec §4.3 quoted above; §6 OLA16 "every other top-level key deep-equals its prior value"; `setup-sdlc.mjs:385,389` write via `${JSON.stringify(cfg, null, 2)}\n` (whole-object re-serialisation, no surgical edit).
- impact: An honest over-claim plus a scenario that cannot falsify it. A consumer with a 4-space-indented or hand-ordered valid manifest will, on `--profile` application, have the whole file reformatted while OLA16 reports green. The spec promises byte-preservation it neither implements nor tests.
- fix: Align the claim with the mechanism and the scenario: state that application is value-preserving (non-`lifecycle` keys deep-equal their prior values) and that the file is re-serialised with 2-space indent (so a consumer-authored file with different formatting is reformatted), OR specify surgical AST/key-preserving JSON editing and add a byte-level (non-`lifecycle` content unchanged) assertion to OLA16. Do not keep a byte-preservation claim gated only by a deep-equal check.

---

### Profile application bypasses the FS10 `--force` gate but the spec never states the exemption, leaving it as a Tasks-author decision against a frozen surface

- severity: medium
- confidence: medium
- location: spec §4.3 (FS10 `upgraded` action) vs `setup-sdlc.mjs:382-392` and ADR 0018.
- defect: §4.3 says applying `--profile <p>` to an existing valid manifest "reports `upgraded`" and changes only the `lifecycle` key, without mentioning `--force`. But the shipped `writeBundle` gates every config write on `opts.force`: `configMutating && opts.force ⇒ upgraded` else `configMutating && !opts.force ⇒ refused` (`setup-sdlc.mjs:388-391`), and `configMutating` (`:382`) does not include a profile term, so a bare `--profile solo` today routes to `retained` (nothing written). ADR 0018 records that "`--force` applies only to configuration replacement." Whether profile application counts as "configuration replacement" (needs `--force`) or a distinct non-destructive path (exempt) is exactly the decision ADR 0018 froze the vocabulary around, and the spec leaves it unstated.
- evidence: `setup-sdlc.mjs:382` (`const configMutating = opts.prefix !== undefined || … || hooks`), `:388-391` (the `--force`/`upgraded`/`refused` branches), `:392` (`retained`); ADR 0018 "`--force` applies only to configuration replacement"; spec §4.3 OLA16 invokes `--profile solo` with no `--force` and asserts `upgraded`.
- impact: A Tasks author faithfully extending the current `configMutating`/`--force` ladder will either (a) require `--force` for profile application (breaking OLA16's no-`--force` assertion) or (b) carve a new exempt branch (a semantic change to the frozen FS10 refusal model) without spec guidance on how it composes with the existing `--force` path and the `configMutating` flags.
- fix: Add one normative line to §4.3: "`--profile` application to an existing valid manifest is a non-destructive write that is NOT gated by `--force` (it touches only the `lifecycle` key); it is distinct from the `configMutating` flag set and reports `upgraded`. `--force` continues to govern whole-config replacement via the mutating flags." Pin the `configMutating`/branch routing this implies.

---

### §4.2 "strictest configured value" for the no-`--track` path has no defined strictness ordering over the four GateMode values

- severity: medium
- confidence: high
- location: spec §4.2 (Gate-mode awareness) and §6 OLA13.
- defect: §4.2 specifies that when `resolve-panel <review-gate>` is called without the new `--track` flag and the gate's `mode` is a per-track object, the resolver uses "the strictest configured value" to decide whether to refuse. But the four `GateMode` values (`panel`/`advisory`/`human`/`off`) have no total strictness order defined anywhere in the spec. By the §2 decomposition table, `panel` and `human` are both `blocking: yes` while `advisory` and `off` are both `blocking: no`; "strictest" is therefore ambiguous (is `human` stricter than `panel`? both block; one runs a panel, the other refuses to). For a gate shaped `{irreversible: "panel", reversible: "human"}`, picking `panel` resolves a panel that the reversible track does not want; picking `human` refuses even though the irreversible track wants a panel.
- evidence: spec §2 decomposition table (panel/human both blocking; advisory/off both non-blocking; no ordering stated); §4.2 "without `--track`, the strictest configured value"; OLA13 only exercises the explicit `--track` cases, not the no-`--track` "strictest" resolution.
- impact: Two implementers can pick different "strictest" values and both pass OLA13; the no-`--track` path is normative in §4.2 but ungated and under-defined. A wrong pick either over-refuses (breaks irreversible panel dispatch) or under-refuses (resolves a panel for a track that should run none).
- fix: Either define the strictness order explicitly (e.g. "strictest = the value whose `reviewer`/`arbiter` pair is most refusing: `human`/`off` (reviewer=none) rank above `panel`/`advisory`; tie-break by arbiter"), or drop the no-`--track` heuristic and require `--track` whenever `mode` is a per-track object (refuse with a "pass --track" diagnostic otherwise), and add an OLA scenario that fixes the no-`--track` behaviour.

---

### `resolve-panel` must read `sdlc.config.json` to source `lifecycle` floors, but the spec does not constrain the read; using the validating reader breaks NF-1 for repos with an invalid non-lifecycle config

- severity: medium
- confidence: high
- location: spec §4.2 (floor sourcing) and NF-1/OLA9 (byte-identical when block absent) vs `resolve-panel.mjs:18,50` and `lib.mjs` `readConfig`→`validateConfig`.
- defect: Today `resolve-panel.mjs` reads ONLY `sdlc.models.json` (`:18` imports `readModels`, not `readConfig`; `:50` `readModels(root, …)`) and never touches `sdlc.config.json`. To implement §4.2 (floors from `lifecycle.gates.<phase>` when a `lifecycle` block is present) the script must newly read the config. The spec does not say how. The obvious choice, `readConfig` (`lib.mjs`), calls `validateConfig`, which exits 2 on ANY invalid config — including one whose defect is unrelated to `lifecycle` (bad `prefix`, bad `tracker`, etc.) and which has no `lifecycle` block. For such a repo, today `resolve-panel` succeeds (it ignores config); after OL-A it would exit 2, breaking NF-1's "byte-identical stdout/stderr/exit codes … for the existing test corpus" and OLA9's "with the block absent, output is byte-identical to shipped v1."
- evidence: `resolve-panel.mjs:18` (`import { fail, PHASES, readModels, resolveRoot }`) and `:50` (no config read); `lib.mjs` `readConfig` → `validateConfig(raw, p)` → `fail(...)` on first issue; spec NF-1 and OLA9 byte-identical claims.
- impact: A straightforward implementation reuses `readConfig` and silently regresses every repo whose config is invalid for non-lifecycle reasons but whose models file is fine — the exact byte-identical guarantee NF-1 rests on. The corpus today includes no such fixture, so the regression would ship green.
- fix: Specify in §4.2 that `resolve-panel` obtains the `lifecycle` block via the non-fatal `inspectConfig` (or a raw parse), and that an invalid config WITHOUT a `lifecycle` block must produce byte-identical v1 output (no new exit, no new stderr). Add an OLA scenario: invalid non-lifecycle config + valid models + no `lifecycle` block ⇒ v1 output byte-identical.

---

### The `custom` non-interactive path names `--lifecycle-*` flags and `--lifecycle-json` without defining the flag vocabulary or the payload contract

- severity: medium
- confidence: medium
- location: spec §3 (`custom` paragraph) and §6 OLA17.
- defect: §3 says `custom` non-interactively "requires explicit `--lifecycle-*` flags or a `--lifecycle-json` payload." Neither the set of `--lifecycle-*` flags (names, types, how a per-track object or nested gate is expressed on the CLI) nor the `--lifecycle-json` contract (is it the raw block via stdin / a file path / an inline string? must it include `profile`? does setup inject/override `profile: "custom"`?) is specified. OLA17 asserts "with a full `--lifecycle-json` payload it writes exactly that block (validated), with `profile: "custom`"," which implies setup overrides `profile`, but does not say what happens if the payload already carries `profile: "standard"` or omits required keys.
- evidence: spec §3 quoted; §4.3 (setup surface) lists only `--profile <solo|standard|full|custom>` as a new flag and never enumerates `--lifecycle-*` or `--lifecycle-json`; OLA17 references `--lifecycle-json` with no shape defined; `setup-sdlc.mjs:31` USAGE and `parseArgs` (`:96-155`) currently know no such flags.
- impact: A Tasks author must invent the flag names and the payload semantics (merge vs replace, profile handling, partial vs full block) — exactly a "decide rather than derive" gap. Two implementations diverge and both can satisfy OLA17's loose wording.
- fix: Either fully specify the `custom` non-interactive interface (the exact `--lifecycle-*` flag set with names/types, and `--lifecycle-json` as a stdin-or-file payload that is the complete `lifecycle` block, with `profile` injected as `custom` and the block validated through `inspectConfig`), or drop the `--lifecycle-*` flag path from OL-A and make `--lifecycle-json` (fully-specified) plus interactive `custom` the only custom entrypoints. State profile-override behaviour explicitly.

---

### OLA18's grep falsifier does not verify the §2 normative rule it is attached to ("every consumer of gate modes MUST resolve through decomposeGateMode")

- severity: low
- confidence: medium
- location: spec §2 ("Reviewer × arbiter modelling") and §6 OLA18.
- defect: §2 makes a normative rule: "The validator and every consumer of gate modes MUST resolve a `GateMode` value through a single total decomposition function." OLA18's falsifier is "grep for `"panel"` comparisons outside the decomposition module in the changed scripts." That grep only catches literal `"panel"` string comparisons; it does not detect a consumer that hard-codes `mode === "human" || mode === "off"` (the exact comparison §4.2's gate-mode refusal invites) without routing through `decomposeGateMode`, nor does it verify routing-through-the-function. The §4.2 refusal is described in terms of mode values ("human" or "off"), not in terms of the decomposition's `reviewer` component, so an implementer can satisfy §4.2 and pass OLA18 while violating the §2 "every consumer MUST use decomposeGateMode" rule.
- evidence: spec §2 "every consumer of gate modes MUST resolve … through a single total decomposition function"; §4.2 "effective mode … is `human` or `off` refuses"; OLA18 falsifier "grep for `"panel"` comparisons".
- impact: The structural-future-proofing guarantee (DoD-8) is only as strong as every consumer routing through one function; OLA18's proxy does not enforce that and can report green for a non-compliant implementation.
- fix: Strengthen OLA18 to assert that every gate-mode decision in the changed scripts is expressed via `decomposeGateMode(...)` output (e.g. grep that gate-mode branches reference the decomposition's `reviewer`/`arbiter`/`blocking` fields, not raw mode-string comparisons), or rewrite §4.2's refusal in terms of the decomposition (`reviewer === none ⇒ refuse`) so the spec and its falsifier agree.

---

### Notes on surfaces examined and found sound (not findings)

- Closed-vocabulary kernel protection (no `merge` gate key, no `scenarios`/`checks` off-switch, `defaultTrack ≠ none`, `brainstorm` restricted to `{human,off}`, `spec_review` per-track object restricted to `irreversible`) is internally consistent and each rule has a falsifiable scenario (OLA3–OLA7); the `additionalProperties: false`-equivalent is enforced by `inspectConfig`'s ordered collector, matching the `hooks` precedent in `lib.mjs`.
- Cross-field rules (minVendors ≤ minPanel; mergePlanSpec ⇒ no spec_review; spec_review.mode no `reversible` key) are each tied to a scenario (OLA5–OLA7) with a determinable pass/fail.
- OLA1 (dogfood no-block ⇒ zero issues, corpus unchanged) and OLA9 (block-absent ⇒ byte-identical resolve-panel output) correctly pin the NF-1 non-regression at the semantic boundary the plan's Binding migration decision fixes (block-absent ⇒ v1 demands; this sub-change ships no checker change, so the envelope caveat is correctly out of OL-A scope per §7).
- Scope discipline (§7): OL-A does not leak OL-B (no `check-lifecycle`/`shape`/evidence/ADR 0018 bump) or OL-C (no SKILL.md/asset/entrypoint prose). `tracker.publishThreshold`, `phases.mergePlanSpec`, `tracks.defaultTrack`, and `gates.brainstorm.mode` are validated-only in OL-A (their consumers ship in OL-B/OL-C); this is consistent with the decomposition, not a defect.
