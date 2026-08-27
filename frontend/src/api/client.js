const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function getTokens() {
  return {
    accessToken: localStorage.getItem("sc_access_token"),
    refreshToken: localStorage.getItem("sc_refresh_token"),
  };
}

function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem("sc_access_token", accessToken);
  if (refreshToken) localStorage.setItem("sc_refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("sc_access_token");
  localStorage.removeItem("sc_refresh_token");
  localStorage.removeItem("sc_user");
}

async function tryRefresh() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return false;
  }

  const data = await res.json();
  setTokens(data);
  return true;
}

/**
 * Central fetch wrapper: attaches the access token, retries once with a
 * refreshed token on a 401, and throws a normal Error with the server's
 * message on any other failure so callers can just try/catch.
 */
async function request(path, { method = "GET", body, auth = true } = {}) {
  const doFetch = () => {
    const { accessToken } = getTokens();
    const headers = { "Content-Type": "application/json" };
    if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await doFetch();
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // response wasn't JSON, keep default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export { API_BASE_URL, getTokens, setTokens, clearTokens, request };
