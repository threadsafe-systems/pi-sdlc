### Unrecognized Bedrock region prefixes silently defeat author-exclusion (the "fail-safe" direction is only safe for dedup, not for self-review prevention)

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/resolve-panel.mjs
- line: 141-166
- problem: `BEDROCK_REGION_PREFIXES` is a hardcoded live snapshot (`us. eu. au. jp. global.`). For any prefix outside that list (e.g. a future `apac.`), the vendor-dot check sees the prefix itself as the vendor (`"apac"` ∉ `BEDROCK_ALIAS_VENDORS`), so the id stays un-collapsed. The plan/build-plan frame this as "fails safe — never silently merges two different models", but the direction is inverted for the other invariant this change exists to protect: an un-collapsed `amazon-bedrock/apac.anthropic.claude-opus-4-8` roster entry sails past author-exclusion when the author is `anthropic/claude-opus-4-8`, putting the author's own model on its own review panel with no warning.
- repro_or_impact: Add `amazon-bedrock/apac.anthropic.claude-opus-4-8` to a `prefer` list and resolve `pr_review --author anthropic/claude-opus-4-8` with AWS creds: the entry is kept as a panelist.

### New Bedrock fallback is permanently inert whenever the author is claude-opus-4-8 — including the config's own `authorDefault`

- severity: low
- confidence: high
- file: .pi/sdlc/sdlc.config.json
- line: 59 (pr_review.prefer)
- problem: The committed `authorDefault` is `anthropic/claude-opus-4-8:high`, whose identity is exactly what the new 5th candidate collapses to. With `onShortfall: "fail"`, any `pr_review` resolution where the author is opus-4-8 drops the fallback as "author model" and it can never fill a shortfall.
- repro_or_impact: If PR #103's crisis recurs on a change authored by opus-4-8, the fallback contributes nothing. Not stated anywhere in the plan/build-plan or roster `$comment`.

### Roster fallback entry omits the `:high` thinking suffix carried by every peer

- severity: low
- confidence: high
- file: .pi/sdlc/sdlc.config.json
- line: 59 (pr_review.prefer)
- problem: All four existing `pr_review` candidates pin `:high`; the new Bedrock entry pins nothing — a silent effort downgrade when it's selected.
- repro_or_impact: A shortfall-triggered Bedrock panelist reviews at default effort while its peers review at `high`; nothing flags the difference.

### Test comment misstates the mechanism, and same-version/different-region dedup is untested

- severity: low
- confidence: high
- file: test/resolve-panel-v3.test.js
- line: 191-204 (approx)
- problem: The "distinct Bedrock version qualifiers stay distinct identities" test's comment says the ids are "not collapsed into one identity" — in fact both ARE collapsed (region stripped, vendor remapped); they merely remain mutually distinct. Separately, the actually-novel merge behaviour — same model+version, different region, collapsing to ONE identity/one panelist — has no test at all.
- repro_or_impact: The untested region-merge path is the one that shrinks a panel below what the roster superficially offers; a future refactor could break or over-extend it without any test going red.
- smell: Mysterious Name

No high-severity findings.
