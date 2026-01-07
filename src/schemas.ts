/**
 * Zod schemas for input validation
 */

import { z } from "zod";

// Common schemas
export const ApplicationIdSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application (e.g., 'app_2abc123')"),
}).strict();

export const DomainIdOrNameSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  domain_id_or_name: z.string()
    .min(1, "Domain ID or name is required")
    .describe("Domain ID (e.g., 'dmn_abc123') or domain name (e.g., 'example.com')"),
}).strict();

// Application schemas
export const ListApplicationsSchema = z.object({
  include_secret_keys: z.boolean()
    .default(false)
    .describe("Whether to include secret keys in the response"),
}).strict();

export const GetApplicationSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  include_secret_keys: z.boolean()
    .default(false)
    .describe("Whether to include secret keys in the response"),
}).strict();

export const CreateApplicationSchema = z.object({
  name: z.string()
    .min(1, "Application name is required")
    .max(256, "Application name must not exceed 256 characters")
    .describe("The name of the application"),
  domain: z.string()
    .optional()
    .describe("The domain for the application (optional)"),
  environment_types: z.array(z.enum(["development", "production"]))
    .optional()
    .describe("List of environment types to create instances for"),
  template: z.string()
    .optional()
    .describe("Application template (e.g., 'b2b-saas', 'b2c-saas', 'waitlist')"),
}).strict();

export const UpdateApplicationSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  name: z.string()
    .min(1, "Application name is required")
    .max(256, "Application name must not exceed 256 characters")
    .optional()
    .describe("The new name for the application"),
}).strict();

export const DeleteApplicationSchema = ApplicationIdSchema;

// Domain schemas
export const GetApplicationDomainSchema = DomainIdOrNameSchema;

export const GetApplicationDomainStatusSchema = DomainIdOrNameSchema;

export const TriggerDNSCheckSchema = DomainIdOrNameSchema;

export const UpdateApplicationDomainSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  name: z.string()
    .min(1, "Domain name is required")
    .describe("The new domain name for the production instance"),
}).strict();

// Transfer schemas
export const TransferStatusSchema = z.enum(["pending", "completed", "canceled", "expired"]);

export const ListApplicationTransfersSchema = z.object({
  status: z.array(TransferStatusSchema)
    .optional()
    .describe("Filter by transfer status (can specify multiple)"),
  limit: z.number()
    .int()
    .min(1)
    .max(500)
    .default(10)
    .describe("Number of results per page (1-500)"),
  starting_after: z.string()
    .optional()
    .describe("Cursor for pagination - ID of last transfer from previous page"),
  ending_before: z.string()
    .optional()
    .describe("Cursor for pagination - ID of first transfer from previous page"),
}).strict();

export const CreateApplicationTransferSchema = ApplicationIdSchema;

export const GetApplicationTransferSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  transfer_id: z.string()
    .min(1, "Transfer ID is required")
    .describe("The unique identifier for the transfer"),
}).strict();

export const CancelApplicationTransferSchema = GetApplicationTransferSchema;

// Type exports
export type ListApplicationsInput = z.infer<typeof ListApplicationsSchema>;
export type GetApplicationInput = z.infer<typeof GetApplicationSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>;
export type DeleteApplicationInput = z.infer<typeof DeleteApplicationSchema>;

export type GetApplicationDomainInput = z.infer<typeof GetApplicationDomainSchema>;
export type GetApplicationDomainStatusInput = z.infer<typeof GetApplicationDomainStatusSchema>;
export type TriggerDNSCheckInput = z.infer<typeof TriggerDNSCheckSchema>;
export type UpdateApplicationDomainInput = z.infer<typeof UpdateApplicationDomainSchema>;

export type ListApplicationTransfersInput = z.infer<typeof ListApplicationTransfersSchema>;
export type CreateApplicationTransferInput = z.infer<typeof CreateApplicationTransferSchema>;
export type GetApplicationTransferInput = z.infer<typeof GetApplicationTransferSchema>;
export type CancelApplicationTransferInput = z.infer<typeof CancelApplicationTransferSchema>;
