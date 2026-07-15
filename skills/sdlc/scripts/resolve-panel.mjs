#!/usr/bin/env node
// resolve-panel.mjs — resolve a live, deduped, author-excluded review panel for
// an sdlc phase from the consumer's .pi/sdlc/sdlc.models.json.
//
// Without a lifecycle block this retains the frozen v1 vendor-based resolver.
// With a lifecycle block it resolves the configured gate against distinct model
// identities (provider/model, with only recognised thinking suffixes stripped).
//
// Usage: resolve-panel.mjs <phase> [--author <provider/model|vendor>] [--pong]
//          [--track irreversible|reversible] [--models-file <path>]
//          [--emit-tasks <agent>] [--config DIR|--repo-root DIR]

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { decomposeGateMode, fail, inspectConfig, inspectRoot, PHASES, readModels } from "./lib.mjs";

const argv = process.argv.slice(2);
let phase = "";
let author = "";
let pong = false;
let track = "";
let trackSeen = false;
let trackMissing = false;
let modelsFile = "";
let emitTasksAgent = "";
let config = "";
let repoRoot = "";
let deferredError = "";

for (let i = 0; i < argv.length; i++) {
	const a = argv[i];
	const reportParseError = (message) => {
		if (trackSeen) deferredError ||= message;
		else fail(message);
	};
	const needVal = (name) => {
		const v = argv[++i];
		if (v === undefined || v.startsWith("-")) {
			reportParseError(`resolve-panel: ${name} requires a value`);
			return "";
		}
		return v;
	};
	if (a === "--author") author = needVal("--author");
	else if (a === "--pong") pong = true;
	else if (a === "--track") {
		trackSeen = true;
		const candidate = argv[i + 1];
		if (candidate === undefined || candidate.startsWith("-")) trackMissing = true;
		else track = argv[++i];
	} else if (a === "--emit-tasks") emitTasksAgent = needVal("--emit-tasks");
	else if (a === "--models-file") modelsFile = needVal("--models-file");
	else if (a === "--config") config = needVal("--config");
	else if (a === "--repo-root") repoRoot = needVal("--repo-root");
	else if (a.startsWith("-")) reportParseError(`resolve-panel: unexpected argument: ${a}`);
	else if (!phase) phase = a;
	else reportParseError(`resolve-panel: unexpected argument: ${a}`);
}
if (!phase) fail("usage: resolve-panel <phase> [--author <provider/model|vendor>] [--pong] [--track irreversible|reversible] [--models-file <path>] [--emit-tasks <agent>] [--config DIR|--repo-root DIR]");
if (!PHASES.includes(phase)) fail(`resolve-panel: unknown phase '${phase}'. Known: ${PHASES.join(", ")}`);

const rootResult = inspectRoot({ config, repoRoot });
if (!rootResult.ok) {
	if (trackSeen) fail("resolve-panel: unexpected argument: --track");
	fail(`sdlc: ${rootResult.message}`);
}
const root = rootResult.root;
const lifecycle = readLifecycle(root);
if (lifecycle === null && trackSeen) fail("resolve-panel: unexpected argument: --track");
if (deferredError) fail(deferredError);
if (trackMissing) fail("resolve-panel: --track requires a value");
if (track !== "" && track !== "irreversible" && track !== "reversible") fail("resolve-panel: --track must be irreversible or reversible", 1);
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

function readLifecycle(consumerRoot) {
	const configPath = join(consumerRoot, ".pi", "sdlc", "sdlc.config.json");
	let text;
	try {
		text = readFileSync(configPath, "utf8");
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		fail(`resolve-panel: cannot read ${configPath}: ${error?.message || error}`, 1);
	}
	let raw;
	try {
		raw = JSON.parse(text);
	} catch {
		return null;
	}
	if (raw === null || typeof raw !== "object" || Array.isArray(raw) || !Object.hasOwn(raw, "lifecycle")) return null;
	const issue = inspectConfig(raw).find(({ path }) => path === "lifecycle" || path.startsWith("lifecycle."));
	if (issue) fail(`resolve-panel: invalid lifecycle at ${issue.path || "lifecycle"}: ${issue.message}`, 1);
	return raw.lifecycle;
}

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

// Frozen v1 vendor heuristic. Lifecycle resolution must never use this as an
// identity key.
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

const THINKING_LEVELS = new Set(["off", "minimal", "low", "medium", "high", "xhigh", "max"]);
function modelIdentity(pm) {
	const split = pm.lastIndexOf(":");
	if (split < 0 || !THINKING_LEVELS.has(pm.slice(split + 1))) return pm;
	return pm.slice(0, split);
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

function printPanel(panel) {
	if (emitTasksAgent) {
		const tasks = panel.map((pm) => ({ agent: emitTasksAgent, task: "FILL_IN_TASK_BLOCK", model: pm }));
		console.log(JSON.stringify({ tasks }, null, 2));
	} else {
		for (const pm of panel) console.log(pm);
	}
}

function resolveV1() {
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
	printPanel(panel);
	console.error(`panel[${phase}]: ${panel.length} model(s) across ${seenVendors.size} vendor(s); need >= ${minPanel}${excludeAuthor && authorVendor ? `; author vendor excluded: ${authorVendor} (${authorSpec})` : ""}`);
	for (const [pm, why] of dropped) console.error(`  dropped ${pm}: ${why}`);
	if (panel.length < minPanel) {
		console.error(`resolve-panel: FAILED to reach min_panel=${minPanel} for ${phase} with live credentials.`);
		process.exit(1);
	}
}

function defaultGateMode(gatePhase, selectedTrack) {
	if (gatePhase === "pr_review") return "panel";
	return selectedTrack === "reversible" ? "human" : "panel";
}

function resolveLifecycle() {
	let minPanel;
	let source;
	if (phase === "task_validate") {
		const validationMode = lifecycle.taskValidation?.mode ?? "subagent";
		if (validationMode === "off") fail("resolve-panel: task validation is off in the committed lifecycle shape", 1);
		minPanel = 1;
		source = "lifecycle.taskValidation";
	} else {
		const gate = lifecycle.gates?.[phase];
		const configuredMode = gate?.mode ?? (phase === "pr_review" ? "panel" : { irreversible: "panel" });
		let mode;
		if (typeof configuredMode === "object") {
			if (!track) fail(`resolve-panel: ${phase} mode is per-track in the committed lifecycle shape — pass --track irreversible|reversible`, 1);
			mode = configuredMode[track] ?? defaultGateMode(phase, track);
		} else {
			mode = configuredMode;
		}
		if (decomposeGateMode(mode).reviewer === "none") fail(`resolve-panel: ${phase} gate mode is '${mode}' in the committed lifecycle shape — no panel to resolve`, 1);
		minPanel = gate?.minPanel ?? 2;
		source = `lifecycle.gates.${phase}`;
	}
	console.error(`note: min_panel=${ph.min_panel ?? 1} in sdlc.models.json superseded by ${source} (minPanel=${minPanel})`);

	const authorSpec = author || cfg.author_default || "";
	if (authorSpec && !/^[^/]+\/.+$/.test(authorSpec)) fail("resolve-panel: --author must be provider/model when lifecycle block is present", 1);
	const authorIdentity = authorSpec ? modelIdentity(authorSpec) : "";
	const excludeAuthor = minPanel >= 2;
	const seenModels = new Set();
	const panel = [];
	const dropped = [];
	for (const pm of ph.prefer ?? []) {
		const identity = modelIdentity(pm);
		if (excludeAuthor && authorIdentity && identity === authorIdentity) {
			dropped.push([pm, `author model (${identity})`]);
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
		if (seenModels.has(identity)) {
			dropped.push([pm, `model ${identity} already in panel`]);
			continue;
		}
		seenModels.add(identity);
		panel.push(pm);
		if (panel.length >= minPanel) break;
	}
	printPanel(panel);
	console.error(`panel[${phase}]: ${panel.length} distinct model(s); need >= ${minPanel}${excludeAuthor && authorIdentity ? `; author model excluded: ${authorIdentity} (${authorSpec})` : ""}`);
	for (const [pm, why] of dropped) console.error(`  dropped ${pm}: ${why}`);
	if (panel.length < minPanel) {
		console.error(`resolve-panel: FAILED to reach distinct-model minPanel=${minPanel} for ${phase} with live credentials.`);
		process.exit(1);
	}
}

if (lifecycle === null) resolveV1();
else resolveLifecycle();
