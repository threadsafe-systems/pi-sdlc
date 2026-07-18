// ASD10 (DoD 8): SKILL.md wires the non-blocking startup freshness check — read
// CONFIG.md when current; a fixed warning + authoritative-JSON fallback on
// missing/stale; branch on the error reason (collision → warn+fallback,
// invalid-config → surface + stop); never trust prose over JSON; and it does not
// change FS8 readiness or FS9 lifecycle-check contracts. Offline grep; no models.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skillMd = readFileSync(join(repo, "skills", "sdlc", "SKILL.md"), "utf8");

// Scope to the startup freshness block.
const start = skillMd.indexOf("Startup freshness check");
const section = skillMd.slice(start, start + 2000);

test("ASD10: startup invokes config-doc check outside FS8 readiness and FS9 completion", () => {
	assert.ok(start >= 0, "SKILL.md must carry the startup freshness check");
	assert.match(section, /config-doc\.sh check/);
	assert.match(section, /outside FS8\s*\n?\s*readiness and FS9 lifecycle completion|outside FS8 readiness and FS9/i);
});

test("ASD10: current reads CONFIG.md; missing/stale emit the fixed warning and fall back to JSON", () => {
	assert.match(section, /`current`.*read `\.pi\/sdlc\/CONFIG\.md`/s);
	assert.match(section, /`missing` or `stale`/);
	assert.match(section, /fixed warning/);
	assert.match(section, /reading sdlc\.config\.json as authoritative/);
	assert.match(section, /read authoritative `sdlc\.config\.json`/);
});

test("ASD10: the error branch splits collision (warn+fallback) from invalid-config (surface + stop)", () => {
	assert.match(section, /`collision`/);
	assert.match(section, /`invalid-config`/);
	assert.match(section, /surface the diagnostic and stop|surface the diagnostic\s*\n?\s*and stop/i);
});

test("ASD10: prose is never authority over JSON, and readiness/lifecycle contracts are unchanged", () => {
	assert.match(section, /Never treat generated prose as authority over JSON/);
	assert.match(skillMd, /No\s*\n?\s*readiness state, FS8 check id\/exit, or FS9 lifecycle-check id changes/);
	assert.match(skillMd, /`CONFIG\.md` is never part of readiness, lifecycle completion, or mandatory CI/);
});

test("FS13 telemetry load trigger is present in the kernel (regression guard)", () => {
	// The relocated telemetry section (system-reference §12) needs a mandatory
	// kernel trigger; lock run.started at startup + the load-and-follow directive.
	assert.match(skillMd, /emit the `run\.started` telemetry event/);
	assert.match(skillMd, /\*\*load and follow\*\* `references\/system-reference\.md`/);
	assert.match(skillMd, /lifecycle telemetry\*\* \(FS13\)/i);
});
