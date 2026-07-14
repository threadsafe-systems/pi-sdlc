// lib.mjs — shared consumer-root resolution + manifest read/validate for the
// sdlc skill's panel scripts. Frozen surfaces FS1 (config), FS2 (models),
// FS3 (resolution), FS4 (derivation). No runtime deps (NFR2).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export const PHASES = ["plan_review", "spec_review", "pr_review", "task_validate"];
export const PHASE_TEMPLATE = {
	plan_review: "adversary-plan",
	spec_review: "adversary-spec",
	pr_review: "adversary-review",
	task_validate: "validator-task",
};
// FS4 label vocabulary (documentation of the derivation; consumed by the SKILL).
export const LABELS = ["map", "ticket-research", "ticket-prototype", "ticket-grilling", "ticket-task", "epic", "build-task", "hitl", "afk"];

const PREFIX_RE = /^[a-z][a-z0-9-]*$/;
const PM_RE = /^[^/]+\/.+$/; // provider/model
const REPO_RE = /^[^/]+\/[^/]+$/;
export const USE_RE = /^(skill|tool):[a-z][a-z0-9_-]*$/;
const SINGLE_LINE_RE = /^[^\r\n]+$/; // non-empty, single-line (run/do)

// Hook phase vocabulary: the six lifecycle phases + '*' (every phase). This is
// DISTINCT from PHASES (the four review-panel ids) and must not be conflated.
export const HOOK_PHASES = ["brainstorm", "plan", "spec", "build", "implement", "pr", "*"];

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

// FS3 (non-fatal seam, spec §2.3.1): resolve the consumer root without ever
// exiting. Precedence: explicit --config / --repo-root, then $SDLC_ROOT (or the
// injected sdlcRoot), then the configured ancestor walk, then git top-level.
export function inspectRoot({ config, repoRoot, cwd, sdlcRoot } = {}) {
	const base = cwd ?? process.cwd();
	const explicit = config ?? repoRoot ?? sdlcRoot ?? process.env.SDLC_ROOT;
	if (explicit) return { ok: true, root: isAbsolute(explicit) ? explicit : resolve(base, explicit) };
	// walk up from cwd for a configured project
	let dir = resolve(base);
	while (true) {
		if (existsSync(join(dir, ".pi", "sdlc", "sdlc.config.json"))) return { ok: true, root: dir };
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	// no-manifest project: git top-level of cwd
	try {
		const top = execFileSync("git", ["rev-parse", "--show-toplevel"], {
			encoding: "utf8",
			cwd: base,
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		if (top) return { ok: true, root: top };
	} catch {
		// not a git repo
	}
	return {
		ok: false,
		attemptedRoot: resolve(base),
		message: "cannot locate a consumer repo; pass --config <dir> or set $SDLC_ROOT",
	};
}

// FS3: resolve the consumer root independently of the skill's own location.
// Behaviour-compatible fatal wrapper over inspectRoot.
export function resolveRoot({ config, repoRoot } = {}) {
	const r = inspectRoot({ config, repoRoot });
	if (r.ok) return r.root;
	fail(`sdlc: ${r.message}`);
}

// FS1 path seam: pure consumer-root resolution shared by artifact and generated-agent consumers.
// It never exits or throws; callers choose their existing fatal/reporting surface.
export function inspectConsumerPath(root, configured, label = "path", { checkRealpath = true } = {}) {
	if (typeof configured !== "string" || configured.length === 0) return { ok: false, message: `${label} must be a non-empty repo-relative path` };
	const normalized = configured.replaceAll("\\", "/");
	if (normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized) || normalized.split("/").includes("..")) {
		return { ok: false, message: `${label} must be a contained repo-relative path` };
	}
	const rootAbs = resolve(root);
	const resolved = resolve(rootAbs, normalized);
	const rel = relative(rootAbs, resolved);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return { ok: false, message: `${label} escapes the consumer root` };
	if (checkRealpath && existsSync(resolved)) {
		const realRoot = realpathSync(rootAbs);
		const realTarget = realpathSync(resolved);
		const realRel = relative(realRoot, realTarget);
		if (realRel === ".." || realRel.startsWith(`..${sep}`) || isAbsolute(realRel)) return { ok: false, message: `${label} resolves outside the consumer root` };
	}
	return { ok: true, resolved, configured, normalized };
}

export function resolveConsumerPath(root, configured, label = "path") {
	const result = inspectConsumerPath(root, configured, label);
	if (!result.ok) fail(`sdlc: ${result.message}`);
	return result;
}

function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

// FS1: read + validate sdlc.config.json. Default (no-manifest) returns built-in
// defaults; with { requireManifest: true } a missing manifest exits 2 naming
// /setup-sdlc (the opt-in gate; ensure-panel-agent keeps the default behaviour).
export function readConfig(root, { requireManifest = false } = {}) {
	const p = join(root, ".pi", "sdlc", "sdlc.config.json");
	if (!existsSync(p)) {
		if (requireManifest) {
			fail(`sdlc: no manifest at ${p}; this repo has not opted in. Run /setup-sdlc to adopt the sdlc.`);
		}
		return { ...CONFIG_DEFAULTS, paths: { ...CONFIG_DEFAULTS.paths }, tracker: undefined };
	}
	let raw;
	try {
		raw = JSON.parse(readFileSync(p, "utf8"));
	} catch (e) {
		fail(`sdlc: cannot parse ${p}: ${e?.message || e}`);
	}
	validateConfig(raw, p);
	return {
		schemaVersion: raw.schemaVersion,
		prefix: raw.prefix,
		labelPrefix: raw.labelPrefix,
		announce: raw.announce,
		paths: { ...CONFIG_DEFAULTS.paths, ...(raw.paths ?? {}) },
		tracker: raw.tracker,
		hooks: raw.hooks,
	};
}

// Non-exiting FS1 issue collector (spec §2.5). Empty array means structurally
// valid. Issue order is deterministic by validation-rule order; the first
// element is always the diagnostic the exiting validator reports.
export function inspectConfig(raw) {
	const issues = [];
	const add = (path, message) => issues.push({ path, message });
	if (!isPlainObject(raw)) {
		add("", "must be a JSON object");
		return issues;
	}
	const allowed = new Set(["schemaVersion", "prefix", "labelPrefix", "announce", "paths", "tracker", "hooks"]);
	for (const k of Object.keys(raw)) {
		if (!allowed.has(k)) add(k, `unknown key '${k}'`);
	}
	if (raw.schemaVersion !== 1) add("schemaVersion", `schemaVersion must be 1 (got ${JSON.stringify(raw.schemaVersion)})`);
	if (typeof raw.prefix !== "string" || !PREFIX_RE.test(raw.prefix)) add("prefix", `prefix must match ${PREFIX_RE}`);
	if (typeof raw.labelPrefix !== "string" || !PREFIX_RE.test(raw.labelPrefix)) add("labelPrefix", `labelPrefix must match ${PREFIX_RE}`);
	if (typeof raw.announce !== "string" || raw.announce.length === 0) add("announce", "announce must be a non-empty string");
	if (raw.paths !== undefined) {
		if (!isPlainObject(raw.paths)) {
			add("paths", "paths must be an object");
		} else {
			const pathKeys = new Set(["plans", "specs", "reviews", "agents"]);
			for (const [k, v] of Object.entries(raw.paths)) {
				if (!pathKeys.has(k)) {
					add(`paths.${k}`, `unknown paths key '${k}'`);
					continue;
				}
				if (typeof v !== "string" || v.length === 0) {
					add(`paths.${k}`, `paths.${k} must be a non-empty string`);
					continue;
				}
				const pathCheck = inspectConsumerPath(process.cwd(), v, `paths.${k}`, { checkRealpath: false });
				if (!pathCheck.ok) add(`paths.${k}`, pathCheck.message);
			}
		}
	}
	if (raw.tracker !== undefined) {
		const t = raw.tracker;
		if (!isPlainObject(t)) {
			add("tracker", "tracker must be an object");
		} else {
			for (const k of Object.keys(t)) {
				if (k !== "repo" && k !== "board") add(`tracker.${k}`, `unknown tracker key '${k}'`);
			}
			if (typeof t.repo !== "string" || !REPO_RE.test(t.repo)) add("tracker.repo", "tracker.repo must be owner/name");
			if (!isPlainObject(t.board)) {
				add("tracker.board", "tracker.board must be an object");
			} else {
				for (const k of Object.keys(t.board)) {
					if (k !== "number" && k !== "url") add(`tracker.board.${k}`, `unknown tracker.board key '${k}'`);
				}
				if (!Number.isInteger(t.board.number) || t.board.number < 1) add("tracker.board.number", "tracker.board.number must be an integer >= 1");
				if (typeof t.board.url !== "string" || !/^https?:\/\/.+/.test(t.board.url)) add("tracker.board.url", "tracker.board.url must be an http(s) URL");
			}
		}
	}
	if (raw.hooks !== undefined) issues.push(...collectHookIssues(raw.hooks));
	return issues;
}

export function validateConfig(raw, p) {
	const issues = inspectConfig(raw);
	if (issues.length > 0) fail(`sdlc config ${p}: ${issues[0].message}`);
}

// FS1 (additive): hooks. Hand-rolled twin of the JSON Schema fragment (spec §1.1).
// Non-exiting collector; validateHooks remains the behaviour-compatible fatal wrapper.
function collectHookIssues(hooks) {
	const issues = [];
	const add = (path, message) => issues.push({ path, message });
	if (!isPlainObject(hooks)) {
		add("hooks", "hooks must be an object");
		return issues;
	}
	const phaseKeys = Object.keys(hooks);
	if (phaseKeys.length === 0) {
		add("hooks", "hooks must not be empty");
		return issues;
	}
	for (const phase of phaseKeys) {
		if (!HOOK_PHASES.includes(phase)) {
			add(`hooks.${phase}`, `unknown hooks phase '${phase}' (allowed: ${HOOK_PHASES.join(", ")})`);
			continue;
		}
		const ph = hooks[phase];
		if (!isPlainObject(ph)) {
			add(`hooks.${phase}`, `hooks.${phase} must be an object`);
			continue;
		}
		const timings = Object.keys(ph);
		if (timings.length === 0) {
			add(`hooks.${phase}`, `hooks.${phase} must have a 'before' or 'after' list`);
			continue;
		}
		for (const timing of timings) {
			if (timing !== "before" && timing !== "after") {
				add(`hooks.${phase}.${timing}`, `unknown key hooks.${phase}.${timing} (allowed: before, after)`);
				continue;
			}
			const list = ph[timing];
			if (!Array.isArray(list) || list.length === 0) {
				add(`hooks.${phase}.${timing}`, `hooks.${phase}.${timing} must be a non-empty array`);
				continue;
			}
			list.forEach((item, i) => {
				issues.push(...collectHookItemIssues(item, `hooks.${phase}.${timing}[${i}]`));
			});
		}
	}
	return issues;
}

export function validateHooks(hooks, where) {
	const issues = collectHookIssues(hooks);
	if (issues.length > 0) fail(`${where}: ${issues[0].message}`);
}

function collectHookItemIssues(item, at) {
	const issues = [];
	const add = (path, message) => issues.push({ path, message });
	if (!isPlainObject(item)) {
		add(at, `${at} must be an object`);
		return issues;
	}
	const keys = Object.keys(item).sort();
	const isRun = keys.length === 1 && keys[0] === "run";
	const isUse = keys.length === 2 && keys[0] === "do" && keys[1] === "use";
	if (!isRun && !isUse) {
		add(at, `${at} must be exactly {run} or {use, do}`);
		return issues;
	}
	if (isRun) {
		if (typeof item.run !== "string" || !SINGLE_LINE_RE.test(item.run)) add(`${at}.run`, `${at}.run must be a non-empty single-line string`);
	} else {
		if (typeof item.use !== "string" || !USE_RE.test(item.use)) add(`${at}.use`, `${at}.use must match ${USE_RE}`);
		if (typeof item.do !== "string" || !SINGLE_LINE_RE.test(item.do)) add(`${at}.do`, `${at}.do must be a non-empty single-line string`);
	}
	return issues;
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
		fail(`sdlc: cannot parse ${p}: ${e?.message || e}`);
	}
	validateModels(raw, p);
	return raw;
}

// Non-exiting FS2 issue collector (spec §2.5/§2.6). Same contract as inspectConfig.
export function inspectModels(raw) {
	const issues = [];
	const add = (path, message) => issues.push({ path, message });
	if (!isPlainObject(raw)) {
		add("", "must be a JSON object");
		return issues;
	}
	const allowed = new Set(["author_default", "rules", "phases", "$comment"]);
	for (const k of Object.keys(raw)) {
		if (!allowed.has(k)) add(k, `unknown key '${k}'`);
	}
	if (raw.author_default !== undefined && (typeof raw.author_default !== "string" || !PM_RE.test(raw.author_default))) {
		add("author_default", "author_default must be provider/model");
	}
	if (raw.rules !== undefined) {
		if (!isPlainObject(raw.rules)) {
			add("rules", "rules must be an object");
		} else {
			for (const k of Object.keys(raw.rules)) {
				if (k !== "exclude_author_vendor") add(`rules.${k}`, `unknown rules key '${k}'`);
			}
			if (raw.rules.exclude_author_vendor !== undefined && typeof raw.rules.exclude_author_vendor !== "boolean") {
				add("rules.exclude_author_vendor", "rules.exclude_author_vendor must be boolean");
			}
		}
	}
	if (!isPlainObject(raw.phases)) {
		add("phases", "phases must be an object");
		return issues;
	}
	const keys = Object.keys(raw.phases).sort();
	const want = [...PHASES].sort();
	if (keys.length !== want.length || keys.some((k, i) => k !== want[i])) {
		add("phases", `phases must contain exactly ${want.join(", ")}`);
		return issues;
	}
	for (const phase of PHASES) {
		const ph = raw.phases[phase];
		if (!isPlainObject(ph)) {
			add(`phases.${phase}`, `phases.${phase} must be an object`);
			continue;
		}
		for (const k of Object.keys(ph)) {
			if (k !== "min_panel" && k !== "prefer") add(`phases.${phase}.${k}`, `unknown key phases.${phase}.${k}`);
		}
		if (!Number.isInteger(ph.min_panel) || ph.min_panel < 1) add(`phases.${phase}.min_panel`, `phases.${phase}.min_panel must be an integer >= 1`);
		if (!Array.isArray(ph.prefer) || ph.prefer.length === 0) {
			add(`phases.${phase}.prefer`, `phases.${phase}.prefer must be a non-empty array`);
			continue;
		}
		ph.prefer.forEach((m, i) => {
			if (typeof m !== "string" || !PM_RE.test(m)) add(`phases.${phase}.prefer[${i}]`, `phases.${phase}.prefer entries must be provider/model`);
		});
	}
	return issues;
}

export function validateModels(raw, p) {
	const issues = inspectModels(raw);
	if (issues.length > 0) fail(`sdlc models ${p}: ${issues[0].message}`);
}
