# PR panel round 1 — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Base: `2aa5a89`; commit: `3e81a25`.

Turn budget wrap-up was requested after 10 assistant turns (soft limit 10, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

# Review findings — irreversible-track PR review, commit 3e81a253, base 2aa5a89 (reviewer: claude-fable-5, round 1)

Verification base executed before findings: full `npm test` (518 pass), `node --test` on both changed test files and `test/frozen-surfaces.test.js` (all green), Biome clean on both touched JS files, `config-doc.mjs check` → `current`, all six receipt SHA-256 hashes recomputed and matching, working tree clean at 3e81a253, grounded commit `7710509` confirmed an ancestor. Detector replicated and probed against the exact corpus: hits = exactly the two exemptions; all Spec C4.3 disclosed negatives/positives reproduce (variable argv, template-literal ref, `rev-parse HEAD`, `init -b main`, `maintenance`/`domain` FP probes all clean). Mechanical mutations M-A…M-H (new offending file, rotted `merge-base` token, non-recursive sweep, dropped `pinned` anchor, duplicated law, retitled heading, reintroduced literal subprocess, spec-gap table) each turned the right scenario red — DSP1-DSP7, DSP8/9/10, DSP16, IDV3/14/17 are non-vacuous as claimed. No high-severity defect found.

### DSP11's PV1 scenario evidence is partially vacuous: the ownership-comment half has no mechanical witness

- severity: medium
- confidence: high
- origin: NEW
- file: docs/validation/diff-scoped-test-premises/t1.json (DSP11 evidence mapping); test/iteration-disposition.test.js:420-421, 431-432
- line: t1.json approx 44-50; test lines exact
- problem: T1's manifest maps DSP11 to `tests.task` (`node --test test/iteration-disposition.test.js`), and the committed runner report records `DSP11: PASS` on that basis — but nothing in that file (or anywhere) asserts the C5.4 present-ownership comments exist or obey the no-process-history rule. Reproduced: deleting both retirement comments from a scratch copy leaves `tests.task` exit 0 and the T2 guard silent (0 failures). The "diff-scoped tests absent" half of DSP11 is enforced only cross-task by T2's `helperPattern` (a reintroduced `baseRef(` call trips DSP7), not by the check DSP11 cites.
- repro_or_impact: The PASS receipt attests a scenario its mapped command cannot falsify — exactly the "attested only by the agent that owed it" gap PV1 exists to close. Post-merge, the Spec's C5.4 comment contract (including "must not cite the Plan, panel, PR") is prose-only; a cleanup commit can delete both comments with every check green.

### Spec-panel round-2 Gemini verdict self-declares "output may be partial", but the consolidated record counts it as a full CLEAR A-H

- severity: medium
- confidence: high
- origin: NEW
- file: docs/reviews/spec-review-diff-scoped-test-premises-2026-08-06/round2-gemini-3.1-pro-preview.md; …/consolidated.md
- line: round2-gemini line 5; consolidated line 117
- problem: The committed round-2 Gemini artifact contains the runner's own warning — "Turn budget wrap-up was requested after 8 assistant turns… Output may be partial" — followed only by eight one-line CLEARs and zero findings. The consolidated adjudication records "Gemini returned CLEAR A-H with no findings" and uses it as the round's cross-model disagreement evidence ("genuine cross-model disagreement (Gemini clean, Fable three findings)") without disclosing the partial-output flag.
- repro_or_impact: On the irreversible track a two-model floor is load-bearing; a reviewer that ran out of budget before completing its pass is weaker evidence than a clean CLEAR, and the adjudicator's dismissal-posture disclosure leans on that round's "disagreement" being genuine. This is a panel-integrity/docs-honesty defect in the committed gate record, not a code bug; it does not by itself invalidate the round (Fable's full round-2 review exists), but the consolidated record should disclose it.

### IDV17's "no subprocess" claim is silently evadable; the import allowlist admits `node:child_process`

- severity: low
- confidence: high
- origin: NEW
- file: test/iteration-disposition.test.js
- line: 463-481 (IDV17), import allowlist approx 465-468, banned list approx 471-474, inventory approx 476-480
- problem: The header and assertion now claim "no subprocess, model, or network calls", but the mechanism is narrower: the import allowlist accepts any `node:` builtin — including `node:child_process` — the banned-pattern list omits `execFileSync(`/`spawnSync(` shapes (only `execSync(`, `spawn(`), and the inventory regex requires a literal quoted first argument. Reproduced: adding `import { execFileSync } from "node:child_process"` plus `execFileSync(cmd, …)` with a joined-string command passes IDV17 and the whole file with exit 0, and the T2 guard is also silent.
- repro_or_impact: A future edit can reintroduce exactly the subprocess class this slice retired, with every guard green. The evasion shape pre-exists (the old `["git"]` assertion had the same literal-arg blind spot), but the new absolute claim widens the gap between assertion message and mechanism; either ban the `node:child_process` specifier in the allowlist loop (one line, closes the honest path) or soften the claim.

### DSP12's offline guard does not cover static network-module imports (N1 claims more than the mechanism enforces)

- severity: low
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 150-153 (offlinePatterns)
- problem: N1 requires "no child process, network, model, shell", but DSP12 bans only the `node:child_process` specifier string, `fetch(`, and dynamic `import(`. Reproduced: adding `import { get } from "node:https";` to the guard file passes all eight tests with exit 0 (same for `node:net`/`node:dgram`). Unlike IDV17, this file has no import allowlist at all.
- repro_or_impact: The N1/DSP12 gate can report PASS for a guard that performs network I/O via a static builtin import. Cheap fix: reuse IDV17's allowlist shape (every static import must be `node:` **and** not child_process/net/http/https/dgram), or an explicit denylist.

### DSP4's non-source-fixture assertion is tautological

- severity: low
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 114-117
- problem: `files.every((path) => SOURCE_EXTENSIONS.has(extname(path)))` is applied to the output of `sourceFiles()`, which filters by the very same `SOURCE_EXTENSIONS` set; the assertion ("the sweep admitted a non-source fixture") can never fail under any mutation of the corpus and is vacuous by construction. The real content of DSP4 is the two `includes` checks (proven non-vacuous by mutation M-C).
- repro_or_impact: Harmless today, but it is a permanently-green assertion inside the very test whose Spec lineage (plan rounds 1-3, DSP5/DSP16) exists to kill vacuous checks; delete it or assert against an independently-enumerated file list.

No high-severity findings. Carry landing: clean — no `CARRY-TO-BACKLOG`/`CARRY-TO-BUILD`/`CARRY-TO-IMPLEMENT` is minted anywhere in this run's Plan, Build plan, Spec, or panel records (grep-verified); the one out-of-band obligation, the S1 handoff, is landed as issue #192 comment 5202737602 and mechanically witnessed by the executed `static.handoff` PASS in T2's committed runner report (DSP14). DSP15 independently re-verified (suite/Biome/config-doc/ASD19 all green; no FROZEN path in the diff). Scope, frozen-surface safety, and docs-authority checks (law stated once in `phase-spec.md` §4:50-56, pointer-only in `phase-implement.md` §4:46-48, DSP1/DSP2 mutation-verified) all hold.
