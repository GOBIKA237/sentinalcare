import { request, setTokens, clearTokens } from "./client";

async function login(serviceNumber, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { serviceNumber, password },
    auth: false,
  });
  setTokens(data);
  localStorage.setItem("sc_user", JSON.stringify(data.user));
  return data.user;
}

async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
}

function getStoredUser() {
  const raw = localStorage.getItem("sc_user");
  return raw ? JSON.parse(raw) : null;
}

async function fetchMe() {
  const data = await request("/users/me");
  return data.user;
}

export { login, logout, getStoredUser, fetchMe };
