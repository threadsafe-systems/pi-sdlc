#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile, cp, access } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const piBin = process.env.PI_BIN ?? join(repoRoot, "node_modules", ".bin", "pi");
const sandbox = await mkdtemp(join(tmpdir(), "pi-sdlc-e2e-spike-"));
const consumer = join(sandbox, "consumer");
const roundtripConsumer = join(sandbox, "roundtrip-consumer");
const home = join(sandbox, "home");
const staged = join(sandbox, "install-root", "pi-sdlc");
const extension = join(sandbox, "puppet.mjs");
const probe = join(sandbox, "probe.mjs");
const probeResult = join(sandbox, "probe.json");
const requestsPath = join(sandbox, "requests.jsonl");
const serverScript = join(sandbox, "puppet-server.mjs");
const puppetPort = 18765;

const results = [];

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function parseJson(text, label) {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
	}
}

async function exists(path) {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

function runSync(argv, options = {}) {
	const started = performance.now();
	const result = spawnSync(argv[0], argv.slice(1), {
		...options,
		timeout: 30000,
		encoding: "utf8",
		maxBuffer: 10 * 1024 * 1024,
		stdio: ["ignore", "pipe", "pipe"],
	});
	const elapsedMs = Math.round(performance.now() - started);
	if (result.error || result.status !== 0) {
		throw new Error(`${argv.join(" ")} exited ${result.status ?? "?"} signal=${result.signal ?? "none"}\nstdout=${result.stdout ?? ""}\nstderr=${result.stderr ?? ""}`);
	}
	return { stdout: result.stdout, stderr: result.stderr, elapsedMs };
}

function run(argv, options = {}) {
	const started = performance.now();
	return new Promise((resolveRun, rejectRun) => {
		const child = spawn(argv[0], argv.slice(1), {
			cwd: options.cwd,
			env: options.env,
			stdio: ["inherit", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		const timeout = setTimeout(() => child.kill("SIGTERM"), 30000);
		child.on("error", (error) => {
			clearTimeout(timeout);
			rejectRun(error);
		});
		child.on("exit", (status, signal) => {
			clearTimeout(timeout);
			const elapsedMs = Math.round(performance.now() - started);
			if (status !== 0) {
				rejectRun(new Error(`${argv.join(" ")} exited ${status ?? "?"} signal=${signal ?? "none"}\nstdout=${stdout}\nstderr=${stderr}`));
				return;
			}
			resolveRun({ stdout, stderr, elapsedMs });
		});
	});
}

function childEnv(extra = {}) {
	return {
		PATH: process.env.PATH,
		HOME: home,
		LANG: "C",
		LC_ALL: "C",
		PI_OFFLINE: "1",
		PI_SKIP_VERSION_CHECK: "1",
		...extra,
	};
}

const puppetServerSource = String.raw`import { createServer } from "node:http";
import { appendFileSync, writeFileSync } from "node:fs";

const mode = process.env.PUPPET_MODE;
const requestsFile = process.env.PUPPET_REQUESTS;
let requestCount = 0;
const chunk = (delta, finishReason = null) =>
  "data: " + JSON.stringify({ id: "spike", object: "chat.completion.chunk", created: 0, model: "puppet-model", choices: [{ index: 0, delta, finish_reason: finishReason }] }) + "\n\n";
const server = createServer((request, response) => {
  let body = "";
  request.on("data", (part) => { body += part; });
  request.on("end", () => {
    requestCount += 1;
    appendFileSync(requestsFile, JSON.stringify(JSON.parse(body)) + "\n");
    response.writeHead(200, { "content-type": "text/event-stream" });
    if (mode === "roundtrip" && requestCount === 1) {
      response.write(chunk({ role: "assistant", tool_calls: [{ index: 0, id: "spike-tool-call", type: "function", function: { name: "bash", arguments: "" } }] }));
      response.write(chunk({ tool_calls: [{ index: 0, function: { arguments: JSON.stringify({ command: "printf spike-tool-ok" }) } }] }));
      response.write(chunk({}, "tool_calls"));
    } else {
      response.write(chunk({ role: "assistant", content: "spike-puppet-ok" }));
      response.write(chunk({}, "stop"));
    }
    response.end("data: [DONE]\n\n");
  });
});
server.listen(18765, "127.0.0.1", () => writeFileSync(process.env.PUPPET_READY, "ready\n"));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
`;

async function startPuppet(mode) {
	const ready = join(sandbox, `puppet-${mode}.ready`);
	const requestsFile = join(sandbox, `puppet-${mode}.jsonl`);
	const child = spawn(process.execPath, [serverScript], {
		env: {
			PATH: process.env.PATH ?? "",
			HOME: home,
			PUPPET_MODE: mode,
			PUPPET_READY: ready,
			PUPPET_REQUESTS: requestsFile,
		},
		stdio: ["ignore", "ignore", "pipe"],
	});
	child.stderr.on("data", (chunk) => {
		if (process.env.PI_E2E_DEBUG) process.stderr.write(chunk);
	});
	for (let attempt = 0; attempt < 100; attempt += 1) {
		if (await exists(ready)) break;
		await new Promise((resolveWait) => setTimeout(resolveWait, 10));
	}
	assert(await exists(ready), "puppet server child did not become ready");
	const getRequests = async () => {
		if (!(await exists(requestsFile))) return [];
		const content = await readFile(requestsFile, "utf8");
		return content.trim()
			? content
					.trim()
					.split("\n")
					.map((line) => parseJson(line, "puppet request"))
			: [];
	};
	return {
		url: `http://127.0.0.1:${puppetPort}/v1`,
		requestCount: async () => (await getRequests()).length,
		requests: getRequests,
		close: () =>
			new Promise((resolveClose) => {
				child.once("exit", resolveClose);
				child.kill("SIGTERM");
			}),
	};
}

async function main() {
	assert(await exists(piBin), `pinned pi binary is missing: ${piBin}; run npm ci first`);

	await mkdir(consumer, { recursive: true });
	await mkdir(join(home, ".pi", "agent"), { recursive: true });
	await mkdir(dirname(staged), { recursive: true });
	await cp(join(repoRoot, "package.json"), join(staged, "package.json"));
	await cp(join(repoRoot, "skills"), join(staged, "skills"), { recursive: true });
	await cp(join(repoRoot, "templates"), join(staged, "templates"), { recursive: true });
	await writeFile(
		join(home, ".pi", "agent", "settings.json"),
		`${JSON.stringify({
			defaultProjectTrust: "always",
			enableInstallTelemetry: false,
			enableAnalytics: false,
		})}\n`,
	);
	await run(["git", "init", "-q", consumer], { cwd: sandbox, env: childEnv() });

	const install = await run([piBin, "install", staged, "-l"], {
		cwd: consumer,
		env: childEnv(),
	});
	const list = await run([piBin, "list"], { cwd: consumer, env: childEnv() });
	assert(list.stdout.includes(staged), "pi list did not report the staged install root");
	assert(await exists(join(staged, "skills", "sdlc", "SKILL.md")), "staged SKILL.md is missing");
	assert(await exists(join(staged, "templates", "setup-sdlc.md")), "staged /setup-sdlc template is missing");
	results.push({ operation: "L1 install + pi list", elapsedMs: install.elapsedMs + list.elapsedMs });

	await writeFile(
		probe,
		`import { writeFileSync } from "node:fs";\nexport default function (pi) {\n  pi.registerCommand("probe", { handler: async (_args, ctx) => {\n    writeFileSync(process.env.PI_E2E_PROBE_OUT, JSON.stringify({ trusted: ctx.isProjectTrusted(), options: ctx.getSystemPromptOptions() }));\n  }});\n}\n`,
	);

	const trusted = runSync([piBin, "-e", probe, "-p", "--no-session", "--approve", "/probe"], {
		cwd: consumer,
		env: childEnv({ PI_E2E_PROBE_OUT: probeResult }),
	});
	const trustedProbe = parseJson(await readFile(probeResult, "utf8"), "trusted probe result");
	const trustedSkills = JSON.stringify(trustedProbe.options.skills ?? []);
	assert(trustedProbe.trusted === true, "--approve did not trust the project");
	assert(trustedSkills.includes("SKILL.md"), "trusted -p run did not load the installed skill");

	const untrusted = runSync([piBin, "-e", probe, "-p", "--no-session", "--no-approve", "/probe"], {
		cwd: consumer,
		env: childEnv({ PI_E2E_PROBE_OUT: probeResult }),
	});
	const untrustedProbe = parseJson(await readFile(probeResult, "utf8"), "untrusted probe result");
	const untrustedSkills = JSON.stringify(untrustedProbe.options.skills ?? []);
	assert(untrustedProbe.trusted === false, "--no-approve did not refuse project trust");
	assert(!untrustedSkills.includes("SKILL.md"), "--no-approve run loaded project skill unexpectedly");
	results.push({ operation: "headless project trust", elapsedMs: trusted.elapsedMs + untrusted.elapsedMs });

	await writeFile(serverScript, puppetServerSource);
	const probeServer = await startPuppet("probe");
	await writeFile(
		extension,
		`export default function (pi) {\n  pi.registerProvider("puppet", {\n    name: "Puppet",\n    baseUrl: ${JSON.stringify(probeServer.url)},\n    apiKey: "dummy",\n    api: "openai-completions",\n    models: [{ id: "puppet-model", name: "Puppet Model", reasoning: false, input: ["text"], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 128000, maxTokens: 256 }],\n  });\n}\n`,
	);
	const models = await run([piBin, "-e", extension, "--list-models", "puppet"], {
		cwd: consumer,
		env: childEnv(),
	});
	assert(models.stdout.includes("puppet-model"), "-e extension did not register puppet model");
	results.push({ operation: "puppet provider registration", elapsedMs: models.elapsedMs });
	await probeServer.close();
	await mkdir(roundtripConsumer, { recursive: true });
	await run(["git", "init", "-q", roundtripConsumer], { cwd: sandbox, env: childEnv() });

	const roundtripServer = await startPuppet("roundtrip");
	await writeFile(extension, (await readFile(extension, "utf8")).replace(JSON.stringify(probeServer?.url), JSON.stringify(roundtripServer.url)));
	const roundtrip = await run([piBin, "-e", extension, "-p", "--no-session", "--provider", "puppet", "--model", "puppet-model", "--tools", "bash", "complete the tool loop"], { cwd: roundtripConsumer, env: childEnv() });
	assert(roundtrip.stdout.includes("spike-puppet-ok"), "puppet round-trip did not complete");
	const roundtripRequests = await roundtripServer.requests();
	assert(roundtripRequests.length === 2, `expected 2 provider requests, got ${roundtripRequests.length}`);
	assert(
		roundtripRequests[1].messages.some((message) => message.role === "tool" && message.content.includes("spike-tool-ok")),
		"tool result was not returned to puppet",
	);
	await writeFile(requestsPath, `${roundtripRequests.map((request) => JSON.stringify(request)).join("\n")}\n`);
	await roundtripServer.close();
	results.push({ operation: "L2 skeleton tool loop", elapsedMs: roundtrip.elapsedMs });

	const benchmarkServer = await startPuppet("probe");
	await writeFile(extension, (await readFile(extension, "utf8")).replace(/baseUrl: "[^"]+"/, `baseUrl: ${JSON.stringify(benchmarkServer.url)}`));
	const benchmark = await run([piBin, "-e", extension, "-p", "--no-session", "--provider", "puppet", "--model", "puppet-model", "--no-tools", "measure one skeleton turn"], { cwd: roundtripConsumer, env: childEnv() });
	await benchmarkServer.close();
	results.push({ operation: "baseline L2 skeleton turn", elapsedMs: benchmark.elapsedMs });

	const packageJson = parseJson(await readFile(join(repoRoot, "package.json"), "utf8"), "package.json");
	const pin = packageJson.devDependencies["@earendil-works/pi-coding-agent"];
	assert(pin === "0.80.10", `pi dependency is not exactly pinned: ${pin}`);
	await writeFile(join(sandbox, "results.json"), `${JSON.stringify(results, null, 2)}\n`);
	process.stdout.write(
		`${JSON.stringify(
			{
				verdict: "PASS",
				piVersion: pin,
				stagedInstallRoot: staged,
				results,
				artifacts: { requests: requestsPath },
			},
			null,
			2,
		)}\n`,
	);
}

try {
	await main();
} catch (error) {
	console.error(`SPIKE FAIL: ${error instanceof Error ? error.message : String(error)}`);
	process.exitCode = 1;
}
