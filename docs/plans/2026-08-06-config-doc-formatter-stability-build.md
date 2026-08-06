# Build plan: formatter-stable CONFIG.md value spans

## Inputs

- Plan: `docs/plans/2026-08-06-config-doc-formatter-stability.md` rev 2 + A1.
- Specification: `docs/specs/2026-08-06-config-doc-formatter-stability.md` rev 2, approved by Neil.
- Original normative amendment: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md` rev 3.
- Track: irreversible.
- Tracker projection threshold: 2 tasks; this breakdown has 2 and must be published.

## Objective and rationale

Implement the adaptive code-span and v2 compatibility contract together with the repository-owned companion required by the standing full-suite current-state guard, then close the rev-3 normative approval record. Two tasks keep executable semantics/dogfood bytes distinct from normative approval closure.

## Task table

| task | objective | owns scenarios | checks | dependency |
| --- | --- | --- | --- | --- |
| T1 | Implement adaptive spans, v2 identity, pinned v1 fixture, executable coverage, and the generated v2 companion required by the standing full-suite current-state guard. | CDFS1–CDFS11 | `npm test`; `node --test test/config-doc.test.js`; Biome; `config-doc check` | none |
| T2 | Close rev-3 normative approval consistency under the approved renderer. | CDFS12 | `npm test`; `node --test test/config-doc.test.js test/iteration-disposition.test.js`; Biome; `config-doc check` | blocked by T1 |

## T1 — renderer, version compatibility, and focused tests

### Scope

- Change `CURRENT_SENTINEL_VERSION` to v2 and support exactly v1+v2.
- Add the one internal adaptive code-span helper and route serialized key values through it.
- Capture `test/fixtures/config-doc/v1-valid-config.md` byte-for-byte from baseline `c3fd2a1`'s v1 `VALID_CONFIG` render before changing the renderer.
- Update the single hardcoded-current-version assertion without weakening sentinel grammar coverage.
- Extend `test/config-doc.test.js` for CDFS1–CDFS11.
- Regenerate `.pi/sdlc/CONFIG.md` from the v2 renderer so the standing current-companion scenario allows the full suite to validate T1.

### Definition of done beyond PV1

- Helper is deterministic, local to `config-doc.mjs`, and preserves `JSON.stringify` bytes.
- Existing state/collision/symlink/setup tests are unchanged in intent.
- The v1 fixture's complete byte content is pinned by a SHA-256 assertion; its baseline provenance remains in the governing Spec rather than a process-history code comment.
- No dependency or unrelated render surface changes.

### PV1 projection

Manifest: `docs/validation/config-doc-formatter-stability/t1.json`.

- `tests.full`: `npm test`, timeout 30000, `scope:["full"]`.
- `tests.task`: `node --test test/config-doc.test.js`, timeout 10000, `scope:["task"]`.
- `static.lint`: `npx biome check skills/sdlc/scripts/config-doc.mjs test/config-doc.test.js`, timeout 120000.
- `static.config`: `node skills/sdlc/scripts/config-doc.mjs check --repo-root . --format json`, timeout 5000.
- Required categories: tests, static, scenarios. Standards/banned patterns: n/a with explicit reasons.

## T2 — normative approval closure

### Scope

- Update the original Spec rev-3 header after the #177 Spec gate so it records human approval rather than pending approval.
- Ensure focused tests mechanically inspect the original Spec rev-3 §§12–14 contract and this repository's `current` companion.
- Make no manual edits to generated output.

### Definition of done beyond PV1

- `config-doc check` reports `current` with v2 and the expected fingerprint.
- The generated `panels` line uses a two-backtick outer value delimiter and retains `with ` before the embedded backtick run.
- The original Spec contains no stale statement that v1 is current.
- The task adds no alternate generator or formatter authority.

### PV1 projection

Manifest: `docs/validation/config-doc-formatter-stability/t2.json`.

- `tests.full`: `npm test`, timeout 30000, `scope:["full"]`.
- `tests.task`: `node --test test/config-doc.test.js test/iteration-disposition.test.js`, timeout 15000, `scope:["task"]`.
- `static.lint`: `npx biome check skills/sdlc/scripts/config-doc.mjs test/config-doc.test.js`, timeout 120000.
- `static.config`: `node skills/sdlc/scripts/config-doc.mjs check --repo-root . --format json`, timeout 5000.
- Required categories: tests, static, scenarios. Standards/banned patterns: n/a with explicit reasons.

## Tracker projection

- Epic: #214
- T1: #215
- T2: #216
- Native dependency: #216 is blocked by #215.
- Board: threadsafe-systems project 5; all three items were created in Todo.

## Ordering and frontier

T1 (#215) is the only initial frontier task. T2 (#216) has a native `blockedBy` edge on T1 because its normative closure tests import and inspect T1's renderer/version. Each task is claimed before work and independently validated before closure.

## INVEST and boundary self-check

- **Independent:** T1 has executable value alone; T2 depends only where generation genuinely requires the renderer.
- **Negotiable:** implementation names are not frozen beyond the one-helper/deep-module boundary.
- **Valuable:** T1 closes the latent generator defect; T2 closes repository dogfood and normative publication.
- **Estimable/small:** each task touches one cohesive surface and one focused test corpus.
- **Testable:** every task owns stable CDFS ids and exact PV1 commands.
- Boundary rule: no task combines a second public interface, config schema change, or CI-policy change.

## Spec gap log

None.

## Assumptions

1. The worktree has dependencies required by the existing suite; missing installation is infrastructure, not a product failure.
2. The 30-second external full-suite timeout is comfortably above the observed 3–6 second baseline.
3. T1 captures the v1 fixture before changing renderer constants; if capture order is violated, stop and recover the bytes from commit `c3fd2a1` rather than synthesize them.
4. `writing-comments` governs implementation comments: only provenance/invariant explanations, never process narration.
5. This branch is stacked on PR #213 until that independently reviewed prerequisite merges; #213 removes the merge-expiring IDV premises that otherwise make any later runtime slice's full suite fail by construction.
6. The linked worktree required `npm ci`; the reported dependency audit findings pre-exist this slice and are outside #177.

## Amendments

### A1 — standing current-companion guard crosses the task boundary

- Trigger: T1's red/green run showed that changing the render version makes IDV24 fail until the generated companion is regenerated, so T1's declared full-suite check could not pass while CDFS9 remained deferred to T2.
- Class: **(c), normal fix wave**.
- Disposition: **incorporated**. CDFS9 and companion regeneration move to T1; T1 gains `static.config`. T2 retains CDFS12 normative approval closure. The dependency remains because T2's tests consume T1's runtime.
- Author: orchestrator during T1 implementation, 2026-08-06.

### A2 — fixture evidence and large-input hardening

- Trigger: PR round-1 findings showed that CDFS7 pinned only the fixture sentinel, not its full bytes, and that spreading all backtick runs into `Math.max` could exceed V8's argument limit.
- Class: **(c), normal fix wave**.
- Disposition: **incorporated**. The focused test pins the complete fixture SHA-256 and exercises 150,000 separated runs; the renderer computes the maximum iteratively. The earlier provenance-comment requirement is replaced with a mechanical hash because implementation comments must not cite process artifacts.
- Author: orchestrator during PR adjudication, 2026-08-06.
