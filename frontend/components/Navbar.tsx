"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserRole = "BUYER" | "SELLER" | "ADMIN" | "";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function loadUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsLoggedIn(false);
        setUsername("");
        setRole("");
        return;
      }

      try {
        const payload = JSON.parse(
          decodeURIComponent(
            atob(token.split(".")[1])
              .split("")
              .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
        );

        setIsLoggedIn(true);
        setUsername(payload.username || "");
        setRole(payload.role || "");
      } catch {
        setIsLoggedIn(false);
        setUsername("");
        setRole("");
      }
    }

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    setUsername("");
    setRole("");
    setMenuOpen(false);
    window.location.href = "/login";
  }

  function getDashboardUrl() {
    switch (role) {
      case "SELLER":
        return "/seller/dashboard";

      case "ADMIN":
        return "/admin/dashboard";

      case "BUYER":
      default:
        return "/buyer/dashboard";
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-3 sm:min-h-20 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-xl shadow-lg shadow-green-600/20 transition duration-300 group-hover:scale-105 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl">
            🌱
          </div>

          <div className="min-w-0">
            <div className="truncate text-base font-black tracking-tight sm:text-lg">
              SB<span className="text-green-400">cropmarket</span>
            </div>

            <div className="hidden text-xs text-white/40 sm:block">
              بازار آنلاین محصولات کشاورزی
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/"
            className="text-sm font-medium text-white/70 transition hover:text-green-400"
          >
            محصولات
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-white/70 transition hover:text-green-400"
          >
            دسته‌بندی‌ها
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-white/70 transition hover:text-green-400"
          >
            فروشندگان
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-white/70 transition hover:text-green-400"
          >
            درباره ما
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Search */}
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-base transition hover:border-green-500/40 hover:bg-green-500/10 sm:flex"
            title="جستجو"
          >
            🔍
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            onClick={closeMenu}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-base transition hover:border-green-500/40 hover:bg-green-500/10"
            title="سبد خرید"
          >
            🛒

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Desktop Account */}
          {isLoggedIn ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href={getDashboardUrl()}
                className="max-w-44 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold transition hover:border-green-500/40 hover:bg-green-500/10 sm:px-4"
              >
                👤 {username || "حساب من"}
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 sm:px-4"
              >
                خروج
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:text-green-400 sm:px-4"
              >
                ورود
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-green-600 px-3 py-2.5 text-sm font-bold transition hover:bg-green-700 sm:px-4"
              >
                ثبت‌نام
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl transition hover:border-green-500/40 hover:bg-green-500/10 md:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-3 py-4 backdrop-blur-2xl md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1">

            <Link
              href="/"
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3.5 text-sm font-medium text-white/80 transition hover:bg-green-500/10 hover:text-green-400"
            >
              🌾 محصولات
            </Link>

            <Link
              href="/"
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3.5 text-sm font-medium text-white/80 transition hover:bg-green-500/10 hover:text-green-400"
            >
              🗂️ دسته‌بندی‌ها
            </Link>

            <Link
              href="/"
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3.5 text-sm font-medium text-white/80 transition hover:bg-green-500/10 hover:text-green-400"
            >
              👨‍🌾 فروشندگان
            </Link>

            <Link
              href="/"
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3.5 text-sm font-medium text-white/80 transition hover:bg-green-500/10 hover:text-green-400"
            >
              ℹ️ درباره ما
            </Link>

            <Link
              href="/cart"
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3.5 text-sm font-medium text-white/80 transition hover:bg-green-500/10 hover:text-green-400"
            >
              🛒 سبد خرید
            </Link>

            <div className="my-3 border-t border-white/10" />

            {isLoggedIn ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  onClick={closeMenu}
                  className="block rounded-xl bg-green-600/10 px-4 py-3.5 text-sm font-bold text-green-300 transition hover:bg-green-600/20"
                >
                  👤 {username || "حساب من"}
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-1 block w-full rounded-xl bg-red-500/10 px-4 py-3.5 text-right text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  🚪 خروج از حساب
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:border-green-500/40 hover:text-green-400"
                >
                  ورود
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-bold transition hover:bg-green-700"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
