# Consolidated PR review — sdlc opt-in + local workflow hooks (PR #1)

- Target: `git diff db07616..d47ed9c` (branch `feat/sdlc-opt-in-hooks`)
- Panel: deepseek/deepseek-v4-pro, zai-coding-cn/glm-5.2, openai/gpt-5.2
  (3 distinct vendors — meets `pr_review` min_panel=3; anthropic excluded as
  author). **kimi-k2.6 hung and returned nothing**; a 4th slot was not
  recoverable because a mid-session credential clobber (see the infra
  follow-up task) left only anthropic + a timing-out openai-codex usable.
  Panel floor still met on the 3 that landed.
- Orchestrating model: anthropic (claude-opus-4-8 session), also the author;
  adjudication reviewed by the project owner (final adjudicator).
- Per-model files: `deepseek-v4-pro.md`, `glm-5.2.md`, `gpt-5.2.md`; prompt:
  `prompt.md`.

## Medium

**PM1. `needVal` rejects legitimate values beginning with a dash** (gpt-5.2
medium; glm low = the two new scripts diverged, `sdlc-status` rejected `-`,
`setup-sdlc` rejected `--`). `--announce "--foo"` wrongly exited 2.
→ **Incorporated.** Both scripts' `needVal` now reject only a genuinely absent
value (`undefined`); a value may begin with `-`. New test asserts
`--announce "--foo bar"` round-trips. Fixes the gpt medium and the glm
consistency low in one change.

**PM2. `--with-models` used `import.meta.dirname` (portability) with a
partial-write risk** (gpt-5.2 medium). On a runtime lacking
`import.meta.dirname` the models write throws *after* the config is written,
leaving a half-configured repo.
→ **Incorporated.** Switched to `dirname(fileURLToPath(import.meta.url))`
(universally available), and the models example is now read into memory
*before* the first write, so a read failure writes nothing.

**PM3. `--hook-use` did not validate the reconstructed `use` early**
(deepseek medium). `parseHookUse` built `use` from fields 3–4 without checking
`USE_RE` before `addHook`.
→ **Incorporated (with a scope correction).** Added an early `USE_RE.test(use)`
check in `parseHookUse` giving a clear diagnostic for a bad kind
(`bogus:name:…`). deepseek's headline example (`tool:my:worktree:…` "silently
mangled") is on inspection **not a bug**: names cannot contain `:` (schema
pattern), so the only valid reading of that input is `use=tool:my`,
`do="worktree:…"` — which is exactly the defined 4th-colon rule (a `do` may
contain colons). Recorded here rather than "fixed" because there is no
information to distinguish an intended colon-in-name from a colon-led `do`;
the early check still improves errors for genuinely bad kinds.

**PM4. Schema `format:"uri"` vs `validateConfig` http(s) for
`tracker.board.url`; ajv ignores the `uri` format under the test harness**
(gpt-5.2 medium).
→ **Dismissed for this PR (recorded); folded into a follow-up.** The
`tracker.board.url` schema block is **pre-existing and unchanged by this PR**
(`git diff` shows no edit to it), so it is out of scope for the opt-in/hooks
change. It is a real FS1 consistency nit worth a dedicated fix (add a regex
`pattern` alongside/instead of `format`), tracked as a follow-up rather than
widened into this diff (which would also perturb the prior S3 golden).

## Low (incorporated unless noted)

- **PL1. Documented exit code 1 ("user declined/aborted") was unreachable**
  (deepseek + glm). → **Incorporated**: the interview now ends with a
  "write this config now? (Y/n)" confirm; declining prints an abort notice and
  exits 1, making the §5.1 contract reachable. *Coverage limitation
  (recorded):* the confirm path is TTY-only by spec (no-TTY ⇒ exit 2), so it
  has no unit test without a pty — verified manually; the branch now exists.
- **PL2. `validateConfig` error named a not-yet-written file** (deepseek). →
  **Incorporated**: the pre-write self-validation now labels the path
  `<target> (to be written)`.
- **PL3. Test gaps: `\r` in a `run` command, empty command** (deepseek). →
  **Incorporated**: added `plan:before:line1\rline2` and `plan:before:` to the
  malformed-flag cases.
- **PL4. Duplicated arg-parsing across the two new scripts** (glm, smell). →
  **Partially addressed** via PM1 (behaviour now consistent). Extracting a
  shared `needVal` into `lib.mjs` is deferred as a low-value refactor.

## Stop condition

After adjudication, no high or medium finding survives unaddressed: PM1–PM3
fixed, PM4 dismissed with a recorded reason (pre-existing, out of scope) +
follow-up. All low findings incorporated except the deferred PL4 refactor.
`npm test` green at 33/33 after the fixes. Panel ran 3/4 (kimi lost to the
credential clobber); the min_panel=3 floor for `pr_review` is met by the three
that returned. Re-run of a full 4-vendor panel is advisable once credentials
are restored, but is not blocking.
