I have all the evidence I need. Here is the spec review.

---

### SKILL.md law change is unspecified and ungated — the change's headline objective has no falsifiable scenario

- severity: high
- confidence: high
- location: spec §0 (line 25), §3 (validator subagent contract, no SKILL.md section), §7 PV10 (lines 567–573); plan DoD (lines 79, 217); `skills/sdlc/SKILL.md:276-278`
- defect: The entire motivation for this change is removing the unconditional `npx tsc --noEmit` (and `CONTRIBUTORS`) from *generic law*. The spec repeatedly says SKILL.md must change ("disappears from generic law", §0:25; "updated generic prompt/SKILL law", §5.1), but §3 only rewrites the validator *prompt*; there is no contract for the new `## Per-task validator` SKILL.md text, and **no scenario greps SKILL.md**. PV10 gates only the *generated task-validator agent* (the stamped prompt body) and the goldens — not SKILL.md. An implementer can ship SKILL.md unchanged and pass every PV scenario.
- evidence: `skills/sdlc/SKILL.md:277` still reads `test command exits zero, npx tsc --noEmit exits zero` and `:278` `greppable CONTRIBUTORS rules hold`. Plan line 79 (`npx tsc --noEmit is removed from generic law`) and DoD line 217 (`The generic skill/prompt contains no unconditional TypeScript or other language-specific command`) make the skill, not only the prompt, in scope. PV10 (spec lines 569–573) asserts only "Generated task-validator agent ... omits unconditional npx tsc --noEmit and <CONTRIBUTORS_PATH>" — SKILL.md is never named. The existing `test/docs.test.js` greps SKILL.md but only for OH items, never for `tsc`/`CONTRIBUTORS`.
- impact: The central, irreversible objective is left to implementer discretion with no gate. The plan's DoD item (line 217) cannot be falsified by any committed scenario — exactly the failure mode the review targets.
- fix: Add an explicit SKILL.md §3 subsection pinning the new `## Per-task validator` law (runner invocation, manifest-driven, no language-mandated check, no `CONTRIBUTORS`), and extend PV10 (or add a scenario) to grep `skills/sdlc/SKILL.md` asserting no `npx tsc --noEmit` and no `CONTRIBUTORS`/`<CONTRIBUTORS_PATH>` remain.

### Internal contradiction: runner report-write is "atomic" but the CLI never writes a report — the receipt's "verbatim" integrity is not mechanically guaranteed

- severity: high
- confidence: high
- location: spec §2.1 (lines 197–198), §3.3.2 (line 374), §6 (lines 483–484), §4 (lines 413–414)
- defect: §6 NFR states "Report writes are atomic (temporary sibling + rename) **when the runner writes a requested artifact**; stdout-only mode performs no report write." But the frozen CLI in §2.1 is `[--manifest PATH] [--repo-root DIR] [--format text|json]` — there is **no `--out`/`--report` flag**, so the runner can never "write a requested artifact"; the only defined flow (§3.3.2) is the validator LLM running `--format json` and *itself* "writing stdout verbatim to the requested runner-report artifact." Thus §6's atomic-write NFR is unreachable via the defined contract, and the receipt's `runner-report.json` ("verbatim PV2 JSON output", §4:414) and `runnerReportSha256` rest on an LLM faithfully copying stdout — not a mechanical guarantee.
- evidence: §2.1 lines 197–198 define no output-file flag. §3.3.2 line 374: "Runs exactly: `validate-task.sh --manifest <path> --repo-root <root> --format json`, writing stdout verbatim to the requested runner-report artifact." §6 lines 483–484 condition atomic writes on a mode the CLI does not expose. §4 line 414 claims "verbatim PV2 JSON output."
- impact: A frozen surface (the receipt) carries an integrity claim ("verbatim", atomic) that the specified mechanism cannot deliver; the §6 NFR cannot be met or tested. The receipt hash proves only that the *stored* file is internally consistent, not that it equals what the runner emitted.
- fix: Either (a) add a `--report PATH` flag to §2.1 and have the runner write atomically + compute its own hash, removing the LLM from the write path; or (b) delete the §6 atomic-write clause and state honestly that the report is LLM-copied stdout, downgrading the "verbatim" claim accordingly.

### Evidence-capture algorithm is under-specified for the determinism PV8/PV9 claim to gate

- severity: medium
- confidence: high
- location: spec §2.4.4 (lines 251–255), §2.4.6 (line 258), §2.5 (line 563)
- defect: PV9 asserts "Normalising duration to zero makes repeated reports byte-identical," but the tail algorithm has three unpinned degrees of freedom: (1) the cross-stream allocation ("If one stream uses less, unused capacity **may** be used by the other" — "may" is permissive, not deterministic; greedy stdout-first vs balanced yields different bytes); (2) the line-vs-byte interaction (which bound wins when the last 200 lines exceed 20,480 bytes, or vice versa, is unspecified); (3) redaction-vs-tail ordering (§2.4.6 says byte accounting is on "the final redacted text," implying redact-then-tail, but §2.4.2 lists stdout/stderr replacement and §2.4.4 "retain its tail" reads as tail-then-redact — these shift the cut point).
- evidence: §2.4.4 lines 251–255; §2.4.6 line 258 ("byte accounting occurs on the final redacted UTF-8 report text"); §2.5 line 563 ("byte-identical"). Each is a real branch an implementer must guess, and each changes the captured tail bytes.
- impact: Golden report fixtures (PV8/PV9) cannot be asserted byte-identical until these are pinned; two correct implementations could produce different, valid-looking tails, so the scenario cannot gate determinism as claimed.
- fix: Specify the exact pipeline (e.g., decode → redact → stdout-tail-first greedy up to 100 lines/10,240 B, then stderr gets the remainder, total ≤ 200/20,480; byte bound checked last and re-truncated) and state the tie-break explicitly.

### PV11 receipt verifiability is overstated: `generatedAgentSha256` hashes a non-stored, gitignored file

- severity: medium
- confidence: high
- location: spec §4 (lines 413–425), §7 PV11 (lines 575–580); repo `.gitignore` (`.pi/agents/`)
- defect: The receipt stores byte-copies of `manifest.json` and `runner-report.json` but **not** the generated agent, yet records `generatedAgentSha256`. Generated panel agents are gitignored (`.pi/agents/`, per `.gitignore` and the SKILL "red flags"). PV11 claims "Mutation of any stored file breaks hash verification" — but the agent is *not* a stored file in the receipt dir, so its hash is unverifiable once the worktree is gone except by re-derivation. Separately, PV11's positive text lists runtime-only facts ("runner and validator pass", "records actual model/time") as scenario outcomes, though PV13 forbids any test from invoking a model — those facts cannot be gated by an automated scenario.
- evidence: §4 lines 413–425 (required files omit the agent; `generatedAgentSha256` field present). `.gitignore`: `.pi/agents/`. PV11 line 578 ("runner and validator pass; receipt hashes match manifest/report/agent and records actual model/time") vs PV13 ("no automated test invokes a model or network"). §4 line 430 already bounds this honestly ("runtime gate evidence, not proof"), but PV11 does not.
- impact: A frozen receipt field (`generatedAgentSha256`) is not independently verifiable from committed artifacts; PV11 asserts a mutation-detection guarantee it cannot deliver for that hash, and conflates runtime evidence with offline-gated outcomes.
- fix: Either store a byte-copy of the generated agent in the receipt dir (parallel to `manifest.json`), or explicitly scope `generatedAgentSha256` as re-derivable-from-committed-prompt rather than a stored-file hash, and rewrite PV11 to separate its offline-gated assertions (hash/golden/verdict) from the runtime-only facts.

### Runner-internal ERROR has no field in the frozen JSON report shape

- severity: medium
- confidence: high
- location: spec §2.2 (exit table), §2.5 (`TaskValidationReportV1`, line 302/311)
- defect: §2.2 classifies "runner ... or report-write error" as ERROR (exit 2), but `TaskValidationReportV1` has only `manifestErrors` (JSON-pointer-prefixed, "Non-empty only for ERROR" but manifest-specific). There is no generic `errors`/`runnerError` field. In JSON mode (§2.5: "exits 0–2 write one JSON object ... nothing to stderr") a runner-internal failure therefore emits `verdict:"ERROR"` with `manifestErrors:[]`, empty commands/categories/scenarios, and no message — a structurally valid report that conveys no diagnostic, contradicting the "nothing to stderr" + "deterministic pointer error" intent.
- evidence: §2.5 `manifestErrors: string[]` (line 302) and "Non-empty only for ERROR" (line 311); §2.2 ERROR row covers "CLI, manifest read/parse/schema, root, runner, or report-write error." The manifest-pointer channel cannot carry a non-manifest error.
- impact: A whole class of ERROR (runner crash, report-write failure) is unrepresentable in the frozen output contract; consumers parsing the JSON cannot distinguish "no manifest errors" from "runner died," so the error path is under-specified.
- fix: Add a top-level `errors: string[]` (or `runnerError: string | null`) to `TaskValidationReportV1`, populate it for non-manifest ERROR, and state that `manifestErrors` ∪ `errors` is the complete ERROR channel.

### Plan PV1 describes a per-entry `category`; the spec normalizes it away without acknowledging the divergence

- severity: low
- confidence: medium
- location: plan lines 36–37; spec §1.2 `checks`/`categories` (lines ~110–130)
- defect: Plan PV1's required-outcome description lists each manifest entry as carrying "stable check id; category; applicability ...". The spec's `CommandCheck` is `{id, argv, timeoutMs?}` with no `category`; categorization lives only in the separate `categories` object. The semantic outcome is met, but a reader/consumer of the plan expecting per-entry category fields will not find them, and the spec never notes the projection.
- evidence: plan lines 36–37 ("stable check id; category; applicability"); spec §1.2 `CommandCheck` type and the normalized `categories` map.
- impact: Minor frozen-shape surprise and plan/spec drift; a check referenced by two categories has ambiguous primary category, which is unaddressed.
- fix: Add one sentence in §1.2 stating that category/applicability are expressed via the `categories` map (not per-check) and that this is the normative projection of plan PV1's per-entry description.

### `shell:false` argv mandate is incompatible with `npx`/`biome`/`.cmd` shims off-Linux, yet the spec claims cross-repository portability

- severity: low
- confidence: high
- location: spec §0 (lines 18–20), §2.3.3 (shell:false), §2.1 example argv; `.github/workflows/ci.yml:13,20`
- defect: The spec mandates argv execution with `shell:false` (§2.3.3) and the headline is portability "across languages and repositories" (§0). On Windows, Node `child_process.spawn`/`execFile` with `shell:false` does not resolve PATHEXT/`.cmd` shims, so argv like the spec's own `npx tsc --noEmit` (PV2) or this repo's `biome`/`npm` would fail with ENOENT. CI is ubuntu-only (`.github/workflows/ci.yml:13`, `node-version: 22`), so this is never exercised. The plan's risks note commands "may be shell-specific," but the spec's portability claim is unqualified.
- evidence: §2.3.3 "`shell: false`"; §0 "portable across languages and repositories"; `ci.yml:13` `runs-on: ubuntu-latest`, `ci.yml:20` `node-version: 22`; PV2 example uses `npx tsc --noEmit`.
- impact: A Windows consumer declaring `npx`/`biome` argv sees spurious FAIL (missing executable) with no guidance; the portability claim over-reaches the verified platform.
- fix: Either scope the portability claim to POSIX/Linux (state Windows requires absolute-path or `.cmd`-suffixed argv under `shell:false`), or document the platform constraint in §2.3.

CLEAR: none — each attack surface A–G produced at least one evidence-backed finding above.
