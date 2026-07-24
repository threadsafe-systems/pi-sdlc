#!/usr/bin/env node
// record-run-event.mjs — FS13 emitter. Appends one run-manifest event to the
// consumer's run store, or skips (soft) when run identity is unresolvable.
//
// Usage: record-run-event.mjs <event> [--slug S] [--by WHO] [--payload JSON]
//                             [--config DIR | --repo-root DIR]
//
// Contract (spec §3.1): no *emission* invocation ever writes to stdout;
// diagnostics go to stderr with the `sdlc-telemetry:` prefix; exit 0 on
// append or soft skip, exit 2 on usage/validation/I/O failure. All
// validation happens before any write, so no invalid record is ever
// attempted. No runtime deps (NF2). `--list`/`--describe` are a distinct
// informational invocation class: they print to stdout, never touch the run
// store, and short-circuit before any run-identity or payload handling.

import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import { dirname } from "node:path";
import { inspectRoot } from "./lib.mjs";
import { EVENT_SCHEMA_VERSION, KNOWN_EVENTS, MAX_EVENT_BYTES, BY_RE, renderEventTemplate, resolveRunSlug, runEventsPath, suggestEvent, validatePayload } from "./telemetry.mjs";

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

// ---- informational invocations (--list / --describe) ---------------------
// Short-circuit before any other parsing: these never resolve run identity,
// never touch the run store, and are the one place this CLI writes stdout.
function unknownEventMessage(name) {
	const suggestion = suggestEvent(name);
	const hint = suggestion ? `did you mean '${suggestion}'? ` : "";
	return `unknown event type '${name}'. ${hint}known events: ${KNOWN_EVENTS.join(", ")}`;
}

if (argv.includes("--list")) {
	process.stdout.write(`${KNOWN_EVENTS.join("\n")}\n`);
	process.exit(0);
}
const describeIdx = argv.indexOf("--describe");
if (describeIdx !== -1) {
	const target = argv[describeIdx + 1];
	if (target === undefined) bail("--describe requires an event name");
	if (!KNOWN_EVENTS.includes(target)) bail(unknownEventMessage(target));
	process.stdout.write(`${renderEventTemplate(target)}\n`);
	process.exit(0);
}

let event = "";
let slug;
let by = "";
let bySeen = false;
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
		bySeen = true;
		i++;
	} else if (a === "--payload") {
		const v = argv[i + 1];
		if (v === undefined) {
			// event may already be resolved (it typically precedes --payload); when
			// it is, fold the expected template into the same one-bounce diagnostic
			// rather than making a missing value a second, template-less bail.
			const hint = event && KNOWN_EVENTS.includes(event) ? ` expected: ${renderEventTemplate(event)}` : "";
			bail(`--payload requires a value.${hint}`);
		}
		payloadRaw = v;
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
if (!event) bail("usage: record-run-event <event> [--slug S] [--by WHO] [--payload JSON] [--config DIR|--repo-root DIR] | --list | --describe <event>");
if (!KNOWN_EVENTS.includes(event)) bail(unknownEventMessage(event));

const byValue = bySeen ? by : "agent";
if (!BY_RE.test(byValue)) bail(`--by value '${byValue}' violates the grammar script:<name>|agent|human:<slug>`);

let payload;
if (payloadSeen) {
	try {
		payload = JSON.parse(payloadRaw);
	} catch {
		// event is already validated known at this point (the unknown-event bail
		// above runs first), so the template is always available here.
		bail(`--payload is not valid JSON. expected: ${renderEventTemplate(event)}`);
	}
} else {
	payload = {};
}

const payloadIssues = validatePayload(event, payload);
if (payloadIssues.length > 0) bail(`invalid payload for '${event}': ${payloadIssues.join("; ")}. expected: ${renderEventTemplate(event)}`);

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
		const bytes = Buffer.from(line, "utf8");
		const written = writeSync(fd, bytes);
		if (written !== bytes.length) throw new Error(`short write: ${written} of ${bytes.length} bytes`);
	} finally {
		closeSync(fd);
	}
} catch (err) {
	// An I/O failure is exit 2 for the dedicated emitter (FS5 callers wrap this
	// path in their own fail-soft handling, lt-t2).
	bail(`I/O failure writing the run store: ${err.message}`);
}

process.exit(0);
