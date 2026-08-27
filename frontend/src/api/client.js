// Shared API client used by both the welfare-officer/commander dashboard
// and the other frontend surface. Keep this in sync as new endpoints land.

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const token = localStorage.getItem('sc_auth_token');

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(data?.message || res.statusText, res.status, data);
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  // Alert queue — existing endpoint. `factors` now returns
  // { factor, contribution, signal_type }[] per alert.
  getAlerts: (params) => request('/alerts', { params }),

  acknowledgeAlert: (alertId) =>
    request(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),

  // New: unit-level anonymized risk-band trend.
  // Expected response shape:
  // { unit_id, weeks: [{ week_start, cohort_size, bands: { low, moderate, high } }] }
  getUnitRiskTrend: (unitId, params) =>
    request(`/units/${unitId}/risk-trend`, { params }),

  getUnits: () => request('/units'),
};

export { ApiError };
