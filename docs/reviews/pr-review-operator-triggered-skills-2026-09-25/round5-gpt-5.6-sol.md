- PR-R4-01: RESOLVED — both root and cwd are checked, and all three Git environment variables block the absence proof (`skills/sdlc/scripts/sdlc-status.mjs:185,201,67`).
- PR-R4-02: RESOLVED — the ancestor-manifest/nested-repository case now exits 2 (`test/sdlc-status.test.js:330-340`).
- PR-R4-03: RESOLVED — `HEAD` plus `commondir` is recognized and tested (`skills/sdlc/scripts/sdlc-status.mjs:84`; `test/sdlc-status.test.js:342-347`).
- PR-R4-04: RESOLVED — README and its assertions now describe exit 1 for proven non-Git roots and exit 2 for unusable repositories (`README.md:68-71`; `test/docs.test.js:136-138`).
- PR-R4-05: PARTIAL — amendment links and schema rationale landed, but their root-only summaries omit the new cwd/environment preconditions; see the reopened finding below.
- PR-R4-06: RESOLVED — the ledger names S05, S10, and S11 as replaced (`docs/validation/sdlc-agent-self-documentation/disposition-ledger.md:138-143`).
- PR-R4-07: RESOLVED — the decomposition rationale now describes T1 and T2 (`docs/plans/2026-09-24-operator-triggered-skills-build.md:12-22`).
- PR-R4-08: RESOLVED — the amendment trigger no longer cites panel finding identifiers (`docs/plans/2026-09-24-operator-triggered-skills.md:182-187`).
- PR-R4-09: RESOLVED — the test name no longer calls both scripts frozen (`test/frozen-surfaces.test.js:51`).
- Carries: none found in the governing documents or this review run.

### FS8 amendment records still promise an unqualified root-only classification

- severity: medium
- confidence: high
- origin: REOPENED(PR-R4-05)
- file: docs/specs/2026-07-12-sdlc-adoption-readiness.md
- line: 10-12
- problem: The newly added amendment note says any root outside Git becomes `not-adopted`, while the implementation also requires the working directory to be outside Git and the Git environment variables to be absent (`skills/sdlc/scripts/sdlc-status.mjs:185,201`). The same obsolete root-only promise remains in ADR 0016 (`docs/adr/0016-status-surface-fs8.md:3-5`) and the governing Plan’s pre-mortem/DoD (`docs/plans/2026-09-24-operator-triggered-skills.md:139-152`).
- repro_or_impact: With the same empty non-Git root, `--repo-root <root>` exits 2 from this repository but exits 1 when cwd is that root; `test/sdlc-status.test.js:317` deliberately pins the former. Thus the frozen-contract summary and Plan acceptance rule contradict the owner-ratified behavior.

### The new regression test name does not cover several cases in its body

- severity: low
- confidence: high
- origin: NEW
- file: test/sdlc-status.test.js
- line: 311-348
- problem: The test name claims only that a root outside Git pointing away from the caller’s repository errors, but lines 326-348 also test Git environment variables from a non-Git cwd and a `HEAD`/`commondir` gitdir.
- repro_or_impact: Failures in those independent contracts appear under a misleading behavioral claim, obscuring which invariant regressed.