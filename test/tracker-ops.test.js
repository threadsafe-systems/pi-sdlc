// Offline unit tests for tracker-ops.mjs (#82/#168). gh is an injected fake —
// no real spawn, no network, fully deterministic, matching this repo's
// offline-test convention (same shape as check-completion.test.js's fakeGh).
// Includes coverage added by the PR-panel round-1 fix wave
// (docs/reviews/pr-tracker-ops-helper-2026-07-24/consolidated.md): dead
// --repo-root/--config, missing required-arg validation, --gh-cmd, blockedBy/
// find-items pagination guards, partial-create-failure identity, explicit
// Todo-on-create, and bulk set-status.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
		review: { brainstorm: "human", design: "panel", code: "panel", tasks: "subagent", panelSize: 2, onShortfall: "proceed" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
		tracker: { repo: "owner/repo", board: { number: 5, url: "https://github.com/orgs/owner/projects/5" } },
	};
	writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config)}\n`);
	return dir;
}

const TOK = { labelPrefix: "sdlc", repo: "owner/repo", owner: "owner", name: "repo", boardNumber: 5, boardOwner: "owner" };
const STATUS_OPTIONS = ["Todo", "In Progress", "Blocked", "In Review", "Done"];

function queryOf(args) {
	const q = args.find((a) => a.startsWith("query="));
	return q ? q.slice("query=".length) : "";
}

function fakeBoardCalls(args, { boardFailAt } = {}) {
	if (args[0] === "project" && args[1] === "view") {
		if (boardFailAt === "view") return { code: 1, stdout: "", stderr: "board view failed" };
		return { code: 0, stdout: JSON.stringify({ id: "PROJ_1" }), stderr: "" };
	}
	if (args[0] === "project" && args[1] === "field-list") {
		if (boardFailAt === "field-list") return { code: 1, stdout: "", stderr: "field-list failed" };
		return { code: 0, stdout: JSON.stringify({ fields: [{ id: "FIELD_STATUS", name: "Status", options: STATUS_OPTIONS.map((name, i) => ({ id: `OPT_${i}`, name })) }] }), stderr: "" };
	}
	if (args[0] === "project" && args[1] === "item-edit") {
		if (boardFailAt === "item-edit") return { code: 1, stdout: "", stderr: "item-edit failed" };
		return { code: 0, stdout: JSON.stringify({ id: args[args.indexOf("--id") + 1] }), stderr: "" };
	}
	return undefined;
}

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

function fakeGhCreate({ createdNumber = 100, parentNumber = 50, boardFailAt = null } = {}) {
	const calls = [];
	const gh = (_cwd, args) => {
		calls.push(args);
		if (args[0] === "issue" && args[1] === "create") {
			if (boardFailAt === "create") return { code: 1, stdout: "", stderr: "permission denied" };
			return { code: 0, stdout: `https://github.com/owner/repo/issues/${createdNumber}`, stderr: "" };
		}
		if (args[0] === "api" && /addSubIssue/.test(queryOf(args))) {
			if (boardFailAt === "add-sub-issue") return { code: 1, stdout: "", stderr: "addSubIssue failed" };
			return { code: 0, stdout: JSON.stringify({ data: { addSubIssue: { subIssue: { number: createdNumber, title: "t" } } } }), stderr: "" };
		}
		if (args[0] === "api" && /issue\(number:\$n\)/.test(queryOf(args))) {
			if (boardFailAt === "lookup-node") return { code: 1, stdout: "", stderr: "lookup failed" };
			const n = Number(args.find((a) => a.startsWith("n=")).slice(2));
			const number = n === parentNumber ? parentNumber : createdNumber;
			return { code: 0, stdout: JSON.stringify({ data: { repository: { issue: { id: `I_${number}`, number, title: "t" } } } }), stderr: "" };
		}
		if (args[0] === "project" && args[1] === "item-add") {
			if (boardFailAt === "board-add") return { code: 1, stdout: "", stderr: "item-add failed" };
			return { code: 0, stdout: JSON.stringify({ id: "PVTI_new" }), stderr: "" };
		}
		const boarded = fakeBoardCalls(args, { boardFailAt });
		if (boarded) return boarded;
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
	return { gh, calls };
}

test("create-epic: creates, looks up node, boards, sets Todo explicitly — returns {number,nodeId,itemId,url}", () => {
	const root = fixtureRoot();
	const { gh, calls } = fakeGhCreate({ createdNumber: 200 });
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "Epic title", body: "body", extraLabels: [], kind: "epic" });
	assert.deepEqual(r, { ok: true, number: 200, nodeId: "I_200", itemId: "PVTI_new", url: "https://github.com/owner/repo/issues/200" });
	const todoEdit = calls.find((a) => a[0] === "project" && a[1] === "item-edit");
	assert.ok(todoEdit, "expected an explicit item-edit call to set Todo");
	assert.ok(todoEdit.includes("OPT_0")); // Todo is index 0
	rmSync(root, { recursive: true, force: true });
});

test("create-task: with --parent wires addSubIssue before boarding", () => {
	const root = fixtureRoot();
	const { gh } = fakeGhCreate({ createdNumber: 201, parentNumber: 50 });
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "Task title", body: "body", extraLabels: ["extra"], parent: 50, kind: "task" });
	assert.equal(r.ok, true);
	assert.equal(r.number, 201);
	rmSync(root, { recursive: true, force: true });
});

test("create-epic: gh issue create failure short-circuits before any board mutation", () => {
	const root = fixtureRoot();
	const { gh, calls } = fakeGhCreate({ boardFailAt: "create" });
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "t", body: "b", extraLabels: [], kind: "epic" });
	assert.equal(r.ok, false);
	assert.match(r.reason, /permission denied/);
	assert.ok(!calls.some((a) => a[0] === "project"));
	rmSync(root, { recursive: true, force: true });
});

test("create-epic: partial failure after issue creation preserves created {number,url} and names the failed step (finding M1)", () => {
	const root = fixtureRoot();
	const { gh } = fakeGhCreate({ createdNumber: 300, boardFailAt: "board-add" });
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "t", body: "b", extraLabels: [], kind: "epic" });
	assert.equal(r.ok, false);
	assert.equal(r.failedStep, "board-add");
	assert.deepEqual(r.created, { number: 300, url: "https://github.com/owner/repo/issues/300" });
	rmSync(root, { recursive: true, force: true });
});

test("create-epic: failure at the explicit Todo-set step also preserves created identity", () => {
	const root = fixtureRoot();
	const { gh } = fakeGhCreate({ createdNumber: 301, boardFailAt: "item-edit" });
	const r = opCreateEpicOrTask({ root, gh, tok: TOK, title: "t", body: "b", extraLabels: [], kind: "epic" });
	assert.equal(r.ok, false);
	assert.equal(r.failedStep, "set-todo");
	assert.equal(r.created.number, 301);
	assert.equal(r.itemId, "PVTI_new");
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

function frontierNode(overrides) {
	return { number: 1, title: "t", state: "OPEN", assignees: { nodes: [] }, blockedBy: { nodes: [], pageInfo: { hasNextPage: false } }, ...overrides };
}

test("frontier: open + unassigned + unblocked (or no blockers) children only", () => {
	const root = fixtureRoot();
	const nodes = [
		frontierNode({ number: 1, title: "open unassigned unblocked" }),
		frontierNode({ number: 2, title: "open unassigned blocked-open", blockedBy: { nodes: [{ number: 1, state: "OPEN" }], pageInfo: { hasNextPage: false } } }),
		frontierNode({ number: 3, title: "open assigned", assignees: { nodes: [{ login: "someone" }] } }),
		frontierNode({ number: 4, title: "closed", state: "CLOSED" }),
		frontierNode({ number: 5, title: "open unassigned all-closed-blockers", blockedBy: { nodes: [{ number: 1, state: "CLOSED" }], pageInfo: { hasNextPage: false } } }),
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

test("frontier: refuses an incomplete subIssues page rather than silently truncating", () => {
	const root = fixtureRoot();
	const gh = () => ({ code: 0, stdout: JSON.stringify({ data: { repository: { issue: { subIssues: { nodes: [], pageInfo: { hasNextPage: true } } } } } }), stderr: "" });
	const r = opFrontier({ root, gh, tok: TOK, parent: 10 });
	assert.equal(r.ok, false);
	assert.match(r.reason, /more than 100/);
	rmSync(root, { recursive: true, force: true });
});

test("frontier: refuses an incomplete blockedBy page — an 11th+ open blocker must not be silently missed (finding M2)", () => {
	const root = fixtureRoot();
	const nodes = [frontierNode({ number: 9, blockedBy: { nodes: Array.from({ length: 50 }, (_, i) => ({ number: i, state: "CLOSED" })), pageInfo: { hasNextPage: true } } })];
	const gh = () => ({ code: 0, stdout: JSON.stringify({ data: { repository: { issue: { subIssues: { nodes, pageInfo: { hasNextPage: false } } } } } }), stderr: "" });
	const r = opFrontier({ root, gh, tok: TOK, parent: 10 });
	assert.equal(r.ok, false);
	assert.match(r.reason, /#9/);
	assert.match(r.reason, /blockedBy/);
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

function fakeItemList(items, { totalCount } = {}) {
	return (_cwd, args) => {
		if (args[0] === "project" && args[1] === "item-list") return { code: 0, stdout: JSON.stringify({ items, totalCount: totalCount ?? items.length }), stderr: "" };
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
}

const SAMPLE_ITEMS = [
	{ id: "PVTI_1", status: "Todo", labels: ["sdlc:build-task"], content: { number: 1, title: "Alpha task", repository: "owner/repo" } },
	{ id: "PVTI_2", status: "Done", labels: ["sdlc:epic"], content: { number: 2, title: "Beta epic", repository: "owner/repo" } },
	{ id: "PVTI_3", status: "Todo", labels: [], content: { number: 3, title: "Gamma alpha thing", repository: "owner/repo" } },
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

test("find-items: refuses a truncated result rather than silently under-reporting (finding M3)", () => {
	const root = fixtureRoot();
	const r = opFindItems({ root, gh: fakeItemList(SAMPLE_ITEMS, { totalCount: 5000 }), tok: TOK });
	assert.equal(r.ok, false);
	assert.match(r.reason, /5000/);
	rmSync(root, { recursive: true, force: true });
});

test("find-items: filters out items from a foreign repo on a multi-repo org board (finding M4)", () => {
	const root = fixtureRoot();
	const foreignCollision = { id: "PVTI_foreign", status: "Todo", labels: [], content: { number: 1, title: "Foreign repo's own #1", repository: "owner/other-repo" } };
	const items = [...SAMPLE_ITEMS, foreignCollision];
	const r = opFindItems({ root, gh: fakeItemList(items, { totalCount: items.length }), tok: TOK, number: 1 });
	assert.equal(r.ok, true);
	assert.equal(r.items.length, 1);
	assert.equal(r.items[0].itemId, "PVTI_1");
	rmSync(root, { recursive: true, force: true });
});

// ---- set-status -----------------------------------------------------------

function fakeGhStatus({ items = SAMPLE_ITEMS, boardFailAt = null } = {}) {
	const editCalls = [];
	const gh = (_cwd, args) => {
		if (args[0] === "project" && args[1] === "item-list") return { code: 0, stdout: JSON.stringify({ items, totalCount: items.length }), stderr: "" };
		if (args[0] === "project" && args[1] === "item-edit") editCalls.push(args);
		const boarded = fakeBoardCalls(args, { boardFailAt });
		if (boarded) return boarded;
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
	return { gh, editCalls };
}

test("set-status: by item id directly", () => {
	const root = fixtureRoot();
	const { gh, editCalls } = fakeGhStatus();
	const r = opSetStatus({ root, gh, tok: TOK, item: "PVTI_1", status: "Done" });
	assert.deepEqual(r, { ok: true, updated: true, itemId: "PVTI_1" });
	assert.ok(editCalls[0].includes("OPT_4")); // Done is index 4
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

test("set-status: neither --item nor --from-status is a usage-shaped failure", () => {
	const root = fixtureRoot();
	const { gh } = fakeGhStatus();
	const r = opSetStatus({ root, gh, tok: TOK, status: "Done" });
	assert.equal(r.ok, false);
	assert.match(r.reason, /--item.*--from-status/);
	rmSync(root, { recursive: true, force: true });
});

test("set-status: bulk --from-status moves every matching item, mirroring this session's board-5 cleanup (finding M6)", () => {
	const root = fixtureRoot();
	const { gh, editCalls } = fakeGhStatus();
	const r = opSetStatus({ root, gh, tok: TOK, fromStatus: "Todo", status: "In Progress" });
	assert.equal(r.ok, true);
	assert.deepEqual(r.updated.map((u) => u.number).sort(), [1, 3]);
	assert.equal(editCalls.length, 2);
	rmSync(root, { recursive: true, force: true });
});

test("set-status: bulk --from-status reports partial progress on a mid-batch failure", () => {
	const root = fixtureRoot();
	const items = SAMPLE_ITEMS.filter((i) => i.status === "Todo");
	let editCount = 0;
	const gh = (_cwd, args) => {
		if (args[0] === "project" && args[1] === "item-list") return { code: 0, stdout: JSON.stringify({ items, totalCount: items.length }), stderr: "" };
		if (args[0] === "project" && args[1] === "item-edit") {
			editCount += 1;
			if (editCount === 2) return { code: 1, stdout: "", stderr: "rate limited" };
			return { code: 0, stdout: JSON.stringify({ id: args[args.indexOf("--id") + 1] }), stderr: "" };
		}
		const boarded = fakeBoardCalls(args, {});
		if (boarded) return boarded;
		throw new Error(`unexpected gh args: ${args.join(" ")}`);
	};
	const r = opSetStatus({ root, gh, tok: TOK, fromStatus: "Todo", status: "Done" });
	assert.equal(r.ok, false);
	assert.equal(r.updatedBeforeFailure.length, 1);
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

test("main: --repo-root resolves the named repo even from an unrelated cwd (finding H1 — empty-string defaults previously beat inspectRoot's ?? chain)", () => {
	const root = fixtureRoot();
	const unrelatedCwd = mkdtempSync(join(tmpdir(), "sdlc-tracker-ops-unrelated-"));
	const { result } = main(["find-items", "--repo-root", root, "--status", "Todo"], { cwd: unrelatedCwd, gh: fakeItemList(SAMPLE_ITEMS) });
	assert.equal(result.ok, true);
	rmSync(root, { recursive: true, force: true });
	rmSync(unrelatedCwd, { recursive: true, force: true });
});

test("main: unknown subcommand exits 2 via fail() (real subprocess — fail() calls process.exit)", () => {
	const root = fixtureRoot();
	const r = spawnSync(process.execPath, [SCRIPT, "bogus-command", "--repo-root", root], { encoding: "utf8" });
	assert.equal(r.status, 2);
	assert.match(r.stderr, /usage: tracker-ops\.mjs/);
	rmSync(root, { recursive: true, force: true });
});

test("main: create-epic missing --body exits 2 before any gh call (finding H2 — this is what created live issue #173 during review)", () => {
	const root = fixtureRoot();
	const r = spawnSync(process.execPath, [SCRIPT, "create-epic", "--title", "t", "--repo-root", root], { encoding: "utf8" });
	assert.equal(r.status, 2);
	assert.match(r.stderr, /create-epic.*--body/);
	rmSync(root, { recursive: true, force: true });
});

test("main: create-task missing --parent exits 2 before any gh call", () => {
	const root = fixtureRoot();
	const r = spawnSync(process.execPath, [SCRIPT, "create-task", "--title", "t", "--body", "b", "--repo-root", root], { encoding: "utf8" });
	assert.equal(r.status, 2);
	assert.match(r.stderr, /create-task.*--parent/);
	rmSync(root, { recursive: true, force: true });
});

test("main: --number rejects a non-integer value with a usage error, not a NaN graphql variable", () => {
	const root = fixtureRoot();
	const r = spawnSync(process.execPath, [SCRIPT, "lookup-node", "--number", "abc", "--repo-root", root], { encoding: "utf8" });
	assert.equal(r.status, 2);
	assert.match(r.stderr, /--number must be an integer/);
	rmSync(root, { recursive: true, force: true });
});

test("main: --format rejects an unknown value (finding L1)", () => {
	const root = fixtureRoot();
	const r = spawnSync(process.execPath, [SCRIPT, "find-items", "--format", "yaml", "--repo-root", root], { encoding: "utf8" });
	assert.equal(r.status, 2);
	assert.match(r.stderr, /--format must be one of/);
	rmSync(root, { recursive: true, force: true });
});

test("main: --gh-cmd points the real spawn path at a fake executable (finding H3 — the build plan's binding contract)", () => {
	const root = fixtureRoot();
	const fakeGhDir = mkdtempSync(join(tmpdir(), "sdlc-tracker-ops-fakegh-"));
	const fakeGhPath = join(fakeGhDir, "fake-gh.mjs");
	writeFileSync(
		fakeGhPath,
		`#!/usr/bin/env node
const args = process.argv.slice(2);
if (args[0] === "project" && args[1] === "item-list") {
	process.stdout.write(JSON.stringify({ items: [{ id: "PVTI_x", status: "Todo", content: { number: 1, title: "x", repository: "owner/repo" } }], totalCount: 1 }));
	process.exit(0);
}
process.exit(1);
`,
	);
	chmodSync(fakeGhPath, 0o755);
	const r = spawnSync(process.execPath, [SCRIPT, "find-items", "--gh-cmd", fakeGhPath, "--repo-root", root], { encoding: "utf8" });
	assert.equal(r.status, 0);
	const parsed = JSON.parse(r.stdout);
	assert.equal(parsed.ok, true);
	assert.equal(parsed.items[0].number, 1);
	rmSync(root, { recursive: true, force: true });
	rmSync(fakeGhDir, { recursive: true, force: true });
});
