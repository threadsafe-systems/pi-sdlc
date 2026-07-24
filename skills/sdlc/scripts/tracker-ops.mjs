#!/usr/bin/env node
// tracker-ops.mjs — scripted wrapper for the GitHub tracker mutations
// documented in assets/tracker-ops.md (#82/#168). Every subcommand is a
// thin, faithful wrapper around the recipes that file already specifies —
// this is not a redesign, and every documented caveat (node-id-vs-number,
// claim is best-effort not atomic, blockedBy/subIssues are connections)
// still applies. Tokens (labelPrefix, tracker.repo, tracker.board) resolve
// from the consumer's committed sdlc.config.json via readConfig.
//
// Usage: tracker-ops.mjs <subcommand> [options] [--repo-root DIR|--config DIR]
//          [--format json|text]
// Subcommands:
//   lookup-node --number N
//   create-epic --title T --body B [--label L]...
//   create-task --title T --body B --parent N [--label L]...
//   add-blocked-by --issue N --blocking N
//   frontier --parent N
//   claim --issue N --login L
//   find-items [--since ISO] [--status S] [--number N] [--title-contains STR]
//   set-status --item <PVTI_id-or-issue-number> --status <Todo|In Progress|Blocked|In Review|Done>
//   board-add --issue N
//
// Exit: 0 success, 1 operation failed (structured {ok:false,reason}), 2 usage/error.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fail, inspectRoot, readConfig } from "./lib.mjs";

const STATUS_OPTIONS = ["Todo", "In Progress", "Blocked", "In Review", "Done"];
const SUBCOMMANDS = ["lookup-node", "create-epic", "create-task", "add-blocked-by", "frontier", "claim", "find-items", "set-status", "board-add"];
const USAGE = `usage: tracker-ops.mjs <subcommand> [options] [--repo-root DIR|--config DIR] [--format json|text]
subcommands: ${SUBCOMMANDS.join(", ")}`;

// ---- gh seam (injectable for tests, same shape as check-completion.mjs) ---

function defaultGh(cwd, args) {
	const r = spawnSync("gh", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
	return { code: r.error ? -1 : (r.status ?? -1), stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
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

function opCreateEpicOrTask({ root, gh, tok, title, body, extraLabels, parent, kind }) {
	const label = kind === "epic" ? `${tok.labelPrefix}:epic` : `${tok.labelPrefix}:build-task`;
	const created = createIssue({ root, gh, repo: tok.repo, title, body, labels: [label, ...extraLabels] });
	if (!created.ok) return created;
	const node = lookupNode({ root, gh, owner: tok.owner, name: tok.name, number: created.number });
	if (!node.ok) return node;
	if (parent) {
		const parentNode = lookupNode({ root, gh, owner: tok.owner, name: tok.name, number: parent });
		if (!parentNode.ok) return parentNode;
		const wired = addSubIssue({ root, gh, issueNodeId: parentNode.nodeId, subIssueNodeId: node.nodeId });
		if (!wired.ok) return wired;
	}
	const added = boardAdd({ root, gh, boardNumber: tok.boardNumber, boardOwner: tok.boardOwner, repo: tok.repo, issue: created.number });
	if (!added.ok) return added;
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

function opFrontier({ root, gh, tok, parent }) {
	const query = "query($owner:String!,$repo:String!,$n:Int!){ repository(owner:$owner,name:$repo){ issue(number:$n){ subIssues(first:100){ nodes { number title state assignees(first:5){ nodes { login } } blockedBy(first:10){ nodes { number state } } } pageInfo { hasNextPage } } } } }";
	const r = gh(root, ["api", "graphql", "-f", `query=${query}`, "-f", `owner=${tok.owner}`, "-f", `repo=${tok.name}`, "-F", `n=${parent}`]);
	const parsed = parseJson(r, "frontier: graphql query failed");
	if (!parsed.ok) return parsed;
	const connection = parsed.value?.data?.repository?.issue?.subIssues;
	const nodes = connection?.nodes;
	if (!Array.isArray(nodes)) return { ok: false, reason: "graphql response missing subIssues.nodes" };
	if (connection.pageInfo?.hasNextPage) return { ok: false, reason: `#${parent} has more than 100 sub-issues; refusing an incomplete frontier` };
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

function opFindItems({ root, gh, tok, since, status, number, titleContains }) {
	const list = gh(root, ["project", "item-list", String(tok.boardNumber), "--owner", tok.boardOwner, "--format", "json", "--limit", "1000"]);
	const parsed = parseJson(list, "gh project item-list failed");
	if (!parsed.ok) return parsed;
	let items = (parsed.value?.items ?? []).map((i) => ({ itemId: i.id, number: i.content?.number, title: i.content?.title, status: i.status, labels: i.labels ?? [] }));
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

function opSetStatus({ root, gh, tok, item, status }) {
	if (!STATUS_OPTIONS.includes(status)) return { ok: false, reason: `unknown status ${JSON.stringify(status)}; known: ${STATUS_OPTIONS.join(", ")}` };
	const board = resolveBoard({ root, gh, boardNumber: tok.boardNumber, boardOwner: tok.boardOwner });
	if (!board.ok) return board;
	const optionId = board.optionByName.get(status);
	if (!optionId) return { ok: false, reason: `board has no '${status}' option` };
	let itemId = item;
	if (!/^PVTI_/.test(String(item))) {
		const found = opFindItems({ root, gh, tok, number: Number(item) });
		if (!found.ok) return found;
		if (found.items.length === 0) return { ok: false, reason: `no board item found for issue #${item}` };
		itemId = found.items[0].itemId;
	}
	const edit = gh(root, ["project", "item-edit", "--project-id", board.projectId, "--id", itemId, "--field-id", board.statusFieldId, "--single-select-option-id", optionId, "--format", "json"]);
	if (edit.code !== 0) return { ok: false, reason: edit.stderr || "gh project item-edit failed" };
	return { ok: true, updated: true, itemId };
}

// ---- CLI ------------------------------------------------------------------

function needVal(argv, i, name) {
	const v = argv[i + 1];
	if (v === undefined || v.startsWith("-")) fail(`tracker-ops: ${name} requires a value`);
	return v;
}

function parseArgs(argv) {
	const sub = argv[0];
	const opts = { repoRoot: "", config: "", format: "json", labels: [] };
	for (let i = 1; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--repo-root") opts.repoRoot = needVal(argv, i++, "--repo-root");
		else if (a === "--config") opts.config = needVal(argv, i++, "--config");
		else if (a === "--format") opts.format = needVal(argv, i++, "--format");
		else if (a === "--title") opts.title = needVal(argv, i++, "--title");
		else if (a === "--body") opts.body = needVal(argv, i++, "--body");
		else if (a === "--label") opts.labels.push(needVal(argv, i++, "--label"));
		else if (a === "--parent") opts.parent = Number(needVal(argv, i++, "--parent"));
		else if (a === "--issue") opts.issue = Number(needVal(argv, i++, "--issue"));
		else if (a === "--blocking") opts.blocking = Number(needVal(argv, i++, "--blocking"));
		else if (a === "--login") opts.login = needVal(argv, i++, "--login");
		else if (a === "--number") opts.number = Number(needVal(argv, i++, "--number"));
		else if (a === "--since") opts.since = needVal(argv, i++, "--since");
		else if (a === "--status") opts.status = needVal(argv, i++, "--status");
		else if (a === "--title-contains") opts.titleContains = needVal(argv, i++, "--title-contains");
		else if (a === "--item") opts.item = needVal(argv, i++, "--item");
		else fail(`tracker-ops: unexpected argument: ${a}`);
	}
	return { sub, opts };
}

function main(argv = process.argv.slice(2), { cwd = process.cwd(), gh = defaultGh } = {}) {
	const { sub, opts } = parseArgs(argv);
	if (!sub || !SUBCOMMANDS.includes(sub)) fail(USAGE);
	const inspected = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot, cwd });
	if (!inspected.ok) fail(`tracker-ops: ${inspected.message}`);
	const root = inspected.root;
	const tok = tokens(root);

	let result;
	if (sub === "lookup-node") result = lookupNode({ root, gh, owner: tok.owner, name: tok.name, number: opts.number });
	else if (sub === "create-epic") result = opCreateEpicOrTask({ root, gh, tok, title: opts.title, body: opts.body, extraLabels: opts.labels, kind: "epic" });
	else if (sub === "create-task") result = opCreateEpicOrTask({ root, gh, tok, title: opts.title, body: opts.body, extraLabels: opts.labels, parent: opts.parent, kind: "task" });
	else if (sub === "add-blocked-by") result = opAddBlockedBy({ root, gh, tok, issue: opts.issue, blocking: opts.blocking });
	else if (sub === "frontier") result = opFrontier({ root, gh, tok, parent: opts.parent });
	else if (sub === "claim") result = opClaim({ root, gh, tok, issue: opts.issue, login: opts.login });
	else if (sub === "find-items") result = opFindItems({ root, gh, tok, since: opts.since, status: opts.status, number: opts.number, titleContains: opts.titleContains });
	else if (sub === "set-status") result = opSetStatus({ root, gh, tok, item: opts.item, status: opts.status });
	else if (sub === "board-add") result = boardAdd({ root, gh, boardNumber: tok.boardNumber, boardOwner: tok.boardOwner, repo: tok.repo, issue: opts.issue });

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
