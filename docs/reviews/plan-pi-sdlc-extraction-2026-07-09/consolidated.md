# Plan panel — pi-sdlc extraction (wave 1)

- Phase: plan_review (irreversible track)
- Plan reviewed: `docs/plans/2026-07-09-pi-sdlc-extraction.md` @ v1 (`00abb93`)
- Orchestrating model: `anthropic/claude` (this session)
- Panel (author vendor anthropic excluded, all PONG-smoked): openai-codex/gpt-5.5,
  deepseek/deepseek-v4-pro, zai-coding-cn/glm-5.2 — 3/3 completed.

Reviewer output re-verified against the actual skill before adjudication. Two
factual claims were checked directly: the four phase prompts contain no loom
content bar two illustrative governing-doc lines (`adversary-plan:12`,
`adversary-spec:14`) — confirmed; `package.json` `"pi":{"skills":["./skills"]}` is
the discovery mechanism — confirmed against pi-md-to-pdf/pi-repo-html.

## Findings and adjudication (all incorporated into plan v2)

### HIGH — consumer-root resolution breaks after extraction (3/3 agreement) — INCORPORATED
`ensure-panel-agent.sh:73-80` (`git -C "$SKILL_DIR" rev-parse`) and
`resolve-panel.mjs:64` (script-relative `--models-file`) resolve into `pi-sdlc`
once the skill is global, so agents land in the wrong repo and the models file is
not found — D4 could pass on body while the feature is broken. v2 adds §Consumer-root
resolution (explicit `--config`/env/`$PWD`-walk to `.pi/sdlc/`), makes it a frozen
surface, and rewrites D4a to assert the consumer landing path + full-file identity.

### HIGH — "bucket 4" mis-scoped; the four prompts are already generic — INCORPORATED
v1 claimed the generalisation work was in the prompts. Verified false. v2's
Rationale relocates the work to SKILL body + tracker-ops.md + agent-brief.md, and
reduces the prompt work to a two-line governing-doc genericisation.

### HIGH — manifest schema is not the only frozen surface — INCORPORATED
v2 adds §Frozen surfaces enumerating: schema, `.pi/sdlc/` layout, both script CLIs,
the resolution contract, the derivation rules (agent name, label vocabulary), and
the prompt skeletons; D7 requires an ADR per class.

### HIGH — D6/V5 "same artefact shape" undefined + consolidated.md non-deterministic — INCORPORATED
v2 D6 defines "shape" as the exact review-dir file set + named required sections
of `consolidated.md`, and explicitly does NOT byte-compare its content.

### MEDIUM — D4 "byte-identical resolve-panel" is credential-env-dependent — INCORPORATED
v2 splits into D4a (deterministic full-file agent identity + landing path) and D4b
(model-set + `--emit-tasks` JSON equivalence under a stubbed cred env).

### MEDIUM — manifest location contradiction (`.pi/sdlc/` vs `.pi/skills/loom-sdlc/`) — INCORPORATED
v2 uses `.pi/sdlc/` as the single canonical location throughout; D5 deletes
`.pi/skills/loom-sdlc/`.

### MEDIUM — governing-doc + CI dependencies omitted from migration — INCORPORATED
v2 scope adds AGENTS.md, CONTRIBUTORS.md, PR template, and `.gitignore` pointer/
prefix updates (D5/V4), and explicitly declares loom's CI `sdlc-artifacts` job OUT
of scope (stays hard-coded), disclosing that no equivalence claim covers CI.

### MEDIUM — label/agent prefix propagation mechanism unspecified — INCORPORATED
v2 defines a `<PREFIX>`/`<LABEL_PREFIX>` token convention with every substitution
site pinned by the spec; derivation rules are a frozen surface.

### MEDIUM — no-manifest fallback defaults too vague — INCORPORATED
v2 enumerates every default (agent prefix, label prefix, doc paths, announce
string, tracker-absent behaviour) in Context-for-next-agent.

### MEDIUM — cross-repo sequencing contradicts R4 "same change" — INCORPORATED
v2 adds DEP2 and rewrites R4: publish + verify discoverable first, manifest +
pointer next, engine deletion last.

### MEDIUM — O4 "proven equivalent" overstated (only 1 of 4 phases end-to-end) — INCORPORATED
v2 O4 scopes pr_review end-to-end + the other three on deterministic outputs.

### LOW — LICENSE required but licensing out of scope — INCORPORATED
v2 makes the licence a pre-build dependency (DEP1) owned by Neil; `LICENSE` removed
from the DoD (D1 requires README + package.json only).

### LOW — package.json discovery metadata omitted — INCORPORATED
v2 target tree + D1 require `package.json` with `"pi":{"skills":["./skills"]}`.

### LOW — .gitignore agent glob + prompt-skeleton ADR — INCORPORATED
Folded into D5 (gitignore prefix update) and §Frozen surfaces / D7 (skeleton ADR).

## Stop condition

Wave 1 surfaced 4 high + 7 medium + 3 low, all valid, all incorporated into v2.
A confirming wave 2 follows; the human (Neil) is the final adjudicator on the plan.

---

# Plan panel — wave 2 (on plan v2, commit 8d60e69)

Same panel (openai-codex, deepseek, zai), 3/3. Findings all valid, all
incorporated into v3. Two factual checks confirmed: the phase-slug derivation
`<prefix>-<phase-slug>` with prefix=loom yields byte-identical current agent
names (deepseek/zai verified); `hasCreds()` is env/file-only so D4b needs no
live calls (deepseek verified).

- **HIGH — D4a byte-identity contradicts dropping the two governing-doc prompt
  lines while shipping no overrides — INCORPORATED.** v3: loom ships exactly two
  prompt overrides (adversary-plan, adversary-spec); review+validate stay generic.
  O3 and D4a reworded accordingly.
- **HIGH — sdlc.models.json shape is a missing frozen surface — INCORPORATED.**
  v3 §Frozen surfaces #2 + D3 + D7 now cover its schema
  (phases.<phase>.{prefer,min_panel}, rules.exclude_author_vendor, author_default).
- **MEDIUM — loom's manifest INSTANCE values unstated; O3 not fully gated —
  INCORPORATED.** v3 Context lists loom's exact values; D5/V4 assert loom config
  reproduces prefix/labelPrefix/announce.
- **MEDIUM — stamped `description` frontmatter (ensure-panel-agent.sh:93)
  hard-codes `loom-sdlc`, an unlisted substitution site — INCORPORATED.** v3
  derivation rules set description label = `<labelPrefix>` (=`loom-sdlc` for loom,
  byte-identical); added to Rationale + R1 substitution sites.
- **MEDIUM — DEP2 sequencing was prose not a falsifiable gate — INCORPORATED.**
  v3 D5 ordering gate: deletion commit must be a verified descendant of the
  `/skill:sdlc` discovery; V4 checks the commit graph.
- **MEDIUM — DEP1/LICENSE mis-classified (build proceeds without it) + target-tree
  contradiction — INCORPORATED.** v3 makes MIT LICENSE the default (precedent),
  a hard pre-build gate, and D1 requires it; Neil may override at approval.
- **LOW — consumer-root walk terminal case + no-manifest root — INCORPORATED.**
  v3 five-step resolution: flag/env → `.pi/sdlc` walk → git-top-level+defaults →
  non-zero diagnostic.
- **LOW — R6 manifest-paths vs CI divergence — INCORPORATED** as R6.
- **LOW — D2 grep misses concept names (sdlc-artifacts, adapter boundary) —
  INCORPORATED.** D2 grep widened; primary mechanism is the spec substitution list.

## Stop condition

Two waves run. Wave 2 surfaced precision/completeness fixes, not structural
defects (the plan's shape held). All incorporated into v3. The plan gate is human
approval (Neil is final adjudicator); a third confirming wave is available on
request but has diminishing returns.
