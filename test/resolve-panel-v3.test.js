// resolve-panel v3: effective-value resolution, floors, refusals, onShortfall.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const resolver = join(repo, "skills", "sdlc", "scripts", "resolve-panel.mjs");
const credentialVars = [
	"ANTHROPIC_API_KEY",
	"ANTHROPIC_OAUTH_TOKEN",
	"DEEPSEEK_API_KEY",
	"OPENAI_API_KEY",
	"ZAI_API_KEY",
	"GEMINI_API_KEY",
	"GOOGLE_API_KEY",
	"MINIMAX_API_KEY",
	"MOONSHOT_API_KEY",
	"KIMI_API_KEY",
	"ZAI_CODING_CN_API_KEY",
	"AWS_ACCESS_KEY_ID",
	"AWS_SECRET_ACCESS_KEY",
	"AWS_PROFILE",
	"AWS_BEARER_TOKEN_BEDROCK",
	"AWS_CONTAINER_CREDENTIALS_FULL_URI",
	"AWS_CONTAINER_CREDENTIALS_RELATIVE_URI",
	"AWS_WEB_IDENTITY_TOKEN_FILE",
];

// A phase roster with 4 distinct-identity models, one sharing the author's provider.
const ROSTER = {
	plan_review: { prefer: ["openai/gpt-5", "zai/glm-5", "deepseek/deepseek-v3", "anthropic/claude-fable-5"] },
	spec_review: { prefer: ["openai/gpt-5", "zai/glm-5", "deepseek/deepseek-v3"] },
	pr_review: { panelSize: 3, prefer: ["anthropic/claude-fable-5", "openai/gpt-5", "google/gemini-3", "deepseek/deepseek-v3"] },
	task_validate: { prefer: ["deepseek/deepseek-v3", "anthropic/claude-haiku-4"] },
};

function fixture({ review = {}, shape = {}, overrides, authorDefault = "anthropic/claude-opus-4", providers, phases = {} } = {}) {
	const root = mkdtempSync(join(tmpdir(), "sdlc-rp-v3-"));
	const home = join(root, "home");
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	mkdirSync(join(home, ".pi", "agent"), { recursive: true });
	const rosterPhases = structuredClone(ROSTER);
	for (const [phase, override] of Object.entries(phases)) rosterPhases[phase] = { ...rosterPhases[phase], ...override };
	const config = {
		schemaVersion: 3,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		review: { brainstorm: "human", design: "panel", code: "panel", tasks: "subagent", panelSize: 2, onShortfall: "proceed", ...review },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible", ...shape },
		...(overrides ? { overrides } : {}),
		panels: { authorDefault, phases: rosterPhases },
	};
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config, null, 2)}\n`);
	const authProviders = providers ?? ["openai", "zai", "deepseek", "anthropic", "google"];
	writeFileSync(join(home, ".pi", "agent", "auth.json"), `${JSON.stringify(Object.fromEntries(authProviders.map((p) => [p, {}])))}\n`);
	return { root, home };
}

function run({ root, home }, phase, args = [], extraEnv = {}) {
	const env = { ...process.env, HOME: home };
	for (const key of credentialVars) delete env[key];
	Object.assign(env, extraEnv);
	const r = spawnSync(process.execPath, [resolver, phase, "--config", root, ...args], { encoding: "utf8", env });
	return { status: r.status, stdout: r.stdout.trim(), stderr: r.stderr };
}
const lines = (out) => (out === "" ? [] : out.split("\n"));

// ICA12: forward-only pinned vectors — floor-capped, identity-deduped, author-excluded.
test("ICA12: pr_review floor 3, author's provider-mate stays, author identity excluded", () => {
	const f = fixture();
	const { status, stdout } = run(f, "pr_review", ["--author", "anthropic/claude-opus-4"]);
	assert.equal(status, 0);
	// author identity is claude-opus-4; claude-fable-5 (same provider, diff identity) stays.
	assert.deepEqual(lines(stdout), ["anthropic/claude-fable-5", "openai/gpt-5", "google/gemini-3"]);
});

test("ICA12: plan_review floor 2 caps at two", () => {
	const { status, stdout } = run(fixture(), "plan_review", ["--author", "anthropic/claude-opus-4"]);
	assert.equal(status, 0);
	assert.deepEqual(lines(stdout), ["openai/gpt-5", "zai/glm-5"]);
});

test("ICA12: task_validate floors at 1", () => {
	const { status, stdout } = run(fixture(), "task_validate", ["--author", "anthropic/claude-opus-4"]);
	assert.equal(status, 0);
	assert.deepEqual(lines(stdout), ["deepseek/deepseek-v3"]);
});

// ICA13: --track required with overrides; per-track dial resolution.
test("ICA13: --track required when overrides present", () => {
	const f = fixture({ overrides: { reversible: { review: { design: "human" } } } });
	const { status, stderr } = run(f, "plan_review", ["--author", "anthropic/claude-opus-4"]);
	assert.equal(status, 1);
	assert.match(stderr, /per-track overrides/);
});

test("ICA13: reversible design override refuses; irreversible resolves", () => {
	const f = fixture({ overrides: { reversible: { review: { design: "human" } } } });
	const rev = run(f, "plan_review", ["--author", "anthropic/claude-opus-4", "--track", "reversible"]);
	assert.equal(rev.status, 1);
	assert.match(rev.stderr, /no panel to resolve/);
	const irr = run(f, "plan_review", ["--author", "anthropic/claude-opus-4", "--track", "irreversible"]);
	assert.equal(irr.status, 0);
	assert.deepEqual(lines(irr.stdout), ["openai/gpt-5", "zai/glm-5"]);
});

// ICA14: refusals.
test("ICA14: review.tasks off refuses task_validate", () => {
	const { status, stderr } = run(fixture({ review: { tasks: "off" } }), "task_validate");
	assert.equal(status, 1);
	assert.match(stderr, /task validation is off/);
});

test("ICA14: design human refuses plan_review with no-panel message", () => {
	const { status, stderr } = run(fixture({ review: { design: "human" } }), "plan_review");
	assert.equal(status, 1);
	assert.match(stderr, /no panel to resolve/);
});

test("ICA14: separateSpec false refuses spec_review with no-spec-gate message", () => {
	const { status, stderr } = run(fixture({ shape: { separateSpec: false } }), "spec_review");
	assert.equal(status, 1);
	assert.match(stderr, /no spec gate/);
});

// ICA15: floor sourcing + author exclusion active at floor >= 2 only.
test("ICA15: per-phase panelSize overrides review.panelSize", () => {
	// pr_review has panelSize 3 in the roster while review.panelSize is 2.
	const { stdout } = run(fixture(), "pr_review", ["--author", "anthropic/claude-opus-4"]);
	assert.equal(lines(stdout).length, 3);
});

test("ICA15: floor 1 does not exclude the author identity", () => {
	// task_validate floors at 1; author exclusion inactive, but its prefer has no author identity anyway.
	// Prove inactivity via panelSize:1 on plan_review through an override.
	const f = fixture({ overrides: { irreversible: { review: { panelSize: 1 } } } });
	const { status, stdout } = run(f, "plan_review", ["--author", "openai/gpt-5", "--track", "irreversible"]);
	assert.equal(status, 0);
	// author is openai/gpt-5 but floor is 1 so exclusion is inactive → first prefer entry stays.
	assert.deepEqual(lines(stdout), ["openai/gpt-5"]);
});

// ICA16: onShortfall behaviour.
test("ICA16: onShortfall proceed advises and exits 0 below floor", () => {
	// Only openai credentialed; plan_review floor 2 unreachable.
	const f = fixture({ providers: ["openai"] });
	const { status, stderr } = run(f, "plan_review", ["--author", "anthropic/claude-opus-4"]);
	assert.equal(status, 0);
	assert.match(stderr, /onShortfall is 'proceed'/);
});

test("ICA16: onShortfall fail exits 1 below floor", () => {
	const f = fixture({ review: { onShortfall: "fail" }, providers: ["openai"] });
	const { status, stderr } = run(f, "plan_review", ["--author", "anthropic/claude-opus-4"]);
	assert.equal(status, 1);
	assert.match(stderr, /FAILED to reach distinct-model minPanel/);
});

// M1 (PR panel): task_validate refuses any tasks mode except subagent.
test("ICA14: review.tasks self refuses task_validate (only subagent resolves)", () => {
	const { status, stderr } = run(fixture({ review: { tasks: "self" } }), "task_validate");
	assert.equal(status, 1);
	assert.match(stderr, /only 'subagent' resolves/);
});

// ICA24: refusal precedence — separateSpec:false + design:human → no-spec-gate, not no-panel.
test("ICA24: separateSpec false precedes the human/off refusal for spec_review", () => {
	const { status, stderr } = run(fixture({ review: { design: "human" }, shape: { separateSpec: false } }), "spec_review");
	assert.equal(status, 1);
	assert.match(stderr, /no spec gate \(shape.separateSpec is false\)/);
});

// rpi-t1: cross-provider model identity collapsing (issue #80 gap 2).
const AWS_ENV = { AWS_ACCESS_KEY_ID: "stub", AWS_SECRET_ACCESS_KEY: "stub" };

test("rpi-t1: Bedrock-hosted Claude collapses to the direct-API identity for author-exclusion", () => {
	const f = fixture({
		phases: { pr_review: { panelSize: 2, prefer: ["amazon-bedrock/global.anthropic.claude-opus-4-8", "openai/gpt-5", "zai/glm-5"] } },
	});
	const { status, stdout, stderr } = run(f, "pr_review", ["--author", "anthropic/claude-opus-4-8"], AWS_ENV);
	assert.equal(status, 0);
	// the Bedrock entry is the same underlying model as the author (anthropic/claude-opus-4-8) — excluded.
	assert.deepEqual(lines(stdout), ["openai/gpt-5", "zai/glm-5"]);
	assert.match(stderr, /dropped amazon-bedrock\/global\.anthropic\.claude-opus-4-8: author model/);
});

test("rpi-t1: distinct Bedrock version qualifiers stay distinct identities", () => {
	const f = fixture({
		phases: {
			pr_review: {
				panelSize: 2,
				prefer: ["amazon-bedrock/global.anthropic.claude-opus-4-8-v1:0", "amazon-bedrock/us.anthropic.claude-opus-4-8-v1:1", "openai/gpt-5"],
			},
		},
	});
	const { status, stdout } = run(f, "pr_review", ["--author", "anthropic/claude-opus-4-8"], AWS_ENV);
	assert.equal(status, 0);
	// different Bedrock version qualifiers are not collapsed into one identity — both are kept, floor 2 reached before openai.
	assert.deepEqual(lines(stdout), ["amazon-bedrock/global.anthropic.claude-opus-4-8-v1:0", "amazon-bedrock/us.anthropic.claude-opus-4-8-v1:1"]);
});

test("rpi-t1: Bedrock-native model with no direct-provider equivalent is unaffected", () => {
	const f = fixture({
		phases: {
			pr_review: {
				panelSize: 2,
				prefer: ["amazon-bedrock/amazon.nova-pro-v1:0", "amazon-bedrock/us.amazon.nova-pro-v1:0", "openai/gpt-5"],
			},
		},
	});
	const { status, stdout } = run(f, "pr_review", ["--author", "anthropic/claude-opus-4-8"], AWS_ENV);
	assert.equal(status, 0);
	// no vendor-alias mapping for "amazon" — each literal id is its own identity, un-mangled, un-collapsed.
	assert.deepEqual(lines(stdout), ["amazon-bedrock/amazon.nova-pro-v1:0", "amazon-bedrock/us.amazon.nova-pro-v1:0"]);
});
