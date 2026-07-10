// Offline tests for the sdlc-status CLI (spec scenarios OH3, OH10). NFR2: no
// model calls; pure temp-dir + script-exit checks.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { validateConfig } from "../skills/sdlc/scripts/lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const statusMjs = join(repo, "skills", "sdlc", "scripts", "sdlc-status.mjs");

function status(root) {
	try {
		const stdout = execFileSync("node", [statusMjs, "--repo-root", root], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		return { code: 0, stdout, stderr: "" };
	} catch (e) {
		return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
	}
}

function mkRepo(config) {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-status-"));
	if (config !== undefined) {
		const pj = join(dir, ".pi", "sdlc");
		mkdirSync(pj, { recursive: true });
		writeFileSync(join(pj, "sdlc.config.json"), config);
	}
	return dir;
}

test("OH3: opted-in repo with hooks reports §3 keys in order with counts", () => {
	const dir = mkRepo(JSON.stringify({
		schemaVersion: 1, prefix: "acme", labelPrefix: "acme-sdlc", announce: "a",
		hooks: {
			implement: { before: [{ use: "tool:t", do: "x" }], after: [{ run: "y" }] },
			"*": { after: [{ run: "z" }] },
		},
	}));
	mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
	writeFileSync(join(dir, ".pi", "sdlc", "sdlc.models.json"), "{}");
	try {
		const r = status(dir);
		assert.equal(r.code, 0, r.stderr);
		const lines = r.stdout.trimEnd().split("\n");
		assert.match(lines[0], /^root: /);
		assert.equal(lines[1], "opted-in: yes");
		assert.equal(lines[2], "prefix: acme");
		assert.equal(lines[3], "labelPrefix: acme-sdlc");
		// hooks in HOOK_PHASES order (implement before *), before before after
		assert.equal(lines[4], "hooks: implement:before 1");
		assert.equal(lines[5], "hooks: implement:after 1");
		assert.equal(lines[6], "hooks: *:after 1");
		assert.equal(lines[7], "workflow: absent");
		assert.equal(lines[8], "models: present");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH3: opted-in repo without hooks reports 'hooks: none'", () => {
	const dir = mkRepo(JSON.stringify({ schemaVersion: 1, prefix: "acme", labelPrefix: "acme-sdlc", announce: "a" }));
	try {
		const r = status(dir);
		assert.equal(r.code, 0, r.stderr);
		assert.ok(r.stdout.includes("hooks: none"), "expected 'hooks: none'");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH3: manifest-less repo exits 1 with opted-in: no", () => {
	const dir = mkRepo(undefined);
	try {
		const r = status(dir);
		assert.equal(r.code, 1, "manifest-less repo must exit 1");
		assert.ok(r.stdout.includes("opted-in: no"), "stdout must say opted-in: no");
		assert.match(r.stderr, /setup-sdlc/, "stderr must point at /setup-sdlc");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH3: corrupt config exits 2", () => {
	const dir = mkRepo('{"schemaVersion":1,"prefix":"acme","labelPrefix":"acme-sdlc","announce":"a","hooks":{"deploy":{"after":[{"run":"x"}]}}}');
	try {
		assert.equal(status(dir).code, 2, "invalid config must exit 2");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH10: this repo's committed config is valid and sdlc-status exits 0", () => {
	const raw = JSON.parse(execFileSync("cat", [join(repo, ".pi", "sdlc", "sdlc.config.json")], { encoding: "utf8" }));
	validateConfig(raw, join(repo, ".pi", "sdlc", "sdlc.config.json")); // throws/exits on invalid
	assert.equal(status(repo).code, 0, "dogfood config must resolve opted-in");
});
