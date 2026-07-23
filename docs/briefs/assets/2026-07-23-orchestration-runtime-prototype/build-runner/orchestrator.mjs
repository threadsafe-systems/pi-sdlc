#!/usr/bin/env node
// orchestrator.mjs — SPIKE (#162): thin headless orchestrator for one real sdlc
// phase (PR-review panel), built directly on the substrate both external
// candidates also use: spawned `pi --mode json -p` children.
//
// Demonstrates, against ticket #162's requirement list:
//   R1 non-blocking per-child supervision (react to each reviewer individually)
//   R2 per-child model selection (roster from resolve-panel.mjs, a script seam)
//   R3 monitored workers (per-child live event fold: cost, duration, state)
//   R4 infra-failure-vs-verdict distinction with retry-once
//   R5 durable, resumable runs (state.json + events.jsonl; idempotent stages)
//   R6 headless operation (plain node process; no pi session, no TUI)
//   R7 headless HITL: gate PARKS (never auto-decides); resume with --decision
//   R8 handoff/telemetry contract: emits ceremony.recommended/ceremony.ratified
//      pair (#160) + per-reviewer harvest events into the run's events.jsonl
//
// Usage:
//   node orchestrator.mjs <runDir> init            # create run, resolve roster
//   node orchestrator.mjs <runDir> advance         # run/resume until parked or done
//   node orchestrator.mjs <runDir> advance --decision approve|reject [--note "…"]
//   node orchestrator.mjs <runDir> status
//
// Env: SPIKE_INFRA_FAIL_FIRST=<model-substring> sabotages that reviewer's FIRST
// attempt with an invalid model id, to exercise R4 with a real infra failure.

import { execFile, spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const SDLC_SCRIPTS = "/home/neil/code/threadsafe/pi-sdlc/skills/sdlc/scripts";
const SPIKE_CONFIG = join(HERE, "spike-config");
const SUBJECT = join(HERE, "subject.diff");
const MAX_ATTEMPTS = 2; // retry-once rule
const CHILD_TIMEOUT_MS = 240_000;

const [, , runDir, cmd = "status", ...rest] = process.argv;
if (!runDir) {
  console.error("usage: orchestrator.mjs <runDir> init|advance|status [--decision approve|reject] [--note s]");
  process.exit(2);
}
const arg = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};

const statePath = join(runDir, "state.json");
const eventsPath = join(runDir, "events.jsonl");
const loadState = () => JSON.parse(readFileSync(statePath, "utf8"));
const saveState = (s) => {
  // atomic-enough for the spike: write temp then rename would be prod shape
  writeFileSync(statePath, JSON.stringify(s, null, 1));
};
const emit = (type, payload) => {
  appendFileSync(eventsPath, JSON.stringify({ ts: new Date().toISOString(), type, payload }) + "\n");
};
const ulid = () => randomBytes(8).toString("hex");

// ---------- init: resolve roster via the existing script seam (R2) ----------
if (cmd === "init") {
  mkdirSync(join(runDir, "reviewers"), { recursive: true });
  const out = await new Promise((res, rej) =>
    execFile(
      "node",
      [join(SDLC_SCRIPTS, "resolve-panel.mjs"), "pr_review", "--author", "anthropic/claude-fable-5", "--track", "irreversible", "--config", SPIKE_CONFIG],
      (err, stdout, stderr) => (err ? rej(new Error(stderr || err.message)) : res(stdout)),
    ),
  );
  const roster = out.trim().split("\n").filter(Boolean);
  const cfg = JSON.parse(readFileSync(join(SPIKE_CONFIG, ".pi/sdlc/sdlc.config.json"), "utf8"));
  const pool = cfg.panels.phases.pr_review.prefer.filter((m) => !roster.includes(m));
  const state = {
    state: "reviewing",
    handoffId: ulid(),
    subject: "subject.diff (pi-sdlc 7621fe8 config hunk)",
    floor: 2,
    pool, // remaining preferences, drawn on per-child terminal infra failure
    roster: roster.map((model) => ({ model, status: "pending", attempts: [], verdict: null })),
    ratification: null,
  };
  saveState(state);
  emit("run.started", { runDir, subject: state.subject });
  emit("panel.resolved", { phase: "pr_review", roster, floor: state.floor });
  console.log(`initialised: roster=${roster.join(", ")}`);
  process.exit(0);
}

if (cmd === "status") {
  const s = loadState();
  console.log(JSON.stringify({ state: s.state, reviewers: s.roster.map((r) => ({ model: r.model, status: r.status, attempts: r.attempts.length, verdict: r.verdict?.verdict ?? null })) }, null, 1));
  process.exit(0);
}

// ---------- advance: run/resume until parked or terminal (R5, R6) ----------
const state = loadState();

// -- parked? apply a human decision if provided, else stay parked (R7) --
if (state.state === "awaiting-ratification") {
  const decision = arg("decision");
  if (!decision) {
    console.log("state=awaiting-ratification (parked; supply --decision approve|reject)");
    process.exit(0);
  }
  state.ratification = { decision, note: arg("note") ?? null, ratifier: "neilwashere", at: new Date().toISOString() };
  emit("ceremony.ratified", { handoffId: state.handoffId, ...state.ratification, amendments: [] });
  state.state = decision === "approve" ? "done" : "blocked";
  saveState(state);
  emit("run.completed", { state: state.state });
  console.log(`state=${state.state}`);
  process.exit(0);
}

if (state.state !== "reviewing") {
  console.log(`state=${state.state} (terminal)`);
  process.exit(0);
}

// ---------- reviewer children (R1, R3, R4) ----------
const diff = readFileSync(SUBJECT, "utf8");
const task = [
  "You are one reviewer on an adversarial PR-review panel for the pi-sdlc repo.",
  "Review ONLY the diff below (a panel-roster config change).",
  'Output ONLY a JSON object, no prose, no code fences: {"verdict":"PASS"|"BLOCK","findings":[{"severity":"high"|"medium"|"low","title":"…","detail":"…"}]}',
  "BLOCK only for high/medium findings.",
  "",
  "```diff",
  diff,
  "```",
].join("\n");

function classify(events, code) {
  // R4: verdict = an agent_end with parseable JSON verdict; anything else = infra.
  // pi exits 0 even on provider errors — the error signal is stopReason:"error"
  // + errorMessage INSIDE the assistant message (learned live in this spike).
  const end = events.findLast((e) => e.type === "agent_end");
  if (code !== 0 || !end) return { kind: "infra", reason: `exit=${code}, agent_end=${!!end}` };
  const msg = end.messages?.findLast((m) => m.role === "assistant");
  if (msg?.stopReason === "error") return { kind: "infra", reason: `provider error: ${(msg.errorMessage ?? "").slice(0, 200)}` };
  const text = (msg?.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  try {
    const m = text.match(/\{[\s\S]*\}/);
    const verdict = JSON.parse(m[0]);
    if (verdict.verdict !== "PASS" && verdict.verdict !== "BLOCK") throw new Error("bad verdict enum");
    const usage = msg?.usage ?? {};
    return { kind: "verdict", verdict, costUSD: usage.cost?.total ?? null };
  } catch (e) {
    return { kind: "infra", reason: `unparseable verdict: ${e.message}` };
  }
}

function runReviewer(r) {
  const attemptNo = r.attempts.length + 1;
  let model = r.model;
  const sabotage = process.env.SPIKE_INFRA_FAIL_FIRST;
  if (sabotage && model.includes(sabotage) && attemptNo === 1) model = "deepseek/no-such-model-xyz";
  const started = Date.now();
  emit("reviewer.started", { model: r.model, attempt: attemptNo, effectiveModel: model });
  return new Promise((resolve) => {
    const child = spawn("pi", ["--mode", "json", "--no-session", "--no-extensions", "--no-skills", "-p", "--model", model, task], {
      cwd: HERE,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: CHILD_TIMEOUT_MS,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d)); // R3: live fold point (kept minimal)
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      const events = out.split("\n").filter(Boolean).flatMap((l) => {
        try { return [JSON.parse(l)]; } catch { return []; }
      });
      const c = classify(events, code);
      const attempt = { attempt: attemptNo, effectiveModel: model, ms: Date.now() - started, kind: c.kind, reason: c.reason ?? null, costUSD: c.costUSD ?? null, stderrTail: c.kind === "infra" ? err.slice(-300) : undefined };
      r.attempts.push(attempt);
      // R1: per-child reaction happens HERE, the moment THIS child settles —
      // classify, emit harvest telemetry, schedule retry — never waiting for siblings.
      if (c.kind === "verdict") {
        r.status = "completed";
        r.verdict = c.verdict;
        emit("reviewer.completed", { model: r.model, attempt: attemptNo, ms: attempt.ms, costUSD: attempt.costUSD, verdict: c.verdict.verdict, findings: c.verdict.findings.length });
        saveState(state);
        resolve();
      } else if (attemptNo < MAX_ATTEMPTS) {
        emit("reviewer.infra_failure", { model: r.model, attempt: attemptNo, reason: c.reason, retrying: true });
        saveState(state);
        resolve(runReviewer(r)); // retry-once, immediately, independent of siblings
      } else {
        r.status = "failed";
        emit("reviewer.infra_failure", { model: r.model, attempt: attemptNo, reason: c.reason, retrying: false });
        saveState(state);
        resolve();
      }
    });
  });
}

// R5: resume — only pending/failed-below-cap reviewers run; completed are kept.
// R1: on a reviewer's TERMINAL infra failure, react per-child by substituting
// the next unused pool preference (roster resolution cannot see runtime quota
// state — substitution is a runtime supervision decision).
async function superviseReviewer(r) {
  await runReviewer(r);
  if (r.status === "failed" && state.pool.length > 0) {
    const model = state.pool.shift();
    const sub = { model, status: "running", attempts: [], verdict: null, substituteFor: r.model };
    state.roster.push(sub);
    emit("reviewer.substituted", { failed: r.model, substitute: model });
    saveState(state);
    await superviseReviewer(sub);
  }
}
const runnable = state.roster.filter((r) => r.status !== "completed" && r.attempts.length < MAX_ATTEMPTS);
for (const r of runnable) r.status = "running";
saveState(state);
await Promise.all(runnable.map(superviseReviewer)); // spawned concurrently; each settles independently

// ---------- consolidate + gate → park (R7, R8) ----------
const completed = state.roster.filter((r) => r.status === "completed");
if (completed.length < state.floor) {
  state.state = "failed-shortfall";
  saveState(state);
  emit("run.completed", { state: state.state, completed: completed.length, floor: state.floor });
  console.log(`state=failed-shortfall (${completed.length}/${state.floor})`);
  process.exit(1);
}
const findings = completed.flatMap((r) => (r.verdict.findings ?? []).map((f) => ({ reviewer: r.model, ...f })));
const surviving = findings.filter((f) => f.severity === "high" || f.severity === "medium");
emit("panel.consolidated", { reviewers: completed.length, verdicts: completed.map((r) => r.verdict.verdict), findings: findings.length, survivingHighMedium: surviving.length });

const totalCost = state.roster.flatMap((r) => r.attempts).reduce((a, x) => a + (x.costUSD ?? 0), 0);
const rec = {
  handoffId: state.handoffId,
  phase: "pr_review",
  recommendation: { nextProducerClass: "strong", panel: { size: 2, class: "fast" } },
  evidence: [
    `panel ${completed.length}/${state.roster.length} completed, verdicts: ${completed.map((r) => r.verdict.verdict).join("/")}`,
    `${surviving.length} surviving high/medium finding(s) of ${findings.length} total`,
    `panel cost $${totalCost.toFixed(4)}, wall ${Math.max(...state.roster.flatMap((r) => r.attempts.map((a) => a.ms)))}ms`,
  ],
  deviations: [],
};
emit("ceremony.recommended", rec);
writeFileSync(
  join(runDir, "ratification-request.md"),
  [`# Ratification request (${state.handoffId})`, "", ...rec.evidence.map((e) => `- ${e}`), "", "## Surviving findings", ...(surviving.length ? surviving.map((f) => `- [${f.severity}] ${f.title} (${f.reviewer})`) : ["(none)"]), "", "Reply: advance --decision approve|reject [--note …]"].join("\n"),
);
state.state = "awaiting-ratification"; // R7: PARK — never auto-decide
saveState(state);
console.log("state=awaiting-ratification (parked; see ratification-request.md)");
process.exit(0);
