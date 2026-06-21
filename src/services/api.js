// EduPlay frontend API client
// - Uses VITE_API_URL when set, otherwise in dev uses a relative `/api` so Vite proxy applies.
const BACKEND_DEFAULT = "https://eduplayapi.runasp.net";
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : import.meta.env.DEV
    ? ""
    : BACKEND_DEFAULT;

// Storage keys
const TOKEN_KEY = "eduplay-token";
const REFRESH_KEY = "eduplay-refresh-token";

let accessToken = localStorage.getItem(TOKEN_KEY) || null;
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY) || null;

function saveTokens({ accessToken: at, refreshToken: rt }) {
  if (at) {
    accessToken = at;
    localStorage.setItem(TOKEN_KEY, at);
  }
  if (rt) {
    localStorage.setItem(REFRESH_KEY, rt);
  }
}

function clearTokens() {
  accessToken = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function buildUrl(path) {
  // path should start with /api
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE}${path}`;
}

async function parseJsonSafe(response) {
  try {
    // Guard: empty body will throw; handle gracefully
    const text = await response.text();
    if (!text) return { message: response.statusText || "Empty response" };
    return JSON.parse(text);
  } catch (e) {
    return { message: response.statusText || "Invalid JSON response" };
  }
}

async function readResponseBody(response) {
  const text = await response.text().catch(() => "");
  let json = null;
  try {
    if (text) json = JSON.parse(text);
  } catch (e) {
    json = null;
  }
  return { text, json };
}

function headersToObject(headers) {
  const obj = {};
  try {
    for (const [k, v] of headers.entries()) obj[k] = v;
  } catch (e) {}
  return obj;
}

function formatApiError(errObj) {
  if (!errObj) return "Server error";
  if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
    return errObj.errors
      .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
      .join(" ");
  }
  return errObj.message || errObj.title || JSON.stringify(errObj);
}

async function refreshAccessToken() {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(buildUrl("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = await parseJsonSafe(res);
    if (data && (data.accessToken || data.refreshToken)) {
      saveTokens(data);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function fetchWithAuth(path, options = {}, allowRetry = true) {
  const opts = { ...options };
  opts.headers = opts.headers || {};

  // don't overwrite Content-Type when sending FormData
  if (opts.body != null && !(opts.body instanceof FormData)) {
    opts.headers["Content-Type"] =
      opts.headers["Content-Type"] || "application/json";
  }

  if (accessToken) opts.headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(buildUrl(path), opts);

  if (res.status === 401 && allowRetry) {
    const ok = await refreshAccessToken();
    if (ok && accessToken) {
      // retry once with new token
      opts.headers["Authorization"] = `Bearer ${accessToken}`;
      return fetch(buildUrl(path), opts);
    }
    clearTokens();
  }

  return res;
}

export const api = {
  auth: {
    async register(userName, email, password) {
      const res = await fetch(buildUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, email, password }),
      });
      if (!res.ok) {
        const { text, json } = await readResponseBody(res);
        if (res.status >= 500) {
          console.error("[API][REGISTER] server error", {
            path: "/api/auth/register",
            status: res.status,
            headers: headersToObject(res.headers),
            text,
            json,
          });
        }
        const errObj = json || { message: text || res.statusText };
        throw new Error(formatApiError(errObj) || "Registration failed");
      }
      // On success the README returns the new user but not tokens. Auto-login
      // so the frontend receives access/refresh tokens and is authenticated.
      const data = await parseJsonSafe(res);
      if (data?.accessToken || data?.refreshToken) {
        saveTokens(data);
        return data.user || data;
      }

      // If no tokens returned, attempt to log the user in immediately.
      try {
        const logged = await this.login(email, password);
        return logged;
      } catch (e) {
        // Return the created user object if login fails for some reason
        return data.user || data;
      }
    },

    async login(email, password) {
      const res = await fetch(buildUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const { text, json } = await readResponseBody(res);
        if (res.status >= 500) {
          console.error("[API][LOGIN] server error", {
            path: "/api/auth/login",
            status: res.status,
            headers: headersToObject(res.headers),
            text,
            json,
          });
        }
        const errObj = json || { message: text || res.statusText };
        throw new Error(formatApiError(errObj) || "Login failed");
      }
      const data = await parseJsonSafe(res);
      if (data) saveTokens(data);
      return data.user || data;
    },

    async refresh() {
      const ok = await refreshAccessToken();
      return ok;
    },

    async logout(userId) {
      // best-effort notify backend then clear local tokens
      try {
        if (userId) {
          await fetchWithAuth(
            `/api/auth/logout/${userId}`,
            { method: "POST" },
            false,
          );
        }
      } catch (e) {
        console.warn("logout notify failed", e);
      }
      clearTokens();
    },
  },

  documents: {
    async upload(file) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetchWithAuth("/api/documents", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const { text, json } = await readResponseBody(res);
        if (res.status >= 500) {
          console.error("[API][UPLOAD] server error", {
            path: "/api/documents",
            status: res.status,
            headers: headersToObject(res.headers),
            text,
            json,
          });
        }
        const errObj = json || { message: text || res.statusText };
        throw new Error(formatApiError(errObj) || "Failed to upload document");
      }
      return await parseJsonSafe(res);
    },

    async analyze(documentId) {
      // Backend spec: POST /api/documents/{id}/analyze triggers async processing.
      // The current API does not require or expect additional request payload.
      const opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };
      const hdrsForLog = { ...opts.headers };
      if (accessToken) hdrsForLog["Authorization"] = `Bearer ${accessToken}`;
      console.debug("[API][ANALYZE] request", {
        path: `/api/documents/${documentId}/analyze`,
        opts: { ...opts, headers: hdrsForLog },
      });

      // Retry transient 5xx errors up to 3 attempts
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const res = await fetchWithAuth(
          `/api/documents/${documentId}/analyze`,
          opts,
          true,
        );
        if (res.ok) return await parseJsonSafe(res);

        const { text, json } = await readResponseBody(res);
        const errObj = json || { message: text || res.statusText };
        const errorMessage =
          formatApiError(errObj) || `${res.status} ${res.statusText}`;

        if (res.status >= 500) {
          console.error("[API][ANALYZE] server error", {
            path: `/api/documents/${documentId}/analyze`,
            attempt,
            status: res.status,
            url: res.url,
            headers: headersToObject(res.headers),
            text,
            json,
          });
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
            continue;
          }
        }

        if (res.status === 401) {
          console.warn("[API][ANALYZE] authentication failed", {
            path: `/api/documents/${documentId}/analyze`,
            status: res.status,
            text,
            json,
          });
        }

        throw new Error(
          `${errorMessage}${text ? ` | server response: ${text}` : ""}` ||
            "Failed to trigger analysis",
        );
      }
    },

    async getHistory() {
      const res = await fetchWithAuth("/api/documents/mine", { method: "GET" });
      if (!res.ok) {
        const { text, json } = await readResponseBody(res);
        if (res.status >= 500) {
          console.error("[API][HISTORY] server error", {
            path: "/api/documents/mine",
            status: res.status,
            headers: headersToObject(res.headers),
            text,
            json,
          });
        }
        const errObj = json || { message: text || res.statusText };
        throw new Error(formatApiError(errObj) || "Failed to fetch history");
      }
      return await parseJsonSafe(res);
    },

    async getStatus(documentId) {
      const res = await fetchWithAuth(`/api/documents/${documentId}`, {
        method: "GET",
      });
      if (!res.ok) {
        const { text, json } = await readResponseBody(res);
        if (res.status >= 500) {
          console.error("[API][STATUS] server error", {
            path: `/api/documents/${documentId}`,
            status: res.status,
            headers: headersToObject(res.headers),
            text,
            json,
          });
        }
        const errObj = json || { message: text || res.statusText };
        throw new Error(
          formatApiError(errObj) || "Failed to fetch document status",
        );
      }
      return await parseJsonSafe(res);
    },
  },

  analyses: {
    async getAnalysis(documentId) {
      const res = await fetchWithAuth(`/api/documents/${documentId}`, {
        method: "GET",
      });
      if (!res.ok) {
        const { text, json } = await readResponseBody(res);
        if (res.status >= 500) {
          console.error("[API][ANALYSIS_FETCH] server error", {
            path: `/api/documents/${documentId}`,
            status: res.status,
            headers: headersToObject(res.headers),
            text,
            json,
          });
        }
        const errObj = json || { message: text || res.statusText };
        throw new Error(formatApiError(errObj) || "Failed to fetch analysis");
      }
      const doc = await parseJsonSafe(res);
      return doc.analysis || { aiResponseJson: "{}" };
    },
  },
};

export default api;
