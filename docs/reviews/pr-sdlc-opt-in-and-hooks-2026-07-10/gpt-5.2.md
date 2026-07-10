- ### setup-sdlc rejects legitimate flag values that start with `--`

  - severity: medium
  - confidence: high
  - file: skills/sdlc/scripts/setup-sdlc.mjs
  - line: 25-28
  - problem: `needVal()` treats any value beginning with `--` as “missing” and exits 2, which breaks valid inputs like an `--announce` string that starts with `--` (or roots/paths that start with dashes).
  - repro_or_impact: `d=$(mktemp -d) && node skills/sdlc/scripts/setup-sdlc.mjs --repo-root "$d" --announce "--hello" --yes` exits 2 with `setup-sdlc: --announce requires a value`; this is surprising for a string-valued option and is not required by the spec.

- ### `--with-models` relies on `import.meta.dirname` (Node-version portability + partial-write risk)

  - severity: medium
  - confidence: medium
  - file: skills/sdlc/scripts/setup-sdlc.mjs
  - line: 127-134
  - problem: The script uses `import.meta.dirname` to locate `sdlc.models.example.json`; this property is not universally available across Node versions, and the repo does not declare an `engines` floor.
  - repro_or_impact: On Node runtimes lacking `import.meta.dirname`, `--with-models` would throw after writing `sdlc.config.json` (line 124) but before writing `sdlc.models.json`, leaving the repo partially configured and exiting with an uncaught exception rather than the specified exit codes.

- ### Schema/validator drift for tracker board URL (and schema validation is effectively weakened in tests)

  - severity: medium
  - confidence: high
  - file: skills/sdlc/schema/sdlc.config.schema.json
  - line: 40-58
  - problem: The schema uses `"format": "uri"` for `tracker.board.url`, while `validateConfig` requires an explicit http(s) URL; additionally, the test runner’s Ajv invocation emits `unknown format "uri" ignored`, meaning the schema check does not actually validate this constraint under the current test harness.
  - repro_or_impact: A config can be “schema-valid” (or at least not schema-rejected in the test harness) but still be rejected by the CLI with `tracker.board.url must be an http(s) URL` (skills/sdlc/scripts/lib.mjs:147), violating the “schema and validateConfig agree” expectation for FS1.
