// telemetry.mjs — shared FS13 run-manifest event contract: the v1 event
// vocabulary, envelope/payload validators (hand-rolled, no runtime deps per
// NF2), run-identity resolution (§3.2), and run-store path helpers (§2).
//
// Consumed by the emitter (record-run-event.mjs), the FS5 side-effect emitters
// (resolve-panel/ensure-panel-agent/validate-task, lt-t2), and the collector
// (collect-run, lt-t4). The committed schema
// skills/sdlc-retro/schema/event.schema.json mirrors this file field-for-field.

import { execFileSync } from "node:child_process";
import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import { dirname, join } from "node:path";

const TELEMETRY_PREFIX = "sdlc-telemetry:";

export const EVENT_SCHEMA_VERSION = 1;
// A serialized line INCLUDING its LF terminator must not exceed 32 KiB (§3).
export const MAX_EVENT_BYTES = 32 * 1024;

// Slug grammar: identical to validate-task.mjs TASK_RE (§2).
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// `by` grammar (§3): script:<name> | agent | human:<slug>.
export const BY_RE = /^(script:[a-z][a-z0-9-]*|agent|human:[a-z0-9][a-z0-9-]*)$/;
// ISO-8601 UTC instant (trailing Z), optional fractional seconds.
export const TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

// The six lifecycle phases (payload field `phase`).
export const LIFECYCLE_PHASES = ["brainstorm", "plan", "spec", "build", "implement", "pr"];
// The four panel phases (payload field `panelPhase`) — the existing FS5
// vocabulary, deliberately distinct from lifecycle `phase`.
export const PANEL_PHASES = ["plan_review", "spec_review", "pr_review", "task_validate"];
// Fixed collector mapping from panel phase to lifecycle phase (§3).
export const PANEL_TO_LIFECYCLE = Object.freeze({
	plan_review: "plan",
	spec_review: "spec",
	pr_review: "pr",
	task_validate: "implement",
});

// Payload field descriptors per event (§3 table). Each entry is [name, type].
// Field types mirror the normative "Payload field types" paragraph.
export const EVENT_PAYLOADS = Object.freeze({
	"run.started": [
		["title", "nonEmptyString"],
		["track", "nonEmptyString"],
	],
	"phase.entered": [["phase", "lifecyclePhase"]],
	"phase.exited": [["phase", "lifecyclePhase"]],
	"phase.backward": [
		["from", "nonEmptyString"],
		["to", "nonEmptyString"],
		["reason", "nonEmptyString"],
	],
	"gate.approved": [
		["phase", "lifecyclePhase"],
		["artifact", "nonEmptyString"],
		["rev", "posInt"],
		["approver", "nonEmptyString"],
	],
	"artifact.revised": [
		["artifact", "nonEmptyString"],
		["rev", "posInt"],
		["reason", "nonEmptyString"],
	],
	"panel.resolved": [
		["panelPhase", "panelPhase"],
		["models", "stringArray"],
		["authorExcluded", "string"],
	],
	"panel.agent_stamped": [
		["panelPhase", "panelPhase"],
		["agent", "nonEmptyString"],
	],
	"panel.dispatched": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["models", "stringArray"],
	],
	"panel.harvested": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["dir", "nonEmptyString"],
		["missed", "stringArray"],
	],
	"panel.consolidated": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["findings", "findings"],
		["incorporated", "nonNegInt"],
		["dismissed", "nonNegInt"],
	],
	"task.validated": [
		["task", "nonEmptyString"],
		["verdict", "nonEmptyString"],
		["scenarioIds", "stringArray"],
	],
	"lifecycle.checked": [["verdict", "nonEmptyString"]],
	"pr.opened": [["number", "posInt"]],
	"pr.fix_wave": [
		["number", "posInt"],
		["sha", "nonEmptyString"],
	],
});

// Optional, additive payload fields per event: type-checked when present, never
// required (so emitting them is backward-compatible and omitting them is valid).
// `wave` distinguishes the logical review-wave from the harvest allocation label
// (`round`) on panel events; a replacement dispatch keeps its original wave.
export const OPTIONAL_EVENT_PAYLOADS = Object.freeze({
	"panel.dispatched": [["wave", "posInt"]],
	"panel.harvested": [["wave", "posInt"]],
	"panel.consolidated": [["wave", "posInt"]],
});

export const KNOWN_EVENTS = Object.keys(EVENT_PAYLOADS);

// ---- self-correction helpers (telemetry emitter DX) -----------------------
// Deriving both from the same EVENT_PAYLOADS/OPTIONAL_EVENT_PAYLOADS
// descriptors used for validation keeps templates and validation from
// drifting apart: one source of truth, no hand-written per-event strings.

// One "<name>":<placeholder> fragment for a payload field, typed per its
// declared validator type. Placeholders are illustrative, not valid JSON on
// their own (matching the existing prose convention in system-reference.md).
function fieldTemplate(name, type) {
	switch (type) {
		case "string":
		case "nonEmptyString":
			return `"${name}":"<${name}>"`;
		case "lifecyclePhase":
			return `"${name}":"<${LIFECYCLE_PHASES.join("|")}>"`;
		case "panelPhase":
			return `"${name}":"<${PANEL_PHASES.join("|")}>"`;
		case "posInt":
		case "nonNegInt":
			return `"${name}":<n>`;
		case "stringArray":
			return `"${name}":[...]`;
		case "findings":
			return `"${name}":{"high":<n>,"medium":<n>,"low":<n>}`;
		default:
			return `"${name}":"<${name}>"`;
	}
}

// The full `<event> --payload '{...}'` invocation template for a known event:
// required fields first, then any optional fields folded into the same
// payload object and named in a trailing note. Returns null for an unknown
// event (the caller decides how to report that).
export function renderEventTemplate(event) {
	const required = EVENT_PAYLOADS[event];
	if (!required) return null;
	const optional = OPTIONAL_EVENT_PAYLOADS[event] ?? [];
	const fields = [...required, ...optional].map(([name, type]) => fieldTemplate(name, type));
	const invocation = `${event} --payload '{${fields.join(",")}}'`;
	if (optional.length === 0) return invocation;
	const names = optional.map(([name]) => name).join(", ");
	return `${invocation} (${names} optional)`;
}

// Plain Levenshtein edit distance (iterative DP, no deps).
function editDistance(a, b) {
	const rows = a.length + 1;
	const cols = b.length + 1;
	const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
	for (let i = 0; i < rows; i++) dp[i][0] = i;
	for (let j = 0; j < cols; j++) dp[0][j] = j;
	for (let i = 1; i < rows; i++) {
		for (let j = 1; j < cols; j++) {
			dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
		}
	}
	return dp[rows - 1][cols - 1];
}

// The nearest known event to a mistyped input, or null when nothing is close
// enough to be a useful suggestion (threshold: <=3 edits, capped at half the
// input's length, so short/garbled input doesn't produce a nonsense guess).
export function suggestEvent(input) {
	if (typeof input !== "string" || input.length === 0) return null;
	const threshold = Math.min(3, Math.ceil(input.length / 2));
	let best = null;
	let bestDist = Number.POSITIVE_INFINITY;
	for (const event of KNOWN_EVENTS) {
		const dist = editDistance(input, event);
		if (dist < bestDist) {
			bestDist = dist;
			best = event;
		}
	}
	return best !== null && bestDist <= threshold ? best : null;
}

function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPosInt(v) {
	return Number.isInteger(v) && v > 0;
}

function isNonNegInt(v) {
	return Number.isInteger(v) && v >= 0;
}

// Validate a single field against its declared type. Returns an error string
// or null.
function fieldIssue(name, type, value) {
	switch (type) {
		case "string":
			return typeof value === "string" ? null : `${name} must be a string`;
		case "nonEmptyString":
			return typeof value === "string" && value.length > 0 ? null : `${name} must be a non-empty string`;
		case "lifecyclePhase":
			return LIFECYCLE_PHASES.includes(value) ? null : `${name} must be one of ${LIFECYCLE_PHASES.join("/")}`;
		case "panelPhase":
			return PANEL_PHASES.includes(value) ? null : `${name} must be one of ${PANEL_PHASES.join("/")}`;
		case "posInt":
			return isPosInt(value) ? null : `${name} must be a positive integer`;
		case "nonNegInt":
			return isNonNegInt(value) ? null : `${name} must be a non-negative integer`;
		case "stringArray":
			if (!Array.isArray(value)) return `${name} must be an array of non-empty strings`;
			return value.every((e) => typeof e === "string" && e.length > 0) ? null : `${name} entries must be non-empty strings`;
		case "findings":
			if (!isPlainObject(value)) return `${name} must be an object {high,medium,low}`;
			for (const k of ["high", "medium", "low"]) {
				if (!isNonNegInt(value[k])) return `${name}.${k} must be a non-negative integer`;
			}
			return null;
		default:
			return `${name} has an unknown declared type '${type}'`;
	}
}

// Validate a payload for a known event. Unknown fields are tolerated (payloads
// are additive-only; consumers ignore unknown fields, §3). Returns issues[].
// For an unknown event, only the generic payload-object constraint is applied;
// the caller decides whether the unknown event is a hard error (emitter) or a
// soft skip (collector).
export function validatePayload(event, payload) {
	const spec = EVENT_PAYLOADS[event];
	const issues = [];
	if (!isPlainObject(payload)) {
		issues.push("payload must be an object");
		return issues;
	}
	if (!spec) return issues;
	for (const [name, type] of spec) {
		if (!(name in payload)) {
			issues.push(`payload.${name} is required`);
			continue;
		}
		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
		if (problem) issues.push(problem);
	}
	// Optional fields: type-checked only when present; absence is never an issue.
	for (const [name, type] of OPTIONAL_EVENT_PAYLOADS[event] ?? []) {
		if (!(name in payload)) continue;
		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
		if (problem) issues.push(problem);
	}
	return issues;
}

// Validate the fixed v1 envelope (schemaVersion/ts/slug/event/by/payload). The
// envelope shape is frozen at v1 (unknown top-level keys are rejected); only
// event types and payload fields are forward-compatible. Returns issues[].
export function validateEnvelope(obj) {
	const issues = [];
	if (!isPlainObject(obj)) return ["record must be a JSON object"];
	const allowed = new Set(["schemaVersion", "ts", "slug", "event", "by", "payload"]);
	for (const k of Object.keys(obj)) if (!allowed.has(k)) issues.push(`unknown top-level field '${k}'`);
	if (obj.schemaVersion !== EVENT_SCHEMA_VERSION) issues.push(`schemaVersion must be ${EVENT_SCHEMA_VERSION}`);
	if (typeof obj.ts !== "string" || !TS_RE.test(obj.ts)) issues.push("ts must be an ISO-8601 UTC instant");
	if (typeof obj.slug !== "string" || !SLUG_RE.test(obj.slug)) issues.push("slug must match the slug grammar");
	if (typeof obj.event !== "string" || obj.event.length === 0) issues.push("event must be a non-empty string");
	if (typeof obj.by !== "string" || !BY_RE.test(obj.by)) issues.push("by must match script:<name>|agent|human:<slug>");
	if (!("payload" in obj)) issues.push("payload is required");
	else if (!isPlainObject(obj.payload)) issues.push("payload must be an object");
	return issues;
}

// Resolve the current git branch of `cwd`, or "" when unavailable (detached
// HEAD, not a repo). symbolic-ref exits non-zero on a detached HEAD.
export function currentBranch(cwd = process.cwd()) {
	try {
		return execFileSync("git", ["symbolic-ref", "--quiet", "--short", "HEAD"], {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return "";
	}
}

// §3.2 run-identity resolution: --slug flag -> SDLC_RUN_SLUG env -> current
// branch mapped to a slug. Returns { slug } on success or { skip: <reason> }
// when identity is unresolvable (a soft skip — never a thrown error). An
// explicit but non-conforming flag/env value is a skip, not a usage error
// (§3.1 lists neither as an exit-2 case).
export function resolveRunSlug({ slug, env = process.env, cwd = process.cwd() } = {}) {
	if (slug !== undefined) {
		return SLUG_RE.test(slug) ? { slug } : { skip: `--slug value '${slug}' is not a valid run slug` };
	}
	const envSlug = env.SDLC_RUN_SLUG;
	if (Object.hasOwn(env, "SDLC_RUN_SLUG")) {
		return typeof envSlug === "string" && SLUG_RE.test(envSlug) ? { slug: envSlug } : { skip: `SDLC_RUN_SLUG value '${envSlug ?? ""}' is not a valid run slug` };
	}
	const branch = currentBranch(cwd);
	if (!branch) return { skip: "run identity unresolvable: detached HEAD or no git branch" };
	if (branch === "main" || branch === "master") return { skip: `run identity unresolvable: on ${branch}` };
	// strip a single leading `<type>/` prefix, lowercase, map `/` to `-`
	const mapped = branch
		.replace(/^[^/]+\//, "")
		.toLowerCase()
		.replaceAll("/", "-");
	if (SLUG_RE.test(mapped)) return { slug: mapped };
	return { skip: `run identity unresolvable: branch '${branch}' does not map to a valid slug` };
}

// §2 run-store path helpers.
export function runStoreDir(root, slug) {
	return join(root, ".pi", "sdlc", "runs", slug);
}

export function runEventsPath(root, slug) {
	return join(runStoreDir(root, slug), "events.jsonl");
}

// Shared fail-soft stderr warning, one line, prefixed per §3.1/§3.3.
export function warnTelemetry(msg) {
	process.stderr.write(`${TELEMETRY_PREFIX} ${msg}\n`);
}

// §3.3 FS5 side-effect emission: best-effort emission for the frozen FS5 CLIs
// (resolve-panel, ensure-panel-agent, validate-task; later harvest-panel,
// lt-t3). Resolves run identity and appends one manifest line, but NEVER
// throws and NEVER exits the process — any failure (unresolvable identity,
// invalid payload, oversized line, I/O error) degrades to a single
// `sdlc-telemetry:`-prefixed stderr warning while the caller's primary
// stdout/exit-code contract stays byte-identical (NF3).
export function emitEvent({ event, slug, by, payload, root, cwd = root }) {
	try {
		const resolved = resolveRunSlug({ slug, cwd });
		if (resolved.skip) {
			warnTelemetry(`${resolved.skip} — skipping emission`);
			return;
		}
		if (typeof by !== "string" || !BY_RE.test(by)) {
			warnTelemetry(`--by value '${by}' violates the grammar script:<name>|agent|human:<slug> — skipping emission`);
			return;
		}
		const issues = validatePayload(event, payload);
		if (issues.length > 0) {
			warnTelemetry(`invalid payload for '${event}': ${issues.join("; ")} — skipping emission`);
			return;
		}
		const envelope = {
			schemaVersion: EVENT_SCHEMA_VERSION,
			ts: new Date().toISOString(),
			slug: resolved.slug,
			event,
			by,
			payload,
		};
		const line = `${JSON.stringify(envelope)}\n`;
		if (Buffer.byteLength(line, "utf8") > MAX_EVENT_BYTES) {
			warnTelemetry(`serialized event exceeds the ${MAX_EVENT_BYTES}-byte cap — skipping emission`);
			return;
		}
		const path = runEventsPath(root, resolved.slug);
		mkdirSync(dirname(path), { recursive: true });
		const fd = openSync(path, "a");
		try {
			const bytes = Buffer.from(line, "utf8");
			const written = writeSync(fd, bytes);
			if (written !== bytes.length) throw new Error(`short write: ${written} of ${bytes.length} bytes`);
		} finally {
			closeSync(fd);
		}
	} catch (err) {
		warnTelemetry(`I/O failure writing the run store: ${err?.message || err} — skipping emission`);
	}
}
