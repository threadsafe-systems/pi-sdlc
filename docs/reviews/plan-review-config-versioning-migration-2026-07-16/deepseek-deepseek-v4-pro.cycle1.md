# plan_review — deepseek/deepseek-v4-pro:high — cycle 1 (plan rev 1)

### FS5 exit-code contract broken without acknowledgment

- severity: high
- confidence: high
- location: Plan "What this delivers (scope in)" §5, and ADR ledger
- defect: The plan changes resolve-panel to exit 0 under preference mode below floor — ADR 0005 freezes exit codes "0 ok / 1 under-panel / 2 bad input." FS5 is not listed among reopened surfaces; no ADR ledger entry for 0005.
- evidence: ADR 0005; plan §5; resolve-panel.mjs exits 1 at 210 and 277 on under-panel.
- impact: Frozen FS5 contract reopened without a sanctioned ADR path; downstreams branch on exit 1.
- fix: Add FS5 to reopened surfaces + ADR 0005 amendment, or keep exit 1 under preference while proceeding.

### OL-A lifecycle vocabulary reconciliation entirely deferred

- severity: high
- confidence: high
- location: Plan "Risks" §1, "Compatibility constraints"
- defect: strict|preference is claimed to govern "how all floors bind, including lifecycle ones," but OL-A's lifecycle.gates.*.mode (panel|advisory|human|off) is a different, already-shipped axis controlling gate blocking. No composition principle is stated; deferral to Spec leaves a design collision.
- evidence: OL-A rev 3; plan Risks §1; shipped lib.mjs validateLifecycleGateMode.
- impact: Spec could silently break OL-A adopters' gate behaviour (e.g. mode: panel becoming non-blocking under preference).
- fix: State the composition principle: the toggle is subordinate to per-gate mode; it applies only where a panel forms and governs whether diversity-floor shortfall is fatal or advisory; advisory/human/off unaffected.

### DoD item 1 overclaims consumer list; ensure-panel-agent omitted

- severity: medium
- confidence: high
- location: Plan "Definition of done" §1
- defect: check-references and validate-task read neither old file; ensure-panel-agent.mjs (readConfig at :55) is omitted.
- evidence: grep across both scripts — zero matches; ensure-panel-agent.mjs:17,55.
- impact: Spec wastes effort on no-op compatibility and misses the real consumer.
- fix: Remove the two non-consumers; add ensure-panel-agent.

### check-lifecycle.mjs config.valid split not addressed

- severity: medium
- confidence: high
- location: Plan "What this delivers" §4 (FS8 v2), DoD §1
- defect: check-lifecycle has its own config.valid via inspectConfig(), which hard-rejects schemaVersion !== 1; after 1→2 any v2 config fails it with exit 2. The plan only specifies the sdlc-status split.
- evidence: check-lifecycle.mjs:216-226; lib.mjs:183.
- impact: A migrated repo's CI lifecycle check fails — including this repo's own dogfood.
- fix: Specify that check-lifecycle's config.valid accepts schemaVersion 2 (it does not own drift detection).

### minVendor reintroduction conflicts with OL-A vendor removal

- severity: medium
- confidence: medium
- location: Plan "What this delivers" §1/§3, Risks §1
- defect: No rule for how minVendor and lifecycle minPanel coexist when both are present (e.g. after OL-B applies a profile to a formerly vendor-axis repo).
- evidence: OL-A rev 3 (vendor dropped); plan fold mapping (vendor axis for no-block adopters).
- impact: Spec author cannot know whether minVendor is ignored under a lifecycle block or independently enforced.
- fix: State: lifecycle present ⇒ minPanel is the sole floor; minVendor meaningful only without a lifecycle block.

### Normative references inventory not listed for update

- severity: low
- confidence: high
- location: Plan "What this delivers" (all), Scope out
- defect: skills/sdlc/assets/normative-references.json carries entries targeting .pi/sdlc/sdlc.models.json and the models schema; the plan never mentions updating the inventory after the models file is deleted.
- evidence: normative-references.json:107, 245-251.
- impact: Stale inventory violates the normative-reference honesty contract (ADR 0019 / FS11).
- fix: Add the inventory update to scope / DoD "no stale bindings."

CLEAR: A (except finding 3), B, C (noting findings 2/5), D (except FS5), E, F.
