import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const parseJson = (path) => {
	try {
		return JSON.parse(read(path));
	} catch (error) {
		throw new Error(`invalid JSON fixture ${path}: ${error.message}`);
	}
};

const genericPrompts = ["skills/sdlc/prompts/adversary-plan.prompt.md", "skills/sdlc/prompts/adversary-spec.prompt.md", "skills/sdlc/prompts/adversary-review.prompt.md", "skills/sdlc/prompts/validator-task.prompt.md"];

test("NR7: generic prompts do not require absent governing files", () => {
	for (const path of genericPrompts) {
		const source = read(path);
		assert.doesNotMatch(source, /CONTRIBUTORS\.md|<CONTRIBUTORS_PATH>/, path);
		assert.doesNotMatch(source, /the project's `AGENTS\.md`/, path);
	}
	assert.match(read(genericPrompts[0]), /governing documents \(for example, `AGENTS\.md` or an equivalent if present\)/);
});

test("NR7: skill dispatch instructions are concrete and CI claims are bounded", () => {
	const skill = read("skills/sdlc/SKILL.md");
	assert.doesNotMatch(skill, /FILL_IN_TASK_BLOCK/);
	assert.match(skill, /Replace\s+its task value with the exact review task/);
	assert.match(skill, /configured the shipped workflow|documented snippet/);
	assert.doesNotMatch(skill, /CI checks the declared track's artifacts are committed\./);
});

test("NR7: inventory checker and ADR are shipped and versioned", () => {
	const inventory = parseJson("skills/sdlc/assets/normative-references.json");
	const schema = parseJson("skills/sdlc/assets/normative-references.schema.json");
	assert.equal(inventory.schemaVersion, 1);
	assert.equal(schema.title, "pi-sdlc normative reference inventory");
	assert.match(read("docs/adr/0019-normative-reference-honesty-fs11.md"), /FS11/);
});

test("NR8: source prompt extraction remains the fixture authority", () => {
	for (const path of ["test/fixtures/golden/plan_review.agent.md", "test/fixtures/golden/spec_review.agent.md", "test/fixtures/golden/pr_review.agent.md", "test/fixtures/golden/task_validate.agent.md"]) assert.ok(read(path).length > 0, path);
});
