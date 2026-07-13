Working tree clean, commit matches exactly. All probes confirm the fixes are solid. Here's my verification report:

---

## Verification Report

### Fix 1: Committed symlink bypass (HIGH → VERIFIED)

**File**: `skills/sdlc/scripts/sdlc-status.mjs`, line 178-181

**Verification probes**:

1. **Mode regex** (`/^100(644|755) blob /`): Confirmed via live `git ls-tree` that 644 blobs match, 755 blobs match, 120000 (symlinks) do NOT match, gitlinks (160000) do NOT match, and non-existent paths return empty stdout → regex doesn't match → `headIsRegularFile` returns `false`.

2. **Monorepo `--full-tree` pathing**: Confirmed `git -C packages/foo ls-tree --full-tree HEAD -- packages/foo/.pi/sdlc/sdlc.config.json` correctly resolves. The `gitPath` function produces repo-root-relative paths (via the `prefix` from `relative(realTop, realRoot)`), and `--full-tree` interprets paths repo-relative regardless of `-C`. Consistent between `cat-file -e`, `diff`, and `ls-tree`.

3. **Committed symlink + clean working tree**: Confirmed `cleanAgainstHead` returns "clean" for a committed symlink (both index-vs-HEAD and working-tree-vs-index diffs exit 0 when the symlink is unchanged). `headIsRegularFile` is the **necessary** defense — without it, `readFileChecked` would follow the symlink to uncommitted external content.

4. **Hardlinks**: Transparent to git — a hardlink shares the same inode (same content) as the committed blob, so no smuggling vector.

5. **Case variants**: On case-insensitive FS (macOS), path resolution is case-insensitive — same file. On case-sensitive FS (Linux), `readFileSync` resolves the exact path — no smuggling.

6. **TOCTOU race between `cleanAgainstHead` and `readFileChecked`**: Pre-existing filesystem limitation, not introduced by this fix.

**Test coverage**: `AR9/PR-panel: a manifest committed as a symlink is never trusted as adoption content` (test/readiness-git.test.js:250) — verifies manifest→config.valid:error exit 2, models→models.valid:fail exit 3.

**Verdict**: **VERIFIED** — the fix correctly closes the trust-boundary gap.

---

### Fix 2: Unknown-argument value echo (MEDIUM → VERIFIED)

**File**: `skills/sdlc/scripts/sdlc-status.mjs`, line 104-106

```js
const shown = a.includes("=") ? `${a.slice(0, a.indexOf("=") + 1)}…` : a;
err(`unexpected argument: ${shown}`);
```

**Verification probes**:

1. Value redaction: `--api-key=sentinel-secret` → diagnostic reads `unexpected argument: --api-key=…`. Sentinel value never appears in output.

2. Golden tests: No golden test relies on exact unknown-argument message text — golden fixtures use valid arguments. The `JSON on every state 0-3` test validates envelope structure, not error-message content. No breakage.

3. Argument without `=`: Passed through as-is (e.g., `--bogus` → `unexpected argument: --bogus`). Intact.

4. Edge case `=` at position 0: Would produce `=…` — harmless, no credential leak.

**Test coverage**: `AR8/PR-panel: argument values after '=' are elided from diagnostics` (test/readiness-output.test.js:212) — asserts sentinel absent, message matches `/unexpected argument: --api-key=/`.

**Verdict**: **VERIFIED** — correctly redacts values without breaking any diagnostic or golden.

---

### Fix 3: Error-skip propagation (MEDIUM → VERIFIED)

**File**: `skills/sdlc/scripts/sdlc-status.mjs`, lines 285-288

Before:
```js
if (r && r.status !== "pass") return SKIP_REASON[id] ?? r.message;
```
After:
```js
if (r && r.status === "error") return r.message;
if (r && r.status !== "pass") return SKIP_REASON[id] ?? r.message;
```

**Verification probes**:

1. Error ancestor → accurate message: `cli.arguments:error` ("unexpected argument: --bogus") propagates to `root.resolve:skip`, `git.repository:skip`, etc. All dependents carry the exact root-cause message.

2. **FAIL ancestor → pinned SKIP_REASON (unchanged)**: 
   - No manifest → `adoption.manifest-head:fail`, all dependents skip with "manifest is not committed in current HEAD" (the `SKIP_REASON`)
   - Dirty manifest → `adoption.manifest-clean:fail`, `config.valid` skips with "manifest has uncommitted changes" (the `SKIP_REASON`)
   - The `r.status === "error"` guard fires **only** for `error`, leaving `fail`→`SKIP_REASON` path intact.

3. Error-status check that also has a SKIP_REASON entry: `adoption.manifest-clean` can be `error` ("git could not compare the manifest against HEAD"). Now propagates that accurate message instead of the misleading "manifest has uncommitted changes". All other SKIP_REASON entries belong to checks that are never `error` (they're terminal `fail` or upstream `pass`/`fail`).

**Test coverage**: `PR-panel: skips blocked by an errored check propagate that check's own message` (test/readiness-output.test.js:227) — asserts checks[1].message === checks[0].message for error→skip chain.

**Verdict**: **VERIFIED** — error messages propagate accurately; fail-skip messages remain pinned to spec.

---

### Fix 4: Root flag consumes option token (LOW → VERIFIED)

**File**: `skills/sdlc/scripts/sdlc-status.mjs`, lines 79-83

Before: `const v = argv[++i]` then only `undefined` check.
After: peek at `argv[i+1]`, reject if `undefined` or starts with `--`, increment only on success.

**Verification probes**:

1. `--repo-root --format json` → correctly produces `--repo-root requires a value` error, root does NOT contain `--format`.

2. `--repo-root './--my-dir'` (prefixed with `./`) → accepted as valid root, resolves correctly, cli.arguments:pass. The `startsWith("--")` check fires only on bare `--` prefixed tokens, not relative-path-prefixed ones.

3. `--repo-root --my-dir` (bare `--` prefixed) → rejected as missing value. Marginal regression for an extremely unusual directory name; adjudicated as acceptable.

4. `--repo-root --` (double-dash sentinel) → rejected as missing value. `--` is not a valid directory value; using `./--` works as expected.

5. Interaction with `=` syntax: `--repo-root=/some/dir` is a single token that does NOT match `a === "--repo-root"` (exact match) → falls through to unexpected-argument with elision. Correct per spec §1.1 (space-separated pairs).

**Test coverage**: `AR4/PR-panel: a root flag never consumes a following option as its value` (test/readiness-output.test.js:220) — asserts missing-value error, no fabricated root.

**Verdict**: **VERIFIED** — prevents option-token fabrication; minor edge case with bare `--`-prefixed directory names is acceptable per adjudication.

---

### NEW DEFECTS

None found. All 110 tests pass, lint is clean, working tree matches HEAD exactly.