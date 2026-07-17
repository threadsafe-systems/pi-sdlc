// setup-sdlc v3: presets, per-dial flags, --override, retired flags, preset patch.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const setup = join(repo, "skills", "sdlc", "scripts", "setup-sdlc.mjs");

function mkRoot() {
	return mkdtempSync(join(tmpdir(), "sdlc-setup-v3-"));
}
function run(root, args) {
	const r = spawnSync(process.execPath, [setup, "--config", root, ...args], { encoding: "utf8" });
	return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}
function cfg(root) {
	return JSON.parse(readFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), "utf8"));
}

// ICA17: retired flags each name their successor.
for (const [flag, needle] of [
	["--profile", /--preset/],
	["--lifecycle-json", /set dials via/],
	["--enforcement", /--on-shortfall/],
]) {
	test(`ICA17: ${flag} is retired`, () => {
		const r = run(mkRoot(), [flag, "x", "--yes"]);
		assert.equal(r.code, 2);
		assert.match(r.stderr, needle);
	});
}
test("ICA17: --preset custom is retired", () => {
	const r = run(mkRoot(), ["--preset", "custom", "--yes"]);
	assert.equal(r.code, 2);
	assert.match(r.stderr, /custom is retired/);
});

// ICA18: preset fresh write + per-dial override + --override.
test("ICA18: --preset standard writes the explicit standard bundle", () => {
	const root = mkRoot();
	assert.equal(run(root, ["--preset", "standard", "--yes"]).code, 0);
	const c = cfg(root);
	assert.equal(c.schemaVersion, 3);
	assert.deepEqual(c.review, { brainstorm: "human", design: "human", code: "panel", tasks: "subagent", panelSize: 2, onShortfall: "proceed" });
	assert.deepEqual(c.shape, { separateSpec: false, publishToTracker: 4, defaultTrack: "irreversible" });
	assert.equal(c.overrides, undefined);
	assert.deepEqual(cfg(root) && Object.keys(c).includes("lifecycle"), false);
});

test("ICA18: per-dial flags override the preset; --override lands in overrides", () => {
	const root = mkRoot();
	const r = run(root, ["--preset", "standard", "--review-design", "panel", "--panel-size", "3", "--override", "reversible:design:human", "--yes"]);
	assert.equal(r.code, 0, r.stderr);
	const c = cfg(root);
	assert.equal(c.review.design, "panel");
	assert.equal(c.review.panelSize, 3);
	assert.deepEqual(c.overrides, { reversible: { review: { design: "human" } } });
});

test("ICA18: --preset full carries the reversible design override", () => {
	const root = mkRoot();
	assert.equal(run(root, ["--preset", "full", "--yes"]).code, 0);
	assert.deepEqual(cfg(root).overrides, { reversible: { review: { design: "human" } } });
});

// ICA19: preset patch on existing valid v3 config.
test("ICA19: --preset patches review/shape/overrides and preserves other keys", () => {
	const root = mkRoot();
	run(root, ["--preset", "standard", "--prefix", "keep", "--label-prefix", "keep-sdlc", "--announce", "KEEP", "--yes"]);
	const before = cfg(root);
	const r = run(root, ["--preset", "full"]);
	assert.equal(r.code, 0, r.stderr);
	assert.match(r.stdout, /patched/);
	const after = cfg(root);
	assert.equal(after.prefix, "keep");
	assert.equal(after.labelPrefix, "keep-sdlc");
	assert.equal(after.announce, "KEEP");
	assert.equal(after.shape.separateSpec, true); // full
	assert.deepEqual(after.overrides, { reversible: { review: { design: "human" } } });
	assert.notEqual(after.shape.separateSpec, before.shape.separateSpec);
});

test("ICA19: patch that would delete consumer overrides refuses without --force", () => {
	const root = mkRoot();
	run(root, ["--preset", "full", "--prefix", "keep", "--label-prefix", "keep-sdlc", "--yes"]); // has overrides
	const r = run(root, ["--preset", "solo"]); // solo has no overrides
	assert.equal(r.code, 1);
	assert.match(r.stdout, /refused patch that would delete consumer-authored overrides/);
	assert.deepEqual(cfg(root).overrides, { reversible: { review: { design: "human" } } }); // untouched
	const forced = run(root, ["--preset", "solo", "--force"]);
	assert.equal(forced.code, 0, forced.stderr);
	assert.equal(cfg(root).overrides, undefined);
	assert.equal(cfg(root).prefix, "keep"); // --force patch preserves identity
});

// ICA23: --override validation.
for (const [spec, needle] of [
	["reversible:brainstorm:off", /design\|code\|tasks\|panelSize/],
	["reversible:onShortfall:fail", /design\|code\|tasks\|panelSize/],
	["frozen:design:panel", /track must be irreversible or reversible/],
	["reversible:design:banana", /panel\|advisory\|human\|off/],
	["reversible:panelSize:zero", /integer >= 1/],
	["reversible:design", /must be "<track>:<dial>:<value>"/],
]) {
	test(`ICA23: --override ${spec} is rejected exit 2`, () => {
		const r = run(mkRoot(), ["--override", spec, "--yes"]);
		assert.equal(r.code, 2, r.stderr);
		assert.match(r.stderr, needle);
	});
}
