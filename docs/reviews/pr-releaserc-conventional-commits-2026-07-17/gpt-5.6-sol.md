### Preset v10 silently empties generated release notes

- severity: medium
- confidence: high
- file: package.json
- line: 37
- problem: `conventional-changelog-conventionalcommits` 10.2.1 supplies the new functional-template writer API, but the installed `@semantic-release/release-notes-generator` 14.1.1 still drives `conventional-changelog-writer` 8.4.0's Handlebars API. Classification is fixed, but generated notes contain only the version heading and omit all breaking changes, features, and fixes.
- repro_or_impact: Calling the installed `generateNotes({preset: "conventionalcommits"}, ...)` with `feat(config)!: break it` and `fix: patch it` returned only `## [2.0.0]...`; the same fixture with preset package 9.3.1 emitted BREAKING CHANGES, Features, and Bug Fixes. Every future CHANGELOG/GitHub Release would therefore lose its commit details unless the dependency is kept on a compatible 9.x release or the writer stack is upgraded together.

### The declared exemption currently fails the required lifecycle gate

- severity: medium
- confidence: high
- file: .github/workflows/ci.yml
- line: 26-27
- problem: The PR body's one-line `track: none` reason is 364 characters, exceeding the checker's 200-character contract, so this required CI job is red even though the exemption category itself is honest for the release-tooling-only diff.
- repro_or_impact: PR run 29572402216 reports `declaration.reason fail — reason is required for track none and must be one non-empty line of at most 200 characters` and exits 1 before tests/lint. The local `npm test` (206/206) and `npm run lint` pass, but the PR cannot satisfy its configured review gate until the reason is shortened.
