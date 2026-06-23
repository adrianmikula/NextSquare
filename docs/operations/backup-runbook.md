# Backup Strategy & Data Residency

_Status: No automated Square data backup documented; no recovery runbook._

---

## Data Classification

| Data Class | Owner | Current Backup Status |
|------------|-------|----------------------|
| Square catalog and order history | Square | No automated export; data lives in Square |
| Outstatic CMS content | Git repository | Source of truth is Git; branch protection + mirror required |
| Environment configuration | Platform team | Secrets in plain env vars; no documented recovery procedure |
| Application code | Git repository | Standard Git backup via remote |

---

## Square Catalog and Order History

### Export Cadence

- **Frequency:** Weekly automated export via Square API
- **Format:** JSON with catalog objects and orders
- **Storage:** Object storage (S3, GCS, or equivalent) with versioning enabled

### Recovery-Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Accidental catalog deletion | 4 hours | 1 week |
| Order history corruption | 24 hours | 1 week |
| Full Square account loss | N/A | Migrate to new account |

### Square API Export Job

```bash
# Example cron job (evaluate for production)
square-export-catalog --output s3://backups/square/catalog/$(date +%Y-%m-%d).json
square-export-orders --start-date $(date -d "7 days ago" +%Y-%m-%d) --output s3://backups/square/orders/$(date +%Y-%m-%d).json
```

**Tool evaluation:** Square CLI, custom Node.js script using `square` SDK, or third-party backup tool.

---

## Outstatic CMS Content

- **Source of truth:** Git repository (`content/` directory)
- **Backup strategy:** Configure GitHub repository mirror to a secondary Git host (GitLab, Bitbucket, or second GitHub account)
- **Branch protection:** Enable required reviews, status checks, and admin restrictions on the `main` branch
- **Recovery:** Clone from mirror or restore from Git reflog

---

## Environment Configuration

- Secrets and env vars must be recoverable via the secrets provider rotation/restore runbook
- Document the secrets provider selection, IAM/policy requirements, and key rotation procedure
- Store CI/CD pipeline configuration in Git; avoid manual console changes

---

## Operational Runbook

Create step-by-step restore procedures for each data class:

1. **Restore Square catalog from export**
   - Identify export file by date
   - Validate JSON schema
   - Use Square API `upsertCatalogObject` or bulk import
   - Verify counts before and after

2. **Restore Outstatic CMS content**
   - Clone mirror repository
   - Checkout target commit
   - Push to primary repository
   - Verify content renders correctly

3. **Restore environment configuration**
   - Re-inject secrets via Doppler/AWS/Vault CLI
   - Verify `getSecret()` returns expected values
   - Restart application and confirm health check passes

4. **Restore application code**
   - `git clone` from primary or mirror
   - Checkout target tag or commit
   - Run `npm ci --ignore-scripts` and `npm run build`
   - Deploy and verify

---

## Testing Schedule

- **Quarterly:** Full restore drill for each data class
- **After each deployment:** Verify backup job ran successfully in the last 24 hours
- **After schema changes:** Validate export format compatibility

---

## Responsible Parties

| Data Class | Primary Owner | Backup Owner |
|------------|--------------|--------------|
| Square catalog | Operations | Platform |
| Outstatic CMS | Content team | Platform |
| Env configuration | Platform | Security |

---

## Automation

- Evaluate scheduled export jobs for Square API (custom script or CLI)
- Evaluate Outstatic CLI for content backup
- Evaluate GitHub repository mirror for code and CMS backup
- Document chosen tools and configuration in this runbook
