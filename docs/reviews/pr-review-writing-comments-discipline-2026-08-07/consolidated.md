# PR review — writing-comments discipline

Track: reversible

## Round 1

Commit: `e4a567669f4d8c9c59dd354ab42ecf3dd6c46a95`

Reviewers:

- `zai/glm-5.2:xhigh`
- `deepseek/deepseek-v4-pro:xhigh`
- `moonshotai/kimi-k3:xhigh`
- `google/gemini-3.1-pro-preview:xhigh`

| ID | Severity | Origin | Finding | Disposition |
|---|---|---|---|---|
| WC-R1-01 | medium | NEW | The bounded baseline cleanup left `lt-t*`, `PR-fix`, revision, and feature-history prose across tracked source/test files, including files already edited by the cleanup. | **incorporated** — removed the surviving task labels and process narration across the bounded source/test baseline; rewrote comments and test names as present behavior. |
| WC-R1-02 | low | NEW | The package-independence test guarded only Workflow and Implement, not Tasks and the reviewer prompt. | **incorporated** — the negative dependency assertion now covers all four projecting surfaces. |
| WC-R1-03 | low | NEW | The temporary IDV19 assertion did not state that the changed review prompt is outside the feature branch's frozen set or mechanically track the mandatory restoration. | **incorporated** — added the negative feature-branch assertion and filed tracked post-merge follow-up #222; build amendment A1 now cites it. |
| WC-R1-04 | low | NEW | A dogfood assertion message used forward-looking “not yet” prose. | **incorporated** — it now describes the source-record condition that makes phase spans empty. |
| WC-R1-05 | low | NEW | IDV33's mutation self-test depended on `String.replace` finding a particular first textual occurrence. | **incorporated** — mutations now address the located ownership-comment line structurally. |
| WC-R1-06 | low | NEW | The code-prose checkpoint blurred who dispatches/runs the validator in `subagent` versus `self` mode. | **incorporated** — the canonical law now assigns parent dispatch and implementer self-run explicitly, with contract coverage. |

No finding was dismissed. Round 2 receives only this fix-wave delta.

## Round 2

Delta: `e4a5676..5a877da`

Usable reviewers: `deepseek/deepseek-v4-pro:xhigh`, `moonshotai/kimi-k3:xhigh`, `google/gemini-3.1-pro-preview:xhigh`. The GLM reviewer was interrupted after 12 minutes without a verdict; the three-model configured floor remained met.

| ID | Severity | Origin | Finding | Disposition |
|---|---|---|---|---|
| WC-R2-01 | high | NEW | The cleanup changed `resolve-panel.mjs` and `validate-task.mjs` while both remained in ASD19's frozen set, making committed HEAD fail the freeze gate. | **incorporated** — build amendment A3 bounds their temporary reopening, keeps the wrappers frozen, and extends tracked re-freeze issue #222 to restore both implementations after merge. |
| WC-R2-02 | low | NEW | The renamed optional-telemetry coexistence test could only repeat an existing assertion or pass vacuously, so its name overclaimed what its body proved. | **incorporated** — deleted the redundant conditional test; the preceding ASD20 test retains the real config-doc call-site contract. |

No finding was dismissed. Round 3 receives only this fix-wave delta.

## Round 3

Delta: `5a877da..491b35e`

Reviewers: `deepseek/deepseek-v4-pro:xhigh`, `moonshotai/kimi-k3:xhigh`, `google/gemini-3.1-pro-preview:xhigh`.

All three reviewers confirmed WC-R2-01 and WC-R2-02 resolved. No high or medium finding was reported.

| ID | Severity | Origin | Finding | Disposition |
|---|---|---|---|---|
| WC-R3-01 | low | NEW | The frozen-surfaces header narrated the cleanup event and absent files instead of the current guard boundary. | **incorporated** — rewrote it as the present protected/exclusion-set contract. |
| WC-R3-02 | low | NEW | The coherent re-freeze tripwire covered only the reviewer prompt, allowing either script implementation to be restored independently without forcing a coordinated guard update. | **incorporated** — added one exact three-surface exclusion set and a standing coherence assertion; amendment A3 records the mechanism. |
| WC-R3-03 | low | NEW | The setup-config-doc file header still claimed telemetry-preservation coverage after deletion of the vacuous coexistence test. | **incorporated** — the header now names only the active setup/config-doc contracts. |

No finding was dismissed. Round 4 receives only this fix-wave delta.
