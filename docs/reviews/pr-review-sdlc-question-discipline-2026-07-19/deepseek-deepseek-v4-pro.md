Task: PR review of branch feat/sdlc-question-discipline at commit 50c9286 in repo root /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline. TRACK: reversible. Artifact under review: the full diff `git diff main...HEAD` (docs-only: skills/sdlc/references/*.md, both PR templates, plan/build docs, validation manifests/receipts). GOVERNING_DOCS: docs/plans/2026-07-19-sdlc-question-discipline.md (plan) and docs/plans/2026-07-19-sdlc-question-discipline-build.md (build plan). This is the reversible track: a Specification does not exist and must NOT be demanded. Named review input: pr-body.md, including its 'Assumptions & discretionary calls' section — scrutinise those recorded calls. Grounding rule: cite file:line for any claim about the framework or repo. Required output: findings only — each with severity (high/medium/low), file:line, and a one-line remediation — or PASS if none. Do not edit any files.
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
 .github/pull_request_template.md                   |   6 +
 .../2026-07-19-sdlc-question-discipline-build.md   | 117 ++++
 docs/plans/2026-07-19-sdlc-question-discipline.md  | 156 +++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  63 ++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 160 +++++
 .../validator.md                                   | 478 ++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  81 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 199 ++++++
 .../validator.md                                   | 683 +++++++++++++++++++++
 .../disposition-ledger.md                          |   2 +-
 docs/validation/sdlc-question-discipline/t1.json   |  63 ++
 docs/validation/sdlc-question-discipline/t2.json   |  81 +++
 skills/sdlc/assets/pull_request_template.md        |   6 +
 skills/sdlc/references/phase-brainstorm.md         |  19 +-
 skills/sdlc/references/phase-implement.md          |  22 +
 skills/sdlc/references/phase-plan.md               |  20 +
 skills/sdlc/references/phase-pr-review.md          |  55 +-
 skills/sdlc/references/phase-spec.md               |  18 +
 skills/sdlc/references/phase-tasks.md              |  17 +
 skills/sdlc/references/system-reference.md         |  58 +-
 24 files changed, 2404 insertions(+), 20 deletions(-)
50c9286 docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
2699186 docs(sdlc): layer phase-shaped question deltas over the shared contract (T2, #117)
04b6876 docs(sdlc): T1 validation receipt (runner PASS, validator PASS)
244ec22 docs(sdlc): add shared question-presentation contract (T1, #116)
69e62eb docs(sdlc): build plan for question-presentation discipline
c759c20 docs(sdlc): plan for question-presentation discipline across phases
32ebaa1 docs(sdlc): dispatch review panels async and react per-child
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
+      "stderrTail": ""
+    },
+    {
+      "id": "static.lint",
+      "argv": [
+        "npm",
+        "run",
+        "lint"
+      ],
+      "evidence": [
+        "Repository formatting and lint rules"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 697,
+      "stdoutTail": "\n> pi-sdlc@0.1.1 lint\n> biome check .\n\nChecked 144 files in 283ms. No fixes applied.\n",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.all-six-deltas",
+      "argv": [
+        "node",
+        "-e",
+        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
+      ],
+      "evidence": [
+        "Every phase reference layers its delta over the shared contract (plan DoD 2)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 59,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.pr-template-repo",
+      "argv": [
+        "grep",
+        "-q",
+        "Assumptions & discretionary calls",
+        ".github/pull_request_template.md"
+      ],
+      "evidence": [
+        "Repo PR template carries the assumptions section (plan DoD 4)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 5,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.pr-template-asset",
+      "argv": [
+        "grep",
+        "-q",
+        "Assumptions & discretionary calls",
+        "skills/sdlc/assets/pull_request_template.md"
+      ],
+      "evidence": [
+        "Setup-provisioned PR template carries the assumptions section (plan DoD 4)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 7,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.panel-input-naming",
+      "argv": [
+        "grep",
+        "-qF",
+        "input to** the PR panel",
+        "skills/sdlc/references/phase-pr-review.md"
+      ],
+      "evidence": [
+        "phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 2,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "patterns.no-tool-naming",
+      "argv": [
+        "node",
+        "-e",
+        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
+      ],
+      "evidence": [
+        "Tool-dependent phrasing absent across the skill (plan DoD 3)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 74,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "patterns.diff",
+      "argv": [
+        "git",
+        "diff",
+        "--check",
+        "HEAD"
+      ],
+      "evidence": [
+        "No whitespace-error banned patterns in the task diff"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 15,
+      "stdoutTail": "",
+      "stderrTail": ""
+    }
+  ],
+  "categories": [
+    {
+      "category": "tests",
+      "status": "PASS",
+      "checkIds": [
+        "tests.full"
+      ]
+    },
+    {
+      "category": "static",
+      "status": "PASS",
+      "checkIds": [
+        "static.lint"
+      ]
+    },
+    {
+      "category": "scenarios",
+      "status": "N/A",
+      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
+    },
+    {
+      "category": "standards",
+      "status": "PASS",
+      "checkIds": [
+        "standards.all-six-deltas",
+        "standards.pr-template-repo",
+        "standards.pr-template-asset",
+        "standards.panel-input-naming"
+      ]
+    },
+    {
+      "category": "bannedPatterns",
+      "status": "PASS",
+      "checkIds": [
+        "patterns.no-tool-naming",
+        "patterns.diff"
+      ]
+    }
+  ],
+  "scenarios": []
+}
+__RUNNER_EXIT__=0
+read: docs/reviews/task-validate-sdlc-question-discipline-t2-20...
+{
+  "schemaVersion": 1,
+  "taskId": "t2",
+  "manifest": "/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline/docs/validation/sdlc-question-discipline/t2.json",
+  "repoRoot": "/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline",
+  "verdict": "PASS",
+  "exitCode": 0,
+  "errors": [],
+  "manifestErrors": [],
+  "commands": [
+    {
+      "id": "tests.full",
+      "argv": [
+        "npm",
+        "test"
+      ],
+      "evidence": [
+        "Full corpus green with all six phase deltas (disposition-ledger anchor test included)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 15627,
+      "stdoutTail": "[...truncated; showing bounded tail...]\n✔ LT18: soft data carries attribution and matches the fixture LLM's scripted responses (324.03675ms)\n✔ LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number (113.956463ms)\n✔ LT19: --no-llm (noLlm:true) output validates and carries soft.absent (23.604567ms)\n✔ LT17: --from-raw reproduces a byte-identical run.json after live sources are destroyed (507.300204ms)\n✔ LT28: neither the sentinel secret nor the verbatim prompt sentence appears in run.json (196.836588ms)\n✔ NF4 unit: sanitizeSoftString redacts, rejects n-gram containment, and caps at 500 chars (0.283826ms)\n✔ LT29: a failing --gh-cmd yields github.error, schema-valid, no fabricated PR data (109.395213ms)\n✔ LT29: an --llm-cmd returning invalid JSON yields llm.error:narrative, schema-valid, no fabricated summary (239.598723ms)\n✔ LT29: an --llm-cmd that times out yields llm.error:<kind>, schema-valid, exit unaffected (628.505342ms)\n✔ llm-protocol schema: request/response fixtures validate (2.005936ms)\n✔ LT13 (hard): complete fixture store -> schema-valid run.json with known-answer rollups (356.546516ms)\n✔ LT14: a gappy store names every gap and derives nothing from missing sources (209.335573ms)\n✔ LT14: --no-github records github.skipped, not github.error (14.185041ms)\n✔ LT15: manifest adapter skips and counts malformed lines (manifest.partial) (10.675306ms)\n✔ LT15: harvest adapter maps per-model fields correctly (6.555921ms)\n✔ LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file (4.947708ms)\n✔ LT15: review-dir discovery matches <phase>-<slug>-<date> naming (6.343116ms)\n✔ LT15: git/GitHub adapters consume only the injected fakes (294.131439ms)\n✔ LT16: phase attribution, agent time, capped human-wait, rework, window bounds (10.213665ms)\n✔ LT16: a 3-hour gap contributes exactly 30 minutes to human-wait (22.64343ms)\n✔ collect-run: no run store exits 1 (nothing collectable) (189.93837ms)\n✔ collect-run: writes docs/retros/<slug>/run.json by default and validates (118.9903ms)\n✔ resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved (0.988768ms)\n✔ LT24: every mandated hook step names record-run-event.sh and its event-type token together (6.297077ms)\n✔ LT24: the panel-dispatch step and the validator-dispatch step each name harvest-panel.sh (0.434678ms)\n✔ LT24: sdlc-retro SKILL.md names collect and render invocations skill-relatively (FS12 forms) (0.185736ms)\n✔ LT25: check-references passes with the new inventory entries (213.372608ms)\n✔ LT25: deleting a new entry's target file fails check-references (361.282219ms)\n✔ structural coverage: every sdlc-retro script has an FS11 inventory entry (0.481045ms)\n✔ structural coverage: every hook script named by §4 has an FS11 inventory entry (0.892157ms)\n✔ structural coverage: every committed sdlc-retro schema file has an FS11 inventory entry (0.896637ms)\n✔ structural coverage: ADR 0028 has an FS11 inventory entry and exists (2.02459ms)\n✔ structural coverage: every run-store/retro path named normatively by either SKILL.md has an inventory entry (0.468488ms)\n✔ LT27: docs/retros/sdlc-lifecycle-telemetry/run.json and index.html exist (1.783118ms)\n✔ LT27: the dogfood run.json validates against the committed schema and hand-rolled validator (6.019525ms)\n✔ LT27: coverage markers honestly record the pre-instrumentation gap (partial coverage by design) (0.375417ms)\n✔ LT27: the committed dashboard renders all seven anchors for the dogfood run (0.381257ms)\n✔ LT1: valid emit appends one schema-conforming line, creating the store (185.622238ms)\n✔ LT1b: --by defaults to agent when omitted (152.562238ms)\n✔ LT2: bad inputs exit 2 and never touch the manifest (970.786954ms)\n✔ schema agreement: unknown event types remain valid for forward-compatible consumers (0.700568ms)\n✔ LT2b: a bad input against a non-existent store attempts no write (116.025957ms)\n✔ LT3: concurrent emitters produce N complete, non-interleaved lines (381.151332ms)\n✔ empty explicit identities do not fall through to another identity (264.090821ms)\n✔ LT4: --slug beats env beats branch mapping (378.95259ms)\n✔ LT5: unresolvable identity skips (exit 0, one warning, no write) (282.771149ms)\n✔ LT26: .gitignore ignores the run store (6.97599ms)\n✔ emitter: .sh wrapper delegates to .mjs identically (99.233423ms)\n✔ vocabulary: every known event has a payload descriptor (0.260209ms)\n✔ LT11: harvest copies status.json + events.jsonl and emits panel.harvested (167.299955ms)\n✔ LT11: --with-transcripts copies the transcripts/ subdirectory (103.474477ms)\n✔ LT12: a missing source directory exits 0 with both files missed (184.589666ms)\n✔ LT12: a partially-present source (status without events) reports one missed (91.076416ms)\n✔ harvest-panel: unknown phase and non-positive round exit 2 (340.993253ms)\n✔ harvest-panel.sh wrapper delegates to .mjs identically (119.382223ms)\n✔ LT20: full fixture renders all seven anchors with known-answer data bindings (16.050171ms)\n✔ LT20: an empty-shell run.json fails to carry any pinned data binding (12.903444ms)\n✔ LT21: render-twice byte-identity and no generation-time values (0.929116ms)\n✔ LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical (406.097937ms)\n✔ LT22: soft-data figures carry data-soft and visible attribution (0.43306ms)\n✔ LT22: a soft-less run.json renders coverage notices, not fabricated numbers (0.229133ms)\n✔ LT23: every coverage marker is rendered under #coverage (0.250863ms)\n✔ render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2 (467.119557ms)\n✔ render-retro CLI: default --out is index.html beside the input; --format json envelope (83.501482ms)\n✔ LT6: resolve-panel emits panel.resolved; stdout/exit byte-identical with/without --slug (626.474458ms)\n✔ LT7: ensure-panel-agent emits panel.agent_stamped; stdout/exit byte-identical (566.249363ms)\n✔ LT8: validate-task emits task.validated on PASS with and without --report (1078.536955ms)\n✔ LT8: validate-task emits task.validated on FAIL (208.905687ms)\n✔ LT8: validate-task emits task.validated on an ERROR fixture whose manifest parses (92.656808ms)\n✔ LT8: an unparseable-manifest ERROR skips emission with the standard warning (138.553683ms)\n✔ LT9: unwritable run store degrades to a warning; primary output unaffected (381.941977ms)\n✔ nested --repo-root run stores are git-ignored too (gitignore anchoring) (4.36097ms)\n✔ LT10: check-lifecycle.mjs and .sh are untouched by FS5 side-effect emission (5.678827ms)\n✔ PV1: a valid JavaScript manifest runs only declared checks and passes (365.330714ms)\n✔ PV2: only declared argv run; an undeclared tool command never executes (708.768289ms)\n✔ PV3: schema and inspectManifest reject the mutation matrix before any command runs (351.684081ms)\n✔ PV4: command outcomes are complete and deterministic; runner continues after failures (171.273594ms)\n✔ PV4: a timeout is reported as FAIL with timedOut (1164.82737ms)\n✔ PV5: category applicability is exact; injected n/a shapes are rejected (245.585033ms)\n✔ PV6: scenario mapping gates the verdict (247.349776ms)\n✔ PV7: standards and banned patterns are commands, not judgement (336.623576ms)\n✔ PV8: evidence is bounded and secrets are redacted (208.880475ms)\n✔ PV8 unit: boundStream and redaction name-matching are precise (599.320659ms)\n✔ PV9: JSON/text/exit agree and JSON mode is order-independent (1390.437241ms)\n✔ PV9: --report writes the exact JSON bytes atomically (367.88469ms)\n✔ PV9: --report outside the repo root is refused and clobbers nothing (360.491755ms)\n✔ PV10: generic validator law and generated agent are portable (0.755362ms)\n✔ PV11: receipt hash verification detects mutation of any stored file (14.347706ms)\n✔ PV11: a FAIL runner-report cannot ride under runnerVerdict PASS (1.417516ms)\n✔ parseArgs: recognises JSON anywhere and rejects bad flags (1.500553ms)\n✔ PV13: renderText is a faithful projection of the report (234.559232ms)\nℹ tests 397\nℹ suites 0\nℹ pass 397\nℹ fail 0\nℹ cancelled 0\nℹ skipped 0\nℹ todo 0\nℹ duration_ms 15244.223702\n",
+      "stderrTail": ""
+    },
+    {
+      "id": "static.lint",
+      "argv": [
+        "npm",
+        "run",
+        "lint"
+      ],
+      "evidence": [
+        "Repository formatting and lint rules"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 697,
+      "stdoutTail": "\n> pi-sdlc@0.1.1 lint\n> biome check .\n\nChecked 144 files in 283ms. No fixes applied.\n",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.all-six-deltas",
+      "argv": [
+        "node",
+        "-e",
+        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
+      ],
+      "evidence": [
+        "Every phase reference layers its delta over the shared contract (plan DoD 2)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 59,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.pr-template-repo",
+      "argv": [
+        "grep",
+        "-q",
+        "Assumptions & discretionary calls",
+        ".github/pull_request_template.md"
+      ],
+      "evidence": [
+        "Repo PR template carries the assumptions section (plan DoD 4)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 5,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.pr-template-asset",
+      "argv": [
+        "grep",
+        "-q",
+        "Assumptions & discretionary calls",
+        "skills/sdlc/assets/pull_request_template.md"
+      ],
+      "evidence": [
+        "Setup-provisioned PR template carries the assumptions section (plan DoD 4)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 7,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "standards.panel-input-naming",
+      "argv": [
+        "grep",
+        "-qF",
+        "input to** the PR panel",
+        "skills/sdlc/references/phase-pr-review.md"
+      ],
+      "evidence": [
+        "phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 2,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "patterns.no-tool-naming",
+      "argv": [
+        "node",
+        "-e",
+        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
+      ],
+      "evidence": [
+        "Tool-dependent phrasing absent across the skill (plan DoD 3)"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 74,
+      "stdoutTail": "",
+      "stderrTail": ""
+    },
+    {
+      "id": "patterns.diff",
+      "argv": [
+        "git",
+        "diff",
+        "--check",
+        "HEAD"
+      ],
+      "evidence": [
+        "No whitespace-error banned patterns in the task diff"
+      ],
+      "status": "PASS",
+      "exitCode": 0,
+      "signal": null,
+      "timedOut": false,
+      "durationMs": 15,
+      "stdoutTail": "",
+      "stderrTail": ""
+    }
+  ],
+  "categories": [
+    {
+      "category": "tests",
+      "status": "PASS",
+      "checkIds": [
+        "tests.full"
+      ]
+    },
+    {
+      "category": "static",
+      "status": "PASS",
+      "checkIds": [
+        "static.lint"
+      ]
+    },
+    {
+      "category": "scenarios",
+      "status": "N/A",
+      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
+    },
+    {
+      "category": "standards",
+      "status": "PASS",
+      "checkIds": [
+        "standards.all-six-deltas",
+        "standards.pr-template-repo",
+        "standards.pr-template-asset",
+        "standards.panel-input-naming"
+      ]
+    },
+    {
+      "category": "bannedPatterns",
+      "status": "PASS",
+      "checkIds": [
+        "patterns.no-tool-naming",
+        "patterns.diff"
+      ]
+    }
+  ],
+  "scenarios": []
+}
+### Validation: t2
+- manifest: `docs/validation/sdlc-question-discipline/t2.json`
+- runner: PASS — exit 0
+- report: `docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json`
+- commands: tests.full=PASS, static.lint=PASS, standards.all-six-deltas=PASS, standards.pr-template-repo=PASS, standards.pr-template-asset=PASS, standards.panel-input-naming=PASS, patterns.no-tool-naming=PASS, patterns.diff=PASS
+- categories: tests=PASS, static=PASS, scenarios=N/A, standards=PASS, bannedPatterns=PASS
+- scenarios: n/a
+### Verdict: PASS
+```acceptance-report
+{
+  "criteriaSatisfied": [
+    {
+      "id": "criterion-1",
+      "status": "satisfied",
+      "evidence": "No failed or errored command, category, or scenario findings in docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json."
+    }
+  ],
+  "changedFiles": [
+    "docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json"
+  ],
+  "testsAddedOrUpdated": [],
+  "commandsRun": [
+    {
+      "command": "cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline && skills/sdlc/scripts/validate-task.sh --manifest docs/validation/sdlc-question-discipline/t2.json --slug sdlc-question-discipline --format json --report docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator-runner-report.json",
+      "result": "passed",
+      "summary": "Exit 0; report verdict PASS."
+    }
+  ],
+  "validationOutput": [
+    "All eight declared checks passed; scenarios category recorded N/A; stderr diagnostics were empty for every command."
+  ],
+  "residualRisks": [
+    "none"
+  ],
+  "noStagedFiles": true,
+  "diffSummary": "Runner report artifact written.",
+  "reviewFindings": [
+    "no blockers"
+  ],
+  "manualNotes": ""
+}
+```
diff --git a/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md b/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
index 90b1252..25e0e47 100644
--- a/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
+++ b/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
@@ -54,7 +54,7 @@ anchor check.
 | S22 | Brainstorm is live dialogue; rubber-duck | moved | skills/sdlc/references/phase-brainstorm.md | rubber-duck the idea, not agree with it |
 | S23 | Raise a contradiction or say there isn't one | moved | skills/sdlc/references/phase-brainstorm.md | Raise a contradiction, or say there isn't one |
 | S24 | Use tools, proportional not mandatory | moved | skills/sdlc/references/phase-brainstorm.md | proportional, not mandatory ceremony |
-| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present multiple open questions in a structured form |
+| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present open questions per the shared contract |
 | S26 | Expand and pressure-test, don't commandeer | moved | skills/sdlc/references/phase-brainstorm.md | Expand and pressure-test, don't commandeer |
 | S27 | Map mode: switch when large/foggy | moved | skills/sdlc/references/phase-brainstorm.md | wayfinder-lite |
 | S28 | The map issue is the canonical resumable artifact | moved | skills/sdlc/references/phase-brainstorm.md | resumable artifact for the effort, not a doc |
diff --git a/docs/validation/sdlc-question-discipline/t1.json b/docs/validation/sdlc-question-discipline/t1.json
new file mode 100644
index 0000000..a89f260
--- /dev/null
+++ b/docs/validation/sdlc-question-discipline/t1.json
@@ -0,0 +1,63 @@
+{
+  "schemaVersion": 1,
+  "taskId": "t1",
+  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
+  "repoRoot": ".",
+  "ownedScenarios": [],
+  "checks": [
+    {
+      "id": "tests.full",
+      "argv": ["npm", "test"],
+      "timeoutMs": 300000,
+      "evidence": ["Full corpus green with the new system-reference section (structural tests over references included)"]
+    },
+    {
+      "id": "static.lint",
+      "argv": ["npm", "run", "lint"],
+      "timeoutMs": 120000,
+      "evidence": ["Repository formatting and lint rules"]
+    },
+    {
+      "id": "standards.section-present",
+      "argv": ["grep", "-q", "Presenting questions to the human", "skills/sdlc/references/system-reference.md"],
+      "evidence": ["Shared question-presentation contract section exists (plan DoD 1)"]
+    },
+    {
+      "id": "standards.routing-row",
+      "argv": ["grep", "-q", "How does any phase ask the human for input?", "skills/sdlc/references/system-reference.md"],
+      "evidence": ["Next-read routing table routes to the new section (plan DoD 1)"]
+    },
+    {
+      "id": "patterns.no-tool-naming",
+      "argv": ["node", "-e", "const s=require('fs').readFileSync('skills/sdlc/references/system-reference.md','utf8'); if(/questions-helper|questions tool/i.test(s)){console.error('banned questions-tool naming present');process.exit(1)}"],
+      "evidence": ["Tool-dependent phrasing absent from the system reference (plan DoD 1/3)"]
+    },
+    {
+      "id": "patterns.diff",
+      "argv": ["git", "diff", "--check", "HEAD"],
+      "evidence": ["No whitespace-error banned patterns in the task diff"]
+    }
+  ],
+  "categories": {
+    "tests": {
+      "applicability": "required",
+      "checkIds": ["tests.full"]
+    },
+    "static": {
+      "applicability": "required",
+      "checkIds": ["static.lint"]
+    },
+    "scenarios": {
+      "applicability": "n/a",
+      "reason": "Reversible track: no Specification exists; T1 maps to approved plan DoD items 1/3/5 per the build plan's T1 check table."
+    },
+    "standards": {
+      "applicability": "required",
+      "checkIds": ["standards.section-present", "standards.routing-row"]
+    },
+    "bannedPatterns": {
+      "applicability": "required",
+      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
+    }
+  }
+}
diff --git a/docs/validation/sdlc-question-discipline/t2.json b/docs/validation/sdlc-question-discipline/t2.json
new file mode 100644
index 0000000..0ad3c11
--- /dev/null
+++ b/docs/validation/sdlc-question-discipline/t2.json
@@ -0,0 +1,81 @@
+{
+  "schemaVersion": 1,
+  "taskId": "t2",
+  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
+  "repoRoot": ".",
+  "ownedScenarios": [],
+  "checks": [
+    {
+      "id": "tests.full",
+      "argv": ["npm", "test"],
+      "timeoutMs": 300000,
+      "evidence": ["Full corpus green with all six phase deltas (disposition-ledger anchor test included)"]
+    },
+    {
+      "id": "static.lint",
+      "argv": ["npm", "run", "lint"],
+      "timeoutMs": 120000,
+      "evidence": ["Repository formatting and lint rules"]
+    },
+    {
+      "id": "standards.all-six-deltas",
+      "argv": [
+        "node",
+        "-e",
+        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
+      ],
+      "evidence": ["Every phase reference layers its delta over the shared contract (plan DoD 2)"]
+    },
+    {
+      "id": "standards.pr-template-repo",
+      "argv": ["grep", "-q", "Assumptions & discretionary calls", ".github/pull_request_template.md"],
+      "evidence": ["Repo PR template carries the assumptions section (plan DoD 4)"]
+    },
+    {
+      "id": "standards.pr-template-asset",
+      "argv": ["grep", "-q", "Assumptions & discretionary calls", "skills/sdlc/assets/pull_request_template.md"],
+      "evidence": ["Setup-provisioned PR template carries the assumptions section (plan DoD 4)"]
+    },
+    {
+      "id": "standards.panel-input-naming",
+      "argv": ["grep", "-qF", "input to** the PR panel", "skills/sdlc/references/phase-pr-review.md"],
+      "evidence": ["phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"]
+    },
+    {
+      "id": "patterns.no-tool-naming",
+      "argv": [
+        "node",
+        "-e",
+        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
+      ],
+      "evidence": ["Tool-dependent phrasing absent across the skill (plan DoD 3)"]
+    },
+    {
+      "id": "patterns.diff",
+      "argv": ["git", "diff", "--check", "HEAD"],
+      "evidence": ["No whitespace-error banned patterns in the task diff"]
+    }
+  ],
+  "categories": {
+    "tests": {
+      "applicability": "required",
+      "checkIds": ["tests.full"]
+    },
+    "static": {
+      "applicability": "required",
+      "checkIds": ["static.lint"]
+    },
+    "scenarios": {
+      "applicability": "n/a",
+      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
+    },
+    "standards": {
+      "applicability": "required",
+      "checkIds": ["standards.all-six-deltas", "standards.pr-template-repo", "standards.pr-template-asset", "standards.panel-input-naming"]
+    },
+    "bannedPatterns": {
+      "applicability": "required",
+      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
+    }
+  }
+}
diff --git a/skills/sdlc/assets/pull_request_template.md b/skills/sdlc/assets/pull_request_template.md
index 909ceb3..2780304 100644
--- a/skills/sdlc/assets/pull_request_template.md
+++ b/skills/sdlc/assets/pull_request_template.md
@@ -21,3 +21,9 @@ Build` and explain briefly.
 - Epic: `#<epic-issue>`
 - Tasks: `#<task-issue>`, `#<task-issue>`
 - Board: `<TRACKER_BOARD>`
+
+## Assumptions & discretionary calls
+
+Assumptions and discretionary implementation choices accrued during Implement,
+copied from the build-plan doc's "Assumptions" appendix. Review input for the
+PR panel — not a place for panel findings. Write `None` when nothing accrued.
diff --git a/skills/sdlc/references/phase-brainstorm.md b/skills/sdlc/references/phase-brainstorm.md
index fd99f8b..2982aab 100644
--- a/skills/sdlc/references/phase-brainstorm.md
+++ b/skills/sdlc/references/phase-brainstorm.md
@@ -36,10 +36,16 @@ Concrete behaviour, not just tone:
   the human might be unaware of or wrongly assuming is novel. This is
   proportional, not mandatory ceremony — a brief brainstorm does not need a
   research pass just to be brief.
-- **Present multiple open questions in a structured form** when the environment
-  provides a tool for that (e.g. a questions-helper plugin) rather than a wall of
-  unstructured prose. When it is not there, degrade to inline structured prose
-  (see `references/system-reference.md`, "Skills and tools are enhancements").
+- **Present open questions per the shared contract** —
+  `references/system-reference.md`, "Presenting questions to the human": one
+  numbered end-of-reply block, enumerated alternatives, reasoned
+  recommendations, the uniform soft cap, and the Blocking/Assumption/Parked
+  triage tiers — never a wall of unstructured prose. Brainstorm's delta: a
+  recommendation must **widen the option space, not steer it** — recommend
+  freely on mechanical questions (where something should live), sparingly on
+  design direction (what something should be). Assumptions stated in dialogue
+  need no ledger here: Brainstorm commits no artifact, and the Plan restates
+  every assumption that survives.
 - **Expand and pressure-test, don't commandeer.** Contradictions and questions
   exist to widen the human's option space, not to steer the design toward the
   agent's own preferred answer. The human remains the owner of the direction;
@@ -131,7 +137,10 @@ visible without reopening a conversation.
 **Fog of war.** Don't ticket what you can't yet phrase precisely. The test is
 whether the question is sharp now, not whether you can answer it now: ticket when
 it is already sharp (even if blocked); leave it in **Not yet specified** when you
-can't yet phrase it that sharply — write it as loosely as the view allows.
+can't yet phrase it that sharply — write it as loosely as the view allows. A
+**parked** question (the shared contract's tier) is fog by another name: in map
+mode it lands in Not yet specified rather than a separate ledger, graduating to
+a ticket once sharp.
 Resolving a ticket clears the fog ahead of it, graduating whatever is now
 specifiable into fresh tickets, one at a time.
diff --git a/skills/sdlc/references/phase-implement.md b/skills/sdlc/references/phase-implement.md
index 8456824..d244541 100644
--- a/skills/sdlc/references/phase-implement.md
+++ b/skills/sdlc/references/phase-implement.md
@@ -46,6 +46,24 @@ Produce code and tests on the feature branch (worktree or checkout per the
 project's hooks/workflow). Each task's checks are whatever its approved Build task
 declared.
+**Dialogue discipline.** Implement lowers the interrupt surface of the shared
+contract (`references/system-reference.md`,
+"Presenting questions to the human") to near zero:
+
+- **Mid-task interrupts are reserved for external blockers only** — missing
+  credentials, broken or absent tooling, billing/rate exhaustion, permissions:
+  cases where proceeding is impossible and no repository reading helps.
+- Everything else batches to the **task boundary** (the validator seam) under
+  the uniform cap. Expected steady state is near zero: an upstream flaw is a
+  backward transition (§6), and a discretionary implementation choice the
+  upstream deliberately left open is the agent's call, recorded as an
+  assumption — asking the human to make it is ceremony, not care.
+- Assumptions accrue in the build-plan doc's **"Assumptions" appendix** as
+  tasks complete (plus the task's close comment when tracker-backed) and are
+  copied into the PR body's **"Assumptions & discretionary calls"** section at
+  PR preparation, where the panel reads them as review input
+  (`references/phase-pr-review.md`).
+
 ## 5. Invariant gate/approval seam — the per-task validator
 The invariant seam is per-task validation selected by `review.tasks`:
@@ -135,6 +153,10 @@ surface directly, give it the same shape every time:
   Stop investigating and finalize your current change against the stated
   check commands now." Reuse this wording rather than improvising a new one
   each time.
+- **Workers never triage for themselves.** A dispatched worker's blocking
+  question returns to the dispatching implementer — its stop-condition and
+  budget shape already imply this — and the implementer applies the shared
+  contract's triage tiers. One channel to the human, never one per worker.
 - **Infra failure gets one automatic retry; no verdict does.** If a
   dispatched worker's run ends in an **infra-class failure** — a process
   crash, an out-of-memory kill, overload or billing exhaustion, a provider
diff --git a/skills/sdlc/references/phase-plan.md b/skills/sdlc/references/phase-plan.md
index 28da500..4490875 100644
--- a/skills/sdlc/references/phase-plan.md
+++ b/skills/sdlc/references/phase-plan.md
@@ -37,6 +37,26 @@ Produce the Plan doc: **objectives, rationale, scope in/out, definition of done,
 and context for the next agent**. Its home routes to the configured
 `paths.plans`.
+**Dialogue discipline.** Ask per the shared contract
+(`references/system-reference.md`, "Presenting questions to the human") with
+Plan's convergent delta:
+
+- Every blocking question must **close a decision that blocks writing a
+  specific Plan section**. A question that would reopen the agreed design is
+  not a Plan question — present it as a proposed backward transition to
+  Brainstorm (§6), never smuggled into the block.
+- **Recommendations are expected**: by Plan the agent holds an agreed design;
+  a blocking question with no recommendation signals the design was not
+  actually agreed.
+- **Draft first**: present the drafted Plan doc with the question block
+  alongside it; ask before drafting only when a blocking question prevents any
+  credible draft.
+- The triage tiers map onto the artifact: **assumptions are written into the
+  doc** (rationale/context) so gate approval ratifies them rather than leaving
+  them in session scrollback, and **parked questions go into "context for the
+  next agent"**. Scope-boundary questions always carry enumerated
+  alternatives — "is X in or out" is never posed as open prose.
+
 > **Under your configuration:** the artifact home is `<paths.plans>/<date>-<feat>.md`
 > using the committed `paths.plans` value — do not hardcode `docs/plans`.
diff --git a/skills/sdlc/references/phase-pr-review.md b/skills/sdlc/references/phase-pr-review.md
index ce1895e..cbdd9f1 100644
--- a/skills/sdlc/references/phase-pr-review.md
+++ b/skills/sdlc/references/phase-pr-review.md
@@ -43,6 +43,12 @@ shared board. Add `Closes #<task-issue>` for each task completed by merging the
 PR; use the explicit no-tracker exemption for a below-threshold (per
 `shape.publishToTracker`) or `track: none` change. The PR body describes the
 change for its audience; it does not carry the local panel's development findings.
+It **does** carry an **"Assumptions & discretionary calls"** section
+(provisioned by the PR template, empty-allowed): the assumptions accrued during
+Implement, copied from the build-plan doc's appendix
+(`references/phase-implement.md`). That section is **input to** the PR panel —
+named review material for the judgement pass — never a channel for panel
+findings; the no-development-findings rule above is unchanged.
 Every PR declares its track in the template's `sdlc` declaration block
 (provisioned by setup). The `check-lifecycle` script verifies the declared track's
@@ -101,17 +107,23 @@ hand-copy a prompt per model.
      `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
      its task value with the exact review task: name the artifact paths, commit,
-     governing documents, grounding rule, and required findings-only output; then
-     dispatch the populated array in one call. Per-model attribution comes back on
-     each task's `result.model`. `ensure-panel-agent.sh` copies the prompt body
-     verbatim and writes to the consumer repo's `.pi/agents` where the session
-     resolves project agents (NOT a `cd`-ed cwd). Consult the project's governing
-     documents (for example `AGENTS.md`) for any local sub-agent gotchas.
+     governing documents, grounding rule, and required findings-only output. Dispatch
+     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
+     not as a blocking call: a blocking multi-model dispatch only returns control after
+     every reviewer finishes, so a reviewer that crashes in the first second still sits
+     unactioned until the slowest sibling completes minutes later. Async dispatch
+     returns immediately with one run id/`asyncDir` covering every child in the panel.
+     Per-model attribution comes back on each task's `result.model` once you read it.
+     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
+     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
+     `cd`-ed cwd). Consult the project's governing documents (for example
+     `AGENTS.md`) for any local sub-agent gotchas.
    - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
      stamps one prompt file across `--model` flags.
    Give each reviewer the exact inputs: the artifact under review, the upstream
-   artifacts it must be consistent with, the repo path and commit, and the
+   artifacts it must be consistent with, the repo path and commit, the PR body's
+   "Assumptions & discretionary calls" section as named review material, and the
    grounding rule (cite `file:line` for any framework claim). For `pr_review`,
    populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
    from the linked documents before dispatch; never send literal placeholders. On
@@ -127,6 +139,19 @@ hand-copy a prompt per model.
 `wait({ all: true })` over status-polling for read-only fan-out, and read a
 child's transcript before treating a "detached" status label as lost output.
+   **React per-child, not per-batch.** Once dispatched async, poll
+   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
+   once every child in that run finishes) at a short interval; a `wait({ id:
+   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
+   timeout returns control without stopping the run. Diff each poll's per-child
+   status against the last one: the moment any child shows an infra failure (see
+   below) rather than a verdict, act on it immediately — do not wait for the other
+   panelists still running. A replacement dispatch for that model is a brand-new,
+   separate async `subagent` single-agent call, not folded back into the original
+   `tasks:` array, so it runs alongside whichever siblings from the first batch are
+   still going. Keep polling until every original child and every replacement is
+   accounted for.
+
    **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
    candidate pool, not merely documentation. A reviewer that returns a model
    verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
@@ -155,6 +180,22 @@ child's transcript before treating a "detached" status label as lost output.
    human owner, who is the final adjudicator. Reviewer output is roughly eighty per
    cent right and overreaches, so nothing is actioned blindly and nothing is
    dismissed silently.
+
+   Escalate disputes to the human per the shared contract
+   (`references/system-reference.md`, "Presenting questions to the human") with
+   the PR delta: escalations reach the human **once per fix wave, after
+   consolidation, never streamed as reviewers return**, and arrive
+   **pre-adjudicated** as ratify/amend decisions — each escalated finding
+   carries its id, a one-line gist, the reviewers who raised it (cross-model
+   agreement is signal), and the agent's recommended disposition with its
+   reason. Only **proposed dismissals of high or medium findings** — plus
+   anything touching a previously human-ratified residual-risk boundary —
+   escalate; incorporating a finding is agreement and needs no permission.
+   Overflow past the cap usually means incorporate the cheap ones rather than
+   argue them. A **human-ratified dismissal binds forward**: record it in
+   `consolidated.md` with its human-ratified attribution and do not re-litigate
+   the same finding class in later waves or later sessions unless new evidence
+   emerges.
 5. **Stop** when no high or medium finding survives adjudication. Low findings are
    recorded, not blocking. Termination is measured against surviving findings, so a
    ruthless panel that always emits nits still converges.
diff --git a/skills/sdlc/references/phase-spec.md b/skills/sdlc/references/phase-spec.md
index 8b1bc54..de3eb39 100644
--- a/skills/sdlc/references/phase-spec.md
+++ b/skills/sdlc/references/phase-spec.md
@@ -47,6 +47,24 @@ Produce the Spec doc: **contracts, interfaces, surface area, functional and
 non-functional requirements, and falsifiable verification scenarios with stable
 ids**. Its home routes to the configured `paths.specs`.
+**Dialogue discipline.** Ask per the shared contract
+(`references/system-reference.md`, "Presenting questions to the human") and
+Plan's draft-first rule, with Spec's delta:
+
+- **Behavioural and edge-case questions are posed as draft scenarios, never
+  open questions**: not "what should happen when X?" but "SN: when X → Y
+  (pass) / Z (fail). Recommended: Y — because …", ratified or amended by
+  exception. Drafted scenarios are Spec's assumption tier: gate approval
+  ratifies them.
+- The blocking slots are reserved for genuinely open **contract/surface
+  decisions** the agent cannot responsibly settle alone; the cap's escape
+  valve is demotion into the draft, never a longer block — edge cases
+  legitimately number in the dozens and belong in the draft as recommended
+  scenarios.
+- Never ask the human what the code currently does: the same `file:line`
+  grounding demanded of panel reviewers applies to the authoring agent's
+  questions — legitimate questions are about intent.
+
 > **Under your configuration:** the artifact home is `<paths.specs>/<date>-<feat>.md`
 > using the committed `paths.specs` value — do not hardcode `docs/specs`.
diff --git a/skills/sdlc/references/phase-tasks.md b/skills/sdlc/references/phase-tasks.md
index ba680a8..d074066 100644
--- a/skills/sdlc/references/phase-tasks.md
+++ b/skills/sdlc/references/phase-tasks.md
@@ -41,6 +41,23 @@ objectives, rationale, check commands, and scenario ids per task. Its home route
 to the configured `paths.plans` as `<date>-<feat>-build.md`. This doc stays the
 authoritative record even when it is also projected to the tracker.
+**Dialogue discipline.** Build expects **zero blocking questions**
+(shared contract: `references/system-reference.md`,
+"Presenting questions to the human"). A genuinely blocking question here almost always means the Spec's
+scenarios or the Plan's definition of done are incomplete — present it as a
+proposed backward transition (§6). This is the counterfeit-artifact rule's
+conversational twin: Build papers over an upstream hole with neither
+fabricated ids nor questions. Mechanical decomposition choices — granularity,
+ordering, blocking edges, a near-threshold publish call — are the agent's
+derivation calls: state them inline as assumptions and proceed; the committed
+build-plan doc is the reviewable record, and a gateless phase manufactures no
+approval interaction. A question **parked to Implement attaches to the
+build-plan doc entry of the task it affects** (projected into the sub-issue
+body above threshold; the doc row is the source), so the claiming session sees
+it at claim time. The build-plan doc also carries an **"Assumptions"
+appendix** — the accrual home Implement appends discretionary calls to as
+tasks complete (`references/phase-implement.md`).
+
 > **Under your configuration:** the artifact home uses committed `paths.plans`;
 > do not hardcode `docs/plans`.
diff --git a/skills/sdlc/references/system-reference.md b/skills/sdlc/references/system-reference.md
index d1c694e..8efa9cb 100644
--- a/skills/sdlc/references/system-reference.md
+++ b/skills/sdlc/references/system-reference.md
@@ -100,7 +100,7 @@ carries a `class`:
   `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
   consumer `.pi/sdlc/CONFIG.md`.
 - **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
-  rendering, a questions-helper plugin).
+  rendering, an interactive question-answering aid).
 - **`internal`** — implementation internals: the `*.mjs` implementations behind
   `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
   and are not catalogued file by file.
@@ -194,12 +194,13 @@ once by `assets/tracker-ops.md`.
 ### Skills and tools are enhancements, not dependencies
-Any skill or tool the agent reaches for opportunistically — a questions-helper
-plugin, web research, codebase exploration, anything named anywhere in this
-documentation as a way to do a phase better — is an enhancement, never a hard
-dependency a phase blocks on. When it is missing, degrade to the plain fallback
-(inline structured prose for a missing questions tool, a direct read/grep for
-missing research tooling) and say so, rather than stopping or refusing to proceed.
+Any skill or tool the agent reaches for opportunistically — web research,
+codebase exploration, a richer rendering surface, anything named anywhere in
+this documentation as a way to do a phase better — is an enhancement, never a
+hard dependency a phase blocks on. When it is missing, degrade to the plain
+fallback (a direct read/grep for missing research tooling, plain structured
+prose for a missing richer surface) and say so, rather than stopping or
+refusing to proceed.
 Name no external tool as a shipped dependency of the skill itself. **This rule
 does not cover hooks:** a `hooks` entry a repo has explicitly configured is a
 deliberate, load-bearing contract with the failure semantics above (before=block,
@@ -282,6 +283,7 @@ trust model are recorded in ADR 0029.
 | What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
 | What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
 | What implementation realizes a surface? | Source, only when implementation work requires it |
+| How does any phase ask the human for input? | "Presenting questions to the human" (§14, this file) |
 ## 12. Lifecycle telemetry (FS13)
@@ -345,3 +347,45 @@ true auto-resume, which is `pi`/`pi-coding-agent` runtime behaviour this
 project does not own or ship. Treat this section as covering the gap until
 that exists upstream, not as the final word.
+## 14. Presenting questions to the human
+
+Every phase asks the human for input the same way. This section is the single
+owner of that contract; each `references/phase-*.md` layers a phase-shaped
+delta on top and never restates it. The contract is deliberately
+**tool-agnostic**: it depends on no plugin or helper, degrades to plain prose
+in any environment, and is by construction the structure an interactive
+answering aid extracts well — so no environment detection is ever needed.
+
+**The block.**
+
+- All questions for the human go in **one numbered block, as the last thing in
+  the reply** — never scattered through prose.
+- One distinct question per numbered item, one question per sentence — no
+  compound questions.
+- Add a one-line context only when the bare question alone is ambiguous.
+- When alternatives exist, list them as a numbered list under the question.
+  Never fabricate alternatives — no invented yes/no framing of a genuinely
+  open question.
+- Mark at most one option per question **"Recommended — because <reason>"**.
+  Never a recommendation without a reason; never a fabricated recommendation
+  when genuinely neutral.
+
+**The budget.** At most **3–5 blocking questions per turn**: a soft cap
+applied with judgment, uniform across phases. A phase delta may only lower it,
+never raise it. Overflow **demotes** to a lower tier — it never lengthens the
+block.
+
+**The triage tiers.** Every candidate question lands in exactly one:
+
+- **Blocking** — asked now, in the block.
+- **Assumption** — not asked; stated explicitly ("Proceeding on the assumption
+  that X — object now if wrong"). Where the phase has an artifact, assumptions
+  are written into it so the gate ratifies them (see the phase deltas).
+- **Parked** — recorded as one line with its destination ("parked to Spec")
+  and carried forward in the phase's context for the next agent.
+
+**Never ask a repo-discoverable fact.** A legitimate question is about intent,
+priorities, or external state only the human knows. A question about what the
+code, config, or docs currently do means the reading was skipped — read first,
+using the degraded research fallbacks above when richer tooling is missing.
+
[Showing lines 1727-2669 of 2669 (50.0KB limit). Full output: /tmp/pi-bash-f10bfcad5badaaa5.log]
# Plan: Question-presentation discipline across SDLC phase prompts
- **Slug:** `sdlc-question-discipline`
- **Date:** 2026-07-19
- **Track:** reversible (ratified at the design gate, 2026-07-19)
- **Status:** rev1, approved (human gate per `overrides.reversible.review.design: human`)
## Objectives
1. Establish **one shared question-presentation contract** — owned once in
   `references/system-reference.md` — governing how any lifecycle phase asks the
   human for input: single end-of-reply numbered block, one question per item,
   enumerated alternatives, explicit reasoned recommendations, a uniform soft cap
   of 3–5 blocking questions per turn, and three triage tiers (Blocking /
   Assumption / Parked).
2. Give each of the six phase references a **phase-shaped delta** layered on that
   contract, so clarification behaviour matches each phase's character
   (divergent brainstorm → convergent plan → falsifiable spec → gateless build →
   interrupt-minimal implement → pre-adjudicated PR escalations).
3. **Remove the unactionable tool framing**: the current brainstorm bullet tells
   the agent to use "a tool for that (e.g. a questions-helper plugin)" — but
   `pi-questions-helper` is a user-side slash command, not an agent tool. The
   contract defines a structured format that interactive helpers can extract
   well, without naming or depending on any tool.
4. End **question bombardment**: overflow beyond the cap demotes to assumption or
   parked tiers — never a longer block — and repo-discoverable facts are never
   asked at all.
## Rationale
- The brainstorm reference's question-tool bullet is unactionable as written
  (the referenced plugin is human-invoked; the agent has no such tool), so
  agents silently degrade to unstructured question walls.
- Brainstorm is the **only** phase with any question-presentation guidance;
  plan/spec/tasks/implement/pr-review have none, yet plan/spec negotiation and
  PR-panel adjudication are where the human is bombarded hardest.
- The design was agreed in a full brainstorm dialogue (2026-07-19, this
  session) covering the shared contract plus all six phase deltas; every open
  question below was resolved by the human owner during that dialogue.
## Agreed design (carried from Brainstorm)
### Shared contract (new top-level section in `system-reference.md`)
- Single numbered question block, last thing in the reply; never scattered.
- One distinct question per item; one question per sentence; context line only
  when the bare question is ambiguous.
- Alternatives as a numbered list when they exist; never fabricated (no
  invented yes/no framing of genuinely open questions).
- At most one **Recommended — because <reason>** per question; never a
  recommendation without a reason; never fabricated when genuinely neutral.
- **Soft cap: 3–5 blocking questions per turn, uniform across phases.** Phase
  deltas may only lower it. Overflow **demotes** (to assumption or parked),
  never lengthens the block.
- **Triage tiers** — every candidate question lands in exactly one:
  - **Blocking**: asked now, in the block.
  - **Assumption**: not asked; stated explicitly ("Proceeding on the assumption
    that X — object now if wrong").
  - **Parked**: one line + destination phase, carried in the phase handover.
- **Never ask the human a fact the repo can answer** — legitimate questions are
  about intent; a question about what the code does means the reading was
  skipped. (Universal rule; Spec adds the `file:line` emphasis.)
- The section is tool-agnostic. The existing §6 "Skills and tools are
  enhancements" example language ("a questions-helper plugin", "a missing
  questions tool") is neutralised to match.
- §11 next-read routing table gains a row for the new section.
### Per-phase deltas
| Phase | Delta |
|---|---|
| Brainstorm | Replace the broken §1 bullet with a pointer to the shared contract. Recommendations must widen the option space, not steer it (free on mechanical questions, sparing on design direction). Map mode: a parked question **is** fog — it lands in "Not yet specified"; sharp parked questions become tickets. No assumption ledger (artifact-free phase; the Plan restates surviving assumptions). |
| Plan | Questions must close a decision blocking a specific Plan-doc section. A question that would reopen the agreed design is presented as a **proposed backward transition** to Brainstorm, never smuggled into the block. Recommendations expected (their absence signals an un-agreed design). **Draft-first**: present the drafted doc with the block alongside; ask-first only when no credible draft is possible. Assumption tier → written into the doc (gate approval ratifies); Parked tier → the doc's "context for the next agent" section. Scope-boundary questions always carry enumerated alternatives. |
| Spec | Inherits draft-first and tiers-map-onto-artifact. **Behavioural/edge-case questions must be posed as draft scenarios** (stable id, pass/fail, recommendation) ratified by exception — never open "what should happen when X?" questions. Blocking slots are reserved for genuinely open contract/surface decisions; the cap's escape valve is demotion into the draft. `file:line` grounding emphasis on the repo-discoverable-facts rule. |
| Tasks/Build | Question block effectively banned: a blocking question resolves to either a proposed backward transition (upstream gap — the counterfeit-artifact rule's conversational twin) or an assumption (mechanical decomposition call, stated inline). Parked questions attach **per-task** in the build-plan doc entry and are projected into sub-issue bodies at tracker publish; the doc row is the source. |
| Implement | Mid-task interrupts reserved for **external blockers only** (credentials, tooling, billing, permissions — class-based, no number). Everything else batches to the task boundary (validator seam) under the uniform cap; steady-state near zero because upstream flaws go backward and discretionary calls are the agent's, recorded as assumptions. Assumptions get a durable, PR-visible home: an **"Assumptions & discretionary calls"** section in the PR body (+ task close comment when tracker-backed). §10 gains: a dispatched worker's blocking question routes to the dispatching implementer, who applies the triage — one channel to the human. |
| PR review | Escalations arrive **pre-adjudicated** as ratify/amend decisions: finding id + one-line gist + raising reviewers (agreement signal) + recommended disposition with reason. Only **proposed dismissals of high/medium findings** (plus anything touching a previously human-ratified residual-risk boundary) escalate; incorporations are just work. Escalation happens per fix wave, post-consolidation, never streamed, under the uniform cap; overflow means incorporate the cheap ones. **Human-ratified dismissals bind forward** across waves and sessions on the same finding class (recorded in `consolidated.md` with human-ratified attribution) unless new evidence emerges. The panel receives the PR body's assumptions section as named review input. |
## Scope
**In:**
- `skills/sdlc/references/system-reference.md` — new top-level section
  ("Presenting questions to the human"), §6 example-language neutralisation,
  §11 routing row.
- All six `skills/sdlc/references/phase-*.md` — per-phase deltas above.
- `skills/sdlc/assets/pull_request_template.md` and this repo's own
  `.github/pull_request_template.md` — add an "Assumptions & discretionary
  calls" section (empty-allowed), with `phase-pr-review.md` §4 wording that
  names it as **panel input** while preserving the existing "the PR body does
  not carry the local panel's development findings" rule.
- The pre-existing uncommitted async-dispatch guidance in
  `phase-pr-review.md` §5 (async `tasks:` dispatch + react-per-child polling)
  — ratified at the plan gate as folded into this stream and carried as its
  own commit on the feature branch.
**Out:**
- `SKILL.md` kernel (routing via system-reference §11 suffices; keeps the
  frozen kernel surface untouched).
- All `scripts/`, `schema/`, `prompts/` files — no behaviourally-executed
  surface changes; the PR-review delta instructs the orchestrating agent to
  name the assumptions section in its dispatch task text rather than editing
  `prompts/adversary-pr.prompt.md`.
- `templates/sdlc-*.md` standalone entrypoints (verified: they route to the
  references and restate no question guidance).
- Any config schema or FS-numbered contract change (prose-only; FS5/FS8/FS9/
  FS10/FS13 untouched).
## Definition of done
1. `system-reference.md` contains the shared-contract section with the exact
   cap (3–5, uniform, deltas lower-only), the three tiers, the
   overflow-demotes rule, the repo-discoverable-facts rule, and no tool names;
   §11 routes to it; §6's example language no longer names a questions tool.
2. Each of the six phase references contains its delta, phrased as a layer on
   the shared contract (pointer, not restatement).
3. `grep -ri "questions-helper\|questions tool" skills/sdlc/` returns no
   matches.
4. Both PR templates contain the "Assumptions & discretionary calls" section;
   `phase-pr-review.md` §4 names it as panel input without weakening the
   no-findings-in-body rule.
5. Full test suite passes (`npm test`) and lint is clean — including any
   structural tests over the references.
6. The two brainstorm-identified tensions are resolved in the shipped text:
   (a) PR-body wording cannot be read as licence to put panel findings in the
   body; (b) the assumption-accrual point (below) is stated in
   `phase-implement.md`.
## Context for the next agent (including parked questions)
- **Assumption-accrual home (parked from Brainstorm, resolved here as a
  proposed decision):** assumptions accrue during Implement as an
  **"Assumptions" appendix of the build-plan doc** (which exists on both
  tracks and below the tracker threshold), appended per task; PR preparation
  copies the appendix into the PR body section. Gate approval of this plan
  ratifies that choice.
- **Parked to Implement:** whether any existing structural tests assert
  section counts/ordering in `system-reference.md` — discover by running the
  suite before editing; adjust expectations only where the test encodes
  structure rather than behaviour.
- The previously uncommitted async-dispatch diff in `phase-pr-review.md` is
  folded into this stream (gate decision) and committed first on the feature
  branch, so all later edits to that file build on it.
- Reviewer-facing precedent: PR #17 finding-11 and PR #114's reuse of it are
  the motivating examples for the binding-dismissals rule.
## Assumptions ratified by approving this plan
1. Track is **reversible** (prose-only change to skill documentation surfaces;
   trivially revertable; freezes no schema, wire format, or executed
   contract). Under `overrides.reversible`, `review.design: human` — this
   human gate, no plan panel, and no separate Spec phase.
2. The PR-template addition is in scope now (both copies), not parked.
3. Assumption-accrual home is the build-plan appendix, as above.
4. Slug `sdlc-question-discipline`; branch `feat/sdlc-question-discipline`.
# Build plan: Question-presentation discipline (sdlc-question-discipline)
- **Slug:** `sdlc-question-discipline`
- **Date:** 2026-07-19
- **Track:** reversible — no Specification; tasks map to the Plan's
  definition-of-done items (never re-derived).
- **Governing plan:** `docs/plans/2026-07-19-sdlc-question-discipline.md`
  (rev1, approved at the human design gate 2026-07-19)
- **Branch:** `feat/sdlc-question-discipline`
## Decomposition rationale (assumption-tier, stated inline)
Sliced as **two tasks**: the shared contract must land before the six
phase deltas that point at it (a real content dependency, wired as a
`blockedBy` edge), while the deltas + template edits are one coherent slice
because every delta is a thin layer over the same contract and splitting them
six ways would multiply validation ceremony with no independence gained.
Object via a Build correction if this slicing is wrong.
## T1 — Shared question-presentation contract in `system-reference.md`
**Objective.** Add the new top-level section **"Presenting questions to the
human"** to `skills/sdlc/references/system-reference.md` (appended after §13 as
§14; no renumbering of §1–13): single end-of-reply numbered block; one distinct
question per item, one question per sentence; context line only when needed;
enumerated alternatives, never fabricated; at most one reasoned recommendation
per question, never fabricated; **uniform soft cap 3–5 blocking questions per
turn, deltas may only lower it; overflow demotes, never lengthens**; triage
tiers **Blocking / Assumption / Parked**; **never ask a repo-discoverable
fact**; explicitly tool-agnostic. Update §6 "Skills and tools are enhancements"
to neutral example language (no "questions-helper plugin" / "questions tool").
Add a §11 routing-table row for the new section.
**Satisfies plan DoD:** items 1, 3 (system-reference share), 5.
**Checks (exact commands; PV1 manifest projected from this table):**
| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `npm test` | required — full suite green (catches structural tests over references) |
| static | `npx biome check .` | required — repo lint |
| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 1/3/5 |
| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` | required — section exists |
| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` scoped check via `node -e` asserting the §11 routing row also matches (implementer projects exact argv) | required — routed |
| bannedPatterns | `grep -ri "questions-helper" skills/sdlc/references/system-reference.md` and `grep -ri "questions tool" skills/sdlc/references/system-reference.md` | required — pattern must be ABSENT (runner's bannedPatterns semantics: the named pattern occurring is the failure) |
## T2 — Six phase deltas + PR-template assumptions section
**Objective.** Layer the per-phase deltas from the approved plan's "Agreed
design" table onto the shared contract, as pointers-plus-delta (no
restatement), in all six `skills/sdlc/references/phase-*.md`:
- **brainstorm**: replace the broken §1 questions bullet with a contract
  pointer; recommendations widen-not-steer; map mode: parked = fog →
  "Not yet specified"; no assumption ledger.
- **plan**: questions close doc-section-blocking decisions; design-reopening
  questions surface as proposed backward transitions; recommendations
  expected; draft-first; assumption→in-doc / parked→"context for the next
  agent"; scope questions always enumerated.
- **spec**: behavioural/edge-case questions as draft scenarios (id, pass/fail,
  recommendation, ratify-by-exception); blocking slots reserved for
  contract/surface decisions; overflow demotes into the draft; `file:line`
  emphasis on the repo-discoverable rule.
- **tasks**: question block effectively banned (backward transition or
  assumption); mechanical calls stated inline; parked questions attach
  per-task in the build-plan doc, projected to sub-issue bodies; note the
  build-plan **"Assumptions" appendix** contract (plan-ratified accrual home).
- **implement**: mid-task interrupts = external blockers only (class-based);
  all else batches to the validator seam; assumptions accrue in the build-plan
  appendix and land in the PR body's "Assumptions & discretionary calls"
  section (+ task close comment when tracker-backed); §10 gains
  worker-questions-route-to-dispatcher.
- **pr-review**: §5.4 escalation shape (pre-adjudicated ratify/amend: id,
  gist, raising reviewers, recommended disposition + reason); only proposed
  high/medium dismissals and ratified-residual-risk touches escalate;
  per-wave post-consolidation under the cap; human-ratified dismissals bind
  forward (recorded in `consolidated.md`) unless new evidence; §4 names the
  PR body's assumptions section as panel input **without weakening** the
  no-development-findings-in-body rule.
Add the empty-allowed **"Assumptions & discretionary calls"** section to
`skills/sdlc/assets/pull_request_template.md` and
`.github/pull_request_template.md`.
**Satisfies plan DoD:** items 2, 3 (remainder), 4, 5, 6.
**Blocked by:** T1 (the pointer target must exist).
**Checks (exact commands; PV1 manifest projected from this table):**
| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `npm test` | required |
| static | `npx biome check .` | required |
| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 2/3/4/5/6 |
| standards | `grep -l "Presenting questions to the human" skills/sdlc/references/phase-brainstorm.md skills/sdlc/references/phase-plan.md skills/sdlc/references/phase-spec.md skills/sdlc/references/phase-tasks.md skills/sdlc/references/phase-implement.md skills/sdlc/references/phase-pr-review.md` (all six must match; implementer projects the exact all-six assertion argv) | required — every phase delta points at the contract |
| standards | `grep -q "Assumptions & discretionary calls" .github/pull_request_template.md` and same for `skills/sdlc/assets/pull_request_template.md` | required — both templates carry the section |
| bannedPatterns | `grep -ri "questions-helper" skills/sdlc` and `grep -ri "questions tool" skills/sdlc` | required — patterns must be ABSENT across the skill |
## Assumptions (appendix — accrues during Implement; copied into the PR body)
- (build-time) Two-task slicing and the T1→T2 edge, per the decomposition
  rationale above.
- (T1) The shared-contract section wording avoids the repo's S2
  generic-surface banned literals (e.g. the word "handover" is loom-domain);
  "carried forward in the phase's context for the next agent" is the
  sanctioned phrasing.
- (T2) `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`
  S25 anchor updated to the new brainstorm bullet text — one line, outside
  the plan's stated scope, forced by ASD5's living-anchor test when the old
  bullet was replaced. Treated as a discretionary call, not a scope change.
## Tracker projection
Threshold met (2 tasks ≥ `shape.publishToTracker: 2`): one epic
(`sdlc:epic`) + two sub-issues (`sdlc:build-task`) on board 5, T2 wired
`blockedBy` T1. This doc remains canonical; the tracker is a projection.
Now let me read the actual files that were modified, starting with the most critical ones.
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
# pi-sdlc system reference
> The agent-facing system map for pi-sdlc. It answers, from documentation alone,
> what the product is and how to operate its public interface — without reading
> implementation source. It is explanatory and links canonical law rather than
> restating it; detailed per-phase mechanics live in the six
> `references/phase-*.md`. All paths are skill-relative and resolve from an
> installed consumer repository.
## 1. Purpose
pi-sdlc is a portable, project-agnostic software-development lifecycle skill for
pi. It gives a change **one predictable way to enter the codebase**: an enforced
sequence of brainstorm → plan → spec → build → implement → PR review, with
per-phase adversarial review panels and per-task deterministic validation,
driven by a small per-project manifest (`.pi/sdlc/sdlc.config.json`). It is a
framework a repository *adopts*, not a global default.
## 2. Kernel — invariant guarantees and the two tracks
The **iron law** fixes what may not be skipped forward. Backward moves —
returning to an earlier phase when a later one exposes a flaw — are always
allowed and never penalised: the sunk cost of an earlier gate never justifies
shipping a known-wrong design.
Two tracks:
- **Irreversible** — a change that freezes a shape other code, data, or
  extensions bind to: public interfaces, contracts, persisted schemas, wire
  formats, stored-record shapes. Requires brainstorm, plan, spec, build,
  implement, PR; a plan panel **and** a spec panel run pre-PR.
- **Reversible (fast path)** — everything else (internal refactors, docs, tests,
  tooling). Requires brainstorm (may be brief), plan, build, implement, PR; no
  pre-PR design panel, but the PR panel still runs.
When in doubt, use the repo's committed `shape.defaultTrack` (default
`irreversible`). The kernel and the sequence are owned by `SKILL.md`.
## 3. Adoption & readiness
A repository has **adopted** the sdlc when its current `HEAD` commit contains
`.pi/sdlc/sdlc.config.json` — a manifest merely present on disk (untracked,
staged, or ignored) is not adoption. Being **ready** to run under law needs more:
the active manifest must also be clean and valid, its merged `panels` roster
present and valid, and any `.pi/sdlc/workflow.md` readable. `sdlc-status` (FS8,
ADR 0016) proves all of this mechanically with four states (`ready`,
`not-adopted`, `error`, `not-ready`). `SKILL.md` owns the four-state startup
branch table and its exit codes; this reference does not restate the FS8 check
ids or exits.
**Advisory mode** is the escape hatch when a repo has not opted in but the user
still wants sdlc guidance for one session, with the user's explicit in-session
consent. In advisory mode: never use any `announce` string and never claim the
session runs "under law"; prefix every phase marker with `advisory:`; follow the
phase sequence as guidance only; and MUST NOT create or mutate tracker objects,
MUST NOT claim any gate as passed, and MUST NOT stamp panel agents. An `error`
state is never silently downgraded to advisory mode — advisory is not a bypass.
To opt in, run `/setup-sdlc` (see §8).
## 4. Tracks, phases, transitions, gates, refusal
The lifecycle sequence at a glance (the phase/gate table states the **maximal**
shape; which gates actually run, and at what strength, is the repo's committed
config — see §6 and each phase reference's `under your configuration` callouts):
| Phase | Artifact | Detailed contract |
|---|---|---|
| Brainstorm | agreed design (or a map issue) | `references/phase-brainstorm.md` |
| Plan | objectives, rationale, scope, DoD, next-agent context | `references/phase-plan.md` |
| Spec | contracts, interfaces, surface area, falsifiable scenarios | `references/phase-spec.md` |
| Build | task breakdown with checks + scenario ids | `references/phase-tasks.md` |
| Implement | code and tests | `references/phase-implement.md` |
| PR review | the diff, driven to a clean panel | `references/phase-pr-review.md` |
Transitions run forward through the sequence; backward transitions are always
permitted. Gates: `review.design` gates Plan+Spec, `review.code` gates the PR,
`review.tasks` sets per-task validation, `review.brainstorm` sets the brainstorm
gate; per-track `overrides` may adjust them. Refusal and backward behaviour for
each phase is documented in that phase's reference. The shared panel run-shape
(resolve → dispatch → consolidate → adjudicate → stop) is owned by
`references/phase-pr-review.md`, "Panels".
## 5. Public composition inventory (FS11 taxonomy)
The complete public interface is inventoried and completeness-checked by FS11
(`assets/normative-references.json` + `scripts/check-references.mjs`). Every row
carries a `class`:
- **`package-public`** — package-owned public agent-facing surfaces: `SKILL.md`,
  `references/system-reference.md`, the six `references/phase-*.md`, the six
  `templates/sdlc-<slug>.md` standalone entrypoints, `templates/setup-sdlc.md`,
  the `scripts/*.sh` command wrappers (readiness, lifecycle checking, panel
  resolution/stamping, task validation, reference checking, config-doc), the
  `schema/*.json` schemas/examples, and the four `prompts/*.prompt.md` reviewer/
  validator roles.
- **`delegated`** — delegated external skills: `adversarial-review`,
  `dispatch-subagents`, `gh-pr-review-comments`, `sdlc-visual-docs`.
- **`runtime-tool`** — required runtime tools (e.g. `git`, `gh`, `node`).
- **`consumer-integration`** — consumer-configured hooks/integrations: the
  `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
  consumer `.pi/sdlc/CONFIG.md`.
- **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
  rendering, an interactive question-answering aid).
- **`internal`** — implementation internals: the `*.mjs` implementations behind
  `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
  and are not catalogued file by file.
FS11 also carries a `discovery` block naming public roots/glob patterns and a
closed internal-helper exclusion list; `check-references.mjs` walks the discovery
set, subtracts the exclusion list, and asserts every discovered public artifact
has an inventory row (inverse completeness). See `references/phase-*.md` for how
each surface is used, and §10 for the source-inspection boundary.
## 6. Configuration & extension surfaces
- **`sdlc.config.json`** (schemaVersion 3) — the authoritative manifest. It owns
  the configured values; the phase references route every configuration-dependent
  branch to it via `under your configuration` callouts. Its shape is documented in
  `schema/sdlc.config.schema.json` and `schema/sdlc.config.example.json`.
- **`.pi/sdlc/CONFIG.md`** — the generated consumer companion that *explains* the
  effective shape of the committed config. JSON is authoritative; `CONFIG.md`
  explains, never overrides. It is generated/regenerated/checked by the
  `config-doc` module (`scripts/config-doc.sh render|write|check`). Startup reads
  it when current and falls back to authoritative JSON when it is missing, stale,
  or an unrecognized collision (see `SKILL.md`, startup freshness).
### Hooks (local workflow)
A repo may declare local workflow actions in the `hooks` object of
`sdlc.config.json`, so the global process stays identical everywhere while each
repo layers on its own ways of working. Hook phase keys are the six lifecycle
names — `brainstorm`, `plan`, `spec`, `build`, `implement`, `pr` — plus `*`
(every phase). This vocabulary is distinct from the four review-panel phases and
must not be conflated. Each phase key carries optional `before`/`after` arrays of
hook items; each item is exactly one of:
- `{ "run": "<command>" }` — a shell command the agent executes verbatim.
- `{ "use": "skill:<name>" | "tool:<name>", "do": "<intent>" }` — an instruction
  the agent interprets: `tool:<name>` invokes that tool with `do` as the intent
  (missing tool = hook failure); `skill:<name>` loads that skill and performs `do`
  per its instructions (missing skill = hook failure). The `do` text is the
  acceptance criterion.
**Ordering.** `before` hooks fire `*` items first, then phase-specific; `after`
hooks fire phase-specific first, then `*`. Within a list, array order.
**Failure.** A failed or skipped `before` hook **blocks** the phase (report, then
retry, ask, or move backward — do not enter the phase). A failed `after` hook
**warns**: recorded, never blocking.
**Working directory.** A `run` hook executes from the session's current working
root at fire time — the consumer root unless a hook or workflow has legitimately
moved it (e.g. a `before` hook entered a worktree; a worktree is a checkout of the
same repo, so repo-relative commands still resolve). If your workflow uses
worktrees: creating one is not enough — the session's working root must move into
it (create-then-enter). Writing to the main checkout after creating a worktree is
a red flag.
**Announce-on-fire (the audit trail).** Before executing any hook and after it
completes, emit exactly:
```
[sdlc hook] <phase>:<before|after> run$ <command>
[sdlc hook] <phase>:<before|after> use=<use> do=<first 80 chars of do>
[sdlc hook] <phase>:<before|after> result: ok
[sdlc hook] <phase>:<before|after> result: failed (<one-line reason>)
```
A transcript that enters a phase whose `before` hooks lack these lines is a
violation. Hooks are prose law executed by the agent — the same enforcement model
as the iron law; there is no mechanical runner.
**Trust boundary.** `run` hooks execute arbitrary shell commands with the agent's
privileges, from a committed file. They sit inside pi's existing project-trust
boundary: enabling hooks for a repo means trusting that repo's config, exactly as
you already must for `.pi/prompts` and project settings. The agent always echoes
the exact command before running it, and the scaffolder warns whenever it writes a
`run` hook.
### `workflow.md` (prose layer)
An optional `.pi/sdlc/workflow.md` carries local ways-of-working that don't
decompose into hooks (e.g. "no risky merges on Fridays"). At announce, enumerate
each top-level bullet (first line, truncated to 80 chars). The gate/process
conflict rule is owned by `SKILL.md`: *gates* always resolve to the global rule
(local rules may ADD gates, never remove or weaken them); *process* — everything
else — resolves to the local rule.
### Tracker
A project with a `tracker` block can use the two tracker-backed modes (Brainstorm
map mode, Build epic/sub-issue/board). All mutation and board mechanics are owned
once by `assets/tracker-ops.md`.
### Skills and tools are enhancements, not dependencies
Any skill or tool the agent reaches for opportunistically — web research,
codebase exploration, a richer rendering surface, anything named anywhere in
this documentation as a way to do a phase better — is an enhancement, never a
hard dependency a phase blocks on. When it is missing, degrade to the plain
fallback (a direct read/grep for missing research tooling, plain structured
prose for a missing richer surface) and say so, rather than stopping or
refusing to proceed.
Name no external tool as a shipped dependency of the skill itself. **This rule
does not cover hooks:** a `hooks` entry a repo has explicitly configured is a
deliberate, load-bearing contract with the failure semantics above (before=block,
after=warn); a missing `use:` tool/skill on a configured hook is a hook failure,
full stop.
## 7. Artifacts & durable evidence
- **Plan / Spec / Build docs** under the configured `paths.plans` / `paths.specs`.
- **Review artifacts** under `paths.reviews`: one file per model, the shared
  `prompt.md`, and a `consolidated.md` with the adjudication and orchestrating
  model.
- **Validation receipts** under `docs/reviews/task-validate-<feature>-<task-id>-<date>/`,
  verifiable with `scripts/verify-task-receipt.mjs`.
- **Tracker projection** (epic + sub-issues + board) — a live, resumable
  projection of the committed build-plan doc, never the source of truth.
- **ADRs** under `docs/adr/` (see §10, governance).
## 8. Normal full-lifecycle operation and the six standalone entrypoints
**Normal operation:** run `sdlc-status`; on ready, announce and proceed through
brainstorm → plan → spec → build → implement → PR, loading each phase's
`references/phase-*.md` when that phase begins.
**Standalone entrypoints** (`sdlc:<slug>`) let an agent enter a single phase
directly through package-owned prompt templates `templates/sdlc-<slug>.md` — one
lifecycle skill's shared named surfaces, **not** six independently discovered
skills (that is #101). The six slugs are `brainstorm`, `plan`, `spec`, `tasks`,
`implement`, `pr-review`. Their adopted/unadopted degradation contract, the
`sdlc:spec` sampling stamp, and the adopted-config-dominates switch are documented
where each template lives; the switch is driven by the FS8 `adoption.manifest-head`
predicate (an `sdlc-status` `error` stops the entrypoint rather than treating it as
adopted). `sdlc:tasks` and `sdlc:implement` never fabricate scenario ids or check
tables for absent upstream, in any adoption state. See each `references/phase-*.md`
"Purpose and invocation modes" and the `templates/sdlc-<slug>.md` routers.
## 9. Advanced modes
- **Map mode** (Brainstorm, wayfinder-lite) for oversized/foggy efforts — see
  `references/phase-brainstorm.md`, "§9", and `assets/tracker-ops.md`.
- **Tracker-backed Build** (epic + sub-issues + board) above the committed
  `shape.publishToTracker` threshold — see `references/phase-tasks.md`, "§9".
- **Visual gate artefacts** — gate artefacts may be rendered into a self-contained
  interactive HTML view (traceability matrix, contract panel, risk map, DoD
  coverage) with the global `sdlc-visual-docs` skill: declare node IDs in headings
  and edge triples in front matter, then `lint.mjs` / `render.mjs`. This is a
  pointer, not a dependency: renders are ephemeral, never committed as a
  requirement, and never CI-checked.
## 10. Operational troubleshooting and the source-inspection boundary
- **Not ready?** Run `sdlc-status --format json` and read the failing check's
  remediation. When `config.schema-current` fails, the sanctioned actions are to
  pin the older skill release, or re-run `setup-sdlc` (`--force` to replace) —
  there is no pre-adoption config fold-forward. Never hand-edit `schemaVersion` or
  the config shape.
- **Stale `CONFIG.md`?** Run `scripts/config-doc.sh write` to regenerate; startup
  falls back to authoritative JSON meanwhile.
- **Source-inspection boundary.** Source is read **only when changing
  implementation**. Understanding and operating the public interface — everything
  in this reference and the phase references — never requires opening
  implementation source or configuration schemas. Implementation work itself does
  require source inspection; no reference claims otherwise.
Governance: when a decision made anywhere in the lifecycle is hard to reverse,
surprising without context, and the result of a real trade-off — all three — write
it to `docs/adr/` immediately (see `docs/adr/README.md`). Existing flat
locked-decisions lists in a project's governing docs are historical record and are
not migrated. The documentation-authority hierarchy and the generated-explanation
trust model are recorded in ADR 0029.
## 11. Next-read routing (authority map)
| Question | Canonical answer |
|---|---|
| Is this repository adopted and ready? | `sdlc-status` against committed adoption artifacts |
| What global law and sequence apply? | `SKILL.md` kernel/router |
| What does this phase require? | The corresponding `references/phase-*.md` |
| What values has this repository chosen? | `sdlc.config.json` |
| What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
| What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
| What implementation realizes a surface? | Source, only when implementation work requires it |
| How does any phase ask the human for input? | "Presenting questions to the human" (§14, this file) |
## 12. Lifecycle telemetry (FS13)
Every instrumented run keeps a durable manifest of its own lifecycle at
`.pi/sdlc/runs/<slug>/events.jsonl` (git-ignored; the sibling `sdlc-retro`
skill distills it into a committed post-mortem — see that skill's SKILL.md
for the collect/render pipeline once the run store has anything to distill).
Emission is fail-soft everywhere (an unresolvable run identity or an
unwritable store degrades to one stderr warning, never a behavioural change)
and additive-only to every frozen FS5 contract (ADR 0028).
Record these prose-emitted inflection points with
`scripts/record-run-event.sh <event>` (relative to this loaded skill;
headless: `node <skill-dir>/scripts/record-run-event.mjs <event>`) and its
event-type payload:
- **Run start**: once, right after the readiness gate confirms this repo is
  ready and before announcing —
  `record-run-event.sh run.started --payload '{"title":"<feature title>","track":"<irreversible|reversible>"}'`.
- **Every phase entry**: on entering brainstorm/plan/spec/build/implement/pr —
  `record-run-event.sh phase.entered --payload '{"phase":"<phase>"}'`.
- **Every human gate approval**: when the human approves a phase's gate —
  `record-run-event.sh gate.approved --payload '{"phase":"<phase>","artifact":"<path>","rev":<n>,"approver":"human:<slug>"}'`.
- **Panel dispatch**: immediately after dispatching a design or PR panel —
  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<n>,"models":[...]}'`
  — and, harvest-at-dispatch, immediately preserve its artifacts with
  `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`
  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
- **Panel consolidation**: after adjudicating a round's findings —
  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<n>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
- **Caller-side lifecycle-check recording**: right after running
  `check-lifecycle` (itself untouched, FS9) —
  `record-run-event.sh lifecycle.checked --payload '{"verdict":"<verdict>"}'`.
- **PR open**: right after opening the PR —
  `record-run-event.sh pr.opened --payload '{"number":<n>}'`.
- **Fix wave**: after addressing a post-PR reviewer concern with a commit —
  `record-run-event.sh pr.fix_wave --payload '{"number":<n>,"sha":"<short-sha>"}'`.
`resolve-panel.sh`, `ensure-panel-agent.sh`, and `validate-task.sh` emit their
own events automatically (`panel.resolved`, `panel.agent_stamped`,
`task.validated`) after successful completion — nothing to do beyond passing
`--slug` when it isn't resolvable from the current git branch. Per-task
validator dispatch also harvests: immediately after a `task_validate`
subagent completes, run `scripts/harvest-panel.sh --phase task_validate
--round <n> --from <asyncDir>` the same way as a design/PR panel dispatch.
## 13. Stall detection and self-resume
This applies in any phase, live or dispatched, not only Spec. A provider or
transport failure can exhaust its own retries and go quiet — empty assistant
turns, a `stopReason: error`, no further output — leaving the human as the
only thing watching for it. Don't wait for that: after **2 consecutive
turns** end this way (an error-terminated turn with no assistant content),
treat it as a stall, not a stop, and self-issue a continuation/retry before
reporting anything as blocked. Only report a stall to the human if the
self-issued retry also fails.
This is an interim, prose-level mitigation, not a substitute for a genuine
fix: the real fix is a harness-level visible "stalled — retryable" signal and
true auto-resume, which is `pi`/`pi-coding-agent` runtime behaviour this
project does not own or ship. Treat this section as covering the gap until
that exists upstream, not as the final word.
## 14. Presenting questions to the human
Every phase asks the human for input the same way. This section is the single
owner of that contract; each `references/phase-*.md` layers a phase-shaped
delta on top and never restates it. The contract is deliberately
**tool-agnostic**: it depends on no plugin or helper, degrades to plain prose
in any environment, and is by construction the structure an interactive
answering aid extracts well — so no environment detection is ever needed.
**The block.**
- All questions for the human go in **one numbered block, as the last thing in
  the reply** — never scattered through prose.
- One distinct question per numbered item, one question per sentence — no
  compound questions.
- Add a one-line context only when the bare question alone is ambiguous.
- When alternatives exist, list them as a numbered list under the question.
  Never fabricate alternatives — no invented yes/no framing of a genuinely
  open question.
- Mark at most one option per question **"Recommended — because <reason>"**.
  Never a recommendation without a reason; never a fabricated recommendation
  when genuinely neutral.
**The budget.** At most **3–5 blocking questions per turn**: a soft cap
applied with judgment, uniform across phases. A phase delta may only lower it,
never raise it. Overflow **demotes** to a lower tier — it never lengthens the
block.
**The triage tiers.** Every candidate question lands in exactly one:
- **Blocking** — asked now, in the block.
- **Assumption** — not asked; stated explicitly ("Proceeding on the assumption
  that X — object now if wrong"). Where the phase has an artifact, assumptions
  are written into it so the gate ratifies them (see the phase deltas).
- **Parked** — recorded as one line with its destination ("parked to Spec")
  and carried forward in the phase's context for the next agent.
**Never ask a repo-discoverable fact.** A legitimate question is about intent,
priorities, or external state only the human knows. A question about what the
code, config, or docs currently do means the reading was skipped — read first,
using the degraded research fallbacks above when richer tooling is missing.
# Phase reference: Brainstorm
> Detailed public contract for the Brainstorm phase. `SKILL.md` owns the kernel,
> the readiness gate, and the phase sequence; this reference owns Brainstorm's
> mechanics. Paths are skill-relative. Every configuration-dependent branch is an
> explicit **under your configuration** callout routed to the effective shape
> (current `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the
> companion is absent or stale) — never a silently assumed value.
## 1. Purpose and invocation modes
Brainstorm turns an idea into an agreed design. It runs two ways:
- **Full lifecycle:** the first phase, entered after `sdlc-status` reports ready.
- **Standalone entrypoint `sdlc:brainstorm`** (`templates/sdlc-brainstorm.md`):
  a directly invocable dialogue. It needs no committed upstream; unadopted it
  runs as plain dialogue, adopted it runs as the configured gate.
Brainstorm is a live dialogue, not a drafting exercise the agent completes
alone. The agent's job is to be the author's thinking companion: actively
rubber-duck the idea, not agree with it. Going along with whatever the human
says first is a failure mode, not politeness. This applies to both plain
dialogue and map mode below — it is how the conversation runs, not a mode of
its own.
Concrete behaviour, not just tone:
- **Raise a contradiction, or say there isn't one.** Before the gate, name at
  least one contradiction, unstated assumption, or gap in the design if one
  exists. If the design is genuinely clean, state that explicitly ("no
  contradiction found") rather than saying nothing — silence is not evidence of
  soundness.
- **Use the tools available**, not just the conversation, when they would
  actually sharpen the thinking: web research for prior art or external
  grounding, and codebase exploration when the idea touches an existing pattern
  the human might be unaware of or wrongly assuming is novel. This is
  proportional, not mandatory ceremony — a brief brainstorm does not need a
  research pass just to be brief.
- **Present open questions per the shared contract** —
  `references/system-reference.md`, "Presenting questions to the human": one
  numbered end-of-reply block, enumerated alternatives, reasoned
  recommendations, the uniform soft cap, and the Blocking/Assumption/Parked
  triage tiers — never a wall of unstructured prose. Brainstorm's delta: a
  recommendation must **widen the option space, not steer it** — recommend
  freely on mechanical questions (where something should live), sparingly on
  design direction (what something should be). Assumptions stated in dialogue
  need no ledger here: Brainstorm commits no artifact, and the Plan restates
  every assumption that survives.
- **Expand and pressure-test, don't commandeer.** Contradictions and questions
  exist to widen the human's option space, not to steer the design toward the
  agent's own preferred answer. The human remains the owner of the direction;
  the gate is *their* approval, not the agent's conviction.
## 2. Entry conditions and authoritative upstream inputs
No committed upstream artifact is required — Brainstorm forms intent live. Its
authoritative inputs are the human's stated goal and any existing code, docs, or
prior-art the dialogue chooses to ground against.
## 3. Configured before-hook order and blocking semantics
If the effective config declares `hooks.brainstorm.before` (and/or `hooks."*"`),
fire them first. **Before** hooks fire `*` items first, then phase-specific; a
failed or skipped `before` hook **blocks** the phase. See
`references/system-reference.md`, "Hooks", for the full hook contract, ordering,
failure semantics, and the announce-on-fire audit trail.
> **Under your configuration:** the hooks that actually fire are whatever
> `.pi/sdlc/sdlc.config.json` declares for `brainstorm`/`*`. Do not assume any
> repo has brainstorm hooks.
## 4. Required activity and artifact/output shape
The activity is the dialogue itself. Plain brainstorm produces **no committed
artifact** — the agreed design is carried forward into the Plan. Map mode (§9)
produces a GitHub map issue as its canonical, resumable record.
## 5. Invariant gate/approval seam
The invariant seam is **human approval of the agreed design**. The gate is the
human owner's, not the agent's.
> **Under your configuration:** `review.brainstorm` is `human` or `off`. Read the
> effective value from current `CONFIG.md` (or authoritative `sdlc.config.json`).
> When `off`, there is no explicit brainstorm gate, but the design must still be
> agreed before Plan begins; never assume a fixed gate mode.
## 6. Refusal and backward-transition behaviour
Brainstorm refuses nothing on upstream grounds (there is no upstream). Backward
transition into Brainstorm from any later phase is always allowed and never
penalised when a later phase exposes a design flaw — the sunk cost of a later
gate never justifies shipping a known-wrong design.
## 7. After-hook order and warning semantics
If `hooks.brainstorm.after` (and/or `hooks."*"`) are declared, fire them after
the gate: phase-specific first, then `*`. A failed `after` hook **warns**
(recorded, never blocking). Full semantics in `references/system-reference.md`,
"Hooks".
## 8. Completion evidence and next transition
Completion evidence is the human-approved design (plain mode) or a
decision-ready map destination (map mode). The next transition is **Plan**,
using the agreed design as its objective.
## 9. Advanced-mode pointers — map mode (wayfinder-lite)
Default brainstorm is a single dialogue gated by human approval, sized for one
session. Switch to **map mode** when the idea is too large or too foggy for
that: the destination — what reaching the end of this effort's brainstorming
looks like, usually a Plan-ready decision — is not visible yet, and forcing it
into one dialogue would either truncate the thinking or blow the session's
context.
**The map** is a GitHub issue labeled `<LABEL_PREFIX>:map` — the canonical,
resumable artifact for the effort, not a doc. Its body carries: **Destination**
(what reaching the end of this map looks like, one or two lines), **Notes**
(skills to consult, standing preferences), **Decisions so far** (one line per
closed ticket, gisted, linking the ticket for detail), and **Not yet specified**
(the fog — see below). Never restate a ticket's detail on the map; the map is an
index, the ticket is the store.
**Tickets** are native GitHub sub-issues of the map, each typed by label
(`<LABEL_PREFIX>:ticket-research` | `-prototype` | `-grilling` | `-task` — see
`assets/tracker-ops.md` for the label vocabulary and every mutation). Every
ticket is either **HITL** (worked with a live human — it only resolves through
that real exchange; an agent answering its own grilling questions has broken
this) or **AFK** (agent alone), marked explicitly with the `<LABEL_PREFIX>:hitl`
/ `<LABEL_PREFIX>:afk` label alongside its ticket-type label. A session
**claims** a ticket by assigning it to itself before starting work
(`assets/tracker-ops.md`, "Claim by assignment"). Blocking uses the native
`blockedBy` edge so the **frontier** — open, unblocked, unclaimed tickets — is
visible without reopening a conversation.
**Fog of war.** Don't ticket what you can't yet phrase precisely. The test is
whether the question is sharp now, not whether you can answer it now: ticket when
it is already sharp (even if blocked); leave it in **Not yet specified** when you
can't yet phrase it that sharply — write it as loosely as the view allows. A
**parked** question (the shared contract's tier) is fog by another name: in map
mode it lands in Not yet specified rather than a separate ledger, graduating to
a ticket once sharp.
Resolving a ticket clears the fog ahead of it, graduating whatever is now
specifiable into fresh tickets, one at a time.
**Out of scope.** Work beyond the destination is not fog — it is out of scope,
its own map section, never graduating. If a ticket turns out to sit past the
destination, close it and record one line (gist + why) in Out of scope rather
than resolving it on the route.
**Working the map** (never resolve more than one ticket per session): load the
map's low-res body (not every ticket); choose the ticket (the user's choice, or
the first frontier ticket); claim it; resolve it, invoking whatever the ticket
type and `## Notes` call for; record the resolution as a comment, close the
ticket, and append one line to Decisions so far; graduate any fog the answer
specifies into fresh tickets, and rule out of scope anything the answer reveals
is past the destination.
**Exit** the moment the destination is decision-ready — often before every fog
patch has graduated. At that point proceed to Plan normally, using the
destination as its objective. If breadth-first mapping surfaces no fog at all —
the whole effort fits in one session — skip the map and use plain brainstorm
dialogue instead.
Map-mode mechanics (labels, sub-issue/blocking mutations, board discipline) are
owned once by `assets/tracker-ops.md`.
# Phase reference: Plan
> Detailed public contract for the Plan phase. `SKILL.md` owns the kernel,
> readiness gate, and phase sequence; this reference owns Plan's mechanics. Paths
> are skill-relative. Every configuration-dependent branch is an explicit **under
> your configuration** callout routed to the effective shape (current
> `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the companion is
> absent or stale) — never a silently assumed track, gate mode, or panel floor.
## 1. Purpose and invocation modes
Plan fixes the objectives, rationale, scope, definition of done, and context for
the next agent. It runs two ways:
- **Full lifecycle:** entered after an agreed Brainstorm design.
- **Standalone entrypoint `sdlc:plan`** (`templates/sdlc-plan.md`): needs no
  committed upstream; unadopted it runs and forms intent live, adopted it runs as
  the configured gate.
## 2. Entry conditions and authoritative upstream inputs
The authoritative upstream input is the agreed Brainstorm design (or, standalone,
the intent formed live). No committed artifact is required to begin.
## 3. Configured before-hook order and blocking semantics
Fire `hooks.plan.before` (and `hooks."*"`) first: `*` items first, then
phase-specific; array order within a list. A failed or skipped `before` hook
**blocks** the phase. Full contract in `references/system-reference.md`, "Hooks".
> **Under your configuration:** the plan hooks that fire are exactly those
> declared in `sdlc.config.json`; assume none by default.
## 4. Required activity and artifact/output shape
Produce the Plan doc: **objectives, rationale, scope in/out, definition of done,
and context for the next agent**. Its home routes to the configured
`paths.plans`.
**Dialogue discipline.** Ask per the shared contract
(`references/system-reference.md`, "Presenting questions to the human") with
Plan's convergent delta:
- Every blocking question must **close a decision that blocks writing a
  specific Plan section**. A question that would reopen the agreed design is
  not a Plan question — present it as a proposed backward transition to
  Brainstorm (§6), never smuggled into the block.
- **Recommendations are expected**: by Plan the agent holds an agreed design;
  a blocking question with no recommendation signals the design was not
  actually agreed.
- **Draft first**: present the drafted Plan doc with the question block
  alongside it; ask before drafting only when a blocking question prevents any
  credible draft.
- The triage tiers map onto the artifact: **assumptions are written into the
  doc** (rationale/context) so gate approval ratifies them rather than leaving
  them in session scrollback, and **parked questions go into "context for the
  next agent"**. Scope-boundary questions always carry enumerated
  alternatives — "is X in or out" is never posed as open prose.
> **Under your configuration:** the artifact home is `<paths.plans>/<date>-<feat>.md`
> using the committed `paths.plans` value — do not hardcode `docs/plans`.
## 5. Invariant gate/approval seam
The invariant seam is a **design gate plus human approval**. The design gate is
`review.design`; on the irreversible track a plan panel runs before approval.
> **Under your configuration:** `review.design` is one of `panel` | `advisory` |
> `human` | `off`, and per-track `overrides.{irreversible,reversible}` may adjust
> it. On the **reversible** track there is no pre-PR design panel (the PR panel
> still runs); on the **irreversible** track the plan panel runs. Read the
> effective track and `review.design` from current `CONFIG.md` (or authoritative
> `sdlc.config.json`) — never assume `panel`, and never assume the track. When
> `shape.separateSpec: false`, Plan and Spec merge into one gated artifact.
When a panel runs, it follows the shared panel run-shape (resolve → dispatch →
consolidate → adjudicate → stop) owned by `references/phase-pr-review.md`,
"Panels". The reviewer prompt is `prompts/adversary-plan.prompt.md` via the
`plan_review` phase; never hand-copy a prompt per model.
## 6. Refusal and backward-transition behaviour
Plan does not refuse on upstream grounds. Backward transition to Brainstorm is
always allowed when planning reveals the design is unsound.
## 7. After-hook order and warning semantics
Fire `hooks.plan.after` (and `hooks."*"`) after the gate: phase-specific first,
then `*`. A failed `after` hook **warns** (recorded, never blocking).
## 8. Completion evidence and next transition
Completion evidence is the committed Plan doc plus, on the irreversible track,
the consolidated plan-panel artifact under the configured reviews home and human
approval. Next transition is **Specification** (or **Build/Tasks** directly when
`shape.separateSpec: false` merges them, or on the reversible track where Spec is
not required).
> **Under your configuration:** whether a separate Spec follows is set by
> `shape.separateSpec` and the effective track; read it rather than assuming a
> Spec is always next.
## 9. Advanced-mode pointers
None specific to Plan. Oversized/foggy efforts are handled upstream by Brainstorm
map mode (`references/phase-brainstorm.md`).
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
# Phase reference: Specification
> Detailed public contract for the Specification phase. `SKILL.md` owns the
> kernel, readiness gate, and phase sequence; this reference owns Spec's
> mechanics. Paths are skill-relative. Every configuration-dependent branch is an
> explicit **under your configuration** callout routed to the effective shape
> (current `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the
> companion is absent or stale) — never a silently assumed track, gate mode, or
> separate-Spec setting.
## 1. Purpose and invocation modes
Specification fixes the contracts, interfaces, surface area, functional and
non-functional requirements, and the falsifiable verification scenarios (stable
ids, pass/fail conditions). It runs two ways:
- **Full lifecycle:** entered after an approved Plan on the irreversible track
  (or the merged Plan+Spec artifact when `shape.separateSpec: false`).
- **Standalone entrypoint `sdlc:spec`** (`templates/sdlc-spec.md`): needs a
  committed plan doc. Unadopted with no committed plan it may **stamp-and-interview**
  (see `references/system-reference.md`, "Standalone entrypoints", for the stamp
  contract); adopted with no committed plan it **refuses and redirects** to
  `sdlc:plan`.
The Spec defines verification **scenarios** — falsifiable acceptance criteria
with stable ids and pass/fail conditions — **not** implementation test code. A
scenario that cannot be made to fail is a broken spec.
## 2. Entry conditions and authoritative upstream inputs
The authoritative upstream input is the committed, approved Plan doc. On the
reversible track a Specification is **not** required and must not be demanded.
> **Under your configuration:** whether Spec is a required phase depends on the
> effective track and `shape.separateSpec`. Read them; do not assume Spec always
> runs.
## 3. Configured before-hook order and blocking semantics
Fire `hooks.spec.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
contract in `references/system-reference.md`, "Hooks".
## 4. Required activity and artifact/output shape
Produce the Spec doc: **contracts, interfaces, surface area, functional and
non-functional requirements, and falsifiable verification scenarios with stable
ids**. Its home routes to the configured `paths.specs`.
**Dialogue discipline.** Ask per the shared contract
(`references/system-reference.md`, "Presenting questions to the human") and
Plan's draft-first rule, with Spec's delta:
- **Behavioural and edge-case questions are posed as draft scenarios, never
  open questions**: not "what should happen when X?" but "SN: when X → Y
  (pass) / Z (fail). Recommended: Y — because …", ratified or amended by
  exception. Drafted scenarios are Spec's assumption tier: gate approval
  ratifies them.
- The blocking slots are reserved for genuinely open **contract/surface
  decisions** the agent cannot responsibly settle alone; the cap's escape
  valve is demotion into the draft, never a longer block — edge cases
  legitimately number in the dozens and belong in the draft as recommended
  scenarios.
- Never ask the human what the code currently does: the same `file:line`
  grounding demanded of panel reviewers applies to the authoring agent's
  questions — legitimate questions are about intent.
> **Under your configuration:** the artifact home is `<paths.specs>/<date>-<feat>.md`
> using the committed `paths.specs` value — do not hardcode `docs/specs`.
## 5. Invariant gate/approval seam
The invariant seam is a **design gate grounded in the code, plus human
approval**. On the irreversible track a spec panel runs, grounded against the
repository at a named commit.
> **Under your configuration:** `review.design` (`panel` | `advisory` | `human` |
> `off`), possibly adjusted by per-track `overrides`, sets the spec gate. Read the
> effective value from current `CONFIG.md` (or authoritative `sdlc.config.json`);
> never assume `panel`. When `shape.separateSpec: false`, there is no separate
> spec gate — the merged Plan+Spec artifact carries one design gate.
When a panel runs it follows the shared panel run-shape owned by
`references/phase-pr-review.md`, "Panels", via the `spec_review` phase; the
reviewer prompt is `prompts/adversary-spec.prompt.md`. Reviewers are grounded
in the code and must cite `file:line` for any framework claim.
## 6. Refusal and backward-transition behaviour
Standalone `sdlc:spec` refuses-with-redirect when adopted and no committed plan
exists. Backward transition to Plan or Brainstorm is always allowed when the Spec
reveals an upstream flaw.
## 7. After-hook order and warning semantics
Fire `hooks.spec.after` (and `hooks."*"`) after the gate: phase-specific first,
then `*`. A failed `after` hook **warns** (recorded, never blocking).
## 8. Completion evidence and next transition
Completion evidence is the committed Spec doc, the consolidated spec-panel
artifact under the configured reviews home, and human approval. Next transition
is **Build/Tasks** (`references/phase-tasks.md`).
## 9. Advanced-mode pointers
None specific to Spec.
# Phase reference: Build / Tasks
> Detailed public contract for the Build phase. Its `#38` standalone-entrypoint
> surface is named `sdlc:tasks`; the internal phase name, the `*-build.md`
> artifact suffix, the `sdlc:build` hook key, and the `sdlc:build-task`/`sdlc:epic`
> tracker labels stay "build". `SKILL.md` owns the kernel and phase sequence; this
> reference owns Build's mechanics. Paths are skill-relative. Every
> configuration-dependent branch is an explicit **under your configuration**
> callout routed to the effective shape (current `.pi/sdlc/CONFIG.md`, or
> authoritative `sdlc.config.json` when absent/stale).
## 1. Purpose and invocation modes
Build decomposes the vetted Spec into a task breakdown: each task names its check
commands and the scenario ids it satisfies, pulled from the Spec, never
re-derived. It runs two ways:
- **Full lifecycle:** entered after an approved Spec (or the merged Plan+Spec
  artifact / reversible-track Plan).
- **Standalone entrypoint `sdlc:tasks`** (`templates/sdlc-tasks.md`): needs
  committed scenario ids upstream. With absent upstream it **always
  refuses-with-redirect** in both adoption states and **never fabricates scenario
  ids or check tables** (the counterfeit-artifact rule).
## 2. Entry conditions and authoritative upstream inputs
The authoritative upstream input is the committed Spec's falsifiable scenarios
(or, on the reversible track, the approved Plan's definition of done). Build
never invents scenario ids for absent upstream.
## 3. Configured before-hook order and blocking semantics
Fire `hooks.build.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
contract in `references/system-reference.md`, "Hooks".
## 4. Required activity and artifact/output shape
Produce the committed build-plan doc — the canonical task breakdown carrying
objectives, rationale, check commands, and scenario ids per task. Its home routes
to the configured `paths.plans` as `<date>-<feat>-build.md`. This doc stays the
authoritative record even when it is also projected to the tracker.
**Dialogue discipline.** Build expects **zero blocking questions**
(shared contract: `references/system-reference.md`,
"Presenting questions to the human"). A genuinely blocking question here almost always means the Spec's
scenarios or the Plan's definition of done are incomplete — present it as a
proposed backward transition (§6). This is the counterfeit-artifact rule's
conversational twin: Build papers over an upstream hole with neither
fabricated ids nor questions. Mechanical decomposition choices — granularity,
ordering, blocking edges, a near-threshold publish call — are the agent's
derivation calls: state them inline as assumptions and proceed; the committed
build-plan doc is the reviewable record, and a gateless phase manufactures no
approval interaction. A question **parked to Implement attaches to the
build-plan doc entry of the task it affects** (projected into the sub-issue
body above threshold; the doc row is the source), so the claiming session sees
it at claim time. The build-plan doc also carries an **"Assumptions"
appendix** — the accrual home Implement appends discretionary calls to as
tasks complete (`references/phase-implement.md`).
> **Under your configuration:** the artifact home uses committed `paths.plans`;
> do not hardcode `docs/plans`.
## 5. Invariant gate/approval seam
Build has **no gate of its own** — it is derived from the vetted Spec. Its output
is validated downstream, per-task, during Implement.
> **Under your configuration:** whether the breakdown is also published to the
> tracker depends on `shape.publishToTracker` (see §9); the gate seam itself does
> not vary.
## 6. Refusal and backward-transition behaviour
Standalone `sdlc:tasks` refuses-with-redirect when its committed scenario/id
upstream is absent, in any adoption state, emitting no fabricated ids or check
tables. Backward transition to Spec/Plan is always allowed when decomposition
reveals an upstream gap.
## 7. After-hook order and warning semantics
Fire `hooks.build.after` (and `hooks."*"`) after the breakdown: phase-specific
first, then `*`. A failed `after` hook **warns** (recorded, never blocking).
## 8. Completion evidence and next transition
Completion evidence is the committed build-plan doc (and, above threshold, its
tracker projection). Next transition is **Implement** (`references/phase-implement.md`).
## 9. Advanced-mode pointers — tracker-backed Build (epic + sub-issues + board)
The committed build-plan doc stays the canonical task breakdown — objectives,
rationale, check commands, and scenario ids per task never live only in the
tracker. When that breakdown has at least the committed `shape.publishToTracker`
count of tasks, publish it as tracker objects too, so the work is visible and
resumable across sessions:
- One **epic issue** (label `<LABEL_PREFIX>:epic`), body linking the plan/spec/
  build-plan docs and restating the definition of done.
- One **native sub-issue per task** (label `<LABEL_PREFIX>:build-task`, wired via
  `addSubIssue`), body written to `assets/agent-brief.md`'s template: the task's
  check commands and the scenario ids it satisfies, pulled from the build plan,
  never re-derived.
- **Blocking edges** (`addBlockedBy`) only where a task genuinely can't start
  before another finishes — most tasks in a well-sliced build have none and stay
  simultaneously open.
- Every issue added to the shared board (one reusable, org-owned board, never one
  per epic — see `assets/tracker-ops.md`), moving `Todo → In Progress` on claim,
  `→ In Review` when its PR opens, `→ Done` on merge/close, `→ Blocked` on an
  external stall. The epic itself moves to `Done` only once every sub-issue is
  closed.
> **Under your configuration:** the publish threshold is the committed
> `shape.publishToTracker` count (the value is authoritative; `"never"` disables
> the publish step). A build below the threshold (or any build when it is
> `"never"`) stays a plain committed build-plan doc — the tracker overhead is not
> proportionate. A project without a `tracker` block cannot use this mode.
**Implement** then works the board's frontier one sub-issue at a time, same
discipline as working a map: claim before starting, close and update the board on
completion, and let a PR's `Closes #<sub-issue>` list do the bookkeeping. The
tracker is a **projection** of the committed docs, never the source of truth — if
they disagree, the doc wins and the tracker gets corrected, which is why the CI
presence-check keeps reading committed docs, not issues. All sub-issue/blocking
mutations and board mechanics are owned once by `assets/tracker-ops.md`.
# Phase reference: Implement
> Detailed public contract for the Implement phase. `SKILL.md` owns the kernel
> and phase sequence; this reference owns Implement's mechanics, including the
> per-task validator. Paths are skill-relative. Every configuration-dependent
> branch is an explicit **under your configuration** callout routed to the
> effective shape (current `.pi/sdlc/CONFIG.md`, or authoritative
> `sdlc.config.json` when absent/stale).
## 1. Purpose and invocation modes
Implement turns the vetted Build breakdown into code and tests on the feature
branch. It runs two ways:
- **Full lifecycle:** entered after an approved Build breakdown.
- **Standalone entrypoint `sdlc:implement`** (`templates/sdlc-implement.md`):
  needs committed tasks/build with named checks. With absent upstream it
  **always refuses-with-redirect** in both adoption states and **never fabricates
  check tables**.
The implementer writes real tests **test-first** (watch them fail, then
implement) and treats the spec scenarios as the **floor, not the ceiling**.
## 2. Entry conditions and authoritative upstream inputs
The authoritative upstream input is the committed build-plan doc (and its tracker
projection above threshold): each task's check commands and the scenario ids it
satisfies. Work the board's frontier one sub-issue at a time when tracker-backed;
claim before starting.
## 3. Configured before-hook order and blocking semantics
Fire `hooks.implement.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. A common
`implement.before` hook creates **and enters** a worktree — the session's working
root must move into it (create-then-enter); writing to the main checkout after
creating a worktree is a red flag. Full hook contract, working-directory rule,
and announce-on-fire audit trail in `references/system-reference.md`, "Hooks".
> **Under your configuration:** the implement hooks that fire are exactly those
> declared in `sdlc.config.json`; do not assume a worktree hook exists.
## 4. Required activity and artifact/output shape
Produce code and tests on the feature branch (worktree or checkout per the
project's hooks/workflow). Each task's checks are whatever its approved Build task
declared.
**Dialogue discipline.** Implement lowers the interrupt surface of the shared
contract (`references/system-reference.md`,
"Presenting questions to the human") to near zero:
- **Mid-task interrupts are reserved for external blockers only** — missing
  credentials, broken or absent tooling, billing/rate exhaustion, permissions:
  cases where proceeding is impossible and no repository reading helps.
- Everything else batches to the **task boundary** (the validator seam) under
  the uniform cap. Expected steady state is near zero: an upstream flaw is a
  backward transition (§6), and a discretionary implementation choice the
  upstream deliberately left open is the agent's call, recorded as an
  assumption — asking the human to make it is ceremony, not care.
- Assumptions accrue in the build-plan doc's **"Assumptions" appendix** as
  tasks complete (plus the task's close comment when tracker-backed) and are
  copied into the PR body's **"Assumptions & discretionary calls"** section at
  PR preparation, where the panel reads them as review input
  (`references/phase-pr-review.md`).
## 5. Invariant gate/approval seam — the per-task validator
The invariant seam is per-task validation selected by `review.tasks`:
- `subagent` (default): each task ends with one **validator subagent**, a
  checklist executor, not a judge.
- `self`: the implementer runs the same declared checks directly (no subagent
  dispatch; `resolve-panel task_validate` refuses).
- `off`: per-task validation is skipped entirely — no manifest, runner, receipt,
  or PASS gate is required.
> **Under your configuration:** read the effective `review.tasks` value from
> current `CONFIG.md` (or authoritative `sdlc.config.json`); never assume
> `subagent`. Per-track `overrides` may adjust it.
Validation is **portable and deterministic**: the task's checks are whatever its
approved Build task declared, never a language or tool the skill imposes. There
is no unconditional `npx tsc --noEmit` and no assumed `CONTRIBUTORS` file — a
TypeScript task declares `tsc`, a JavaScript task declares `node --check` and its
linter, another repo declares its own tools.
Under `subagent` or `self`, every task carries a committed **PV1 validation manifest**
(`<repository validation home>/<feature>/<task-id>.json`, schema
`schema/task-validation-manifest.schema.json`) projected from its canonical Build
task. It names, as exact argv arrays, the task's checks across five categories —
`tests`, `static`, `scenarios`, `standards`, `bannedPatterns` — each `required`
or `n/a` with a Build-approved reason, plus the mapping from each owned
Specification scenario to the required checks that evidence it.
The **deterministic runner** (`scripts/validate-task.sh` → `validate-task.mjs`,
surface PV2) — not the model — validates the manifest, executes only its declared
argv with no shell, evaluates categories and scenarios, bounds and redacts command
evidence, and returns `PASS` (exit 0), `FAIL` (exit 1), or `ERROR` (exit 2).
Build, not the validator, owns which commands run and which categories are `n/a`;
the validator cannot invent a command, weaken a check, or decide applicability.
Under `subagent`, the validator subagent (`prompts/validator-task.prompt.md`) runs
the runner, confirms exit and report verdict agree, and reports each result; under
`self` the implementer runs the runner directly. A nonzero runner result blocks
task completion; a task is not done until the runner returns PASS. Each task stores
a runtime receipt (manifest copy, runner report, hashes, verdicts, plus the
generated-agent copy and model under `subagent`) under
`docs/reviews/task-validate-<feature>-<task-id>-<date>/`, verifiable with
`scripts/verify-task-receipt.mjs`. Judgement review happens later at the PR panel.
> **Under your configuration:** the task-validator model preference is
> `deepseek/deepseek-v4-flash`, then `anthropic/claude-haiku-4-5` — a `:low` (or
> `:off`) thinking suffix fits this checklist-executor role. The effective roster
> resolves from the committed `panels` block via `resolve-panel task_validate`.
## 6. Refusal and backward-transition behaviour
Standalone `sdlc:implement` refuses-with-redirect when its committed
tasks/build upstream is absent. A failing validator blocks the task, not the
whole lifecycle. Backward transition to Build/Spec is always allowed when
implementation reveals an upstream flaw.
## 7. After-hook order and warning semantics
Fire `hooks.implement.after` (and `hooks."*"`) after each unit of work:
phase-specific first, then `*`. A failed `after` hook **warns** (recorded, never
blocking).
## 8. Completion evidence and next transition
Completion evidence is passing tests, per-task PASS receipts (under `subagent`/
`self`), and closed sub-issues (tracker-backed). Next transition is **PR review**
(`references/phase-pr-review.md`).
## 9. Advanced-mode pointers
Tracker-backed frontier work is described in `references/phase-tasks.md`, "§9".
## 10. Dispatching implementation workers
When Implement delegates a task to a subagent rather than building in the
surface directly, give it the same shape every time:
- **Scope, stated as a stop-condition.** Name exactly the task's check
  commands and Definition-of-Done items as the boundary of its work, and say
  plainly not to explore or fix adjacent things past that boundary.
- **A `toolBudget`/`turnBudget` by default.** Attach a bounded budget (the
  `subagent` tool's own `toolBudget: { soft, hard }` / `turnBudget: {
  maxTurns, graceTurns }` parameters) so a worker drifting past scope is
  nudged, then finalized, without a human having to notice and intervene.
- **A canonical "finalize now" resume message** for a worker caught
  exploring past scope: "You were exploring past this task's stated scope.
  Stop investigating and finalize your current change against the stated
  check commands now." Reuse this wording rather than improvising a new one
  each time.
- **Workers never triage for themselves.** A dispatched worker's blocking
  question returns to the dispatching implementer — its stop-condition and
  budget shape already imply this — and the implementer applies the shared
  contract's triage tiers. One channel to the human, never one per worker.
- **Infra failure gets one automatic retry; no verdict does.** If a
  dispatched worker's run ends in an **infra-class failure** — a process
  crash, an out-of-memory kill, overload or billing exhaustion, a provider
  timeout, a transport/tool error, or empty output — that is infrastructure
  noise, not a REVISE/FAIL verdict from the model. Retry that exact dispatch once, automatically, before treating it as
  needing human attention. A second consecutive infra failure on the same
  dispatch, or any model-authored verdict, surfaces to the human as normal —
  never silently retried away.
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
# Phase reference: PR review
> Detailed public contract for the PR phase. This reference is also the **single
> owner** of the shared panel run-shape (resolve → dispatch → consolidate →
> adjudicate → stop) used by the Plan and Spec design panels, which link here
> rather than restating it. `SKILL.md` owns the kernel and phase sequence. Paths
> are skill-relative. Every configuration-dependent branch is an explicit **under
> your configuration** callout routed to the effective shape (current
> `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when absent/stale).
## 1. Purpose and invocation modes
PR review runs the panel against the finished branch and drives the diff to a
clean opening. It runs two ways:
- **Full lifecycle:** the final phase, after Implement.
- **Standalone entrypoint `sdlc:pr-review`** (`templates/sdlc-pr-review.md`):
  needs no committed upstream (the diff is self-contained). Unadopted it applies a
  small fixed panel default and offers an **optional, skippable grounding prompt**
  for existing design material, disclosing grounded-vs-diff-only; adopted it runs
  the committed `pr_review` gate at the committed mode/floors, never below them.
## 2. Entry conditions and authoritative upstream inputs
The authoritative input is the final committed branch diff. On the irreversible
track the linked governing docs (plan, Specification, Build plan) ground the
panel; on the reversible track the plan and Build plan ground it and a
Specification must not be demanded.
## 3. Configured before-hook order and blocking semantics
Fire `hooks.pr.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
contract in `references/system-reference.md`, "Hooks".
## 4. Required activity and artifact/output shape — the PR body and cycle
Prepare the PR body from `.github/pull_request_template.md`: declare the track and
slug, link governing documents per track — irreversible: plan, Specification,
Build plan; reversible: plan and Build plan, never a Specification; none: a reason
— and, for a tracker-backed Build, list the epic, every task sub-issue, and the
shared board. Add `Closes #<task-issue>` for each task completed by merging the
PR; use the explicit no-tracker exemption for a below-threshold (per
`shape.publishToTracker`) or `track: none` change. The PR body describes the
change for its audience; it does not carry the local panel's development findings.
It **does** carry an **"Assumptions & discretionary calls"** section
(provisioned by the PR template, empty-allowed): the assumptions accrued during
Implement, copied from the build-plan doc's appendix
(`references/phase-implement.md`). That section is **input to** the PR panel —
named review material for the judgement pass — never a channel for panel
findings; the no-development-findings rule above is unchanged.
Every PR declares its track in the template's `sdlc` declaration block
(provisioned by setup). The `check-lifecycle` script verifies the declared track's
artifacts are committed: run it locally before opening the PR; in CI it runs
wherever the repository has configured the shipped workflow or the documented
snippet. The declaration values are `irreversible`, `reversible`, or `none`;
lifecycle tracks require a slug, and `none` requires a reason. Auto-generated
`[bot]` PRs without a valid declaration are exempt; a valid present declaration
always dominates. Before opening the PR, run the local lifecycle checker from the
installed skill path:
```bash
node <skill-dir>/scripts/check-lifecycle.mjs --body pr-body.md --repo-root .
```
`track: none` is an exemption declaration, not a third lifecycle track; it
requires a reason and its honesty remains PR-panel prose law. CI enforcement is
conditional on the repository configuring the shipped workflow or snippet.
## 5. Invariant gate/approval seam — the panel run-shape
Each design panel (Plan, Spec) and the PR panel run the **same shape**. The four
phase reviewer prompts are the single sources of truth in `prompts/`; never
hand-copy a prompt per model.
1. **Resolve the panel** for the phase (live, deduped, author-excluded):
   ```bash
   scripts/resolve-panel.sh <plan_review|spec_review|pr_review|task_validate> --author <provider/model>
   ```
   It reads the merged config's `panels` block, keeps models with credentials, and
   applies the configured phase floor and author-exclusion rule under the config's
   shortfall posture. Add `--pong` for a live smoke test (costs a call per
   candidate; off by default). When `resolve-panel` prints a `proceed`-mode
   shortfall advisory, carry it into that phase's consolidated writeup and, at PR
   phase, into the PR itself as a comment or adjudication note. Do not commit a
   standalone decision log for the shortfall.
   > **Under your configuration:** the per-phase floor is `review.panelSize` or a
   > `panels.phases.<phase>.panelSize` override, and shortfall handling is
   > `review.onShortfall` (`fail` = hard-fail below the floor; `proceed` =
   > best-effort and surface it). Read the effective values from current
   > `CONFIG.md` (or authoritative `sdlc.config.json`); never assume a floor.
2. **Dispatch** the phase template across the resolved models. Two paths:
   - in-harness (default in a live pi session): stamp the phase's project prompt
     into ONE model-agnostic, project-scoped agent, then dispatch it once per
     resolved model via the `subagent` tool's per-task `model` override (one agent
     reused across the panel, not one file per model):
     ```bash
     scripts/ensure-panel-agent.sh pr_review   # writes .pi/agents/<prefix>-pr-review.md
     scripts/resolve-panel.sh pr_review --author <provider/model> --emit-tasks <prefix>-pr-review
     ```
     `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
     its task value with the exact review task: name the artifact paths, commit,
     governing documents, grounding rule, and required findings-only output. Dispatch
     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
     not as a blocking call: a blocking multi-model dispatch only returns control after
     every reviewer finishes, so a reviewer that crashes in the first second still sits
     unactioned until the slowest sibling completes minutes later. Async dispatch
     returns immediately with one run id/`asyncDir` covering every child in the panel.
     Per-model attribution comes back on each task's `result.model` once you read it.
     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
     `cd`-ed cwd). Consult the project's governing documents (for example
     `AGENTS.md`) for any local sub-agent gotchas.
   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
     stamps one prompt file across `--model` flags.
   Give each reviewer the exact inputs: the artifact under review, the upstream
   artifacts it must be consistent with, the repo path and commit, the PR body's
   "Assumptions & discretionary calls" section as named review material, and the
   grounding rule (cite `file:line` for any framework claim). For `pr_review`,
   populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
   from the linked documents before dispatch; never send literal placeholders. On
   the reversible track, provide the plan and Build plan only and explicitly state
   that a Specification must not be demanded.
   **Before you fan out** (either path): confirm the `subagent` tool is actually in
   your toolset. If it is missing in a live pi session, the fix is a session reload
   (the plugin registers tools at session start), NOT a switch to the detached path
   or a claim that you are outside pi. For a read-only research fan-out inside a
   worktree, dispatch the project `researcher-readonly` agent (no `write` tool,
   returns the brief inline) so children never block on a forbidden write. Prefer
`wait({ all: true })` over status-polling for read-only fan-out, and read a
child's transcript before treating a "detached" status label as lost output.
   **React per-child, not per-batch.** Once dispatched async, poll
   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
   once every child in that run finishes) at a short interval; a `wait({ id:
   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
   timeout returns control without stopping the run. Diff each poll's per-child
   status against the last one: the moment any child shows an infra failure (see
   below) rather than a verdict, act on it immediately — do not wait for the other
   panelists still running. A replacement dispatch for that model is a brand-new,
   separate async `subagent` single-agent call, not folded back into the original
   `tasks:` array, so it runs alongside whichever siblings from the first batch are
   still going. Keep polling until every original child and every replacement is
   accounted for.
   **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
   candidate pool, not merely documentation. A reviewer that returns a model
   verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
   never silently replaced. A reviewer that fails before producing a verdict —
   including crash, OOM, overload/billing exhaustion, timeout, transport/tool
   failure, or empty output — is an infra failure: retry that model once when the
   failure may be transient, then replace it with the next untried, credentialed
   model in that phase's configured `prefer` list. Do not count a failed model
   against the configured panel floor. Continue through the ordered candidate
   pool until the panel floor is met or the pool is exhausted. Only then apply
   `review.onShortfall`: `fail` stops and asks the human; `proceed` records the
   shortfall and continues. Never substitute an unconfigured model or treat an
   infra failure as a reviewer verdict.
   **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
   panel, record `panel.dispatched` and preserve the panel's artifacts with
   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
   then `panel.consolidated` after adjudication — see
   `references/system-reference.md` ("Lifecycle telemetry") for the event map.
3. **Consolidate**: collapse duplicates into one issue, keep cross-model agreement
   as signal, preserve genuine disagreement.
4. **Adjudicate**: for every high or medium finding, either incorporate it or
   record a one-line reason for dismissal. Disclose the orchestrating model in the
   consolidated file. Disputed high or medium findings are decided by the project's
   human owner, who is the final adjudicator. Reviewer output is roughly eighty per
   cent right and overreaches, so nothing is actioned blindly and nothing is
   dismissed silently.
   Escalate disputes to the human per the shared contract
   (`references/system-reference.md`, "Presenting questions to the human") with
   the PR delta: escalations reach the human **once per fix wave, after
   consolidation, never streamed as reviewers return**, and arrive
   **pre-adjudicated** as ratify/amend decisions — each escalated finding
   carries its id, a one-line gist, the reviewers who raised it (cross-model
   agreement is signal), and the agent's recommended disposition with its
   reason. Only **proposed dismissals of high or medium findings** — plus
   anything touching a previously human-ratified residual-risk boundary —
   escalate; incorporating a finding is agreement and needs no permission.
   Overflow past the cap usually means incorporate the cheap ones rather than
   argue them. A **human-ratified dismissal binds forward**: record it in
   `consolidated.md` with its human-ratified attribution and do not re-litigate
   the same finding class in later waves or later sessions unless new evidence
   emerges.
5. **Stop** when no high or medium finding survives adjudication. Low findings are
   recorded, not blocking. Termination is measured against surviving findings, so a
   ruthless panel that always emits nits still converges.
Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
adjudication and the orchestrating model.
> **Under your configuration:** whether a Plan panel and a Spec panel run at all
> depends on the effective track and `review.design`; the PR panel runs on both
> tracks. `review.code` (`panel` | `advisory` | `human` | `off`) sets the PR gate
> strength. Read them; never assume `panel`.
Run the local PR panel against the final committed branch, consolidate and
adjudicate its findings in the durable internal review artifact under
`docs/reviews/`, and repeat after each fix wave until no high or medium survives.
This is the pre-PR sense check that the branch is a finished artefact; retain the
artifact for future analysis, but do not add development findings to the PR body
or post them as GitHub review comments.
## 6. Refusal and backward-transition behaviour
Merging with a high or medium finding that survived adjudication is forbidden.
Backward transition to any earlier phase is always allowed when the panel exposes
a design flaw. Only after the panel is clean, open the PR with the clean body.
## 7. After-hook order and warning semantics
Fire `hooks.pr.after` (and `hooks."*"`) after the PR opens: phase-specific first,
then `*`. A failed `after` hook **warns** (recorded, never blocking).
## 8. Completion evidence and next transition
Completion evidence is a clean panel (no surviving high/medium), a passing
`check-lifecycle`, and the opened PR with its clean body. **Completion is
machine-checked, not narrated.** After the PR exists, do not state that the
Implement/PR phase is "complete" or "PASS" without first running:
```bash
node <skill-dir>/scripts/check-completion.mjs --claim pr-open --slug <slug> --closes <n> [--closes <n> ...]
```
This checks the pushed branch, open PR, matching valid declaration, and GitHub's
native closing-issue references. After merge, do not state that the tracked
effort is finished without running:
```bash
node <skill-dir>/scripts/check-completion.mjs --claim epic-done --epic <epic-number> --pr <pr-number>
```
This checks every native epic sub-issue is closed and that the named merged PR
closes all of them. Either check failing means the claim is false; state what's
missing instead of declaring done. If a GitHub reviewer
raises a new concern after opening, focus it with an inline comment, address it
with a commit, reply with that commit's short SHA, and rerun the panel and the
`pr-open` check before updating the PR. The post-PR review is for new reviewer
concerns, not a transcript of the local sense check. The lifecycle completes on
merge.
## 9. Advanced-mode pointers
Gate artefacts may be rendered to a self-contained interactive HTML view with the
global `sdlc-visual-docs` skill — a pointer, not a dependency (see
`references/system-reference.md`, "Advanced modes").
<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
```sdlc
track: reversible
slug: replace-with-feature-slug
```
## Governing documents
- Irreversible: link the plan, Specification, and Build plan.
- Reversible: link the plan and Build plan; no Specification is required.
- None: replace `slug:` with `reason:` and explain the exemption.
## Tracker references
For a tracker-backed Build (two or more tasks), link the epic and every task
sub-issue. Use `Closes #<task-issue>` for task issues completed by merging this
PR. For a single-task or `track: none` change, write `N/A — no tracker-backed
Build` and explain briefly.
- Epic: `#<epic-issue>`
- Tasks: `#<task-issue>`, `#<task-issue>`
- Board: `<TRACKER_BOARD>`
## Assumptions & discretionary calls
Assumptions and discretionary implementation choices accrued during Implement,
copied from the build-plan doc's "Assumptions" appendix. Review input for the
PR panel — not a place for panel findings. Write `None` when nothing accrued.
<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
```sdlc
track: reversible
slug: replace-with-feature-slug
```
## Governing documents
- Irreversible: link the plan, Specification, and Build plan.
- Reversible: link the plan and Build plan; no Specification is required.
- None: replace `slug:` with `reason:` and explain the exemption.
## Tracker references
For a tracker-backed Build (two or more tasks), link the epic and every task
sub-issue. Use `Closes #<task-issue>` for task issues completed by merging this
PR. For a single-task or `track: none` change, write `N/A — no tracker-backed
Build` and explain briefly.
- Epic: `#<epic-issue>`
- Tasks: `#<task-issue>`, `#<task-issue>`
- Board: `<TRACKER_BOARD>`
## Assumptions & discretionary calls
Assumptions and discretionary implementation choices accrued during Implement,
copied from the build-plan doc's "Assumptions" appendix. Review input for the
PR panel — not a place for panel findings. Write `None` when nothing accrued.
Now let me verify the committed base for key claims and check the disposition ledger update:
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
# Phase reference: Brainstorm
> Detailed public contract for the Brainstorm phase. `SKILL.md` owns the kernel,
> the readiness gate, and the phase sequence; this reference owns Brainstorm's
> mechanics. Paths are skill-relative. Every configuration-dependent branch is an
> explicit **under your configuration** callout routed to the effective shape
> (current `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the
> companion is absent or stale) — never a silently assumed value.
## 1. Purpose and invocation modes
Brainstorm turns an idea into an agreed design. It runs two ways:
- **Full lifecycle:** the first phase, entered after `sdlc-status` reports ready.
- **Standalone entrypoint `sdlc:brainstorm`** (`templates/sdlc-brainstorm.md`):
  a directly invocable dialogue. It needs no committed upstream; unadopted it
  runs as plain dialogue, adopted it runs as the configured gate.
Brainstorm is a live dialogue, not a drafting exercise the agent completes
alone. The agent's job is to be the author's thinking companion: actively
rubber-duck the idea, not agree with it. Going along with whatever the human
says first is a failure mode, not politeness. This applies to both plain
dialogue and map mode below — it is how the conversation runs, not a mode of
its own.
Concrete behaviour, not just tone:
- **Raise a contradiction, or say there isn't one.** Before the gate, name at
  least one contradiction, unstated assumption, or gap in the design if one
  exists. If the design is genuinely clean, state that explicitly ("no
  contradiction found") rather than saying nothing — silence is not evidence of
  soundness.
- **Use the tools available**, not just the conversation, when they would
  actually sharpen the thinking: web research for prior art or external
  grounding, and codebase exploration when the idea touches an existing pattern
  the human might be unaware of or wrongly assuming is novel. This is
  proportional, not mandatory ceremony — a brief brainstorm does not need a
  research pass just to be brief.
- **Present multiple open questions in a structured form** when the environment
  provides a tool for that (e.g. a questions-helper plugin) rather than a wall of
  unstructured prose. When it is not there, degrade to inline structured prose
  (see `references/system-reference.md`, "Skills and tools are enhancements").
- **Expand and pressure-test, don't commandeer.** Contradictions and questions
  exist to widen the human's option space, not to steer the design toward the
  agent's own preferred answer. The human remains the owner of the direction;
  the gate is *their* approval, not the agent's conviction.
## 2. Entry conditions and authoritative upstream inputs
No committed upstream artifact is required — Brainstorm forms intent live. Its
103:  rendering, a questions-helper plugin).
197:Any skill or tool the agent reaches for opportunistically — a questions-helper
201:(inline structured prose for a missing questions tool, a direct read/grep for
## Normative statements
| ID | Statement (gist) | Disposition | Destination | Anchor |
|---|---|---|---|---|
| S01 | Adoption is opt-in, not a global default | retained | skills/sdlc/SKILL.md | framework a repo *adopts*, not a global default |
| S02 | Ready criteria; four mechanical states | retained | skills/sdlc/SKILL.md | proves this mechanically with four states |
| S03 | Run the gate; branch on exit code | retained | skills/sdlc/SKILL.md | branch on its exit |
| S04 | Exit 0 ready: announce + enumerate hooks/workflow | retained | skills/sdlc/SKILL.md | announce with the config's `announce` string |
| S05 | Exit 1 not-adopted: no announce; offer setup/advisory | retained | skills/sdlc/SKILL.md | State the repo has not adopted the |
| S06 | Exit 2 error: stop; never downgrade to advisory | retained | skills/sdlc/SKILL.md | An error is never silently downgraded to advisory mode |
| S07 | Exit 3 not-ready: remediate; schema-current; no fold-forward | retained | skills/sdlc/SKILL.md | pre-adoption config fold-forward |
| S08 | Before ready, MUST NOT enter phase/fire hooks/mutate tracker | retained | skills/sdlc/SKILL.md | MUST NOT create or mutate tracker objects |
| S09 | Startup table is agent-executed prose law (ADR 0011) | retained | skills/sdlc/SKILL.md | agent-executed prose law (ADR 0011) |
| S10 | Advisory mode is a one-session escape hatch | moved | skills/sdlc/references/system-reference.md | escape hatch when a repo has not opted in |
| S11 | Advisory-mode behavioural rules | moved | skills/sdlc/references/system-reference.md | never claim the session runs |
| S12 | Iron law: backward always allowed, no sunk-cost | retained | skills/sdlc/SKILL.md | sunk cost of an earlier gate never justifies shipping a |
| S13 | Irreversible definition | retained | skills/sdlc/SKILL.md | freezes a shape other code, data, or |
| S14 | Irreversible track requires plan+spec panels | retained | skills/sdlc/SKILL.md | plan panel AND spec panel |
| S15 | Reversible fast path; PR panel still runs | retained | skills/sdlc/SKILL.md | none pre-PR; the PR panel still runs |
| S16 | PR track declaration, check-lifecycle, bot exemption | moved | skills/sdlc/references/phase-pr-review.md | PRs without a valid declaration |
| S17 | Review dials + overrides + separateSpec | retained | skills/sdlc/SKILL.md | `shape.separateSpec: false` merges Plan and Spec |
| S18 | Read config for values, CONFIG.md for meaning | retained | skills/sdlc/SKILL.md | Read the config for values |
| S19 | Phase/artifact/home sequence table | retained | skills/sdlc/SKILL.md | task breakdown with checks + scenario ids |
| S20 | Brainstorm map-mode footnote | moved | skills/sdlc/references/phase-brainstorm.md | too large or too foggy |
| S21 | Build epic-mode footnote | moved | skills/sdlc/references/phase-tasks.md | tracker-backed Build (epic + sub-issues + board) |
| S22 | Brainstorm is live dialogue; rubber-duck | moved | skills/sdlc/references/phase-brainstorm.md | rubber-duck the idea, not agree with it |
| S23 | Raise a contradiction or say there isn't one | moved | skills/sdlc/references/phase-brainstorm.md | Raise a contradiction, or say there isn't one |
| S24 | Use tools, proportional not mandatory | moved | skills/sdlc/references/phase-brainstorm.md | proportional, not mandatory ceremony |
| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present open questions per the shared contract |
| S26 | Expand and pressure-test, don't commandeer | moved | skills/sdlc/references/phase-brainstorm.md | Expand and pressure-test, don't commandeer |
| S27 | Map mode: switch when large/foggy | moved | skills/sdlc/references/phase-brainstorm.md | wayfinder-lite |
| S28 | The map issue is the canonical resumable artifact | moved | skills/sdlc/references/phase-brainstorm.md | resumable artifact for the effort, not a doc |
| S29 | Tickets are typed native sub-issues, HITL/AFK | moved | skills/sdlc/references/phase-brainstorm.md | native GitHub sub-issues of the map |
| S30 | Fog of war: only ticket sharp questions | moved | skills/sdlc/references/phase-brainstorm.md | Don't ticket what you can't yet phrase precisely |
| S31 | Out of scope is not fog | moved | skills/sdlc/references/phase-brainstorm.md | Work beyond the destination |
| S32 | Working the map: one ticket per session | moved | skills/sdlc/references/phase-brainstorm.md | never resolve more than one ticket per session |
| S33 | Exit the moment the destination is decision-ready | moved | skills/sdlc/references/phase-brainstorm.md | the moment the destination is decision-ready |
| S34 | Build-plan doc is canonical; publish threshold | moved | skills/sdlc/references/phase-tasks.md | canonical task breakdown |
| S35 | Epic/sub-issue/blocking/board discipline | moved | skills/sdlc/references/phase-tasks.md | One **native sub-issue per task** |
| S36 | Below-threshold plain doc; Implement frontier | moved | skills/sdlc/references/phase-tasks.md | one sub-issue at a time |
| S37 | Tracker is a projection; doc wins | moved | skills/sdlc/references/phase-tasks.md | never the source of truth |
| S38 | Spec defines falsifiable scenarios, not test code | moved | skills/sdlc/references/phase-spec.md | A scenario that cannot be made to fail is a broken spec |
| S39 | Implementer writes tests test-first; floor not ceiling | moved | skills/sdlc/references/phase-implement.md | floor, not the ceiling |
| S40 | Panels share one shape; prompts single source | moved | skills/sdlc/references/phase-pr-review.md | single sources of truth in `prompts/` |
| S41 | resolve-panel behaviour | moved | skills/sdlc/references/phase-pr-review.md | keeps models with credentials |
| S42 | Dispatch: two paths, one reused agent | moved | skills/sdlc/references/phase-pr-review.md | one agent reused across the panel |
| S43 | Before fan-out confirm the subagent tool | moved | skills/sdlc/references/phase-pr-review.md | confirm the `subagent` tool is actually in |
| S44 | Consolidate duplicates | moved | skills/sdlc/references/phase-pr-review.md | collapse duplicates into one issue |
| S45 | Adjudicate every high/medium; ~80% right | moved | skills/sdlc/references/phase-pr-review.md | roughly eighty per cent right |
| S46 | Stop when no high/medium survives | moved | skills/sdlc/references/phase-pr-review.md | no high or medium finding survives adjudication |
| S47 | Save panel artifacts under reviews home | moved | skills/sdlc/references/phase-pr-review.md | Save panel artifacts under |
| S48 | review.tasks dial; validator is a checklist executor | moved | skills/sdlc/references/phase-implement.md | checklist executor, not a judge |
| S49 | Portable/deterministic; no imposed tsc | moved | skills/sdlc/references/phase-implement.md | no unconditional `npx tsc --noEmit` |
| S50 | PV1 manifest, five categories, scenario mapping | moved | skills/sdlc/references/phase-implement.md | five categories |
| S51 | PV2 deterministic runner; receipt; verify | moved | skills/sdlc/references/phase-implement.md | verify-task-receipt.mjs |
| S52 | Prepare PR body from template; declare/link | moved | skills/sdlc/references/phase-pr-review.md | Prepare the PR body from |
| S53 | Run check-lifecycle before opening the PR | moved | skills/sdlc/references/phase-pr-review.md | run the local lifecycle checker |
| S54 | Local PR panel loop; keep dev findings out of PR body | moved | skills/sdlc/references/phase-pr-review.md | do not add development findings to the PR body |
| S55 | Open only when clean; new-concern reply-with-SHA flow | moved | skills/sdlc/references/phase-pr-review.md | reply with that commit's short SHA |
| S56 | track:none exemption is not a third track | moved | skills/sdlc/references/phase-pr-review.md | exemption declaration, not a third lifecycle track |
| S57 | Visual gate artefacts are an optional pointer | moved | skills/sdlc/references/system-reference.md | self-contained interactive HTML view |
| S58 | Hooks object; phase keys distinct from review phases | moved | skills/sdlc/references/system-reference.md | distinct from the four review-panel phases |
| S59 | Hook item kinds run/use | moved | skills/sdlc/references/system-reference.md | missing tool = hook failure |
| S60 | Hook ordering | moved | skills/sdlc/references/system-reference.md | `before` hooks fire `*` items first |
| S61 | Hook failure: before blocks, after warns | moved | skills/sdlc/references/system-reference.md | retry, ask, or move backward |
| S62 | Hook working directory; worktree create-then-enter | moved | skills/sdlc/references/system-reference.md | create-then-enter |
| S63 | Announce-on-fire audit trail | moved | skills/sdlc/references/system-reference.md | Announce-on-fire (the audit trail) |
| S64 | Hook trust boundary | moved | skills/sdlc/references/system-reference.md | execute arbitrary shell commands with the agent's |
| S65 | workflow.md prose layer enumeration | moved | skills/sdlc/references/system-reference.md | no risky merges on Fridays |
| S66 | Gate/process conflict rule | retained | skills/sdlc/SKILL.md | local rules may ADD gates, never remove or weaken |
| S67 | Skills/tools are enhancements, not dependencies | moved | skills/sdlc/references/system-reference.md | enhancement, never a hard |
| S68 | Enhancement rule does not cover hooks | moved | skills/sdlc/references/system-reference.md | This rule does not cover hooks |
| S69 | Delegation pointers (do not reimplement) | retained | skills/sdlc/SKILL.md | do not reimplement |
| S70 | ADR criteria: hard-to-reverse + surprising + trade-off | moved | skills/sdlc/references/system-reference.md | surprising without context, and the result of a real trade-off |
[44 more lines in file. Use offset=104 to continue.]
Let me now check the FS11 inventory for any required updates, and verify the structural tests that reference system-reference.md:
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
grep: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
grep: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
{
  "schemaVersion": 1,
  "package": "pi-sdlc",
  "sources": [
    {
      "id": "inventory.self",
      "source": "skills/sdlc/assets/normative-references.json",
      "assertion": "\"schemaVersion\": 1",
      "targetKind": "file",
      "ownership": "package",
      "required": true,
      "resolution": "package",
      "target": "skills/sdlc/assets/normative-references.json",
      "class": "internal"
    },
    {
      "id": "inventory.schema",
      "source": "skills/sdlc/assets/normative-references.json",
      "assertion": "\"target\": \"skills/sdlc/assets/normative-references.schema.json\"",
      "targetKind": "file",
      "ownership": "package",
      "required": true,
      "resolution": "package",
      "target": "skills/sdlc/assets/normative-references.schema.json",
      "class": "internal"
    },
    {
      "id": "checker.source",
      "source": "skills/sdlc/scripts/check-references.mjs",
      "assertion": "NORMATIVE-REFERENCE-CHECKER: FS11-v1",
      "targetKind": "command",
      "ownership": "package",
      "required": true,
      "resolution": "package",
      "target": "skills/sdlc/scripts/check-references.mjs",
      "class": "internal"
    },
    {
      "id": "checker.wrapper",
      "source": "skills/sdlc/scripts/check-references.sh",
      "assertion": "NORMATIVE-REFERENCE-WRAPPER: FS11-v1",
      "targetKind": "command",
      "ownership": "package",
      "required": true,
      "resolution": "package",
      "target": "skills/sdlc/scripts/check-references.sh",
      "class": "package-public"
    },
    {
      "id": "skill.source",
      "source": "skills/sdlc/SKILL.md",
      "assertion": "# sdlc",
      "targetKind": "file",
      "ownership": "package",
      "required": true,
      "resolution": "package",
      "target": "skills/sdlc/SKILL.md",
      "class": "package-public"
    },
    {
      "id": "skill.lifecycle-checker",
      "source": "skills/sdlc/references/phase-pr-review.md",
      "assertion": "The `check-lifecycle` script verifies the declared",
      "targetKind": "command",
      "ownership": "package",
      "required": true,
      "resolution": "package",
      "target": "skills/sdlc/scripts/check-lifecycle.mjs",
      "class": "package-public"
    },
    {
      "id": "skill.pr-template",
      "source": "skills/sdlc/SKILL.md",
      "assertion": "template's `sdlc` declaration block",
      "targetKind": "file",
      "ownership": "package",
      "required": true,
      "resolution": "package",
      "target": "skills/sdlc/assets/pull_request_template.md",
      "class": "package-public"
normative-references.json:264:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:286:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:292:       "target": "skills/sdlc/references/system-reference.md",
normative-references.json:506:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:726:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:732:       "target": "skills/sdlc/references/system-reference.md",
normative-references.json:737:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:748:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:759:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:792:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:825:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:836:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:847:       "source": "skills/sdlc/references/system-reference.md",
normative-references.json:858:       "source": "skills/sdlc/references/system-reference.md",
source-free-comprehension.test.js:1: // ASD16 (DoD 12): every answer of the §5 source-free comprehension checklist is
source-free-comprehension.test.js:27: // Each §5 checklist question, answered by a phrase that must appear in the docs.
source-free-comprehension.test.js:41: test("ASD16: every §5 checklist answer is derivable from docs alone", () => {
telemetry-docs.test.js:119: // Structural omission-coverage test (spec §9): the FS11 checker cannot detect
telemetry-docs.test.js:121: // skills/sdlc-retro/scripts/, every hook script named by §4, every committed
telemetry-docs.test.js:137: test("structural coverage: every hook script named by §4 has an FS11 inventory entry", () => {
standalone-entrypoints.test.js:1: // ASD12/ASD13 (DoD 10): the six standalone sdlc:<slug> entrypoints match the §9
phase-references.test.js:1: // ASD3 (DoD 3): each of the six phase references contains all nine §6 required
phase-references.test.js:17: // The nine §6 required headings, as stable numbered-heading anchors.
phase-references.test.js:33: 	test(`ASD3: phase-${slug}.md carries all nine §6 headings`, () => {
telemetry-dogfood.test.js:59: 	// used for this real one-time collection (author's choice, spec §build).
fs11-classification.test.js:3: // structural discovery over the §16 roots minus the closed exclusion list finds
startup-freshness.test.js:48: 	// The relocated telemetry section (system-reference §12) needs a mandatory
telemetry-render.test.js:86: // LT20 — all seven anchors, single file, no external references, every §8
readiness-lib.test.js:2: // inspectRoot / inspectConfig (spec §2.3, §2.5), plus byte-compatibility of
readiness-lib.test.js:52: // inspectRoot (spec §2.3.1): success/error union, never exits.
readiness-lib.test.js:123: // inspectConfig (spec §2.5): deterministic, non-exiting.
readiness-lib.test.js:204: // Delegation compatibility (spec §2.5): the exiting validators keep their
config-doc.test.js:55: // ---- ASD6: deterministic render + full §14 content ------------------------
config-doc.test.js:71: test("ASD6: rendered CONFIG.md carries all §14 sections and every schemaVersion-3 key in JSON order", () => {
config-doc.test.js:73: 	// §14 ordered sections
config-doc.test.js:225: test("panel floors: render surfaces per-track resolved floors incl task_validate=1 and per-phase overrides (§14)", () => {
system-reference.test.js:1: // ASD2 (DoD 2): the system reference answers the §5 source-free comprehension
system-reference.test.js:16: // The §5 checklist, as stable section headings (11 required sections).
system-reference.test.js:31: test("ASD2: system reference contains every §5 checklist section", () => {
system-reference.test.js:44: test("ASD2: §5 public-composition inventory narrates the six-class taxonomy", () => {
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
// ASD2 (DoD 2): the system reference answers the §5 source-free comprehension
// checklist. Every required section is present; deleting any one section fails
// non-vacuously (mutation removes it once, then the section-presence check must
// fail). Offline grep over committed docs; no model calls.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const sysRef = readFileSync(join(repo, "skills", "sdlc", "references", "system-reference.md"), "utf8");
// The §5 checklist, as stable section headings (11 required sections).
const SECTIONS = {
	"1. Purpose": /^## 1\. Purpose$/m,
	"2. Kernel": /^## 2\. Kernel/m,
	"3. Adoption & readiness": /^## 3\. Adoption & readiness$/m,
	"4. Tracks/phases/transitions/gates/refusal": /^## 4\. Tracks, phases, transitions, gates, refusal$/m,
	"5. Public composition inventory": /^## 5\. Public composition inventory/m,
	"6. Configuration & extension surfaces": /^## 6\. Configuration & extension surfaces$/m,
	"7. Artifacts & durable evidence": /^## 7\. Artifacts & durable evidence$/m,
	"8. Full lifecycle + standalone entrypoints": /^## 8\. Normal full-lifecycle operation and the six standalone entrypoints$/m,
	"9. Advanced modes": /^## 9\. Advanced modes$/m,
	"10. Troubleshooting + source-inspection boundary": /^## 10\. Operational troubleshooting and the source-inspection boundary$/m,
	"11. Next-read routing": /^## 11\. Next-read routing/m,
};
test("ASD2: system reference contains every §5 checklist section", () => {
	for (const [label, re] of Object.entries(SECTIONS)) {
		assert.match(sysRef, re, `system-reference.md missing section: ${label}`);
	}
});
test("ASD2 (non-vacuous): deleting any one section is detected", () => {
	for (const [label, re] of Object.entries(SECTIONS)) {
		const mutated = sysRef.replace(re, "## (removed)");
		assert.doesNotMatch(mutated, re, `mutation of section '${label}' must be detected (heading appears once)`);
	}
});
test("ASD2: §5 public-composition inventory narrates the six-class taxonomy", () => {
	for (const cls of ["package-public", "delegated", "runtime-tool", "consumer-integration", "optional-enhancement", "internal"]) {
		assert.ok(sysRef.includes(cls), `inventory narration missing taxonomy class: ${cls}`);
	}
	// the source-inspection boundary must be stated
	assert.match(sysRef, /source-inspection boundary/i);
});
// ASD3 (DoD 3): each of the six phase references contains all nine §6 required
// headings and at least one explicit `under your configuration` callout routing
// to CONFIG.md/JSON. A phase reference stating a fixed track/gate without the
// callout fails. Offline grep; no model calls.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const refDir = join(repo, "skills", "sdlc", "references");
const SLUGS = ["brainstorm", "plan", "spec", "tasks", "implement", "pr-review"];
// The nine §6 required headings, as stable numbered-heading anchors.
const HEADINGS = {
	"1 purpose/invocation modes": /^## 1\. Purpose and invocation modes/m,
	"2 entry conditions/upstream": /^## 2\. Entry conditions and authoritative upstream inputs/m,
	"3 before-hook order/blocking": /^## 3\. Configured before-hook order and blocking semantics/m,
	"4 required activity/artifact": /^## 4\. Required activity and artifact\/output shape/m,
	"5 invariant gate/approval seam": /^## 5\. Invariant gate\/approval seam/m,
	"6 refusal/backward": /^## 6\. Refusal and backward-transition behaviour/m,
	"7 after-hook order/warning": /^## 7\. After-hook order and warning semantics/m,
	"8 completion evidence/next transition": /^## 8\. Completion evidence and next transition/m,
	"9 advanced-mode pointers": /^## 9\. Advanced-mode pointers/m,
};
for (const slug of SLUGS) {
	const body = readFileSync(join(refDir, `phase-${slug}.md`), "utf8");
	test(`ASD3: phase-${slug}.md carries all nine §6 headings`, () => {
		for (const [label, re] of Object.entries(HEADINGS)) {
			assert.match(body, re, `phase-${slug}.md missing heading: ${label}`);
		}
	});
	test(`ASD3: phase-${slug}.md has at least one 'under your configuration' callout to CONFIG.md/JSON`, () => {
		assert.match(body, /under your configuration/i, `phase-${slug}.md states a fixed shape without a config-relative callout`);
		assert.match(body, /CONFIG\.md|sdlc\.config\.json/, `phase-${slug}.md callout does not route to CONFIG.md/JSON`);
	});
	test(`ASD3 (non-vacuous): removing the config callout from phase-${slug}.md is detected`, () => {
		const mutated = body.replace(/under your configuration/gi, "always");
		assert.doesNotMatch(mutated, /under your configuration/i);
	});
}
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
// ASD14/ASD15 (DoD 11): FS11 classification + structural discovery. Every
// inventory row carries a valid class; all six taxonomy values are represented;
// structural discovery over the §16 roots minus the closed exclusion list finds
// a row for every public artifact. Non-vacuity: an undocumented public artifact
// under a discovery root, or a removed row, fails discovery. Offline; no models.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const CHECKER = join(repo, "skills", "sdlc", "scripts", "check-references.mjs");
const inventory = JSON.parse(readFileSync(join(repo, "skills", "sdlc", "assets", "normative-references.json"), "utf8"));
const CLASSES = ["package-public", "delegated", "runtime-tool", "consumer-integration", "optional-enhancement", "internal"];
const runChecker = (args) => {
	try {
		return { status: 0, stdout: execFileSync("node", [CHECKER, ...args], { encoding: "utf8" }) };
	} catch (e) {
		return { status: e.status, stdout: e.stdout ?? "" };
	}
};
test("ASD14: every inventory row carries a valid class", () => {
	for (const row of inventory.sources) {
		assert.ok(CLASSES.includes(row.class), `${row.id} has invalid/absent class: ${row.class}`);
	}
});
test("ASD14: all six taxonomy values are represented across the inventory", () => {
	const present = new Set(inventory.sources.map((r) => r.class));
	for (const cls of CLASSES) assert.ok(present.has(cls), `taxonomy class not represented: ${cls}`);
});
test("ASD14: the live inventory passes structural discovery with a row for every public artifact", () => {
	const res = runChecker(["--package-root", repo, "--format", "json"]);
	assert.equal(res.status, 0, res.stdout);
	const report = JSON.parse(res.stdout);
	const discovery = report.checks.filter((c) => c.id.startsWith("discovery."));
	assert.ok(discovery.length > 0, "discovery must run over the frozen roots");
	assert.ok(!discovery.some((c) => c.status === "fail"), "no discovered public artifact may lack a row");
	// the six standalone entrypoints and the seven references are all discovered + covered
	for (const slug of ["brainstorm", "plan", "spec", "tasks", "implement", "pr-review"]) {
		assert.ok(
			discovery.some((c) => c.id === `discovery.templates/sdlc-${slug}.md` && c.status === "pass"),
			`entrypoint not covered: ${slug}`,
		);
	}
});
// ---- ASD15 non-vacuity via a self-contained fixture package ---------------
function fixturePackage() {
	const root = mkdtempSync(join(tmpdir(), "fs11-"));
	mkdirSync(join(root, "skills", "sdlc", "references"), { recursive: true });
	writeFileSync(join(root, "skills", "sdlc", "references", "system-reference.md"), "# pi-sdlc system reference\n");
	const inv = {
		schemaVersion: 1,
		package: "pi-sdlc",
		discovery: { roots: ["skills/sdlc/references/*.md"], exclude: [] },
		sources: [{ id: "reference.system", source: "skills/sdlc/references/system-reference.md", assertion: "# pi-sdlc system reference", targetKind: "file", ownership: "package", required: true, resolution: "package", target: "skills/sdlc/references/system-reference.md", class: "package-public" }],
	};
	writeFileSync(join(root, "inv.json"), JSON.stringify(inv));
	return { root, invPath: join(root, "inv.json") };
}
test("ASD15: a valid fixture passes; an undocumented artifact under a discovery root fails", () => {
	const { root, invPath } = fixturePackage();
	try {
		assert.equal(runChecker(["--package-root", root, "--inventory", invPath]).status, 0, "baseline fixture must pass");
		// add a public artifact under the discovery root with no inventory row
		writeFileSync(join(root, "skills", "sdlc", "references", "phase-rogue.md"), "# rogue\n");
		const res = runChecker(["--package-root", root, "--inventory", invPath, "--format", "json"]);
		assert.equal(res.status, 1, "an undocumented discovered artifact must fail");
		const report = JSON.parse(res.stdout);
		assert.ok(
			report.checks.some((c) => c.id === "discovery.skills/sdlc/references/phase-rogue.md" && c.status === "fail"),
			"the rogue file must fail discovery non-vacuously",
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
test("ASD15: removing a row for a still-present public artifact fails discovery", () => {
	const { root, invPath } = fixturePackage();
	try {
		// drop the only row but keep the file on disk
		const inv = JSON.parse(readFileSync(invPath, "utf8"));
		inv.sources = [{ id: "placeholder.row", source: "inv.json", assertion: "pi-sdlc", targetKind: "file", ownership: "package", required: true, resolution: "package", target: "inv.json", class: "internal" }];
		writeFileSync(invPath, JSON.stringify(inv));
		const res = runChecker(["--package-root", root, "--inventory", invPath, "--format", "json"]);
		assert.equal(res.status, 1, "a present artifact with no row must fail");
		const report = JSON.parse(res.stdout);
		assert.ok(report.checks.some((c) => c.id === "discovery.skills/sdlc/references/system-reference.md" && c.status === "fail"));
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
375:never raise it. Overflow **demotes** to a lower tier — it never lengthens the
378:**The triage tiers.** Every candidate question lands in exactly one:
Let me now check the adversary PR prompt to verify consistency with the new instruction about naming the assumptions section, and look for the pre-existing async-dispatch commit:
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
grep: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
50c9286 docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
2699186 docs(sdlc): layer phase-shaped question deltas over the shared contract (T2, #117)
04b6876 docs(sdlc): T1 validation receipt (runner PASS, validator PASS)
244ec22 docs(sdlc): add shared question-presentation contract (T1, #116)
69e62eb docs(sdlc): build plan for question-presentation discipline
c759c20 docs(sdlc): plan for question-presentation discipline across phases
No matches found
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
commit 32ebaa18afce4fbdfb7abccd8f925a864913481a
Author: Neil Chambers <n3llyb0y.uk@gmail.com>
Date:   Sun Jul 19 09:30:24 2026 +0100
    docs(sdlc): dispatch review panels async and react per-child
    Pre-existing drafted guidance folded into the sdlc-question-discipline
    stream at its plan gate: dispatch the panel tasks array with async: true,
    poll per-child status, and replace infra-failed reviewers immediately
    instead of waiting for the slowest sibling.
 skills/sdlc/references/phase-pr-review.md | 30 ++++++++++++++++++++++++------
 1 file changed, 24 insertions(+), 6 deletions(-)
diff --git a/skills/sdlc/references/phase-pr-review.md b/skills/sdlc/references/phase-pr-review.md
index ce1895e..cbdd9f1 100644
--- a/skills/sdlc/references/phase-pr-review.md
+++ b/skills/sdlc/references/phase-pr-review.md
@@ -43,6 +43,12 @@ shared board. Add `Closes #<task-issue>` for each task completed by merging the
 PR; use the explicit no-tracker exemption for a below-threshold (per
 `shape.publishToTracker`) or `track: none` change. The PR body describes the
 change for its audience; it does not carry the local panel's development findings.
+It **does** carry an **"Assumptions & discretionary calls"** section
+(provisioned by the PR template, empty-allowed): the assumptions accrued during
+Implement, copied from the build-plan doc's appendix
+(`references/phase-implement.md`). That section is **input to** the PR panel —
+named review material for the judgement pass — never a channel for panel
+findings; the no-development-findings rule above is unchanged.
 Every PR declares its track in the template's `sdlc` declaration block
 (provisioned by setup). The `check-lifecycle` script verifies the declared track's
@@ -101,17 +107,23 @@ hand-copy a prompt per model.
      `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
{
  "schemaVersion": 1,
  "taskId": "t1",
  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
  "repoRoot": ".",
  "ownedScenarios": [],
  "checks": [
    {
      "id": "tests.full",
      "argv": ["npm", "test"],
      "timeoutMs": 300000,
      "evidence": ["Full corpus green with the new system-reference section (structural tests over references included)"]
    },
    {
      "id": "static.lint",
      "argv": ["npm", "run", "lint"],
      "timeoutMs": 120000,
      "evidence": ["Repository formatting and lint rules"]
    },
    {
      "id": "standards.section-present",
      "argv": ["grep", "-q", "Presenting questions to the human", "skills/sdlc/references/system-reference.md"],
      "evidence": ["Shared question-presentation contract section exists (plan DoD 1)"]
    },
    {
      "id": "standards.routing-row",
      "argv": ["grep", "-q", "How does any phase ask the human for input?", "skills/sdlc/references/system-reference.md"],
      "evidence": ["Next-read routing table routes to the new section (plan DoD 1)"]
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": ["node", "-e", "const s=require('fs').readFileSync('skills/sdlc/references/system-reference.md','utf8'); if(/questions-helper|questions tool/i.test(s)){console.error('banned questions-tool naming present');process.exit(1)}"],
      "evidence": ["Tool-dependent phrasing absent from the system reference (plan DoD 1/3)"]
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
      "reason": "Reversible track: no Specification exists; T1 maps to approved plan DoD items 1/3/5 per the build plan's T1 check table."
    },
    "standards": {
      "applicability": "required",
      "checkIds": ["standards.section-present", "standards.routing-row"]
    },
    "bannedPatterns": {
      "applicability": "required",
      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
    }
  }
}
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
Let me verify the anchoring for the disposition ledger change more carefully and check for additional issues:
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
grep: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
39:- **Present open questions per the shared contract** —
disposition-ledger.test.js:17: const ledgerPath = join(repo, "docs", "validation", "sdlc-agent-self-documentation", "disposition-ledger.md");
exit: 1
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
// ASD5 (DoD 4): the statement-level disposition ledger accounts for every
// pre-change SKILL.md normative statement and red flag as retained / moved /
// intentionally-replaced. Each retained/moved row's destination exists and
// contains the moved statement's anchor (whitespace-normalized); anchors are
// unique (no rule owned twice); the full pre-change red-flags list is covered;
// removing a moved statement from its destination fails non-vacuously.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const ledgerPath = join(repo, "docs", "validation", "sdlc-agent-self-documentation", "disposition-ledger.md");
const ledger = readFileSync(ledgerPath, "utf8");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const fileCache = {};
const readNorm = (rel) => (fileCache[rel] ??= norm(readFileSync(join(repo, rel), "utf8")));
// Parse ledger table rows: | ID | gist | disposition | destination | anchor |
function rows() {
	const out = [];
	for (const line of ledger.split("\n")) {
		const m = line.match(/^\|\s*(S\d\d|RF\d\d|M\d\d)\s*\|(.*)\|\s*(retained|moved|replaced)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/);
		if (!m) continue;
		out.push({ id: m[1], disposition: m[3], destination: m[4].trim(), anchor: m[5].trim() });
	}
	return out;
}
test("ASD5: the ledger parses and covers both statements and red flags", () => {
	const parsed = rows();
	const statements = parsed.filter((r) => r.id.startsWith("S"));
	const redFlags = parsed.filter((r) => r.id.startsWith("RF"));
	assert.ok(statements.length >= 70, `expected the full pre-change statement set, got ${statements.length}`);
	assert.ok(redFlags.length >= 14, `expected the full pre-change red-flags list, got ${redFlags.length}`);
});
test("ASD5 (non-vacuous): every pre-change SKILL.md red flag is covered by a retained RF row", () => {
	// Ground against the committed pre-change SKILL.md (the review baseline), not a
	// self-declared count: deleting RF rows leaves a baseline red flag uncovered.
	let baseline;
	// Pin the pre-restructure SKILL.md (this stream's disposition baseline). A
	// bare merge-base would drift onto main's tip after integrating main, so the
	// baseline commit is pinned; fall back to merge-base/main only if unavailable.
	const refs = ["d528b9799ed38f8c03708cbd27047543932017d3:skills/sdlc/SKILL.md"];
	try {
		const mb = execFileSync("git", ["-C", repo, "merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
		refs.push(`${mb}:skills/sdlc/SKILL.md`, "main:skills/sdlc/SKILL.md");
	} catch {}
	for (const ref of refs) {
		try {
			const text = execFileSync("git", ["-C", repo, "show", ref], { encoding: "utf8" });
			const n = text
				.slice(text.indexOf("## Red flags"))
				.split("\n")
				.filter((l) => l.startsWith("- ")).length;
			if (n === 14) {
				baseline = text;
				break;
			}
			baseline ??= text;
		} catch {}
	}
	assert.ok(baseline, "could not read the pre-change SKILL.md baseline from git");
	const rfStart = baseline.indexOf("## Red flags");
	assert.ok(rfStart >= 0, "baseline must have a Red flags section");
	const rfSectionRaw = baseline.slice(rfStart);
	const bulletCount = rfSectionRaw.split("\n").filter((l) => l.startsWith("- ")).length;
	assert.ok(bulletCount >= 14, `expected >=14 pre-change red flags, got ${bulletCount}`);
	const rfRows = rows().filter((r) => r.id.startsWith("RF"));
	// Every pre-change red flag has exactly one retained RF row (deleting a row trips this).
	assert.equal(rfRows.length, bulletCount, `RF rows (${rfRows.length}) must equal pre-change red flags (${bulletCount})`);
	const baselineRf = norm(rfSectionRaw);
	const skill = readNorm("skills/sdlc/SKILL.md");
	for (const r of rfRows) {
		const a = norm(r.anchor);
		assert.ok(baselineRf.includes(a), `${r.id}: anchor not found in the pre-change red flags: "${r.anchor}"`);
		assert.ok(skill.includes(a), `${r.id}: anchor not retained in current SKILL.md: "${r.anchor}"`);
	}
});
test("ASD5: every retained/moved row's destination exists and contains its anchor", () => {
	for (const r of rows()) {
		if (r.disposition === "replaced") continue;
		assert.ok(existsSync(join(repo, r.destination)), `${r.id}: destination missing: ${r.destination}`);
		assert.ok(readNorm(r.destination).includes(norm(r.anchor)), `${r.id}: anchor not found in ${r.destination}: "${r.anchor}"`);
	}
});
test("ASD5: anchors are unique (no rule owned twice)", () => {
	const seen = new Map();
	for (const r of rows()) {
		if (r.disposition === "replaced") continue;
		assert.ok(!seen.has(r.anchor), `${r.id}: duplicate anchor also on ${seen.get(r.anchor)}: "${r.anchor}"`);
		seen.set(r.anchor, r.id);
	}
});
test("ASD5: every pre-change red flag is retained in SKILL.md", () => {
	const skill = readNorm("skills/sdlc/SKILL.md");
	for (const r of rows().filter((x) => x.id.startsWith("RF"))) {
		assert.equal(r.disposition, "retained", `${r.id} should be retained in the kernel`);
		assert.equal(r.destination, "skills/sdlc/SKILL.md", `${r.id} destination should be SKILL.md`);
		assert.ok(skill.includes(norm(r.anchor)), `${r.id}: red-flag anchor missing from SKILL.md: "${r.anchor}"`);
	}
});
test("ASD5 (non-vacuous): removing a moved statement from its destination is detected", () => {
	const moved = rows().find((r) => r.disposition === "moved");
	assert.ok(moved, "ledger must contain at least one moved statement");
	const destNorm = readNorm(moved.destination);
	assert.ok(destNorm.includes(norm(moved.anchor)), "precondition: the moved statement is present");
	// Simulate deleting the moved statement from its destination.
	const deleted = destNorm.split(norm(moved.anchor)).join("");
	assert.ok(!deleted.includes(norm(moved.anchor)), `${moved.id}: deletion of the moved statement must be detectable`);
});
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
49:(`references/phase-implement.md`). That section is **input to** the PR panel —
✔ parseArgs: recognises JSON anywhere and rejects bad flags (0.772805ms)
✔ PV13: renderText is a faithful projection of the report (236.130064ms)
ℹ tests 397
ℹ suites 0
ℹ pass 397
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 15842.725109
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
commit 32ebaa18afce4fbdfb7abccd8f925a864913481a
Author: Neil Chambers <n3llyb0y.uk@gmail.com>
Date:   Sun Jul 19 09:30:24 2026 +0100
    docs(sdlc): dispatch review panels async and react per-child
    Pre-existing drafted guidance folded into the sdlc-question-discipline
    stream at its plan gate: dispatch the panel tasks array with async: true,
    poll per-child status, and replace infra-failed reviewers immediately
    instead of waiting for the slowest sibling.
diff --git a/skills/sdlc/references/phase-pr-review.md b/skills/sdlc/references/phase-pr-review.md
index ce1895e..dcac05e 100644
--- a/skills/sdlc/references/phase-pr-review.md
+++ b/skills/sdlc/references/phase-pr-review.md
@@ -101,12 +101,17 @@ hand-copy a prompt per model.
      `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
      its task value with the exact review task: name the artifact paths, commit,
-     governing documents, grounding rule, and required findings-only output; then
-     dispatch the populated array in one call. Per-model attribution comes back on
-     each task's `result.model`. `ensure-panel-agent.sh` copies the prompt body
-     verbatim and writes to the consumer repo's `.pi/agents` where the session
-     resolves project agents (NOT a `cd`-ed cwd). Consult the project's governing
-     documents (for example `AGENTS.md`) for any local sub-agent gotchas.
+     governing documents, grounding rule, and required findings-only output. Dispatch
+     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
+     not as a blocking call: a blocking multi-model dispatch only returns control after
+     every reviewer finishes, so a reviewer that crashes in the first second still sits
+     unactioned until the slowest sibling completes minutes later. Async dispatch
+     returns immediately with one run id/`asyncDir` covering every child in the panel.
+     Per-model attribution comes back on each task's `result.model` once you read it.
+     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
+     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
+     `cd`-ed cwd). Consult the project's governing documents (for example
+     `AGENTS.md`) for any local sub-agent gotchas.
    - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
      stamps one prompt file across `--model` flags.
@@ -127,6 +132,19 @@ hand-copy a prompt per model.
 `wait({ all: true })` over status-polling for read-only fan-out, and read a
 child's transcript before treating a "detached" status label as lost output.
+   **React per-child, not per-batch.** Once dispatched async, poll
+   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
+   once every child in that run finishes) at a short interval; a `wait({ id:
+   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
+   timeout returns control without stopping the run. Diff each poll's per-child
+   status against the last one: the moment any child shows an infra failure (see
+   below) rather than a verdict, act on it immediately — do not wait for the other
+   panelists still running. A replacement dispatch for that model is a brand-new,
+   separate async `subagent` single-agent call, not folded back into the original
+   `tasks:` array, so it runs alongside whichever siblings from the first batch are
+   still going. Keep polling until every original child and every replacement is
+   accounted for.
+
    **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
    candidate pool, not merely documentation. A reviewer that returns a model
    verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
      "id": "optional-enhancement.visual-docs",
      "source": "skills/sdlc/references/system-reference.md",
      "assertion": "sdlc-visual-docs",
--
      "class": "optional-enhancement"
    },
    {
0
Command exited with code 1
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
ENOENT: no such file or directory, access '/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline/skills/sdlc/prompts/adversary-pr.prompt.md'
find: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
adversary-plan.prompt.md
adversary-review.prompt.md
adversary-spec.prompt.md
validator-task.prompt.md
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
You are REVIEWER_TAG, a ruthless adversarial code reviewer. Your sole job is to find REAL defects in the branch under review: bugs, security holes, data-corruption risks, broken invariants, race conditions, incorrect edge-case handling, and regressions. You are not here to praise or to bikeshed style.
## Method
1. Read the unified diff at the path the caller gives you. Then read the full new files it touches (use the repo paths) for context; do not review the diff in isolation.
2. Trace each code path adversarially. Ask: what input breaks this? What happens on first run, empty file, concurrent run, partial write, unicode, cap boundary, missing key, missing file? Does it actually preserve the invariant it claims to? Where useful, write a quick repro or run the code to confirm before asserting.
3. Verify load-bearing or surprising claims against the COMMITTED blob (a working tree may have been auto-formatted): `git show <sha>:path`. Do not trust author replies over the code.
4. Prefer a few HIGH-confidence concrete defects over a long list of speculation. Every finding must be something you could write a failing test or a reproduction for.
## Baseline smells (Standards, judgement calls)
Beyond concrete defects, also check the diff against this fixed baseline of
twelve code smells (Fowler, *Refactoring*, ch.3). Two rules govern it:
- **The repo overrides.** Where the project's governing documents endorse something
  a smell below would flag, suppress it — a documented repo standard always
  wins.
- **Always a judgement call.** Unlike a concrete defect, a baseline smell is
  never `severity: high` on its own — cap it at `medium`, and tag it
  `smell: <name>` in the finding so adjudication can weigh it as a judgement
  call rather than a hard violation. Skip anything tooling (lint/format/
  typecheck) already enforces.
- **Mysterious Name** — a name that doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another module's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together. → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same switch/if-cascade on the same type recurs across the change. → replace with polymorphism, or one shared map.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a module that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.
## The review target
- Repo: <REPO_PATH> (read-only: do not modify, commit, or push)
- Commit under review: <COMMIT_SHA> (full 40 chars)
- Diff: <DIFF_PATH>
- Global constraints that bind this change (copy verbatim from the spec): <GLOBAL_CONSTRAINTS>
- Declared lifecycle track: <TRACK>
- Governing documents for the declared feature slug: <GOVERNING_DOCS>
When `<TRACK>` is `reversible`, ground review constraints in the plan and
build-plan documents; a Specification does not exist on this track and must
not be demanded.
## Output format (STRICT)
Return ONLY a markdown list of findings, nothing else. For each finding:
### <short title>
- severity: high | medium | low
- confidence: high | medium (drop anything lower)
- file: <repo-relative path>
- line: <line number or range in the NEW file, best effort; say "approx" if unsure>
- problem: <one or two sentences: the concrete defect>
- repro_or_impact: <how it manifests / why it matters>
- smell: <baseline smell name, only if this finding is a baseline-smell judgement call rather than a concrete defect — omit otherwise>
Rank most-severe first. If you find nothing at a severity, say so. Do not invent line numbers. No preamble, no conclusion, no chit-chat.
## Verification mode (only when the caller asks for it)
When the caller provides prior findings plus author replies and asks you to verify fixes: for EACH issue, read the ACTUAL new code (do not trust the reply text), reproduce where useful, and rule on it:
### <issue title> (<file>:<line>)
- verdict: RESOLVED | PARTIAL | NOT-RESOLVED | DEFERRED-OK | DEFERRED-RISKY
- evidence: <what you saw in the code: file:line and behaviour, or a repro result>
Then a final `### NEW DEFECTS` section listing any regressions the fixes introduced, in the standard finding format above (or `none found`).
Now let me verify the T1 check logic more carefully:
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
matches: null
true
false
false
Let me verify a few remaining edge cases and check for any structural contradictions:
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
=== phase-brainstorm.md ===
39:- **Present open questions per the shared contract** —
40:  `references/system-reference.md`, "Presenting questions to the human": one
141:**parked** question (the shared contract's tier) is fog by another name: in map
=== phase-implement.md ===
51:"Presenting questions to the human") to near zero:
=== phase-plan.md ===
40:**Dialogue discipline.** Ask per the shared contract
41:(`references/system-reference.md`, "Presenting questions to the human") with
=== phase-pr-review.md ===
184:   Escalate disputes to the human per the shared contract
185:   (`references/system-reference.md`, "Presenting questions to the human") with
=== phase-spec.md ===
50:**Dialogue discipline.** Ask per the shared contract
51:(`references/system-reference.md`, "Presenting questions to the human") and
=== phase-tasks.md ===
45:(shared contract: `references/system-reference.md`,
46:"Presenting questions to the human"). A genuinely blocking question here almost always means the Spec's
13
14
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
  `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
  consumer `.pi/sdlc/CONFIG.md`.
- **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
  rendering, a questions-helper plugin).
- **`internal`** — implementation internals: the `*.mjs` implementations behind
  `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
  and are not catalogued file by file.
FS11 also carries a `discovery` block naming public roots/glob patterns and a
  `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
  consumer `.pi/sdlc/CONFIG.md`.
- **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
  rendering, an interactive question-answering aid).
- **`internal`** — implementation internals: the `*.mjs` implementations behind
  `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
  and are not catalogued file by file.
FS11 also carries a `discovery` block naming public roots/glob patterns and a
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
### Skills and tools are enhancements, not dependencies
Any skill or tool the agent reaches for opportunistically — a questions-helper
plugin, web research, codebase exploration, anything named anywhere in this
documentation as a way to do a phase better — is an enhancement, never a hard
dependency a phase blocks on. When it is missing, degrade to the plain fallback
(inline structured prose for a missing questions tool, a direct read/grep for
missing research tooling) and say so, rather than stopping or refusing to proceed.
Name no external tool as a shipped dependency of the skill itself. **This rule
does not cover hooks:** a `hooks` entry a repo has explicitly configured is a
deliberate, load-bearing contract with the failure semantics above (before=block,
### Skills and tools are enhancements, not dependencies
Any skill or tool the agent reaches for opportunistically — web research,
codebase exploration, a richer rendering surface, anything named anywhere in
this documentation as a way to do a phase better — is an enhancement, never a
hard dependency a phase blocks on. When it is missing, degrade to the plain
fallback (a direct read/grep for missing research tooling, plain structured
prose for a missing richer surface) and say so, rather than stopping or
refusing to proceed.
Name no external tool as a shipped dependency of the skill itself. **This rule
does not cover hooks:** a `hooks` entry a repo has explicitly configured is a
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
 | What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
 | What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
 | What implementation realizes a surface? | Source, only when implementation work requires it |
+| How does any phase ask the human for input? | "Presenting questions to the human" (§14, this file) |
 ## 12. Lifecycle telemetry (FS13)
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
✔ ASD5: the ledger parses and covers both statements and red flags (5.87691ms)
✔ ASD5 (non-vacuous): every pre-change SKILL.md red flag is covered by a retained RF row (16.628599ms)
✔ ASD5: every retained/moved row's destination exists and contains its anchor (6.827604ms)
✔ ASD5: anchors are unique (no rule owned twice) (0.617865ms)
✔ ASD5: every pre-change red flag is retained in SKILL.md (4.840133ms)
✔ ASD5 (non-vacuous): removing a moved statement from its destination is detected (1.024509ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 245.444694
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
repo template: PASS
asset template: PASS
After exhaustive adversarial review of all 24 changed files, 397 passing tests, and cross-referencing every plan DoD item against the shipped text, here are my findings:
### Shotgun Surgery across 8+ files for one logical change
- severity: low
- confidence: medium
- file: multiple files across `skills/sdlc/references/`, `.github/`, `skills/sdlc/assets/`, `docs/validation/`
- line: n/a (cross-file pattern)
- problem: The single logical change (shared question-presentation contract + six phase deltas + PR template additions + cross-stream ledger) touches 8+ files in 4 directories. Adding a new question-presentation rule to a future phase would require touching multiple phase references again — characteristic of Shotgun Surgery (Fowler, ch.3).
- repro_or_impact: Future amendments to the question-presentation contract must propagate through system-reference.md plus all six phase references, increasing the odds of an inconsistent delta. The plan acknowledges the edit scatter as deliberate (one shared contract, one delta per phase), so this is a judgement call, not a blocker.
- smell: Shotgun Surgery
---
**No high-confidence concrete defects found.** The shared contract (§14) and its six phase deltas are internally consistent; the triage-tiers vocabulary is uniform; the overflow-demotes rule is correctly implemented in every delta (Brainstorm recommendations widen-not-steer, Plan's convergent delta, Spec's draft-scenarios rule, Tasks' zero-blocking lowering, Implement's mid-task interrupt reservation, PR-review's pre-adjudicated escalation); both PR templates carry the assumptions section without weakening the no-findings-in-body rule; the §5/§6/§11 system-reference updates correctly purge tool-dependent phrasing; 397 tests pass including the disposition-ledger anchor test; and all validation manifest checks are false-positive-free.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Returned one concrete baseline-smell finding with file path and severity; confirmed no high-confidence defects after exhaustive adversarial review of all 24 changed files, cross-referencing plan DoD items, running all 397 tests, and verifying validation manifest checks."
    }
  ],
  "changedFiles": [
    ".github/pull_request_template.md",
    "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
    "docs/plans/2026-07-19-sdlc-question-discipline.md",
    "docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/generated-agent.md",
    "docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/manifest.json",
    "docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/receipt.json",
    "docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/runner-report.json",
    "docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/validator.md",
    "docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/generated-agent.md",
    "docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/manifest.json",
    "docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/receipt.json",
    "docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/runner-report.json",
    "docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator.md",
    "docs/validation/sdlc-agent-self-documentation/disposition-ledger.md",
    "docs/validation/sdlc-question-discipline/t1.json",
    "docs/validation/sdlc-question-discipline/t2.json",
    "skills/sdlc/assets/pull_request_template.md",
    "skills/sdlc/references/phase-brainstorm.md",
    "skills/sdlc/references/phase-implement.md",
    "skills/sdlc/references/phase-plan.md",
    "skills/sdlc/references/phase-pr-review.md",
    "skills/sdlc/references/phase-spec.md",
    "skills/sdlc/references/phase-tasks.md",
    "skills/sdlc/references/system-reference.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "npm test",
      "result": "passed",
      "summary": "397 tests pass, 0 fail, 0 skip; full corpus green including structural tests over references and disposition-ledger anchor test"
    },
    {
      "command": "grep -ri 'questions-helper\\|questions tool' skills/sdlc/",
      "result": "passed",
      "summary": "Zero matches — tool-dependent phrasing purged across the skill (plan DoD 3)"
    },
    {
      "command": "grep -qF 'input to** the PR panel' skills/sdlc/references/phase-pr-review.md",
      "result": "passed",
      "summary": "Guard phrase present — assumptions section named as panel input without weakening no-findings rule"
    }
  ],
  "validationOutput": [
    "All 397 tests pass. biome lint clean (144 files, no fixes). All six phase references contain 'Presenting questions to the human' contract pointer. Both PR templates carry 'Assumptions & discretionary calls' section. System-reference §11 routing table has the new row. §5 optional-enhancement narration and §6 Skills-and-tools example language purged of tool-dependent phrasing. Shared contract §14 has exact cap (3–5), three triage tiers, overflow-demotes rule, repo-discoverable-facts rule, and tool-agnostic language."
  ],
  "residualRisks": [
    "Shotgun Surgery: adding a new question-presentation rule to a future phase requires touching multiple phase references — acknowledged as deliberate by the plan's single-shared-contract-plus-deltas architecture",
    "The standards.panel-input-naming T2 check (grep for 'input to** the PR panel') depends on exact bold-formatting; rephrasing that line's emphasis style would cause a check failure without a real defect existing"
  ],
  "noStagedFiles": true,
  "diffSummary": "Docs-only: adds a shared question-presentation contract (§14 in system-reference.md) with six phase-shaped deltas across all phase references, updates both PR templates with an 'Assumptions & discretionary calls' section, folds in pre-existing async-dispatch guidance, and updates the cross-stream disposition ledger. 24 files changed, 2404 insertions, 20 deletions.",
  "reviewFindings": [
    "smell: Shotgun Surgery — 8+ files across 4 directories for one logical change (low severity, medium confidence, judgement call)"
  ],
  "manualNotes": "No high-confidence concrete defects found. The shared contract and its six phase deltas are internally consistent; all plan DoD items are verified; the async-dispatch guidance folded at commit 32ebaa1 is coherent; the PR-review escalation delta correctly reinterprets overflow-demotion as incorporation in the adversarial-review context."
}
```
