// OL-A T3: fresh-adoption profile and custom lifecycle setup.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { inspectConfig } from "../skills/sdlc/scripts/lib.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const setupMjs = join(repo, "skills", "sdlc", "scripts", "setup-sdlc.mjs");

const standard = {
	profile: "standard",
	gates: {
		brainstorm: { mode: "human" },
		plan_review: { mode: "human", minPanel: 1 },
		pr_review: { mode: "panel", minPanel: 2 },
	},
	phases: { mergePlanSpec: true },
	tracker: { publishThreshold: 4 },
	taskValidation: { mode: "subagent" },
	tracks: { defaultTrack: "irreversible" },
};

function setup(root, args, input) {
	const result = spawnSync(process.execPath, [setupMjs, "--repo-root", root, ...args], { encoding: "utf8", input });
	return { code: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error(`invalid JSON fixture ${path}: ${error.message}`);
	}
}

function configPath(root) {
	return join(root, ".pi", "sdlc", "sdlc.config.json");
}

function mkTemp() {
	return mkdtempSync(join(tmpdir(), "sdlc-setup-lifecycle-"));
}

function shQuote(value) {
	return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function interactive(root, answers) {
	const command = `${shQuote(process.execPath)} ${shQuote(setupMjs)} --repo-root ${shQuote(root)}`;
	const feed = answers.map((answer) => `printf '%s\\n' ${shQuote(answer)}; sleep 0.1`).join("; ");
	return spawnSync("bash", ["-c", `(sleep 0.2; ${feed}) | script -qec ${shQuote(command)} /dev/null`], { encoding: "utf8" });
}

test("OLA14: --profile standard writes the exact fully-expanded standard block", () => {
	const dir = mkTemp();
	try {
		const result = setup(dir, ["--profile", "standard", "--yes"]);
		assert.equal(result.code, 0, result.stderr);
		const config = readJson(configPath(dir));
		assert.deepEqual(config.lifecycle, standard);
		assert.deepEqual(inspectConfig(config), []);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OLA14/NF-3: repeated preset runs produce identical lifecycle bytes", () => {
	const blocks = [];
	for (let i = 0; i < 2; i++) {
		const dir = mkTemp();
		try {
			assert.equal(setup(dir, ["--profile", "full", "--yes"]).code, 0);
			blocks.push(`${JSON.stringify(readJson(configPath(dir)).lifecycle, null, 2)}\n`);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
	assert.equal(blocks[0], blocks[1]);
});

test("OLA15: the interactive profile question is first and defaults to standard", () => {
	const dir = mkTemp();
	try {
		const result = interactive(dir, ["", "", "", "", "", "", "", "", ""]);
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /lifecycle profile[^\r\n]*solo:[^\r\n]*standard:[^\r\n]*full:[^\r\n]*custom:[^\r\n]*\[standard\]/);
		assert.deepEqual(readJson(configPath(dir)).lifecycle, standard);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("custom interview rejects invalid Boolean and gate answers immediately with text", () => {
	for (const { answers, message } of [
		{ answers: ["custom", "yes"], message: /merge plan and spec.*must be one of true, false/ },
		{ answers: ["custom", "false", "banana"], message: /irreversible plan review mode.*must be one of panel, advisory, human, off/ },
	]) {
		const dir = mkTemp();
		try {
			const result = interactive(dir, answers);
			assert.equal(result.status, 1);
			assert.match(result.stdout, message);
			assert.equal(existsSync(configPath(dir)), false);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("OLA16/NF-1(c): non-interactive setup without lifecycle flags remains v1-shaped", () => {
	const dir = mkTemp();
	try {
		const result = setup(dir, ["--prefix", "x", "--label-prefix", "y", "--yes"]);
		assert.equal(result.code, 0, result.stderr);
		const expectedOutput = [
			"schema-version: 2",
			`root: ${dir}`,
			"exit-code: 0",
			`reference: reference.pr-template ok — resolved ${join(repo, "skills", "sdlc", "assets", "pull_request_template.md")}`,
			`reference: reference.checker ok — resolved ${join(repo, "skills", "sdlc", "scripts", "check-lifecycle.mjs")}`,
			`asset: config created — created ${configPath(dir)}`,
			`asset: pr-template created — created ${join(dir, ".github", "pull_request_template.md")}`,
			"",
		].join("\n");
		assert.equal(result.stdout, expectedOutput);
		assert.equal(result.stderr, "");
		const config = readJson(configPath(dir));
		assert.deepEqual(config, {
			schemaVersion: 2,
			prefix: "x",
			labelPrefix: "y",
			announce: "Using the sdlc skill to drive this change through its lifecycle.",
			enforcement: "preference",
		});
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OLA16: applying a profile to an existing config refuses with the OL-B pointer", () => {
	const dir = mkTemp();
	try {
		assert.equal(setup(dir, ["--yes"]).code, 0);
		const before = readFileSync(configPath(dir), "utf8");
		const result = setup(dir, ["--profile", "solo", "--yes", "--force"]);
		assert.equal(result.code, 1);
		assert.match(result.stdout, /refused profile application.*deferred to OL-B/);
		assert.match(result.stdout, /2026-07-14-opt-in-lifecycle\.md/);
		assert.equal(readFileSync(configPath(dir), "utf8"), before);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OLA17: custom profile requires lifecycle JSON and injects profile exactly", () => {
	const dir = mkTemp();
	try {
		let result = setup(dir, ["--profile", "custom", "--yes"]);
		assert.equal(result.code, 1);
		assert.match(result.stderr, /--profile custom requires --lifecycle-json/);
		const payload = {
			gates: {
				brainstorm: { mode: "off" },
				plan_review: { mode: "human", minPanel: 1 },
				pr_review: { mode: "advisory", minPanel: 1 },
			},
			phases: { mergePlanSpec: true },
			tracker: { publishThreshold: "never" },
			taskValidation: { mode: "self" },
			tracks: { defaultTrack: "reversible" },
		};
		result = setup(dir, ["--profile", "custom", "--lifecycle-json", "-", "--yes"], `${JSON.stringify(payload)}\n`);
		assert.equal(result.code, 0, result.stderr);
		const config = readJson(configPath(dir));
		assert.deepEqual(config.lifecycle, { ...payload, profile: "custom" });
		assert.deepEqual(inspectConfig(config), []);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OLA17: custom payload usage and validation failures are pinned", () => {
	for (const { profile, payload, code, message } of [
		{ profile: "standard", payload: {}, code: 2, message: /--lifecycle-json requires --profile custom/ },
		{ profile: "custom", payload: { profile: "custom" }, code: 2, message: /payload must not contain a profile key/ },
		{ profile: "custom", payload: { gates: { pr_review: { mode: "panel", minPanel: 0 } } }, code: 1, message: /lifecycle\.gates\.pr_review\.minPanel.*integer >= 1/ },
	]) {
		const dir = mkTemp();
		const payloadPath = join(dir, "lifecycle.json");
		try {
			writeFileSync(payloadPath, `${JSON.stringify(payload)}\n`);
			const result = setup(dir, ["--profile", profile, "--lifecycle-json", payloadPath, "--yes"]);
			assert.equal(result.code, code);
			assert.match(result.stderr, message);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});
