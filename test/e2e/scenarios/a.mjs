// Scenario A — unadopted repo: the announce string is absent and setup/advisory
// is offered. The agent runs the installed sdlc-status, sees not-adopted, and
// declines to announce or enter any phase.

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
			// Honour the not-adopted state: do NOT announce; offer setup/advisory.
			{ content: "This repository has not adopted the sdlc. You can run /setup-sdlc to opt in, or use advisory mode for this session only." },
		],
		assert: ({ record }) => {
			assertText(record.transcript, { mustNotMatch: [DEFAULT_ANNOUNCE], mustMatch: [/setup-sdlc/, /advisory/], label: "A transcript" });
			assertText(statusResult(record), { mustMatch: [/not-adopted/], label: "A sdlc-status result" });
		},
	};
}
