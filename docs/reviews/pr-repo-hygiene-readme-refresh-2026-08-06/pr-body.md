<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->

```sdlc
track: none
reason: Repository housekeeping — untracks a per-PR scratch file and documents already-shipped surfaces in the README. No contract, schema, interface, behaviour, or test changes.
```

Two independent pieces of hygiene, one commit each.

**`pr-body.md` is untracked and ignored.** The PR phase writes the PR body to
`pr-body.md` and `check-lifecycle` reads it, so the file's content belongs to
whichever PR is open right now. It was never ignored, so each PR overwrote and
committed it, leaving the previous PR's declaration block sitting on `main`. Two
prior panels flagged the same hazard from opposite directions — `pr-review-sdlc-question-discipline-2026-07-19`
(F5: the committed blob was stale, so the panel's named input had no committed
provenance) and `pr-pv1-task-scoped-tests-2026-07-25` (P7: opening a PR from the
stale blob would have failed `check-lifecycle` and replayed a spent
`BREAKING CHANGE` footer). P7 was closed by rewriting the file rather than
untracking it, so the hazard was still live. The ignore entry is unanchored to
cover a fixture consumer root nested under this repository.

**README covers four shipped surfaces it previously omitted.** The README was
last touched on 2026-07-25 and described a single skill plus the phase machine.
It now also documents the `sdlc-retro` skill and its collect/render pipeline,
FS13 lifecycle telemetry and the run store, the `templates/` prompt commands
exported through `package.json`'s `pi.prompts` (`/sdlc-plan`, `/sdlc-spec`,
`/sdlc-tasks`, `/sdlc-brainstorm`, `/sdlc-implement`, `/sdlc-pr-review`,
`/setup-sdlc`), and tracker-backed builds via `tracker-ops`. It also states
explicitly that every `scripts/…` path resolves against the loaded skill
directory rather than the repository root.

## Governing documents

N/A — `track: none`. No plan, Specification, or Build plan: this change adds no
capability and alters no contract.

## Tracker references

N/A — no tracker-backed Build. Below the `shape.publishToTracker` threshold and
exempt as a `track: none` change.

## Assumptions & discretionary calls

- **`track: none` over `reversible`.** Docs and tooling are nominally the
  reversible track, but this change adds no capability and moves no surface a
  consumer binds to; the exemption is the honest declaration. The PR panel owns
  that judgement.
- **Untrack rather than relocate.** `pr-body.md` is not a template and does not
  belong in `templates/` — that directory is pi's prompt-command export path, so
  a file there becomes a slash command. The canonical template already exists as
  `.github/pull_request_template.md` and as the shipped asset
  `skills/sdlc/assets/pull_request_template.md`. The file stays on disk as
  working scratch; only the tracking stops.
- **Anchored ignore entry — corrected during review.** The first draft used an
  unanchored `pr-body.md`, reasoning from the fixture-root case. That was wrong:
  a PR panel snapshots the body it reviewed into `docs/reviews/<dir>/pr-body.md`
  and those snapshots are committed evidence (one is tracked today). An
  unanchored pattern matches them, and `git add <dir>` skips ignored files with
  no error, so the snapshot would have disappeared silently — re-creating the
  very provenance hazard this PR cites as motivation. Now `/pr-body.md`,
  root-anchored. The fixture case that motivated the unanchored form writes to
  `os.tmpdir()` and was never affected.
- **A README claim was withdrawn during implementation.** An earlier draft
  "corrected" the README's bare `scripts/…` invocations to
  `skills/sdlc/scripts/…`. That is a shipped invariant in the opposite
  direction — `test/path-plumbing.test.js:50` bans that literal from the README,
  because the skill has no fixed install path. The draft was reverted and
  replaced with prose that states the skill-relative rule without naming a path.
- **Example argv verified, not assumed.** The `tracker-ops` examples were
  corrected to the real flag shapes (`frontier --parent`, `set-status --item`)
  after checking the script's own usage banner.

## Verification

- `npm test` — 512 tests, 483 pass, 29 fail, identical on the base commit
  (`21cb0c3`); this diff touches no code and no tests. The 29 are a macOS-only
  environment artifact: `/var` is a symlink to `/private/var`, so the
  root-containment checks reject `os.tmpdir()` fixture roots. It spans more than
  one script — 8 failures come from `check-lifecycle.test.js` and 5 from
  `setup-v3.test.js`, same root cause, different callers. Linux CI is green on
  the same commit.
- `npm run lint` — 2 warnings, 1 info, all pre-existing in `docs/briefs/assets/`
  and unchanged by this PR.
- `check-references.mjs` — pass.
- `check-lifecycle.mjs --body pr-body.md` — pass (`track: none`, reason present;
  plan/spec/build artifacts correctly skipped).

## Residual risk

Consumer repos still carry the hazard this PR fixes for pi-sdlc itself: the
lifecycle prose directs every adopter to write `pr-body.md` at their repo root,
and `setup-sdlc` provisions no ignore entry for it, so an adopter who commits it
once gets the same stale-declaration-on-main problem. Extending the adoption
bundle is a behaviour change and is deliberately out of scope for a `track: none`
diff; it wants its own PR. The README now also tells adopters to ignore the
telemetry run store themselves, which setup likewise does not provision.

## Review

PR panel, round 1 — 3 reviewers resolved, 1 returned (both `openai-codex` models
failed on provider usage limits, a panel shortfall under `onShortfall: fail`).
The reviewer that landed raised 3 medium and 4 low findings, no highs; **all
seven were incorporated**, including the anchoring defect above and two false
README claims (the emitter's fail-soft behaviour, and the run store being
git-ignored for consumers). Round 2 refills the shortfall as a delta review.
Artifacts: `docs/reviews/pr-repo-hygiene-readme-refresh-2026-08-06/`.
