# Plan panel round 1 — consolidated (slug gate-presentation-contract)

Panel of record: `google/gemini-3.1-pro-preview:xhigh` (runId d96e80ff),
`openai-codex/gpt-5.6-luna:xhigh` (runId f89d0634, replacement for fable-5's
pre-verdict 429 — see prompt-round1.md). Raw outputs: round1-gemini-3.1-pro-preview.md,
round1-gpt-5.6-luna.md.

Deduped canonical findings (11): 3 high, 7 medium, 1 low.

| id | sev | source | summary |
|---|---|---|---|
| R1-01 | high | gemini#1 | Panel-scope check delegated to phase-plan.md §4 (authoring prose); panel prompt frozen and untouched |
| R1-02 | high | gemini#2 | §4 first-paragraph enumeration omits the provenance block — internal contradiction |
| R1-03 | high | luna#1 | Standalone `sdlc:plan` has no Brainstorm upstream; mandatory provenance contradicts §1 |
| R1-04 | medium | gemini#3 + luna#3 | G4 fold contradicts the tools bullet's anti-ceremony constraint; reconciliation unspecified |
| R1-05 | medium | luna#2 | Map-mode sketch "both modes" vs "plan is the index" reads ambiguous |
| R1-06 | medium | luna#4 | Contract-test coverage not enumerated (semantic directions unnamed) |
| R1-07 | medium | luna#5 | Three-criteria ADR bar absent from §8 In scope / DoD |
| R1-08 | medium | luna#6 | DoD lifecycle command not exact; irreversible track requires Spec AND Build artifacts |
| R1-09 | medium | luna#7 | G7 "named never bound" under-specified; no none-identified outcome |
| R1-10 | medium | luna#9 | DoD items 3-9 name no exact commands |
| R1-11 | low | gemini#4 + luna#8 | ADR suffix arrow: Unicode `→` in plan vs ratified ASCII `->` |

CLEARs recorded: dogfood block shape (appetite first/unique, one-line entries,
rationale on rejections, sketch present), §4 insertion point unambiguous,
skill-kernel §9 anchors guarded, proportionality, irreversible track.
