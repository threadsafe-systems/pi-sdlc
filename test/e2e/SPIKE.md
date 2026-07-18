# T0 verification spike

Date: 2026-07-18  
Task: #94 — e2e T0 verification spike  
Pi pin: `@earendil-works/pi-coding-agent@0.80.10`

## Verdict

**GO.** The pinned pi supports the ratified install, trust, ephemeral-provider,
and headless tool-loop seams needed by T1. No ratified decision was falsified.

Run from the repository root after `npm ci`:

```bash
node test/e2e/spike.mjs
```

The spike creates a fresh temporary sandbox, stages only the package manifest,
`skills/`, and `templates/`, and removes no repository files. Its child pi
processes receive an allowlisted environment containing `HOME`, `PATH`, locale,
`PI_OFFLINE=1`, and `PI_SKIP_VERSION_CHECK=1`; the puppet server receives only
its own coordination variables.

## Observed checks

The passing run reported:

| Operation | Wall-clock |
|---|---:|
| L1 staged `pi install <staged> -l` + `pi list` | 1,291 ms |
| Headless project trust (`--approve` / `--no-approve`) | 1,361 ms |
| `-e` puppet provider registration (`--list-models`) | 670 ms |
| L2 skeleton tool loop | 819 ms |
| Baseline L2 skeleton turn | 912 ms |

The L2 run made two provider requests. The first returned a `bash` tool call;
the second received the tool result `spike-tool-ok` and completed with
`spike-puppet-ok`.

## Go/no-go against ratified decisions

`PENDING` means the decision was deliberately outside T0's gate, not that the
spike found a failure. `NO-GO` would require stopping and revising the plan
before T1.

| Decision | Outcome | Evidence / boundary |
|---|---|---|
| 1. Assert effects and mandated markers, not free prose | PENDING | Marker/effect scenario protocol belongs to T3/T4. |
| 2. Harness lives in this repo with scratch consumers | GO | The spike runs from `test/e2e/` and uses fresh scratch consumers. |
| 3. Pin pi exactly | GO | `package.json` and lockfile pin `0.80.10`; the spike asserts the exact value. |
| 4. Observed sandbox guards; optional container | PENDING | T0 proves `HOME` redirection, allowlisted child env, and `PI_OFFLINE`; T1 owns denial and teardown guards. |
| 5. Puppet anti-vacuity sentinel and negative control | PENDING | The sentinel protocol and negative control belong to T3. |
| 6. Per-run `-e` puppet provider with model and dummy key | GO | `--list-models` discovers `puppet-model`; the headless tool loop reaches the local server. |
| 7. Staged-copy install-root fidelity | GO | `pi install <staged> -l`, `pi list`, and trusted resource inspection report the staged `SKILL.md`; the staged `/setup-sdlc` template is present. |

## T1 handoff notes

- Local-path `pi install` writes a project package entry relative to the
  project settings location and, under `--approve`, the resource source is
  reported as the staged package root.
- Headless `pi -p` invocations must be launched with the harness's tested
  process-spawn arrangement: inherit the child's stdin while capturing output.
  A fully piped stdin caused pi 0.80.10 to remain alive without issuing the
  provider request in this environment.
- The puppet endpoint must emit OpenAI-compatible SSE chunks followed by
  `data: [DONE]`; a single non-streaming JSON response is not sufficient.
- The pin is a dev dependency so `npm ci` supplies the exact `pi` binary used by
  the spike and later harness tasks.
