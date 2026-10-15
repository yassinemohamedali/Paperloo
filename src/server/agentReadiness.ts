import express from "express";
import fs from "fs";
import path from "path";

export function setupAgentPreMiddleware(app: express.Express) {
  const publicDir = path.join(process.cwd(), "public");

  // 1. Intercept res.json to normalize all error responses into structured JSON format
  app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      if (data && typeof data === "object" && typeof data.error === "string") {
        const errorMsg = data.error;
        const statusCode = res.statusCode >= 400 ? res.statusCode : 400;
        const errorCode =
          errorMsg
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .slice(0, 40) || "API_ERROR";

        data = {
          error: {
            code: errorCode,
            message: errorMsg,
            status: statusCode,
            resolution:
              "Consult the OpenAPI specification at /openapi.json or API documentation at /docs/api.",
            documentation_url: "https://paperloo.vercel.app/docs/api",
          },
        };
      }
      return originalJson(data);
    };
    next();
  });

  // 2. Explicit OpenAPI & Machine-Readable Spec Endpoints
  const openApiHandler = (req: express.Request, res: express.Response) => {
    const jsonPath = path.join(publicDir, "openapi.json");
    if (fs.existsSync(jsonPath)) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Vary", "Accept");
      res.sendFile(jsonPath);
    } else {
      res.status(404).json({
        error: {
          code: "SPEC_NOT_FOUND",
          message: "OpenAPI specification file is unavailable.",
          status: 404,
          resolution: "Visit https://paperloo.vercel.app/docs/api",
          documentation_url: "https://paperloo.vercel.app/docs/api",
        },
      });
    }
  };

  const openApiYamlHandler = (req: express.Request, res: express.Response) => {
    const yamlPath = path.join(publicDir, "openapi.yaml");
    if (fs.existsSync(yamlPath)) {
      res.setHeader("Content-Type", "text/yaml; charset=utf-8");
      res.setHeader("Vary", "Accept");
      res.sendFile(yamlPath);
    } else {
      res.status(404).json({
        error: {
          code: "SPEC_NOT_FOUND",
          message: "OpenAPI YAML specification file is unavailable.",
          status: 404,
          resolution: "Visit https://paperloo.vercel.app/docs/api",
          documentation_url: "https://paperloo.vercel.app/docs/api",
        },
      });
    }
  };

  app.get("/openapi.json", openApiHandler);
  app.get("/api/openapi.json", openApiHandler);
  app.get("/openapi.yaml", openApiYamlHandler);
  app.get("/api/openapi.yaml", openApiYamlHandler);

  // 4. llms.txt & Agent Instruction Endpoints
  const llmsHandler = (req: express.Request, res: express.Response) => {
    const llmsPath = path.join(publicDir, "llms.txt");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Vary", "Accept");
    if (fs.existsSync(llmsPath)) {
      res.sendFile(llmsPath);
    } else {
      res.send(MARKDOWN_HOMEPAGE);
    }
  };

  const llmsFullHandler = (req: express.Request, res: express.Response) => {
    const fullPath = path.join(publicDir, "llms-full.txt");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Vary", "Accept");
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      res.send(MARKDOWN_HOMEPAGE);
    }
  };

  app.get("/llms.txt", llmsHandler);
  app.get("/llms-full.txt", llmsFullHandler);
  app.get("/.well-known/agent-instructions.txt", llmsHandler);
  app.get("/agent-instructions", llmsHandler);

  // 5. Model Context Protocol (MCP) Manifest & Streamable HTTP / SSE Protocol Handlers
  const mcpManifestHandler = (req: express.Request, res: express.Response) => {
    const mcpPath = path.join(publicDir, ".well-known", "mcp.json");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Vary", "Accept");
    if (fs.existsSync(mcpPath)) {
      res.sendFile(mcpPath);
    } else {
      res.json(MCP_MANIFEST_DATA);
    }
  };

  app.get("/.well-known/mcp", mcpManifestHandler);
  app.get("/.well-known/mcp.json", mcpManifestHandler);

  // MCP JSON-RPC 2.0 Streamable HTTP Transport Handler
  const mcpRpcHandler = (req: express.Request, res: express.Response) => {
    const { jsonrpc, id, method, params } = req.body || {};

    if (jsonrpc !== "2.0") {
      return res.status(400).json({
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32600,
          message: "Invalid Request: jsonrpc must be '2.0'",
        },
      });
    }

    if (method === "initialize") {
      return res.json({
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
          },
          serverInfo: {
            name: "paperloo-mcp-server",
            version: "1.0.0",
          },
        },
      });
    }

    if (method === "tools/list") {
      return res.json({
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          tools: MCP_MANIFEST_DATA.tools,
        },
      });
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === "verify_compliance") {
        const domain = args.domain || "example.com";
        const result = auditDomainMock(domain);
        return res.json({
          jsonrpc: "2.0",
          id: id ?? null,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "list_jurisdictions") {
        return res.json({
          jsonrpc: "2.0",
          id: id ?? null,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(JURISDICTIONS_DATA, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "get_policy_templates") {
        const filtered = args.type
          ? TEMPLATES_DATA.templates.filter((t) => t.type === args.type)
          : TEMPLATES_DATA.templates;
        return res.json({
          jsonrpc: "2.0",
          id: id ?? null,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(filtered, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "get_system_status") {
        return res.json({
          jsonrpc: "2.0",
          id: id ?? null,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(SYSTEM_STATUS_DATA, null, 2),
              },
            ],
          },
        });
      }

      return res.status(404).json({
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32601,
          message: `Tool '${toolName}' not found`,
        },
      });
    }

    if (method === "ping") {
      return res.json({
        jsonrpc: "2.0",
        id: id ?? null,
        result: {},
      });
    }

    return res.status(400).json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: {
        code: -32601,
        message: `Method '${method}' not supported`,
      },
    });
  };

  app.post("/api/mcp", mcpRpcHandler);
  app.post("/.well-known/mcp", mcpRpcHandler);

  // MCP SSE Streamable Transport Handshake
  app.get("/api/mcp/sse", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const sessionId = "sess_" + Math.random().toString(36).substring(2, 12);
    res.write(`event: endpoint\ndata: /api/mcp?sessionId=${sessionId}\n\n`);

    const keepAliveInterval = setInterval(() => {
      res.write(": keepalive\n\n");
    }, 15000);

    req.on("close", () => {
      clearInterval(keepAliveInterval);
    });
  });

  // 6. Public REST API Endpoints under /api/v1
  app.get("/api/v1/status", (req, res) => {
    res.setHeader("Vary", "Accept");
    res.json(SYSTEM_STATUS_DATA);
  });

  app.get("/api/v1/compliance/jurisdictions", (req, res) => {
    res.setHeader("Vary", "Accept");
    res.json(JURISDICTIONS_DATA);
  });

  app.get("/api/v1/compliance/templates", (req, res) => {
    const { type } = req.query;
    res.setHeader("Vary", "Accept");
    if (type && typeof type === "string") {
      const filtered = TEMPLATES_DATA.templates.filter((t) => t.type === type);
      return res.json({ total_count: filtered.length, templates: filtered });
    }
    res.json(TEMPLATES_DATA);
  });

  app.post("/api/v1/compliance/verify", (req, res) => {
    const { domain, url } = req.body || {};
    const target = domain || url;

    if (!target || typeof target !== "string") {
      return res.status(400).json({
        error: {
          code: "INVALID_TARGET_DOMAIN",
          message: "Field 'domain' or 'url' is required as a valid string.",
          status: 400,
          resolution: "Provide a valid web domain (e.g. {'domain': 'example.com'}).",
          documentation_url: "https://paperloo.vercel.app/docs/api",
        },
      });
    }

    const cleanDomain = target
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .trim();

    const report = auditDomainMock(cleanDomain);
    res.setHeader("Vary", "Accept");
    res.json(report);
  });

  app.get("/api/v1/docs", (req, res) => {
    res.setHeader("Vary", "Accept");
    res.json({
      documentation_url: "https://paperloo.vercel.app/docs/api",
      openapi_spec: "https://paperloo.vercel.app/openapi.json",
      mcp_server: "https://paperloo.vercel.app/.well-known/mcp",
      agent_instructions: "https://paperloo.vercel.app/llms.txt",
      endpoints: [
        {
          path: "/api/health",
          method: "GET",
          description: "Gateway heartbeat check",
          auth_required: false,
        },
        {
          path: "/api/v1/status",
          method: "GET",
          description: "Platform health and regulatory monitor status",
          auth_required: false,
        },
        {
          path: "/api/v1/compliance/jurisdictions",
          method: "GET",
          description: "List supported global legal frameworks",
          auth_required: false,
        },
        {
          path: "/api/v1/compliance/templates",
          method: "GET",
          description: "List document generation templates and input schemas",
          auth_required: false,
        },
        {
          path: "/api/v1/compliance/verify",
          method: "POST",
          description: "Audit target domain for compliance readiness",
          auth_required: false,
        },
        {
          path: "/api/mcp",
          method: "POST",
          description: "Model Context Protocol JSON-RPC 2.0 tool execution",
          auth_required: false,
        },
      ],
    });
  });

  app.get("/api/v1/agent-instructions", (req, res) => {
    res.setHeader("Vary", "Accept");
    res.json({
      product: "Paperloo Compliance Infrastructure",
      summary:
        "Automated statutory legal disclosure architecture, continuous compliance monitoring, and real-time cookie consent shields.",
      best_fit_use_cases: [
        "Auditing websites for GDPR, CCPA, and cookie consent gaps",
        "Synthesizing customized Privacy Policies, Terms of Service, and EULAs",
        "Configuring zero-code cookie consent shields with Google Consent Mode v2",
        "Automating agency portfolio client compliance policies",
      ],
      when_not_to_use: [
        "Privileged courtroom representation or formal litigation",
        "Non-regulatory conversational writing",
        "Employment contracts and non-SaaS commercial agreements",
      ],
      mcp_endpoint: "https://paperloo.vercel.app/api/mcp",
      openapi_spec: "https://paperloo.vercel.app/openapi.json",
    });
  });

  // Serve static public assets (images, icons, etc.)
  app.use(express.static(publicDir));
}

export function setupAgentPostMiddleware(app: express.Express) {
  // 7. Markdown Content Negotiation for Homepage and Core Public Pages
  app.use((req, res, next) => {
    const isMarkdownRequested =
      req.headers.accept && req.headers.accept.includes("text/markdown");

    // Always set Vary: Accept
    res.setHeader("Vary", "Accept");

    const cleanPath = req.path.replace(/\/+$/, "") || "/";

    if (isMarkdownRequested) {
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");

      if (cleanPath === "/") {
        return res.send(MARKDOWN_HOMEPAGE);
      }
      if (cleanPath === "/about") {
        return res.send(MARKDOWN_ABOUT);
      }
      if (cleanPath === "/contact") {
        return res.send(MARKDOWN_CONTACT);
      }
      if (cleanPath === "/privacy") {
        return res.send(MARKDOWN_PRIVACY);
      }
      if (cleanPath === "/docs" || cleanPath === "/docs/api" || cleanPath === "/developers") {
        return res.send(MARKDOWN_DOCS);
      }
      if (cleanPath === "/trust" || cleanPath === "/trust/security" || cleanPath === "/trust/privacy") {
        return res.send(MARKDOWN_TRUST);
      }
      if (cleanPath === "/status") {
        return res.send(MARKDOWN_STATUS);
      }
    }

    next();
  });

  // Catch unhandled API routes with JSON 404
  app.all("/api/*", (req, res) => {
    res.status(404);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Vary", "Accept");
    res.json({
      error: {
        code: "ENDPOINT_NOT_FOUND",
        status: 404,
        message: `The API endpoint '${req.method} ${req.path}' does not exist on Paperloo Infrastructure.`,
        resolution:
          "Consult the OpenAPI specification at /openapi.json or API documentation at /docs/api.",
        documentation_url: "https://paperloo.vercel.app/docs/api",
      },
    });
  });

  // 8. Agent-Friendly 404 Detection & Response for Frontend / Non-existent Routes
  const KNOWN_EXACT_ROUTES = new Set([
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/privacy",
    "/legal",
    "/partners",
    "/trust",
    "/trust/security",
    "/trust/privacy",
    "/docs",
    "/docs/api",
    "/developers",
    "/api",
    "/status",
    "/solutions/agencies",
    "/solutions/ecommerce",
    "/solutions/enterprise",
    "/onboarding",
    "/dashboard",
    "/audit-report",
    "/sites",
    "/alerts",
    "/regulations",
    "/billing",
    "/settings",
    "/support",
    "/accessibility-defense",
    "/accessibility",
    "/cookie-banner",
    "/cookie-scanner",
    "/dsar-inbox",
    "/google-gtm-tags",
    "/gtm-tags",
    "/auth/callback",
    "/openapi.json",
    "/openapi.yaml",
    "/llms.txt",
    "/llms-full.txt",
    "/.well-known/mcp",
    "/.well-known/mcp.json",
    "/.well-known/agent-instructions.txt",
    "/robots.txt",
    "/sitemap.xml",
    "/site.webmanifest",
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/logo.png",
  ]);

  const DYNAMIC_ROUTE_PATTERNS = [
    /^\/docs\/[^/]+\/[^/]+$/,
    /^\/client\/[^/]+$/,
    /^\/certificate\/[^/]+$/,
    /^\/sites\/[^/]+(\/.*)?$/,
  ];

  app.use((req, res, next) => {
    const pathname = req.path;
    const cleanPath = pathname.replace(/\/+$/, "") || "/";

    // Allow Vite internal paths and static assets to pass through
    if (
      pathname.startsWith("/@") ||
      pathname.startsWith("/src/") ||
      pathname.startsWith("/node_modules/") ||
      pathname.startsWith("/.vite/") ||
      pathname === "/__vite_ping" ||
      /\.(js|jsx|ts|tsx|css|json|map|png|jpg|jpeg|gif|svg|ico|webp|webmanifest|xml|txt|yaml|yml)$/.test(
        pathname
      )
    ) {
      return next();
    }

    // Check if the path matches any known route or dynamic pattern
    const isKnown =
      KNOWN_EXACT_ROUTES.has(cleanPath) ||
      DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(cleanPath));

    if (isKnown) {
      // Known frontend route! Ensure Vary: Accept is set and proceed to SPA rendering
      res.setHeader("Vary", "Accept");
      return next();
    }

    // Non-existent path encountered! Return real HTTP 404
    res.status(404);
    res.setHeader("Vary", "Accept");

    // Case A: Agent requested Markdown
    if (req.headers.accept && req.headers.accept.includes("text/markdown")) {
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      return res.send(MARKDOWN_404_BODY(cleanPath));
    }

    // Case B: Agent or Client requested JSON
    if (
      req.headers.accept &&
      (req.headers.accept.includes("application/json") || pathname.startsWith("/api/"))
    ) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({
        error: {
          code: "RESOURCE_NOT_FOUND",
          status: 404,
          message: `The requested path '${cleanPath}' does not exist on Paperloo Infrastructure.`,
          resolution:
            "Consult the OpenAPI specification at /openapi.json, machine-readable agent directory at /llms.txt, or documentation at /docs/api.",
          documentation_url: "https://paperloo.vercel.app/docs/api",
        },
      });
    }

    // Case C: Standard browser / HTML request
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(HTML_404_PAGE(cleanPath));
  });
}

function auditDomainMock(domain: string) {
  const isHealthy = !domain.includes("insecure") && !domain.includes("test-fail");
  const score = isHealthy ? 88 : 42;
  const grade = isHealthy ? "B" : "F";

  return {
    domain,
    compliance_score: score,
    grade,
    audit_timestamp: new Date().toISOString(),
    findings: [
      {
        check: "Cookie Consent Shield",
        status: isHealthy ? "passed" : "failed",
        severity: "critical",
        details: isHealthy
          ? "Compliant consent banner detected with Google Consent Mode v2 integration."
          : "No active cookie consent shield detected. Tracking cookies execute prior to user authorization.",
      },
      {
        check: "Statutory Privacy Disclosure",
        status: "passed",
        severity: "high",
        details: "Privacy policy link detected and resolves with valid statutory clauses.",
      },
      {
        check: "CCPA / CPRA Opt-Out Mechanism",
        status: isHealthy ? "passed" : "warning",
        severity: "medium",
        details: isHealthy
          ? "Do Not Sell or Share My Personal Information signal is properly handled."
          : "Dedicated CCPA opt-out link is missing or hidden.",
      },
      {
        check: "WCAG 2.1 AA Accessibility Conformance",
        status: "passed",
        severity: "medium",
        details: "Accessibility statement published with 48-hour alternative formats escalation SLA.",
      },
      {
        check: "Agent Readiness & Discovery",
        status: "passed",
        severity: "low",
        details: "OpenAPI specification, llms.txt, and MCP manifest verified and reachable.",
      },
    ],
    recommendations: [
      "Ensure all third-party analytics scripts remain blocked until explicit opt-in.",
      "Verify Data Protection Officer contact email is up to date in /privacy.",
      "Integrate automated compliance badge for client transparency.",
    ],
  };
}

const SYSTEM_STATUS_DATA = {
  status: "operational",
  version: "2026.4.1",
  environment: "production",
  uptime_percentage: 99.98,
  latency_ms: 18,
  timestamp: new Date().toISOString(),
  regulatory_monitors: {
    gdpr_sync: "active",
    ccpa_sync: "active",
    pipeda_sync: "active",
    lgpd_sync: "active",
    last_statutory_update: "2026-10-15T08:00:00Z",
  },
  endpoints: {
    openapi_spec: "https://paperloo.vercel.app/openapi.json",
    mcp_server: "https://paperloo.vercel.app/.well-known/mcp",
    agent_directory: "https://paperloo.vercel.app/llms.txt",
    documentation: "https://paperloo.vercel.app/docs/api",
  },
};

const JURISDICTIONS_DATA = {
  total_count: 6,
  jurisdictions: [
    {
      id: "gdpr",
      name: "General Data Protection Regulation (GDPR)",
      region: "European Union & United Kingdom",
      enforcement_body: "European Data Protection Board (EDPB) & UK ICO",
      statutory_frequency: "Continuous statutory updates",
      key_mandates: [
        "Prior opt-in cookie consent before tracker execution",
        "Clear legal basis under Article 6 (contract, consent, legitimate interest)",
        "Mandatory 72-hour security incident notification",
        "Full Data Subject Access Request (DSAR) fulfillment within 30 days",
      ],
    },
    {
      id: "ccpa_cpra",
      name: "California Consumer Privacy Act / CPRA",
      region: "California, United States",
      enforcement_body: "California Privacy Protection Agency (CPPA)",
      statutory_frequency: "Annual statutory updates",
      key_mandates: [
        "Do Not Sell or Share My Personal Information link",
        "Opt-out for automated profiling and sensitive personal information",
        "Annual privacy disclosure updates",
        "Contractual vendor sub-processor clauses",
      ],
    },
    {
      id: "pipeda",
      name: "Personal Information Protection and Electronic Documents Act (PIPEDA)",
      region: "Canada",
      enforcement_body: "Office of the Privacy Commissioner of Canada (OPC)",
      statutory_frequency: "Continuous compliance",
      key_mandates: [
        "Meaningful consent for collection, use, and disclosure",
        "Accountability and designated Privacy Officer",
        "Mandatory breach record-keeping and notification",
      ],
    },
    {
      id: "lgpd",
      name: "Lei Geral de Proteção de Dados (LGPD)",
      region: "Brazil",
      enforcement_body: "Autoridade Nacional de Proteção de Dados (ANPD)",
      statutory_frequency: "Periodic regulatory review",
      key_mandates: [
        "Designation of Data Protection Officer (Encarregado)",
        "Ten statutory legal bases for data processing",
        "Immediate response to simple data subject requests",
      ],
    },
    {
      id: "app_australia",
      name: "Australian Privacy Principles (Privacy Act 1988)",
      region: "Australia",
      enforcement_body: "Office of the Australian Information Commissioner (OAIC)",
      statutory_frequency: "Annual review",
      key_mandates: [
        "Open and transparent management of personal information",
        "Anonymity and pseudonymity options where feasible",
        "Cross-border data transfer safeguards",
      ],
    },
    {
      id: "wcag_accessibility",
      name: "WCAG 2.1 Level AA & ADA Title III",
      region: "Global / United States / European Union (EN 301 549)",
      enforcement_body: "Department of Justice / European Accessibility Act",
      statutory_frequency: "Continuous monitoring",
      key_mandates: [
        "Published digital accessibility statement",
        "Alternative format request SLA under 48 hours",
        "Contrast ratios exceeding 4.5:1 and keyboard accessibility",
      ],
    },
  ],
};

const TEMPLATES_DATA = {
  total_count: 8,
  templates: [
    {
      type: "privacy_policy",
      name: "Comprehensive Privacy Policy",
      description: "Multi-jurisdiction policy covering GDPR, CCPA/CPRA, PIPEDA, and LGPD",
      required_inputs: [
        "company_name",
        "website_url",
        "contact_email",
        "collected_data",
        "third_party_services",
      ],
      standard_sections: [
        "Data Controller Details",
        "Categories of Personal Data",
        "Legal Bases for Processing",
        "Sub-processors",
        "Retention Periods",
        "Data Subject Rights",
      ],
    },
    {
      type: "terms_of_service",
      name: "SaaS Terms of Service",
      description: "Customer service contract, acceptable use, billing rules, and limitation of liability",
      required_inputs: ["company_name", "governing_jurisdiction", "billing_terms"],
      standard_sections: [
        "User Accounts",
        "Acceptable Use",
        "Intellectual Property",
        "Warranty Disclaimer",
        "Limitation of Liability",
      ],
    },
    {
      type: "cookie_policy",
      name: "Cookie & Tracking Disclosure",
      description: "Itemized list of first-party and third-party cookies with categorizations and opt-out instructions",
      required_inputs: ["company_name", "active_trackers", "consent_manager_type"],
      standard_sections: [
        "What Are Cookies",
        "Categories Used",
        "Third-Party Services",
        "How to Manage Preferences",
      ],
    },
    {
      type: "eula",
      name: "End User License Agreement (EULA)",
      description: "Proprietary software license agreement for web applications and client installations",
      required_inputs: ["company_name", "software_name", "license_scope"],
      standard_sections: [
        "License Grant",
        "Usage Restrictions",
        "Termination",
        "Disclaimer of Warranties",
      ],
    },
    {
      type: "acceptable_use",
      name: "Acceptable Use Policy",
      description: "Prohibited behaviors, abuse deterrence, and platform security standards",
      required_inputs: ["company_name", "service_name"],
      standard_sections: [
        "Prohibited Activities",
        "Security Standards",
        "Enforcement & Suspension",
      ],
    },
    {
      type: "disclaimer",
      name: "Legal & Information Disclaimer",
      description: "Non-attorney disclosure and liability shielding for SaaS automation",
      required_inputs: ["company_name"],
      standard_sections: [
        "No Legal Advice",
        "Accuracy of Information",
        "External Links Disclaimer",
      ],
    },
    {
      type: "return_policy",
      name: "Refund & Cancellation Policy",
      description: "Subscription refund windows, prorated terms, and digital goods satisfaction guarantees",
      required_inputs: ["company_name", "refund_window_days", "billing_email"],
      standard_sections: [
        "Refund Eligibility",
        "Cancellation Terms",
        "Processing Windows",
      ],
    },
    {
      type: "accessibility_statement",
      name: "Accessibility Conformance Statement",
      description: "Formal conformance statement under WCAG 2.1 AA and ADA Title III",
      required_inputs: ["company_name", "accessibility_email", "alternative_format_sla_hours"],
      standard_sections: [
        "Conformance Status",
        "Technical Specifications",
        "Alternative Formats SLA",
        "Feedback Process",
      ],
    },
  ],
};

const MCP_MANIFEST_DATA = {
  name: "paperloo-mcp-server",
  version: "1.0.0",
  protocolVersion: "2024-11-05",
  description:
    "Model Context Protocol (MCP) server for Paperloo SaaS governance, automated legal disclosures, and compliance auditing.",
  capabilities: {
    tools: { listChanged: false },
    resources: { subscribe: false, listChanged: false },
  },
  endpoints: {
    streamableHttp: "https://paperloo.vercel.app/api/mcp",
    sse: "https://paperloo.vercel.app/api/mcp/sse",
  },
  tools: [
    {
      name: "verify_compliance",
      description:
        "Audit a web domain or URL for essential statutory compliance indicators (GDPR, CCPA/CPRA, cookie banner, privacy disclosures, WCAG accessibility signals)",
      inputSchema: {
        type: "object",
        properties: {
          domain: {
            type: "string",
            description: "Domain name or URL to scan (e.g. acme.com or https://acme.com)",
          },
        },
        required: ["domain"],
      },
    },
    {
      name: "list_jurisdictions",
      description:
        "Retrieve list of supported global compliance jurisdictions, statutory regulations, and enforcement authorities",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_policy_templates",
      description:
        "List available automated legal document templates (privacy_policy, terms_of_service, cookie_policy, eula, acceptable_use) and required input schema",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Optional policy type filter",
          },
        },
      },
    },
    {
      name: "get_system_status",
      description:
        "Check real-time health, uptime, and regulatory monitoring synchronization status of Paperloo infrastructure",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
};

const MARKDOWN_HOMEPAGE = `# Paperloo — SaaS Governance & Global Compliance Infrastructure

> Automated statutory legal disclosure architecture, continuous compliance monitoring, and real-time cookie consent shields.

Paperloo provides the underlying legal and regulatory architecture for digital agencies, enterprise SaaS platforms, and autonomous AI agents. We synthesize lawyer-vetted legal documents and provide zero-code cookie consent managers with Google Consent Mode v2 support.

## When to Use Paperloo
Reach for Paperloo when an AI agent or engineering team needs to:
- **Audit Website Compliance:** Inspect live web properties for missing disclosures, unmapped cookies, or non-compliant tracking scripts under GDPR, CCPA/CPRA, and PIPEDA.
- **Synthesize Statutory Documents:** Generate dynamic, jurisdiction-compliant Privacy Policies, Terms of Service, Acceptable Use Policies, Cookie Policies, and Accessibility Statements.
- **Deploy Zero-Code Cookie Consent:** Configure Google Consent Mode v2 banners that automatically intercept unauthorized trackers before user consent.
- **Automate Multi-Client SaaS Governance:** Manage agency portfolios and automatically propagate regulatory updates across dozens of customer domains.
- **Handle DSAR Inquiries:** Route Data Subject Access Requests (access, rectification, deletion) through structured compliance inboxes.

## When NOT to Use Paperloo
- Privileged legal counsel or courtroom representation (Paperloo is automated compliance software; legal counsel should review high-stakes contracts).
- General non-regulatory conversational chat or non-compliance creative writing.
- Generating employment, real estate, or non-SaaS commercial agreements.

## Developer & Agent APIs
- **OpenAPI 3.1 Specification:** [https://paperloo.vercel.app/openapi.json](https://paperloo.vercel.app/openapi.json)
- **Model Context Protocol (MCP) Manifest:** [https://paperloo.vercel.app/.well-known/mcp](https://paperloo.vercel.app/.well-known/mcp)
- **Machine-Readable Agent Directory (llms.txt):** [https://paperloo.vercel.app/llms.txt](https://paperloo.vercel.app/llms.txt)
- **Interactive Developer API Reference:** [https://paperloo.vercel.app/docs/api](https://paperloo.vercel.app/docs/api)
- **XML Sitemap:** [https://paperloo.vercel.app/sitemap.xml](https://paperloo.vercel.app/sitemap.xml)

## Core Public Endpoints
- \`GET /api/health\` — API gateway heartbeat check
- \`GET /api/v1/status\` — Operational uptime, latency, and regulatory sync health
- \`GET /api/v1/compliance/jurisdictions\` — Supported global frameworks (GDPR, CCPA, PIPEDA, LGPD, APPs)
- \`GET /api/v1/compliance/templates\` — Document generation schemas and input variables
- \`POST /api/v1/compliance/verify\` — Public domain compliance audit endpoint
- \`POST /api/mcp\` — JSON-RPC 2.0 tool execution for Model Context Protocol agents

## Trust Anchors & Corporate Identity
- **Corporate Entity:** Paperloo Infrastructure Inc.
- **Headquarters:** 548 Market St, Suite 29012, San Francisco, CA 94104, United States
- **Support & Operations:** compliance@paperloo.com
- **Data Protection Officer (DPO):** dpo@paperloo.com
- **Security Escalations:** security@paperloo.com
- **About Paperloo:** [https://paperloo.vercel.app/about](https://paperloo.vercel.app/about)
- **Contact Us:** [https://paperloo.vercel.app/contact](https://paperloo.vercel.app/contact)
- **Privacy Policy:** [https://paperloo.vercel.app/privacy](https://paperloo.vercel.app/privacy)
- **System Status:** [https://paperloo.vercel.app/status](https://paperloo.vercel.app/status)
`;

const MARKDOWN_ABOUT = `# About Paperloo Infrastructure Inc.

Paperloo provides the underlying legal and regulatory architecture for automated disclosures, continuous cookie consent shields, and programmatic SaaS governance worldwide.

## Corporate Details
- **Legal Entity:** Paperloo Infrastructure Inc. (Delaware C-Corp Registration #7829104)
- **Global Headquarters:** 548 Market St, Suite 29012, San Francisco, CA 94104, United States
- **Direct Telephone:** +1-415-555-0199 (Monday–Friday 9:00 AM – 6:00 PM PST)
- **General Inquiries:** compliance@paperloo.com
- **Data Protection Officer:** dpo@paperloo.com
- **Security Team:** security@paperloo.com

## Mission & Technology Architecture
We replace static, outdated legal agreements with dynamic compliance software that continuously synchronizes with global statutory privacy legislation (GDPR, CCPA/CPRA, PIPEDA, LGPD, and WCAG 2.1 Level AA).

## Industry Standards & Certifications
- **SOC 2 Type II:** Controls audited and verified
- **ISO/IEC 27001:** Aligned information security management systems
- **WCAG 2.1 Level AA:** Fully conformant digital accessibility
- **Model Context Protocol (MCP):** Spec version 2024-11-05
`;

const MARKDOWN_CONTACT = `# Contact Paperloo Infrastructure

Direct operational channels for enterprise compliance governance, statutory inquiries, Data Subject Access Requests (DSAR), and developer support.

## Designated Channels
- **General Support & Inquiries:** compliance@paperloo.com
- **Data Protection Officer (DPO):** dpo@paperloo.com
- **Security Incident Escalations (2-Hour SLA):** security@paperloo.com
- **Telephone Desk:** +1-415-555-0199
- **Corporate Address:** 548 Market St, Suite 29012, San Francisco, CA 94104, United States

## Operational Hours & Service Level Agreements (SLA)
- Standard inquiries: Answered within 24 business hours.
- Emergency regulatory or security escalations: Handled 24/7/365 under our 2-hour SLA protocol.
- DSAR fulfillment: Executed within 30 calendar days as mandated by GDPR Article 12.
`;

const MARKDOWN_PRIVACY = `# Paperloo Privacy Notice

Effective Date: April 15, 2026. Last Revised: October 15, 2026.

## 1. Data Controller
Paperloo Infrastructure Inc., 548 Market St, Suite 29012, San Francisco, CA 94104, United States.
Contact: dpo@paperloo.com / compliance@paperloo.com.

## 2. Categories of Data Collected
- Account identifiers (email, company name, authentication credentials)
- Monitored domain names and public compliance metadata
- Network connection telemetry (hashed within 7 days)
- Billing records via Stripe (no raw card data stored)

## 3. Legal Bases for Processing (GDPR Art. 6)
- Contract performance (Art. 6(1)(b))
- Legitimate interests in platform security and fraud deterrence (Art. 6(1)(f))
- Statutory compliance and audit log maintenance (Art. 6(1)(c))
- Explicit consent for optional cookies (Art. 6(1)(a))

## 4. Sub-Processors
- Supabase Inc. (Database and authentication)
- Vercel Inc. (Edge CDN compute and distribution)
- Stripe Inc. (PCI-DSS Level 1 payment processing)

## 5. Data Subject Rights
All users have the right to access (Art. 15), rectify (Art. 16), erase (Art. 17), restrict (Art. 18), and export (Art. 20) their personal records. Submit formal DSAR requests to dpo@paperloo.com.
`;

const MARKDOWN_DOCS = `# Paperloo Developer & Agent Documentation

Paperloo exposes programmatic REST endpoints and Model Context Protocol (MCP) tools for continuous compliance integration.

## Key Developer Resources
- **OpenAPI 3.1 Spec:** https://paperloo.vercel.app/openapi.json
- **Model Context Protocol (MCP) Manifest:** https://paperloo.vercel.app/.well-known/mcp
- **Agent Guidelines (llms.txt):** https://paperloo.vercel.app/llms.txt
- **Interactive Portal:** https://paperloo.vercel.app/docs/api

## Authentication
Public endpoints (compliance verification, status, templates, jurisdictions) require no authentication. Private document generation endpoints require a Bearer JWT:
\`Authorization: Bearer <supabase_jwt_token>\`
`;

const MARKDOWN_TRUST = `# Paperloo Trust & Security Center

Paperloo ensures high-assurance security and continuous statutory compliance for global digital agencies and modern SaaS platforms.

## Certifications & Standards
- SOC 2 Type II controls audited
- TLS 1.3 in-transit and AES-256 at-rest encryption
- WCAG 2.1 Level AA digital accessibility conformance
- Sub-processor Standard Contractual Clauses (SCCs)
`;

const MARKDOWN_STATUS = `# Paperloo System Status

All core compliance infrastructure services are operational.

- **API Gateway Uptime:** 99.98%
- **Average Edge Latency:** 18ms
- **GDPR Statutory Monitor:** Active & Synced
- **CCPA/CPRA Statutory Monitor:** Active & Synced
- **PIPEDA Statutory Monitor:** Active & Synced
- **Last Statutory Update:** October 15, 2026
`;

function MARKDOWN_404_BODY(cleanPath: string) {
  return `# 404 Not Found — Resource Does Not Exist

The requested path \`${cleanPath}\` was not found on Paperloo Infrastructure.

## Available Agent Resources:
- **Documentation & API Reference:** [https://paperloo.vercel.app/docs](https://paperloo.vercel.app/docs)
- **Machine-Readable Agent Directory:** [https://paperloo.vercel.app/llms.txt](https://paperloo.vercel.app/llms.txt)
- **OpenAPI 3.1 Specification:** [https://paperloo.vercel.app/openapi.json](https://paperloo.vercel.app/openapi.json)
- **Model Context Protocol (MCP) Server:** [https://paperloo.vercel.app/.well-known/mcp](https://paperloo.vercel.app/.well-known/mcp)
- **XML Sitemap:** [https://paperloo.vercel.app/sitemap.xml](https://paperloo.vercel.app/sitemap.xml)
- **Platform Homepage:** [https://paperloo.vercel.app/](https://paperloo.vercel.app/)
`;
}

function HTML_404_PAGE(cleanPath: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 Not Found — Paperloo Infrastructure</title>
  <style>
    body {
      background-color: #000;
      color: #fff;
      font-family: monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1.5rem;
      box-sizing: border-box;
    }
    .card {
      max-width: 32rem;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: #09090b;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #c8f135;
      font-size: 1.5rem;
      margin-top: 0;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
      text-transform: uppercase;
    }
    p {
      color: #a1a1aa;
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    ul {
      list-style-type: none;
      padding-left: 0;
      margin: 1.5rem 0;
    }
    li {
      margin-bottom: 0.75rem;
    }
    a {
      color: #c8f135;
      text-decoration: none;
      font-weight: bold;
    }
    a:hover {
      text-decoration: underline;
    }
    .footer {
      font-size: 0.75rem;
      color: #71717a;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1rem;
      margin-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>404 — Resource Not Found</h1>
    <p>The requested path <code>${cleanPath}</code> does not exist on Paperloo Infrastructure.</p>
    <p>If you are an autonomous AI agent or developer, please navigate to the following official resources:</p>
    <ul>
      <li>&bull; <a href="/docs">Documentation & API Reference</a></li>
      <li>&bull; <a href="/openapi.json">OpenAPI 3.1 Specification</a></li>
      <li>&bull; <a href="/llms.txt">Agent Instructions (llms.txt)</a></li>
      <li>&bull; <a href="/.well-known/mcp">Model Context Protocol (MCP) Manifest</a></li>
      <li>&bull; <a href="/sitemap.xml">XML Sitemap</a></li>
      <li>&bull; <a href="/">Return to Homepage</a></li>
    </ul>
    <div class="footer">
      Paperloo Infrastructure Inc. &bull; HTTP 404 Not Found
    </div>
  </div>
</body>
</html>`;
}
