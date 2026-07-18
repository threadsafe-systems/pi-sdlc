// Scenario B — solo vs full: the design-gate delta, expressed as ordered effects
// through the installed resolve-panel. Under full (design: panel) plan_review
// resolves a panel; under solo (design: human) resolve-panel refuses ("no panel
// to resolve"). The brainstorm on/off dial is corroborated from the committed
// config the agent operates under.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { assertText } from "../harness.mjs";
import { adopt, consumerPath, installedCmd, setCredentialedProviders, toolResults } from "./common.mjs";

function resolvePlanCmd(sandbox, track) {
	const args = ["plan_review", "--author", "anthropic/claude-opus-4-8"];
	if (track) args.push("--track", track);
	return installedCmd(sandbox, "resolve-panel.mjs", args);
}

async function assertBrainstormDial(consumer, expected) {
	const config = JSON.parse(await readFile(join(consumer, ".pi", "sdlc", "sdlc.config.json"), "utf8"));
	if (config.review.brainstorm !== expected) throw new Error(`B brainstorm dial = ${config.review.brainstorm}, expected ${expected}`);
}

export function build(sandbox) {
	const fullConsumer = consumerPath(sandbox, "scenario-b-full");
	const soloConsumer = consumerPath(sandbox, "scenario-b-solo");
	return [
		{
			name: "B-full-design-panel",
			tools: "read,bash,write",
			prompt: "Use the sdlc skill and resolve the plan_review panel for this irreversible change.",
			setup: async () => {
				await setCredentialedProviders(sandbox, ["openai", "deepseek"]);
				await adopt(sandbox, "scenario-b-full", { setupArgs: ["--preset", "full", "--seed-panels"] });
				return { consumer: fullConsumer };
			},
			steps: [{ content: "Full track: resolving the plan_review design panel.", toolCalls: [{ name: "bash", arguments: { command: resolvePlanCmd(sandbox, "irreversible") } }] }, { content: "Panel resolved; proceeding to the design gate." }],
			assert: async ({ record }) => {
				assertText(toolResults(record), { mustMatch: [/gpt-5|deepseek-v3/], mustNotMatch: [/no panel to resolve/], label: "B-full resolve-panel result" });
				await assertBrainstormDial(fullConsumer, "human");
			},
		},
		{
			name: "B-solo-design-human",
			tools: "read,bash,write",
			prompt: "Use the sdlc skill and try to resolve the plan_review panel for this reversible change.",
			setup: async () => {
				await setCredentialedProviders(sandbox, ["openai", "deepseek"]);
				await adopt(sandbox, "scenario-b-solo", { setupArgs: ["--preset", "solo", "--seed-panels"] });
				return { consumer: soloConsumer };
			},
			steps: [{ content: "Solo track: attempting to resolve the plan_review panel.", toolCalls: [{ name: "bash", arguments: { command: resolvePlanCmd(sandbox, null) } }] }, { content: "No panel to resolve at this gate; the design gate is human." }],
			assert: async ({ record }) => {
				assertText(toolResults(record), { mustMatch: [/no panel to resolve|gate mode is 'human'/], label: "B-solo resolve-panel refusal" });
				await assertBrainstormDial(soloConsumer, "off");
			},
		},
	];
}
