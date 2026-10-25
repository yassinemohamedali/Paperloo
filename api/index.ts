// Safe serverless fallback for /api on Vercel
export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "ok",
    service: "Paperloo Compliance Infrastructure",
    version: "2.4.0",
    endpoints: {
      mcp: "/api/mcp",
      manifest: "/server.json",
      openapi: "/openapi.json",
      docs: "/docs"
    }
  });
}
