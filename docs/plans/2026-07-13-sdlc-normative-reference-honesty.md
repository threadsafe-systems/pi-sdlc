# Plan: normative-reference honesty

- Date: 2026-07-13
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Owns stream outcomes: A4 and the non-path portion of A7 (normative-reference inventory and broken/assumed reference removal). Path-relative references and configured artifact homes are discharged by sub-change 4; the parent stream records this split.
- Author vendor: openai.
- Track: **irreversible**, inherited from the parent stream because the inventory schema and checker report are package-owned contracts that future documentation and CI consumers bind to.
- Brainstorm gate: design accepted autonomously on 2026-07-13 under the user instruction to complete the lifecycle without an interactive approval.
- Human gate: plan approval is exercised autonomously under the same instruction; the final PR remains the user’s sign-off point.

## Objective

Make package-owned normative claims honest and mechanically auditable. Every shipped prompt, skill instruction, template, asset, and workflow reference is either a resolvable package-owned target, an explicitly optional consumer-owned target, or an explicitly external facility. Mandatory-facility claims must map to a shipped target or a readiness-verified consumer equivalent. Broken references and false CI claims must be removed rather than hidden by a permissive scanner.

## Problem and contradiction

A plain substring scan cannot distinguish a normative instruction from an example, an optional consumer file, or an external tool. Conversely, a document can contain a real path while the claimed facility is absent. The implementation therefore uses a small pinned inventory with explicit ownership and claim type, plus source fixes for known broken references. Whole-file consumer prompt overrides remain consumer-owned and semantically unverified; the package must not certify their internal references.

## Required outcomes

### N1 — Pinned reference inventory

A committed, versioned inventory enumerates the full normative reference graph in generic shipped surfaces (incidental examples are explicitly marked non-normative or excluded). Each entry has:

- a stable id;
- source file and a bounded assertion identifier/text pattern;
- target kind (`file`, `command`, `facility`, or `external`);
- ownership (`package`, `consumer`, or `external`);
- requiredness (`mandatory` or `optional`);
- resolution mode (`package`, `consumer`, `external`, or `readiness`);
- the expected target path or facility id.

The inventory is an explicit contract over every normative reference in the enumerated generic sources; incidental examples are marked non-normative and are not silently treated as claims. The inventory and checker files are included as self-entries so the contract cannot omit its own enforcement surface.

### N2 — Offline consistency checker

A direct Node CLI and shell wrapper check the inventory from the package checkout, read-only and without network/model calls. It must:

- validate inventory structure and source/target containment;
- verify package-owned files, commands, prompts, schemas, assets, and workflows exist;
- verify package-owned source assertions still occur exactly once; a deliberate mutation that removes or corrupts an assertion must make the checker fail;
- classify consumer-owned optional targets as `unverified-consumer` rather than failing;
- classify external facilities as `external` rather than pretending they are shipped;
- require a `readiness` claim to identify a concrete setup/readiness target and cross-check that the named FS8/FS10 assertion actually verifies the claimed facility; a fixture that removes that verification must fail;
- emit deterministic text and JSON reports with 0 pass, 1 contract failure, 2 operational/configuration error;
- replace control characters and terminal escapes in source-derived diagnostics with visible escapes, and remain inert to shell-like content (strings that must never be executed or interpreted as commands).

The checker is a consistency check for package claims, not a replacement for the lifecycle checker or FS8 readiness surface.

### N3 — Known broken references are corrected

The shipped generic surfaces no longer rely on absent or misnamed files. Sub-change 2 (FS9/FS10) is a hard prerequisite: the final inventory is written and checked only against its merged, committed asset shapes.

- remove unconditional `AGENTS.md` and `CONTRIBUTORS.md` assumptions; use the exact generic wording `the project's governing documents (for example, AGENTS.md or an equivalent if present)` and use `CONTRIBUTING.md` only where this package itself is the target;
- remove `<CONTRIBUTORS_PATH>` from the generic validator prompt and use the approved standards-input wording;
- keep `.pi/sdlc/workflow.md` explicitly consumer-owned and optional;
- ensure all package-owned prompts/assets/scripts named by the skill are shipped;
- replace the `FILL_IN_TASK_BLOCK` dispatch placeholder in the documented panel recipe with a concrete task-block contract, while preserving `resolve-panel --emit-tasks` as a ready-to-paste output mechanism;
- ensure the PR-template and lifecycle-check claims point at the shipped FS9/FS10 assets and conditional CI integration rather than an absent universal facility.

Golden generated-agent fixtures and mutation tests must follow the source prompt contract.

### N4 — Mandatory-facility claims are bounded

The skill and README state CI, PR templates, panels, trackers, and checks as conditional or package-shipped only where evidence exists. The checker inventory maps each normative mandatory claim to a shipped source or explicit readiness-verified target. A consumer can opt into equivalent files without the package claiming semantic verification of their whole content.

### N5 — Compatibility boundaries are explicit

FS8 readiness (schema version 1), FS9 lifecycle checking, FS10 setup, FS1/FS2 schemas, and existing panel derivation remain behaviourally unchanged except for the scoped prompt/document wording and the new checker. This sub-change does not implement path overrides or skill-relative invocation; those belong to sub-change 4.

## Scope

### In

- inventory schema/data under `skills/sdlc/assets/`;
- checker `.mjs` plus thin `.sh` wrapper;
- offline unit/integration tests and exact report fixtures;
- `SKILL.md`, README, templates, generic prompts, golden generated-agent fixtures, and ADR documentation needed to remove A4/A7 contradictions;
- package-owned references in scripts/assets that are normative inputs to the skill;
- documented consumer-owned and external boundaries.

### Out

- FS8/readiness changes;
- FS9/FS10 checker and setup behaviour (already shipped by and consumed from sub-change 2);
- skill-relative command invocation and existing `paths` plumbing (sub-change 4);
- authoring templates and traceability (programme child 2);
- durable receipts, model governance, tracker semantics, live network checks;
- semantic validation of a whole consumer prompt override.

## Risks and mitigations

- **Inventory drift:** mutation tests require each source assertion to occur exactly once and every entry to resolve; deliberately deleting or corrupting one assertion must produce a non-pass report.
- **False confidence:** consumer-owned and external targets have distinct non-pass statuses; only package/readiness evidence can satisfy a mandatory claim.
- **Overreach into prose:** inventory uses stable assertion markers and does not pretend to parse arbitrary Markdown semantics.
- **Prompt compatibility:** source prompts remain the single source; generated fixtures are updated by the existing extraction tests.
- **FS9/FS10 dependency:** the adoption-bundle surfaces referenced by N3 must be merged and their final filenames/shapes verified before the inventory is frozen.
- **Path overlap:** the checker uses package-relative paths only; consumer-configured artifact paths remain sub-change 4.

## Definition of done

- [ ] Versioned inventory schema/data and versioned report envelope are committed and validate deterministically.
- [ ] Reference checker implements the frozen exits and text/JSON envelope.
- [ ] Every inventory entry passes or is correctly classified as consumer/external; no broken package-owned entry remains.
- [ ] Known AGENTS/CONTRIBUTORS/placeholder/false-CI references and the documented `FILL_IN_TASK_BLOCK` dispatch gap are corrected; removing any pinned source assertion makes the checker fail.
- [ ] Prompt extraction tests regenerate fixtures successfully and all existing fixture-based assertions pass.
- [ ] FS8/FS9/FS10 behaviour is unchanged by focused regression tests.
- [ ] `npm test`, `npm run lint`, syntax checks, and the task validator pass without live calls.
- [ ] Plan/spec/build panels have no surviving high or medium findings and tracker projection is complete.
