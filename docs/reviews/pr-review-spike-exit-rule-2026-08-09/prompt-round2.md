# PR review prompt — wave 2 delta verification

Verify commit range
`763706b6871e3508f5066e52b208d6ae3a4da1d5..aaac61c` using
`/tmp/spike-exit-rule-pr-round2.diff`. Read the committed changed files, not only
the author summary.

Prior findings and dispositions:

| id | severity | disposition |
|---|---|---|
| PR-R1-01 | high | incorporated: committed SER14 landing record and Build-ledger update |
| PR-R1-02 | medium | incorporated: ordinary and post-spike proceed both transition to Plan |
| PR-R1-03 | medium | incorporated: every spike keeps a self-contained decision line; discard needs no link |
| PR-R1-04 | low | incorporated: route anchors counted exactly once |
| PR-R1-05 | low | incorporated: Vocabulary aligned to the route-2 trigger |

Use the stamped prompt's verification mode. Confirm each fix against the actual
commit, then report NEW defects introduced by the delta. Do not re-litigate a
finding without new evidence. Re-check SER13's guidance constraints and SER14's
carry landing. Return only the verification-mode format.
