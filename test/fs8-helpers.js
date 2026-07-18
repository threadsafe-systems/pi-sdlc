// Shared FS8 test fixtures/helpers for sdlc-status tests. Not a test file —
// side-effect free; node --test loads it as an empty passing file.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const repoRootDir = dirname(here);
export const statusMjs = join(repoRootDir, "skills", "sdlc", "scripts", "sdlc-status.mjs");
export const statusSh = join(repoRootDir, "skills", "sdlc", "scripts", "sdlc-status.sh");

export const VALID_CONFIG = {
	schemaVersion: 3,
	prefix: "acme",
	labelPrefix: "acme-sdlc",
	announce: "a",
	review: { brainstorm: "human", design: "panel", code: "panel", tasks: "subagent", panelSize: 1, onShortfall: "proceed" },
	shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
	panels: {
		phases: {
			plan_review: { prefer: ["prov/model"] },
			spec_review: { prefer: ["prov/model"] },
			pr_review: { prefer: ["prov/model"] },
			task_validate: { prefer: ["prov/model"] },
		},
	},
};

// Isolated child env: no SDLC_ROOT, no ambient credentials.
export function baseEnv(extra = {}) {
	return { PATH: process.env.PATH, HOME: process.env.HOME, ...extra };
}

export function runStatus(args, { cwd, env, argv0 } = {}) {
	const r = spawnSync(argv0 ?? process.execPath, argv0 ? args : [statusMjs, ...args], {
		cwd: cwd ?? process.cwd(),
		env: env ?? baseEnv(),
		encoding: "utf8",
	});
	return { code: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

export function git(dir, args) {
	execFileSync("git", ["-C", dir, "-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args], {
		stdio: ["ignore", "pipe", "pipe"],
		encoding: "utf8",
	});
}

// A git fixture. files: { relPath: content }; commit: whether to commit them.
export function gitFixture({ files = {}, commit = true, init = true } = {}) {
	const dir = realpathSync(mkdtempSync(join(tmpdir(), "sdlc-fs8-")));
	if (init) git(dir, ["init", "-q"]);
	for (const [rel, content] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, rel)), { recursive: true });
		writeFileSync(join(dir, rel), content);
	}
	if (init && commit && Object.keys(files).length > 0) {
		git(dir, ["add", "-A"]);
		git(dir, ["commit", "-q", "-m", "fixture"]);
	}
	return dir;
}

export function readyFixture(over = {}) {
	return gitFixture({
		files: {
			".pi/sdlc/sdlc.config.json": JSON.stringify(VALID_CONFIG),
			...over,
		},
	});
}
