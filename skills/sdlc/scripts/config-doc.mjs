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
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { effectiveReview, inspectConfig } from "./lib.mjs";

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

const SENTINEL_RE = /^<!-- pi-sdlc:config-doc (v[0-9]+) fingerprint=([0-9a-f]{64}) -->\r?$/;

export function sentinelLine(config) {
	return `<!-- pi-sdlc:config-doc ${CURRENT_SENTINEL_VERSION} fingerprint=${fingerprint(config)} -->`;
}

// Parse the first physical line of an on-disk companion. Tolerant of a leading
// BOM and a trailing CR so a line-ending/BOM rewrite of pi-sdlc's own generated
// output stays *recognized* (and is regenerated), never mistaken for a foreign
// consumer collision.
export function parseSentinel(text) {
	const firstLine = (text.split("\n", 1)[0] ?? "").replace(/^\uFEFF/, "");
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
// effectiveReview is the single shared helper imported from lib.mjs (Spec C3c);
// this renderer keeps no private merge so it cannot drift from resolve-panel.

const VALIDATE_MEANING = {
	panel: "an adversarial multi-model panel runs before the artifact is presented",
	skip: "no panel runs for this gate (an authored choice, not a bypass)",
};
const APPROVE_MEANING = {
	human: "a human owner adjudicates and advances",
	agent: "the agent adjudicates findings and advances (no human gate; the disposition discipline still applies)",
};

// Render one { validate, approve, preview? } gate dial to CONFIG.md lines; an
// optional note is appended to the validate line (e.g. the reversible caveat).
function gateDialLines(label, key, dial, note = "") {
	if (!dial || typeof dial !== "object") return [`- **${label} (\`${key}\`):** see sdlc.config.json.`];
	const lines = [`- **${label} — validate (\`${key}.validate\`): ${dial.validate}** — ${VALIDATE_MEANING[dial.validate] ?? "see sdlc.config.json"}${note}.`, `- **${label} — approve (\`${key}.approve\`): ${dial.approve}** — ${APPROVE_MEANING[dial.approve] ?? "see sdlc.config.json"}.`];
	if (dial.preview !== undefined) lines.push(`- **${label} — preview (\`${key}.preview\`):** reserved (no effect in v4).`);
	return lines;
}

const TASKS_MEANING = {
	subagent: "each task ends with a validator subagent running the deterministic runner",
	self: "the implementer runs the declared checks directly (no subagent dispatch)",
	off: "per-task validation is skipped entirely",
};

// ---- renderer (Spec §14, deterministic) -----------------------------------

function trackSummary(config, track) {
	const r = effectiveReview(config, track);
	const phases = track === "irreversible" ? "brainstorm, plan, spec, build, implement, PR" : "brainstorm, plan, build, implement, PR";
	const prNote = r.code?.validate === "skip" ? "no PR panel runs (review.code.validate: skip)" : "the PR panel still runs";
	const designNote = track === "reversible" ? ` (reversible: no pre-PR design panel unless configured; ${prNote})` : "";
	return [
		`### Track: ${track}`,
		"",
		`- **Phases:** ${phases}.`,
		...gateDialLines("Design gate", "review.design", r.design, designNote),
		...gateDialLines("Code/PR gate", "review.code", r.code),
		`- **Brainstorm gate (\`review.brainstorm\`): ${r.brainstorm ?? "see sdlc.config.json"}**.`,
		`- **Task validation (\`review.tasks\`): ${r.tasks ?? "see sdlc.config.json"}** — ${TASKS_MEANING[r.tasks] ?? "see sdlc.config.json"}.`,
		`- **Panel floor (\`review.panelSize\`): ${r.panelSize ?? "see sdlc.config.json"}** distinct model(s); shortfall posture \`review.onShortfall\`: ${r.onShortfall ?? "see sdlc.config.json"}.`,
		`- **Separate Specification (\`shape.separateSpec\`): ${config.shape.separateSpec}** — ${track === "reversible" ? "not applicable on the reversible fast path (no Spec phase); it governs the irreversible track's plan/spec split" : config.shape.separateSpec ? "Plan and Spec are distinct gated artifacts" : "Plan and Spec merge into one gated artifact"}.`,
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
		// Full current value (no truncation): Spec §14 requires each persisted key's
		// complete current value in the generated reference.
		const value = JSON.stringify(config[key]);
		lines.push(`- **\`${key}\`** = \`${value}\``);
		lines.push(`  - ${KEY_REFERENCE[key] ?? "Persisted config key; see sdlc.config.json and the schema."}`);
	}
	lines.push("");
	return lines.join("\n");
}

// Resolved panel floors, replicating resolve-panel's floorFor(): a per-phase
// `panels.phases.<phase>.panelSize` wins; else `task_validate` is 1; else the
// track's `overrides.<track>.review.panelSize`, else `review.panelSize`. Floors
// are track-dependent, so both tracks are rendered (§14 resolved floors/overrides).
function panelFloors(config) {
	const phases = config.panels?.phases ?? {};
	const floorFor = (phase, track) => {
		if (phases[phase]?.panelSize !== undefined) return phases[phase].panelSize;
		if (phase === "task_validate") return 1;
		return effectiveReview(config, track).panelSize; // shared merge (no private panelSize merge)
	};
	const names = ["plan_review", "spec_review", "pr_review", "task_validate"];
	const lines = ["## Resolved panel floors", "", "Resolved as `resolve-panel` does: a per-phase `panels.phases.<phase>.panelSize`", "wins; else `task_validate` is 1; else the track's", "`overrides.<track>.review.panelSize`, else `review.panelSize`.", ""];
	for (const track of ["irreversible", "reversible"]) {
		const parts = names.map((p) => `${p}=${floorFor(p, track) ?? "see sdlc.config.json"}`);
		lines.push(`- **${track}:** ${parts.join(", ")}.`);
	}
	lines.push("");
	return lines.join("\n");
}

// The full expected companion file for a validated config. Deterministic:
// repeated calls with the same config are byte-identical.
export function render(config) {
	if (!config || typeof config !== "object" || !config.shape || !config.review) {
		throw new Error("config-doc render requires a validated schemaVersion-4 config (review + shape present)");
	}
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
		panelFloors(config),
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
	if (isSymlink(companionPath)) {
		return { ...base, state: "error", exitCode: 2, sentinel: { present: true, wellFormed: false, version: null, recognized: false, fingerprint: null }, expectedFingerprint, reason: "collision: companion is a symlink; not followed (resolve by hand)" };
	}
	if (!existsSync(companionPath)) {
		return { ...base, state: "missing", exitCode: 1, sentinel: { present: false, wellFormed: false, version: null, recognized: false, fingerprint: null }, expectedFingerprint, reason: "companion file absent — run config-doc.sh write" };
	}
	const onDisk = readCompanion(companionPath);
	if (onDisk === null) {
		return { ...base, state: "error", exitCode: 2, sentinel: { present: true, wellFormed: false, version: null, recognized: false, fingerprint: null }, expectedFingerprint, reason: "collision: companion is present but unreadable (not a regular file?)" };
	}
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
	const text = readCompanion(companionPath);
	if (text === null) return { present: true, wellFormed: false, version: null, recognized: false, fingerprint: null };
	return parseSentinel(text);
}

// ---- write (Spec §13 matrix) ----------------------------------------------

export function write(repoRoot, { force = false } = {}) {
	const loaded = loadConfig(repoRoot);
	if (!loaded.ok) return { schemaVersion: 1, action: "error", exitCode: 2, path: COMPANION_REL, reason: `invalid-config: ${loaded.reason}` };
	const expected = render(loaded.config);
	const expectedFingerprint = fingerprint(loaded.config);
	const companionPath = join(repoRoot, COMPANION_REL);

	if (isSymlink(companionPath)) {
		return { schemaVersion: 1, action: "refused", exitCode: 3, path: COMPANION_REL, reason: "companion is a symlink; not overwritten (resolve by hand, even with --force)" };
	}
	if (!existsSync(companionPath)) {
		writeCompanion(companionPath, expected);
		return { schemaVersion: 1, action: "created", exitCode: 0, path: COMPANION_REL, reason: "created new companion" };
	}
	const onDisk = readCompanion(companionPath);
	if (onDisk === null) return { schemaVersion: 1, action: "refused", exitCode: 3, path: COMPANION_REL, reason: "companion is present but unreadable (not a regular file?) — resolve by hand" };
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

// Read an on-disk companion, returning null when it exists but cannot be read as
// text (e.g. a directory) so callers degrade deterministically instead of
// throwing past the state/exit contract.
function readCompanion(companionPath) {
	try {
		return readFileSync(companionPath, "utf8");
	} catch {
		return null;
	}
}

// A companion that is a symlink is never followed (a consumer collision could
// otherwise clobber a file outside the repo); callers treat it as a collision.
function isSymlink(p) {
	try {
		return lstatSync(p).isSymbolicLink();
	} catch {
		return false;
	}
}

// ---- CLI ------------------------------------------------------------------

function parseArgs(argv) {
	const [sub, ...rest] = argv;
	const opts = { repoRoot: ".", format: "text", force: false };
	for (let i = 0; i < rest.length; i++) {
		const a = rest[i];
		const value = (name) => {
			const next = rest[i + 1];
			if (next === undefined || next.startsWith("-")) return { missing: name };
			i += 1;
			return { value: next };
		};
		if (a === "--repo-root") {
			const r = value("--repo-root");
			if (r.missing) return { error: `${r.missing} requires a value` };
			opts.repoRoot = r.value;
		} else if (a === "--format") {
			const r = value("--format");
			if (r.missing) return { error: `${r.missing} requires a value` };
			opts.format = r.value;
		} else if (a === "--force") opts.force = true;
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

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
