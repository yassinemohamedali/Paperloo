# ENTERPRISE SERVICE LEVEL AGREEMENT (SLA)
## Uptime Commitments, Service Credit Remediation Schedules, Maintenance Windows, and Support Ticket Escalations
### Document ID: `LEG-SLA-2026-v4.1` | Scope: Enterprise Tier & Agency Subscriptions | Entity: Paperloo Infrastructure Ltd.

---

## 1. UPTIME COMMITMENT & CORE DEFINITIONS

Paperloo Infrastructure Ltd. ("Paperloo") guarantees that the core service modules—including Edge Consent Script Delivery (`/api/paperloo.js`), REST API Endpoints (`/api/scan-external-site`), and the Enterprise Dashboard—will achieve a Monthly Uptime Percentage of at least **99.99%** during each calendar month.

$$\text{Monthly Uptime \%} = \frac{\text{Total Minutes in Month} - \text{Unexcused Downtime Minutes}}{\text{Total Minutes in Month}} \times 100$$

---

## 2. SERVICE CREDIT REMEDIATION SCHEDULE

If Paperloo fails to meet the Guaranteed Monthly Uptime Percentage, Enterprise Clients are eligible to receive Service Credits applied against future subscription invoices:

| Monthly Uptime Percentage | Service Credit Percentage Applied to Monthly Invoice |
| :--- | :--- |
| **99.90% to 99.98%** | **10% Service Credit** |
| **99.50% to 99.89%** | **25% Service Credit** |
| **99.00% to 99.49%** | **50% Service Credit** |
| **Below 99.00%** | **100% Full Monthly Refund Credit** |

---

## 3. SUPPORT RESPONSE & ESCALATION SLAs BY SEVERITY TIER

Paperloo provides 24/7/365 technical support for Enterprise Tier customers, backed by binding response time SLAs:

| Severity Tier | Initial Response Time SLA | Workaround / Resolution Target | Status Update Frequency |
| :--- | :--- | :--- | :--- |
| **SEV-1 (CRITICAL OUTAGE)** | **< 15 Minutes** | **< 2 Hours** | Every 30 Minutes |
| **SEV-2 (HIGH DEGRADATION)** | **< 1 Hour** | **< 8 Hours** | Every 2 Hours |
| **SEV-3 (NORMAL ENQUIRY)** | **< 4 Hours** | **< 24 Hours** | Daily |
| **SEV-4 (FEATURE REQUEST)** | **< 24 Hours** | Roadmap Scheduling | As Updated |

---

## 4. EXCLUSIONS & MAINTENANCE WINDOWS

Monthly Uptime calculations exclude downtime resulting from:
1. Scheduled Maintenance windows announced at least 72 hours in advance (executed between 01:00 and 03:00 UTC).
2. Force Majeure events beyond Paperloo’s reasonable control.
3. Client-side DNS misconfigurations or upstream internet provider failures.

---

_AUTHORITATIVE BINDING SLA // INCORPORATED INTO ALL ENTERPRISE LICENSES_
