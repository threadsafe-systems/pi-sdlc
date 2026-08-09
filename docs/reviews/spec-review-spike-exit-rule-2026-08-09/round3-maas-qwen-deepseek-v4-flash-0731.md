All four wave-2 dispositions verified against the spec at `59e3712`. Confirming each, then the delta findings.

**CONFIRMED: SPEC-R2-01** — SER2's When–Then now reads "the read route names #147 as future mechanisation outside S4" and its Falsify adds "or removal/implementation of the #147 future-work anchor" (`docs/specs/2026-08-09-spike-exit-rule.md:200-202`); C1 postcondition (line 45) and F1 (line 155) agree. Mechanically asserted.

**CONFIRMED: SPEC-R2-02** — C1 (line 33-35) and C5 (line 97-100) both define the block to the next `^#{2,3}[ ]` heading with deeper subheadings retained; verified against `phase-brainstorm.md` the next `##`/`###` after §8 is `## 9.` (line 165), so the boundary is now well-defined and a truncated block reliably fails SER2/SER3/SER4 (self-policing, not silent).

**CONFIRMED: SPEC-R2-03** — SER13 (lines 315-326) now carries "at most 5 minutes of adjudication after panel outputs are available" and Falsify adds "adjudication exceeds 5 minutes after panel outputs are available"; satisfies `.pi/sdlc/workflow.md:5-8` explicit-time-budget rule.

**CONFIRMED: SPEC-R2-04** — header (lines 3-4) is contract-only "Status: rev 3"; the "incorporating every spec-panel round-1 finding" clause is gone; panel history lives solely in `consolidated.md`, per `.pi/sdlc/workflow.md:12-14`.

---

### C1 block-boundary phrase contradicts its own parenthetical and C5's regex

- severity: low
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md:34` (C1 Signature/shape) vs line 99 (C5), and line 97-100
- defect: C1 says the block ends "at the next heading of level 3 or shallower (`###` or `##`)". "Level 3 or shallower" literally includes level-1 (`#`) headings, but the parenthetical (`###`, `##`) and C5's terminal regex `^#{2,3}[ ]` both exclude level 1, so the operative description and the two binding definitions disagree on the boundary set.
- evidence: quoted C1 line 34 "next heading of level 3 or shallower (`###` or `##`)" vs C5 line 99 "through the next heading matching `^#{2,3}[ ]`". `#` (level 1) appears in the phrase but in neither the parenthetical nor the regex; `## 9.` at `phase-brainstorm.md:165` is the concrete next boundary.
- impact: minor now (no level-1 heading realistically terminates §8), but this is the exact term-precision defect the spec's Binding rule and attack surface D exist to forbid; a future editor inserting a `#` heading trusts the phrase and diverges from the regex, and the two contracts stop agreeing.
- fix: Rewrite line 34 to "to the next heading of level 2 or 3 (`##` or `###`), or the end of §8" so the phrase, the parenthetical, and C5's regex name the identical boundary set.

CLEAR: A — the exact-set, two-artifact, three-line-kind, one-mermaid, literal-Plan-anchor shapes remain unchanged by the delta and match Plan rev 4; no missing/over-committing field introduced.
CLEAR: B — SER2/SER13's amended When–Then/Falsify pairs retain one kind label each and the three-part form; SER2 and SER13 both falsify #147 omission/implementation, mutually consistent and non-vacuous.
CLEAR: C — C1/C5 Contracts cells remain populated; the only under-specification found is the C1 boundary phrase reported above.
CLEAR: D — no new internal contradiction beyond the C1 phrase; #147 wording is uniform across C1/F1/SER2/SER13.
CLEAR: E — the `^#{2,3}[ ]` boundary verified against the live §8/§9 headings; extraction composes with the existing `sectionOf`/GPC assertions without breaking them.
CLEAR: F — all five NFRs keep a response measure and scenario binding; no NFR touched by the delta.
CLEAR: G — SER13's 5-minute budget and SER2's #147 anchor are backed by the stated mechanisms; no overclaim.
CLEAR: H — no inbound `CARRY-TO-SPEC` minted; SER14 remains carried to `pr_review`; carry landing complete.
