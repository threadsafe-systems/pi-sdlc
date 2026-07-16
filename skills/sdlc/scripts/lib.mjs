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
const GATE_MODES = new Set(["panel", "advisory", "human", "off"]);

export const CONFIG_SCHEMA_VERSION = 2;
export const KNOWN_PAST_VERSIONS = new Set([1]);
export const REMEDY_SCHEMA_OLDER = (found) => `config schemaVersion ${found} predates this skill (requires ${CONFIG_SCHEMA_VERSION}) — run the setup-sdlc migration interactively to fold it forward, or pin pi-sdlc to a release before the schema-2 major`;
export const REMEDY_SCHEMA_NEWER = (found) => `config schemaVersion ${found} is newer than this skill (requires ${CONFIG_SCHEMA_VERSION}) — upgrade pi-sdlc, or run the pinned pi-sdlc release that wrote this config`;

// Hook phase vocabulary: the six lifecycle phases + '*' (every phase). This is
// DISTINCT from PHASES (the four review-panel ids) and must not be conflated.
export const HOOK_PHASES = ["brainstorm", "plan", "spec", "build", "implement", "pr", "*"];

export const CONFIG_DEFAULTS = Object.freeze({
	// Missing manifests retain the pre-v2 default behavior; this is not a
	// persisted schema declaration and never enters the version seam.
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

// Reviewer × arbiter is the extensibility seam for lifecycle gate modes.
// Keep raw mode interpretation here; callers branch only on these fields.
export function decomposeGateMode(value) {
	const table = {
		panel: { reviewer: "panel", arbiter: "human", blocking: true },
		advisory: { reviewer: "panel", arbiter: "none", blocking: false },
		human: { reviewer: "none", arbiter: "human", blocking: true },
		off: { reviewer: "none", arbiter: "none", blocking: false },
	};
	if (!Object.hasOwn(table, value)) throw new RangeError(`unknown gate mode ${JSON.stringify(value)}`);
	return table[value];
}

// Pure, total version seam shared by every version-sensitive consumer.
export function classifyConfigVersion(raw) {
	if (!isPlainObject(raw)) return { kind: "invalid" };
	const version = raw.schemaVersion;
	if (!Number.isInteger(version) || version < 1) return { kind: "invalid" };
	if (version === CONFIG_SCHEMA_VERSION) return { kind: "current" };
	if (KNOWN_PAST_VERSIONS.has(version)) return { kind: "older", version };
	if (version > CONFIG_SCHEMA_VERSION) return { kind: "newer", version };
	return { kind: "invalid" };
}

// FS1: read + validate sdlc.config.json. The shared loader owns detection only:
// it never prompts and never writes. Migration IO uses the scoped raw reader.
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
	const classification = classifyConfigVersion(raw);
	if (classification.kind === "older") fail(`sdlc: ${REMEDY_SCHEMA_OLDER(classification.version)}`);
	if (classification.kind === "newer") fail(`sdlc: ${REMEDY_SCHEMA_NEWER(classification.version)}`);
	validateConfig(raw, p);
	return {
		schemaVersion: raw.schemaVersion,
		prefix: raw.prefix,
		labelPrefix: raw.labelPrefix,
		announce: raw.announce,
		paths: { ...CONFIG_DEFAULTS.paths, ...(raw.paths ?? {}) },
		tracker: raw.tracker,
		hooks: raw.hooks,
		...(raw.lifecycle === undefined ? {} : { lifecycle: raw.lifecycle }),
		...(raw.enforcement === undefined ? {} : { enforcement: raw.enforcement }),
		...(raw.panels === undefined ? {} : { panels: raw.panels }),
	};
}

// Setup/migration-only bypass. Absence and malformation remain distinct so a
// malformed consumer file can never be mistaken for an absent roster.
export function readConfigRawForMigration(root) {
	const readRaw = (p) => {
		if (!existsSync(p)) return { status: "absent" };
		let text = "";
		try {
			text = readFileSync(p, "utf8");
			return { status: "parsed", value: JSON.parse(text), text };
		} catch (error) {
			return { status: "malformed", error: String(error?.message ?? error), text };
		}
	};
	const dir = join(root, ".pi", "sdlc");
	return {
		config: readRaw(join(dir, "sdlc.config.json")),
		models: readRaw(join(dir, "sdlc.models.json")),
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
	const allowed = new Set(["schemaVersion", "prefix", "labelPrefix", "announce", "paths", "tracker", "hooks", "lifecycle", "enforcement", "panels"]);
	for (const k of Object.keys(raw)) {
		if (!allowed.has(k)) add(k, `unknown key '${k}'`);
	}
	if (raw.schemaVersion !== CONFIG_SCHEMA_VERSION) add("schemaVersion", `schemaVersion must be ${CONFIG_SCHEMA_VERSION} (got ${JSON.stringify(raw.schemaVersion)})`);
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
				const pathCheck = inspectConsumerPath("/", v, `paths.${k}`, { checkRealpath: false });
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
	if (raw.lifecycle !== undefined) issues.push(...collectLifecycleIssues(raw.lifecycle));
	if (raw.enforcement !== undefined && raw.enforcement !== "strict" && raw.enforcement !== "preference") {
		add("enforcement", "enforcement must be one of strict, preference");
	}
	if (raw.panels !== undefined) issues.push(...collectPanelIssues(raw.panels));
	return issues;
}

function collectPanelIssues(panels) {
	const issues = [];
	const add = (path, message) => issues.push({ path, message });
	if (!isPlainObject(panels)) {
		add("panels", "panels must be an object");
		return issues;
	}
	const allowed = new Set(["$comment", "authorDefault", "rules", "phases"]);
	for (const key of Object.keys(panels)) {
		if (!allowed.has(key)) add(`panels.${key}`, `unknown panels key '${key}'`);
	}
	if (panels.$comment !== undefined && typeof panels.$comment !== "string") add("panels.$comment", "panels.$comment must be a string");
	if (panels.authorDefault !== undefined && (typeof panels.authorDefault !== "string" || !PM_RE.test(panels.authorDefault))) {
		add("panels.authorDefault", "panels.authorDefault must be provider/model");
	}
	if (panels.rules !== undefined) {
		if (!isPlainObject(panels.rules)) {
			add("panels.rules", "panels.rules must be an object");
		} else {
			for (const key of Object.keys(panels.rules)) {
				if (key !== "excludeAuthorVendor") add(`panels.rules.${key}`, `unknown panels.rules key '${key}'`);
			}
			if (panels.rules.excludeAuthorVendor !== undefined && typeof panels.rules.excludeAuthorVendor !== "boolean") {
				add("panels.rules.excludeAuthorVendor", "panels.rules.excludeAuthorVendor must be boolean");
			}
		}
	}
	if (!isPlainObject(panels.phases)) {
		add("panels.phases", "panels.phases must be an object");
		return issues;
	}
	for (const key of Object.keys(panels.phases)) {
		if (!PHASES.includes(key)) add(`panels.phases.${key}`, `unknown panels phase '${key}'`);
	}
	for (const phase of PHASES) {
		const value = panels.phases[phase];
		const at = `panels.phases.${phase}`;
		if (value === undefined) {
			add(at, `${at} is required`);
			continue;
		}
		if (!isPlainObject(value)) {
			add(at, `${at} must be an object`);
			continue;
		}
		for (const key of Object.keys(value)) {
			if (key !== "minVendor" && key !== "prefer") add(`${at}.${key}`, `unknown key ${at}.${key}`);
		}
		if (value.minVendor !== undefined && (!Number.isInteger(value.minVendor) || value.minVendor < 1)) {
			add(`${at}.minVendor`, `${at}.minVendor must be an integer >= 1`);
		}
		if (!Array.isArray(value.prefer) || value.prefer.length === 0) {
			add(`${at}.prefer`, `${at}.prefer must be a non-empty array`);
			continue;
		}
		value.prefer.forEach((model, index) => {
			if (typeof model !== "string" || !PM_RE.test(model)) add(`${at}.prefer[${index}]`, `${at}.prefer entries must be provider/model`);
		});
	}
	return issues;
}

function collectLifecycleIssues(lifecycle) {
	const issues = [];
	const add = (path, message) => issues.push({ path, message });
	if (!isPlainObject(lifecycle)) {
		add("lifecycle", "lifecycle must be an object");
		return issues;
	}
	const allowed = new Set(["profile", "gates", "phases", "tracker", "taskValidation", "tracks"]);
	for (const k of Object.keys(lifecycle)) {
		if (!allowed.has(k)) add("lifecycle", `unknown key '${k}'`);
	}
	if (!new Set(["solo", "standard", "full", "custom"]).has(lifecycle.profile)) {
		add("lifecycle.profile", "lifecycle.profile must be one of solo, standard, full, custom");
	}
	if (lifecycle.gates !== undefined) collectLifecycleGates(lifecycle.gates, add);
	collectLifecycleSection(lifecycle.phases, "phases", new Set(["mergePlanSpec"]), add, (key, value) => {
		if (key === "mergePlanSpec" && typeof value !== "boolean") add("lifecycle.phases.mergePlanSpec", "lifecycle.phases.mergePlanSpec must be a boolean");
	});
	collectLifecycleSection(lifecycle.tracker, "tracker", new Set(["publishThreshold"]), add, (key, value) => {
		if (key === "publishThreshold" && value !== "never" && (!Number.isInteger(value) || value < 1)) {
			add("lifecycle.tracker.publishThreshold", "lifecycle.tracker.publishThreshold must be an integer >= 1 or 'never'");
		}
	});
	collectLifecycleSection(lifecycle.taskValidation, "taskValidation", new Set(["mode"]), add, (key, value) => {
		if (key === "mode" && !new Set(["subagent", "self", "off"]).has(value)) add("lifecycle.taskValidation.mode", "lifecycle.taskValidation.mode must be one of subagent, self, off");
	});
	collectLifecycleSection(lifecycle.tracks, "tracks", new Set(["defaultTrack"]), add, (key, value) => {
		if (key === "defaultTrack" && !new Set(["irreversible", "reversible"]).has(value)) add("lifecycle.tracks.defaultTrack", "lifecycle.tracks.defaultTrack must be one of irreversible, reversible");
	});
	if (lifecycle.phases?.mergePlanSpec === true && isPlainObject(lifecycle.gates) && lifecycle.gates.spec_review !== undefined) {
		add("lifecycle.gates.spec_review", "lifecycle.gates.spec_review must be absent when lifecycle.phases.mergePlanSpec is true");
	}
	return issues;
}

function collectLifecycleSection(value, name, allowed, add, validateEntry) {
	if (value === undefined) return;
	const at = `lifecycle.${name}`;
	if (!isPlainObject(value)) {
		add(at, `${at} must be an object`);
		return;
	}
	for (const [key, entry] of Object.entries(value)) {
		if (!allowed.has(key)) add(at, `unknown key '${key}'`);
		else validateEntry(key, entry);
	}
}

function collectLifecycleGates(gates, add) {
	if (!isPlainObject(gates)) {
		add("lifecycle.gates", "lifecycle.gates must be an object");
		return;
	}
	const allowed = new Set(["brainstorm", "plan_review", "spec_review", "pr_review"]);
	for (const key of Object.keys(gates)) {
		if (!allowed.has(key)) add("lifecycle.gates", `unknown key '${key}'`);
	}
	for (const gate of ["brainstorm", "plan_review", "spec_review", "pr_review"]) {
		if (gates[gate] !== undefined) collectLifecycleGate(gate, gates[gate], add);
	}
}

function collectLifecycleGate(gate, value, add) {
	const at = `lifecycle.gates.${gate}`;
	if (!isPlainObject(value)) {
		add(at, `${at} must be an object`);
		return;
	}
	const allowed = gate === "brainstorm" ? new Set(["mode"]) : new Set(["mode", "minPanel"]);
	for (const key of Object.keys(value)) {
		if (!allowed.has(key)) add(at, `unknown key '${key}'`);
	}
	if (!("mode" in value)) add(`${at}.mode`, `${at}.mode is required`);
	else validateLifecycleGateMode(gate, value.mode, add);
	if (gate !== "brainstorm" && value.minPanel !== undefined && (!Number.isInteger(value.minPanel) || value.minPanel < 1)) {
		add(`${at}.minPanel`, `${at}.minPanel must be an integer >= 1`);
	}
}

function validateLifecycleGateMode(gate, mode, add) {
	const at = `lifecycle.gates.${gate}.mode`;
	if (gate === "brainstorm") {
		if (!new Set(["human", "off"]).has(mode)) add(at, `${at} must be one of human, off`);
		return;
	}
	if (typeof mode === "string") {
		if (!GATE_MODES.has(mode)) add(at, `${at} must be one of panel, advisory, human, off`);
		return;
	}
	if (gate === "pr_review" || !isPlainObject(mode)) {
		add(at, `${at} must be a gate mode${gate === "pr_review" ? "" : " or per-track object"}`);
		return;
	}
	const allowedTracks = gate === "spec_review" ? new Set(["irreversible"]) : new Set(["irreversible", "reversible"]);
	if (Object.keys(mode).length === 0) add(at, `${at} must contain at least one track`);
	for (const [track, trackMode] of Object.entries(mode)) {
		if (!allowedTracks.has(track)) add(at, `unknown track '${track}'`);
		else if (!GATE_MODES.has(trackMode)) add(`${at}.${track}`, `${at}.${track} must be one of panel, advisory, human, off`);
	}
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
