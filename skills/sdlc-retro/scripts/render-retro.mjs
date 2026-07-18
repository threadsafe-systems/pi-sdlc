#!/usr/bin/env node
// render-retro.mjs — the sdlc-retro dashboard renderer (spec §8, lt-t6).
// Turns one run.json into a single self-contained, offline, deterministic
// HTML dashboard: seven anchored sections, pinned per-section data bindings,
// soft-data flagging with attribution, coverage notices for absent inputs.
// Never invokes a model; embeds no generation-time values; consumes run.json
// alone.
//
// Usage: render-retro.mjs --run FILE [--out FILE] [--format text|json]
// Exit: 0 written; 1 --run unreadable/unparseable/schema-invalid;
//       2 usage error or an unwritable --out.

import { closeSync, existsSync, fsyncSync, mkdtempSync, openSync, readFileSync, renameSync, rmSync, statSync, writeSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { validateRunJson } from "./collect-run.mjs";

const PREFIX = "sdlc-telemetry:";

function warn(msg) {
	process.stderr.write(`${PREFIX} ${msg}\n`);
}

function esc(s) {
	return String(s ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function fmtMs(ms) {
	if (!Number.isFinite(ms)) return "0ms";
	if (ms < 1000) return `${ms}ms`;
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(1)}s`;
	const m = s / 60;
	if (m < 60) return `${m.toFixed(1)}m`;
	return `${(m / 60).toFixed(2)}h`;
}

function fmtCost(cost) {
	return `$${Number(cost ?? 0).toFixed(4)}`;
}

// ---- section renderers (spec §8 pinned data bindings) ----------------------

function renderExecStrip(run) {
	const t = run.hard.totals;
	return `<section id="exec-strip">
<h2>Executive strip</h2>
<div class="strip">
<div class="metric" data-metric="tokens"><span class="label">Tokens</span><span class="value">${t.tokens}</span></div>
<div class="metric" data-metric="cost"><span class="label">Cost</span><span class="value">${esc(fmtCost(t.cost))}</span></div>
<div class="metric" data-metric="wallMs"><span class="label">Wall time</span><span class="value">${esc(fmtMs(t.wallMs))}</span></div>
<div class="metric" data-metric="agentMs"><span class="label">Agent time</span><span class="value">${esc(fmtMs(t.agentMs))}</span></div>
<div class="metric" data-metric="humanWaitMs"><span class="label">Human wait (proxy)</span><span class="value">${esc(fmtMs(t.humanWaitMs))}</span></div>
</div>
</section>`;
}

function renderPhaseSwimlane(run) {
	const phases = run.hard.phases;
	if (phases.length === 0) return `<section id="phase-swimlane"><h2>Phase swimlane</h2><p class="coverage-notice">no phase spans recorded in this run's manifest</p></section>`;
	const rows = phases.map((p) => `<div class="phase-row" data-phase="${esc(p.phase)}"><span class="phase-name">${esc(p.phase)}</span><span class="phase-start">${esc(p.start)}</span><span class="phase-end">${esc(p.end)}</span>${p.exitExplicit ? "" : '<span class="phase-derived">(derived end)</span>'}</div>`).join("\n");
	return `<section id="phase-swimlane">
<h2>Phase swimlane</h2>
${rows}
</section>`;
}

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
	const blocks = panels
		.map((p) => {
			const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
			const findings = precision.filter((pr) => pr.panelPhase === p.panelPhase && pr.round === p.round);
			const findingRows =
				findings.length > 0
					? findings
							.map(
								(f) =>
									`<div class="panel-finding-row" data-soft="true" data-model="${esc(f.model)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span>${esc(f.model)}</span><span>raised ${f.raised}</span><span>incorporated ${f.incorporated}</span><span>dismissed ${f.dismissed}</span></div>`,
							)
							.join("\n")
					: '<p class="coverage-notice">no precision figures for this round</p>';
			return `<div class="panel-round" data-panel-phase="${esc(p.panelPhase)}" data-round="${p.round}">
<h3>${esc(p.panelPhase)} round ${p.round}</h3>
${modelRows}
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
${marks}
</section>`;
}

function renderReworkPanel(run) {
	const r = run.hard.rework;
	return `<section id="rework-panel">
<h2>Rework</h2>
<div class="rework-row"><span>Artifact revisions</span><span>${r.artifactRevised}</span></div>
<div class="rework-row"><span>Phase backward moves</span><span>${r.phaseBackward}</span></div>
<div class="rework-row"><span>PR fix waves</span><span>${r.fixWave}</span></div>
</section>`;
}

function renderCoverage(run) {
	if (run.coverage.length === 0) return `<section id="coverage"><h2>Coverage</h2><p>full coverage: no gaps recorded for this run.</p></section>`;
	const rows = run.coverage.map((c) => `<div class="coverage-row" data-marker="${esc(c.marker)}"><span class="coverage-marker">${esc(c.marker)}</span>${c.detail ? `<span class="coverage-detail">${esc(c.detail)}</span>` : ""}</div>`).join("\n");
	return `<section id="coverage">
<h2>Coverage</h2>
${rows}
</section>`;
}

const CSS = `
body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #0b0e14; color: #d6dbe5; line-height: 1.5; }
h1 { margin-top: 0; }
section { margin-bottom: 2.5rem; padding: 1.25rem; background: #131722; border-radius: 8px; }
.strip { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.metric { display: flex; flex-direction: column; gap: 0.25rem; }
.metric .label { font-size: 0.8rem; color: #8892a6; text-transform: uppercase; letter-spacing: 0.05em; }
.metric .value { font-size: 1.5rem; font-weight: 600; }
.phase-row, .rollup-row, .panel-model-row, .panel-finding-row, .steering-mark, .rework-row, .coverage-row { display: flex; gap: 1rem; padding: 0.4rem 0; border-bottom: 1px solid #232838; }
[data-soft="true"] { background: rgba(255, 196, 0, 0.08); }
.soft-attribution { font-size: 0.75rem; color: #ffc400; }
.coverage-notice { color: #8892a6; font-style: italic; }
.panel-round { margin-bottom: 1.5rem; }
`;

export function renderDashboard(run) {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>sdlc-retro: ${esc(run.title ?? run.slug)}</title>
<style>${CSS}</style>
</head>
<body>
<h1>${esc(run.title ?? run.slug)}${run.track ? ` <small>(${esc(run.track)})</small>` : ""}</h1>
<nav><a href="#exec-strip">Summary</a> · <a href="#phase-swimlane">Phases</a> · <a href="#cost-breakdown">Cost</a> · <a href="#panel-deepdive">Panels</a> · <a href="#steering-map">Steering</a> · <a href="#rework-panel">Rework</a> · <a href="#coverage">Coverage</a></nav>
${renderExecStrip(run)}
${renderPhaseSwimlane(run)}
${renderCostBreakdown(run)}
${renderPanelDeepdive(run)}
${renderSteeringMap(run)}
${renderReworkPanel(run)}
${renderCoverage(run)}
</body>
</html>
`;
}

// ---- CLI --------------------------------------------------------------------

function parseArgs(argv) {
	const opts = { format: "text" };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = () => {
			const v = argv[++i];
			if (v === undefined) throw new Error(`${a} requires a value`);
			return v;
		};
		if (a === "--run") opts.run = val();
		else if (a === "--out") opts.out = val();
		else if (a === "--format") {
			const f = val();
			if (f !== "text" && f !== "json") throw new Error("--format must be text or json");
			opts.format = f;
		} else if (a === "-h" || a === "--help") opts.help = true;
		else throw new Error(`unexpected argument: ${a}`);
	}
	return opts;
}

function usage() {
	return "usage: render-retro.mjs --run FILE [--out FILE] [--format text|json]";
}

function atomicWrite(target, content) {
	const parent = dirname(target);
	if (!existsSync(parent) || !statSync(parent).isDirectory()) throw new Error(`output parent directory does not exist: ${parent}`);
	const tmp = mkdtempSync(join(parent, ".render-retro-"));
	const tmpFile = join(tmp, "index.html");
	const fd = openSync(tmpFile, "w");
	try {
		writeSync(fd, content);
		fsyncSync(fd);
	} finally {
		closeSync(fd);
	}
	renameSync(tmpFile, target);
	rmSync(tmp, { recursive: true, force: true });
}

function main() {
	let opts;
	try {
		opts = parseArgs(process.argv.slice(2));
	} catch (e) {
		warn(String(e.message || e));
		process.exit(2);
	}
	if (opts.help) {
		console.log(usage());
		process.exit(0);
	}
	if (!opts.run) {
		warn(usage());
		process.exit(2);
	}

	let raw;
	try {
		raw = readFileSync(opts.run, "utf8");
	} catch (err) {
		warn(`cannot read --run file: ${err?.message || err}`);
		process.exit(1);
	}
	let run;
	try {
		run = JSON.parse(raw);
	} catch (err) {
		warn(`--run file is not valid JSON: ${err?.message || err}`);
		process.exit(1);
	}
	const issues = validateRunJson(run);
	if (issues.length > 0) {
		warn(`--run file fails run.json schema validation: ${issues.join("; ")}`);
		process.exit(1);
	}

	const outPath = opts.out ? (isAbsolute(opts.out) ? opts.out : resolve(opts.out)) : join(dirname(resolve(opts.run)), "index.html");
	const html = renderDashboard(run);
	try {
		atomicWrite(outPath, html);
	} catch (err) {
		warn(`cannot write ${outPath}: ${err?.message || err}`);
		process.exit(2);
	}

	if (opts.format === "json") {
		console.log(JSON.stringify({ ok: true, out: outPath, warnings: [] }, null, 2));
	} else {
		console.log(`rendered: ${outPath}`);
	}
	process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
