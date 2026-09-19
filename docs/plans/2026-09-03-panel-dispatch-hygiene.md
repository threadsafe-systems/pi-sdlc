# Panel roster hygiene: stale and undispatchable model ids

Track: **reversible** · Slug: `panel-dispatch-hygiene` · Closes #270

**Scope split.** This Plan originally carried both #270 (roster rot) and #268
(reviewer time budgets). The reviewer-budget half — `phase-pr-review.md` §5 and
the implement-side timeout doctrine — moved to its own track after two review
rounds put 13 of 18 findings in that newly authored doctrine and one in the
roster half. Doctrine prose is not falsifiable by a test, so shipping it beside
a mechanically verifiable config change let the weaker evidence set the bar for
both — the failure this Plan's own Build predicted for the two tasks and then
ignored one level up. #268 stays open and continues on its own branch, carrying
both rounds' findings as its starting backlog.

## Brainstorm provenance

Plain-mode brainstorm, 2026-09-03, no upstream map. No mermaid sketch was
produced — the change is two file edits with no structural shape to draw.

Decisions ratified in the dialogue, verbatim:

- **D1 — Bedrock entries are declared route twins, not independent panelists.**
  The pool lists direct `anthropic/claude-opus-5`, with
  `amazon-bedrock/eu.anthropic.claude-opus-5` behind it as a declared
  provider-route twin.
  **Revised at the scope split:** only the config pairing is in scope here. The
  one-sentence §5 rule ships with #268.
  **Revised after D4:** the config pairing stands, but §5 records the rule in
  **one sentence** rather than a full recovery rung. A bespoke route-twin rung
  is a one-off, opus-only version of the successor pattern's per-seat fallback
  column and would be deleted wholesale when that lands. One sentence is cheap
  to delete and still stops a future editor from removing the config pairing as
  an apparent duplicate.
- **D2 — the roster correction is minimal.** Correct only what is provably
  broken or forced by D1.
  **Revised:** model **generation currency is now in scope** — the track opened
  against model data that has since moved. Pool *ordering* remains out of scope;
  bumping an entry to the current generation of the same model family is in.
- **D4 — a successor reviewer pattern is known and deliberately deferred.**
  Two independently-developed patterns will likely replace parts of this
  surface in a later round (see "Context for the next agent"). This slice is
  shaped to build only what survives them: correct ids and time budgets are
  durable under any shape; bespoke fallback prose is not, so it is minimised.
- **D3 — the reviewer time budget is concrete.** A named floor, a size trigger,
  and a wave rule, rather than prose telling the reader to scale with size.
  **Moved at the scope split:** D3 is #268's decision and is not built here.

Assumptions carried from the gate, stated and unobjected:

- #270's optional strike-file mechanism is closed into #141 as evidence, not
  built here.
- Both tickets ship as one PR.

Evidence gathered during the dialogue, and what it overturned:

- `resolve-panel.mjs`'s `modelIdentity()` normalises Bedrock aliases
  (`BEDROCK_ALIAS_VENDORS = {anthropic, deepseek}`), so
  `amazon-bedrock/eu.anthropic.claude-opus-5` and `anthropic/claude-opus-5`
  resolve to one identity and the second is dropped as already in the panel.
  A Bedrock entry is therefore never an independent panelist, and the resolver
  performs no runtime failover — resolution finishes before dispatch begins.
- A four-candidate PONG check on 2026-09-03 answered on
  `google-vertex/gemini-3.1-pro-preview`, `anthropic/claude-opus-5`,
  `amazon-bedrock/eu.anthropic.claude-opus-5` and
  `amazon-bedrock/eu.anthropic.claude-sonnet-5`. This **falsifies #270's stated
  premise**: neither model is dead. Gemini's failure was a stale provider
  prefix (`google/`, absent from `pi --list-models`), not depleted credits.

## Problem statement

- Actor/situation: a session dispatching an sdlc review panel — design or PR —
  in this repository.
- Baseline evidence: all three review pools in `.pi/sdlc/sdlc.config.json` list
  `google/gemini-3.1-pro-preview`, a provider id absent from
  `pi --list-models`, and `pr_review` lists
  `amazon-bedrock/global.anthropic.claude-opus-4-8`, whose inference region and
  model generation have both moved.
- Consequence: each stale entry costs a dispatch, a diagnosis and a replacement
  wave every time a panel resolves — and the S2 retro misdiagnosed the cause, so
  the wrong fix was nearly shipped.

## Non-goals

- Making `--pong` run by default, or any behavioural change to
  `resolve-panel.mjs` — #141 owns that, and the file is frozen.
- A strike file or any new persisted model-health state — duplicates #141.
- Re-**ordering** the roster — the current ranking is grounded in published
  benchmark citations this change has no equivalent evidence to overturn.
  Generation bumps within a model family keep their existing pool position.
- Adopting the successor reviewer pattern — no lens/seat table, no per-seat
  fallback column, no vendor-diversity floor, no seat efficacy measurement.
  Those need their own brainstorm; this slice must not pre-empt their shape.
- Re-adding `openai-codex/gpt-5.6-terra`, though it is live again — it was
  dropped for reported operational trouble, and restoring it is a ranking
  decision needing evidence.
- Teaching the resolver about route twins in code — needs a frozen-surface
  change and its own slice.
- Editing `skills/sdlc/schema/sdlc.config.example.json` — frozen, and it carries
  only generic placeholder ids that exhibit neither defect.

## Alternatives considered

- Do nothing — the rot recurs on every panel run; the timeout alone has already
  cost one full review wave.
- Demote the two "dead" models exactly as #270 asks — falsified by the PONG
  check; it would encode a stale-id bug and a since-fixed IAM gap as permanent
  ranking decisions, and fix neither.
- Build the strike-file mechanism here — duplicates #141 and requires editing a
  frozen contract script.
- Prose-only budget guidance ("scale with review size") — leaves the tool
  default silently winning, which is the failure being fixed.
- Drop the Bedrock entries entirely and rely on direct Anthropic only — removes
  the only route-diverse recovery option for a provider-side outage.

## Objectives and scope

- [objective] Every model id in the repo's configured pools resolves against
  `pi --list-models`.
- [objective] A provider-route twin is a declared, findable recovery step
  rather than an undocumented side effect of alias normalisation.
- [constraint] No file in `test/frozen-surfaces.test.js`'s `FROZEN` list is
  modified.
- [constraint] Reversible track — no Spec; design review is `human` per the
  config's reversible override.
- [objective] Every configured model id names the current generation of its
  family, so the roster reflects today's model data rather than the data this
  track opened against.
- [solution decision] Direct `anthropic/claude-opus-5` is the pool principal;
  `amazon-bedrock/eu.anthropic.claude-opus-5` sits behind it as the declared
  route twin. §5 records this in one sentence, not a recovery rung (D1 revised).
- [solution decision] Generation sweep, each keeping its existing pool
  position: `claude-fable-5` → `claude-fable-5-1` (including `authorDefault`),
  `claude-opus-4-8` → `claude-opus-5`, `zai/glm-5.2` → `zai/glm-5.3`.
- [solution decision] The gemini entry is corrected to
  `google-vertex/gemini-3.1-pro-preview` at its existing pool position.
- parked: a `sonnet-5` route twin for non-opus slots — destination: a tracker
  issue, opened only if the opus twin proves useful in practice.
- parked: teaching `resolve-panel` route-twin awareness in code — destination:
  #141.
- parked: a lens/seat review matrix with per-seat fallbacks, a vendor-diversity
  floor, and seat efficacy measurement — destination: a fresh brainstorm on the
  successor reviewer pattern.
- parked: declarative per-phase model choice for orchestrator/worker
  implementation — destination: the same fresh brainstorm.
- parked: restoring `openai-codex/gpt-5.6-terra` for mechanical lenses —
  destination: the same fresh brainstorm, where seat efficacy data would settle
  it.

## Outcome proof

| Goal | Question | Metric | Baseline | Target/window | Evidence owner | Carried to |
| --- | --- | --- | --- | --- | --- | --- |
| Reference prose matches the shipped roster | Does any phase reference name a model this change removed? | Inspection: no reference prose names a `deepseek/` id or the undated haiku alias | `phase-implement.md` names both as the task-validator preference | Present at merge | Author | DoD check below |
| Pools contain only resolvable ids | Do all configured ids appear in `pi --list-models`? | Count of configured ids absent from the live list | 3 pools carry `google/gemini-3.1-pro-preview`; `pr_review` carries a stale Bedrock route+generation | 0 absent, verified at implement | Author | DoD check below |
| Roster names current generations | Is any entry superseded by a live newer generation of the same family? | Count of entries with a live newer sibling | 5 entries superseded (fable-5, opus-4-8 ×2, glm-5.2, gemini prefix) | 0 superseded, verified at implement | Author | DoD check below |
| Nothing built here is thrown away next round | Does the slice avoid pre-empting the successor pattern? | Inspection: no seat table, no per-seat fallback column, route-twin content is one sentence | D1 as first drafted specified a full bespoke recovery rung | Present at merge | Author (PR panel confirms) | Successor-pattern brainstorm |
| Route twins are findable | Can a session learn the twin rule without reading `resolve-panel.mjs`? | Inspection: §5 names the route-twin recovery step and the config `$comment` names the pairing | Behaviour exists only as an undocumented effect of `modelIdentity()` | Present at merge | Author (PR panel confirms) | This PR's panel |
| Rot is caught earlier next time | Did this run produce evidence for the mechanised check? | #141 carries the PONG falsification note | #141 cites only the original gemini-credits theory, now shown wrong | Comment posted before merge | Author | #141 |

## Non-functional requirements & repo-doc sweep

| Area | Applicability + reason | Target | Binding phase | Verification |
| --- | --- | --- | --- | --- |
| AGENTS.md / README | n/a — neither documents panel pools or reviewer budgets; the phase reference is the documented surface | — | — | — |
| Phase reference accuracy | applies — `phase-pr-review.md` §5 is the single source of truth for the panel run-shape | §5's recovery ladder matches actual resolver behaviour | Implement | PR panel review; `npm test` reference-contract suites |
| Observability | applies — panel dispatch already emits `panel.dispatched`; a raised-budget retry must remain within its original logical wave | Retry carries the original wave number, not a new one | Implement | Inspection against the §5 harvest/wave rule |
| Security & secret delivery | n/a — no credential, secret, or IAM change; the AWS IAM fix landed outside this repo | — | — | — |
| CI/CD | applies — frozen-surface and reference-contract tests gate the edit | `npm test` green, no frozen file touched | Implement | `npm test`; `test/frozen-surfaces.test.js` |
| Configuration correctness | applies — `.pi/sdlc/sdlc.config.json` is schema-validated and read by `sdlc-status` | Config stays valid; `sdlc-status` still exits 0 | Implement | `sdlc-status.sh --format json` after the edit |
| Maintainability (ISO 25010) | applies — the `$comment` is the roster's only rationale record and rots as ids drift | Every corrected id carries its reason in the `$comment` | Implement | Inspection; PR panel review |
| Reliability (ISO 25010) | applies — the change's purpose is fewer wasted dispatch cycles | No configured id fails to resolve | Implement | PONG check over the corrected pools |
| Cost / proportionality | applies — `workflow.md` requires every gated verification to state a budget | The PR panel itself dispatches with an explicit budget per the new rule | PR | The PR panel run dogfoods the rule it adds |

## Pre-mortem

| Risk | Trigger | Consequence | Mitigation | Owner | Destination |
| --- | --- | --- | --- | --- | --- |
| The route-twin rule is never followed | It lives in prose; nothing enforces it | Sessions keep swapping to a different model on provider outages | Accept for this slice; the mechanised version is parked to #141 and to the successor pattern | Author | #141 |
| This slice is obsoleted weeks after merging | The successor reviewer pattern replaces the pool/fallback surface entirely | Wasted authoring effort; contradictory guidance in §5 | Slice deliberately scoped to the durable core (ids, time budgets); bespoke fallback prose held to one sentence per D1-revised | Author | Successor-pattern brainstorm |
| The generation sweep changes panel behaviour invisibly | Five ids move at once with no efficacy measurement to detect a regression | A weaker panel goes unnoticed because nothing measures seat quality | Same families and pool positions throughout; seat efficacy measurement is parked to the successor pattern, which is where it belongs | Author | Successor-pattern brainstorm |
| The roster rots again within weeks | Model ids drift faster than the config is read | The next panel run repeats this whole diagnosis | Attach the PONG falsification to #141 so the mechanical check is prioritised on real evidence | Author | #141 |
| `anthropic/claude-opus-5` displaces a better reviewer | opus-5 replaces opus-4-8 in plan/spec pools as a forced consequence of D1 | Panel quality shifts without benchmark evidence | Same vendor and family, one generation newer; position in the pool is unchanged | Author | Implement |
| A roster change silently falsifies prose elsewhere | Model ids are quoted in phase references as well as configured in the manifest | A reader follows a reference to an id the roster no longer carries | Sweep every reference for quoted ids as part of the change, not after it; DoD carries the check | Author | Implement |
| `anthropic/claude-fable-5-1` stays pool lead while undispatchable as a child on this machine | Subagent children do not load the anthropic-auth extension and fall back to a CLI that gates the model (#275) | Every panel resolving this pool pays one wasted dispatch until #275 lands | Accepted as a residual risk, not fixed by demotion: the model is invocable and the defect is one machine's child runtime, so downgrading shared config would encode a local fault | Author | #275 |
| The PR panel itself times out reviewing this | The diff is small, so the risk is low | Delay only | Dispatch this PR's own panel with the explicit budget the change introduces | Author | PR |

## Definition of done

- Every model id in `.pi/sdlc/sdlc.config.json`'s four `prefer` pools and
  `authorDefault` appears in `pi --list-models` output, checked mechanically.
  Catalogue presence proves neither that the caller may invoke the model nor
  that it can be dispatched as a subagent child, and both have been observed to
  fail independently of the listing — so every id this change adds or alters
  also carries a committed child-dispatch probe receipt under
  `docs/validation/`, naming the id, the date and the dispatch path used. Ids
  this change leaves untouched are not claimed to have been probed.
- `pr_review`'s pool contains `anthropic/claude-opus-5` immediately followed by
  `amazon-bedrock/eu.anthropic.claude-opus-5`.
- `plan_review` and `spec_review` carry `anthropic/claude-opus-5` in the slot
  previously holding `claude-opus-4-8`.
- No pool contains a `google/` prefixed id, and no pool contains a `deepseek/`
  id: `zai/glm-5.3-flash` takes those positions.
- `task_validate` leads with the dated `anthropic/claude-haiku-4-5-20251001`.
  The undated alias resolves to that dated id at dispatch and then fails the
  launch identity check, so the alias is unusable as a configured entry.
- `authorDefault` and every `claude-fable-5` pool entry read
  `anthropic/claude-fable-5-1`.
- No pool contains `zai/glm-5.2`; every Zai entry reads `zai/glm-5.3`,
  preserving its existing thinking suffix and pool position.
- No configured entry has a live newer generation of the same model family,
  checked against `pi --list-models`.
- No entry is re-ranked relative to another. `pr_review` gains one candidate and
  `task_validate` gains a route twin, which shift the entries after them one
  index each; index stability is not claimed, relative order is.
- The config `$comment` carries only durable roster facts — what the order
  means, what a route twin is and why deleting either half loses an option, and
  what a listing does not prove. No dates, ticket references, benchmark figures
  or probe records, all of which go stale without the file changing.
- The `$comment`'s identity-fold claim is scoped to the pairs that actually
  fold. `modelIdentity()` folds a Bedrock alias onto its direct vendor/model
  only when the id after the vendor segment is identical; a versioned
  inference-profile suffix such as `-v1:0` does not fold, so `task_validate`'s
  haiku pair counts as two distinct identities against the floor while the opus
  pair counts as one.
- No phase reference quotes a model id the roster no longer carries.
  `phase-implement.md`'s task-validator paragraph names the shipped
  `task_validate` order, not `deepseek/deepseek-v4-flash` or the undated
  `anthropic/claude-haiku-4-5`.
- `.pi/sdlc/CONFIG.md`, the generated companion, is regenerated from the edited
  manifest and `config-doc.sh check` reports `current`.
- `bash skills/sdlc/scripts/sdlc-status.sh --repo-root . --format json` exits 0
  once the change is committed — the readiness gate's `adoption.manifest-clean`
  check fails by design while the manifest has uncommitted edits, so this is a
  post-commit check.
- `npm test` is **616/616 green**, with `test/frozen-surfaces.test.js` green and
  no file from its `FROZEN` list in the diff. On macOS the suite requires a
  canonical `TMPDIR`: the default `/var/folders/…` path is a symlink to
  `/private/var/folders/…`, and 29 tests fail on the resulting containment
  check. That is a local path artefact, not a baseline of real failures.
- CI is green on the PR, including `commit-lint`, which validates the PR title
  as a conventional commit header rather than only the branch's commits.
- #141 carries a comment recording the PONG falsification of the
  gemini-credits theory.
- #270 is closed by the PR. #268 remains open and continues on its own branch.

## Context for the next agent

- **A successor reviewer pattern is coming, and this slice was shaped around
  it.** Two independently-developed sources are the reference material:
  `~/.pi/agent/git/github.com/neilwashere/pi-keith-review/skills/keith-review/`
  (and its `keith-review-ratchet` sibling), and `~/code/firstmate`'s secondmate
  configuration. What they contribute, and what this repo currently lacks:
  a **lens × seat table** replacing the flat `prefer` list, where each row
  carries its own "if a seat is unavailable" fallback column; **vendor
  diversity as the invariant** rather than model identity, with "two vendors is
  the floor" and an explicit refusal to collapse a dual-vendor lens silently;
  **independent cross-vendor verification** of every finding before it is
  reported; a **depth ladder** (self-review / quick / panel) keyed on change
  size and sensitive surfaces; **per-seat efficacy measurement**
  (`N raw → N verified · N false positives`), which is the empirical answer to
  pool rot that #270 gestures at; and a **fix ratchet** that drives review
  findings to a clean verdict. Firstmate's secondmate contributes the
  declarative model-choice shape — a `runtime model thinking` triple per role
  (`pi anthropic/claude-sonnet-5 high`) — for orchestrator-led, worker-based
  implementation at each phase. None of this is in scope here; all of it needs
  a fresh brainstorm.
- The installed sdlc skill at `~/.pi/agent/git/.../pi-sdlc` is **v3.0.0**, six
  minor versions behind this working copy. Read phase references from
  `skills/sdlc/references/` in this repo, not from the installed copy — §5
  differs substantially between them.
- `modelIdentity()` normalising Bedrock aliases is the fact that makes the
  route-twin framing necessary; without it the pairing looks like a redundant
  duplicate entry and a future editor will delete one.
- The S2 retro's two diagnoses (gemini credits, opus IAM) were both wrong at
  the time this Plan was written. Do not re-import them from #270's body.
- `sdlc.config.example.json` and `resolve-panel.mjs` are frozen. Any temptation
  to fix this properly in code stops at that boundary and routes to #141.
- Parked questions and their destinations are listed under Objectives and
  scope; none of them blocks this slice.
</content>

</invoke>
