// ASD14/ASD15 (DoD 11): FS11 classification + structural discovery. Every
// inventory row carries a valid class; all six taxonomy values are represented;
// structural discovery over the §16 roots minus the closed exclusion list finds
// a row for every public artifact. Non-vacuity: an undocumented public artifact
// under a discovery root, or a removed row, fails discovery. Offline; no models.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const CHECKER = join(repo, "skills", "sdlc", "scripts", "check-references.mjs");
const inventory = JSON.parse(readFileSync(join(repo, "skills", "sdlc", "assets", "normative-references.json"), "utf8"));
const CLASSES = ["package-public", "delegated", "runtime-tool", "consumer-integration", "optional-enhancement", "internal"];

const runChecker = (args) => {
	try {
		return { status: 0, stdout: execFileSync("node", [CHECKER, ...args], { encoding: "utf8" }) };
	} catch (e) {
		return { status: e.status, stdout: e.stdout ?? "" };
	}
};

test("ASD14: every inventory row carries a valid class", () => {
	for (const row of inventory.sources) {
		assert.ok(CLASSES.includes(row.class), `${row.id} has invalid/absent class: ${row.class}`);
	}
});

test("ASD14: all six taxonomy values are represented across the inventory", () => {
	const present = new Set(inventory.sources.map((r) => r.class));
	for (const cls of CLASSES) assert.ok(present.has(cls), `taxonomy class not represented: ${cls}`);
});

test("ASD14: the live inventory passes structural discovery with a row for every public artifact", () => {
	const res = runChecker(["--package-root", repo, "--format", "json"]);
	assert.equal(res.status, 0, res.stdout);
	const report = JSON.parse(res.stdout);
	const discovery = report.checks.filter((c) => c.id.startsWith("discovery."));
	assert.ok(discovery.length > 0, "discovery must run over the frozen roots");
	assert.ok(!discovery.some((c) => c.status === "fail"), "no discovered public artifact may lack a row");
	// the six standalone entrypoints and the seven references are all discovered + covered
	for (const slug of ["brainstorm", "plan", "spec", "tasks", "implement", "pr-review"]) {
		assert.ok(
			discovery.some((c) => c.id === `discovery.templates/sdlc-${slug}.md` && c.status === "pass"),
			`entrypoint not covered: ${slug}`,
		);
	}
});

// ---- ASD15 non-vacuity via a self-contained fixture package ---------------

function fixturePackage() {
	const root = mkdtempSync(join(tmpdir(), "fs11-"));
	mkdirSync(join(root, "skills", "sdlc", "references"), { recursive: true });
	writeFileSync(join(root, "skills", "sdlc", "references", "system-reference.md"), "# pi-sdlc system reference\n");
	const inv = {
		schemaVersion: 1,
		package: "pi-sdlc",
		discovery: { roots: ["skills/sdlc/references/*.md"], exclude: [] },
		sources: [{ id: "reference.system", source: "skills/sdlc/references/system-reference.md", assertion: "# pi-sdlc system reference", targetKind: "file", ownership: "package", required: true, resolution: "package", target: "skills/sdlc/references/system-reference.md", class: "package-public" }],
	};
	writeFileSync(join(root, "inv.json"), JSON.stringify(inv));
	return { root, invPath: join(root, "inv.json") };
}

test("ASD15: a valid fixture passes; an undocumented artifact under a discovery root fails", () => {
	const { root, invPath } = fixturePackage();
	try {
		assert.equal(runChecker(["--package-root", root, "--inventory", invPath]).status, 0, "baseline fixture must pass");
		// add a public artifact under the discovery root with no inventory row
		writeFileSync(join(root, "skills", "sdlc", "references", "phase-rogue.md"), "# rogue\n");
		const res = runChecker(["--package-root", root, "--inventory", invPath, "--format", "json"]);
		assert.equal(res.status, 1, "an undocumented discovered artifact must fail");
		const report = JSON.parse(res.stdout);
		assert.ok(
			report.checks.some((c) => c.id === "discovery.skills/sdlc/references/phase-rogue.md" && c.status === "fail"),
			"the rogue file must fail discovery non-vacuously",
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("ASD15: removing a row for a still-present public artifact fails discovery", () => {
	const { root, invPath } = fixturePackage();
	try {
		// drop the only row but keep the file on disk
		const inv = JSON.parse(readFileSync(invPath, "utf8"));
		inv.sources = [{ id: "placeholder.row", source: "inv.json", assertion: "pi-sdlc", targetKind: "file", ownership: "package", required: true, resolution: "package", target: "inv.json", class: "internal" }];
		writeFileSync(invPath, JSON.stringify(inv));
		const res = runChecker(["--package-root", root, "--inventory", invPath, "--format", "json"]);
		assert.equal(res.status, 1, "a present artifact with no row must fail");
		const report = JSON.parse(res.stdout);
		assert.ok(report.checks.some((c) => c.id === "discovery.skills/sdlc/references/system-reference.md" && c.status === "fail"));
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
