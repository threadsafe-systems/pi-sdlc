# Specification panel — DeepSeek V4 Pro

Findings before adjudication:

- HIGH: `resolveConsumerPath` lacked a return/error contract.
- MEDIUM: SP2 appeared to require live credentials despite the offline fixture requirement.
- MEDIUM: FS1 backslash validation was not explicitly coupled to the seam.
- LOW: checker path scope, configured spelling, and FS10 workflow location were ambiguous.

The specification now freezes the `{ok,resolved,configured,normalized}` / `{ok:false,message}` return union, isolated-auth offline panel resolution, shared FS1 slash-normalized validation, caller path scope, display spelling, and exact workflow path.
