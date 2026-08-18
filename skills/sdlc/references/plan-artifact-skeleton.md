# Plan artifact skeleton

The fixed shape for sdlc Plan docs (under the configured `paths.plans`,
default `docs/plans/<date>-<feat>.md`). Fill in every block below; delete none
of the markers. A block that legitimately has zero entries — no non-goals, no
parked items, no pre-mortem rows — keeps its header and markers and carries
one `none — <one-line reason>` entry where entries would go: a zero state is
declared, never silent. A Plan that omits a required piece is defective at
authoring time — the Plan gate refuses it, not the reviewer's patience.
The skeleton is authoring guidance, not mechanical prevention.

## Brainstorm provenance

Store the upstream gate presentation per the storage rule of the plan phase
reference: in plain mode the sketch and decisions list verbatim; in map mode
the sketch verbatim and the decisions indexed. A Plan with no upstream gate
declares that instead of leaving the block empty.

<sketch and decisions list, stored per the storage rule — or: no upstream gate>

## Problem statement

Name who has the problem, the evidence that it exists today, and what it
costs to leave unsolved. Describe the world, not the change.

- Actor/situation: <who hits this, in what situation>
- Baseline evidence: <observable evidence of the status quo>
- Consequence: <the cost of leaving it unsolved>

Binding rule: the problem statement names an actor, observable baseline evidence, and a consequence, and contains no implementation prescription.

## Non-goals

Outcomes a reader might reasonably expect this Plan to pursue, deliberately
not pursued. Each entry carries its reason.

- <outcome deliberately not pursued> — <one-line reason>

## Alternatives considered

The shapes weighed and rejected, always including doing nothing. Each entry
carries the trade-off that rejected it.

- <alternative, including doing nothing> — <trade-off reason it was rejected>

## Objectives and scope

Every in-scope item carries exactly one boundary label distinguishing the
outcome sought (`objective`) from what bounds the work (`constraint`) and
from choices already made (`solution decision`). Parked items name where they
land.

- [objective] <in-scope item>
- [constraint] <in-scope item>
- [solution decision] <in-scope item>
- parked: <item> — destination: <Spec, Build, a tracker issue, or a backward transition>

Binding rule: every in-scope item carries exactly one boundary label (`objective` | `constraint` | `solution decision`) and every parked item names its destination.

## Outcome proof

One row per objective: how the world will show the objective was met. A
metric needs its baseline, target and window, and an owner who will read it;
a proxy or a no-measurement rationale is declared, never implied. The row
names where the proof lands next.

| Goal | Question | Metric | Baseline | Target/window | Evidence owner | Carried to |
|---|---|---|---|---|---|---|
| <goal> | <question> | <metric, a proxy, or: no measurement — <reason>> | <baseline> | <target and window> | <owner> | <Spec scenario/NFR id, or retro> |

Binding rule: every objective has an outcome-proof row — a metric with baseline, target/window, and an evidence owner, or a cited proxy/no-measurement rationale — and the row names its Spec or retro landing site.

## Non-functional requirements & repo-doc sweep

One row per area the change touches or deliberately does not. At minimum the
sweep considers AGENTS.md/README documentation, observability, security and
secret delivery, CI/CD, and the ISO 25010 quality characteristics that
inform the area column. `n/a` is a finding with a technical reason, not a
blank.

| Area | Applicability + reason | Target | Binding phase | Verification |
|---|---|---|---|---|
| <area> | <applies or n/a — <technical reason>> | <target> | <Spec, Build, Implement, or PR> | <how it will be verified> |

Binding rule: every NFR/repo-doc sweep row carries applicability with its reason, target, binding phase, and verification, or `n/a` with a technical reason.

## Pre-mortem

Imagine the change shipped and failed. One row per way that happens: what
triggered it, what it cost, what blunts it, who owns that, and where the
mitigation lands.

| Risk | Trigger | Consequence | Mitigation | Owner | Destination |
|---|---|---|---|---|---|
| <risk or failed future> | <trigger> | <consequence> | <mitigation> | <owner> | <destination> |

Binding rule: every pre-mortem row carries trigger, consequence, mitigation, owner, and destination; only small reversible work may instead declare the block's zero state, with a one-line reason.

## Definition of done

Completion items a reviewer can falsify — each one is checkable, none is a
restatement of intent.

- <falsifiable completion item>

## Context for the next agent

What the session that picks this Plan up needs and cannot re-derive.

- <context the next agent needs; parked questions land here, each with its destination>
