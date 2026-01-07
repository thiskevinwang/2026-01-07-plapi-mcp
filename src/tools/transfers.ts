/**
 * Application transfer tools for Clerk Platform API
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../api.js";
import {
  ListApplicationTransfersSchema,
  CreateApplicationTransferSchema,
  GetApplicationTransferSchema,
  CancelApplicationTransferSchema,
  type ListApplicationTransfersInput,
  type CreateApplicationTransferInput,
  type GetApplicationTransferInput,
  type CancelApplicationTransferInput,
} from "../schemas.js";
import type {
  ListApplicationTransfersResponse,
  ApplicationTransferResponse,
} from "../types.js";

export function registerTransferTools(server: McpServer): void {
  // List Application Transfers
  server.registerTool(
    "clerk_list_application_transfers",
    {
      title: "List Application Transfers",
      description: `List all application transfer requests in your workspace.

Returns transfers sorted by creation date (most recent first).

Args:
  - status (array, optional): Filter by status ('pending', 'completed', 'canceled', 'expired')
  - limit (number, optional): Results per page, 1-500 (default: 10)
  - starting_after (string, optional): Cursor for next page (use last transfer ID)
  - ending_before (string, optional): Cursor for previous page (use first transfer ID)

Returns:
  - data: Array of transfer objects
  - total_count: Total matching transfers

Each transfer includes:
  - id: Transfer ID
  - code: Unique code to share with recipient
  - application_id: Application being transferred
  - status: Current status
  - expires_at: When transfer expires if not completed
  - created_at, canceled_at, completed_at: Timestamps

Example:
  Input: { "status": ["pending"], "limit": 20 }`,
      inputSchema: ListApplicationTransfersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ListApplicationTransfersInput) => {
      try {
        const data = await makeApiRequest<ListApplicationTransfersResponse>(
          "platform/application_transfers",
          "GET",
          undefined,
          {
            status: params.status,
            limit: params.limit,
            starting_after: params.starting_after,
            ending_before: params.ending_before,
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

  // Create Application Transfer
  server.registerTool(
    "clerk_create_application_transfer",
    {
      title: "Create Application Transfer",
      description: `Create a transfer request to move an application to another workspace.

Initiates a transfer that must be claimed by the recipient using the provided code.
Only one pending transfer can exist per application. Transfers expire after 24 hours.

Args:
  - application_id (string, required): The application ID to transfer

Returns:
  Transfer object with:
  - id: Transfer ID
  - code: Share this code with the recipient to claim the application
  - status: Will be 'pending'
  - expires_at: When the transfer expires

Workflow:
1. Create transfer with this tool
2. Share the 'code' with the recipient workspace
3. Recipient claims the transfer using the code
4. Transfer completes and application moves to new workspace

Example:
  Input: { "application_id": "app_abc123" }`,
      inputSchema: CreateApplicationTransferSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: CreateApplicationTransferInput) => {
      try {
        const data = await makeApiRequest<ApplicationTransferResponse>(
          `platform/applications/${params.application_id}/transfers`,
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

  // Get Application Transfer
  server.registerTool(
    "clerk_get_application_transfer",
    {
      title: "Get Application Transfer",
      description: `Get details of a specific application transfer.

Args:
  - application_id (string, required): The application ID
  - transfer_id (string, required): The transfer ID

Returns:
  Transfer object with current status and timestamps.

Example:
  Input: { "application_id": "app_abc123", "transfer_id": "appxfr_xyz789" }`,
      inputSchema: GetApplicationTransferSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetApplicationTransferInput) => {
      try {
        const data = await makeApiRequest<ApplicationTransferResponse>(
          `platform/applications/${params.application_id}/transfers/${params.transfer_id}`,
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

  // Cancel Application Transfer
  server.registerTool(
    "clerk_cancel_application_transfer",
    {
      title: "Cancel Application Transfer",
      description: `Cancel a pending application transfer.

Only transfers with 'pending' status can be canceled. Once canceled,
the transfer code becomes invalid and the application remains in the
current workspace.

Args:
  - application_id (string, required): The application ID
  - transfer_id (string, required): The transfer ID to cancel

Returns:
  Updated transfer object with status 'canceled'.

Example:
  Input: { "application_id": "app_abc123", "transfer_id": "appxfr_xyz789" }`,
      inputSchema: CancelApplicationTransferSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: CancelApplicationTransferInput) => {
      try {
        const data = await makeApiRequest<ApplicationTransferResponse>(
          `platform/applications/${params.application_id}/transfers/${params.transfer_id}`,
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
