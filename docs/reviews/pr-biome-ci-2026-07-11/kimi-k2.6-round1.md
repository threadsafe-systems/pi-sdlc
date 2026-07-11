### Branch protection configuration is out-of-band and non-reviewable

- severity: medium
- confidence: medium
- file: N/A (not committed)
- line: N/A
- problem: The PR claims branch protection is enabled, but no protection rules are committed to the repository (e.g., no `.github/settings.yml`, no Terraform, no `gh api` script). If the manual setting used `enforce_admins: false` or omitted push restrictions, admins or maintainers can bypass the required CI check.
- repro_or_impact: The enforcement gate is not reproducible from the git tree; a future repo settings change or fork could silently lose the protection. Recommendation: document the exact `gh api` invocation or commit a Probot Settings / Terraform snippet so the rules are reviewable and auditable.

### Reformat is behavior-neutral across all touched files

- severity: low
- confidence: high
- file: skills/sdlc/scripts/lib.mjs
- line: 97, 161, 197
- problem: All biome-driven changes in lib.mjs are purely stylistic (array flattening, optional-chain rewrite `e?.message`, arrow-function brace insertion) or remove unused bindings; none alter control flow, operator precedence, or runtime behavior. Verified by tracing each hunk: `(e && e.message) || e` → `e?.message || e` is equivalent for all Error/falsy inputs; `forEach` callback brace insertion does not change execution; array reformatting is cosmetic.
- repro_or_impact: `npm test` passes 33/33; manual inspection of diff confirms zero semantic changes.

### Conservative lint ruleset confirmed

- severity: low
- confidence: high
- file: biome.json
- line: 26
- problem: Linter uses `"preset": "recommended"` only, which excludes experimental/nursery rules and avoids strict-mode surprises. This matches the plan's stated intent.
- repro_or_impact: `npm run lint` passes cleanly on the existing codebase; no pre-existing violations needed triage.

### CI fails red on violations — claim verified

- severity: low
- confidence: high
- file: .github/workflows/ci.yml
- line: 26
- problem: Workflow runs `npm run lint` (= `biome check .`). Biome's check command exits non-zero when format or lint diagnostics are present.
- repro_or_impact: Confirmed by introducing a temporary unused variable and missing semicolon: `npx biome check` returned exit code 1 and emitted diagnostics, so the GitHub Actions job would fail red.

### Least-privilege workflow permissions confirmed

- severity: low
- confidence: high
- file: .github/workflows/ci.yml
- line: 6
- problem: Workflow declares `permissions: contents: read`, the minimal scope needed for checkout and `npm ci`.
- repro_or_impact: No excess permissions (e.g., `pull-requests: write`, `actions: write`) are granted.
