/**
 * Domain management tools for Clerk Platform API
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  GetApplicationDomainSchema,
  GetApplicationDomainStatusSchema,
  TriggerDNSCheckSchema,
  UpdateApplicationDomainSchema,
  ListApplicationDomainsSchema,
  CreateApplicationDomainSchema,
  DeleteApplicationDomainSchema,
  type GetApplicationDomainInput,
  type GetApplicationDomainStatusInput,
  type TriggerDNSCheckInput,
  type UpdateApplicationDomainInput,
  type ListApplicationDomainsInput,
  type CreateApplicationDomainInput,
  type DeleteApplicationDomainInput,
} from "../schemas.js";
import type {
  DomainResponse,
  DomainStatusResponse,
  DNSCheckResponse,
  DeletedObjectResponse,
  ListApplicationDomainsResponse,
} from "../types.js";

export function registerDomainTools(server: McpServer): void {
  // Get Application Domain
  server.registerTool(
    "clerk_list_application_domains",
    {
      title: "List Application Domains",
      description: "List all domains for an application's production instance.",
      inputSchema: ListApplicationDomainsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListApplicationDomainsInput) => {
      try {
        const data = await makeApiRequest<ListApplicationDomainsResponse>(
          `platform/applications/${params.application_id}/domains`,
          "GET"
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: handleApiError(error) }],
          isError: true,
        };
      }
    }
  );

  // Get Application Domain
  server.registerTool(
    "clerk_get_application_domain",
    {
      title: "Get Application Domain",
      description: `Get domain information for a Clerk application.

Retrieves domain configuration including CNAME targets for DNS setup.

Args:
  - application_id (string, required): The application ID
  - domain_id_or_name (string, required): Domain ID or domain name (e.g., 'dmn_abc123' or 'example.com')

Returns:
  Domain object with:
  - id: Domain ID
  - name: Domain name
  - frontend_api_url: URL for frontend API
  - accounts_portal_url: URL for accounts portal
  - cname_targets: Array of CNAME records to configure

Example:
  Input: { "application_id": "app_abc123", "domain_id_or_name": "example.com" }`,
      inputSchema: GetApplicationDomainSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetApplicationDomainInput) => {
      try {
        const data = await makeApiRequest<DomainResponse>(
          `platform/applications/${params.application_id}/domains/${params.domain_id_or_name}`,
          "GET"
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: handleApiError(error) }],
          isError: true,
        };
      }
    }
  );

  // Create Application Domain
  server.registerTool(
    "clerk_create_application_domain",
    {
      title: "Create Application Domain",
      description: "Create a provider domain for an application's production instance.",
      inputSchema: CreateApplicationDomainSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: CreateApplicationDomainInput) => {
      try {
        const requestBody: Record<string, unknown> = { name: params.name };
        if (params.proxy_path) requestBody.proxy_path = params.proxy_path;

        const data = await makeApiRequest<DomainResponse>(
          `platform/applications/${params.application_id}/domains`,
          "POST",
          requestBody
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: handleApiError(error) }],
          isError: true,
        };
      }
    }
  );

  // Get Application Domain Status
  server.registerTool(
    "clerk_get_application_domain_status",
    {
      title: "Get Application Domain Status",
      description: `Get the verification status of a domain.

Returns comprehensive status including DNS, SSL, mail, and proxy configuration.

Args:
  - application_id (string, required): The application ID
  - domain_id_or_name (string, required): Domain ID or domain name

Returns:
  Status object with:
  - status: Overall status ('complete' or 'incomplete')
  - dns: DNS verification status with CNAME details
  - ssl: SSL certificate status
  - mail: Mail configuration status
  - proxy: Proxy configuration status

Example:
  Input: { "application_id": "app_abc123", "domain_id_or_name": "example.com" }
  Output: { "status": "incomplete", "dns": { "status": "in_progress", ... } }`,
      inputSchema: GetApplicationDomainStatusSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetApplicationDomainStatusInput) => {
      try {
        const data = await makeApiRequest<DomainStatusResponse>(
          `platform/applications/${params.application_id}/domains/${params.domain_id_or_name}/status`,
          "GET"
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: handleApiError(error) }],
          isError: true,
        };
      }
    }
  );

  // Trigger DNS Check
  server.registerTool(
    "clerk_trigger_dns_check",
    {
      title: "Trigger DNS Check",
      description: `Trigger a DNS verification check for a domain.

Use this after configuring DNS records to verify they are correctly set up.
Note: At most one DNS check can run at a time. A 409 error means a check
is already in progress or was recently performed.

Args:
  - application_id (string, required): The application ID
  - domain_id_or_name (string, required): Domain ID or domain name

Returns:
  Current domain status including:
  - domain_id: The domain ID
  - last_run_at: Timestamp of last check (epoch ms) or null
  - dns, ssl, status: Current verification status

Error cases:
  - 409 Conflict: A DNS check is already running or was recently performed`,
      inputSchema: TriggerDNSCheckSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: TriggerDNSCheckInput) => {
      try {
        const data = await makeApiRequest<DNSCheckResponse>(
          `platform/applications/${params.application_id}/domains/${params.domain_id_or_name}/dns_check`,
          "POST"
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: handleApiError(error) }],
          isError: true,
        };
      }
    }
  );

  // Update Application Domain
  server.registerTool(
    "clerk_update_application_domain",
    {
      title: "Update Application Domain",
      description: `Update the production domain for a Clerk application.

Sets or changes the custom domain for the production instance.

Args:
  - application_id (string, required): The application ID
  - name (string, required): The new domain name (e.g., 'auth.example.com')

Returns:
  Updated domain object with CNAME targets to configure.

After updating, you'll need to:
1. Configure the CNAME records provided in the response
2. Use clerk_trigger_dns_check to verify the configuration
3. Wait for SSL certificate provisioning

Example:
  Input: { "application_id": "app_abc123", "name": "auth.myapp.com" }`,
      inputSchema: UpdateApplicationDomainSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: UpdateApplicationDomainInput) => {
      try {
        const data = await makeApiRequest<DomainResponse>(
          `platform/applications/${params.application_id}/domain`,
          "PATCH",
          { name: params.name }
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: handleApiError(error) }],
          isError: true,
        };
      }
    }
  );

  // Delete Application Domain
  server.registerTool(
    "clerk_delete_application_domain",
    {
      title: "Delete Application Domain",
      description: "Delete a provider domain from an application's production instance.",
      inputSchema: DeleteApplicationDomainSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: DeleteApplicationDomainInput) => {
      try {
        const data = await makeApiRequest<DeletedObjectResponse>(
          `platform/applications/${params.application_id}/domains/${params.domain_id_or_name}`,
          "DELETE"
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: handleApiError(error) }],
          isError: true,
        };
      }
    }
  );
}
