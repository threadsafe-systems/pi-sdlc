// Scenario G — the configured implement hook's exact announce contract. With a
// `use:tool:bash` implement:before hook, the mandated lines are emitted around
// the hook: the exact `[sdlc hook] implement:before use=<use> do=<first 80>`
// before the hook tool call, then `result: ok` after, ordered before the first
// write. Negative twin: no hook configured ⇒ no `[sdlc hook]` lines at all.

import { assertOrdered, assertText } from "../harness.mjs";
import { adopt, consumerPath } from "./common.mjs";

const USE_LINE = "[sdlc hook] implement:before use=tool:bash do=create the working file";
const RESULT_LINE = "[sdlc hook] implement:before result: ok";

export function build(sandbox) {
	const hookConsumer = consumerPath(sandbox, "scenario-g-hook");
	const noHookConsumer = consumerPath(sandbox, "scenario-g-nohook");
	return [
		{
			name: "G-hook-contract",
			tools: "read,bash,write",
			prompt: "Use the sdlc skill and enter the implement phase, firing configured before hooks.",
			setup: async () => {
				await adopt(sandbox, "scenario-g-hook", { setupArgs: ["--preset", "full", "--seed-panels", "--hook-use", "implement:before:tool:bash:create the working file"] });
				return { consumer: hookConsumer };
			},
			steps: [
				// Announce-on-fire + the hook's tool call, then the result line, then the first write.
				{ content: USE_LINE, toolCalls: [{ name: "bash", arguments: { command: "echo hook-fired" } }] },
				{ content: RESULT_LINE, toolCalls: [{ name: "write", arguments: { path: `${hookConsumer}/implement-output.txt`, content: "work" } }] },
			],
			assert: ({ record }) => {
				assertText(record.transcript, { mustMatch: [USE_LINE.replace(/[[\]]/g, "\\$&"), RESULT_LINE.replace(/[[\]]/g, "\\$&")], label: "G hook markers" });
				assertOrdered(record.transcript, [USE_LINE.replace(/[[\]]/g, "\\$&"), RESULT_LINE.replace(/[[\]]/g, "\\$&")], "G marker order");
				// Tool calls in source order: the hook's bash call precedes the first write.
				const names = record.toolCalls.map((c) => c.name);
				if (names.indexOf("bash") === -1 || names.indexOf("write") === -1 || names.indexOf("bash") > names.indexOf("write")) {
					throw new Error(`G tool-call order wrong: ${names.join(",")}`);
				}
			},
		},
		{
			name: "G-no-hook-negative-twin",
			tools: "read,bash,write",
			prompt: "Use the sdlc skill and enter the implement phase.",
			setup: async () => {
				await adopt(sandbox, "scenario-g-nohook", { setupArgs: ["--preset", "full", "--seed-panels"] });
				return { consumer: noHookConsumer };
			},
			steps: [{ content: "Entering implement; no before hooks are configured.", toolCalls: [{ name: "write", arguments: { path: `${noHookConsumer}/implement-output.txt`, content: "work" } }] }],
			assert: ({ record }) => {
				if (record.markers.length !== 0) throw new Error(`G-no-hook emitted [sdlc hook] lines: ${record.markers.join(" | ")}`);
			},
		},
	];
}
