#!/usr/bin/env node

// Puppet model server (T3): a local OpenAI-compatible SSE endpoint that stands
// in for a real model. It is a *scripted* server — it emits only the canned
// turns a scenario declares — and it enforces anti-vacuity: it refuses to unlock
// any scripted step until it has observed the installed SKILL.md sentinel in the
// incoming request stream. With the skill absent (or the sentinel mutated) the
// server stays locked and every scenario fails, so L2 can never pass while
// discovery or skill loading is broken.
//
// Launched as a child process by the harness. Configuration via env:
//   PUPPET_PORT       - listen port on 127.0.0.1
//   PUPPET_SCRIPT     - path to the scenario script JSON { sentinel, steps: [...] }
//   PUPPET_REQUESTS   - append incoming request bodies (JSON lines)
//   PUPPET_EMISSIONS  - append what the server emitted per turn (JSON lines)
//   PUPPET_READY      - a file written once the server is listening

import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.env.PUPPET_PORT ?? "0");
const script = JSON.parse(readFileSync(process.env.PUPPET_SCRIPT, "utf8"));
const requestsFile = process.env.PUPPET_REQUESTS;
const emissionsFile = process.env.PUPPET_EMISSIONS;
const readyFile = process.env.PUPPET_READY;
// The install-root SKILL.md location pi advertises in <available_skills>. The
// loader step will not fire until this appears in the request stream, so a
// scenario cannot advance unless pi actually discovered and surfaced the
// installed skill from the install root (not the checkout).
const skillLocation = process.env.PUPPET_SKILL_LOCATION ?? "";

const sentinel = script.sentinel ?? "";
const steps = script.steps ?? [];
let stepIndex = 0;
let sentinelObserved = false;
let locationObserved = false;

function chunk(delta, finishReason = null) {
	return `data: ${JSON.stringify({ id: "puppet", object: "chat.completion.chunk", created: 0, model: script.model ?? "puppet-model", choices: [{ index: 0, delta, finish_reason: finishReason }] })}\n\n`;
}

/** Emit a plain assistant text turn then stop. */
function emitText(response, content) {
	response.write(chunk({ role: "assistant", content }));
	response.write(chunk({}, "stop"));
}

/** Emit assistant tool_calls then a tool_calls finish (pi executes them and re-requests). */
function emitToolCalls(response, toolCalls) {
	response.write(chunk({ role: "assistant", tool_calls: toolCalls.map((call, index) => ({ index, id: `puppet-call-${stepIndex}-${index}`, type: "function", function: { name: call.name, arguments: "" } })) }));
	toolCalls.forEach((call, index) => {
		response.write(chunk({ tool_calls: [{ index, function: { arguments: JSON.stringify(call.arguments ?? {}) } }] }));
	});
	response.write(chunk({}, "tool_calls"));
}

function record(file, payload) {
	if (file) appendFileSync(file, `${JSON.stringify(payload)}\n`);
}

const server = createServer((request, response) => {
	let body = "";
	request.on("data", (part) => {
		body += part;
	});
	request.on("end", () => {
		let parsed;
		try {
			parsed = JSON.parse(body);
		} catch {
			parsed = { messages: [] };
		}
		record(requestsFile, parsed);
		const haystack = JSON.stringify(parsed.messages ?? parsed);
		if (sentinel && haystack.includes(sentinel)) sentinelObserved = true;
		if (skillLocation && haystack.includes(skillLocation)) locationObserved = true;

		response.writeHead(200, { "content-type": "text/event-stream" });

		const step = steps[stepIndex];
		if (!step) {
			record(emissionsFile, { turn: "exhausted" });
			emitText(response, "PUPPET_DONE");
			response.end("data: [DONE]\n\n");
			return;
		}

		// Discovery gate (loader step): the installed skill's install-root location
		// must have been surfaced by pi before the loader reads it. Scenario gate
		// (every other step): the SKILL.md body sentinel must have been observed in
		// the loader's read result. Either miss stays locked, so with the skill
		// removed / not discovered / sentinel mutated, no scenario step ever emits.
		if (step.loader) {
			if (skillLocation && !locationObserved) {
				record(emissionsFile, { turn: "locked", reason: "skill location not observed (discovery)" });
				emitText(response, "PUPPET_LOCKED: installed skill not discovered in the request stream");
				response.end("data: [DONE]\n\n");
				return;
			}
		} else if (sentinel && !sentinelObserved) {
			record(emissionsFile, { turn: "locked", reason: "sentinel not observed" });
			emitText(response, "PUPPET_LOCKED: installed skill sentinel not observed in the request stream");
			response.end("data: [DONE]\n\n");
			return;
		}

		// Minimal trigger sanity check (decision 1): a miss fails the scenario loudly.
		if (step.trigger !== undefined && !new RegExp(step.trigger).test(haystack)) {
			record(emissionsFile, { turn: stepIndex, miss: step.trigger });
			emitText(response, `PUPPET_TRIGGER_MISS: step ${stepIndex} trigger ${step.trigger}`);
			response.end("data: [DONE]\n\n");
			return;
		}

		stepIndex += 1;
		if (step.toolCalls && step.toolCalls.length > 0) {
			record(emissionsFile, { turn: stepIndex - 1, loader: step.loader === true, content: step.content ?? "", toolCalls: step.toolCalls });
			if (step.content) response.write(chunk({ role: "assistant", content: step.content }));
			emitToolCalls(response, step.toolCalls);
		} else {
			record(emissionsFile, { turn: stepIndex - 1, loader: step.loader === true, content: step.content ?? "" });
			emitText(response, step.content ?? "");
		}
		response.end("data: [DONE]\n\n");
	});
});

server.on("error", (error) => {
	process.stderr.write(`puppet server error: ${error instanceof Error ? error.message : String(error)}\n`);
	process.exit(1);
});
server.listen(port, "127.0.0.1", () => {
	// Report the actually-bound port (port 0 = an OS-assigned free port, so
	// concurrent runs never collide on a fixed base).
	if (readyFile) writeFileSync(readyFile, `${server.address().port}\n`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
