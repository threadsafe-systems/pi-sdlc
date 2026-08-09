# Spec-review round 1 — consolidated

Dispatched 2026-08-09, prompt `prompt-round1.md`. Panel: gpt-5.6-luna:xhigh
(10 findings), maas-qwen/glm-5.2:xhigh (11 findings). Raw outputs:
`round1-gpt-5.6-luna.md`, `round1-glm-5.2.md`.

21 raw findings consolidate to 19 canonical. Verdict against plan rev 5 text:
**19 incorporated, 0 rejected.** The spec drifted from the approved plan in
several places (§6a/§6b invention, §1/§9 scope omission, test-file name); the
panel caught all of it.

## Canonical findings and adjudications

### CANON-01 (high) — test file name contradicts plan — INCORPORATED

Source: glm R1-01. Plan names `test/gate-presentation-contract.test.js`
(scope item 5, DoD 3); spec named `test/gate-presentation.test.js`
throughout. Fix: rename every occurrence.

### CANON-02 (high) — §6a/§6b is an invented location — INCORPORATED

Source: glm R1-02 + luna R1-01 (phase-plan §4 part). Plan scope item 4 and
DoD 2 say phase-plan.md **§4**; phase-plan.md §6 is "Refusal and
backward-transition behaviour" — §6a/§6b would graft storage rules onto an
unrelated section. Fix: all storage-mode rule references move to §4.

### CANON-03 (high) — phase-brainstorm.md §9 provenance split missing — INCORPORATED

Source: glm R1-03 + luna R1-01. Plan scope item 3 requires §9: sketch embeds
in both modes, only the list becomes the index, resolution comment is the
single home, thread variant. Spec had put home/thread rules under phase-plan
§6b instead. Fix: new contract C9 on §9; home/thread/sketch-both-modes
scenarios re-point there.

### CANON-04 (high) — phase-brainstorm.md §1 dialogue moves missing — INCORPORATED

Source: glm R1-04 + luna R1-01. Plan scope item 2 + DoD 1 require §1 to name
moves G1–G3, G4, G7; spec never mentioned G1–G3 and had misplaced G4/G7 under
§8. Fix: new contract C10 on §1; C5 (G4) and C6 (G7) re-pointed to §1; new
mechanical scenario.

### CANON-05 (high) — §8 omits trigger, absence, amendment loop, transition — INCORPORATED

Source: luna R1-02 + glm R1-05. Plan scope item 1 lists all four as §8
content. Fix: C1 signature extended; new mechanical scenario asserting §8
names the trigger condition (new flow or ≥3 interacting components), the
absence declaration, and the amendment loop.

### CANON-06 (medium) — sketch-in-both-modes ungated — INCORPORATED

Source: glm R1-06 (+ luna R1-07 partial). Plan scope item 3 + test direction.
Fix: C9 invariant + mechanical scenario; GPC14 gains a mismatched-sketch
falsifier.

### CANON-07 (medium) — one-line entries not enforced — INCORPORATED

Source: luna R1-03. Plan test direction names one-line entries. Fix: C3 gains
the invariant that every entry is one physical line; GPC5 rejects multiline
entries of all three kinds.

### CANON-08 (medium) — C2 precondition excludes standalone Plans — INCORPORATED

Source: luna R1-04. Fix: precondition rewritten to cover both a
Brainstorm-derived Plan and a standalone Plan with live-formed intent +
`no upstream gate` declaration.

### CANON-09 (medium) — ADR suffix optionality contradicts plan — INCORPORATED

Source: luna R1-05. Plan: "qualifying decisions take the suffix." Fix: suffix
required whenever the Governance bar applies; GPC6 asserts §8 states the
conditional requirement.

### CANON-10 (medium) — GPC10 undecidable — INCORPORATED

Source: luna R1-06. Fix: replace the semantic "never restate" test with a
decidable bound — the test file contains no contiguous substring of ≥80
characters that appears in any governed doc.

### CANON-11 (medium) — GPC1 semantic clause under mechanical label — INCORPORATED

Source: glm R1-07. Fix: GPC1 keeps structural checks only; the
framing/not-contractual judgment stays with GPC13 (inspection).

### CANON-12 (medium) — GPC14 never compares the canonical home — INCORPORATED

Source: luna R1-07. Fix: Given names the home body
(issuecomment-5230679564); When–Then requires byte-for-byte comparison of the
embedded sketch and decisions index links against home; mismatched-sketch and
stale-list falsifiers added.

### CANON-13 (medium) — compatibility NFR broader than GPC11 — INCORPORATED

Source: luna R1-08. Fix: GPC11 extended to check package.json and
package-lock.json byte-identity to merge-base and the file-surface (no new
scripts); NFR response measure narrowed to match.

### CANON-14 (medium) — modularity NFR bound to the wrong property — INCORPORATED

Source: luna R1-09. Fix: response measure replaced with the static
one-home/no-duplicate invariant the rule prose asserts; bound to the
home-uniqueness scenario.

### CANON-15 (medium) — nonexistent scripts/check-references.sh — INCORPORATED

Source: luna R1-10. Repo-root path does not exist; DoD 6 uses
`node skills/sdlc/scripts/check-references.mjs`. Fix: GPC12 uses the DoD
commands verbatim.

### CANON-16 (medium) — no-parser prohibition ungated — INCORPORATED

Source: luna R1-11. Plan test direction names it explicitly. Fix: new
mechanical scenario — the branch adds no file under lib/, bin/, src/, or
skills/sdlc/scripts/, and the test file uses no imports beyond node built-ins
and node:test.

### CANON-17 (medium) — C7's §4 bullet unauthorized — INCORPORATED

Source: glm R1-08. Plan authorizes §1, §8, §9 only for phase-brainstorm.md;
the §4 skeleton bullet was spec invention. Fix: C7 and GPC9 removed entirely;
the phase-plan §4 rule (incl. enumeration) is covered by C2.

### CANON-18 (low) — GPC11 bound under the wrong contract — INCORPORATED

Source: glm R1-09. Fix: GPC11 removed from C2's Gated-by, added to C8's; FR
bindings made consistent.

### CANON-19 (low) — GPC13 references undefined "T1" — INCORPORATED

Source: glm R1-10. Fix: decision point renamed "the Build phase's first
task-close validation."

## Reviewer CLEARs

- glm: surface A (skeleton conformance), surface D (dogfood claims accurate
  against the real plan), PROPORTIONALITY.
- luna: PROPORTIONALITY.

## Ledger

Round 1: 19 canonical findings (7 high, 10 medium, 2 low), 19 incorporated,
0 rejected. Spec rev 2 applies all fixes as a full restructure: contracts
renumbered (C7 dropped, C9/C10 added), scenarios GPC9 dropped and
GPC16–GPC18 added, all §6a/§6b references moved to §4.
