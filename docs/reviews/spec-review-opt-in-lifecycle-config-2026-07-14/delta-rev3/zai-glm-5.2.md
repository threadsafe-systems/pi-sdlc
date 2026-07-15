# Delta review — OL-A spec rev 3 (vendor → model-identity amendment)

Delta under review: `git diff 01d8dcd..bd19bf8` on
`docs/specs/2026-07-14-opt-in-lifecycle-config.md` and
`docs/plans/2026-07-14-opt-in-lifecycle.md`. Rev-2 findings are out of scope;
this judges only the encoding of the ratified owner amendment (floor =
distinct models, vendor dropped from the vocabulary).

All paths cited are relative to the worktree
`/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-opt-in-lifecycle`.

---

### Identity suffix-stripping is under-specified and collides with a documented Bedrock trap

- severity: high
- confidence: high
- location: spec §2 identity rule (`docs/specs/2026-07-14-opt-in-lifecycle-config.md:95`); schema `prefer` description (`skills/sdlc/schema/sdlc.models.schema.json:46`); scenarios OLA10/OLA11 (`docs/specs/...:333-345`)
- defect: the identity rule says "identity is the `provider/model` string with any `:thinking` suffix stripped" but never defines the stripping algorithm. The frozen models schema explicitly documents that amazon-bedrock uses a trailing `:<version>` qualifier that is **not** a thinking level (e.g. `amazon-bedrock/anthropic.claude-opus-4-8-v1:0`), and lists the real thinking-level set as `{off, minimal, low, medium, high, xhigh, max}`. The spec's phrase "any `:thinking` suffix" is ambiguous between (a) strip the segment after the last colon unconditionally — wrongly dropping the Bedrock version and silently violating the spec's own "version is part of identity" guarantee; (b) strip only when the trailing segment is a recognised thinking level (correct); (c) strip a literal `:thinking` string. None of OLA10(a)–(d) or OLA11 exercises a colon-version-suffixed id — OLA10(d) uses embedded-version ids (`p/m-5.4`, no colon) that never exercise the collision.
- evidence: `skills/sdlc/schema/sdlc.models.schema.json:46` — *"some providers (e.g. amazon-bedrock) use a trailing ':<version>' in the model id itself (such as 'amazon-bedrock/anthropic.claude-opus-4-8-v1:0') which is not a thinking suffix at all — rejecting unrecognized colon-suffixes would wrongly break those."* The spec (`:95`) reintroduces colon-suffix stripping and never references this. The live consumer roster carries a Bedrock entry (`test/fixtures/consumer/.pi/sdlc/sdlc.models.json:10` `amazon-bedrock/global.anthropic.claude-opus-4-8`); the schema permits a `:0` variant a consumer may commit.
- impact: the identity function is a frozen irreversible shape. A naive "strip after last colon" implementation makes `amazon-bedrock/anthropic.claude-opus-4-8-v1:0` ≡ `…-v1:1` (two distinct Bedrock versions collapse to one identity), directly contradicting the version-strictness the amendment claims. No scenario catches it.
- fix: in §2, specify the algorithm verbatim: "strip the trailing colon-segment only when it is a member of the thinking-level set {off, minimal, low, medium, high, xhigh, max}; any other trailing colon-segment (e.g. Bedrock's `:0`) is retained verbatim in the identity." Add an OLA10 falsifier: a `prefer` entry `p/bedrock-m:0` plus `p/bedrock-m:1` at `minPanel: 2` resolves two distinct identities (fails if the impl strips both).

### `rules.exclude_author_vendor` behaviour is undefined on the lifecycle path

- severity: medium
- confidence: high
- location: spec §4.2 author-model exclusion (`docs/specs/2026-07-14-opt-in-lifecycle-config.md:210-218`); resolver (`skills/sdlc/scripts/resolve-panel.mjs:111`); schema (`skills/sdlc/schema/sdlc.models.schema.json:27-29`)
- defect: the lifecycle-path bullet says author-model exclusion is "active when minPanel >= 2; off at minPanel: 1" with no reference to `rules.exclude_author_vendor`. The v1-path bullet ties that toggle to the v1 path only. But the toggle remains in the frozen FS2 schema and the shipped example sets it `true`. A consumer who commits `rules.exclude_author_vendor: false` **and** a `lifecycle` block gets undefined behaviour: the existing resolver (`:111`) computes `cfg.rules?.exclude_author_vendor !== false && minPanel >= 2` on every path, so an implementer who leaves that line in place makes exclusion toggleable on the lifecycle path — contradicting the spec's unconditional "active at minPanel >= 2". No scenario gates the interaction.
- evidence: `skills/sdlc/scripts/resolve-panel.mjs:111` — `const excludeAuthor = cfg.rules?.exclude_author_vendor !== false && minPanel >= 2;`. Spec `:210-213` describes the lifecycle rule without the toggle; `:217-218` ties the toggle to the v1 path only. OLA11 (`:341-346`) tests minPanel on/off but never `rules.exclude_author_vendor: false` under a lifecycle block.
- impact: implementer must guess; the most natural code change (reuse the existing line) produces behaviour the spec doesn't describe; a consumer expectation (toggle disables exclusion) may be silently honoured or silently ignored depending on implementation, with no test to detect the divergence.
- fix: state explicitly that on the lifecycle path author-model exclusion is governed solely by `minPanel` and `rules.exclude_author_vendor` is read only on the v1 path (or, if it is meant to carry over, say so). Add an OLA11 falsifier: `rules.exclude_author_vendor: false` + lifecycle block + `minPanel: 2` + `--author p/m1` asserts the documented behaviour.

### OLA12 carries stale `minPanel`/`minVendors` "1/1" notation, contradicting §4.2

- severity: medium
- confidence: high
- location: scenario OLA12 (`docs/specs/2026-07-14-opt-in-lifecycle-config.md:348`) vs §4.2 task_validate (`:241`) and plan DoD-5 (`docs/plans/2026-07-14-opt-in-lifecycle.md:268`)
- defect: OLA12 says task_validate under `subagent`/`self` has "floors … fixed 1/1". Rev 3 dropped `minVendors` from the entire vocabulary; §4.2 (`:241`) and the plan (`:268`) both say "fixed floor 1 model". The "1/1" is the old minPanel/minVendors pair and implies a vendor floor that no longer exists. This scenario was not touched by the rev-3 diff hunk.
- evidence: `docs/specs/2026-07-14-opt-in-lifecycle-config.md:348` — *"floors are fixed 1/1"*; `:241` — *"fixed floor 1 model"*; `docs/plans/2026-07-14-opt-in-lifecycle.md:268` — *"fixed 1-model floor"*.
- impact: a normative verification scenario uses the dropped vocabulary; an implementer may add a vendor-floor check for task_validate that the spec elsewhere says does not exist.
- fix: change OLA12 "fixed 1/1" to "fixed floor of 1 distinct model".

### OLA10(b) does not fully falsify "most-preferred = first-in-list" vs "highest-effort wins"

- severity: medium
- confidence: medium
- location: scenario OLA10(b) (`docs/specs/2026-07-14-opt-in-lifecycle-config.md:336-338`); normative algorithm §4.2 (`:202-205`)
- defect: the spec's selection rule is "walk the `prefer` list in order, taking the **first** credentialed entry of each identity" (positional winner, carrying that entry's suffix). OLA10(b) lists `m1:high` before `m1:low` and asserts `m1` is kept "at `:high`". An alternative implementation ("dedupe by identity, keep the highest-effort variant") produces the identical `{m1:high, m2}` result and passes OLA10(b) — so the scenario cannot distinguish the spec's positional rule from an effort-ranked rule. The two diverge only when a lower-effort variant is listed first.
- evidence: `:336-338` — `prefer` = `[m1:high, m1:low, m2]` ⇒ `{m1 (at :high), m2}`. The §4.2 algorithm text (`:203-204`, "most-preferred entry wins … walk in order, first credentialed") is positional, but the falsifier only exercises the high-first ordering.
- impact: a subtle frozen-shape risk — an effort-ranked implementation ships, passes OLA10(b), and silently disagrees with the spec when a consumer lists `m1:low` before `m1:high` (keeps `:low` per spec, `:high` per the alt impl).
- fix: add an OLA10(b') with `prefer = [m1:low, m1:high, m2]` at `minPanel: 2` asserting the panel keeps `m1:low` (the first-listed entry), falsifying any highest-effort-wins implementation.

### Cross-provider same-model distinctness is implied but not exemplified; the existing `vendor()` classifier actively obscures it

- severity: low
- confidence: medium
- location: spec §2 identity rule (`:95`); resolver `vendor()` (`skills/sdlc/scripts/resolve-panel.mjs:84-93`)
- defect: identity = "`provider/model` string … strict equality" makes a Bedrock-hosted Claude (`amazon-bedrock/…claude…`) distinct from a direct-API Claude (`anthropic/…claude…`) because the provider prefix differs. This is derivable but never stated or exemplified, and the resolver's existing `vendor()` (`:84`) does the opposite — it maps any id containing "claude"/"anthropic" to vendor `anthropic` (verified live: `amazon-bedrock/global.anthropic.claude-opus-4-8` → "anthropic"). An implementer adapting `vendor()` into the identity key rather than rewriting it gets wrong dedupe.
- evidence: `skills/sdlc/scripts/resolve-panel.mjs:84-93`; live run confirms `vendor("amazon-bedrock/global.anthropic.claude-opus-4-8") === "anthropic"`. Spec `:95-98` gives only version and effort examples, no cross-provider one. The consumer roster carries the Bedrock Claude id (`test/fixtures/consumer/.pi/sdlc/sdlc.models.json:10`).
- impact: low — a literal implementer who treats identity as the raw provider/model string is correct; the risk is reuse of the `vendor()` heuristic. A one-line clarification removes the ambiguity.
- fix: add to §2: "two models that share a model id but differ in provider prefix are distinct identities (e.g. `amazon-bedrock/anthropic.claude-opus-4-8` ≠ `anthropic/claude-opus-4-8`)."

### Shipped example file `$comment` retains a stale "distinct-vendor floor" description

- severity: low
- confidence: high
- location: `skills/sdlc/schema/sdlc.models.example.json:2` (the `$comment`); spec §1 surface table (`docs/specs/2026-07-14-opt-in-lifecycle-config.md:33`) and §8 note (`:419-422`)
- defect: OL-A touches `sdlc.models.example.json` only to align `min_panel` values (`pr_review` 3 → 2). Its top-level `$comment` still reads "the resolver dedupes to one model per vendor, so min_panel is the distinct-vendor floor". On the lifecycle path this is now false. The §8 note acknowledges the staleness but is directed at implementers; the example file is the artifact consumers copy via `--with-models`, and a consumer who adopts a lifecycle block reads a `$comment` that contradicts the runtime notice.
- evidence: `skills/sdlc/schema/sdlc.models.example.json:2` — *"the resolver dedupes to one model per vendor, so min_panel is the distinct-vendor floor"*. Spec §1 (`:33`) lists only the `min_panel` alignment as the file's change; §8 (`:419-421`) warns implementers but does not update the shipped text.
- impact: a shipped, consumer-copied artifact misdescribes the very floor the lifecycle block changes; low because the runtime supersede notice protects actual behaviour.
- fix: extend the example file's change in §1 to also append to its `$comment`: "(on a `lifecycle`-adopted repo, `min_panel` governs only the v1 path; the lifecycle block supplies a distinct-model floor — see the lifecycle-config asset)".

### Plan Risks section retains stale "1/1" vendor notation

- severity: low
- confidence: high
- location: plan Risks (`docs/plans/2026-07-14-opt-in-lifecycle.md:297`)
- defect: the rev-3 diff did not touch the Risks section; it still says "advisory PR review at 1/1 requires at least one model with credentials". The "1/1" is the dropped `minPanel`/`minVendors` pair; rev 3 has a single floor.
- evidence: `docs/plans/2026-07-14-opt-in-lifecycle.md:297`; compare spec §3 preset table (`:136-149`) which uses bare `minPanel` integers.
- impact: low — it is a risk note, not a normative rule, but it is the one surviving vendor-floor notation in the plan and is internally inconsistent with the plan's own rev-3 DoD-5 (`:268`).
- fix: change "at 1/1" to "(minPanel 1)".

---

CLEAR surfaces:

- CLEAR: A (frozen shapes vs locked decisions) — the `lifecycle` schema (`§2`), profile table (`§3`), and `minPanel`-only dials are internally consistent with the ratified amendment (no `minVendors` key, vendor absent from the vocabulary). The frozen-shape risk is concentrated in the identity algorithm (Finding 1) and the author-exclusion toggle (Finding 2), not in the dial set.
- CLEAR: D (internal contradictions between §2 identity, §4.2 selection, and §3 presets) — §2's identity rule, §4.2's streaming selection ("walk prefer in order, first credentialed per identity"), and the §3 preset floors are mutually consistent; the version-strict / effort-same examples agree. (OLA12's "1/1" is a notation defect, Finding 3, not a rule contradiction.)
- CLEAR: F (non-functional requirements) — NF-1 byte-identity is correctly scoped to the no-`lifecycle`-block path (config missing/unparseable/no-key for the resolver; no `--profile`/`--lifecycle-json` for setup). OLA1/OLA9/OLA16/OLA20/OLA21 gate the byte-identity domain; the lifecycle-present path is the intentional changed path. NF-2 (closed vocabulary) and NF-3 (determinism) are preserved by the rev-3 table.
- CLEAR: G (honesty sweep) — the supersede-notice rewording (`(minPanel=<p>)` dropping minVendors) and the v1-path byte-identity claims are accurate and scoped; the only honesty shortfall is the stale example `$comment` (Finding 6), which is a stale-doc defect rather than an overclaim.
