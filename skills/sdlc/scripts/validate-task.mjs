#!/usr/bin/env node
// validate-task.mjs — the deterministic per-task validation runner (PV2).
// Validates a committed task-validation manifest (PV1), executes its declared
// argv checks with shell:false, evaluates categories/scenarios, bounds and
// redacts evidence, and reports PASS/FAIL/ERROR. No network, model, or
// credential-file access. No runtime dependencies.

import { spawnSync } from "node:child_process";
import { closeSync, existsSync, fsyncSync, mkdtempSync, openSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

export const CATEGORY_ORDER = ["tests", "static", "scenarios", "standards", "bannedPatterns"];
const COMMAND_CATEGORIES = ["tests", "static", "standards", "bannedPatterns"];
const ID_RE = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const TASK_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SCENARIO_RE = /^[A-Z][A-Z0-9]*[0-9]+$/;
const ARGV_RE = /^[^\r\n]+$/;
const LABEL_RE = /^[^\r\n]+$/;
const REDACT_NAME_RE = /(^|_)(KEY|TOKEN|SECRET|PASSWORD|PASSWD|AUTH|CREDENTIALS?)(_|$)/i;
const TRUNCATION_MARK = "[...truncated; showing bounded tail...]\n";
const STREAM_MAX_LINES = 100;
const STREAM_MAX_BYTES = 10240;
const DEFAULT_TIMEOUT_MS = 120000;

function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

// ---- redaction ------------------------------------------------------------

export function buildRedactionValues(env) {
	const values = [];
	for (const [name, value] of Object.entries(env)) {
		if (typeof value !== "string" || value.length < 4) continue;
		if (REDACT_NAME_RE.test(name)) values.push(value);
	}
	// longest first so overlapping secrets redact greedily and deterministically
	return [...new Set(values)].sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0));
}

export function redact(text, values) {
	let out = text;
	for (const v of values) {
		if (!v) continue;
		out = out.split(v).join("[REDACTED]");
	}
	return out;
}

// ---- evidence bounding ----------------------------------------------------

export function boundStream(text) {
	if (text === "") return "";
	const hadTrailingNL = text.endsWith("\n");
	let lines = text.split("\n");
	if (hadTrailingNL) lines.pop();
	const joinedFull = lines.join("\n") + (hadTrailingNL ? "\n" : "");
	const truncated = lines.length > STREAM_MAX_LINES || Buffer.byteLength(joinedFull, "utf8") > STREAM_MAX_BYTES;
	if (!truncated) return joinedFull;
	// Reserve one line for the marker, keep the tail, then trim to the byte budget
	// in a single reverse pass (no O(n^2) shift loop).
	if (lines.length > STREAM_MAX_LINES - 1) lines = lines.slice(lines.length - (STREAM_MAX_LINES - 1));
	let joined = lines.join("\n") + (hadTrailingNL ? "\n" : "");
	const budget = STREAM_MAX_BYTES - Buffer.byteLength(TRUNCATION_MARK, "utf8");
	if (Buffer.byteLength(joined, "utf8") > budget) {
		const chars = Array.from(joined);
		let bytes = 0;
		let start = chars.length;
		for (let i = chars.length - 1; i >= 0; i--) {
			const b = Buffer.byteLength(chars[i], "utf8");
			if (bytes + b > budget) break;
			bytes += b;
			start = i;
		}
		joined = chars.slice(start).join("");
	}
	return TRUNCATION_MARK + joined;
}

function prepareStream(buf, values) {
	const decoded = (Buffer.isBuffer(buf) ? buf.toString("utf8") : String(buf ?? "")).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	return boundStream(redact(decoded, values));
}

// ---- manifest validation (PV1) -------------------------------------------

// Returns a sorted array of "<pointer>: <message>" strings; empty means valid.
export function inspectManifest(raw, { repoRoot } = {}) {
	const issues = [];
	const add = (pointer, message) => issues.push({ pointer, message });
	const sortAndFormat = () => {
		issues.sort((a, b) => (a.pointer < b.pointer ? -1 : a.pointer > b.pointer ? 1 : a.message < b.message ? -1 : a.message > b.message ? 1 : 0));
		return issues.map((i) => `${i.pointer}: ${i.message}`);
	};

	if (!isPlainObject(raw)) {
		add("", "manifest must be a JSON object");
		return sortAndFormat();
	}
	const allowed = new Set(["schemaVersion", "taskId", "buildPlan", "repoRoot", "ownedScenarios", "checks", "categories"]);
	for (const k of Object.keys(raw)) if (!allowed.has(k)) add(`/${k}`, `unknown property '${k}'`);

	if (raw.schemaVersion !== 1) add("/schemaVersion", "must be 1");
	if (typeof raw.taskId !== "string" || !TASK_RE.test(raw.taskId) || raw.taskId.length > 64) add("/taskId", "must match ^[a-z0-9]+(?:-[a-z0-9]+)*$ (max 64)");
	if (typeof raw.buildPlan !== "string" || raw.buildPlan.length === 0) add("/buildPlan", "must be a non-empty repo-relative path");
	else if (raw.buildPlan.startsWith("/") || raw.buildPlan.split("/").includes("..")) add("/buildPlan", "must be repo-relative with no '..' segment");
	else if (repoRoot && !existsSync(join(repoRoot, raw.buildPlan))) add("/buildPlan", "must resolve to an existing file inside the repo root");
	if (raw.repoRoot !== ".") add("/repoRoot", 'must be exactly "."');

	// checks
	const checkIds = new Set();
	const declared = [];
	if (!Array.isArray(raw.checks) || raw.checks.length === 0) {
		add("/checks", "must be a non-empty array");
	} else {
		raw.checks.forEach((c, i) => {
			const at = `/checks/${i}`;
			if (!isPlainObject(c)) {
				add(at, "must be an object");
				return;
			}
			for (const k of Object.keys(c)) if (!["id", "argv", "timeoutMs", "evidence"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
			if (typeof c.id !== "string" || !ID_RE.test(c.id) || c.id.length > 80) add(`${at}/id`, "invalid check id");
			else {
				if (checkIds.has(c.id)) add(`${at}/id`, `duplicate check id '${c.id}'`);
				checkIds.add(c.id);
				declared.push(c.id);
			}
			if (!Array.isArray(c.argv) || c.argv.length === 0) add(`${at}/argv`, "must be a non-empty array");
			else
				c.argv.forEach((a, j) => {
					if (typeof a !== "string" || !ARGV_RE.test(a) || a.includes("\u0000")) add(`${at}/argv/${j}`, "argv entries must be non-empty single-line strings without NUL");
				});
			if (c.timeoutMs !== undefined && (!Number.isInteger(c.timeoutMs) || c.timeoutMs < 1000 || c.timeoutMs > 600000)) add(`${at}/timeoutMs`, "must be an integer 1000-600000");
			if (!Array.isArray(c.evidence) || c.evidence.length === 0) add(`${at}/evidence`, "must be a non-empty array");
			else {
				const seen = new Set();
				c.evidence.forEach((e, j) => {
					if (typeof e !== "string" || !LABEL_RE.test(e) || e.length > 160) add(`${at}/evidence/${j}`, "evidence labels must be single-line strings (max 160)");
					else if (seen.has(e)) add(`${at}/evidence/${j}`, "duplicate evidence label");
					else seen.add(e);
				});
			}
		});
	}

	// ownedScenarios
	const owned = [];
	if (!Array.isArray(raw.ownedScenarios)) {
		add("/ownedScenarios", "must be an array");
	} else {
		const seen = new Set();
		raw.ownedScenarios.forEach((s, i) => {
			if (typeof s !== "string" || !SCENARIO_RE.test(s)) add(`/ownedScenarios/${i}`, "scenario ids must match ^[A-Z][A-Z0-9]*[0-9]+$");
			else if (seen.has(s)) add(`/ownedScenarios/${i}`, "duplicate scenario id");
			else {
				seen.add(s);
				owned.push(s);
			}
		});
	}

	// categories
	const referencedByRequired = new Set();
	if (!isPlainObject(raw.categories)) {
		add("/categories", "must be an object with all five categories");
	} else {
		for (const k of Object.keys(raw.categories)) if (!CATEGORY_ORDER.includes(k)) add(`/categories/${k}`, `unknown category '${k}'`);
		for (const name of COMMAND_CATEGORIES) {
			const cat = raw.categories[name];
			const at = `/categories/${name}`;
			if (!isPlainObject(cat)) {
				add(at, "missing or invalid category");
				continue;
			}
			if (cat.applicability === "required") {
				for (const k of Object.keys(cat)) if (!["applicability", "checkIds"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
				if (!Array.isArray(cat.checkIds) || cat.checkIds.length === 0) add(`${at}/checkIds`, "required category needs a non-empty checkIds");
				else {
					const seen = new Set();
					cat.checkIds.forEach((id, i) => {
						if (seen.has(id)) add(`${at}/checkIds/${i}`, "duplicate check id reference");
						seen.add(id);
						if (!checkIds.has(id)) add(`${at}/checkIds/${i}`, `references undeclared check '${id}'`);
						else referencedByRequired.add(id);
					});
				}
			} else if (cat.applicability === "n/a") {
				for (const k of Object.keys(cat)) if (!["applicability", "reason"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
				if (typeof cat.reason !== "string" || !LABEL_RE.test(cat.reason) || cat.reason.length < 12) add(`${at}/reason`, "n/a category needs a single-line reason of at least 12 characters");
			} else {
				add(`${at}/applicability`, "must be 'required' or 'n/a'");
			}
		}

		// scenarios category
		const sc = raw.categories.scenarios;
		const at = "/categories/scenarios";
		if (!isPlainObject(sc)) {
			add(at, "missing or invalid scenarios category");
		} else if (sc.applicability === "required") {
			for (const k of Object.keys(sc)) if (!["applicability", "evidence"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
			if (owned.length === 0) add(at, "scenarios must be n/a when ownedScenarios is empty");
			if (!isPlainObject(sc.evidence)) {
				add(`${at}/evidence`, "required scenarios need an evidence object");
			} else {
				const keys = Object.keys(sc.evidence);
				const ownedSet = new Set(owned);
				for (const s of owned) if (!keys.includes(s)) add(`${at}/evidence`, `missing scenario mapping for '${s}'`);
				for (const k of keys) if (!ownedSet.has(k)) add(`${at}/evidence`, `evidence maps unknown scenario '${k}'`);
				for (const [k, v] of Object.entries(sc.evidence)) {
					if (!Array.isArray(v) || v.length === 0) {
						add(`${at}/evidence/${k}`, "scenario evidence must be a non-empty check-id list");
						continue;
					}
					const seen = new Set();
					for (const id of v) {
						if (seen.has(id)) add(`${at}/evidence/${k}`, `duplicate mapped check '${id}'`);
						seen.add(id);
						if (!checkIds.has(id)) add(`${at}/evidence/${k}`, `maps undeclared check '${id}'`);
						else if (!referencedByRequired.has(id)) add(`${at}/evidence/${k}`, `maps check '${id}' not referenced by any required command category`);
					}
				}
			}
		} else if (sc.applicability === "n/a") {
			for (const k of Object.keys(sc)) if (!["applicability", "reason"].includes(k)) add(`${at}/${k}`, `unknown property '${k}'`);
			if (owned.length > 0) add(at, "scenarios cannot be n/a while ownedScenarios is non-empty");
			if (typeof sc.reason !== "string" || !LABEL_RE.test(sc.reason) || sc.reason.length < 12) add(`${at}/reason`, "n/a scenarios need a single-line reason of at least 12 characters");
		} else {
			add(`${at}/applicability`, "must be 'required' or 'n/a'");
		}
	}

	// every declared check referenced by at least one required category
	for (const id of declared) if (!referencedByRequired.has(id)) add("/checks", `check '${id}' is not referenced by any required category`);

	return sortAndFormat();
}

// ---- command execution ----------------------------------------------------

function runCommand(check, { repoRoot, redactionValues, env }) {
	const argv = check.argv;
	const timeout = check.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const start = process.hrtime.bigint();
	const r = spawnSync(argv[0], argv.slice(1), {
		cwd: repoRoot,
		shell: false,
		timeout,
		encoding: "buffer",
		maxBuffer: 64 * 1024 * 1024,
		env,
	});
	const durationMs = Number((process.hrtime.bigint() - start) / 1000000n);
	const timedOut = !!(r.error && (r.error.code === "ETIMEDOUT" || /ETIMEDOUT/.test(String(r.error.message))));
	const missing = !!(r.error && r.error.code === "ENOENT");
	const signal = r.signal ?? null;
	const exitCode = typeof r.status === "number" ? r.status : null;
	const ok = !r.error && exitCode === 0 && signal === null;
	const stdoutTail = missing ? "" : prepareStream(r.stdout, redactionValues);
	const stderrText = missing ? `executable not found: ${argv[0]}\n` : "";
	const stderrTail = missing ? boundStream(redact(stderrText, redactionValues)) : prepareStream(r.stderr, redactionValues);
	return {
		id: check.id,
		argv: argv.map((a) => redact(a, redactionValues)),
		evidence: check.evidence,
		status: ok ? "PASS" : "FAIL",
		exitCode,
		signal,
		timedOut,
		durationMs,
		stdoutTail,
		stderrTail,
	};
}

// ---- report assembly ------------------------------------------------------

function evaluate(manifest, commandResults) {
	const byId = new Map(commandResults.map((c) => [c.id, c]));
	const categories = [];
	for (const name of CATEGORY_ORDER) {
		const cat = manifest.categories[name];
		if (name === "scenarios") {
			if (cat.applicability === "n/a") categories.push({ category: name, status: "N/A", reason: cat.reason });
			else categories.push({ category: name, status: "pending" }); // filled after scenarios
			continue;
		}
		if (cat.applicability === "n/a") {
			categories.push({ category: name, status: "N/A", reason: cat.reason });
		} else {
			const pass = cat.checkIds.every((id) => byId.get(id)?.status === "PASS");
			categories.push({ category: name, status: pass ? "PASS" : "FAIL", checkIds: cat.checkIds });
		}
	}
	const scenarios = [];
	const sc = manifest.categories.scenarios;
	if (sc.applicability === "required") {
		for (const scenarioId of [...manifest.ownedScenarios].sort()) {
			const ids = sc.evidence[scenarioId];
			const pass = ids.every((id) => byId.get(id)?.status === "PASS");
			scenarios.push({ scenarioId, status: pass ? "PASS" : "FAIL", checkIds: ids });
		}
		const scPass = scenarios.every((s) => s.status === "PASS");
		const idx = categories.findIndex((c) => c.category === "scenarios");
		categories[idx] = { category: "scenarios", status: scPass ? "PASS" : "FAIL" };
	}
	return { categories, scenarios };
}

export function runManifest({ manifestPath, repoRoot, env = process.env }) {
	const canonicalRoot = realpathSync(repoRoot);
	const base = {
		schemaVersion: 1,
		taskId: null,
		manifest: manifestPath,
		repoRoot: canonicalRoot,
		verdict: "ERROR",
		exitCode: 2,
		errors: [],
		manifestErrors: [],
		commands: [],
		categories: [],
		scenarios: [],
	};

	// manifest must stay inside the repo root
	let absManifest;
	try {
		absManifest = realpathSync(isAbsolute(manifestPath) ? manifestPath : resolve(canonicalRoot, manifestPath));
	} catch {
		base.errors.push(`manifest not found: ${manifestPath}`);
		return base;
	}
	base.manifest = absManifest;
	if (absManifest !== canonicalRoot && !absManifest.startsWith(`${canonicalRoot}/`)) {
		base.errors.push("manifest path escapes the repository root");
		return base;
	}

	let raw;
	try {
		raw = JSON.parse(readFileSync(absManifest, "utf8"));
	} catch (e) {
		base.manifestErrors.push(`: cannot parse manifest: ${e?.message || e}`);
		return base;
	}

	const manifestErrors = inspectManifest(raw, { repoRoot: canonicalRoot });
	if (manifestErrors.length > 0) {
		base.taskId = typeof raw?.taskId === "string" ? raw.taskId : null;
		base.manifestErrors = manifestErrors;
		return base;
	}

	const redactionValues = buildRedactionValues(env);
	const commandResults = raw.checks.map((c) => runCommand(c, { repoRoot: canonicalRoot, redactionValues, env }));
	const { categories, scenarios } = evaluate(raw, commandResults);
	const anyFail = commandResults.some((c) => c.status === "FAIL") || categories.some((c) => c.status === "FAIL") || scenarios.some((s) => s.status === "FAIL");
	return {
		schemaVersion: 1,
		taskId: raw.taskId,
		manifest: absManifest,
		repoRoot: canonicalRoot,
		verdict: anyFail ? "FAIL" : "PASS",
		exitCode: anyFail ? 1 : 0,
		errors: [],
		manifestErrors: [],
		commands: commandResults,
		categories,
		scenarios,
	};
}

// ---- rendering ------------------------------------------------------------

export function renderText(report) {
	const lines = [];
	lines.push(`task: ${report.taskId ?? "unknown"}`);
	lines.push(`manifest: ${report.manifest}`);
	lines.push(`verdict: ${report.verdict}`);
	lines.push(`exit-code: ${report.exitCode}`);
	for (const e of report.errors) lines.push(`error: ${e}`);
	for (const e of report.manifestErrors) lines.push(`manifest-error: ${e}`);
	for (const c of report.commands) {
		lines.push(`command: ${c.id} ${c.status} exit=${c.exitCode ?? "null"} signal=${c.signal ?? "null"} timeout=${c.timedOut}`);
		if (c.stdoutTail) lines.push("stdout:", "```", c.stdoutTail.replace(/\n$/, ""), "```");
		if (c.stderrTail) lines.push("stderr:", "```", c.stderrTail.replace(/\n$/, ""), "```");
	}
	for (const c of report.categories) {
		if (c.status === "N/A") lines.push(`category: ${c.category} N/A reason=${c.reason}`);
		else lines.push(`category: ${c.category} ${c.status}${c.checkIds ? ` checks=${c.checkIds.join(",")}` : ""}`);
	}
	for (const s of report.scenarios) lines.push(`scenario: ${s.scenarioId} ${s.status} checks=${s.checkIds.join(",")}`);
	return `${lines.join("\n")}\n`;
}

function atomicWriteReport(target, json, canonicalRoot) {
	const absTarget = isAbsolute(target) ? target : resolve(canonicalRoot, target);
	const parent = dirname(absTarget);
	if (!existsSync(parent) || !statSync(parent).isDirectory()) throw new Error(`report parent directory does not exist: ${parent}`);
	const tmp = mkdtempSync(join(parent, ".validate-task-"));
	const tmpFile = join(tmp, "report.json");
	const fd = openSync(tmpFile, "w");
	try {
		writeSync(fd, json);
		fsyncSync(fd);
	} finally {
		closeSync(fd);
	}
	renameSync(tmpFile, absTarget);
	rmSync(tmp, { recursive: true, force: true });
}

// ---- CLI ------------------------------------------------------------------

// JSON mode is recognised if a well-formed `--format json` pair appears anywhere
// in argv, independent of position or a later parse error.
export function detectJsonMode(argv) {
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--format" && argv[i + 1] === "json") return true;
	}
	return false;
}

export function parseArgs(argv) {
	const opts = { format: "text", jsonMode: detectJsonMode(argv) };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = () => {
			const v = argv[++i];
			if (v === undefined) throw new Error(`${a} requires a value`);
			return v;
		};
		if (a === "--manifest") opts.manifest = val();
		else if (a === "--repo-root") opts.repoRoot = val();
		else if (a === "--report") opts.report = val();
		else if (a === "--format") {
			const f = val();
			if (f !== "text" && f !== "json") throw new Error(`--format must be text or json`);
			opts.format = f;
		} else if (a === "--help" || a === "-h") opts.help = true;
		else throw new Error(`unexpected argument: ${a}`);
	}
	return opts;
}

function main() {
	const argv = process.argv.slice(2);
	let opts;
	try {
		opts = parseArgs(argv);
	} catch (e) {
		return emitError(String(e.message || e), detectJsonMode(argv));
	}
	if (opts.help) {
		console.log("usage: validate-task.sh --manifest PATH [--repo-root DIR] [--format text|json] [--report PATH]");
		process.exit(0);
	}
	if (!opts.manifest) return emitError("--manifest is required", opts.jsonMode);

	let canonicalRoot;
	try {
		const root = opts.repoRoot ? (isAbsolute(opts.repoRoot) ? opts.repoRoot : resolve(opts.repoRoot)) : process.cwd();
		canonicalRoot = realpathSync(root);
	} catch (e) {
		return emitError(`cannot resolve repo root: ${e?.message || e}`, opts.jsonMode);
	}

	const report = runManifest({ manifestPath: opts.manifest, repoRoot: canonicalRoot });
	const json = `${JSON.stringify(report, null, 2)}\n`;

	if (opts.report) {
		try {
			atomicWriteReport(opts.report, json, canonicalRoot);
		} catch (e) {
			const errReport = { ...report, verdict: "ERROR", exitCode: 2, errors: [...report.errors, `report-write error: ${e?.message || e}`], commands: [], categories: [], scenarios: [], manifestErrors: report.manifestErrors };
			process.stdout.write(opts.format === "json" ? `${JSON.stringify(errReport, null, 2)}\n` : renderText(errReport));
			process.exit(2);
		}
	}

	process.stdout.write(opts.format === "json" ? json : renderText(report));
	process.exit(report.exitCode);
}

function emitError(message, jsonMode) {
	const report = {
		schemaVersion: 1,
		taskId: null,
		manifest: "",
		repoRoot: process.cwd(),
		verdict: "ERROR",
		exitCode: 2,
		errors: [message],
		manifestErrors: [],
		commands: [],
		categories: [],
		scenarios: [],
	};
	if (jsonMode) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	else process.stderr.write(`validate-task: ${message}\n`);
	process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
