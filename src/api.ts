import { auth } from './firebase';

const getBaseUrl = () => {
  // In production, this will be the Cloud Run URL
  // In development, it's typically http://localhost:3000
  return ''; // Relative URLs work because of the Vite proxy/middleware setup
};

const getHeaders = async () => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const api = {
  get: async (endpoint: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${getBaseUrl()}/api/data${endpoint}`, { headers });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${getBaseUrl()}/api/data${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  patch: async (endpoint: string, data: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${getBaseUrl()}/api/data${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
};
