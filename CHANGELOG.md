## [2.2.1](https://github.com/threadsafe-systems/pi-sdlc/compare/v2.2.0...v2.2.1) (2026-07-18)

### Bug Fixes

* **sdlc:** stamp panel reviewer agents with no extensions by default ([#112](https://github.com/threadsafe-systems/pi-sdlc/issues/112)) ([77609aa](https://github.com/threadsafe-systems/pi-sdlc/commit/77609aabb24afbc044712edf7692f47ebe7e484c))

## [2.2.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v2.1.0...v2.2.0) (2026-07-18)

### Features

* **sdlc:** completion gate, worker dispatch guardrails, stall self-resume (batch 1) ([#103](https://github.com/threadsafe-systems/pi-sdlc/issues/103)) ([38ecf92](https://github.com/threadsafe-systems/pi-sdlc/commit/38ecf92cb3b15062067d7c9f0ba78212de8e75cf)), closes [#76](https://github.com/threadsafe-systems/pi-sdlc/issues/76) [#77](https://github.com/threadsafe-systems/pi-sdlc/issues/77) [#78](https://github.com/threadsafe-systems/pi-sdlc/issues/78) [#79](https://github.com/threadsafe-systems/pi-sdlc/issues/79) [#77](https://github.com/threadsafe-systems/pi-sdlc/issues/77) [#78](https://github.com/threadsafe-systems/pi-sdlc/issues/78) [#79](https://github.com/threadsafe-systems/pi-sdlc/issues/79)

## [2.1.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v2.0.0...v2.1.0) (2026-07-18)

### Features

* add lifecycle telemetry and retro dashboard ([#104](https://github.com/threadsafe-systems/pi-sdlc/issues/104)) ([cdfd1d1](https://github.com/threadsafe-systems/pi-sdlc/commit/cdfd1d1bc11d6e10118d13a97065bdb805e00b7e)), closes [#65](https://github.com/threadsafe-systems/pi-sdlc/issues/65) [#66](https://github.com/threadsafe-systems/pi-sdlc/issues/66) [#67](https://github.com/threadsafe-systems/pi-sdlc/issues/67) [#68](https://github.com/threadsafe-systems/pi-sdlc/issues/68) [#exec-strip](https://github.com/threadsafe-systems/pi-sdlc/issues/exec-strip) [#phase-swimlane](https://github.com/threadsafe-systems/pi-sdlc/issues/phase-swimlane) [#cost-breakdown](https://github.com/threadsafe-systems/pi-sdlc/issues/cost-breakdown) [#panel-deepdive](https://github.com/threadsafe-systems/pi-sdlc/issues/panel-deepdive) [#steering-map](https://github.com/threadsafe-systems/pi-sdlc/issues/steering-map) [#rework-panel](https://github.com/threadsafe-systems/pi-sdlc/issues/rework-panel) [#coverage](https://github.com/threadsafe-systems/pi-sdlc/issues/coverage) [#exec-strip](https://github.com/threadsafe-systems/pi-sdlc/issues/exec-strip) [#69](https://github.com/threadsafe-systems/pi-sdlc/issues/69) [#70](https://github.com/threadsafe-systems/pi-sdlc/issues/70) [#71](https://github.com/threadsafe-systems/pi-sdlc/issues/71)

## [2.0.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v1.0.2...v2.0.0) (2026-07-18)

### ⚠ BREAKING CHANGES

* **config:** sdlc.config.json schemaVersion 3 replaces the schemaVersion 2
lifecycle/enforcement vocabulary with review/shape/overrides. There is no
migration; re-run setup-sdlc or pin the prior release.

* docs(spec): name IC-A spec to match the config-intent-vocabulary slug

check-lifecycle matches <date>-<slug>.md; drop the -ic-a suffix so the
irreversible-track spec artifact resolves.

* fix(config): address PR panel round 1 (1 high, 6 medium, 6 low)

Preset-patch per-track override guard (delete-or-alter); resolve-panel
refuses task_validate unless subagent; older-schema+--force replaces;
single-dial patch preserves unrelated dials; SKILL/README/ADR 0022/wrapper
scripts re-pointed to v3 vocabulary; delete dead readConfigRawForMigration;
--default-track parse validation; ICA20/21/24 tests added.

Refs #86.

* docs(reviews): archive PR panel round-1 per-model findings

* fix(docs): address PR panel round 2 (SKILL dial enums, validator/tracker prose, patch disclosure)

Complete the P1/P3 re-pointing the round-1 pass missed: correct per-dial
enum list, branch the validator section on review.tasks, express every
tracker-publish spot via shape.publishToTracker, fix author placeholders to
provider/model, and disclose before->after (incl. forced override drops) in
the setup patch report. Round 2: deepseek clean, gpt-5.6-sol 5 findings.

Refs #86.

* fix(docs): address PR panel round 3 (tracker default wording, validator dial scoping)

Round 3: glm-5.2 CONVERGED; gpt-5.6-sol 2 residual prose findings incorporated
(drop the false 'default two'; scope PV1/runner/receipt/PASS to subagent/self,
off imposes none). No code/behaviour change. Consolidated review finalised.

Refs #86.

* docs(spec): align §4.3/ICA14 prose with the M1 task_validate refusal

PR panel round 1 (M1) made resolve-panel refuse task_validate for every
review.tasks mode except subagent; the spec prose still named only 'off'.
Drift surfaced by the e2e-harness plan review (E4). Docs-only.

### Features

* **config:** intent vocabulary schemaVersion 3 (IC-A) ([#92](https://github.com/threadsafe-systems/pi-sdlc/issues/92)) ([a6b9d80](https://github.com/threadsafe-systems/pi-sdlc/commit/a6b9d8006a674c5b1a096c2c0c690d38705ad5e5)), closes [#87](https://github.com/threadsafe-systems/pi-sdlc/issues/87) [#88](https://github.com/threadsafe-systems/pi-sdlc/issues/88) [#89](https://github.com/threadsafe-systems/pi-sdlc/issues/89) [#90](https://github.com/threadsafe-systems/pi-sdlc/issues/90)

## [1.0.2](https://github.com/threadsafe-systems/pi-sdlc/compare/v1.0.1...v1.0.2) (2026-07-17)

### Bug Fixes

* **templates:** ground /setup-sdlc's skill-relative paths before use ([a01a410](https://github.com/threadsafe-systems/pi-sdlc/commit/a01a410a419902e8ecede78966d505ea4814f734))

## [1.0.1](https://github.com/threadsafe-systems/pi-sdlc/compare/v1.0.0...v1.0.1) (2026-07-17)

> **Provenance note:** this fix was briefly auto-tagged `v2.0.0` by
> semantic-release. PR #72 (a release-tooling config swap, `track: none`,
> verified by a three-model PR panel with zero product or consumer-facing
> impact) was mis-classified as a breaking release because one of its
> squashed source commits' prose — describing what the new preset now
> recognises — contained a line that happened to start with the note
> parser's exact breaking-change keyword, not an actual breaking-change
> footer. That was caught before anything else consumed the tag or
> release: `v2.0.0`'s GitHub Release was briefly published, then deleted
> along with its tag, and this correct patch release, `v1.0.1`, was cut by
> hand in their place.

### Bug Fixes

* **release:** switch semantic-release to the `conventionalcommits` preset,
  pinned to `9.3.1`, so the analyzer correctly parses the `!` shorthand for
  a breaking change (the previous `angular` preset recognised only the
  trailing `BREAKING CHANGE:` footer form, not `!`), and so release notes render correctly (npm's
  latest `10.2.1` silently produced empty notes against the installed
  writer) ([#72](https://github.com/threadsafe-systems/pi-sdlc/issues/72)) ([04d6361](https://github.com/threadsafe-systems/pi-sdlc/commit/04d6361a90215fb08a9a43281dddcc7bdc28387e))

# [1.0.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.8.0...v1.0.0) (2026-07-17)


### Features

* **config:** release the config versioning and migration contract ([80d9c53](https://github.com/threadsafe-systems/pi-sdlc/commit/80d9c53f4dbac3cdfd9fcb5551ac701766799def))


### BREAKING CHANGES

* **config:** sdlc.config.json is now schemaVersion 2. The standalone
sdlc.models.json (FS2) is retired; the panel roster lives in the config's
panels block (min_panel -> minVendor, author_default -> authorDefault,
exclude_author_vendor -> excludeAuthorVendor). Existing consumers migrate
via scripts/migrate.mjs; setup provisions v2 for fresh adoptions.

# [0.8.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.7.0...v0.8.0) (2026-07-15)


### Features

* **lifecycle:** add opt-in configurable SDLC profiles ([d54895e](https://github.com/threadsafe-systems/pi-sdlc/commit/d54895eb58ad3a653145e7aaa328dd963cf12d41))

# [0.7.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.6.0...v0.7.0) (2026-07-14)


### Features

* **paths:** enforce skill-relative invocation ([8686d99](https://github.com/threadsafe-systems/pi-sdlc/commit/8686d999b08e801c47add537443f5958c8339155))

# [0.6.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.5.0...v0.6.0) (2026-07-14)


### Features

* **reference:** enforce normative-reference honesty ([a1a994d](https://github.com/threadsafe-systems/pi-sdlc/commit/a1a994dea864be0df59bf872ff4e0208a663d678))

# [0.5.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.4.0...v0.5.0) (2026-07-13)


### Features

* **adoption:** provision bundle and lifecycle checker ([#24](https://github.com/threadsafe-systems/pi-sdlc/issues/24)) ([730e5ef](https://github.com/threadsafe-systems/pi-sdlc/commit/730e5efa01bfabe812ede33ac9ed6ea4f56aa2e3)), closes [#18](https://github.com/threadsafe-systems/pi-sdlc/issues/18) [19-#23](https://github.com/19-/issues/23) [#19](https://github.com/threadsafe-systems/pi-sdlc/issues/19) [#19](https://github.com/threadsafe-systems/pi-sdlc/issues/19) [#20](https://github.com/threadsafe-systems/pi-sdlc/issues/20) [#20](https://github.com/threadsafe-systems/pi-sdlc/issues/20) [#21](https://github.com/threadsafe-systems/pi-sdlc/issues/21) [#21](https://github.com/threadsafe-systems/pi-sdlc/issues/21) [#22](https://github.com/threadsafe-systems/pi-sdlc/issues/22) [#22](https://github.com/threadsafe-systems/pi-sdlc/issues/22) [#21](https://github.com/threadsafe-systems/pi-sdlc/issues/21) [#22](https://github.com/threadsafe-systems/pi-sdlc/issues/22) [#21](https://github.com/threadsafe-systems/pi-sdlc/issues/21) [#23](https://github.com/threadsafe-systems/pi-sdlc/issues/23)

# [0.4.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.3.0...v0.4.0) (2026-07-13)


### Features

* **readiness:** FS8 four-state adoption readiness for sdlc-status ([#17](https://github.com/threadsafe-systems/pi-sdlc/issues/17)) ([77fb274](https://github.com/threadsafe-systems/pi-sdlc/commit/77fb274e72d8db835b75dea6a0a2dedb42cdff76)), closes [#7](https://github.com/threadsafe-systems/pi-sdlc/issues/7) [#8](https://github.com/threadsafe-systems/pi-sdlc/issues/8) [#9](https://github.com/threadsafe-systems/pi-sdlc/issues/9) [#10](https://github.com/threadsafe-systems/pi-sdlc/issues/10)

# [0.3.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.2.0...v0.3.0) (2026-07-13)


### Features

* **validator:** portable manifest-driven per-task validator (PV1/PV2) ([#16](https://github.com/threadsafe-systems/pi-sdlc/issues/16)) ([a781300](https://github.com/threadsafe-systems/pi-sdlc/commit/a78130032618aad404e3d935a57957ef6ae2b4a8)), closes [#12](https://github.com/threadsafe-systems/pi-sdlc/issues/12) [#13](https://github.com/threadsafe-systems/pi-sdlc/issues/13) [#14](https://github.com/threadsafe-systems/pi-sdlc/issues/14) [#15](https://github.com/threadsafe-systems/pi-sdlc/issues/15) [#13](https://github.com/threadsafe-systems/pi-sdlc/issues/13) [#14](https://github.com/threadsafe-systems/pi-sdlc/issues/14) [#15](https://github.com/threadsafe-systems/pi-sdlc/issues/15)

# [0.2.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v0.1.1...v0.2.0) (2026-07-11)


### Features

* **release:** semantic-release pipeline (GitHub Releases, no npm publish) ([85930d5](https://github.com/threadsafe-systems/pi-sdlc/commit/85930d5cccbdf0c28c64bbb9576afbbb252f696e))
