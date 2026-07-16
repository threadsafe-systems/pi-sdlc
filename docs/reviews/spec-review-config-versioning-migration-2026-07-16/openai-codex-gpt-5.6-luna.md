# spec_review — openai-codex/gpt-5.6-luna:high

### Malformed models file is conflated with an absent roster

- severity: high
- confidence: high
- location: Spec §§3.1–3.3, CV9
- defect: `readConfigRawForMigration` returns `models: <parsed-or-null>`, so an absent models file and an unparseable models file are indistinguishable to `planMigration`. The latter can therefore be treated as rosterless and deleted, despite the write-nothing guarantee.
- evidence: Spec lines 195–198, 227–243, 253–256; CV9 lines 652–656 only tests an unknown key, not malformed JSON.
- impact: A malformed consumer-owned file may be silently removed; the promised malformed-input refusal is not gated.
- fix: Return explicit presence/parse-error state and add a malformed-models fixture asserting zero writes.

### Recovery contract omits durable rename/unlink recovery

- severity: high
- confidence: high
- location: Spec §3.4
- defect: The sequence fsyncs only the staging file, then renames and unlinks without specifying directory durability, backup, or journal recovery. It cannot substantiate the claimed states after interruption around rename/unlink.
- evidence: Spec lines 263–280 prescribe only staging-file fsync, rename, and unlink while claiming no other state is reachable.
- impact: A crash can leave a state not covered by CV10, invalidating the advertised recoverability guarantee.
- fix: Specify the crash model and require durable directory sync/backup journaling, with fault tests covering post-rename and post-unlink interruption.

### `--enforcement` is missing from migration flag exclusion

- severity: medium
- confidence: high
- location: Spec §4.1
- defect: The new config-mutating `--enforcement` flag is defined in §4.3 but omitted from the migration-mode forbidden flag list.
- evidence: Spec lines 301–307 omit `--enforcement`; lines 328–336 define it as a config-writing flag.
- impact: An implementation may migrate and rewrite enforcement in one run, violating the one-mutation-class contract.
- fix: Add `--enforcement` to the refusal list and add a migration-plus-enforcement scenario.

### Residue cleanup does not define staging-file removal

- severity: medium
- confidence: high
- location: Spec §4.2, CV11
- defect: A leftover staging tmp file triggers the residue prompt, but the prompt only names the models file and acceptance only specifies unlinking/reporting `models: removed`.
- evidence: Spec lines 314–320 mention tmp residue; lines 317–318 specify only models removal; CV11 line 666 additionally requires tmp removal without defining its report/action.
- impact: Implementers must guess whether tmp is removed, what report asset identifies it, and what happens when only tmp exists.
- fix: Define separate residue paths, unlink behavior, prompt text, and report actions for models and staging tmp.

### Fold can emit an invalid `$comment`

- severity: medium
- confidence: high
- location: Spec §2 and §3.3
- defect: v2 requires `panels.$comment` to be a string and the fold copies it verbatim, but the existing v1 runtime validator accepts any `$comment` type.
- evidence: Spec lines 71–72 and 236; `skills/sdlc/scripts/lib.mjs:436-442` allows `$comment` but performs no type validation.
- impact: A currently accepted v1 config with `$comment: 7` can produce a v2 config that fails its own schema, violating the exact fold contract.
- fix: Mark non-string `$comment` as unmappable with zero writes, or explicitly preserve/relax the v2 type.

VERDICT: REVISE
