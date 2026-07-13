# Specification: skill-relative invocation and path plumbing

- Date: 2026-07-14
- Plan: `docs/plans/2026-07-14-sdlc-skill-relative-path-plumbing.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Dependency: sub-change 2 FS9/FS10 and sub-change 3 A4/non-path A7 are the upstream contracts; implementation is stacked on their merged PR branch and does not change their runtime semantics.
- Track: irreversible
- Author vendor: openai
- Human gate: specification approval is exercised autonomously; final PR remains the user’s sign-off point.

## 1. Frozen path contract

### 1.1 Skill-relative invocation

The shipped generic corpus is:

- `skills/sdlc/SKILL.md`;
- `README.md`;
- `templates/setup-sdlc.md`;
- `skills/sdlc/prompts/*.prompt.md`;
- `skills/sdlc/assets/*`;
- `skills/sdlc/scripts/*.sh` usage/comments;
- `test/fixtures/golden/*.agent.md`.

Within a loaded pi skill, `scripts/<name>.sh` and `assets/<name>` are resolved relative to the directory containing the loaded `SKILL.md`, per Pi’s skill contract. Shipped generic sources must not use `skills/sdlc/scripts/...` as though it were a consumer-cwd path. A direct-Node/headless command uses `node <skill-dir>/scripts/<name>.mjs`, where `<skill-dir>` is explicitly resolved to the loaded skill directory. The known broken form `node <skill-dir>/skills/sdlc/scripts/check-lifecycle.mjs` is forbidden.

Shell wrappers resolve their sibling `.mjs` using `dirname "$0"`; they do not depend on cwd. Direct Node is the supported cross-platform fallback. No global binary is implied.

### 1.2 Consumer-root paths

`paths.plans`, `paths.specs`, `paths.reviews`, and `paths.agents` are repo-relative consumer homes. Defaults remain:

```json
{"plans":"docs/plans","specs":"docs/specs","reviews":"docs/reviews","agents":".pi/agents"}
```

A shared `resolveConsumerPath(root, configured, label)` seam is exported from `skills/sdlc/scripts/lib.mjs` with this pure return contract:

- success: `{ ok: true, resolved: <absolute contained path>, configured: <original relative spelling>, normalized: <slash-normalized relative spelling> }`;
- failure: `{ ok: false, message: <single-line diagnostic> }`; it never exits or throws;
- callers convert `{ ok: false }` to their existing exit-2/configuration-error surface.

The seam must:

- normalize `\\` and `/` separators for validation;
- reject absolute paths, empty values, and any `..` segment with an exit-2 configuration error;
- resolve relative to the consumer root, never the package/skill root;
- verify the resolved path remains contained by the consumer root;
- preserve `configured` for setup/readiness/panel display and use `resolved` for filesystem operations.

`check-lifecycle` uses it for configured plans/specs. `ensure-panel-agent` uses it for configured agents. Setup/readiness and docs use the same consumer-root terminology. No path key is removed.

`paths.agents` controls where the package writes the generated file. The package does not claim that arbitrary custom directories are automatically discovered by every Pi host; docs require a Pi-discovered project-agent directory or explicit file dispatch when overriding it.

## 2. Documentation contract

The following assertions are mutation-tested:

- startup/status, panel, setup, validator, and receipt examples use `scripts/<name>.sh` in skill-relative in-harness examples;
- headless examples use `node <skill-dir>/scripts/<name>.mjs`;
- no shipped generic source contains the old consumer-cwd `skills/sdlc/scripts/` command form;
- no shipped source contains `<skill-dir>/skills/sdlc/`;
- configured artifact homes are described as `<configured paths.plans>`, `<configured paths.specs>`, `<configured paths.reviews>`, and `<configured paths.agents>` rather than hard-coded defaults;
- consumer migration guidance says copied commands in consumer docs/workflows must be audited manually; setup does not rewrite consumer-owned files;
- FS10’s pinned checkout workflow remains unchanged except for the corrected post-checkout direct-Node path.

## 3. CLI/seam behavior

`resolveConsumerPath` is pure and offline. `inspectConfig` invokes the same slash-normalized segment rule at config validation time, so every script rejects backslash escapes before consuming a configured path. `check-lifecycle` resolves only `plans` and `specs`; `ensure-panel-agent` resolves `agents`; `reviews` is an artifact/review destination used by documentation and fixtures, not by lifecycle artifact lookup. A path error is an operational/configuration error (exit 2), not a missing artifact failure.

Existing `sdlc-status` exits/envelopes, FS9 declaration grammar/checker exits, FS10 setup/report behavior, panel names, and generated-agent frontmatter remain unchanged.

## 4. Scenarios

### SP1 — in-harness relative commands

A mutation test scans the shipped generic corpus and fails if a command presents `skills/sdlc/scripts/` as a consumer-cwd path or contains the `<skill-dir>/skills/sdlc/` double prefix. It passes for canonical `scripts/<name>.sh` and headless `<skill-dir>/scripts/<name>.mjs` forms.

### SP2 — installed consumer invocation

Copy/install the skill under a non-root directory such as `<fixture>/installed/pi-sdlc/skills/sdlc`, create a separate consumer git repo with no `skills/` directory, and run status, setup, panel-agent, panel resolution, lifecycle checking, and task validation from the consumer cwd using resolved absolute skill paths. Panel resolution uses the existing isolated fixture `HOME` auth stub and never invokes `--pong`, so it remains offline and credential-free. All commands resolve the installed skill assets and write only to the consumer.

### SP3 — default and override paths

From a consumer cwd, default paths resolve to the existing homes. A config using `project/plans`, `project/specs`, `project/reviews`, and `.pi/generated-agents` resolves checker artifact lookup and agent stamping to those homes; package assets remain under the installed skill directory.

### SP4 — containment and separators

Absolute paths, `../escape`, `..\\escape`, embedded `..` segments, and symlink/realpath escapes are rejected with exit 2 before artifact lookup or writes. Valid nested paths and Windows-style non-escape separators are accepted consistently.

### SP5 — setup/readiness and panel destinations

Setup/readiness guidance reports consumer-root paths, generated panel agents land in the configured agents home, and panel/lifecycle documentation names configured plans/specs/reviews homes. Existing defaults remain byte-compatible.

### SP6 — workflow acquisition

The shipped FS10 workflow at `skills/sdlc/assets/sdlc-lifecycle.yml` has a pinned pi-sdlc checkout followed by a direct-Node invocation from that checkout’s skill path, not a consumer-cwd `skills/sdlc/...` path. The workflow remains optional and does not assume a consumer package install.

### SP7 — compatibility

All existing FS8/FS9/FS10, extraction, validator, and setup tests pass unchanged except for explicitly updated path assertions/goldens.

## 5. Non-functional requirements

- offline, deterministic, no network/model/credential calls;
- no new runtime dependencies;
- direct Node fallback works on Windows; shell wrappers are conveniences;
- consumer and skill roots are never conflated;
- consumer-owned files are not rewritten by setup or path migration.

## 6. Migration

This is a documentation/path contract correction. Consumers should update copied `skills/sdlc/scripts/...` examples to either skill-relative `scripts/...` in pi or resolved direct-Node paths in headless automation, and audit custom `paths` values for repo containment. Existing default consumers require no config change. Existing whole-file prompt overrides remain consumer-owned and are not rewritten.
