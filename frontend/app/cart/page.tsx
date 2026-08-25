'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Product = {
  id: number;
  name?: string;
  price_per_unit?: number;
  image?: string;
};

type CartItem = {
  id: number;
  product: number;
  product_detail?: Product;
  quantity: number;
  subtotal: number;
};

type Cart = {
  id: number;
  items: CartItem[];
  total: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCart() {
    try {
      setLoading(true);
      setError('');

      const data = await apiFetch('/cart/');
      setCart(data);
    } catch (err) {
      console.error('Cart error:', err);
      setError('خطا در دریافت سبد خرید');
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;

    try {
      await apiFetch(`/cart/items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });

      await loadCart();
    } catch (err) {
      console.error('Update cart error:', err);
      setError('خطا در تغییر تعداد محصول');
    }
  }

  async function removeItem(itemId: number) {
    try {
      await apiFetch(`/cart/items/${itemId}/`, {
        method: 'DELETE',
      });

      await loadCart();
    } catch (err) {
      console.error('Remove cart item error:', err);
      setError('خطا در حذف محصول');
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) {
    return (
      <main dir="rtl" className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">سبد خرید</h1>

        <div className="rounded-2xl border border-white/10 p-8 text-center">
          <p>در حال بارگذاری سبد خرید...</p>
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main dir="rtl" className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">سبد خرید</h1>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>

          <button
            onClick={loadCart}
            className="rounded-lg bg-primary px-5 py-2 font-semibold"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main dir="rtl" className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">سبد خرید</h1>

        <div className="rounded-2xl border border-white/10 p-12 text-center">
          <div className="text-6xl mb-5">🛒</div>

          <h2 className="text-xl font-bold mb-2">
            سبد خرید شما خالی است
          </h2>

          <p className="opacity-60">
            هنوز محصولی به سبد خرید اضافه نکرده‌اید.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">سبد خرید</h1>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = item.product_detail;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-5">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold">
                      {product?.name || `محصول #${item.product}`}
                    </h2>

                    {product?.price_per_unit !== undefined && (
                      <p className="text-sm opacity-60 mt-2">
                        قیمت واحد:{' '}
                        {product.price_per_unit.toLocaleString('fa-IR')} تومان
                      </p>
                    )}

                    <p className="font-semibold mt-3">
                      مبلغ:{' '}
                      {Number(item.subtotal).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/5"
                    >
                      +
                    </button>

                    <span className="min-w-8 text-center font-bold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30"
                    >
                      −
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="mr-3 rounded-lg border border-red-500/20 px-3 py-2 text-red-400 hover:bg-red-500/10"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <aside className="h-fit rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="text-xl font-bold mb-6">
            خلاصه سفارش
          </h2>

          <div className="flex justify-between mb-4 opacity-70">
            <span>تعداد کالا</span>
            <span>{cart.items.length}</span>
          </div>

          <div className="border-t border-white/10 pt-5 flex justify-between items-center">
            <span className="font-bold">مبلغ نهایی</span>

            <span className="text-xl font-bold">
              {Number(cart.total).toLocaleString('fa-IR')} تومان
            </span>
          </div>

          <button
            className="w-full mt-6 rounded-xl bg-primary py-3 font-bold"
            onClick={() => {
              window.location.href = '/checkout';
            }}
          >
            ادامه و پرداخت
          </button>
        </aside>
      </div>
    </main>
  );
}
