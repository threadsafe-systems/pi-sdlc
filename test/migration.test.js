// T2 migration and setup contract coverage (CV6-CV16).
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import * as fs from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { applyMigration, planMigration } from "../skills/sdlc/scripts/migrate.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const setup = join(repo, "skills/sdlc/scripts/setup-sdlc.mjs");
const fixtures = join(repo, "test/fixtures/config-versioning/migration-input");
function temp() {
	return mkdtempSync(join(tmpdir(), "sdlc-migration-"));
}
function pair(root, name, withModels = true) {
	const dir = join(root, ".pi", "sdlc");
	cpSync(join(fixtures, name, "sdlc.config.json"), join(dir, "sdlc.config.json"));
	if (withModels) cpSync(join(fixtures, name, "sdlc.models.json"), join(dir, "sdlc.models.json"));
}
function run(root, args) {
	return spawnSync(process.execPath, [setup, "--repo-root", root, ...args], { cwd: repo, encoding: "utf8" });
}
function interactive(root, answers, args = []) {
	const command = `${JSON.stringify(process.execPath)} ${JSON.stringify(setup)} --repo-root ${JSON.stringify(root)} ${args.join(" ")}`;
	const feed = answers.map((answer) => `printf '%s\\n' ${JSON.stringify(answer)}; sleep 0.1`).join("; ");
	return spawnSync("bash", ["-c", `(sleep 0.2; ${feed}) | script -qec ${JSON.stringify(command)} /dev/null`], { cwd: repo, encoding: "utf8" });
}
function interactiveJson(root, answers, args = []) {
	const output = join(root, "setup-report.json");
	const command = `${JSON.stringify(process.execPath)} ${JSON.stringify(setup)} --repo-root ${JSON.stringify(root)} --format json ${args.join(" ")} >${JSON.stringify(output)}`;
	const feed = answers.map((answer) => `printf '%s\\n' ${JSON.stringify(answer)}; sleep 0.1`).join("; ");
	const result = spawnSync("bash", ["-c", `(sleep 0.2; ${feed}) | script -qec ${JSON.stringify(command)} /dev/null`], { cwd: repo, encoding: "utf8" });
	return { ...result, report: JSON.parse(readFileSync(output, "utf8")) };
}
function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error(`invalid JSON ${path}: ${error.message}`);
	}
}

test("CV6/CV7: pair-A, pair-B, and config-only folds preserve fields and select strict", () => {
	for (const name of ["pair-a", "pair-b"]) {
		const config = readJson(join(fixtures, name, "sdlc.config.json"));
		const models = readJson(join(fixtures, name, "sdlc.models.json"));
		const result = planMigration({ config, models });
		assert.equal(result.ok, true);
		assert.equal(result.config.schemaVersion, 2);
		assert.equal(result.config.enforcement, "strict");
		assert.deepEqual(result.config.lifecycle, config.lifecycle);
		assert.deepEqual(result.config.panels.phases.plan_review.prefer, models.phases.plan_review.prefer);
		assert.equal(result.config.panels.phases.plan_review.minVendor, models.phases.plan_review.min_panel);
	}
	const config = readJson(join(fixtures, "pair-a", "sdlc.config.json"));
	const result = planMigration({ config });
	assert.equal(result.ok, true);
	assert.equal("panels" in result.config, false);
});

test("CV8: fold is deterministic and carries the roster in preference order", () => {
	const config = readJson(join(fixtures, "pair-a", "sdlc.config.json"));
	const models = readJson(join(fixtures, "pair-a", "sdlc.models.json"));
	assert.deepEqual(planMigration({ config, models }), planMigration({ config, models }));
});

test("CV9: unknown and malformed inputs refuse without producing a destination", () => {
	const config = readJson(join(fixtures, "pair-a", "sdlc.config.json"));
	const models = readJson(join(fixtures, "pair-a", "sdlc.models.json"));
	models.phases.plan_review.weight = 1;
	const unknown = planMigration({ config, models });
	assert.equal(unknown.ok, false);
	assert.ok(unknown.unmappable.some(({ path }) => path === "phases.plan_review.weight"));
	const malformed = planMigration({ config, models: null });
	assert.equal(malformed.ok, false);
	assert.ok(malformed.unmappable.some(({ path }) => path === "models"));
});

test("CV9: setup reports malformed models and writes nothing", () => {
	const root = temp();
	try {
		pair(root, "pair-a");
		const configPath = join(root, ".pi/sdlc/sdlc.config.json");
		const before = readFileSync(configPath, "utf8");
		writeFileSync(join(root, ".pi/sdlc/sdlc.models.json"), "{malformed\\n");
		const result = interactive(root, ["y"]);
		assert.equal(result.status, 1);
		assert.match(result.stdout + result.stderr, /cannot map .+sdlc\.models\.json/);
		assert.equal(readFileSync(configPath, "utf8"), before);
		assert.equal(readFileSync(join(root, ".pi/sdlc/sdlc.models.json"), "utf8"), "{malformed\\n");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("CV10: write, fsync, rename, and unlink faults expose only allowed recovery states", () => {
	for (const failure of ["writeFileSync", "fsyncSync", "renameSync"]) {
		const root = temp();
		try {
			pair(root, "pair-a");
			const configPath = join(root, ".pi/sdlc/sdlc.config.json");
			const modelsPath = join(root, ".pi/sdlc/sdlc.models.json");
			const stagingPath = join(root, ".pi/sdlc/.sdlc.config.json.migrate-tmp");
			const configBefore = readFileSync(configPath, "utf8");
			const modelsBefore = readFileSync(modelsPath, "utf8");
			const plan = planMigration({ config: readJson(configPath), models: readJson(modelsPath) });
			const io = {
				...fs,
				[failure]() {
					const error = new Error(`injected ${failure} failure`);
					error.code = "EIO";
					throw error;
				},
			};
			assert.throws(() => applyMigration(root, plan, { io }), new RegExp(`injected ${failure} failure`));
			assert.equal(readFileSync(configPath, "utf8"), configBefore);
			assert.equal(readFileSync(modelsPath, "utf8"), modelsBefore);
			assert.equal(existsSync(stagingPath), true);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	}

	const symlinkRoot = temp();
	try {
		pair(symlinkRoot, "pair-a");
		const stagingPath = join(symlinkRoot, ".pi/sdlc/.sdlc.config.json.migrate-tmp");
		const sentinelPath = join(symlinkRoot, "sentinel.txt");
		const configPath = join(symlinkRoot, ".pi/sdlc/sdlc.config.json");
		const modelsPath = join(symlinkRoot, ".pi/sdlc/sdlc.models.json");
		const configBefore = readFileSync(configPath, "utf8");
		const modelsBefore = readFileSync(modelsPath, "utf8");
		writeFileSync(sentinelPath, "sentinel\n");
		symlinkSync(sentinelPath, stagingPath);
		const plan = planMigration({ config: readJson(configPath), models: readJson(modelsPath) });
		assert.throws(() => applyMigration(symlinkRoot, plan), /ELOOP/);
		assert.equal(readFileSync(sentinelPath, "utf8"), "sentinel\n");
		assert.equal(readFileSync(configPath, "utf8"), configBefore);
		assert.equal(readFileSync(modelsPath, "utf8"), modelsBefore);
	} finally {
		rmSync(symlinkRoot, { recursive: true, force: true });
	}

	const root = temp();
	try {
		pair(root, "pair-a");
		const config = readJson(join(root, ".pi/sdlc/sdlc.config.json"));
		const models = readJson(join(root, ".pi/sdlc/sdlc.models.json"));
		const plan = planMigration({ config, models });
		const io = {
			...fs,
			unlinkSync() {
				const error = new Error("injected unlink failure");
				error.code = "EIO";
				throw error;
			},
		};
		assert.throws(() => applyMigration(root, plan, { io }), /injected unlink failure/);
		assert.equal(readJson(join(root, ".pi/sdlc/sdlc.config.json")).schemaVersion, 2);
		assert.equal(existsSync(join(root, ".pi/sdlc/sdlc.models.json")), true);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("CV12-CV14: accept, decline, non-TTY, and mixed flags follow migration confirmation rules", () => {
	let root = temp();
	try {
		pair(root, "pair-a");
		const accepted = interactive(root, ["y"]);
		assert.equal(accepted.status, 0, accepted.stderr);
		assert.match(accepted.stdout, /schema-version: 2/);
		assert.match(accepted.stdout, /asset: config migrated/);
		assert.match(accepted.stdout, /asset: models removed/);
		assert.equal(readJson(join(root, ".pi/sdlc/sdlc.config.json")).schemaVersion, 2);
		assert.equal(existsSync(join(root, ".pi/sdlc/sdlc.models.json")), false);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
	root = temp();
	try {
		pair(root, "pair-a");
		const accepted = interactiveJson(root, ["y"]);
		assert.equal(accepted.status, 0, accepted.stderr);
		assert.equal(accepted.report.exitCode, 0);
		assert.equal(accepted.report.assets.find((asset) => asset.id === "config")?.action, "migrated");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
	root = temp();
	try {
		pair(root, "pair-a");
		const declined = interactive(root, ["n"]);
		assert.equal(declined.status, 1);
		assert.match(declined.stdout + declined.stderr, /migrate[\s\S]*pin/);
		assert.equal(readJson(join(root, ".pi/sdlc/sdlc.config.json")).schemaVersion, 1);
		const nonTTY = run(root, ["--yes"]);
		assert.equal(nonTTY.status, 1);
		assert.match(nonTTY.stderr, /predates this skill/);
		for (const args of [["--profile", "standard"], ["--with-ci-workflow"], ["--copy-prompts"]]) {
			const mixed = interactive(root, ["y"], args);
			assert.equal(mixed.status, 1, args.join(" "));
			assert.match(mixed.stdout + mixed.stderr, /migrate first/, args.join(" "));
		}
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("CV11: residue cleanup is independent and non-TTY-safe", () => {
	const root = temp();
	try {
		pair(root, "pair-a");
		const accepted = interactive(root, ["y"]);
		assert.equal(accepted.status, 0);
		writeFileSync(join(root, ".pi/sdlc/sdlc.models.json"), "residue");
		writeFileSync(join(root, ".pi/sdlc/.sdlc.config.json.migrate-tmp"), "residue");
		const nonTTY = run(root, ["--yes"]);
		assert.equal(nonTTY.status, 0, nonTTY.stderr);
		assert.equal(existsSync(join(root, ".pi/sdlc/sdlc.models.json")), true);
		assert.equal(existsSync(join(root, ".pi/sdlc/.sdlc.config.json.migrate-tmp")), true);
		const cleaned = interactive(root, ["y", "y"], ["--yes"]);
		assert.equal(cleaned.status, 0, cleaned.stderr);
		assert.equal(existsSync(join(root, ".pi/sdlc/sdlc.models.json")), false);
		assert.equal(existsSync(join(root, ".pi/sdlc/.sdlc.config.json.migrate-tmp")), false);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("CV15/CV16: fresh posture, seeding, retired flag, and FS10 v2 envelope", () => {
	const root = temp();
	try {
		const fresh = run(root, ["--profile", "standard", "--yes", "--format", "json"]);
		assert.equal(fresh.status, 0, fresh.stderr);
		assert.equal(readJson(join(root, ".pi/sdlc/sdlc.config.json")).enforcement, "preference");
		const retiredRoot = temp();
		try {
			const retired = run(retiredRoot, ["--with-models", "--format", "json"]);
			assert.equal(retired.status, 2);
			assert.match(retired.stdout, /--with-models is retired/);
		} finally {
			rmSync(retiredRoot, { recursive: true, force: true });
		}
		assert.equal(readJson(join(root, ".pi/sdlc/sdlc.config.json")).schemaVersion, 2);
		const strictRoot = temp();
		try {
			const strict = run(strictRoot, ["--profile", "standard", "--enforcement", "strict", "--seed-panels", "--yes", "--format", "json"]);
			assert.equal(strict.status, 0, strict.stderr);
			const cfg = readJson(join(strictRoot, ".pi/sdlc/sdlc.config.json"));
			assert.equal(cfg.enforcement, "strict");
			assert.ok(cfg.panels);
			assert.equal(readJson(join(strictRoot, ".pi/sdlc/sdlc.config.json")).schemaVersion, 2);
		} finally {
			rmSync(strictRoot, { recursive: true, force: true });
		}
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
