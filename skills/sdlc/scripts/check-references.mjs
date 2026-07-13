#!/usr/bin/env node
// NORMATIVE-REFERENCE-CHECKER: FS11-v1
// Offline package-reference inventory checker. It never executes inventory data.

import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPORT_VERSION = 1;
const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = dirname(dirname(dirname(dirname(scriptPath))));
const defaultInventory = join(defaultRoot, "skills", "sdlc", "assets", "normative-references.json");
const allowedEntryKeys = new Set(["id", "source", "assertion", "targetKind", "ownership", "required", "resolution", "target", "verification"]);
const enums = {
	targetKind: new Set(["file", "command", "facility", "external"]),
	ownership: new Set(["package", "consumer", "external"]),
	resolution: new Set(["package", "consumer", "readiness", "external"]),
};

function sanitize(value) {
	let output = "";
	for (const char of String(value)) {
		const code = char.codePointAt(0);
		if (code === 10 || code === 13) output += "\\n";
		else if (code === 27 || code < 9 || (code >= 11 && code <= 31) || code === 127) output += `\\x${code.toString(16).padStart(2, "0")}`;
		else output += char;
	}
	return output.slice(0, 160);
}

function usage() {
	return "usage: check-references.mjs [--package-root DIR] [--inventory FILE] [--format text|json]";
}

function parseArgs(argv) {
	const out = { packageRoot: defaultRoot, inventory: defaultInventory, format: "text", help: false };
	const jsonRequested = argv.includes("--format=json") || argv.some((a, i) => a === "--format" && argv[i + 1] === "json");
	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		const value = (name) => {
			const next = argv[i + 1];
			if (next === undefined || next.startsWith("-")) throw new Error(`${name} requires a non-flag value`);
			i += 1;
			return next;
		};
		if (arg === "--package-root") out.packageRoot = value("--package-root");
		else if (arg === "--inventory") out.inventory = value("--inventory");
		else if (arg === "--format") out.format = value("--format");
		else if (arg.startsWith("--format=")) out.format = arg.slice("--format=".length);
		else if (arg === "--help" || arg === "-h") out.help = true;
		else throw new Error(`unknown argument ${arg}`);
	}
	if (!jsonRequested && out.format === "json") out.format = "json";
	if (out.format !== "text" && out.format !== "json") throw new Error("--format must be text or json");
	return { ...out, jsonRequested };
}

function contained(root, candidate) {
	const rootAbs = resolve(root);
	const candidateAbs = resolve(root, candidate);
	const rel = relative(rootAbs, candidateAbs);
	return rel === "" || (rel !== ".." && !rel.startsWith(`..${"/"}`) && !isAbsolute(rel));
}

function safeRelative(value, label) {
	if (typeof value !== "string" || value.length === 0 || isAbsolute(value) || value.split(/[\\/]/).includes("..")) {
		throw new Error(`${label} must be a contained relative path`);
	}
	return value;
}

function readJson(path, label) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error(`cannot read ${label}: ${error?.message || error}`);
	}
}

function validateInventory(raw, root) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("inventory must be an object");
	if (raw.schemaVersion !== 1 || raw.package !== "pi-sdlc" || !Array.isArray(raw.sources) || raw.sources.length === 0) {
		throw new Error("inventory requires schemaVersion 1, package pi-sdlc, and non-empty sources");
	}
	const ids = new Set();
	return raw.sources.map((entry, index) => {
		if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`sources[${index}] must be an object`);
		for (const key of Object.keys(entry)) if (!allowedEntryKeys.has(key)) throw new Error(`sources[${index}] has unknown key '${key}'`);
		for (const key of ["id", "source", "assertion", "targetKind", "ownership", "resolution", "target"]) {
			if (typeof entry[key] !== "string" || entry[key].length === 0) throw new Error(`sources[${index}].${key} must be non-empty text`);
		}
		if (ids.has(entry.id)) throw new Error(`duplicate inventory id '${entry.id}'`);
		ids.add(entry.id);
		if (!/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/.test(entry.id)) throw new Error(`invalid inventory id '${entry.id}'`);
		if (typeof entry.required !== "boolean") throw new Error(`sources[${index}].required must be boolean`);
		for (const field of Object.keys(enums)) if (!enums[field].has(entry[field])) throw new Error(`sources[${index}].${field} is invalid`);
		const source = safeRelative(entry.source, `sources[${index}].source`);
		if (!contained(root, source)) throw new Error(`sources[${index}].source escapes package root`);
		if (entry.ownership === "package" && entry.resolution !== "package") throw new Error(`${entry.id}: package ownership requires package resolution`);
		if (entry.ownership === "external" && entry.resolution !== "external") throw new Error(`${entry.id}: external ownership requires external resolution`);
		if (entry.ownership === "consumer" && !["consumer", "readiness"].includes(entry.resolution)) throw new Error(`${entry.id}: consumer ownership requires consumer or readiness resolution`);
		if (entry.resolution === "readiness") {
			if (!entry.verification || typeof entry.verification.source !== "string" || typeof entry.verification.assertion !== "string") throw new Error(`${entry.id}: readiness requires verification source and assertion`);
			const verification = safeRelative(entry.verification.source, `${entry.id}.verification.source`);
			if (!contained(root, verification)) throw new Error(`${entry.id}: verification source escapes package root`);
		}
		return entry;
	});
}

function makeReport(args, state, exitCode, checks, message = null) {
	return { schemaVersion: 1, reportVersion: REPORT_VERSION, packageRoot: resolve(args.packageRoot), inventory: resolve(args.inventory), state, exitCode, ...(message ? { error: sanitize(message) } : {}), checks };
}

function run(args) {
	if (args.help) return { report: null, help: usage(), exitCode: 0 };
	if (!existsSync(args.packageRoot)) throw new Error(`package root does not exist: ${args.packageRoot}`);
	if (!contained(args.packageRoot, args.inventory)) throw new Error("inventory must be inside package root");
	const raw = readJson(args.inventory, "inventory");
	const entries = validateInventory(raw, args.packageRoot);
	const checks = [];
	const add = (id, status, message) => checks.push({ id, status, message: sanitize(message) });
	for (const entry of entries) {
		if (entry.resolution !== "external") {
			const target = safeRelative(entry.target, `${entry.id}.target`);
			if (!contained(args.packageRoot, target)) throw new Error(`${entry.id}: target escapes package root`);
		}
		const sourcePath = resolve(args.packageRoot, entry.source);
		let source;
		try {
			source = readFileSync(sourcePath, "utf8");
		} catch (error) {
			throw new Error(`${entry.id}: cannot read source: ${error?.message || error}`);
		}
		const sourceCount = source.split(entry.assertion).length - 1;
		if (["package", "readiness"].includes(entry.resolution) && sourceCount !== 1) {
			add(entry.id, "fail", `source assertion occurs ${sourceCount} times; expected exactly once`);
			continue;
		}
		if (entry.resolution === "external") {
			add(entry.id, "external", `external facility: ${entry.target}`);
			continue;
		}
		if (entry.resolution === "consumer") {
			add(entry.id, "unverified-consumer", `consumer-owned target is not package-certified: ${entry.target}`);
			continue;
		}
		if (entry.resolution === "readiness") {
			const verifierPath = resolve(args.packageRoot, entry.verification.source);
			let verifier;
			try {
				verifier = readFileSync(verifierPath, "utf8");
			} catch (error) {
				throw new Error(`${entry.id}: cannot read verifier: ${error?.message || error}`);
			}
			const verifierCount = verifier.split(entry.verification.assertion).length - 1;
			if (verifierCount !== 1) {
				add(entry.id, "fail", `readiness assertion occurs ${verifierCount} times; expected exactly once`);
				continue;
			}
			add(entry.id, "pass", "readiness verification assertion is present");
			continue;
		}
		const target = safeRelative(entry.target, `${entry.id}.target`);
		if (!existsSync(resolve(args.packageRoot, target))) add(entry.id, "fail", `package target is missing: ${target}`);
		else add(entry.id, "pass", "package source assertion and target are present");
	}
	const failed = checks.some((c) => c.status === "fail");
	return { report: makeReport(args, failed ? "fail" : "pass", failed ? 1 : 0, checks), exitCode: failed ? 1 : 0 };
}

let args;
let result;
try {
	args = parseArgs(process.argv.slice(2));
	result = run(args);
} catch (error) {
	args ??= { packageRoot: defaultRoot, inventory: defaultInventory };
	result = { report: makeReport(args, "error", 2, [], error?.message || error), exitCode: 2 };
}
if (result.help) {
	console.log(result.help);
	process.exit(0);
}
const forceJson = process.argv.slice(2).some((arg, index, argv) => arg === "--format=json" || (arg === "--format" && argv[index + 1] === "json"));
if (args?.format === "json" || args?.jsonRequested || forceJson) console.log(JSON.stringify(result.report));
else if (result.report) {
	console.log(`reference-check: ${result.report.state}`);
	for (const check of result.report.checks) console.log(`check: ${check.id} ${check.status} — ${check.message}`);
	if (result.report.error) console.log(`error: ${result.report.error}`);
}
process.exit(result.exitCode);
