/**
 * Instance config tools for Clerk Platform API
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  ConfigBaseSchema,
  PatchConfigSchema,
  type ConfigBaseInput,
  type PatchConfigInput,
} from "../schemas.js";
import type { ConfigPatchResponse, ConfigResponse, ConfigSchemaResponse } from "../types.js";

export function registerConfigTools(server: McpServer): void {
  server.registerTool(
    "clerk_get_config_schema",
    {
      title: "Get Instance Config Schema",
      description: "Get JSON schema for instance configuration options.",
      inputSchema: ConfigBaseSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ConfigBaseInput) => {
      try {
        const data = await makeApiRequest<ConfigSchemaResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/config/schema`,
          "GET",
          undefined,
          { keys: params.keys }
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
    "clerk_get_config",
    {
      title: "Get Instance Config",
      description: "Get instance configuration values.",
      inputSchema: ConfigBaseSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ConfigBaseInput) => {
      try {
        const data = await makeApiRequest<ConfigResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/config`,
          "GET",
          undefined,
          { keys: params.keys }
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
    "clerk_patch_config",
    {
      title: "Patch Instance Config",
      description: "Patch instance configuration values.",
      inputSchema: PatchConfigSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: PatchConfigInput) => {
      try {
        const data = await makeApiRequest<ConfigPatchResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/config`,
          "PATCH",
          params.patch,
          {
            dry_run: params.dry_run,
            destructive: params.destructive,
            keys: params.keys,
          },
          params.if_match ? { "If-Match": params.if_match } : undefined
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
