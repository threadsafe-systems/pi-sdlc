Task: PR review of branch feat/sdlc-retro-panel-precision at commit 7f8c3f6 (post fix wave 1) in repo root /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-retro-panel-precision. Actually read the diff and produce a real review with concrete findings; do NOT emit the acceptance-report template unfilled. TRACK: reversible — a Specification does not exist and must NOT be demanded. Artifact under review: the full diff `git diff main...HEAD`. This closes #118 and reworks the sdlc-retro collector: wave-vs-round identity via harvest-panel.mjs --wave + meta.json sidecar; collect-run.mjs discoverPanels sidecar read + precision join regrouped by (panelPhase,wave,date); render-retro.mjs wave grouping; discoverReviewDirs + buildSoftData accept both <phase>-<slug>-<date> and <phase>-review-<slug>-<date>; optional wave added to telemetry payloads, event.schema.json, run.schema.json, and validateRunJson (allow-not-require).
Fix wave 1 already addressed three prior-round findings — VERIFY these landed and are sound, and scan the whole diff for any NEW high/medium: (H1) a slug starting with `review-` is now matched only via the mandatory-infix form in discoverReviewDirs AND buildSoftData so one directory cannot be claimed by two slugs (see the collision regression test in test/telemetry-collect.test.js); (M1) run.schema.json's description documents same-version-pinned consumption (additive wave fields, no schemaVersion bump); (L4) the precision loop uses the resolved panelPhase, not candidates[0].
GOVERNING_DOCS: docs/plans/2026-07-19-sdlc-retro-panel-precision.md and docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md. Named review input: pr-body.md incl. its 'Assumptions & discretionary calls' section. Grounding rule: cite file:line for any framework/repo claim; verify backward-compat claims against the actual validator/schema code. Required output: findings only (severity high/medium/low, file:line, one-line remediation) or PASS with a one-line confirmation per H1/M1/L4, then the acceptance report with REAL values. Do not edit any files.
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
7f8c3f6 docs(sdlc): PR panel round-1 artifacts + consolidation (H1/M1/L4 fixed)
44fa116 fix(retro): disambiguate review-dir naming and tidy precision join (PR fix wave 1)
390fbe2 docs(sdlc): T4 validation receipt (runner PASS, validator PASS)
ff78031 feat(retro): group the panel deep-dive by logical wave (T4, #124)
b3adae5 docs(sdlc): T3 validation receipt (runner PASS, validator PASS)
---HEAD---
7f8c3f63375eb31a622f7de20024bfe838dd223e
---main---
8c3d556c1d6f38f5b1f822bc607a8602026636ac
---branches---
  feat/config-versioning-migration
+ feat/sdlc-lifecycle-telemetry
* feat/sdlc-retro-panel-precision
+ main
  remotes/origin/docs/archive-pr72-panel
  remotes/origin/docs/handover-2026-07-17
  remotes/origin/feat/config-versioning-migration
  remotes/origin/feat/e2e-integration-harness
  remotes/origin/feat/sdlc-lifecycle-telemetry
  remotes/origin/main
 .../2026-07-19-sdlc-retro-panel-precision-build.md |  108 +
 .../plans/2026-07-19-sdlc-retro-panel-precision.md |  200 +
 .../amazon-bedrock-claude-sonnet-5.md              | 1833 ++++++++
 .../consolidated.md                                |   32 +
 .../deepseek-deepseek-v4-pro.md                    | 4495 ++++++++++++++++++++
 .../prompt.md                                      |   20 +
 .../generated-agent.md                             |   48 +
 .../manifest.json                                  |   58 +
 .../receipt.json                                   |   12 +
 .../runner-report.json                             |  178 +
 .../validator.md                                   |  571 +++
 .../generated-agent.md                             |   48 +
 .../manifest.json                                  |   53 +
 .../receipt.json                                   |   12 +
 .../runner-report.json                             |  157 +
 .../validator.md                                   |  513 +++
 .../generated-agent.md                             |   48 +
 .../manifest.json                                  |   58 +
 .../receipt.json                                   |   12 +
 .../runner-report.json                             |  179 +
 .../validator.md                                   |  569 +++
 .../generated-agent.md                             |   48 +
 .../manifest.json                                  |   48 +
 .../receipt.json                                   |   12 +
 .../runner-report.json                             |  140 +
 .../validator.md                                   |  529 +++
 docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md  |    5 +-
 docs/validation/sdlc-retro-panel-precision/t1.json |   58 +
 docs/validation/sdlc-retro-panel-precision/t2.json |   53 +
 docs/validation/sdlc-retro-panel-precision/t3.json |   58 +
 docs/validation/sdlc-retro-panel-precision/t4.json |   48 +
 skills/sdlc-retro/schema/event.schema.json         |   19 +-
 skills/sdlc-retro/schema/run.schema.json           |    4 +-
 skills/sdlc-retro/scripts/collect-run.mjs          |   62 +-
 skills/sdlc-retro/scripts/render-retro.mjs         |   38 +-
 skills/sdlc/assets/normative-references.json       |    2 +-
 skills/sdlc/references/phase-pr-review.md          |    4 +-
 skills/sdlc/references/system-reference.md         |   24 +-
 skills/sdlc/scripts/harvest-panel.mjs              |   36 +-
 skills/sdlc/scripts/telemetry.mjs                  |   16 +
 test/telemetry-collect-soft.test.js                |  102 +
 test/telemetry-collect.test.js                     |   62 +-
 test/telemetry-harvest.test.js                     |   38 +
 test/telemetry-render.test.js                      |   21 +
 44 files changed, 10583 insertions(+), 48 deletions(-)
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
diff --git a/docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md b/docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md
index 1425aff..0f036c4 100644
--- a/docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md
+++ b/docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md
@@ -255,7 +255,9 @@ consulted.
    used only for steering classification and never copied into run.json
    verbatim).
 4. **Review artifacts**: `docs/reviews/<phase>-<slug>-<date>/` per-model
-   files and `consolidated.md`.
+   files and `consolidated.md`. The `<phase>-review-<slug>-<date>` form (a
+   `-review-` infix) is an equally-accepted alternative and the recommended
+   form going forward; the collector discovers both.
 5. **git/GitHub**: branch commits and diff stats via `--git-cmd` (default
    `git`) — an injectable seam exactly like `--gh-cmd`; a failing
    `--git-cmd` records `git.error` and collection continues. PR metadata,
@@ -362,6 +364,7 @@ schemaVersion: 1
 slug, title, track
 coverage:   [ { marker, detail? } ]          # closed v1 marker set:
             # manifest.absent, manifest.partial, panels.missing:<phase>,
+            # panels.malformed_meta:<phase>,
             # sessions.none, sessions.dir_unresolved, session.version:<file>,
             # github.skipped, github.error, git.error, llm.error:<kind>,
             # soft.absent, precision.unparsed:<dir>
diff --git a/skills/sdlc-retro/schema/event.schema.json b/skills/sdlc-retro/schema/event.schema.json
index 68db682..a6cfc51 100644
--- a/skills/sdlc-retro/schema/event.schema.json
+++ b/skills/sdlc-retro/schema/event.schema.json
@@ -62,13 +62,19 @@
     { "if": { "properties": { "event": { "const": "panel.agent_stamped" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "agent"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "agent": { "$ref": "#/definitions/nonEmptyString" } } } } } },
     {
       "if": { "properties": { "event": { "const": "panel.dispatched" } } },
-      "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "round", "models"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "models": { "$ref": "#/definitions/stringArray" } } } } }
+      "then": {
+        "properties": { "payload": { "type": "object", "required": ["panelPhase", "round", "models"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "models": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } } } }
+      }
     },
     {
       "if": { "properties": { "event": { "const": "panel.harvested" } } },
       "then": {
         "properties": {
-          "payload": { "type": "object", "required": ["panelPhase", "round", "dir", "missed"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "dir": { "$ref": "#/definitions/nonEmptyString" }, "missed": { "$ref": "#/definitions/stringArray" } } }
+          "payload": {
+            "type": "object",
+            "required": ["panelPhase", "round", "dir", "missed"],
+            "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "dir": { "$ref": "#/definitions/nonEmptyString" }, "missed": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } }
+          }
         }
       }
     },
@@ -79,7 +85,14 @@
           "payload": {
             "type": "object",
             "required": ["panelPhase", "round", "findings", "incorporated", "dismissed"],
-            "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "findings": { "$ref": "#/definitions/findings" }, "incorporated": { "$ref": "#/definitions/nonNegInt" }, "dismissed": { "$ref": "#/definitions/nonNegInt" } }
+            "properties": {
+              "panelPhase": { "$ref": "#/definitions/panelPhase" },
+              "round": { "$ref": "#/definitions/posInt" },
+              "findings": { "$ref": "#/definitions/findings" },
+              "incorporated": { "$ref": "#/definitions/nonNegInt" },
+              "dismissed": { "$ref": "#/definitions/nonNegInt" },
+              "wave": { "$ref": "#/definitions/posInt" }
+            }
           }
         }
       }
diff --git a/skills/sdlc-retro/schema/run.schema.json b/skills/sdlc-retro/schema/run.schema.json
index dd18d90..beca50f 100644
--- a/skills/sdlc-retro/schema/run.schema.json
+++ b/skills/sdlc-retro/schema/run.schema.json
@@ -2,7 +2,7 @@
   "$schema": "http://json-schema.org/draft-07/schema#",
   "$id": "https://github.com/threadsafe-systems/pi-sdlc/skills/sdlc-retro/schema/run.schema.json",
   "title": "sdlc-retro-run-record",
-  "description": "run.json v1 (spec §7): the distilled post-mortem record produced by collect-run from the FS13 run store. hard values are measured or absent (coverage-marked), never estimated; soft values are model-attributed and structurally separated so the renderer cannot conflate them.",
+  "description": "run.json v1 (spec §7): the distilled post-mortem record produced by collect-run from the FS13 run store. hard values are measured or absent (coverage-marked), never estimated; soft values are model-attributed and structurally separated so the renderer cannot conflate them. This schema is consumed same-version-pinned with the collector that produced the file (both ship in the sdlc-retro bundle); additive optional fields (e.g. panels[].wave, panelPrecision[].wave) therefore do not bump schemaVersion, but a separately-pinned/older copy of this closed schema will reject a newer record's added fields — pin the schema to the producing collector.",
   "type": "object",
   "additionalProperties": false,
   "required": ["schemaVersion", "slug", "coverage", "sizeProxies", "hard"],
@@ -95,6 +95,7 @@
             "properties": {
               "panelPhase": { "$ref": "#/definitions/panelPhase" },
               "round": { "$ref": "#/definitions/posInt" },
+              "wave": { "$ref": "#/definitions/posInt" },
               "dir": { "type": "string", "minLength": 1 },
               "models": {
                 "type": "array",
@@ -206,6 +207,7 @@
             "properties": {
               "panelPhase": { "$ref": "#/definitions/panelPhase" },
               "round": { "$ref": "#/definitions/posInt" },
+              "wave": { "$ref": "#/definitions/posInt" },
               "model": { "type": "string", "minLength": 1 },
               "raised": { "$ref": "#/definitions/nonNegInt" },
               "incorporated": { "$ref": "#/definitions/nonNegInt" },
diff --git a/skills/sdlc-retro/scripts/collect-run.mjs b/skills/sdlc-retro/scripts/collect-run.mjs
index f46d815..77ef10e 100755
--- a/skills/sdlc-retro/scripts/collect-run.mjs
+++ b/skills/sdlc-retro/scripts/collect-run.mjs
@@ -203,6 +203,7 @@ export function discoverPanels(root, slug, events) {
 	const panels = [];
 	const foundPhases = new Set();
 	const partialPhases = new Set();
+	const malformedMetaPhases = new Set();
 	const byPhaseRound = new Map();
 	if (existsSync(panelsDir)) {
 		for (const name of readdirSync(panelsDir).sort()) {
@@ -231,7 +232,22 @@ export function discoverPanels(root, slug, events) {
 			if (complete) foundPhases.add(panelPhase);
 			else partialPhases.add(panelPhase);
 			const round = Number(roundStr);
-			const entry = { panelPhase, round, dir: `.pi/sdlc/runs/${slug}/panels/${name}`, models, date, complete };
+			// Logical review-wave from the meta.json sidecar (T1). Absent → wave=round
+			// (every pre-sidecar harvest degrades cleanly). Malformed → wave=round and
+			// a panels.malformed_meta marker; never throws (mirrors the tolerant
+			// status.json handling above).
+			let wave = round;
+			const metaPath = join(dir, "meta.json");
+			if (existsSync(metaPath)) {
+				try {
+					const meta = JSON.parse(readFileSync(metaPath, "utf8"));
+					if (isPosInt(meta.wave)) wave = meta.wave;
+					else malformedMetaPhases.add(panelPhase);
+				} catch {
+					malformedMetaPhases.add(panelPhase);
+				}
+			}
+			const entry = { panelPhase, round, wave, dir: `.pi/sdlc/runs/${slug}/panels/${name}`, models, date, complete };
 			// Dedupe by (panelPhase, round): a re-harvest of the same round across a
 			// date boundary must not double-count hard totals. Keep the latest date.
 			const key = `${panelPhase}#${round}`;
@@ -249,6 +265,7 @@ export function discoverPanels(root, slug, events) {
 	for (const phase of [...new Set([...expectedPhases, ...partialPhases])].sort()) {
 		if (!foundPhases.has(phase) || partialPhases.has(phase)) markers.push({ marker: `panels.missing:${phase}` });
 	}
+	for (const phase of [...malformedMetaPhases].sort()) markers.push({ marker: `panels.malformed_meta:${phase}` });
 	return { panels, markers };
 }
@@ -261,7 +278,15 @@ export function discoverPanels(root, slug, events) {
 // touches the live reviews path.
 export function discoverReviewDirs(root, slug, reviewsPath = "docs/reviews", { fromRaw = false } = {}) {
 	const rawListPath = join("reviews", "_dirs.json");
-	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-${slug}-\\d{4}-\\d{2}-\\d{2}$`);
+	// Accept both the historical `<phase>-<slug>-<date>` and the now-dominant
+	// `<phase>-review-<slug>-<date>` naming (the `-review-` infix). Slugs match
+	// SLUG_RE (no regex-special chars), so interpolation is safe. To keep the two
+	// forms unambiguous, a slug that itself starts with `review-` is matched ONLY
+	// via the mandatory-infix form — otherwise `plan-review-foo-<date>` would be
+	// claimed by both slug `foo` (infix form) and slug `review-foo` (classic
+	// form). Such slugs use the recommended `-review-` form going forward.
+	const infix = slug.startsWith("review-") ? "review-" : "(?:review-)?";
+	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-${infix}${slug}-\\d{4}-\\d{2}-\\d{2}$`);
 	if (fromRaw) {
 		if (!rawExists(root, slug, rawListPath)) return [];
 		try {
@@ -710,9 +735,9 @@ export function validateRunJson(raw) {
 	if (!Array.isArray(h.panels)) add("/hard/panels", "must be an array of {panelPhase, round, dir, models[]}");
 	else
 		h.panels.forEach((p, i) => {
-			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[]}");
+			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[], wave?}");
 			else {
-				checkKeys(p, ["panelPhase", "round", "dir", "models"], `/hard/panels/${i}`, add);
+				checkKeys(p, ["panelPhase", "round", "wave", "dir", "models"], `/hard/panels/${i}`, add);
 				p.models.forEach((m, j) => {
 					if (
 						!isPlainObject(m) ||
@@ -770,8 +795,9 @@ export function validateRunJson(raw) {
 			if (!Array.isArray(sf.panelPrecision)) add("/soft/panelPrecision", "must be an array of {panelPhase, round, model, raised, incorporated, dismissed}");
 			else
 				sf.panelPrecision.forEach((p, i) => {
-					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed)) add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
-					else checkKeys(p, ["panelPhase", "round", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
+					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed))
+						add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
+					else checkKeys(p, ["panelPhase", "round", "wave", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
 				});
 		}
 	}
@@ -880,14 +906,23 @@ function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sess
 	const panelPrecision = [];
 	for (const dir of reviewDirs) {
-		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`));
+		// Match both naming forms (see discoverReviewDirs), with the same
+		// disambiguation: a slug starting with `review-` is matched only via the
+		// mandatory-infix form so one directory never belongs to two slugs.
+		const startsReview = slug.startsWith("review-");
+		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => (!startsReview && dir.startsWith(`${phase}-${slug}-`)) || dir.startsWith(`${phase}-review-${slug}-`));
 		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
 		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
 		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
 		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
-		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels.length === 1 ? matchingPanels : [];
-		const panel = candidates.length === 1 ? candidates[0] : undefined;
-		if (!panel) {
+		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels;
+		// Group by logical wave, not harvest round: multiple same-day rounds of one
+		// review wave (e.g. an infra-replacement dispatch) share a wave and join
+		// cleanly. precision.unparsed is emitted only when the candidates span more
+		// than one distinct wave (a genuine same-date ambiguity) or none match.
+		const waves = [...new Set(candidates.map((p) => p.wave))];
+		const wave = waves.length === 1 ? waves[0] : undefined;
+		if (candidates.length === 0 || wave === undefined) {
 			markers.push({ marker: `precision.unparsed:${dir}` });
 			continue;
 		}
@@ -932,8 +967,9 @@ function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sess
 				continue;
 			}
 			panelPrecision.push({
-				panelPhase: panel.panelPhase,
-				round: panel.round,
+				panelPhase,
+				round: wave,
+				wave,
 				model,
 				raised: pm.raised,
 				incorporated: pm.incorporated,
@@ -1058,7 +1094,7 @@ export function collect({ root, slug, gitCmd = "git", baseRef = "main", ghCmd =
 		window: { start: windowStart, end: windowEnd },
 		phases: spans.map((s) => ({ phase: s.phase, start: s.start, end: s.end, exitExplicit: s.exitExplicit })),
 		sessions: hardSessions,
-		panels: panels.map((p) => ({ panelPhase: p.panelPhase, round: p.round, dir: p.dir, models: p.models })),
+		panels: panels.map((p) => ({ panelPhase: p.panelPhase, round: p.round, wave: p.wave, dir: p.dir, models: p.models })),
 		models: [...distinctModels].sort(),
 		rollups: {
 			byModel: [...byModelMap.entries()].map(([model, v]) => ({ model, tokens: v.tokens, cost: v.cost })).sort((a, b) => (a.model < b.model ? -1 : 1)),
diff --git a/skills/sdlc-retro/scripts/render-retro.mjs b/skills/sdlc-retro/scripts/render-retro.mjs
index fe9a8ac..3c4d8f1 100755
--- a/skills/sdlc-retro/scripts/render-retro.mjs
+++ b/skills/sdlc-retro/scripts/render-retro.mjs
@@ -87,10 +87,32 @@ function renderPanelDeepdive(run) {
 	const panels = run.hard.panels;
 	const precision = run.soft?.panelPrecision ?? [];
 	if (panels.length === 0) return `<section id="panel-deepdive"><h2>Panel deep-dive</h2><p class="coverage-notice">no harvested panel rounds</p></section>`;
-	const blocks = panels
-		.map((p) => {
-			const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
-			const findings = precision.filter((pr) => pr.panelPhase === p.panelPhase && pr.round === p.round);
+	// Group harvested rounds by logical wave (wave defaults to round for records
+	// predating the wave field), collapsing same-wave rounds (e.g. an
+	// infra-replacement dispatch) into one section with each round as sub-detail.
+	const groups = new Map();
+	for (const p of panels) {
+		const wave = p.wave ?? p.round;
+		const key = `${p.panelPhase}#${wave}`;
+		if (!groups.has(key)) groups.set(key, { panelPhase: p.panelPhase, wave, rounds: [] });
+		groups.get(key).rounds.push(p);
+	}
+	const ordered = [...groups.values()].sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.wave - b.wave));
+	const blocks = ordered
+		.map((g) => {
+			const roundBlocks = g.rounds
+				.slice()
+				.sort((a, b) => a.round - b.round)
+				.map((p) => {
+					const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
+					const roundLabel = p.round === g.wave ? `round ${p.round}` : `round ${p.round} (replacement)`;
+					return `<div class="panel-round" data-round="${p.round}">
+<h4>${esc(roundLabel)}</h4>
+${modelRows || '<p class="coverage-notice">no per-model metrics for this round</p>'}
+</div>`;
+				})
+				.join("\n");
+			const findings = precision.filter((pr) => pr.panelPhase === g.panelPhase && (pr.wave ?? pr.round) === g.wave);
 			const findingRows =
 				findings.length > 0
 					? findings
@@ -99,10 +121,10 @@ function renderPanelDeepdive(run) {
 									`<div class="panel-finding-row" data-soft="true" data-model="${esc(f.model)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span>${esc(f.model)}</span><span>raised ${f.raised}</span><span>incorporated ${f.incorporated}</span><span>dismissed ${f.dismissed}</span></div>`,
 							)
 							.join("\n")
-					: '<p class="coverage-notice">no precision figures for this round</p>';
-			return `<div class="panel-round" data-panel-phase="${esc(p.panelPhase)}" data-round="${p.round}">
-<h3>${esc(p.panelPhase)} round ${p.round}</h3>
-${modelRows}
+					: '<p class="coverage-notice">no precision figures for this wave</p>';
+			return `<div class="panel-wave" data-panel-phase="${esc(g.panelPhase)}" data-wave="${g.wave}">
+<h3>${esc(g.panelPhase)} wave ${g.wave}</h3>
+${roundBlocks}
 ${findingRows}
 </div>`;
 		})
diff --git a/skills/sdlc/assets/normative-references.json b/skills/sdlc/assets/normative-references.json
index d517fe1..8e2de29 100644
--- a/skills/sdlc/assets/normative-references.json
+++ b/skills/sdlc/assets/normative-references.json
@@ -757,7 +757,7 @@
     {
       "id": "sdlc.skill.harvest-panel-pointer",
       "source": "skills/sdlc/references/system-reference.md",
-      "assertion": "scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`\n  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).",
+      "assertion": "scripts/harvest-panel.sh --phase <panelPhase> --round <label> --wave <wave> --from <asyncDir>`\n  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).",
       "targetKind": "command",
       "ownership": "package",
       "required": true,
diff --git a/skills/sdlc/references/phase-pr-review.md b/skills/sdlc/references/phase-pr-review.md
index 27a77e1..4475a8d 100644
--- a/skills/sdlc/references/phase-pr-review.md
+++ b/skills/sdlc/references/phase-pr-review.md
@@ -221,7 +221,9 @@ hand-copy a prompt per model.
 Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
 file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
-adjudication and the orchestrating model.
+adjudication and the orchestrating model. The `<phase>-review-<feat>-<date>`
+form (a `-review-` infix) is equally accepted and recommended going forward;
+the retro collector discovers both.
 > **Under your configuration:** whether a Plan panel and a Spec panel run at all
 > depends on the effective track and `review.design`; the PR panel runs on both
diff --git a/skills/sdlc/references/system-reference.md b/skills/sdlc/references/system-reference.md
index 58b42e5..fcfd98b 100644
--- a/skills/sdlc/references/system-reference.md
+++ b/skills/sdlc/references/system-reference.md
@@ -308,19 +308,23 @@ event-type payload:
 - **Every human gate approval**: when the human approves a phase's gate —
   `record-run-event.sh gate.approved --payload '{"phase":"<phase>","artifact":"<path>","rev":<n>,"approver":"human:<slug>"}'`.
 - **Panel dispatch**: immediately after dispatching a design or PR panel —
-  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<n>,"models":[...]}'`
+  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<wave>,"models":[...]}'`
   — and, harvest-at-dispatch, immediately preserve its artifacts with
-  `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`
+  `scripts/harvest-panel.sh --phase <panelPhase> --round <label> --wave <wave> --from <asyncDir>`
   (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
-  The `<n>` in `panel.dispatched` and `panel.consolidated` is the **logical
-  review-wave counter**: a replacement dispatch for an infra-failed reviewer
-  belongs to its original wave and emits `panel.dispatched` with that wave's
-  `<n>`. The harvest `--round` is a **destination allocation label** that may
-  advance past the wave counter to avoid overwriting a prior snapshot (see
-  `references/phase-pr-review.md`, "Harvest-at-dispatch"); whenever the two
-  diverge, record the label↔wave mapping in that wave's `consolidated.md`.
+  Two distinct numbers appear here on purpose: `<wave>` is the **logical
+  review-wave counter** — a replacement dispatch for an infra-failed reviewer
+  belongs to its original wave and carries that wave's `<wave>` in the `round`
+  payload field of both the dispatch and consolidation events and in
+  `harvest-panel --wave`. `<label>` is the harvest `--round` **destination
+  allocation label**, which may advance past the wave to avoid overwriting a
+  prior snapshot (see `references/phase-pr-review.md`, "Harvest-at-dispatch");
+  it defaults to `<wave>` when omitted. `harvest-panel` records both in a
+  `meta.json` sidecar so the collector groups same-wave rounds without parsing
+  prose; still note any label↔wave divergence in that wave's `consolidated.md`
+  for human readers.
 - **Panel consolidation**: after adjudicating a round's findings —
-  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<n>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
+  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<wave>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
 - **Caller-side lifecycle-check recording**: right after running
   `check-lifecycle` (itself untouched, FS9) —
   `record-run-event.sh lifecycle.checked --payload '{"verdict":"<verdict>"}'`.
diff --git a/skills/sdlc/scripts/harvest-panel.mjs b/skills/sdlc/scripts/harvest-panel.mjs
index bbb3d2b..d524b8d 100755
--- a/skills/sdlc/scripts/harvest-panel.mjs
+++ b/skills/sdlc/scripts/harvest-panel.mjs
@@ -4,7 +4,7 @@
 // panel dispatch's async run directory into the consumer's run store, before
 // they evaporate.
 //
-// Usage: harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S]
+// Usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S]
 //                          [--with-transcripts] [--format text|json]
 //                          [--config DIR | --repo-root DIR]
 //
@@ -12,12 +12,15 @@
 // events.jsonl at its top level (the shape of a pi-subagents asyncDir).
 // Harvest copies both into panels/<panelPhase>-round<N>-<date>/;
 // --with-transcripts additionally copies a top-level transcripts/
-// subdirectory (when present) into transcripts/ at the destination. A
-// missing/aborted source directory or file is a report, not a throw: exit 0,
+// subdirectory (when present) into transcripts/ at the destination. It also
+// writes a meta.json sidecar {round, wave}: --round is the destination
+// allocation label, --wave is the logical review-wave (defaults to --round
+// when omitted, so a replacement dispatch can share its original wave while
+// taking a fresh label). A missing/aborted source directory or file is a report, not a throw: exit 0,
 // missed[] populated, and the panel.harvested event records the gap. Exit 2
 // only for usage errors or an unwritable destination.
-import { cpSync, existsSync, mkdirSync, statSync } from "node:fs";
+import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
 import { join, relative } from "node:path";
 import { inspectRoot } from "./lib.mjs";
 import { emitEvent, PANEL_PHASES, resolveRunSlug, runStoreDir } from "./telemetry.mjs";
@@ -38,6 +41,7 @@ function parseArgs(argv) {
 		};
 		if (a === "--phase") opts.phase = val("--phase");
 		else if (a === "--round") opts.round = val("--round");
+		else if (a === "--wave") opts.wave = val("--wave");
 		else if (a === "--from") opts.from = val("--from");
 		else if (a === "--slug") opts.slug = val("--slug");
 		else if (a === "--with-transcripts") opts.withTranscripts = true;
@@ -54,7 +58,7 @@ function parseArgs(argv) {
 }
 function usage() {
-	return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
+	return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
 }
 // Copy one file if present; return "copied" | "missed".
@@ -83,6 +87,10 @@ function main() {
 	if (!opts.round) bail(usage());
 	const round = Number(opts.round);
 	if (!Number.isInteger(round) || round <= 0) bail("--round must be a positive integer");
+	// The logical review-wave defaults to the allocation label when not given, so
+	// existing single-dispatch harvests are byte-identical in meaning (wave===round).
+	const wave = opts.wave === undefined ? round : Number(opts.wave);
+	if (!Number.isInteger(wave) || wave <= 0) bail("--wave must be a positive integer");
 	if (!opts.from) bail(usage());
 	const rootResult = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot });
@@ -116,13 +124,25 @@ function main() {
 		if (status === "missed") missed.push("transcripts");
 	}
+	// meta.json sidecar records the {round, wave} distinction so the collector
+	// can group same-wave harvest rounds without parsing prose. Written after the
+	// copies; a failure here is not fatal to the harvest itself.
+	let metaWritten = false;
+	try {
+		writeFileSync(join(destDir, "meta.json"), `${JSON.stringify({ round, wave }, null, 2)}\n`);
+		metaWritten = true;
+	} catch {
+		missed.push("meta.json");
+	}
+	files.push({ name: "meta.json", status: metaWritten ? "copied" : "missed" });
+
 	const relDir = relative(root, destDir);
-	const report = { ok: true, phase: opts.phase, round, dir: relDir, files, missed };
+	const report = { ok: true, phase: opts.phase, round, wave, dir: relDir, files, missed };
 	if (opts.format === "json") {
 		console.log(JSON.stringify(report, null, 2));
 	} else {
-		console.log(`harvested ${opts.phase} round ${round} -> ${relDir}`);
+		console.log(`harvested ${opts.phase} round ${round} (wave ${wave}) -> ${relDir}`);
 		for (const f of files) console.log(`  ${f.name}: ${f.status}`);
 		if (missed.length > 0) console.log(`missed: ${missed.join(", ")}`);
 	}
@@ -131,7 +151,7 @@ function main() {
 		event: "panel.harvested",
 		slug,
 		by: "script:harvest-panel",
-		payload: { panelPhase: opts.phase, round, dir: relDir, missed },
+		payload: { panelPhase: opts.phase, round, wave, dir: relDir, missed },
 		root,
 	});
diff --git a/skills/sdlc/scripts/telemetry.mjs b/skills/sdlc/scripts/telemetry.mjs
index 5e6460f..c149c80 100644
--- a/skills/sdlc/scripts/telemetry.mjs
+++ b/skills/sdlc/scripts/telemetry.mjs
@@ -102,6 +102,16 @@ export const EVENT_PAYLOADS = Object.freeze({
 	],
 });
+// Optional, additive payload fields per event: type-checked when present, never
+// required (so emitting them is backward-compatible and omitting them is valid).
+// `wave` distinguishes the logical review-wave from the harvest allocation label
+// (`round`) on panel events; a replacement dispatch keeps its original wave.
+export const OPTIONAL_EVENT_PAYLOADS = Object.freeze({
+	"panel.dispatched": [["wave", "posInt"]],
+	"panel.harvested": [["wave", "posInt"]],
+	"panel.consolidated": [["wave", "posInt"]],
+});
+
 export const KNOWN_EVENTS = Object.keys(EVENT_PAYLOADS);
 function isPlainObject(v) {
@@ -167,6 +177,12 @@ export function validatePayload(event, payload) {
 		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
 		if (problem) issues.push(problem);
 	}
+	// Optional fields: type-checked only when present; absence is never an issue.
+	for (const [name, type] of OPTIONAL_EVENT_PAYLOADS[event] ?? []) {
+		if (!(name in payload)) continue;
+		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
+		if (problem) issues.push(problem);
+	}
 	return issues;
 }
diff --git a/test/telemetry-collect-soft.test.js b/test/telemetry-collect-soft.test.js
index 18911c0..11a9cc8 100644
--- a/test/telemetry-collect-soft.test.js
+++ b/test/telemetry-collect-soft.test.js
@@ -155,6 +155,108 @@ test("LT18: soft data carries attribution and matches the fixture LLM's scripted
 	}
 });
+test("T2: a -review- form review directory yields non-empty precision (F1 extraction guard)", () => {
+	const root = tmp();
+	const bin = tmp("sdlc-lt5-bin-");
+	try {
+		const slug = "t2-review";
+		seedManifest(root, slug);
+		const date = "2026-07-18";
+		// a harvested panel the review dir can join to
+		const panelDir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round1-${date}`);
+		mkdirSync(panelDir, { recursive: true });
+		writeFileSync(join(panelDir, "status.json"), JSON.stringify({ state: "completed" }));
+		writeFileSync(join(panelDir, "events.jsonl"), "");
+		// the review dir uses the -review- infix form (would silently unparse before F1)
+		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
+		mkdirSync(reviewDir, { recursive: true });
+		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
+		writeFileSync(join(reviewDir, "model-a.md"), "findings");
+		const llmCmd = mkLlmStub(bin);
+
+		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
+		const markers = runJson.coverage.map((c) => c.marker);
+		assert.ok(!markers.includes(`precision.unparsed:pr-review-${slug}-${date}`), `-review- dir must not unparse; got ${markers}`);
+		assert.ok(runJson.soft.panelPrecision.length > 0, "precision recorded for the -review- directory");
+		assert.equal(runJson.soft.panelPrecision[0].panelPhase, "pr_review");
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(bin, { recursive: true, force: true });
+	}
+});
+
+test("T3: same-wave multi-round harvests (a replacement dispatch) join to one wave without precision.unparsed", () => {
+	const root = tmp();
+	const bin = tmp("sdlc-lt5-bin-");
+	try {
+		const slug = "t3-onewave";
+		seedManifest(root, slug);
+		const date = "2026-07-18";
+		// two harvested rounds on the same date, both logical wave 1 (round 2 is a replacement)
+		for (const [round, wave] of [
+			[1, 1],
+			[2, 1],
+		]) {
+			const pdir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round${round}-${date}`);
+			mkdirSync(pdir, { recursive: true });
+			writeFileSync(join(pdir, "status.json"), JSON.stringify({ state: "completed" }));
+			writeFileSync(join(pdir, "events.jsonl"), "");
+			writeFileSync(join(pdir, "meta.json"), JSON.stringify({ round, wave }));
+		}
+		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
+		mkdirSync(reviewDir, { recursive: true });
+		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
+		writeFileSync(join(reviewDir, "model-a.md"), "findings");
+		const llmCmd = mkLlmStub(bin);
+
+		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
+		const markers = runJson.coverage.map((c) => c.marker);
+		assert.ok(!markers.some((m) => m.startsWith("precision.unparsed")), `no unparse expected; got ${markers}`);
+		assert.ok(runJson.soft.panelPrecision.length > 0, "precision recorded for the one-wave review");
+		assert.ok(
+			runJson.soft.panelPrecision.every((p) => p.wave === 1 && p.round === 1),
+			"precision attributed to logical wave 1",
+		);
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(bin, { recursive: true, force: true });
+	}
+});
+
+test("T3: harvests that disagree on wave for one review date emit precision.unparsed", () => {
+	const root = tmp();
+	const bin = tmp("sdlc-lt5-bin-");
+	try {
+		const slug = "t3-multiwave";
+		seedManifest(root, slug);
+		const date = "2026-07-18";
+		// two harvested rounds on the same date belonging to DIFFERENT waves
+		for (const [round, wave] of [
+			[1, 1],
+			[2, 2],
+		]) {
+			const pdir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round${round}-${date}`);
+			mkdirSync(pdir, { recursive: true });
+			writeFileSync(join(pdir, "status.json"), JSON.stringify({ state: "completed" }));
+			writeFileSync(join(pdir, "events.jsonl"), "");
+			writeFileSync(join(pdir, "meta.json"), JSON.stringify({ round, wave }));
+		}
+		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
+		mkdirSync(reviewDir, { recursive: true });
+		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
+		writeFileSync(join(reviewDir, "model-a.md"), "findings");
+		const llmCmd = mkLlmStub(bin);
+
+		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
+		const markers = runJson.coverage.map((c) => c.marker);
+		assert.ok(markers.includes(`precision.unparsed:pr-review-${slug}-${date}`), `expected wave-disagreement unparse; got ${markers}`);
+		assert.equal(runJson.soft.panelPrecision.length, 0, "no precision when waves disagree");
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(bin, { recursive: true, force: true });
+	}
+});
+
 test("LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number", () => {
 	const root = tmp();
 	const home = tmp("sdlc-lt5-home-empty-");
diff --git a/test/telemetry-collect.test.js b/test/telemetry-collect.test.js
index 9b5a635..e1a7d20 100644
--- a/test/telemetry-collect.test.js
+++ b/test/telemetry-collect.test.js
@@ -248,6 +248,42 @@ test("LT15: harvest adapter maps per-model fields correctly", () => {
 		assert.equal(panels[0].panelPhase, "pr_review");
 		assert.equal(panels[0].round, 1);
 		assert.deepEqual(panels[0].models, [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }]);
+		assert.equal(panels[0].wave, 1, "wave defaults to round when no meta.json sidecar");
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+	}
+});
+
+test("T3: discoverPanels reads the meta.json wave; malformed sidecar falls back to round with a marker", () => {
+	const root = tmp();
+	try {
+		const slug = "t3-meta";
+		seedManifest(root, slug);
+		const date = "2026-07-19";
+		const panelsRoot = join(root, ".pi", "sdlc", "runs", slug, "panels");
+		// round 2, logical wave 1 (a replacement dispatch) with a valid sidecar
+		const d1 = join(panelsRoot, `pr_review-round2-${date}`);
+		mkdirSync(d1, { recursive: true });
+		writeFileSync(join(d1, "status.json"), JSON.stringify({ state: "completed" }));
+		writeFileSync(join(d1, "events.jsonl"), "");
+		writeFileSync(join(d1, "meta.json"), JSON.stringify({ round: 2, wave: 1 }));
+		// a malformed sidecar on a plan_review round 1: wave falls back to round, marker emitted
+		const d2 = join(panelsRoot, `plan_review-round1-${date}`);
+		mkdirSync(d2, { recursive: true });
+		writeFileSync(join(d2, "status.json"), JSON.stringify({ state: "completed" }));
+		writeFileSync(join(d2, "events.jsonl"), "");
+		writeFileSync(join(d2, "meta.json"), "{ not valid json");
+		const { panels, markers } = discoverPanels(root, slug, []);
+		const pr = panels.find((p) => p.panelPhase === "pr_review");
+		const plan = panels.find((p) => p.panelPhase === "plan_review");
+		assert.equal(pr.round, 2);
+		assert.equal(pr.wave, 1, "valid sidecar wave is read");
+		assert.equal(plan.round, 1);
+		assert.equal(plan.wave, 1, "malformed sidecar falls back to wave=round");
+		assert.ok(
+			markers.some((m) => m.marker === "panels.malformed_meta:plan_review"),
+			`expected panels.malformed_meta marker; got ${JSON.stringify(markers)}`,
+		);
 	} finally {
 		rmSync(root, { recursive: true, force: true });
 	}
@@ -276,15 +312,37 @@ test("LT15: transcript usage/cost sums correctly and a version-4 transcript soft
 	}
 });
-test("LT15: review-dir discovery matches <phase>-<slug>-<date> naming", () => {
+test("LT15: review-dir discovery matches both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> naming", () => {
 	const root = tmp();
 	try {
 		const slug = "lt15-review";
 		mkdirSync(join(root, "docs", "reviews", `spec-${slug}-2026-07-17`), { recursive: true });
 		mkdirSync(join(root, "docs", "reviews", `pr-${slug}-2026-07-18`), { recursive: true });
+		mkdirSync(join(root, "docs", "reviews", `pr-review-${slug}-2026-07-19`), { recursive: true }); // new -review- form
+		mkdirSync(join(root, "docs", "reviews", `plan-review-${slug}-2026-07-16`), { recursive: true }); // new -review- form
 		mkdirSync(join(root, "docs", "reviews", `task-validate-${slug}-lt-x-2026-07-17`), { recursive: true }); // must NOT match
 		const found = discoverReviewDirs(root, slug);
-		assert.deepEqual(found, [`pr-${slug}-2026-07-18`, `spec-${slug}-2026-07-17`]);
+		assert.deepEqual(found, [`plan-review-${slug}-2026-07-16`, `pr-${slug}-2026-07-18`, `pr-review-${slug}-2026-07-19`, `spec-${slug}-2026-07-17`]);
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+	}
+});
+
+test("T2/PR-fix: a review-<x> slug does not collide with slug <x> over one -review- directory", () => {
+	const root = tmp();
+	try {
+		// one physical directory that both slug 'foo' (infix form) and slug
+		// 'review-foo' (classic form) could otherwise claim
+		mkdirSync(join(root, "docs", "reviews", "plan-review-foo-2026-07-19"), { recursive: true });
+		const asFoo = discoverReviewDirs(root, "foo");
+		const asReviewFoo = discoverReviewDirs(root, "review-foo");
+		// exactly one slug owns it: 'foo' via the infix form; 'review-foo' is
+		// steered to the mandatory-infix form and must NOT claim it
+		assert.deepEqual(asFoo, ["plan-review-foo-2026-07-19"]);
+		assert.deepEqual(asReviewFoo, [], "review-<x> slug must not claim <x>'s -review- directory");
+		// review-foo still finds its own mandatory-infix directory
+		mkdirSync(join(root, "docs", "reviews", "plan-review-review-foo-2026-07-19"), { recursive: true });
+		assert.deepEqual(discoverReviewDirs(root, "review-foo"), ["plan-review-review-foo-2026-07-19"]);
 	} finally {
 		rmSync(root, { recursive: true, force: true });
 	}
diff --git a/test/telemetry-harvest.test.js b/test/telemetry-harvest.test.js
index 0817cd6..8df7c6c 100644
--- a/test/telemetry-harvest.test.js
+++ b/test/telemetry-harvest.test.js
@@ -78,8 +78,46 @@ test("LT11: harvest copies status.json + events.jsonl and emits panel.harvested"
 		assert.equal(events[0].by, "script:harvest-panel");
 		assert.equal(events[0].payload.panelPhase, "pr_review");
 		assert.equal(events[0].payload.round, 1);
+		assert.equal(events[0].payload.wave, 1, "wave defaults to round when --wave omitted");
 		assert.deepEqual(events[0].payload.missed, []);
 		assert.ok(events[0].payload.dir.includes("panels"));
+		// meta.json sidecar records the {round, wave} distinction (default wave===round).
+		assert.deepEqual(JSON.parse(readFileSync(join(destDir, "meta.json"), "utf8")), { round: 1, wave: 1 });
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(src, { recursive: true, force: true });
+	}
+});
+
+test("T1: --wave records a logical wave distinct from the round allocation label", () => {
+	const root = tmp("sdlc-lt3-root-");
+	const src = mkAsyncDir();
+	try {
+		// a replacement dispatch: fresh round label 2, but logical wave 1
+		const r = run(["--phase", "pr_review", "--round", "2", "--wave", "1", "--from", src, "--repo-root", root, "--slug", "t1-wave", "--format", "json"]);
+		assert.equal(r.status, 0, r.stderr);
+		const report = JSON.parse(r.stdout);
+		assert.equal(report.round, 2);
+		assert.equal(report.wave, 1);
+		const date = new Date().toISOString().slice(0, 10);
+		const destDir = join(root, ".pi", "sdlc", "runs", "t1-wave", "panels", `pr_review-round2-${date}`);
+		assert.deepEqual(JSON.parse(readFileSync(join(destDir, "meta.json"), "utf8")), { round: 2, wave: 1 });
+		const events = readEvents(root, "t1-wave");
+		assert.equal(events[0].payload.round, 2);
+		assert.equal(events[0].payload.wave, 1);
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(src, { recursive: true, force: true });
+	}
+});
+
+test("T1: --wave must be a positive integer", () => {
+	const root = tmp("sdlc-lt3-root-");
+	const src = mkAsyncDir();
+	try {
+		const bad = run(["--phase", "pr_review", "--round", "1", "--wave", "0", "--from", src, "--repo-root", root]);
+		assert.equal(bad.status, 2);
+		assert.match(bad.stderr, /--wave must be a positive integer/);
 	} finally {
 		rmSync(root, { recursive: true, force: true });
 		rmSync(src, { recursive: true, force: true });
diff --git a/test/telemetry-render.test.js b/test/telemetry-render.test.js
index 6fc9d9d..6886ae3 100644
--- a/test/telemetry-render.test.js
+++ b/test/telemetry-render.test.js
@@ -120,6 +120,27 @@ test("LT20: full fixture renders all seven anchors with known-answer data bindin
 	assert.ok(/PR fix waves[\s\S]*?<span>1<\/span>/.test(html));
 });
+test("T4: same-wave harvest rounds collapse into one wave section with each round as sub-detail", () => {
+	const fx = fullFixture();
+	// two harvested rounds of one logical wave (round 2 a replacement dispatch)
+	fx.hard.panels = [
+		{ panelPhase: "pr_review", round: 1, wave: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round1-2026-07-18", models: [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }] },
+		{ panelPhase: "pr_review", round: 2, wave: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round2-2026-07-18", models: [{ model: "deepseek/deepseek-v4-pro", tokens: 80, cost: 0.4, durationMs: 900, turns: 2 }] },
+	];
+	fx.soft.panelPrecision = [{ panelPhase: "pr_review", round: 1, wave: 1, model: "openai/gpt-5", raised: 2, incorporated: 1, dismissed: 1 }];
+	const html = renderDashboard(fx);
+	// exactly one wave section for pr_review wave 1
+	const waveSections = html.match(/data-wave="1"/g) ?? [];
+	assert.equal(waveSections.length, 1, "same-wave rounds collapse into one wave section");
+	assert.ok(html.includes('data-panel-phase="pr_review"'));
+	assert.ok(html.includes("wave 1"), "section titled by wave");
+	// both constituent rounds appear as sub-detail
+	assert.ok(html.includes('data-round="1"') && html.includes('data-round="2"'), "each round shown as sub-detail");
+	assert.ok(html.includes("(replacement)"), "a round whose label differs from the wave is marked a replacement");
+	// precision joined once on the wave
+	assert.ok(html.includes("raised 2") && html.includes("incorporated 1") && html.includes("dismissed 1"));
+});
+
 test("LT20: an empty-shell run.json fails to carry any pinned data binding", () => {
 	const html = renderDashboard(emptyFixture());
 	for (const anchor of SECTION_ANCHORS) assert.ok(html.includes(`id="${anchor}"`));
read: skills/sdlc-retro/scripts/collect-run.mjs
read: skills/sdlc-retro/scripts/collect-run.mjs
	if (!isPlainObject(status)) return [];
	const results = Array.isArray(status.results) ? status.results : [status];
	const models = [];
	for (const r of results) {
		if (!isPlainObject(r)) continue;
		const model = typeof r.model === "string" ? r.model : Array.isArray(r.attemptedModels) && typeof r.attemptedModels[0] === "string" ? r.attemptedModels[0] : undefined;
		if (!model) continue;
		const entry = { model };
		if (Number.isInteger(r.totalTokens) && r.totalTokens >= 0) entry.tokens = r.totalTokens;
		if (Number.isFinite(r.totalCost) && r.totalCost >= 0) entry.cost = r.totalCost;
		if (Number.isInteger(r.durationMs) && r.durationMs >= 0) entry.durationMs = r.durationMs;
		if (Number.isInteger(r.turnCount) && r.turnCount >= 0) entry.turns = r.turnCount;
		models.push(entry);
	}
	return models;
}
// Discover harvested panel directories on disk (spec §5 naming), independent
// of whether the manifest recorded a matching panel.harvested event (more
// resilient to a partially-instrumented run). Missing phases are derived by
// diffing panel-related manifest events against what is actually on disk.
export function discoverPanels(root, slug, events) {
	const panelsDir = join(runStoreDir(root, slug), "panels");
	const panels = [];
	const foundPhases = new Set();
	const partialPhases = new Set();
	const malformedMetaPhases = new Set();
	const byPhaseRound = new Map();
	if (existsSync(panelsDir)) {
		for (const name of readdirSync(panelsDir).sort()) {
			const m = PANEL_DIR_RE.exec(name);
			if (!m) continue;
			const [, panelPhase, roundStr, date] = m;
			const dir = join(panelsDir, name);
			if (!statSync(dir).isDirectory()) continue;
			const statusPath = join(dir, "status.json");
			const eventsPath = join(dir, "events.jsonl");
			if (!existsSync(statusPath) && !existsSync(eventsPath)) {
				partialPhases.add(panelPhase);
				continue;
			}
			let models = [];
			let statusValid = false;
			if (existsSync(statusPath)) {
				try {
					models = extractPanelModels(JSON.parse(readFileSync(statusPath, "utf8")));
					statusValid = true;
				} catch {
					// unparseable status.json: no per-model metrics for this round
				}
			}
			const complete = statusValid && existsSync(eventsPath);
			if (complete) foundPhases.add(panelPhase);
			else partialPhases.add(panelPhase);
			const round = Number(roundStr);
			// Logical review-wave from the meta.json sidecar (T1). Absent → wave=round
			// (every pre-sidecar harvest degrades cleanly). Malformed → wave=round and
			// a panels.malformed_meta marker; never throws (mirrors the tolerant
			// status.json handling above).
			let wave = round;
			const metaPath = join(dir, "meta.json");
			if (existsSync(metaPath)) {
				try {
					const meta = JSON.parse(readFileSync(metaPath, "utf8"));
					if (isPosInt(meta.wave)) wave = meta.wave;
					else malformedMetaPhases.add(panelPhase);
				} catch {
					malformedMetaPhases.add(panelPhase);
				}
			}
			const entry = { panelPhase, round, wave, dir: `.pi/sdlc/runs/${slug}/panels/${name}`, models, date, complete };
			// Dedupe by (panelPhase, round): a re-harvest of the same round across a
			// date boundary must not double-count hard totals. Keep the latest date.
			const key = `${panelPhase}#${round}`;
			const existing = byPhaseRound.get(key);
			if (!existing || (entry.complete && !existing.complete) || (entry.complete === existing.complete && date > existing.date)) byPhaseRound.set(key, entry);
		}
	}
	for (const { date, complete, ...entry } of byPhaseRound.values()) panels.push(entry);
	panels.sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.round - b.round));
	const expectedPhases = new Set();
	for (const e of events) {
		if (e.event === "panel.dispatched" || e.event === "panel.harvested" || e.event === "panel.consolidated") expectedPhases.add(e.payload.panelPhase);
	}
	const markers = [];
	for (const phase of [...new Set([...expectedPhases, ...partialPhases])].sort()) {
		if (!foundPhases.has(phase) || partialPhases.has(phase)) markers.push({ marker: `panels.missing:${phase}` });
	}
	for (const phase of [...malformedMetaPhases].sort()) markers.push({ marker: `panels.malformed_meta:${phase}` });
	return { panels, markers };
}
// ---- review-directory discovery (spec §6.1.4) -----------------------------
// Discovers panel-round review directories named <lifecycle-phase>-<slug>-<date>
// under the configured reviews path (default docs/reviews), and snapshots the
// discovered list into raw/ (spec §6.4: the directory listing itself is
// non-manifest input). --from-raw reads that snapshot exclusively and never
// touches the live reviews path.
export function discoverReviewDirs(root, slug, reviewsPath = "docs/reviews", { fromRaw = false } = {}) {
	const rawListPath = join("reviews", "_dirs.json");
	// Accept both the historical `<phase>-<slug>-<date>` and the now-dominant
	// `<phase>-review-<slug>-<date>` naming (the `-review-` infix). Slugs match
	// SLUG_RE (no regex-special chars), so interpolation is safe. To keep the two
	// forms unambiguous, a slug that itself starts with `review-` is matched ONLY
	// via the mandatory-infix form — otherwise `plan-review-foo-<date>` would be
	// claimed by both slug `foo` (infix form) and slug `review-foo` (classic
	// form). Such slugs use the recommended `-review-` form going forward.
	const infix = slug.startsWith("review-") ? "review-" : "(?:review-)?";
	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-${infix}${slug}-\\d{4}-\\d{2}-\\d{2}$`);
	if (fromRaw) {
		if (!rawExists(root, slug, rawListPath)) return [];
		try {
			const dirs = JSON.parse(readRaw(root, slug, rawListPath));
			return Array.isArray(dirs) ? dirs.filter((name) => typeof name === "string" && re.test(name)).sort() : [];
		} catch {
			return [];
		}
	}
	const base = join(root, reviewsPath);
	if (!existsSync(base)) {
		snapshotRaw(root, slug, rawListPath, "[]");
		return [];
	}
	const dirs = readdirSync(base)
		.filter((name) => re.test(name) && statSync(join(base, name)).isDirectory())
		.sort();
	snapshotRaw(root, slug, rawListPath, JSON.stringify(dirs));
	return dirs;
}
[932 more lines in file. Use offset=310 to continue.]
		narratives.push({ phase, summary });
	}
	if (narrativeFailed) markers.push({ marker: "llm.error:narrative" });
	const steering = [];
	for (const s of sessions) {
		const userTurns = s.entries.filter((e) => e.type === "message" && e.message?.role === "user" && typeof e.timestamp === "string").map((e, i) => ({ index: i, ts: e.timestamp, text: userText(e) }));
		if (userTurns.length === 0) continue;
		const request = { kind: "steering", slug, inputs: { sessionId: s.file, userTurns: userTurns.map(({ index, ts, text }) => ({ index, ts, text })) } };
		const result = llmCall(root, slug, `steering-${s.file}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validateSteeringOutput(result.response.output, userTurns.length)) {
			steeringFailed = true;
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			steeringFailed = true;
			continue;
		}
		attribution ??= responseAttribution;
		for (const c of result.response.output.classifications) {
			const turn = userTurns[c.index];
			if (turn) steering.push({ index: c.index, ts: turn.ts, class: c.class });
		}
	}
	if (steeringFailed) markers.push({ marker: "llm.error:steering" });
	const panelPrecision = [];
	for (const dir of reviewDirs) {
		// Match both naming forms (see discoverReviewDirs), with the same
		// disambiguation: a slug starting with `review-` is matched only via the
		// mandatory-infix form so one directory never belongs to two slugs.
		const startsReview = slug.startsWith("review-");
		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => (!startsReview && dir.startsWith(`${phase}-${slug}-`)) || dir.startsWith(`${phase}-review-${slug}-`));
		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels;
		// Group by logical wave, not harvest round: multiple same-day rounds of one
		// review wave (e.g. an infra-replacement dispatch) share a wave and join
		// cleanly. precision.unparsed is emitted only when the candidates span more
		// than one distinct wave (a genuine same-date ambiguity) or none match.
		const waves = [...new Set(candidates.map((p) => p.wave))];
		const wave = waves.length === 1 ? waves[0] : undefined;
		if (candidates.length === 0 || wave === undefined) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
		// deleted live reviews directory after the original collection.
		const dirPath = fromRaw ? join(rawDir(root, slug), "reviews", dir) : join(root, reviewsPath, dir);
		let consolidatedText = "";
		let findingsText = "";
		const modelFiles = [];
		try {
			for (const f of readdirSync(dirPath).sort()) {
				const text = readFileSync(join(dirPath, f), "utf8");
				if (!fromRaw) snapshotRaw(root, slug, join("reviews", dir, f), text);
				if (f === "consolidated.md") consolidatedText = text;
				else {
					modelFiles.push(f);
					findingsText += text;
				}
			}
		} catch {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const request = { kind: "precision", slug, inputs: { reviewDir: dir, models: modelFiles, findingsText, consolidatedText } };
		const result = llmCall(root, slug, `precision-${dir}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validatePrecisionOutput(result.response.output)) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		attribution ??= responseAttribution;
		let precisionModelRejected = false;
		for (const pm of result.response.output.perModel) {
			const model = sanitizeAttributionString(pm.model, redactionValues, allUserMessages);
			if (!model) {
				precisionModelRejected = true;
				continue;
			}
			panelPrecision.push({
				panelPhase,
				round: wave,
				wave,
				model,
				raised: pm.raised,
				incorporated: pm.incorporated,
				dismissed: pm.dismissed,
			});
		}
		if (precisionModelRejected) markers.push({ marker: `precision.unparsed:${dir}` });
	}
	if (!attribution) return { soft: undefined, markers: [...markers, { marker: "soft.absent" }] };
	return { soft: { attribution, narratives, steering, panelPrecision }, markers };
}
// ---- collection orchestration ----------------------------------------------
export function collect({ root, slug, gitCmd = "git", baseRef = "main", ghCmd = "gh", noGithub = false, sessionsDirOverrides = [], home, reviewsPath = "docs/reviews", llmCmd, noLlm = false, fromRaw = false, llmTimeoutMs = LLM_TIMEOUT_MS }) {
	const { events, markers: manifestMarkers } = readManifest(root, slug);
	const { title, track } = extractTitleTrack(events);
	const { panels, markers: panelMarkers } = discoverPanels(root, slug, events);
	const { sessions, markers: sessionMarkers } = discoverSessions(root, events, { sessionsDirOverrides, home, slug, fromRaw });
	const reviewDirs = discoverReviewDirs(root, slug, reviewsPath, { fromRaw });
	const { diff, markers: gitMarkers } = gitDiffStatsSeam(root, slug, gitCmd, baseRef, fromRaw);
	const branch = fromRaw || noGithub ? slug : currentBranch(root) || slug;
	const { markers: ghMarkers } = githubCheckSeam(root, slug, ghCmd, branch, noGithub, fromRaw);
	const windowStart = events.length > 0 ? events[0].ts : new Date(0).toISOString();
	const windowEnd = events.length > 0 ? events[events.length - 1].ts : new Date(0).toISOString();
	const spans = derivePhaseSpans(events, windowEnd);
	// rollups: sessions contribute per assistant-message tokens/cost attributed
	// by phase span; panels contribute their harvested per-model totals
	// attributed via the fixed panelPhase -> lifecycle mapping. Disjoint by
	// construction (nested child sessions are excluded from correlation).
	const byModelMap = new Map();
	const byPhaseMap = new Map();
	const addRollup = (model, phase, tokens, cost) => {
		if (model) {
[232 more lines in file. Use offset=1010 to continue.]
read: skills/sdlc-retro/schema/run.schema.json
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://github.com/threadsafe-systems/pi-sdlc/skills/sdlc-retro/schema/run.schema.json",
  "title": "sdlc-retro-run-record",
  "description": "run.json v1 (spec §7): the distilled post-mortem record produced by collect-run from the FS13 run store. hard values are measured or absent (coverage-marked), never estimated; soft values are model-attributed and structurally separated so the renderer cannot conflate them. This schema is consumed same-version-pinned with the collector that produced the file (both ship in the sdlc-retro bundle); additive optional fields (e.g. panels[].wave, panelPrecision[].wave) therefore do not bump schemaVersion, but a separately-pinned/older copy of this closed schema will reject a newer record's added fields — pin the schema to the producing collector.",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "slug", "coverage", "sizeProxies", "hard"],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "slug": { "type": "string", "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    "title": { "type": "string", "minLength": 1 },
    "track": { "type": "string", "minLength": 1 },
    "coverage": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["marker"],
        "properties": {
          "marker": { "type": "string", "minLength": 1 },
          "detail": { "type": "string" }
        }
      }
    },
    "sizeProxies": {
      "type": "object",
      "additionalProperties": false,
      "required": ["scenarios", "tasks", "sessions", "phases"],
      "properties": {
        "scenarios": { "$ref": "#/definitions/nonNegInt" },
        "tasks": { "$ref": "#/definitions/nonNegInt" },
        "diff": {
          "type": "object",
          "additionalProperties": false,
          "required": ["files", "insertions", "deletions"],
          "properties": {
            "files": { "$ref": "#/definitions/nonNegInt" },
            "insertions": { "$ref": "#/definitions/nonNegInt" },
            "deletions": { "$ref": "#/definitions/nonNegInt" }
          }
        },
        "sessions": { "$ref": "#/definitions/nonNegInt" },
        "phases": { "type": "array", "items": { "$ref": "#/definitions/lifecyclePhase" } }
      }
    },
    "hard": {
      "type": "object",
      "additionalProperties": false,
      "required": ["window", "phases", "sessions", "panels", "models", "rollups", "rework", "totals"],
      "properties": {
        "window": {
          "type": "object",
          "additionalProperties": false,
          "required": ["start", "end"],
          "properties": {
            "start": { "$ref": "#/definitions/ts" },
            "end": { "$ref": "#/definitions/ts" }
          }
        },
        "phases": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["phase", "start", "end"],
            "properties": {
              "phase": { "$ref": "#/definitions/lifecyclePhase" },
              "start": { "$ref": "#/definitions/ts" },
              "end": { "$ref": "#/definitions/ts" },
              "exitExplicit": { "type": "boolean" }
            }
          }
        },
        "sessions": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["file", "start", "end"],
            "properties": {
              "file": { "type": "string", "minLength": 1 },
              "start": { "$ref": "#/definitions/ts" },
              "end": { "$ref": "#/definitions/ts" },
              "models": { "type": "array", "items": { "type": "string", "minLength": 1 } }
            }
          }
        },
        "panels": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["panelPhase", "round", "dir", "models"],
            "properties": {
              "panelPhase": { "$ref": "#/definitions/panelPhase" },
              "round": { "$ref": "#/definitions/posInt" },
              "wave": { "$ref": "#/definitions/posInt" },
              "dir": { "type": "string", "minLength": 1 },
              "models": {
                "type": "array",
                "items": {
                  "type": "object",
                  "additionalProperties": false,
                  "required": ["model"],
                  "properties": {
                    "model": { "type": "string", "minLength": 1 },
                    "tokens": { "$ref": "#/definitions/nonNegInt" },
                    "cost": { "type": "number", "minimum": 0 },
                    "durationMs": { "$ref": "#/definitions/nonNegInt" },
                    "turns": { "$ref": "#/definitions/nonNegInt" }
                  }
                }
              }
            }
          }
        },
        "models": { "type": "array", "items": { "type": "string", "minLength": 1 } },
        "rollups": {
          "type": "object",
          "additionalProperties": false,
          "required": ["byModel", "byPhase"],
          "properties": {
            "byModel": {
              "type": "array",
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["model", "tokens", "cost"],
                "properties": { "model": { "type": "string", "minLength": 1 }, "tokens": { "$ref": "#/definitions/nonNegInt" }, "cost": { "type": "number", "minimum": 0 } }
              }
            },
            "byPhase": {
              "type": "array",
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["phase", "tokens", "cost"],
                "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" }, "tokens": { "$ref": "#/definitions/nonNegInt" }, "cost": { "type": "number", "minimum": 0 } }
              }
            }
          }
        },
        "rework": {
          "type": "object",
          "additionalProperties": false,
          "required": ["artifactRevised", "phaseBackward", "fixWave"],
          "properties": {
            "artifactRevised": { "$ref": "#/definitions/nonNegInt" },
            "phaseBackward": { "$ref": "#/definitions/nonNegInt" },
            "fixWave": { "$ref": "#/definitions/nonNegInt" }
          }
        },
        "totals": {
          "type": "object",
          "additionalProperties": false,
          "required": ["tokens", "cost", "wallMs", "agentMs", "humanWaitMs"],
          "properties": {
            "tokens": { "$ref": "#/definitions/nonNegInt" },
            "cost": { "type": "number", "minimum": 0 },
[69 more lines in file. Use offset=161 to continue.]
31:import { currentBranch, KNOWN_EVENTS, LIFECYCLE_PHASES, PANEL_PHASES, PANEL_TO_LIFECYCLE, runStoreDir, SLUG_RE, validateEnvelope, validatePayload } from "../../sdlc/scripts/telemetry.mjs";
36:const LIFECYCLE_TO_PANEL = Object.fromEntries(Object.entries(PANEL_TO_LIFECYCLE).map(([panelPhase, lifecyclePhase]) => [lifecyclePhase, panelPhase]));
173:const PANEL_DIR_RE = /^(plan_review|spec_review|pr_review|task_validate)-round(\d+)-(\d{4}-\d{2}-\d{2})$/;
210:			const m = PANEL_DIR_RE.exec(name);
244:					if (isPosInt(meta.wave)) wave = meta.wave;
283:	// SLUG_RE (no regex-special chars), so interpolation is safe. To keep the two
677:function isPosInt(v) {
684:function checkKeys(obj, allowed, path, add) {
693:	checkKeys(raw, ["schemaVersion", "slug", "title", "track", "coverage", "sizeProxies", "hard", "soft"], "/", add);
695:	if (typeof raw.slug !== "string" || !SLUG_RE.test(raw.slug)) add("/slug", "must match the slug grammar");
702:			else checkKeys(c, ["marker", "detail"], `/coverage/${i}`, add);
707:		checkKeys(sp, ["scenarios", "tasks", "diff", "sessions", "phases"], "/sizeProxies", add);
713:		else if (sp.diff !== undefined) checkKeys(sp.diff, ["files", "insertions", "deletions"], "/sizeProxies/diff", add);
720:	checkKeys(h, ["window", "phases", "sessions", "panels", "models", "rollups", "rework", "totals"], "/hard", add);
722:	else checkKeys(h.window, ["start", "end"], "/hard/window", add);
727:			else checkKeys(p, ["phase", "start", "end", "exitExplicit"], `/hard/phases/${i}`, add);
733:			else checkKeys(s, ["file", "start", "end", "models"], `/hard/sessions/${i}`, add);
738:			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[], wave?}");
740:				checkKeys(p, ["panelPhase", "round", "wave", "dir", "models"], `/hard/panels/${i}`, add);
752:					else checkKeys(m, ["model", "tokens", "cost", "durationMs", "turns"], `/hard/panels/${i}/models/${j}`, add);
759:		checkKeys(h.rollups, ["byModel", "byPhase"], "/hard/rollups", add);
762:			else checkKeys(r, ["model", "tokens", "cost"], `/hard/rollups/byModel/${i}`, add);
766:			else checkKeys(r, ["phase", "tokens", "cost"], `/hard/rollups/byPhase/${i}`, add);
770:	else checkKeys(h.rework, ["artifactRevised", "phaseBackward", "fixWave"], "/hard/rework", add);
773:	else checkKeys(t, ["tokens", "cost", "wallMs", "agentMs", "humanWaitMs"], "/hard/totals", add);
779:			checkKeys(sf, ["attribution", "narratives", "steering", "panelPrecision"], "/soft", add);
781:			else checkKeys(sf.attribution, ["model", "provider"], "/soft/attribution", add);
786:					else checkKeys(n, ["phase", "summary"], `/soft/narratives/${i}`, add);
793:					else checkKeys(s, ["index", "ts", "class"], `/soft/steering/${i}`, add);
798:					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed))
800:					else checkKeys(p, ["panelPhase", "round", "wave", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
914:		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
read: skills/sdlc-retro/scripts/collect-run.mjs
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
function isNonNegInt(v) {
	return Number.isInteger(v) && v >= 0;
}
function isPosInt(v) {
	return Number.isInteger(v) && v > 0;
}
function isTs(v) {
	return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(v);
}
function checkKeys(obj, allowed, path, add) {
	if (!isPlainObject(obj)) return;
	for (const key of Object.keys(obj)) if (!allowed.includes(key)) add(path, `unknown property ${key}`);
}
export function validateRunJson(raw) {
	const issues = [];
	const add = (p, m) => issues.push(`${p}: ${m}`);
	if (!isPlainObject(raw)) return ["root: must be an object"];
	checkKeys(raw, ["schemaVersion", "slug", "title", "track", "coverage", "sizeProxies", "hard", "soft"], "/", add);
	if (raw.schemaVersion !== 1) add("/schemaVersion", "must be 1");
	if (typeof raw.slug !== "string" || !SLUG_RE.test(raw.slug)) add("/slug", "must match the slug grammar");
	if (raw.title !== undefined && (typeof raw.title !== "string" || raw.title.length === 0)) add("/title", "must be a non-empty string when present");
	if (raw.track !== undefined && (typeof raw.track !== "string" || raw.track.length === 0)) add("/track", "must be a non-empty string when present");
	if (!Array.isArray(raw.coverage)) add("/coverage", "must be an array");
	else
		raw.coverage.forEach((c, i) => {
[541 more lines in file. Use offset=701 to continue.]
21:export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
28:export const LIFECYCLE_PHASES = ["brainstorm", "plan", "spec", "build", "implement", "pr"];
33:export const PANEL_TO_LIFECYCLE = Object.freeze({
read: skills/sdlc/scripts/harvest-panel.mjs
#!/usr/bin/env node
// harvest-panel.mjs — FS13 §5 harvest CLI: preserves pi-subagents lifecycle
// artifacts (status.json, events.jsonl, and optionally transcripts/) from a
// panel dispatch's async run directory into the consumer's run store, before
// they evaporate.
//
// Usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S]
//                          [--with-transcripts] [--format text|json]
//                          [--config DIR | --repo-root DIR]
//
// Contract (spec §5): --from names a directory carrying status.json and
// events.jsonl at its top level (the shape of a pi-subagents asyncDir).
// Harvest copies both into panels/<panelPhase>-round<N>-<date>/;
// --with-transcripts additionally copies a top-level transcripts/
// subdirectory (when present) into transcripts/ at the destination. It also
// writes a meta.json sidecar {round, wave}: --round is the destination
// allocation label, --wave is the logical review-wave (defaults to --round
// when omitted, so a replacement dispatch can share its original wave while
// taking a fresh label). A missing/aborted source directory or file is a report, not a throw: exit 0,
// missed[] populated, and the panel.harvested event records the gap. Exit 2
// only for usage errors or an unwritable destination.
import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { inspectRoot } from "./lib.mjs";
import { emitEvent, PANEL_PHASES, resolveRunSlug, runStoreDir } from "./telemetry.mjs";
function bail(msg) {
	process.stderr.write(`harvest-panel: ${msg}\n`);
	process.exit(2);
}
function parseArgs(argv) {
	const opts = { format: "text", withTranscripts: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = (name) => {
			const v = argv[++i];
			if (v === undefined || v.startsWith("-")) bail(`${name} requires a value`);
			return v;
		};
		if (a === "--phase") opts.phase = val("--phase");
		else if (a === "--round") opts.round = val("--round");
		else if (a === "--wave") opts.wave = val("--wave");
		else if (a === "--from") opts.from = val("--from");
		else if (a === "--slug") opts.slug = val("--slug");
		else if (a === "--with-transcripts") opts.withTranscripts = true;
		else if (a === "--format") {
			const f = val("--format");
			if (f !== "text" && f !== "json") bail("--format must be text or json");
			opts.format = f;
		} else if (a === "--config") opts.config = val("--config");
		else if (a === "--repo-root") opts.repoRoot = val("--repo-root");
		else if (a === "-h" || a === "--help") opts.help = true;
		else bail(`unexpected argument: ${a}`);
	}
	return opts;
}
function usage() {
	return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
}
// Copy one file if present; return "copied" | "missed".
function harvestFile(srcDir, name, destDir) {
	const src = join(srcDir, name);
	if (!existsSync(src) || !statSync(src).isFile()) return "missed";
	cpSync(src, join(destDir, name));
	return "copied";
}
function harvestTranscripts(srcDir, destDir) {
	const src = join(srcDir, "transcripts");
	if (!existsSync(src) || !statSync(src).isDirectory()) return "missed";
	cpSync(src, join(destDir, "transcripts"), { recursive: true });
	return "copied";
}
function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (opts.help) {
		console.log(usage());
		process.exit(0);
	}
	if (!opts.phase) bail(usage());
	if (!PANEL_PHASES.includes(opts.phase)) bail(`unknown panel phase '${opts.phase}'. Known: ${PANEL_PHASES.join(", ")}`);
	if (!opts.round) bail(usage());
	const round = Number(opts.round);
	if (!Number.isInteger(round) || round <= 0) bail("--round must be a positive integer");
	// The logical review-wave defaults to the allocation label when not given, so
	// existing single-dispatch harvests are byte-identical in meaning (wave===round).
	const wave = opts.wave === undefined ? round : Number(opts.wave);
	if (!Number.isInteger(wave) || wave <= 0) bail("--wave must be a positive integer");
	if (!opts.from) bail(usage());
	const rootResult = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot });
	if (!rootResult.ok) bail(`sdlc: ${rootResult.message}`);
	const root = rootResult.root;
	// Run identity is required to know where to harvest TO; unlike record-run-event
	// this is not a soft skip — an unresolvable identity leaves no destination.
	const resolved = resolveRunSlug({ slug: opts.slug, cwd: root });
	if (resolved.skip) bail(`sdlc-telemetry: ${resolved.skip}`);
	const slug = resolved.slug;
	const date = new Date().toISOString().slice(0, 10);
	const destDir = join(runStoreDir(root, slug), "panels", `${opts.phase}-round${round}-${date}`);
	try {
		mkdirSync(destDir, { recursive: true });
	} catch (err) {
		bail(`cannot create destination directory: ${err?.message || err}`);
	}
	const files = [];
	const missed = [];
	for (const name of ["status.json", "events.jsonl"]) {
		const status = harvestFile(opts.from, name, destDir);
		files.push({ name, status });
		if (status === "missed") missed.push(name);
	}
	if (opts.withTranscripts) {
		const status = harvestTranscripts(opts.from, destDir);
		files.push({ name: "transcripts", status });
		if (status === "missed") missed.push("transcripts");
	}
	// meta.json sidecar records the {round, wave} distinction so the collector
	// can group same-wave harvest rounds without parsing prose. Written after the
	// copies; a failure here is not fatal to the harvest itself.
	let metaWritten = false;
	try {
		writeFileSync(join(destDir, "meta.json"), `${JSON.stringify({ round, wave }, null, 2)}\n`);
		metaWritten = true;
	} catch {
		missed.push("meta.json");
	}
	files.push({ name: "meta.json", status: metaWritten ? "copied" : "missed" });
	const relDir = relative(root, destDir);
	const report = { ok: true, phase: opts.phase, round, wave, dir: relDir, files, missed };
	if (opts.format === "json") {
		console.log(JSON.stringify(report, null, 2));
	} else {
		console.log(`harvested ${opts.phase} round ${round} (wave ${wave}) -> ${relDir}`);
		for (const f of files) console.log(`  ${f.name}: ${f.status}`);
		if (missed.length > 0) console.log(`missed: ${missed.join(", ")}`);
	}
	emitEvent({
		event: "panel.harvested",
		slug,
		by: "script:harvest-panel",
		payload: { panelPhase: opts.phase, round, wave, dir: relDir, missed },
		root,
	});
	process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
read: skills/sdlc/scripts/telemetry.mjs
164:export function validatePayload(event, payload) {
192:export function validateEnvelope(obj) {
267:export function emitEvent({ event, slug, by, payload, root, cwd = root }) {
278:		const issues = validatePayload(event, payload);
		["number", "posInt"],
		["sha", "nonEmptyString"],
	],
});
// Optional, additive payload fields per event: type-checked when present, never
// required (so emitting them is backward-compatible and omitting them is valid).
// `wave` distinguishes the logical review-wave from the harvest allocation label
// (`round`) on panel events; a replacement dispatch keeps its original wave.
export const OPTIONAL_EVENT_PAYLOADS = Object.freeze({
	"panel.dispatched": [["wave", "posInt"]],
	"panel.harvested": [["wave", "posInt"]],
	"panel.consolidated": [["wave", "posInt"]],
});
export const KNOWN_EVENTS = Object.keys(EVENT_PAYLOADS);
function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isPosInt(v) {
	return Number.isInteger(v) && v > 0;
}
function isNonNegInt(v) {
	return Number.isInteger(v) && v >= 0;
}
// Validate a single field against its declared type. Returns an error string
// or null.
function fieldIssue(name, type, value) {
	switch (type) {
		case "string":
			return typeof value === "string" ? null : `${name} must be a string`;
		case "nonEmptyString":
			return typeof value === "string" && value.length > 0 ? null : `${name} must be a non-empty string`;
		case "lifecyclePhase":
			return LIFECYCLE_PHASES.includes(value) ? null : `${name} must be one of ${LIFECYCLE_PHASES.join("/")}`;
		case "panelPhase":
[171 more lines in file. Use offset=140 to continue.]
read: skills/sdlc/scripts/telemetry.mjs
// §3.3 FS5 side-effect emission: best-effort emission for the frozen FS5 CLIs
// (resolve-panel, ensure-panel-agent, validate-task; later harvest-panel,
// lt-t3). Resolves run identity and appends one manifest line, but NEVER
// throws and NEVER exits the process — any failure (unresolvable identity,
// invalid payload, oversized line, I/O error) degrades to a single
// `sdlc-telemetry:`-prefixed stderr warning while the caller's primary
// stdout/exit-code contract stays byte-identical (NF3).
export function emitEvent({ event, slug, by, payload, root, cwd = root }) {
	try {
		const resolved = resolveRunSlug({ slug, cwd });
		if (resolved.skip) {
			warnTelemetry(`${resolved.skip} — skipping emission`);
			return;
		}
		if (typeof by !== "string" || !BY_RE.test(by)) {
			warnTelemetry(`--by value '${by}' violates the grammar script:<name>|agent|human:<slug> — skipping emission`);
			return;
		}
		const issues = validatePayload(event, payload);
		if (issues.length > 0) {
			warnTelemetry(`invalid payload for '${event}': ${issues.join("; ")} — skipping emission`);
			return;
		}
		const envelope = {
			schemaVersion: EVENT_SCHEMA_VERSION,
			ts: new Date().toISOString(),
			slug: resolved.slug,
			event,
			by,
			payload,
		};
		const line = `${JSON.stringify(envelope)}\n`;
		if (Buffer.byteLength(line, "utf8") > MAX_EVENT_BYTES) {
			warnTelemetry(`serialized event exceeds the ${MAX_EVENT_BYTES}-byte cap — skipping emission`);
			return;
		}
		const path = runEventsPath(root, resolved.slug);
		mkdirSync(dirname(path), { recursive: true });
		const fd = openSync(path, "a");
		try {
			const bytes = Buffer.from(line, "utf8");
			const written = writeSync(fd, bytes);
			if (written !== bytes.length) throw new Error(`short write: ${written} of ${bytes.length} bytes`);
		} finally {
			closeSync(fd);
		}
	} catch (err) {
		warnTelemetry(`I/O failure writing the run store: ${err?.message || err} — skipping emission`);
	}
}
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
	if (steeringFailed) markers.push({ marker: "llm.error:steering" });
	const panelPrecision = [];
	for (const dir of reviewDirs) {
		// Match both naming forms (see discoverReviewDirs), with the same
		// disambiguation: a slug starting with `review-` is matched only via the
		// mandatory-infix form so one directory never belongs to two slugs.
		const startsReview = slug.startsWith("review-");
		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => (!startsReview && dir.startsWith(`${phase}-${slug}-`)) || dir.startsWith(`${phase}-review-${slug}-`));
		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels;
		// Group by logical wave, not harvest round: multiple same-day rounds of one
		// review wave (e.g. an infra-replacement dispatch) share a wave and join
		// cleanly. precision.unparsed is emitted only when the candidates span more
		// than one distinct wave (a genuine same-date ambiguity) or none match.
		const waves = [...new Set(candidates.map((p) => p.wave))];
		const wave = waves.length === 1 ? waves[0] : undefined;
		if (candidates.length === 0 || wave === undefined) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
		// deleted live reviews directory after the original collection.
		const dirPath = fromRaw ? join(rawDir(root, slug), "reviews", dir) : join(root, reviewsPath, dir);
		let consolidatedText = "";
		let findingsText = "";
		const modelFiles = [];
		try {
			for (const f of readdirSync(dirPath).sort()) {
				const text = readFileSync(join(dirPath, f), "utf8");
				if (!fromRaw) snapshotRaw(root, slug, join("reviews", dir, f), text);
				if (f === "consolidated.md") consolidatedText = text;
				else {
					modelFiles.push(f);
					findingsText += text;
				}
			}
		} catch {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const request = { kind: "precision", slug, inputs: { reviewDir: dir, models: modelFiles, findingsText, consolidatedText } };
		const result = llmCall(root, slug, `precision-${dir}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validatePrecisionOutput(result.response.output)) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		attribution ??= responseAttribution;
		let precisionModelRejected = false;
		for (const pm of result.response.output.perModel) {
			const model = sanitizeAttributionString(pm.model, redactionValues, allUserMessages);
			if (!model) {
				precisionModelRejected = true;
				continue;
			}
			panelPrecision.push({
				panelPhase,
				round: wave,
				wave,
				model,
				raised: pm.raised,
				incorporated: pm.incorporated,
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
have node_modules
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
 ❯ test/telemetry-collect.test.js (0 test)
✔ LT18: soft data carries attribution and matches the fixture LLM's scripted responses (97.196579ms)
✔ T2: a -review- form review directory yields non-empty precision (F1 extraction guard) (94.071502ms)
✔ T3: same-wave multi-round harvests (a replacement dispatch) join to one wave without precision.unparsed (103.306218ms)
✔ T3: harvests that disagree on wave for one review date emit precision.unparsed (50.678695ms)
✔ LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number (62.07491ms)
✔ LT19: --no-llm (noLlm:true) output validates and carries soft.absent (6.706423ms)
✔ LT17: --from-raw reproduces a byte-identical run.json after live sources are destroyed (253.967103ms)
✔ LT28: neither the sentinel secret nor the verbatim prompt sentence appears in run.json (124.244079ms)
✔ NF4 unit: sanitizeSoftString redacts, rejects n-gram containment, and caps at 500 chars (0.617518ms)
✔ LT29: a failing --gh-cmd yields github.error, schema-valid, no fabricated PR data (64.902965ms)
✔ LT29: an --llm-cmd returning invalid JSON yields llm.error:narrative, schema-valid, no fabricated summary (101.713249ms)
✔ LT29: an --llm-cmd that times out yields llm.error:<kind>, schema-valid, exit unaffected (614.297779ms)
✔ llm-protocol schema: request/response fixtures validate (3.28288ms)
 ❯ test/telemetry-collect-soft.test.js (0 test)
⎯⎯⎯⎯⎯⎯ Failed Suites 4 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  test/telemetry-collect-soft.test.js [ test/telemetry-collect-soft.test.js ]
Error: No test suite found in file /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-retro-panel-precision/test/telemetry-collect-soft.test.js
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯
 FAIL  test/telemetry-collect.test.js [ test/telemetry-collect.test.js ]
Error: No test suite found in file /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-retro-panel-precision/test/telemetry-collect.test.js
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯
 FAIL  test/telemetry-harvest.test.js [ test/telemetry-harvest.test.js ]
Error: No test suite found in file /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-retro-panel-precision/test/telemetry-harvest.test.js
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯
 FAIL  test/telemetry-render.test.js [ test/telemetry-render.test.js ]
Error: No test suite found in file /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-retro-panel-precision/test/telemetry-render.test.js
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯
 Test Files  4 failed (4)
      Tests  no tests
   Start at  20:44:24
   Duration  2.04s (transform 366ms, setup 0ms, import 1.13s, tests 0ms, environment 0ms)
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
28:    "test": "node --test test/*.test.js",
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
✔ LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file (2.452232ms)
✔ LT15: review-dir discovery matches both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> naming (1.853425ms)
✔ T2/PR-fix: a review-<x> slug does not collide with slug <x> over one -review- directory (1.986678ms)
✔ LT15: git/GitHub adapters consume only the injected fakes (91.956353ms)
✔ LT16: phase attribution, agent time, capped human-wait, rework, window bounds (3.583034ms)
✔ LT16: a 3-hour gap contributes exactly 30 minutes to human-wait (5.891452ms)
✔ collect-run: no run store exits 1 (nothing collectable) (36.161666ms)
✔ collect-run: writes docs/retros/<slug>/run.json by default and validates (72.423056ms)
✔ resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved (1.563954ms)
✔ LT11: harvest copies status.json + events.jsonl and emits panel.harvested (77.975766ms)
✔ T1: --wave records a logical wave distinct from the round allocation label (65.543201ms)
✔ T1: --wave must be a positive integer (68.255987ms)
✔ LT11: --with-transcripts copies the transcripts/ subdirectory (60.539622ms)
✔ LT12: a missing source directory exits 0 with both files missed (40.071228ms)
✔ LT12: a partially-present source (status without events) reports one missed (38.555323ms)
✔ harvest-panel: unknown phase and non-positive round exit 2 (152.601909ms)
✔ harvest-panel.sh wrapper delegates to .mjs identically (39.198405ms)
✔ LT20: full fixture renders all seven anchors with known-answer data bindings (2.950767ms)
✔ T4: same-wave harvest rounds collapse into one wave section with each round as sub-detail (0.600811ms)
✔ LT20: an empty-shell run.json fails to carry any pinned data binding (0.333385ms)
✔ LT21: render-twice byte-identity and no generation-time values (1.067439ms)
✔ LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical (143.501188ms)
✔ LT22: soft-data figures carry data-soft and visible attribution (0.798911ms)
✔ LT22: a soft-less run.json renders coverage notices, not fabricated numbers (0.529922ms)
✔ LT23: every coverage marker is rendered under #coverage (0.589912ms)
✔ render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2 (216.577306ms)
✔ render-retro CLI: default --out is index.html beside the input; --format json envelope (52.159095ms)
ℹ tests 46
ℹ suites 0
ℹ pass 46
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1848.86779
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
✔ PV11: receipt hash verification detects mutation of any stored file (6.728908ms)
✔ PV11: a FAIL runner-report cannot ride under runnerVerdict PASS (1.0216ms)
✔ parseArgs: recognises JSON anywhere and rejects bad flags (0.790635ms)
✔ PV13: renderText is a faithful projection of the report (131.182755ms)
ℹ tests 405
ℹ suites 0
ℹ pass 405
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7583.009012
Checked 4 files in 63ms. No fixes applied.
read: skills/sdlc-retro/schema/event.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://github.com/threadsafe-systems/pi-sdlc/skills/sdlc-retro/schema/event.schema.json",
  "title": "sdlc-run-manifest-event",
  "description": "FS13 run-manifest event (one JSON object per JSONL line). Mirrors spec §3 field-for-field. Envelope is frozen at v1; payloads are additive-only and unknown payload fields are tolerated by consumers.",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "ts", "slug", "event", "by", "payload"],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "ts": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$" },
    "slug": { "type": "string", "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    "event": { "type": "string", "minLength": 1 },
    "by": { "type": "string", "pattern": "^(script:[a-z][a-z0-9-]*|agent|human:[a-z0-9][a-z0-9-]*)$" },
    "payload": { "type": "object" }
  },
  "definitions": {
    "lifecyclePhase": { "type": "string", "enum": ["brainstorm", "plan", "spec", "build", "implement", "pr"] },
    "panelPhase": { "type": "string", "enum": ["plan_review", "spec_review", "pr_review", "task_validate"] },
    "nonEmptyString": { "type": "string", "minLength": 1 },
    "stringArray": { "type": "array", "items": { "type": "string", "minLength": 1 } },
    "posInt": { "type": "integer", "minimum": 1 },
    "nonNegInt": { "type": "integer", "minimum": 0 },
    "findings": {
      "type": "object",
      "required": ["high", "medium", "low"],
      "properties": {
        "high": { "$ref": "#/definitions/nonNegInt" },
        "medium": { "$ref": "#/definitions/nonNegInt" },
        "low": { "$ref": "#/definitions/nonNegInt" }
      }
    }
  },
  "allOf": [
    { "if": { "properties": { "event": { "const": "run.started" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["title", "track"], "properties": { "title": { "$ref": "#/definitions/nonEmptyString" }, "track": { "$ref": "#/definitions/nonEmptyString" } } } } } },
    { "if": { "properties": { "event": { "const": "phase.entered" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["phase"], "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" } } } } } },
    { "if": { "properties": { "event": { "const": "phase.exited" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["phase"], "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" } } } } } },
    {
      "if": { "properties": { "event": { "const": "phase.backward" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["from", "to", "reason"], "properties": { "from": { "$ref": "#/definitions/nonEmptyString" }, "to": { "$ref": "#/definitions/nonEmptyString" }, "reason": { "$ref": "#/definitions/nonEmptyString" } } } } }
    },
    {
      "if": { "properties": { "event": { "const": "gate.approved" } } },
      "then": {
        "properties": {
          "payload": {
            "type": "object",
            "required": ["phase", "artifact", "rev", "approver"],
            "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" }, "artifact": { "$ref": "#/definitions/nonEmptyString" }, "rev": { "$ref": "#/definitions/posInt" }, "approver": { "$ref": "#/definitions/nonEmptyString" } }
          }
        }
      }
    },
    {
      "if": { "properties": { "event": { "const": "artifact.revised" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["artifact", "rev", "reason"], "properties": { "artifact": { "$ref": "#/definitions/nonEmptyString" }, "rev": { "$ref": "#/definitions/posInt" }, "reason": { "$ref": "#/definitions/nonEmptyString" } } } } }
    },
    {
      "if": { "properties": { "event": { "const": "panel.resolved" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "models", "authorExcluded"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "models": { "$ref": "#/definitions/stringArray" }, "authorExcluded": { "type": "string" } } } } }
    },
    { "if": { "properties": { "event": { "const": "panel.agent_stamped" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "agent"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "agent": { "$ref": "#/definitions/nonEmptyString" } } } } } },
    {
      "if": { "properties": { "event": { "const": "panel.dispatched" } } },
      "then": {
        "properties": { "payload": { "type": "object", "required": ["panelPhase", "round", "models"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "models": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } } } }
      }
    },
    {
      "if": { "properties": { "event": { "const": "panel.harvested" } } },
      "then": {
        "properties": {
          "payload": {
            "type": "object",
            "required": ["panelPhase", "round", "dir", "missed"],
            "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "dir": { "$ref": "#/definitions/nonEmptyString" }, "missed": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } }
          }
        }
      }
    },
    {
      "if": { "properties": { "event": { "const": "panel.consolidated" } } },
      "then": {
        "properties": {
          "payload": {
            "type": "object",
            "required": ["panelPhase", "round", "findings", "incorporated", "dismissed"],
            "properties": {
              "panelPhase": { "$ref": "#/definitions/panelPhase" },
              "round": { "$ref": "#/definitions/posInt" },
              "findings": { "$ref": "#/definitions/findings" },
              "incorporated": { "$ref": "#/definitions/nonNegInt" },
              "dismissed": { "$ref": "#/definitions/nonNegInt" },
              "wave": { "$ref": "#/definitions/posInt" }
            }
          }
        }
      }
    },
    {
      "if": { "properties": { "event": { "const": "task.validated" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["task", "verdict", "scenarioIds"], "properties": { "task": { "$ref": "#/definitions/nonEmptyString" }, "verdict": { "$ref": "#/definitions/nonEmptyString" }, "scenarioIds": { "$ref": "#/definitions/stringArray" } } } } }
    },
    { "if": { "properties": { "event": { "const": "lifecycle.checked" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["verdict"], "properties": { "verdict": { "$ref": "#/definitions/nonEmptyString" } } } } } },
    { "if": { "properties": { "event": { "const": "pr.opened" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["number"], "properties": { "number": { "$ref": "#/definitions/posInt" } } } } } },
    { "if": { "properties": { "event": { "const": "pr.fix_wave" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["number", "sha"], "properties": { "number": { "$ref": "#/definitions/posInt" }, "sha": { "$ref": "#/definitions/nonEmptyString" } } } } } }
  ]
}
read: skills/sdlc/scripts/telemetry.mjs
// are additive-only; consumers ignore unknown fields, §3). Returns issues[].
// For an unknown event, only the generic payload-object constraint is applied;
// the caller decides whether the unknown event is a hard error (emitter) or a
// soft skip (collector).
export function validatePayload(event, payload) {
	const spec = EVENT_PAYLOADS[event];
	const issues = [];
	if (!isPlainObject(payload)) {
		issues.push("payload must be an object");
		return issues;
	}
	if (!spec) return issues;
	for (const [name, type] of spec) {
		if (!(name in payload)) {
			issues.push(`payload.${name} is required`);
			continue;
		}
		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
		if (problem) issues.push(problem);
	}
	// Optional fields: type-checked only when present; absence is never an issue.
	for (const [name, type] of OPTIONAL_EVENT_PAYLOADS[event] ?? []) {
		if (!(name in payload)) continue;
		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
		if (problem) issues.push(problem);
	}
	return issues;
}
// Validate the fixed v1 envelope (schemaVersion/ts/slug/event/by/payload). The
// envelope shape is frozen at v1 (unknown top-level keys are rejected); only
// event types and payload fields are forward-compatible. Returns issues[].
export function validateEnvelope(obj) {
	const issues = [];
	if (!isPlainObject(obj)) return ["record must be a JSON object"];
[116 more lines in file. Use offset=195 to continue.]
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
grep: skills/sdlc-retro
./pr-body.md
---
 .../2026-07-19-sdlc-retro-panel-precision-build.md | 108 +++++++++++
 .../plans/2026-07-19-sdlc-retro-panel-precision.md | 200 +++++++++++++++++++++
 2 files changed, 308 insertions(+)
scripts/collect-run.mjs:4: // seam, soft data (narratives/steering/panelPrecision), the NF4 redaction/
scripts/collect-run.mjs:259: 	panels.sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.round - b.round));
scripts/collect-run.mjs:738: 			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[], wave?}");
scripts/collect-run.mjs:779: 			checkKeys(sf, ["attribution", "narratives", "steering", "panelPrecision"], "/soft", add);
scripts/collect-run.mjs:795: 			if (!Array.isArray(sf.panelPrecision)) add("/soft/panelPrecision", "must be an array of {panelPhase, round, model, raised, incorporated, dismissed}");
scripts/collect-run.mjs:797: 				sf.panelPrecision.forEach((p, i) => {
scripts/collect-run.mjs:798: 					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed))
scripts/collect-run.mjs:799: 						add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
scripts/collect-run.mjs:800: 					else checkKeys(p, ["panelPhase", "round", "wave", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
scripts/collect-run.mjs:907: 	const panelPrecision = [];
scripts/collect-run.mjs:969: 			panelPrecision.push({
scripts/collect-run.mjs:983: 	return { soft: { attribution, narratives, steering, panelPrecision }, markers };
scripts/collect-run.mjs:1097: 		panels: panels.map((p) => ({ panelPhase: p.panelPhase, round: p.round, wave: p.wave, dir: p.dir, models: p.models })),
scripts/render-retro.mjs:88: 	const precision = run.soft?.panelPrecision ?? [];
scripts/render-retro.mjs:95: 		const wave = p.wave ?? p.round;
scripts/render-retro.mjs:105: 				.sort((a, b) => a.round - b.round)
scripts/render-retro.mjs:108: 					const roundLabel = p.round === g.wave ? `round ${p.round}` : `round ${p.round} (replacement)`;
scripts/render-retro.mjs:109: 					return `<div class="panel-round" data-round="${p.round}">
scripts/render-retro.mjs:115: 			const findings = precision.filter((pr) => pr.panelPhase === g.panelPhase && (pr.wave ?? pr.round) === g.wave);
schema/run.schema.json:5:   "description": "run.json v1 (spec §7): the distilled post-mortem record produced by collect-run from the FS13 run store. hard values are measured or absent (coverage-marked), never estimated; soft values are model-attributed and structurally separated so the renderer cannot conflate them. This schema is consumed same-version-pinned with the collector that produced the file (both ship in the sdlc-retro bundle); additive optional fields (e.g. panels[].wave, panelPrecision[].wave) therefore do no... [truncated]
schema/run.schema.json:171:       "required": ["attribution", "narratives", "steering", "panelPrecision"],
schema/run.schema.json:201:         "panelPrecision": {
[Some lines truncated to 500 chars. Use read tool to see full lines]
read: pr-body.md
<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
```sdlc
track: reversible
slug: sdlc-retro-panel-precision
```
Makes the sdlc-retro collector preserve logical review-wave identity across
multi-round and infra-replacement panel harvests, and reconciles review-dir
naming so the collector actually discovers current-form directories.
Root problem (closes #118): the panel-precision join required exactly one
harvested panel directory per `(panelPhase, date)` — so any stream that ran a
fix wave (the common case) dropped all precision as `precision.unparsed`. And
`discoverReviewDirs` only matched `<phase>-<slug>-<date>`, silently ignoring
the `<phase>-review-<slug>-<date>` form the repo has used since 2026-07-14.
Design (all additive, reversible): `harvest-panel.mjs` gains an optional
`--wave` (defaults to `--round`) and writes a `{round,wave}` `meta.json`
sidecar; the collector reads it (absent → `wave=round`; malformed → fallback +
`panels.malformed_meta:<phase>` marker) and groups the precision join by
`(panelPhase, wave, date)`, emitting `precision.unparsed` only when waves
genuinely disagree; `render-retro` groups the deep-dive by wave, collapsing
same-wave rounds. The naming regex **and** `buildSoftData`'s phase extraction
now accept both forms; the spec and PR-review reference keep their original
naming line and gain `-review-` as an accepted alternative. `wave` is optional
on the `run.json` v1 record (validator + schema allow-not-require it), so every
existing record still validates — no v1→v2 bump.
## Governing documents
- Plan: `docs/plans/2026-07-19-sdlc-retro-panel-precision.md`
- Build plan: `docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md`
- Reversible track — no Specification is required.
## Tracker references
- Epic: #120
- Tasks: Closes #121, Closes #122, Closes #123, Closes #124
- Board: pi-sdlc build board (org project 5)
## Assumptions & discretionary calls
Copied from the build-plan doc's "Assumptions" appendix:
- Four-task slicing (T1 harvest+telemetry → T2 naming → T3 collector consume →
  T4 render), with T3 blockedBy {T1,T2} and T4 blockedBy T3; T2 and T3 sequenced
  because both edit `buildSoftData`.
- `panelPrecision[]` carries both `round` and `wave` set to the wave value (the
  parked keep-vs-replace question, resolved "keep both"): `round` retained for
  `run.json` v1 validator compatibility, `wave` added for the render join.
- Validator model: `task_validate` primary `gpt-5.6-terra` deterministically
  echoed the acceptance-report template without running the runner (twice on
  T1); replaced with `anthropic/claude-haiku-4-5` per the dispatch-recovery
  rule for all four task validations.
read: skills/sdlc-retro/scripts/render-retro.mjs
function renderCostBreakdown(run) {
	const { byModel, byPhase } = run.hard.rollups;
	if (byModel.length === 0 && byPhase.length === 0) return `<section id="cost-breakdown"><h2>Cost breakdown</h2><p class="coverage-notice">no rollup data (no correlated sessions or panel harvests)</p></section>`;
	const modelRows = byModel.map((m) => `<div class="rollup-row" data-model="${esc(m.model)}"><span class="rollup-key">${esc(m.model)}</span><span class="rollup-tokens">${m.tokens}</span><span class="rollup-cost">${esc(fmtCost(m.cost))}</span></div>`).join("\n");
	const phaseRows = byPhase.map((p) => `<div class="rollup-row" data-phase="${esc(p.phase)}"><span class="rollup-key">${esc(p.phase)}</span><span class="rollup-tokens">${p.tokens}</span><span class="rollup-cost">${esc(fmtCost(p.cost))}</span></div>`).join("\n");
	return `<section id="cost-breakdown">
<h2>Cost breakdown</h2>
<h3>By model</h3>
${modelRows || '<p class="coverage-notice">no by-model rollups</p>'}
<h3>By phase</h3>
${phaseRows || '<p class="coverage-notice">no by-phase rollups</p>'}
</section>`;
}
function renderPanelDeepdive(run) {
	const panels = run.hard.panels;
	const precision = run.soft?.panelPrecision ?? [];
	if (panels.length === 0) return `<section id="panel-deepdive"><h2>Panel deep-dive</h2><p class="coverage-notice">no harvested panel rounds</p></section>`;
	// Group harvested rounds by logical wave (wave defaults to round for records
	// predating the wave field), collapsing same-wave rounds (e.g. an
	// infra-replacement dispatch) into one section with each round as sub-detail.
	const groups = new Map();
	for (const p of panels) {
		const wave = p.wave ?? p.round;
		const key = `${p.panelPhase}#${wave}`;
		if (!groups.has(key)) groups.set(key, { panelPhase: p.panelPhase, wave, rounds: [] });
		groups.get(key).rounds.push(p);
	}
	const ordered = [...groups.values()].sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.wave - b.wave));
	const blocks = ordered
		.map((g) => {
			const roundBlocks = g.rounds
				.slice()
				.sort((a, b) => a.round - b.round)
				.map((p) => {
					const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
					const roundLabel = p.round === g.wave ? `round ${p.round}` : `round ${p.round} (replacement)`;
					return `<div class="panel-round" data-round="${p.round}">
<h4>${esc(roundLabel)}</h4>
${modelRows || '<p class="coverage-notice">no per-model metrics for this round</p>'}
</div>`;
				})
				.join("\n");
			const findings = precision.filter((pr) => pr.panelPhase === g.panelPhase && (pr.wave ?? pr.round) === g.wave);
			const findingRows =
				findings.length > 0
					? findings
							.map(
								(f) =>
									`<div class="panel-finding-row" data-soft="true" data-model="${esc(f.model)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span>${esc(f.model)}</span><span>raised ${f.raised}</span><span>incorporated ${f.incorporated}</span><span>dismissed ${f.dismissed}</span></div>`,
							)
							.join("\n")
					: '<p class="coverage-notice">no precision figures for this wave</p>';
			return `<div class="panel-wave" data-panel-phase="${esc(g.panelPhase)}" data-wave="${g.wave}">
<h3>${esc(g.panelPhase)} wave ${g.wave}</h3>
${roundBlocks}
${findingRows}
</div>`;
		})
		.join("\n");
	return `<section id="panel-deepdive">
<h2>Panel deep-dive</h2>
${blocks}
</section>`;
}
function renderSteeringMap(run) {
	const steering = run.soft?.steering ?? [];
	if (steering.length === 0) return `<section id="steering-map"><h2>Steering map</h2><p class="coverage-notice">no steering data (soft data absent or no user turns correlated)</p></section>`;
	const marks = steering.map((s) => `<div class="steering-mark" data-soft="true" data-class="${esc(s.class)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span class="steering-ts">${esc(s.ts)}</span><span class="steering-class">${esc(s.class)}</span></div>`).join("\n");
	return `<section id="steering-map">
<h2>Steering map</h2>
[160 more lines in file. Use offset=144 to continue.]
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
skills/sdlc/scripts/harvest-panel.sh
---
#!/usr/bin/env bash
# harvest-panel.sh — thin entry point for the FS13 panel-telemetry harvest CLI.
# All logic lives in harvest-panel.mjs.
#
# Usage: harvest-panel.sh --phase PANEL_PHASE --round N --from DIR [--slug S]
#          [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]
set -euo pipefail
exec node "$(dirname "$0")/harvest-panel.mjs" "$@"
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
# Plan: Retro collector — logical review-wave identity + review-dir naming reconciliation
- **Slug:** `sdlc-retro-panel-precision`
- **Date:** 2026-07-19
- **Track:** reversible (ratified at the design gate; F4 dismissal human-ratified — see below)
- **Status:** rev2, awaiting design gate
- **Closes:** #118
- **Advisory review:** deepseek-v4-pro plan review (2026-07-19, beyond the
  reversible track's human-only gate, at the owner's request). Six findings;
  F1/F2/F3/F5 incorporated into this rev2, F4 dismissed with the owner's
  ratification (additive-narrowing adopted — track stays reversible, `run.json`
  stays v1 with `wave` an additive optional field).
## Objectives
1. **Preserve logical review-wave identity through the retro pipeline.** A run
   whose panel went through fix waves (multiple same-day harvest rounds,
   including infra-replacement dispatches) must retro to **one logical wave per
   review round**, with replacement dispatches attributed to their original
   wave — not counted as extra rounds and not silently dropped.
2. **Make the panel-precision join robust to multi-round streams.** Today the
   join requires exactly one harvested panel directory per `(panelPhase, date)`
   and emits `precision.unparsed` (dropping all precision) otherwise — which
   trips on *every* stream that needed a fix wave, the common case, not an edge
   case.
3. **Reconcile review-directory naming.** Widen the collector's discovery to
   accept both the historical `<phase>-<slug>-<date>` and the now-dominant
   `<phase>-review-<slug>-<date>` forms — in **both** `discoverReviewDirs`
   (directory listing) **and** `buildSoftData`'s phase extraction (the
   `startsWith` companion at `collect-run.mjs:885`, which fails on the
   `-review-` infix independently of the regex) — and add the `-review-` form
   to the spec and PR-review reference as an **explicitly-accepted alternative**
   (additive; the original naming line is preserved, not rewritten).
4. **Close the two recorded lows from #118**: the `<n>` placeholder that names
   two now-distinct numbers in the telemetry command templates, and the
   review-dir discovery pattern not matching a `-review-`-prefixed directory.
## Rationale
- The wave↔label mapping shipped by the `sdlc-question-discipline` stream lives
  only as prose in `consolidated.md`; the collector never consumes it, so a
  retro renders more apparent rounds than logical waves and — worse — the
  precision join's uniqueness requirement drops precision entirely for any
  multi-round day.
- Grounding (this session) established the join-uniqueness failure is the
  common case: `phase-pr-review.md` requires a fresh panel after each fix wave,
  and our own just-shipped stream produced four same-day harvest rounds — the
  exact failure shape.
- The naming mismatch has existed since before the collector was merged: the
  approved Specification (`docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md`)
  and a locking test both fix `<phase>-<slug>-<date>`, while repo practice has
  used `<phase>-review-<slug>-<date>` since 2026-07-14. Both forms coexist in
  `docs/reviews/` today.
## Agreed design (carried from Brainstorm)
**Wave vs round, carried coherently through three stages** (all additive and
backward-compatible — the `panel.*` telemetry payloads already accept extra
optional keys without a schema-version bump, confirmed against
`event.schema.json` and `validatePayload`):
- `harvest-panel.mjs` gains an **optional `--wave <n>`** (a positive integer;
  defaults to the `--round` value when omitted, so every historical harvest and
  every single-round dispatch is unaffected). It writes a small **`meta.json`
  sidecar** — `{ "round": <n>, "wave": <n> }` — alongside `status.json` and
  `events.jsonl` in the harvest directory, and includes `wave` in the
  `panel.harvested` event payload (optional field).
- `collect-run.mjs` `discoverPanels()` reads the sidecar (**absent → `wave =
  round`**, so pre-sidecar harvests degrade cleanly) and carries **both `round`
  and `wave`** on each panel entry, threaded through the `hard` assembly's
  `panels.map` (`collect-run.mjs:1061`) and allowed in `validateRunJson`'s
  panels key guard (**allowed-but-not-required**, so existing `wave`-less v1
  records still validate). The precision join groups by `(panelPhase, wave,
  date)` per the algorithm below. `panelPrecision[]` entries carry `wave`.
  **Precision join algorithm** (resolving F3): for a review directory of a
  given `(panelPhase, date)`, collect its `datedPanels`; take the distinct
  `wave` values among them. If they **all share one wave**, attribute the
  directory's precision to `(panelPhase, wave)`. Emit `precision.unparsed`
  **only when the waves disagree** (a genuine multi-wave same-date ambiguity,
  a narrow edge case) — not, as today, whenever more than one round shares a
  date. A single-panel `(panelPhase, date)` keeps today's behaviour (its lone
  wave defaults to its round).
- `render-retro.mjs` groups dashboard sections by **wave**, collapsing
  same-wave harvest rounds into one section (e.g. "Wave 1" listing its
  constituent rounds as sub-detail) and joining precision on `(panelPhase,
  wave)` — requiring `wave` to be present on the `hard.panels[]` entries per
  the collector change above.
**Naming reconciliation:**
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
**Naming reconciliation:**
- `discoverReviewDirs`' regex widens to accept both `<phase>-<slug>-<date>` and
  `<phase>-review-<slug>-<date>`, **and** `buildSoftData`'s phase-extraction
  `startsWith` (`collect-run.mjs:885`) is widened to the same two forms —
  without this companion fix the regex widening is inert and every `-review-`
  directory silently yields `precision.unparsed` (F1).
- The spec's review-artifact naming line and `phase-pr-review.md` §5's
  `<phase>-<feat>-<date>` guidance **keep their original wording** and gain the
  `-review-` form as an explicitly-accepted alternative (additive, per the F4
  ratification); the `-review-` form is recommended going forward. Old-style
  directories remain valid and are not retrofitted.
**Doc low:** the telemetry command templates in `system-reference.md` §12 use
distinct placeholders — `<wave>` for the `panel.dispatched`/`panel.consolidated`
round field and the harvest `--wave`, and `<label>` for the harvest `--round`
allocation label — so the two numbers are never conflated in an example.
## Scope
**In:**
- `skills/sdlc/scripts/harvest-panel.mjs` — `--wave` flag, `meta.json` sidecar,
  `wave` in the `panel.harvested` payload.
- `skills/sdlc/scripts/telemetry.mjs` — `wave` as an **optional** payload field
  for `panel.dispatched`/`panel.harvested`/`panel.consolidated` (never added to
  a required list).
- `skills/sdlc-retro/scripts/collect-run.mjs` — `discoverPanels` sidecar read +
  `wave` on panel entries; `discoverReviewDirs` widened regex; **`buildSoftData`
  phase-extraction `startsWith` widened to the `-review-` form (F1)**; precision
  join regrouped by wave per the algorithm above; `wave` threaded through the
  `hard` `panels.map` (line ~1061) and onto `panelPrecision[]`;
  `validateRunJson` updated to allow (not require) `wave` on both `panels[]`
  and `panelPrecision[]` (F2).
- `skills/sdlc-retro/scripts/render-retro.mjs` — wave-grouped rendering.
- `skills/sdlc-retro/schema/event.schema.json` — optional `wave` on the three
  panel events (additive).
- `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` — review-dir naming line
  gains the `-review-` form as an accepted alternative (original wording
  preserved, additive per F4); panel-artifact/`meta.json`, the optional `wave`
  field (additive to the **v1** record — no version bump), and the
  `panels.malformed_meta:<phase>` marker added to the closed v1 marker set (F5).
- `skills/sdlc/references/phase-pr-review.md` — §5 naming guidance; harvest
  paragraph gains `--wave`.
- `skills/sdlc/references/system-reference.md` — §12 placeholder split and
  `--wave` in the command templates.
- Tests: `test/telemetry-collect.test.js`, `test/telemetry-collect-soft.test.js`,
  `test/telemetry-render.test.js`, and any harvest-panel/telemetry emitter test.
**Out:**
- Retrofitting historical review directories or run stores to the new naming or
  the sidecar (regex + `wave=round` fallback handle them read-only).
- Any change to the `panel.dispatched`/`panel.consolidated` **required** payload
  fields, a telemetry `EVENT_SCHEMA_VERSION` bump, or a `run.json` **v1→v2**
  bump (the `wave` field is additive-optional to v1, human-ratified 2026-07-19).
- Wiring anything new into CI as a required check.
- The `render-retro` visual design beyond the wave-grouping change (no restyle).
## Definition of done
1. `harvest-panel.mjs --wave` works, defaults to `--round`, and writes
   `meta.json`; omitting it leaves behaviour byte-identical to today for a
   single dispatch.
2. A collector run over a fixture with an infra-replacement dispatch (two
   harvest rounds, one wave) and a multi-wave fix-wave sequence retros to one
   logical wave per review round; **no `precision.unparsed`** for a well-formed
   multi-round day; precision attributed to the correct wave. A well-formed
   multi-round same-wave day joins cleanly; only genuinely disagreeing waves on
   one date emit `precision.unparsed`.
3. `discoverReviewDirs` **and** `buildSoftData` phase-extraction match both
   naming forms; the LT15 discovery test is extended to assert both (and still
   excludes `task-validate-*`), and a fixture with a `-review-` directory
   produces non-empty precision (guarding F1).
4. `render-retro` renders one section per wave, collapsing same-wave rounds;
   `hard.panels[]` carries `wave` and the render join uses it (guarding F2).
5. Spec naming line + `phase-pr-review.md` §5 mandate `-review-`; the two
   telemetry-template placeholders are distinct in `system-reference.md`.
6. `npm test` and `npm run lint` (biome) clean; `validateRunJson` accepts the
   `wave`-bearing shape and the existing render consumer still parses.
## Context for the next agent (incl. parked questions)
- **Parked to Implement:** whether `panelPrecision[].round` is *retained
  alongside* `wave` or *replaced by* it — decide against the render join and the
  `validateRunJson`/`checkKeys` exact-key guard once the render change is
  written; keep both if `render-retro` still needs round-level sub-detail.
- **Parked to Implement:** exact `meta.json` schema-validation posture (a
  malformed sidecar should degrade to `wave=round` and emit the pre-registered
  `panels.malformed_meta:<phase>` coverage marker — F5 — not throw; mirror
  `discoverPanels`' existing tolerant status.json handling). The marker name is
  fixed here; only its emission mechanics are Implement's.
- The LT15 soft-test and the `docs/specs` naming line are the two "locked"
  surfaces this change deliberately re-opens; both are cited in the spec so the
  amendment is traceable.
## Assumptions ratified by approving this plan
1. **Track is reversible** (owner-ratified 2026-07-19 over deepseek's F4): every
   change is additive — optional `wave` (allowed-but-not-required on the v1
   `run.json` record, **no v2 bump**), a `meta.json` sidecar, a widened but
   backward-compatible regex, and an **additive** spec naming note that
   preserves the original frozen line. No persisted record shape is broken and
   every existing v1 record still validates. Under `overrides.reversible`,
   `review.design: human` — this human gate, no plan panel, no separate Spec
   (the spec-doc note is an Implement edit, not a re-gated Spec phase).
2. `wave` stays optional in all telemetry payloads; no dispatch call is forced
   to supply it.
3. Slug `sdlc-retro-panel-precision`; branch `feat/sdlc-retro-panel-precision`.
4. Four-task build (see build plan): harvest+telemetry fields → naming
   regex+spec → collector wave consumption → render-retro grouping.
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
# Consolidated PR review — sdlc-retro-panel-precision (2026-07-19)
- **Orchestrating model:** anthropic/claude-opus-4-8 (author; excluded from the panel)
- **Round 1 valid verdicts:** deepseek/deepseek-v4-pro:high, amazon-bedrock/global.anthropic.claude-sonnet-5
- **Floor:** `review.panelSize` pr_review = 3; **shortfall this round** — see the
  floor note below. `review.onShortfall: fail`.
- **Escalations to the human owner:** the floor shortfall (below). No proposed
  dismissals of high/medium findings — the one HIGH and one MEDIUM were both
  incorporated.
## Round 1 findings and adjudication
| ID | Severity | Raised by | Gist | Disposition |
|---|---|---|---|---|
| H1 | high | bedrock sonnet-5 (verified live by orchestrator) | The `(?:review-)?` infix let one directory be claimed by two slugs — slug `X` via the infix form and slug `review-X` via the classic form (`discoverReviewDirs` + `buildSoftData`) | **Incorporated** (fix wave 1): a slug starting with `review-` is matched only via the mandatory-infix form, so each directory belongs to exactly one slug; new collision regression test added |
| M1 | medium | bedrock sonnet-5 | Closed (`additionalProperties:false`) `run.json` schema/validator means the "no v1→v2 bump" claim holds backward (old data → new validator) but not forward (new data → a separately-pinned older schema) | **Incorporated** (fix wave 1): `run.schema.json` description documents same-version-pinned consumption; additive `wave` fields keep v1 per the owner's ratified no-v2-bump ruling |
| L1 | low | deepseek + bedrock | Cross-date fallback widened from `matchingPanels.length===1` to all `matchingPanels`; `precision.unparsed` slightly less strict for the no-date-match case | **Recorded** — benign (dates normally match); the wave-agreement guard still gates attribution |
| L2 | low | deepseek + bedrock | `panelPrecision[].round` now carries the wave value (retained only for v1 validator compat); name no longer matches value | **Recorded** — documented keep-both call; `round` required by v1, no v2 bump per owner ruling |
| L3 | low | bedrock | `wave` on `panel.dispatched`/`panel.consolidated` payloads is unused by any consumer in this diff (only `panel.harvested`'s is, via the sidecar) | **Recorded** — additive and documented in §12's wave vocabulary; kept for event-map coherence |
| L4 | low | bedrock | precision loop's `panel = candidates[0]` was dead weight (only `.panelPhase`, already invariant, was read) | **Incorporated** (fix wave 1): use the resolved `panelPhase`, drop `candidates[0]` |
## Floor shortfall (escalated)
Round 1 reached **2 distinct valid reviewers** (deepseek-v4-pro, bedrock
sonnet-5), one short of the pr_review floor of 3, because `claude-fable-5` and
`gpt-5.6-sol` were account-rate-limited (429) on both the initial dispatch and a
retry, and `gemini-3.1-pro` is prepay-depleted. `onShortfall: fail` routes this
to the human owner. Resolution pending — see the session for the decision.
## Round 2 — confirmation (post fix wave 1)
_Recorded after the confirmation dispatch._
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
57:function rawDir(root, slug) {
61:function snapshotRaw(root, slug, relPath, content) {
62:	const dest = join(rawDir(root, slug), relPath);
68:	return readFileSync(join(rawDir(root, slug), relPath), "utf8");
72:	return existsSync(join(rawDir(root, slug), relPath));
279:export function discoverReviewDirs(root, slug, reviewsPath = "docs/reviews", { fromRaw = false } = {}) {
290:	if (fromRaw) {
301:		snapshotRaw(root, slug, rawListPath, "[]");
307:	snapshotRaw(root, slug, rawListPath, JSON.stringify(dirs));
384:	const dir = join(rawDir(root, slug), "sessions");
409:export function discoverSessions(root, events, { sessionsDirOverrides = [], home, slug, fromRaw = false } = {}) {
410:	if (fromRaw) return loadSessionsFromRaw(root, slug);
431:			if (slug) snapshotRaw(root, slug, join("sessions", parsed.file), parsed.raw);
517:function gitDiffStatsSeam(root, slug, gitCmd, baseRef, fromRaw) {
519:	if (fromRaw) {
530:	if (result.diff) snapshotRaw(root, slug, relPath, JSON.stringify(result.diff));
538:function githubCheckSeam(root, slug, ghCmd, branch, noGithub, fromRaw) {
541:	if (fromRaw) {
548:		snapshotRaw(root, slug, relPath, out);
830:// fixture-predictable, spec §6.2). fromRaw replays raw/llm/<name>.json pairs
832:function llmCall(root, slug, name, request, llmCmd, fromRaw, timeoutMs, redactionValues) {
834:	if (fromRaw) {
847:		snapshotRaw(root, slug, relPath, JSON.stringify({ request, response }, null, 2));
852:function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sessions, panels, reviewDirs, windowStart, windowEnd, reviewsPath, llmTimeoutMs = LLM_TIMEOUT_MS }) {
853:	if (noLlm || (!llmCmd && !fromRaw)) return { soft: undefined, markers: [{ marker: "soft.absent" }] };
858:	const redactionValues = fromRaw ? [] : buildRedactionValues(process.env);
868:		const result = llmCall(root, slug, `narrative-${phase}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
889:		const result = llmCall(root, slug, `steering-${s.file}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
932:		const dirPath = fromRaw ? join(rawDir(root, slug), "reviews", dir) : join(root, reviewsPath, dir);
939:				if (!fromRaw) snapshotRaw(root, slug, join("reviews", dir, f), text);
951:		const result = llmCall(root, slug, `precision-${dir}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
988:export function collect({ root, slug, gitCmd = "git", baseRef = "main", ghCmd = "gh", noGithub = false, sessionsDirOverrides = [], home, reviewsPath = "docs/reviews", llmCmd, noLlm = false, fromRaw = false, llmTimeoutMs = LLM_TIMEOUT_MS }) {
992:	const { sessions, markers: sessionMarkers } = discoverSessions(root, events, { sessionsDirOverrides, home, slug, fromRaw });
993:	const reviewDirs = discoverReviewDirs(root, slug, reviewsPath, { fromRaw });
994:	const { diff, markers: gitMarkers } = gitDiffStatsSeam(root, slug, gitCmd, baseRef, fromRaw);
995:	const branch = fromRaw || noGithub ? slug : currentBranch(root) || slug;
996:	const { markers: ghMarkers } = githubCheckSeam(root, slug, ghCmd, branch, noGithub, fromRaw);
1107:	const { soft, markers: softMarkers } = buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sessions, panels, reviewDirs, windowStart, windowEnd, reviewsPath, llmTimeoutMs });
1157:		else if (a === "--from-raw") opts.fromRaw = true;
1212:		fromRaw: opts.fromRaw ?? false,
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
test/telemetry-render.test.js:27:function fullFixture() {
test/telemetry-render.test.js:90:	const html = renderDashboard(fullFixture());
test/telemetry-render.test.js:120:	assert.ok(/PR fix waves[\s\S]*?<span>1<\/span>/.test(html));
test/telemetry-render.test.js:123:test("T4: same-wave harvest rounds collapse into one wave section with each round as sub-detail", () => {
test/telemetry-render.test.js:124:	const fx = fullFixture();
test/telemetry-render.test.js:125:	// two harvested rounds of one logical wave (round 2 a replacement dispatch)
test/telemetry-render.test.js:127:		{ panelPhase: "pr_review", round: 1, wave: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round1-2026-07-18", models: [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }] },
test/telemetry-render.test.js:128:		{ panelPhase: "pr_review", round: 2, wave: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round2-2026-07-18", models: [{ model: "deepseek/deepseek-v4-pro", tokens: 80, cost: 0.4, durationMs: 900, turns: 2 }] },
test/telemetry-render.test.js:130:	fx.soft.panelPrecision = [{ panelPhase: "pr_review", round: 1, wave: 1, model: "openai/gpt-5", raised: 2, incorporated: 1, dismissed: 1 }];
test/telemetry-render.test.js:132:	// exactly one wave section for pr_review wave 1
test/telemetry-render.test.js:133:	const waveSections = html.match(/data-wave="1"/g) ?? [];
test/telemetry-render.test.js:134:	assert.equal(waveSections.length, 1, "same-wave rounds collapse into one wave section");
test/telemetry-render.test.js:136:	assert.ok(html.includes("wave 1"), "section titled by wave");
test/telemetry-render.test.js:139:	assert.ok(html.includes("(replacement)"), "a round whose label differs from the wave is marked a replacement");
test/telemetry-render.test.js:140:	// precision joined once on the wave
test/telemetry-render.test.js:158:	const run = fullFixture();
test/telemetry-render.test.js:175:		writeFileSync(runPath, JSON.stringify(fullFixture()));
test/telemetry-render.test.js:193:	const html = renderDashboard(fullFixture());
test/telemetry-render.test.js:203:	const run = fullFixture();
test/telemetry-render.test.js:218:	const run = fullFixture();
test/telemetry-render.test.js:261:		writeFileSync(runPath, JSON.stringify(fullFixture()));
test/telemetry-collect.test.js:16:import { attributePhase, collect, derivePhaseSpans, discoverPanels, discoverReviewDirs, discoverSessions, gitDiffStats, githubCheck, readManifest, resolveSessionDirs, validateRunJson } from "../skills/sdlc-retro/scripts/collect-run.mjs";
test/telemetry-collect.test.js:64:	writeEvent(root, slug, "pr.fix_wave", { number: 1, sha: "abc1234" }, isoAt(BASE, 11000));
test/telemetry-collect.test.js:131:		const issues = validateRunJson(runJson);
test/telemetry-collect.test.js:185:		const issues = validateRunJson(runJson);
test/telemetry-collect.test.js:251:		assert.equal(panels[0].wave, 1, "wave defaults to round when no meta.json sidecar");
test/telemetry-collect.test.js:257:test("T3: discoverPanels reads the meta.json wave; malformed sidecar falls back to round with a marker", () => {
test/telemetry-collect.test.js:264:		// round 2, logical wave 1 (a replacement dispatch) with a valid sidecar
test/telemetry-collect.test.js:269:		writeFileSync(join(d1, "meta.json"), JSON.stringify({ round: 2, wave: 1 }));
test/telemetry-collect.test.js:270:		// a malformed sidecar on a plan_review round 1: wave falls back to round, marker emitted
read: test/telemetry-render.test.js
function fullFixture() {
	return {
		schemaVersion: 1,
		slug: "lt20-run",
		title: "Lifecycle telemetry",
		track: "irreversible",
		coverage: [{ marker: "github.skipped" }, { marker: "sessions.dir_unresolved", detail: "no HOME session directory" }],
		sizeProxies: { scenarios: 2, tasks: 1, sessions: 1, phases: ["plan", "implement"] },
		hard: {
			window: { start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:30:00.000Z" },
			phases: [
				{ phase: "plan", start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:10:00.000Z", exitExplicit: true },
				{ phase: "implement", start: "2026-07-18T09:10:00.000Z", end: "2026-07-18T09:30:00.000Z", exitExplicit: false },
			],
			sessions: [{ file: "sess.jsonl", start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:29:00.000Z", models: ["anthropic/claude-x"] }],
			panels: [{ panelPhase: "pr_review", round: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round1-2026-07-18", models: [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }] }],
			models: ["anthropic/claude-x", "openai/gpt-5"],
			rollups: {
				byModel: [
					{ model: "anthropic/claude-x", tokens: 70, cost: 0.15 },
					{ model: "openai/gpt-5", tokens: 100, cost: 0.5 },
				],
				byPhase: [
					{ phase: "plan", tokens: 50, cost: 0.1 },
					{ phase: "implement", tokens: 120, cost: 0.55 },
				],
			},
			rework: { artifactRevised: 1, phaseBackward: 1, fixWave: 1 },
			totals: { tokens: 170, cost: 0.65, wallMs: 1800000, agentMs: 5000, humanWaitMs: 60000 },
		},
		soft: {
			attribution: { model: "fixture/llm-1", provider: "fixture" },
			narratives: [{ phase: "implement", summary: "a narrative summary" }],
			steering: [{ index: 0, ts: "2026-07-18T09:05:00.000Z", class: "gate-approval" }],
			panelPrecision: [{ panelPhase: "pr_review", round: 1, model: "openai/gpt-5", raised: 2, incorporated: 1, dismissed: 1 }],
		},
	};
}
function emptyFixture() {
	return {
		schemaVersion: 1,
		slug: "lt20-empty",
		coverage: [],
		sizeProxies: { scenarios: 0, tasks: 0, sessions: 0, phases: [] },
		hard: {
			window: { start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:00:00.000Z" },
			phases: [],
			sessions: [],
			panels: [],
			models: [],
			rollups: { byModel: [], byPhase: [] },
			rework: { artifactRevised: 0, phaseBackward: 0, fixWave: 0 },
			totals: { tokens: 0, cost: 0, wallMs: 0, agentMs: 0, humanWaitMs: 0 },
		},
	};
}
// ---------------------------------------------------------------------------
// LT20 — all seven anchors, single file, no external references, every §8
// data binding present with known-answer values; an empty shell fails.
// ---------------------------------------------------------------------------
[183 more lines in file. Use offset=89 to continue.]
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
test/validator-contract.test.js:14:import Ajv from "ajv";
test/validator-contract.test.js:141:	const ajv = new Ajv({ allErrors: true, strict: false });
test/validator-contract.test.js:142:	const validate = ajv.compile(schema);
test/telemetry-emitter.test.js:14:import Ajv from "ajv";
test/telemetry-emitter.test.js:15:import { KNOWN_EVENTS, MAX_EVENT_BYTES, validateEnvelope, validatePayload } from "../skills/sdlc/scripts/telemetry.mjs";
test/telemetry-emitter.test.js:24:		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "event.schema.json"), "utf8"));
test/telemetry-emitter.test.js:30:const schemaValidate = new Ajv().compile(readEventSchema());
test/telemetry-emitter.test.js:81:	const envIssues = validateEnvelope(obj);
test/telemetry-emitter.test.js:162:	assert.deepEqual(validateEnvelope(future), []);
test/telemetry-emitter.test.js:167:	assert.ok(validateEnvelope(malformed).includes("payload must be an object"));
test/telemetry-collect.test.js:15:import Ajv from "ajv";
test/telemetry-collect.test.js:23:		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
test/telemetry-collect.test.js:28:const schemaValidate = new Ajv().compile(readRunSchema());
test/hooks.test.js:2:// No live/paid model calls (NFR2). Pure lib.mjs + JSON Schema (ajv) checks.
test/hooks.test.js:12:import Ajv from "ajv";
test/hooks.test.js:20:const ajv = new Ajv({ allErrors: true, strict: false });
test/hooks.test.js:21:const validateSchema = ajv.compile(schema);
test/telemetry-dogfood.test.js:14:import Ajv from "ajv";
test/telemetry-dogfood.test.js:25:		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
test/telemetry-dogfood.test.js:30:const schemaValidate = new Ajv().compile(readRunSchema());
test/telemetry-collect-soft.test.js:14:import Ajv from "ajv";
test/telemetry-collect-soft.test.js:22:		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
test/telemetry-collect-soft.test.js:27:const schemaValidate = new Ajv().compile(readRunSchema());
test/telemetry-collect-soft.test.js:36:const llmProtocolValidate = new Ajv().compile(readLlmProtocolSchema());
test/extraction.test.js:13:import Ajv from "ajv";
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
 M pr-body.md
---staged above (empty=clean)---
16	0	skills/sdlc/scripts/telemetry.mjs
102	0	test/telemetry-collect-soft.test.js
60	2	test/telemetry-collect.test.js
38	0	test/telemetry-harvest.test.js
21	0	test/telemetry-render.test.js
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
5:# Usage: harvest-panel.sh --phase PANEL_PHASE --round N --from DIR [--slug S]
---normref---
758:      "id": "sdlc.skill.harvest-panel-pointer",
760:      "assertion": "scripts/harvest-panel.sh --phase <panelPhase> --round <label> --wave <wave> --from <asyncDir>`\n  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).",
I have completed an adversarial review. Here are my findings.
## Verification of prior-round findings (fix wave 1)
### H1 — `review-` slug double-claim (collect-run.mjs:283-286 + 911-912)
- verdict: RESOLVED
- evidence: `discoverReviewDirs` computes `infix = slug.startsWith("review-") ? "review-" : "(?:review-)?"` (line 285), so a `review-<x>` slug is matched only via the mandatory-infix form. `buildSoftData` mirrors this exactly: `startsReview = slug.startsWith("review-")` gates the classic `startsWith(`${phase}-${slug}-`)` branch off (line 911-912). Reproduced via the committed collision test `T2/PR-fix: a review-<x> slug does not collide…` (telemetry-collect.test.js) — `discoverReviewDirs(root,"foo")` claims `plan-review-foo-…` while `discoverReviewDirs(root,"review-foo")` returns `[]` until its own `plan-review-review-foo-…` exists. I confirmed `SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` (telemetry.mjs:21) has no regex-special chars, so the slug interpolation into the regex is safe.
### M1 — closed-schema forward-compat (run.schema.json:5, 98, 210)
- verdict: RESOLVED
- evidence: `run.schema.json` description (line 5) now documents same-version-pinned consumption and that additive `wave` fields do not bump `schemaVersion`. `wave` is present in `properties` but NOT in `required` at both `hard.panels[]` (line 98) and `soft.panelPrecision[]` (line 210), with `additionalProperties:false` retained — so a wave-less v1 record validates and a wave-bearing one validates against the same-version schema. `validateRunJson` mirrors allow-not-require: `(p.wave !== undefined && !isPosInt(p.wave))` (collect-run.mjs:738, 798) and `checkKeys` whitelists `wave` (740, 800). Verified backward by rendering `fullFixture()` (panels/precision are wave-less) — LT20 passes.
### L4 — dead `candidates[0]` (collect-run.mjs:969-970)
- verdict: RESOLVED
- evidence: the precision `push` now uses the resolved `panelPhase` variable (line 969), `round: wave`, `wave` (line 970-972). No `panel`/`candidates[0]` reference remains in the loop (confirmed by reading collect-run.mjs:907-978).
## New findings
### harvest-panel.sh usage header omits `--wave`
- severity: low
- confidence: high
- file: skills/sdlc/scripts/harvest-panel.sh
- line: 5
- problem: The shell wrapper's own usage comment still reads `--phase … --round N --from DIR` and never mentions `[--wave W]`, while harvest-panel.mjs, system-reference.md §12, and normative-references.json all now document `--wave`. The wrapper itself forwards args correctly via `exec node … "$@"`, so this is cosmetic doc drift only.
- repro_or_impact: A reader relying on the `.sh` header (or `--help`-style discovery) would not learn the flag exists; no functional impact.
### Normative assertion renders `--wave` as mandatory
- severity: low
- confidence: high
- file: skills/sdlc/assets/normative-references.json
- line: 760
- problem: The `sdlc.skill.harvest-panel-pointer` assertion shows `--round <label> --wave <wave>` (no brackets), implying `--wave` is required, but the CLI defaults `--wave` to `--round` and treats it as optional (harvest-panel.mjs:90-91). system-reference.md §12 correctly shows `--wave` as optional; this normative line is the outlier.
- repro_or_impact: Prose-only; rendered into CONFIG.md. If any future compliance check treats the assertion literally, a valid `--wave`-omitting invocation could be flagged spuriously.
- smell: none
### Two-form naming match is duplicated in two shapes
- severity: low
- confidence: high
- file: skills/sdlc-retro/scripts/collect-run.mjs
- line: 285 and 911-912
- problem: The "accept both `<phase>-<slug>-<date>` and `<phase>-review-<slug>-<date>`, with `review-`-slug disambiguation" rule is implemented twice in different forms — a regex with `(?:review-)?` infix in `discoverReviewDirs`, and a `startsWith` + `startsReview` boolean in `buildSoftData`. They agree on every discovered directory today (I traced all forms), but a future naming change must update both in lockstep or they silently diverge; the `startsWith` variant is also strictly looser than the regex and only stays correct because `discoverReviewDirs` pre-filters the list.
- repro_or_impact: Maintainability/divergence risk, not a current behavioural defect.
- smell: Duplicated Code
No high or medium defects found. All 405 tests pass (`node --test test/*.test.js`), biome check clean on the four touched scripts, the three prior findings are verified landed and sound, and the additive `wave` design (optional in every schema/validator path) preserves v1 backward compatibility as claimed.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Adversarial review of git diff main...HEAD (7f8c3f6) produced concrete findings with file:line and severity: H1/M1/L4 verified RESOLVED with code+repro evidence, plus three new LOW findings (harvest-panel.sh:5, normative-references.json:760, collect-run.mjs:285/911-912). No high/medium defects."
    }
  ],
  "changedFiles": [
    "skills/sdlc/scripts/harvest-panel.mjs",
    "skills/sdlc/scripts/telemetry.mjs",
    "skills/sdlc-retro/scripts/collect-run.mjs",
    "skills/sdlc-retro/scripts/render-retro.mjs",
    "skills/sdlc-retro/schema/event.schema.json",
    "skills/sdlc-retro/schema/run.schema.json",
    "skills/sdlc/assets/normative-references.json",
    "skills/sdlc/references/phase-pr-review.md",
    "skills/sdlc/references/system-reference.md",
    "docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md",
    "docs/plans/2026-07-19-sdlc-retro-panel-precision.md",
    "docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md",
    "test/telemetry-collect.test.js",
    "test/telemetry-collect-soft.test.js",
    "test/telemetry-harvest.test.js",
    "test/telemetry-render.test.js"
  ],
  "testsAddedOrUpdated": [
    "test/telemetry-collect.test.js",
    "test/telemetry-collect-soft.test.js",
    "test/telemetry-harvest.test.js",
    "test/telemetry-render.test.js"
  ],
  "commandsRun": [
    {
      "command": "node --test test/*.test.js",
      "result": "passed",
      "summary": "405 tests pass, 0 fail (includes T1/T2/T3/T4 wave + collision regression tests)"
    },
    {
      "command": "npx biome check skills/sdlc-retro/scripts/collect-run.mjs skills/sdlc-retro/scripts/render-retro.mjs skills/sdlc/scripts/harvest-panel.mjs skills/sdlc/scripts/telemetry.mjs",
      "result": "passed",
      "summary": "Checked 4 files, no fixes applied"
    },
    {
      "command": "git diff main...HEAD --stat",
      "result": "passed",
      "summary": "Diff scoped to sdlc-retro/sdlc scripts, schemas, references, specs, plans, and 4 test files"
    }
  ],
  "validationOutput": [
    "H1 RESOLVED: discoverReviewDirs mandatory-infix for review- slugs (collect-run.mjs:285) + buildSoftData mirror (911-912); collision regression test passes.",
    "M1 RESOLVED: run.schema.json:5 documents same-version-pinned consumption; wave additive-optional at :98 and :210; validateRunJson allow-not-require (collect-run.mjs:738,798).",
    "L4 RESOLVED: panelPrecision.push uses resolved panelPhase (collect-run.mjs:969); candidates[0] removed.",
    "Backward-compat exercised: fullFixture() panels/precision are wave-less yet render and validate (p.wave ?? p.round).",
    "No new high/medium defects; three new LOW doc/duplication findings recorded."
  ],
  "residualRisks": [
    "L1 (recorded, benign): cross-date fallback widened from matchingPanels.length===1 to all matchingPanels; precision.unparsed slightly less strict when a review dir's date matches no harvested panel — wave-agreement guard still gates attribution.",
    "L2 (recorded): panelPrecision[].round now carries the wave value (name≠value) for v1 validator compatibility; documented keep-both call.",
    "L3 (recorded): wave on panel.dispatched/panel.consolidated payloads is unused by any consumer in this diff (only panel.harvested's sidecar is consumed); additive and documented.",
    "M1 forward direction: a separately-pinned OLDER copy of run.schema.json (additionalProperties:false, pre-wave) will reject a wave-bearing record — mitigated only by documentation; consumers must pin schema to the producing collector.",
    "Panel floor shortfall: round 1 reached 2 distinct reviewers (deepseek-v4-pro, bedrock sonnet-5) vs pr_review floor 3 (fable/gpt-5.6-sol 429, gemini prepay-depleted); routed to human under onShortfall:fail — not a code defect."
  ],
  "noStagedFiles": true,
  "diffSummary": "Reworks the sdlc-retro collector to carry logical review-wave identity: harvest-panel.mjs gains optional --wave + meta.json sidecar; telemetry.mjs adds wave as an optional payload field on the three panel events; collect-run.mjs reads the sidecar (absent→wave=round, malformed→fallback+panels.malformed_meta marker), widens discoverReviewDirs + buildSoftData to accept both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> forms with review--slug disambiguation, regroups the precision join by (panelPhase,wave,date), and threads wave through validateRunJson + hard.panels.map; render-retro.mjs groups the panel deep-dive by wave; run.schema.json/event.schema.json allow (not require) wave. All additive, no schemaVersion bump.",
  "reviewFindings": [
    "H1 (collect-run.mjs:285,911-912): RESOLVED — review- slug double-claim eliminated via mandatory-infix; collision regression test green.",
    "M1 (run.schema.json:5,98,210): RESOLVED — same-version-pinned consumption documented; wave additive-optional, no v2 bump.",
    "L4 (collect-run.mjs:969-970): RESOLVED — precision push uses resolved panelPhase, candidates[0] removed.",
    "low: skills/sdlc/scripts/harvest-panel.sh:5 — usage header omits [--wave W] (wrapper forwards it via \"$@\"; cosmetic drift).",
    "low: skills/sdlc/assets/normative-references.json:760 — assertion renders --wave without brackets, implying mandatory while CLI defaults it to --round.",
    "low (smell:Duplicated Code): collect-run.mjs:285 vs 911-912 — two-form naming match reimplemented as regex and as startsWith; agree today, must stay in sync."
  ],
  "manualNotes": "Working tree has an unstaged modification to pr-body.md (git status: ' M pr-body.md') that is NOT part of commit 7f8c3f6 under review (it does not appear in git diff main...HEAD); no staged/index changes, so noStagedFiles=true is accurate. Review is of commit 7f8c3f6 only; I did not edit any files."
}
```
