<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->

```sdlc
track: reversible
slug: replace-with-feature-slug
```

## Governing documents

- Irreversible: link the plan, Specification, and Build plan.
- Reversible: link the plan and Build plan; no Specification is required.
- None: replace `slug:` with `reason:` and explain the exemption.

## Tracker references

For a tracker-backed Build (two or more tasks), link the epic and every task
sub-issue. Use `Closes #<task-issue>` for task issues completed by merging this
PR. For a single-task or `track: none` change, write `N/A — no tracker-backed
Build` and explain briefly.

- Epic: `#<epic-issue>`
- Tasks: `#<task-issue>`, `#<task-issue>`
- Board: `<TRACKER_BOARD>`

## Assumptions & discretionary calls

Assumptions and discretionary implementation choices accrued during Implement,
copied from the build-plan doc's "Assumptions" appendix. Review input for the
PR panel — not a place for panel findings. Write `None` when nothing accrued.
