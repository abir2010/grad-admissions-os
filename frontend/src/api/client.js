const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

export const getStoredUser = () => {
  const raw = localStorage.getItem('gradAdmissionsUser');
  return raw ? JSON.parse(raw) : null;
};

export async function apiRequest(path, options = {}) {
  const user = getStoredUser();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || text || `Request failed with status ${response.status}`);
  }

  return data;
}

export default apiRequest;
