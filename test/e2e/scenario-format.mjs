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
import { buildChildEnv, collectFileEffects, createSandbox, disposeSandbox, fileExists, installGhStub, installPackage, installedResource, makeConsumer, normalizeManifest, readGhLog, removeInstalledSkill, runPi, stagePackage, toolCallsInSourceOrder } from "./harness.mjs";

const PUPPET_DIR = join(dirname(fileURLToPath(import.meta.url)), "puppet");
const SERVER = join(PUPPET_DIR, "server.mjs");

/** Default anti-vacuity sentinel: a stable sentence from the installed SKILL.md body. */
export const DEFAULT_SENTINEL = "The one predictable way a change enters the codebase.";

let nextPort = 18820;

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
 * reads the install-root SKILL.md (so the sentinel enters the request stream)
 * unless `skipLoader` is set (used by the skill-removed negative control).
 */
async function startPuppet(sandbox, { steps, sentinel, skipLoader }) {
	const port = nextPort++;
	const dir = await mkdtemp(join(sandbox.dir, "puppet-"));
	const scriptPath = join(dir, "script.json");
	const requestsPath = join(dir, "requests.jsonl");
	const emissionsPath = join(dir, "emissions.jsonl");
	const readyPath = join(dir, "ready");
	const skillPath = installedResource(sandbox, "skills", "sdlc", "SKILL.md");
	const loader = skipLoader ? [] : [{ loader: true, toolCalls: [{ name: "read", arguments: { path: skillPath } }] }];
	await writeFile(scriptPath, JSON.stringify({ sentinel, steps: [...loader, ...steps] }, null, 2));

	const child = spawn(process.execPath, [SERVER], {
		env: { PATH: process.env.PATH ?? "", PUPPET_PORT: String(port), PUPPET_SCRIPT: scriptPath, PUPPET_REQUESTS: requestsPath, PUPPET_EMISSIONS: emissionsPath, PUPPET_READY: readyPath },
		stdio: ["ignore", "ignore", "pipe"],
	});
	child.stderr.on("data", (chunk) => {
		if (process.env.PI_E2E_DEBUG) process.stderr.write(chunk);
	});
	for (let attempt = 0; attempt < 300; attempt += 1) {
		if (await fileExists(readyPath)) break;
		await new Promise((r) => setTimeout(r, 10));
	}
	if (!(await fileExists(readyPath))) throw new Error("puppet server did not become ready");

	return {
		url: `http://127.0.0.1:${port}/v1`,
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
	// Reset the shared gh-stub log so ghLog reflects only this scenario.
	await writeFile(sandbox.ghLog, "");
	const puppet = await startPuppet(sandbox, { steps: scenario.steps, sentinel, skipLoader: scenario.skipLoader });
	let record;
	try {
		const env = scenario.ghStub ? await installGhStub(sandbox, { PUPPET_BASE_URL: puppet.url }) : buildChildEnv(sandbox, { PUPPET_BASE_URL: puppet.url });
		const args = ["-e", PUPPET_DIR, "-p", "--no-session", "--approve", "--provider", "puppet", "--model", "puppet-model"];
		if (scenario.tools) args.push("--tools", scenario.tools);
		args.push(scenario.prompt ?? "proceed");
		const run = await runPi(sandbox, args, { cwd: consumer, env, timeoutMs: scenario.timeoutMs ?? 60000 });

		const emissions = await puppet.emissions();
		const scenarioTurns = emissions.filter((turn) => Array.isArray(turn.toolCalls) && turn.loader !== true);
		// The assistant's emitted text stream (content per turn, in order). pi does
		// not print assistant text that accompanies a tool call to -p stdout, so the
		// mandated markers are asserted here — interleaved with the REAL tool
		// execution loop that pi drives between turns.
		const transcript = emissions
			.filter((turn) => turn.loader !== true && turn.turn !== "locked")
			.map((turn) => turn.content ?? "")
			.filter(Boolean)
			.join("\n");
		record = {
			scenario: scenario.name,
			exitCode: run.code,
			stdout: run.stdout,
			stderr: run.stderr,
			transcript,
			requests: await puppet.requests(),
			emissions,
			toolCalls: toolCallsInSourceOrder(scenarioTurns),
			markers: extractMarkers(transcript),
			files: await collectFileEffects(consumer),
			ghLog: await readGhLog(sandbox),
			locked: run.stdout.includes("PUPPET_LOCKED"),
		};
	} finally {
		await puppet.close();
	}
	scenario.assert({ record });
	return { record, manifest: normalizeManifest(record, sandbox) };
}

/** Extract the SKILL's mechanically-mandated marker lines from stdout, in order. */
export function extractMarkers(stdout) {
	const markers = [];
	for (const line of stdout.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.startsWith("[sdlc hook]")) markers.push(trimmed);
	}
	return markers;
}

// ---------------------------------------------------------------------------
// Shared negative control (decision 5) + self-test
// ---------------------------------------------------------------------------

/**
 * Run a scenario under the shared negative control and assert it FAILS: once
 * with a mutated sentinel (skill present but the pinned sentinel never matches),
 * once with the installed skill removed. Returns per-mode `{ mode, locked }`.
 * A scenario that still emits its scripted steps under either mode is a broken
 * anti-vacuity gate.
 */
export async function assertNegativeControl(sandbox, scenario) {
	const mutated = { ...scenario, sentinel: `MUTATED_SENTINEL_${scenario.name}_NEVER_MATCHES`, assert: () => {} };
	const mutatedRun = await runScenario(sandbox, mutated);
	if (!mutatedRun.record.locked) throw new Error(`negative control failed: scenario '${scenario.name}' emitted steps with a mutated sentinel`);

	await removeInstalledSkill(sandbox);
	const removed = { ...scenario, assert: () => {} };
	const removedRun = await runScenario(sandbox, removed);
	if (!removedRun.record.locked) throw new Error(`negative control failed: scenario '${scenario.name}' emitted steps with the skill removed`);

	return [
		{ mode: "mutated-sentinel", locked: true },
		{ mode: "skill-removed", locked: true },
	];
}

async function runNegativeControlSelfTest() {
	const sandbox = await createSandbox();
	const results = [];
	try {
		await stagePackage(sandbox);
		await installPackage(sandbox);
		const consumer = await makeConsumer(sandbox, "nc-self-test");
		const trivial = {
			name: "nc-self-test",
			setup: async () => ({ consumer }),
			prompt: "use the sdlc skill and proceed",
			tools: "read,write,bash",
			steps: [{ content: "[sdlc hook] implement:before result: ok" }],
			assert: () => {},
		};
		// Positive baseline: unlocks and emits the marker.
		const positive = await runScenario(sandbox, trivial);
		results.push({ check: "positive baseline unlocks", ok: !positive.record.locked && positive.record.markers.length > 0 });
		// Negative control: both modes must lock. (Runs the skill-removed mode last.)
		try {
			await assertNegativeControl(sandbox, trivial);
			results.push({ check: "negative control locks (mutated + skill-removed)", ok: true });
		} catch (error) {
			results.push({ check: "negative control locks (mutated + skill-removed)", ok: false, detail: error instanceof Error ? error.message : String(error) });
		}
	} finally {
		await disposeSandbox(sandbox);
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
