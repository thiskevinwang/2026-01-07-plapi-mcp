/**
 * Application management tools for Clerk Platform API
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  ListApplicationsSchema,
  GetApplicationSchema,
  CreateApplicationSchema,
  UpdateApplicationSchema,
  DeleteApplicationSchema,
  type ListApplicationsInput,
  type GetApplicationInput,
  type CreateApplicationInput,
  type UpdateApplicationInput,
  type DeleteApplicationInput,
} from "../schemas.js";
import type {
  ListApplicationsResponse,
  ApplicationResponse,
  DeletedObjectResponse,
} from "../types.js";

export function registerApplicationTools(server: McpServer): void {
  // List Applications
  server.registerTool(
    "clerk_list_applications",
    {
      title: "List Clerk Applications",
      description: `List all applications in your Clerk workspace.

Returns a list of applications with their instances (development/production environments).
Each instance includes its ID and publishable key.

Args:
  - include_secret_keys (boolean): If true, include secret keys in response (default: false)

Returns:
  Array of applications, each containing:
  - application_id: Unique application identifier
  - instances: Array of instances with instance_id, environment_type, publishable_key, and optionally secret_key

Example response:
[
  {
    "application_id": "app_2abc123",
    "instances": [
      { "instance_id": "ins_dev123", "environment_type": "development", "publishable_key": "pk_test_..." },
      { "instance_id": "ins_prod456", "environment_type": "production", "publishable_key": "pk_live_..." }
    ]
  }
]`,
      inputSchema: ListApplicationsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListApplicationsInput) => {
      try {
        const data = await makeApiRequest<ListApplicationsResponse>(
          "platform/applications",
          "GET",
          undefined,
          { include_secret_keys: params.include_secret_keys }
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

  // Get Application
  server.registerTool(
    "clerk_get_application",
    {
      title: "Get Clerk Application",
      description: `Get details of a specific Clerk application.

Retrieves full details of an application including all its instances.

Args:
  - application_id (string): The application ID (e.g., 'app_2abc123')
  - include_secret_keys (boolean): If true, include secret keys (default: false)

Returns:
  Application object with:
  - application_id: Unique identifier
  - instances: Array of instances with their details

Example:
  Input: { "application_id": "app_2abc123" }
  Output: { "application_id": "app_2abc123", "instances": [...] }`,
      inputSchema: GetApplicationSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetApplicationInput) => {
      try {
        const data = await makeApiRequest<ApplicationResponse>(
          `platform/applications/${params.application_id}`,
          "GET",
          undefined,
          { include_secret_keys: params.include_secret_keys }
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

  // Create Application
  server.registerTool(
    "clerk_create_application",
    {
      title: "Create Clerk Application",
      description: `Create a new Clerk application in your workspace.

Creates a new application with the specified configuration. By default, creates
both development and production instances.

Args:
  - name (string, required): Name of the application
  - domain (string, optional): Domain for the application
  - environment_types (array, optional): Which environments to create ('development', 'production')
  - template (string, optional): Application template ('b2b-saas', 'b2c-saas', 'waitlist')

Returns:
  Newly created application with its instances and keys.

Example:
  Input: { "name": "My SaaS App", "template": "b2b-saas" }
  Output: { "application_id": "app_new123", "instances": [...] }`,
      inputSchema: CreateApplicationSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: CreateApplicationInput) => {
      try {
        const requestBody: Record<string, unknown> = { name: params.name };
        if (params.domain) requestBody.domain = params.domain;
        if (params.environment_types) requestBody.environment_types = params.environment_types;
        if (params.template) requestBody.template = params.template;

        const data = await makeApiRequest<ApplicationResponse>(
          "platform/applications",
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

  // Update Application
  server.registerTool(
    "clerk_update_application",
    {
      title: "Update Clerk Application",
      description: `Update an existing Clerk application.

Currently supports updating the application name.

Args:
  - application_id (string, required): The application ID to update
  - name (string, optional): New name for the application

Returns:
  Updated application object.

Example:
  Input: { "application_id": "app_abc123", "name": "Renamed App" }
  Output: { "application_id": "app_abc123", "instances": [...] }`,
      inputSchema: UpdateApplicationSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: UpdateApplicationInput) => {
      try {
        const requestBody: Record<string, unknown> = {};
        if (params.name) requestBody.name = params.name;

        const data = await makeApiRequest<ApplicationResponse>(
          `platform/applications/${params.application_id}`,
          "PATCH",
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

  // Delete Application
  server.registerTool(
    "clerk_delete_application",
    {
      title: "Delete Clerk Application",
      description: `Delete a Clerk application.

WARNING: This permanently deletes the application and all its instances.
This action cannot be undone.

Args:
  - application_id (string, required): The application ID to delete

Returns:
  Confirmation of deletion with the deleted object ID.

Example:
  Input: { "application_id": "app_abc123" }
  Output: { "deleted": true, "object": "deleted", "id": "app_abc123" }`,
      inputSchema: DeleteApplicationSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: DeleteApplicationInput) => {
      try {
        const data = await makeApiRequest<DeletedObjectResponse>(
          `platform/applications/${params.application_id}`,
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
