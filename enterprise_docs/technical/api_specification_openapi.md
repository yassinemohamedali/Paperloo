# API REFERENCE & DEVELOPER SPECIFICATION (OPENAPI v3.0)
## Complete REST API Endpoint Documentation, Payload Schemas, Webhook Handshakes, and Edge Vector Specifications
### Document ID: `TECH-API-2026-v1.0` | Format: OpenAPI 3.0.3 / JSON & YAML Reference | Entity: Paperloo Infrastructure Ltd.

---

## 1. API OVERVIEW & AUTHENTICATION SCHEME

The Paperloo REST API enables enterprise partners, agency management platforms, and continuous integration pipelines to initiate real-time compliance audits, retrieve generated legal disclosures, and manage monitored domain sites programmatically.

### Base URL
`https://paperloo.com/api`

### Authentication Header
All authenticated REST endpoints require an Enterprise Bearer API Key provided in the Authorization header:
```http
Authorization: Bearer pl_live_sec_9f8a7b6c5d4e3f2a1b0c
```

---

## 2. CORE ENDPOINT SPECIFICATIONS

### 2.1 Initiating Real-Time Site Audit (`POST /api/scan-external-site`)
Executes the headless crawler engine against a target web property, analyzing DOM nodes, third-party script signatures, CMP banners, and legal disclosure anchors.

#### Request Payload (`application/json`)
```json
{
  "url": "https://enterprise-client.com",
  "deepScan": true,
  "jurisdictions": ["GDPR", "CCPA", "APPs", "PIPEDA"]
}
```

#### Response Payload (`200 OK`)
```json
{
  "status": "SUCCESS",
  "timestamp": "2026-07-23T20:46:00Z",
  "audit": {
    "domain": "enterprise-client.com",
    "score": 96,
    "grade": "A",
    "status": "SECURE",
    "violationsCount": 0,
    "details": {
      "hasPrivacyPolicy": true,
      "hasTermsOfService": true,
      "hasCookiePolicy": true,
      "hasCookieBanner": true,
      "detectedCMP": "OneTrust / Paperloo Shield",
      "detectedTrackers": [
        { "name": "Google Analytics 4 (Consent Mode v2)", "shielded": true },
        { "name": "Meta Pixel", "shielded": true }
      ]
    },
    "sha256": "9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a"
  }
}
```

---

### 2.2 Edge Consent Management Delivery Script (`GET /api/paperloo.js`)
Ultra-lightweight (4.2kB) asynchronous JavaScript edge vector served across 285+ Anycast CDN locations to enforce user consent choices and intercept unshielded tracking scripts in real-time.

#### Request Headers
```http
GET /api/paperloo.js?siteId=site_8820194 HTTP/1.1
Host: cdn.paperloo.com
```

#### Response (`200 OK` - `application/javascript`)
```javascript
(function(){
  window.PaperlooConsent={version:"4.2.0",siteId:"site_8820194",status:"ACTIVE"};
  console.log("[Paperloo] Edge Consent Shield Active.");
})();
```

---

### 2.3 Stripe Merchant Billing Webhook (`POST /api/stripe-webhook`)
Ingress webhook vector receiving cryptographic payment signals from Stripe (`customer.subscription.created`, `invoice.payment_succeeded`).

---

_AUTHORITATIVE SPECIFICATION // ISSUED BY PAPERLOO CORE API ARCHITECTS_
