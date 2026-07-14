# Plan: skill-relative invocation and path plumbing

- Date: 2026-07-14
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Owns stream outcomes: A5 and A6, plus the path-relative portion of A7. Sub-change 3 owns the non-path reference inventory; sub-change 4 owns the path examples and configured artifact-home references. This sub-change is stacked on and must reconcile against sub-change 3’s merged source inventory and PR.
- Author vendor: openai.
- Track: **irreversible**. The documented command/path contract is consumed by installed repositories, generated agents, CI workflows, and artifact authors.
- Brainstorm gate: design accepted autonomously on 2026-07-14 under the user instruction to complete the lifecycle without interactive approval.
- Human gate: plan approval is exercised autonomously; the final PR remains the user’s sign-off point.

## Objective

Make every documented sdlc command executable from a consumer repository while honoring the Agent Skills contract: relative scripts/assets resolve from the loaded skill directory, not from consumer cwd. Make every existing configured `paths` override visible and effective across documentation, lifecycle artifact checking, panel-agent output, setup/readiness guidance, and installed-consumer fixtures.

## Contradiction and boundary

The package cannot assume `skills/sdlc/` exists inside a consumer and does not install a conventional global binary. Pi’s skill contract is the authority: relative references in a loaded skill resolve from the skill directory (see <https://github.com/earendil-works/pi-coding-agent/blob/main/docs/skills.md>, “How Skills Work” and “Skill Structure”; locally installed at `/home/neil/.nvm/versions/node/v25.6.1/lib/node_modules/@earendil-works/pi-coding-agent/docs/skills.md`). In-harness instructions therefore use the canonical skill-relative `scripts/<name>.sh` form; headless instructions use an explicitly resolved package/skill path and direct Node entry points. Consumer artifact paths remain repo-relative and are resolved from the consumer root. The package must never resolve a configured path from its own install directory or allow it to escape the consumer.

## Required outcomes

### P1 — Skill-relative commands

`SKILL.md`, README, setup template, validator prompt/goldens, and shipped workflow/snippets use one explicit contract:

- in pi, the loaded skill directory is the base for the canonical relative `scripts/<name>.sh` and `assets/<name>` references; do not prefix them with `skills/sdlc/`;
- headless/direct-Node examples resolve `<skill-dir>` as the directory containing the loaded skill’s `SKILL.md`, then invoke `node <skill-dir>/scripts/<name>.mjs`;
- from a consumer cwd, no instruction pretends `skills/sdlc/...` is consumer-owned;
- headless examples resolve an installed package/skill directory and use direct Node as the cross-platform fallback;
- the existing `node <skill-dir>/skills/sdlc/scripts/check-lifecycle.mjs` double-prefix example is explicitly corrected to `node <skill-dir>/scripts/check-lifecycle.mjs`;
- package assets are linked/read relative to `<skill-dir>`;
- wrapper commands remain thin sibling-path invocations.

### P2 — All configured paths are explicit and effective

The documentation defines `paths.plans`, `paths.specs`, `paths.reviews`, and `paths.agents` as consumer-root-relative homes. The generated panel-agent output and setup/readiness guidance use the configured homes. Lifecycle checker artifact lookup and panel-agent stamping continue to use configured values; configured paths remain contained and defaults remain unchanged. `paths.agents` controls the output directory; the package does not claim that an arbitrary custom directory is automatically discovered by every Pi host, so the fixture and migration text require that consumers choose a Pi-discovered project-agent directory or pass the generated file explicitly.

A small shared resolver or equivalent testable seams must prove:

- default paths resolve as before;
- every override works from a consumer cwd;
- Windows-style separators and absolute/`..` escapes are rejected consistently;
- a configured path never escapes the consumer root;
- backslash and slash separators are normalized/rejected consistently, including `..\\outside`;
- package-relative asset paths are not confused with consumer artifact paths.

### P3 — Installed-consumer fixture

An offline fixture installs/copies the skill under a non-root skill directory, runs from a separate consumer cwd, and exercises startup status, setup, panel-agent stamping, panel resolution, lifecycle checking, and task validation using resolved skill paths. No fixture relies on `consumer/skills/sdlc` existing.

### P4 — Reference and documentation coherence

The shipped generic-source corpus for this check is explicitly: `skills/sdlc/SKILL.md`, `README.md`, `templates/setup-sdlc.md`, `skills/sdlc/prompts/*.prompt.md`, `skills/sdlc/assets/*`, all `skills/sdlc/scripts/*.sh` usage wrappers, and `test/fixtures/golden/*.agent.md`. Historical `docs/plans`, `docs/specs`, and `docs/reviews` records are excluded from the mutation corpus.

All path examples in generic sources agree with P1/P2. Historical plan/spec documents may retain their recorded paths, but shipped SKILL/README/templates/prompts/assets and generated golden agents must not present package-checkout-relative commands as consumer-cwd commands. A mutation test catches reintroduction of the old `skills/sdlc/scripts/...` consumer-cwd examples.

## Scope

### In

- skill-relative command and asset wording in shipped generic sources;
- direct-Node/headless fallback wording;
- shared/testable path resolution seams where existing scripts need them;
- configured paths in setup/readiness/checker/panel-agent/generator guidance;
- installed-consumer fixtures and offline tests;
- generated golden agents and workflow/snippet path references;
- ADR and migration documentation.

### Out

- new lifecycle semantics, FS8 readiness ids/exits, FS9 declaration grammar, FS10 asset/report semantics;
- removing any existing `paths` key;
- installing a new global binary or adding runtime dependencies;
- non-GitHub CI abstraction, author models, durable state, traceability, tracker redesign;
- rewriting historical docs that are records rather than shipped instructions.

## Risks and mitigations

- **Pi resolution ambiguity:** anchor every in-harness example to the loaded `SKILL.md` directory and test a skill installed outside the consumer.
- **Consumer/package root confusion:** use separate names and assertions for skill root versus consumer root; test both simultaneously.
- **Windows portability:** direct Node examples and path normalization tests cover separators without requiring Windows CI.
- **Override drift:** mutation tests enumerate all four `paths` keys and compare defaults/overrides.
- **FS9/FS10 coordination:** sub-change 2 owns the shipped checker/workflow shape and sub-change 3 owns its package-reference inventory; this change is stacked on their merged PRs and must update the canonical path wording without changing their runtime contracts.
- **Consumer-copied commands:** consumers may have copied the old `skills/sdlc/scripts/...` examples into local docs or CI. The migration ADR will tell them to audit consumer-owned files; setup will not rewrite them.
- **Workflow acquisition:** preserve FS10’s pinned checkout contract; only correct the path used after checkout.

## Definition of done

- [ ] All P1–P4 scenarios have named passing offline checks.
- [ ] No shipped generic command presents `skills/sdlc/...` as a consumer-cwd path, including the known `<skill-dir>/skills/sdlc/...` double-prefix example.
- [ ] Installed-consumer fixture exercises every required command from consumer cwd.
- [ ] All four configured paths are tested end to end with defaults, overrides, containment, and separator cases.
- [ ] Existing FS8/FS9/FS10 tests and contracts remain green.
- [ ] `npm test`, `npm run lint`, syntax checks, and PV2 receipts pass without live calls.
- [ ] Plan/spec/build and final PR panels have no surviving high or medium finding.
