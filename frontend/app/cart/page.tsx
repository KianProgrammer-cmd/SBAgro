"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  type Cart,
} from "@/lib/api";

function formatPrice(price: string | number) {
  return Number(price).toLocaleString("fa-IR");
}

function getImageUrl(image: string | null) {
  if (!image) return null;

  if (image.startsWith("http")) {
    return image;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api";

  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const data = await getCart();
      setCart(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "خطا در دریافت سبد خرید"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function changeQuantity(
    itemId: number,
    quantity: number
  ) {
    if (quantity < 1) return;

    try {
      setUpdating(itemId);

      const updated = await updateCartItem(
        itemId,
        quantity
      );

      setCart(updated);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "خطا در تغییر تعداد محصول"
      );
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(itemId: number) {
    try {
      setUpdating(itemId);

      await removeCartItem(itemId);

      await loadCart();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "خطا در حذف محصول"
      );
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white flex items-center justify-center"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

          <p className="text-white/60">
            در حال دریافت سبد خرید...
          </p>
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white px-4 py-12"
      >
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-[#0b0b0b] p-8 text-center">
          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h1 className="text-xl font-bold">
            خطا در دریافت سبد خرید
          </h1>

          <p className="mt-3 text-sm text-red-300">
            {error}
          </p>

          <button
            onClick={loadCart}
            className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold transition hover:bg-green-700"
          >
            تلاش دوباره
          </button>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-12">

          <div className="mb-10">
            <h1 className="text-3xl font-black">
              سبد خرید
            </h1>

            <p className="mt-2 text-white/50">
              محصولات انتخاب‌شده شما
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#090909] px-6 py-20 text-center shadow-2xl">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-5xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              سبد خرید شما خالی است
            </h2>

            <p className="mt-3 text-white/50">
              هنوز محصولی به سبد خرید اضافه نکرده‌اید.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-xl bg-green-600 px-7 py-3 font-bold transition hover:bg-green-700"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-black md:text-4xl">
            سبد خرید
          </h1>

          <p className="mt-2 text-white/50">
            {items.length.toLocaleString("fa-IR")} محصول در سبد خرید شما
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* Products */}

          <section className="space-y-4">

            {items.map((item) => {
              const imageUrl = getImageUrl(
                item.product_detail.image
              );

              return (
                <div
                  key={item.id}
                  className="group rounded-3xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl transition hover:border-white/20"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">

                    {/* Image */}

                    <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-[#111] sm:h-32 sm:w-32">

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={
                            item.product_detail.title
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          🌱
                        </div>
                      )}

                    </div>

                    {/* Info */}

                    <div className="flex min-w-0 flex-1 flex-col justify-between">

                      <div>
                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <h2 className="text-lg font-bold">
                              {
                                item.product_detail
                                  .title
                              }
                            </h2>

                            <p className="mt-1 text-sm text-white/40">
                              فروشنده:{" "}
                              {
                                item.product_detail
                                  .seller_name
                              }
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeItem(item.id)
                            }
                            disabled={
                              updating === item.id
                            }
                            className="rounded-xl p-2 text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                            title="حذف محصول"
                          >
                            🗑️
                          </button>

                        </div>
                      </div>

                      {/* Bottom */}

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        {/* Quantity */}

                        <div>
                          <p className="mb-2 text-xs text-white/40">
                            تعداد
                          </p>

                          <div className="flex w-fit items-center overflow-hidden rounded-xl border border-white/10 bg-[#111]">

                            <button
                              onClick={() =>
                                changeQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                updating === item.id
                              }
                              className="h-10 w-10 text-lg transition hover:bg-white/10 disabled:opacity-40"
                            >
                              +
                            </button>

                            <div className="flex h-10 min-w-12 items-center justify-center border-x border-white/10 px-3 font-bold">
                              {item.quantity.toLocaleString(
                                "fa-IR"
                              )}
                            </div>

                            <button
                              onClick={() =>
                                changeQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                updating === item.id ||
                                item.quantity <= 1
                              }
                              className="h-10 w-10 text-lg transition hover:bg-white/10 disabled:opacity-30"
                            >
                              −
                            </button>

                          </div>
                        </div>

                        {/* Price */}

                        <div className="text-right sm:text-left">

                          <p className="text-xs text-white/40">
                            قیمت
                          </p>

                          <p className="mt-1 text-xl font-black text-green-400">
                            {formatPrice(
                              item.subtotal
                            )}
                            <span className="mr-1 text-xs font-normal text-white/50">
                              تومان
                            </span>
                          </p>

                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </section>

          {/* Summary */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">

            <div className="rounded-3xl border border-white/10 bg-[#090909] p-6 shadow-2xl">

              <h2 className="text-xl font-black">
                خلاصه سفارش
              </h2>

              <div className="my-6 h-px bg-white/10" />

              <div className="space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-white/50">
                    تعداد کالا
                  </span>

                  <span className="font-bold">
                    {items.length.toLocaleString(
                      "fa-IR"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">
                    مبلغ کالاها
                  </span>

                  <span>
                    {formatPrice(
                      cart?.total || 0
                    )}{" "}
                    تومان
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">
                    هزینه ارسال
                  </span>

                  <span className="text-green-400">
                    محاسبه در مرحله بعد
                  </span>
                </div>

              </div>

              <div className="my-6 h-px bg-white/10" />

              <div className="flex items-center justify-between">

                <span className="font-bold">
                  مبلغ نهایی
                </span>

                <div className="text-left">

                  <div className="text-2xl font-black text-green-400">
                    {formatPrice(
                      cart?.total || 0
                    )}
                  </div>

                  <div className="text-xs text-white/40">
                    تومان
                  </div>

                </div>

              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-4 font-black transition hover:bg-green-700 active:scale-[0.98]"
              >
                ادامه و ثبت سفارش
              </Link>

              <Link
                href="/products"
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ادامه خرید
              </Link>

              <div className="mt-6 rounded-2xl border border-green-500/10 bg-green-500/5 p-4 text-xs leading-6 text-white/50">
                🔒 پرداخت امن پس از ثبت سفارش انجام می‌شود.
              </div>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}