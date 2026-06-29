# Commands

## Fast iteration (inner loop — run after every change)

| Category | Command | Expected time |
|----------|---------|---------------|
| Lint | `npm run lint:quiet` | <2s |
| Type check | `npm run typecheck` | <2s |
| Fast tests | `npm run test:fast` | <5s |
| Dev server | `npm run dev` | <2s |

## Full validation (CI — run before commit/push)

| Category | Command | Expected time |
|----------|---------|---------------|
| Full test suite | `npm test` | ~2min |
| Build | `npm run build` | ~1min |
| Lint (full) | `npm run lint` | <5s |

## Debugging

| Purpose | Command |
|---------|---------|
| View logs | Check terminal output from `npm run dev` |
| Run with debug mode | `LOG_LEVEL=debug npm run dev` |
| Inspect MCP servers | `npx @modelcontextprotocol/inspector npx -y next-devtools-mcp@1.0.0` |

## Common gotchas

- `npm run lint:quiet` must be run from project root, not a subdirectory
- `npm run dev` must be running before MCP tools like `get_errors` and `get_logs` can capture output
- Set `LOG_LEVEL=debug` before running for verbose output
- Always run `npm run lint:quiet` and `npm run typecheck` before `npm run test:fast`
