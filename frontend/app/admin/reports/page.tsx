"use client";

import { useEffect, useState } from "react";
import {
  AdminFullReport,
  getAdminFullReport,
} from "@/lib/api";

function formatNumber(value: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(value));
}

function formatMoney(value: string | number) {
  return `${formatNumber(value)} تومان`;
}

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
};

export default function AdminReportsPage() {
  const [report, setReport] = useState<AdminFullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminFullReport();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "خطا در دریافت گزارش‌ها. دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white p-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-500" />
            <p className="text-white/60">
              در حال دریافت گزارش‌ها...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white p-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="mb-2 text-xl font-bold text-red-400">
              خطا در دریافت گزارش
            </h1>

            <p className="mb-5 text-white/70">
              {error}
            </p>

            <button
              onClick={loadReport}
              className="rounded-xl bg-green-600 px-5 py-3 font-bold transition hover:bg-green-700"
            >
              تلاش دوباره
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return null;
  }

  const { platform, sales, order_statuses, provinces } = report;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black text-white p-4 md:p-6"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              گزارش‌های سیستم
            </h1>

            <p className="mt-2 text-sm text-white/50">
              آمار و گزارش کامل عملکرد SBcropmarket
            </p>
          </div>

          <button
            onClick={loadReport}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold transition hover:bg-white/[0.1]"
          >
            🔄 بروزرسانی گزارش
          </button>
        </div>

        {/* Platform Stats */}
        <section>
          <h2 className="mb-4 text-xl font-bold">
            آمار کلی سیستم
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="کل سفارش‌ها"
              value={formatNumber(platform.total_orders)}
              icon="🛒"
            />

            <StatCard
              title="درآمد کل"
              value={formatMoney(platform.total_revenue)}
              icon="💰"
            />

            <StatCard
              title="فروشندگان"
              value={formatNumber(platform.total_sellers)}
              icon="👨‍🌾"
            />

            <StatCard
              title="خریداران"
              value={formatNumber(platform.total_buyers)}
              icon="👤"
            />

            <StatCard
              title="کل محصولات"
              value={formatNumber(platform.total_products)}
              icon="📦"
            />

            <StatCard
              title="محصولات تأیید شده"
              value={formatNumber(platform.approved_products)}
              icon="✅"
            />

            <StatCard
              title="محصولات در انتظار"
              value={formatNumber(platform.pending_products)}
              icon="⏳"
            />

            <StatCard
              title="محصولات غیرفعال"
              value={formatNumber(platform.inactive_products)}
              icon="⛔"
            />

          </div>
        </section>

        {/* Sales */}
        <section>
          <h2 className="mb-4 text-xl font-bold">
            خلاصه فروش
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            <SalesCard
              title="امروز"
              value={sales.today}
            />

            <SalesCard
              title="این هفته"
              value={sales.this_week}
            />

            <SalesCard
              title="این ماه"
              value={sales.this_month}
            />

            <SalesCard
              title="کل فروش"
              value={sales.all_time}
            />

          </div>
        </section>

        {/* Orders + Payments */}
        <section>
          <h2 className="mb-4 text-xl font-bold">
            وضعیت سفارش‌ها و پرداخت‌ها
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="در انتظار پرداخت"
              value={formatNumber(platform.pending_orders)}
              icon="⏳"
            />

            <StatCard
              title="پرداخت شده"
              value={formatNumber(platform.paid_orders)}
              icon="💳"
            />

            <StatCard
              title="ارسال شده"
              value={formatNumber(platform.shipped_orders)}
              icon="🚚"
            />

            <StatCard
              title="تحویل شده"
              value={formatNumber(platform.delivered_orders)}
              icon="📍"
            />

            <StatCard
              title="لغو شده"
              value={formatNumber(platform.cancelled_orders)}
              icon="❌"
            />

            <StatCard
              title="پرداخت موفق"
              value={formatNumber(platform.successful_payments)}
              icon="✔️"
            />

            <StatCard
              title="پرداخت در انتظار"
              value={formatNumber(platform.pending_payments)}
              icon="⌛"
            />

          </div>
        </section>

        {/* Order Status Table */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

          <div className="mb-5">
            <h2 className="text-xl font-bold">
              گزارش وضعیت سفارش‌ها
            </h2>

            <p className="mt-1 text-sm text-white/40">
              تعداد سفارش‌ها بر اساس وضعیت فعلی
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-right">

              <thead>
                <tr className="border-b border-white/10 text-sm text-white/50">
                  <th className="px-4 py-3">
                    وضعیت
                  </th>

                  <th className="px-4 py-3">
                    تعداد
                  </th>
                </tr>
              </thead>

              <tbody>
                {order_statuses.map((item) => (
                  <tr
                    key={item.status}
                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-4">
                      {statusLabels[item.status] ||
                        item.label ||
                        item.status}
                    </td>

                    <td className="px-4 py-4 font-bold text-green-400">
                      {formatNumber(item.count)}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </section>

        {/* Province Report */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

          <div className="mb-5">
            <h2 className="text-xl font-bold">
              گزارش فروش بر اساس استان
            </h2>

            <p className="mt-1 text-sm text-white/40">
              عملکرد محصولات و فروش در استان‌های مختلف
            </p>
          </div>

          {provinces.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-center text-white/50">
              هنوز اطلاعاتی برای نمایش وجود ندارد.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-right">

                <thead>
                  <tr className="border-b border-white/10 text-sm text-white/50">

                    <th className="px-4 py-3">
                      استان
                    </th>

                    <th className="px-4 py-3">
                      تعداد محصولات
                    </th>

                    <th className="px-4 py-3">
                      مقدار فروش
                    </th>

                    <th className="px-4 py-3">
                      درآمد
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {provinces.map((province) => (
                    <tr
                      key={province.province_id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >

                      <td className="px-4 py-4 font-bold">
                        {province.province_name}
                      </td>

                      <td className="px-4 py-4">
                        {formatNumber(
                          province.product_count
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatNumber(
                          province.sold_quantity
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold text-green-400">
                        {formatMoney(
                          province.revenue
                        )}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* Bottom Summary */}
        <section className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">

          <h2 className="mb-4 text-xl font-bold">
            خلاصه عملکرد
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div>
              <p className="text-sm text-white/40">
                کل سفارش‌ها
              </p>

              <p className="mt-1 text-2xl font-black">
                {formatNumber(platform.total_orders)}
              </p>
            </div>

            <div>
              <p className="text-sm text-white/40">
                کل درآمد
              </p>

              <p className="mt-1 text-2xl font-black text-green-400">
                {formatMoney(platform.total_revenue)}
              </p>
            </div>

            <div>
              <p className="text-sm text-white/40">
                تعداد محصولات
              </p>

              <p className="mt-1 text-2xl font-black">
                {formatNumber(platform.total_products)}
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-green-500/30 hover:bg-white/[0.05]">

      <div className="mb-4 flex items-center justify-between">

        <span className="text-2xl">
          {icon}
        </span>

        <span className="text-xs text-white/40">
          SBcropmarket
        </span>

      </div>

      <p className="text-sm text-white/50">
        {title}
      </p>

      <p className="mt-2 break-words text-xl font-black">
        {value}
      </p>

    </div>
  );
}

function SalesCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-5">

      <p className="text-sm text-white/50">
        {title}
      </p>

      <p className="mt-3 text-2xl font-black text-green-400">
        {formatMoney(value)}
      </p>

    </div>
  );
}