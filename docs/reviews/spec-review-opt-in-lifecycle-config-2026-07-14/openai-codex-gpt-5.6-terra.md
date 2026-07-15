### Profile application silently changes the frozen FS10 `upgraded` contract

- severity: high
- confidence: high
- location: §4.3, §6 OLA16
- defect: The spec requires an existing manifest updated by `--profile` without `--force` to report `config: upgraded`, while also declaring no FS10 evolution in OL-A. FS10 v1 reserves `upgraded` for whole-config replacement with `--force`, so this changes a frozen report/action semantic rather than merely reusing its vocabulary.
- evidence: The spec says profile application "reports `upgraded`" (§4.3) and OLA16 requires it. The shipped FS10 contract says "`upgraded` is reserved in v1 for `config`-with-`--force` replacement" (`docs/specs/2026-07-13-sdlc-adoption-bundle.md:424-425`); ADR 0018 says `--force` applies only to configuration replacement and FS10 evolves only through an explicit schema-version bump and migration (`docs/adr/0018-adoption-bundle-fs10.md:11-16`). The current implementation follows that rule: only `configMutating && opts.force` emits `upgraded` (`skills/sdlc/scripts/setup-sdlc.mjs:382-391`).
- impact: A consumer of SetupReportV1 can no longer infer that `upgraded` meant an explicit forced replacement, but OL-A offers neither a version bump nor a migration; this violates the shipped FS10 freeze and cannot be implemented honestly as scoped.
- fix: Specify an explicit FS10 version/migration for this new `upgraded` meaning (and move that work into the appropriate sub-change), or retain the v1 forced-replacement contract and define a compatible, truthful profile-application outcome.

### `minVendors` is not actually a floor under the prescribed relaxed dedupe

- severity: high
- confidence: high
- location: §4.2 “Vendor dedupe relaxation”; §6 OLA9–OLA11
- defect: The stated per-vendor cap does not require the selected panel to contain `minVendors` vendors. For example, at `minPanel: 5, minVendors: 3`, the cap is three models/vendor, so three models from A plus two from B satisfies the prescribed cap and panel size with only two vendors.
- evidence: §4.2 says only to “allow up to `minPanel − minVendors + 1` models from one vendor”; it contains no selected-vendor-count acceptance condition or selection order. The current resolver only tests `panel.length < minPanel` (`skills/sdlc/scripts/resolve-panel.mjs:115-150`) and its existing dedupe makes vendor count equal panel size; OLA10 covers only the 2/2 one-vendor case and therefore cannot falsify the 5/3 counterexample.
- impact: The committed `minVendors` dial can freeze as a best-effort cap rather than the promised vendor floor, weakening panel diversity for larger panels and leaving implementations to invent incompatible selection/failure behavior.
- fix: Require success only when both `panel.length >= effectiveMinPanel` and distinct selected vendors `>= effectiveMinVendors`, specify deterministic vendor-first selection when feasible, and add a scenario covering `minPanel: 5, minVendors: 3` with an A/A/A/B/B/C roster.

### Existing-manifest preservation promises bytes that JSON re-serialisation cannot preserve

- severity: high
- confidence: high
- location: §4.3; §6 OLA16
- defect: The spec promises byte-preservation of every non-`lifecycle` key, including formatting, but mandates parsing and 2-space re-serialisation. A valid pre-existing manifest may be compact, tab-indented, differently ordered, or have different final-newline spelling; parsing then `JSON.stringify(..., null, 2)` necessarily rewrites those bytes outside `lifecycle`.
- evidence: §4.3 says profile application is “byte-preserving every other key (including formatting)” while also saying “the implementation re-serialises the parsed object with 2-space indent.” Existing valid manifests are accepted solely through parsed `inspectConfig` (`skills/sdlc/scripts/setup-sdlc.mjs:379-380`), and current writes use `JSON.stringify(cfg, null, 2)` (`skills/sdlc/scripts/setup-sdlc.mjs:383-390`); neither establishes that a valid existing file originated with that spelling. OLA16 only deep-compares parsed top-level values, so it cannot gate the byte-preservation claim.
- impact: An implementation either violates an explicit non-destructive guarantee for valid consumer-authored manifests or must introduce an unmentioned syntax-preserving JSON editor; the sole test would still pass after an unintended whole-file rewrite.
- fix: Either narrow the guarantee to parsed non-`lifecycle` values and remove the formatting claim, or require a syntax-preserving edit strategy and make OLA16 compare unchanged byte ranges for a deliberately non-canonical valid manifest.

### The new mode-resolution CLI has no deterministic no-track contract

- severity: medium
- confidence: high
- location: §4.2 “Gate-mode awareness”; §6 OLA13
- defect: “the strictest configured value” is undefined for the four reviewer×arbiter modes, and the spec does not define the `--track` value grammar or its behavior on single-mode gates and `task_validate`. The table supplies no total ordering: `panel` and `human` are both blocking but require different resolver actions, while `advisory` has a panel but is non-blocking.
- evidence: §4.2 introduces a new optional `--track` and uses “strictest configured value” without defining either term. The current command has no `--track` parser (`skills/sdlc/scripts/resolve-panel.mjs:20-47`), and `PHASES` includes `task_validate` as well as the three review phases (`skills/sdlc/scripts/lib.mjs:9`). OLA13 exercises explicit `--track reversible|irreversible` only, not no-track mixed modes or invalid/inapplicable tracks.
- impact: Callers that omit `--track` can receive different refusal versus panel behavior from equally plausible implementations, freezing an accidental CLI semantic that OL-C/other consumers must subsequently inherit.
- fix: Define the allowed `--track` values, applicability/error behavior, and a total effective-mode rule for every mixed pair, then add no-track mixed-mode and invalid/inapplicable-track scenarios.

### `custom` has no implementable non-interactive flag or payload contract

- severity: medium
- confidence: high
- location: §3; §4.3; §6 OLA17
- defect: `--lifecycle-*` is a placeholder family rather than a CLI interface: no flag names, value syntax, mutual-exclusion/override rules, completeness rule, or refusal exit is specified. `--lifecycle-json` is likewise undefined as a literal versus file input and conflicts with “writes exactly that block … with `profile: custom`” when the supplied valid block has another or no profile.
- evidence: §3 says only “explicit `--lifecycle-*` flags or a `--lifecycle-json` payload”; §4.3 names only `--profile`; and OLA17 asserts a “full” payload without defining fullness or the profile conflict. The existing setup CLI has a pinned explicit usage/argument parser (`skills/sdlc/scripts/setup-sdlc.mjs:31`, `89-176`), and its existing invalid-argument path is exit 2 (`skills/sdlc/scripts/setup-sdlc.mjs:33-43`, `477-485`), so a Tasks author cannot derive the new public contract from current behavior.
- impact: Independent implementations can ship incompatible custom-profile invocations and different error semantics; the frozen setup CLI would be selected by guesswork, and OLA17 cannot determine whether any such implementation passes.
- fix: Enumerate each custom flag and its type (or specify one canonical JSON input form), define payload/profile normalization and mixing rules, and pin success/refusal exits and diagnostics in OLA17.

### NF-1 cannot hold for the required fresh-adoption path and has no complete gate

- severity: medium
- confidence: high
- location: §2, §4.3, §5 NF-1, §6 OLA1/OLA9/OLA14
- defect: NF-1 says `setup-sdlc` has byte-identical v1 stdout/stderr/exit behavior “with no `lifecycle` block,” but fresh adoption is required to write a fully-expanded block. Thus a v1 fresh setup invocation starts without a block yet must produce different config/report output in OL-A; the listed scenarios do not define a narrower input domain or compare all four resolver phases and setup outputs to v1.
- evidence: §2 says absence gives byte-identical behavior; §4.3 says fresh adoption writes `lifecycle`; NF-1 includes `setup-sdlc`; and OLA14 requires a fresh `--profile standard --yes` run to write the new block. Current fresh setup writes exactly its assembled config (`skills/sdlc/scripts/setup-sdlc.mjs:383-386`), so adding the mandatory block changes bytes. OLA1 gates only `inspectConfig`; OLA9 covers only `pr_review`; neither gates the claimed all-phase/setup byte equivalence.
- impact: The non-regression requirement is internally contradictory on a required path, and a Tasks author cannot construct a falsifiable suite that proves the stated outcome rather than choosing an unstated interpretation of “with no block.”
- fix: Scope byte-identity explicitly to existing manifests and resolver invocations that lack `lifecycle` and do not request a profile, enumerate the v1 fixtures/commands for all four phases and setup, and state that fresh/profile setup is the intentional changed path.
