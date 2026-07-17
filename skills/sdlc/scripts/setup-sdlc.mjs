#!/usr/bin/env node
// setup-sdlc.mjs — config and adoption-bundle scaffolder.
// Bundle mode is deterministic, offline, and refuses consumer-authored assets.

import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stderr, stdin, stdout } from "node:process";
import { CONFIG_DEFAULTS, CONFIG_SCHEMA_VERSION, HOOK_PHASES, REMEDY_SCHEMA_NEWER, REMEDY_SCHEMA_OLDER, USE_RE, classifyConfigVersion, inspectConfig, readConfigRawForMigration, resolveRoot } from "./lib.mjs";
import { applyMigration, planMigration } from "./migrate.mjs";

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
	"usage: setup-sdlc.sh [--profile solo|standard|full|custom] [--lifecycle-json path|-] [--prefix V] [--label-prefix V] [--announce V] [--tracker-repo o/n --tracker-board-number N --tracker-board-url U] [--hook-run S] [--hook-use S] [--seed-panels] [--enforcement strict|preference] [--with-ci-workflow] [--copy-prompts] [--format text|json] [--force] [--yes] [--config DIR|--repo-root DIR]";
const MIGRATE_FIRST = "setup-sdlc: migrate first — re-run with no config flags to fold the v1 config, then apply changes";
const RETIRED_WITH_MODELS = "setup-sdlc: --with-models is retired — the panel roster now lives in .pi/sdlc/sdlc.config.json (schemaVersion 2); use --seed-panels";

export const LIFECYCLE_PRESETS = Object.freeze({
	solo: {
		profile: "solo",
		gates: { brainstorm: { mode: "off" }, plan_review: { mode: "human", minPanel: 1 }, pr_review: { mode: "advisory", minPanel: 1 } },
		phases: { mergePlanSpec: true },
		tracker: { publishThreshold: "never" },
		taskValidation: { mode: "self" },
		tracks: { defaultTrack: "irreversible" },
	},
	standard: {
		profile: "standard",
		gates: { brainstorm: { mode: "human" }, plan_review: { mode: "human", minPanel: 1 }, pr_review: { mode: "panel", minPanel: 2 } },
		phases: { mergePlanSpec: true },
		tracker: { publishThreshold: 4 },
		taskValidation: { mode: "subagent" },
		tracks: { defaultTrack: "irreversible" },
	},
	full: {
		profile: "full",
		gates: {
			brainstorm: { mode: "human" },
			plan_review: { mode: { irreversible: "panel", reversible: "human" }, minPanel: 2 },
			spec_review: { mode: { irreversible: "panel" }, minPanel: 2 },
			pr_review: { mode: "panel", minPanel: 2 },
		},
		phases: { mergePlanSpec: false },
		tracker: { publishThreshold: 2 },
		taskValidation: { mode: "subagent" },
		tracks: { defaultTrack: "irreversible" },
	},
});

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
		enforcement: opts.enforcement ?? "preference",
	};
	if (tracker) config.tracker = tracker;
	if (Object.keys(hooks).length) config.hooks = hooks;
	const lifecycle = lifecycleFromOptions(opts, config);
	if (lifecycle) config.lifecycle = lifecycle;
	return config;
}

function lifecycleFromOptions(opts, config) {
	if (opts.lifecycle) return structuredClone(opts.lifecycle);
	if (opts.profile === undefined) return undefined;
	if (opts.profile !== "custom") return structuredClone(LIFECYCLE_PRESETS[opts.profile]);
	let payload;
	try {
		const text = opts.lifecycleJson === "-" ? readFileSync(0, "utf8") : readFileSync(opts.lifecycleJson, "utf8");
		payload = JSON.parse(text);
	} catch (error) {
		throw new SetupError(`setup-sdlc: cannot read --lifecycle-json ${opts.lifecycleJson}: ${error.message}`);
	}
	if (payload === null || typeof payload !== "object" || Array.isArray(payload)) throw new SetupError("setup-sdlc: --lifecycle-json must contain a JSON object");
	if (Object.hasOwn(payload, "profile")) throw new SetupError("setup-sdlc: --lifecycle-json payload must not contain a profile key");
	const lifecycle = { ...payload, profile: "custom" };
	const issue = inspectConfig({ ...config, lifecycle }).find(({ path }) => path === "lifecycle" || path.startsWith("lifecycle."));
	if (issue) throw new SetupError(`setup-sdlc: invalid --lifecycle-json at ${issue.path}: ${issue.message}`, 1);
	return lifecycle;
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
	const opts = { hookSpecs: [], format: "text", force: false, yes: false, seedPanels: false, withCiWorkflow: false, copyPrompts: false, runFlag: false, rootFlagOnly: true };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const value = (name = a) => needValue(argv, ++i, name);
		switch (a) {
			case "--profile":
				opts.profile = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
			case "--lifecycle-json":
				opts.lifecycleJson = value();
				opts.runFlag = true;
				opts.rootFlagOnly = false;
				break;
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
			case "--enforcement":
				opts.enforcement = value();
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
	if (opts.profile !== undefined && !new Set(["solo", "standard", "full", "custom"]).has(opts.profile)) throw new SetupError("setup-sdlc: --profile must be solo, standard, full, or custom");
	if (opts.enforcement !== undefined && opts.enforcement !== "strict" && opts.enforcement !== "preference") throw new SetupError("setup-sdlc: --enforcement must be strict or preference");
	if (opts.lifecycleJson !== undefined && opts.profile !== "custom") throw new SetupError("setup-sdlc: --lifecycle-json requires --profile custom");
	if (opts.profile === "custom" && opts.lifecycleJson === undefined) throw new SetupError("setup-sdlc: --profile custom requires --lifecycle-json for non-interactive setup", 1);
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
function existingAssetIssue(target, inspect, label) {
	if (!existsSync(target)) return null;
	try {
		const raw = JSON.parse(readFileSync(target, "utf8"));
		const issues = inspect(raw);
		return issues.length > 0 ? `${label} ${issues[0].path || "root"}: ${issues[0].message}` : null;
	} catch (error) {
		return `${label} cannot be read or parsed (${error.message})`;
	}
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
async function askConfirmation(question) {
	if (!stdin.isTTY) return false;
	const rl = createInterface({ input: stdin, output: stderr });
	try {
		const answer = await rl.question(`${question} (y/N) `);
		return answer.trim().toLowerCase().startsWith("y");
	} finally {
		rl.close();
	}
}

function rawFileUnchanged(before, after) {
	if (before.status !== after.status) return false;
	if (before.status === "absent") return true;
	return before.text === after.text;
}

function migrationFlagsPresent(opts) {
	return (
		opts.profile !== undefined ||
		opts.lifecycleJson !== undefined ||
		opts.prefix !== undefined ||
		opts.labelPrefix !== undefined ||
		opts.announce !== undefined ||
		opts.trackerRepo !== undefined ||
		opts.trackerBoardNumber !== undefined ||
		opts.trackerBoardUrl !== undefined ||
		opts.hookSpecs.length > 0 ||
		opts.seedPanels ||
		opts.enforcement !== undefined ||
		opts.withCiWorkflow ||
		opts.copyPrompts ||
		opts.force
	);
}

async function migrateConfig(root, opts) {
	const files = readConfigRawForMigration(root);
	if (files.config.status === "malformed") {
		const report = {
			root,
			format: opts.format,
			exitCode: 1,
			references: [],
			assets: [{ id: "config", action: "refused", message: `existing config is malformed: ${files.config.error}` }],
		};
		process.stdout.write(renderReport(report));
		return report;
	}
	if (files.config.status !== "parsed") return null;
	const classification = classifyConfigVersion(files.config.value);
	if (classification.kind === "newer") throw new SetupError(`setup-sdlc: ${REMEDY_SCHEMA_NEWER(classification.version)}`, 1);
	if (classification.kind !== "older") return null;
	if (migrationFlagsPresent(opts)) throw new SetupError(MIGRATE_FIRST, 1);
	if (!stdin.isTTY) throw new SetupError(`setup-sdlc: ${REMEDY_SCHEMA_OLDER(classification.version)}`, 1);
	console.error(`setup-sdlc: migration will fold .pi/sdlc/sdlc.models.json into .pi/sdlc/sdlc.config.json (schemaVersion ${CONFIG_SCHEMA_VERSION}).`);
	console.error("setup-sdlc: single-writer boundary — after answering yes, do not modify either config file or run another setup/migration until this command finishes.");
	if (!(await askConfirmation("migrate .pi/sdlc/sdlc.config.json to schemaVersion 2 now?"))) throw new SetupError(`setup-sdlc: ${REMEDY_SCHEMA_OLDER(classification.version)}`, 1);
	const confirmedFiles = readConfigRawForMigration(root);
	if (!rawFileUnchanged(files.config, confirmedFiles.config) || !rawFileUnchanged(files.models, confirmedFiles.models)) {
		throw new SetupError("setup-sdlc: migration refused; config inputs changed while confirmation was pending; no files were written — review the edits and re-run setup-sdlc", 1);
	}
	let plan;
	if (confirmedFiles.models.status === "malformed") plan = { ok: false, unmappable: [{ path: ".pi/sdlc/sdlc.models.json", message: confirmedFiles.models.error }] };
	else plan = planMigration({ config: confirmedFiles.config.value, models: confirmedFiles.models.status === "parsed" ? confirmedFiles.models.value : undefined });
	if (!plan.ok) {
		const details = plan.unmappable.map(({ path, message }) => `cannot map ${path}: ${message}`).join("\n");
		throw new SetupError(`setup-sdlc: migration refused; no files were written.\n${details}`, 1);
	}
	const result = applyMigration(root, plan);
	const report = { root, format: opts.format, exitCode: 0, references: [], assets: [{ id: "config", action: "migrated", message: `migrated ${result.configPath}` }, ...(result.modelsRemoved ? [{ id: "models", action: "removed", message: `removed ${result.modelsPath}` }] : [])] };
	process.stdout.write(renderReport(report));
	return report;
}

async function cleanupResidue(root) {
	const dir = join(root, ".pi", "sdlc");
	const assets = [];
	for (const [name, id, question] of [
		["sdlc.models.json", "models", "remove leftover .pi/sdlc/sdlc.models.json (folded into sdlc.config.json)?"],
		[".sdlc.config.json.migrate-tmp", "staging", "remove leftover migration staging file .sdlc.config.json.migrate-tmp?"],
	]) {
		const path = join(dir, name);
		if (!existsSync(path)) continue;
		if (await askConfirmation(question)) {
			unlinkSync(path);
			assets.push({ id, action: "removed", message: `removed ${path}` });
		} else assets.push({ id, action: "retained", message: `retained residue ${path}`, remediation: `re-run setup-sdlc interactively to remove ${path}` });
	}
	return assets;
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
	const configIssue = existingAssetIssue(configTarget, inspectConfig, "config");
	const configMutating = opts.profile !== undefined || opts.prefix !== undefined || opts.labelPrefix !== undefined || opts.announce !== undefined || opts.enforcement !== undefined || opts.seedPanels || tracker !== undefined || (hooks && Object.keys(hooks).length > 0);
	if (!configExists) {
		mkdirSync(dirname(configTarget), { recursive: true });
		writeFileSync(configTarget, `${JSON.stringify(cfg, null, 2)}\n`);
		report.assets.push({ id: "config", action: "created", message: `created ${configTarget}` });
	} else if (configIssue) report.assets.push({ id: "config", action: "refused", message: `refused invalid existing config ${configTarget}: ${configIssue}`, remediation: `repair or delete ${configTarget} and re-run setup` });
	else if (opts.profile !== undefined)
		report.assets.push({
			id: "config",
			action: "refused",
			message: `refused profile application to existing config ${configTarget}: existing-adopter profile application is deferred to OL-B`,
			remediation: "use the OL-B profile-application path after its FS10 v2 migration (docs/plans/2026-07-14-opt-in-lifecycle.md)",
		});
	else if (configMutating && opts.force) {
		writeFileSync(configTarget, `${JSON.stringify(cfg, null, 2)}\n`);
		report.assets.push({ id: "config", action: "upgraded", message: `upgraded ${configTarget}` });
	} else if (configMutating && !opts.force) report.assets.push({ id: "config", action: "refused", message: `refused config replacement without --force: ${configTarget}`, remediation: `re-run with --force to replace the configuration` });
	else report.assets.push({ id: "config", action: "retained", message: `retained ${configTarget}` });
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
async function interviewLifecycle(ask) {
	const profile = await ask("lifecycle profile — solo: light, advisory PR (needs >=1 live model credential); standard: merged plan/spec + PR panel; full: separate design panels + PR panel; custom: choose every dial (solo/standard/full/custom)", "standard");
	if (Object.hasOwn(LIFECYCLE_PRESETS, profile)) return structuredClone(LIFECYCLE_PRESETS[profile]);
	if (profile !== "custom") throw new SetupError("setup-sdlc: profile must be solo, standard, full, or custom", 1);
	const choice = async (question, values, fallback) => {
		const answer = await ask(question, fallback);
		if (!values.includes(answer)) throw new SetupError(`setup-sdlc: ${question} must be one of ${values.join(", ")}`, 1);
		return answer;
	};
	const positiveInt = async (question, fallback) => {
		const value = Number(await ask(question, String(fallback)));
		if (!Number.isInteger(value) || value < 1) throw new SetupError(`setup-sdlc: ${question} must be an integer >= 1`, 1);
		return value;
	};
	const gateModes = ["panel", "advisory", "human", "off"];
	const mergeAnswer = await choice("merge plan and spec? (true/false)", ["true", "false"], "false");
	const mergePlanSpec = mergeAnswer === "true";
	const planMode = {
		irreversible: await choice("irreversible plan review mode (panel/advisory/human/off)", gateModes, "panel"),
		reversible: await choice("reversible plan review mode (panel/advisory/human/off)", gateModes, "human"),
	};
	let specReview;
	if (!mergePlanSpec) {
		specReview = {
			mode: { irreversible: await choice("irreversible spec review mode (panel/advisory/human/off)", gateModes, "panel") },
			minPanel: await positiveInt("spec review minPanel", 2),
		};
	}
	const gates = {
		brainstorm: { mode: await choice("brainstorm mode (human/off)", ["human", "off"], "human") },
		plan_review: { mode: planMode, minPanel: await positiveInt("plan review minPanel", 2) },
		...(specReview ? { spec_review: specReview } : {}),
		pr_review: { mode: await choice("PR review mode (panel/advisory/human/off)", gateModes, "panel"), minPanel: await positiveInt("PR review minPanel", 2) },
	};
	const thresholdAnswer = await ask("tracker publishThreshold (integer >=1 or never)", "2");
	const numericThreshold = Number(thresholdAnswer);
	if (thresholdAnswer !== "never" && (!Number.isInteger(numericThreshold) || numericThreshold < 1)) {
		throw new SetupError("setup-sdlc: tracker publishThreshold must be an integer >= 1 or never", 1);
	}
	return {
		profile: "custom",
		gates,
		phases: { mergePlanSpec },
		tracker: { publishThreshold: thresholdAnswer === "never" ? "never" : numericThreshold },
		taskValidation: { mode: await choice("task validation mode (subagent/self/off)", ["subagent", "self", "off"], "subagent") },
		tracks: { defaultTrack: await choice("default track (irreversible/reversible)", ["irreversible", "reversible"], "irreversible") },
	};
}

async function interview(root) {
	if (!stdin.isTTY) throw new SetupError("setup-sdlc: no config flags and no TTY for an interactive interview; pass flags or --yes");
	const rl = createInterface({ input: stdin, output: stdout });
	try {
		const ask = async (question, fallback) => {
			const answer = await rl.question(fallback ? `${question} [${fallback}]: ` : `${question}: `);
			return answer.trim() || fallback || "";
		};
		const lifecycle = await interviewLifecycle(ask);
		const prefix = await ask("prefix", CONFIG_DEFAULTS.prefix);
		const labelPrefix = await ask("labelPrefix", CONFIG_DEFAULTS.labelPrefix);
		const announce = await ask("announce", CONFIG_DEFAULTS.announce);
		const workflowAnswer = await ask("offer a GitHub workflow when no CI exists? (y/N)", "n");
		const promptsAnswer = await ask("copy package prompts for local overrides? (y/N)", "n");
		const enforcement = await ask("panel enforcement — preference: proceed best-effort and surface shortfalls; strict: hard-fail below configured floors (preference/strict)", "preference");
		if (enforcement !== "strict" && enforcement !== "preference") throw new SetupError("setup-sdlc: panel enforcement must be strict or preference", 1);
		const opts = {
			hookSpecs: [],
			format: "text",
			yes: true,
			runFlag: true,
			rootFlagOnly: false,
			profile: lifecycle.profile,
			lifecycle,
			prefix,
			labelPrefix,
			announce,
			enforcement,
			seedPanels: (await ask("seed the example panel roster (model ids drift; review after)? (y/N)", "n")).toLowerCase().startsWith("y"),
			withCiWorkflow: workflowAnswer.toLowerCase().startsWith("y"),
			copyPrompts: promptsAnswer.toLowerCase().startsWith("y"),
		};
		const tracker = undefined;
		const hooks = {};
		const confirmation = await ask("write this config now? (Y/n)", "y");
		if (confirmation.toLowerCase().startsWith("n")) {
			console.error("setup-sdlc: aborted at your request; nothing written.");
			return 1;
		}
		const report = writeBundle(root, opts, assembleConfig(opts, tracker, hooks), hooks, tracker);
		process.stdout.write(renderReport(report));
		return report.exitCode;
	} finally {
		rl.close();
	}
}

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
	const migrationResult = await migrateConfig(root, opts);
	if (migrationResult) process.exitCode = migrationResult.exitCode;
	else if (!opts.runFlag) process.exitCode = await interview(root);
	else {
		const tracker = trackerFromFlags(opts);
		const { hooks, hasRun } = buildHooks(opts.hookSpecs);
		const raw = readConfigRawForMigration(root);
		const classification = raw.config.status === "parsed" ? classifyConfigVersion(raw.config.value) : null;
		const residueAssets = classification?.kind === "current" || existsSync(join(root, ".pi", "sdlc", ".sdlc.config.json.migrate-tmp")) ? await cleanupResidue(root) : [];
		const report = writeBundle(root, opts, assembleConfig(opts, tracker, hooks), hooks, tracker, residueAssets);
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
