### `delivery-grade` Vocabulary definition diverges from its operational route-2 trigger

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-brainstorm.md
- line: 170
- problem: Route 2 invokes the coined term "delivery-grade" with the trigger "detailed requirements, delivery acceptance, or production behaviour," but the binding Vocabulary defines `delivery-grade` as "Requiring detailed **solution** requirements, delivery acceptance, or production behaviour" (`docs/specs/2026-08-09-spike-exit-rule.md:16`). The same spike block uses the narrower "detailed solution requirements" only three lines later for the deliverable-in-disguise clause (`phase-brainstorm.md:182`), and SER3's mechanical anchor locks the broader "detailed requirements" wording (`docs/specs/2026-08-09-spike-exit-rule.md:209`).
- repro_or_impact: A reader applying the Vocabulary definition to decide route-2 applicability uses a narrower test than route 2's actual text, so more uncertainties qualify as delivery-grade operationally than the definition states. Both interpretations still route to Plan, so practical impact is low, but a coined contract term's definition and its first-use trigger disagree, which the spec's own binding rule exists to prevent.

### SER14 carry landing record is absent from the branch; the durable issue is offline-unverifiable

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-08-09-spike-exit-rule-build.md
- line: 112
- problem: SER14's named landing site is the "committed PR consolidated record," and both SER13 and SER14 premise their Given clauses on that committed record. No `docs/reviews/pr-review-spike-exit-rule-2026-08-09/` consolidated record exists in the branch (only plan/spec/task-validate review dirs are present). The durable issue #245 and its host-action timestamps / zero model-call count are attested solely by T2 — the agent that owed the carry — in the build plan (lines 112, 136, 159), and #245's existence plus its required promote/delete-and-repair outcomes cannot be confirmed from the read-only tree.
- repro_or_impact: At panel time SER14's own Given ("the committed PR-review consolidated record…") is unsatisfiable from the committed tree; the carry is honestly tracked as "PR landing pending" but its discharge rests on the orchestrator transcribing the attested values and on #245 actually existing with both outcomes. If either step is skipped, SER14 fails post-merge with no committed evidence.

No high or medium defects found. The ordered first-match guide (read → Plan/front-load → human judgment → spike) is exhaustive and mutually exclusive under written order, preserves the "delivery-grade cannot fall through to judgment/spike" and "available-but-insufficient never selects read" invariants, and carries no hidden numerical threshold; SER13's inspection claims (understandable without a parser, #147 named only as future mechanisation, no config/script/schema/telemetry/storage/reuse mandate introduced) hold against the committed diff. All preserved-shape constraints verified live: six phase references, six routers, one §8 mermaid fence, exactly one "The next transition is **Plan**" anchor, two gate artifacts, three decision line kinds, Node built-ins only, GPC10 anti-restatement clean.