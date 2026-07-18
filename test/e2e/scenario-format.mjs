#!/usr/bin/env node

// Scenario format + runner (T3): the L2 puppet-model scenario mechanism.
//
// A scenario declares:
//   - name
//   - setup(sandbox) -> { consumer }  : builds+commits a scratch consumer repo
//       with the config under test (via installed setup-sdlc), returning its path
//   - prompt                          : the single headless user prompt
//   - steps: [ { content?, toolCalls?, trigger? } ]  : ordered canned turns; the
//       harness prepends a `loader` step that reads the install-root SKILL.md so
//       the anti-vacuity sentinel can be observed
//   - assert({ record }) -> void      : throws on failure (post-exit phase)
//   - sentinel?                       : override the default SKILL.md body sentinel
//   - tools?, ghStub?                 : pi --tools list; whether to use the gh stub
//
// The runner returns a normalized manifest for the determinism gate.

import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildChildEnv, collectFileEffects, createSandbox, disposeSandbox, fileExists, installGhStub, installPackage, installedResource, makeConsumer, normalizeManifest, readGhLog, removeInstalledSkill, resetGhStub, runPi, stagePackage, toolCallsInSourceOrder } from "./harness.mjs";

const PUPPET_DIR = join(dirname(fileURLToPath(import.meta.url)), "puppet");
const SERVER = join(PUPPET_DIR, "server.mjs");

/** Default anti-vacuity sentinel: a stable sentence from the installed SKILL.md body. */
export const DEFAULT_SENTINEL = "The one predictable way a change enters the codebase.";

function parseJsonl(text) {
	return text.trim()
		? text
				.trim()
				.split("\n")
				.map((line) => JSON.parse(line))
		: [];
}

/**
 * Start the scripted puppet server for a scenario. Prepends a loader step that
 * reads the install-root SKILL.md — but the puppet only fires the loader once it
 * has observed that install-root location in the request stream (the discovery
 * gate), so a scenario cannot advance unless pi genuinely surfaced the installed
 * skill. Binds an OS-assigned free port (no fixed-port collisions) and reports it
 * via the ready file.
 */
async function startPuppet(sandbox, { steps, sentinel }) {
	const dir = await mkdtemp(join(sandbox.dir, "puppet-"));
	const scriptPath = join(dir, "script.json");
	const requestsPath = join(dir, "requests.jsonl");
	const emissionsPath = join(dir, "emissions.jsonl");
	const readyPath = join(dir, "ready");
	const skillPath = installedResource(sandbox, "skills", "sdlc", "SKILL.md");
	const loader = [{ loader: true, toolCalls: [{ name: "read", arguments: { path: skillPath } }] }];
	await writeFile(scriptPath, JSON.stringify({ sentinel, steps: [...loader, ...steps] }, null, 2));

	let stderr = "";
	let exited = false;
	const child = spawn(process.execPath, [SERVER], {
		env: { PATH: process.env.PATH ?? "", PUPPET_PORT: "0", PUPPET_SCRIPT: scriptPath, PUPPET_REQUESTS: requestsPath, PUPPET_EMISSIONS: emissionsPath, PUPPET_READY: readyPath, PUPPET_SKILL_LOCATION: skillPath },
		stdio: ["ignore", "ignore", "pipe"],
	});
	child.stderr.on("data", (chunk) => {
		stderr += chunk;
		if (process.env.PI_E2E_DEBUG) process.stderr.write(chunk);
	});
	child.once("exit", () => {
		exited = true;
	});
	let boundPort = "";
	for (let attempt = 0; attempt < 500; attempt += 1) {
		if (await fileExists(readyPath)) {
			boundPort = (await readFile(readyPath, "utf8").catch(() => "")).trim();
			if (boundPort) break;
		}
		if (exited) break;
		await new Promise((r) => setTimeout(r, 10));
	}
	if (!boundPort) {
		child.kill("SIGTERM");
		throw new Error(`puppet server did not become ready${stderr ? `: ${stderr.trim()}` : exited ? " (server exited early)" : ""}`);
	}

	return {
		url: `http://127.0.0.1:${boundPort}/v1`,
		requests: async () => parseJsonl(await readFile(requestsPath, "utf8").catch(() => "")),
		emissions: async () => parseJsonl(await readFile(emissionsPath, "utf8").catch(() => "")),
		close: () =>
			new Promise((resolve) => {
				child.once("exit", resolve);
				child.kill("SIGTERM");
			}),
	};
}

/**
 * Run one scenario end to end and return { record, manifest }. The record holds
 * the raw run surface (stdout, requests, tool calls, file effects, gh log); the
 * manifest is its normalized, volatile-stripped projection.
 */
export async function runScenario(sandbox, scenario) {
	const { consumer } = await scenario.setup(sandbox);
	const sentinel = scenario.sentinel ?? DEFAULT_SENTINEL;
	// Reset the shared gh-stub log so ghLog reflects only this scenario, and
	// restore the deny-stub unless this scenario opts into the logging stub.
	await writeFile(sandbox.ghLog, "");
	if (!scenario.ghStub) await resetGhStub(sandbox);
	const puppet = await startPuppet(sandbox, { steps: scenario.steps, sentinel });
	let record;
	let run;
	try {
		const env = scenario.ghStub ? await installGhStub(sandbox, { PUPPET_BASE_URL: puppet.url }) : buildChildEnv(sandbox, { PUPPET_BASE_URL: puppet.url });
		const args = ["-e", PUPPET_DIR, "-p", "--no-session", "--approve", "--provider", "puppet", "--model", "puppet-model"];
		if (scenario.tools) args.push("--tools", scenario.tools);
		args.push(scenario.prompt ?? "proceed");
		run = await runPi(sandbox, args, { cwd: consumer, env, timeoutMs: scenario.timeoutMs ?? 60000 });

		const emissions = await puppet.emissions();
		const scenarioTurns = emissions.filter((turn) => Array.isArray(turn.toolCalls) && turn.loader !== true);
		// The assistant's emitted text stream (content per turn, in order). pi does
		// not print assistant text that accompanies a tool call to -p stdout, so the
		// mandated markers are asserted here — interleaved with the REAL tool
		// execution loop that pi drives between turns.
		const scenarioEmissions = emissions.filter((turn) => typeof turn.turn === "number" && turn.loader !== true);
		const matchedSteps = scenarioEmissions.map((turn) => turn.content ?? "");
		const transcript = matchedSteps.filter(Boolean).join("\n");
		record = {
			scenario: scenario.name,
			exitCode: run.code,
			timedOut: run.timedOut,
			stdout: run.stdout,
			stderr: run.stderr,
			transcript,
			matchedSteps,
			requests: await puppet.requests(),
			emissions,
			toolCalls: toolCallsInSourceOrder(scenarioTurns),
			markers: extractMarkers(transcript),
			files: await collectFileEffects(consumer),
			ghLog: await readGhLog(sandbox),
			locked: run.stdout.includes("PUPPET_LOCKED"),
			lockReason: emissions.find((turn) => turn.turn === "locked")?.reason ?? null,
		};
	} finally {
		await puppet.close();
	}

	// Positive-run integrity (skipped when the scenario expects a locked run, e.g.
	// the negative control): the session must exit cleanly, the puppet must not
	// have locked or missed a trigger, and every declared step must have been
	// consumed — otherwise a broken multi-turn/adoption wiring could pass silently.
	if (!scenario.expectLocked) {
		if (record.locked) throw new AssertionErrorLite(scenario.name, "run was LOCKED (discovery/sentinel gate not satisfied)");
		if (record.timedOut || record.exitCode !== 0) throw new AssertionErrorLite(scenario.name, `pi exited ${record.exitCode}${record.timedOut ? " (timed out)" : ""}`);
		const misses = record.emissions.filter((turn) => turn.miss !== undefined);
		if (misses.length > 0) throw new AssertionErrorLite(scenario.name, `puppet trigger miss: ${misses.map((m) => m.miss).join(", ")}`);
		if (record.matchedSteps.length !== scenario.steps.length) throw new AssertionErrorLite(scenario.name, `consumed ${record.matchedSteps.length}/${scenario.steps.length} declared steps`);
	}

	await scenario.assert({ record });
	return { record, manifest: normalizeManifest(record, sandbox) };
}

class AssertionErrorLite extends Error {
	constructor(scenarioName, message) {
		super(`scenario ${scenarioName}: ${message}`);
		this.name = "ScenarioIntegrityError";
	}
}

/** Extract the SKILL's mechanically-mandated marker lines from the assistant transcript, in order. */
export function extractMarkers(transcript) {
	const markers = [];
	for (const line of transcript.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.startsWith("[sdlc hook]")) markers.push(trimmed);
	}
	return markers;
}

// ---------------------------------------------------------------------------
// Shared negative control (decision 5) + self-test
// ---------------------------------------------------------------------------

/**
 * Run one scenario under a single negative-control mode and return whether it
 * correctly FAILED to proceed (locked). `mode` is "mutated-sentinel" (skill
 * present, pinned sentinel never matches) or "skill-removed" (caller must have
 * removed the installed skill first). Strict: any thrown error is a control
 * failure, never scored as a pass — the anti-vacuity checker must not itself be
 * vacuous. A scenario that still emits its scripted steps is a broken gate.
 */
export async function runNegativeMode(sandbox, scenario, mode) {
	const twin = { ...scenario, assert: () => {}, expectLocked: true };
	if (mode === "mutated-sentinel") twin.sentinel = `MUTATED_${scenario.name}_NEVER_MATCHES`;
	const { record } = await runScenario(sandbox, twin);
	if (!record.locked) throw new Error(`negative control (${mode}) failed: scenario '${scenario.name}' emitted steps instead of locking`);
	// A locked run is still a clean pi session (locked text + stop); a nonzero
	// exit or timeout means the control was satisfied by an infra failure, not the
	// gate — reject it so the anti-vacuity checker is not itself vacuous.
	if (record.exitCode !== 0 || record.timedOut) throw new Error(`negative control (${mode}) failed: scenario '${scenario.name}' pi exited ${record.exitCode}${record.timedOut ? " (timed out)" : ""}`);
	// Assert the lock fired via the mode's OWN gate, not incidentally: the mutated
	// sentinel must lock at the sentinel gate (skill present + read), the removed
	// skill at the discovery gate.
	const reason = record.lockReason ?? "";
	const expected = mode === "mutated-sentinel" ? /sentinel not observed/ : /skill location not observed|discovery/;
	if (!expected.test(reason)) throw new Error(`negative control (${mode}) failed: scenario '${scenario.name}' locked for the wrong reason: ${JSON.stringify(reason)}`);
	return { mode, locked: true, reason };
}

/** Create a fresh sandbox, stage + install the package, run `fn(sandbox)`, dispose. */
export async function withInstalledSandbox(fn) {
	const sandbox = await createSandbox();
	try {
		await stagePackage(sandbox);
		await installPackage(sandbox);
		return await fn(sandbox);
	} finally {
		await disposeSandbox(sandbox);
	}
}

async function runNegativeControlSelfTest() {
	const results = [];
	// Positive baseline + mutated-sentinel in one sandbox (non-destructive).
	const sandbox = await createSandbox();
	try {
		await stagePackage(sandbox);
		await installPackage(sandbox);
		const consumer = await makeConsumer(sandbox, "nc-self-test");
		await installPackage(sandbox, consumer);
		const trivial = {
			name: "nc-self-test",
			setup: async () => ({ consumer }),
			prompt: "use the sdlc skill and proceed",
			tools: "read,write,bash",
			steps: [{ content: "[sdlc hook] implement:before result: ok" }],
			assert: () => {},
		};
		const positive = await runScenario(sandbox, trivial);
		results.push({ check: "positive baseline unlocks", ok: !positive.record.locked && positive.record.markers.length > 0 });
		try {
			await runNegativeMode(sandbox, trivial, "mutated-sentinel");
			results.push({ check: "negative control locks (mutated sentinel)", ok: true });
		} catch (error) {
			results.push({ check: "negative control locks (mutated sentinel)", ok: false, detail: error instanceof Error ? error.message : String(error) });
		}
	} finally {
		await disposeSandbox(sandbox);
	}
	// Skill-removed in a fresh sandbox (destructive).
	const removedSandbox = await createSandbox();
	try {
		await stagePackage(removedSandbox);
		await installPackage(removedSandbox);
		const consumer = await makeConsumer(removedSandbox, "nc-self-test-removed");
		await installPackage(removedSandbox, consumer);
		const trivial = {
			name: "nc-self-test-removed",
			setup: async () => ({ consumer }),
			prompt: "use the sdlc skill and proceed",
			tools: "read,write,bash",
			steps: [{ content: "[sdlc hook] implement:before result: ok" }],
			assert: () => {},
		};
		await removeInstalledSkill(removedSandbox);
		try {
			await runNegativeMode(removedSandbox, trivial, "skill-removed");
			results.push({ check: "negative control locks (skill removed)", ok: true });
		} catch (error) {
			results.push({ check: "negative control locks (skill removed)", ok: false, detail: error instanceof Error ? error.message : String(error) });
		}
	} finally {
		await disposeSandbox(removedSandbox);
	}
	return results;
}

if (process.argv[1]?.endsWith("scenario-format.mjs")) {
	const results = await runNegativeControlSelfTest();
	let failed = 0;
	for (const result of results) {
		process.stdout.write(`[nc] ${result.ok ? "ok  " : "FAIL"} ${result.check}${result.ok ? "" : `\n     ${result.detail}`}\n`);
		if (!result.ok) failed += 1;
	}
	if (failed > 0) {
		process.stdout.write(`\n${failed} negative-control self-test(s) failed\n`);
		process.exitCode = 1;
	} else {
		process.stdout.write(`\nnegative-control mechanism verified\n`);
	}
}
