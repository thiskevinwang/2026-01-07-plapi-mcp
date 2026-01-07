# Clerk Platform MCP Server

An MCP (Model Context Protocol) server for interacting with the [Clerk Platform API](https://clerk.com/docs). This server enables LLMs to manage Clerk applications, domains, and application transfers.

> **Note**: The Clerk Platform API is currently in private beta. [Request access here](https://clerkdev.notion.site/2df2b9ab44fe803f9031e9f3185c5e19).

## Features

### Application Management
- **clerk_list_applications** - List all applications in your workspace
- **clerk_get_application** - Get details of a specific application
- **clerk_create_application** - Create a new application
- **clerk_update_application** - Update an application's name
- **clerk_delete_application** - Delete an application (destructive)

### Domain Management
- **clerk_get_application_domain** - Get domain configuration
- **clerk_get_application_domain_status** - Check domain verification status
- **clerk_update_application_domain** - Set/update production domain
- **clerk_trigger_dns_check** - Trigger DNS verification

### Application Transfers
- **clerk_list_application_transfers** - List transfer requests
- **clerk_create_application_transfer** - Initiate an application transfer
- **clerk_get_application_transfer** - Get transfer details
- **clerk_cancel_application_transfer** - Cancel a pending transfer

## Installation

```bash
# Install dependencies
bun install

# Build the server
bun run build
```

## Authentication

The server supports two authentication methods:

### HTTP Transport (Recommended)
Pass your API key as a Bearer token in the `Authorization` header:

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer your_platform_api_token" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### stdio Transport
Set the `CLERK_PLATFORM_API_KEY` environment variable:

```bash
export CLERK_PLATFORM_API_KEY=your_platform_api_token
```

## Usage

### HTTP Mode (Remote/Multi-client)

```bash
# Start server on default port 3000
bun run start:http

# Start server on custom port
bun run dist/index.js --http --port 8080
```

### stdio Mode (Local Integrations)

```bash
# With environment variable
CLERK_PLATFORM_API_KEY=your_token bun run start

# Or just start (will prompt for auth on first tool use)
bun run start
```

### Development Mode

```bash
# HTTP with auto-reload
bun run dev:http

# stdio with auto-reload
bun run dev
```

### With Cursor/Claude Desktop

For **HTTP transport** (recommended for remote access):

```json
{
  "mcpServers": {
    "clerk-platform": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer your_platform_api_token"
      }
    }
  }
}
```

For **stdio transport** (local):

```json
{
  "mcpServers": {
    "clerk-platform": {
      "command": "bun",
      "args": ["run", "/path/to/clerk-platform-mcp-server/dist/index.js"],
      "env": {
        "CLERK_PLATFORM_API_KEY": "your_platform_api_token"
      }
    }
  }
}
```

## Command Line Options

```
Usage:
  clerk-platform-mcp-server [options]

Options:
  --http         Use HTTP transport (default: stdio)
  --port <port>  Port for HTTP server (default: 3000)
  --help, -h     Show help message
```

## Example Workflows

### Creating a New Application

```
1. Use clerk_create_application with name="My App" and template="b2b-saas"
2. The response includes application_id and instance details with keys
```

### Setting Up a Custom Domain

```
1. Use clerk_update_application_domain to set domain name
2. Configure CNAME records from the response
3. Use clerk_trigger_dns_check to verify configuration
4. Use clerk_get_application_domain_status to monitor progress
```

### Transferring an Application

```
1. Use clerk_create_application_transfer to initiate transfer
2. Share the transfer code with the recipient workspace
3. Recipient claims the transfer using the code
4. Use clerk_get_application_transfer to check status
```

## API Reference

This server implements the [Clerk Platform API](https://api.clerk.com/v1) endpoints:

- `GET /platform/applications` - List applications
- `POST /platform/applications` - Create application
- `GET /platform/applications/{id}` - Get application
- `PATCH /platform/applications/{id}` - Update application
- `DELETE /platform/applications/{id}` - Delete application
- `GET /platform/applications/{id}/domains/{domain}` - Get domain
- `GET /platform/applications/{id}/domains/{domain}/status` - Get domain status
- `PATCH /platform/applications/{id}/domain` - Update domain
- `POST /platform/applications/{id}/domains/{domain}/dns_check` - Trigger DNS check
- `GET /platform/application_transfers` - List transfers
- `POST /platform/applications/{id}/transfers` - Create transfer
- `GET /platform/applications/{id}/transfers/{transferId}` - Get transfer
- `DELETE /platform/applications/{id}/transfers/{transferId}` - Cancel transfer

## License

MIT
