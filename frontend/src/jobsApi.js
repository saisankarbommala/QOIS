// src/jobsApi.js

// --------------------------------------------------
// API BASE URL (AUTO DEV / PROD)
// --------------------------------------------------
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Optional Debug (Remove later)
console.log("🌐 Jobs API URL:", API_BASE_URL);

// --------------------------------------------------
// AUTH HEADERS
// --------------------------------------------------
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --------------------------------------------------
// GENERIC FETCH WRAPPER
// --------------------------------------------------
const apiRequest = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20 sec timeout

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Unexpected server response.");
    }

    if (!res.ok || data?.success === false) {
      throw new Error(
        data?.error || data?.message || `Request failed (${res.status})`
      );
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout. Server took too long to respond.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};

// ---------------------------------------------------------
// 1. Fetch IBM Backends
// ---------------------------------------------------------
export async function fetchBackends() {
  const json = await apiRequest("/backends");

  if (Array.isArray(json.data?.devices)) return json.data.devices;
  if (Array.isArray(json.data)) return json.data;

  return [];
}

// ---------------------------------------------------------
// 2. Create Job
// ---------------------------------------------------------
export async function createJob(payload) {
  const json = await apiRequest("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return json.data;
}

// ---------------------------------------------------------
// 3. Get Job By ID
// ---------------------------------------------------------
export async function getJobById(jobId) {
  const json = await apiRequest(`/jobs/${jobId}`);
  return json.data;
}

// ---------------------------------------------------------
// 4. Submit Job to IBM
// ---------------------------------------------------------
export async function submitJobToIbm(jobId) {
  const json = await apiRequest(`/jobs/${jobId}/submit`, {
    method: "POST",
  });

  return json.data;
}

// ---------------------------------------------------------
// 5. Get Job Status
// ---------------------------------------------------------
export async function getJobStatus(jobId) {
  const json = await apiRequest(`/jobs/${jobId}/status`);
  return json.data;
}

// ---------------------------------------------------------
// 6. Get Job Results
// ---------------------------------------------------------
export async function getJobResults(jobId) {
  const json = await apiRequest(`/jobs/${jobId}/results`);
  return json.data;
}
