"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCart,
  createOrder,
  initiatePayment,
  type Cart,
  type PaymentGateway,
} from "@/lib/api";

type SavedAddress = {
  id: string;
  title: string;
  recipient: string;
  mobile: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
};

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

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [paymentGateway, setPaymentGateway] =
    useState<PaymentGateway>("ZARINPAL");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    recipient: "",
    mobile: "",
    province: "",
    city: "",
    postalCode: "",
    address: "",
  });

  /* =====================================================
     LOAD CART + ADDRESSES
  ===================================================== */

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const cartData = await getCart();
        setCart(cartData);

        const saved =
          localStorage.getItem(
            "sbcropmarket_addresses"
          );

        if (saved) {
          const parsed: SavedAddress[] =
            JSON.parse(saved);

          setAddresses(parsed);

          if (parsed.length > 0) {
            setSelectedAddressId(parsed[0].id);
          }
        }
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "خطا در دریافت اطلاعات سفارش"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =====================================================
     SAVE ADDRESSES
  ===================================================== */

  function saveAddresses(
    newAddresses: SavedAddress[]
  ) {
    setAddresses(newAddresses);

    localStorage.setItem(
      "sbcropmarket_addresses",
      JSON.stringify(newAddresses)
    );
  }

  /* =====================================================
     ADD ADDRESS
  ===================================================== */

  function addAddress() {
    if (
      !form.title ||
      !form.recipient ||
      !form.mobile ||
      !form.province ||
      !form.city ||
      !form.postalCode ||
      !form.address
    ) {
      setError(
        "لطفاً تمام اطلاعات آدرس را وارد کنید."
      );
      return;
    }

    const newAddress: SavedAddress = {
      id: crypto.randomUUID(),
      ...form,
    };

    const updated = [
      ...addresses,
      newAddress,
    ];

    saveAddresses(updated);

    setSelectedAddressId(newAddress.id);

    setForm({
      title: "",
      recipient: "",
      mobile: "",
      province: "",
      city: "",
      postalCode: "",
      address: "",
    });

    setShowAddressForm(false);
    setError("");
  }

  /* =====================================================
     DELETE ADDRESS
  ===================================================== */

  function deleteAddress(id: string) {
    const updated = addresses.filter(
      (address) => address.id !== id
    );

    saveAddresses(updated);

    if (selectedAddressId === id) {
      setSelectedAddressId(
        updated.length > 0
          ? updated[0].id
          : null
      );
    }
  }

  /* =====================================================
     SUBMIT ORDER
  ===================================================== */

  async function handleCheckout() {
    if (!cart || cart.items.length === 0) {
      setError("سبد خرید شما خالی است.");
      return;
    }

    const selectedAddress = addresses.find(
      (address) =>
        address.id === selectedAddressId
    );

    if (!selectedAddress) {
      setError(
        "لطفاً یک آدرس برای ارسال انتخاب کنید."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const shippingAddress = [
        `گیرنده: ${selectedAddress.recipient}`,
        `شماره تماس: ${selectedAddress.mobile}`,
        `استان: ${selectedAddress.province}`,
        `شهر: ${selectedAddress.city}`,
        `کد پستی: ${selectedAddress.postalCode}`,
        `آدرس: ${selectedAddress.address}`,
      ].join("\n");

      /* ایجاد سفارش */

      const order = await createOrder(
        shippingAddress
      );

      /* شروع پرداخت */

      const payment = await initiatePayment(
        order.id,
        paymentGateway
      );

      if (!payment?.redirect_url) {
        throw new Error(
          "آدرس پرداخت از سمت سرور دریافت نشد."
        );
      }

      window.location.href =
        payment.redirect_url;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "خطا در ثبت سفارش یا شروع پرداخت"
      );

      setSubmitting(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white flex items-center justify-center"
      >
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

          <p className="text-white/50">
            در حال آماده‌سازی سفارش...
          </p>

        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR WITHOUT CART
  ===================================================== */

  if (error && !cart) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white px-4 py-12"
      >
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-[#090909] p-8 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-xl font-black">
            خطا
          </h1>

          <p className="mt-3 text-sm text-red-300">
            {error}
          </p>

          <Link
            href="/cart"
            className="mt-6 inline-flex rounded-xl bg-green-600 px-6 py-3 font-bold transition hover:bg-green-700"
          >
            بازگشت به سبد خرید
          </Link>

        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black text-white"
      >
        <div className="mx-auto max-w-5xl px-4 py-12">

          <div className="rounded-3xl border border-white/10 bg-[#090909] px-6 py-20 text-center">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-5xl">
              🛒
            </div>

            <h1 className="mt-6 text-2xl font-black">
              سبد خرید خالی است
            </h1>

            <p className="mt-3 text-white/50">
              برای ادامه خرید ابتدا محصولی انتخاب کنید.
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

  /* =====================================================
     SELECTED ADDRESS
  ===================================================== */

  const selectedAddress = addresses.find(
    (address) =>
      address.id === selectedAddressId
  );

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">

        {/* HEADER */}

        <div className="mb-8">

          <div className="flex flex-wrap items-center gap-2 text-sm text-white/40">
            <Link
              href="/cart"
              className="transition hover:text-white"
            >
              سبد خرید
            </Link>

            <span>←</span>

            <span className="text-green-400">
              تکمیل سفارش
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black md:text-4xl">
            تکمیل سفارش
          </h1>

          <p className="mt-2 text-white/50">
            آدرس ارسال و روش پرداخت را انتخاب کنید.
          </p>

        </div>

        {/* STEPS */}

        <div className="mb-8 rounded-3xl border border-white/10 bg-[#090909] p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-black">
                ✓
              </div>

              <span className="text-sm font-bold">
                سبد خرید
              </span>

            </div>

            <div className="h-px flex-1 bg-green-600/40 mx-4" />

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-black">
                ۲
              </div>

              <span className="text-sm font-bold text-green-400">
                اطلاعات سفارش
              </span>

            </div>

            <div className="h-px flex-1 bg-white/10 mx-4" />

            <div className="hidden sm:flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/50">
                ۳
              </div>

              <span className="text-sm text-white/40">
                پرداخت
              </span>

            </div>

          </div>

        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">

            {/* ADDRESS */}

            <section className="rounded-3xl border border-white/10 bg-[#090909] p-5 md:p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-xl font-black">
                    📍 آدرس ارسال
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    سفارش شما به این آدرس ارسال خواهد شد.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowAddressForm(
                      !showAddressForm
                    )
                  }
                  className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400 transition hover:bg-green-500/20"
                >
                  + آدرس جدید
                </button>

              </div>

              {/* ADDRESS FORM */}

              {showAddressForm && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black p-5">

                  <h3 className="mb-5 font-bold">
                    افزودن آدرس جدید
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">

                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title: e.target.value,
                        })
                      }
                      placeholder="عنوان آدرس، مثلاً منزل"
                      className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-green-500"
                    />

                    <input
                      value={form.recipient}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          recipient: e.target.value,
                        })
                      }
                      placeholder="نام گیرنده"
                      className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-green-500"
                    />

                    <input
                      value={form.mobile}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          mobile: e.target.value,
                        })
                      }
                      placeholder="شماره موبایل"
                      inputMode="tel"
                      className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-green-500"
                    />

                    <input
                      value={form.province}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          province: e.target.value,
                        })
                      }
                      placeholder="استان"
                      className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-green-500"
                    />

                    <input
                      value={form.city}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          city: e.target.value,
                        })
                      }
                      placeholder="شهر"
                      className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-green-500"
                    />

                    <input
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          postalCode: e.target.value,
                        })
                      }
                      placeholder="کد پستی"
                      inputMode="numeric"
                      className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-green-500"
                    />

                  </div>

                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                    placeholder="آدرس کامل"
                    rows={4}
                    className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-green-500"
                  />

                  <div className="mt-4 flex gap-3">

                    <button
                      onClick={addAddress}
                      className="rounded-xl bg-green-600 px-5 py-3 font-bold transition hover:bg-green-700"
                    >
                      ذخیره آدرس
                    </button>

                    <button
                      onClick={() =>
                        setShowAddressForm(false)
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      انصراف
                    </button>

                  </div>

                </div>
              )}

              {/* SAVED ADDRESSES */}

              {addresses.length === 0 &&
                !showAddressForm && (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black p-8 text-center">

                    <div className="text-4xl">
                      📦
                    </div>

                    <p className="mt-3 font-bold">
                      هنوز آدرسی ثبت نشده است.
                    </p>

                    <p className="mt-2 text-sm text-white/40">
                      برای ادامه یک آدرس اضافه کنید.
                    </p>

                    <button
                      onClick={() =>
                        setShowAddressForm(true)
                      }
                      className="mt-5 rounded-xl bg-green-600 px-5 py-3 font-bold"
                    >
                      افزودن آدرس
                    </button>

                  </div>
                )}

              {addresses.length > 0 && (
                <div className="mt-6 space-y-3">

                  {addresses.map(
                    (address) => {
                      const selected =
                        selectedAddressId ===
                        address.id;

                      return (
                        <div
                          key={address.id}
                          onClick={() =>
                            setSelectedAddressId(
                              address.id
                            )
                          }
                          className={`cursor-pointer rounded-2xl border p-4 transition ${
                            selected
                              ? "border-green-500/50 bg-green-500/5"
                              : "border-white/10 bg-black hover:border-white/20"
                          }`}
                        >

                          <div className="flex items-start gap-4">

                            <div
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-green-500 bg-green-500"
                                  : "border-white/30"
                              }`}
                            >
                              {selected && (
                                <span className="text-xs font-black text-black">
                                  ✓
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-center justify-between gap-3">

                                <div className="font-black">
                                  {address.title}
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAddress(
                                      address.id
                                    );
                                  }}
                                  className="text-xs text-red-400/70 hover:text-red-400"
                                >
                                  حذف
                                </button>

                              </div>

                              <p className="mt-2 text-sm text-white/70">
                                {address.recipient} ·{" "}
                                {address.mobile}
                              </p>

                              <p className="mt-1 text-sm leading-6 text-white/40">
                                {address.province}،{" "}
                                {address.city}،{" "}
                                {address.address}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                کد پستی:{" "}
                                {address.postalCode}
                              </p>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </section>

            {/* PAYMENT */}

            <section className="rounded-3xl border border-white/10 bg-[#090909] p-5 md:p-6">

              <h2 className="text-xl font-black">
                💳 روش پرداخت
              </h2>

              <p className="mt-1 text-sm text-white/40">
                روش پرداخت موردنظر خود را انتخاب کنید.
              </p>

              <div className="mt-6 space-y-3">

                {/* ZARINPAL */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentGateway("ZARINPAL")
                  }
                  className={`w-full rounded-2xl border p-5 text-right transition ${
                    paymentGateway === "ZARINPAL"
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-white/10 bg-black hover:border-white/20"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
                        paymentGateway ===
                        "ZARINPAL"
                          ? "bg-green-500/15"
                          : "bg-white/5"
                      }`}
                    >
                      💳
                    </div>

                    <div className="flex-1">

                      <div className="font-black">
                        زرین‌پال
                      </div>

                      <div className="mt-1 text-sm text-white/40">
                        پرداخت آنلاین امن
                      </div>

                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border ${
                        paymentGateway ===
                        "ZARINPAL"
                          ? "border-green-500 bg-green-500"
                          : "border-white/20"
                      }`}
                    />

                  </div>

                </button>

                {/* PAYPAL */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentGateway("PAYPAL")
                  }
                  className={`w-full rounded-2xl border p-5 text-right transition ${
                    paymentGateway === "PAYPAL"
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-white/10 bg-black hover:border-white/20"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
                        paymentGateway === "PAYPAL"
                          ? "bg-green-500/15"
                          : "bg-white/5"
                      }`}
                    >
                      🌐
                    </div>

                    <div className="flex-1">

                      <div className="font-black">
                        PayPal
                      </div>

                      <div className="mt-1 text-sm text-white/40">
                        پرداخت بین‌المللی
                      </div>

                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border ${
                        paymentGateway === "PAYPAL"
                          ? "border-green-500 bg-green-500"
                          : "border-white/20"
                      }`}
                    />

                  </div>

                </button>

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">

            <div className="rounded-3xl border border-white/10 bg-[#090909] p-6 shadow-2xl">

              <h2 className="text-xl font-black">
                خلاصه سفارش
              </h2>

              {/* PRODUCTS */}

              <div className="mt-5 space-y-4">

                {items.map((item) => {
                  const imageUrl =
                    getImageUrl(
                      item.product_detail.image
                    );

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3"
                    >

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#111]">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              item.product_detail
                                .title
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">
                            🌱
                          </div>
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-bold">
                          {
                            item.product_detail
                              .title
                          }
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          تعداد:{" "}
                          {item.quantity.toLocaleString(
                            "fa-IR"
                          )}
                        </p>

                        <p className="mt-1 text-sm font-bold text-green-400">
                          {formatPrice(
                            item.subtotal
                          )}{" "}
                          تومان
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

              <div className="my-6 h-px bg-white/10" />

              {/* PRICE */}

              <div className="space-y-4 text-sm">

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
                    محاسبه شده
                  </span>

                </div>

              </div>

              <div className="my-6 h-px bg-white/10" />

              {/* TOTAL */}

              <div className="flex items-center justify-between">

                <span className="font-bold">
                  مبلغ قابل پرداخت
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

              {/* ADDRESS PREVIEW */}

              {selectedAddress && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black p-4">

                  <p className="text-xs text-white/40">
                    آدرس ارسال
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    {selectedAddress.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/40">
                    {selectedAddress.city}،{" "}
                    {selectedAddress.address}
                  </p>

                </div>
              )}

              {/* CHECKOUT BUTTON */}

              <button
                onClick={handleCheckout}
                disabled={
                  submitting ||
                  !selectedAddress
                }
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-4 font-black transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "در حال انتقال به درگاه..."
                  : "پرداخت و ثبت سفارش"}
              </button>

              <Link
                href="/cart"
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                بازگشت به سبد خرید
              </Link>

              <div className="mt-6 rounded-2xl border border-green-500/10 bg-green-500/5 p-4 text-xs leading-6 text-white/50">
                🔒 اطلاعات سفارش شما امن است و پرداخت از طریق درگاه انتخاب‌شده انجام می‌شود.
              </div>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}