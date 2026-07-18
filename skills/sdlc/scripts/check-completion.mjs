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
// Two claim modes:
//   --claim pr-open   --slug <slug> [--closes <n> ...]
//     The Implement/PR phase itself is ready: current branch is pushed with
//     an upstream, exactly one open PR exists for it, that PR's body carries
//     exactly one parseable sdlc declaration block, and the body references
//     every required issue via a closing keyword.
//   --claim epic-done --epic <n> --pr <n>
//     The tracked effort is fully finished: every native sub-issue of the
//     given epic is CLOSED and the given PR is MERGED.
//
// Exit 0 = pass, 1 = fail (claim is false), 2 = error (could not evaluate).

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectRoot } from "./lib.mjs";
import { parseBlock } from "./check-lifecycle.mjs";

const USAGE = "usage: check-completion.sh --claim pr-open --slug <slug> [--closes <n> ...] [--repo-root DIR] [--format text|json]\n   or: check-completion.sh --claim epic-done --epic <n> --pr <n> [--repo-root DIR] [--format text|json]";
const CLOSE_RE = (n) => new RegExp(`\\b(close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s*:?\\s*#${n}\\b`, "i");

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
	if (out.claim === "pr-open" && !out.slug) err("--claim pr-open requires --slug");
	if (out.claim === "epic-done" && (!out.epic || !out.pr)) err("--claim epic-done requires --epic and --pr");
	return out;
}

function setResult(results, id, status, message) {
	results.set(id, { status, message });
}

function checkPrOpen({ root, closes, git, gh }, results) {
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

	const prList = gh(root, ["pr", "list", "--head", branch.stdout, "--state", "open", "--json", "number,body,url"]);
	if (prList.code !== 0) {
		setResult(results, "gh.pr-found", "error", sanitize(prList.stderr || "gh pr list failed"));
		return;
	}
	let prs;
	try {
		prs = JSON.parse(prList.stdout || "[]");
	} catch {
		setResult(results, "gh.pr-found", "error", "gh pr list returned unparseable output");
		return;
	}
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

	const body = typeof pr.body === "string" ? pr.body : "";
	const parsed = parseBlock(body);
	if (parsed.kind !== "block") {
		setResult(results, "declaration.block", "fail", parsed.kind === "invalid" ? parsed.error : "PR body has no sdlc declaration block");
	} else {
		setResult(results, "declaration.block", "pass", "exactly one sdlc declaration block found");
	}

	for (const n of closes) {
		const id = `closes:${n}`;
		if (CLOSE_RE(n).test(body)) setResult(results, id, "pass", `PR body references #${n} with a closing keyword`);
		else setResult(results, id, "fail", `PR body has no closing reference to #${n}`);
	}
}

function checkEpicDone({ epic, pr, gh }, results) {
	const query = 'query($n:Int!){ repository(owner:"OWNER",name:"NAME"){ issue(number:$n){ subIssues(first:100){ nodes { number state } } } } }';
	const repoView = gh(process.cwd(), ["repo", "view", "--json", "owner,name"]);
	if (repoView.code !== 0) {
		setResult(results, "gh.subissues", "error", sanitize(repoView.stderr || "gh repo view failed"));
	} else {
		let repoInfo;
		try {
			repoInfo = JSON.parse(repoView.stdout);
		} catch {
			repoInfo = null;
		}
		const owner = repoInfo?.owner?.login;
		const name = repoInfo?.name;
		if (!owner || !name) {
			setResult(results, "gh.subissues", "error", "could not resolve owner/repo from gh repo view");
		} else {
			const filledQuery = query.replace('"OWNER"', JSON.stringify(owner)).replace('"NAME"', JSON.stringify(name));
			const gql = gh(process.cwd(), ["api", "graphql", "-f", `query=${filledQuery}`, "-F", `n=${epic}`]);
			if (gql.code !== 0) {
				setResult(results, "gh.subissues", "error", sanitize(gql.stderr || "graphql query failed"));
			} else {
				let data;
				try {
					data = JSON.parse(gql.stdout);
				} catch {
					data = null;
				}
				const nodes = data?.data?.repository?.issue?.subIssues?.nodes;
				if (!Array.isArray(nodes)) {
					setResult(results, "gh.subissues", "error", "graphql response missing subIssues.nodes");
				} else {
					const open = nodes.filter((n) => n.state !== "CLOSED");
					if (open.length > 0) setResult(results, "gh.subissues", "fail", `${open.length} open sub-issue(s): ${open.map((n) => `#${n.number}`).join(", ")}`);
					else setResult(results, "gh.subissues", "pass", `all ${nodes.length} sub-issue(s) closed`);
				}
			}
		}
	}

	const prView = gh(process.cwd(), ["pr", "view", String(pr), "--json", "state,number"]);
	if (prView.code !== 0) {
		setResult(results, "gh.pr-merged", "error", sanitize(prView.stderr || "gh pr view failed"));
		return;
	}
	let prInfo;
	try {
		prInfo = JSON.parse(prView.stdout);
	} catch {
		prInfo = null;
	}
	if (prInfo?.state !== "MERGED") setResult(results, "gh.pr-merged", "fail", `PR #${pr} state is ${prInfo?.state ?? "unknown"}, not MERGED`);
	else setResult(results, "gh.pr-merged", "pass", `PR #${pr} is MERGED`);
}

function renderText(report) {
	const lines = [`check-completion: ${report.state} (claim: ${report.claim})`];
	for (const c of report.checks) lines.push(`  [${c.status}] ${c.id}: ${c.message}`);
	return lines.join("\n");
}

function main(argv = process.argv.slice(2), { cwd = process.cwd(), git = defaultGit, gh = defaultGh } = {}) {
	const parsed = parseArgs(argv);
	if (parsed.help) return { report: null, help: true };
	const results = new Map();
	const report = { schemaVersion: 1, claim: parsed.claim ?? null, state: "error", exitCode: 2, checks: [] };
	if (parsed.error) {
		setResult(results, "cli.arguments", "error", parsed.error);
	} else {
		setResult(results, "cli.arguments", "pass", "arguments are valid");
		const inspected = inspectRoot({ repoRoot: parsed.repoRoot, cwd });
		if (!inspected.ok) {
			setResult(results, "root.resolve", "error", inspected.message);
		} else {
			const root = inspected.root;
			setResult(results, "root.resolve", "pass", "consumer root resolved");
			if (parsed.claim === "pr-open") checkPrOpen({ root, closes: parsed.closes, git, gh }, results);
			else if (parsed.claim === "epic-done") checkEpicDone({ epic: parsed.epic, pr: parsed.pr, gh }, results);
		}
	}
	for (const [id, r] of results) report.checks.push({ id, ...r });
	const hasError = report.checks.some((c) => c.status === "error");
	const hasFail = report.checks.some((c) => c.status === "fail");
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
	const jsonMode = argv.includes("--format") && argv[argv.indexOf("--format") + 1] === "json";
	const { report, help } = main(argv);
	if (help) {
		process.stdout.write(`${USAGE}\n`);
		process.exit(0);
	}
	if (jsonMode) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	else process.stdout.write(`${renderText(report)}\n`);
	process.exit(report.exitCode);
}

export { main, parseArgs, checkPrOpen, checkEpicDone, renderText, CLOSE_RE };
