"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  CalendarClock,
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
      const res = await getDashboard();
      setDashboard(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      title: "Jami Firmalar",
      value: dashboard?.stats?.totalOwners ?? 0,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Aktiv",
      value: dashboard?.stats?.activeOwners ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Muddati tugagan",
      value: dashboard?.stats?.expiredOwners ?? 0,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Bugun tugaydi",
      value: dashboard?.stats?.expireToday ?? 0,
      icon: CalendarClock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          BLISS CRM administrator paneli
        </p>
      </div>

      {/* Statistikalar */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">
                    {item.title}
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {loading ? "..." : item.value}
                  </h2>
                </div>

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.bg}`}
                >
                  <Icon
                    className={item.color}
                    size={28}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Oxirgi qo'shilgan firmalar */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">
            Oxirgi qo'shilgan firmalar
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4">
                  Korxona
                </th>

                <th className="text-left px-6 py-4">
                  Telefon
                </th>

                <th className="text-left px-6 py-4">
                  Litsenziya
                </th>

                <th className="text-left px-6 py-4">
                  Holati
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : dashboard?.latestOwners?.length ? (
                dashboard.latestOwners.map((company: any) => (
                  <tr
                    key={company.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 font-medium">
                      {company.companyName}
                    </td>

                    <td className="px-6 py-4">
                      {company.phone}
                    </td>

                    <td className="px-6 py-4">
                      {company.license?.expiresAt
                        ? new Date(
                            company.license.expiresAt
                          ).toLocaleDateString("uz-UZ")
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          company.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {company.status === "active"
                          ? "Aktiv"
                          : "Bloklangan"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    Hozircha firmalar mavjud emas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}