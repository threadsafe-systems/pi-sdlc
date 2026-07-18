#!/usr/bin/env node

// Top-level e2e runner (T5): one command that runs L1 + the L2 scenarios + the
// shared negative control, and (with --determinism) proves two full runs from
// fresh sandboxes produce byte-identical normalized manifests.
//
// Usage:
//   node test/e2e/run.mjs                 # full suite (L1 + L2 + negative control)
//   node test/e2e/run.mjs --scenario l1   # L1 only
//   node test/e2e/run.mjs --scenario B    # L2 scenarios whose name matches "B"
//   node test/e2e/run.mjs --determinism   # full suite + two-run manifest byte-compare
//   node test/e2e/run.mjs --manifest out.json  # also write the aggregated manifest
//
// The suite refuses to start when ambient credentials are present (see the
// isolation guards). CI and local runs use a clean environment:
//   env -i PATH="$PATH" HOME="$HOME" node test/e2e/run.mjs --determinism

import { writeFile } from "node:fs/promises";
import { createSandbox, disposeSandbox, installPackage, removeInstalledSkill, serializeManifest, stagePackage, teardownScan } from "./harness.mjs";
import { runL1 } from "./l1.mjs";
import { allScenarios } from "./scenarios/index.mjs";
import { runScenario } from "./scenario-format.mjs";

function arg(name) {
	const index = process.argv.indexOf(name);
	return index === -1 ? null : process.argv[index + 1];
}

const scenarioFilter = arg("--scenario");
const wantL1 = !scenarioFilter || scenarioFilter === "l1";
const wantL2 = !scenarioFilter || scenarioFilter !== "l1";
const l2NameFilter = scenarioFilter && scenarioFilter !== "l1" ? scenarioFilter : null;

/** Run the positive L2 scenarios in one fresh sandbox; return their normalized manifests. */
async function runL2Positive() {
	const sandbox = await createSandbox();
	const out = [];
	try {
		await stagePackage(sandbox);
		await installPackage(sandbox);
		for (const scenario of allScenarios(sandbox)) {
			if (l2NameFilter && !scenario.name.includes(l2NameFilter)) continue;
			const { manifest } = await runScenario(sandbox, scenario);
			out.push({ name: scenario.name, ok: true, manifest });
		}
		await teardownScan(sandbox);
	} catch (error) {
		out.push({ name: "L2", ok: false, detail: error instanceof Error ? error.message : String(error) });
	} finally {
		await disposeSandbox(sandbox);
	}
	return out;
}

/** One full positive run (L1 + L2), returning an aggregated manifest object. */
async function fullRun() {
	const l1 = wantL1 ? await runL1() : [];
	const l2 = wantL2 ? await runL2Positive() : [];
	return {
		l1: l1.map((r) => ({ name: r.name, ok: r.ok })),
		scenarios: l2.filter((r) => r.manifest).map((r) => r.manifest),
		_raw: { l1, l2 },
	};
}

/** Run every scenario under one negative-control mode; each must lock/fail to proceed. */
async function runNegativeControl(mode) {
	const sandbox = await createSandbox();
	const results = [];
	try {
		await stagePackage(sandbox);
		await installPackage(sandbox);
		if (mode === "skill-removed") await removeInstalledSkill(sandbox);
		for (const scenario of allScenarios(sandbox)) {
			if (l2NameFilter && !scenario.name.includes(l2NameFilter)) continue;
			const twin = { ...scenario, assert: () => {} };
			if (mode === "mutated-sentinel") twin.sentinel = `MUTATED_${scenario.name}_NEVER_MATCHES`;
			try {
				const { record } = await runScenario(sandbox, twin);
				results.push({ name: scenario.name, ok: record.locked, detail: record.locked ? "" : "emitted steps (not locked)" });
			} catch (error) {
				results.push({ name: scenario.name, ok: true, detail: `threw: ${error instanceof Error ? error.message : String(error)}` });
			}
		}
	} finally {
		await disposeSandbox(sandbox);
	}
	return results;
}

function report(label, results) {
	let failed = 0;
	for (const result of results) {
		process.stdout.write(`[${label}] ${result.ok ? "ok  " : "FAIL"} ${result.name}${result.ok ? "" : `\n     ${result.detail}`}\n`);
		if (!result.ok) failed += 1;
	}
	return failed;
}

async function main() {
	const determinism = process.argv.includes("--determinism");
	const manifestOut = arg("--manifest");
	let failed = 0;

	const first = await fullRun();
	failed += report("L1", first._raw.l1);
	failed += report("L2", first._raw.l2);

	if (wantL2) {
		failed += report("NC:mutated-sentinel", await runNegativeControl("mutated-sentinel"));
		failed += report("NC:skill-removed", await runNegativeControl("skill-removed"));
	}

	const firstSerialized = serializeManifest({ l1: first.l1, scenarios: first.scenarios });
	if (manifestOut) await writeFile(manifestOut, firstSerialized);

	if (determinism) {
		const second = await fullRun();
		failed += report("L1(run2)", second._raw.l1);
		failed += report("L2(run2)", second._raw.l2);
		const secondSerialized = serializeManifest({ l1: second.l1, scenarios: second.scenarios });
		if (firstSerialized === secondSerialized) {
			process.stdout.write("\n[determinism] ok   two fresh-sandbox runs produced byte-identical manifests\n");
		} else {
			process.stdout.write("\n[determinism] FAIL manifests differ between runs\n");
			failed += 1;
		}
	}

	if (failed > 0) {
		process.stdout.write(`\n${failed} e2e check(s) failed\n`);
		process.exitCode = 1;
	} else {
		process.stdout.write("\nall e2e checks passed\n");
	}
}

if (process.argv[1]?.endsWith("run.mjs")) await main();
