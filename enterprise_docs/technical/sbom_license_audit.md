# SOFTWARE BILL OF MATERIALS (SBOM) & OPEN-SOURCE LICENSE AUDIT
## Comprehensive Open-Source Package Inventory, License Risk Categorization, and Copyleft Contamination Review
### Document ID: `TECH-SBOM-2026-v3.2` | Specification Standard: SPDX 2.3 / CycloneDX | Entity: Paperloo Infrastructure Ltd.

---

## 1. EXECUTIVE SUMMARY & LICENSE AUDIT CERTIFICATION

Paperloo Infrastructure Ltd. ("Paperloo") conducts rigorous continuous Software Composition Analysis (SCA) across all client, server, and edge runtime codebases. This Software Bill of Materials (SBOM) details every third-party npm package, library dependency, and utility compiled into the production application.

**Copyleft Contamination Audit Result:** **VERIFIED 0% CONTAMINATION.**
All production dependencies are strictly governed by permissive open-source licenses (MIT, Apache 2.0, BSD-3-Clause, ISC). No viral copyleft licenses (GPL v2/v3, AGPL, LGPL) are present in any production build artifact.

---

## 2. PRODUCTION DEPENDENCY INVENTORY & LICENSE MAPPING

| Package Name | Version | SPDX License Identifier | Dependency Type | Risk Category | Operational Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **react** | `^18.3.1` | `MIT` | Production Runtime | LOW (PERMISSIVE) | UI Framework Core |
| **react-dom** | `^18.3.1` | `MIT` | Production Runtime | LOW (PERMISSIVE) | DOM Hydration & Rendering |
| **express** | `^4.21.2` | `MIT` | Production Server | LOW (PERMISSIVE) | Core Node.js API Server |
| **vite** | `^5.4.11` | `MIT` | Build Pipeline | LOW (PERMISSIVE) | Module Bundler & Dev Server |
| **esbuild** | `^0.25.0` | `MIT` | Server Build Pipeline | LOW (PERMISSIVE) | CJS Bundle Compilation |
| **motion** | `^12.4.7` | `MIT` | Production UI | LOW (PERMISSIVE) | Fluid Component Physics |
| **tailwindcss** | `^4.0.0` | `MIT` | Production UI | LOW (PERMISSIVE) | CSS Utility Framework |
| **lucide-react** | `^0.475.0` | `ISC` | Production UI | LOW (PERMISSIVE) | Vector Icon System |
| **@google/genai** | `^0.1.1` | `Apache-2.0` | Server-Side AI | LOW (PERMISSIVE) | Legal Clause Synthesis |
| **stripe** | `^17.7.0` | `MIT` | Server-Side Payments | LOW (PERMISSIVE) | Stripe Billing Webhooks |
| **zustand** | `^5.0.3` | `MIT` | Production UI | LOW (PERMISSIVE) | Local State Management |
| **sonner** | `^2.0.1` | `MIT` | Production UI | LOW (PERMISSIVE) | Toast Notifications |

---

## 3. DEPENDENCY SECURITY & SCA AUTOMATION PROTOCOL

- **Automated CI/CD License Gate:** Every pull request triggers an automated Snyk scan verifying that no package introducing GPL, AGPL, or SSPL licensing enters the main branch.
- **Transitive Dependency Audit:** Deep AST dependency trees undergo weekly automated vulnerability analysis against the National Vulnerability Database (NVD).

---

_AUTHORITATIVE TECHNICAL AUDIT // CERTIFIED BY PAPERLOO VP OF ENGINEERING_
