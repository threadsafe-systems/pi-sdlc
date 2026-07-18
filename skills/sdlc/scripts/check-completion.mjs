#!/usr/bin/env node
// check-completion.mjs — machine-checked "done" gate (retro findings W1/H2).
//
// Unlike check-lifecycle.mjs (deliberately read-only/offline/deterministic),
// this script's checks are inherently live: PR existence, merge state, and
// sub-issue state can only be answered by asking GitHub. It therefore calls
// `gh`, a documented, intentional divergence from check-lifecycle.mjs's
// offline contract — do not fold this script into that one or assume it
// shares its no-network guarantee.
//
// Exit 0 = pass, 1 = fail (claim is false), 2 = error (could not evaluate).

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectRoot } from "./lib.mjs";
import { parseBlock } from "./check-lifecycle.mjs";

const TRACKS = new Set(["irreversible", "reversible", "none"]);
const LIFECYCLE_TRACKS = new Set(["irreversible", "reversible"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const USAGE = "usage: check-completion.sh --claim pr-open --slug <slug> [--closes <n> ...] [--repo-root DIR] [--format text|json]\n   or: check-completion.sh --claim epic-done --epic <n> --pr <n> [--repo-root DIR] [--format text|json]";

function sanitize(value, max = 300) {
	return Array.from(String(value ?? ""), (character) => {
		const code = character.charCodeAt(0);
		return code < 32 || code === 127 ? " " : character;
	})
		.join("")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, max);
}

function defaultGit(cwd, args) {
	const r = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
	return { code: r.error ? -1 : (r.status ?? -1), stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
}

function defaultGh(cwd, args) {
	const r = spawnSync("gh", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
	return { code: r.error ? -1 : (r.status ?? -1), stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
}

function parseArgs(argv) {
	const out = { claim: undefined, slug: undefined, closes: [], epic: undefined, pr: undefined, repoRoot: undefined, format: "text", help: false, error: null };
	const err = (message) => {
		if (!out.error) out.error = message;
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const value = () => {
			const v = argv[++i];
			if (v === undefined || v.startsWith("--")) {
				err(`${a} requires a value`);
				return undefined;
			}
			return v;
		};
		if (a === "--help" || a === "-h") out.help = true;
		else if (a === "--claim") out.claim = value();
		else if (a === "--slug") out.slug = value();
		else if (a === "--closes") {
			const v = value();
			if (v !== undefined) out.closes.push(v);
		} else if (a === "--epic") out.epic = value();
		else if (a === "--pr") out.pr = value();
		else if (a === "--repo-root") out.repoRoot = value();
		else if (a === "--format") {
			const v = value();
			if (v !== undefined && v !== "text" && v !== "json") err("--format must be text or json");
			else if (v !== undefined) out.format = v;
		} else err(`unexpected argument: ${a.includes("=") ? `${a.slice(0, a.indexOf("="))}=…` : a}`);
	}
	if (out.help) return out;
	if (out.claim !== "pr-open" && out.claim !== "epic-done") err("--claim must be pr-open or epic-done");
	if (out.claim === "pr-open") {
		if (!out.slug) err("--claim pr-open requires --slug");
		else if (!SLUG_RE.test(out.slug)) err("--slug must be lowercase hyphenated text");
		if (out.closes.some((n) => !/^[1-9]\d*$/.test(n))) err("--closes values must be positive issue numbers");
	} else if (out.claim === "epic-done") {
		if (!out.epic || !out.pr) err("--claim epic-done requires --epic and --pr");
		else if (!/^[1-9]\d*$/.test(out.epic) || !/^[1-9]\d*$/.test(out.pr)) err("--epic and --pr must be positive issue numbers");
	}
	return out;
}

function setResult(results, id, status, message) {
	results.set(id, { status, message });
}

function parseJsonResult(result, errorMessage) {
	if (result.code !== 0) return { error: sanitize(result.stderr || errorMessage) };
	try {
		return { value: JSON.parse(result.stdout || "null") };
	} catch {
		return { error: `${errorMessage}: unparseable output` };
	}
}

function closingNumbers(pr) {
	return new Set((pr?.closingIssuesReferences ?? []).map((issue) => String(issue.number)));
}

function checkDeclaration(body, slug) {
	const parsed = parseBlock(typeof body === "string" ? body : "");
	if (parsed.kind !== "block") return { error: parsed.kind === "invalid" ? parsed.error : "PR body has no sdlc declaration block" };
	const { track, slug: declaredSlug } = parsed.values;
	if (!TRACKS.has(track)) return { error: "declaration track must be irreversible, reversible, or none" };
	if (!LIFECYCLE_TRACKS.has(track)) return { error: "pr-open requires a lifecycle track, not track: none" };
	if (declaredSlug !== slug) return { error: `declaration slug '${declaredSlug ?? ""}' does not match claimed slug '${slug}'` };
	if (!declaredSlug || !SLUG_RE.test(declaredSlug)) return { error: "declaration slug must be lowercase hyphenated text" };
	return { ok: true };
}

function checkPrOpen({ root, slug, closes, git, gh }, results) {
	const branch = git(root, ["rev-parse", "--abbrev-ref", "HEAD"]);
	if (branch.code !== 0 || !branch.stdout || branch.stdout === "HEAD") {
		setResult(results, "git.branch", "fail", "not on a named branch (detached HEAD?)");
		return;
	}
	setResult(results, "git.branch", "pass", `branch: ${branch.stdout}`);

	const upstream = git(root, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
	if (upstream.code !== 0 || !upstream.stdout) {
		setResult(results, "git.upstream", "fail", "branch has no upstream — push it first");
		return;
	}
	setResult(results, "git.upstream", "pass", `upstream: ${upstream.stdout}`);

	const ahead = git(root, ["rev-list", "--count", "@{u}..HEAD"]);
	if (ahead.code !== 0) {
		setResult(results, "git.pushed", "error", "could not compare HEAD against upstream");
		return;
	}
	if (ahead.stdout !== "0") {
		setResult(results, "git.pushed", "fail", `${ahead.stdout} unpushed commit(s) ahead of upstream`);
		return;
	}
	setResult(results, "git.pushed", "pass", "branch matches its upstream");

	const prList = gh(root, ["pr", "list", "--head", branch.stdout, "--state", "open", "--json", "number,body,url,closingIssuesReferences"]);
	const parsedList = parseJsonResult(prList, "gh pr list failed");
	if (parsedList.error) {
		setResult(results, "gh.pr-found", "error", parsedList.error);
		return;
	}
	const prs = parsedList.value;
	if (!Array.isArray(prs) || prs.length === 0) {
		setResult(results, "gh.pr-found", "fail", `no open PR found for branch ${branch.stdout}`);
		return;
	}
	if (prs.length > 1) {
		setResult(results, "gh.pr-found", "fail", `ambiguous: ${prs.length} open PRs found for branch ${branch.stdout}`);
		return;
	}
	const pr = prs[0];
	setResult(results, "gh.pr-found", "pass", `PR #${pr.number}: ${pr.url ?? ""}`.trim());

	const declaration = checkDeclaration(pr.body, slug);
	if (declaration.error) setResult(results, "declaration.block", "fail", declaration.error);
	else setResult(results, "declaration.block", "pass", "exactly one valid sdlc declaration block found");

	const references = closingNumbers(pr);
	for (const n of closes) {
		const id = `closes:${n}`;
		if (references.has(String(n))) setResult(results, id, "pass", `GitHub records PR #${pr.number} as closing #${n}`);
		else setResult(results, id, "fail", `GitHub does not record PR #${pr.number} as closing #${n}`);
	}
}

function checkEpicDone({ root, epic, pr, gh }, results) {
	const repoView = gh(root, ["repo", "view", "--json", "owner,name"]);
	const parsedRepo = parseJsonResult(repoView, "gh repo view failed");
	if (parsedRepo.error) {
		setResult(results, "gh.subissues", "error", parsedRepo.error);
		return;
	}
	const owner = parsedRepo.value?.owner?.login;
	const name = parsedRepo.value?.name;
	if (!owner || !name) {
		setResult(results, "gh.subissues", "error", "could not resolve owner/repo from gh repo view");
		return;
	}

	const query = `query($n:Int!){ repository(owner:${JSON.stringify(owner)},name:${JSON.stringify(name)}){ issue(number:$n){ subIssues(first:100){ nodes { number state } pageInfo { hasNextPage } } } } }`;
	const gql = gh(root, ["api", "graphql", "-f", `query=${query}`, "-F", `n=${epic}`]);
	const parsedGql = parseJsonResult(gql, "graphql query failed");
	if (parsedGql.error) {
		setResult(results, "gh.subissues", "error", parsedGql.error);
		return;
	}
	const connection = parsedGql.value?.data?.repository?.issue?.subIssues;
	const nodes = connection?.nodes;
	if (!Array.isArray(nodes)) {
		setResult(results, "gh.subissues", "error", "graphql response missing subIssues.nodes");
		return;
	}
	if (connection.pageInfo?.hasNextPage) {
		setResult(results, "gh.subissues", "error", "epic has more than 100 sub-issues; refusing an incomplete completion check");
		return;
	}
	const open = nodes.filter((issue) => issue.state !== "CLOSED");
	if (open.length > 0) setResult(results, "gh.subissues", "fail", `${open.length} open sub-issue(s): ${open.map((issue) => `#${issue.number}`).join(", ")}`);
	else setResult(results, "gh.subissues", "pass", `all ${nodes.length} sub-issue(s) closed`);

	const prView = gh(root, ["pr", "view", String(pr), "--json", "state,number,closingIssuesReferences"]);
	const parsedPr = parseJsonResult(prView, "gh pr view failed");
	if (parsedPr.error) {
		setResult(results, "gh.pr-merged", "error", parsedPr.error);
		return;
	}
	const prInfo = parsedPr.value;
	if (prInfo?.state !== "MERGED") {
		setResult(results, "gh.pr-merged", "fail", `PR #${pr} state is ${prInfo?.state ?? "unknown"}, not MERGED`);
		return;
	}
	const references = closingNumbers(prInfo);
	const missing = nodes.filter((issue) => !references.has(String(issue.number)));
	if (missing.length > 0) setResult(results, "gh.pr-merged", "fail", `PR #${pr} is merged but does not close: ${missing.map((issue) => `#${issue.number}`).join(", ")}`);
	else setResult(results, "gh.pr-merged", "pass", `PR #${pr} is MERGED and closes every epic sub-issue`);
}

function renderText(report) {
	const lines = [`check-completion: ${report.state} (claim: ${report.claim})`];
	for (const c of report.checks) lines.push(`  [${c.status}] ${c.id}: ${c.message}`);
	return lines.join("\n");
}

function main(argv = process.argv.slice(2), { cwd = process.cwd(), git = defaultGit, gh = defaultGh, parsed = undefined } = {}) {
	const args = parsed ?? parseArgs(argv);
	if (args.help) return { report: null, help: true };
	const results = new Map();
	const report = { schemaVersion: 1, claim: args.claim ?? null, state: "error", exitCode: 2, checks: [] };
	if (args.error) {
		setResult(results, "cli.arguments", "error", args.error);
	} else {
		setResult(results, "cli.arguments", "pass", "arguments are valid");
		const inspected = inspectRoot({ repoRoot: args.repoRoot, cwd });
		if (!inspected.ok) {
			setResult(results, "root.resolve", "error", inspected.message);
		} else {
			const root = inspected.root;
			setResult(results, "root.resolve", "pass", "consumer root resolved");
			if (args.claim === "pr-open") checkPrOpen({ root, slug: args.slug, closes: args.closes, git, gh }, results);
			else if (args.claim === "epic-done") checkEpicDone({ root, epic: args.epic, pr: args.pr, gh }, results);
		}
	}
	for (const [id, result] of results) report.checks.push({ id, ...result });
	const hasError = report.checks.some((check) => check.status === "error");
	const hasFail = report.checks.some((check) => check.status === "fail");
	report.state = hasError ? "error" : hasFail ? "fail" : "pass";
	report.exitCode = hasError ? 2 : hasFail ? 1 : 0;
	return { report, help: false };
}

function isMain() {
	try {
		return process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
	} catch {
		return false;
	}
}

if (isMain()) {
	const argv = process.argv.slice(2);
	const parsed = parseArgs(argv);
	const { report, help } = main(argv, { parsed });
	if (help) {
		process.stdout.write(`${USAGE}\n`);
		process.exit(0);
	}
	if (parsed.format === "json") process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	else process.stdout.write(`${renderText(report)}\n`);
	process.exit(report.exitCode);
}

export { main, parseArgs, checkPrOpen, checkEpicDone, renderText, checkDeclaration };
