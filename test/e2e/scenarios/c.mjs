// Scenario C — a committed schemaVersion 2 config: the readiness gate reports
// not-ready, its remedy names re-run/pin (never "migration"), the agent does not
// announce, and it refuses to enter any phase (no phase artifacts written).

import { assertText } from "../harness.mjs";
import { adopt, consumerPath, DEFAULT_ANNOUNCE, installedCmd, statusResult } from "./common.mjs";

export function build(sandbox) {
	const consumer = consumerPath(sandbox, "scenario-c");
	const statusCmd = installedCmd(sandbox, "sdlc-status.mjs", ["--format", "json"]);
	return {
		name: "C-v2-not-ready",
		tools: "read,bash,write",
		prompt: "Use the sdlc skill; run the readiness gate and proceed only if ready.",
		setup: async () => {
			await adopt(sandbox, "scenario-c", { rawConfig: { schemaVersion: 2, prefix: "demo", labelPrefix: "demo" } });
			return { consumer };
		},
		steps: [{ content: "Running the readiness gate.", toolCalls: [{ name: "bash", arguments: { command: statusCmd } }] }, { content: "The repo is adopted but not-ready (older schema). Remedy: re-run setup-sdlc for a fresh v3 config, or pin the prior release. Not entering any phase." }],
		assert: ({ record }) => {
			assertText(statusResult(record), { mustMatch: [/not-ready/], mustNotMatch: [/migrat/i], label: "C sdlc-status result" });
			assertText(record.transcript, { mustNotMatch: [DEFAULT_ANNOUNCE, /migrat/i], label: "C transcript" });
			// No phase artifacts written (only the committed v2 config exists).
			const phaseArtifacts = Object.keys(record.files).filter((path) => path.startsWith("docs/plans/") || path.startsWith("docs/specs/"));
			if (phaseArtifacts.length > 0) throw new Error(`C wrote phase artifacts despite not-ready: ${phaseArtifacts.join(", ")}`);
		},
	};
}
