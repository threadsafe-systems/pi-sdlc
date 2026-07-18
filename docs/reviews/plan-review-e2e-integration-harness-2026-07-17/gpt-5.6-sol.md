### 1. The CI sandbox cannot enforce its isolation definition

- severity: high
- confidence: high
- location: Proposed decision 4 and Definition of done 3 (plan lines 57–63, 117–120)
- defect: Redirecting `HOME`, clearing credential variables, and removing `gh` do not make non-local network calls fail or prevent writes outside scratch directories, so the stated CI guarantee is not implementable by the chosen env-based sandbox.
- evidence: The plan promises “a scenario attempting network egress beyond localhost fails” and “no writes outside the scratch dirs”; pi's container guide says pi runs with all permissions and recommends isolating the whole process for filesystem/network control (`docs/containerization.md:3-17,45-81`). Pi can also contact `pi.dev` at startup unless `--offline`/`PI_OFFLINE=1` is set (pi `README.md:305-312,665`), which the plan does not require.
- impact: DoD 3 can pass only through incomplete observation rather than confinement; a bash/tool call can use `curl`, `git`, Node networking, credential helpers, or arbitrary absolute paths despite the checks, allowing exactly the network, credential, tracker, or host-write side effects the objective says are impossible.
- fix: Either require a network/filesystem policy boundary in CI (container/OpenShell/equivalent) or narrow the DoD to enumerated observed side effects, and in either case mandate an allowlisted child environment plus `PI_OFFLINE=1`.

### 2. Local-path installation makes installed-path fidelity impossible

- severity: high
- confidence: high
- location: Objective, L1 scope, and Definition of done 4 (plan lines 20–24, 71–76, 121–123)
- defect: `pi install <local-checkout>` does not create an installed copy, yet the plan requires scripts to run from an installed package location “never the repo checkout.”
- evidence: Pi documents that local package paths “are added to settings without copying” (`docs/packages.md:107-114`); the plan explicitly uses the local checkout as that path. The repo's existing installed-path test instead copies the skill into a separate temporary `installed/pi-sdlc` tree before invocation (`test/path-plumbing.test.js:12-25,70-118`).
- impact: L1 will resolve scripts back into the working checkout and can pass while checkout-relative path coupling remains, so it cannot make the claimed installed-layout assertion or guard the ADR 0020 regression class.
- fix: Stage a complete package copy in a scratch install root before `pi install`, assert pi resolves resources and scripts only under that root, and describe the claim as local-package-source fidelity rather than a pi-managed copied install.

### 3. L2 can pass while the installed skill is absent

- severity: high
- confidence: high
- location: Claim ladder L2, decision 1, puppet format, and DoD 5 (plan lines 36–49, 77–80, 124–126)
- defect: A state machine of “trigger regex → canned assistant turn/tool call” can emit every expected tool call, file effect, announce, and hook line from scenario data without ever receiving or reading the installed `SKILL.md`; no DoD item proves that the skill bytes reached the provider request.
- evidence: The plan claims “skill prose reaches the model” but defines triggers over the incoming conversation and canned outputs, then checks only effects/markers. Pi's law is prose loaded from `skills/sdlc/SKILL.md`, while the proposed server itself supplies the behavior being asserted.
- impact: The harness can test its own script and pi's generic tool loop while package discovery or skill loading is broken—the exact vacuous-pass failure the L2 claim is meant to exclude.
- fix: Require the puppet protocol to observe and validate installed-skill content in a request/tool-result before unlocking scenario actions, and add a harness negative control showing the same scenario fails when that skill is omitted or its required marker is mutated.

### 4. Scenario D assumes an upstream refusal contract that does not exist

- severity: high
- confidence: high
- location: L2 scenario D (plan lines 88–89) and sequencing dependency on PR #92 (lines 13–16)
- defect: The plan requires `task_validate` to refuse when `review.tasks` is `self`, but the binding v3 spec defines an explicit refusal only for `off`, not `self`; current behavior deliberately resolves a one-model task panel for both `self` and `subagent`.
- evidence: The v3 vocabulary defines `tasks` as `subagent | self | off` (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:53-62`), while ICA14 requires refusal only for `off` (`:312-315`). At HEAD, `test/resolve-panel-lifecycle.test.js:133-139` asserts successful resolution for both `self` and `subagent`; `decomposeGateMode` also has no `self` mode (`skills/sdlc/scripts/lib.mjs:133-143`).
- impact: After #92, this scenario either fails against the approved upstream contract or forces this reversible test-only stream to change runtime behavior that is explicitly out of scope.
- fix: Make D assert the agent-level dispatch/no-dispatch delta without requiring a `resolve-panel` self refusal, unless #92 first adds that refusal to its binding spec and implementation.

### 5. `publishToTracker` cannot be covered at L1

- severity: high
- confidence: high
- location: L2 scenario exclusions E/F (plan lines 92–95)
- defect: The plan says E is covered at “L1 assertion strength” by asserting no `gh` attempt, but `shape.publishToTracker` is agent-executed prose law and L1 has no model or other actor that could attempt tracker publication.
- evidence: The upstream key-reader audit identifies `shape.publishToTracker` only as a SKILL prose-law reader (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:247-249`), and P1 assigns the decision to the SKILL (`:214-217`). Merely making `gh` absent proves neither that the dial was read nor that the positive threshold would cause an attempt.
- impact: The advertised “v3 behaviour-change net” omits one of v3's behavior-changing prose dials and its negative-only assertion passes vacuously even if the agent ignores the key in both directions.
- fix: Move E to L2 with a logging `gh` stub and positive/negative twins (`publishToTracker` threshold reached versus `never`/below threshold) that assert attempt versus no attempt without allowing mutation.

### 6. DoD 5 refers to markers that scenarios B and G never define

- severity: medium
- confidence: high
- location: L2 scenarios B/G and Definition of done 5 (plan lines 83–91, 124–126)
- defect: The brainstorm on/off delta has no named mechanical marker, and G names only an ellipsized hook prefix rather than the exact pre-execution and result lines, so “assert exactly the mechanical markers named” does not determine a pass/fail oracle.
- evidence: `review.brainstorm` is a prose-law reader in the v3 audit (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:241`), while current SKILL.md defines no fixed brainstorm marker (`skills/sdlc/SKILL.md:90-124`). Hook law requires an exact command/use line before execution and an exact result line afterward (`skills/sdlc/SKILL.md:423-435`), not merely `[sdlc hook] implement:before …`.
- impact: A spec cannot derive stable negative twins without inventing new scope: B must inspect free prose contrary to decision 1, and G could pass while omitting the mandatory result line or emitting the pre-line after the hook executes.
- fix: Define B in terms of ordered tool/file effects (human gate blocks phase entry versus off permits it), and define G's fixture type plus exact command/use line, exact result line, and their positions around the hook tool call and first phase write.

### 7. The claimed custom-provider hinge omits required provider fields

- severity: medium
- confidence: high
- location: Grounded hinges and L2 puppet provider (plan lines 8–12, 77–80)
- defect: The plan states that `registerProvider(name, { baseUrl, api })` is sufficient for a new `puppet` provider, but pi requires a new provider to declare models and requires an API key unless OAuth is used; it also leaves the headless provider/model selection unspecified.
- evidence: Pi says “To add a completely new provider, specify `models`” (`docs/custom-provider.md:93-96`), shows the complete model definition at `:42-59`, and marks `apiKey` required when defining models unless OAuth (`:624-635`). Headless model selection is exposed through `--provider` and `--model` (pi `README.md:549-555`).
- impact: T1 can fail before any scenario request reaches the local server, and the Build agent must invent auth/model selection behavior despite the plan claiming these hinges were already verified and ratified.
- fix: Bind the puppet extension to a full zero-cost model declaration, dummy non-secret `apiKey`, localhost base URL, and exact `--provider puppet --model <id>` invocation.

### 8. The determinism check is equivalent to rerunning the pass condition

- severity: medium
- confidence: high
- location: Definition of done 2 (plan lines 115–116)
- defect: “Two consecutive full runs produce identical verdicts” compares only pass/fail, while DoD 1 already requires each full run to exit 0; it does not test deterministic transcripts, ordered calls, or effects.
- evidence: The proposed CI implementation is only “running the suite twice,” and the scenarios' observable outputs include transcripts and ordered tool effects (plan lines 67–80) that are not included in the comparison.
- impact: Both runs can pass with different branches, unmatched extra calls, ordering, or artifacts, so the stated determinism outcome is not evidenced and protocol nondeterminism can remain PR-blocking flake.
- fix: Have each run emit a normalized scenario manifest of matched steps, ordered tool calls, markers, and file hashes, then byte-compare those manifests with only explicitly listed volatile fields removed.

### 9. The CI budget is neither exact nor in the DoD

- severity: medium
- confidence: high
- location: CI scope and Risks (plan lines 96–97, 146–147)
- defect: The plan specifies `≤ ~3 min`, an internally ambiguous threshold, and then says the budget is in DoD even though no DoD item enforces runtime or timeout.
- evidence: Definition of done lines 110–129 contains no duration check; the existing CI job already runs `npm ci`, the full unit corpus, and lint (`.github/workflows/ci.yml:10-31`), while the proposed separate job adds installation plus two full L1/L2 passes.
- impact: The Build can be declared done with an arbitrarily slow PR-blocking job, and reviewers cannot distinguish a budget failure from accepted runtime creep.
- fix: Add an exact measured threshold (for example p95 or wall-clock ≤180 seconds on the named GitHub runner) and a job/suite timeout that fails when exceeded.

CLEAR: F — Test fixtures, a private scenario format, and CI wiring do not freeze a consumer contract, schema, or wire format, so reversible classification is coherent.
