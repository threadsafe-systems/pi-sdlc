# Consolidated plan review — CI, biome, semantic-release (v1)

- Target: `docs/plans/2026-07-11-ci-biome-semantic-release.md` @ d8d6d0a
- Panel: openai-codex/gpt-5.6-sol, zai/glm-5.2, moonshotai/kimi-k2.6
  (3 distinct vendors; ≥2 required; anthropic excluded as author)
- Orchestrating model: anthropic (session), also the author; adjudication
  reviewed by the project owner (final adjudicator)

## Structural verdict: split the plan

**Two vendors independently caught the same structural defect** (glm medium,
kimi medium): this plan bundled biome + CI (tooling — the iron law's own
text: "Everything else is reversible (internal refactors, docs, tests,
tooling)") with the semantic-release pipeline (genuinely irreversible — a
public release policy). Grounded directly in `skills/sdlc/SKILL.md`'s own
text, and correct: I was inconsistent with this project's own established
practice this session (the last two changes were correctly fast-tracked as
reversible).

→ **Incorporated by splitting into two plans:**

- `docs/plans/2026-07-11-biome-ci.md` (reversible, fast path — biome +
  CI workflow, no plan/spec panel required pre-PR).
- `docs/plans/2026-07-11-semantic-release.md` (irreversible — the release
  pipeline only; this doc, revised).

## High (all three vendors, unanimous on the core issue)

**The DoD accepted unverifiable release-pipeline behavior on the single
deliverable the irreversible track exists to scrutinize** (codex high, glm
high, kimi high — unanimous). glm named the concrete fix: `semantic-release
--dry-run` computes the next version, renders the changelog, and reports the
would-be tag/release without publishing — closing exactly the loop I'd
waived.
→ **Incorporated.** Scope and DoD (revised release-only plan) now require a
`--dry-run` run against this branch's actual commit range before merge,
verifying plugin config parses, tag format matches the existing `v0.1.0`/
`v0.1.1` baseline, and the changelog renders — not just "config presence."

**ADR 0009 does not say what I claimed it says** (kimi high — verified
myself by rereading the ADR directly: it records the repo-hosting decision
only; it never mentions npm, registries, or publishing scope at all).
→ **Incorporated.** Corrected: the "no npm publish" choice is this session's
own new decision, not a restatement of an already-locked one. This
strengthens (rather than removes) the case for a new ADR — see below.

## Medium (incorporated)

**No mechanical enforcement of Conventional Commits — only a personal
skill + docs** (codex medium, glm medium, kimi medium with a sharper variant:
GitHub's own merge/squash commit *title* can itself be non-conventional even
when every inner commit is correctly typed — three-vendor agreement on the
underlying gap, kimi adding the concrete failure mode).
→ **Incorporated, upgraded from "accepted risk" to scoped-in mechanism.**
Given three independent vendors flagged this as central (not peripheral) to
the pipeline's entire correctness guarantee, the release-only plan now scopes
in a lightweight commit-message CI check (validating the type-prefix
grammar; exact mechanism — commitlint vs. a small custom script — pinned at
spec time, kept minimal per the "biome minimal" spirit already set for this
initiative) that runs on every PR, including on the PR/merge commit title.

**CI "gate" wording claimed enforcement that a workflow file alone doesn't
provide** (codex medium — no branch-protection/required-status-check is
scoped). → **Incorporated**, now scoped into the *biome+CI* plan (since CI
enforcement moved there in the split): a one-time, manual GitHub
branch-protection step (required status check), documented with the exact
command/UI step at spec time, plus honest wording that the workflow file
alone is necessary but not sufficient.

**`package.json`'s version field will drift, framed as an open question
rather than the near-certain consequence it is** (glm medium — correct:
`@semantic-release/npm` is the only stock plugin that writes that field, and
it's deliberately excluded). → **Incorporated.** No longer framed as
uncertain: documented as the expected outcome (tags are the version source
of truth; `package.json`'s field becomes non-authoritative) rather than left
ambiguous, with the lightweight-bump-mechanism alternative named and
deferred rather than silently possible.

**Bootstrap-sequencing risk: two related but distinct angles** — codex
medium (the pipeline's own landing PR triggers `push` on `main` and could
fire an unexpected release from its own newly-typed commits) + kimi medium
(does semantic-release exit clean or fail-loud when zero commits are
release-eligible, risking a red first-run status). → **Incorporated,
subsumed by the dry-run fix above**: running `--dry-run` against this PR's
actual commit range before merge answers both questions concretely rather
than leaving them as open risk, and the plan now states the bootstrap policy
must be a deliberate, observed decision, not an accident.

**Missing ADR for the new release/versioning policy** (codex medium, glm
medium — both independently correct, and strengthened by the ADR-0009
correction above). → **Incorporated**: a new ADR (release & versioning
policy) added to the release-only plan's scope and DoD.

**Rationale cited an unmerged PR's bug as an "observed" cost — a real
self-contradiction the same document later admits** (kimi medium — a fair,
sharp catch of my own imprecision). → **Incorporated**: reworded to state
plainly that the JSON bug was caught during this session's own development
(true, and still a real motivating example), not implied to be sitting in
merged history.

## Low (incorporated)

**Global skill path (`~/.pi/agent/skills/`) appears to contradict this
repo's own convention (`~/.agents/skills/`), cited in ADR 0009, SKILL.md, and
the original extraction plan** (glm low). → **Clarified, not changed.** The
path was the project owner's own explicit instruction for this specific
skill, not my choice — both locations are genuinely in active use on this
machine for different skill sets (confirmed: `~/.pi/agent/skills/md-to-pdf`
exists and loads today). Added a one-line note to avoid confusing a future
reader who cross-references ADR 0009's differently-scoped phrase.

## Stop condition

No high or medium finding survives without either a concrete fix or an
explicit, reasoned decision recorded above. The structural split is the
biggest single change and is presented to the project owner for approval
before spec work begins on either resulting plan.
