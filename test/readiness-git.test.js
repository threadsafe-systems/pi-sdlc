// Offline git integrity/topology tests for FS8 `sdlc-status` (AR build T3):
// the AR3 dirty-manifest matrix (staged/unstaged/deleted/type-changed/
// cancelling), AR9 topology matrix (linked worktrees, detached HEAD, symlinked
// roots, monorepo subdirectory, submodule boundary, sparse checkout), and AR4
// git-failure cases. No network, no model calls (AR12).

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

import { git, gitFixture, readyFixture, runStatus, VALID_CONFIG, VALID_MODELS } from "./fs8-helpers.js";

const CONFIG_REL = ".pi/sdlc/sdlc.config.json";
const MODELS_REL = ".pi/sdlc/sdlc.models.json";

function checkStatus(stdout, id) {
	const m = stdout.split("\n").find((l) => l.startsWith(`check: ${id} `));
	assert.ok(m, `missing check line for ${id} in:\n${stdout}`);
	return m.split(" ")[2];
}

function tmp(prefix) {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

// ---------------------------------------------------------------------------
// AR3 — the dirty matrix, for the manifest and for models
// ---------------------------------------------------------------------------

const DIRTY_MUTATIONS = {
	"staged edit": (dir, rel, content) => {
		writeFileSync(join(dir, rel), `${content} `);
		git(dir, ["add", rel]);
	},
	"unstaged edit": (dir, rel, content) => {
		writeFileSync(join(dir, rel), `${content} `);
	},
	"staged deletion": (dir, rel) => {
		git(dir, ["rm", "-q", "--cached", rel]);
		unlinkSync(join(dir, rel));
	},
	"unstaged deletion": (dir, rel) => {
		unlinkSync(join(dir, rel));
	},
	"staged edit reverted in working tree": (dir, rel, content) => {
		writeFileSync(join(dir, rel), `${content} `);
		git(dir, ["add", rel]);
		writeFileSync(join(dir, rel), content); // cancel in the working tree only
	},
	"type change": (dir, rel) => {
		unlinkSync(join(dir, rel));
		symlinkSync("elsewhere", join(dir, rel));
	},
};

test("AR3: every manifest dirty variant exits 3 at adoption.manifest-clean", () => {
	for (const [label, mutate] of Object.entries(DIRTY_MUTATIONS)) {
		const dir = readyFixture();
		try {
			mutate(dir, CONFIG_REL, JSON.stringify(VALID_CONFIG));
			const r = runStatus(["--repo-root", dir]);
			assert.equal(r.code, 3, `${label}: expected exit 3, got ${r.code}\n${r.stdout}${r.stderr}`);
			assert.ok(r.stdout.includes("state: not-ready"), label);
			assert.equal(checkStatus(r.stdout, "adoption.manifest-clean"), "fail", label);
			assert.equal(checkStatus(r.stdout, "config.valid"), "skip", label);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("AR3: every models dirty variant exits 3 at models.clean", () => {
	for (const [label, mutate] of Object.entries(DIRTY_MUTATIONS)) {
		const dir = readyFixture();
		try {
			mutate(dir, MODELS_REL, JSON.stringify(VALID_MODELS));
			const r = runStatus(["--repo-root", dir]);
			assert.equal(r.code, 3, `${label}: expected exit 3, got ${r.code}\n${r.stdout}${r.stderr}`);
			assert.equal(checkStatus(r.stdout, "models.clean"), "fail", label);
			assert.equal(checkStatus(r.stdout, "models.valid"), "skip", label);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

// ---------------------------------------------------------------------------
// AR9 — topology matrix
// ---------------------------------------------------------------------------

test("AR9: a linked worktree is ready on its own HEAD/index/working tree", () => {
	const main = readyFixture();
	const wt = join(tmp("sdlc-wt-"), "linked");
	try {
		git(main, ["worktree", "add", "-q", wt]);
		const r = runStatus(["--repo-root", wt]);
		assert.equal(r.code, 0, r.stdout + r.stderr);
		assert.ok(r.stdout.includes("state: ready"));
	} finally {
		git(main, ["worktree", "remove", "--force", wt]);
		rmSync(dirname(wt), { recursive: true, force: true });
		rmSync(main, { recursive: true, force: true });
	}
});

test("AR9: a dirty manifest in the main checkout does not contaminate a linked worktree", () => {
	const main = readyFixture();
	const wt = join(tmp("sdlc-wt-"), "linked");
	try {
		git(main, ["worktree", "add", "-q", wt]);
		writeFileSync(join(main, CONFIG_REL), `${JSON.stringify(VALID_CONFIG)} `); // dirty main only
		const linked = runStatus(["--repo-root", wt]);
		assert.equal(linked.code, 0, `linked worktree must stay ready:\n${linked.stdout}${linked.stderr}`);
		const mainRun = runStatus(["--repo-root", main]);
		assert.equal(mainRun.code, 3, "main checkout must be not-ready");
	} finally {
		git(main, ["worktree", "remove", "--force", wt]);
		rmSync(dirname(wt), { recursive: true, force: true });
		rmSync(main, { recursive: true, force: true });
	}
});

test("AR9: detached HEAD with the required blobs is ready", () => {
	const dir = readyFixture();
	try {
		git(dir, ["checkout", "-q", "--detach"]);
		const r = runStatus(["--repo-root", dir]);
		assert.equal(r.code, 0, r.stdout + r.stderr);
		assert.ok(r.stdout.includes("state: ready"));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR9: a symlinked consumer root compares equal after realpath and is ready", () => {
	const dir = readyFixture();
	const linkParent = tmp("sdlc-sym-");
	const link = join(linkParent, "via-symlink");
	try {
		symlinkSync(dir, link);
		const r = runStatus(["--repo-root", link]);
		assert.equal(r.code, 0, r.stdout + r.stderr);
		assert.ok(r.stdout.includes("state: ready"));
	} finally {
		rmSync(linkParent, { recursive: true, force: true });
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR9: a configured monorepo subdirectory uses prefixed HEAD blob paths and can be ready", () => {
	const top = gitFixture({
		files: {
			"README.md": "monorepo",
			[`sub/${CONFIG_REL}`]: JSON.stringify(VALID_CONFIG),
			[`sub/${MODELS_REL}`]: JSON.stringify(VALID_MODELS),
		},
	});
	try {
		const r = runStatus(["--repo-root", join(top, "sub")]);
		assert.equal(r.code, 0, r.stdout + r.stderr);
		assert.ok(r.stdout.includes(`root: ${join(top, "sub")}`));
		assert.ok(r.stdout.includes(`current HEAD contains sub/${CONFIG_REL}`), "blob path must be prefixed");
		// the top level itself is not adopted
		assert.equal(runStatus(["--repo-root", top]).code, 1);
		// a dirty subdirectory manifest is caught through the prefixed path
		writeFileSync(join(top, "sub", CONFIG_REL), `${JSON.stringify(VALID_CONFIG)} `);
		assert.equal(runStatus(["--repo-root", join(top, "sub")]).code, 3);
	} finally {
		rmSync(top, { recursive: true, force: true });
	}
});

test("AR9: a consumer root that is a git submodule is inspected as its own worktree", () => {
	const inner = readyFixture();
	const outer = gitFixture({ files: { "README.md": "parent" } });
	try {
		execFileSync("git", ["-C", outer, "-c", "user.email=t@t", "-c", "user.name=t", "-c", "protocol.file.allow=always", "submodule", "add", "-q", inner, "vendor/consumer"], { stdio: ["ignore", "pipe", "pipe"] });
		git(outer, ["commit", "-q", "-m", "add submodule"]);
		const sub = join(outer, "vendor", "consumer");
		const r = runStatus(["--repo-root", sub]);
		assert.equal(r.code, 0, `submodule must be ready as its own worktree:\n${r.stdout}${r.stderr}`);
		assert.ok(r.stdout.includes("current HEAD contains .pi/sdlc/sdlc.config.json"), "no parent-relative prefix");
		// the parent does not recurse into submodules: it is simply not adopted
		assert.equal(runStatus(["--repo-root", outer]).code, 1);
	} finally {
		rmSync(outer, { recursive: true, force: true });
		rmSync(inner, { recursive: true, force: true });
	}
});

test("AR9: sparse checkout omitting required committed files deterministically fails, never ready", () => {
	const src = readyFixture();
	const cloneParent = tmp("sdlc-sparse-");
	const missingBoth = join(cloneParent, "missing-both");
	const missingModels = join(cloneParent, "missing-models");
	try {
		// omit the whole .pi tree: manifest committed in HEAD but absent from the working tree
		execFileSync("git", ["clone", "-q", "--no-checkout", src, missingBoth], { stdio: ["ignore", "pipe", "pipe"] });
		git(missingBoth, ["sparse-checkout", "init", "--cone"]);
		git(missingBoth, ["sparse-checkout", "set"]);
		git(missingBoth, ["checkout", "-q"]);
		const r1 = runStatus(["--repo-root", missingBoth]);
		assert.equal(r1.code, 2, `sparse-omitted manifest must be config.valid:error\n${r1.stdout}${r1.stderr}`);
		assert.equal(checkStatus(r1.stdout, "config.valid"), "error");

		// omit only the models file: config validates, models.valid fails (exit 3)
		execFileSync("git", ["clone", "-q", "--no-checkout", src, missingModels], { stdio: ["ignore", "pipe", "pipe"] });
		git(missingModels, ["sparse-checkout", "set", "--no-cone", "/*", `!/${MODELS_REL}`]);
		git(missingModels, ["checkout", "-q"]);
		const r2 = runStatus(["--repo-root", missingModels]);
		assert.equal(r2.code, 3, `sparse-omitted models must be models.valid:fail\n${r2.stdout}${r2.stderr}`);
		assert.equal(checkStatus(r2.stdout, "models.valid"), "fail");
	} finally {
		rmSync(cloneParent, { recursive: true, force: true });
		rmSync(src, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// AR4 (git cases) — inaccessible/corrupt repositories are errors
// ---------------------------------------------------------------------------

test("AR4: a corrupt .git pointer is git.repository:error, exit 2", () => {
	const dir = tmp("sdlc-corrupt-");
	try {
		mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
		writeFileSync(join(dir, CONFIG_REL), JSON.stringify(VALID_CONFIG));
		writeFileSync(join(dir, ".git"), "gitdir: /nonexistent/gitdir\n");
		const r = runStatus(["--repo-root", dir]);
		assert.equal(r.code, 2, r.stdout + r.stderr);
		assert.equal(checkStatus(r.stdout, "git.repository"), "error");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
