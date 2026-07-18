// ASD3 (DoD 3): each of the six phase references contains all nine §6 required
// headings and at least one explicit `under your configuration` callout routing
// to CONFIG.md/JSON. A phase reference stating a fixed track/gate without the
// callout fails. Offline grep; no model calls.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const refDir = join(repo, "skills", "sdlc", "references");
const SLUGS = ["brainstorm", "plan", "spec", "tasks", "implement", "pr-review"];

// The nine §6 required headings, as stable numbered-heading anchors.
const HEADINGS = {
	"1 purpose/invocation modes": /^## 1\. Purpose and invocation modes/m,
	"2 entry conditions/upstream": /^## 2\. Entry conditions and authoritative upstream inputs/m,
	"3 before-hook order/blocking": /^## 3\. Configured before-hook order and blocking semantics/m,
	"4 required activity/artifact": /^## 4\. Required activity and artifact\/output shape/m,
	"5 invariant gate/approval seam": /^## 5\. Invariant gate\/approval seam/m,
	"6 refusal/backward": /^## 6\. Refusal and backward-transition behaviour/m,
	"7 after-hook order/warning": /^## 7\. After-hook order and warning semantics/m,
	"8 completion evidence/next transition": /^## 8\. Completion evidence and next transition/m,
	"9 advanced-mode pointers": /^## 9\. Advanced-mode pointers/m,
};

for (const slug of SLUGS) {
	const body = readFileSync(join(refDir, `phase-${slug}.md`), "utf8");

	test(`ASD3: phase-${slug}.md carries all nine §6 headings`, () => {
		for (const [label, re] of Object.entries(HEADINGS)) {
			assert.match(body, re, `phase-${slug}.md missing heading: ${label}`);
		}
	});

	test(`ASD3: phase-${slug}.md has at least one 'under your configuration' callout to CONFIG.md/JSON`, () => {
		assert.match(body, /under your configuration/i, `phase-${slug}.md states a fixed shape without a config-relative callout`);
		assert.match(body, /CONFIG\.md|sdlc\.config\.json/, `phase-${slug}.md callout does not route to CONFIG.md/JSON`);
	});

	test(`ASD3 (non-vacuous): removing the config callout from phase-${slug}.md is detected`, () => {
		const mutated = body.replace(/under your configuration/gi, "always");
		assert.doesNotMatch(mutated, /under your configuration/i);
	});
}
