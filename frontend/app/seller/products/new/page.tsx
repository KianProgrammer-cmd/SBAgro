"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createProduct,
  getCategories,
  getCities,
  getProvinces,
} from "@/lib/api";
import SellerNav from "@/components/SellerNav";

type Option = {
  id: number;
  name: string;
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    price_per_unit: "",
    unit: "kg",
    stock_quantity: "",
    province: "",
    city: "",
  });

  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    try {
      const [categoryData, provinceData] =
        await Promise.all([
          getCategories(),
          getProvinces(),
        ]);

      setCategories(categoryData?.results || categoryData || []);
      setProvinces(provinceData?.results || provinceData || []);
    } catch (err: any) {
      setError(
        err?.message ||
          "دریافت اطلاعات اولیه ناموفق بود."
      );
    } finally {
      setLoadingData(false);
    }
  }

  async function handleProvinceChange(
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      province: value,
      city: "",
    }));

    if (!value) {
      setCities([]);
      return;
    }

    try {
      const data = await getCities(Number(value));
      setCities(data?.results || data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!image) {
      setError("لطفاً تصویر محصول را انتخاب کنید.");
      return;
    }

    setLoading(true);

    try {
      await createProduct({
        ...form,
        image,
      });

      window.location.href = "/seller/products";
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "افزودن محصول ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07130d] px-4 py-8 text-white"
    >
      <div className="mx-auto max-w-3xl">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-black">
              افزودن محصول
            </h1>

            <p className="mt-2 text-white/50">
              محصول جدید خود را ثبت کنید
            </p>
          </div>

          <Link
            href="/seller/products"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            بازگشت
          </Link>

        </div>

        <SellerNav />

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8"
        >

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Title */}
          <Field label="نام محصول">
            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              required
              placeholder="مثلاً گندم درجه یک"
              className={inputClass}
            />
          </Field>

          {/* Category */}
          <Field label="دسته‌بندی">

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              required
              className={inputClass}
            >

              <option value="">
                انتخاب دسته‌بندی
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

          </Field>

          {/* Description */}
          <Field label="توضیحات">

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              rows={5}
              placeholder="توضیحات محصول..."
              className={inputClass}
            />

          </Field>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Price */}
            <Field label="قیمت هر واحد">

              <input
                type="number"
                min="0"
                value={form.price_per_unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price_per_unit: e.target.value,
                  })
                }
                required
                placeholder="120000"
                className={inputClass}
              />

            </Field>

            {/* Unit */}
            <Field label="واحد">

              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="kg">کیلوگرم</option>
                <option value="ton">تن</option>
                <option value="piece">عدد</option>
                <option value="liter">لیتر</option>
              </select>

            </Field>

          </div>

          {/* Stock */}
          <Field label="موجودی">

            <input
              type="number"
              min="0"
              value={form.stock_quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock_quantity: e.target.value,
                })
              }
              required
              placeholder="10"
              className={inputClass}
            />

          </Field>

          {/* Location */}
          <div className="grid gap-5 md:grid-cols-2">

            <Field label="استان">

              <select
                value={form.province}
                onChange={(e) =>
                  handleProvinceChange(e.target.value)
                }
                required
                disabled={loadingData}
                className={inputClass}
              >

                <option value="">
                  انتخاب استان
                </option>

                {provinces.map((province) => (
                  <option
                    key={province.id}
                    value={province.id}
                  >
                    {province.name}
                  </option>
                ))}

              </select>

            </Field>

            <Field label="شهر">

              <select
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
                required
                disabled={!form.province}
                className={inputClass}
              >

                <option value="">
                  انتخاب شهر
                </option>

                {cities.map((city) => (
                  <option
                    key={city.id}
                    value={city.id}
                  >
                    {city.name}
                  </option>
                ))}

              </select>

            </Field>

          </div>

          {/* Image */}
          <Field label="تصویر محصول">

            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) =>
                setImage(
                  e.target.files?.[0] || null
                )
              }
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3"
            />

            {image && (
              <p className="mt-2 text-sm text-green-400">
                {image.name}
              </p>
            )}

          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-green-600 py-4 font-black transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "در حال ثبت محصول..."
              : "ثبت محصول"}
          </button>

        </form>

      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-green-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      {children}
    </div>
  );
}