#!/usr/bin/env node
// resolve-panel.mjs — resolve a live, deduped, author-excluded review panel for
// an sdlc phase from the consumer's .pi/sdlc/sdlc.models.json.
//
// The law fixes panel shape (min distinct vendors, exclude the author's vendor);
// this resolver reconciles the phase's preference list against what actually has
// credentials on this machine, and dedupes to one model per vendor.
//
// Usage: resolve-panel.mjs <phase> [--author <provider/model|vendor>] [--pong]
//          [--models-file <path>] [--emit-tasks <agent>] [--config DIR|--repo-root DIR]
// Prints the panel (one provider/model per line) to stdout, OR with --emit-tasks
// a ready-to-paste { tasks: [...] } JSON object. Summary + drop reasons to stderr.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fail, PHASES, readModels, resolveRoot } from "./lib.mjs";

const argv = process.argv.slice(2);
let phase = "";
let author = "";
let pong = false;
let modelsFile = "";
let emitTasksAgent = "";
let config = "";
let repoRoot = "";

for (let i = 0; i < argv.length; i++) {
	const a = argv[i];
	const needVal = (name) => {
		const v = argv[++i];
		if (v === undefined || v.startsWith("-")) fail(`resolve-panel: ${name} requires a value`);
		return v;
	};
	if (a === "--author") author = needVal("--author");
	else if (a === "--pong") pong = true;
	else if (a === "--emit-tasks") emitTasksAgent = needVal("--emit-tasks");
	else if (a === "--models-file") modelsFile = needVal("--models-file");
	else if (a === "--config") config = needVal("--config");
	else if (a === "--repo-root") repoRoot = needVal("--repo-root");
	else if (a.startsWith("-")) fail(`resolve-panel: unexpected argument: ${a}`);
	else if (!phase) phase = a;
	else fail(`resolve-panel: unexpected argument: ${a}`);
}
if (!phase) fail("usage: resolve-panel <phase> [--author <provider/model|vendor>] [--pong] [--models-file <path>] [--emit-tasks <agent>] [--config DIR|--repo-root DIR]");
if (!PHASES.includes(phase)) fail(`resolve-panel: unknown phase '${phase}'. Known: ${PHASES.join(", ")}`);

const root = resolveRoot({ config, repoRoot });
const cfg = readModels(root, modelsFile || undefined);
const ph = cfg.phases[phase];

// Credentials: a provider is usable if it has an auth.json entry or its env var.
let authKeys = [];
try {
	authKeys = Object.keys(JSON.parse(readFileSync(join(homedir(), ".pi", "agent", "auth.json"), "utf8")));
} catch {
	// no auth.json; rely on env vars only
}
const ENV_VARS = {
	moonshotai: ["MOONSHOT_API_KEY"],
	"kimi-coding": ["KIMI_API_KEY"],
	deepseek: ["DEEPSEEK_API_KEY"],
	openai: ["OPENAI_API_KEY"],
	zai: ["ZAI_API_KEY"],
	"zai-coding-cn": ["ZAI_CODING_CN_API_KEY"],
	anthropic: ["ANTHROPIC_API_KEY", "ANTHROPIC_OAUTH_TOKEN"],
	minimax: ["MINIMAX_API_KEY"],
};
function hasAwsCreds() {
	const e = process.env;
	if (e.AWS_BEARER_TOKEN_BEDROCK) return true;
	if (e.AWS_ACCESS_KEY_ID && e.AWS_SECRET_ACCESS_KEY) return true;
	if (e.AWS_PROFILE) return true;
	return !!(e.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || e.AWS_CONTAINER_CREDENTIALS_FULL_URI || e.AWS_WEB_IDENTITY_TOKEN_FILE);
}
function hasCreds(pm) {
	const provider = pm.split("/")[0];
	if (authKeys.includes(provider)) return true;
	if (provider === "amazon-bedrock") return hasAwsCreds();
	return (ENV_VARS[provider] ?? []).some((v) => process.env[v]);
}

function vendor(pm) {
	const s = pm.toLowerCase();
	if (s.includes("claude") || s.includes("anthropic")) return "anthropic";
	if (s.includes("deepseek")) return "deepseek";
	if (s.includes("gpt") || s.startsWith("openai")) return "openai";
	if (s.includes("glm") || s.includes("zai")) return "zai";
	if (s.includes("kimi") || s.includes("moonshot")) return "moonshot";
	if (s.includes("minimax")) return "minimax";
	return s.split("/")[0];
}

function pongOk(pm) {
	const [provider, ...rest] = pm.split("/");
	const model = rest.join("/");
	try {
		const out = execFileSync("pi", ["--provider", provider, "--model", model, "--thinking", "off", "--no-session", "--print", "Reply with exactly: PONG"], {
			timeout: 60_000,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
		return /PONG/.test(out);
	} catch {
		return false;
	}
}

const minPanel = ph.min_panel ?? 1;
const excludeAuthor = cfg.rules?.exclude_author_vendor !== false && minPanel >= 2;
const authorSpec = author || cfg.author_default || "";
const authorVendor = authorSpec ? vendor(authorSpec) : "";

const seenVendors = new Set();
const panel = [];
const dropped = [];
for (const pm of ph.prefer ?? []) {
	const v = vendor(pm);
	if (excludeAuthor && authorVendor && v === authorVendor) {
		dropped.push([pm, `author vendor (${v})`]);
		continue;
	}
	if (seenVendors.has(v)) {
		dropped.push([pm, `vendor ${v} already in panel`]);
		continue;
	}
	if (!hasCreds(pm)) {
		dropped.push([pm, "no credentials"]);
		continue;
	}
	if (pong && !pongOk(pm)) {
		dropped.push([pm, "PONG failed"]);
		continue;
	}
	seenVendors.add(v);
	panel.push(pm);
}

if (emitTasksAgent) {
	const tasks = panel.map((pm) => ({ agent: emitTasksAgent, task: "FILL_IN_TASK_BLOCK", model: pm }));
	console.log(JSON.stringify({ tasks }, null, 2));
} else {
	for (const pm of panel) console.log(pm);
}
console.error(`panel[${phase}]: ${panel.length} model(s) across ${seenVendors.size} vendor(s); need >= ${minPanel}${excludeAuthor && authorVendor ? `; author vendor excluded: ${authorVendor} (${authorSpec})` : ""}`);
for (const [pm, why] of dropped) console.error(`  dropped ${pm}: ${why}`);
if (panel.length < minPanel) {
	console.error(`resolve-panel: FAILED to reach min_panel=${minPanel} for ${phase} with live credentials.`);
	process.exit(1);
}
