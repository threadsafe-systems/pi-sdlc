// migrate.mjs — pure config migration planning and setup-only staged writes.
// The registry is the forward-composition seam for later schema migrations.

import { closeSync, constants, fsyncSync, openSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_SCHEMA_VERSION, PHASES, inspectConfig } from "./lib.mjs";

const CONFIG_V1_KEYS = new Set(["schemaVersion", "prefix", "labelPrefix", "announce", "paths", "tracker", "hooks", "lifecycle"]);
const MODELS_V1_KEYS = new Set(["$comment", "author_default", "rules", "phases"]);
const PHASE_V1_KEYS = new Set(["min_panel", "prefer"]);
const PM_RE = /^[^/]+\/.+$/;

function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(path, message) {
	return { path, message };
}

function inspectV1Models(models) {
	const issues = [];
	if (!isPlainObject(models)) return [issue("models", "models must be a JSON object")];
	for (const key of Object.keys(models)) {
		if (!MODELS_V1_KEYS.has(key)) issues.push(issue(key, `unknown models key '${key}'`));
	}
	if (models.$comment !== undefined && typeof models.$comment !== "string") issues.push(issue("$comment", "$comment cannot be carried because schemaVersion 2 requires a string"));
	if (models.author_default !== undefined && (typeof models.author_default !== "string" || !PM_RE.test(models.author_default))) {
		issues.push(issue("author_default", "author_default must be provider/model"));
	}
	if (models.rules !== undefined) {
		if (!isPlainObject(models.rules)) issues.push(issue("rules", "rules must be an object"));
		else {
			for (const key of Object.keys(models.rules)) {
				if (key !== "exclude_author_vendor") issues.push(issue(`rules.${key}`, `unknown rules key '${key}'`));
			}
			if (models.rules.exclude_author_vendor !== undefined && typeof models.rules.exclude_author_vendor !== "boolean") {
				issues.push(issue("rules.exclude_author_vendor", "rules.exclude_author_vendor must be boolean"));
			}
		}
	}
	if (!isPlainObject(models.phases)) {
		issues.push(issue("phases", "phases must be an object"));
		return issues;
	}
	for (const phase of Object.keys(models.phases)) {
		if (!PHASES.includes(phase)) issues.push(issue(`phases.${phase}`, `unknown models phase '${phase}'`));
	}
	for (const phase of PHASES) {
		const value = models.phases[phase];
		const at = `phases.${phase}`;
		if (value === undefined) {
			issues.push(issue(at, `${at} is required`));
			continue;
		}
		if (!isPlainObject(value)) {
			issues.push(issue(at, `${at} must be an object`));
			continue;
		}
		for (const key of Object.keys(value)) {
			if (!PHASE_V1_KEYS.has(key)) issues.push(issue(`${at}.${key}`, `unknown key ${at}.${key}`));
		}
		if (value.min_panel !== undefined && (!Number.isInteger(value.min_panel) || value.min_panel < 1)) {
			issues.push(issue(`${at}.min_panel`, `${at}.min_panel must be an integer >= 1`));
		}
		if (!Array.isArray(value.prefer) || value.prefer.length === 0) issues.push(issue(`${at}.prefer`, `${at}.prefer must be a non-empty array`));
		else {
			value.prefer.forEach((model, index) => {
				if (typeof model !== "string" || !PM_RE.test(model)) issues.push(issue(`${at}.prefer[${index}]`, `${at}.prefer entries must be provider/model`));
			});
		}
	}
	return issues;
}

function foldV1toV2({ config, models }) {
	const unmappable = [];
	if (!isPlainObject(config)) return { ok: false, unmappable: [issue("config", "config must be a JSON object")] };
	for (const key of Object.keys(config)) {
		if (!CONFIG_V1_KEYS.has(key)) unmappable.push(issue(key, `unknown config key '${key}'`));
	}
	if (config.schemaVersion !== 1) unmappable.push(issue("schemaVersion", `expected source schemaVersion 1 (got ${JSON.stringify(config.schemaVersion)})`));

	const migrated = { schemaVersion: 2 };
	for (const key of ["prefix", "labelPrefix", "announce", "paths", "tracker", "hooks", "lifecycle"]) {
		if (Object.hasOwn(config, key)) migrated[key] = structuredClone(config[key]);
	}
	migrated.enforcement = "strict";

	if (models !== undefined) {
		unmappable.push(...inspectV1Models(models));
		if (isPlainObject(models)) {
			const panels = {};
			if (Object.hasOwn(models, "$comment")) panels.$comment = structuredClone(models.$comment);
			if (Object.hasOwn(models, "author_default")) panels.authorDefault = structuredClone(models.author_default);
			if (isPlainObject(models.rules) && Object.hasOwn(models.rules, "exclude_author_vendor")) {
				panels.rules = { excludeAuthorVendor: structuredClone(models.rules.exclude_author_vendor) };
			}
			if (isPlainObject(models.phases)) {
				panels.phases = {};
				for (const phase of PHASES) {
					const source = models.phases[phase];
					if (!isPlainObject(source)) continue;
					const target = {};
					if (Object.hasOwn(source, "min_panel")) target.minVendor = structuredClone(source.min_panel);
					if (Object.hasOwn(source, "prefer")) target.prefer = structuredClone(source.prefer);
					panels.phases[phase] = target;
				}
			}
			migrated.panels = panels;
		}
	}

	// The destination validator catches every type/shape mismatch in carried
	// config data. Unknown v1 keys were collected separately because they are
	// deliberately not copied into the destination.
	for (const destinationIssue of inspectConfig(migrated)) {
		if (!unmappable.some(({ path, message }) => path === destinationIssue.path && message === destinationIssue.message)) unmappable.push(destinationIssue);
	}
	if (unmappable.length > 0) return { ok: false, unmappable };
	return { ok: true, config: migrated, notes: [models === undefined ? "no models file present; panels omitted" : "folded the models roster into panels"] };
}

const FORWARD_MIGRATIONS = new Map([[1, foldV1toV2]]);

export function planMigration({ config, models }) {
	const from = isPlainObject(config) && Number.isInteger(config.schemaVersion) ? config.schemaVersion : undefined;
	if (from === undefined) return { ok: false, unmappable: [issue("schemaVersion", "cannot determine a recognised source schemaVersion")] };
	if (from >= CONFIG_SCHEMA_VERSION) return { ok: false, unmappable: [issue("schemaVersion", `no forward migration from schemaVersion ${from} to ${CONFIG_SCHEMA_VERSION}`)] };
	let state = { config, models };
	let version = from;
	const notes = [];
	while (version < CONFIG_SCHEMA_VERSION) {
		const step = FORWARD_MIGRATIONS.get(version);
		if (!step) return { ok: false, unmappable: [issue("schemaVersion", `no registered forward migration from schemaVersion ${version}`)] };
		const result = step(state);
		if (!result.ok) return result;
		state = { config: result.config, models: undefined };
		notes.push(...result.notes);
		version = result.config.schemaVersion;
	}
	return { ok: true, from, to: version, config: state.config, notes };
}

const DEFAULT_IO = { closeSync, fsyncSync, openSync, renameSync, unlinkSync, writeFileSync };

function fsyncDirectory(directory, io) {
	const fd = io.openSync(directory, "r");
	try {
		io.fsyncSync(fd);
	} finally {
		io.closeSync(fd);
	}
}

// Optional IO injection is test-only plumbing for fault-boundary proof. The
// production caller uses the two-argument API and the synchronous fs methods.
export function applyMigration(root, plan, { io = DEFAULT_IO } = {}) {
	if (!plan?.ok || plan.to !== CONFIG_SCHEMA_VERSION) throw new TypeError("applyMigration requires a successful plan targeting the current schemaVersion");
	const directory = join(root, ".pi", "sdlc");
	const configPath = join(directory, "sdlc.config.json");
	const modelsPath = join(directory, "sdlc.models.json");
	const stagingPath = join(directory, ".sdlc.config.json.migrate-tmp");
	const content = `${JSON.stringify(plan.config, null, 2)}\n`;
	const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW;
	const fd = io.openSync(stagingPath, flags, 0o600);
	try {
		io.writeFileSync(fd, content, "utf8");
		io.fsyncSync(fd);
	} finally {
		io.closeSync(fd);
	}
	io.renameSync(stagingPath, configPath);
	fsyncDirectory(directory, io);
	let modelsRemoved = false;
	try {
		io.unlinkSync(modelsPath);
		modelsRemoved = true;
	} catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
	if (modelsRemoved) fsyncDirectory(directory, io);
	return { configPath, modelsPath, stagingPath, modelsRemoved };
}
