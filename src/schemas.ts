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

export const UploadApplicationAssetSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  file_base64: z.string()
    .min(1, "Base64 file content is required")
    .describe("Base64-encoded image bytes (PNG/JPG/ICO)"),
}).strict();

export const DeleteApplicationAssetSchema = ApplicationIdSchema;

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
  proxy_path: z.string()
    .optional()
    .describe("Optional proxy path for provider domains"),
}).strict();

export const ListApplicationDomainsSchema = ApplicationIdSchema;

export const CreateApplicationDomainSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  name: z.string()
    .min(1, "Domain name is required")
    .describe("Provider domain name"),
  proxy_path: z.string()
    .optional()
    .describe("Optional proxy path for provider domains"),
}).strict();

export const DeleteApplicationDomainSchema = DomainIdOrNameSchema;

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

// Instance schemas
export const InstanceSchema = z.object({
  application_id: z.string()
    .min(1, "Application ID is required")
    .describe("The unique identifier for the application"),
  env_or_ins_id: z.string()
    .min(1, "Environment type or instance ID is required")
    .describe("Environment type ('development'|'production') or instance ID"),
}).strict();

export const ListInstanceUsersSchema = InstanceSchema.extend({
  query: z.string()
    .optional()
    .describe("Search query for users"),
  order_by: z.string()
    .default("-created_at")
    .describe("Order by field, prefixed with + or -"),
  limit: z.number()
    .int()
    .min(1)
    .max(500)
    .default(10)
    .describe("Number of results per page (1-500)"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip"),
}).strict();

export const UserActionSchema = InstanceSchema.extend({
  user_id: z.string()
    .min(1, "User ID is required")
    .describe("The user ID"),
}).strict();

const JWTTemplateBodySchema = z.object({
  name: z.string()
    .min(1, "JWT template name is required")
    .describe("JWT template name"),
  claims: z.record(z.unknown())
    .describe("JWT template claims"),
  lifetime: z.number()
    .int()
    .min(30)
    .max(315360000)
    .nullable()
    .optional()
    .describe("JWT token lifetime in seconds"),
  allowed_clock_skew: z.number()
    .int()
    .min(0)
    .max(300)
    .nullable()
    .optional()
    .describe("JWT allowed clock skew in seconds"),
  custom_signing_key: z.boolean()
    .optional()
    .describe("Whether custom signing key/algorithm is provided"),
  signing_algorithm: z.string()
    .nullable()
    .optional()
    .describe("Custom signing algorithm"),
  signing_key: z.string()
    .nullable()
    .optional()
    .describe("Custom signing private key"),
}).strict();

export const ListJWTTemplatesSchema = InstanceSchema;

export const CreateJWTTemplateSchema = InstanceSchema.merge(JWTTemplateBodySchema);

export const JWTTemplateIdSchema = InstanceSchema.extend({
  template_id: z.string()
    .min(1, "Template ID is required")
    .describe("JWT template ID"),
}).strict();

export const UpdateJWTTemplateSchema = JWTTemplateIdSchema.merge(JWTTemplateBodySchema);

export const DeleteJWTTemplateSchema = JWTTemplateIdSchema;

export const ConfigBaseSchema = InstanceSchema.extend({
  keys: z.array(z.string().min(1))
    .optional()
    .describe("Optional config keys to filter response"),
}).strict();

export const PatchConfigSchema = ConfigBaseSchema.extend({
  dry_run: z.boolean()
    .optional()
    .describe("Validate changes without applying"),
  destructive: z.boolean()
    .optional()
    .describe("Allow destructive changes"),
  if_match: z.string()
    .optional()
    .describe("Optional config version for optimistic concurrency (If-Match header)"),
  patch: z.record(z.unknown())
    .describe("Configuration updates to apply"),
}).strict();

// Type exports
export type ListApplicationsInput = z.infer<typeof ListApplicationsSchema>;
export type GetApplicationInput = z.infer<typeof GetApplicationSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>;
export type DeleteApplicationInput = z.infer<typeof DeleteApplicationSchema>;
export type UploadApplicationAssetInput = z.infer<typeof UploadApplicationAssetSchema>;
export type DeleteApplicationAssetInput = z.infer<typeof DeleteApplicationAssetSchema>;

export type GetApplicationDomainInput = z.infer<typeof GetApplicationDomainSchema>;
export type GetApplicationDomainStatusInput = z.infer<typeof GetApplicationDomainStatusSchema>;
export type TriggerDNSCheckInput = z.infer<typeof TriggerDNSCheckSchema>;
export type UpdateApplicationDomainInput = z.infer<typeof UpdateApplicationDomainSchema>;
export type ListApplicationDomainsInput = z.infer<typeof ListApplicationDomainsSchema>;
export type CreateApplicationDomainInput = z.infer<typeof CreateApplicationDomainSchema>;
export type DeleteApplicationDomainInput = z.infer<typeof DeleteApplicationDomainSchema>;

export type ListApplicationTransfersInput = z.infer<typeof ListApplicationTransfersSchema>;
export type CreateApplicationTransferInput = z.infer<typeof CreateApplicationTransferSchema>;
export type GetApplicationTransferInput = z.infer<typeof GetApplicationTransferSchema>;
export type CancelApplicationTransferInput = z.infer<typeof CancelApplicationTransferSchema>;

export type ListInstanceUsersInput = z.infer<typeof ListInstanceUsersSchema>;
export type UserActionInput = z.infer<typeof UserActionSchema>;
export type ListJWTTemplatesInput = z.infer<typeof ListJWTTemplatesSchema>;
export type CreateJWTTemplateInput = z.infer<typeof CreateJWTTemplateSchema>;
export type JWTTemplateIdInput = z.infer<typeof JWTTemplateIdSchema>;
export type UpdateJWTTemplateInput = z.infer<typeof UpdateJWTTemplateSchema>;
export type DeleteJWTTemplateInput = z.infer<typeof DeleteJWTTemplateSchema>;
export type ConfigBaseInput = z.infer<typeof ConfigBaseSchema>;
export type PatchConfigInput = z.infer<typeof PatchConfigSchema>;
