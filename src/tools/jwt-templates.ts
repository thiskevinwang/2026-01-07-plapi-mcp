/**
 * JWT template tools for Clerk Platform API
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  ListJWTTemplatesSchema,
  CreateJWTTemplateSchema,
  JWTTemplateIdSchema,
  UpdateJWTTemplateSchema,
  DeleteJWTTemplateSchema,
  type ListJWTTemplatesInput,
  type CreateJWTTemplateInput,
  type JWTTemplateIdInput,
  type UpdateJWTTemplateInput,
  type DeleteJWTTemplateInput,
} from "../schemas.js";
import type { DeletedObjectResponse, JWTTemplateResponse } from "../types.js";

export function registerJWTTemplateTools(server: McpServer): void {
  server.registerTool(
    "clerk_list_jwt_templates",
    {
      title: "List JWT Templates",
      description: "List JWT templates for an application instance.",
      inputSchema: ListJWTTemplatesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListJWTTemplatesInput) => {
      try {
        const data = await makeApiRequest<JWTTemplateResponse[]>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/jwt_templates`,
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

  server.registerTool(
    "clerk_create_jwt_template",
    {
      title: "Create JWT Template",
      description: "Create a JWT template for an application instance.",
      inputSchema: CreateJWTTemplateSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: CreateJWTTemplateInput) => {
      try {
        const data = await makeApiRequest<JWTTemplateResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/jwt_templates`,
          "POST",
          {
            name: params.name,
            claims: params.claims,
            lifetime: params.lifetime,
            allowed_clock_skew: params.allowed_clock_skew,
            custom_signing_key: params.custom_signing_key,
            signing_algorithm: params.signing_algorithm,
            signing_key: params.signing_key,
          }
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

  server.registerTool(
    "clerk_get_jwt_template",
    {
      title: "Get JWT Template",
      description: "Get a JWT template by ID.",
      inputSchema: JWTTemplateIdSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: JWTTemplateIdInput) => {
      try {
        const data = await makeApiRequest<JWTTemplateResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/jwt_templates/${params.template_id}`,
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

  server.registerTool(
    "clerk_update_jwt_template",
    {
      title: "Update JWT Template",
      description: "Update a JWT template by ID.",
      inputSchema: UpdateJWTTemplateSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: UpdateJWTTemplateInput) => {
      try {
        const data = await makeApiRequest<JWTTemplateResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/jwt_templates/${params.template_id}`,
          "PATCH",
          {
            name: params.name,
            claims: params.claims,
            lifetime: params.lifetime,
            allowed_clock_skew: params.allowed_clock_skew,
            custom_signing_key: params.custom_signing_key,
            signing_algorithm: params.signing_algorithm,
            signing_key: params.signing_key,
          }
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

  server.registerTool(
    "clerk_delete_jwt_template",
    {
      title: "Delete JWT Template",
      description: "Delete a JWT template by ID.",
      inputSchema: DeleteJWTTemplateSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: DeleteJWTTemplateInput) => {
      try {
        const data = await makeApiRequest<DeletedObjectResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/jwt_templates/${params.template_id}`,
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
