import { request } from "./client";

async function submitCheckin({ mood, sleep, workload, note }) {
  return request("/checkins", {
    method: "POST",
    body: { mood, sleep, workload, note },
  });
}

async function fetchMyCheckins() {
  return request("/checkins/me");
}

async function fetchAlerts() {
  return request("/alerts");
}

export { submitCheckin, fetchMyCheckins, fetchAlerts };
