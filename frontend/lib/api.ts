const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`API error: ${res.status} ${errorText}`);
  }

  return res.json();
}

export function getProducts() {
  return apiFetch('/products/');
}
