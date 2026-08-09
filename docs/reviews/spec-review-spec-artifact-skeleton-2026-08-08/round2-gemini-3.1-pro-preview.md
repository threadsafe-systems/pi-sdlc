# Round 2 raw output — gemini (google/gemini-3.1-pro-preview:xhigh)

Delta review of spec rev 2 (`1aaf4b1`). Unedited reviewer output.

- SPEC-R1-01: confirmed
- SPEC-R1-02: confirmed
- SPEC-R1-03: confirmed
- SPEC-R1-04: confirmed
- SPEC-R1-05: confirmed
- SPEC-R1-06: confirmed
- SPEC-R1-07: confirmed
- SPEC-R1-08: REOPENED (see finding below)
- SPEC-R1-09: confirmed
- SPEC-R1-10: confirmed
- SPEC-R1-11: confirmed
- SPEC-R1-12: confirmed
- SPEC-R1-13: confirmed

### M5 field count contradiction
- severity: high
- confidence: high
- origin: REOPENED(SPEC-R1-08)
- location: C4, C7 (M5), SAS5
- defect: The rev-2 fix requires M5 to assert "all ten row fields exactly", but the JSON object explicitly defined in C4 contains exactly 9 fields.
- evidence: C4 defines `{ "id": "...", "source": "...", "assertion": "...", "targetKind": "file", "ownership": "package", "required": true, "resolution": "package", "target": "...", "class": "package-public" }` (9 fields); C7 M5 and SAS5 require "all ten fields".
- impact: Unbuildable contradiction; an implementer cannot satisfy M5's 10-field assertion without breaking C4's strict shape.
- fix: Change "ten fields" to "nine fields" in C7 M5 and SAS5.

### C7 gates list contradiction
- severity: medium
- confidence: high
- origin: NEW
- location: C7 (Gated by)
- defect: C7 incorrectly includes SAS8 in the sequential list of marker-set scenarios. SAS8 uses the standing ASD19 diff guard, not a C7 contract test (M8 maps to SAS11).
- evidence: C7 specifies `- Gated by: SAS1–SAS8 (each scenario's mechanical half is one marker set), SAS10, SAS11.`
- impact: Internal contradiction; implies a non-existent marker set for SAS8.
- fix: Change `SAS1–SAS8` to `SAS1–SAS7` in C7's `Gated by:` list.

### Kind label definition contradiction
- severity: medium
- confidence: high
- origin: NEW
- location: C1 (Scenario kind labels)
- defect: C1 mandates exactly three literal label strings (`mechanical` / `inspection` / `carried`), which makes it impossible for the label itself to name the decision point or destination without creating infinitely many labels. The author's own dogfooding correctly places the destination in the scenario body, not the label string.
- evidence: C1 specifies `exactly three labels... inspection (a human or panel decides it at a named decision point — the label names that point), carried (deferred to a later phase — the label names the destination)`. SAS9 and SAS14 dogfood the labels as exactly `(inspection)` and `(carried)`.
- impact: Freezes an internal contradiction into the authoring guidance skeleton that future spec authors cannot logically follow.
- fix: Change "the label names that point" to "the scenario names that point" (and similarly for destination) in C1.

CLEAR: A — no frozen shapes violated against plan decisions.
CLEAR: B — verification scenarios correctly gate outcomes with falsifiable checks.
CLEAR: E — framework reality is respected.
CLEAR: F — all non-functional requirements are tied to binding scenarios.
CLEAR: G — no dishonest or over-claiming language found in the spec text.
CLEAR: H — inbound carries are none, outbound re-freeze obligation lands correctly.
