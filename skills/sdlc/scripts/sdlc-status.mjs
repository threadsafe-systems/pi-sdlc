#!/usr/bin/env node
// sdlc-status.mjs — FS8 four-state readiness inspection (spec
// docs/specs/2026-07-12-sdlc-adoption-readiness.md §1-§2). Read-only: bounded
// git/filesystem checks, no hooks, no model calls, no network, no mutation.
//
// Usage: sdlc-status.mjs [--config DIR | --repo-root DIR] [--format text|json]
// Exit: 0 ready; 1 not-adopted (HEAD has no manifest blob); 2 error
// (CLI/root/git/config failure); 3 not-ready (adopted but dirty/incomplete).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { delimiter, isAbsolute, join, relative, resolve, sep } from "node:path";
import { inspectConfig, inspectModels, inspectRoot } from "./lib.mjs";

const CHECK_IDS = ["cli.arguments", "root.resolve", "git.repository", "adoption.manifest-head", "adoption.manifest-clean", "config.valid", "models.head", "models.clean", "models.valid", "workflow.readable"];

// Dependency matrix (spec §2.8): checkId -> prerequisite checkId (must be pass).
const PREREQ = {
	"cli.arguments": null,
	"root.resolve": "cli.arguments",
	"git.repository": "root.resolve",
	"adoption.manifest-head": "git.repository",
	"adoption.manifest-clean": "adoption.manifest-head",
	"config.valid": "adoption.manifest-clean",
	"models.head": "adoption.manifest-head",
	"models.clean": "models.head",
	"models.valid": "models.clean",
	"workflow.readable": "adoption.manifest-head",
};

// Stable reason a non-pass check propagates into its dependents' skip messages.
const SKIP_REASON = {
	"cli.arguments": "arguments are invalid",
	"root.resolve": "consumer root was not resolved",
	"git.repository": "root is not within a trusted git worktree",
	"adoption.manifest-head": "manifest is not committed in current HEAD",
	"adoption.manifest-clean": "manifest has uncommitted changes",
	"models.head": "models file is not committed in current HEAD",
	"models.clean": "models file has uncommitted changes",
};

const USAGE = "usage: sdlc-status.sh [--config DIR | --repo-root DIR] [--format text|json]";

// --- deterministic filesystem seam (internal; used by offline tests only) ---
function readFileChecked(p) {
	const deny = (process.env.SDLC_STATUS_UNREADABLE ?? "").split(delimiter).filter(Boolean);
	if (deny.includes(p)) throw new Error("injected read failure");
	return readFileSync(p, "utf8");
}

function git(cwd, args) {
	const r = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
	return { code: r.error ? -1 : (r.status ?? -1), stdout: (r.stdout ?? "").trim() };
}

// --- argument parsing (spec §1.1) ---------------------------------------------

// Full-argv pre-scan: a well-formed `--format json` pair anywhere enables JSON.
function scanJsonMode(argv) {
	for (let i = 0; i < argv.length - 1; i++) {
		if (argv[i] === "--format" && argv[i + 1] === "json") return true;
	}
	return false;
}

function parseArgs(argv) {
	const out = { config: undefined, repoRoot: undefined, format: undefined, help: false, error: null, explicitRoots: [] };
	if (argv.includes("--help") || argv.includes("-h")) {
		out.help = true;
		return out;
	}
	const err = (m) => {
		if (!out.error) out.error = m;
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--config" || a === "--repo-root") {
			const v = argv[++i];
			if (v === undefined) {
				err(`${a} requires a value`);
				continue;
			}
			out.explicitRoots.push(v);
			if (a === "--config") out.config = v;
			else out.repoRoot = v;
		} else if (a === "--format") {
			const v = argv[++i];
			if (v === undefined) {
				err("--format requires a value");
				continue;
			}
			if (v !== "text" && v !== "json") {
				err("--format must be text or json");
				continue;
			}
			if (out.format !== undefined) {
				err("duplicate --format");
				continue;
			}
			out.format = v;
		} else {
			err(`unexpected argument: ${a}`);
		}
	}
	if (out.config !== undefined && out.repoRoot !== undefined) {
		out.error = out.error ?? "--config and --repo-root are mutually exclusive";
	}
	return out;
}

// --- report assembly ------------------------------------------------------------

function buildReport(argv, cwd) {
	const results = new Map(); // id -> { status, message, remediation? }
	const set = (id, status, message, remediation) => {
		results.set(id, remediation === undefined ? { status, message } : { status, message, remediation });
	};

	const parsed = parseArgs(argv);
	let root = resolve(cwd);

	if (parsed.error) {
		set("cli.arguments", "error", parsed.error, "run with --help for usage");
		// single unambiguous explicit root, if available (spec §1.3)
		const distinct = [...new Set(parsed.explicitRoots.map((r) => (isAbsolute(r) ? r : resolve(cwd, r))))];
		if (distinct.length === 1 && (parsed.config === undefined) !== (parsed.repoRoot === undefined)) root = distinct[0];
	} else {
		set("cli.arguments", "pass", "arguments are valid");
	}

	// root.resolve
	let rootInspection = null;
	if (results.get("cli.arguments").status === "pass") {
		rootInspection = inspectRoot({ config: parsed.config, repoRoot: parsed.repoRoot, cwd });
		if (rootInspection.ok) {
			root = rootInspection.root;
			set("root.resolve", "pass", "consumer root resolved");
		} else {
			root = rootInspection.attemptedRoot;
			set("root.resolve", "error", rootInspection.message, "pass --config <dir> or --repo-root <dir>, or set $SDLC_ROOT");
		}
	}

	// git.repository
	let prefix = "";
	if (statusOf(results, "root.resolve") === "pass") {
		const top = git(root, ["rev-parse", "--show-toplevel"]);
		if (top.code !== 0 || !top.stdout) {
			set("git.repository", "error", "resolved root is not within a git worktree", "adopt the sdlc inside a git repository");
		} else {
			let ok = true;
			try {
				const realRoot = realpathSync(root);
				const realTop = realpathSync(top.stdout);
				const rel = relative(realTop, realRoot);
				if (rel !== "" && (rel.startsWith("..") || isAbsolute(rel))) ok = false;
				else prefix = rel.split(sep).filter(Boolean).join("/");
			} catch {
				ok = false;
			}
			if (ok) set("git.repository", "pass", "resolved root is a git worktree");
			else set("git.repository", "error", "resolved root escapes its git top-level", "pass a root inside one git worktree");
		}
	}

	const gitPath = (rel) => (prefix ? `${prefix}/${rel}` : rel);
	const manifestGitPath = gitPath(".pi/sdlc/sdlc.config.json");
	const modelsGitPath = gitPath(".pi/sdlc/sdlc.models.json");

	// adoption.manifest-head
	if (statusOf(results, "git.repository") === "pass") {
		const blob = git(root, ["cat-file", "-e", `HEAD:${manifestGitPath}`]);
		if (blob.code === 0) set("adoption.manifest-head", "pass", `current HEAD contains ${manifestGitPath}`);
		else set("adoption.manifest-head", "fail", `current HEAD has no manifest blob at ${manifestGitPath}`, `run /setup-sdlc and commit ${manifestGitPath}`);
	}

	// two independent comparisons (spec §2.4): index vs HEAD, working tree vs index.
	// `:(top)` pins the pathspec to the repository top level: plain pathspecs are
	// cwd-relative, which would silently miss prefixed monorepo-subdirectory paths.
	const cleanAgainstHead = (path) => {
		const idx = git(root, ["diff", "--quiet", "--cached", "HEAD", "--", `:(top)${path}`]);
		const wt = git(root, ["diff", "--quiet", "--", `:(top)${path}`]);
		if (idx.code === 0 && wt.code === 0) return "clean";
		if (idx.code === 1 || wt.code === 1) return "dirty";
		return "error";
	};

	// adoption.manifest-clean
	if (statusOf(results, "adoption.manifest-head") === "pass") {
		const c = cleanAgainstHead(manifestGitPath);
		if (c === "clean") set("adoption.manifest-clean", "pass", "manifest matches HEAD in index and working tree");
		else if (c === "dirty") set("adoption.manifest-clean", "fail", "manifest differs from HEAD in the index or working tree", `commit or restore ${manifestGitPath}`);
		else set("adoption.manifest-clean", "error", "git could not compare the manifest against HEAD", "check repository integrity with git status");
	}

	// config.valid (spec §2.5): parse the clean active manifest under FS1 rules
	if (statusOf(results, "adoption.manifest-clean") === "pass") {
		const p = join(root, ".pi", "sdlc", "sdlc.config.json");
		let raw;
		let failure = null;
		try {
			raw = JSON.parse(readFileChecked(p));
		} catch (e) {
			failure = e instanceof SyntaxError ? "manifest is not valid JSON" : "manifest is unreadable";
		}
		if (!failure) {
			const issues = inspectConfig(raw);
			if (issues.length > 0) failure = `manifest is invalid: ${issues[0].message}`;
		}
		if (failure) set("config.valid", "error", failure, `fix ${manifestGitPath} and commit the correction`);
		else set("config.valid", "pass", "committed manifest is valid");
	}

	// models.head (spec §2.6)
	if (statusOf(results, "adoption.manifest-head") === "pass") {
		const blob = git(root, ["cat-file", "-e", `HEAD:${modelsGitPath}`]);
		if (blob.code === 0) set("models.head", "pass", `current HEAD contains ${modelsGitPath}`);
		else set("models.head", "fail", `current HEAD has no models blob at ${modelsGitPath}`, `commit ${modelsGitPath}`);
	}

	// models.clean
	if (statusOf(results, "models.head") === "pass") {
		const c = cleanAgainstHead(modelsGitPath);
		if (c === "clean") set("models.clean", "pass", "models file matches HEAD in index and working tree");
		else if (c === "dirty") set("models.clean", "fail", "models file differs from HEAD in the index or working tree", `commit or restore ${modelsGitPath}`);
		else set("models.clean", "error", "git could not compare the models file against HEAD", "check repository integrity with git status");
	}

	// models.valid — via the non-fatal collector; never the exiting readModels path
	if (statusOf(results, "models.clean") === "pass") {
		const p = join(root, ".pi", "sdlc", "sdlc.models.json");
		let raw;
		let failure = null;
		try {
			raw = JSON.parse(readFileChecked(p));
		} catch (e) {
			failure = e instanceof SyntaxError ? "models file is not valid JSON" : "models file is unreadable";
		}
		if (!failure) {
			const issues = inspectModels(raw);
			if (issues.length > 0) failure = `models file is invalid: ${issues[0].message}`;
		}
		if (failure) set("models.valid", "fail", failure, `fix ${modelsGitPath} and commit the correction`);
		else set("models.valid", "pass", "committed models file is valid");
	}

	// workflow.readable (spec §2.7)
	if (statusOf(results, "adoption.manifest-head") === "pass") {
		const p = join(root, ".pi", "sdlc", "workflow.md");
		if (!existsSync(p)) {
			set("workflow.readable", "pass", "optional workflow.md is absent");
		} else {
			try {
				readFileChecked(p);
				set("workflow.readable", "pass", "workflow.md is readable");
			} catch {
				set("workflow.readable", "fail", "workflow.md exists but cannot be read", `fix permissions on or remove ${gitPath(".pi/sdlc/workflow.md")}`);
			}
		}
	}

	// fill skips for anything not evaluated, propagating the root cause: the
	// nearest evaluated non-pass ancestor's stable reason (spec §2.8 skip messages)
	const reasonFor = (id) => {
		const r = results.get(id);
		if (r && r.status !== "pass") return SKIP_REASON[id] ?? r.message;
		if (!r && PREREQ[id]) return reasonFor(PREREQ[id]);
		return "prerequisite did not pass";
	};
	const checks = CHECK_IDS.map((id) => {
		if (results.has(id)) return { id, ...results.get(id) };
		return { id, status: "skip", message: reasonFor(PREREQ[id]) };
	});

	// aggregate (spec §2.8)
	let state;
	let exitCode;
	if (checks.some((c) => c.status === "error")) {
		state = "error";
		exitCode = 2;
	} else if (checks.find((c) => c.id === "adoption.manifest-head").status === "fail") {
		state = "not-adopted";
		exitCode = 1;
	} else if (checks.some((c) => c.status === "fail")) {
		state = "not-ready";
		exitCode = 3;
	} else {
		state = "ready";
		exitCode = 0;
	}

	return { schemaVersion: 1, root, state, exitCode, checks };
}

function statusOf(results, id) {
	return results.get(id)?.status ?? "skip";
}

// --- rendering --------------------------------------------------------------------

function renderText(report) {
	const lines = [`root: ${report.root}`, `state: ${report.state}`, `exit-code: ${report.exitCode}`];
	for (const c of report.checks) {
		lines.push(`check: ${c.id} ${c.status} — ${c.message}`);
		if (c.remediation) lines.push(`remediation: ${c.id} — ${c.remediation}`);
	}
	return `${lines.join("\n")}\n`;
}

function renderJson(report) {
	return `${JSON.stringify(report, null, 2)}\n`;
}

// --- main -----------------------------------------------------------------------

const argv = process.argv.slice(2);
const jsonMode = scanJsonMode(argv);

try {
	if (argv.includes("--help") || argv.includes("-h")) {
		console.log(USAGE);
		process.exit(0);
	}
	const report = buildReport(argv, process.cwd());
	process.stdout.write(jsonMode ? renderJson(report) : renderText(report));
	process.exit(report.exitCode);
} catch (e) {
	// catastrophic failure: once JSON mode is recognised the envelope is mandatory
	const message = String(e?.message ?? e).split("\n")[0] || "internal failure";
	if (jsonMode) {
		const checks = CHECK_IDS.map((id) => (id === "cli.arguments" ? { id, status: "error", message: `internal failure: ${message}` } : { id, status: "skip", message: "internal failure" }));
		process.stdout.write(renderJson({ schemaVersion: 1, root: resolve(process.cwd()), state: "error", exitCode: 2, checks }));
	} else {
		console.error(`sdlc-status: internal failure: ${message}`);
	}
	process.exit(2);
}
