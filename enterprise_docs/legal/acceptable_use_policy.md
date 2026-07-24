# ENTERPRISE ACCEPTABLE USE POLICY (AUP)
## Permitted Use Framework, Web Crawling Rate-Limits, Anti-Abuse Standards, and Security Enforcement Measures
### Document ID: `LEG-AUP-2026-v2.5` | Scope: All Users, API Developers & Agency Tenants | Entity: Paperloo Infrastructure Ltd.

---

## 1. PURPOSE & APPLICABILITY

This Acceptable Use Policy ("AUP") defines the rules governing access to Paperloo Infrastructure Ltd.’s ("Paperloo") compliance platform, background web-crawling APIs (`/api/scan-external-site`), consent banner distribution vectors (`/api/paperloo.js`), and GitHub automated deployment integrations.

All users, agency operators, and API consumer entities must strictly adhere to this Policy.

---

## 2. PROHIBITED CONDUCT & SECURITY RESTRICTIONS

Users are strictly prohibited from utilizing Paperloo for any of the following activities:

1. **Malicious Web Crawling & Resource Exhaustion:** Using `/api/scan-external-site` to launch distributed denial-of-service (DDoS) attacks, scrape non-public personal data, or flood target web servers beyond reasonable crawling parameters.
2. **Deceptive Compliance Representations:** Displaying Paperloo compliance badges or certification stamps on domains that have intentionally disabled consent management scripts or active tracking shields.
3. **Reverse Engineering & Code Injection:** Attempting to decompile, reverse-engineer, or tamper with Paperloo's proprietary DOM parser matrix, raw code engine, or server-side API endpoints.
4. **Credential Sharing & Account Pooling:** Sharing account API keys or workspace authentication tokens across unauthorized third-party entities.
5. **Security Penetration Abuse:** Conducting unauthorized penetration tests or vulnerability scans against Paperloo production clusters without prior written authorization from the Paperloo Security Office.

---

## 3. RATE LIMITS & AUTOMATED CRAWLER GOVERNANCE

To protect global network performance, API interactions are governed by automated rate-limiters:

- **Free / Lead Scanner Tier:** 10 requests per minute per IP address.
- **Growth Subscription Tier:** 300 requests per minute per authenticated API key.
- **Agency Enterprise Tier:** Customized high-throughput API limits governed by individual contract addenda.

---

## 4. ENFORCEMENT & ACCOUNT SUSPENSION PROTOCOLS

Paperloo reserves the right to immediately suspend or terminate access to any user or domain found in violation of this AUP. Suspected illegal or malicious activities will be escalated to appropriate sovereign law enforcement agencies.

---

_AUTHORITATIVE POLICY // ISSUED BY PAPERLOO LEGAL & SECURITY OPERATIONS_
