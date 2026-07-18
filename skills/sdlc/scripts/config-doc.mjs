#!/usr/bin/env node
// config-doc.mjs — deterministic render/write/check for the consumer companion
// `.pi/sdlc/CONFIG.md` (Spec §§11-14, groups B). One renderer backs render,
// write, and check, so `write` output and the `check` expected render are
// byte-identical by construction. Node builtins only; no new runtime deps.
//
// Usage:
//   config-doc.sh render [--repo-root DIR] [--format text|json]
//   config-doc.sh write  [--repo-root DIR] [--force] [--format text|json]
//   config-doc.sh check  [--repo-root DIR] [--format text|json]
//
// Exits: render 0 valid / 2 invalid-config. check 0 current / 1 missing|stale /
// 2 error. write 0 created|retained|regenerated|forced / 2 invalid-config /
// 3 refused (unrecognized collision without --force).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { inspectConfig } from "./lib.mjs";

export const CURRENT_SENTINEL_VERSION = "v1";
// Every render-format version ever shipped in a released pi-sdlc stays here so a
// correctly-generated companion from any prior release remains recognized. A
// version leaves this set only at a package major boundary (Spec §13).
export const SUPPORTED_SENTINEL_VERSIONS = new Set(["v1"]);

const COMPANION_REL = join(".pi", "sdlc", "CONFIG.md");
const CONFIG_REL = join(".pi", "sdlc", "sdlc.config.json");

// ---- canonical JSON + fingerprint (pinned, Spec §13) ----------------------

// Recursively rebuild every object with keys in ascending default-sort order;
// arrays keep their order; then JSON.stringify with no space argument.
function canonicalize(value) {
	if (Array.isArray(value)) return value.map(canonicalize);
	if (value && typeof value === "object") {
		const out = {};
		for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key]);
		return out;
	}
	return value;
}

export function canonicalJson(config) {
	return JSON.stringify(canonicalize(config));
}

export function fingerprint(config) {
	return createHash("sha256")
		.update(`${CURRENT_SENTINEL_VERSION}\u0000${canonicalJson(config)}`)
		.digest("hex");
}

// ---- sentinel grammar (Spec §13) ------------------------------------------

const SENTINEL_RE = /^<!-- pi-sdlc:config-doc (v[0-9]+) fingerprint=([0-9a-f]{64}) -->$/;

export function sentinelLine(config) {
	return `<!-- pi-sdlc:config-doc ${CURRENT_SENTINEL_VERSION} fingerprint=${fingerprint(config)} -->`;
}

// Parse the first physical line of an on-disk companion.
export function parseSentinel(text) {
	const firstLine = text.split("\n", 1)[0] ?? "";
	const m = SENTINEL_RE.exec(firstLine);
	if (!m) return { present: firstLine.startsWith("<!-- pi-sdlc:config-doc"), wellFormed: false, version: null, recognized: false, fingerprint: null };
	const version = m[1];
	return { present: true, wellFormed: true, version, recognized: SUPPORTED_SENTINEL_VERSIONS.has(version), fingerprint: m[2] };
}

// ---- config loading -------------------------------------------------------

function loadConfig(repoRoot) {
	const path = join(repoRoot, CONFIG_REL);
	if (!existsSync(path)) return { ok: false, reason: `sdlc.config.json not found at ${CONFIG_REL}` };
	let raw;
	try {
		raw = JSON.parse(readFileSync(path, "utf8"));
	} catch (e) {
		return { ok: false, reason: `sdlc.config.json is not valid JSON: ${e?.message || e}` };
	}
	const issues = inspectConfig(raw);
	if (issues.length > 0) return { ok: false, reason: `sdlc.config.json is invalid: ${issues[0].path || "<root>"} — ${issues[0].message}` };
	return { ok: true, config: raw };
}

// ---- effective-shape helpers ----------------------------------------------

function effectiveReview(config, track) {
	const base = config.review ?? {};
	const over = config.overrides?.[track]?.review ?? {};
	return { ...base, ...over };
}

const GATE_MEANING = {
	panel: "an adversarial multi-model panel runs and must reach its stop condition",
	advisory: "a panel runs for advice only; findings do not block",
	human: "a human owner reviews and approves; no model panel",
	off: "no gate runs at this phase",
};
const TASKS_MEANING = {
	subagent: "each task ends with a validator subagent running the deterministic runner",
	self: "the implementer runs the declared checks directly (no subagent dispatch)",
	off: "per-task validation is skipped entirely",
};

// ---- renderer (Spec §14, deterministic) -----------------------------------

function trackSummary(config, track) {
	const r = effectiveReview(config, track);
	const phases = track === "irreversible" ? "brainstorm, plan, spec, build, implement, PR" : "brainstorm, plan, build, implement, PR";
	const designNote = track === "reversible" ? " (reversible: no pre-PR design panel unless configured; the PR panel still runs)" : "";
	return [
		`### Track: ${track}`,
		"",
		`- **Phases:** ${phases}.`,
		`- **Design gate (\`review.design\`): ${r.design}** — ${GATE_MEANING[r.design] ?? "see sdlc.config.json"}${designNote}.`,
		`- **Code/PR gate (\`review.code\`): ${r.code}** — ${GATE_MEANING[r.code] ?? "see sdlc.config.json"}.`,
		`- **Brainstorm gate (\`review.brainstorm\`): ${r.brainstorm}**.`,
		`- **Task validation (\`review.tasks\`): ${r.tasks}** — ${TASKS_MEANING[r.tasks] ?? "see sdlc.config.json"}.`,
		`- **Panel floor (\`review.panelSize\`): ${r.panelSize}** distinct model(s); shortfall posture \`review.onShortfall\`: ${r.onShortfall}.`,
		`- **Separate Specification (\`shape.separateSpec\`): ${config.shape.separateSpec}** — ${config.shape.separateSpec ? "Plan and Spec are distinct gated artifacts" : "Plan and Spec merge into one gated artifact"}.`,
		"",
	].join("\n");
}

const KEY_REFERENCE = {
	schemaVersion: "The config schema version this skill requires. Alternatives: none (must equal the skill's supported version).",
	prefix: "Issue/branch prefix for this project. Alternatives: any prefix matching the schema pattern.",
	labelPrefix: "Tracker label family prefix. Alternatives: any prefix matching the schema pattern.",
	announce: "The startup announcement string. Alternatives: any non-empty string.",
	paths: "Artifact homes (plans/specs/reviews/agents). Alternatives: any repo-relative paths; references route artifacts here.",
	tracker: "GitHub tracker repo + board for map/epic modes. Alternatives: omit to disable tracker-backed modes.",
	hooks: "Local before/after workflow hooks per phase. Alternatives: omit, or declare run/use items (see system-reference Hooks).",
	review: "The six review dials (brainstorm/design/code/tasks/panelSize/onShortfall). An override under `overrides.<track>.review` changes the effective result per track.",
	shape: 'separateSpec / publishToTracker / defaultTrack. Alternatives per schema; publishToTracker may be an integer or "never".',
	overrides: "Per-track (irreversible/reversible) dial overrides. Alternatives: omit, or override review dials for one track.",
	panels: "The panel roster (authorDefault + per-phase prefer/panelSize). Resolved live against credentials by resolve-panel.",
};

function keyReference(config) {
	const lines = ["## Configuration keys (JSON order)", ""];
	for (const key of Object.keys(config)) {
		const value = JSON.stringify(config[key]);
		const bounded = value.length > 200 ? `${value.slice(0, 197)}...` : value;
		lines.push(`- **\`${key}\`** = \`${bounded}\``);
		lines.push(`  - ${KEY_REFERENCE[key] ?? "Persisted config key; see sdlc.config.json and the schema."}`);
	}
	lines.push("");
	return lines.join("\n");
}

// The full expected companion file for a validated config. Deterministic:
// repeated calls with the same config are byte-identical.
export function render(config) {
	const fp = fingerprint(config);
	const parts = [
		sentinelLine(config),
		"",
		"# pi-sdlc effective configuration (generated)",
		"",
		"> **Generated file — do not hand-edit.** `.pi/sdlc/sdlc.config.json` is the",
		"> authoritative manifest; this companion only *explains* it. Hand edits are",
		"> unsupported and are detected as stale. Regenerate with `config-doc.sh write`.",
		"",
		"## Effective lifecycle shape",
		"",
		"The behaviour below is derived only from the committed `sdlc.config.json`",
		"values, resolved per track. The default track is",
		`\`shape.defaultTrack: ${config.shape.defaultTrack}\`; tracker publication threshold`,
		`\`shape.publishToTracker\` is \`${JSON.stringify(config.shape.publishToTracker)}\`.`,
		"",
		trackSummary(config, "irreversible"),
		trackSummary(config, "reversible"),
		keyReference(config),
		"## Fingerprint & generator format",
		"",
		`- generator format: \`${CURRENT_SENTINEL_VERSION}\``,
		`- fingerprint: \`${fp}\``,
		"- The fingerprint is `sha256(version + NUL + canonicalJson(config))`; it changes",
		"  when any config value changes or the render format is bumped. The check also",
		"  compares the full body byte-for-byte, so hand edits are detected as stale.",
		"",
		"## Regenerate & check",
		"",
		"```bash",
		"config-doc.sh write   # regenerate this file from sdlc.config.json",
		"config-doc.sh check   # report current | missing | stale | error",
		"```",
		"",
		"See `references/system-reference.md` for the full public system map.",
		"",
	];
	return parts.join("\n");
}

// ---- check (Spec §12; never writes) ---------------------------------------

export function check(repoRoot) {
	const path = COMPANION_REL;
	const loaded = loadConfig(repoRoot);
	const base = { schemaVersion: 1, path };
	if (!loaded.ok) {
		return { ...base, state: "error", exitCode: 2, sentinel: parseSentinelSafe(repoRoot), expectedFingerprint: null, reason: `invalid-config: ${loaded.reason}` };
	}
	const expected = render(loaded.config);
	const expectedFingerprint = fingerprint(loaded.config);
	const companionPath = join(repoRoot, COMPANION_REL);
	if (!existsSync(companionPath)) {
		return { ...base, state: "missing", exitCode: 1, sentinel: { present: false, wellFormed: false, version: null, recognized: false, fingerprint: null }, expectedFingerprint, reason: "companion file absent — run config-doc.sh write" };
	}
	const onDisk = readFileSync(companionPath, "utf8");
	const sentinel = parseSentinel(onDisk);
	if (!sentinel.recognized) {
		return { ...base, state: "error", exitCode: 2, sentinel, expectedFingerprint, reason: "collision: unrecognized companion (absent/malformed/unsupported sentinel); not overwritten without --force" };
	}
	if (sentinel.fingerprint === expectedFingerprint && onDisk === expected) {
		return { ...base, state: "current", exitCode: 0, sentinel, expectedFingerprint, reason: "companion matches the current expected render" };
	}
	return { ...base, state: "stale", exitCode: 1, sentinel, expectedFingerprint, reason: "companion differs from the current expected render — run config-doc.sh write" };
}

function parseSentinelSafe(repoRoot) {
	const companionPath = join(repoRoot, COMPANION_REL);
	if (!existsSync(companionPath)) return { present: false, wellFormed: false, version: null, recognized: false, fingerprint: null };
	return parseSentinel(readFileSync(companionPath, "utf8"));
}

// ---- write (Spec §13 matrix) ----------------------------------------------

export function write(repoRoot, { force = false } = {}) {
	const loaded = loadConfig(repoRoot);
	if (!loaded.ok) return { schemaVersion: 1, action: "error", exitCode: 2, path: COMPANION_REL, reason: `invalid-config: ${loaded.reason}` };
	const expected = render(loaded.config);
	const expectedFingerprint = fingerprint(loaded.config);
	const companionPath = join(repoRoot, COMPANION_REL);

	if (!existsSync(companionPath)) {
		writeCompanion(companionPath, expected);
		return { schemaVersion: 1, action: "created", exitCode: 0, path: COMPANION_REL, reason: "created new companion" };
	}
	const onDisk = readFileSync(companionPath, "utf8");
	const sentinel = parseSentinel(onDisk);
	if (!sentinel.recognized) {
		if (!force) return { schemaVersion: 1, action: "refused", exitCode: 3, path: COMPANION_REL, reason: "unrecognized consumer collision — pass --force to overwrite" };
		writeCompanion(companionPath, expected);
		return { schemaVersion: 1, action: "forced", exitCode: 0, path: COMPANION_REL, reason: "overwrote an unrecognized collision under --force" };
	}
	if (sentinel.fingerprint === expectedFingerprint && onDisk === expected) {
		return { schemaVersion: 1, action: "retained", exitCode: 0, path: COMPANION_REL, reason: "companion already current; retained byte-identical" };
	}
	writeCompanion(companionPath, expected);
	return { schemaVersion: 1, action: "regenerated", exitCode: 0, path: COMPANION_REL, reason: "regenerated stale/body-edited companion" };
}

function writeCompanion(companionPath, text) {
	mkdirSync(dirname(companionPath), { recursive: true });
	writeFileSync(companionPath, text);
}

// ---- CLI ------------------------------------------------------------------

function parseArgs(argv) {
	const [sub, ...rest] = argv;
	const opts = { repoRoot: ".", format: "text", force: false };
	for (let i = 0; i < rest.length; i++) {
		const a = rest[i];
		if (a === "--repo-root") opts.repoRoot = rest[++i];
		else if (a === "--format") opts.format = rest[++i];
		else if (a === "--force") opts.force = true;
		else return { error: `unknown argument: ${a}` };
	}
	if (opts.format !== "text" && opts.format !== "json") return { error: `--format must be text|json (got ${opts.format})` };
	return { sub, opts };
}

function printReport(report, format) {
	if (format === "json") {
		process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
		return;
	}
	const primary = report.state ?? report.action;
	process.stdout.write(`${primary}: ${report.reason}\n`);
	for (const [k, v] of Object.entries(report)) {
		if (k === "reason") continue;
		process.stdout.write(`${k}: ${typeof v === "object" ? JSON.stringify(v) : v}\n`);
	}
}

function main() {
	const { sub, opts, error } = parseArgs(process.argv.slice(2));
	if (error) {
		process.stderr.write(`config-doc: ${error}\n`);
		process.exit(2);
	}
	if (sub === "render") {
		const loaded = loadConfig(opts.repoRoot);
		if (!loaded.ok) {
			process.stderr.write(`config-doc: cannot render — ${loaded.reason}\n`);
			process.exit(2);
		}
		process.stdout.write(render(loaded.config));
		process.exit(0);
	}
	if (sub === "check") {
		const report = check(opts.repoRoot);
		printReport(report, opts.format);
		process.exit(report.exitCode);
	}
	if (sub === "write") {
		const report = write(opts.repoRoot, { force: opts.force });
		printReport(report, opts.format);
		process.exit(report.exitCode);
	}
	process.stderr.write("config-doc: usage: config-doc.sh render|write|check [--repo-root DIR] [--format text|json] [--force]\n");
	process.exit(2);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
