# Reviewer: zai/glm-5.2:high — spec_review ROUND 2 (delta), 2026-07-13

Under review: rev 2 of `docs/specs/2026-07-13-sdlc-adoption-bundle.md`.

Incorporation summary: all 18 round-1 findings reflected in rev 2; SP7,
SP13, SP1 carry residues (below); SP2–SP6, SP8–SP12, SP14–SP18 fully and
coherently incorporated. No scope creep; no FS8/locked-decision violation;
the exit-2→exit-1 config change is disclosed as ADR-0018-recorded and
plan-supported.

## ci-workflow recognition mixes line-matching with an undefined YAML structural constraint

- severity: medium; confidence: high
- location: §3.2
- defect: "a line matching `ref:\s*\S+` within the same checkout step's
  `with:` block" requires YAML structural awareness; no YAML parser is
  available (no new dependencies, §6.2). AB10's failing fixture cannot be
  produced by line matching alone.
- fix: Define the structural mechanism concretely, or simplify to a pure
  line match with the false-positive trade-off documented.

## Null semantics for `slug` and `reason` under-specified when their own check fails

- severity: medium; confidence: high
- location: §2.4
- defect: `track` is null until its check passes, but `slug`/`reason`
  null-ness is defined by track value only; when `declaration.slug` or
  `declaration.reason` itself fails, the envelope value is undefined,
  breaking AB7 golden reproducibility for AB1/AB5 failure cases.
- fix: Uniform rule — each field null until its own check passes.

## "Config flag" undefined; inconsistent with "flags" in the `--format json` interview-mode rule

- severity: medium; confidence: medium
- location: §3.1
- defect: `setup-sdlc.mjs:63-69,228` — `--with-models` does not set
  `sawConfigFlag`; `--format json --with-ci-workflow` without `--yes` is
  neither interview nor flags mode as written.
- fix: Define the flag set that triggers flags mode explicitly and use it
  consistently.

CLEAR: A — FS9/FS10 new; FS1/FS2/FS8/ADR-0016 untouched; ADR-0018 change
disclosed, no-overwrite guarantee preserved.
CLEAR: E — Composes with `sdlc-status.mjs:150-171` prefix/`ls-tree`,
`lib.mjs` collectors, ADR 0014/0016 exits.
CLEAR: F — NFRs stated and tied to falsifiable scenarios (AB7, AB14, AB17).
CLEAR: G — No sentence claims more than its mechanism; CI-claim softening,
track-honesty caveats, exemption freeze accurately scoped.
