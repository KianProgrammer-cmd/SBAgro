"use client";

import { useState } from "react";
import Captcha from "@/components/Captcha";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
    role: "BUYER",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!captchaToken) {
      setError("لطفاً کپچا را تأیید کنید.");
      return;
    }

    setLoading(true);

    try {
      await register({
        ...form,
        role: form.role as "BUYER" | "SELLER",
        captchaToken,
      });

      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "ثبت‌نام ناموفق بود. اطلاعات را بررسی کنید."
      );

      setCaptchaToken("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-8 shadow-2xl backdrop-blur-xl">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              ثبت‌نام در SBcropmarket
            </h1>

            <p className="mt-2 text-white/60">
              حساب کاربری جدید ایجاد کنید
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                نام کاربری
              </label>

              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  updateField("username", e.target.value)
                }
                required
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-green-500"
                placeholder="نام کاربری"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                ایمیل
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-green-500"
                placeholder="example@email.com"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                شماره موبایل
              </label>

              <input
                type="tel"
                value={form.mobile}
                onChange={(e) =>
                  updateField("mobile", e.target.value)
                }
                required
                autoComplete="tel"
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-green-500"
                placeholder="09123456789"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                رمز عبور
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  updateField("password", e.target.value)
                }
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-green-500"
                placeholder="حداقل ۱۰ کاراکتر"
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                نوع حساب
              </label>

              <select
                value={form.role}
                onChange={(e) =>
                  updateField("role", e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 bg-black/20 px-4 py-3 outline-none transition focus:border-green-500"
              >
                <option value="BUYER">
                  خریدار
                </option>

                <option value="SELLER">
                  فروشنده
                </option>
              </select>
            </div>

            {/* Cloudflare Turnstile */}
            <Captcha
              onSuccess={(token) => {
                setCaptchaToken(token);
                setError("");
              }}
              onExpire={() => {
                setCaptchaToken("");
                setError("اعتبار کپچا تمام شد. لطفاً دوباره تأیید کنید.");
              }}
              onError={() => {
                setCaptchaToken("");
                setError(
                  "خطا در بارگذاری کپچا. دوباره تلاش کنید."
                );
              }}
            />

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full rounded-xl bg-green-600 px-4 py-3 font-bold transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "در حال ثبت‌نام..."
                : "ایجاد حساب"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            قبلاً حساب دارید؟

            <a
              href="/login"
              className="mr-2 text-green-400 hover:text-green-300"
            >
              وارد شوید
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}