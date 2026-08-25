import { apiFetch } from './api';

export async function login(
  username: string,
  password: string,
  captchaToken: string
) {
  const data = await apiFetch('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      captcha_token: captchaToken,
    }),
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);

    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
  }

  return data;
}

type RegisterData = {
  username: string;
  email: string;
  mobile: string;
  password: string;
  role: 'BUYER' | 'SELLER';
  captchaToken: string;
};

export async function register(data: RegisterData) {
  const response = await apiFetch('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username: data.username,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      role: data.role,
      captcha_token: data.captchaToken,
    }),
  });

  return response;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
}
