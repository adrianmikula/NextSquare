# AI Endpoint Guardrail Contracts

_Status: No runtime AI endpoints yet. Contracts established before integration._

---

## Contract Requirements

All future `/api/ai/*` routes must satisfy the following guardrails before deployment:

### Input Sanitization

- Strip prompt-injection patterns: `[INST]`, `[System:`, `<<SYS>>`, and similar delimiters
- Remove zero-width characters and non-printable Unicode
- Enforce maximum input length (e.g., 4,096 tokens) with a clear `413 Payload Too Large` response
- Reject requests containing base64-encoded payloads or encoded injection vectors

### Content Safety Wrapper

- All prompts and model outputs must pass through a content-safety classifier before reaching the LLM and before returning to the client
- Blocked content returns a sanitized error message without model reasoning
- Maintain an allowlist of approved model endpoints; reject requests to unlisted endpoints

### Audit Logging

- Log every prompt and response to an audit sink with timestamp, route, session ID, and token count
- Never log raw secrets, API keys, or full personally identifiable information
- Audit logs must be immutable and retained per compliance requirements

### Output Filtering

- Apply regex and keyword filters to model outputs before sending to client
- Redact any leaked credentials, tokens, or internal system references
- Enforce a maximum output length

### Client-Side Restrictions

- **Prohibit raw client-side LLM API calls.** No browser → openai.com / anthropic.com / similar direct connections
- All AI interactions must flow through `/api/ai/*` server routes
- Client components may only call internal API routes; external LLM endpoints are blocked via CSP and egress firewall rules

### Design Review Gate

- Any new AI feature requires an ADR-style threat design review before implementation
- Review must cover: prompt injection risk, data exfiltration path, output poisoning, and rate-of-fire abuse
- Approval required from the security-conscious reviewer before merge

---

## Example Route Structure

```
app/api/ai/
  └── generate/
      └── route.ts
```

```ts
// app/api/ai/generate/route.ts
export async function POST(request: NextRequest) {
  // 1. Validate CSRF token
  // 2. Check rate limit
  // 3. Sanitize input
  // 4. Classify content safety
  // 5. Call internal LLM proxy (never direct)
  // 6. Filter output
  // 7. Log to audit sink
  // 8. Return filtered response
}
```

---

## Enforcement

- Add automated lint rules to reject direct imports of `openai`, `@anthropic-ai`, or similar SDKs in `app/` and `components/`
- Add runtime assertion in any future AI proxy to verify the caller is internal
- Review all new dependencies for embedded AI clients during dependency review
