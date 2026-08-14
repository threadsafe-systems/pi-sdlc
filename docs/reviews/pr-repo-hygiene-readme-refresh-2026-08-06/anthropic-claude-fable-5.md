### Unanchored `pr-body.md` ignore rule swallows the committed PR-body snapshots under `docs/reviews/`

- severity: medium
- confidence: high
- file: .gitignore
- line: 15
- problem: The new entry is unanchored, so it matches `pr-body.md` at any depth — including the repo's established, currently-tracked review-artifact class `docs/reviews/<pr-panel-dir>/pr-body.md` (`git ls-files` shows `docs/reviews/pr-review-iteration-disposition-vocabulary-2026-07-26/pr-body.md` tracked today, and that dir's `output-*.log` files show the panel harness names that snapshot as "NAMED REVIEW MATERIAL"). Verified: `git check-ignore -v docs/reviews/some-future-panel-2026-08-10/pr-body.md` → matched by `.gitignore:15`. The pr-body.md "Assumptions" call ("The only in-repository test that writes a `pr-body.md` targets an `os.tmpdir()` fixture and is unaffected either way") missed this tracked artifact class entirely.
- repro_or_impact: The next PR panel that snapshots the PR body into its `docs/reviews/<dir>/` and runs `git add docs/reviews/<dir>/` silently drops the snapshot (directory-level `git add` skips ignored files without error). That re-creates the exact provenance hazard the PR cites as motivation (F5: "the panel's named input had no committed provenance"), but now enforced by machinery instead of by accident. Anchoring to `/pr-body.md` scopes the rule to the repo root; the nested-fixture-consumer concern the unanchored form was chosen for concerns `os.tmpdir()` fixtures (test/path-plumbing.test.js:13,102), not in-repo paths. origin: NEW.

### README fail-soft claim is false for the exact CLI it documents: an unwritable store is exit 2, not a warning

- severity: medium
- confidence: high
- file: README.md
- line: 180-182
- problem: Directly beneath the `record-run-event.sh` code block, the README states "an unresolvable run identity **or an unwritable store** degrades to a single stderr warning and never changes lifecycle behaviour." For the documented standalone emitter that is wrong: `record-run-event.mjs` bails with **exit 2** on an I/O failure (`skills/sdlc/scripts/record-run-event.mjs:171-176`, comment: "An I/O failure is exit 2 for the dedicated emitter"). Repro: chmod 555 the run store parent, emit `phase.entered` → `sdlc-telemetry: I/O failure writing the run store: EACCES…`, `EXIT=2`. Only the *embedded* FS5 `emitEvent` path (telemetry.mjs:348) is fail-soft on I/O, and the README never mentions that path. The unresolvable-identity half is accurate (soft skip, exit 0).
- repro_or_impact: A consumer scripting the documented invocation under `set -e` (or branching on exit code) gets a hard failure where the README promises harmless degradation — the precise "lifecycle behaviour change" the sentence denies. The sentence mirrors system-reference.md §12's "fail-soft everywhere", but the README is the artifact under review and repeats the overstated half in the most misleading position. origin: NEW.

### "The run store is git-ignored" is stated as mechanism-fact, but nothing provisions that ignore in a consumer repo

- severity: medium
- confidence: high
- file: README.md
- line: 170-171
- problem: The README asserts "The run store is git-ignored: raw material stays local." The only `.gitignore` carrying a `**/.pi/sdlc/runs/` entry is pi-sdlc's own repo file; `setup-sdlc.mjs` writes no ignore entry and checks none (grep of the script finds zero `.gitignore` handling), and no script warns when the run store is tracked. In the repos this sentence addresses — consumer adoptions — the run store is untracked-but-committable, and "raw material stays local" holds only if the consumer hand-authors the ignore themselves, which no shipped surface tells them to do.
- repro_or_impact: A fresh adopter runs an instrumented lifecycle, `git add .`, and commits `.pi/sdlc/runs/<slug>/events.jsonl` plus harvested panel transcripts — exactly the raw material the sentence promises stays local. Mitigating context for adjudication: the sentence faithfully mirrors shipped prose (skills/sdlc-retro/SKILL.md:17, system-reference.md §12), so the root defect predates this diff; the README refresh propagates rather than invents it. origin: NEW.

### pr-body.md verification claims do not fully reproduce (lint info count; failure-cause attribution)

- severity: low
- confidence: high
- file: pr-body.md (untracked, repo root — the declaration block under review)
- line: "Verification" section, approx lines 66-73 on disk
- problem: Two falsifiable statements in the declaration's verification block are wrong as written. (1) "`npm run lint` — 2 warnings, 2 infos": actual on HEAD is **2 warnings, 1 info** (all in `docs/briefs/assets/`, so the "pre-existing" half holds). (2) The 29 test failures are attributed to "`setup-sdlc`'s path-escape check"; at least 8 of the 29 are `test/check-lifecycle.test.js` failures caused by `check-lifecycle.mjs`'s `git.repository` check ("resolved root escapes its git top-level" — repro'd against a `/tmp` fixture, exit 2). Same macOS `/var`→`/private/var` symlink class, different script.
- repro_or_impact: The headline claim reproduces exactly (`npm test`: 512 tests, 483 pass, 29 fail on HEAD; the diff touches no code or test files, so base-identity is sound) — but the declaration block is NAMED REVIEW INPUT and its recorded facts should survive being checked. Neither error changes the merge verdict. origin: NEW.

### "The loaded skill directory" is singular, but the README's commands span two skills with two script directories

- severity: low
- confidence: high
- file: README.md
- line: 92-95, 187-190
- problem: The blanket rule "Every `scripts/…` path in this README and throughout the skill resolves against the **loaded skill directory**" gives the reader no way to know *which* skill directory a given block means: `scripts/record-run-event.sh`, `harvest-panel.sh`, and `tracker-ops.sh` live in `skills/sdlc/scripts/`, while `scripts/collect-run.sh` and `render-retro.sh` live in `skills/sdlc-retro/scripts/`. A session with the `sdlc` skill loaded that follows the retro code block verbatim gets file-not-found. SP1 (test/path-plumbing.test.js:62-63) bars naming the literal path, but it does not bar saying "relative to the `sdlc-retro` skill" — which that skill's own SKILL.md ("relative to this loaded skill") already does.
- repro_or_impact: The retro section's surrounding prose ("The `sdlc-retro` skill is the post-mortem half") softens this, but the §"panel machine" sentence claims universality ("Every … path in this README") that the retro block breaks. One clarifying clause fixes it without violating SP1. origin: NEW.

### Consumer repos keep the stale-`pr-body.md` hazard this PR fixes for pi-sdlc itself, and the declaration records no residual

- severity: low
- confidence: high
- file: pr-body.md ("Assumptions & discretionary calls") / skills/sdlc/references/phase-pr-review.md:67
- line: approx 45-60 (pr-body.md on disk)
- problem: The shipped lifecycle prose directs every consumer to write `pr-body.md` at their repo root (`check-lifecycle.mjs --body pr-body.md --repo-root .`), and `setup-sdlc` provisions no ignore entry for it — so every adopter has the identical stale-declaration-on-main hazard (F5/P7) that motivated this PR, fixed here only for pi-sdlc's own repo. Extending setup would be a behaviour change and is correctly outside a `track: none` diff; the defect at this PR's level is that the declaration's assumptions section, which walks through untrack-vs-relocate and anchoring, never names this known-remaining instance of the same hazard as a residual or files it for follow-up.
- repro_or_impact: An adopter follows phase-pr-review.md, commits `pr-body.md` with PR #1, and PR #2's stale declaration block sits on their main — P7 replayed downstream. origin: NEW.

### Telemetry/retro README sections are near-verbatim copies of shipped skill prose

- severity: low
- confidence: medium
- file: README.md
- line: 165-197
- problem: The new "Lifecycle telemetry and retros" section restates system-reference.md §12 and sdlc-retro SKILL.md sentence-shapes almost verbatim (the fail-soft sentence, the git-ignored/committed split, the `--no-llm` absent-not-guessed clause). That creates a second copy of load-bearing contract prose that must now drift-track two skill documents — and finding 2 above shows the copy already carries §12's divergence from the code.
- repro_or_impact: Any future change to §12 or sdlc-retro SKILL.md silently invalidates the README; `check-references.mjs` certifies the inventory's assertions, not this duplication. Summarise-and-point (one clause + a pointer to the owning reference) would keep the README stale-proof. origin: NEW.
- smell: Duplicated Code

No high-severity findings. Everything else checked out against the real argv: `record-run-event.sh --list`/`--describe <event>`/emit form with `--slug`/`--payload` (all exist; `--list`/`--describe` are the only stdout writers — verified empirically), `harvest-panel.sh --phase/--round/--from` (matches usage banner), `tracker-ops.sh frontier --parent` and `set-status --item --status` (both required by the script), `collect-run.sh --slug` with default out `docs/retros/<slug>/run.json` (collect-run.mjs:1221) and the `--git-cmd`/`--gh-cmd`/`--llm-cmd`/`--no-llm` seams, `render-retro.sh --run`, and the seven `templates/` filenames matching the seven claimed slash-commands. The tracker section matches the config schema (`tracker.repo` + `board.{number,url}`, `publishToTracker` integer-or-`"never"`) and tracker-ops.md's label vocabulary. SP1 passes on the new README (no `skills/sdlc/scripts/` literal); docs.test.js 24/24; CI's check-lifecycle reads `$GITHUB_EVENT_PATH`, not the untracked file, so the untracking breaks no gate. `check-lifecycle.mjs --body pr-body.md` passes on the declaration; `check-references.mjs` passes. The `track: none` declaration is honest for this diff. No new CI or gate machinery is added, so no proportionality concern.