# plan_review — openai-codex/gpt-5.6-sol:high — cycle 2 (plan rev 2)

### Crash-safe fold atomicity is impossible as stated

- severity: high
- confidence: high
- location: What this delivers §2, lines 150–158; Definition of done §4, lines 281–283
- defect: The plan requires the merged config to be durably renamed before unlinking the models file, yet also requires an interruption at any boundary to leave the original pair intact. An interruption after rename but before unlink necessarily leaves v2 config beside the old models file; after unlink, the original pair no longer exists.
- evidence: plan :155-158 orders durable config replacement before models removal, while :281-283 requires the original pair after every injected failure, including unlink; ordinary file operations provide no atomic transaction spanning both files.
- impact: DoD-4 cannot be satisfied for process termination or power loss, so the Spec would either promise impossible guarantees or silently weaken the plan.
- fix: Replace "original pair intact after interruption" with an explicit journal/backup recovery contract whose observable post-recovery state is either the complete original pair or complete v2 state.

### Release guard can pass while semantic-release emits a minor

- severity: high
- confidence: high
- location: What this delivers §10, lines 201–205; Release-channel discipline, lines 209–218
- defect: The guard looks for a breaking signal in any PR commit, but semantic-release evaluates the commit that reaches main; under the repository's demonstrated squash workflow that is the PR title. An inner feat! can satisfy the proposed guard while a non-breaking feat: squash title produces a minor.
- evidence: plan :201-204 ("in the PR's commits"); docs/adr/0012-release-versioning-policy.md:28-34,48-50 names merge/squash titles; PR #48 was squashed to single-parent commit d54895e with the PR-title subject.
- impact: The central "shape break rides a major" protection can report green and then publish the inaugural schema break as a minor.
- fix: Require the breaking signal on the release-visible merge/squash title, merge-mode-aware, rather than accepting any branch commit.

### Interactive migration ownership remains contradictory

- severity: medium
- confidence: high
- location: What this delivers §§2–3; Context for the next agent
- defect: Scope says the shared loader prompts in every interactive context, then designates setup-sdlc as the interactive migration surface, while the handoff still leaves shared-versus-per-script ownership open. Incompatible contracts, not a Spec-level choice.
- evidence: plan :150-153 (loader prompts), :159-164 (setup sole entrypoint), :372-373 (loader ownership reopened); lib.mjs:142-166 shared exiting loader; check-lifecycle.mjs:214-225 uses the non-exiting inspector.
- impact: A Spec cannot determine whether TTY invocations of resolver/checker/status may prompt or mutate files; the end-to-end DoD tests only setup.
- fix: Bind shared loading to detection-only and confirmation/writes exclusively to setup-sdlc; every other consumer halts with the remedy.

### Fresh adopters have no defined enforcement posture

- severity: medium
- confidence: high
- location: Decisions 2–4; setup scope; Definition of done
- defect: The plan defines strict only for migrated adopters and never states or tests what fresh setup writes for enforcement — omitting #52's binding rule that preference is the default and strict is user-selected.
- evidence: issue #52 resolution ("default; the user may opt into strict"); plan :86-91 (strict at migration), :192-197 (setup scope silent); no DoD scenario for fresh-adoption enforcement.
- impact: Setup could silently write strict or an undocumented default, freezing behaviour contrary to the ratified trust model.
- fix: Fresh setup writes preference by default, human may select strict; add a falsifiable setup scenario.

### FS10 reopening lacks a versioned acceptance contract

- severity: medium
- confidence: high
- location: What this delivers §8; Definition of done §§5, 8
- defect: Rev 2 calls this an FS10 bump but never pins the new report schema version or tests the retired --with-models behaviour and resulting text/JSON reports.
- evidence: setup-sdlc.mjs:387 emits schemaVersion: 1; ADR 0018:25-31 requires an explicit bump + migration; DoD tests --models-file (FS5) but not --with-models (FS10).
- impact: Implementation could change FS10 flags/assets while leaving a v1 envelope; OL-B wouldn't know which FS10 version it composes onto.
- fix: Bind to FS10 schemaVersion 2; add text/JSON golden tests and a --with-models deprecation-error test.

CLEAR: F — irreversible classification correct.
