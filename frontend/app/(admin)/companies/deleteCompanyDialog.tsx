"use client";

import { deleteOwner } from "@/services/owner";
import { toast } from "sonner";
interface Props {
  open: boolean;
  owner: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCompanyDialog({
  open,
  owner,
  onClose,
  onSuccess,
}: Props) {
  if (!open || !owner) return null;

  async function handleDelete() {
    try {
      await deleteOwner(owner.id);
      toast.success("Firma o'chirildi.");
      onSuccess();
      onClose();
    } catch (err: any) {
     toast.error(
  err?.response?.data?.message ||
  "O'chirishda xatolik yuz berdi."
);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">

        <h2 className="text-xl font-bold">
          Firmani o'chirish
        </h2>

        <p className="mt-4 text-slate-600">
          <b>{owner.companyName}</b> ni
          o'chirmoqchimisiz?
        </p>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Bekor qilish
          </button>

          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-5 py-2 text-white"
          >
            O'chirish
          </button>

        </div>

      </div>
    </div>
  );
}