# Spec panel — openai-codex/gpt-5.6-luna:xhigh

Target: docs/specs/2026-07-22-review-gate-config-model.md @ 66e38ee

1. HIGH — `approve:agent` contradicts phase-plan/phase-spec human-approval prose
   (phase-plan.md:65-66, phase-spec.md:73-75; S11 only tests phase-pr-review).
2. HIGH — schema-break guard still accepts `!` shorthand; N2 forbids it but
   check-schema-break.mjs:40 accepts `feat!:` and :80 recommends it,
   schema-break.test.js:57-58 expects it; check-schema-break.mjs omitted from §2.
3. MEDIUM — reserved `preview` has no closed-world rejection scenario (S13 only
   tests acceptance; no unknown-sibling / non-boolean rejection at base+override).
4. MEDIUM — S5 cannot verify identical deep-merge in resolve-panel: separate
   private merges; shallow resolver merge drops `validate` but guard resolves
   because `undefined !== "skip"`, so S5 passes falsely. Want a shared helper.
5. MEDIUM — agent telemetry semantics unspecified: gate.approved agent approver
   value + emission rule undefined; telemetry.mjs:58 accepts any nonEmptyString;
   system-reference.md:308-309 documents only human approvals.
6. MEDIUM — S9/S10 stale-vocab bans impossible as written: `human`/`panel` are
   retained values; SKILL.md:43 "advisory mode"; resolve-panel.mjs:154 log prefix.
7. MEDIUM — §2 omits schema-version consumers (check-lifecycle.mjs:10,220-224;
   sdlc-status.mjs:14,234-244) and v3 fixtures/tests (check-lifecycle.test.js,
   hooks.test.js).
8. MEDIUM — C7d two-prompts-per-object-dial conflicts with locked ≤3-prompt
   ceiling (templates/setup-sdlc.md:53-55).
9. LOW — stale v3 version strings not swept (resolve-panel.mjs:3,55;
   config-doc.mjs:183; setup-sdlc.mjs:34,244,567; setup-sdlc.sh:18).
