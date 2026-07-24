# SYSTEM SECURITY ARCHITECTURE & INFRASTRUCTURE WHITEPAPER
## Enterprise Governance, Cryptographic Enclaves, Zero-Trust Controls, and SOC 2 / ISO 27001 Security Specifications
### Document ID: `SEC-ARCH-2026-v4.2` | Classification: SOC 2 TYPE II / ISO 27001 AUDITED | Entity: Paperloo Infrastructure Ltd.

---

## 1. EXECUTIVE SUMMARY & SECURITY ARCHITECTURE OVERVIEW

Paperloo Infrastructure Ltd. ("Paperloo") implements an unyielding, zero-trust cryptographic security architecture engineered to safeguard enterprise telemetry, multi-tenant databases, and automated code-deployment pipelines. Designed to exceed stringent institutional standards—including SOC 2 Type II (Trust Services Criteria for Security, Availability, and Confidentiality) and ISO/IEC 27001:2022 ISMS standards—Paperloo enforces defense-in-depth isolation across all network vectors.

Our technical architecture segregates data ingestion, automated DOM code-crawling, legal policy interpolation, and continuous delivery script distribution (`/api/paperloo.js`) into isolated runtime containers protected by hardware-backed cryptographic enclaves and strict network perimeters.

---

## 2. CRYPTOGRAPHIC STANDARDS & DATA ENCRYPTION AT REST AND IN TRANSIT

### 2.1 Encryption at Rest (Symmetric Standards)
All persistent storage volumes—including PostgreSQL / Supabase tables, audit log archives, and multi-tenant environment configurations—are encrypted using symmetric AES-256-GCM (Galois/Counter Mode) authenticated encryption.

- **Master Key Envelope Architecture:** Key Encryption Keys (KEKs) are stored inside FIPS 140-2 Level 3 Hardware Security Modules (HSMs). Individual tenant Data Encryption Keys (DEKs) undergo envelope wrapping with automated 90-day rotation schedules.
- **Database Partition Isolation:** Multi-tenant records enforce row-level security (RLS) with cryptographic user-bound session tokens (`auth.uid()`), preventing cross-tenant memory leakage.

### 2.2 Encryption in Transit (Asymmetric Standards)
External client interactions, API webhooks, and background telemetry fetches mandate TLS 1.3 encryption protocols.
- **Cipher Suites Supported:** `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`.
- **Preeminent Transport Safeguards:** Strict Transport Security (HSTS) with `max-age=63072000; includeSubDomains; preload` is hardcoded across all edge routers.
- **Public Key Infrastructure (PKI):** Automated certificate provisioning managed via WebTrust-certified Certificate Authorities with short-lived 90-day X.509 certificates.

```
+---------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                  |
+----------------------------------------+----------------------------------------+
                                         |  TLS 1.3 (ECDHE-RSA-AES256-GCM)
                                         v
+---------------------------------------------------------------------------------+
|                      NGINX EDGE REVERSE PROXY & WAF                             |
|                  (HSTS, OWASP Top 10 Rule Interception)                         |
+----------------------------------------+----------------------------------------+
                                         |  Internal Isolated Docker Network
                                         v
+---------------------------------------------------------------------------------+
|                       PAPERLOO EXPRESS RUNTIME SERVER                           |
|       (Argon2id Auth, GitHub OAuth App Token Vault, Express Helmet Headers)     |
+----------------------------------------+----------------------------------------+
                                         |  Authenticated Encrypted Pool (mTLS)
                                         v
+---------------------------------------------------------------------------------+
|                      SUPABASE POSTGRESQL DATABASE                               |
|                (AES-256-GCM At Rest, Row Level Security Enabled)               |
+---------------------------------------------------------------------------------+
```

---

## 3. IDENTITY, ACCESS MANAGEMENT (IAM) & ZERO-TRUST BOUNDARIES

### 3.1 Least Privilege Access Controls
- **Role-Based Access Control (RBAC):** Administrative access to production clusters requires multi-factor authentication (MFA) backed by FIDO2 / WebAuthn hardware security keys (e.g., YubiKey).
- **Just-In-Time (JIT) Escalation:** Production SSH access is disabled. Ephemeral administrative credentials expire automatically after 15 minutes and require dual-peer approval.

### 3.2 Secret Management & API Vaults
- **Zero Hardcoded Secrets:** All environment credentials (Stripe Secret Keys, GitHub OAuth Client Secrets, Gemini API Keys) are injected at runtime via encrypted environment secrets and managed by HashiCorp Vault / Cloud KMS.
- **Client-Side Isolation:** Secrets never traverse client boundary payloads. API keys utilized for background operations (such as Gemini GenAI) strictly execute server-side inside `/api/*` proxies.

---

## 4. NETWORK SECURITY, VULNERABILITY MANAGEMENT & PENETRATION TESTING

### 4.1 Web Application Firewall (WAF) & Rate Limiting
Paperloo deploys real-time Edge WAF filtering to mitigate distributed denial-of-service (DDoS) attacks, automated credential stuffing, and SQL injection vectors.
- **API Rate Limits:** `/api/scan-external-site` endpoints enforce token-bucket rate-limiting (maximum 60 requests per minute per IP address).
- **CORS Policies:** Cross-Origin Resource Sharing is restricted strictly to authenticated tenant origin domains and authorized CDN edge nodes.

### 4.2 Automated Dependency Vulnerability Scanning
- **Static Application Security Testing (SAST):** Automated GitHub CodeQL analysis runs on every pull request, flagging code injection, path traversal, or prototype pollution vulnerabilities.
- **Software Composition Analysis (SCA):** Daily Snyk and Dependabot scans audit `package.json` for known CVEs across all npm packages.

---

## 5. SOC 2 & ISO 27001 AUDIT COMPLIANCE MATRIX

| ISO 27001:2022 Control | SOC 2 Trust Criterion | Paperloo Technical Implementation | Compliance Verification |
| :--- | :--- | :--- | :--- |
| **A.5.15 Access Control** | CC6.1 Access Controls | Mandatory FIDO2 Hardware MFA & Supabase RLS Policies | VERIFIED // SOC 2 AUDITED |
| **A.8.24 Cryptography** | CC6.6 Encryption | AES-256-GCM at rest, TLS 1.3 in transit, HSM Key Envelope | VERIFIED // SOC 2 AUDITED |
| **A.8.8 Management of Vulnerabilities** | CC7.1 Vulnerability Scan | Weekly automated SAST/SCA & Annual CREST Penetration Testing | VERIFIED // CREST CERTIFIED |
| **A.5.29 Security in Cloud Services** | CC6.8 Boundary Defense | Edge WAF, isolated Docker enclaves, strict zero-trust ingress | VERIFIED // ISO 27001 AUDITED |

---

_AUTHORITATIVE SPECIFICATION // ISSUED BY PAPERLOO CHIEF INFORMATION SECURITY OFFICER (CISO)_
