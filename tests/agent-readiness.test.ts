import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import app from '../server.js';
import http from 'node:http';

// Helper to make local in-process HTTP requests to the express app
function request(
  server: http.Server,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const address = server.address() as any;
    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        path,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: data,
          });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      if (typeof options.body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(options.body));
      } else {
        req.write(options.body);
      }
    }

    req.end();
  });
}

describe('Is Agentic Readiness Test Suite (Ora Audit Fixes)', async () => {
  let server: http.Server;

  // Start test server on random ephemeral port
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });

  // 1. Agent-friendly 404s
  it('1. Agent-friendly 404: Returns real HTTP 404 status and Markdown body for unknown paths', async () => {
    const res = await request(server, '/some-path-that-does-not-exist', {
      headers: { Accept: 'text/markdown' },
    });

    assert.strictEqual(res.status, 404, 'Must return HTTP 404');
    assert.ok(
      res.headers['content-type']?.includes('text/markdown'),
      'Content-Type must be text/markdown'
    );
    assert.ok(
      res.headers['vary']?.toLowerCase().includes('accept'),
      'Vary header must include Accept'
    );
    assert.ok(res.body.length >= 20, 'Markdown error body must be at least 20 characters');
    assert.ok(
      res.body.includes('/docs') || res.body.includes('/llms.txt') || res.body.includes('/sitemap.xml'),
      'Markdown error body must point agents to docs, sitemap, or llms.txt'
    );
  });

  it('1b. Agent-friendly 404: Returns HTTP 404 for standard browser requests', async () => {
    const res = await request(server, '/completely-unknown-resource-xyz', {
      headers: { Accept: 'text/html' },
    });
    assert.strictEqual(res.status, 404, 'Must return HTTP 404');
    assert.ok(res.body.includes('404'), 'HTML body mentions 404');
  });

  // 2. Content is available without JavaScript
  it('2. Content is available without JavaScript: Serves >= 500 chars raw HTML with H1', async () => {
    const indexPath = path.join(process.cwd(), 'index.html');
    const rawHtml = fs.readFileSync(indexPath, 'utf-8');

    // Extract content inside #root
    const rootMatch = rawHtml.match(/<div id="root">([\s\S]*?)<\/div>/);
    assert.ok(rootMatch, 'index.html must have #root container');
    const rootContent = rootMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    assert.ok(
      rootContent.length >= 500,
      `Raw HTML text content must be at least 500 chars (got ${rootContent.length})`
    );
    assert.ok(rawHtml.includes('<h1'), 'Raw HTML must contain an H1 heading');
    assert.ok(rawHtml.includes('<h2'), 'Raw HTML must contain sequential H2 headings');
  });

  // 3, 12, 13. OpenAPI spec published, complex schema, function calling
  it('3 & 12 & 13. OpenAPI spec published, self-describing, and function-calling compatible', async () => {
    const res = await request(server, '/openapi.json', {
      headers: { Accept: 'application/json' },
    });
    assert.strictEqual(res.status, 200);
    const spec = JSON.parse(res.body);

    assert.ok(spec.openapi && spec.openapi.startsWith('3.'), 'Must be OpenAPI 3.x');
    assert.ok(spec.paths && Object.keys(spec.paths).length >= 5, 'Must specify API paths');

    // Check operationIds and function calling compatibility
    for (const [pathKey, pathItem] of Object.entries(spec.paths as any)) {
      for (const [method, op] of Object.entries(pathItem as any)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          const operation = op as any;
          assert.ok(
            operation.operationId,
            `Endpoint ${method.toUpperCase()} ${pathKey} must have unique operationId`
          );
          assert.ok(operation.summary || operation.description, `Endpoint ${pathKey} must have a description`);
        }
      }
    }
  });

  // 4. JSON error responses
  it('4. JSON error responses: Returns structured JSON with code, message, resolution', async () => {
    const res = await request(server, '/api/nonexistent-endpoint-test', {
      headers: { Accept: 'application/json' },
    });
    assert.strictEqual(res.status, 404);
    assert.ok(res.headers['content-type']?.includes('application/json'));
    const data = JSON.parse(res.body);
    assert.ok(data.error, 'Must have top-level error object');
    assert.ok(data.error.code, 'Error must have a machine-readable code');
    assert.ok(data.error.message, 'Error must have an explanation message');
    assert.ok(data.error.resolution, 'Error must provide an actionable resolution');
    assert.ok(data.error.documentation_url, 'Error must provide documentation_url');
  });

  // 5. Markdown content negotiation (acceptmarkdown.com)
  it('5. Markdown content negotiation: Accept: text/markdown returns markdown with Vary: Accept', async () => {
    // Check markdown response
    const mdRes = await request(server, '/', {
      headers: { Accept: 'text/markdown' },
    });
    assert.strictEqual(mdRes.status, 200);
    assert.ok(
      mdRes.headers['content-type']?.includes('text/markdown'),
      'Content-Type must be text/markdown'
    );
    assert.ok(
      mdRes.headers['vary']?.toLowerCase().includes('accept'),
      'Vary header must contain Accept'
    );
    assert.ok(mdRes.body.length >= 100, 'Markdown body must not be empty');
    assert.ok(mdRes.body.includes('# Paperloo'), 'Markdown body contains Paperloo header');
  });

  // 6. Public API with reachable endpoints
  it('6. Public API with reachable endpoints: /api/v1/compliance/jurisdictions and /api/v1/status', async () => {
    const statusRes = await request(server, '/api/v1/status');
    assert.strictEqual(statusRes.status, 200);
    const statusData = JSON.parse(statusRes.body);
    assert.strictEqual(statusData.status, 'operational');

    const jurRes = await request(server, '/api/v1/compliance/jurisdictions');
    assert.strictEqual(jurRes.status, 200);
    const jurData = JSON.parse(jurRes.body);
    assert.ok(Array.isArray(jurData.jurisdictions) && jurData.jurisdictions.length > 0);

    const verifyRes = await request(server, '/api/v1/compliance/verify', {
      method: 'POST',
      body: { domain: 'test.com' },
    });
    assert.strictEqual(verifyRes.status, 200);
    const verifyData = JSON.parse(verifyRes.body);
    assert.ok(typeof verifyData.compliance_score === 'number');
  });

  // 7, 8, 9. Developer resource discoverability & Brand name
  it('7, 8, 9. Discoverability: /llms.txt, brand title, and documentation links exist', async () => {
    const llmsRes = await request(server, '/llms.txt');
    assert.strictEqual(llmsRes.status, 200);
    assert.ok(llmsRes.body.includes('When to Use Paperloo'));

    const rawHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
    assert.ok(rawHtml.includes('Paperloo — SaaS Governance & Global Compliance Infrastructure'));
    assert.ok(rawHtml.includes('/docs'));
    assert.ok(rawHtml.includes('/openapi.json'));
  });

  // 10. Agent instruction / when-to-use
  it('10. Agent instruction / when-to-use in llms.txt', async () => {
    const res = await request(server, '/llms.txt');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.includes('When to Use Paperloo'), 'Must have "When to Use" section');
    assert.ok(res.body.includes('When NOT to Use Paperloo'), 'Must have "When NOT to Use" section');
    assert.ok(res.body.includes('How AI Agents Should Call Paperloo'), 'Must have agent call instructions');
  });

  // 11. Trust anchor pages
  it('11. Trust anchor pages: /about, /contact, /privacy have >= 500 characters', async () => {
    const aboutFile = fs.readFileSync(path.join(process.cwd(), 'src/pages/About.tsx'), 'utf-8');
    const contactFile = fs.readFileSync(path.join(process.cwd(), 'src/pages/Contact.tsx'), 'utf-8');
    const privacyFile = fs.readFileSync(path.join(process.cwd(), 'src/pages/Privacy.tsx'), 'utf-8');

    assert.ok(aboutFile.length >= 500, `About page must have >= 500 chars (got ${aboutFile.length})`);
    assert.ok(contactFile.length >= 500, `Contact page must have >= 500 chars (got ${contactFile.length})`);
    assert.ok(privacyFile.length >= 500, `Privacy page must have >= 500 chars (got ${privacyFile.length})`);
  });

  // 14. Metadata completeness
  it('14. Metadata completeness: canonical URL, lang, og:image, og:type present', async () => {
    const rawHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
    assert.ok(rawHtml.includes('<link rel="canonical"'), 'Missing <link rel="canonical">');
    assert.ok(rawHtml.includes('<html lang='), 'Missing <html lang="...">');
    assert.ok(rawHtml.includes('property="og:image"'), 'Missing <meta property="og:image">');
    assert.ok(rawHtml.includes('property="og:type"'), 'Missing <meta property="og:type">');
  });

  // 15. Organization schema completeness
  it('15. Organization schema completeness: includes contactPoint and address', async () => {
    const rawHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
    assert.ok(rawHtml.includes('"@type": "Organization"'), 'Missing Organization JSON-LD');
    assert.ok(rawHtml.includes('"address"'), 'Missing address in Organization JSON-LD');
    assert.ok(rawHtml.includes('"contactPoint"'), 'Missing contactPoint in Organization JSON-LD');
    assert.ok(rawHtml.includes('"email"'), 'Missing email in contactPoint');
    assert.ok(rawHtml.includes('"telephone"'), 'Missing telephone in contactPoint');
  });

  // 16. MCP server / manifest
  it('16. Model Context Protocol: /.well-known/mcp manifest and /api/mcp tool execution', async () => {
    const mcpRes = await request(server, '/.well-known/mcp');
    assert.strictEqual(mcpRes.status, 200);
    const mcp = JSON.parse(mcpRes.body);
    assert.strictEqual(mcp.name, 'paperloo-mcp-server');
    assert.strictEqual(mcp.protocolVersion, '2024-11-05');
    assert.ok(Array.isArray(mcp.tools) && mcp.tools.length >= 4);

    // Test MCP tool call
    const callRes = await request(server, '/api/mcp', {
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: 'test-1',
        method: 'tools/call',
        params: {
          name: 'verify_compliance',
          arguments: { domain: 'paperloo.vercel.app' },
        },
      },
    });
    assert.strictEqual(callRes.status, 200);
    const callData = JSON.parse(callRes.body);
    assert.strictEqual(callData.jsonrpc, '2.0');
    assert.ok(callData.result.content[0].text.includes('compliance_score'));
  });

  // Teardown
  it('Teardown test server', (t, done) => {
    server.close(() => done());
  });
});
