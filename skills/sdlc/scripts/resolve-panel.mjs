#!/usr/bin/env node
// resolve-panel.mjs — resolve a live, deduped, author-excluded review panel for
// an sdlc phase from the consumer's validated v4 config (schemaVersion 4).
//
// Usage: resolve-panel.mjs <phase> [--author <provider/model>] [--pong]
//          [--track irreversible|reversible] [--emit-tasks <agent>]
//          [--slug S] [--config DIR|--repo-root DIR]
//
// --slug is additive (FS13 lt-t2): on success, emits panel.resolved to the
// resolved run's manifest (fail-soft; never alters stdout or exit code).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { effectiveReview, fail, inspectRoot, PHASES, readConfig } from "./lib.mjs";
import { emitEvent } from "./telemetry.mjs";

const argv = process.argv.slice(2);
let phase = "";
let author = "";
let pong = false;
let track = "";
let trackSeen = false;
let trackMissing = false;
let emitTasksAgent = "";
let config = "";
let repoRoot = "";
let deferredError = "";
let slug;

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
	else if (a === "--slug") slug = needVal("--slug");
	else if (a === "--models-file") fail("resolve-panel: --models-file is retired — the panel roster lives in .pi/sdlc/sdlc.config.json (schemaVersion 4)");
	else if (a === "--config") config = needVal("--config");
	else if (a === "--repo-root") repoRoot = needVal("--repo-root");
	else if (a.startsWith("-")) reportParseError(`resolve-panel: unexpected argument: ${a}`);
	else if (!phase) phase = a;
	else reportParseError(`resolve-panel: unexpected argument: ${a}`);
}
if (!phase) fail("usage: resolve-panel <phase> [--author <provider/model>] [--pong] [--track irreversible|reversible] [--emit-tasks <agent>] [--slug S] [--config DIR|--repo-root DIR]");
if (!PHASES.includes(phase)) fail(`resolve-panel: unknown phase '${phase}'. Known: ${PHASES.join(", ")}`);

const rootResult = inspectRoot({ config, repoRoot });
if (!rootResult.ok) {
	if (trackSeen) fail("resolve-panel: unexpected argument: --track");
	fail(`sdlc: ${rootResult.message}`);
}
const root = rootResult.root;
const configPath = join(root, ".pi", "sdlc", "sdlc.config.json");
if (!existsSync(configPath)) {
	fail("sdlc: this project requires .pi/sdlc/sdlc.config.json with a panels roster to resolve a panel (the skill ships no built-in model roster)");
}
const cfg = readConfig(root);
const review = cfg.review;
const shape = cfg.shape;
const overrides = cfg.overrides ?? null;
if (deferredError) fail(deferredError);
if (trackMissing) fail("resolve-panel: --track requires a value");
if (track !== "" && track !== "irreversible" && track !== "reversible") fail("resolve-panel: --track must be irreversible or reversible", 1);
// --track is required whenever the config carries per-track overrides.
if (overrides !== null && track === "") fail("resolve-panel: this config has per-track overrides — pass --track irreversible|reversible", 1);
const panels = cfg.panels;
const ph = panels?.phases?.[phase];
if (!panels || !ph) {
	fail(`resolve-panel: no panels roster for ${phase} in .pi/sdlc/sdlc.config.json — add a panels block (see schema/sdlc.config.example.json)`, 1);
}

// --- v4 effective-value resolution (spec §3): design/code deep-merge via the
// single shared effectiveReview helper from lib.mjs (no private merge here). ---
const DIAL_FOR = { plan_review: "design", spec_review: "design", pr_review: "code", task_validate: "tasks" };
const effReview = effectiveReview(cfg, track || undefined);
function effective(dial) {
	return effReview[dial];
}
function floorFor() {
	if (ph.panelSize !== undefined) return ph.panelSize;
	if (phase === "task_validate") return 1;
	return effReview.panelSize; // via the shared merge (no private panelSize merge)
}

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
	google: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
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

const THINKING_LEVELS = new Set(["off", "minimal", "low", "medium", "high", "xhigh", "max"]);
// Vendors hosted on amazon-bedrock that also exist as a direct provider under the
// same identity — collapsing these lets author-exclusion see through the routing.
// Scanned as a dot-segment anywhere in the model id (not just after a hardcoded
// region-prefix whitelist): AWS Bedrock ids nest strictly as
// `[routing-prefix.]vendor.model[-version][:qualifier]`, so a recognized vendor
// segment always marks the true start of the model id regardless of what routing
// prefix (region, cross-region, or a future one) precedes it. A prefix whitelist
// approach fails open in the dangerous direction here: an *unrecognized* prefix
// would leave the id un-collapsed and able to sail past author-exclusion
// undetected (self-review risk), rather than merely under-deduping.
const BEDROCK_ALIAS_VENDORS = new Set(["anthropic", "deepseek"]);

function modelIdentity(pm) {
	const split = pm.lastIndexOf(":");
	const stripped = split >= 0 && THINKING_LEVELS.has(pm.slice(split + 1)) ? pm.slice(0, split) : pm;
	const slash = stripped.indexOf("/");
	if (slash < 0 || stripped.slice(0, slash) !== "amazon-bedrock") return stripped;
	const segments = stripped.slice(slash + 1).split(".");
	for (let i = 0; i < segments.length - 1; i++) {
		if (BEDROCK_ALIAS_VENDORS.has(segments[i])) return `${segments[i]}/${segments.slice(i + 1).join(".")}`;
	}
	return stripped; // no recognized vendor segment; native/unrecognized Bedrock model, left untouched.
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

function adviseShortfall(target, achieved) {
	console.error(`advisory[${phase}]: onShortfall is 'proceed' — panel below target: minPanel=${target}, achieved=${achieved}; proceeding. Carry this shortfall into the phase writeup and the PR.`);
}

// --- refusal ordering (spec §4.3): separateSpec → tasks-off → human/off ---
if (phase === "spec_review" && shape.separateSpec === false) {
	fail("resolve-panel: the committed shape has no spec gate (shape.separateSpec is false) — no panel to resolve", 1);
}
if (phase === "task_validate") {
	const mode = effective("tasks");
	if (mode === "off") fail("resolve-panel: task validation is off in the committed shape (review.tasks)", 1);
	if (mode !== "subagent") fail(`resolve-panel: task validation is '${mode}' in the committed shape (review.tasks) — only 'subagent' resolves a validator panel`, 1);
} else {
	const dial = effective(DIAL_FOR[phase]);
	if (dial.validate === "skip") fail(`resolve-panel: ${DIAL_FOR[phase]} gate does not run a panel (validate: skip) in the committed shape — no panel to resolve`, 1);
}

const onShortfall = review.onShortfall;
const floor = floorFor();

const authorSpec = author || panels.authorDefault || "";
if (authorSpec && !/^[^/]+\/.+$/.test(authorSpec)) fail("resolve-panel: --author must be provider/model", 1);
const authorIdentity = authorSpec ? modelIdentity(authorSpec) : "";
const excludeAuthor = floor >= 2;
const seenModels = new Set();
const panel = [];
const dropped = [];
const excludedAuthors = [];
for (const pm of ph.prefer) {
	const identity = modelIdentity(pm);
	if (excludeAuthor && authorIdentity && identity === authorIdentity) {
		dropped.push([pm, `author model (${identity})`]);
		excludedAuthors.push([pm, identity]);
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
	if (panel.length >= floor) break;
}
if (onShortfall === "proceed" && panel.length < floor) {
	for (const [pm, identity] of excludedAuthors) {
		if (seenModels.has(identity) || !hasCreds(pm) || (pong && !pongOk(pm))) continue;
		seenModels.add(identity);
		panel.push(pm);
		console.error(`advisory[${phase}]: author model ${identity} included — author exclusion demoted under 'proceed'`);
		if (panel.length >= floor) break;
	}
}
printPanel(panel);
console.error(`panel[${phase}]: ${panel.length} distinct model(s); need >= ${floor}${excludeAuthor && authorIdentity ? `; author model excluded: ${authorIdentity} (${authorSpec})` : ""}`);
for (const [pm, why] of dropped) console.error(`  dropped ${pm}: ${why}`);
if (panel.length === 0 && !(onShortfall === "fail" && excludedAuthors.length > 0)) fail(`resolve-panel: no credentialed models available for ${phase}`, 1);
if (panel.length < floor) {
	if (onShortfall === "proceed") adviseShortfall(floor, seenModels.size);
	else {
		console.error(`resolve-panel: FAILED to reach distinct-model minPanel=${floor} for ${phase} with live credentials.`);
		process.exit(1);
	}
}

// §3.3 FS5 side-effect emission: additive, best-effort, never touches stdout/exit.
emitEvent({
	event: "panel.resolved",
	slug,
	by: "script:resolve-panel",
	payload: { panelPhase: phase, models: panel, authorExcluded: excludeAuthor && authorIdentity ? authorIdentity : "" },
	root,
});
