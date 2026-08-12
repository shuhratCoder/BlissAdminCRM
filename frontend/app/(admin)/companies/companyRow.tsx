"use client";

import {
  Pencil,
  KeyRound,
  CalendarClock,
  Trash2,
} from "lucide-react";

interface Props {
  owner: any;
  onEdit: (owner: any) => void;
  onDelete: (owner: any) => void;
  onResetPassword: (owner: any) => void;
  onExtendLicense: (owner: any) => void;
}

export default function CompanyRow({
  owner,
  onEdit,
  onDelete,
  onResetPassword,
  onExtendLicense,
}: Props) {
  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="p-4 font-medium">
        {owner.companyName}
      </td>

      <td>{owner.username}</td>

      <td>{owner.phone || "-"}</td>

      <td>
        {owner.license?.expiresAt?.slice(0, 10) || "-"}
      </td>

      <td>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            owner.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {owner.status}
        </span>
      </td>

      <td>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(owner)}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="Tahrirlash"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onResetPassword(owner)}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="Parolni almashtirish"
          >
            <KeyRound size={18} />
          </button>

          <button
            onClick={() => onExtendLicense(owner)}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="Litsenziyani uzaytirish"
          >
            <CalendarClock size={18} />
          </button>

          <button
            onClick={() => onDelete(owner)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-100"
            title="O'chirish"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}