"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";

const menus = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Firmalar",
    href: "/companies",
    icon: Building2,
  },
  {
    title: "Sozlamalar",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");

    // Agar boshqa ma'lumotlar ham saqlanayotgan bo'lsa:
    // localStorage.clear();

    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white shadow-xl">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold tracking-wide text-blue-400">
          BLISS
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          CRM Admin Panel
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = pathname === menu.href;

            return (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span>{menu.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={20} />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
}