Task: PR review of branch feat/sdlc-retro-panel-precision (HEAD) in repo root /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-retro-panel-precision. Actually read the diff and produce a real review with concrete findings; do NOT emit the acceptance-report template unfilled. TRACK: reversible — a Specification does not exist and must NOT be demanded. Artifact under review: the full diff `git diff main...HEAD`. This closes #118 and reworks the sdlc-retro collector: wave-vs-round identity via harvest-panel.mjs --wave + meta.json sidecar; collect-run.mjs discoverPanels sidecar read + precision join regrouped by (panelPhase,wave,date); render-retro.mjs wave grouping; discoverReviewDirs + buildSoftData accept both <phase>-<slug>-<date> and <phase>-review-<slug>-<date>; optional wave added to telemetry payloads, event.schema.json, run.schema.json, and validateRunJson (allow-not-require). GOVERNING_DOCS: docs/plans/2026-07-19-sdlc-retro-panel-precision.md and docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md. Named review input: pr-body.md incl. its 'Assumptions & discretionary calls' section — scrutinise the keep-both-round-and-wave call and the reversible/additive claim (no run.json v1->v2 bump). Grounding rule: cite file:line for any framework/repo claim; verify backward-compat claims against the actual validator/schema code (validateRunJson checkKeys, run.schema.json, telemetry.mjs OPTIONAL_EVENT_PAYLOADS). Required output: findings only (severity high/medium/low, file:line, one-line remediation) or PASS if none, then the acceptance report with REAL values. Do not edit any files.
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
390fbe2 docs(sdlc): T4 validation receipt (runner PASS, validator PASS)
ff78031 feat(retro): group the panel deep-dive by logical wave (T4, #124)
b3adae5 docs(sdlc): T3 validation receipt (runner PASS, validator PASS)
d13105d feat(retro): consume wave sidecar and regroup precision join by wave (T3, #123)
0e15e41 docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
 .../2026-07-19-sdlc-retro-panel-precision-build.md | 108 ++++
 .../plans/2026-07-19-sdlc-retro-panel-precision.md | 200 ++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  58 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 178 +++++++
 .../validator.md                                   | 571 +++++++++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  53 ++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 157 ++++++
 .../validator.md                                   | 513 ++++++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  58 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 179 +++++++
 .../validator.md                                   | 569 ++++++++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  48 ++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 140 +++++
 .../validator.md                                   | 529 +++++++++++++++++++
 docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md  |   5 +-
 docs/validation/sdlc-retro-panel-precision/t1.json |  58 +++
 docs/validation/sdlc-retro-panel-precision/t2.json |  53 ++
 docs/validation/sdlc-retro-panel-precision/t3.json |  58 +++
 docs/validation/sdlc-retro-panel-precision/t4.json |  48 ++
 skills/sdlc-retro/schema/event.schema.json         |  19 +-
 skills/sdlc-retro/schema/run.schema.json           |   2 +
 skills/sdlc-retro/scripts/collect-run.mjs          |  55 +-
 skills/sdlc-retro/scripts/render-retro.mjs         |  38 +-
 skills/sdlc/assets/normative-references.json       |   2 +-
 skills/sdlc/references/phase-pr-review.md          |   4 +-
 skills/sdlc/references/system-reference.md         |  24 +-
 skills/sdlc/scripts/harvest-panel.mjs              |  36 +-
 skills/sdlc/scripts/telemetry.mjs                  |  16 +
 test/telemetry-collect-soft.test.js                | 102 ++++
 test/telemetry-collect.test.js                     |  42 +-
 test/telemetry-harvest.test.js                     |  38 ++
 test/telemetry-render.test.js                      |  21 +
 40 files changed, 4176 insertions(+), 46 deletions(-)
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
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
index dd18d90..2359964 100644
--- a/skills/sdlc-retro/schema/run.schema.json
+++ b/skills/sdlc-retro/schema/run.schema.json
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
index f46d815..e28b6a2 100755
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
@@ -261,7 +278,10 @@ export function discoverPanels(root, slug, events) {
 // touches the live reviews path.
 export function discoverReviewDirs(root, slug, reviewsPath = "docs/reviews", { fromRaw = false } = {}) {
 	const rawListPath = join("reviews", "_dirs.json");
-	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-${slug}-\\d{4}-\\d{2}-\\d{2}$`);
+	// Accept both the historical `<phase>-<slug>-<date>` and the now-dominant
+	// `<phase>-review-<slug>-<date>` naming (the `-review-` infix). Slugs match
+	// SLUG_RE (no regex-special chars), so interpolation is safe.
+	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-(?:review-)?${slug}-\\d{4}-\\d{2}-\\d{2}$`);
 	if (fromRaw) {
 		if (!rawExists(root, slug, rawListPath)) return [];
 		try {
@@ -710,9 +730,9 @@ export function validateRunJson(raw) {
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
@@ -770,8 +790,9 @@ export function validateRunJson(raw) {
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
@@ -880,17 +901,26 @@ function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sess
 	const panelPrecision = [];
 	for (const dir of reviewDirs) {
-		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`));
+		// Match both naming forms (see discoverReviewDirs): the `-review-` infix
+		// must be accepted here too, or every `-review-` directory silently yields
+		// no panelPhase and an unparsed precision marker.
+		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`) || dir.startsWith(`${phase}-review-${slug}-`));
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
+		const panel = candidates[0];
 		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
 		// deleted live reviews directory after the original collection.
@@ -933,7 +963,8 @@ function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sess
 			}
 			panelPrecision.push({
 				panelPhase: panel.panelPhase,
-				round: panel.round,
+				round: wave,
+				wave,
 				model,
 				raised: pm.raised,
 				incorporated: pm.incorporated,
@@ -1058,7 +1089,7 @@ export function collect({ root, slug, gitCmd = "git", baseRef = "main", ghCmd =
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
	// Live collection captures already-redacted LLM responses into raw/. Replay
	// must not consult a different process environment and redact benign words
	// differently, or byte-identical regeneration would be impossible.
	const redactionValues = fromRaw ? [] : buildRedactionValues(process.env);
	const allUserMessages = sessions.flatMap((s) => s.entries.map(userText).filter(Boolean));
	const markers = [];
	let attribution;
	let narrativeFailed = false;
	let steeringFailed = false;
	const narratives = [];
	for (const phase of [...new Set(spans.map((s) => s.phase))]) {
		const request = { kind: "narrative", slug, inputs: { phase, events: eventsFor(events, phase, spans), turns: sessions.flatMap((s) => turnsFor(s, spans, phase, windowStart, windowEnd)) } };
		const result = llmCall(root, slug, `narrative-${phase}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validateNarrativeOutput(result.response.output)) {
			narrativeFailed = true;
			continue;
		}
		const summary = sanitizeSoftString(result.response.output.summary, { redactionValues, userMessages: allUserMessages });
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (summary === null || !responseAttribution) {
			narrativeFailed = true;
			continue;
		}
		attribution ??= responseAttribution;
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
		// Match both naming forms (see discoverReviewDirs): the `-review-` infix
		// must be accepted here too, or every `-review-` directory silently yields
		// no panelPhase and an unparsed precision marker.
		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`) || dir.startsWith(`${phase}-review-${slug}-`));
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
		const panel = candidates[0];
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
				panelPhase: panel.panelPhase,
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
./pr-body.md
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
skills/sdlc-retro/scripts/render-retro.mjs:88:	const precision = run.soft?.panelPrecision ?? [];
skills/sdlc-retro/scripts/collect-run.mjs:4:// seam, soft data (narratives/steering/panelPrecision), the NF4 redaction/
skills/sdlc-retro/scripts/collect-run.mjs:774:			checkKeys(sf, ["attribution", "narratives", "steering", "panelPrecision"], "/soft", add);
skills/sdlc-retro/scripts/collect-run.mjs:790:			if (!Array.isArray(sf.panelPrecision)) add("/soft/panelPrecision", "must be an array of {panelPhase, round, model, raised, incorporated, dismissed}");
skills/sdlc-retro/scripts/collect-run.mjs:792:				sf.panelPrecision.forEach((p, i) => {
skills/sdlc-retro/scripts/collect-run.mjs:794:						add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
skills/sdlc-retro/scripts/collect-run.mjs:795:					else checkKeys(p, ["panelPhase", "round", "wave", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
skills/sdlc-retro/scripts/collect-run.mjs:902:	const panelPrecision = [];
skills/sdlc-retro/scripts/collect-run.mjs:964:			panelPrecision.push({
skills/sdlc-retro/scripts/collect-run.mjs:978:	return { soft: { attribution, narratives, steering, panelPrecision }, markers };
docs/reviews/task-validate-sdlc-retro-panel-precision-t4-2026-07-19/validator.md:90:        "import { renderDashboard } from './skills/sdlc-retro/scripts/render-retro.mjs'; const fx = { schemaVersion:1, slug:'s', coverage:[], sizeProxies:{scenarios:0,tasks:0,diff:{files:0,insertions:0,deletions:0},sessions:0,phases:[]}, hard:{ window:{start:'2026-07-19T00:00:00.000Z',end:'2026-07-19T00:00:01.000Z'}, phases:[], sessions:[], panels:[{panelPhase:'pr_review',round:1,wave:1,dir:'d1',models:[]},{panelPhase:'pr_review',round:2,wave:1,dir:'d2',models:[]}], models:[], rollups:{byModel:[],byPhase:[]}, rework:{artifactRevised:0,phaseBackward:0,fixWave:0}, totals:{tokens:0,cost:0,wallMs:0,agentMs:0,humanWaitMs:0} }, soft:{ attribution:{model:'m',provider:'p'}, narratives:[], steering:[], panelPrecision:[{panelPhase:'pr_review',round:1,wave:1,model:'x',raised:1,incorporated:1,dismissed:0}] } }; const html = renderDashboard(fx); const waves = (html.match(/data-wave=\\\"1\\\"/g)||[]).length; if (waves !== 1) { console.error('expected exactly one wave section, got '+waves); process.exit(1); } if (!(html.includes('data-round=\\\"1\\\"') && html.includes('data-round=\\\"2\\\"'))) { console.error('both constituent rounds must appear as sub-detail'); process.exit(1); } if (!html.includes('raised 1')) { console.error('precision must join on the wave'); process.exit(1); }"
docs/reviews/task-validate-sdlc-retro-panel-precision-t4-2026-07-19/validator.md:292:        "import { renderDashboard } from './skills/sdlc-retro/scripts/render-retro.mjs'; const fx = { schemaVersion:1, slug:'s', coverage:[], sizeProxies:{scenarios:0,tasks:0,diff:{files:0,insertions:0,deletions:0},sessions:0,phases:[]}, hard:{ window:{start:'2026-07-19T00:00:00.000Z',end:'2026-07-19T00:00:01.000Z'}, phases:[], sessions:[], panels:[{panelPhase:'pr_review',round:1,wave:1,dir:'d1',models:[]},{panelPhase:'pr_review',round:2,wave:1,dir:'d2',models:[]}], models:[], rollups:{byModel:[],byPhase:[]}, rework:{artifactRevised:0,phaseBackward:0,fixWave:0}, totals:{tokens:0,cost:0,wallMs:0,agentMs:0,humanWaitMs:0} }, soft:{ attribution:{model:'m',provider:'p'}, narratives:[], steering:[], panelPrecision:[{panelPhase:'pr_review',round:1,wave:1,model:'x',raised:1,incorporated:1,dismissed:0}] } }; const html = renderDashboard(fx); const waves = (html.match(/data-wave=\\\"1\\\"/g)||[]).length; if (waves !== 1) { console.error('expected exactly one wave section, got '+waves); process.exit(1); } if (!(html.includes('data-round=\\\"1\\\"') && html.includes('data-round=\\\"2\\\"'))) { console.error('both constituent rounds must appear as sub-detail'); process.exit(1); } if (!html.includes('raised 1')) { console.error('precision must join on the wave'); process.exit(1); }"
docs/reviews/task-validate-sdlc-retro-panel-precision-t4-2026-07-19/validator.md:434:        "import { renderDashboard } from './skills/sdlc-retro/scripts/render-retro.mjs'; const fx = { schemaVersion:1, slug:'s', coverage:[], sizeProxies:{scenarios:0,tasks:0,diff:{files:0,insertions:0,deletions:0},sessions:0,phases:[]}, hard:{ window:{start:'2026-07-19T00:00:00.000Z',end:'2026-07-19T00:00:01.000Z'}, phases:[], sessions:[], panels:[{panelPhase:'pr_review',round:1,wave:1,dir:'d1',models:[]},{panelPhase:'pr_review',round:2,wave:1,dir:'d2',models:[]}], models:[], rollups:{byModel:[],byPhase:[]}, rework:{artifactRevised:0,phaseBackward:0,fixWave:0}, totals:{tokens:0,cost:0,wallMs:0,agentMs:0,humanWaitMs:0} }, soft:{ attribution:{model:'m',provider:'p'}, narratives:[], steering:[], panelPrecision:[{panelPhase:'pr_review',round:1,wave:1,model:'x',raised:1,incorporated:1,dismissed:0}] } }; const html = renderDashboard(fx); const waves = (html.match(/data-wave=\\\"1\\\"/g)||[]).length; if (waves !== 1) { console.error('expected exactly one wave section, got '+waves); process.exit(1); } if (!(html.includes('data-round=\\\"1\\\"') && html.includes('data-round=\\\"2\\\"'))) { console.error('both constituent rounds must appear as sub-detail'); process.exit(1); } if (!html.includes('raised 1')) { console.error('precision must join on the wave'); process.exit(1); }"
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:74:  date)` per the algorithm below. `panelPrecision[]` entries carry `wave`.
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:121:  `hard` `panels.map` (line ~1061) and onto `panelPrecision[]`;
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:123:  and `panelPrecision[]` (F2).
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:173:- **Parked to Implement:** whether `panelPrecision[].round` is *retained
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:67:`hard` assembly `panels.map` (line ~1061) and onto `panelPrecision[]` (F2);
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:69:`panelPrecision[]` so existing v1 records still validate. Regroup the precision
docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:377:              panelPrecision[] }             # optional as a whole
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
679:function checkKeys(obj, allowed, path, add) {
680-	if (!isPlainObject(obj)) return;
681-	for (const key of Object.keys(obj)) if (!allowed.includes(key)) add(path, `unknown property ${key}`);
682-}
683-
684-export function validateRunJson(raw) {
685-	const issues = [];
686-	const add = (p, m) => issues.push(`${p}: ${m}`);
687-	if (!isPlainObject(raw)) return ["root: must be an object"];
688-	checkKeys(raw, ["schemaVersion", "slug", "title", "track", "coverage", "sizeProxies", "hard", "soft"], "/", add);
689-	if (raw.schemaVersion !== 1) add("/schemaVersion", "must be 1");
690-	if (typeof raw.slug !== "string" || !SLUG_RE.test(raw.slug)) add("/slug", "must match the slug grammar");
691-	if (raw.title !== undefined && (typeof raw.title !== "string" || raw.title.length === 0)) add("/title", "must be a non-empty string when present");
692-	if (raw.track !== undefined && (typeof raw.track !== "string" || raw.track.length === 0)) add("/track", "must be a non-empty string when present");
693-	if (!Array.isArray(raw.coverage)) add("/coverage", "must be an array");
694-	else
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
skills/sdlc-retro/schema/event.schema.json:7:  "additionalProperties": false,
skills/sdlc-retro/schema/llm-protocol.schema.json:10:      "additionalProperties": false,
skills/sdlc-retro/schema/llm-protocol.schema.json:25:                "additionalProperties": false,
skills/sdlc-retro/schema/llm-protocol.schema.json:42:                "additionalProperties": false,
skills/sdlc-retro/schema/llm-protocol.schema.json:58:                "additionalProperties": false,
skills/sdlc-retro/schema/llm-protocol.schema.json:74:      "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:7:  "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:18:        "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:28:      "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:35:          "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:49:      "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:54:          "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:65:            "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:79:            "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:93:            "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:104:                  "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:121:          "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:128:                "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:137:                "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:146:          "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:156:          "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:170:      "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:175:          "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:183:            "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:192:            "additionalProperties": false,
skills/sdlc-retro/schema/run.schema.json:205:            "additionalProperties": false,
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
// telemetry.mjs — shared FS13 run-manifest event contract: the v1 event
// vocabulary, envelope/payload validators (hand-rolled, no runtime deps per
// NF2), run-identity resolution (§3.2), and run-store path helpers (§2).
//
// Consumed by the emitter (record-run-event.mjs), the FS5 side-effect emitters
// (resolve-panel/ensure-panel-agent/validate-task, lt-t2), and the collector
// (collect-run, lt-t4). The committed schema
// skills/sdlc-retro/schema/event.schema.json mirrors this file field-for-field.
import { execFileSync } from "node:child_process";
import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import { dirname, join } from "node:path";
const TELEMETRY_PREFIX = "sdlc-telemetry:";
export const EVENT_SCHEMA_VERSION = 1;
// A serialized line INCLUDING its LF terminator must not exceed 32 KiB (§3).
export const MAX_EVENT_BYTES = 32 * 1024;
// Slug grammar: identical to validate-task.mjs TASK_RE (§2).
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// `by` grammar (§3): script:<name> | agent | human:<slug>.
export const BY_RE = /^(script:[a-z][a-z0-9-]*|agent|human:[a-z0-9][a-z0-9-]*)$/;
// ISO-8601 UTC instant (trailing Z), optional fractional seconds.
export const TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
// The six lifecycle phases (payload field `phase`).
export const LIFECYCLE_PHASES = ["brainstorm", "plan", "spec", "build", "implement", "pr"];
// The four panel phases (payload field `panelPhase`) — the existing FS5
// vocabulary, deliberately distinct from lifecycle `phase`.
export const PANEL_PHASES = ["plan_review", "spec_review", "pr_review", "task_validate"];
// Fixed collector mapping from panel phase to lifecycle phase (§3).
export const PANEL_TO_LIFECYCLE = Object.freeze({
	plan_review: "plan",
	spec_review: "spec",
	pr_review: "pr",
	task_validate: "implement",
});
// Payload field descriptors per event (§3 table). Each entry is [name, type].
// Field types mirror the normative "Payload field types" paragraph.
export const EVENT_PAYLOADS = Object.freeze({
	"run.started": [
		["title", "nonEmptyString"],
		["track", "nonEmptyString"],
	],
	"phase.entered": [["phase", "lifecyclePhase"]],
	"phase.exited": [["phase", "lifecyclePhase"]],
	"phase.backward": [
		["from", "nonEmptyString"],
		["to", "nonEmptyString"],
		["reason", "nonEmptyString"],
	],
	"gate.approved": [
		["phase", "lifecyclePhase"],
		["artifact", "nonEmptyString"],
		["rev", "posInt"],
		["approver", "nonEmptyString"],
	],
	"artifact.revised": [
		["artifact", "nonEmptyString"],
		["rev", "posInt"],
		["reason", "nonEmptyString"],
	],
	"panel.resolved": [
		["panelPhase", "panelPhase"],
		["models", "stringArray"],
		["authorExcluded", "string"],
	],
	"panel.agent_stamped": [
		["panelPhase", "panelPhase"],
		["agent", "nonEmptyString"],
	],
	"panel.dispatched": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["models", "stringArray"],
	],
	"panel.harvested": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["dir", "nonEmptyString"],
		["missed", "stringArray"],
	],
	"panel.consolidated": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["findings", "findings"],
		["incorporated", "nonNegInt"],
		["dismissed", "nonNegInt"],
	],
	"task.validated": [
		["task", "nonEmptyString"],
		["verdict", "nonEmptyString"],
		["scenarioIds", "stringArray"],
	],
	"lifecycle.checked": [["verdict", "nonEmptyString"]],
	"pr.opened": [["number", "posInt"]],
	"pr.fix_wave": [
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
			return PANEL_PHASES.includes(value) ? null : `${name} must be one of ${PANEL_PHASES.join("/")}`;
		case "posInt":
			return isPosInt(value) ? null : `${name} must be a positive integer`;
		case "nonNegInt":
			return isNonNegInt(value) ? null : `${name} must be a non-negative integer`;
		case "stringArray":
			if (!Array.isArray(value)) return `${name} must be an array of non-empty strings`;
			return value.every((e) => typeof e === "string" && e.length > 0) ? null : `${name} entries must be non-empty strings`;
		case "findings":
			if (!isPlainObject(value)) return `${name} must be an object {high,medium,low}`;
			for (const k of ["high", "medium", "low"]) {
				if (!isNonNegInt(value[k])) return `${name}.${k} must be a non-negative integer`;
			}
			return null;
		default:
			return `${name} has an unknown declared type '${type}'`;
	}
}
// Validate a payload for a known event. Unknown fields are tolerated (payloads
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
	const allowed = new Set(["schemaVersion", "ts", "slug", "event", "by", "payload"]);
	for (const k of Object.keys(obj)) if (!allowed.has(k)) issues.push(`unknown top-level field '${k}'`);
	if (obj.schemaVersion !== EVENT_SCHEMA_VERSION) issues.push(`schemaVersion must be ${EVENT_SCHEMA_VERSION}`);
	if (typeof obj.ts !== "string" || !TS_RE.test(obj.ts)) issues.push("ts must be an ISO-8601 UTC instant");
	if (typeof obj.slug !== "string" || !SLUG_RE.test(obj.slug)) issues.push("slug must match the slug grammar");
	if (typeof obj.event !== "string" || obj.event.length === 0) issues.push("event must be a non-empty string");
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
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
            "wallMs": { "$ref": "#/definitions/nonNegInt" },
            "agentMs": { "$ref": "#/definitions/nonNegInt" },
            "humanWaitMs": { "$ref": "#/definitions/nonNegInt" }
          }
        }
      }
    },
    "soft": {
      "type": "object",
      "additionalProperties": false,
      "required": ["attribution", "narratives", "steering", "panelPrecision"],
      "properties": {
        "attribution": {
          "type": "object",
          "additionalProperties": false,
          "required": ["model", "provider"],
          "properties": { "model": { "type": "string", "minLength": 1 }, "provider": { "type": "string", "minLength": 1 } }
        },
        "narratives": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["phase", "summary"],
            "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" }, "summary": { "type": "string", "maxLength": 500 } }
          }
        },
        "steering": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["index", "ts", "class"],
            "properties": {
              "index": { "$ref": "#/definitions/nonNegInt" },
              "ts": { "$ref": "#/definitions/ts" },
              "class": { "type": "string", "enum": ["gate-approval", "correction", "scope-change", "unblock", "other"] }
            }
          }
        },
        "panelPrecision": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["panelPhase", "round", "model", "raised", "incorporated", "dismissed"],
            "properties": {
              "panelPhase": { "$ref": "#/definitions/panelPhase" },
              "round": { "$ref": "#/definitions/posInt" },
              "wave": { "$ref": "#/definitions/posInt" },
              "model": { "type": "string", "minLength": 1 },
              "raised": { "$ref": "#/definitions/nonNegInt" },
              "incorporated": { "$ref": "#/definitions/nonNegInt" },
              "dismissed": { "$ref": "#/definitions/nonNegInt" }
            }
          }
        }
      }
    }
  },
  "definitions": {
    "lifecyclePhase": { "type": "string", "enum": ["brainstorm", "plan", "spec", "build", "implement", "pr"] },
    "panelPhase": { "type": "string", "enum": ["plan_review", "spec_review", "pr_review", "task_validate"] },
    "ts": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$" },
    "posInt": { "type": "integer", "minimum": 1 },
    "nonNegInt": { "type": "integer", "minimum": 0 }
  }
}
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
./skills/sdlc-retro/schema/run.schema.json
./skills/sdlc-retro/schema/event.schema.json
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:1:# Plan: Retro collector — logical review-wave identity + review-dir naming reconciliation
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:16:1. **Preserve logical review-wave identity through the retro pipeline.** A run
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:26:3. **Reconcile review-directory naming.** Widen the collector's discovery to
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:28:   `<phase>-review-<slug>-<date>` forms — in **both** `discoverReviewDirs`
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:31:   `-review-` infix independently of the regex) — and add the `-review-` form
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:36:   review-dir discovery pattern not matching a `-review-`-prefixed directory.
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:52:  used `<phase>-review-<slug>-<date>` since 2026-07-14. Both forms coexist in
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:93:  `<phase>-review-<slug>-<date>`, **and** `buildSoftData`'s phase-extraction
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:95:  without this companion fix the regex widening is inert and every `-review-`
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:97:- The spec's review-artifact naming line and `phase-pr-review.md` §5's
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:99:  `-review-` form as an explicitly-accepted alternative (additive, per the F4
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:100:  ratification); the `-review-` form is recommended going forward. Old-style
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:119:  phase-extraction `startsWith` widened to the `-review-` form (F1)**; precision
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:127:- `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` — review-dir naming line
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:128:  gains the `-review-` form as an accepted alternative (original wording
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:162:   excludes `task-validate-*`), and a fixture with a `-review-` directory
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:166:5. Spec naming line + `phase-pr-review.md` §5 mandate `-review-`; the two
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:1:# Build plan: retro wave-identity + review-dir naming (sdlc-retro-panel-precision)
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:43:both `<phase>-<slug>-<date>` and `<phase>-review-<slug>-<date>`, **and** widen
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:46:per the F4 ratification — original wording preserved): the spec's review-dir
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:47:naming line and `phase-pr-review.md` §5 gain the `-review-` form as an
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:55:`-review-` directory yields non-empty precision (guarding F1); grep asserts the
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:56:spec/reference retain their original line and gain the `-review-` note.
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
slug=foo match: true
slug=review-foo match: true
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
skills/sdlc-retro/schema/run.schema.json:5:  "description": "run.json v1 (spec §7): the distilled post-mortem record produced by collect-run from the FS13 run store. hard values are measured or absent (coverage-marked), never estimated; soft values are model-attributed and structurally separated so the renderer cannot conflate them.",
skills/sdlc-retro/schema/run.schema.json:8:  "required": ["schemaVersion", "slug", "coverage", "sizeProxies", "hard"],
skills/sdlc-retro/schema/run.schema.json:14:    "coverage": {
skills/sdlc-retro/scripts/collect-run.mjs:10:// (§6.3), uniform absence encoding, and the closed v1 coverage-marker set.
skills/sdlc-retro/scripts/collect-run.mjs:17:// Exit: 0 success (run.json written, possibly with coverage markers);
skills/sdlc-retro/scripts/collect-run.mjs:659:export function buildRunJson({ slug, title, track, coverage, sizeProxies, hard, soft }) {
skills/sdlc-retro/scripts/collect-run.mjs:660:	const out = { schemaVersion: RUN_SCHEMA_VERSION, slug, coverage, sizeProxies, hard };
skills/sdlc-retro/scripts/collect-run.mjs:688:	checkKeys(raw, ["schemaVersion", "slug", "title", "track", "coverage", "sizeProxies", "hard", "soft"], "/", add);
skills/sdlc-retro/scripts/collect-run.mjs:693:	if (!Array.isArray(raw.coverage)) add("/coverage", "must be an array");
skills/sdlc-retro/scripts/collect-run.mjs:695:		raw.coverage.forEach((c, i) => {
skills/sdlc-retro/scripts/collect-run.mjs:696:			if (!isPlainObject(c) || typeof c.marker !== "string" || c.marker.length === 0 || (c.detail !== undefined && typeof c.detail !== "string")) add(`/coverage/${i}`, "must be {marker, detail?}");
skills/sdlc-retro/scripts/collect-run.mjs:697:			else checkKeys(c, ["marker", "detail"], `/coverage/${i}`, add);
skills/sdlc-retro/scripts/collect-run.mjs:1104:	const coverage = [...manifestMarkers, ...panelMarkers, ...sessionMarkers, ...gitMarkers, ...ghMarkers, ...softMarkers];
skills/sdlc-retro/scripts/collect-run.mjs:1105:	const runJson = buildRunJson({ slug, title, track, coverage, sizeProxies, hard, soft });
skills/sdlc-retro/scripts/collect-run.mjs:1225:	const warnings = runJson.coverage.map((c) => c.marker);
skills/sdlc-retro/scripts/collect-run.mjs:1227:		console.log(JSON.stringify({ ok: true, out: relOut, coverage: warnings, warnings: [] }, null, 2));
skills/sdlc-retro/scripts/collect-run.mjs:1230:		for (const w of warnings) console.log(`  coverage: ${w}`);
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
skills/sdlc-retro/scripts/collect-run.mjs:10:// (§6.3), uniform absence encoding, and the closed v1 coverage-marker set.
skills/sdlc-retro/scripts/collect-run.mjs:237:			// a panels.malformed_meta marker; never throws (mirrors the tolerant
skills/sdlc-retro/scripts/collect-run.mjs:266:		if (!foundPhases.has(phase) || partialPhases.has(phase)) markers.push({ marker: `panels.missing:${phase}` });
skills/sdlc-retro/scripts/collect-run.mjs:268:	for (const phase of [...malformedMetaPhases].sort()) markers.push({ marker: `panels.malformed_meta:${phase}` });
skills/sdlc-retro/scripts/collect-run.mjs:915:		// cleanly. precision.unparsed is emitted only when the candidates span more
skills/sdlc-retro/scripts/collect-run.mjs:920:			markers.push({ marker: `precision.unparsed:${dir}` });
skills/sdlc-retro/scripts/collect-run.mjs:942:			markers.push({ marker: `precision.unparsed:${dir}` });
skills/sdlc-retro/scripts/collect-run.mjs:948:			markers.push({ marker: `precision.unparsed:${dir}` });
skills/sdlc-retro/scripts/collect-run.mjs:953:			markers.push({ marker: `precision.unparsed:${dir}` });
skills/sdlc-retro/scripts/collect-run.mjs:974:		if (precisionModelRejected) markers.push({ marker: `precision.unparsed:${dir}` });
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:64:`wave=round` and emits the pre-registered `panels.malformed_meta:<phase>`
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:71:dated panels share one wave; emit `precision.unparsed` **only when waves
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:77:dispatch (two rounds, one wave) joins with no `precision.unparsed`; a
docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md:79:emits `panels.malformed_meta`; `validateRunJson` accepts both `wave`-bearing and
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:23:   and emits `precision.unparsed` (dropping all precision) otherwise — which
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:79:  directory's precision to `(panelPhase, wave)`. Emit `precision.unparsed`
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:96:  directory silently yields `precision.unparsed` (F1).
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:131:  `panels.malformed_meta:<phase>` marker added to the closed v1 marker set (F5).
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:156:   logical wave per review round; **no `precision.unparsed`** for a well-formed
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:159:   one date emit `precision.unparsed`.
docs/plans/2026-07-19-sdlc-retro-panel-precision.md:179:  `panels.malformed_meta:<phase>` coverage marker — F5 — not throw; mirror
docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:318:attribution; unparseable adjudications yield `precision.unparsed:<dir>`
docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:365:coverage:   [ { marker, detail? } ]          # closed v1 marker set:
docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:366:            # manifest.absent, manifest.partial, panels.missing:<phase>,
docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:367:            # panels.malformed_meta:<phase>,
docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:370:            # soft.absent, precision.unparsed:<dir>
docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:518:  `precision.unparsed:<dir>` and no precision number for that panel.
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
// sdlc-retro collector soft-data / raw-snapshot / replay tests (lt-t5): the
// LLM seam, NF4 redaction + n-gram containment + 500-char cap, raw/
// snapshotting, and --from-raw exclusive replay. Scenarios LT17-LT19,
// LT28-LT29. Offline/deterministic (NF1): --llm-cmd is always a local fixture
// stub, never a real model; no network.
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import Ajv from "ajv";
import { collect, containsUserNgram, sanitizeSoftString, validateRunJson } from "../skills/sdlc-retro/scripts/collect-run.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
function readRunSchema() {
	try {
		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
	} catch (error) {
		assert.fail(`run schema is not valid JSON: ${error.message}`);
	}
}
const schemaValidate = new Ajv().compile(readRunSchema());
function readLlmProtocolSchema() {
	try {
		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "llm-protocol.schema.json"), "utf8"));
	} catch (error) {
		assert.fail(`llm protocol schema is not valid JSON: ${error.message}`);
	}
}
const llmProtocolValidate = new Ajv().compile(readLlmProtocolSchema());
function tmp(prefix = "sdlc-lt5-") {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}
function writeEvent(dir, slug, event, payload, ts, by = "agent") {
	const path = join(dir, ".pi", "sdlc", "runs", slug, "events.jsonl");
	mkdirSync(join(dir, ".pi", "sdlc", "runs", slug), { recursive: true });
	const line = `${JSON.stringify({ schemaVersion: 1, ts, slug, event, by, payload })}\n`;
	writeFileSync(path, existsSync(path) ? readFileSync(path, "utf8") + line : line, "utf8");
}
function isoAt(baseMs, offsetMs) {
	return new Date(baseMs + offsetMs).toISOString();
}
function mkStub(dir, name, body) {
	const p = join(dir, name);
	writeFileSync(p, `#!/usr/bin/env node\n${body}\n`);
	chmodSync(p, 0o755);
	return p;
}
const BASE = Date.parse("2026-07-18T09:00:00.000Z");
const SENTINEL_SECRET = "sk-sentinel-abcd1234";
const SENTINEL_SENTENCE = "the quick brown fox jumps over the lazy dog while eating pancakes";
function seedManifest(root, slug) {
	writeEvent(root, slug, "run.started", { title: "T", track: "irreversible" }, isoAt(BASE, 0));
	writeEvent(root, slug, "phase.entered", { phase: "implement" }, isoAt(BASE, 1000));
	writeEvent(root, slug, "phase.exited", { phase: "implement" }, isoAt(BASE, 20000));
}
function seedSession(home, root, { userText = "hello there", withSentinel = false } = {}) {
	const mapped = root.replace(/^\//, "").replaceAll("/", "-");
	const sessDir = join(home, ".pi", "agent", "sessions", `--${mapped}--`);
	mkdirSync(sessDir, { recursive: true });
	const lines = [
		{ type: "session", version: 3, id: "s1", timestamp: isoAt(BASE, 500) },
		{ type: "message", id: "u1", parentId: null, timestamp: isoAt(BASE, 1500), message: { role: "user", content: [{ type: "text", text: withSentinel ? SENTINEL_SENTENCE : userText }], timestamp: BASE + 1500 } },
		{
			type: "message",
			id: "m1",
			parentId: "u1",
			timestamp: isoAt(BASE, 2500),
			message: { role: "assistant", content: [], provider: "anthropic", model: "anthropic/claude-x", usage: { totalTokens: 10, cost: { total: 0.01 } }, timestamp: BASE + 2500 },
		},
	];
	const path = join(sessDir, "sess.jsonl");
	writeFileSync(path, `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);
	return sessDir;
}
// A scripted fake --llm-cmd: reads one JSON request from stdin, returns a
// scripted response based on `kind` (and env overrides for edge cases).
function mkLlmStub(dir, { leak = false, invalidJson = false, timeoutMs = 0 } = {}) {
	const body = `
const data = require("fs").readFileSync(0, "utf8");
${timeoutMs > 0 ? `setTimeout(() => {}, ${timeoutMs + 1000});` : ""}
const req = JSON.parse(data);
${
	invalidJson
		? `process.stdout.write("not json"); process.exit(0);`
		: `
let output;
if (req.kind === "narrative") {
  output = { summary: ${leak ? `${JSON.stringify(`leaked secret ${SENTINEL_SECRET} and verbatim: ${SENTINEL_SENTENCE}`)}` : `"a narrative summary"`} };
} else if (req.kind === "steering") {
  output = { classifications: req.inputs.userTurns.map((t) => ({ index: t.index, class: "other" })) };
} else if (req.kind === "precision") {
  output = { perModel: req.inputs.models.map((m) => ({ model: m, raised: 2, incorporated: 1, dismissed: 1 })) };
}
process.stdout.write(JSON.stringify({ kind: req.kind, model: "fixture/llm-1", provider: "fixture", output }));
process.exit(0);
`
}
`;
	return mkStub(dir, "fake-llm", body);
}
// ---------------------------------------------------------------------------
// LT18 — soft data appears only under `soft`, carries attribution, and
// steering classes / precision figures match the fixture LLM's scripted
// responses; an unparseable consolidated fixture yields
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
diff --git a/test/telemetry-collect.test.js b/test/telemetry-collect.test.js
index 9b5a635..3122625 100644
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
@@ -276,15 +312,17 @@ test("LT15: transcript usage/cost sums correctly and a version-4 transcript soft
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
262:		if (e.event === "panel.dispatched" || e.event === "panel.harvested" || e.event === "panel.consolidated") expectedPhases.add(e.payload.panelPhase);
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
✔ LT13 (hard): complete fixture store -> schema-valid run.json with known-answer rollups (113.100547ms)
✔ LT14: a gappy store names every gap and derives nothing from missing sources (78.376867ms)
✔ LT14: --no-github records github.skipped, not github.error (4.931821ms)
✔ LT15: manifest adapter skips and counts malformed lines (manifest.partial) (1.394343ms)
✔ LT15: harvest adapter maps per-model fields correctly (1.1791ms)
✔ T3: discoverPanels reads the meta.json wave; malformed sidecar falls back to round with a marker (1.428463ms)
✔ LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file (1.410615ms)
✔ LT15: review-dir discovery matches both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> naming (0.991745ms)
✔ LT15: git/GitHub adapters consume only the injected fakes (109.729883ms)
✔ LT16: phase attribution, agent time, capped human-wait, rework, window bounds (3.461613ms)
✔ LT16: a 3-hour gap contributes exactly 30 minutes to human-wait (5.150536ms)
✔ collect-run: no run store exits 1 (nothing collectable) (53.411827ms)
✔ collect-run: writes docs/retros/<slug>/run.json by default and validates (70.043386ms)
✔ resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved (0.341819ms)
✔ LT11: harvest copies status.json + events.jsonl and emits panel.harvested (74.423663ms)
✔ T1: --wave records a logical wave distinct from the round allocation label (65.92585ms)
✔ T1: --wave must be a positive integer (37.776097ms)
✔ LT11: --with-transcripts copies the transcripts/ subdirectory (58.113366ms)
✔ LT12: a missing source directory exits 0 with both files missed (53.026251ms)
✔ LT12: a partially-present source (status without events) reports one missed (52.94473ms)
✔ harvest-panel: unknown phase and non-positive round exit 2 (101.737383ms)
✔ harvest-panel.sh wrapper delegates to .mjs identically (45.857673ms)
✔ LT20: full fixture renders all seven anchors with known-answer data bindings (6.66874ms)
✔ T4: same-wave harvest rounds collapse into one wave section with each round as sub-detail (1.618167ms)
✔ LT20: an empty-shell run.json fails to carry any pinned data binding (0.521558ms)
✔ LT21: render-twice byte-identity and no generation-time values (1.195379ms)
✔ LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical (161.01234ms)
✔ LT22: soft-data figures carry data-soft and visible attribution (0.505457ms)
✔ LT22: a soft-less run.json renders coverage notices, not fabricated numbers (0.440021ms)
✔ LT23: every coverage marker is rendered under #coverage (0.423894ms)
✔ render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2 (157.369043ms)
✔ render-retro CLI: default --out is index.html beside the input; --format json envelope (43.961897ms)
ℹ tests 45
ℹ suites 0
ℹ pass 45
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1806.778312
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
slug=foo -> [ 'plan-review-foo-2026-07-19' ]
slug=review-foo -> [ 'plan-review-foo-2026-07-19' ]
Confirmed: the exact same on-disk review directory is claimed by two different slugs. This is a real, demonstrable defect introduced by this diff.
Now let me check the buildSoftData phase-extraction path for the same collision, and double check the `discoverPanels` dedupe/malformed-marker interaction once more, then wrap up.
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
		for (const c of result.response.output.classifications) {
			const turn = userTurns[c.index];
			if (turn) steering.push({ index: c.index, ts: turn.ts, class: c.class });
		}
	}
	if (steeringFailed) markers.push({ marker: "llm.error:steering" });
	const panelPrecision = [];
	for (const dir of reviewDirs) {
		// Match both naming forms (see discoverReviewDirs): the `-review-` infix
		// must be accepted here too, or every `-review-` directory silently yields
Good, this confirms the same collision applies to `buildSoftData`'s `startsWith` check too (same ambiguity, `${phase}-review-${slug}-` vs `${phase}-${slug}-` for slug=`review-X`). I have enough for a solid review now.
## Findings
### `discoverReviewDirs`/`buildSoftData` naming-form widening creates cross-slug directory collisions
- severity: high
- confidence: high
- file: skills/sdlc-retro/scripts/collect-run.mjs
- line: 281 (discoverReviewDirs regex), approx 902-906 (buildSoftData startsWith)
- problem: The new optional `(?:review-)?` infix makes the regex (and the parallel `startsWith` check in `buildSoftData`) accept a single directory name under two different slugs. For a directory `plan-review-foo-2026-07-19`, `discoverReviewDirs(root, "foo")` matches it via the new `-review-` infix, and `discoverReviewDirs(root, "review-foo")` matches the *same* directory via the untouched classic form — both are valid per `SLUG_RE`.
- repro_or_impact: Verified live: `discoverReviewDirs(root, "foo")` and `discoverReviewDirs(root, "review-foo")` both return `['plan-review-foo-2026-07-19']` for the identical fixture directory. If a repo ever has (or later acquires) a slug literally named `review-<something>`, its classic-form review directory will be silently claimed by any unrelated slug `<something>`'s retro collection (and vice versa), corrupting/misattributing precision figures and violating the discovery invariant that a review directory belongs to exactly one slug's run. This ambiguity did not exist before this diff (the old regex had no optional infix).
- remediation: Require the two forms to be structurally distinguishable (e.g. only accept the `-review-` infix when it is not itself immediately followed by another copy of `slug-date`, or better, pick one canonical separator/marker that can't collide with a `review-`-prefixed slug, e.g. anchor on the phase and require greedy/leftmost match plus rejecting slugs that start with `review-` for the classic form during migration).
### `run.schema.json`/`validateRunJson` additive fields break forward-compat for any consumer pinned to the pre-PR schema, despite the "no v1→v2 bump" claim
- severity: medium
- confidence: high
- file: skills/sdlc-retro/schema/run.schema.json
- line: 93-97 (`hard.panels[].wave`), 205-209 (`soft.panelPrecision[].wave`)
- problem: Every object schema in `run.schema.json` (and the hand-rolled `checkKeys`/`validateRunJson`) is closed (`additionalProperties: false` / "unknown property" rejection). The PR body's claim "so every existing record still validates — no v1→v2 bump" is true only in the backward direction (new validator reading old data). It is not true in the forward direction: any code still holding the pre-PR schema/validator (e.g. a pinned copy in a consuming repo, a stale CI cache, or a not-yet-upgraded checkout of this same skill bundle) will reject a freshly-produced `run.json` that now includes `wave` on `hard.panels[]`/`soft.panelPrecision[]`, since `wave` is an unrecognized property under the old closed schema. `schemaVersion` staying at `1` signals "no compatibility change needed," which is misleading for out-of-band consumers.
- repro_or_impact: Confirmed via code inspection — `checkKeys()` (collect-run.mjs:679-682) unconditionally flags any key not in the passed allow-list as `unknown property`, and the JSON schema mirrors this with `additionalProperties: false` at every relevant level. A schema/validator checked out before this commit, fed a `run.json` produced after it, will fail validation purely because of the new optional field.
- remediation: Either bump `schemaVersion` to 2 to make the compatibility boundary explicit, or document/enforce that `run.schema.json`/`validateRunJson` are always consumed same-version-pinned with the collector that produced the file (and never cached/vendored separately), so the "additive, no bump" claim is actually safe in context.
### `panelPrecision[].round` is silently overwritten with the wave value, discarding the actual harvest round
- severity: low
- confidence: high
- file: skills/sdlc-retro/scripts/collect-run.mjs
- line: 965-971
- problem: `panelPrecision.push({ panelPhase: panel.panelPhase, round: wave, wave, ... })` sets `round` to the wave value rather than to the actual harvest round that produced the reviewed artifacts, even though `round` remains schema-required and is documented ("carried for `run.json` v1 validator compatibility") as if it still meant "harvest round." In a replacement-dispatch wave (round 1 original + round 2 replacement sharing wave 1), the precision record's `round` field always equals 1 (the wave/original round), never 2, regardless of which physical round's `consolidated.md`/model files the precision figures were actually mined from.
- repro_or_impact: Any downstream tooling that reasonably assumes `panelPrecision[].round` identifies which `hard.panels[]` entry (by exact `round`) generated a given precision row will get a coincidentally-plausible but not-necessarily-correct join for replacement-dispatch waves, since it always resolves back to the wave's original round rather than the actual harvest round consulted.
- remediation: Keep `round` as the actual harvest round of the joined panel entry (or drop it and rely solely on `wave`) rather than duplicating `wave` under the `round` key.
### `wave` on `panel.dispatched`/`panel.consolidated` event payloads is an unused, purely duplicate field
- severity: low
- confidence: medium
- file: skills/sdlc/scripts/telemetry.mjs
- line: 106-112 (OPTIONAL_EVENT_PAYLOADS)
- problem: For `panel.dispatched`/`panel.consolidated`, the pre-existing `round` field was already documented and used as the logical review-wave counter (per `system-reference.md`'s own wording, both before and after this diff — "carries that wave's `<wave>` in the `round` payload field"). Adding an optional `wave` field to these two event types therefore only ever duplicates the value already in `round`; nothing in `collect-run.mjs` reads `payload.wave` for these events (`discoverPanels` only reads `e.payload.panelPhase` from manifest events).
- repro_or_impact: Not a correctness bug, but unexploited surface added ahead of any consumer need (only `panel.harvested`'s `wave`/`round` pair is actually consumed, via the `meta.json` sidecar path, not via manifest events at all).
- smell: Speculative Generality
- remediation: Drop `wave` from `panel.dispatched`/`panel.consolidated` `OPTIONAL_EVENT_PAYLOADS` and `event.schema.json` conditionals until a consumer actually needs it there, or clearly document why the duplication is intentional.
### `discoverPanels`' `panel` variable in `buildSoftData`'s precision loop is dead weight
- severity: low
- confidence: medium
- file: skills/sdlc-retro/scripts/collect-run.mjs
- line: 918-919, 964
- problem: `const panel = candidates[0];` is computed (picking an arbitrary candidate among same-wave entries) but only `panel.panelPhase` is ever read, and that value is already known/invariant across all `candidates` (they were filtered by `panelPhase === panelPhase` earlier in the loop). The variable name and selection logic imply a meaningful "pick the panel to join against" decision, but no per-model/per-round data from the chosen candidate is actually used.
- smell: Mysterious Name
- repro_or_impact: No functional impact today, but it's misleading during future maintenance — a reader might assume `panel.dir`/`panel.models` matter here and rely on `candidates[0]` for something it was never designed to guarantee.
- remediation: Replace `panel.panelPhase` with the already-resolved `panelPhase` variable and drop the unused `panel`/`candidates[0]` selection.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Five findings produced with concrete file:line citations (skills/sdlc-retro/scripts/collect-run.mjs, skills/sdlc-retro/schema/run.schema.json, skills/sdlc/scripts/telemetry.mjs), including a live-reproduced high-severity cross-slug directory collision and a verified forward-compat gap in the closed-schema additive-fields claim."
    }
  ],
  "changedFiles": [
    "docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md",
    "docs/plans/2026-07-19-sdlc-retro-panel-precision.md",
    "docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md",
    "docs/validation/sdlc-retro-panel-precision/t1.json",
    "docs/validation/sdlc-retro-panel-precision/t2.json",
    "docs/validation/sdlc-retro-panel-precision/t3.json",
    "docs/validation/sdlc-retro-panel-precision/t4.json",
    "skills/sdlc-retro/schema/event.schema.json",
    "skills/sdlc-retro/schema/run.schema.json",
    "skills/sdlc-retro/scripts/collect-run.mjs",
    "skills/sdlc-retro/scripts/render-retro.mjs",
    "skills/sdlc/assets/normative-references.json",
    "skills/sdlc/references/phase-pr-review.md",
    "skills/sdlc/references/system-reference.md",
    "skills/sdlc/scripts/harvest-panel.mjs",
    "skills/sdlc/scripts/telemetry.mjs",
    "test/telemetry-collect-soft.test.js",
    "test/telemetry-collect.test.js",
    "test/telemetry-harvest.test.js",
    "test/telemetry-render.test.js",
    "pr-body.md (reviewed, not modified)"
  ],
  "testsAddedOrUpdated": [
    "test/telemetry-collect.test.js",
    "test/telemetry-harvest.test.js",
    "test/telemetry-render.test.js",
    "test/telemetry-collect-soft.test.js"
  ],
  "commandsRun": [
    {
      "command": "node --test test/telemetry-collect.test.js test/telemetry-collect-soft.test.js test/telemetry-harvest.test.js test/telemetry-render.test.js",
      "result": "passed",
      "summary": "45/45 tests pass on HEAD; confirms the PR's own test suite is green (did not itself surface the collision/compat findings below)"
    },
    {
      "command": "node -e (adhoc repro of discoverReviewDirs cross-slug collision for slug 'foo' vs 'review-foo')",
      "result": "passed",
      "summary": "Confirmed both discoverReviewDirs(root,'foo') and discoverReviewDirs(root,'review-foo') return the same directory 'plan-review-foo-2026-07-19' — a real collision, not speculative"
    },
    {
      "command": "node -e (adhoc regex test of the discoverReviewDirs pattern)",
      "result": "passed",
      "summary": "Regex ^(phase)-(?:review-)?slug-date$ matches dir 'plan-review-foo-2026-07-19' for both slug='foo' and slug='review-foo'"
    }
  ],
  "validationOutput": [
    "checkKeys()/run.schema.json additionalProperties:false confirmed closed-schema at every object level (skills/sdlc-retro/scripts/collect-run.mjs:679-682, skills/sdlc-retro/schema/run.schema.json:93,205)",
    "event.schema.json payload sub-schemas confirmed open (no additionalProperties:false on payload objects), so the event-level 'unknown fields tolerated' claim is accurate and not a defect",
    "panelPrecision.round=wave duplication confirmed disclosed in pr-body.md's Assumptions section as a deliberate 'keep both' call, but still flagged since it discards the actual harvest round"
  ],
  "residualRisks": [
    "Cross-slug review-directory collision (high finding) is currently only theoretical unless/until a slug literally named 'review-<x>' is used, but nothing in the codebase prevents that slug from being chosen (SLUG_RE permits it)",
    "Forward-compat break for any out-of-band consumer pinned to a pre-PR copy of run.schema.json/validateRunJson is only a risk if such a consumer exists outside this repo's own tightly-coupled collector+schema pairing",
    "panelPrecision.round/wave duplication and the panel.dispatched/consolidated wave field are low-impact but add latent confusion for future maintainers"
  ],
  "noStagedFiles": true,
  "diffSummary": "Reworks the sdlc-retro collector to preserve logical review-wave identity across multi-round/replacement panel harvests: harvest-panel.mjs gains --wave (defaults to --round) and writes a {round,wave} meta.json sidecar; collect-run.mjs's discoverPanels reads the sidecar (tolerant of absence/malformation), and buildSoftData's precision join is regrouped by (panelPhase, wave, date) instead of requiring exactly one panel dir per (phase, date); render-retro.mjs groups the panel deep-dive by wave, collapsing same-wave rounds into sub-detail; discoverReviewDirs and buildSoftData's phase-extraction now accept both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> naming; wave is added as an optional field to event.schema.json, run.schema.json, and telemetry.mjs's payload validators (allow-not-require, no schemaVersion bump).",
  "reviewFindings": [
    "high: skills/sdlc-retro/scripts/collect-run.mjs:281 (discoverReviewDirs) and ~902-906 (buildSoftData) - the new (?:review-)? infix makes one on-disk review directory match two different slugs (e.g. slug 'foo' and slug 'review-foo' both claim 'plan-review-foo-2026-07-19'), reproduced live",
    "medium: skills/sdlc-retro/schema/run.schema.json:93-97,205-209 - closed (additionalProperties:false) schemas mean the 'no v1->v2 bump' claim holds only backward (old data vs new validator), not forward (new data vs any old pinned validator/schema copy)",
    "low: skills/sdlc-retro/scripts/collect-run.mjs:965-971 - panelPrecision[].round is overwritten with the wave value, discarding the actual harvest round despite being documented/required as if it still meant harvest round",
    "low (smell: Speculative Generality): skills/sdlc/scripts/telemetry.mjs:106-112 - wave on panel.dispatched/panel.consolidated payloads is unused by any consumer in this diff, purely duplicating the pre-existing round semantics for those two event types",
    "low (smell: Mysterious Name): skills/sdlc-retro/scripts/collect-run.mjs:918-919,964 - the 'panel' variable selected via candidates[0] is only ever read for a field (.panelPhase) that's already invariant/known, misleading future readers into thinking it selects meaningful per-round data"
  ],
  "manualNotes": "The task's specific scrutiny targets were both investigated concretely: (1) the 'keep both round and wave' call is disclosed in pr-body.md's Assumptions section and works as documented (round==wave always for panelPrecision), but I flag it low because it discards, rather than preserves, the actual harvest-round identity it claims to retain 'for compatibility'; (2) the 'reversible/additive, no run.json v1->v2 bump' claim is technically true in the direction the PR tests exercise (old records still validate under the new schema) but not in the reverse direction (new records against any old/pinned schema copy), which is worth a documented caveat given schemaVersion is the sole compatibility signal. The cross-slug directory collision (high finding) is the most concrete, novel defect found and was verified with a live repro against the actual discoverReviewDirs function, not just static reading."
}
```
