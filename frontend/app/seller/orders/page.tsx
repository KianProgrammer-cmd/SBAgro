"use client";

import { useEffect, useState } from "react";
import { getSellerOrders, updateSellerOrderStatus } from "@/lib/api";
import SellerNav from "@/components/SellerNav";

type OrderItem = {
  id: number;
  product: number;
  product_title: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

type Order = {
  id: number;
  order_number: string;
  buyer_name: string;
  buyer_mobile: string;
  status: string;
  shipping_address: string;
  items: OrderItem[];
  seller_subtotal: string;
  created_at: string;
};

const statusLabels: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "در انتظار پرداخت",
    className: "bg-yellow-500/10 text-yellow-400",
  },
  PAID: {
    label: "پرداخت شده",
    className: "bg-green-500/10 text-green-400",
  },
  SHIPPED: {
    label: "در حال ارسال",
    className: "bg-blue-500/10 text-blue-400",
  },
  DELIVERED: {
    label: "تحویل شده",
    className: "bg-green-500/10 text-green-400",
  },
  CANCELLED: {
    label: "لغو شده",
    className: "bg-red-500/10 text-red-400",
  },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await getSellerOrders();
      setOrders(data?.results || data || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "دریافت سفارش‌ها ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleShipOrder(orderId: number) {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که این سفارش ارسال شده است؟"
    );

    if (!confirmed) return;

    try {
      setUpdatingOrderId(orderId);
      setError("");

      const updatedOrder = await updateSellerOrderStatus(
        orderId,
        "SHIPPED"
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...(updatedOrder?.order || updatedOrder),
                status: "SHIPPED",
              }
            : order
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message || "تغییر وضعیت سفارش انجام نشد."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      order.buyer_name?.toLowerCase().includes(query) ||
      order.order_number?.toLowerCase().includes(query) ||
      order.items.some((item) =>
        item.product_title?.toLowerCase().includes(query)
      )
    );
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07130d] px-4 py-8 text-white md:px-8"
    >
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-green-400">
            پنل فروشنده
          </p>

          <h1 className="text-3xl font-black">
            سفارش‌های دریافتی
          </h1>

          <p className="mt-2 text-white/50">
            خریدارانی که از محصولات شما سفارش داده‌اند
          </p>
        </div>

        <SellerNav />

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام خریدار، شماره سفارش یا محصول..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="rounded-lg px-3 py-1 text-white/60 hover:bg-white/10"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

            <p className="text-white/60">
              در حال دریافت سفارش‌ها...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty */
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">
            <div className="mb-4 text-5xl">
              🧾
            </div>

            <h2 className="text-xl font-bold">
              سفارشی وجود ندارد
            </h2>

            <p className="mt-2 text-sm text-white/40">
              وقتی کسی از محصولات شما خرید کند،
              سفارش در اینجا نمایش داده می‌شود.
            </p>
          </div>
        ) : (
          /* Orders */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status =
                statusLabels[order.status] || {
                  label: order.status,
                  className: "bg-white/10 text-white/60",
                };

              const isUpdating =
                updatingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
                >
                  {/* Order Header */}
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="font-black">
                          سفارش #{order.order_number}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-white/50">
                        خریدار: {order.buyer_name}

                        {order.buyer_mobile &&
                          ` — ${order.buyer_mobile}`}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {new Date(
                          order.created_at
                        ).toLocaleString("fa-IR")}
                      </p>
                    </div>

                    {/* Seller subtotal */}
                    <div className="text-left">
                      <div className="text-xs text-white/40">
                        مجموع سهم شما
                      </div>

                      <div className="text-lg font-black text-green-400">
                        {Number(
                          order.seller_subtotal
                        ).toLocaleString("fa-IR")}{" "}
                        تومان
                      </div>
                    </div>

                  </div>

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="mb-4 rounded-xl bg-black/20 p-4">
                      <div className="mb-1 text-xs text-white/30">
                        آدرس ارسال
                      </div>

                      <p className="text-sm text-white/60">
                        📍 {order.shipping_address}
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/20 px-4 py-3 text-sm"
                      >
                        <span className="font-medium">
                          {item.product_title}
                        </span>

                        <span className="text-white/50">
                          {item.quantity.toLocaleString("fa-IR")}
                          {" × "}
                          {Number(
                            item.unit_price
                          ).toLocaleString("fa-IR")}
                          {" تومان"}
                        </span>

                        <span className="font-bold">
                          {Number(
                            item.subtotal
                          ).toLocaleString("fa-IR")}
                          {" تومان"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">

                    <div className="text-sm text-white/40">
                      {order.status === "PAID" &&
                        "پرداخت با موفقیت انجام شده و سفارش آماده ارسال است."}

                      {order.status === "SHIPPED" &&
                        "سفارش ارسال شده و منتظر تأیید خریدار است."}

                      {order.status === "DELIVERED" &&
                        "خریدار دریافت سفارش را تأیید کرده است."}

                      {order.status === "PENDING" &&
                        "منتظر پرداخت خریدار."}

                      {order.status === "CANCELLED" &&
                        "این سفارش لغو شده است."}
                    </div>

                    {/* Ship button */}
                    {order.status === "PAID" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleShipOrder(order.id)
                        }
                        disabled={isUpdating}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating
                          ? "در حال ثبت..."
                          : "🚚 ارسال سفارش"}
                      </button>
                    )}

                    {/* Already shipped */}
                    {order.status === "SHIPPED" && (
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-300">
                        🚚 سفارش ارسال شده
                      </div>
                    )}

                    {/* Delivered */}
                    {order.status === "DELIVERED" && (
                      <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-bold text-green-300">
                        ✅ تحویل توسط خریدار تأیید شد
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}