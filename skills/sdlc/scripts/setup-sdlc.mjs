#!/usr/bin/env node
// setup-sdlc.mjs — config and adoption-bundle scaffolder.
// Bundle mode is deterministic, offline, and refuses consumer-authored assets.

import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { CONFIG_DEFAULTS, HOOK_PHASES, USE_RE, inspectConfig, inspectModels, resolveRoot } from "./lib.mjs";

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
const USAGE = "usage: setup-sdlc.sh [--prefix V] [--label-prefix V] [--announce V] [--tracker-repo o/n --tracker-board-number N --tracker-board-url U] [--hook-run S] [--hook-use S] [--with-models] [--with-ci-workflow] [--copy-prompts] [--format text|json] [--force] [--yes] [--config DIR|--repo-root DIR]";

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
	const config = { schemaVersion: 1, prefix: opts.prefix ?? CONFIG_DEFAULTS.prefix, labelPrefix: opts.labelPrefix ?? CONFIG_DEFAULTS.labelPrefix, announce: opts.announce ?? CONFIG_DEFAULTS.announce };
	if (tracker) config.tracker = tracker;
	if (Object.keys(hooks).length) config.hooks = hooks;
	return config;
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
	const opts = { hookSpecs: [], format: "text", force: false, yes: false, withModels: false, withCiWorkflow: false, copyPrompts: false, runFlag: false, rootFlagOnly: true };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const value = (name = a) => needValue(argv, ++i, name);
		switch (a) {
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
				opts.withModels = true;
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
function existsCi(root, target) {
	const workflows = join(root, ".github", "workflows");
	if (existsSync(workflows) && readdirSync(workflows).some((file) => /\.ya?ml$/.test(file) && file !== target)) return true;
	return [".gitlab-ci.yml", ".circleci/config.yml", "azure-pipelines.yml", "Jenkinsfile", ".travis.yml", "bitbucket-pipelines.yml"].some((file) => existsSync(join(root, file))) || (existsSync(join(root, ".buildkite")) && readdirSync(join(root, ".buildkite")).length > 0);
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
		const blocks = [...text.matchAll(/```sdlc\s*([\s\S]*?)```/gm)];
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
		const repositoryLine = repository && new RegExp(`repository:\\s*${repository.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&")}`).test(text);
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
	if (report.format === "json") return `${JSON.stringify({ schemaVersion: 1, root: report.root, exitCode: report.exitCode, ...(report.error ? { error: report.error } : {}), references: report.references, assets: report.assets }, null, 2)}\n`;
	const lines = [`root: ${report.root}`, `exit-code: ${report.exitCode}`];
	for (const ref of report.references) lines.push(`reference: ${ref.id} ${ref.status} — ${ref.message}`);
	for (const item of report.assets) {
		lines.push(`asset: ${item.id} ${item.action} — ${item.message}`);
		if (item.remediation) lines.push(`remediation: ${item.id} — ${item.remediation}`);
	}
	return `${lines.join("\n")}\n`;
}
function writeBundle(root, opts, cfg, hooks, tracker) {
	const report = { root, format: opts.format, exitCode: 0, references: [], assets: [] };
	const configTarget = join(root, ".pi", "sdlc", "sdlc.config.json");
	const modelTarget = join(root, ".pi", "sdlc", "sdlc.models.json");
	const templateSource = join(PACKAGE_DIR, "assets", "pull_request_template.md");
	const workflowSource = join(PACKAGE_DIR, "assets", "sdlc-lifecycle.yml");
	let workflowContent;
	const checkerSource = join(SCRIPT_DIR, "check-lifecycle.mjs");
	const modelSource = join(PACKAGE_DIR, "schema", "sdlc.models.example.json");
	checkReference("reference.pr-template", templateSource, report);
	if (opts.withCiWorkflow) checkReference("reference.ci-workflow", workflowSource, report);
	const promptSources = opts.copyPrompts ? PROMPT_BASES.map((base) => join(PACKAGE_DIR, "prompts", `${base}.prompt.md`)) : [];
	if (opts.copyPrompts) checkPromptReferences(promptSources, report);
	if (opts.withModels) checkReference("reference.models-example", modelSource, report);
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
	const promptContents = Object.fromEntries(promptSources.map((path) => [path, source(path)]));
	const modelContent = opts.withModels ? source(modelSource) : undefined;
	if (opts.withCiWorkflow) workflowContent = source(workflowSource).replace("__PI_SDLC_REF__", packageRef());
	const configIssues = inspectConfig(cfg);
	if (configIssues.length > 0) {
		report.exitCode = 2;
		report.error = `assembled configuration is invalid: ${configIssues[0].message}`;
		return report;
	}
	const targets = [
		configTarget,
		...(opts.withModels ? [modelTarget] : []),
		join(root, ".github", "pull_request_template.md"),
		...(opts.withCiWorkflow ? [join(root, ".github", "workflows", "sdlc-lifecycle.yml")] : []),
		...(opts.copyPrompts ? PROMPT_BASES.map((base) => join(root, ".pi", "sdlc", "prompts", `${base}.prompt.md`)) : []),
	];
	for (const target of targets) {
		const conflict = targetParentConflict(root, target);
		if (conflict) {
			report.exitCode = 2;
			report.error = conflict;
			return report;
		}
	}
	const configExists = existsSync(configTarget);
	const configIssue = existingAssetIssue(configTarget, inspectConfig, "config");
	const modelIssue = opts.withModels ? existingAssetIssue(modelTarget, inspectModels, "models") : null;
	const configMutating = opts.prefix !== undefined || opts.labelPrefix !== undefined || opts.announce !== undefined || tracker !== undefined || (hooks && Object.keys(hooks).length > 0);
	if (!configExists) {
		mkdirSync(dirname(configTarget), { recursive: true });
		writeFileSync(configTarget, `${JSON.stringify(cfg, null, 2)}\n`);
		report.assets.push({ id: "config", action: "created", message: `created ${configTarget}` });
	} else if (configMutating && opts.force) {
		writeFileSync(configTarget, `${JSON.stringify(cfg, null, 2)}\n`);
		report.assets.push({ id: "config", action: "upgraded", message: `upgraded ${configTarget}` });
	} else if (configIssue) report.assets.push({ id: "config", action: "refused", message: `refused invalid existing config ${configTarget}: ${configIssue}`, remediation: `repair or delete ${configTarget} and re-run setup` });
	else if (configMutating && !opts.force) report.assets.push({ id: "config", action: "refused", message: `refused config replacement without --force: ${configTarget}`, remediation: `re-run with --force to replace the configuration` });
	else report.assets.push({ id: "config", action: "retained", message: `retained ${configTarget}` });
	if (opts.withModels) {
		if (!existsSync(modelTarget)) {
			mkdirSync(dirname(modelTarget), { recursive: true });
			writeFileSync(modelTarget, `${modelContent.trimEnd()}\n`);
			report.assets.push({ id: "models", action: "created", message: `created ${modelTarget}` });
		} else if (modelIssue) report.assets.push({ id: "models", action: "refused", message: `refused invalid existing models ${modelTarget}: ${modelIssue}`, remediation: `repair or delete ${modelTarget} and re-run setup` });
		else report.assets.push({ id: "models", action: "retained", message: `retained ${modelTarget}` });
	}
	asset("pr-template", join(root, ".github", "pull_request_template.md"), "pr-template", templateContent, report);
	if (opts.withCiWorkflow) {
		const target = join(root, ".github", "workflows", "sdlc-lifecycle.yml");
		if (rootPrefix(root)) report.assets.push({ id: "ci-workflow", action: "refused", message: "consumer root is a subdirectory of the git repository", remediation: "install the workflow at the repository root" });
		else if (existsCi(root, "sdlc-lifecycle.yml")) report.assets.push({ id: "ci-workflow", action: "refused", message: "existing CI configuration detected", remediation: "add the lifecycle-check snippet to existing CI" });
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
async function interview(root) {
	if (!stdin.isTTY) throw new SetupError("setup-sdlc: no config flags and no TTY for an interactive interview; pass flags or --yes");
	const rl = createInterface({ input: stdin, output: stdout });
	try {
		const ask = async (question, fallback) => (await rl.question(fallback ? `${question} [${fallback}]: ` : `${question}: `)).trim() || fallback || "";
		const opts = {
			hookSpecs: [],
			format: "text",
			yes: true,
			runFlag: true,
			rootFlagOnly: false,
			prefix: await ask("prefix", CONFIG_DEFAULTS.prefix),
			labelPrefix: await ask("labelPrefix", CONFIG_DEFAULTS.labelPrefix),
			announce: await ask("announce", CONFIG_DEFAULTS.announce),
			withModels: false,
			withCiWorkflow: (await ask("offer a GitHub workflow when no CI exists? (y/N)", "n")).toLowerCase().startsWith("y"),
			copyPrompts: (await ask("copy package prompts for local overrides? (y/N)", "n")).toLowerCase().startsWith("y"),
		};
		const tracker = undefined;
		const hooks = {};
		if ((await ask("write this config now? (Y/n)", "y")).toLowerCase().startsWith("n")) {
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
try {
	const opts = parseArgs(argv);
	if (opts.help) {
		console.log(USAGE);
		process.exit(0);
	}
	const root = resolveRoot({ config: opts.config, repoRoot: opts.repoRoot });
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
		process.stdout.write(`${JSON.stringify({ schemaVersion: 1, root: process.cwd(), exitCode: code, error: String(error.message), references: [], assets: [] }, null, 2)}\n`);
	} else console.error(error.message);
	process.exitCode = code;
}
