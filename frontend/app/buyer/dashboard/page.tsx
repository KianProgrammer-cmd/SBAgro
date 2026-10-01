"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyOrders, Order, OrderStatus } from "@/lib/api";

const statusInfo: Record<
  OrderStatus,
  {
    label: string;
    icon: string;
    description: string;
  }
> = {
  PENDING: {
    label: "در انتظار بررسی",
    icon: "⏳",
    description: "سفارش شما ثبت شده و منتظر بررسی است.",
  },
  PAID: {
    label: "پرداخت شده",
    icon: "💳",
    description: "پرداخت سفارش با موفقیت انجام شده است.",
  },
  SHIPPED: {
    label: "ارسال شده",
    icon: "🚚",
    description: "سفارش شما ارسال شده است.",
  },
  DELIVERED: {
    label: "تحویل داده شده",
    icon: "✅",
    description: "سفارش با موفقیت تحویل داده شده است.",
  },
  CANCELLED: {
    label: "لغو شده",
    icon: "❌",
    description: "این سفارش لغو شده است.",
  },
};

const normalSteps: OrderStatus[] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
];

export default function BuyerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOrders();

      setOrders(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "دریافت سفارش‌ها با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (o) => o.status === "PENDING"
      ).length,
      shipped: orders.filter(
        (o) => o.status === "SHIPPED"
      ).length,
      delivered: orders.filter(
        (o) => o.status === "DELIVERED"
      ).length,
    };
  }, [orders]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07110c] px-4 py-8 text-white md:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-green-400">
              SBcropmarket
            </p>

            <h1 className="text-3xl font-black md:text-4xl">
              پنل خریدار
            </h1>

            <p className="mt-2 text-sm text-white/50">
              مدیریت سفارش‌ها و پیگیری وضعیت مرسوله
            </p>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-50"
          >
            ↻ بروزرسانی
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="کل سفارش‌ها"
            value={stats.total}
            icon="📦"
          />

          <StatCard
            title="در انتظار بررسی"
            value={stats.pending}
            icon="⏳"
          />

          <StatCard
            title="در حال ارسال"
            value={stats.shipped}
            icon="🚚"
          />

          <StatCard
            title="تحویل شده"
            value={stats.delivered}
            icon="✅"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Orders */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                سفارش‌های من
              </h2>

              <p className="mt-1 text-sm text-white/40">
                آخرین سفارش‌های ثبت‌شده شما
              </p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================
   Stat Card
========================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-green-500/20">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-2xl">
          {icon}
        </span>

        <span className="text-xs text-white/30">
          SBcropmarket
        </span>
      </div>

      <div className="text-3xl font-black">
        {value}
      </div>

      <div className="mt-1 text-sm text-white/50">
        {title}
      </div>
    </div>
  );
}

/* =========================
   Order Card
========================= */

function OrderCard({
  order,
}: {
  order: Order;
}) {
  const info = statusInfo[order.status];

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

      {/* Order Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black">
              سفارش #{order.order_number}
            </h3>

            <span
              className={`
                rounded-full px-3 py-1 text-xs font-bold
                ${
                  order.status === "DELIVERED"
                    ? "bg-green-500/15 text-green-400"
                    : order.status === "CANCELLED"
                    ? "bg-red-500/15 text-red-400"
                    : order.status === "SHIPPED"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-yellow-500/15 text-yellow-400"
                }
              `}
            >
              {info.icon} {info.label}
            </span>
          </div>

          <p className="mt-2 text-xs text-white/40">
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="text-right md:text-left">
          <div className="text-xs text-white/40">
            مبلغ سفارش
          </div>

          <div className="mt-1 text-lg font-black text-green-400">
            {formatPrice(order.total_amount)} تومان
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-5">
        <div className="mb-5">
          <h4 className="mb-3 text-sm font-bold text-white/60">
            محصولات سفارش
          </h4>

          <div className="space-y-2">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-black/20 p-3"
              >
                <div>
                  <div className="font-bold">
                    {item.product_title}
                  </div>

                  <div className="mt-1 text-xs text-white/40">
                    تعداد: {item.quantity} {""}
                    • قیمت واحد:{" "}
                    {formatPrice(item.unit_price)} تومان
                  </div>
                </div>

                <div className="text-sm font-bold">
                  {formatPrice(item.subtotal)} تومان
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-black/20 p-4">
          <div className="mb-2 text-xs text-white/40">
            📍 آدرس ارسال
          </div>

          <div className="text-sm leading-6 text-white/80">
            {order.shipping_address || "آدرس ثبت نشده است"}
          </div>
        </div>

        {/* Tracking */}
        <TrackingStatus status={order.status} />
      </div>
    </div>
  );
}

/* =========================
   Tracking
========================= */

function TrackingStatus({
  status,
}: {
  status: OrderStatus;
}) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            ❌
          </div>

          <div>
            <div className="font-black text-red-300">
              سفارش لغو شده
            </div>

            <div className="mt-1 text-xs text-red-300/60">
              این سفارش دیگر در روند ارسال قرار ندارد.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = normalSteps.indexOf(status);

  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
      <div className="mb-6">
        <h4 className="font-black">
          وضعیت مرسوله
        </h4>

        <p className="mt-1 text-xs text-white/40">
          {statusInfo[status].description}
        </p>
      </div>

      <div className="relative">
        {normalSteps.map((step, index) => {
          const completed = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const stepInfo = statusInfo[step];

          return (
            <div
              key={step}
              className="relative flex gap-4 pb-7 last:pb-0"
            >
              {/* Line */}
              {index < normalSteps.length - 1 && (
                <div
                  className={`
                    absolute right-[15px] top-8 h-[calc(100%-8px)] w-[2px]
                    ${
                      index < currentIndex
                        ? "bg-green-500"
                        : "bg-white/10"
                    }
                  `}
                />
              )}

              {/* Circle */}
              <div
                className={`
                  relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm
                  ${
                    completed
                      ? "border-green-500 bg-green-500 text-black"
                      : "border-white/10 bg-white/5 text-white/30"
                  }
                  ${
                    isCurrent
                      ? "ring-4 ring-green-500/10"
                      : ""
                  }
                `}
              >
                {completed ? "✓" : index + 1}
              </div>

              {/* Text */}
              <div className="pt-1">
                <div
                  className={`
                    text-sm font-bold
                    ${
                      completed
                        ? "text-white"
                        : "text-white/30"
                    }
                  `}
                >
                  {stepInfo.icon} {stepInfo.label}
                </div>

                {isCurrent && (
                  <div className="mt-1 text-xs text-green-400">
                    وضعیت فعلی سفارش
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   Loading
========================= */

function Loading() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

      <p className="text-sm text-white/50">
        در حال دریافت سفارش‌ها...
      </p>
    </div>
  );
}

/* =========================
   Empty
========================= */

function EmptyOrders() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">
      <div className="mb-4 text-6xl">
        🛒
      </div>

      <h2 className="text-xl font-black">
        هنوز سفارشی ثبت نکرده‌اید
      </h2>

      <p className="mt-2 text-sm text-white/40">
        بعد از ثبت سفارش، وضعیت آن در این قسمت نمایش داده می‌شود.
      </p>
    </div>
  );
}

/* =========================
   Helpers
========================= */

function formatPrice(value: string | number) {
  return Number(value).toLocaleString("fa-IR");
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}