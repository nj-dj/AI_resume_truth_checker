import type { AuthSession, CoverLetterResult, JobPosting, UsageState } from "./types";

const API_BASE_URLS = [
  import.meta.env.VITE_API_BASE_URL,
  "http://localhost:5000/api",
  "https://ai-resume-truth-checker.vercel.app/api",
].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);

type RequestOptions = {
  token?: string;
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
};

class ExtensionApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  let networkError: unknown = null;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          "X-Extension-Client": chrome.runtime.id,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ExtensionApiError(response.status, payload?.message ?? "Request failed", payload?.details);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ExtensionApiError) {
        throw error;
      }

      networkError = error;
    }
  }

  throw networkError instanceof Error ? networkError : new Error("Unable to reach Resume.OS API");
};

export const extensionApi = {
  signup(name: string, email: string, password: string) {
    return request<{ success: true; data: AuthSession }>("/extension/auth/signup", {
      method: "POST",
      body: { name, email, password },
    });
  },

  login(email: string, password: string) {
    return request<{ success: true; data: AuthSession }>("/extension/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  refresh(refreshToken: string) {
    return request<{ success: true; data: AuthSession }>("/extension/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },

  usage(token: string) {
    return request<{ success: true; data: UsageState }>("/extension/usage", { token });
  },

  generateCoverLetter(token: string, job: JobPosting) {
    return request<{ success: true; data: CoverLetterResult }>("/extension/cover-letters/generate", {
      method: "POST",
      token,
      body: { job },
    });
  },

  saveCoverLetter(token: string, payload: { coverLetterId?: string; job: JobPosting; content: string }) {
    return request<{ success: true; data: { id: string } }>("/extension/cover-letters/save", {
      method: "POST",
      token,
      body: payload,
    });
  },

  track(token: string | undefined, event: string, properties: Record<string, unknown>) {
    return request<{ success: true }>("/extension/events", {
      method: "POST",
      token,
      body: { event, properties, occurredAt: new Date().toISOString() },
    }).catch(() => null);
  },
};
