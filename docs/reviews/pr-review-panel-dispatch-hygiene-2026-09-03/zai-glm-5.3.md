### CI is red on PR 274; the Plan's DoD "CI is green on the PR" is false

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene.md
- line: 221
- problem: The Definition of done states "CI is green on the PR, which is the authoritative signal the local macOS baseline cannot give", and the PR body leans its entire A6 baseline argument on that signal. Live `gh pr checks 274` shows `commit-lint` **fail**: `.github/workflows/commit-lint.yml` runs `scripts/check-commit-messages.mjs`, which validates `PR_TITLE` against the conventional-commit regex, and the title "Panel dispatch hygiene: roster rot and reviewer time budgets" does not match. The three branch commits themselves are conventional (`docs(reference):`, `chore(config):`, `docs(plans):`).
- repro_or_impact: `gh pr checks 274` → `commit-lint fail` (run 33851666944); the log prints `Non-conventional commit header(s) found: - PR title: Panel dispatch hygiene: roster rot and reviewer time budgets`. A required failing check blocks merge and falsifies the run's completion evidence; the whole "no new local failures, CI is authoritative" verification story currently rests on a red CI. Fix is a PR-title retitle, not a code change — but the DoD claim as committed is false.

### "No entry changed position; only ids moved" is false for `pr_review` — the array grew 8→9

- severity: medium
- confidence: high
- origin: NEW
- file: .pi/sdlc/sdlc.config.json
- line: 46
- problem: The `$comment` asserts "No entry changed position; only ids moved" (repeated as Plan DoD line 199 "the diff moves no entry's position within any `prefer` array" and PR body "**No entry changed position.**"). The old `pr_review` array had 8 entries; the new one has 9, with `anthropic/claude-opus-5` inserted at index 3 (config lines 59–68). The Bedrock entry moved 4th→5th and the four entries after it (`deepseek-v4-pro`, `glm-5.3`, `gemini-3.1-pro-preview`, `kimi-k3`) each moved down one index. The build plan's own T1 (line 51–53) admits the insertion ("with direct `anthropic/claude-opus-5` inserted ahead of it as its principal") while claiming "without moving any entry's position within its `prefer` array" in the same bullet.
- repro_or_impact: The invariant that actually holds is "no entry was re-ranked relative to the others"; the invariant claimed three times is index-stability, which a mechanical check of this diff falsifies. The Plan's DoD is the falsifiable list standing in for scenario coverage on the reversible track; one of its checkable items is false as worded, and a future editor auditing the roster against the `$comment` will find a candidate-order change the record denies.

### Roster-liveness evidence is overstated: "every id … answered by a live probe" is not what was probed, and a PONG cannot establish dispatchability

- severity: medium
- confidence: high
- origin: NEW
- file: .pi/sdlc/sdlc.config.json
- line: 46
- problem: The `Generation sweep 2026-09-03` sentence claims "every id checked against `pi --list-models` and answered by a live probe". The run's own record documents a **four-candidate** probe (Plan line 49–53; PR body lists exactly four `PONG-OK` lines: gemini-vertex, opus-5, eu-bedrock-opus-5, eu-bedrock-sonnet-5). Even reading "every id" as only the four that moved, `fable-5-1` and `glm-5.3` were not among the probed candidates. More substantively, the probe type cannot support the liveness claim the roster needs: a one-shot `pi --print` PONG (resolve-panel.mjs `pongOk`, 60s timeout) does not exercise subagent dispatch, and this run's own live context established that the pool lead `anthropic/claude-fable-5-1` cannot be dispatched as a subagent child here (version gate), `deepseek/deepseek-v4-pro` and `-flash` return 402 Insufficient Balance (a `--pong` resolve today drops both), and `anthropic/claude-haiku-4-5` fails an identity check — so `task_validate`'s top two entries are non-dispatchable and its effective validator is the third entry, `zai/glm-5.3:low`.
- repro_or_impact: `node skills/sdlc/scripts/resolve-panel.mjs task_validate` resolves `anthropic/claude-haiku-4-5` as the validator (floor 1), which per the same live evidence fails at dispatch. A PR panel authored by a non-fable model resolves `fable-5-1` as its lead panelist → dead child → wasted dispatch, diagnosis and replacement wave, which is precisely the failure mode the Plan's problem statement says this change exists to eliminate. The reliability NFR ("No configured id fails to resolve — PONG check over the corrected pools") is not delivered by the evidence cited.

### The whole-wave budget raise — the doctrine's primary case — is the one knob left unquantified

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 195
- problem: The per-model rule is precise ("retry the **same** model once at double the budget"), but the whole-wave rule says only "when a whole wave times out, raise the budget for the whole wave" — no factor, no ceiling, no statement that the raise happens once. The single calibration observation (PR #261) was a *whole-wave* timeout, so the case the section was written for is the one without a number; a session may raise to 50 minutes (guaranteed re-failure) or to six hours (idle expense) and still be inside the prose.
- repro_or_impact: A session following §5 as law hits a 3-reviewer wave timeout at 45 min and must invent the escalation factor. For a change whose objective is "a panel dispatch never silently inherits" an unbounded default, the wave-level escalation is unstated cost machinery — the proportionality defect the section itself exists to close.

### §5 route-twin sentence overclaims resolver behaviour: "such a twin never appears in the resolved panel"

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 204
- problem: The skip happens at the dedupe gate (resolve-panel.mjs:229 `if (seenModels.has(identity))`), which fires only when the direct entry was already added. If the direct `anthropic/claude-opus-5` is dropped at the credentials gate (resolve-panel.mjs:221 `if (!hasCreds(pm))`) while AWS credentials exist, the Bedrock twin is added to the panel as the sole opus-5 route. The config `$comment`'s wording ("skipped at resolution whenever the direct entry is chosen") is the accurate form; §5's absolute "never appears" is conditionally false in a consumer configuration with Bedrock creds but no direct Anthropic key/env var — and this reference is shipped contract prose for arbitrary consumer configs ("where the phase's pool declares one").
- repro_or_impact: A reader of the shipped skill concludes the twin is dispatch-recovery-only dead weight; in a Vertex/AWS-only repo the twin is in fact a resolved panelist, and reasoning built on the absolute claim (e.g. "the panel never contains a twin, so dispatch recovery always has one in reserve") breaks exactly when the direct provider has an outage or missing creds.

### Timeout remains listed under the transient retry-then-replace remedy it was reclassified out of

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 179
- problem: The recovery paragraph still enumerates "timeout" among infra failures whose sanctioned remedy is "retry that model once **when the failure may be transient**, then replace it with the next untried, credentialed model" — two paragraphs before the new rung declares "A timeout is deterministic, not transient" and calls that same remedy futile ("the transient-failure remedy above fixes neither"). The bridging sentence "Two causes have a better first move than replacement, below" gestures at the carve-out but leaves the enumerated item contradicting the reclassification.
- repro_or_impact: A session reading linearly can apply the general rule to a timeout (same-budget retry, then replace) — exactly the behaviour the change says is wrong. The list item should have been carved out ("every infra failure except the two causes below") or "timeout" removed from the enumeration.

### The ≥30-file / ≥2,000-line trigger is presented under a calibration it does not have

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 168
- problem: "Treat those figures as a floor open to revision … they are calibrated from a single observation, a 70-file, ~5,200-line PR panel" — the observation only brackets the outcome at one size (30 min failed, 90 min completed at 70 files / +5,148−12). It supports neither the 45-minute floor (untested) nor the ≥30-file/≥2,000-line threshold, which sits at an invented midpoint between "no trigger" and the one observed data point. The honesty framing ("single observation") is correctly attached to the minute figures but silently lends its provenance to the size trigger too.
- repro_or_impact: Future readers will treat 30/2,000 as evidence-based when it is untested interpolation; a 40-file, 1,500-line PR dispatches at 45 minutes with no data saying that is safe, and the provenance sentence gives no warning that the trigger specifically is unfounded.

### Cross-reference incoherence: phase-implement.md still classes a provider timeout as transient infra noise with a same-budget retry

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-implement.md
- line: 246
- problem: The implement-phase worker rule ("Infra failure gets one automatic retry") enumerates "a provider timeout … that is infrastructure noise … Retry that exact dispatch once, automatically" — a same-budget retry. §5 now asserts as law that a child that ran out of budget "will run out again at the same budget". Both references govern dispatches of the same `subagent` tool with the same silent 30-minute default; the reclassification was written unscoped ("A timeout is deterministic, not transient") and now contradicts a sibling governing document.
- repro_or_impact: The same session follows opposite timeout laws one phase apart: implement workers get a futile same-budget retry (the exact waste PR #261 demonstrated), while reviewers get the raised-budget retry. Either §5's claim should be scoped to reviewer panels, or phase-implement.md's noise list needed the same carve-out.

---

No high-severity findings. Frozen surfaces verified untouched (`test/frozen-surfaces.test.js` green; no `FROZEN` file in the diff). All 25 configured ids verified present in live `pi --list-models` output, each naming the current generation of its family (gemini-3.1-pro is the newest pro-tier entry; the 3.5–3.8 entries are flash-tier siblings, not supersessions). Route-twin mechanics verified against `resolve-panel.mjs` (`modelIdentity` folds `amazon-bedrock/eu.anthropic.claude-opus-5` → `anthropic/claude-opus-5`; dedupe at line 229). Wave-number/label coherence, `review.onShortfall`, sub-floor exemption and delta-dispatch rungs verified consistent with the new text and with `system-reference.md`'s telemetry map. Carry landing verified: #141 carries the PONG-falsification comment, #273 is filed and open, and the build plan's single CARRY-TO-IMPLEMENT lands in this review.

VERDICT: REVISE
