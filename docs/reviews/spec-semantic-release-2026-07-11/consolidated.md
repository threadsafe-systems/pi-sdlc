# Consolidated spec review — semantic-release pipeline

- Target: `docs/specs/2026-07-11-semantic-release.md` @ 0d1fc49
- Panel: openai-codex/gpt-5.6-terra (2 passes — original + re-verification),
  deepseek/deepseek-v4-pro. 2 distinct vendors; ≥2 required. (zai/glm-5.2 and
  moonshotai/kimi-k2.6 were attempted but hit an unrelated, since-resolved
  credential/timeout issue — see the follow-up task filed earlier this
  session; the 2-vendor panel that did complete is strong and convergent.)
- Orchestrating model: anthropic (session), also the spec author;
  adjudication reviewed by the project owner (final adjudicator).

## Cross-model agreement (both vendors, independently — strongest signal in
## this whole initiative)

**H1. `persist-credentials: false` breaks `@semantic-release/git`'s push —
and a false technical claim in the spec's own text.** deepseek found this
with real precision: the spec claimed "semantic-release authenticates via
the GITHUB_TOKEN env var it reads directly," which is true for
`@semantic-release/github` (API calls) but **false** for
`@semantic-release/git` (a literal `git push`, which has no
`GITHUB_TOKEN`-reading path at all per that plugin's own README — verified).
`persist-credentials: false` strips exactly the git-level credential that
push needs, on *any* branch, protected or not — this would have failed the
release workflow's very first real run.
→ **Incorporated.** Removed `persist-credentials: false` from the checkout
step (default `true` is correct and sufficient — no PAT, no extra
remote-URL step). Corrected §2.3's false claim with the accurate
per-plugin auth-channel explanation.

**H2/H2. Commit-lint reports a check but nothing requires it to pass —
independently found by both vendors.** A red `commit-lint` status doesn't
block a merge unless it's in `required_status_checks.contexts`, which
currently only lists `test + biome`.
→ **Incorporated as a concrete implementation step, not left as an
open recommendation.** Pinned the exact `gh api` command to add `commit-lint`
to the required-checks list once it's run at least once (a GitHub
precondition). New scenario **SR11** makes this falsifiable; plan DoD
sharpened to require the wiring, not just the check's presence.

**M/M. Dry-run evidence overclaimed what was verified.** The evidence
paragraph said "both dry-runs loaded the pinned plugin config" while the
methodology explicitly used a subset excluding `github`/`git` (their
`verifyConditions` need live `GITHUB_TOKEN` + network). SR2/SR3 inherited
the overclaim.
→ **Incorporated.** §8's evidence paragraph now states precisely what was
and wasn't verified locally (version+changelog subset ran; github/git parse
as valid JSON via the config loader but their runtime behaviour is
first-verified in CI). SR3 reworded to match; the github/git runtime gap is
now a stated, accepted scope boundary rather than a silent one.

**M/L. `perf` and `revert` accepted by the grammar but their release-version
effects were undocumented.** Both vendors caught the gap; deepseek confirmed
against `commit-analyzer`'s own default rules (both → patch).
→ **Incorporated.** Added to §1.2's mapping table and SR2's falsification
condition.

## deepseek-only, low, incorporated

**Commit-lint workflow doesn't run `npm ci` before the check script** —
flagged as an inconsistency with `release.yml`. The script is genuinely
zero-dependency by design (only `node:child_process`), so adding `npm ci`
would be pure overhead for no benefit.
→ **Incorporated as a comment**, not a step: explains the omission is
deliberate and names the trigger for revisiting it (if the script ever
gains a dependency).

## Narrowed, not fully closed (recorded honestly)

The branch-protection-blocks-direct-push question (originally framed as the
open risk in §10.1) is **narrower** after the credential fix, not gone:
whether `required_status_checks` alone (without confirmed push
`restrictions`) blocks a direct Actions push to a protected branch is
GitHub-behavior-specific and wasn't empirically tested either way. Folded
into SR3 as a required empirical check at implementation time — stated
plainly as unresolved rather than assumed safe, consistent with this
project's own discipline against unverified DoD claims (the exact lesson
from the plan-panel round on this same initiative).

## Stop condition

No high or medium finding survives without a concrete fix. One item remains
correctly framed as "verify empirically during implementation" rather than
"assumed" — an honest scope boundary, not an unaddressed finding. Spec ready
for implementation once the project owner signs off on this adjudication.
