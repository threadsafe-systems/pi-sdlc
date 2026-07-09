// lib.mjs — shared consumer-root resolution + manifest read/validate for the
// sdlc skill's panel scripts. Frozen surfaces FS1 (config), FS2 (models),
// FS3 (resolution), FS4 (derivation). No runtime deps (NFR2).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

export const PHASES = ["plan_review", "spec_review", "pr_review", "task_validate"];
export const PHASE_TEMPLATE = {
	plan_review: "adversary-plan",
	spec_review: "adversary-spec",
	pr_review: "adversary-review",
	task_validate: "validator-task",
};
// FS4 label vocabulary (documentation of the derivation; consumed by the SKILL).
export const LABELS = [
	"map", "ticket-research", "ticket-prototype", "ticket-grilling",
	"ticket-task", "epic", "build-task", "hitl", "afk",
];

const PREFIX_RE = /^[a-z][a-z0-9-]*$/;
const PM_RE = /^[^/]+\/.+$/; // provider/model
const REPO_RE = /^[^/]+\/[^/]+$/;

export const CONFIG_DEFAULTS = Object.freeze({
	schemaVersion: 1,
	prefix: "sdlc",
	labelPrefix: "sdlc",
	announce: "Using the sdlc skill to drive this change through its lifecycle.",
	paths: { plans: "docs/plans", specs: "docs/specs", reviews: "docs/reviews", agents: ".pi/agents" },
});

// Exit 2 with a diagnostic (default) — the FS5 bad-input code.
export function fail(msg, code = 2) {
	console.error(msg);
	process.exit(code);
}

// FS4: agent name = <prefix>-<phase-slug>, phase-slug = phase id with _ -> -.
export function agentName(prefix, phase) {
	return `${prefix}-${phase.replace(/_/g, "-")}`;
}

// FS4: the regenerated, non-behavioural description line.
export function agentDescription(labelPrefix, phase) {
	return `${labelPrefix} ${phase} reviewer. Stamped by the sdlc skill; edit the template, not this file. Dispatch one task per model via the subagent tool's per-task model override.`;
}

// FS3: resolve the consumer root independently of the skill's own location.
export function resolveRoot({ config, repoRoot } = {}) {
	const explicit = config ?? repoRoot ?? process.env.SDLC_ROOT;
	if (explicit) return isAbsolute(explicit) ? explicit : resolve(explicit);
	// walk up from cwd for a configured project
	let dir = process.cwd();
	while (true) {
		if (existsSync(join(dir, ".pi", "sdlc", "sdlc.config.json"))) return dir;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	// no-manifest project: git top-level of cwd
	try {
		const top = execFileSync("git", ["rev-parse", "--show-toplevel"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		if (top) return top;
	} catch {
		// not a git repo
	}
	fail("sdlc: cannot locate a consumer repo; pass --config <dir> or set $SDLC_ROOT");
}

function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

// FS1: read + validate sdlc.config.json (or defaults when absent). ensure-panel-agent only.
export function readConfig(root) {
	const p = join(root, ".pi", "sdlc", "sdlc.config.json");
	if (!existsSync(p)) {
		return { ...CONFIG_DEFAULTS, paths: { ...CONFIG_DEFAULTS.paths }, tracker: undefined };
	}
	let raw;
	try {
		raw = JSON.parse(readFileSync(p, "utf8"));
	} catch (e) {
		fail(`sdlc: cannot parse ${p}: ${(e && e.message) || e}`);
	}
	validateConfig(raw, p);
	return {
		schemaVersion: raw.schemaVersion,
		prefix: raw.prefix,
		labelPrefix: raw.labelPrefix,
		announce: raw.announce,
		paths: { ...CONFIG_DEFAULTS.paths, ...(raw.paths ?? {}) },
		tracker: raw.tracker,
	};
}

export function validateConfig(raw, p) {
	const where = `sdlc config ${p}`;
	if (!isPlainObject(raw)) fail(`${where}: must be a JSON object`);
	const allowed = new Set(["schemaVersion", "prefix", "labelPrefix", "announce", "paths", "tracker"]);
	for (const k of Object.keys(raw)) {
		if (!allowed.has(k)) fail(`${where}: unknown key '${k}'`);
	}
	if (raw.schemaVersion !== 1) fail(`${where}: schemaVersion must be 1 (got ${JSON.stringify(raw.schemaVersion)})`);
	if (typeof raw.prefix !== "string" || !PREFIX_RE.test(raw.prefix)) fail(`${where}: prefix must match ${PREFIX_RE}`);
	if (typeof raw.labelPrefix !== "string" || !PREFIX_RE.test(raw.labelPrefix)) fail(`${where}: labelPrefix must match ${PREFIX_RE}`);
	if (typeof raw.announce !== "string" || raw.announce.length === 0) fail(`${where}: announce must be a non-empty string`);
	if (raw.paths !== undefined) {
		if (!isPlainObject(raw.paths)) fail(`${where}: paths must be an object`);
		const pathKeys = new Set(["plans", "specs", "reviews", "agents"]);
		for (const [k, v] of Object.entries(raw.paths)) {
			if (!pathKeys.has(k)) fail(`${where}: unknown paths key '${k}'`);
			if (typeof v !== "string" || v.length === 0) fail(`${where}: paths.${k} must be a non-empty string`);
			// repo-relative, must not escape the consumer repo
			if (v.startsWith("/") || v.split("/").includes("..")) fail(`${where}: paths.${k} must be a repo-relative path with no '..' segment`);
		}
	}
	if (raw.tracker !== undefined) {
		const t = raw.tracker;
		if (!isPlainObject(t)) fail(`${where}: tracker must be an object`);
		for (const k of Object.keys(t)) {
			if (k !== "repo" && k !== "board") fail(`${where}: unknown tracker key '${k}'`);
		}
		if (typeof t.repo !== "string" || !REPO_RE.test(t.repo)) fail(`${where}: tracker.repo must be owner/name`);
		if (!isPlainObject(t.board)) fail(`${where}: tracker.board must be an object`);
		for (const k of Object.keys(t.board)) {
			if (k !== "number" && k !== "url") fail(`${where}: unknown tracker.board key '${k}'`);
		}
		if (!Number.isInteger(t.board.number) || t.board.number < 1) fail(`${where}: tracker.board.number must be an integer >= 1`);
		if (typeof t.board.url !== "string" || !/^https?:\/\/.+/.test(t.board.url)) fail(`${where}: tracker.board.url must be an http(s) URL`);
	}
}

// FS2: read + validate sdlc.models.json (REQUIRED). resolve-panel only.
export function readModels(root, explicitPath) {
	const p = explicitPath ?? join(root, ".pi", "sdlc", "sdlc.models.json");
	if (!existsSync(p)) {
		fail(`sdlc: this project requires ${p} to resolve a panel (the skill ships no built-in model roster)`);
	}
	let raw;
	try {
		raw = JSON.parse(readFileSync(p, "utf8"));
	} catch (e) {
		fail(`sdlc: cannot parse ${p}: ${(e && e.message) || e}`);
	}
	validateModels(raw, p);
	return raw;
}

export function validateModels(raw, p) {
	const where = `sdlc models ${p}`;
	if (!isPlainObject(raw)) fail(`${where}: must be a JSON object`);
	const allowed = new Set(["author_default", "rules", "phases", "$comment"]);
	for (const k of Object.keys(raw)) {
		if (!allowed.has(k)) fail(`${where}: unknown key '${k}'`);
	}
	if (raw.author_default !== undefined && (typeof raw.author_default !== "string" || !PM_RE.test(raw.author_default))) {
		fail(`${where}: author_default must be provider/model`);
	}
	if (raw.rules !== undefined) {
		if (!isPlainObject(raw.rules)) fail(`${where}: rules must be an object`);
		for (const k of Object.keys(raw.rules)) {
			if (k !== "exclude_author_vendor") fail(`${where}: unknown rules key '${k}'`);
		}
		if (raw.rules.exclude_author_vendor !== undefined && typeof raw.rules.exclude_author_vendor !== "boolean") {
			fail(`${where}: rules.exclude_author_vendor must be boolean`);
		}
	}
	if (!isPlainObject(raw.phases)) fail(`${where}: phases must be an object`);
	const keys = Object.keys(raw.phases).sort();
	const want = [...PHASES].sort();
	if (keys.length !== want.length || keys.some((k, i) => k !== want[i])) {
		fail(`${where}: phases must contain exactly ${want.join(", ")}`);
	}
	for (const phase of PHASES) {
		const ph = raw.phases[phase];
		if (!isPlainObject(ph)) fail(`${where}: phases.${phase} must be an object`);
		for (const k of Object.keys(ph)) {
			if (k !== "min_panel" && k !== "prefer") fail(`${where}: unknown key phases.${phase}.${k}`);
		}
		if (!Number.isInteger(ph.min_panel) || ph.min_panel < 1) fail(`${where}: phases.${phase}.min_panel must be an integer >= 1`);
		if (!Array.isArray(ph.prefer) || ph.prefer.length === 0) fail(`${where}: phases.${phase}.prefer must be a non-empty array`);
		for (const m of ph.prefer) {
			if (typeof m !== "string" || !PM_RE.test(m)) fail(`${where}: phases.${phase}.prefer entries must be provider/model`);
		}
	}
}
