
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Check that your backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
    }

    const validationErrors = data.errors
      ? Object.values(data.errors).join(" ")
      : "";

    throw new Error(
      validationErrors ||
        data.message ||
        `Request failed (${response.status}).`
    );
  }

  return data;
}

export async function login(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!data.token) {
    throw new Error("The server did not return an authentication token.");
  }

  localStorage.setItem("token", data.token);

  return data.user;
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}

export function getInquiries(search = "", status = "") {
  const params = new URLSearchParams();

  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);

  const query = params.toString();

  return apiRequest(`/inquiries${query ? `?${query}` : ""}`);
}

export function createInquiry(inquiry) {
  return apiRequest("/inquiries", {
    method: "POST",
    body: JSON.stringify(inquiry),
  });
}

export function getInquiry(id) {
  return apiRequest(`/inquiries/${id}`);
}

export function updateInquiryStatus(id, status, expectedStatus) {
  return apiRequest(`/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, expectedStatus }),
  });
}

export function logout() {
  localStorage.removeItem("token");
}
