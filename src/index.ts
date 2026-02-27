#!/usr/bin/env bun
/**
 * Clerk Platform API MCP Server
 *
 * This server provides tools to interact with the Clerk Platform API,
 * enabling management of applications, domains, and application transfers.
 *
 * Authentication:
 *   - HTTP transport: Pass Bearer token in Authorization header
 *   - stdio transport: Set CLERK_PLATFORM_API_KEY environment variable (optional)
 *
 * Usage:
 *   # HTTP mode (recommended for remote/multi-client)
 *   bun run src/index.ts --http --port 3000
 *
 *   # stdio mode (for local integrations)
 *   bun run src/index.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerApplicationTools } from "./tools/applications.js";
import { registerDomainTools } from "./tools/domains.js";
import { registerTransferTools } from "./tools/transfers.js";
import { registerUserTools } from "./tools/users.js";
import { registerJWTTemplateTools } from "./tools/jwt-templates.js";
import { registerConfigTools } from "./tools/config.js";
import { setApiContext } from "./api.js";

// Create MCP server instance
const server = new McpServer({
  name: "clerk-platform-mcp-server",
  version: "1.0.0",
});

// Register all tools
registerApplicationTools(server);
registerDomainTools(server);
registerTransferTools(server);
registerUserTools(server);
registerJWTTemplateTools(server);
registerConfigTools(server);

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Run server with HTTP transport
 */
async function runHTTP(port: number): Promise<void> {
  // Dynamic import to avoid bundling issues when not using HTTP
  const express = await import("express");
  const app = express.default();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    const apiKey = extractBearerToken(authHeader);
    
    // Set the API context for this request
    setApiContext({ apiKey });

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => transport.close());

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "clerk-platform-mcp-server" });
  });

  app.listen(port, () => {
    console.error(`Clerk Platform MCP server running on http://localhost:${port}/mcp`);
    console.error("Pass your API key as: Authorization: Bearer <your-api-key>");
  });
}

/**
 * Run server with stdio transport
 */
async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Clerk Platform MCP server running via stdio");
  
  if (!process.env.CLERK_PLATFORM_API_KEY) {
    console.error("Note: CLERK_PLATFORM_API_KEY not set. Tools will fail until authentication is provided.");
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): { transport: "http" | "stdio"; port: number } {
  const args = process.argv.slice(2);
  let transport: "http" | "stdio" = "stdio";
  let port = 3000;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--http") {
      transport = "http";
    } else if (arg === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Clerk Platform MCP Server

Usage:
  clerk-platform-mcp-server [options]

Options:
  --http         Use HTTP transport (default: stdio)
  --port <port>  Port for HTTP server (default: 3000)
  --help, -h     Show this help message

Authentication:
  HTTP:  Pass Bearer token in Authorization header
  stdio: Set CLERK_PLATFORM_API_KEY environment variable

Examples:
  # Run with HTTP transport on port 8080
  bun run dist/index.js --http --port 8080

  # Run with stdio transport
  bun run dist/index.js

  # With environment variable for stdio
  CLERK_PLATFORM_API_KEY=your_key bun run dist/index.js
`);
      process.exit(0);
    }
  }

  return { transport, port };
}

// Main
const { transport, port } = parseArgs();

if (transport === "http") {
  runHTTP(port).catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
