// Scenario D — review.tasks self vs subagent: the per-task validator dispatch
// delta through the installed resolve-panel. Under subagent, task_validate
// resolves a validator panel; under self, resolve-panel refuses (matches PR #92
// M1: "task validation is 'self' … only 'subagent' resolves").

import { assertText } from "../harness.mjs";
import { adopt, consumerPath, installedCmd, setCredentialedProviders, toolResults } from "./common.mjs";

function taskValidateCmd(sandbox, track) {
	const args = ["task_validate", "--author", "openai/gpt-5"];
	if (track) args.push("--track", track);
	return installedCmd(sandbox, "resolve-panel.mjs", args);
}

export function build(sandbox) {
	const subagentConsumer = consumerPath(sandbox, "scenario-d-subagent");
	const selfConsumer = consumerPath(sandbox, "scenario-d-self");
	return [
		{
			name: "D-tasks-subagent",
			tools: "read,bash,write",
			prompt: "Use the sdlc skill and resolve the task_validate panel for this task.",
			setup: async () => {
				await setCredentialedProviders(sandbox, ["deepseek", "anthropic"]);
				await adopt(sandbox, "scenario-d-subagent", { setupArgs: ["--preset", "full", "--seed-panels"] });
				return { consumer: subagentConsumer };
			},
			steps: [{ content: "review.tasks is subagent: resolving the task_validate panel.", toolCalls: [{ name: "bash", arguments: { command: taskValidateCmd(sandbox, "irreversible") } }] }, { content: "Validator panel resolved." }],
			assert: ({ record }) => {
				assertText(toolResults(record), { mustMatch: [/deepseek-v3|claude-haiku-4/], mustNotMatch: [/task validation is 'self'/], label: "D-subagent resolve result" });
			},
		},
		{
			name: "D-tasks-self",
			tools: "read,bash,write",
			prompt: "Use the sdlc skill and try to resolve the task_validate panel for this task.",
			setup: async () => {
				await setCredentialedProviders(sandbox, ["deepseek", "anthropic"]);
				await adopt(sandbox, "scenario-d-self", { setupArgs: ["--preset", "full", "--review-tasks", "self", "--seed-panels"] });
				return { consumer: selfConsumer };
			},
			steps: [{ content: "review.tasks is self: attempting to resolve the task_validate panel.", toolCalls: [{ name: "bash", arguments: { command: taskValidateCmd(sandbox, "irreversible") } }] }, { content: "resolve-panel refuses under self; the implementer runs the runner directly." }],
			assert: ({ record }) => {
				assertText(toolResults(record), { mustMatch: [/task validation is 'self'|only 'subagent'/], label: "D-self refusal" });
			},
		},
	];
}
