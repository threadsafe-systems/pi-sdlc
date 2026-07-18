#!/usr/bin/env node

// L1 suite (T2): install/discovery + CLI conformance through install-root paths.
//
// Every shipped script is exercised at its *staged install-root* location
// (never the repo checkout), proving the checkout-relative-path regression
// class stays closed. No model is involved here — that is L2.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { assertText, buildChildEnv, commitConsumer, createSandbox, disposeSandbox, fileExists, installPackage, installedResource, installedScript, makeConsumer, runPi, runProcess, stagePackage, teardownScan } from "./harness.mjs";

/** Run an installed script under the sandbox env; returns the process result. */
function runInstalled(sandbox, script, args, cwd) {
	return runProcess(["node", installedScript(sandbox, script), ...args], { cwd, env: buildChildEnv(sandbox), timeoutMs: 60000 });
}

function parseJson(text, label) {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new Error(`${label} not JSON: ${error instanceof Error ? error.message : String(error)}\n${text.slice(0, 500)}`);
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function checkDiscovery(sandbox) {
	const list = await runPi(sandbox, ["list"]);
	assert(list.code === 0, `pi list exited ${list.code}: ${list.stderr}`);
	assert(list.stdout.includes(sandbox.staged), "pi list did not report the staged install root");
	assert(await fileExists(installedResource(sandbox, "skills", "sdlc", "SKILL.md")), "installed SKILL.md missing under install root");
	assert(await fileExists(installedResource(sandbox, "templates", "setup-sdlc.md")), "installed /setup-sdlc template missing under install root");

	// The strongest discovery evidence: a trusted headless run actually loads the
	// installed skill; an untrusted run does not.
	const probe = join(sandbox.dir, "l1-probe.mjs");
	const probeOut = join(sandbox.dir, "l1-probe.json");
	await writeFile(
		probe,
		`import { writeFileSync } from "node:fs";\nexport default function (pi) {\n  pi.registerCommand("probe", { handler: async (_a, ctx) => {\n    writeFileSync(process.env.PI_E2E_PROBE_OUT, JSON.stringify({ trusted: ctx.isProjectTrusted(), skills: ctx.getSystemPromptOptions().skills ?? [] }));\n  }});\n}\n`,
	);
	const trusted = await runPi(sandbox, ["-e", probe, "-p", "--no-session", "--approve", "/probe"], { env: buildChildEnv(sandbox, { PI_E2E_PROBE_OUT: probeOut }) });
	assert(trusted.code === 0, `trusted probe exited ${trusted.code}: ${trusted.stderr}`);
	const trustedProbe = parseJson(await readFile(probeOut, "utf8"), "trusted probe");
	assert(trustedProbe.trusted === true, "--approve did not trust the project");
	assert(JSON.stringify(trustedProbe.skills).includes("SKILL.md"), "trusted -p run did not load the installed skill");
	// Install-root fidelity at the discovery surface: every discovered skill file
	// path must resolve under the staged install root, never the repo checkout.
	const skillPaths = (trustedProbe.skills ?? []).map((s) => (typeof s === "string" ? s : (s.filePath ?? s.path ?? JSON.stringify(s)))).filter((p) => p.includes("SKILL.md"));
	assert(skillPaths.length > 0, "trusted -p run exposed no skill file path to assert");
	assert(
		skillPaths.every((p) => p.startsWith(sandbox.staged)),
		`discovered skill path(s) not under the install root ${sandbox.staged}: ${skillPaths.join(", ")}`,
	);

	const untrusted = await runPi(sandbox, ["-e", probe, "-p", "--no-session", "--no-approve", "/probe"], { env: buildChildEnv(sandbox, { PI_E2E_PROBE_OUT: probeOut }) });
	assert(untrusted.code === 0, `untrusted probe exited ${untrusted.code}: ${untrusted.stderr}`);
	const untrustedProbe = parseJson(await readFile(probeOut, "utf8"), "untrusted probe");
	assert(untrustedProbe.trusted === false, "--no-approve did not refuse project trust");
	assert(!JSON.stringify(untrustedProbe.skills).includes("SKILL.md"), "--no-approve run loaded the project skill unexpectedly");
}

const PRESET_DIALS = {
	solo: { code: "advisory", tasks: "self", separateSpec: false, publishToTracker: "never" },
	standard: { code: "panel", tasks: "subagent", separateSpec: false, publishToTracker: 4 },
	full: { code: "panel", tasks: "subagent", separateSpec: true, publishToTracker: 2 },
};

async function checkSetupPresets(sandbox) {
	for (const [preset, dials] of Object.entries(PRESET_DIALS)) {
		const consumer = await makeConsumer(sandbox, `preset-${preset}`);
		const result = await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", preset, "--seed-panels", "--yes", "--format", "json", "--repo-root", consumer], sandbox.dir);
		assert(result.code === 0, `setup --preset ${preset} exited ${result.code}: ${result.stderr}`);
		const report = parseJson(result.stdout, `setup ${preset} report`);
		const configAsset = report.assets.find((a) => a.id === "config");
		assert(configAsset?.action === "created", `setup --preset ${preset} did not create a fresh config (${configAsset?.action})`);
		const config = parseJson(await readFile(join(consumer, ".pi", "sdlc", "sdlc.config.json"), "utf8"), `${preset} config`);
		assert(config.schemaVersion === 3, `${preset} config not schemaVersion 3`);
		assert(config.review.code === dials.code, `${preset} review.code = ${config.review.code}, expected ${dials.code}`);
		assert(config.review.tasks === dials.tasks, `${preset} review.tasks = ${config.review.tasks}, expected ${dials.tasks}`);
		assert(config.shape.separateSpec === dials.separateSpec, `${preset} shape.separateSpec = ${config.shape.separateSpec}`);
		assert(config.shape.publishToTracker === dials.publishToTracker, `${preset} shape.publishToTracker = ${config.shape.publishToTracker}`);
	}
}

async function checkPresetPatchAndOverrideGuard(sandbox) {
	const consumer = await makeConsumer(sandbox, "patch-guard");
	// Fresh full preset with an extra per-track override applied at write time.
	const created = await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "full", "--seed-panels", "--override", "reversible:code:advisory", "--yes", "--format", "json", "--repo-root", consumer], sandbox.dir);
	assert(created.code === 0, `setup --preset full exited ${created.code}: ${created.stderr}`);
	const configPath = join(consumer, ".pi", "sdlc", "sdlc.config.json");
	let config = parseJson(await readFile(configPath, "utf8"), "full config");
	assert(config.overrides?.reversible?.review?.code === "advisory", `--override reversible:code:advisory not applied (${JSON.stringify(config.overrides)})`);

	// A per-dial-only patch preserves unrelated dials (action: patched).
	const patch = await runInstalled(sandbox, "setup-sdlc.mjs", ["--review-brainstorm", "off", "--yes", "--format", "json", "--repo-root", consumer], sandbox.dir);
	assert(patch.code === 0, `dial patch exited ${patch.code}: ${patch.stderr}`);
	const patchReport = parseJson(patch.stdout, "patch report");
	const patchAsset = patchReport.assets.find((a) => a.id === "config");
	assert(patchAsset?.action === "patched", `dial-only re-run did not patch (${patchAsset?.action})`);
	config = parseJson(await readFile(configPath, "utf8"), "patched config");
	assert(config.overrides?.reversible?.review?.code === "advisory", "patch clobbered the consumer override it did not carry");
	assert(config.review.brainstorm === "off", "dial patch did not apply --review-brainstorm off");

	// Override guard: a preset re-run that would drop the override refuses without --force.
	const refused = await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "standard", "--yes", "--format", "json", "--repo-root", consumer], sandbox.dir);
	const refusedReport = parseJson(refused.stdout, "refused report");
	const refusedAsset = refusedReport.assets.find((a) => a.id === "config");
	assert(refusedAsset?.action === "refused", `preset re-run over consumer overrides did not refuse (${refusedAsset?.action})`);
	assertText(refusedAsset.message, { mustMatch: [/overrides/], label: "override guard message" });
}

async function checkSdlcStatusStates(sandbox) {
	// ready: adopted, clean, valid, seeded panels, committed.
	const ready = await makeConsumer(sandbox, "status-ready");
	await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "full", "--seed-panels", "--yes", "--format", "json", "--repo-root", ready], sandbox.dir);
	await commitConsumer(sandbox, ready);
	const readyStatus = await runInstalled(sandbox, "sdlc-status.mjs", ["--repo-root", ready, "--format", "json"], sandbox.dir);
	const readyReport = parseJson(readyStatus.stdout, "ready status");
	assert(readyStatus.code === 0 && readyReport.state === "ready", `expected ready/0, got ${readyReport.state}/${readyStatus.code}`);

	// not-adopted: fresh repo, no config in HEAD.
	const na = await makeConsumer(sandbox, "status-na");
	const naStatus = await runInstalled(sandbox, "sdlc-status.mjs", ["--repo-root", na, "--format", "json"], sandbox.dir);
	const naReport = parseJson(naStatus.stdout, "na status");
	assert(naStatus.code === 1 && naReport.state === "not-adopted", `expected not-adopted/1, got ${naReport.state}/${naStatus.code}`);

	// not-ready: adopted (config committed) but merged panels roster missing.
	const nr = await makeConsumer(sandbox, "status-nr");
	await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "full", "--yes", "--format", "json", "--repo-root", nr], sandbox.dir);
	await commitConsumer(sandbox, nr);
	const nrStatus = await runInstalled(sandbox, "sdlc-status.mjs", ["--repo-root", nr, "--format", "json"], sandbox.dir);
	const nrReport = parseJson(nrStatus.stdout, "nr status");
	assert(nrStatus.code === 3 && nrReport.state === "not-ready", `expected not-ready/3, got ${nrReport.state}/${nrStatus.code}`);

	// error: unresolvable root.
	const errStatus = await runInstalled(sandbox, "sdlc-status.mjs", ["--repo-root", join(sandbox.dir, "does-not-exist"), "--format", "json"], sandbox.dir);
	const errReport = parseJson(errStatus.stdout, "error status");
	assert(errStatus.code === 2 && errReport.state === "error", `expected error/2, got ${errReport.state}/${errStatus.code}`);
}

async function checkV2HonestRefusal(sandbox) {
	// A committed schemaVersion 2 config: setup refuses without --force and names
	// re-run/pin as the remedy, never "migration"; sdlc-status reports not-ready.
	const consumer = await makeConsumer(sandbox, "v2-refusal");
	const cfgDir = join(consumer, ".pi", "sdlc");
	await runProcess(["mkdir", "-p", cfgDir], { env: buildChildEnv(sandbox) });
	await writeFile(join(cfgDir, "sdlc.config.json"), `${JSON.stringify({ schemaVersion: 2, prefix: "demo", labelPrefix: "demo" }, null, 2)}\n`);
	await commitConsumer(sandbox, consumer);

	const refused = await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "full", "--yes", "--format", "json", "--repo-root", consumer], sandbox.dir);
	const report = parseJson(refused.stdout, "v2 setup report");
	const configAsset = report.assets.find((a) => a.id === "config");
	assert(configAsset?.action === "refused", `v2 setup did not refuse (${configAsset?.action})`);
	assertText(configAsset.message, { mustMatch: [/re-run setup-sdlc|pin/], mustNotMatch: [/migrat/i], label: "v2 refusal remedy" });

	const status = await runInstalled(sandbox, "sdlc-status.mjs", ["--repo-root", consumer, "--format", "json"], sandbox.dir);
	const statusReport = parseJson(status.stdout, "v2 status");
	assert(status.code === 3 && statusReport.state === "not-ready", `expected not-ready/3 for v2 config, got ${statusReport.state}/${status.code}`);
	assertText(JSON.stringify(statusReport), { mustNotMatch: [/migrat/i], label: "v2 status remedy" });
}

async function checkLifecycleBodyMode(sandbox) {
	const consumer = await makeConsumer(sandbox, "check-lifecycle");
	await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "full", "--seed-panels", "--yes", "--format", "json", "--repo-root", consumer], sandbox.dir);
	// Commit the plan + build docs for slug "demo" (reversible ⇒ no spec required).
	const plansDir = join(consumer, "docs", "plans");
	await runProcess(["mkdir", "-p", plansDir], { env: buildChildEnv(sandbox) });
	await writeFile(join(plansDir, "2026-07-18-demo.md"), "# Plan: demo\n");
	await writeFile(join(plansDir, "2026-07-18-demo-build.md"), "# Build plan: demo\n");
	await commitConsumer(sandbox, consumer);

	const goodBody = join(sandbox.dir, "cl-good.md");
	await writeFile(goodBody, "```sdlc\ntrack: reversible\nslug: demo\n```\n");
	const good = await runInstalled(sandbox, "check-lifecycle.mjs", ["--body", goodBody, "--repo-root", consumer, "--format", "json"], sandbox.dir);
	const goodReport = parseJson(good.stdout, "check-lifecycle good");
	assert(good.code === 0 && goodReport.exitCode === 0, `check-lifecycle body mode failed for committed artifacts: ${good.stdout}`);

	const badBody = join(sandbox.dir, "cl-bad.md");
	await writeFile(badBody, "```sdlc\ntrack: reversible\nslug: missing-slug\n```\n");
	const bad = await runInstalled(sandbox, "check-lifecycle.mjs", ["--body", badBody, "--repo-root", consumer, "--format", "json"], sandbox.dir);
	assert(bad.code !== 0, "check-lifecycle passed for a slug with no committed artifacts");
}

async function checkOnShortfall(sandbox) {
	// Through install-root paths, put exactly ONE credentialed provider in the
	// scratch auth.json (offline; resolve-panel only reads provider keys, never
	// calls the API without --pong). pr_review's floor is 3, so the panel sits
	// below the floor: onShortfall:fail hard-fails; proceed is best-effort (exit 0
	// with an advisory).
	await writeFile(join(sandbox.home, ".pi", "agent", "auth.json"), `${JSON.stringify({ anthropic: { type: "api", key: "offline-dummy" } }, null, 2)}\n`);
	const author = "zai/glm-5.2";

	const failConsumer = await makeConsumer(sandbox, "shortfall-fail");
	await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "full", "--seed-panels", "--on-shortfall", "fail", "--yes", "--format", "json", "--repo-root", failConsumer], sandbox.dir);
	await commitConsumer(sandbox, failConsumer);
	const failRun = await runInstalled(sandbox, "resolve-panel.mjs", ["pr_review", "--author", author, "--track", "reversible"], failConsumer);

	const proceedConsumer = await makeConsumer(sandbox, "shortfall-proceed");
	await runInstalled(sandbox, "setup-sdlc.mjs", ["--preset", "full", "--seed-panels", "--on-shortfall", "proceed", "--yes", "--format", "json", "--repo-root", proceedConsumer], sandbox.dir);
	await commitConsumer(sandbox, proceedConsumer);
	const proceedRun = await runInstalled(sandbox, "resolve-panel.mjs", ["pr_review", "--author", author, "--track", "reversible"], proceedConsumer);

	assert(failRun.code !== 0, `onShortfall:fail did not hard-fail below the floor (exit ${failRun.code})`);
	assert(proceedRun.code === 0, `onShortfall:proceed did not proceed best-effort (exit ${proceedRun.code}: ${proceedRun.stderr})`);
	assertText(proceedRun.stderr, { mustMatch: [/advisory\[pr_review\]|onShortfall is 'proceed'/], label: "proceed advisory" });
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const CHECKS = [
	["discovery", checkDiscovery],
	["setup-presets", checkSetupPresets],
	["preset-patch + override guard", checkPresetPatchAndOverrideGuard],
	["sdlc-status four states", checkSdlcStatusStates],
	["v2 honest refusal (no migration)", checkV2HonestRefusal],
	["check-lifecycle body mode", checkLifecycleBodyMode],
	["onShortfall proceed/fail", checkOnShortfall],
];

export async function runL1() {
	const sandbox = await createSandbox();
	const results = [];
	try {
		await stagePackage(sandbox);
		const install = await installPackage(sandbox);
		assert(install.code === 0, `pi install exited ${install.code}: ${install.stderr}`);
		for (const [name, fn] of CHECKS) {
			try {
				await fn(sandbox);
				results.push({ name, ok: true });
			} catch (error) {
				results.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) });
			}
		}
		await teardownScan(sandbox);
	} finally {
		await disposeSandbox(sandbox);
	}
	return results;
}

if (process.argv[1]?.endsWith("l1.mjs")) {
	const results = await runL1();
	let failed = 0;
	for (const result of results) {
		process.stdout.write(`[L1] ${result.ok ? "ok  " : "FAIL"} ${result.name}${result.ok ? "" : `\n     ${result.detail}`}\n`);
		if (!result.ok) failed += 1;
	}
	if (failed > 0) {
		process.stdout.write(`\n${failed} L1 check(s) failed\n`);
		process.exitCode = 1;
	} else {
		process.stdout.write(`\nall ${results.length} L1 checks passed\n`);
	}
}
