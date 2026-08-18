"use client";

import {
  Pencil,
  KeyRound,
  CalendarClock,
  Trash2,
  Phone,
  MapPin,
  UserRound,
  Building2,
  CalendarDays,
  Lock,
  Unlock,
} from "lucide-react";

interface Props {
  owner: any;
  onEdit: (owner: any) => void;
  onDelete: (owner: any) => void;
  onResetPassword: (owner: any) => void;
  onExtendLicense: (owner: any) => void;

  onBlock: (owner: any) => void;
  onActivate: (owner: any) => void;
}

export default function CompanyRow({
  owner,
  onEdit,
  onDelete,
  onResetPassword,
  onExtendLicense,
  onBlock,
  onActivate,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | License sanasi
  |--------------------------------------------------------------------------
  */

  const expiresAt = owner.license?.expiresAt
    ? new Date(owner.license.expiresAt)
    : null;

  /*
  |--------------------------------------------------------------------------
  | Bugungi sana
  |--------------------------------------------------------------------------
  */

  const today = new Date();

  /*
  |--------------------------------------------------------------------------
  | Qolgan kunlar
  |--------------------------------------------------------------------------
  */

  let remainingDays: number | null = null;

  if (expiresAt) {
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const expireStart = new Date(expiresAt);
    expireStart.setHours(0, 0, 0, 0);

    const diff =
      expireStart.getTime() -
      todayStart.getTime();

    remainingDays = Math.ceil(
      diff / (1000 * 60 * 60 * 24)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | License holatlari
  |--------------------------------------------------------------------------
  */

  const isExpired =
    remainingDays !== null &&
    remainingDays < 0;

  const isExpiringSoon =
    remainingDays !== null &&
    remainingDays >= 0 &&
    remainingDays <= 7;

  const isActive =
    owner.status === "active" &&
    !isExpired;

  const isBlocked =
    owner.status === "blocked";

  /*
  |--------------------------------------------------------------------------
  | Sana format
  |--------------------------------------------------------------------------
  */

  const formattedDate = expiresAt
    ? expiresAt.toLocaleDateString(
        "uz-UZ",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      )
    : "-";

  /*
  |--------------------------------------------------------------------------
  | Status matni
  |--------------------------------------------------------------------------
  */

  let statusText = "Faol";

  if (isBlocked) {
    statusText = "Bloklangan";
  } else if (isExpired) {
    statusText = "Muddati o'tgan";
  } else if (isExpiringSoon) {
    statusText = "Tez orada tugaydi";
  }

  /*
  |--------------------------------------------------------------------------
  | Status style
  |--------------------------------------------------------------------------
  */

  let statusClass =
    "bg-emerald-50 text-emerald-700 ring-emerald-100";

  let dotClass =
    "bg-emerald-500";

  if (isBlocked || isExpired) {
    statusClass =
      "bg-red-50 text-red-700 ring-red-100";

    dotClass =
      "bg-red-500";
  } else if (isExpiringSoon) {
    statusClass =
      "bg-amber-50 text-amber-700 ring-amber-100";

    dotClass =
      "bg-amber-500";
  }

  /*
  |--------------------------------------------------------------------------
  | License icon style
  |--------------------------------------------------------------------------
  */

  let calendarClass =
    "bg-blue-50 text-blue-600";

  if (isExpired) {
    calendarClass =
      "bg-red-50 text-red-600";
  } else if (isExpiringSoon) {
    calendarClass =
      "bg-amber-50 text-amber-600";
  }

  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-slate-50/80">

      {/* ========================================================== */}
      {/* KORXONA */}
      {/* ========================================================== */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 size={19} />
          </div>

          <div className="min-w-0">

            <p className="truncate font-semibold text-slate-800">
              {owner.companyName || "-"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Korxona
            </p>

          </div>

        </div>
      </td>

      {/* ========================================================== */}
      {/* USERNAME */}
      {/* ========================================================== */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <UserRound size={15} />
          </div>

          <span className="font-medium text-slate-700">
            {owner.username || "-"}
          </span>

        </div>

      </td>

      {/* ========================================================== */}
      {/* TELEFON */}
      {/* ========================================================== */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Phone size={15} />
          </div>

          <span className="whitespace-nowrap text-sm text-slate-600">
            {owner.phone || "-"}
          </span>

        </div>

      </td>

      {/* ========================================================== */}
      {/* MANZIL */}
      {/* ========================================================== */}

      <td className="px-5 py-4">

        <div className="flex max-w-[220px] items-start gap-2">

          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <MapPin size={15} />
          </div>

          <span
            className="line-clamp-2 text-sm leading-5 text-slate-600"
            title={owner.address || ""}
          >
            {owner.address ||
              "Manzil kiritilmagan"}
          </span>

        </div>

      </td>

      {/* ========================================================== */}
      {/* MUDDAT */}
      {/* ========================================================== */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-2">

          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${calendarClass}`}
          >
            <CalendarDays size={15} />
          </div>

          <div>

            <p
              className={`whitespace-nowrap text-sm font-medium ${
                isExpired
                  ? "text-red-600"
                  : "text-slate-700"
              }`}
            >
              {formattedDate}
            </p>

            {isExpired ? (
              <p className="mt-0.5 text-xs font-medium text-red-500">
                Muddati o'tgan
              </p>
            ) : isExpiringSoon ? (
              <p className="mt-0.5 text-xs font-medium text-amber-600">
                {remainingDays === 0
                  ? "Bugun tugaydi"
                  : `${remainingDays} kun qoldi`}
              </p>
            ) : remainingDays !== null ? (
              <p className="mt-0.5 text-xs text-slate-400">
                {remainingDays} kun qoldi
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-400">
                Sana mavjud emas
              </p>
            )}

          </div>

        </div>

      </td>

      {/* ========================================================== */}
      {/* STATUS */}
      {/* ========================================================== */}

      <td className="px-5 py-4">

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusClass}`}
        >

          <span
            className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
          />

          {statusText}

        </span>

      </td>

      {/* ========================================================== */}
      {/* AMALLAR */}
      {/* ========================================================== */}

      <td className="px-5 py-4">

        <div className="flex justify-end gap-1">

          {/* Tahrirlash */}

          <button
            type="button"
            onClick={() =>
              onEdit(owner)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
            title="Tahrirlash"
          >
            <Pencil size={17} />
          </button>

          {/* Parol */}

          <button
            type="button"
            onClick={() =>
              onResetPassword(owner)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
            title="Parolni almashtirish"
          >
            <KeyRound size={17} />
          </button>

          {/* License */}

          <button
            type="button"
            onClick={() =>
              onExtendLicense(owner)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
            title="Litsenziyani uzaytirish"
          >
            <CalendarClock size={17} />
          </button>

          {/* ====================================================== */}
          {/* BLOCK / ACTIVATE */}
          {/* ====================================================== */}

          {isBlocked ? (
            <button
              type="button"
              onClick={() =>
                onActivate(owner)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
              title="Aktiv qilish"
            >
              <Unlock size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onBlock(owner)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
              title="Bloklash"
            >
              <Lock size={17} />
            </button>
          )}

          {/* Delete */}

          <button
            type="button"
            onClick={() =>
              onDelete(owner)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="O'chirish"
          >
            <Trash2 size={17} />
          </button>

        </div>

      </td>

    </tr>
  );
}