/**
 * User management tools for Clerk Platform API
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  ListInstanceUsersSchema,
  UserActionSchema,
  type ListInstanceUsersInput,
  type UserActionInput,
} from "../schemas.js";
import type { ListInstanceUsersResponse, UserResponse } from "../types.js";

export function registerUserTools(server: McpServer): void {
  server.registerTool(
    "clerk_list_instance_users",
    {
      title: "List Instance Users",
      description: "List users for an application instance with optional filtering and pagination.",
      inputSchema: ListInstanceUsersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListInstanceUsersInput) => {
      try {
        const data = await makeApiRequest<ListInstanceUsersResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/users`,
          "GET",
          undefined,
          {
            query: params.query,
            order_by: params.order_by,
            limit: params.limit,
            offset: params.offset,
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
    "clerk_ban_instance_user",
    {
      title: "Ban Instance User",
      description: "Ban a user in an application instance.",
      inputSchema: UserActionSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: UserActionInput) => {
      try {
        const data = await makeApiRequest<UserResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/users/${params.user_id}/ban`,
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

  server.registerTool(
    "clerk_unban_instance_user",
    {
      title: "Unban Instance User",
      description: "Unban a user in an application instance.",
      inputSchema: UserActionSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: UserActionInput) => {
      try {
        const data = await makeApiRequest<UserResponse>(
          `platform/applications/${params.application_id}/instances/${params.env_or_ins_id}/users/${params.user_id}/unban`,
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
}
