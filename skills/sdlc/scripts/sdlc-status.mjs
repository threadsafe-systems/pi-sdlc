#!/usr/bin/env node
// sdlc-status.mjs — the mechanical half of the opt-in gate (spec §3). Resolves
// the consumer root (FS3, via lib.mjs), then reports opt-in status and a summary
// of the manifest (prefix, labelPrefix, configured hooks, workflow/models
// presence). Read-only; never mutates.
//
// Usage: sdlc-status.mjs [--config DIR | --repo-root DIR]
// Exit: 0 opted in (valid config); 1 no manifest; 2 invalid config / bad args.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { fail, HOOK_PHASES, readConfig, resolveRoot } from "./lib.mjs";

const argv = process.argv.slice(2);
let config = "";
let repoRoot = "";

for (let i = 0; i < argv.length; i++) {
	const a = argv[i];
	const needVal = (name) => {
		const v = argv[++i];
		if (v === undefined) fail(`sdlc-status: ${name} requires a value`);
		return v;
	};
	if (a === "--config") config = needVal("--config");
	else if (a === "--repo-root") repoRoot = needVal("--repo-root");
	else if (a === "--help" || a === "-h") {
		console.log("usage: sdlc-status.sh [--config DIR|--repo-root DIR]");
		process.exit(0);
	} else fail(`sdlc-status: unexpected argument: ${a}`);
}

const root = resolveRoot({ config: config || undefined, repoRoot: repoRoot || undefined });
const sdlcDir = join(root, ".pi", "sdlc");
const manifest = join(sdlcDir, "sdlc.config.json");

// Not opted in: root known, but no manifest. Exit 1, pointer on stderr.
if (!existsSync(manifest)) {
	console.log(`root: ${root}`);
	console.log("opted-in: no");
	console.error("sdlc: this repo has not opted in; run /setup-sdlc to adopt the sdlc.");
	process.exit(1);
}

// Opted in: read+validate (exits 2 on invalid config), then report.
const cfg = readConfig(root);

const lines = [];
lines.push(`root: ${root}`);
lines.push("opted-in: yes");
lines.push(`prefix: ${cfg.prefix}`);
lines.push(`labelPrefix: ${cfg.labelPrefix}`);

const hookLines = [];
if (cfg.hooks) {
	for (const phase of HOOK_PHASES) {
		const ph = cfg.hooks[phase];
		if (!ph) continue;
		for (const timing of ["before", "after"]) {
			if (Array.isArray(ph[timing])) hookLines.push(`hooks: ${phase}:${timing} ${ph[timing].length}`);
		}
	}
}
if (hookLines.length === 0) lines.push("hooks: none");
else lines.push(...hookLines);

lines.push(`workflow: ${existsSync(join(sdlcDir, "workflow.md")) ? "present" : "absent"}`);
lines.push(`models: ${existsSync(join(sdlcDir, "sdlc.models.json")) ? "present" : "absent"}`);

console.log(lines.join("\n"));
process.exit(0);
