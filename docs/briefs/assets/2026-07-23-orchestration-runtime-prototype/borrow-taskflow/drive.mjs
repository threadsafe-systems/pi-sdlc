#!/usr/bin/env node
// drive.mjs — SPIKE (#162): drive taskflow-core as the BORROW candidate for the
// same real phase Spike B ran (PR-review panel, cheap roster, real diff).
//
// Two modes:
//   node drive.mjs headless   — RuntimeDeps WITHOUT requestApproval (their
//                               detached/CI semantics): approval auto-rejects.
//                               Then attempt forkRunForResume on the result.
//   node drive.mjs park       — our OWN requestApproval that parks on a decision
//                               file (decision.json) — the wrap the evidence
//                               comment said we'd need. Approve to complete.
//
// Structural constraints found while writing this (recorded in the brief):
//   * map has NO per-item agent/model — per-child models need parallel branches
//     with per-branch `agent`, which are static in the def. So the HOST must
//     resolve the roster and synthesize the def per run (roster dynamism lives
//     outside the flow — Sketch A's script→map shape only works single-model).
//   * No substitution primitive: `retry` re-runs the SAME branch agent/model.

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { executeTaskflow, newRunId, forkRunForResume, DEFAULT_PI_CHILD_SETTINGS } from "taskflow-core";
import { createPiSubagentRunner } from "pi-taskflow/dist/runner.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const BUILD = join(HERE, "..", "build-runner");
const SDLC_SCRIPTS = "/home/neil/code/threadsafe/pi-sdlc/skills/sdlc/scripts";
const mode = process.argv[2] ?? "headless";

// -- host-side roster resolution (forced host-side; see header note) --
const roster = execFileSync("node", [join(SDLC_SCRIPTS, "resolve-panel.mjs"), "pr_review", "--author", "anthropic/claude-fable-5", "--track", "irreversible", "--config", join(BUILD, "spike-config")], { encoding: "utf8" })
	.trim()
	.split("\n")
	.filter(Boolean);
console.log("roster (host-resolved):", roster.join(", "));

const diff = readFileSync(join(BUILD, "subject.diff"), "utf8");
const reviewTask = ["Review ONLY the diff below (a panel-roster config change).", 'Output ONLY a JSON object, no prose, no fences: {"verdict":"PASS"|"BLOCK","findings":[{"severity":"high"|"medium"|"low","title":"…"}]}', "", "```diff", diff, "```"].join("\n");

const agents = roster.map((model, i) => ({
	name: `reviewer-${i}`,
	description: `panel reviewer (${model})`,
	model,
	systemPrompt: "You are one reviewer on an adversarial PR-review panel for the pi-sdlc repo. Follow the task's output contract exactly.",
	source: "user",
	filePath: join(HERE, `synthetic-agent-${i}.md`),
}));

const def = {
	name: "pr-review-panel-spike",
	description: "borrow-candidate spike for #162",
	concurrency: 4,
	phases: [
		{ id: "panel", type: "parallel", branches: roster.map((m, i) => ({ task: reviewTask, agent: `reviewer-${i}` })), retry: { max: 1, backoffMs: 0 } },
		{ id: "ratify", type: "approval", task: "Ratify PR-review panel result:\n{steps.panel.output}", dependsOn: ["panel"], final: true },
	],
};

const state = { runId: newRunId(def.name), flowName: def.name, def, args: {}, status: "running", phases: {}, createdAt: Date.now(), updatedAt: Date.now(), cwd: HERE };

const parkApproval = async (req) => {
	writeFileSync(join(HERE, "ratification-request.md"), `# Ratification request (taskflow park)\n\n${req.message}\n\nWrite decision.json: {"decision":"approve"|"reject","note":"…"}\n`);
	console.log("PARKED: awaiting decision.json …");
	const decisionPath = join(HERE, "decision.json");
	for (;;) {
		if (existsSync(decisionPath)) {
			const d = JSON.parse(readFileSync(decisionPath, "utf8"));
			unlinkSync(decisionPath);
			console.log("decision received:", d.decision);
			return d;
		}
		await new Promise((r) => setTimeout(r, 1000));
	}
};

const deps = {
	cwd: HERE,
	agents,
	usageAccounting: "available",
	runTask: createPiSubagentRunner(DEFAULT_PI_CHILD_SETTINGS).runTask,
	persist: (s) => writeFileSync(join(HERE, `run-${mode}.json`), JSON.stringify(s, null, 1)),
	...(mode === "park" ? { requestApproval: parkApproval } : {}),
};

const t0 = Date.now();
const result = await executeTaskflow(state, deps);
writeFileSync(join(HERE, `run-${mode}.json`), JSON.stringify(result.state, null, 1));
console.log(`\nstatus=${result.state.status} ok=${result.ok} wall=${Date.now() - t0}ms`);
for (const [id, p] of Object.entries(result.state.phases)) {
	console.log(` phase ${id}: status=${p.status} gate=${JSON.stringify(p.gate ?? null)} approval=${JSON.stringify(p.approval ?? null)} cost=$${(p.usage?.cost ?? 0).toFixed(4)}`);
}

if (mode === "headless") {
	// their detached semantics ended the run; can it be resumed with a human decision?
	const fork = (() => {
		try {
			return forkRunForResume(result.state, {});
		} catch (e) {
			return { ok: false, errors: [String(e?.message ?? e)] };
		}
	})();
	console.log("\nforkRunForResume on the auto-rejected run:", JSON.stringify(fork.ok ? { ok: true } : fork, null, 1));
}
