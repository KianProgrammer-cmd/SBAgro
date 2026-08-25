"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  seller: number;
  seller_name: string;
  category: number;
  title: string;
  description: string;
  image: string | null;
  price_per_unit: string;
  unit: string;
  stock_quantity: number;
  province: number;
  city: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
};

type ProductsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingProduct, setAddingProduct] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_URL}/products/`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: ProductsResponse = await response.json();
        setProducts(data.results || []);
      } catch (err) {
        console.error(err);
        setError("خطا در دریافت محصولات");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function addToCart(productId: number) {
    setAddingProduct(productId);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setMessage("برای خرید ابتدا وارد حساب خریدار شوید.");
        return;
      }

      const response = await fetch(`${API_URL}/cart/items/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "افزودن محصول به سبد خرید ناموفق بود."
        );
      }

      setMessage("محصول با موفقیت به سبد خرید اضافه شد.");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "خطایی رخ داد.");
    } finally {
      setAddingProduct(null);
    }
  }

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return products;

    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(value) ||
        product.description.toLowerCase().includes(value) ||
        product.seller_name.toLowerCase().includes(value)
    );
  }, [products, search]);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#07140d]"
      >
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
          <p className="text-white/60">در حال دریافت محصولات...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#07140d] px-5 py-16"
      >
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h1 className="mb-3 text-2xl font-bold">مشکلی پیش آمد</h1>
          <p className="text-red-300">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-white/10 px-6 py-3 font-semibold transition hover:bg-white/15"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#07140d] text-white"
    >
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07140d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-2xl shadow-lg shadow-emerald-500/20">
              🌱
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">
                SB<span className="text-emerald-400">cropmarket</span>
              </div>
              <div className="text-[10px] text-white/40">
                بازار محصولات کشاورزی
              </div>
            </div>
          </a>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="/"
              className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              خانه
            </a>

            <a
              href="#products"
              className="text-sm font-medium text-white/65 transition hover:text-white"
            >
              محصولات
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-white/65 transition hover:text-white"
            >
              درباره ما
            </a>

            <a
              href="#contact"
              className="text-sm font-medium text-white/65 transition hover:text-white"
            >
              تماس با ما
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white sm:block"
            >
              ورود
            </a>

            <a
              href="/cart"
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
            >
              <span className="text-lg transition group-hover:scale-110">
                🛒
              </span>
              <span className="hidden sm:block">سبد خرید</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute left-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-green-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              <span>🌾</span>
              <span>بازار مدرن محصولات کشاورزی</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.25] tracking-tight sm:text-5xl lg:text-6xl">
              محصولات تازه،
              <br />
              <span className="text-emerald-400">مستقیم از مزرعه</span>
              <br />
              به دست شما
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
              در SBcropmarket کشاورزان و خریداران را مستقیماً به یکدیگر متصل
              می‌کنیم تا خرید و فروش محصولات کشاورزی ساده‌تر، سریع‌تر و مطمئن‌تر
              انجام شود.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#products"
                className="rounded-2xl bg-emerald-500 px-7 py-4 text-center font-bold text-[#041009] shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                مشاهده محصولات
              </a>

              <a
                href="/register"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-center font-bold text-white transition hover:bg-white/[0.08]"
              >
                ثبت‌نام به عنوان فروشنده
              </a>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-black text-white">
                  {products.length.toLocaleString("fa-IR")}+
                </div>
                <div className="mt-1 text-xs text-white/40">محصول فعال</div>
              </div>

              <div>
                <div className="text-2xl font-black text-white">۱۰۰٪</div>
                <div className="mt-1 text-xs text-white/40">آنلاین</div>
              </div>

              <div>
                <div className="text-2xl font-black text-white">۲۴/۷</div>
                <div className="mt-1 text-xs text-white/40">دسترسی</div>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square max-w-[520px]">
              <div className="absolute inset-8 rounded-[40px] border border-emerald-400/10 bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-sm" />

              <div className="absolute inset-16 flex items-center justify-center rounded-[36px] border border-white/10 bg-white/[0.03] shadow-2xl">
                <div className="text-center">
                  <div className="text-[130px] drop-shadow-2xl">🌾</div>
                  <div className="mt-4 text-2xl font-black">
                    SB<span className="text-emerald-400">cropmarket</span>
                  </div>
                  <div className="mt-2 text-sm text-white/40">
                    از مزرعه تا بازار
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-20 rounded-2xl border border-white/10 bg-[#0c2115]/90 px-5 py-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥬</span>
                  <div>
                    <div className="text-sm font-bold">محصول تازه</div>
                    <div className="text-xs text-emerald-400">موجود است</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 left-0 rounded-2xl border border-white/10 bg-[#0c2115]/90 px-5 py-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <div className="text-sm font-bold">خرید مستقیم</div>
                    <div className="text-xs text-white/40">
                      از فروشندگان
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section id="products" className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-5 shadow-2xl sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">محصولات کشاورزی</h2>
              <p className="mt-2 text-sm text-white/40">
                بهترین محصولات موجود در بازار را پیدا کنید.
              </p>
            </div>

            <div className="relative w-full md:max-w-md">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                🔎
              </span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی محصول یا فروشنده..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-4 pr-11 text-sm outline-none transition placeholder:text-white/25 focus:border-emerald-400/40"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="my-10 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <div className="text-5xl">🌱</div>
            <h3 className="mt-5 text-xl font-bold">
              محصولی پیدا نشد
            </h3>
            <p className="mt-2 text-sm text-white/40">
              عبارت جستجو را تغییر دهید یا بعداً دوباره امتحان کنید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.04]"
              >
                <div className="relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-emerald-500/10 text-7xl">
                      🌾
                    </div>
                  )}

                  <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                    موجودی:{" "}
                    {product.stock_quantity.toLocaleString("fa-IR")}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black">
                      {product.title}
                    </h3>

                    <span className="shrink-0 rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                      {product.unit}
                    </span>
                  </div>

                  <p className="min-h-[48px] text-sm leading-7 text-white/45">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-5">
                    <div>
                      <div className="text-xs text-white/35">قیمت</div>
                      <div className="mt-1 text-xl font-black text-emerald-400">
                        {Number(product.price_per_unit).toLocaleString(
                          "fa-IR"
                        )}{" "}
                        <span className="text-xs font-normal text-white/40">
                          تومان / {product.unit}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="text-xs text-white/30">
                        فروشنده
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white/70">
                        {product.seller_name}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={addingProduct === product.id}
                    className="mt-5 w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-[#041009] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingProduct === product.id
                      ? "در حال افزودن..."
                      : "افزودن به سبد خرید"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-7">
              <div className="mb-5 text-4xl">👨‍🌾</div>
              <h3 className="text-xl font-black">ارتباط مستقیم</h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                ارتباط مستقیم فروشندگان و خریداران بدون پیچیدگی‌های اضافه.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-7">
              <div className="mb-5 text-4xl">🌱</div>
              <h3 className="text-xl font-black">محصولات واقعی</h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                مشاهده اطلاعات محصول، قیمت، موجودی و فروشنده قبل از خرید.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-7">
              <div className="mb-5 text-4xl">🛒</div>
              <h3 className="text-xl font-black">خرید آسان</h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                محصولات موردنظر خود را انتخاب کنید و در چند مرحله ساده خرید
                کنید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-2xl">
                  🌱
                </div>

                <div className="text-xl font-black">
                  SB<span className="text-emerald-400">cropmarket</span>
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-8 text-white/40">
                بازار آنلاین محصولات کشاورزی؛ جایی برای ارتباط بهتر کشاورزان،
                فروشندگان و خریداران.
              </p>
            </div>

            <div>
              <h4 className="font-bold">دسترسی سریع</h4>

              <div className="mt-5 space-y-3 text-sm text-white/40">
                <a href="/" className="block transition hover:text-white">
                  خانه
                </a>
                <a
                  href="#products"
                  className="block transition hover:text-white"
                >
                  محصولات
                </a>
                <a
                  href="/cart"
                  className="block transition hover:text-white"
                >
                  سبد خرید
                </a>
                <a
                  href="/login"
                  className="block transition hover:text-white"
                >
                  ورود
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold">SBcropmarket</h4>

              <div className="mt-5 space-y-3 text-sm text-white/40">
                <p>بازار محصولات کشاورزی</p>
                <p>خرید و فروش مستقیم</p>
                <p>پشتیبانی آنلاین</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-7 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} SBcropmarket — تمامی حقوق محفوظ است.
            </p>

            <p>
              ساخته شده با ❤️ برای بازار کشاورزی
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
