"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 px-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Dashboard
        </h2>

        <p className="text-sm text-slate-500">
          BLISS CRM Administration
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button className="relative rounded-xl p-2 hover:bg-slate-100">
          <Bell size={22} className="text-slate-600" />

          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3">
          <UserCircle2
            size={38}
            className="text-blue-600"
          />

          <div>
            <p className="font-semibold">
              Administrator
            </p>

            <p className="text-xs text-slate-500">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}