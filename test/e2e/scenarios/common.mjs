// Shared helpers for the L2 scenarios (T4).

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildChildEnv, commitConsumer, installPackage, installedScript, makeConsumer, runProcess } from "../harness.mjs";
import { DEFAULT_SENTINEL } from "../scenario-format.mjs";

/** Deterministic consumer path for a named scenario (matches makeConsumer). */
export function consumerPath(sandbox, name) {
	return join(sandbox.dir, "consumers", name);
}

/** A bash-tool `command` string that runs an installed script from the consumer cwd. */
export function installedCmd(sandbox, script, args) {
	return ["node", installedScript(sandbox, script), ...args].join(" ");
}

/**
 * Set the scratch auth.json to exactly the given credentialed providers (offline;
 * resolve-panel only reads provider keys, never calls the API). Pass [] to clear.
 */
export async function setCredentialedProviders(sandbox, providers) {
	const obj = {};
	for (const provider of providers) obj[provider] = { type: "api", key: "offline-dummy" };
	await writeFile(join(sandbox.home, ".pi", "agent", "auth.json"), `${JSON.stringify(obj, null, 2)}\n`);
}

/**
 * Create a scratch consumer and adopt the sdlc via the installed setup-sdlc with
 * the given argv (or write a raw config for the v2 case). Optionally commit so
 * adoption/manifest checks see HEAD.
 */
export async function adopt(sandbox, name, { setupArgs, rawConfig, commit = true } = {}) {
	const consumer = await makeConsumer(sandbox, name);
	const env = buildChildEnv(sandbox);
	// Install the staged package into THIS consumer so pi genuinely discovers the
	// skill here (the L2 discovery gate depends on the install-root skill location
	// appearing in this consumer's system prompt — not just the file existing).
	const install = await installPackage(sandbox, consumer);
	if (install.code !== 0) throw new Error(`pi install failed for ${name}: ${install.stderr || install.stdout}`);
	if (rawConfig !== undefined) {
		await runProcess(["mkdir", "-p", join(consumer, ".pi", "sdlc")], { env });
		await writeFile(join(consumer, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(rawConfig, null, 2)}\n`);
	} else if (setupArgs) {
		const result = await runProcess(["node", installedScript(sandbox, "setup-sdlc.mjs"), ...setupArgs, "--yes", "--format", "json", "--repo-root", consumer], { env, timeoutMs: 60000 });
		if (result.code !== 0) throw new Error(`setup-sdlc failed for ${name}: ${result.stderr || result.stdout}`);
	}
	if (commit) await commitConsumer(sandbox, consumer);
	return consumer;
}

/** Concatenate every tool-result message body across the recorded puppet requests. */
export function toolResultBlocks(record) {
	const blocks = [];
	for (const request of record.requests ?? []) {
		for (const message of request.messages ?? []) {
			if (message.role === "tool") blocks.push(typeof message.content === "string" ? message.content : JSON.stringify(message.content));
		}
	}
	return blocks;
}

/**
 * Concatenate the scenario's tool-result blocks, EXCLUDING the loader's
 * SKILL.md read (identified by the sentinel it contains). Prevents SKILL prose —
 * which legitimately mentions model names, dial values, and state names — from
 * satisfying a scenario's `mustMatch`/`mustNotMatch` by accident.
 */
export function toolResults(record) {
	return toolResultBlocks(record)
		.filter((block) => !block.includes(DEFAULT_SENTINEL))
		.join("\n");
}

/**
 * The parsed-shaped tool-result block from an installed status/lifecycle script:
 * the block that carries a JSON `"state"` key. Excludes the loader's SKILL.md
 * read (prose that legitimately documents state names and unrelated terms).
 */
export function statusResult(record) {
	return toolResultBlocks(record)
		.filter((block) => /"state"\s*:/.test(block))
		.join("\n");
}

/** The default announce string a fresh (config-less) repo would use if it wrongly announced. */
export const DEFAULT_ANNOUNCE = "Using the sdlc skill to drive this change through its lifecycle";

/** Read a consumer's committed sdlc config (throws if absent/invalid). */
export async function readConsumerConfig(consumer) {
	const { readFile } = await import("node:fs/promises");
	return JSON.parse(await readFile(join(consumer, ".pi", "sdlc", "sdlc.config.json"), "utf8"));
}

/** Assert a `shape.<key>` dial in the committed config equals `expected`. */
export async function assertShapeDial(consumer, key, expected) {
	const config = await readConsumerConfig(consumer);
	if (config.shape?.[key] !== expected) throw new Error(`shape.${key} = ${JSON.stringify(config.shape?.[key])}, expected ${JSON.stringify(expected)}`);
}
