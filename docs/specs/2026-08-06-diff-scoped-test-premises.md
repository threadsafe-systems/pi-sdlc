# Spec: durable scenario premises and the standing diff guard

Upstream: `docs/plans/2026-08-06-diff-scoped-test-premises.md` rev 4,
approved by Neil on 2026-08-06 after the round-3 churn restructure. Track:
**irreversible**. Resolves #208.

This Spec fixes the normative law, pi-sdlc's local enforcement contract, the
matcher that was deliberately left executable rather than prose-defined in the
Plan, and the falsifiable scenarios. It does not reopen Plan decisions D1-D4.

## 1. Plan amendments and inbound carries

There are no amendments to the approved Plan and no formal `CARRY-TO-SPEC`
records to land. The Plan's detector handoff is not a carry disposition; it is a
named Spec deliverable and lands in §4 with executed output in §5. The S1
handoff lands in §7 and scenario DSP14.

## 2. Normative vocabulary

These terms are semantic, not detector syntax:

- **Scenario test:** a standing check whose assertion must remain meaningful
  after its authoring branch merges. It tests the current product contract, not
  the historical change that introduced it.
- **Moving ref:** a repository reference whose resolved identity changes when
  the authoring branch becomes the main line, including the main-line branch
  name, a remote-tracking equivalent, or a merge-base calculated against one.
- **Pinned commit:** a full immutable commit id used as a historical anchor.
  The commit remains the same object after merge.
- **Current tree:** file content read from the checked-out tree under test.
- **Non-change claim:** a claim that a named surface did not change in one
  particular diff. It is falsifiable only against that diff and is therefore
  not a standing scenario invariant.
- **Standing diff guard:** the repository-owned test whose purpose is to compare
  protected surfaces with the branch base. It is maintained explicitly whenever
  those surfaces are intentionally reopened.

A fixture repository's own `HEAD` is not a moving ref under this contract. For
example, `rev-parse HEAD` on a temporary repository created by a test names the
fixture state under test; merging the authoring branch cannot change it.

## 3. Documentation contracts

### C1 — adopter-facing law in `phase-spec.md` §4

`skills/sdlc/references/phase-spec.md` §4 gains one premise-durability paragraph
with both rules:

1. A scenario must remain falsifiable after merge. A premise anchored to a
   moving ref expires; assert the current tree or a pinned immutable commit.
2. A non-change claim is falsifiable only by a diff and routes to the consumer
   repository's standing diff guard rather than becoming a base-relative
   assertion in a per-slice scenario test.

The paragraph must contain the concept anchors `moving`, `expire`, and `pinned`.
Those are semantic anchors, not required sentence text.

### C2 — implement pointer in `phase-implement.md` §4

`skills/sdlc/references/phase-implement.md` §4 gains one pointer to
`phase-spec.md` §4's premise-durability rule where implementation writes checks.
It must name the standing diff guard route, but must not restate the moving-ref
versus pinned-commit law. Across `skills/sdlc/references/`, C1 is the single
normative statement of that law.

### C3 — repository-local rule in `CONTRIBUTING.md`

`CONTRIBUTING.md` gains `## Durable scenario premises`. It states:

- scenario tests assert current-tree invariants or use pinned immutable commits;
- `test/frozen-surfaces.test.js` is pi-sdlc's standing diff guard and the only
  test permitted to use a moving ref without a reasoned exemption;
- non-change claims belong in that guard's `FROZEN` list rather than in a
  per-slice scenario file; and
- every other matcher hit must either be removed or appear in the guard test's
  exemption map with a present-behaviour reason.

The local section may restate the rule because it is contributor policy, not a
second skill reference.

## 4. Mechanical guard contract

### C4.1 — home, sweep and result shape

A new `test/diff-scoped-premises.test.js` owns the guard. It recursively scans
all executable test source below `test/` whose extension is `.js`, `.mjs`, or
`.cjs`. At the grounded commit `7710509`, that is 60 of the 74 files below
`test/`; the other 14 are six JSON and eight Markdown fixtures, not executable
test source. New matching source files join the sweep automatically; no count is
hard-coded in the test.

The detector returns a file-relative inventory with one or more reasons per
file. The test fails when a reported file is neither fixed nor present in the
closed exemption map. An exemption is file-scoped because all reported
occurrences in each exempt file serve the same present behaviour; its reason is
mandatory and non-empty.

### C4.2 — exact pattern set

The detector is textual and deliberately narrower than the semantic law. It
reports three syntactic shapes:

1. a call to a helper named `baseRef` or `baseFile`;
2. an actual `execFileSync`, `spawnSync`, or `runProcess` git argv containing
   the `merge-base` operation; or
3. one of those git argvs containing `show` or `diff` followed in that same argv
   by an inline literal `main`, `origin/main`, `main:<path>`, or
   `origin/main:<path>`.

The git argv regex stops at the first closing array bracket. It therefore does
not combine an unrelated git invocation with a moving-ref token elsewhere in
the file. The detector fragments its own tokens before joining them, so its
source does not report itself.

The exact executable prototype below was run to produce §5. Its detector core
is normative; implementation may change module/test scaffolding but not the
swept extensions, three pattern branches, or exemption semantics without a
class-(b) Spec amendment.

```js
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const TEST_ROOT = join(ROOT, "test");
const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

const token = (...parts) => parts.join("");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const invokers = [token("exec", "File", "Sync"), token("spawn", "Sync"), token("run", "Process")];
const invoker = `(?:${invokers.map(escape).join("|")})`;
const gitStart = `${invoker}\\s*\\(\\s*(?:\\[\\s*)?["']${token("g", "it")}["']`;
const argvTail = "[^\\]]*";
const historyRead = token("merge", "-", "base");
const contentReads = [token("sh", "ow"), token("di", "ff")];
const mainLine = `${token("ma", "in")}|${token("orig", "in/", "main")}`;
const helperPattern = new RegExp(`\\b${token("ba", "se")}(?:${token("Re", "f")}|${token("Fi", "le")})\\s*\\(`, "g");
const mergeBasePattern = new RegExp(`${gitStart}${argvTail}["']${escape(historyRead)}["']`, "g");
const directReadPattern = new RegExp(
  `${gitStart}${argvTail}["'](?:${contentReads.map(escape).join("|")})["']${argvTail}["'](?:${mainLine})(?::[^"']*)?["']`,
  "g",
);

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
    })
    .sort();
}

function matches(source) {
  const reasons = [];
  if (helperPattern.test(source)) reasons.push("base helper");
  helperPattern.lastIndex = 0;
  if (mergeBasePattern.test(source)) reasons.push("git merge-base invocation");
  mergeBasePattern.lastIndex = 0;
  if (directReadPattern.test(source)) reasons.push("git show/diff with inline moving ref");
  directReadPattern.lastIndex = 0;
  return reasons;
}

const files = sourceFiles(TEST_ROOT);
const hits = files.flatMap((path) => {
  const reasons = matches(readFileSync(path, "utf8"));
  return reasons.length > 0 ? [{ file: relative(ROOT, path), reasons }] : [];
});

console.log(JSON.stringify({ swept: files.length, hits }, null, 2));
```

### C4.3 — known reach and exclusions

This is a recurrence ratchet, not semantic proof. It does not follow a moving
ref assembled dynamically, passed through a same-function variable, or returned
from a helper in another module unless the same source file also matches one of
C4.2's shapes. The existing `disposition-ledger.test.js:53,57` variable path is
reported only because that same callback contains a direct `merge-base` argv.
The existing `frozen-surfaces.test.js:49-51` loop-variable path is reported by
its direct `merge-base` argv and helper declaration.

These are intentional false negatives. Broadening to bare tokens was executed
during Plan review and produced test-title and stub-source false positives. A
low-noise ratchet over the demonstrated copy mechanism is preferred to a noisy
claim of semantic completeness.

The following are intentionally not matches:

- `test/e2e/harness.mjs:250,290`: `git init -b main` creates a sandbox branch; it
  does not read a premise;
- `test/telemetry-emitter.test.js:288`: `rev-parse HEAD` reads a temp fixture's
  own state;
- `test/telemetry-collect*.test.js`: `merge-base` appears inside generated git
  stub source, not an actual git argv in the test process; and
- `test/tracker-ops.test.js`: `main:` appears only in test titles.

### C4.4 — exemptions

After the in-scope fixes, the closed exemption map has exactly two entries:

| file | reason recorded in source |
|---|---|
| `test/frozen-surfaces.test.js` | Standing diff guard: its contract is to compare the protected list with the branch base. |
| `test/disposition-ledger.test.js` | Historical fixture uses a full pinned commit first; its moving-main lookup is a guarded compatibility fallback when that commit is unavailable. |

`test/iteration-disposition.test.js` is a current hit, not an exemption. C5
removes its base helpers and all three diff-only assertions, so it must disappear
from the executed inventory.

### C4.5 — non-vacuity and self-match

The new test constructs, from split tokens, one in-memory source sample for each
C4.2 branch and proves each is reported. It then mutates each sample to a
current-tree or fixture-HEAD equivalent and proves it is not reported. No
matching fixture is written below `test/`. The test also scans its own source and
asserts no match before exemptions are applied.

## 5. Executed detector inventory

The C4.2 prototype was run from repository root at `7710509`:

```text
$ /usr/bin/time -p node /tmp/detect-moving-ref-premises.mjs
{
  "swept": 60,
  "hits": [
    {
      "file": "test/disposition-ledger.test.js",
      "reasons": ["git merge-base invocation"]
    },
    {
      "file": "test/frozen-surfaces.test.js",
      "reasons": ["base helper", "git merge-base invocation"]
    },
    {
      "file": "test/iteration-disposition.test.js",
      "reasons": ["base helper", "git merge-base invocation"]
    }
  ]
}
real 0.06
user 0.05
sys 0.02
```

This is the pre-implementation inventory. C5 fixes the third entry; C4.4
reason-exempts the first two. The 60-file count is evidence, not a test constant.
The process timing includes Node startup; the in-suite scan has no process spawn.

## 6. Existing-scenario disposition contract

### C5.1 — remove dead base machinery

From `test/iteration-disposition.test.js` remove the `node:child_process` import,
`baseRef`, and `baseFile`. No remaining executable use of `execFileSync` exists
in that file after C5.2-C5.4; the source-inspection regex at today's line 471 is
just data and needs no import.

### C5.2 — convert IDV3 to a literal current-tree invariant

IDV3 compares the current `system-reference.md` numbered headings §1-§14 with
this exact literal array:

```text
1. Purpose
2. Kernel — invariant guarantees and the two tracks
3. Adoption & readiness
4. Tracks, phases, transitions, gates, refusal
5. Public composition inventory (FS11 taxonomy)
6. Configuration & extension surfaces
7. Artifacts & durable evidence
8. Normal full-lifecycle operation and the six standalone entrypoints
9. Advanced modes
10. Operational troubleshooting and the source-inspection boundary
11. Next-read routing (authority map)
12. Lifecycle telemetry (FS13)
13. Stall detection and self-resume
14. Presenting questions to the human
```

It fails on deletion, renumbering, or retitling. Its non-vacuity check mutates one
heading in memory and proves the equality fails.

### C5.3 — convert IDV14 to a thin-router content invariant

Keep the existing IDV14 test of `phase-tasks.md`'s Spec gap log. Replace only the
second, diff-scoped IDV14 test with a current-tree check of
`templates/sdlc-tasks.md`:

- after stripping YAML front matter, the body contains `Thin router`;
- the body contains no `Spec gap log` heading or phrase; and
- no Markdown table header in the body contains all four normalized column
  names `description`, `severity`, `disposition`, and `landing site`.

Stripping front matter is required because its legitimate `description:` key is
not a Spec-gap column. Non-vacuity adds the forbidden four-column table to an
in-memory copy and proves the check fails.

### C5.4 — retire IDV15 and IDV16 with local reasons

Delete only the diff-scoped duplicate IDV15 and the diff-scoped IDV16. Leave a
short source comment at each former test location, serving the current reader:

- beside the remaining prompt assertions: `validator-task.prompt.md` is already
  protected by `test/frozen-surfaces.test.js`'s `FROZEN` list, so no second
  scenario assertion is needed;
- beside the NFR/static section: non-change obligations are enforced by the
  standing diff guard; standing scenarios assert current-tree behaviour.

The comments must not cite the Plan, panel, PR, or historical removal. They
state present enforcement ownership only.

## 7. S1 handoff contract

The implement phase posts a comment on issue #192 stating that S1's rewrite of
`phase-spec.md` §4 must preserve the premise-durability law, and linking this
Spec. The comment names the standing test scenario DSP3 as the mechanical
witness. The issue comment is the durable handoff; the branch-local test is the
mechanical witness.

## 8. Non-functional requirements

| id | requirement | gate |
|---|---|---|
| N1 | The guard and DSP3 read local files only: no child process, network, model, shell, or new CI workflow. | DSP12 |
| N2 | The guard plus DSP3 complete in under 1 second wall time in one local test process. | DSP12 |
| N3 | All 60 current executable test sources are in scope recursively; future `.js`/`.mjs`/`.cjs` files join automatically. | DSP4 |
| N4 | Detector source does not report itself and test fixtures do not plant a reportable token below `test/`. | DSP5-DSP6 |
| N5 | No frozen surface changes; no post-merge re-freeze PR is owed. | DSP15 |

Security and durable-data migration are not applicable: the change reads
repository source and documentation, writes no runtime state, accepts no
untrusted input, and changes no persisted schema.

## 9. Verification scenarios

| id | pass | fail |
|---|---|---|
| DSP1 | `phase-spec.md` §4 contains exactly one premise-durability law and its `moving`, `expire`, `pinned` anchors. | Any anchor or either routing rule is absent, or the law is duplicated elsewhere in references. |
| DSP2 | `phase-implement.md` §4 points to the Spec law and standing guard without restating moving-vs-pinned semantics. | No pointer/route exists, or a second normative copy exists. |
| DSP3 | An in-memory mutation deleting each of `moving`, `expire`, and `pinned` independently makes the C1 check fail. | The law check survives removal of any anchor. |
| DSP4 | Recursive enumeration covers every `.js`, `.mjs`, and `.cjs` below `test/`, including `test/e2e/harness.mjs`; the implementation hard-codes no file count. | A matching extension is omitted or a fixed count is required. |
| DSP5 | Each C4.2 positive in-memory sample reports its expected reason; current-tree and fixture-HEAD negatives do not. | Any pattern branch is vacuous or either named negative reports. |
| DSP6 | The detector scans its own source before exemptions and reports no reason; no on-disk mutation fixture exists. | Self-source reports or a reportable fixture is planted under `test/`. |
| DSP7 | Before C5, the executed inventory equals §5; after C5 it contains only the two C4.4 files, and both have non-empty reasons. | A current hit is unlisted, `iteration-disposition.test.js` remains, or an exemption lacks a reason. |
| DSP8 | IDV3's current-tree headings equal C5.2's literal §1-§14 array. | Any heading is deleted, renumbered, or retitled. |
| DSP9 | Mutating one literal heading in memory causes the IDV3 helper/assertion to fail. | IDV3 can pass without enforcing the literal array. |
| DSP10 | The converted IDV14 accepts today's thin router and rejects an in-memory body containing the four-column Spec-gap table. | It reads git history, rejects the legitimate front-matter `description`, or accepts the forbidden table. |
| DSP11 | The diff-scoped duplicate IDV15 and IDV16 are absent; the remaining source identifies the `FROZEN` list and standing diff guard as present owners without process-history comments. | Either test remains, ownership is unrecorded, or comments narrate plans/reviews/removal. |
| DSP12 | The two new tests import no child-process/network API and complete together under 1 second in the normal test process. | Either uses an external interface or the combined wall time is ≥1 second. |
| DSP13 | `CONTRIBUTING.md` contains all four C3 obligations and names `test/frozen-surfaces.test.js`. | Any local contributor rule is absent. |
| DSP14 | Issue #192 contains the C5-linked handoff naming DSP3 and the premise-durability law before the Spec gate closes. | The comment is absent, points elsewhere, or names no mechanical witness. |
| DSP15 | Full `npm test` passes; touched surfaces pass Biome; `config-doc.mjs check` reports `current`; ASD19 passes with no `FROZEN` change. | Any command fails or a frozen path changes. |

## 10. Outcome traceability

| Plan outcome / DoD | Contract | Scenarios |
|---|---|---|
| adopter-facing law and implement pointer | C1-C2 | DSP1-DSP3 |
| local contributing rule | C3 | DSP13 |
| executed low-noise guard and reasoned exemptions | C4 | DSP4-DSP7, DSP12 |
| four expired premises discharged | C5 | DSP8-DSP11 |
| S1 carry landed durably | §7 | DSP3, DSP14 |
| performance/offline compatibility | §8 N1-N4 | DSP4-DSP6, DSP12 |
| suite, config companion and frozen surfaces | §8 N5 | DSP15 |

Every Plan objective and Definition-of-Done item has a falsifiable scenario.
