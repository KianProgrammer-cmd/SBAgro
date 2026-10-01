"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteProduct,
  getMyProducts,
} from "@/lib/api";
import SellerNav from "@/components/SellerNav";

type Product = {
  id: number;
  title: string;
  description: string;
  image: string;
  price_per_unit: string;
  unit: string;
  stock_quantity: number;
  is_approved: boolean;
  is_active: boolean;
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getMyProducts();
      setProducts(data?.results || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "آیا از حذف این محصول مطمئن هستید؟"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (error: any) {
      alert(error?.message || "حذف محصول ناموفق بود.");
    }
  }

  const filteredProducts = products.filter((product) =>
    product.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07130d] px-4 py-8 text-white"
    >
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-black">
              محصولات من
            </h1>

            <p className="mt-2 text-white/50">
              مدیریت محصولات فروشگاه
            </p>
          </div>

          <Link
            href="/seller/products/new"
            className="rounded-2xl bg-green-600 px-6 py-3 text-center font-bold hover:bg-green-500"
          >
            + افزودن محصول
          </Link>

        </div>

        <SellerNav />

        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصول..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 outline-none focus:border-green-500"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/50">
            در حال دریافت محصولات...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center">

            <div className="text-5xl">📦</div>

            <p className="mt-4 text-white/50">
              محصولی پیدا نشد.
            </p>

          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
              >

                <img
                  src={product.image}
                  alt={product.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">

                  <div className="mb-3 flex items-start justify-between gap-3">

                    <h2 className="font-bold">
                      {product.title}
                    </h2>

                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        product.is_approved
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {product.is_approved
                        ? "تأیید شده"
                        : "در انتظار"}
                    </span>

                  </div>

                  <p className="mb-4 text-sm text-white/50">
                    {product.description}
                  </p>

                  <div className="mb-5 space-y-2 text-sm">

                    <div className="flex justify-between">
                      <span className="text-white/50">
                        قیمت
                      </span>

                      <span className="font-bold">
                        {Number(
                          product.price_per_unit
                        ).toLocaleString("fa-IR")}{" "}
                        تومان
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/50">
                        موجودی
                      </span>

                      <span>
                        {product.stock_quantity.toLocaleString("fa-IR")}{" "}
                        {product.unit}
                      </span>
                    </div>

                  </div>

                  <div className="flex gap-2">

                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold hover:bg-blue-500"
                    >
                      ویرایش
                    </Link>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-xl bg-red-600/20 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      حذف
                    </button>

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