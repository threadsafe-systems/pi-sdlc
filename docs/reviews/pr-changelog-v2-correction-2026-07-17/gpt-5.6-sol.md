### The changelog falsely says the Angular preset ignored breaking-change footers

- severity: low
- confidence: high
- file: CHANGELOG.md
- line: 18-19
- problem: The new entry says the previous `angular` preset recognised neither `!` nor a trailing `BREAKING CHANGE:` footer, but the installed Angular preset does recognise the footer; only the `!` header shorthand was missed.
- repro_or_impact: Calling `@semantic-release/commit-analyzer` with `{preset: "angular"}` returns `null` for `feat(api)!: break` but `major` for `fix: correction\n\nBREAKING CHANGE: API changed`. This leaves the corrective release record with an inaccurate explanation of the old analyzer behavior.

### “No v2.0.0 was ever published” contradicts the recorded GitHub Release incident

- severity: low
- confidence: high
- file: CHANGELOG.md
- line: 10-12
- problem: The note says a `v2.0.0` GitHub Release was deleted and then concludes that no `v2.0.0` was ever published. In this repository GitHub Releases are the publication mechanism (there is explicitly no npm publication), so a briefly created, non-draft release was published even though it was subsequently deleted and is no longer available.
- repro_or_impact: Commit `b375469` is semantic-release’s generated `chore(release): 2.0.0` commit, while the current tag and release APIs correctly return 404 for `v2.0.0`; the text should distinguish “briefly published, then withdrawn before known consumption” from “never published” to preserve accurate provenance.
