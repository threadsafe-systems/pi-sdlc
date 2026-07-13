# Specification: portable per-task validator

- Date: 2026-07-12
- Governing Plan: `docs/plans/2026-07-12-sdlc-portable-validator.md`
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Promotion decision: approved during Adoption Readiness Build review
- Track: **irreversible**
- Author vendor: openai
- Human gate: Specification approved by Neil Chambers on 2026-07-12.
- Frozen surfaces:
  - FS7 headings remain unchanged; validator prompt content changes compatibly
    within those headings;
  - introduces PV1, the task-validation manifest schema;
  - introduces PV2, the deterministic runner CLI/output/exit contract;
  - introduces the runtime validator-receipt artifact contract.

## 0. Summary

A Build task now carries a committed JSON validation manifest. A deterministic,
local runner validates that manifest, executes its exact argv commands without a
shell, evaluates scenario/category coverage, redacts protected environment
values, bounds evidence, and returns PASS/FAIL/ERROR. The validator subagent is a
thin checklist reporter over that runner; it does not invent commands,
applicability, scenario evidence, or quality opinions.

The old unconditional `npx tsc --noEmit` disappears from generic law. A
TypeScript task declares it when applicable; other tasks declare their own
static checks. Every implementation task still needs at least one meaningful
required executable check.

## 1. Task-validation manifest contract (PV1)

### 1.1 Location and authority

Each implementation task has one committed manifest:

```text
docs/validation/<feature>/<task-id>.json
```

- `<feature>` and `<task-id>` use lowercase ASCII letters, digits, and single
  hyphens; neither starts/ends with a hyphen.
- The approved Build-plan task is canonical. The manifest is a mechanically
  executable projection and is reviewed at the Build human gate.
- If Build plan, tracker issue, and manifest disagree, implementation stops;
  Build plan wins, then manifest and tracker are corrected and re-approved.
- A manifest is immutable during a task except through a Build correction and
  renewed human approval. Implementation may not weaken its own checks.

### 1.2 Exact JSON shape

```json
{
  "schemaVersion": 1,
  "taskId": "pv-t1",
  "buildPlan": "docs/plans/2026-07-12-sdlc-portable-validator-build.md",
  "repoRoot": ".",
  "ownedScenarios": ["PV1", "PV3"],
  "checks": [
    {
      "id": "tests.contract",
      "argv": ["node", "--test", "test/validator-contract.test.js"],
      "timeoutMs": 120000,
      "evidence": ["PV1 and PV3 contract scenarios"]
    },
    {
      "id": "static.lint",
      "argv": ["npm", "run", "lint"],
      "evidence": ["Repository lint and formatting rules"]
    },
    {
      "id": "patterns.diff",
      "argv": ["node", "test/fixtures/check-banned-patterns.mjs"],
      "evidence": ["No task-prohibited patterns in the diff"]
    }
  ],
  "categories": {
    "tests": {
      "applicability": "required",
      "checkIds": ["tests.contract"]
    },
    "static": {
      "applicability": "required",
      "checkIds": ["static.lint"]
    },
    "scenarios": {
      "applicability": "required",
      "evidence": {
        "PV1": ["tests.contract"],
        "PV3": ["tests.contract"]
      }
    },
    "standards": {
      "applicability": "n/a",
      "reason": "No additional greppable standard applies beyond declared lint checks."
    },
    "bannedPatterns": {
      "applicability": "required",
      "checkIds": ["patterns.diff"]
    }
  }
}
```

Normative TypeScript description:

```ts
type Applicability = "required" | "n/a";
type CategoryName =
  | "tests"
  | "static"
  | "scenarios"
  | "standards"
  | "bannedPatterns";

type CommandCheck = {
  id: string;
  argv: [string, ...string[]];
  timeoutMs?: number;
  evidence: [string, ...string[]];
};

type CommandCategory =
  | { applicability: "required"; checkIds: [string, ...string[]] }
  | { applicability: "n/a"; reason: string };

type ScenarioCategory =
  | {
      applicability: "required";
      evidence: Record<string, [string, ...string[]]>;
    }
  | { applicability: "n/a"; reason: string };

type TaskValidationManifestV1 = {
  schemaVersion: 1;
  taskId: string;
  buildPlan: string;
  repoRoot: ".";
  ownedScenarios: string[];
  checks: CommandCheck[];
  categories: {
    tests: CommandCategory;
    static: CommandCategory;
    scenarios: ScenarioCategory;
    standards: CommandCategory;
    bannedPatterns: CommandCategory;
  };
};
```

No additional properties are allowed at any level in PV1 schema version 1.

### 1.3 Field constraints

- `taskId`: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 64 characters.
- `buildPlan`: non-empty, repo-relative POSIX path, no `..`, and must resolve to
  an existing file inside repo root.
- `repoRoot`: exactly `"."` in version 1.
- `ownedScenarios`: unique stable ids matching `^[A-Z][A-Z0-9]*[0-9]+$`, sorted
  lexicographically. Empty is allowed only when scenarios is `n/a`.
- `checks`: one or more entries, unique `id`, array order is execution order.
- Check `id`: `^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$`, max 80 characters.
- `argv`: one or more non-empty single-line strings; no NUL. It is executed as
  executable + argument array, never through a shell.
- `timeoutMs`: integer 1,000–600,000; default 120,000.
- `evidence`: one or more unique single-line labels, each 1–160 characters,
  naming the scenario, governing rule, standard, or prohibited-pattern contract
  the command evidences. Labels are reported but not semantically judged by the
  runner.
- Required command-category `checkIds`: unique, non-empty, preserve manifest
  order, and every id must reference a declared check.
- N/A category: exactly `applicability` + a non-empty single-line `reason` of at
  least 12 characters; no `checkIds` or `evidence`.
- Every declared check is referenced by at least one required category.
- At least one category references a required check; because `checks` is
  non-empty and unreferenced checks are invalid, every valid manifest has a
  mechanically executable gate.

### 1.4 Scenario rules

- If `ownedScenarios` is non-empty, scenarios must be required.
- Required scenario `evidence` keys equal `ownedScenarios` exactly: no missing,
  unknown, or additional scenario.
- Each evidence value is a non-empty unique list of declared check ids.
- Every mapped check must be referenced by at least one required command
  category and must PASS for the scenario to PASS.
- If `ownedScenarios` is empty, scenarios must be N/A with a Build-approved
  reason; an empty required evidence object is invalid.
- The runner proves mapping and command outcome only. Human Build approval owns
  the semantic judgement that a command genuinely exercises its mapped
  scenario.

### 1.5 Category rules

All five category keys are mandatory and no extra category is accepted.

- `tests`: behavioural commands or N/A reason for tasks with no behavioural
  execution (for example a pure ADR task whose docs checks live under static).
- `static`: syntax, type, lint, format, compile, schema, or docs/link checks.
- `scenarios`: exact ownership/evidence mapping per §1.4.
- `standards`: commands enforcing configured governing standards, or N/A reason.
- `bannedPatterns`: commands that exit nonzero on prohibited task-diff patterns,
  or N/A reason approved by Build.

The runner does not assess whether an N/A reason or evidence label is
persuasive; JSON Schema ensures it is present/structural, while Build panel/human
approval governs substance. The validator cannot create or alter N/A.

Category/applicability are normalised through the `categories` map rather than
duplicated on each check. This is the normative PV1 projection of the Plan's
per-entry category/applicability description; one check may support multiple
categories while retaining one argv and evidence-label set.

## 2. Deterministic runner contract (PV2)

### 2.1 Invocation

```text
validate-task.sh --manifest PATH [--repo-root DIR] [--format text|json] [--report PATH]
validate-task.mjs --manifest PATH [--repo-root DIR] [--format text|json] [--report PATH]
```

- `--manifest` is required.
- `--repo-root` defaults through existing consumer-root resolution; explicit
  value must be an absolute or cwd-relative repo root.
- `--format` defaults to text; values are `text` or `json`.
- `--report` is optional and names a repo-contained output file for the exact
  JSON report, regardless of text/stdout format. Its parent must already exist.
  The runner writes a temporary sibling, fsyncs/closes it, then renames atomically.
  Write failure is exit 2/ERROR and is also reported on stdout when possible.
- `--help`/`-h` prints usage and exits 0 without validation.
- Unknown/duplicate flags, missing values, extra positionals, or conflicting
  formats exit 2.
- Full argv is pre-scanned for a valid `--format json` pair so argument errors
  emit JSON independent of flag order.

### 2.2 Exit and verdict

| Exit | Verdict | Meaning |
|---|---|---|
| 0 | `PASS` | Manifest valid and every required command/category/scenario passed. |
| 1 | `FAIL` | Manifest valid, but a command/category/scenario failed or timed out. |
| 2 | `ERROR` | CLI, manifest read/parse/schema, root, runner, or report-write error. |

Invalid manifests are ERROR, never N/A or PASS. Any nonzero exit blocks task
completion.

### 2.3 Execution

1. Resolve and canonicalise repo root; manifest and build-plan paths must stay
   inside it after realpath.
2. Read and validate manifest against the committed PV1 JSON Schema plus §1
   cross-field rules. Run no task command if invalid.
3. Execute `checks` sequentially in manifest order using Node child-process argv
   APIs with `shell: false`, cwd equal canonical repo root, inherited environment,
   and the declared/default timeout.
4. Missing executable, signal, timeout, or nonzero exit makes that check FAIL.
   Continue later checks to provide complete evidence; no fail-fast mode exists
   in PV2 v1.
5. Evaluate category results and scenarios after all commands finish.

The runner executes no undeclared command and performs no command substitution,
fallback, package installation, network call of its own, or shell expansion.
A declared command may itself use the network; Build must not declare such a
command where the task forbids it.

### 2.4 Evidence capture

For each command, capture stdout and stderr separately.

1. Build the redaction value set from non-empty environment values of at least
   four characters whose variable name contains a credential token delimited by
   start/end or underscore, using case-insensitive
   `(^|_)(KEY|TOKEN|SECRET|PASSWORD|PASSWD|AUTH|CREDENTIALS?)(_|$)`.
   This matches names such as `OPENAI_API_KEY`, `OAUTH_TOKEN`, and
   `AWS_SECRET_ACCESS_KEY`, but not `MONKEY`, `AUTHOR`, or `KEYBOARD`.
2. Sort values longest first and replace every exact occurrence in argv display,
   stdout, stderr, and error messages with `[REDACTED]`.
3. Do not read credential/auth files.
4. Decode each full stream with UTF-8 replacement, normalise CRLF to LF, then
   redact before selecting tails.
5. Bound stdout independently to its last 100 lines and at most 10,240 UTF-8
   bytes; then bound stderr by the same independent limits. There is no
   cross-stream borrowing in PV2 v1. A line is text between LF delimiters; a
   final unterminated segment counts as one line.
6. If a stream exceeds either limit, repeatedly remove complete leading lines
   until line count fits, then remove leading Unicode scalar values until the
   UTF-8 byte limit fits after reserving marker cost. Prefix exactly
   `[...truncated; showing bounded tail...]\n`. The marker counts as one line and
   its UTF-8 bytes count inside that stream's 100-line/10,240-byte limit.
7. Combined per-check output therefore never exceeds 200 lines or 20,480 bytes.
   The final redacted/truncated strings are the strings serialized in reports.

The manifest itself must not contain secrets. Redaction is defence in depth, not
a licence to place credentials in argv.

### 2.5 JSON output

```ts
type RunnerVerdict = "PASS" | "FAIL" | "ERROR";
type ResultStatus = "PASS" | "FAIL" | "N/A";

type CommandResult = {
  id: string;
  argv: string[];
  evidence: string[];
  status: "PASS" | "FAIL";
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  durationMs: number;
  stdoutTail: string;
  stderrTail: string;
};

type CategoryResult = {
  category: CategoryName;
  status: ResultStatus;
  reason?: string;
  checkIds?: string[];
};

type ScenarioResult = {
  scenarioId: string;
  status: "PASS" | "FAIL";
  checkIds: string[];
};

type TaskValidationReportV1 = {
  schemaVersion: 1;
  taskId: string | null;
  manifest: string;
  repoRoot: string;
  verdict: RunnerVerdict;
  exitCode: 0 | 1 | 2;
  errors: string[];
  manifestErrors: string[];
  commands: CommandResult[];
  categories: CategoryResult[];
  scenarios: ScenarioResult[];
};
```

- Exact top-level/child fields only; no additional properties.
- `manifest` and `repoRoot` are absolute canonical paths.
- `errors` carries deterministic CLI/root/execution/report-write ERROR messages;
  `manifestErrors` carries manifest read/parse/schema/cross-field errors.
  ERROR has at least one entry across the two arrays; commands/categories/
  scenarios are empty when validation never began.
- JSON Schema errors use AJV-compatible instance pointers. Cross-field errors
  use this fixed rule order and pointer: unreferenced/dangling check
  `/checks`; category applicability/reference `/categories/<name>`; scenario
  ownership/key equality `/categories/scenarios/evidence`; scenario mapped to
  non-required check `/categories/scenarios/evidence/<escaped-id>`; build-plan/
  repo path `/buildPlan` or `/repoRoot`. Within one pointer, messages sort
  lexicographically.
- Commands use manifest order; categories use canonical five-category order;
  scenarios use sorted `ownedScenarios` order.
- `durationMs` is a non-negative integer and is the only intentionally
  nondeterministic value; golden tests normalise it to zero before comparison.
- After JSON mode recognition, exits 0–2 write one JSON object plus newline to
  stdout and nothing to stderr. With `--report`, the same JSON bytes (including
  trailing newline) are atomically persisted. A report-write failure returns an
  ERROR envelope on stdout with `errors` populated; no successful report file is
  left at the target path.

### 2.6 Text output

Text is a line-oriented rendering of the same report:

```text
task: pv-t1
manifest: /abs/repo/docs/validation/portable-validator/pv-t1.json
verdict: PASS
exit-code: 0
command: tests.contract PASS exit=0 timeout=false
category: tests PASS checks=tests.contract
scenario: PV1 PASS checks=tests.contract
```

- First four lines are task, manifest, verdict, exit-code.
- ERROR before task id uses `task: unknown`.
- Evidence tails follow a command line under `stdout:` / `stderr:` fenced blocks
  only when non-empty.
- N/A category line is `category: <name> N/A reason=<single-line reason>`.
- Text and JSON contain equivalent facts.

## 3. Validator subagent contract (FS7-compatible)

### 3.1 Preserved headings

The generic prompt retains verbatim and in order:

1. `## Inputs the caller gives you`
2. `## Checks (run every one; do not skip)`
3. `## Output format (STRICT: markdown only)`

No required FS7 heading changes; consumer override heading compatibility remains.

### 3.2 Inputs

The caller supplies:

- repo root;
- task id;
- approved Build-plan path;
- committed manifest path;
- runner-report artifact path;
- optional governing context for narration only.

`<CONTRIBUTORS_PATH>` is removed from generic input. Governing standards are
represented by the manifest's `standards` category/checks. This child owns that
neutralisation; normative-reference child work must not repeat it.

### 3.3 Required behaviour

The validator:

1. Confirms task id/build-plan/manifest paths match caller inputs.
2. Runs exactly:
   `validate-task.sh --manifest <path> --repo-root <root> --format json --report
   <runner-report-artifact>`. The runner, not the model, atomically persists the
   report; stdout must be byte-identical to that file.
3. Confirms process exit and report verdict agree.
4. Reports every command/category/scenario result from the report.
5. Returns overall PASS only for runner exit 0/verdict PASS.
6. Returns FAIL for runner FAIL or ERROR, report mismatch, missing report, or any
   attempt/instruction to bypass the runner.

It does not separately run commands, alter the manifest, decide N/A, reinterpret
scenario semantics, review quality, or suggest fixes beyond exact reproduction.

### 3.4 Markdown output

```markdown
### Validation: <task-id>

- manifest: `<repo-relative path>`
- runner: PASS | FAIL | ERROR — exit <code>
- report: `<repo-relative artifact path>`
- commands: <id=status, ...>
- categories: <name=status, ...>
- scenarios: <id=status, ...>

### Verdict: PASS | FAIL
```

On FAIL, append only failed/error result IDs and exact runner reproduction
command. No praise or quality opinion.

## 4. Runtime receipt contract

Each task stores under:

```text
docs/reviews/task-validate-<feature>-<task-id>-<date>/
```

Required files:

- `manifest.json` — byte-identical copy of the committed task manifest;
- `runner-report.json` — atomically written PV2 JSON output;
- `generated-agent.md` — byte-identical copy of the effective generated validator
  agent used for dispatch (stored as evidence, not under `.pi/agents/` and not a
  canonical prompt source);
- `validator.md` — subagent markdown output;
- `receipt.json`:

```json
{
  "schemaVersion": 1,
  "taskId": "pv-t1",
  "manifestPath": "docs/validation/portable-validator/pv-t1.json",
  "manifestSha256": "<64 lowercase hex>",
  "runnerReportSha256": "<64 lowercase hex>",
  "generatedAgentSha256": "<64 lowercase hex>",
  "model": "provider/model[:thinking]",
  "runnerVerdict": "PASS",
  "validatorVerdict": "PASS",
  "createdAt": "<ISO-8601 UTC>"
}
```

Task completion requires both verdicts PASS and hashes matching stored
manifest, runner report, and `generated-agent.md`; the agent copy hash must also
match the dispatch source at validation time. This receipt is runtime gate
evidence, not proof that an LLM is deterministic.

## 5. Bootstrap and sibling re-approval

### 5.1 First-task cut-over

The first portable-validator implementation task atomically delivers:

- PV1 schema and fixtures;
- PV2 runner/wrapper and offline tests;
- updated generic prompt/SKILL law;
- generated-agent golden.

After its declared offline commands PASS, the orchestrator runs
`ensure-panel-agent.sh task_validate --force` from that worktree, hashes the
result, dispatches the configured validator against the first manifest, and
stores the §4 receipt. The end-of-task gate therefore uses the new worktree
contract. No old fixed-TypeScript prompt or temporary N/A exception is used.

### 5.2 Consumer overrides

Migration docs state that whole-file validator overrides retain heading
compatibility but must adopt the PV1/PV2 invocation contract before use. The
generic generator cannot rewrite semantic content inside an override. A project
using a stale override must update it or explicitly return to the generic prompt;
it cannot claim portable validation merely because headings match.

### 5.3 Adoption Readiness re-projection

After this PR merges, the orchestrating agent:

1. writes PV1 manifests for Adoption Readiness tasks T1–T5 from its canonical
   approved Build plan;
2. refreshes issues #7–#11 with manifest links/applicability;
3. updates its Build blocker text to the merged PV1/PV2 contract;
4. presents the refreshed canonical Build and tracker projection to Neil
   Chambers;
5. keeps every item Blocked until renewed approval.

This is a re-opened Build human gate, not an automatic mechanical migration.

## 6. Generic `SKILL.md` law

The `## Per-task validator (implementation)` section is replaced with normative
language that:

- requires the committed PV1 manifest produced by approved Build;
- requires the PV2 runner and runtime receipt;
- states that Build, not the validator, owns commands and N/A;
- contains no unconditional language/tool command, including
  `npx tsc --noEmit`;
- contains no `CONTRIBUTORS`/`<CONTRIBUTORS_PATH>` assumption;
- preserves one-validator mechanistic semantics and makes nonzero runner result
  block task completion;
- directs quality judgement to the PR panel.

A red flag is added for bypassing PV2, editing a manifest during implementation
without Build re-approval, running undeclared commands as gate substitutes, or
allowing a stale consumer override to claim portable validation.

## 7. Non-functional and security requirements

- No runtime dependency beyond Node standard library.
- JSON Schema may be validated by the existing dev-only AJV in tests; runtime
  validation remains dependency-free and semantically identical.
- Runner itself makes no network/model/credential-file call.
- Child commands are sequential and bounded by timeout.
- Report writes are atomic (temporary sibling + rename) when the runner writes a
  requested artifact; stdout-only mode performs no report write.
- Paths are realpath-checked inside repo root; manifest cannot select another cwd.
- Command uses `shell:false`; argv strings are never concatenated into shell
  source.
- Existing model roster/resolution, validator preference, generated-agent name/
  tools, and plan/spec/PR prompts remain unchanged.

## 8. Verification scenarios

### PV1 — JavaScript manifest runs only declared checks

A valid JS fixture declares Node test, `node --check`, and lint argv; TypeScript
is N/A with a Build reason represented under static only by the declared JS
checks. Runner executes only listed argv in order and passes.

Falsify: undeclared `tsc`/command runs, order changes, or N/A becomes PASS.

### PV2 — TypeScript and non-Node manifests stay project-specific

A TS fixture explicitly declares `npx tsc --noEmit`; a non-Node fixture declares
a local stub executable. Each runs only its own argv. Removing the TS command
from the manifest means it does not run.

Falsify: generic tool injection or substitution.

### PV3 — Malformed manifests error before execution

Mutation table: missing/extra category, duplicate/invalid check id, empty argv,
shell string instead of argv, bad timeout, missing/short N/A reason, dangling or
unreferenced check, extra property, bad path, non-object JSON. Each exits 2/
ERROR with deterministic pointer error and zero commands.

Falsify: any command runs or invalid manifest passes/fails as command failure.

### PV4 — Command failures are complete and deterministic

Fixtures cover exit 0, nonzero, missing executable, signal, timeout, stdout/
stderr. Runner continues later checks, reports each result, and returns exit 1
when any required command fails.

Falsify: fail-fast, wrong exit/verdict, or missing evidence.

### PV5 — Category applicability is exact

Required categories reference valid checks; N/A categories require reason and
have no checkIds/evidence. Missing category and validator-authored/injected N/A
mutations are rejected by schema/report comparison.

Falsify: absent category or unapproved N/A yields PASS.

### PV6 — Scenario mapping gates verdict

Required scenarios exactly equal owned scenarios and map to passing required
checks. Missing/extra/unknown/N/A/failing mappings produce ERROR for structural
invalidity or FAIL for failed mapped checks as specified.

Falsify: unmapped or failed scenario passes.

### PV7 — Standards and banned patterns are commands, not judgement

Fixtures declare deterministic grep/stub commands for standards and patterns;
violations exit nonzero and fail. N/A variants require reasons. Validator does
not inspect an undeclared governing file itself.

Falsify: agent opinion overrides runner result or stale `<CONTRIBUTORS_PATH>`
remains generic law.

### PV8 — Evidence is bounded and redacted

Commands emit >200 lines, >20 KiB, stdout/stderr mixtures, invalid UTF-8, and
credential-pattern env sentinels. Reports obey exact per-stream/total tail rules,
include marker, redact every sentinel/argv occurrence, and never read auth files.

Falsify: bound exceeded, sentinel leaked, or nondeterministic marker/order.

### PV9 — JSON/text/exit contracts agree

Golden outputs cover PASS/FAIL/ERROR and argument-order errors. After JSON mode
recognition, one object goes to stdout and stderr is empty. Text has equivalent
facts. Normalising duration to zero makes repeated reports byte-identical.

Falsify: shape drift, invalid JSON, or fact mismatch.

### PV10 — Prompt and panel compatibility

Generated task-validator agent preserves name/tools and all three FS7 headings,
contains runner-only behaviour, and omits unconditional `npx tsc --noEmit` and
`<CONTRIBUTORS_PATH>`. `SKILL.md` carries every §6 law/red-flag requirement and
contains no unconditional `npx tsc --noEmit` or `CONTRIBUTORS` assumption.
Task-validator model-resolution golden and all other phase goldens remain
unchanged. Mutation tests remove each SKILL law item and must fail.

Falsify: heading/golden drift, missing SKILL law/red flag, or old command/
reference remains in generic law.

### PV11 — Self-hosted receipt is verifiable

Offline fixtures prove receipt schema and hash verification, including the
stored `generated-agent.md`; mutation of any stored hashed file fails. At runtime,
first-task checks pass, the new agent is generated/copied, runner and validator
pass, and receipt records actual model/time. Runtime model facts are gate evidence
and are not asserted by paid-call-free automated tests.

Falsify: old prompt used, missing receipt, verdict mismatch, or hash mutation
undetected.

### PV12 — Adoption Readiness remains blocked pending re-approval

After merge, manifests/issues #7–#11 are refreshed, but board items remain
Blocked until Neil Chambers approves the renewed Build. Before approval, no
claim/implementation begins.

Falsify: item leaves Blocked or implementation begins before re-approval.

### PV13 — Full regression and no paid test calls

`npm test` and `npm run lint` pass; validator contract fixtures run offline;
existing panel/config/model tests stay green; no automated test invokes a model
or network.

Falsify: regression or live call.

## 9. Platform contract

PV2 is language/ecosystem portable, not an implicit shell portability layer.
On POSIX, executable lookup follows the inherited PATH. On Windows with
`shell:false`, manifests must declare an actually executable path (`node.exe`,
an absolute executable, or an explicit `cmd.exe /d /s /c <tool>.cmd ...` argv)
when a package-manager shim is a `.cmd` file. The runner never silently inserts
`cmd.exe` or changes argv. Platform-specific manifests/checks are a Build concern.

## 10. Out of scope

Build authoring templates; automatic semantic comparison between Build prose and
manifest; durable lifecycle-wide receipts beyond task validation; author-model
selection; panel vendor invariants; tracker redesign; parallel command execution;
shell-string commands; arbitrary-secret detection beyond protected environment
values; or quality judgement.
