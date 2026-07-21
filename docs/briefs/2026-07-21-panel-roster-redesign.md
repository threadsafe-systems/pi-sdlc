# Brief: panel roster redesign, grounded in benchmark data

Status: applied. This is a **config-only** change (this repo's own dogfood
`.pi/sdlc/sdlc.config.json`) plus documentation of the reasoning behind it —
no schema, script, or template changes. Companion to
`docs/briefs/2026-07-21-retro-informed-orchestration-and-ceremony-candidates.md`
(C1–C4), which this feeds one addition into (see "New item" below).

## The ask

Neil: match panel rosters to what each phase actually demands. Plan/Spec are
feature-definition and architecture judgment, not coding — should they get
the most capable models available? Build's task breakdown needs
"seasoned engineering manager" sensibility: right-sizing, seams, sequencing,
parallelisation, not raw coding benchmark supremacy. PR review should be
"the highly technical models, high or even xhigh reasoning." Ground the
choices in data; call out anything worth adding (Qwen?); note known
trouble spots (kimi-k3's wallclock; gpt-5.6-terra as task validator).

## A bug found and fixed along the way

`.pi/sdlc/sdlc.config.json` had a stray `,j` in `plan_review.panelSize` —
invalid JSON, presumably a keystroke that leaked in around the `code .`
launch. Fixed as part of this edit; confirmed the file now parses and
validates against `skills/sdlc/schema/sdlc.config.schema.json` via ajv.
**Clarification (independent review, 2026-07-21):** this was a transient
working-tree corruption only — the last *committed* revision (`4d58213`,
issue #113) was already valid JSON. It never shipped broken; it just
wasn't fixed yet when this session started editing the same file.

## Benchmark grounding

Real, dated, cited external data (not vibes), retrieved 2026-07-21. Two
independent aggregators, three benchmark axes:

**SWE-bench Verified** (vals.ai/Morph, single-tool bash-only agent harness,
500 real GitHub issues) — the closest available proxy for "will this model
resolve/find real code defects":

| Rank | Model | Score |
|---|---|---|
| 1 | GPT-5.6 Sol | 96.20% |
| 2 | Claude Fable 5 | 95.00% |
| 3 | Kimi K3 | 93.40% |
| 4 | GPT-5.6 Luna | 93.00% |
| 5 | Claude Opus 4.8 | 88.60% |
| — | GLM 5.2 | (best open-weights, below Opus 4.8) |
| — | DeepSeek V4 | below GLM 5.2 |
| — | GPT-5.6 Terra | well below DeepSeek V3.2 / near Haiku tier |

Source: <https://www.vals.ai/benchmarks/swebench>.

**Humanity's Last Exam / GPQA Diamond / FrontierMath** (LM Council, curating
Epoch AI + Scale AI independent runs) — the better proxy for "will this
model correctly judge a feature definition, an architecture, or a hard
design tradeoff," which is a different axis from raw coding-agent execution:

| Benchmark | #1 | #2 | Notes |
|---|---|---|---|
| Humanity's Last Exam | Gemini 3.1 Pro Preview (high) 46.4% | GPT-5.4 Pro 44.3% | Fable/Sol/Opus-4-8 don't appear in the top 5 here at all |
| GPQA Diamond (PhD science) | GPT-5.4 Pro (xhigh) 94.6% | Gemini 3.1 Pro Preview 94.1% | same pattern |
| FrontierMath Tiers 1-3 | GPT-5.5 Pro (xhigh) 87.7% | **Claude Fable 5 (max) 87.0%** | Opus 4.8: 80.0% (#4) |
| FrontierMath Tier 4 (hardest) | **Claude Fable 5 (max) 87.8%** | GPT-5.5 Pro (xhigh) 78.0% | Opus 4.8: 56.1% (#5) |
| Terminal-Bench 2.0 (agentic, repo/CLI tasks) | Claude Opus 4.7 90.2% | — | Gemini 3.1 Pro Preview 4th at 80.2% |

Source: <https://lmcouncil.ai/benchmarks>.

**The finding that actually drives this redesign:** the raw SWE-bench
leaders (Sol, Fable, K3, Luna) are *not* the same models that lead
pure-reasoning/judgment benchmarks (Gemini 3.1 Pro Preview, GPT-5.4 Pro).
Planning and speccing genuinely are a different axis from coding, exactly
as Neil said — with one standout exception: **Claude Fable 5 is top-tier on
both** (#2 SWE-bench at 95%, #1 on FrontierMath Tier 4 at 87.8%, vs Opus
4.8's 56.1%), making it the best available single all-rounder wherever the
config can't yet split "who authors" from "who reviews" by phase (see
`authorDefault`, below).

## What changed, and why

### `authorDefault`: `anthropic/claude-opus-4-8:high` → `anthropic/claude-fable-5:high`

Fable 5 beats Opus 4.8 on the two axes actually measured here (95.0% vs
88.6% SWE-bench; 87.8% vs 56.1% FrontierMath Tier 4). **Correction
(independent review, 2026-07-21):** "strictly better single choice" as
originally written overclaimed — only two benchmark axes were compared;
latency, cost, availability, and general tool-use behaviour weren't, so
this is a reasonable choice on the evidence gathered, not a proven overall
superiority. It's a stopgap either way, pending per-phase author
preferences (candidate **C1** in the orchestration brief). **Further
correction:** the original text also claimed Build/Implement authoring
would now "pay Fable 5's cost/latency on every phase." Checked directly
against the skill's own code (`grep -rn authorDefault skills/`):
`authorDefault` is consumed in exactly one place, `resolve-panel.mjs`'s
`author || panels.authorDefault` fallback — purely as the identity a
review panel excludes. Nothing in the skill's machinery uses it to select
which model actually authors Brainstorm/Plan/Spec/Build/Implement content;
that's simply whichever model the live orchestrating session happens to
be running as. So this config change does **not**, by itself, make Fable 5
author anything — its only realized effect is the panel-exclusion identity
shift below (a real, verified benefit) and, implicitly, whatever a human
reads into "authorDefault" as documentation of intent for future explicit
`--author` use. The C1 authoring-cost tradeoff this paragraph originally
warned about doesn't yet exist as a mechanism to be paying a cost through.

**Verified side effect** (checked directly against `resolve-panel.mjs`'s
`modelIdentity()`, which excludes by exact resolved model identity, not by
vendor): the existing `amazon-bedrock/global.anthropic.claude-opus-4-8`
`pr_review` fallback was dead weight while `authorDefault` was
`claude-opus-4-8` (same identity → always excluded, per the pre-existing
config comment). With the author now `claude-fable-5`, that Bedrock
Opus-4-8 entry is a live, distinct reviewer again. Confirmed live by
actually running `resolve-panel.mjs pr_review --track irreversible` after
the change: it resolves to `gpt-5.6-sol`, `gpt-5.6-luna`,
`amazon-bedrock/global.anthropic.claude-opus-4-8` — floor of 3 met, Fable 5
correctly self-excluded as the (would-be) author.

### `plan_review` / `spec_review`: re-led with judgment leaders, bumped to `xhigh`

These gate irreversible-track design tradeoffs once or twice per effort —
the cheapest place in the whole lifecycle to pay for the deepest reasoning
available, and the outcome most directly determines whether the feature
succeeds at all. New `prefer`: Fable 5, Gemini 3.1 Pro Preview, GPT-5.6
Luna, GLM 5.2, DeepSeek V4 Pro, Opus 4.8 — all at `:xhigh` (up from `:high`).
Verified live: with Fable 5 as author, this resolves to Gemini 3.1 Pro
Preview + GPT-5.6 Luna, floor of 2 met.

Gemini 3.1 Pro Preview is placed second, not first, despite topping both
HLE and GPQA — it has a known operational problem (API credits depleted,
429s, per earlier session notes) that is availability, not capability. It
stays high in the list because when it *is* available it's the strongest
pure-judgment reviewer we have; it isn't first because a judge that can't
answer isn't a judge.

### `pr_review`: Neil's explicit steer — technical, `xhigh`, reordered on reliability evidence

Bumped `:high` → `:xhigh` throughout, per direct instruction. Re-ordered
using this repo's *own* retro evidence
(`docs/briefs/2026-07-21-retro-informed-orchestration-and-ceremony-candidates.md`):
`moonshotai/kimi-k3` is genuinely top-3 on SWE-bench-Verified (93.4%) but
timed out at exactly 1,200,000ms in **both** cycle 1 and cycle 2 of the
Case capability-collections PR review — real, measured, ~40 minutes of dead
panel wallclock. **Correction (independent review, 2026-07-21):** for
*this repo*, kimi-k3 is a **new addition at last preference**, not a
demotion — checked directly against the last committed roster (`4d58213`):
pi-sdlc's own `pr_review.prefer` never included kimi-k3 at all before this
change (Fable 5, Sol, Gemini, DeepSeek V4 Pro, Bedrock Opus 4.8). The
"demoted from a higher slot" framing describes Case's separately-applied,
near-identical change (`case@da065ce`), which mirrors this reasoning but
was a genuine demotion there. Added here, last, on the same reasoning
Case demoted it: dropping a top-tier reviewer outright over one bad run
would be an overcorrection, but it shouldn't be relied on as one of the
load-bearing first three either. `google/gemini-3.1-pro-preview` is
similarly placed low in this phase for its own availability issue — though
see the internal-inconsistency finding below: it sits much higher
(prefer[1]) in plan_review/spec_review for the exact same underlying
issue. New order: Fable 5, Sol, Luna, Bedrock Opus 4.8, DeepSeek V4 Pro,
GLM 5.2, Gemini 3.1 Pro Preview, Kimi K3. Verified live: resolves to Sol,
Luna, Bedrock Opus 4.8 — floor of 3 met without ever reaching the two
last-preference entries.

### `task_validate`: dropped `gpt-5.6-terra`

Neil: "haiku is good but we've had trouble with terra." Terra ranks well
down the SWE-bench-Verified table (below DeepSeek V3.2, near Haiku's own
tier) — consistent with the operational trouble reported, not just an
unlucky run. It's removed outright (task validation is a one-shot
mechanistic pass/fail executor with no author-exclusion requirement per
`O7`, so there's no reasoning-diversity reason to keep a weak, troublesome
first pick). New `prefer`: `claude-haiku-4-5`, `deepseek-v4-flash`,
`glm-5.2:low` — this now matches what Case's own config already correctly
does. Verified live: resolves cleanly to `claude-haiku-4-5`.

## Qwen: evaluated, not added

The only Qwen currently reachable through any configured provider is
2025-vintage Qwen3 via `amazon-bedrock` (`qwen3-235b-a22b-2507`,
`qwen3-coder-480b-a35b`, `qwen3-coder-next`). On both benchmarks checked —
SWE-bench-Verified and WebDev Arena (Bradley-Terry human-voted code/product
quality) — it sits clearly behind every model already in these rosters; the
flagship coder checkpoint (`qwen3-coder-480b-a35b`) also has no thinking
mode, a real deficiency for panel judgment work. A newer, more competitive
Qwen line (called "Qwen 3.6 Max Preview" / "Qwen3.7-Max" in the LM Council
and vals.ai data, placing respectably against GLM-5.1 on WebDev Arena)
exists but isn't exposed through any provider configured here yet.
**Verdict: not adding now.** Re-check once a newer Qwen checkpoint is
reachable through a configured provider — this is the same "stale
availability, not stale capability" caveat as Gemini above, just not yet
worth carrying in the roster since there's no way to actually dispatch it.

## New item for the orchestration brief

Neil, appending to
`docs/briefs/2026-07-21-retro-informed-orchestration-and-ceremony-candidates.md`'s
**C2**: add at least one independent reviewer over the Build phase's task
breakdown itself — not re-reviewing the code, but sense-checking that
nothing from the Specification was dropped, and giving a second opinion on
the split/sequencing/parallelisation the build plan proposes. Bonus scope:
that reviewer also names, per task, which model should implement it ("know
your team"). See the appended section there for the full writeup — this
needs a **new schema phase key** (`panels.phases` is a closed enum today:
`plan_review`, `spec_review`, `pr_review`, `task_validate` — no slot for a
build/task-breakdown review), so it is out of scope for this config-only
change and captured as a future candidate instead.

## Risks found by independent review (2026-07-21)

A fresh-context reviewer (`zai/glm-5.2:high`) independently re-derived this
roster's mechanics against `resolve-panel.mjs` rather than trusting this
brief's narrative, and found two real risks the redesign didn't surface:

- **[Medium] `gemini-3.1-pro-preview` is treated inconsistently across
  phases for the same underlying risk.** It sits at `prefer[1]` (load-
  bearing, right behind Fable 5) in `plan_review`/`spec_review` — the two
  highest-stakes, lowest-frequency gates — but last in `pr_review`, for the
  *identical* documented 429/credit-depletion issue. `hasCreds()` only
  checks credential presence, never quota/balance, and the shipped
  invocation doesn't pass `--pong` by default (`phase-pr-review.md`: "off
  by default"), so a depleted account would pass selection and only fail
  as a live 429 mid-panel — worse than not being picked. With `plan_review`/
  `spec_review`'s floor of 2, a gemini 429 there leaves a 1-reviewer panel
  on the gates that matter most. Live-verified today gemini answers `PONG`
  (risk is latent, not active right now), but the split treatment itself
  isn't justified by any evidence in this brief: if it's healthy enough to
  be prefer[1] in plan/spec, the pr_review demotion needs its own
  justification beyond "same issue."
- **[Low] `pr_review` front-loads two `openai-codex` models
  (`gpt-5.6-sol` at [1], `gpt-5.6-luna` at [2])** — `hasCreds()` is checked
  per-provider, so one lost `openai-codex` credential removes both at once.
  `openai-codex` also has no `ENV_VARS` fallback mapping in
  `resolve-panel.mjs` (only `openai`→`OPENAI_API_KEY` is listed) — it's
  credentialed solely via the `auth.json` entry, with no environment-variable
  safety net. The fallback bench (Bedrock Opus, DeepSeek, GLM, gemini, kimi)
  is deep enough that floor 3 still survives this today, but it's a
  correlated-failure mode this brief didn't consider when reordering.

The same review also confirmed, live, that this repo's config change was
still **uncommitted** at review time (`git status`: `M .pi/sdlc/sdlc.config.json`,
last commit `4d58213`) — "applied" locally isn't the same as landed.
Case's mirrored change (`da065ce`) was already committed; this repo's
wasn't yet. Fixed as part of closing out this review (see the commit this
brief now ships alongside).

## What this doesn't fix

- No per-phase author preference yet (`authorDefault` is still one global
  fallback across Brainstorm/Plan/Spec/Build/Implement) — **C1**.
- No automatic timeout-count exclusion policy — kimi-k3 and gemini were
  demoted by hand, based on evidence gathered by hand. The next time either
  model's operational picture changes, someone has to remember to re-order
  this list again — **C3**.
- No mechanism yet for a build-task reviewer to also recommend an
  implementer model per task — the new item above.
