# Consolidated spec review — config-versioning-migration (spec rev 1 → rev 2)

- Orchestrating model: `anthropic/claude-opus-4-8:high` (author; excluded
  from the panel per `rules.exclude_author_vendor`).
- Panel: 3 models across 3 vendors (resolved via
  `resolve-panel.sh spec_review --author anthropic/claude-opus-4-8`, need
  >= 2).
  - `openai-codex/gpt-5.6-luna:high` → **REVISE** (5 findings: 2 high, 3
    medium)
  - `zai/glm-5.2:high` → **REVISE** (5 findings: 3 medium, 2 low). First
    dispatch crashed with a host-side Node OOM unrelated to the artifact;
    retried once, succeeded.
  - `deepseek/deepseek-v4-pro:high` → **APPROVE** with 5 non-blocking
    findings (2 medium, 3 low)
- Artifact reviewed: `docs/specs/2026-07-16-config-versioning-migration.md`
  at commit `5ce00b1` on `feat/config-versioning-migration`.

Per-model transcripts: `openai-codex-gpt-5.6-luna.md`, `zai-glm-5.2.md`,
`deepseek-deepseek-v4-pro.md`. Shared prompt: `prompt.md`.

## Adjudication

14 distinct findings after dedup (one pair — deepseek's "exit-code change
unnoted" and zai's "missing-manifest mechanism unspecified" — covers the
same §5.1 gap from two angles and is adjudicated together). All 14 are
incorporated into spec rev 2; none dismissed. No high or medium finding
survives.

### High

1. **Malformed models file conflated with absent roster** (gpt-5.6-luna).
   `readConfigRawForMigration`'s `parsed-or-null` shape could not
   distinguish "file absent" from "file present but unparseable," so a
   malformed consumer file could silently fold as if roster-less instead of
   refusing. **Incorporated**: §3.1 now specifies a three-state contract
   (`absent` / `parsed` / `malformed`) per file; §3.3's mapping table adds
   an explicit malformed-models row (unmappable, never absent); CV9 split
   into two falsifiers (unknown key vs malformed JSON).

2. **Recovery contract lacked a stated durability mechanism for the
   rename/unlink boundary** (gpt-5.6-luna). The original §3.4 fsync'd only
   the staging write; no directory-entry durability was specified for the
   rename or unlink steps. **Incorporated** with a proportionate fix (not
   the reviewer's suggested full backup/journal mechanism, which is
   disproportionate to a git-tracked config file — see dismissal-adjacent
   note below): §3.4 now bounds the guarantee explicitly to process
   crash/kill (not arbitrary power-loss, which is bounded by the config
   being git-tracked, same as every other file this skill writes) and adds
   an explicit directory `fsync` after both the rename and the unlink, so
   the directory-entry update is durable before the next step begins.

### Medium

3. **`--enforcement` missing from the migration flag-mixing refusal list**
   (gpt-5.6-luna). §4.3 defines it as a config-mutating flag but §4.1's
   refusal list omitted it. **Incorporated**: added to the list.

4. **Residue cleanup didn't define staging-tmp-file removal** (gpt-5.6-luna,
   also implicit in CV11's own text). §4.2 only specified the models-file
   prompt/action; the staging tmp file's prompt text, unlink behaviour, and
   report action (`staging: removed`/`retained`) were unstated.
   **Incorporated**: §4.2 rewritten as two independent residue kinds, each
   with its own prompt, accept/decline behaviour, and report action; CV11
   split accordingly.

5. **Fold could emit a schema-invalid `panels.$comment`** (gpt-5.6-luna).
   v1's `inspectModels` never type-checks `$comment`'s value (only its key
   presence), so a non-string `$comment` is legal v1 input; v2 types it as
   `string`. The fold as originally specified would carry it verbatim,
   producing a self-invalidating v2 config. **Incorporated**: mapping table
   marks a non-string `$comment` unmappable (report + no write), consistent
   with every other unmappable-path rule — no silent coercion.

6. **CI release-guard glob over-broad** (zai/glm-5.2). `*.schema.json`
   would also trip on `task-validation-manifest.schema.json` (PV1, an
   independent frozen surface under ADR 0013/0014) and any future schema
   file. **Incorporated**: §8 now names the watched files explicitly
   (`sdlc.config.schema.json` + the transitional deletion of
   `sdlc.models.schema.json`) and states the PV1 file is explicitly not
   watched.

7. **§5.2's "verbatim" claim silently narrowed OL-A's NF-1(b)/OLA21
   byte-identity guarantee** (zai/glm-5.2). Moving the roster source to
   `readConfig(root).panels` means an invalid v2 config now halts at
   `readConfig`'s validation gate (exit 2) before reaching resolution,
   which is a real, deliberate behaviour change for that narrow input class
   — but the spec asserted "verbatim" without reconciling it.
   **Incorporated**: §5.2 now states explicitly that "verbatim" governs the
   resolution algorithm for a config that already validates, and that an
   invalid v2 config is superseded by `readConfig`'s gate (the old
   raw/tolerant lifecycle-only read is deleted by this change).

8. **Missing-manifest vs panels-absent exit-code mechanism was
   underspecified, and the 2→1 change from v1 semantics was unremarked**
   (zai/glm-5.2 + deepseek/deepseek-v4-pro, same gap from two angles,
   adjudicated together). `readConfig` alone cannot distinguish "no
   manifest" from "manifest present, no panels" (both yield an object
   without a `panels` key), so the spec's two different exit codes (2 vs 1)
   for those two cases had no stated detection mechanism; separately, v1's
   `readModels` exited 2 for a missing *file*, and this was never flagged
   as an intentional reclassification. **Incorporated**: §5.1 now specifies
   resolve-panel performs its own `existsSync` check on the config path
   before calling `readConfig`, and states explicitly that a
   present-but-panels-less v2 manifest is a deliberate exit-code
   reclassification (content shortfall, exit 1) distinct from a wholly
   missing manifest (usage error, exit 2) — not a byte-identity claim
   against v1.

9. **Checker surface-area table description didn't name the required
   `classifyConfigVersion` routing** (deepseek/deepseek-v4-pro). The
   original §1 table's checker row read as a widened `inspectConfig` call,
   which an implementer could build as literally widening `inspectConfig`
   to accept v1 — silently passing `config.valid` on v1 configs, the
   opposite of §7's intent. **Incorporated**: §1's checker row now states
   the routing explicitly (`classifyConfigVersion` before `inspectConfig`).

### Low (recorded, non-blocking per the panel process — all incorporated
   anyway since each fix was a one-sentence wording change with no design
   cost)

10. **No CV scenario for preference-mode + a gate that refuses on mode, not
    floor** (zai/glm-5.2). **Incorporated**: added a clause to CV23 and a
    cross-reference from §5.3 item 2.
11. **`inspectModels`/`validateModels` left as unstated dead exports**
    (zai/glm-5.2). **Incorporated**: §3.1 now states both are deleted
    alongside `readModels`, since this change removes every caller.
12. **Fold table silent on an absent (not just unknown) `min_panel`**
    (deepseek/deepseek-v4-pro). **Incorporated**: mapping table row now
    states absence (not just presence) explicitly — omitted, default 1
    applies, not unmappable.
13. **CV4's falsifier didn't pin `minPanel`, risking a false-positive pass
    for the wrong reason** (deepseek/deepseek-v4-pro). **Incorporated**:
    falsifier now reads "`minVendor: 99` and `minPanel: 1`".
14. **CV8 vs CV26 stderr-scope ambiguity** (deepseek/deepseek-v4-pro).
    **Incorporated**: CV8 now states explicitly that the comparison is
    scoped to stdout + exit code, with stderr's legitimate divergence
    cross-referenced to CV26.

## Dismissals

None. All 14 findings were legitimate, evidence-backed gaps in the spec's
own precision (not plan relitigation, not reviewer overreach) and were
incorporated. One finding (recovery-contract durability, #2) was
incorporated in a scoped-down form rather than verbatim — the reviewer's
suggested backup/journal mechanism was disproportionate to what a
git-tracked config file needs; the directory-fsync fix closes the same gap
at the right scope. This is a partial-incorporation, not a dismissal, and is
recorded here for transparency.

## Outcome

Spec revised to **rev 2** (`docs/specs/2026-07-16-config-versioning-migration.md`).
No high or medium finding survives adjudication. Per the sdlc skill's panel
process, the spec is ready for the human-approval gate.
