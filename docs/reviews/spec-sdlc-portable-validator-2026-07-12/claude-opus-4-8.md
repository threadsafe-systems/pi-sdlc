I've read the spec, the governing plan, the programme/adoption-readiness build, the current validator prompt and SKILL law, `lib.mjs`/`ensure-panel-agent`, the goldens, and ADR 0007/0012. Findings below.

### Runner "report artifact" write path is contradictory and unbuildable as a frozen CLI

- severity: high
- confidence: high
- location: spec §2.1 (invocation grammar), §2.2/§2.3 (exit table), §6 (NFR), vs §3.3.2
- defect: PV2 freezes an exit-2 ERROR cause "report-write error" and an NFR that "report writes are atomic (temporary sibling + rename) when the runner writes a requested artifact," but the frozen §2.1 invocation grammar defines only `--manifest`, `--repo-root`, `--format`, `--help` — there is no output-path flag, and §3.3.2 has the *validator agent* (not the runner) write stdout to the artifact. The runner therefore has no way to "write a requested artifact," so the report-write ERROR path and atomic-rename NFR are unreachable/undefined.
- evidence: §2.1 lists exactly four flags; §2.5 "exits 0–2 write one JSON object plus newline to stdout and nothing to stderr"; §3.3.2 "writing stdout verbatim to the requested runner-report artifact"; yet §2.2/§2.3 exit-2 row includes "report-write error" and §6 "Report writes are atomic … when the runner writes a requested artifact; stdout-only mode performs no report write."
- impact: A frozen, irreversible CLI contract ships internally contradictory: an implementer cannot tell whether an output flag exists, "stdout-only mode" implies a second mode with no trigger, and the ERROR taxonomy references a state the CLI cannot produce. Any golden/scenario for report-write ERROR (none exists in §7) cannot be written.
- fix: Either add and specify an explicit `--report PATH` flag (with the atomic write + report-write ERROR semantics) to §2.1, or delete the runner-artifact/atomic-write/report-write-error language and make §2 stdout-only, with the agent solely responsible for persistence.

### Normative example manifest references undeclared checks, violating §1.3

- severity: medium
- confidence: high
- location: spec §1.2 (JSON example) vs §1.3
- defect: The canonical example declares only one check (`tests.contract`) in `checks[]`, but `categories.static.checkIds` references `static.lint` and `categories.bannedPatterns.checkIds` references `patterns.diff` — neither is a declared check. §1.3 requires "every id must reference a declared check" and "Every declared check is referenced by at least one required category," so the spec's own example is an invalid manifest.
- evidence: §1.2 `"checks": [ { "id": "tests.contract", … } ]` is the only declared check; `"static": { "applicability": "required", "checkIds": ["static.lint"] }` and `"bannedPatterns": { … "checkIds": ["patterns.diff"] }`; §1.3 "Required command-category `checkIds` … every id must reference a declared check."
- impact: The one worked example fixture/schema authors will copy is rejected by the rules it illustrates; any golden or AJV fixture derived verbatim fails, and implementers must guess the intended `checks[]` contents.
- fix: Add `static.lint` and `patterns.diff` entries to the example `checks[]` array (or mark the example explicitly abbreviated and supply a complete valid instance).

### Evidence-bound reallocation and truncation-marker accounting are under-specified for an "exact" contract

- severity: medium
- confidence: medium
- location: spec §2.4 items 4–6; PV8
- defect: §2.4 caps a check at "200 lines and 20,480 bytes" with per-stream reserves of "100 lines/10,240 bytes" that may borrow "unused capacity," but does not define how the line budget and byte budget interact (borrow lines independently of bytes?), the order of cross-stream reallocation, or whether the mandatory marker line counts toward the line/byte budget. PV8 nonetheless asserts reports "obey exact per-stream/total tail rules."
- evidence: §2.4.4 "reserve up to 100 lines/10,240 bytes for stdout and the same for stderr. If one stream uses less, unused capacity may be used by the other, while total limits still hold"; §2.4.5 "A truncated stream starts with exactly: `[...truncated; showing bounded tail...]`"; §2.4.6 "byte accounting occurs on the final redacted UTF-8 report text"; plan PV4 says "200 lines and 20 KiB, whichever limit is reached first."
- impact: Two conforming implementations can produce different tails for the same output (e.g., stdout exhausts bytes but not lines while stderr wants stdout's spare lines), so the "byte-identical after duration→0" golden claim (PV9) is not actually pinned by the prose; the contract cannot gate what PV8 says it gates.
- fix: Specify a single deterministic algorithm — order of reallocation, whether line and byte budgets are borrowed jointly, and whether the marker line is included in both budgets.

### Redaction name-match is an unanchored substring, over-redacting benign variables

- severity: medium
- confidence: medium
- location: spec §2.4 items 1–2; §2.5 determinism claim
- defect: The redaction set is built from env vars "whose variable name matches, case-insensitively: `KEY|TOKEN|SECRET|PASSWORD|PASSWD|AUTH|CREDENTIAL`" with values ≥4 chars, then every exact value occurrence is replaced. As an unanchored alternation this matches common non-secret names (`MONKEY`, `TURKEY`, `KEYBOARD`, `AUTHOR`, `AUTHORITY`), so their ordinary values (e.g. `MONKEY=banana`) are stripped from all evidence as `[REDACTED]`.
- evidence: §2.4.1 quoted pattern; §2.4.2 "replace every exact occurrence in argv display, stdout, stderr, and error messages with `[REDACTED]`"; §2.5 "durationMs is the only intentionally nondeterministic value."
- impact: Benign command output is corrupted, hiding real failures the validator is meant to surface; because the redaction set is derived from the runner's ambient environment, report content varies by machine, contradicting the "only durationMs is nondeterministic" honesty claim outside a controlled test env.
- fix: Anchor the name match to recognised credential-variable naming (word-boundary/token match) and/or state explicitly that redaction is deliberately over-broad and env-dependent, dropping the absolute determinism claim.

### Report has no standards/rule→check evidence mapping the plan's PV4 output requires

- severity: low
- confidence: medium
- location: spec §2.5 (`TaskValidationReportV1`) vs plan PV4 / PV1
- defect: Plan PV1 says each entry carries "scenario ids or governing rule it evidences" and PV4's frozen output records "scenario/rule mapping to the required command check that evidences it," but the spec's report models only `scenarios[]` mapping; `standards`/`bannedPatterns` are opaque command categories with no rule-to-check evidence field.
- evidence: plan "Required outcomes" PV1 ("scenario ids or governing rule it evidences") and PV4 ("scenario/rule mapping to the required command check that evidences it"); spec §2.5 has `scenarios: ScenarioResult[]` and `categories: CategoryResult[]` (checkIds only), no rule mapping.
- impact: The plan's per-rule evidence traceability is silently dropped; a reviewer cannot see which governing rule a standards command evidences, only that a command passed.
- fix: Either add a rule-evidence mapping to `CategoryResult`/report for `standards`, or record in the spec that "rule" evidence is intentionally represented solely by the command exit and remove the plan's rule-mapping expectation via adjudication.

### "Deterministic JSON-pointer-prefixed" claim is unspecified for multi-location cross-field errors

- severity: low
- confidence: medium
- location: spec §2.5 (`manifestErrors`); §2.3 step 2
- defect: `manifestErrors` are "deterministic JSON-pointer-prefixed strings," but the §1.3–§1.5 cross-field rules (e.g. "evidence keys equal `ownedScenarios` exactly," "every declared check referenced by at least one required category") span multiple document locations with no single natural pointer, and the spec does not fix which pointer/ordering each such error uses.
- evidence: §2.5 "manifestErrors are deterministic JSON-pointer-prefixed strings"; cross-field rules in §1.3 ("Every declared check is referenced by at least one required category") and §1.4 (evidence-keys equality) have no schema-node locus.
- impact: PV3 asserts "deterministic pointer error," but two implementations can emit different pointers/order for the same cross-field violation, so PV3's determinism cannot be gated without a pinned mapping.
- fix: Specify the canonical pointer and emission order for each cross-field rule (e.g. a fixed rule→pointer table), or state that cross-field errors use a fixed sentinel pointer prefix.

CLEAR: A — Aside from the rule-mapping gap (low), the frozen PV1 fields are backfillable and no field over-commits beyond the reserved `repoRoot:"."`.
CLEAR: E — `shell:false` + inherited-env + PATH-resolved argv + default-SIGTERM timeout compose correctly with Node `child_process`; missing-exe/signal/timeout→FAIL mapping matches real behaviour.
