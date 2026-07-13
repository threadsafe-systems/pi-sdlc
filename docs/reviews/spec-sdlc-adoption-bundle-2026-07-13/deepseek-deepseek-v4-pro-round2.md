# Reviewer: deepseek/deepseek-v4-pro:high — spec_review ROUND 2 (delta), 2026-07-13

Under review: rev 2 of `docs/specs/2026-07-13-sdlc-adoption-bundle.md`.
Sibling note: openai-codex/gpt-5.6-luna failed to launch this round
("Model not found").

## Bundle-run trigger definition excludes non-config asset flags

- severity: high; confidence: high
- location: §3.1
- defect: Trigger enumerates "any config flag or `--yes`", but bundle
  assets are gated on `--with-models`/`--with-ci-workflow`/`--copy-prompts`
  which are not config flags (`setup-sdlc.mjs:69-90`: `--with-models` does
  not set `sawConfigFlag`). `setup-sdlc --copy-prompts` alone would not
  enter a bundle run; `pr-template` ("always in bundle runs") would not be
  provisioned and no report emitted.
- fix: Enumerate the full trigger set (asset flags, config flags,
  `--format`, `--yes`).

## Exempt-fallback path does not specify how the track value reaches `declaration.track`

- severity: medium; confidence: high
- location: §2.3
- defect: `declaration.parse` is structure-only and produces no track
  value; in the exempt path `declaration.track` needs a value it doesn't
  have. Two conforming implementations could diverge.
- fix: Parse synthesises track `none` + generated reason; downstream checks
  evaluate the synthetic values normally.

## `declaration.slug` "passes vacuously" text omits the forbidden-slug failure case

- severity: medium; confidence: high
- location: §2.3 applicability paragraph
- defect: `track: none` + `slug: foo` is structurally valid (known key), so
  the presence rule must FAIL `declaration.slug`; the "passes vacuously"
  parenthetical reads as universal.
- fix: Qualify: vacuous pass only when no slug is present.

## ci-workflow structural check mixes line-match with a YAML-structural constraint

- severity: low; confidence: medium
- location: §3.2
- defect: "within the same checkout step's `with:` block" is structural,
  not regex; implementer must guess scanner vs YAML-aware.
- fix: Commit to pure line match or YAML-aware wording.

CLEARs: §2.3 matrix/boundary/skips otherwise mutually consistent
(independent declaration and config branches joining at `artifact.*`);
§3.1 refused/exit-1 vs §3.4 mapping consistent; §3.3 target-file exclusion
makes AB8's `retained` reachable; §3.4 references + JSON error channelling
follow FS8/ADR-0016 precedent; §1.4 containment and zero-match pinned; no
scope creep, no FS8/locked-decision violation; SP1–SP18 all verified
present in rev 2.
