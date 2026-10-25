import {
  MCP_TOOLS,
  MCP_RESOURCES,
  MCP_PROMPTS,
  executeTool,
  readResource,
  activeSites
} from "./mcpRegistry.ts";

async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: any) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => {
      resolve({});
    });
  });
}

export default async function handler(req: any, res: any) {
  // 1. Universal CORS Configuration for MCP Playground, Claude Desktop, Cursor, and Agents
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, mcp-session-id, Accept, Last-Event-ID");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Accept, Content-Type, Authorization");

  // Handle CORS preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2. Authorization Check: Public by default (No API key required!)
  const authHeader = req.headers["authorization"] || req.headers["x-api-key"];
  let callerInfo = "public_agent";
  if (authHeader) {
    const key = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    callerInfo = key.replace(/^Bearer\s+/i, "").trim().slice(0, 12) + "...";
  }

  // 3. Handle GET requests (Health inspection or SSE stream)
  if (req.method === "GET") {
    const accept = (req.headers["accept"] || "").toString();
    if (accept.includes("text/event-stream")) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`event: endpoint\ndata: https://paperloo.vercel.app/api/mcp\n\n`);
      return res.end();
    }

    return res.status(200).json({
      name: "io.github.yassinemohamedali11/paperloo",
      title: "Paperloo Compliance Infrastructure MCP Server",
      status: "active",
      protocolVersion: "2024-11-05",
      authRequired: false,
      authenticatedCaller: callerInfo,
      capabilities: {
        tools: { count: MCP_TOOLS.length },
        resources: { count: MCP_RESOURCES.length },
        prompts: { count: MCP_PROMPTS.length }
      },
      endpoints: {
        rpc: "https://paperloo.vercel.app/api/mcp",
        manifest: "https://paperloo.vercel.app/server.json",
        openapi: "https://paperloo.vercel.app/openapi.json",
        docs: "https://paperloo.vercel.app/docs"
      }
    });
  }

  // 4. Handle POST requests (JSON-RPC 2.0 Streamable HTTP Transport)
  if (req.method === "POST") {
    try {
      const parsed = await parseBody(req);
      if (parsed === null) {
        return res.status(400).json({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Parse error: Invalid JSON payload."
          }
        });
      }

      const body = parsed || {};
      const method = body.method;
      const id = body.id !== undefined ? body.id : 1;
      const params = body.params || {};

      res.setHeader("Content-Type", "application/json; charset=utf-8");

      // MCP Initialize Handshake
      if (method === "initialize") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: params.protocolVersion || "2024-11-05",
            capabilities: {
              tools: { listChanged: true },
              resources: { subscribe: true, listChanged: true },
              prompts: { listChanged: true }
            },
            serverInfo: {
              name: "io.github.yassinemohamedali11/paperloo",
              version: "1.0.0"
            }
          }
        });
      }

      // Initialized Notification
      if (method === "notifications/initialized") {
        return res.status(200).json({ jsonrpc: "2.0", id, result: {} });
      }

      // Ping
      if (method === "ping") {
        return res.status(200).json({ jsonrpc: "2.0", id, result: {} });
      }

      // Tools List
      if (method === "tools/list") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        });
      }

      // Tools Call
      if (method === "tools/call") {
        const toolName = params.name;
        const toolArgs = params.arguments || {};
        const toolResult = await executeTool(toolName, toolArgs);
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(toolResult, null, 2)
              }
            ]
          }
        });
      }

      // Resources List
      if (method === "resources/list") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            resources: MCP_RESOURCES
          }
        });
      }

      // Resources Read
      if (method === "resources/read") {
        const uri = params.uri;
        const resourceData = readResource(uri);
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [resourceData]
          }
        });
      }

      // Prompts List
      if (method === "prompts/list") {
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            prompts: MCP_PROMPTS
          }
        });
      }

      // Prompts Get
      if (method === "prompts/get") {
        const promptName = params.name;
        const args = params.arguments || {};
        let messages: any[] = [];
        if (promptName === "audit-website") {
          messages = [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please audit the compliance of website '${args.url}' for GDPR, CCPA, and Google Consent Mode v2 using the audit_site tool.`
              }
            }
          ];
        } else if (promptName === "onboard-new-client-site") {
          messages = [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please onboard '${args.company_name}' (${args.website_url}) into Paperloo: add the site, retrieve questionnaire schema, generate the legal document suite, and configure Google Consent Mode v2 with GTM integration.`
              }
            }
          ];
        } else {
          messages = [
            {
              role: "user",
              content: {
                type: "text",
                text: `Generate a complete legal compliance suite for '${args.company_name}' (${args.website_url}).`
              }
            }
          ];
        }
        return res.status(200).json({
          jsonrpc: "2.0",
          id,
          result: {
            description: `Prompt for ${promptName}`,
            messages
          }
        });
      }

      // Unknown Method
      return res.status(200).json({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Method '${method}' not found. Supported methods: initialize, ping, tools/list, tools/call, resources/list, resources/read, prompts/list, prompts/get.`
        }
      });
    } catch (err: any) {
      console.error("[MCP] Handler error:", err);
      return res.status(200).json({
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: -32603,
          message: err?.message || "Internal MCP Server Error"
        }
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
}
