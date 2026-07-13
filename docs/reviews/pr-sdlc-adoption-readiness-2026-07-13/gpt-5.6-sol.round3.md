### Index flags bypass the byte-identity check (`skills/sdlc/scripts/sdlc-status.mjs:197-209`)

- verdict: RESOLVED
- evidence: The committed code directly compares `HEAD:<path>` with the present file’s hash at lines 202-207. Tests at `test/readiness-git.test.js:255-273` cover both flags across both files and pass with exit 3 at the corresponding cleanliness check. Sparse-checkout tests at lines 194-220 retain exit 2 for an omitted manifest and exit 3 for omitted models. A monorepo-subdirectory probe with `assume-unchanged` also exited 3 at `adoption.manifest-clean`.

### NEW DEFECTS

### Git clean filters can still smuggle arbitrary working-tree content

- severity: high
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 202-207
- problem: `git hash-object -- <file>` applies the path’s configured clean filter, so it does not necessarily hash the present file’s raw bytes. A filter that emits the committed blob lets different working-tree JSON pass both `git diff` and the new hash comparison before the unfiltered file is parsed.
- repro_or_impact: With `.gitattributes` assigning a clean filter to the manifest and that filter emitting the committed manifest, replacing the working manifest with different valid JSON made both hashes equal and `sdlc-status` exit 0/`ready`. This remains a false-ready smuggling path around the claimed byte-identity boundary; `hash-object --no-filters` would hash actual bytes.