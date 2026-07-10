### Worktree neutrality violated by normative `worktree_session` hooks/examples

- severity: high
- confidence: high
- location: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md §1.1 example, §5.1 interview/flags; docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md Rationale
- defect: The spec hard-codes a specific worktree mechanism (`tool:worktree_session`) in the normative hooks example and in the scaffolder flags/examples, contradicting the approved plan’s worktree-neutrality goal (“pi-sdlc never names pi-worktree”).
- evidence: Plan: “pi-sdlc never names pi-worktree; a repo that uses worktrees names it in its own hook” (docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md:76-77). Spec’s normative hooks example uses `"use": "tool:worktree_session"` (docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:36-37) and the hook-flag scenario bakes it in again (…:308).
- impact: Freezes the wrong dependency direction: consumers will copy/paste the blessed example and scaffolder output, turning an optional repo-local preference into a de facto global prescription; it also makes the DoD “worktree neutrality” claim dishonest.
- fix: Replace all normative examples/default offers that name `worktree_session` with mechanism-agnostic placeholders (e.g. `tool:<your-worktree-tool>` / `skill:<your-worktree-skill>` + a generic `do`), and explicitly state that pi-sdlc ships no recommended worktree tool/skill.

### Script location / invocation is ambiguous and makes the opt-in gate procedure non-executable as written

- severity: medium
- confidence: high
- location: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md §2, §5.2; repo layout README + existing scripts
- defect: The spec instructs running `scripts/sdlc-status.sh` “from the working directory” and `scripts/setup-sdlc.sh` “from the package checkout” but never pins what directory those paths are relative to, even though the repo’s actual scripts live under `skills/sdlc/scripts/`.
- evidence: Spec: “Run `scripts/sdlc-status.sh` (§3) from the working directory.” (docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:150) and template text “run the interview via `scripts/setup-sdlc.sh` from the package checkout” (…:252-253). Existing package docs show scripts under `skills/sdlc/scripts/...` (README.md:39-42), and the only existing script directory is `skills/sdlc/scripts/` (skills/sdlc/scripts/ensure-panel-agent.sh, resolve-panel.sh).
- impact: Implementers can place new scripts in the wrong directory and/or publish SKILL.md instructions users cannot follow; the “mechanical half” of the opt-in gate fails because the called path won’t exist in typical working directories.
- fix: Pin the exact on-disk paths for `sdlc-status` and `setup-sdlc` (e.g. `skills/sdlc/scripts/...`) and update the procedure/template to use those pinned paths (or explicitly define a required cwd and why).

### Hook audit format is claimed “exactly” but the schema allows multi-line `run`/`do`, breaking greppability/falsifiability

- severity: medium
- confidence: high
- location: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md §1.1 JSON schema fragment, §1.4 announce format
- defect: The spec requires an “exactly” line-oriented announce-on-fire format, but the schema allows `run` and `do` strings containing newlines, which can produce multi-line output that defeats the “greppable” audit trail and makes violations hard to falsify.
- evidence: “agent emits exactly:” followed by single-line formats (docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:131-138). But the schema permits any non-empty string for `run` and `do` (`{ "run": {"type":"string","minLength":1}}`, `{ "do": {"type":"string","minLength":1}}`) (…:78-86).
- impact: Freezes an audit contract that cannot be reliably checked: a hook containing newlines can make the announce block non-line-based and still “present”; downstream transcript grep checks become non-authoritative.
- fix: Constrain `run` and (optionally) `do` to single-line strings in both schema + validateConfig (e.g. `pattern: "^[^\r\n]+$"`), or specify a canonical escaping/normalization rule (newline replacement + truncation semantics) used in both the announce format and any verifier.

### `setup-sdlc` hook flag ordering is under-specified despite hook semantics making order meaningful

- severity: medium
- confidence: high
- location: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md §1.2 ordering; §5.1 hook flags
- defect: Hooks are defined as ordered arrays (“Within a list, array order”), but the scaffolder contract doesn’t specify how repeated `--hook-run` / `--hook-use` flags are ordered/merged into the resulting arrays (especially when mixed).
- evidence: Hook semantics: “Within a list, array order.” (docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:103-104). Scaffolder flags define `--hook-run` and `--hook-use` but do not specify append order or stable ordering across multiple uses (…:220-221).
- impact: Two conforming implementations can generate different hook list orders from identical CLI invocations, freezing inconsistent behaviour across repos and making hook execution order (which can be safety-critical) unpredictable.
- fix: Specify that each hook flag appends one item, preserving argv order globally, and add a verification scenario asserting order stability for multiple mixed hook flags.

### Advisory-mode “no announce” requirement is ambiguous vs the approved plan

- severity: medium
- confidence: high
- location: docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md Objectives; docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md §2
- defect: The plan requires advisory mode to have “no announce”, but the spec mandates ongoing “phase announcements” prefixed with `advisory:` without explicitly stating whether the start-of-work announce string is suppressed and what “announce” means in this context.
- evidence: Plan: advisory mode = “phases as guidance, no announce, no enforcement, no tracker mutations” (docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md:17-19). Spec: “Advisory accepted: prefix every phase announcement with `advisory:`” (docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:158-160).
- impact: Freezes conflicting consumer expectations: some readers will interpret “no announce” as no phase announcements at all; others as “no config announce string”; implementation and review panels can’t consistently judge compliance.
- fix: Define advisory mode’s announce rules precisely (e.g., forbid the config’s `announce` string and any “under law” claims; explicitly allow or forbid per-phase markers), and align the wording with the plan’s “no announce” sentence.

### Broken internal reference: `§2.1` does not exist

- severity: low
- confidence: high
- location: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md §6 item 7
- defect: The spec references “(§2.1)” but there is no §2.1 section.
- evidence: “The announce paragraph updated to route through `sdlc-status` (§2.1).” (docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:274).
- impact: Creates ambiguity for implementers and reviewers about which normative text to copy into SKILL.md.
- fix: Correct the reference to the actual section (likely §2 or §3).

CLEAR: E — No framework-behaviour claims in the spec were found to contradict the pinned pi docs (packages/prompts loading) when checked.
CLEAR: F — NFRs are stated and mostly tied to scenarios (notably no new runtime deps, no live model calls in tests).
CLEAR: G — No clear over-claim beyond the identified plan/spec mismatch; most “prose law” claims are scoped as documentation/panel-verified.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Findings include concrete defects with severities and file:line evidence (spec/plan/README)."
    }
  ],
  "changedFiles": [
    "docs/reviews/spec-sdlc-opt-in-and-hooks-2026-07-10/gpt-5.2.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "nl -ba docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md | sed -n ...",
      "result": "passed",
      "summary": "Read spec with line numbers"
    },
    {
      "command": "nl -ba docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md | sed -n ...",
      "result": "passed",
      "summary": "Read plan with line numbers"
    },
    {
      "command": "nl -ba skills/sdlc/scripts/lib.mjs | sed -n ...",
      "result": "passed",
      "summary": "Grounded script/layout assumptions"
    }
  ],
  "validationOutput": [
    "Review-only: no repo validation commands (npm test) were executed."
  ],
  "residualRisks": [
    "If the project intends to keep naming specific worktree tooling in examples, the approved plan text (‘never names pi-worktree’) must be reconciled or amended; otherwise reviewers will keep flagging it as a contradiction."
  ],
  "noStagedFiles": true,
  "diffSummary": "No code changes reviewed here; produced spec review findings only.",
  "reviewFindings": [
    "high: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:36-37 vs docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md:76-77 — violates worktree neutrality by hard-coding tool:worktree_session",
    "medium: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:150,252-253 vs README.md:39-42 — script path/cwd ambiguity",
    "medium: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:131-138 vs :78-86 — announce format ‘exactly’ not compatible with multi-line strings",
    "medium: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:103-104 vs :220-221 — hook ordering under-specified",
    "medium: docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md:17-19 vs docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:158-160 — advisory ‘no announce’ ambiguity",
    "low: docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md:274 — broken §2.1 reference"
  ],
  "manualNotes": "Wrote findings to the requested review file; no other files modified."
}
```
