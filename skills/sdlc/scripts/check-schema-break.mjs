#!/usr/bin/env node
// check-schema-break.mjs — require a release-visible breaking signal for config shape changes.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const USAGE = "usage: check-schema-break.mjs [--event PATH] [--repo-root DIR]";
const WATCHED_SCHEMAS = ["skills/sdlc/schema/sdlc.config.schema.json", "skills/sdlc/schema/sdlc.models.schema.json"];
const VERSION_FILE = "skills/sdlc/scripts/lib.mjs";
const VERSION_LINE = /^export const CONFIG_SCHEMA_VERSION\s*=.*$/m;

function parseArgs(argv) {
	const opts = { event: process.env.GITHUB_EVENT_PATH, repoRoot: process.env.GITHUB_WORKSPACE ?? process.cwd() };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--help" || arg === "-h") return { help: true };
		if (arg !== "--event" && arg !== "--repo-root") throw new Error(`unknown argument ${arg}`);
		if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error(`${arg} requires a value`);
		opts[arg === "--event" ? "event" : "repoRoot"] = argv[++i];
	}
	if (!opts.event) throw new Error("GITHUB_EVENT_PATH or --event is required");
	return opts;
}

function git(root, args, { allowMissingPath = false } = {}) {
	const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
	if (result.status === 0) return result.stdout;
	if (allowMissingPath && result.status === 128) return "";
	throw new Error((result.stderr || result.stdout || `git exited ${result.status}`).trim());
}

function readVersionLine(root, revision) {
	const source = git(root, ["show", `${revision}:${VERSION_FILE}`], { allowMissingPath: true });
	return source.match(VERSION_LINE)?.[0] ?? "";
}

function breakingSignal(title, body) {
	const breakingTitle = /^[a-z][a-z0-9-]*(?:\([^\r\n()]+\))?!:/i.test(title);
	const breakingBody = /^BREAKING(?: CHANGE|-CHANGE):/m.test(body);
	return breakingTitle || breakingBody;
}

export function inspectSchemaBreak({ event, repoRoot }) {
	let payload;
	try {
		payload = JSON.parse(readFileSync(event, "utf8"));
	} catch (error) {
		throw new Error(`cannot read pull-request event: ${error.message}`);
	}
	const pullRequest = payload.pull_request;
	if (!pullRequest || typeof pullRequest !== "object") throw new Error("event does not contain pull_request");
	const base = pullRequest.base?.sha;
	const head = pullRequest.head?.sha;
	const title = pullRequest.title;
	const body = pullRequest.body ?? "";
	if (typeof base !== "string" || typeof head !== "string" || typeof title !== "string" || typeof body !== "string") {
		throw new Error("pull_request event requires base.sha, head.sha, title, and a string or null body");
	}
	const root = resolve(repoRoot);
	const changed = git(root, ["diff", "--name-only", `${base}...${head}`, "--", ...WATCHED_SCHEMAS])
		.split("\n")
		.filter(Boolean);
	if (readVersionLine(root, base) !== readVersionLine(root, head)) changed.push(`${VERSION_FILE} (CONFIG_SCHEMA_VERSION)`);
	return { changed: [...new Set(changed)], signalled: breakingSignal(title, body) };
}

function main() {
	try {
		const opts = parseArgs(process.argv.slice(2));
		if (opts.help) {
			console.log(USAGE);
			return;
		}
		const result = inspectSchemaBreak(opts);
		if (result.changed.length === 0 || result.signalled) return;
		console.error("config schema shape changed without a release-visible breaking-change signal:");
		for (const path of result.changed) console.error(`- ${path}`);
		console.error("use a conventional PR title with ! (for example feat(config)!:) or add a BREAKING CHANGE: / BREAKING-CHANGE: line to the PR body");
		process.exitCode = 1;
	} catch (error) {
		console.error(`check-schema-break: ${error.message}`);
		console.error(USAGE);
		process.exitCode = 2;
	}
}

let invokedDirectly = false;
try {
	invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
} catch {
	invokedDirectly = false;
}
if (invokedDirectly) main();
