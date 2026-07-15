# Consolidated spec review — OL-A config vocabulary and resolution (2026-07-14)

- Artifact: `docs/specs/2026-07-14-opt-in-lifecycle-config.md` @ 4d34840 (rev 1)
- Panel: openai-codex/gpt-5.6-terra:high, zai/glm-5.2:high, deepseek/deepseek-v4-pro:high (3 vendors; author vendor anthropic excluded)
- Orchestrating model: anthropic/claude (session orchestrator; also spec author — excluded from the panel)
- Verification before adjudication: FS10 v1 `upgraded` reservation confirmed (`docs/specs/2026-07-13-sdlc-adoption-bundle.md:424`, `setup-sdlc.mjs:382-391`); models example `pr_review.min_panel: 3` confirmed; `resolve-panel.mjs` reads only the models file confirmed.

## Consolidated findings and adjudication

| # | Finding (deduped) | Raised by | Sev | Adjudication |
|---|---|---|---|---|
| 1 | Profile application to an existing manifest changes the frozen FS10 `upgraded` semantics (v1 reserves it for whole-config `--force` replacement); the `--force` exemption question was left as a Tasks-author decision | terra (high) + glm (med) | high | **Incorporated — application DEFERRED to OL-B**, riding the single FS10 v2 schema-version bump together with the nudge line (one bump, both changes, ADR 0018's sanctioned path). OL-A ships fresh-adoption profiles only; `--profile` against an existing config is refused with an OL-B pointer. Plan's OL-B decomposition line widens accordingly (flagged for owner at the gate). |
| 2 | `minVendors` is not actually a floor under the prescribed per-vendor cap (5/3 counterexample: A,A,A,B,B satisfies the cap with 2 vendors) | terra | high | **Incorporated** — normative acceptance condition (size AND distinct-vendors floors), deterministic vendor-first selection, OLA10(b) 5/3 A/A/A/B/B/C scenario. |
| 3 | "Strictest configured value" for per-track modes undefined (no total order over GateMode); `--track` values unenumerated; no no-`--track` scenario | deepseek (high) + glm (med) + terra (med) | high | **Incorporated — heuristic dropped**: per-track mode without `--track` refuses with a pass-`--track` diagnostic (deepseek's option b); `--track` enumerated (`irreversible`/`reversible`, others usage-fail); OLA13 rewritten with (a)–(e) including the no-flag and bad-value cases. |
| 4 | "Byte-preserving every other key (including formatting)" impossible under whole-object 2-space re-serialisation; OLA16's deep-equal cannot gate it | terra (high) + glm (med) | high | **Incorporated via #1's deferral** — the claim leaves OL-A; §7 records that OL-B must carry value-preservation (deep-equal) semantics, explicitly NOT byte-preservation. |
| 5 | `--lifecycle-*` flags / `--lifecycle-json` payload contract undefined (names, input form, profile-key conflict, exits) | terra + glm | med | **Incorporated** — `--lifecycle-*` family dropped; `--lifecycle-json <path|->` fully pinned (complete block, no `profile` key allowed, injected `profile: "custom"`, inspectConfig-validated, usage/refusal exits); OLA17 rewritten (a)–(d). |
| 6 | NF-1 "byte-identical setup" contradicts fresh adoption writing a block; no complete gate for the claimed domain | terra | med | **Incorporated** — NF-1 given a precise three-part domain (inspectConfig without block; resolve-panel without block regardless of config validity; setup non-interactive without `--profile`); OLA16 rewritten as its falsifier; interactive interview and `--profile` runs named as intentional changed paths. |
| 7 | `full` preset (pr_review 2/2) silently weakens the shipped example + dogfood (`min_panel: 3`) | glm | med | **Incorporated** — `sdlc.models.example.json` review-gate floors aligned to preset floors in OL-A (added to §1 surface); supersede notice now names both values; the dogfood/adopted-repo divergence lands with application in OL-B (noted normatively in §3). |
| 8 | `resolve-panel` config read undefined; the obvious `readConfig` is fatal on any invalid config, breaking NF-1 for invalid-non-lifecycle configs | glm (med) + deepseek (low, surface-table note) | med | **Incorporated** — raw, non-fatal read pinned (missing/unparseable/no-key ⇒ byte-identical v1 path; lifecycle key present ⇒ inspectConfig-validate, invalid ⇒ exit 1 naming first issue); §1 surface row updated; new OLA20/OLA21 scenarios. |
| 9 | OLA18's grep falsifier doesn't verify the "every consumer routes through decomposeGateMode" rule (e.g. `mode === "human"` branches escape it) | glm | low | **Incorporated** — §4.2 refusal rewritten in decomposition terms (`reviewer === "none"` ⇒ refuse); OLA18 falsifier strengthened to ban all four raw mode-string comparisons outside the decomposition/validation-enum sites. |
| 10 | Empty per-track object rule under-tested (buried in OLA7; `spec_review.mode: {}` unmentioned) | deepseek | low | **Incorporated** — cross-field rule 5 added; OLA7 extended to every gate accepting the object form. |

**Dismissed: none.** All findings verified genuine; rev 2 (this commit) incorporates all ten clusters.

## Plan touch-point (for the human gate)

Cluster 1's deferral moves "non-destructive profile application to existing adopters" from OL-A to OL-B, and widens OL-B's FS10 bump from "the setup nudge line" to "the FS10 v2 bump (profile-application reporting + nudge line)". The stream plan's scope item 3 and OL-B decomposition line should be read with this amendment; the stream still delivers everything the plan promises — resequenced, not descoped.

## Stop condition

No high or medium finding survives adjudication (all incorporated in rev 2). Re-run the panel only if the owner rejects the OL-B deferral (cluster 1), which would reopen the FS10 question.

## CLEAR attestations of note

- deepseek: all seven surfaces attested (contracts buildable against current code; scenarios falsifiable; presets exactly match #37; `profile` correctly provenance-only; honesty sweep passed).
- glm: closed-vocabulary kernel protection and OL-A/OL-B/OL-C scope discipline explicitly examined and found sound.

## Gate record

- Rev 2 (panel findings incorporated) committed as 01d8dcd.
- Rev 3 (owner-directed diversity amendment: distinct-model floor, vendor dropped) committed as bd19bf8.
- The owner initially approved rev 3 directly, then reversed within the same session: a delta re-panel is cheap and best practice by the project's own standard. The direct approval is superseded; the delta panel's consolidation follows below.

## Delta panel — rev 3 (vendor → model identity), 2026-07-14

- Delta: `git diff 01d8dcd..bd19bf8`; same three reviewers, remit scoped to the delta only (per-model files under `delta-rev3/`).
- Orchestrating model: anthropic/claude (spec author; excluded from the panel).

| # | Finding (deduped) | Raised by | Sev | Adjudication |
|---|---|---|---|---|
| D1 | Identity strip recogniser undefined — "any `:thinking` suffix" collides with Bedrock colon-version ids (`…-v1:0` vs `:1` would merge under strip-after-last-colon), violating the amendment's own version-strictness; provider-in-identity implied, never stated or gated | terra + glm (high) + deepseek (med) | high | **Incorporated** — exact recogniser pinned (strip only members of `{off,minimal,low,medium,high,xhigh,max}`); provider-prefix-is-identity stated with example; `vendor()`-reuse ban added; OLA10 gains (e) Bedrock colon-version distinctness and (f) provider distinctness falsifiers. |
| D2 | `rules.exclude_author_vendor` interaction undefined on the lifecycle path — natural code reuse makes exclusion toggleable, contradicting active-at-2 | terra + glm | med | **Incorporated** — lifecycle path governed solely by `minPanel`; legacy toggle read only on the v1 path; OLA11 gains the toggle-false-still-excludes fixture. |
| D3 | OLA12 retains vendor-era "floors … fixed 1/1" notation | all three | med | **Incorporated** — "fixed at 1 distinct model; no vendor count or diagnostic computed on the lifecycle path". |
| D4 | OLA10(b) cannot distinguish positional from highest-effort-wins dedupe | glm | med | **Incorporated** — dedupe sentence reworded ("first credentialed entry in prefer order wins"); OLA10(b′) low-effort-first falsifier added. |
| D5 | Example file `$comment` still describes `min_panel` as a distinct-vendor floor | glm | low | **Incorporated** — §1 surface row extends the `$comment` with the lifecycle-path caveat. |
| D6 | Plan "full = today, unchanged" parenthetical overclaims vs dogfood `pr_review: 3`; plan Risks retained "1/1" | deepseek + glm | low | **Incorporated** — plan reworded ("the maximal preset"; dogfood's 3 is its preference at application time); Risks notation fixed. |
| D7 | Dedupe "most-preferred wins" vs selection "first credentialed" tension | deepseek | low | **Incorporated** — folded into D4's rewording. |

**Dismissed: none.** Rev 4 (this commit) incorporates all seven clusters. The owner's reversal to run this delta panel is vindicated by D1 — a HIGH in the identity function, the one frozen shape the amendment exists to define.

## Stop condition (delta)

No high or medium finding survives adjudication. Rev 4 awaits the human gate.
