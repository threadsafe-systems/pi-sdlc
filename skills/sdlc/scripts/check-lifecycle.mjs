#!/usr/bin/env node
// check-lifecycle.mjs — FS9 declared-track lifecycle checker.
// Read-only, offline, deterministic; no network, model, credential, or shell
// interpolation of repository/PR-body content.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectConfig, inspectRoot } from "./lib.mjs";

const TRACKS = new Set(["irreversible", "reversible", "none"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHECK_IDS = ["cli.arguments", "root.resolve", "git.repository", "config.valid", "declaration.source", "declaration.parse", "declaration.track", "declaration.slug", "declaration.reason", "artifact.plan", "artifact.spec", "artifact.build"];
const PREREQ = {
	"cli.arguments": [],
	"root.resolve": ["cli.arguments"],
	"git.repository": ["root.resolve"],
	"config.valid": ["git.repository"],
	"declaration.source": ["cli.arguments"],
	"declaration.parse": ["declaration.source"],
	"declaration.track": ["declaration.parse"],
	"declaration.slug": ["declaration.track"],
	"declaration.reason": ["declaration.track"],
	"artifact.plan": ["config.valid", "declaration.slug"],
	"artifact.spec": ["config.valid", "declaration.slug"],
	"artifact.build": ["config.valid", "declaration.slug"],
};
const USAGE = "usage: check-lifecycle.sh [--config DIR | --repo-root DIR] [--format text|json] (--event FILE | --body FILE [--author LOGIN] | --track T [--slug S] [--reason R] [--author LOGIN])";

function git(cwd, args) {
	const r = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
	return { code: r.error ? -1 : (r.status ?? -1), stdout: (r.stdout ?? "").trim() };
}

function sanitize(value, max = 120) {
	return Array.from(String(value ?? ""), (character) => {
		const code = character.charCodeAt(0);
		return code < 32 || code === 127 ? " " : character;
	})
		.join("")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, max);
}

function escapeRegExp(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scanJsonMode(argv) {
	for (let i = 0; i < argv.length - 1; i++) if (argv[i] === "--format" && argv[i + 1] === "json") return true;
	return false;
}

function parseArgs(argv) {
	const out = { config: undefined, repoRoot: undefined, format: "text", event: undefined, body: undefined, author: undefined, track: undefined, slug: undefined, reason: undefined, help: false, error: null };
	const source = [];
	const err = (message) => {
		if (!out.error) out.error = message;
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const value = () => {
			const v = argv[++i];
			if (v === undefined || v.startsWith("--")) {
				err(`${a} requires a value`);
				return undefined;
			}
			return v;
		};
		if (a === "--help" || a === "-h") {
			out.help = true;
			continue;
		}
		if (a === "--config" || a === "--repo-root") {
			const v = value();
			if (a === "--config") out.config = v;
			else out.repoRoot = v;
		} else if (a === "--format") {
			const v = value();
			if (v !== undefined && v !== "text" && v !== "json") err("--format must be text or json");
			else if (v !== undefined) out.format = v;
		} else if (a === "--event") {
			out.event = value();
			source.push("event");
		} else if (a === "--body") {
			out.body = value();
			source.push("body");
		} else if (a === "--track") {
			out.track = value();
			source.push("flags");
		} else if (a === "--slug") out.slug = value();
		else if (a === "--reason") out.reason = value();
		else if (a === "--author") out.author = value();
		else err(`unexpected argument: ${a.includes("=") ? `${a.slice(0, a.indexOf("="))}=…` : a}`);
	}
	if (out.help) return out;
	if (out.config !== undefined && out.repoRoot !== undefined) err("--config and --repo-root are mutually exclusive");
	const uniqueSources = [...new Set(source)];
	if (uniqueSources.length !== 1 || source.length !== 1) err("exactly one declaration source group is required");
	if (uniqueSources[0] === "flags" && out.track === undefined) err("--track requires a value");
	if (uniqueSources[0] !== "flags" && (out.slug !== undefined || out.reason !== undefined)) err("--slug and --reason require --track");
	return out;
}

function parseBlock(body) {
	const lines = String(body ?? "")
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n")
		.split("\n");
	const blocks = [];
	for (let i = 0; i < lines.length; i++) {
		if (!/^```sdlc\s*$/.test(lines[i])) continue;
		const start = i;
		const content = [];
		i++;
		while (i < lines.length && !/^```\s*$/.test(lines[i])) content.push(lines[i++]);
		if (i >= lines.length) blocks.push({ error: `unterminated sdlc declaration at line ${start + 1}` });
		else blocks.push({ content, start: start + 1 });
	}
	if (blocks.length === 0) return { kind: "none" };
	if (blocks.length !== 1) return { kind: "invalid", error: "declaration is ambiguous; exactly one sdlc block is required" };
	if (blocks[0].error) return { kind: "invalid", error: blocks[0].error };
	const values = {};
	for (const line of blocks[0].content) {
		if (line.trim() === "") continue;
		const match = /^(track|slug|reason): (.*)$/.exec(line);
		if (!match) return { kind: "invalid", error: "declaration contains an invalid line" };
		if (Object.hasOwn(values, match[1])) return { kind: "invalid", error: `declaration repeats ${match[1]}` };
		values[match[1]] = match[2];
	}
	return { kind: "block", values };
}

function parseEvent(path) {
	let raw;
	try {
		raw = JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error(`cannot read event payload: ${sanitize(error.message)}`);
	}
	if (!raw || typeof raw !== "object" || !raw.pull_request || typeof raw.pull_request !== "object") throw new Error("event payload has no pull_request object");
	return { body: typeof raw.pull_request.body === "string" ? raw.pull_request.body : "", author: typeof raw.pull_request.user?.login === "string" ? raw.pull_request.user.login : undefined };
}

function parseDeclaration(source) {
	if (source.mode === "flags") return { kind: "block", values: { track: source.track, ...(source.slug === undefined ? {} : { slug: source.slug }), ...(source.reason === undefined ? {} : { reason: source.reason }) } };
	return parseBlock(source.body);
}

function setResult(results, id, status, message, remediation) {
	results.set(id, remediation === undefined ? { status, message } : { status, message, remediation });
}

function statusOf(results, id) {
	return results.get(id)?.status ?? "skip";
}
function prerequisitesPass(results, id) {
	return PREREQ[id].every((p) => statusOf(results, p) === "pass");
}

function checkValues(values, results) {
	if (!TRACKS.has(values.track)) setResult(results, "declaration.track", "fail", "track must be irreversible, reversible, or none");
	else setResult(results, "declaration.track", "pass", `track: ${values.track}`);
	const track = values.track;
	if (track === "none") {
		if (values.slug !== undefined) setResult(results, "declaration.slug", "fail", "slug is forbidden when track is none");
		else setResult(results, "declaration.slug", "pass", "slug not applicable for track: none");
	} else if (track === "irreversible" || track === "reversible") {
		if (values.slug === undefined) setResult(results, "declaration.slug", "fail", "slug is required for lifecycle tracks");
		else if (values.slug.length > 64 || !SLUG_RE.test(values.slug)) setResult(results, "declaration.slug", "fail", "slug must match lowercase hyphenated form and be at most 64 characters");
		else setResult(results, "declaration.slug", "pass", `slug: ${values.slug}`);
	} else setResult(results, "declaration.slug", "skip", "prerequisite declaration.track did not pass");
	if (track === "none") {
		if (values.reason === undefined || values.reason.length === 0 || values.reason.length > 200 || /[\r\n]/.test(values.reason)) setResult(results, "declaration.reason", "fail", "reason is required for track none and must be one non-empty line of at most 200 characters");
		else setResult(results, "declaration.reason", "pass", "reason supplied");
	} else if (track === "irreversible" || track === "reversible") {
		if (values.reason !== undefined) setResult(results, "declaration.reason", "fail", "reason is forbidden on lifecycle tracks");
		else setResult(results, "declaration.reason", "pass", "reason not applicable for lifecycle track");
	} else setResult(results, "declaration.reason", "skip", "prerequisite declaration.track did not pass");
}

function main(argv = process.argv.slice(2), cwd = process.cwd()) {
	const jsonMode = scanJsonMode(argv);
	const parsed = parseArgs(argv);
	if (parsed.help) return { report: null, jsonMode, help: true };
	const results = new Map();
	const report = { schemaVersion: 1, root: resolve(cwd), mode: parsed.event ? "event" : parsed.body ? "body" : "flags", state: "error", exitCode: 2, track: null, slug: null, reason: null, exempt: false, checks: [] };
	if (parsed.error) setResult(results, "cli.arguments", "error", parsed.error, USAGE);
	else setResult(results, "cli.arguments", "pass", "arguments are valid");
	let root = report.root;
	if (statusOf(results, "cli.arguments") === "pass") {
		const inspected = inspectRoot({ config: parsed.config, repoRoot: parsed.repoRoot, cwd });
		if (inspected.ok) {
			root = inspected.root;
			report.root = root;
			setResult(results, "root.resolve", "pass", "consumer root resolved");
		} else setResult(results, "root.resolve", "error", inspected.message, "pass --config <dir> or --repo-root <dir>, or set $SDLC_ROOT");
	}
	let prefix = "";
	if (prerequisitesPass(results, "git.repository")) {
		const top = git(root, ["rev-parse", "--show-toplevel"]);
		if (top.code !== 0 || !top.stdout) setResult(results, "git.repository", "error", "resolved root is not within a git worktree", "run inside a git repository");
		else {
			const rel = relative(resolve(top.stdout), resolve(root));
			if (rel.startsWith("..") || isAbsolute(rel)) setResult(results, "git.repository", "error", "resolved root escapes its git top-level");
			else {
				prefix = rel.split(sep).filter(Boolean).join("/");
				setResult(results, "git.repository", "pass", "resolved root is a git worktree");
			}
		}
	}
	let config;
	if (prerequisitesPass(results, "config.valid")) {
		const configPath = join(root, ".pi", "sdlc", "sdlc.config.json");
		try {
			if (!existsSync(configPath)) throw new Error("manifest is absent");
			const raw = JSON.parse(readFileSync(configPath, "utf8"));
			const issues = inspectConfig(raw);
			if (issues.length) throw new Error(`manifest is invalid: ${issues[0].message}`);
			config = { paths: { plans: "docs/plans", specs: "docs/specs", ...(raw.paths ?? {}) } };
			setResult(results, "config.valid", "pass", "committed configuration is valid");
		} catch (error) {
			setResult(results, "config.valid", "error", sanitize(error.message), "fix and commit .pi/sdlc/sdlc.config.json");
		}
	}
	let source;
	if (prerequisitesPass(results, "declaration.source")) {
		try {
			if (parsed.event) {
				const event = parseEvent(parsed.event);
				source = { mode: "event", ...event };
				report.mode = "event";
			} else if (parsed.body) {
				source = { mode: "body", body: readFileSync(parsed.body, "utf8"), author: parsed.author };
				report.mode = "body";
			} else source = { mode: "flags", track: parsed.track, slug: parsed.slug, reason: parsed.reason, author: parsed.author };
			setResult(results, "declaration.source", "pass", "declaration source read");
		} catch (error) {
			setResult(results, "declaration.source", "error", sanitize(error.message), "provide a readable declaration source");
		}
	}
	let values;
	if (prerequisitesPass(results, "declaration.parse")) {
		const parsedDeclaration = parseDeclaration(source);
		const author = source.author;
		const bot = typeof author === "string" && author.endsWith("[bot]");
		if (parsedDeclaration.kind === "block") {
			values = parsedDeclaration.values;
			setResult(results, "declaration.parse", "pass", "one declaration structure parsed");
		} else if (bot) {
			values = { track: "none", reason: `auto-generated PR (author: ${author})` };
			report.exempt = true;
			setResult(results, "declaration.parse", "pass", `no valid declaration; auto-generated exemption applies (author: ${sanitize(author)})`);
		} else setResult(results, "declaration.parse", "fail", parsedDeclaration.kind === "invalid" ? parsedDeclaration.error : "no sdlc declaration block found", "add exactly one sdlc declaration block");
	}
	if (prerequisitesPass(results, "declaration.track")) {
		checkValues(values, results);
		report.track = values.track ?? null;
		if (statusOf(results, "declaration.slug") === "pass") report.slug = values.slug ?? null;
		if (statusOf(results, "declaration.reason") === "pass" && values.track === "none") report.reason = values.reason ?? null;
	}
	for (const id of ["artifact.plan", "artifact.spec", "artifact.build"]) {
		if (!prerequisitesPass(results, id)) continue;
		const track = values?.track;
		if (track === "none") {
			setResult(results, id, "skip", "no artifact demanded for track: none");
			continue;
		}
		if (id === "artifact.spec" && track === "reversible") {
			setResult(results, id, "skip", "specification not required on the reversible track");
			continue;
		}
		const pathKey = id === "artifact.spec" ? "specs" : "plans";
		const suffix = id === "artifact.build" ? "-build" : "";
		const configured = config?.paths?.[pathKey];
		if (!configured) {
			setResult(results, "config.valid", "error", `configured ${pathKey} path is unavailable`);
			setResult(results, id, "skip", "prerequisite config.valid did not pass");
			continue;
		}
		const absoluteDir = resolve(root, configured);
		const rootRelative = relative(resolve(root), absoluteDir);
		if (rootRelative.startsWith("..") || isAbsolute(rootRelative)) {
			setResult(results, "config.valid", "error", `configured ${pathKey} path escapes the consumer root`);
			setResult(results, id, "skip", "prerequisite config.valid did not pass");
			continue;
		}
		const treePath = `${prefix ? `${prefix}/` : ""}${configured.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "")}`;
		const listing = git(root, ["ls-tree", "-r", "--name-only", "HEAD", "--", `${treePath}/`]);
		if (listing.code !== 0) {
			setResult(results, id, "fail", "no matching committed artifact");
			continue;
		}
		const expected = new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${escapeRegExp(values.slug)}${suffix}\\.md$`);
		const matches = listing.stdout
			.split("\n")
			.filter(Boolean)
			.map((p) => p.slice(`${treePath}/`.length))
			.filter((p) => !p.includes("/") && expected.test(p));
		if (matches.length === 0) setResult(results, id, "fail", `no committed ${id.slice("artifact.".length)} document found for slug ${values.slug}`);
		else setResult(results, id, "pass", `${id.slice("artifact.".length)} document(s): ${matches.join(", ")}`);
	}
	for (const id of CHECK_IDS)
		if (!results.has(id)) {
			const failed = PREREQ[id].find((p) => statusOf(results, p) !== "pass");
			setResult(results, id, "skip", failed ? `prerequisite ${failed} did not pass` : "not applicable");
		}
	report.checks = CHECK_IDS.map((id) => ({ id, ...results.get(id) }));
	if (report.checks.some((c) => c.status === "error")) {
		report.state = "error";
		report.exitCode = 2;
	} else if (report.checks.some((c) => c.status === "fail")) {
		report.state = "fail";
		report.exitCode = 1;
	} else {
		report.state = "pass";
		report.exitCode = 0;
	}
	return { report, jsonMode, help: false };
}

function renderText(report) {
	const lines = [`root: ${report.root}`, `mode: ${report.mode}`, `state: ${report.state}`, `exit-code: ${report.exitCode}`, `track: ${report.track ?? "-"}`, `slug: ${report.slug ?? "-"}`, `reason: ${report.reason ?? "-"}`, `exempt: ${report.exempt}`];
	for (const check of report.checks) {
		lines.push(`check: ${check.id} ${check.status} — ${check.message}`);
		if (check.remediation) lines.push(`remediation: ${check.id} — ${check.remediation}`);
	}
	return `${lines.join("\n")}\n`;
}

function run() {
	const result = main();
	if (result.help) {
		console.log(USAGE);
		return;
	}
	process.stdout.write(result.jsonMode ? `${JSON.stringify(result.report, null, 2)}\n` : renderText(result.report));
	process.exitCode = result.report.exitCode;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();

export { CHECK_IDS, parseArgs, parseBlock, main, renderText, scanJsonMode };
