// Scenario E — shape.publishToTracker 2 vs "never", through the logging gh stub.
// When the threshold is met the tracker attempt is issued (and safely stubbed —
// no real mutation, argv logged); when it is "never" no attempt is issued. The
// gh stub records every invocation and always avoids a real network call.

import { assertText } from "../harness.mjs";
import { adopt, consumerPath, toolResults } from "./common.mjs";

export function build(sandbox) {
	const publishConsumer = consumerPath(sandbox, "scenario-e-publish");
	const neverConsumer = consumerPath(sandbox, "scenario-e-never");
	return [
		{
			name: "E-publish-threshold-met",
			tools: "read,bash,write",
			ghStub: true,
			prompt: "Use the sdlc skill; this build has 3 tasks. Publish the tracker-backed build.",
			setup: async () => {
				await adopt(sandbox, "scenario-e-publish", { setupArgs: ["--preset", "full", "--seed-panels", "--publish-to-tracker", "2"] });
				return { consumer: publishConsumer };
			},
			steps: [{ content: "publishToTracker is 2 and this build has 3 tasks: creating the epic.", toolCalls: [{ name: "bash", arguments: { command: "gh issue create --title 'Epic: demo' --label sdlc:epic" } }] }, { content: "Tracker epic attempt issued (stubbed)." }],
			assert: ({ record }) => {
				if (record.ghLog.length === 0) throw new Error("E-publish: expected a stubbed tracker attempt, gh log empty");
				assertText(JSON.stringify(record.ghLog), { mustMatch: [/issue.*create|create/], label: "E-publish gh attempt" });
			},
		},
		{
			name: "E-publish-never",
			tools: "read,bash,write",
			ghStub: true,
			prompt: "Use the sdlc skill; this build has 3 tasks. Follow the committed publishToTracker dial.",
			setup: async () => {
				await adopt(sandbox, "scenario-e-never", { setupArgs: ["--preset", "full", "--seed-panels", "--publish-to-tracker", "never"] });
				return { consumer: neverConsumer };
			},
			steps: [{ content: "publishToTracker is never: keeping the build a plain committed doc; no tracker attempt.", toolCalls: [{ name: "bash", arguments: { command: "echo no-tracker-publish" } }] }, { content: "No tracker attempt made." }],
			assert: ({ record }) => {
				if (record.ghLog.length !== 0) throw new Error(`E-never: expected no tracker attempt, gh log has ${record.ghLog.length}`);
				assertText(toolResults(record), { mustMatch: [/no-tracker-publish/], label: "E-never non-attempt" });
			},
		},
	];
}
