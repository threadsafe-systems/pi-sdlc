// Offline unit tests for check-completion.mjs (retro W1/H2, batch-1 BT1).
// git/gh are injected fakes — no real spawn, no network, fully deterministic,
// matching this repo's offline-test convention despite the script itself
// being a documented, intentional gh-calling exception.

import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { main, parseArgs } from "../skills/sdlc/scripts/check-completion.mjs";

function fixtureRoot() {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-check-completion-"));
	mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
	const config = {
		schemaVersion: 4,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		review: { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "proceed" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
	};
	writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config)}\n`);
	return dir;
}

function checkOf(report, id) {
	return report.checks.find((c) => c.id === id);
}

function fakeGit({ branch = "feat/x", hasUpstream = true, unpushed = 0 } = {}) {
	return (_root, args) => {
		if (args[0] === "rev-parse" && args[1] === "--abbrev-ref" && args.at(-1) === "HEAD") return { code: 0, stdout: branch, stderr: "" };
		if (args[0] === "rev-parse" && args.includes("@{u}")) return hasUpstream ? { code: 0, stdout: `origin/${branch}`, stderr: "" } : { code: 128, stdout: "", stderr: "no upstream" };
		if (args[0] === "rev-list") return { code: 0, stdout: String(unpushed), stderr: "" };
		throw new Error(`unexpected git args: ${args.join(" ")}`);
	};
}

function fakeGhPrOpen({ prs = [{ number: 1, url: "https://example/1", body: "```sdlc\ntrack: reversible\nslug: x\n```\nCloses #77", closingIssuesReferences: [{ number: 77 }] }] } = {}) {
	return (_cwd, args) => {
		if (args[0] === "pr" && args[1] === "list") return { code: 0, stdout: JSON.stringify(prs), stderr: "" };
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
}

test("pr-open: fails when branch has unpushed commits", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--repo-root", root, "--format", "json"], { git: fakeGit({ unpushed: 2 }), gh: fakeGhPrOpen() });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "git.pushed").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: fails when branch has no upstream", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--repo-root", root, "--format", "json"], { git: fakeGit({ hasUpstream: false }), gh: fakeGhPrOpen() });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "git.upstream").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: fails when no open PR is found", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhPrOpen({ prs: [] }) });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "gh.pr-found").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: fails when the PR body has zero declaration blocks", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhPrOpen({ prs: [{ number: 1, url: "u", body: "no block here" }] }) });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "declaration.block").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: fails when the PR body has a duplicate declaration block", () => {
	const root = fixtureRoot();
	const body = "```sdlc\ntrack: reversible\nslug: x\n```\n```sdlc\ntrack: reversible\nslug: x\n```\n";
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhPrOpen({ prs: [{ number: 1, url: "u", body }] }) });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "declaration.block").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: fails when a required Closes reference is missing", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--closes", "77", "--closes", "78", "--repo-root", root, "--format", "json"], {
		git: fakeGit(),
		gh: fakeGhPrOpen({ prs: [{ number: 1, url: "u", body: "```sdlc\ntrack: reversible\nslug: x\n```\nCloses #77", closingIssuesReferences: [{ number: 77 }] }] }),
	});
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "closes:77").status, "pass");
	assert.equal(checkOf(report, "closes:78").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: passes when branch is pushed, one open PR, one valid declaration, all closes present", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--closes", "77", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhPrOpen() });
	assert.equal(report.state, "pass");
	assert.equal(report.exitCode, 0);
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: fails when declaration track or slug does not match the claim", () => {
	const root = fixtureRoot();
	const prs = [{ number: 1, url: "u", body: "```sdlc\ntrack: bogus\nslug: other\n```", closingIssuesReferences: [{ number: 77 }] }];
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--repo-root", root], { git: fakeGit(), gh: fakeGhPrOpen({ prs }) });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "declaration.block").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

function fakeGhEpic({ subIssues = [{ number: 77, state: "CLOSED" }], prState = "MERGED", closingIssuesReferences = [{ number: 77 }] } = {}) {
	return (_cwd, args) => {
		if (args[0] === "repo" && args[1] === "view") return { code: 0, stdout: JSON.stringify({ owner: { login: "threadsafe-systems" }, name: "pi-sdlc" }), stderr: "" };
		if (args[0] === "api" && args[1] === "graphql") return { code: 0, stdout: JSON.stringify({ data: { repository: { issue: { subIssues: { nodes: subIssues, pageInfo: { hasNextPage: false } } } } } }), stderr: "" };
		if (args[0] === "pr" && args[1] === "view") return { code: 0, stdout: JSON.stringify({ state: prState, number: Number(args[2]), closingIssuesReferences }), stderr: "" };
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
}

test("epic-done: fails when a sub-issue is still open", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "epic-done", "--epic", "76", "--pr", "99", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhEpic({ subIssues: [{ number: 77, state: "OPEN" }] }) });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "gh.subissues").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("epic-done: fails when the linked PR is not merged", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "epic-done", "--epic", "76", "--pr", "99", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhEpic({ prState: "OPEN" }) });
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "gh.pr-merged").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("epic-done: passes when all sub-issues are closed and the PR is merged", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "epic-done", "--epic", "76", "--pr", "99", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhEpic() });
	assert.equal(report.state, "pass");
	assert.equal(report.exitCode, 0);
	rmSync(root, { recursive: true, force: true });
});

test("epic-done: fails when the merged PR does not close every epic sub-issue", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "epic-done", "--epic", "76", "--pr", "99", "--repo-root", root, "--format", "json"], {
		git: fakeGit(),
		gh: fakeGhEpic({
			subIssues: [
				{ number: 77, state: "CLOSED" },
				{ number: 78, state: "CLOSED" },
			],
			closingIssuesReferences: [{ number: 77 }],
		}),
	});
	assert.equal(report.state, "fail");
	assert.equal(checkOf(report, "gh.pr-merged").status, "fail");
	rmSync(root, { recursive: true, force: true });
});

test("epic-done: uses the resolved repo-root for every gh call", () => {
	const root = fixtureRoot();
	const seen = [];
	const gh = (cwd, args) => {
		seen.push(cwd);
		return fakeGhEpic()(cwd, args);
	};
	const { report } = main(["--claim", "epic-done", "--epic", "76", "--pr", "99", "--repo-root", root], { cwd: "/tmp", git: fakeGit(), gh });
	assert.equal(report.state, "pass");
	assert.ok(seen.length > 0);
	assert.ok(seen.every((cwd) => cwd === root));
	rmSync(root, { recursive: true, force: true });
});

test("epic-done: errors (not vacuous pass) when the epic has zero sub-issues", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "epic-done", "--epic", "999", "--pr", "99", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhEpic({ subIssues: [] }) });
	assert.equal(report.state, "error");
	assert.equal(checkOf(report, "gh.subissues").status, "error");
	rmSync(root, { recursive: true, force: true });
});

test("pr-open: records a visible note when --closes is omitted", () => {
	const root = fixtureRoot();
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--repo-root", root, "--format", "json"], { git: fakeGit(), gh: fakeGhPrOpen() });
	assert.equal(report.state, "pass");
	assert.equal(checkOf(report, "closes.linkage").status, "pass");
	assert.match(checkOf(report, "closes.linkage").message, /not verified/);
	rmSync(root, { recursive: true, force: true });
});

test("cli: rejects an unknown --claim value", () => {
	const { report } = main(["--claim", "bogus"], {});
	assert.equal(report.state, "error");
});

test("cli: rejects invalid issue numbers without throwing", () => {
	const { report } = main(["--claim", "pr-open", "--slug", "x", "--closes", "77)"]);
	assert.equal(report.state, "error");
	assert.match(checkOf(report, "cli.arguments").message, /positive issue numbers/);
});

test("cli: does not consume a following flag when a value is missing", () => {
	const parsed = parseArgs(["--claim", "pr-open", "--closes", "--slug", "x"]);
	assert.equal(parsed.slug, "x");
	assert.equal(parsed.error, "--closes requires a value");
});
