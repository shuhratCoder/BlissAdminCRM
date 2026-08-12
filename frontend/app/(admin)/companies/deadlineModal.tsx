"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { extendLicense } from "@/services/owner";

interface Props {
  open: boolean;
  ownerId: number;
  currentExpireDate?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeadlineModal({
  open,
  ownerId,
  currentExpireDate,
  onClose,
  onSuccess,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [expiresAt, setExpiresAt] = useState(today);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (currentExpireDate) {
      setExpiresAt(currentExpireDate.slice(0, 10));
    } else {
      setExpiresAt(today);
    }
  }, [open, currentExpireDate, today]);

  if (!open) return null;

  async function handleSave() {
    try {
      setLoading(true);

      await extendLicense(ownerId, {
        expiresAt,
      });

      toast.success("Litsenziya muvaffaqiyatli yangilandi.");

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Litsenziyani yangilashda xatolik yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold">
            Litsenziya muddatini o'zgartirish
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Tugash sanasi
            </label>

            <input
              type="date"
              min={today}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-2"
          >
            Bekor qilish
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}