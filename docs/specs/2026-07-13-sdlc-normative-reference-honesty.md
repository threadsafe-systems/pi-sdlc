# Specification: normative-reference honesty

- Date: 2026-07-13
- Plan: `docs/plans/2026-07-13-sdlc-normative-reference-honesty.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Track: irreversible
- Author vendor: openai
- Dependency: sub-change 2 (FS9/FS10 adoption bundle and lifecycle checking) is merged at v0.5.0. This specification is grounded against that committed shape.
- Human gate: specification approval is exercised autonomously under the user instruction to complete the lifecycle without interactive approval; the final PR remains the user’s sign-off point.

## 1. Frozen surfaces

### 1.1 Inventory file

The package ships `skills/sdlc/assets/normative-references.json` with:

```json
{
  "schemaVersion": 1,
  "package": "pi-sdlc",
  "sources": [
    {
      "id": "skill.pr-declaration",
      "source": "skills/sdlc/SKILL.md",
      "assertion": "...exact stable marker...",
      "targetKind": "file|command|facility|external",
      "ownership": "package|consumer|external",
      "required": true,
      "resolution": "package|consumer|readiness|external",
      "target": "repo-relative path or facility id",
      "verification": {
        "source": "package-relative verifier path",
        "assertion": "stable verifier marker"
      }
    }
  ]
}
```

Rules:

- `schemaVersion` is exactly `1`; unknown top-level or entry keys are errors.
- `id` is unique, lowercase dotted text; `source`, `assertion`, `target`, and `targetKind` are non-empty strings.
- `source` and `verification.source` must remain inside the package root; absolute paths and `..` segments are errors.
- `targetKind` is one of `file`, `command`, `facility`, `external`.
- `ownership` is one of `package`, `consumer`, `external`.
- `resolution` is one of `package`, `consumer`, `readiness`, `external`.
- `required` is boolean. Required consumer-owned entries are not silently passed: they report `unverified-consumer` unless a readiness verification is present and valid.
- `package` ownership requires `resolution: package`; package targets must resolve beneath the package root.
- `consumer` ownership requires `resolution: consumer` or `readiness`; `target` is relative to a consumer root only as documentation and is never read by this package checker.
- `external` ownership requires `resolution: external`; it reports `external` without probing a network or executable.
- `readiness` requires `verification.source` and `verification.assertion`. The checker verifies both the verifier source and assertion are present exactly once. This is a static coupling to the shipped FS8/FS10 assertion; it does not make a live consumer readiness call.
- The inventory includes self-entries for the inventory, schema, checker, and wrapper. This prevents the checker from silently omitting its own enforcement surface.
- The inventory covers every normative reference in the enumerated generic sources. Incidental examples are not normative and are not entries.

### 1.2 Checker CLI

The package ships:

- `skills/sdlc/scripts/check-references.mjs`;
- `skills/sdlc/scripts/check-references.sh`.

Invocation:

```text
check-references.mjs [--package-root DIR] [--inventory FILE] [--format text|json]
```

Defaults are the repository package root (the directory four levels above this script, containing `skills/sdlc/`) and `skills/sdlc/assets/normative-references.json` for the inventory. `--package-root` and `--inventory` are explicit test/headless overrides. `--format json` anywhere in argv forces exactly one JSON envelope, including argument errors. No command is executed from inventory data and no network/model call is made.

Exit contract:

- `0`: every package-owned assertion/target passes and all non-package entries are correctly classified;
- `1`: inventory or package contract violation (missing target, assertion count not exactly one, invalid readiness coverage, malformed ownership mapping);
- `2`: usage, unreadable input, invalid JSON, invalid inventory schema, or package-root containment/operational error.

JSON envelope:

```json
{
  "schemaVersion": 1,
  "reportVersion": 1,
  "packageRoot": "/absolute/path",
  "inventory": "skills/sdlc/assets/normative-references.json",
  "state": "pass|fail|error",
  "exitCode": 0,
  "checks": [
    {
      "id": "skill.pr-declaration",
      "status": "pass|fail|unverified-consumer|external",
      "message": "single-line deterministic message"
    }
  ]
}
```

`packageRoot` is absolute and deterministic for the invocation. Source-derived messages replace `\r`, `\n`, ANSI escape sequences, and other control characters with visible `\\xNN` escapes and are capped at 160 characters. Inventory ids and fixed labels are emitted without shell interpolation. Text output uses the same checks in inventory order and begins with `reference-check: <state>`.

### 1.3 Source assertion matching

`assertion` is a literal substring, not a regular expression. The checker reads UTF-8 source text and requires exactly one occurrence for each package-owned or readiness entry. The mutation contract is explicit: deleting or changing a pinned assertion causes that check to fail with exit 1. A source read failure is exit 2. A package target missing from disk is exit 1. A verifier assertion missing or duplicated is exit 1.

### 1.4 Ownership/status matrix

| Ownership | Resolution | Target read | Result |
|---|---|---|---|
| package | package | yes, contained | pass/fail |
| consumer | consumer | no | unverified-consumer (required or optional) |
| consumer | readiness | verifier source + assertion | pass/fail |
| external | external | never | external |

The checker never treats `unverified-consumer` or `external` as package proof. They are valid classifications for entries whose ownership explicitly says they are outside the package boundary.

## 2. Required source corrections

The generic prompt/document source must satisfy these exact assertions:

1. `adversary-plan.prompt.md` and `adversary-spec.prompt.md` say `the project's governing documents (for example, AGENTS.md or an equivalent if present)` and do not require an `AGENTS.md` file.
2. `adversary-review.prompt.md` says `the project's governing documents` and names `CONTRIBUTING.md` only when reviewing this package; it contains no `CONTRIBUTORS.md`.
3. `validator-task.prompt.md` contains no `<CONTRIBUTORS_PATH>` and uses `the governing standards and banned-pattern inputs named by the approved Build plan`.
4. `SKILL.md` does not claim universal CI enforcement. It says the shipped local checker is canonical and GitHub CI enforcement is conditional on setup/configuration. It describes the PR template and lifecycle checker assets shipped by FS9/FS10.
5. The panel dispatch section contains a concrete task-block contract: the generated `tasks` object is ready to paste after replacing the placeholder with the exact review task text, and each task must carry the artifact paths, commit, grounding rule, and requested finding format. The source must not leave a reader with an unexplained `FILL_IN_TASK_BLOCK` instruction.
6. Package-owned references to `assets/tracker-ops.md`, `assets/agent-brief.md`, schemas, prompts, scripts, PR template, lifecycle workflow, and checker resolve to shipped files. Consumer `.pi/sdlc/workflow.md`, consumer PR templates, and tracker/`gh` facilities are explicitly marked optional or external.

Generated golden agents are refreshed from the source prompts; source prompts remain authoritative.

## 3. Scenarios

### NR1 — Inventory schema and self-entries

Given the committed inventory, the checker accepts schema version 1, every id is unique, all source/verification paths are contained, and self-entries exist. Removing a required field, adding an unknown key, escaping the package root, or duplicating an id exits 2 with one valid JSON envelope.

### NR2 — Package target and assertion success

Given current committed sources and assets, every package entry has exactly one source assertion and its target exists. The checker exits 0; text and JSON have identical ordered checks and aggregate state.

### NR3 — Missing target and assertion mutation

A fixture that deletes a package target, removes a pinned source assertion, or duplicates one produces a named check failure and exit 1, not exit 2. The mutation is inert and cannot execute source text.

### NR4 — Ownership classifications

Consumer-owned entries report `unverified-consumer`; external entries report `external`; neither performs a read or network call. These statuses do not produce a false package pass for a package-owned entry.

### NR5 — Readiness coupling

A readiness entry passes only when its verifier source and exact verifier assertion each occur once. Removing the verifier assertion yields exit 1. The checker performs no live `sdlc-status`, setup, GitHub, or model operation.

### NR6 — Diagnostics safety and mode parity

Inventory/source text containing control characters, ANSI escapes, shell metacharacters, or newlines produces one bounded sanitized diagnostic and cannot execute. `--format json` anywhere in argv emits one valid envelope for success, failure, and usage errors.

### NR7 — Known reference graph

A mutation test proves each pinned known broken-reference assertion is absent after correction: no `AGENTS.md` requirement, no `CONTRIBUTORS.md`, no `<CONTRIBUTORS_PATH>`, no universal CI claim, and no unexplained dispatch placeholder. The package-owned source inventory passes.

### NR8 — Compatibility

Existing FS8, FS9, FS10, panel derivation, extraction, and validator tests remain green. The new checker does not alter their exits, envelopes, or files.

## 4. Non-functional requirements

- Offline and deterministic; no paid model, network, GitHub, or credential operation.
- Node standard library only for the checker.
- POSIX wrapper is a thin sibling-path invocation; direct Node is the cross-platform fallback.
- Diagnostics are secret-safe and single-line.
- Inventory order is report order.
- Existing consumer-owned prompt overrides are not read or certified.

## 5. Compatibility and migration

This adds a versioned FS11-style package consistency surface without changing FS8/FS9/FS10. Consumers with whole-file prompt overrides retain them as consumer-owned and semantically unverified. Consumers should use the package generic prompts or update overrides to remove the known broken assumptions. The checker is advisory to package maintenance unless a consumer configures it in CI; no existing consumer is reclassified by readiness.
