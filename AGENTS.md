<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:security-audit-rules -->
# Security audit policy

After every `npm install`, and before releasing/deploying new production versions, run:
1. `npm audit` to check for vulnerabilities
2. Fix any **high** or **critical** severity vulnerabilities by adding appropriate `overrides` in `package.json` (for transitive deps) or upgrading direct dependencies
3. Only skip if there is genuinely no fix available (e.g. bundled dependency in a framework like Next.js, or a breaking API change in an upstream library)

Run `npm audit` again after applying fixes to confirm they resolved.
<!-- END:security-audit-rules -->
