### S06 ledger row loses the changed exit-2 exception

- severity: low
- confidence: high
- origin: REOPENED(OT-R1-08)
- file: docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
- line: 38
- problem: The ledger says rows describe pre-change baseline statements, but S06 now omits the baseline’s “no git repository behaves as exit 1” rule while remaining `retained`. The narrowed `root.resolve` exception is therefore not recorded as a replacement.
- repro_or_impact: Auditors cannot see that the exit-2 policy changed; the ledger falsely presents S06 as unchanged.