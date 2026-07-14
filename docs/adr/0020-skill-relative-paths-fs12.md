# ADR 0020: skill-relative invocation and consumer path plumbing (FS12)

- Status: accepted
- Date: 2026-07-14

## Context

The package is loaded as a pi skill, but older examples used package-checkout
paths such as `skills/sdlc/scripts/...` from a consumer cwd. The same package
also exposes four configurable consumer artifact homes whose containment and
runtime consumers must agree.

## Decision

In pi instructions, `scripts/<name>.sh` and `assets/<name>` are resolved relative
to the loaded skill directory. Headless/direct-Node instructions resolve the
loaded skill directory explicitly and invoke `node <skill-dir>/scripts/<name>.mjs`.
No global binary is implied.

Consumer `paths.*` values remain repo-relative. A pure resolver returns either a
contained absolute path plus original/normalized relative spellings or a
single-line error object; it never exits. FS1 validation and every filesystem
consumer reject slash- or backslash-separated absolute/`..` escapes. `agents`
controls the generated output directory; arbitrary custom directories are not
claimed to be automatically discovered by every pi host.

## Consequences

- Installed consumers no longer depend on a package checkout at their cwd.
- Existing default artifact homes and FS8/FS9/FS10 runtime contracts remain
  unchanged.
- Consumers that copied old commands must audit their own docs/workflows; setup
  does not rewrite consumer-owned files.
- Direct Node remains the portable fallback for Windows and headless use.
