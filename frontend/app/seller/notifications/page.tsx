"use client";

import { useEffect, useState } from "react";
import SellerNav from "@/components/SellerNav";
import { getMyNotifications } from "@/lib/api";

type Notification = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyNotifications();

      setNotifications(data?.results || data || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "دریافت اعلان‌ها ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07130d] px-4 py-8 text-white md:px-8"
    >
      <div className="mx-auto max-w-5xl">

        <div className="mb-6">
          <p className="mb-2 text-sm text-green-400">
            پنل فروشنده
          </p>

          <h1 className="text-3xl font-black">
            پیام‌ها و اعلان‌ها
          </h1>

          <p className="mt-2 text-white/50">
            اعلان‌های مربوط به محصولات و سفارش‌های شما
          </p>
        </div>

        <SellerNav />

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />
            <p className="text-white/60">
              در حال دریافت اعلان‌ها...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">
            <div className="mb-4 text-5xl">
              🔔
            </div>

            <h2 className="text-xl font-bold">
              پیامی وجود ندارد
            </h2>

            <p className="mt-2 text-sm text-white/40">
              اعلان‌های مربوط به تأیید یا رد محصولات و سفارش‌های شما اینجا نمایش داده می‌شود.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-5 transition ${
                  notification.is_read
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-green-500/30 bg-green-500/[0.06]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-xl">
                    🔔
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-bold">
                        {notification.title}
                      </h2>

                      {!notification.is_read && (
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                          جدید
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-7 text-white/60">
                      {notification.message}
                    </p>

                    <p className="mt-3 text-xs text-white/30">
                      {new Date(
                        notification.created_at
                      ).toLocaleString("fa-IR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}