#!/usr/bin/env node
// ensure-panel-agent.mjs — stamp a phase reviewer prompt into ONE project-scoped,
// model-agnostic sub-agent file for dispatch via the subagent tool's per-task
// `model` override (one agent, reused across every panel model).
//
// The consumer root, prefix, labelPrefix, and agents dir come from the project's
// .pi/sdlc/sdlc.config.json (or built-in defaults when absent) — NOT from the
// skill's own location, so a globally installed skill stamps into the consumer's
// .pi/agents where the pi session resolves project agents.
//
// Usage: ensure-panel-agent.mjs <phase> [--dir DIR] [--tools CSV] [--force]
//          [--config DIR | --repo-root DIR]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { agentDescription, agentName, fail, PHASE_TEMPLATE, PHASES, readConfig, resolveRoot } from "./lib.mjs";

const REVIEWER_TAG_REPLACEMENT = "one of several independent reviewers in a multi-model panel";
const DEFAULT_TOOLS = "read,grep,find,ls,bash";

const argv = process.argv.slice(2);
let phase = "";
let dir = "";
let tools = DEFAULT_TOOLS;
let force = false;
let config = "";
let repoRoot = "";

for (let i = 0; i < argv.length; i++) {
	const a = argv[i];
	const needVal = (name) => {
		const v = argv[++i];
		if (v === undefined || v.startsWith("-")) fail(`ensure-panel-agent: ${name} requires a non-flag value`);
		return v;
	};
	if (a === "--dir") dir = needVal("--dir");
	else if (a === "--tools") tools = needVal("--tools");
	else if (a === "--force") force = true;
	else if (a === "--config") config = needVal("--config");
	else if (a === "--repo-root") repoRoot = needVal("--repo-root");
	else if (a === "-h" || a === "--help") {
		console.log("usage: ensure-panel-agent.mjs <plan_review|spec_review|pr_review|task_validate> [--dir DIR] [--tools CSV] [--force] [--config DIR|--repo-root DIR]");
		process.exit(0);
	} else if (a.startsWith("-")) fail(`ensure-panel-agent: unknown flag ${a}`);
	else if (!phase) phase = a;
	else fail(`ensure-panel-agent: unexpected arg '${a}'`);
}

if (!phase) fail("usage: ensure-panel-agent.mjs <plan_review|spec_review|pr_review|task_validate> [--dir DIR] [--tools CSV] [--force] [--config DIR|--repo-root DIR]");
if (!PHASES.includes(phase)) fail(`ensure-panel-agent: unknown phase '${phase}' (known: ${PHASES.join(" ")})`);

const skillDir = dirname(dirname(fileURLToPath(import.meta.url))); // skills/sdlc
const root = resolveRoot({ config, repoRoot });
const cfg = readConfig(root);

// Prompt resolution order (FS5): consumer override first, then skill generic.
const templateBase = PHASE_TEMPLATE[phase];
const overridePath = join(root, ".pi", "sdlc", "prompts", `${templateBase}.prompt.md`);
const genericPath = join(skillDir, "prompts", `${templateBase}.prompt.md`);
const promptPath = existsSync(overridePath) ? overridePath : genericPath;
if (!existsSync(promptPath)) fail(`ensure-panel-agent: missing template ${promptPath}`, 1);

const name = agentName(cfg.prefix, phase);
const description = agentDescription(cfg.labelPrefix, phase);

// Body: match bash `$(cat file)` (strips trailing newlines) + REVIEWER_TAG sub.
const rawBody = readFileSync(promptPath, "utf8").replace(/\n+$/, "");
const body = rawBody.split("REVIEWER_TAG").join(REVIEWER_TAG_REPLACEMENT);

const content = `${["---", `name: ${name}`, `description: ${description}`, `tools: ${tools}`, "---", "", body].join("\n")}\n`;

const agentsDir = dir ? (isAbsolute(dir) ? dir : resolve(dir)) : join(root, cfg.paths.agents);
const out = join(agentsDir, `${name}.md`);

if (existsSync(out) && !force) {
	if (readFileSync(out, "utf8") === content) {
		console.log(`up to date: ${out}`);
		console.log(`agent: ${name}`);
		process.exit(0);
	}
	fail(`ensure-panel-agent: ${out} exists with different content — rerun with --force to overwrite`, 1);
}

mkdirSync(agentsDir, { recursive: true });
writeFileSync(out, content);
console.log(`wrote ${out}`);
console.log(`agent: ${name}`);
