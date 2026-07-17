// telemetry.mjs — shared FS13 run-manifest event contract: the v1 event
// vocabulary, envelope/payload validators (hand-rolled, no runtime deps per
// NF2), run-identity resolution (§3.2), and run-store path helpers (§2).
//
// Consumed by the emitter (record-run-event.mjs), the FS5 side-effect emitters
// (resolve-panel/ensure-panel-agent/validate-task, lt-t2), and the collector
// (collect-run, lt-t4). The committed schema
// skills/sdlc-retro/schema/event.schema.json mirrors this file field-for-field.

import { execFileSync } from "node:child_process";
import { join } from "node:path";

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

export const KNOWN_EVENTS = Object.keys(EVENT_PAYLOADS);

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
