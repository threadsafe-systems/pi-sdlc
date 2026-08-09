# Spec-review round 2 — consolidated

Dispatched 2026-08-09, prompt `prompt-round2.md`. Panel: gpt-5.6-luna:xhigh
(6 findings), maas-qwen/glm-5.2:xhigh (6 findings). Raw outputs:
`round2-gpt-5.6-luna.md`, `round2-glm-5.2.md`.

Both reviewers verified all 19 round-1 fixes landed correctly (CLEAR A) and
skeleton conformance intact (CLEAR E); PROPORTIONALITY clear on both. 12 raw
findings consolidate to 10 canonical. Verdict: **10 incorporated, 0
rejected.**

## Canonical findings and adjudications

### CANON-R2-01 (high) — exact-two-artifact requirement unfalsifiable — INCORPORATED

Source: luna R2-03. C1 requires two artifacts but no scenario asserted the
count or rejected a third. Fix: GPC1 now asserts §8 states exactly two
artifacts and names no third; falsifier added.

### CANON-R2-02 (medium) — no-contradiction/no-resurrection clause missing — INCORPORATED

Source: glm R2-01. Plan scope item 4 carries the clause with attack-surface-D
routing; spec C2/GPC2 had omitted it. Fix: C2 signature and GPC2 extended,
routing by reference only.

### CANON-R2-03 (medium) — GPC15 rejected the spec's own lifecycle artifacts — INCORPORATED

Source: luna R2-01. The PR diff legitimately carries the spec, review records,
build plan, and receipts. Fix: GPC15 scoped to phase-doc/governed-doc edits
with an explicit lifecycle-artifact exemption.

### CANON-R2-04 (medium) — GPC15 surface enumeration omitted C8 — INCORPORATED

Source: glm R2-02. The test file is C8's declared surface. Fix: enumeration
now C1–C6, C8, and C9–C10 (anchor-only references elsewhere unchanged).

### CANON-R2-05 (medium) — GPC13 named a nonexistent Build decision point — INCORPORATED

Source: luna R2-04. Build has no gate (phase-tasks.md); validation is
per-task during Implement. Fix: decision point renamed to the first per-task
task-close validation during Implement.

### CANON-R2-06 (medium) — DoD 3 command and timing budgets ungated — INCORPORATED

Source: luna R2-05. Fix: GPC12 now runs the exact
`node --test test/gate-presentation-contract.test.js` offline under one
second and bounds the corpus by the plan's 30-second external budget.

### CANON-R2-07 (medium) — DoD 7 lifecycle and DoD 8 consumer-fixture ungated — INCORPORATED

Source: luna R2-06 + glm R2-04 (convergent on lifecycle). Fix: GPC15 gains
the explicit consumer-fixture diff assertion; lifecycle command noted for the
final verification sweep (see note below).

### CANON-R2-08 (low) — GPC15 absent from C8/F7 bindings — INCORPORATED

Source: luna R2-02 + glm R2-03 (convergent). Fix: GPC15 added to C8's
Gated-by and F7's binding.

### CANON-R2-09 (low) — GPC11 broken double negative — INCORPORATED

Source: glm R2-05. Fix: "no file under skills/sdlc/scripts/ other than none"
rewritten as "the branch adds no file under skills/sdlc/scripts/".

### CANON-R2-10 (low) — stale plan SHA 5f105fa — INCORPORATED

Source: glm R2-06. Verified: 5f105fa is dangling after the branch history
rebuild; the plan rev-5 content commit on this branch is 1dd6211. Fix: both
references (header, GPC14) updated.

## Note on the DoD 7 lifecycle command

The check-lifecycle exit-0 check runs once Spec AND Build artifacts are
committed (plan DoD 7; mid-run artifact.build failure expected until then).
It is bound to the final verification sweep at PR time rather than GPC12,
which runs during spec/build work — GPC15's carried scope carries it at the
PR gate.

## Ledger

Round 2: 10 canonical findings (1 high, 6 medium, 3 low), 10 incorporated,
0 rejected. Cumulative: 29 findings, 29 incorporated, 0 dismissed. Spec rev 3
committed with this record.
