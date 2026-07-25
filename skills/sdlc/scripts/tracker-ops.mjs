#!/usr/bin/env node
// tracker-ops.mjs — scripted wrapper for the GitHub tracker mutations
// documented in assets/tracker-ops.md. Every subcommand is a thin wrapper
// around the recipes that file specifies; every caveat it documents
// (node-id-vs-number, claim is best-effort not atomic, blockedBy/subIssues
// are paginated connections) still applies. Tokens (labelPrefix,
// tracker.repo, tracker.board) resolve from the consumer's committed
// sdlc.config.json via readConfig.
//
// Usage: tracker-ops.mjs <subcommand> [options] [--repo-root DIR|--config DIR]
//          [--gh-cmd CMD] [--format json|text]
// Subcommands (lookup-node/find-items/set-status/board-add additionally
// accept optional --repo owner/name, --owner ORG, --project N overrides of
// the config-derived tracker.repo/tracker.board — config-derived stays the
// default; the override is an escape hatch, not a required flag):
//   lookup-node --number N [--repo owner/name]
//   create-epic --title T --body B [--label L]...
//   create-task --title T --body B --parent N [--label L]...
//   add-blocked-by --issue N --blocking N
//   frontier --parent N
//   claim --issue N --login L
//   find-items [--since ISO] [--status S] [--number N] [--title-contains STR] [--repo owner/name] [--owner ORG] [--project N]
//   set-status (--item <PVTI_id-or-issue-number> | --from-status S [--status-filters...]) --status <Todo|In Progress|Blocked|In Review|Done> [--repo owner/name] [--owner ORG] [--project N]
//   board-add --issue N [--repo owner/name] [--owner ORG] [--project N]
//
// Exit: 0 success, 1 operation failed (structured {ok:false,reason}), 2 usage/error.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fail, inspectRoot, readConfig } from "./lib.mjs";

const STATUS_OPTIONS = ["Todo", "In Progress", "Blocked", "In Review", "Done"];
const FORMAT_OPTIONS = ["json", "text"];
const SUBCOMMANDS = ["lookup-node", "create-epic", "create-task", "add-blocked-by", "frontier", "claim", "find-items", "set-status", "board-add"];
const USAGE = `usage: tracker-ops.mjs <subcommand> [options] [--repo-root DIR|--config DIR] [--gh-cmd CMD] [--format json|text]
subcommands: ${SUBCOMMANDS.join(", ")}`;

// ---- gh seam ---------------------------------------------------------------
// Two independent injection points, deliberately: `--gh-cmd` swaps the real
// spawned executable (so manual/CLI use can point at a fake instead of live
// gh), and the JS-level `main(argv,{gh})` parameter swaps the whole gh
// function (the faster unit-test seam, same shape as check-completion.mjs).
// Neither supersedes the other.

function makeDefaultGh(ghCmd) {
	return (cwd, args) => {
		const r = spawnSync(ghCmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		return { code: r.error ? -1 : (r.status ?? -1), stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
	};
}

function parseJson(result, errorMessage) {
	if (result.code !== 0) return { ok: false, reason: result.stderr || errorMessage };
	try {
		return { ok: true, value: JSON.parse(result.stdout || "null") };
	} catch {
		return { ok: false, reason: `${errorMessage}: unparsable output` };
	}
}

// ---- config token resolution -----------------------------------------

function tokens(root) {
	const config = readConfig(root, { requireManifest: true });
	if (!config.tracker?.repo) fail("tracker-ops: sdlc.config.json has no tracker.repo — this project cannot use tracker-ops");
	const [owner, name] = config.tracker.repo.split("/");
	return {
		labelPrefix: config.labelPrefix,
		repo: config.tracker.repo,
		owner,
		name,
		boardNumber: config.tracker.board?.number,
		boardOwner: owner,
	};
}

// ---- primitives ---------------------------------------------------------
// Each returns {ok:true,...} or {ok:false,reason} — never throws on a
// caller-recoverable gh failure.

function lookupNode({ root, gh, owner, name, number }) {
	const query = "query($owner:String!,$repo:String!,$n:Int!){ repository(owner:$owner,name:$repo){ issue(number:$n){ id number title } } }";
	const r = gh(root, ["api", "graphql", "-f", `query=${query}`, "-f", `owner=${owner}`, "-f", `repo=${name}`, "-F", `n=${number}`]);
	const parsed = parseJson(r, "lookup-node: graphql query failed");
	if (!parsed.ok) return parsed;
	const issue = parsed.value?.data?.repository?.issue;
	if (!issue) return { ok: false, reason: `issue #${number} not found in ${owner}/${name}` };
	return { ok: true, nodeId: issue.id, number: issue.number, title: issue.title };
}

function resolveBoard({ root, gh, boardNumber, boardOwner }) {
	if (!boardNumber) return { ok: false, reason: "no tracker.board.number configured" };
	const view = gh(root, ["project", "view", String(boardNumber), "--owner", boardOwner, "--format", "json"]);
	const parsedView = parseJson(view, "gh project view failed");
	if (!parsedView.ok) return parsedView;
	const projectId = parsedView.value?.id;
	if (!projectId) return { ok: false, reason: "gh project view: response missing id" };
	const fieldList = gh(root, ["project", "field-list", String(boardNumber), "--owner", boardOwner, "--format", "json"]);
	const parsedFields = parseJson(fieldList, "gh project field-list failed");
	if (!parsedFields.ok) return parsedFields;
	const statusField = (parsedFields.value?.fields ?? []).find((f) => f.name === "Status");
	if (!statusField) return { ok: false, reason: "board has no Status field" };
	const optionByName = new Map((statusField.options ?? []).map((o) => [o.name, o.id]));
	return { ok: true, projectId, statusFieldId: statusField.id, optionByName };
}

function boardAdd({ root, gh, boardNumber, boardOwner, repo, issue }) {
	const url = /^https?:\/\//.test(String(issue)) ? issue : `https://github.com/${repo}/issues/${issue}`;
	const r = gh(root, ["project", "item-add", String(boardNumber), "--owner", boardOwner, "--url", url, "--format", "json"]);
	const parsed = parseJson(r, "gh project item-add failed");
	if (!parsed.ok) return parsed;
	if (!parsed.value?.id) return { ok: false, reason: "gh project item-add: response missing id" };
	return { ok: true, itemId: parsed.value.id };
}

function setStatusByItemId({ root, gh, board, itemId, status }) {
	const optionId = board.optionByName.get(status);
	if (!optionId) return { ok: false, reason: `board has no '${status}' option` };
	const edit = gh(root, ["project", "item-edit", "--project-id", board.projectId, "--id", itemId, "--field-id", board.statusFieldId, "--single-select-option-id", optionId, "--format", "json"]);
	if (edit.code !== 0) return { ok: false, reason: edit.stderr || "gh project item-edit failed" };
	return { ok: true, updated: true, itemId };
}

function createIssue({ root, gh, repo, title, body, labels }) {
	const args = ["issue", "create", "--repo", repo, "--title", title, "--body", body];
	for (const l of labels) args.push("--label", l);
	const r = gh(root, args);
	if (r.code !== 0) return { ok: false, reason: r.stderr || "gh issue create failed" };
	const match = r.stdout.match(/\/issues\/(\d+)\s*$/);
	if (!match) return { ok: false, reason: `gh issue create: could not parse issue number from output: ${r.stdout}` };
	return { ok: true, number: Number(match[1]), url: r.stdout.trim() };
}

function addSubIssue({ root, gh, issueNodeId, subIssueNodeId }) {
	const mutation = "mutation($issueId:ID!,$subIssueId:ID!){ addSubIssue(input:{issueId:$issueId,subIssueId:$subIssueId}){ subIssue { number title } } }";
	const r = gh(root, ["api", "graphql", "-f", `query=${mutation}`, "-f", `issueId=${issueNodeId}`, "-f", `subIssueId=${subIssueNodeId}`]);
	return parseJson(r, "addSubIssue mutation failed");
}

// A caller that hits a failure after the issue is created still gets its
// {number,url} back (in `created`) plus the `failedStep`, so it never has
// to re-derive "what did I just create" from a bare error. `--parent` is
// looked up BEFORE the issue is created, so a bad parent fails without
// leaving a live orphan; the branch is gated on `parent !== undefined` (not
// truthiness) so a caller passing 0 gets an explicit failing lookup, never
// a silent skip.
function opCreateEpicOrTask({ root, gh, tok, title, body, extraLabels, parent, kind }) {
	let parentNode;
	if (parent !== undefined) {
		parentNode = lookupNode({ root, gh, owner: tok.owner, name: tok.name, number: parent });
		if (!parentNode.ok) return { ok: false, reason: parentNode.reason, failedStep: "lookup-parent" };
	}
	const label = kind === "epic" ? `${tok.labelPrefix}:epic` : `${tok.labelPrefix}:build-task`;
	const created = createIssue({ root, gh, repo: tok.repo, title, body, labels: [label, ...extraLabels] });
	if (!created.ok) return created;
	const node = lookupNode({ root, gh, owner: tok.owner, name: tok.name, number: created.number });
	if (!node.ok) return { ok: false, reason: node.reason, failedStep: "lookup-node", created: { number: created.number, url: created.url } };
	if (parentNode) {
		const wired = addSubIssue({ root, gh, issueNodeId: parentNode.nodeId, subIssueNodeId: node.nodeId });
		if (!wired.ok) return { ok: false, reason: wired.reason, failedStep: "add-sub-issue", created: { number: created.number, url: created.url } };
	}
	const added = boardAdd({ root, gh, boardNumber: tok.boardNumber, boardOwner: tok.boardOwner, repo: tok.repo, issue: created.number });
	if (!added.ok) return { ok: false, reason: added.reason, failedStep: "board-add", created: { number: created.number, url: created.url } };
	// Set Todo explicitly: `gh project item-add` does not guarantee a status,
	// so a board without item-added automation would otherwise leave new
	// items statusless.
	const board = resolveBoard({ root, gh, boardNumber: tok.boardNumber, boardOwner: tok.boardOwner });
	if (!board.ok) return { ok: false, reason: board.reason, failedStep: "resolve-board-for-todo", created: { number: created.number, url: created.url }, itemId: added.itemId };
	const todo = setStatusByItemId({ root, gh, board, itemId: added.itemId, status: "Todo" });
	if (!todo.ok) return { ok: false, reason: todo.reason, failedStep: "set-todo", created: { number: created.number, url: created.url }, itemId: added.itemId };
	return { ok: true, number: created.number, nodeId: node.nodeId, itemId: added.itemId, url: created.url };
}

function opAddBlockedBy({ root, gh, tok, issue, blocking }) {
	const issueNode = lookupNode({ root, gh, owner: tok.owner, name: tok.name, number: issue });
	if (!issueNode.ok) return issueNode;
	const blockingNode = lookupNode({ root, gh, owner: tok.owner, name: tok.name, number: blocking });
	if (!blockingNode.ok) return blockingNode;
	const mutation = "mutation($issueId:ID!,$blockingIssueId:ID!){ addBlockedBy(input:{issueId:$issueId,blockingIssueId:$blockingIssueId}){ issue { number } blockingIssue { number } } }";
	const r = gh(root, ["api", "graphql", "-f", `query=${mutation}`, "-f", `issueId=${issueNode.nodeId}`, "-f", `blockingIssueId=${blockingNode.nodeId}`]);
	const parsed = parseJson(r, "addBlockedBy mutation failed");
	if (!parsed.ok) return parsed;
	return { ok: true, issue, blocking };
}

// Both connections this query walks — subIssues and the nested blockedBy —
// are paginated; both are guarded below, because a blocker past the fetched
// page would otherwise make a still-blocked child look ready.
function opFrontier({ root, gh, tok, parent }) {
	const query = "query($owner:String!,$repo:String!,$n:Int!){ repository(owner:$owner,name:$repo){ issue(number:$n){ subIssues(first:100){ nodes { number title state assignees(first:5){ nodes { login } } blockedBy(first:50){ nodes { number state } pageInfo { hasNextPage } } } pageInfo { hasNextPage } } } } }";
	const r = gh(root, ["api", "graphql", "-f", `query=${query}`, "-f", `owner=${tok.owner}`, "-f", `repo=${tok.name}`, "-F", `n=${parent}`]);
	const parsed = parseJson(r, "frontier: graphql query failed");
	if (!parsed.ok) return parsed;
	const connection = parsed.value?.data?.repository?.issue?.subIssues;
	const nodes = connection?.nodes;
	if (!Array.isArray(nodes)) return { ok: false, reason: "graphql response missing subIssues.nodes" };
	if (connection.pageInfo?.hasNextPage) return { ok: false, reason: `#${parent} has more than 100 sub-issues; refusing an incomplete frontier` };
	const incompleteBlockers = nodes.find((n) => n.blockedBy?.pageInfo?.hasNextPage);
	if (incompleteBlockers) return { ok: false, reason: `#${incompleteBlockers.number} has more than 50 blockedBy edges; refusing an incomplete frontier` };
	const items = nodes.filter((n) => n.state === "OPEN" && (n.assignees?.nodes ?? []).length === 0 && (n.blockedBy?.nodes ?? []).every((b) => b.state === "CLOSED")).map((n) => ({ number: n.number, title: n.title }));
	return { ok: true, items };
}

function opClaim({ root, gh, tok, issue, login }) {
	const view = gh(root, ["issue", "view", String(issue), "-R", tok.repo, "--json", "assignees"]);
	const parsed = parseJson(view, "gh issue view failed");
	if (!parsed.ok) return parsed;
	const assignees = parsed.value?.assignees ?? [];
	if (assignees.length > 0) return { ok: true, claimed: false, reason: `already claimed (assignees: ${assignees.map((a) => a.login).join(", ")})` };
	const edit = gh(root, ["issue", "edit", String(issue), "-R", tok.repo, "--add-assignee", login]);
	if (edit.code !== 0) return { ok: false, reason: edit.stderr || "gh issue edit --add-assignee failed" };
	return { ok: true, claimed: true };
}

// Carries `repository` per item and scopes strictly to `tok.repo`: a bare
// issue number is ambiguous on a multi-repo org board, and a repo-less
// (draft) board item is EXCLUDED, not passed through — otherwise a bulk
// set-status could mutate unrelated draft items on a shared board. Refuses
// a truncated result rather than under-report, matching frontier.
function opFindItems({ root, gh, tok, since, status, number, titleContains }) {
	if (status !== undefined && !STATUS_OPTIONS.includes(status)) return { ok: false, reason: `unknown status ${JSON.stringify(status)}; known: ${STATUS_OPTIONS.join(", ")}` };
	if (since !== undefined && Number.isNaN(Date.parse(since))) return { ok: false, reason: `--since is not a parsable date/time: ${JSON.stringify(since)}` };
	const limit = 1000;
	const list = gh(root, ["project", "item-list", String(tok.boardNumber), "--owner", tok.boardOwner, "--format", "json", "--limit", String(limit)]);
	const parsed = parseJson(list, "gh project item-list failed");
	if (!parsed.ok) return parsed;
	const rawItems = parsed.value?.items ?? [];
	if (typeof parsed.value?.totalCount === "number" && parsed.value.totalCount > rawItems.length) {
		return { ok: false, reason: `board has ${parsed.value.totalCount} items but only ${rawItems.length} were returned (limit ${limit}); this tool has no server-side filter, so no flag can narrow the fetch — refusing an incomplete result rather than under-report` };
	}
	let items = rawItems.map((i) => ({ itemId: i.id, number: i.content?.number, title: i.content?.title, status: i.status, labels: i.labels ?? [], repository: i.content?.repository }));
	items = items.filter((i) => i.repository === tok.repo);
	if (number !== undefined) items = items.filter((i) => i.number === number);
	if (status !== undefined) items = items.filter((i) => i.status === status);
	if (titleContains !== undefined) items = items.filter((i) => (i.title ?? "").toLowerCase().includes(titleContains.toLowerCase()));
	if (since !== undefined) {
		const candidates = items.filter((i) => Number.isInteger(i.number));
		if (candidates.length === 0) return { ok: true, items: [] };
		const aliasFor = (n) => `i${n}`;
		const fields = candidates.map((i) => `${aliasFor(i.number)}: issue(number:${i.number}){ number updatedAt }`).join(" ");
		const query = `query($owner:String!,$repo:String!){ repository(owner:$owner,name:$repo){ ${fields} } }`;
		const r = gh(root, ["api", "graphql", "-f", `query=${query}`, "-f", `owner=${tok.owner}`, "-f", `repo=${tok.name}`]);
		const parsedTimes = parseJson(r, "find-items --since: graphql query failed");
		if (!parsedTimes.ok) return parsedTimes;
		const repoData = parsedTimes.value?.data?.repository ?? {};
		const sinceMs = Date.parse(since);
		items = items.filter((i) => {
			const updatedAt = repoData[aliasFor(i.number)]?.updatedAt;
			return updatedAt !== undefined && Date.parse(updatedAt) >= sinceMs;
		});
	}
	return { ok: true, items };
}

// Both the single-item (--item) and bulk-by-filter (--from-status) paths
// resolve through this one entry point.
function opSetStatus({ root, gh, tok, item, status, fromStatus, number, titleContains, since }) {
	if (!STATUS_OPTIONS.includes(status)) return { ok: false, reason: `unknown status ${JSON.stringify(status)}; known: ${STATUS_OPTIONS.join(", ")}` };
	if (item !== undefined && fromStatus !== undefined) return { ok: false, reason: "set-status: pass --item (single) or --from-status (bulk), not both — the combination silently ignored --from-status" };
	const board = resolveBoard({ root, gh, boardNumber: tok.boardNumber, boardOwner: tok.boardOwner });
	if (!board.ok) return board;

	if (item !== undefined) {
		let itemId = item;
		if (!/^PVTI_/.test(String(item))) {
			const found = opFindItems({ root, gh, tok, number: Number(item) });
			if (!found.ok) return found;
			if (found.items.length === 0) return { ok: false, reason: `no board item found for issue #${item}` };
			itemId = found.items[0].itemId;
		}
		return setStatusByItemId({ root, gh, board, itemId, status });
	}

	if (fromStatus !== undefined) {
		if (!STATUS_OPTIONS.includes(fromStatus)) return { ok: false, reason: `unknown --from-status ${JSON.stringify(fromStatus)}; known: ${STATUS_OPTIONS.join(", ")}` };
		const found = opFindItems({ root, gh, tok, status: fromStatus, number, titleContains, since });
		if (!found.ok) return found;
		const updated = [];
		for (const i of found.items) {
			const r = setStatusByItemId({ root, gh, board, itemId: i.itemId, status });
			if (!r.ok) return { ok: false, reason: r.reason, updatedBeforeFailure: updated };
			updated.push({ number: i.number, itemId: i.itemId });
		}
		return { ok: true, updated };
	}

	return { ok: false, reason: "set-status requires --item (single) or --from-status (bulk)" };
}

// ---- CLI ------------------------------------------------------------------

function needVal(argv, i, name) {
	const v = argv[i + 1];
	if (v === undefined || v.startsWith("-")) fail(`tracker-ops: ${name} requires a value`);
	return v;
}

// Every caller (--parent/--issue/--blocking/--number) is a GitHub issue
// number, always >=1, so this rejects 0, negatives, and `Number("")===0` as
// usage errors rather than letting them flow into a query as a
// valid-looking integer.
function needInt(argv, i, name) {
	const raw = needVal(argv, i, name);
	const n = Number(raw);
	if (!Number.isInteger(n) || n < 1) fail(`tracker-ops: ${name} must be a positive integer, got ${JSON.stringify(raw)}`);
	return n;
}

function parseArgs(argv) {
	const sub = argv[0];
	const opts = { repoRoot: undefined, config: undefined, ghCmd: "gh", format: "json", labels: [] };
	for (let i = 1; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--repo-root") opts.repoRoot = needVal(argv, i++, "--repo-root");
		else if (a === "--config") opts.config = needVal(argv, i++, "--config");
		else if (a === "--gh-cmd") opts.ghCmd = needVal(argv, i++, "--gh-cmd");
		else if (a === "--format") {
			opts.format = needVal(argv, i++, "--format");
			if (!FORMAT_OPTIONS.includes(opts.format)) fail(`tracker-ops: --format must be one of ${FORMAT_OPTIONS.join(", ")}, got ${JSON.stringify(opts.format)}`);
		} else if (a === "--title") opts.title = needVal(argv, i++, "--title");
		else if (a === "--body") opts.body = needVal(argv, i++, "--body");
		else if (a === "--label") opts.labels.push(needVal(argv, i++, "--label"));
		else if (a === "--parent") opts.parent = needInt(argv, i++, "--parent");
		else if (a === "--issue") opts.issue = needInt(argv, i++, "--issue");
		else if (a === "--blocking") opts.blocking = needInt(argv, i++, "--blocking");
		else if (a === "--login") opts.login = needVal(argv, i++, "--login");
		else if (a === "--number") opts.number = needInt(argv, i++, "--number");
		else if (a === "--since") opts.since = needVal(argv, i++, "--since");
		else if (a === "--status") opts.status = needVal(argv, i++, "--status");
		else if (a === "--from-status") opts.fromStatus = needVal(argv, i++, "--from-status");
		else if (a === "--title-contains") opts.titleContains = needVal(argv, i++, "--title-contains");
		else if (a === "--item") opts.item = needVal(argv, i++, "--item");
		else if (a === "--repo") {
			opts.repo = needVal(argv, i++, "--repo");
			if (!/^[^/]+\/[^/]+$/.test(opts.repo)) fail(`tracker-ops: --repo must be owner/name, got ${JSON.stringify(opts.repo)}`);
		} else if (a === "--owner") opts.owner = needVal(argv, i++, "--owner");
		else if (a === "--project") opts.project = needInt(argv, i++, "--project");
		else fail(`tracker-ops: unexpected argument: ${a}`);
	}
	validateRequired(sub, opts);
	return { sub, opts };
}

// Required-option validation per subcommand: a missing value is a usage
// error (exit 2) before any gh call, so an undefined can never flow into a
// mutating gh invocation.
function validateRequired(sub, opts) {
	const need = (cond, message) => {
		if (!cond) fail(`tracker-ops: ${sub}: ${message}`);
	};
	if (sub === "lookup-node") need(opts.number !== undefined, "requires --number");
	else if (sub === "create-epic") {
		need(opts.title !== undefined, "requires --title");
		need(opts.body !== undefined, "requires --body");
	} else if (sub === "create-task") {
		need(opts.title !== undefined, "requires --title");
		need(opts.body !== undefined, "requires --body");
		need(opts.parent !== undefined, "requires --parent");
	} else if (sub === "add-blocked-by") {
		need(opts.issue !== undefined, "requires --issue");
		need(opts.blocking !== undefined, "requires --blocking");
	} else if (sub === "frontier") need(opts.parent !== undefined, "requires --parent");
	else if (sub === "claim") {
		need(opts.issue !== undefined, "requires --issue");
		need(opts.login !== undefined, "requires --login");
	} else if (sub === "set-status") {
		need(opts.status !== undefined, "requires --status");
		need(opts.item !== undefined || opts.fromStatus !== undefined, "requires --item or --from-status");
	} else if (sub === "board-add") need(opts.issue !== undefined, "requires --issue");
}

// --repo/--owner/--project are optional per-call overrides of the
// config-derived tokens, honored only by lookup-node/find-items/set-status/
// board-add. The creation and edge-wiring subcommands
// (create-epic/create-task/add-blocked-by/frontier/claim) always target
// this project's own configured tracker. Config-derived resolution is the
// default; these flags are an escape hatch, not required.
function effectiveTargets(tok, opts) {
	const repo = opts.repo ?? tok.repo;
	const [owner, name] = repo.split("/");
	return { ...tok, repo, owner, name, boardOwner: opts.owner ?? tok.boardOwner, boardNumber: opts.project ?? tok.boardNumber };
}

function main(argv = process.argv.slice(2), { cwd = process.cwd(), gh } = {}) {
	const { sub, opts } = parseArgs(argv);
	if (!sub || !SUBCOMMANDS.includes(sub)) fail(USAGE);
	const inspected = inspectRoot({ config: opts.config || undefined, repoRoot: opts.repoRoot || undefined, cwd });
	if (!inspected.ok) fail(`tracker-ops: ${inspected.message}`);
	const root = inspected.root;
	const tok = tokens(root);
	const effectiveGh = gh ?? makeDefaultGh(opts.ghCmd);
	const target = effectiveTargets(tok, opts);

	let result;
	if (sub === "lookup-node") result = lookupNode({ root, gh: effectiveGh, owner: target.owner, name: target.name, number: opts.number });
	else if (sub === "create-epic") result = opCreateEpicOrTask({ root, gh: effectiveGh, tok, title: opts.title, body: opts.body, extraLabels: opts.labels, kind: "epic" });
	else if (sub === "create-task") result = opCreateEpicOrTask({ root, gh: effectiveGh, tok, title: opts.title, body: opts.body, extraLabels: opts.labels, parent: opts.parent, kind: "task" });
	else if (sub === "add-blocked-by") result = opAddBlockedBy({ root, gh: effectiveGh, tok, issue: opts.issue, blocking: opts.blocking });
	else if (sub === "frontier") result = opFrontier({ root, gh: effectiveGh, tok, parent: opts.parent });
	else if (sub === "claim") result = opClaim({ root, gh: effectiveGh, tok, issue: opts.issue, login: opts.login });
	else if (sub === "find-items") result = opFindItems({ root, gh: effectiveGh, tok: target, since: opts.since, status: opts.status, number: opts.number, titleContains: opts.titleContains });
	else if (sub === "set-status") result = opSetStatus({ root, gh: effectiveGh, tok: target, item: opts.item, status: opts.status, fromStatus: opts.fromStatus, number: opts.number, titleContains: opts.titleContains, since: opts.since });
	else if (sub === "board-add") result = boardAdd({ root, gh: effectiveGh, boardNumber: target.boardNumber, boardOwner: target.boardOwner, repo: target.repo, issue: opts.issue });

	return { result, format: opts.format };
}

function isMain() {
	try {
		return process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
	} catch {
		return false;
	}
}

if (isMain()) {
	const { result, format } = main();
	if (format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
	else process.stdout.write(`${result.ok ? "ok" : "error"}: ${JSON.stringify(result)}\n`);
	process.exit(result.ok ? 0 : 1);
}

export { main, opAddBlockedBy, opClaim, opCreateEpicOrTask, opFindItems, opFrontier, opSetStatus, boardAdd, lookupNode, resolveBoard };
