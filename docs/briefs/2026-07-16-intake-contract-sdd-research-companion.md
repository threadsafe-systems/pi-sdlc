# Brief: research grounding for the intake contract (companion)

Status: conjecture / companion research brief. Extends
`2026-07-14-orchestrator-led-automation-intake-contract.md`, not a plan, not
a spec — sharpens how the intake objectives should be *phrased* so the
unattended-lane conjecture is more defensible, using external evidence
rather than intuition alone.

## Reference

- Original brief: `docs/briefs/2026-07-14-orchestrator-led-automation-intake-contract.md`
- Research synthesis: `~/project-mayhem/outputs/sdd-frameworks-agentic-dev-2026-07-16.md`
  (ten SDD tools/frameworks surveyed, BDD-vs-SDD question settled, "high
  rigor = high barrier" diagnosed, spec-optional autonomy evidence assessed)
- Raw fan-out research: `~/project-mayhem/projects/sdd-research/raw/*.md`
  (five independent web-research briefs, one per cluster)

## What the research changes about the conjecture

It doesn't invalidate it, and it doesn't hand it to us for free either. Two
things it settles:

1. **Nothing surveyed removes the human approval gate for irreversible
   work, and the negative evidence for trying is specific, not vague
   caution** — MIT CSAIL names "knowing when to defer to the user" an open
   research problem; METR's RCT found experienced developers **19% slower**
   with AI despite believing they were 24% faster, because verification
   cost of loosely-specified output is systematically underestimated. The
   original brief already keeps irreversible tickets on the human-gated
   lane (condition 2, Track declared) — that design choice is now evidenced,
   not assumed.
2. **The lever that *is* evidenced is elicitation quality and sentence-level
   phrasing, not gate removal.** The March 2026 "Ask or Assume?" arXiv
   result — a scaffold that explicitly detects underspecification and asks
   before acting hit 69.4% resolve rate vs 61.2% for a standard agent,
   *matching* the performance of being handed a fully-specified issue —
   is the first rigorous evidence that conversational elicitation can
   substitute for a human-authored spec, at least for bounded,
   SWE-bench-shaped tasks. That's a narrower, more useful target than "make
   the pipeline fully automated": **make the intake objective phrasing
   itself do more of the falsifiability work**, mechanically, before Plan
   even starts. That's exactly what "how to phrase intake objectives" is
   asking, and it's a tractable research-backed target rather than a hope.

## Per-condition: what's reinforced, what should sharpen

### 1. Falsifiable outcome — sharpen with EARS phrasing

Current condition: *"at least one done-condition that fails today and would
pass after."* That's a presence check, not a shape check — a reviewer still
has to judge whether the prose actually falsifies anything.

Research (§2, §5.1 of the synthesis): EARS (`WHEN <trigger>, THE
<component> SHALL <response>` / `WHILE <precondition>, ...`) is the
"proportionate middle path" — Kiro's real-world precedent for constraining
*sentence shape* without importing Gherkin's step-definition/execution-
harness tax pi-sdlc deliberately avoids. Gherkin's own maintenance-tax
literature argues against going further; EARS gets the LLM-parseability win
without it.

**Recommendation:** require each `Done means` line to restate as one EARS
sentence. This turns "falsifiable outcome" from a judgment call into a
partially mechanical lint — a line that can't be forced into `WHEN/WHILE
... SHALL ...` shape is very likely prose describing intent, not an
observable, falsifiable state change. Cheap, additive, doesn't touch any
frozen surface.

### 2. Track declared — reinforced, no change

§3's sharper diagnosis of "high rigor = high barrier" ("ceremony
disproportionate to change size," true across every surveyed tool) confirms
pi-sdlc's reversible/irreversible split — the ceiling this condition
enforces — as the field's least-common, best-evidenced structural fix. No
change to the condition; worth knowing it's now externally validated, not
just an internal preference.

### 3. Anchors resolve — extend with a downstream consistency tripwire

§5.4 proposes a narrow, deterministic version of Spec-Kit's `/analyze`:
check that build-plan tasks' declared scenario ids exist in the approved
spec, and every spec scenario id is claimed by at least one task. That's a
Build-phase check, not an intake check, but it's the natural companion to
"anchors resolve" — the intake gate confirms context exists *before*
translation starts; this confirms nothing drifted loose *during*
translation. Worth scoping as a `validate-task.mjs`-style deterministic
script alongside whatever pilots the unattended lane, not a new panel.

### 4. Budget + escalation — add a review-cost line

No direct research precedent for the budget field's shape, but METR's
finding — verification cost of AI output is the thing humans systematically
under-price — argues the budget should name a review-cost ceiling
explicitly, not just a generation/attempt ceiling. An unattended run that
blows its token budget is visible; one that produces output nobody
adequately reviews before merge is the actual risk METR measured.

### Panel item: scope closure — reinforced, no change

No new evidence changes this condition's mechanism.

### Panel item: decision residue — gains a repeatable method

§5.3 names **Example Mapping** (Cucumber's Three Amigos technique: Rules →
Examples → Questions, distilled before any scenario is written) as a
brainstorm-phase technique worth adopting explicitly for irreversible-track
features — a conversational discipline, not a file format, and it maps
almost exactly onto what the intake `Decided` field is supposed to already
contain.

**Recommendation:** don't just require the `Decided` field be populated —
require it be *produced* by an Example Mapping pass (Rules the ticket
assumes → Examples that exercise each rule → Questions that remain) before
the ticket is drafted. This gives "decision residue" a repeatable method
instead of leaving it to the quality of whatever conversation happened to
occur, and it's a direct answer to one of the original brief's open
questions ("have a good conversation" was previously unstated as a
technique — this names one).

### Panel item: no unpriced unknowns — reinforced with a number, scope caveat attached

The "Ask or Assume?" 69.4%-vs-61.2% result is direct evidence *for* this
condition's underlying mechanism — naming the unpriced unknown rather than
letting the agent assume measurably improves outcomes. Important caveat to
attach, not omit: that result is on bounded, SWE-bench-shaped tasks. Treat
it as evidence the *mechanism* works, not evidence it generalizes to the
breadth of irreversible-track tickets this repo would route through it —
the graduation mechanism (below) is exactly the tool for finding out where
it stops holding.

## New: an elicitation method to generate the ticket, not just validate it

The original brief only defines *adjudication* — lint + panel checking a
ticket someone already wrote. It doesn't define how a human (or human+agent
conversation) should produce a well-formed ticket in the first place, beyond
"assumes brainstorming already happened." Two research-backed techniques
close that gap, both additive to Brainstorm's existing toolkit rather than a
new phase:

1. **Example Mapping for irreversible-track intake** — Rules → Examples →
   Questions, run before `Done means`/`Decided` are drafted. Produces the
   decision-residue content the panel condition checks for, by
   construction.
2. **"Ask one pointed question at a time, log the assumption if unclear and
   low-stakes"** as the *reversible*-track default posture — mirrors
   Claude Code's assumption-logging default, Tessl's one-question interview
   rule, and Traycer's Epic Mode. Explicitly **not** for irreversible
   tickets: §4's negative evidence (MIT CSAIL, METR) says this posture is
   the wrong tool once the change is hard to undo — which is exactly the
   boundary the Track condition already draws, reused here rather than
   reinvented.

## Updated sketch template

```markdown
## Outcome        (one sentence, observable state of the world)
## Done means     (>=1 EARS-shaped check: WHEN <trigger>, THE <component>
                   SHALL <response> — or WHILE <precondition>, ...)
## Track          reversible | irreversible -> human lane
## Anchors        1-3 paths/ADRs/PRs, with one clause each on why
## Non-goals      what a keen agent must NOT expand into
## Decided        output of an Example Mapping pass (Rules / Examples /
                   Questions) for irreversible tickets; ad hoc for reversible
## Budget         attempts / tokens / review-cost ceiling / escalate-to
```

Only two fields change shape (`Done means`, `Decided`); the rest of the
original template is unchanged.

## Calibrating graduation against overconfidence

The original brief's graduation mechanism ("ticket classes earn the
unattended lane after N tickets pass with zero spec/build amendments; one
amendment demotes the class") has a latent failure mode METR's result names
directly: self-reported success is exactly the kind of self-assessment
METR's subjects got wrong (felt 24% faster, were 19% slower). If graduation
counts come from the orchestrator's own completion report, it inherits the
same overconfidence risk.

**Recommendation:** graduation counts must come from independent review of
the outcome (panel or human), not the orchestrator's self-report —
consistent with the principle already named for BMAD's issue #446
fabrication failure: never trust one agent's self-report of its own work.
This doesn't change the mechanism's shape, just who's allowed to certify a
"zero amendment" run.

## What the research does not support

Stating plainly so this doesn't get overclaimed later: no surveyed tool, and
no piece of primary research (MIT CSAIL, METR), supports removing the human
approval gate for irreversible work. The intake-conditions conjecture's
existing design — irreversible tickets stay on the human-gated lane,
regardless of how well-phrased the ticket is — is not newly at risk from
this research. It's now evidenced rather than assumed, which is a different
thing from "safe to loosen."

## Updated open questions

Original brief's open questions still stand. Adding two this research
surfaces:

- **Does Example Mapping run as a live human+agent conversation, or can an
  agent conduct a solo pass against existing decision residue (map tickets,
  ADRs, prior PR discussion)?** If solo, does that cross the line the
  original brief draws — "judgment stays human-owned; only translation is a
  candidate for automation" — or is distilling *already-made* human
  decisions into Rules/Examples/Questions itself translation, not judgment?
- **Should the EARS-shape check on `Done means` be a hard mechanical gate
  (grammar/regex) or a panel-adjudicated soft check?** Natural-language
  variance makes a strict regex brittle; a panel check reintroduces the
  judgment-call cost the lint tier exists to avoid. Worth piloting both on
  a small ticket sample before committing.

## Sources

Full citations in `~/project-mayhem/outputs/sdd-frameworks-agentic-dev-2026-07-16.md`
and `~/project-mayhem/projects/sdd-research/raw/*.md`. Primary sources this
companion leans on most directly:

- arXiv 2603.26233, "Ask or Assume? Uncertainty-Aware Clarification-Seeking
  in Coding Agents" (Mar 2026) — the 69.4%/61.2% clarification-seeking
  result.
- MIT CSAIL, "Can AI really code? Study maps roadblocks to autonomous
  software engineering" (Jul 2025).
- METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source
  Developer Productivity" (2025) — the 19%-slower/24%-felt-faster result.
- AWS Kiro / EARS notation — precedent for constrained-grammar acceptance
  criteria without a Gherkin execution harness.
- Cucumber Example Mapping (Three Amigos technique) — Rules/Examples/
  Questions elicitation discipline.
- BMAD-METHOD issue #446 — first-hand agent-fabrication account motivating
  the independent-review-not-self-report principle applied to graduation.

This is still a companion to a conjecture, not a plan — no scope-in/out
decision has been made. Map ticket #43 tracks the underlying investigation;
this file exists so the phrasing work has a citable basis when that map
resolves toward a Plan.
