### Branch protection does not enforce CI for administrators

- severity: medium
- confidence: high
- file: docs/plans/2026-07-11-biome-ci.md
- line: 68-70
- problem: The plan claims CI is an enforced gate, but the live protection rule has `enforce_admins: false`; administrators can merge or push unchecked commits to `main`.
- repro_or_impact: GitHub reports the required `test + biome` check with strict mode, but administrators are exempt. With no push restrictions or required-PR rule, an administrator can bypass the claimed invariant entirely.
