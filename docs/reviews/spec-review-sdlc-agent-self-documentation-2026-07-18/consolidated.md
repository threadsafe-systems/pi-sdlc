# Consolidated Spec review: agent self-documentation

- Date: 2026-07-18
- Track: irreversible
- Reviewed artifact: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md`
  rev 1 → resulting rev 2
- Reviewers: `zai/glm-5.2:high`, `deepseek/deepseek-v4-pro:high` (spec_review
  panel, floor 2, resolved live, author-excluded)
- Author/orchestrator: parent-session model identity not exposed; panel
  resolution used the committed `panels.authorDefault` fallback
  `anthropic/claude-opus-4-8:high` for author exclusion (same as the plan panel).
- Grounding: both reviewers cited `file:line` against the pinned commit
  `d528b97` (`sdlc-status.mjs`, `check-references.mjs`, `lib.mjs`,
  `setup-sdlc.mjs`, schema, inventory) and pi's `docs/skills.md`.
- Stop condition: met after rev 2 — no high or medium finding survives.

## Consolidated findings and adjudication

### S1 — High — startup `error` fallback undefined for the config-invalid sub-case (deepseek)

`check`→`error` conflated "config invalid" and "unrecognized collision"; §15's
"fall back to validated JSON where safe" is meaningful for the collision case
but undefined when there is no valid JSON.

**Adjudication: incorporated.** rev 2 §12 splits the `error` reason into
`collision` vs `invalid-config`; §15 branches on it: `collision` → warn + JSON
fallback; `invalid-config` is a dead branch because FS8 readiness (exit 0)
guarantees `config.valid`, and any post-readiness race surfaces the diagnostic
and stops rather than inventing a fallback. ASD10 unchanged (already covers the
branch).

### S2 — Medium — frozen FS11 discovery set not satisfiable against the current inventory (zai)

Discovery roots `skills/sdlc/scripts/*.sh` and `skills/sdlc/schema/*.json` minus
the exclusion list surface existing files with no inventory row
(`check-lifecycle.sh`, `setup-sdlc.sh`, `sdlc.config.schema.json`,
`sdlc.config.example.json`), so the baseline reference check would already fail.

**Adjudication: incorporated.** rev 2 §16 adds those four files to the coverage
additions (each classified) and states the frozen set is satisfiable against the
pre-change inventory, which is what makes ASD15's omission mutation non-vacuous.

### S3 — Medium — §9 adoption predicate "exit ≠ 1" misstates FS8 (zai)

FS8 aggregates `error` to exit 2 ahead of the `not-adopted` branch, so "exit ≠
1" would classify an errored repo as adopted-and-strict with no readable config.

**Adjudication: incorporated.** rev 2 §9 redefines adopted as the
`adoption.manifest-head` check passing (state ∈ {ready, not-ready}) and treats
`error` (exit 2) as "stop the entrypoint", matching the `SKILL.md` startup
table. ASD12 updated to assert the manifest-head predicate and the error-stop.

### S4 — Medium — ASD12 "match the frozen #38 text" is non-falsifiable (zai)

# 38's stamp text lives only on GitHub and the spec's example was introduced with
"e.g.", so no canonical string is verifiable.

**Adjudication: incorporated.** rev 2 §9 pins the exact canonical `sdlc:spec`
stamp string (drops "e.g.") and restates ASD12 as a structural assertion (single
`>`-prefixed line, no YAML/JSON, required disclosure phrases) verifiable without
the external issue.

### S5 — Medium — sentinel-version lifecycle unspecified (deepseek)

No contract for when an old sentinel version may be retired; the first
format bump could silently turn every existing companion into a collision.

**Adjudication: incorporated.** rev 2 §13 adds the lifecycle rule:
`SUPPORTED_SENTINEL_VERSIONS` includes every shipped version until a package
**major** boundary explicitly retires it (documented as breaking); `write`
regenerate is the sanctioned in-support upgrade path and `--force` the only path
across a retired version.

### S6 — Medium — `canonicalJson` sort order underspecified (deepseek)

`JSON.stringify` does not sort; two implementations could disagree on key order
and produce divergent fingerprints.

**Adjudication: incorporated.** rev 2 §13 pins the algorithm: recursively build
new objects with keys inserted in ascending default `Array.prototype.sort()`
(UTF-16 code-unit) order, arrays left in place, `JSON.stringify` with no `space`.

### S7 — Medium — 220-line SKILL ceiling lacks feasibility evidence (deepseek)

The cap is concrete but its achievability against the seven kernel
responsibilities is unproven; if impossible, the spec gate is wasted.

**Adjudication: incorporated (as a backward-transition escape, not a loosening).**
The cap is approved Plan DoD 4 and the spec must not weaken it. rev 2 §4 and §21
state that infeasibility is a **backward transition to Plan** with evidence (the
iron law permits backward moves), never a silent over-cap ship. This resolves
the reviewability concern without a spec-time DoD change.

### S8 — Low — `version == current` redundant with fingerprint (deepseek)

The fingerprint already incorporates `CURRENT_SENTINEL_VERSION`, so the separate
version-equality conjunct in the `current` predicate adds nothing.

**Adjudication: incorporated.** rev 2 §12 removes the redundant conjunct and
adds a note explaining that `fingerprint matches` already implies the version.

### S9 — Low — glob patterns may require a library, conflicting with §19 (deepseek)

§16 says "glob patterns" while §19 forbids new runtime deps; Node `fs` has no
glob.

**Adjudication: incorporated.** rev 2 §16 constrains discovery to single-segment
`*` wildcards in filename position, implemented with `readdirSync` + anchored
`RegExp` (builtins only).

### S10 — Low — ASD20 merge assertion unconditional despite landing-order dependency (zai)

Telemetry call sites do not yet exist in `setup-sdlc.mjs`, so the unconditional
both-coexist assertion is undefined if this stream lands first.

**Adjudication: incorporated.** rev 2 restates ASD20 as landing-order
conditional: at this stream's merge it asserts the `config-doc` call site is
present and any already-landed telemetry call sites are preserved; the full
both-coexist assertion binds whichever stream rebases second.

## Consolidation notes

- No reviewer finding was dismissed; all 1 high + 6 medium + 3 low incorporated.
- Both reviewers independently CLEARed the frozen-shape completeness, the
  no-contradiction-with-plan axis, the falsifiable-scenario coverage of DoD
  1–14, and the honesty/trust-model sweep.
- Cross-model agreement: the SKILL-ceiling feasibility concern (S7) was raised by
  deepseek and echoed as a residual risk by zai.
- Residual (non-defect) risks recorded by reviewers: the >60% SKILL reduction is
  aggressive but falsifiable; the `phase-tasks.md` filename vs internal "build"
  phase name is a deliberate #38 asymmetry the references must explain.

## Final result

rev 2 incorporates every high, medium, and low finding. No high or medium
finding survives. The Specification is ready for its human approval gate.
