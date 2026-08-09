### Transition anchor was relocated from gate-presentation block into spike block, contradicting the spec invariance claim

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-brainstorm.md
- line: 210–211 (committed); formerly 161 (pre-S4, now removed)
- problem: Spec C1 invariants claim the literal `The next transition is **Plan**` anchor "remain[s] unchanged." The anchor text is verbatim, but it was physically moved from the gate-presentation block (unconditional, after the amendment-loop sentence) into the `### Spike exit loop` block (conditional, under the "proceed" direction). The gate-presentation block no longer states the transition at all; a reader of only that block sees no explicit next step. The GPC17 assertion matches `sec8f` (the full §8) rather than the gate block specifically, so the relocation is invisible to the existing test.
- repro_or_impact: `git show 2875190^:skills/sdlc/references/phase-brainstorm.md | sed -n '158,164p'` shows the transition line immediately after the amendment-loop paragraph in the pre-S4 gate-presentation block. After S4, `grep -c 'next transition is'` in the gate-block-only portion (before `### Spike exit loop`) returns 0 — the transition was removed from that block. The existing GPC17 test still passes because it searches the full §8 text, not the gate block alone. An agent reading only the gate-presentation block for transition guidance would find none; the transition is now contextualized under spike proceed semantics.

---

No other defects found. No carries are undischarged: SER14's status is "issue #245 created; PR landing pending," the evidence fields (URL, timestamps, zero model calls) are committed in the build plan, and the carry ledger correctly names `pr_review` as the landing destination. SER13 inspection criteria (no parser needed, no hidden threshold, no fifth route, #147 named but not implemented, no prohibited machinery) are all satisfied by the committed prose.