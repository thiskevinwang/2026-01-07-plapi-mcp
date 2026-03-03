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
- **clerk_upload_application_logo** / **clerk_delete_application_logo** - Manage application logo
- **clerk_upload_application_favicon** / **clerk_delete_application_favicon** - Manage application favicon

### Domain Management
- **clerk_list_application_domains** - List domains for an application
- **clerk_create_application_domain** - Create a provider domain
- **clerk_get_application_domain** - Get domain configuration
- **clerk_delete_application_domain** - Delete a provider domain
- **clerk_get_application_domain_status** - Check domain verification status
- **clerk_update_application_domain** - Set/update production domain
- **clerk_trigger_dns_check** - Trigger DNS verification

### Application Transfers
- **clerk_list_application_transfers** - List transfer requests
- **clerk_create_application_transfer** - Initiate an application transfer
- **clerk_get_application_transfer** - Get transfer details
- **clerk_cancel_application_transfer** - Cancel a pending transfer

### Instance Users
- **clerk_list_instance_users** - List users in an instance
- **clerk_ban_instance_user** - Ban a user in an instance
- **clerk_unban_instance_user** - Unban a user in an instance

### JWT Templates
- **clerk_list_jwt_templates** - List JWT templates
- **clerk_create_jwt_template** - Create a JWT template
- **clerk_get_jwt_template** - Get a JWT template
- **clerk_update_jwt_template** - Update a JWT template
- **clerk_delete_jwt_template** - Delete a JWT template

### Instance Config
- **clerk_get_config_schema** - Get config schema
- **clerk_get_config** - Get config values
- **clerk_patch_config** - Patch config values

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
- `POST /platform/applications/{id}/logo` - Upload application logo
- `DELETE /platform/applications/{id}/logo` - Delete application logo
- `POST /platform/applications/{id}/favicon` - Upload application favicon
- `DELETE /platform/applications/{id}/favicon` - Delete application favicon
- `GET /platform/applications/{id}/domains` - List application domains
- `POST /platform/applications/{id}/domains` - Create application domain
- `GET /platform/applications/{id}/domains/{domain}` - Get domain
- `DELETE /platform/applications/{id}/domains/{domain}` - Delete domain
- `GET /platform/applications/{id}/domains/{domain}/status` - Get domain status
- `PATCH /platform/applications/{id}/domain` - Update domain
- `POST /platform/applications/{id}/domains/{domain}/dns_check` - Trigger DNS check
- `GET /platform/application_transfers` - List transfers
- `POST /platform/applications/{id}/transfers` - Create transfer
- `GET /platform/applications/{id}/transfers/{transferId}` - Get transfer
- `DELETE /platform/applications/{id}/transfers/{transferId}` - Cancel transfer
- `GET /platform/applications/{id}/instances/{envOrInsID}/users` - List instance users
- `POST /platform/applications/{id}/instances/{envOrInsID}/users/{userId}/ban` - Ban user
- `POST /platform/applications/{id}/instances/{envOrInsID}/users/{userId}/unban` - Unban user
- `GET /platform/applications/{id}/instances/{envOrInsID}/jwt_templates` - List JWT templates
- `POST /platform/applications/{id}/instances/{envOrInsID}/jwt_templates` - Create JWT template
- `GET /platform/applications/{id}/instances/{envOrInsID}/jwt_templates/{templateId}` - Get JWT template
- `PATCH /platform/applications/{id}/instances/{envOrInsID}/jwt_templates/{templateId}` - Update JWT template
- `DELETE /platform/applications/{id}/instances/{envOrInsID}/jwt_templates/{templateId}` - Delete JWT template
- `GET /platform/applications/{id}/instances/{envOrInsID}/config/schema` - Get config schema
- `GET /platform/applications/{id}/instances/{envOrInsID}/config` - Get config
- `PATCH /platform/applications/{id}/instances/{envOrInsID}/config` - Patch config

## License

MIT
