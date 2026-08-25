'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');

    if (!captchaToken) {
      setError('لطفاً کپچا را تأیید کنید.');
      return;
    }

    setLoading(true);

    try {
      await login(username, password, captchaToken);
      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'نام کاربری یا رمز عبور اشتباه است.');
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-surface/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              ورود به SBcropmarket
            </h1>

            <p className="mt-2 text-white/60">
              به حساب کاربری خود وارد شوید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium">
                نام کاربری
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-green-500 transition"
                placeholder="نام کاربری"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                رمز عبور
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-green-500 transition"
                placeholder="رمز عبور"
              />
            </div>

            <div className="flex justify-center">
              <Turnstile
                siteKey="0x4AAAAAAEbivMMRDkm0MtKN"
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                onError={() => {
                  setCaptchaToken('');
                  setError('خطا در بارگذاری کپچا. دوباره تلاش کنید.');
                }}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full rounded-xl bg-green-600 px-4 py-3 font-bold transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            حساب کاربری ندارید؟
            <a
              href="/register"
              className="mr-2 text-green-400 hover:text-green-300"
            >
              ثبت‌نام کنید
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
