const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  getTree: () => request("/police-units/tree"),
  getScope: () => request("/me/unit-scope"),
  createUnit: (payload) =>
    request("/police-units", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUnit: (id, payload) =>
    request(`/police-units/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteUnit: (id) =>
    request(`/police-units/${id}`, {
      method: "DELETE"
    })
};
