"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Ban,
  ArrowRight,
  Plus,
  KeyRound,
  RefreshCw,
  Phone,
} from "lucide-react";

import { getDashboard } from "@/services/dashboard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const res = await getDashboard();

      setDashboard(res);
    } catch (error) {
      console.error("DASHBOARD LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      title: "Jami firmalar",
      value: dashboard?.stats?.totalOwners ?? 0,
      description: "Barcha ownerlar",
      icon: Building2,
      iconClass: "text-blue-600",
      iconBg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      title: "Faol firmalar",
      value: dashboard?.stats?.activeOwners ?? 0,
      description: "Hozir faol ishlamoqda",
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      iconBg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      title: "Muddati tugagan",
      value: dashboard?.stats?.expiredOwners ?? 0,
      description: "Litsenziya yangilanishi kerak",
      icon: XCircle,
      iconClass: "text-red-600",
      iconBg: "bg-red-50",
      border: "border-red-100",
    },
    {
      title: "Bugun tugaydi",
      value: dashboard?.stats?.expireToday ?? 0,
      description: "Bugun e'tibor talab qiladi",
      icon: CalendarClock,
      iconClass: "text-amber-600",
      iconBg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  const total = dashboard?.stats?.totalOwners ?? 0;
  const active = dashboard?.stats?.activeOwners ?? 0;
  const blocked = dashboard?.stats?.blockedOwners ?? 0;
  const expired = dashboard?.stats?.expiredOwners ?? 0;

  const activePercent = useMemo(() => {
    if (!total) return 0;

    return Math.round((active / total) * 100);
  }, [active, total]);

  const blockedPercent = useMemo(() => {
    if (!total) return 0;

    return Math.round((blocked / total) * 100);
  }, [blocked, total]);

  const expiredPercent = useMemo(() => {
    if (!total) return 0;

    return Math.round((expired / total) * 100);
  }, [expired, total]);

  return (
    <div className="space-y-7 pb-8">

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
              Admin
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            BLISS CRM administrator paneli
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Yangilash
        </button>
      </div>

      {/* ========================================================= */}
      {/* STATISTICS */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.border}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {loading ? "..." : item.value}
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  <Icon
                    size={24}
                    className={item.iconClass}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* LICENSE + QUICK ACTIONS */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* LICENSE OVERVIEW */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Litsenziyalar holati
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tizimdagi firmalarning umumiy holati
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarClock size={19} />
            </div>
          </div>

          {/* PROGRESS */}

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">
                Faol litsenziyalar
              </span>

              <span className="font-bold text-slate-900">
                {activePercent}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${activePercent}%`,
                }}
              />
            </div>
          </div>

          {/* LICENSE CARDS */}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* ACTIVE */}

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <span className="text-xs font-semibold text-slate-500">
                  Faol
                </span>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {loading ? "..." : active}
              </p>
            </div>

            {/* EXPIRED */}

            <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                <span className="text-xs font-semibold text-slate-500">
                  Muddati tugagan
                </span>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {loading ? "..." : expired}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {expiredPercent}%
              </p>
            </div>

            {/* BLOCKED */}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />

                <span className="text-xs font-semibold text-slate-500">
                  Bloklangan
                </span>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {loading ? "..." : blocked}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {blockedPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Tezkor amallar
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Admin uchun asosiy amallar
          </p>

          <div className="mt-5 space-y-3">

            {/* ADD COMPANY */}

            <Link
              href="/companies"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Plus size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  Firma qo'shish
                </span>

                <span className="block text-xs text-slate-400">
                  Yangi owner yaratish
                </span>
              </span>

              <ArrowRight
                size={17}
                className="text-slate-300"
              />
            </Link>

            {/* OWNER MANAGEMENT */}

            <Link
              href="/companies"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-violet-200 hover:bg-violet-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <KeyRound size={18} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  Owner boshqaruvi
                </span>

                <span className="block text-xs text-slate-400">
                  Parol va statuslarni boshqarish
                </span>
              </span>

              <ArrowRight
                size={17}
                className="text-slate-300"
              />
            </Link>

            {/* LICENSE */}

            <Link
              href="/companies"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-amber-200 hover:bg-amber-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CalendarClock size={18} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  Litsenziyalar
                </span>

                <span className="block text-xs text-slate-400">
                  Muddatlarni boshqarish
                </span>
              </span>

              <ArrowRight
                size={17}
                className="text-slate-300"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LATEST COMPANIES */}
      {/* ========================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Oxirgi qo'shilgan firmalar
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tizimga yaqinda qo'shilgan ownerlar
            </p>
          </div>

          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Barchasini ko'rish
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Korxona
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Telefon
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Litsenziya
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Holati
                </th>

              </tr>
            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-0"
                  >

                    <td className="px-6 py-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                    </td>

                    <td className="px-6 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                    </td>

                    <td className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                    </td>

                    <td className="px-6 py-4">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                    </td>

                  </tr>
                ))

              ) : dashboard?.latestOwners?.length ? (

                dashboard.latestOwners.map((company: any) => {

                  const isActive =
                    company.status === "active";

                  const expiresAt =
                    company.license?.expiresAt
                      ? new Date(company.license.expiresAt)
                      : null;

                  const formattedDate =
                    expiresAt
                      ? expiresAt.toLocaleDateString(
                          "uz-UZ",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )
                      : "-";

                  return (
                    <tr
                      key={company.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                    >

                      {/* COMPANY */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Building2 size={18} />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-800">
                              {company.companyName || "-"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {company.username ||
                                "Username mavjud emas"}
                            </p>

                          </div>
                        </div>
                      </td>

                      {/* PHONE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <Phone
                            size={15}
                            className="text-emerald-500"
                          />

                          {company.phone || "-"}
                        </div>
                      </td>

                      {/* LICENSE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">

                          <CalendarClock
                            size={15}
                            className="text-amber-500"
                          />

                          <span className="font-medium text-slate-700">
                            {formattedDate}
                          </span>

                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                              : "bg-red-50 text-red-700 ring-red-100"
                          }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />

                          {isActive
                            ? "Aktiv"
                            : "Bloklangan"}

                        </span>

                      </td>

                    </tr>
                  );
                })

              ) : (

                /* EMPTY */

                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-14 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Building2 size={22} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Hozircha firmalar mavjud emas
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Yangi firma qo'shsangiz, shu yerda
                        ko'rinadi.
                      </p>

                    </div>

                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BLOCKED INFO */}
      {/* ========================================================= */}

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Ban size={17} />
        </div>

        <div className="flex-1">

          <p className="text-sm font-semibold text-slate-700">
            Bloklangan firmalar
          </p>

          <p className="text-xs text-slate-400">
            Hozirda {blocked} ta firma bloklangan.
          </p>

        </div>

        <Link
          href="/companies"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Boshqarish
        </Link>

      </div>

    </div>
  );
}