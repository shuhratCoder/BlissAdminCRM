"use client";

import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({
  open,
  onClose,
}: Props) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="w-[420px] rounded-2xl bg-white">

        <div className="flex justify-between border-b p-5">

          <h2 className="font-semibold">
            Parolni almashtirish
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="p-6">

          <input
            type="password"
            placeholder="Yangi parol"
            className="w-full rounded-xl border p-3"
          />

        </div>

        <div className="flex justify-end gap-3 border-t p-5">

          <button
            onClick={onClose}
            className="border rounded-xl px-5 py-2"
          >
            Bekor qilish
          </button>

          <button className="rounded-xl bg-blue-600 text-white px-5 py-2">
            Saqlash
          </button>

        </div>

      </div>

    </div>
  );
}