#!/usr/bin/env node
// record-run-event.mjs — FS13 emitter. Appends one run-manifest event to the
// consumer's run store, or skips (soft) when run identity is unresolvable.
//
// Usage: record-run-event.mjs <event> [--slug S] [--by WHO] [--payload JSON]
//                             [--config DIR | --repo-root DIR]
//
// Contract (spec §3.1): nothing is ever written to stdout; diagnostics go to
// stderr with the `sdlc-telemetry:` prefix; exit 0 on append or soft skip,
// exit 2 on usage/validation/I/O failure. All validation happens before any
// write, so no invalid record is ever attempted. No runtime deps (NF2).

import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import { dirname } from "node:path";
import { inspectRoot } from "./lib.mjs";
import { EVENT_SCHEMA_VERSION, KNOWN_EVENTS, MAX_EVENT_BYTES, BY_RE, resolveRunSlug, runEventsPath, validatePayload } from "./telemetry.mjs";

const PREFIX = "sdlc-telemetry:";

function warn(msg) {
	process.stderr.write(`${PREFIX} ${msg}\n`);
}

// Usage/validation failure: one prefixed diagnostic, exit 2. No write.
function bail(msg) {
	warn(msg);
	process.exit(2);
}

// Soft skip: one prefixed warning, exit 0. No write.
function skip(msg) {
	warn(`${msg} — skipping emission`);
	process.exit(0);
}

const argv = process.argv.slice(2);
let event = "";
let slug = "";
let by = "";
let payloadRaw = "";
let payloadSeen = false;
let config = "";
let repoRoot = "";

function needVal(name, i) {
	const v = argv[i + 1];
	if (v === undefined) bail(`${name} requires a value`);
	return v;
}

for (let i = 0; i < argv.length; i++) {
	const a = argv[i];
	if (a === "--slug") {
		slug = needVal("--slug", i);
		i++;
	} else if (a === "--by") {
		by = needVal("--by", i);
		i++;
	} else if (a === "--payload") {
		payloadRaw = needVal("--payload", i);
		payloadSeen = true;
		i++;
	} else if (a === "--config") {
		config = needVal("--config", i);
		i++;
	} else if (a === "--repo-root") {
		repoRoot = needVal("--repo-root", i);
		i++;
	} else if (a.startsWith("-")) {
		bail(`unexpected argument: ${a}`);
	} else if (!event) {
		event = a;
	} else {
		bail(`unexpected argument: ${a}`);
	}
}

// ---- prevalidation (all before any write) --------------------------------
if (!event) bail("usage: record-run-event <event> [--slug S] [--by WHO] [--payload JSON] [--config DIR|--repo-root DIR]");
if (!KNOWN_EVENTS.includes(event)) bail(`unknown event type '${event}'. Known: ${KNOWN_EVENTS.join(", ")}`);

const byValue = by || "agent";
if (!BY_RE.test(byValue)) bail(`--by value '${byValue}' violates the grammar script:<name>|agent|human:<slug>`);

let payload;
if (payloadSeen) {
	try {
		payload = JSON.parse(payloadRaw);
	} catch {
		bail("--payload is not valid JSON");
	}
} else {
	payload = {};
}

const payloadIssues = validatePayload(event, payload);
if (payloadIssues.length > 0) bail(`invalid payload for '${event}': ${payloadIssues.join("; ")}`);

// ---- run-identity resolution ---------------------------------------------
const rootResult = inspectRoot({ config: config || undefined, repoRoot: repoRoot || undefined });
if (!rootResult.ok) skip(rootResult.message);
const root = rootResult.root;

const resolved = resolveRunSlug({ slug, cwd: root });
if (resolved.skip) skip(resolved.skip);
const runSlug = resolved.slug;

// ---- serialize + size guard (still prevalidation) ------------------------
const envelope = {
	schemaVersion: EVENT_SCHEMA_VERSION,
	ts: new Date().toISOString(),
	slug: runSlug,
	event,
	by: byValue,
	payload,
};
const line = `${JSON.stringify(envelope)}\n`;
if (Buffer.byteLength(line, "utf8") > MAX_EVENT_BYTES) {
	bail(`serialized event exceeds the ${MAX_EVENT_BYTES}-byte cap`);
}

// ---- append atomically (single O_APPEND write) ---------------------------
const path = runEventsPath(root, runSlug);
try {
	mkdirSync(dirname(path), { recursive: true });
	const fd = openSync(path, "a");
	try {
		writeSync(fd, Buffer.from(line, "utf8"));
	} finally {
		closeSync(fd);
	}
} catch (err) {
	// An I/O failure is exit 2 for the dedicated emitter (FS5 callers wrap this
	// path in their own fail-soft handling, lt-t2).
	bail(`I/O failure writing the run store: ${err.message}`);
}

process.exit(0);
