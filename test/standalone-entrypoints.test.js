// ASD12/ASD13 (DoD 10): the six standalone sdlc:<slug> entrypoints match the §9
// #38 degradation table; the sdlc:spec stamp is structurally valid; the
// sdlc:pr-review grounding disclosure is present; adopted-config-dominates is
// driven by the FS8 adoption.manifest-head predicate with error → stop; and
// sdlc:tasks / sdlc:implement refuse-with-redirect and fabricate nothing.
// Offline grep; no model calls.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const tpl = (slug) => readFileSync(join(repo, "templates", `sdlc-${slug}.md`), "utf8");
const SLUGS = ["brainstorm", "plan", "spec", "tasks", "implement", "pr-review"];

test("ASD12: all six sdlc:<slug> entrypoint templates exist", () => {
	for (const slug of SLUGS) assert.ok(existsSync(join(repo, "templates", `sdlc-${slug}.md`)), `missing templates/sdlc-${slug}.md`);
});

test("ASD12: every entrypoint drives adopted-config on the FS8 adoption.manifest-head predicate and stops on error", () => {
	for (const slug of SLUGS) {
		const body = tpl(slug);
		assert.match(body, /adoption\.manifest-head/, `sdlc-${slug} must use the FS8 adoption.manifest-head predicate`);
		assert.match(body, /ready.*not-ready|not-ready.*ready/s, `sdlc-${slug} must define adoption as state in {ready, not-ready}`);
		assert.match(body, /error.*\bstop\b|\bstop\b.*error/is, `sdlc-${slug} must stop on an sdlc-status error`);
		assert.match(body, /never treat.*errored.*adopted|is never\s+treated as adopted/is, `sdlc-${slug} must not treat an errored status as adopted`);
		// thin router: routes to the phase reference rather than duplicating mechanics
		assert.match(body, new RegExp(`references/phase-${slug}\\.md`), `sdlc-${slug} must load its phase reference`);
	}
});

test("ASD12: the sdlc:spec stamp is structurally valid and only spec emits one", () => {
	const spec = tpl("spec");
	// the stamp is a single '>'-prefixed plain-prose line with the disclosure phrases
	const stampLine = spec.split("\n").find((l) => l.startsWith("> Sampled via sdlc:spec"));
	assert.ok(stampLine, "spec template must carry the canonical stamp line");
	assert.ok(!/[{}]/.test(stampLine), "stamp must contain no YAML/JSON braces");
	for (const phrase of ["no committed plan", "Not adopted", "checker-verified"]) {
		assert.ok(stampLine.includes(phrase), `stamp missing disclosure phrase: ${phrase}`);
	}
	assert.match(spec, /stamp-and-interview/);
	assert.match(spec, /refuse-with-redirect/);
	// only spec stamps: the others explicitly say no stamp
	for (const slug of ["brainstorm", "plan", "tasks", "implement", "pr-review"]) {
		assert.ok(!tpl(slug).includes("Sampled via sdlc:spec"), `sdlc-${slug} must not emit the spec stamp`);
	}
});

test("ASD12: sdlc:pr-review discloses grounded-vs-diff-only and never runs below committed floors", () => {
	const pr = tpl("pr-review");
	assert.match(pr, /grounded-vs-diff-only/);
	assert.match(pr, /optional, skippable grounding prompt/i);
	assert.match(pr, /never below them|never below/i);
});

test("ASD12: brainstorm/plan run without upstream (unadopted) and as configured gate (adopted)", () => {
	for (const slug of ["brainstorm", "plan"]) {
		const body = tpl(slug);
		assert.match(body, /no committed upstream/i);
		assert.match(body, /configured .*gate|configured brainstorm gate|configured design gate/i);
	}
});

test("ASD13: sdlc:tasks and sdlc:implement refuse-with-redirect in BOTH adoption states and fabricate nothing", () => {
	for (const slug of ["tasks", "implement"]) {
		const body = tpl(slug);
		assert.match(body, /always refuse-with-redirect/i, `sdlc-${slug} must always refuse-with-redirect on absent upstream`);
		assert.match(body, /BOTH adoption states/i, `sdlc-${slug} must apply the refusal in both adoption states`);
		assert.match(body, /never fabricate/i, `sdlc-${slug} must never fabricate ids/checks`);
		assert.match(body, /counterfeit-artifact rule/i, `sdlc-${slug} must cite the counterfeit-artifact rule`);
	}
});
