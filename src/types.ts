/**
 * TypeScript types for Clerk Platform API
 * Generated from OpenAPI spec
 */

// Application Instance
export interface ApplicationInstance {
  instance_id: string;
  environment_type: "development" | "production";
  secret_key?: string;
  publishable_key: string;
}

// Application Response
export interface ApplicationResponse {
  application_id: string;
  instances: ApplicationInstance[];
}

// List Applications Response
export type ListApplicationsResponse = ApplicationResponse[];

// Create Application Request
export interface CreateApplicationRequest {
  name: string;
  domain?: string;
  environment_types?: ("development" | "production")[];
  template?: string;
}

// Update Application Request
export interface UpdateApplicationRequest {
  name?: string;
}

// Deleted Object Response
export interface DeletedObjectResponse {
  deleted: boolean;
  object: string;
  id: string;
}

// Domain Response
export interface DomainResponse {
  object: "domain";
  id: string;
  name: string;
  is_satellite?: boolean;
  frontend_api_url: string;
  development_origin: string;
  accounts_portal_url: string;
  cname_targets: CNAMETarget[];
}

export interface CNAMETarget {
  name?: string;
  value?: string;
  required?: boolean;
}

// Update Domain Request
export interface UpdateDomainRequest {
  name: string;
  proxy_path?: string;
}

// Failure Hint
export interface FailureHint {
  code: string;
  message: string;
}

// CNAME Status
export interface CNAMEStatus {
  clerk_subdomain: string;
  from: string;
  to: string;
  verified: boolean;
  required: boolean;
  failure_hints: FailureHint[];
}

// DNS Status
export interface DNSStatus {
  status: "not_started" | "in_progress" | "complete";
  cnames: {
    accounts?: CNAMEStatus;
    clerk?: CNAMEStatus;
    "clk._domainkey"?: CNAMEStatus;
    "clk2._domainkey"?: CNAMEStatus;
    clkmail?: CNAMEStatus;
  };
}

// SSL Status
export interface SSLStatus {
  status: string;
  required: boolean;
  failure_hints: FailureHint[] | null;
}

// Domain Status Response
export interface DomainStatusResponse {
  dns: DNSStatus;
  ssl: {
    status: "complete" | "in_process" | "not_started" | "failed" | "incomplete";
    required?: boolean;
    failure_hints?: FailureHint[] | null;
  };
  ssl_hosts?: Record<string, SSLStatus>;
  mail?: {
    status: string;
    required: boolean;
  };
  proxy?: {
    status: string;
    required: boolean;
  };
  status: "complete" | "incomplete";
}

// DNS Check Response
export interface DNSCheckResponse extends DomainStatusResponse {
  domain_id: string;
  last_run_at: number | null;
}

// List Application Domains Response
export interface ListApplicationDomainsResponse {
  data: DomainResponse[];
  total_count: number;
}

// Application Transfer Response
export interface ApplicationTransferResponse {
  object: "application_transfer";
  id: string;
  code: string;
  application_id: string;
  status: "pending" | "completed" | "canceled" | "expired";
  expires_at: string;
  created_at: string;
  canceled_at: string | null;
  completed_at: string | null;
}

// List Application Transfers Response
export interface ListApplicationTransfersResponse {
  data: ApplicationTransferResponse[];
  total_count: number;
}

// User Response
export interface UserResponse {
  id: string;
  object: "user";
  external_id: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email_addresses: unknown[];
  phone_numbers: unknown[];
  web3_wallets: unknown[];
  passkeys: unknown[];
  banned: boolean;
  locked: boolean;
  updated_at: number;
  created_at: number;
}

// List Instance Users Response
export interface ListInstanceUsersResponse {
  data: UserResponse[];
  total_count: number;
}

// JWT Template
export interface JWTTemplateResponse {
  object: "jwt_template";
  id: string;
  name: string;
  claims: Record<string, unknown>;
  lifetime: number;
  allowed_clock_skew: number;
  custom_signing_key: boolean;
  signing_algorithm: string;
  created_at: number;
  updated_at: number;
}

// Config responses
export interface ConfigSchemaResponse {
  $schema?: string;
  $id?: string;
  type?: string;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ConfigResponse {
  config_version?: string;
  [key: string]: unknown;
}

export interface ConfigPatchResponse {
  config_version?: string;
  dry_run?: boolean;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  [key: string]: unknown;
}

// Clerk Error
export interface ClerkError {
  message: string;
  long_message: string;
  code: string;
  meta?: Record<string, unknown>;
}

// Clerk Errors Response
export interface ClerkErrorsResponse {
  errors: ClerkError[];
  meta?: Record<string, unknown>;
  clerk_trace_id?: string;
}
