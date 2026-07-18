### FS1 config-schema contradiction: `paths` extension punted to Spec while Out-of-Scope forbids it

- severity: high
- confidence: high
- location: Scope → Out (line "config schema (FS1/FS2) changes") vs Context for the Specification author (final bullet)
- defect: The plan's Out-of-Scope forbids "config schema (FS1/FS2) changes", but the "Context for the Specification author" section explicitly tells the Spec author to decide "whether v1 hardcodes or extends `paths`" for the retros output directory. If the Spec chooses to extend `paths` (adding `retros` to `paths.properties`), that IS an FS1 config-schema change — `sdlc.config.schema.json` has `"additionalProperties": false` on `paths` (schema:14), and `inspectConfig` in `lib.mjs` only allows `plans`, `specs`, `reviews`, `agents` (lib.mjs:98). The plan punts an unresolved decision that, in one resolution path, directly contradicts its own boundary.
- evidence: Plan text: "Config: `.pi/sdlc/sdlc.config.json` … no `retros`/`runs` path key exists yet; adding keys is FS1-additive territory and the spec must say whether v1 hardcodes or extends `paths`." Simultaneously: Out → "config schema (FS1/FS2) changes." The existing schema at `skills/sdlc/schema/sdlc.config.schema.json` line 38 uses `"additionalProperties": false` on `paths`. The validator at `skills/sdlc/scripts/lib.mjs` line 98 restricts path keys to `["plans", "specs", "reviews", "agents"]`.
- impact: If the Spec author follows the plan's prompt and extends `paths`, they violate the plan's own Out-of-Scope boundary, which the plan panel and gate should have caught. If they follow Out-of-Scope and hardcode, the plan's design is in tension with the established FS1 convention (all artifact homes are configurable via `paths`). Either way, the plan is incoherent at this seam.
- fix: Decide now: either hardcode `docs/retros/` (remove the `paths` extension option from Context, and justify why retros diverges from the `paths` convention for plans/specs/reviews), or explicitly scope in a minimal additive `paths.retros` FS1 addition (adjust Out-of-Scope to say "no breaking or non-additive FS1/FS2 changes").

### Panel precision metric depends on unstructured prose adjudication without plan acknowledgement

- severity: medium
- confidence: high
- location: R3 — "per-model panel precision (findings incorporated ÷ raised) and cost-per-incorporated-finding"
- defect: R3 lists panel precision as a derived measure computed by `collect`, but the input source — `consolidated.md` review artifacts — contains unstructured prose adjudications (e.g., "Adjudication: partially incorporated; removal DISMISSED — owner decision." from `docs/reviews/plan-sdlc-adoption-bundle-2026-07-13/consolidated.md`). The plan acknowledges LLM classification is "soft data" only for "steering tags and narratives" (R3 bullet 3), but panel-precision classification requires the same LLM parsing of prose to determine "incorporated" vs "not incorporated" per finding. The plan does not name this dependency, does not flag panel precision as soft/model-attributed data, and does not mention it in the Risks section.
- evidence: R3 text: "per-model panel precision (findings incorporated ÷ raised)"; Risks: "LLM classification is soft data. Steering tags and narratives are model-attributed opinions." The existing `consolidated.md` file at `docs/reviews/plan-sdlc-adoption-bundle-2026-07-13/consolidated.md` line 21 uses prose adjudication with no structured boolean "incorporated" field.
- impact: A Spec author who takes R3 at face value might assume `consolidated.md` has a structured format to mechanically compute precision, and design the collector without LLM parsing for this measure — then discover late that unstructured prose requires an LLM pass the plan didn't scope. Or they wire it in without labelling it as soft data, violating the plan's own hard-vs-soft telemetry distinction.
- fix: Add an explicit note to R3 that panel-precision metrics are LLM-classified soft data stored with model attribution (same treatment as steering tags), or commit to a structured adjudication format in `consolidated.md` as a new frozen shape (which would itself need plan-level acknowledgment).

### FS5 frozen scripts gain side-effect emission without plan's risk model addressing the surface change

- severity: medium
- confidence: high
- location: R1 — "Auto-emitted events: panel resolution/dispatch (resolve-panel / ensure-panel-agent gain emission as a side effect), task validation results (validate-task)"
- defect: The plan declares `resolve-panel`, `ensure-panel-agent`, and `validate-task` will gain event emission "as a side effect." These three scripts are frozen surfaces under FS5 (ADR 0005): their flags, `--emit-tasks` JSON shape, stdout, and exit codes are a contract consumers bind to. Adding any new output (even stderr warnings) changes their observable behaviour. The plan's Risks section does not address the risk that side-effect emission could break consumers that parse stdout or that rely on exact output shapes. The plan says "emission failure does not fail the primary command" but does not say where emissions write (stdout/stderr/file) or how they avoid colliding with the frozen output contract.
- evidence: Plan R1: "Auto-emitted events: panel resolution/dispatch (resolve-panel / ensure-panel-agent gain emission as a side effect), task validation results (validate-task)." ADR 0005 (`docs/adr/0005-script-clis-fs5.md`): "freeze the flags … the `--emit-tasks` JSON shape, and exit codes … consumers … rely on their stdout/exit-code contract." The existing `resolve-panel.sh` (`skills/sdlc/scripts/resolve-panel.sh`) calls through to `resolve-panel.mjs` which outputs structured data to stdout.
- impact: If the emitter writes to stdout, it breaks every consumer that parses `resolve-panel`/`ensure-panel-agent` output (including CI workflows, human scripts, and the SKILL.md prose instructions). If to stderr, it still adds noise that tools may treat as significant. The Spec needs to pin the emission channel, and the Plan should have acknowledged this as a risk to the FS5 contract.
- fix: Add a Risk entry: "Emission side effects touch FS5 frozen scripts whose stdout contract consumers bind to; the Spec must guarantee emission writes to a separate channel (stderr with a consistent prefix, or a log file) and never mixes with the primary output contract."

### DoD "byte-identical output" requirement for HTML renderer is practically unenforceable

- severity: medium
- confidence: high
- location: Definition of done — item 7 ("same input ⇒ byte-identical output")
- defect: The DoD requires the renderer to produce "byte-identical output" from the same `run.json`, but the plan also says the dashboard includes "Text (narratives, adjudication gists)" and "narrative phase summaries" (R4 bullet 7). If `run.json` contains generation timestamps or if the renderer embeds any floating-point cost values, Node.js V8 floating-point serialization can vary across versions. Additionally, the plan's Scope says tests are "golden-ish structural assertions, not pixel tests" — a "golden-ish" testing strategy (fuzzy matching) directly contradicts the "byte-identical" requirement (exact match). These two commitments cannot both be satisfied.
- evidence: DoD item 7: "same input ⇒ byte-identical output." Scope: "renderer (golden-ish structural assertions, not pixel tests)." R4 text includes "total $, total tokens" (executive strip) and "Cost breakdown: $ and tokens by phase → activity → model" — these are floating-point values from LLM cost APIs.
- impact: The Build-phase implementer will either fail the byte-identical test on the first Node.js minor-version bump, or will have to strip all floating-point and timestamp content from HTML (defeating the dashboard's purpose), or will silently relax the DoD. Any of these outcomes means the DoD as written misleads.
- fix: Narrow the DoD item: "same input ⇒ semantically equivalent HTML structure (all R4 sections present with correct data; structural assertions verify section presence and representative content, not pixel-perfect or byte-identical output)."

### Scope magnitude: five independently testable subsystems in one plan

- severity: low
- confidence: medium
- location: Scope → In
- defect: The plan bundles five distinct subsystems — (1) event emitter + run store, (2) FS5-script side-effect integration, (3) panel-harvest step, (4) collector with LLM classification joining 5+ data sources, (5) deterministic HTML renderer with 6 dashboard sections — plus a new `skills/sdlc-retro/` skill surface and an ADR. Each subsystem has its own independent test fixtures, error modes, and frozen shapes. This is conventionally 2–3 specs worth of surface area. While a monolith spec is not a hard defect, the plan provides no decomposition guidance and the Spec author will be forced to either write an oversized spec or decompose ad hoc.
- evidence: In-scope list enumerates 6 distinct deliverable categories (emitter, script side effects, SKILL.md edits, harvest, collect+run.json, render+dashboard, skill surface + ADR + tests).
- impact: Risk of an unwieldy Spec that gate-panel reviewers struggle to assess, or a Build plan with 10+ tasks where the epic/sub-issue tracker overhead obscures genuine blocking edges.
- fix: Consider decomposing into two plans: (a) telemetry capture (R1+R2+R5 partial — emitter, harvest, run store, SKILL.md hooks), and (b) retrospective pipeline (R3+R4+R5 remainder — collector, renderer, dashboard, ADR). Or explicitly state why a single Spec is proportionate and how the Spec author should structure it.

### DoD "doc-presence tests pin the enumerated hook sentences" is underspecified

- severity: low
- confidence: high
- location: Definition of done — item 3
- defect: The DoD requires "doc-presence tests pin the enumerated hook sentences" in SKILL.md, but "pin" has no defined semantics. Does it mean a string-literal grep asserting the exact sentence appears? (fragile to rewording). Does it mean a structural assertion that SKILL.md references `record-run-event` by name? (reasonable but not what "pin the sentence" suggests). The plan punts definition to the Spec without a fidelity requirement.
- evidence: DoD item 3: "doc-presence tests pin the enumerated hook sentences." The plan uses "hook sentences" in the prose-emitted events description (R1 bullet 2) as SKILL.md prose that names emitter invocation, but "pin" is never defined.
- impact: The Spec author may interpret "pin" as either a fragile exact-string match (causing churn on every SKILL.md edit) or a loose name-reference check (risk of false negatives if the sentence structure changes). Without a plan-level fidelity statement, the gate panel cannot judge whether the eventual Spec's doc-presence tests are adequate.
- fix: Replace "pin" with a concrete assertion class: e.g., "a structural doc-presence test asserts that each phase/gate/dispatch step in SKILL.md which MUST emit contains the token `record-run-event` and the correct event type string; exact prose wording is not pinned."

CLEAR: A — every DoD item has a falsifiable path except item 7 (byte-identical HTML, addressed above) and item 3 (underspecified "pin", addressed above).
CLEAR: B — every outcome (R1–R5) states a verifiable goal, with the caveat that R3's panel-precision measure has a hidden soft-data dependency (addressed above).
CLEAR: C — in/out scope boundaries are coherent except the FS1 `paths` contradiction (addressed above).
CLEAR: D — no locked decision is re-opened or contradicted without flagging; the irreversible track choice correctly reflects the two frozen shapes.
CLEAR: F — the plan correctly claims the irreversible track; `events.jsonl` and `run.json` are stored-record shapes that freeze a contract, satisfying the irreversible criteria per the iron law.
