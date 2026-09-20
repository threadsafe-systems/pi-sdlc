# Child-dispatch probe receipt — panel roster

Date: 2026-09-19 · Repo: `pi-sdlc` · Branch: `feat/panel-dispatch-hygiene`

Scope: the eight model ids that `.pi/sdlc/sdlc.config.json` adds or alters in this
change. Ids the change leaves untouched were not probed and are not claimed here.

## Why this receipt exists

Three properties are independent, and each has been observed to hold while
another fails:

1. **Catalogue presence** — the id appears in `pi --list-models`.
2. **Invocability** — the caller's credentials may invoke it.
3. **Child dispatchability** — it launches as a subagent child.

`resolve-panel --pong` probes the CLI path, which establishes (1) and (2) only. A
model can pass both and still fail (3): see #275, where a current-generation
Anthropic model fails child launch because subagent children do not load the
`anthropic-auth` extension and fall back to a CLI that gates the model.

## Method

One `worker` child per id via `runs.all`, task `Reply with exactly the single
word PONG`, no tools. Dispatch path, not `pi --print`.

## Result

| id | outcome |
| --- | --- |
| `amazon-bedrock/eu.anthropic.claude-opus-5` | dispatched |
| `amazon-bedrock/eu.anthropic.claude-haiku-4-5-20251001-v1:0` | dispatched |
| `google-vertex/gemini-3.1-pro-preview` | dispatched; did not obey the task |
| `zai/glm-5.3` | dispatched |
| `zai/glm-5.3-flash` | dispatched |
| `anthropic/claude-fable-5-1` | inconclusive — account rate limit |
| `anthropic/claude-opus-5` | inconclusive — account rate limit |
| `anthropic/claude-haiku-4-5-20251001` | inconclusive — account rate limit |

Five dispatched. Three are **inconclusive, not failed**: every direct
`anthropic/` attempt returned HTTP 429 `rate_limit_error` from the account, on
both a concurrent and a serial retry. The session running the probe is itself an
Anthropic model consuming that quota. A 429 is a property of the account at that
moment, not of the model, so no dispatchability conclusion is recorded either
way.

`anthropic/claude-fable-5-1` is separately known to fail child launch on this
machine for the reason in #275. This probe neither confirms nor refutes that; it
never reached the launch.

Four of the five returned exactly `PONG`.
`google-vertex/gemini-3.1-pro-preview` launched and returned, which is what this
receipt measures, but answered about an unrelated pull request instead of the
given task — it responded to ambient context rather than its own instruction.
Dispatchability is established; instruction-following under a one-line task is
not, and a reviewer seat depends on the second.

## Two false-negative classes this probe produced

Recorded because both would have been read as model defects:

1. **Harness error.** The first attempt named a nonexistent agent
   (`general`). All eight children failed identically, and the workflow's own
   return value reported `dispatchable: false` for every id. Trusting that output
   would have produced a receipt declaring the entire roster undispatchable.
2. **Account rate limit.** The three 429s above, which look like launch failures
   in any per-child error field.

A dispatch probe is only evidence when the failure is attributable to the model.
A probe that cannot separate "the model refused" from "the probe failed" will
manufacture roster rot rather than detect it — which is the argument for routing
the mechanised check through #141 rather than trusting a one-shot result.
