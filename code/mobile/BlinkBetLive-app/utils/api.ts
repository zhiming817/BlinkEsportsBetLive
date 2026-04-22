export const API_BASE_URL = 'http://192.168.0.107:3000';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
}
