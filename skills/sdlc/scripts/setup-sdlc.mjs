#!/usr/bin/env node
// setup-sdlc.mjs — the opt-in scaffolder (spec §5.1). Interviews the developer
// (or takes flags) and writes <root>/.pi/sdlc/sdlc.config.json. Never names a
// worktree tool of its own: if the developer wants a worktree hook, it asks for
// THEIR tool/skill name (worktree neutrality). Self-validates before writing.
//
// Exit: 0 written; 1 user declined/aborted the interview; 2 error (bad args,
// invalid result, existing-without-force, no TTY for an interview).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { CONFIG_DEFAULTS, fail, HOOK_PHASES, resolveRoot, validateConfig } from "./lib.mjs";

const RUN_HOOK_WARNING =
	"sdlc: WARNING — 'run' hooks execute arbitrary shell commands with the agent's\n" +
	"privileges from the committed config. Only commit hooks you trust, exactly as\n" +
	"you would for .pi/prompts or project settings.";

const argv = process.argv.slice(2);
const opts = { hookSpecs: [] };
let sawConfigFlag = false;

function needVal(name, i) {
	const v = argv[i];
	if (v === undefined || v.startsWith("--")) fail(`setup-sdlc: ${name} requires a value`);
	return v;
}

for (let i = 0; i < argv.length; i++) {
	const a = argv[i];
	switch (a) {
		case "--prefix": opts.prefix = needVal("--prefix", ++i); sawConfigFlag = true; break;
		case "--label-prefix": opts.labelPrefix = needVal("--label-prefix", ++i); sawConfigFlag = true; break;
		case "--announce": opts.announce = needVal("--announce", ++i); sawConfigFlag = true; break;
		case "--tracker-repo": opts.trackerRepo = needVal("--tracker-repo", ++i); sawConfigFlag = true; break;
		case "--tracker-board-number": opts.trackerBoardNumber = needVal("--tracker-board-number", ++i); sawConfigFlag = true; break;
		case "--tracker-board-url": opts.trackerBoardUrl = needVal("--tracker-board-url", ++i); sawConfigFlag = true; break;
		case "--hook-run": opts.hookSpecs.push({ kind: "run", raw: needVal("--hook-run", ++i) }); sawConfigFlag = true; break;
		case "--hook-use": opts.hookSpecs.push({ kind: "use", raw: needVal("--hook-use", ++i) }); sawConfigFlag = true; break;
		case "--with-models": opts.withModels = true; break;
		case "--force": opts.force = true; break;
		case "--yes": opts.yes = true; break;
		case "--config": opts.config = needVal("--config", ++i); break;
		case "--repo-root": opts.repoRoot = needVal("--repo-root", ++i); break;
		case "--help": case "-h":
			console.log("usage: setup-sdlc.sh [--prefix V] [--label-prefix V] [--announce V] [--tracker-repo o/n --tracker-board-number N --tracker-board-url U] [--hook-run S] [--hook-use S] [--with-models] [--force] [--yes] [--config DIR|--repo-root DIR]");
			process.exit(0);
		default: fail(`setup-sdlc: unexpected argument: ${a}`);
	}
}

// Parse a --hook-run "<phase>:<before|after>:<command>" (command = remainder after 2nd ':').
function parseHookRun(raw) {
	const parts = raw.split(":");
	if (parts.length < 3) fail(`setup-sdlc: --hook-run must be "<phase>:<before|after>:<command>" (got ${JSON.stringify(raw)})`);
	const [phase, timing] = parts;
	const run = parts.slice(2).join(":");
	return { phase, timing, item: { run } };
}
// Parse a --hook-use "<phase>:<before|after>:<kind>:<name>:<do>" (use = fields 3-4; do = remainder after 4th ':').
function parseHookUse(raw) {
	const parts = raw.split(":");
	if (parts.length < 5) fail(`setup-sdlc: --hook-use must be "<phase>:<before|after>:<kind>:<name>:<do>" (got ${JSON.stringify(raw)})`);
	const [phase, timing, kind, name] = parts;
	const use = `${kind}:${name}`;
	const doText = parts.slice(4).join(":");
	return { phase, timing, item: { use, do: doText } };
}

function addHook(hooks, phase, timing, item) {
	if (!HOOK_PHASES.includes(phase)) fail(`setup-sdlc: unknown hook phase '${phase}' (allowed: ${HOOK_PHASES.join(", ")})`);
	if (timing !== "before" && timing !== "after") fail(`setup-sdlc: unknown hook timing '${timing}' (allowed: before, after)`);
	hooks[phase] ??= {};
	hooks[phase][timing] ??= [];
	hooks[phase][timing].push(item);
}

// Build the hooks object from ordered specs (argv order preserved per phase/timing).
function buildHooks(specs) {
	const hooks = {};
	let hasRun = false;
	for (const s of specs) {
		const parsed = s.kind === "run" ? parseHookRun(s.raw) : parseHookUse(s.raw);
		if (s.kind === "run") hasRun = true;
		addHook(hooks, parsed.phase, parsed.timing, parsed.item);
	}
	return { hooks, hasRun };
}

function assembleConfig({ prefix, labelPrefix, announce, tracker, hooks }) {
	const cfg = {
		schemaVersion: 1,
		prefix: prefix ?? CONFIG_DEFAULTS.prefix,
		labelPrefix: labelPrefix ?? CONFIG_DEFAULTS.labelPrefix,
		announce: announce ?? CONFIG_DEFAULTS.announce,
	};
	if (tracker) cfg.tracker = tracker;
	if (hooks && Object.keys(hooks).length > 0) cfg.hooks = hooks;
	return cfg;
}

function trackerFromFlags() {
	const { trackerRepo, trackerBoardNumber, trackerBoardUrl } = opts;
	const any = trackerRepo || trackerBoardNumber || trackerBoardUrl;
	if (!any) return undefined;
	if (!(trackerRepo && trackerBoardNumber && trackerBoardUrl)) {
		fail("setup-sdlc: --tracker-repo, --tracker-board-number and --tracker-board-url are all-or-none");
	}
	const number = Number(trackerBoardNumber);
	if (!Number.isInteger(number)) fail("setup-sdlc: --tracker-board-number must be an integer");
	return { repo: trackerRepo, board: { number, url: trackerBoardUrl } };
}

function writeConfig(root, cfg, hasRun) {
	const sdlcDir = join(root, ".pi", "sdlc");
	const target = join(sdlcDir, "sdlc.config.json");
	if (existsSync(target) && !opts.force) {
		fail(`setup-sdlc: ${target} already exists; pass --force to overwrite`);
	}
	validateConfig(cfg, target); // self-validation BEFORE writing; exits 2 on any bug
	mkdirSync(sdlcDir, { recursive: true });
	writeFileSync(target, `${JSON.stringify(cfg, null, 2)}\n`);
	if (hasRun) console.error(RUN_HOOK_WARNING);

	if (opts.withModels) {
		const modelsTarget = join(sdlcDir, "sdlc.models.json");
		if (existsSync(modelsTarget)) {
			console.error(`setup-sdlc: ${modelsTarget} exists; leaving it untouched`);
		} else {
			const example = join(import.meta.dirname, "..", "schema", "sdlc.models.example.json");
			writeFileSync(modelsTarget, `${readFileSync(example, "utf8").trimEnd()}\n`);
		}
	}
	console.log(`sdlc: wrote ${target}`);
	console.log("sdlc: commit .pi/sdlc/ to adopt the sdlc for this repo.");
}

async function interview(root) {
	if (!stdin.isTTY) {
		fail("setup-sdlc: no config flags and no TTY for an interactive interview; pass flags or --yes");
	}
	const rl = createInterface({ input: stdin, output: stdout });
	try {
		const ask = async (q, dflt) => {
			const a = (await rl.question(dflt ? `${q} [${dflt}]: ` : `${q}: `)).trim();
			return a || dflt || "";
		};
		const prefix = await ask("prefix", CONFIG_DEFAULTS.prefix);
		const labelPrefix = await ask("labelPrefix", CONFIG_DEFAULTS.labelPrefix);
		const announce = await ask("announce", CONFIG_DEFAULTS.announce);
		let tracker;
		if ((await ask("configure a GitHub tracker? (y/N)", "n")).toLowerCase().startsWith("y")) {
			const repo = await ask("tracker repo (owner/name)");
			const number = Number(await ask("tracker board number"));
			const url = await ask("tracker board url");
			tracker = { repo, board: { number, url } };
		}
		const hooks = {};
		let hasRun = false;
		if ((await ask("use a worktree per feature branch? (y/N)", "n")).toLowerCase().startsWith("y")) {
			const use = await ask("your worktree tool/skill (e.g. tool:my_worktree_tool or skill:my-worktree)");
			const doText = await ask("what should it do", "Create AND enter a worktree for the feature branch so the session's working root moves into it; target all subsequent writes there.");
			addHook(hooks, "implement", "before", { use, do: doText });
		}
		if ((await ask("run a notification after each phase? (y/N)", "n")).toLowerCase().startsWith("y")) {
			const cmd = await ask("notification command");
			addHook(hooks, "*", "after", { run: cmd });
			hasRun = true;
		}
		const cfg = assembleConfig({ prefix, labelPrefix, announce, tracker, hooks });
		writeConfig(root, cfg, hasRun);
		process.exit(0);
	} finally {
		rl.close();
	}
}

const root = resolveRoot({ config: opts.config || undefined, repoRoot: opts.repoRoot || undefined });

if (sawConfigFlag || opts.yes) {
	const tracker = trackerFromFlags();
	const { hooks, hasRun } = buildHooks(opts.hookSpecs);
	const cfg = assembleConfig({ prefix: opts.prefix, labelPrefix: opts.labelPrefix, announce: opts.announce, tracker, hooks });
	writeConfig(root, cfg, hasRun);
	process.exit(0);
} else {
	await interview(root);
}
