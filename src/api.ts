/**
 * API client for Clerk Platform API
 */

import type { ClerkErrorsResponse } from "./types.js";

const API_BASE_URL = "https://api.clerk.com/v1";
type RequestBodyData = string | FormData | ArrayBuffer | Uint8Array;

export class ClerkAPIError extends Error {
  constructor(
    public status: number,
    public errors: ClerkErrorsResponse
  ) {
    const firstError = errors.errors[0];
    super(firstError?.long_message || firstError?.message || "Unknown API error");
    this.name = "ClerkAPIError";
  }
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super(
      "Authentication required. Provide a Bearer token in the Authorization header " +
      "when connecting to this MCP server, or set CLERK_PLATFORM_API_KEY environment variable."
    );
    this.name = "AuthenticationRequiredError";
  }
}

/**
 * Context for API requests, containing the API key
 */
export interface ApiContext {
  apiKey: string | null;
}

/**
 * Global context that will be set per-request for HTTP transport
 * or from environment for stdio transport
 */
let currentContext: ApiContext = {
  apiKey: process.env.CLERK_PLATFORM_API_KEY ?? null,
};

/**
 * Set the API context for the current request
 */
export function setApiContext(ctx: ApiContext): void {
  currentContext = ctx;
}

/**
 * Get the current API context
 */
export function getApiContext(): ApiContext {
  return currentContext;
}

function getApiKey(): string {
  // First check current context (set by HTTP transport from Authorization header)
  if (currentContext.apiKey) {
    return currentContext.apiKey;
  }
  
  // Fall back to environment variable (for stdio transport)
  const envKey = process.env.CLERK_PLATFORM_API_KEY;
  if (envKey) {
    return envKey;
  }
  
  throw new AuthenticationRequiredError();
}

export async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, string | number | boolean | string[] | undefined>,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const apiKey = getApiKey();
  
  // Build URL with query parameters
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          url.searchParams.append(key, v);
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Accept": "application/json",
    ...extraHeaders,
  };

  const shouldSerializeJson =
    data !== undefined &&
    !headers["Content-Type"] &&
    typeof data === "object" &&
    data !== null &&
    !(data instanceof FormData) &&
    !(data instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(data);

  if (shouldSerializeJson) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: data === undefined
      ? undefined
      : shouldSerializeJson
        ? JSON.stringify(data)
        : data as RequestBodyData,
  });

  if (!response.ok) {
    let errorBody: ClerkErrorsResponse;
    try {
      errorBody = await response.json() as ClerkErrorsResponse;
    } catch {
      errorBody = {
        errors: [{
          message: `HTTP ${response.status}`,
          long_message: `Request failed with status ${response.status}`,
          code: "request_failed"
        }]
      };
    }
    throw new ClerkAPIError(response.status, errorBody);
  }

  return response.json() as Promise<T>;
}

export function handleApiError(error: unknown): string {
  if (error instanceof AuthenticationRequiredError) {
    return `Error: ${error.message}`;
  }
  
  if (error instanceof ClerkAPIError) {
    const errors = error.errors.errors;
    const messages = errors.map(e => `${e.code}: ${e.long_message || e.message}`);
    
    switch (error.status) {
      case 400:
        return `Error: Bad request. ${messages.join("; ")}`;
      case 401:
        return "Error: Authentication failed. Check your API key is valid.";
      case 403:
        return "Error: Permission denied. Your API key may not have access to this resource.";
      case 404:
        return `Error: Resource not found. ${messages.join("; ")}`;
      case 409:
        return `Error: Conflict. ${messages.join("; ")}`;
      case 422:
        return `Error: Validation failed. ${messages.join("; ")}`;
      default:
        return `Error: API request failed (${error.status}). ${messages.join("; ")}`;
    }
  }
  
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  
  return `Error: Unexpected error occurred: ${String(error)}`;
}
