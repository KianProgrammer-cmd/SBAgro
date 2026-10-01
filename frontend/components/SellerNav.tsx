"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/seller/dashboard", label: "داشبورد", icon: "🏠" },
  { href: "/seller/products", label: "محصولات من", icon: "📦" },
  { href: "/seller/notifications", label: "پیام‌ها", icon: "🔔" },
  { href: "/seller/orders", label: "سفارش‌ها", icon: "🧾" },
];

export default function SellerNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
      {links.map((link) => {
        const active = pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              active
                ? "bg-green-600 text-white"
                : "text-white/60 hover:bg-white/10"
            }`}
          >
            {link.icon} {link.label}
          </Link>
        );
      })}
    </nav>
  );
}