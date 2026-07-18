#!/usr/bin/env node

// L2 scenario aggregator + runner (T4). Exposes every scenario spec and a
// runnable entry that runs them positively and applies the shared negative
// control (mutated sentinel + skill removed) to each, asserting every scenario
// fails under both modes. T5's top-level runner reuses allScenarios/runPositive
// for the determinism gate.

import { createSandbox, disposeSandbox, installPackage, removeInstalledSkill, stagePackage } from "../harness.mjs";
import { runScenario } from "../scenario-format.mjs";
import { build as buildA } from "./a.mjs";
import { build as buildB } from "./b.mjs";
import { build as buildC } from "./c.mjs";
import { build as buildD } from "./d.mjs";
import { build as buildE } from "./e.mjs";
import { build as buildG } from "./g.mjs";

/** Every scenario spec (positive form), flattened, in a stable order. */
export function allScenarios(sandbox) {
	return [buildA(sandbox), ...buildB(sandbox), buildC(sandbox), ...buildD(sandbox), ...buildE(sandbox), ...buildG(sandbox)];
}

/** Run every scenario positively; returns { name, ok, detail, manifest }[]. */
export async function runPositive(sandbox) {
	const results = [];
	for (const scenario of allScenarios(sandbox)) {
		try {
			const { manifest } = await runScenario(sandbox, scenario);
			results.push({ name: scenario.name, ok: true, manifest });
		} catch (error) {
			results.push({ name: scenario.name, ok: false, detail: error instanceof Error ? error.message : String(error) });
		}
	}
	return results;
}

/**
 * Run every scenario under one negative-control mode (assertions replaced with a
 * lock assertion). `mode` is "mutated-sentinel" or "skill-removed".
 */
async function runNegativeMode(sandbox, mode) {
	const results = [];
	for (const scenario of allScenarios(sandbox)) {
		const twin = { ...scenario, assert: () => {} };
		if (mode === "mutated-sentinel") twin.sentinel = `MUTATED_${scenario.name}_NEVER_MATCHES`;
		try {
			const { record } = await runScenario(sandbox, twin);
			results.push({ name: scenario.name, ok: record.locked, detail: record.locked ? "" : "emitted steps (not locked)" });
		} catch (error) {
			// A setup/exec failure with the skill removed also counts as a failure to proceed.
			results.push({ name: scenario.name, ok: true, detail: `threw: ${error instanceof Error ? error.message : String(error)}` });
		}
	}
	return results;
}

async function main() {
	const filter = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
	let failed = 0;

	// Positive pass.
	const positiveSandbox = await createSandbox();
	let positive;
	try {
		await stagePackage(positiveSandbox);
		await installPackage(positiveSandbox);
		positive = await runPositive(positiveSandbox);
	} finally {
		await disposeSandbox(positiveSandbox);
	}
	for (const result of positive) {
		if (filter && !result.name.includes(filter)) continue;
		process.stdout.write(`[L2] ${result.ok ? "ok  " : "FAIL"} ${result.name}${result.ok ? "" : `\n     ${result.detail}`}\n`);
		if (!result.ok) failed += 1;
	}

	// Negative control: mutated sentinel (skill present) — every scenario must lock.
	const ncMutatedSandbox = await createSandbox();
	let ncMutated;
	try {
		await stagePackage(ncMutatedSandbox);
		await installPackage(ncMutatedSandbox);
		ncMutated = await runNegativeMode(ncMutatedSandbox, "mutated-sentinel");
	} finally {
		await disposeSandbox(ncMutatedSandbox);
	}

	// Negative control: skill removed — every scenario must lock/fail to proceed.
	const ncRemovedSandbox = await createSandbox();
	let ncRemoved;
	try {
		await stagePackage(ncRemovedSandbox);
		await installPackage(ncRemovedSandbox);
		await removeInstalledSkill(ncRemovedSandbox);
		ncRemoved = await runNegativeMode(ncRemovedSandbox, "skill-removed");
	} finally {
		await disposeSandbox(ncRemovedSandbox);
	}

	for (const [mode, results] of [
		["mutated-sentinel", ncMutated],
		["skill-removed", ncRemoved],
	]) {
		for (const result of results) {
			if (filter && !result.name.includes(filter)) continue;
			process.stdout.write(`[NC:${mode}] ${result.ok ? "ok  " : "FAIL"} ${result.name}${result.ok ? "" : `\n     ${result.detail}`}\n`);
			if (!result.ok) failed += 1;
		}
	}

	if (failed > 0) {
		process.stdout.write(`\n${failed} scenario check(s) failed\n`);
		process.exitCode = 1;
	} else {
		process.stdout.write("\nall L2 scenarios + negative control passed\n");
	}
}

if (process.argv[1]?.endsWith("index.mjs")) await main();
