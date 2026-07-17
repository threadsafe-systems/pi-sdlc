## [2.0.0](https://github.com/threadsafe-systems/pi-sdlc/compare/v1.0.0...v2.0.0) (2026-07-17)

### ⚠ BREAKING CHANGES

* **release:** shorthand (verified: 39748ab's feat(config)!: commit produced
"no release"). conventionalcommits recognises both the ! shorthand and the
* **release:** footer, so either form now correctly triggers a major
release. No commit-type vocabulary change; existing conventional commits
continue to classify the same way (verified via analyzeCommits fixture).

* fix(release): pin conventionalcommits preset to 9.3.1

v10.2.1 (npm latest) ships a function-based template writer that
@semantic-release/release-notes-generator's Handlebars-based
conventional-changelog-writer 8.4.0 cannot render: generateNotes()
silently produced only the version heading, dropping every Features/Bug
Fixes/BREAKING CHANGES section (reproduced and confirmed). 9.3.1 is the
version release-notes-generator's own devDependencies test against;
commit-analyzer (tested against 8.0.0) still classifies major releases
correctly against 9.3.1 (reproduced). Caret range stays within 9.x so an
untested major bump can't silently regress this again.

* chore: retrigger CI against the corrected PR body

### Bug Fixes

* **release:** switch semantic-release to conventionalcommits preset, pinned 9.3.1 ([#72](https://github.com/threadsafe-systems/pi-sdlc/issues/72)) ([04d6361](https://github.com/threadsafe-systems/pi-sdlc/commit/04d6361a90215fb08a9a43281dddcc7bdc28387e))

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
