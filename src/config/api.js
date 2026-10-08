export const API_URL = "https://gest-olab.onrender.com";

export const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});