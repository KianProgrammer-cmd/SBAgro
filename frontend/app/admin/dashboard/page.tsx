"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminProducts,
  approveProduct,
  rejectProduct,
  adminDeleteProduct,
} from "@/lib/api";

type Product = {
  id: number;
  seller: number;
  seller_name: string;
  category: number | null;
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

type Filter = "ALL" | "PENDING" | "APPROVED" | "INACTIVE";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminProducts();

      setProducts(data.results || data || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "دریافت محصولات با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleApprove(id: number) {
    try {
      setActionLoading(id);
      await approveProduct(id);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id
            ? {
                ...product,
                is_approved: true,
                is_active: true,
              }
            : product
        )
      );
    } catch (err: any) {
      alert(err?.message || "تأیید محصول انجام نشد.");
    } finally {
      setActionLoading(null);
    }
  }

  function openRejectModal(product: Product) {
    setRejectTarget(product);
    setRejectReason("");
    setRejectError("");
  }

  function closeRejectModal() {
    setRejectTarget(null);
    setRejectReason("");
    setRejectError("");
  }

  async function submitReject() {
    if (!rejectTarget) return;

    const reason = rejectReason.trim();

    if (!reason) {
      setRejectError("دلیل رد محصول الزامی است.");
      return;
    }

    const id = rejectTarget.id;

    try {
      setActionLoading(id);
      await rejectProduct(id, reason);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id
            ? {
                ...product,
                is_approved: false,
                is_active: false,
              }
            : product
        )
      );

      closeRejectModal();
    } catch (err: any) {
      setRejectError(
        err?.message || "رد محصول انجام نشد."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این محصول حذف شود؟"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await adminDeleteProduct(id);

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (err: any) {
      alert(err?.message || "حذف محصول انجام نشد.");
    } finally {
      setActionLoading(null);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.seller_name
          .toLowerCase()
          .includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "PENDING") {
        return !product.is_approved;
      }

      if (filter === "APPROVED") {
        return product.is_approved;
      }

      if (filter === "INACTIVE") {
        return !product.is_active;
      }

      return true;
    });
  }, [products, filter, search]);

  const stats = {
    total: products.length,
    pending: products.filter((p) => !p.is_approved).length,
    approved: products.filter((p) => p.is_approved).length,
    inactive: products.filter((p) => !p.is_active).length,
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07110c] px-4 py-8 text-white md:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm text-green-400">
              مدیریت فروشگاه
            </p>

            <h1 className="text-3xl font-black">
              مدیریت محصولات
            </h1>

            <p className="mt-2 text-sm text-white/50">
              بررسی، تأیید و مدیریت محصولات فروشندگان
            </p>
          </div>

          <button
            onClick={loadProducts}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            ↻ بروزرسانی
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            title="کل محصولات"
            value={stats.total}
            icon="📦"
          />

          <StatCard
            title="در انتظار تأیید"
            value={stats.pending}
            icon="⏳"
          />

          <StatCard
            title="تأیید شده"
            value={stats.approved}
            icon="✅"
          />

          <StatCard
            title="غیرفعال"
            value={stats.inactive}
            icon="🚫"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی محصول یا فروشنده..."
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-green-500 lg:max-w-md"
            />

            <div className="flex flex-wrap gap-2">

              <FilterButton
                active={filter === "ALL"}
                onClick={() => setFilter("ALL")}
              >
                همه
              </FilterButton>

              <FilterButton
                active={filter === "PENDING"}
                onClick={() => setFilter("PENDING")}
              >
                در انتظار تأیید
              </FilterButton>

              <FilterButton
                active={filter === "APPROVED"}
                onClick={() => setFilter("APPROVED")}
              >
                تأیید شده
              </FilterButton>

              <FilterButton
                active={filter === "INACTIVE"}
                onClick={() => setFilter("INACTIVE")}
              >
                غیرفعال
              </FilterButton>

            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

            <p className="text-white/60">
              در حال دریافت محصولات...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">
            <div className="mb-4 text-5xl">
              📦
            </div>

            <h2 className="text-xl font-bold">
              محصولی پیدا نشد
            </h2>

            <p className="mt-2 text-sm text-white/40">
              در این بخش محصولی برای نمایش وجود ندارد.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={actionLoading === product.id}
                onApprove={handleApprove}
                onReject={openRejectModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>

      {rejectTarget && (
        <RejectModal
          product={rejectTarget}
          reason={rejectReason}
          error={rejectError}
          loading={actionLoading === rejectTarget.id}
          onChangeReason={setRejectReason}
          onCancel={closeRejectModal}
          onSubmit={submitReject}
        />
      )}
    </main>
  );
}

function RejectModal({
  product,
  reason,
  error,
  loading,
  onChangeReason,
  onCancel,
  onSubmit,
}: {
  product: Product;
  reason: string;
  error: string;
  loading: boolean;
  onChangeReason: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c1a12] p-6"
      >
        <h3 className="text-lg font-black text-white">
          رد محصول «{product.title}»
        </h3>

        <p className="mt-2 text-sm text-white/50">
          دلیل رد برای فروشنده ارسال می‌شود. لطفاً واضح و مشخص بنویسید.
        </p>

        <textarea
          autoFocus
          value={reason}
          onChange={(e) => onChangeReason(e.target.value)}
          placeholder="مثلاً: تصویر محصول کیفیت مناسبی ندارد."
          rows={4}
          className="mt-4 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-red-500"
        />

        {error && (
          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            disabled={loading}
            onClick={onSubmit}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-black transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "در حال ارسال..." : "رد محصول"}
          </button>

          <button
            disabled={loading}
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-white/5 disabled:opacity-50"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-2xl">
          {icon}
        </span>

        <span className="text-xs text-white/40">
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

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-green-600 text-white"
          : "bg-white/5 text-white/60 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product,
  loading,
  onApprove,
  onReject,
  onDelete,
}: {
  product: Product;
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (product: Product) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-green-500/20">

      {/* Image */}
      <div className="relative h-52 bg-black/20">

        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            🌱
          </div>
        )}

        <div className="absolute right-3 top-3">
          {product.is_approved ? (
            <span className="rounded-full bg-green-500/90 px-3 py-1 text-xs font-bold text-white">
              ✓ تأیید شده
            </span>
          ) : (
            <span className="rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-bold text-black">
              ⏳ در انتظار
            </span>
          )}
        </div>

      </div>

      {/* Content */}
      <div className="p-5">

        <div className="mb-3">
          <h2 className="truncate text-xl font-black">
            {product.title}
          </h2>

          <p className="mt-1 text-sm text-white/40">
            فروشنده: {product.seller_name}
          </p>
        </div>

        <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-6 text-white/50">
          {product.description || "بدون توضیحات"}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3">

          <Info
            title="قیمت"
            value={`${Number(
              product.price_per_unit
            ).toLocaleString("fa-IR")} تومان`}
          />

          <Info
            title="موجودی"
            value={`${product.stock_quantity} ${product.unit}`}
          />

        </div>

        {/* Actions */}
        <div className="space-y-2">

          {!product.is_approved && (
            <button
              disabled={loading}
              onClick={() => onApprove(product.id)}
              className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-black transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? "در حال پردازش..."
                : "✓ تأیید محصول"}
            </button>
          )}

          <button
            disabled={loading}
            onClick={() => onReject(product)}
            className="w-full rounded-xl bg-yellow-600/20 px-4 py-3 text-sm font-bold text-yellow-300 transition hover:bg-yellow-600/30 disabled:opacity-50"
          >
            {product.is_approved ? "رد / لغو تأیید" : "✕ رد محصول"}
          </button>

          <button
            disabled={loading}
            onClick={() => onDelete(product.id)}
            className="w-full rounded-xl bg-red-600/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-600/20 disabled:opacity-50"
          >
            🗑 حذف محصول
          </button>

        </div>

      </div>
    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <div className="text-xs text-white/30">
        {title}
      </div>

      <div className="mt-1 truncate text-sm font-bold">
        {value}
      </div>
    </div>
  );
}