#!/usr/bin/env node
// sdlc-status.mjs — FS8 v2 four-state readiness inspection (spec
// docs/specs/2026-07-16-config-versioning-migration.md §6). Read-only: bounded
// git/filesystem checks, no hooks, no model calls, no network, no mutation.
//
// Usage: sdlc-status.mjs [--config DIR | --repo-root DIR] [--format text|json]
// Exit: 0 ready; 1 not-adopted (HEAD has no manifest blob); 2 error
// (CLI/root/git/config failure); 3 not-ready (adopted but dirty/incomplete).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { delimiter, isAbsolute, join, relative, resolve, sep } from "node:path";
import { classifyConfigVersion, CONFIG_SCHEMA_VERSION, inspectConfig, inspectRoot, REMEDY_SCHEMA_NEWER, REMEDY_SCHEMA_OLDER } from "./lib.mjs";

const CHECK_IDS = ["cli.arguments", "root.resolve", "git.repository", "adoption.manifest-head", "adoption.manifest-clean", "config.valid", "config.schema-current", "config.panels", "workflow.readable"];

// Dependency matrix (spec §2.8): checkId -> prerequisite checkId (must be pass).
const PREREQ = {
	"cli.arguments": null,
	"root.resolve": "cli.arguments",
	"git.repository": "root.resolve",
	"adoption.manifest-head": "git.repository",
	"adoption.manifest-clean": "adoption.manifest-head",
	"config.valid": "adoption.manifest-clean",
	"config.schema-current": "config.valid",
	"config.panels": "config.schema-current",
	"workflow.readable": "adoption.manifest-head",
};

// Stable reason a non-pass check propagates into its dependents' skip messages.
const SKIP_REASON = {
	"cli.arguments": "arguments are invalid",
	"root.resolve": "consumer root was not resolved",
	"git.repository": "root is not within a trusted git worktree",
	"adoption.manifest-head": "manifest is not committed in current HEAD",
	"adoption.manifest-clean": "manifest has uncommitted changes",
	"config.valid": "manifest is not a valid recognised schema",
	"config.schema-current": "config schema is not current",
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
			const v = argv[i + 1];
			// a following option token is a missing value, not a root (spec §1.1)
			if (v === undefined || v.startsWith("--")) {
				err(`${a} requires a value`);
				continue;
			}
			i++;
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
			// elide anything after '=' so pasted values (e.g. credentials) never
			// enter diagnostics (spec §4.1)
			const shown = a.includes("=") ? `${a.slice(0, a.indexOf("=") + 1)}…` : a;
			err(`unexpected argument: ${shown}`);
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

	// HEAD entry mode: a committed symlink (120000) would make the active file
	// diverge from the HEAD blob while passing cleanliness — never trust it
	// (spec §2.4: validated content must be byte-identical to the HEAD blob).
	const headIsRegularFile = (path) => {
		const r = git(root, ["ls-tree", "--full-tree", "HEAD", "--", path]);
		return r.code === 0 && /^100(644|755) blob /.test(r.stdout);
	};

	// adoption.manifest-head
	if (statusOf(results, "git.repository") === "pass") {
		const blob = git(root, ["cat-file", "-e", `HEAD:${manifestGitPath}`]);
		if (blob.code === 0) set("adoption.manifest-head", "pass", `current HEAD contains ${manifestGitPath}`);
		else set("adoption.manifest-head", "fail", `current HEAD has no manifest blob at ${manifestGitPath}`, `run /setup-sdlc and commit ${manifestGitPath}`);
	}

	// two independent comparisons (spec §2.4): index vs HEAD, working tree vs index.
	// `:(top)` pins the pathspec to the repository top level: plain pathspecs are
	// cwd-relative, which would silently miss prefixed monorepo-subdirectory paths.
	// A third direct comparison hashes the present working file against the HEAD
	// blob: worktree diffs honour assume-unchanged/skip-worktree index flags, which
	// would otherwise smuggle uncommitted content past cleanliness. An ABSENT
	// working file stays a validity concern (sparse checkout, spec AR9).
	const cleanAgainstHead = (path, activeFile) => {
		const idx = git(root, ["diff", "--quiet", "--cached", "HEAD", "--", `:(top)${path}`]);
		const wt = git(root, ["diff", "--quiet", "--", `:(top)${path}`]);
		if (idx.code === 1 || wt.code === 1) return "dirty";
		if (idx.code !== 0 || wt.code !== 0) return "error";
		if (existsSync(activeFile)) {
			const headSha = git(root, ["rev-parse", `HEAD:${path}`]);
			const wtSha = git(root, ["hash-object", "--", activeFile]);
			if (headSha.code !== 0) return "error";
			// an unreadable present file is left to the validity check
			if (wtSha.code === 0 && wtSha.stdout !== headSha.stdout) return "dirty";
		}
		return "clean";
	};

	// adoption.manifest-clean
	if (statusOf(results, "adoption.manifest-head") === "pass") {
		const c = cleanAgainstHead(manifestGitPath, join(root, ".pi", "sdlc", "sdlc.config.json"));
		if (c === "clean") set("adoption.manifest-clean", "pass", "manifest matches HEAD in index and working tree");
		else if (c === "dirty") set("adoption.manifest-clean", "fail", "manifest differs from HEAD in the index or working tree", `commit or restore ${manifestGitPath}`);
		else set("adoption.manifest-clean", "error", "git could not compare the manifest against HEAD", "check repository integrity with git status");
	}

	// FS8 v2 version split: recognised older schemas are structurally deferred
	// to migration, while newer/invalid schemas remain resolution errors.
	let manifestRaw;
	let versionClassification;
	if (statusOf(results, "adoption.manifest-clean") === "pass") {
		const p = join(root, ".pi", "sdlc", "sdlc.config.json");
		let failure = null;
		if (!headIsRegularFile(manifestGitPath)) failure = "manifest is not a regular file in HEAD";
		if (!failure)
			try {
				manifestRaw = JSON.parse(readFileChecked(p));
			} catch (e) {
				failure = e instanceof SyntaxError ? "manifest is not valid JSON" : "manifest is unreadable";
			}
		if (!failure) {
			versionClassification = classifyConfigVersion(manifestRaw);
			if (versionClassification.kind === "current") {
				const issues = inspectConfig(manifestRaw);
				if (issues.length > 0) failure = `manifest is invalid: ${issues[0].message}`;
			} else if (versionClassification.kind === "older") {
				set("config.valid", "pass", `manifest parses; schemaVersion ${versionClassification.version} is a recognised superseded schema (full validation deferred to migration)`);
			} else if (versionClassification.kind === "newer") {
				set("config.valid", "error", REMEDY_SCHEMA_NEWER(versionClassification.version));
			} else {
				const issues = inspectConfig(manifestRaw);
				failure = `manifest is invalid: ${issues[0]?.message ?? `schemaVersion must be ${CONFIG_SCHEMA_VERSION}`}`;
			}
		}
		if (failure) set("config.valid", "error", failure, `fix ${manifestGitPath} and commit the correction`);
		else if (!results.has("config.valid")) set("config.valid", "pass", "committed manifest is valid");
	}

	if (statusOf(results, "config.valid") === "pass") {
		if (versionClassification.kind === "older") {
			set("config.schema-current", "fail", `config schema is behind this skill (schemaVersion ${versionClassification.version} < ${CONFIG_SCHEMA_VERSION})`, REMEDY_SCHEMA_OLDER(versionClassification.version));
		} else {
			set("config.schema-current", "pass", `config schema is current (schemaVersion ${CONFIG_SCHEMA_VERSION})`);
		}
	}

	if (statusOf(results, "config.schema-current") === "pass") {
		if (manifestRaw.panels !== undefined) set("config.panels", "pass", "panels roster present");
		else set("config.panels", "fail", "no panels roster in the manifest", "add a panels block to .pi/sdlc/sdlc.config.json (see schema/sdlc.config.example.json)");
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
	// nearest evaluated non-pass ancestor's stable reason (spec §2.8 skip
	// messages). SKIP_REASON strings describe fail semantics; an errored
	// ancestor propagates its own accurate message instead.
	const reasonFor = (id) => {
		const r = results.get(id);
		if (r && r.status === "error") return r.message;
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

	return { schemaVersion: 2, root, state, exitCode, checks };
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
		process.stdout.write(renderJson({ schemaVersion: 2, root: resolve(process.cwd()), state: "error", exitCode: 2, checks }));
	} else {
		console.error(`sdlc-status: internal failure: ${message}`);
	}
	process.exit(2);
}
