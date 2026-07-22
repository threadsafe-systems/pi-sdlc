#!/usr/bin/env node
// setup-sdlc.mjs — config and adoption-bundle scaffolder.
// Bundle mode is deterministic, offline, and refuses consumer-authored assets.

import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { CONFIG_DEFAULTS, CONFIG_SCHEMA_VERSION, HOOK_PHASES, REMEDY_SCHEMA_NEWER, REMEDY_SCHEMA_OLDER, USE_RE, classifyConfigVersion, inspectConfig, resolveRoot } from "./lib.mjs";
import { write as writeConfigDoc } from "./config-doc.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = resolve(SCRIPT_DIR, "..");
function packageRepository() {
	try {
		const metadata = JSON.parse(readFileSync(join(PACKAGE_DIR, "..", "..", "package.json"), "utf8"));
		const repository = typeof metadata.repository === "string" ? metadata.repository : metadata.repository?.url;
		return typeof repository === "string"
			? repository
					.replace(/^git\+/, "")
					.replace(/^https?:\/\/github\.com\//, "")
					.replace(/\.git$/, "")
			: null;
	} catch {
		return null;
	}
}
const RUN_HOOK_WARNING = "sdlc: WARNING — 'run' hooks execute arbitrary shell commands with the agent's\nprivileges from the committed config. Only commit hooks you trust, exactly as\nyou would for .pi/prompts or project settings.";
const PROMPT_BASES = ["adversary-plan", "adversary-spec", "adversary-review", "validator-task"];
const USAGE =
	"usage: setup-sdlc.sh [--preset solo|standard|full] [--review-brainstorm human|off] [--review-design <validate>/<approve>] [--review-code <validate>/<approve>] (validate=panel|skip, approve=human|agent) [--review-tasks subagent|self|off] [--panel-size N] [--on-shortfall proceed|fail] [--separate-spec true|false] [--publish-to-tracker N|never] [--default-track irreversible|reversible] [--override track:dial:value] [--prefix V] [--label-prefix V] [--announce V] [--tracker-repo o/n --tracker-board-number N --tracker-board-url U] [--hook-run S] [--hook-use S] [--seed-panels] [--with-ci-workflow] [--copy-prompts] [--format text|json] [--force] [--yes] [--config DIR|--repo-root DIR]";
const RETIRED_WITH_MODELS = "setup-sdlc: --with-models is retired — the panel roster lives in .pi/sdlc/sdlc.config.json (schemaVersion 4); use --seed-panels";

// v4 answer bundles. Presets are NEVER persisted — they seed the explicit dials
// that setup writes. Not choosing a preset IS "custom". design/code are
// { validate, approve } gate-dial objects.
export const PRESETS = Object.freeze({
	solo: {
		review: { brainstorm: "off", design: { validate: "skip", approve: "human" }, code: { validate: "panel", approve: "agent" }, tasks: "self", panelSize: 1, onShortfall: "proceed" },
		shape: { separateSpec: false, publishToTracker: "never", defaultTrack: "irreversible" },
	},
	standard: {
		review: { brainstorm: "human", design: { validate: "skip", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "proceed" },
		shape: { separateSpec: false, publishToTracker: 4, defaultTrack: "irreversible" },
	},
	full: {
		review: { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "proceed" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
		overrides: { reversible: { review: { design: { validate: "skip" } } } },
	},
});

// Parse a "<validate>/<approve>" gate-dial flag value into an object. For a base
// dial both halves are required; for a partial override either half may be empty
// (but at least one must be set).
export function parseGateDial(raw, { partial = false } = {}) {
	if (typeof raw !== "string" || !raw.includes("/")) throw new SetupError(`setup-sdlc: gate dial must be "<validate>/<approve>" (got ${JSON.stringify(raw)})`);
	const slash = raw.indexOf("/");
	const validate = raw.slice(0, slash);
	const approve = raw.slice(slash + 1);
	const dial = {};
	if (validate !== "") {
		if (validate !== "panel" && validate !== "skip") throw new SetupError(`setup-sdlc: validate must be panel|skip (got ${JSON.stringify(validate)})`);
		dial.validate = validate;
	} else if (!partial) throw new SetupError(`setup-sdlc: validate is required in "<validate>/<approve>" (got ${JSON.stringify(raw)})`);
	if (approve !== "") {
		if (approve !== "human" && approve !== "agent") throw new SetupError(`setup-sdlc: approve must be human|agent (got ${JSON.stringify(approve)})`);
		dial.approve = approve;
	} else if (!partial) throw new SetupError(`setup-sdlc: approve is required in "<validate>/<approve>" (got ${JSON.stringify(raw)})`);
	if (partial && Object.keys(dial).length === 0) throw new SetupError(`setup-sdlc: a partial gate-dial override must set validate and/or approve (got ${JSON.stringify(raw)})`);
	return dial;
}

class SetupError extends Error {
	constructor(message, code = 2) {
		super(message);
		this.code = code;
	}
}

function needValue(argv, index, name) {
	const value = argv[index];
	if (value === undefined) throw new SetupError(`setup-sdlc: ${name} requires a value`);
	return value;
}

function parseHookRun(raw) {
	const parts = raw.split(":");
	if (parts.length < 3 || parts.slice(2).join(":").length === 0 || /[\r\n]/.test(parts.slice(2).join(":"))) throw new SetupError(`setup-sdlc: --hook-run must be "<phase>:<before|after>:<command>" (got ${JSON.stringify(raw)})`);
	return { phase: parts[0], timing: parts[1], item: { run: parts.slice(2).join(":") } };
}
function parseHookUse(raw) {
	const parts = raw.split(":");
	if (parts.length < 5) throw new SetupError(`setup-sdlc: --hook-use must be "<phase>:<before|after>:<kind>:<name>:<do>" (got ${JSON.stringify(raw)})`);
	const use = `${parts[2]}:${parts[3]}`;
	if (!USE_RE.test(use) || parts.slice(4).join(":").length === 0 || /[\r\n]/.test(parts.slice(4).join(":"))) throw new SetupError(`setup-sdlc: --hook-use 'use' or do must be valid`);
	return { phase: parts[0], timing: parts[1], item: { use, do: parts.slice(4).join(":") } };
}
// --override track:dial:value — per-track dials are design|code|tasks|panelSize
// only (brainstorm/onShortfall carry no per-track meaning).
function parseOverride(raw) {
	const parts = raw.split(":");
	if (parts.length !== 3) throw new SetupError(`setup-sdlc: --override must be "<track>:<dial>:<value>" (got ${JSON.stringify(raw)})`);
	const [track, dial, value] = parts;
	if (track !== "irreversible" && track !== "reversible") throw new SetupError(`setup-sdlc: --override track must be irreversible or reversible (got ${JSON.stringify(track)})`);
	if (dial === "design" || dial === "code") {
		return { track, dial, value: parseGateDial(value, { partial: true }) };
	}
	if (dial === "tasks") {
		if (!new Set(["subagent", "self", "off"]).has(value)) throw new SetupError(`setup-sdlc: --override tasks value must be subagent|self|off (got ${JSON.stringify(value)})`);
		return { track, dial, value };
	}
	if (dial === "panelSize") {
		const n = Number(value);
		if (!Number.isInteger(n) || n < 1) throw new SetupError(`setup-sdlc: --override panelSize value must be an integer >= 1 (got ${JSON.stringify(value)})`);
		return { track, dial, value: n };
	}
	throw new SetupError(`setup-sdlc: --override dial must be design|code|tasks|panelSize (got ${JSON.stringify(dial)}); brainstorm and onShortfall are not per-track)`);
}
function addHook(hooks, phase, timing, item) {
	if (!HOOK_PHASES.includes(phase)) throw new SetupError(`setup-sdlc: unknown hook phase '${phase}' (allowed: ${HOOK_PHASES.join(", ")})`);
	if (timing !== "before" && timing !== "after") throw new SetupError(`setup-sdlc: unknown hook timing '${timing}' (allowed: before, after)`);
	hooks[phase] ??= {};
	hooks[phase][timing] ??= [];
	hooks[phase][timing].push(item);
}
function buildHooks(specs) {
	const hooks = {};
	let hasRun = false;
	for (const spec of specs) {
		const parsed = spec.kind === "run" ? parseHookRun(spec.raw) : parseHookUse(spec.raw);
		addHook(hooks, parsed.phase, parsed.timing, parsed.item);
		if (spec.kind === "run") hasRun = true;
	}
	return { hooks, hasRun };
}
function assembleConfig(opts, tracker, hooks) {
	const config = {
		schemaVersion: CONFIG_SCHEMA_VERSION,
		prefix: opts.prefix ?? CONFIG_DEFAULTS.prefix,
		labelPrefix: opts.labelPrefix ?? CONFIG_DEFAULTS.labelPrefix,
		announce: opts.announce ?? CONFIG_DEFAULTS.announce,
	};
	if (tracker) config.tracker = tracker;
	if (Object.keys(hooks).length) config.hooks = hooks;
	const { review, shape, overrides } = reviewShapeFromOptions(opts);
	config.review = review;
	config.shape = shape;
	if (overrides) config.overrides = overrides;
	return config;
}

// Build the explicit v4 review/shape/overrides from a seed + per-dial flag
// overrides + repeatable --override entries. The seed is the chosen preset
// (or standard) for a fresh write, or an existing config's intent blocks when
// patching a single dial. Presets are never persisted.
function reviewShapeFromOptions(opts, base) {
	const seed = base ?? structuredClone(PRESETS[opts.preset ?? "standard"]);
	const review = { ...seed.review };
	const shape = { ...seed.shape };
	let overrides = seed.overrides ? structuredClone(seed.overrides) : undefined;
	if (opts.reviewBrainstorm !== undefined) review.brainstorm = opts.reviewBrainstorm;
	if (opts.reviewDesign !== undefined) review.design = opts.reviewDesign;
	if (opts.reviewCode !== undefined) review.code = opts.reviewCode;
	if (opts.reviewTasks !== undefined) review.tasks = opts.reviewTasks;
	if (opts.panelSize !== undefined) review.panelSize = opts.panelSize;
	if (opts.onShortfall !== undefined) review.onShortfall = opts.onShortfall;
	if (opts.separateSpec !== undefined) shape.separateSpec = opts.separateSpec;
	if (opts.publishToTracker !== undefined) shape.publishToTracker = opts.publishToTracker;
	if (opts.defaultTrack !== undefined) shape.defaultTrack = opts.defaultTrack;
	for (const { track, dial, value } of opts.overrides ?? []) {
		overrides ??= {};
		overrides[track] ??= { review: {} };
		overrides[track].review ??= {};
		overrides[track].review[dial] = value;
	}
	return { review, shape, overrides };
}
function trackerFromFlags(opts) {
	const values = [opts.trackerRepo, opts.trackerBoardNumber, opts.trackerBoardUrl];
	if (!values.some((value) => value !== undefined)) return undefined;
	if (values.some((value) => value === undefined)) throw new SetupError("setup-sdlc: tracker flags are all-or-none");
	const number = Number(opts.trackerBoardNumber);
	if (!Number.isInteger(number)) throw new SetupError("setup-sdlc: --tracker-board-number must be an integer");
	return { repo: opts.trackerRepo, board: { number, url: opts.trackerBoardUrl } };
}
function parseArgs(argv) {
	const opts = { hookSpecs: [], overrides: [], format: "text", force: false, yes: false, seedPanels: false, withCiWorkflow: false, copyPrompts: false, runFlag: false, rootFlagOnly: true };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const value = (name = a) => needValue(argv, ++i, name);
		switch (a) {
			case "--preset":
				opts.preset = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--review-brainstorm":
				opts.reviewBrainstorm = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--review-design":
				opts.reviewDesign = parseGateDial(value());
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--review-code":
				opts.reviewCode = parseGateDial(value());
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--review-tasks":
				opts.reviewTasks = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--panel-size": {
				const n = Number(value());
				if (!Number.isInteger(n) || n < 1) throw new SetupError("setup-sdlc: --panel-size must be an integer >= 1");
				opts.panelSize = n;
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			}
			case "--on-shortfall":
				opts.onShortfall = value();
				if (opts.onShortfall !== "proceed" && opts.onShortfall !== "fail") throw new SetupError("setup-sdlc: --on-shortfall must be proceed or fail");
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--separate-spec": {
				const v = value();
				if (v !== "true" && v !== "false") throw new SetupError("setup-sdlc: --separate-spec must be true or false");
				opts.separateSpec = v === "true";
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			}
			case "--publish-to-tracker": {
				const v = value();
				if (v === "never") opts.publishToTracker = "never";
				else {
					const n = Number(v);
					if (!Number.isInteger(n) || n < 1) throw new SetupError("setup-sdlc: --publish-to-tracker must be an integer >= 1 or never");
					opts.publishToTracker = n;
				}
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			}
			case "--default-track":
				opts.defaultTrack = value();
				if (opts.defaultTrack !== "irreversible" && opts.defaultTrack !== "reversible") throw new SetupError("setup-sdlc: --default-track must be irreversible or reversible");
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--override": {
				opts.overrides.push(parseOverride(value()));
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			}
			case "--profile":
				throw new SetupError("setup-sdlc: --profile is retired — use --preset solo|standard|full (and per-dial flags); there is no persisted profile in schemaVersion 4");
			case "--lifecycle-json":
				throw new SetupError("setup-sdlc: --lifecycle-json is retired — set dials via --review-*/--panel-size/--on-shortfall/--separate-spec/--publish-to-tracker/--default-track/--override");
			case "--enforcement":
				throw new SetupError("setup-sdlc: --enforcement is retired — use --on-shortfall proceed|fail");
			case "--prefix":
				opts.prefix = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--label-prefix":
				opts.labelPrefix = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--announce":
				opts.announce = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--tracker-repo":
				opts.trackerRepo = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--tracker-board-number":
				opts.trackerBoardNumber = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--tracker-board-url":
				opts.trackerBoardUrl = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--hook-run":
				opts.hookSpecs.push({ kind: "run", raw: value() });
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--hook-use":
				opts.hookSpecs.push({ kind: "use", raw: value() });
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--with-models":
				throw new SetupError(RETIRED_WITH_MODELS);
			case "--seed-panels":
				opts.seedPanels = true;
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--with-ci-workflow":
				opts.withCiWorkflow = true;
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--copy-prompts":
				opts.copyPrompts = true;
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--format":
				opts.format = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				if (opts.format !== "text" && opts.format !== "json") throw new SetupError("setup-sdlc: --format must be text or json");
				break;
			case "--force":
				opts.force = true;
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--yes":
				opts.yes = true;
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--config":
				opts.config = value();
				break;
			case "--repo-root":
				opts.repoRoot = value();
				break;
			case "--help":
			case "-h":
				opts.help = true;
				break;
			default:
				throw new SetupError(`setup-sdlc: unexpected argument: ${a}`);
		}
	}
	if (opts.config !== undefined && opts.repoRoot !== undefined) throw new SetupError("setup-sdlc: --config and --repo-root are mutually exclusive");
	if (opts.help) return opts;
	if (opts.preset === "custom") throw new SetupError("setup-sdlc: --preset custom is retired — omit --preset and set dials via flags (not choosing a preset IS custom)");
	if (opts.preset !== undefined && !new Set(["solo", "standard", "full"]).has(opts.preset)) throw new SetupError("setup-sdlc: --preset must be solo, standard, or full");
	return opts;
}
function jsonMode(argv) {
	return argv.some((value, index) => value === "--format" && argv[index + 1] === "json");
}
function source(path) {
	try {
		return readFileSync(path, "utf8");
	} catch (error) {
		throw new SetupError(`setup-sdlc: package asset unavailable: ${path} (${error.message})`);
	}
}
function directoryEntries(path) {
	if (!existsSync(path)) return [];
	try {
		return readdirSync(path, { withFileTypes: true });
	} catch (error) {
		throw new SetupError(`setup-sdlc: cannot inspect CI path: ${path} (${error.message})`);
	}
}
function isRegularFile(path) {
	try {
		return lstatSync(path).isFile();
	} catch {
		return false;
	}
}
function existsCi(root, target) {
	const workflows = join(root, ".github", "workflows");
	if (directoryEntries(workflows).some((entry) => entry.isFile() && /\.ya?ml$/.test(entry.name) && entry.name !== target)) return true;
	return [".gitlab-ci.yml", ".circleci/config.yml", "azure-pipelines.yml", "Jenkinsfile", ".travis.yml", "bitbucket-pipelines.yml"].some((file) => isRegularFile(join(root, file))) || directoryEntries(join(root, ".buildkite")).some((entry) => entry.isFile());
}
function rootPrefix(root) {
	try {
		const top = execFileSync("git", ["-C", root, "rev-parse", "--show-toplevel"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
		const rel = relative(resolve(top), resolve(root));
		return rel === "" ? "" : rel.split(sep).join("/");
	} catch {
		return null;
	}
}
function structural(target, kind) {
	if (!existsSync(target)) return false;
	const text = readFileSync(target, "utf8");
	if (kind === "pr-template") {
		const blocks = [...text.matchAll(/```sdlc[ \t]*\r?\n([\s\S]*?)```/g)];
		if (blocks.length !== 1) return false;
		const block = blocks[0][1];
		const track = /^track: (irreversible|reversible|none)$/m.exec(block)?.[1];
		if (!track) return false;
		const hasSlug = /^slug: /m.test(block);
		const hasReason = /^reason: /m.test(block);
		return track === "none" ? hasReason && !hasSlug : hasSlug && !hasReason;
	}
	if (kind === "ci-workflow") {
		const repository = packageRepository();
		const repositoryLine = repository && new RegExp(`repository:\\s*${repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(text);
		return Boolean(repositoryLine && /ref:\s*\S+/.test(text) && /node\s+\S*check-lifecycle\.mjs/.test(text));
	}
	return true;
}
function asset(id, target, kind, content, report) {
	if (!existsSync(target)) {
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, content);
		report.assets.push({ id, action: "created", message: `created ${target}` });
		return;
	}
	if (structural(target, kind)) report.assets.push({ id, action: "retained", message: `retained recognised consumer asset ${target}` });
	else report.assets.push({ id, action: "refused", message: `refused existing consumer asset ${target}`, remediation: `add the required ${kind} structure or delete ${target} and re-run setup` });
}
function packageRef() {
	if (process.env.SDLC_PACKAGE_REF) return process.env.SDLC_PACKAGE_REF;
	try {
		const ref = execFileSync("git", ["-C", PACKAGE_DIR, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
		if (ref) return ref;
	} catch {
		// A package without an immutable ref must not generate a mutable workflow.
	}
	throw new SetupError("setup-sdlc: cannot determine an immutable pi-sdlc ref; set SDLC_PACKAGE_REF");
}
function checkReference(id, path, report) {
	if (existsSync(path)) report.references.push({ id, status: "ok", message: `resolved ${path}` });
	else report.references.push({ id, status: "broken", message: `package asset unavailable: ${path}` });
}
function checkPromptReferences(paths, report) {
	const missing = paths.filter((path) => !existsSync(path));
	if (missing.length === 0) report.references.push({ id: "reference.prompts", status: "ok", message: `resolved ${paths.length} package prompt sources` });
	else report.references.push({ id: "reference.prompts", status: "broken", message: `package prompt sources unavailable: ${missing.join(", ")}` });
}
function targetParentConflict(root, target) {
	const rootResolved = resolve(root);
	let parent = dirname(target);
	while (parent.startsWith(rootResolved) && parent !== rootResolved) {
		if (existsSync(parent)) {
			try {
				const realParent = realpathSync(parent);
				const relativeParent = relative(rootResolved, realParent);
				if (relativeParent.startsWith("..") || relativeParent.includes(`${sep}..`)) return `target parent escapes the consumer root: ${parent}`;
				readdirSync(parent, { withFileTypes: true });
			} catch (error) {
				return `target parent cannot be inspected: ${parent} (${error.message})`;
			}
		}
		parent = dirname(parent);
	}
	if (
		existsSync(target) ||
		(() => {
			try {
				lstatSync(target);
				return true;
			} catch {
				return false;
			}
		})()
	) {
		try {
			const stat = lstatSync(target);
			if (stat.isDirectory()) return `target is a directory: ${target}`;
			if (stat.isSymbolicLink()) return `target is a symbolic link: ${target}`;
		} catch (error) {
			return `target cannot be inspected: ${target} (${error.message})`;
		}
	}
	return null;
}
function renderReport(report) {
	if (report.format === "json") return `${JSON.stringify({ schemaVersion: 2, root: report.root, exitCode: report.exitCode, ...(report.error ? { error: report.error } : {}), references: report.references, assets: report.assets }, null, 2)}\n`;
	const lines = [`schema-version: 2`, `root: ${report.root}`, `exit-code: ${report.exitCode}`];
	for (const ref of report.references) lines.push(`reference: ${ref.id} ${ref.status} — ${ref.message}`);
	for (const item of report.assets) {
		lines.push(`asset: ${item.id} ${item.action} — ${item.message}`);
		if (item.remediation) lines.push(`remediation: ${item.id} — ${item.remediation}`);
	}
	return `${lines.join("\n")}\n`;
}
// Classify an existing config file for the clean-break refusal (no migration).
function existingConfigVersion(configTarget) {
	if (!existsSync(configTarget)) return null;
	try {
		return classifyConfigVersion(JSON.parse(readFileSync(configTarget, "utf8")));
	} catch {
		return { kind: "malformed" };
	}
}

function writeBundle(root, opts, cfg, hooks, tracker, residueAssets = []) {
	const report = { root, format: opts.format, exitCode: 0, references: [], assets: [...residueAssets] };
	const configTarget = join(root, ".pi", "sdlc", "sdlc.config.json");
	const templateSource = join(PACKAGE_DIR, "assets", "pull_request_template.md");
	const workflowSource = join(PACKAGE_DIR, "assets", "sdlc-lifecycle.yml");
	let workflowContent;
	const checkerSource = join(SCRIPT_DIR, "check-lifecycle.mjs");
	const configExampleSource = join(PACKAGE_DIR, "schema", "sdlc.config.example.json");
	checkReference("reference.pr-template", templateSource, report);
	if (opts.withCiWorkflow) checkReference("reference.ci-workflow", workflowSource, report);
	const promptSources = opts.copyPrompts ? PROMPT_BASES.map((base) => join(PACKAGE_DIR, "prompts", `${base}.prompt.md`)) : [];
	if (opts.copyPrompts) checkPromptReferences(promptSources, report);
	if (opts.seedPanels) checkReference("reference.panels-example", configExampleSource, report);
	checkReference("reference.checker", checkerSource, report);
	if (report.references.some((ref) => ref.status === "broken")) {
		report.exitCode = 2;
		report.error = "one or more package references could not be resolved";
		return report;
	}
	// Read every package source before the first write. Existence checks alone
	// do not prove that a source is readable (a directory or unreadable file can
	// still exist), and a failed late read would otherwise leave a partial bundle.
	const templateContent = source(templateSource);
	source(checkerSource);
	const promptContents = Object.fromEntries(promptSources.map((path) => [path, source(path)]));
	let configExample;
	if (opts.seedPanels) {
		try {
			configExample = JSON.parse(source(configExampleSource));
		} catch (error) {
			throw new SetupError(`setup-sdlc: cannot parse packaged config example: ${error.message}`);
		}
		cfg.panels = structuredClone(configExample.panels);
	}
	if (opts.withCiWorkflow) workflowContent = source(workflowSource).replace("__PI_SDLC_REF__", packageRef());
	const configIssues = inspectConfig(cfg);
	if (configIssues.length > 0) {
		report.exitCode = 2;
		report.error = `assembled configuration is invalid: ${configIssues[0].message}`;
		return report;
	}
	const targets = [configTarget, join(root, ".github", "pull_request_template.md"), ...(opts.withCiWorkflow ? [join(root, ".github", "workflows", "sdlc-lifecycle.yml")] : []), ...(opts.copyPrompts ? PROMPT_BASES.map((base) => join(root, ".pi", "sdlc", "prompts", `${base}.prompt.md`)) : [])];
	for (const target of targets) {
		const conflict = targetParentConflict(root, target);
		if (conflict) {
			report.exitCode = 2;
			report.error = conflict;
			return report;
		}
	}
	const ciDetected = opts.withCiWorkflow ? existsCi(root, "sdlc-lifecycle.yml") : false;
	const configExists = existsSync(configTarget);
	const existingVersion = existingConfigVersion(configTarget);
	const intentFlags =
		opts.preset !== undefined ||
		opts.reviewBrainstorm !== undefined ||
		opts.reviewDesign !== undefined ||
		opts.reviewCode !== undefined ||
		opts.reviewTasks !== undefined ||
		opts.panelSize !== undefined ||
		opts.onShortfall !== undefined ||
		opts.separateSpec !== undefined ||
		opts.publishToTracker !== undefined ||
		opts.defaultTrack !== undefined ||
		opts.overrides.length > 0;
	const identityFlags = opts.prefix !== undefined || opts.labelPrefix !== undefined || opts.announce !== undefined || opts.seedPanels || tracker !== undefined || (hooks && Object.keys(hooks).length > 0);
	const configMutating = intentFlags || identityFlags;
	if (!configExists) {
		mkdirSync(dirname(configTarget), { recursive: true });
		writeFileSync(configTarget, `${JSON.stringify(cfg, null, 2)}\n`);
		report.assets.push({ id: "config", action: "created", message: `created ${configTarget}` });
	} else if (existingVersion && (existingVersion.kind === "malformed" || existingVersion.kind === "invalid")) {
		// Never overwrite a config we cannot understand — even with --force. Delete it by hand.
		// Hard-stop the whole bundle so no half-scaffold is written alongside a broken config.
		report.assets.push({ id: "config", action: "refused", message: `refused ${existingVersion.kind} existing config ${configTarget}`, remediation: `repair or delete ${configTarget} and re-run setup` });
		report.exitCode = 1;
		return report;
	} else if (existingVersion && existingVersion.kind === "newer" && !opts.force) {
		report.assets.push({ id: "config", action: "refused", message: `refused ${configTarget}: ${REMEDY_SCHEMA_NEWER(existingVersion.version)}`, remediation: "upgrade pi-sdlc or run the pinned release; --force to overwrite" });
	} else if (existingVersion && existingVersion.kind === "older" && !opts.force) {
		report.assets.push({ id: "config", action: "refused", message: `refused ${configTarget}: ${REMEDY_SCHEMA_OLDER(existingVersion.version)}`, remediation: "re-run with --force to write a fresh v4 config, or pin the prior release" });
	} else if (existingVersion && existingVersion.kind !== "current" && opts.force) {
		// Older/newer schema + --force: honest clean-break replacement.
		writeFileSync(configTarget, `${JSON.stringify(cfg, null, 2)}\n`);
		report.assets.push({ id: "config", action: "upgraded", message: `upgraded ${configTarget}` });
	} else if (intentFlags && !identityFlags && existingVersion && existingVersion.kind === "current") {
		const existing = JSON.parse(readFileSync(configTarget, "utf8"));
		// A preset is a whole intent statement; per-dial-only flags patch the
		// existing blocks so unrelated dials are preserved (not reset to standard).
		const patched = opts.preset === undefined ? reviewShapeFromOptions(opts, { review: existing.review, shape: existing.shape, overrides: existing.overrides }) : { review: cfg.review, shape: cfg.shape, overrides: cfg.overrides };
		// Data-loss guard: refuse (without --force) when the new intent blocks
		// would delete or alter an existing overrides track they do not carry.
		const existingTracks = Object.keys(existing.overrides ?? {});
		const clobbered = existingTracks.filter((t) => JSON.stringify(existing.overrides[t]) !== JSON.stringify(patched.overrides?.[t]));
		if (clobbered.length > 0 && !opts.force) {
			report.assets.push({ id: "config", action: "refused", message: `refused patch that would delete or alter consumer-authored overrides (${clobbered.join(", ")}) in ${configTarget}`, remediation: "re-run with --force to change the existing overrides block" });
		} else {
			const before = { review: existing.review, shape: existing.shape, overrides: existing.overrides };
			existing.review = patched.review;
			existing.shape = patched.shape;
			if (patched.overrides === undefined) delete existing.overrides;
			else existing.overrides = patched.overrides;
			const patchIssues = inspectConfig(existing);
			if (patchIssues.length > 0) {
				report.exitCode = 2;
				report.error = `patched configuration is invalid: ${patchIssues[0].message}`;
				return report;
			}
			writeFileSync(configTarget, `${JSON.stringify(existing, null, 2)}\n`);
			const fmt = (b) => JSON.stringify({ review: b.review, shape: b.shape, ...(b.overrides === undefined ? {} : { overrides: b.overrides }) });
			report.assets.push({ id: "config", action: "patched", message: `patched review/shape/overrides in ${configTarget} (was ${fmt(before)} → now ${fmt({ review: existing.review, shape: existing.shape, overrides: existing.overrides })})` });
		}
	} else if (configMutating && opts.force) {
		writeFileSync(configTarget, `${JSON.stringify(cfg, null, 2)}\n`);
		report.assets.push({ id: "config", action: "upgraded", message: `upgraded ${configTarget}` });
	} else if (configMutating && !opts.force) report.assets.push({ id: "config", action: "refused", message: `refused config replacement without --force: ${configTarget}`, remediation: `re-run with --force to replace the configuration` });
	else report.assets.push({ id: "config", action: "retained", message: `retained ${configTarget}` });
	// Generate the consumer companion CONFIG.md from the committed config (Spec
	// group B / §18). The same config-doc renderer setup uses here backs startup's
	// freshness check, so the two can never disagree. Skipped when the config was
	// refused (there is no valid committed config to explain).
	const configAsset = report.assets.find((item) => item.id === "config");
	if (configAsset && ["created", "upgraded", "patched", "retained", "forced"].includes(configAsset.action)) {
		const docReport = writeConfigDoc(root, { force: opts.force });
		const docAsset = { id: "config-doc", action: docReport.action, message: `${docReport.action} ${docReport.path}: ${docReport.reason}` };
		if (docReport.exitCode === 3) docAsset.remediation = "re-run setup with --force to overwrite the consumer-authored .pi/sdlc/CONFIG.md";
		report.assets.push(docAsset);
		// A config-doc error (e.g. an on-disk config that is older but invalid) must not
		// be swallowed behind an exit-0 setup; hard-stop the bundle.
		if (docReport.exitCode === 2) {
			report.exitCode = 2;
			report.error = `config companion generation failed: ${docReport.reason}`;
			return report;
		}
	}
	asset("pr-template", join(root, ".github", "pull_request_template.md"), "pr-template", templateContent, report);
	if (opts.withCiWorkflow) {
		const target = join(root, ".github", "workflows", "sdlc-lifecycle.yml");
		if (rootPrefix(root)) report.assets.push({ id: "ci-workflow", action: "refused", message: "consumer root is a subdirectory of the git repository", remediation: "install the workflow at the repository root" });
		else if (ciDetected) report.assets.push({ id: "ci-workflow", action: "refused", message: "existing CI configuration detected", remediation: "add the lifecycle-check snippet to existing CI" });
		else asset("ci-workflow", target, "ci-workflow", workflowContent, report);
	}
	if (opts.copyPrompts)
		for (const base of PROMPT_BASES) {
			const promptPath = join(PACKAGE_DIR, "prompts", `${base}.prompt.md`);
			asset(`prompt.${base}`, join(root, ".pi", "sdlc", "prompts", `${base}.prompt.md`), "prompt", promptContents[promptPath], report);
		}
	if (hooks && Object.keys(hooks).length > 0) report.hookWarning = RUN_HOOK_WARNING;
	report.exitCode = report.assets.some((item) => item.action === "refused") ? 1 : 0;
	return report;
}
// Two-core-decisions interview (Spec §10): who reviews DESIGNS and who reviews
// CODE. Everything else defaults to the `standard` answer bundle (explained in
// templates/setup-sdlc.md) rather than being asked as a jargon quiz. Every dial
// stays reachable non-interactively via flags.
export async function collectInterview(ask) {
	const base = structuredClone(PRESETS.standard);
	// One compound prompt per object dial (≤ 3-prompt ceiling): validate=panel|skip
	// (does a panel run?), approve=human|agent (who adjudicates and advances?).
	base.review.design = parseGateDial(await ask("DESIGNS (plan+spec) gate — <validate>/<approve>; validate=panel|skip (does an adversarial panel run?), approve=human|agent (who adjudicates & advances?)", "panel/human"));
	base.review.code = parseGateDial(await ask("CODE (the PR) gate — <validate>/<approve> (panel|skip / human|agent)", "panel/human"));
	return base;
}

// The interactive TTY fallback asks at most the two core decisions plus a final
// confirmation (≤ 3 prompts). `injectedAsk` makes the prompt sequence testable.
export async function interview(root, injectedAsk) {
	let rl;
	let ask = injectedAsk;
	if (!ask) {
		if (!stdin.isTTY) throw new SetupError("setup-sdlc: no config flags and no TTY for an interactive interview; pass flags or --yes");
		rl = createInterface({ input: stdin, output: stdout });
		ask = async (question, fallback) => {
			const answer = await rl.question(fallback ? `${question} [${fallback}]: ` : `${question}: `);
			return answer.trim() || fallback || "";
		};
	}
	try {
		const rs = await collectInterview(ask);
		const confirmation = await ask("write this config now? (Y/n)", "y");
		if (confirmation.toLowerCase().startsWith("n")) {
			console.error("setup-sdlc: aborted at your request; nothing written.");
			return 1;
		}
		const opts = {
			hookSpecs: [],
			overrides: [],
			format: "text",
			yes: true,
			runFlag: true,
			rootFlagOnly: false,
			prefix: CONFIG_DEFAULTS.prefix,
			labelPrefix: CONFIG_DEFAULTS.labelPrefix,
			announce: CONFIG_DEFAULTS.announce,
			seedPanels: false,
			withCiWorkflow: false,
			copyPrompts: false,
		};
		const cfg = {
			schemaVersion: CONFIG_SCHEMA_VERSION,
			prefix: CONFIG_DEFAULTS.prefix,
			labelPrefix: CONFIG_DEFAULTS.labelPrefix,
			announce: CONFIG_DEFAULTS.announce,
			review: rs.review,
			shape: rs.shape,
			...(rs.overrides ? { overrides: rs.overrides } : {}),
		};
		const report = writeBundle(root, opts, cfg, {}, undefined);
		process.stdout.write(renderReport(report));
		return report.exitCode;
	} finally {
		if (rl) rl.close();
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const argv = process.argv.slice(2);
	const isJson = jsonMode(argv);
	let resolvedRoot;
	try {
		const opts = parseArgs(argv);
		if (opts.help) {
			console.log(USAGE);
			process.exit(0);
		}
		const root = resolveRoot({ config: opts.config, repoRoot: opts.repoRoot });
		resolvedRoot = root;
		if (!opts.runFlag) process.exitCode = await interview(root);
		else {
			const tracker = trackerFromFlags(opts);
			const { hooks, hasRun } = buildHooks(opts.hookSpecs);
			const report = writeBundle(root, opts, assembleConfig(opts, tracker, hooks), hooks, tracker);
			if (hasRun && opts.format !== "json") console.error(RUN_HOOK_WARNING);
			if (hasRun && opts.format === "json") {
				const configReport = report.assets.find((item) => item.id === "config");
				if (configReport) configReport.message += ` ${RUN_HOOK_WARNING.replace(/\n/g, " ")}`;
			}
			process.stdout.write(renderReport(report));
			process.exitCode = report.exitCode;
		}
	} catch (error) {
		const code = error instanceof SetupError ? error.code : 2;
		if (isJson) {
			process.stdout.write(`${JSON.stringify({ schemaVersion: 2, root: resolvedRoot ?? process.cwd(), exitCode: code, error: String(error.message), references: [], assets: [] }, null, 2)}\n`);
		} else console.error(error.message);
		process.exitCode = code;
	}
}
