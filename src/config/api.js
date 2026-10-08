export const API_URL = "https://gest-olab.onrender.com";

export const jsonHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function apiFetch(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...jsonHeaders(token),
      ...(options.headers || {}),
    },
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.detail || data?.mensagem || "Erro na comunicação com o servidor.");
    error.status = response.status;
    throw error;
  }

  return data;
}
