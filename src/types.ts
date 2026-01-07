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
