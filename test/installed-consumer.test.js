// ASD1 (DoD 1): an installed-consumer fixture locates system-reference.md, all
// six phase-*.md, all six sdlc:<slug> entrypoint templates, and the generated
// .pi/sdlc/CONFIG.md through only documented skill-relative / consumer-relative
// paths — never a cwd==package assumption; and every package-relative skill link
// inside those references resolves. Offline; no model calls.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
// Simulate the installed package resolved at an absolute path (node_modules-style),
// independent of the current working directory.
const packageRoot = repo;
const skillDir = join(packageRoot, "skills", "sdlc");
const SLUGS = ["brainstorm", "plan", "spec", "tasks", "implement", "pr-review"];

test("ASD1: the system reference and all six phase references resolve skill-relative", () => {
	assert.ok(existsSync(join(skillDir, "references", "system-reference.md")), "system-reference.md must resolve");
	for (const slug of SLUGS) {
		assert.ok(existsSync(join(skillDir, "references", `phase-${slug}.md`)), `phase-${slug}.md must resolve`);
	}
});

test("ASD1: the six advertised sdlc:<slug> invocations map to existing templates", () => {
	for (const slug of SLUGS) {
		const tpl = join(packageRoot, "templates", `sdlc-${slug}.md`);
		assert.ok(existsSync(tpl), `sdlc:${slug} must map to templates/sdlc-${slug}.md`);
		assert.match(readFileSync(tpl, "utf8"), new RegExp(`standalone sdlc:${slug}`), `template must advertise sdlc:${slug}`);
	}
});

test("ASD1: every package-relative skill link inside the references resolves", () => {
	const refFiles = ["system-reference.md", ...SLUGS.map((s) => `phase-${s}.md`)];
	// skill-relative link families (resolved against the skill dir), plus templates
	// (resolved against the package root). docs/ governance pointers are excluded.
	const skillLink = /\b(references\/[a-z-]+\.md|scripts\/[a-z-]+\.(?:sh|mjs)|assets\/[a-z0-9-]+\.(?:md|json|yml)|prompts\/[a-z-]+\.prompt\.md|schema\/[a-z0-9.-]+\.json)\b/g;
	const templateLink = /\btemplates\/(?:sdlc-[a-z-]+|setup-sdlc)\.md\b/g;
	for (const file of refFiles) {
		const body = readFileSync(join(skillDir, "references", file), "utf8");
		for (const m of body.match(skillLink) ?? []) {
			assert.ok(existsSync(resolve(skillDir, m)), `${file}: skill-relative link does not resolve: ${m}`);
		}
		for (const m of body.match(templateLink) ?? []) {
			assert.ok(existsSync(resolve(packageRoot, m)), `${file}: template link does not resolve: ${m}`);
		}
	}
});

test("ASD1: .pi/sdlc/CONFIG.md resolves consumer-relative (never package-relative)", () => {
	// A separate consumer repo as cwd, with the package resolved by absolute path.
	const consumer = mkdtempSync(join(tmpdir(), "installed-consumer-"));
	mkdirSync(join(consumer, ".pi", "sdlc"), { recursive: true });
	const config = {
		schemaVersion: 4,
		prefix: "demo",
		labelPrefix: "demo",
		announce: "Using the sdlc skill.",
		paths: { plans: "docs/plans", specs: "docs/specs", reviews: "docs/reviews", agents: ".pi/agents" },
		review: { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "fail" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
		panels: {
			authorDefault: "anthropic/claude-opus-4-8:high",
			phases: {
				plan_review: { panelSize: 2, prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
				spec_review: { panelSize: 2, prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
				pr_review: { panelSize: 3, prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
				task_validate: { panelSize: 1, prefer: ["deepseek/deepseek-v4-flash"] },
			},
		},
	};
	writeFileSync(join(consumer, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(config, null, 2));
	// Invoke the installed config-doc by absolute path from a cwd that is neither
	// the package nor the consumer, passing --repo-root (consumer-relative).
	execFileSync("node", [join(skillDir, "scripts", "config-doc.mjs"), "write", "--repo-root", consumer], { cwd: tmpdir(), encoding: "utf8" });
	assert.ok(existsSync(join(consumer, ".pi", "sdlc", "CONFIG.md")), "CONFIG.md must resolve consumer-relative");
});
