### Branch protection allows admin bypass and direct pushes to main

- severity: medium
- confidence: high
- file: .github/workflows/ci.yml
- line: 3-6 (approx; enforcement is a live repository setting)
- problem: The live `main` branch protection has `enforce_admins.enabled: false` and `restrictions: null`. Administrators can bypass the required `test + biome` status check, and users with repository write permission are not restricted from pushing directly to `main`; required-status-check protection applies only to PR merges, not direct pushes.
- repro_or_impact: `gh api repos/threadsafe-systems/pi-sdlc/branches/main/protection` reports `contexts: ["test + biome"]`, `enforce_admins: false`, and `restrictions: null`. A direct push to `main` can therefore land without this workflow having passed, undermining the plan's claim that CI is an actual enforced gate (and allowing an admin to merge/bypass a failing PR).

### `noUnusedVariables` warn-only weakens the structural safety net

- severity: low
- confidence: high
- file: biome.json
- line: 27-30
- problem: The `recommended` preset includes `correctness/noUnusedVariables` with default severity `warn`. Biome exits 0 on warnings, so `npm run lint` / CI will not fail on unused variables. The rule's fix is also unsafe, so `npm run format` (`biome check --write .`) will not auto-remove them either.
- repro_or_impact: A future PR that introduces an unused binding will pass CI green. The "structural safety net" is weaker than the plan's framing suggests for this specific rule class.

### Cross-plan dependency: semantic-release pipeline needs direct-push clarity

- severity: low
- confidence: high
- file: docs/plans/2026-07-11-biome-ci.md
- line: 52-58
- problem: The sibling semantic-release spec depends on this plan's branch-protection setup for two things: (1) reusing the biome check in its release workflow, and (2) knowing whether direct pushes to `main` are blocked — its `@semantic-release/git` changelog commit requires a direct push. The biome-ci plan does not document whether direct pushes are allowed or blocked, leaving an unverified dependency for the irreversible track.
- repro_or_impact: If branch protection is later tightened to require PRs (blocking direct pushes), the semantic-release pipeline will fail on its first real run when `@semantic-release/git` tries to push the changelog commit. If direct pushes remain allowed, the security gap in the first finding persists.
