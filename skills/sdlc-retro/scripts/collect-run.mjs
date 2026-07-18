#!/usr/bin/env node
// collect-run.mjs — the sdlc-retro post-mortem collector (spec §6). lt-t4
// built the hard, deterministic pipeline; lt-t5 (this revision) adds the LLM
// seam, soft data (narratives/steering/panelPrecision), the NF4 redaction/
// n-gram-containment pipeline, raw/ snapshotting of every non-manifest input,
// and --from-raw exclusive replay (spec §6.2/§6.4). Joins the FS13 run
// manifest, harvested panel artifacts, correlated pi session transcripts,
// discovered review directories, and injectable git/gh/llm seams into a
// schema-valid run.json (spec §7) with pinned derived-measure formulas
// (§6.3), uniform absence encoding, and the closed v1 coverage-marker set.
//
// Usage: collect-run.mjs --slug S [--out FILE] [--format text|json]
//                        [--from-raw] [--llm-cmd CMD | --no-llm]
//                        [--git-cmd CMD] [--base-ref BRANCH]
//                        [--gh-cmd CMD] [--no-github]
//                        [--sessions-dir DIR]... [--config DIR|--repo-root DIR]
// Exit: 0 success (run.json written, possibly with coverage markers);
//       1 nothing collectable (no manifest and no run store);
//       2 usage/operational error.
//
// sdlc-retro imports shared helpers from the sibling sdlc skill via
// package-relative paths (the package ships as one repository); it never
// resolves consumer paths through the skill root (spec §1).

import { execFileSync } from "node:child_process";
import { closeSync, existsSync, fsyncSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync, writeSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { inspectRoot, readConfig } from "../../sdlc/scripts/lib.mjs";
import { buildRedactionValues, redact } from "../../sdlc/scripts/validate-task.mjs";
import { currentBranch, KNOWN_EVENTS, LIFECYCLE_PHASES, PANEL_PHASES, PANEL_TO_LIFECYCLE, runStoreDir, SLUG_RE, validateEnvelope, validatePayload } from "../../sdlc/scripts/telemetry.mjs";

// Reverse of PANEL_TO_LIFECYCLE: a review directory's <lifecycle-phase> prefix
// (spec §6.1 naming, e.g. "pr-<slug>-<date>") maps back to the panel phase
// whose harvested round it should be attributed to.
const LIFECYCLE_TO_PANEL = Object.fromEntries(Object.entries(PANEL_TO_LIFECYCLE).map(([panelPhase, lifecyclePhase]) => [lifecyclePhase, panelPhase]));

// NF4: committed soft strings are capped at 500 chars and rejected outright
// (never truncated) if they contain a >=12-consecutive-word verbatim
// substring of any correlated user message.
const SOFT_STRING_CAP = 500;
const NGRAM_LEN = 12;
const LLM_TIMEOUT_MS = 120000;
const STEERING_CLASSES = ["gate-approval", "correction", "scope-change", "unblock", "other"];

const PREFIX = "sdlc-telemetry:";
export const RUN_SCHEMA_VERSION = 1;
const HUMAN_WAIT_CAP_MS = 30 * 60 * 1000;
const SESSION_CORRELATION_BUFFER_MS = 60 * 60 * 1000;

function warn(msg) {
	process.stderr.write(`${PREFIX} ${msg}\n`);
}

// ---- raw/ snapshotting + --from-raw replay (spec §6.4) ---------------------

function rawDir(root, slug) {
	return join(runStoreDir(root, slug), "raw");
}

function snapshotRaw(root, slug, relPath, content) {
	const dest = join(rawDir(root, slug), relPath);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, content);
}

function readRaw(root, slug, relPath) {
	return readFileSync(join(rawDir(root, slug), relPath), "utf8");
}

function rawExists(root, slug, relPath) {
	return existsSync(join(rawDir(root, slug), relPath));
}

function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

// ---- manifest adapter (spec §6.1.1) ---------------------------------------

// Reads events.jsonl; malformed/invalid lines are counted and skipped (never
// fatal). Returns { events, markers }. events are envelope objects sorted by
// ts (append order is already chronological; sorting is defense-in-depth).
export function readManifest(root, slug) {
	const path = join(runStoreDir(root, slug), "events.jsonl");
	if (!existsSync(path)) return { events: [], markers: [{ marker: "manifest.absent" }] };
	const raw = readFileSync(path, "utf8");
	const lines = raw.split("\n").filter((l) => l.length > 0);
	const events = [];
	let malformed = 0;
	for (const line of lines) {
		let obj;
		try {
			obj = JSON.parse(line);
		} catch {
			malformed++;
			continue;
		}
		const envIssues = validateEnvelope(obj);
		if (envIssues.length > 0) {
			malformed++;
			continue;
		}
		// Unknown event types are tolerated structurally (not malformed) but
		// consumers MUST ignore them entirely (spec §3 forward-compat) — an
		// unrecognized future event type must never influence this collector's
		// window/measures. Only known-vocabulary payloads are checked and kept.
		if (!KNOWN_EVENTS.includes(obj.event)) continue;
		const payloadIssues = validatePayload(obj.event, obj.payload);
		if (payloadIssues.length > 0) {
			malformed++;
			continue;
		}
		events.push(obj);
	}
	// Compare by epoch value, not lexicographically: TS_RE admits both a bare
	// "...:00Z" and a fractional "...:00.500Z" second, which sort inverted as
	// strings ("Z" > "."). Real emitters always produce the fractional form,
	// but a hand-written record-run-event --payload line may not.
	events.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
	const markers = malformed > 0 ? [{ marker: "manifest.partial", detail: `${malformed} malformed line(s) skipped` }] : [];
	return { events, markers };
}

export function extractTitleTrack(events) {
	const started = events.find((e) => e.event === "run.started");
	if (!started) return {};
	return { title: started.payload.title, track: started.payload.track };
}

// ---- phase span derivation (spec §6.3) ------------------------------------

// A phase spans phase.entered.ts to its explicit phase.exited.ts when
// present, else the next phase.entered.ts, else the window end.
export function derivePhaseSpans(events, windowEnd) {
	const entries = events.filter((e) => e.event === "phase.entered" || e.event === "phase.exited");
	const spans = [];
	for (let i = 0; i < entries.length; i++) {
		const e = entries[i];
		if (e.event !== "phase.entered") continue;
		const phase = e.payload.phase;
		const explicitExit = entries.slice(i + 1).find((x) => x.event === "phase.exited" && x.payload.phase === phase);
		const nextEnter = entries.slice(i + 1).find((x) => x.event === "phase.entered");
		let end;
		let exitExplicit = false;
		if (explicitExit && (!nextEnter || explicitExit.ts <= nextEnter.ts)) {
			end = explicitExit.ts;
			exitExplicit = true;
		} else if (nextEnter) {
			end = nextEnter.ts;
		} else {
			end = windowEnd;
		}
		spans.push({ phase, start: e.ts, end, exitExplicit });
	}
	return spans;
}

// Attribute a ts to the phase whose span contains it; "unattributed" when
// inside the window but outside every span; null when outside the window
// entirely (caller excludes it from per-phase figures).
export function attributePhase(spans, ts, windowStart, windowEnd) {
	if (ts < windowStart || ts > windowEnd) return null;
	for (const s of spans) {
		if (ts >= s.start && ts <= s.end) return s.phase;
	}
	return "unattributed";
}

// ---- panel harvest adapter (spec §6.1.2) ----------------------------------

const PANEL_DIR_RE = /^(plan_review|spec_review|pr_review|task_validate)-round(\d+)-(\d{4}-\d{2}-\d{2})$/;

// Tolerant extraction of per-model metrics from a pi-subagents status.json
// (lifecycleArtifactVersion 1 fields; unknown fields ignored, NF-forward
// compatible). A parallel/panel dispatch's per-child metrics live in
// `results[]`; a single-task status is treated as one implicit result.
function extractPanelModels(status) {
	if (!isPlainObject(status)) return [];
	const results = Array.isArray(status.results) ? status.results : [status];
	const models = [];
	for (const r of results) {
		if (!isPlainObject(r)) continue;
		const model = typeof r.model === "string" ? r.model : Array.isArray(r.attemptedModels) && typeof r.attemptedModels[0] === "string" ? r.attemptedModels[0] : undefined;
		if (!model) continue;
		const entry = { model };
		if (Number.isInteger(r.totalTokens) && r.totalTokens >= 0) entry.tokens = r.totalTokens;
		if (Number.isFinite(r.totalCost) && r.totalCost >= 0) entry.cost = r.totalCost;
		if (Number.isInteger(r.durationMs) && r.durationMs >= 0) entry.durationMs = r.durationMs;
		if (Number.isInteger(r.turnCount) && r.turnCount >= 0) entry.turns = r.turnCount;
		models.push(entry);
	}
	return models;
}

// Discover harvested panel directories on disk (spec §5 naming), independent
// of whether the manifest recorded a matching panel.harvested event (more
// resilient to a partially-instrumented run). Missing phases are derived by
// diffing panel-related manifest events against what is actually on disk.
export function discoverPanels(root, slug, events) {
	const panelsDir = join(runStoreDir(root, slug), "panels");
	const panels = [];
	const foundPhases = new Set();
	const byPhaseRound = new Map();
	if (existsSync(panelsDir)) {
		for (const name of readdirSync(panelsDir).sort()) {
			const m = PANEL_DIR_RE.exec(name);
			if (!m) continue;
			const [, panelPhase, roundStr, date] = m;
			const dir = join(panelsDir, name);
			if (!statSync(dir).isDirectory()) continue;
			const statusPath = join(dir, "status.json");
			const eventsPath = join(dir, "events.jsonl");
			// A harvest that missed BOTH files leaves nothing to distill; the round
			// stays honestly uncovered rather than marking its phase "found".
			if (!existsSync(statusPath) && !existsSync(eventsPath)) continue;
			foundPhases.add(panelPhase);
			let models = [];
			if (existsSync(statusPath)) {
				try {
					models = extractPanelModels(JSON.parse(readFileSync(statusPath, "utf8")));
				} catch {
					// unparseable status.json: no per-model metrics for this round, still listed
				}
			}
			const round = Number(roundStr);
			const entry = { panelPhase, round, dir: `.pi/sdlc/runs/${slug}/panels/${name}`, models, date };
			// Dedupe by (panelPhase, round): a re-harvest of the same round across a
			// date boundary must not double-count hard totals. Keep the latest date.
			const key = `${panelPhase}#${round}`;
			const existing = byPhaseRound.get(key);
			if (!existing || date > existing.date) byPhaseRound.set(key, entry);
		}
	}
	for (const { date, ...entry } of byPhaseRound.values()) panels.push(entry);
	panels.sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.round - b.round));
	const expectedPhases = new Set();
	for (const e of events) {
		if (e.event === "panel.dispatched" || e.event === "panel.harvested" || e.event === "panel.consolidated") expectedPhases.add(e.payload.panelPhase);
	}
	const markers = [];
	for (const phase of [...expectedPhases].sort()) {
		if (!foundPhases.has(phase)) markers.push({ marker: `panels.missing:${phase}` });
	}
	return { panels, markers };
}

// ---- review-directory discovery (spec §6.1.4) -----------------------------

// Discovers panel-round review directories named <lifecycle-phase>-<slug>-<date>
// under the configured reviews path (default docs/reviews), and snapshots the
// discovered list into raw/ (spec §6.4: the directory listing itself is
// non-manifest input). --from-raw reads that snapshot exclusively and never
// touches the live reviews path.
export function discoverReviewDirs(root, slug, reviewsPath = "docs/reviews", { fromRaw = false } = {}) {
	const rawListPath = join("reviews", "_dirs.json");
	if (fromRaw) {
		if (!rawExists(root, slug, rawListPath)) return [];
		try {
			return JSON.parse(readRaw(root, slug, rawListPath));
		} catch {
			return [];
		}
	}
	const base = join(root, reviewsPath);
	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-${slug}-\\d{4}-\\d{2}-\\d{2}$`);
	const dirs = existsSync(base)
		? readdirSync(base)
				.filter((name) => re.test(name) && statSync(join(base, name)).isDirectory())
				.sort()
		: [];
	snapshotRaw(root, slug, rawListPath, JSON.stringify(dirs));
	return dirs;
}

// ---- session adapter (spec §6.1.3) -----------------------------------------

// pi's on-disk session-directory naming convention: ~/.pi/agent/sessions/ +
// the absolute path with its leading '/' dropped, every '/' replaced by '-',
// wrapped as --<mapped>--.
function sessionDirFor(sessionsHome, absPath) {
	const mapped = absPath.replace(/^\//, "").replaceAll("/", "-");
	return join(sessionsHome, `--${mapped}--`);
}

// Candidate session directories: the consumer root and <root>.worktrees/*,
// under the observed pi convention, unless explicit --sessions-dir overrides
// are given (repeatable, and then used verbatim instead).
export function resolveSessionDirs(root, { sessionsDirOverrides = [], home = homedir() } = {}) {
	if (sessionsDirOverrides.length > 0) return { dirs: sessionsDirOverrides.filter((d) => existsSync(d)), markers: [] };
	const sessionsHome = join(home, ".pi", "agent", "sessions");
	const candidates = [sessionDirFor(sessionsHome, root)];
	const worktreesRoot = `${root}.worktrees`;
	if (existsSync(worktreesRoot)) {
		try {
			for (const name of readdirSync(worktreesRoot)) candidates.push(sessionDirFor(sessionsHome, join(worktreesRoot, name)));
		} catch {
			// unreadable worktrees root: fall through with what we have
		}
	}
	const dirs = candidates.filter((d) => existsSync(d));
	return { dirs, markers: dirs.length === 0 ? [{ marker: "sessions.dir_unresolved" }] : [] };
}

// Sniff + parse one top-level session JSONL file. Returns null (with a
// session.version:<file> marker pushed to `markers`) for a non-v3 header or
// an unreadable/empty file. `raw` is the verbatim file text, kept for §6.4
// snapshotting (never re-derived from the parsed entries).
function parseSessionFile(path, markers) {
	const name = basename(path);
	let raw;
	try {
		raw = readFileSync(path, "utf8");
	} catch {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	const lines = raw.split("\n").filter(Boolean);
	if (lines.length === 0) {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	let header;
	try {
		header = JSON.parse(lines[0]);
	} catch {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	if (header.type !== "session" || header.version !== 3) {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	const entries = [];
	for (const line of lines) {
		try {
			entries.push(JSON.parse(line));
		} catch {
			// a torn/malformed line within an otherwise-v3 file is skipped, not fatal
		}
	}
	return { file: name, entries, raw };
}

// --from-raw replay: every previously-snapshotted session file is trusted
// as already-correlated (it was only snapshotted because it correlated at
// original collect time); no live directory resolution or re-correlation.
function loadSessionsFromRaw(root, slug) {
	const dir = join(rawDir(root, slug), "sessions");
	if (!existsSync(dir)) return { sessions: [], markers: [{ marker: "sessions.none" }] };
	const markers = [];
	const sessions = [];
	for (const f of readdirSync(dir)
		.filter((f) => f.endsWith(".jsonl"))
		.sort()) {
		const parsed = parseSessionFile(join(dir, f), markers);
		if (parsed) sessions.push(parsed);
	}
	if (sessions.length === 0) markers.push({ marker: "sessions.none" });
	return { sessions, markers };
}

// A session is correlated iff at least one message entry's ts falls within
// [manifest first ts - 1h, manifest last ts + 1h].
function isCorrelated(session, windowStart, windowEnd) {
	for (const e of session.entries) {
		if (e.type !== "message" || typeof e.timestamp !== "string") continue;
		if (e.timestamp >= windowStart && e.timestamp <= windowEnd) return true;
	}
	return false;
}

export function discoverSessions(root, events, { sessionsDirOverrides = [], home, slug, fromRaw = false } = {}) {
	if (fromRaw) return loadSessionsFromRaw(root, slug);
	if (events.length === 0) return { sessions: [], markers: [{ marker: "sessions.none" }] };
	const first = events[0].ts;
	const last = events[events.length - 1].ts;
	const windowStart = new Date(new Date(first).getTime() - SESSION_CORRELATION_BUFFER_MS).toISOString();
	const windowEnd = new Date(new Date(last).getTime() + SESSION_CORRELATION_BUFFER_MS).toISOString();

	const { dirs, markers: dirMarkers } = resolveSessionDirs(root, { sessionsDirOverrides, home });
	const markers = [...dirMarkers];
	const sessions = [];
	for (const dir of dirs) {
		let files;
		try {
			files = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
		} catch {
			continue;
		}
		for (const f of files.sort()) {
			const parsed = parseSessionFile(join(dir, f), markers);
			if (!parsed) continue;
			if (!isCorrelated(parsed, windowStart, windowEnd)) continue;
			if (slug) snapshotRaw(root, slug, join("sessions", parsed.file), parsed.raw);
			sessions.push(parsed);
		}
	}
	if (sessions.length === 0) markers.push({ marker: "sessions.none" });
	return { sessions, markers };
}

// ---- derived hard measures (spec §6.3) ------------------------------------

function toMs(ts) {
	return new Date(ts).getTime();
}

// Agent time: Σ over assistant message entries of (assistant ts - ts of the
// immediately preceding JSONL entry in the same file; first entry contributes 0).
function agentTimeMs(session) {
	let total = 0;
	for (let i = 1; i < session.entries.length; i++) {
		const e = session.entries[i];
		if (e.type !== "message" || e.message?.role !== "assistant" || typeof e.timestamp !== "string") continue;
		const prev = session.entries[i - 1];
		if (typeof prev.timestamp !== "string") continue;
		total += Math.max(0, toMs(e.timestamp) - toMs(prev.timestamp));
	}
	return total;
}

// Human-wait: Σ over user entries of (user ts - ts of the immediately
// preceding entry) ONLY when that immediately preceding entry is an
// assistant message; each gap capped at 30 minutes, always a proxy.
function humanWaitMs(session) {
	let total = 0;
	for (let i = 1; i < session.entries.length; i++) {
		const e = session.entries[i];
		if (e.type !== "message" || e.message?.role !== "user" || typeof e.timestamp !== "string") continue;
		const prev = session.entries[i - 1];
		if (prev.type !== "message" || prev.message?.role !== "assistant" || typeof prev.timestamp !== "string") continue;
		const gap = Math.max(0, toMs(e.timestamp) - toMs(prev.timestamp));
		total += Math.min(gap, HUMAN_WAIT_CAP_MS);
	}
	return total;
}

function assistantEntries(session) {
	return session.entries.filter((e) => e.type === "message" && e.message?.role === "assistant");
}

// ---- git / github seams ----------------------------------------------------

export function gitDiffStats(gitCmd, root, baseRef) {
	try {
		const mergeBase = execFileSync(gitCmd, ["-C", root, "merge-base", baseRef, "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
		const shortstat = execFileSync(gitCmd, ["-C", root, "diff", "--shortstat", `${mergeBase}...HEAD`], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		const filesM = /(\d+) files? changed/.exec(shortstat);
		const insM = /(\d+) insertions?\(\+\)/.exec(shortstat);
		const delM = /(\d+) deletions?\(-\)/.exec(shortstat);
		return {
			diff: { files: filesM ? Number(filesM[1]) : 0, insertions: insM ? Number(insM[1]) : 0, deletions: delM ? Number(delM[1]) : 0 },
			markers: [],
		};
	} catch (err) {
		return { diff: undefined, markers: [{ marker: "git.error", detail: String(err?.message || err).slice(0, 200) }] };
	}
}

export function githubCheck(ghCmd, root, branch, noGithub) {
	if (noGithub) return { markers: [{ marker: "github.skipped" }] };
	try {
		const out = execFileSync(ghCmd, ["pr", "list", "--head", branch, "--json", "number"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		JSON.parse(out); // validated but not yet materialized into run.json (no v1 schema slot)
		return { markers: [] };
	} catch (err) {
		return { markers: [{ marker: "github.error", detail: String(err?.message || err).slice(0, 200) }] };
	}
}

// Raw-snapshotting/replay wrapper around gitDiffStats (spec §6.4): a live
// collect snapshots the raw command outputs into raw/git/diff.json;
// --from-raw reads that snapshot exclusively and never invokes --git-cmd.
function gitDiffStatsSeam(root, slug, gitCmd, baseRef, fromRaw) {
	const relPath = "git/diff.json";
	if (fromRaw) {
		if (!rawExists(root, slug, relPath)) return { diff: undefined, markers: [{ marker: "git.error", detail: "no raw/git/diff.json snapshot to replay" }] };
		try {
			return { diff: JSON.parse(readRaw(root, slug, relPath)), markers: [] };
		} catch (err) {
			return { diff: undefined, markers: [{ marker: "git.error", detail: `corrupt raw/git/diff.json snapshot: ${err?.message || err}` }] };
		}
	}
	const result = gitDiffStats(gitCmd, root, baseRef);
	if (result.diff) snapshotRaw(root, slug, relPath, JSON.stringify(result.diff));
	return result;
}

// Same pattern for the github seam (spec §6.4): a live collect snapshots the
// raw response into raw/github/pr-list.json; --from-raw replays it and never
// invokes --gh-cmd. --no-github always short-circuits to github.skipped,
// live or replayed.
function githubCheckSeam(root, slug, ghCmd, branch, noGithub, fromRaw) {
	if (noGithub) return { markers: [{ marker: "github.skipped" }] };
	const relPath = "github/pr-list.json";
	if (fromRaw) {
		if (!rawExists(root, slug, relPath)) return { markers: [{ marker: "github.error", detail: "no raw/github/pr-list.json snapshot to replay" }] };
		return { markers: [] };
	}
	try {
		const out = execFileSync(ghCmd, ["pr", "list", "--head", branch, "--json", "number"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		JSON.parse(out);
		snapshotRaw(root, slug, relPath, out);
		return { markers: [] };
	} catch (err) {
		return { markers: [{ marker: "github.error", detail: String(err?.message || err).slice(0, 200) }] };
	}
}

// ---- LLM seam (spec §6.2) --------------------------------------------------

// One request per call, execFile-no-shell, one JSON request on stdin, one
// JSON response on stdout, default 120s timeout. Never throws; returns
// { ok:false, reason } on any failure (non-zero exit, timeout, invalid JSON,
// invalid response shape) so the caller can record the right marker.
export function callLlm(llmCmd, request, { timeoutMs = LLM_TIMEOUT_MS } = {}) {
	let out;
	try {
		out = execFileSync(llmCmd, [], { input: JSON.stringify(request), timeout: timeoutMs, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
	} catch (err) {
		return { ok: false, reason: err?.signal === "SIGTERM" || /ETIMEDOUT/.test(String(err?.message)) ? "timeout" : String(err?.message || err) };
	}
	let response;
	try {
		response = JSON.parse(out);
	} catch {
		return { ok: false, reason: "invalid JSON response" };
	}
	if (!isPlainObject(response) || response.kind !== request.kind || typeof response.model !== "string" || response.model.length === 0 || typeof response.provider !== "string" || response.provider.length === 0 || !isPlainObject(response.output)) {
		return { ok: false, reason: "response missing/mismatched kind, model, provider, or object output" };
	}
	return { ok: true, response };
}

function validateNarrativeOutput(output) {
	return isPlainObject(output) && typeof output.summary === "string";
}

function validateSteeringOutput(output, expectedLength) {
	if (!isPlainObject(output) || !Array.isArray(output.classifications)) return false;
	if (output.classifications.length !== expectedLength) return false;
	return output.classifications.every((c) => isPlainObject(c) && Number.isInteger(c.index) && STEERING_CLASSES.includes(c.class));
}

function validatePrecisionOutput(output) {
	if (!isPlainObject(output) || !Array.isArray(output.perModel)) return false;
	return output.perModel.every((p) => isPlainObject(p) && typeof p.model === "string" && p.model.length > 0 && isNonNegInt(p.raised) && isNonNegInt(p.incorporated) && isNonNegInt(p.dismissed));
}

// ---- NF4: redaction + n-gram containment + 500-char cap ---------------------

// A committed soft string passes redaction, is rejected outright (not
// truncated) if it contains a >=12-consecutive-word verbatim substring of any
// correlated user message, then is capped at 500 chars. Returns the safe
// string or null (reject).
export function sanitizeSoftString(text, { redactionValues, userMessages }) {
	if (typeof text !== "string") return null;
	const afterRedaction = redact(text, redactionValues);
	if (containsUserNgram(afterRedaction, userMessages)) return null;
	return afterRedaction.length > SOFT_STRING_CAP ? afterRedaction.slice(0, SOFT_STRING_CAP) : afterRedaction;
}

function wordsOf(text) {
	return text.split(/\s+/).filter(Boolean);
}

// True iff `text` contains an NGRAM_LEN-consecutive-word verbatim substring of
// any string in `userMessages` (case-sensitive). Both sides are tokenized by
// the SAME whitespace split before comparison, so a newline or extra space
// anywhere inside the shared run of words cannot defeat the check (a raw
// substring match against un-normalized text would miss exactly that case).
export function containsUserNgram(text, userMessages) {
	const candidateWords = wordsOf(text);
	if (candidateWords.length < NGRAM_LEN) return false;
	const candidateGrams = new Set();
	for (let i = 0; i + NGRAM_LEN <= candidateWords.length; i++) candidateGrams.add(candidateWords.slice(i, i + NGRAM_LEN).join(" "));
	for (const msg of userMessages) {
		if (typeof msg !== "string") continue;
		const msgWords = wordsOf(msg);
		for (let i = 0; i + NGRAM_LEN <= msgWords.length; i++) {
			if (candidateGrams.has(msgWords.slice(i, i + NGRAM_LEN).join(" "))) return true;
		}
	}
	return false;
}

// Lighter NF4 pass for short LLM-controlled identifiers (attribution model/
// provider, per-model precision labels): redact + cap, no n-gram check (these
// are identifiers, not prose, so verbatim-prompt containment doesn't apply,
// but an adversarial or misbehaving --llm-cmd must still not be able to smuggle
// a secret into a committed identifier field).
const ATTRIBUTION_STRING_CAP = 200;
export function sanitizeAttributionString(value, redactionValues, userMessages = []) {
	if (typeof value !== "string") return null;
	const afterRedaction = redact(value, redactionValues);
	if (containsUserNgram(afterRedaction, userMessages)) return null;
	return afterRedaction.length > ATTRIBUTION_STRING_CAP ? afterRedaction.slice(0, ATTRIBUTION_STRING_CAP) : afterRedaction;
}

function safeAttribution(response, redactionValues, userMessages) {
	const model = sanitizeAttributionString(response.model, redactionValues, userMessages);
	const provider = sanitizeAttributionString(response.provider, redactionValues, userMessages);
	return model && provider ? { model, provider } : null;
}

// ---- run.json assembly ----------------------------------------------------

export function buildRunJson({ slug, title, track, coverage, sizeProxies, hard, soft }) {
	const out = { schemaVersion: RUN_SCHEMA_VERSION, slug, coverage, sizeProxies, hard };
	if (title !== undefined) out.title = title;
	if (track !== undefined) out.track = track;
	if (soft !== undefined) out.soft = soft;
	return out;
}

// ---- hand-rolled run.json validator (mirrors the committed schema, §7/NF2) -

function isNonNegInt(v) {
	return Number.isInteger(v) && v >= 0;
}
function isPosInt(v) {
	return Number.isInteger(v) && v > 0;
}
function isTs(v) {
	return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(v);
}

function checkKeys(obj, allowed, path, add) {
	if (!isPlainObject(obj)) return;
	for (const key of Object.keys(obj)) if (!allowed.includes(key)) add(path, `unknown property ${key}`);
}

export function validateRunJson(raw) {
	const issues = [];
	const add = (p, m) => issues.push(`${p}: ${m}`);
	if (!isPlainObject(raw)) return ["root: must be an object"];
	checkKeys(raw, ["schemaVersion", "slug", "title", "track", "coverage", "sizeProxies", "hard", "soft"], "/", add);
	if (raw.schemaVersion !== 1) add("/schemaVersion", "must be 1");
	if (typeof raw.slug !== "string" || !SLUG_RE.test(raw.slug)) add("/slug", "must match the slug grammar");
	if (raw.title !== undefined && (typeof raw.title !== "string" || raw.title.length === 0)) add("/title", "must be a non-empty string when present");
	if (raw.track !== undefined && (typeof raw.track !== "string" || raw.track.length === 0)) add("/track", "must be a non-empty string when present");
	if (!Array.isArray(raw.coverage)) add("/coverage", "must be an array");
	else
		raw.coverage.forEach((c, i) => {
			if (!isPlainObject(c) || typeof c.marker !== "string" || c.marker.length === 0 || (c.detail !== undefined && typeof c.detail !== "string")) add(`/coverage/${i}`, "must be {marker, detail?}");
			else checkKeys(c, ["marker", "detail"], `/coverage/${i}`, add);
		});
	const sp = raw.sizeProxies;
	if (!isPlainObject(sp)) add("/sizeProxies", "must be an object");
	else {
		checkKeys(sp, ["scenarios", "tasks", "diff", "sessions", "phases"], "/sizeProxies", add);
		if (!isNonNegInt(sp.scenarios)) add("/sizeProxies/scenarios", "must be a non-negative integer");
		if (!isNonNegInt(sp.tasks)) add("/sizeProxies/tasks", "must be a non-negative integer");
		if (!isNonNegInt(sp.sessions)) add("/sizeProxies/sessions", "must be a non-negative integer");
		if (!Array.isArray(sp.phases) || !sp.phases.every((p) => LIFECYCLE_PHASES.includes(p))) add("/sizeProxies/phases", "must be an array of lifecycle phases");
		if (sp.diff !== undefined && (!isPlainObject(sp.diff) || !isNonNegInt(sp.diff.files) || !isNonNegInt(sp.diff.insertions) || !isNonNegInt(sp.diff.deletions))) add("/sizeProxies/diff", "must be {files,insertions,deletions} when present");
		else if (sp.diff !== undefined) checkKeys(sp.diff, ["files", "insertions", "deletions"], "/sizeProxies/diff", add);
	}
	const h = raw.hard;
	if (!isPlainObject(h)) {
		add("/hard", "must be an object");
		return issues;
	}
	checkKeys(h, ["window", "phases", "sessions", "panels", "models", "rollups", "rework", "totals"], "/hard", add);
	if (!isPlainObject(h.window) || !isTs(h.window.start) || !isTs(h.window.end)) add("/hard/window", "must be {start, end} ISO timestamps");
	else checkKeys(h.window, ["start", "end"], "/hard/window", add);
	if (!Array.isArray(h.phases)) add("/hard/phases", "must be an array of {phase, start, end}");
	else
		h.phases.forEach((p, i) => {
			if (!isPlainObject(p) || !LIFECYCLE_PHASES.includes(p.phase) || !isTs(p.start) || !isTs(p.end) || (p.exitExplicit !== undefined && typeof p.exitExplicit !== "boolean")) add(`/hard/phases/${i}`, "must be {phase, start, end, exitExplicit?}");
			else checkKeys(p, ["phase", "start", "end", "exitExplicit"], `/hard/phases/${i}`, add);
		});
	if (!Array.isArray(h.sessions)) add("/hard/sessions", "must be an array of {file, start, end}");
	else
		h.sessions.forEach((s, i) => {
			if (!isPlainObject(s) || typeof s.file !== "string" || s.file.length === 0 || !isTs(s.start) || !isTs(s.end) || (s.models !== undefined && (!Array.isArray(s.models) || !s.models.every((m) => typeof m === "string" && m.length > 0)))) add(`/hard/sessions/${i}`, "must be {file, start, end, models[]?}");
			else checkKeys(s, ["file", "start", "end", "models"], `/hard/sessions/${i}`, add);
		});
	if (!Array.isArray(h.panels)) add("/hard/panels", "must be an array of {panelPhase, round, dir, models[]}");
	else
		h.panels.forEach((p, i) => {
			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[]}");
			else {
				checkKeys(p, ["panelPhase", "round", "dir", "models"], `/hard/panels/${i}`, add);
				p.models.forEach((m, j) => {
					if (
						!isPlainObject(m) ||
						typeof m.model !== "string" ||
						m.model.length === 0 ||
						(m.tokens !== undefined && !isNonNegInt(m.tokens)) ||
						(m.cost !== undefined && (!Number.isFinite(m.cost) || m.cost < 0)) ||
						(m.durationMs !== undefined && !isNonNegInt(m.durationMs)) ||
						(m.turns !== undefined && !isNonNegInt(m.turns))
					)
						add(`/hard/panels/${i}/models/${j}`, "must match the panel model schema");
					else checkKeys(m, ["model", "tokens", "cost", "durationMs", "turns"], `/hard/panels/${i}/models/${j}`, add);
				});
			}
		});
	if (!Array.isArray(h.models) || !h.models.every((m) => typeof m === "string" && m.length > 0)) add("/hard/models", "must be an array of non-empty strings");
	if (!isPlainObject(h.rollups) || !Array.isArray(h.rollups.byModel) || !Array.isArray(h.rollups.byPhase)) add("/hard/rollups", "must be {byModel[], byPhase[]}");
	else {
		checkKeys(h.rollups, ["byModel", "byPhase"], "/hard/rollups", add);
		h.rollups.byModel.forEach((r, i) => {
			if (!isPlainObject(r) || typeof r.model !== "string" || r.model.length === 0 || !isNonNegInt(r.tokens) || !Number.isFinite(r.cost) || r.cost < 0) add(`/hard/rollups/byModel/${i}`, "must be {model, tokens, cost}");
			else checkKeys(r, ["model", "tokens", "cost"], `/hard/rollups/byModel/${i}`, add);
		});
		h.rollups.byPhase.forEach((r, i) => {
			if (!isPlainObject(r) || !LIFECYCLE_PHASES.includes(r.phase) || !isNonNegInt(r.tokens) || !Number.isFinite(r.cost) || r.cost < 0) add(`/hard/rollups/byPhase/${i}`, "must be {phase, tokens, cost}");
			else checkKeys(r, ["phase", "tokens", "cost"], `/hard/rollups/byPhase/${i}`, add);
		});
	}
	if (!isPlainObject(h.rework) || !isNonNegInt(h.rework.artifactRevised) || !isNonNegInt(h.rework.phaseBackward) || !isNonNegInt(h.rework.fixWave)) add("/hard/rework", "must be {artifactRevised,phaseBackward,fixWave}");
	else checkKeys(h.rework, ["artifactRevised", "phaseBackward", "fixWave"], "/hard/rework", add);
	const t = h.totals;
	if (!isPlainObject(t) || !isNonNegInt(t.tokens) || !Number.isFinite(t.cost) || t.cost < 0 || !isNonNegInt(t.wallMs) || !isNonNegInt(t.agentMs) || !isNonNegInt(t.humanWaitMs)) add("/hard/totals", "must be {tokens, cost, wallMs, agentMs, humanWaitMs}");
	else checkKeys(t, ["tokens", "cost", "wallMs", "agentMs", "humanWaitMs"], "/hard/totals", add);

	if (raw.soft !== undefined) {
		const sf = raw.soft;
		if (!isPlainObject(sf)) add("/soft", "must be an object when present");
		else {
			checkKeys(sf, ["attribution", "narratives", "steering", "panelPrecision"], "/soft", add);
			if (!isPlainObject(sf.attribution) || typeof sf.attribution.model !== "string" || sf.attribution.model.length === 0 || typeof sf.attribution.provider !== "string" || sf.attribution.provider.length === 0) add("/soft/attribution", "must be {model, provider}");
			else checkKeys(sf.attribution, ["model", "provider"], "/soft/attribution", add);
			if (!Array.isArray(sf.narratives)) add("/soft/narratives", "must be an array of {phase, summary<=500}");
			else
				sf.narratives.forEach((n, i) => {
					if (!isPlainObject(n) || !LIFECYCLE_PHASES.includes(n.phase) || typeof n.summary !== "string" || n.summary.length > 500) add(`/soft/narratives/${i}`, "must be {phase, summary<=500}");
					else checkKeys(n, ["phase", "summary"], `/soft/narratives/${i}`, add);
				});
			const steeringClasses = new Set(["gate-approval", "correction", "scope-change", "unblock", "other"]);
			if (!Array.isArray(sf.steering)) add("/soft/steering", "must be an array of {index, ts, class}");
			else
				sf.steering.forEach((s, i) => {
					if (!isPlainObject(s) || !isNonNegInt(s.index) || !isTs(s.ts) || !steeringClasses.has(s.class)) add(`/soft/steering/${i}`, "must be {index, ts, class}");
					else checkKeys(s, ["index", "ts", "class"], `/soft/steering/${i}`, add);
				});
			if (!Array.isArray(sf.panelPrecision)) add("/soft/panelPrecision", "must be an array of {panelPhase, round, model, raised, incorporated, dismissed}");
			else
				sf.panelPrecision.forEach((p, i) => {
					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed)) add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
					else checkKeys(p, ["panelPhase", "round", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
				});
		}
	}
	return issues;
}

// ---- soft data assembly (spec §6.2) -----------------------------------------

function userText(entry) {
	if (entry?.type !== "message" || entry.message?.role !== "user") return "";
	const content = entry.message.content;
	if (!Array.isArray(content)) return "";
	return content
		.filter((b) => b?.type === "text" && typeof b.text === "string")
		.map((b) => b.text)
		.join("\n");
}

function turnsFor(session, spans, phase, windowStart, windowEnd) {
	return session.entries.filter((e) => e.type === "message" && e.message && typeof e.timestamp === "string" && attributePhase(spans, e.timestamp, windowStart, windowEnd) === phase).map((e) => ({ ts: e.timestamp, role: e.message.role, ...(e.message.model ? { model: e.message.model } : {}) }));
}

function eventsFor(events, phase, spans) {
	const span = spans.find((s) => s.phase === phase);
	if (!span) return [];
	return events.filter((e) => e.ts >= span.start && e.ts <= span.end);
}

// One LLM call per phase/session/review-round respectively (call count is
// fixture-predictable, spec §6.2). fromRaw replays raw/llm/<name>.json pairs
// exclusively and never invokes llmCmd.
function llmCall(root, slug, name, request, llmCmd, fromRaw, timeoutMs) {
	const relPath = `llm/${name}.json`;
	if (fromRaw) {
		if (!rawExists(root, slug, relPath)) return { ok: false, reason: "no raw snapshot to replay" };
		try {
			const pair = JSON.parse(readRaw(root, slug, relPath));
			return { ok: true, response: pair.response };
		} catch (err) {
			return { ok: false, reason: `corrupt raw snapshot: ${err?.message || err}` };
		}
	}
	const result = callLlm(llmCmd, request, { timeoutMs });
	if (result.ok) snapshotRaw(root, slug, relPath, JSON.stringify({ request, response: result.response }, null, 2));
	return result;
}

function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sessions, panels, reviewDirs, windowStart, windowEnd, reviewsPath, llmTimeoutMs = LLM_TIMEOUT_MS }) {
	if (noLlm || !llmCmd) return { soft: undefined, markers: [{ marker: "soft.absent" }] };

	const redactionValues = buildRedactionValues(process.env);
	const allUserMessages = sessions.flatMap((s) => s.entries.map(userText).filter(Boolean));
	const markers = [];
	let attribution;
	let narrativeFailed = false;
	let steeringFailed = false;

	const narratives = [];
	for (const phase of [...new Set(spans.map((s) => s.phase))]) {
		const request = { kind: "narrative", slug, inputs: { phase, events: eventsFor(events, phase, spans), turns: sessions.flatMap((s) => turnsFor(s, spans, phase, windowStart, windowEnd)) } };
		const result = llmCall(root, slug, `narrative-${phase}`, request, llmCmd, fromRaw, llmTimeoutMs);
		if (!result.ok || !validateNarrativeOutput(result.response.output)) {
			narrativeFailed = true;
			continue;
		}
		const summary = sanitizeSoftString(result.response.output.summary, { redactionValues, userMessages: allUserMessages });
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (summary === null || !responseAttribution) {
			markers.push({ marker: `soft.omitted:narrative:${phase}` });
			continue;
		}
		attribution ??= responseAttribution;
		narratives.push({ phase, summary });
	}
	if (narrativeFailed) markers.push({ marker: "llm.error:narrative" });

	const steering = [];
	for (const s of sessions) {
		const userTurns = s.entries.filter((e) => e.type === "message" && e.message?.role === "user" && typeof e.timestamp === "string").map((e, i) => ({ index: i, ts: e.timestamp, text: userText(e) }));
		if (userTurns.length === 0) continue;
		const request = { kind: "steering", slug, inputs: { sessionId: s.file, userTurns: userTurns.map(({ index, ts, text }) => ({ index, ts, text })) } };
		const result = llmCall(root, slug, `steering-${s.file}`, request, llmCmd, fromRaw, llmTimeoutMs);
		if (!result.ok || !validateSteeringOutput(result.response.output, userTurns.length)) {
			steeringFailed = true;
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			markers.push({ marker: `soft.omitted:steering:${s.file}` });
			continue;
		}
		attribution ??= responseAttribution;
		for (const c of result.response.output.classifications) {
			const turn = userTurns[c.index];
			if (turn) steering.push({ index: c.index, ts: turn.ts, class: c.class });
		}
	}
	if (steeringFailed) markers.push({ marker: "llm.error:steering" });

	const panelPrecision = [];
	for (const dir of reviewDirs) {
		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`));
		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels.length === 1 ? matchingPanels : [];
		const panel = candidates.sort((a, b) => b.round - a.round)[0];
		if (!panel) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}

		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
		// deleted live reviews directory after the original collection.
		const dirPath = fromRaw ? join(rawDir(root, slug), "reviews", dir) : join(root, reviewsPath, dir);
		let consolidatedText = "";
		let findingsText = "";
		const modelFiles = [];
		try {
			for (const f of readdirSync(dirPath).sort()) {
				const text = readFileSync(join(dirPath, f), "utf8");
				if (!fromRaw) snapshotRaw(root, slug, join("reviews", dir, f), text);
				if (f === "consolidated.md") consolidatedText = text;
				else {
					modelFiles.push(f);
					findingsText += text;
				}
			}
		} catch {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const request = { kind: "precision", slug, inputs: { reviewDir: dir, models: modelFiles, findingsText, consolidatedText } };
		const result = llmCall(root, slug, `precision-${dir}`, request, llmCmd, fromRaw, llmTimeoutMs);
		if (!result.ok || !validatePrecisionOutput(result.response.output)) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			markers.push({ marker: `soft.omitted:precision:${dir}` });
			continue;
		}
		attribution ??= responseAttribution;
		for (const pm of result.response.output.perModel) {
			const model = sanitizeAttributionString(pm.model, redactionValues, allUserMessages);
			if (!model) {
				markers.push({ marker: `soft.omitted:precision-model:${dir}` });
				continue;
			}
			panelPrecision.push({
				panelPhase: panel.panelPhase,
				round: panel.round,
				model,
				raised: pm.raised,
				incorporated: pm.incorporated,
				dismissed: pm.dismissed,
			});
		}
	}

	if (!attribution) return { soft: undefined, markers: [...markers, { marker: "soft.absent" }] };
	return { soft: { attribution, narratives, steering, panelPrecision }, markers };
}

// ---- collection orchestration ----------------------------------------------

export function collect({ root, slug, gitCmd = "git", baseRef = "main", ghCmd = "gh", noGithub = false, sessionsDirOverrides = [], home, reviewsPath = "docs/reviews", llmCmd, noLlm = false, fromRaw = false, llmTimeoutMs = LLM_TIMEOUT_MS }) {
	const { events, markers: manifestMarkers } = readManifest(root, slug);
	const { title, track } = extractTitleTrack(events);
	const { panels, markers: panelMarkers } = discoverPanels(root, slug, events);
	const { sessions, markers: sessionMarkers } = discoverSessions(root, events, { sessionsDirOverrides, home, slug, fromRaw });
	const reviewDirs = discoverReviewDirs(root, slug, reviewsPath, { fromRaw });
	const { diff, markers: gitMarkers } = gitDiffStatsSeam(root, slug, gitCmd, baseRef, fromRaw);
	const branch = currentBranch(root) || slug;
	const { markers: ghMarkers } = githubCheckSeam(root, slug, ghCmd, branch, noGithub, fromRaw);

	const windowStart = events.length > 0 ? events[0].ts : new Date(0).toISOString();
	const windowEnd = events.length > 0 ? events[events.length - 1].ts : new Date(0).toISOString();
	const spans = derivePhaseSpans(events, windowEnd);

	// rollups: sessions contribute per assistant-message tokens/cost attributed
	// by phase span; panels contribute their harvested per-model totals
	// attributed via the fixed panelPhase -> lifecycle mapping. Disjoint by
	// construction (nested child sessions are excluded from correlation).
	const byModelMap = new Map();
	const byPhaseMap = new Map();
	const addRollup = (model, phase, tokens, cost) => {
		if (model) {
			const cur = byModelMap.get(model) ?? { tokens: 0, cost: 0 };
			cur.tokens += tokens;
			cur.cost += cost;
			byModelMap.set(model, cur);
		}
		if (phase) {
			const cur = byPhaseMap.get(phase) ?? { tokens: 0, cost: 0 };
			cur.tokens += tokens;
			cur.cost += cost;
			byPhaseMap.set(phase, cur);
		}
	};

	let totalTokens = 0;
	let totalCost = 0;
	let totalAgentMs = 0;
	let totalHumanWaitMs = 0;
	const hardSessions = [];
	const distinctModels = new Set();

	for (const s of sessions) {
		const aEntries = assistantEntries(s);
		let sessStart;
		let sessEnd;
		const sessModels = new Set();
		for (const e of aEntries) {
			const ts = e.timestamp;
			if (typeof ts !== "string") continue;
			if (!sessStart || ts < sessStart) sessStart = ts;
			if (!sessEnd || ts > sessEnd) sessEnd = ts;
			const model = e.message?.model;
			const tokens = Number.isInteger(e.message?.usage?.totalTokens) ? e.message.usage.totalTokens : 0;
			const rawCost = e.message?.usage?.cost?.total;
			const cost = Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : 0;
			totalTokens += tokens;
			totalCost += cost;
			if (model) {
				distinctModels.add(model);
				sessModels.add(model);
			}
			const phase = attributePhase(spans, ts, windowStart, windowEnd);
			addRollup(model, phase && phase !== "unattributed" ? phase : undefined, tokens, cost);
		}
		totalAgentMs += agentTimeMs(s);
		totalHumanWaitMs += humanWaitMs(s);
		if (sessStart && sessEnd) hardSessions.push({ file: s.file, start: sessStart, end: sessEnd, models: [...sessModels].sort() });
	}

	for (const p of panels) {
		const phase = PANEL_TO_LIFECYCLE[p.panelPhase];
		for (const m of p.models) {
			distinctModels.add(m.model);
			addRollup(m.model, phase, m.tokens ?? 0, m.cost ?? 0);
			totalTokens += m.tokens ?? 0;
			totalCost += m.cost ?? 0;
		}
	}

	const rework = {
		artifactRevised: events.filter((e) => e.event === "artifact.revised").length,
		phaseBackward: events.filter((e) => e.event === "phase.backward").length,
		fixWave: events.filter((e) => e.event === "pr.fix_wave").length,
	};

	const wallMs = events.length > 0 ? Math.max(0, toMs(windowEnd) - toMs(windowStart)) : 0;

	const taskEvents = events.filter((e) => e.event === "task.validated");
	const scenarioIds = new Set();
	const taskIds = new Set();
	for (const e of taskEvents) {
		taskIds.add(e.payload.task);
		for (const s of e.payload.scenarioIds) scenarioIds.add(s);
	}
	const phasesPresent = [...new Set(events.filter((e) => e.event === "phase.entered").map((e) => e.payload.phase))].sort((a, b) => LIFECYCLE_PHASES.indexOf(a) - LIFECYCLE_PHASES.indexOf(b));

	const sizeProxies = {
		scenarios: scenarioIds.size,
		tasks: taskIds.size,
		sessions: sessions.length,
		phases: phasesPresent,
	};
	if (diff) sizeProxies.diff = diff;

	const hard = {
		window: { start: windowStart, end: windowEnd },
		phases: spans.map((s) => ({ phase: s.phase, start: s.start, end: s.end, exitExplicit: s.exitExplicit })),
		sessions: hardSessions,
		panels: panels.map((p) => ({ panelPhase: p.panelPhase, round: p.round, dir: p.dir, models: p.models })),
		models: [...distinctModels].sort(),
		rollups: {
			byModel: [...byModelMap.entries()].map(([model, v]) => ({ model, tokens: v.tokens, cost: v.cost })).sort((a, b) => (a.model < b.model ? -1 : 1)),
			byPhase: [...byPhaseMap.entries()].map(([phase, v]) => ({ phase, tokens: v.tokens, cost: v.cost })).sort((a, b) => LIFECYCLE_PHASES.indexOf(a.phase) - LIFECYCLE_PHASES.indexOf(b.phase)),
		},
		rework,
		totals: { tokens: totalTokens, cost: totalCost, wallMs, agentMs: totalAgentMs, humanWaitMs: totalHumanWaitMs },
	};

	const { soft, markers: softMarkers } = buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sessions, panels, reviewDirs, windowStart, windowEnd, reviewsPath, llmTimeoutMs });

	const coverage = [...manifestMarkers, ...panelMarkers, ...sessionMarkers, ...gitMarkers, ...ghMarkers, ...softMarkers];
	const runJson = buildRunJson({ slug, title, track, coverage, sizeProxies, hard, soft });
	return { runJson };
}

// ---- atomic write -----------------------------------------------------------

function atomicWriteJson(target, obj) {
	const parent = dirname(target);
	mkdirSync(parent, { recursive: true });
	const tmp = mkdtempSync(join(parent, ".collect-run-"));
	const tmpFile = join(tmp, "run.json");
	const json = `${JSON.stringify(obj, null, 2)}\n`;
	const fd = openSync(tmpFile, "w");
	try {
		writeSync(fd, json);
		fsyncSync(fd);
	} finally {
		closeSync(fd);
	}
	renameSync(tmpFile, target);
	rmSync(tmp, { recursive: true, force: true });
}

// ---- CLI --------------------------------------------------------------------

function parseArgs(argv) {
	const opts = { format: "text", sessionsDirOverrides: [], noGithub: false, gitCmd: "git", baseRef: "main", ghCmd: "gh" };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = () => {
			const v = argv[++i];
			if (v === undefined) throw new Error(`${a} requires a value`);
			return v;
		};
		if (a === "--slug") opts.slug = val();
		else if (a === "--out") opts.out = val();
		else if (a === "--format") {
			const f = val();
			if (f !== "text" && f !== "json") throw new Error("--format must be text or json");
			opts.format = f;
		} else if (a === "--git-cmd") opts.gitCmd = val();
		else if (a === "--base-ref") opts.baseRef = val();
		else if (a === "--gh-cmd") opts.ghCmd = val();
		else if (a === "--no-github") opts.noGithub = true;
		else if (a === "--sessions-dir") opts.sessionsDirOverrides.push(val());
		else if (a === "--llm-cmd") opts.llmCmd = val();
		else if (a === "--no-llm") opts.noLlm = true;
		else if (a === "--from-raw") opts.fromRaw = true;
		else if (a === "--config") opts.config = val();
		else if (a === "--repo-root") opts.repoRoot = val();
		else if (a === "-h" || a === "--help") opts.help = true;
		else throw new Error(`unexpected argument: ${a}`);
	}
	if (opts.llmCmd !== undefined && opts.noLlm) throw new Error("--llm-cmd and --no-llm are mutually exclusive");
	return opts;
}

function usage() {
	return "usage: collect-run.mjs --slug S [--out FILE] [--format text|json] [--from-raw] [--llm-cmd CMD | --no-llm] [--git-cmd CMD] [--base-ref BRANCH] [--gh-cmd CMD] [--no-github] [--sessions-dir DIR]... [--config DIR|--repo-root DIR]";
}

function main() {
	let opts;
	try {
		opts = parseArgs(process.argv.slice(2));
	} catch (e) {
		warn(String(e.message || e));
		process.exit(2);
	}
	if (opts.help) {
		console.log(usage());
		process.exit(0);
	}
	if (!opts.slug) {
		warn(usage());
		process.exit(2);
	}
	const rootResult = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot });
	if (!rootResult.ok) {
		warn(`sdlc: ${rootResult.message}`);
		process.exit(2);
	}
	const root = rootResult.root;
	const cfg = readConfig(root);
	const reviewsPath = cfg.paths?.reviews ?? "docs/reviews";

	if (!existsSync(runStoreDir(root, opts.slug))) {
		warn(`nothing collectable for slug '${opts.slug}': no run store at ${runStoreDir(root, opts.slug)}`);
		process.exit(1);
	}

	const { runJson } = collect({
		root,
		slug: opts.slug,
		gitCmd: opts.gitCmd,
		baseRef: opts.baseRef,
		ghCmd: opts.ghCmd,
		noGithub: opts.noGithub,
		sessionsDirOverrides: opts.sessionsDirOverrides,
		reviewsPath,
		llmCmd: opts.llmCmd,
		noLlm: opts.noLlm ?? false,
		fromRaw: opts.fromRaw ?? false,
	});

	const issues = validateRunJson(runJson);
	if (issues.length > 0) {
		warn(`internal error: assembled run.json failed its own schema: ${issues.join("; ")}`);
		process.exit(2);
	}

	const outPath = opts.out ? (isAbsolute(opts.out) ? opts.out : resolve(root, opts.out)) : join(root, "docs", "retros", opts.slug, "run.json");
	try {
		atomicWriteJson(outPath, runJson);
	} catch (err) {
		warn(`cannot write ${outPath}: ${err?.message || err}`);
		process.exit(2);
	}

	const relOut = outPath.startsWith(`${root}/`) ? outPath.slice(root.length + 1) : outPath;
	const warnings = runJson.coverage.map((c) => c.marker);
	if (opts.format === "json") {
		console.log(JSON.stringify({ ok: true, out: relOut, coverage: warnings, warnings: [] }, null, 2));
	} else {
		console.log(`collected: ${relOut}`);
		for (const w of warnings) console.log(`  coverage: ${w}`);
	}
	process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
