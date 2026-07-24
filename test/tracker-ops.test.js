// Offline unit tests for tracker-ops.mjs (#82/#168). gh is an injected fake —
// no real spawn, no network, fully deterministic, matching this repo's
// offline-test convention (same shape as check-completion.test.js's fakeGh).

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { boardAdd, lookupNode, main, opAddBlockedBy, opClaim, opCreateEpicOrTask, opFindItems, opFrontier, opSetStatus } from "../skills/sdlc/scripts/tracker-ops.mjs";

const SCRIPT = new URL("../skills/sdlc/scripts/tracker-ops.mjs", import.meta.url).pathname;

function fixtureRoot() {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-tracker-ops-"));
	mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
	const config = {
		schemaVersion: 3,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		tracker: { repo: "owner/repo", board: { number: 5, url: "https://github.com/orgs/owner/projects/5" } },
	};
	writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config)}\n`);
	return dir;
}

const TOK = { labelPrefix: "sdlc", repo: "owner/repo", owner: "owner", name: "repo", boardNumber: 5, boardOwner: "owner" };

function queryOf(args) {
	const q = args.find((a) => a.startsWith("query="));
	return q ? q.slice("query=".length) : "";
}

test.after(() => {});

// ---- lookup-node -----------------------------------------------------------

test("lookup-node: returns nodeId/number/title on success", () => {
	const root = fixtureRoot();
	const gh = (_cwd, args) => {
		assert.equal(args[0], "api");
		assert.match(queryOf(args), /issue\(number:\$n\)/);
		return { code: 0, stdout: JSON.stringify({ data: { repository: { issue: { id: "I_1", number: 42, title: "Some issue" } } } }), stderr: "" };
	};
	const r = lookupNode({ root, gh, owner: "owner", name: "repo", number: 42 });
	assert.deepEqual(r, { ok: true, nodeId: "I_1", number: 42, title: "Some issue" });
	rmSync(root, { recursive: true, force: true });
});

test("lookup-node: not found -> ok:false", () => {
	const root = fixtureRoot();
	const gh = () => ({ code: 0, stdout: JSON.stringify({ data: { repository: { issue: null } } }), stderr: "" });
	const r = lookupNode({ root, gh, owner: "owner", name: "repo", number: 999 });
	assert.equal(r.ok, false);
	assert.match(r.reason, /not found/);
	rmSync(root, { recursive: true, force: true });
});

test("lookup-node: gh failure -> structured ok:false, never throws", () => {
	const root = fixtureRoot();
	const gh = () => ({ code: 1, stdout: "", stderr: "graphql: rate limited" });
	const r = lookupNode({ root, gh, owner: "owner", name: "repo", number: 1 });
	assert.equal(r.ok, false);
	assert.match(r.reason, /rate limited/);
	rmSync(root, { recursive: true, force: true });
});

// ---- create-epic / create-task ---------------------------------------------

function fakeGhCreate({ createdNumber = 100, parentNumber = 50 } = {}) {
	return (_cwd, args) => {
		if (args[0] === "issue" && args[1] === "create") return { code: 0, stdout: `https://github.com/owner/repo/issues/${createdNumber}`, stderr: "" };
		if (args[0] === "api" && /addSubIssue/.test(queryOf(args))) return { code: 0, stdout: JSON.stringify({ data: { addSubIssue: { subIssue: { number: createdNumber, title: "t" } } } }), stderr: "" };
		if (args[0] === "api" && /issue\(number:\$n\)/.test(queryOf(args))) {
			const nArg = args.find((a) => a.startsWith("n="));
			const n = Number(nArg.slice(2));
			const number = n === parentNumber ? parentNumber : createdNumber;
			return { code: 0, stdout: JSON.stringify({ data: { repository: { issue: { id: `I_${number}`, number, title: "t" } } } }), stderr: "" };
		}
		if (args[0] === "project" && args[1] === "item-add") return { code: 0, stdout: JSON.stringify({ id: "PVTI_new" }), stderr: "" };
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
}

test("create-epic: creates, looks up node, boards — returns {number,nodeId,itemId,url}", () => {
	const root = fixtureRoot();
	const gh = fakeGhCreate({ createdNumber: 200 });
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "Epic title", body: "body", extraLabels: [], kind: "epic" });
	assert.deepEqual(r, { ok: true, number: 200, nodeId: "I_200", itemId: "PVTI_new", url: "https://github.com/owner/repo/issues/200" });
	rmSync(root, { recursive: true, force: true });
});

test("create-task: with --parent wires addSubIssue before boarding", () => {
	const root = fixtureRoot();
	const gh = fakeGhCreate({ createdNumber: 201, parentNumber: 50 });
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "Task title", body: "body", extraLabels: ["extra"], parent: 50, kind: "task" });
	assert.equal(r.ok, true);
	assert.equal(r.number, 201);
	rmSync(root, { recursive: true, force: true });
});

test("create-epic: gh issue create failure short-circuits before any board mutation", () => {
	const root = fixtureRoot();
	let boardCalled = false;
	const gh = (_cwd, args) => {
		if (args[0] === "issue" && args[1] === "create") return { code: 1, stdout: "", stderr: "permission denied" };
		if (args[0] === "project") boardCalled = true;
		return { code: 0, stdout: "{}", stderr: "" };
	};
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "t", body: "b", extraLabels: [], kind: "epic" });
	assert.equal(r.ok, false);
	assert.match(r.reason, /permission denied/);
	assert.equal(boardCalled, false);
	rmSync(root, { recursive: true, force: true });
});

// ---- add-blocked-by ---------------------------------------------------------

test("add-blocked-by: wires the dependency edge", () => {
	const root = fixtureRoot();
	const gh = (_cwd, args) => {
		if (/issue\(number:\$n\)/.test(queryOf(args))) {
			const n = Number(args.find((a) => a.startsWith("n=")).slice(2));
			return { code: 0, stdout: JSON.stringify({ data: { repository: { issue: { id: `I_${n}`, number: n, title: "t" } } } }), stderr: "" };
		}
		if (/addBlockedBy/.test(queryOf(args))) return { code: 0, stdout: JSON.stringify({ data: { addBlockedBy: { issue: { number: 2 }, blockingIssue: { number: 1 } } } }), stderr: "" };
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
	const r = opAddBlockedBy({ root, gh, tok: TOK, issue: 2, blocking: 1 });
	assert.deepEqual(r, { ok: true, issue: 2, blocking: 1 });
	rmSync(root, { recursive: true, force: true });
});

// ---- frontier ---------------------------------------------------------------

test("frontier: open + unassigned + unblocked (or no blockers) children only", () => {
	const root = fixtureRoot();
	const nodes = [
		{ number: 1, title: "open unassigned unblocked", state: "OPEN", assignees: { nodes: [] }, blockedBy: { nodes: [] } },
		{ number: 2, title: "open unassigned blocked-open", state: "OPEN", assignees: { nodes: [] }, blockedBy: { nodes: [{ number: 1, state: "OPEN" }] } },
		{ number: 3, title: "open assigned", state: "OPEN", assignees: { nodes: [{ login: "someone" }] }, blockedBy: { nodes: [] } },
		{ number: 4, title: "closed", state: "CLOSED", assignees: { nodes: [] }, blockedBy: { nodes: [] } },
		{ number: 5, title: "open unassigned all-closed-blockers", state: "OPEN", assignees: { nodes: [] }, blockedBy: { nodes: [{ number: 1, state: "CLOSED" }] } },
	];
	const gh = () => ({ code: 0, stdout: JSON.stringify({ data: { repository: { issue: { subIssues: { nodes, pageInfo: { hasNextPage: false } } } } } }), stderr: "" });
	const r = opFrontier({ root, gh, tok: TOK, parent: 10 });
	assert.equal(r.ok, true);
	assert.deepEqual(
		r.items.map((i) => i.number),
		[1, 5],
	);
	rmSync(root, { recursive: true, force: true });
});

test("frontier: refuses an incomplete page rather than silently truncating", () => {
	const root = fixtureRoot();
	const gh = () => ({ code: 0, stdout: JSON.stringify({ data: { repository: { issue: { subIssues: { nodes: [], pageInfo: { hasNextPage: true } } } } } }), stderr: "" });
	const r = opFrontier({ root, gh, tok: TOK, parent: 10 });
	assert.equal(r.ok, false);
	assert.match(r.reason, /more than 100/);
	rmSync(root, { recursive: true, force: true });
});

// ---- claim --------------------------------------------------------------

test("claim: unclaimed issue gets assigned", () => {
	const root = fixtureRoot();
	let editArgs;
	const gh = (_cwd, args) => {
		if (args[0] === "issue" && args[1] === "view") return { code: 0, stdout: JSON.stringify({ assignees: [] }), stderr: "" };
		if (args[0] === "issue" && args[1] === "edit") {
			editArgs = args;
			return { code: 0, stdout: "", stderr: "" };
		}
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
	const r = opClaim({ root, gh, tok: TOK, issue: 7, login: "neilwashere" });
	assert.deepEqual(r, { ok: true, claimed: true });
	assert.ok(editArgs.includes("--add-assignee"));
	rmSync(root, { recursive: true, force: true });
});

test("claim: already-assigned issue is not re-claimed (best-effort, not atomic)", () => {
	const root = fixtureRoot();
	const gh = (_cwd, args) => {
		if (args[0] === "issue" && args[1] === "view") return { code: 0, stdout: JSON.stringify({ assignees: [{ login: "someone-else" }] }), stderr: "" };
		throw new Error(`unexpected gh args (should not edit): ${args.join(" ")}`);
	};
	const r = opClaim({ root, gh, tok: TOK, issue: 7, login: "neilwashere" });
	assert.equal(r.ok, true);
	assert.equal(r.claimed, false);
	assert.match(r.reason, /someone-else/);
	rmSync(root, { recursive: true, force: true });
});

// ---- find-items ---------------------------------------------------------

function fakeItemList(items) {
	return (_cwd, args) => {
		if (args[0] === "project" && args[1] === "item-list") return { code: 0, stdout: JSON.stringify({ items, totalCount: items.length }), stderr: "" };
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
}

const SAMPLE_ITEMS = [
	{ id: "PVTI_1", status: "Todo", labels: ["sdlc:build-task"], content: { number: 1, title: "Alpha task" } },
	{ id: "PVTI_2", status: "Done", labels: ["sdlc:epic"], content: { number: 2, title: "Beta epic" } },
	{ id: "PVTI_3", status: "Todo", labels: [], content: { number: 3, title: "Gamma alpha thing" } },
];

test("find-items: filters by number", () => {
	const root = fixtureRoot();
	const r = opFindItems({ root, gh: fakeItemList(SAMPLE_ITEMS), tok: TOK, number: 2 });
	assert.equal(r.ok, true);
	assert.equal(r.items.length, 1);
	assert.equal(r.items[0].number, 2);
	rmSync(root, { recursive: true, force: true });
});

test("find-items: filters by status", () => {
	const root = fixtureRoot();
	const r = opFindItems({ root, gh: fakeItemList(SAMPLE_ITEMS), tok: TOK, status: "Todo" });
	assert.equal(r.ok, true);
	assert.deepEqual(
		r.items.map((i) => i.number),
		[1, 3],
	);
	rmSync(root, { recursive: true, force: true });
});

test("find-items: filters by title-contains (case-insensitive)", () => {
	const root = fixtureRoot();
	const r = opFindItems({ root, gh: fakeItemList(SAMPLE_ITEMS), tok: TOK, titleContains: "ALPHA" });
	assert.equal(r.ok, true);
	assert.deepEqual(
		r.items.map((i) => i.number),
		[1, 3],
	);
	rmSync(root, { recursive: true, force: true });
});

test("find-items: --since joins updatedAt via a batched graphql query", () => {
	const root = fixtureRoot();
	const gh = (_cwd, args) => {
		if (args[0] === "project" && args[1] === "item-list") return { code: 0, stdout: JSON.stringify({ items: SAMPLE_ITEMS, totalCount: 3 }), stderr: "" };
		if (args[0] === "api" && args[1] === "graphql") {
			return {
				code: 0,
				stdout: JSON.stringify({
					data: { repository: { i1: { number: 1, updatedAt: "2026-07-01T00:00:00Z" }, i2: { number: 2, updatedAt: "2026-07-20T00:00:00Z" }, i3: { number: 3, updatedAt: "2026-07-25T00:00:00Z" } } },
				}),
				stderr: "",
			};
		}
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
	const r = opFindItems({ root, gh, tok: TOK, since: "2026-07-15T00:00:00Z" });
	assert.equal(r.ok, true);
	assert.deepEqual(r.items.map((i) => i.number).sort(), [2, 3]);
	rmSync(root, { recursive: true, force: true });
});

// ---- set-status -----------------------------------------------------------

function fakeGhStatus({ options = ["Todo", "In Progress", "Blocked", "In Review", "Done"], items = SAMPLE_ITEMS } = {}) {
	let editArgs;
	const gh = (_cwd, args) => {
		if (args[0] === "project" && args[1] === "view") return { code: 0, stdout: JSON.stringify({ id: "PROJ_1", fields: { totalCount: options.length + 1 } }), stderr: "" };
		if (args[0] === "project" && args[1] === "field-list") return { code: 0, stdout: JSON.stringify({ fields: [{ id: "FIELD_STATUS", name: "Status", options: options.map((name, i) => ({ id: `OPT_${i}`, name })) }] }), stderr: "" };
		if (args[0] === "project" && args[1] === "item-list") return { code: 0, stdout: JSON.stringify({ items }), stderr: "" };
		if (args[0] === "project" && args[1] === "item-edit") {
			editArgs = args;
			return { code: 0, stdout: JSON.stringify({ id: args[args.indexOf("--id") + 1] }), stderr: "" };
		}
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
	return { gh, editArgsRef: () => editArgs };
}

test("set-status: by item id directly", () => {
	const root = fixtureRoot();
	const { gh, editArgsRef } = fakeGhStatus();
	const r = opSetStatus({ root, gh, tok: TOK, item: "PVTI_1", status: "Done" });
	assert.deepEqual(r, { ok: true, updated: true, itemId: "PVTI_1" });
	assert.ok(editArgsRef().includes("OPT_4")); // Done is index 4
	rmSync(root, { recursive: true, force: true });
});

test("set-status: by issue number resolves the item id first", () => {
	const root = fixtureRoot();
	const { gh } = fakeGhStatus();
	const r = opSetStatus({ root, gh, tok: TOK, item: "3", status: "In Progress" });
	assert.deepEqual(r, { ok: true, updated: true, itemId: "PVTI_3" });
	rmSync(root, { recursive: true, force: true });
});

test("set-status: unknown status rejected before any gh call", () => {
	const root = fixtureRoot();
	const gh = () => {
		throw new Error("should not call gh");
	};
	const r = opSetStatus({ root, gh, tok: TOK, item: "PVTI_1", status: "Bogus" });
	assert.equal(r.ok, false);
	assert.match(r.reason, /unknown status/);
	rmSync(root, { recursive: true, force: true });
});

// ---- board-add ------------------------------------------------------------

test("board-add: adds by issue number, builds the URL from tracker.repo", () => {
	const root = fixtureRoot();
	let calledUrl;
	const gh = (_cwd, args) => {
		calledUrl = args[args.indexOf("--url") + 1];
		return { code: 0, stdout: JSON.stringify({ id: "PVTI_added" }), stderr: "" };
	};
	const r = boardAdd({ root, gh, boardNumber: 5, boardOwner: "owner", repo: "owner/repo", issue: 42 });
	assert.deepEqual(r, { ok: true, itemId: "PVTI_added" });
	assert.equal(calledUrl, "https://github.com/owner/repo/issues/42");
	rmSync(root, { recursive: true, force: true });
});

// ---- main() CLI dispatch ----------------------------------------------------

test("main: dispatches find-items end to end", () => {
	const root = fixtureRoot();
	const { result } = main(["find-items", "--repo-root", root, "--status", "Todo", "--format", "json"], { gh: fakeItemList(SAMPLE_ITEMS) });
	assert.equal(result.ok, true);
	assert.deepEqual(
		result.items.map((i) => i.number),
		[1, 3],
	);
	rmSync(root, { recursive: true, force: true });
});

test("main: unknown subcommand exits 2 via fail() (real subprocess — fail() calls process.exit)", () => {
	const root = fixtureRoot();
	const r = spawnSync(process.execPath, [SCRIPT, "bogus-command", "--repo-root", root], { encoding: "utf8" });
	assert.equal(r.status, 2);
	assert.match(r.stderr, /usage: tracker-ops\.mjs/);
	rmSync(root, { recursive: true, force: true });
});
