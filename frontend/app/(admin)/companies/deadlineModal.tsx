"use client";

import { useEffect, useState } from "react";
import {
  X,
  CalendarDays,
  Building2,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import { extendLicense } from "@/services/owner";

interface Props {
  open: boolean;
  ownerId: string;
  companyName?: string;
  currentExpireDate?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeadlineModal({
  open,
  ownerId,
  companyName,
  currentExpireDate,
  onClose,
  onSuccess,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | Bugungi sana
  |--------------------------------------------------------------------------
  */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [expiresAt, setExpiresAt] =
    useState(today);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Modal ochilganda
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    if (currentExpireDate) {
      const date =
        currentExpireDate.slice(
          0,
          10
        );

      /*
       * Agar eski sana bugundan o'tgan bo'lsa,
       * inputga eski sanani qo'ymaymiz.
       *
       * Chunki <input type="date" min={today}
       * eski sanani qabul qilmaydi.
       */

      if (date >= today) {
        setExpiresAt(date);
      } else {
        setExpiresAt(today);
      }
    } else {
      setExpiresAt(today);
    }
  }, [
    open,
    currentExpireDate,
    today,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Modal yopiq
  |--------------------------------------------------------------------------
  */

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  async function handleSave() {
    setError("");

    /*
    |--------------------------------------------------------------------------
    | Sana tekshirish
    |--------------------------------------------------------------------------
    */

    if (!expiresAt) {
      setError(
        "Litsenziya tugash sanasini tanlang."
      );

      return;
    }

    if (expiresAt <= today) {
      setError(
        "Litsenziya tugash sanasi bugundan keyin bo'lishi kerak."
      );

      return;
    }

    try {
      setLoading(true);

      await extendLicense(
        ownerId,
        {
          expiresAt,
        }
      );

      toast.success(
        "Litsenziya muddati muvaffaqiyatli uzaytirildi."
      );

      onSuccess();

      onClose();
    } catch (err: any) {
      console.error(
        "EXTEND LICENSE ERROR:",
        err
      );

      const message =
        err?.response?.data
          ?.message ||
        "Litsenziyani uzaytirishda xatolik yuz berdi.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarDays
                  size={20}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Litsenziyani uzaytirish
                </h2>

                <p className="mt-0.5 text-sm text-slate-400">
                  Yangi tugash sanasini tanlang
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            title="Yopish"
          >
            <X size={19} />
          </button>

        </div>

        {/* ====================================================== */}
        {/* BODY */}
        {/* ====================================================== */}

        <div className="space-y-5 px-6 py-6">

          {/* Company */}

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <Building2
                  size={18}
                />
              </div>

              <div className="min-w-0">

                <p className="text-xs text-slate-400">
                  Korxona
                </p>

                <p className="truncate font-semibold text-slate-800">
                  {companyName ||
                    "Noma'lum korxona"}
                </p>

              </div>

            </div>

          </div>

          {/* Current date */}

          <div className="rounded-xl border border-slate-200 p-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Clock3
                    size={17}
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Hozirgi tugash sanasi
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {currentExpireDate
                      ? new Date(
                          currentExpireDate
                        ).toLocaleDateString(
                          "uz-UZ",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )
                      : "Belgilanmagan"}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* New date */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Yangi tugash sanasi
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <div className="relative">

              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                min={today}
                value={expiresAt}
                onChange={(e) => {
                  setExpiresAt(
                    e.target.value
                  );
                  setError("");
                }}
                disabled={loading}
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition ${
                  error
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                } disabled:cursor-not-allowed disabled:bg-slate-50`}
              />

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Sana bugundan keyin bo'lishi kerak.
            </p>

            {error && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

          </div>

        </div>

        {/* ====================================================== */}
        {/* FOOTER */}
        {/* ====================================================== */}

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              loading ||
              !expiresAt
            }
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saqlanmoqda..."
              : "Uzaytirish"}
          </button>

        </div>

      </div>
    </div>
  );
}