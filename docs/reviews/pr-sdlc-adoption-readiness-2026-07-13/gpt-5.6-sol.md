### Committed symlinks bypass the clean-manifest trust boundary

- severity: high
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 170-244
- problem: `cat-file -e` accepts a committed symlink blob, while subsequent validation follows that symlink through `readFileSync`. Consequently, the validated active content need not be byte-identical to the `HEAD` blob required by `docs/specs/2026-07-12-sdlc-adoption-readiness.md:268-270`.
- repro_or_impact: Commit `sdlc.config.json` and `sdlc.models.json` as symlinks to untracked external valid JSON files; status exits 0 with every check passing. Changing either target without touching the committed symlink still reports ready, allowing uncommitted configuration—including hooks—to enter full law.

### Argument errors echo credential values into status output

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 101-123
- problem: Unknown arguments are copied verbatim into `cli.arguments.message`, violating the credential-redaction requirements at `docs/specs/2026-07-12-sdlc-adoption-readiness.md:130-131` and `docs/specs/2026-07-12-sdlc-adoption-readiness.md:397-398`.
- repro_or_impact: Running `sdlc-status.mjs '--api-key=sentinel-secret-123' --format json` emits `"unexpected argument: --api-key=sentinel-secret-123"` in the JSON envelope, leaking the credential into logs or caller telemetry.

### Missing root values consume the next option and report a fabricated root

- severity: low
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 77-126
- problem: Root options accept the following option token as their value, so missing-value errors are misclassified and the supposed explicit root is treated as unambiguous. This conflicts with the missing-value and root fallback contract at `docs/specs/2026-07-12-sdlc-adoption-readiness.md:133-136`.
- repro_or_impact: `sdlc-status.mjs --repo-root --format json` reports `unexpected argument: json` and sets `root` to `<cwd>/--format`; it should report that `--repo-root` requires a value and use the absolute cwd.