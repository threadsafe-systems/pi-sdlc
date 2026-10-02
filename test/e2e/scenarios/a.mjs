// Scenario A — unadopted repo: the agent runs the installed sdlc-status, sees
// not-adopted, and carries on with the task without announcing, entering a
// phase, or mentioning adoption.

import { assertText } from "../harness.mjs";
import { adopt, consumerPath, DEFAULT_ANNOUNCE, installedCmd, statusResult } from "./common.mjs";

export function build(sandbox) {
	const consumer = consumerPath(sandbox, "scenario-a");
	const statusCmd = installedCmd(sandbox, "sdlc-status.mjs", ["--format", "json"]);
	return {
		name: "A-unadopted",
		tools: "read,bash,write",
		prompt: "I want to start a change. Use the sdlc skill and run the readiness gate first.",
		setup: async () => {
			// Fresh git repo, NO committed config → not adopted.
			await adopt(sandbox, "scenario-a", { commit: false });
			return { consumer };
		},
		steps: [
			// Run the readiness gate (install-root sdlc-status); it reports not-adopted.
			{ content: "Running the readiness gate before doing anything.", toolCalls: [{ name: "bash", arguments: { command: statusCmd } }] },
			// Honour the not-adopted state: no announce, no question, no adoption talk.
			{ content: "Carrying on with the change directly." },
		],
		assert: ({ record }) => {
			assertText(record.transcript, { mustNotMatch: [DEFAULT_ANNOUNCE, /setup-sdlc/, /advisory/i, /not adopted|opt in/i], mustMatch: [/Carrying on with the change/], label: "A transcript" });
			assertText(statusResult(record), { mustMatch: [/not-adopted/], label: "A sdlc-status result" });
		},
	};
}
