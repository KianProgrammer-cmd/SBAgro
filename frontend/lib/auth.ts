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

  console.log('LOGIN API RESPONSE:', data);

  if (!data?.access) {
    throw new Error(
      'سرور Access Token ارسال نکرد. پاسخ سرور را در Console بررسی کنید.'
    );
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);

    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }

    console.log(
      'ACCESS TOKEN SAVED:',
      !!localStorage.getItem('access_token')
    );
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
  return apiFetch('/auth/register/', {
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
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
}
