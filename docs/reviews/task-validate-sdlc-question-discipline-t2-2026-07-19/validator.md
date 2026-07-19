Task: Validate build task t2 of feature sdlc-question-discipline (issue #117) in repo root /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline (branch feat/sdlc-question-discipline, HEAD commit 2699186).
Run the deterministic runner exactly:
cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline && skills/sdlc/scripts/validate-task.sh --manifest docs/validation/sdlc-question-discipline/t2.json --slug sdlc-question-discipline --format json --report docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json
You are a checklist executor, not a judge: do not invent commands, weaken checks, or decide applicability — the manifest owns all of that. Confirm the process exit code and the report's verdict field agree, then report: the verdict (PASS/FAIL/ERROR), each category's status, each check id with its status, and any stderr diagnostics. If exit code and report verdict disagree, report that discrepancy explicitly and treat the run as ERROR. Do not edit any files.
## Acceptance Contract
Acceptance level: attested
Completion is not accepted from prose alone. End with a structured acceptance report.
Criteria:
- criterion-1: Return concrete findings with file paths and severity when applicable
Required evidence: review-findings, residual-risks
Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
`criteriaSatisfied[].status` must be exactly one of: satisfied, not-satisfied, not-applicable.
`commandsRun[].result` must be exactly one of: passed, failed, not-run.
`manualNotes` and `notes` are optional strings; an empty string means no note and does not satisfy `manual-notes` evidence.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```
read: docs/validation/sdlc-question-discipline/t2.json
ls: skills/sdlc/scripts
{
  "schemaVersion": 1,
  "taskId": "t2",
  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
  "repoRoot": ".",
  "ownedScenarios": [],
  "checks": [
    {
      "id": "tests.full",
      "argv": ["npm", "test"],
      "timeoutMs": 300000,
      "evidence": ["Full corpus green with all six phase deltas (disposition-ledger anchor test included)"]
    },
    {
      "id": "static.lint",
      "argv": ["npm", "run", "lint"],
      "timeoutMs": 120000,
      "evidence": ["Repository formatting and lint rules"]
    },
    {
      "id": "standards.all-six-deltas",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
      ],
      "evidence": ["Every phase reference layers its delta over the shared contract (plan DoD 2)"]
    },
    {
      "id": "standards.pr-template-repo",
      "argv": ["grep", "-q", "Assumptions & discretionary calls", ".github/pull_request_template.md"],
      "evidence": ["Repo PR template carries the assumptions section (plan DoD 4)"]
    },
    {
      "id": "standards.pr-template-asset",
      "argv": ["grep", "-q", "Assumptions & discretionary calls", "skills/sdlc/assets/pull_request_template.md"],
      "evidence": ["Setup-provisioned PR template carries the assumptions section (plan DoD 4)"]
    },
    {
      "id": "standards.panel-input-naming",
      "argv": ["grep", "-qF", "input to** the PR panel", "skills/sdlc/references/phase-pr-review.md"],
      "evidence": ["phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"]
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
      ],
      "evidence": ["Tool-dependent phrasing absent across the skill (plan DoD 3)"]
    },
    {
      "id": "patterns.diff",
      "argv": ["git", "diff", "--check", "HEAD"],
      "evidence": ["No whitespace-error banned patterns in the task diff"]
    }
  ],
  "categories": {
    "tests": {
      "applicability": "required",
      "checkIds": ["tests.full"]
    },
    "static": {
      "applicability": "required",
      "checkIds": ["static.lint"]
    },
    "scenarios": {
      "applicability": "n/a",
      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
    },
    "standards": {
      "applicability": "required",
      "checkIds": ["standards.all-six-deltas", "standards.pr-template-repo", "standards.pr-template-asset", "standards.panel-input-naming"]
    },
    "bannedPatterns": {
      "applicability": "required",
      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
    }
  }
}
check-completion.mjs
check-completion.sh
check-lifecycle.mjs
check-lifecycle.sh
check-references.mjs
check-references.sh
check-schema-break.mjs
config-doc.mjs
config-doc.sh
ensure-panel-agent.mjs
ensure-panel-agent.sh
harvest-panel.mjs
harvest-panel.sh
lib.mjs
record-run-event.mjs
record-run-event.sh
resolve-panel.mjs
resolve-panel.sh
sdlc-status.mjs
sdlc-status.sh
setup-sdlc.mjs
setup-sdlc.sh
telemetry.mjs
validate-task.mjs
validate-task.sh
verify-task-receipt.mjs
read: skills/sdlc/scripts/validate-task.sh
#!/usr/bin/env bash
# validate-task.sh — thin entry point for the deterministic per-task validation
# runner (PV2). All logic lives in validate-task.mjs.
#
# Usage: validate-task.sh --manifest PATH [--repo-root DIR] [--format text|json] [--report PATH]
# Exit: 0 PASS; 1 FAIL; 2 ERROR (CLI/manifest/root/runner/report-write).
set -euo pipefail
exec node "$(dirname "$0")/validate-task.mjs" "$@"
grep: skills/sdlc/scripts/validate-task.mjs
validate-task.mjs-6- // credential-file access. No runtime dependencies.
validate-task.mjs-7- //
validate-task.mjs:8: // --slug is additive (FS13 lt-t2): after the report is computed (regardless
validate-task.mjs-9- // of --report), emits task.validated to the resolved run's manifest
validate-task.mjs-10- // (fail-soft; never alters stdout bytes or the exit code, NF3).
validate-task.mjs-104- 	}
validate-task.mjs-105- 	const allowed = new Set(["schemaVersion", "taskId", "buildPlan", "repoRoot", "ownedScenarios", "checks", "categories"]);
validate-task.mjs:106: 	for (const k of Object.keys(raw)) if (!allowed.has(k)) add(`/${k}`, `unknown property '${k}'`);
validate-task.mjs-107- 
validate-task.mjs-108- 	if (raw.schemaVersion !== 1) add("/schemaVersion", "must be 1");
validate-task.mjs-125- 				return;
validate-task.mjs-126- 			}
validate-task.mjs:127: 			for (const k of Object.keys(c)) if (!["id", "argv", "timeoutMs", "evidence"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
validate-task.mjs-128- 			if (typeof c.id !== "string" || !ID_RE.test(c.id) || c.id.length > 80) add(`${at}/id`, "invalid check id");
validate-task.mjs-129- 			else {
validate-task.mjs-171- 		add("/categories", "must be an object with all five categories");
validate-task.mjs-172- 	} else {
validate-task.mjs:173: 		for (const k of Object.keys(raw.categories)) if (!CATEGORY_ORDER.includes(k)) add(`/categories/${k}`, `unknown category '${k}'`);
validate-task.mjs-174- 		for (const name of COMMAND_CATEGORIES) {
validate-task.mjs-175- 			const cat = raw.categories[name];
validate-task.mjs-180- 			}
validate-task.mjs-181- 			if (cat.applicability === "required") {
validate-task.mjs:182: 				for (const k of Object.keys(cat)) if (!["applicability", "checkIds"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
validate-task.mjs-183- 				if (!Array.isArray(cat.checkIds) || cat.checkIds.length === 0) add(`${at}/checkIds`, "required category needs a non-empty checkIds");
validate-task.mjs-184- 				else {
validate-task.mjs-192- 				}
validate-task.mjs-193- 			} else if (cat.applicability === "n/a") {
validate-task.mjs:194: 				for (const k of Object.keys(cat)) if (!["applicability", "reason"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
validate-task.mjs-195- 				if (typeof cat.reason !== "string" || !LABEL_RE.test(cat.reason) || cat.reason.length < 12) add(`${at}/reason`, "n/a category needs a single-line reason of at least 12 characters");
validate-task.mjs-196- 			} else {
validate-task.mjs-205- 			add(at, "missing or invalid scenarios category");
validate-task.mjs-206- 		} else if (sc.applicability === "required") {
validate-task.mjs:207: 			for (const k of Object.keys(sc)) if (!["applicability", "evidence"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
validate-task.mjs-208- 			if (owned.length === 0) add(at, "scenarios must be n/a when ownedScenarios is empty");
validate-task.mjs-209- 			if (!isPlainObject(sc.evidence)) {
validate-task.mjs-213- 				const ownedSet = new Set(owned);
validate-task.mjs-214- 				for (const s of owned) if (!keys.includes(s)) add(`${at}/evidence`, `missing scenario mapping for '${s}'`);
validate-task.mjs:215: 				for (const k of keys) if (!ownedSet.has(k)) add(`${at}/evidence`, `evidence maps unknown scenario '${k}'`);
validate-task.mjs-216- 				for (const [k, v] of Object.entries(sc.evidence)) {
validate-task.mjs-217- 					if (!Array.isArray(v) || v.length === 0) {
validate-task.mjs-229- 			}
validate-task.mjs-230- 		} else if (sc.applicability === "n/a") {
validate-task.mjs:231: 			for (const k of Object.keys(sc)) if (!["applicability", "reason"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
validate-task.mjs-232- 			if (owned.length > 0) add(at, "scenarios cannot be n/a while ownedScenarios is non-empty");
validate-task.mjs-233- 			if (typeof sc.reason !== "string" || !LABEL_RE.test(sc.reason) || sc.reason.length < 12) add(`${at}/reason`, "n/a scenarios need a single-line reason of at least 12 characters");
validate-task.mjs-382- export function renderText(report) {
validate-task.mjs-383- 	const lines = [];
validate-task.mjs:384: 	lines.push(`task: ${report.taskId ?? "unknown"}`);
validate-task.mjs-385- 	lines.push(`manifest: ${report.manifest}`);
validate-task.mjs-386- 	lines.push(`verdict: ${report.verdict}`);
validate-task.mjs-444- 		};
validate-task.mjs-445- 		if (a === "--manifest") opts.manifest = val();
validate-task.mjs:446: 		else if (a === "--repo-root") opts.repoRoot = val();
validate-task.mjs-447- 		else if (a === "--report") opts.report = val();
validate-task.mjs-448- 		else if (a === "--slug") opts.slug = val();
validate-task.mjs-446- 		else if (a === "--repo-root") opts.repoRoot = val();
validate-task.mjs-447- 		else if (a === "--report") opts.report = val();
validate-task.mjs:448: 		else if (a === "--slug") opts.slug = val();
validate-task.mjs-449- 		else if (a === "--format") {
validate-task.mjs-450- 			const f = val();
validate-task.mjs-466- 	}
validate-task.mjs-467- 	if (opts.help) {
validate-task.mjs:468: 		console.log("usage: validate-task.sh --manifest PATH [--repo-root DIR] [--format text|json] [--report PATH] [--slug S]");
validate-task.mjs-469- 		process.exit(0);
validate-task.mjs-470- 	}
validate-task.mjs-490- 		emitEvent({
validate-task.mjs-491- 			event: "task.validated",
validate-task.mjs:492: 			slug: opts.slug,
validate-task.mjs-493- 			by: "script:validate-task",
validate-task.mjs-494- 			payload: { task: report.taskId, verdict: report.verdict, scenarioIds: report.scenarios.map((s) => s.scenarioId) },
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
{
  "schemaVersion": 1,
  "taskId": "t2",
  "manifest": "/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline/docs/validation/sdlc-question-discipline/t2.json",
  "repoRoot": "/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline",
  "verdict": "PASS",
  "exitCode": 0,
  "errors": [],
  "manifestErrors": [],
  "commands": [
    {
      "id": "tests.full",
      "argv": [
        "npm",
        "test"
      ],
      "evidence": [
        "Full corpus green with all six phase deltas (disposition-ledger anchor test included)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 15627,
      "stdoutTail": "[...truncated; showing bounded tail...]\n✔ LT18: soft data carries attribution and matches the fixture LLM's scripted responses (324.03675ms)\n✔ LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number (113.956463ms)\n✔ LT19: --no-llm (noLlm:true) output validates and carries soft.absent (23.604567ms)\n✔ LT17: --from-raw reproduces a byte-identical run.json after live sources are destroyed (507.300204ms)\n✔ LT28: neither the sentinel secret nor the verbatim prompt sentence appears in run.json (196.836588ms)\n✔ NF4 unit: sanitizeSoftString redacts, rejects n-gram containment, and caps at 500 chars (0.283826ms)\n✔ LT29: a failing --gh-cmd yields github.error, schema-valid, no fabricated PR data (109.395213ms)\n✔ LT29: an --llm-cmd returning invalid JSON yields llm.error:narrative, schema-valid, no fabricated summary (239.598723ms)\n✔ LT29: an --llm-cmd that times out yields llm.error:<kind>, schema-valid, exit unaffected (628.505342ms)\n✔ llm-protocol schema: request/response fixtures validate (2.005936ms)\n✔ LT13 (hard): complete fixture store -> schema-valid run.json with known-answer rollups (356.546516ms)\n✔ LT14: a gappy store names every gap and derives nothing from missing sources (209.335573ms)\n✔ LT14: --no-github records github.skipped, not github.error (14.185041ms)\n✔ LT15: manifest adapter skips and counts malformed lines (manifest.partial) (10.675306ms)\n✔ LT15: harvest adapter maps per-model fields correctly (6.555921ms)\n✔ LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file (4.947708ms)\n✔ LT15: review-dir discovery matches <phase>-<slug>-<date> naming (6.343116ms)\n✔ LT15: git/GitHub adapters consume only the injected fakes (294.131439ms)\n✔ LT16: phase attribution, agent time, capped human-wait, rework, window bounds (10.213665ms)\n✔ LT16: a 3-hour gap contributes exactly 30 minutes to human-wait (22.64343ms)\n✔ collect-run: no run store exits 1 (nothing collectable) (189.93837ms)\n✔ collect-run: writes docs/retros/<slug>/run.json by default and validates (118.9903ms)\n✔ resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved (0.988768ms)\n✔ LT24: every mandated hook step names record-run-event.sh and its event-type token together (6.297077ms)\n✔ LT24: the panel-dispatch step and the validator-dispatch step each name harvest-panel.sh (0.434678ms)\n✔ LT24: sdlc-retro SKILL.md names collect and render invocations skill-relatively (FS12 forms) (0.185736ms)\n✔ LT25: check-references passes with the new inventory entries (213.372608ms)\n✔ LT25: deleting a new entry's target file fails check-references (361.282219ms)\n✔ structural coverage: every sdlc-retro script has an FS11 inventory entry (0.481045ms)\n✔ structural coverage: every hook script named by §4 has an FS11 inventory entry (0.892157ms)\n✔ structural coverage: every committed sdlc-retro schema file has an FS11 inventory entry (0.896637ms)\n✔ structural coverage: ADR 0028 has an FS11 inventory entry and exists (2.02459ms)\n✔ structural coverage: every run-store/retro path named normatively by either SKILL.md has an inventory entry (0.468488ms)\n✔ LT27: docs/retros/sdlc-lifecycle-telemetry/run.json and index.html exist (1.783118ms)\n✔ LT27: the dogfood run.json validates against the committed schema and hand-rolled validator (6.019525ms)\n✔ LT27: coverage markers honestly record the pre-instrumentation gap (partial coverage by design) (0.375417ms)\n✔ LT27: the committed dashboard renders all seven anchors for the dogfood run (0.381257ms)\n✔ LT1: valid emit appends one schema-conforming line, creating the store (185.622238ms)\n✔ LT1b: --by defaults to agent when omitted (152.562238ms)\n✔ LT2: bad inputs exit 2 and never touch the manifest (970.786954ms)\n✔ schema agreement: unknown event types remain valid for forward-compatible consumers (0.700568ms)\n✔ LT2b: a bad input against a non-existent store attempts no write (116.025957ms)\n✔ LT3: concurrent emitters produce N complete, non-interleaved lines (381.151332ms)\n✔ empty explicit identities do not fall through to another identity (264.090821ms)\n✔ LT4: --slug beats env beats branch mapping (378.95259ms)\n✔ LT5: unresolvable identity skips (exit 0, one warning, no write) (282.771149ms)\n✔ LT26: .gitignore ignores the run store (6.97599ms)\n✔ emitter: .sh wrapper delegates to .mjs identically (99.233423ms)\n✔ vocabulary: every known event has a payload descriptor (0.260209ms)\n✔ LT11: harvest copies status.json + events.jsonl and emits panel.harvested (167.299955ms)\n✔ LT11: --with-transcripts copies the transcripts/ subdirectory (103.474477ms)\n✔ LT12: a missing source directory exits 0 with both files missed (184.589666ms)\n✔ LT12: a partially-present source (status without events) reports one missed (91.076416ms)\n✔ harvest-panel: unknown phase and non-positive round exit 2 (340.993253ms)\n✔ harvest-panel.sh wrapper delegates to .mjs identically (119.382223ms)\n✔ LT20: full fixture renders all seven anchors with known-answer data bindings (16.050171ms)\n✔ LT20: an empty-shell run.json fails to carry any pinned data binding (12.903444ms)\n✔ LT21: render-twice byte-identity and no generation-time values (0.929116ms)\n✔ LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical (406.097937ms)\n✔ LT22: soft-data figures carry data-soft and visible attribution (0.43306ms)\n✔ LT22: a soft-less run.json renders coverage notices, not fabricated numbers (0.229133ms)\n✔ LT23: every coverage marker is rendered under #coverage (0.250863ms)\n✔ render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2 (467.119557ms)\n✔ render-retro CLI: default --out is index.html beside the input; --format json envelope (83.501482ms)\n✔ LT6: resolve-panel emits panel.resolved; stdout/exit byte-identical with/without --slug (626.474458ms)\n✔ LT7: ensure-panel-agent emits panel.agent_stamped; stdout/exit byte-identical (566.249363ms)\n✔ LT8: validate-task emits task.validated on PASS with and without --report (1078.536955ms)\n✔ LT8: validate-task emits task.validated on FAIL (208.905687ms)\n✔ LT8: validate-task emits task.validated on an ERROR fixture whose manifest parses (92.656808ms)\n✔ LT8: an unparseable-manifest ERROR skips emission with the standard warning (138.553683ms)\n✔ LT9: unwritable run store degrades to a warning; primary output unaffected (381.941977ms)\n✔ nested --repo-root run stores are git-ignored too (gitignore anchoring) (4.36097ms)\n✔ LT10: check-lifecycle.mjs and .sh are untouched by FS5 side-effect emission (5.678827ms)\n✔ PV1: a valid JavaScript manifest runs only declared checks and passes (365.330714ms)\n✔ PV2: only declared argv run; an undeclared tool command never executes (708.768289ms)\n✔ PV3: schema and inspectManifest reject the mutation matrix before any command runs (351.684081ms)\n✔ PV4: command outcomes are complete and deterministic; runner continues after failures (171.273594ms)\n✔ PV4: a timeout is reported as FAIL with timedOut (1164.82737ms)\n✔ PV5: category applicability is exact; injected n/a shapes are rejected (245.585033ms)\n✔ PV6: scenario mapping gates the verdict (247.349776ms)\n✔ PV7: standards and banned patterns are commands, not judgement (336.623576ms)\n✔ PV8: evidence is bounded and secrets are redacted (208.880475ms)\n✔ PV8 unit: boundStream and redaction name-matching are precise (599.320659ms)\n✔ PV9: JSON/text/exit agree and JSON mode is order-independent (1390.437241ms)\n✔ PV9: --report writes the exact JSON bytes atomically (367.88469ms)\n✔ PV9: --report outside the repo root is refused and clobbers nothing (360.491755ms)\n✔ PV10: generic validator law and generated agent are portable (0.755362ms)\n✔ PV11: receipt hash verification detects mutation of any stored file (14.347706ms)\n✔ PV11: a FAIL runner-report cannot ride under runnerVerdict PASS (1.417516ms)\n✔ parseArgs: recognises JSON anywhere and rejects bad flags (1.500553ms)\n✔ PV13: renderText is a faithful projection of the report (234.559232ms)\nℹ tests 397\nℹ suites 0\nℹ pass 397\nℹ fail 0\nℹ cancelled 0\nℹ skipped 0\nℹ todo 0\nℹ duration_ms 15244.223702\n",
      "stderrTail": ""
    },
    {
      "id": "static.lint",
      "argv": [
        "npm",
        "run",
        "lint"
      ],
      "evidence": [
        "Repository formatting and lint rules"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 697,
      "stdoutTail": "\n> pi-sdlc@0.1.1 lint\n> biome check .\n\nChecked 144 files in 283ms. No fixes applied.\n",
      "stderrTail": ""
    },
    {
      "id": "standards.all-six-deltas",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
      ],
      "evidence": [
        "Every phase reference layers its delta over the shared contract (plan DoD 2)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 59,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "standards.pr-template-repo",
      "argv": [
        "grep",
        "-q",
        "Assumptions & discretionary calls",
        ".github/pull_request_template.md"
      ],
      "evidence": [
        "Repo PR template carries the assumptions section (plan DoD 4)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 5,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "standards.pr-template-asset",
      "argv": [
        "grep",
        "-q",
        "Assumptions & discretionary calls",
        "skills/sdlc/assets/pull_request_template.md"
      ],
      "evidence": [
        "Setup-provisioned PR template carries the assumptions section (plan DoD 4)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 7,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "standards.panel-input-naming",
      "argv": [
        "grep",
        "-qF",
        "input to** the PR panel",
        "skills/sdlc/references/phase-pr-review.md"
      ],
      "evidence": [
        "phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 2,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
      ],
      "evidence": [
        "Tool-dependent phrasing absent across the skill (plan DoD 3)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 74,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "patterns.diff",
      "argv": [
        "git",
        "diff",
        "--check",
        "HEAD"
      ],
      "evidence": [
        "No whitespace-error banned patterns in the task diff"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 15,
      "stdoutTail": "",
      "stderrTail": ""
    }
  ],
  "categories": [
    {
      "category": "tests",
      "status": "PASS",
      "checkIds": [
        "tests.full"
      ]
    },
    {
      "category": "static",
      "status": "PASS",
      "checkIds": [
        "static.lint"
      ]
    },
    {
      "category": "scenarios",
      "status": "N/A",
      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
    },
    {
      "category": "standards",
      "status": "PASS",
      "checkIds": [
        "standards.all-six-deltas",
        "standards.pr-template-repo",
        "standards.pr-template-asset",
        "standards.panel-input-naming"
      ]
    },
    {
      "category": "bannedPatterns",
      "status": "PASS",
      "checkIds": [
        "patterns.no-tool-naming",
        "patterns.diff"
      ]
    }
  ],
  "scenarios": []
}
__RUNNER_EXIT__=0
read: docs/reviews/task-validate-sdlc-question-discipline-t2-20...
{
  "schemaVersion": 1,
  "taskId": "t2",
  "manifest": "/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline/docs/validation/sdlc-question-discipline/t2.json",
  "repoRoot": "/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline",
  "verdict": "PASS",
  "exitCode": 0,
  "errors": [],
  "manifestErrors": [],
  "commands": [
    {
      "id": "tests.full",
      "argv": [
        "npm",
        "test"
      ],
      "evidence": [
        "Full corpus green with all six phase deltas (disposition-ledger anchor test included)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 15627,
      "stdoutTail": "[...truncated; showing bounded tail...]\n✔ LT18: soft data carries attribution and matches the fixture LLM's scripted responses (324.03675ms)\n✔ LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number (113.956463ms)\n✔ LT19: --no-llm (noLlm:true) output validates and carries soft.absent (23.604567ms)\n✔ LT17: --from-raw reproduces a byte-identical run.json after live sources are destroyed (507.300204ms)\n✔ LT28: neither the sentinel secret nor the verbatim prompt sentence appears in run.json (196.836588ms)\n✔ NF4 unit: sanitizeSoftString redacts, rejects n-gram containment, and caps at 500 chars (0.283826ms)\n✔ LT29: a failing --gh-cmd yields github.error, schema-valid, no fabricated PR data (109.395213ms)\n✔ LT29: an --llm-cmd returning invalid JSON yields llm.error:narrative, schema-valid, no fabricated summary (239.598723ms)\n✔ LT29: an --llm-cmd that times out yields llm.error:<kind>, schema-valid, exit unaffected (628.505342ms)\n✔ llm-protocol schema: request/response fixtures validate (2.005936ms)\n✔ LT13 (hard): complete fixture store -> schema-valid run.json with known-answer rollups (356.546516ms)\n✔ LT14: a gappy store names every gap and derives nothing from missing sources (209.335573ms)\n✔ LT14: --no-github records github.skipped, not github.error (14.185041ms)\n✔ LT15: manifest adapter skips and counts malformed lines (manifest.partial) (10.675306ms)\n✔ LT15: harvest adapter maps per-model fields correctly (6.555921ms)\n✔ LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file (4.947708ms)\n✔ LT15: review-dir discovery matches <phase>-<slug>-<date> naming (6.343116ms)\n✔ LT15: git/GitHub adapters consume only the injected fakes (294.131439ms)\n✔ LT16: phase attribution, agent time, capped human-wait, rework, window bounds (10.213665ms)\n✔ LT16: a 3-hour gap contributes exactly 30 minutes to human-wait (22.64343ms)\n✔ collect-run: no run store exits 1 (nothing collectable) (189.93837ms)\n✔ collect-run: writes docs/retros/<slug>/run.json by default and validates (118.9903ms)\n✔ resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved (0.988768ms)\n✔ LT24: every mandated hook step names record-run-event.sh and its event-type token together (6.297077ms)\n✔ LT24: the panel-dispatch step and the validator-dispatch step each name harvest-panel.sh (0.434678ms)\n✔ LT24: sdlc-retro SKILL.md names collect and render invocations skill-relatively (FS12 forms) (0.185736ms)\n✔ LT25: check-references passes with the new inventory entries (213.372608ms)\n✔ LT25: deleting a new entry's target file fails check-references (361.282219ms)\n✔ structural coverage: every sdlc-retro script has an FS11 inventory entry (0.481045ms)\n✔ structural coverage: every hook script named by §4 has an FS11 inventory entry (0.892157ms)\n✔ structural coverage: every committed sdlc-retro schema file has an FS11 inventory entry (0.896637ms)\n✔ structural coverage: ADR 0028 has an FS11 inventory entry and exists (2.02459ms)\n✔ structural coverage: every run-store/retro path named normatively by either SKILL.md has an inventory entry (0.468488ms)\n✔ LT27: docs/retros/sdlc-lifecycle-telemetry/run.json and index.html exist (1.783118ms)\n✔ LT27: the dogfood run.json validates against the committed schema and hand-rolled validator (6.019525ms)\n✔ LT27: coverage markers honestly record the pre-instrumentation gap (partial coverage by design) (0.375417ms)\n✔ LT27: the committed dashboard renders all seven anchors for the dogfood run (0.381257ms)\n✔ LT1: valid emit appends one schema-conforming line, creating the store (185.622238ms)\n✔ LT1b: --by defaults to agent when omitted (152.562238ms)\n✔ LT2: bad inputs exit 2 and never touch the manifest (970.786954ms)\n✔ schema agreement: unknown event types remain valid for forward-compatible consumers (0.700568ms)\n✔ LT2b: a bad input against a non-existent store attempts no write (116.025957ms)\n✔ LT3: concurrent emitters produce N complete, non-interleaved lines (381.151332ms)\n✔ empty explicit identities do not fall through to another identity (264.090821ms)\n✔ LT4: --slug beats env beats branch mapping (378.95259ms)\n✔ LT5: unresolvable identity skips (exit 0, one warning, no write) (282.771149ms)\n✔ LT26: .gitignore ignores the run store (6.97599ms)\n✔ emitter: .sh wrapper delegates to .mjs identically (99.233423ms)\n✔ vocabulary: every known event has a payload descriptor (0.260209ms)\n✔ LT11: harvest copies status.json + events.jsonl and emits panel.harvested (167.299955ms)\n✔ LT11: --with-transcripts copies the transcripts/ subdirectory (103.474477ms)\n✔ LT12: a missing source directory exits 0 with both files missed (184.589666ms)\n✔ LT12: a partially-present source (status without events) reports one missed (91.076416ms)\n✔ harvest-panel: unknown phase and non-positive round exit 2 (340.993253ms)\n✔ harvest-panel.sh wrapper delegates to .mjs identically (119.382223ms)\n✔ LT20: full fixture renders all seven anchors with known-answer data bindings (16.050171ms)\n✔ LT20: an empty-shell run.json fails to carry any pinned data binding (12.903444ms)\n✔ LT21: render-twice byte-identity and no generation-time values (0.929116ms)\n✔ LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical (406.097937ms)\n✔ LT22: soft-data figures carry data-soft and visible attribution (0.43306ms)\n✔ LT22: a soft-less run.json renders coverage notices, not fabricated numbers (0.229133ms)\n✔ LT23: every coverage marker is rendered under #coverage (0.250863ms)\n✔ render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2 (467.119557ms)\n✔ render-retro CLI: default --out is index.html beside the input; --format json envelope (83.501482ms)\n✔ LT6: resolve-panel emits panel.resolved; stdout/exit byte-identical with/without --slug (626.474458ms)\n✔ LT7: ensure-panel-agent emits panel.agent_stamped; stdout/exit byte-identical (566.249363ms)\n✔ LT8: validate-task emits task.validated on PASS with and without --report (1078.536955ms)\n✔ LT8: validate-task emits task.validated on FAIL (208.905687ms)\n✔ LT8: validate-task emits task.validated on an ERROR fixture whose manifest parses (92.656808ms)\n✔ LT8: an unparseable-manifest ERROR skips emission with the standard warning (138.553683ms)\n✔ LT9: unwritable run store degrades to a warning; primary output unaffected (381.941977ms)\n✔ nested --repo-root run stores are git-ignored too (gitignore anchoring) (4.36097ms)\n✔ LT10: check-lifecycle.mjs and .sh are untouched by FS5 side-effect emission (5.678827ms)\n✔ PV1: a valid JavaScript manifest runs only declared checks and passes (365.330714ms)\n✔ PV2: only declared argv run; an undeclared tool command never executes (708.768289ms)\n✔ PV3: schema and inspectManifest reject the mutation matrix before any command runs (351.684081ms)\n✔ PV4: command outcomes are complete and deterministic; runner continues after failures (171.273594ms)\n✔ PV4: a timeout is reported as FAIL with timedOut (1164.82737ms)\n✔ PV5: category applicability is exact; injected n/a shapes are rejected (245.585033ms)\n✔ PV6: scenario mapping gates the verdict (247.349776ms)\n✔ PV7: standards and banned patterns are commands, not judgement (336.623576ms)\n✔ PV8: evidence is bounded and secrets are redacted (208.880475ms)\n✔ PV8 unit: boundStream and redaction name-matching are precise (599.320659ms)\n✔ PV9: JSON/text/exit agree and JSON mode is order-independent (1390.437241ms)\n✔ PV9: --report writes the exact JSON bytes atomically (367.88469ms)\n✔ PV9: --report outside the repo root is refused and clobbers nothing (360.491755ms)\n✔ PV10: generic validator law and generated agent are portable (0.755362ms)\n✔ PV11: receipt hash verification detects mutation of any stored file (14.347706ms)\n✔ PV11: a FAIL runner-report cannot ride under runnerVerdict PASS (1.417516ms)\n✔ parseArgs: recognises JSON anywhere and rejects bad flags (1.500553ms)\n✔ PV13: renderText is a faithful projection of the report (234.559232ms)\nℹ tests 397\nℹ suites 0\nℹ pass 397\nℹ fail 0\nℹ cancelled 0\nℹ skipped 0\nℹ todo 0\nℹ duration_ms 15244.223702\n",
      "stderrTail": ""
    },
    {
      "id": "static.lint",
      "argv": [
        "npm",
        "run",
        "lint"
      ],
      "evidence": [
        "Repository formatting and lint rules"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 697,
      "stdoutTail": "\n> pi-sdlc@0.1.1 lint\n> biome check .\n\nChecked 144 files in 283ms. No fixes applied.\n",
      "stderrTail": ""
    },
    {
      "id": "standards.all-six-deltas",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
      ],
      "evidence": [
        "Every phase reference layers its delta over the shared contract (plan DoD 2)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 59,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "standards.pr-template-repo",
      "argv": [
        "grep",
        "-q",
        "Assumptions & discretionary calls",
        ".github/pull_request_template.md"
      ],
      "evidence": [
        "Repo PR template carries the assumptions section (plan DoD 4)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 5,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "standards.pr-template-asset",
      "argv": [
        "grep",
        "-q",
        "Assumptions & discretionary calls",
        "skills/sdlc/assets/pull_request_template.md"
      ],
      "evidence": [
        "Setup-provisioned PR template carries the assumptions section (plan DoD 4)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 7,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "standards.panel-input-naming",
      "argv": [
        "grep",
        "-qF",
        "input to** the PR panel",
        "skills/sdlc/references/phase-pr-review.md"
      ],
      "evidence": [
        "phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 2,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
      ],
      "evidence": [
        "Tool-dependent phrasing absent across the skill (plan DoD 3)"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 74,
      "stdoutTail": "",
      "stderrTail": ""
    },
    {
      "id": "patterns.diff",
      "argv": [
        "git",
        "diff",
        "--check",
        "HEAD"
      ],
      "evidence": [
        "No whitespace-error banned patterns in the task diff"
      ],
      "status": "PASS",
      "exitCode": 0,
      "signal": null,
      "timedOut": false,
      "durationMs": 15,
      "stdoutTail": "",
      "stderrTail": ""
    }
  ],
  "categories": [
    {
      "category": "tests",
      "status": "PASS",
      "checkIds": [
        "tests.full"
      ]
    },
    {
      "category": "static",
      "status": "PASS",
      "checkIds": [
        "static.lint"
      ]
    },
    {
      "category": "scenarios",
      "status": "N/A",
      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
    },
    {
      "category": "standards",
      "status": "PASS",
      "checkIds": [
        "standards.all-six-deltas",
        "standards.pr-template-repo",
        "standards.pr-template-asset",
        "standards.panel-input-naming"
      ]
    },
    {
      "category": "bannedPatterns",
      "status": "PASS",
      "checkIds": [
        "patterns.no-tool-naming",
        "patterns.diff"
      ]
    }
  ],
  "scenarios": []
}
### Validation: t2
- manifest: `docs/validation/sdlc-question-discipline/t2.json`
- runner: PASS — exit 0
- report: `docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json`
- commands: tests.full=PASS, static.lint=PASS, standards.all-six-deltas=PASS, standards.pr-template-repo=PASS, standards.pr-template-asset=PASS, standards.panel-input-naming=PASS, patterns.no-tool-naming=PASS, patterns.diff=PASS
- categories: tests=PASS, static=PASS, scenarios=N/A, standards=PASS, bannedPatterns=PASS
- scenarios: n/a
### Verdict: PASS
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "No failed or errored command, category, or scenario findings in docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json."
    }
  ],
  "changedFiles": [
    "docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline && skills/sdlc/scripts/validate-task.sh --manifest docs/validation/sdlc-question-discipline/t2.json --slug sdlc-question-discipline --format json --report docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json",
      "result": "passed",
      "summary": "Exit 0; report verdict PASS."
    }
  ],
  "validationOutput": [
    "All eight declared checks passed; scenarios category recorded N/A; stderr diagnostics were empty for every command."
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "Runner report artifact written.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": ""
}
```
