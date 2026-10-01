"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders } from "@/lib/api";

type OrderItem = {
  id: number;
  product: number;
  product_title: string;
  seller: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

type Order = {
  id: number;
  order_number: string;
  buyer: number;
  status: string;
  total_amount: string;
  shipping_address: string;
  items: OrderItem[];
  created_at: string;
};

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  CONFIRMED: "تأیید شده",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOrders();

      setOrders(
        data?.results || data || []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "دریافت سفارش‌ها با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#07110c] px-4 py-12 text-white"
      >
        <div className="mx-auto max-w-6xl text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

          <p className="mt-4 text-white/50">
            در حال دریافت سفارش‌ها...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07110c] px-4 py-8 text-white md:px-8"
    >
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">

          <Link
            href="/"
            className="text-sm text-green-400"
          >
            ← صفحه اصلی
          </Link>

          <h1 className="mt-4 text-3xl font-black">
            سفارش‌های من
          </h1>

          <p className="mt-2 text-sm text-white/40">
            تاریخچه سفارش‌های ثبت‌شده شما
          </p>

        </div>


        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}


        {orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">

            <div className="text-6xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-black">
              هنوز سفارشی ندارید
            </h2>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 font-bold hover:bg-green-700"
            >
              خرید محصول
            </Link>

          </div>
        ) : (

          <div className="space-y-5">

            {orders.map((order) => (

              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-xs text-white/30">
                      شماره سفارش
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      #{order.order_number}
                    </h2>

                  </div>


                  <span className="w-fit rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                    {statusLabels[
                      order.status
                    ] || order.status}
                  </span>

                </div>


                <div className="my-5 border-t border-white/10" />


                <div className="space-y-3">

                  {order.items.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl bg-black/20 p-4"
                      >

                        <div>

                          <p className="font-bold">
                            {item.product_title}
                          </p>

                          <p className="mt-1 text-xs text-white/40">
                            تعداد:{" "}
                            {item.quantity}
                          </p>

                        </div>

                        <div className="text-left">

                          <p className="font-bold">
                            {Number(
                              item.subtotal
                            ).toLocaleString(
                              "fa-IR"
                            )}{" "}
                            تومان
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>


                <div className="mt-5 grid gap-4 md:grid-cols-2">

                  <div className="rounded-2xl bg-black/20 p-4">

                    <p className="text-xs text-white/30">
                      آدرس ارسال
                    </p>

                    <p className="mt-2 text-sm leading-6">
                      {order.shipping_address}
                    </p>

                  </div>


                  <div className="rounded-2xl bg-black/20 p-4">

                    <p className="text-xs text-white/30">
                      مبلغ کل
                    </p>

                    <p className="mt-2 text-xl font-black text-green-400">
                      {Number(
                        order.total_amount
                      ).toLocaleString(
                        "fa-IR"
                      )}{" "}
                      تومان
                    </p>

                  </div>

                </div>


                <p className="mt-4 text-xs text-white/30">
                  {new Date(
                    order.created_at
                  ).toLocaleString(
                    "fa-IR"
                  )}
                </p>

              </div>

            ))}

          </div>
        )}

      </div>
    </main>
  );
}