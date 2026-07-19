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
