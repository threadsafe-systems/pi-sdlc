#!/usr/bin/env node

// Sandboxed e2e integration harness — core (T1).
//
// Provides the building blocks every scenario reuses:
//   * sandbox construction with observed isolation guards (decision 4),
//   * package staging + install-root install (decision 7),
//   * pinned-pi invocation helpers,
//   * transcript / session readers and the post-exit assertion phase,
//   * the normalized run-manifest emitter used by the determinism gate,
//   * a teardown no-write scan, and
//   * a `--self-test` that proves each guard fires.
//
// The harness claims *observation*, not confinement: the child environment is
// allowlist-constructed (never filtered), HOME is redirected to scratch,
// PI_OFFLINE=1, gh is kept off PATH, and a credential denial list refuses to
// start when a real secret is visible in the ambient environment. Confinement
// is the documented container variant (see README), not a CI claim.

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Default pinned-pi binary; overridable with PI_BIN for local experiments. */
export const piBin = process.env.PI_BIN ?? join(repoRoot, "node_modules", ".bin", "pi");

/** The exact pi version this harness is pinned against (asserted at startup). */
export const PINNED_PI_VERSION = "0.80.10";

// ---------------------------------------------------------------------------
// Isolation guard: credential denial list (decision 4)
// ---------------------------------------------------------------------------

/** Exact ambient variable names the harness refuses to run alongside. */
export const CREDENTIAL_DENYLIST = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "ZAI_API_KEY", "GITHUB_TOKEN", "GH_TOKEN", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN"];

/** Suffix catch-alls; any ambient var ending in one of these is denied. */
export const CREDENTIAL_GLOB_SUFFIXES = ["_API_KEY", "_TOKEN", "_SECRET"];

/**
 * Return the names of ambient variables that trip the credential denial list,
 * honouring the per-variable `PI_E2E_ALLOW_<VAR>` escape hatch. A variable is
 * denied when it is on the exact list or matches a glob suffix, is non-empty,
 * and has no truthy escape.
 */
export function findDeniedCredentials(env = process.env) {
	const denied = [];
	const isAllowed = (name) => {
		const allow = env[`PI_E2E_ALLOW_${name}`];
		return allow !== undefined && allow !== "" && allow !== "0" && allow !== "false";
	};
	for (const [name, value] of Object.entries(env)) {
		if (value === undefined || value === "") continue;
		if (name.startsWith("PI_E2E_ALLOW_")) continue;
		const exact = CREDENTIAL_DENYLIST.includes(name);
		const glob = CREDENTIAL_GLOB_SUFFIXES.some((suffix) => name.endsWith(suffix));
		if (!exact && !glob) continue;
		if (isAllowed(name)) continue;
		denied.push(name);
	}
	return denied.sort();
}

// ---------------------------------------------------------------------------
// Child environment (allowlist-constructed, decision 4)
// ---------------------------------------------------------------------------

/**
 * Build an allowlisted child environment. Nothing from the ambient environment
 * is inherited except PATH (with the sandbox stub-bin prepended so `gh` resolves
 * to the harness stub, never the real binary) and the locale-neutral basics;
 * every other key is constructed here so no credential can leak by accident.
 */
export function buildChildEnv(sandbox, extra = {}) {
	return {
		PATH: `${sandbox.stubBin}:${process.env.PATH ?? ""}`,
		HOME: sandbox.home,
		LANG: "C",
		LC_ALL: "C",
		TERM: "dumb",
		PI_OFFLINE: "1",
		PI_SKIP_VERSION_CHECK: "1",
		...extra,
	};
}

/**
 * Write the sandbox `gh` shim. The default shim logs its argv to `sandbox.ghLog`
 * and exits nonzero (a real tracker mutation must never succeed), so the real
 * `gh` on PATH is unreachable for the whole run. Scenario E swaps in the
 * exit-0 logging variant via {@link installGhStub} to model a "safely stubbed"
 * attempt.
 */
async function writeGhShim(sandbox, exitCode) {
	const stub = join(sandbox.stubBin, "gh");
	await writeFile(stub, `#!/usr/bin/env node\nimport { appendFileSync } from "node:fs";\nappendFileSync(${JSON.stringify(sandbox.ghLog)}, JSON.stringify(process.argv.slice(2)) + "\\n");\nprocess.exit(${exitCode});\n`, { mode: 0o755 });
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

export async function fileExists(path) {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

function parseJson(text, label) {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
	}
}

function sha256(buffer) {
	return createHash("sha256").update(buffer).digest("hex");
}

const SNAPSHOT_IGNORE = new Set(["node_modules", ".git", ".ruff_cache"]);

/**
 * Recursively snapshot a directory to a `{ relpath: "size:mtimeMs" }` map,
 * bounded by an ignore set. Used by the teardown no-write scan.
 */
async function snapshotTree(root) {
	const snapshot = {};
	async function walk(dir) {
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			if (SNAPSHOT_IGNORE.has(entry.name)) continue;
			const abs = join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(abs);
			} else if (entry.isFile()) {
				try {
					const info = await stat(abs);
					snapshot[abs] = `${info.size}:${Math.round(info.mtimeMs)}`;
				} catch {
					// vanished between readdir and stat — ignore
				}
			}
		}
	}
	await walk(root);
	return snapshot;
}

/** Compare two snapshots; return the sorted list of added/modified paths. */
function diffSnapshots(before, after) {
	const changed = [];
	for (const [path, sig] of Object.entries(after)) {
		if (before[path] !== sig) changed.push(path);
	}
	return changed.sort();
}

// ---------------------------------------------------------------------------
// Sandbox lifecycle
// ---------------------------------------------------------------------------

/**
 * Construct a fresh sandbox: scratch HOME (with defaultProjectTrust: always and
 * a fabricated auth.json), a git consumer repo, a staged install root, a gh
 * stub directory, and the watched-roots snapshot for the teardown scan.
 *
 * Refuses to start when {@link findDeniedCredentials} reports a hit.
 */
export async function createSandbox(options = {}) {
	const denied = findDeniedCredentials(options.env ?? process.env);
	if (denied.length > 0) {
		throw new Error(`refusing to start: ambient credentials detected (${denied.join(", ")}); unset them or set PI_E2E_ALLOW_<VAR>=1 per variable`);
	}

	const dir = await mkdtemp(join(tmpdir(), "pi-sdlc-e2e-"));
	const home = join(dir, "home");
	const consumer = join(dir, "consumer");
	const staged = join(dir, "install-root", "pi-sdlc");
	const stubBin = join(dir, "stub-bin");
	const ghLog = join(dir, "gh-stub.log");

	await mkdir(join(home, ".pi", "agent"), { recursive: true });
	await mkdir(consumer, { recursive: true });
	await mkdir(stubBin, { recursive: true });

	await writeFile(join(home, ".pi", "agent", "settings.json"), `${JSON.stringify({ defaultProjectTrust: "always", enableInstallTelemetry: false, enableAnalytics: false }, null, 2)}\n`);
	await writeFile(join(home, ".pi", "agent", "auth.json"), `${JSON.stringify({ providers: {} }, null, 2)}\n`);

	// Protected roots the run must never write to. Bounded by SNAPSHOT_IGNORE.
	const watchedRoots = options.watchedRoots ?? [repoRoot, join(process.env.HOME ?? "/nonexistent", ".pi")];
	const watchedBefore = {};
	for (const root of watchedRoots) {
		Object.assign(watchedBefore, await snapshotTree(root));
	}

	const sandbox = {
		dir,
		home,
		consumer,
		staged,
		stubBin,
		ghLog,
		watchedRoots,
		watchedBefore,
	};

	// Shadow `gh` with a deny-stub so the real binary is unreachable this run.
	await writeGhShim(sandbox, 1);

	const env = buildChildEnv(sandbox);
	await runProcess(["git", "init", "-q", "-b", "main", consumer], { cwd: dir, env });
	await runProcess(["git", "config", "user.email", "e2e@example.invalid"], { cwd: consumer, env });
	await runProcess(["git", "config", "user.name", "e2e"], { cwd: consumer, env });

	return sandbox;
}

/** Stage a copy of the package (manifest + skills + templates) into the sandbox install root. */
export async function stagePackage(sandbox) {
	await mkdir(dirname(sandbox.staged), { recursive: true });
	await cp(join(repoRoot, "package.json"), join(sandbox.staged, "package.json"));
	await cp(join(repoRoot, "skills"), join(sandbox.staged, "skills"), { recursive: true });
	await cp(join(repoRoot, "templates"), join(sandbox.staged, "templates"), { recursive: true });
	return sandbox.staged;
}

/** Install the staged copy into the consumer repo by reference (`pi install <staged> -l`). */
export async function installPackage(sandbox) {
	return runPi(sandbox, ["install", sandbox.staged, "-l"]);
}

/**
 * Swap the sandbox `gh` shim to the exit-0 logging variant and return a child
 * env for scenarios that model a "safely stubbed" tracker attempt (scenario E).
 * Every invocation still appends its argv to `sandbox.ghLog`.
 */
export async function installGhStub(sandbox, extraEnv = {}) {
	await writeGhShim(sandbox, 0);
	return buildChildEnv(sandbox, extraEnv);
}

/** Read the recorded gh-stub invocations (argv arrays), or [] if none. */
export async function readGhLog(sandbox) {
	if (!(await fileExists(sandbox.ghLog))) return [];
	const text = await readFile(sandbox.ghLog, "utf8");
	return text.trim()
		? text
				.trim()
				.split("\n")
				.map((line) => parseJson(line, "gh-stub log line"))
		: [];
}

/**
 * Run the teardown no-write scan: re-snapshot the watched roots and fail when
 * anything outside the scratch sandbox was added or modified during the run.
 */
export async function teardownScan(sandbox) {
	const after = {};
	for (const root of sandbox.watchedRoots) {
		Object.assign(after, await snapshotTree(root));
	}
	const changed = diffSnapshots(sandbox.watchedBefore, after).filter((path) => !path.startsWith(sandbox.dir + sep));
	if (changed.length > 0) {
		throw new Error(`teardown scan failed: writes outside the scratch roots detected:\n${changed.join("\n")}`);
	}
	return true;
}

/** Remove the sandbox directory. */
export async function disposeSandbox(sandbox) {
	await rm(sandbox.dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------

/**
 * Spawn a child process, inheriting stdin (required for pi 0.80.10 headless
 * mode — see SPIKE.md) while capturing stdout/stderr. Resolves with
 * `{ stdout, stderr, code, elapsedMs }`; never rejects on nonzero exit so
 * callers can assert on failures.
 */
export function runProcess(argv, options = {}) {
	const started = performance.now();
	return new Promise((resolvePromise, rejectPromise) => {
		const child = spawn(argv[0], argv.slice(1), {
			cwd: options.cwd,
			env: options.env,
			stdio: ["inherit", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		const timeoutMs = options.timeoutMs ?? 60000;
		let timedOut = false;
		const timer = setTimeout(() => {
			timedOut = true;
			child.kill("SIGTERM");
		}, timeoutMs);
		child.on("error", (error) => {
			clearTimeout(timer);
			rejectPromise(error);
		});
		child.on("exit", (code, signal) => {
			clearTimeout(timer);
			const elapsedMs = Math.round(performance.now() - started);
			resolvePromise({ stdout, stderr, code: code ?? null, signal: signal ?? null, elapsedMs, timedOut, argv });
		});
	});
}

/** Invoke the pinned pi with an allowlisted child env. Options: cwd, env, args-passthrough. */
export function runPi(sandbox, args, options = {}) {
	const env = options.env ?? buildChildEnv(sandbox);
	const cwd = options.cwd ?? sandbox.consumer;
	return runProcess([piBin, ...args], { cwd, env, timeoutMs: options.timeoutMs });
}

// ---------------------------------------------------------------------------
// Transcript / session readers and file-effect collection
// ---------------------------------------------------------------------------

/** Collect a `{ relpath: sha256 }` map of all files under a directory (git metadata excluded). */
export async function collectFileEffects(root) {
	const effects = {};
	async function walk(dir) {
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			if (entry.name === ".git") continue;
			const abs = join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(abs);
			} else if (entry.isFile()) {
				const rel = relative(root, abs).split(sep).join("/");
				effects[rel] = sha256(await readFile(abs));
			}
		}
	}
	await walk(root);
	return effects;
}

/**
 * Extract tool calls in assistant *source order* (B13) from a list of puppet
 * request/response records. Each entry is `{ name, arguments }`. The puppet
 * server records what it emitted per turn, ordered as the assistant produced
 * it — never completion order.
 */
export function toolCallsInSourceOrder(assistantTurns) {
	const calls = [];
	for (const turn of assistantTurns) {
		for (const call of turn.toolCalls ?? []) {
			calls.push({ name: call.name, arguments: call.arguments ?? null });
		}
	}
	return calls;
}

// ---------------------------------------------------------------------------
// Post-exit assertion phase (must-match / must-not-match)
// ---------------------------------------------------------------------------

function toRegex(pattern) {
	return pattern instanceof RegExp ? pattern : new RegExp(pattern);
}

/**
 * Assert a text body against must-match / must-not-match patterns. Throws with
 * the scenario/assertion name and the offending body on the first failure. This
 * is the single mechanism behind every positive and negative textual claim.
 */
export function assertText(body, { mustMatch = [], mustNotMatch = [], label = "assertText" } = {}) {
	for (const pattern of mustMatch) {
		if (!toRegex(pattern).test(body)) {
			throw new AssertionError(`${label}: expected to match ${pattern}`, body);
		}
	}
	for (const pattern of mustNotMatch) {
		if (toRegex(pattern).test(body)) {
			throw new AssertionError(`${label}: expected NOT to match ${pattern}`, body);
		}
	}
	return true;
}

/** Assert an ordered sequence of patterns each appears after the previous in the body. */
export function assertOrdered(body, patterns, label = "assertOrdered") {
	let cursor = 0;
	for (const pattern of patterns) {
		const rest = body.slice(cursor);
		const match = toRegex(pattern).exec(rest);
		if (!match) {
			throw new AssertionError(`${label}: expected ordered pattern ${pattern} after offset ${cursor}`, body);
		}
		cursor += match.index + match[0].length;
	}
	return true;
}

export class AssertionError extends Error {
	constructor(message, body) {
		super(`${message}\n---transcript---\n${(body ?? "").slice(0, 4000)}\n---`);
		this.name = "AssertionError";
	}
}

// ---------------------------------------------------------------------------
// Normalized run manifest (determinism gate, panel E8)
// ---------------------------------------------------------------------------

const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const ISO_TS_RE = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b/g;
const MS_RE = /\b\d+ms\b/g;

/**
 * Strip volatile fields from a text body: absolute scratch paths → <SANDBOX>,
 * UUIDs → <UUID>, ISO timestamps → <TS>, `<n>ms` durations → <MS>.
 */
export function stripVolatile(text, sandbox) {
	let out = text;
	if (sandbox?.dir) out = out.split(sandbox.dir).join("<SANDBOX>");
	out = out.replace(UUID_RE, "<UUID>").replace(ISO_TS_RE, "<TS>").replace(MS_RE, "<MS>");
	return out;
}

/**
 * Build the normalized run manifest: ordered matched steps, tool calls in
 * source order, mandated markers, and file-effect hashes, with volatile fields
 * stripped. Two runs from fresh sandboxes must produce byte-identical output.
 */
export function normalizeManifest(record, sandbox) {
	const manifest = {
		scenario: record.scenario,
		exitCode: record.exitCode ?? null,
		matchedSteps: (record.matchedSteps ?? []).map((step) => stripVolatile(String(step), sandbox)),
		toolCalls: (record.toolCalls ?? []).map((call) => ({
			name: call.name,
			arguments: call.arguments ? stripVolatile(typeof call.arguments === "string" ? call.arguments : JSON.stringify(call.arguments), sandbox) : null,
		})),
		markers: (record.markers ?? []).map((marker) => stripVolatile(String(marker), sandbox)),
		files: Object.fromEntries(Object.entries(record.files ?? {}).sort(([a], [b]) => a.localeCompare(b))),
	};
	return manifest;
}

/** Deterministic JSON serialization of a manifest (stable key order already imposed above). */
export function serializeManifest(manifest) {
	return `${JSON.stringify(manifest, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Guard self-test (B8)
// ---------------------------------------------------------------------------

/**
 * Exercise each observed guard against an injected breach and confirm it fires.
 * Returns a list of `{ guard, ok, detail }`. Exits nonzero from the CLI entry
 * point when any guard fails to detect its breach.
 */
export async function runGuardSelfTest() {
	const results = [];

	// 1. Credential denial list — one exact var per class + a glob hit.
	for (const [label, env] of [
		["exact:ANTHROPIC_API_KEY", { ANTHROPIC_API_KEY: "x" }],
		["exact:GITHUB_TOKEN", { GITHUB_TOKEN: "x" }],
		["exact:AWS_SECRET_ACCESS_KEY", { AWS_SECRET_ACCESS_KEY: "x" }],
		["glob:_API_KEY", { SOME_VENDOR_API_KEY: "x" }],
		["glob:_TOKEN", { WEIRD_TOKEN: "x" }],
		["glob:_SECRET", { APP_SECRET: "x" }],
	]) {
		const denied = findDeniedCredentials(env);
		results.push({ guard: `denylist ${label}`, ok: denied.length > 0, detail: denied.join(",") });
	}

	// 2. Escape hatch — a denied var explicitly permitted must NOT trip.
	{
		const denied = findDeniedCredentials({ ANTHROPIC_API_KEY: "x", PI_E2E_ALLOW_ANTHROPIC_API_KEY: "1" });
		results.push({ guard: "denylist escape hatch", ok: denied.length === 0, detail: denied.join(",") });
	}

	// 3. createSandbox refuses to start on a denial hit.
	{
		let refused = false;
		try {
			await createSandbox({ env: { ...cleanEnv(), ANTHROPIC_API_KEY: "x" } });
		} catch {
			refused = true;
		}
		results.push({ guard: "createSandbox refuse-to-start", ok: refused, detail: "" });
	}

	// 4. gh resolves to the sandbox deny-stub, not the real binary.
	{
		const sandbox = await createSandbox({ env: cleanEnv() });
		try {
			const resolved = await runProcess(["sh", "-c", "command -v gh"], { env: buildChildEnv(sandbox) });
			const invoked = await runProcess(["gh", "auth", "status"], { env: buildChildEnv(sandbox) });
			const resolvesToStub = resolved.stdout.trim().startsWith(sandbox.stubBin);
			const deniesInvocation = invoked.code !== 0;
			results.push({ guard: "gh shadowed by deny-stub", ok: resolvesToStub && deniesInvocation, detail: resolved.stdout.trim() });
		} finally {
			await disposeSandbox(sandbox);
		}
	}

	// 5. Teardown scan catches a write into a watched root.
	{
		const protectedDir = await mkdtemp(join(tmpdir(), "pi-sdlc-e2e-protected-"));
		await writeFile(join(protectedDir, "existing.txt"), "before\n");
		const sandbox = await createSandbox({ env: cleanEnv(), watchedRoots: [protectedDir] });
		await writeFile(join(protectedDir, "leaked.txt"), "an out-of-root write\n");
		let caught = false;
		try {
			await teardownScan(sandbox);
		} catch {
			caught = true;
		}
		await disposeSandbox(sandbox);
		await rm(protectedDir, { recursive: true, force: true });
		results.push({ guard: "teardown no-write scan", ok: caught, detail: "" });
	}

	return results;
}

/** A minimal clean environment for the self-test (no ambient credentials). */
function cleanEnv() {
	return { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? tmpdir() };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function mainCli() {
	const arg = process.argv[2];
	if (arg === "--self-test") {
		const results = await runGuardSelfTest();
		let failed = 0;
		for (const result of results) {
			const status = result.ok ? "ok" : "FAIL";
			if (!result.ok) failed += 1;
			process.stdout.write(`[guard] ${status.padEnd(4)} ${result.guard}${result.detail ? ` (${result.detail})` : ""}\n`);
		}
		if (failed > 0) {
			process.stdout.write(`\n${failed} guard(s) failed to fire\n`);
			process.exitCode = 1;
			return;
		}
		process.stdout.write(`\nall ${results.length} guards fired as expected\n`);
		return;
	}
	process.stderr.write("usage: node test/e2e/harness.mjs --self-test\n");
	process.exitCode = 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	await mainCli();
}
