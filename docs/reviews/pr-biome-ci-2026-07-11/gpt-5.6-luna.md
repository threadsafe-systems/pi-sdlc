### Main can bypass the required CI gate on direct pushes

- severity: medium
- confidence: high
- file: .github/workflows/ci.yml
- line: 3-6 (approx; enforcement is a live repository setting)
- problem: The live `main` protection has `enforce_admins.enabled: false` and `restrictions: null`. Consequently, administrators can bypass the required `test + biome` status check, and users with repository write permission are not restricted from pushing directly to `main`; required-status-check protection applies to PR merges, not those direct pushes.
- repro_or_impact: `gh api repos/threadsafe-systems/pi-sdlc/branches/main/protection` reports `contexts: ["test + biome"]`, `enforce_admins: false`, and `restrictions: null`. A direct push to `main` can therefore land without this workflow having passed, undermining the plan's claim that CI is an actual enforced gate (and allowing an admin to merge/bypass a failing PR).
