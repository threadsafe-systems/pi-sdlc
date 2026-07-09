# Build plan: pi-sdlc extraction

- Implements spec `docs/specs/2026-07-09-pi-sdlc-extraction.md` (v3, `ae99dea`).
- Canonical build ledger. Worked in one continuous session. pi-sdlc has no tracker
  board yet, so the epic/sub-issue/board publish step is skipped (this doc is
  canonical); loom's board is untouched.
- Tasks are sequential; each ends with its check-commands green before the next.

## Task 1 — repo skeleton, licence, discovery metadata (D1, S1)

- `package.json` with `{"pi":{"skills":["./skills"]}}`, name `pi-sdlc`, MIT.
- MIT `LICENSE` (Neil approved), `README.md` (what/why, install, the manifest).
- Check: `node -e "JSON.parse(require('fs').readFileSync('package.json'))"`;
  `test -f LICENSE README.md`.

## Task 2 — JSON schemas + examples (FS1, FS2, S3)

- `skills/sdlc/schema/sdlc.config.schema.json` + `sdlc.config.example.json`.
- `skills/sdlc/schema/sdlc.models.schema.json` + `sdlc.models.example.json`.
- Check: a tiny node validator (ajv is a DEV dep, allowed; NFR2 forbids only
  RUNTIME deps in the scripts) validates each example; a mutated example fails.

## Task 3 — generic prompts (FS7)

- Move loom's four prompts to `skills/sdlc/prompts/`, verbatim EXCEPT the
  plan/spec governing-doc parenthetical → domain-neutral form. Keep exact `##`
  headings (S4/FS7).
- Check: `grep -c '^## '` per prompt matches the FS7 count; no loom literal.

## Task 4 — `ensure-panel-agent.sh` generalised (FS3, FS4, FS5, S3b, S4, S5)

- Consumer-root resolution (5-step); read+validate `sdlc.config.json` only;
  prefix/labelPrefix/paths from config (defaults if no-manifest); prompt
  resolution order (consumer `.pi/sdlc/prompts/` → skill `prompts/`); agent name
  `<prefix>-<phase-slug>`; regenerated description; body verbatim + REVIEWER_TAG.
- Check: stamping loom's config reproduces name+tools+body of the golden; bad
  config exits 2; agent lands in consumer `.pi/agents` from a global path.

## Task 5 — `resolve-panel.mjs`/`.sh` generalised (FS2, FS3, FS5, S3c, S6)

- Consumer-root resolution; `--config`/`--repo-root`; `--models-file` default
  from root; validate `sdlc.models.json` (four keys, min_panel≥1, non-empty
  prefer, provider/model shape); keep `--emit-tasks`; exit codes per FS5.
- Check: under the isolated cred env, `--emit-tasks` for four phases deep-equals
  the golden; bad models file exits 2.

## Task 6 — generic SKILL.md, tracker-ops, agent-brief (FS6, S2)

- Genericise per the §6 site list (every site) + tokens; scripts comments too.
- Check: `grep -rniE '<S2 alternation>' skills/sdlc/` empty outside schema/docs.

## Task 7 — golden fixtures + test harness (D4a, D4b, NFR1, S3–S7)

- Capture goldens once from the pre-extraction loom scripts under the isolated
  env; `test/` harness runs S2, S3, S3b, S3c, S4, S5, S6, S7 offline, no live
  calls. `npm test` wires them.
- Check: `npm test` green, no network.

## Task 8 — ADRs (D7, S11)

- One ADR per frozen surface FS1–FS7 + name + distribution, under
  `docs/adr/`.
- Check: `ls docs/adr/*.md` count ≥ 9.

## --- CHECKPOINT: pi-sdlc side complete, all reversible. Then: ---

## Task 9 — publish + verify discovery (DEP2, D1, S1)  [external]

- `gh repo create threadsafe-systems/pi-sdlc`, push; verify pi surfaces
  `/skill:sdlc` on the machine. Record in loom `docs/reviews/.../discovery-verified.md`.

## Task 10 — loom migration (O3, D5, S8, S9)  [in loom worktree, cutover]

- Add `.pi/sdlc/{config,models,prompts overrides}`; DELETE `.pi/skills/loom-sdlc/`;
  update AGENTS.md/CONTRIBUTORS.md/PR-template/.gitignore; loom gate green; the
  deletion commit is a descendant of the discovery-verified commit.
- Check: loom `npm test` green; S8 grep clean; a loom phase dry-run works via the
  global skill.

## Task 11 — PRs + PR panels (both repos)  [paid]

- Open pi-sdlc PR and loom PR; run PR panels to the stop condition; merge on
  Neil's call.
