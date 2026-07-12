#!/usr/bin/env node
// verify-task-receipt.mjs — verify a stored portable-validator runtime receipt.
// Confirms the receipt's recorded sha256 hashes match the stored artifact files
// and that both recorded verdicts are PASS. Read-only, no runtime dependencies.
//
// Usage: verify-task-receipt.mjs --dir RECEIPT_DIR
// Exit: 0 verified; 1 verification failed; 2 bad args / unreadable receipt.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function sha256(buf) {
	return createHash("sha256").update(buf).digest("hex");
}

// Returns a sorted array of failure strings; empty means verified.
export function verifyReceipt(dir) {
	const failures = [];
	const receiptPath = join(dir, "receipt.json");
	if (!existsSync(receiptPath)) return [`missing receipt.json in ${dir}`];
	let receipt;
	try {
		receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
	} catch (e) {
		return [`cannot parse receipt.json: ${e?.message || e}`];
	}
	const files = {
		manifestSha256: "manifest.json",
		runnerReportSha256: "runner-report.json",
		generatedAgentSha256: "generated-agent.md",
	};
	for (const [field, file] of Object.entries(files)) {
		const p = join(dir, file);
		if (typeof receipt[field] !== "string" || !/^[0-9a-f]{64}$/.test(receipt[field])) {
			failures.push(`${field} is not a valid sha256`);
			continue;
		}
		if (!existsSync(p)) {
			failures.push(`missing stored file ${file}`);
			continue;
		}
		const actual = sha256(readFileSync(p));
		if (actual !== receipt[field]) failures.push(`${file} hash mismatch (recorded ${receipt[field]}, actual ${actual})`);
	}
	if (receipt.runnerVerdict !== "PASS") failures.push(`runnerVerdict is ${receipt.runnerVerdict}, expected PASS`);
	if (receipt.validatorVerdict !== "PASS") failures.push(`validatorVerdict is ${receipt.validatorVerdict}, expected PASS`);

	// The stored runner report must itself corroborate the recorded verdict, not
	// just hash-match: a genuine FAIL report cannot ride under runnerVerdict:PASS.
	const reportPath = join(dir, "runner-report.json");
	if (existsSync(reportPath)) {
		let report;
		try {
			report = JSON.parse(readFileSync(reportPath, "utf8"));
		} catch (e) {
			failures.push(`cannot parse runner-report.json: ${e?.message || e}`);
			report = null;
		}
		if (report) {
			if (report.verdict !== "PASS" || report.exitCode !== 0) failures.push(`runner-report verdict/exit is ${report.verdict}/${report.exitCode}, expected PASS/0`);
			if (typeof receipt.taskId !== "string") failures.push("receipt taskId is not a string");
			else if (report.taskId !== receipt.taskId) failures.push(`runner-report taskId '${report.taskId}' does not match receipt taskId '${receipt.taskId}'`);
		}
	}
	return failures.sort();
}

function main() {
	const argv = process.argv.slice(2);
	let dir = "";
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--dir") {
			dir = argv[++i];
			if (dir === undefined) {
				console.error("verify-task-receipt: --dir requires a value");
				process.exit(2);
			}
		} else if (argv[i] === "--help" || argv[i] === "-h") {
			console.log("usage: verify-task-receipt.mjs --dir RECEIPT_DIR");
			process.exit(0);
		} else {
			console.error(`verify-task-receipt: unexpected argument: ${argv[i]}`);
			process.exit(2);
		}
	}
	if (!dir) {
		console.error("verify-task-receipt: --dir is required");
		process.exit(2);
	}
	const failures = verifyReceipt(dir);
	if (failures.length === 0) {
		console.log(`receipt verified: ${dir}`);
		process.exit(0);
	}
	for (const f of failures) console.error(`FAIL: ${f}`);
	process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
