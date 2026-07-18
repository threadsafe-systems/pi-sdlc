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
import { removeInstalledSkill, serializeManifest, teardownScan } from "./harness.mjs";
import { runL1 } from "./l1.mjs";
import { allScenarios } from "./scenarios/index.mjs";
import { runNegativeMode, runScenario, withInstalledSandbox } from "./scenario-format.mjs";

function arg(name) {
	const index = process.argv.indexOf(name);
	return index === -1 ? null : process.argv[index + 1];
}

const scenarioFilter = arg("--scenario");
const wantL1 = !scenarioFilter || scenarioFilter === "l1";
const wantL2 = !scenarioFilter || scenarioFilter !== "l1";
const l2NameFilter = scenarioFilter && scenarioFilter !== "l1" ? scenarioFilter : null;

function selected(sandbox) {
	return allScenarios(sandbox).filter((scenario) => !l2NameFilter || scenario.name.includes(l2NameFilter));
}

/** Run the positive L2 scenarios in one fresh sandbox; return their normalized manifests. */
async function runL2Positive() {
	return withInstalledSandbox(async (sandbox) => {
		const out = [];
		for (const scenario of selected(sandbox)) {
			try {
				const { manifest } = await runScenario(sandbox, scenario);
				out.push({ name: scenario.name, ok: true, manifest });
			} catch (error) {
				out.push({ name: scenario.name, ok: false, detail: error instanceof Error ? error.message : String(error) });
			}
		}
		await teardownScan(sandbox);
		return out;
	}).catch((error) => [{ name: "L2", ok: false, detail: error instanceof Error ? error.message : String(error) }]);
}

/**
 * Run every selected scenario under one negative-control mode in a fresh
 * sandbox; each must lock (strict). Teardown-scanned like the positive run.
 */
async function runNegativeControl(mode) {
	return withInstalledSandbox(async (sandbox) => {
		if (mode === "skill-removed") await removeInstalledSkill(sandbox);
		const results = [];
		for (const scenario of selected(sandbox)) {
			try {
				const { reason } = await runNegativeMode(sandbox, scenario, mode);
				results.push({ name: scenario.name, ok: true, reason });
			} catch (error) {
				results.push({ name: scenario.name, ok: false, detail: error instanceof Error ? error.message : String(error) });
			}
		}
		// The negative-control sandboxes are held to the same no-write guarantee.
		await teardownScan(sandbox);
		return results;
	}).catch((error) => [{ name: "NC", ok: false, detail: error instanceof Error ? error.message : String(error) }]);
}

/**
 * One full run: L1, positive L2, and both negative-control modes. Returns the
 * raw results (for reporting) and the aggregated, normalized manifest (for the
 * determinism byte-compare — includes NC lock statuses so anti-vacuity behaviour
 * is compared across runs too).
 */
async function fullRun() {
	const l1 = wantL1 ? await runL1() : [];
	const l2 = wantL2 ? await runL2Positive() : [];
	const ncMutated = wantL2 ? await runNegativeControl("mutated-sentinel") : [];
	const ncRemoved = wantL2 ? await runNegativeControl("skill-removed") : [];
	const manifest = {
		l1: l1.map((r) => ({ name: r.name, ok: r.ok })),
		scenarios: l2.filter((r) => r.manifest).map((r) => r.manifest),
		nc: {
			mutatedSentinel: ncMutated.map((r) => ({ name: r.name, ok: r.ok, reason: r.reason ?? null })),
			skillRemoved: ncRemoved.map((r) => ({ name: r.name, ok: r.ok, reason: r.reason ?? null })),
		},
	};
	return { manifest, raw: { l1, l2, ncMutated, ncRemoved } };
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
	failed += report("L1", first.raw.l1);
	failed += report("L2", first.raw.l2);

	if (scenarioFilter && first.raw.l1.length === 0 && first.raw.l2.length === 0) {
		process.stdout.write(`\n[filter] FAIL --scenario '${scenarioFilter}' matched no L1 or L2 checks\n`);
		process.exitCode = 1;
		return;
	}

	failed += report("NC:mutated-sentinel", first.raw.ncMutated);
	failed += report("NC:skill-removed", first.raw.ncRemoved);

	const firstSerialized = serializeManifest(first.manifest);
	if (manifestOut) await writeFile(manifestOut, firstSerialized);

	if (determinism) {
		const second = await fullRun();
		failed += report("L1(run2)", second.raw.l1);
		failed += report("L2(run2)", second.raw.l2);
		failed += report("NC:mutated-sentinel(run2)", second.raw.ncMutated);
		failed += report("NC:skill-removed(run2)", second.raw.ncRemoved);
		if (firstSerialized === serializeManifest(second.manifest)) {
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
