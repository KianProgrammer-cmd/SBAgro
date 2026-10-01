"use client";

import { useEffect, useState } from "react";

import {
  getProducts,
  getCategories,
  getProvinces,
  getCities,
  addToCart,
  type Product as ApiProduct,
  type ProductCategory,
  type Province,
  type City,
} from "@/lib/api";

type Product = ApiProduct;
type Category = ProductCategory;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        productsData,
        categoriesData,
        provincesData,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
        getProvinces(),
      ]);

      setProducts(
        productsData?.results || productsData || []
      );

      setCategories(
        categoriesData?.results ||
          categoriesData ||
          []
      );

      setProvinces(
        provincesData?.results ||
          provincesData ||
          []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "دریافت اطلاعات با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     تغییر استان
  ===================================================== */

  async function handleProvinceChange(
    value: string
  ) {
    setProvince(value);

    // با تغییر استان، شهر قبلی پاک شود
    setCity("");
    setCities([]);

    if (!value) {
      return;
    }

    try {
      setCitiesLoading(true);

      const data = await getCities(
        Number(value)
      );

      setCities(
        data?.results ||
          data ||
          []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "دریافت شهرها با خطا مواجه شد."
      );
    } finally {
      setCitiesLoading(false);
    }
  }

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  function resetFilters() {
    setSearch("");
    setProvince("");
    setCity("");
    setCategory("");
    setCities([]);
    setError("");
  }

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = products.filter(
    (product) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        product.title
          .toLowerCase()
          .includes(searchText) ||
        product.description
          .toLowerCase()
          .includes(searchText) ||
        product.seller_name
          .toLowerCase()
          .includes(searchText);

      const matchesProvince =
        !province ||
        String(product.province) ===
          province;

      const matchesCity =
        !city ||
        String(product.city) === city;

      const matchesCategory =
        !category ||
        String(product.category) ===
          category;

      return (
        matchesSearch &&
        matchesProvince &&
        matchesCity &&
        matchesCategory
      );
    }
  );

  const hasActiveFilters =
    Boolean(
      search ||
        province ||
        city ||
        category
    );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-8 text-white md:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <p className="mb-2 text-sm font-bold text-green-400">
            SBcropmarket
          </p>

          <h1 className="text-3xl font-black md:text-4xl">
            محصولات کشاورزی
          </h1>

          <p className="mt-2 text-sm text-white/50">
            خرید مستقیم محصولات کشاورزی از فروشندگان
          </p>

        </div>

        {/* =================================================
            FILTER BOX
        ================================================= */}

        <div className="mb-8 rounded-3xl border border-white/10 bg-[#090909] p-5 shadow-2xl">

          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-lg font-black">
                🔎 فیلتر محصولات
              </h2>

              <p className="mt-1 text-xs text-white/40">
                ابتدا استان، سپس شهر و دسته‌بندی را انتخاب کنید.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-fit rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
              >
                پاک کردن فیلترها
              </button>
            )}

          </div>

          {/* SEARCH */}

          <div className="relative mb-5">

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
              🔍
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="جستجوی محصول، توضیحات یا فروشنده..."
              className="w-full rounded-2xl border border-white/10 bg-black px-12 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-green-500"
            />

          </div>

          {/* FILTERS */}

          <div className="grid gap-4 md:grid-cols-3">

            {/* استان */}

            <div>

              <label className="mb-2 block text-sm font-bold text-white/70">
                استان
              </label>

              <select
                value={province}
                onChange={(e) =>
                  handleProvinceChange(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-4 text-sm text-white outline-none transition focus:border-green-500"
              >

                <option
                  value=""
                  className="bg-[#111]"
                >
                  همه استان‌ها
                </option>

                {provinces.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      className="bg-[#111]"
                    >
                      {item.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* شهر */}

            <div>

              <label className="mb-2 block text-sm font-bold text-white/70">
                شهر
              </label>

              <select
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                disabled={
                  !province ||
                  citiesLoading
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-4 text-sm text-white outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <option
                  value=""
                  className="bg-[#111]"
                >
                  {!province
                    ? "ابتدا استان را انتخاب کنید"
                    : citiesLoading
                      ? "در حال دریافت شهرها..."
                      : "همه شهرها"}
                </option>

                {cities.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      className="bg-[#111]"
                    >
                      {item.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* دسته بندی */}

            <div>

              <label className="mb-2 block text-sm font-bold text-white/70">
                دسته‌بندی محصول
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-4 text-sm text-white outline-none transition focus:border-green-500"
              >

                <option
                  value=""
                  className="bg-[#111]"
                >
                  همه دسته‌بندی‌ها
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      className="bg-[#111]"
                    >
                      {item.name}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* SELECTED FILTERS */}

          {(province ||
            city ||
            category) && (
            <div className="mt-5 flex flex-wrap gap-2">

              {province && (
                <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs text-green-400">
                  استان:{" "}
                  {
                    provinces.find(
                      (item) =>
                        String(item.id) ===
                        province
                    )?.name
                  }
                </div>
              )}

              {city && (
                <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs text-green-400">
                  شهر:{" "}
                  {
                    cities.find(
                      (item) =>
                        String(item.id) ===
                        city
                    )?.name
                  }
                </div>
              )}

              {category && (
                <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs text-green-400">
                  دسته‌بندی:{" "}
                  {
                    categories.find(
                      (item) =>
                        String(item.id) ===
                        category
                    )?.name
                  }
                </div>
              )}

            </div>
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        {!loading && (
          <div className="mb-5 flex items-center justify-between">

            <p className="text-sm text-white/40">
              تعداد محصولات:
              <span className="mr-2 font-black text-white">
                {filteredProducts.length.toLocaleString(
                  "fa-IR"
                )}
              </span>
            </p>

            {hasActiveFilters && (
              <span className="text-xs text-green-400">
                فیلتر فعال است
              </span>
            )}

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-[#090909] p-16 text-center">

            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

            <p className="text-white/50">
              در حال دریافت محصولات...
            </p>

          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#090909] p-16 text-center">

            <div className="mb-5 text-6xl">
              🌱
            </div>

            <h2 className="text-xl font-black">
              محصولی پیدا نشد
            </h2>

            <p className="mt-2 text-sm text-white/40">
              محصولی مطابق فیلترهای انتخاب‌شده وجود ندارد.
            </p>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold transition hover:bg-green-700"
              >
                حذف فیلترها
              </button>
            )}

          </div>
        ) : (
          /* =================================================
             PRODUCTS
          ================================================= */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const [adding, setAdding] =
    useState(false);

  async function handleAddToCart() {
    try {
      setAdding(true);

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        alert(
          "برای خرید ابتدا وارد حساب کاربری شوید."
        );
        return;
      }

      await addToCart(
        product.id,
        1
      );

      alert(
        "محصول به سبد خرید اضافه شد 🛒"
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "خطا در افزودن محصول به سبد خرید"
      );
    } finally {
      setAdding(false);
    }
  }

  function getImageUrl(
    image: string | null
  ) {
    if (!image) return null;

    if (image.startsWith("http")) {
      return image;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000/api";

    const baseUrl =
      apiUrl.replace(
        /\/api\/?$/,
        ""
      );

    return `${baseUrl}${
      image.startsWith("/")
        ? ""
        : "/"
    }${image}`;
  }

  const imageUrl =
    getImageUrl(product.image);

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-[#090909] transition duration-300 hover:-translate-y-1 hover:border-green-500/30 hover:bg-[#0d0d0d]">

      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden bg-black">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            🌱
          </div>
        )}

        <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-bold backdrop-blur">
          {product.stock_quantity > 0
            ? "موجود"
            : "ناموجود"}
        </div>

      </div>

      {/* CONTENT */}

      <div className="p-5">

        <div className="mb-2">

          <h2 className="truncate text-lg font-black">
            {product.title}
          </h2>

          <p className="mt-1 text-xs text-white/40">
            فروشنده:{" "}
            {product.seller_name}
          </p>

        </div>

        <p className="mb-5 line-clamp-2 min-h-10 text-sm leading-6 text-white/50">
          {product.description ||
            "بدون توضیحات"}
        </p>

        {/* PRICE */}

        <div className="mb-4 rounded-2xl bg-black p-4">

          <p className="text-xs text-white/30">
            قیمت هر {product.unit}
          </p>

          <div className="mt-1 flex items-end gap-1">

            <span className="text-xl font-black text-green-400">
              {Number(
                product.price_per_unit
              ).toLocaleString("fa-IR")}
            </span>

            <span className="mb-1 text-xs text-white/40">
              تومان
            </span>

          </div>

        </div>

        {/* STOCK */}

        <div className="mb-4 flex items-center justify-between text-xs">

          <span className="text-white/40">
            موجودی
          </span>

          <span className="font-bold">
            {product.stock_quantity.toLocaleString(
              "fa-IR"
            )}{" "}
            {product.unit}
          </span>

        </div>

        {/* ADD CART */}

        <button
          onClick={handleAddToCart}
          disabled={
            adding ||
            product.stock_quantity <= 0
          }
          className="w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-black transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {adding
            ? "در حال افزودن..."
            : product.stock_quantity > 0
              ? "🛒 افزودن به سبد خرید"
              : "ناموجود"}
        </button>

      </div>
    </div>
  );
}